#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const contractPath = path.join(root, "content", "development", "seis-goals-evidence-ledger.json");
const docsPath = path.join(root, "docs", "governance", "seis-goals-evidence-ledger.md");
const packagePath = path.join(root, "package.json");
const requiredModules = ["dashboard", "goals", "repos", "docs", "agents"];
const requiredLayers = ["product-experience", "application-platform", "ai-agi-learning", "cloud-security", "governance-quality"];

ensureFile(contractPath, "goals evidence ledger contract");
ensureFile(docsPath, "goals evidence ledger docs");
ensureFile(packagePath, "package.json");

const contract = readJson(contractPath, "goals evidence ledger contract");
const docs = readText(docsPath, "goals evidence ledger docs");
const packageJson = readJson(packagePath, "package.json");

if (contract) {
  ensure(contract.id === "seis-goals-evidence-ledger", "contract id must be seis-goals-evidence-ledger");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.qualityGate === "npm run check:seis-goals-evidence-ledger", "contract must declare quality gate");
  ensure(Array.isArray(contract.goals), "contract.goals must be an array");
  const modules = new Set((contract.goals || []).map((goal) => goal.module));
  for (const module of requiredModules) {
    ensure(modules.has(module), `ledger must include module goal: ${module}`);
  }
  for (const goal of contract.goals || []) {
    ensureNonEmptyString(goal.id, "goal.id");
    ensure(requiredModules.includes(goal.module), `${goal.id} has invalid module`);
    ensureNonEmptyString(goal.title, `${goal.id}.title`);
    ensureNonEmptyString(goal.status, `${goal.id}.status`);
    ensureArrayIncludesAll(goal.layers, requiredLayers, `${goal.id}.layers`);
    ensureArrayMin(goal.acceptanceCriteria, 3, `${goal.id}.acceptanceCriteria`);
    ensureArrayMin(goal.validationCommands, 1, `${goal.id}.validationCommands`);
    ensureNonEmptyString(goal.rollbackPlan, `${goal.id}.rollbackPlan`);
    ensureArrayMin(goal.evidenceLinks, 2, `${goal.id}.evidenceLinks`);
    for (const evidenceLink of goal.evidenceLinks || []) {
      ensureFile(path.join(root, evidenceLink), `${goal.id} evidence link`);
    }
    for (const command of goal.validationCommands || []) {
      ensure(String(command).startsWith("npm run check:"), `${goal.id}.validationCommands must use npm check scripts`);
    }
  }
}

if (docs) {
  for (const phrase of ["acceptance evidence", "validation commands", "rollback", "npm run check:seis-goals-evidence-ledger"]) {
    ensure(docs.toLowerCase().includes(phrase.toLowerCase()), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(scripts["check:seis-goals-evidence-ledger"] === "node scripts/check-seis-goals-evidence-ledger.mjs", "package script missing check:seis-goals-evidence-ledger");
  ensure(String(scripts["quality:governance"] || "").includes("npm run check:seis-goals-evidence-ledger"), "quality:governance must include goals evidence ledger check");
}

finish("SEIS goals evidence ledger check passed.");

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

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS goals evidence ledger check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
