#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildSeisEcosystemCapabilitySnapshot } from "../packages/seis-ai/src/model/ecosystem-capability-snapshot.mjs";

const root = process.cwd();
const failures = [];
const registryPath = path.join(root, "apps", "seis-core", "data", "seis-core-ecosystem-registry.json");
const identitiesPath = path.join(root, "data", "seis-operating-identities.json");
const integrationPath = path.join(root, "content", "development", "seis-agent-plugin-integration.json");
const desktopPath = path.join(root, "apps", "web", "desktop.js");
const htmlPath = path.join(root, "apps", "seis-core", "index.html");
const scriptPath = path.join(root, "apps", "seis-core", "script.js");
const cssPath = path.join(root, "apps", "seis-core", "styles.css");
const docsPath = path.join(root, "docs", "architecture", "seis-command-center.md");
const packagePath = path.join(root, "package.json");

function fail(message) {
  failures.push(message);
}

async function readJson(filePath, label) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    fail(`${label} could not be read as JSON: ${error.message}`);
    return null;
  }
}

async function readText(filePath, label) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    fail(`${label} could not be read: ${error.message}`);
    return "";
  }
}

for (const [filePath, label] of [
  [registryPath, "SEIS Core ecosystem registry"],
  [identitiesPath, "SEIS operating identities"],
  [integrationPath, "SEIS-Agent plugin integration"],
  [desktopPath, "SEIS desktop Store surface"],
  [htmlPath, "SEIS Core HTML"],
  [scriptPath, "SEIS Core script"],
  [cssPath, "SEIS Core CSS"],
  [docsPath, "SEIS Core architecture docs"],
  [packagePath, "package.json"]
]) {
  if (!existsSync(filePath)) fail(`missing ${label}: ${path.relative(root, filePath)}`);
}

const [registry, identities, integration, desktop, html, script, css, docs, packageJson] = await Promise.all([
  readJson(registryPath, "SEIS Core ecosystem registry"),
  readJson(identitiesPath, "SEIS operating identities"),
  readJson(integrationPath, "SEIS-Agent plugin integration"),
  readText(desktopPath, "SEIS desktop Store surface"),
  readText(htmlPath, "SEIS Core HTML"),
  readText(scriptPath, "SEIS Core script"),
  readText(cssPath, "SEIS Core CSS"),
  readText(docsPath, "SEIS Core architecture docs"),
  readJson(packagePath, "package.json")
]);

let expectedRegistry = null;
try {
  expectedRegistry = buildSeisEcosystemCapabilitySnapshot(root);
} catch (error) {
  fail(`source-backed ecosystem snapshot could not be built: ${error.message}`);
}

const expectedLanes = ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data", "seis-store"];
const expectedIdentityByLane = {
  seis: "SEIS",
  "seis-cloud": "SEIS-Cloud",
  "seis-code": "SEIS-Code",
  "seis-design": "SEIS-Design",
  "seis-data": "SEIS-Data"
};

