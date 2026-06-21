const storageKey = "seis-ai-command-core-state-v1";
const macBridgeBase = "seisdemo://ai-command-core/run";

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
  },
  {
    id: "ai-core-contract-spine",
    title: "AI Core contract spine",
    trust: "Fixture contract",
    summary: "The demo is linked to restored model-router, prompt-engine, agent-runtime, tool-registry, knowledge, and repository-assistant fixtures."
  },
  {
    id: "unified-agent-plugin-ssh-fabric",
    title: "Unified agent, plugin, and SSH fabric",
    trust: "Integration contract",
    summary: "SEIS AI now connects controlled agents, specialist plugin feeds, SSH approval boundaries, and AI websites through one local fixture-backed fabric."
  }
];

const agentCatalog = [
  {
    id: "seis-assistant",
    name: "SEIS Assistant",
    role: "Coordinates user intent, routes work, and keeps SEIS AI boundaries visible.",
    lane: "Plan"
  },
  {
    id: "repository-analyst",
    name: "Repository Analyst",
    role: "Reads repository metadata, source documents, and validation state without mutating work.",
    lane: "Review"
  },
  {
    id: "goal-architect",
    name: "Goal Architect",
    role: "Turns ambitions into goals, milestones, blockers, and reviewable next actions.",
    lane: "Plan"
  },
  {
    id: "research-synthesizer",
    name: "Research Synthesizer",
    role: "Summarizes approved sources with citations and provenance boundaries.",
    lane: "Review"
  },
  {
    id: "model-evaluator",
    name: "Model Evaluator",
    role: "Runs fixture-backed prompt, route, agent, retrieval, and evaluation checks.",
    lane: "Review"
  },
  {
    id: "workflow-operator",
    name: "Workflow Operator",
    role: "Runs approved local workflows with visible state, cancellation, and audit boundaries.",
    lane: "Build"
  },
  {
    id: "plugin-steward",
    name: "Plugin Steward",
    role: "Feeds SEIS specialist plugin lanes into SEIS AI as metadata and reviewable plans.",
    lane: "Plan"
  },
  {
    id: "ssh-operations-reviewer",
    name: "SSH Operations Reviewer",
    role: "Reviews SSH plans and stops before live host mutation without explicit approval.",
    lane: "Security"
  },
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
    id: "documentation-maintainer",
    name: "Documentation Maintainer",
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

const providerReadinessCatalog = [
  {
    id: "local-deterministic",
    name: "Local deterministic",
    state: "Active",
    boundary: "No provider SDK, no network request, no secret storage."
  },
  {
    id: "server-adapter",
    name: "Server-side provider adapter",
    state: "Designed",
    boundary: "OpenAI, Anthropic, Google, and Qwen-style routes must stay server-side."
  },
  {
    id: "local-model-adapter",
    name: "Local model adapter",
    state: "Ready to wire",
    boundary: "Ollama or local model calls require operator setup and remain opt-in."
  },
  {
    id: "browser-secrets",
    name: "Browser secret entry",
    state: "Blocked",
    boundary: "The demo never asks the browser to store provider API keys."
  },
  {
    id: "seis-plugin-feed",
    name: "SEIS plugin feed",
    state: "Fixture backed",
    boundary: "Specialist plugins feed metadata, lane profiles, MCP tool names, and plans into SEIS AI without permission expansion."
  },
  {
    id: "ssh-execution-plane",
    name: "SSH execution plane",
    state: "Approval gated",
    boundary: "SSH remains audit, verify, or dry-run only until host, fingerprint, public key, rollback, and human approval are present."
  }
];

const fabricAgentIds = [
  "seis-assistant",
  "repository-analyst",
  "goal-architect",
  "research-synthesizer",
  "documentation-maintainer",
  "model-evaluator",
  "workflow-operator",
  "plugin-steward",
  "ssh-operations-reviewer"
];

const fabricOverview = {
  id: "seis-ai-unified-integration-fabric",
  status: "local-fixture-backed",
  mode: "plan-first-no-live-mutation",
  validation: "npm run check:seis-ai-unified-integration-fabric",
  boundary: "No live provider call, SSH mutation, deployment, database migration, payment action, branch deletion, force push, or model training is enabled."
};

const pluginFeedLanes = [
  {
    id: "seis-governance",
    name: "SEIS Governance",
    posture: "read-plan-review",
    feeds: ["Documentation Maintainer", "Repository Analyst", "Goal Architect", "Plugin Steward"],
    tools: ["seis_governance_status", "seis_governance_plan"]
  },
  {
    id: "seis-cloud",
    name: "SEIS Cloud",
    posture: "plan-only-until-approved",
    feeds: ["Workflow Operator", "SSH Operations Reviewer", "Plugin Steward"],
    tools: ["seis_cloud_status", "seis_cloud_plan"]
  },
  {
    id: "seis-code",
    name: "SEIS Code",
    posture: "read-plan-local-check",
    feeds: ["Repository Analyst", "Model Evaluator", "Plugin Steward"],
    tools: ["seis_code_status", "seis_code_plan"]
  },
  {
    id: "seis-design",
    name: "SEIS Design",
    posture: "read-plan-ui-review",
    feeds: ["SEIS Assistant", "Documentation Maintainer", "Plugin Steward"],
    tools: ["seis_design_status", "seis_design_plan"]
  },
  {
    id: "seis-data",
    name: "SEIS Data",
    posture: "metadata-only-source-governed",
    feeds: ["Research Synthesizer", "Model Evaluator", "Plugin Steward"],
    tools: ["seis_data_status", "seis_data_plan"]
  }
];

const sshExecutionPlane = {
  id: "ssh-hardening-contract",
  allowedModes: ["audit", "dashboard", "verify", "dry-run"],
  blockedWithoutApproval: ["harden", "full-setup", "firewall-apply", "authorized-keys-write", "sudo-live-mutation"],
  requiredHumanInputs: ["target-host", "approved-public-key", "host-fingerprint", "rollback-plan", "maintenance-window"],
  privateKeyRule: "Private key remains exclusively under operator control."
};

const aiWebsiteSurfaces = [
  {
    id: "seis-ai-demo",
    name: "SEIS AI Command Core",
    path: "apps/seis-ai-demo",
    role: "AI Command Core local web app"
  },
  {
    id: "seis-demo-web",
    name: "SEIS Demo Web",
    path: "apps/seis-demo-web",
    role: "Contract-first AI/native demo website"
  },
  {
    id: "seis-command-center",
    name: "SEIS Command Center",
    path: "apps/seis-core",
    role: "Command Center shell with AI Core fixture view"
  },
  {
    id: "portfolio-ai-website",
    name: "Portfolio AI Website",
    path: "apps/web",
    role: "Browser-facing website surface with future SEIS AI routing points"
  }
];

const activationBlockers = [
  "human approval for live SSH host changes",
  "server-side provider adapter with credential isolation",
  "plugin permission expansion review",
  "deployment target approval",
  "production rollback plan"
];

const activationMatrixOverview = {
  id: "seis-ai-activation-matrix",
  status: "local-fixture-backed",
  installSurface: "seis-ai-agent@seis-repo",
  mode: "single-agent-embedded-lanes-plan-only",
  validation: "npm run check:seis-ai-activation-matrix",
  standaloneLaneInstallMode: "disabled",
  liveMutationDefault: "blocked"
};

const websiteFeatureFabricOverview = {
  id: "seis-ai-website-feature-fabric",
  status: "local-fixture-backed",
  mode: "single-prompt-website-feature-orchestration",
  validation: "npm run check:seis-ai-website-feature-fabric",
  acceptedLocalScope: "fixture-backed contracts, visible local UI wiring, scenario links, validation gates, and non-claim boundaries",
  blockedClaims: [
    "production deployment complete",
    "all external plugins installed",
    "live SSH host mutation complete",
    "provider model calls complete",
    "frontier model training complete",
    "unbounded token spend complete"
  ]
};

const websiteFeatureSurfaces = [
  {
    id: "seis-ai-demo",
    name: "SEIS AI Command Core",
    coverage: "visible-local-ui",
    features: ["router", "agents", "workflow", "fabric", "activation matrix", "website feature fabric", "prompts", "knowledge", "evals", "approvals", "audit"],
    feeds: ["SEIS Assistant", "Repository Analyst", "Plugin Steward", "SSH Operations Reviewer"]
  },
  {
    id: "seis-demo-web",
    name: "SEIS Demo Web",
    coverage: "scenario-linked",
    features: ["command core bridge", "fabric scenario", "activation matrix scenario", "website feature fabric scenario"],
    feeds: ["SEIS Assistant", "Documentation Maintainer", "Plugin Steward"]
  },
  {
    id: "seis-command-center",
    name: "SEIS Command Center",
    coverage: "fixture-inspection",
    features: ["AI Core fixture view", "command center shell", "contract inspection", "website feature fabric"],
    feeds: ["SEIS Assistant", "Repository Analyst", "Goal Architect", "Plugin Steward"]
  },
  {
    id: "portfolio-ai-website",
    name: "Portfolio AI Website",
    coverage: "linked-future-routing-point",
    features: ["browser-facing surface", "future SEIS AI route slot", "no provider key entry", "website feature fabric"],
    feeds: ["SEIS Assistant", "Documentation Maintainer"]
  }
];

const installedAIHelpers = [
  {
    id: "codex",
    name: "Codex CLI",
    version: "0.139.0",
    status: "active-current-session"
  },
  {
    id: "claude",
    name: "Claude Code",
    version: "2.1.177",
    status: "blocked-not-logged-in"
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    version: "0.46.0",
    status: "blocked-no-auth-method"
  },
  {
    id: "qwen",
    name: "Qwen Code",
    version: "0.18.0",
    status: "blocked-no-auth-type"
  },
  {
    id: "opencode",
    name: "OpenCode",
    version: "1.17.4",
    status: "detected-not-invoked-for-review"
  },
  {
    id: "ollama",
    name: "Ollama",
    version: "0.30.10",
    status: "aborted-output-not-accepted"
  }
];

const qwenIntake = {
  safeIdeas: [
    "Multi-agent execution timeline",
    "Workflow node builder",
    "Provider/model profile mapping",
    "Usage and activity metrics",
    "Knowledge graph presentation"
  ],
  excludedCategories: [
    "env and credential examples",
    "live OpenAI/Anthropic/Google calls",
    "browser API-key storage",
    "Stripe, Supabase, Prisma, Pinecone, deployment, and bash setup fragments"
  ]
};

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
  providerReadiness: document.querySelector("#provider-readiness"),
  agentQueue: document.querySelector("#agent-queue"),
  agentFilter: document.querySelector("#agent-filter"),
  workflowMap: document.querySelector("#workflow-map"),
  runMetrics: document.querySelector("#run-metrics"),
  fabricSummary: document.querySelector("#fabric-summary"),
  fabricAgents: document.querySelector("#fabric-agents"),
  fabricPluginFeeds: document.querySelector("#fabric-plugin-feeds"),
  fabricSshPlane: document.querySelector("#fabric-ssh-plane"),
  fabricActivationMatrix: document.querySelector("#fabric-activation-matrix"),
  fabricWebsiteFeatures: document.querySelector("#fabric-website-features"),
  fabricWebsites: document.querySelector("#fabric-websites"),
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
  exportPlan: document.querySelector("#export-plan"),
  openMacOS: document.querySelector("#open-macos"),
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
} else if (!Array.isArray(state.run.workflow) || !Array.isArray(state.run.providerReadiness) || !Array.isArray(state.run.metrics)) {
  state.run = createRun(state);
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
  dom.exportPlan.addEventListener("click", exportPlanMarkdown);
  dom.openMacOS.addEventListener("click", openInMacOS);

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
      if (action === "macos") openInMacOS();
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

function openInMacOS() {
  state.prompt = dom.promptInput.value.trim() || defaultPrompt;
  state.promptVersion = dom.promptVersion.value;
  state.promptNotes = dom.promptNotes.value.trim();
  state.run = createRun(state);
  addAudit("macOS handoff requested", `${state.run.id} prepared for SEIS AI Command Core desktop.`);
  saveAndRender(false);
  window.location.href = buildMacHandoffURL(state);
  showToast("Opening SEIS AI Command Core.");
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
  const workflow = generateWorkflow(steps, agents, route, risk, input.approvalRequired);
  const providerReadiness = generateProviderReadiness(route.selected.id);
  const metrics = generateRunMetrics(prompt, steps, agents, evals, risk, providerReadiness);

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
    workflow,
    providerReadiness,
    metrics,
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

function generateWorkflow(steps, agents, route, risk, approvalRequired) {
  const runningAgents = agents.filter(agent => agent.status === "Running").length;
  const reviewAgents = agents.filter(agent => agent.status === "Review").length;
  return [
    {
      id: "intake",
      type: "Trigger",
      title: "Prompt intake",
      detail: `${steps.length} bounded plan steps prepared from the current request.`,
      state: "Complete"
    },
    {
      id: "route",
      type: "Route",
      title: route.selected.name,
      detail: `${route.selected.score}% route score; provider calls remain disconnected.`,
      state: "Active"
    },
    {
      id: "agents",
      type: "Agents",
      title: "Supervised runtime",
      detail: `${runningAgents} running agent lane${runningAgents === 1 ? "" : "s"}, ${reviewAgents} review lane${reviewAgents === 1 ? "" : "s"}.`,
      state: reviewAgents > 0 ? "Review" : "Ready"
    },
    {
      id: "evaluate",
      type: "Eval",
      title: "Quality gate",
      detail: `Risk is ${risk.level}; evaluation must pass before approval.`,
      state: risk.level === "High" ? "Review" : "Ready"
    },
    {
      id: "approval",
      type: "Approval",
      title: approvalRequired ? "Human gate required" : "Local gate optional",
      detail: "Push, PR, live model, SSH, deploy, and secret actions remain blocked.",
      state: approvalRequired ? "Waiting" : "Ready"
    },
    {
      id: "handoff",
      type: "Handoff",
      title: "Web to macOS",
      detail: "Current prompt, mode, prompt version, risk controls, and notes can open in the native console.",
      state: "Ready"
    }
  ];
}

function generateProviderReadiness(selectedProfileId) {
  return providerReadinessCatalog.map(provider => {
    const emphasis = provider.id === "local-deterministic" || selectedProfileId === "security-reviewer" && provider.id === "browser-secrets";
    return {
      ...provider,
      emphasized: Boolean(emphasis)
    };
  });
}

function generateRunMetrics(prompt, steps, agents, evals, risk, providerReadiness) {
  const running = agents.filter(agent => agent.status === "Running").length;
  const review = agents.filter(agent => agent.status === "Review").length;
  const readyProviders = providerReadiness.filter(provider => provider.state !== "Blocked").length;
  return [
    {
      id: "steps",
      label: "Plan steps",
      value: String(steps.length),
      note: "Deterministic work packages"
    },
    {
      id: "agents",
      label: "Agents active",
      value: `${running}/${agents.length}`,
      note: review > 0 ? `${review} review lane` : "No review lane"
    },
    {
      id: "providers",
      label: "Provider paths",
      value: `${readyProviders}/${providerReadiness.length}`,
      note: "Live calls disabled"
    },
    {
      id: "risk",
      label: "Risk score",
      value: String(risk.score),
      note: `${risk.level} local risk`
    },
    {
      id: "evals",
      label: "Eval gates",
      value: String(evals.length),
      note: "Clarity/security/privacy"
    },
    {
      id: "prompt",
      label: "Prompt size",
      value: String(prompt.length),
      note: "Characters"
    }
  ];
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
  renderProviderReadiness();
  renderAgents();
  renderWorkflow();
  renderRunMetrics();
  renderFabric();
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

function renderProviderReadiness() {
  dom.providerReadiness.replaceChildren();
  state.run.providerReadiness.forEach(provider => {
    const article = document.createElement("article");
    article.className = "provider-card";
    if (provider.emphasized) article.classList.add("is-emphasized");
    article.dataset.searchable = `${provider.name} ${provider.state} ${provider.boundary}`;

    const header = document.createElement("header");
    const title = document.createElement("h3");
    title.textContent = provider.name;
    header.append(title, createStatus(provider.state));

    const boundary = document.createElement("p");
    boundary.textContent = provider.boundary;
    article.append(header, boundary);
    dom.providerReadiness.append(article);
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

function renderWorkflow() {
  dom.workflowMap.replaceChildren();
  state.run.workflow.forEach((node, index) => {
    const article = document.createElement("article");
    article.className = "workflow-node";
    article.dataset.searchable = `${node.type} ${node.title} ${node.detail} ${node.state}`;

    const indexLabel = document.createElement("span");
    indexLabel.className = "workflow-index";
    indexLabel.textContent = String(index + 1).padStart(2, "0");

    const content = document.createElement("div");
    const eyebrow = document.createElement("span");
    eyebrow.className = "workflow-type";
    eyebrow.textContent = node.type;
    const title = document.createElement("h3");
    title.textContent = node.title;
    const detail = document.createElement("p");
    detail.textContent = node.detail;
    content.append(eyebrow, title, detail);

    article.append(indexLabel, content, createStatus(node.state));
    dom.workflowMap.append(article);
  });
}

function renderRunMetrics() {
  dom.runMetrics.replaceChildren();
  state.run.metrics.forEach(metric => {
    const article = document.createElement("article");
    article.className = "metric-tile";
    article.dataset.searchable = `${metric.label} ${metric.value} ${metric.note}`;

    const label = document.createElement("span");
    label.textContent = metric.label;
    const value = document.createElement("strong");
    value.textContent = metric.value;
    const note = document.createElement("p");
    note.textContent = metric.note;
    article.append(label, value, note);
    dom.runMetrics.append(article);
  });
}

function generateFabricSummary() {
  return [
    {
      id: "agents",
      label: "Controlled agents",
      value: String(fabricAgentIds.length),
      note: "Bounded local runtime lanes"
    },
    {
      id: "plugin-lanes",
      label: "Plugin feed lanes",
      value: String(pluginFeedLanes.length),
      note: "Metadata and plans only"
    },
    {
      id: "activation-matrix",
      label: "Activation matrix",
      value: activationMatrixOverview.status === "local-fixture-backed" ? "On" : "Off",
      note: "Single-agent embedded lanes"
    },
    {
      id: "website-feature-fabric",
      label: "Website fabric",
      value: websiteFeatureFabricOverview.status === "local-fixture-backed" ? "On" : "Off",
      note: "Single prompt feature map"
    },
    {
      id: "ssh-modes",
      label: "SSH safe modes",
      value: String(sshExecutionPlane.allowedModes.length),
      note: "Audit, dashboard, verify, dry-run"
    },
    {
      id: "ai-websites",
      label: "AI websites",
      value: String(aiWebsiteSurfaces.length),
      note: "Linked local surfaces"
    },
    {
      id: "blockers",
      label: "Activation blockers",
      value: String(activationBlockers.length),
      note: "Approval required before live action"
    }
  ];
}

function renderFabric() {
  dom.fabricSummary.replaceChildren();
  generateFabricSummary().forEach(item => {
    const article = document.createElement("article");
    article.className = "metric-tile";
    article.dataset.searchable = `${item.label} ${item.value} ${item.note}`;

    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.textContent = item.value;
    const note = document.createElement("p");
    note.textContent = item.note;
    article.append(label, value, note);
    dom.fabricSummary.append(article);
  });

  renderFabricAgents();
  renderFabricPluginFeeds();
  renderFabricSshPlane();
  renderFabricActivationMatrix();
  renderFabricWebsiteFeatures();
  renderFabricWebsites();
}

function renderFabricAgents() {
  dom.fabricAgents.replaceChildren();
  agentCatalog
    .filter(agent => fabricAgentIds.includes(agent.id))
    .forEach(agent => {
      const article = createFabricItem(agent.name, agent.lane, agent.role);
      article.append(createTagList([agent.id, `${agent.lane.toLowerCase()} lane`]));
      dom.fabricAgents.append(article);
    });
}

function renderFabricPluginFeeds() {
  dom.fabricPluginFeeds.replaceChildren();
  pluginFeedLanes.forEach(lane => {
    const article = createFabricItem(lane.name, lane.posture, `Feeds ${lane.feeds.join(", ")}.`);
    article.append(createTagList(lane.tools));
    dom.fabricPluginFeeds.append(article);
  });
}

function renderFabricSshPlane() {
  dom.fabricSshPlane.replaceChildren();
  const safeModes = createFabricItem(
    "Allowed modes",
    "No host mutation",
    sshExecutionPlane.allowedModes.join(", ")
  );
  safeModes.append(createTagList(sshExecutionPlane.allowedModes));

  const blockedModes = createFabricItem(
    "Blocked without approval",
    "Requires human gate",
    sshExecutionPlane.blockedWithoutApproval.join(", ")
  );
  blockedModes.append(createTagList(sshExecutionPlane.requiredHumanInputs));

  const keyRule = createFabricItem(
    "Private key rule",
    "Operator controlled",
    sshExecutionPlane.privateKeyRule
  );

  dom.fabricSshPlane.append(safeModes, blockedModes, keyRule);
}

function generateActivationMatrixCards() {
  return [
    {
      title: "Install surface",
      meta: activationMatrixOverview.installSurface,
      detail: "SEIS-Agent is the single install target; specialist lanes are embedded feed lanes."
    },
    {
      title: "Activation mode",
      meta: activationMatrixOverview.mode,
      detail: "Sub-agents run as bounded, human-supervised local fixtures until live adapters are approved."
    },
    {
      title: "Standalone lanes",
      meta: activationMatrixOverview.standaloneLaneInstallMode,
      detail: "SEIS Cloud, Code, Design, Data, and Governance feed SEIS AI through the primary agent."
    },
    {
      title: "Live mutation",
      meta: activationMatrixOverview.liveMutationDefault,
      detail: "Provider calls, SSH apply, deployments, plugin permission expansion, and training remain blocked."
    },
    {
      title: "Validation",
      meta: activationMatrixOverview.validation,
      detail: "The matrix cross-checks agents, plugin lanes, SSH boundaries, and AI websites."
    },
    {
      title: "Installed AI helpers",
      meta: `${installedAIHelpers.length} detected`,
      detail: "Codex is active; Claude, Gemini, and Qwen need auth; Ollama local output was not accepted as validation."
    }
  ];
}

function renderFabricActivationMatrix() {
  dom.fabricActivationMatrix.replaceChildren();
  generateActivationMatrixCards().forEach(card => {
    const article = createFabricItem(card.title, card.meta, card.detail);
    article.append(createTagList([activationMatrixOverview.status]));
    dom.fabricActivationMatrix.append(article);
  });
}

function generateWebsiteFeatureCards() {
  return [
    {
      title: "Single prompt scope",
      meta: websiteFeatureFabricOverview.mode,
      detail: websiteFeatureFabricOverview.acceptedLocalScope
    },
    {
      title: "Website surfaces",
      meta: `${websiteFeatureSurfaces.length} linked`,
      detail: "Each local AI website declares features, agent feeds, plugin feeds, safe SSH exposure, and provider-key policy."
    },
    {
      title: "Blocked claims",
      meta: `${websiteFeatureFabricOverview.blockedClaims.length} blocked`,
      detail: "The fabric prevents local UI wiring from being misreported as deployment, training, provider execution, or unbounded spend."
    },
    {
      title: "Validation",
      meta: websiteFeatureFabricOverview.validation,
      detail: "The validator checks every surface path, entrypoint, contract, agent feed, plugin feed, and UI export hook."
    }
  ];
}

function renderFabricWebsiteFeatures() {
  dom.fabricWebsiteFeatures.replaceChildren();
  generateWebsiteFeatureCards().forEach(card => {
    const article = createFabricItem(card.title, card.meta, card.detail);
    article.append(createTagList([websiteFeatureFabricOverview.status]));
    dom.fabricWebsiteFeatures.append(article);
  });

  websiteFeatureSurfaces.forEach(surface => {
    const article = createFabricItem(surface.name, surface.coverage, `Features: ${surface.features.join(", ")}.`);
    article.append(createTagList(surface.feeds));
    dom.fabricWebsiteFeatures.append(article);
  });
}

function renderFabricWebsites() {
  dom.fabricWebsites.replaceChildren();
  aiWebsiteSurfaces.forEach(surface => {
    const article = createFabricItem(surface.name, surface.path, surface.role);
    article.append(createTagList([surface.id]));
    dom.fabricWebsites.append(article);
  });
}

function createFabricItem(titleText, metaText, detailText) {
  const article = document.createElement("article");
  article.className = "fabric-item";
  article.dataset.searchable = `${titleText} ${metaText} ${detailText}`;

  const header = document.createElement("header");
  const title = document.createElement("h4");
  title.textContent = titleText;
  const meta = document.createElement("span");
  meta.textContent = metaText;
  header.append(title, meta);

  const detail = document.createElement("p");
  detail.textContent = detailText;
  article.append(header, detail);
  return article;
}

function createTagList(tags) {
  const list = document.createElement("div");
  list.className = "fabric-tags";
  tags.forEach(tag => {
    const item = document.createElement("span");
    item.textContent = tag;
    list.append(item);
  });
  return list;
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
  if (label === "Ready" || label === "Active" || label === "Running" || label === "Complete" || label === "Designed" || label === "Ready to wire" || label.includes("%")) {
    status.classList.add("ready");
  } else if (label === "Blocked") {
    status.classList.add("blocked");
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

function exportPlanMarkdown() {
  const markdown = buildMarkdownExport(state);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.run.id.toLowerCase()}-plan.md`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  addAudit("Plan markdown exported", "Local markdown plan prepared by the browser.");
  saveAndRender(false);
  showToast("Markdown export prepared.");
}

function buildMarkdownExport(input = state) {
  const run = input.run;
  const lines = [
    `# ${run.id} SEIS AI Command Core Plan`,
    "",
    `Trace ID: ${run.traceId}`,
    `Mode: ${toTitle(input.mode)}`,
    `Prompt version: ${input.promptVersion}`,
    `Provider: disconnected local demo`,
    `Risk: ${run.risk.level} (${run.risk.score}/100)`,
    `Composite score: ${run.compositeScore}/100`,
    "",
    "## Prompt",
    "",
    input.prompt || defaultPrompt,
    "",
    "## Route",
    "",
    `Selected profile: ${run.route.selected.name} (${run.route.selected.score}%)`,
    "",
    run.route.rationale,
    "",
    "## Plan Steps",
    "",
    ...run.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.detail}`),
    "",
    "## Workflow",
    "",
    ...run.workflow.map(node => `- ${node.type}: ${node.title} [${node.state}] - ${node.detail}`),
    "",
    "## Agents",
    "",
    ...run.agents.map(agent => `- ${agent.name}: ${agent.status}, ${agent.progress}% - ${agent.role}`),
    "",
    "## Provider Readiness",
    "",
    ...run.providerReadiness.map(provider => `- ${provider.name}: ${provider.state} - ${provider.boundary}`),
    "",
    "## Unified Fabric",
    "",
    `Fabric: ${fabricOverview.id}`,
    `Status: ${fabricOverview.status}`,
    `Mode: ${fabricOverview.mode}`,
    `Validation: ${fabricOverview.validation}`,
    "",
    "Controlled agents:",
    ...agentCatalog
      .filter(agent => fabricAgentIds.includes(agent.id))
      .map(agent => `- ${agent.name}: ${agent.role}`),
    "",
    "Plugin feed lanes:",
    ...pluginFeedLanes.map(lane => `- ${lane.name}: ${lane.posture}; feeds ${lane.feeds.join(", ")}`),
    "",
    "SSH execution plane:",
    `- Allowed modes: ${sshExecutionPlane.allowedModes.join(", ")}`,
    `- Blocked without approval: ${sshExecutionPlane.blockedWithoutApproval.join(", ")}`,
    `- ${sshExecutionPlane.privateKeyRule}`,
    "",
    "Activation matrix:",
    `- Install surface: ${activationMatrixOverview.installSurface}`,
    `- Mode: ${activationMatrixOverview.mode}`,
    `- Standalone lane install: ${activationMatrixOverview.standaloneLaneInstallMode}`,
    `- Live mutation default: ${activationMatrixOverview.liveMutationDefault}`,
    `- Validation: ${activationMatrixOverview.validation}`,
    "",
    "Website feature fabric:",
    `- Fabric: ${websiteFeatureFabricOverview.id}`,
    `- Mode: ${websiteFeatureFabricOverview.mode}`,
    `- Accepted local scope: ${websiteFeatureFabricOverview.acceptedLocalScope}`,
    `- Validation: ${websiteFeatureFabricOverview.validation}`,
    "Website feature surfaces:",
    ...websiteFeatureSurfaces.map(surface => `- ${surface.name}: ${surface.coverage}; features ${surface.features.join(", ")}`),
    "Blocked website claims:",
    ...websiteFeatureFabricOverview.blockedClaims.map(claim => `- ${claim}`),
    "",
    "Installed AI collaboration:",
    ...installedAIHelpers.map(helper => `- ${helper.name} ${helper.version}: ${helper.status}`),
    "",
    "AI website surfaces:",
    ...aiWebsiteSurfaces.map(surface => `- ${surface.name}: ${surface.path} - ${surface.role}`),
    "",
    "## Evaluation",
    "",
    ...run.evals.map(item => `- ${item.name}: ${item.score}/100 - ${item.note}`),
    "",
    "## Source Intake",
    "",
    "Safe Qwen-derived ideas:",
    ...qwenIntake.safeIdeas.map(item => `- ${item}`),
    "",
    "Excluded categories:",
    ...qwenIntake.excludedCategories.map(item => `- ${item}`),
    "",
    "No provider API key, live model call, SSH operation, deployment, database migration, or payment action is included in this export.",
    ""
  ];
  return `${lines.join("\n")}\n`;
}

function buildMacHandoffURL(input = state) {
  const url = new URL(macBridgeBase);
  url.searchParams.set("source", "web-demo");
  url.searchParams.set("prompt", input.prompt || defaultPrompt);
  url.searchParams.set("mode", input.mode || "plan");
  url.searchParams.set("promptVersion", input.promptVersion || "seis-command-v0.3");
  url.searchParams.set("notes", input.promptNotes || "");
  url.searchParams.set("approval", input.approvalRequired ? "1" : "0");
  url.searchParams.set("redact", input.redactSecrets ? "1" : "0");
  url.searchParams.set("autonomy", String(Math.max(0, Math.min(3, Number(input.autonomyLevel) || 0))));
  return url.toString();
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
  generateWorkflow,
  generateProviderReadiness,
  generateRunMetrics,
  generateFabricSummary,
  generateActivationMatrixCards,
  generateWebsiteFeatureCards,
  renderFabric,
  selectKnowledge,
  evaluateRun,
  buildMarkdownExport,
  createRun,
  buildMacHandoffURL,
  fabricOverview,
  activationMatrixOverview,
  websiteFeatureFabricOverview,
  installedAIHelpers,
  pluginFeedLanes,
  sshExecutionPlane,
  aiWebsiteSurfaces,
  websiteFeatureSurfaces,
  getState: () => state
};
