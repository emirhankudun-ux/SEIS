#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = path.join(root, "content", "development", "seis-god-mode-staging-manifest.json");
const docsPath = path.join(root, "docs", "governance", "seis-god-mode-staging-manifest.md");
const packagePath = path.join(root, "package.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const webStylesPath = path.join(root, "apps", "seis-demo-web", "styles.css");

const requiredGroups = [
  "dashboard-runtime",
  "shared-contracts",
  "god-mode-contracts",
  "governance-docs",
  "quality-checkers",
  "plugin-skill",
  "package-quality-chain",
];

ensureFile(contractPath, "God Mode staging manifest contract");
ensureFile(docsPath, "God Mode staging manifest docs");
ensureFile(packagePath, "package.json");
ensureFile(webIndexPath, "SEIS demo web index");
ensureFile(webScriptPath, "SEIS demo web script");
ensureFile(webStylesPath, "SEIS demo web styles");

const contract = readJson(contractPath, "God Mode staging manifest contract");
const docs = readText(docsPath, "God Mode staging manifest docs");
const packageJson = readJson(packagePath, "package.json");
const webIndex = readText(webIndexPath, "SEIS demo web index");
const webScript = readText(webScriptPath, "SEIS demo web script");
const webStyles = readText(webStylesPath, "SEIS demo web styles");

if (contract) {
  ensure(contract.id === "seis-god-mode-staging-manifest", "contract id must be seis-god-mode-staging-manifest");
  ensure(contract.status === "active", "contract status must be active");
  ensure(contract.stagingState === "planned-not-staged", "stagingState must be planned-not-staged until validation and staging review");
  ensure(contract.qualityGate === "npm run check:seis-god-mode-staging-manifest", "contract must declare quality gate");
  ensureArrayIncludesAll(contract.requiredGroups, requiredGroups, "requiredGroups");
  ensure(Array.isArray(contract.groups), "contract.groups must be an array");
  ensureArrayMin(contract.protectedPaths, 1, "protectedPaths");
  ensureArrayMin(contract.excludedUntilExplicitReview, 3, "excludedUntilExplicitReview");
  ensureNonEmptyString(contract.completionRule, "completionRule");

  const groupsById = new Map((contract.groups || []).map((group) => [group.id, group]));
  for (const groupId of requiredGroups) {
    const group = groupsById.get(groupId);
    ensure(Boolean(group), `staging group missing: ${groupId}`);
    if (!group) continue;
    ensureNonEmptyString(group.displayName, `${groupId}.displayName`);
    ensure(group.state === "include-after-validation", `${groupId}.state must be include-after-validation`);
    ensureArrayMin(group.paths, 1, `${groupId}.paths`);
    ensureNonEmptyString(group.reviewRule, `${groupId}.reviewRule`);
    for (const filePath of group.paths || []) {
      ensureFile(path.join(root, filePath), `${groupId} path`);
    }
  }
}

if (docs) {
  for (const phrase of [
    "planned-not-staged",
    "Dashboard Runtime",
    "Shared Contracts",
    "God Mode Contracts",
    "Governance Docs",
    "Quality Checkers",
    "Plugin Skill",
    "Package Quality Chain",
    "apps/seis-core/index.html",
    "npm run check:seis-god-mode-staging-manifest",
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-god-mode-staging-manifest"] === "node scripts/check-seis-god-mode-staging-manifest.mjs",
    "package script missing check:seis-god-mode-staging-manifest"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-god-mode-staging-manifest"),
    "quality:governance must include staging manifest check"
  );
}

if (webIndex) {
  ensure(webIndex.includes("staging-manifest-panel"), "web index must expose staging manifest panel");
  ensure(webIndex.includes("God Mode staging manifest"), "web index must name God Mode staging manifest");
}

if (webScript) {
  ensure(webScript.includes("renderGodModeStagingManifest"), "web script must render staging manifest");
  ensure(webScript.includes("seis_demo_staging_manifest_viewed"), "web script must emit staging manifest telemetry");
}

if (webStyles) {
  ensure(webStyles.includes(".staging-manifest-panel"), "web styles must include staging manifest panel styles");
  ensure(webStyles.includes(".staging-manifest-grid"), "web styles must include staging manifest grid styles");
}

if (failures.length > 0) {
  console.error("SEIS God Mode staging manifest check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS God Mode staging manifest check passed.");

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
