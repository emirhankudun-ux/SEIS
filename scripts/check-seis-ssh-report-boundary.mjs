#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const failures = [];

const command = "npm run check:seis-ssh-report-boundary";
const script = "scripts/check-seis-ssh-report-boundary.mjs";

const generatedReportPaths = [
  "reports/seis-ssh-public-access/latest.json",
  "reports/seis-ssh-public-access/onboarding-pack-latest.md",
  "reports/seis-ssh-direct-cloud-activation-plan.json",
  "reports/seis-ssh-direct-cloud-activation-plan.md",
  "reports/seis-ssh-direct-cloud-readiness-claim.json",
  "reports/seis-ssh-direct-cloud-readiness-claim.md",
  "reports/seis-ssh-oracle-free-tier-plan.json",
  "reports/seis-ssh-oracle-free-tier-plan.md",
  "reports/seis-ssh-oracle-cloud-init-handoff.json",
  "reports/seis-ssh-oracle-cloud-init-handoff.md",
  "reports/seis-ssh-oracle-cloud-init-handoff.yaml",
  "reports/seis-ssh-oracle-instance-launch-plan.json",
  "reports/seis-ssh-oracle-instance-launch-plan.md",
  "reports/seis-ssh-oracle-owner-input-template.env",
  "reports/seis-ssh-oracle-owner-input-template.json",
  "reports/seis-ssh-oracle-owner-input-template.md",
  "reports/seis-ssh-oracle-owner-preflight.json",
  "reports/seis-ssh-oracle-owner-preflight.md",
  "reports/seis-ssh-oracle-owner-launch-command.json",
  "reports/seis-ssh-oracle-owner-launch-command.md",
  "reports/seis-ssh-oracle-owner-launch-command.sh",
  "reports/seis-ssh-oracle-owner-handoff-bundle.json",
  "reports/seis-ssh-oracle-owner-handoff-bundle.md",
  "reports/seis-ssh-oracle-postboot-handoff.json",
  "reports/seis-ssh-oracle-postboot-handoff.md",
  "reports/seis-ssh-oracle-direct-cloud-pipeline.json",
  "reports/seis-ssh-oracle-direct-cloud-pipeline.md",
  "reports/seis-ssh-cloudflare-access-plan.json",
  "reports/seis-ssh-cloudflare-access-plan.md",
  "reports/seis-ssh-github-codespaces-fallback-plan.json",
  "reports/seis-ssh-github-codespaces-fallback-plan.md",
  "reports/seis-ssh-provider-status-board.json",
  "reports/seis-ssh-provider-status-board.md",
  "reports/seis-ssh-mobile-24x7-readiness.json",
  "reports/seis-ssh-mobile-24x7-readiness.md",
  "reports/seis-ssh-mobile-direct-cloud-profile.json",
  "reports/seis-ssh-mobile-direct-cloud-profile.md"
];

const sourceContractPaths = [
  "deploy/seis-ssh-public-access-contract.json",
  "deploy/seis-ssh-direct-cloud-provider-matrix.json",
  "deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json",
  "deploy/seis-ssh-access-model.json",
  "deploy/seis-ssh-cloud-roadmap.json",
  "docs/deployment/seis-ssh-direct-cloud-provider-matrix.md",
  "docs/deployment/seis-ssh-direct-cloud-activation-plan.md",
  "docs/deployment/seis-ssh-oracle-free-tier-direct-cloud.md",
  "docs/deployment/seis-ssh-public-github-access.md",
  "docs/deployment/seis-ssh-cloud-roadmap.md",
  "scripts/create-seis-ssh-cloudflare-access-plan.mjs",
  "scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs",
  "scripts/create-seis-ssh-provider-status-board.mjs",
  script
];

const gitignore = readText(".gitignore");
const packageJson = readJson("package.json");
const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json");
const oraclePlan = readJson("deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json");
const accessModel = readJson("deploy/seis-ssh-access-model.json");
const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json");
const docs = [
  "docs/deployment/seis-ssh-public-github-access.md",
  "docs/deployment/seis-ssh-cloud-roadmap.md",
  "docs/deployment/seis-ssh-direct-cloud-provider-matrix.md",
  "docs/deployment/seis-ssh-oracle-free-tier-direct-cloud.md"
].map(readText).join("\n");

