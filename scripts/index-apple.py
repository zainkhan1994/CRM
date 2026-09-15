#!/usr/bin/env python3
"""Build a local, searchable SQLite index from an Apple export. No network access."""
import argparse,datetime as dt,json,os,re,sqlite3
from pathlib import Path

def identity(value):
    value=str(value or '').strip()
    if '@' in value:return value.lower()
    if re.fullmatch(r'[+\d\s().-]+',value):
        n=re.sub(r'\D','',value)
        return '1'+n if len(n)==10 and n[0] in '23456789' else n
    return value

def build(source,target,contacts_path=None):
    data=json.loads(Path(source).read_text());assert data['format']=='organize-me-apple-v1'
    candidates={}
    contact_rows=data.get('contacts',[])+(json.loads(Path(contacts_path).read_text()) if contacts_path else [])
    for contact in contact_rows:
        for value in [contact.get('email'),contact.get('phone'),*contact.get('emails',[]),*contact.get('phones',[])]:
            k=identity(value);name=contact.get('name','')
            if k and name:candidates.setdefault(k,set()).add(name)
    names={k:next(iter(v)) for k,v in candidates.items() if len(v)==1}
    target=Path(target);target.parent.mkdir(parents=True,exist_ok=True);tmp=target.with_suffix('.building.sqlite');tmp.unlink(missing_ok=True)
    c=sqlite3.connect(tmp)
    c.executescript('''
    CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
    CREATE TABLE interactions(id TEXT PRIMARY KEY,channel TEXT NOT NULL,identity TEXT NOT NULL,sender TEXT,date TEXT NOT NULL,timestamp REAL NOT NULL,direction TEXT,status TEXT,subject TEXT,body TEXT,thread_id TEXT,raw_json TEXT NOT NULL);
    CREATE INDEX interactions_date ON interactions(timestamp DESC);
    CREATE INDEX interactions_channel_date ON interactions(channel,timestamp DESC);
    CREATE INDEX interactions_identity_date ON interactions(identity,timestamp DESC);
    CREATE INDEX interactions_thread_date ON interactions(thread_id,timestamp);
    CREATE VIRTUAL TABLE search USING fts5(sender,subject,body,identity,content='interactions',content_rowid='rowid',tokenize='unicode61');
    ''')
    c.execute('BEGIN')
    for r in data['records']:
        k=identity(r.get('address')) or str(r.get('threadId') or r['id']);sender=names.get(k) if len(r.get('participants',[]))<=1 else None
        c.execute('INSERT INTO interactions VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',(r['id'],r['channel'],k,sender or r.get('sender',''),r['date'],dt.datetime.fromisoformat(r['date'].replace('Z','+00:00')).timestamp(),r.get('direction'),r.get('status'),r.get('subject',''),r.get('preview',''),r.get('threadId'),json.dumps(r,ensure_ascii=False)))
    for k,v in [('sources',data['sources']),('exportedAt',data['exportedAt']),('format',data['format'])]:c.execute('INSERT INTO metadata VALUES (?,?)',(k,json.dumps(v)))
    c.execute("INSERT INTO search(search) VALUES ('rebuild')");c.commit()
    assert c.execute('SELECT count(*) FROM interactions').fetchone()[0]==len(data['records'])
    assert c.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
    counts=c.execute('SELECT channel,count(*),min(date),max(date) FROM interactions GROUP BY channel').fetchall();c.close();os.chmod(tmp,0o600);os.replace(tmp,target)
    print(json.dumps({'database':str(target),'counts':counts,'bytes':target.stat().st_size}))
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('export');p.add_argument('--database',required=True);p.add_argument('--contacts');a=p.parse_args();build(a.export,a.database,a.contacts)