if (registry) {
  if (registry.id !== "seis-core-ecosystem-registry") fail("registry id must be seis-core-ecosystem-registry");
  if (registry.schemaVersion !== "2.0.0") fail("registry schemaVersion must be 2.0.0");
  if (registry.status !== "source-backed-local-demo") fail("registry status must be source-backed-local-demo");
  if (registry.mode !== "read-only-capability-control-plane") fail("registry mode must remain read-only");
  if (expectedRegistry && JSON.stringify(registry) !== JSON.stringify(expectedRegistry)) {
    fail("generated ecosystem registry is stale; run npm run automation:seis-core-ecosystem-registry");
  }

  const expectedCounts = {
    coreLanes: 6,
    bundledPluginSources: 6,
    repoSkills: 25,
    auditedInstalledEnabledPlugins: 185,
    cataloguedHelperPlugins: 300,
    providers: 7,
    mcpTools: 37,
    mcpResources: 30,
    mcpPrompts: 3,
    productModules: 18,
    dataContracts: 19,
    validatedDataContracts: 17,
    designComponents: 12,
    validatedDesignComponents: 12,
    managedAgentRoles: 13
  };
  for (const [field, expected] of Object.entries(expectedCounts)) {
    if (registry.counts?.[field] !== expected) fail(`registry count ${field} must be ${expected}`);
  }
  if (registry.pluginAudit?.state !== "dated-source-audit-not-live-rescan") fail("plugin audit must remain explicitly dated");
  if (registry.helperPluginUniverse?.state !== "catalogued-not-blanket-activated") fail("helper plugins must not claim blanket activation");
  if (registry.helperPluginUniverse?.activationPolicy !== "activate_only_when_relevant_authenticated_scoped_and_user_approved") {
    fail("helper plugin activation must remain relevant, scoped, authenticated, and approval-gated");
  }
  if (!registry.providers?.records?.every((provider) => provider.backendOnly === true && provider.frontendSecretAllowed === false)) {
    fail("all provider records must remain backend-only with frontend secrets prohibited");
  }
  if (registry.mcpRuntime?.liveBrowserSessionStarted !== false) fail("browser registry must not claim a live MCP session");
  if (registry.mcpRuntime?.pluginMesh?.serverCount !== 6) fail("browser registry must expose six local MCP entrypoints");
  if (registry.mcpRuntime?.pluginMesh?.configuredServerCount !== 6) fail("browser registry MCP mesh must be fully configured");
  if (registry.mcpRuntime?.pluginMesh?.boundary?.liveSessionStarted !== false) fail("browser registry MCP mesh must remain non-live");

  const lanes = Array.isArray(registry.lanes) ? registry.lanes : [];
  if (lanes.length !== expectedLanes.length) fail(`registry must expose exactly ${expectedLanes.length} core lanes`);
  for (const laneId of expectedLanes) {
    const lane = lanes.find((candidate) => candidate.id === laneId);
    if (!lane) {
      fail(`registry missing ${laneId}`);
      continue;
    }
    for (const field of ["label", "identity", "kind", "status", "mode", "coreBinding", "role", "scope", "storeBinding"]) {
      if (!String(lane[field] || "").trim()) fail(`${laneId} missing ${field}`);
    }
    if (lane.executionAuthority !== false || lane.mcp?.executionAuthority !== false) fail(`${laneId} must remain execution-disabled`);
    if (!Array.isArray(lane.mcp?.tools)) fail(`${laneId} MCP tools must be an array`);
    if (!Array.isArray(lane.qualityGates) || !lane.qualityGates.every((gate) =>
      gate.startsWith("npm run check:") || gate === "npm run seis:check")) {
      fail(`${laneId} qualityGates must contain package check commands`);
    }
    if (!lane.route?.href || !lane.route?.targetId || !lane.route?.label) fail(`${laneId} must expose a local launch route`);
    if (["Connected", "Live", "Deployed"].includes(lane.status) || /\bconnected\b/i.test(lane.mode)) {
      fail(`${laneId} must not claim an externally connected runtime`);
    }
  }

  for (const laneId of ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]) {
    const lane = lanes.find((candidate) => candidate.id === laneId);
    if (!lane || lane.mcp.tools.length !== 2) fail(`${laneId} must retain its status and plan MCP tools`);
    if (lane?.pluginBinding?.runtimePlugin !== "seis-ai-agent") fail(`${laneId} must bind to canonical SEIS-Agent runtime`);
    if (lane?.pluginBinding?.standaloneInstallMode !== "disabled") fail(`${laneId} standalone install mode must remain disabled`);
  }
  const cloudLane = lanes.find((candidate) => candidate.id === "seis-cloud");
  if (cloudLane) {
    const sshBinding = cloudLane.sshBinding;
    if (!sshBinding) fail("seis-cloud must expose the SEIS-SSH Core transport binding");
    if (sshBinding?.alias !== "SEIS-SSH") fail("seis-cloud SSH binding must use the SEIS-SSH alias");
    if (sshBinding?.contract !== "deploy/seis-ssh-public-access-contract.json") fail("seis-cloud SSH binding must point to the public access contract");
    if (sshBinding?.serverAndPortPolicy !== "preserve-existing-server-and-port") fail("seis-cloud SSH binding must preserve the existing server and port");
    if (sshBinding?.serverOrPortChanged !== false) fail("seis-cloud SSH binding must not change server or port");
    if (sshBinding?.strictReady !== false) fail("seis-cloud must not claim strict live SSH readiness");
    if (sshBinding?.runtimeMode !== "status-and-plan-only") fail("seis-cloud SSH binding must remain status-and-plan-only");
    if (sshBinding?.liveClaim !== "blocked-until-strict-online-evidence") fail("seis-cloud SSH binding must block live claims until strict evidence");
  }
  const storeLane = lanes.find((candidate) => candidate.id === "seis-store");
  if (storeLane?.mcp?.tools.length !== 0 || storeLane?.pluginBinding !== null) fail("SEIS Store must not claim a remote plugin or MCP execution path");

  const disabledBoundaryFields = [
    "providerCalls",
    "credentialsRead",
    "frontendSecretsAllowed",
    "liveMcpSessionStarted",
    "backgroundAutomation",
    "agentExecution",
    "sshExecuted",
    "deploymentPerformed",
    "githubMutationPerformed",
    "packageInstallationPerformed",
    "privateContentRead"
  ];
  if (disabledBoundaryFields.some((field) => registry.runtimeBoundary?.[field] !== false)) {
    fail("runtime boundary must keep every execution and secret-reading field false");
  }
  if (registry.runtimeBoundary?.browserLocalReadOnly !== true
    || registry.runtimeBoundary?.humanApprovalRequiredForExternalMutation !== true) {
    fail("runtime boundary must remain browser-local, read-only, and approval-gated");
  }
}

