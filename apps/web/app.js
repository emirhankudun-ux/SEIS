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
  ],
  developmentCadence: {
    periods: [
      {
        id: "H1",
        label: "H1 build cycle",
        purpose: "Define, prototype, and validate the next safe interface slice for the selected year.",
        reviewGate: "Mid-year review confirms evidence paths, mobile behavior, and no-key fallback."
      },
      {
        id: "H2",
        label: "H2 hardening cycle",
        purpose: "Stabilize, document, and prepare the selected year's interface work for PR sequencing.",
        reviewGate: "Year-end review confirms validators, release boundaries, and deferred actions."
      }
    ],
    laneRoutines: [
      {
        id: "seis",
        h1: "Refresh source-of-truth status, backlog, review queue, and lane copy.",
        h2: "Reconcile generated views, goal records, release notes, and governance evidence."
      },
      {
        id: "seis-cloud",
        h1: "Review @seis-cloud target placeholders, dry-run checks, rollback ownership, and SSH-disabled boundaries.",
        h2: "Harden @seis-cloud deployment readiness docs, incident notes, approval gates, and no-live messaging."
      },
      {
        id: "seis-code",
        h1: "Build the next browser-safe workspace slice with local persistence.",
        h2: "Add editor, terminal, source-control, and AI REPL QA evidence without provider secrets."
      },
      {
        id: "seis-design",
        h1: "Inventory components, tokens, motion rules, visual states, and responsive criteria.",
        h2: "Run visual QA, accessibility review, reduced-motion review, and asset provenance checks."
      },
      {
        id: "seis-data",
        h1: "Register JSON records, schema expectations, freshness rules, and evidence ownership.",
        h2: "Validate data consumers, stale states, provenance links, and generated artifact integrity."
      }
    ]
  }
};

