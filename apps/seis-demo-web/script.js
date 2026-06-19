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
  isGodMode: loadGodMode()
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
  const defined = state.contract.analytics_events.find((item) => item.name === eventName);
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

function scenarioById(id) {
  return state.contract.scenarios.find((item) => item.id === id);
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

function setMetricsFromContract() {
  if (!metricsContainer) return;
  metricsContainer.replaceChildren();
  const routes = document.createElement("li");
  routes.textContent = `Route map: ${state.contract.routes.map((route) => route.path).join(", ")}`;
  const events = document.createElement("li");
  events.textContent = `Analytics events: ${state.contract.analytics_events.length}`;
  const targets = document.createElement("li");
  targets.textContent = `Targets: ${(state.contract.platform_targets || []).join(" / ") || "web only"}`;
  const focusMode = document.createElement("li");
  focusMode.textContent = `Focus Mode: ${state.isFocusMode ? "enabled" : "available"}`;
  const godMode = document.createElement("li");
  godMode.textContent = `God Mode Developer: ${state.isGodMode ? "active" : "available"}`;
  const pluginFabric = document.createElement("li");
  pluginFabric.textContent = "Plugin fabric: seis@personal + cloud/code/design/data embedded in SEIS-Agent";
  metricsContainer.append(routes, events, targets, focusMode, godMode, pluginFabric);
}

function renderScenarioCards() {
  const cards = state.contract.scenarios.map((scenario) => {
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

  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("popstate", renderRoute);
}

async function loadContract() {
  try {
    const response = await fetch(contractUrl.href, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Contract HTTP ${response.status}`);
    }
    state.contract = await response.json();
  } catch (_error) {
    state.contract = FALLBACK_CONTRACT;
  }

  setMetricsFromContract();
  emitEvent("seis_demo_cta_click", { cta_id: "contract_loaded", contract_version: state.contract.contract_version });
}

async function init() {
  await loadContract();
  attachInteraction();
  writeRoute(state.route);
  setMetricsFromContract();
  updateFocusModeUI();
  renderRoute();
  renderEventLog();
  emitEvent("seis_demo_started", { event_name: "web_init", route: state.route, source: "init" });
}

init();
