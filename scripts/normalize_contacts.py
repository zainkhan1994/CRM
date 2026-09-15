"""Normalize saved CRM data and propose evidence-based assignments; never fetch email."""
from pathlib import Path
import json,re,html,collections
P=Path(__file__).resolve().parents[1]/'v2'
cs=json.load((P/'contacts.json').open());nodes=json.load((P/'blueprint.json').open());mapping=json.load((P/'blueprint-links.json').open());rules=mapping['links'];byid={n['id']:n for n in nodes};parents={n.get('parentId') for n in nodes};leaves=[n for n in nodes if n['id'] not in parents];overrides=mapping.setdefault('contactAssignments',{});audit=[]
norm=lambda s:re.sub(r'[^a-z0-9]','',s.lower())
def clean(s):return re.sub(r'\s+',' ',html.unescape(str(s or ''))).strip().strip('"')
def current(c):
 if c['id'] in overrides:return overrides[c['id']]
 matches=[r for r in rules if c['domain']==r['domain'] or c['domain'].endswith('.'+r['domain'])]
 longest=max([len(r['domain']) for r in matches],default=0)
 return list(dict.fromkeys(r['sectionId'] for r in matches if len(r['domain'])==longest))
before=sum(bool(current(c)) for c in cs)
free={'gmail.com':'p-people-gmail','yahoo.com':'p-people-yahoo','hotmail.com':'p-people-hotmail','outlook.com':'p-people-hotmail','aol.com':'p-people-aol','icloud.com':'p-people-icloud'}
# Precise service/category terms; matching subjects requires repeated evidence.
patterns=[('p-jobs',r'\b(recruit(?:er|ing|ment)?|careers?|job application|job opportunities|job alert|interview invitation|payroll|hiring)\b'),('p-research',r'\b(user testing|paid research|research study|focus group|research participant|user interviews)\b'),('p-learn',r'\b(university|college|school|certificates?|certification|course enrollment|academy|student|curriculum)\b'),('h-providers',r'\b(dentistry|dental|dermatology|clinic|physician|patient portal)\b'),('h-fit',r'\b(fitness|gym|workout|yoga)\b'),('p-housing',r'\b(apartments?|leasing|property management|rent payment|tenant portal)\b'),('p-events',r'\b(event registration|event confirmation|rsvp|conference|hackathon|meetup|event reminder)\b'),('p-tech',r'\b(developer|cloud hosting|api key|deployment|software|web hosting)\b'),('p-shop',r'\b(order confirmation|shipping confirmation|your order|order shipped|tracking number)\b'),('p-news',r'\b(newsletter|daily digest|weekly digest|unsubscribe)\b'),('p-travel',r'\b(airlines?|flight itinerary|hotel reservation|booking confirmation)\b'),('p-nonprofit',r'\b(donation receipt|charitable|fundrais(?:er|ing))\b')]
patterns=[(i,re.compile(p,re.I)) for i,p in patterns]
# Names shared by multiple hierarchy leaves are resolved only when their parent family is unambiguous.
leafnames=collections.defaultdict(list)
for n in leaves:
 for alias in re.split(r'\s*/\s*',n['name']):
  key=norm(alias)
  if len(key)>=5:leafnames[key].append(n['id'])
for c in cs:
 original={k:c.get(k,'') for k in ['name','company','email','domain','phone']};c['email']=clean(c['email']).lower();c['domain']=c['email'].rsplit('@',1)[-1];c['name']=clean(c['name']);c['company']=clean(c.get('company'));c['phone']=clean(c.get('phone'))
 history=json.load((P/'history'/f"{c['id']}.json").open());targets=current(c);evidence=[]
 # Prefer actual exported sender display names over malformed wrappers, never infer a person's name from their email.
 generic=lambda s:not s or '@' in s or bool(re.fullmatch(r'(no[ -]?reply|do[ -]?not[ -]?reply|notifications?|info|hello|support|team|noreply.*)',s,re.I))
 candidates=collections.Counter(clean(m.get('sender')) for m in history if not generic(clean(m.get('sender'))))
 if generic(c['name']) and candidates:
  best=candidates.most_common(1)[0][0]
  if '<' not in best and len(best)<100:c['name']=best
 c['name']=re.sub(r'\s*<[^<>]+@[^<>]+>\s*$','',c['name']).strip() or c['email']
 if not targets:
  keys={norm(c['name']),norm(c['company']),norm((c.get('blueprintPath')or[''])[-1])}
  # Compare whole domain components, not arbitrary substrings (prevents unrelated brand collisions).
  keys.update(norm(part) for part in c['domain'].split('.')[:-1] if len(part)>=5)
  hits=set(i for k in keys for i in leafnames.get(k,[]))
  if len(hits)==1:targets=list(hits);evidence=['Exact sender/company or domain-component brand match']
  elif c['domain'] in free:targets=[free[c['domain']]];evidence=['Email provider only; no personal relationship inferred']
  elif c['domain'].endswith('.edu'):targets=['p-learn'];evidence=['Educational .edu sender domain']
  else:
   meta=' '.join([c['name'],c['company'],c['domain'].replace('.',' ').replace('-',' '),str(c.get('crmProperties',{}))]);subjects=[m.get('subject','') for m in history]
   scored=[]
   for id,pattern in patterns:
    match=pattern.search(meta);count=sum(bool(pattern.search(subject)) for subject in subjects)
    score=4 if match else (2 if count>=2 and count/len(subjects)>=.5 else 0)
    if score:scored.append((score,id,match.group() if match else f'{count}/{len(subjects)} subject lines'))
   scored.sort(reverse=True)
   if scored and (len(scored)==1 or scored[0][0]>scored[1][0]):targets=[scored[0][1]];evidence=['Category evidence: '+scored[0][2]]
  if targets:overrides[c['id']]=targets
 # Canonical company only when the actual name/domain matches a specific brand leaf.
 brand=[byid[t] for t in targets if t in byid and t not in parents and norm(byid[t]['name']) in {norm(c['company']),norm(c['name']),*(norm(x) for x in c['domain'].split('.'))}]
 if len(brand)==1:c['company']=brand[0]['name'];c['logo']=brand[0].get('logo',c.get('logo',''))
 changes={k:{'from':original[k],'to':c[k]} for k in original if original[k]!=c[k]}
 if changes:c.setdefault('originalContact',original)
 if changes or evidence:audit.append({'contactId':c['id'],'email':c['email'],'changes':changes,'sectionIds':targets,'evidence':evidence})
 assert c['id'] and '@' in c['email']
assert len({c['id'] for c in cs})==len(cs)
assert all(i in byid for ids in overrides.values() for i in ids)
after=sum(bool(current(c)) for c in cs)
json.dump(cs,(P/'contacts.json').open('w'),ensure_ascii=False,separators=(',',':'));json.dump(mapping,(P/'blueprint-links.json').open('w'),ensure_ascii=False,indent=2)
json.dump({'beforeAssigned':before,'afterAssigned':after,'remainingUnassigned':len(cs)-after,'normalizedContacts':sum(bool(a['changes']) for a in audit),'changes':audit},(P/'normalization-audit.json').open('w'),ensure_ascii=False,indent=2)
print(json.dumps({'beforeAssigned':before,'afterAssigned':after,'remainingUnassigned':len(cs)-after,'normalizedContacts':sum(bool(a['changes']) for a in audit)}))
