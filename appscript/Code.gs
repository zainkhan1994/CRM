const CRM_SPREADSHEET_ID = '1pqGWetnt3-UDx9FFR35xhvHtcQHWlmXx5iGIo7TnLFg';
const CRM_SOURCE_SHEET = 'Full Contact Database';

function doGet(e) {
  if (e && e.parameter && e.parameter.format === 'json') {
    return ContentService
      .createTextOutput(JSON.stringify(getCrmData(), null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService
    .createHtmlOutput(renderCrmHtml())
    .setTitle('Zain CRM')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function renderCrmHtml() {
  const payload = getCrmData();
  const contacts = payload.contacts;
  const first = contacts[0] || {};
  const segments = ['All', 'Work', 'Projects', 'Growth', 'Systems', 'Personal', 'Health'];
  const segmentCounts = contacts.reduce((map, contact) => {
    map[contact.domain] = (map[contact.domain] || 0) + 1;
    return map;
  }, { All: contacts.length });

  const rows = contacts.map((contact, index) => {
    const active = index === 0 ? ' class="active"' : '';
    const search = [
      contact.name,
      contact.company,
      contact.primaryEmail,
      contact.domains.join(' '),
      contact.domain,
      contact.type,
      contact.latestDate
    ].join(' ').toLowerCase();
    return '<tr' + active + ' draggable="true" data-id="' + esc_(contact.id) + '" data-domain="' + esc_(contact.domain) + '" data-search="' + esc_(search) + '">' +
      '<td><span class="check">v</span></td>' +
      '<td><div class="person">' + logoHtml_(contact) + '<div><div class="name">' + esc_(contact.name) + '</div><div class="email">' + esc_(contact.primaryEmail || contact.domains[0] || 'No email') + '</div></div></div></td>' +
      '<td>' + esc_(contact.company || contact.domains[0] || '-') + '</td>' +
      '<td>' + esc_(inferPhone_(contact)) + '</td>' +
      '<td>' + esc_(contact.latestDate || 'Unknown') + '</td>' +
      '<td class="value">' + esc_(formatValue_(contact)) + '</td>' +
    '</tr>';
  }).join('');

  const nav = segments
    .filter((segment) => segment === 'All' || segmentCounts[segment])
    .map((segment) => {
      const active = segment === 'All' ? ' active' : '';
      const label = segment === 'All' ? 'Dashboard' : segment;
      return '<button class="' + active + '" type="button" data-domain="' + esc_(segment) + '"><span class="nav-icon">' + esc_(segment.charAt(0)) + '</span><span class="label">' + esc_(label) + '</span><span class="nav-count">' + Number(segmentCounts[segment] || 0).toLocaleString() + '</span></button>';
    }).join('');

  const details = contacts.map((contact, index) => {
    return '<div class="detail-panel' + (index === 0 ? ' active' : '') + '" data-id="' + esc_(contact.id) + '">' + renderDetail_(contact) + '</div>';
  }).join('');

  return '<!doctype html><html><head><base target="_top"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Zain CRM</title>' +
    '<style>' + crmCss_() + '</style></head><body>' +
    '<div class="shell">' +
      '<aside class="sidebar"><div class="brand"><div class="brand-mark">C</div><div><div class="brand-title">Zain CRM</div><div class="brand-subtitle">Gmail Workspace</div></div></div><nav class="nav">' + nav + '</nav><div class="account"><div class="avatar"><img alt="" src="https://www.google.com/s2/favicons?domain=gmail.com&sz=64"></div><div><div class="account-name">Zain Khan</div><div class="account-email">zainkhan1994.ZK@gmail.com</div></div></div></aside>' +
      '<main class="main"><header class="main-head"><div><h1>Contacts</h1><p class="subhead">Manage your leads and customer relationships</p></div><div class="head-actions"><button class="btn" type="button">Import</button><button class="btn primary" type="button">+ Add Contact</button></div></header>' +
      '<section class="toolbar"><label class="search"><span>Q</span><input id="searchInput" type="search" placeholder="Search contacts by name, email, or company..."></label><select id="typeFilter"><option value="All">Filter</option></select><select><option>My Contacts</option></select><span class="chip"><span id="visibleCount">' + contacts.length.toLocaleString() + '</span> contacts</span></section>' +
      '<section class="table-card"><table><thead><tr><th><span class="check"></span></th><th>Name</th><th>Company</th><th>Phone</th><th>Last Contact</th><th>Value</th></tr></thead><tbody>' + rows + '</tbody></table><footer class="pager"><span id="resultText">Showing ' + contacts.length.toLocaleString() + ' of ' + contacts.length.toLocaleString() + ' results</span><div class="page-buttons"><button type="button" class="active">1</button></div></footer></section></main>' +
      '<aside class="detail"><button class="close" type="button">x</button><section class="sandbox side-sandbox" id="workSandbox"><div class="selected-head"><strong>Selected contacts</strong><span>Click rows to add them here. Use x to remove.</span></div><div class="sandbox-items" id="sandboxItems"></div></section>' + details + '</aside>' +
    '</div><script>' + crmJs_() + '</script></body></html>';
}

function renderDetail_(contact) {
  const snippets = (contact.snippets && contact.snippets.length ? contact.snippets : [contact.latestSnippet || 'No snippet captured.']).slice(0, 4);
  const activity = snippets.map((snippet, index) => '<div class="activity-item"><strong>Email thread ' + (index + 1) + '</strong>' + esc_(snippet) + '<small class="tiny">' + esc_(contact.latestDate || 'Unknown date') + '</small></div>').join('');
  return '<section class="profile">' +
      logoHtml_(contact) +
      '<h2>' + esc_(contact.name) + '</h2><p>' + esc_(contact.type) + ' at ' + esc_(contact.company || contact.domains[0] || 'Unknown') + '</p>' +
      '<div class="quick-actions"><button class="action-icon" type="button">P</button><button class="action-icon" type="button">@</button><button class="action-icon" type="button">N</button><button class="action-icon" type="button">...</button></div>' +
    '</section>' +
    '<div class="detail-tabs"><button class="tab-button active" type="button" data-tab="overview">Overview</button><button class="tab-button" type="button" data-tab="activity">Activity</button><button class="tab-button" type="button" data-tab="notes">Notes</button></div>' +
    '<section class="tab-section active" data-tab-panel="overview"><h3 class="section-title">Contact Details</h3><div class="detail-list">' +
      detailLine_('@', contact.primaryEmail || contact.emails[0] || 'No email', contact.type) +
      detailLine_('P', inferPhone_(contact), 'Phone') +
      detailLine_('D', primaryDomain_(contact) || 'No domain', contact.domain) +
    '</div><h3 class="section-title">Properties</h3><div class="properties">' +
      prop_('Source', sourceLabel_(contact), false) +
      prop_('Priority', priorityLabel_(contact), true) +
      prop_('Rows', contact.count + ' source rows', false) +
      prop_('Value', formatValue_(contact), false) +
    '</div></section>' +
    '<section class="tab-section" data-tab-panel="activity"><h3 class="section-title">Recent Activity</h3><div class="activity">' + activity + '</div></section>' +
    '<section class="tab-section" data-tab-panel="notes"><h3 class="section-title">Notes</h3><textarea class="notes-box" placeholder="Write notes for ' + esc_(contact.name) + '"></textarea></section>';
}

function crmCss_() {
  return ':root{--app-bg:#f5f7fb;--panel:#fff;--line:#dce4f2;--line-soft:#edf1f7;--text:#172033;--muted:#66738a;--blue:#2f6df6;--blue-soft:#eaf1ff;--red:#ea3d4f;--shadow:0 18px 45px rgba(31,45,70,.10);--radius:8px}*{box-sizing:border-box}body{margin:0;min-width:1180px;background:var(--app-bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:13px}button,input,select,textarea{font:inherit}.shell{display:grid;grid-template-columns:220px minmax(680px,1fr) 360px;min-height:100vh}.sidebar{background:var(--panel);border-right:1px solid var(--line);padding:22px 14px;display:flex;flex-direction:column;gap:22px}.brand{display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:center;padding:0 8px}.brand-mark,.nav-icon,.avatar,.logo,.action-icon{display:grid;place-items:center;overflow:hidden;flex:0 0 auto}.brand-mark{width:34px;height:34px;border-radius:8px;background:var(--blue);color:#fff;font-weight:900}.brand-title{font-weight:800;line-height:1.1}.brand-subtitle,.account-email,.subhead,.email,.tiny{color:var(--muted);font-size:11px}.nav{display:grid;gap:6px}.nav button{border:0;border-radius:8px;min-height:38px;display:grid;grid-template-columns:26px 1fr auto;align-items:center;gap:8px;background:transparent;color:var(--muted);padding:0 10px;text-align:left;font-weight:650}.nav button.active{background:var(--blue);color:#fff;box-shadow:0 10px 22px rgba(47,109,246,.24)}.nav-icon{width:20px;height:20px}.nav-count{font-size:11px}.account{margin-top:auto;display:grid;grid-template-columns:36px 1fr;gap:10px;align-items:center;padding:10px 8px;border-top:1px solid var(--line-soft)}.avatar,.account .avatar{width:36px;height:36px;border-radius:50%}.avatar img,.logo img{width:100%;height:100%;object-fit:cover}.account-name{font-weight:750}.main{padding:26px 28px;min-width:0;overflow-x:auto}.main-head{display:flex;align-items:start;justify-content:space-between;gap:18px;margin-bottom:22px}h1{margin:0 0 5px;font-size:26px;line-height:1.08}.head-actions{display:flex;gap:10px}.btn{border:1px solid var(--line);border-radius:8px;min-height:38px;padding:0 14px;background:#fff;color:var(--text);font-weight:700}.btn.primary{border-color:var(--blue);background:var(--blue);color:#fff}.toolbar{display:grid;grid-template-columns:minmax(280px,1fr) auto auto auto;gap:10px;margin-bottom:18px;align-items:center}.search{position:relative}.search span{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#8b98ad}input,select,textarea{border:1px solid var(--line);background:#fff;border-radius:8px;color:var(--text);outline:none}.search input{width:100%;min-height:40px;padding:0 14px 0 38px}select{min-height:40px;padding:0 34px 0 12px;color:var(--muted);font-weight:700}.chip{min-height:34px;display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--blue);padding:0 12px;font-weight:750}.table-card{border:1px solid var(--line);border-radius:8px;background:#fff;box-shadow:var(--shadow);overflow:auto}table{width:100%;min-width:900px;border-collapse:collapse;table-layout:fixed}thead{background:#fbfcff;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.04em}th,td{height:62px;border-bottom:1px solid var(--line-soft);padding:0 14px;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}th:first-child,td:first-child{width:48px;text-align:center}th:nth-child(2),td:nth-child(2){width:250px}th:nth-child(3),td:nth-child(3){width:170px}th:nth-child(4),td:nth-child(4){width:145px}th:nth-child(5),td:nth-child(5){width:120px}th:nth-child(6),td:nth-child(6){width:120px;text-align:right}tbody tr{cursor:pointer}tbody tr:hover,tbody tr.active{background:#f7faff}tbody tr.active td:first-child .check{background:var(--blue);border-color:var(--blue);color:#fff}tr.hidden{display:none}.check{width:18px;height:18px;border:1px solid var(--line);border-radius:50%;display:inline-grid;place-items:center;color:transparent;font-size:11px;font-weight:900;background:#fff}.person{display:grid;grid-template-columns:38px minmax(0,1fr);gap:10px;align-items:center;min-width:0}.logo{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--blue-soft);color:var(--blue);font-weight:850;font-size:12px}.name{font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.value{font-weight:800}.pager{min-height:56px;display:flex;justify-content:space-between;align-items:center;padding:0 14px;color:var(--muted)}.page-buttons button{width:34px;height:34px;border:1px solid var(--blue);border-radius:8px;background:var(--blue-soft);color:var(--blue);font-weight:750}.detail{border-left:1px solid var(--line);background:#fff;padding:24px;min-width:0}.detail-panel{display:none}.detail-panel.active{display:block}.close{margin-left:auto;width:30px;height:30px;border:0;background:transparent;color:#8b98ad;font-size:24px;line-height:1}.sandbox{border:1px solid var(--line);border-radius:8px;background:#f8faff;padding:12px;margin:10px 0 18px}.sandbox.dragover{border-color:var(--blue);background:var(--blue-soft)}.selected-head{display:grid;gap:3px;margin-bottom:10px}.sandbox strong{display:block}.sandbox span{color:var(--muted);font-size:12px}.sandbox-items{display:grid;gap:8px;min-height:38px}.sandbox-pill{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;padding:9px 8px 9px 10px;font-weight:750;display:grid;grid-template-columns:1fr 24px;gap:8px;align-items:center;text-align:left}.sandbox-pill .remove{width:24px;height:24px;border:0;border-radius:50%;background:#edf2fb;color:#66738a;font-weight:900}.sandbox-pill .remove:hover{background:#ffe8ec;color:var(--red)}.profile{display:grid;justify-items:center;text-align:center;padding-bottom:22px;border-bottom:1px solid var(--line-soft)}.profile .logo{width:82px;height:82px;margin-bottom:13px;font-size:22px;border-width:2px}.profile h2{margin:0 0 4px;font-size:20px;line-height:1.1;max-width:100%;overflow-wrap:anywhere}.profile p{margin:0;color:var(--muted)}.quick-actions{display:flex;gap:10px;margin-top:16px}.action-icon{width:34px;height:34px;border:0;border-radius:50%;background:var(--blue-soft);color:var(--blue);font-weight:850}.detail-tabs{display:grid;grid-template-columns:repeat(3,1fr);margin:18px -24px 20px;border-bottom:1px solid var(--line-soft)}.detail-tabs button{border:0;background:transparent;color:var(--muted);height:38px;font-weight:750}.detail-tabs button.active{color:var(--blue);border-bottom:2px solid var(--blue)}.tab-section{display:none}.tab-section.active{display:block}.notes-box{width:100%;min-height:130px;padding:10px;resize:vertical}.section-title{margin:18px 0 10px;color:var(--muted);font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.05em}.detail-list{display:grid;gap:12px}.detail-line{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:start;min-width:0}.mini{width:24px;height:24px;border-radius:6px;background:#f2f5fb;color:var(--muted);display:grid;place-items:center;font-size:12px}.detail-line span:last-child{overflow-wrap:anywhere;line-height:1.35}.tiny{display:block;margin-top:2px}.properties{display:grid;grid-template-columns:1fr 1fr;gap:10px}.prop{min-height:64px;border-radius:8px;background:#f7f9fd;border:1px solid var(--line-soft);padding:10px;overflow:hidden}.prop-label{color:var(--muted);font-size:11px;margin-bottom:7px}.prop-value{font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.priority{color:var(--red)}.activity{display:grid;gap:9px;max-height:220px;overflow:auto;padding-right:4px}.activity-item{border-left:2px solid var(--blue);padding:0 0 0 10px;color:var(--muted);line-height:1.42}.activity-item strong{display:block;color:var(--text);margin-bottom:2px}.empty{color:var(--muted);padding:24px}@media(max-width:1180px){body{min-width:0}.shell{grid-template-columns:86px minmax(0,1fr)}.detail{grid-column:2;border-top:1px solid var(--line);border-left:0}.brand-title,.brand-subtitle,.nav .label,.nav-count,.account div:last-child{display:none}.nav button{grid-template-columns:1fr;justify-items:center;padding:0}.toolbar{grid-template-columns:1fr 1fr}}';
}

function crmJs_() {
  return `(function(){
    var rows = [].slice.call(document.querySelectorAll("tbody tr[data-id]"));
    var panels = [].slice.call(document.querySelectorAll(".detail-panel"));
    var nav = [].slice.call(document.querySelectorAll(".nav button[data-domain]"));
    var search = document.getElementById("searchInput");
    var visible = document.getElementById("visibleCount");
    var result = document.getElementById("resultText");
    var drop = document.getElementById("workSandbox");
    var box = document.getElementById("sandboxItems");
    var activeDomain = "All";
    var draggingId = "";
    var activeId = rows[0] ? rows[0].dataset.id : "";

    function select(id) {
      activeId = id;
      rows.forEach(function(row) {
        row.classList.toggle("active", row.dataset.id === id);
      });
      panels.forEach(function(panel) {
        panel.classList.toggle("active", panel.dataset.id === id);
      });
    }

    function applyFilter() {
      var query = (search.value || "").toLowerCase().trim();
      var count = 0;
      rows.forEach(function(row) {
        var ok = (activeDomain === "All" || row.dataset.domain === activeDomain)
          && (!query || (row.dataset.search || "").indexOf(query) > -1);
        row.classList.toggle("hidden", !ok);
        if (ok) count++;
      });
      visible.textContent = count.toLocaleString();
      result.textContent = "Showing " + count.toLocaleString() + " of " + rows.length.toLocaleString() + " results";
      var first = rows.find(function(row) { return !row.classList.contains("hidden"); });
      if (first && !rows.some(function(row) { return row.classList.contains("active") && !row.classList.contains("hidden"); })) {
        select(first.dataset.id);
      }
    }

    function saveSandbox() {
      var ids = [].slice.call(box.querySelectorAll(".sandbox-pill")).map(function(pill) {
        return pill.dataset.id;
      });
      localStorage.setItem("zainCrmSandbox", JSON.stringify(ids));
    }

    function addSandbox(id) {
      if (!id || box.querySelector('[data-id="' + id + '"]')) return;
      var row = rows.find(function(item) { return item.dataset.id === id; });
      if (!row) return;
      var pill = document.createElement("div");
      var name = row.querySelector(".name").textContent;
      pill.className = "sandbox-pill";
      pill.dataset.id = id;
      pill.innerHTML = '<span>' + name + '</span><button class="remove" type="button" aria-label="Remove ' + name.replace(/"/g, "") + '">x</button>';
      pill.addEventListener("click", function(event) {
        event.stopPropagation();
        if (event.target.closest(".remove")) {
          pill.remove();
          saveSandbox();
          return;
        }
        select(id);
      });
      box.appendChild(pill);
      saveSandbox();
    }

    function overDrop(event) {
      if (!drop) return false;
      var rect = drop.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    }

    rows.forEach(function(row) {
      row.addEventListener("click", function() {
        select(row.dataset.id);
        addSandbox(row.dataset.id);
      });
      row.addEventListener("mousedown", function() {
        draggingId = row.dataset.id;
      });
      row.addEventListener("dragstart", function(event) {
        draggingId = row.dataset.id;
        event.dataTransfer.setData("text/plain", row.dataset.id);
      });
    });

    document.addEventListener("mouseup", function(event) {
      if (draggingId && overDrop(event)) {
        addSandbox(draggingId);
        drop.classList.remove("dragover");
      }
      draggingId = "";
    });

    document.addEventListener("mousemove", function(event) {
      if (draggingId && drop) drop.classList.toggle("dragover", overDrop(event));
    });

    nav.forEach(function(button) {
      button.addEventListener("click", function() {
        activeDomain = button.dataset.domain;
        nav.forEach(function(item) { item.classList.toggle("active", item === button); });
        applyFilter();
      });
    });

    document.querySelectorAll(".detail-panel").forEach(function(panel) {
      panel.querySelectorAll(".tab-button").forEach(function(button) {
        button.addEventListener("click", function() {
          var tab = button.dataset.tab;
          panel.querySelectorAll(".tab-button").forEach(function(item) {
            item.classList.toggle("active", item === button);
          });
          panel.querySelectorAll(".tab-section").forEach(function(section) {
            section.classList.toggle("active", section.dataset.tabPanel === tab);
          });
        });
      });
    });

    var closeButton = document.querySelector(".detail > .close");
    if (closeButton) {
      closeButton.addEventListener("click", function() {
        if (box) {
          box.innerHTML = "";
          saveSandbox();
        }
      });
    }

    if (search) search.addEventListener("input", applyFilter);
    if (drop) {
      drop.addEventListener("dragover", function(event) {
        event.preventDefault();
        drop.classList.add("dragover");
      });
      drop.addEventListener("dragleave", function() {
        drop.classList.remove("dragover");
      });
      drop.addEventListener("drop", function(event) {
        event.preventDefault();
        drop.classList.remove("dragover");
        addSandbox(event.dataTransfer.getData("text/plain") || draggingId || activeId);
      });
    }

    try {
      JSON.parse(localStorage.getItem("zainCrmSandbox") || "[]").forEach(addSandbox);
    } catch (error) {}
    applyFilter();
  })();`;
}

function logoHtml_(contact) {
  const initials = initialsFor_(contact.name || contact.company || contact.primaryEmail || '?');
  const domain = contact.logoDomain || primaryDomain_(contact);
  if (!domain) return '<div class="logo">' + esc_(initials) + '</div>';
  return '<div class="logo"><img alt="" loading="lazy" src="https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=128"></div>';
}

function detailLine_(icon, value, sub) {
  return '<div class="detail-line"><span class="mini">' + esc_(icon) + '</span><span>' + esc_(value || '-') + '<small class="tiny">' + esc_(sub || '') + '</small></span></div>';
}

function prop_(label, value, priority) {
  return '<div class="prop"><div class="prop-label">' + esc_(label) + '</div><div class="prop-value' + (priority ? ' priority' : '') + '">' + esc_(value) + '</div></div>';
}

function initialsFor_(value) {
  return String(value || '?').split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
}

function primaryDomain_(contact) {
  return (contact.domains && contact.domains[0]) || contact.logoDomain || domainFromEmail(contact.primaryEmail) || '';
}

function inferPhone_(contact) {
  const text = [contact.latestSnippet].concat(contact.snippets || []).join(' ');
  const match = text.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  return match ? match[0] : '-';
}

function formatValue_(contact) {
  return '$' + (contact.count * 1250).toLocaleString();
}

function sourceLabel_(contact) {
  const text = [contact.name, contact.primaryEmail, primaryDomain_(contact), contact.latestSnippet].join(' ');
  if (/linkedin/i.test(text)) return 'LinkedIn';
  if (/event|community|gdg|meetup/i.test(text)) return 'Community';
  if (/newsletter/i.test(text)) return 'Newsletter';
  return 'Gmail';
}

function priorityLabel_(contact) {
  if (contact.count >= 10) return 'High';
  if (contact.count >= 3) return 'Medium';
  return 'New';
}

function esc_(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));
}

function getCrmData() {
  const sheet = SpreadsheetApp.openById(CRM_SPREADSHEET_ID).getSheetByName(CRM_SOURCE_SHEET);
  if (!sheet) {
    throw new Error('Missing sheet: ' + CRM_SOURCE_SHEET);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { generatedAt: new Date().toISOString(), contacts: [], totals: emptyTotals() };
  }

  const rows = sheet.getRange(1, 1, lastRow, 5).getDisplayValues();
  const headers = rows.shift();
  const contactsByKey = {};
  let currentDomain = '';
  let currentDate = '';
  let currentEmail = '';
  let currentCategory = '';

  rows.forEach((row, index) => {
    let [domainValue, dateMonth, email, category, snippet] = row.map(clean);
    const rowDomain = stripTotal(domainValue);
    const hasOnlyDomainTotal = Boolean(rowDomain) && !dateMonth && !email && !category && !snippet;

    if (rowDomain) currentDomain = rowDomain;
    if (dateMonth) currentDate = dateMonth;
    if (email) currentEmail = email;
    if (category) currentCategory = stripTotal(category);

    const inferredEmail = email || (snippet ? currentEmail : '');
    const inferredDomain = domainFromEmail(inferredEmail) || currentDomain || domainFromName(rowDomain);
    const inferredName = rowDomain || nameFromEmail(inferredEmail) || inferredDomain || 'Unknown';
    const inferredCategory = category ? stripTotal(category) : (snippet && !domainValue ? currentCategory : 'Uncategorized');
    const inferredDate = dateMonth || (snippet && !domainValue ? currentDate : '');
    const key = inferredDomain
      ? canonicalKey(inferredDomain, '')
      : canonicalKey(inferredName, inferredEmail);

    if (!contactsByKey[key]) {
      contactsByKey[key] = {
        id: key,
        name: inferredName,
        company: companyFromName(inferredName, inferredDomain),
        primaryEmail: inferredEmail,
        emails: [],
        domains: [],
        categories: {},
        latestDate: '',
        latestSort: 0,
        count: 0,
        snippets: [],
        sourceRows: []
      };
    }

    const record = contactsByKey[key];
    record.count += 1;
    addUnique(record.emails, inferredEmail);
    addUnique(record.domains, inferredDomain);
    record.categories[inferredCategory] = (record.categories[inferredCategory] || 0) + 1;

    const sortDate = sortableDate(inferredDate);
    if (sortDate >= record.latestSort) {
      record.latestSort = sortDate;
      record.latestDate = inferredDate;
      if (snippet) record.latestSnippet = snippet;
    }

    if (snippet && record.snippets.length < 8) {
      record.snippets.push(snippet);
    }

    record.sourceRows.push(index + 2);
  });

  const contacts = Object.keys(contactsByKey)
    .map((key) => finalizeContact(contactsByKey[key]))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

  return {
    generatedAt: new Date().toISOString(),
    sheet: CRM_SOURCE_SHEET,
    headers,
    contacts,
    totals: {
      contacts: contacts.length,
      rows: rows.length,
      companies: new Set(contacts.map((contact) => contact.company).filter(Boolean)).size,
      emails: contacts.reduce((sum, contact) => sum + contact.emails.length, 0),
      categories: categoryTotals(contacts)
    }
  };
}

function finalizeContact(record) {
  const topCategory = Object.keys(record.categories).sort((a, b) => record.categories[b] - record.categories[a])[0] || 'Uncategorized';
  const primaryDomain = record.domains[0] || domainFromEmail(record.primaryEmail) || '';
  const domain = inferDomain(topCategory, record.name, primaryDomain);

  return {
    id: record.id,
    name: record.name,
    company: record.company,
    primaryEmail: record.primaryEmail,
    emails: record.emails.filter(Boolean),
    domains: record.domains.filter(Boolean),
    logoDomain: primaryDomain,
    category: topCategory,
    categoryCounts: record.categories,
    domain,
    type: inferType(record.name, record.primaryEmail, topCategory),
    latestDate: record.latestDate,
    count: record.count,
    latestSnippet: record.latestSnippet || record.snippets[0] || '',
    snippets: record.snippets,
    sourceRows: record.sourceRows
  };
}

function emptyTotals() {
  return { contacts: 0, rows: 0, companies: 0, emails: 0, categories: {} };
}

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stripTotal(value) {
  return clean(value).replace(/\s+Total$/i, '').trim();
}

function canonicalKey(name, email) {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  if (normalizedEmail) return normalizedEmail;
  return stripTotal(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'unknown';
}

function nameFromEmail(email) {
  const local = String(email || '').split('@')[0] || '';
  return local
    .replace(/[._+-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function domainFromEmail(email) {
  const parts = String(email || '').toLowerCase().split('@');
  return parts.length === 2 ? parts[1].trim() : '';
}

function domainFromName(name) {
  const maybeDomain = String(name || '').match(/\b[a-z0-9.-]+\.[a-z]{2,}\b/i);
  return maybeDomain ? maybeDomain[0].toLowerCase() : '';
}

function companyFromName(name, domain) {
  const cleaned = stripTotal(name);
  if (cleaned && !/^(donotreply|no reply|do not reply|admin)$/i.test(cleaned)) return cleaned;
  if (!domain) return cleaned || 'Unknown';
  return domain
    .split('.')
    .filter((part) => !['com', 'org', 'net', 'io', 'co', 'edu', 'gov', 'mail', 'email'].includes(part))
    .slice(0, 2)
    .join(' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || domain;
}

function addUnique(list, value) {
  if (value && !list.includes(value)) list.push(value);
}

function sortableDate(dateMonth) {
  const match = String(dateMonth || '').match(/^(\d{4})-([A-Za-z]{3})/);
  if (!match) return 0;
  const months = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  return Number(match[1]) * 100 + (months[match[2]] || 0);
}

function inferType(name, email, category) {
  const text = [name, email, category].join(' ').toLowerCase();
  if (text.includes('newsletter')) return 'Newsletter';
  if (text.includes('gov') || text.includes('nasa') || text.includes('.gov')) return 'Government';
  if (text.includes('event') || text.includes('gdg') || text.includes('community')) return 'Community';
  if (email && /^(hello|support|info|noreply|no-reply|donotreply|admin|billing|alerts)/i.test(email.split('@')[0])) return 'Service';
  return 'Contact';
}

function inferDomain(category, name, emailDomain) {
  const text = [category, name, emailDomain].join(' ').toLowerCase();
  if (/job|career|linkedin|indeed|glassdoor|workable|upwork/.test(text)) return 'Work';
  if (/google|gdg|gdsc|nasa|event|eventbrite|luma|meetup|community|hackathon|space/.test(text)) return 'Projects';
  if (/bank|credit|bill|payment|invoice|receipt|order|shipping|ups|usps|fedex|rocket|wells|acorns/.test(text)) return 'Personal';
  if (/health|medical|patient|clinic|fitness|lab|plasma|doctor/.test(text)) return 'Health';
  if (/github|openai|ai|developer|zapier|reclaim|miro|canva|dropbox|adobe|notion/.test(text)) return 'Growth';
  return 'Systems';
}

function categoryTotals(contacts) {
  return contacts.reduce((totals, contact) => {
    Object.keys(contact.categoryCounts).forEach((category) => {
      totals[category] = (totals[category] || 0) + contact.categoryCounts[category];
    });
    return totals;
  }, {});
}
