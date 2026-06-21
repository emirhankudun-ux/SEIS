#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-god-mode-completion-audit.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-completion-audit.md");
const packagePath = path.join(root, "package.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const webStylesPath = path.join(root, "apps", "seis-demo-web", "styles.css");

const requiredAuditItems = [
  "new-features",
  "feature-growth-ledger",
  "dashboard",
  "goals",
  "repos",
  "docs",
  "agents",
  "security-ai-rollback",
  "validation",
  "commit-push-ci",
  "protected-user-work",
];

ensureFile(contractPath, "God Mode completion audit contract");
ensureFile(docsPath, "God Mode completion audit docs");
ensureFile(packagePath, "package.json");
ensureFile(webIndexPath, "SEIS demo web index");
ensureFile(webScriptPath, "SEIS demo web script");
ensureFile(webStylesPath, "SEIS demo web styles");

const contract = readJson(contractPath, "God Mode completion audit contract");
const docs = readText(docsPath, "God Mode completion audit docs");
const packageJson = readJson(packagePath, "package.json");
const webIndex = readText(webIndexPath, "SEIS demo web index");
const webScript = readText(webScriptPath, "SEIS demo web script");
const webStyles = readText(webStylesPath, "SEIS demo web styles");

if (contract) {
  ensure(contract.id === "seis-god-mode-completion-audit", "contract id must be seis-god-mode-completion-audit");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.completionState === "not-complete", "completionState must remain not-complete until validation, commit, push, and CI evidence exist");
  ensure(contract.qualityGate === "npm run check:seis-god-mode-completion-audit", "contract must declare quality gate");
  ensureArrayIncludesAll(contract.requiredAuditItems, requiredAuditItems, "requiredAuditItems");
  ensure(Array.isArray(contract.auditItems), "contract.auditItems must be an array");
  ensureArrayMin(contract.completionBlockers, 4, "completionBlockers");
  ensureNonEmptyString(contract.completionRule, "completionRule");

  const itemsById = new Map((contract.auditItems || []).map((item) => [item.id, item]));
  for (const itemId of requiredAuditItems) {
    const item = itemsById.get(itemId);
    ensure(Boolean(item), `audit item missing: ${itemId}`);
    if (!item) continue;
    ensureNonEmptyString(item.displayName, `${itemId}.displayName`);
    ensure(["implemented-unverified", "missing-evidence"].includes(item.state), `${itemId}.state must be implemented-unverified or missing-evidence`);
    ensureNonEmptyString(item.evidenceStatus, `${itemId}.evidenceStatus`);
    ensureArrayMin(item.evidence, 1, `${itemId}.evidence`);
    ensureArrayMin(item.missingEvidence, 1, `${itemId}.missingEvidence`);
    ensureNonEmptyString(item.completionRule, `${itemId}.completionRule`);
    for (const evidencePath of item.evidence || []) {
      ensureFile(path.join(root, evidencePath), `${itemId} evidence`);
    }
  }
}

if (docs) {
  for (const phrase of [
    "not-complete",
    "New Features",
    "Feature Growth Ledger",
    "Dashboard",
    "Goals",
    "Repos",
    "Docs",
    "Agents",
    "Security, AI, and Rollback",
    "Validation",
    "Commit, Push, and CI",
    "Protected User Work",
    "npm run check:seis-god-mode-completion-audit",
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-completion-audit"] === "node scripts/check-seis-god-mode-completion-audit.mjs",
    "package script missing check:seis-god-mode-completion-audit"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-god-mode-completion-audit"),
    "quality:governance must include completion audit check"
  );
}

if (webIndex) {
  ensure(webIndex.includes("completion-audit-panel"), "web index must expose completion audit panel");
  ensure(webIndex.includes("God Mode completion audit"), "web index must name God Mode completion audit");
}

if (webScript) {
  ensure(webScript.includes("renderGodModeCompletionAudit"), "web script must render completion audit");
  ensure(webScript.includes("seis_demo_completion_audit_viewed"), "web script must emit completion audit telemetry");
}

if (webStyles) {
  ensure(webStyles.includes(".completion-audit-panel"), "web styles must include completion audit panel styles");
  ensure(webStyles.includes(".completion-audit-grid"), "web styles must include completion audit grid styles");
}

if (failures.length > 0) {
  console.error("SEIS God Mode completion audit check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS God Mode completion audit check passed.");

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
