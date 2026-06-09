const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const fallbackCapabilities = [
  {
    id: "frontend-design-and-browser-quality",
    label: "Frontend design and browser quality",
    surfaceId: "frontend-design-skills",
    ownerAgent: "interface-agent",
    activationMode: "active",
    risk: "medium",
    pluginExamples: ["frontend-design", "Build Web Apps", "Browser", "playwright"]
  },
  {
    id: "motion-three-dimensional-and-video",
    label: "Motion, 3D, cinematic web, and video",
    surfaceId: "motion-3d-skills",
    ownerAgent: "motion-agent",
    activationMode: "guarded",
    risk: "medium",
    pluginExamples: ["Game Studio", "Remotion", "Three.js-ready canvas"]
  },
  {
    id: "cloud-hosting-and-deployment",
    label: "Cloud hosting and deployment",
    surfaceId: "cloud-deployment-connectors",
    ownerAgent: "release-agent",
    activationMode: "blocked-until-target",
    risk: "high",
    pluginExamples: ["Vercel", "Cloudflare", "Netlify", "Render"]
  }
];

const fallbackMarketplace = {
  summary: "Track trusted GitHub, MCP, Copilot, and model marketplace channels before live activation.",
  marketplaceChannels: [
    {
      id: "github-mcp-registry",
      label: "GitHub MCP Registry",
      status: "preferred-seis-channel",
      bestFor: ["AI tool integrations", "official service connectors"],
      gate: "Use only the smallest task-matched MCP server after target and permissions are known."
    },
    {
      id: "github-marketplace-actions",
      label: "GitHub Marketplace Actions",
      status: "publishable-after-action-repo",
      bestFor: ["repeatable repository automation", "release helpers"],
      gate: "Requires a public single-action repository and a release."
    },
    {
      id: "github-app-copilot-extensions",
      label: "GitHub App-based Copilot Extensions",
      status: "do-not-build-new",
      bestFor: ["legacy review only"],
      gate: "Route new SEIS work through MCP instead."
    }
  ],
  trustedSourceShortlist: [
    {
      id: "figma-mcp-server",
      publisher: "figma",
      family: "design-media-creative",
      designerValue: "Bring Figma design context into implementation without losing design-system intent.",
      activationPosture: "candidate-after-figma-target"
    },
    {
      id: "github-mcp-server",
      publisher: "github",
      family: "repo-devops-quality-security",
      designerValue: "Connect repo issues, pull requests, and workflow status to natural-language governance.",
      activationPosture: "candidate-after-repo-scope"
    },
    {
      id: "github-models-openai",
      publisher: "OpenAI",
      family: "data-db-ai-infra",
      designerValue: "Reference provider for future AI-assisted marketplace descriptions and content QA.",
      activationPosture: "model-selection-only"
    }
  ]
};

const state = {
  mode: "cinematic",
  gaps: [],
  capabilities: fallbackCapabilities,
  marketplace: fallbackMarketplace,
  commands: [],
  qualitySignals: [],
  thresholds: [],
  publishGate: null,
  evolutionModel: null,
  aggressiveMap: null,
  executionPlan: null,
  localCycle: null,
  safetyFirewall: null,
  filter: "all"
};

function el(selector) {
  return document.querySelector(selector);
}

