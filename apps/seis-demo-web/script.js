const contractUrl = new URL("contracts/seis-demo-contract.json", window.location.href);
const storageKey = "seis-demo-events-v1";
const focusStorageKey = "seis-demo-focus-mode-v1";
const godModeStorageKey = "seis-demo-god-mode-developer-v1";
const content = document.getElementById("content");
const eventLog = document.getElementById("event-log");
const routePill = document.getElementById("route-pill");
const navItems = Array.from(document.querySelectorAll(".nav-link"));
const metricsContainer = document.getElementById("contract-metrics");
const copyEventsButton = document.getElementById("events-copy");
const reloadButton = document.getElementById("fallback-reload");
const downloadNativeButton = document.getElementById("download-native");
const copyNativeLinkButton = document.getElementById("copy-native-link");
const focusModeToggleButton = document.getElementById("focus-mode-toggle");
const focusModeStatus = document.getElementById("focus-mode-status");
const focusModeSignals = document.getElementById("focus-mode-signals");
const godModeToggleButton = document.getElementById("god-mode-toggle");
const godModeStatus = document.getElementById("god-mode-status");
const godModeSignals = document.getElementById("god-mode-signals");
const moduleCoverageGrid = document.getElementById("module-coverage-grid");
const moduleCoverageBadge = document.getElementById("module-coverage-badge");
const releaseReadinessGrid = document.getElementById("release-readiness-grid");
const releaseReadinessBadge = document.getElementById("release-readiness-badge");
const validationPlanList = document.getElementById("validation-plan-list");
const validationPlanBadge = document.getElementById("validation-plan-badge");
const workPackageGrid = document.getElementById("work-package-grid");
const workPackageBadge = document.getElementById("work-package-badge");
const adrWorkflowList = document.getElementById("adr-workflow-list");
const adrWorkflowBadge = document.getElementById("adr-workflow-badge");
const ecosystemLanesGrid = document.getElementById("ecosystem-lanes-grid");
const ecosystemLanesBadge = document.getElementById("ecosystem-lanes-badge");
const handoffList = document.getElementById("handoff-list");
const handoffBadge = document.getElementById("handoff-badge");
const completionAuditGrid = document.getElementById("completion-audit-grid");
const completionAuditBadge = document.getElementById("completion-audit-badge");
const runStateGrid = document.getElementById("run-state-grid");
const runStateBadge = document.getElementById("run-state-badge");
const stagingManifestGrid = document.getElementById("staging-manifest-grid");
const stagingManifestBadge = document.getElementById("staging-manifest-badge");
const changelogGrid = document.getElementById("changelog-grid");
const changelogBadge = document.getElementById("changelog-badge");
const subAgentPlanGrid = document.getElementById("sub-agent-plan-grid");
const subAgentPlanBadge = document.getElementById("sub-agent-plan-badge");
const subAgentQuarterList = document.getElementById("sub-agent-quarter-list");
const subAgentQuarterDetail = document.getElementById("sub-agent-quarter-detail");
const subAgentPrevButton = document.getElementById("sub-agent-prev");
const subAgentNextButton = document.getElementById("sub-agent-next");
const subAgentRunDemoButton = document.getElementById("sub-agent-run-demo");
const subAgentRunFullDemoButton = document.getElementById("sub-agent-run-full-demo");
const subAgentExportEvidenceButton = document.getElementById("sub-agent-export-evidence");
const subAgentResetDemoButton = document.getElementById("sub-agent-reset-demo");
const subAgentVersionMap = document.getElementById("sub-agent-version-map");
const subAgentRouteMesh = document.getElementById("sub-agent-route-mesh");
const subAgentPluginMesh = document.getElementById("sub-agent-plugin-mesh");
const subAgentMcpRuntimeMesh = document.getElementById("sub-agent-mcp-runtime-mesh");
const subAgentConstellationInspector = document.getElementById("sub-agent-constellation-inspector");
const subAgentRunStatus = document.getElementById("sub-agent-run-status");
const subAgentExportStatus = document.getElementById("sub-agent-export-status");
const subAgentRunList = document.getElementById("sub-agent-run-list");
const hero3dCanvas = document.getElementById("seis-hero-3d-canvas");
const hero3dStatus = document.getElementById("seis-hero-3d-status");
const hero3dVersion = document.getElementById("seis-hero-3d-version");
const hero3dRotateButton = document.getElementById("seis-hero-3d-rotate");
const hero3dSyncButton = document.getElementById("seis-hero-3d-sync");
const hero3dPauseButton = document.getElementById("seis-hero-3d-pause");

const FALLBACK_CONTRACT = {
  contract_version: "1.0.0",
  platform_targets: ["iOS", "macOS"],
  routes: [
    { path: "/", view: "home", title: "Home" },
    { path: "/demo", view: "demo", title: "Demo Shell" },
    { path: "/demo/:scenario", view: "scenario", title: "Scenario Runner" },
    { path: "/results/:runId", view: "results", title: "Demo Results" }
  ],
  scenarios: [
    {
      id: "governance-router",
      title: "Governance Routing + Specialist Dispatch",
      summary: "Checks open-source policy, dispatches specialist lanes, and prepares handoff logs.",
      specialist: "AI Policy",
      steps: ["Load policy contract", "Resolve target specialists", "Generate governance report"]
    },
    {
      id: "pipeline-speed",
      title: "Pipeline Speed Demo",
      summary: "Profiles route latency and quality gates for macOS/iOS demo surfaces.",
      specialist: "Ops/Quality",
      steps: ["Warm route cache", "Emit telemetry event", "Render completion panel"]
    },
    {
      id: "agent-orchestration",
      title: "Agent Orchestration Scenario",
      summary: "Runs multi-lane specialist request flow and records conversion milestones.",
      specialist: "SEIS Agent",
      steps: ["Compose specialist prompt", "Dispatch specialists", "Aggregate artifact suggestions"]
    }
  ],
  analytics_events: [
    {
      name: "seis_demo_started",
      description: "Demo entry started."
    },
    {
      name: "seis_demo_step",
      description: "A demo execution step completed."
    },
    {
      name: "seis_demo_cta_click",
      description: "A key CTA was clicked."
    },
    {
      name: "seis_demo_specialist_used",
      description: "Specialist lane was used."
    },
    {
      name: "seis_demo_focus_mode_changed",
      description: "Supreme Vision focus mode changed."
    },
    {
      name: "seis_demo_god_mode_changed",
      description: "God Mode Developer operating layer changed."
    },
    {
      name: "seis_demo_module_coverage_viewed",
      description: "God Mode module coverage surface was viewed."
    },
    {
      name: "seis_demo_release_readiness_viewed",
      description: "God Mode release readiness surface was viewed."
    },
    {
      name: "seis_demo_validation_plan_viewed",
      description: "God Mode validation plan surface was viewed."
    },
    {
      name: "seis_demo_work_package_viewed",
      description: "God Mode work package surface was viewed."
    },
    {
      name: "seis_demo_adr_workflow_viewed",
      description: "God Mode ADR workflow surface was viewed."
    },
    {
      name: "seis_demo_ecosystem_lanes_viewed",
      description: "God Mode ecosystem lanes surface was viewed."
    },
    {
      name: "seis_demo_sub_agent_plan_viewed",
      description: "Five-year sub-agent demo surface was viewed."
    },
    {
      name: "seis_demo_sub_agent_version_map_viewed",
      description: "SEIS AI Core version promotion map was viewed."
    },
    {
      name: "seis_demo_sub_agent_quarter_selected",
      description: "Five-year sub-agent demo quarter was selected."
    },
    {
      name: "seis_demo_sub_agent_pulse_recorded",
      description: "Local five-year sub-agent demo pulse was recorded."
    },
    {
      name: "seis_demo_sub_agent_ledger_reset",
      description: "Local five-year sub-agent demo ledger was reset."
    },
    {
      name: "seis_demo_sub_agent_full_run_recorded",
      description: "All five years of local sub-agent demo pulses were recorded."
    },
    {
      name: "seis_demo_sub_agent_evidence_exported",
      description: "Local five-year sub-agent demo evidence JSON was exported."
    },
    {
      name: "seis_demo_ai_core_3d_interacted",
      description: "The SEIS AI Core 3D sub-agent map was interacted with."
    },
    {
      name: "seis_demo_installed_ai_route_mesh_viewed",
      description: "Installed AI route mesh was viewed in the SEIS AI Core demo."
    },
    {
      name: "seis_demo_personal_plugin_lane_mesh_viewed",
      description: "Personal SEIS plugin lane mesh was viewed in the SEIS AI Core demo."
    },
    {
      name: "seis_demo_handoff_viewed",
      description: "God Mode handoff surface was viewed."
    },
    {
      name: "seis_demo_completion_audit_viewed",
      description: "God Mode completion audit surface was viewed."
    },
    {
      name: "seis_demo_run_state_viewed",
      description: "God Mode run-state surface was viewed."
    },
    {
      name: "seis_demo_staging_manifest_viewed",
      description: "God Mode staging manifest surface was viewed."
    },
    {
      name: "seis_demo_changelog_viewed",
      description: "God Mode changelog surface was viewed."
    },
    {
      name: "seis_demo_error",
      description: "A runtime/demo error occurred."
    }
  ]
};

const RELEASE_LINK = "https://github.com/emirhankudun-ux/SEIS/releases/latest";
const SEIS_DEMO_DEEPLINK = "seisdemo://demo/agent-orchestration";
const subAgentQuarterStorageKey = "seis-demo-sub-agent-quarter-v1";
const subAgentRunStorageKey = "seis-demo-sub-agent-run-ledger-v1";
const subAgentEvidenceStorageKey = "seis-demo-sub-agent-evidence-report-v1";
const hero3dStorageKey = "seis-demo-ai-core-3d-map-v1";
const SUB_AGENT_DEMO_PLAN_CONFIG = {
  source: "content/development/seis-sub-agent-5-year-plan.json",
  planView: "data/seis-sub-agent-five-year-plan-view.json",
  aiCoreProviderRegistry: "content/development/seis-ai-core-provider-registry.json",
  aiCoreVersionRegistry: "content/development/seis-ai-core-version-registry.json",
  aiCoreVersionPromotionGates: "content/development/seis-ai-core-version-promotion-gates.json",
  aiCoreVersionPromotionMap: "data/seis-ai-core-version-promotion-map.json",
  seisAgentPluginIntegration: "content/development/seis-agent-plugin-integration.json"
};

let SUB_AGENT_DEMO_PLAN = {
  source: SUB_AGENT_DEMO_PLAN_CONFIG.source,
  planView: SUB_AGENT_DEMO_PLAN_CONFIG.planView,
  aiCoreProviderRegistry: SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreProviderRegistry,
  aiCoreVersionRegistry: SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreVersionRegistry,
  aiCoreVersionPromotionGates: SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreVersionPromotionGates,
  aiCoreVersionPromotionMap: SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreVersionPromotionMap,
  seisAgentPluginIntegration: SUB_AGENT_DEMO_PLAN_CONFIG.seisAgentPluginIntegration,
  planViewStatus: "not-loaded",
  planViewGeneratedBy: "runtime-bootstrap",
  status: "documented",
  demoBoundary: "local-demo-only",
  releasePromotionAllowed: false,
  forbiddenAutonomy: [],
  installedAiCoreRoutes: [],
  personalPluginLaneMatrix: [],
  mcpRuntimeContract: null,
  lanes: [],
  years: []
};

function fallbackInstalledAiCoreRoutes() {
  return [
    {
      systemId: "codex-operator",
      systemName: "Codex",
      versionTargetId: "v0.1-foundation",
      versionLabel: "v0.1 Foundation Kernel",
      providerState: "Available",
      routeMode: "supervised-operator",
      subAgentDuty: "Implementation, validation, and repository-safe edits",
      credentialBoundary: "No browser credential; current Codex session only"
    },
    {
      systemId: "seis-local-demo",
      systemName: "SEIS Local Demo Runtime",
      versionTargetId: "v0.1-foundation",
      versionLabel: "v0.1 Foundation Kernel",
      providerState: "Available",
      routeMode: "no-key-local-demo",
      subAgentDuty: "AI shell, Claude-style REPL demo, tool-call ledger, and VFS evidence",
      credentialBoundary: "No key required; browser-local state only"
    },
    {
      systemId: "claude-review-profile",
      systemName: "Claude Review Profile",
      versionTargetId: "v0.2-read-only-intelligence",
      versionLabel: "v0.2 Read-Only Intelligence",
      providerState: "Missing Key",
      routeMode: "backend-only-planned",
      subAgentDuty: "Architecture, safety, PR review, and large-context review lane",
      credentialBoundary: "Server-only Anthropic credential when explicitly configured"
    },
    {
      systemId: "qwen-review-profile",
      systemName: "Qwen Alternative Review",
      versionTargetId: "v0.3-write-gated-runtime",
      versionLabel: "v0.3 Write-Gated Runtime",
      providerState: "Disabled",
      routeMode: "alternative-review-planned",
      subAgentDuty: "Contradiction detection, archive review, and second-opinion risk checks",
      credentialBoundary: "Server-only or local endpoint later"
    },
    {
      systemId: "gemini-validation-profile",
      systemName: "Gemini Secondary Validation",
      versionTargetId: "v0.4-multi-workspace-readiness",
      versionLabel: "v0.4 Multi-Workspace Readiness",
      providerState: "Disabled",
      routeMode: "secondary-validation-planned",
      subAgentDuty: "Multimodal, product, and secondary validation after provider audit",
      credentialBoundary: "Server-only Gemini credential when explicitly configured"
    },
    {
      systemId: "ollama-local-profile",
      systemName: "Ollama Local Candidate",
      versionTargetId: "v0.2-read-only-intelligence",
      versionLabel: "v0.2 Read-Only Intelligence",
      providerState: "Disabled",
      routeMode: "zero-key-local-provider-planned",
      subAgentDuty: "Local/private inference candidate for local-only workspaces",
      credentialBoundary: "No key; user-controlled local service only"
    }
  ];
}

function fallbackPersonalPluginLaneMatrix() {
  return [
    {
      pluginId: "seis@personal",
      laneId: "seis",
      displayName: "SEIS Hub",
      status: "installed-enabled-audited",
      role: "repository governance, architecture, migration safety, and ecosystem coordination",
      versionTargetId: "v0.1-foundation",
      statusTool: "seis_hub_status",
      planTool: "seis_hub_plan",
      permissionLevel: "plan-only",
      versionDuty: "Keep source-of-truth, branch policy, public readiness, and plugin coordination aligned with each AI Core version.",
      gate: "npm run check:seis-agent-plugin-integration",
      aiCoreBoundary: "Embedded personal plugin lane; no external mutation without human approval."
    },
    {
      pluginId: "seis-cloud@personal",
      laneId: "seis-cloud",
      displayName: "SEIS Cloud",
      status: "installed-enabled-audited",
      role: "cloud readiness, public cloud, VPN cloud, provider preflight, rollback, and secret-safe infrastructure",
      versionTargetId: "v0.4-multi-workspace-readiness",
      statusTool: "seis_cloud_status",
      planTool: "seis_cloud_plan",
      permissionLevel: "plan-only",
      versionDuty: "Keep cloud, SSH, VPN, rollback, and deployment boundaries explicit before any version promotion.",
      gate: "npm run check:cloud-access-policy",
      aiCoreBoundary: "Apply, deploy, SSH, firewall, VPN, and credential changes require approval."
    },
    {
      pluginId: "seis-code@personal",
      laneId: "seis-code",
      displayName: "SEIS-Code",
      status: "installed-enabled-audited",
      role: "architecture-aware implementation, tests, CI gates, MCP/plugin code, and automation",
      versionTargetId: "v0.1-foundation",
      statusTool: "seis_code_status",
      planTool: "seis_code_plan",
      permissionLevel: "plan-only",
      versionDuty: "Keep implementation, CI, MCP/plugin code, and test coverage tied to scoped version gates.",
      gate: "npm run check:seis-plugin-bundle",
      aiCoreBoundary: "Implementation stays scoped and validation-bound."
    },
    {
      pluginId: "seis-design@personal",
      laneId: "seis-design",
      displayName: "SEIS-Design",
      status: "installed-enabled-audited",
      role: "product design, UI/UX, design systems, accessibility, motion, and visual QA",
      versionTargetId: "v0.2-read-only-intelligence",
      statusTool: "seis_design_status",
      planTool: "seis_design_plan",
      permissionLevel: "plan-only",
      versionDuty: "Keep UI/UX, accessibility, design-system, and motion quality standards attached to each version.",
      gate: "npm run check:motion-evidence",
      aiCoreBoundary: "Design and asset generation remain evidence-labeled and permissioned."
    },
    {
      pluginId: "seis-data@personal",
      laneId: "seis-data",
      displayName: "SEIS-DATA",
      status: "installed-enabled-audited",
      role: "data architecture, reports, schemas, memory, context, RAG planning, and provenance",
      versionTargetId: "v0.2-read-only-intelligence",
      statusTool: "seis_data_status",
      planTool: "seis_data_plan",
      permissionLevel: "plan-only",
      versionDuty: "Keep structured records, reports, memory/context, provenance, and generated evidence deterministic.",
      gate: "npm run check:plugin-capability-lanes",
      aiCoreBoundary: "Data, memory, and RAG work requires provenance and sensitivity review."
    }
  ];
}

