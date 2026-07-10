#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  registry: "content/development/seis-ai-core-version-registry.json",
  promotionGates: "content/development/seis-ai-core-version-promotion-gates.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  mcpRuntimeContract: "content/development/seis-ai-core-mcp-runtime-contract.json",
  providerRegistry: "content/development/seis-ai-core-provider-registry.json",
  operatingModel: "content/development/seis-ai-core-subagent-operating-model.json",
  runtimeFixtures: "content/development/seis-ai-core-subagent-runtime-fixtures.json",
  reviewLedger: "content/development/seis-ai-core-subagent-review-ledger.json",
  fiveYearPlan: "content/development/seis-sub-agent-5-year-plan.json",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  agentRuntimeDoc: "docs/ai/agent-runtime.md",
  platformDoc: "docs/platform/seis-agent-plugin-integration.md",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  tools: "packages/seis-ai/src/agent/tools.mjs",
  mcp: "packages/seis-ai/src/mcp/server.mjs",
  packageJson: "package.json",
};

const requiredLanes = ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"];
const requiredComponents = ["language-profile", "agent-runtime", "model-router", "provider-registry", "prompt-engine", "sub-agent-lanes", "mcp-runtime-contract"];
const requiredEvidence = [
  "version registry validation",
  "sub-agent operating model validation",
  "runtime fixture validation",
  "quarterly review ledger validation",
  "no-key startup evidence",
  "provider-secret boundary evidence",
  "provider registry fixture evidence",
  "human approval boundary evidence",
  "MCP runtime contract smoke evidence",
  "model-claims audit evidence",
];

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(abs(relativePath), label);
}

const registry = readJson(paths.registry, "SEIS AI Core version registry");
const promotionGates = readJson(paths.promotionGates, "SEIS AI Core version promotion gates");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration manifest");
const mcpRuntimeContract = readJson(paths.mcpRuntimeContract, "MCP runtime contract");
const providerRegistry = readJson(paths.providerRegistry, "provider registry");
const operatingModel = readJson(paths.operatingModel, "sub-agent operating model");
const runtimeFixtures = readJson(paths.runtimeFixtures, "runtime fixture pack");
const reviewLedger = readJson(paths.reviewLedger, "review ledger");
const fiveYearPlan = readJson(paths.fiveYearPlan, "five-year plan");
const aiCoreDoc = readText(paths.aiCoreDoc, "SEIS AI Core docs");
const agentRuntimeDoc = readText(paths.agentRuntimeDoc, "agent runtime docs");
const platformDoc = readText(paths.platformDoc, "plugin platform docs");
const helper = readText(paths.helper, "plugin integration helper");
const tools = readText(paths.tools, "agent tool loop");
const mcp = readText(paths.mcp, "MCP server");
const packageJson = readJson(paths.packageJson, "package.json");

