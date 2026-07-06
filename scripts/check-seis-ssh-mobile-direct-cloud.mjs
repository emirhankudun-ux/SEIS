#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  contract: "content/development/seis-ssh-mobile-direct-cloud-contract.json",
  ledger: "content/development/seis-ssh-mobile-direct-cloud-acceptance-ledger.json",
  packageJson: "package.json",
  runbook: "docs/operations/seis-ssh-mobile-24x7.md",
  bootstrapShell: "scripts/bootstrap-seis-ssh-mobile-direct-cloud.sh",
  bootstrapRunner: "scripts/run-seis-ssh-mobile-direct-cloud-bootstrap.mjs",
  configInstaller: "scripts/install-seis-ssh-mobile-direct-cloud-config.mjs",
  readinessProbe: "scripts/check-seis-ssh-mobile-24x7.mjs",
  readinessReport: "scripts/create-seis-ssh-mobile-24x7-report.mjs",
  readinessClaim: "scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs",
  directProfile: "scripts/create-seis-ssh-mobile-direct-cloud-profile.mjs",
  gitignore: ".gitignore",
};

for (const file of Object.values(files)) read(file);

const packageJson = readJson(files.packageJson);
const contract = readJson(files.contract);
const ledger = readJson(files.ledger);
const scripts = packageJson?.scripts || {};

const requiredScripts = {
  "cloud:ssh:mobile-direct:profile": "node scripts/create-seis-ssh-mobile-direct-cloud-profile.mjs",
  "cloud:ssh:mobile-direct:config:plan": "node scripts/install-seis-ssh-mobile-direct-cloud-config.mjs --dry-run",
  "cloud:ssh:mobile-direct:config:install": "node scripts/install-seis-ssh-mobile-direct-cloud-config.mjs --write",
  "cloud:ssh:mobile-direct:bootstrap:plan": "node scripts/run-seis-ssh-mobile-direct-cloud-bootstrap.mjs",
  "cloud:ssh:mobile-direct:bootstrap:apply": "node scripts/run-seis-ssh-mobile-direct-cloud-bootstrap.mjs --apply",
  "cloud:ssh:mobile-direct:probe": "node scripts/check-seis-ssh-mobile-24x7.mjs",
  "cloud:ssh:mobile-direct:probe:strict": "node scripts/check-seis-ssh-mobile-24x7.mjs --require-ready",
  "cloud:ssh:mobile-direct:doctor": "node scripts/create-seis-ssh-mobile-24x7-report.mjs",
  "cloud:ssh:mobile-direct:doctor:strict": "node scripts/create-seis-ssh-mobile-24x7-report.mjs --require-ready",
  "cloud:ssh:direct-cloud:claim": "node scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs --write",
  "check:seis-ssh-direct-cloud-readiness-claim": "node scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs --check",
  "check:seis-ssh-mobile-direct-cloud": "node scripts/check-seis-ssh-mobile-direct-cloud.mjs",
};

for (const [name, command] of Object.entries(requiredScripts)) {
  ensure(scripts[name] === command, `package.json script ${name} must equal ${command}`);
}

ensure(
  String(scripts["quality:governance"] || "").includes("npm run check:seis-ssh-mobile-direct-cloud"),
  "quality:governance must include check:seis-ssh-mobile-direct-cloud"
);

