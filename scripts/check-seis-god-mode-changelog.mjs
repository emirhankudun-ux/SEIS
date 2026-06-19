#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-god-mode-changelog.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-changelog.md");
const packagePath = path.join(root, "package.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const webStylesPath = path.join(root, "apps", "seis-demo-web", "styles.css");

const requiredEntries = [
  "dashboard",
  "goals",
  "repos",
  "docs",
  "agents",
  "security-ai-rollback",
  "validation",
  "architecture-decisions",
  "handoff",
  "completion-audit",
  "run-state",
  "staging-manifest",
];

ensureFile(contractPath, "God Mode changelog contract");
ensureFile(docsPath, "God Mode changelog docs");
ensureFile(packagePath, "package.json");
ensureFile(webIndexPath, "SEIS demo web index");
ensureFile(webScriptPath, "SEIS demo web script");
ensureFile(webStylesPath, "SEIS demo web styles");

const contract = readJson(contractPath, "God Mode changelog contract");
const docs = readText(docsPath, "God Mode changelog docs");
const packageJson = readJson(packagePath, "package.json");
const webIndex = readText(webIndexPath, "SEIS demo web index");
const webScript = readText(webScriptPath, "SEIS demo web script");
const webStyles = readText(webStylesPath, "SEIS demo web styles");

if (contract) {
  ensure(contract.id === "seis-god-mode-changelog", "contract id must be seis-god-mode-changelog");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.releaseState === "draft-unverified", "releaseState must stay draft-unverified until validation and CI evidence exist");
  ensure(contract.qualityGate === "npm run check:seis-god-mode-changelog", "contract must declare quality gate");
  ensureArrayIncludesAll(contract.requiredEntries, requiredEntries, "requiredEntries");
  ensure(Array.isArray(contract.entries), "contract.entries must be an array");
  ensureArrayMin(contract.releaseBlockers, 4, "releaseBlockers");
  ensureNonEmptyString(contract.completionRule, "completionRule");

  const entriesById = new Map((contract.entries || []).map((entry) => [entry.id, entry]));
  for (const entryId of requiredEntries) {
    const entry = entriesById.get(entryId);
    ensure(Boolean(entry), `changelog entry missing: ${entryId}`);
    if (!entry) continue;
    ensureNonEmptyString(entry.title, `${entryId}.title`);
    ensureNonEmptyString(entry.type, `${entryId}.type`);
    ensureNonEmptyString(entry.summary, `${entryId}.summary`);
    ensureArrayMin(entry.evidence, 2, `${entryId}.evidence`);
    ensure(String(entry.validationGate || "").startsWith("npm run check:"), `${entryId}.validationGate must be an npm check script`);
    for (const evidencePath of entry.evidence || []) {
      ensureFile(path.join(root, evidencePath), `${entryId} evidence`);
    }
  }
}

if (docs) {
  for (const phrase of [
    "draft-unverified",
    "Dashboard",
    "Goals",
    "Repos",
    "Docs",
    "Agents",
    "Security, AI, and Rollback",
    "Validation",
    "Architecture Decisions",
    "Handoff",
    "Completion Audit",
    "Run State",
    "Staging Manifest",
    "npm run check:seis-god-mode-changelog",
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-changelog"] === "node scripts/check-seis-god-mode-changelog.mjs",
    "package script missing check:seis-god-mode-changelog"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-god-mode-changelog"),
    "quality:governance must include changelog check"
  );
}

if (webIndex) {
  ensure(webIndex.includes("changelog-panel"), "web index must expose changelog panel");
  ensure(webIndex.includes("God Mode changelog"), "web index must name God Mode changelog");
}

if (webScript) {
  ensure(webScript.includes("renderGodModeChangelog"), "web script must render changelog");
  ensure(webScript.includes("seis_demo_changelog_viewed"), "web script must emit changelog telemetry");
}

if (webStyles) {
  ensure(webStyles.includes(".changelog-panel"), "web styles must include changelog panel styles");
  ensure(webStyles.includes(".changelog-grid"), "web styles must include changelog grid styles");
}

if (failures.length > 0) {
  console.error("SEIS God Mode changelog check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS God Mode changelog check passed.");

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
