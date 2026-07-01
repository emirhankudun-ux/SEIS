import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");
const repoRoot = new URL("../../../", import.meta.url);
const readRepo = (file) => readFile(new URL(file, repoRoot), "utf8");

test("SEIS Cloud SSH Center exposes explicit safe states", async () => {
  const html = await read("cloud-ssh-center.html");
  for (const marker of [
    "SEIS Cloud / SSH Center",
    "data-seis-cloud-ssh=\"browser-local-readiness\"",
    "No live SSH - metadata-only control plane",
    "Cloud surfaces",
    "Safety state",
    "connected",
    "mock",
    "disabled",
    "planned",
    "unknown",
    "Credential read",
    "24/7 continuity",
    "Server / port",
    "unchanged placeholder",
    "Mac-off continuity requires a direct-cloud runtime; Codespaces can sleep.",
    "Direct-cloud owner packet",
    "Fields required before 24/7 claim",
    "owner-input-checklist",
    "24/7 acceptance ladder",
    "Ready only after strict direct-cloud evidence",
    "acceptance-ladder",
    "Mobile handoff checklist",
    "New-device ready only after direct-cloud proof",
    "mobile-handoff-checklist",
    "Browser-local handoff packet",
    "Public-safe mobile transfer summary",
    "handoff-packet",
    "refresh-packet"
  ]) {
    assert.match(html, new RegExp(marker));
  }
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<main id="main"/);
});

test("SEIS Cloud SSH Center script stays browser-local and non-mutating", async () => {
  const script = await read("cloud-ssh-center.js");
  for (const marker of [
    "localStorage",
    "seis.cloud.ssh.center.v1",
    "remoteConnected: false",
    "sshExecuted: false",
    "deployExecuted: false",
    "credentialRead: false",
    "secretStored: false",
    "serverPortChanged: false",
    "mobile24x7Ready: false",
    "directCloudRequired: true",
    "rollbackRequired: true",
    "ownerInputs",
    "renderOwnerInputs",
    "SEIS_SSH_HOST or SEIS_CLOUD_HOST",
    "SEIS_REMOTE_REPO_DIR",
    "scripts/bootstrap-seis-ssh-mobile-direct-cloud.sh",
    "provider console / owner approval",
    "requiredFor24x7: true",
    "acceptanceLadder",
    "renderAcceptanceLadder",
    "npm run cloud:ssh:mobile-direct:profile",
    "npm run cloud:ssh:mobile-direct:doctor:strict",
    "readyClaimBlockedUntilStrictDoctor: true",
    "handoffChecklist",
    "renderHandoffChecklist",
    "device-independent-entrypoint",
    "new-device-replayable",
    "blockingIfMissing: true",
    "buildHandoffPacket",
    "renderHandoffPacket",
    "seis-cloud-ssh-center-mobile-handoff-packet",
    "localEvidenceNotes",
    "Browser-local mobile handoff packet refreshed"
  ]) {
    assert.match(script, new RegExp(marker));
  }
  for (const forbidden of [
    "fetch(",
    "XMLHttpRequest",
    "WebSocket",
    "EventSource",
    "ssh ",
    "scp ",
    "rsync ",
    "OPENAI_API_KEY",
    "GITHUB_TOKEN",
    "BEGIN OPENSSH",
    "PRIVATE KEY"
  ]) {
    assert.equal(script.includes(forbidden), false, `${forbidden} must not appear`);
  }
});

test("SEIS Cloud SSH Center styles include responsive and reduced-motion support", async () => {
  const css = await read("cloud-ssh-center.css");
  for (const marker of ["prefers-reduced-motion", "skip-link", "status-grid", "surface-grid", "owner-input-grid", "acceptance-ladder", "handoff-grid", "handoff-packet", "evidence-log", "@media (max-width: 940px)", "--cyan", "--blue", "--radius"]) {
    assert.match(css, new RegExp(marker.replace(/[()]/g, "\\$&")));
  }
});

