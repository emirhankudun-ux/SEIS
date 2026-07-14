import { readFileSync } from "node:fs";
import path from "node:path";

import {
  AI_CORE_PROVIDER_REGISTRY_PATH,
  MCP_RUNTIME_CONTRACT_PATH,
  PLUGIN_INTEGRATION_PATH,
  aiCoreProviderStatus,
  pluginIntegrationStatus,
} from "../lib/plugin-integration.mjs";
import {
  READ_ONLY_ROUTER_CONTRACT_PATH,
  READ_ONLY_ROUTER_RUNTIME_ID,
  READ_ONLY_ROUTER_TOOL,
  buildReadOnlyRouteDecision,
  validateReadOnlyRouteDecision,
} from "./read-only-router.mjs";
import { probeSeisPluginMcpMesh } from "../lib/plugin-mcp-mesh.mjs";

export const AI_CORE_RUNTIME_SNAPSHOT_ID = "seis-ai-core-runtime-snapshot";
export const AI_CORE_RUNTIME_SNAPSHOT_PATH = "apps/seis-core/data/seis-ai-core-runtime-snapshot.json";
export const AI_CORE_APPLICATION_INTEGRATION_PATH = "content/development/seis-ai-core-application-integration.json";
export const SECOND_BRAIN_SYSTEM_PATH = "content/development/seis-second-brain-system.json";
export const BIG_TECH_MCP_SKILL_INVENTORY_PATH = "content/development/seis-big-tech-mcp-skill-inventory.json";
export const NVIDIA_INSTALLED_INTEGRATIONS_PATH = "content/development/seis-nvidia-installed-integrations.json";

const PERSONAL_LANE_IDS = Object.freeze([
  "seis",
  "seis-cloud",
  "seis-code",
  "seis-design",
  "seis-data",
]);

const ROUTE_SCENARIOS = Object.freeze([
  {
    id: "governance-plan",
    label: "Governance plan",
    description: "Route a repository governance plan through the SEIS Hub lane.",
    input: {
      taskType: "governance roadmap",
      capability: "planning",
      privacyMode: "local-only",
      localOnly: true,
    },
  },
  {
    id: "cloud-preflight",
    label: "Cloud preflight",
    description: "Inspect a cloud/provider plan without starting SSH, deploy, or provider traffic.",
    input: {
      taskType: "cloud provider preflight",
      capability: "planning",
      privacyMode: "standard",
      localOnly: false,
    },
  },
  {
    id: "code-validation",
    label: "Code validation",
    description: "Route repository validation through the SEIS Code lane.",
    input: {
      taskType: "repository validation",
      capability: "validation",
      privacyMode: "local-only",
      localOnly: true,
    },
  },
  {
    id: "design-review",
    label: "Design review",
    description: "Plan an accessibility review through the SEIS Design lane.",
    input: {
      taskType: "design accessibility planning",
      capability: "repository-planning-demo",
      privacyMode: "local-only",
      localOnly: true,
    },
  },
  {
    id: "data-provenance",
    label: "Data provenance",
    description: "Plan schema and provenance work through the SEIS Data lane.",
    input: {
      taskType: "data schema provenance planning",
      capability: "repository-planning-demo",
      privacyMode: "local-only",
      localOnly: true,
    },
  },
  {
    id: "private-vault-block",
    label: "Private vault boundary",
    description: "Prove that private Obsidian or personal note content is not routable.",
    input: {
      taskType: "private Obsidian vault review",
      capability: "personal notes",
      privacyMode: "review-gated",
      localOnly: true,
    },
  },
  {
    id: "frontier-model-block",
    label: "Frontier model boundary",
    description: "Prove that 512B and frontier records remain planning-only.",
    input: {
      taskType: "512B apex model route",
      capability: "frontier inference",
      privacyMode: "review-gated",
      localOnly: false,
    },
  },
]);

