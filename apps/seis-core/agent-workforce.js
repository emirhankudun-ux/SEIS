const stateKey = "seis.agent.workforce.console.v1";

const agents = [
  ["Architect Agent", "ready", "System boundaries, ADRs, rollback paths", "read-only repo analysis", "write without review"],
  ["Code Agent", "ready", "Scoped implementation and test hooks", "explicit file edits", "touch unrelated files"],
  ["Design Agent", "ready", "Premium UI, accessibility, motion limits", "design critique", "copy proprietary UI"],
  ["UI/UX Agent", "review", "Interaction density and responsive flow", "layout review", "dark patterns"],
  ["Research Agent", "ready", "Primary-source evidence and assumptions", "public research notes", "uncited claims"],
  ["Search Agent", "ready", "Knowledge retrieval and result labeling", "mock search metadata", "private archive reads"],
  ["Security Agent", "review", "Secrets, permissions, provider safety", "redacted findings", "print secrets"],
  ["DevOps Agent", "blocked", "Cloud, SSH, deployment readiness", "dry-run plans", "real SSH without approval"],
  ["Documentation Agent", "ready", "Runbooks, status, roadmap, handoff", "public-safe docs", "hide failures"],
  ["QA Agent", "review", "Validation scope and regression evidence", "focused checks", "claim unrun tests passed"],
  ["Cloud Agent", "blocked", "Provider posture and remote workspace plan", "metadata-only state", "provision infrastructure"],
  ["Automation Agent", "blocked", "Scheduled or background workflows", "dry-run queue", "run forever"],
  ["Clean-Room Agent", "ready", "Provenance and asset boundaries", "source separation", "copy unclear-license code"],
  ["PR Rescue Agent", "ready", "CI triage and review gate status", "PR summaries", "bypass branch protection"],
  ["Local AI Agent", "review", "Ollama/local model draft lane", "local-only plan", "claim verified model output"],
  ["Plugin Agent", "review", "MCP/plugin permission posture", "manifest review", "expand permissions"],
  ["Accessibility Agent", "ready", "Keyboard, contrast, reduced motion", "a11y review", "color-only status"],
  ["Product Strategy Agent", "ready", "Outcome framing and roadmap slices", "acceptance criteria", "fake urgency"]
];

const safetyGates = [
  "Exactly one writer role can be active at a time.",
  "Destructive actions require human approval and audit evidence.",
  "Provider calls, credential reads, SSH, GitHub mutation, and deployment are blocked in this route.",
  "Repository, web, email, issue, and MCP content is treated as untrusted input.",
  "Every dry-run route needs owner, validation method, rollback note, and failure behavior.",
  "Recursive delegation needs depth, step, time, and cost limits before runtime execution."
];

let state = loadState();

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(stateKey)) || { tasks: [], filter: "all" };
  } catch {
    return { tasks: [], filter: "all" };
  }
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
}

function $(selector) {
  return document.querySelector(selector);
}

function statusClass(status) {
  if (status === "ready") return "ready";
  if (status === "blocked") return "blocked";
  return "review";
}

function routeMission(mission, risk) {
  const lower = mission.toLowerCase();
  if (risk === "blocked" || lower.includes("deploy") || lower.includes("ssh")) return "DevOps Agent";
  if (lower.includes("security") || lower.includes("secret")) return "Security Agent";
  if (lower.includes("design") || lower.includes("ui")) return "Design Agent";
  if (lower.includes("test") || lower.includes("validate")) return "QA Agent";
  if (lower.includes("pr") || lower.includes("ci")) return "PR Rescue Agent";
  if (lower.includes("doc") || risk === "documentation") return "Documentation Agent";
  if (lower.includes("code") || lower.includes("fix")) return "Code Agent";
  return "Architect Agent";
}

