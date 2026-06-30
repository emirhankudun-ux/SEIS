const STORE_KEY = "seis.store.music.center.v1";

const safetyFlags = Object.freeze({
  paymentExecuted: false,
  licenseIssued: false,
  streamingStarted: false,
  networkRequested: false,
});

const catalog = [
  {
    id: "seis-code-pack",
    name: "SEIS Code Pack",
    category: "developer",
    kind: "Developer tools",
    version: "0.9.0-demo",
    accent: "DEV",
    summary: "Command palette, safe snippets, code review rituals, and PR handoff templates for SEIS Code.",
    status: "available",
  },
  {
    id: "design-studio-kit",
    name: "Design Studio Kit",
    category: "design",
    kind: "Design tools",
    version: "1.2.0-demo",
    accent: "DSN",
    summary: "Tokens, component cards, motion rails, and prototype notes for the SEIS Design Studio.",
    status: "available",
  },
  {
    id: "architect-agent",
    name: "Architect Agent",
    category: "agent",
    kind: "AI Agents",
    version: "0.5.0-demo",
    accent: "ARC",
    summary: "Plans scoped implementation slices with explicit allowed actions and review gates.",
    status: "available",
  },
  {
    id: "security-agent",
    name: "Security Agent",
    category: "agent",
    kind: "AI Agents",
    version: "0.5.0-demo",
    accent: "SEC",
    summary: "Surfaces no-secret, no-credential, no-host-execution, and approval-needed states.",
    status: "available",
  },
  {
    id: "reference-vault-plugin",
    name: "Reference Vault Plugin",
    category: "plugin",
    kind: "Plugins",
    version: "0.7.0-demo",
    accent: "REF",
    summary: "Presents supplied reference modules as preserved, reviewable demo inspiration surfaces.",
    status: "update",
  },
  {
    id: "aurora-graphite-theme",
    name: "Aurora Graphite Theme",
    category: "theme",
    kind: "Themes",
    version: "1.0.0-demo",
    accent: "AUR",
    summary: "A restrained graphite, cyan, violet, and amber visual theme for cinematic SEIS workspaces.",
    status: "available",
  },
  {
    id: "seis-cloud-console",
    name: "SEIS Cloud Console",
    category: "app",
    kind: "Apps",
    version: "0.3.0-demo",
    accent: "CLD",
    summary: "Cloud, SSH, logs, health, and deployment status concepts with live access blocked by default.",
    status: "available",
  },
  {
    id: "music-focus-room",
    name: "Music Focus Room",
    category: "app",
    kind: "Apps",
    version: "0.4.0-demo",
    accent: "MUS",
    summary: "A local-first creative listening surface with simulated queues and AI recommendations mock mode.",
    status: "installed",
  },
];

const playlists = [
  {
    id: "deep-work",
    title: "Deep Work Runway",
    mood: "Calm cinematic engineering",
    tracks: ["boot-sequence", "graphite-loop", "night-compiler"],
  },
  {
    id: "design-lab",
    title: "Design Lab Atmosphere",
    mood: "Soft motion, editorial spacing",
    tracks: ["token-garden", "glass-grid", "quiet-prototype"],
  },
  {
    id: "launch-mode",
    title: "Launch Mode",
    mood: "Focused product demo energy",
    tracks: ["release-window", "agent-handoff", "go-no-go"],
  },
];