if (identities) {
  const identityNames = new Set((identities.identities || []).map((identity) => identity.name));
  for (const identity of Object.values(expectedIdentityByLane)) {
    if (!identityNames.has(identity)) fail(`operating identities missing ${identity}`);
  }
}

if (integration) {
  const laneIds = new Set((integration.lanes || []).map((lane) => lane.id));
  for (const laneId of ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]) {
    if (!laneIds.has(laneId)) fail(`SEIS-Agent integration missing ${laneId}`);
  }
  if (integration.canonicalAgent?.standaloneLaneInstallMode !== "disabled") {
    fail("SEIS-Agent integration must keep standalone lane installation disabled");
  }
}

for (const [text, label, required] of [
  [desktop, "desktop Store surface", "renderSeisStore"],
  [desktop, "desktop route surface", "restoreDeepLinkedApp"],
  [desktop, "desktop route surface", "new URLSearchParams(window.location.search)"],
  [html, "Command Center HTML", "ecosystem-control-plane"],
  [html, "Command Center HTML", "ecosystem-control-grid"],
  [html, "Command Center HTML", "ecosystem-lane-detail"],
  [script, "Command Center script", "loadSeisCoreEcosystemRegistry"],
  [script, "Command Center script", "renderEcosystemControlPlane"],
  [script, "Command Center script", "validateEcosystemRegistryForBrowser"],
  [script, "Command Center script", "data-ecosystem-lane"],
  [script, "Command Center script", "copyEcosystemGate"],
  [css, "Command Center CSS", ".ecosystem-control-layout"],
  [css, "Command Center CSS", ".ecosystem-lane-button"],
  [css, "Command Center CSS", ".ecosystem-lane-detail"],
  [docs, "Command Center docs", "## Ecosystem Control Plane"]
]) {
  if (!text.includes(required)) fail(`${label} missing ${required}`);
}

if (packageJson?.scripts?.["check:seis-core-ecosystem-registry"] !== "node scripts/create-seis-core-ecosystem-snapshot.mjs --check && node scripts/check-seis-core-ecosystem-registry.mjs") {
  fail("package.json must expose check:seis-core-ecosystem-registry");
}

if (failures.length) {
  console.error("SEIS Core ecosystem registry check failed:");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log("SEIS Core ecosystem registry check passed.");
