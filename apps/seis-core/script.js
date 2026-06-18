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
    tests: "quality gate",
    dependencies: ["Node automation", "GitHub checks", "SEIS web surface"],
    dependencyRisk: "Generated report drift"
  },
  {
    name: "SEIST",
    role: "Companion surface",
    health: "Review",
    docs: 76,
    security: "policy aligned",
    tests: "smoke checks",
    dependencies: ["Shared governance", "Documentation contracts"],
    dependencyRisk: "Cross-repo release timing"
  },
  {
    name: "seis-trusted-marketplace-plugin",
    role: "Plugin lane",
    health: "Ready",
    docs: 84,
    security: "manifest checks",
    tests: "plugin bundle",
    dependencies: ["Plugin manifest", "Marketplace policy", "Permission model"],
    dependencyRisk: "Provider capability drift"
  },
  {
    name: "emirhan-kudun-portfolio",
    role: "Public portfolio",
    health: "Review",
    docs: 69,
    security: "static surface",
    tests: "web checks",
    dependencies: ["Static assets", "SEO metadata", "Content publishing"],
    dependencyRisk: "Public content sync"
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
    status: "Ready",
    capabilities: ["ADR review", "system maps", "dependency boundaries"],
    tasks: ["Keep Command Center modules aligned with SEIS operating model"],
    logs: ["Operating model expanded with MCP, cloud and knowledge domains"],
    outputs: ["Architecture contracts", "phase migration criteria"]
  },
  {
    name: "Builder",
    focus: "Implementation, tests, app surfaces, integration and release readiness.",
    status: "Ready",
    capabilities: ["UI implementation", "test automation", "release checks"],
    tasks: ["Wire static workflows into verifiable local state"],
    logs: ["Command Center static gates pass before generated report sync"],
    outputs: ["HTML/CSS/JS surfaces", "quality evidence"]
  },
  {
    name: "Security",
    focus: "Secrets hygiene, dependency review, access model, policy checks.",
    status: "Review",
    capabilities: ["secret boundary", "permission review", "dependency scanning"],
    tasks: ["Make plugin permissions and SSH posture visible in Security Center"],
    logs: ["SEIS-SSH remains terminal-compatible with picker warning"],
    outputs: ["risk reports", "access model notes"]
  },
  {
    name: "Design",
    focus: "Product hierarchy, accessibility, design system, interaction quality.",
    status: "Ready",
    capabilities: ["layout density", "accessibility", "design tokens"],
    tasks: ["Keep Command Center calm while adding operational density"],
    logs: ["Existing app shell retained without new visual bloat"],
    outputs: ["component rules", "responsive interaction guidance"]
  },
  {
    name: "Research",
    focus: "Primary-source research, compatibility checks, technical evidence.",
    status: "Active",
    capabilities: ["source review", "compatibility checks", "evidence capture"],
    tasks: ["Prepare provider adapter evidence before live integrations"],
    logs: ["Future AI systems kept explicit in AI Systems model"],
    outputs: ["research notes", "integration assumptions"]
  }
];

const aiSystems = [
  {
    name: "OpenAI",
    role: "Primary execution and repository automation model lane.",
    mode: "Primary"
  },
  {
    name: "Claude",
    role: "Architecture review, long-context reasoning, and high-risk critique.",
    mode: "Review"
  },
  {
    name: "Gemini",
    role: "Google ecosystem validation, documentation synthesis, and secondary evidence.",
    mode: "Validation"
  },
  {
    name: "Qwen",
    role: "Alternative reasoning, counter-analysis, and implementation comparison.",
    mode: "Optional"
  },
  {
    name: "Local Models",
    role: "Offline experimentation and private draft workflows when resources allow.",
    mode: "Experimental"
  }
];

