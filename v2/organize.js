let undoStack=[];try{undoStack=JSON.parse(localStorage.getItem('crm-undo-v1')||'[]')}catch{}
function rememberUndo(before){undoStack.push(before);undoStack=undoStack.slice(-30);try{localStorage.setItem('crm-undo-v1',JSON.stringify(undoStack))}catch{}}
function undoLast(){if(!undoStack.length)return;placements=JSON.parse(undoStack.pop());placements.deleted??={};try{localStorage.setItem('crm-undo-v1',JSON.stringify(undoStack))}catch{}savePlacement();if(view==='network')render();}
const placementKey='crm-network-placements-v1';
let placements={contacts:{},parents:{},deleted:{}};
try{
 const saved=JSON.parse(localStorage.getItem(placementKey));
 if(saved&&typeof saved==='object'){
  placements={
   contacts:saved.contacts||{},
   parents:saved.parents||{},
   deleted:saved.deleted||{}
  };
 }
}catch{}
function savePlacement(){try{localStorage.setItem(placementKey,JSON.stringify(placements));if(typeof queueSync==='function')queueSync();return true}catch{alert('Could not save this move. Browser storage is unavailable.');return false}}
function allBlueprint(){return [...(blueprintRows||[]),...(blueprintRemoved.nodes||[])];}
function effectiveBlueprint(){const migratedParents={};for(const [id,parent] of Object.entries(placements.parents)){const target=canonicalSection(id),dest=canonicalSection(parent);if(target!==dest)migratedParents[target]=dest;}const rows=allBlueprint().map(n=>({...n,parentId:migratedParents[n.id]??n.parentId}));const hidden=new Set(Object.keys(placements.deleted).filter(k=>k.startsWith('node:')&&placements.deleted[k]).map(k=>canonicalSection(k.slice(5))));let changed=true;while(changed){changed=false;for(const n of rows)if(hidden.has(n.parentId)&&!hidden.has(n.id)){hidden.add(n.id);changed=true}}return rows.filter(n=>!hidden.has(n.id));}

