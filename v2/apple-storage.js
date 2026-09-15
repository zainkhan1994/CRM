/* Parent owns storage because the Inbox iframe intentionally has an opaque origin. */
(()=>{
 const openDB=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('organize-me-apple',1);r.onupgradeneeded=()=>r.result.createObjectStore('snapshots');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 async function access(mode,data){const db=await openDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots',mode),s=tx.objectStore('snapshots');const r=mode==='readonly'?s.get('current'):s.put(data,'current');tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
 window.addEventListener('message',async event=>{const frame=document.querySelector('.inbox-frame');if(!frame||event.source!==frame.contentWindow||event.origin!=='null')return;const target=frame.contentWindow;
 if(event.data?.type==='crm-apple-ready'){try{const data=await access('readonly');if(data)target.postMessage({type:'crm-apple-data',data},'*');}catch{}}
 if(event.data?.type==='crm-apple-save'){let ok=false;try{const data=event.data.data;if(data?.format!=='organize-me-apple-v1'||!Array.isArray(data.records))throw Error('Invalid export');await access('readwrite',data);ok=true;}catch{}target.postMessage({type:'crm-apple-saved',ok},'*');}
 });
})();
