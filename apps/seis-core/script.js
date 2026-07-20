const storageKey = "seis-core-state-v1";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

const seedState = {
  activeView: "dashboard",
  activeAgent: "Architect",
  godModeLane: "Build",
  godModeMission: "Build the next safe SEIS AI operating slice with clear evidence, rollback, and no-secret boundaries.",
  repositoryFilter: "all",
  pluginQuery: "",
  settings: {
    compact: false,
    reduceMotion: false
  },
  godModeRuns: [
    {
      id: "godmode-run-setup",
      mission: "Bootstrap SEIS God Mode as a governed AI operating lane.",
      lane: "Plan",
      owner: "Architect Agent",
      status: "Ready",
      evidence: "Architecture model, permission gates, run timeline, and rollback notes."
    },
    {
      id: "godmode-run-ai",
      mission: "Prepare SEIS-owned AI model program without storing provider secrets.",
      lane: "Build",
      owner: "Builder Agent",
      status: "Active",
      evidence: "Permission policy model, memory ranker model, agent router, and evaluation loop."
    }
  ],
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
    name: "SEIS Trusted Marketplace",
    role: "Public marketplace governance",
    health: "Ready",
    docs: 90,
    security: "read-only approval gates",
    tests: "public marketplace validation",
    dependencies: ["SEIS Repo card", "Marketplace intake", "Permission model"],
    dependencyRisk: "External source activation without explicit approval"
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
  },
  {
    name: "Future AI Systems",
    role: "Provider-neutral adapter lane for models not yet wired into SEIS.",
    mode: "Reserved"
  }
];

const godModeLanes = [
  {
    name: "Plan",
    owner: "Architect Agent",
    model: "Claude + OpenAI",
    purpose: "Turn broad SEIS intent into architecture, risk boundaries, acceptance evidence, and rollout order.",
    gate: "Architecture note and rollback path required before implementation."
  },
  {
    name: "Build",
    owner: "Builder Agent",
    model: "OpenAI + local tools",
    purpose: "Implement scoped SEIS artifacts, static workflows, local model scaffolds, and quality checks.",
    gate: "No dependency bloat, no secrets, small reversible changes."
  },
  {
    name: "Review",
    owner: "Security Agent",
    model: "Gemini + Qwen",
    purpose: "Pressure-test permissions, provider assumptions, access boundaries, and hidden operational risk.",
    gate: "Least privilege and audit evidence must be visible."
  },
  {
    name: "Validate",
    owner: "Research Agent",
    model: "OpenAI + future AI systems",
    purpose: "Verify evidence, model readiness, data quality, benchmark fit, and documentation coverage.",
    gate: "Validation must cite concrete files, checks, or rendered behavior."
  }
];

const godModeProtocol = [
  {
    step: "Intake",
    owner: "Architect Agent",
    status: "Ready",
    command: "Convert the request into mission, scope, risk, evidence, and rollback requirements."
  },
  {
    step: "AI Setup",
    owner: "Builder Agent",
    status: "Active",
    command: "Prepare SEIS-owned model lanes for permission policy, memory ranking, routing, and evaluation."
  },
  {
    step: "Execution",
    owner: "Builder Agent",
    status: "Ready",
    command: "Ship one bounded artifact at a time with local state and testable evidence."
  },
  {
    step: "Security Gate",
    owner: "Security Agent",
    status: "Review",
    command: "Block hidden credentials, broad permissions, provider drift, and unsafe automation."
  },
  {
    step: "Learning Loop",
    owner: "Research Agent",
    status: "Active",
    command: "Capture reusable patterns, model cards, dataset cards, eval plans, and decision history."
  }
];

const seisAiSetup = [
  {
    name: "Permission Policy Model",
    type: "Safety classifier",
    status: "Active",
    data: "SEIS permission-policy dataset",
    output: "Approve, review, or deny actions before tools execute.",
    gate: "No credential material in training or UI records."
  },
  {
    name: "Memory Ranker Model",
    type: "Knowledge retriever",
    status: "Active",
    data: "SEIS memory ranking examples",
    output: "Rank relevant repo, architecture, and operating-memory context.",
    gate: "Source citations and stale-memory warnings required."
  },
  {
    name: "Agent Router",
    type: "Orchestration policy",
    status: "Ready",
    data: "Agent lane status, tool permissions, task type, and evidence needs.",
    output: "Route work across the 10-lane SEIS agent taxonomy before launcher execution.",
    gate: "Human-visible lane, owner, and rollback path."
  },
  {
    name: "Local Draft Model",
    type: "Private experimentation",
    status: "Review",
    data: "Redacted local prompts and synthetic examples only.",
    output: "Offline draft reasoning before provider-backed execution.",
    gate: "No secrets, no unpublished credentials, no blind autonomous writes."
  }
];

const fallbackSeisRouterLanes = [
  {
    laneId: "seis",
    label: "SEIS Hub",
    tool: "seis-agent",
    integrationTool: "seis_plugin_integration",
    owner: "Architect Agent",
    defaultGate: "npm run check:seis-ai-agent",
    signal: "Architecture, roadmap, ecosystem coordination, and God Mode scope.",
    handoff: "Frame the mission, risk boundary, validation evidence, and rollback path.",
    status: "Ready"
  },
  {
    laneId: "seis-governance",
    label: "Governance",
    tool: "seis-agent",
    integrationTool: "seis_plugin_integration",
    owner: "Documentation Agent",
    defaultGate: "npm run check:seis-specialist-plugins",
    signal: "Release readiness, quality gates, license posture, and handoff evidence.",
    handoff: "Attach governance proof before commit, push, or completion claims.",
    status: "Ready"
  },
  {
    laneId: "seis-cloud",
    label: "Cloud",
    tool: "seis-agent",
    integrationTool: "seis_plugin_integration",
    owner: "DevOps Agent",
    defaultGate: "npm run check:cloud-access-policy",
    signal: "Cloud, SSH, VPN, deployment, rollback, cost, and provider readiness.",
    handoff: "Keep local, GitHub, and SEIS Cloud boundaries explicit before access changes.",
    status: "Review"
  },
  {
    laneId: "seis-code",
    label: "Code",
    tool: "codex",
    integrationTool: "seis_plugin_integration",
    owner: "Frontend Agent",
    defaultGate: "npm run check:seis-plugin-bundle",
    signal: "Code changes, MCP tools, runtime fixes, tests, and package scripts.",
    handoff: "Implement the smallest durable slice and leave validation hooks visible.",
    status: "Ready"
  },
  {
    laneId: "seis-design",
    label: "Design",
    tool: "open-design",
    integrationTool: "seis_plugin_integration",
    owner: "Design System Agent",
    defaultGate: "npm run check:motion-evidence",
    signal: "UI hierarchy, accessibility, motion, responsive behavior, and design tokens.",
    handoff: "Preserve calm density while making the operational state easier to scan.",
    status: "Ready"
  },
  {
    laneId: "seis-data",
    label: "Data",
    tool: "seis-agent",
    integrationTool: "seis_plugin_integration",
    owner: "AI Systems Agent",
    defaultGate: "npm run check:plugin-capability-lanes",
    signal: "Datasets, memory, provenance, schemas, training evidence, and quality signals.",
    handoff: "Keep synthetic data, source policy, and redaction boundaries attached.",
    status: "Ready"
  },
  {
    laneId: "seis-security",
    label: "Security",
    tool: "seis-agent",
    integrationTool: "seis_plugin_integration",
    owner: "Security Agent",
    defaultGate: "npm run check:seis-ai-agent",
    signal: "Secrets, private keys, vulnerabilities, hardening, permissions, and risk.",
    handoff: "Apply the safety floor before any lower-risk lane can execute.",
    status: "Ready"
  },
  {
    laneId: "seis-research",
    label: "Research",
    tool: "gemini",
    integrationTool: "seis_plugin_integration",
    owner: "Research Agent",
    defaultGate: "npm run check:seis-ai-agent",
    signal: "Official docs, standards, compatibility, source quality, and evidence checks.",
    handoff: "Convert external assumptions into cited evidence before architecture decisions.",
    status: "Active"
  },
  {
    laneId: "seis-automation",
    label: "Automation",
    tool: "seis-agent",
    integrationTool: "seis_plugin_integration",
    owner: "DevOps Agent",
    defaultGate: "npm run check:seis-ai-agent",
    signal: "Idempotent workflows, schedules, runbooks, dry-runs, and rollback steps.",
    handoff: "Make every automated action explainable, reversible, and evidence-producing.",
    status: "Ready"
  },
  {
    laneId: "seis-product",
    label: "Product",
    tool: "openai",
    integrationTool: "seis_plugin_integration",
    owner: "Architect Agent",
    defaultGate: "npm run check:seis-ai-agent",
    signal: "Requirements, acceptance criteria, launch readiness, user outcomes, and non-goals.",
    handoff: "Translate strategy into one shippable roadmap slice with explicit boundaries.",
    status: "Active"
  }
];

let seisRouterArtifact = {
  artifactId: "seis-command-center-router-fallback",
  sourcePolicy: "embedded fallback",
  routeCount: fallbackSeisRouterLanes.length,
  policy: null,
  model: null,
  summary: {
    lanes: fallbackSeisRouterLanes.length,
    ready: fallbackSeisRouterLanes.filter((lane) => lane.status === "Ready").length,
    safetyFloor: "seis-security",
    routeSources: ["fallback"]
  },
  routes: fallbackSeisRouterLanes
};

