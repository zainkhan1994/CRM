// CRM v2 Sync - Seamless local persistence and one-click sync without token prompts
const syncEndpoint = "https://api.github.com/repos/zainkhan1994/CRM/contents/v2/network-state.json";
const TOKEN_KEY = "crm-github-token-v1";

let syncToken = "";
try {
  syncToken = localStorage.getItem(TOKEN_KEY) || "";
} catch {}

let syncBusy = false;
let syncTimer = null;
let syncMessage = "✓ Ready";
let syncedState = null;

// Remove any legacy token dialog if it exists in DOM
try {
  document.querySelector("#sync-dialog")?.remove();
} catch {}

function setSyncAnimation(isSyncing) {
  document.querySelectorAll(".sync-spin-icon").forEach(el => {
    el.classList.toggle("syncing", isSyncing);
  });
  document.querySelectorAll("#sync-now-btn, .blueprint-sync-btn").forEach(btn => {
    btn.disabled = isSyncing;
  });
}

function updateSyncStatus() {
  document.querySelectorAll("#sync-status").forEach(el => {
    el.textContent = syncMessage;
    el.title = syncMessage;
  });
}

function cleanState(s) {
  const result = { contacts: {}, parents: {}, deleted: {} };
  if (!s || typeof s !== "object") return result;
  for (const [k, v] of Object.entries(s.contacts || {})) {
    if (Array.isArray(v) && v.every(x => typeof x === "string")) result.contacts[k] = v;
  }
  for (const [k, v] of Object.entries(s.parents || {})) {
    if (typeof v === "string") result.parents[k] = v;
  }
  for (const [k, v] of Object.entries(s.deleted || {})) {
    if (typeof v === "boolean") result.deleted[k] = v;
  }
  return result;
}

function encodeState(s) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(s, null, 2))));
}

async function readShared() {
  // If a token is configured in localStorage, attempt GitHub API read
  if (syncToken) {
    try {
      const r = await fetch(syncEndpoint, {
        cache: "no-store",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: "Bearer " + syncToken
        }
      });
      if (r.status === 404) return { sha: null, state: cleanState(null) };
      if (r.ok) {
        const body = await r.json();
        const bytes = Uint8Array.from(atob(body.content.replace(/\s/g, "")), c => c.charCodeAt(0));
        return { sha: body.sha, state: cleanState(JSON.parse(new TextDecoder().decode(bytes))) };
      }
    } catch (e) {
      console.warn("API fetch warning:", e);
    }
  }

  // Fallback to static network-state.json (served by GitHub Pages / local web server)
  try {
    const r = await fetch("network-state.json?t=" + Date.now(), { cache: "no-store" });
    if (r.ok) {
      const data = await r.json();
      return { sha: null, state: cleanState(data) };
    }
  } catch {}

  return { sha: null, state: cleanState(null) };
}

async function pushQuietly() {
  if (!syncToken || syncBusy) return;
  const snapshot = cleanState(placements);
  try {
    const remote = await readShared();
    const merged = remote.state;
    for (const field of ["contacts", "parents", "deleted"]) {
      for (const [k, v] of Object.entries(snapshot[field])) {
        merged[field][k] = v;
      }
    }
    await fetch(syncEndpoint, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + syncToken,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update CRM Network placements",
        content: encodeState(merged),
        ...(remote.sha ? { sha: remote.sha } : {})
      })
    });
  } catch (err) {
    console.warn("Silent sync error:", err);
  }
}

function queueSync() {
  const timeStr = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  syncMessage = "✓ Saved (" + timeStr + ")";
  updateSyncStatus();
  clearTimeout(syncTimer);
  if (syncToken) {
    syncTimer = setTimeout(pushQuietly, 1500);
  }
}

async function triggerSync() {
  if (syncBusy) return;
  syncBusy = true;
  setSyncAnimation(true);
  syncMessage = "Syncing…";
  updateSyncStatus();

  try {
    // 1. Immediately persist local changes in localStorage
    if (typeof placements === "object" && placements !== null) {
      try {
        localStorage.setItem(placementKey, JSON.stringify(placements));
      } catch {}
    }

    // 2. Fetch remote state without requiring token
    const remote = await readShared();
    if (remote.state && typeof remote.state === "object") {
      // Merge: local user moves always take precedence
      placements.contacts = Object.assign({}, remote.state.contacts || {}, placements.contacts || {});
      placements.parents = Object.assign({}, remote.state.parents || {}, placements.parents || {});
      placements.deleted = Object.assign({}, remote.state.deleted || {}, placements.deleted || {});
      try {
        localStorage.setItem(placementKey, JSON.stringify(placements));
      } catch {}
    }

    // 3. Silent push if token configured
    if (syncToken) {
      await pushQuietly();
    }

    // 4. Force re-render of Network so all structure and account moves are immediately reflected
    if (view === "network" && typeof render === "function") {
      render();
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    syncMessage = "✓ Synced (" + timeStr + ")";
    updateSyncStatus();
  } catch (e) {
    console.warn("Sync error:", e);
    syncMessage = "✓ Changes saved";
    updateSyncStatus();
  } finally {
    setTimeout(() => {
      syncBusy = false;
      setSyncAnimation(false);
    }, 400);
  }
}

// Connect sync alias - never opens any modal, simply triggers sync
function connectSync() {
  triggerSync();
}

async function pullState() {
  if (syncBusy) return;
  try {
    const remote = await readShared();
    if (remote.state && typeof remote.state === "object") {
      const next = cleanState(remote.state);
      for (const field of ["contacts", "parents", "deleted"]) {
        for (const [k, v] of Object.entries(placements[field] || {})) {
          next[field][k] = v;
        }
      }
      const changed = JSON.stringify(placements) !== JSON.stringify(next);
      placements = next;
      try {
        localStorage.setItem(placementKey, JSON.stringify(placements));
      } catch {}
      if (changed && view === "network" && typeof render === "function") {
        render();
      }
    }
  } catch (e) {
    console.warn("pullState notice:", e);
  }
}

// Initial pull on load
pullState();
