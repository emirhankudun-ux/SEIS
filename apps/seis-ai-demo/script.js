const storageKey = "seis-ai-command-core-state-v1";

const defaultPrompt = "Build a SEIS AI demo app that can route a request, coordinate agents, check risk, cite knowledge, run evaluation, and produce an approval-ready plan without calling a real provider.";

const modelProfiles = [
  {
    id: "architecture-planner",
    name: "Architecture Planner",
    strengths: ["architecture", "roadmap", "agent", "router", "system", "docs", "governance"],
    description: "Best for system boundaries, staged plans, docs, and long-term SEIS operating design."
  },
  {
    id: "implementation-builder",
    name: "Implementation Builder",
    strengths: ["build", "code", "app", "ui", "test", "demo", "feature"],
    description: "Best for shippable app surfaces, local state, tests, and static implementation."
  },
  {
    id: "security-reviewer",
    name: "Security Reviewer",
    strengths: ["security", "secret", "approval", "ssh", "risk", "audit", "privacy"],
    description: "Best for risk gates, secret handling, audit trails, and permission boundaries."
  },
  {
    id: "evaluation-critic",
    name: "Evaluation Critic",
    strengths: ["eval", "quality", "validation", "review", "coverage", "accessibility"],
    description: "Best for scoring, testability, accessibility, and review-ready acceptance criteria."
  }
];

const promptVersions = [
  {
    id: "seis-command-v0.3",
    title: "SEIS Command v0.3",
    scope: "Repository-safe execution planning",
    rule: "Inspect, isolate, implement, validate, document, and avoid privileged actions."
  },
  {
    id: "seis-review-v0.2",
    title: "SEIS Review v0.2",
    scope: "Design and code review",
    rule: "Lead with findings, compare against implementation evidence, and name residual risks."
  },
  {
    id: "seis-security-v0.1",
    title: "SEIS Security v0.1",
    scope: "Secret, SSH, provider, and deployment safety",
    rule: "Never expose credentials, never fake readiness, and require approval for privileged work."
  }
];

const knowledgeBase = [
  {
    id: "agents",
    title: "AGENTS.md",
    trust: "Constitution",
    summary: "SEIS work should stay modular, human-supervised, source-controlled, and security aware."
  },
  {
    id: "security",
    title: "SECURITY.md",
    trust: "Policy",
    summary: "No API keys, tokens, private credentials, .env contents, or personal data should be committed."
  },
  {
    id: "readme",
    title: "README.md",
    trust: "Product source",
    summary: "SEIS is an AI-native platform layer for agents, MCP, plugins, LLM workflows, and governance."
  },
  {
    id: "local-demo",
    title: "Local deterministic demo",
    trust: "Implementation",
    summary: "This app demonstrates routing and governance without provider keys or live model calls."
  }
];

const agentCatalog = [
  {
    id: "architect",
    name: "Architect Agent",
    role: "System boundaries, staged architecture, and ADR quality.",
    lane: "Plan"
  },
  {
    id: "frontend",
    name: "Frontend Agent",
    role: "Accessible UI, stateful controls, responsive behavior, and visual polish.",
    lane: "Build"
  },
  {
    id: "security",
    name: "Security Agent",
    role: "Secret hygiene, approval gates, provider boundaries, and audit readiness.",
    lane: "Security"
  },
  {
    id: "documentation",
    name: "Documentation Agent",
    role: "Source-of-truth docs, implementation notes, and recovery reports.",
    lane: "Plan"
  },
  {
    id: "qa",
    name: "QA Agent",
    role: "Evaluation scores, test coverage, accessibility, and failure-path review.",
    lane: "Review"
  },
  {
    id: "operations",
    name: "Operations Agent",
    role: "Git branch isolation, handoff, release readiness, and rollback notes.",
    lane: "Review"
  }
];

