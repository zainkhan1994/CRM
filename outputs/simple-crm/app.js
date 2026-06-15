const contacts = [
  {
    name: "Google Business Profile",
    company: "Google",
    email: "businessprofile-noreply@google.com",
    lastContact: "2024-04-30",
    category: "Reference",
    domain: "Work",
    type: "Service",
    source: "Gmail 2026",
    count: 2,
    subject: "Message from Adrian Ellis / Business Profile customer messages",
    summary: "Google Business Profile messages tied to local business/property work.",
    nextAction: "Review only when tied to an active property or client.",
    priority: "Mid"
  },
  {
    name: "Google Cloud",
    company: "Google",
    email: "CloudPlatform-noreply@google.com",
    lastContact: "2024-04-30",
    category: "Event",
    domain: "Growth",
    type: "Service",
    source: "Gmail 2026",
    count: 3,
    subject: "Cloud Digital Leader registration and Google Cloud program updates",
    summary: "Cloud learning, partner training, and developer ecosystem messages.",
    nextAction: "Keep only current certification or event messages visible.",
    priority: "Mid"
  },
  {
    name: "GDSC Event Platform",
    company: "Google Developer Groups",
    email: "noreply@gdsc.community.dev",
    lastContact: "2024-04-30",
    category: "Event",
    domain: "Projects",
    type: "Community",
    source: "Gmail 2026",
    count: 4,
    subject: "Build With AI and web development training events",
    summary: "Google developer community event stream.",
    nextAction: "Use for GDG/GDSC event history and contacts.",
    priority: "High"
  },
  {
    name: "Google AI Studio",
    company: "Google",
    email: "aistudio-noreply@google.com",
    lastContact: "2026-06-10",
    category: "Action",
    domain: "Growth",
    type: "Service",
    source: "Gmail 2026",
    count: 1,
    subject: "Secure Gemini API access by Jun 19, 2026",
    summary: "Time-sensitive developer account/security item.",
    nextAction: "Handle API access/security before deadline.",
    priority: "High"
  },
  {
    name: "GDG Tulsa",
    company: "Google Developer Groups",
    email: "gdg-tulsa@community.dev",
    lastContact: "2026-06-11",
    category: "Event",
    domain: "Projects",
    type: "Community",
    source: "Gmail 2026",
    count: 6,
    subject: "Build with AI, Google I/O recap, organizer messages",
    summary: "Core community leadership stream.",
    nextAction: "Separate active organizer work from event newsletters.",
    priority: "High"
  },
  {
    name: "Rocket Money",
    company: "Rocket Money",
    email: "hello@insights.rocketmoney.com",
    lastContact: "2024-04-30",
    category: "Transaction",
    domain: "Personal",
    type: "Service",
    source: "Gmail 2026",
    count: 2,
    subject: "AppleCare+ cancellation request and weekly spending reports",
    summary: "Subscription and spending-monitoring stream.",
    nextAction: "Use only for subscription cancellation proof or finance review.",
    priority: "Mid"
  },
  {
    name: "Bank of America",
    company: "Bank of America",
    email: "onlinebanking@ealerts.bankofamerica.com",
    lastContact: "2024-04-30",
    category: "Transaction",
    domain: "Personal",
    type: "Service",
    source: "Gmail 2026",
    count: 4,
    subject: "Balance, withdrawal, and account credit alerts",
    summary: "Bank alerts, account activity, and financial evidence.",
    nextAction: "Keep as finance evidence, not relationship CRM.",
    priority: "High"
  },
  {
    name: "Credit One Bank",
    company: "Credit One",
    email: "NoReply@emails.creditonebank.com",
    lastContact: "2024-04-30",
    category: "Reference",
    domain: "Personal",
    type: "Service",
    source: "Gmail 2026",
    count: 2,
    subject: "Offer and customer feedback messages",
    summary: "Credit card/promotional/support-related stream.",
    nextAction: "Keep feedback/support only; ignore promos.",
    priority: "Mid"
  },
  {
    name: "Midjourney Billing Support",
    company: "Midjourney",
    email: "support@midjourney.zendesk.com",
    lastContact: "2024-04-30",
    category: "Event",
    domain: "Systems",
    type: "Service",
    source: "Gmail 2026",
    count: 2,
    subject: "Billing support request received",
    summary: "Support ticket and customer portal messages.",
    nextAction: "Treat as support/evidence if refund or billing issue is active.",
    priority: "Mid"
  },
  {
    name: "HubSpot",
    company: "HubSpot",
    email: "noreply@notifications.hubspot.com",
    lastContact: "2024-04-30",
    category: "Reference",
    domain: "Work",
    type: "Service",
    source: "Gmail 2026",
    count: 12,
    subject: "New unassigned conversations from many senders",
    summary: "Routing layer, not a person. Useful as a signal that another system captured customer messages.",
    nextAction: "Use as source metadata; avoid treating as a contact.",
    priority: "Low"
  },
  {
    name: "LinkedIn Job Alerts",
    company: "LinkedIn",
    email: "jobalerts-noreply@linkedin.com",
    lastContact: "2024-04-30",
    category: "Career",
    domain: "Work",
    type: "Service",
    source: "Gmail 2026",
    count: 4,
    subject: "Project manager, sales, and marketing job alerts",
    summary: "Career opportunity stream.",
    nextAction: "Only surface current job searches or strong matches.",
    priority: "Mid"
  },
  {
    name: "GitHub",
    company: "GitHub",
    email: "noreply@github.com",
    lastContact: "2024-04-30",
    category: "Transaction",
    domain: "Growth",
    type: "Service",
    source: "Gmail 2026",
    count: 1,
    subject: "GitHub Copilot trial ending",
    summary: "Developer tooling, billing, and account notices.",
    nextAction: "Track billing/security separately from code notifications.",
    priority: "Mid"
  },
  {
    name: "OpenAI Developer Forum",
    company: "OpenAI",
    email: "notifications@openai1.discoursemail.com",
    lastContact: "2024-04-30",
    category: "Reference",
    domain: "Growth",
    type: "Community",
    source: "Gmail 2026",
    count: 1,
    subject: "Memory feature discussion",
    summary: "AI/developer reading stream.",
    nextAction: "Keep only threads connected to current builds.",
    priority: "Low"
  },
  {
    name: "Eventbrite",
    company: "Eventbrite",
    email: "noreply@order.eventbrite.com",
    lastContact: "2024-04-30",
    category: "Event",
    domain: "Projects",
    type: "Service",
    source: "Gmail 2026",
    count: 2,
    subject: "Tickets and event registrations",
    summary: "Event attendance and community discovery stream.",
    nextAction: "Use for upcoming events and past attendance evidence.",
    priority: "Mid"
  },
  {
    name: "Greentown Labs",
    company: "Greentown Labs",
    email: "jkirkpatrick@greentownlabs.com",
    lastContact: "2024-04-30",
    category: "Event",
    domain: "Projects",
    type: "Community",
    source: "Gmail 2026",
    count: 1,
    subject: "Climatetech summit save-the-date",
    summary: "Startup, climate, and event networking.",
    nextAction: "Keep if relevant to community or venture pipeline.",
    priority: "Low"
  },
  {
    name: "Zapier Events",
    company: "Zapier",
    email: "events@send.zapier.com",
    lastContact: "2024-04-30",
    category: "Event",
    domain: "Growth",
    type: "Service",
    source: "Gmail 2026",
    count: 2,
    subject: "AI + Zapier webinar",
    summary: "Automation learning and event stream.",
    nextAction: "Keep if tied to an active automation build.",
    priority: "Low"
  },
  {
    name: "Reclaim.ai",
    company: "Reclaim.ai",
    email: "support@reclaim.ai",
    lastContact: "2024-04-30",
    category: "Event",
    domain: "Systems",
    type: "Service",
    source: "Gmail 2026",
    count: 1,
    subject: "Scheduling links product update",
    summary: "Scheduling and productivity tooling.",
    nextAction: "Reference only when rebuilding scheduling system.",
    priority: "Low"
  },
  {
    name: "UPS",
    company: "UPS",
    email: "mcinfo@ups.com",
    lastContact: "2024-04-30",
    category: "Transaction",
    domain: "Personal",
    type: "Service",
    source: "Gmail 2026",
    count: 2,
    subject: "Package delivery and scheduled delivery notices",
    summary: "Shipping evidence and order tracking.",
    nextAction: "Use only for active orders or proof of delivery.",
    priority: "Low"
  },
  {
    name: "Veyer",
    company: "Veyer",
    email: "alerts+veyer@getconvey.com",
    lastContact: "2024-04-30",
    category: "Transaction",
    domain: "Work",
    type: "Service",
    source: "Gmail 2026",
    count: 2,
    subject: "Office Depot / ODP delivery updates",
    summary: "Order fulfillment and delivery confirmation stream.",
    nextAction: "Keep with receipts/orders when needed.",
    priority: "Low"
  },
  {
    name: "Darcy from Rewatch",
    company: "Rewatch",
    email: "team@rewatch.com",
    lastContact: "2024-04-30",
    category: "Partner",
    domain: "Work",
    type: "Company",
    source: "Gmail 2026",
    count: 1,
    subject: "The future of collaboration is Rewatch",
    summary: "Potential vendor/partner touchpoint.",
    nextAction: "Enrich only if Rewatch becomes relevant again.",
    priority: "Low"
  },
  {
    name: "Tulsa Remote",
    company: "Tulsa Remote",
    email: "notification@slack.com",
    lastContact: "2024-04-30",
    category: "Reference",
    domain: "Projects",
    type: "Community",
    source: "Gmail 2026",
    count: 1,
    subject: "Slack community notifications",
    summary: "Local community and Tulsa network stream.",
    nextAction: "Keep only threads tied to people or opportunities.",
    priority: "Mid"
  },
  {
    name: "Google Photos",
    company: "Google",
    email: "noreply-photos@google.com",
    lastContact: "2024-04-30",
    category: "Reference",
    domain: "Systems",
    type: "Service",
    source: "Gmail 2026",
    count: 1,
    subject: "Backed up photos notice",
    summary: "Personal data/source-of-truth signal.",
    nextAction: "Reference only during data export or photo cleanup.",
    priority: "Low"
  },
  {
    name: "Public Service Company of Oklahoma",
    company: "PSO",
    email: "communications@aep-email.com",
    lastContact: "2024-04-30",
    category: "Reference",
    domain: "Personal",
    type: "Service",
    source: "Gmail 2026",
    count: 1,
    subject: "Bill available",
    summary: "Utility billing and household record.",
    nextAction: "Keep only bill/payment evidence.",
    priority: "Mid"
  },
  {
    name: "Glassdoor Jobs",
    company: "Glassdoor",
    email: "noreply@glassdoor.com",
    lastContact: "2024-04-30",
    category: "Career",
    domain: "Work",
    type: "Service",
    source: "Gmail 2026",
    count: 1,
    subject: "Daily job listings",
    summary: "Career discovery stream.",
    nextAction: "Suppress unless actively job searching.",
    priority: "Low"
  },
  {
    name: "Upwork",
    company: "Upwork",
    email: "upwork@email.upwork.com",
    lastContact: "2024-04-30",
    category: "Reference",
    domain: "Work",
    type: "Service",
    source: "Gmail 2026",
    count: 1,
    subject: "Tips to improve proposals",
    summary: "Freelance opportunity and marketplace stream.",
    nextAction: "Keep only if connected to live work.",
    priority: "Low"
  },
  {
    name: "NASA OSBP via Eventbrite",
    company: "NASA",
    email: "noreply@campaign.eventbrite.com",
    lastContact: "2025-07-01",
    category: "Event",
    domain: "Projects",
    type: "Government",
    source: "Full Contact Database",
    count: 8,
    subject: "NASA small business, industrial base, and learning events",
    summary: "Aerospace/civic opportunity stream with repeated webinar/event invitations.",
    nextAction: "Track as project opportunity, not generic newsletter.",
    priority: "High"
  }
];

