const storageKey = "seis-core-state-v1";

const seedState = {
  activeView: "dashboard",
  activeAgent: "Architect",
  repositoryFilter: "all",
  settings: {
    compact: false,
    reduceMotion: false
  },
  goals: [
    {
      id: "goal-core-interface",
      title: "Ship SEIS Core MVP",
      priority: "High",
      status: "Active",
      risk: "Scope growth across ecosystem modules",
      nextAction: "Lock Phase 1 workflows and validate static app quality"
    },
    {
      id: "goal-governance",
      title: "Keep GitHub source of truth current",
      priority: "High",
      status: "Review",
      risk: "Generated reports may drift after source changes",
      nextAction: "Refresh source-surface reports after final app shape"
    },
    {
      id: "goal-agent-lanes",
      title: "Map AI agent operating modes",
      priority: "Medium",
      status: "Active",
      risk: "Modes become labels without responsibility boundaries",
      nextAction: "Document Architect, Builder, Security, Design, Research lanes"
    }
  ]
};

const repositories = [
  {
    name: "SEIS",
    role: "Core ecosystem",
    health: "Ready",
    docs: 91,
    security: "Review queued",
    tests: "quality gate"
  },
  {
    name: "SEIST",
    role: "Companion surface",
    health: "Review",
    docs: 76,
    security: "policy aligned",
    tests: "smoke checks"
  },
  {
    name: "seis-trusted-marketplace-plugin",
    role: "Plugin lane",
    health: "Ready",
    docs: 84,
    security: "manifest checks",
    tests: "plugin bundle"
  },
  {
    name: "emirhan-kudun-portfolio",
    role: "Public portfolio",
    health: "Review",
    docs: 69,
    security: "static surface",
    tests: "web checks"
  }
];

const documentation = [
  {
    title: "Architecture Notes",
    type: "Architecture",
    status: "Ready",
    summary: "System boundaries, module ownership, and platform decisions."
  },
  {
    title: "ADR Records",
    type: "Decision log",
    status: "Review",
    summary: "Short records for material architecture choices and tradeoffs."
  },
  {
    title: "Roadmap",
    type: "Planning",
    status: "Ready",
    summary: "Phase 1 static app, Phase 2 React/Next, Phase 3 SwiftUI native shell."
  },
  {
    title: "Knowledge Base",
    type: "Memory",
    status: "Active",
    summary: "Reusable operating context, source provenance, and ecosystem notes."
  }
];

const agents = [
  {
    name: "Architect",
    focus: "System boundaries, ADRs, dependency discipline, long-term structure.",
    status: "Ready"
  },
  {
    name: "Builder",
    focus: "Implementation, tests, app surfaces, integration and release readiness.",
    status: "Ready"
  },
  {
    name: "Security",
    focus: "Secrets hygiene, dependency review, access model, policy checks.",
    status: "Review"
  },
  {
    name: "Design",
    focus: "Product hierarchy, accessibility, design system, interaction quality.",
    status: "Ready"
  },
  {
    name: "Research",
    focus: "Primary-source research, compatibility checks, technical evidence.",
    status: "Active"
  }
];

const architectureNodes = [
  ["Interface", "Static Phase 1 shell with dashboard, goals, repos, docs, agents and architecture modules."],
  ["State", "Local browser state with clear data boundaries and no secret storage."],
  ["Governance", "GitHub-first operating rules, main-only posture, source-surface validation."],
  ["Automation", "Quality checks, generated reports, publish readiness, agent handoff."],
  ["Future Web", "React/Next module split when routing, API data, and auth become necessary."],
  ["Native", "SwiftUI macOS application after core workflows stabilize in the static MVP."]
];

const knowledgeItems = [
  ["Repository Memory", "Workspace defaults, branch governance, and SEIS operating rules."],
  ["Research Log", "Primary-source notes for Apple, OpenAI, GitHub and cloud assumptions."],
  ["Decision Ledger", "Tradeoffs, risks, rejected shortcuts, and future migration triggers."],
  ["System Health", "Quality, docs, security, tests and ecosystem readiness indicators."]
];