const dom = {
  shell: document.querySelector(".app-shell"),
  navButtons: [...document.querySelectorAll("[data-nav-target]")],
  mobileNav: document.querySelector("#mobile-nav"),
  search: document.querySelector("#global-search"),
  form: document.querySelector("#composer-form"),
  promptInput: document.querySelector("#prompt-input"),
  modeButtons: [...document.querySelectorAll("[data-mode]")],
  response: document.querySelector("#generated-response"),
  responseQuality: document.querySelector("#response-quality"),
  runId: document.querySelector("#run-id"),
  selectedProfile: document.querySelector("#selected-profile"),
  routeRationale: document.querySelector("#route-rationale"),
  routeBars: document.querySelector("#route-bars"),
  agentQueue: document.querySelector("#agent-queue"),
  agentFilter: document.querySelector("#agent-filter"),
  promptVersionList: document.querySelector("#prompt-version-list"),
  promptEditor: document.querySelector("#prompt-editor"),
  promptVersion: document.querySelector("#prompt-version"),
  promptNotes: document.querySelector("#prompt-notes"),
  knowledgeList: document.querySelector("#knowledge-list"),
  modeLabel: document.querySelector("#inspector-mode"),
  traceId: document.querySelector("#trace-id"),
  riskLabel: document.querySelector("#risk-label"),
  evals: document.querySelector("#eval-score-strip"),
  approvalState: document.querySelector("#approval-state"),
  approvalCopy: document.querySelector("#approval-copy"),
  approveRun: document.querySelector("#approve-run"),
  requireApproval: document.querySelector("#require-approval"),
  redactSecrets: document.querySelector("#redact-secrets"),
  autonomyLevel: document.querySelector("#autonomy-level"),
  runEvaluation: document.querySelector("#run-evaluation"),
  rerunEvals: document.querySelector("#rerun-evals"),
  resetDemo: document.querySelector("#reset-demo"),
  auditTimeline: document.querySelector("#audit-timeline"),
  exportAudit: document.querySelector("#export-audit"),
  openCommand: document.querySelector("#open-command"),
  commandDialog: document.querySelector("#command-dialog"),
  commandButtons: [...document.querySelectorAll("[data-command-action]")],
  toast: document.querySelector("#toast")
};

let state = loadState();

if (!state) {
  state = createInitialState();
}

render();
bindEvents();

function createInitialState() {
  const initial = {
    mode: "plan",
    prompt: defaultPrompt,
    promptVersion: "seis-command-v0.3",
    promptNotes: "Keep output bounded, evidence-led, reversible, and explicit about missing credentials.",
    approvalRequired: true,
    redactSecrets: true,
    autonomyLevel: 1,
    approved: false,
    agentFilter: "all",
    runCounter: 1,
    audit: []
  };

  const run = createRun(initial);
  initial.run = run;
  initial.audit = [
    makeAudit("Workspace initialized", "Local deterministic AI demo started."),
    makeAudit("Router prepared", `${run.route.selected.name} selected for first pass.`),
    makeAudit("Approval gate enabled", "Privileged actions are blocked in demo mode.")
  ];
  return initial;
}

