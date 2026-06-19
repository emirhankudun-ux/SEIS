#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-god-mode-handoff.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-handoff.md");
const packagePath = path.join(root, "package.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const webStylesPath = path.join(root, "apps", "seis-demo-web", "styles.css");

const requiredSections = [
  "summary",
  "changedSurfaces",
  "validationStatus",
  "risks",
  "rollback",
  "nextCommands",
  "protectedUserWork",
];

ensureFile(contractPath, "God Mode handoff contract");
ensureFile(docsPath, "God Mode handoff docs");
ensureFile(packagePath, "package.json");
ensureFile(webIndexPath, "SEIS demo web index");
ensureFile(webScriptPath, "SEIS demo web script");
ensureFile(webStylesPath, "SEIS demo web styles");

const contract = readJson(contractPath, "God Mode handoff contract");
const docs = readText(docsPath, "God Mode handoff docs");
const packageJson = readJson(packagePath, "package.json");
const webIndex = readText(webIndexPath, "SEIS demo web index");
const webScript = readText(webScriptPath, "SEIS demo web script");
const webStyles = readText(webStylesPath, "SEIS demo web styles");

if (contract) {
  ensure(contract.id === "seis-god-mode-handoff", "contract id must be seis-god-mode-handoff");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.qualityGate === "npm run check:seis-god-mode-handoff", "contract must declare quality gate");
  ensure(contract.handoffState === "pending-validation", "handoffState must be pending-validation until checks run");
  ensureArrayIncludesAll(contract.requiredSections, requiredSections, "requiredSections");
  ensure(Array.isArray(contract.sections), "contract.sections must be an array");
  ensureNonEmptyString(contract.completionRule, "completionRule");

  const sectionsById = new Map((contract.sections || []).map((section) => [section.id, section]));
  for (const sectionId of requiredSections) {
    const section = sectionsById.get(sectionId);
    ensure(Boolean(section), `handoff section missing: ${sectionId}`);
    if (!section) continue;
    ensure(section.required === true, `${sectionId}.required must be true`);
    ensureNonEmptyString(section.title, `${sectionId}.title`);
    ensureNonEmptyString(section.content, `${sectionId}.content`);
    ensureArrayMin(section.evidence, 1, `${sectionId}.evidence`);
    for (const evidencePath of section.evidence || []) {
      ensureFile(path.join(root, evidencePath), `${sectionId} evidence`);
    }
  }

  const nextCommands = sectionsById.get("nextCommands")?.commands || [];
  ensureArrayIncludesAll(
    nextCommands,
    [
      "npm run check:seis-god-mode-handoff",
      "npm run check:seis-god-mode-validation-plan",
      "npm run check:seis-god-mode-work-package",
      "npm run check:seis-god-mode-completion-audit",
      "npm run check:seis-god-mode-run-state",
      "npm run check:seis-god-mode-staging-manifest",
      "npm run check:seis-god-mode-changelog",
      "npm run quality:governance",
    ],
    "nextCommands.commands"
  );
}

if (docs) {
  for (const phrase of [
    "Summary",
    "Changed Surfaces",
    "Validation Status",
    "Risks",
    "Rollback",
    "Next Commands",
    "Protected User Work",
    "npm run check:seis-god-mode-handoff",
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-handoff"] === "node scripts/check-seis-god-mode-handoff.mjs",
    "package script missing check:seis-god-mode-handoff"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-god-mode-handoff"),
    "quality:governance must include handoff check"
  );
}

if (webIndex) {
  ensure(webIndex.includes("handoff-panel"), "web index must expose handoff panel");
  ensure(webIndex.includes("God Mode handoff"), "web index must name God Mode handoff");
}

if (webScript) {
  ensure(webScript.includes("renderGodModeHandoff"), "web script must render handoff panel");
  ensure(webScript.includes("seis_demo_handoff_viewed"), "web script must emit handoff telemetry");
}

if (webStyles) {
  ensure(webStyles.includes(".handoff-panel"), "web styles must include handoff panel styles");
  ensure(webStyles.includes(".handoff-list"), "web styles must include handoff list styles");
}

if (failures.length > 0) {
  console.error("SEIS God Mode handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS God Mode handoff check passed.");

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