if (contract) {
  ensure(contract.id === "seis-ssh-mobile-direct-cloud-contract", "direct-cloud contract id must be stable");
  ensure(contract.status === "active", "direct-cloud contract must be active");
  ensure(contract.qualityGate === "npm run check:seis-ssh-mobile-direct-cloud", "direct-cloud contract must expose qualityGate");
  ensure(contract.singleVisibleAlias === "SEIS-SSH", "direct-cloud contract must preserve the single SEIS-SSH alias");
  ensure(contract.transport?.required === "direct-cloud-ssh", "direct-cloud contract must require direct-cloud-ssh transport");
  ensure(contract.transport?.codespacesAllowedFor24x7 === false, "direct-cloud contract must reject Codespaces for 24x7");
  ensure(contract.transport?.localMacAllowedFor24x7 === false, "direct-cloud contract must reject local Mac for 24x7");
  ensure(contract.bootstrap?.publicKeyOnly === true, "direct-cloud contract must require public-key-only bootstrap input");
  ensure(contract.bootstrap?.privateKeyReadableByBootstrap === false, "direct-cloud contract must reject private-key bootstrap reads");
  ensure(contract.configuration?.unmanagedAliasOverwriteAllowedByDefault === false, "direct-cloud contract must reject default unmanaged alias overwrites");
  ensure(contract.security?.secretsInGitAllowed === false, "direct-cloud contract must reject secrets in git");
  ensure(contract.security?.privateKeysInGitAllowed === false, "direct-cloud contract must reject private keys in git");
  ensure(contract.security?.apiKeysInGitAllowed === false, "direct-cloud contract must reject API keys in git");
  ensure(Array.isArray(contract.readiness?.requiredEvidence) && contract.readiness.requiredEvidence.length >= 5, "direct-cloud contract must define readiness evidence");
  ensure(contract.readiness?.claimCommand === "npm run cloud:ssh:direct-cloud:claim", "direct-cloud contract must expose readiness claim command");
  ensure(contract.readiness?.claimCheckCommand === "npm run check:seis-ssh-direct-cloud-readiness-claim", "direct-cloud contract must expose readiness claim check");
  ensure(Array.isArray(contract.evidenceSurfaces) && contract.evidenceSurfaces.includes(files.readinessProbe), "direct-cloud contract must cite readiness probe");
  ensure(Array.isArray(contract.evidenceSurfaces) && contract.evidenceSurfaces.includes(files.readinessClaim), "direct-cloud contract must cite readiness claim gate");
  ensure(contract.acceptanceLedger === files.ledger, "direct-cloud contract must link acceptance ledger");
  ensure(Array.isArray(contract.evidenceSurfaces) && contract.evidenceSurfaces.includes(files.ledger), "direct-cloud contract must cite acceptance ledger");
}

if (ledger) {
  ensure(ledger.id === "seis-ssh-mobile-direct-cloud-acceptance-ledger", "acceptance ledger id must be stable");
  ensure(ledger.contract === files.contract, "acceptance ledger must point at the direct-cloud contract");
  ensure(ledger.status === "active", "acceptance ledger must be active");
  ensure(ledger.readyClaim === "SEIS-SSH is ChatGPT mobile/Codex 24x7 ready", "acceptance ledger must define ready claim");
  ensure(Array.isArray(ledger.readyClaimAllowedOnlyWhen) && ledger.readyClaimAllowedOnlyWhen.length >= 6, "acceptance ledger must define ready conditions");
  ensure(Array.isArray(ledger.blockedClaimWhen) && ledger.blockedClaimWhen.length >= 6, "acceptance ledger must define blocked conditions");
  ensure(Array.isArray(ledger.nonEvidence) && ledger.nonEvidence.some((item) => item.includes("green governance check")), "acceptance ledger must document non-evidence");
  ensure(Array.isArray(ledger.decisionMatrix) && ledger.decisionMatrix.length >= 6, "acceptance ledger must define decision matrix");
  ensure(Array.isArray(ledger.remediationOrder) && ledger.remediationOrder.length >= 6, "acceptance ledger must define remediation order");
  ensure(Array.isArray(ledger.mobileHandoffChecklist) && ledger.mobileHandoffChecklist.length >= 6, "acceptance ledger must define mobile handoff checklist");
  const evidenceIds = new Set((ledger.evidenceMap || []).map((entry) => entry.id));
  for (const id of ["profile-contract", "bootstrap-dry-run", "bootstrap-apply", "ssh-config-install", "readiness-probe", "handoff-doctor", "readiness-claim-gate", "contract-guard"]) {
    ensure(evidenceIds.has(id), `acceptance ledger must include evidence id ${id}`);
  }
  const matrixStates = new Set(ledger.decisionMatrix.map((entry) => entry.state));
  for (const state of ["missing-host", "codespaces-transport", "bootstrap-planned", "config-installed", "strict-probe-passed", "strict-doctor-passed", "readiness-claim-gate-passed"]) {
    ensure(matrixStates.has(state), `acceptance ledger decision matrix must include state ${state}`);
  }
  const handoffIds = new Set(ledger.mobileHandoffChecklist.map((entry) => entry.id));
  for (const id of ["device-independent-entrypoint", "always-on-cloud-endpoint", "remote-runtime-ready", "handoff-report-written", "claim-gate-allowed", "secret-boundary-preserved", "new-device-replayable"]) {
    ensure(handoffIds.has(id), `acceptance ledger mobile handoff checklist must include ${id}`);
  }
}