export function buildAiCoreRuntimeSnapshot(repoRoot = process.cwd()) {
  const provider = aiCoreProviderStatus(repoRoot);
  const plugin = pluginIntegrationStatus(repoRoot);
  const mcp = readJson(repoRoot, MCP_RUNTIME_CONTRACT_PATH);
  const pluginMcpMesh = probeSeisPluginMcpMesh(repoRoot, { probeSafeTools: true });
  const applicationIntegration = readJson(repoRoot, AI_CORE_APPLICATION_INTEGRATION_PATH);
  const agentRegistry = buildAgentRegistrySnapshot(readJson(repoRoot, SECOND_BRAIN_SYSTEM_PATH));
  const installedCapabilityInventory = buildInstalledCapabilityInventory(repoRoot);

  if (!provider.ok) throw new Error(provider.error || "SEIS AI Core provider registry is unavailable");
  if (!plugin.ok) throw new Error(plugin.error || "SEIS plugin integration is unavailable");
  if (applicationIntegration.id !== "seis-ai-core-application-integration") {
    throw new Error("SEIS AI Core application integration contract id mismatch");
  }
  if (applicationIntegration.delivery?.trackedArtifact !== AI_CORE_RUNTIME_SNAPSHOT_PATH) {
    throw new Error("SEIS AI Core application integration output path mismatch");
  }
  const applicationDeniedClaims = [
    "routeEligible",
    "executionPerformed",
    "providerCallsPerformed",
    "fallbackUsed",
    "credentialsRead",
    "promptBodiesIncluded",
    "privateContentRead",
    "liveMcpSessionStarted",
    "sshExecuted",
    "deploymentPerformed",
    "githubMutationPerformed",
  ];
  for (const claim of applicationDeniedClaims) {
    if (applicationIntegration.runtimeBoundary?.[claim] !== false) {
      throw new Error(`SEIS AI Core application boundary must keep ${claim} false`);
    }
  }
  if (applicationIntegration.runtimeBoundary?.humanApprovalRequiredForLiveActions !== true) {
    throw new Error("SEIS AI Core application boundary must require human approval for live actions");
  }

  const scenarios = ROUTE_SCENARIOS.map((scenario) => {
    const decision = buildReadOnlyRouteDecision(scenario.input, { root: repoRoot });
    const validation = validateReadOnlyRouteDecision(decision);
    if (!validation.ok) {
      throw new Error(`Read-only route scenario ${scenario.id} failed: ${validation.failures.join("; ")}`);
    }

    return {
      id: scenario.id,
      label: scenario.label,
      description: scenario.description,
      input: scenario.input,
      decision: {
        decisionHash: decision.decisionHash,
        status: decision.status,
        selectedProvider: decision.selectedProvider,
        selectedModel: decision.selectedModel,
        providerState: decision.providerState,
        registryProviderState: decision.registryProviderState,
        selectionBasis: decision.selectionBasis,
        routeEligible: decision.routeEligible,
        executionPerformed: decision.executionPerformed,
        providerCallsPerformed: decision.providerCallsPerformed,
        fallbackUsed: decision.fallbackUsed,
        fallbackPlan: decision.fallbackPlan,
        agentLane: decision.agentLane,
        requiredApprovals: decision.requiredApprovals,
        blockedReasons: decision.blockedReasons,
        safetyBoundary: decision.safetyBoundary,
        modelClaimBoundary: decision.modelClaimBoundary,
      },
    };
  });

  const laneById = new Map(plugin.lanes.map((lane) => [lane.id, lane]));
  const personalLanes = PERSONAL_LANE_IDS.map((laneId) => {
    const lane = laneById.get(laneId);
    if (!lane) throw new Error(`SEIS plugin integration is missing personal lane: ${laneId}`);
    return {
      id: lane.id,
      displayName: lane.displayName,
      role: lane.role,
      mcpTools: lane.mcpTools,
      qualityGate: lane.defaultGate,
    };
  });

  return {
    id: AI_CORE_RUNTIME_SNAPSHOT_ID,
    schemaVersion: "1.0.0",
    status: "local-readiness-linked",
    mode: "Local Demo",
    purpose: "Bind provider, read-only router, unified plugin, managed agent, personal lane, and local MCP evidence directly into the static SEIS Core Command Center.",
    sourceOfTruth: {
      providerRegistry: AI_CORE_PROVIDER_REGISTRY_PATH,
      routerContract: READ_ONLY_ROUTER_CONTRACT_PATH,
      pluginIntegration: PLUGIN_INTEGRATION_PATH,
      mcpRuntimeContract: MCP_RUNTIME_CONTRACT_PATH,
      applicationIntegration: AI_CORE_APPLICATION_INTEGRATION_PATH,
      agentRegistry: SECOND_BRAIN_SYSTEM_PATH,
      installedCapabilityInventory: {
        bigTechMcpSkillInventory: BIG_TECH_MCP_SKILL_INVENTORY_PATH,
        nvidiaInstalledIntegrations: NVIDIA_INSTALLED_INTEGRATIONS_PATH,
      },
      generator: "scripts/create-seis-core-ai-runtime-snapshot.mjs",
      output: AI_CORE_RUNTIME_SNAPSHOT_PATH,
    },
    applicationIntegration: {
      id: applicationIntegration.id,
      status: applicationIntegration.status,
      consumer: applicationIntegration.consumer,
      nativeConsumer: applicationIntegration.nativeConsumer,
      delivery: applicationIntegration.delivery,
      providerStateSemantics: applicationIntegration.providerStateSemantics,
      runtimeBoundary: applicationIntegration.runtimeBoundary,
    },
    providerRegistry: {
      id: provider.id,
      status: provider.status,
      truthBoundary: provider.truthBoundary,
      coreCredentialRequirement: provider.coreCredentialRequirement,
      defaultRoutingMode: provider.defaultRoutingMode,
      localOnlyRespected: provider.localOnlyRespected,
      providerCount: provider.providerCount,
      availableProviderCount: provider.availableProviderCount,
      routingEligibleProviderCount: provider.routingEligibleProviderCount,
      missingKeyProviderCount: provider.missingKeyProviderCount,
      disabledProviderCount: provider.disabledProviderCount,
      publicStates: provider.publicStates,
      providers: provider.providers.map((record) => ({
        id: record.id,
        displayName: record.displayName,
        category: record.category,
        publicStatus: record.publicStatus,
        credentialRequirement: record.credentialRequirement,
        configured: record.configured,
        enabled: record.enabled,
        routingEligible: record.routingEligible,
        privacyClass: record.privacyClass,
        actualModel: record.actualModel,
        backendOnly: record.backendOnly,
        frontendSecretAllowed: record.frontendSecretAllowed,
      })),
    },
    router: {
      runtimeId: READ_ONLY_ROUTER_RUNTIME_ID,
      tool: READ_ONLY_ROUTER_TOOL,
      status: "review-only-no-runtime-authority",
      mode: "provider-neutral-read-only",
      scenarioCount: scenarios.length,
      scenarios,
    },
    agentRegistry,
    installedCapabilityInventory,
    pluginMesh: {
      id: plugin.id,
      status: plugin.status,
      primaryInstallId: plugin.primaryInstallId,
      installedEnabledCount: plugin.installedEnabledCount,
      notInstalledCount: plugin.notInstalledCount,
      helperUniquePlugins: plugin.helperPluginUniverse?.uniquePlugins || 0,
      helperCapabilityLaneCount: plugin.helperPluginUniverse?.laneCount || 0,
      activationPolicy: plugin.helperPluginUniverse?.activationPolicy || "task-scoped",
      personalLaneCount: personalLanes.length,
      personalLaneToolCount: personalLanes.reduce((sum, lane) => sum + lane.mcpTools.length, 0),
      personalLanes,
      capabilityCatalog: plugin.capabilityCatalog,
      mcpMesh: pluginMcpMesh,
    },
    mcpRuntime: {
      id: mcp.id,
      status: mcp.status,
      transport: mcp.transport,
      lifecycle: mcp.lifecycle,
      fallbackRuntime: mcp.fallbackRuntime,
      toolCount: mcp.toolCount,
      resourceCount: mcp.resourceCount,
      promptCount: mcp.promptCount,
      resourceUri: mcp.resourceUri,
      pluginIntegrationResource: mcp.pluginIntegrationResource,
      boundary: mcp.boundary,
      surfaces: mcp.surfaces,
    },
    runtimeBoundary: {
      providerCalls: false,
      credentialsRead: false,
      frontendSecretsAllowed: false,
      liveMcpSessionStarted: false,
      sshExecuted: false,
      deploymentPerformed: false,
      githubMutationPerformed: false,
      privateContentRead: false,
      routeExecutionPerformed: false,
      humanApprovalRequiredForLiveActions: true,
    },
    qualityGates: [
      "npm run check:seis-core-ai-runtime-snapshot",
      "npm run check:seis-ai-core-provider-registry",
      "npm run check:seis-ai-core-read-only-router",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:seis-plugin-capability-catalog",
      "npm run check:seis-second-brain",
      "node --test packages/seis-ai/test/core-runtime-snapshot.test.mjs",
      "node --test apps/seis-core/test/seis-core-static.test.js",
    ],
  };
}