function create(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function getDefaultMode() {
  if (motionPreference.matches) return "reduced";
  return window.innerWidth < 900 ? "balanced" : "cinematic";
}

function applyMode(mode) {
  state.mode = motionPreference.matches ? "reduced" : mode;
  document.documentElement.dataset.motionMode = state.mode;

  const button = el("#motion-mode");
  const modeLabel = el("#mode-label");
  const modeDetail = el("#mode-detail");

  if (button) {
    const cinematic = state.mode === "cinematic";
    button.textContent = state.mode === "reduced" ? "Reduced" : cinematic ? "Cinematic" : "Balanced";
    button.setAttribute("aria-pressed", cinematic ? "true" : "false");
  }

  if (modeLabel) modeLabel.textContent = state.mode[0].toUpperCase() + state.mode.slice(1);
  if (modeDetail) {
    modeDetail.textContent =
      state.mode === "cinematic"
        ? "Layered canvas field, parallax, hover depth, and reduced-motion fallback."
        : state.mode === "balanced"
          ? "Calm transitions with lighter motion weight."
          : "Motion minimized for accessibility preference.";
  }
}

function setupLoader() {
  const delay = motionPreference.matches ? 0 : 520;
  window.setTimeout(() => document.body.classList.add("is-loaded"), delay);
}

function setupParallax() {
  if (motionPreference.matches) return;

  let ticking = false;
  const update = () => {
    const shift = Math.min(window.scrollY * 0.065, 38);
    document.documentElement.style.setProperty("--hero-shift", `${-shift}px`);
    document.documentElement.style.setProperty("--panel-shift", `${shift * 0.18}px`);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );
}

function setupReveals() {
  const sections = Array.from(document.querySelectorAll(".section-reveal"));
  if (motionPreference.matches || !("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupDepthCards() {
  if (!finePointer.matches) return;

  document.querySelectorAll("[data-depth-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (state.mode !== "cinematic") return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupTouchFeedback() {
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.pointerType || event.pointerType === "mouse") return;
      const target = event.target.closest("a, button, [data-depth-card]");
      if (!target) return;
      target.classList.add("touch-active");
      window.setTimeout(() => target.classList.remove("touch-active"), 140);
    },
    { passive: true }
  );
}

function setupModeToggle() {
  const button = el("#motion-mode");
  if (!button) return;

  button.addEventListener("click", () => {
    const next = state.mode === "cinematic" ? "balanced" : "cinematic";
    applyMode(next);
  });

  motionPreference.addEventListener("change", () => {
    applyMode(state.mode);
    if (motionPreference.matches) {
      document.querySelectorAll(".section-reveal").forEach((section) => section.classList.add("is-visible"));
    }
  });
}

function setupAnchorTransitions() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: state.mode === "reduced" ? "auto" : "smooth", block: "start" });
    focusSectionTarget(target);
    window.history.replaceState(null, "", hash);
  });
}

function focusSectionTarget(target) {
  const focusableSelector =
    'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
  const focusTarget = target.matches(focusableSelector) ? target : target.querySelector(focusableSelector);

  if (focusTarget) {
    focusTarget.focus({ preventScroll: true });
    return;
  }

  const restoreTabIndex = !target.hasAttribute("tabindex");
  if (restoreTabIndex) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  if (restoreTabIndex) {
    target.addEventListener(
      "blur",
      () => {
        target.removeAttribute("tabindex");
      },
      { once: true }
    );
  }
}

function setActiveNav(hash) {
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  navLinks.forEach((link) => {
    const isActive = hash && link.getAttribute("href") === hash;
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setupActiveSectionNav() {
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => {
      const hash = link.getAttribute("href");
      if (!hash) return null;
      return document.querySelector(hash);
    })
    .filter(Boolean);

  const syncFromHash = () => {
    const hash = window.location.hash;
    setActiveNav(hash && navLinks.some((link) => link.getAttribute("href") === hash) ? hash : "");
  };

  if (!("IntersectionObserver" in window) || !sections.length) {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return;
  }

  const visibleSections = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const sectionId = `#${entry.target.id}`;
        if (entry.isIntersecting) {
          visibleSections.set(sectionId, entry.intersectionRatio);
        } else {
          visibleSections.delete(sectionId);
        }
      });

      if (!visibleSections.size) {
        syncFromHash();
        return;
      }

      const [activeHash] = Array.from(visibleSections.entries()).sort((left, right) => right[1] - left[1])[0];
      setActiveNav(activeHash);
    },
    { threshold: [0.2, 0.45, 0.7], rootMargin: "-18% 0px -55% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
  window.addEventListener("hashchange", syncFromHash);
  syncFromHash();
}