function fallbackMcpRuntimeContract() {
  return {
    id: "seis-ai-core-mcp-runtime-contract",
    sourcePath: "content/development/seis-ai-core-mcp-runtime-contract.json",
    resourceUri: "seis://ai/mcp-runtime-contract.json",
    status: "local-smoke-verified",
    transport: "stdio JSON-RPC",
    fallbackRuntime: "LightweightMcpServer no-dependency fallback",
    fallback: "LightweightMcpServer no-dependency fallback",
    officialSdk: "@modelcontextprotocol/sdk remains optional unless dependencies are installed",
    toolCount: 34,
    resourceCount: 30,
    promptCount: 4,
    smokeTest: "node --test packages/seis-ai/test/mcp-smoke.test.mjs",
    pluginGate: "npm run check:seis-agent-plugin-integration",
    resourceRead: "seis://ai/mcp-runtime-contract.json",
    pluginIntegrationResource: "seis://agent/plugin-integration.json",
    secondBrainSystemResource: "seis://brain/second-brain-system.json",
    credentialBoundary: "No provider keys, SSH credentials, browser secrets, live deploys, GitHub mutation, or external mutation; local MCP smoke contract only.",
    surfaces: [
      {
        id: "tools",
        label: "Tool registry",
        count: 34,
        state: "verified",
        method: "tools/list + tools/call",
        evidence: "16 MCP smoke tests pass through stdio JSON-RPC",
        duty: "Expose bounded SEIS AI Core tools, provider status, model scaling status, and version/sub-agent evidence through the local stdio MCP runtime."
      },
      {
        id: "resources",
        label: "Resource registry",
        count: 30,
        state: "verified",
        method: "resources/list + resources/read",
        evidence: "Plugin integration, Second Brain system contract, provider registry, model scaling profile, model parameter ladder, frontier escalation policy, 150B frontier model program, 20B model/dataset card templates, and MCP runtime contract resources are read through the protocol",
        duty: "Expose source-of-truth JSON resources for plugin integration, the local-demo Second Brain system contract, provider states, planned model scaling, parameter ladder boundaries, no-skip-20B frontier policy, 150B frontier program, 20B clean-room evidence templates, MCP runtime, version gates, fixtures, and generated plan views."
      },
      {
        id: "prompts",
        label: "Prompt registry",
        count: 4,
        state: "verified",
        method: "prompts/list + prompts/get",
        evidence: "Prompt rendering is verified with arguments, including the Second Brain review prompt",
        duty: "Keep bounded audit, i18n, locale, and Second Brain review prompts versioned and visible without copying secrets into browser state."
      },
      {
        id: "transport",
        label: "Transport boundary",
        count: 1,
        state: "verified",
        method: "stdio local process",
        evidence: "No dependency install required for local smoke",
        duty: "Keep MCP available for local verification while official SDK compatibility remains a separate hardening path."
      }
    ]
  };
}

function normalizedMcpRuntimeContract(contract = {}) {
  const fallback = fallbackMcpRuntimeContract();
  const merged = {
    ...fallback,
    ...(contract || {})
  };
  merged.surfaces = Array.isArray(contract?.surfaces) && contract.surfaces.length
    ? contract.surfaces
    : fallback.surfaces;
  return merged;
}

function currentMcpRuntimeContract() {
  return normalizedMcpRuntimeContract(SUB_AGENT_DEMO_PLAN.mcpRuntimeContract);
}

function buildFallbackSubAgentPlanView() {
  const fallbackLanes = [
    { id: "architecture-agent", label: "Architecture", authority: "review-only" },
    { id: "implementation-agent", label: "Implementation", authority: "scoped-worker" },
    { id: "security-agent", label: "Security", authority: "review-only" },
    { id: "documentation-agent", label: "Documentation", authority: "scoped-worker" },
    { id: "validation-agent", label: "Validation", authority: "review-or-scoped-worker" },
    { id: "design-agent", label: "Design", authority: "proposal-or-scoped-worker" }
  ];
  const fallbackYears = Array.from({ length: 5 }, (_, yearIndex) => {
    const year = yearIndex + 1;
    return {
      year,
      theme: `Generated plan view unavailable: Year ${year}`,
      quarters: Array.from({ length: 4 }, (_, quarterIndex) => ({
        id: `Y${year}-Q${quarterIndex + 1}`,
        focus: "Generated plan view could not be loaded; inspect the source plan and generated data artifact before relying on this local fallback.",
        lanes: ["documentation-agent", "validation-agent", "security-agent"],
        primaryLanes: ["documentation-agent", "validation-agent", "security-agent"],
        outcomes: ["fallback-visible", "source-inspection-required", "no-external-mutation"],
        gates: ["source-unavailable", "local-demo-only", "human-review", "no-secret-access"]
      }))
    };
  });

  return {
    source: SUB_AGENT_DEMO_PLAN_CONFIG.source,
    planView: SUB_AGENT_DEMO_PLAN_CONFIG.planView,
    aiCoreProviderRegistry: SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreProviderRegistry,
    aiCoreVersionRegistry: SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreVersionRegistry,
    aiCoreVersionPromotionGates: SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreVersionPromotionGates,
    aiCoreVersionPromotionMap: SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreVersionPromotionMap,
    seisAgentPluginIntegration: SUB_AGENT_DEMO_PLAN_CONFIG.seisAgentPluginIntegration,
    planViewStatus: "fallback-error",
    planViewGeneratedBy: "runtime-fallback",
    status: "fallback",
    demoBoundary: "local-demo-only",
    releasePromotionAllowed: false,
    forbiddenAutonomy: ["deploy", "secret-access", "push-to-main", "ssh-execution", "merge", "model-training"],
    installedAiCoreRoutes: fallbackInstalledAiCoreRoutes(),
    personalPluginLaneMatrix: fallbackPersonalPluginLaneMatrix(),
    mcpRuntimeContract: fallbackMcpRuntimeContract(),
    lanes: fallbackLanes,
    years: fallbackYears
  };
}

SUB_AGENT_DEMO_PLAN = buildFallbackSubAgentPlanView();

function applySubAgentPlanView(payload, servedFrom) {
  const years = Array.isArray(payload.years) ? payload.years : [];
  const lanes = Array.isArray(payload.lanes) ? payload.lanes : [];
  if (years.length !== 5 || lanes.length < 6) {
    throw new Error("invalid generated plan view shape");
  }

  SUB_AGENT_DEMO_PLAN = {
    source: payload.sourcePlan || SUB_AGENT_DEMO_PLAN_CONFIG.source,
    planView: servedFrom,
    aiCoreProviderRegistry: payload.seisAiCoreProviderRegistry || SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreProviderRegistry,
    aiCoreVersionRegistry: payload.seisAiCoreVersionRegistry || SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreVersionRegistry,
    aiCoreVersionPromotionGates: payload.seisAiCoreVersionPromotionGates || SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreVersionPromotionGates,
    aiCoreVersionPromotionMap: SUB_AGENT_DEMO_PLAN_CONFIG.aiCoreVersionPromotionMap,
    seisAgentPluginIntegration: payload.seisAgentPluginIntegration || SUB_AGENT_DEMO_PLAN_CONFIG.seisAgentPluginIntegration,
    planViewStatus: payload.status || "generated-from-source",
    planViewGeneratedBy: payload.generatedBy || "unknown",
    status: payload.planStatus || "documented",
    demoBoundary: payload.demoBoundary || "local-demo-only",
    releasePromotionAllowed: payload.releasePromotionAllowed === true,
    forbiddenAutonomy: payload.forbiddenAutonomy || [],
    installedAiCoreRoutes: Array.isArray(payload.installedAiCoreRoutes) && payload.installedAiCoreRoutes.length
      ? payload.installedAiCoreRoutes
      : fallbackInstalledAiCoreRoutes(),
    personalPluginLaneMatrix: Array.isArray(payload.personalPluginLaneMatrix) && payload.personalPluginLaneMatrix.length
      ? payload.personalPluginLaneMatrix
      : fallbackPersonalPluginLaneMatrix(),
    mcpRuntimeContract: normalizedMcpRuntimeContract(payload.mcpRuntimeContract),
    lanes: lanes.map((lane) => ({
      ...lane,
      label: lane.label || lane.id,
      authority: lane.authority || lane.defaultAuthority || "unknown"
    })),
    years: years.map((year) => ({
      year: year.year,
      theme: year.theme,
      quarters: (year.quarters || []).map((quarter) => ({
        ...quarter,
        lanes: quarter.lanes || quarter.primaryLanes || [],
        primaryLanes: quarter.primaryLanes || quarter.lanes || [],
        gates: quarter.gates || []
      }))
    }))
  };
}

function fallbackSubAgentVersionTargets() {
  const targets = [
    {
      year: 1,
      versionTarget: "v0.1-foundation",
      theme: "SEIS AI Core foundation, local demo, provider honesty, and bounded sub-agent evidence.",
      promotionDryRunDecision: "dry-run-ready",
      promotionGateStatus: "documented",
      nextSafeAction: "Keep no-key startup, local demo fallback, and evidence artifacts green."
    },
    {
      year: 2,
      versionTarget: "v0.2-read-only-intelligence",
      theme: "Read-only repository intelligence, search, Command Center evidence, and local knowledge surfaces.",
      promotionDryRunDecision: "planned",
      promotionGateStatus: "requires-review",
      nextSafeAction: "Add read-only scans, stale-state UX, and validation evidence before promotion."
    },
    {
      year: 3,
      versionTarget: "v0.3-write-gated-runtime",
      theme: "Write-gated agent workflows, permission boundaries, and explicit human approvals.",
      promotionDryRunDecision: "planned",
      promotionGateStatus: "approval-gated",
      nextSafeAction: "Prove path safety, rollback notes, and approval ledger before enabling writes."
    },
    {
      year: 4,
      versionTarget: "v0.4-multi-workspace-readiness",
      theme: "Multi-workspace, SEIS Cloud, SSH preflight, observability, and federation readiness.",
      promotionDryRunDecision: "planned",
      promotionGateStatus: "security-gated",
      nextSafeAction: "Keep SSH disabled by default and validate cloud readiness without private keys."
    },
    {
      year: 5,
      versionTarget: "v1.0-public-enterprise-candidate",
      theme: "Public enterprise candidate with release evidence, model-claim honesty, and governance gates.",
      promotionDryRunDecision: "planned",
      promotionGateStatus: "release-gated",
      nextSafeAction: "Complete public readiness, release evidence, and human approval before promotion."
    }
  ];
  return SUB_AGENT_DEMO_PLAN.years.map((year) => {
    const target = targets.find((item) => item.year === year.year) || targets[0];
    return {
      ...target,
      year: year.year,
      humanApprovalRequired: true,
      releasePromotionAllowed: false
    };
  });
}

let subAgentVersionPromotionMap = {
  id: "seis-ai-core-version-promotion-map",
  status: "fallback-versioned",
  generatedBy: "runtime-fallback",
  source: SUB_AGENT_DEMO_PLAN.aiCoreVersionPromotionMap,
  versionTargetCount: 5,
  promotionGateCount: 5,
  dryRunOnly: true,
  releasePromotionAllowed: false,
  versionTargets: fallbackSubAgentVersionTargets()
};

function currentSubAgentVersionTargets() {
  return Array.isArray(subAgentVersionPromotionMap.versionTargets) && subAgentVersionPromotionMap.versionTargets.length
    ? subAgentVersionPromotionMap.versionTargets
    : fallbackSubAgentVersionTargets();
}

function subAgentVersionTargetForYear(year) {
  return currentSubAgentVersionTargets().find((target) => target.year === year) || {
    year,
    versionTarget: "unknown",
    theme: "unknown",
    promotionDryRunDecision: "not-ready",
    promotionGateStatus: "unknown",
    humanApprovalRequired: true,
    releasePromotionAllowed: false,
    nextSafeAction: "Collect missing promotion evidence before promotion."
  };
}

function buildSubAgentQuarters() {
  return SUB_AGENT_DEMO_PLAN.years.flatMap((year) =>
    year.quarters.map((quarter) => {
    const target = subAgentVersionTargetForYear(year.year);
    return {
      ...quarter,
      year: year.year,
      theme: year.theme,
      aiCoreVersionTarget: target.versionTarget,
      aiCoreVersionTheme: target.theme,
      promotionDryRunDecision: target.promotionDryRunDecision,
      promotionGateStatus: target.promotionGateStatus,
      promotionHumanApprovalRequired: target.humanApprovalRequired,
      promotionReleaseAllowed: target.releasePromotionAllowed,
      promotionNextSafeAction: target.nextSafeAction
    };
  })
  );
}

let subAgentQuarters = buildSubAgentQuarters();

function ensureSubAgentQuarters() {
  if (Array.isArray(subAgentQuarters) && subAgentQuarters.length) return subAgentQuarters;
  const versionTargets = fallbackSubAgentVersionTargets();
  subAgentQuarters = SUB_AGENT_DEMO_PLAN.years.flatMap((year) =>
    year.quarters.map((quarter) => {
      const target = versionTargets.find((item) => item.year === year.year) || versionTargets[0];
      return {
        ...quarter,
        year: year.year,
        theme: year.theme,
        aiCoreVersionTarget: target.versionTarget,
        aiCoreVersionTheme: target.theme,
        promotionDryRunDecision: target.promotionDryRunDecision,
        promotionGateStatus: target.promotionGateStatus,
        promotionHumanApprovalRequired: target.humanApprovalRequired,
        promotionReleaseAllowed: target.releasePromotionAllowed,
        promotionNextSafeAction: target.nextSafeAction
      };
    })
  );
  return subAgentQuarters;
}
let hero3dFrameId = null;
let hero3dLastDiagnostics = {
  ready: false,
  nodeCount: 0,
  edgeCount: 0,
  activeQuarter: "unknown",
  activeVersionTarget: "unknown",
  nonBlankSample: 0,
  paused: true,
  interactionCount: 0
};

function setClipboardText(value) {
  return navigator.clipboard?.writeText(value);
}

function openExternalURL(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function showButtonTempLabel(button, label, duration = 900) {
  if (!button) {
    return;
  }
  const original = button.textContent;
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = original;
  }, duration);
}