const tracks = [
  { id: "boot-sequence", title: "Boot Sequence", artist: "SEIS Demo Ensemble", duration: 154, recommendation: "For opening the OS shell." },
  { id: "graphite-loop", title: "Graphite Loop", artist: "Creative Systems Lab", duration: 188, recommendation: "For coding and review focus." },
  { id: "night-compiler", title: "Night Compiler", artist: "SEIS Code", duration: 202, recommendation: "For slow, precise implementation." },
  { id: "token-garden", title: "Token Garden", artist: "SEIS Design", duration: 176, recommendation: "For design token inspection." },
  { id: "glass-grid", title: "Glass Grid", artist: "Motion Desk", duration: 194, recommendation: "For layout work and visual QA." },
  { id: "quiet-prototype", title: "Quiet Prototype", artist: "Design Studio", duration: 165, recommendation: "For prototype iteration." },
  { id: "release-window", title: "Release Window", artist: "SEIS Cloud", duration: 214, recommendation: "For deployment planning." },
  { id: "agent-handoff", title: "Agent Handoff", artist: "Agent Workforce", duration: 181, recommendation: "For multi-agent review rituals." },
  { id: "go-no-go", title: "Go / No-Go", artist: "Quality Governance", duration: 199, recommendation: "For final demo readiness checks." },
];

const fallbackState = {
  activeTab: "store",
  category: "all",
  query: "",
  selectedPackage: "seis-code-pack",
  packages: Object.fromEntries(catalog.map((item) => [item.id, {
    installed: item.status === "installed",
    enabled: item.status === "installed",
    updateAvailable: item.status === "update",
  }])),
  activePlaylist: "deep-work",
  activeTrack: "boot-sequence",
  playing: false,
  progress: 0,
};

let state = loadState();
let progressTimer = null;

const tabButtons = document.querySelectorAll("[data-tab]");
const tabPanels = document.querySelectorAll(".tab-panel");
const catalogGrid = document.querySelector("#catalogGrid");
const storeSearch = document.querySelector("#storeSearch");
const installSummary = document.querySelector("#installSummary");
const storeDetailTitle = document.querySelector("#store-detail-title");
const storeDetailMeta = document.querySelector("#storeDetailMeta");
const storeDetailBody = document.querySelector("#storeDetailBody");
const playlistGrid = document.querySelector("#playlistGrid");
const trackList = document.querySelector("#trackList");
const trackTitle = document.querySelector("#trackTitle");
const trackArtist = document.querySelector("#trackArtist");
const playState = document.querySelector("#playState");
const progressBar = document.querySelector("#progressBar");
const elapsedTime = document.querySelector("#elapsedTime");
const durationTime = document.querySelector("#durationTime");
const playPause = document.querySelector("#playPause");

function loadState() {
  try {
    const cached = localStorage.getItem(STORE_KEY);
    if (!cached) return structuredClone(fallbackState);
    const parsed = JSON.parse(cached);
    return {
      ...structuredClone(fallbackState),
      ...parsed,
      packages: { ...fallbackState.packages, ...(parsed.packages || {}) },
    };
  } catch {
    return structuredClone(fallbackState);
  }
}

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ ...state, safetyFlags }));
}

