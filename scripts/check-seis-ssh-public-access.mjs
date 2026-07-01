#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];

const files = {
  contract: "deploy/seis-ssh-public-access-contract.json",
  accessModel: "deploy/seis-ssh-access-model.json",
  roadmap: "deploy/seis-ssh-cloud-roadmap.json",
  packageJson: "package.json",
  runbook: "docs/deployment/seis-ssh-public-github-access.md",
  accessDoc: "docs/deployment/seis-ssh-access-model.md",
  roadmapDoc: "docs/deployment/seis-ssh-cloud-roadmap.md",
  boundaryScript: "scripts/check-seis-ssh-report-boundary.mjs",
  oracleOwnerActionPacket: "scripts/create-seis-ssh-oracle-owner-action-packet.mjs",
  githubCodespacesFallbackPlan: "scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs",
  providerStatusBoard: "scripts/create-seis-ssh-provider-status-board.mjs",
  reportScript: "scripts/create-seis-ssh-public-access-report.mjs",
  onboardingScript: "scripts/create-seis-ssh-public-onboarding-pack.mjs"
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

const serverPolicy = contract?.serverAndPortPolicy || {};
ensure(serverPolicy.mode === "preserve-existing-server-and-port", "server and port policy must preserve existing target");
ensure(serverPolicy.currentAlias === "SEIS-SSH", "server and port policy must bind to SEIS-SSH");
ensure(serverPolicy.englishInvariant === "Keep the same server and port.", "contract must include English invariant");
ensure(serverPolicy.turkishInvariant === "Ayni sunucu ve baglanti noktasi korunur.", "contract must include Turkish invariant");
ensure((serverPolicy.forbiddenActions || []).includes("change-port-without-owner-approval"), "contract must forbid port changes without owner approval");
ensure((serverPolicy.forbiddenActions || []).includes("change-host-to-localhost"), "contract must forbid localhost migration");
ensure((serverPolicy.forbiddenActions || []).includes("create-new-visible-alias-for-same-target"), "contract must forbid duplicate visible aliases");

const githubReader = (contract?.profiles || []).find((profile) => profile.id === "github-reader") || {};
const individualUser = (contract?.profiles || []).find((profile) => profile.id === "individual-user") || {};
ensure((githubReader.allowedActions || []).includes("run read-only report generation"), "github-reader profile must allow read-only reports");
ensure((individualUser.requiredEvidence || []).includes("npm run check:seis-ssh-public-access-report"), "individual profile must require public access report evidence");

ensure(accessModel?.publicAccessContract === files.contract, "access model must link public access contract");
ensure(roadmap?.publicAccessContract === files.contract, "roadmap must link public access contract");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-access"), "access model quality commands must include public access check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-access"), "roadmap validation commands must include public access check");

ensure(scripts["check:seis-ssh-public-access"] === "node scripts/check-seis-ssh-public-access.mjs", "missing check:seis-ssh-public-access script");
ensure(scripts["check:seis-ssh-report-boundary"] === "node scripts/check-seis-ssh-report-boundary.mjs", "missing check:seis-ssh-report-boundary script");
ensure(scripts["check:seis-ssh-github-codespaces-fallback-plan"] === "node scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs --check", "missing check:seis-ssh-github-codespaces-fallback-plan script");
ensure(scripts["cloud:ssh:github-codespaces:fallback-plan"] === "node scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs --write", "missing cloud:ssh:github-codespaces:fallback-plan script");
ensure(scripts["check:seis-ssh-provider-status-board"] === "node scripts/create-seis-ssh-provider-status-board.mjs --check", "missing check:seis-ssh-provider-status-board script");
ensure(scripts["cloud:ssh:provider-status:board"] === "node scripts/create-seis-ssh-provider-status-board.mjs --write --refresh", "missing cloud:ssh:provider-status:board script");
ensure(scripts["check:seis-ssh-oracle-owner-action-packet"] === "node scripts/create-seis-ssh-oracle-owner-action-packet.mjs --check", "missing check:seis-ssh-oracle-owner-action-packet script");
ensure(scripts["cloud:ssh:oracle-owner:action-packet"] === "node scripts/create-seis-ssh-oracle-owner-action-packet.mjs --write --refresh", "missing cloud:ssh:oracle-owner:action-packet script");
ensure(scripts["check:seis-ssh-public-access-report"] === "node scripts/create-seis-ssh-public-access-report.mjs --check", "missing check:seis-ssh-public-access-report script");
ensure(scripts["report:seis-ssh-public-access"] === "node scripts/create-seis-ssh-public-access-report.mjs --write", "missing report:seis-ssh-public-access script");
ensure(scripts["check:seis-ssh-public-onboarding"] === "node scripts/create-seis-ssh-public-onboarding-pack.mjs --check", "missing check:seis-ssh-public-onboarding script");
ensure(scripts["report:seis-ssh-public-onboarding"] === "node scripts/create-seis-ssh-public-onboarding-pack.mjs --write", "missing report:seis-ssh-public-onboarding script");
ensure(scripts["run:seis-ssh-public-onboarding"] === "node scripts/check-seis-ssh-report-boundary.mjs && node scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs --check && node scripts/create-seis-ssh-provider-status-board.mjs --check && node scripts/create-seis-ssh-oracle-owner-action-packet.mjs --check && node scripts/check-seis-ssh-public-access.mjs && node scripts/create-seis-ssh-public-access-report.mjs --check && node scripts/create-seis-ssh-public-onboarding-pack.mjs --write", "missing run:seis-ssh-public-onboarding script");

for (const command of [
  "npm run check:seis-ssh-public-access",
  "npm run check:seis-ssh-report-boundary",
  "npm run check:seis-ssh-cloudflare-access-plan",
  "npm run check:seis-ssh-github-codespaces-fallback-plan",
  "npm run check:seis-ssh-provider-status-board",
  "npm run check:seis-ssh-oracle-owner-action-packet",
  "npm run check:seis-ssh-public-access-report",
  "npm run report:seis-ssh-public-access",
  "npm run check:seis-ssh-public-onboarding",
  "npm run report:seis-ssh-public-onboarding",
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
  files.accessDoc,
  files.roadmapDoc
].map(read).join("\n");

for (const token of [
  "SEIS SSH Public GitHub Access",
  "SEIS-SSH",
  "Keep the same server and port.",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "npm run check:seis-ssh-public-access",
  "npm run check:seis-ssh-report-boundary",
  "npm run check:seis-ssh-github-codespaces-fallback-plan",
  "npm run check:seis-ssh-provider-status-board",
  "npm run check:seis-ssh-oracle-owner-action-packet",
  "npm run report:seis-ssh-public-access",
  "npm run report:seis-ssh-public-onboarding",
  "deploy/seis-ssh-public-access-contract.json",
  "docs/deployment/seis-ssh-public-github-access.md"
]) {
  ensure(docs.includes(token), `docs must include ${token}`);
}

const reportScript = read(files.reportScript);
for (const token of [
  "read-only-no-live-ssh",
  "hostnameSha256Prefix",
  "liveConnectionAttempted: false",
  "Keep the same server and port.",
  "reports/seis-ssh-public-access/latest.md"
]) {
  ensure(reportScript.includes(token), `report script must include ${token}`);
}

const onboardingScript = read(files.onboardingScript);
for (const token of [
  "read-only-no-live-ssh-no-config-write",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "npm run check:seis-ssh-public-onboarding",
  "npm run check:seis-ssh-report-boundary",
  "npm run check:seis-ssh-github-codespaces-fallback-plan",
  "npm run check:seis-ssh-provider-status-board",
  "npm run check:seis-ssh-oracle-owner-action-packet",
  "npm run check:seis-ssh-cloudflare-access-plan",
  "reports/seis-ssh-public-access/onboarding-pack-latest.md",
  "This pack does not write ~/.ssh/config."
]) {
  ensure(onboardingScript.includes(token), `onboarding pack script must include ${token}`);
}

for (const file of Object.values(files)) {
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
