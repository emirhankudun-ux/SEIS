const stateKey = "seis.cloud.ssh.center.v1";
const readyClaim = "SEIS-SSH is ChatGPT mobile/Codex 24x7 ready";
const readyClaimAllowedOnlyWhen = [
  "SEIS-SSH resolves to direct-cloud SSH without ProxyCommand",
  "TCP reachability succeeds against the configured public SSH endpoint",
  "SSH key authentication succeeds in BatchMode",
  "remote runtime reports online",
  "SEIS repository is present on the remote host",
  "strict doctor writes a successful readiness handoff report"
];
const blockedClaimWhen = [
  "SEIS_SSH_HOST is missing",
  "SEIS-SSH still uses Codespaces transport",
  "SEIS-SSH points at localhost or the local Mac",
  "public SSH endpoint is unreachable",
  "identity file is missing",
  "SSH authentication fails",
  "remote runtime or SSH-AI daemon is offline",
  "strict doctor exits non-zero"
];
const continuityClaim = "SEIS remains reachable when the local Mac is closed";
const continuityAllowedOnlyWhen = readyClaimAllowedOnlyWhen;
const blockedContinuityWhen = [
  "SEIS-SSH still depends on localhost or this Mac",
  "SEIS-SSH still uses Codespaces transport",
  "no always-on public VM endpoint is configured",
  "strict doctor has not written a passing mobile readiness report"
];

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

