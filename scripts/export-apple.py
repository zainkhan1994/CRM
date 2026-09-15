#!/usr/bin/env python3
"""Read-only Mac export. pip install pytypedstream==0.1.0. Does not upload data."""
import argparse, datetime as dt, json, sqlite3
from pathlib import Path
from typedstream import unarchive_from_data
from typedstream.types.foundation import NSString

def apple_date(value):
    value=float(value or 0)
    if value>1e12:value/=1e9
    return dt.datetime.fromtimestamp(value+978307200,dt.timezone.utc).isoformat()

def body_text(text,blob):
    if text:return text,'plain'
    if not blob:return '', 'empty'
    try:
        obj=unarchive_from_data(blob)
        for item in getattr(obj,'contents',[]):
            value=getattr(item,'value',item)
            if isinstance(value,NSString):return value.value,'decoded'
    except Exception:pass
    return '', 'unavailable'

def db(path):
    c=sqlite3.connect(Path(path).expanduser().resolve().as_uri()+'?mode=ro',uri=True)
    c.row_factory=sqlite3.Row
    c.execute('BEGIN')
    return c

def export(output,limit):
    exported=dt.datetime.now(dt.timezone.utc).isoformat();records=[];sources={};decode_failures=0
    c=db('~/Library/Messages/chat.db')
    eligible='m.date>0 AND COALESCE(m.is_system_message,0)=0 AND COALESCE(m.is_service_message,0)=0 AND COALESCE(m.date_retracted,0)=0 AND NOT EXISTS (SELECT 1 FROM chat_recoverable_message_join r WHERE r.message_id=m.ROWID)'
    count=c.execute('SELECT count(*) FROM message m WHERE '+eligible).fetchone()[0]
    members={}
    for row in c.execute('SELECT j.chat_id,h.id FROM chat_handle_join j JOIN handle h ON h.ROWID=j.handle_id'):members.setdefault(row[0],[]).append(row[1])
    query='''SELECT m.*,h.id AS address, ch.ROWID AS chat_id,ch.display_name AS chat_name,ch.guid AS chat_guid FROM message m LEFT JOIN handle h ON h.ROWID=m.handle_id LEFT JOIN chat ch ON ch.ROWID=(SELECT MIN(chat_id) FROM chat_message_join WHERE message_id=m.ROWID) WHERE '''+eligible+' ORDER BY m.date DESC LIMIT ?'
    for r in c.execute(query,(limit if limit else -1,)):
        text,state=body_text(r['text'],r['attributedBody']);decode_failures+=state=='unavailable'
        outgoing=bool(r['is_from_me']);peers=members.get(r['chat_id'],[]);address=r['address'] or (peers[0] if len(peers)==1 else '')
        reaction=bool(r['associated_message_type'])
        kind='Reaction / message update' if reaction else ('Attachment' if r['cache_has_attachments'] and not text else 'Message')
        records.append(dict(id='apple-message:'+r['guid'],channel='Apple Messages',sender=r['chat_name'] or address or 'Group conversation',address=address,participants=peers,threadId=r['chat_guid'],date=apple_date(r['date']),direction='outgoing' if outgoing else 'incoming',status=('Sent' if r['is_sent'] else 'Outgoing') if outgoing else ('Read' if r['is_read'] else 'Unread'),unread=not outgoing and not bool(r['is_read']),subject=r['subject'] or kind,preview=text or ('Message text unavailable in export' if state=='unavailable' else kind),hasAttachment=bool(r['cache_has_attachments']),textState=state,service=r['service']))
    sources['Apple Messages']=dict(available=count,imported=len(records),textUnavailable=decode_failures,latest=records[0]['date'] if records else None)
    c.close();c=db('~/Library/Application Support/CallHistoryDB/CallHistory.storedata');n=0
    for r in c.execute('SELECT * FROM ZCALLRECORD WHERE ZDATE>0 ORDER BY ZDATE DESC'):
        outgoing=bool(r['ZORIGINATED']);answered=bool(r['ZANSWERED']);duration=max(0,float(r['ZDURATION'] or 0));status='Outgoing' if outgoing else ('Answered' if answered else 'Missed');address=r['ZADDRESS'] or ''
        records.append(dict(id='apple-call:'+str(r['ZUNIQUE_ID'] or r['Z_PK']),channel='Apple Phone',sender=r['ZNAME'] or address or 'Unknown caller',address=address,date=apple_date(r['ZDATE']),direction='outgoing' if outgoing else 'incoming',status=status,unread=False,subject=status+' call',preview=f'{status} call · {int(duration)//60}m {int(duration)%60}s',durationSeconds=duration,service=r['ZSERVICE_PROVIDER'] or 'Call history',hasAttachment=False));n+=1
    sources['Apple Phone']=dict(available=n,imported=n,latest=next((r['date'] for r in records if r['channel']=='Apple Phone'),None));c.close()
    records.sort(key=lambda r:r['date'],reverse=True)
    result=dict(format='organize-me-apple-v1',exportedAt=exported,sources=sources,records=records)
    Path(output).parent.mkdir(parents=True,exist_ok=True);Path(output).write_text(json.dumps(result,ensure_ascii=False))
    print(json.dumps(dict(exportedAt=exported,sources=sources,output=str(output))))
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',required=True);p.add_argument('--limit',type=int,default=5000,help='Recent message limit; 0 exports all. All calls are exported.');a=p.parse_args();export(a.output,a.limit)