const fallbackPluginInterfaces = {
  generatedAt: "2026-06-22",
  status: "static-fallback",
  summary: "Read-only fallback for the requested SEIS plugin interface lanes.",
  interfaces: [
    {
      id: "seis",
      handle: "@seis",
      title: "SEIS Command Layer",
      status: "documented foundation",
      stage: "foundation",
      risk: "medium",
      purpose: "Coordinate governance, goals, evidence, and Command Center navigation.",
      currentSurface: "Command Center lane status and Goal Tracking OS records.",
      nextAction: "Keep official docs, status, backlog, and generated static views aligned.",
      evidence: ["docs/STATUS.md", "docs/SEIS_MASTER_INDEX.md"]
    },
    {
      id: "seis-cloud",
      handle: "@seis-cloud",
      title: "Cloud Readiness",
      status: "documented dry-run",
      stage: "approval-gated",
      risk: "high",
      purpose: "Expose cloud readiness without executing deployment or SSH.",
      currentSurface: "Dry-run cloud readiness and publish-gate evidence.",
      nextAction: "Keep live actions blocked until target, rollback, and approval are explicit.",
      evidence: ["docs/operations/seis-cloud-foundation.md", "deploy/cloud-environment.json"]
    },
    {
      id: "seis-code",
      handle: "@seis-code",
      title: "SEIS Code Workspace",
      status: "planned mvp",
      stage: "contract",
      risk: "medium",
      purpose: "Define browser IDE, virtual file system, terminal, and no-key AI REPL boundaries.",
      currentSurface: "Static MVP contract and code automation plan evidence.",
      nextAction: "Build a browser-safe editor/file slice before broader dependencies.",
      evidence: ["docs/product/seis-code-foundation.md"]
    },
    {
      id: "seis-design",
      handle: "@seis-design",
      title: "Design System",
      status: "scaffolded",
      stage: "quality-gates",
      risk: "low",
      purpose: "Track tokens, components, accessibility, reduced motion, and visual QA.",
      currentSurface: "Design foundation and token evidence.",
      nextAction: "Add component inventory and visual QA evidence.",
      evidence: ["docs/design-system/seis-design-foundation.md", "packages/design-tokens/seis.tokens.css"]
    },
    {
      id: "seis-data",
      handle: "@seis-data",
      title: "Data And Evidence",
      status: "validated records plus gaps",
      stage: "schema-registry",
      risk: "medium",
      purpose: "Manage JSON records, evidence ledgers, generated reports, and data contracts.",
      currentSurface: "Goal records, evidence records, and generated view models.",
      nextAction: "Create a schema registry and freshness policy.",
      evidence: ["docs/data/seis-data-foundation.md", "content/development/seis-goal-command-center-view.json"]
    }
  ],
  fiveYearHorizon: [
    {
      year: "2026",
      phase: "Foundation",
      focus: "Static interfaces, evidence links, and no-live-action boundaries.",
      validation: "Syntax checks, JSON validation, manual accessibility review."
    },
    {
      year: "2027",
      phase: "Command Center Alpha",
      focus: "Shared navigation, persistence, search, and operator review workflows.",
      validation: "Component tests, keyboard QA, data freshness checks."
    },
    {
      year: "2028",
      phase: "Integrated Workflows",
      focus: "Read-only GitHub, cloud dry-run, SEIS Code MVP, design inventory, and schema coverage.",
      validation: "Contract tests, no-key startup checks, redacted provider audits."
    },
    {
      year: "2029",
      phase: "Governed Automation",
      focus: "Approval-gated actions, audit trails, agent queues, and rollback-ready operations.",
      validation: "Permission tests, audit event reviews, degraded-mode checks."
    },
    {
      year: "2030",
      phase: "Ecosystem Maturity",
      focus: "Federation, release governance, local model options, and maintenance cadence.",
      validation: "Release dry-runs, public exposure review, security refresh."
    }
  ],
  developmentProgram: [
    {
      year: "2026",
      theme: "Foundation interfaces",
      operatingPosture: "Read-only, validator-backed, and safe without cloud credentials.",
      laneCommitments: [
        {
          id: "seis",
          focus: "Unify source-of-truth navigation, status, backlog, and evidence.",
          interfaceOutcome: "A governance surface for repository state, goals, and safe next actions.",
          validationGate: "Status, backlog, index, and roadmap checks stay green."
        },
        {
          id: "seis-cloud",
          focus: "Keep cloud and SSH controls visibly approval-gated.",
          interfaceOutcome: "Cloud lane shows blockers, rollback needs, and disabled live actions.",
          validationGate: "No live deployment, SSH, or credential path is exposed."
        },
        {
          id: "seis-code",
          focus: "Define the browser IDE contract before heavy dependencies.",
          interfaceOutcome: "Code lane links editor, file-system, terminal, and no-key AI REPL boundaries.",
          validationGate: "Code workspace remains planned until a browser-safe slice is validated."
        },
        {
          id: "seis-design",
          focus: "Treat design tokens, accessibility, motion, and component quality as governance.",
          interfaceOutcome: "Design lane exposes quality gates and component inventory requirements.",
          validationGate: "Reduced-motion, mobile readability, and token evidence stay documented."
        },
        {
          id: "seis-data",
          focus: "Register current JSON records and visible freshness rules.",
          interfaceOutcome: "Data lane shows schema-registry work and evidence-backed records.",
          validationGate: "Schema registry and roadmap validators verify referenced records."
        }
      ]
    },
    {
      year: "2027",
      theme: "Command Center Alpha",
      operatingPosture: "Local-first workflows with shared navigation and operator review loops.",
      laneCommitments: [
        {
          id: "seis",
          focus: "Promote the plugin lane system into Command Center information architecture.",
          interfaceOutcome: "Operators can move between goals, docs, evidence, and lane-specific actions.",
          validationGate: "Keyboard navigation, route persistence, and source links pass browser QA."
        },
        {
          id: "seis-cloud",
          focus: "Add cloud target review screens without live deployment.",
          interfaceOutcome: "Cloud readiness shows target, environment, rollback, and approval status.",
          validationGate: "Dry-run data is labeled and live actions remain disabled."
        },
        {
          id: "seis-code",
          focus: "Ship the first local file explorer, editor, and command-history slice.",
          interfaceOutcome: "SEIS Code edits local virtual files and persists sessions without provider keys.",
          validationGate: "No-key startup, save/reopen, and mobile layout checks pass."
        },
        {
          id: "seis-design",
          focus: "Turn component inventory into a reusable review surface.",
          interfaceOutcome: "Design lane tracks component status, accessibility notes, and visual QA needs.",
          validationGate: "Component inventory JSON and visual QA notes stay linked."
        },
        {
          id: "seis-data",
          focus: "Add freshness metadata and evidence expiration rules.",
          interfaceOutcome: "Data lane explains current, stale, mock, and blocked record states.",
          validationGate: "Freshness checks distinguish stale evidence from current validation."
        }
      ]
    },
    {
      year: "2028",
      theme: "Integrated workflows",
      operatingPosture: "Read-only integrations first, contract-tested before write-gated actions.",
      laneCommitments: [
        {
          id: "seis",
          focus: "Connect governance, reviews, goals, and release readiness into one evidence model.",
          interfaceOutcome: "Command lane shows cross-lane dependencies without hidden state.",
          validationGate: "Contract tests verify status inputs before live write paths."
        },
        {
          id: "seis-cloud",
          focus: "Introduce read-only provider status and deployment package review.",
          interfaceOutcome: "Cloud lane compares intended and observed readiness without deploying.",
          validationGate: "Provider status uses sanitized data and keeps credentials server-only."
        },
        {
          id: "seis-code",
          focus: "Add Monaco-backed editing, terminal foundations, and safe source-control simulation.",
          interfaceOutcome: "Code lane becomes a local development cockpit for safe tasks.",
          validationGate: "Editor persistence, command behavior, and bundle scans pass."
        },
        {
          id: "seis-design",
          focus: "Link tokens, component QA, motion rules, and asset provenance to surfaces.",
          interfaceOutcome: "Design lane identifies surfaces needing visual, motion, or accessibility review.",
          validationGate: "Accessibility and reduced-motion checks join release evidence."
        },
        {
          id: "seis-data",
          focus: "Expand schema coverage for goals, evidence, quality signals, providers, and interfaces.",
          interfaceOutcome: "Data lane becomes the contract source for Command Center dashboards.",
          validationGate: "Data-schema registry covers every UI-consumed JSON file."
        }
      ]
    },
    {
      year: "2029",
      theme: "Governed automation",
      operatingPosture: "Approval-gated actions, audit trails, and policy-aware automation only.",
      laneCommitments: [
        {
          id: "seis",
          focus: "Coordinate approval queues, agent task boundaries, and rollback-ready plans.",
          interfaceOutcome: "Command lane separates recommended, approved, blocked, and completed actions.",
          validationGate: "Approval and audit records exist before write-gated operations."
        },
        {
          id: "seis-cloud",
          focus: "Add deployment dry-run comparison, rollback drills, and incident evidence views.",
          interfaceOutcome: "Cloud lane supports controlled release review without production changes.",
          validationGate: "Deployment actions require explicit approval and rollback notes."
        },
        {
          id: "seis-code",
          focus: "Introduce local demo REPL tools and backend-gated live AI routing where configured.",
          interfaceOutcome: "Code lane can run virtual commands and label actual provider identity.",
          validationGate: "Local-only mode, tool permissions, and fallback identity checks pass."
        },
        {
          id: "seis-design",
          focus: "Automate non-destructive design QA summaries while preserving human review.",
          interfaceOutcome: "Design lane produces review queues for contrast, layout, motion, and content fit.",
          validationGate: "Automated findings are evidence-labeled and do not override approval."
        },
        {
          id: "seis-data",
          focus: "Add audit-event, provenance, and validation-evidence ledgers.",
          interfaceOutcome: "Data lane traces which record supported each visible recommendation.",
          validationGate: "Every automated status has evidence, timestamp, and stale-state rules."
        }
      ]
    },
    {
      year: "2030",
      theme: "Ecosystem maturity",
      operatingPosture: "Multi-workspace, release-ready, privacy-aware, and maintainable.",
      laneCommitments: [
        {
          id: "seis",
          focus: "Stabilize the SEIS operating model across repositories, goals, and release trains.",
          interfaceOutcome: "Command lane supports governance, public readiness, and review cadence.",
          validationGate: "Release dry-runs and public readiness reviews support maturity claims."
        },
        {
          id: "seis-cloud",
          focus: "Operate cloud and remote readiness through auditable, least-privilege workflows.",
          interfaceOutcome: "Cloud lane shows deployment posture, workspace safety, and recovery evidence.",
          validationGate: "Security baseline refresh and incident-response review are current."
        },
        {
          id: "seis-code",
          focus: "Maintain SEIS Code as a browser workspace with local and approved live AI modes.",
          interfaceOutcome: "Code lane supports editor, terminal, extension, and provider visibility.",
          validationGate: "No-key startup, bundle scans, and browser E2E remain release gates."
        },
        {
          id: "seis-design",
          focus: "Keep the design system coherent across SEIS product surfaces.",
          interfaceOutcome: "Design lane becomes the durable record for visual, motion, and accessibility work.",
          validationGate: "Design review cadence and component gates remain documented."
        },
        {
          id: "seis-data",
          focus: "Federate evidence, schemas, evaluations, and readiness records across workspaces.",
          interfaceOutcome: "Data lane supports public-ready status, release evidence, and trend review.",
          validationGate: "Data provenance, freshness, and schema coverage refresh before releases."
        }
      ]
    }
  ]
};

