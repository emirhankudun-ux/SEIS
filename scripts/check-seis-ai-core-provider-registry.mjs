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
  ensureArrayIncludesAll((registry.providers || []).map((provider) => provider.id), requiredProviders, "providers");
  ensureArrayIncludesAll(registry.fallbackOrder, ["local-demo", "feature-disabled"], "fallbackOrder");
  ensureArrayIncludesAll(registry.noKeyProviders, ["codex-operator", "seis-local-demo", "ollama-local"], "noKeyProviders");

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
    if (provider.publicStatus === "Missing Key" || provider.publicStatus === "Disabled") {
      ensure(provider.routingEligible === false, `${provider.id} must not route while ${provider.publicStatus}`);
      ensure(provider.enabled === false, `${provider.id} must not be enabled while ${provider.publicStatus}`);
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
  ], "securityInvariants");
}

ensure(versionRegistry?.sourceOfTruth?.providerRegistry === paths.registry, "version registry must point to provider registry");
ensure(promotionGates?.sourceOfTruth?.providerRegistry === paths.registry, "promotion gates must point to provider registry");
ensure(pluginIntegration?.runtimeIntegration?.providerRegistryTool === "seis_ai_core_provider_status", "plugin integration must expose provider registry tool");
ensureArrayIncludesAll(pluginIntegration?.runtimeIntegration?.mcpResources, [
  "seis://ai/provider-registry.json",
  "seis://ai/read-only-router-runtime.json",
], "runtimeIntegration.mcpResources");
ensure(pluginIntegration?.fiveYearSubagentDevelopment?.providerRegistry === paths.registry, "five-year subagent development must point to provider registry");
ensureArrayIncludesAll(pluginIntegration?.qualityCommands, ["npm run check:seis-ai-core-provider-registry"], "pluginIntegration.qualityCommands");

if (mcpRuntimeContract) {
  ensure(mcpRuntimeContract.toolCount === 37, "MCP runtime contract must record 37 tools");
  ensure(mcpRuntimeContract.resourceCount === 30, "MCP runtime contract must record 30 resources");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI evaluation protocol"), "MCP runtime contract resource evidence must mention AGI evaluation protocol");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI public readiness evidence"), "MCP runtime contract resource evidence must mention AGI public readiness evidence");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI GitHub user readiness gates"), "MCP runtime contract resource evidence must mention AGI GitHub user readiness gates");
}

for (const [text, label] of [
  [aiCoreDoc, "SEIS AI Core docs"],
  [modelRouterDoc, "model router docs"],
  [providerAudit, "provider audit docs"],
]) {
  for (const token of [
    "seis-ai-core-provider-registry.json",
    "seis_ai_core_provider_status",
    "seis://ai/provider-registry.json",
  ]) {
    ensure(text.includes(token), `${label} missing ${token}`);
  }
}

for (const [text, label] of [
  [tools, "tool loop"],
  [mcp, "MCP server"],
]) {
  ensure(text.includes("AI_CORE_PROVIDER_STATUS_TOOL"), `${label} must expose AI_CORE_PROVIDER_STATUS_TOOL`);
  ensure(text.includes("aiCoreProviderStatus"), `${label} must reference aiCoreProviderStatus`);
  ensure(text.includes("READ_ONLY_ROUTER_TOOL"), `${label} must expose READ_ONLY_ROUTER_TOOL`);
  ensure(text.includes("buildReadOnlyRouteDecision"), `${label} must reference buildReadOnlyRouteDecision`);
}
ensure(helper.includes("AI_CORE_PROVIDER_STATUS_TOOL"), "helper must expose AI_CORE_PROVIDER_STATUS_TOOL");
ensure(helper.includes("aiCoreProviderStatus"), "helper must define aiCoreProviderStatus");
ensure(helper.includes("seis-ai-core-provider-registry.json"), "helper must reference provider registry path");
ensure(mcp.includes("seis://ai/provider-registry.json"), "MCP server must expose provider registry resource");
ensure(mcp.includes("seis://ai/read-only-router-runtime.json"), "MCP server must expose read-only router resource");

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
