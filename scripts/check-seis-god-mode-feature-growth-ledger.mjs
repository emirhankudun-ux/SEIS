#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const ledgerPath = path.join(root, "content", "development", "seis-god-mode-feature-growth-ledger.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-feature-growth-ledger.md");
const packagePath = path.join(root, "package.json");
const commandCenterIndexPath = path.join(root, "apps", "seis-core", "index.html");
const commandCenterScriptPath = path.join(root, "apps", "seis-core", "script.js");
const commandCenterStylesPath = path.join(root, "apps", "seis-core", "styles.css");
const commandCenterTestPath = path.join(root, "apps", "seis-core", "test", "seis-core-static.test.js");
const architectureDocPath = path.join(root, "docs", "architecture", "seis-command-center.md");
const completionAuditPath = path.join(root, "content", "development", "seis-god-mode-completion-audit.json");
const workPackagePath = path.join(root, "content", "development", "seis-god-mode-work-package.json");
const objectiveCoveragePath = path.join(root, "data", "seis-master-objective-coverage.json");
const releaseReadinessPath = path.join(root, "content", "development", "seis-god-mode-release-readiness.json");
const integrationPlanPath = path.join(root, "docs", "governance", "seis-command-center-feature-growth-integration-plan.md");

const requiredTopics = [
  "dashboard",
  "goals",
  "repos",
  "docs",
  "agents",
  "security",
  "ai-policy",
  "rollback",
  "validation",
  "handoff",
];

const requiredEvidenceKinds = [
  "feature-or-governance-improvement",
  "source-controlled-evidence",
  "quality-gate",
  "remaining-gap",
];

for (const [filePath, label] of [
  [ledgerPath, "God Mode feature growth ledger contract"],
  [docsPath, "God Mode feature growth ledger docs"],
  [packagePath, "package.json"],
  [commandCenterIndexPath, "Command Center index"],
  [commandCenterScriptPath, "Command Center script"],
  [commandCenterStylesPath, "Command Center styles"],
  [commandCenterTestPath, "Command Center static test"],
  [architectureDocPath, "Command Center architecture doc"],
  [completionAuditPath, "God Mode completion audit contract"],
  [workPackagePath, "God Mode work package contract"],
  [objectiveCoveragePath, "SEIS master objective coverage contract"],
  [releaseReadinessPath, "God Mode release readiness contract"],
  [integrationPlanPath, "Command Center feature growth integration plan"],
]) {
  ensureFile(filePath, label);
}

const ledger = readJson(ledgerPath, "God Mode feature growth ledger contract");
const docs = readText(docsPath, "God Mode feature growth ledger docs");
const packageJson = readJson(packagePath, "package.json");
const index = readText(commandCenterIndexPath, "Command Center index");
const script = readText(commandCenterScriptPath, "Command Center script");
const styles = readText(commandCenterStylesPath, "Command Center styles");
const test = readText(commandCenterTestPath, "Command Center static test");
const architectureDoc = readText(architectureDocPath, "Command Center architecture doc");
const completionAudit = readText(completionAuditPath, "God Mode completion audit contract");
const workPackage = readText(workPackagePath, "God Mode work package contract");
const objectiveCoverage = readText(objectiveCoveragePath, "SEIS master objective coverage contract");
const releaseReadiness = readText(releaseReadinessPath, "God Mode release readiness contract");
const integrationPlan = readText(integrationPlanPath, "Command Center feature growth integration plan");

if (ledger) {
  ensure(ledger.id === "seis-god-mode-feature-growth-ledger", "ledger id must be seis-god-mode-feature-growth-ledger");
  ensure(ledger.status === "active", "ledger status must be active");
  ensure(ledger.completionState === "not-complete", "ledger completionState must remain not-complete until commit, push, and CI evidence exist");
  ensure(ledger.qualityGate === "npm run check:seis-god-mode-feature-growth-ledger", "ledger must declare quality gate");
  ensure(ledger.commandCenterSurface === "apps/seis-core", "ledger must point to apps/seis-core as the command center surface");
  ensureArrayIncludesAll(ledger.requiredTopics, requiredTopics, "ledger.requiredTopics");
  ensureArrayIncludesAll(ledger.requiredEvidenceKinds, requiredEvidenceKinds, "ledger.requiredEvidenceKinds");
  ensure(Array.isArray(ledger.topics), "ledger.topics must be an array");
  ensureArrayMin(ledger.completionBlockers, 4, "ledger.completionBlockers");
  ensureNonEmptyString(ledger.completionRule, "ledger.completionRule");

  const topicsById = new Map((ledger.topics || []).map((topic) => [topic.id, topic]));
  for (const topicId of requiredTopics) {
    const topic = topicsById.get(topicId);
    ensure(Boolean(topic), `ledger topic missing: ${topicId}`);
    if (!topic) continue;
    ensureNonEmptyString(topic.displayName, `${topicId}.displayName`);
    ensure(topic.growthState === "improved-unverified", `${topicId}.growthState must be improved-unverified`);
    ensureNonEmptyString(topic.newImprovement, `${topicId}.newImprovement`);
    ensureArrayMin(topic.evidence, 2, `${topicId}.evidence`);
    ensure(String(topic.qualityGate || "").startsWith("npm run check:"), `${topicId}.qualityGate must be an npm check script`);
    ensureNonEmptyString(topic.remainingGap, `${topicId}.remainingGap`);
    for (const evidencePath of topic.evidence || []) {
      ensureFile(path.join(root, evidencePath), `${topicId} evidence`);
    }
  }

  for (const blocker of ["commit", "push", "CI", "staged-boundary"]) {
    ensure(
      (ledger.completionBlockers || []).some((item) => String(item).includes(blocker)),
      `ledger completionBlockers must include ${blocker}`
    );
  }
}

