#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-god-mode-work-package.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-work-package.md");
const packagePath = path.join(root, "package.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const webStylesPath = path.join(root, "apps", "seis-demo-web", "styles.css");

const requiredSections = [
  "product-surface",
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
  "changelog",
];

ensureFile(contractPath, "God Mode work package contract");
ensureFile(docsPath, "God Mode work package docs");
ensureFile(packagePath, "package.json");
ensureFile(webIndexPath, "SEIS demo web index");
ensureFile(webScriptPath, "SEIS demo web script");
ensureFile(webStylesPath, "SEIS demo web styles");

const contract = readJson(contractPath, "God Mode work package contract");
const docs = readText(docsPath, "God Mode work package docs");
const packageJson = readJson(packagePath, "package.json");
const webIndex = readText(webIndexPath, "SEIS demo web index");
const webScript = readText(webScriptPath, "SEIS demo web script");
const webStyles = readText(webStylesPath, "SEIS demo web styles");

if (contract) {
  ensure(contract.id === "seis-god-mode-work-package", "contract id must be seis-god-mode-work-package");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.qualityGate === "npm run check:seis-god-mode-work-package", "contract must declare quality gate");
  ensure(contract.commitReadiness === "pending-validation", "commitReadiness must be pending-validation until checks run");
  ensure(contract.releaseReadiness === "pending-validation", "releaseReadiness must be pending-validation until checks run");
  ensureArrayIncludesAll(contract.requiredPackageSections, requiredSections, "contract.requiredPackageSections");
  ensure(Array.isArray(contract.sections), "contract.sections must be an array");
  ensureArrayMin(contract.blockedCompletionReasons, 3, "blockedCompletionReasons");
  ensureNonEmptyString(contract.completionRule, "completionRule");

  const sectionsById = new Map((contract.sections || []).map((section) => [section.id, section]));
  for (const sectionId of requiredSections) {
    const section = sectionsById.get(sectionId);
    ensure(Boolean(section), `work package section missing: ${sectionId}`);
    if (!section) continue;
    ensureNonEmptyString(section.displayName, `${sectionId}.displayName`);
    ensure(section.status === "implemented-unverified", `${sectionId}.status must be implemented-unverified`);
    ensureNonEmptyString(section.changeSummary, `${sectionId}.changeSummary`);
    ensureArrayMin(section.primaryFiles, 3, `${sectionId}.primaryFiles`);
    ensure(String(section.qualityGate || "").startsWith("npm run check:"), `${sectionId}.qualityGate must be an npm check script`);
    ensureNonEmptyString(section.rollbackPlan, `${sectionId}.rollbackPlan`);
    for (const filePath of section.primaryFiles || []) {
      ensureFile(path.join(root, filePath), `${sectionId} primary file`);
    }
  }
}

if (docs) {
  for (const phrase of [
    "Product Surface",
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
    "Changelog",
    "npm run check:seis-god-mode-work-package",
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-work-package"] === "node scripts/check-seis-god-mode-work-package.mjs",
    "package script missing check:seis-god-mode-work-package"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-god-mode-work-package"),
    "quality:governance must include work package check"
  );
}

if (webIndex) {
  ensure(webIndex.includes("work-package-panel"), "web index must expose work package panel");
  ensure(webIndex.includes("God Mode work package"), "web index must name God Mode work package");
}

if (webScript) {
  ensure(webScript.includes("renderGodModeWorkPackage"), "web script must render work package");
  ensure(webScript.includes("renderGodModeEcosystemLanes"), "web script must render ecosystem lanes");
  ensure(webScript.includes("seis_demo_work_package_viewed"), "web script must emit work package telemetry");
  ensure(webScript.includes("seis_demo_ecosystem_lanes_viewed"), "web script must emit ecosystem lanes telemetry");
  for (const label of ["Product Surface", "Goals", "Repos", "Docs", "Agents", "Security + AI + Rollback", "Validation", "Architecture Decisions", "Handoff", "Completion Audit", "Run State", "Staging Manifest", "Changelog"]) {
    ensure(webScript.includes(label), `web script must expose work package section: ${label}`);
  }
}

if (webStyles) {
  ensure(webStyles.includes(".work-package-panel"), "web styles must include work package panel styles");
  ensure(webStyles.includes(".work-package-grid"), "web styles must include work package grid styles");
}

if (failures.length > 0) {
  console.error("SEIS God Mode work package check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS God Mode work package check passed.");

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
