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

const fallbackGithubModel = {
  branch: {
    active: "UIXAppTTR",
    singleRemoteBranch: true,
    remote: "UIX-Apps"
  },
  cadence: [
    {
      id: "intent",
      label: "Intent capture",
      status: "active",
      owner: "governance-agent",
      qualityGate: "Scope is small enough to review and rollback.",
      githubSignal: "A traceable note explains why the work exists."
    },
    {
      id: "source",
      label: "Source shaping",
      status: "active",
      owner: "interface-agent",
      qualityGate: "Source edits stay modular and dependency-light.",
      githubSignal: "The diff stays focused before release refresh."
    },
    {
      id: "verification",
      label: "Local verification",
      status: "required",
      owner: "release-agent",
      qualityGate: "Checks match the changed surface.",
      githubSignal: "The PR body lists exact checks and limits."
    },
    {
      id: "publication",
      label: "GitHub publication",
      status: "gated",
      owner: "release-agent",
      qualityGate: "Clean worktree, expected branch, upstream, remote, and auth are confirmed.",
      githubSignal: "Remote shipment is claimed only after the push exists."
    }
  ],
  readinessSignals: [
    { id: "branch-honesty", label: "Branch honesty", command: "npm run check:development-program" },
    { id: "workspace-integrity", label: "Workspace integrity", command: "npm run check:workspace" },
    { id: "publish-preflight", label: "Publish preflight", command: "npm run automation:publish-readiness" }
  ]
};

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

const fallbackPublishGate = {
  status: "active",
  purpose: "Keep local GitHub publication decisions explicit before push or deployment.",
  readinessLevels: [
    {
      id: "configured",
      meaning: "The intended GitHub remote exists in local git config.",
      allows: ["local validation", "commit creation"],
      blocks: ["push claim", "deployment claim"]
    },
    {
      id: "publish-preflight",
      meaning: "The working tree, branch, upstream, and GitHub auth are verified.",
      allows: ["bounded push preflight"],
      blocks: ["automatic deploy without confirmed target"]
    }
  ],
  currentEnvironmentPolicy: {
    expectedResult: "configured-but-not-publish-ready",
    reason: "Publication remains blocked until the publish preflight is explicitly green."
  }
};

const state = {
  mode: "cinematic",
  gaps: [],
  portfolio: fallbackPortfolio,
  capabilities: fallbackCapabilities,
  githubModel: fallbackGithubModel,
  marketplace: fallbackMarketplace,
  publishGate: fallbackPublishGate,
  pluginCommandCenter: null,
  mcpManifest: null,
  seisReposBridge: null,
  llmRegistry: null,
  isRefreshingPluginCommandCenter: false,
  commands: [],
  qualitySignals: [],
  thresholds: [],
  filter: "all",
  pluginProofFilter: "all"
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
        .forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", active ? "true" : "false");
        });
      renderCapabilities();
    });
  });
}

function setupPluginProofFilters() {
  document.querySelectorAll("[data-plugin-proof-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pluginProofFilter = button.dataset.pluginProofFilter || "all";
      document
        .querySelectorAll("[data-plugin-proof-filter]")
        .forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", active ? "true" : "false");
        });

      renderPluginCommandCenter();
    });
  });
}