const pluginFamilies = [
  {
    name: "Builder and Prototyping",
    health: "Ready",
    permissions: "Scoped activation",
    summary: "Lovable, Replit, Base44, Vercel, Cloudflare, Supabase and hosting lanes."
  },
  {
    name: "Creative Production and Design",
    health: "Ready",
    permissions: "Asset-gated",
    summary: "Figma, Canva, Adobe, Fal, Shutterstock and visual production tools."
  },
  {
    name: "Cloud, DevOps and Release",
    health: "Review",
    permissions: "Provider-gated",
    summary: "CI, deploy, cloud readiness, SSH access, rollback and release safety."
  },
  {
    name: "Security, Quality and Governance",
    health: "Ready",
    permissions: "Read-first",
    summary: "Code review, static analysis, dependency review, policy and audit checks."
  },
  {
    name: "AI Workflow, Docs and Knowledge",
    health: "Active",
    permissions: "Source-visible",
    summary: "MCP, skills, browser/document tools, memory systems and knowledge workflow."
  }
];

const automationWorkflows = [
  {
    name: "Quality Governance",
    trigger: "Manual or pre-release",
    status: "Ready",
    history: "npm run quality"
  },
  {
    name: "Generated Reports",
    trigger: "Source-surface change",
    status: "Ready",
    history: "language distribution and technology stack"
  },
  {
    name: "Plugin Bundle Check",
    trigger: "Plugin or skill update",
    status: "Ready",
    history: "specialist plugin checks"
  },
  {
    name: "Cloud SSH Readiness",
    trigger: "Remote workspace handoff",
    status: "Review",
    history: "SEIS-SSH picker compatibility"
  }
];

const securityReports = [
  {
    name: "Secrets Boundary",
    status: "Ready",
    detail: "No API keys, tokens, certificates or provisioning files should enter the repository."
  },
  {
    name: "SEIS-SSH Access Model",
    status: "Review",
    detail: "Single visible cloud alias with terminal-compatible Codespaces transport."
  },
  {
    name: "Plugin Permissions",
    status: "Ready",
    detail: "Plugins activate only when relevant, authenticated, scoped and user-approved."
  },
  {
    name: "Dependency Surface",
    status: "Ready",
    detail: "Phase 1 stays dependency-free; future frameworks require explicit architecture gates."
  }
];

const recommendedActions = [
  ["Command Center architecture", "Keep Phase 1 static, then promote proven modules to React/Next."],
  ["Security review", "Make plugin permissions and SSH gates visible before adding remote writes."],
  ["Automation wiring", "Connect report refresh, quality and release checks to a traceable workflow history."],
  ["Native bridge", "Use the SwiftUI shell as Phase 3 once Command Center workflows stabilize."]
];

const recentActivity = [
  {
    time: "Now",
    actor: "Builder Agent",
    action: "Updated Command Center operating model gates",
    module: "Agents",
    status: "Ready"
  },
  {
    time: "Recent",
    actor: "Security Agent",
    action: "Reviewed plugin permissions and SEIS-SSH warning surface",
    module: "Security",
    status: "Review"
  },
  {
    time: "Recent",
    actor: "Architect Agent",
    action: "Linked roadmap phases to the local-first app architecture",
    module: "Architecture",
    status: "Ready"
  },
  {
    time: "Queued",
    actor: "Automation Center",
    action: "Refresh generated language and technology reports after source changes",
    module: "Automation",
    status: "Active"
  }
];

const operatingDomains = [
  {
    name: "Repositories",
    lane: "Source control",
    module: "Repositories",
    status: "Ready",
    signal: "Repository health, tests, docs, dependencies and release posture."
  },
  {
    name: "AI Agents",
    lane: "Intelligence",
    module: "Agents",
    status: "Ready",
    signal: "Architect, Builder, Security, Research and Design responsibilities."
  },
  {
    name: "MCP Systems",
    lane: "Tooling",
    module: "Plugins",
    status: "Review",
    signal: "Connector availability, capability routing and tool permission boundaries."
  },
  {
    name: "Plugin Systems",
    lane: "Extensions",
    module: "Plugins",
    status: "Ready",
    signal: "Installed families, marketplace posture, updates and permission gates."
  },
  {
    name: "Documentation",
    lane: "Knowledge",
    module: "Documentation",
    status: "Ready",
    signal: "Architecture docs, ADRs, roadmap records and source provenance."
  },
  {
    name: "Architecture Decisions",
    lane: "Governance",
    module: "Architecture",
    status: "Ready",
    signal: "System maps, dependency boundaries, tradeoffs and technical debt."
  },
  {
    name: "Roadmap Planning",
    lane: "Strategy",
    module: "Documentation",
    status: "Active",
    signal: "Phase 1 static shell, Phase 2 React/Next, Phase 3 SwiftUI native apps."
  },
  {
    name: "Goal Tracking",
    lane: "Execution",
    module: "Goals",
    status: "Ready",
    signal: "Milestones, priorities, blockers, progress and smallest next actions."
  },
  {
    name: "Automation Workflows",
    lane: "Operations",
    module: "Automation",
    status: "Ready",
    signal: "Quality gates, generated reports, scheduled checks and audit history."
  },
  {
    name: "Cloud Infrastructure",
    lane: "Platform",
    module: "Security",
    status: "Review",
    signal: "SEIS-SSH readiness, cloud access policy and remote workspace safety."
  },
  {
    name: "Knowledge Systems",
    lane: "Memory",
    module: "Knowledge",
    status: "Active",
    signal: "Reusable patterns, memory, decision history and research notes."
  },
  {
    name: "Security Systems",
    lane: "Trust",
    module: "Security",
    status: "Ready",
    signal: "Risk reports, permission reviews, dependency scanning and audits."
  }
];

