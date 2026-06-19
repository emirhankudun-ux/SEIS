#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const contractPath = path.join(root, "content", "development", "seis-governance-index.json");
const docsPath = path.join(root, "docs", "governance", "seis-governance-index.md");
const packagePath = path.join(root, "package.json");
const requiredDocIds = [
  "architecture-manifesto",
  "quality-gates",
  "supreme-vision",
  "god-mode-developer",
  "god-mode-module-coverage",
  "goals-evidence-ledger",
  "repo-health-manifest",
  "agent-lane-status",
  "god-mode-release-readiness",
  "god-mode-validation-plan",
  "god-mode-work-package",
  "adr-template",
  "god-mode-adr-workflow",
  "adr-0001-god-mode-operating-system",
  "god-mode-handoff",
  "god-mode-completion-audit",
  "god-mode-run-state",
  "god-mode-staging-manifest",
  "god-mode-changelog"
];

ensureFile(contractPath, "governance index contract");
ensureFile(docsPath, "governance index docs");
ensureFile(packagePath, "package.json");

const contract = readJson(contractPath, "governance index contract");
const docs = readText(docsPath, "governance index docs");
const packageJson = readJson(packagePath, "package.json");

if (contract) {
  ensure(contract.id === "seis-governance-index", "contract id must be seis-governance-index");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.qualityGate === "npm run check:seis-governance-index", "contract must declare quality gate");
  ensure(Array.isArray(contract.requiredDocs), "contract.requiredDocs must be an array");
  const docsById = new Map((contract.requiredDocs || []).map((doc) => [doc.id, doc]));
  for (const docId of requiredDocIds) {
    const item = docsById.get(docId);
    ensure(Boolean(item), `governance doc missing from index: ${docId}`);
    if (!item) continue;
    ensureNonEmptyString(item.path, `${docId}.path`);
    ensureNonEmptyString(item.purpose, `${docId}.purpose`);
    ensureFile(path.join(root, item.path), `indexed governance doc ${docId}`);
  }
}

if (docs) {
  for (const phrase of ["Architecture", "Quality gates", "God Mode Developer", "Module coverage", "Goals evidence", "Repo health", "Agent lanes", "Release readiness", "Validation plan", "Work package", "ADR template", "ADR workflow", "ADR-0001", "Handoff", "Completion audit", "Run state", "Staging manifest", "Changelog", "npm run check:seis-governance-index"]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(scripts["check:seis-governance-index"] === "node scripts/check-seis-governance-index.mjs", "package script missing check:seis-governance-index");
  ensure(String(scripts["quality:governance"] || "").includes("npm run check:seis-governance-index"), "quality:governance must include governance index check");
}

finish("SEIS governance index check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) failures.push(`${label} missing: ${path.relative(root, filePath)}`);
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

function ensureNonEmptyString(candidate, label) {
  ensure(typeof candidate === "string" && candidate.trim().length > 0, `${label} must be a non-empty string`);
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS governance index check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
