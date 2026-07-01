#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];

const files = {
  fixture: "content/development/seis-cloud-ssh-center-readiness.json",
  acceptanceLedger: "content/development/seis-ssh-mobile-direct-cloud-acceptance-ledger.json",
  route: "apps/seis-core/cloud-ssh-center.html",
  script: "apps/seis-core/cloud-ssh-center.js",
  prBoundaryScript: "scripts/check-seis-cloud-ssh-center-pr-boundary.mjs",
  test: "apps/seis-core/test/seis-cloud-ssh-center-static.test.js",
  doc: "docs/deployment/seis-cloud-ssh-center-demo.md",
  packageJson: "package.json"
};

for (const file of Object.values(files)) read(file);

const fixture = readJson(files.fixture);
const acceptanceLedger = readJson(files.acceptanceLedger);
const packageJson = readJson(files.packageJson);
const route = read(files.route);
const appScript = read(files.script);
const testFile = read(files.test);
const doc = read(files.doc);

ensure(fixture?.id === "seis-cloud-ssh-center-readiness", "fixture id must be stable");
ensure(fixture?.status === "browser-local-demo", "fixture status must stay browser-local-demo");
ensure(fixture?.route === files.route, "fixture must point to Cloud SSH Center route");
ensure(fixture?.script === files.script, "fixture must point to Cloud SSH Center script");
ensure(fixture?.doc === files.doc, "fixture must point to Cloud SSH Center docs");
ensure(fixture?.qualityGate === "npm run check:seis-cloud-ssh-center-readiness", "fixture must expose quality gate");
ensure(fixture?.prBoundaryGate === "npm run check:seis-cloud-ssh-center-pr-boundary", "fixture must expose PR boundary gate");
ensure(fixture?.storageKey === "seis.cloud.ssh.center.v1", "fixture must preserve local storage key");
ensure(fixture?.publicSafe === true, "fixture must be public safe");
ensure(fixture?.liveExecutionAllowed === false, "fixture must not allow live execution");
ensure(fixture?.remoteConnectedByDefault === false, "fixture must keep remote disconnected by default");
ensure(fixture?.sshExecutedByDefault === false, "fixture must keep SSH execution disabled by default");
ensure(fixture?.deployExecutedByDefault === false, "fixture must keep deployment disabled by default");
ensure(fixture?.credentialReadByDefault === false, "fixture must keep credential reads disabled by default");
ensure(fixture?.secretStoredByDefault === false, "fixture must keep secret storage disabled by default");
ensure(fixture?.serverPortChangedByDefault === false, "fixture must preserve server and port by default");
ensure(fixture?.macIndependentTarget === true, "fixture must declare Mac-independent cloud target");
ensure(fixture?.codespacesMaySleep === true, "fixture must declare that Codespaces can sleep");
ensure(fixture?.currentTransportClass === "codespaces-online-not-24x7", "fixture must keep current transport class explicit");
ensure(fixture?.alwaysOnRequiresDirectCloud === true, "fixture must require direct-cloud for always-on mode");
ensure(fixture?.mobile24x7ReadyByDefault === false, "fixture must keep mobile 24/7 disabled by default");
ensure(fixture?.onlineGate === "npm run cloud:ssh:online:strict", "fixture must expose the online SSH gate");
ensure(fixture?.mobile24x7Gate === "npm run cloud:ssh:mobile-24x7:strict", "fixture must expose the mobile 24/7 gate");
ensure(fixture?.currentKnownBlocker === "mobile-24x7-requires-direct-cloud-transport", "fixture must keep the current 24/7 blocker explicit");
ensure(fixture?.acceptanceLedger === files.acceptanceLedger, "fixture must link the direct-cloud acceptance ledger");
ensure(fixture?.acceptanceContractGate === "npm run check:seis-ssh-mobile-direct-cloud", "fixture must expose the direct-cloud contract gate");
ensure(fixture?.browserLocalHandoffPacket?.id === "seis-cloud-ssh-center-mobile-handoff-packet", "fixture must define browser-local handoff packet id");
ensure(fixture?.browserLocalHandoffPacket?.status === "browser-local-demo", "browser-local handoff packet must stay demo-only");
ensure(fixture?.browserLocalHandoffPacket?.generatedBy === files.script, "browser-local handoff packet must point to app script");
ensure(fixture?.browserLocalHandoffPacket?.containsSecrets === false, "browser-local handoff packet must not contain secrets");
ensure(fixture?.browserLocalHandoffPacket?.remoteMutationAllowed === false, "browser-local handoff packet must forbid remote mutation");
for (const field of ["ownerInputChecklist", "mobile24x7AcceptanceLadder", "mobileHandoffChecklist", "requiredSafetyFlags", "currentKnownBlocker", "browserLocalReadyClaimGuard", "browserLocalContinuityGuard"]) {
  ensure((fixture?.browserLocalHandoffPacket?.fields || []).includes(field), `browser-local handoff packet fields must include ${field}`);
}
ensure(acceptanceLedger?.id === "seis-ssh-mobile-direct-cloud-acceptance-ledger", "acceptance ledger id must be stable");
ensure(acceptanceLedger?.readyClaim === "SEIS-SSH is ChatGPT mobile/Codex 24x7 ready", "acceptance ledger must preserve ready claim");
ensure(
  (acceptanceLedger?.readyClaimAllowedOnlyWhen || []).includes("strict doctor writes a successful readiness handoff report"),
  "acceptance ledger must require strict doctor report before ready claim"
);
ensure(
  (acceptanceLedger?.blockedClaimWhen || []).includes("SEIS-SSH still uses Codespaces transport"),
  "acceptance ledger must block ready claim for Codespaces transport"
);
const readyClaimGuard = fixture?.browserLocalReadyClaimGuard || {};
const ledgerDoctor = (acceptanceLedger?.evidenceMap || []).find((entry) => entry.id === "handoff-doctor");
ensure(readyClaimGuard.id === "seis-cloud-ssh-center-ready-claim-guard", "fixture must define browser-local ready-claim guard id");
ensure(readyClaimGuard.sourceLedger === files.acceptanceLedger, "ready-claim guard must point to the direct-cloud acceptance ledger");
ensure(readyClaimGuard.status === "blocked", "ready-claim guard must stay blocked by default");
ensure(readyClaimGuard.readyClaim === acceptanceLedger?.readyClaim, "ready-claim guard must mirror the ledger ready claim");
ensure(JSON.stringify(readyClaimGuard.readyClaimAllowedOnlyWhen || []) === JSON.stringify(acceptanceLedger?.readyClaimAllowedOnlyWhen || []), "ready-claim guard allowed conditions must match ledger");
ensure(JSON.stringify(readyClaimGuard.blockedClaimWhen || []) === JSON.stringify(acceptanceLedger?.blockedClaimWhen || []), "ready-claim guard blocked conditions must match ledger");
ensure(readyClaimGuard.allowedOnlyAfterStep === "handoff-doctor", "ready claim must be gated on handoff-doctor");
ensure(readyClaimGuard.allowedOnlyAfterCommand === ledgerDoctor?.command, "ready-claim guard command must match ledger handoff doctor");
ensure(readyClaimGuard.allowedOnlyAfterClaimScope === ledgerDoctor?.claimScope && ledgerDoctor?.claimScope === "mobile-24x7-ready", "ready-claim guard scope must match ledger final scope");
ensure(readyClaimGuard.readyClaimAllowed === false, "ready-claim guard must not allow ready claim by default");
ensure(readyClaimGuard.claimAllowedByDefault === false, "ready-claim guard claimAllowedByDefault must stay false");
ensure(readyClaimGuard.mobile24x7ReadyByDefault === false && readyClaimGuard.mobile24x7ReadyByDefault === fixture?.mobile24x7ReadyByDefault, "ready-claim guard must mirror mobile 24/7 default");
ensure(readyClaimGuard.currentKnownBlocker === fixture?.currentKnownBlocker, "ready-claim guard must expose the current blocker");
ensure(readyClaimGuard.requiresFinalGate === "npm run cloud:ssh:mobile-direct:doctor:strict", "ready-claim guard must require strict doctor");
ensure(readyClaimGuard.generatedBy === files.script, "ready-claim guard must point to app script");
ensure(readyClaimGuard.remoteMutationAllowed === false, "ready-claim guard must forbid remote mutation");
ensure(readyClaimGuard.credentialRead === false, "ready-claim guard must forbid credential reads");
ensure(readyClaimGuard.secretStored === false, "ready-claim guard must forbid secret storage");
const continuityGuard = fixture?.browserLocalContinuityGuard || {};
ensure(continuityGuard.id === "seis-cloud-ssh-center-continuity-guard", "fixture must define browser-local continuity guard id");
ensure(continuityGuard.sourceLedger === files.acceptanceLedger, "continuity guard must point to the direct-cloud acceptance ledger");
ensure(continuityGuard.status === "blocked", "continuity guard must stay blocked by default");
ensure(continuityGuard.continuityClaim === "SEIS remains reachable when the local Mac is closed", "continuity guard must describe Mac-off continuity claim");
ensure(JSON.stringify(continuityGuard.continuityAllowedOnlyWhen || []) === JSON.stringify(acceptanceLedger?.readyClaimAllowedOnlyWhen || []), "continuity guard allowed conditions must match ledger ready conditions");
ensure((continuityGuard.blockedContinuityWhen || []).includes("SEIS-SSH still uses Codespaces transport"), "continuity guard must block Codespaces transport");
ensure(continuityGuard.allowedOnlyAfterStep === "handoff-doctor", "continuity guard must be gated on handoff-doctor");
ensure(continuityGuard.allowedOnlyAfterCommand === ledgerDoctor?.command, "continuity guard command must match ledger handoff doctor");
ensure(continuityGuard.allowedOnlyAfterClaimScope === ledgerDoctor?.claimScope && ledgerDoctor?.claimScope === "mobile-24x7-ready", "continuity guard scope must match ledger final scope");
ensure(continuityGuard.continuityClaimAllowed === false, "continuity guard must not allow continuity claim by default");
ensure(continuityGuard.macOffClaimAllowed === false, "continuity guard must not allow Mac-off claim by default");
ensure(continuityGuard.localMacDependencyAllowed === false, "continuity guard must forbid local Mac dependency");
ensure(continuityGuard.codespacesContinuityAllowed === false, "continuity guard must forbid Codespaces as 24/7 continuity proof");
ensure(continuityGuard.browserLocalProofAllowed === false, "continuity guard must reject browser-local proof as final evidence");
ensure(continuityGuard.currentKnownBlocker === fixture?.currentKnownBlocker, "continuity guard must expose the current blocker");
ensure(continuityGuard.requiresFinalGate === "npm run cloud:ssh:mobile-direct:doctor:strict", "continuity guard must require strict doctor");
ensure(continuityGuard.generatedBy === files.script, "continuity guard must point to app script");
ensure(continuityGuard.remoteMutationAllowed === false, "continuity guard must forbid remote mutation");
ensure(continuityGuard.credentialRead === false, "continuity guard must forbid credential reads");
ensure(continuityGuard.secretStored === false, "continuity guard must forbid secret storage");
ensure(fixture?.historyScanBoundary?.fullHistoryGate === "GitHub Secret & Vulnerability Scan", "fixture must name the full-history secret gate");
ensure(fixture?.historyScanBoundary?.bypassAllowedByDefault === false, "fixture must forbid secret-history bypass by default");
ensure((fixture?.historyScanBoundary?.forbiddenDiffPrefixes || []).includes("sources/"), "fixture must forbid sources/ in this PR boundary");
ensure((fixture?.historyScanBoundary?.forbiddenHeadPaths || []).includes("sources/github-unified-source/_generated/github-code-bundle.txt"), "fixture must forbid generated bundle in HEAD");