function visibleCatalog() {
  const query = state.query.trim().toLowerCase();
  return catalog.filter((item) => {
    const matchesCategory = state.category === "all" || item.category === state.category;
    const haystack = `${item.name} ${item.kind} ${item.summary}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
}

function renderTabs() {
  tabButtons.forEach((button) => {
    const active = button.dataset.tab === state.activeTab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  tabPanels.forEach((panel) => {
    const active = panel.id === `${state.activeTab}Panel`;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
}

function renderCatalog() {
  storeSearch.value = state.query;
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === state.category);
  });

  const installedCount = Object.values(state.packages).filter((pkg) => pkg.installed).length;
  installSummary.textContent = `${installedCount} installed`;

  const items = visibleCatalog();
  if (!items.length) {
    catalogGrid.innerHTML = '<p class="muted">No demo packages match this filter.</p>';
    return;
  }

  catalogGrid.innerHTML = items.map((item) => {
    const packageState = state.packages[item.id] || fallbackState.packages[item.id];
    const statusLabel = packageState.installed ? (packageState.enabled ? "Enabled" : "Installed") : "Available";
    const updateLabel = packageState.updateAvailable ? "Update ready" : "Current";
    const primaryLabel = packageState.installed ? (packageState.enabled ? "Disable" : "Enable") : "Install";
    const secondaryLabel = packageState.updateAvailable ? "Update" : "Details";
    return `
      <article class="catalog-card" tabindex="0" data-package="${item.id}" aria-selected="${state.selectedPackage === item.id}">
        <span class="package-icon" aria-hidden="true">${escapeHtml(item.accent)}</span>
        <div>
          <p class="eyebrow">${escapeHtml(item.kind)}</p>
          <h3>${escapeHtml(item.name)}</h3>
        </div>
        <p>${escapeHtml(item.summary)}</p>
        <div class="status-row">
          <span class="status-pill real">${escapeHtml(statusLabel)}</span>
          <span class="status-pill mock">${escapeHtml(updateLabel)}</span>
        </div>
        <div class="card-actions">
          <button class="action-button primary" type="button" data-action="toggle" data-package="${item.id}">${primaryLabel}</button>
          <button class="secondary-button" type="button" data-action="secondary" data-package="${item.id}">${secondaryLabel}</button>
        </div>
      </article>`;
  }).join("");
}

function renderPackageDetail() {
  const selected = catalog.find((item) => item.id === state.selectedPackage);
  if (!selected) return;

  const packageState = state.packages[selected.id] || fallbackState.packages[selected.id];
  storeDetailTitle.textContent = selected.name;
  storeDetailMeta.textContent = `${selected.kind} / ${selected.version} / browser-local state`;
  storeDetailBody.innerHTML = `
    <p>${escapeHtml(selected.summary)}</p>
    <p><strong>Status:</strong> ${packageState.installed ? "Installed" : "Available"} / ${packageState.enabled ? "Enabled" : "Disabled"} / ${packageState.updateAvailable ? "Update ready" : "Current"}</p>
    <p><strong>Safety:</strong> install actions update local demo metadata only. No payment, license issue, download, extension runtime, or network request occurs.</p>`;
}

function renderPlaylists() {
  playlistGrid.innerHTML = playlists.map((playlist) => `
    <button class="playlist-card" type="button" data-playlist="${playlist.id}" aria-pressed="${playlist.id === state.activePlaylist}">
      <span class="status-pill ${playlist.id === state.activePlaylist ? "real" : "mock"}">${playlist.tracks.length} tracks</span>
      <strong>${escapeHtml(playlist.title)}</strong>
      <small>${escapeHtml(playlist.mood)}</small>
    </button>`).join("");
}

function activePlaylistTracks() {
  const playlist = playlists.find((item) => item.id === state.activePlaylist) || playlists[0];
  return playlist.tracks.map((trackId) => tracks.find((track) => track.id === trackId)).filter(Boolean);
}

function currentTrack() {
  return tracks.find((track) => track.id === state.activeTrack) || activePlaylistTracks()[0] || tracks[0];
}

function renderTracks() {
  trackList.innerHTML = activePlaylistTracks().map((track, index) => `
    <button class="track-row" type="button" data-track="${track.id}" aria-selected="${track.id === state.activeTrack}">
      <span>
        <strong>${index + 1}. ${escapeHtml(track.title)}</strong><br />
        <small>${escapeHtml(track.artist)} / ${escapeHtml(track.recommendation)}</small>
      </span>
      <small>${formatTime(track.duration)}</small>
    </button>`).join("");
}

function renderPlayer() {
  const track = currentTrack();
  const progress = Math.min(state.progress, track.duration);
  const percent = track.duration ? (progress / track.duration) * 100 : 0;
  trackTitle.textContent = track.title;
  trackArtist.textContent = `${track.artist} / ${track.recommendation}`;
  playState.textContent = state.playing ? "Playing" : "Paused";
  playState.className = state.playing ? "status-pill real" : "status-pill mock";
  playPause.textContent = state.playing ? "Pause" : "Play";
  progressBar.style.width = `${percent}%`;
  elapsedTime.textContent = formatTime(progress);
  durationTime.textContent = formatTime(track.duration);
  document.body.classList.toggle("playing", state.playing);
}

function renderAll() {
  renderTabs();
  renderCatalog();
  renderPackageDetail();
  renderPlaylists();
  renderTracks();
  renderPlayer();
  persist();
  syncTimer();
}

function selectPackage(id) {
  state.selectedPackage = id;
  state.activeTab = "store";
  renderAll();
}

function togglePackage(id) {
  const packageState = state.packages[id] || { installed: false, enabled: false, updateAvailable: false };
  if (!packageState.installed) {
    packageState.installed = true;
    packageState.enabled = true;
  } else {
    packageState.enabled = !packageState.enabled;
  }
  state.packages[id] = packageState;
  state.selectedPackage = id;
  renderAll();
}

function secondaryPackageAction(id) {
  const packageState = state.packages[id] || { installed: false, enabled: false, updateAvailable: false };
  if (packageState.updateAvailable) {
    packageState.updateAvailable = false;
    packageState.installed = true;
    packageState.enabled = true;
  }
  state.packages[id] = packageState;
  state.selectedPackage = id;
  renderAll();
}

function setPlaylist(id) {
  const playlist = playlists.find((entry) => entry.id === id);
  if (!playlist) return;
  state.activePlaylist = id;
  state.activeTrack = playlist.tracks[0];
  state.progress = 0;
  state.playing = true;
  state.activeTab = "music";
  renderAll();
}

function setTrack(id) {
  if (!tracks.some((track) => track.id === id)) return;
  state.activeTrack = id;
  state.progress = 0;
  state.playing = true;
  renderAll();
}

function playPrevious() {
  const queue = activePlaylistTracks();
  const index = queue.findIndex((track) => track.id === state.activeTrack);
  const previous = queue[(index - 1 + queue.length) % queue.length] || queue[0];
  setTrack(previous.id);
}

function playNext() {
  const queue = activePlaylistTracks();
  const index = queue.findIndex((track) => track.id === state.activeTrack);
  const next = queue[(index + 1) % queue.length] || queue[0];
  setTrack(next.id);
}

function syncTimer() {
  window.clearInterval(progressTimer);
  progressTimer = null;
  if (!state.playing) return;
  progressTimer = window.setInterval(() => {
    const track = currentTrack();
    state.progress += 1;
    if (state.progress >= track.duration) {
      playNext();
      return;
    }
    renderPlayer();
    persist();
  }, 1000);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.activeTab = button.dataset.tab;
    renderAll();
  });
});

document.querySelectorAll("[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    state.category = button.dataset.category;
    renderAll();
  });
});

storeSearch.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderAll();
});

catalogGrid.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    if (actionButton.dataset.action === "toggle") togglePackage(actionButton.dataset.package);
    if (actionButton.dataset.action === "secondary") secondaryPackageAction(actionButton.dataset.package);
    return;
  }

  const card = event.target.closest("[data-package]");
  if (card) selectPackage(card.dataset.package);
});

catalogGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-package]");
  if (!card) return;
  event.preventDefault();
  selectPackage(card.dataset.package);
});

playlistGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-playlist]");
  if (card) setPlaylist(card.dataset.playlist);
});

trackList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-track]");
  if (row) setTrack(row.dataset.track);
});

document.querySelector("#previousTrack").addEventListener("click", playPrevious);
document.querySelector("#nextTrack").addEventListener("click", playNext);
playPause.addEventListener("click", () => {
  state.playing = !state.playing;
  renderAll();
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    state.activeTab = "store";
    renderAll();
    storeSearch.focus();
  }

  if (event.code === "Space" && document.activeElement === document.body) {
    event.preventDefault();
    state.playing = !state.playing;
    renderAll();
  }
});

renderAll();
