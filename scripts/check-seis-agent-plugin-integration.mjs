#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const root = process.cwd();
const failures = [];
const manifestPath = path.join(root, "content", "development", "seis-agent-plugin-integration.json");
const docsPath = path.join(root, "docs", "platform", "seis-agent-plugin-integration.md");
const packagePath = path.join(root, "package.json");
const gitignorePath = path.join(root, ".gitignore");
const toolsPath = path.join(root, "packages", "seis-ai", "src", "agent", "tools.mjs");
const loopPath = path.join(root, "packages", "seis-ai", "src", "agent", "loop.mjs");
const mcpPath = path.join(root, "packages", "seis-ai", "src", "mcp", "server.mjs");
const helperPath = path.join(root, "packages", "seis-ai", "src", "lib", "plugin-integration.mjs");
const pluginRegistryPath = path.join(root, "content", "development", "seis-ai-core-plugin-registry.json");
const personalPluginCoveragePath = path.join(root, "content", "development", "seis-ai-core-personal-plugin-coverage.json");
const appPluginSourcesPath = path.join(root, "apps", "seis-core", "data", "seis-core-plugin-sources.json");
const appPluginCatalogPath = path.join(root, "apps", "seis-core", "data", "seis-core-plugin-catalog.json");
const appPluginReadinessPath = path.join(root, "apps", "seis-core", "data", "seis-core-plugin-release-readiness.json");
const releaseTrainPath = path.join(root, "content", "development", "seis-core-plugin-release-train.json");
const appPluginCatalogScriptPath = path.join(root, "scripts", "create-seis-core-plugin-catalog.mjs");
const appPluginExpansionScriptPath = path.join(root, "scripts", "create-seis-core-plugin-expansion.mjs");
const appPluginCatalogRuntimePath = path.join(root, "plugins", "seis-core", "runtime", "plugin-catalog.mjs");
const appPluginAuditRuntimePath = path.join(root, "plugins", "seis-core", "runtime", "plugin-audit-runtime.mjs");
const appPluginAuditDefinitionsPath = path.join(root, "plugins", "seis-core", "runtime", "plugin-audit-definitions.mjs");
const appPluginCliPath = path.join(root, "plugins", "seis-core", "bin", "seis-core-plugins.mjs");
const appPluginChangeEvidenceScriptPath = path.join(root, "scripts", "create-seis-core-plugin-change-evidence.mjs");
const appPluginReadinessScriptPath = path.join(root, "scripts", "create-seis-core-plugin-release-readiness.mjs");
const pluginRegistryHelperPath = path.join(root, "packages", "seis-ai", "src", "lib", "plugin-registry.mjs");
const pluginSourceCheckPath = path.join(root, "scripts", "check-seis-ai-core-plugin-sources.mjs");
const installSmokePath = path.join(root, "scripts", "check-seis-public-plugin-install-smoke.mjs");
const lifecycleScriptPath = path.join(root, "scripts", "create-seis-public-plugin-lifecycle.mjs");
const freshTaskProofScriptPath = path.join(root, "scripts", "create-seis-public-plugin-fresh-task-proof.mjs");
const lifecyclePath = path.join(root, "content", "development", "seis-public-plugin-lifecycle.json");
const lifecycleReportPath = path.join(root, "reports", "seis-public-plugin-lifecycle.md");
const freshTaskProofPath = path.join(root, "content", "development", "seis-public-plugin-fresh-task-proof.json");
const freshTaskProofReportPath = path.join(root, "reports", "seis-public-plugin-fresh-task-proof.md");
const freshTaskReloadEvidenceScriptPath = path.join(root, "scripts", "capture-seis-public-plugin-fresh-task-reload-evidence.mjs");
const freshTaskReloadEvidencePath = path.join(root, "content", "development", "seis-public-plugin-fresh-task-reload-evidence.json");
const freshTaskReloadEvidenceReportPath = path.join(root, "reports", "seis-public-plugin-fresh-task-reload-evidence.md");
const securityProvenanceReviewScriptPath = path.join(root, "scripts", "create-seis-public-plugin-security-provenance-review.mjs");
const securityProvenanceReviewPath = path.join(root, "content", "development", "seis-public-plugin-security-provenance-review.json");
const securityProvenanceReviewReportPath = path.join(root, "reports", "seis-public-plugin-security-provenance-review.md");
const externalInstallProofScriptPath = path.join(root, "scripts", "create-seis-public-plugin-external-install-proof.mjs");
const externalInstallProofPath = path.join(root, "content", "development", "seis-public-plugin-external-install-proof.json");
const externalInstallProofReportPath = path.join(root, "reports", "seis-public-plugin-external-install-proof.md");
const canonicalizationScriptPath = path.join(root, "scripts", "create-seis-plugin-canonicalization.mjs");
const canonicalizationPath = path.join(root, "content", "development", "seis-plugin-canonicalization.json");
const canonicalizationReportPath = path.join(root, "reports", "seis-plugin-canonicalization.md");
const independentRunnerEvidenceContractScriptPath = path.join(root, "scripts", "create-seis-public-plugin-independent-runner-evidence-contract.mjs");
const independentRunnerEvidenceScriptPath = path.join(root, "scripts", "check-seis-public-plugin-independent-runner-evidence.mjs");
const independentRunnerEvidenceContractPath = path.join(root, "content", "development", "seis-public-plugin-independent-runner-evidence-contract.json");
const independentRunnerEvidenceContractReportPath = path.join(root, "reports", "seis-public-plugin-independent-runner-evidence-contract.md");
const unifiedSuiteScriptPath = path.join(root, "scripts", "create-seis-unified-plugin-suite.mjs");
const unifiedSuitePath = path.join(root, "plugins", "seis-ai-agent", "assets", "unified-suite.json");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const desktopScriptPath = path.join(root, "apps", "web", "desktop.js");
const serviceWorkerPath = path.join(root, "apps", "seis-demo-web", "service-worker.js");

const requiredPersonalPlugins = [
  "seis@personal",
  "seis-cloud@personal",
  "seis-code@personal",
  "seis-design@personal",
  "seis-data@personal"
];
const requiredPublicPlugins = ["seis-ai-agent@seis-repo"];
const requiredEmbeddedModules = [
  "seis-ai-agent",
  "seis",
  "seis-cloud",
  "seis-code",
  "seis-design",
  "seis-data",
  "seis-security",
  "seis-research",
  "seis-automation",
  "seis-product"
];
const requiredLanes = [
  "seis",
  "seis-governance",
  "seis-cloud",
  "seis-code",
  "seis-design",
  "seis-data",
  "seis-security",
  "seis-research",
  "seis-automation",
  "seis-product",
];
const requiredDirectLaneTools = [
  "seis_hub_status",
  "seis_hub_plan",
  "seis_cloud_status",
  "seis_cloud_plan",
  "seis_code_status",
  "seis_code_plan",
  "seis_design_status",
  "seis_design_plan",
  "seis_data_status",
  "seis_data_plan",
];

