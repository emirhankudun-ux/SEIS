const STORE_KEY = "seis.search.center.v1";

const safetyFlags = Object.freeze({
  networkRequested: false,
  liveWebSearch: false,
  providerCalled: false,
  filesystemRead: false,
});

const resultData = {
  AI: [
    {
      id: "ai-routing",
      title: "SEIS Model Router",
      source: "SEIS AI",
      type: "Task routing",
      status: "Real",
      statusClass: "real",
      summary: "Route coding, design, and review tasks to policy-aware lanes based on risk and task type.",
      detail: [
        "Routes include Plan, Build, Review, and Validate lanes.",
        "Each route exposes explicit gate and approval context.",
        "No provider network call occurs in this demo view.",
      ],
      action: "Open Router Console",
    },
    {
      id: "ai-command",
      title: "Command Draft Center",
      source: "SEIS AI",
      type: "Prompt shell",
      status: "Mock",
      statusClass: "mock",
      summary: "Generate deterministic draft responses for mission planning and execution notes.",
      detail: [
        "Draft text is local deterministic logic only.",
        "No API key usage.",
        "Useful for mission rehearsal and task handoff.",
      ],
      action: "Create Draft",
    },
  ],
  Web: [
    {
      id: "web-pages",
      title: "SEIS Product Pages",
      source: "SEIS Website",
      type: "Site index",
      status: "Real",
      statusClass: "real",
      summary: "Core pages for AI, Search, Design, Cloud, and Store surfaces.",
      detail: [
        "Page list is precomputed in-browser.",
        "Each entry includes section, destination, and readiness state.",
      ],
      action: "Open Site Route",
    },
    {
      id: "web-demo",
      title: "Linux-like Demo Index",
      source: "SEIS Website",
      type: "Demo path",
      status: "Planned",
      statusClass: "blocked",
      summary: "Direct route from Website index into SEIS Core modules.",
      detail: [
        "Planned wiring to ensure a single authoritative entry point.",
        "Will require route-level QA before claiming as integrated.",
      ],
      action: "Review Plan",
    },
  ],
  Code: [
    {
      id: "code-ide",
      title: "SEIS Code IDE",
      source: "SEIS Code",
      type: "Repository panel",
      status: "Real",
      statusClass: "real",
      summary: "Open a safe mock IDE with file explorer, terminal, and AI command rail.",
      detail: [
        "No disk writes.",
        "Command history is session local.",
        "Supports keyboard-friendly tab switching.",
      ],
      action: "Open IDE",
    },
    {
      id: "code-grep",
      title: "Repository Search",
      source: "SEIS Code",
      type: "Content query",
      status: "Planned",
      statusClass: "blocked",
      summary: "Real grep and symbol scan across repo files requires tool-plane connector.",
      detail: [
        "Planned behind explicit approval.",
        "No filesystem read attempts in this browser demo.",
      ],
      action: "Open Connector Plan",
    },
  ],
  Design: [
    {
      id: "design-studio",
      title: "SEIS Design Studio",
      source: "SEIS Design",
      type: "Canvas workspace",
      status: "Real",
      statusClass: "real",
      summary: "Preview design tokens, components, and prototype cards with interactive controls.",
      detail: [
        "Token controls update canvas locally.",
        "No asset exports or uploads in this view.",
      ],
      action: "Open Studio",
    },
    {
      id: "design-tokens",
      title: "Shared Token Library",
      source: "SEIS Design",
      type: "Design system",
      status: "Mock",
      statusClass: "mock",
      summary: "Deterministic seed for spacing, palette, shadow, and typography modes.",
      detail: [
        "Useful for design demos and onboarding.",
        "Not a replacement for production token governance.",
      ],
      action: "Review Tokens",
    },
  ],
  Cloud: [
    {
      id: "cloud-ssh",
      title: "Cloud / SSH Control",
      source: "SEIS Cloud",
      type: "Infrastructure",
      status: "Real",
      statusClass: "real",
      summary: "Shows connected state, mock-safe sessions, and command audit model.",
      detail: [
        "No secret material is loaded.",
        "State remains local unless explicit backend layer is enabled.",
      ],
      action: "Open Cloud Panel",
    },
    {
      id: "cloud-deploy",
      title: "Deployment Health",
      source: "SEIS Cloud",
      type: "Operations",
      status: "Blocked",
      statusClass: "blocked",
      summary: "Live deployment reads need signed backend endpoints and read-only mode controls.",
      detail: ["Planned for governed integration lane."],
      action: "Review Gate",
    },
  ],
  Apps: [
    {
      id: "apps-launchpad",
      title: "SEIS Launchpad",
      source: "SEIS Apps",
      type: "App launcher",
      status: "Real",
      statusClass: "real",
      summary: "Open key SEIS modules from one central launch surface.",
      detail: [
        "Supports app selection and quick actions in-browser.",
        "Planned transition to direct app open events.",
      ],
      action: "Open Launchpad",
    },
    {
      id: "apps-store",
      title: "App Store",
      source: "SEIS Apps",
      type: "Distribution",
      status: "Mock",
      statusClass: "mock",
      summary: "Catalog preview with install/enable mock toggles.",
      detail: [
        "No package fetch occurs.",
        "State saved as preview contract only.",
      ],
      action: "Open Store",
    },
  ],
  Plugins: [
    {
      id: "plugins-registry",
      title: "Plugin Registry",
      source: "Plugins",
      type: "Provider list",
      status: "Real",
      statusClass: "real",
      summary: "Read plugin metadata and show install readiness states.",
      detail: [
        "All plugin entries are curated demo fixtures.",
        "Install action remains mock.",
      ],
      action: "Open Registry",
    },
    {
      id: "plugins-security",
      title: "Plugin Security Notes",
      source: "Plugins",
      type: "Policy",
      status: "Planned",
      statusClass: "blocked",
      summary: "Automated plugin signature checks are staged behind backend validation.",
      detail: [
        "Planned to include allow-list and trust chain display.",
      ],
      action: "Open Policy",
    },
  ],
  Files: [
    {
      id: "files-manager",
      title: "Files Manager",
      source: "SEIS Files",
      type: "Workspace",
      status: "Real",
      statusClass: "real",
      summary: "Browse seeded folders and open recent workspace samples.",
      detail: [
        "All content is browser local.",
        "No direct disk read/write in this center.",
      ],
      action: "Open Files",
    },
    {
      id: "files-recent",
      title: "Recent File Index",
      source: "SEIS Files",
      type: "Navigation",
      status: "Mock",
      statusClass: "mock",
      summary: "Mock recent files are seeded for fast demo jumps and audit continuity.",
      detail: [
        "Good for first-run demos.",
        "Future connector will sync with local filesystem with explicit approval.",
      ],
      action: "Open Recent",
    },
  ],
};

