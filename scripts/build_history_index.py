from pathlib import Path
import json
p=Path(__file__).resolve().parents[1]/'v2';rows=[]
for c in json.load((p/'contacts.json').open()):
 for i,m in enumerate(json.load((p/'history'/f"{c['id']}.json").open())):
  rows.append({'date':m['date'],'contactId':c['id'],'index':i,'subject':m.get('subject',''),'context':m.get('context','')})
rows.sort(key=lambda r:r['date'],reverse=True)
json.dump(rows,(p/'history-index.json').open('w'),ensure_ascii=False,separators=(',',':'));print(len(rows),'indexed touchpoints')