for (const [filePath, label] of [
  [manifestPath, "plugin integration manifest"],
  [docsPath, "plugin integration docs"],
  [packagePath, "package.json"],
  [gitignorePath, "repository gitignore"],
  [toolsPath, "SEIS AI tool loop"],
  [loopPath, "SEIS AI loop"],
  [mcpPath, "SEIS AI MCP server"],
  [helperPath, "SEIS AI plugin integration helper"],
  [pluginRegistryPath, "SEIS AI Core plugin registry"],
  [personalPluginCoveragePath, "SEIS AI personal plugin coverage"],
  [appPluginSourcesPath, "SEIS Command Center app plugin source manifest"],
  [appPluginCatalogPath, "SEIS Command Center app plugin catalog"],
  [appPluginReadinessPath, "SEIS Command Center app plugin release readiness"],
  [releaseTrainPath, "SEIS Command Center app plugin release train"],
  [appPluginCatalogScriptPath, "SEIS Core app plugin catalog generator"],
  [appPluginExpansionScriptPath, "SEIS Core app plugin expansion generator"],
  [appPluginCatalogRuntimePath, "SEIS Core app plugin catalog runtime"],
  [appPluginAuditRuntimePath, "SEIS Core app plugin audit runtime"],
  [appPluginAuditDefinitionsPath, "SEIS Core app plugin audit definitions"],
  [appPluginCliPath, "SEIS Core app plugin CLI"],
  [appPluginChangeEvidenceScriptPath, "SEIS Core app plugin change evidence generator"],
  [appPluginReadinessScriptPath, "SEIS Core app plugin release readiness generator"],
  [pluginRegistryHelperPath, "SEIS AI Core plugin registry helper"],
  [pluginSourceCheckPath, "SEIS AI Core plugin source checker"],
  [installSmokePath, "SEIS public plugin install smoke checker"],
  [lifecycleScriptPath, "SEIS public plugin lifecycle generator"],
  [freshTaskProofScriptPath, "SEIS public plugin fresh-task proof generator"],
  [freshTaskReloadEvidenceScriptPath, "SEIS public plugin fresh-task reload evidence capture"],
  [securityProvenanceReviewScriptPath, "SEIS public plugin security/provenance review generator"],
  [externalInstallProofScriptPath, "SEIS public plugin external install proof generator"],
  [canonicalizationScriptPath, "SEIS plugin canonicalization generator"],
  [canonicalizationPath, "SEIS plugin canonicalization contract"],
  [canonicalizationReportPath, "SEIS plugin canonicalization report"],
  [independentRunnerEvidenceContractScriptPath, "SEIS independent runner evidence contract generator"],
  [independentRunnerEvidenceScriptPath, "SEIS independent runner evidence checker"],
  [independentRunnerEvidenceContractPath, "SEIS independent runner evidence contract"],
  [independentRunnerEvidenceContractReportPath, "SEIS independent runner evidence contract report"],
  [unifiedSuiteScriptPath, "SEIS unified plugin suite generator"],
  [unifiedSuitePath, "SEIS unified plugin suite"],
  [lifecyclePath, "SEIS public plugin lifecycle contract"],
  [lifecycleReportPath, "SEIS public plugin lifecycle report"],
  [freshTaskProofPath, "SEIS public plugin fresh-task proof contract"],
  [freshTaskProofReportPath, "SEIS public plugin fresh-task proof report"],
  [freshTaskReloadEvidencePath, "SEIS public plugin fresh-task reload evidence contract"],
  [freshTaskReloadEvidenceReportPath, "SEIS public plugin fresh-task reload evidence report"],
  [securityProvenanceReviewPath, "SEIS public plugin security/provenance review contract"],
  [securityProvenanceReviewReportPath, "SEIS public plugin security/provenance review report"],
  [externalInstallProofPath, "SEIS public plugin external install proof contract"],
  [externalInstallProofReportPath, "SEIS public plugin external install proof report"],
  [webIndexPath, "SEIS demo index"],
  [webScriptPath, "SEIS demo script"],
  [desktopScriptPath, "SEIS desktop script"],
  [serviceWorkerPath, "SEIS demo service worker"]
]) {
  ensureFile(filePath, label);
}

const manifest = readJson(manifestPath, "plugin integration manifest");
const packageJson = readJson(packagePath, "package.json");
const gitignore = readText(gitignorePath, "repository gitignore");
const docs = readText(docsPath, "plugin integration docs");
const tools = readText(toolsPath, "SEIS AI tool loop");
const loop = readText(loopPath, "SEIS AI loop");
const mcp = readText(mcpPath, "SEIS AI MCP server");
const helper = readText(helperPath, "SEIS AI plugin integration helper");
const pluginRegistry = readJson(pluginRegistryPath, "SEIS AI Core plugin registry");
const personalPluginCoverage = readJson(personalPluginCoveragePath, "SEIS AI personal plugin coverage");
const appPluginSources = readJson(appPluginSourcesPath, "SEIS Command Center app plugin source manifest");
const appPluginCatalog = readJson(appPluginCatalogPath, "SEIS Command Center app plugin catalog");
const appPluginReadiness = readJson(appPluginReadinessPath, "SEIS Command Center app plugin release readiness");
const releaseTrain = readJson(releaseTrainPath, "SEIS Command Center app plugin release train");
const appRelease = releaseTrain?.currentRelease || {};
const appReleaseLabel = appRelease.label || null;
const appReleaseSemver = appRelease.semver || null;
const pluginRegistryHelper = readText(pluginRegistryHelperPath, "SEIS AI Core plugin registry helper");
const pluginSourceCheck = readText(pluginSourceCheckPath, "SEIS AI Core plugin source checker");
const appPluginCatalogScript = readText(appPluginCatalogScriptPath, "SEIS Core app plugin catalog generator");
const appPluginExpansionScript = readText(appPluginExpansionScriptPath, "SEIS Core app plugin expansion generator");
const appPluginAuditRuntime = readText(appPluginAuditRuntimePath, "SEIS Core app plugin audit runtime");
const appPluginAuditDefinitions = readText(appPluginAuditDefinitionsPath, "SEIS Core app plugin audit definitions");
const appPluginCatalogRuntime = readText(appPluginCatalogRuntimePath, "SEIS Core app plugin catalog runtime");
const appPluginCli = readText(appPluginCliPath, "SEIS Core app plugin CLI");
const appPluginChangeEvidenceScript = readText(appPluginChangeEvidenceScriptPath, "SEIS Core app plugin change evidence generator");
const appPluginReadinessScript = readText(appPluginReadinessScriptPath, "SEIS Core app plugin release readiness generator");
const webIndex = readText(webIndexPath, "SEIS demo index");
const webScript = readText(webScriptPath, "SEIS demo script");
const desktopScript = readText(desktopScriptPath, "SEIS desktop script");
const serviceWorker = readText(serviceWorkerPath, "SEIS demo service worker");

