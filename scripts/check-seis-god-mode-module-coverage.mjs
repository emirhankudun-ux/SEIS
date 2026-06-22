#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const coveragePath = path.join(root, "content", "development", "seis-god-mode-module-coverage.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-module-coverage.md");
const packagePath = path.join(root, "package.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const webStylesPath = path.join(root, "apps", "seis-demo-web", "styles.css");
const webContractPath = path.join(root, "apps", "seis-demo-web", "contracts", "seis-demo-contract.json");
const nativeContractPath = path.join(
  root,
  "packages",
  "seis_platform_swift",
  "Sources",
  "SeisAppleNativeShell",
  "Resources",
  "seis-demo-contract.json"
);

const requiredModules = ["dashboard", "goals", "repos", "docs", "agents"];
const requiredLayers = [
  "product-experience",
  "application-platform",
  "ai-agi-learning",
  "cloud-security",
  "governance-quality",
];

ensureFile(coveragePath, "God Mode module coverage contract");
ensureFile(docsPath, "God Mode module coverage docs");
ensureFile(packagePath, "package.json");
ensureFile(webIndexPath, "SEIS demo web index");
ensureFile(webScriptPath, "SEIS demo web script");
ensureFile(webStylesPath, "SEIS demo web styles");
ensureFile(webContractPath, "SEIS demo web shared contract");
ensureFile(nativeContractPath, "SEIS native shared contract");

const coverage = readJson(coveragePath, "God Mode module coverage contract");
const packageJson = readJson(packagePath, "package.json");
const docs = readText(docsPath, "God Mode module coverage docs");
const webIndex = readText(webIndexPath, "SEIS demo web index");
const webScript = readText(webScriptPath, "SEIS demo web script");
const webStyles = readText(webStylesPath, "SEIS demo web styles");
const webContract = readJson(webContractPath, "SEIS demo web shared contract");
const nativeContract = readJson(nativeContractPath, "SEIS native shared contract");

if (coverage) {
  ensure(coverage.id === "seis-god-mode-module-coverage", "coverage id must be seis-god-mode-module-coverage");
  ensure(coverage.status === "active", "coverage status must be active");
  ensure(coverage.qualityGate === "npm run check:seis-god-mode-module-coverage", "coverage must declare its quality gate");
  ensureArrayIncludesAll(coverage.requiredModules, requiredModules, "coverage.requiredModules");
  ensureArrayIncludesAll(coverage.requiredLayers, requiredLayers, "coverage.requiredLayers");
  ensure(Array.isArray(coverage.modules), "coverage.modules must be an array");

  const modulesById = new Map((coverage.modules || []).map((module) => [module.id, module]));
  for (const moduleId of requiredModules) {
    const module = modulesById.get(moduleId);
    ensure(Boolean(module), `coverage module missing: ${moduleId}`);
    if (!module) continue;

    ensureNonEmptyString(module.displayName, `${moduleId}.displayName`);
    ensureNonEmptyString(module.newFeature, `${moduleId}.newFeature`);
    ensureNonEmptyString(module.nextBuildSlice, `${moduleId}.nextBuildSlice`);
    ensure(Array.isArray(module.acceptanceEvidence) && module.acceptanceEvidence.length >= 3, `${moduleId}.acceptanceEvidence must include at least 3 items`);
    ensure(module.layers && typeof module.layers === "object", `${moduleId}.layers must be an object`);

    for (const layerId of requiredLayers) {
      const layer = module.layers?.[layerId];
      ensure(Boolean(layer), `${moduleId} layer missing: ${layerId}`);
      if (!layer) continue;
      ensureNonEmptyString(layer.evidence, `${moduleId}.${layerId}.evidence`);
      ensureNonEmptyString(layer.riskGate, `${moduleId}.${layerId}.riskGate`);
    }
  }

  ensure(Array.isArray(coverage.roadmap?.["30Days"]) && coverage.roadmap["30Days"].length >= requiredModules.length, "coverage roadmap must include a 30Days plan");
  ensure(Array.isArray(coverage.roadmap?.["90Days"]) && coverage.roadmap["90Days"].length >= requiredModules.length, "coverage roadmap must include a 90Days plan");
}

if (docs) {
  for (const label of ["Dashboard", "Goals", "Repos", "Docs", "Agents"]) {
    ensure(docs.includes(label), `docs must mention module: ${label}`);
  }

  for (const phrase of [
    "Product experience",
    "Application platform",
    "AI/AGI learning",
    "Cloud/security",
    "Governance/quality",
    "30 day roadmap",
    "90 day blueprint",
    "npm run check:seis-god-mode-module-coverage",
  ]) {
    ensure(docs.includes(phrase), `docs missing required phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-module-coverage"] === "node scripts/check-seis-god-mode-module-coverage.mjs",
    "package.json must define check:seis-god-mode-module-coverage"
  );
  ensure(
    typeof scripts["quality:governance"] === "string" &&
      scripts["quality:governance"].includes("npm run check:seis-god-mode-module-coverage"),
    "quality:governance must include check:seis-god-mode-module-coverage"
  );
}

if (webIndex) {
  ensure(webIndex.includes("module-coverage-panel"), "web index must expose the module coverage panel");
  ensure(webIndex.includes("module-coverage-grid"), "web index must expose the module coverage grid");
  ensure(webIndex.includes("God Mode module coverage"), "web index must name the God Mode module coverage feature");
  ensure(webIndex.includes("ecosystem-lanes-panel"), "web index must expose the ecosystem lanes panel");
}

if (webScript) {
  ensure(webScript.includes("renderGodModeModuleCoverage"), "web script must render God Mode module coverage");
  ensure(webScript.includes("renderGodModeEcosystemLanes"), "web script must render God Mode ecosystem lanes");
  ensure(webScript.includes("seis_demo_module_coverage_viewed"), "web script fallback contract must include module coverage event");
  ensure(webScript.includes("seis_demo_ecosystem_lanes_viewed"), "web script fallback contract must include ecosystem lanes event");
  ensure(webScript.includes("npm run check:seis-goals-evidence-ledger"), "web script must expose the goals evidence ledger gate");
  ensure(webScript.includes("npm run check:seis-repo-health-manifest"), "web script must expose the repo health manifest gate");
  ensure(webScript.includes("npm run check:seis-governance-index"), "web script must expose the governance index gate");
  ensure(webScript.includes("npm run check:seis-agent-lane-status"), "web script must expose the agent lane status gate");
  for (const label of ["Dashboard", "Goals", "Repos", "Docs", "Agents"]) {
    ensure(webScript.includes(label), `web script must render module card: ${label}`);
  }
}

if (webStyles) {
  ensure(webStyles.includes(".module-coverage-panel"), "web styles must include module coverage panel styles");
  ensure(webStyles.includes(".module-coverage-grid"), "web styles must include module coverage grid styles");
  ensure(webStyles.includes(".module-coverage-meta"), "web styles must include module coverage gate/evidence styles");
  ensure(webStyles.includes(".ecosystem-lanes-panel"), "web styles must include ecosystem lanes panel styles");
  ensure(webStyles.includes(".ecosystem-lanes-grid"), "web styles must include ecosystem lanes grid styles");
}

for (const [label, contract] of [
  ["web shared contract", webContract],
  ["native shared contract", nativeContract],
]) {
  if (!contract) continue;
  const eventNames = (contract.analytics_events || []).map((event) => event.name);
  for (const eventName of [
    "seis_demo_module_coverage_viewed",
    "seis_demo_release_readiness_viewed",
    "seis_demo_validation_plan_viewed",
    "seis_demo_work_package_viewed",
    "seis_demo_adr_workflow_viewed",
    "seis_demo_ecosystem_lanes_viewed",
    "seis_demo_handoff_viewed",
    "seis_demo_completion_audit_viewed",
    "seis_demo_run_state_viewed",
    "seis_demo_staging_manifest_viewed",
    "seis_demo_changelog_viewed",
  ]) {
    ensure(eventNames.includes(eventName), `${label} must include ${eventName}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS God Mode module coverage check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS God Mode module coverage check passed.");

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
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

function ensureNonEmptyString(candidate, label) {
  ensure(typeof candidate === "string" && candidate.trim().length > 0, `${label} must be a non-empty string`);
}