const domainColors = {
  Personal: "var(--red)",
  Health: "var(--amber)",
  Projects: "var(--purple)",
  Work: "var(--blue)",
  Growth: "var(--green)",
  Systems: "var(--gray)"
};

const saved = JSON.parse(localStorage.getItem("zainCrmState") || "{}");
let activeDomain = "All";
let selectedId = slug(contacts[0].email);

const cards = document.getElementById("cards");
const detail = document.getElementById("detail");
const searchInput = document.getElementById("searchInput");
const domainTabs = document.getElementById("domainTabs");
const categorySelect = document.getElementById("categorySelect");
const prioritySelect = document.getElementById("prioritySelect");

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function localRecord(contact) {
  const id = slug(contact.email);
  return {
    ...contact,
    id,
    priority: saved[id]?.priority || contact.priority,
    nextAction: saved[id]?.nextAction || contact.nextAction,
    notes: saved[id]?.notes || ""
  };
}

function buildTabs() {
  const domains = ["All", ...new Set(contacts.map((contact) => contact.domain))];
  domainTabs.innerHTML = domains.map((domain) => (
    `<button type="button" role="tab" aria-selected="${domain === activeDomain}" data-domain="${domain}">${domain}</button>`
  )).join("");

  domainTabs.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeDomain = button.dataset.domain;
      render();
    });
  });
}