function bindEvents() {
  dom.form.addEventListener("submit", event => {
    event.preventDefault();
    generatePlan();
  });

  dom.modeButtons.forEach(button => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      state.approved = false;
      state.run = createRun(state);
      addAudit("Mode changed", `Task mode set to ${toTitle(state.mode)}.`);
      saveAndRender();
    });
  });

  dom.navButtons.forEach(button => {
    button.addEventListener("click", () => {
      const target = button.dataset.navTarget;
      const section = document.querySelector(`#${target}`);
      if (section) section.scrollIntoView({ block: "start", behavior: "smooth" });
      dom.navButtons.forEach(item => item.classList.toggle("is-active", item.dataset.navTarget === target));
      dom.shell.classList.remove("nav-open");
    });
  });

  dom.mobileNav.addEventListener("click", () => {
    dom.shell.classList.toggle("nav-open");
  });

  dom.agentFilter.addEventListener("change", () => {
    state.agentFilter = dom.agentFilter.value;
    saveAndRender();
  });

  dom.promptEditor.addEventListener("submit", event => {
    event.preventDefault();
    state.promptVersion = dom.promptVersion.value;
    state.promptNotes = dom.promptNotes.value.trim();
    state.approved = false;
    state.run = createRun(state);
    addAudit("Prompt version saved", `${state.promptVersion} applied to the local run.`);
    saveAndRender();
  });

  dom.requireApproval.addEventListener("change", () => {
    state.approvalRequired = dom.requireApproval.checked;
    state.approved = !state.approvalRequired;
    addAudit("Approval policy changed", state.approvalRequired ? "Approval required." : "Demo approval gate disabled.");
    saveAndRender();
  });

  dom.redactSecrets.addEventListener("change", () => {
    state.redactSecrets = dom.redactSecrets.checked;
    addAudit("Redaction policy changed", state.redactSecrets ? "Secret redaction enabled." : "Secret redaction disabled for demo display.");
    saveAndRender();
  });

  dom.autonomyLevel.addEventListener("input", () => {
    state.autonomyLevel = Number(dom.autonomyLevel.value);
    state.approved = false;
    state.run = createRun(state);
    saveAndRender(false);
  });

  dom.runEvaluation.addEventListener("click", runEvaluation);
  dom.rerunEvals.addEventListener("click", runEvaluation);

  dom.resetDemo.addEventListener("click", () => {
    state = createInitialState();
    saveAndRender();
    showToast("Demo state reset.");
  });

  dom.approveRun.addEventListener("click", () => {
    state.approved = true;
    addAudit("Run approved", "Human approval recorded for this local demo plan.");
    saveAndRender();
    showToast("Approval recorded for the local demo run.");
  });

  dom.exportAudit.addEventListener("click", exportAudit);

  dom.openCommand.addEventListener("click", () => {
    if (typeof dom.commandDialog.showModal === "function") {
      dom.commandDialog.showModal();
    }
  });

  dom.commandButtons.forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.commandAction;
      if (action === "generate") generatePlan();
      if (action === "evaluate") runEvaluation();
      if (action === "approve") dom.approveRun.click();
      if (action === "audit") document.querySelector("#audit").scrollIntoView({ block: "start", behavior: "smooth" });
      dom.commandDialog.close();
    });
  });

  dom.search.addEventListener("input", () => {
    filterVisibleText(dom.search.value);
  });

  window.addEventListener("keydown", event => {
    const commandPressed = event.metaKey || event.ctrlKey;
    if (commandPressed && event.key.toLowerCase() === "k") {
      event.preventDefault();
      dom.search.focus();
    }
  });
}

function generatePlan() {
  state.prompt = dom.promptInput.value.trim() || defaultPrompt;
  state.runCounter += 1;
  state.approved = false;
  state.run = createRun(state);
  addAudit("Plan generated", `${state.run.route.selected.name} routed ${state.run.steps.length} plan steps.`);
  saveAndRender();
  showToast("Generated a local SEIS plan.");
}

function runEvaluation() {
  state.run = createRun(state);
  addAudit("Evaluation refreshed", `Composite score ${state.run.compositeScore}/100.`);
  saveAndRender();
  showToast("Evaluation refreshed.");
}