const tabsOrder = ["AI", "Web", "Code", "Design", "Cloud", "Apps", "Plugins", "Files"];

const fallbackState = {
  query: "",
  activeTab: "AI",
  selectedResultId: "ai-routing",
  recentQueries: [],
  selectedType: "Real",
};

let state = loadState();

const dom = {
  searchInput: document.querySelector("#searchInput"),
  searchButton: document.querySelector("#searchButton"),
  tabs: document.querySelector("#searchTabs"),
  resultList: document.querySelector("#resultList"),
  resultCount: document.querySelector("#resultCount"),
  resultHeading: document.querySelector("#resultHeading"),
  previewTitle: document.querySelector("#previewTitle"),
  previewSummary: document.querySelector("#previewSummary"),
  previewMeta: document.querySelector("#previewMeta"),
  previewBody: document.querySelector("#previewBody"),
  previewActions: document.querySelector("#previewActions"),
  selectedSource: document.querySelector("#selectedSource"),
  recentQueries: document.querySelector("#recentQueries"),
};

const recentQueryLimit = 5;

function loadState() {
  try {
    const cached = localStorage.getItem(STORE_KEY);
    if (!cached) return structuredClone(fallbackState);
    return { ...fallbackState, ...JSON.parse(cached) };
  } catch {
    return structuredClone(fallbackState);
  }
}