const state = {
  mode: "cinematic",
  gaps: [],
  capabilities: fallbackCapabilities,
  marketplace: fallbackMarketplace,
  pluginInterfaces: fallbackPluginInterfaces,
  activePluginInterface: "seis",
  activePluginYear: "2026",
  activePluginPeriod: "H1",
  commands: [],
  qualitySignals: [],
  thresholds: [],
  publishGate: null,
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

function setupPluginInterfaceTabs() {
  document.querySelectorAll("[data-plugin-interface-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePluginInterface = button.dataset.pluginInterfaceTab || "seis";
      renderPluginInterfaces();
    });
  });
}

function setupPluginYearControls() {
  const section = el("[data-plugin-interfaces]");
  if (!section) return;

  section.addEventListener("click", (event) => {
    const yearButton = event.target.closest("[data-plugin-year]");
    if (yearButton) {
      state.activePluginYear = yearButton.dataset.pluginYear || "2026";
      renderPluginInterfaces();
      return;
    }

    const periodButton = event.target.closest("[data-plugin-period]");
    if (periodButton) {
      state.activePluginPeriod = periodButton.dataset.pluginPeriod || "H1";
      renderPluginInterfaces();
      return;
    }

    const laneButton = event.target.closest("[data-program-lane]");
    if (laneButton) {
      state.activePluginInterface = laneButton.dataset.programLane || "seis";
      renderPluginInterfaces();
    }
  });
}

