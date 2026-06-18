const contractUrl = new URL("contracts/seis-demo-contract.json", window.location.href);
const storageKey = "seis-demo-events-v1";
const focusStorageKey = "seis-demo-focus-mode-v1";
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
  isFocusMode: loadFocusMode()
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

function renderEventLog() {
  if (!eventLog) return;
  const visibleEventCount = state.isFocusMode ? 8 : 20;
  eventLog.textContent = JSON.stringify(state.events.slice(0, visibleEventCount), null, 2);
}

function renderFocusModeSignals() {
  if (!focusModeSignals) return;
  focusModeSignals.replaceChildren();
  const signals = [
    `Mode: ${state.isFocusMode ? "focused" : "standard"}`,
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

function scenarioById(id) {
  return state.contract.scenarios.find((item) => item.id === id);
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
  metricsContainer.append(routes, events, targets, focusMode);
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
