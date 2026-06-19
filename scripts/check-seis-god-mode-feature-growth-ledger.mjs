#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const ledgerPath = path.join(root, "content", "development", "seis-god-mode-feature-growth-ledger.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-feature-growth-ledger.md");
const packagePath = path.join(root, "package.json");
const completionAuditPath = path.join(root, "content", "development", "seis-god-mode-completion-audit.json");
const objectiveCoveragePath = path.join(root, "data", "seis-master-objective-coverage.json");

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

ensureFile(ledgerPath, "God Mode feature growth ledger contract");
ensureFile(docsPath, "God Mode feature growth ledger docs");
ensureFile(packagePath, "package.json");
ensureFile(completionAuditPath, "God Mode completion audit contract");
ensureFile(objectiveCoveragePath, "SEIS master objective coverage contract");

const ledger = readJson(ledgerPath, "God Mode feature growth ledger contract");
const docs = readText(docsPath, "God Mode feature growth ledger docs");
const packageJson = readJson(packagePath, "package.json");
const completionAudit = readText(completionAuditPath, "God Mode completion audit contract");
const objectiveCoverage = readText(objectiveCoveragePath, "SEIS master objective coverage contract");

if (ledger) {
  ensure(ledger.id === "seis-god-mode-feature-growth-ledger", "ledger id must be seis-god-mode-feature-growth-ledger");
  ensure(ledger.status === "active", "ledger status must be active");
  ensure(ledger.completionState === "not-complete", "ledger completionState must remain not-complete until commit, push, and CI evidence exist");
  ensure(ledger.qualityGate === "npm run check:seis-god-mode-feature-growth-ledger", "ledger must declare quality gate");
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

if (docs) {
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
    "npm run check:seis-god-mode-feature-growth-ledger",
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
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

ensure(completionAudit.includes("content/development/seis-god-mode-feature-growth-ledger.json"), "completion audit must cite feature growth ledger");
ensure(objectiveCoverage.includes("god-mode-every-topic-feature-growth"), "objective coverage must include God Mode every-topic growth");
ensure(objectiveCoverage.includes("content/development/seis-god-mode-feature-growth-ledger.json"), "objective coverage must cite feature growth ledger");

for (const file of [ledgerPath, docsPath, completionAuditPath, objectiveCoveragePath]) {
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
  if (pattern.test(text)) failures.push(`${path.relative(root, filePath)} must not include ${reason}`);
}