function setupCapabilityFilters() {
  document.querySelectorAll("[data-capability-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.capabilityFilter || "all";
      document
        .querySelectorAll("[data-capability-filter]")
        .forEach((item) => item.classList.toggle("is-active", item === button));
      renderCapabilities();
    });
  });
}

function renderGapBoard() {
  const board = el("#gap-board");
  if (!board) return;
  board.replaceChildren();

  state.gaps.forEach((gap) => {
    const card = create("article", `gap-card status-${gap.status}`);
    const chips = create("div", "chip-row");
    chips.append(
      create("span", "chip", gap.status),
      create("span", "chip", gap.priority),
      create("span", "chip", gap.surface)
    );

    const title = create("h3", "", gap.label);
    const impact = create("p", "", gap.impact);
    const action = create("p", "", `Next: ${gap.nextAction}`);
    card.append(chips, title, impact, action);
    board.append(card);
  });
}

function renderCapabilities() {
  const board = el("#capability-board");
  if (!board) return;
  board.replaceChildren();

  const visible = state.capabilities.filter((capability) => {
    if (state.filter === "all") return true;
    if (state.filter === "blocked") return capability.activationMode.includes("blocked");
    if (state.filter === "guarded") return capability.activationMode.includes("guarded");
    return capability.activationMode === state.filter;
  });

  visible.forEach((capability) => {
    const card = create("article", "capability-card");
    card.dataset.mode = capability.activationMode;
    card.dataset.risk = capability.risk;

    const chips = create("div", "chip-row");
    chips.append(
      create("span", "chip", capability.activationMode),
      create("span", "chip", capability.risk),
      create("span", "chip", capability.ownerAgent)
    );

    const title = create("h3", "", capability.label);
    const surface = create("p", "", `Surface: ${capability.surfaceId}`);
    const examples = create("p", "", `Tools: ${(capability.pluginExamples || []).slice(0, 4).join(", ")}`);
    card.append(chips, title, surface, examples);
    board.append(card);
  });
}

function renderMarketplace() {
  const status = el("[data-marketplace-status]");
  const channelsBoard = el("[data-marketplace-channels]");
  const sourcesBoard = el("[data-marketplace-sources]");
  if (!channelsBoard || !sourcesBoard) return;

  const marketplace = state.marketplace || fallbackMarketplace;
  const channels = marketplace.marketplaceChannels || fallbackMarketplace.marketplaceChannels;
  const sources = marketplace.trustedSourceShortlist || fallbackMarketplace.trustedSourceShortlist;
  const preferred = channels.find((channel) => channel.status === "preferred-seis-channel");

  if (status) {
    status.textContent = `${channels.length} channels - ${sources.length} trusted sources - preferred: ${preferred?.label || "MCP Registry"}`;
  }

  channelsBoard.replaceChildren();
  channels.forEach((channel) => {
    const card = create("article", `system-card ${getMarketplaceStatusClass(channel.status)}`);
    const bestFor = (channel.bestFor || []).slice(0, 2).join(", ");
    card.append(
      create("span", "", channel.status),
      create("strong", "", getMarketplaceShortLabel(channel.id)),
      create("h3", "", channel.label),
      create("p", "", bestFor ? `Best for: ${bestFor}` : channel.gate || "Review before activation."),
      create("p", "", channel.gate || "Activation remains gated.")
    );
    channelsBoard.append(card);
  });

  sourcesBoard.replaceChildren();
  sources.slice(0, 6).forEach((source) => {
    const card = create("article", `marketplace-source-card ${getMarketplaceStatusClass(source.activationPosture)}`);
    card.append(
      create("span", "", source.publisher),
      create("h3", "", source.id.replaceAll("-", " ")),
      create("p", "", source.designerValue),
      create("p", "", `Family: ${source.family} - ${source.activationPosture}`)
    );
    sourcesBoard.append(card);
  });
}