const states = new Set(fixture?.states || []);
for (const state of ["connected", "mock", "disabled", "planned", "unknown"]) {
  ensure(states.has(state), `fixture states must include ${state}`);
}

ensure(Array.isArray(fixture?.surfaces) && fixture.surfaces.length === 12, "fixture must define 12 readiness surfaces");

const surfaceIds = new Set();
for (const surface of fixture?.surfaces || []) {
  ensure(/^[a-z0-9-]+$/.test(surface.id || ""), `surface id must be kebab-case: ${surface.id}`);
  ensure(!surfaceIds.has(surface.id), `surface id must be unique: ${surface.id}`);
  surfaceIds.add(surface.id);
  ensure(states.has(surface.status), `surface ${surface.id} must use a declared state`);
  ensure(surface.remoteMutationAllowed === false, `surface ${surface.id} must forbid remote mutation`);
  ensure(typeof surface.realBehavior === "boolean", `surface ${surface.id} must declare realBehavior`);
  for (const token of [surface.name, surface.status, surface.signal, surface.boundary]) {
    ensure(appScript.includes(token), `app script must include fixture token: ${token}`);
  }
}

for (const id of ["mac-independent-remote-runtime", "always-on-direct-cloud"]) {
  ensure(surfaceIds.has(id), `fixture must include ${id}`);
}