const platformPhases = [
  {
    phase: "Phase 1",
    stack: "HTML, CSS, JavaScript",
    status: "Active",
    outcome: "Dependency-free local operating shell with persistent workflows."
  },
  {
    phase: "Phase 2",
    stack: "TypeScript, React, Next.js",
    status: "Planned",
    outcome: "Routed modules, typed adapters, authenticated APIs and live ecosystem data."
  },
  {
    phase: "Phase 3",
    stack: "SwiftUI macOS and iOS",
    status: "Planned",
    outcome: "Native Apple-first command center with local workspace integration."
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
  plugins: ["Plugins", "Plugins and extensions", "Inspect plugin families, marketplace posture, permissions, updates, and activation policy.", "Review Plugins"],
  automation: ["Automation", "Automation center", "Inspect workflows, triggers, scheduled tasks, automation history, and safe execution gates.", "Run Check"],
  security: ["Security", "Security center", "Track risk reports, permission reviews, dependency scanning, access models, and auditability.", "Review Risk"],
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
  renderPlugins();
  renderAutomation();
  renderSecurity();
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
  const readyDomains = operatingDomains.filter((domain) => domain.status === "Ready").length;
  const reviewCount = state.goals.filter((goal) => goal.status === "Review" || goal.status === "Blocked").length +
    repositories.filter((repo) => repo.health !== "Ready").length +
    operatingDomains.filter((domain) => domain.status === "Review").length;

  $("#metric-grid").innerHTML = [
    ["Active Goals", activeGoals.length, "tracked outcomes"],
    ["Repos Ready", `${readyRepos}/${repositories.length}`, "source surfaces"],
    ["Domains Ready", `${readyDomains}/${operatingDomains.length}`, "operating map"],
    ["Reviews", reviewCount, "attention signals"]
  ].map(([label, value, detail]) => `
    <article class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${detail}</small>
    </article>
  `).join("");

  $("#operating-domain-grid").innerHTML = operatingDomains.map((domain) => `
    <article class="domain-card">
      <div class="card-topline">
        <strong>${domain.name}</strong>
        <span class="status-pill ${statusClass(domain.status)}">${domain.status}</span>
      </div>
      <p>${domain.signal}</p>
      <div class="meta-row">
        <span class="meta-chip">${domain.lane}</span>
        <span class="meta-chip">${domain.module}</span>
      </div>
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
      <p>${repo.role} · ${repo.dependencies.length} dependencies</p>
      <div class="progress-track" aria-label="${repo.name} documentation coverage">
        <span class="progress-fill" style="width:${repo.docs}%"></span>
      </div>
    </article>
  `).join("");

  $("#recent-activity").innerHTML = recentActivity.map((item) => `
    <article class="activity-row">
      <span>${item.time}</span>
      <div>
        <strong>${item.actor}</strong>
        <p>${item.action}</p>
      </div>
      <span class="status-pill ${statusClass(item.status)}">${item.module}</span>
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

  $("#recommended-actions").innerHTML = recommendedActions.map(([title, detail]) => `
    <article class="action-card">
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
          <span class="meta-chip">Dependencies ${repo.dependencies.length}</span>
        </div>
      </div>
      <ul class="dependency-list">
        ${repo.dependencies.map((dependency) => `<li>${dependency}</li>`).join("")}
      </ul>
      <p class="risk-note">Dependency risk: ${repo.dependencyRisk}</p>
      <div class="progress-track">
        <span class="progress-fill" style="width:${repo.docs}%"></span>
      </div>
    </article>
  `).join("");

  $("#dependency-overview").innerHTML = repositories.map((repo) => `
    <article class="dependency-row">
      <div>
        <strong>${repo.name}</strong>
        <p>${repo.dependencyRisk}</p>
      </div>
      <span class="meta-chip">${repo.dependencies.join(" / ")}</span>
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
      <div class="agent-detail-grid">
        ${renderAgentDetail("Capabilities", agent.capabilities)}
        ${renderAgentDetail("Tasks", agent.tasks)}
        ${renderAgentDetail("Logs", agent.logs)}
        ${renderAgentDetail("Outputs", agent.outputs)}
      </div>
      <button class="secondary-button" type="button" data-agent="${agent.name}">Activate</button>
    </article>
  `).join("");

  $("#ai-system-grid").innerHTML = aiSystems.map((system) => `
    <article class="system-card">
      <div class="card-topline">
        <h3>${system.name}</h3>
        <span class="status-pill ${statusClass(system.mode === "Primary" ? "Ready" : "Review")}">${system.mode}</span>
      </div>
      <p>${system.role}</p>
    </article>
  `).join("");
}

function renderAgentDetail(label, items) {
  return `
    <section class="agent-detail">
      <h4>${label}</h4>
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderPlugins() {
  $("#plugin-grid").innerHTML = pluginFamilies.map((family) => `
    <article class="plugin-card">
      <div class="card-topline">
        <h3>${family.name}</h3>
        <span class="status-pill ${statusClass(family.health)}">${family.health}</span>
      </div>
      <p>${family.summary}</p>
      <div class="meta-row">
        <span class="meta-chip">${family.permissions}</span>
        <span class="meta-chip">least privilege</span>
      </div>
    </article>
  `).join("");
}

function renderAutomation() {
  $("#automation-grid").innerHTML = automationWorkflows.map((workflow) => `
    <article class="automation-card">
      <div class="card-topline">
        <h3>${workflow.name}</h3>
        <span class="status-pill ${statusClass(workflow.status)}">${workflow.status}</span>
      </div>
      <p>${workflow.history}</p>
      <div class="meta-row">
        <span class="meta-chip">Trigger: ${workflow.trigger}</span>
        <span class="meta-chip">audit trail</span>
      </div>
    </article>
  `).join("");
}

function renderSecurity() {
  $("#security-list").innerHTML = securityReports.map((report) => `
    <article class="security-card">
      <div class="card-topline">
        <h3>${report.name}</h3>
        <span class="status-pill ${statusClass(report.status)}">${report.status}</span>
      </div>
      <p>${report.detail}</p>
    </article>
  `).join("");

  $("#security-requirements").innerHTML = [
    "least privilege",
    "secure defaults",
    "encrypted storage where needed",
    "role-based access",
    "auditability",
    "no exposed secrets"
  ].map((item) => `<li>${item}</li>`).join("");
}

function renderArchitecture() {
  $("#architecture-map").innerHTML = architectureNodes.map(([title, detail]) => `
    <article class="architecture-node">
      <h3>${title}</h3>
      <p>${detail}</p>
    </article>
  `).join("");

  $("#phase-list").innerHTML = platformPhases.map((phase) => `
    <article class="phase-row">
      <div class="card-topline">
        <strong>${phase.phase}</strong>
        <span class="status-pill ${statusClass(phase.status === "Active" ? "Active" : "Review")}">${phase.status}</span>
      </div>
      <p>${phase.stack}</p>
      <small>${phase.outcome}</small>
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
    ["Plugins", "Review plugins, permissions and updates", "plugins"],
    ["Automation", "Inspect workflows and triggers", "automation"],
    ["Security", "Review risk and access posture", "security"],
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