function getMarketplaceShortLabel(id) {
  if (id.includes("mcp")) return "MCP";
  if (id.includes("actions")) return "Action";
  if (id.includes("apps")) return "App";
  if (id.includes("models")) return "Model";
  if (id.includes("copilot")) return "Copilot";
  return "Source";
}

function getMarketplaceStatusClass(status) {
  if (String(status).includes("preferred") || String(status).includes("candidate")) return "status-ready";
  if (String(status).includes("blocked") || String(status).includes("do-not")) return "status-blocked";
  return "status-watch";
}

function renderPublishGate() {
  const panel = el("[data-publish-gate-panel]");
  const summary = el("[data-publish-gate-summary]");
  const levelsBoard = el("[data-publish-gate-levels]");
  if (!panel || !levelsBoard) return;

  const gate = state.publishGate;
  if (!gate) {
    panel.classList.add("status-watch");
    levelsBoard.replaceChildren(create("p", "", "Publish gate contract is unavailable; keep publication blocked."));
    return;
  }

  const remote = gate.remote || {};
  const environment = gate.currentEnvironmentPolicy || {};
  if (summary) {
    summary.textContent = `${remote.name || "origin"} targets ${remote.targetBranch || "UIXAppTTR"}; current policy: ${environment.expectedResult || "publish gated"}.`;
  }

  levelsBoard.replaceChildren();
  (gate.readinessLevels || []).forEach((level, index) => {
    const item = create("article", "publish-gate-level");
    const marker = create("span", "publish-gate-level__marker", String(index + 1));
    const copy = create("div");
    copy.append(
      create("h4", "", level.id || "gate"),
      create("p", "", level.meaning || "Publication remains gated until this level is explicit.")
    );
    item.append(marker, copy);
    levelsBoard.append(item);
  });
}

function renderEvolutionQueue() {
  const panel = el("[data-evolution-queue-panel]");
  const focus = el("[data-evolution-queue-focus]");
  const list = el("[data-evolution-queue-list]");
  if (!panel || !list) return;

  const model = state.evolutionModel;
  const queue = (model?.activationQueue || []).slice(0, 3);
  if (focus) {
    focus.textContent = model?.currentFocus?.decisionBias || "Keep the next SEIS move small, reversible, and validated.";
  }

  list.replaceChildren();
  if (!queue.length) {
    list.append(create("p", "", "Evolution queue unavailable; keep changes small and rollback-safe."));
    return;
  }

  queue.forEach((item) => {
    const card = create("article", "evolution-queue-item");
    card.append(
      create("span", "", `${item.backlogId || item.id} · ${item.layer || "model"}`),
      create("h4", "", item.title || "SEIS evolution move"),
      create("p", "", item.nextAction || "Keep the next action traceable before implementation."),
      create("div", "evolution-queue-item__meta", `Validate: ${item.validationProfile || "lowPowerDefault"}`)
    );
    list.append(card);
  });
}

function renderAggressiveLanes() {
  const panel = el("[data-aggressive-lanes-panel]");
  const summary = el("[data-aggressive-lanes-summary]");
  const grid = el("[data-aggressive-lanes-grid]");
  if (!panel || !grid) return;

  const map = state.aggressiveMap;
  const lanes = (map?.capabilityLanes || []).slice(0, 4);
  if (summary) {
    const timebox = map?.timeboxMinutes ? `${map.timeboxMinutes} min` : "bounded";
    summary.textContent = `${map?.mode || "aggressive-safe-activation"}; ${timebox} reversible batches.`;
  }

  grid.replaceChildren();
  if (!lanes.length) {
    grid.append(create("p", "", "Aggressive capability map unavailable; stay in low-power reversible mode."));
    return;
  }

  lanes.forEach((lane) => {
    const card = create("article", "aggressive-lane-card");
    const surfaces = (lane.surfaces || []).slice(0, 3).join(" · ");
    const guard = (lane.blockedActions || ["no unsafe action"]).slice(0, 1).join(", ");
    card.append(
      create("span", "", lane.id || "lane"),
      create("h4", "", String(lane.id || "capability lane").replaceAll("-", " ")),
      create("p", "", surfaces || "Registry-first activation only."),
      create("div", "aggressive-lane-card__guard", `Guard: ${guard}`)
    );
    grid.append(card);
  });
}