function renderPluginInterfaces() {
  const status = el("[data-plugin-interface-status]");
  const detail = el("[data-plugin-interface-detail]");
  const evidenceBoard = el("[data-plugin-interface-evidence]");
  const horizonBoard = el("[data-five-year-grid]");
  const payload = state.pluginInterfaces || fallbackPluginInterfaces;
  const interfaces = payload.interfaces || fallbackPluginInterfaces.interfaces;
  const active =
    interfaces.find((item) => item.id === state.activePluginInterface) ||
    interfaces[0] ||
    fallbackPluginInterfaces.interfaces[0];

  if (status) {
    status.textContent = `${interfaces.length} plugin lanes - ${payload.status || "static"} - source: ${payload.generatedAt || "unknown"}`;
  }

  document.querySelectorAll("[data-plugin-interface-tab]").forEach((button) => {
    const activeButton = button.dataset.pluginInterfaceTab === active.id;
    button.classList.toggle("is-active", activeButton);
    button.setAttribute("aria-selected", activeButton ? "true" : "false");
  });

  if (detail) {
    const meta = create("div", "plugin-interface-meta");
    meta.append(
      create("span", "chip", active.status || "unknown"),
      create("span", "chip", active.stage || "planned"),
      create("span", "chip", `risk: ${active.risk || "unknown"}`)
    );

    const link = create("a", "plugin-interface-link", "Open lane source");
    link.href = getLaneSource(active.id);

    detail.replaceChildren(
      create("span", "", active.handle || active.id),
      create("h3", "", active.title || "Plugin lane"),
      create("p", "", active.purpose || "No purpose documented."),
      meta,
      create("p", "", `Current surface: ${active.currentSurface || "unknown"}`),
      create("p", "", `Next safe action: ${active.nextAction || "document before implementation"}`),
      link
    );
  }

  if (evidenceBoard) {
    evidenceBoard.replaceChildren();
    (active.evidence || []).forEach((path) => {
      const evidenceLink = create("a", "", path);
      evidenceLink.href = getEvidenceHref(path);
      evidenceBoard.append(evidenceLink);
    });
  }

  renderPluginCoverage(payload);

  if (horizonBoard) {
    horizonBoard.replaceChildren();
    (payload.fiveYearHorizon || fallbackPluginInterfaces.fiveYearHorizon).forEach((item) => {
      const card = create("article", "five-year-card");
      card.append(
        create("span", "", item.year),
        create("h4", "", item.phase),
        create("p", "", item.focus),
        create("p", "", `Validation: ${item.validation}`)
      );
      horizonBoard.append(card);
    });
  }

  renderPluginDevelopmentProgram(payload, interfaces, active);
}