let seisCorePluginArtifact = {
  sourceRoot: "plugins/seis-core",
  release: { label: "0.000000013", semver: "0.0.13", kind: "large-code-change" },
  counts: { discovered: 63, returned: 0, contractValid: 63, statusReady: 0 },
  plugins: [],
  loadError: "Application plugin catalog has not loaded yet."
};

let seisCorePluginReleaseReadinessArtifact = {
  currentRelease: { label: "0.000000012", semver: "0.0.12" },
  next: { largeCode: { label: "0.000000013" }, annual: { label: "1.0000", year: 2027 } },
  policy: { maximumLabel: "45.0000", largeCodeChangeThreshold: 500 },
  workingTree: { codeLinesChanged: 0, changedCodeFileCount: 0, largeCodeEligible: false },
  decision: "loading",
  loadError: "Release readiness has not loaded yet."
};

const godModeGuardrails = [
  {
    rule: "No secrets in state",
    status: "Ready",
    detail: "God Mode stores mission summaries, not API keys, tokens, private SSH material, or provider credentials."
  },
  {
    rule: "Evidence before release",
    status: "Ready",
    detail: "Every mission keeps a validation artifact, owner, rollback note, and status before handoff."
  },
  {
    rule: "Least privilege tools",
    status: "Review",
    detail: "Remote writes, plugins, cloud actions, and AI providers remain gated by explicit lane ownership."
  },
  {
    rule: "Human-visible autonomy",
    status: "Ready",
    detail: "Agent routing, model role, task boundary, and current decision are visible in the Command Center."
  }
];

const godModeArtifacts = [
  {
    name: "Model Card",
    status: "Active",
    owner: "Research Agent",
    detail: "Captures intended use, limits, evaluation plan, and safety posture for SEIS-owned AI models."
  },
  {
    name: "Dataset Card",
    status: "Active",
    owner: "Security Agent",
    detail: "Documents source policy, redaction boundary, license posture, and excluded secret-bearing data."
  },
  {
    name: "Eval Plan",
    status: "Ready",
    owner: "Builder Agent",
    detail: "Defines acceptance checks for routing, permission policy, memory ranking, and tool safety."
  },
  {
    name: "Run State",
    status: "Review",
    owner: "Architect Agent",
    detail: "Records current mission, lane, evidence, blocker, rollback, and next action."
  }
];

const operationsReadiness = {
  decision: "Review",
  decisionState: "review-before-release",
  qualityGate: "check:seis-command-center-operations-readiness",
  lastEvidence: "local quality passed, external CI still required",
  summary: [
    {
      area: "Release",
      status: "Ready",
      signal: "Work package, handoff, changelog, and source boundary are visible."
    },
    {
      area: "CI",
      status: "Review",
      signal: "Local gates pass; GitHub code scanning and branch protection remain external evidence."
    },
    {
      area: "Security",
      status: "Ready",
      signal: "No-secret policy, permission review, and access model checks stay attached to release decisions."
    },
    {
      area: "Rollback",
      status: "Ready",
      signal: "Rollback path is tied to commit scope, generated reports, and adapter boundaries."
    }
  ],
  checks: [
    {
      name: "Source boundary",
      owner: "Builder Agent",
      evidence: "git status --short and reversible commit scope",
      gate: "clean worktree",
      status: "Ready"
    },
    {
      name: "Command Center contract",
      owner: "Architect Agent",
      evidence: "apps/seis-core plus architecture docs",
      gate: "check:seis-command-center",
      status: "Ready"
    },
    {
      name: "Quality governance",
      owner: "Automation Center",
      evidence: "npm run quality",
      gate: "local quality",
      status: "Ready"
    },
    {
      name: "Security posture",
      owner: "Security Agent",
      evidence: "enterprise gates, access model, dependency scan records",
      gate: "least privilege",
      status: "Ready"
    },
    {
      name: "External CI",
      owner: "GitHub Workflow",
      evidence: "remote checks and code scanning results",
      gate: "external evidence",
      status: "Review"
    },
    {
      name: "Handoff proof",
      owner: "Research Agent",
      evidence: "commit hash, push result, next command, and rollback note",
      gate: "handoff audit",
      status: "Review"
    }
  ]
};

const featureGrowthLedger = {
  completionState: "not-complete",
  coverage: "10/10 topics mapped",
  qualityGate: "check:seis-god-mode-feature-growth-ledger",
  evidenceState: "source-controlled evidence, CI gap open",
  topics: [
    {
      id: "dashboard",
      name: "Dashboard",
      status: "Review",
      evidence: 3,
      gate: "module coverage",
      improvement: "Operating overview now exposes God Mode state, module coverage and evidence-led next actions.",
      gap: "Needs committed screenshot and CI handoff evidence."
    },
    {
      id: "goals",
      name: "Goals",
      status: "Ready",
      evidence: 3,
      gate: "goals evidence ledger",
      improvement: "Goal work is tied to acceptance evidence, validation duty, risk and rollback posture.",
      gap: "Needs final commit boundary proof."
    },
    {
      id: "repos",
      name: "Repositories",
      status: "Review",
      evidence: 3,
      gate: "repo health manifest",
      improvement: "Repo health now tracks publish safety, plugin posture, CI posture and protected work boundaries.",
      gap: "Local branch divergence must stay isolated."
    },
    {
      id: "docs",
      name: "Docs",
      status: "Ready",
      evidence: 3,
      gate: "governance index",
      improvement: "Docs connect architecture, ADR, quality, release readiness and God Mode governance surfaces.",
      gap: "Generated reports must remain current after source changes."
    },
    {
      id: "agents",
      name: "Agents",
      status: "Ready",
      evidence: 3,
      gate: "agent lane status",
      improvement: "Agent lanes expose owner, safety boundary, quality duty and handoff expectations.",
      gap: "Provider-backed execution still requires secure credential flow."
    },
    {
      id: "security",
      name: "Security",
      status: "Review",
      evidence: 3,
      gate: "enterprise security gate",
      improvement: "Security work is visible through permission review, no-secret policy and access model checks.",
      gap: "External Code Scanning and protected-branch evidence remain outside local proof."
    },
    {
      id: "ai-policy",
      name: "AI Policy",
      status: "Ready",
      evidence: 3,
      gate: "enterprise AI gate",
      improvement: "AI actions expose intent, risk, owner, audit, rollback and human approval needs.",
      gap: "Live provider adapters still need least-privilege setup."
    },
    {
      id: "rollback",
      name: "Rollback",
      status: "Ready",
      evidence: 3,
      gate: "release readiness",
      improvement: "Rollback paths are attached to work package, release readiness and automation evidence.",
      gap: "Rollback proof should cite the final pushed commit."
    },
    {
      id: "validation",
      name: "Validation",
      status: "Review",
      evidence: 4,
      gate: "validation plan",
      improvement: "Validation maps command evidence, runtime proof, report freshness and quality gates.",
      gap: "CI evidence is still required before completion."
    },
    {
      id: "handoff",
      name: "Handoff",
      status: "Review",
      evidence: 3,
      gate: "handoff audit",
      improvement: "Handoff records changed surfaces, risk, rollback, next commands and protected user work.",
      gap: "Needs final push confirmation and CI result."
    }
  ],
  blockers: [
    "Commit hash for this exact Command Center ledger slice",
    "Push confirmation on the protected branch workflow",
    "CI or explicit no-CI handoff evidence",
    "Final staged-boundary proof that unrelated user work stayed protected"
  ]
};

const orchestrationLanes = [
  {
    lane: "Plan",
    primary: "Claude",
    collaborators: ["Architect Agent", "Research Agent"],
    handoff: "Architecture hypothesis, risk framing, and ADR candidate."
  },
  {
    lane: "Build",
    primary: "OpenAI",
    collaborators: ["Builder Agent", "Design Agent"],
    handoff: "Implementation slice, tests, UI state, and generated report sync."
  },
  {
    lane: "Validate",
    primary: "Gemini",
    collaborators: ["Research Agent", "Security Agent"],
    handoff: "Compatibility review, provider evidence, and policy checks."
  },
  {
    lane: "Counter-Review",
    primary: "Qwen",
    collaborators: ["Architect Agent", "Security Agent"],
    handoff: "Alternative reasoning, failure-mode critique, and tradeoff notes."
  },
  {
    lane: "Private Draft",
    primary: "Local Models",
    collaborators: ["Research Agent"],
    handoff: "Offline experiments, private sketches, and no-secret draft outputs."
  },
  {
    lane: "Future Adapter",
    primary: "Future AI Systems",
    collaborators: ["Architect Agent", "Builder Agent"],
    handoff: "Provider-neutral capability contract before integration."
  }
];