function createRun(input) {
  const prompt = input.prompt || defaultPrompt;
  const route = routeTask(prompt, input.mode);
  const risk = computeRisk(prompt, input.autonomyLevel, input.approvalRequired);
  const steps = generateSteps(prompt, input.mode, route.selected.name, risk.level);
  const agents = generateAgents(route.selected.name, input.mode, risk.level);
  const evidence = selectKnowledge(prompt, risk.level);
  const evals = evaluateRun(prompt, steps, evidence, risk, input.redactSecrets);
  const compositeScore = Math.round(evals.reduce((sum, item) => sum + item.score, 0) / evals.length);

  return {
    id: `SEIS-LOCAL-${String(input.runCounter || 1).padStart(3, "0")}`,
    traceId: `trace-local-${String(input.runCounter || 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
    route,
    risk,
    steps,
    agents,
    evidence,
    evals,
    compositeScore
  };
}

function routeTask(prompt, mode) {
  const normalized = prompt.toLowerCase();
  const scored = modelProfiles.map(profile => {
    const keywordScore = profile.strengths.reduce((score, keyword) => (
      normalized.includes(keyword) ? score + 18 : score
    ), 28);
    const modeBonus = profile.id.includes(mode) ? 12 : 0;
    const securityBonus = mode === "security" && profile.id === "security-reviewer" ? 24 : 0;
    const buildBonus = mode === "build" && profile.id === "implementation-builder" ? 24 : 0;
    const reviewBonus = mode === "review" && profile.id === "evaluation-critic" ? 24 : 0;
    const planBonus = mode === "plan" && profile.id === "architecture-planner" ? 18 : 0;
    return {
      ...profile,
      score: Math.min(98, keywordScore + modeBonus + securityBonus + buildBonus + reviewBonus + planBonus)
    };
  }).sort((a, b) => b.score - a.score);

  const selected = scored[0];
  return {
    selected,
    candidates: scored,
    rationale: `${selected.name} is safest because the request emphasizes ${selected.strengths.slice(0, 3).join(", ")}. Provider calls remain disconnected.`
  };
}

function computeRisk(prompt, autonomyLevel, approvalRequired) {
  const normalized = prompt.toLowerCase();
  let score = 22 + autonomyLevel * 14;
  for (const keyword of ["secret", "key", "token", "ssh", "deploy", "delete", "production", "credential", "firewall"]) {
    if (normalized.includes(keyword)) score += 10;
  }
  if (approvalRequired) score -= 8;
  if (normalized.includes("without calling a real provider")) score -= 8;
  score = Math.max(5, Math.min(96, score));

  let level = "Low";
  if (score >= 68) level = "High";
  else if (score >= 38) level = "Medium";

  return {
    score,
    level,
    summary: level === "High"
      ? "Needs explicit human approval and no privileged execution."
      : level === "Medium"
        ? "Safe for local demo execution with approval and redaction controls."
        : "Low-risk local planning flow."
  };
}

function generateSteps(prompt, mode, profileName, riskLevel) {
  const base = [
    {
      title: "Classify the request",
      detail: `Route the ${toTitle(mode)} task through ${profileName} and keep provider access disconnected.`
    },
    {
      title: "Build a bounded plan",
      detail: "Convert the prompt into reversible work packages with clear ownership and validation gates."
    },
    {
      title: "Coordinate supervised agents",
      detail: "Assign architecture, frontend, security, documentation, QA, and operations roles with explicit limits."
    },
    {
      title: "Attach evidence",
      detail: "Use official repo instructions, security policy, README context, and local implementation notes as citations."
    },
    {
      title: "Evaluate before approval",
      detail: `Score clarity, security, testability, accessibility, and provenance; current risk is ${riskLevel}.`
    }
  ];

  if (prompt.toLowerCase().includes("demo")) {
    base.push({
      title: "Expose interactive demo state",
      detail: "Show router scores, agent queue, prompt version, eval strip, approvals, and audit events in the UI."
    });
  }

  return base;
}

function generateAgents(profileName, mode, riskLevel) {
  return agentCatalog.map((agent, index) => {
    const active = profileName.toLowerCase().includes(agent.id) || agent.lane.toLowerCase() === mode;
    const review = agent.id === "security" && riskLevel !== "Low";
    const status = review ? "Review" : active ? "Running" : "Ready";
    const progress = status === "Running" ? 78 : status === "Review" ? 52 : 34 + index * 7;
    return {
      ...agent,
      status,
      progress: Math.min(progress, 94)
    };
  });
}

function selectKnowledge(prompt, riskLevel) {
  const normalized = prompt.toLowerCase();
  return knowledgeBase.map(item => {
    let weight = 72;
    if (normalized.includes("security") && item.id === "security") weight += 17;
    if (normalized.includes("agent") && item.id === "agents") weight += 14;
    if (normalized.includes("demo") && item.id === "local-demo") weight += 16;
    if (riskLevel !== "Low" && item.id === "security") weight += 8;
    return {
      ...item,
      weight: Math.min(weight, 99)
    };
  }).sort((a, b) => b.weight - a.weight);
}

function evaluateRun(prompt, steps, evidence, risk, redactSecrets) {
  const promptLength = prompt.length;
  const clarity = promptLength > 80 ? 91 : 78;
  const security = risk.level === "High" ? 70 : risk.level === "Medium" ? 84 : 92;
  const testability = steps.length >= 5 ? 88 : 76;
  const provenance = evidence.length >= 4 ? 90 : 79;
  const privacy = redactSecrets ? 93 : 68;

  return [
    {
      name: "Clarity",
      score: clarity,
      note: "Request maps to concrete steps and visible UI state."
    },
    {
      name: "Security",
      score: security,
      note: risk.summary
    },
    {
      name: "Testability",
      score: testability,
      note: "Static contract tests and browser workflow checks are available."
    },
    {
      name: "Provenance",
      score: provenance,
      note: "Official instructions, security rules, README, and implementation notes are separated."
    },
    {
      name: "Privacy",
      score: privacy,
      note: redactSecrets ? "Redaction is enabled and provider calls are disconnected." : "Redaction is disabled in the local demo controls."
    }
  ];
}

function render() {
  dom.promptInput.value = state.prompt;
  dom.promptVersion.value = state.promptVersion;
  dom.promptNotes.value = state.promptNotes;
  dom.requireApproval.checked = state.approvalRequired;
  dom.redactSecrets.checked = state.redactSecrets;
  dom.autonomyLevel.value = String(state.autonomyLevel);
  dom.agentFilter.value = state.agentFilter;
  dom.runId.textContent = state.run.id;
  dom.traceId.textContent = state.run.traceId;
  dom.modeLabel.textContent = toTitle(state.mode);
  dom.selectedProfile.textContent = state.run.route.selected.name;
  dom.routeRationale.textContent = state.run.route.rationale;
  dom.responseQuality.textContent = `Composite ${state.run.compositeScore}/100`;

  dom.modeButtons.forEach(button => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  renderRisk();
  renderResponse();
  renderRoutes();
  renderAgents();
  renderPromptVersions();
  renderKnowledge();
  renderEvals();
  renderApproval();
  renderAudit();
}

function renderRisk() {
  dom.riskLabel.textContent = `${state.run.risk.level} risk`;
  dom.riskLabel.className = "status-label";
  if (state.run.risk.level === "Low") dom.riskLabel.classList.add("ready");
  else dom.riskLabel.classList.add("attention");
}

function renderResponse() {
  dom.response.replaceChildren();
  state.run.steps.forEach((step, index) => {
    const article = document.createElement("article");
    article.className = "plan-step";
    article.dataset.searchable = `${step.title} ${step.detail}`;

    const marker = document.createElement("span");
    marker.textContent = String(index + 1).padStart(2, "0");

    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = step.title;
    const detail = document.createElement("p");
    detail.textContent = step.detail;
    content.append(title, detail);
    article.append(marker, content);
    dom.response.append(article);
  });
}

function renderRoutes() {
  dom.routeBars.replaceChildren();
  state.run.route.candidates.forEach(candidate => {
    const wrapper = document.createElement("div");
    wrapper.className = "route-bar";
    wrapper.dataset.searchable = `${candidate.name} ${candidate.description}`;

    const header = document.createElement("header");
    const name = document.createElement("span");
    name.textContent = candidate.name;
    const score = document.createElement("span");
    score.textContent = `${candidate.score}%`;
    header.append(name, score);

    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.setProperty("--value", `${candidate.score}%`);
    track.append(fill);

    wrapper.append(header, track);
    dom.routeBars.append(wrapper);
  });
}

function renderAgents() {
  dom.agentQueue.replaceChildren();
  const visibleAgents = state.run.agents.filter(agent => (
    state.agentFilter === "all" || agent.status === state.agentFilter
  ));

  visibleAgents.forEach(agent => {
    const article = document.createElement("article");
    article.className = "agent-card";
    article.dataset.searchable = `${agent.name} ${agent.role} ${agent.status} ${agent.lane}`;

    const header = document.createElement("header");
    const titleWrap = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = agent.name;
    const lane = document.createElement("p");
    lane.textContent = `${agent.lane} lane`;
    titleWrap.append(title, lane);
    header.append(titleWrap, createStatus(agent.status));

    const role = document.createElement("p");
    role.textContent = agent.role;

    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.setProperty("--progress", `${agent.progress}%`);
    track.append(fill);

    article.append(header, role, track);
    dom.agentQueue.append(article);
  });
}

function renderPromptVersions() {
  dom.promptVersionList.replaceChildren();
  promptVersions.forEach(version => {
    const article = document.createElement("article");
    article.className = "version-item";
    article.dataset.searchable = `${version.title} ${version.scope} ${version.rule}`;

    const header = document.createElement("header");
    const title = document.createElement("h3");
    title.textContent = version.title;
    header.append(title, createStatus(version.id === state.promptVersion ? "Active" : "Ready"));

    const scope = document.createElement("p");
    scope.textContent = version.scope;
    const rule = document.createElement("p");
    rule.textContent = version.rule;
    article.append(header, scope, rule);
    dom.promptVersionList.append(article);
  });
}

function renderKnowledge() {
  dom.knowledgeList.replaceChildren();
  state.run.evidence.forEach(item => {
    const article = document.createElement("article");
    article.className = "knowledge-item";
    article.dataset.searchable = `${item.title} ${item.trust} ${item.summary}`;

    const header = document.createElement("header");
    const title = document.createElement("h3");
    title.textContent = item.title;
    const score = createStatus(`${item.weight}%`);
    header.append(title, score);

    const trust = document.createElement("p");
    trust.textContent = item.trust;
    const summary = document.createElement("p");
    summary.textContent = item.summary;
    article.append(header, trust, summary);
    dom.knowledgeList.append(article);
  });
}

function renderEvals() {
  dom.evals.replaceChildren();
  state.run.evals.forEach(item => {
    const article = document.createElement("article");
    article.className = "score-card";
    article.dataset.searchable = `${item.name} ${item.note}`;

    const header = document.createElement("header");
    const title = document.createElement("h3");
    title.textContent = item.name;
    const score = document.createElement("strong");
    score.textContent = `${item.score}`;
    header.append(title, score);

    const note = document.createElement("p");
    note.textContent = item.note;

    const meter = document.createElement("div");
    meter.className = "score-meter";
    const bar = document.createElement("span");
    bar.style.setProperty("--score", `${item.score}%`);
    meter.append(bar);

    article.append(header, note, meter);
    dom.evals.append(article);
  });
}

function renderApproval() {
  if (state.approved) {
    dom.approvalState.textContent = "Approved";
    dom.approvalState.className = "status-label ready";
    dom.approvalCopy.textContent = "Human approval is recorded. This demo still will not execute privileged actions.";
    dom.approveRun.disabled = true;
    return;
  }

  if (!state.approvalRequired) {
    dom.approvalState.textContent = "Not required";
    dom.approvalState.className = "status-label ready";
    dom.approvalCopy.textContent = "Approval gate is disabled for this local UI demo only.";
    dom.approveRun.disabled = true;
    return;
  }

  dom.approvalState.textContent = "Waiting";
  dom.approvalState.className = "status-label waiting";
  dom.approvalCopy.textContent = "No privileged action will run until reviewed.";
  dom.approveRun.disabled = false;
}

function renderAudit() {
  dom.auditTimeline.replaceChildren();
  state.audit.slice(-8).reverse().forEach(event => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = event.title;
    const detail = document.createElement("span");
    detail.textContent = `${formatTime(event.at)} - ${event.detail}`;
    item.append(title, detail);
    dom.auditTimeline.append(item);
  });
}

function createStatus(label) {
  const status = document.createElement("span");
  status.className = "status-label";
  status.textContent = label;
  if (label === "Ready" || label === "Active" || label === "Running" || label.includes("%")) {
    status.classList.add("ready");
  } else {
    status.classList.add("attention");
  }
  return status;
}

function addAudit(title, detail) {
  state.audit.push(makeAudit(title, detail));
  if (state.audit.length > 40) {
    state.audit = state.audit.slice(-40);
  }
}

function makeAudit(title, detail) {
  return {
    title,
    detail,
    at: new Date().toISOString()
  };
}

function saveAndRender(showSavedToast = true) {
  saveState();
  render();
  if (showSavedToast) showToast("State saved locally.");
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    showToast("Local storage is unavailable; state remains in memory.");
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.run || !Array.isArray(parsed.audit)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    dom.toast.classList.remove("is-visible");
  }, 2200);
}

function filterVisibleText(query) {
  const normalized = query.trim().toLowerCase();
  const searchable = [...document.querySelectorAll("[data-searchable]")];
  searchable.forEach(node => {
    const text = node.dataset.searchable.toLowerCase();
    node.classList.toggle("is-hidden", normalized.length > 0 && !text.includes(normalized));
  });
}

function exportAudit() {
  const payload = {
    app: "SEIS AI Command Core",
    mode: state.mode,
    provider: "disconnected",
    run: state.run.id,
    traceId: state.run.traceId,
    audit: state.audit
  };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.run.id.toLowerCase()}-audit.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  addAudit("Audit exported", "Local JSON audit file prepared by the browser.");
  saveAndRender(false);
  showToast("Audit export prepared.");
}

function toTitle(value) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

window.SeisAIDemo = {
  routeTask,
  computeRisk,
  generateSteps,
  generateAgents,
  selectKnowledge,
  evaluateRun,
  createRun,
  getState: () => state
};