function buildCategoryFilter() {
  const categories = [...new Set(contacts.map((contact) => contact.category))].sort();
  categorySelect.innerHTML = `<option value="All">All categories</option>${categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("")}`;
}

function filteredContacts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const priority = prioritySelect.value;

  return contacts.map(localRecord).filter((contact) => {
    const haystack = [
      contact.name,
      contact.company,
      contact.email,
      contact.subject,
      contact.summary,
      contact.category,
      contact.domain,
      contact.type
    ].join(" ").toLowerCase();

    return (activeDomain === "All" || contact.domain === activeDomain)
      && (category === "All" || contact.category === category)
      && (priority === "All" || contact.priority === priority)
      && (!query || haystack.includes(query));
  });
}

function renderCards(list) {
  document.getElementById("visibleCount").textContent = list.length;

  if (!list.length) {
    cards.innerHTML = `<div class="detail-empty">No matching contacts.</div>`;
    return;
  }

  if (!list.some((contact) => contact.id === selectedId)) {
    selectedId = list[0].id;
  }

  cards.innerHTML = list.map((contact) => {
    const color = domainColors[contact.domain] || "var(--gray)";
    return `
      <article class="card ${contact.id === selectedId ? "is-active" : ""}" data-id="${contact.id}" tabindex="0">
        <div class="card-top">
          <div class="avatar" style="background:${color}">${initials(contact.name)}</div>
          <span class="priority ${contact.priority}">${contact.priority}</span>
        </div>
        <h2>${escapeHtml(contact.name)}</h2>
        <p class="subject">${escapeHtml(contact.subject)}</p>
        <div class="chips">
          <span class="chip">${contact.domain}</span>
          <span class="chip">${contact.category}</span>
          <span class="chip">${contact.count} email${contact.count === 1 ? "" : "s"}</span>
        </div>
      </article>
    `;
  }).join("");

  cards.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedId = card.dataset.id;
      render();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectedId = card.dataset.id;
        render();
      }
    });
  });
}

