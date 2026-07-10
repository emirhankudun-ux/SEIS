#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];

const files = {
  contract: "deploy/seis-ssh-public-access-contract.json",
  accessModel: "deploy/seis-ssh-access-model.json",
  roadmap: "deploy/seis-ssh-cloud-roadmap.json",
  packageJson: "package.json",
  runbook: "docs/deployment/seis-ssh-public-github-access.md",
  codexGitHandoff: "docs/deployment/seis-codex-git-ssh-handoff.md",
  accessDoc: "docs/deployment/seis-ssh-access-model.md",
  roadmapDoc: "docs/deployment/seis-ssh-cloud-roadmap.md",
  readme: "README.md",
  index: "docs/INDEX.md",
  status: "docs/STATUS.md",
  backlog: "docs/roadmap/MASTER_BACKLOG.md",
  queue: "docs/roadmap/NEXT_PR_QUEUE.md",
  desktop: "apps/web/desktop.js",
  reportScript: "scripts/create-seis-ssh-public-access-report.mjs",
  endpointContinuityScript: "scripts/check-seis-ssh-endpoint-continuity.mjs",
  onboardingScript: "scripts/create-seis-ssh-public-onboarding-pack.mjs",
  contributorDoctorScript: "scripts/check-seis-ssh-public-contributor-doctor.mjs",
  liveEvidence: "content/development/seis-ssh-live-readiness-evidence.json",
  liveEvidenceDoc: "docs/deployment/seis-ssh-live-readiness-evidence.md",
  liveEvidenceScript: "scripts/check-seis-ssh-live-readiness-evidence.mjs"
};

for (const file of Object.values(files)) read(file);

const contract = readJson(files.contract);
const accessModel = readJson(files.accessModel);
const roadmap = readJson(files.roadmap);
const packageJson = readJson(files.packageJson);
const scripts = packageJson?.scripts || {};

ensure(contract?.id === "seis-ssh-public-access-contract", "public access contract id must be stable");
ensure(contract?.status === "active", "public access contract must be active");
ensure(contract?.targetAlias === "SEIS-SSH", "public access contract must target SEIS-SSH");
ensure(contract?.sourceModel === files.accessModel, "public access contract must link access model");
ensure(contract?.sourceRoadmap === files.roadmap, "public access contract must link roadmap");
ensure(contract?.qualityGate === "npm run check:seis-ssh-public-access", "public access contract must expose quality gate");
ensure((contract?.evidenceSurfaces || []).includes(files.codexGitHandoff), "public access contract must cite Codex Git SSH handoff");

const serverPolicy = contract?.serverAndPortPolicy || {};
ensure(serverPolicy.mode === "preserve-existing-server-and-port", "server and port policy must preserve existing target");
ensure(serverPolicy.currentAlias === "SEIS-SSH", "server and port policy must bind to SEIS-SSH");
ensure(serverPolicy.englishInvariant === "Keep the same server and port.", "contract must include English same server and port invariant");
ensure(serverPolicy.turkishInvariant === "Ayni sunucu ve baglanti noktasi korunur.", "contract must include Turkish same server and port invariant");
ensure((serverPolicy.forbiddenActions || []).includes("change-port-without-owner-approval"), "contract must forbid port changes without owner approval");
ensure((serverPolicy.forbiddenActions || []).includes("change-host-to-localhost"), "contract must forbid localhost migration");
ensure((serverPolicy.forbiddenActions || []).includes("create-new-visible-alias-for-same-target"), "contract must forbid duplicate visible aliases");
const endpointContinuity = contract?.endpointContinuity || {};
ensure(endpointContinuity.mode === "sanitized-runtime-snapshot", "contract must define sanitized endpoint continuity evidence");
ensure(endpointContinuity.checkCommand === "npm run check:seis-ssh-endpoint-continuity", "contract must expose endpoint continuity check");
ensure(endpointContinuity.recordCommand === "npm run record:seis-ssh-endpoint-continuity", "contract must expose endpoint baseline recording command");
ensure(endpointContinuity.currentObservedPort === "22", "contract must preserve the currently observed port 22");
ensure(endpointContinuity.missingBaselineState === "baseline-required", "endpoint continuity must fail closed when no baseline exists");
ensure(endpointContinuity.migrationRequiresApproval === true, "endpoint migration must require owner approval");
ensure(endpointContinuity.autoMigration === false, "endpoint continuity must not auto-migrate");
const githubReader = (contract?.profiles || []).find((profile) => profile.id === "github-reader") || {};
const individualUser = (contract?.profiles || []).find((profile) => profile.id === "individual-user") || {};
ensure((githubReader.allowedActions || []).includes("run the read-only contributor doctor"), "github-reader profile must allow contributor doctor");
ensure((individualUser.requiredEvidence || []).includes("npm run check:seis-ssh-public-contributor-doctor"), "individual-user profile must require contributor doctor evidence");

