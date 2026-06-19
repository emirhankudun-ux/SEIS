#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const contractPath = path.join(root, "content", "development", "seis-repo-health-manifest.json");
const docsPath = path.join(root, "docs", "governance", "seis-repo-health-manifest.md");
const packagePath = path.join(root, "package.json");
const requiredLanes = ["apps", "packages", "plugins", "docs", "agents", "ci-governance"];

ensureFile(contractPath, "repo health manifest contract");
ensureFile(docsPath, "repo health manifest docs");
ensureFile(packagePath, "package.json");

const contract = readJson(contractPath, "repo health manifest contract");
const docs = readText(docsPath, "repo health manifest docs");
const packageJson = readJson(packagePath, "package.json");

if (contract) {
  ensure(contract.id === "seis-repo-health-manifest", "contract id must be seis-repo-health-manifest");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.qualityGate === "npm run check:seis-repo-health-manifest", "contract must declare quality gate");
  ensure(Array.isArray(contract.publishSafety?.requiredBeforePush), "publishSafety.requiredBeforePush must be an array");
  ensure(String(contract.publishSafety?.mainBranchRule || "").includes("Main is sacred"), "publish safety must preserve main branch rule");
  ensure(Array.isArray(contract.lanes), "contract.lanes must be an array");
  const lanes = new Map((contract.lanes || []).map((lane) => [lane.id, lane]));
  for (const laneId of requiredLanes) {
    const lane = lanes.get(laneId);
    ensure(Boolean(lane), `repo health lane missing: ${laneId}`);
    if (!lane) continue;
    ensureNonEmptyString(lane.displayName, `${laneId}.displayName`);
    ensureNonEmptyString(lane.status, `${laneId}.status`);
    ensureNonEmptyString(lane.healthSignal, `${laneId}.healthSignal`);
    ensureNonEmptyString(lane.qualityGate, `${laneId}.qualityGate`);
    ensureNonEmptyString(lane.securityGate, `${laneId}.securityGate`);
    ensureNonEmptyString(lane.rollbackPlan, `${laneId}.rollbackPlan`);
  }
}

if (docs) {
  for (const phrase of ["Applications", "Packages", "Plugins", "Documentation", "Agents", "CI Governance", "npm run check:seis-repo-health-manifest"]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(scripts["check:seis-repo-health-manifest"] === "node scripts/check-seis-repo-health-manifest.mjs", "package script missing check:seis-repo-health-manifest");
  ensure(String(scripts["quality:governance"] || "").includes("npm run check:seis-repo-health-manifest"), "quality:governance must include repo health manifest check");
}

finish("SEIS repo health manifest check passed.");

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
    console.error("SEIS repo health manifest check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
