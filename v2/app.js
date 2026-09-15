const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={person:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="3" fill="currentColor"/><path d="M6 19v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" fill="currentColor"/>',company:'<path d="M3 21V7l6 3V3l6 3v6l6-3v12H3M9 10v11M15 12v9M11 7l2 1M11 10l2 1M5 11l2 1M5 14l2 1M5 17l2 1M17 14l2-1M17 17l2-1"/>',phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/>',email:'<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M7 2v6M17 2v6M7 14h1m3 0h1m3 0h1M7 17h1m3 0h1m3 0h1"/>',tag:'<path d="M5 8l4-6h6l4 6v14H5z"/><circle cx="12" cy="6" r="1"/>',logo:'<circle cx="12" cy="12" r="9"/><path d="M6 14V9m0 5h3m2-4v4h3v-4zm5 0v4h2"/>',history:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',network:'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M5 7v4h14V7M12 11v6"/>',layers:'<path d="M3 7l9-5 9 5-9 5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',search:'<circle cx="10" cy="10" r="7"/><path d="M15 15l6 6"/>',cards:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M2 7v12M9 8h7M9 12h7M9 16h4"/>',notes:'<path d="M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4z"/>',folder:'<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"/>',banking:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/>',bills:'<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',shopping:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',travel:'<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>',events:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',community:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',meetings:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',education:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',tech:'<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',cloud:'<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',ai:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',research:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',entertainment:'<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>',civic:'<line x1="2" y1="22" x2="22" y2="22"/><line x1="12" y1="2" x2="2" y2="7"/><line x1="12" y1="2" x2="22" y2="7"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/>',daily:'<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',news:'<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',jobs:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',housing:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',auto:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11 2 11.5 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',nonprofit:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',insurance:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',health:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',work:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',projects:'<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',coworking:'<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/>',talent:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'};
const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[n]||paths.person}</svg>`;
const groupBy=(items,key)=>items.reduce((groups,item)=>{const k=key(item);(groups[k]??=[]).push(item);return groups},Object.create(null));
const initials=n=>String(n).split(/\s+/).map(s=>s[0]).slice(0,2).join('').toUpperCase();
let contacts=[],companies=[],view=new URLSearchParams(location.search).get('tab')==='inbox'?'inbox':'people',layout='cards',page=0,search='',label='',sort='name'; const size=24;
const names={people:'Contacts',companies:'Companies',history:'Touchpoints',network:'Network',inbox:'Inbox'};
let domainLogos={};
fetch('domain-logos.json',{cache:'no-store'}).then(r=>r.json()).then(d=>{domainLogos=d;}).catch(()=>{});

function resolveBrandLogo(c, fallbackLogo = null) {
  if (c && c.logo) return c.logo;
  const comp = (c?.company || '').toLowerCase().trim();
  const dom = (c?.domain || '').toLowerCase().trim();
  const name = (c?.name || '').toLowerCase().trim();
  const text = `${comp} ${dom} ${name}`;

  if (text.includes('rose rock') || dom.includes('roserock')) return 'logos/rose-rock-development.png';
  if (text.includes('minaret') || dom.includes('minaret')) return 'logos/minaret-foundation.png';
  if (text.includes('ashford') || dom.includes('ashford')) return 'logos/ashford-communities.png';
  if (text.includes('trulo') || dom.includes('trulo')) return 'logos/trulo-homes.png';
  if (text.includes('r-cubed') || text.includes('rcubed') || dom.includes('rcubed')) return 'logos/r-cubed.png';
  if (text.includes('isgh') || dom.includes('isgh')) return 'logos/isgh.png';
  if (text.includes('maryam') || dom.includes('maryam')) return 'logos/maryam-islamic-center.png';

  if (dom && typeof domainLogos !== 'undefined' && domainLogos[dom]) return domainLogos[dom];
  if (dom && typeof domainLogos !== 'undefined') {
    const parts = dom.split('.');
    if (parts.length > 2) {
      const root = parts.slice(-2).join('.');
      if (domainLogos[root]) return domainLogos[root];
    }
  }

  if (text.includes('indeed')) return 'logos/indeed.png';
  if (text.includes('kilocode') || text.includes('kilo code')) return 'logos/kilocode.png';
  if (text.includes('docker')) return 'logos/docker.svg';
  if (text.includes('digitalocean')) return 'logos/digitalocean.png';
  if (text.includes('cair')) return 'logos/cair.png';
  if (text.includes('nasa') || dom.includes('nasa.gov') || dom.includes('spaceapps') || dom.includes('ussfa')) return 'logos/nasa.png';
  if (text.includes('skool') || text.includes('chatgpt') || text.includes('openai')) return 'logos/ai-knowledge-tools--chatgpt.png';
  if (text.includes('gdg') || dom.includes('gdg.')) return 'logos/gdg-tulsa.png';
  if (text.includes('google') || dom.includes('google.com')) return 'logos/google.svg';
  if (text.includes('stripe')) return 'logos/stripe.svg';
  if (text.includes('slack')) return 'logos/slack.png';
  if (text.includes('github')) return 'logos/brand-github.svg';
  if (text.includes('notion')) return 'logos/notion.png';
  if (text.includes('asana')) return 'logos/asana.png';
  if (text.includes('miro')) return 'logos/miro.png';
  if (text.includes('hubspot')) return 'logos/hubspot.svg';
  if (text.includes('zapier')) return 'logos/zapier.svg';
  if (text.includes('make.com') || dom.includes('make.com')) return 'logos/make.png';
  if (text.includes('loom')) return 'logos/loom.svg';
  if (text.includes('ifttt')) return 'logos/ifttt.svg';
  if (text.includes('gusto')) return 'logos/gusto.svg';
  if (text.includes('salesforce')) return 'logos/salesforce.svg';
  if (text.includes('clickup')) return 'logos/clickup.svg';
  if (text.includes('neo4j')) return 'logos/neo4j.png';
  if (text.includes('gitwit') || dom.includes('gitwit')) return 'logos/gitwit.png';
  if (text.includes('tulsa remote') || dom.includes('tulsaremote')) return 'logos/tulsa-remote.png';
  if (text.includes('gradient')) return 'logos/gradient.png';
  if (text.includes('techlahoma')) return 'logos/techlahoma.png';
  if (text.includes('tinkerer') || text.includes('aitinkerers')) return 'logos/ai-tinkerers.png';
  if (text.includes('canva')) return 'logos/canva.svg';
  if (text.includes('adobe')) return 'logos/adobe.svg';
  if (text.includes('oracle')) return 'logos/oracle.svg';
  if (text.includes('semrush')) return 'logos/semrush.svg';
  if (text.includes('reddit')) return 'logos/reddit.svg';
  if (text.includes('discord')) return 'logos/discord.svg';
  if (text.includes('zoom')) return 'logos/zoom.svg';
  if (text.includes('grammarly')) return 'logos/grammarly.svg';
  if (text.includes('coursera')) return 'logos/coursera.svg';
  if (text.includes('udemy')) return 'logos/udemy.svg';
  if (text.includes('khan academy') || dom.includes('khanacademy')) return 'logos/khanacademy.svg';
  if (text.includes('duolingo')) return 'logos/duolingo.svg';
  if (text.includes('atlassian') || text.includes('jira')) return 'logos/jira.svg';
  if (text.includes('trello')) return 'logos/trello.svg';
  if (text.includes('postman')) return 'logos/postman.svg';
  if (text.includes('supabase')) return 'logos/supabase.svg';
  if (text.includes('vercel')) return 'logos/vercel.svg';
  if (text.includes('netlify')) return 'logos/netlify.svg';
  if (text.includes('cloudflare')) return 'logos/cloudflare.svg';
  if (text.includes('gitlab')) return 'logos/gitlab.svg';
  if (text.includes('mailchimp')) return 'logos/mailchimp.svg';
  if (text.includes('linear')) return 'logos/linear.svg';
  if (text.includes('airtable')) return 'logos/airtable.svg';
  if (text.includes('webflow')) return 'logos/webflow.svg';
  if (text.includes('figma')) return 'logos/figma.svg';
  if (text.includes('substack')) return 'logos/substack.svg';
  if (text.includes('medium')) return 'logos/medium.svg';
  if (text.includes('patreon')) return 'logos/patreon.svg';
  if (text.includes('kickstarter')) return 'logos/kickstarter.svg';
  if (text.includes('gofundme')) return 'logos/gofundme.svg';
  if (text.includes('meetup')) return 'logos/meetup.svg';
  if (text.includes('luma')) return 'logos/luma.svg';
  if (text.includes('eventbrite')) return 'logos/eventbrite.svg';
  if (text.includes('amazon') || dom.includes('amazon')) return 'logos/shopping--amazon.png';
  if (text.includes('apple') || dom.includes('apple')) return 'logos/apple-store.png';
  if (text.includes('uber') || dom.includes('uber')) return 'logos/uber.png';
  if (text.includes('walmart')) return 'logos/walmart.png';
  if (text.includes('fedex')) return 'logos/shipping-tracking--fedex.png';
  if (text.includes('bank of america') || text.includes('bofa')) return 'logos/bank-of-america.svg';
  if (text.includes('chase')) return 'logos/chase.png';
  if (text.includes('wells fargo')) return 'logos/wells-fargo.png';
  if (text.includes('american express') || text.includes('amex')) return 'logos/american-express.svg';
  if (text.includes('credit one')) return 'logos/accounts-banking--credit-one.png';
  if (text.includes('life time') || text.includes('lifetime')) return 'logos/lifetime.png';
  if (text.includes('best buy') || text.includes('bestbuy')) return 'logos/best-buy.png';
  if (text.includes('lowe') || text.includes('lowes')) return 'logos/lowes.png';
  if (text.includes('home depot') || text.includes('homedepot')) return 'logos/home-depot.png';
  if (text.includes('paypal')) return 'logos/paypal.png';
  if (text.includes('venmo')) return 'logos/venmo.png';
  if (text.includes('claude') || text.includes('anthropic')) return 'logos/claude.png';
  if (text.includes('perplexity')) return 'logos/perplexity.png';
  if (text.includes('rewind')) return 'logos/ai-knowledge-tools--rewind.png';
  if (text.includes('obsidian')) return 'logos/obsidian.png';
  if (text.includes('act house') || text.includes('act.house')) return 'logos/acthouse.png';

  if (typeof blueprintRows !== 'undefined' && Array.isArray(blueprintRows)) {
    const matchedNode = blueprintRows.find(n => {
      if (!n.logo) return false;
      const nName = n.name.toLowerCase().replace(/_/g, ' ');
      return (comp && (nName === comp || comp.includes(nName))) ||
             (dom && (dom.includes(n.id) || nName.includes(dom.split('.')[0])));
    });
    if (matchedNode) return matchedNode.logo;
  }
  return fallbackLogo || null;
}

$('#brand-icon').innerHTML=icon('layers');$('#search-icon').innerHTML=icon('search');$('#nav').innerHTML=[['people','person','People'],['companies','company','Companies'],['history','history','History'],['network','network','Network'],['inbox','email','Inbox']].map(([v,i,t])=>`<button data-go="${v}" class="${v===view?'active':''}" aria-label="${t}">${icon(i)}<span>${t}</span></button>`).join('');
function filtered(){const source=view==='companies'?companies:contacts;return source.filter(c=>(!search||[c.name,c.company,c.email,c.domain].join(' ').toLowerCase().includes(search))&&(!label||(c.labels||[c.label]).includes(label))).sort((a,b)=>sort==='recent'?b.date.localeCompare(a.date):a.name.localeCompare(b.name));}
function field(i,title,value){return `<div class="field"><span class="icon-tile">${icon(i)}</span><div class="field-body"><b>${title}</b><span class="value">${value||'Not added'}</span></div></div>`;}
function card(c,full=false){const l=c.logo||resolveBrandLogo(c);return `<div class="identity-head"><span class="identity-symbol">${l?`<img class="brand-logo" src="${esc(l)}" alt="${esc(c.company||c.name)} logo">`:icon(c.members?'company':'person')}</span><div><h2 ${full?'id="profile-name"':''}>${esc(c.name)}</h2>${c.members?'':`<p>${esc(c.company)}</p>`}</div></div>${field('phone','Phone number',esc(c.phone))}${field('email','Email',esc(c.email))}${field('calendar','Date contacted',esc(c.date))}${field('tag','Label',c.label?`<span class="tag">${esc(c.label)}</span>`:'Unlabelled')}${field('logo','Logo',l?`<img class="field-logo" src="${esc(l)}" alt="${esc(c.company||c.name)} logo">`:'Not added')}`;}
function render(){document.body.classList.toggle('inbox-active',view==='inbox');document.body.classList.toggle('history-active',view==='history');$('#search').placeholder=view==='history'?'Search people, dates, companies, notes…':'Search people, companies, email…';$('#search').setAttribute('aria-label',view==='history'?'Search people, dates, companies, notes':'Search people, companies or email');$('.eyebrow').textContent=view==='inbox'?'Workspace / communications':'Workspace / personal CRM';document.querySelectorAll('[data-go]').forEach(b=>{if(b.closest('nav')){b.classList.toggle('active',b.dataset.go===view);b.setAttribute('aria-current',b.dataset.go===view?'page':'false')}});$('#title').textContent=names[view];document.querySelectorAll('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===layout)));$('#view-options').hidden=['network','history'].includes(view);if(view==='inbox'){$('#content').innerHTML='<iframe sandbox="allow-scripts" class="inbox-frame" title="Canva Inbox — demo communications" src="inbox.html?v=logos5"></iframe>';$('#pagination').innerHTML='';$('#result-count').textContent='';$('#view-options').hidden=true;return;}let list=filtered(),slice=list.slice(page*size,(page+1)*size);$('#result-count').textContent=`${list.length.toLocaleString()} ${view==='companies'?'companies':'contacts'}`;
 if(view==='network'){renderNetwork(list);$('#pagination').innerHTML='';return;}if(view==='history'){renderHistory(list);$('#pagination').innerHTML='';return;}
 if(!slice.length)$('#content').innerHTML='<p class="empty">No contacts match your search.</p>';
 else if(layout==='cards')$('#content').innerHTML=`<div class="cards">${slice.map(c=>`<article class="identity-card">${card(c)}<div class="card-action"><button data-open="${esc(c.id)}">More info →</button></div></article>`).join('')}</div>`;
 else {
  const col1=view==='companies'?'Company':'Person';
  const col2=view==='companies'?'Contacts':'Company';
  $('#content').innerHTML=`<div class="table-wrap"><table><thead><tr>${[col1,col2,'Phone number','Email','Last contacted','Label',''].map(t=>`<th scope="col">${t}</th>`).join('')}</tr></thead><tbody>${slice.map(c=>{
    const l=c.logo||resolveBrandLogo(c);
    const avatar=l?`<img src="${esc(l)}" alt="" onerror="this.parentElement.textContent='${esc(initials(c.name))}'">`:esc(initials(c.name));
    const sub=view==='companies'?`${(c.members||[]).length} ${(c.members||[]).length===1?'contact':'contacts'}`:esc(c.company);
    return `<tr><td><button class="person-link" data-open="${esc(c.id)}"><span class="mini-avatar">${avatar}</span>${esc(c.name)}</button></td><td>${sub}</td><td class="muted">${esc(c.phone||'—')}</td><td class="muted">${esc(c.email)}</td><td>${esc(c.date)}</td><td>${c.label?`<span class="tag">${esc(c.label)}</span>`:'—'}</td><td><button class="more" data-open="${esc(c.id)}">More info</button></td></tr>`;
  }).join('')}</tbody></table></div>`;
 }
 const pages=Math.ceil(list.length/size);$('#pagination').innerHTML=pages>1?`<button data-page="-1" ${page===0?'disabled':''}>Previous</button><span>${page+1} / ${pages}</span><button data-page="1" ${page+1>=pages?'disabled':''}>Next</button>`:'';
}
function message(m){return `<details class="message"><summary>${esc(m.subject||'(No subject)')}<time>${esc(m.date)}</time></summary><div class="message-body"><small>Saved spreadsheet snippet</small><p>${esc(m.snippet)}</p><small>${esc(m.status||'')} · ${esc(m.context||'')} · ${m.copies||1} source row(s)</small></div></details>`;}
async function historyFor(c){if(c.members){return (await Promise.all(c.members.map(historyFor))).flat().sort((a,b)=>b.date.localeCompare(a.date));}const r=await fetch(`history/${c.id}.json`);if(!r.ok)throw Error('History unavailable');return r.json();}
let openToken=0;
function renderNetwork(list){const groups=groupBy(list,c=>c.domain);$('#content').innerHTML=`<div class="network"><h2>Network</h2><p class="muted">People and companies, connected by domain.</p>${Object.entries(groups).sort(([a],[b])=>a.localeCompare(b)).map(([d,cs])=>`<details><summary>${esc(d)} <small>${cs.length} ${cs.length===1?'contact':'contacts'} · ${cs.reduce((n,c)=>n+c.count,0)} messages</small></summary>${cs.map(c=>`<button data-open="${c.id}">${icon('person')} &nbsp; ${esc(c.name)}<br><span class="muted">${esc(c.email)}</span></button>`).join('')}</details>`).join('')}</div>`;}
function renderHistory(list){$('#content').innerHTML=`<div class="network">${list.slice(0,100).map(c=>`<details><summary>${esc(c.name)} <small>${c.count} messages · last ${esc(c.date)}</small></summary><button data-open="${c.id}">Open contact history →</button></details>`).join('')}${list.length>100?'<p class="muted">Search to narrow the contact history list.</p>':''}</div>`;}
document.addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.go){view=b.dataset.go;page=0;render();}if(b.dataset.layout){layout=b.dataset.layout;page=0;render();}if(b.dataset.open)openProfile(b.dataset.open);if(b.dataset.page){page+=Number(b.dataset.page);render();$('#content').scrollIntoView({block:'start'});}});
$('#search').addEventListener('input',e=>{search=e.target.value.toLowerCase().trim();page=0;render()});$('#labels').onchange=e=>{label=e.target.value;page=0;render()};$('#sort').onchange=e=>{sort=e.target.value;page=0;render()};$('.close').onclick=()=>$('#profile').close();$('#profile').addEventListener('click',e=>{if(e.target===$('#profile'))$('#profile').close()});
fetch('contacts.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{contacts=data;const groups=groupBy(data,c=>c.organizationId||c.domain);companies=Object.entries(groups).map(([domain,members])=>({id:'company-'+domain,name:members[0].organizationName||(domain==='hyatt.com'?'Hyatt':domain),company:members[0].organizationName||domain,domain:members[0].domain,domains:[...new Set(members.map(c=>c.domain))],email:members.map(c=>c.email).join(', '),phone:'',date:members.reduce((d,c)=>c.date>d?c.date:d,''),label:'',members,count:members.reduce((n,c)=>n+c.count,0)}));companies.forEach(c=>{const m=c.members.find(x=>x.logo);if(m){c.logo=m.logo;c.name=m.company||c.name;c.company=m.company||c.company;c.blueprintPath=m.blueprintPath;}if(!c.logo)c.logo=resolveBrandLogo(c);c.labels=[...new Set(c.members.flatMap(x=>x.labels||[]))];c.label=c.labels.join(', ');});$('#peopleCount').textContent=data.length.toLocaleString();$('#companyCount').textContent=companies.length.toLocaleString();$('#historyCount').textContent=data.reduce((n,c)=>n+c.count,0).toLocaleString();$('#labels').innerHTML='<option value="">All labels</option>'+[...new Set(data.flatMap(c=>c.labels||[c.label]).filter(Boolean))].sort().map(l=>`<option>${esc(l)}</option>`).join('');render();}).catch(()=>{$('#content').innerHTML='<p class="empty">Contacts could not load. Please reload the page to retry.</p>'});
if(document.modelContext?.registerTool){const lifecycle=new AbortController();try{Promise.resolve(document.modelContext.registerTool({name:'find_contacts',description:'Search the imported contacts and update the visible contact list.',inputSchema:{type:'object',properties:{query:{type:'string'}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){if(!input||typeof input.query!=='string')throw new Error('query must be a string');view='people';search=input.query.toLowerCase().trim();$('#search').value=input.query;page=0;render();return {count:filtered().length,contacts:filtered().slice(0,20).map(c=>({id:c.id,name:c.name,email:c.email}))};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}

fetch('data-summary.json').then(r=>r.json()).then(d=>{$('#coverage').textContent=d.sourceRows.toLocaleString()+' source rows · '+d.uniqueRecords.toLocaleString()+' distinct records · '+d.firstDate+' to '+d.lastDate;}).catch(()=>{});
renderNetwork=function(list){const tree={children:new Map(),contacts:[]};for(const c of list){let n=tree;for(const part of [...(c.blueprintPath||['Unlabelled']),c.domain]){if(!n.children.has(part))n.children.set(part,{children:new Map(),contacts:[]});n=n.children.get(part);}n.contacts.push(c);}function branch(n){return [...n.children].sort(([a],[b])=>a.localeCompare(b)).map(([name,child])=>`<details><summary>${esc(name)}</summary>${branch(child)}</details>`).join('')+n.contacts.map(c=>`<button data-open="${esc(c.id)}">${c.logo?`<img src="${esc(c.logo)}" alt="" style="width:28px;height:28px;object-fit:contain;vertical-align:middle;margin-right:8px">`:icon('person')} ${esc(c.name)}<br><span class="muted">${esc(c.email)}</span></button>`).join('');}$('#content').innerHTML='<div class="network">'+branch(tree)+'</div>';};
let drawerToken=0;
function drawerTab(name){document.querySelectorAll('[data-drawer-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.drawerTab===name)));document.querySelectorAll('[data-drawer-panel]').forEach(p=>p.hidden=p.dataset.drawerPanel!==name);}
async function openProfile(id){const c=contacts.find(c=>c.id===id)||companies.find(c=>c.id===id);if(!c)return;const token=++drawerToken;const members=c.members||[c];const emails=members.map(p=>p.email);const prop=(label,value)=>`<div class="drawer-prop"><span>${label}</span><b>${esc(value)}</b></div>`;
const l=c.logo||resolveBrandLogo(c);
$('#profile-content').innerHTML=`<section class="drawer-identity"><div class="drawer-avatar">${l?`<img src="${esc(l)}" alt="${esc(c.company||c.name)} logo">`:icon(c.members?'company':'person')}</div><h2 id="profile-name">${esc(c.name)}</h2><p>${c.members?`${members.length} contacts`:esc(c.company)}</p><div class="drawer-actions">${c.phone?`<a href="tel:${esc(c.phone)}" aria-label="Call">${icon('phone')}</a>`:`<button disabled aria-label="No phone number">${icon('phone')}</button>`}<a href="mailto:${esc(emails.join(','))}" aria-label="Compose email">${icon('email')}</a><button data-switch-drawer="notes" aria-label="Show notes">${icon('notes')}</button></div></section><div class="drawer-tabs" role="tablist" aria-label="Contact details"><button role="tab" aria-selected="true" data-drawer-tab="overview">Overview</button><button role="tab" aria-selected="false" data-drawer-tab="activity">Activity</button><button role="tab" aria-selected="false" data-drawer-tab="notes">Notes</button></div><section class="drawer-section" role="tabpanel" data-drawer-panel="overview"><h3>Contact details</h3><div class="drawer-line">${icon('email')}<div>${emails.map(e=>`<span>${esc(e)}</span>`).join('')}<small>Email</small></div></div><div class="drawer-line">${icon('phone')}<div>${esc(c.phone||'Not added')}<small>Phone</small></div></div><div class="drawer-line">${icon('company')}<div>${esc(c.domain)}<small>${esc(c.blueprintPath?.join(' / ')||'Unlabelled')}</small></div></div><h3>Properties</h3><div class="drawer-props">${prop('Source','Spreadsheet')}${prop('Label',c.label||'Unlabelled')}${prop('Records',c.count.toLocaleString())}${prop('Last contacted',c.date)}</div>${c.members?`<h3>People</h3>${members.map(m=>{const ml=m.logo||resolveBrandLogo(m);return `<button class="drawer-person" data-open="${esc(m.id)}">${ml?`<img src="${esc(ml)}" alt="" style="width:24px;height:24px;object-fit:contain;border-radius:50%;margin-right:8px;vertical-align:middle">`:''}${esc(m.name)}<small>${esc(m.email)}</small></button>`;}).join('')}`:''}</section><section class="drawer-section" role="tabpanel" data-drawer-panel="activity" hidden><h3>Contact history</h3><div id="drawer-history">Loading history…</div></section><section class="drawer-section" role="tabpanel" data-drawer-panel="notes" hidden><h3>Notes & context</h3><div id="drawer-notes">Loading saved context…</div></section>`;
if(!$('#profile').open){if(innerWidth<=700)$('#profile').showModal();else $('#profile').show();}document.body.classList.add('drawer-open');
try{const history=await historyFor(c);if(token!==drawerToken)return;$('#drawer-history').innerHTML=Object.entries(groupBy(history,m=>m.date.slice(0,4))).sort(([a],[b])=>b.localeCompare(a)).map(([year,rows])=>`<details><summary>${year} · ${rows.length} records</summary>${Object.entries(groupBy(rows,m=>m.date.slice(0,7))).map(([month,rs])=>`<details><summary>${month}</summary>${rs.map(message).join('')}</details>`).join('')}</details>`).join('');const notes=[...new Set(history.map(m=>m.context).filter(s=>s&&s!=='No prior context'))];$('#drawer-notes').innerHTML=notes.length?notes.map(n=>`<p class="context-note">${esc(n)}</p>`).join(''):'<p class="muted">No notes in the imported spreadsheet.</p>';}catch{if(token===drawerToken){$('#drawer-history').textContent='History could not load. Reopen this contact to retry.';$('#drawer-notes').textContent='Context unavailable.';}}}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.drawerTab)drawerTab(b.dataset.drawerTab);if(b.dataset.switchDrawer)drawerTab(b.dataset.switchDrawer);});
$('#profile').addEventListener('close',()=>{document.body.classList.remove('drawer-open');drawerToken++;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#profile').open)$('#profile').close();const b=e.target.closest('[data-drawer-tab]');if(b&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const tabs=[...document.querySelectorAll('[data-drawer-tab]')];const next=tabs[(tabs.indexOf(b)+(e.key==='ArrowRight'?1:2))%3];next.focus();drawerTab(next.dataset.drawerTab);}});

let blueprintRows=null,blueprintLinks={},blueprintRemoved={nodes:[],links:{}},blueprintFailed=false;
const blueprintExpanded=new Set();
const blueprintKey=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
renderNetwork=function(list){
 if(!blueprintRows){$('#content').innerHTML=`<p class="empty">${blueprintFailed?'Blueprint could not load. Reload to retry.':'Loading complete blueprint…'}</p>`;return;}
 const nodes=new Map(effectiveBlueprint().map(r=>[r.id,{...r,children:[],people:[]}]));const roots=[];
 for(const n of nodes.values()){if(n.parentId&&nodes.has(n.parentId))nodes.get(n.parentId).children.push(n);else roots.push(n);}
 const matched=new Set();for(const c of list){let active=placements.contacts[c.id]??blueprintLinks.contactAssignments?.[c.id]??(blueprintLinks.links?matchingSections(c.domain,blueprintLinks.links):(blueprintLinks[c.id]||[]));if(!active||!active.length){const inferred=inferSectionForDomain(c.domain,c.company);if(inferred)active=[inferred];}for(const id of active){const n=nodes.get(id)||nodes.get(canonicalSection(id));if(n){n.people.push(c);matched.add(c.id);}}if(!Object.hasOwn(placements.contacts,c.id))for(const id of blueprintRemoved.links[c.id]||[]){const n=nodes.get(id)||nodes.get(canonicalSection(id));if(n){n.people.push(c);let ancestor=n;const seen=new Set();while(ancestor&&!seen.has(ancestor.id)){seen.add(ancestor.id);if(blueprintRows.some(r=>r.id===ancestor.id)){matched.add(c.id);break;}ancestor=nodes.get(ancestor.parentId);}}}}for(const n of nodes.values())n.people=[...new Map(n.people.map(c=>[c.id,c])).values()];for(const n of nodes.values())n.children.sort((a,b)=>(a.order??999)-(b.order??999));roots.sort((a,b)=>(a.order??999)-(b.order??999));
 function getNodeIcon(n){
  const text=(n.name+' '+(n.id||'')).toLowerCase();
  if(text.includes('account')||text.includes('bank')||text.includes('credit card'))return icon('banking');
  if(text.includes('bill')||text.includes('utilit')||text.includes('electric')||text.includes('gas'))return icon('bills');
  if(text.includes('shop')||text.includes('reward')||text.includes('retail')||text.includes('food'))return icon('shopping');
  if(text.includes('travel')||text.includes('navigat')||text.includes('airline')||text.includes('transit'))return icon('travel');
  if(text.includes('event')||text.includes('conference'))return icon('events');
  if(text.includes('social')||text.includes('communit'))return icon('community');
  if(text.includes('meet')||text.includes('schedul'))return icon('meetings');
  if(text.includes('learn')||text.includes('improve')||text.includes('educat')||text.includes('school'))return icon('education');
  if(text.includes('developer')||text.includes('tech'))return icon('tech');
  if(text.includes('cloud'))return icon('cloud');
  if(text.includes('ai')||text.includes('artificial')||text.includes('knowledge'))return icon('ai');
  if(text.includes('research')||text.includes('test')||text.includes('analyt'))return icon('research');
  if(text.includes('entertain')||text.includes('media')||text.includes('stream'))return icon('entertainment');
  if(text.includes('gov')||text.includes('civic'))return icon('civic');
  if(text.includes('daily')||text.includes('presence'))return icon('daily');
  if(text.includes('news')||text.includes('subscript'))return icon('news');
  if(text.includes('job')||text.includes('recruit'))return icon('jobs');
  if(text.includes('housing')||text.includes('real estate'))return icon('housing');
  if(text.includes('auto'))return icon('auto');
  if(text.includes('nonprofit')||text.includes('donat'))return icon('nonprofit');
  if(text.includes('insur'))return icon('insurance');
  if(text.includes('health')||text.includes('provider')||text.includes('clinic')||text.includes('lab')||text.includes('pharm'))return icon('health');
  if(text.includes('cowork')||text.includes('innovat'))return icon('coworking');
  if(text.includes('talent')||text.includes('remote')||text.includes('relocat'))return icon('talent');
  if(text.includes('people')||text.includes('friend')||text.includes('family')||text.includes('contact'))return icon('person');
  if(n.id==='p')return icon('person');
  if(n.id==='h')return icon('health');
  if(n.id==='w')return icon('work');
  if(n.id==='pr')return icon('projects');
  return icon('folder');
 }

 function accounts(people, fallbackNodeLogo = null){
  const groups = Object.values(groupBy(people, c => c.organizationId || c.company || c.domain));
  return groups.map(cs => {
    const c = cs[0];
    const groupLogo = resolveBrandLogo(c, fallbackNodeLogo);
    const displayName = c.company || c.domain || 'Organization';
    return `<details class="account-group" open><summary>${groupLogo ? `<img src="${esc(groupLogo)}" alt="">` : icon('company')}<span>${esc(displayName)}<small>${cs.length} ${cs.length === 1 ? 'account' : 'accounts'}</small></span></summary><div>${cs.map(p => {
      const pLogo = resolveBrandLogo(p, groupLogo);
      return `<button class="account-row" data-open="${esc(p.id)}">${pLogo ? `<img src="${esc(pLogo)}" alt="">` : icon('person')}<span class="account-name">${esc(p.name)}</span><span class="email-badge" title="${esc(p.email)}">${esc(p.email)}</span><span aria-hidden="true">›</span></button>`;
    }).join('')}</div></details>`;
  }).join('');
 }

 const q=search.toLowerCase();
 function branch(n,ancestorMatch=false){
  const selfMatch=ancestorMatch||!!q&&[n.name,n.description,n.hierarchyPath,...(n.aliases||[])].join(' ').toLowerCase().replaceAll('_',' ').includes(q);
  const children=n.children.map(x=>branch(x,selfMatch)).join('');
  const hasChildren=!!n.children.length;
  const hasPeople=!!n.people.length;

  if((q||label)&&!selfMatch&&!children&&!hasPeople)return '';

  const nodeLogo=n.logo||resolveBrandLogo({company:n.name,domain:n.id});
  const nodeIcon=nodeLogo?`<img src="${esc(nodeLogo)}" alt="">`:getNodeIcon(n);

  let peopleHtml='';
  if(hasPeople){
    const uniqueComps=new Set(n.people.map(p=>(p.company||p.domain||'').toLowerCase()));
    if(!hasChildren && uniqueComps.size===1 && nodeLogo){
      peopleHtml=n.people.map(p=>{
        const pLogo=resolveBrandLogo(p,nodeLogo);
        return `<button class="account-row" data-open="${esc(p.id)}">${pLogo?`<img src="${esc(pLogo)}" alt="">`:icon('person')}<span class="account-name">${esc(p.name)}</span><span class="email-badge" title="${esc(p.email)}">${esc(p.email)}</span><span aria-hidden="true">›</span></button>`;
      }).join('');
    }else{
      peopleHtml=accounts(n.people,nodeLogo);
    }
  }

  const isLeaf=!hasChildren;
  const isOpen=blueprintExpanded.has(n.id)||q;

  if(isLeaf && hasPeople && !peopleHtml.includes('<details')){
    return `<details class="account-group blueprint-node blueprint-leaf" data-blueprint-id="${esc(n.id)}" ${isOpen?'open':''}><summary>${nodeIcon}<span>${esc(n.name.replaceAll('_',' '))}<small>${n.people.length} ${n.people.length===1?'account':'accounts'}</small></span></summary><div>${n.description&&n.source?`<p class="blueprint-description">${esc(n.description)}</p>`:''}${peopleHtml}</div></details>`;
  }

  return `<details class="blueprint-node" data-blueprint-id="${esc(n.id)}" ${isOpen?'open':''}><summary>${nodeIcon}<span>${esc(n.name.replaceAll('_',' '))}</span><small>${n.children.length?`${n.children.length} items`:n.people.length?`${n.people.length} accounts`:''}</small></summary><div class="blueprint-body">${n.description?`<p class="blueprint-description">${esc(n.description)}</p>`:''}${children}${peopleHtml}${!children&&!hasPeople?'<p class="blueprint-empty">No linked contacts yet.</p>':''}</div></details>`;
 }
 const unmatched=list.filter(c=>!matched.has(c.id));$('#content').innerHTML=`<section class="blueprint"><header><h2>Network</h2><p>A map of people, places, projects, and systems connected to you.</p><div class="blueprint-controls"><span>${blueprintRows.length} blueprint entries</span><button data-blueprint-action="sync" class="blueprint-sync-btn" aria-label="Sync network changes" title="Sync changes"><svg class="sync-spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg><span>Sync</span></button><button data-blueprint-action="expand">Expand all</button><button data-blueprint-action="collapse">Collapse all</button></div></header><div class="blueprint-tree">${roots.map(n=>branch(n)).join('')||'<p class="blueprint-empty">No matching blueprint entries.</p>'}${unmatched.length?`<details class="blueprint-node" data-blueprint-id="unmatched" ${blueprintExpanded.has('unmatched')?'open':''}><summary><span>Unassigned contacts</span><small>${unmatched.length}</small></summary><div class="blueprint-body">${accounts(unmatched)}</div></details>`:''}</div></section>`;
};
document.addEventListener('toggle',e=>{const id=e.target.dataset?.blueprintId;if(id){if(e.target.open)blueprintExpanded.add(id);else blueprintExpanded.delete(id);}},true);
document.addEventListener('click',e=>{const action=e.target.closest('[data-blueprint-action]')?.dataset.blueprintAction;if(action==='sync'){if(typeof triggerSync==='function')triggerSync();return;}if(action)document.querySelectorAll('[data-blueprint-id]').forEach(d=>{d.open=action==='expand';if(d.open)blueprintExpanded.add(d.dataset.blueprintId);else blueprintExpanded.delete(d.dataset.blueprintId);});});
Promise.all(['blueprint.json','blueprint-links.json','blueprint-removed.json'].map(url=>fetch(url,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json()}))).then(([rows,links,removed])=>{blueprintRows=rows;blueprintLinks=links;blueprintRemoved=removed;if(view==='network'&&typeof effectiveBlueprint==='function')render();}).catch(()=>{blueprintFailed=true;if(view==='network')render();});