if (registry) {
  ensure(registry.id === "seis-ai-core-version-registry", "registry id mismatch");
  ensure(registry.version === "0.1.0", "registry version must stay 0.1.0 for this foundation slice");
  ensure(registry.status === "documented-fixture", "registry must stay documented-fixture");
  ensure(
    registry.qualityGate === "npm run check:seis-ai-core-version-registry",
    "registry quality gate mismatch"
  );
  ensure(registry.sourceOfTruth?.pluginIntegration === paths.pluginIntegration, "registry must point to plugin integration");
  ensure(registry.sourceOfTruth?.mcpRuntimeContract === paths.mcpRuntimeContract, "registry must point to MCP runtime contract");
  ensure(registry.sourceOfTruth?.providerRegistry === paths.providerRegistry, "registry must point to provider registry");
  ensure(registry.sourceOfTruth?.promotionGates === paths.promotionGates, "registry must point to version promotion gates");
  ensure(registry.sourceOfTruth?.operatingModel === paths.operatingModel, "registry must point to operating model");
  ensure(registry.sourceOfTruth?.runtimeFixtures === paths.runtimeFixtures, "registry must point to runtime fixtures");
  ensure(registry.sourceOfTruth?.reviewLedger === paths.reviewLedger, "registry must point to review ledger");
  ensure(registry.sourceOfTruth?.fiveYearPlan === paths.fiveYearPlan, "registry must point to five-year plan");

  ensure(registry.currentVersion?.id === "seis-ai-core-v0.1", "current version id mismatch");
  ensure(registry.currentVersion?.languageVersion === "SEIS Language v0.1", "language version mismatch");
  ensure(registry.currentVersion?.agentRuntimeVersion === "SEIS Agent Runtime v0.1", "agent runtime version mismatch");
  ensure(registry.currentVersion?.modelRouterVersion === "SEIS Model Router v0.1", "model router version mismatch");
  ensure(registry.currentVersion?.promptEngineVersion === "SEIS Prompt Engine v0.1", "prompt engine version mismatch");
  ensure(registry.currentVersion?.runtimeBoundary === "status-and-plan-only", "current version runtime boundary mismatch");
  ensure(registry.currentVersion?.providerMode === "zero-key-core", "current version provider mode must be zero-key-core");

  ensure(registry.truthBoundaries?.isFoundationModel === false, "registry must not claim foundation model ownership");
  ensure(registry.truthBoundaries?.isTrainedModel === false, "registry must not claim trained model status");
  ensure(registry.truthBoundaries?.providerRoutingIsModelOwnership === false, "registry must reject provider routing as model ownership");
  ensure(registry.truthBoundaries?.promptEngineeringIsTraining === false, "registry must reject prompt engineering as training");
  ensure(registry.truthBoundaries?.ragIsTraining === false, "registry must reject RAG as training");
  ensure(registry.truthBoundaries?.autonomousWriteRuntimeEnabled === false, "registry must not claim autonomous write runtime");
  ensure(registry.truthBoundaries?.externalMutationPerformed === false, "registry must not claim external mutation");
  ensure(registry.truthBoundaries?.credentialAccessPerformed === false, "registry must not claim credential access");

  ensure(registry.runtimeBoundary?.currentLevel === "status-and-plan-only", "runtime boundary must remain status-and-plan-only");
  ensure(registry.runtimeBoundary?.writeExecution === "disabled", "write execution must remain disabled");
  ensure(registry.runtimeBoundary?.backgroundAutomation === "disabled", "background automation must remain disabled");
  ensure(registry.runtimeBoundary?.credentialAccess === "forbidden", "credential access must remain forbidden");
  ensure(registry.runtimeBoundary?.coreRequiresCloudApiKey === false, "core must not require a cloud API key");

  ensureArrayIncludesAll(
    (registry.versionComponents || []).map((component) => component.id),
    requiredComponents,
    "versionComponents"
  );
  for (const component of registry.versionComponents || []) {
    ensure(typeof component.name === "string" && component.name.length > 0, `${component.id}.name must be set`);
    ensure(typeof component.kind === "string" && component.kind.length > 0, `${component.id}.kind must be set`);
    ensure(typeof component.status === "string" && component.status.length > 0, `${component.id}.status must be set`);
    ensure(typeof component.source === "string" && component.source.length > 0, `${component.id}.source must be set`);
    ensure(typeof component.validation === "string" && component.validation.length > 0, `${component.id}.validation must be set`);
  }

  const laneIds = (registry.linkedSubAgentLanes || []).map((lane) => lane.laneId);
  ensureArrayIncludesAll(laneIds, requiredLanes, "linkedSubAgentLanes");
  ensure(new Set(laneIds).size === laneIds.length, "linkedSubAgentLanes must be unique");
  for (const lane of registry.linkedSubAgentLanes || []) {
    ensure(lane.permissionLevel === "plan-only", `${lane.laneId}.permissionLevel must stay plan-only`);
    ensure(typeof lane.statusTool === "string" && lane.statusTool.length > 0, `${lane.laneId}.statusTool must be set`);
    ensure(typeof lane.planTool === "string" && lane.planTool.length > 0, `${lane.laneId}.planTool must be set`);
    ensure(typeof lane.versionDuty === "string" && lane.versionDuty.length > 0, `${lane.laneId}.versionDuty must be set`);
  }

  ensure(Array.isArray(registry.fiveYearVersionRoadmap) && registry.fiveYearVersionRoadmap.length === 5, "fiveYearVersionRoadmap must contain five years");
  for (const year of [1, 2, 3, 4, 5]) {
    const record = (registry.fiveYearVersionRoadmap || []).find((entry) => entry.year === year);
    ensure(Boolean(record), `fiveYearVersionRoadmap missing year ${year}`);
    if (!record) continue;
    ensure(typeof record.versionTarget === "string" && record.versionTarget.length > 0, `year ${year}.versionTarget must be set`);
    ensure(typeof record.promotionGate === "string" && record.promotionGate.length > 0, `year ${year}.promotionGate must be set`);
  }
  ensureArrayIncludesAll(registry.promotionEvidenceRequired, requiredEvidence, "promotionEvidenceRequired");
}

