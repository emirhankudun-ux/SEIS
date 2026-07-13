#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const manifestPath = path.join(root, "content", "development", "seis-agent-plugin-integration.json");
const docsPath = path.join(root, "docs", "platform", "seis-agent-plugin-integration.md");
const packagePath = path.join(root, "package.json");
const toolsPath = path.join(root, "packages", "seis-ai", "src", "agent", "tools.mjs");
const loopPath = path.join(root, "packages", "seis-ai", "src", "agent", "loop.mjs");
const mcpPath = path.join(root, "packages", "seis-ai", "src", "mcp", "server.mjs");
const helperPath = path.join(root, "packages", "seis-ai", "src", "lib", "plugin-integration.mjs");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const desktopScriptPath = path.join(root, "apps", "web", "desktop.js");
const serviceWorkerPath = path.join(root, "apps", "seis-demo-web", "service-worker.js");
const secondBrainPath = path.join(root, "content", "development", "seis-second-brain-system.json");
const laneStatusPath = path.join(root, "content", "development", "seis-agent-lane-status.json");
const seisCoreScriptPath = path.join(root, "apps", "seis-core", "script.js");
const seisCoreRuntimeSnapshotPath = path.join(root, "apps", "seis-core", "data", "seis-ai-core-runtime-snapshot.json");
const seisCoreApplicationIntegrationPath = path.join(root, "content", "development", "seis-ai-core-application-integration.json");
const seisCoreRuntimeBuilderPath = path.join(root, "packages", "seis-ai", "src", "model", "core-runtime-snapshot.mjs");