function setupPluginCommandCenterRefresh() {
  const refreshButton = el("[data-plugin-command-refresh]");
  if (!refreshButton) return;

  const restoreRefreshButton = () => {
    state.isRefreshingPluginCommandCenter = false;
    refreshButton.disabled = false;
    refreshButton.textContent = "Refresh data";
    refreshButton.removeAttribute("aria-busy");
  };

  const handleRefresh = async () => {
    if (state.isRefreshingPluginCommandCenter) return;
    const status = el("[data-plugin-command-status]");
    state.isRefreshingPluginCommandCenter = true;
    refreshButton.disabled = true;
    refreshButton.textContent = "Refreshing...";
    refreshButton.setAttribute("aria-busy", "true");
    if (status) status.textContent = "Plugin command center refreshing from static payload...";
    try {
      await Promise.all([
        loadPluginCommandCenter(),
        loadMcpManifest(),
        loadSeisReposBridge(),
        loadLlmRegistry()
      ]);

      renderSeisReposLlmBridge();
      renderPluginCommandCenter();
    } catch (error) {
      if (status) status.textContent = `Plugin command center refresh failed: ${error.message}`;
    } finally {
      restoreRefreshButton();
    }
  };

  refreshButton.addEventListener("click", handleRefresh);
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

function renderGithubModel() {
  const status = el("[data-github-model-status]");
  const grid = el("[data-github-model-grid]");
  const readinessList = el("[data-github-readiness-list]");
  if (!grid || !readinessList) return;

  const model = state.githubModel || fallbackGithubModel;
  const cadence = model.cadence || fallbackGithubModel.cadence;
  const readinessSignals = model.readinessSignals || fallbackGithubModel.readinessSignals;
  const branch = model.branch?.active || "UIXAppTTR";
  const gatedCount = cadence.filter((item) => ["gated", "required"].includes(item.status)).length;

  if (status) {
    status.textContent = `${branch} branch - ${cadence.length} phases - ${gatedCount} gated verification steps`;
  }

  grid.replaceChildren();
  cadence.forEach((phase, index) => {
    const card = create("article", `system-card ${getGithubStatusClass(phase.status)}`);
    card.append(
      create("span", "", phase.status),
      create("strong", "", String(index + 1).padStart(2, "0")),
      create("h3", "", phase.label),
      create("p", "", phase.qualityGate),
      create("p", "", `GitHub: ${phase.githubSignal}`)
    );
    grid.append(card);
  });

  readinessList.replaceChildren();
  readinessSignals.forEach((signal) => {
    const item = create("li");
    const label = create("span", "github-readiness-label", signal.label);
    const command = create("code", "", signal.command);
    item.append(label, command);
    readinessList.append(item);
  });
}

function getGithubStatusClass(status) {
  if (["active", "required"].includes(status)) return "status-active";
  if (status === "gated") return "status-blocked";
  return "status-ready";
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

function renderPublishGate() {
  const panel = el("[data-publish-gate-panel]");
  const summary = el("[data-publish-gate-summary]");
  const levelsBoard = el("[data-publish-gate-levels]");
  if (!panel || !levelsBoard) return;

  const publishGate = state.publishGate || fallbackPublishGate;
  const levels = publishGate.readinessLevels || fallbackPublishGate.readinessLevels;
  const policy = publishGate.currentEnvironmentPolicy || fallbackPublishGate.currentEnvironmentPolicy;

  panel.dataset.publishGateStatus = publishGate.status || "unknown";
  if (summary) {
    summary.textContent = `${policy.expectedResult || "configured"} - ${policy.reason || publishGate.purpose || fallbackPublishGate.purpose}`;
  }

  levelsBoard.replaceChildren();
  levels.forEach((level) => {
    const card = create("article", `system-card ${level.id === "deployment-ready" ? "status-blocked" : "status-ready"}`);
    const allows = (level.allows || []).slice(0, 3).join(", ");
    const blocks = (level.blocks || []).slice(0, 3).join(", ");
    card.append(
      create("span", "", level.id),
      create("h3", "", level.meaning || level.id),
      create("p", "", allows ? `Allows: ${allows}` : "Allows remain gated."),
      create("p", "", blocks ? `Blocks: ${blocks}` : "No additional blocks declared.")
    );
    levelsBoard.append(card);
  });
}

function renderPluginCommandCenter() {
  const commandCenter = state.pluginCommandCenter;
  const status = el("[data-plugin-command-status]");
  const metrics = el("[data-plugin-command-metrics]");
  const topics = el("[data-plugin-topic-counts]");
  const policies = el("[data-plugin-policy-counts]");
  const proofList = el("[data-plugin-proof-list]");
  const visualScope = el("[data-plugin-visual-scope]");
  const mcpProof = el("[data-mcp-source-proof]");
  const sourceFilesList = el("[data-plugin-source-files]");
  if (!metrics || !topics || !policies) return;

  if (!commandCenter) {
    if (status) status.textContent = "Plugin command center unavailable; static fallback remains visible.";
    if (sourceFilesList) {
      sourceFilesList.replaceChildren(create("span", "source-file-chip", "Source files unavailable in cockpit cache."));
    }
    renderMcpSourceProof(mcpProof);
    return;
  }

  const scope = commandCenter.scope || {};
  const counts = commandCenter.counts || {};
  const provenPlugins = commandCenter.actual_invocation_summary?.proven_plugins || [];
  const commandPlugins = commandCenter.plugins || [];
  const provenPluginIds = new Set(provenPlugins.map((entry) => entry.plugin_id));
  const sourceVisiblePluginIds = new Set(commandPlugins.map((entry) => entry.plugin_id));
  const effectiveUsedPluginIds = new Set([...sourceVisiblePluginIds, ...provenPluginIds]);
  const displayPlugins = [...commandPlugins].sort((left, right) => {
    const leftProven = effectiveUsedPluginIds.has(left.plugin_id) ? 1 : 0;
    const rightProven = effectiveUsedPluginIds.has(right.plugin_id) ? 1 : 0;
    if (leftProven !== rightProven) return rightProven - leftProven;
    return (left.display_name || left.plugin_id).localeCompare(right.display_name || right.plugin_id);
  });
  const provenByPlugin = new Map(provenPlugins.map((entry) => [entry.plugin_id, entry]));
  const visualTopics = commandCenter.operator_visual_scope?.topics || [];
  const evidenceDate = commandCenter.evidence_updated || commandCenter.date || "unknown";
  const gatedPolicies = [
    "approval_before_write",
    "needs_external_target",
    "reauth_required",
    "scope_required",
    "plan_required",
    "account_required",
    "tool_error",
    "policy_guide_unavailable"
  ];
  const writeGated = gatedPolicies.reduce((sum, policy) => sum + (counts.by_call_policy?.[policy] || 0), 0);
  const provenCount = provenPluginIds.size;
  const usedCount = effectiveUsedPluginIds.size;
  const pendingCount = commandPlugins.length - usedCount;
  const pluginFilters = document.querySelectorAll("[data-plugin-proof-filter]");

  if (status) {
    const mcpStatus = state.mcpManifest?.server?.globalCodexMcpStatus;
    status.textContent = `${scope.command_center_count || commandPlugins.length || 0} plugins - ${usedCount} used (${pendingCount} pending) - evidence ${evidenceDate}${mcpStatus ? ` - MCP ${mcpStatus}` : ""}`;
  }

  metrics.replaceChildren(
    createMetricCard("Installed", String(scope.installed_enabled_count || 0), "Enabled plugin inventory"),
    createMetricCard("Visible", String(commandPlugins.length || 0), "Plugins in command-center source payload"),
    createMetricCard("Used", String(usedCount), "Plugins in source-visible command-center payload"),
    createMetricCard("Proven", String(provenPlugins.length), "Safe Codex Sources calls"),
    createMetricCard("Gated", String(writeGated), "Plugins requiring policy or external checks")
  );

  renderCountGrid(topics, counts.by_topic || {});
  renderCountGrid(policies, counts.by_call_policy || {}, formatPolicyLabel);
  renderMcpSourceProof(mcpProof);
  renderSourceFiles(sourceFilesList, commandCenter.source_files || []);

  if (visualScope) {
    visualScope.replaceChildren();
    visualTopics.forEach((item) => {
      const card = create("article", "proof-card");
      card.append(
        create("span", "", item.topic),
        create("h4", "", (item.examples || []).slice(0, 4).join(", ")),
        create("p", "", item.seis_route || "Route through SEIS before activation.")
      );
      visualScope.append(card);
    });
  }

  if (proofList) {
    const filter = state.pluginProofFilter || "all";
    const filteredPlugins = displayPlugins.filter((plugin) => {
      const isUsed = effectiveUsedPluginIds.has(plugin.plugin_id);
      if (filter === "used" || filter === "proven") return isUsed;
      if (filter === "pending") return !isUsed;
      return true;
    });

    pluginFilters.forEach((button) => {
      const value = button.dataset.pluginProofFilter;
      if (!value) return;
      const active = value === filter || (value === "used" && filter === "proven");
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");

      if (value === "used" || value === "proven") {
        button.textContent = `Used (${usedCount})`;
        button.setAttribute("aria-label", `Show ${usedCount} source-visible plugins`);
        button.setAttribute("title", "Source-visible plugins in the SEIS command center");
      } else if (value === "pending") {
        button.textContent = `Pending (${pendingCount})`;
        button.setAttribute("aria-label", `Show ${pendingCount} pending plugins`);
        button.setAttribute("title", "Plugins outside the current source-visible command-center payload");
      } else {
        button.textContent = `All (${commandPlugins.length})`;
        button.setAttribute("aria-label", `Show all ${commandPlugins.length} command-center plugins`);
        button.setAttribute("title", "All plugins loaded into the SEIS command center");
      }
    });

    proofList.replaceChildren();
    if (!filteredPlugins.length) {
      proofList.append(
        create(
          "p",
          "proof-card",
          "No plugin matches this proof visibility filter."
        )
      );
      return;
    }

    filteredPlugins.forEach((plugin) => {
      const proof = provenByPlugin.get(plugin.plugin_id);
      const isProven = effectiveUsedPluginIds.has(plugin.plugin_id);
      const safeProof = proof || {};
      const result = safeProof.safe_public_result ||
        "No session invocation is recorded; plugin remains source-visible for SEIS routing.";
      const tools = (safeProof.tools_called || []).join(", ");
      const card = create("article", `proof-card ${getProofStatusClass(plugin.status)}`);
      const badges = create("div", "proof-card__badges");
      card.append(
        badges,
        create("h4", "", plugin.display_name || plugin.plugin_id),
        create("p", "", tools ? `Tools: ${tools}` : `Policy: ${plugin.call_policy || "tracked"}`),
        create("p", "", result)
      );
      badges.append(
        create("span", "", isProven ? "used" : "unused"),
        create("span", "", plugin.status)
      );
      proofList.append(card);
    });
  }
}

function renderSourceFiles(container, files) {
  if (!container) return;

  container.replaceChildren();
  if (!files.length) {
    container.append(create("span", "source-file-chip", "No source references in this payload."));
    return;
  }

  files.forEach((path) => {
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    const link = document.createElement("a");
    link.className = "source-file-chip";
    const isFileProtocol = window.location.protocol === "file:";
    link.href = isFileProtocol ? `./${normalizedPath}` : `/${normalizedPath}`;
    link.textContent = normalizedPath || path;
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.setAttribute("aria-label", `Open source file ${normalizedPath || path}`);
    container.append(link);
  });
}

function renderSeisReposLlmBridge() {
  const status = el("[data-seis-repos-llm-status]");
  const metrics = el("[data-seis-repos-llm-metrics]");
  const lanesBoard = el("[data-seis-repos-llm-lanes]");
  if (!metrics || !lanesBoard) return;

  const bridge = state.seisReposBridge;
  const registry = state.llmRegistry;
  if (!bridge) {
    if (status) status.textContent = "SEIS Repos bridge unavailable; package registry remains gated.";
    return;
  }

  const lanes = bridge.llmPackageLanes || [];
  const registryCount = registry?.summary?.packageCount || 0;
  const commandCenterCount = state.pluginCommandCenter?.scope?.installed_enabled_count || 0;
  if (status) {
    status.textContent = `${bridge.status || "connected"} - ${lanes.length} LLM lanes - ${registryCount} package/runtime records`;
  }

  metrics.replaceChildren(
    createReposLlmMetric("Repo", bridge.repoBridge?.canonicalDefaultBranch || "UIXAppTTR", bridge.repoBridge?.canonicalRepository || bridge.repository),
    createReposLlmMetric("Plugin", bridge.pluginBridge?.pluginName || "seis", bridge.pluginBridge?.installedPluginId || "seis@personal"),
    createReposLlmMetric("MCP", bridge.mcpBridge?.server || "seis", `${bridge.mcpBridge?.tools?.length || 0} tools, ${bridge.mcpBridge?.resources?.length || 0} resources`),
    createReposLlmMetric("Registry", String(registryCount), `${commandCenterCount || 179} plugins remain command-center visible`)
  );

  lanesBoard.replaceChildren();
  lanes.forEach((lane) => {
    const card = create("article", "repos-llm-lane");
    card.append(
      create("span", "", lane.label || lane.id),
      create("h3", "", (lane.packageCandidates || []).slice(0, 3).join(", ")),
      create("p", "", lane.purpose || "Governed LLM package lane."),
      create("p", "", `Gate: ${lane.activationGate || "target required"}`)
    );
    lanesBoard.append(card);
  });
}

function createReposLlmMetric(label, value, detail) {
  const card = create("article", "repos-llm-card");
  card.append(create("span", "", label), create("strong", "", value), create("p", "", detail || "Connected"));
  return card;
}

function renderMcpSourceProof(container) {
  if (!container) return;

  const manifest = state.mcpManifest;
  if (!manifest) {
    container.replaceChildren(create("p", "mcp-source-proof__empty", "MCP manifest unavailable in this package."));
    return;
  }

  const server = manifest.server || {};
  const safety = manifest.safety || {};
  const tools = manifest.tools || [];
  const resources = manifest.resources || [];
  container.replaceChildren(
    createMcpProofCard("Global", server.globalCodexMcpStatus || "local", server.globalCodexMcpName || server.name || "seis"),
    createMcpProofCard("Tools", String(tools.length), tools.slice(0, 3).map((tool) => tool.name).join(", ")),
    createMcpProofCard("Resources", String(resources.length), resources.slice(0, 3).join(", ")),
    createMcpProofCard("Safety", safety.writePolicy || "read only", safety.externalSideEffects || "no external side effects")
  );
}

function createMcpProofCard(label, value, detail) {
  const card = create("article", "mcp-source-card");
  card.append(create("span", "", label), create("strong", "", value), create("p", "", detail || "Packaged source proof."));
  return card;
}

function createMetricCard(label, value, detail) {
  const card = create("article", "metric-card");
  card.setAttribute("aria-label", `${label}: ${value}. ${detail}`);
  card.setAttribute("title", detail);
  card.append(create("span", "", label), create("strong", "", value), create("p", "", detail));
  return card;
}

function renderCountGrid(container, counts, formatter = formatCountLabel) {
  container.replaceChildren();
  Object.entries(counts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .forEach(([label, count]) => {
      const card = create("article", "count-card");
      card.append(create("strong", "", String(count)), create("span", "", formatter(label)));
      container.append(card);
    });
}

function formatCountLabel(value) {
  return String(value).replaceAll("_", " ");
}

function formatPolicyLabel(value) {
  const labels = {
    safe_call_now: "safe call now",
    skill_load_only: "skill load only",
    account_required: "account required",
    plan_required: "plan required",
    policy_guide_unavailable: "policy guide unavailable",
    reauth_required: "reauth required",
    scope_required: "scope required",
    tool_error: "tool error",
    needs_external_target: "needs external target",
    approval_before_write: "approval before write",
    not_relevant_to_seis_now: "not relevant now"
  };
  return labels[value] || formatCountLabel(value);
}

function getProofStatusClass(status) {
  const normalized = String(status);
  if (normalized.includes("success") || normalized.includes("skill")) return "status-ready";
  if (normalized.includes("empty")) return "status-watch";
  if (
    normalized.includes("reauth") ||
    normalized.includes("scope") ||
    normalized.includes("plan") ||
    normalized.includes("account") ||
    normalized.includes("error") ||
    normalized.includes("policy")
  ) {
    return "status-blocked";
  }
  return "status-active";
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

function renderPluginStatus() {
  const bar = el("[data-cockpit-status-bar]");
  if (!bar) return;

  const registry = state.pluginRegistry;
  if (!registry) {
    bar.replaceChildren(create("p", "", "Plugin registry unavailable."));
    return;
  }

  const lanes = registry.lanes || {};
  const laneNames = Object.keys(lanes);
  const totalAssignments = laneNames.reduce(
    (sum, key) => sum + (lanes[key].active_installed || []).length,
    0
  );

  const countCard = create("article", "system-card status-active");
  countCard.append(
    create("span", "", "Plugins"),
    create("strong", "", String(registry.installed_enabled_count)),
    create("h3", "", "Installed and enabled"),
    create("p", "", `Not installed: ${registry.not_installed_count}. All assigned to lanes.`)
  );

  const laneCard = create("article", "system-card status-ready");
  laneCard.append(
    create("span", "", "Lanes"),
    create("strong", "", String(laneNames.length)),
    create("h3", "", "Active platform lanes"),
    create("p", "", `${totalAssignments} lane assignments across ${laneNames.length} lanes.`)
  );

  const policyCard = create("article", "system-card status-synced");
  policyCard.append(
    create("span", "", "Policy"),
    create("strong", "", "OpenAI"),
    create("h3", "", "OpenAI-first active"),
    create("p", "", "Prefer openai-curated, openai-bundled, openai-primary-runtime families first.")
  );

  bar.replaceChildren(countCard, laneCard, policyCard);
}

function renderBuildWorkbench() {
  const grid = el("[data-workbench-grid]");
  if (!grid) return;

  const workbench = state.buildWorkbench;
  if (!workbench?.sprint_1?.modules) {
    grid.replaceChildren(create("p", "", "Workbench data unavailable."));
    return;
  }

  grid.replaceChildren();
  const order = workbench.next_build_order || [];
  const modules = [...workbench.sprint_1.modules].sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  modules.forEach((module) => {
    const statusClass =
      module.status === "active"
        ? "status-active"
        : module.status === "ready_to_build"
          ? "status-ready"
          : "status-watch";
    const label = module.id.replaceAll("_", " ");
    const short =
      module.deliverable.length > 72
        ? module.deliverable.slice(0, 72) + "…"
        : module.deliverable;
    const card = create("article", `system-card ${statusClass}`);
    card.append(
      create("span", "", module.lane || ""),
      create("strong", "", label),
      create("h3", "", short),
      create("p", "", `${module.owner_path} — ${module.status.replaceAll("_", " ")}`)
    );
    grid.append(card);
  });
}

function renderWorkspaceOps() {
  const list = el("[data-workspace-links]");
  if (!list) return;

  const ops = state.workspaceOps;
  if (!ops) {
    list.replaceChildren(create("p", "", "Workspace ops unavailable."));
    return;
  }

  list.replaceChildren();
  const driveItems = Object.values(ops.drive || {});
  const calendarItems = Object.values(ops.calendar || {});

  [...driveItems, ...calendarItems].forEach((item) => {
    const isCalendar = Boolean(item.event_id || item.start);
    const card = create("article", "marketplace-source-card status-ready");
    const link = create("a", "workspace-link", item.title);
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    card.append(create("span", "", isCalendar ? "Calendar" : "Drive"), link);
    list.append(card);
  });
}

async function fetchJson(path) {
  const candidates = path.startsWith("../../") ? [path, `./${path.slice(6)}`] : [path];
  let lastError;

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate);
      if (!response.ok) throw new Error(`${candidate} failed: ${response.status}`);
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function loadGaps() {
  const payload = await fetchJson("../../data/gap-closure-register.json");
  state.gaps = payload.gaps || [];
}

async function loadPortfolio() {
  try {
    state.portfolio = await fetchJson("../../content/portfolio/portfolio-website.json");
  } catch (_error) {
    state.portfolio = fallbackPortfolio;
  }
}

async function loadCapabilities() {
  try {
    const payload = await fetchJson("../../content/development/plugin-skill-capability-map.json");
    state.capabilities = payload.capabilities || fallbackCapabilities;
  } catch (_error) {
    state.capabilities = fallbackCapabilities;
  }
}

async function loadGithubModel() {
  for (const path of ["./content/development/github-seis-model.json", "../../content/development/github-seis-model.json"]) {
    try {
      state.githubModel = await fetchJson(path);
      return;
    } catch (_error) {
      state.githubModel = fallbackGithubModel;
    }
  }
}

async function loadMarketplace() {
  try {
    state.marketplace = await fetchJson("../../content/development/trusted-marketplace-intake.json");
  } catch (_error) {
    state.marketplace = fallbackMarketplace;
  }
}

async function loadPublishGate() {
  try {
    state.publishGate = await fetchJson("../../content/development/publish-gate-contract.json");
  } catch (_error) {
    state.publishGate = fallbackPublishGate;
  }
}

async function loadPluginCommandCenter() {
  try {
    state.pluginCommandCenter = await fetchJson("../../data/plugin-command-center-2026-06-05.json");
  } catch (_error) {
    state.pluginCommandCenter = null;
  }
}

async function loadMcpManifest() {
  try {
    state.mcpManifest = await fetchJson("../../_mcp/seis-mcp-server-2026-06-07.json");
  } catch (_error) {
    state.mcpManifest = null;
  }
}

async function loadSeisReposBridge() {
  try {
    state.seisReposBridge = await fetchJson("../../data/seis-repos-llm-bridge-2026-06-08.json");
  } catch (_error) {
    state.seisReposBridge = null;
  }
}

async function loadLlmRegistry() {
  try {
    state.llmRegistry = await fetchJson("../../content/development/llm-package-registry.json");
  } catch (_error) {
    state.llmRegistry = null;
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

async function loadPluginRegistry() {
  try {
    state.pluginRegistry = await fetchJson("../../data/installed-codex-plugins-2026-06-05.json");
  } catch (_error) {
    state.pluginRegistry = null;
  }
}

async function loadBuildWorkbench() {
  try {
    state.buildWorkbench = await fetchJson("../../data/openai-curated-build-workbench-2026-06-05.json");
  } catch (_error) {
    state.buildWorkbench = null;
  }
}

async function loadWorkspaceOps() {
  try {
    state.workspaceOps = await fetchJson("../../integrations/google-workspace.json");
  } catch (_error) {
    state.workspaceOps = null;
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
  setupPluginProofFilters();
  setupPluginCommandCenterRefresh();
  setupCinematicField();
  await Promise.allSettled([
    loadGaps(),
    loadCapabilities(),
    loadMarketplace(),
    loadPublishGate(),
    loadPluginCommandCenter(),
    loadMcpManifest(),
    loadSeisReposBridge(),
    loadLlmRegistry(),
    loadCinematicEngine(),
    loadQualityConsole()
  ]);
  renderGapBoard();
  renderPortfolio();
  renderCapabilities();
  renderGithubModel();
  renderMarketplace();
  renderPublishGate();
  renderSeisReposLlmBridge();
  renderPluginCommandCenter();
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
  renderPortfolio();
  renderCapabilities();
  renderGithubModel();
  renderMarketplace();
  renderPublishGate();
  renderSeisReposLlmBridge();
  renderPluginCommandCenter();
  renderQualityConsole();
  renderPublishGate();
  renderEvolutionQueue();
  renderAggressiveLanes();
  renderExecutionPlan();
  renderLocalCycle();
  renderSafetyFirewall();
});
