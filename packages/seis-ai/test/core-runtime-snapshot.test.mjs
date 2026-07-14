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
    assert.equal(snapshot.providerRegistry.providerCount, 7);
    assert.equal(snapshot.providerRegistry.missingKeyProviderCount, 3);
    assert.equal(snapshot.pluginMesh.installedEnabledCount, 185);
    assert.equal(snapshot.pluginMesh.helperUniquePlugins, 300);
    assert.equal(snapshot.pluginMesh.personalLaneCount, 5);
    assert.equal(snapshot.pluginMesh.personalLaneToolCount, 10);
    assert.equal(snapshot.pluginMesh.mcpMesh.serverCount, 6);
    assert.equal(snapshot.pluginMesh.mcpMesh.configuredServerCount, 6);
    assert.equal(snapshot.pluginMesh.mcpMesh.boundary.liveSessionStarted, false);
    assert.equal(snapshot.agentRegistry.managedLaneCount, 9);
    assert.equal(snapshot.agentRegistry.agentCount, 13);
    assert.equal(snapshot.agentRegistry.id, "seis-second-brain-system");
    assert.equal(snapshot.agentRegistry.mode, "local-demo");
    assert.equal(snapshot.agentRegistry.decision, "NO-GO-autonomous-execution-not-approved");
    assert.equal(snapshot.agentRegistry.source, "content/development/seis-second-brain-system.json");
    assert.equal(snapshot.agentRegistry.runtimeAuthority, false);
    assert.equal(snapshot.agentRegistry.permissionBoundary, "status-and-plan-only");
    assert.equal(snapshot.mcpRuntime.toolCount, 37);
    assert.equal(snapshot.mcpRuntime.resourceCount, 30);
    assert.equal(snapshot.mcpRuntime.promptCount, 3);
    assert.equal(snapshot.router.scenarioCount, 7);

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
