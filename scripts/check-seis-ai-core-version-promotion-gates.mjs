#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  promotionGates: "content/development/seis-ai-core-version-promotion-gates.json",
  registry: "content/development/seis-ai-core-version-registry.json",
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
  loop: "packages/seis-ai/src/agent/loop.mjs",
  mcp: "packages/seis-ai/src/mcp/server.mjs",
  packageJson: "package.json",
};

const requiredLanes = ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"];
const requiredDecisionStates = [
  "eligible-for-internal-review",
  "blocked-until-evidence",
  "blocked-human-approval",
  "not-ready",
];
const requiredEvidence = [
  "version registry validation",
  "plugin integration validation",
  "sub-agent operating model validation",
  "runtime fixture validation",
  "quarterly review ledger validation",
  "five-year plan validation",
  "no external mutation evidence",
  "zero-key core boundary evidence",
  "provider registry fixture evidence",
];

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(abs(relativePath), label);
}

const gates = readJson(paths.promotionGates, "version promotion gates");
const registry = readJson(paths.registry, "version registry");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration");
const mcpRuntimeContract = readJson(paths.mcpRuntimeContract, "MCP runtime contract");
const providerRegistry = readJson(paths.providerRegistry, "provider registry");
const operatingModel = readJson(paths.operatingModel, "operating model");
const runtimeFixtures = readJson(paths.runtimeFixtures, "runtime fixtures");
const reviewLedger = readJson(paths.reviewLedger, "review ledger");
const fiveYearPlan = readJson(paths.fiveYearPlan, "five-year plan");
const aiCoreDoc = readText(paths.aiCoreDoc, "SEIS AI Core docs");
const agentRuntimeDoc = readText(paths.agentRuntimeDoc, "agent runtime docs");
const platformDoc = readText(paths.platformDoc, "plugin platform docs");
const helper = readText(paths.helper, "plugin integration helper");
const tools = readText(paths.tools, "agent tools");
const loop = readText(paths.loop, "agent loop");
const mcp = readText(paths.mcp, "MCP server");
const packageJson = readJson(paths.packageJson, "package.json");