function renderPluginCoverage(payload) {
  const coverageBoard = el("[data-plugin-interface-coverage]");
  if (!coverageBoard) return;

  const interfaces = payload.interfaces || fallbackPluginInterfaces.interfaces;
  const program = payload.developmentProgram || fallbackPluginInterfaces.developmentProgram;
  const cadence = payload.developmentCadence || fallbackPluginInterfaces.developmentCadence;
  const laneYearCommitments = program.reduce((total, year) => total + (year.laneCommitments || []).length, 0);
  const evidenceLinks = interfaces.reduce((total, item) => total + (item.evidence || []).length, 0);
  const cadencePeriods = cadence.periods?.length || 0;
  const routineCount = cadence.laneRoutines?.length || 0;
  const metrics = [
    { label: "lane-year commitments", value: laneYearCommitments },
    { label: "cadence periods", value: cadencePeriods },
    { label: "lane routines", value: routineCount },
    { label: "evidence links", value: evidenceLinks },
    { label: "live actions", value: 0 }
  ];

  coverageBoard.replaceChildren(
    ...metrics.map((metric) => {
      const card = create("article", "plugin-interface-coverage-card");
      card.append(create("strong", "", String(metric.value)), create("span", "", metric.label));
      return card;
    })
  );
}

function renderPluginDevelopmentProgram(payload, interfaces, active) {
  const controls = el("[data-five-year-controls]");
  const programDetail = el("[data-five-year-detail]");
  const program = payload.developmentProgram || fallbackPluginInterfaces.developmentProgram;
  const selected =
    program.find((item) => item.year === state.activePluginYear) ||
    program[0] ||
    fallbackPluginInterfaces.developmentProgram[0];

  if (!selected) return;
  state.activePluginYear = selected.year;

  if (controls) {
    controls.replaceChildren();
    program.forEach((item) => {
      const button = create("button", "five-year-button", item.year);
      const activeYear = item.year === selected.year;
      button.type = "button";
      button.dataset.pluginYear = item.year;
      button.classList.toggle("is-active", activeYear);
      button.setAttribute("aria-pressed", activeYear ? "true" : "false");
      button.setAttribute("title", item.theme || item.phase || item.year);
      controls.append(button);
    });
  }

  if (!programDetail) return;

  const selectedCommitments = selected.laneCommitments || [];
  const activeCommitment =
    selectedCommitments.find((commitment) => commitment.id === active.id) || selectedCommitments[0];
  const activeLane = interfaces.find((item) => item.id === activeCommitment?.id) || active;
  const cadence = payload.developmentCadence || fallbackPluginInterfaces.developmentCadence;
  const periods = cadence.periods || fallbackPluginInterfaces.developmentCadence.periods;
  const selectedPeriod =
    periods.find((period) => period.id === state.activePluginPeriod) ||
    periods[0] ||
    fallbackPluginInterfaces.developmentCadence.periods[0];
  const laneRoutine =
    (cadence.laneRoutines || []).find((routine) => routine.id === active.id) ||
    fallbackPluginInterfaces.developmentCadence.laneRoutines.find((routine) => routine.id === active.id);
  const laneList = create("div", "five-year-lane-list");
  const periodControls = create("div", "five-year-period-controls");
  const cadencePanel = create("div", "five-year-cadence");

  if (selectedPeriod) {
    state.activePluginPeriod = selectedPeriod.id;
  }

  periods.forEach((period) => {
    const button = create("button", "five-year-period-button", period.label || period.id);
    const activePeriod = period.id === state.activePluginPeriod;
    button.type = "button";
    button.dataset.pluginPeriod = period.id;
    button.classList.toggle("is-active", activePeriod);
    button.setAttribute("aria-pressed", activePeriod ? "true" : "false");
    periodControls.append(button);
  });

  cadencePanel.append(
    create("span", "", selectedPeriod?.id || "H1"),
    create("strong", "", selectedPeriod?.purpose || "Cadence purpose not documented."),
    create("p", "", laneRoutine?.[String(state.activePluginPeriod || "H1").toLowerCase()] || "Lane routine not documented."),
    create("p", "", `Review gate: ${selectedPeriod?.reviewGate || "not documented"}`)
  );

  selectedCommitments.forEach((commitment) => {
    const lane = interfaces.find((item) => item.id === commitment.id) || { handle: commitment.id, title: commitment.id };
    const row = create("button", "five-year-lane-row");
    const activeRow = commitment.id === active.id;
    row.type = "button";
    row.dataset.programLane = commitment.id;
    row.classList.toggle("is-active", activeRow);
    row.setAttribute("aria-pressed", activeRow ? "true" : "false");
    row.append(
      create("span", "", lane.handle || commitment.id),
      create("strong", "", commitment.focus || "Focus not documented."),
      create("p", "", commitment.validationGate || "Validation gate not documented.")
    );
    laneList.append(row);
  });

  programDetail.replaceChildren(
    create("span", "", `${selected.year} - ${selected.theme || "Development program"}`),
    create("h4", "", activeCommitment ? `${activeLane.handle || activeLane.id} yearly commitment` : "Yearly commitment"),
    create("p", "", selected.operatingPosture || "Operating posture not documented."),
    create("p", "", activeCommitment?.interfaceOutcome || "Interface outcome not documented."),
    create("p", "", `Validation gate: ${activeCommitment?.validationGate || "not documented"}`),
    periodControls,
    cadencePanel,
    laneList
  );
}