const ownerInputs = fixture?.ownerInputChecklist || [];
ensure(Array.isArray(ownerInputs) && ownerInputs.length === 7, "fixture must define 7 direct-cloud owner input fields");
const ownerInputIds = new Set();
for (const input of ownerInputs) {
  ensure(/^[a-z0-9-]+$/.test(input.id || ""), `owner input id must be kebab-case: ${input.id}`);
  ensure(!ownerInputIds.has(input.id), `owner input id must be unique: ${input.id}`);
  ownerInputIds.add(input.id);
  ensure(states.has(input.status), `owner input ${input.id} must use a declared state`);
  ensure(input.secret === false, `owner input ${input.id} must stay non-secret`);
  ensure(input.requiredFor24x7 === true, `owner input ${input.id} must be required for 24/7`);
  for (const token of [input.label, input.status, input.field, input.boundary]) {
    ensure(appScript.includes(token), `app script must include owner input token: ${token}`);
  }
}

for (const id of ["direct-cloud-host", "ssh-port", "runtime-user", "identity-file-path", "remote-repo-dir", "bootstrap-runbook", "rollback-owner"]) {
  ensure(ownerInputIds.has(id), `fixture must include owner input ${id}`);
}

const acceptanceLadder = fixture?.mobile24x7AcceptanceLadder || [];
ensure(Array.isArray(acceptanceLadder) && acceptanceLadder.length === 8, "fixture must define 8 direct-cloud acceptance steps");
const acceptanceIds = new Set();
const ledgerEvidenceById = new Map((acceptanceLedger?.evidenceMap || []).map((entry) => [entry.id, entry]));
for (const step of acceptanceLadder) {
  ensure(/^[a-z0-9-]+$/.test(step.id || ""), `acceptance step id must be kebab-case: ${step.id}`);
  ensure(!acceptanceIds.has(step.id), `acceptance step id must be unique: ${step.id}`);
  acceptanceIds.add(step.id);
  ensure(states.has(step.status), `acceptance step ${step.id} must use a declared state`);
  ensure(typeof step.proves === "string" && step.proves.length > 10, `acceptance step ${step.id} must explain evidence`);
  ensure(typeof step.readyEvidence === "boolean", `acceptance step ${step.id} must declare readyEvidence`);
  const ledgerStep = ledgerEvidenceById.get(step.id);
  ensure(Boolean(ledgerStep), `acceptance ledger must include evidence step ${step.id}`);
  ensure(ledgerStep?.command === step.command, `acceptance step ${step.id} command must match acceptance ledger`);
  ensure(ledgerStep?.claimScope === step.claimScope, `acceptance step ${step.id} claimScope must match acceptance ledger`);
  ensure(ledgerStep?.proves === step.proves, `acceptance step ${step.id} evidence text must match acceptance ledger`);
  for (const token of [step.id, step.status, step.command, step.claimScope]) {
    ensure(appScript.includes(token), `app script must include acceptance step token: ${token}`);
  }
}

