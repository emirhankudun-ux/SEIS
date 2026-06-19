#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-command-center-operations-readiness.json");
const docsPath = path.join(root, "docs", "governance", "seis-command-center-operations-readiness.md");
const packagePath = path.join(root, "package.json");
const indexPath = path.join(root, "apps", "seis-core", "index.html");
const scriptPath = path.join(root, "apps", "seis-core", "script.js");
const stylesPath = path.join(root, "apps", "seis-core", "styles.css");
const testPath = path.join(root, "apps", "seis-core", "test", "seis-core-static.test.js");
const architectureDocPath = path.join(root, "docs", "architecture", "seis-command-center.md");
const readmePath = path.join(root, "apps", "seis-core", "README.md");

const requiredAreas = ["release", "ci", "security", "rollback", "handoff"];

for (const [filePath, label] of [
  [contractPath, "operations readiness contract"],
  [docsPath, "operations readiness docs"],
  [packagePath, "package.json"],
  [indexPath, "Command Center index"],
  [scriptPath, "Command Center script"],
  [stylesPath, "Command Center styles"],
  [testPath, "Command Center static test"],
  [architectureDocPath, "Command Center architecture doc"],
  [readmePath, "Command Center README"],
]) {
  ensureFile(filePath, label);
}

const contract = readJson(contractPath, "operations readiness contract");
const docs = readText(docsPath, "operations readiness docs");
const packageJson = readJson(packagePath, "package.json");
const index = readText(indexPath, "Command Center index");
const script = readText(scriptPath, "Command Center script");
const styles = readText(stylesPath, "Command Center styles");
const test = readText(testPath, "Command Center static test");
const architectureDoc = readText(architectureDocPath, "Command Center architecture doc");
const readme = readText(readmePath, "Command Center README");

if (contract) {
  ensure(contract.id === "seis-command-center-operations-readiness", "contract id must be seis-command-center-operations-readiness");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.decisionState === "review-before-release", "contract decisionState must remain review-before-release");
  ensure(contract.qualityGate === "npm run check:seis-command-center-operations-readiness", "contract must declare quality gate");
  ensure(contract.commandCenterSurface === "apps/seis-core", "contract must bind to apps/seis-core");
  ensureArrayIncludesAll(contract.requiredReadinessAreas, requiredAreas, "requiredReadinessAreas");
  ensureArrayMin(contract.summaryCards, 4, "summaryCards");
  ensureArrayMin(contract.checks, 6, "checks");
  ensureNonEmptyString(contract.completionRule, "completionRule");

  for (const item of contract.summaryCards || []) {
    ensureNonEmptyString(item.area, "summaryCards.area");
    ensure(["Ready", "Review", "Blocked"].includes(item.status), `${item.area}.status must be Ready, Review, or Blocked`);
    ensureNonEmptyString(item.evidence, `${item.area}.evidence`);
  }

  for (const item of contract.checks || []) {
    ensureNonEmptyString(item.name, "checks.name");
    ensureNonEmptyString(item.owner, `${item.name}.owner`);
    ensure(["Ready", "Review", "Blocked"].includes(item.status), `${item.name}.status must be Ready, Review, or Blocked`);
    ensureNonEmptyString(item.gate, `${item.name}.gate`);
    ensureNonEmptyString(item.evidence, `${item.name}.evidence`);
  }
}

for (const phrase of [
  "Operations Readiness",
  "review-before-release",
  "Release",
  "CI",
  "Security",
  "Rollback",
  "Handoff",
  "apps/seis-core",
  "npm run check:seis-command-center-operations-readiness",
]) {
  ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-command-center-operations-readiness"] === "node scripts/check-seis-command-center-operations-readiness.mjs",
    "package script missing check:seis-command-center-operations-readiness"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-command-center-operations-readiness"),
    "quality:governance must include operations readiness check"
  );
}

for (const phrase of [
  "Operations Readiness",
  "operations-readiness-state",
  "readiness-summary",
  "readiness-queue",
  "readiness-decision",
]) {
  ensure(index.includes(phrase), `index missing ${phrase}`);
}

for (const phrase of [
  "operationsReadiness",
  "renderOperationsReadiness",
  "qualityGate",
  "review-before-release",
]) {
  ensure(script.includes(phrase), `script missing ${phrase}`);
}

for (const selector of [
  ".operations-readiness-panel",
  ".readiness-summary-grid",
  ".readiness-card",
  ".readiness-row",
  ".decision-summary-card",
]) {
  ensure(styles.includes(selector), `styles missing ${selector}`);
}

for (const phrase of [
  "operationsReadiness",
  "renderOperationsReadiness",
  "operations-readiness-panel",
  "readiness-row",
]) {
  ensure(test.includes(phrase), `test missing ${phrase}`);
}

ensure(architectureDoc.includes("## Operations Readiness Model"), "architecture doc must include Operations Readiness Model");
ensure(readme.includes("Operations Readiness"), "README must describe Operations Readiness");

for (const file of [contractPath, docsPath, indexPath, scriptPath, stylesPath, testPath, architectureDocPath, readmePath]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /\b(?:password|token|secret)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS Command Center operations readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Command Center operations readiness check passed.");

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
