#!/usr/bin/env python3
"""Attach local Apple contact names to exports. Never uploads contacts."""
import argparse,json,sqlite3
from pathlib import Path

def read_contacts():
 result=[];root=Path.home()/'Library/Application Support/AddressBook';databases=sorted(root.glob('Sources/*/AddressBook-v22.abcddb'))
 if not databases:databases=list(root.glob('AddressBook-v22.abcddb'))
 for p in databases:
  c=sqlite3.connect(p.as_uri()+'?mode=ro',uri=True);c.row_factory=sqlite3.Row
  try:
   people={}
   for r in c.execute('SELECT Z_PK,ZFIRSTNAME,ZMIDDLENAME,ZLASTNAME,ZNICKNAME,ZORGANIZATION FROM ZABCDRECORD'):
    name=' '.join(str(r[k]).strip() for k in ['ZFIRSTNAME','ZMIDDLENAME','ZLASTNAME'] if r[k]) or r['ZNICKNAME'] or r['ZORGANIZATION']
    if name:people[r['Z_PK']]={'id':'apple-contact:'+p.parent.name+':'+str(r['Z_PK']),'name':name,'phones':[],'emails':[]}
   for table,field,prop in [('ZABCDPHONENUMBER','ZFULLNUMBER','phones'),('ZABCDEMAILADDRESS','ZADDRESS','emails')]:
    columns={r[1] for r in c.execute('PRAGMA table_info('+table+')')};owner='ZOWNER' if 'ZOWNER' in columns else 'Z22_OWNER'
    for r in c.execute('SELECT '+owner+','+field+' FROM '+table):
     if r[0] in people and r[1]:people[r[0]][prop].append(r[1])
   result.extend(x for x in people.values() if x['phones'] or x['emails'])
  finally:c.close()
 # Synced address books can contain identical contact copies; retain one canonical copy.
 unique={}
 for x in result:
  key=(x['name'].casefold(),tuple(sorted(x['phones'])),tuple(sorted(x['emails'])))
  unique.setdefault(key,x)
 return list(unique.values())
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('exports',nargs='+');a=p.parse_args();contacts=read_contacts()
 for path in a.exports:
  f=Path(path);data=json.loads(f.read_text());data['contacts']=contacts;f.write_text(json.dumps(data,ensure_ascii=False));print(json.dumps({'file':str(f),'contacts':len(contacts),'records':len(data['records'])}))