ensure(accessModel?.publicAccessContract === files.contract, "access model must link public access contract");
ensure(roadmap?.publicAccessContract === files.contract, "roadmap must link public access contract");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-access"), "access model quality commands must include public access check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-access"), "roadmap validation commands must include public access check");

ensure(scripts["check:seis-ssh-public-access"] === "node scripts/check-seis-ssh-public-access.mjs", "package script check:seis-ssh-public-access must be declared");
ensure(scripts["check:seis-ssh-public-access-report"] === "node scripts/create-seis-ssh-public-access-report.mjs --check", "package script check:seis-ssh-public-access-report must be declared");
ensure(scripts["report:seis-ssh-public-access"] === "node scripts/create-seis-ssh-public-access-report.mjs --write", "package script report:seis-ssh-public-access must be declared");
ensure(scripts["check:seis-ssh-public-onboarding"] === "node scripts/create-seis-ssh-public-onboarding-pack.mjs --check", "package script check:seis-ssh-public-onboarding must be declared");
ensure(scripts["report:seis-ssh-public-onboarding"] === "node scripts/create-seis-ssh-public-onboarding-pack.mjs --write", "package script report:seis-ssh-public-onboarding must be declared");
ensure(scripts["check:seis-ssh-public-contributor-doctor"] === "node scripts/check-seis-ssh-public-contributor-doctor.mjs --check", "package script check:seis-ssh-public-contributor-doctor must be declared");
ensure(scripts["report:seis-ssh-public-contributor-doctor"] === "node scripts/check-seis-ssh-public-contributor-doctor.mjs --write", "package script report:seis-ssh-public-contributor-doctor must be declared");
ensure(scripts["check:seis-ssh-live-readiness-evidence"] === "node scripts/check-seis-ssh-live-readiness-evidence.mjs", "package script check:seis-ssh-live-readiness-evidence must be declared");
ensure(scripts["check:seis-ssh-endpoint-continuity"] === "node scripts/check-seis-ssh-endpoint-continuity.mjs", "package script check:seis-ssh-endpoint-continuity must be declared");
ensure(scripts["record:seis-ssh-endpoint-continuity"] === "node scripts/check-seis-ssh-endpoint-continuity.mjs --record --write", "package script record:seis-ssh-endpoint-continuity must be declared");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-access"), "quality:governance must include public access check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-contributor-doctor"), "quality:governance must include public contributor doctor check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-live-readiness-evidence"), "quality:governance must include live readiness evidence check");

for (const command of [
  "npm run check:seis-ssh-public-access",
  "npm run check:seis-ssh-public-access-report",
  "npm run report:seis-ssh-public-access",
  "npm run check:seis-ssh-public-onboarding",
  "npm run report:seis-ssh-public-onboarding",
  "npm run check:seis-ssh-public-contributor-doctor",
  "npm run report:seis-ssh-public-contributor-doctor",
  "npm run check:seis-ssh-live-readiness-evidence",
  "npm run check:seis-ssh-endpoint-continuity",
  "npm run check:seis-ssh-access-model",
  "npm run check:seis-ssh-picker-compatibility",
  "npm run check:seis-ssh-cloud-roadmap",
  "npm run check:seis-ssh-closed-runtime",
  "npm run check:seis-ssh-mobile-direct-cloud",
  "npm run check:seis-ssh-enterprise-benchmark"
]) {
  ensure((contract?.requiredCommands || []).includes(command), `public access contract must require ${command}`);
}

const approvalGates = new Set(contract?.approvalGates || []);
for (const gate of [
  "change-server-or-port",
  "install-managed-ssh-config",
  "bootstrap-remote-vm",
  "execute-live-ssh",
  "change-firewall-or-sshd",
  "push-merge-or-release"
]) {
  ensure(approvalGates.has(gate), `public access contract must include approval gate ${gate}`);
}

const docs = [
  files.runbook,
  files.codexGitHandoff,
  files.accessDoc,
  files.roadmapDoc,
  files.readme,
  files.index,
  files.status,
  files.backlog,
  files.queue
].map(read).join("\n");

