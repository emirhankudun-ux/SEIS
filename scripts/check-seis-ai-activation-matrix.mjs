#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const matrixPath = "data/seis-ai-activation-matrix.json";
const installedAICollaborationPath = "data/seis-installed-ai-collaboration.json";
const fabricPath = "data/seis-ai-unified-integration-fabric.json";
const specialistPluginsPath = "data/seis-specialist-plugins-2026-06-12.json";
const agentProfilePath = "plugins/seis-ai-agent/assets/agent-profile.json";
const appContractPath = "apps/seis-ai-demo/contracts/seis-ai-command-core-integration.json";
const websiteContractPath = "apps/seis-demo-web/contracts/seis-demo-contract.json";
const sshContractPath = "data/ssh-hardening-operation-contract.json";
const packagePath = "package.json";
const aiDemoHtmlPath = "apps/seis-ai-demo/index.html";
const aiDemoScriptPath = "apps/seis-ai-demo/script.js";
const aiAgentServerPath = "plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs";
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

function arrayFor(value) {
  return Array.isArray(value) ? value : [];
}

function textOf(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

const matrix = readJson(matrixPath);
const installedAICollaboration = readJson(installedAICollaborationPath);
const fabric = readJson(fabricPath);
const specialistPlugins = readJson(specialistPluginsPath);
const agentProfile = readJson(agentProfilePath);
const appContract = readJson(appContractPath);
const websiteContract = readJson(websiteContractPath);
const sshContract = readJson(sshContractPath);
const packageJson = readJson(packagePath);
const matrixText = JSON.stringify(matrix);
const aiDemoHtml = textOf(aiDemoHtmlPath);
const aiDemoScript = textOf(aiDemoScriptPath);
const aiAgentServer = textOf(aiAgentServerPath);

if (matrix.id !== "seis-ai-activation-matrix") {
  fail("matrix id must be seis-ai-activation-matrix");
}

if (matrix.status !== "local-fixture-backed") {
  fail("matrix status must be local-fixture-backed");
}

if (matrix.mode !== "single-agent-embedded-lanes-plan-only") {
  fail("matrix mode must be single-agent-embedded-lanes-plan-only");
}

for (const sourcePath of matrix.sourceBasis ?? []) {
  assertPathExists(sourcePath, "sourceBasis entry");
}

if (matrix.installSurface?.primaryInstallId !== agentProfile.installId) {
  fail("installSurface primaryInstallId must match SEIS-Agent profile installId");
}

if (matrix.installSurface?.defaultInstallMode !== "plan-only") {
  fail("installSurface defaultInstallMode must be plan-only");
}

if (matrix.installSurface?.standaloneLaneInstallMode !== agentProfile.consolidationPolicy?.standaloneLaneInstallMode) {
  fail("installSurface standaloneLaneInstallMode must match SEIS-Agent consolidation policy");
}

if (matrix.installSurface?.liveMutationDefault !== "blocked") {
  fail("installSurface liveMutationDefault must be blocked");
}

if (packageJson.scripts?.["check:seis-ai-activation-matrix"] !== "node scripts/check-seis-ai-activation-matrix.mjs") {
  fail("package.json must expose check:seis-ai-activation-matrix");
}

if (!`${packageJson.scripts?.["check:seis-ai-local-integration"] ?? ""}`.includes("check:seis-ai-activation-matrix")) {
  fail("check:seis-ai-local-integration must include activation matrix check");
}

if (!`${packageJson.scripts?.["check:seis-ai-local-integration"] ?? ""}`.includes("check:seis-installed-ai-collaboration")) {
  fail("check:seis-ai-local-integration must include installed AI collaboration check");
}

if (installedAICollaboration.id !== "seis-installed-ai-collaboration") {
  fail("installed AI collaboration source must be readable");
}

const fabricAgents = new Map(arrayFor(fabric.agentCatalog).map((agent) => [agent.id, agent]));
const matrixAgents = new Map(arrayFor(matrix.subAgentActivations).map((agent) => [agent.agentId, agent]));
const fabricLanes = new Map(arrayFor(fabric.pluginFeedLanes).map((lane) => [lane.id, lane]));
const matrixLanes = new Map(arrayFor(matrix.pluginLaneActivations).map((lane) => [lane.laneId, lane]));
const fabricWebsites = new Map(arrayFor(fabric.aiWebsites).map((website) => [website.id, website]));
const matrixWebsites = new Map(arrayFor(matrix.aiWebsiteFeatureActivation).map((website) => [website.websiteId, website]));
const specialistPluginNames = new Set(arrayFor(specialistPlugins.plugins).map((plugin) => plugin.name));

for (const [agentId, fabricAgent] of fabricAgents) {
  const activation = matrixAgents.get(agentId);
  if (!activation) {
    fail(`matrix missing subAgentActivations entry for ${agentId}`);
    continue;
  }

  if (activation.activationState !== fabricAgent.enabledState) {
    fail(`${agentId} activationState must match fabric enabledState`);
  }

  if (!/(human|supervised|approval)/.test(`${activation.autonomyBoundary}`)) {
    fail(`${agentId} autonomyBoundary must preserve human supervision or approval`);
  }

  if (!Array.isArray(activation.pluginFeeds) || activation.pluginFeeds.length === 0) {
    fail(`${agentId} must declare pluginFeeds`);
  }

  if (!Array.isArray(activation.aiWebsiteSurfaces) || activation.aiWebsiteSurfaces.length === 0) {
    fail(`${agentId} must declare aiWebsiteSurfaces`);
  }

  if (!Array.isArray(activation.deniedLiveActions) || activation.deniedLiveActions.length === 0) {
    fail(`${agentId} must declare deniedLiveActions`);
  }

  for (const laneId of activation.pluginFeeds ?? []) {
    if (!fabricLanes.has(laneId)) {
      fail(`${agentId} references unknown plugin feed lane ${laneId}`);
    }
  }

  for (const websiteId of activation.aiWebsiteSurfaces ?? []) {
    if (!fabricWebsites.has(websiteId)) {
      fail(`${agentId} references unknown AI website ${websiteId}`);
    }
  }
}

for (const [laneId, fabricLane] of fabricLanes) {
  const activation = matrixLanes.get(laneId);
  if (!activation) {
    fail(`matrix missing pluginLaneActivations entry for ${laneId}`);
    continue;
  }

  if (!specialistPluginNames.has(laneId)) {
    fail(`${laneId} must exist in specialist plugin manifest`);
  }

  if (activation.installId !== fabricLane.installId) {
    fail(`${laneId} installId must match fabric plugin feed lane`);
  }

  if (activation.liveActionState !== "blocked") {
    fail(`${laneId} liveActionState must be blocked`);
  }

  assertArrayIncludesAll(`${laneId}.feeds`, activation.feeds, fabricLane.feeds);
  assertArrayIncludesAll(`${laneId}.mcpTools`, activation.mcpTools, fabricLane.mcpTools);

  if (!activation.feeds.includes("plugin-steward")) {
    fail(`${laneId} must feed plugin-steward`);
  }

  for (const target of activation.feeds ?? []) {
    const targetAgent = matrixAgents.get(target);
    if (!targetAgent) {
      fail(`${laneId} feeds unknown matrix agent ${target}`);
    } else if (!arrayFor(targetAgent.pluginFeeds).includes(laneId)) {
      fail(`${target} must list ${laneId} in pluginFeeds`);
    }
  }

  for (const tool of activation.mcpTools ?? []) {
    if (!aiAgentServer.includes(tool)) {
      fail(`SEIS-Agent MCP server must expose ${tool}`);
    }
  }
}

const fabricSsh = arrayFor(fabric.sshExecutionPlanes)[0] ?? {};
assertArrayIncludesAll("sshActivation.allowedModes", matrix.sshActivation?.allowedModes, fabricSsh.allowedModes ?? []);
assertArrayIncludesAll("sshActivation.blockedWithoutApproval", matrix.sshActivation?.blockedWithoutApproval, fabricSsh.blockedWithoutApproval ?? []);
assertArrayIncludesAll("sshActivation.requiredHumanInputs", matrix.sshActivation?.requiredHumanInputs, fabricSsh.requiredHumanInputs ?? []);

if (matrix.sshActivation?.reviewerAgent !== "ssh-operations-reviewer") {
  fail("sshActivation reviewerAgent must be ssh-operations-reviewer");
}

if (matrix.sshActivation?.feedLane !== "seis-cloud") {
  fail("sshActivation feedLane must be seis-cloud");
}

if (matrix.sshActivation?.contractPath !== sshContractPath || sshContract.credentialHandling?.privateKeyMaterialLogged !== false) {
  fail("sshActivation must point at the SSH contract with private key logging disabled");
}

for (const [websiteId, website] of fabricWebsites) {
  const activation = matrixWebsites.get(websiteId);
  if (!activation) {
    fail(`matrix missing aiWebsiteFeatureActivation entry for ${websiteId}`);
    continue;
  }

  if (activation.path !== website.path) {
    fail(`${websiteId} path must match fabric aiWebsites path`);
  }

  assertPathExists(activation.path, `${websiteId} activation path`);

  if (!Array.isArray(activation.features) || activation.features.length === 0) {
    fail(`${websiteId} must declare activated features`);
  }
}

if (!arrayFor(matrixWebsites.get("seis-ai-demo")?.features).includes("activation-matrix")) {
  fail("seis-ai-demo website features must include activation-matrix");
}

if (!aiDemoHtml.includes('id="fabric-activation-matrix"')) {
  fail("SEIS AI demo UI must expose fabric-activation-matrix");
}

for (const helper of ["activationMatrixOverview", "generateActivationMatrixCards"]) {
  if (!aiDemoScript.includes(helper)) {
    fail(`SEIS AI demo script must expose ${helper}`);
  }
}

if (!arrayFor(appContract.contract_spine).some((entry) => entry.id === "seis-ai-activation-matrix")) {
  fail("AI Command Core integration contract must include activation matrix spine entry");
}

if (!arrayFor(appContract.contract_spine).some((entry) => entry.id === "seis-installed-ai-collaboration")) {
  fail("AI Command Core integration contract must include installed AI collaboration spine entry");
}

if (!arrayFor(websiteContract.linked_surfaces).some((entry) => entry.id === "seis-ai-unified-integration-fabric")) {
  fail("SEIS demo website contract must link unified integration fabric");
}

if (!arrayFor(websiteContract.linked_surfaces).some((entry) => entry.id === "seis-ai-activation-matrix")) {
  fail("SEIS demo website contract must link activation matrix");
}

if (!arrayFor(websiteContract.scenarios).some((entry) => entry.id === "seis-ai-activation-matrix")) {
  fail("SEIS demo website contract must expose activation matrix scenario");
}

assertArrayIncludesAll("validation", matrix.validation, [
  "npm run check:seis-ai-activation-matrix",
  "npm run check:seis-installed-ai-collaboration",
  "npm run check:seis-ai-unified-integration-fabric",
  "npm run check:seis-ai-local-integration",
  "npm run check:seis-specialist-plugins",
  "npm run check:seis-ai-agent",
  "npm run check:ssh-hardening-contract"
]);

for (const forbidden of [
  /\/Users\//,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])gh[pousr]_[A-Za-z0-9_]{20,}/
]) {
  if (forbidden.test(matrixText)) {
    fail(`matrix contains forbidden sensitive or machine-specific pattern: ${forbidden}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS AI activation matrix check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS AI activation matrix check passed.");