function buildInstalledCapabilityInventory(repoRoot) {
  const bigTech = readJson(repoRoot, BIG_TECH_MCP_SKILL_INVENTORY_PATH);
  const nvidia = readJson(repoRoot, NVIDIA_INSTALLED_INTEGRATIONS_PATH);
  if (bigTech.id !== "seis-big-tech-mcp-skill-inventory") {
    throw new Error("Big Tech MCP/skill inventory id mismatch");
  }
  if (nvidia.id !== "seis-nvidia-installed-integrations" || nvidia.version !== 1) {
    throw new Error("NVIDIA installed integrations identity mismatch");
  }

  const bigTechSafetyBoundary = bigTech.security_boundary || {};
  const requiredBigTechSafetyClaims = [
    "no_secrets_stored",
    "no_provider_calls",
    "no_ssh",
    "no_deployment",
    "no_git_push_or_merge",
  ];
  if (requiredBigTechSafetyClaims.some((claim) => bigTechSafetyBoundary[claim] !== true)) {
    throw new Error("Big Tech capability inventory violates its no-secret/no-provider safety boundary");
  }

  const installedSkillPass = bigTech.installed_skill_pass || {};
  const installedSkillIDs = Array.isArray(installedSkillPass.skills) ? installedSkillPass.skills : [];
  if (installedSkillPass.installed_skill_count !== 38 ||
      installedSkillIDs.length !== installedSkillPass.installed_skill_count ||
      installedSkillIDs.some((skillID) => typeof skillID !== "string" || skillID.length === 0) ||
      installedSkillPass.requires_codex_restart !== true) {
    throw new Error("Big Tech capability inventory skill pass is incomplete");
  }

  const cliToolProfiles = Array.isArray(bigTech.cli_installations)
    ? bigTech.cli_installations.map((profile) => ({
      vendor: profile.vendor,
      name: profile.name,
      status: profile.status,
      providerState: profile.provider_state,
    }))
    : [];
  if (cliToolProfiles.length !== 3 || cliToolProfiles.some((profile) => Object.values(profile).some((value) => typeof value !== "string" || value.length === 0))) {
    throw new Error("Big Tech capability inventory CLI/tool profiles are incomplete");
  }

  const projectMCPConfigurations = Array.isArray(bigTech.project_mcp_and_skill_configs)
    ? bigTech.project_mcp_and_skill_configs.map((configuration) => ({
      path: configuration.path,
      client: configuration.client,
      serverIDs: Array.isArray(configuration.servers) ? configuration.servers : [],
      status: configuration.status,
    }))
    : [];
  if (projectMCPConfigurations.length !== 3 || projectMCPConfigurations.some((configuration) =>
    !configuration.path || !configuration.client || !configuration.status || configuration.serverIDs.some((serverID) => typeof serverID !== "string" || serverID.length === 0))) {
    throw new Error("Big Tech capability inventory MCP/skill configurations are incomplete");
  }

  const connectorInstallAttempts = Array.isArray(bigTech.connector_install_attempts)
    ? bigTech.connector_install_attempts
    : [];
  const pendingConnectorInstallCount = connectorInstallAttempts.filter((attempt) =>
    attempt.completed === false && attempt.user_confirmed === false
  ).length;
  if (bigTech.local_apps_detected?.length !== 8 ||
      bigTech.current_session_mcp_surfaces?.length !== 17 ||
      pendingConnectorInstallCount !== 1) {
    throw new Error("Big Tech capability inventory counts are incomplete");
  }

  const policy = nvidia.installPolicy || {};
  const blockedNVIDIAFlags = [
    "executeSkillCommandsAllowed",
    "networkInstallAllowed",
    "repoCloneAllowed",
    "modelDownloadAllowed",
    "nimApiCallAllowed",
    "dockerAllowed",
    "kubernetesAllowed",
    "terraformAllowed",
    "azureAllowed",
    "gpuRuntimeAllowed",
    "sshAllowed",
    "secretReadAllowed",
  ];
  if (nvidia.status !== "installed-local-skill-registry-runtime-gated" ||
      nvidia.source?.plugin !== "nvidia" ||
      nvidia.source?.registryMode !== "metadata-only-no-runtime-execution" ||
      policy.installedIntoSeis !== true ||
      policy.localSkillManifestCount !== 11 ||
      policy.credentialRequiredForCoreDemo !== false ||
      policy.approvalRequiredForRuntime !== true ||
      policy.truthBoundary?.length === 0 ||
      blockedNVIDIAFlags.some((flag) => policy[flag] !== false)) {
    throw new Error("NVIDIA capability inventory violates its runtime-gated policy");
  }

  const nvidiaIntegrations = Array.isArray(nvidia.installedIntegrations) ? nvidia.installedIntegrations : [];
  const nvidiaIntegrationIDs = nvidiaIntegrations.map((integration) => integration.id);
  if (nvidiaIntegrations.length !== 11 ||
      nvidiaIntegrationIDs.some((integrationID) => typeof integrationID !== "string" || integrationID.length === 0) ||
      new Set(nvidiaIntegrationIDs).size !== nvidiaIntegrationIDs.length ||
      nvidiaIntegrations.some((integration) => integration.status !== "installed-gated") ||
      nvidia.runtimeBlockedUntilApproved?.length !== 8) {
    throw new Error("NVIDIA capability inventory integration counts or statuses are invalid");
  }

  return {
    id: "seis-installed-capability-inventory",
    status: "source-backed-metadata-only",
    sourcePaths: [BIG_TECH_MCP_SKILL_INVENTORY_PATH, NVIDIA_INSTALLED_INTEGRATIONS_PATH],
    bigTech: {
      status: bigTech.status,
      installedSkillCount: installedSkillPass.installed_skill_count,
      installedSkillIDs,
      cliToolProfiles,
      projectMCPConfigurations,
      currentSessionMCPSurfaceCount: bigTech.current_session_mcp_surfaces.length,
      localAppCount: bigTech.local_apps_detected.length,
      pendingConnectorInstallCount,
    },
    nvidia: {
      status: nvidia.status,
      skillManifestCount: policy.localSkillManifestCount,
      integrationIDs: nvidiaIntegrationIDs,
      runtimeBlockedCount: nvidia.runtimeBlockedUntilApproved.length,
    },
    runtimeBoundary: {
      runtimeAuthority: false,
      credentialsRead: false,
      networkCalled: false,
      externalMutationPerformed: false,
      humanApprovalRequiredForActivation: true,
    },
    truthBoundary: "Installed AI, MCP, skill, CLI, and NVIDIA surfaces are source-backed metadata only. Activation, provider authentication, credential access, network calls, runtime execution, and external mutation remain blocked or human-approval gated.",
  };
}

