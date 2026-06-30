const STORE_KEY = "seis.design.studio.center.v1";

const safetyFlags = Object.freeze({
  providerCallStarted: false,
  assetUploaded: false,
  exportWritten: false,
  networkRequested: false,
});

const layers = [
  { id: "hero-card", name: "Hero Card", kind: "Frame", note: "Primary product message and glass panel." },
  { id: "headline", name: "Headline", kind: "Text", note: "Editorial headline scale and hierarchy." },
  { id: "body-copy", name: "Body Copy", kind: "Text", note: "Readable local-first product explanation." },
  { id: "actions", name: "Action Buttons", kind: "Component", note: "Prototype CTAs with accessible focus states." },
  { id: "orbits", name: "Atmosphere Orbits", kind: "Decoration", note: "Subtle depth and visual motion without clutter." },
];

const components = [
  { id: "command-card", name: "Command Card", use: "Launch SEIS modules", status: "Ready" },
  { id: "token-panel", name: "Token Panel", use: "Inspect system values", status: "Ready" },
  { id: "review-pill", name: "Review Pill", use: "Show real/mock/blocked states", status: "Ready" },
  { id: "prototype-frame", name: "Prototype Frame", use: "Preview handoff states", status: "Draft" },
];

const suggestions = [
  { id: "reduce-glare", title: "Reduce glare", body: "Lower glass depth and keep contrast stable for mobile review." },
  { id: "tighten-type", title: "Tighten type rhythm", body: "Use compact scale for dense inspector panels and editorial scale for hero moments." },
  { id: "raise-readiness", title: "Raise readiness state", body: "Switch accent to green only when a module is verified, not merely planned." },
];

const stateCopy = {
  overview: {
    headline: "Design with calm precision.",
    body: "A local-first creative surface for tokens, components, motion notes, and review-ready product design.",
  },
  handoff: {
    headline: "Handoff without ambiguity.",
    body: "Every token, component, and status label stays tied to a reviewable browser-local contract.",
  },
  review: {
    headline: "Review the real, mock, and blocked states.",
    body: "The studio labels safe mock behavior directly instead of hiding it behind decorative product language.",
  },
  launch: {
    headline: "Prepare the demo path before public launch.",
    body: "Export preview is a local contract only; live sync or asset pipelines require separate approval.",
  },
};

const fallbackState = {
  selectedLayer: "hero-card",
  selectedComponent: "command-card",
  accent: "cyan",
  typeScale: "editorial",
  radius: 28,
  depth: 28,
  prototypeState: "overview",
  snapshots: [],
  exportPreview: "No export prepared yet. Use Prepare export to generate a local contract preview.",
};

let state = loadState();

const layerList = document.querySelector("#layerList");
const componentCards = document.querySelector("#componentCards");
const assistantCards = document.querySelector("#assistantCards");
const selectedLayerPill = document.querySelector("#selectedLayerPill");
const accentSelect = document.querySelector("#accentSelect");
const typeScaleSelect = document.querySelector("#typeScaleSelect");
const radiusRange = document.querySelector("#radiusRange");
const depthRange = document.querySelector("#depthRange");
const accentToken = document.querySelector("#accentToken");
const typeToken = document.querySelector("#typeToken");
const radiusToken = document.querySelector("#radiusToken");
const depthToken = document.querySelector("#depthToken");
const prototypeCard = document.querySelector("#prototypeCard");
const prototypeHeadline = document.querySelector("#prototypeHeadline");
const prototypeBody = document.querySelector("#prototypeBody");
const prototypeState = document.querySelector("#prototypeState");
const statusFeed = document.querySelector("#statusFeed");
const exportPreview = document.querySelector("#exportPreview");

function loadState() {
  try {
    const cached = localStorage.getItem(STORE_KEY);
    if (!cached) return structuredClone(fallbackState);
    return { ...structuredClone(fallbackState), ...JSON.parse(cached) };
  } catch {
    return structuredClone(fallbackState);
  }
}

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ ...state, safetyFlags }));
}

function accentValue(name) {
  return {
    cyan: "#67e8ff",
    violet: "#a78bfa",
    amber: "#ffc56d",
    green: "#8fffd2",
  }[name] || "#67e8ff";
}

function accentLabel(name) {
  return {
    cyan: "Cyan Glass",
    violet: "Violet Signal",
    amber: "Amber Review",
    green: "Green Ready",
  }[name] || "Cyan Glass";
}

function renderLayers() {
  layerList.innerHTML = layers.map((layer) => `
    <button class="layer-button" type="button" data-layer="${layer.id}" aria-selected="${layer.id === state.selectedLayer}">
      <span class="status-pill ${layer.id === state.selectedLayer ? "real" : "mock"}">${escapeHtml(layer.kind)}</span>
      <strong>${escapeHtml(layer.name)}</strong>
      <small>${escapeHtml(layer.note)}</small>
    </button>`).join("");

  const selected = layers.find((layer) => layer.id === state.selectedLayer) || layers[0];
  selectedLayerPill.textContent = selected.name;
}

function renderComponents() {
  componentCards.innerHTML = components.map((component) => `
    <button class="component-card" type="button" data-component="${component.id}" aria-selected="${component.id === state.selectedComponent}">
      <span class="status-pill ${component.status === "Ready" ? "real" : "mock"}">${escapeHtml(component.status)}</span>
      <strong>${escapeHtml(component.name)}</strong>
      <small>${escapeHtml(component.use)}</small>
    </button>`).join("");
}