function renderDetail(list) {
  const contact = list.find((item) => item.id === selectedId);
  if (!contact) {
    detail.innerHTML = `<div class="detail-empty">Select a contact.</div>`;
    return;
  }

  const color = domainColors[contact.domain] || "var(--gray)";
  detail.innerHTML = `
    <div class="detail-head">
      <div class="avatar" style="background:${color}">${initials(contact.name)}</div>
      <div>
        <h2>${escapeHtml(contact.name)}</h2>
        <div class="muted">${escapeHtml(contact.company)} · ${escapeHtml(contact.type)}</div>
      </div>
    </div>

    <div class="chips">
      <span class="chip">${contact.domain}</span>
      <span class="chip">${contact.category}</span>
      <span class="chip">${contact.source}</span>
    </div>

    <div class="field-grid">
      <div class="field"><span>Email</span>${escapeHtml(contact.email)}</div>
      <div class="field"><span>Last Contact</span>${formatDate(contact.lastContact)}</div>
      <div class="field"><span>Email Count</span>${contact.count}</div>
      <div class="field"><span>Priority</span>${contact.priority}</div>
    </div>

    <div class="field">
      <span>Touchpoint Summary</span>
      ${escapeHtml(contact.summary)}
    </div>

    <div class="detail-actions">
      <label>
        Priority
        <select id="editPriority">
          ${["High", "Mid", "Low"].map((value) => `<option value="${value}" ${value === contact.priority ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </label>
      <label>
        Next Action
        <textarea id="editNextAction" rows="3">${escapeHtml(contact.nextAction)}</textarea>
      </label>
      <label>
        Notes
        <textarea id="editNotes" rows="4">${escapeHtml(contact.notes)}</textarea>
      </label>
      <button class="save-state" id="saveState" type="button">Save locally</button>
    </div>

    <p class="source">Latest subject: ${escapeHtml(contact.subject)}</p>
  `;

  document.getElementById("saveState").addEventListener("click", () => {
    saved[contact.id] = {
      priority: document.getElementById("editPriority").value,
      nextAction: document.getElementById("editNextAction").value.trim(),
      notes: document.getElementById("editNotes").value.trim()
    };
    localStorage.setItem("zainCrmState", JSON.stringify(saved));
    render();
  });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function render() {
  buildTabs();
  const list = filteredContacts();
  renderCards(list);
  renderDetail(list);
}

buildCategoryFilter();
searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", render);
prioritySelect.addEventListener("change", render);
render();