function getLaneSource(id) {
  const paths = {
    seis: "../../docs/architecture/seis-platform-lanes.md",
    "seis-cloud": "../../docs/operations/seis-cloud-foundation.md",
    "seis-code": "../../docs/product/seis-code-foundation.md",
    "seis-design": "../../docs/design-system/seis-design-foundation.md",
    "seis-data": "../../docs/data/seis-data-foundation.md"
  };
  return paths[id] || "../../docs/SEIS_MASTER_INDEX.md";
}

function getEvidenceHref(path) {
  if (path.startsWith("docs/")) return `../../${path}`;
  if (path.startsWith("content/")) return `../../${path}`;
  if (path.startsWith("deploy/")) return `../../${path}`;
  if (path.startsWith("packages/")) return `../../${path}`;
  return `../../${path}`;
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

async function loadPluginInterfaces() {
  try {
    state.pluginInterfaces = await fetchJson("../../content/development/seis-plugin-interface-roadmap.json");
  } catch (_error) {
    state.pluginInterfaces = fallbackPluginInterfaces;
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
  setupPluginInterfaceTabs();
  setupPluginYearControls();
  setupCinematicField();
  await Promise.allSettled([
    loadGaps(),
    loadCapabilities(),
    loadMarketplace(),
    loadPluginInterfaces(),
    loadCinematicEngine(),
    loadQualityConsole(),
    loadPublishGate()
  ]);
  renderGapBoard();
  renderCapabilities();
  renderMarketplace();
  renderPluginInterfaces();
  renderCommands();
  renderQualityConsole();
  renderPublishGate();
}

init().catch((error) => {
  const board = el("#gap-board");
  if (board) {
    board.replaceChildren(create("p", "", `Runtime unavailable: ${error.message}`));
  }
  renderCapabilities();
  renderMarketplace();
  renderPluginInterfaces();
  renderQualityConsole();
  renderPublishGate();
});
