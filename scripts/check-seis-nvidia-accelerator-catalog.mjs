#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const files = {
  catalog: "content/development/seis-nvidia-accelerator-catalog.json",
  doc: "docs/ai/nvidia-accelerator-catalog.md",
  desktop: "apps/web/desktop.js",
  packageJson: "package.json",
  planner: "scripts/plan-nvidia-catalog-install.mjs"
};

for (const [label, relativePath] of Object.entries(files)) ensureFile(relativePath, label);

const catalog = readJson(files.catalog, "NVIDIA accelerator catalog");
const doc = readText(files.doc, "NVIDIA accelerator docs");
const desktop = readText(files.desktop, "Desktop runtime");
const packageJson = readJson(files.packageJson, "package.json");
const planner = readText(files.planner, "NVIDIA planner");

if (catalog) {
  ensure(catalog.id === "seis-nvidia-accelerator-catalog", "catalog id mismatch");
  ensure(catalog.status === "catalog-ready-install-blocked", "catalog status must remain catalog-ready-install-blocked");
  ensure(catalog.qualityGate === "npm run check:seis-nvidia-accelerator-catalog", "catalog quality gate mismatch");
  ensure(catalog.installedIntegrationsRegistry === "content/development/seis-nvidia-installed-integrations.json", "catalog must link installed integrations registry");
  ensure(catalog.verifiedSnapshot?.githubPublicRepoCount >= 700, "catalog must record broad NVIDIA org scale");
  ensure(catalog.verifiedSnapshot?.buildSkillsUrlStatus === 200, "Build skills URL status must be recorded as 200");
  ensure(catalog.verifiedSnapshot?.buildModelsUrlStatus === 200, "Build models URL status must be recorded as 200");

  for (const [field, expected] of Object.entries({
    bulkCloneAllowed: false,
    cloneAllPublicReposAllowed: false,
    modelDownloadAllowed: false,
    nimApiCallAllowed: false,
    gpuProvisionAllowed: false,
    dockerPullAllowed: false,
    dependencyInstallAllowed: false,
    secretReadAllowed: false,
    browserSecretAllowed: false,
    sshExecutionAllowed: false,
    githubWriteAllowed: false,
    approvalRequiredForAnyApply: true
  })) {
    ensure(catalog.installPolicy?.[field] === expected, `installPolicy.${field} must remain ${expected}`);
  }

  ensure(String(catalog.installPolicy?.truthBoundary || "").includes("not NVIDIA repositories"), "truth boundary must forbid repo install claims");
  ensureArrayIncludesAll(catalog.blockedUntilApproved, [
    "Clone all NVIDIA GitHub repositories.",
    "Download model weights or NIM containers.",
    "Call NVIDIA Build/NIM APIs.",
    "Store NVIDIA API keys or secrets in browser state, localStorage, IndexedDB, docs, or committed files."
  ], "blockedUntilApproved");
  ensureArrayIncludesAll((catalog.installQueue || []).map((item) => item.id), [
    "nvidia-github-inventory",
    "nvidia-build-skills",
    "nvidia-build-models",
    "seis-ai-router-alignment",
    "seis-cloud-gpu-readiness"
  ], "installQueue ids");
  ensure(catalog.desktopSurface?.appId === "nvidia-catalog", "desktop surface app id mismatch");
  ensure(catalog.documentation?.primaryDoc === files.doc, "primary doc path mismatch");
}

for (const token of [
  "NVIDIA Accelerator Catalog",
  "seis-nvidia-accelerator-catalog.json",
  "seis-nvidia-installed-integrations.json",
  "npm run plan:nvidia-catalog-install",
  "No bulk clone",
  "No model download",
  "No NIM call"
]) {
  ensure(doc.includes(token), `docs missing ${token}`);
}

for (const token of [
  "NVIDIA_ACCELERATOR_CATALOG",
  "nvidia-catalog",
  "renderNvidiaCatalog",
  "buildNvidiaCatalogMarkdown",
  "check:seis-nvidia-accelerator-catalog"
]) {
  ensure(desktop.includes(token), `desktop missing ${token}`);
}

ensure(planner.includes("--apply"), "planner must explicitly block apply mode");
ensure(planner.includes("blocked"), "planner must report blocked live installation");

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-nvidia-accelerator-catalog"] === "node scripts/check-seis-nvidia-accelerator-catalog.mjs",
    "package.json must expose check:seis-nvidia-accelerator-catalog"
  );
  ensure(
    packageJson.scripts?.["plan:nvidia-catalog-install"] === "node scripts/plan-nvidia-catalog-install.mjs",
    "package.json must expose plan:nvidia-catalog-install"
  );
}

finish();

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) failures.push(`${label} missing: ${relativePath}`);
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
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
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function finish() {
  if (failures.length > 0) {
    console.error("SEIS NVIDIA accelerator catalog check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log("SEIS NVIDIA accelerator catalog check passed.");
}
