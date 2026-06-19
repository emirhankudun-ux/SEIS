#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const coveragePath = "data/seis-master-objective-coverage.json";
const coverageReportPath = "reports/seis-master-objective-coverage.md";
const coverageReportGeneratorPath = "scripts/create-seis-master-objective-coverage-report.mjs";
const trackerPath = "data/seis-operational-goal-tracker.json";
const implementationMapPath = "data/seis-master-prompt-implementation-map.json";
const acceptanceCriteriaPath = "data/seis-master-prompt-acceptance-criteria.json";
const masterPromptPath = "docs/governance/seis-master-prompt.md";
const readmePath = "README.md";
const packagePath = "package.json";

const coverage = readJson(coveragePath);
const packageJson = readJson(packagePath);
const implementationMap = readJson(implementationMapPath);
const acceptanceCriteria = readJson(acceptanceCriteriaPath);

requireIncludes(readmePath, coveragePath, "README must link the objective coverage matrix");
requireIncludes(readmePath, coverageReportPath, "README must link the objective coverage report");
requireIncludes(masterPromptPath, coveragePath, "Master Prompt must link the objective coverage matrix");
requireIncludes(masterPromptPath, coverageReportPath, "Master Prompt must link the objective coverage report");
requireIncludes(implementationMapPath, coveragePath, "implementation map must reference objective coverage");
requireIncludes(implementationMapPath, coverageReportPath, "implementation map must reference objective coverage report");
requireIncludes(implementationMapPath, coverageReportGeneratorPath, "implementation map must reference objective coverage report generator");
requireIncludes(acceptanceCriteriaPath, coveragePath, "acceptance criteria must reference objective coverage");
requireIncludes(acceptanceCriteriaPath, coverageReportPath, "acceptance criteria must reference objective coverage report");
requireIncludes(coverageReportGeneratorPath, "data/ssh-hardening-operation-contract.json", "objective coverage report generator must include the SSH hardening operation contract");
requireIncludes(coverageReportGeneratorPath, "SSH Hardening Operation Coverage", "objective coverage report generator must render SSH operation coverage");
requireIncludes(coverageReportGeneratorPath, "Mode isolation", "objective coverage report generator must render mode isolation evidence");
requireIncludes(coverageReportGeneratorPath, "Firewall and lockout safety", "objective coverage report generator must render firewall lockout evidence");
requireIncludes(coverageReportGeneratorPath, "Idempotency and failure handling", "objective coverage report generator must render idempotency and failure-handling evidence");
requireIncludes(coverageReportPath, "## SSH Hardening Operation Coverage", "objective coverage report must include SSH operation coverage");
requireIncludes(coverageReportPath, "Mode isolation", "objective coverage report must include mode isolation evidence");
requireIncludes(coverageReportPath, "Firewall and lockout safety", "objective coverage report must include firewall lockout evidence");
requireIncludes(coverageReportPath, "Idempotency and failure handling", "objective coverage report must include idempotency and failure-handling evidence");

