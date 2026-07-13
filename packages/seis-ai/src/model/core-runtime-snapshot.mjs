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

export const AI_CORE_RUNTIME_SNAPSHOT_ID = "seis-ai-core-runtime-snapshot";
export const AI_CORE_RUNTIME_SNAPSHOT_PATH = "apps/seis-core/data/seis-ai-core-runtime-snapshot.json";
export const AI_CORE_APPLICATION_INTEGRATION_PATH = "content/development/seis-ai-core-application-integration.json";
export const SECOND_BRAIN_SYSTEM_PATH = "content/development/seis-second-brain-system.json";

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
  const applicationIntegration = readJson(repoRoot, AI_CORE_APPLICATION_INTEGRATION_PATH);
  const agentRegistry = buildAgentRegistrySnapshot(readJson(repoRoot, SECOND_BRAIN_SYSTEM_PATH));

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
    },
    mcpRuntime: {
      id: mcp.id,
      status: mcp.status,
      transport: mcp.transport,
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
      "npm run check:seis-second-brain",
      "node --test packages/seis-ai/test/core-runtime-snapshot.test.mjs",
      "node --test apps/seis-core/test/seis-core-static.test.js",
    ],
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