if (manifest) {
  ensure(manifest.id === "seis-agent-plugin-integration", "manifest id must be seis-agent-plugin-integration");
  ensure(manifest.status === "active", "manifest status must be active");
  ensure(manifest.primaryInstallId === "seis-ai-agent@seis-repo", "manifest must bind to seis-ai-agent@seis-repo");
  ensure(manifest.canonicalAgent?.publishedPlugin === "seis-ai-agent", "manifest must keep SEIS-Agent as the primary published plugin");
  ensure(manifest.canonicalAgent?.installMode === "single-public-plugin", "canonical agent install mode must be single-public-plugin");
  ensure(manifest.canonicalAgent?.standaloneLaneInstallMode === "source-module-only", "standalone lane install mode must retain source modules without public installs");
  ensure(manifest.canonicalAgent?.publicPluginContract === "content/development/seis-public-plugin-family.json", "canonical agent must point at the public plugin family contract");
  ensure(manifest.canonicalAgent?.unifiedSuite === "plugins/seis-ai-agent/assets/unified-suite.json", "canonical agent must point at the unified suite");
  ensure(manifest.canonicalAgent?.aiCorePluginRegistry === "content/development/seis-ai-core-plugin-registry.json", "canonical agent must point at the AI Core plugin registry");
  ensure(manifest.canonicalAgent?.applicationPluginSourceRoot === "plugins/seis-core", "canonical agent must expose the app-owned plugin source root");
  ensure(manifest.canonicalAgent?.applicationPluginManifest === "apps/seis-core/data/seis-core-plugin-sources.json", "canonical agent must expose the app plugin source manifest");
  ensure(manifest.canonicalAgent?.applicationPluginReleaseTrain === "content/development/seis-core-plugin-release-train.json", "canonical agent must expose the app plugin release train");
  ensure(manifest.canonicalAgent?.applicationPluginReleaseLabel === appReleaseLabel, "canonical agent app release label is stale");
  ensure(manifest.canonicalAgent?.applicationPluginReleaseSemver === appReleaseSemver, "canonical agent app release semver is stale");
  ensure(manifest.canonicalAgent?.applicationPluginReleaseMajor === appRelease.major, "canonical agent app release major is stale");
  ensure(manifest.canonicalAgent?.applicationPluginReleaseRevision === appRelease.revision, "canonical agent app release revision is stale");
  ensure(manifest.unifiedPluginSuite?.canonicalInstallId === "seis-ai-agent@seis-repo", "manifest unified suite must keep SEIS-Agent canonical");
  ensure(manifest.unifiedPluginSuite?.defaultInstallMode === "single-public-plugin", "manifest unified suite must use one public install");
  ensure(manifest.unifiedPluginSuite?.minimumComponentCount === 10, "manifest unified suite must set the current component minimum");
  ensure(manifest.unifiedPluginSuite?.futureSourcePluginPattern === "plugins/seis-*", "manifest unified suite must define future source discovery");
  ensure(manifest.unifiedPluginSuite?.futurePluginRule?.includes("unified-suite.json"), "manifest unified suite must route future plugins into the unified suite");
  ensure(manifest.unifiedPluginSuite?.legacyAliasCount === 5, "manifest unified suite must preserve five aliases");
  ensure(manifest.unifiedPluginSuite?.personalMarketplaceMutation === false, "manifest unified suite must not mutate the personal marketplace");
  ensure(manifest.unifiedPluginSuite?.aiCorePluginRegistry === "content/development/seis-ai-core-plugin-registry.json", "manifest unified suite must point at the AI Core plugin registry");
  ensure(manifest.unifiedPluginSuite?.aiCorePluginRegistryEntryCount === 5000, "manifest unified suite must expose the 5000-entry AI Core plugin registry target");
  ensure(manifest.unifiedPluginSuite?.applicationPluginSourceRoot === "plugins/seis-core", "manifest unified suite must expose the app-owned plugin source root");
  ensure(manifest.unifiedPluginSuite?.applicationPluginManifest === "apps/seis-core/data/seis-core-plugin-sources.json", "manifest unified suite must expose the app plugin source manifest");
  ensure(manifest.unifiedPluginSuite?.applicationPluginReleaseTrain === "content/development/seis-core-plugin-release-train.json", "manifest unified suite must expose the app plugin release train");
  ensure(manifest.unifiedPluginSuite?.applicationPluginReleaseLabel === appReleaseLabel, "manifest unified suite app release label is stale");
  ensure(manifest.unifiedPluginSuite?.applicationPluginReleaseSemver === appReleaseSemver, "manifest unified suite app release semver is stale");
  ensure(manifest.unifiedPluginSuite?.applicationPluginReleaseMajor === appRelease.major, "manifest unified suite app release major is stale");
  ensure(manifest.unifiedPluginSuite?.applicationPluginReleaseRevision === appRelease.revision, "manifest unified suite app release revision is stale");
  ensureArrayIncludesAll(manifest.canonicalAgent?.publishedPluginFamily, requiredPublicPlugins.map((id) => id.replace("@seis-repo", "")), "canonicalAgent.publishedPluginFamily");
  ensure(manifest.canonicalAgent?.publishedPluginFamily?.length === 1, "canonicalAgent.publishedPluginFamily must contain only SEIS-Agent");
  ensure(manifest.auditedSnapshot?.installedEnabledCount === 185, "manifest must record the 2026-06-19 installed-enabled count");
  ensure(manifest.auditedSnapshot?.notInstalledCount === 5, "manifest must record the 2026-06-19 not-installed count");
  ensure(manifest.auditedSnapshot?.authenticationClaim === "not-claimed", "manifest must not claim connector authentication readiness");
  ensureArrayIncludesAll(manifest.auditedSnapshot?.personalPluginsInstalledEnabled, requiredPersonalPlugins, "auditedSnapshot.personalPluginsInstalledEnabled");
  ensureArrayIncludesAll((manifest.publicPlugins || []).map((plugin) => plugin.id), requiredPublicPlugins, "publicPlugins");
  ensure((manifest.publicPlugins || []).length === 1, "publicPlugins must contain only SEIS-Agent");
  ensureArrayIncludesAll((manifest.embeddedModules || []).map((module) => module.id), requiredEmbeddedModules, "embeddedModules");
  ensure((manifest.embeddedModules || []).length === requiredEmbeddedModules.length, "embeddedModules must cover each current SEIS module exactly once");
  ensure((manifest.embeddedModules || []).every((module) => module.canonicalInstallId === "seis-ai-agent@seis-repo"), "embeddedModules must resolve to SEIS-Agent");
  ensureArrayIncludesAll((manifest.personalPlugins || []).map((plugin) => plugin.id), requiredPersonalPlugins, "personalPlugins");
  ensureArrayIncludesAll((manifest.lanes || []).map((lane) => lane.id), requiredLanes, "lanes");
  ensure(manifest.helperPluginUniverse?.uniquePlugins === 300, "helper plugin universe must keep the requested unique plugin count");
  ensure(manifest.helperPluginUniverse?.canonicalSeisAiCoreRegistry === "content/development/seis-ai-core-plugin-registry.json", "helper plugin universe must point at the canonical SEIS AI Core plugin registry");
  ensure(manifest.helperPluginUniverse?.canonicalSeisAiCorePluginCount === 5000, "helper plugin universe must expose the 5000-entry SEIS AI Core plugin registry");
  ensure(manifest.helperPluginUniverse?.personalPluginCoverage === "content/development/seis-ai-core-personal-plugin-coverage.json", "helper plugin universe must expose personal plugin coverage");
  ensure(manifest.helperPluginUniverse?.personalPluginCount === 55, "helper plugin universe must expose 55 personal plugins");
  ensure(manifest.helperPluginUniverse?.applicationPluginSourceRoot === "plugins/seis-core", "helper plugin universe must expose the app-owned source root");
  ensure(manifest.helperPluginUniverse?.applicationPluginReleaseTrain === "content/development/seis-core-plugin-release-train.json", "helper plugin universe must expose the app plugin release train");
  ensure(manifest.helperPluginUniverse?.applicationPluginReleaseLabel === appReleaseLabel, "helper plugin universe app release label is stale");
  ensure(manifest.helperPluginUniverse?.applicationPluginReleaseSemver === appReleaseSemver, "helper plugin universe app release semver is stale");
  ensure(manifest.helperPluginUniverse?.applicationPluginReleaseMajor === appRelease.major, "helper plugin universe app release major is stale");
  ensure(manifest.helperPluginUniverse?.applicationPluginReleaseRevision === appRelease.revision, "helper plugin universe app release revision is stale");
  ensure(manifest.helperPluginUniverse?.applicationOwnedPluginCount === APP_PLUGIN_EXPANSION_TARGET, "helper plugin universe app-owned count is stale");
  ensure(manifest.runtimeIntegration?.toolLoopTool === "seis_plugin_integration", "runtimeIntegration must expose the tool-loop tool");
  ensure(manifest.runtimeIntegration?.publicPluginFamilyTool === "seis_public_plugin_family", "runtimeIntegration must expose the public plugin family tool-loop tool");
  ensure(manifest.runtimeIntegration?.providerRegistryTool === "seis_ai_core_provider_status", "runtimeIntegration must expose the SEIS AI Core provider status tool");
  ensure(manifest.runtimeIntegration?.modelScalingTool === "seis_ai_core_model_scaling_status", "runtimeIntegration must expose the SEIS AI Core model scaling status tool");
  ensure(manifest.runtimeIntegration?.versionRegistryTool === "seis_ai_core_version_status", "runtimeIntegration must expose the SEIS AI Core version status tool");
  ensure(
    manifest.runtimeIntegration?.versionPromotionTool === "seis_ai_core_version_promotion_dry_run",
    "runtimeIntegration must expose the SEIS AI Core version promotion dry-run tool"
  );
  ensure(manifest.runtimeIntegration?.subagentOperatingModelTool === "seis_ai_core_subagent_model", "runtimeIntegration must expose the SEIS AI Core sub-agent model tool");
  ensure(manifest.runtimeIntegration?.mcpTool === "seis_plugin_integration", "runtimeIntegration must expose the MCP tool");
  ensure(manifest.runtimeIntegration?.mcpPublicPluginFamilyTool === "seis_public_plugin_family", "runtimeIntegration must expose the public plugin family MCP tool");
  ensure(manifest.runtimeIntegration?.mcpResource === "seis://agent/plugin-integration.json", "runtimeIntegration must expose the MCP resource");
  ensure(manifest.runtimeIntegration?.mcpPublicPluginFamilyResource === "seis://agent/public-plugin-family.json", "runtimeIntegration must expose the public plugin family MCP resource");
  ensure(manifest.runtimeIntegration?.mcpPublicPluginLifecycleResource === "seis://agent/public-plugin-lifecycle.json", "runtimeIntegration must expose the public plugin lifecycle MCP resource");
  ensure(manifest.runtimeIntegration?.unifiedSuite === "plugins/seis-ai-agent/assets/unified-suite.json", "runtimeIntegration must expose the unified suite");
  ensure(manifest.runtimeIntegration?.pluginRegistryPath === "content/development/seis-ai-core-plugin-registry.json", "runtimeIntegration must expose the plugin registry path");
  ensure(manifest.runtimeIntegration?.pluginRegistryTool === "seis_ai_core_plugin_registry_status", "runtimeIntegration must expose the plugin registry tool");
  ensure(manifest.runtimeIntegration?.pluginRegistryResource === "seis://ai/plugin-registry.json", "runtimeIntegration must expose the plugin registry resource");
  ensure(manifest.runtimeIntegration?.applicationPluginSourceRoot === "plugins/seis-core", "runtimeIntegration must expose the app-owned plugin source root");
  ensure(manifest.runtimeIntegration?.applicationPluginManifest === "apps/seis-core/data/seis-core-plugin-sources.json", "runtimeIntegration must expose the app plugin source manifest");
  ensure(manifest.runtimeIntegration?.applicationPluginReleaseTrain === "content/development/seis-core-plugin-release-train.json", "runtimeIntegration must expose the app plugin release train");
  ensure(manifest.runtimeIntegration?.applicationPluginReleaseLabel === appReleaseLabel, "runtimeIntegration app release label is stale");
  ensure(manifest.runtimeIntegration?.applicationPluginReleaseSemver === appReleaseSemver, "runtimeIntegration app release semver is stale");
  ensure(manifest.runtimeIntegration?.applicationPluginReleaseMajor === appRelease.major, "runtimeIntegration app release major is stale");
  ensure(manifest.runtimeIntegration?.applicationPluginReleaseRevision === appRelease.revision, "runtimeIntegration app release revision is stale");
  ensureArrayIncludesAll(manifest.runtimeIntegration?.mcpResources, [
    "seis://agent/plugin-integration.json",
    "seis://agent/public-plugin-family.json",
    "seis://agent/public-plugin-lifecycle.json",
    "seis://ai/plugin-registry.json",
    "seis://ai/version-registry.json",
    "seis://ai/provider-registry.json",
    "seis://ai/model-scaling-hardware-profile.json",
    "seis://ai/model-parameter-ladder.json",
    "seis://ai/model-frontier-escalation-policy.json",
    "seis://ai/150b-frontier-model-program.json",
    "seis://ai/512b-apex-model-program.json",
    "seis://ai/agi-evaluation-protocol.json",
    "seis://ai/agi-public-readiness-evidence.json",
    "seis://ai/agi-github-user-readiness-gates.json",
    "seis://ai/20b-model-card-template.json",
    "seis://ai/20b-dataset-card-template.json",
    "seis://ai/version-promotion-gates.json",
    "seis://ai/subagent-operating-model.json",
    "seis://ai/sub-agent-5-year-plan.json",
    "seis://ai/sub-agent-5-year-plan-view.json",
    "seis://ai/agent-role-schema.json",
    "seis://ai/agent-permission-matrix.json",
    "seis://ai/dry-run-task-queue.json",
    "seis://ai/cancellation-fixture.json",
    "seis://ai/approval-fixture.json",
    "seis://ai/redaction-fixture.json",
    "seis://ai/execution-ledger-fixture.json",
    "seis://ai/subagent-runtime-fixtures.json",
    "seis://ai/subagent-review-ledger.json"
  ], "runtimeIntegration.mcpResources");
  ensure(manifest.applicationIntegration?.surface === "apps/seis-core", "application integration must target the SEIS Command Center app");
  ensure(manifest.applicationIntegration?.panel === "Plugins & Extensions", "application integration must expose the app plugin panel");
  ensure(manifest.applicationIntegration?.pluginReleaseTrain === "content/development/seis-core-plugin-release-train.json", "application integration must expose the app plugin release train");
  ensure(manifest.applicationIntegration?.pluginReleaseLabel === appReleaseLabel, "application integration app release label is stale");
  ensure(manifest.applicationIntegration?.pluginReleaseSemver === appReleaseSemver, "application integration app release semver is stale");
  ensure(manifest.applicationIntegration?.pluginReleaseMajor === appRelease.major, "application integration app release major is stale");
  ensure(manifest.applicationIntegration?.pluginReleaseRevision === appRelease.revision, "application integration app release revision is stale");
  ensureArrayIncludesAll(
    manifest.runtimeIntegration?.directPersonalLaneTools,
    requiredDirectLaneTools,
    "runtimeIntegration.directPersonalLaneTools"
  );
  ensure(
    manifest.fiveYearSubagentDevelopment?.currentRuntimeBoundary === "status-and-plan-only",
    "fiveYearSubagentDevelopment must keep the current runtime boundary status-and-plan-only"
  );
  ensure(manifest.lifecycle?.contract === "content/development/seis-public-plugin-lifecycle.json", "manifest must point at public plugin lifecycle contract");
  ensure(manifest.lifecycle?.qualityGate === "npm run check:seis-public-plugin-lifecycle", "manifest must expose public plugin lifecycle quality gate");
  ensure(manifest.lifecycle?.freshTaskProofContract === "content/development/seis-public-plugin-fresh-task-proof.json", "manifest must point at public plugin fresh-task proof contract");
  ensure(manifest.lifecycle?.freshTaskProofGate === "npm run check:seis-public-plugin-fresh-task-proof", "manifest must expose public plugin fresh-task proof gate");
  ensure(manifest.lifecycle?.freshTaskReloadEvidence === "content/development/seis-public-plugin-fresh-task-reload-evidence.json", "manifest must point at public plugin fresh-task reload evidence");
  ensure(manifest.lifecycle?.freshTaskReloadEvidenceGate === "npm run check:seis-public-plugin-fresh-task-reload-evidence", "manifest must expose public plugin fresh-task reload evidence gate");
  ensure(manifest.lifecycle?.securityProvenanceReview === "content/development/seis-public-plugin-security-provenance-review.json", "manifest must point at public plugin security/provenance review");
  ensure(manifest.lifecycle?.securityProvenanceReviewGate === "npm run check:seis-public-plugin-security-provenance-review", "manifest must expose public plugin security/provenance review gate");
  ensure(manifest.lifecycle?.externalInstallProof === "content/development/seis-public-plugin-external-install-proof.json", "manifest must point at public plugin external install proof");
  ensure(manifest.lifecycle?.externalInstallProofGate === "npm run check:seis-public-plugin-external-install-proof", "manifest must expose public plugin external install proof gate");
  ensure(manifest.lifecycle?.canonicalizationContract === "content/development/seis-plugin-canonicalization.json", "manifest must expose canonicalization contract");
  ensure(manifest.lifecycle?.canonicalizationGate === "npm run check:seis-plugin-canonicalization", "manifest must expose canonicalization gate");
  ensure(manifest.lifecycle?.independentRunnerEvidenceContract === "content/development/seis-public-plugin-independent-runner-evidence-contract.json", "manifest must expose independent runner evidence contract");
  ensure(manifest.lifecycle?.independentRunnerEvidenceRecordedGate === "npm run check:seis-public-plugin-independent-runner-evidence:recorded", "manifest must expose strict independent runner gate");
  ensure(manifest.lifecycle?.publicReleaseBoundary === "canonicalization_fresh_task_reload_security_provenance_strict_independent_install_and_human_approval_required", "manifest must preserve the strict independent installation release boundary");
  ensureFile(
    path.join(root, manifest.fiveYearSubagentDevelopment?.providerRegistry || ""),
    "five-year SEIS AI Core provider registry"
  );
  ensureFile(
    path.join(root, manifest.fiveYearSubagentDevelopment?.versionRegistry || ""),
    "five-year SEIS AI Core version registry"
  );
  ensureFile(
    path.join(root, manifest.fiveYearSubagentDevelopment?.operatingModel || ""),
    "five-year sub-agent operating model"
  );
  ensureFile(
    path.join(root, manifest.fiveYearSubagentDevelopment?.laneStatusContract || ""),
    "five-year lane status contract"
  );
  for (const [key, label] of [
    ["roleSchema", "five-year role schema fixture"],
    ["permissionMatrix", "five-year permission matrix fixture"],
    ["dryRunTaskQueue", "five-year dry-run task queue fixture"],
    ["cancellationFixture", "five-year cancellation fixture"],
    ["approvalFixture", "five-year approval fixture"],
    ["redactionFixture", "five-year redaction fixture"],
    ["executionLedgerFixture", "five-year execution ledger fixture"],
    ["runtimeFixtures", "five-year consolidated runtime fixture pack"],
    ["reviewLedger", "five-year quarterly review ledger"],
    ["versionRegistry", "five-year version registry"],
    ["versionPromotionGates", "five-year version promotion gates"],
    ["longHorizonPlanView", "five-year generated sub-agent plan view"],
  ]) {
    ensureFile(path.join(root, manifest.fiveYearSubagentDevelopment?.[key] || ""), label);
  }
  ensureArrayIncludesAll(manifest.qualityCommands, [
    "npm run check:seis-ai-core-plugin-registry",
    "npm run check:seis-ai-personal-plugin-coverage",
    "npm run check:seis-core-plugin-sources",
    "npm run check:seis-core-plugin-release",
    "npm run check:seis-core-plugin-release-policy",
    "npm run check:seis-core-plugin-catalog",
    "npm run check:seis-core-plugin-expansion",
    "npm run check:seis-core-plugin-release-readiness",
    "npm run check:seis-core-plugin-change-evidence",
    "npm run check:seis-core-plugin-matrix",
    "npm run check:seis-ai-core-plugin-sources",
    "npm run check:seis-agent-plugin-integration",
    "npm run check:seis-public-plugin-lifecycle",
    "npm run check:seis-public-plugin-family",
    "npm run check:seis-public-plugin-fresh-task-proof",
    "npm run check:seis-public-plugin-fresh-task-reload-evidence",
    "npm run check:seis-public-plugin-security-provenance-review",
    "npm run check:seis-public-plugin-external-install-proof",
    "npm run check:seis-plugin-canonicalization",
    "npm run check:seis-unified-plugin-suite",
    "npm run check:seis-public-plugin-independent-runner-evidence-contract",
    "npm run check:seis-public-plugin-independent-runner-evidence",
    "npm run check:seis-public-plugin-install-smoke",
    "npm run check:seis-public-plugin-install-smoke:mcp",
    "npm run check:seis-ai-core-provider-registry",
    "npm run check:seis-model-scaling-hardware-profile",
    "npm run check:seis-model-parameter-ladder",
    "npm run check:seis-150b-frontier-model-program",
    "npm run check:seis-512b-apex-model-program",
    "node scripts/check-seis-agi-evaluation-protocol.mjs",
    "npm run check:seis-ai-core-version-registry",
    "npm run check:seis-ai-core-version-promotion-gates",
    "npm run check:seis-ai-core-subagent-operating-model",
    "npm run check:seis-ai-core-subagent-runtime-fixtures",
    "npm run check:seis-ai-core-subagent-review-ledger",
    "npm run check:seis-ai-agent",
    "npm run check:seis-specialist-plugins",
    "npm test --prefix packages/seis-ai"
  ], "qualityCommands");

  ensure(pluginRegistry?.id === "seis-ai-core-plugin-registry", "AI Core plugin registry id must be stable");
  ensure(pluginRegistry?.goalId === "SEIS-GOAL-021", "AI Core plugin registry must bind to SEIS-GOAL-021");
  ensure(pluginRegistry?.target?.registryEntryCount === 5000, "AI Core plugin registry must contain exactly 5000 entries");
  ensure(pluginRegistry?.target?.appOwnedPluginCount === APP_PLUGIN_EXPANSION_TARGET, "AI Core plugin registry app-owned count is stale");
  ensure(pluginRegistry?.applicationRelease?.releaseTrainPath === "content/development/seis-core-plugin-release-train.json", "AI Core plugin registry must expose the app plugin release train");
  ensure(pluginRegistry?.applicationRelease?.label === appReleaseLabel, "AI Core plugin registry app release label is stale");
  ensure(pluginRegistry?.applicationRelease?.semver === appReleaseSemver, "AI Core plugin registry app release semver is stale");
  ensure(pluginRegistry?.applicationRelease?.major === appRelease.major, "AI Core plugin registry app release major is stale");
  ensure(pluginRegistry?.applicationRelease?.revision === appRelease.revision, "AI Core plugin registry app release revision is stale");
  ensure(pluginRegistry?.target?.appReleaseLabel === appReleaseLabel, "AI Core plugin registry target app release label is stale");
  ensure(pluginRegistry?.target?.appReleaseSemver === appReleaseSemver, "AI Core plugin registry target app release semver is stale");
  ensure(pluginRegistry?.target?.appReleaseMajor === appRelease.major, "AI Core plugin registry target app release major is stale");
  ensure(pluginRegistry?.target?.appReleaseRevision === appRelease.revision, "AI Core plugin registry target app release revision is stale");
  ensure(pluginRegistry?.canonicalOwnership?.applicationPluginSourceRoot === "plugins/seis-core", "AI Core plugin registry must point at the app-owned plugin source root");
  ensure(pluginRegistry?.canonicalOwnership?.applicationPluginManifest === "apps/seis-core/data/seis-core-plugin-sources.json", "AI Core plugin registry must point at the app plugin source manifest");
  ensure(pluginRegistry?.target?.personalPluginCount === 55 && pluginRegistry?.target?.personalRepoCounterpartCount === 55, "AI Core plugin registry must record complete personal plugin coverage");
  ensure(pluginRegistry?.canonicalOwnership?.personalPluginCoverage === "content/development/seis-ai-core-personal-plugin-coverage.json", "AI Core plugin registry must point at personal plugin coverage");
  ensure(personalPluginCoverage?.personalMarketplace?.pluginCount === 55, "personal plugin coverage must include 55 marketplace plugins");
  ensure(personalPluginCoverage?.repository?.counterpartCount === 55, "personal plugin coverage must include 55 repository counterparts");
  ensure(personalPluginCoverage?.repository?.migratedCount === 50, "personal plugin coverage must include 50 migrated packages");
  ensure(personalPluginCoverage?.repository?.applicationOwnedCount === APP_PLUGIN_EXPANSION_TARGET, "personal plugin coverage app-owned count is stale");
  ensure(personalPluginCoverage?.repository?.applicationSourceRoot === "plugins/seis-core", "personal plugin coverage must point at the app-owned source root");
  ensure(personalPluginCoverage?.repository?.missingRepoCounterparts?.length === 0, "personal plugin coverage must have no missing repository counterparts");
  ensure(appPluginSources?.owner === "apps/seis-core", "app plugin source manifest must be owned by apps/seis-core");
  ensure(appPluginSources?.pluginCount === APP_PLUGIN_EXPANSION_TARGET, "app plugin source manifest count is stale");
  ensure(appPluginSources?.releaseTrainPath === "content/development/seis-core-plugin-release-train.json", "app plugin source manifest must expose the release train");
  ensure(appPluginSources?.releaseTrainVersion === appReleaseLabel, "app plugin source manifest release label is stale");
  ensure(appPluginSources?.releaseSemver === appReleaseSemver, "app plugin source manifest release semver is stale");
  ensure(appPluginSources?.releaseMajor === appRelease.major, "app plugin source manifest release major is stale");
  ensure(appPluginSources?.releaseRevision === appRelease.revision, "app plugin source manifest release revision is stale");
  ensure(appPluginCatalog?.id === "seis-core-application-plugin-catalog", "app plugin catalog id must be stable");
  ensure(appPluginCatalog?.sourceRoot === "plugins/seis-core", "app plugin catalog source root is invalid");
  ensure(appPluginCatalog?.counts?.discovered === APP_PLUGIN_EXPANSION_TARGET, "app plugin catalog discovered count is stale");
  ensure(appPluginCatalog?.plugins?.length === APP_PLUGIN_EXPANSION_TARGET, "app plugin catalog length is stale");
  ensure(appPluginCatalog?.release?.label === appReleaseLabel, "app plugin catalog release label is stale");
  ensure(appPluginCatalog?.policy?.sourceMutation === false, "app plugin catalog must not mutate source");
  ensure(appPluginCatalog?.policy?.executableAction === "status-only", "app plugin catalog executable action must be status-only");
  ensure(appPluginCatalog?.counts?.statusReady === APP_PLUGIN_EXPANSION_TARGET, "app plugin catalog status-ready count is stale");
  ensure(appPluginReadiness?.id === "seis-core-plugin-release-readiness", "app plugin release readiness id must be stable");
  ensure(appPluginReadiness?.currentRelease?.label === appReleaseLabel, "app plugin release readiness current label is stale");
  ensure(appPluginReadiness?.next?.largeCode?.label, "app plugin release readiness must expose the next large-code label");
  ensure(appPluginReadiness?.policy?.largeCodeChangeRequiresEvidence === true, "app plugin release readiness must require large-code evidence");
  ensure(packageJson.scripts?.["check:seis-core-plugin-catalog"] === "node scripts/create-seis-core-plugin-catalog.mjs --check", "package scripts must expose the app plugin catalog check");
  ensure(packageJson.scripts?.["seis:core:plugins"] === "node plugins/seis-core/bin/seis-core-plugins.mjs", "package scripts must expose the app plugin CLI");
  ensure(gitignore.includes("!apps/seis-core/data/seis-core-plugin-catalog.json"), "repository gitignore must track the app plugin catalog");
  ensure(releaseTrain?.currentRelease?.label === appReleaseLabel, "app plugin release train current label is invalid");
  ensure(releaseTrain?.currentRelease?.semver === appReleaseSemver, "app plugin release train current semver is invalid");
  ensure(gitignore.includes("!plugins/seis-core/**/.codex-plugin/*.json"), "repository gitignore must track app plugin manifests");
  ensure(gitignore.includes("!plugins/seis-core/**/assets/**/*.json"), "repository gitignore must track app plugin profile metadata");
  const corePluginRoot = path.join(root, "packages", "seis-ai", "plugins");
  ensure(!fs.existsSync(corePluginRoot) || !Array.from(fs.readdirSync(corePluginRoot, { withFileTypes: true })).some((entry) => entry.isDirectory()), "AI Core must not own personal plugin source directories");
  ensure(pluginSourceCheck.includes("--status"), "AI Core plugin source checker must execute bounded status validation");
  ensure(appPluginCatalogScript.includes("buildApplicationPluginCatalog"), "app plugin catalog generator must use the app runtime catalog");
  ensure(appPluginExpansionScript.includes("APP_PLUGIN_EXPANSION_TARGET"), "app plugin expansion generator must declare the expansion target");
  ensure(appPluginAuditRuntime.includes("runAudit"), "app plugin audit runtime must expose bounded reports");
  ensure(appPluginAuditRuntime.includes("permissions: { write: [], network: [], secrets: [] }"), "app plugin audit runtime must keep permissions empty");
  ensure(appPluginAuditDefinitions.includes("seis-prompt-injection-audit"), "app plugin audit definitions must include the prompt safety plugin");
  ensure(appPluginChangeEvidenceScript.includes("SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_THRESHOLD"), "change evidence generator must declare the code threshold");
  ensure(appPluginReadinessScript.includes("collectSeisCorePluginChangeEvidence"), "release readiness generator must use code evidence");
  ensure(appPluginCatalogRuntime.includes("APP_PLUGIN_ALLOWED_INSPECTION_ACTIONS"), "app plugin catalog runtime must declare bounded inspection actions");
  ensure(appPluginCatalogRuntime.includes("approval-required"), "app plugin catalog runtime must expose approval-required plans");
  ensure(appPluginCli.includes("activation-plan"), "app plugin CLI must expose activation plans");
  ensure(pluginRegistryHelper.includes("AI_CORE_PLUGIN_REGISTRY_STATUS_TOOL"), "AI Core plugin registry helper must expose the status tool constant");
  ensure(
    tools.includes("AI_CORE_PLUGIN_REGISTRY_STATUS_TOOL") || tools.includes("seis_ai_core_plugin_registry_status"),
    "SEIS AI tool loop must expose the plugin registry status tool"
  );
  ensure(
    mcp.includes("AI_CORE_PLUGIN_REGISTRY_STATUS_TOOL") || mcp.includes("seis_ai_core_plugin_registry_status"),
    "SEIS AI MCP server must expose the plugin registry status tool"
  );

  for (const plugin of manifest.publicPlugins || []) {
    ensureFile(path.join(root, plugin.sourceMirror || ""), `${plugin.id} source mirror`);
    if (plugin.embeddedSkill) {
      ensureFile(path.join(root, plugin.embeddedSkill), `${plugin.id} embedded skill`);
    }
  }

  for (const module of manifest.embeddedModules || []) {
    ensureFile(path.join(root, module.sourceMirror || ""), `${module.id} source module`);
  }

  for (const plugin of manifest.personalPlugins || []) {
    ensureFile(path.join(root, plugin.sourceMirror || ""), `${plugin.id} source mirror`);
    ensureFile(path.join(root, plugin.embeddedSkill || ""), `${plugin.id} embedded skill`);
  }

  for (const lane of manifest.lanes || []) {
    ensureFile(path.join(root, lane.embeddedSkill || ""), `${lane.id} embedded skill`);
    ensure(Array.isArray(lane.mcpTools) && lane.mcpTools.length >= 2, `${lane.id} must expose MCP tools`);
  }
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-ai-core-plugin-registry"] === "node scripts/create-seis-ai-core-plugin-registry.mjs --check",
    "package.json must expose check:seis-ai-core-plugin-registry"
  );
  ensure(
    packageJson.scripts?.["check:seis-ai-personal-plugin-coverage"] === "node scripts/create-seis-ai-personal-plugin-coverage.mjs --check",
    "package.json must expose check:seis-ai-personal-plugin-coverage"
  );
  ensure(
    packageJson.scripts?.["check:seis-core-plugin-sources"] === "node scripts/check-seis-ai-core-plugin-sources.mjs && node scripts/create-seis-core-plugin-sources.mjs --check",
    "package.json must expose check:seis-core-plugin-sources"
  );
  ensure(
    packageJson.scripts?.["check:seis-ai-core-plugin-sources"] === "node scripts/check-seis-ai-core-plugin-sources.mjs",
    "package.json must expose check:seis-ai-core-plugin-sources"
  );
  ensure(
    packageJson.scripts?.["check:seis-agent-plugin-integration"] === "node scripts/check-seis-agent-plugin-integration.mjs",
    "package.json must expose check:seis-agent-plugin-integration"
  );
  ensure(
    packageJson.scripts?.["check:seis-public-plugin-lifecycle"] === "node scripts/create-seis-public-plugin-lifecycle.mjs --check",
    "package.json must expose check:seis-public-plugin-lifecycle"
  );
  ensure(
    packageJson.scripts?.["check:seis-public-plugin-fresh-task-proof"] === "node scripts/create-seis-public-plugin-fresh-task-proof.mjs --check",
    "package.json must expose check:seis-public-plugin-fresh-task-proof"
  );
  ensure(
    packageJson.scripts?.["check:seis-public-plugin-fresh-task-reload-evidence"] === "node scripts/capture-seis-public-plugin-fresh-task-reload-evidence.mjs --check",
    "package.json must expose check:seis-public-plugin-fresh-task-reload-evidence"
  );
  ensure(
    packageJson.scripts?.["check:seis-public-plugin-security-provenance-review"] === "node scripts/create-seis-public-plugin-security-provenance-review.mjs --check",
    "package.json must expose check:seis-public-plugin-security-provenance-review"
  );
  ensure(
    packageJson.scripts?.["check:seis-public-plugin-external-install-proof"] === "node scripts/create-seis-public-plugin-external-install-proof.mjs --check",
    "package.json must expose check:seis-public-plugin-external-install-proof"
  );
  ensure(
    packageJson.scripts?.["check:seis-plugin-canonicalization"] === "node scripts/create-seis-plugin-canonicalization.mjs --check",
    "package.json must expose check:seis-plugin-canonicalization"
  );
  ensure(
    packageJson.scripts?.["check:seis-unified-plugin-suite"] === "node scripts/create-seis-unified-plugin-suite.mjs --check",
    "package.json must expose check:seis-unified-plugin-suite"
  );
  ensure(
    packageJson.scripts?.["check:seis-public-plugin-independent-runner-evidence-contract"] === "node scripts/create-seis-public-plugin-independent-runner-evidence-contract.mjs --check",
    "package.json must expose check:seis-public-plugin-independent-runner-evidence-contract"
  );
  ensure(
    packageJson.scripts?.["automation:seis-public-plugin-lifecycle"] === "node scripts/create-seis-public-plugin-lifecycle.mjs",
    "package.json must expose automation:seis-public-plugin-lifecycle"
  );
  ensure(
    packageJson.scripts?.["automation:seis-public-plugin-fresh-task-proof"] === "node scripts/create-seis-public-plugin-fresh-task-proof.mjs",
    "package.json must expose automation:seis-public-plugin-fresh-task-proof"
  );
  ensure(
    packageJson.scripts?.["automation:seis-public-plugin-fresh-task-reload-evidence"] === "node scripts/capture-seis-public-plugin-fresh-task-reload-evidence.mjs",
    "package.json must expose automation:seis-public-plugin-fresh-task-reload-evidence"
  );
  ensure(
    packageJson.scripts?.["automation:seis-public-plugin-security-provenance-review"] === "node scripts/create-seis-public-plugin-security-provenance-review.mjs",
    "package.json must expose automation:seis-public-plugin-security-provenance-review"
  );
  ensure(
    packageJson.scripts?.["automation:seis-public-plugin-external-install-proof"] === "node scripts/create-seis-public-plugin-external-install-proof.mjs",
    "package.json must expose automation:seis-public-plugin-external-install-proof"
  );
  ensure(
    packageJson.scripts?.["automation:seis-unified-plugin-suite"] === "node scripts/create-seis-unified-plugin-suite.mjs",
    "package.json must expose automation:seis-unified-plugin-suite"
  );
  ensure(
    packageJson.scripts?.["check:seis-public-plugin-install-smoke"] === "node scripts/check-seis-public-plugin-install-smoke.mjs",
    "package.json must expose check:seis-public-plugin-install-smoke"
  );
  ensure(
    packageJson.scripts?.["check:seis-public-plugin-install-smoke:local"] === "node scripts/check-seis-public-plugin-install-smoke.mjs --require-installed",
    "package.json must expose check:seis-public-plugin-install-smoke:local"
  );
  ensure(
    packageJson.scripts?.["check:seis-public-plugin-install-smoke:mcp"] === "node scripts/check-seis-public-plugin-install-smoke.mjs --mcp-smoke",
    "package.json must expose check:seis-public-plugin-install-smoke:mcp"
  );
  ensure(
    packageJson.scripts?.["check:seis-public-plugin-install-smoke:local:mcp"] === "node scripts/check-seis-public-plugin-install-smoke.mjs --require-installed --mcp-smoke",
    "package.json must expose check:seis-public-plugin-install-smoke:local:mcp"
  );
}

