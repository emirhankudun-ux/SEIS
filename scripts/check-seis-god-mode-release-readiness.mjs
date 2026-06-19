#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-god-mode-release-readiness.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-release-readiness.md");
const packagePath = path.join(root, "package.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const webStylesPath = path.join(root, "apps", "seis-demo-web", "styles.css");

const requiredGates = ["security", "ai-policy", "quality-evidence", "feature-growth", "rollback", "ci-readiness"];

ensureFile(contractPath, "God Mode release readiness contract");
ensureFile(docsPath, "God Mode release readiness docs");
ensureFile(packagePath, "package.json");
ensureFile(webIndexPath, "SEIS demo web index");
ensureFile(webScriptPath, "SEIS demo web script");
ensureFile(webStylesPath, "SEIS demo web styles");

const contract = readJson(contractPath, "God Mode release readiness contract");
const docs = readText(docsPath, "God Mode release readiness docs");
const packageJson = readJson(packagePath, "package.json");
const webIndex = readText(webIndexPath, "SEIS demo web index");
const webScript = readText(webScriptPath, "SEIS demo web script");
const webStyles = readText(webStylesPath, "SEIS demo web styles");

if (contract) {
  ensure(contract.id === "seis-god-mode-release-readiness", "contract id must be seis-god-mode-release-readiness");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.qualityGate === "npm run check:seis-god-mode-release-readiness", "contract must declare quality gate");
  ensureArrayIncludesAll(contract.requiredGates, requiredGates, "contract.requiredGates");
  ensure(Array.isArray(contract.gates), "contract.gates must be an array");

  const gates = new Map((contract.gates || []).map((gate) => [gate.id, gate]));
  for (const gateId of requiredGates) {
    const gate = gates.get(gateId);
    ensure(Boolean(gate), `release readiness gate missing: ${gateId}`);
    if (!gate) continue;
    ensureNonEmptyString(gate.displayName, `${gateId}.displayName`);
    ensure(gate.status === "required", `${gateId}.status must be required`);
    ensureNonEmptyString(gate.rule, `${gateId}.rule`);
    ensureArrayMin(gate.evidence, 2, `${gateId}.evidence`);
    ensureNonEmptyString(gate.failureMode, `${gateId}.failureMode`);
    for (const evidencePath of gate.evidence || []) {
      ensureFile(path.join(root, evidencePath), `${gateId} evidence`);
    }
  }

  ensureNonEmptyString(contract.completionRule, "completionRule");
}

if (docs) {
  for (const phrase of [
    "Security",
    "AI Policy",
    "Quality Evidence",
    "Feature Growth",
    "Rollback",
    "CI Readiness",
    "npm run check:seis-god-mode-release-readiness",
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-release-readiness"] === "node scripts/check-seis-god-mode-release-readiness.mjs",
    "package script missing check:seis-god-mode-release-readiness"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-god-mode-release-readiness"),
    "quality:governance must include release readiness check"
  );
}

if (webIndex) {
  ensure(webIndex.includes("release-readiness-panel"), "web index must expose release readiness panel");
  ensure(webIndex.includes("God Mode release readiness"), "web index must name God Mode release readiness");
}

if (webScript) {
  ensure(webScript.includes("renderGodModeReleaseReadiness"), "web script must render release readiness");
  ensure(webScript.includes("seis_demo_release_readiness_viewed"), "web script must emit release readiness telemetry");
  for (const label of ["Security", "AI Policy", "Quality Evidence", "Feature Growth", "Rollback", "CI Readiness"]) {
    ensure(webScript.includes(label), `web script must expose release gate: ${label}`);
  }
}

if (webStyles) {
  ensure(webStyles.includes(".release-readiness-panel"), "web styles must include release readiness panel styles");
  ensure(webStyles.includes(".release-readiness-grid"), "web styles must include release readiness grid styles");
}

if (failures.length > 0) {
  console.error("SEIS God Mode release readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS God Mode release readiness check passed.");

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
