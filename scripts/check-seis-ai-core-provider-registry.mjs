#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  registry: "content/development/seis-ai-core-provider-registry.json",
  versionRegistry: "content/development/seis-ai-core-version-registry.json",
  promotionGates: "content/development/seis-ai-core-version-promotion-gates.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  mcpRuntimeContract: "content/development/seis-ai-core-mcp-runtime-contract.json",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  modelRouterDoc: "docs/ai/model-router.md",
  providerAudit: "docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md",
  routingReport: "reports/seis-ai-routing/w64-provider-routing-order.md",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  tools: "packages/seis-ai/src/agent/tools.mjs",
  mcp: "packages/seis-ai/src/mcp/server.mjs",
  packageJson: "package.json",
};

const requiredPublicStates = ["Available", "Missing Key", "Disabled", "Rate Limited", "Error"];
const requiredProviders = [
  "codex-operator",
  "seis-local-demo",
  "anthropic-claude",
  "openai-general",
  "google-gemini",
  "qwen-review",
  "ollama-local",
];
const requiredReadinessAxes = ["installed", "credentialed", "quotaReady", "ownerApproved", "verified", "blocked"];
const requiredRoutingPriority = [
  "adequate-local-provider",
  "owner-selected-provider",
  "capability-compatible-approved-cloud-provider",
  "lowest-risk-approved-cloud-provider",
  "lowest-cost-approved-cloud-provider",
  "seis-local-demo",
  "feature-disabled",
];
const publicEnvPrefixes = [
  "VITE_",
  "NEXT_PUBLIC_",
  "PUBLIC_",
  "REACT_APP_",
  "NUXT_PUBLIC_",
  "EXPO_PUBLIC_",
  "ASTRO_PUBLIC_",
];

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(abs(relativePath), label);
}

const registry = readJson(paths.registry, "provider registry");
const versionRegistry = readJson(paths.versionRegistry, "version registry");
const promotionGates = readJson(paths.promotionGates, "promotion gates");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration");
const mcpRuntimeContract = readJson(paths.mcpRuntimeContract, "MCP runtime contract");
const aiCoreDoc = readText(paths.aiCoreDoc, "SEIS AI Core docs");
const modelRouterDoc = readText(paths.modelRouterDoc, "model router docs");
const providerAudit = readText(paths.providerAudit, "provider audit docs");
const routingReport = readText(paths.routingReport, "W64 routing report");
const helper = readText(paths.helper, "helper");
const tools = readText(paths.tools, "tool loop");
const mcp = readText(paths.mcp, "MCP server");
const packageJson = readJson(paths.packageJson, "package.json");