for (const [text, label] of [
  [docs, "docs"],
  [loop, "agent loop"]
]) {
  ensure(text.includes("seis_plugin_integration"), `${label} must reference seis_plugin_integration`);
  ensure(text.includes("seis_ai_core_provider_status"), `${label} must reference seis_ai_core_provider_status`);
  ensure(text.includes("seis_ai_core_model_scaling_status"), `${label} must reference seis_ai_core_model_scaling_status`);
  ensure(text.includes("seis_ai_core_version_status"), `${label} must reference seis_ai_core_version_status`);
  ensure(text.includes("seis_ai_core_version_promotion_dry_run"), `${label} must reference seis_ai_core_version_promotion_dry_run`);
  ensure(text.includes("seis_ai_core_subagent_model"), `${label} must reference seis_ai_core_subagent_model`);
}
for (const [text, label] of [
  [docs, "docs"],
  [tools, "tool loop"],
  [loop, "agent loop"],
  [mcp, "MCP server"]
]) {
  ensure(text.includes("seis_public_plugin_family"), `${label} must reference seis_public_plugin_family`);
}
for (const [text, label] of [
  [tools, "tool loop"],
  [mcp, "MCP server"]
]) {
  ensure(text.includes("seis_plugin_integration"), `${label} must reference seis_plugin_integration`);
  ensure(text.includes("AI_CORE_PROVIDER_STATUS_TOOL"), `${label} must reference AI_CORE_PROVIDER_STATUS_TOOL`);
  ensure(text.includes("AI_CORE_MODEL_SCALING_STATUS_TOOL"), `${label} must reference AI_CORE_MODEL_SCALING_STATUS_TOOL`);
  ensure(text.includes("AI_CORE_VERSION_STATUS_TOOL"), `${label} must reference AI_CORE_VERSION_STATUS_TOOL`);
  ensure(text.includes("AI_CORE_VERSION_PROMOTION_TOOL"), `${label} must reference AI_CORE_VERSION_PROMOTION_TOOL`);
  ensure(text.includes("SUBAGENT_OPERATING_MODEL_TOOL"), `${label} must reference SUBAGENT_OPERATING_MODEL_TOOL`);
}