const viewMeta = {
  dashboard: ["Dashboard", "SEIS operating center", "Manage goals, repositories, architecture decisions, documentation, agents, and system health from one calm surface.", "New Goal"],
  goals: ["Goals", "Goal tracking", "Create goals, edit priority/status, add risks, and keep next actions visible.", "Create Goal"],
  repositories: ["Repositories", "Repository management", "Scan repository health, documentation coverage, security posture, and testing status.", "Refresh"],
  documentation: ["Documentation", "Documentation management", "Track architecture notes, ADR records, roadmap, and knowledge base coverage.", "Add Note"],
  agents: ["Agents", "AI agent management", "Switch operating modes and inspect responsibility boundaries.", "Run Agent"],
  architecture: ["Architecture", "Architecture tracking", "Map system structure, dependencies, decisions, and technical debt.", "Add ADR"],
  knowledge: ["Knowledge", "Knowledge management", "Keep memory, research, and decisions discoverable.", "Capture Note"]
};

let state = loadState();

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    return { ...seedState, ...stored, settings: { ...seedState.settings, ...stored?.settings } };
  } catch {
    return structuredClone(seedState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function statusClass(status) {
  if (status === "Ready" || status === "Active" || status === "Done") return "ready";
  if (status === "Blocked") return "blocked";
  return "attention";
}

function render() {
  document.body.classList.toggle("compact", state.settings.compact);
  document.body.classList.toggle("reduce-motion", state.settings.reduceMotion);
  renderNavigation();
  renderViewHeader();
  renderDashboard();
  renderGoals();
  renderRepositories();
  renderDocumentation();
  renderAgents();
  renderArchitecture();
  renderKnowledge();
  renderInspector();
  updateHealth();
  saveState();
}

function renderNavigation() {
  $$(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === state.activeView);
  });
  $$(".view-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === state.activeView);
  });
}

function renderViewHeader() {
  const [kicker, title, summary, action] = viewMeta[state.activeView];
  $("#view-kicker").textContent = kicker;
  $("#view-title").textContent = title;
  $("#view-summary").textContent = summary;
  $("#primary-action").textContent = action;
}

function renderDashboard() {
  const activeGoals = state.goals.filter((goal) => goal.status !== "Done");
  const readyRepos = repositories.filter((repo) => repo.health === "Ready").length;
  const docsReady = documentation.filter((doc) => doc.status === "Ready").length;
  const reviewCount = state.goals.filter((goal) => goal.status === "Review" || goal.status === "Blocked").length +
    repositories.filter((repo) => repo.health !== "Ready").length;

  $("#metric-grid").innerHTML = [
    ["Active Goals", activeGoals.length, "tracked outcomes"],
    ["Repos Ready", `${readyRepos}/${repositories.length}`, "source surfaces"],
    ["Docs Ready", `${docsReady}/${documentation.length}`, "knowledge areas"],
    ["Reviews", reviewCount, "attention signals"]
  ].map(([label, value, detail]) => `
    <article class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${detail}</small>
    </article>
  `).join("");

  $("#dashboard-goals").innerHTML = activeGoals.slice(0, 4).map((goal) => `
    <article class="goal-row">
      <div>
        <strong>${goal.title}</strong>
        <p>${goal.nextAction}</p>
      </div>
      <span class="status-pill ${statusClass(goal.status)}">${goal.status}</span>
    </article>
  `).join("");

  $("#dashboard-repos").innerHTML = repositories.map((repo) => `
    <article class="repo-health-row">
      <strong>${repo.name}</strong>
      <p>${repo.role}</p>
      <div class="progress-track" aria-label="${repo.name} documentation coverage">
        <span class="progress-fill" style="width:${repo.docs}%"></span>
      </div>
    </article>
  `).join("");

  $("#architecture-alerts").innerHTML = [
    ["Generated reports", "Refresh after source-surface changes."],
    ["Phase boundary", "Keep Phase 1 dependency-free until workflow fit is clear."],
    ["Agent modes", "Document role boundaries before automation expansion."]
  ].map(([title, detail]) => `
    <article class="alert-card">
      <strong>${title}</strong>
      <p>${detail}</p>
    </article>
  `).join("");
}