function initHero3dScene() {
  if (!hero3dCanvas) return;
  const context = hero3dCanvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const versionTargets = currentSubAgentVersionTargets();
  const orbitSurfaces = [
    { label: "SEIS AI", color: "125, 211, 252" },
    { label: "SEIS Code", color: "167, 139, 250" },
    { label: "SEIS Design", color: "244, 114, 182" },
    { label: "SEIS Cloud", color: "74, 222, 128" },
    { label: "SEIS-SSH", color: "251, 191, 36" }
  ];
  const labels = [
    "SEIS AI Core",
    "Model Router",
    "Prompt Engine",
    "Agent Runtime",
    "SEIS Code",
    "SEIS Design",
    "SEIS Cloud",
    "SEIS-SSH",
    "5-Year Gates",
    ...versionTargets.map((target) => target.versionTarget)
  ];
  const nodes = Array.from({ length: 72 }, (_, index) => {
    const angle = index * 2.399963229728653;
    const y = 1 - (index / 71) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    return {
      x: Math.cos(angle) * radius,
      y,
      z: Math.sin(angle) * radius,
      label: labels[index % labels.length],
      emphasis: index % 9 === 0
    };
  });
  let frame = 0;

  function draw(timestamp = 0) {
    const rect = hero3dCanvas.getBoundingClientRect();
    const width = Math.max(320, rect.width || hero3dCanvas.width);
    const height = Math.max(300, rect.height || hero3dCanvas.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.floor(width * dpr);
    const pixelHeight = Math.floor(height * dpr);
    if (hero3dCanvas.width !== pixelWidth || hero3dCanvas.height !== pixelHeight) {
      hero3dCanvas.width = pixelWidth;
      hero3dCanvas.height = pixelHeight;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const selectedQuarter = subAgentQuarters[state.selectedSubAgentQuarterIndex] || subAgentQuarters[0];
    const selectedTarget = selectedQuarter ? subAgentVersionTargetForYear(selectedQuarter.year) : versionTargets[0];
    const heroState = state.hero3d || {};
    const time = reducedMotion || heroState.paused ? 900 + (heroState.rotation || 0) * 1000 : timestamp * 0.001;
    const rotateY = (heroState.rotation || 0) + time * 0.24 + (state.selectedSubAgentQuarterIndex || 0) * 0.045 + (heroState.pointerX || 0) * 0.16;
    const rotateX = Math.sin(time * 0.28 + (heroState.pointerY || 0) * 0.18) * 0.24;
    const scale = Math.min(width, height) * 0.36;
    const centerX = width * 0.52;
    const centerY = height * 0.5;
    let edgeCount = 0;

    const projected = nodes.map((node) => {
      const cosY = Math.cos(rotateY);
      const sinY = Math.sin(rotateY);
      const x1 = node.x * cosY - node.z * sinY;
      const z1 = node.x * sinY + node.z * cosY;
      const cosX = Math.cos(rotateX);
      const sinX = Math.sin(rotateX);
      const y2 = node.y * cosX - z1 * sinX;
      const z2 = node.y * sinX + z1 * cosX;
      const perspective = 1.1 / (1.85 + z2);
      return {
        ...node,
        sx: centerX + x1 * scale * perspective,
        sy: centerY + y2 * scale * perspective,
        depth: z2,
        alpha: Math.max(0.18, Math.min(1, 0.58 + z2 * 0.3)),
        size: (node.emphasis ? 4.4 : 2.4) * perspective * 1.55
      };
    });

    const gradient = context.createRadialGradient(centerX, centerY, 12, centerX, centerY, Math.max(width, height) * 0.58);
    gradient.addColorStop(0, "rgba(14, 165, 233, 0.18)");
    gradient.addColorStop(0.42, "rgba(59, 130, 246, 0.07)");
    gradient.addColorStop(1, "rgba(2, 6, 23, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const ringBase = Math.min(width, height) * 0.18;
    versionTargets.forEach((target, index) => {
      const radius = ringBase + index * Math.min(width, height) * 0.038;
      const active = target.versionTarget === selectedTarget?.versionTarget;
      context.save();
      context.translate(centerX, centerY);
      context.rotate(-0.22 + Math.sin(rotateY + index) * 0.08);
      context.strokeStyle = active ? "rgba(186, 230, 253, 0.62)" : `rgba(125, 211, 252, ${0.12 + index * 0.035})`;
      context.lineWidth = active ? 2 : 1;
      context.setLineDash(active ? [] : [6, 9]);
      context.beginPath();
      context.ellipse(0, 0, radius * 1.72, radius * 0.42, 0, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);
      if (active) {
        context.fillStyle = "rgba(226, 232, 240, 0.9)";
        context.font = "700 12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
        context.fillText(target.versionTarget, radius * 0.92, -radius * 0.36);
      }
      context.restore();
    });

    for (let index = 0; index < projected.length; index += 1) {
      const first = projected[index];
      for (let nextIndex = index + 1; nextIndex < projected.length; nextIndex += 1) {
        const second = projected[nextIndex];
        const dx = first.x - second.x;
        const dy = first.y - second.y;
        const dz = first.z - second.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance > 0.52) continue;
        const alpha = Math.max(0, (0.52 - distance) * 0.42) * Math.min(first.alpha, second.alpha);
        context.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(first.sx, first.sy);
        context.lineTo(second.sx, second.sy);
        context.stroke();
        edgeCount += 1;
      }
    }

    context.save();
    const corePulse = reducedMotion ? 0.5 : (Math.sin(time * 2.1) + 1) / 2;
    const coreGradient = context.createRadialGradient(centerX, centerY, 2, centerX, centerY, 74 + corePulse * 12);
    coreGradient.addColorStop(0, "rgba(248, 250, 252, 0.95)");
    coreGradient.addColorStop(0.24, "rgba(125, 211, 252, 0.52)");
    coreGradient.addColorStop(1, "rgba(14, 165, 233, 0)");
    context.fillStyle = coreGradient;
    context.beginPath();
    context.arc(centerX, centerY, 76 + corePulse * 10, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(2, 6, 23, 0.72)";
    context.beginPath();
    context.arc(centerX, centerY, 36, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(186, 230, 253, 0.72)";
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = "rgba(248, 250, 252, 0.94)";
    context.font = "800 12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    context.textAlign = "center";
    context.fillText("SEIS", centerX, centerY - 2);
    context.font = "700 9px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    context.fillText("AI CORE", centerX, centerY + 12);
    context.textAlign = "start";
    context.restore();

    orbitSurfaces.forEach((surface, index) => {
      const orbit = rotateY * 0.9 + index * Math.PI * 2 / orbitSurfaces.length;
      const depth = Math.sin(orbit);
      const orbitRadiusX = Math.min(width, height) * 0.34;
      const orbitRadiusY = Math.min(width, height) * 0.12;
      const x = centerX + Math.cos(orbit) * orbitRadiusX;
      const y = centerY + Math.sin(orbit + 0.8) * orbitRadiusY - depth * 18;
      const pillWidth = Math.max(82, surface.label.length * 8.5 + 26);
      const alpha = 0.58 + depth * 0.2;
      context.save();
      context.globalAlpha = Math.max(0.38, Math.min(0.95, alpha));
      context.fillStyle = `rgba(${surface.color}, 0.16)`;
      context.strokeStyle = `rgba(${surface.color}, 0.62)`;
      context.lineWidth = 1;
      context.beginPath();
      context.roundRect(x - pillWidth / 2, y - 15, pillWidth, 30, 12);
      context.fill();
      context.stroke();
      context.fillStyle = "rgba(248, 250, 252, 0.92)";
      context.font = "800 11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      context.textAlign = "center";
      context.fillText(surface.label, x, y + 4);
      context.restore();
    });

    projected
      .sort((first, second) => first.depth - second.depth)
      .forEach((node, index) => {
        context.beginPath();
        context.fillStyle = node.emphasis
          ? `rgba(186, 230, 253, ${node.alpha})`
          : `rgba(96, 165, 250, ${node.alpha * 0.82})`;
        context.arc(node.sx, node.sy, Math.max(1.8, node.size), 0, Math.PI * 2);
        context.fill();
        if (node.emphasis && index % 2 === 0) {
          context.font = "600 11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
          context.fillStyle = `rgba(226, 232, 240, ${Math.min(0.9, node.alpha + 0.08)})`;
          context.fillText(node.label, node.sx + 10, node.sy - 8);
        }
      });

    hero3dCanvas.dataset.hero3dReady = "true";
    hero3dCanvas.dataset.hero3dMode = reducedMotion ? "static" : heroState.paused ? "paused" : "animated";
    hero3dCanvas.dataset.hero3dVersionTarget = selectedTarget?.versionTarget || "unknown";
    hero3dLastDiagnostics = {
      ready: true,
      nodeCount: nodes.length,
      edgeCount,
      activeQuarter: selectedQuarter?.id || "unknown",
      activeVersionTarget: selectedTarget?.versionTarget || "unknown",
      nonBlankSample: 1,
      paused: Boolean(reducedMotion || heroState.paused),
      interactionCount: Number(heroState.interactionCount || 0)
    };
    if (hero3dVersion) {
      hero3dVersion.textContent = `${selectedTarget?.versionTarget || "v0.1-foundation"} · ${selectedQuarter?.id || "Y1-Q1"}`;
    }
    if (hero3dStatus) {
      hero3dStatus.textContent = reducedMotion
        ? "3D map rendered as a reduced-motion static frame"
        : heroState.paused
          ? "3D map paused: AI Core mesh remains inspectable"
          : "3D map live: AI Core, Code, Design, Cloud, SSH, and gates connected";
    }

    if (!reducedMotion && !heroState.paused) {
      hero3dFrameId = window.requestAnimationFrame(draw);
    }
  }

  if (hero3dFrameId) {
    window.cancelAnimationFrame(hero3dFrameId);
  }
  draw();
}

const state = {
  contract: FALLBACK_CONTRACT,
  events: loadEvents(),
  activeRunId: null,
  runs: {},
  route: resolveRouteFromLocation(),
  sessionId: generateId("s"),
  routeStartAt: performance.now(),
  deviceType: detectDevice(),
  isMac: matchMedia("(hover: hover) and (pointer: fine)").matches,
  isFocusMode: loadFocusMode(),
  isGodMode: loadGodMode(),
  selectedSubAgentQuarterIndex: loadSubAgentQuarterIndex(),
  subAgentRunLedger: loadSubAgentRunLedger(),
  hero3d: loadHero3dState()
};

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function detectDevice() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) ? "ios" : "desktop";
}

function normalizeRoute(value) {
  const candidate = (value || "/").trim();
  if (!candidate || candidate === "/" || candidate === "#") return "/";
  return `/${candidate.replace(/^#?\/?/, "").replace(/\/+$/, "")}`;
}

function resolveRouteFromLocation() {
  const hashRoute = location.hash && location.hash.startsWith("#") ? location.hash.slice(1) : "";
  if (hashRoute && hashRoute !== "/") {
    return normalizeRoute(hashRoute);
  }

  const pathname = location.pathname || "/";
  if (pathname === "/" || pathname === "") return "/";
  const pathSegments = pathname.split("/").filter(Boolean);
  if (!pathSegments.length) return "/";
  if (["demo", "results"].includes(pathSegments[0])) {
    return normalizeRoute(`/${pathSegments.join("/")}`);
  }

  const knownIndex = pathSegments.findIndex((segment) => segment === "demo" || segment === "results");
  if (knownIndex >= 0) {
    return normalizeRoute(`/${pathSegments.slice(knownIndex).join("/")}`);
  }

  return "/";
}

function writeRoute(route) {
  state.route = route;
  routePill.textContent = state.route;
  navItems.forEach((item) => {
    const active = normalizeRoute(item.dataset.route || "") === route;
    item.classList.toggle("is-active", active);
  });
  renderFocusModeSignals();
}

function openRoute(route) {
  const normalized = normalizeRoute(route);
  writeRoute(normalized);
  if (normalized === "/") {
    location.hash = "";
  } else {
    location.hash = normalized;
  }
  state.routeStartAt = performance.now();
  renderRoute();
}

function emitEvent(eventName, details = {}) {
  const analyticsEvents = Array.isArray(state.contract.analytics_events) ? state.contract.analytics_events : FALLBACK_CONTRACT.analytics_events;
  const defined = analyticsEvents.find((item) => item.name === eventName);
  const payload = {
    event_name: eventName,
    event_id: generateId("evt"),
    occurred_at: new Date().toISOString(),
    route: state.route,
    session_id: state.sessionId,
    device_type: state.deviceType,
    run_id: state.activeRunId,
    route_time_ms: Math.round(performance.now() - state.routeStartAt),
    details
  };
  if (!defined) {
    payload.details = {
      ...payload.details,
      reason: "event_not_in_contract",
      fallback_contract: true
    };
  }

  state.events.unshift(payload);
  state.events = state.events.slice(0, 40);
  localStorage.setItem(storageKey, JSON.stringify(state.events));

  if (window.webkit?.messageHandlers?.seisDemoTelemetry) {
    window.webkit.messageHandlers.seisDemoTelemetry.postMessage(payload);
  }

  renderEventLog();
}

function loadEvents() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored) || [];
  } catch (_error) {
    return [];
  }
}

function loadFocusMode() {
  return localStorage.getItem(focusStorageKey) === "enabled";
}

function loadGodMode() {
  return localStorage.getItem(godModeStorageKey) === "enabled";
}

function loadSubAgentRunLedger() {
  const stored = localStorage.getItem(subAgentRunStorageKey);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const maxEntries = ensureSubAgentQuarters().length || 20;
    return parsed
      .filter((entry) => entry && typeof entry.quarterId === "string")
      .slice(0, maxEntries);
  } catch (_error) {
    return [];
  }
}

function saveSubAgentRunLedger() {
  localStorage.setItem(subAgentRunStorageKey, JSON.stringify(state.subAgentRunLedger));
}

function loadSubAgentEvidenceReport() {
  const stored = localStorage.getItem(subAgentEvidenceStorageKey);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (_error) {
    return null;
  }
}

function loadSubAgentQuarterIndex() {
  const value = Number(localStorage.getItem(subAgentQuarterStorageKey) || 0);
  if (!Number.isInteger(value)) return 0;
  return Math.max(0, Math.min(value, ensureSubAgentQuarters().length - 1));
}

function loadHero3dState() {
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fallback = {
    rotation: 0.28,
    pointerX: 0,
    pointerY: 0,
    paused: prefersReducedMotion,
    interactionCount: 0,
    lastAction: prefersReducedMotion ? "reduced-motion" : "boot"
  };
  const stored = localStorage.getItem(hero3dStorageKey);
  if (!stored) return fallback;
  try {
    const parsed = JSON.parse(stored);
    return {
      ...fallback,
      rotation: Number.isFinite(parsed.rotation) ? parsed.rotation : fallback.rotation,
      pointerX: Number.isFinite(parsed.pointerX) ? parsed.pointerX : 0,
      pointerY: Number.isFinite(parsed.pointerY) ? parsed.pointerY : 0,
      paused: typeof parsed.paused === "boolean" ? parsed.paused : fallback.paused,
      interactionCount: Number.isInteger(parsed.interactionCount) ? parsed.interactionCount : 0,
      lastAction: typeof parsed.lastAction === "string" ? parsed.lastAction : fallback.lastAction
    };
  } catch (_error) {
    return fallback;
  }
}

function saveHero3dState() {
  localStorage.setItem(hero3dStorageKey, JSON.stringify({
    rotation: state.hero3d.rotation,
    pointerX: state.hero3d.pointerX,
    pointerY: state.hero3d.pointerY,
    paused: state.hero3d.paused,
    interactionCount: state.hero3d.interactionCount,
    lastAction: state.hero3d.lastAction
  }));
}

async function fetchJsonNoStore(url, timeoutMs = 1400) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

async function loadSubAgentPlanView() {
  try {
    const payload = await fetchJsonNoStore(SUB_AGENT_DEMO_PLAN_CONFIG.planView);
    applySubAgentPlanView(payload, SUB_AGENT_DEMO_PLAN_CONFIG.planView);
  } catch (_error) {
    SUB_AGENT_DEMO_PLAN = buildFallbackSubAgentPlanView();
  }

  subAgentQuarters = buildSubAgentQuarters();
  const quarters = ensureSubAgentQuarters();
  state.selectedSubAgentQuarterIndex = Math.max(0, Math.min(state.selectedSubAgentQuarterIndex, quarters.length - 1));
  state.subAgentRunLedger = state.subAgentRunLedger
    .filter((entry) => quarters.some((quarter) => quarter.id === entry.quarterId))
    .slice(0, quarters.length);
}

async function loadSubAgentVersionPromotionMap() {
  try {
    const payload = await fetchJsonNoStore(SUB_AGENT_DEMO_PLAN.aiCoreVersionPromotionMap);
    if (!Array.isArray(payload.versionTargets) || payload.versionTargets.length !== SUB_AGENT_DEMO_PLAN.years.length) {
      throw new Error("invalid version target count");
    }
    subAgentVersionPromotionMap = {
      ...payload,
      servedFrom: SUB_AGENT_DEMO_PLAN.aiCoreVersionPromotionMap
    };
  } catch (_error) {
    subAgentVersionPromotionMap = {
      id: "seis-ai-core-version-promotion-map",
      status: "fallback-error",
      generatedBy: "runtime-fallback",
      servedFrom: SUB_AGENT_DEMO_PLAN.aiCoreVersionPromotionMap,
      versionTargetCount: 5,
      promotionGateCount: 5,
      dryRunOnly: true,
      releasePromotionAllowed: false,
      versionTargets: fallbackSubAgentVersionTargets()
    };
  }

  subAgentQuarters = buildSubAgentQuarters();
  state.selectedSubAgentQuarterIndex = Math.max(0, Math.min(state.selectedSubAgentQuarterIndex, subAgentQuarters.length - 1));
}

function colorForHero3dNode(node) {
  if (node.kind === "core") return "#e0f2fe";
  if (node.kind === "version") {
    return node.active ? "#86efac" : "#93c5fd";
  }
  if (node.kind === "lane") {
    return node.active ? "#fef08a" : "#c4b5fd";
  }
  if (node.kind === "surface") {
    return node.active ? "#f0abfc" : "#67e8f9";
  }
  if (node.kind === "provider") {
    if (node.providerState === "Available") return "#34d399";
    if (node.providerState === "Missing Key") return "#fbbf24";
    return "#94a3b8";
  }
  if (node.kind === "plugin") {
    return node.active ? "#f9a8d4" : "#c084fc";
  }
  if (node.kind === "mcp") {
    return node.active ? "#67e8f9" : "#38bdf8";
  }
  if (node.kind === "mcp-surface") {
    return node.active ? "#a7f3d0" : "#7dd3fc";
  }
  return "#bae6fd";
}