function buildAgentRegistrySnapshot(registry) {
  if (registry.id !== "seis-second-brain-system") {
    throw new Error("SEIS Second Brain system id mismatch");
  }
  if (registry.status !== "local-demo") {
    throw new Error("SEIS Second Brain system must remain local-demo");
  }

  const managedLanes = registry.managedSubAgentLanes;
  const agents = registry.autonomousAgentRoster;
  if (!Array.isArray(managedLanes) || !Array.isArray(agents)) {
    throw new Error("SEIS Second Brain agent registry is missing its managed mesh");
  }
  if (managedLanes.length !== 9) {
    throw new Error("SEIS Second Brain must expose exactly nine managed lanes");
  }
  if (agents.length !== 13) {
    throw new Error("SEIS Second Brain must expose exactly thirteen managed agents");
  }
  if (registry.qualityGate !== "npm run check:seis-second-brain") {
    throw new Error("SEIS Second Brain quality gate mismatch");
  }
  const deniedSafetyClaims = ["storesSecrets", "providerCalls", "sshExecution", "deployment", "githubMutation"];
  for (const claim of deniedSafetyClaims) {
    if (registry.securityBoundary?.[claim] !== false) {
      throw new Error(`SEIS Second Brain safety boundary must keep ${claim} false`);
    }
  }
  if (registry.securityBoundary?.requiresHumanReviewBeforePublicUse !== true) {
    throw new Error("SEIS Second Brain must require human review before public use");
  }

  const publicAgents = agents.map((agent) => {
    if (!agent.agent || !agent.duty || !["status-plan-only", "blocking-review-gate"].includes(agent.status)) {
      throw new Error("SEIS Second Brain agent roster contains an invalid public record");
    }
    return {
      id: slugify(agent.agent),
      displayName: agent.agent,
      status: agent.status,
      duty: agent.duty,
      executionAuthority: false,
    };
  });

  return {
    id: registry.id,
    status: "review-only-agent-registry",
    mode: registry.status,
    source: SECOND_BRAIN_SYSTEM_PATH,
    sourceQualityGate: registry.qualityGate,
    decision: "NO-GO-autonomous-execution-not-approved",
    truthBoundary: "Whitelisted public Second Brain contract only. Vault paths, training paths, installed AI profiles, generated audit reports, credentials, prompts, and private note content are excluded.",
    managedLaneCount: managedLanes.length,
    agentCount: publicAgents.length,
    runtimeAuthority: false,
    permissionBoundary: "status-and-plan-only",
    managedLanes: managedLanes.map((displayName) => ({
      id: displayName === "SEIS Hub" ? "seis" : slugify(displayName),
      displayName,
      status: "status-and-plan-only",
    })),
    agents: publicAgents,
    safetyBoundary: Object.fromEntries(deniedSafetyClaims.map((claim) => [claim, registry.securityBoundary[claim]])),
    humanApprovalRequiredForMutation: registry.securityBoundary.requiresHumanReviewBeforePublicUse,
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readJson(repoRoot, relativePath) {
  return JSON.parse(readFileSync(path.join(repoRoot, ...relativePath.split("/")), "utf8"));
}
