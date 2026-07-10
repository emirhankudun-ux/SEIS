const ATLAS_CANDIDATES = [
  "./data/seis-language-atlas.generated.json",
  "./data/seis-language-atlas-seed.json",
];

const TIER_META = {
  "tier-0-active-core": {
    label: "Active Core",
    shortLabel: "Core",
    description: "Already used by the current SEIS repository and local demo.",
    state: "working",
  },
  "tier-1-ready-extension": {
    label: "Ready Extension",
    shortLabel: "Ready",
    description: "Can be introduced through a scoped PR with tests and rollback.",
    state: "ready",
  },
  "tier-2-contract-only": {
    label: "Contract Only",
    shortLabel: "Contract",
    description: "Recognized for architecture, examples, schemas, and planning.",
    state: "planned",
  },
  "tier-3-reference-only": {
    label: "Reference Only",
    shortLabel: "Reference",
    description: "Searchable and documented, but not activated as a runtime.",
    state: "reference",
  },
  "tier-4-blocked-until-explicit-approval": {
    label: "Approval Required",
    shortLabel: "Blocked",
    description: "Needs an approved toolchain, sandbox, security review, and rollback plan.",
    state: "blocked",
  },
};

const FAMILY_RULES = [
  {
    id: "web-markup",
    label: "Web & Markup",
    names: ["HTML", "CSS", "JavaScript", "TypeScript", "Astro", "ASP", "ASP.NET", "Blade", "Antlers", "AsciiDoc", "API Blueprint"],
  },
  {
    id: "systems-native",
    label: "Systems & Native",
    names: ["C", "C#", "C++", "Rust", "Assembly", "Ada", "AIDL", "AppleScript", "Objective-C", "Swift", "C3", "Cython"],
  },
  {
    id: "backend-enterprise",
    label: "Backend & Enterprise",
    names: ["Go", "Python", "Java", "Kotlin", "Scala", "Ruby", "PHP", "ABAP", "ABAP CDS", "Apex", "ColdFusion", "ColdFusion CFC", "1C Enterprise"],
  },
  {
    id: "data-ai-science",
    label: "Data, AI & Science",
    names: ["CSV", "Avro IDL", "Common Workflow Language", "CoNLL-U", "Cuda", "BAML", "Answer Set Programming"],
  },
  {
    id: "devops-config",
    label: "DevOps & Config",
    names: ["Shell", "Batchfile", "Bicep", "BitBake", "Caddyfile", "ApacheConf", "CUE", "cURL Config", "Cylc", "CODEOWNERS", "Ant Build System", "Alpine Abuild", "Cabal Config"],
  },
  {
    id: "formal-research",
    label: "Formal Methods",
    names: ["B (Formal Method)", "Agda", "Aiken", "ALGOL", "Alloy", "AMPL", "ANTLR", "APL", "ASL", "ASN.1", "ATS", "Coq", "Curry", "Boogie"],
  },
  {
    id: "creative-media",
    label: "Creative & Media",
    names: ["AGS Script", "COLLADA", "Csound Document", "Csound Score", "Cue Sheet", "Adobe Font Metrics", "Altium Designer", "Asymptote"],
  },
];

const FALLBACK_FAMILY = { id: "specialized-reference", label: "Specialized & Reference" };
const COLOR_PALETTE = ["#8f7aff", "#28d27f", "#ff9c3d", "#4f9cff", "#f05a8a", "#40c5d8", "#d2e84a", "#b36cff"];
const PAGE_SIZE = 120;
const SELECTION_KEY = "seis.languageAtlas.selection.v1";

const state = {
  atlas: null,
  languages: [],
  query: "",
  tier: "all",
  family: "all",
  visibleCount: PAGE_SIZE,
  selectedName: localStorage.getItem(SELECTION_KEY) || "JavaScript",
};

const refs = {
  root: document.querySelector("[data-language-atlas]"),
  search: document.querySelector("[data-language-search]"),
  tierFilters: document.querySelector("[data-tier-filters]"),
  familyFilters: document.querySelector("[data-family-filters]"),
  results: document.querySelector("[data-language-results]"),
  resultCount: document.querySelector("[data-language-result-count]"),
  source: document.querySelector("[data-language-source]"),
  total: document.querySelector("[data-language-total]"),
  selected: document.querySelector("[data-language-selected]"),
  loadMore: document.querySelector("[data-language-load-more]"),
  empty: document.querySelector("[data-language-empty]"),
  live: document.querySelector("[data-language-live]"),
};

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function colorForLanguage(name, explicitColor) {
  if (typeof explicitColor === "string" && /^#[0-9a-f]{6}$/i.test(explicitColor)) {
    return explicitColor;
  }
  return COLOR_PALETTE[hashString(name) % COLOR_PALETTE.length];
}

