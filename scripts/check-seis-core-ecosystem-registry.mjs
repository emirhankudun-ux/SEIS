#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

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
  if (registry.schemaVersion !== "1.0.0") fail("registry schemaVersion must be 1.0.0");
  if (registry.status !== "active") fail("registry status must be active");
  if (!Array.isArray(registry.sources) || registry.sources.length < 3) fail("registry must name its source records");
  if (!registry.runtimeBoundary?.includes("does not authenticate connectors")) fail("registry must keep the no-authentication runtime boundary explicit");
  if (registry.store?.id !== "seis-store") fail("registry must bind the Store by id");
  if (registry.store?.status !== "Local Demo") fail("Store must remain labeled Local Demo");
  if (!registry.store?.contract?.includes("browser-local")) fail("Store contract must be browser-local");
  if (!registry.store?.approvalBoundary?.includes("does not download packages")) fail("Store approval boundary must reject remote installation claims");

  const lanes = Array.isArray(registry.lanes) ? registry.lanes : [];
  if (lanes.length !== expectedLanes.length) fail(`registry must expose exactly ${expectedLanes.length} core lanes`);
  for (const laneId of expectedLanes) {
    const lane = lanes.find((candidate) => candidate.id === laneId);
    if (!lane) {
      fail(`registry missing ${laneId}`);
      continue;
    }
    for (const field of ["label", "identity", "kind", "status", "mode", "coreBinding", "role", "qualityGate", "storeBinding", "demoHref", "demoLabel"]) {
      if (!String(lane[field] || "").trim()) fail(`${laneId} missing ${field}`);
    }
    if (!Array.isArray(lane.mcpTools)) fail(`${laneId} mcpTools must be an array`);
    if (typeof lane.qualityGate !== "string" || !lane.qualityGate.startsWith("npm run check:")) fail(`${laneId} qualityGate must be a package check command`);
    if (["Connected", "Live", "Deployed"].includes(lane.status) || /\bconnected\b/i.test(lane.mode)) {
      fail(`${laneId} must not claim an externally connected runtime`);
    }
  }

  for (const laneId of ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]) {
    const lane = lanes.find((candidate) => candidate.id === laneId);
    if (!lane || lane.mcpTools.length !== 2) fail(`${laneId} must retain its status and plan MCP tools`);
  }
  const cloudLane = lanes.find((candidate) => candidate.id === "seis-cloud");
  if (cloudLane) {
    const sshBinding = cloudLane.sshBinding;
    if (!sshBinding) fail("seis-cloud must expose the SEIS-SSH Core transport binding");
    if (sshBinding?.alias !== "SEIS-SSH") fail("seis-cloud SSH binding must use the SEIS-SSH alias");
    if (sshBinding?.contract !== "deploy/seis-ssh-public-access-contract.json") fail("seis-cloud SSH binding must point to the public access contract");
    if (sshBinding?.statusCommand !== "npm run check:seis-ssh-public-access-report") fail("seis-cloud SSH binding must expose the sanitized status command");
    if (sshBinding?.guardCommand !== "npm run check:seis-ssh-github-pr-contract") fail("seis-cloud SSH binding must expose the PR guard command");
    if (sshBinding?.serverAndPortPolicy !== "preserve-existing-server-and-port") fail("seis-cloud SSH binding must preserve the existing server and port");
    if (sshBinding?.runtimeMode !== "static-read-only") fail("seis-cloud SSH binding must remain static-read-only");
    if (sshBinding?.liveClaim !== "blocked-until-strict-online-evidence") fail("seis-cloud SSH binding must block live claims until strict evidence");
  }
  const storeLane = lanes.find((candidate) => candidate.id === "seis-store");
  if (storeLane && storeLane.mcpTools.length !== 0) fail("SEIS Store must not claim a remote MCP execution path");
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
  [html, "Command Center HTML", "ecosystem-control-plane"],
  [html, "Command Center HTML", "ecosystem-control-grid"],
  [script, "Command Center script", "loadSeisCoreEcosystemRegistry"],
  [script, "Command Center script", "renderEcosystemControlPlane"],
  [script, "Command Center script", "copyEcosystemGate"],
  [css, "Command Center CSS", ".ecosystem-lane-card"],
  [docs, "Command Center docs", "## Ecosystem Control Plane"]
]) {
  if (!text.includes(required)) fail(`${label} missing ${required}`);
}

if (packageJson?.scripts?.["check:seis-core-ecosystem-registry"] !== "node scripts/check-seis-core-ecosystem-registry.mjs") {
  fail("package.json must expose check:seis-core-ecosystem-registry");
}

if (failures.length) {
  console.error("SEIS Core ecosystem registry check failed:");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log("SEIS Core ecosystem registry check passed.");
