#!/usr/bin/env python3
"""Search the local Apple database without a browser. Outputs one page of JSON."""
import argparse,datetime as dt,json,re,sqlite3
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--database',required=True);p.add_argument('--query',default='');p.add_argument('--channel',choices=['Apple Messages','Apple Phone']);p.add_argument('--identity');p.add_argument('--direction',choices=['incoming','outgoing']);p.add_argument('--after',help='Inclusive ISO date/time');p.add_argument('--before',help='Exclusive ISO date/time');p.add_argument('--limit',type=int,default=50);p.add_argument('--offset',type=int,default=0)
a=p.parse_args();c=sqlite3.connect(Path(a.database).resolve().as_uri()+'?mode=ro',uri=True);c.row_factory=sqlite3.Row
clauses=[];values=[];join=''
if a.query:
 tokens=re.findall(r'\w+',a.query,flags=re.UNICODE)
 if not tokens:raise SystemExit('Search needs at least one letter or number.')
 join=' JOIN search ON search.rowid=i.rowid';clauses.append('search MATCH ?');values.append(' AND '.join('"'+t+'"' for t in tokens))
for key,value in [('channel',a.channel),('identity',a.identity),('direction',a.direction)]:
 if value:clauses.append('i.'+key+'=?');values.append(value)
for op,value in [('>=',a.after),('<',a.before)]:
 if value:
  date=dt.datetime.fromisoformat(value.replace('Z','+00:00'));date=date if date.tzinfo else date.replace(tzinfo=dt.timezone.utc)
  clauses.append('i.timestamp'+op+'?');values.append(date.timestamp())
where=' WHERE '+' AND '.join(clauses) if clauses else ''
rows=c.execute('SELECT i.id,i.channel,i.identity,i.sender,i.date,i.direction,i.status,i.subject,i.body,i.thread_id FROM interactions i'+join+where+' ORDER BY i.timestamp DESC LIMIT ? OFFSET ?',values+[max(1,min(a.limit,500)),max(0,a.offset)]).fetchall()
print(json.dumps({'records':[dict(r) for r in rows],'offset':max(0,a.offset),'returned':len(rows)},ensure_ascii=False));c.close()