for (const token of requiredDirectLaneTools) {
  ensure(docs.includes(token), `docs missing direct lane tool ${token}`);
  ensure(helper.includes(token), `helper missing direct lane tool ${token}`);
}
ensure(tools.includes("PERSONAL_PLUGIN_LANE_TOOLS"), "tool loop must consume PERSONAL_PLUGIN_LANE_TOOLS");
ensure(helper.includes("UNIFIED_PLUGIN_SUITE_PATH"), "helper must expose the one-file unified suite path");
ensure(tools.includes("resolvePersonalPluginLaneTool"), "tool loop must resolve direct personal lane tools");
ensure(tools.includes("SUBAGENT_OPERATING_MODEL_TOOL"), "tool loop must consume SUBAGENT_OPERATING_MODEL_TOOL");
ensure(tools.includes("subagentOperatingModelStatus"), "tool loop must expose sub-agent operating model status");
ensure(mcp.includes("PERSONAL_PLUGIN_LANE_TOOLS"), "MCP server must consume PERSONAL_PLUGIN_LANE_TOOLS");
ensure(mcp.includes("SUBAGENT_OPERATING_MODEL_TOOL"), "MCP server must consume SUBAGENT_OPERATING_MODEL_TOOL");
ensure(mcp.includes("personalPluginLaneStatus"), "MCP server must expose direct personal lane status");
ensure(mcp.includes("personalPluginLanePlan"), "MCP server must expose direct personal lane plans");
ensure(mcp.includes("subagentOperatingModelStatus"), "MCP server must expose sub-agent operating model status");
ensure(mcp.includes("LightweightMcpServer"), "MCP server must keep a no-dependency stdio fallback");
ensure(mcp.includes("resources/read"), "MCP server fallback must support resource reads");
ensure(mcp.includes("seis://ai/mcp-runtime-contract.json"), "MCP server must expose the AI Core MCP runtime contract resource");
ensure(mcp.includes("seis://ai/model-scaling-hardware-profile.json"), "MCP server must expose the AI Core model scaling resource");
ensure(mcp.includes("seis://ai/model-parameter-ladder.json"), "MCP server must expose the AI Core model parameter ladder resource");
ensure(mcp.includes("seis://ai/model-frontier-escalation-policy.json"), "MCP server must expose the AI Core frontier escalation policy resource");
ensure(mcp.includes("seis://ai/150b-frontier-model-program.json"), "MCP server must expose the AI Core 150B frontier model program resource");
ensure(mcp.includes("seis://ai/20b-model-card-template.json"), "MCP server must expose the AI Core 20B model card template resource");
ensure(mcp.includes("seis://ai/20b-dataset-card-template.json"), "MCP server must expose the AI Core 20B dataset card template resource");