if (registry) {
  ensure(registry.id === "seis-ai-core-provider-registry", "provider registry id mismatch");
  ensure(registry.status === "documented-fixture", "provider registry must stay documented-fixture");
  ensure(registry.qualityGate === "npm run check:seis-ai-core-provider-registry", "provider registry quality gate mismatch");
  ensure(registry.coreCredentialRequirement === "none", "coreCredentialRequirement must be none");
  ensure(registry.defaultRoutingMode === "local-demo", "defaultRoutingMode must be local-demo");
  ensure(registry.localOnlyRespected === true, "localOnlyRespected must be true");
  ensure(Array.isArray(registry.requiredForCore) && registry.requiredForCore.length === 0, "requiredForCore must stay empty");
  ensureArrayIncludesAll(registry.publicStates, requiredPublicStates, "publicStates");
  ensureArrayIncludesAll((registry.stateModel || []).map((state) => state.state), requiredPublicStates, "stateModel");
  ensureArrayIncludesAll((registry.providerReadinessAxes || []).map((axis) => axis.axis), requiredReadinessAxes, "providerReadinessAxes");
  ensure(registry.routingPriority?.mode === "local-first-when-adequate", "routingPriority.mode must be local-first-when-adequate");
  ensureArrayEquals(registry.routingPriority?.selectionOrder, requiredRoutingPriority, "routingPriority.selectionOrder");
  ensure(String(registry.routingPriority?.eligibilityRule || "").includes("installed"), "routingPriority.eligibilityRule must mention installed");
  ensure(String(registry.routingPriority?.eligibilityRule || "").includes("credentialed"), "routingPriority.eligibilityRule must mention credentialed");
  ensure(String(registry.routingPriority?.eligibilityRule || "").includes("quotaReady"), "routingPriority.eligibilityRule must mention quotaReady");
  ensure(String(registry.routingPriority?.eligibilityRule || "").includes("ownerApproved"), "routingPriority.eligibilityRule must mention ownerApproved");
  ensure(String(registry.routingPriority?.eligibilityRule || "").includes("verified"), "routingPriority.eligibilityRule must mention verified");
  ensure(String(registry.routingPriority?.eligibilityRule || "").includes("blocked is false"), "routingPriority.eligibilityRule must require blocked false");
  ensure(String(registry.routingPriority?.eligibilityRule || "").includes("capability"), "routingPriority.eligibilityRule must mention capability");
  ensure(String(registry.routingPriority?.eligibilityRule || "").includes("privacy mode"), "routingPriority.eligibilityRule must mention privacy mode");
  ensure(String(registry.routingPriority?.limitHandling || "").includes("Rate Limited"), "routingPriority.limitHandling must mention Rate Limited");
  ensure(String(registry.routingPriority?.limitHandling || "").includes("Error"), "routingPriority.limitHandling must mention Error");
  ensure(String(registry.routingPriority?.limitHandling || "").includes("blocked for the decision"), "routingPriority.limitHandling must block the failed provider for the decision");
  ensure(String(registry.routingPriority?.limitHandling || "").includes("redacted reason"), "routingPriority.limitHandling must require a redacted reason");
  ensure(String(registry.routingPriority?.limitHandling || "").includes("move visibly to the next eligible provider"), "routingPriority.limitHandling must require visible fallback movement");
  ensure(String(registry.routingPriority?.limitHandling || "").includes("Do not silently switch providers."), "routingPriority.limitHandling must block silent provider switching");
  ensureArrayIncludesAll((registry.providers || []).map((provider) => provider.id), requiredProviders, "providers");
  ensureArrayIncludesAll(registry.fallbackOrder, requiredRoutingPriority, "fallbackOrder");
  ensure((registry.fallbackOrder || []).indexOf("adequate-local-provider") < (registry.fallbackOrder || []).indexOf("owner-selected-provider"), "fallbackOrder must keep adequate-local-provider before owner-selected-provider");
  ensure((registry.fallbackOrder || []).indexOf("owner-selected-provider") < (registry.fallbackOrder || []).indexOf("capability-compatible-approved-cloud-provider"), "fallbackOrder must keep owner-selected-provider before approved cloud provider");
  ensure((registry.fallbackOrder || []).indexOf("lowest-risk-approved-cloud-provider") < (registry.fallbackOrder || []).indexOf("lowest-cost-approved-cloud-provider"), "fallbackOrder must keep risk before cost fallback");
  ensure((registry.fallbackOrder || []).includes("approved-local-provider"), "fallbackOrder must keep approved-local-provider legacy alias");
  ensure((registry.fallbackOrder || []).includes("local-demo"), "fallbackOrder must keep local-demo legacy alias");
  ensureArrayIncludesAll(registry.noKeyProviders, ["codex-operator", "seis-local-demo", "ollama-local"], "noKeyProviders");
  ensure(registry.sourceOfTruth?.w64RoutingOrderReport === paths.routingReport, "provider registry must point to W64 routing order report");

  const providers = Array.isArray(registry.providers) ? registry.providers : [];
  const localDemo = providers.find((provider) => provider.id === "seis-local-demo");
  ensure(localDemo?.publicStatus === "Available", "seis-local-demo must be Available");
  ensure(localDemo?.credentialRequirement === "none", "seis-local-demo must require no credential");
  ensure(localDemo?.routingEligible === true, "seis-local-demo must be routing eligible");
  ensure(localDemo?.frontendSecretAllowed === false, "seis-local-demo must not allow frontend secrets");

  for (const provider of providers) {
    ensure(requiredPublicStates.includes(provider.publicStatus), `${provider.id}.publicStatus is not allowed`);
    ensure(provider.backendOnly === true, `${provider.id}.backendOnly must be true`);
    ensure(provider.frontendSecretAllowed === false, `${provider.id}.frontendSecretAllowed must be false`);
    ensure(typeof provider.credentialRequirement === "string" && provider.credentialRequirement.length > 0, `${provider.id}.credentialRequirement required`);
    ensure(Array.isArray(provider.capabilities) && provider.capabilities.length > 0, `${provider.id}.capabilities required`);
    ensure(provider.actualModel !== undefined, `${provider.id}.actualModel required`);
    ensure(provider.readiness && typeof provider.readiness === "object", `${provider.id}.readiness required`);
    for (const axis of requiredReadinessAxes) {
      ensure(typeof provider.readiness?.[axis] === "boolean", `${provider.id}.readiness.${axis} must be boolean`);
    }
    ensure(Array.isArray(provider.readiness?.blockedReasons), `${provider.id}.readiness.blockedReasons must be an array`);
    if (provider.routingEligible === true) {
      ensure(provider.readiness.installed === true, `${provider.id} cannot route without installed readiness`);
      ensure(provider.readiness.credentialed === true, `${provider.id} cannot route without credentialed readiness`);
      ensure(provider.readiness.quotaReady === true, `${provider.id} cannot route without quotaReady readiness`);
      ensure(provider.readiness.ownerApproved === true, `${provider.id} cannot route without ownerApproved readiness`);
      ensure(provider.readiness.verified === true, `${provider.id} cannot route without verified readiness`);
      ensure(provider.readiness.blocked === false, `${provider.id} cannot route while blocked`);
    }
    if (provider.readiness?.blocked === true) {
      ensure(provider.routingEligible === false, `${provider.id} must not route while readiness.blocked is true`);
      ensure(provider.readiness.blockedReasons.length > 0, `${provider.id} blocked routes must explain blockedReasons`);
    }
    if (provider.publicStatus === "Missing Key" || provider.publicStatus === "Disabled") {
      ensure(provider.routingEligible === false, `${provider.id} must not route while ${provider.publicStatus}`);
      ensure(provider.enabled === false, `${provider.id} must not be enabled while ${provider.publicStatus}`);
    }
    if (provider.publicStatus === "Rate Limited" || provider.publicStatus === "Error") {
      ensure(provider.routingEligible === false, `${provider.id} must not route while ${provider.publicStatus}`);
      ensure(provider.enabled === false, `${provider.id} must not be enabled while ${provider.publicStatus}`);
      ensure(provider.readiness.blocked === true, `${provider.id} must be blocked while ${provider.publicStatus}`);
      ensure(provider.readiness.blockedReasons.length > 0, `${provider.id} ${provider.publicStatus} state must explain blockedReasons`);
    }
    if (provider.publicStatus !== "Available") {
      ensure(provider.fallbackEligible === false, `${provider.id} must not be fallback eligible while unavailable`);
    }
    for (const envName of provider.expectedEnv || []) {
      ensure(!publicEnvPrefixes.some((prefix) => envName.startsWith(prefix)), `${provider.id} exposes frontend env prefix: ${envName}`);
    }
  }

  for (const liveFeature of registry.optionalForLiveFeatures || []) {
    ensure(typeof liveFeature.providerId === "string" && liveFeature.providerId.length > 0, "optional live feature providerId required");
    for (const envName of liveFeature.env || []) {
      ensure(!publicEnvPrefixes.some((prefix) => envName.startsWith(prefix)), `optional live feature exposes frontend env prefix: ${envName}`);
    }
  }

  ensureArrayIncludesAll(registry.securityInvariants, [
    "Core SEIS AI must start with zero cloud provider keys.",
    "Browser code must not receive model-provider secrets.",
    "Local-only mode must never fall back to a cloud provider.",
    "Fallback must be local-first when adequate, then owner-approved and visibly selected by capability, privacy, and cost.",
  ], "securityInvariants");
}