function renderGoals() {
  $("#goal-board").innerHTML = state.goals.map((goal) => `
    <article class="goal-card">
      <div class="card-topline">
        <h3>${goal.title}</h3>
        <span class="status-pill ${statusClass(goal.status)}">${goal.status}</span>
      </div>
      <div class="meta-row">
        <span class="meta-chip">${goal.priority}</span>
        <span class="meta-chip">Risk: ${goal.risk || "None logged"}</span>
      </div>
      <p>${goal.nextAction || "No next action yet."}</p>
      <div class="meta-row">
        <button class="secondary-button" type="button" data-goal-status="${goal.id}" data-next="Review">Review</button>
        <button class="secondary-button" type="button" data-goal-status="${goal.id}" data-next="Done">Done</button>
      </div>
    </article>
  `).join("");
}

function renderRepositories() {
  const filtered = repositories.filter((repo) => state.repositoryFilter === "all" || repo.health === state.repositoryFilter);
  $("#repository-grid").innerHTML = filtered.map((repo) => `
    <article class="repo-card">
      <div class="card-topline">
        <h3>${repo.name}</h3>
        <span class="status-pill ${statusClass(repo.health)}">${repo.health}</span>
      </div>
      <p>${repo.role}</p>
      <div>
        <div class="meta-row">
          <span class="meta-chip">Docs ${repo.docs}%</span>
          <span class="meta-chip">${repo.security}</span>
          <span class="meta-chip">${repo.tests}</span>
        </div>
      </div>
      <div class="progress-track">
        <span class="progress-fill" style="width:${repo.docs}%"></span>
      </div>
    </article>
  `).join("");

  $$(".filter-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.filter === state.repositoryFilter);
  });
}

function renderDocumentation() {
  $("#documentation-list").innerHTML = documentation.map((doc) => `
    <article class="doc-row">
      <div class="card-topline">
        <strong>${doc.title}</strong>
        <span class="status-pill ${statusClass(doc.status)}">${doc.status}</span>
      </div>
      <p>${doc.type}: ${doc.summary}</p>
    </article>
  `).join("");

  $("#documentation-plan").innerHTML = [
    "Maintain architecture and ADR records next to implementation changes.",
    "Expose roadmap status in SEIS Core before adding backend state.",
    "Keep knowledge sources cited and searchable for future agent workflows."
  ].map((item) => `<li>${item}</li>`).join("");
}

function renderAgents() {
  $("#agent-grid").innerHTML = agents.map((agent) => `
    <article class="agent-card ${agent.name === state.activeAgent ? "is-active" : ""}">
      <div class="card-topline">
        <h3>${agent.name} Mode</h3>
        <span class="status-pill ${statusClass(agent.status)}">${agent.status}</span>
      </div>
      <p>${agent.focus}</p>
      <button class="secondary-button" type="button" data-agent="${agent.name}">Activate</button>
    </article>
  `).join("");
}

function renderArchitecture() {
  $("#architecture-map").innerHTML = architectureNodes.map(([title, detail]) => `
    <article class="architecture-node">
      <h3>${title}</h3>
      <p>${detail}</p>
    </article>
  `).join("");
}

function renderKnowledge() {
  $("#knowledge-grid").innerHTML = knowledgeItems.map(([title, detail]) => `
    <article class="knowledge-card">
      <h3>${title}</h3>
      <p>${detail}</p>
    </article>
  `).join("");
}

function renderInspector() {
  $("#active-agent-label").textContent = state.activeAgent;
  $("#mode-list").innerHTML = agents.map((agent) => `
    <button class="mode-button ${agent.name === state.activeAgent ? "is-active" : ""}" type="button" data-agent="${agent.name}">
      <strong>${agent.name}</strong>
      <p>${agent.focus}</p>
    </button>
  `).join("");

  const actions = state.goals
    .filter((goal) => goal.status !== "Done")
    .slice(0, 4)
    .map((goal) => `<article class="next-action"><strong>${goal.title}</strong><p>${goal.nextAction}</p></article>`);
  $("#next-actions").innerHTML = actions.join("");
}

