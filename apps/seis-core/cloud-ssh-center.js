const stateKey = "seis.cloud.ssh.center.v1";

const surfaces = [
  ["Local Browser Demo", "connected", "The UI, filters, local readiness log, and status labels are real browser behavior.", "localStorage", "no network"],
  ["GitHub Repository", "mock", "Repository source-of-truth posture is represented as mock status until live GitHub APIs are reviewed.", "review-needed", "no token"],
  ["Codespaces Workspace", "planned", "Codespaces is a future optional target and requires branch, secret, and rollback review.", "cloud workspace", "approval-needed"],
  ["Mac Independent Remote Runtime", "planned", "SEIS should keep working when this Mac is closed once an approved cloud runtime is active; this page does not prove that runtime.", "cloud runtime", "Codespaces can sleep"],
  ["Always-On Direct Cloud", "planned", "True 24/7 requires direct-cloud SSH, TCP reachability, SSH key auth, remote ssh-ai, SEIS repo, and remote Codex evidence.", "mobile-24x7 strict", "direct-cloud required"],
  ["SSH Connection", "disabled", "No SSH command is executed from this page. Real host access requires explicit approval.", "sshExecuted: false", "human gate"],
  ["Deployment Pipeline", "planned", "Deployments need owner, rollback, environment review, and CI evidence before activation.", "deployExecuted: false", "rollback first"],
  ["Environment Variables", "unknown", "This page does not read env files, browser secrets, shell profiles, or service accounts.", "credentialRead: false", "redacted"],
  ["Backups", "mock", "Backup status is demo metadata until a verified backup target and restore test exist.", "restore test needed", "no mutation"],
  ["System Health", "mock", "Health cards are local planning metadata, not live metrics from remote infrastructure.", "metadata-only", "not connected"],
  ["Provider Health", "unknown", "Cloud and AI providers remain unknown here unless backend health checks exist.", "backend-only future", "missing evidence"],
  ["Rollback Readiness", "planned", "Rollback needs owner, impact, command plan, recovery verification, and approval evidence.", "approval-needed", "no live run"]
];

const ownerInputs = [
  ["Always-on public VM endpoint", "unknown", "SEIS_SSH_HOST or SEIS_CLOUD_HOST", "owner input required"],
  ["SSH TCP port", "planned", "SEIS_SSH_PORT", "preserve existing port unless approved"],
  ["Runtime SSH user", "planned", "SEIS_SSH_USER", "least privilege account"],
  ["Local identity file path", "planned", "SEIS_SSH_IDENTITY_FILE", "local path only; key material never committed"],
  ["Remote SEIS repository directory", "planned", "SEIS_REMOTE_REPO_DIR", "no destructive sync"],
  ["Remote bootstrap runbook", "planned", "scripts/bootstrap-seis-ssh-mobile-direct-cloud.sh", "dry-run before mutation"],
  ["Rollback owner and console access", "unknown", "provider console / owner approval", "required before rollout"]
];

const acceptanceLadder = [
  ["profile-contract", "unknown", "npm run cloud:ssh:mobile-direct:profile", "configuration-only"],
  ["bootstrap-dry-run", "planned", "npm run cloud:ssh:mobile-direct:bootstrap:plan", "bootstrap-plan-only"],
  ["bootstrap-apply", "disabled", "npm run cloud:ssh:mobile-direct:bootstrap:apply", "remote-bootstrap"],
  ["ssh-config-plan", "planned", "npm run cloud:ssh:mobile-direct:config:plan", "config-plan-only"],
  ["ssh-config-install", "disabled", "npm run cloud:ssh:mobile-direct:config:install", "local-client-config"],
  ["readiness-probe", "disabled", "npm run cloud:ssh:mobile-direct:probe:strict", "runtime-readiness"],
  ["handoff-doctor", "disabled", "npm run cloud:ssh:mobile-direct:doctor:strict", "mobile-24x7-ready"],
  ["contract-guard", "connected", "npm run check:seis-ssh-mobile-direct-cloud", "governance-contract"]
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
    mobile24x7Ready: false,
    directCloudRequired: true,
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
  const continuity = mode === "codespaces-plan" ? "Mac-independent while cloud runtime stays awake; not 24/7" : "requires direct-cloud proof";
  return `
    <div><dt>Status</dt><dd>${status}</dd></div>
    <div><dt>Remote execution</dt><dd>${remote}</dd></div>
    <div><dt>24/7 continuity</dt><dd>${continuity}</dd></div>
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

function renderOwnerInputs() {
  const target = $("#owner-input-checklist");
  if (!target) return;
  target.innerHTML = ownerInputs.map(([label, status, field, boundary]) => `
    <article class="owner-input-card">
      <div class="card-topline">
        <h3>${label}</h3>
        <span class="status-pill ${status}">${status}</span>
      </div>
      <p>${field}</p>
      <div class="meta-row">
        <span class="meta-chip">${boundary}</span>
        <span class="meta-chip">secretStored: false</span>
        <span class="meta-chip">requiredFor24x7: true</span>
      </div>
    </article>`).join("");
}

function renderAcceptanceLadder() {
  const target = $("#acceptance-ladder");
  if (!target) return;
  target.innerHTML = acceptanceLadder.map(([id, status, command, claimScope], index) => `
    <article class="acceptance-step">
      <span class="step-index">${String(index + 1).padStart(2, "0")}</span>
      <div>
        <div class="card-topline">
          <h3>${id}</h3>
          <span class="status-pill ${status}">${status}</span>
        </div>
        <p>${command}</p>
        <div class="meta-row">
          <span class="meta-chip">${claimScope}</span>
          <span class="meta-chip">readyClaimBlockedUntilStrictDoctor: true</span>
        </div>
      </div>
    </article>`).join("");
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
      <small>remoteConnected: ${entry.remoteConnected}; sshExecuted: ${entry.sshExecuted}; deployExecuted: ${entry.deployExecuted}; credentialRead: ${entry.credentialRead}; mobile24x7Ready: ${entry.mobile24x7Ready}; directCloudRequired: ${entry.directCloudRequired}; serverPortChanged: ${entry.serverPortChanged}</small>
    </article>`).join("");
}

function setMode(mode) {
  $("#mode-select").value = mode;
  $("#profile-facts").innerHTML = factsFor(mode);
  $("#live-region").textContent = `${mode} selected. No remote connection, SSH, deployment, credential read, or server/port change occurred.`;
}

function render() {
  renderSurfaces();
  renderOwnerInputs();
  renderAcceptanceLadder();
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
  $("#live-region").textContent = `${entry.mode} readiness note recorded locally. remoteConnected: false; sshExecuted: false; deployExecuted: false; credentialRead: false; mobile24x7Ready: false; directCloudRequired: true; serverPortChanged: false.`;
});

render();
