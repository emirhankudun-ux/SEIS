(function () {
  "use strict";

  const LEDGER_NAMESPACE = ["seis", "evolution", "ledger", "v1"].join(".");
  const TOTAL_QUARTERS = 20;
  const QUARTERS = [
    [1, "Working Demo", ["Foundation", "Shared Workspace", "Command Center", "Live Demo"]],
    [2, "Alpha", ["Plugin System", "Provider Router", "Local Models", "Repository Intelligence"]],
    [3, "Beta", ["Team Collaboration", "Advanced IDE", "Design Studio", "Marketplace"]],
    [4, "Platform", ["Enterprise Security", "Observability", "Multi-user Workspaces", "Automation"]],
    [5, "Full Ecosystem", ["AI-native OS", "Agent Platform", "Local and Cloud AI", "Open-source Readiness"]]
  ];
  const DESCRIPTIONS = [
    "Make the desktop, local AI state, and core app routes feel real.",
    "Keep workspace files and planning state connected across the demo.",
    "Give the Command Center a visible place to coordinate the next move.",
    "Publish a reviewer-ready Linux-like demo with honest boundaries.",
    "Turn safe extensions into a usable, inspectable plugin surface.",
    "Route by task and privacy mode without silently changing providers.",
    "Offer a zero-key local model path with explicit capability labels.",
    "Build repository awareness from metadata before any write action.",
    "Make shared workspaces collaborative without hiding ownership.",
    "Grow the Code surface around real files and safe local previews.",
    "Connect design tokens, prototypes, and implementation context.",
    "Create a marketplace with persistent install and enable states.",
    "Harden identity, permissions, and approval boundaries.",
    "Make local and remote signals observable without claiming access.",
    "Support multi-user workspace concepts with clear tenancy states.",
    "Compose repeatable workflows with approval-aware automation.",
    "Unify the SEIS apps as one coherent creative operating system.",
    "Let agents extend the product without expanding their own permissions.",
    "Balance private local work with optional, backend-only cloud work.",
    "Prepare the ecosystem for public review with provenance and governance."
  ];
  const yearNames = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
  const yearPhases = ["Working Demo", "Alpha", "Beta", "Platform", "Full Ecosystem"];

  let state = loadState();
  let filter = "all";

  function createDefaultState() {
    const quarters = [];
    let index = 0;
    QUARTERS.forEach(([year, phase, names]) => {
      names.forEach((name, quarterIndex) => {
        quarters.push({
          id: "y" + year + "-q" + (quarterIndex + 1),
          year,
          quarter: quarterIndex + 1,
          phase,
          name,
          description: DESCRIPTIONS[index],
          status: index === 0 ? "active" : "planned",
          completedAt: null,
          updatedAt: null
        });
        index += 1;
      });
    });
    return { version: 1, quarters, savedAt: null };
  }

  function loadState() {
    const fallback = createDefaultState();
    try {
      const raw = window.localStorage.getItem(LEDGER_NAMESPACE);
      if (!raw) return fallback;
      return mergeState(fallback, JSON.parse(raw));
    } catch (error) {
      return fallback;
    }
  }

  function mergeState(base, incoming) {
    if (!incoming || !Array.isArray(incoming.quarters)) return base;
    const incomingById = new Map(incoming.quarters.map((quarter) => [quarter.id, quarter]));
    const merged = base.quarters.map((quarter) => {
      const candidate = incomingById.get(quarter.id);
      if (!candidate) return quarter;
      const complete = quarter.status === "complete" || candidate.status === "complete";
      return {
        ...quarter,
        status: complete ? "complete" : candidate.status === "active" ? "active" : quarter.status,
        completedAt: complete ? (quarter.completedAt || candidate.completedAt || new Date().toISOString()) : null,
        updatedAt: candidate.updatedAt || quarter.updatedAt || null
      };
    });
    promoteFirstOpen(merged);
    return { version: 1, quarters: merged, savedAt: incoming.savedAt || null };
  }

  function promoteFirstOpen(quarters) {
    let activeFound = false;
    quarters.forEach((quarter) => {
      if (quarter.status === "complete") return;
      if (!activeFound) {
        quarter.status = "active";
        activeFound = true;
      } else if (quarter.status === "active") {
        quarter.status = "planned";
      }
    });
  }

  function persist(message) {
    state.savedAt = new Date().toISOString();
    window.localStorage.setItem(LEDGER_NAMESPACE, JSON.stringify(state));
    render();
    if (message) setStatus(message);
  }

  function currentQuarter() {
    return state.quarters.find((quarter) => quarter.status === "active") || state.quarters.find((quarter) => quarter.status !== "complete") || state.quarters[TOTAL_QUARTERS - 1];
  }

  function advance() {
    const current = currentQuarter();
    if (!current || current.status === "complete") {
      setStatus("All 20 quarters are complete. Export the ledger as a milestone record.");
      return;
    }
    const currentIndex = state.quarters.findIndex((quarter) => quarter.id === current.id);
    current.status = "complete";
    current.completedAt = new Date().toISOString();
    current.updatedAt = current.completedAt;
    const next = state.quarters[currentIndex + 1];
    if (next) {
      next.status = "active";
      next.updatedAt = new Date().toISOString();
      persist("Advanced to " + next.name + ".");
    } else {
      persist("Five-year ledger complete.");
    }
  }

  function toggleQuarter(id) {
    const quarter = state.quarters.find((entry) => entry.id === id);
    if (!quarter) return;
    if (quarter.status === "complete") {
      setStatus("Completed milestones remain complete; imported or local progress is never erased here.");
      return;
    }
    const current = currentQuarter();
    const targetIndex = state.quarters.findIndex((entry) => entry.id === id);
    const currentIndex = state.quarters.findIndex((entry) => entry.id === current.id);
    if (targetIndex > currentIndex) {
      setStatus("Advance sequentially so the ledger stays an honest record.");
      return;
    }
    quarter.status = "complete";
    quarter.completedAt = new Date().toISOString();
    quarter.updatedAt = quarter.completedAt;
    promoteFirstOpen(state.quarters);
    persist(quarter.name + " marked complete.");
  }

  function setStatus(message) {
    const element = document.getElementById("status-line");
    if (element) element.textContent = message;
  }

  function exportState() {
    const payload = JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "seis-evolution-ledger.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Portable ledger snapshot exported. Existing local state remains unchanged.");
  }

  function importState(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        state = mergeState(state, JSON.parse(reader.result));
        persist("Snapshot merged. Local completed milestones were preserved.");
      } catch (error) {
        setStatus("Snapshot could not be read. No local state was changed.");
      }
    };
    reader.readAsText(file);
  }

  function render() {
    const completed = state.quarters.filter((quarter) => quarter.status === "complete").length;
    const current = currentQuarter();
    const progress = Math.round((completed / TOTAL_QUARTERS) * 100);
    document.getElementById("progress-value").textContent = progress + "%";
    document.getElementById("progress-bar").style.width = progress + "%";
    document.getElementById("completed-value").textContent = completed + " / " + TOTAL_QUARTERS;
    document.getElementById("current-horizon").textContent = current ? yearNames[current.year - 1] : "Complete";
    document.getElementById("current-quarter").textContent = current ? "Q" + current.quarter + " / " + current.name : "All quarters complete";
    document.getElementById("last-updated").textContent = state.savedAt ? "Saved " + formatDate(state.savedAt) : "No local updates yet";
    renderYears();
  }

  function renderYears() {
    const grid = document.getElementById("year-grid");
    grid.innerHTML = "";
    for (let year = 1; year <= 5; year += 1) {
      const quarters = state.quarters.filter((quarter) => quarter.year === year);
      const completed = quarters.filter((quarter) => quarter.status === "complete").length;
      const current = quarters.some((quarter) => quarter.status === "active");
      const column = document.createElement("section");
      column.className = "year-column" + (current ? " is-current" : "");
      column.hidden = filter !== "all" && filter !== String(year);
      column.innerHTML = '<div class="year-heading"><div><strong>' + yearNames[year - 1] + '</strong><small>' + yearPhases[year - 1] + '</small></div><span class="year-progress">' + completed + '/4</span></div><div class="quarter-list"></div>';
      const list = column.querySelector(".quarter-list");
      quarters.forEach((quarter) => list.appendChild(renderQuarter(quarter)));
      grid.appendChild(column);
    }
  }

  function renderQuarter(quarter) {
    const card = document.createElement("article");
    card.className = "quarter-card is-" + quarter.status;
    const label = quarter.status === "complete" ? "Complete" : quarter.status === "active" ? "Now" : "Planned";
    card.innerHTML = '<div class="quarter-meta"><span>Q' + quarter.quarter + '</span><span class="quarter-status">' + label + '</span></div><h3>' + escapeHtml(quarter.name) + '</h3><p>' + escapeHtml(quarter.description) + '</p><button class="quarter-action" type="button" data-quarter="' + quarter.id + '">' + (quarter.status === "complete" ? "Recorded" : "Mark complete") + '</button>';
    return card;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
    } catch (error) {
      return "recently";
    }
  }

  document.addEventListener("click", function (event) {
    const action = event.target.closest("[data-action]");
    if (action && action.dataset.action === "advance") advance();
    if (action && action.dataset.action === "export") exportState();
    const filterButton = event.target.closest("[data-filter]");
    if (filterButton) {
      filter = filterButton.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("is-active", button === filterButton));
      renderYears();
    }
    const quarterButton = event.target.closest("[data-quarter]");
    if (quarterButton) toggleQuarter(quarterButton.dataset.quarter);
  });

  document.getElementById("ledger-import").addEventListener("change", function (event) {
    importState(event.target.files[0]);
    event.target.value = "";
  });

  render();
})();