for (const id of ["profile-contract", "bootstrap-dry-run", "bootstrap-apply", "ssh-config-plan", "ssh-config-install", "readiness-probe", "handoff-doctor", "contract-guard"]) {
  ensure(acceptanceIds.has(id), `fixture must include acceptance step ${id}`);
}
ensure(acceptanceLadder.find((step) => step.id === "handoff-doctor")?.readyEvidence === true, "handoff doctor must be the mobile 24/7 ready evidence step");
for (const step of acceptanceLadder.filter((item) => item.id !== "handoff-doctor")) {
  ensure(step.readyEvidence === false, `acceptance step ${step.id} must not be final ready evidence`);
}

const mobileHandoffChecklist = fixture?.mobileHandoffChecklist || [];
ensure(Array.isArray(mobileHandoffChecklist) && mobileHandoffChecklist.length === 6, "fixture must define 6 mobile handoff checklist items");
const ledgerHandoffById = new Map((acceptanceLedger?.mobileHandoffChecklist || []).map((entry) => [entry.id, entry]));
const handoffIds = new Set();
for (const item of mobileHandoffChecklist) {
  ensure(/^[a-z0-9-]+$/.test(item.id || ""), `handoff item id must be kebab-case: ${item.id}`);
  ensure(!handoffIds.has(item.id), `handoff item id must be unique: ${item.id}`);
  handoffIds.add(item.id);
  ensure(states.has(item.status), `handoff item ${item.id} must use a declared state`);
  ensure(item.blockingIfMissing === true, `handoff item ${item.id} must block missing evidence`);
  const ledgerItem = ledgerHandoffById.get(item.id);
  ensure(Boolean(ledgerItem), `acceptance ledger must include handoff item ${item.id}`);
  ensure(item.requirement === ledgerItem?.requirement, `handoff item ${item.id} requirement must match acceptance ledger`);
  ensure(item.evidence === ledgerItem?.evidence, `handoff item ${item.id} evidence must match acceptance ledger`);
  ensure(item.blockingIfMissing === ledgerItem?.blockingIfMissing, `handoff item ${item.id} blocking flag must match acceptance ledger`);
  ensure(appScript.includes(item.id), `app script must include handoff item id: ${item.id}`);
}