for (const token of [
  "SEIS SSH Public GitHub Access",
  "SEIS-SSH",
  "Keep the same server and port.",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "npm run check:seis-ssh-public-access",
  "npm run report:seis-ssh-public-access",
  "npm run report:seis-ssh-public-onboarding",
  "npm run report:seis-ssh-public-contributor-doctor",
  "npm run check:seis-ssh-live-readiness-evidence",
  "npm run check:seis-ssh-endpoint-continuity",
  "deploy/seis-ssh-public-access-contract.json",
  "docs/deployment/seis-ssh-public-github-access.md",
  "docs/deployment/seis-codex-git-ssh-handoff.md",
  "Codex Git SSH Handoff",
  "GitHub Git SSH transport and SSH commit signing",
  "content/development/seis-ssh-live-readiness-evidence.json",
  "docs/deployment/seis-ssh-live-readiness-evidence.md"
]) {
  ensure(docs.includes(token), `docs must include ${token}`);
}

const desktop = read(files.desktop);
for (const token of [
  "SEIS_SSH_PUBLIC_ACCESS_CONTRACT",
  "Public GitHub SSH",
  "Keep same server and port",
  "seis-ssh-public-access.md",
  "seis-ssh-public-onboarding.md",
  "seis-ssh-public-contributor-doctor.md",
  "check:seis-ssh-live-readiness-evidence",
  "GitHub Codespaces billing",
  "npm run check:seis-ssh-public-access"
]) {
  ensure(desktop.includes(token), `desktop demo must include ${token}`);
}

const reportScript = read(files.reportScript);
for (const token of [
  "read-only-no-live-ssh",
  "hostnameSha256Prefix",
  "endpointFingerprintSha256Prefix",
  "proxyCommandShape",
  "continuityState",
  "liveConnectionAttempted: false",
  "Keep the same server and port.",
  "reports/seis-ssh-public-access/latest.md"
]) {
  ensure(reportScript.includes(token), `report script must include ${token}`);
}

const endpointContinuityScript = read(files.endpointContinuityScript);
for (const token of [
  "seis-ssh-endpoint-continuity-check",
  "endpointFingerprintSha256Prefix",
  "proxyCommandShape",
  "baseline-mismatch-requires-explicit-endpoint-migration-approval",
  "This check runs ssh -G only",
  "Changing HostName or Port remains approval-gated."
]) {
  ensure(endpointContinuityScript.includes(token), `endpoint continuity script must include ${token}`);
}

const onboardingScript = read(files.onboardingScript);
for (const token of [
  "read-only-no-live-ssh-no-config-write",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "npm run check:seis-ssh-public-onboarding",
  "reports/seis-ssh-public-access/onboarding-pack-latest.md",
  "This pack does not write ~/.ssh/config."
]) {
  ensure(onboardingScript.includes(token), `onboarding pack script must include ${token}`);
}

const contributorDoctorScript = read(files.contributorDoctorScript);
for (const token of [
  "read-only-no-live-ssh-no-config-write",
  "This doctor does not write ~/.ssh/config.",
  "npm run check:seis-ssh-public-contributor-doctor",
  "reports/seis-ssh-public-access/contributor-doctor-latest.md",
  "Ayni sunucu ve baglanti noktasi korunur."
]) {
  ensure(contributorDoctorScript.includes(token), `contributor doctor script must include ${token}`);
}

const liveEvidence = readJson(files.liveEvidence);
ensure(liveEvidence?.status === "blocked-provider-billing", "live readiness evidence must record blocked provider billing status");
ensure(liveEvidence?.liveProbe?.strictReady === false, "live readiness evidence must not claim strict readiness");
ensure(liveEvidence?.liveProbe?.port === "22", "live readiness evidence must preserve port 22");
ensure((liveEvidence?.claimsForbidden || []).includes("Do not claim SEIS-SSH is live-ready."), "live readiness evidence must forbid live-ready claim");

for (const file of [
  files.contract,
  files.runbook,
  files.codexGitHandoff,
  files.liveEvidence,
  files.liveEvidenceDoc,
  files.liveEvidenceScript,
  files.reportScript,
  files.onboardingScript,
  files.contributorDoctorScript,
  files.readme,
  files.index,
  files.status,
  files.backlog,
  files.queue,
  files.desktop
]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /(password|token|secret)\s*[:=]\s*["'][^"']{8,}/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS SSH public access check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH public access check passed.");

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