function renderExecutionPlan() {
  const panel = el("[data-execution-plan-panel]");
  const summary = el("[data-execution-plan-summary]");
  const list = el("[data-execution-plan-list]");
  if (!panel || !list) return;

  const plan = state.executionPlan;
  const batches = (plan?.executionBatches || []).slice(0, 5);
  if (summary) {
    const blocker = plan?.publishState?.expectedBlocker || "publish gated";
    summary.textContent = `${plan?.mode || "maximum-safe-aggression"}; ${plan?.sprintWindowMinutes || 10} min window; ${blocker}.`;
  }

  list.replaceChildren();
  if (!batches.length) {
    list.append(create("p", "", "Execution plan unavailable; generate it before aggressive work."));
    return;
  }

  batches.forEach((batch) => {
    const row = create("article", "execution-plan-row");
    const identity = create("div");
    identity.append(create("span", "", batch.id || "batch"), create("h4", "", batch.lane || "local-safe"));
    const action = create("p", "", batch.action || "Keep the next batch reversible and checked.");
    const commands = create(
      "div",
      "execution-plan-row__commands",
      (batch.qualityCommands || []).slice(0, 2).join(" · ") || "npm run check:workspace"
    );
    row.append(identity, action, commands);
    list.append(row);
  });
}

function renderLocalCycle() {
  const panel = el("[data-local-cycle-panel]");
  const summary = el("[data-local-cycle-summary]");
  const grid = el("[data-local-cycle-grid]");
  if (!panel || !grid) return;

  const report = state.localCycle;
  const commands = (report?.commands || []).slice(0, 6);
  if (summary) {
    const posture = report?.publishPosture?.reason || "publish gated";
    summary.textContent = `${report?.passed ? "Passed" : "Blocked"}; push remains ${report?.publishPosture?.pushAllowed ? "allowed" : "blocked"}; ${posture}.`;
  }

  grid.replaceChildren();
  if (!commands.length) {
    grid.append(create("p", "", "Local aggressive cycle report unavailable; run automation before increasing speed."));
    return;
  }

  commands.forEach((entry) => {
    const card = create("article", "local-cycle-card");
    card.append(
      create("span", "", entry.status || "unknown"),
      create("p", "", entry.command || "local check"),
      create("p", "", entry.summary || "No summary recorded.")
    );
    grid.append(card);
  });
}

function renderSafetyFirewall() {
  const panel = el("[data-safety-firewall-panel]");
  const summary = el("[data-safety-firewall-summary]");
  const grid = el("[data-safety-firewall-grid]");
  if (!panel || !grid) return;

  const firewall = state.safetyFirewall;
  if (summary) {
    const violations = firewall?.violations?.length || 0;
    summary.textContent = `${firewall?.passed ? "Passed" : "Blocked"}; ${violations} violations; push/deploy remain blocked.`;
  }

  grid.replaceChildren();
  if (!firewall) {
    grid.append(create("p", "", "Safety firewall report unavailable; do not increase automation speed."));
    return;
  }

  const boundary = create("article", "safety-firewall-card");
  boundary.append(
    create("span", "", "boundary"),
    create("p", "", `${firewall.scannedCommandCount || 0} commands scanned; push allowed: ${firewall.publishBoundary?.pushAllowed ? "yes" : "no"}.`)
  );

  const stops = create("article", "safety-firewall-card");
  stops.append(
    create("span", "", "hard stops"),
    create("p", "", (firewall.hardStops || []).slice(0, 4).join(" · ") || "No unsafe boundary recorded.")
  );

  grid.append(boundary, stops);
}