for (const id of ["device-independent-entrypoint", "always-on-cloud-endpoint", "remote-runtime-ready", "handoff-report-written", "secret-boundary-preserved", "new-device-replayable"]) {
  ensure(handoffIds.has(id), `fixture must include handoff item ${id}`);
}

const requiredFlags = fixture?.requiredSafetyFlags || {};
for (const [flag, value] of Object.entries({
  remoteConnected: false,
  sshExecuted: false,
  deployExecuted: false,
  credentialRead: false,
  secretStored: false,
  serverPortChanged: false,
  mobile24x7Ready: false,
  directCloudRequired: true,
  rollbackRequired: true
})) {
  ensure(requiredFlags[flag] === value, `fixture safety flag ${flag} must equal ${value}`);
  ensure(appScript.includes(`${flag}: ${value}`), `app script must include safety flag ${flag}: ${value}`);
}

for (const claim of fixture?.forbiddenClaims || []) {
  ensure(typeof claim === "string" && claim.length > 4, "forbidden claims must be descriptive strings");
}

for (const gate of [
  "execute-live-ssh",
  "read-credentials",
  "change-server-or-port",
  "deploy",
  "provision-cloud",
  "restore-backup",
  "publish-readiness-claim"
]) {
  ensure((fixture?.approvalGates || []).includes(gate), `fixture must include approval gate ${gate}`);
}

ensure(route.includes("data-seis-cloud-ssh=\"browser-local-readiness\""), "route must expose browser-local readiness marker");
ensure(route.includes("No live SSH - metadata-only control plane"), "route must keep no-live-SSH label");
ensure(route.includes("server and connection port must remain unchanged"), "route must preserve server/port copy");
ensure(route.includes("Mac-off continuity requires a direct-cloud runtime; Codespaces can sleep."), "route must disclose Mac-off continuity boundary");
ensure(route.includes("owner-input-checklist"), "route must render direct-cloud owner input checklist");
ensure(route.includes("Direct-cloud owner packet"), "route must label direct-cloud owner input packet");
ensure(route.includes("acceptance-ladder"), "route must render direct-cloud acceptance ladder");
ensure(route.includes("Ready only after strict direct-cloud evidence"), "route must keep strict evidence copy");
ensure(route.includes("mobile-handoff-checklist"), "route must render mobile handoff checklist");
ensure(route.includes("New-device ready only after direct-cloud proof"), "route must keep mobile handoff boundary copy");
ensure(route.includes("handoff-packet"), "route must render browser-local handoff packet");
ensure(route.includes("Browser-local handoff packet"), "route must label browser-local handoff packet");
ensure(route.includes("refresh-packet"), "route must expose handoff packet refresh action");
ensure(route.includes("claim-guard-grid"), "route must render ready claim guard");
ensure(route.includes("Ready-claim guard"), "route must label ready claim guard");
ensure(route.includes("continuity-guard-grid"), "route must render continuity guard");
ensure(route.includes("Continuity guard"), "route must label continuity guard");