function moveItem(kind,id,target){
 if(!blueprintRows||(!effectiveBlueprint().some(n=>n.id===target)&&target!=='unmatched'))return false;
 const before=JSON.stringify(placements);
 if(kind==='node'){
  if(target==='unmatched'||id===target)return false;
  const rows=effectiveBlueprint(),map=new Map(rows.map(n=>[n.id,n]));if(!map.has(id))return false;
  let ancestor=target;const seen=new Set();while(ancestor){if(ancestor===id||seen.has(ancestor))return false;seen.add(ancestor);ancestor=map.get(ancestor)?.parentId;}
  placements.parents[id]=target;
 }else{
  const c=contacts.find(c=>c.id===id)||companies.find(c=>c.id===id);if(!c)return false;
  for(const member of c.members||[c])placements.contacts[member.id]=target==='unmatched'?[]:[target];
 }
 if(!savePlacement()){placements=JSON.parse(before);return false}
 rememberUndo(before);blueprintExpanded.add(target);if(view==='network')render();return true;
}
function chooseDestination(kind,id){
 if(!blueprintRows){alert('Network is still loading. Please retry.');return}
 let dialog=document.querySelector('#move-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='move-dialog';document.body.append(dialog)}
 const rows=effectiveBlueprint(),map=new Map(rows.map(n=>[n.id,n]));function path(n){const names=[n.name],seen=new Set([n.id]);while(n.parentId&&map.has(n.parentId)&&!seen.has(n.parentId)){seen.add(n.parentId);n=map.get(n.parentId);names.unshift(n.name)}return names.join(' / ')}
 dialog.innerHTML='<form method="dialog"><button aria-label="Close move dialog">✕</button></form><h2>Move to section</h2><p>Moving a company moves all its contacts. Sync status is shown above Network.</p><input type="search" aria-label="Find destination" placeholder="Find a section…"><div class="destination-list"></div>';
 const options=rows.map(n=>({id:n.id,name:path(n)}));if(kind!=='node')options.unshift({id:'unmatched',name:'Unassigned contacts'});
 const list=dialog.querySelector('.destination-list');function show(q=''){list.innerHTML=options.filter(n=>n.id!==id&&n.name.toLowerCase().includes(q.toLowerCase())).map(n=>`<button type="button" data-destination="${esc(n.id)}">${esc(n.name)}</button>`).join('')}
 show();dialog.querySelector('input').oninput=e=>show(e.target.value);list.onclick=e=>{const b=e.target.closest('[data-destination]');if(b){if(moveItem(kind,id,b.dataset.destination))dialog.close();else alert('That move would create a circular hierarchy. Choose another section.')}};dialog.showModal();dialog.querySelector('input').focus();
}
function decorateNetwork(){
 const area=document.querySelector('#content');if(view!=='network')return;
 for(const row of area.querySelectorAll('[data-open]')){row.draggable=true;row.dataset.moveKind='contact';row.dataset.moveId=row.dataset.open;addMoveButton(row,'contact',row.dataset.open)}
 for(const node of area.querySelectorAll('[data-blueprint-id]')){const id=node.dataset.blueprintId;if(!allBlueprint().some(n=>n.id===id)||id==='removed')continue;const summary=node.querySelector(':scope > summary');summary.draggable=true;summary.dataset.moveKind='node';summary.dataset.moveId=id;addMoveButton(summary,'node',id)}
}
function addMoveButton(el,kind,id){
 el.querySelector('.row-actions')?.remove();
 let labelText='';
 if(kind==='node'){
  const nodeObj=allBlueprint().find(n=>n.id===id);
  labelText=nodeObj?nodeObj.name.replaceAll('_',' '):(el.querySelector('span')?.textContent||'section');
 }else{
  const contactObj=contacts.find(c=>c.id===id)||companies.find(c=>c.id===id);
  labelText=contactObj?contactObj.name:(el.querySelector('.account-name')?.textContent||el.querySelector('span')?.textContent||'contact');
 }
 const cleanName=String(labelText).trim();
 const actions=document.createElement('span');
 actions.className='row-actions';
 const b=document.createElement('button');
 b.type='button';
 b.className='row-action-btn move-btn';
 b.setAttribute('aria-label','Move '+cleanName);
 b.setAttribute('title','Move '+cleanName);
 b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><polyline points="12 10 16 14 12 18"></polyline><line x1="8" y1="14" x2="16" y2="14"></line></svg>';
 b.onclick=e=>{e.stopPropagation();e.preventDefault();chooseDestination(kind,id)};
 const del=document.createElement('button');
 del.type='button';
 del.className='row-action-btn delete-btn';
 del.setAttribute('aria-label','Delete '+cleanName);
 del.setAttribute('title','Delete '+cleanName);
 del.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
 del.onclick=e=>{e.preventDefault();e.stopPropagation();deleteItem(kind,id)};
 actions.append(b,del);
 el.append(actions);
}
let dragged=null;
document.addEventListener('dragstart',e=>{const el=e.target.closest('[data-move-kind]');if(!el)return;dragged={kind:el.dataset.moveKind,id:el.dataset.moveId};e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',JSON.stringify(dragged))});
document.addEventListener('dragover',e=>{const node=e.target.closest('[data-blueprint-id]');if(!dragged||!node)return;e.preventDefault();document.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'));node.classList.add('drop-target');e.dataTransfer.dropEffect='move'});
document.addEventListener('drop',e=>{const node=e.target.closest('[data-blueprint-id]');if(!dragged||!node)return;e.preventDefault();moveItem(dragged.kind,dragged.id,node.dataset.blueprintId);dragged=null;document.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'))});
document.addEventListener('dragend',()=>{dragged=null;document.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'))});
const originalNetwork=renderNetwork;renderNetwork=function(list){originalNetwork(list.filter(c=>!placements.deleted['contact:'+c.id]));decorateNetwork();renderOrganizerControls()};
const originalProfile=openProfile;openProfile=async function(id){const pending=originalProfile(id);const section=document.querySelector('[data-drawer-panel="overview"]');if(section){const b=document.createElement('button');b.className='move-control';b.textContent='Move to Network section';b.onclick=()=>chooseDestination('contact',id);section.prepend(b)}await pending;};

function deleteItem(kind,id){const c=contacts.find(c=>c.id===id)||companies.find(c=>c.id===id);if(kind==='contact'&&!c)return;rememberUndo(JSON.stringify(placements));for(const key of kind==='node'?['node:'+id]:(c.members||[c]).map(c=>'contact:'+c.id))placements.deleted[key]=true;savePlacement();if(view==='network')render();}
function renderOrganizerControls(){
 const root=document.querySelector('.blueprint-controls');if(!root)return;
 document.querySelectorAll('.sync-controls').forEach(el=>el.remove());
 const box=document.createElement('div');
 box.className='sync-controls';
 box.innerHTML='<button id="sync-now-btn" class="sync-btn" type="button" aria-label="Sync network changes" title="Sync changes with GitHub"><svg class="sync-spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg><span>Sync</span></button><span id="sync-status" class="sync-status" role="status"></span><button id="sync-config-btn" class="sync-settings-btn" type="button" aria-label="GitHub Sync Settings" title="Configure GitHub Token & Sync Options"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button><div class="sync-sep" aria-hidden="true"></div><button id="undo-last" aria-label="Undo last change">↶ Undo</button><button id="show-trash" aria-label="Open Trash">Trash</button>';
 root.after(box);
 box.querySelector('#sync-now-btn').onclick=()=>{if(typeof triggerSync==='function')triggerSync();else connectSync();};
 box.querySelector('#sync-config-btn').onclick=connectSync;
 box.querySelector('#undo-last').onclick=undoLast;
 box.querySelector('#undo-last').disabled=!undoStack.length;
 box.querySelector('#show-trash').onclick=showDeleted;
 if(typeof updateSyncStatus==='function')updateSyncStatus();
}
function showDeleted(){let d=document.querySelector('#deleted-dialog');if(!d){d=document.createElement('dialog');d.id='deleted-dialog';document.body.append(d)}const keys=Object.keys(placements.deleted).filter(k=>placements.deleted[k]);d.innerHTML='<form method="dialog"><button>Close</button></form><h2>Trash</h2><p>Restore items here. Source records and message history are retained.</p>'+(keys.length?'':'<p>Trash is empty.</p>')+keys.map(k=>{const id=k.slice(k.indexOf(':')+1),item=k.startsWith('node:')?allBlueprint().find(n=>n.id===id):contacts.find(c=>c.id===id);return `<p>${esc(item?.name||id)} <button data-restore="${esc(k)}">Restore</button></p>`}).join('');d.onclick=e=>{const k=e.target.dataset.restore;if(k){rememberUndo(JSON.stringify(placements));placements.deleted[k]=false;savePlacement();d.close();render();showDeleted()}};d.showModal();}