function persistState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateRecentQueries() {
  dom.recentQueries.innerHTML = state.recentQueries
    .map((query) => `
      <button class="command-chip" type="button" data-query="${escapeHtml(query)}" aria-label="Repeat query ${escapeHtml(query)}">${escapeHtml(query)}</button>
    `.trim())
    .join("");
}

function recordQuery(query) {
  const normalized = String(query || "").trim();
  if (!normalized) return;
  state.recentQueries = [normalized, ...state.recentQueries.filter((item) => item !== normalized)].slice(0, recentQueryLimit);
}

function activeResults() {
  const source = resultData[state.activeTab] || [];
  const query = String(state.query || "").toLowerCase().trim();
  if (!query) return source;
  return source.filter((entry) => {
    const hay = `${entry.title} ${entry.source} ${entry.type} ${entry.summary} ${(entry.detail || []).join(" ")}`.toLowerCase();
    return hay.includes(query);
  });
}

function resultBadge(statusClass, status) {
  return `<span class="status-pill ${statusClass}">${escapeHtml(status)}</span>`;
}

function renderResults() {
  const results = activeResults();
  if (!results.length) {
    dom.resultList.innerHTML = `<div class="result-item"><p class="result-summary">No results match this query. Try one of the quick commands.</p></div>`;
    state.selectedResultId = "";
    dom.resultCount.textContent = "0";
    renderPreview();
    persistState();
    return;
  }

  if (!results.some((result) => result.id === state.selectedResultId)) {
    state.selectedResultId = results[0].id;
  }

  dom.resultCount.textContent = `${results.length} result${results.length > 1 ? "s" : ""}`;
  dom.resultHeading.textContent = `${state.activeTab} results`;

  dom.resultList.innerHTML = results
    .map((result) => {
      const selected = result.id === state.selectedResultId ? " is-selected" : "";
      return `
        <button class="result-item${selected}" type="button" data-result="${escapeHtml(result.id)}">
          <div class="result-title">
            <h3>${escapeHtml(result.title)}</h3>
            ${resultBadge(result.statusClass, result.status)}
          </div>
          <p class="result-summary">${escapeHtml(result.summary)}</p>
          <div class="result-meta">${escapeHtml(result.source)} • ${escapeHtml(result.type)}</div>
        </button>
      `;
    })
    .join("");

  renderPreview();
  persistState();
}

function renderPreview() {
  const all = activeResults();
  const result = all.find((entry) => entry.id === state.selectedResultId) || all[0];

  if (!result) {
    dom.previewTitle.textContent = "No result selected.";
    dom.previewSummary.textContent = "Use search, tab switch, or command chips to load a result.";
    dom.previewMeta.textContent = "";
    dom.previewBody.textContent = "No preview loaded.";
    dom.previewActions.innerHTML = "";
    dom.selectedSource.textContent = "No result";
    dom.selectedSource.className = "status-pill mock";
    return;
  }

  state.selectedResultId = result.id;

  dom.previewTitle.textContent = `${result.source}: ${result.title}`;
  dom.previewSummary.textContent = result.summary;
  dom.previewMeta.innerHTML = `
    <div>Type: ${escapeHtml(result.type)}</div>
    <div>Status: ${escapeHtml(result.status)}</div>
    <div>Scope: ${escapeHtml(state.activeTab)} search tab</div>
    <div>Safety flags: networkRequested=${safetyFlags.networkRequested}, liveWebSearch=${safetyFlags.liveWebSearch}, providerCalled=${safetyFlags.providerCalled}, filesystemRead=${safetyFlags.filesystemRead}</div>
  `;
  dom.previewBody.textContent = result.detail.map((line) => `• ${line}`).join("\n");
  dom.previewActions.innerHTML = `<button type="button" data-action="${escapeHtml(result.id)}">${escapeHtml(result.action)}</button>`;

  dom.selectedSource.textContent = result.status;
  dom.selectedSource.className = `status-pill ${result.statusClass}`;
  updateAriaSelection();
}