if (coverage) {
  ensure(coverage.contract === "SEIS Master Objective Coverage", `${coveragePath} must define the coverage contract`);
  ensure(coverage.status === "active", `${coveragePath} must be active`);
  ensure(coverage.reportPath === coverageReportPath, `${coveragePath} must expose reportPath`);
  ensure(coverage.reportGeneratorPath === coverageReportGeneratorPath, `${coveragePath} must expose reportGeneratorPath`);
  ensure(Array.isArray(coverage.coverageStatusValues), `${coveragePath} must define coverageStatusValues`);
  ensure(Array.isArray(coverage.coverage) && coverage.coverage.length >= 8, `${coveragePath} must map at least eight objective areas`);
  const allowedStatuses = new Set(coverage.coverageStatusValues || []);
  const ids = new Set();
  for (const item of coverage.coverage || []) {
    ensure(item && typeof item === "object", `${coveragePath} coverage items must be objects`);
    ensure(typeof item.id === "string" && item.id.length > 0, `${coveragePath} each item must define id`);
    ensure(!ids.has(item.id), `${coveragePath} duplicate coverage id: ${item.id}`);
    ids.add(item.id);
    ensure(typeof item.requirement === "string" && item.requirement.length > 0, `${coveragePath} ${item.id} must define requirement`);
    ensure(allowedStatuses.has(item.status), `${coveragePath} ${item.id} status must match coverageStatusValues`);
    ensure(Array.isArray(item.evidence) && item.evidence.length >= 2, `${coveragePath} ${item.id} must list evidence`);
    ensure(Array.isArray(item.checks) && item.checks.length >= 1, `${coveragePath} ${item.id} must list checks`);
    ensure(typeof item.gap === "string" && item.gap.length > 0, `${coveragePath} ${item.id} must define gap`);
  }

  for (const expected of [
    "user-work-protection",
    "security-and-privacy",
    "architecture-and-maintainability",
    "documentation-traceability",
    "apple-first-platform",
    "design-accessibility-experience",
    "ai-data-cloud-automation",
    "open-source-github-readiness",
    "god-mode-every-topic-feature-growth",
  ]) {
    ensure(ids.has(expected), `${coveragePath} must include ${expected}`);
  }

  for (const command of [
    "npm run check:seis-master-objective-coverage",
    "npm run check:seis-master-objective-coverage-report",
    "npm run check:seis-god-mode-feature-growth-ledger",
    "npm run check:seis-god-mode-module-coverage",
    "npm run check:seis-god-mode-work-package",
    "npm run check:seis-god-mode-completion-audit",
    "npm run check:seis-operational-goal-tracker",
    "npm run check:seis-master-prompt-report",
    "npm run check:seis-master-prompt",
    "npm run quality",
  ]) {
    ensure((coverage.requiredCommands || []).includes(command), `${coveragePath} must require ${command}`);
  }

  const securityCoverage = findCoverage(coverage, "security-and-privacy");
  if (securityCoverage) {
    requireCoverageIncludes(securityCoverage, "evidence", "data/ssh-hardening-operation-contract.json", "security coverage must cite the SSH hardening operation contract");
    requireCoverageIncludes(securityCoverage, "evidence", "docs/deployment/ssh-wireguard-vps-cloud-server.md", "security coverage must cite the SSH/WireGuard deployment guide");
    requireCoverageIncludes(securityCoverage, "checks", "npm run check:ssh-hardening-contract", "security coverage must require the SSH hardening contract check");
    ensure(
      String(securityCoverage.gap || "").includes("mode-isolation") &&
        String(securityCoverage.gap || "").includes("lockout-safety") &&
        String(securityCoverage.gap || "").includes("fail-fast"),
      `${coveragePath} security-and-privacy gap must track mode-isolation, lockout-safety, and fail-fast validation`
    );
  }

  const cloudCoverage = findCoverage(coverage, "ai-data-cloud-automation");
  if (cloudCoverage) {
    requireCoverageIncludes(cloudCoverage, "evidence", "data/ssh-hardening-operation-contract.json", "AI/data/cloud coverage must cite the SSH hardening operation contract");
    requireCoverageIncludes(cloudCoverage, "evidence", "docs/deployment/ssh-wireguard-vps-cloud-server.md", "AI/data/cloud coverage must cite the SSH/WireGuard deployment guide");
    requireCoverageIncludes(cloudCoverage, "checks", "npm run check:ssh-vpn-cloud-server", "AI/data/cloud coverage must require SSH/VPN cloud validation");
  }

  const godModeGrowthCoverage = findCoverage(coverage, "god-mode-every-topic-feature-growth");
  if (godModeGrowthCoverage) {
    requireCoverageIncludes(
      godModeGrowthCoverage,
      "evidence",
      "content/development/seis-god-mode-feature-growth-ledger.json",
      "God Mode growth coverage must cite the feature growth ledger"
    );
    requireCoverageIncludes(
      godModeGrowthCoverage,
      "evidence",
      "content/development/seis-god-mode-module-coverage.json",
      "God Mode growth coverage must cite the module coverage contract"
    );
    requireCoverageIncludes(
      godModeGrowthCoverage,
      "evidence",
      "content/development/seis-god-mode-completion-audit.json",
      "God Mode growth coverage must cite the completion audit"
    );
    requireCoverageIncludes(
      godModeGrowthCoverage,
      "evidence",
      "roadmap/seis-next-steps-implementation-pack.md",
      "God Mode growth coverage must cite the next steps implementation pack"
    );
    requireCoverageIncludes(
      godModeGrowthCoverage,
      "checks",
      "npm run check:seis-god-mode-feature-growth-ledger",
      "God Mode growth coverage must require feature growth ledger validation"
    );
    requireCoverageIncludes(
      godModeGrowthCoverage,
      "checks",
      "npm run check:seis-god-mode-module-coverage",
      "God Mode growth coverage must require module coverage validation"
    );
    requireCoverageIncludes(
      godModeGrowthCoverage,
      "checks",
      "npm run check:seis-god-mode-completion-audit",
      "God Mode growth coverage must require completion audit validation"
    );
    ensure(
      String(godModeGrowthCoverage.gap || "").includes("Commit") &&
        String(godModeGrowthCoverage.gap || "").includes("push") &&
        String(godModeGrowthCoverage.gap || "").includes("CI"),
      `${coveragePath} god-mode-every-topic-feature-growth gap must keep commit, push, and CI evidence open`
    );
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-master-objective-coverage"] === "node scripts/check-seis-master-objective-coverage.mjs",
    "package.json must expose check:seis-master-objective-coverage"
  );
  ensure(
    scripts["check:seis-master-objective-coverage-report"] === "node scripts/create-seis-master-objective-coverage-report.mjs --check",
    "package.json must expose check:seis-master-objective-coverage-report"
  );
  ensure(
    scripts["automation:seis-master-objective-coverage-report"] === "node scripts/create-seis-master-objective-coverage-report.mjs",
    "package.json must expose automation:seis-master-objective-coverage-report"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-master-objective-coverage"),
    "quality:governance must include npm run check:seis-master-objective-coverage"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-master-objective-coverage-report"),
    "quality:governance must include npm run check:seis-master-objective-coverage-report"
  );
}