const requiredPersonalPlugins = [
  "seis@personal",
  "seis-cloud@personal",
  "seis-code@personal",
  "seis-design@personal",
  "seis-data@personal"
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
const requiredSecondBrainManagedLanes = [
  "SEIS Hub",
  "SEIS Cloud",
  "SEIS-Code",
  "SEIS-Design",
  "SEIS-DATA",
  "SEIS-Security",
  "SEIS-Research",
  "SEIS-Automation",
  "SEIS-Product"
];
const requiredSecondBrainAgentRoster = [
  "Architect Agent",
  "Code Agent",
  "Design Agent",
  "UI/UX Agent",
  "Research Agent",
  "Search Agent",
  "Security Agent",
  "DevOps Agent",
  "Documentation Agent",
  "QA Agent",
  "Cloud Agent",
  "Automation Agent",
  "Product Agent"
];
const requiredExpandedLaneIds = ["seis-security", "seis-research", "seis-automation", "seis-product"];

for (const [filePath, label] of [
  [manifestPath, "plugin integration manifest"],
  [docsPath, "plugin integration docs"],
  [packagePath, "package.json"],
  [toolsPath, "SEIS AI tool loop"],
  [loopPath, "SEIS AI loop"],
  [mcpPath, "SEIS AI MCP server"],
  [helperPath, "SEIS AI plugin integration helper"],
  [webIndexPath, "SEIS demo index"],
  [webScriptPath, "SEIS demo script"],
  [desktopScriptPath, "SEIS desktop script"],
  [serviceWorkerPath, "SEIS demo service worker"],
  [secondBrainPath, "SEIS Second Brain contract"],
  [laneStatusPath, "SEIS agent lane status contract"],
  [seisCoreScriptPath, "SEIS Core script"],
  [seisCoreRuntimeSnapshotPath, "SEIS Core AI runtime snapshot"],
  [seisCoreApplicationIntegrationPath, "SEIS Core AI application integration contract"],
  [seisCoreRuntimeBuilderPath, "SEIS Core AI runtime snapshot builder"]
]) {
  ensureFile(filePath, label);
}

const manifest = readJson(manifestPath, "plugin integration manifest");
const packageJson = readJson(packagePath, "package.json");
const docs = readText(docsPath, "plugin integration docs");
const tools = readText(toolsPath, "SEIS AI tool loop");
const loop = readText(loopPath, "SEIS AI loop");
const mcp = readText(mcpPath, "SEIS AI MCP server");
const helper = readText(helperPath, "SEIS AI plugin integration helper");
const webIndex = readText(webIndexPath, "SEIS demo index");
const webScript = readText(webScriptPath, "SEIS demo script");
const desktopScript = readText(desktopScriptPath, "SEIS desktop script");
const serviceWorker = readText(serviceWorkerPath, "SEIS demo service worker");
const secondBrain = readJson(secondBrainPath, "SEIS Second Brain contract");
const laneStatus = readJson(laneStatusPath, "SEIS agent lane status contract");
const seisCoreScript = readText(seisCoreScriptPath, "SEIS Core script");
const seisCoreRuntimeSnapshot = readJson(seisCoreRuntimeSnapshotPath, "SEIS Core AI runtime snapshot");
const seisCoreApplicationIntegration = readJson(seisCoreApplicationIntegrationPath, "SEIS Core AI application integration contract");

if (manifest) {
  ensure(manifest.id === "seis-agent-plugin-integration", "manifest id must be seis-agent-plugin-integration");
  ensure(manifest.status === "active", "manifest status must be active");
  ensure(manifest.primaryInstallId === "seis-ai-agent@seis-repo", "manifest must bind to seis-ai-agent@seis-repo");
  ensure(manifest.canonicalAgent?.publishedPlugin === "seis-ai-agent", "manifest must publish only seis-ai-agent");
  ensure(manifest.canonicalAgent?.standaloneLaneInstallMode === "disabled", "standalone lane install mode must stay disabled");
  ensure(manifest.auditedSnapshot?.installedEnabledCount === 185, "manifest must record the 2026-06-19 installed-enabled count");
  ensure(manifest.auditedSnapshot?.notInstalledCount === 5, "manifest must record the 2026-06-19 not-installed count");
  ensure(manifest.auditedSnapshot?.authenticationClaim === "not-claimed", "manifest must not claim connector authentication readiness");
  ensureArrayIncludesAll(manifest.auditedSnapshot?.personalPluginsInstalledEnabled, requiredPersonalPlugins, "auditedSnapshot.personalPluginsInstalledEnabled");
  ensureArrayIncludesAll((manifest.personalPlugins || []).map((plugin) => plugin.id), requiredPersonalPlugins, "personalPlugins");
  ensureArrayIncludesAll((manifest.lanes || []).map((lane) => lane.id), requiredLanes, "lanes");
  ensure(manifest.helperPluginUniverse?.uniquePlugins === 300, "helper plugin universe must keep the requested unique plugin count");
  ensure(manifest.runtimeIntegration?.toolLoopTool === "seis_plugin_integration", "runtimeIntegration must expose the tool-loop tool");
  ensure(manifest.runtimeIntegration?.readOnlyRouterTool === "seis_ai_core_read_only_route", "runtimeIntegration must expose the read-only router tool");
  ensure(manifest.runtimeIntegration?.providerRegistryTool === "seis_ai_core_provider_status", "runtimeIntegration must expose the SEIS AI Core provider status tool");
  ensure(manifest.runtimeIntegration?.modelScalingTool === "seis_ai_core_model_scaling_status", "runtimeIntegration must expose the SEIS AI Core model scaling status tool");
  ensure(manifest.runtimeIntegration?.versionRegistryTool === "seis_ai_core_version_status", "runtimeIntegration must expose the SEIS AI Core version status tool");
  ensure(
    manifest.runtimeIntegration?.versionPromotionTool === "seis_ai_core_version_promotion_dry_run",
    "runtimeIntegration must expose the SEIS AI Core version promotion dry-run tool"
  );
  ensure(manifest.runtimeIntegration?.subagentOperatingModelTool === "seis_ai_core_subagent_model", "runtimeIntegration must expose the SEIS AI Core sub-agent model tool");
  ensure(manifest.runtimeIntegration?.mcpTool === "seis_plugin_integration", "runtimeIntegration must expose the MCP tool");
  ensure(manifest.runtimeIntegration?.mcpResource === "seis://agent/plugin-integration.json", "runtimeIntegration must expose the MCP resource");
  ensureArrayIncludesAll(manifest.runtimeIntegration?.mcpResources, [
    "seis://agent/plugin-integration.json",
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
  ensureArrayIncludesAll(
    manifest.runtimeIntegration?.directPersonalLaneTools,
    requiredDirectLaneTools,
    "runtimeIntegration.directPersonalLaneTools"
  );
  const sshBinding = manifest.runtimeIntegration?.sshTransportBinding;
  ensure(sshBinding?.alias === "SEIS-SSH", "runtimeIntegration.sshTransportBinding must use SEIS-SSH");
  ensure(sshBinding?.contract === "deploy/seis-ssh-public-access-contract.json", "runtimeIntegration.sshTransportBinding must point to the SSH public access contract");
  ensure(sshBinding?.readinessEvidence === "content/development/seis-ssh-live-readiness-evidence.json", "runtimeIntegration.sshTransportBinding must point to live readiness evidence");
  ensure(sshBinding?.statusSurface === "seis_cloud_status", "runtimeIntegration.sshTransportBinding must use seis_cloud_status");
  ensure(sshBinding?.planSurface === "seis_cloud_plan", "runtimeIntegration.sshTransportBinding must use seis_cloud_plan");
  ensure(sshBinding?.serverAndPortPolicy === "preserve-existing-server-and-port", "runtimeIntegration.sshTransportBinding must preserve the existing server and port");
  ensure(sshBinding?.runtimeBoundary === "status-and-plan-only", "runtimeIntegration.sshTransportBinding must remain status-and-plan-only");
  ensure(manifest.applicationIntegration?.seisCoreSurface === "apps/seis-core", "applicationIntegration must expose apps/seis-core");
  ensure(
    manifest.applicationIntegration?.seisCoreContract === "content/development/seis-ai-core-application-integration.json",
    "applicationIntegration must expose the SEIS Core AI application contract"
  );
  ensure(
    manifest.applicationIntegration?.seisCoreArtifact === "apps/seis-core/data/seis-ai-core-runtime-snapshot.json",
    "applicationIntegration must expose the generated SEIS Core AI runtime snapshot"
  );
  ensure(
    manifest.applicationIntegration?.seisNativeSurface === "packages/seis_platform_swift",
    "applicationIntegration must expose the SEIS native Swift package"
  );
  ensure(
    manifest.applicationIntegration?.seisNativeBoundary === "injected-data-validation-only-no-runtime-authority",
    "applicationIntegration must keep the native AI Core consumer validation-only"
  );
  ensure(
    manifest.repoIntegration?.agentRegistry === "content/development/seis-agent-registry.json",
    "repoIntegration must expose the canonical machine-readable agent registry"
  );
  ensure(
    manifest.repoIntegration?.agentRegistryChecker === "scripts/check-seis-agent-registry.mjs",
    "repoIntegration must expose the canonical agent registry checker"
  );
  ensure(
    manifest.repoIntegration?.agentRegistryPackageScript === "check:seis-agent-registry",
    "repoIntegration must expose the canonical agent registry package script"
  );
  ensureFile(path.join(root, manifest.repoIntegration?.agentRegistry || ""), "canonical SEIS agent registry");
  ensureFile(path.join(root, manifest.repoIntegration?.agentRegistryChecker || ""), "canonical SEIS agent registry checker");
  ensureFile(
    path.join(root, manifest.applicationIntegration?.seisNativeContract || ""),
    "SEIS native AI Core runtime snapshot contract"
  );
  ensureFile(
    path.join(root, manifest.applicationIntegration?.seisNativeTests || ""),
    "SEIS native AI Core runtime snapshot tests"
  );
  ensure(
    manifest.fiveYearSubagentDevelopment?.currentRuntimeBoundary === "status-and-plan-only",
    "fiveYearSubagentDevelopment must keep the current runtime boundary status-and-plan-only"
  );
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
    "npm run check:seis-agent-plugin-integration",
    "npm run check:seis-agent-registry",
    "npm run check:seis-ai-core-provider-registry",
    "npm run check:seis-ai-core-read-only-router",
    "npm run check:seis-core-ai-runtime-snapshot",
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

  for (const plugin of manifest.personalPlugins || []) {
    ensureFile(path.join(root, plugin.sourceMirror || ""), `${plugin.id} source mirror`);
    ensureFile(path.join(root, plugin.embeddedSkill || ""), `${plugin.id} embedded skill`);
  }

  for (const lane of manifest.lanes || []) {
    ensureFile(path.join(root, lane.embeddedSkill || ""), `${lane.id} embedded skill`);
    ensure(Array.isArray(lane.mcpTools) && lane.mcpTools.length >= 2, `${lane.id} must expose MCP tools`);
  }
}

if (seisCoreApplicationIntegration) {
  ensure(seisCoreApplicationIntegration.id === "seis-ai-core-application-integration", "SEIS Core AI application integration id mismatch");
  ensure(seisCoreApplicationIntegration.status === "active-read-only", "SEIS Core AI application integration must remain active-read-only");
  ensure(seisCoreApplicationIntegration.delivery?.artifactTracked === true, "SEIS Core AI runtime snapshot must be tracked for clean checkout delivery");
  ensure(seisCoreApplicationIntegration.delivery?.networkFallback === false, "SEIS Core AI application integration must not use network fallback");
  ensure(seisCoreApplicationIntegration.nativeConsumer?.id === "seis-platform-kit", "SEIS Core AI application integration must identify the native Swift consumer");
  ensure(seisCoreApplicationIntegration.nativeConsumer?.runtimeAuthority === false, "SEIS native AI Core consumer must not have runtime authority");
  ensure(
    seisCoreApplicationIntegration.sourceRecords?.includes("content/development/seis-second-brain-system.json"),
    "SEIS Core AI application integration must source the canonical Second Brain contract"
  );
  ensure(seisCoreApplicationIntegration.runtimeBoundary?.providerCallsPerformed === false, "SEIS Core AI application integration must block provider calls");
  ensure(seisCoreApplicationIntegration.runtimeBoundary?.liveMcpSessionStarted === false, "SEIS Core AI application integration must block live MCP sessions");
  for (const claim of [
    "routeEligible",
    "executionPerformed",
    "fallbackUsed",
    "credentialsRead",
    "promptBodiesIncluded",
    "privateContentRead",
    "sshExecuted",
    "deploymentPerformed",
    "githubMutationPerformed"
  ]) {
    ensure(seisCoreApplicationIntegration.runtimeBoundary?.[claim] === false, `SEIS Core AI application integration must keep ${claim} false`);
  }
  ensure(
    seisCoreApplicationIntegration.runtimeBoundary?.humanApprovalRequiredForLiveActions === true,
    "SEIS Core AI application integration must require human approval for live actions"
  );
}

if (seisCoreRuntimeSnapshot) {
  ensure(seisCoreRuntimeSnapshot.id === "seis-ai-core-runtime-snapshot", "SEIS Core AI runtime snapshot id mismatch");
  ensure(seisCoreRuntimeSnapshot.providerRegistry?.coreCredentialRequirement === "none", "SEIS Core AI runtime snapshot must keep a zero-key core");
  ensure(seisCoreRuntimeSnapshot.pluginMesh?.personalLaneCount === 5, "SEIS Core AI runtime snapshot must expose five personal lanes");
  ensure(seisCoreRuntimeSnapshot.sourceOfTruth?.agentRegistry === "content/development/seis-second-brain-system.json", "SEIS Core AI runtime snapshot must source the canonical Second Brain contract");
  ensure(seisCoreRuntimeSnapshot.agentRegistry?.managedLaneCount === 9, "SEIS Core AI runtime snapshot must expose nine managed lanes");
  ensure(seisCoreRuntimeSnapshot.agentRegistry?.agentCount === 13, "SEIS Core AI runtime snapshot must expose thirteen managed agents");
  ensure(seisCoreRuntimeSnapshot.agentRegistry?.runtimeAuthority === false, "SEIS Core managed agent registry must not have runtime authority");
  ensure(seisCoreRuntimeSnapshot.agentRegistry?.humanApprovalRequiredForMutation === true, "SEIS Core managed agent registry must require human approval for mutation");
  ensure(
    seisCoreRuntimeSnapshot.agentRegistry?.agents?.every((agent) => agent.executionAuthority === false),
    "SEIS Core managed agents must remain execution-disabled"
  );
  ensure(
    Object.values(seisCoreRuntimeSnapshot.agentRegistry?.safetyBoundary || {}).every((value) => value === false),
    "SEIS Core managed agent safety boundary must remain false"
  );
  ensure(seisCoreRuntimeSnapshot.mcpRuntime?.toolCount === 35, "SEIS Core AI runtime snapshot MCP tool count drifted");
  ensure(seisCoreRuntimeSnapshot.mcpRuntime?.resourceCount === 30, "SEIS Core AI runtime snapshot MCP resource count drifted");
  ensure(
    seisCoreRuntimeSnapshot.router?.scenarios?.every((scenario) => scenario.decision?.executionPerformed === false),
    "SEIS Core AI runtime snapshot scenarios must remain non-executing"
  );
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-agent-plugin-integration"] === "node scripts/check-seis-agent-plugin-integration.mjs",
    "package.json must expose check:seis-agent-plugin-integration"
  );
  ensure(
    packageJson.scripts?.["check:seis-agent-registry"] === "node scripts/check-seis-agent-registry.mjs",
    "package.json must expose check:seis-agent-registry"
  );
}

if (secondBrain) {
  ensureArrayIncludesAll(secondBrain.managedSubAgentLanes, requiredSecondBrainManagedLanes, "Second Brain managedSubAgentLanes");
  ensureArrayIncludesAll(
    (secondBrain.autonomousAgentRoster || []).map((agent) => agent.agent),
    requiredSecondBrainAgentRoster,
    "Second Brain autonomousAgentRoster"
  );
}

if (laneStatus) {
  ensureArrayIncludesAll((laneStatus.lanes || []).map((lane) => lane.id), requiredExpandedLaneIds, "agent lane status contract expanded lanes");
}

for (const laneId of requiredExpandedLaneIds) {
  ensure(seisCoreScript.includes(`laneId: "${laneId}"`), `SEIS Core script missing expanded lane ${laneId}`);
}

for (const [text, label] of [
  [docs, "docs"],
  [loop, "agent loop"],
  [webScript, "web script"]
]) {
  ensure(text.includes("seis_plugin_integration"), `${label} must reference seis_plugin_integration`);
  ensure(text.includes("seis_ai_core_provider_status"), `${label} must reference seis_ai_core_provider_status`);
  ensure(text.includes("seis_ai_core_model_scaling_status"), `${label} must reference seis_ai_core_model_scaling_status`);
  ensure(text.includes("seis_ai_core_version_status"), `${label} must reference seis_ai_core_version_status`);
  ensure(text.includes("seis_ai_core_version_promotion_dry_run"), `${label} must reference seis_ai_core_version_promotion_dry_run`);
  ensure(text.includes("seis_ai_core_subagent_model"), `${label} must reference seis_ai_core_subagent_model`);
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
ensure(tools.includes("resolvePersonalPluginLaneTool"), "tool loop must resolve direct personal lane tools");
ensure(tools.includes("SUBAGENT_OPERATING_MODEL_TOOL"), "tool loop must consume SUBAGENT_OPERATING_MODEL_TOOL");
ensure(tools.includes("subagentOperatingModelStatus"), "tool loop must expose sub-agent operating model status");
ensure(mcp.includes("PERSONAL_PLUGIN_LANE_TOOLS"), "MCP server must consume PERSONAL_PLUGIN_LANE_TOOLS");
ensure(mcp.includes("SUBAGENT_OPERATING_MODEL_TOOL"), "MCP server must consume SUBAGENT_OPERATING_MODEL_TOOL");
ensure(mcp.includes("personalPluginLaneStatus"), "MCP server must expose direct personal lane status");
  ensure(mcp.includes("personalPluginLanePlan"), "MCP server must expose direct personal lane plans");
  ensure(helper.includes("SEIS_SSH_PUBLIC_ACCESS_CONTRACT_PATH"), "plugin helper must expose the SEIS-SSH contract path");
  ensure(helper.includes("buildSeisSshBinding"), "plugin helper must build the sanitized SEIS-SSH binding");
  ensure(tools.includes("personalPluginLaneStatus"), "tool loop must return the Cloud lane status through the shared helper");
  ensure(docs.includes("seis_cloud_status"), "docs must document the SEIS-SSH Cloud status surface");
  ensure(docs.includes("SEIS-SSH"), "docs must document the SEIS-SSH Cloud binding");
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
  "seis-mcp-runtime-contract.md",
  "SEIS_PLUGIN_INTEGRATION_AUDIT",
  "getSeisCorePluginMeshReadiness",
  "data-command-plugin-mcp-mesh",
  "export-seis-core-plugin-mcp-mesh-readiness",
  "seis-core-plugin-mcp-mesh-readiness.md",
  "installedEnabledCount: 185",
  "helperUniquePlugins: 300"
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