ensure(versionRegistry?.sourceOfTruth?.providerRegistry === paths.registry, "version registry must point to provider registry");
ensure(promotionGates?.sourceOfTruth?.providerRegistry === paths.registry, "promotion gates must point to provider registry");
ensure(pluginIntegration?.runtimeIntegration?.providerRegistryTool === "seis_ai_core_provider_status", "plugin integration must expose provider registry tool");
ensureArrayIncludesAll(pluginIntegration?.runtimeIntegration?.mcpResources, ["seis://ai/provider-registry.json"], "runtimeIntegration.mcpResources");
ensure(pluginIntegration?.fiveYearSubagentDevelopment?.providerRegistry === paths.registry, "five-year subagent development must point to provider registry");
ensureArrayIncludesAll(pluginIntegration?.qualityCommands, ["npm run check:seis-ai-core-provider-registry"], "pluginIntegration.qualityCommands");

if (mcpRuntimeContract) {
  ensure(mcpRuntimeContract.toolCount === 35, "MCP runtime contract must record 35 tools");
  ensure(mcpRuntimeContract.resourceCount === 33, "MCP runtime contract must record 33 resources");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI evaluation protocol"), "MCP runtime contract resource evidence must mention AGI evaluation protocol");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI public readiness evidence"), "MCP runtime contract resource evidence must mention AGI public readiness evidence");
}