function updateAriaSelection() {
  document.querySelectorAll("[data-result]").forEach((item) => {
    item.setAttribute("aria-selected", item.dataset.result === state.selectedResultId ? "true" : "false");
  });
}

function renderTabs() {
  dom.tabs.innerHTML = tabsOrder
    .map((tab) => `
      <button class="search-tab${tab === state.activeTab ? " is-active" : ""}" data-tab="${tab}" type="button" role="tab" aria-selected="${tab === state.activeTab}">${tab}</button>
    `)
    .join("");
}

function applySearch(query) {
  state.query = String(query || "");
  if (state.query.length > 1) recordQuery(state.query);
  renderResults();
  dom.searchInput.focus();
}

function setActiveTab(tab) {
  state.activeTab = tab;
  state.selectedResultId = resultData[tab]?.[0]?.id || "";
  renderTabs();
  renderResults();
}

function openAction() {
  const current = activeResults().find((entry) => entry.id === state.selectedResultId);
  if (!current) return;
  window.alert(`${current.action} for ${current.title}`);
}

function handleResultClick(event) {
  const button = event.target.closest("[data-result]");
  if (!button) return;
  state.selectedResultId = button.dataset.result;
  renderResults();
}

function handleTabClick(event) {
  const button = event.target.closest("[data-tab]");
  if (!button) return;
  setActiveTab(button.dataset.tab);
}

function handleCommandClick(event) {
  const button = event.target.closest("[data-query]");
  if (!button) return;
  const query = button.dataset.query;
  dom.searchInput.value = query;
  applySearch(query);
}

function handleKeyboardShortcuts(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    dom.searchInput.focus();
    return;
  }

  const list = activeResults();
  if (!list.length) return;

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const index = list.findIndex((item) => item.id === state.selectedResultId);
    const clampIndex = (index < 0 ? 0 : index);
    const next = event.key === "ArrowDown" ? clampIndex + 1 : clampIndex - 1;
    const safe = (next + list.length) % list.length;
    state.selectedResultId = list[safe].id;
    renderResults();
    return;
  }

  if (event.key === "Enter" && document.activeElement?.id === "searchInput") {
    applySearch(dom.searchInput.value);
  }
}

function runBootstrap() {
  dom.searchInput.value = state.query || "";
  renderTabs();
  renderRecentQueryEvents();
  renderResults();
}

function renderRecentQueryEvents() {
  updateRecentQueries();
}


dom.searchButton.addEventListener("click", (event) => {
  event.preventDefault();
  applySearch(dom.searchInput.value);
});

dom.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderResults();
});

dom.searchInput.addEventListener("keydown", handleKeyboardShortcuts);

dom.tabs.addEventListener("click", handleTabClick);

dom.resultList.addEventListener("click", handleResultClick);
dom.resultList.addEventListener("click", (event) => {
  if (event.target.closest(".result-item")) {
    renderResults();
  }
});

dom.resultList.addEventListener("dblclick", handleResultClick);

dom.resultList.addEventListener("focusin", () => {
  // intentful for screen reader flow only
});

dom.previewActions.addEventListener("click", (event) => {
  if (event.target.closest("[data-action]")) {
    openAction();
  }
});
dom.recentQueries.addEventListener("click", handleCommandClick);
dom.tabs.addEventListener("mousedown", (event) => {
  const tab = event.target.closest("[data-tab]");
  if (tab) {
    applySearch("");
  }
});

dom.searchButton.closest(".search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  applySearch(dom.searchInput.value);
});

document.querySelectorAll(".command-chip").forEach((button) => {
  button.addEventListener("click", handleCommandClick);
});

dom.searchInput.addEventListener("focus", () => {
  dom.searchInput.select();
});

runBootstrap();
