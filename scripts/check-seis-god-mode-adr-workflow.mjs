#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-god-mode-adr-workflow.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-adr-workflow.md");
const templatePath = path.join(root, "docs", "governance", "seis-adr-template.md");
const exampleAdrPath = path.join(root, "docs", "adr", "0001-seis-god-mode-operating-system.md");
const packagePath = path.join(root, "package.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const webStylesPath = path.join(root, "apps", "seis-demo-web", "styles.css");

const requiredWorkflowSteps = ["scope", "decision", "implementation", "validation", "handoff"];
const requiredAdrSections = ["Status", "Context", "Decision", "Consequences", "Security", "AI Policy", "Validation", "Rollback"];

ensureFile(contractPath, "God Mode ADR workflow contract");
ensureFile(docsPath, "God Mode ADR workflow docs");
ensureFile(templatePath, "SEIS ADR template");
ensureFile(exampleAdrPath, "God Mode example ADR");
ensureFile(packagePath, "package.json");
ensureFile(webIndexPath, "SEIS demo web index");
ensureFile(webScriptPath, "SEIS demo web script");
ensureFile(webStylesPath, "SEIS demo web styles");

const contract = readJson(contractPath, "God Mode ADR workflow contract");
const docs = readText(docsPath, "God Mode ADR workflow docs");
const template = readText(templatePath, "SEIS ADR template");
const exampleAdr = readText(exampleAdrPath, "God Mode example ADR");
const packageJson = readJson(packagePath, "package.json");
const webIndex = readText(webIndexPath, "SEIS demo web index");
const webScript = readText(webScriptPath, "SEIS demo web script");
const webStyles = readText(webStylesPath, "SEIS demo web styles");

if (contract) {
  ensure(contract.id === "seis-god-mode-adr-workflow", "contract id must be seis-god-mode-adr-workflow");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.qualityGate === "npm run check:seis-god-mode-adr-workflow", "contract must declare quality gate");
  ensureArrayMin(contract.requiredArtifacts, 3, "requiredArtifacts");
  ensureArrayIncludesAll(
    contract.requiredArtifacts,
    [
      "docs/governance/seis-adr-template.md",
      "docs/governance/seis-god-mode-adr-workflow.md",
      "docs/adr/0001-seis-god-mode-operating-system.md",
    ],
    "requiredArtifacts"
  );
  ensureArrayIncludesAll(contract.adrMinimumFields, ["status", "context", "decision", "consequences", "security", "aiPolicy", "validation", "rollback"], "adrMinimumFields");
  ensure(Array.isArray(contract.workflow), "contract.workflow must be an array");
  const workflowIds = new Set((contract.workflow || []).map((step) => step.id));
  for (const stepId of requiredWorkflowSteps) {
    ensure(workflowIds.has(stepId), `workflow missing step: ${stepId}`);
  }
  for (const step of contract.workflow || []) {
    ensureNonEmptyString(step.displayName, `${step.id}.displayName`);
    ensureNonEmptyString(step.rule, `${step.id}.rule`);
    ensureNonEmptyString(step.evidence, `${step.id}.evidence`);
  }
  ensureNonEmptyString(contract.completionRule, "completionRule");
}

if (docs) {
  for (const phrase of ["Scope", "Decision", "Implementation", "Validation", "Handoff", "npm run check:seis-god-mode-adr-workflow"]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

for (const [label, body] of [
  ["ADR template", template],
  ["example ADR", exampleAdr],
]) {
  if (!body) continue;
  for (const section of requiredAdrSections) {
    ensure(body.includes(`## ${section}`), `${label} missing ADR section: ${section}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-adr-workflow"] === "node scripts/check-seis-god-mode-adr-workflow.mjs",
    "package script missing check:seis-god-mode-adr-workflow"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-god-mode-adr-workflow"),
    "quality:governance must include ADR workflow check"
  );
}

if (webIndex) {
  ensure(webIndex.includes("adr-workflow-panel"), "web index must expose ADR workflow panel");
  ensure(webIndex.includes("God Mode ADR workflow"), "web index must name God Mode ADR workflow");
}

if (webScript) {
  ensure(webScript.includes("renderGodModeAdrWorkflow"), "web script must render ADR workflow");
  ensure(webScript.includes("seis_demo_adr_workflow_viewed"), "web script must emit ADR workflow telemetry");
}

if (webStyles) {
  ensure(webStyles.includes(".adr-workflow-panel"), "web styles must include ADR workflow panel styles");
  ensure(webStyles.includes(".adr-workflow-list"), "web styles must include ADR workflow list styles");
}

if (failures.length > 0) {
  console.error("SEIS God Mode ADR workflow check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS God Mode ADR workflow check passed.");

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