for (const token of [
  "seis-agent-plugin-integration.json",
  "seis-public-plugin-family.json",
  "seis-public-plugin-lifecycle.json",
  "seis-public-plugin-fresh-task-proof.json",
  "seis-public-plugin-fresh-task-reload-evidence.json",
  "seis-public-plugin-security-provenance-review.json",
  "seis-public-plugin-external-install-proof.json",
  "seis-plugin-canonicalization.json",
  "seis-public-plugin-independent-runner-evidence-contract.json",
  "unified-suite.json",
  "single-public-plugin",
  "source-module-only",
  "check:seis-unified-plugin-suite",
  "check:seis-public-plugin-independent-runner-evidence:recorded",
  "seis-ai-agent@seis-repo",
  "Personal SEIS Plugin Bridge",
  "AI Core Resource Bridge",
  "Installed AI Core Route Matrix",
  "Personal Plugin AI Core Lane Matrix",
  "MCP Runtime Contract",
  "seis-ai-core-mcp-runtime-contract.json",
  "seis-ai-core-provider-registry.json",
  "seis-model-scaling-hardware-profile.json",
  "seis://ai/mcp-runtime-contract.json",
  "seis://agent/public-plugin-family.json",
  "seis://agent/public-plugin-lifecycle.json",
  "Clean Artifact and Independent Runner Proof",
  "seis://ai/provider-registry.json",
  "seis://ai/model-scaling-hardware-profile.json",
  "seis://ai/model-parameter-ladder.json",
  "seis://ai/model-frontier-escalation-policy.json",
  "seis://ai/150b-frontier-model-program.json",
  "seis://ai/agi-github-user-readiness-gates.json",
  "no-dependency local fallback transport",
  "seis://ai/sub-agent-5-year-plan-view.json",
  "seis@personal",
  "seis-cloud@personal",
  "seis-code@personal",
  "seis-design@personal",
  "seis-data@personal",
  "seis-security",
  "seis-research",
  "seis-automation",
  "seis-product"
]) {
  ensure(docs.includes(token), `docs missing ${token}`);
}