if (implementationMap) {
  ensure(implementationMap.objectiveCoveragePath === coveragePath, `${implementationMapPath} must expose objectiveCoveragePath`);
  ensure(implementationMap.objectiveCoverageReportPath === coverageReportPath, `${implementationMapPath} must expose objectiveCoverageReportPath`);
  ensure(
    implementationMap.objectiveCoverageReportGeneratorPath === coverageReportGeneratorPath,
    `${implementationMapPath} must expose objectiveCoverageReportGeneratorPath`
  );
  ensure(
    implementationMap.objectiveCoverageCheckPath === "scripts/check-seis-master-objective-coverage.mjs",
    `${implementationMapPath} must expose objectiveCoverageCheckPath`
  );
}

if (acceptanceCriteria) {
  ensure(
    (acceptanceCriteria.requiredCommands || []).includes("npm run check:seis-master-objective-coverage"),
    `${acceptanceCriteriaPath} must require npm run check:seis-master-objective-coverage`
  );
  ensure(
    (acceptanceCriteria.requiredCommands || []).includes("npm run check:seis-master-objective-coverage-report"),
    `${acceptanceCriteriaPath} must require npm run check:seis-master-objective-coverage-report`
  );
}

for (const file of [coveragePath, coverageReportPath, coverageReportGeneratorPath, trackerPath, implementationMapPath, acceptanceCriteriaPath, masterPromptPath, readmePath]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /\b(?:password|token|secret)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS master objective coverage check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS master objective coverage check passed.");

function read(file) {
  const absolutePath = path.join(root, file);
  if (!fs.existsSync(absolutePath)) {
    fail(`missing ${file}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function requireIncludes(file, token, reason = token) {
  if (!read(file).includes(token)) {
    fail(`${file} must include ${reason}`);
  }
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) {
    fail(`${file} must not include ${reason}`);
  }
}

function ensure(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function findCoverage(coverage, id) {
  return (coverage.coverage || []).find((item) => item && item.id === id);
}

function requireCoverageIncludes(item, field, token, reason) {
  const values = Array.isArray(item[field]) ? item[field] : [];
  ensure(
    values.some((value) => String(value).includes(token)),
    `${coveragePath} ${item.id} ${reason}`
  );
}

function fail(message) {
  failures.push(message);
}