if (gates) {
  ensure(gates.id === "seis-ai-core-version-promotion-gates", "promotion gates id mismatch");
  ensure(gates.status === "documented-fixture", "promotion gates must stay documented-fixture");
  ensure(
    gates.qualityGate === "npm run check:seis-ai-core-version-promotion-gates",
    "promotion gates quality gate mismatch"
  );
  for (const [key, expected] of Object.entries({
    versionRegistry: paths.registry,
    pluginIntegration: paths.pluginIntegration,
    mcpRuntimeContract: paths.mcpRuntimeContract,
    providerRegistry: paths.providerRegistry,
    operatingModel: paths.operatingModel,
    runtimeFixtures: paths.runtimeFixtures,
    reviewLedger: paths.reviewLedger,
    fiveYearPlan: paths.fiveYearPlan,
    aiCoreDoc: paths.aiCoreDoc,
    agentRuntimeDoc: paths.agentRuntimeDoc,
    pluginIntegrationDoc: paths.platformDoc,
  })) {
    ensure(gates.sourceOfTruth?.[key] === expected, `sourceOfTruth.${key} must be ${expected}`);
  }
  ensure(gates.tooling?.tool === "seis_ai_core_version_promotion_dry_run", "promotion dry-run tool mismatch");
  ensure(gates.tooling?.mcpResource === "seis://ai/version-promotion-gates.json", "promotion MCP resource mismatch");
  ensure(gates.runtimeBoundary?.currentLevel === "status-and-plan-only", "runtime boundary must stay status-and-plan-only");
  ensure(gates.runtimeBoundary?.writeExecution === "disabled", "write execution must remain disabled");
  ensure(gates.runtimeBoundary?.backgroundAutomation === "disabled", "background automation must remain disabled");
  ensure(gates.runtimeBoundary?.credentialAccess === "forbidden", "credential access must remain forbidden");
  ensure(gates.runtimeBoundary?.liveProviderCalls === "disabled", "live provider calls must remain disabled");
  ensure(gates.runtimeBoundary?.coreRequiresCloudApiKey === false, "core must not require a cloud API key");
  ensure(gates.runtimeBoundary?.dryRunOnly === true, "promotion gates must be dry-run-only");

  ensure(gates.truthBoundaries?.promotionDryRunIsReleaseApproval === false, "dry-run must not be release approval");
  ensure(gates.truthBoundaries?.dryRunPermitsExternalMutation === false, "dry-run must not permit external mutation");
  ensure(gates.truthBoundaries?.dryRunPermitsCredentialAccess === false, "dry-run must not permit credential access");
  ensureArrayIncludesAll(gates.decisionStates, requiredDecisionStates, "decisionStates");
  ensureArrayIncludesAll((gates.laneResponsibilities || []).map((lane) => lane.laneId), requiredLanes, "laneResponsibilities");

  const registryRoadmap = Array.isArray(registry?.fiveYearVersionRoadmap) ? registry.fiveYearVersionRoadmap : [];
  ensure(Array.isArray(gates.gates) && gates.gates.length === 5, "promotion gates must contain five gates");
  for (const roadmapEntry of registryRoadmap) {
    const gate = (gates.gates || []).find(
      (candidate) => candidate.year === roadmapEntry.year && candidate.versionTarget === roadmapEntry.versionTarget
    );
    ensure(Boolean(gate), `missing promotion gate for ${roadmapEntry.versionTarget}`);
  }
  for (const gate of gates.gates || []) {
    ensure(typeof gate.year === "number", `${gate.versionTarget}.year must be numeric`);
    ensure(typeof gate.versionTarget === "string" && gate.versionTarget.length > 0, `gate ${gate.year}.versionTarget must be set`);
    ensure(requiredDecisionStates.includes(gate.dryRunDecision), `${gate.versionTarget}.dryRunDecision is unknown`);
    ensure(gate.releasePromotionAllowed === false, `${gate.versionTarget} must not allow release promotion from dry-run`);
    ensure(Array.isArray(gate.requiredEvidence) && gate.requiredEvidence.length > 0, `${gate.versionTarget}.requiredEvidence required`);
    ensure(Array.isArray(gate.validationCommands) && gate.validationCommands.length > 0, `${gate.versionTarget}.validationCommands required`);
    ensure(Array.isArray(gate.blockers), `${gate.versionTarget}.blockers must be an array`);
  }

  const currentGate = (gates.gates || []).find((gate) => gate.versionTarget === gates.currentDryRun?.requestedVersionTarget);
  ensure(currentGate?.dryRunDecision === gates.currentDryRun?.decision, "current dry-run decision must match the current gate");
  ensure(gates.currentDryRun?.releasePromotionAllowed === false, "current dry-run must not allow release promotion");
  ensure(gates.currentDryRun?.realExecutionBlocked === true, "current dry-run must block real execution");
  ensure(gates.currentDryRun?.externalMutationPerformed === false, "current dry-run must not perform external mutation");
  ensure(gates.currentDryRun?.credentialAccessPerformed === false, "current dry-run must not perform credential access");
  ensureArrayIncludesAll(currentGate?.requiredEvidence, requiredEvidence, "v0.1 required evidence");
}

if (registry) {
  ensure(registry.sourceOfTruth?.promotionGates === paths.promotionGates, "version registry must point to promotion gates");
  ensure(registry.sourceOfTruth?.mcpRuntimeContract === paths.mcpRuntimeContract, "version registry must point to MCP runtime contract");
  ensure(registry.sourceOfTruth?.providerRegistry === paths.providerRegistry, "version registry must point to provider registry");
}