function renderCommands() {
  const board = el("#command-board");
  if (!board) return;
  board.replaceChildren();

  state.commands.forEach((command) => {
    const card = create("article", `command-card status-${command.status}`);
    const chips = create("div", "chip-row");
    chips.append(create("span", "chip", command.status), create("span", "chip", command.id));

    const title = create("h3", "", command.label);
    const metric = create("p", "command-card__metric", command.metric);
    const action = create("p", "", command.action);
    card.append(chips, title, metric, action);
    board.append(card);
  });
}

function renderQualityConsole() {
  const qualityBoard = el("#quality-board");
  const thresholdBoard = el("#threshold-board");
  if (qualityBoard) {
    qualityBoard.replaceChildren();
    state.qualitySignals.forEach((signal) => {
      const card = create("article", `quality-card status-${signal.status}`);
      const chips = create("div", "chip-row");
      chips.append(create("span", "chip", signal.status), create("span", "chip", signal.id));

      const title = create("h3", "", signal.label);
      const value = create("p", "quality-card__value", signal.value);
      const detail = create("p", "", signal.detail);
      card.append(chips, title, value, detail);
      qualityBoard.append(card);
    });
  }

  if (thresholdBoard) {
    thresholdBoard.replaceChildren();
    state.thresholds.forEach((threshold) => {
      const row = create("article", "threshold-row");
      row.append(
        create("span", "threshold-row__label", threshold.label),
        create("span", "threshold-row__target", threshold.target),
        create("span", "threshold-row__status", threshold.current)
      );
      thresholdBoard.append(row);
    });
  }
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} failed: ${response.status}`);
  return response.json();
}

async function loadGaps() {
  const payload = await fetchJson("../../data/gap-closure-register.json");
  state.gaps = payload.gaps || [];
}

async function loadCapabilities() {
  try {
    const payload = await fetchJson("../../content/development/plugin-skill-capability-map.json");
    state.capabilities = payload.capabilities || fallbackCapabilities;
  } catch (_error) {
    state.capabilities = fallbackCapabilities;
  }
}

async function loadMarketplace() {
  try {
    state.marketplace = await fetchJson("../../content/development/trusted-marketplace-intake.json");
  } catch (_error) {
    state.marketplace = fallbackMarketplace;
  }
}

async function loadCinematicEngine() {
  try {
    const payload = await fetchJson("../../content/lab/cinematic-engine.json");
    state.commands = payload.commandDeck || [];
  } catch (_error) {
    state.commands = [
      {
        id: "local-fallback",
        label: "Local Engine",
        status: "active",
        metric: "Static fallback",
        action: "Keep the interface usable while engine data is unavailable."
      }
    ];
  }
}

async function loadSafetyFirewall() {
  try {
    state.safetyFirewall = await fetchJson("../../content/development/aggressive-safety-firewall.json");
  } catch (_error) {
    state.safetyFirewall = {
      passed: false,
      violations: [{ id: "report-missing" }],
      scannedCommandCount: 0,
      publishBoundary: { pushAllowed: false },
      hardStops: ["no push until firewall report exists"]
    };
  }
}

async function loadLocalCycle() {
  try {
    state.localCycle = await fetchJson("../../content/development/aggressive-local-run-report.json");
  } catch (_error) {
    state.localCycle = {
      passed: false,
      publishPosture: { pushAllowed: false, reason: "report missing" },
      commands: [
        {
          command: "npm run automation:aggressive-local-cycle",
          status: "needed",
          summary: "Generate the local aggressive run report before increasing speed."
        }
      ]
    };
  }
}

async function loadExecutionPlan() {
  try {
    state.executionPlan = await fetchJson("../../content/development/aggressive-execution-plan.json");
  } catch (_error) {
    state.executionPlan = {
      mode: "maximum-safe-aggression",
      sprintWindowMinutes: 10,
      publishState: { expectedBlocker: "publish gated" },
      executionBatches: [
        {
          id: "batch-01",
          lane: "local-safe-default",
          action: "Generate the aggressive execution plan, then run focused checks before commit.",
          qualityCommands: ["npm run check:workspace"]
        }
      ]
    };
  }
}

async function loadAggressiveMap() {
  try {
    state.aggressiveMap = await fetchJson("../../content/development/aggressive-capability-map.json");
  } catch (_error) {
    state.aggressiveMap = {
      mode: "aggressive-safe-activation",
      timeboxMinutes: 10,
      capabilityLanes: [
        {
          id: "local-safe-default",
          surfaces: ["workspace checks", "release sync", "rollback notes"],
          blockedActions: ["no force push or live deploy"]
        }
      ]
    };
  }
}

async function loadEvolutionModel() {
  try {
    state.evolutionModel = await fetchJson("../../content/development/seis-evolution-model.json");
  } catch (_error) {
    state.evolutionModel = {
      currentFocus: {
        decisionBias: "Keep the next SEIS move small, reversible, and validated."
      },
      activationQueue: [
        {
          id: "fallback-evolution",
          backlogId: "SEIS",
          layer: "governance",
          title: "Maintain calm evolution",
          nextAction: "Use the smallest reversible slice and run focused checks before commit.",
          validationProfile: "lowPowerDefault"
        }
      ]
    };
  }
}

async function loadPublishGate() {
  try {
    state.publishGate = await fetchJson("../../content/development/publish-gate-contract.json");
  } catch (_error) {
    state.publishGate = {
      remote: { name: "origin", targetBranch: "UIXAppTTR" },
      currentEnvironmentPolicy: { expectedResult: "publish gated" },
      readinessLevels: [
        {
          id: "configured",
          meaning: "Local remote configuration can be reviewed, but publishing remains blocked."
        },
        {
          id: "publish-preflight",
          meaning: "UIXAppTTR, upstream, clean worktree, and GitHub auth must be ready."
        }
      ]
    };
  }
}

async function loadQualityConsole() {
  try {
    const payload = await fetchJson("../../content/lab/quality-console.json");
    state.qualitySignals = payload.signals || [];
    state.thresholds = payload.thresholds || [];
  } catch (_error) {
    state.qualitySignals = [
      {
        id: "quality-fallback",
        label: "Quality Console",
        status: "green",
        value: "Static fallback",
        detail: "Quality data is unavailable, but the interface remains readable."
      }
    ];
    state.thresholds = [];
  }
}

function setupCinematicField() {
  const canvas = el("[data-cinematic-field]");
  if (!canvas) return;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const scene = {
    width: 0,
    height: 0,
    ratio: 1,
    particles: [],
    frame: 0,
    running: false
  };

  const seed = () => {
    const count = state.mode === "cinematic" ? (window.innerWidth < 720 ? 34 : 82) : 22;
    scene.particles = Array.from({ length: count }, (_item, index) => {
      const lane = index / Math.max(count, 1);
      return {
        x: scene.width * ((index * 0.618) % 1),
        y: scene.height * ((index * 0.383) % 1),
        z: 0.35 + lane * 0.85,
        speed: 0.18 + lane * 0.48,
        hue: index % 3
      };
    });
  };

  const resize = () => {
    scene.width = canvas.clientWidth;
    scene.height = canvas.clientHeight;
    scene.ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1 : 1.35);
    canvas.width = Math.max(1, Math.floor(scene.width * scene.ratio));
    canvas.height = Math.max(1, Math.floor(scene.height * scene.ratio));
    context.setTransform(scene.ratio, 0, 0, scene.ratio, 0, 0);
    seed();
    draw(0);
  };

  const drawGrid = () => {
    const horizon = scene.height * 0.58;
    context.strokeStyle = "rgba(245, 238, 224, 0.075)";
    context.lineWidth = 1;

    for (let i = 0; i < 12; i += 1) {
      const y = horizon + i * 28;
      context.beginPath();
      context.moveTo(scene.width * 0.08, y);
      context.lineTo(scene.width * 0.92, y + i * 4);
      context.stroke();
    }

    for (let i = 0; i < 11; i += 1) {
      const x = scene.width * (0.15 + i * 0.07);
      context.beginPath();
      context.moveTo(scene.width * 0.5, horizon);
      context.lineTo(x, scene.height);
      context.stroke();
    }
  };

  const draw = (time) => {
    context.clearRect(0, 0, scene.width, scene.height);

    const gradient = context.createLinearGradient(0, 0, scene.width, scene.height);
    gradient.addColorStop(0, "rgba(8, 10, 12, 0.98)");
    gradient.addColorStop(0.48, "rgba(16, 20, 25, 0.9)");
    gradient.addColorStop(1, "rgba(8, 10, 12, 0.98)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, scene.width, scene.height);
    drawGrid();

    scene.particles.forEach((particle) => {
      const motion = state.mode === "reduced" ? 0 : Math.sin(time * 0.00032 * particle.speed + particle.x) * 24;
      const x = (particle.x + motion + scene.width) % scene.width;
      const y = particle.y + Math.cos(time * 0.00022 + particle.z) * 12;
      const radius = 1.1 + particle.z * 2.9;
      const colors = [
        "rgba(214, 177, 106, 0.54)",
        "rgba(98, 199, 184, 0.46)",
        "rgba(211, 106, 120, 0.34)"
      ];

      context.beginPath();
      context.fillStyle = colors[particle.hue];
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    });
  };

  const animate = (time) => {
    if (!scene.running) return;
    draw(time);
    scene.frame = window.requestAnimationFrame(animate);
  };

  const setRunning = (running) => {
    scene.running = running && state.mode !== "reduced" && document.visibilityState === "visible";
    window.cancelAnimationFrame(scene.frame);
    if (scene.running) {
      scene.frame = window.requestAnimationFrame(animate);
    } else {
      draw(0);
    }
  };

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => setRunning(true));
  motionPreference.addEventListener("change", () => {
    seed();
    setRunning(true);
  });

  resize();
  setRunning(true);
}

async function init() {
  applyMode(getDefaultMode());
  setupLoader();
  setupModeToggle();
  setupAnchorTransitions();
  setupActiveSectionNav();
  setupParallax();
  setupReveals();
  setupDepthCards();
  setupTouchFeedback();
  setupCapabilityFilters();
  setupCinematicField();
  await Promise.allSettled([
    loadGaps(),
    loadCapabilities(),
    loadMarketplace(),
    loadCinematicEngine(),
    loadQualityConsole(),
    loadPublishGate(),
    loadEvolutionModel(),
    loadAggressiveMap(),
    loadExecutionPlan(),
    loadLocalCycle(),
    loadSafetyFirewall()
  ]);
  renderGapBoard();
  renderCapabilities();
  renderMarketplace();
  renderCommands();
  renderQualityConsole();
  renderPublishGate();
  renderEvolutionQueue();
  renderAggressiveLanes();
  renderExecutionPlan();
  renderLocalCycle();
  renderSafetyFirewall();
}

init().catch((error) => {
  const board = el("#gap-board");
  if (board) {
    board.replaceChildren(create("p", "", `Runtime unavailable: ${error.message}`));
  }
  renderCapabilities();
  renderMarketplace();
  renderQualityConsole();
  renderPublishGate();
  renderEvolutionQueue();
  renderAggressiveLanes();
  renderExecutionPlan();
  renderLocalCycle();
  renderSafetyFirewall();
});
