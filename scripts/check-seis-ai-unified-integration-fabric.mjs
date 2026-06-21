import { existsSync, readFileSync } from "node:fs";

const fabricPath = "data/seis-ai-unified-integration-fabric.json";
const activationMatrixPath = "data/seis-ai-activation-matrix.json";
const installedAICollaborationPath = "data/seis-installed-ai-collaboration.json";
const websiteFeatureFabricPath = "data/seis-ai-website-feature-fabric.json";
const specialistPluginsPath = "data/seis-specialist-plugins-2026-06-12.json";
const sshContractPath = "data/ssh-hardening-operation-contract.json";
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

function collectText(value) {
  return JSON.stringify(value);
}

const fabric = readJson(fabricPath);
const activationMatrix = readJson(activationMatrixPath);
const installedAICollaboration = readJson(installedAICollaborationPath);
const websiteFeatureFabric = readJson(websiteFeatureFabricPath);
const specialistPlugins = readJson(specialistPluginsPath);
const sshContract = readJson(sshContractPath);
const fabricText = collectText(fabric);

if (fabric.id !== "seis-ai-unified-integration-fabric") {
  fail("fabric id must be seis-ai-unified-integration-fabric");
}

if (fabric.status !== "local-fixture-backed") {
  fail("fabric status must be local-fixture-backed");
}

if (fabric.mode !== "plan-first-no-live-mutation") {
  fail("fabric mode must be plan-first-no-live-mutation");
}

for (const sourcePath of fabric.sourceBasis ?? []) {
  assertPathExists(sourcePath, "sourceBasis entry");
}

assertArrayIncludesAll("coreBoundaries", fabric.coreBoundaries, [
  "Agents are controlled workflows around known tools and contracts, not uncontrolled autonomous owners.",
  "Plugins feed SEIS AI through declared lane profiles, MCP tool names, fixture metadata, and reviewable plans only.",
  "SSH is a controlled execution plane and remains plan-only, verify-only, or audit-only unless explicit human approval and rollback evidence exist.",
  "No browser surface may request, store, or forward provider API keys, SSH private keys, passwords, service accounts, cookies, or production secrets.",
  "No live provider call, SSH mutation, deployment, database migration, payment action, branch deletion, force push, or model training is enabled by this fabric."
]);

const requiredAgents = [
  "seis-assistant",
  "repository-analyst",
  "goal-architect",
  "research-synthesizer",
  "documentation-maintainer",
  "model-evaluator",
  "workflow-operator",
  "plugin-steward",
  "ssh-operations-reviewer"
];

const agentIds = new Set();
for (const agent of fabric.agentCatalog ?? []) {
  agentIds.add(agent.id);

  for (const requiredField of [
    "displayName",
    "purpose",
    "allowedTools",
    "deniedTools",
    "approvalPolicy",
    "memoryScope",
    "maxSteps",
    "timeLimitSeconds",
    "enabledState"
  ]) {
    if (agent[requiredField] === undefined) {
      fail(`${agent.id ?? "agent"} missing ${requiredField}`);
    }
  }

  if (!Array.isArray(agent.allowedTools) || agent.allowedTools.length === 0) {
    fail(`${agent.id} must declare allowedTools`);
  }

  if (!Array.isArray(agent.deniedTools) || agent.deniedTools.length === 0) {
    fail(`${agent.id} must declare deniedTools`);
  }

  if (!`${agent.approvalPolicy}`.includes("approval") && agent.approvalPolicy !== "no-approval-for-read-only-low-risk") {
    fail(`${agent.id} approvalPolicy must be explicit`);
  }
}

for (const agentId of requiredAgents) {
  if (!agentIds.has(agentId)) {
    fail(`missing required agent ${agentId}`);
  }
}

const specialistPluginNames = new Set((specialistPlugins.plugins ?? []).map((plugin) => plugin.name));
const expectedPluginLanes = ["seis-governance", "seis-cloud", "seis-code", "seis-design", "seis-data"];
const feedTargets = new Set();

for (const lane of fabric.pluginFeedLanes ?? []) {
  if (!specialistPluginNames.has(lane.id)) {
    fail(`pluginFeedLanes.${lane.id} is not listed in ${specialistPluginsPath}`);
  }

  assertPathExists(lane.sourceMirror, `${lane.id} sourceMirror`);

  if (!`${lane.installId}`.startsWith("seis-ai-agent@seis-repo#")) {
    fail(`${lane.id} installId must feed through seis-ai-agent@seis-repo`);
  }

  if (!Array.isArray(lane.mcpTools) || lane.mcpTools.length === 0) {
    fail(`${lane.id} must declare mcpTools`);
  }

  if (!Array.isArray(lane.feeds) || lane.feeds.length === 0) {
    fail(`${lane.id} must feed at least one SEIS AI agent`);
  }

  for (const target of lane.feeds ?? []) {
    feedTargets.add(target);
    if (!agentIds.has(target)) {
      fail(`${lane.id} feeds unknown agent ${target}`);
    }
  }
}

for (const lane of expectedPluginLanes) {
  if (!(fabric.pluginFeedLanes ?? []).some((entry) => entry.id === lane)) {
    fail(`missing plugin feed lane ${lane}`);
  }
}

for (const target of ["plugin-steward", "ssh-operations-reviewer", "repository-analyst", "model-evaluator"]) {
  if (!feedTargets.has(target)) {
    fail(`plugin feed lanes should route to ${target}`);
  }
}