const handoffChecklist = [
  ["device-independent-entrypoint", "disabled", "Single SEIS-SSH alias", "no local Mac dependency"],
  ["always-on-cloud-endpoint", "unknown", "Always-on cloud endpoint", "owner input required"],
  ["remote-runtime-ready", "disabled", "Remote runtime ready", "strict probe required"],
  ["handoff-report-written", "disabled", "Reusable handoff report", "strict doctor required"],
  ["secret-boundary-preserved", "connected", "Secret boundary preserved", "git-safe reports"],
  ["new-device-replayable", "planned", "New-device replayable", "documented runbook"]
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

function renderHandoffChecklist() {
  const target = $("#mobile-handoff-checklist");
  if (!target) return;
  target.innerHTML = handoffChecklist.map(([id, status, label, boundary]) => `
    <article class="handoff-card">
      <div class="card-topline">
        <h3>${label}</h3>
        <span class="status-pill ${status}">${status}</span>
      </div>
      <p>${id}</p>
      <div class="meta-row">
        <span class="meta-chip">${boundary}</span>
        <span class="meta-chip">blockingIfMissing: true</span>
      </div>
    </article>`).join("");
}

function buildClaimGuard() {
  const finalGate = acceptanceLadder.find(([id]) => id === "handoff-doctor");
  return {
    id: "seis-cloud-ssh-center-ready-claim-guard",
    sourceLedger: "content/development/seis-ssh-mobile-direct-cloud-acceptance-ledger.json",
    readyClaim,
    readyClaimAllowedOnlyWhen,
    blockedClaimWhen,
    status: "blocked",
    readyClaimAllowed: false,
    claimAllowedByDefault: false,
    mobile24x7ReadyByDefault: false,
    allowedOnlyAfterStep: "handoff-doctor",
    allowedOnlyAfterCommand: finalGate?.[2] || "npm run cloud:ssh:mobile-direct:doctor:strict",
    allowedOnlyAfterClaimScope: finalGate?.[3] || "mobile-24x7-ready",
    currentKnownBlocker: "mobile-24x7-requires-direct-cloud-transport",
    finalGateCommand: finalGate?.[2] || "npm run cloud:ssh:mobile-direct:doctor:strict",
    blockingHandoffItems: handoffChecklist.filter(([, status]) => status !== "connected").length,
    unresolvedOwnerInputs: ownerInputs.filter(([, status]) => status !== "connected").length,
    remoteMutationAllowed: false,
    credentialRead: false,
    secretStored: false
  };
}

function renderClaimGuard() {
  const target = $("#claim-guard-grid");
  if (!target) return;
  const guard = buildClaimGuard();
  const cards = [
    ["Ready claim", guard.readyClaim, "blocked"],
    ["Current blocker", guard.currentKnownBlocker, "direct-cloud required"],
    ["Final gate", guard.finalGateCommand, "strict doctor only"],
    ["Open handoff items", String(guard.blockingHandoffItems), "blockingIfMissing: true"]
  ];
  target.innerHTML = cards.map(([label, value, boundary]) => `
    <article class="claim-guard-card">
      <div class="card-topline">
        <h3>${label}</h3>
        <span class="status-pill disabled">${guard.status}</span>
      </div>
      <p>${value}</p>
      <div class="meta-row">
        <span class="meta-chip">${boundary}</span>
        <span class="meta-chip">readyClaimAllowed: ${guard.readyClaimAllowed}</span>
        <span class="meta-chip">claimAllowedByDefault: ${guard.claimAllowedByDefault}</span>
      </div>
    </article>`).join("");
}

function buildContinuityGuard() {
  const finalGate = acceptanceLadder.find(([id]) => id === "handoff-doctor");
  return {
    id: "seis-cloud-ssh-center-continuity-guard",
    sourceLedger: "content/development/seis-ssh-mobile-direct-cloud-acceptance-ledger.json",
    continuityClaim,
    continuityAllowedOnlyWhen,
    blockedContinuityWhen,
    status: "blocked",
    continuityClaimAllowed: false,
    macOffClaimAllowed: false,
    localMacDependencyAllowed: false,
    codespacesContinuityAllowed: false,
    browserLocalProofAllowed: false,
    allowedOnlyAfterStep: "handoff-doctor",
    allowedOnlyAfterCommand: finalGate?.[2] || "npm run cloud:ssh:mobile-direct:doctor:strict",
    allowedOnlyAfterClaimScope: finalGate?.[3] || "mobile-24x7-ready",
    currentKnownBlocker: "mobile-24x7-requires-direct-cloud-transport",
    finalGateCommand: finalGate?.[2] || "npm run cloud:ssh:mobile-direct:doctor:strict",
    blockingHandoffItems: handoffChecklist.filter(([, status]) => status !== "connected").length,
    unresolvedOwnerInputs: ownerInputs.filter(([, status]) => status !== "connected").length,
    remoteMutationAllowed: false,
    credentialRead: false,
    secretStored: false
  };
}

function renderContinuityGuard() {
  const target = $("#continuity-guard-grid");
  if (!target) return;
  const guard = buildContinuityGuard();
  const cards = [
    ["Mac-off claim", guard.continuityClaim, "blocked"],
    ["Local Mac dependency", `allowed: ${guard.localMacDependencyAllowed}`, "direct-cloud only"],
    ["Codespaces boundary", `allowed: ${guard.codespacesContinuityAllowed}`, "Codespaces can sleep"],
    ["Final gate", guard.finalGateCommand, "strict doctor only"]
  ];
  target.innerHTML = cards.map(([label, value, boundary]) => `
    <article class="continuity-guard-card">
      <div class="card-topline">
        <h3>${label}</h3>
        <span class="status-pill disabled">${guard.status}</span>
      </div>
      <p>${value}</p>
      <div class="meta-row">
        <span class="meta-chip">${boundary}</span>
        <span class="meta-chip">macOffClaimAllowed: ${guard.macOffClaimAllowed}</span>
        <span class="meta-chip">browserLocalProofAllowed: ${guard.browserLocalProofAllowed}</span>
      </div>
    </article>`).join("");
}

function buildHandoffPacket() {
  return {
    id: "seis-cloud-ssh-center-mobile-handoff-packet",
    status: "browser-local-demo",
    generatedAt: new Date().toISOString(),
    currentKnownBlocker: "mobile-24x7-requires-direct-cloud-transport",
    remoteConnected: false,
    sshExecuted: false,
    deployExecuted: false,
    credentialRead: false,
    secretStored: false,
    serverPortChanged: false,
    mobile24x7Ready: false,
    directCloudRequired: true,
    browserLocalReadyClaimGuard: buildClaimGuard(),
    browserLocalContinuityGuard: buildContinuityGuard(),
    ownerInputs: ownerInputs.map(([label, status, field, boundary]) => ({ label, status, field, boundary, secret: false })),
    acceptanceLadder: acceptanceLadder.map(([id, status, command, claimScope]) => ({ id, status, command, claimScope })),
    mobileHandoffChecklist: handoffChecklist.map(([id, status, label, boundary]) => ({ id, status, label, boundary, blockingIfMissing: true })),
    localEvidenceNotes: state.log.length
  };
}

function renderHandoffPacket() {
  const target = $("#handoff-packet");
  if (!target) return;
  target.textContent = JSON.stringify(buildHandoffPacket(), null, 2);
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
  renderHandoffChecklist();
  renderHandoffPacket();
  renderClaimGuard();
  renderContinuityGuard();
  renderLog();
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]");
  if (action?.dataset.action === "select-local") setMode("local-demo");
  if (action?.dataset.action === "select-codespaces") setMode("codespaces-plan");
  if (action?.dataset.action === "select-ssh") setMode("ssh-readiness");
  if (action?.dataset.action === "refresh-packet") {
    renderHandoffPacket();
    renderClaimGuard();
    renderContinuityGuard();
    $("#live-region").textContent = "Browser-local mobile handoff packet refreshed. No remote connection, SSH, deployment, credential read, or secret storage occurred.";
  }
  if (action?.dataset.action === "clear-log") {
    state.log = [];
    saveState();
    renderLog();
    renderHandoffPacket();
    renderClaimGuard();
    renderContinuityGuard();
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
  renderHandoffPacket();
  renderClaimGuard();
  renderContinuityGuard();
  $("#live-region").textContent = `${entry.mode} readiness note recorded locally. remoteConnected: false; sshExecuted: false; deployExecuted: false; credentialRead: false; mobile24x7Ready: false; directCloudRequired: true; serverPortChanged: false.`;
});

render();