ensure(packageJson?.scripts?.["check:seis-ssh-report-boundary"] === `node ${script}`, "package script must declare SEIS SSH report boundary check");
ensure(matrix?.reportBoundaryGuard?.script === script, "provider matrix must link report boundary guard script");
ensure(matrix?.reportBoundaryGuard?.checkCommand === command, "provider matrix must link report boundary guard check command");
ensure(matrix?.reportBoundaryGuard?.generatedReportsIgnored === true, "provider matrix must require generated reports to stay ignored");
ensure(matrix?.reportBoundaryGuard?.sourceContractsCommittable === true, "provider matrix must require source contracts to stay committable");
ensure(matrix?.reportBoundaryGuard?.callsProviderApis === false, "report boundary guard must not call provider APIs");
ensure(matrix?.reportBoundaryGuard?.opensSshSession === false, "report boundary guard must not open SSH");
ensure(matrix?.reportBoundaryGuard?.printsSecrets === false, "report boundary guard must not print secrets");
ensure(oraclePlan?.reportBoundaryGuard?.script === script, "Oracle plan must link report boundary guard script");
ensure(oraclePlan?.reportBoundaryGuard?.checkCommand === command, "Oracle plan must link report boundary guard check command");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes(command), "access model quality commands must include report boundary check");
ensure((roadmap?.validationCommands || []).includes(command), "roadmap validation commands must include report boundary check");

for (const pattern of [
  "reports/seis-ssh-public-access/",
  "reports/seis-ssh-oracle-owner-input-template.env",
  "reports/seis-ssh-oracle-owner-launch-command.sh",
  "reports/seis-ssh-oracle-owner-handoff-bundle.json",
  "reports/seis-ssh-oracle-direct-cloud-pipeline.md",
  "reports/seis-ssh-github-codespaces-fallback-plan.json",
  "reports/seis-ssh-github-codespaces-fallback-plan.md",
  "reports/seis-ssh-provider-status-board.json",
  "reports/seis-ssh-provider-status-board.md",
  "!deploy/seis-ssh-public-access-contract.json",
  "!deploy/seis-ssh-direct-cloud-provider-matrix.json",
  "!deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json",
  "!docs/deployment/",
  "!docs/deployment/seis-ssh-direct-cloud-provider-matrix.md",
  "!docs/deployment/seis-ssh-public-github-access.md"
]) {
  ensure(gitignore.includes(pattern), `.gitignore must include ${pattern}`);
}

for (const reportPath of generatedReportPaths) {
  ensure(gitignore.includes(reportPath) || reportPath.startsWith("reports/seis-ssh-public-access/"), `.gitignore must mention ${reportPath}`);
  ensure(isIgnored(reportPath), `generated report must be ignored: ${reportPath}`);
}

for (const sourcePath of sourceContractPaths) {
  ensure(existsSync(sourcePath), `source contract must exist: ${sourcePath}`);
  ensure(!isIgnoredByStatus(sourcePath), `source contract must not be ignored: ${sourcePath}`);
}

for (const token of [
  "SEIS SSH Report Boundary",
  "npm run check:seis-ssh-report-boundary",
  "generated reports stay ignored",
  "source docs and contracts stay committable",
  "does not call provider APIs",
  "does not open SSH"
]) {
  ensure(docs.includes(token), `docs must include ${token}`);
}

for (const file of [
  ".gitignore",
  "package.json",
  "deploy/seis-ssh-direct-cloud-provider-matrix.json",
  "deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json",
  "deploy/seis-ssh-access-model.json",
  "deploy/seis-ssh-cloud-roadmap.json",
  "docs/deployment/seis-ssh-public-github-access.md",
  "docs/deployment/seis-ssh-cloud-roadmap.md",
  "docs/deployment/seis-ssh-direct-cloud-provider-matrix.md",
  "docs/deployment/seis-ssh-oracle-free-tier-direct-cloud.md",
  "scripts/create-seis-ssh-cloudflare-access-plan.mjs",
  "scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs",
  "scripts/create-seis-ssh-provider-status-board.mjs",
  script
]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /(password|token|secret)\s*[:=]\s*["'][^"']{8,}/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS SSH report boundary check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SEIS SSH report boundary check passed: ${generatedReportPaths.length} generated report paths ignored, ${sourceContractPaths.length} source paths committable.`);

function readText(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    failures.push(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function isIgnored(file) {
  const result = spawnSync("git", ["check-ignore", "-q", "--", file], {
    encoding: "utf8",
    timeout: 10000
  });
  if (result.error) {
    failures.push(`git check-ignore failed for ${file}: ${result.error.message}`);
    return false;
  }
  return result.status === 0;
}

function isIgnoredByStatus(file) {
  const result = spawnSync("git", ["status", "--ignored", "--short", "--", file], {
    encoding: "utf8",
    timeout: 10000
  });
  if (result.error || result.status !== 0) {
    const message = result.error?.message || (result.stderr || "git status failed").trim();
    failures.push(`git status failed for ${file}: ${message}`);
    return true;
  }
  return (result.stdout || "").split(/\r?\n/).some((line) => line.startsWith("!! "));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(readText(file))) failures.push(`${file} must not include ${reason}`);
}