if (operatingModel) {
  ensure(operatingModel.sourceOfTruth?.versionRegistry === paths.registry, "operating model must point to version registry");
}

if (pluginIntegration) {
  ensure(pluginIntegration.runtimeIntegration?.versionRegistryTool === "seis_ai_core_version_status", "plugin integration must expose version registry tool");
  ensure(pluginIntegration.runtimeIntegration?.providerRegistryTool === "seis_ai_core_provider_status", "plugin integration must expose provider registry tool");
  ensure(
    pluginIntegration.runtimeIntegration?.versionPromotionTool === "seis_ai_core_version_promotion_dry_run",
    "plugin integration must expose version promotion dry-run tool"
  );
  ensureArrayIncludesAll(pluginIntegration.runtimeIntegration?.mcpResources, [
    "seis://ai/mcp-runtime-contract.json",
    "seis://ai/provider-registry.json",
    "seis://ai/150b-frontier-model-program.json",
    "seis://ai/20b-model-card-template.json",
    "seis://ai/20b-dataset-card-template.json",
    "seis://ai/version-registry.json",
    "seis://ai/version-promotion-gates.json",
  ], "runtimeIntegration.mcpResources");
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.mcpRuntimeContract === paths.mcpRuntimeContract,
    "five-year subagent development must point to MCP runtime contract"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.providerRegistry === paths.providerRegistry,
    "five-year subagent development must point to provider registry"
  );
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.versionRegistry === paths.registry, "five-year subagent development must point to version registry");
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.versionPromotionGates === paths.promotionGates,
    "five-year subagent development must point to version promotion gates"
  );
  ensureArrayIncludesAll(pluginIntegration.qualityCommands, [
    "npm run check:seis-ai-core-provider-registry",
    "npm run check:seis-ai-core-version-registry",
  ], "pluginIntegration.qualityCommands");
}

ensure(promotionGates?.sourceOfTruth?.versionRegistry === paths.registry, "version promotion gates must point back to version registry");
ensure(promotionGates?.sourceOfTruth?.mcpRuntimeContract === paths.mcpRuntimeContract, "version promotion gates must point to MCP runtime contract");
ensure(promotionGates?.sourceOfTruth?.providerRegistry === paths.providerRegistry, "version promotion gates must point to provider registry");

if (mcpRuntimeContract) {
  ensure(mcpRuntimeContract.id === "seis-ai-core-mcp-runtime-contract", "MCP runtime contract id mismatch");
  ensure(mcpRuntimeContract.resourceUri === "seis://ai/mcp-runtime-contract.json", "MCP runtime contract resource URI mismatch");
  ensure(mcpRuntimeContract.toolCount === 34, "MCP runtime contract must record 34 tools");
  ensure(mcpRuntimeContract.resourceCount === 30, "MCP runtime contract must record 30 resources");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI evaluation protocol"), "MCP runtime contract resource evidence must mention AGI evaluation protocol");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI public readiness evidence"), "MCP runtime contract resource evidence must mention AGI public readiness evidence");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI GitHub user readiness gates"), "MCP runtime contract resource evidence must mention AGI GitHub user readiness gates");
  ensure(mcpRuntimeContract.promptCount === 4, "MCP runtime contract must record 4 prompts");
}

