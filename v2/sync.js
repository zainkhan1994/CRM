// GitHub Contents API is the authenticated shared store. Credentials persist in localStorage on this device.
const syncEndpoint = 'https://api.github.com/repos/zainkhan1994/CRM/contents/v2/network-state.json';
const TOKEN_KEY = 'crm-github-token-v1';

let syncToken = '';
try {
  syncToken = localStorage.getItem(TOKEN_KEY) || '';
} catch {}

let syncBusy = false, syncTimer = null, syncMessage = syncToken ? 'Connected' : 'Local changes — connect GitHub to sync', syncedState = null;

function setSyncToken(token) {
  syncToken = (token || '').trim();
  try {
    if (syncToken) {
      localStorage.setItem(TOKEN_KEY, syncToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
  syncMessage = syncToken ? 'Connected' : 'Local changes — connect GitHub to sync';
  updateSyncStatus();
}

function setSyncAnimation(isSyncing) {
  document.querySelectorAll('.sync-spin-icon').forEach(el => {
    el.classList.toggle('syncing', isSyncing);
  });
  document.querySelectorAll('#sync-now-btn, .blueprint-sync-btn').forEach(btn => {
    btn.disabled = isSyncing;
  });
}

function updateSyncStatus() {
  document.querySelectorAll('#sync-status').forEach(el => {
    el.textContent = syncMessage;
    el.title = syncMessage;
  });
}

function queueSync() {
  syncMessage = syncToken ? 'Saving…' : 'Local changes — click Sync to save';
  updateSyncStatus();
  clearTimeout(syncTimer);
  if (syncToken) syncTimer = setTimeout(pushState, 1000);
}

function cleanState(s) {
  const result = { contacts: {}, parents: {}, deleted: {} };
  if (!s || typeof s !== 'object') return result;
  for (const [k, v] of Object.entries(s.contacts || {})) {
    if (Array.isArray(v) && v.every(x => typeof x === 'string')) result.contacts[k] = v;
  }
  for (const [k, v] of Object.entries(s.parents || {})) {
    if (typeof v === 'string') result.parents[k] = v;
  }
  for (const [k, v] of Object.entries(s.deleted || {})) {
    if (typeof v === 'boolean') result.deleted[k] = v;
  }
  return result;
}

function encodeState(s) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(s, null, 2))));
}

async function readShared() {
  if (syncToken) {
    try {
      const r = await fetch(syncEndpoint, {
        cache: 'no-store',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: 'Bearer ' + syncToken
        }
      });
      if (r.status === 404) return { sha: null, state: cleanState(null) };
      if (r.status === 401 || r.status === 403) {
        throw Error('GitHub token invalid or unauthorized (' + r.status + ').');
      }
      if (r.ok) {
        const body = await r.json();
        const bytes = Uint8Array.from(atob(body.content.replace(/\s/g, '')), c => c.charCodeAt(0));
        return { sha: body.sha, state: cleanState(JSON.parse(new TextDecoder().decode(bytes))) };
      }
    } catch (e) {
      if (e.message && e.message.includes('token invalid')) throw e;
      console.warn('API fetch failed, falling back to static file:', e);
    }
  }

  // Fallback to static network-state.json (served by GitHub Pages / local web server)
  try {
    const r = await fetch('network-state.json', { cache: 'no-store' });
    if (r.ok) {
      const data = await r.json();
      return { sha: null, state: cleanState(data) };
    }
  } catch {}

  return { sha: null, state: cleanState(null) };
}

async function pushState() {
  if (!syncToken) {
    connectSync();
    return;
  }
  if (syncBusy) return;
  syncBusy = true;
  setSyncAnimation(true);
  syncMessage = 'Syncing to GitHub…';
  updateSyncStatus();

  const snapshot = cleanState(placements);
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const remote = await readShared();
      const merged = remote.state;

      // Merge structure (parents), accounts (contacts), and deleted
      for (const field of ['contacts', 'parents', 'deleted']) {
        for (const key of new Set([...Object.keys(snapshot[field]), ...Object.keys(syncedState?.[field] || {})])) {
          const value = snapshot[field][key];
          if (!syncedState || JSON.stringify(value) !== JSON.stringify(syncedState[field]?.[key])) {
            if (value === undefined) delete merged[field][key];
            else merged[field][key] = value;
          }
        }
      }

      const r = await fetch(syncEndpoint, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + syncToken,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update CRM Network placements',
          content: encodeState(merged),
          ...(remote.sha ? { sha: remote.sha } : {})
        })
      });

      if (r.status === 409 || r.status === 422) {
        if (attempt < 2) continue;
      }
      if (!r.ok) {
        if (r.status === 401 || r.status === 403) throw Error('GitHub token invalid (' + r.status + ').');
        throw Error('Save failed (' + r.status + '). Check token repository access.');
      }

      const newer = JSON.stringify(placements) !== JSON.stringify(snapshot);
      syncedState = cleanState(merged);
      if (!newer) {
        placements = merged;
        localStorage.setItem(placementKey, JSON.stringify(placements));
      }
      const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      syncMessage = '✓ Synced (' + timeStr + ')';
      updateSyncStatus();
      if (view === 'network' && typeof render === 'function') render();
      if (newer) setTimeout(pushState, 500);
      return;
    }
  } catch (e) {
    syncMessage = (e.message || 'Sync error') + ' Local changes retained.';
    updateSyncStatus();
  } finally {
    syncBusy = false;
    setSyncAnimation(false);
  }
}