const handoffAudit = [
  {
    from: "Architect Agent",
    to: "Builder Agent",
    system: "Claude -> OpenAI",
    evidence: "Plan becomes implementation only after module boundary and validation gate are explicit.",
    status: "Ready"
  },
  {
    from: "Builder Agent",
    to: "Security Agent",
    system: "OpenAI -> Gemini",
    evidence: "Code changes pass local tests before permission, dependency and access checks.",
    status: "Review"
  },
  {
    from: "Security Agent",
    to: "Research Agent",
    system: "Gemini -> Qwen",
    evidence: "Policy findings can request counter-review when provider assumptions are weak.",
    status: "Active"
  },
  {
    from: "Research Agent",
    to: "Architect Agent",
    system: "Qwen -> Claude",
    evidence: "Validated assumptions feed back into ADRs, roadmap and architecture notes.",
    status: "Ready"
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
  },
  {
    name: "SEIS Command Center App Plugins",
    health: "Local Demo",
    permissions: "Read-only, task-scoped",
    summary: "63 app-owned plugin packages under plugins/seis-core at app release 0.000000013; AI Core indexes metadata without owning their source."
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

const workflowRuns = [
  {
    workflow: "Quality Governance",
    trigger: "Pre-release gate",
    actor: "Builder Agent",
    started: "Clean detached HEAD",
    duration: "2m 18s",
    status: "Ready",
    evidence: "npm run quality",
    approval: "Local checks pass before release handoff",
    rollback: "Revert feature commit and rerun quality gate"
  },
  {
    workflow: "Generated Reports",
    trigger: "Source-surface change",
    actor: "Automation Center",
    started: "After app source commit",
    duration: "38s",
    status: "Ready",
    evidence: "language distribution and technology stack checks",
    approval: "Reports generated from clean worktree",
    rollback: "Restore previous generated report commit"
  },
  {
    workflow: "Plugin Bundle Check",
    trigger: "Plugin or skill update",
    actor: "Security Agent",
    started: "Permission review queue",
    duration: "Queued",
    status: "Review",
    evidence: "plugin manifest and bundle validation",
    approval: "Manual permission review required",
    rollback: "Disable plugin lane before publish"
  },
  {
    workflow: "Cloud SSH Readiness",
    trigger: "Remote workspace handoff",
    actor: "Platform Agent",
    started: "On demand",
    duration: "Manual",
    status: "Review",
    evidence: "SEIS-SSH picker status and callback-port warning",
    approval: "User-authenticated session required",
    rollback: "Use local terminal workflow until callback is free"
  }
];

const approvalGates = [
  {
    name: "Source Report Gate",
    owner: "Builder Agent",
    requirement: "Refresh generated reports whenever Command Center source changes.",
    status: "Ready",
    evidence: "check:language-distribution and check:seis-technology-stack"
  },
  {
    name: "Security Permission Gate",
    owner: "Security Agent",
    requirement: "Review plugin, SSH, token, and provider permissions before remote write workflows.",
    status: "Review",
    evidence: "Security Center risk reports and plugin permission posture"
  },
  {
    name: "Release Handoff Gate",
    owner: "Architect Agent",
    requirement: "Keep small reversible commits with documented validation and rollback path.",
    status: "Ready",
    evidence: "feature commit, report commit, clean quality run, pushed branch"
  }
];

const rollbackEvidence = [
  {
    surface: "Static Command Center",
    strategy: "Feature work stays in small commits on the current branch.",
    lastVerified: "Clean detached quality",
    status: "Ready",
    detail: "Rollback is reverting the app commit and generated report commit without touching unrelated worktree edits."
  },
  {
    surface: "Generated Reports",
    strategy: "Reports are regenerated from a clean detached worktree after source commits.",
    lastVerified: "Report checks",
    status: "Ready",
    detail: "Rollback restores the previous report commit when report drift is caused by an invalid source change."
  },
  {
    surface: "Remote Access",
    strategy: "SEIS-SSH stays gated by authenticated user session and visible readiness state.",
    lastVerified: "Manual review",
    status: "Review",
    detail: "Rollback is local terminal fallback until callback-port conflict and remote session state are resolved."
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

const permissionReviews = [
  {
    surface: "Plugin Activation",
    permission: "Scoped plugin execution",
    owner: "Security Agent",
    scope: "Activate plugins only when user intent and task relevance are explicit.",
    status: "Ready",
    evidence: "plugin family permissions and marketplace posture",
    nextAction: "Keep remote-write plugins behind review gates."
  },
  {
    surface: "SEIS-SSH",
    permission: "Remote workspace access",
    owner: "Platform Agent",
    scope: "Expose only the SEIS-SSH alias and avoid local Mac, LAN, or direct VPS aliases in pickers.",
    status: "Review",
    evidence: "SEIS-SSH access model and picker compatibility checks",
    nextAction: "Use terminal-compatible Codespaces transport until direct cloud endpoint is approved."
  },
  {
    surface: "AI Provider Actions",
    permission: "Model and tool execution",
    owner: "Architect Agent",
    scope: "Route OpenAI, Claude, Gemini, Qwen, local, and future systems through explicit lanes.",
    status: "Ready",
    evidence: "agent orchestration lanes and handoff audit",
    nextAction: "Require provider-specific credentials through secure setup flows."
  },
  {
    surface: "Generated Reports",
    permission: "Repository write output",
    owner: "Builder Agent",
    scope: "Generated files can change only after source-surface commits and clean report checks.",
    status: "Ready",
    evidence: "language distribution and technology stack report checks",
    nextAction: "Continue generating reports from clean detached worktrees."
  }
];

const dependencyScans = [
  {
    target: "Phase 1 Static App",
    scanner: "Dependency-free source scan",
    coverage: "HTML, CSS, JavaScript, manifest, local state",
    status: "Ready",
    evidence: "No runtime package added for Command Center Phase 1.",
    risk: "Low dependency surface, but source size growth must stay visible."
  },
  {
    target: "SEIS Web Surface",
    scanner: "seis:check web audit",
    coverage: "SEO, contract, style, performance, accessibility, security",
    status: "Ready",
    evidence: "Clean detached quality includes SEIS web audit.",
    risk: "External resources without integrity remain informational."
  },
  {
    target: "Plugin Bundle",
    scanner: "plugin bundle and specialist plugin checks",
    coverage: "Manifest, specialist skills, public repository packages, legacy personal aliases",
    status: "Ready",
    evidence: "check:seis-repo-marketplace and check:seis-specialist-plugins",
    risk: "Provider capability drift requires periodic review."
  },
  {
    target: "SSH Access Model",
    scanner: "SSH governance checks",
    coverage: "Access model, picker compatibility, closed runtime, hardening contract",
    status: "Review",
    evidence: "SEIS-SSH is terminal-compatible while some pickers may show offline.",
    risk: "Callback or picker state can block remote UI session startup."
  }
];

const securityAudits = [
  {
    audit: "Secrets Hygiene",
    cadence: "Every repository write",
    status: "Ready",
    evidence: "No secrets, tokens, certificates, or private cloud material in Command Center records.",
    outcome: "Static evidence summaries only."
  },
  {
    audit: "Least Privilege",
    cadence: "Before remote-write workflows",
    status: "Ready",
    evidence: "Plugin and provider actions remain scoped by activation policy and lane ownership.",
    outcome: "No broad always-on connector posture."
  },
  {
    audit: "Rollback Readiness",
    cadence: "Before release handoff",
    status: "Ready",
    evidence: "Automation Center records rollback evidence for app source and generated reports.",
    outcome: "Small commits and report commits remain reversible."
  },
  {
    audit: "Authenticated Access",
    cadence: "Before SSH or cloud handoff",
    status: "Review",
    evidence: "SEIS-SSH requires user-authenticated session and keeps local fallback visible.",
    outcome: "No hidden cloud readiness claim without proof."
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

const dependencyGraph = [
  {
    node: "Command Shell",
    dependsOn: ["Design tokens", "Local state", "Render functions"],
    risk: "Static modules can become hard to split if live adapters are added too early.",
    mitigation: "Keep Phase 1 dependency-free and define typed adapter seams before Phase 2.",
    status: "Ready"
  },
  {
    node: "Repository Intelligence",
    dependsOn: ["Repository records", "Dependency overview", "Generated reports"],
    risk: "Report drift can hide real ecosystem status.",
    mitigation: "Regenerate language and technology reports from clean worktrees after source changes.",
    status: "Ready"
  },
  {
    node: "Agent Orchestration",
    dependsOn: ["Agent evidence", "AI systems", "Handoff audit"],
    risk: "Multi-model work can become hidden chat context.",
    mitigation: "Record lanes, collaborators, handoff artifact, and validation ownership.",
    status: "Ready"
  },
  {
    node: "Automation Operations",
    dependsOn: ["Workflow definitions", "Run history", "Approval gates", "Rollback evidence"],
    risk: "Automations without gates can publish stale or unsafe outputs.",
    mitigation: "Require validation evidence and rollback path before release handoff.",
    status: "Review"
  }
];

const moduleRelationships = [
  {
    from: "Dashboard",
    to: "Goals",
    contract: "Dashboard summarizes active goals and recommended actions without owning goal mutation.",
    owner: "Product lane",
    status: "Ready"
  },
  {
    from: "Repositories",
    to: "Automation",
    contract: "Repository source changes trigger report refresh, quality checks, and generated evidence updates.",
    owner: "Builder lane",
    status: "Ready"
  },
  {
    from: "Agents",
    to: "Architecture",
    contract: "Agent responsibilities produce ADR candidates, architecture constraints, and handoff audit entries.",
    owner: "Architect lane",
    status: "Ready"
  },
  {
    from: "Plugins",
    to: "Security",
    contract: "Plugin activation remains permission-gated and visible before remote writes or provider actions.",
    owner: "Security lane",
    status: "Review"
  },
  {
    from: "Knowledge",
    to: "Documentation",
    contract: "Reusable memory, research notes, and decision history feed the documentation hub.",
    owner: "Research lane",
    status: "Active"
  }
];

const technicalDebtRegister = [
  {
    id: "ARCH-001",
    area: "Static render module",
    severity: "Medium",
    status: "Tracked",
    owner: "Architect Agent",
    action: "Split data, render helpers, and interaction handlers before live API adapters land."
  },
  {
    id: "ARCH-002",
    area: "Mock ecosystem records",
    severity: "Medium",
    status: "Review",
    owner: "Builder Agent",
    action: "Introduce typed records for GitHub, plugin, security, automation, and knowledge adapters in Phase 2."
  },
  {
    id: "ARCH-003",
    area: "Local-only persistence",
    severity: "Low",
    status: "Tracked",
    owner: "Security Agent",
    action: "Define encrypted storage and no-secret boundaries before authenticated provider data is stored."
  },
  {
    id: "ARCH-004",
    area: "Native bridge contract",
    severity: "Low",
    status: "Planned",
    owner: "Design Agent",
    action: "Map stable module contracts to SwiftUI macOS and iOS surfaces after Phase 1 workflows stabilize."
  }
];

const knowledgeItems = [
  ["Repository Memory", "Workspace defaults, branch governance, and SEIS operating rules."],
  ["Research Log", "Primary-source notes for Apple, OpenAI, GitHub and cloud assumptions."],
  ["Decision Ledger", "Tradeoffs, risks, rejected shortcuts, and future migration triggers."],
  ["System Health", "Quality, docs, security, tests and ecosystem readiness indicators."]
];

const knowledgeGraphNodes = [
  {
    name: "Repository Memory",
    type: "Memory",
    owner: "Architect Agent",
    status: "Ready",
    signal: "Workspace defaults, branch governance, repo boundaries, and SEIS operating rules.",
    links: ["Decision History", "Reusable Patterns", "Security Policy"]
  },
  {
    name: "Research Sources",
    type: "Research",
    owner: "Research Agent",
    status: "Active",
    signal: "Primary-source notes for Apple, OpenAI, GitHub, cloud, platform, and compatibility assumptions.",
    links: ["Decision History", "AI Agent Handoffs"]
  },
  {
    name: "Decision History",
    type: "Governance",
    owner: "Architect Agent",
    status: "Ready",
    signal: "ADR candidates, accepted tradeoffs, rejected shortcuts, and migration triggers.",
    links: ["Repository Memory", "Architecture Decisions", "Reusable Patterns"]
  },
  {
    name: "Reusable Patterns",
    type: "Practice",
    owner: "Builder Agent",
    status: "Ready",
    signal: "Repeatable implementation, validation, rollback, and report-refresh patterns.",
    links: ["Automation Workflows", "Security Policy"]
  },
  {
    name: "Security Policy",
    type: "Trust",
    owner: "Security Agent",
    status: "Review",
    signal: "No-secret boundaries, least-privilege rules, permission scopes, and external access notes.",
    links: ["Repository Memory", "AI Agent Handoffs"]
  },
  {
    name: "AI Agent Handoffs",
    type: "Orchestration",
    owner: "Research Agent",
    status: "Active",
    signal: "Model lane handoffs, validation ownership, source provenance, and stale-memory warnings.",
    links: ["Research Sources", "Decision History"]
  }
];

const knowledgeEdges = [
  {
    from: "Repository Memory",
    to: "Decision History",
    contract: "Repo defaults and branch constraints must be cited when architecture decisions change.",
    status: "Ready"
  },
  {
    from: "Research Sources",
    to: "AI Agent Handoffs",
    contract: "Provider assumptions move to agent work only with source provenance and staleness notes.",
    status: "Active"
  },
  {
    from: "Reusable Patterns",
    to: "Automation Workflows",
    contract: "Repeated checks become automation candidates only after a manual validation pattern is stable.",
    status: "Ready"
  },
  {
    from: "Security Policy",
    to: "Plugin Systems",
    contract: "Plugin and remote-write workflows inherit least-privilege and no-secret boundaries.",
    status: "Review"
  }
];

const memoryEvidence = [
  {
    source: "SEIS SUPREME V12 defaults",
    scope: "Workspace, tool hierarchy, git hygiene, output reporting",
    freshness: "Durable",
    status: "Ready",
    evidence: "Memory registry and AGENTS operating contract"
  },
  {
    source: "Command Center architecture",
    scope: "Module map, data model, testing strategy, platform phases",
    freshness: "Current branch",
    status: "Ready",
    evidence: "docs/architecture/seis-command-center.md"
  },
  {
    source: "Operations Readiness",
    scope: "Release, CI, security, rollback, and handoff evidence",
    freshness: "Review before release",
    status: "Review",
    evidence: "content/development/seis-command-center-operations-readiness.json"
  },
  {
    source: "Generated Reports",
    scope: "Language distribution and technology stack freshness",
    freshness: "Source-sensitive",
    status: "Active",
    evidence: "reports/language-distribution.md and reports/seis-technology-stack.md"
  }
];

const decisionHistory = [
  {
    decision: "Keep Phase 1 dependency-free",
    owner: "Architect Agent",
    status: "Ready",
    evidence: "Static HTML, CSS, JavaScript shell",
    impact: "Fast startup, low dependency surface, simple rollback."
  },
  {
    decision: "Expose AI systems through visible lanes",
    owner: "Research Agent",
    status: "Ready",
    evidence: "OpenAI, Claude, Gemini, Qwen, local, and future adapters",
    impact: "Multi-model collaboration stays inspectable."
  },
  {
    decision: "Treat completion as evidence-gated",
    owner: "Security Agent",
    status: "Review",
    evidence: "Operations Readiness and feature growth ledger",
    impact: "Local implementation cannot masquerade as release readiness."
  }
];

const reusablePatterns = [
  {
    name: "Clean worktree release slice",
    reuse: "Use detached worktrees for risky UI and report changes when the main worktree is dirty.",
    status: "Ready",
    evidence: "Small commits, generated report refresh, visual QA"
  },
  {
    name: "Evidence-first agent handoff",
    reuse: "Every agent lane hands off owner, validation command, rollback path, and residual risk.",
    status: "Ready",
    evidence: "handoffAudit and operations readiness records"
  },
  {
    name: "Staleness-aware memory",
    reuse: "Memory-derived facts require current verification or a visible stale-context warning.",
    status: "Review",
    evidence: "memoryEvidence records"
  },
  {
    name: "No-secret render model",
    reuse: "Command Center renders summaries and evidence paths, never credentials or private material.",
    status: "Ready",
    evidence: "Security operations model"
  }
];

const viewMeta = {
  dashboard: ["Dashboard", "SEIS operating center", "Manage goals, repositories, architecture decisions, documentation, agents, and system health from one calm surface.", "New Goal"],
  godmode: ["God Mode", "SEIS AI mission control", "Coordinate custom SEIS AI setup, agent lanes, evidence gates, and controlled execution.", "Run Mission"],
  goals: ["Goals", "Goal tracking", "Create goals, edit priority/status, add risks, and keep next actions visible.", "Create Goal"],
  repositories: ["Repositories", "Repository management", "Scan repository health, documentation coverage, security posture, and testing status.", "Refresh"],
  documentation: ["Documentation", "Documentation management", "Track architecture notes, ADR records, roadmap, and knowledge base coverage.", "Add Note"],
  search: ["Search", "SEIS Search Center", "Search across SEIS AI, Code, Design, Cloud, Website, Plugins, Files, and Apps with clear mock/real boundaries.", "Open Search"],
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
  renderGodMode();
  renderGoals();
  renderRepositories();
  renderDocumentation();
  renderAgents();
  renderPlugins();
  renderPluginReleaseReadiness();
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

  renderOperationsReadiness();

  $("#operating-domain-grid").innerHTML = operatingDomains.map((domain) => `
    <article class="domain-card">
      <div class="card-topline">
        <strong>${escapeHtml(domain.name)}</strong>
        <span class="status-pill ${statusClass(domain.status)}">${escapeHtml(domain.status)}</span>
      </div>
      <p>${escapeHtml(domain.signal)}</p>
      <div class="meta-row">
        <span class="meta-chip">${escapeHtml(domain.lane)}</span>
        <span class="meta-chip">${escapeHtml(domain.module)}</span>
      </div>
    </article>
  `).join("");

  $("#dashboard-goals").innerHTML = activeGoals.slice(0, 4).map((goal) => `
    <article class="goal-row">
      <div>
        <strong>${escapeHtml(goal.title)}</strong>
        <p>${escapeHtml(goal.nextAction)}</p>
      </div>
      <span class="status-pill ${statusClass(goal.status)}">${escapeHtml(goal.status)}</span>
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

function renderOperationsReadiness() {
  const readyCount = operationsReadiness.checks.filter((item) => item.status === "Ready").length;
  const reviewCount = operationsReadiness.checks.length - readyCount;
  $("#operations-readiness-state").textContent = operationsReadiness.decision;
  $("#readiness-summary").innerHTML = operationsReadiness.summary.map((item) => `
    <article class="readiness-card">
      <div class="card-topline">
        <strong>${item.area}</strong>
        <span class="status-pill ${statusClass(item.status)}">${item.status}</span>
      </div>
      <p>${item.signal}</p>
    </article>
  `).join("");

  $("#readiness-queue").innerHTML = operationsReadiness.checks.map((item, index) => `
    <article class="readiness-row">
      <span class="readiness-index">${index + 1}</span>
      <div>
        <div class="card-topline">
          <strong>${item.name}</strong>
          <span class="status-pill ${statusClass(item.status)}">${item.status}</span>
        </div>
        <p>${item.evidence}</p>
        <div class="meta-row">
          <span class="meta-chip">${item.owner}</span>
          <span class="meta-chip">${item.gate}</span>
        </div>
      </div>
    </article>
  `).join("");

  $("#readiness-decision").innerHTML = `
    <div class="decision-stat">
      <strong>${readyCount}/${operationsReadiness.checks.length}</strong>
      <span>ready checks</span>
    </div>
    <div class="decision-stat">
      <strong>${reviewCount}</strong>
      <span>external evidence gaps</span>
    </div>
    <p>${operationsReadiness.lastEvidence}</p>
    <span class="meta-chip">${operationsReadiness.decisionState}</span>
    <span class="meta-chip">${operationsReadiness.qualityGate}</span>
  `;
}

function renderGodMode() {
  const activeLane = godModeLanes.find((lane) => lane.name === state.godModeLane) || godModeLanes[0];
  $("#godmode-lane-select").innerHTML = godModeLanes.map((lane) => `
    <option ${lane.name === state.godModeLane ? "selected" : ""}>${lane.name}</option>
  `).join("");
  $("#godmode-mission-input").value = state.godModeMission;

  $("#godmode-lane-switcher").innerHTML = godModeLanes.map((lane) => `
    <button class="lane-chip ${lane.name === state.godModeLane ? "is-active" : ""}" type="button" data-godmode-lane="${lane.name}">
      <strong>${lane.name}</strong>
      <span>${lane.owner}</span>
    </button>
  `).join("");

  $("#godmode-mission-brief").innerHTML = `
    <div class="card-topline">
      <h3>${activeLane.name} Lane</h3>
      <span class="meta-chip">${activeLane.model}</span>
    </div>
    <p>${activeLane.purpose}</p>
    <div class="mission-gate">
      <strong>Gate</strong>
      <span>${activeLane.gate}</span>
    </div>
  `;

  $("#godmode-protocol").innerHTML = godModeProtocol.map((item) => `
    <article class="protocol-step">
      <div class="protocol-marker">${item.step.slice(0, 2).toUpperCase()}</div>
      <div>
        <div class="card-topline">
          <h3>${item.step}</h3>
          <span class="status-pill ${statusClass(item.status)}">${item.status}</span>
        </div>
        <p>${item.command}</p>
        <span class="meta-chip">${item.owner}</span>
      </div>
    </article>
  `).join("");

  $("#seis-ai-setup").innerHTML = seisAiSetup.map((item) => `
    <article class="ai-setup-card">
      <div class="card-topline">
        <h3>${escapeHtml(item.name)}</h3>
        <span class="status-pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      <p>${escapeHtml(item.output)}</p>
      <div class="meta-row">
        <span class="meta-chip">${escapeHtml(item.type)}</span>
        <span class="meta-chip">${escapeHtml(item.data)}</span>
      </div>
      <small>${escapeHtml(item.gate)}</small>
    </article>
  `).join("");

  $("#godmode-run-timeline").innerHTML = state.godModeRuns.map((run) => {
    const routeMeta = [
      run.lane ? `god mode: ${run.lane}` : null,
      run.laneId ? `route: ${run.laneId}` : null,
      run.tool ? `tool: ${run.tool}` : null,
      run.defaultGate ? `gate: ${run.defaultGate}` : null,
      run.routeSource ? `source: ${run.routeSource}` : null,
      run.owner || null
    ].filter(Boolean);

    return `
      <article class="run-step">
        <div>
          <strong>${escapeHtml(run.mission)}</strong>
          <p>${escapeHtml(run.evidence)}</p>
        </div>
        <div class="run-meta run-route-meta">
          ${routeMeta.map((item) => `<span class="meta-chip">${escapeHtml(item)}</span>`).join("")}
          <span class="status-pill ${statusClass(run.status)}">${escapeHtml(run.status)}</span>
        </div>
      </article>
    `;
  }).join("");

  $("#godmode-guardrails").innerHTML = godModeGuardrails.map((item) => `
    <article class="guardrail-row">
      <div class="card-topline">
        <h3>${item.rule}</h3>
        <span class="status-pill ${statusClass(item.status)}">${item.status}</span>
      </div>
      <p>${item.detail}</p>
    </article>
  `).join("");

  $("#godmode-artifacts").innerHTML = godModeArtifacts.map((artifact) => `
    <article class="artifact-card">
      <div class="card-topline">
        <h3>${artifact.name}</h3>
        <span class="status-pill ${statusClass(artifact.status)}">${artifact.status}</span>
      </div>
      <p>${artifact.detail}</p>
      <span class="meta-chip">${artifact.owner}</span>
    </article>
  `).join("");

  renderSeisRouter();
  renderMissionRoutePreview();
  renderFeatureGrowthLedger();
}

function renderMissionRoutePreview() {
  const input = $("#godmode-mission-input");
  const mission = input?.value || state.godModeMission || "";
  const route = predictMissionRoute(mission);
  const lane = getSeisRouterLanes().find((item) => item.laneId === route.laneId) || getSeisRouterLanes()[0];
  $("#mission-route-preview").innerHTML = `
    <div class="card-topline">
      <h3>Route Preview</h3>
      <span class="status-pill ${route.safetyAdjusted ? "attention" : statusClass(lane.status)}">${route.safetyAdjusted ? "Safety adjusted" : lane.status}</span>
    </div>
    <div class="route-preview-grid">
      <article class="route-preview-card">
        <span>Tool</span>
        <strong>${route.tool}</strong>
      </article>
      <article class="route-preview-card">
        <span>SEIS Lane</span>
        <strong>${route.laneId}</strong>
      </article>
      <article class="route-preview-card">
        <span>Default Gate</span>
        <strong>${route.defaultGate || lane.defaultGate}</strong>
      </article>
    </div>
    <p>${lane.handoff}</p>
    <div class="meta-row route-preview-reasons">
      <span class="meta-chip">${route.routeSource}</span>
      ${route.reasons.slice(0, 3).map((reason) => `<span class="meta-chip">${reason}</span>`).join("")}
    </div>
  `;
}

function predictMissionRoute(mission) {
  const text = String(mission || "").trim();
  if (!text || !seisRouterArtifact.model || !seisRouterArtifact.policy) {
    const fallbackLane = getSeisRouterLanes().find((lane) => lane.laneId === "seis") || getSeisRouterLanes()[0];
    return {
      tool: fallbackLane.tool,
      laneId: fallbackLane.laneId,
      defaultGate: fallbackLane.defaultGate,
      routeSource: seisRouterArtifact.artifactId,
      safetyAdjusted: false,
      reasons: ["empty mission uses SEIS Hub fallback"]
    };
  }

  const features = extractMissionRouteFeatures(text);
  const scores = scoreMissionRoute(seisRouterArtifact.model, features);
  const learnedLaneId = maxMissionScoreLane(scores);
  const safetyLaneId = classifyMissionRouteWithSafetyFloor(text);
  const laneId = boundedMissionLaneDecision(learnedLaneId, safetyLaneId, features);
  const defaults = seisRouterArtifact.model.laneDefaults?.[laneId] || {};

  return {
    tool: chooseMissionTool(text),
    laneId,
    learnedLaneId,
    safetyLaneId,
    safetyAdjusted: laneId !== learnedLaneId,
    defaultGate: defaults.defaultGate,
    integrationTool: defaults.toolName,
    routeSource: seisRouterArtifact.artifactId || seisRouterArtifact.sourcePolicy || "artifact",
    reasons: buildMissionRouteReasons(laneId, safetyLaneId, features)
  };
}

function tokenPattern() {
  return new RegExp(seisRouterArtifact.policy?.tokenPattern || "[a-z0-9_-]{2,}", "g");
}

function normalizeRouteText(value) {
  return String(value || "").trim().toLowerCase();
}

function chooseMissionTool(mission) {
  const text = normalizeRouteText(mission);
  for (const route of seisRouterArtifact.policy?.routeHints || []) {
    if (route.hints.some((hint) => text.includes(hint))) {
      return route.tool;
    }
  }

  const role = matchMissionRole(text);
  if (role && seisRouterArtifact.policy?.roleHints?.[role]?.tool) {
    return seisRouterArtifact.policy.roleHints[role].tool;
  }

  return "seis-agent";
}

function matchMissionRole(text) {
  const roleAliasMatch = /^(designer|engineer|software)\s*:\s*/.exec(text);
  if (roleAliasMatch) return roleAliasMatch[1];

  const scores = { designer: 0, engineer: 0, software: 0 };
  for (const [role, config] of Object.entries(seisRouterArtifact.policy?.roleHints || {})) {
    for (const hint of config.hints) {
      if (missionRoleHintMatches(text, hint)) scores[role] += 1;
    }
  }

  const ordered = Object.entries(scores).sort((left, right) => right[1] - left[1]);
  return ordered[0][1] === 0 ? null : ordered[0][0];
}

function missionRoleHintMatches(text, hint) {
  const normalizedHint = normalizeRouteText(hint);
  if (!normalizedHint) return false;
  if (/\s/.test(normalizedHint)) return text.includes(normalizedHint);
  const escaped = normalizedHint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9_-])${escaped}($|[^a-z0-9_-])`).test(text);
}

function extractMissionRouteFeatures(mission) {
  const text = normalizeRouteText(mission);
  const tokens = (text.match(tokenPattern()) || []).map((token) => `text:${token}`);
  const tokenSet = new Set(tokens.map((token) => token.replace(/^text:/, "")));
  const flagFeatures = [];

  for (const [laneId, keywords] of Object.entries(seisRouterArtifact.policy?.safetyKeywords || {})) {
    if (keywords.some((keyword) => tokenSet.has(keyword))) {
      flagFeatures.push(`flag:${laneId}`);
    }
  }

  if (/\b(secret|credential|token|key|redaction)\b/.test(text)) {
    flagFeatures.push("flag:secret_sensitive", "flag:seis-security", "flag:seis-governance");
  }
  if (/\b(push|release|publish|ci)\b/.test(text)) {
    flagFeatures.push("flag:release_sensitive");
  }
  if (/\b(external|provider|cloud|deploy|ssh|vpn)\b/.test(text)) {
    flagFeatures.push("flag:external_runtime");
  }

  return [...new Set(["bias", ...tokens, ...flagFeatures])].sort();
}

function scoreMissionRoute(model, features) {
  return Object.fromEntries(
    model.labels.map((label) => {
      const weights = model.classFeatureWeights?.[label] || {};
      let score = features.reduce(
        (sum, feature) => sum + (weights[feature] || 0),
        model.priors?.[label] || 0
      );
      if (features.includes(`flag:${label}`)) score += 6;
      if (label === "seis-cloud" && features.includes("flag:external_runtime")) score += 2;
      if (label === "seis-governance" && features.includes("flag:release_sensitive")) score += 2;
      if (label === "seis-security" && features.includes("flag:secret_sensitive")) score += 2;
      return [label, Number(score.toFixed(6))];
    })
  );
}

function maxMissionScoreLane(scores) {
  const riskOrder = seisRouterArtifact.policy?.laneRiskOrder || {};
  return Object.entries(scores).sort((left, right) => {
    const delta = right[1] - left[1];
    if (delta !== 0) return delta;
    return (riskOrder[right[0]] || 0) - (riskOrder[left[0]] || 0);
  })[0][0];
}

function classifyMissionRouteWithSafetyFloor(mission) {
  const text = normalizeRouteText(mission);
  const keywords = seisRouterArtifact.policy?.safetyKeywords || {};
  const tokenSet = new Set(text.match(tokenPattern()) || []);
  const cloudMatched = (keywords["seis-cloud"] || []).some((keyword) => tokenSet.has(keyword));
  const securityHardMatched = /\b(threat|vulnerability|permission|permissions|hardening|exposure|redaction)\b/.test(text)
    || /\bsecurity[- ]risk\b/.test(text)
    || tokenSet.has("private-key")
    || tokenSet.has("access-control");
  const secretMatched = /\b(secret|credential|token|key)\b/.test(text);

  if (securityHardMatched || (secretMatched && !cloudMatched)) return "seis-security";
  if (cloudMatched) return "seis-cloud";
  for (const laneId of ["seis-design", "seis-research", "seis-data", "seis-automation", "seis-product", "seis-code"]) {
    if ((keywords[laneId] || []).some((keyword) => tokenSet.has(keyword))) return laneId;
  }
  if (/\b(release|security|license|quality|ci|github|handoff|policy|governance)\b/.test(text)) return "seis-governance";
  return "seis";
}

function boundedMissionLaneDecision(learnedLaneId, safetyLaneId, features = []) {
  if (learnedLaneId === safetyLaneId) return learnedLaneId;
  if (safetyLaneId === "seis") {
    return features.includes(`flag:${learnedLaneId}`) ? learnedLaneId : safetyLaneId;
  }
  return safetyLaneId;
}

function buildMissionRouteReasons(laneId, safetyLaneId, features = []) {
  const reasons = [`selected ${laneId}`];
  for (const feature of features.filter((item) => item.startsWith("flag:"))) {
    reasons.push(feature.replace("flag:", "matched "));
  }
  if (laneId !== safetyLaneId) {
    reasons.push(`learned route retained over safety floor ${safetyLaneId}`);
  }
  return [...new Set(reasons)];
}

function renderSeisRouter() {
  const lanes = getSeisRouterLanes();
  const readyLanes = lanes.filter((lane) => lane.status === "Ready").length;
  const routeSource = seisRouterArtifact.summary?.routeSources?.join(" / ") || seisRouterArtifact.sourcePolicy || "fallback";
  $("#seis-router-summary").innerHTML = [
    ["Lanes", lanes.length, "SEIS router labels"],
    ["Ready", readyLanes, "lanes with visible gates"],
    ["Safety Floor", "seis-security", "secret and vulnerability intents"],
    ["Policy Source", routeSource, seisRouterArtifact.sourcePolicy || "embedded fallback"]
  ].map(([label, value, detail]) => `
    <article class="router-summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${detail}</small>
    </article>
  `).join("");

  $("#seis-router-lanes").innerHTML = lanes.map((lane) => `
    <article class="router-lane-card">
      <div class="card-topline">
        <h3>${lane.label}</h3>
        <span class="status-pill ${statusClass(lane.status)}">${lane.status}</span>
      </div>
      <p>${lane.signal}</p>
      <dl class="router-facts">
        <div>
          <dt>Tool</dt>
          <dd>${lane.tool}</dd>
        </div>
        <div>
          <dt>SEIS Lane</dt>
          <dd>${lane.laneId}</dd>
        </div>
        <div>
          <dt>Default Gate</dt>
          <dd>${lane.defaultGate}</dd>
        </div>
      </dl>
      <div class="meta-row">
        <span class="meta-chip">${lane.owner}</span>
        <span class="meta-chip">${lane.integrationTool}</span>
      </div>
    </article>
  `).join("");
}

function getSeisRouterLanes() {
  return Array.isArray(seisRouterArtifact.routes) && seisRouterArtifact.routes.length > 0
    ? seisRouterArtifact.routes
    : fallbackSeisRouterLanes;
}

async function loadSeisRouterArtifact() {
  try {
    const response = await fetch("data/seis-router-routes.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`artifact request failed with ${response.status}`);
    }
    const artifact = await response.json();
    if (!Array.isArray(artifact.routes) || artifact.routes.length === 0) {
      throw new Error("artifact has no routes");
    }
    seisRouterArtifact = artifact;
  } catch (error) {
    seisRouterArtifact = {
      ...seisRouterArtifact,
      loadError: error.message,
      sourcePolicy: `${seisRouterArtifact.sourcePolicy} (fallback active)`
    };
  }
  renderSeisRouter();
  renderMissionRoutePreview();
  renderAgentRoutingMatrix();
}

async function loadSeisCorePluginArtifact() {
  try {
    const response = await fetch("data/seis-core-plugin-catalog.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`plugin catalog request failed with ${response.status}`);
    const artifact = await response.json();
    if (
      artifact.sourceRoot !== "plugins/seis-core" ||
      artifact.counts?.discovered !== 63 ||
      artifact.distribution?.repository !== "SEIS" ||
      artifact.distribution?.sourceAvailableInRepository !== true ||
      artifact.distribution?.publicRepositoryAvailable !== true ||
      artifact.distribution?.publicAudience !== "everyone" ||
      artifact.distribution?.distributionScope !== "direct-repository-source" ||
      artifact.distribution?.installSurface !== "repo-source-app" ||
      artifact.distribution?.marketplaceName !== "seis-repo" ||
      artifact.distribution?.publicMarketplace !== true ||
      artifact.distribution?.marketplaceEntryCount !== 63 ||
      artifact.distribution?.coreSourceOwner !== false ||
      !Array.isArray(artifact.plugins)
    ) {
      throw new Error("plugin catalog contract is invalid");
    }
    seisCorePluginArtifact = artifact;
  } catch (error) {
    seisCorePluginArtifact = {
      ...seisCorePluginArtifact,
      loadError: error.message
    };
  }
  renderPlugins();
}

async function loadSeisCorePluginReleaseReadiness() {
  try {
    const response = await fetch("data/seis-core-plugin-release-readiness.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`release readiness request failed with ${response.status}`);
    const artifact = await response.json();
    if (artifact.id !== "seis-core-plugin-release-readiness" || artifact.sourceRoot !== "plugins/seis-core") {
      throw new Error("release readiness contract is invalid");
    }
    seisCorePluginReleaseReadinessArtifact = artifact;
  } catch (error) {
    seisCorePluginReleaseReadinessArtifact = {
      ...seisCorePluginReleaseReadinessArtifact,
      loadError: error.message
    };
  }
  renderPluginReleaseReadiness();
}

function renderFeatureGrowthLedger() {
  const readyTopics = featureGrowthLedger.topics.filter((topic) => topic.status === "Ready").length;
  const reviewTopics = featureGrowthLedger.topics.length - readyTopics;
  $("#feature-growth-state").textContent = featureGrowthLedger.completionState;
  $("#feature-growth-summary").innerHTML = [
    ["Coverage", featureGrowthLedger.coverage, "required topics"],
    ["Ready", readyTopics, "topics with governed evidence"],
    ["Review", reviewTopics, "topics awaiting handoff proof"],
    ["Gate", "Feature growth", `${featureGrowthLedger.qualityGate} · ${featureGrowthLedger.evidenceState}`]
  ].map(([label, value, detail]) => `
    <article class="ledger-summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${detail}</small>
    </article>
  `).join("");

  $("#feature-growth-ledger").innerHTML = featureGrowthLedger.topics.map((topic) => `
    <article class="ledger-row">
      <div class="ledger-topic">
        <strong>${topic.name}</strong>
        <span class="meta-chip">${topic.gate}</span>
      </div>
      <p>${topic.improvement}</p>
      <div class="ledger-row-footer">
        <span class="status-pill ${statusClass(topic.status)}">${topic.status}</span>
        <span class="meta-chip">${topic.evidence} evidence links</span>
        <small>${topic.gap}</small>
      </div>
    </article>
  `).join("");

  $("#feature-growth-blockers").innerHTML = featureGrowthLedger.blockers.map((blocker, index) => `
    <article class="blocker-row">
      <span>${index + 1}</span>
      <p>${escapeHtml(blocker)}</p>
    </article>
  `).join("");
}

function renderGoals() {
  $("#goal-board").innerHTML = state.goals.map((goal) => `
    <article class="goal-card">
      <div class="card-topline">
        <h3>${escapeHtml(goal.title)}</h3>
        <span class="status-pill ${statusClass(goal.status)}">${escapeHtml(goal.status)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-chip">${escapeHtml(goal.priority)}</span>
        <span class="meta-chip">Risk: ${escapeHtml(goal.risk || "None logged")}</span>
      </div>
      <p>${escapeHtml(goal.nextAction || "No next action yet.")}</p>
      <div class="meta-row">
        <button class="secondary-button" type="button" data-goal-status="${escapeHtml(goal.id)}" data-next="Review">Review</button>
        <button class="secondary-button" type="button" data-goal-status="${escapeHtml(goal.id)}" data-next="Done">Done</button>
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

  $("#orchestration-lanes").innerHTML = orchestrationLanes.map((lane) => `
    <article class="orchestration-card">
      <div class="card-topline">
        <h3>${lane.lane}</h3>
        <span class="meta-chip">${lane.primary}</span>
      </div>
      <p>${lane.handoff}</p>
      <div class="meta-row">
        ${lane.collaborators.map((collaborator) => `<span class="meta-chip">${collaborator}</span>`).join("")}
      </div>
    </article>
  `).join("");

  $("#handoff-audit").innerHTML = handoffAudit.map((item) => `
    <article class="handoff-row">
      <div class="card-topline">
        <strong>${item.from} -> ${item.to}</strong>
        <span class="status-pill ${statusClass(item.status)}">${item.status}</span>
      </div>
      <p>${item.system}</p>
      <small>${item.evidence}</small>
    </article>
  `).join("");

  renderAgentRoutingMatrix();
}

function renderAgentRoutingMatrix() {
  $("#agent-routing-matrix").innerHTML = getSeisRouterLanes().map((lane) => `
    <article class="routing-matrix-row">
      <div>
        <strong>${lane.laneId}</strong>
        <p>${lane.handoff}</p>
      </div>
      <span class="meta-chip">tool: ${lane.tool}</span>
      <span class="meta-chip">gate: ${lane.defaultGate}</span>
      <span class="status-pill ${statusClass(lane.status)}">${lane.owner}</span>
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

  const catalog = seisCorePluginArtifact;
  const query = String(state.pluginQuery || "").trim().toLowerCase();
  const plugins = (catalog.plugins || []).filter((plugin) => {
    if (!query) return true;
    return [plugin.name, plugin.displayName, plugin.description, plugin.category, ...(plugin.capabilities || [])]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const catalogState = catalog.loadError
    ? "Fallback"
    : catalog.counts.statusNotChecked === catalog.counts.returned
      ? "Catalog loaded"
      : `${catalog.counts.statusReady || 0}/${catalog.counts.discovered || plugins.length} ready`;
  const catalogStateElement = $("#app-plugin-catalog-state");
  if (catalogStateElement) {
    catalogStateElement.textContent = catalogState;
    catalogStateElement.className = `status-pill ${catalog.loadError ? "attention" : "ready"}`;
  }
  const catalogMeta = $("#app-plugin-catalog-meta");
  if (catalogMeta) {
    catalogMeta.innerHTML = [
      `release ${escapeHtml(catalog.release?.label || "unknown")}`,
      `${catalog.counts.discovered || 0} app-owned`,
      "public SEIS repo source",
      "status-only",
      "write/network/secrets: empty"
    ].map((value) => `<span class="meta-chip">${escapeHtml(value)}</span>`).join("");
  }
  const filter = $("#app-plugin-filter");
  if (filter && filter.value !== state.pluginQuery) filter.value = state.pluginQuery;
  const list = $("#app-plugin-catalog-list");
  if (!list) return;
  if (catalog.loadError && plugins.length === 0) {
    list.innerHTML = `<p class="empty-state">Application plugin catalog is unavailable; the static plugin families remain visible.</p>`;
    return;
  }
  list.innerHTML = plugins.length > 0
    ? plugins.map((plugin) => `
      <article class="app-plugin-row">
        <div>
          <div class="card-topline">
            <h4>${escapeHtml(plugin.displayName || plugin.name)}</h4>
            <span class="status-pill ${plugin.contract?.valid ? "ready" : "blocked"}">${plugin.contract?.valid ? "Contract ready" : "Contract invalid"}</span>
          </div>
          <p>${escapeHtml(plugin.description)}</p>
          <div class="meta-row">
            <span class="meta-chip">${escapeHtml(plugin.name)}</span>
            <span class="meta-chip">${escapeHtml(plugin.category)}</span>
            <span class="meta-chip">${escapeHtml(plugin.release?.semver || "unknown")}</span>
            <span class="meta-chip">${plugin.audit?.mode === "read-only-report" ? "read-only report" : "local status-only"}</span>
          </div>
        </div>
        <div class="app-plugin-row-side">
          <span class="status-pill ${statusClass(plugin.status?.state === "not-checked" ? "Review" : plugin.status?.state === "ready" ? "Ready" : "Blocked")}">${escapeHtml(plugin.status?.state || "not-checked")}</span>
          <small>${escapeHtml(plugin.sourcePath)}</small>
        </div>
      </article>
    `).join("")
    : `<p class="empty-state">No app-owned plugin matches “${escapeHtml(state.pluginQuery)}”.</p>`;
}

function renderPluginReleaseReadiness() {
  const artifact = seisCorePluginReleaseReadinessArtifact;
  const stateElement = $("#plugin-release-readiness-state");
  const ready = artifact.workingTree?.largeCodeEligible === true;
  if (stateElement) {
    stateElement.textContent = artifact.loadError ? "Fallback" : ready ? "Promotion ready" : "Evidence pending";
    stateElement.className = `status-pill ${artifact.loadError || !ready ? "attention" : "ready"}`;
  }
  const grid = $("#plugin-release-readiness-grid");
  if (grid) {
    const cards = [
      ["Current", artifact.currentRelease?.label, artifact.currentRelease?.semver],
      ["Large-code +1", artifact.next?.largeCode?.label || "Ceiling reached", "evidence required"],
      ["Annual +1", artifact.next?.annual?.label || "Ceiling reached", artifact.next?.annual?.year ? `calendar year ${artifact.next.annual.year}` : "annual path"],
      ["Ceiling", artifact.policy?.maximumLabel, "bulk promotion disabled"]
    ];
    grid.innerHTML = cards.map(([title, value, detail]) => `
      <article class="release-readiness-card">
        <span class="eyebrow">${escapeHtml(title)}</span>
        <strong>${escapeHtml(value || "unknown")}</strong>
        <small>${escapeHtml(detail || "")}</small>
      </article>
    `).join("");
  }
  const evidence = $("#plugin-release-readiness-evidence");
  if (evidence) {
    evidence.innerHTML = [
      `changed code lines ${artifact.workingTree?.codeLinesChanged ?? 0}/${artifact.policy?.largeCodeChangeThreshold ?? 500}`,
      `${artifact.workingTree?.changedCodeFileCount ?? 0} code files`,
      `decision ${artifact.decision || "unknown"}`,
      `base ${artifact.workingTree?.baseCommit || "unknown"}`,
      "status-only evidence"
    ].map((value) => `<span class="meta-chip">${escapeHtml(value)}</span>`).join("");
  }
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

  $("#workflow-run-history").innerHTML = workflowRuns.map((run) => `
    <article class="workflow-run-row">
      <div>
        <strong>${run.workflow}</strong>
        <span>${run.actor} &middot; ${run.started}</span>
      </div>
      <div>
        <span class="muted">Trigger</span>
        <strong>${run.trigger}</strong>
      </div>
      <div>
        <span class="muted">Evidence</span>
        <strong>${run.evidence}</strong>
      </div>
      <div class="run-meta">
        <span class="status-pill ${statusClass(run.status)}">${run.status}</span>
        <span class="meta-chip">${run.duration}</span>
      </div>
      <p>${run.approval}. Rollback: ${run.rollback}.</p>
    </article>
  `).join("");

  $("#approval-gates").innerHTML = approvalGates.map((gate) => `
    <article class="approval-row">
      <div class="card-topline">
        <h3>${gate.name}</h3>
        <span class="status-pill ${statusClass(gate.status)}">${gate.status}</span>
      </div>
      <p>${gate.requirement}</p>
      <div class="meta-row">
        <span class="meta-chip">${gate.owner}</span>
        <span class="meta-chip">${gate.evidence}</span>
      </div>
    </article>
  `).join("");

  $("#rollback-evidence").innerHTML = rollbackEvidence.map((item) => `
    <article class="rollback-row">
      <div class="card-topline">
        <h3>${item.surface}</h3>
        <span class="status-pill ${statusClass(item.status)}">${item.status}</span>
      </div>
      <p>${item.strategy}</p>
      <p>${item.detail}</p>
      <span class="meta-chip">Verified: ${item.lastVerified}</span>
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

  $("#permission-reviews").innerHTML = permissionReviews.map((review) => `
    <article class="permission-review-row">
      <div class="card-topline">
        <h3>${review.surface}</h3>
        <span class="status-pill ${statusClass(review.status)}">${review.status}</span>
      </div>
      <p>${review.permission}</p>
      <p>${review.scope}</p>
      <div class="meta-row">
        <span class="meta-chip">${review.owner}</span>
        <span class="meta-chip">${review.evidence}</span>
      </div>
      <small>${review.nextAction}</small>
    </article>
  `).join("");

  $("#dependency-scans").innerHTML = dependencyScans.map((scan) => `
    <article class="dependency-scan-row">
      <div>
        <strong>${scan.target}</strong>
        <span>${scan.scanner}</span>
      </div>
      <p>${scan.coverage}</p>
      <p>${scan.risk}</p>
      <span class="status-pill ${statusClass(scan.status)}">${scan.status}</span>
      <small>${scan.evidence}</small>
    </article>
  `).join("");

  $("#security-audits").innerHTML = securityAudits.map((audit) => `
    <article class="security-audit-row">
      <div class="card-topline">
        <h3>${audit.audit}</h3>
        <span class="status-pill ${statusClass(audit.status)}">${audit.status}</span>
      </div>
      <p>${audit.evidence}</p>
      <div class="meta-row">
        <span class="meta-chip">${audit.cadence}</span>
        <span class="meta-chip">${audit.outcome}</span>
      </div>
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

  $("#dependency-graph").innerHTML = dependencyGraph.map((item) => `
    <article class="dependency-edge">
      <div>
        <strong>${item.node}</strong>
        <span>${item.dependsOn.join(" / ")}</span>
      </div>
      <p>${item.risk}</p>
      <p>${item.mitigation}</p>
      <span class="status-pill ${statusClass(item.status)}">${item.status}</span>
    </article>
  `).join("");

  $("#module-relationships").innerHTML = moduleRelationships.map((relationship) => `
    <article class="relationship-row">
      <div class="relationship-path">
        <strong>${relationship.from}</strong>
        <span>to</span>
        <strong>${relationship.to}</strong>
      </div>
      <p>${relationship.contract}</p>
      <div class="meta-row">
        <span class="meta-chip">${relationship.owner}</span>
        <span class="status-pill ${statusClass(relationship.status)}">${relationship.status}</span>
      </div>
    </article>
  `).join("");

  $("#technical-debt-register").innerHTML = technicalDebtRegister.map((debt) => `
    <article class="debt-row">
      <div class="card-topline">
        <h3>${debt.id}: ${debt.area}</h3>
        <span class="status-pill ${statusClass(debt.status)}">${debt.status}</span>
      </div>
      <p>${debt.action}</p>
      <div class="meta-row">
        <span class="meta-chip">${debt.owner}</span>
        <span class="meta-chip">Severity: ${debt.severity}</span>
      </div>
    </article>
  `).join("");
}

function renderKnowledge() {
  $("#knowledge-node-grid").innerHTML = knowledgeGraphNodes.map((node) => `
    <article class="knowledge-node-card">
      <div class="card-topline">
        <h3>${node.name}</h3>
        <span class="status-pill ${statusClass(node.status)}">${node.status}</span>
      </div>
      <p>${node.signal}</p>
      <div class="meta-row">
        <span class="meta-chip">${node.type}</span>
        <span class="meta-chip">${node.owner}</span>
      </div>
      <small>Links: ${node.links.join(" / ")}</small>
    </article>
  `).join("");

  $("#knowledge-edge-list").innerHTML = knowledgeEdges.map((edge) => `
    <article class="knowledge-edge-row">
      <div class="relationship-path">
        <strong>${edge.from}</strong>
        <span>to</span>
        <strong>${edge.to}</strong>
      </div>
      <p>${edge.contract}</p>
      <span class="status-pill ${statusClass(edge.status)}">${edge.status}</span>
    </article>
  `).join("");

  $("#memory-evidence-list").innerHTML = memoryEvidence.map((item) => `
    <article class="memory-evidence-row">
      <div class="card-topline">
        <h3>${item.source}</h3>
        <span class="status-pill ${statusClass(item.status)}">${item.status}</span>
      </div>
      <p>${item.scope}</p>
      <div class="meta-row">
        <span class="meta-chip">${item.freshness}</span>
        <span class="meta-chip">${item.evidence}</span>
      </div>
    </article>
  `).join("");

  $("#decision-history-list").innerHTML = decisionHistory.map((item) => `
    <article class="decision-history-row">
      <div class="card-topline">
        <h3>${item.decision}</h3>
        <span class="status-pill ${statusClass(item.status)}">${item.status}</span>
      </div>
      <p>${item.impact}</p>
      <div class="meta-row">
        <span class="meta-chip">${item.owner}</span>
        <span class="meta-chip">${item.evidence}</span>
      </div>
    </article>
  `).join("");

  $("#pattern-library").innerHTML = reusablePatterns.map((pattern) => `
    <article class="pattern-card">
      <div class="card-topline">
        <h3>${pattern.name}</h3>
        <span class="status-pill ${statusClass(pattern.status)}">${pattern.status}</span>
      </div>
      <p>${pattern.reuse}</p>
      <span class="meta-chip">${pattern.evidence}</span>
    </article>
  `).join("");

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
      <strong>${escapeHtml(agent.name)}</strong>
      <p>${escapeHtml(agent.focus)}</p>
    </button>
  `).join("");

  const actions = state.goals
    .filter((goal) => goal.status !== "Done")
    .slice(0, 4)
    .map((goal) => `<article class="next-action"><strong>${escapeHtml(goal.title)}</strong><p>${escapeHtml(goal.nextAction)}</p></article>`);
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

    const godModeLaneButton = event.target.closest("[data-godmode-lane]");
    if (godModeLaneButton) {
      state.godModeLane = godModeLaneButton.dataset.godmodeLane;
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

  $("#godmode-mission-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const mission = data.get("mission").toString().trim();
    const lane = data.get("lane").toString();
    if (!mission) return;
    state.godModeMission = mission;
    state.godModeLane = lane;
    const activeLane = godModeLanes.find((item) => item.name === lane) || godModeLanes[0];
    const route = predictMissionRoute(mission);
    const routeLane = getSeisRouterLanes().find((item) => item.laneId === route.laneId) || getSeisRouterLanes()[0];
    const defaultGate = route.defaultGate || routeLane.defaultGate || activeLane.gate;
    state.godModeRuns.unshift({
      id: `godmode-run-${Date.now()}`,
      mission,
      lane,
      laneId: route.laneId,
      tool: route.tool,
      defaultGate,
      routeSource: route.routeSource,
      integrationTool: route.integrationTool,
      learnedLaneId: route.learnedLaneId,
      safetyLaneId: route.safetyLaneId,
      safetyAdjusted: route.safetyAdjusted,
      owner: routeLane.owner || activeLane.owner,
      status: route.safetyAdjusted || lane === "Review" ? "Review" : "Active",
      evidence: `${defaultGate} Route ${route.laneId} through ${route.tool}; evidence must be attached before release handoff.`
    });
    render();
  });

  $("#godmode-mission-input").addEventListener("input", (event) => {
    state.godModeMission = event.target.value;
    renderMissionRoutePreview();
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

  $("#app-plugin-filter").addEventListener("input", (event) => {
    state.pluginQuery = event.target.value;
    renderPlugins();
  });

  $("#primary-action").addEventListener("click", () => {
    if (state.activeView === "godmode") {
      $("#godmode-mission-input").focus();
    } else if (state.activeView !== "goals") {
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
    ["God Mode", "Open SEIS AI mission control", "godmode"],
    ["Run Mission", "Focus God Mode mission composer", "godmode"],
    ["Goals", "Create or review goal status", "goals"],
    ["Repositories", "Inspect repository health", "repositories"],
    ["Documentation", "Review docs and ADR coverage", "documentation"],
    ["Search", "Search SEIS surfaces and app surfaces", "search"],
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
loadSeisRouterArtifact();
loadSeisCorePluginArtifact();
loadSeisCorePluginReleaseReadiness();
