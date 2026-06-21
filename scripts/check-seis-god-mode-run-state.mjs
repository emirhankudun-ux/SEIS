#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-god-mode-run-state.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-run-state.md");
const packagePath = path.join(root, "package.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const webStylesPath = path.join(root, "apps", "seis-demo-web", "styles.css");
const runtimeEvidencePath = path.join(root, "content", "development", "seis-god-mode-runtime-evidence.json");
const evalCriticAdvisoryPath = path.join(root, "reports", "seis-eval-critic-advisory", "latest.json");

const requiredStates = [
  "source-controlled-artifacts",
  "runtime-surfaces",
  "telemetry-contracts",
  "validation-commands",
  "commit-boundary",
  "push-ci",
  "protected-user-work",
];

ensureFile(contractPath, "God Mode run-state contract");
ensureFile(docsPath, "God Mode run-state docs");
ensureFile(packagePath, "package.json");
ensureFile(webIndexPath, "SEIS demo web index");
ensureFile(webScriptPath, "SEIS demo web script");
ensureFile(webStylesPath, "SEIS demo web styles");
ensureFile(runtimeEvidencePath, "God Mode runtime evidence");
ensureFile(evalCriticAdvisoryPath, "SEIS eval critic advisory report");

const contract = readJson(contractPath, "God Mode run-state contract");
const docs = readText(docsPath, "God Mode run-state docs");
const packageJson = readJson(packagePath, "package.json");
const webIndex = readText(webIndexPath, "SEIS demo web index");
const webScript = readText(webScriptPath, "SEIS demo web script");
const webStyles = readText(webStylesPath, "SEIS demo web styles");
const runtimeEvidence = readJson(runtimeEvidencePath, "God Mode runtime evidence");
const evalCriticAdvisory = readJson(evalCriticAdvisoryPath, "SEIS eval critic advisory report");

if (contract) {
  ensure(contract.id === "seis-god-mode-run-state", "contract id must be seis-god-mode-run-state");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.runState === "pending-validation", "runState must remain pending-validation until validation and CI evidence exist");
  ensure(contract.qualityGate === "npm run check:seis-god-mode-run-state", "contract must declare quality gate");
  ensureArrayIncludesAll(contract.requiredStates, requiredStates, "requiredStates");
  ensure(Array.isArray(contract.states), "contract.states must be an array");
  ensureNonEmptyString(contract.completionRule, "completionRule");

  const statesById = new Map((contract.states || []).map((state) => [state.id, state]));
  for (const stateId of requiredStates) {
    const state = statesById.get(stateId);
    ensure(Boolean(state), `run-state item missing: ${stateId}`);
    if (!state) continue;
    ensureNonEmptyString(state.displayName, `${stateId}.displayName`);
    ensureNonEmptyString(state.state, `${stateId}.state`);
    ensureArrayMin(state.evidence, 1, `${stateId}.evidence`);
    ensureNonEmptyString(state.nextAction, `${stateId}.nextAction`);
    for (const evidencePath of state.evidence || []) {
      ensureFile(path.join(root, evidencePath), `${stateId} evidence`);
    }
  }
}

if (runtimeEvidence) {
  ensure(runtimeEvidence.browserResult?.ok === true, "runtime evidence browserResult.ok must be true");
  ensure(runtimeEvidence.aiEvaluator?.modelId === "seis-eval-critic-seed-v0", "runtime evidence must include eval critic model id");
  ensure(runtimeEvidence.aiEvaluator?.decision === "pass", "runtime evidence eval critic decision must be pass");
  ensure(
    runtimeEvidence.aiEvaluator?.advisoryReport === "reports/seis-eval-critic-advisory/latest.json",
    "runtime evidence must link eval critic advisory JSON"
  );
  ensure(
    Array.isArray(runtimeEvidence.aiEvaluator?.reviewedReports) &&
      runtimeEvidence.aiEvaluator.reviewedReports.includes("reports/seis-action-decisions/latest.json") &&
      runtimeEvidence.aiEvaluator.reviewedReports.includes("reports/seis-action-execution/latest.json") &&
      runtimeEvidence.aiEvaluator.reviewedReports.includes("reports/seis-action-execution/latest-run.json"),
    "runtime evidence must list all eval critic reviewed reports"
  );
  for (const [gate, value] of Object.entries(runtimeEvidence.aiEvaluator?.gates || {})) {
    ensure(value === true, `runtime evidence eval critic gate must pass: ${gate}`);
  }
}

if (evalCriticAdvisory) {
  ensure(evalCriticAdvisory.modelId === "seis-eval-critic-seed-v0", "eval critic advisory model id mismatch");
  ensure(evalCriticAdvisory.decision === "pass", "eval critic advisory decision must be pass");
  ensure(evalCriticAdvisory.summary?.total === 3, "eval critic advisory must review three reports");
  ensure(evalCriticAdvisory.summary?.block === 0, "eval critic advisory must not include blocked reports");
  ensure(evalCriticAdvisory.summary?.revise === 0, "eval critic advisory must not include revise reports");
}

if (docs) {
  for (const phrase of [
    "pending-validation",
    "Source-controlled artifacts",
    "Runtime surfaces",
    "Telemetry contracts",
    "Validation commands",
    "Commit boundary",
    "Push and CI",
    "Protected user work",
    "Eval critic advisory",
    "npm run check:seis-god-mode-run-state",
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-run-state"] === "node scripts/check-seis-god-mode-run-state.mjs",
    "package script missing check:seis-god-mode-run-state"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-god-mode-run-state"),
    "quality:governance must include run-state check"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-eval-critic-advisory"),
    "quality:governance must include eval critic advisory check"
  );
}

if (webIndex) {
  ensure(webIndex.includes("run-state-panel"), "web index must expose run-state panel");
  ensure(webIndex.includes("God Mode run state"), "web index must name God Mode run state");
}

if (webScript) {
  ensure(webScript.includes("renderGodModeRunState"), "web script must render run state");
  ensure(webScript.includes("seis_demo_run_state_viewed"), "web script must emit run-state telemetry");
}

if (webStyles) {
  ensure(webStyles.includes(".run-state-panel"), "web styles must include run-state panel styles");
  ensure(webStyles.includes(".run-state-grid"), "web styles must include run-state grid styles");
}

if (failures.length > 0) {
  console.error("SEIS God Mode run-state check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS God Mode run-state check passed.");

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
