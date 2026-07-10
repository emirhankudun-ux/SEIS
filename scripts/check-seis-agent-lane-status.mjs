#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const contractPath = path.join(root, "content", "development", "seis-agent-lane-status.json");
const docsPath = path.join(root, "docs", "governance", "seis-agent-lane-status.md");
const packagePath = path.join(root, "package.json");
const requiredLanes = [
  "seis-god-mode-developer",
  "seis-focus-mode",
  "seis-master-prompt",
  "seis-security-review",
  "seis-github-workflow",
  "seis-hub",
  "seis-cloud",
  "seis-code",
  "seis-design",
  "seis-data",
  "seis-security",
  "seis-research",
  "seis-automation",
  "seis-product",
];

ensureFile(contractPath, "agent lane status contract");
ensureFile(docsPath, "agent lane status docs");
ensureFile(packagePath, "package.json");

const contract = readJson(contractPath, "agent lane status contract");
const docs = readText(docsPath, "agent lane status docs");
const packageJson = readJson(packagePath, "package.json");

if (contract) {
  ensure(contract.id === "seis-agent-lane-status", "contract id must be seis-agent-lane-status");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.qualityGate === "npm run check:seis-agent-lane-status", "contract must declare quality gate");
  ensure(Array.isArray(contract.safetyRules) && contract.safetyRules.length >= 5, "contract must include at least five safety rules");
  ensure(Array.isArray(contract.lanes), "contract.lanes must be an array");
  const lanes = new Map((contract.lanes || []).map((lane) => [lane.id, lane]));
  for (const laneId of requiredLanes) {
    const lane = lanes.get(laneId);
    ensure(Boolean(lane), `agent lane missing: ${laneId}`);
    if (!lane) continue;
    ensureNonEmptyString(lane.displayName, `${laneId}.displayName`);
    ensure(lane.status === "active", `${laneId}.status must be active`);
    ensureNonEmptyString(lane.skillPath, `${laneId}.skillPath`);
    ensureNonEmptyString(lane.agentManifest, `${laneId}.agentManifest`);
    ensureFile(path.join(root, lane.skillPath), `${laneId} skill path`);
    ensureFile(path.join(root, lane.agentManifest), `${laneId} agent manifest`);
    ensureNonEmptyString(lane.autonomyLevel, `${laneId}.autonomyLevel`);
    ensureNonEmptyString(lane.toolBoundary, `${laneId}.toolBoundary`);
    ensureNonEmptyString(lane.safetyBoundary, `${laneId}.safetyBoundary`);
    ensureNonEmptyString(lane.validationDuty, `${laneId}.validationDuty`);
  }
}

if (docs) {
  for (const phrase of [
    "Observable",
    "Controllable",
    "Least privilege",
    "Secret-safe",
    "Evidence-bound",
    "SEIS God Mode Developer",
    "SEIS Security Sub-Agent Lane",
    "SEIS Research Sub-Agent Lane",
    "SEIS Automation Sub-Agent Lane",
    "SEIS Product Sub-Agent Lane",
    "npm run check:seis-agent-lane-status"
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(scripts["check:seis-agent-lane-status"] === "node scripts/check-seis-agent-lane-status.mjs", "package script missing check:seis-agent-lane-status");
  ensure(String(scripts["quality:governance"] || "").includes("npm run check:seis-agent-lane-status"), "quality:governance must include agent lane status check");
}

finish("SEIS agent lane status check passed.");

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
    console.error("SEIS agent lane status check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
