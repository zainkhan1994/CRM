from pathlib import Path
import json,re,collections
P=Path(__file__).resolve().parents[1]/'v2';nodes=json.load((P/'blueprint.json').open());byid={n['id']:n for n in nodes};m=json.load((P/'blueprint-links.json').open());cs=json.load((P/'contacts.json').open());norm=lambda s:re.sub('[^a-z0-9]','',s.lower());aliases=dict(m.get('sectionAliases',{}));audit=[]
preferred=['w-tools-github','w-tools-asana','w-tools-miro','w-tools-slack','p-tech-google','p-tech-microsoft','p-events-eventbrite','h-portal-mychart','h-portal-healow','p-ins-primerica','p-ins-prog','p-ins-nyl','h-blood-gulfcoast','w-emp-census','p-gov-nasa','p-shop-usps','p-ai']
# Email-provider folders contain unrelated individuals. Never merge those into the provider company.
exclude={'gmail','yahoo','outlookhotmail'}
groups=collections.defaultdict(list)
for n in nodes:groups[norm(n['name'])].append(n)
for key,rows in groups.items():
 if len(rows)<2 or key in exclude:continue
 target=next((id for id in preferred if id in {n['id'] for n in rows}),rows[0]['id'])
 for n in rows:
  if n['id']!=target:aliases[n['id']]=target
# Explicit family branches already identified as parent/child in the user's hierarchy.
for source,target in {'h-prov-asc-stjohn':'h-prov-ascension','h-prov-asc-ok':'h-prov-ascension','h-prov-asc-health':'h-prov-ascension','h-prov-hillcrest-med':'h-prov-hillcrest','p-auto-sf':'p-ins-sf','h-ins-sf':'p-ins-sf'}.items():
 if source in byid and target in byid:aliases[source]=target
# Fold remaining same-brand children only when the parent name is the complete leading brand.
for n in nodes:
 parent=byid.get(n.get('parentId'))
 if parent and len(parent['name'].split())>=2 and n['name'].lower().startswith(parent['name'].lower()+' ') and parent['id'] not in {'p-people','p-events','p-tech','p-learn'}:aliases[n['id']]=parent['id']
def canon(id):
 seen=set()
 while id in aliases:
  assert id not in seen;seen.add(id);id=aliases[id]
 return id
aliases={k:canon(v) for k,v in aliases.items()}
for n in nodes:
 if n['id'] in aliases:audit.append({'removedId':n['id'],'name':n['name'],'canonicalId':aliases[n['id']]})
new=[]
for n in nodes:
 if n['id'] in aliases:continue
 n['parentId']=canon(n.get('parentId'));n['aliases']=list(dict.fromkeys(n.get('aliases',[])+[x['name'] for x in audit if x['canonicalId']==n['id']]))
 new.append(n)
newmap={n['id']:n for n in new};assert all(not n.get('parentId') or n['parentId'] in newmap for n in new)
for n in new:
 path=[];cur=n;seen=set()
 while cur:
  assert cur['id'] not in seen;seen.add(cur['id']);path.insert(0,cur['name']);cur=newmap.get(cur.get('parentId'))
 n['hierarchyPath']=' > '.join(path)
for rule in m['links']:rule['sectionId']=canon(rule['sectionId'])
m['links']=list({(r['domain'],r['sectionId']):r for r in m['links']}.values())
for key,ids in m.get('contactAssignments',{}).items():m['contactAssignments'][key]=list(dict.fromkeys(canon(i) for i in ids))
m['sectionAliases']=aliases
parents={n.get('parentId') for n in new};notorg={'p-people-gmail','p-people-yahoo','p-people-hotmail','p-people-aol','p-people-icloud','p-people-other','p-people-personal','p-people-networking','p-daily-gmail','p-daily-yahoo','p-daily-outlook'}
changed=0
for c in cs:
 targets=m.get('contactAssignments',{}).get(c['id'])
 if targets is None:
  hits=[r for r in m['links'] if c['domain']==r['domain'] or c['domain'].endswith('.'+r['domain'])];longest=max((len(r['domain']) for r in hits),default=0);targets=list({r['sectionId'] for r in hits if len(r['domain'])==longest})
 orgs=[t for t in targets if t not in parents and t not in notorg and t in newmap]
 if len(orgs)==1:
  node=newmap[orgs[0]];c.setdefault('originalCompany',c.get('company',''));c['organizationId']=node['id'];c['organizationName']=node['name'];c['company']=node['name'];changed+=1
  # Preserve sender names, original domains, email addresses, and message history.
json.dump(new,(P/'blueprint.json').open('w'),ensure_ascii=False,indent=2);json.dump(m,(P/'blueprint-links.json').open('w'),ensure_ascii=False,indent=2);json.dump(cs,(P/'contacts.json').open('w'),ensure_ascii=False,indent=2);json.dump({'mergedSections':audit,'organizationContacts':changed},(P/'organization-consolidation-audit.json').open('w'),ensure_ascii=False,indent=2)
print('Merged sections',len(audit),'Remaining',len(new),'Organization contacts',changed)