for (const token of [
  "SEIS-Agent plugin integration",
  "npm run check:seis-agent-plugin-integration",
  "seis-cloud",
  "seis-code",
  "seis-design",
  "seis-data"
]) {
  ensure(webScript.includes(token), `web script missing ${token}`);
}

for (const token of [
  "SEIS_PERSONAL_PLUGIN_AI_CORE_LANE_MATRIX",
  "data-personal-plugin-ai-core-lane-matrix",
  "export-personal-plugin-ai-core-lane-matrix",
  "seis-personal-plugin-ai-core-lane-matrix.md",
  "SEIS_MCP_RUNTIME_CONTRACT",
  "data-mcp-runtime-contract",
  "export-mcp-runtime-contract",
  "seis-mcp-runtime-contract.md"
]) {
  ensure(desktopScript.includes(token), `desktop script missing ${token}`);
}

ensure(webIndex.includes("plugin fabric"), "web index must expose plugin fabric copy");
ensure(serviceWorker.includes("seis-demo-web-v20"), "service worker cache must be bumped for app integration changes");

if (failures.length > 0) {
  console.error("SEIS-Agent plugin integration check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS-Agent plugin integration check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
    return;
  }
  if (!fs.statSync(filePath).isFile() && !fs.statSync(filePath).isDirectory()) {
    failures.push(`${label} is not readable: ${path.relative(root, filePath)}`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(filePath, label) {
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}
