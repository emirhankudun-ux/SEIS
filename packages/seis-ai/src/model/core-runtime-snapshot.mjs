import { readFileSync } from "node:fs";
import path from "node:path";

import {
  AI_CORE_PROVIDER_REGISTRY_PATH,
  MCP_RUNTIME_CONTRACT_PATH,
  PLUGIN_INTEGRATION_PATH,
  SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH,
  SUBAGENT_RUNTIME_FIXTURES_PATH,
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
export const AI_CORE_AGENT_PERMISSION_MATRIX_PATH = "content/development/seis-ai-core-agent-permission-matrix.json";
export const AI_CORE_SUBAGENT_RUNTIME_FIXTURES_PATH = SUBAGENT_RUNTIME_FIXTURES_PATH;
export const AI_WORKFORCE_ASSIGNMENTS_PATH = "content/development/ai-workforce-assignments.json";
export const AI_WORKFORCE_TRAINING_PATH = "content/development/seis-ai-workforce-training-plan.json";

const EXPECTED_AI_WORKFORCE_TRUTH_BOUNDARY = "Workforce assignments are source-backed role and launcher metadata. Installed status is not live-model, authentication, provider-call, execution, or external-mutation evidence; Codex remains the only repository writer by default.";
const EXPECTED_AI_WORKFORCE_TRAINING_TRUTH_BOUNDARY = "Repository-local training control plane only. It performs no live provider calls, no credential validation, no SSH, no deployment, no external dataset download, no cloud fine-tuning, and no claim that SEIS owns a trained foundation model.";
const EXPECTED_AI_AGENT_PERMISSION_TRUTH_BOUNDARY = "Source-backed permission metadata only. Permission levels describe approval and evidence boundaries; they do not grant runtime authority, credentials, network, shell, provider, SSH, deployment, GitHub, training, or dataset access.";
const EXPECTED_AI_SUBAGENT_RUNTIME_FIXTURES_TRUTH_BOUNDARY = "Source-backed runtime fixture metadata only. The seven fixtures describe plan-only controls and future evidence requirements; they do not execute agents, persist a durable audit database, grant write authority, call providers, open MCP sessions, read credentials, or perform external mutations.";
const AI_WORKFORCE_LAUNCHER_STATUSES = new Set([
  "installed",
  "route-defined-current-shell-missing-key",
  "pr-dependent",
  "remote-ci",
  "route-defined-current-shell-missing-command",
]);
const AI_WORKFORCE_TRAINER_ROUTE_STATUSES = new Set(["installed", "missing-key-current-shell"]);
const AI_WORKFORCE_LAUNCHER_EVIDENCE = Object.freeze({
  command: "npm run ai -- list",
  observedDate: "2026-06-23",
  notes: Object.freeze([
    "The command checks local route readiness only.",
    "No provider call, repository upload, secret read, or live model verification was performed.",
    "Missing environment-variable status does not prove a credential does not exist outside the current shell.",
  ]),
});
const AI_WORKFORCE_TRAINING_LAUNCHER_EVIDENCE = Object.freeze({
  command: "npm run ai -- list",
  observedDate: "2026-06-23",
  notes: Object.freeze([
    "The command checks route readiness only.",
    "No provider prompt, repository upload, credential read, or live model verification was performed.",
    "Missing key status means the current shell did not expose that provider credential.",
  ]),
});
const MAX_LOCAL_EVIDENCE_AGE_DAYS = 31;

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
  const agentPermissionMatrixRegistry = buildAgentPermissionMatrixRegistry(
    readJson(repoRoot, AI_CORE_AGENT_PERMISSION_MATRIX_PATH)
  );
  const subagentRuntimeFixturesRegistry = buildSubagentRuntimeFixturesRegistry(repoRoot);
  const installedCapabilityInventory = buildInstalledCapabilityInventory(repoRoot);
  const workforceAssignmentRegistry = buildWorkforceAssignmentRegistry(
    readJson(repoRoot, AI_WORKFORCE_ASSIGNMENTS_PATH)
  );
  const workforceTrainingRegistry = buildWorkforceTrainingRegistry(
    readJson(repoRoot, AI_WORKFORCE_TRAINING_PATH)
  );

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
    purpose: "Bind provider, read-only router, unified plugin, managed agent, permission matrix, sub-agent runtime fixtures, workforce assignment, workforce training, personal lane, and local MCP evidence directly into the static SEIS Core Command Center.",
    sourceOfTruth: {
      providerRegistry: AI_CORE_PROVIDER_REGISTRY_PATH,
      routerContract: READ_ONLY_ROUTER_CONTRACT_PATH,
      pluginIntegration: PLUGIN_INTEGRATION_PATH,
      mcpRuntimeContract: MCP_RUNTIME_CONTRACT_PATH,
      applicationIntegration: AI_CORE_APPLICATION_INTEGRATION_PATH,
      agentRegistry: SECOND_BRAIN_SYSTEM_PATH,
      agentPermissionMatrix: AI_CORE_AGENT_PERMISSION_MATRIX_PATH,
      subagentRuntimeFixtures: SUBAGENT_RUNTIME_FIXTURES_PATH,
      workforceAssignments: AI_WORKFORCE_ASSIGNMENTS_PATH,
      workforceTraining: AI_WORKFORCE_TRAINING_PATH,
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
    agentPermissionMatrixRegistry,
    subagentRuntimeFixturesRegistry,
    workforceAssignmentRegistry,
    workforceTrainingRegistry,
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

function buildAgentPermissionMatrixRegistry(source) {
  const expectedLevels = ["read-only", "plan-only", "write-gated", "external-gated", "forbidden"];
  const expectedStatuses = ["enabled", "enabled", "planned", "planned", "active"];
  const expectedApprovalRequirements = [false, false, "task-scoped", true, "separate security and recovery plan required"];
  if (source.id !== "seis-ai-core-agent-permission-matrix" ||
      source.status !== "documented-fixture" ||
      source.runtimeBoundary !== "status-and-plan-only" ||
      source.qualityGate !== "npm run check:seis-ai-core-subagent-runtime-fixtures" ||
      typeof source.purpose !== "string" || source.purpose.trim().length === 0) {
    throw new Error("SEIS AI agent permission matrix identity or boundary is invalid");
  }

  const levels = Array.isArray(source.levels) ? source.levels : [];
  if (levels.length !== expectedLevels.length) {
    throw new Error("SEIS AI agent permission matrix must expose exactly five levels");
  }

  const publicLevels = levels.map((level, index) => {
    if (level.level !== expectedLevels[index] ||
        level.status !== expectedStatuses[index] ||
        level.approvalRequired !== expectedApprovalRequirements[index] ||
        !Array.isArray(level.actions) || level.actions.length === 0 ||
        !Array.isArray(level.evidenceRequired) || level.evidenceRequired.length === 0 ||
        [...level.actions, ...level.evidenceRequired].some((value) => typeof value !== "string" || value.trim().length === 0)) {
      throw new Error(`SEIS AI permission level ${level.level || "unknown"} violates the governance matrix`);
    }
    return {
      level: level.level,
      status: level.status,
      actions: level.actions,
      approvalRequired: level.approvalRequired,
      evidenceRequired: level.evidenceRequired,
    };
  });

  const forbiddenWithoutSeparatePlan = Array.isArray(source.forbiddenWithoutSeparatePlan)
    ? source.forbiddenWithoutSeparatePlan
    : [];
  if (forbiddenWithoutSeparatePlan.length !== 7 ||
      new Set(forbiddenWithoutSeparatePlan).size !== forbiddenWithoutSeparatePlan.length ||
      forbiddenWithoutSeparatePlan.some((value) => typeof value !== "string" || value.trim().length === 0) ||
      !forbiddenWithoutSeparatePlan.includes("credential access") ||
      !forbiddenWithoutSeparatePlan.includes("unrestricted shell execution")) {
    throw new Error("SEIS AI permission matrix forbidden boundary is incomplete");
  }

  return {
    id: source.id,
    version: source.version,
    status: "source-backed-metadata-only",
    source: AI_CORE_AGENT_PERMISSION_MATRIX_PATH,
    purpose: source.purpose,
    qualityGate: source.qualityGate,
    runtimeBoundary: source.runtimeBoundary,
    enabledLevelCount: publicLevels.filter((level) => level.status === "enabled").length,
    levels: publicLevels,
    forbiddenWithoutSeparatePlan,
    truthBoundary: EXPECTED_AI_AGENT_PERMISSION_TRUTH_BOUNDARY,
  };
}

function buildSubagentRuntimeFixturesRegistry(repoRoot) {
  const fixturePack = readJson(repoRoot, SUBAGENT_RUNTIME_FIXTURES_PATH);
  const ledgerPath = fixturePack.sourceOfTruth?.executionLedgerFixture || SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH;
  const ledger = readJson(repoRoot, ledgerPath);
  const expectedFixtureIds = [
    "role-schema",
    "permission-matrix",
    "dry-run-task-queue",
    "cancellation-fixture",
    "approval-fixture",
    "redaction-fixture",
    "execution-ledger-fixture",
  ];
  const expectedRequiredFields = [
    "id",
    "taskId",
    "laneId",
    "roleId",
    "permissionLevel",
    "decision",
    "stateBefore",
    "stateAfter",
    "dryRunOnly",
    "realExecutionBlocked",
    "externalMutationPerformed",
    "fileMutationPerformed",
    "approvalRequired",
    "approvalRecordId",
    "cancellationSignal",
    "validator",
    "rollbackNote",
    "redactionStatus",
    "createdAt",
  ];
  const expectedForbiddenRecords = [
    "secret values",
    "private keys",
    "raw provider errors",
    "unapproved external mutation",
  ];
  const boundary = fixturePack.runtimeBoundary || {};
  const fixtures = Array.isArray(fixturePack.fixtures) ? fixturePack.fixtures : [];
  const fixtureIds = fixtures.map((fixture) => fixture.id);
  if (fixturePack.id !== "seis-ai-core-subagent-runtime-fixtures" ||
      fixturePack.status !== "documented-fixture" ||
      typeof fixturePack.version !== "string" || fixturePack.version.trim().length === 0 ||
      typeof fixturePack.purpose !== "string" || fixturePack.purpose.trim().length === 0 ||
      fixturePack.qualityGate !== "npm run check:seis-ai-core-subagent-runtime-fixtures" ||
      boundary.currentLevel !== "status-and-plan-only" ||
      boundary.backgroundAutomation !== "disabled" ||
      boundary.writeExecution !== "disabled" ||
      boundary.credentialAccess !== "forbidden" ||
      boundary.externalMutation !== "requires-explicit-human-approval" ||
      fixtures.length !== expectedFixtureIds.length ||
      fixtureIds.some((id, index) => id !== expectedFixtureIds[index]) ||
      fixtures.some((fixture) => [fixture.id, fixture.path, fixture.summary].some((value) => typeof value !== "string" || value.trim().length === 0)) ||
      ledgerPath !== SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH) {
    throw new Error("SEIS AI sub-agent runtime fixture pack identity or boundary is invalid");
  }

  const requiredFields = Array.isArray(ledger.requiredFields) ? ledger.requiredFields : [];
  const recordsForbidden = Array.isArray(ledger.recordsForbidden) ? ledger.recordsForbidden : [];
  const sampleRecords = Array.isArray(ledger.sampleRecords) ? ledger.sampleRecords : [];
  const sampleRecord = sampleRecords[0] || {};
  if (ledger.id !== "seis-ai-core-execution-ledger-fixture" ||
      ledger.status !== "documented-fixture" ||
      ledger.mode !== "append-only-planned" ||
      ledger.writerPolicy !== "single-writer" ||
      requiredFields.length !== expectedRequiredFields.length ||
      requiredFields.some((field, index) => field !== expectedRequiredFields[index]) ||
      recordsForbidden.length !== expectedForbiddenRecords.length ||
      expectedForbiddenRecords.some((value) => !recordsForbidden.includes(value)) ||
      sampleRecords.length !== 1 ||
      sampleRecord.id !== "ledger-dry-run-seis-code-patch-plan" ||
      sampleRecord.permissionLevel !== "plan-only" ||
      sampleRecord.decision !== "cancelled" ||
      sampleRecord.dryRunOnly !== true ||
      sampleRecord.realExecutionBlocked !== true ||
      sampleRecord.externalMutationPerformed !== false ||
      sampleRecord.fileMutationPerformed !== false ||
      sampleRecord.approvalRequired !== false ||
      sampleRecord.approvalRecordId !== null ||
      sampleRecord.cancellationSignal !== "operator-cancel" ||
      sampleRecord.redactionStatus !== "passed" ||
      sampleRecord.secretValuesStored !== false ||
      typeof sampleRecord.createdAt !== "string" || sampleRecord.createdAt.trim().length === 0) {
    throw new Error("SEIS AI sub-agent execution ledger fixture is unsafe");
  }

  return {
    id: fixturePack.id,
    version: fixturePack.version,
    status: "source-backed-metadata-only",
    source: SUBAGENT_RUNTIME_FIXTURES_PATH,
    purpose: fixturePack.purpose,
    qualityGate: fixturePack.qualityGate,
    runtimeBoundary: boundary,
    fixtureCount: fixtures.length,
    fixtureIds,
    fixtures: fixtures.map((fixture) => ({
      id: fixture.id,
      path: fixture.path,
      summary: fixture.summary,
    })),
    sourceOfTruth: fixturePack.sourceOfTruth,
    executionLedgerFixture: {
      id: ledger.id,
      status: ledger.status,
      source: ledgerPath,
      mode: ledger.mode,
      writerPolicy: ledger.writerPolicy,
      requiredFieldCount: requiredFields.length,
      requiredFields,
      recordsForbidden,
      sampleRecordCount: sampleRecords.length,
      sampleRecord: {
        id: sampleRecord.id,
        taskId: sampleRecord.taskId,
        laneId: sampleRecord.laneId,
        roleId: sampleRecord.roleId,
        permissionLevel: sampleRecord.permissionLevel,
        decision: sampleRecord.decision,
        stateBefore: sampleRecord.stateBefore,
        stateAfter: sampleRecord.stateAfter,
        dryRunOnly: sampleRecord.dryRunOnly,
        realExecutionBlocked: sampleRecord.realExecutionBlocked,
        externalMutationPerformed: sampleRecord.externalMutationPerformed,
        fileMutationPerformed: sampleRecord.fileMutationPerformed,
        approvalRequired: sampleRecord.approvalRequired,
        approvalRecordId: sampleRecord.approvalRecordId,
        cancellationSignal: sampleRecord.cancellationSignal,
        validator: sampleRecord.validator,
        rollbackNote: sampleRecord.rollbackNote,
        redactionStatus: sampleRecord.redactionStatus,
        secretValuesStored: sampleRecord.secretValuesStored,
        createdAt: sampleRecord.createdAt,
      },
      nextPromotionGate: ledger.nextPromotionGate,
    },
    truthBoundary: EXPECTED_AI_SUBAGENT_RUNTIME_FIXTURES_TRUTH_BOUNDARY,
  };
}

function buildWorkforceAssignmentRegistry(source) {
  if (source.id !== "seis-ai-workforce-assignments" || source.status !== "documented") {
    throw new Error("SEIS AI workforce assignment registry identity or status mismatch");
  }

  const writerPolicy = source.writerPolicy || {};
  if (writerPolicy.primaryWriter !== "codex" ||
      typeof writerPolicy.rule !== "string" || writerPolicy.rule.trim().length === 0 ||
      typeof writerPolicy.handoffRequirement !== "string" || writerPolicy.handoffRequirement.trim().length === 0) {
    throw new Error("SEIS AI workforce assignment registry must keep Codex as the primary writer");
  }
  if (source.truthBoundary !== EXPECTED_AI_WORKFORCE_TRUTH_BOUNDARY) {
    throw new Error("SEIS AI workforce assignment registry truth boundary is incomplete");
  }

  const assignments = Array.isArray(source.assignments) ? source.assignments : [];
  if (assignments.length !== 10) {
    throw new Error("SEIS AI workforce assignment registry must expose exactly ten assignments");
  }

  const assignmentIDs = assignments.map((assignment) => assignment.id);
  if (assignmentIDs.some((id) => typeof id !== "string" || id.trim().length === 0) ||
      new Set(assignmentIDs).size !== assignmentIDs.length) {
    throw new Error("SEIS AI workforce assignment registry contains invalid or duplicate IDs");
  }

  const requiredAssignmentFields = [
    "displayName",
    "route",
    "launcherStatus",
    "category",
    "validationDuty",
  ];
  const publicAssignments = assignments.map((assignment) => {
    if (requiredAssignmentFields.some((field) => typeof assignment[field] !== "string" || assignment[field].trim().length === 0) ||
        !AI_WORKFORCE_LAUNCHER_STATUSES.has(assignment.launcherStatus) ||
        !Array.isArray(assignment.coreDuties) || assignment.coreDuties.length === 0 ||
        !Array.isArray(assignment.allowedOutputs) || assignment.allowedOutputs.length === 0 ||
        !Array.isArray(assignment.deniedActions) || assignment.deniedActions.length === 0 ||
        [...assignment.coreDuties, ...assignment.allowedOutputs, ...assignment.deniedActions]
          .some((value) => typeof value !== "string" || value.trim().length === 0)) {
      throw new Error(`SEIS AI workforce assignment ${assignment.id || "unknown"} is incomplete`);
    }

    return {
      id: assignment.id,
      displayName: assignment.displayName,
      route: assignment.route,
      launcherStatus: assignment.launcherStatus,
      category: assignment.category,
      coreDuties: assignment.coreDuties,
      allowedOutputs: assignment.allowedOutputs,
      deniedActions: assignment.deniedActions,
      validationDuty: assignment.validationDuty,
    };
  });

  const launcherEvidence = source.currentLauncherEvidence || {};
  if (launcherEvidence.command !== AI_WORKFORCE_LAUNCHER_EVIDENCE.command ||
      launcherEvidence.observedDate !== AI_WORKFORCE_LAUNCHER_EVIDENCE.observedDate ||
      JSON.stringify(launcherEvidence.notes) !== JSON.stringify(AI_WORKFORCE_LAUNCHER_EVIDENCE.notes)) {
    throw new Error("SEIS AI workforce launcher evidence must remain local-readiness-only");
  }
  validateLocalEvidenceDate(launcherEvidence.observedDate, "SEIS AI workforce launcher evidence");

  const approvalRequiredFor = Array.isArray(source.approvalRequiredFor) ? source.approvalRequiredFor : [];
  const requiredApprovalClaims = [
    "push to main",
    "merge",
    "deployment",
    "SSH command execution",
    "paid or live provider smoke tests",
  ];
  if (requiredApprovalClaims.some((claim) => !approvalRequiredFor.includes(claim))) {
    throw new Error("SEIS AI workforce approval boundary is incomplete");
  }

  const workflow = Array.isArray(source.workflow) ? source.workflow : [];
  if (workflow.length !== assignments.length || workflow.some((step) =>
    ["step", "owner", "output"].some((field) => typeof step[field] !== "string" || step[field].trim().length === 0))) {
    throw new Error("SEIS AI workforce workflow does not cover every assignment safely");
  }

  return {
    id: source.id,
    version: source.version,
    status: "source-backed-metadata-only",
    source: AI_WORKFORCE_ASSIGNMENTS_PATH,
    purpose: source.purpose,
    assignmentCount: publicAssignments.length,
    writerPolicy: {
      primaryWriter: writerPolicy.primaryWriter,
      rule: writerPolicy.rule,
      handoffRequirement: writerPolicy.handoffRequirement,
    },
    assignments: publicAssignments,
    workflow: workflow.map((step) => ({
      step: step.step,
      owner: step.owner,
      output: step.output,
    })),
    launcherEvidence: {
      command: launcherEvidence.command,
      observedDate: launcherEvidence.observedDate,
      notes: launcherEvidence.notes,
    },
    approvalRequiredFor,
    runtimeBoundary: {
      executionAuthority: false,
      providerCalls: false,
      credentialsRead: false,
      networkCalled: false,
      externalMutationPerformed: false,
      humanApprovalRequiredForMutation: true,
    },
    truthBoundary: EXPECTED_AI_WORKFORCE_TRUTH_BOUNDARY,
  };
}

function buildWorkforceTrainingRegistry(source) {
  if (source.id !== "seis-ai-workforce-training-plan" || source.status !== "active-local-seed-training-contract") {
    throw new Error("SEIS AI workforce training registry identity or status mismatch");
  }

  const requiredTextFields = ["version", "updatedAt", "purpose", "qualityGate", "automationCommand", "truthBoundary"];
  if (requiredTextFields.some((field) => typeof source[field] !== "string" || source[field].trim().length === 0) ||
      !source.qualityGate.startsWith("npm run check:") ||
      !source.automationCommand.startsWith("npm run automation:")) {
    throw new Error("SEIS AI workforce training registry metadata is incomplete");
  }

  if (source.truthBoundary !== EXPECTED_AI_WORKFORCE_TRAINING_TRUTH_BOUNDARY) {
    throw new Error("SEIS AI workforce training registry truth boundary is incomplete");
  }

  const trainingMeaning = source.trainingMeaning || {};
  if (typeof trainingMeaning.currentMeaning !== "string" || trainingMeaning.currentMeaning.trim().length === 0 ||
      !Array.isArray(trainingMeaning.notMeaning) || trainingMeaning.notMeaning.length === 0 ||
      trainingMeaning.notMeaning.some((term) => typeof term !== "string" || term.trim().length === 0)) {
    throw new Error("SEIS AI workforce training meaning is incomplete");
  }

  const launcherEvidence = source.currentLauncherEvidence || {};
  if (launcherEvidence.command !== AI_WORKFORCE_TRAINING_LAUNCHER_EVIDENCE.command ||
      launcherEvidence.observedDate !== AI_WORKFORCE_TRAINING_LAUNCHER_EVIDENCE.observedDate ||
      JSON.stringify(launcherEvidence.notes) !== JSON.stringify(AI_WORKFORCE_TRAINING_LAUNCHER_EVIDENCE.notes) ||
      !Array.isArray(launcherEvidence.installedRoutes) || launcherEvidence.installedRoutes.length === 0 ||
      !Array.isArray(launcherEvidence.missingOrDisabledRoutes) || launcherEvidence.missingOrDisabledRoutes.length === 0) {
    throw new Error("SEIS AI workforce training launcher evidence is incomplete");
  }
  validateLocalEvidenceDate(launcherEvidence.observedDate, "SEIS AI workforce training launcher evidence");

  const trainerRoles = Array.isArray(source.trainerRoles) ? source.trainerRoles : [];
  if (trainerRoles.length !== 10) {
    throw new Error("SEIS AI workforce training registry must expose exactly ten trainer roles");
  }
  const roleIDs = trainerRoles.map((role) => role.id);
  if (roleIDs.some((id) => typeof id !== "string" || id.trim().length === 0) ||
      new Set(roleIDs).size !== roleIDs.length) {
    throw new Error("SEIS AI workforce training registry contains invalid or duplicate trainer role IDs");
  }
  const publicTrainerRoles = trainerRoles.map((role) => {
    const textFields = ["displayName", "routeStatus", "trainingRole", "allowedContribution", "outputStatus"];
    if (textFields.some((field) => typeof role[field] !== "string" || role[field].trim().length === 0) ||
        !AI_WORKFORCE_TRAINER_ROUTE_STATUSES.has(role.routeStatus) ||
        role.secretAccessAllowed !== false || role.liveProviderCallAllowed !== false || role.externalTrainingAllowed !== false) {
      throw new Error(`SEIS AI trainer role ${role.id || "unknown"} violates the local-only training boundary`);
    }
    return {
      id: role.id,
      displayName: role.displayName,
      routeStatus: role.routeStatus,
      trainingRole: role.trainingRole,
      allowedContribution: role.allowedContribution,
      secretAccessAllowed: false,
      liveProviderCallAllowed: false,
      externalTrainingAllowed: false,
      outputStatus: role.outputStatus,
    };
  });

  const trainingLoops = Array.isArray(source.trainingLoops) ? source.trainingLoops : [];
  if (trainingLoops.length !== 7) {
    throw new Error("SEIS AI workforce training registry must expose exactly seven training loops");
  }
  const loopIDs = trainingLoops.map((loop) => loop.id);
  if (loopIDs.some((id) => typeof id !== "string" || id.trim().length === 0) ||
      new Set(loopIDs).size !== loopIDs.length) {
    throw new Error("SEIS AI workforce training registry contains invalid or duplicate loop IDs");
  }
  const publicTrainingLoops = trainingLoops.map((loop) => {
    const textFields = ["owner", "input", "output", "acceptanceGate"];
    if (textFields.some((field) => typeof loop[field] !== "string" || loop[field].trim().length === 0)) {
      throw new Error(`SEIS AI training loop ${loop.id || "unknown"} is incomplete`);
    }
    return {
      id: loop.id,
      owner: loop.owner,
      input: loop.input,
      output: loop.output,
      acceptanceGate: loop.acceptanceGate,
    };
  });

  const modelTargets = Array.isArray(source.modelTargets) ? source.modelTargets : [];
  if (modelTargets.length !== 4) {
    throw new Error("SEIS AI workforce training registry must expose exactly four model targets");
  }
  const modelTargetIDs = modelTargets.map((target) => target.id);
  if (modelTargetIDs.some((id) => typeof id !== "string" || id.trim().length === 0) ||
      new Set(modelTargetIDs).size !== modelTargetIDs.length) {
    throw new Error("SEIS AI workforce training registry contains invalid or duplicate model target IDs");
  }
  const publicModelTargets = modelTargets.map((target) => {
    const textFields = ["purpose", "datasetPath", "artifactPath", "trainingCommand", "validationCommand"];
    if (textFields.some((field) => typeof target[field] !== "string" || target[field].trim().length === 0) ||
        target.runtimeAuthority !== false) {
      throw new Error(`SEIS AI model target ${target.id || "unknown"} violates the no-runtime-authority boundary`);
    }
    return {
      id: target.id,
      purpose: target.purpose,
      datasetPath: target.datasetPath,
      artifactPath: target.artifactPath,
      trainingCommand: target.trainingCommand,
      validationCommand: target.validationCommand,
      runtimeAuthority: false,
    };
  });

  const safetyRules = Array.isArray(source.safetyRules) ? source.safetyRules : [];
  const acceptanceGates = Array.isArray(source.acceptanceGates) ? source.acceptanceGates : [];
  if (safetyRules.length === 0 || safetyRules.some((rule) => typeof rule !== "string" || rule.trim().length === 0) ||
      acceptanceGates.length === 0 || acceptanceGates.some((gate) => typeof gate !== "string" || gate.trim().length === 0)) {
    throw new Error("SEIS AI workforce training safety or acceptance records are incomplete");
  }

  return {
    id: source.id,
    version: source.version,
    status: "source-backed-metadata-only",
    source: AI_WORKFORCE_TRAINING_PATH,
    updatedAt: source.updatedAt,
    purpose: source.purpose,
    qualityGate: source.qualityGate,
    automationCommand: source.automationCommand,
    sourceOfTruth: source.sourceOfTruth,
    truthBoundary: EXPECTED_AI_WORKFORCE_TRAINING_TRUTH_BOUNDARY,
    trainingMeaning: {
      currentMeaning: trainingMeaning.currentMeaning,
      notMeaning: trainingMeaning.notMeaning,
    },
    currentLauncherEvidence: {
      command: launcherEvidence.command,
      observedDate: launcherEvidence.observedDate,
      notes: launcherEvidence.notes,
      installedRoutes: launcherEvidence.installedRoutes,
      missingOrDisabledRoutes: launcherEvidence.missingOrDisabledRoutes,
    },
    trainerRoles: publicTrainerRoles,
    trainingLoops: publicTrainingLoops,
    modelTargets: publicModelTargets,
    safetyRules,
    acceptanceGates,
    runtimeBoundary: {
      trainingPerformed: false,
      liveProviderCalls: false,
      credentialsRead: false,
      networkCalled: false,
      externalDatasetDownloaded: false,
      cloudFineTuningPerformed: false,
      externalMutationPerformed: false,
      runtimeAuthority: false,
      humanApprovalRequiredForLiveActions: true,
    },
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

function validateLocalEvidenceDate(observedDate, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(observedDate)) {
    throw new Error(`${label} must use YYYY-MM-DD evidence dates`);
  }
  const observed = Date.parse(`${observedDate}T00:00:00Z`);
  const today = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(observed) || observed > today) {
    throw new Error(`${label} must not be a future evidence date`);
  }
  const ageDays = Math.floor((today - observed) / 86_400_000);
  if (ageDays > MAX_LOCAL_EVIDENCE_AGE_DAYS) {
    throw new Error(`${label} is stale by ${ageDays} days; refresh the local route evidence`);
  }
}

function readJson(repoRoot, relativePath) {
  return JSON.parse(readFileSync(path.join(repoRoot, ...relativePath.split("/")), "utf8"));
}
