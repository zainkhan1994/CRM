from pathlib import Path
import json,re,collections
P=Path(__file__).resolve().parents[1]/'v2';cs=json.load((P/'contacts.json').open());m=json.load((P/'blueprint-links.json').open());o=m['contactAssignments'];audit=json.load((P/'normalization-audit.json').open());norm=lambda s:re.sub('[^a-z0-9]','',s.lower())
known={
'p-tech':'canva.com g2.com adobe.com adobesign.com airbyte.io airtable.com activecampaign.com uipath.com coefficient.io softr.io mailsuite.com gainsight.com moz.com semrush.com rocketreach.co apollo.io lucid.co capcut.com 1se.co 1secondeveryday.com',
'p-ai':'adept.ai manus.im browse.ai homedesigns.ai pinecone.io opus.pro',
'p-shop':'24hourwristbands.com aliexpress.com all-printing.com abcsmartcookies.com',
'p-accounts-payment':'360payments.com paddle.com',
'p-learn':'credly.com ankipro.net apacademy.org fortbendisd.com goingtotdc.com',
'p-events-tulsaai':'aitinkerers.org',
'p-events':'act.house getmistified.com adderpit.com luma-mail.com greentownlabs.com',
'p-research':'applause.com utest.com userinterviews.com wilkinsresearch.com',
'p-jobs':'a1personnelinc.com bamboohr.com applicantemail.com applitrack.com applyresponse.com icims.com nelsonrecruiting.com lionbridge.com refer.io',
'p-housing':'amenify.com adamstulsa.com appfolio.us realpage.com',
'p-travel-ground':'american-parking.com',
'p-shop-food':'andopizza.com',
'p-social':'linktr.ee',
'h-fit':'fitbit.com',
'p-bills-pso':'aep.ebillservice.net',
'w-emp-rcubed':'rcubedco.com',
'w-emp-roserock':'roserockdev.com',
'p-gov-fortbend':'fortbendcountytx.gov',
'p-gov-twc':'twc.state.tx.us',
'p-ent-movies':'amctheatrestheshopsupport.com'
}
extra=[]
for c in cs:
 if c['id'] in o or any(c['domain']==r['domain'] or c['domain'].endswith('.'+r['domain']) for r in m['links']):continue
 target=None;reason=''
 for t,domains in known.items():
  if any(c['domain']==d or c['domain'].endswith('.'+d) for d in domains.split()):target=t;reason='Recognized organization/service domain: '+c['domain'];break
 if not target and c['name']=='Credly':target='p-learn';reason='Exact sender brand Credly'
 if not target and c['name'].startswith('AutoNation'):target='p-auto-autonation';reason='Exact sender brand AutoNation'
 if not target:
  words=re.findall(r"[A-Za-z]+",c['name']);local=norm(c['email'].split('@')[0]);blocked=re.compile(r'\b(team|support|service|office|school|company|admin|newsletter|events?|sales|hello|news|university|center|health|research|group|accounts|church|city|marketing|no|reply)\b',re.I)
  if 2<=len(words)<=3 and not blocked.search(c['name']) and len(words[0])>=3 and len(words[-1])>=3 and norm(words[0]) in local and norm(words[-1]) in local and any(sep in c['email'].split('@')[0] for sep in ['.','_','-']) and re.fullmatch(r"[A-Za-z]+(?:[-'][A-Za-z]+)?(?:[, ]+[A-Za-z]+(?:[-'][A-Za-z]+)?){1,2}",c['name']) and not re.search(r'\b(from|at|with|account|notification|discount|programs?|services?|verification|volunteer|confirmation|email|records|rewards|app|market|convention|houston|texas|tulsa|registration|request|employ|building|notice|integration|visuals|kreme|lobster|world)\b',c['name'],re.I):
   hist=json.load((P/'history'/f"{c['id']}.json").open())
   if any(norm(h.get('sender',''))==norm(c['name']) for h in hist):target='p-people-networking';reason='Named sender consistent with email address; general Networking only'
 if target:o[c['id']]=[target];extra.append({'contactId':c['id'],'email':c['email'],'changes':{},'sectionIds':[target],'evidence':[reason]})
audit['changes']+=extra;audit['afterAssigned']=sum(c['id'] in o or any(c['domain']==r['domain'] or c['domain'].endswith('.'+r['domain']) for r in m['links']) for c in cs);audit['remainingUnassigned']=len(cs)-audit['afterAssigned'];json.dump(m,(P/'blueprint-links.json').open('w'),ensure_ascii=False,indent=2);json.dump(audit,(P/'normalization-audit.json').open('w'),ensure_ascii=False,indent=2);print('Additional assignments:',len(extra));print({k:v for k,v in audit.items() if k!='changes'})
