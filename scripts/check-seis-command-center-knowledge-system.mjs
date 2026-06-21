#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-command-center-knowledge-system.json");
const docsPath = path.join(root, "docs", "governance", "seis-command-center-knowledge-system.md");
const packagePath = path.join(root, "package.json");
const indexPath = path.join(root, "apps", "seis-core", "index.html");
const scriptPath = path.join(root, "apps", "seis-core", "script.js");
const stylesPath = path.join(root, "apps", "seis-core", "styles.css");
const testPath = path.join(root, "apps", "seis-core", "test", "seis-core-static.test.js");
const architecturePath = path.join(root, "docs", "architecture", "seis-command-center.md");
const readmePath = path.join(root, "apps", "seis-core", "README.md");
const commandCenterCheckPath = path.join(root, "scripts", "check-seis-command-center.mjs");

const requiredNodes = [
  "Repository Memory",
  "Research Sources",
  "Decision History",
  "Reusable Patterns",
  "Security Policy",
  "AI Agent Handoffs"
];

for (const [filePath, label] of [
  [contractPath, "Knowledge System contract"],
  [docsPath, "Knowledge System docs"],
  [packagePath, "package.json"],
  [indexPath, "Command Center index"],
  [scriptPath, "Command Center script"],
  [stylesPath, "Command Center styles"],
  [testPath, "Command Center static tests"],
  [architecturePath, "Command Center architecture doc"],
  [readmePath, "Command Center README"],
  [commandCenterCheckPath, "Command Center checker"]
]) {
  ensureFile(filePath, label);
}

const contract = readJson(contractPath, "Knowledge System contract");
const docs = readText(docsPath, "Knowledge System docs");
const packageJson = readJson(packagePath, "package.json");
const index = readText(indexPath, "Command Center index");
const script = readText(scriptPath, "Command Center script");
const styles = readText(stylesPath, "Command Center styles");
const test = readText(testPath, "Command Center static tests");
const architecture = readText(architecturePath, "Command Center architecture doc");
const readme = readText(readmePath, "Command Center README");
const commandCenterCheck = readText(commandCenterCheckPath, "Command Center checker");

if (contract) {
  ensure(contract.id === "seis-command-center-knowledge-system", "contract id must be seis-command-center-knowledge-system");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.commandCenterSurface === "apps/seis-core", "contract must point at apps/seis-core");
  ensure(contract.qualityGate === "npm run check:seis-command-center-knowledge-system", "contract must declare the npm quality gate");
  ensureArrayIncludesAll(contract.requiredNodes, requiredNodes, "requiredNodes");
  ensureArrayIncludesAll(contract.requiredEvidenceKinds, [
    "knowledge-graph-node",
    "relationship-contract",
    "memory-freshness",
    "decision-impact",
    "reusable-pattern"
  ], "requiredEvidenceKinds");
  ensure(contract.securityBoundary?.storesSecrets === false, "securityBoundary.storesSecrets must be false");
  ensureArrayMin(contract.evidence, 6, "evidence");
  for (const evidencePath of contract.evidence || []) {
    ensureFile(path.join(root, evidencePath), `contract evidence ${evidencePath}`);
  }
}

for (const phrase of [
  "Knowledge System",
  "Repository Memory",
  "Research Sources",
  "Decision History",
  "Reusable Patterns",
  "Security Policy",
  "AI Agent Handoffs",
  "memory evidence",
  "npm run check:seis-command-center-knowledge-system"
]) {
  ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-command-center-knowledge-system"] === "node scripts/check-seis-command-center-knowledge-system.mjs",
    "package.json must expose check:seis-command-center-knowledge-system"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-command-center-knowledge-system"),
    "quality:governance must include Knowledge System check"
  );
}

for (const id of [
  "knowledge-node-grid",
  "knowledge-edge-list",
  "memory-evidence-list",
  "decision-history-list",
  "pattern-library"
]) {
  ensure(index.includes(`id="${id}"`), `index missing ${id}`);
}

for (const phrase of [
  "knowledgeGraphNodes",
  "knowledgeEdges",
  "memoryEvidence",
  "decisionHistory",
  "reusablePatterns",
  ...requiredNodes
]) {
  ensure(script.includes(phrase), `script missing ${phrase}`);
  ensure(test.includes(phrase) || commandCenterCheck.includes(phrase), `tests or checker missing ${phrase}`);
}

for (const selector of [
  ".knowledge-map-panel",
  ".knowledge-node-card",
  ".knowledge-edge-row",
  ".memory-evidence-row",
  ".decision-history-row",
  ".pattern-card"
]) {
  ensure(styles.includes(selector), `styles missing ${selector}`);
  ensure(test.includes(selector.slice(1)) || commandCenterCheck.includes(selector), `tests or checker missing ${selector}`);
}

ensure(architecture.includes("## Knowledge System Model"), "architecture doc must include Knowledge System Model");
ensure(readme.includes("Knowledge: knowledge graph"), "README must describe the Knowledge graph surface");

for (const file of [contractPath, docsPath, indexPath, scriptPath, stylesPath, testPath, architecturePath, readmePath]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /\b(?:password|token|secret)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS Command Center Knowledge System check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Command Center Knowledge System check passed.");

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
  ensure(Array.isArray(candidate) && candidate.length >= minimum, `${label} must include at least ${minimum} item(s)`);
}

function requireNotMatches(filePath, pattern, reason) {
  const text = readText(filePath, path.relative(root, filePath));
  if (pattern.test(text)) {
    failures.push(`${path.relative(root, filePath)} may contain ${reason}`);
  }
}