for (const phrase of [
  "Dashboard",
  "Goals",
  "Repos",
  "Docs",
  "Agents",
  "Security",
  "AI Policy",
  "Rollback",
  "Validation",
  "Handoff",
  "not-complete",
  "apps/seis-core",
  "npm run check:seis-god-mode-feature-growth-ledger",
]) {
  ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-feature-growth-ledger"] === "node scripts/check-seis-god-mode-feature-growth-ledger.mjs",
    "package script missing check:seis-god-mode-feature-growth-ledger"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-god-mode-feature-growth-ledger"),
    "quality:governance must include feature growth ledger check"
  );
}

for (const phrase of ["feature-growth-ledger", "Feature Growth Ledger", "feature-growth-summary", "feature-growth-blockers"]) {
  ensure(index.includes(phrase), `Command Center index missing ${phrase}`);
}

for (const phrase of ["featureGrowthLedger", "renderFeatureGrowthLedger", "completionState", "qualityGate"]) {
  ensure(script.includes(phrase), `Command Center script missing ${phrase}`);
}

for (const selector of [".feature-growth-ledger", ".ledger-summary-card", ".ledger-row", ".blocker-row"]) {
  ensure(styles.includes(selector), `Command Center styles missing ${selector}`);
}

for (const phrase of ["featureGrowthLedger", "renderFeatureGrowthLedger", "feature-growth-ledger", "ledger-row", "blocker-row"]) {
  ensure(test.includes(phrase), `Command Center static test missing ${phrase}`);
}

ensure(architectureDoc.includes("feature growth ledger"), "architecture doc must describe feature growth ledger");
ensure(completionAudit.includes("content/development/seis-god-mode-feature-growth-ledger.json"), "completion audit must cite feature growth ledger");
ensure(completionAudit.includes("\"feature-growth-ledger\""), "completion audit must include feature-growth-ledger as an audit item");
ensure(workPackage.includes("feature-growth-ledger"), "work package must include feature-growth-ledger section");
ensure(objectiveCoverage.includes("god-mode-every-topic-feature-growth"), "objective coverage must include God Mode every-topic growth");
ensure(objectiveCoverage.includes("content/development/seis-god-mode-feature-growth-ledger.json"), "objective coverage must cite feature growth ledger");
ensure(releaseReadiness.includes("\"feature-growth\""), "release readiness must include feature-growth gate");
ensure(releaseReadiness.includes("content/development/seis-god-mode-feature-growth-ledger.json"), "release readiness must cite feature growth ledger");
ensure(integrationPlan.includes("Safe Integration Sequence"), "integration plan must include safe integration sequence");

for (const file of [
  ledgerPath,
  docsPath,
  commandCenterIndexPath,
  commandCenterScriptPath,
  commandCenterStylesPath,
  completionAuditPath,
  workPackagePath,
  objectiveCoveragePath,
  releaseReadinessPath,
  integrationPlanPath,
]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /\b(?:password|token|secret)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS God Mode feature growth ledger check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS God Mode feature growth ledger check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(filePath, label) {
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  if (!Array.isArray(candidate)) return;
  for (const item of required) ensure(candidate.includes(item), `${label} missing: ${item}`);
}

function ensureArrayMin(candidate, minimum, label) {
  ensure(Array.isArray(candidate) && candidate.length >= minimum, `${label} must include at least ${minimum} items`);
}

function ensureNonEmptyString(candidate, label) {
  ensure(typeof candidate === "string" && candidate.trim().length > 0, `${label} must be a non-empty string`);
}

function requireNotMatches(filePath, pattern, reason) {
  const text = readText(filePath, path.relative(root, filePath));
  if (pattern.test(text)) {
    failures.push(`${path.relative(root, filePath)} may contain ${reason}`);
  }
}
