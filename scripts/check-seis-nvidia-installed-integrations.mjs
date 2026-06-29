#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const files = {
  registry: "content/development/seis-nvidia-installed-integrations.json",
  catalog: "content/development/seis-nvidia-accelerator-catalog.json",
  doc: "docs/ai/nvidia-installed-integrations.md",
  review: "docs/reviews/NVIDIA_INSTALLED_INTEGRATIONS_REVIEW.md",
  desktop: "apps/web/desktop.js",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(files)) ensureFile(relativePath, label);

const registry = readJson(files.registry, "NVIDIA installed integrations registry");
const catalog = readJson(files.catalog, "NVIDIA accelerator catalog");
const doc = readText(files.doc, "NVIDIA installed integrations docs");
const review = readText(files.review, "NVIDIA installed integrations review");
const desktop = readText(files.desktop, "Desktop runtime");
const packageJson = readJson(files.packageJson, "package.json");

if (registry) {
  ensure(registry.id === "seis-nvidia-installed-integrations", "registry id mismatch");
  ensure(registry.status === "installed-local-skill-registry-runtime-gated", "registry status mismatch");
  ensure(registry.qualityGate === "npm run check:seis-nvidia-installed-integrations", "registry quality gate mismatch");
  ensure(registry.installPolicy?.installedIntoSeis === true, "registry must be installed into SEIS");
  ensure(registry.installPolicy?.localSkillManifestCount === 11, "registry must record 11 installed local skill manifests");
  for (const flag of [
    "executeSkillCommandsAllowed",
    "networkInstallAllowed",
    "repoCloneAllowed",
    "modelDownloadAllowed",
    "nimApiCallAllowed",
    "dockerAllowed",
    "kubernetesAllowed",
    "terraformAllowed",
    "azureAllowed",
    "gpuRuntimeAllowed",
    "sshAllowed",
    "secretReadAllowed"
  ]) {
    ensure(registry.installPolicy?.[flag] === false, `installPolicy.${flag} must remain false`);
  }
  ensure(registry.installPolicy?.approvalRequiredForRuntime === true, "runtime approval gate must remain true");
  ensure(Array.isArray(registry.integratedSurfaces) && registry.integratedSurfaces.length >= 8, "registry must list integrated surfaces");
  ensureArrayIncludesAll(registry.integratedSurfaces, [
    "SEIS Store per-skill installed items",
    "SEIS Search Plugin and Cloud results",
    "SEIS AI Core"
  ], "integratedSurfaces");
  ensure(Array.isArray(registry.installedIntegrations), "installedIntegrations must be an array");
  ensure(registry.installedIntegrations.length === 11, "installedIntegrations must contain all 11 local NVIDIA skills");
  ensure(new Set(registry.installedIntegrations.map((item) => item.id)).size === 11, "installed integrations must have unique ids");
  for (const item of registry.installedIntegrations || []) {
    ensure(item.status === "installed-gated", `${item.id} must remain installed-gated`);
    ensure(item.license === "Apache-2.0", `${item.id} must keep Apache-2.0 license metadata`);
    ensure(Array.isArray(item.blockedUntilApproved) && item.blockedUntilApproved.length > 0, `${item.id} needs blockedUntilApproved gates`);
    ensure(typeof item.safeSeisUse === "string" && item.safeSeisUse.includes("Visible in SEIS"), `${item.id} needs safe SEIS use text`);
  }
  ensureArrayIncludesAll(registry.installedIntegrations.map((item) => item.id), [
    "aiq-deploy",
    "aiq-research",
    "cuopt-user-rules",
    "dynamo-interconnect-check",
    "dynamo-router-starter",
    "nemoclaw-user-get-started",
    "omniverse-cad-to-simready",
    "omniverse-realtime-viewer",
    "omniverse-usd-performance-tuning",
    "physical-ai-infrastructure-setup-and-resilient-scaling",
    "physical-ai-neural-reconstruction"
  ], "installed integration ids");
  ensure(registry.documentation?.reviewDoc === files.review, "registry must point to review doc");
}

if (catalog) {
  ensure(catalog.installedIntegrationsRegistry === files.registry, "catalog must point to installed integrations registry");
}

for (const token of [
  "NVIDIA Installed Integrations",
  "seis-nvidia-installed-integrations.json",
  "11 local NVIDIA skill manifests",
  "Installed/Gated",
  "SEIS Search includes the installed lanes",
  "Runtime remains blocked",
  "npm run check:seis-nvidia-installed-integrations"
]) {
  ensure(doc.includes(token), `docs missing ${token}`);
}

for (const token of [
  "NVIDIA Installed Integrations Review",
  "PR queue item: `1D`",
  "SEIS-BL-051",
  "SEIS Store exposes each lane",
  "SEIS Search Plugin results include all installed lanes",
  "Runtime remains blocked",
  "Ready for internal review"
]) {
  ensure(review.includes(token), `review missing ${token}`);
}

for (const token of [
  "installedSkillIntegrations",
  "nvidia-skill-${id}",
  "Installed/Gated",
  "AI-Q Deploy",
  "Installed/Gated",
  "nvidiaIntegrationResult",
  "renderNvidiaCatalog",
  "NVIDIA Installed Integrations",
  "check:seis-nvidia-installed-integrations",
  "buildNvidiaCatalogMarkdown"
]) {
  ensure(desktop.includes(token), `desktop missing ${token}`);
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-nvidia-installed-integrations"] === "node scripts/check-seis-nvidia-installed-integrations.mjs",
    "package.json must expose check:seis-nvidia-installed-integrations"
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
    console.error("SEIS NVIDIA installed integrations check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log("SEIS NVIDIA installed integrations check passed.");
}