for (const [file, token] of [
  [files.contract, "seis-ssh-mobile-direct-cloud-contract"],
  [files.contract, "seis-ssh-mobile-direct-cloud-acceptance-ledger.json"],
  [files.contract, "npm run cloud:ssh:mobile-direct:bootstrap:plan"],
  [files.contract, "npm run cloud:ssh:mobile-direct:doctor:strict"],
  [files.contract, "direct-cloud transport"],
  [files.contract, "secretsInGitAllowed"],
  [files.ledger, "SEIS-SSH is ChatGPT mobile/Codex 24x7 ready"],
  [files.ledger, "npm run cloud:ssh:mobile-direct:doctor:strict"],
  [files.ledger, "A green governance check alone does not prove the cloud VM is reachable."],
  [files.ledger, "strict-doctor-passed"],
  [files.ledger, "Run the strict doctor to write the final mobile handoff report."],
  [files.ledger, "npm run cloud:ssh:direct-cloud:claim"],
  [files.ledger, "readiness-claim-gate"],
  [files.ledger, "claim-gate-allowed"],
  [files.ledger, "device-independent-entrypoint"],
  [files.ledger, "new-device-replayable"],
  [files.ledger, "Private keys, API keys, tokens, and runtime secrets remain outside git."],
  [files.runbook, "Use direct SSH to an always-on cloud VM"],
  [files.runbook, "content/development/seis-ssh-mobile-direct-cloud-contract.json"],
  [files.runbook, "content/development/seis-ssh-mobile-direct-cloud-acceptance-ledger.json"],
  [files.runbook, "Decision matrix"],
  [files.runbook, "Mobile handoff checklist"],
  [files.runbook, "npm run cloud:ssh:mobile-direct:bootstrap:plan"],
  [files.runbook, "npm run cloud:ssh:mobile-direct:bootstrap:apply"],
  [files.runbook, "npm run cloud:ssh:mobile-direct:probe:strict"],
  [files.runbook, "npm run cloud:ssh:mobile-direct:doctor:strict"],
  [files.runbook, "npm run cloud:ssh:direct-cloud:claim"],
  [files.runbook, "Readiness claim gate passed"],
  [files.runbook, "keeps private keys and API keys out of git and logs"],
  [files.bootstrapShell, "SEIS_AUTHORIZED_KEY"],
  [files.bootstrapShell, "PasswordAuthentication ${SEIS_PASSWORD_AUTH}"],
  [files.bootstrapShell, "PermitRootLogin ${SEIS_PERMIT_ROOT_LOGIN}"],
  [files.bootstrapShell, "seis-ssh-mobile-ready.service"],
  [files.bootstrapRunner, "mode: apply ? \"apply\" : \"dry-run\""],
  [files.bootstrapRunner, "SEIS_SSH_PUBLIC_KEY_FILE"],
  [files.bootstrapRunner, "fingerprintPublicKey"],
  [files.bootstrapRunner, "This runner reads a public key only"],
  [files.bootstrapRunner, "Runtime secrets stay on the VM"],
  [files.configInstaller, "managed by SEIS"],
  [files.configInstaller, "Refusing to overwrite unmanaged SSH alias"],
  [files.configInstaller, "ServerAliveInterval 30"],
  [files.readinessProbe, "Direct-cloud mode must prove TCP reachability"],
  [files.readinessProbe, "mobile-24x7-requires-direct-cloud-transport"],
  [files.readinessProbe, "remote-runtime-offline"],
  [files.readinessReport, "directCloudBootstrapPlanCommand"],
  [files.readinessReport, "directCloudDoctorStrictCommand"],
  [files.readinessReport, "--require-ready"],
  [files.readinessClaim, "claimAllowed"],
  [files.readinessClaim, "strict doctor evidence"],
  [files.readinessClaim, "does not call provider APIs"],
  [files.directProfile, "bootstrapPlan"],
  [files.directProfile, "strictProbeReadiness"],
  [files.directProfile, "secretsInGitAllowed: false"],
  [files.gitignore, "reports/seis-ssh-mobile-24x7-readiness.json"],
  [files.gitignore, "reports/seis-ssh-mobile-direct-cloud-profile.json"],
  [files.gitignore, ".seis-secrets/"],
]) {
  requireIncludes(file, token);
}

for (const file of Object.values(files)) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
}

if (failures.length > 0) {
  console.error("SEIS SSH mobile direct-cloud contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH mobile direct-cloud contract check passed.");

function absolute(file) {
  return path.join(root, file);
}

function read(file) {
  const full = absolute(file);
  if (!existsSync(full)) {
    fail(`missing ${file}`);
    return "";
  }
  return readFileSync(full, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function requireIncludes(file, token) {
  if (!read(file).includes(token)) fail(`${file} must include ${token}`);
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) fail(`${file} must not include ${reason}`);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function fail(message) {
  failures.push(message);
}