async function pullState() {
  if (syncBusy) return;
  try {
    const remote = await readShared();
    const base = syncedState;
    const next = cleanState(remote.state);

    for (const field of ['contacts', 'parents', 'deleted']) {
      for (const [k, v] of Object.entries(placements[field] || {})) {
        if (!base || JSON.stringify(v) !== JSON.stringify(base[field]?.[k])) {
          next[field][k] = v;
        }
      }
    }

    const changed = JSON.stringify(placements) !== JSON.stringify(next);
    syncedState = cleanState(remote.state);
    placements = next;
    localStorage.setItem(placementKey, JSON.stringify(placements));

    if (changed && view === 'network' && typeof render === 'function') render();

    if (!syncMessage || syncMessage === 'Connected' || syncMessage.includes('Local changes')) {
      if (syncToken) {
        const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        syncMessage = '✓ Synced (' + timeStr + ')';
      } else {
        syncMessage = 'Local changes (click Sync to connect)';
      }
      updateSyncStatus();
    }
  } catch (e) {
    console.warn('pullState error:', e);
  }
}

async function triggerSync() {
  if (!syncToken) {
    connectSync();
    return;
  }
  if (syncBusy) return;
  setSyncAnimation(true);
  syncMessage = 'Syncing…';
  updateSyncStatus();
  try {
    await pushState();
    await pullState();
    if (view === 'network' && typeof render === 'function') render();
  } catch (e) {
    syncMessage = (e.message || 'Sync failed') + ' Local changes retained.';
    updateSyncStatus();
  } finally {
    setSyncAnimation(false);
  }
}

function connectSync() {
  let d = document.querySelector('#sync-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'sync-dialog';
    document.body.append(d);
  }

  const isConnected = !!syncToken;
  const maskedToken = isConnected ? syncToken.slice(0, 8) + '••••••••' + syncToken.slice(-4) : '';

  d.innerHTML = `
    <div class="sync-modal-head">
      <h2>GitHub Cross-Device Sync</h2>
      <form method="dialog"><button aria-label="Close dialog" style="border:0;background:none;font-size:20px;cursor:pointer;line-height:1">✕</button></form>
    </div>
    <div class="sync-help-box">
      ${isConnected
        ? `<strong>✓ Connected</strong> — Token is remembered on this device. Structure and account placements sync automatically with <b>zainkhan1994/CRM</b>.`
        : `Sync your structure moves and account assignments across all your devices using your GitHub repository.`}
    </div>
    <p style="font-size:13px;color:#555;margin:8px 0">
      Need a token? <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer" style="color:#653de0;font-weight:600">Create fine-grained token on GitHub ↗</a><br>
      <small style="color:#777">Repository: <b>zainkhan1994/CRM</b> · Permission: <b>Contents: Read and write</b></small>
    </p>
    <div style="margin:12px 0">
      <input type="password" id="sync-token-field" autocomplete="off" aria-label="GitHub fine-grained token" placeholder="${isConnected ? 'Token saved (' + maskedToken + ')' : 'Paste GitHub fine-grained token (github_pat_...)'}" style="width:100%;padding:12px;border:1px solid #ccc;border-radius:8px;font-size:14px">
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin:8px 0;color:#555;cursor:pointer">
        <input type="checkbox" id="sync-remember-chk" checked> Remember token on this device
      </label>
    </div>
    <div class="sync-actions">
      <button type="button" id="start-sync" class="sync-primary-btn">Save & Sync Now</button>
      ${isConnected ? `<button type="button" id="disconnect-sync" class="sync-danger-btn">Disconnect Token</button>` : ''}
      <button type="button" id="export-state-btn" class="sync-secondary-btn">Export State Backup</button>
    </div>
    <p id="sync-feedback" role="status" style="font-size:13px;margin-top:12px;color:#653de0;font-weight:500"></p>
  `;

  const input = d.querySelector('#sync-token-field');
  const rememberChk = d.querySelector('#sync-remember-chk');
  const feedback = d.querySelector('#sync-feedback');

  d.querySelector('#start-sync').onclick = async () => {
    const val = input.value.trim();
    if (val) {
      if (rememberChk.checked) {
        setSyncToken(val);
      } else {
        syncToken = val;
      }
    }
    if (!syncToken) {
      feedback.textContent = 'Please enter a valid GitHub token.';
      return;
    }
    feedback.textContent = 'Syncing with GitHub…';
    await triggerSync();
    feedback.textContent = syncMessage;
    if (syncMessage.includes('Synced')) {
      setTimeout(() => d.close(), 1200);
    }
  };

  const disconnectBtn = d.querySelector('#disconnect-sync');
  if (disconnectBtn) {
    disconnectBtn.onclick = () => {
      setSyncToken('');
      input.value = '';
      input.placeholder = 'Paste GitHub fine-grained token';
      feedback.textContent = 'Disconnected. Token removed from this device.';
      disconnectBtn.remove();
    };
  }

  d.querySelector('#export-state-btn').onclick = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(placements, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'network-state-backup.json';
    a.click();
    feedback.textContent = 'State backup downloaded.';
  };

  d.showModal();
}

// Initial pull on load
pullState();
setInterval(() => {
  if (document.visibilityState === 'visible') pullState();
}, 30000);