for (const token of [
  files.fixture,
  "schema-backed Cloud / SSH readiness fixture",
  "browserLocalHandoffPacket",
  "browserLocalReadyClaimGuard",
  "browserLocalContinuityGuard",
  "ownerInputChecklist",
  "mobile24x7AcceptanceLadder",
  "mobileHandoffChecklist",
  files.acceptanceLedger,
  "npm run check:seis-ssh-mobile-direct-cloud",
  "SEIS_SSH_HOST",
  "SEIS_CLOUD_HOST",
  "SEIS_REMOTE_REPO_DIR",
  "provider console / owner approval",
  "npm run cloud:ssh:mobile-direct:doctor:strict",
  "device-independent-entrypoint",
  "new-device-replayable",
  "seis-cloud-ssh-center-mobile-handoff-packet",
  "seis-cloud-ssh-center-ready-claim-guard",
  "seis-cloud-ssh-center-continuity-guard",
  "npm run check:seis-cloud-ssh-center-readiness",
  "npm run check:seis-cloud-ssh-center-pr-boundary",
  "npm run cloud:ssh:online:strict",
  "npm run cloud:ssh:mobile-24x7:strict",
  "mobile-24x7-requires-direct-cloud-transport"
]) {
  ensure(doc.includes(token), `docs must include ${token}`);
  ensure(testFile.includes(token) || token === "schema-backed Cloud / SSH readiness fixture", `test must include ${token}`);
}

for (const token of [
  "buildClaimGuard",
  "renderClaimGuard",
  "readyClaimAllowed: false",
  "claimAllowedByDefault: false",
  "browserLocalReadyClaimGuard",
  "blockingHandoffItems",
  "unresolvedOwnerInputs",
  "buildContinuityGuard",
  "renderContinuityGuard",
  "continuityClaimAllowed: false",
  "macOffClaimAllowed: false",
  "localMacDependencyAllowed: false",
  "codespacesContinuityAllowed: false",
  "browserLocalProofAllowed: false",
  "browserLocalContinuityGuard",
  "buildHandoffPacket",
  "renderHandoffPacket",
  "Browser-local mobile handoff packet refreshed",
  "localEvidenceNotes"
]) {
  ensure(appScript.includes(token), `app script must include handoff packet behavior: ${token}`);
}

ensure(packageJson?.scripts?.["check:seis-cloud-ssh-center-readiness"] === "node scripts/check-seis-cloud-ssh-center-readiness.mjs", "package script check:seis-cloud-ssh-center-readiness must exist");
ensure(packageJson?.scripts?.["check:seis-cloud-ssh-center-pr-boundary"] === "node scripts/check-seis-cloud-ssh-center-pr-boundary.mjs", "package script check:seis-cloud-ssh-center-pr-boundary must exist");
ensure(read(files.prBoundaryScript).includes("sources/github-unified-source/_generated/github-code-bundle.txt"), "PR boundary script must guard generated bundle path");

for (const file of Object.values(files)) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /ghp_[A-Za-z0-9_]{20,}/, "GitHub personal access tokens");
  requireNotMatches(file, /github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained tokens");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /\b(?:password|token|secret)\s*[:=]\s*["'][^"']{8,}/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS Cloud SSH Center readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Cloud SSH Center readiness check passed.");

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    failures.push(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) failures.push(`${file} must not include ${reason}`);
}
