const stateKey = "seis.cloud.ssh.center.v1";

const surfaces = [
  ["Local Browser Demo", "connected", "The UI, filters, local readiness log, and status labels are real browser behavior.", "localStorage", "no network"],
  ["GitHub Repository", "mock", "Repository source-of-truth posture is represented as mock status until live GitHub APIs are reviewed.", "review-needed", "no token"],
  ["Codespaces Workspace", "planned", "Codespaces is a future optional target and requires branch, secret, and rollback review.", "cloud workspace", "approval-needed"],
  ["SSH Connection", "disabled", "No SSH command is executed from this page. Real host access requires explicit approval.", "sshExecuted: false", "human gate"],
  ["Deployment Pipeline", "planned", "Deployments need owner, rollback, environment review, and CI evidence before activation.", "deployExecuted: false", "rollback first"],
  ["Environment Variables", "unknown", "This page does not read env files, browser secrets, shell profiles, or service accounts.", "credentialRead: false", "redacted"],
  ["Backups", "mock", "Backup status is demo metadata until a verified backup target and restore test exist.", "restore test needed", "no mutation"],
  ["System Health", "mock", "Health cards are local planning metadata, not live metrics from remote infrastructure.", "metadata-only", "not connected"],
  ["Provider Health", "unknown", "Cloud and AI providers remain unknown here unless backend health checks exist.", "backend-only future", "missing evidence"],
  ["Rollback Readiness", "planned", "Rollback needs owner, impact, command plan, recovery verification, and approval evidence.", "approval-needed", "no live run"]
];

let state = loadState();

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(stateKey)) || { filter: "all", log: [] };
  } catch {
    return { filter: "all", log: [] };
  }
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
}

function $(selector) {
  return document.querySelector(selector);
}

function recordLog(intent, mode) {
  const entry = {
    id: `cloud-note-${Date.now()}`,
    intent,
    mode,
    timestamp: new Date().toISOString(),
    remoteConnected: false,
    sshExecuted: false,
    deployExecuted: false,
    credentialRead: false,
    secretStored: false,
    serverPortChanged: false,
    rollbackRequired: true
  };
  state.log.unshift(entry);
  state.log = state.log.slice(0, 8);
  saveState();
  return entry;
}

function factsFor(mode) {
  const status = mode === "local-demo" ? "connected local UI" : mode;
  const remote = mode === "ssh-readiness" ? "disabled until approval" : "not connected";
  const deploy = mode === "deployment-plan" ? "planned only" : "not executed";
  return `
    <div><dt>Status</dt><dd>${status}</dd></div>
    <div><dt>Remote execution</dt><dd>${remote}</dd></div>
    <div><dt>Credential read</dt><dd>false</dd></div>
    <div><dt>Deployment</dt><dd>${deploy}</dd></div>
    <div><dt>Server / port</dt><dd>unchanged placeholder</dd></div>`;
}

function renderSurfaces() {
  const filter = state.filter || "all";
  $("#surface-grid").innerHTML = surfaces.map(([name, status, detail, signal, boundary]) => {
    const hidden = filter !== "all" && status !== filter;
    return `
      <article class="surface-card ${hidden ? "is-hidden" : ""}">
        <div class="card-topline">
          <h3>${name}</h3>
          <span class="status-pill ${status}">${status}</span>
        </div>
        <p>${detail}</p>
        <div class="meta-row">
          <span class="meta-chip">${signal}</span>
          <span class="meta-chip">${boundary}</span>
        </div>
      </article>`;
  }).join("");
}

function renderLog() {
  if (!state.log.length) {
    $("#evidence-log").innerHTML = `<article class="evidence-card"><strong>No local readiness notes yet.</strong><small>Record a note to produce browser-only evidence.</small></article>`;
    return;
  }
  $("#evidence-log").innerHTML = state.log.map((entry) => `
    <article class="evidence-card">
      <strong>${entry.mode}</strong>
      <p>${entry.intent}</p>
      <small>remoteConnected: ${entry.remoteConnected}; sshExecuted: ${entry.sshExecuted}; deployExecuted: ${entry.deployExecuted}; credentialRead: ${entry.credentialRead}; serverPortChanged: ${entry.serverPortChanged}</small>
    </article>`).join("");
}

function setMode(mode) {
  $("#mode-select").value = mode;
  $("#profile-facts").innerHTML = factsFor(mode);
  $("#live-region").textContent = `${mode} selected. No remote connection, SSH, deployment, credential read, or server/port change occurred.`;
}

function render() {
  renderSurfaces();
  renderLog();
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]");
  if (action?.dataset.action === "select-local") setMode("local-demo");
  if (action?.dataset.action === "select-codespaces") setMode("codespaces-plan");
  if (action?.dataset.action === "select-ssh") setMode("ssh-readiness");
  if (action?.dataset.action === "clear-log") {
    state.log = [];
    saveState();
    renderLog();
    $("#live-region").textContent = "Local readiness log cleared. Repository and remote infrastructure were not changed.";
  }
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    state.filter = filter.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("is-active", button === filter));
    saveState();
    renderSurfaces();
  }
});

$("#readiness-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const intent = String(data.get("intent") || "").trim();
  const mode = String(data.get("mode") || "local-demo");
  if (!intent) return;
  const entry = recordLog(intent, mode);
  setMode(mode);
  renderLog();
  $("#live-region").textContent = `${entry.mode} readiness note recorded locally. remoteConnected: false; sshExecuted: false; deployExecuted: false; credentialRead: false; serverPortChanged: false.`;
});

render();