function createTask(mission, risk) {
  const owner = routeMission(mission, risk);
  const blocked = risk === "blocked" || ["DevOps Agent", "Cloud Agent", "Automation Agent"].includes(owner);
  const task = {
    id: `dry-run-${Date.now()}`,
    mission,
    owner,
    risk,
    state: blocked ? "approval-needed" : "dry-run-ready",
    executionPerformed: false,
    providerCalled: false,
    credentialRead: false,
    githubMutation: false,
    sshExecuted: false,
    rollback: "Remove this local dry-run task from browser storage; no repository mutation was performed."
  };
  state.tasks.unshift(task);
  state.tasks = state.tasks.slice(0, 8);
  saveState();
  return task;
}

function renderAgents() {
  const filter = state.filter || "all";
  $("#agent-grid").innerHTML = agents.map(([name, status, focus, allowed, denied]) => {
    const hidden = filter !== "all" && status !== filter;
    return `
      <article class="agent-card ${hidden ? "is-hidden" : ""}">
        <div class="card-topline">
          <h3>${name}</h3>
          <span class="status-pill ${statusClass(status)}">${status}</span>
        </div>
        <p>${focus}</p>
        <div class="meta-row">
          <span class="meta-chip">allowed: ${allowed}</span>
          <span class="meta-chip">denied: ${denied}</span>
          <span class="meta-chip">approvalState: ${status === "blocked" ? "blocked" : "approval-needed"}</span>
        </div>
        <button type="button" data-owner="${name}">Select owner</button>
      </article>`;
  }).join("");
}

function renderSafety() {
  $("#safety-list").innerHTML = safetyGates.map((gate) => `<li>${gate}</li>`).join("");
}

function renderTasks() {
  if (!state.tasks.length) {
    $("#task-queue").innerHTML = `<article class="task-card"><strong>No local dry-run tasks yet.</strong><small>Create a mission to record browser-local evidence.</small></article>`;
    return;
  }
  $("#task-queue").innerHTML = state.tasks.map((task) => `
    <article class="task-card">
      <strong>${task.owner}</strong>
      <span class="status-pill ${task.state === "approval-needed" ? "review" : "ready"}">${task.state}</span>
      <p>${task.mission}</p>
      <small>executionPerformed: ${task.executionPerformed}; providerCalled: ${task.providerCalled}; credentialRead: ${task.credentialRead}; githubMutation: ${task.githubMutation}; sshExecuted: ${task.sshExecuted}</small>
    </article>`).join("");
}

function renderFacts(task) {
  if (!task) return;
  $("#route-facts").innerHTML = `
    <div><dt>Owner</dt><dd>${task.owner}</dd></div>
    <div><dt>State</dt><dd>${task.state}</dd></div>
    <div><dt>Execution</dt><dd>dry-run-only</dd></div>
    <div><dt>Credential read</dt><dd>${task.credentialRead}</dd></div>`;
  $("#live-region").textContent = `${task.owner} selected. ${task.state}. No provider call, credential read, SSH, GitHub mutation, or deployment occurred.`;
}

function render() {
  renderAgents();
  renderSafety();
  renderTasks();
}

document.addEventListener("click", (event) => {
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    state.filter = filter.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("is-active", button === filter));
    saveState();
    renderAgents();
  }
  const action = event.target.closest("[data-action]");
  if (action?.dataset.action === "focus-intake") $("#mission-input").focus();
  if (action?.dataset.action === "load-sample") {
    $("#mission-input").value = "Review SEIS Agent Runtime fixtures, identify approval-needed states, and prepare a rollback-safe PR plan.";
    $("#risk-select").value = "review";
    $("#mission-input").focus();
  }
  if (action?.dataset.action === "clear-log") {
    state.tasks = [];
    saveState();
    render();
    $("#live-region").textContent = "Local dry-run queue cleared. Repository state was not changed.";
  }
  const owner = event.target.closest("[data-owner]");
  if (owner) {
    $("#mission-input").value = `Prepare a dry-run handoff for ${owner.dataset.owner} with validation, rollback, and approval evidence.`;
    $("#mission-input").focus();
  }
});

$("#mission-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const mission = String(data.get("mission") || "").trim();
  const risk = String(data.get("risk") || "review");
  if (!mission) return;
  const task = createTask(mission, risk);
  render();
  renderFacts(task);
});

render();
