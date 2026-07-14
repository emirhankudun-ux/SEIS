import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  AI_CORE_RUNTIME_SNAPSHOT_ID,
  buildAiCoreRuntimeSnapshot,
} from "../src/model/core-runtime-snapshot.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

describe("SEIS AI Core runtime snapshot", () => {
  it("joins provider, router, plugin, lane, and MCP evidence without runtime authority", () => {
    const snapshot = buildAiCoreRuntimeSnapshot(repoRoot);

    assert.equal(snapshot.id, AI_CORE_RUNTIME_SNAPSHOT_ID);
    assert.equal(snapshot.status, "local-readiness-linked");
    assert.equal(snapshot.mode, "Local Demo");
    assert.equal(snapshot.applicationIntegration.id, "seis-ai-core-application-integration");
    assert.equal(snapshot.applicationIntegration.status, "active-read-only");
    assert.equal(snapshot.applicationIntegration.nativeConsumer.id, "seis-platform-kit");
    assert.equal(snapshot.applicationIntegration.nativeConsumer.runtimeAuthority, false);
    assert.equal(snapshot.applicationIntegration.delivery.artifactTracked, true);
    assert.equal(snapshot.applicationIntegration.runtimeBoundary.providerCallsPerformed, false);
    assert.equal(snapshot.applicationIntegration.runtimeBoundary.promptBodiesIncluded, false);
    assert.equal(snapshot.applicationIntegration.runtimeBoundary.humanApprovalRequiredForLiveActions, true);
    assert.equal(snapshot.providerRegistry.coreCredentialRequirement, "none");
    assert.equal(snapshot.providerRegistry.environmentValidation.status, "validated-no-network");
    assert.equal(snapshot.providerRegistry.environmentValidation.secretValuesReturned, false);
    assert.equal(snapshot.providerRegistry.environmentValidation.credentialAuthenticationPerformed, false);
    assert.equal(snapshot.providerRegistry.environmentValidation.networkCalled, false);
    assert.equal(snapshot.providerRegistry.providerCount, 7);
    assert.equal(snapshot.providerRegistry.missingKeyProviderCount, 3);
    assert.equal(snapshot.pluginMesh.installedEnabledCount, 185);
    assert.equal(snapshot.pluginMesh.helperUniquePlugins, 300);
    assert.equal(snapshot.pluginMesh.personalLaneCount, 5);
    assert.equal(snapshot.pluginMesh.personalLaneToolCount, 10);
    assert.equal(snapshot.pluginMesh.capabilityCatalog.id, "seis-plugin-capability-catalog");
    assert.equal(snapshot.pluginMesh.capabilityCatalog.status, "source-backed-read-only");
    assert.equal(snapshot.pluginMesh.capabilityCatalog.pluginCount, 6);
    assert.equal(snapshot.pluginMesh.capabilityCatalog.personalPluginCount, 5);
    assert.equal(snapshot.pluginMesh.capabilityCatalog.specialistPluginCount, 4);
    assert.equal(snapshot.pluginMesh.capabilityCatalog.manifestCapabilityCount, 67);
    assert.equal(snapshot.pluginMesh.capabilityCatalog.personalManifestCapabilityCount, 51);
    assert.equal(snapshot.pluginMesh.capabilityCatalog.specialistManifestCapabilityCount, 31);
    assert.equal(snapshot.pluginMesh.capabilityCatalog.profileCount, 4);
    assert.equal(snapshot.pluginMesh.capabilityCatalog.profileQualityCommandCount, 18);
    assert.equal(snapshot.pluginMesh.capabilityCatalog.qualityCommandGaps.length, 0);
    assert.deepEqual(snapshot.pluginMesh.capabilityCatalog.missingProfilePaths, ["plugins/seis/assets/lane-profile.json"]);
    assert.ok(snapshot.pluginMesh.capabilityCatalog.plugins.every((plugin) => plugin.manifestStatus === "source-backed"));
    assert.equal(snapshot.pluginMesh.capabilityCatalog.boundary.localReadOnly, true);
    assert.equal(snapshot.pluginMesh.capabilityCatalog.boundary.blanketActivationClaimed, false);
    assert.equal(snapshot.installedCapabilityInventory.id, "seis-installed-capability-inventory");
    assert.equal(snapshot.installedCapabilityInventory.status, "source-backed-metadata-only");
    assert.equal(snapshot.installedCapabilityInventory.bigTech.installedSkillCount, 38);
    assert.equal(snapshot.installedCapabilityInventory.bigTech.cliToolProfiles.length, 3);
    assert.equal(snapshot.installedCapabilityInventory.bigTech.projectMCPConfigurations.length, 3);
    assert.equal(snapshot.installedCapabilityInventory.bigTech.currentSessionMCPSurfaceCount, 17);
    assert.equal(snapshot.installedCapabilityInventory.bigTech.localAppCount, 8);
    assert.equal(snapshot.installedCapabilityInventory.bigTech.pendingConnectorInstallCount, 1);
    assert.equal(snapshot.installedCapabilityInventory.nvidia.skillManifestCount, 11);
    assert.equal(snapshot.installedCapabilityInventory.nvidia.integrationIDs.length, 11);
    assert.equal(snapshot.installedCapabilityInventory.nvidia.runtimeBlockedCount, 8);
    assert.equal(snapshot.installedCapabilityInventory.runtimeBoundary.runtimeAuthority, false);
    assert.equal(snapshot.installedCapabilityInventory.runtimeBoundary.credentialsRead, false);
    assert.equal(snapshot.installedCapabilityInventory.runtimeBoundary.networkCalled, false);
    assert.equal(snapshot.installedCapabilityInventory.runtimeBoundary.externalMutationPerformed, false);
    assert.equal(snapshot.installedCapabilityInventory.runtimeBoundary.humanApprovalRequiredForActivation, true);
    assert.equal(snapshot.workforceAssignmentRegistry.id, "seis-ai-workforce-assignments");
    assert.equal(snapshot.workforceAssignmentRegistry.status, "source-backed-metadata-only");
    assert.equal(snapshot.workforceAssignmentRegistry.assignmentCount, 10);
    assert.equal(snapshot.workforceAssignmentRegistry.writerPolicy.primaryWriter, "codex");
    assert.equal(snapshot.workforceAssignmentRegistry.assignments.length, 10);
    assert.equal(snapshot.workforceAssignmentRegistry.workflow.length, 10);
    assert.equal(snapshot.workforceAssignmentRegistry.launcherEvidence.command, "npm run ai -- list");
    assert.equal(snapshot.workforceAssignmentRegistry.launcherEvidence.observedDate, "2026-06-23");
    assert.ok(snapshot.workforceAssignmentRegistry.approvalRequiredFor.includes("merge"));
    assert.match(snapshot.workforceAssignmentRegistry.truthBoundary, /not live-model/);
    assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.executionAuthority, false);
    assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.providerCalls, false);
    assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.credentialsRead, false);
    assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.networkCalled, false);
    assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.externalMutationPerformed, false);
    assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.humanApprovalRequiredForMutation, true);
    assert.equal(snapshot.workforceTrainingRegistry.id, "seis-ai-workforce-training-plan");
    assert.equal(snapshot.workforceTrainingRegistry.status, "source-backed-metadata-only");
    assert.equal(snapshot.workforceTrainingRegistry.trainerRoles.length, 10);
    assert.equal(snapshot.workforceTrainingRegistry.trainingLoops.length, 7);
    assert.equal(snapshot.workforceTrainingRegistry.modelTargets.length, 4);
    assert.ok(snapshot.workforceTrainingRegistry.trainerRoles.every((role) => role.secretAccessAllowed === false));
    assert.ok(snapshot.workforceTrainingRegistry.trainerRoles.every((role) => role.liveProviderCallAllowed === false));
    assert.ok(snapshot.workforceTrainingRegistry.trainerRoles.every((role) => role.externalTrainingAllowed === false));
    assert.ok(snapshot.workforceTrainingRegistry.modelTargets.every((target) => target.runtimeAuthority === false));
    assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.trainingPerformed, false);
    assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.liveProviderCalls, false);
    assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.credentialsRead, false);
    assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.externalDatasetDownloaded, false);
    assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.cloudFineTuningPerformed, false);
    assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.runtimeAuthority, false);
    assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.humanApprovalRequiredForLiveActions, true);
    assert.equal(snapshot.pluginMesh.mcpMesh.serverCount, 6);
    assert.equal(snapshot.pluginMesh.mcpMesh.configuredServerCount, 6);
    assert.equal(snapshot.pluginMesh.mcpMesh.status, "probe-verified-local-read-only");
    assert.equal(snapshot.pluginMesh.mcpMesh.boundary.liveSessionStarted, false);
    assert.equal(snapshot.pluginMesh.mcpMesh.boundary.localProbePerformed, true);
    assert.equal(snapshot.pluginMesh.mcpMesh.probe.lifecycle, "initialize -> notifications/initialized -> tools/list -> allowlisted status tool");
    assert.equal(snapshot.pluginMesh.mcpMesh.probe.safeToolCallsPerformed, true);
    assert.equal(snapshot.pluginMesh.mcpMesh.probe.safeToolProbeCount, 6);
    assert.equal(snapshot.pluginMesh.mcpMesh.servers.reduce((sum, server) => sum + server.toolInventory.toolCount, 0), 38);
    assert.ok(snapshot.pluginMesh.mcpMesh.servers.every((server) => server.toolInventory.mode === "stdio-probe"));
    assert.ok(snapshot.pluginMesh.mcpMesh.servers.every((server) => server.safeToolProbe.status === "verified"));
    assert.equal(snapshot.agentRegistry.managedLaneCount, 9);
    assert.equal(snapshot.agentRegistry.agentCount, 13);
    assert.equal(snapshot.agentRegistry.id, "seis-second-brain-system");
    assert.equal(snapshot.agentRegistry.mode, "local-demo");
    assert.equal(snapshot.agentRegistry.decision, "NO-GO-autonomous-execution-not-approved");
    assert.equal(snapshot.agentRegistry.source, "content/development/seis-second-brain-system.json");
    assert.equal(snapshot.agentRegistry.runtimeAuthority, false);
    assert.equal(snapshot.agentRegistry.permissionBoundary, "status-and-plan-only");
    assert.equal(snapshot.agentPermissionMatrixRegistry.id, "seis-ai-core-agent-permission-matrix");
    assert.equal(snapshot.agentPermissionMatrixRegistry.status, "source-backed-metadata-only");
    assert.equal(snapshot.agentPermissionMatrixRegistry.runtimeBoundary, "status-and-plan-only");
    assert.equal(snapshot.agentPermissionMatrixRegistry.enabledLevelCount, 2);
    assert.deepEqual(
      snapshot.agentPermissionMatrixRegistry.levels.map((level) => [level.level, level.status, level.approvalRequired]),
      [
        ["read-only", "enabled", false],
        ["plan-only", "enabled", false],
        ["write-gated", "planned", "task-scoped"],
        ["external-gated", "planned", true],
        ["forbidden", "active", "separate security and recovery plan required"]
      ]
    );
    assert.equal(snapshot.agentPermissionMatrixRegistry.forbiddenWithoutSeparatePlan.length, 7);
    assert.ok(snapshot.agentPermissionMatrixRegistry.forbiddenWithoutSeparatePlan.includes("credential access"));
    assert.ok(snapshot.agentPermissionMatrixRegistry.forbiddenWithoutSeparatePlan.includes("unrestricted shell execution"));
    assert.match(snapshot.agentPermissionMatrixRegistry.truthBoundary, /do not grant runtime authority/);
    assert.equal(snapshot.subagentRuntimeFixturesRegistry.id, "seis-ai-core-subagent-runtime-fixtures");
    assert.equal(snapshot.subagentRuntimeFixturesRegistry.status, "source-backed-metadata-only");
    assert.equal(snapshot.subagentRuntimeFixturesRegistry.fixtureCount, 7);
    assert.deepEqual(snapshot.subagentRuntimeFixturesRegistry.fixtureIds, [
      "role-schema",
      "permission-matrix",
      "dry-run-task-queue",
      "cancellation-fixture",
      "approval-fixture",
      "redaction-fixture",
      "execution-ledger-fixture"
    ]);
    assert.equal(snapshot.subagentRuntimeFixturesRegistry.executionLedgerFixture.mode, "append-only-planned");
    assert.equal(snapshot.subagentRuntimeFixturesRegistry.executionLedgerFixture.writerPolicy, "single-writer");
    assert.equal(snapshot.subagentRuntimeFixturesRegistry.executionLedgerFixture.requiredFieldCount, 19);
    assert.equal(snapshot.subagentRuntimeFixturesRegistry.executionLedgerFixture.sampleRecordCount, 1);
    assert.equal(snapshot.subagentRuntimeFixturesRegistry.executionLedgerFixture.sampleRecord.decision, "cancelled");
    assert.equal(snapshot.subagentRuntimeFixturesRegistry.executionLedgerFixture.sampleRecord.fileMutationPerformed, false);
    assert.equal(snapshot.subagentRuntimeFixturesRegistry.executionLedgerFixture.sampleRecord.externalMutationPerformed, false);
    assert.match(snapshot.subagentRuntimeFixturesRegistry.truthBoundary, /do not execute agents/);
    assert.equal(snapshot.mcpRuntime.toolCount, 37);
    assert.equal(snapshot.mcpRuntime.resourceCount, 30);
    assert.equal(snapshot.mcpRuntime.promptCount, 3);
    assert.equal(snapshot.mcpRuntime.transport, "stdio newline-delimited JSON-RPC");
    assert.equal(snapshot.mcpRuntime.lifecycle, "initialize -> notifications/initialized -> tools/list");
    assert.equal(snapshot.router.scenarioCount, 7);
    assert.equal(snapshot.sourceOfTruth.routerRuntime, "content/development/seis-ai-core-read-only-router-runtime.json");

    assert.deepEqual(
      snapshot.pluginMesh.personalLanes.map((lane) => lane.id),
      ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]
    );
    assert.deepEqual(
      snapshot.agentRegistry.managedLanes.map((lane) => lane.id),
      ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data", "seis-security", "seis-research", "seis-automation", "seis-product"]
    );
    assert.ok(snapshot.agentRegistry.agents.every((agent) => agent.executionAuthority === false));
    assert.ok(snapshot.agentRegistry.agents.some((agent) => agent.id === "security-agent" && agent.status === "blocking-review-gate"));
    assert.ok(Object.values(snapshot.agentRegistry.safetyBoundary).every((value) => value === false));

    const routedLaneIds = new Set(snapshot.router.scenarios.map((scenario) => scenario.decision.agentLane.id));
    for (const laneId of ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]) {
      assert.ok(routedLaneIds.has(laneId), `${laneId} should have a source-backed route scenario`);
    }

    for (const scenario of snapshot.router.scenarios) {
      assert.equal(scenario.decision.routeEligible, false);
      assert.equal(scenario.decision.executionPerformed, false);
      assert.equal(scenario.decision.providerCallsPerformed, false);
      assert.equal(scenario.decision.fallbackUsed, false);
      assert.equal(scenario.decision.providerMediation.mode, "backend-only");
      assert.equal(scenario.decision.providerMediation.frontendSecretAllowed, false);
      assert.equal(scenario.decision.providerMediation.routeExecutionEnabled, false);
      assert.equal(scenario.decision.providerMediation.status, "required-before-live-routing");
      assert.equal(scenario.decision.decisionIntegrity.readOnlyOnly, true);
      assert.equal(scenario.decision.decisionIntegrity.runtimeAuthority, false);
      assert.equal(scenario.decision.decisionIntegrity.backendOnlyProvidersRequired, true);
      assert.equal(scenario.decision.decisionIntegrity.privateObsidianContentRoutable, false);
      assert.equal(scenario.decision.agentLane.permissionBoundary, "plan-only");
      assert.ok(["verified", "fail-closed"].includes(scenario.decision.agentLane.permissionSourceStatus));
      assert.equal(scenario.decision.safetyBoundary.credentialsRead, false);
      assert.equal(scenario.decision.safetyBoundary.networkCalled, false);
      assert.ok(scenario.decision.blockedReasons.length > 0);
      assert.match(scenario.decision.decisionHash, /^[a-f0-9]{64}$/);
    }

    assert.equal(snapshot.runtimeBoundary.providerCalls, false);
    assert.equal(snapshot.runtimeBoundary.liveMcpSessionStarted, false);
    assert.equal(snapshot.runtimeBoundary.sshExecuted, false);
    assert.equal(snapshot.runtimeBoundary.deploymentPerformed, false);
    assert.equal(snapshot.runtimeBoundary.githubMutationPerformed, false);
    assert.equal(snapshot.runtimeBoundary.humanApprovalRequiredForLiveActions, true);
  });
});