function hero3dRgba(hexColor, alpha) {
  const value = hexColor.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildHero3dGraph() {
  const quarters = ensureSubAgentQuarters();
  const quarter = quarters[state.selectedSubAgentQuarterIndex] || quarters[0];
  const activeLanes = new Set(quarter?.lanes || []);
  const versionTargets = currentSubAgentVersionTargets();
  const nodes = [
    {
      id: "seis-ai-core",
      label: "SEIS AI Core",
      kind: "core",
      x: 0,
      y: -18,
      z: 0,
      radius: 34,
      active: true
    }
  ];

  versionTargets.forEach((target, index) => {
    const angle = (Math.PI * 2 * index) / versionTargets.length - Math.PI / 2;
    nodes.push({
      id: target.versionTarget,
      label: target.versionTarget.replace("v", "v "),
      kind: "version",
      x: Math.cos(angle) * 150,
      y: Math.sin(angle) * 92 - 16,
      z: Math.sin(angle) * 110,
      radius: target.year === quarter?.year ? 22 : 15,
      active: target.year === quarter?.year,
      target
    });
  });

  SUB_AGENT_DEMO_PLAN.lanes.forEach((lane, index) => {
    const angle = (Math.PI * 2 * index) / SUB_AGENT_DEMO_PLAN.lanes.length + Math.PI / 8;
    nodes.push({
      id: lane.id,
      label: lane.label,
      kind: "lane",
      x: Math.cos(angle) * 245,
      y: Math.sin(angle) * 112 + 24,
      z: Math.sin(angle + Math.PI / 5) * 150,
      radius: activeLanes.has(lane.id) ? 20 : 13,
      active: activeLanes.has(lane.id),
      lane
    });
  });

  [
    { id: "surface-seis-code", label: "SEIS Code", active: true, z: 190 },
    { id: "surface-seis-design", label: "SEIS Design", active: true, z: 90 },
    { id: "surface-seis-cloud", label: "SEIS Cloud", active: true, z: -90 },
    { id: "surface-seis-ssh", label: "SEIS-SSH", active: false, z: -190 }
  ].forEach((surface, index) => {
    const angle = (Math.PI * 2 * index) / 4 + Math.PI / 4;
    nodes.push({
      ...surface,
      kind: "surface",
      x: Math.cos(angle) * 318,
      y: Math.sin(angle) * 124 - 10,
      radius: surface.active ? 18 : 14
    });
  });

  const installedRoutes = Array.isArray(SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes)
    ? SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes
    : [];
  installedRoutes.forEach((route, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(installedRoutes.length, 1) + Math.PI / 12;
    nodes.push({
      id: `route-${route.systemId}`,
      label: route.systemName,
      kind: "provider",
      providerState: route.providerState,
      x: Math.cos(angle) * 390,
      y: Math.sin(angle) * 142 + 36,
      z: Math.sin(angle - Math.PI / 6) * 220,
      radius: route.providerState === "Available" ? 17 : 13,
      active: route.providerState === "Available",
      route
    });
  });

  const pluginLanes = Array.isArray(SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix)
    ? SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix
    : [];
  pluginLanes.forEach((plugin, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(pluginLanes.length, 1) - Math.PI / 10;
    const pluginActive = String(plugin.status || "").includes("installed-enabled") || activeLanes.has(plugin.laneId);
    nodes.push({
      id: `plugin-${plugin.laneId}`,
      label: plugin.displayName,
      kind: "plugin",
      x: Math.cos(angle) * 456,
      y: Math.sin(angle) * 154 - 44,
      z: Math.sin(angle + Math.PI / 3) * 248,
      radius: pluginActive ? 17 : 12,
      active: pluginActive,
      plugin
    });
  });

  const mcpRuntime = currentMcpRuntimeContract();
  const mcpSurfaces = Array.isArray(mcpRuntime.surfaces) ? mcpRuntime.surfaces : [];
  nodes.push({
    id: "mcp-runtime",
    label: "MCP Runtime",
    kind: "mcp",
    x: 0,
    y: 176,
    z: -282,
    radius: mcpRuntime.status === "local-smoke-verified" ? 20 : 14,
    active: mcpRuntime.status === "local-smoke-verified",
    mcpRuntime
  });
  mcpSurfaces.forEach((surface, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(mcpSurfaces.length, 1) + Math.PI / 5;
    nodes.push({
      id: `mcp-${surface.id}`,
      label: surface.label,
      kind: "mcp-surface",
      x: Math.cos(angle) * 232,
      y: Math.sin(angle) * 88 + 186,
      z: Math.sin(angle - Math.PI / 4) * 292,
      radius: surface.state === "verified" ? 15 : 11,
      active: surface.state === "verified",
      surface
    });
  });

  const activeVersion = nodes.find((node) => node.kind === "version" && node.active);
  const edges = [
    ...nodes.filter((node) => node.kind !== "core").map((node) => ({
      from: "seis-ai-core",
      to: node.id,
      active: node.active
    }))
  ];
  if (activeVersion) {
    nodes
      .filter((node) => node.kind === "lane" && node.active)
      .forEach((node) => {
        edges.push({ from: activeVersion.id, to: node.id, active: true });
      });
  }
  nodes
    .filter((node) => node.kind === "surface")
    .forEach((node) => {
      edges.push({ from: node.id, to: activeVersion?.id || "seis-ai-core", active: node.active });
    });
  nodes
    .filter((node) => node.kind === "provider")
    .forEach((node) => {
      const targetId = node.route?.versionTargetId || "seis-ai-core";
      edges.push({
        from: node.id,
        to: nodes.some((candidate) => candidate.id === targetId) ? targetId : "seis-ai-core",
        active: node.active
      });
    });
  nodes
    .filter((node) => node.kind === "plugin")
    .forEach((node) => {
      const targetId = node.plugin?.versionTargetId || "seis-ai-core";
      edges.push({
        from: node.id,
        to: nodes.some((candidate) => candidate.id === targetId) ? targetId : "seis-ai-core",
        active: node.active
      });
    });
  nodes
    .filter((node) => node.kind === "mcp-surface")
    .forEach((node) => {
      edges.push({ from: node.id, to: "mcp-runtime", active: node.active });
    });

  return { quarter, nodes, edges };
}

function projectHero3dNode(node, width, height) {
  const angle = state.hero3d.rotation;
  const pitch = -0.42 + state.hero3d.pointerY * 0.14;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const rotatedX = node.x * cos - node.z * sin;
  const rotatedZ = node.x * sin + node.z * cos;
  const rotatedY = node.y * cosPitch - rotatedZ * sinPitch;
  const depth = rotatedY * sinPitch + rotatedZ * cosPitch;
  const camera = 560;
  const scale = camera / (camera + depth + 240);
  return {
    ...node,
    sx: width / 2 + state.hero3d.pointerX * 24 + rotatedX * scale,
    sy: height / 2 + state.hero3d.pointerY * 16 + rotatedY * scale,
    depth,
    scale,
    screenRadius: Math.max(8, node.radius * scale)
  };
}

function drawHero3dGrid(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height / 2 + 80;
  ctx.save();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
  ctx.lineWidth = 1;
  for (let index = -5; index <= 5; index += 1) {
    ctx.beginPath();
    ctx.moveTo(centerX - 320, centerY + index * 24);
    ctx.lineTo(centerX + 320, centerY + index * 24);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX + index * 48, centerY - 150);
    ctx.lineTo(centerX + index * 28, centerY + 150);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHero3dScene(timestamp = 0) {
  if (!hero3dCanvas) return;
  const ctx = hero3dCanvas.getContext("2d", { willReadFrequently: true });
  const rect = hero3dCanvas.getBoundingClientRect();
  const deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.round(rect.width * deviceRatio));
  const height = Math.max(300, Math.round(rect.height * deviceRatio));
  if (hero3dCanvas.width !== width || hero3dCanvas.height !== height) {
    hero3dCanvas.width = width;
    hero3dCanvas.height = height;
  }

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!state.hero3d.paused && !reduceMotion) {
    state.hero3d.rotation += 0.0048;
  }

  const graph = buildHero3dGraph();
  const projected = graph.nodes
    .map((node) => projectHero3dNode(node, width, height))
    .sort((a, b) => a.depth - b.depth);
  const byId = new Map(projected.map((node) => [node.id, node]));

  ctx.clearRect(0, 0, width, height);
  const background = ctx.createRadialGradient(width * 0.5, height * 0.42, 20, width * 0.5, height * 0.5, width * 0.72);
  background.addColorStop(0, "rgba(56, 189, 248, 0.22)");
  background.addColorStop(0.48, "rgba(30, 41, 59, 0.42)");
  background.addColorStop(1, "rgba(2, 6, 23, 0.86)");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  drawHero3dGrid(ctx, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  graph.edges.forEach((edge) => {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) return;
    const gradient = ctx.createLinearGradient(from.sx, from.sy, to.sx, to.sy);
    gradient.addColorStop(0, edge.active ? "rgba(250, 250, 210, 0.42)" : "rgba(147, 197, 253, 0.16)");
    gradient.addColorStop(1, edge.active ? "rgba(74, 222, 128, 0.38)" : "rgba(196, 181, 253, 0.12)");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = edge.active ? 2.4 * deviceRatio : 1.1 * deviceRatio;
    ctx.beginPath();
    ctx.moveTo(from.sx, from.sy);
    ctx.quadraticCurveTo(width / 2, height / 2 - 40 * deviceRatio, to.sx, to.sy);
    ctx.stroke();
  });
  ctx.restore();

  projected.forEach((node) => {
    const color = colorForHero3dNode(node);
    ctx.save();
    ctx.globalAlpha = Math.min(1, 0.62 + node.scale * 0.34);
    const glow = ctx.createRadialGradient(node.sx, node.sy, 1, node.sx, node.sy, node.screenRadius * 3.1);
    glow.addColorStop(0, hero3dRgba(color, 0.8));
    glow.addColorStop(0.38, hero3dRgba(color, 0.3));
    glow.addColorStop(1, "rgba(2, 6, 23, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(node.sx, node.sy, node.screenRadius * 3.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = node.kind === "core" ? "rgba(224, 242, 254, 0.98)" : color;
    ctx.strokeStyle = node.active ? "rgba(255, 255, 255, 0.92)" : "rgba(226, 232, 240, 0.52)";
    ctx.lineWidth = node.active ? 2.2 * deviceRatio : 1 * deviceRatio;
    ctx.beginPath();
    ctx.arc(node.sx, node.sy, node.screenRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = `${Math.round((node.active ? 12 : 10) * deviceRatio)}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
    ctx.fillStyle = node.active || node.kind === "core" ? "rgba(248, 250, 252, 0.95)" : "rgba(203, 213, 225, 0.72)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(node.label, node.sx, node.sy + node.screenRadius + 7 * deviceRatio);
    ctx.restore();
  });

  const sample = ctx.getImageData(Math.floor(width / 2), Math.floor(height / 2), 1, 1).data;
  const nonBlankSample = sample[0] + sample[1] + sample[2] + sample[3];
  const activeVersionTarget = graph.quarter?.aiCoreVersionTarget || "unknown";
  const mcpRuntime = currentMcpRuntimeContract();
  hero3dCanvas.dataset.hero3dReady = "true";
  hero3dCanvas.dataset.hero3dMode = reduceMotion || state.hero3d.paused ? "static" : "animated";
  hero3dCanvas.dataset.hero3dVersionTarget = activeVersionTarget;
  hero3dLastDiagnostics = {
    ready: true,
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    installedAiRouteCount: SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes.length,
    personalPluginLaneCount: SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix.length,
    mcpRuntimeSurfaceCount: mcpRuntime.surfaces.length,
    mcpRuntimeToolCount: mcpRuntime.toolCount,
    mcpRuntimeResourceCount: mcpRuntime.resourceCount,
    mcpRuntimePromptCount: mcpRuntime.promptCount,
    mcpRuntimeStatus: mcpRuntime.status,
    mcpRuntimeTransport: mcpRuntime.transport,
    activeQuarter: graph.quarter?.id || "unknown",
    activeVersionTarget,
    nonBlankSample,
    paused: state.hero3d.paused || reduceMotion,
    interactionCount: state.hero3d.interactionCount,
    lastAction: state.hero3d.lastAction
  };
  hero3dCanvas.dataset.hero3dReady = "true";
  hero3dCanvas.dataset.hero3dMode = hero3dLastDiagnostics.paused ? "static" : "animated";
  hero3dCanvas.dataset.hero3dVersionTarget = activeVersionTarget;
  updateHero3dStatus();

  hero3dFrameId = requestAnimationFrame(drawHero3dScene);
}

function updateHero3dStatus() {
  const quarter = subAgentQuarters[state.selectedSubAgentQuarterIndex] || subAgentQuarters[0];
  const mcpRuntime = currentMcpRuntimeContract();
  if (hero3dStatus) {
    const motion = hero3dLastDiagnostics.paused ? "paused" : "orbiting";
    hero3dStatus.textContent = `${quarter?.id || "Y1-Q1"} -> ${quarter?.aiCoreVersionTarget || "v0.1-foundation"} / Code, Design, Cloud, SSH, ${SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes.length} AI routes, ${SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix.length} plugin lanes, ${mcpRuntime.toolCount} MCP tools / ${motion}`;
  }
  if (hero3dVersion) {
    hero3dVersion.textContent = `${currentSubAgentVersionTargets().length} version gates / ${SUB_AGENT_DEMO_PLAN.lanes.length} agents / ${SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes.length} AI routes / ${SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix.length} plugin lanes / ${mcpRuntime.surfaces.length} MCP surfaces`;
  }
  if (hero3dPauseButton) {
    hero3dPauseButton.setAttribute("aria-pressed", String(state.hero3d.paused));
    hero3dPauseButton.textContent = state.hero3d.paused ? "Resume" : "Pause";
  }
}

function recordHero3dInteraction(action, details = {}) {
  state.hero3d.interactionCount += 1;
  state.hero3d.lastAction = action;
  hero3dLastDiagnostics = {
    ...hero3dLastDiagnostics,
    interactionCount: state.hero3d.interactionCount,
    lastAction: action
  };
  saveHero3dState();
  emitEvent("seis_demo_ai_core_3d_interacted", {
    action,
    quarter: subAgentQuarters[state.selectedSubAgentQuarterIndex]?.id,
    version_target: subAgentQuarters[state.selectedSubAgentQuarterIndex]?.aiCoreVersionTarget,
    ...details
  });
}

function syncHero3dToSelectedQuarter() {
  const total = Math.max(1, ensureSubAgentQuarters().length);
  state.hero3d.rotation = (Math.PI * 2 * state.selectedSubAgentQuarterIndex) / total + 0.28;
  recordHero3dInteraction("sync-quarter", {
    selected_quarter_index: state.selectedSubAgentQuarterIndex
  });
  updateHero3dStatus();
}

function attachHero3dInteractions() {
  if (!hero3dCanvas) return;

  const selectNextHero3dQuarter = () => {
    const nextIndex = (state.selectedSubAgentQuarterIndex + 1) % subAgentQuarters.length;
    selectSubAgentQuarter(nextIndex, { source: "ai-core-3d-map" });
    recordHero3dInteraction("select-next-quarter", {
      selected_quarter_index: nextIndex
    });
  };

  hero3dCanvas.addEventListener("pointermove", (event) => {
    const rect = hero3dCanvas.getBoundingClientRect();
    state.hero3d.pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    state.hero3d.pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });
  hero3dCanvas.addEventListener("pointerleave", () => {
    state.hero3d.pointerX = 0;
    state.hero3d.pointerY = 0;
  });
  hero3dCanvas.addEventListener("click", selectNextHero3dQuarter);
  hero3dCanvas.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    selectNextHero3dQuarter();
  });

  if (hero3dRotateButton) {
    hero3dRotateButton.addEventListener("click", () => {
      state.hero3d.rotation += Math.PI / 3;
      recordHero3dInteraction("rotate-map");
      showButtonTempLabel(hero3dRotateButton, "Rotated");
    });
  }
  if (hero3dSyncButton) {
    hero3dSyncButton.addEventListener("click", () => {
      syncHero3dToSelectedQuarter();
      showButtonTempLabel(hero3dSyncButton, "Synced");
    });
  }
  if (hero3dPauseButton) {
    hero3dPauseButton.addEventListener("click", () => {
      state.hero3d.paused = !state.hero3d.paused;
      recordHero3dInteraction(state.hero3d.paused ? "pause-map" : "resume-map");
      updateHero3dStatus();
    });
  }
}

function drawHero3dSafeFallback(error) {
  if (!hero3dCanvas) return;
  const ctx = hero3dCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const rect = hero3dCanvas.getBoundingClientRect();
  const deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.round((rect.width || hero3dCanvas.width || 720) * deviceRatio));
  const height = Math.max(300, Math.round((rect.height || hero3dCanvas.height || 520) * deviceRatio));
  hero3dCanvas.width = width;
  hero3dCanvas.height = height;

  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.42, 10, width * 0.5, height * 0.5, width * 0.74);
  gradient.addColorStop(0, "rgba(125, 211, 252, 0.28)");
  gradient.addColorStop(0.48, "rgba(59, 130, 246, 0.18)");
  gradient.addColorStop(1, "rgba(2, 6, 23, 0.92)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(186, 230, 253, 0.38)";
  ctx.lineWidth = 2 * deviceRatio;

  const centerX = width * 0.5;
  const centerY = height * 0.48;
  for (let index = 0; index < 5; index += 1) {
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, width * (0.16 + index * 0.055), height * (0.075 + index * 0.022), -0.28 + index * 0.12, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(248, 250, 252, 0.95)";
  ctx.font = `${Math.round(18 * deviceRatio)}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("SEIS AI CORE", centerX, centerY - 4 * deviceRatio);
  ctx.font = `${Math.round(11 * deviceRatio)}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  ctx.fillText("fallback render / local demo", centerX, centerY + 20 * deviceRatio);

  const quarter = subAgentQuarters[state.selectedSubAgentQuarterIndex] || subAgentQuarters[0];
  const activeVersionTarget = quarter?.aiCoreVersionTarget || "v0.1-foundation";
  const mcpRuntime = currentMcpRuntimeContract();
  hero3dCanvas.dataset.hero3dReady = "true";
  hero3dCanvas.dataset.hero3dMode = "static";
  hero3dCanvas.dataset.hero3dVersionTarget = activeVersionTarget;
  hero3dLastDiagnostics = {
    ready: true,
    nodeCount: Math.max(16, SUB_AGENT_DEMO_PLAN.lanes.length + currentSubAgentVersionTargets().length + SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes.length + SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix.length + mcpRuntime.surfaces.length + 6),
    edgeCount: Math.max(16, subAgentQuarters.length),
    installedAiRouteCount: SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes.length,
    personalPluginLaneCount: SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix.length,
    mcpRuntimeSurfaceCount: mcpRuntime.surfaces.length,
    mcpRuntimeToolCount: mcpRuntime.toolCount,
    mcpRuntimeResourceCount: mcpRuntime.resourceCount,
    mcpRuntimePromptCount: mcpRuntime.promptCount,
    mcpRuntimeStatus: mcpRuntime.status,
    mcpRuntimeTransport: mcpRuntime.transport,
    activeQuarter: quarter?.id || "Y1-Q1",
    activeVersionTarget,
    nonBlankSample: 1,
    paused: true,
    interactionCount: state.hero3d.interactionCount,
    lastAction: "safe-fallback",
    fallbackReason: error?.message || "drawHero3dScene failed"
  };
  updateHero3dStatus();
}

function initHero3dMap() {
  if (!hero3dCanvas) return;
  attachHero3dInteractions();
  updateHero3dStatus();
  if (hero3dFrameId) {
    cancelAnimationFrame(hero3dFrameId);
  }
  try {
    drawHero3dScene(performance.now());
  } catch (error) {
    drawHero3dSafeFallback(error);
  }
}

function renderEventLog() {
  if (!eventLog) return;
  const visibleEventCount = state.isGodMode ? 5 : state.isFocusMode ? 8 : 20;
  eventLog.textContent = JSON.stringify(state.events.slice(0, visibleEventCount), null, 2);
}

function renderFocusModeSignals() {
  if (!focusModeSignals) return;
  focusModeSignals.replaceChildren();
  const signals = [
    `Mode: ${state.isFocusMode ? "focused" : "standard"}`,
    `God Mode: ${state.isGodMode ? "active" : "off"}`,
    `Route: ${state.route}`,
    `Run: ${state.activeRunId || "none"}`
  ];
  signals.forEach((signal) => {
    const item = document.createElement("li");
    item.textContent = signal;
    focusModeSignals.appendChild(item);
  });
}

function updateFocusModeUI() {
  document.body.classList.toggle("is-focus-mode", state.isFocusMode);
  if (focusModeToggleButton) {
    focusModeToggleButton.setAttribute("aria-pressed", String(state.isFocusMode));
    focusModeToggleButton.textContent = state.isFocusMode ? "Exit focus" : "Enable focus";
  }
  if (focusModeStatus) {
    focusModeStatus.textContent = state.isFocusMode
      ? "Focus Mode is active: secondary panels are quiet and telemetry is compact."
      : "Focus Mode is ready for concentrated SEIS work.";
  }
  renderFocusModeSignals();
  setMetricsFromContract();
  renderEventLog();
  renderGodModeSignals();
}

function setFocusMode(enabled, options = {}) {
  const shouldEmit = options.emit !== false;
  state.isFocusMode = Boolean(enabled);
  localStorage.setItem(focusStorageKey, state.isFocusMode ? "enabled" : "disabled");
  updateFocusModeUI();
  if (shouldEmit) {
    emitEvent("seis_demo_focus_mode_changed", {
      enabled: state.isFocusMode,
      mode: state.isFocusMode ? "focused" : "standard",
      compact_event_count: state.isFocusMode ? 8 : 20
    });
  }
}

function renderGodModeSignals() {
  if (!godModeSignals) return;
  godModeSignals.replaceChildren();
  const signals = [
    "Product: visible demo behavior must improve",
    "Engineering: code changes must stay reversible",
    "AI/AGI: learning contracts must capture behavior",
    "Plugins: SEIS-Agent plugin integration must stay manifest-backed",
    "Security: no secrets or weakened gates",
    "Governance: quality evidence stays attached"
  ];
  signals.forEach((signal) => {
    const item = document.createElement("li");
    item.textContent = signal;
    godModeSignals.appendChild(item);
  });
}

function updateGodModeUI() {
  document.body.classList.toggle("is-god-mode", state.isGodMode);
  if (godModeToggleButton) {
    godModeToggleButton.setAttribute("aria-pressed", String(state.isGodMode));
    godModeToggleButton.textContent = state.isGodMode ? "Exit God Mode" : "Activate God Mode";
  }
  if (godModeStatus) {
    godModeStatus.textContent = state.isGodMode
      ? "God Mode Developer is active: every SEIS change must improve product, app, AI, cloud, security, and governance evidence."
      : "God Mode Developer is available for cross-layer SEIS development.";
  }
  renderGodModeSignals();
  renderFocusModeSignals();
  setMetricsFromContract();
  renderEventLog();
}

function setGodMode(enabled, options = {}) {
  const shouldEmit = options.emit !== false;
  state.isGodMode = Boolean(enabled);
  localStorage.setItem(godModeStorageKey, state.isGodMode ? "enabled" : "disabled");
  updateGodModeUI();
  if (shouldEmit) {
    emitEvent("seis_demo_god_mode_changed", {
      enabled: state.isGodMode,
      mode: state.isGodMode ? "god-mode-developer" : "standard",
      required_layers: ["product", "application", "ai-agi", "cloud-security", "governance"]
    });
  }
}

if (godModeToggleButton) {
  godModeToggleButton.addEventListener("click", () => {
    setGodMode(!state.isGodMode);
  });
}

updateGodModeUI();
renderGodModeModuleCoverage();
renderGodModeReleaseReadiness();
renderGodModeValidationPlan();
renderGodModeWorkPackage();
renderGodModeAdrWorkflow();
renderGodModeEcosystemLanes();
renderGodModeHandoff();
renderGodModeCompletionAudit();
renderGodModeRunState();
renderGodModeStagingManifest();
renderGodModeChangelog();
renderSubAgentPlan();

function scenarioById(id) {
  const scenarios = Array.isArray(state.contract.scenarios) ? state.contract.scenarios : FALLBACK_CONTRACT.scenarios;
  return scenarios.find((item) => item.id === id);
}

function renderGodModeModuleCoverage() {
  if (!moduleCoverageGrid) return;

  const layers = ["Product", "Platform", "AI", "Security", "Quality"];
  const modules = [
    {
      name: "Dashboard",
      feature: "Operating overview for coverage, gate posture, risk, and next build slice.",
      gate: "npm run check:seis-god-mode-module-coverage",
      evidence: "apps/seis-demo-web + module coverage contract",
      next: "Read module coverage contract and flag missing evidence."
    },
    {
      name: "Goals",
      feature: "Evidence ledger for objectives, acceptance criteria, blockers, validation, and rollback.",
      gate: "npm run check:seis-goals-evidence-ledger",
      evidence: "goals evidence ledger contract",
      next: "Map every active objective to proof, risk, and rollback readiness."
    },
    {
      name: "Repos",
      feature: "Repo health layer for CI posture, plugin readiness, publish safety, and governance drift.",
      gate: "npm run check:seis-repo-health-manifest",
      evidence: "repo health manifest contract",
      next: "Summarize required checks and missing governance files per lane."
    },
    {
      name: "Docs",
      feature: "Living documentation system for architecture, gates, AI policy, and module coverage.",
      gate: "npm run check:seis-governance-index",
      evidence: "governance index contract",
      next: "Link manifesto, quality gates, AI policy, and God Mode coverage."
    },
    {
      name: "Agents",
      feature: "Safe autonomy model for skill scope, tool boundaries, validation duties, and observability.",
      gate: "npm run check:seis-agent-lane-status",
      evidence: "agent lane status contract",
      next: "Show which agent lanes are active, checked, and safe to use."
    }
  ];

  moduleCoverageGrid.innerHTML = modules
    .map(
      (module) => `
        <article class="module-coverage-card">
          <div class="module-coverage-card__header">
            <span class="module-coverage-card__label">${module.name}</span>
            <span class="module-coverage-card__state">Mapped</span>
          </div>
          <p>${module.feature}</p>
          <div class="module-coverage-layers" aria-label="${module.name} required layers">
            ${layers.map((layer) => `<span>${layer}</span>`).join("")}
          </div>
          <dl class="module-coverage-meta">
            <div>
              <dt>Gate</dt>
              <dd>${module.gate}</dd>
            </div>
            <div>
              <dt>Evidence</dt>
              <dd>${module.evidence}</dd>
            </div>
          </dl>
          <div class="module-coverage-next">
            <strong>Next slice</strong>
            <span>${module.next}</span>
          </div>
        </article>
      `
    )
    .join("");

  if (moduleCoverageBadge) {
    moduleCoverageBadge.textContent = `${modules.length} modules x ${layers.length} layers`;
  }
  queueMicrotask(() => {
    emitEvent("seis_demo_module_coverage_viewed", {
      panel: "module_coverage",
      module_count: modules.length,
      layer_count: layers.length
    });
  });
}

function renderGodModeReleaseReadiness() {
  if (!releaseReadinessGrid) return;

  const gates = [
    {
      name: "Security",
      rule: "No secrets, weakened controls, unsafe instructions, or hidden destructive behavior.",
      evidence: "repo health + agent lane safety docs"
    },
    {
      name: "AI Policy",
      rule: "Agent scope, autonomy boundary, tool boundary, safety boundary, and validation duty must be declared.",
      evidence: "agent lane status contract"
    },
    {
      name: "Quality Evidence",
      rule: "Every module claim needs acceptance criteria, evidence links, and a checker.",
      evidence: "goals evidence ledger"
    },
    {
      name: "Feature Growth",
      rule: "Every required God Mode topic needs feature or governance improvement evidence and visible remaining gaps.",
      evidence: "feature growth ledger + Command Center surface"
    },
    {
      name: "Rollback",
      rule: "Every meaningful slice needs a reversible rollback path.",
      evidence: "repo health manifest + goals ledger"
    },
    {
      name: "CI Readiness",
      rule: "Quality governance must include the relevant God Mode gates before release claims.",
      evidence: "package quality:governance + CI workflow"
    }
  ];

  releaseReadinessGrid.innerHTML = gates
    .map(
      (gate) => `
        <article class="release-readiness-card">
          <div class="release-readiness-card__header">
            <span>${gate.name}</span>
            <strong>Required</strong>
          </div>
          <p>${gate.rule}</p>
          <small>${gate.evidence}</small>
        </article>
      `
    )
    .join("");

  if (releaseReadinessBadge) {
    releaseReadinessBadge.textContent = `${gates.length} required gates`;
  }
  queueMicrotask(() => {
    emitEvent("seis_demo_release_readiness_viewed", {
      panel: "release_readiness",
      gate_count: gates.length,
      required: true
    });
  });
}

function renderGodModeValidationPlan() {
  if (!validationPlanList) return;

  const commands = [
    {
      label: "God Mode foundation",
      command: "npm run check:seis-god-mode-developer",
      proves: "Skill, plugin, governance doc, and operating contract."
    },
    {
      label: "Module coverage",
      command: "npm run check:seis-god-mode-module-coverage",
      proves: "Dashboard, Goals, Repos, Docs, and Agents mapped to five layers."
    },
    {
      label: "Goal evidence",
      command: "npm run check:seis-goals-evidence-ledger",
      proves: "Acceptance criteria, validation commands, rollback, and evidence links."
    },
    {
      label: "Repo health",
      command: "npm run check:seis-repo-health-manifest",
      proves: "Repo lanes, publish safety, security, and rollback posture."
    },
    {
      label: "Governance index",
      command: "npm run check:seis-governance-index",
      proves: "Living docs index covers architecture, quality, AI, modules, goals, repos, agents, release, and validation."
    },
    {
      label: "Agent lanes",
      command: "npm run check:seis-agent-lane-status",
      proves: "Skills, autonomy boundaries, tool boundaries, safety boundaries, and validation duties."
    },
    {
      label: "SEIS-Agent plugin integration",
      command: "npm run check:seis-agent-plugin-integration",
      proves: "Personal SEIS plugins, embedded lanes, seis_plugin_integration, MCP resource, app surface, and repo docs are connected."
    },
    {
      label: "Release readiness",
      command: "npm run check:seis-god-mode-release-readiness",
      proves: "Security, AI policy, quality evidence, rollback, and CI readiness."
    },
    {
      label: "Validation plan",
      command: "npm run check:seis-god-mode-validation-plan",
      proves: "Command sequence and proof targets are source-controlled."
    },
    {
      label: "Work package",
      command: "npm run check:seis-god-mode-work-package",
      proves: "Current slice is bounded by module, gate, primary files, rollback, and pending validation state."
    },
    {
      label: "ADR workflow",
      command: "npm run check:seis-god-mode-adr-workflow",
      proves: "Architecture decisions use a source-controlled template, example ADR, and workflow gate."
    },
    {
      label: "Handoff",
      command: "npm run check:seis-god-mode-handoff",
      proves: "Handoff includes summary, risks, rollback, next commands, and protected user work."
    },
    {
      label: "Completion audit",
      command: "npm run check:seis-god-mode-completion-audit",
      proves: "Completion remains blocked until validation, commit, push, CI, and protected-user-work evidence exist."
    },
    {
      label: "Run state",
      command: "npm run check:seis-god-mode-run-state",
      proves: "Current package state remains pending until validation, commit boundary, push, and CI evidence exist."
    },
    {
      label: "Staging manifest",
      command: "npm run check:seis-god-mode-staging-manifest",
      proves: "Commit scope is bounded and unrelated user work remains protected before staging."
    },
    {
      label: "Changelog",
      command: "npm run check:seis-god-mode-changelog",
      proves: "Added features are recorded as draft-unverified release notes without claiming release readiness."
    },
    {
      label: "Feature growth ledger",
      command: "npm run check:seis-god-mode-feature-growth-ledger",
      proves: "Every required topic has feature or governance improvement evidence plus remaining gaps."
    },
    {
      label: "Full governance",
      command: "npm run quality:governance",
      proves: "Repo-level governance chain passes as one release-grade gate."
    }
  ];

  validationPlanList.innerHTML = commands
    .map(
      (item) => `
        <li>
          <div>
            <strong>${item.label}</strong>
            <code>${item.command}</code>
          </div>
          <span>${item.proves}</span>
        </li>
      `
    )
    .join("");

  if (validationPlanBadge) {
    validationPlanBadge.textContent = `${commands.length} commands`;
  }
  queueMicrotask(() => {
    emitEvent("seis_demo_validation_plan_viewed", {
      panel: "validation_plan",
      command_count: commands.length,
      includes_full_governance: true
    });
  });
}

function renderGodModeWorkPackage() {
  if (!workPackageGrid) return;

  const sections = [
    {
      name: "Product Surface",
      status: "Implemented / unverified",
      gate: "npm run check:seis-god-mode-module-coverage",
      rollback: "Revert dashboard panels, renderers, styles, and cache version."
    },
    {
      name: "Goals",
      status: "Implemented / unverified",
      gate: "npm run check:seis-goals-evidence-ledger",
      rollback: "Remove goals ledger contract, doc, checker, and quality reference."
    },
    {
      name: "Repos",
      status: "Implemented / unverified",
      gate: "npm run check:seis-repo-health-manifest",
      rollback: "Remove repo health manifest, doc, checker, and quality reference."
    },
    {
      name: "Docs",
      status: "Implemented / unverified",
      gate: "npm run check:seis-governance-index",
      rollback: "Remove governance index additions and slice-only indexed docs."
    },
    {
      name: "Agents",
      status: "Implemented / unverified",
      gate: "npm run check:seis-agent-lane-status",
      rollback: "Remove agent lane status artifacts and God Mode skill references."
    },
    {
      name: "SEIS-Agent Plugin Integration",
      status: "Implemented / unverified",
      gate: "npm run check:seis-agent-plugin-integration",
      rollback: "Remove plugin integration manifest, AI helper, MCP tool/resource, app panel entries, docs, checker, and package script."
    },
    {
      name: "Security + AI + Rollback",
      status: "Implemented / unverified",
      gate: "npm run check:seis-god-mode-release-readiness",
      rollback: "Remove release readiness contract, doc, checker, and dashboard panel."
    },
    {
      name: "Validation",
      status: "Implemented / unverified",
      gate: "npm run check:seis-god-mode-validation-plan",
      rollback: "Remove validation plan contract, doc, checker, and dashboard panel."
    },
    {
      name: "Architecture Decisions",
      status: "Implemented / unverified",
      gate: "npm run check:seis-god-mode-adr-workflow",
      rollback: "Remove ADR workflow contract, template, example ADR, checker, and dashboard panel."
    },
    {
      name: "Handoff",
      status: "Implemented / unverified",
      gate: "npm run check:seis-god-mode-handoff",
      rollback: "Remove handoff contract, doc, checker, dashboard panel, and governance links."
    },
    {
      name: "Completion Audit",
      status: "Implemented / unverified",
      gate: "npm run check:seis-god-mode-completion-audit",
      rollback: "Remove completion audit contract, doc, checker, dashboard panel, and governance links."
    },
    {
      name: "Run State",
      status: "Implemented / unverified",
      gate: "npm run check:seis-god-mode-run-state",
      rollback: "Remove run-state contract, doc, checker, dashboard panel, and governance links."
    },
    {
      name: "Staging Manifest",
      status: "Implemented / unverified",
      gate: "npm run check:seis-god-mode-staging-manifest",
      rollback: "Remove staging manifest contract, doc, checker, dashboard panel, and governance links."
    },
    {
      name: "Changelog",
      status: "Implemented / unverified",
      gate: "npm run check:seis-god-mode-changelog",
      rollback: "Remove changelog contract, doc, checker, dashboard panel, and governance links."
    }
  ];

  workPackageGrid.innerHTML = sections
    .map(
      (section) => `
        <article class="work-package-card">
          <div class="work-package-card__header">
            <span>${section.name}</span>
            <strong>${section.status}</strong>
          </div>
          <dl>
            <div>
              <dt>Gate</dt>
              <dd>${section.gate}</dd>
            </div>
            <div>
              <dt>Rollback</dt>
              <dd>${section.rollback}</dd>
            </div>
          </dl>
        </article>
      `
    )
    .join("");

  if (workPackageBadge) {
    workPackageBadge.textContent = `${sections.length} sections`;
  }
  queueMicrotask(() => {
    emitEvent("seis_demo_work_package_viewed", {
      panel: "work_package",
      section_count: sections.length,
      commit_readiness: "pending-validation"
    });
  });
}

function renderGodModeChangelog() {
  if (!changelogGrid) return;

  const entries = [
    "Dashboard",
    "Goals",
    "Repos",
    "Docs",
    "Agents",
    "Security + AI + Rollback",
    "Validation",
    "Architecture Decisions",
    "Handoff",
    "Completion Audit",
    "Run State",
    "Staging Manifest",
    "Plugin Integration"
  ];

  changelogGrid.innerHTML = entries
    .map(
      (entry) => `
        <article class="changelog-card">
          <strong>${entry}</strong>
          <span>draft-unverified</span>
        </article>
      `
    )
    .join("");

  if (changelogBadge) {
    changelogBadge.textContent = "draft-unverified";
  }

  queueMicrotask(() => {
    emitEvent("seis_demo_changelog_viewed", {
      panel: "changelog",
      release_state: "draft-unverified",
      entry_count: entries.length
    });
  });
}

function renderGodModeStagingManifest() {
  if (!stagingManifestGrid) return;

  const groups = [
    { name: "Dashboard Runtime", state: "include after validation", note: "panels + renderers + styles + cache" },
    { name: "Shared Contracts", state: "include after validation", note: "web/native telemetry parity" },
    { name: "God Mode Contracts", state: "include after validation", note: "source of truth package" },
    { name: "Agent Plugin Integration", state: "include after validation", note: "manifest + AI tool + MCP resource + demo panel" },
    { name: "Governance Docs", state: "include after validation", note: "operating docs + ADRs" },
    { name: "Quality Checkers", state: "include after validation", note: "CI-linked gates" },
    { name: "Plugin Skill", state: "include after validation", note: "manifest + skill + agent" },
    { name: "Package Quality Chain", state: "include after validation", note: "package scripts only with checkers" }
  ];

  stagingManifestGrid.innerHTML = groups
    .map(
      (group) => `
        <article class="staging-manifest-card">
          <div class="staging-manifest-card__header">
            <span>${group.name}</span>
            <strong>${group.state}</strong>
          </div>
          <p>${group.note}</p>
        </article>
      `
    )
    .join("");

  if (stagingManifestBadge) {
    stagingManifestBadge.textContent = "planned-not-staged";
  }

  queueMicrotask(() => {
    emitEvent("seis_demo_staging_manifest_viewed", {
      panel: "staging_manifest",
      staging_state: "planned-not-staged",
      group_count: groups.length
    });
  });
}

function renderGodModeRunState() {
  if (!runStateGrid) return;

  const states = [
    { name: "Source-controlled artifacts", state: "present / unverified", next: "run checkers" },
    { name: "Runtime surfaces", state: "present / unverified", next: "browser or runtime check" },
    { name: "Telemetry contracts", state: "present / unverified", next: "contract parity check" },
    { name: "Validation commands", state: "planned / not run", next: "explicit approval to run" },
    { name: "Commit boundary", state: "pending review", next: "protect unrelated work" },
    { name: "Push and CI", state: "missing evidence", next: "push after validation" },
    { name: "Protected user work", state: "declared / pending final review", next: "final staging review" }
  ];

  runStateGrid.innerHTML = states
    .map(
      (item) => `
        <article class="run-state-card">
          <div class="run-state-card__header">
            <span>${item.name}</span>
            <strong>${item.state}</strong>
          </div>
          <p>${item.next}</p>
        </article>
      `
    )
    .join("");

  if (runStateBadge) {
    runStateBadge.textContent = "pending-validation";
  }

  queueMicrotask(() => {
    emitEvent("seis_demo_run_state_viewed", {
      panel: "run_state",
      run_state: "pending-validation",
      state_count: states.length
    });
  });
}

function renderGodModeCompletionAudit() {
  if (!completionAuditGrid) return;

  const items = [
    { name: "New Features", state: "Implemented / unverified", missing: "runtime + quality output" },
    { name: "Dashboard", state: "Implemented / unverified", missing: "browser verification" },
    { name: "Goals", state: "Implemented / unverified", missing: "goals check output" },
    { name: "Repos", state: "Implemented / unverified", missing: "repo health + commit boundary review" },
    { name: "Docs", state: "Implemented / unverified", missing: "governance index output" },
    { name: "Agents", state: "Implemented / unverified", missing: "agent lane output" },
    { name: "Security + AI + Rollback", state: "Implemented / unverified", missing: "release readiness output" },
    { name: "Validation", state: "Missing evidence", missing: "validation command output" },
    { name: "Commit / Push / CI", state: "Missing evidence", missing: "commit hash + push + CI pass" },
    { name: "Protected User Work", state: "Implemented / unverified", missing: "final staging review" }
  ];

  completionAuditGrid.innerHTML = items
    .map(
      (item) => `
        <article class="completion-audit-card">
          <div class="completion-audit-card__header">
            <span>${item.name}</span>
            <strong>${item.state}</strong>
          </div>
          <p>${item.missing}</p>
        </article>
      `
    )
    .join("");

  if (completionAuditBadge) {
    completionAuditBadge.textContent = "not-complete";
  }

  queueMicrotask(() => {
    emitEvent("seis_demo_completion_audit_viewed", {
      panel: "completion_audit",
      completion_state: "not-complete",
      audit_item_count: items.length
    });
  });
}

function renderGodModeHandoff() {
  if (!handoffList) return;

  const sections = [
    {
      label: "Summary",
      detail: "God Mode added dashboard surfaces, contracts, docs, quality gates, telemetry, ADR workflow, plugin integration, validation plan, and handoff tracking."
    },
    {
      label: "Changed Surfaces",
      detail: "Product, goals, repos, docs, agents, security, AI, rollback, validation, ADR, and handoff surfaces are represented."
    },
    {
      label: "Validation Status",
      detail: "Pending. No completion claim until validation plan and quality governance pass."
    },
    {
      label: "Risks",
      detail: "Unrun validation, uncommitted changes, unpushed branch state, and unrelated user work."
    },
    {
      label: "Rollback",
      detail: "Remove bounded slice artifacts: panels, contracts, docs, checkers, scripts, telemetry, and index entries."
    },
    {
      label: "Next Commands",
      detail: "Run handoff, validation plan, work package, ADR workflow, completion audit, run-state, staging manifest, changelog, and quality governance checks."
    },
    {
      label: "Protected User Work",
      detail: "Unrelated user or system changes must be preserved during validation and commit preparation."
    }
  ];

  handoffList.innerHTML = sections
    .map(
      (section) => `
        <li>
          <strong>${section.label}</strong>
          <span>${section.detail}</span>
        </li>
      `
    )
    .join("");

  if (handoffBadge) {
    handoffBadge.textContent = `${sections.length} handoff sections`;
  }

  queueMicrotask(() => {
    emitEvent("seis_demo_handoff_viewed", {
      panel: "handoff",
      section_count: sections.length,
      handoff_state: "pending-validation"
    });
  });
}

function renderGodModeAdrWorkflow() {
  if (!adrWorkflowList) return;

  const steps = [
    {
      label: "Scope",
      rule: "Define affected modules, layers, and user outcomes before editing.",
      evidence: "Module coverage and work package."
    },
    {
      label: "Decision",
      rule: "Record durable architecture decisions using the SEIS ADR template.",
      evidence: "docs/adr/0001-seis-god-mode-operating-system.md"
    },
    {
      label: "Implementation",
      rule: "Ship bounded, reversible slices with contracts, docs, scripts, and UI when user-visible.",
      evidence: "Primary files listed in the work package."
    },
    {
      label: "Validation",
      rule: "Run or request the relevant validation plan commands before completion claims.",
      evidence: "God Mode validation plan."
    },
    {
      label: "Handoff",
      rule: "Report changes, validation status, risks, rollback, and next steps without hiding unverified work.",
      evidence: "Final response, commit, PR, or release note."
    }
  ];

  adrWorkflowList.innerHTML = steps
    .map(
      (step) => `
        <li>
          <strong>${step.label}</strong>
          <p>${step.rule}</p>
          <span>${step.evidence}</span>
        </li>
      `
    )
    .join("");

  if (adrWorkflowBadge) {
    adrWorkflowBadge.textContent = `${steps.length} workflow steps`;
  }

  queueMicrotask(() => {
    emitEvent("seis_demo_adr_workflow_viewed", {
      panel: "adr_workflow",
      step_count: steps.length,
      adr_required: true
    });
  });
}

function renderGodModeEcosystemLanes() {
  if (!ecosystemLanesGrid) return;

  const lanes = [
    {
      name: "Goals",
      status: "Evidence ledger active",
      source: "content/development/seis-goals-evidence-ledger.json",
      gate: "npm run check:seis-goals-evidence-ledger",
      next: "Run validation and move current goals from implemented-unverified to evidence-backed."
    },
    {
      name: "Repos",
      status: "Health manifest active",
      source: "content/development/seis-repo-health-manifest.json",
      gate: "npm run check:seis-repo-health-manifest",
      next: "Prepare commit-safe diff boundaries and protect unrelated worktree changes."
    },
    {
      name: "Docs",
      status: "Governance index active",
      source: "content/development/seis-governance-index.json",
      gate: "npm run check:seis-governance-index",
      next: "Keep every new durable decision indexed with a purpose and source path."
    },
    {
      name: "Agents",
      status: "Lane status active",
      source: "content/development/seis-agent-lane-status.json",
      gate: "npm run check:seis-agent-lane-status",
      next: "Keep every active agent lane observable, controllable, and validation-bound."
    },
    {
      name: "SEIS-Agent",
      status: "Plugin integration active",
      source: "content/development/seis-agent-plugin-integration.json",
      gate: "npm run check:seis-agent-plugin-integration",
      next: "Route seis_plugin_integration while keeping seis@personal and specialist plugins embedded under seis-ai-agent@seis-repo."
    },
    {
      name: "SEIS AI Core Sub-Agent Model",
      status: "Status/plan-only model active",
      source: "content/development/seis-ai-core-subagent-operating-model.json",
      gate: "npm run check:seis-ai-core-subagent-operating-model",
      next: "Route seis_ai_core_version_promotion_dry_run, seis_ai_core_subagent_model, and seis_ai_core_subagent_review_ledger before claiming five-year sub-agent autonomy, promotion readiness, or write-gated capability."
    },
    {
      name: "SEIS AI Core Version Registry",
      status: "Version status read-only",
      source: "content/development/seis-ai-core-version-registry.json",
      gate: "npm run check:seis-ai-core-version-registry",
      next: "Expose seis_ai_core_version_status as evidence for SEIS AI Core v0.1, SEIS Language v0.1, and five-year promotion gates without claiming trained model ownership."
    },
    {
      name: "SEIS AI Core Promotion Gates",
      status: "Promotion dry-run evidence active",
      source: "content/development/seis-ai-core-version-promotion-gates.json",
      gate: "npm run check:seis-ai-core-version-promotion-gates",
      next: "Use seis_ai_core_version_promotion_dry_run as internal readiness evidence only; it does not approve releases, providers, credentials, cloud, SSH, or write-gated runtime."
    },
    {
      name: "SEIS AI Core Review Ledger",
      status: "Quarterly evidence ledger active",
      source: "content/development/seis-ai-core-subagent-review-ledger.json",
      gate: "npm run check:seis-ai-core-subagent-review-ledger",
      next: "Use the ledger as read-only evidence for five-year quarter status; future quarters stay planned until validators and evidence exist."
    },
    {
      name: "SEIS Hub",
      status: "Embedded lane active",
      source: "plugins/seis-ai-agent/skills/seis-hub/SKILL.md",
      gate: "npm run check:seis-ai-agent",
      next: "Route repository governance, architecture, migration safety, and quality policy through SEIS-Agent."
    },
    {
      name: "SEIS Cloud",
      status: "Embedded lane active",
      source: "plugins/seis-ai-agent/skills/seis-cloud/SKILL.md",
      gate: "npm run check:cloud-access-policy",
      next: "Keep public cloud and team/workplace VPN cloud paths explicit, scoped, and rollback-ready."
    },
    {
      name: "SEIS-Code",
      status: "Embedded lane active",
      source: "plugins/seis-ai-agent/skills/seis-code/SKILL.md",
      gate: "npm run check:seis-plugin-bundle",
      next: "Route implementation, tests, CI, MCP/plugin code, and automation through the code lane."
    },
    {
      name: "SEIS-Design",
      status: "Embedded lane active",
      source: "plugins/seis-ai-agent/skills/seis-design/SKILL.md",
      gate: "npm run check:motion-evidence",
      next: "Keep product UI, design systems, accessibility, motion, and visual QA connected to implementation."
    },
    {
      name: "SEIS-DATA",
      status: "Embedded lane active",
      source: "plugins/seis-ai-agent/skills/seis-data/SKILL.md",
      gate: "npm run check:plugin-capability-lanes",
      next: "Keep reports, schemas, memory, context, plugin inventory, and provenance tied to generated sources."
    }
  ];

  ecosystemLanesGrid.innerHTML = lanes
    .map(
      (lane) => `
        <article class="ecosystem-lane-card">
          <div class="ecosystem-lane-card__header">
            <span>${lane.name}</span>
            <strong>${lane.status}</strong>
          </div>
          <dl>
            <div>
              <dt>Source</dt>
              <dd>${lane.source}</dd>
            </div>
            <div>
              <dt>Gate</dt>
              <dd>${lane.gate}</dd>
            </div>
            <div>
              <dt>Next</dt>
              <dd>${lane.next}</dd>
            </div>
          </dl>
        </article>
      `
    )
    .join("");

  if (ecosystemLanesBadge) {
    ecosystemLanesBadge.textContent = `${lanes.length} lanes`;
  }

  queueMicrotask(() => {
    emitEvent("seis_demo_ecosystem_lanes_viewed", {
      panel: "ecosystem_lanes",
      lane_count: lanes.length,
      lanes: lanes.map((lane) => lane.name.toLowerCase())
    });
  });
}

function laneLabel(laneId) {
  return SUB_AGENT_DEMO_PLAN.lanes.find((lane) => lane.id === laneId)?.label || laneId;
}

function quarterIndexById(quarterId) {
  return ensureSubAgentQuarters().findIndex((quarter) => quarter.id === quarterId);
}

function completedSubAgentQuarters() {
  return new Set(state.subAgentRunLedger.map((entry) => entry.quarterId));
}

function getSubAgentPulseCountForLane(laneId) {
  return state.subAgentRunLedger.filter((entry) => Array.isArray(entry.lanes) && entry.lanes.includes(laneId)).length;
}

function describeSubAgentAction(laneId, quarter) {
  const actions = {
    "architecture-agent": "reviews architecture boundaries and promotion gates",
    "implementation-agent": "prepares scoped implementation work without external mutation",
    "security-agent": "checks approval boundaries, secrets, and unsafe autonomy",
    "documentation-agent": "records source-of-truth updates and handoff notes",
    "validation-agent": "runs or schedules deterministic validation evidence",
    "design-agent": "checks calm UX, accessibility, and demo clarity"
  };
  return `${actions[laneId] || "reviews assigned work"} for ${quarter.id}`;
}

function recordSubAgentDemoPulse(quarter) {
  const existingEntries = state.subAgentRunLedger.filter((entry) => entry.quarterId !== quarter.id);
  const pulse = {
    id: generateId("pulse"),
    quarterId: quarter.id,
    year: quarter.year,
    theme: quarter.theme,
    focus: quarter.focus,
    lanes: quarter.lanes,
    gates: quarter.gates,
    aiCoreVersionTarget: quarter.aiCoreVersionTarget,
    aiCoreVersionTheme: quarter.aiCoreVersionTheme,
    promotionDryRunDecision: quarter.promotionDryRunDecision,
    promotionGateStatus: quarter.promotionGateStatus,
    promotionHumanApprovalRequired: quarter.promotionHumanApprovalRequired,
    promotionReleaseAllowed: quarter.promotionReleaseAllowed,
    promotionNextSafeAction: quarter.promotionNextSafeAction,
    status: "local-demo-recorded",
    boundary: SUB_AGENT_DEMO_PLAN.demoBoundary,
    occurredAt: new Date().toISOString(),
    agents: quarter.lanes.map((laneId) => ({
      laneId,
      label: laneLabel(laneId),
      action: describeSubAgentAction(laneId, quarter)
    }))
  };

  state.subAgentRunLedger = [...existingEntries, pulse].sort(
    (first, second) => quarterIndexById(first.quarterId) - quarterIndexById(second.quarterId)
  );
  saveSubAgentRunLedger();
  return pulse;
}

function renderSubAgentEvidenceStatus() {
  if (!subAgentExportStatus) return;
  const report = loadSubAgentEvidenceReport();
  if (!report) {
    subAgentExportStatus.textContent = "No evidence export yet.";
    return;
  }
  subAgentExportStatus.textContent = `Last evidence export: ${report.recordedQuarterCount}/${report.quarterCount} quarters, ${report.status}, ${report.generatedAt}.`;
}

function renderSubAgentVersionMap(selectedQuarter) {
  if (!subAgentVersionMap) return;
  const versionTargets = currentSubAgentVersionTargets();

  subAgentVersionMap.innerHTML = `
    <div class="sub-agent-version-map__heading">
      <div>
        <p class="eyebrow">SEIS AI Core version promotion</p>
        <h3 id="sub-agent-version-map-title">Read-only promotion map</h3>
      </div>
      <span>dry-run only</span>
    </div>
    <div class="sub-agent-version-map__grid">
      ${versionTargets
        .map(
          (target) => `
            <article class="sub-agent-version-card ${target.year === selectedQuarter.year ? "is-active" : ""}" data-sub-agent-version-target="${target.versionTarget}">
              <div>
                <strong>Year ${target.year}</strong>
                <span>${target.versionTarget}</span>
              </div>
              <p>${target.theme}</p>
              <dl>
                <div>
                  <dt>Dry-run decision</dt>
                  <dd>${target.promotionDryRunDecision}</dd>
                </div>
                <div>
                  <dt>Human approval</dt>
                  <dd>${target.humanApprovalRequired ? "required" : "not required for dry-run"}</dd>
                </div>
              </dl>
              <small>${target.nextSafeAction}</small>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  queueMicrotask(() => {
    emitEvent("seis_demo_sub_agent_version_map_viewed", {
      panel: "ai_core_version_promotion_map",
      selected_quarter: selectedQuarter.id,
      selected_version_target: selectedQuarter.aiCoreVersionTarget,
      version_target_count: versionTargets.length,
      promotion_map_status: subAgentVersionPromotionMap.status,
      promotion_map_source: subAgentVersionPromotionMap.servedFrom || SUB_AGENT_DEMO_PLAN.aiCoreVersionPromotionMap,
      release_promotion_allowed: subAgentVersionPromotionMap.releasePromotionAllowed === true
    });
  });
}

function renderSubAgentRouteMesh(selectedQuarter) {
  if (!subAgentRouteMesh) return;
  const routes = Array.isArray(SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes)
    ? SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes
    : [];
  const activeTarget = selectedQuarter?.aiCoreVersionTarget || "v0.1-foundation";

  subAgentRouteMesh.innerHTML = `
    <div class="sub-agent-version-map__heading">
      <div>
        <p class="eyebrow">Installed AI route mesh</p>
        <h3 id="sub-agent-route-mesh-title">AI Core profile routing</h3>
      </div>
      <span>${routes.length} routes / local demo</span>
    </div>
    <div class="sub-agent-route-mesh__grid">
      ${routes
        .map(
          (route) => `
            <article class="sub-agent-route-card ${route.versionTargetId === activeTarget ? "is-active" : ""}" data-installed-ai-route="${route.systemId}">
              <div>
                <strong>${route.systemName}</strong>
                <span>${route.providerState}</span>
              </div>
              <p>${route.subAgentDuty}</p>
              <dl>
                <div>
                  <dt>AI Core target</dt>
                  <dd>${route.versionTargetId}</dd>
                </div>
                <div>
                  <dt>Route mode</dt>
                  <dd>${route.routeMode}</dd>
                </div>
                <div>
                  <dt>Credential boundary</dt>
                  <dd>${route.credentialBoundary}</dd>
                </div>
              </dl>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  queueMicrotask(() => {
    emitEvent("seis_demo_installed_ai_route_mesh_viewed", {
      panel: "installed_ai_route_mesh",
      route_count: routes.length,
      active_version_target: activeTarget,
      available_routes: routes.filter((route) => route.providerState === "Available").length
    });
  });
}

function renderSubAgentPluginMesh(selectedQuarter) {
  if (!subAgentPluginMesh) return;
  const pluginLanes = Array.isArray(SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix)
    ? SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix
    : [];
  const activeLanes = new Set(selectedQuarter?.lanes || []);

  subAgentPluginMesh.innerHTML = `
    <div class="sub-agent-version-map__heading">
      <div>
        <p class="eyebrow">Personal plugin lane mesh</p>
        <h3 id="sub-agent-plugin-mesh-title">SEIS plugin lanes inside AI Core</h3>
      </div>
      <span>${pluginLanes.length} lanes / plan-only</span>
    </div>
    <div class="sub-agent-plugin-mesh__grid">
      ${pluginLanes
        .map(
          (plugin) => `
            <article class="sub-agent-plugin-card ${String(plugin.status || "").includes("installed-enabled") || activeLanes.has(plugin.laneId) ? "is-active" : ""}" data-personal-plugin-lane="${plugin.laneId}">
              <div>
                <strong>${plugin.pluginId}</strong>
                <span>${plugin.permissionLevel}</span>
              </div>
              <p>${plugin.versionDuty}</p>
              <dl>
                <div>
                  <dt>AI Core target</dt>
                  <dd>${plugin.versionTargetId}</dd>
                </div>
                <div>
                  <dt>Tool pair</dt>
                  <dd>${plugin.statusTool} / ${plugin.planTool}</dd>
                </div>
                <div>
                  <dt>Gate</dt>
                  <dd>${plugin.gate}</dd>
                </div>
              </dl>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  queueMicrotask(() => {
    emitEvent("seis_demo_personal_plugin_lane_mesh_viewed", {
      panel: "personal_plugin_lane_mesh",
      lane_count: pluginLanes.length,
      active_lanes: Array.from(activeLanes)
    });
  });
}

function renderSubAgentMcpRuntimeMesh() {
  if (!subAgentMcpRuntimeMesh) return;
  const mcpRuntime = currentMcpRuntimeContract();
  const surfaces = Array.isArray(mcpRuntime.surfaces) ? mcpRuntime.surfaces : [];

  subAgentMcpRuntimeMesh.innerHTML = `
    <div class="sub-agent-version-map__heading">
      <div>
        <p class="eyebrow">MCP runtime mesh</p>
        <h3 id="sub-agent-mcp-runtime-mesh-title">SEIS AI Core tool contract</h3>
      </div>
      <span>${mcpRuntime.toolCount} tools / ${mcpRuntime.transport}</span>
    </div>
    <div class="sub-agent-mcp-runtime-mesh__grid">
      ${surfaces
        .map(
          (surface) => `
            <article class="sub-agent-mcp-runtime-card ${surface.state === "verified" ? "is-active" : ""}" data-mcp-runtime-surface="${surface.id}">
              <div>
                <strong>${surface.label}</strong>
                <span>${surface.state}</span>
              </div>
              <p>${surface.duty}</p>
              <dl>
                <div>
                  <dt>Count</dt>
                  <dd>${surface.count}</dd>
                </div>
                <div>
                  <dt>Transport</dt>
                  <dd>${mcpRuntime.transport}</dd>
                </div>
                <div>
                  <dt>Fallback</dt>
                  <dd>${mcpRuntime.fallbackRuntime}</dd>
                </div>
                <div>
                  <dt>Boundary</dt>
                  <dd>${mcpRuntime.credentialBoundary}</dd>
                </div>
              </dl>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  queueMicrotask(() => {
    emitEvent("seis_demo_mcp_runtime_mesh_viewed", {
      panel: "mcp_runtime_mesh",
      status: mcpRuntime.status,
      transport: mcpRuntime.transport,
      tool_count: mcpRuntime.toolCount,
      resource_count: mcpRuntime.resourceCount,
      prompt_count: mcpRuntime.promptCount,
      surface_count: surfaces.length
    });
  });
}

function buildSubAgentConstellationInspectorModel(selectedQuarter = null) {
  const quarters = ensureSubAgentQuarters();
  const quarter = selectedQuarter || quarters[state.selectedSubAgentQuarterIndex] || quarters[0];
  const routes = Array.isArray(SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes)
    ? SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes
    : [];
  const pluginLanes = Array.isArray(SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix)
    ? SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix
    : [];
  const mcpRuntime = currentMcpRuntimeContract();
  const surfaces = Array.isArray(mcpRuntime.surfaces) ? mcpRuntime.surfaces : [];
  const activeTarget = quarter?.aiCoreVersionTarget || "v0.1-foundation";
  const quarterLaneIds = new Set(quarter?.lanes || []);
  const activeRoutes = routes.filter((route) => route.versionTargetId === activeTarget || route.providerState === "Available");
  const activePluginLanes = pluginLanes.filter(
    (plugin) =>
      plugin.versionTargetId === activeTarget ||
      quarterLaneIds.has(plugin.laneId) ||
      String(plugin.status || "").includes("installed-enabled")
  );
  const planOnlyPluginLanes = pluginLanes.filter((plugin) => plugin.permissionLevel === "plan-only");

  return {
    id: "seis-ai-core-constellation-inspector",
    status: "local-demo-integrated",
    boundary: SUB_AGENT_DEMO_PLAN.demoBoundary,
    quarterId: quarter?.id || "unknown",
    year: quarter?.year || 0,
    versionTarget: activeTarget,
    versionTheme: quarter?.aiCoreVersionTheme || "unknown",
    routeCount: routes.length,
    activeRouteCount: activeRoutes.length,
    availableRouteCount: routes.filter((route) => route.providerState === "Available").length,
    pluginLaneCount: pluginLanes.length,
    activePluginLaneCount: activePluginLanes.length,
    planOnlyPluginLaneCount: planOnlyPluginLanes.length,
    mcpRuntimeSurfaceCount: surfaces.length,
    mcpRuntimeToolCount: mcpRuntime.toolCount,
    mcpRuntimeResourceCount: mcpRuntime.resourceCount,
    mcpRuntimePromptCount: mcpRuntime.promptCount,
    mcpRuntimeStatus: mcpRuntime.status,
    mcpRuntimeTransport: mcpRuntime.transport,
    mcpRuntimeResourceUri: mcpRuntime.resourceUri,
    heroNodeCount: hero3dLastDiagnostics.nodeCount || 0,
    heroEdgeCount: hero3dLastDiagnostics.edgeCount || 0,
    heroInteractionCount: state.hero3d.interactionCount,
    heroLastAction: state.hero3d.lastAction,
    selectedLanes: Array.from(quarterLaneIds).map(laneLabel),
    activeRoutes: activeRoutes.map((route) => ({
      systemId: route.systemId,
      systemName: route.systemName,
      providerState: route.providerState,
      routeMode: route.routeMode,
      versionTargetId: route.versionTargetId
    })),
    personalPluginLanes: pluginLanes.map((plugin) => ({
      pluginId: plugin.pluginId,
      displayName: plugin.displayName,
      status: plugin.status,
      permissionLevel: plugin.permissionLevel,
      versionTargetId: plugin.versionTargetId,
      gate: plugin.gate
    })),
    mcpRuntimeSurfaces: surfaces.map((surface) => ({
      id: surface.id,
      label: surface.label,
      state: surface.state,
      count: surface.count
    }))
  };
}

function renderSubAgentConstellationInspector(selectedQuarter) {
  if (!subAgentConstellationInspector) return;
  const model = buildSubAgentConstellationInspectorModel(selectedQuarter);
  const routePreview = model.activeRoutes.slice(0, 4);
  const pluginPreview = model.personalPluginLanes.slice(0, 5);
  const surfacePreview = model.mcpRuntimeSurfaces;

  subAgentConstellationInspector.innerHTML = `
    <div class="sub-agent-version-map__heading">
      <div>
        <p class="eyebrow">AI Core integration inspector</p>
        <h3 id="sub-agent-constellation-inspector-title">SEIS AI Core constellation</h3>
      </div>
      <span>${model.quarterId} / Local Demo</span>
    </div>
    <p class="sub-agent-constellation-summary">
      ${model.versionTarget} connects ${model.routeCount} installed AI routes, ${model.pluginLaneCount} personal plugin lanes,
      and ${model.mcpRuntimeToolCount} MCP tools / ${model.mcpRuntimeResourceCount} resources / ${model.mcpRuntimePromptCount} prompts
      into one bounded SEIS AI Core surface.
    </p>
    <div class="sub-agent-constellation-metrics" aria-label="AI Core constellation metrics">
      <div>
        <span>Version</span>
        <strong>${model.versionTarget}</strong>
      </div>
      <div>
        <span>3D Graph</span>
        <strong>${model.heroNodeCount} nodes / ${model.heroEdgeCount} edges</strong>
      </div>
      <div>
        <span>AI Routes</span>
        <strong>${model.availableRouteCount} available / ${model.routeCount} total</strong>
      </div>
      <div>
        <span>Plugins</span>
        <strong>${model.planOnlyPluginLaneCount} plan-only / ${model.pluginLaneCount} total</strong>
      </div>
      <div>
        <span>MCP Runtime</span>
        <strong>${model.mcpRuntimeToolCount} MCP tools / ${model.mcpRuntimeResourceCount} resources</strong>
      </div>
      <div>
        <span>Boundary</span>
        <strong>Local Demo only</strong>
      </div>
    </div>
    <div class="sub-agent-constellation-grid">
      <article class="sub-agent-constellation-card" data-constellation-node="ai-routes">
        <div>
          <strong>Active AI routes</strong>
          <span>${model.activeRouteCount} routed</span>
        </div>
        <ul>
          ${routePreview
            .map((route) => `<li><b>${route.systemName}</b><small>${route.providerState} · ${route.routeMode}</small></li>`)
            .join("")}
        </ul>
      </article>
      <article class="sub-agent-constellation-card" data-constellation-node="personal-plugins">
        <div>
          <strong>Personal plugin lanes</strong>
          <span>${model.activePluginLaneCount} integrated</span>
        </div>
        <ul>
          ${pluginPreview
            .map((plugin) => `<li><b>${plugin.pluginId}</b><small>${plugin.permissionLevel} · ${plugin.versionTargetId}</small></li>`)
            .join("")}
        </ul>
      </article>
      <article class="sub-agent-constellation-card" data-constellation-node="mcp-runtime">
        <div>
          <strong>MCP contract</strong>
          <span>${model.mcpRuntimeStatus}</span>
        </div>
        <ul>
          ${surfacePreview
            .map((surface) => `<li><b>${surface.label}</b><small>${surface.count} · ${surface.state}</small></li>`)
            .join("")}
        </ul>
      </article>
    </div>
    <div class="sub-agent-constellation-actions" aria-label="AI Core constellation actions">
      <button type="button" class="ghost-button" data-constellation-action="sync" data-cta-id="constellation_sync_3d">Sync 3D Map</button>
      <button type="button" class="ghost-button" data-constellation-action="next" data-cta-id="constellation_next_quarter">Next Quarter</button>
      <button type="button" class="ghost-button" data-constellation-action="pulse" data-cta-id="constellation_record_pulse">Record Pulse</button>
    </div>
  `;

  subAgentConstellationInspector.querySelectorAll("[data-constellation-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.constellationAction;
      if (action === "sync") {
        syncHero3dToSelectedQuarter();
        emitEvent("seis_demo_constellation_inspector_synced", {
          quarter_id: model.quarterId,
          ai_core_version_target: model.versionTarget,
          route_count: model.routeCount,
          plugin_lane_count: model.pluginLaneCount,
          mcp_runtime_tool_count: model.mcpRuntimeToolCount
        });
        showButtonTempLabel(button, "Synced");
        return;
      }

      if (action === "next") {
        const nextIndex = (state.selectedSubAgentQuarterIndex + 1) % ensureSubAgentQuarters().length;
        emitEvent("seis_demo_cta_click", {
          cta_id: "constellation_next_quarter",
          from_quarter: model.quarterId,
          to_quarter: ensureSubAgentQuarters()[nextIndex]?.id
        });
        selectSubAgentQuarter(nextIndex, { source: "constellation-inspector" });
        return;
      }

      if (action === "pulse") {
        emitEvent("seis_demo_cta_click", {
          cta_id: "constellation_record_pulse",
          quarter_id: model.quarterId,
          ai_core_version_target: model.versionTarget
        });
        runSubAgentDemoPulse();
      }
    });
  });

  queueMicrotask(() => {
    emitEvent("seis_demo_constellation_inspector_viewed", {
      panel: "ai_core_constellation_inspector",
      quarter_id: model.quarterId,
      ai_core_version_target: model.versionTarget,
      route_count: model.routeCount,
      plugin_lane_count: model.pluginLaneCount,
      mcp_runtime_tool_count: model.mcpRuntimeToolCount,
      mcp_runtime_resource_count: model.mcpRuntimeResourceCount,
      boundary: model.boundary
    });
  });
}

function renderSubAgentRunLedger() {
  if (!subAgentRunStatus || !subAgentRunList) return;

  const quarters = ensureSubAgentQuarters();
  const completed = completedSubAgentQuarters();
  const progressPercent = Math.round((completed.size / quarters.length) * 100);
  subAgentRunStatus.textContent = `${completed.size}/${quarters.length} quarters recorded (${progressPercent}%). Local Demo only; no background agent, deployment, SSH, credential, or GitHub write action ran.`;

  const visibleEntries = state.subAgentRunLedger.slice(-6).reverse();
  if (!visibleEntries.length) {
    subAgentRunList.innerHTML = `
      <li class="sub-agent-run-empty">
        Run a demo pulse to record a bounded local sub-agent quarter.
      </li>
    `;
    renderSubAgentEvidenceStatus();
    return;
  }

  subAgentRunList.innerHTML = visibleEntries
    .map(
      (entry) => `
        <li>
          <strong>${entry.quarterId}</strong>
          <span>${(entry.agents || []).map((agent) => agent.label).join(" + ") || "Recorded lanes"}</span>
          <small>${(entry.gates || []).join(", ") || "Gates recorded locally"}</small>
        </li>
      `
    )
    .join("");
  renderSubAgentEvidenceStatus();
}

function renderSubAgentPlan() {
  if (!subAgentPlanGrid || !subAgentQuarterList || !subAgentQuarterDetail) return;

  const quarters = ensureSubAgentQuarters();
  const selectedQuarter = quarters[state.selectedSubAgentQuarterIndex] || quarters[0];
  const completed = completedSubAgentQuarters();
  subAgentPlanGrid.innerHTML = SUB_AGENT_DEMO_PLAN.lanes
    .map(
      (lane) => `
        <article class="sub-agent-lane-card">
          <div class="sub-agent-lane-card__header">
            <span>${lane.label}</span>
            <strong>${lane.authority}</strong>
          </div>
          <p>${lane.id}</p>
          <small>${getSubAgentPulseCountForLane(lane.id)} local pulses</small>
        </article>
      `
    )
    .join("");

  subAgentQuarterList.innerHTML = quarters
    .map(
      (quarter, index) => `
        <li>
          <button
            type="button"
            class="${index === state.selectedSubAgentQuarterIndex ? "is-active" : ""} ${completed.has(quarter.id) ? "is-complete" : ""}"
            data-sub-agent-quarter="${index}"
            aria-pressed="${index === state.selectedSubAgentQuarterIndex ? "true" : "false"}"
          >
            <span>${quarter.id}</span>
            <small>${completed.has(quarter.id) ? "Recorded" : `Year ${quarter.year}`}</small>
          </button>
        </li>
      `
    )
    .join("");

  subAgentQuarterDetail.innerHTML = `
    <div class="sub-agent-quarter-detail__header">
      <div>
        <strong>${selectedQuarter.id}</strong>
        <span>${selectedQuarter.theme}</span>
      </div>
      <em>${SUB_AGENT_DEMO_PLAN.demoBoundary}</em>
    </div>
    <p>${selectedQuarter.focus}</p>
    <dl>
      <div>
        <dt>Primary lanes</dt>
        <dd>${selectedQuarter.lanes.map(laneLabel).join(", ")}</dd>
      </div>
      <div>
        <dt>Gates</dt>
        <dd>${selectedQuarter.gates.join(", ")}</dd>
      </div>
      <div>
        <dt>AI Core version</dt>
        <dd>${selectedQuarter.aiCoreVersionTarget} · ${selectedQuarter.aiCoreVersionTheme}</dd>
      </div>
      <div>
        <dt>Promotion decision</dt>
        <dd>${selectedQuarter.promotionDryRunDecision}; release allowed: ${selectedQuarter.promotionReleaseAllowed}</dd>
      </div>
      <div>
        <dt>Promotion next action</dt>
        <dd>${selectedQuarter.promotionNextSafeAction}</dd>
      </div>
      <div>
        <dt>Forbidden autonomy</dt>
        <dd>${SUB_AGENT_DEMO_PLAN.forbiddenAutonomy.join(", ")}</dd>
      </div>
      <div>
        <dt>Source</dt>
        <dd>${SUB_AGENT_DEMO_PLAN.source}</dd>
      </div>
      <div>
        <dt>Generated plan view</dt>
        <dd>${SUB_AGENT_DEMO_PLAN.planView} · ${SUB_AGENT_DEMO_PLAN.planViewStatus}</dd>
      </div>
      <div>
        <dt>Run state</dt>
        <dd>${completed.has(selectedQuarter.id) ? "Recorded in local ledger" : "Not yet recorded"}</dd>
      </div>
    </dl>
  `;

  if (subAgentPlanBadge) {
    subAgentPlanBadge.textContent = `${SUB_AGENT_DEMO_PLAN.years.length} years / ${quarters.length} quarters / ${SUB_AGENT_DEMO_PLAN.lanes.length} lanes`;
  }

  subAgentQuarterList.querySelectorAll("[data-sub-agent-quarter]").forEach((button) => {
    button.addEventListener("click", () => {
      selectSubAgentQuarter(Number(button.dataset.subAgentQuarter));
    });
  });

  queueMicrotask(() => {
    emitEvent("seis_demo_sub_agent_plan_viewed", {
      panel: "sub_agent_5_year_plan",
      selected_quarter: selectedQuarter.id,
      selected_version_target: selectedQuarter.aiCoreVersionTarget,
      lane_count: SUB_AGENT_DEMO_PLAN.lanes.length,
      quarter_count: quarters.length,
      version_target_count: currentSubAgentVersionTargets().length,
      demo_boundary: SUB_AGENT_DEMO_PLAN.demoBoundary
    });
  });

  renderSubAgentVersionMap(selectedQuarter);
  renderSubAgentRouteMesh(selectedQuarter);
  renderSubAgentPluginMesh(selectedQuarter);
  renderSubAgentMcpRuntimeMesh(selectedQuarter);
  renderSubAgentConstellationInspector(selectedQuarter);
  renderSubAgentRunLedger();
}

function selectSubAgentQuarter(index, options = {}) {
  const quarters = ensureSubAgentQuarters();
  const nextIndex = Math.max(0, Math.min(index, quarters.length - 1));
  state.selectedSubAgentQuarterIndex = nextIndex;
  localStorage.setItem(subAgentQuarterStorageKey, String(nextIndex));
  const quarter = quarters[nextIndex];
  renderSubAgentPlan();
  updateHero3dStatus();
  setMetricsFromContract();
  if (options.emit !== false) {
    emitEvent("seis_demo_sub_agent_quarter_selected", {
      quarter_id: quarter.id,
      year: quarter.year,
      ai_core_version_target: quarter.aiCoreVersionTarget,
      promotion_dry_run_decision: quarter.promotionDryRunDecision,
      lanes: quarter.lanes,
      gates: quarter.gates,
      demo_boundary: SUB_AGENT_DEMO_PLAN.demoBoundary
    });
  }
}

function runSubAgentDemoPulse() {
  const quarters = ensureSubAgentQuarters();
  const currentQuarter = quarters[state.selectedSubAgentQuarterIndex] || quarters[0];
  const pulse = recordSubAgentDemoPulse(currentQuarter);
  renderSubAgentRunLedger();
  emitEvent("seis_demo_sub_agent_pulse_recorded", {
    pulse_id: pulse.id,
    quarter_id: pulse.quarterId,
    ai_core_version_target: pulse.aiCoreVersionTarget,
    promotion_dry_run_decision: pulse.promotionDryRunDecision,
    lanes: pulse.lanes,
    gates: pulse.gates,
    boundary: pulse.boundary
  });

  const nextIndex = (state.selectedSubAgentQuarterIndex + 1) % quarters.length;
  emitEvent("seis_demo_cta_click", {
    cta_id: "sub_agent_demo_pulse",
    from_quarter: currentQuarter.id,
    to_quarter: quarters[nextIndex]?.id
  });
  selectSubAgentQuarter(nextIndex);
  showButtonTempLabel(subAgentRunDemoButton, `Recorded ${currentQuarter.id}`, 1100);
}

function runSubAgentFullDemo() {
  const quarters = ensureSubAgentQuarters();
  for (const quarter of quarters) {
    recordSubAgentDemoPulse(quarter);
  }
  renderSubAgentPlan();
  setMetricsFromContract();
  emitEvent("seis_demo_sub_agent_full_run_recorded", {
    quarter_count: quarters.length,
    lane_count: SUB_AGENT_DEMO_PLAN.lanes.length,
    boundary: SUB_AGENT_DEMO_PLAN.demoBoundary,
    status: "local-demo-recorded"
  });
  emitEvent("seis_demo_cta_click", {
    cta_id: "sub_agent_full_dry_run",
    quarter_count: quarters.length
  });
  showButtonTempLabel(subAgentRunFullDemoButton, "20 quarters recorded", 1300);
}

function createSubAgentEvidenceReport() {
  const quarters = ensureSubAgentQuarters();
  const recordedQuarterCount = completedSubAgentQuarters().size;
  const completionPercent = Math.round((recordedQuarterCount / quarters.length) * 100);
  const versionTargets = currentSubAgentVersionTargets();
  const mcpRuntime = currentMcpRuntimeContract();
  const constellationInspector = buildSubAgentConstellationInspectorModel(quarters[state.selectedSubAgentQuarterIndex] || quarters[0]);
  return {
    id: "seis-sub-agent-five-year-demo-evidence",
    version: 1,
    generatedAt: new Date().toISOString(),
    status: "local-demo-evidence",
    source: SUB_AGENT_DEMO_PLAN.source,
    subAgentPlanView: SUB_AGENT_DEMO_PLAN.planView,
    planViewStatus: SUB_AGENT_DEMO_PLAN.planViewStatus,
    planViewGeneratedBy: SUB_AGENT_DEMO_PLAN.planViewGeneratedBy,
    seisAiCoreProviderRegistry: SUB_AGENT_DEMO_PLAN.aiCoreProviderRegistry,
    seisAiCoreVersionRegistry: SUB_AGENT_DEMO_PLAN.aiCoreVersionRegistry,
    seisAiCoreVersionPromotionGates: SUB_AGENT_DEMO_PLAN.aiCoreVersionPromotionGates,
    seisAiCoreVersionPromotionMap: SUB_AGENT_DEMO_PLAN.aiCoreVersionPromotionMap,
    seisAgentPluginIntegration: SUB_AGENT_DEMO_PLAN.seisAgentPluginIntegration,
    promotionMapStatus: subAgentVersionPromotionMap.status,
    promotionMapGeneratedBy: subAgentVersionPromotionMap.generatedBy,
    demoBoundary: SUB_AGENT_DEMO_PLAN.demoBoundary,
    quarterCount: quarters.length,
    recordedQuarterCount,
    completionPercent,
    laneCount: SUB_AGENT_DEMO_PLAN.lanes.length,
    versionTargetCount: versionTargets.length,
    promotionGateCount: subAgentVersionPromotionMap.promotionGateCount || versionTargets.length,
    installedAiCoreRouteCount: SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes.length,
    installedAiCoreRoutes: SUB_AGENT_DEMO_PLAN.installedAiCoreRoutes,
    personalPluginLaneCount: SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix.length,
    personalPluginLaneMatrix: SUB_AGENT_DEMO_PLAN.personalPluginLaneMatrix,
    mcpRuntimeContract: mcpRuntime,
    mcpRuntimeSurfaceCount: mcpRuntime.surfaces.length,
    mcpRuntimeToolCount: mcpRuntime.toolCount,
    mcpRuntimeResourceCount: mcpRuntime.resourceCount,
    mcpRuntimePromptCount: mcpRuntime.promptCount,
    mcpRuntimeStatus: mcpRuntime.status,
    mcpRuntimeTransport: mcpRuntime.transport,
    constellationInspector,
    constellationInspectorStatus: constellationInspector.status,
    constellationInspectorRouteCount: constellationInspector.routeCount,
    constellationInspectorPluginLaneCount: constellationInspector.pluginLaneCount,
    constellationInspectorMcpToolCount: constellationInspector.mcpRuntimeToolCount,
    constellationInspectorMcpResourceCount: constellationInspector.mcpRuntimeResourceCount,
    constellationInspectorHeroNodeCount: constellationInspector.heroNodeCount,
    dryRunOnly: true,
    releasePromotionAllowed: subAgentVersionPromotionMap.releasePromotionAllowed === true,
    forbiddenAutonomy: SUB_AGENT_DEMO_PLAN.forbiddenAutonomy,
    validation: {
      staticCheck: "npm run check:seis-sub-agent-5-year-plan",
      providerRegistry: "npm run check:seis-ai-core-provider-registry",
      versionRegistry: "npm run check:seis-ai-core-version-registry",
      promotionGates: "npm run check:seis-ai-core-version-promotion-gates",
      browserSmoke: "npm run check:product-experience-browser-smoke"
    },
    versionTargets,
    lanes: SUB_AGENT_DEMO_PLAN.lanes,
    records: state.subAgentRunLedger
  };
}

function downloadJsonArtifact(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportSubAgentEvidenceReport() {
  const recordedQuarterCount = completedSubAgentQuarters().size;
  if (!recordedQuarterCount) {
    if (subAgentExportStatus) {
      subAgentExportStatus.textContent = "Run a demo pulse or dry-run 5 years before exporting evidence.";
    }
    showButtonTempLabel(subAgentExportEvidenceButton, "Run first", 1100);
    return;
  }

  const report = createSubAgentEvidenceReport();
  localStorage.setItem(subAgentEvidenceStorageKey, JSON.stringify(report));
  renderSubAgentEvidenceStatus();
  downloadJsonArtifact("seis-sub-agent-five-year-demo-evidence.json", report);
  emitEvent("seis_demo_sub_agent_evidence_exported", {
    report_id: report.id,
    recorded_quarter_count: report.recordedQuarterCount,
    quarter_count: report.quarterCount,
    version_target_count: report.versionTargetCount,
    release_promotion_allowed: report.releasePromotionAllowed,
    completion_percent: report.completionPercent,
    boundary: report.demoBoundary
  });
  emitEvent("seis_demo_cta_click", {
    cta_id: "sub_agent_export_evidence",
    recorded_quarter_count: report.recordedQuarterCount
  });
  showButtonTempLabel(subAgentExportEvidenceButton, "Exported", 1200);
}

function resetSubAgentDemoLedger() {
  state.subAgentRunLedger = [];
  saveSubAgentRunLedger();
  localStorage.removeItem(subAgentEvidenceStorageKey);
  emitEvent("seis_demo_sub_agent_ledger_reset", {
    boundary: SUB_AGENT_DEMO_PLAN.demoBoundary,
    quarter_count: ensureSubAgentQuarters().length
  });
  renderSubAgentPlan();
  setMetricsFromContract();
  showButtonTempLabel(subAgentResetDemoButton, "Reset");
}

function setMetricsFromContract() {
  if (!metricsContainer) return;
  metricsContainer.replaceChildren();
  const contractRoutes = Array.isArray(state.contract.routes) ? state.contract.routes : FALLBACK_CONTRACT.routes;
  const analyticsEvents = Array.isArray(state.contract.analytics_events) ? state.contract.analytics_events : FALLBACK_CONTRACT.analytics_events;
  const platformTargets = Array.isArray(state.contract.platform_targets) ? state.contract.platform_targets : FALLBACK_CONTRACT.platform_targets;
  const routes = document.createElement("li");
  routes.textContent = `Route map: ${contractRoutes.map((route) => route.path).join(", ")}`;
  const events = document.createElement("li");
  events.textContent = `Analytics events: ${analyticsEvents.length}`;
  const targets = document.createElement("li");
  targets.textContent = `Targets: ${platformTargets.join(" / ") || "web only"}`;
  const focusMode = document.createElement("li");
  focusMode.textContent = `Focus Mode: ${state.isFocusMode ? "enabled" : "available"}`;
  const godMode = document.createElement("li");
  godMode.textContent = `God Mode Developer: ${state.isGodMode ? "active" : "available"}`;
  const subAgentPlan = document.createElement("li");
  const selectedQuarter = ensureSubAgentQuarters()[state.selectedSubAgentQuarterIndex] || ensureSubAgentQuarters()[0] || { id: "Y1-Q1" };
  const recordedQuarters = completedSubAgentQuarters().size;
  subAgentPlan.textContent = `Sub-agent demo: ${SUB_AGENT_DEMO_PLAN.years.length} years, ${ensureSubAgentQuarters().length} quarters, selected ${selectedQuarter.id}, recorded ${recordedQuarters}, boundary ${SUB_AGENT_DEMO_PLAN.demoBoundary}`;
  const pluginFabric = document.createElement("li");
  pluginFabric.textContent = "Plugin fabric: seis@personal + cloud/code/design/data embedded in SEIS-Agent; AI Core tools expose seis_ai_core_provider_status, seis_ai_core_model_scaling_status, seis_ai_core_version_status, seis_ai_core_version_promotion_dry_run, model, dry-run, and review ledger evidence";
  metricsContainer.append(routes, events, targets, focusMode, godMode, subAgentPlan, pluginFabric);
}

function renderScenarioCards() {
  const scenarios = Array.isArray(state.contract.scenarios) ? state.contract.scenarios : FALLBACK_CONTRACT.scenarios;
  const cards = scenarios.map((scenario) => {
    const card = document.createElement("article");
    card.className = "scenario-card";

    const title = document.createElement("h3");
    title.className = "scenario-title";
    title.textContent = scenario.title;

    const description = document.createElement("p");
    description.className = "scenario-description";
    description.textContent = scenario.summary;

    const meta = document.createElement("p");
    meta.className = "scenario-meta";
    meta.textContent = `Specialist: ${scenario.specialist}`;

    const runArea = document.createElement("div");
    runArea.className = "scenario-run";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Run scenario";
    button.dataset.ctaId = `run_${scenario.id}`;
    button.addEventListener("click", () => {
      emitEvent("seis_demo_cta_click", { cta_id: button.dataset.ctaId, scenario_id: scenario.id });
      startRun(scenario.id);
    });

    runArea.append(button);
    card.append(title, description, meta, runArea);
    return card;
  });

  const grid = document.createElement("div");
  grid.className = "scenario-grid";
  cards.forEach((card) => grid.appendChild(card));
  return grid;
}

function renderHome() {
  const wrapper = document.createElement("div");
  const title = document.createElement("h2");
  title.className = "route-title";
  title.textContent = "SEIS Demo Home";
  const sub = document.createElement("p");
  sub.className = "route-sub";
  sub.textContent = "Launch a scenario from Demo, or open a result route directly with /results/:runId.";
  wrapper.append(title, sub);
  return wrapper;
}

function renderDemoPage() {
  const wrapper = document.createElement("div");
  const header = document.createElement("h2");
  header.className = "route-title";
  header.textContent = "Demo Scenarios";
  const sub = document.createElement("p");
  sub.className = "route-sub";
  sub.textContent = "Select scenario to run shared events and specialist logs.";
  wrapper.append(header, sub, renderScenarioCards());
  return wrapper;
}

function renderResultsPage(runId) {
  const run = state.runs[runId];
  const wrapper = document.createElement("section");
  const title = document.createElement("h2");
  title.className = "route-title";
  title.textContent = runId ? `Results • ${runId}` : "Results";

  if (!run) {
    const info = document.createElement("p");
    info.textContent = runId ? "No run found for this ID. Start a scenario from Demo to generate a result." : "No run loaded yet.";
    const action = document.createElement("button");
    action.type = "button";
    action.className = "button";
    action.textContent = "Go to Demo";
    action.addEventListener("click", () => {
      openRoute("/demo");
      emitEvent("seis_demo_cta_click", { cta_id: "go_demo_no_run", route: "/demo" });
    });
    wrapper.append(title, info, action);
    return wrapper;
  }

  const summary = document.createElement("div");
  summary.className = "result-card";
  const scenario = scenarioById(run.scenarioId);
  summary.innerHTML = `<p><strong>Scenario:</strong> ${scenario?.title || run.scenarioId}</p>
    <p><strong>Status:</strong> ${run.status}</p>
    <p><strong>Latency:</strong> ${run.durationMs}ms</p>`;
  const resultMeta = document.createElement("ul");
  resultMeta.className = "results-summary";
  run.steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = `${step.name} (${step.state})`;
    resultMeta.appendChild(item);
  });

  const actions = document.createElement("div");
  actions.className = "result-actions";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.textContent = "Copy result JSON";
  copy.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(JSON.stringify(run, null, 2));
  });
  actions.append(copy);

  wrapper.append(title, summary, resultMeta, actions);
  return wrapper;
}

function startRun(scenarioId) {
  const runId = generateId("run");
  state.activeRunId = runId;
  state.runs[runId] = {
    runId,
    scenarioId,
    status: "running",
    startedAt: new Date().toISOString(),
    steps: [],
    durationMs: 0
  };

  emitEvent("seis_demo_started", { scenario_id: scenarioId });
  emitEvent("seis_demo_specialist_used", { specialist: scenarioById(scenarioId)?.specialist || "unknown", scenario_id: scenarioId });

  const scenario = scenarioById(scenarioId);
  const steps = (scenario?.steps || ["Initialize", "Execute", "Finalize"]);
  const start = performance.now();
  let completed = 0;

  const advance = () => {
    const run = state.runs[runId];
    if (!run) return;
    const name = steps[completed];
    if (!name) {
      run.status = "completed";
      run.durationMs = Math.round(performance.now() - start);
      emitEvent("seis_demo_step", {
        scenario_id: scenarioId,
        step: "complete",
        duration_ms: run.durationMs,
        run_id: runId
      });
      openRoute(`/results/${runId}`);
      return;
    }

    run.steps.push({ name, state: "success", at: new Date().toISOString() });
    emitEvent("seis_demo_step", { scenario_id: scenarioId, step: name, run_id: runId });
    completed += 1;

    if (state.route.startsWith("/results/")) {
      renderRoute();
    } else {
      openRoute(`/results/${runId}`);
    }
    window.setTimeout(advance, 700 + Math.random() * 250);
  };

  openRoute(`/results/${runId}`);
  window.setTimeout(advance, 650);
}

function routeDefinition(route) {
  if (route === "/") return "home";
  if (route === "/demo") return "demo";
  if (route.startsWith("/demo/")) return "scenario";
  if (route.startsWith("/results/")) return "results";
  return "home";
}

function renderRoute() {
  const route = resolveRouteFromLocation();
  writeRoute(route);
  if (!content) return;
  content.replaceChildren();
  let section;
  let targetRun = null;

  switch (routeDefinition(route)) {
    case "demo":
      section = renderDemoPage();
      break;
    case "results": {
      targetRun = route.split("/").pop();
      section = renderResultsPage(targetRun);
      break;
    }
    case "scenario": {
      const scenarioId = route.split("/").pop();
      const scenario = scenarioById(scenarioId);
      const heading = document.createElement("h2");
      heading.className = "route-title";
      heading.textContent = scenario ? scenario.title : `Scenario: ${scenarioId}`;
      const description = document.createElement("p");
      description.className = "route-sub";
      description.textContent = scenario ? scenario.summary : "Scenario details are unavailable.";
      const run = document.createElement("button");
      run.type = "button";
      run.textContent = "Run scenario";
      run.className = "button";
      run.addEventListener("click", () => startRun(scenarioId));
      section = document.createElement("section");
      section.append(heading, description, run);
      break;
    }
    default:
      section = renderHome();
  }

  content.appendChild(section);
}

function attachInteraction() {
  document.body.addEventListener("click", (event) => {
    const routeTarget = event.target.closest("[data-route]");
    if (!routeTarget) return;
    event.preventDefault();
    const nextRoute = routeTarget.dataset.route;
    emitEvent("seis_demo_cta_click", { cta_id: routeTarget.dataset.ctaId || `nav_${nextRoute}` });
    openRoute(nextRoute);
  });

  if (copyEventsButton) {
    copyEventsButton.addEventListener("click", async () => {
      await navigator.clipboard?.writeText(JSON.stringify(state.events, null, 2));
      copyEventsButton.textContent = "Copied";
      window.setTimeout(() => {
        copyEventsButton.textContent = "Copy JSON";
      }, 1200);
    });
  }

  if (reloadButton) {
    reloadButton.addEventListener("click", () => {
      emitEvent("seis_demo_cta_click", { cta_id: "app_reload" });
      renderRoute();
    });
  }

  if (downloadNativeButton) {
    downloadNativeButton.addEventListener("click", () => {
      emitEvent("seis_demo_cta_click", { cta_id: "open_release_download" });
      openExternalURL(RELEASE_LINK);
    });
  }

  if (copyNativeLinkButton) {
    copyNativeLinkButton.addEventListener("click", async () => {
      emitEvent("seis_demo_cta_click", { cta_id: "copy_deep_link", deep_link: SEIS_DEMO_DEEPLINK });
      const copied = await setClipboardText(SEIS_DEMO_DEEPLINK);
      if (copied) {
        showButtonTempLabel(copyNativeLinkButton, "Copied");
      }
    });
  }

  if (focusModeToggleButton) {
    focusModeToggleButton.addEventListener("click", () => {
      setFocusMode(!state.isFocusMode);
    });
  }

  if (subAgentPrevButton) {
    subAgentPrevButton.addEventListener("click", () => {
      emitEvent("seis_demo_cta_click", { cta_id: "sub_agent_previous_quarter" });
      selectSubAgentQuarter(state.selectedSubAgentQuarterIndex - 1);
    });
  }

  if (subAgentNextButton) {
    subAgentNextButton.addEventListener("click", () => {
      emitEvent("seis_demo_cta_click", { cta_id: "sub_agent_next_quarter" });
      selectSubAgentQuarter(state.selectedSubAgentQuarterIndex + 1);
    });
  }

  if (subAgentRunDemoButton) {
    subAgentRunDemoButton.addEventListener("click", runSubAgentDemoPulse);
  }

  if (subAgentRunFullDemoButton) {
    subAgentRunFullDemoButton.addEventListener("click", runSubAgentFullDemo);
  }

  if (subAgentExportEvidenceButton) {
    subAgentExportEvidenceButton.addEventListener("click", exportSubAgentEvidenceReport);
  }

  if (subAgentResetDemoButton) {
    subAgentResetDemoButton.addEventListener("click", resetSubAgentDemoLedger);
  }

  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("popstate", renderRoute);
}

async function loadContract() {
  try {
    state.contract = await fetchJsonNoStore(contractUrl.href);
  } catch (_error) {
    state.contract = FALLBACK_CONTRACT;
  }

  setMetricsFromContract();
  emitEvent("seis_demo_cta_click", { cta_id: "contract_loaded", contract_version: state.contract.contract_version });
}

async function init() {
  await loadContract();
  await loadSubAgentPlanView();
  await loadSubAgentVersionPromotionMap();
  initHero3dMap();
  window.__SEIS_DEMO__ = {
    hero3dDiagnostics: () => ({ ...hero3dLastDiagnostics }),
    constellationInspector: () => buildSubAgentConstellationInspectorModel(
      subAgentQuarters[state.selectedSubAgentQuarterIndex] || subAgentQuarters[0]
    ),
    selectedSubAgentQuarter: () => subAgentQuarters[state.selectedSubAgentQuarterIndex]?.id || "unknown",
    subAgentRunLedgerLength: () => state.subAgentRunLedger.length
  };
  attachInteraction();
  writeRoute(state.route);
  setMetricsFromContract();
  updateFocusModeUI();
  renderRoute();
  renderSubAgentPlan();
  renderEventLog();
  emitEvent("seis_demo_started", { event_name: "web_init", route: state.route, source: "init" });
}

init();