if (pluginIntegration) {
  ensure(
    pluginIntegration.runtimeIntegration?.versionPromotionTool === "seis_ai_core_version_promotion_dry_run",
    "plugin integration must expose version promotion dry-run tool"
  );
  ensure(pluginIntegration.runtimeIntegration?.providerRegistryTool === "seis_ai_core_provider_status", "plugin integration must expose provider registry tool");
  ensureArrayIncludesAll(
    pluginIntegration.runtimeIntegration?.mcpResources,
    [
      "seis://ai/mcp-runtime-contract.json",
      "seis://ai/provider-registry.json",
      "seis://ai/150b-frontier-model-program.json",
      "seis://ai/20b-model-card-template.json",
      "seis://ai/20b-dataset-card-template.json",
      "seis://ai/version-promotion-gates.json"
    ],
    "runtimeIntegration.mcpResources"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.mcpRuntimeContract === paths.mcpRuntimeContract,
    "five-year subagent development must point to MCP runtime contract"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.providerRegistry === paths.providerRegistry,
    "five-year subagent development must point to provider registry"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.versionPromotionGates === paths.promotionGates,
    "five-year subagent development must point to version promotion gates"
  );
  ensureArrayIncludesAll(
    pluginIntegration.qualityCommands,
    ["npm run check:seis-ai-core-provider-registry", "npm run check:seis-ai-core-version-promotion-gates"],
    "pluginIntegration.qualityCommands"
  );
}

ensure(operatingModel?.sourceOfTruth?.versionPromotionGates === paths.promotionGates, "operating model must point to promotion gates");
ensure(runtimeFixtures?.sourceOfTruth?.versionPromotionGates === paths.promotionGates, "runtime fixtures must point to promotion gates");
ensure(reviewLedger?.sourceOfTruth?.versionPromotionGates === paths.promotionGates, "review ledger must point to promotion gates");
ensure(Array.isArray(fiveYearPlan?.years) && fiveYearPlan.years.length === 5, "five-year plan must include five years");

if (mcpRuntimeContract) {
  ensure(mcpRuntimeContract.resourceUri === "seis://ai/mcp-runtime-contract.json", "MCP runtime contract resource URI mismatch");
  ensure(mcpRuntimeContract.resourceCount === 28, "MCP runtime contract must record 28 resources");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI evaluation protocol"), "MCP runtime contract resource evidence must mention AGI evaluation protocol");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI public readiness evidence"), "MCP runtime contract resource evidence must mention AGI public readiness evidence");
}
ensure(providerRegistry?.id === "seis-ai-core-provider-registry", "provider registry id mismatch");
ensure(providerRegistry?.coreCredentialRequirement === "none", "provider registry must keep zero-key core");

for (const [text, label] of [
  [aiCoreDoc, "SEIS AI Core docs"],
  [agentRuntimeDoc, "agent runtime docs"],
  [platformDoc, "plugin platform docs"],
]) {
  for (const token of [
    "seis-ai-core-version-promotion-gates.json",
    "seis-ai-core-mcp-runtime-contract.json",
    "seis-ai-core-provider-registry.json",
    "seis_ai_core_version_promotion_dry_run",
    "version-promotion-gates",
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
  ensure(text.includes("AI_CORE_VERSION_PROMOTION_TOOL"), `${label} must expose AI_CORE_VERSION_PROMOTION_TOOL`);
  ensure(text.includes("aiCoreVersionPromotionDryRun"), `${label} must reference aiCoreVersionPromotionDryRun`);
}
ensure(loop.includes("seis_ai_core_version_promotion_dry_run"), "agent loop must mention promotion dry-run tool");
ensure(mcp.includes("seis://ai/provider-registry.json"), "MCP server must expose provider registry resource");
ensure(mcp.includes("seis://ai/version-promotion-gates.json"), "MCP server must expose promotion gate resource");
ensure(mcp.includes("seis://ai/mcp-runtime-contract.json"), "MCP server must expose MCP runtime contract resource");

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-ai-core-provider-registry"] ===
      "node scripts/check-seis-ai-core-provider-registry.mjs",
    "package.json must expose check:seis-ai-core-provider-registry"
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
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-ai-core-version-promotion-gates"),
    "quality:governance must include check:seis-ai-core-version-promotion-gates"
  );
}

if (failures.length) {
  console.error("SEIS AI Core version promotion gates check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS AI Core version promotion gates check passed.");

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