function renderAssistant() {
  assistantCards.innerHTML = suggestions.map((suggestion) => `
    <article class="assistant-card">
      <span class="status-pill mock">Mock suggestion</span>
      <strong>${escapeHtml(suggestion.title)}</strong>
      <small>${escapeHtml(suggestion.body)}</small>
    </article>`).join("");
}

function renderControls() {
  accentSelect.value = state.accent;
  typeScaleSelect.value = state.typeScale;
  radiusRange.value = state.radius;
  depthRange.value = state.depth;
  accentToken.textContent = accentLabel(state.accent);
  typeToken.textContent = state.typeScale.charAt(0).toUpperCase() + state.typeScale.slice(1);
  radiusToken.textContent = `${state.radius}px`;
  depthToken.textContent = `${state.depth}px`;
}

function renderCanvas() {
  document.documentElement.style.setProperty("--accent", accentValue(state.accent));
  document.documentElement.style.setProperty("--radius-live", `${state.radius}px`);
  document.documentElement.style.setProperty("--depth-live", `${state.depth}px`);
  prototypeCard.classList.toggle("type-compact", state.typeScale === "compact");
  prototypeCard.classList.toggle("type-poster", state.typeScale === "poster");
  const copy = stateCopy[state.prototypeState] || stateCopy.overview;
  prototypeHeadline.textContent = copy.headline;
  prototypeBody.textContent = copy.body;
  prototypeState.textContent = state.prototypeState.charAt(0).toUpperCase() + state.prototypeState.slice(1);
  document.querySelectorAll("[data-state]").forEach((button) => {
    button.classList.toggle("active", button.dataset.state === state.prototypeState);
  });
  exportPreview.textContent = state.exportPreview;
}

function renderAll() {
  renderLayers();
  renderComponents();
  renderAssistant();
  renderControls();
  renderCanvas();
  persist();
}

function updateStatus(message) {
  statusFeed.textContent = message;
}

function setLayer(id) {
  state.selectedLayer = id;
  const layer = layers.find((item) => item.id === id);
  updateStatus(`Selected layer: ${layer ? layer.name : id}. Browser-local selection only.`);
  renderAll();
}

function setComponent(id) {
  state.selectedComponent = id;
  const component = components.find((item) => item.id === id);
  updateStatus(`Selected component: ${component ? component.name : id}. No external library sync performed.`);
  renderAll();
}

function saveSnapshot() {
  const snapshot = {
    id: `snapshot-${Date.now()}`,
    selectedLayer: state.selectedLayer,
    selectedComponent: state.selectedComponent,
    accent: state.accent,
    typeScale: state.typeScale,
    radius: state.radius,
    depth: state.depth,
    prototypeState: state.prototypeState,
    safetyFlags,
  };
  state.snapshots = [snapshot, ...state.snapshots].slice(0, 5);
  updateStatus(`Saved browser-local snapshot ${state.snapshots.length}. Host filesystem unchanged.`);
  renderAll();
}

function prepareExport() {
  const contract = {
    type: "seis-design-studio-local-export-preview",
    writtenToDisk: false,
    uploaded: false,
    providerCallStarted: false,
    networkRequested: false,
    tokens: {
      accent: accentLabel(state.accent),
      typeScale: state.typeScale,
      radius: `${state.radius}px`,
      depth: `${state.depth}px`,
    },
    selectedLayer: state.selectedLayer,
    selectedComponent: state.selectedComponent,
    prototypeState: state.prototypeState,
  };
  state.exportPreview = JSON.stringify(contract, null, 2);
  updateStatus("Prepared local export contract preview. No file write, upload, or provider call occurred.");
  renderAll();
}

function applyAiSuggestion() {
  if (state.depth > 18) state.depth = Math.max(18, Number(state.depth) - 6);
  if (state.radius < 34) state.radius = Math.min(34, Number(state.radius) + 2);
  state.typeScale = state.typeScale === "poster" ? "editorial" : state.typeScale;
  updateStatus("Applied deterministic mock AI design suggestion locally. No provider call occurred.");
  renderAll();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

layerList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-layer]");
  if (button) setLayer(button.dataset.layer);
});

componentCards.addEventListener("click", (event) => {
  const button = event.target.closest("[data-component]");
  if (button) setComponent(button.dataset.component);
});

accentSelect.addEventListener("change", (event) => {
  state.accent = event.target.value;
  updateStatus(`Accent token changed to ${accentLabel(state.accent)}.`);
  renderAll();
});

typeScaleSelect.addEventListener("change", (event) => {
  state.typeScale = event.target.value;
  updateStatus(`Typography scale changed to ${state.typeScale}.`);
  renderAll();
});

radiusRange.addEventListener("input", (event) => {
  state.radius = Number(event.target.value);
  renderAll();
});

depthRange.addEventListener("input", (event) => {
  state.depth = Number(event.target.value);
  renderAll();
});

document.querySelectorAll("[data-state]").forEach((button) => {
  button.addEventListener("click", () => {
    state.prototypeState = button.dataset.state;
    updateStatus(`Prototype state changed to ${state.prototypeState}.`);
    renderAll();
  });
});

document.querySelector("#saveSnapshot").addEventListener("click", saveSnapshot);
document.querySelector("#prepareExport").addEventListener("click", prepareExport);
document.querySelector("#applyAiSuggestion").addEventListener("click", applyAiSuggestion);

renderAll();
