const placementKey='crm-network-placements-v1';
let placements={contacts:{},parents:{}};try{const saved=JSON.parse(localStorage.getItem(placementKey));if(saved?.contacts&&saved?.parents)placements=saved;}catch{}
function savePlacement(){try{localStorage.setItem(placementKey,JSON.stringify(placements));if(typeof queueSync==='function')queueSync();return true}catch{alert('Could not save this move. Browser storage is unavailable.');return false}}
placements.deleted??={};
function allBlueprint(){return [...(blueprintRows||[]),...(blueprintRemoved.nodes||[])];}
function effectiveBlueprint(){const rows=allBlueprint().map(n=>({...n,parentId:placements.parents[n.id]??n.parentId}));const hidden=new Set(Object.keys(placements.deleted).filter(k=>k.startsWith('node:')&&placements.deleted[k]).map(k=>k.slice(5)));let changed=true;while(changed){changed=false;for(const n of rows)if(hidden.has(n.parentId)&&!hidden.has(n.id)){hidden.add(n.id);changed=true}}return rows.filter(n=>!hidden.has(n.id));}

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
 blueprintExpanded.add(target);if(view==='network')render();return true;
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
function addMoveButton(el,kind,id){const b=document.createElement('button');b.type='button';b.className='move-control';b.textContent='Move';b.setAttribute('aria-label','Move '+(el.textContent||'item').trim());b.onclick=e=>{e.stopPropagation();e.preventDefault();chooseDestination(kind,id)};if(el.tagName==='BUTTON')el.after(b);else el.append(b);const del=document.createElement('button');del.type='button';del.className='move-control delete-control';del.textContent='Delete';del.onclick=e=>{e.preventDefault();e.stopPropagation();deleteItem(kind,id)};b.after(del)}
let dragged=null;
document.addEventListener('dragstart',e=>{const el=e.target.closest('[data-move-kind]');if(!el)return;dragged={kind:el.dataset.moveKind,id:el.dataset.moveId};e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',JSON.stringify(dragged))});
document.addEventListener('dragover',e=>{const node=e.target.closest('[data-blueprint-id]');if(!dragged||!node)return;e.preventDefault();document.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'));node.classList.add('drop-target');e.dataTransfer.dropEffect='move'});
document.addEventListener('drop',e=>{const node=e.target.closest('[data-blueprint-id]');if(!dragged||!node)return;e.preventDefault();moveItem(dragged.kind,dragged.id,node.dataset.blueprintId);dragged=null;document.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'))});
document.addEventListener('dragend',()=>{dragged=null;document.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'))});
const originalNetwork=renderNetwork;renderNetwork=function(list){originalNetwork(list.filter(c=>!placements.deleted['contact:'+c.id]));decorateNetwork();renderOrganizerControls()};
const originalProfile=openProfile;openProfile=async function(id){const pending=originalProfile(id);const section=document.querySelector('[data-drawer-panel="overview"]');if(section){const b=document.createElement('button');b.className='move-control';b.textContent='Move to Network section';b.onclick=()=>chooseDestination('contact',id);section.prepend(b)}await pending;};

function deleteItem(kind,id){const c=contacts.find(c=>c.id===id)||companies.find(c=>c.id===id);if(kind==='contact'&&!c)return;for(const key of kind==='node'?['node:'+id]:(c.members||[c]).map(c=>'contact:'+c.id))placements.deleted[key]=true;savePlacement();if(view==='network')render();}
function renderOrganizerControls(){const root=document.querySelector('.blueprint-controls');if(!root)return;const box=document.createElement('div');box.className='sync-controls';box.innerHTML='<span id="sync-status" role="status"></span><button id="connect-sync">Connect sync</button><button id="show-trash">Deleted items</button>';root.after(box);box.querySelector('#connect-sync').onclick=connectSync;box.querySelector('#show-trash').onclick=showDeleted;updateSyncStatus();}
function showDeleted(){let d=document.querySelector('#deleted-dialog');if(!d){d=document.createElement('dialog');d.id='deleted-dialog';document.body.append(d)}const keys=Object.keys(placements.deleted).filter(k=>placements.deleted[k]);d.innerHTML='<form method="dialog"><button>Close</button></form><h2>Deleted items</h2><p>Restore items here. Source records and message history are retained.</p>'+keys.map(k=>{const id=k.slice(k.indexOf(':')+1),item=k.startsWith('node:')?allBlueprint().find(n=>n.id===id):contacts.find(c=>c.id===id);return `<p>${esc(item?.name||id)} <button data-restore="${esc(k)}">Restore</button></p>`}).join('');d.onclick=e=>{const k=e.target.dataset.restore;if(k){placements.deleted[k]=false;savePlacement();d.close();render();showDeleted()}};d.showModal();}