for (const [text, label] of [
  [aiCoreDoc, "SEIS AI Core docs"],
  [modelRouterDoc, "model router docs"],
  [providerAudit, "provider audit docs"],
  [routingReport, "W64 routing report"],
]) {
  for (const token of [
    "seis-ai-core-provider-registry.json",
    "seis_ai_core_provider_status",
    "seis://ai/provider-registry.json",
  ]) {
    ensure(text.includes(token), `${label} missing ${token}`);
  }
}

for (const token of [
  "Adequate local provider",
  "Owner-selected provider",
  "Capability-compatible approved cloud provider",
  "SEIS Local Demo",
  "Provider calls: not claimed",
  "Live execution claim: none",
  "Model output used as evidence: none",
]) {
  ensure(routingReport.includes(token), `W64 routing report missing ${token}`);
}

for (const forbidden of [
  /session `[^`]+`/,
  /Visible selected model:/,
  /typed and submitted/,
  /BEGIN PRIVATE KEY/,
  /sk-[A-Za-z0-9_-]{16,}/,
]) {
  ensure(!forbidden.test(routingReport), `W64 routing report must not include ${forbidden}`);
}

for (const [text, label] of [
  [tools, "tool loop"],
  [mcp, "MCP server"],
]) {
  ensure(text.includes("AI_CORE_PROVIDER_STATUS_TOOL"), `${label} must expose AI_CORE_PROVIDER_STATUS_TOOL`);
  ensure(text.includes("aiCoreProviderStatus"), `${label} must reference aiCoreProviderStatus`);
}
ensure(helper.includes("AI_CORE_PROVIDER_STATUS_TOOL"), "helper must expose AI_CORE_PROVIDER_STATUS_TOOL");
ensure(helper.includes("aiCoreProviderStatus"), "helper must define aiCoreProviderStatus");
ensure(helper.includes("seis-ai-core-provider-registry.json"), "helper must reference provider registry path");
ensure(mcp.includes("seis://ai/provider-registry.json"), "MCP server must expose provider registry resource");

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-ai-core-provider-registry"] === "node scripts/check-seis-ai-core-provider-registry.mjs",
    "package.json must expose check:seis-ai-core-provider-registry"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-ai-core-provider-registry"),
    "quality:governance must include check:seis-ai-core-provider-registry"
  );
}

if (failures.length) {
  console.error("SEIS AI Core provider registry check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS AI Core provider registry check passed.");

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

function ensureArrayEquals(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = Array.isArray(candidate) ? candidate : [];
  ensure(values.length === required.length, `${label} length mismatch`);
  required.forEach((item, index) => {
    ensure(values[index] === item, `${label}[${index}] must be ${item}`);
  });
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