function familyForLanguage(name) {
  return FAMILY_RULES.find((family) => family.names.includes(name)) || FALLBACK_FAMILY;
}

function tierMapFromAtlas(atlas) {
  const tierMap = new Map();
  const tiers = atlas.activationTiers || {};
  for (const [tierId, names] of Object.entries(tiers)) {
    if (!Array.isArray(names)) continue;
    names.forEach((name) => tierMap.set(name, tierId));
  }
  return tierMap;
}

function normalizeLanguages(atlas) {
  const tierMap = tierMapFromAtlas(atlas);
  const rawLanguages = Array.isArray(atlas.languages) ? atlas.languages : [];
  const seen = new Set();

  return rawLanguages
    .map((entry) => {
      const record = typeof entry === "string" ? { name: entry } : entry;
      const name = String(record.name || "").trim();
      if (!name || seen.has(name.toLocaleLowerCase())) return null;
      seen.add(name.toLocaleLowerCase());

      const family = familyForLanguage(name);
      const activationTier = record.activationTier || tierMap.get(name) || "tier-3-reference-only";
      return {
        name,
        type: record.type || "language-reference",
        color: colorForLanguage(name, record.color),
        familyId: family.id,
        familyLabel: family.label,
        activationTier,
        tierLabel: TIER_META[activationTier]?.label || "Reference Only",
        safeDefaultMode: record.safeDefaultMode || (activationTier === "tier-0-active-core" ? "current-runtime" : "recognize-only"),
        extensions: Array.isArray(record.extensions) ? record.extensions : [],
        aliases: Array.isArray(record.aliases) ? record.aliases : [],
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base", numeric: true }));
}

async function loadAtlas() {
  let lastError;
  for (const candidate of ATLAS_CANDIDATES) {
    try {
      const response = await fetch(candidate, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const atlas = await response.json();
      if (!Array.isArray(atlas.languages) || atlas.languages.length === 0) {
        throw new Error("atlas has no language records");
      }
      return { atlas, candidate };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("language atlas could not be loaded");
}

function filteredLanguages() {
  const normalizedQuery = state.query.trim().toLocaleLowerCase();
  return state.languages.filter((language) => {
    const matchesQuery = !normalizedQuery || [language.name, language.familyLabel, language.tierLabel, ...language.aliases, ...language.extensions]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery);
    const matchesTier = state.tier === "all" || language.activationTier === state.tier;
    const matchesFamily = state.family === "all" || language.familyId === state.family;
    return matchesQuery && matchesTier && matchesFamily;
  });
}

function createFilterButton({ label, value, activeValue, attribute, count }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "atlas-filter";
  button.dataset[attribute] = value;
  button.setAttribute("aria-pressed", String(value === activeValue));
  button.textContent = count === undefined ? label : `${label} ${count}`;
  return button;
}

function renderTierFilters() {
  refs.tierFilters.replaceChildren();
  const counts = state.languages.reduce((accumulator, language) => {
    accumulator[language.activationTier] = (accumulator[language.activationTier] || 0) + 1;
    return accumulator;
  }, {});

  refs.tierFilters.append(createFilterButton({
    label: "All tiers",
    value: "all",
    activeValue: state.tier,
    attribute: "tierFilter",
    count: state.languages.length,
  }));

  Object.entries(TIER_META).forEach(([tierId, meta]) => {
    refs.tierFilters.append(createFilterButton({
      label: meta.shortLabel,
      value: tierId,
      activeValue: state.tier,
      attribute: "tierFilter",
      count: counts[tierId] || 0,
    }));
  });
}

function renderFamilyFilters() {
  refs.familyFilters.replaceChildren();
  const familyMap = new Map();
  state.languages.forEach((language) => {
    const current = familyMap.get(language.familyId) || { label: language.familyLabel, count: 0 };
    current.count += 1;
    familyMap.set(language.familyId, current);
  });

  refs.familyFilters.append(createFilterButton({
    label: "All families",
    value: "all",
    activeValue: state.family,
    attribute: "familyFilter",
  }));

  [...familyMap.entries()]
    .sort((left, right) => left[1].label.localeCompare(right[1].label))
    .forEach(([familyId, family]) => {
      refs.familyFilters.append(createFilterButton({
        label: family.label,
        value: familyId,
        activeValue: state.family,
        attribute: "familyFilter",
        count: family.count,
      }));
    });
}

function selectLanguage(language) {
  state.selectedName = language.name;
  localStorage.setItem(SELECTION_KEY, language.name);
  renderSelection(language);
  renderResults();
  window.dispatchEvent(new CustomEvent("seis:language-selected", { detail: language }));
}

function renderSelection(language) {
  refs.selected.replaceChildren();
  const dot = document.createElement("span");
  dot.className = "atlas-dot atlas-dot-large";
  dot.style.setProperty("--atlas-dot", language.color);

  const copy = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = language.name;
  const meta = document.createElement("span");
  meta.textContent = `${language.familyLabel} · ${language.tierLabel}`;
  copy.append(title, meta);

  const mode = document.createElement("span");
  mode.className = `atlas-state atlas-state-${TIER_META[language.activationTier]?.state || "reference"}`;
  mode.textContent = language.safeDefaultMode === "current-runtime" ? "Current runtime" : "Recognition mode";

  refs.selected.append(dot, copy, mode);
}

function createLanguageButton(language) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "atlas-language-row";
  button.dataset.languageName = language.name;
  button.setAttribute("aria-pressed", String(language.name === state.selectedName));

  const dot = document.createElement("span");
  dot.className = "atlas-dot";
  dot.style.setProperty("--atlas-dot", language.color);

  const copy = document.createElement("span");
  copy.className = "atlas-language-copy";
  const name = document.createElement("strong");
  name.textContent = language.name;
  const meta = document.createElement("small");
  meta.textContent = language.familyLabel;
  copy.append(name, meta);

  const tier = document.createElement("span");
  tier.className = `atlas-state atlas-state-${TIER_META[language.activationTier]?.state || "reference"}`;
  tier.textContent = TIER_META[language.activationTier]?.shortLabel || "Reference";

  button.append(dot, copy, tier);
  button.addEventListener("click", () => selectLanguage(language));
  return button;
}

function renderResults() {
  const filtered = filteredLanguages();
  const visible = filtered.slice(0, state.visibleCount);
  refs.results.replaceChildren(...visible.map(createLanguageButton));
  refs.resultCount.textContent = `${filtered.length} matching languages`;
  refs.empty.hidden = filtered.length !== 0;
  refs.loadMore.hidden = filtered.length <= visible.length;
  refs.loadMore.textContent = `Show ${Math.min(PAGE_SIZE, filtered.length - visible.length)} more`;
  refs.live.textContent = `${filtered.length} languages match the current filters.`;

  const selected = state.languages.find((language) => language.name === state.selectedName) || state.languages[0];
  if (selected) renderSelection(selected);
}

function resetVisibleCount() {
  state.visibleCount = PAGE_SIZE;
}

function bindEvents() {
  refs.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    resetVisibleCount();
    renderResults();
  });

  refs.search.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "Enter") return;
    const firstResult = refs.results.querySelector("button");
    if (firstResult) {
      event.preventDefault();
      firstResult.focus();
    }
  });

  refs.tierFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tier-filter]");
    if (!button) return;
    state.tier = button.dataset.tierFilter;
    resetVisibleCount();
    renderTierFilters();
    renderResults();
  });

  refs.familyFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-family-filter]");
    if (!button) return;
    state.family = button.dataset.familyFilter;
    resetVisibleCount();
    renderFamilyFilters();
    renderResults();
  });

  refs.results.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const buttons = [...refs.results.querySelectorAll("button")];
    const currentIndex = buttons.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = Math.min(buttons.length - 1, currentIndex + 1);
    if (event.key === "ArrowUp") nextIndex = Math.max(0, currentIndex - 1);
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = buttons.length - 1;
    buttons[nextIndex]?.focus();
  });

  refs.loadMore.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderResults();
  });
}

async function initialize() {
  if (!refs.root) return;
  refs.root.dataset.state = "loading";
  try {
    const { atlas, candidate } = await loadAtlas();
    state.atlas = atlas;
    state.languages = normalizeLanguages(atlas);
    refs.total.textContent = String(state.languages.length);
    refs.source.textContent = candidate.includes("generated") ? "GitHub Linguist generated atlas" : "Supplied selector seed atlas";
    renderTierFilters();
    renderFamilyFilters();
    bindEvents();
    renderResults();
    refs.root.dataset.state = "ready";
  } catch (error) {
    refs.root.dataset.state = "error";
    refs.resultCount.textContent = "Language atlas unavailable";
    refs.empty.hidden = false;
    refs.empty.textContent = "The local atlas could not be loaded. The rest of the SEIS language roadmap remains available.";
    refs.live.textContent = "Language atlas loading failed.";
    console.error("SEIS language atlas initialization failed", error);
  }
}

initialize();
