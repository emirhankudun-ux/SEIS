#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];

const files = {
  fixture: "content/development/seis-cloud-ssh-center-readiness.json",
  route: "apps/seis-core/cloud-ssh-center.html",
  script: "apps/seis-core/cloud-ssh-center.js",
  test: "apps/seis-core/test/seis-cloud-ssh-center-static.test.js",
  doc: "docs/deployment/seis-cloud-ssh-center-demo.md",
  packageJson: "package.json"
};

for (const file of Object.values(files)) read(file);

const fixture = readJson(files.fixture);
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

for (const token of [
  files.fixture,
  "schema-backed Cloud / SSH readiness fixture",
  "npm run check:seis-cloud-ssh-center-readiness",
  "npm run cloud:ssh:online:strict",
  "npm run cloud:ssh:mobile-24x7:strict",
  "mobile-24x7-requires-direct-cloud-transport"
]) {
  ensure(doc.includes(token), `docs must include ${token}`);
  ensure(testFile.includes(token) || token === "schema-backed Cloud / SSH readiness fixture", `test must include ${token}`);
}

ensure(packageJson?.scripts?.["check:seis-cloud-ssh-center-readiness"] === "node scripts/check-seis-cloud-ssh-center-readiness.mjs", "package script check:seis-cloud-ssh-center-readiness must exist");

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