ensure(providerRegistry?.id === "seis-ai-core-provider-registry", "provider registry id mismatch");
ensure(providerRegistry?.coreCredentialRequirement === "none", "provider registry must keep zero-key core");

ensure(runtimeFixtures?.sourceOfTruth?.versionRegistry === paths.registry, "runtime fixtures must point to version registry");
ensure(reviewLedger?.sourceOfTruth?.versionRegistry === paths.registry, "review ledger must point to version registry");
ensure(Array.isArray(fiveYearPlan?.years) && fiveYearPlan.years.length === 5, "five-year plan must include five years");

for (const [text, label] of [
  [aiCoreDoc, "SEIS AI Core docs"],
  [agentRuntimeDoc, "agent runtime docs"],
  [platformDoc, "plugin platform docs"],
]) {
  for (const token of [
    "seis-ai-core-version-registry.json",
    "seis-ai-core-version-promotion-gates.json",
    "seis-ai-core-mcp-runtime-contract.json",
    "seis-ai-core-provider-registry.json",
    "SEIS AI Core v0.1",
    "seis_ai_core_provider_status",
    "seis_ai_core_version_status",
    "seis_ai_core_version_promotion_dry_run",
  ]) {
    ensure(text.includes(token), `${label} missing ${token}`);
  }
}

for (const [text, label] of [
  [helper, "helper"],
  [tools, "tool loop"],
  [mcp, "MCP server"],
]) {
  ensure(text.includes("AI_CORE_PROVIDER_STATUS_TOOL"), `${label} must expose AI_CORE_PROVIDER_STATUS_TOOL`);
  ensure(text.includes("AI_CORE_VERSION_STATUS_TOOL"), `${label} must expose AI_CORE_VERSION_STATUS_TOOL`);
  ensure(text.includes("AI_CORE_VERSION_PROMOTION_TOOL"), `${label} must expose AI_CORE_VERSION_PROMOTION_TOOL`);
}
ensure(helper.includes("aiCoreProviderStatus"), "helper must define aiCoreProviderStatus");
ensure(helper.includes("aiCoreVersionStatus"), "helper must define aiCoreVersionStatus");
ensure(helper.includes("aiCoreVersionPromotionDryRun"), "helper must define aiCoreVersionPromotionDryRun");
ensure(tools.includes("aiCoreProviderStatus"), "tool loop must call aiCoreProviderStatus");
ensure(tools.includes("aiCoreVersionStatus"), "tool loop must call aiCoreVersionStatus");
ensure(tools.includes("aiCoreVersionPromotionDryRun"), "tool loop must call aiCoreVersionPromotionDryRun");
ensure(mcp.includes("seis://ai/provider-registry.json"), "MCP server must expose provider registry resource");
ensure(mcp.includes("seis://ai/version-registry.json"), "MCP server must expose version registry resource");
ensure(mcp.includes("seis://ai/version-promotion-gates.json"), "MCP server must expose version promotion gate resource");
ensure(mcp.includes("seis://ai/mcp-runtime-contract.json"), "MCP server must expose MCP runtime contract resource");

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-ai-core-provider-registry"] ===
      "node scripts/check-seis-ai-core-provider-registry.mjs",
    "package.json must expose check:seis-ai-core-provider-registry"
  );
  ensure(
    packageJson.scripts?.["check:seis-ai-core-version-registry"] ===
      "node scripts/check-seis-ai-core-version-registry.mjs",
    "package.json must expose check:seis-ai-core-version-registry"
  );
  ensure(
    packageJson.scripts?.["check:seis-ai-core-version-promotion-gates"] ===
      "node scripts/check-seis-ai-core-version-promotion-gates.mjs",
    "package.json must expose check:seis-ai-core-version-promotion-gates"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-ai-core-provider-registry"),
    "quality:governance must include check:seis-ai-core-provider-registry"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-ai-core-version-registry"),
    "quality:governance must include check:seis-ai-core-version-registry"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-ai-core-version-promotion-gates"),
    "quality:governance must include check:seis-ai-core-version-promotion-gates"
  );
}

if (failures.length) {
  console.error("SEIS AI Core version registry check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS AI Core version registry check passed.");

function abs(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
}

function readJson(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}
