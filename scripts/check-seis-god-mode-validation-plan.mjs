#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-god-mode-validation-plan.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-validation-plan.md");
const packagePath = path.join(root, "package.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const webStylesPath = path.join(root, "apps", "seis-demo-web", "styles.css");

const requiredCommands = [
  "npm run check:seis-god-mode-developer",
  "npm run check:seis-god-mode-module-coverage",
  "npm run check:seis-goals-evidence-ledger",
  "npm run check:seis-repo-health-manifest",
  "npm run check:seis-governance-index",
  "npm run check:seis-agent-lane-status",
  "npm run check:seis-god-mode-release-readiness",
  "npm run check:seis-god-mode-validation-plan",
  "npm run check:seis-god-mode-work-package",
  "npm run check:seis-god-mode-adr-workflow",
  "npm run check:seis-god-mode-handoff",
  "npm run check:seis-god-mode-completion-audit",
  "npm run check:seis-god-mode-run-state",
  "npm run check:seis-god-mode-staging-manifest",
  "npm run check:seis-god-mode-changelog",
  "npm run check:seis-god-mode-feature-growth-ledger",
  "npm run quality:governance",
];

ensureFile(contractPath, "God Mode validation plan contract");
ensureFile(docsPath, "God Mode validation plan docs");
ensureFile(packagePath, "package.json");
ensureFile(webIndexPath, "SEIS demo web index");
ensureFile(webScriptPath, "SEIS demo web script");
ensureFile(webStylesPath, "SEIS demo web styles");

const contract = readJson(contractPath, "God Mode validation plan contract");
const docs = readText(docsPath, "God Mode validation plan docs");
const packageJson = readJson(packagePath, "package.json");
const webIndex = readText(webIndexPath, "SEIS demo web index");
const webScript = readText(webScriptPath, "SEIS demo web script");
const webStyles = readText(webStylesPath, "SEIS demo web styles");

if (contract) {
  ensure(contract.id === "seis-god-mode-validation-plan", "contract id must be seis-god-mode-validation-plan");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.qualityGate === "npm run check:seis-god-mode-validation-plan", "contract must declare quality gate");
  ensureArrayIncludesAll(contract.requiredCommands, requiredCommands, "contract.requiredCommands");
  ensure(Array.isArray(contract.commandGroups), "contract.commandGroups must be an array");
  ensureNonEmptyString(contract.completionRule, "completionRule");
  const groupedCommands = new Set((contract.commandGroups || []).map((group) => group.command));
  for (const command of requiredCommands) {
    ensure(groupedCommands.has(command), `commandGroups missing required command: ${command}`);
  }

  for (const group of contract.commandGroups || []) {
    ensureNonEmptyString(group.id, "commandGroup.id");
    ensureNonEmptyString(group.displayName, `${group.id}.displayName`);
    ensure(requiredCommands.includes(group.command), `${group.id}.command must be a required command`);
    ensureNonEmptyString(group.proofTarget, `${group.id}.proofTarget`);
    ensureArrayMin(group.evidence, 2, `${group.id}.evidence`);
    ensureNonEmptyString(group.failureMode, `${group.id}.failureMode`);
    for (const evidencePath of group.evidence || []) {
      ensureFile(path.join(root, evidencePath), `${group.id} evidence`);
    }
  }
}

if (docs) {
  for (const phrase of [
    "God Mode foundation",
    "Module coverage",
    "Goal evidence",
    "Repo health",
    "Governance index",
    "Agent lanes",
    "Release readiness",
    "Work package",
    "ADR workflow",
    "Handoff",
    "Completion audit",
    "Run state",
    "Staging manifest",
    "Changelog",
    "Feature growth ledger",
    "Full governance",
    "npm run check:seis-god-mode-validation-plan",
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-validation-plan"] === "node scripts/check-seis-god-mode-validation-plan.mjs",
    "package script missing check:seis-god-mode-validation-plan"
  );
  for (const command of requiredCommands) {
    const scriptName = command.replace("npm run ", "");
    ensure(Boolean(scripts[scriptName]), `package script missing required command: ${scriptName}`);
  }
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-god-mode-validation-plan"),
    "quality:governance must include validation plan check"
  );
}

if (webIndex) {
  ensure(webIndex.includes("validation-plan-panel"), "web index must expose validation plan panel");
  ensure(webIndex.includes("God Mode validation plan"), "web index must name God Mode validation plan");
}

if (webScript) {
  ensure(webScript.includes("renderGodModeValidationPlan"), "web script must render validation plan");
  ensure(webScript.includes("seis_demo_validation_plan_viewed"), "web script must emit validation plan telemetry");
  for (const command of requiredCommands) {
    ensure(webScript.includes(command), `web script must expose command: ${command}`);
  }
}

if (webStyles) {
  ensure(webStyles.includes(".validation-plan-panel"), "web styles must include validation plan panel styles");
  ensure(webStyles.includes(".validation-plan-list"), "web styles must include validation plan list styles");
}

if (failures.length > 0) {
  console.error("SEIS God Mode validation plan check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS God Mode validation plan check passed.");

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
  for (const item of required) {
    ensure(candidate.includes(item), `${label} missing: ${item}`);
  }
}

function ensureArrayMin(candidate, minimum, label) {
  ensure(Array.isArray(candidate) && candidate.length >= minimum, `${label} must include at least ${minimum} items`);
}

function ensureNonEmptyString(candidate, label) {
  ensure(typeof candidate === "string" && candidate.trim().length > 0, `${label} must be a non-empty string`);
}
