#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const websiteFabricPath = "data/seis-ai-website-feature-fabric.json";
const unifiedFabricPath = "data/seis-ai-unified-integration-fabric.json";
const activationMatrixPath = "data/seis-ai-activation-matrix.json";
const appContractPath = "apps/seis-ai-demo/contracts/seis-ai-command-core-integration.json";
const websiteContractPath = "apps/seis-demo-web/contracts/seis-demo-contract.json";
const packagePath = "package.json";
const aiDemoHtmlPath = "apps/seis-ai-demo/index.html";
const aiDemoScriptPath = "apps/seis-ai-demo/script.js";
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    fail(`missing ${filePath}`);
    return {};
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`invalid JSON in ${filePath}: ${error.message}`);
    return {};
  }
}

function textOf(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function arrayFor(value) {
  return Array.isArray(value) ? value : [];
}

function assertPathExists(filePath, label = filePath) {
  if (!existsSync(filePath)) {
    fail(`missing ${label}: ${filePath}`);
  }
}

function assertArrayIncludesAll(name, actual, expected) {
  if (!Array.isArray(actual)) {
    fail(`${name} must be an array`);
    return;
  }

  for (const item of expected) {
    if (!actual.includes(item)) {
      fail(`${name} must include ${item}`);
    }
  }
}

const websiteFabric = readJson(websiteFabricPath);
const unifiedFabric = readJson(unifiedFabricPath);
const activationMatrix = readJson(activationMatrixPath);
const appContract = readJson(appContractPath);
const websiteContract = readJson(websiteContractPath);
const packageJson = readJson(packagePath);
const aiDemoHtml = textOf(aiDemoHtmlPath);
const aiDemoScript = textOf(aiDemoScriptPath);
const serializedWebsiteFabric = JSON.stringify(websiteFabric);

if (websiteFabric.id !== "seis-ai-website-feature-fabric") {
  fail("website fabric id must be seis-ai-website-feature-fabric");
}

if (websiteFabric.status !== "local-fixture-backed") {
  fail("website fabric status must be local-fixture-backed");
}

if (websiteFabric.mode !== "single-prompt-website-feature-orchestration") {
  fail("website fabric mode must be single-prompt-website-feature-orchestration");
}

for (const sourcePath of websiteFabric.sourceBasis ?? []) {
  assertPathExists(sourcePath, "sourceBasis entry");
}

if (websiteFabric.singlePromptRequest?.id !== "seis-ai-all-websites-single-prompt") {
  fail("singlePromptRequest must preserve the operator's all-websites prompt scope");
}

assertArrayIncludesAll("singlePromptRequest.blockedClaims", websiteFabric.singlePromptRequest?.blockedClaims, [
  "production deployment complete",
  "all external plugins installed",
  "live SSH host mutation complete",
  "provider model calls complete",
  "frontier model training complete",
  "unbounded token spend complete"
]);

const unifiedWebsites = new Map(arrayFor(unifiedFabric.aiWebsites).map((website) => [website.id, website]));
const activationWebsites = new Map(arrayFor(activationMatrix.aiWebsiteFeatureActivation).map((website) => [website.websiteId, website]));
const unifiedAgents = new Set(arrayFor(unifiedFabric.agentCatalog).map((agent) => agent.id));
const unifiedPluginLanes = new Set(arrayFor(unifiedFabric.pluginFeedLanes).map((lane) => lane.id));
const websiteSurfaces = new Map(arrayFor(websiteFabric.websiteFeatureSurfaces).map((surface) => [surface.websiteId, surface]));

for (const [websiteId, unifiedWebsite] of unifiedWebsites) {
  const surface = websiteSurfaces.get(websiteId);
  if (!surface) {
    fail(`website fabric missing surface ${websiteId}`);
    continue;
  }

  const activationWebsite = activationWebsites.get(websiteId);
  if (!activationWebsite) {
    fail(`activation matrix missing website surface ${websiteId}`);
    continue;
  }

  if (surface.path !== unifiedWebsite.path || surface.path !== activationWebsite.path) {
    fail(`${websiteId} path must match unified fabric and activation matrix`);
  }

  if (surface.entrypoint !== unifiedWebsite.entrypoint) {
    fail(`${websiteId} entrypoint must match unified fabric`);
  }

  if (surface.contract !== unifiedWebsite.contract) {
    fail(`${websiteId} contract must match unified fabric`);
  }

  assertPathExists(surface.path, `${websiteId} path`);
  assertPathExists(surface.entrypoint, `${websiteId} entrypoint`);
  assertPathExists(surface.contract, `${websiteId} contract`);
  assertArrayIncludesAll(`${websiteId}.activatedFeatures`, surface.activatedFeatures, activationWebsite.features ?? []);

  if (!arrayFor(surface.activatedFeatures).includes("website-feature-fabric")) {
    fail(`${websiteId} activatedFeatures must include website-feature-fabric`);
  }

  if (!Array.isArray(surface.featureModules) || surface.featureModules.length < 3) {
    fail(`${websiteId} must declare at least three featureModules`);
  }

  if (!Array.isArray(surface.agentFeeds) || surface.agentFeeds.length === 0) {
    fail(`${websiteId} must declare agentFeeds`);
  }

  if (!Array.isArray(surface.pluginFeeds) || surface.pluginFeeds.length === 0) {
    fail(`${websiteId} must declare pluginFeeds`);
  }

  for (const agentId of surface.agentFeeds ?? []) {
    if (!unifiedAgents.has(agentId)) {
      fail(`${websiteId} references unknown agent ${agentId}`);
    }
  }

  for (const laneId of surface.pluginFeeds ?? []) {
    if (!unifiedPluginLanes.has(laneId)) {
      fail(`${websiteId} references unknown plugin lane ${laneId}`);
    }
  }

  if (surface.providerKeyPolicy !== "no-browser-provider-key-entry") {
    fail(`${websiteId} providerKeyPolicy must block browser provider key entry`);
  }

  if (/live|apply|write|mutat/i.test(`${surface.sshExposure}`) && surface.sshExposure !== "safe-mode-indicator-only") {
    fail(`${websiteId} sshExposure must not imply live mutation`);
  }
}

assertArrayIncludesAll("featureBridgeRules", websiteFabric.featureBridgeRules, [
  "Every website feature surface must point at an existing local path, entrypoint, and contract.",
  "Every website feature surface must declare agent feeds and plugin feeds that exist in the unified integration fabric.",
  "Website features may display SSH status and dry-run boundaries, but may not mutate hosts or read private keys.",
  "Website features may display installed AI helper readiness, but blocked or aborted helpers are not validation evidence.",
  "Browser surfaces may not request, store, or forward provider API keys, SSH private keys, passwords, service accounts, cookies, or production secrets.",
  "The single prompt activates local feature wiring and plans only; it does not prove production deployment, external plugin installation, live provider execution, or model training."
]);

assertArrayIncludesAll("validation", websiteFabric.validation, [
  "npm run check:seis-ai-website-feature-fabric",
  "npm run check:seis-ai-activation-matrix",
  "npm run check:seis-ai-unified-integration-fabric",
  "npm run check:seis-ai-local-integration",
  "npm run test:seis-ai-demo",
  "npm run test:web"
]);

if (packageJson.scripts?.["check:seis-ai-website-feature-fabric"] !== "node scripts/check-seis-ai-website-feature-fabric.mjs") {
  fail("package.json must expose check:seis-ai-website-feature-fabric");
}

if (!`${packageJson.scripts?.["check:seis-ai-local-integration"] ?? ""}`.includes("check:seis-ai-website-feature-fabric")) {
  fail("check:seis-ai-local-integration must include website feature fabric check");
}

if (!arrayFor(appContract.contract_spine).some((entry) => entry.id === "seis-ai-website-feature-fabric")) {
  fail("AI Command Core integration contract must include website feature fabric spine entry");
}

if (!arrayFor(websiteContract.linked_surfaces).some((entry) => entry.id === "seis-ai-website-feature-fabric")) {
  fail("SEIS demo website contract must link website feature fabric");
}

if (!arrayFor(websiteContract.scenarios).some((entry) => entry.id === "seis-ai-website-feature-fabric")) {
  fail("SEIS demo website contract must expose website feature fabric scenario");
}

if (!aiDemoHtml.includes('id="fabric-website-features"')) {
  fail("SEIS AI demo UI must expose fabric-website-features");
}

for (const helper of ["websiteFeatureFabricOverview", "generateWebsiteFeatureCards"]) {
  if (!aiDemoScript.includes(helper)) {
    fail(`SEIS AI demo script must expose ${helper}`);
  }
}

for (const forbidden of [
  /\/Users\//,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])gh[pousr]_[A-Za-z0-9_]{20,}/
]) {
  if (forbidden.test(serializedWebsiteFabric)) {
    fail(`website fabric contains forbidden sensitive or machine-specific pattern: ${forbidden}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS AI website feature fabric check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS AI website feature fabric check passed.");