test("SEIS Cloud SSH Center fixture stays synchronized with safe demo states", async () => {
  const fixturePath = "content/development/seis-cloud-ssh-center-readiness.json";
  const fixture = JSON.parse(await readRepo(fixturePath));
  const acceptanceLedger = JSON.parse(await readRepo(fixture.acceptanceLedger));
  const script = await read("cloud-ssh-center.js");
  assert.equal(fixture.qualityGate, "npm run check:seis-cloud-ssh-center-readiness");
  assert.equal(fixture.liveExecutionAllowed, false);
  assert.equal(fixture.remoteConnectedByDefault, false);
  assert.equal(fixture.sshExecutedByDefault, false);
  assert.equal(fixture.deployExecutedByDefault, false);
  assert.equal(fixture.credentialReadByDefault, false);
  assert.equal(fixture.serverPortChangedByDefault, false);
  assert.equal(fixture.macIndependentTarget, true);
  assert.equal(fixture.codespacesMaySleep, true);
  assert.equal(fixture.alwaysOnRequiresDirectCloud, true);
  assert.equal(fixture.mobile24x7ReadyByDefault, false);
  assert.equal(fixture.onlineGate, "npm run cloud:ssh:online:strict");
  assert.equal(fixture.mobile24x7Gate, "npm run cloud:ssh:mobile-24x7:strict");
  assert.equal(fixture.prBoundaryGate, "npm run check:seis-cloud-ssh-center-pr-boundary");
  assert.equal(fixture.currentKnownBlocker, "mobile-24x7-requires-direct-cloud-transport");
  assert.equal(fixture.acceptanceLedger, "content/development/seis-ssh-mobile-direct-cloud-acceptance-ledger.json");
  assert.equal(fixture.acceptanceContractGate, "npm run check:seis-ssh-mobile-direct-cloud");
  assert.equal(fixture.browserLocalHandoffPacket.id, "seis-cloud-ssh-center-mobile-handoff-packet");
  assert.equal(fixture.browserLocalHandoffPacket.status, "browser-local-demo");
  assert.equal(fixture.browserLocalHandoffPacket.containsSecrets, false);
  assert.equal(fixture.browserLocalHandoffPacket.remoteMutationAllowed, false);
  assert.ok(fixture.browserLocalHandoffPacket.fields.includes("mobileHandoffChecklist"));
  assert.ok(fixture.browserLocalHandoffPacket.fields.includes("requiredSafetyFlags"));
  assert.equal(acceptanceLedger.id, "seis-ssh-mobile-direct-cloud-acceptance-ledger");
  assert.equal(acceptanceLedger.readyClaim, "SEIS-SSH is ChatGPT mobile/Codex 24x7 ready");
  assert.ok(acceptanceLedger.readyClaimAllowedOnlyWhen.includes("strict doctor writes a successful readiness handoff report"));
  assert.ok(acceptanceLedger.blockedClaimWhen.includes("SEIS-SSH still uses Codespaces transport"));
  assert.equal(fixture.historyScanBoundary.bypassAllowedByDefault, false);
  assert.ok(fixture.historyScanBoundary.forbiddenDiffPrefixes.includes("sources/"));
  assert.ok(fixture.historyScanBoundary.forbiddenHeadPaths.includes("sources/github-unified-source/_generated/github-code-bundle.txt"));
  assert.equal(fixture.ownerInputChecklist.length, 7);
  const ownerInputIds = new Set(fixture.ownerInputChecklist.map((input) => input.id));
  for (const id of ["direct-cloud-host", "ssh-port", "runtime-user", "identity-file-path", "remote-repo-dir", "bootstrap-runbook", "rollback-owner"]) {
    assert.ok(ownerInputIds.has(id));
  }
  for (const input of fixture.ownerInputChecklist) {
    assert.equal(input.secret, false);
    assert.equal(input.requiredFor24x7, true);
    assert.ok(fixture.states.includes(input.status));
    assert.equal(script.includes(input.label), true);
    assert.equal(script.includes(input.field), true);
    assert.equal(script.includes(input.boundary), true);
  }
  assert.equal(fixture.mobile24x7AcceptanceLadder.length, 8);
  const ledgerEvidenceById = new Map(acceptanceLedger.evidenceMap.map((entry) => [entry.id, entry]));
  const ladderIds = new Set(fixture.mobile24x7AcceptanceLadder.map((step) => step.id));
  for (const id of ["profile-contract", "bootstrap-dry-run", "bootstrap-apply", "ssh-config-plan", "ssh-config-install", "readiness-probe", "handoff-doctor", "contract-guard"]) {
    assert.ok(ladderIds.has(id));
  }
  for (const step of fixture.mobile24x7AcceptanceLadder) {
    const ledgerStep = ledgerEvidenceById.get(step.id);
    assert.ok(ledgerStep);
    assert.equal(step.command, ledgerStep.command);
    assert.equal(step.claimScope, ledgerStep.claimScope);
    assert.equal(step.proves, ledgerStep.proves);
    assert.ok(fixture.states.includes(step.status));
    assert.equal(script.includes(step.id), true);
    assert.equal(script.includes(step.command), true);
    assert.equal(script.includes(step.claimScope), true);
  }
  assert.equal(fixture.mobile24x7AcceptanceLadder.find((step) => step.id === "handoff-doctor").readyEvidence, true);
  for (const step of fixture.mobile24x7AcceptanceLadder.filter((item) => item.id !== "handoff-doctor")) {
    assert.equal(step.readyEvidence, false);
  }
  assert.equal(fixture.mobileHandoffChecklist.length, acceptanceLedger.mobileHandoffChecklist.length);
  const ledgerHandoffById = new Map(acceptanceLedger.mobileHandoffChecklist.map((entry) => [entry.id, entry]));
  for (const item of fixture.mobileHandoffChecklist) {
    const ledgerItem = ledgerHandoffById.get(item.id);
    assert.ok(ledgerItem);
    assert.ok(fixture.states.includes(item.status));
    assert.equal(item.requirement, ledgerItem.requirement);
    assert.equal(item.evidence, ledgerItem.evidence);
    assert.equal(item.blockingIfMissing, true);
    assert.equal(item.blockingIfMissing, ledgerItem.blockingIfMissing);
    assert.equal(script.includes(item.id), true);
  }
  assert.equal(fixture.surfaces.length, 12);
  assert.ok(fixture.surfaces.some((surface) => surface.id === "mac-independent-remote-runtime"));
  assert.ok(fixture.surfaces.some((surface) => surface.id === "always-on-direct-cloud"));
  for (const surface of fixture.surfaces) {
    assert.equal(surface.remoteMutationAllowed, false);
    assert.match(script, new RegExp(surface.name));
    assert.match(script, new RegExp(surface.status));
  }
});