function updateHealth() {
  const doneGoals = state.goals.filter((goal) => goal.status === "Done").length;
  const blockedGoals = state.goals.filter((goal) => goal.status === "Blocked").length;
  const readyRepos = repositories.filter((repo) => repo.health === "Ready").length;
  const score = Math.max(62, Math.min(98, 78 + readyRepos * 4 + doneGoals * 3 - blockedGoals * 6));
  $("#sidebar-health-score").textContent = `${score}%`;
  $("#sidebar-health-detail").textContent = blockedGoals > 0 ? `${blockedGoals} blocked goal needs review` : "Stable, reviews queued";
}

function setView(view) {
  state.activeView = view;
  document.body.classList.remove("nav-open");
  render();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      setView(viewButton.dataset.view);
      const dialog = viewButton.closest("dialog");
      if (dialog) {
        dialog.close();
      }
    }

    const statusButton = event.target.closest("[data-goal-status]");
    if (statusButton) {
      const goal = state.goals.find((item) => item.id === statusButton.dataset.goalStatus);
      if (goal) {
        goal.status = statusButton.dataset.next;
        render();
      }
    }

    const agentButton = event.target.closest("[data-agent]");
    if (agentButton) {
      state.activeAgent = agentButton.dataset.agent;
      render();
    }

    const closeButton = event.target.closest("[data-close-dialog]");
    if (closeButton) {
      closeButton.closest("dialog").close();
    }
  });

  $("#goal-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.goals.unshift({
      id: `goal-${Date.now()}`,
      title: data.get("title").toString().trim(),
      priority: data.get("priority"),
      status: data.get("status"),
      risk: data.get("risk").toString().trim(),
      nextAction: data.get("nextAction").toString().trim()
    });
    event.currentTarget.reset();
    render();
  });

  $$(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.repositoryFilter = chip.dataset.filter;
      render();
    });
  });

  $("#global-search").addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase().trim();
    if (!query) {
      render();
      return;
    }

    const target = Object.entries(viewMeta).find(([view, values]) =>
      view.includes(query) || values.join(" ").toLowerCase().includes(query)
    );
    if (target) {
      state.activeView = target[0];
      render();
    }
  });

  $("#primary-action").addEventListener("click", () => {
    if (state.activeView !== "goals") {
      setView("goals");
      $("#goal-title").focus();
    } else {
      $("#goal-title").focus();
    }
  });

  $("#open-command").addEventListener("click", openCommandPalette);
  $("#open-settings").addEventListener("click", () => $("#settings-dialog").showModal());
  $("#sidebar-toggle").addEventListener("click", () => document.body.classList.toggle("nav-open"));

  $("#density-toggle").addEventListener("change", (event) => {
    state.settings.compact = event.target.checked;
    render();
  });

  $("#motion-toggle").addEventListener("change", (event) => {
    state.settings.reduceMotion = event.target.checked;
    render();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openCommandPalette();
    }
    if (event.key === "Escape") {
      document.body.classList.remove("nav-open");
    }
  });
}

function openCommandPalette() {
  const dialog = $("#command-dialog");
  const input = $("#command-input");
  renderCommandResults("");
  dialog.showModal();
  input.value = "";
  input.focus();
}

function renderCommandResults(query) {
  const commands = [
    ["Dashboard", "Open ecosystem overview", "dashboard"],
    ["Goals", "Create or review goal status", "goals"],
    ["Repositories", "Inspect repository health", "repositories"],
    ["Documentation", "Review docs and ADR coverage", "documentation"],
    ["Agents", "Switch AI operating mode", "agents"],
    ["Architecture", "Open system map", "architecture"],
    ["Knowledge", "Open knowledge management", "knowledge"]
  ].filter((command) => command.join(" ").toLowerCase().includes(query.toLowerCase()));

  $("#command-results").innerHTML = commands.map(([name, detail, view]) => `
    <button class="command-result" type="button" data-view="${view}">
      <span><strong>${name}</strong><br><small>${detail}</small></span>
      <span>Enter</span>
    </button>
  `).join("");
}

$("#command-input").addEventListener("input", (event) => renderCommandResults(event.target.value));

$("#density-toggle").checked = state.settings.compact;
$("#motion-toggle").checked = state.settings.reduceMotion;
bindEvents();
render();