if (activationMatrix.id !== "seis-ai-activation-matrix") {
  fail("activation matrix must be readable from data/seis-ai-activation-matrix.json");
}

if (installedAICollaboration.id !== "seis-installed-ai-collaboration") {
  fail("installed AI collaboration must be readable from data/seis-installed-ai-collaboration.json");
}

if (websiteFeatureFabric.id !== "seis-ai-website-feature-fabric") {
  fail("website feature fabric must be readable from data/seis-ai-website-feature-fabric.json");
}

for (const plane of fabric.sshExecutionPlanes ?? []) {
  assertPathExists(plane.contractPath, `${plane.id} contractPath`);
  for (const docPath of plane.docs ?? []) {
    assertPathExists(docPath, `${plane.id} doc`);
  }
  assertArrayIncludesAll(`${plane.id}.allowedModes`, plane.allowedModes, ["audit", "dashboard", "verify", "dry-run"]);
  assertArrayIncludesAll(`${plane.id}.blockedWithoutApproval`, plane.blockedWithoutApproval, [
    "harden",
    "full-setup",
    "firewall-apply",
    "authorized-keys-write",
    "sudo-live-mutation"
  ]);
  if (!`${plane.privateKeyRule}`.includes("private key remains exclusively under operator control")) {
    fail(`${plane.id} must preserve operator private-key control`);
  }
}

if (sshContract.credentialHandling?.privateKeyMaterialLogged !== false) {
  fail("SSH contract must keep privateKeyMaterialLogged false");
}

const requiredWebsites = ["seis-ai-demo", "seis-demo-web", "seis-command-center", "portfolio-ai-website"];
const websiteFeatureSurfaces = new Map((websiteFeatureFabric.websiteFeatureSurfaces ?? []).map((surface) => [surface.websiteId, surface]));
for (const website of fabric.aiWebsites ?? []) {
  assertPathExists(website.path, `${website.id} path`);
  assertPathExists(website.entrypoint, `${website.id} entrypoint`);
  assertPathExists(website.contract, `${website.id} contract`);

  const websiteFeatureSurface = websiteFeatureSurfaces.get(website.id);
  if (!websiteFeatureSurface) {
    fail(`website feature fabric must expose ${website.id}`);
  } else if (websiteFeatureSurface.path !== website.path) {
    fail(`${website.id} website feature path must match unified fabric website path`);
  }
}

for (const websiteId of requiredWebsites) {
  if (!(fabric.aiWebsites ?? []).some((website) => website.id === websiteId)) {
    fail(`missing aiWebsites entry ${websiteId}`);
  }
}

if (!fabric.uiSurface || typeof fabric.uiSurface !== "object") {
  fail("fabric must declare uiSurface");
} else {
  assertPathExists(fabric.uiSurface.path, "uiSurface path");
  assertPathExists(fabric.uiSurface.script, "uiSurface script");

  const uiHtml = existsSync(fabric.uiSurface.path)
    ? readFileSync(fabric.uiSurface.path, "utf8")
    : "";
  const uiScript = existsSync(fabric.uiSurface.script)
    ? readFileSync(fabric.uiSurface.script, "utf8")
    : "";

  assertArrayIncludesAll("uiSurface.sections", fabric.uiSurface.sections, [
    "fabric",
    "fabric-summary",
    "fabric-agents",
    "fabric-plugin-feeds",
    "fabric-ssh-plane",
    "fabric-activation-matrix",
    "fabric-website-features",
    "fabric-websites"
  ]);

  for (const sectionId of fabric.uiSurface.sections ?? []) {
    if (!uiHtml.includes(`id="${sectionId}"`)) {
      fail(`uiSurface section ${sectionId} is not present in ${fabric.uiSurface.path}`);
    }
  }

  assertArrayIncludesAll("uiSurface.exportHelpers", fabric.uiSurface.exportHelpers, [
    "fabricOverview",
    "generateFabricSummary",
    "renderFabric",
    "activationMatrixOverview",
    "generateActivationMatrixCards",
    "websiteFeatureFabricOverview",
    "generateWebsiteFeatureCards",
    "installedAIHelpers",
    "pluginFeedLanes",
    "sshExecutionPlane",
    "aiWebsiteSurfaces"
  ]);

  for (const helperName of fabric.uiSurface.exportHelpers ?? []) {
    if (!uiScript.includes(helperName)) {
      fail(`uiSurface helper ${helperName} is not present in ${fabric.uiSurface.script}`);
    }
  }
}

assertArrayIncludesAll("validation", fabric.validation, [
  "npm run check:seis-ai-unified-integration-fabric",
  "npm run check:seis-ai-activation-matrix",
  "npm run check:seis-installed-ai-collaboration",
  "npm run check:seis-ai-website-feature-fabric",
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
  if (forbidden.test(fabricText)) {
    fail(`fabric contains forbidden sensitive or machine-specific pattern: ${forbidden}`);
  }
}

if (!fabricText.includes("No live provider call")) {
  fail("fabric must explicitly block live provider claims");
}

if (!fabricText.includes("No browser surface may request")) {
  fail("fabric must explicitly block browser secret entry");
}

if (failures.length > 0) {
  console.error("SEIS AI unified integration fabric check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS AI unified integration fabric check passed.");