function matchingSections(domain,rules){domain=domain.toLowerCase();const matches=rules.filter(r=>{const d=r.domain.toLowerCase();return domain===d||(!['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','substack.com','e2ma.net','zendesk.com'].includes(d)&&domain.endsWith('.'+d));});const longest=Math.max(0,...matches.map(r=>r.domain.length));return [...new Set(matches.filter(r=>r.domain.length===longest).map(r=>r.sectionId))];}

const personalEmailDomains=new Set(['gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','aol.com','msn.com','live.com','me.com','mac.com','mail.com','proton.me','protonmail.com','ymail.com']);
function inferSectionForDomain(domain, company){
 domain=(domain||'').toLowerCase().trim();
 company=(company||'').toLowerCase().trim();
 const text=domain+' '+company;
 if(personalEmailDomains.has(domain))return 'p-people-personal';
 if(domain.endsWith('.gov')||/\b(census|cityof|county|police|court)\b/.test(text))return 'p-gov';
 if(domain.endsWith('.edu')||/\b(school|academy|university|college|learn|course|training|educat)\b/.test(text))return 'p-learn';
 if(/\b(health|clinic|medical|hospital|doctor|dental|derm|pharm|physician|therapy|care|wellness)\b/.test(text))return 'h-providers';
 if(/\b(job|recruit|career|talent|hire|staffing|workforce|employ)\b/.test(text))return 'p-jobs';
 if(domain.endsWith('.ai')||/\b(openai|claude|anthropic|llm|gpt)\b/.test(text))return 'p-ai';
 if(domain.endsWith('.dev')||domain.endsWith('.io')||/\b(tech|cloud|software|api|data|code|database|host|cyber)\b/.test(text))return 'p-tech';
 if(/\b(event|hackathon|summit|conference|expo|fest|festival|meetup)\b/.test(text))return 'p-events-tech';
 if(/\b(shop|store|retail|apparel|boutique|clothing|goods|market|wear)\b/.test(text))return 'p-shop-retail';
 if(/\b(food|restaurant|cafe|coffee|pizza|burger|bakery|kitchen|diner|bistro|eats)\b/.test(text))return 'p-shop-food';
 if(/\b(travel|flight|airline|hotel|inn|resort|vacation|cruise|tour)\b/.test(text))return 'p-travel-lodging';
 if(/\b(realty|realestate|apartment|properties|homes|housing|living|rent)\b/.test(text))return 'p-housing';
 if(/\b(bank|credit|insurance|financial|capital|wealth|mortgage|invest)\b/.test(text))return 'p-accounts-tools';
 if(domain.endsWith('.org')||/\b(foundation|charity|relief|mission|mosque|islamic|muslim|society|association|nonprofit)\b/.test(text))return 'p-nonprofit';
 return 'w-employers';
}

function canonicalSection(id){const aliases=blueprintLinks.sectionAliases||{};const seen=new Set();while(aliases[id]&&!seen.has(id)){seen.add(id);id=aliases[id]}return id;}
