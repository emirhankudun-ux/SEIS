import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);

test("SEIS Command Center shell exposes required modules", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  for (const label of [
    "Dashboard",
    "God Mode",
    "Goals",
    "Repositories",
    "Documentation",
    "Agents",
    "Plugins",
    "Automation",
    "Security",
    "Architecture",
    "Knowledge"
  ]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  assert.match(html, /SEIS Command Center/);
  assert.match(html, /id="command-dialog"/);
  assert.match(html, /id="settings-dialog"/);
});

test("SEIS Command Center script implements local workflows", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  assert.match(script, /localStorage/);
  assert.match(script, /goal-form/);
  assert.match(script, /repositoryFilter/);
  assert.match(script, /activeAgent/);
  assert.match(script, /pluginFamilies/);
  assert.match(script, /automationWorkflows/);
  assert.match(script, /godModeLanes/);
  assert.match(script, /godModeProtocol/);
  assert.match(script, /seisAiSetup/);
  assert.match(script, /godModeGuardrails/);
  assert.match(script, /godModeArtifacts/);
  assert.match(script, /godModeRuns/);
  assert.match(script, /renderGodMode/);
  assert.match(script, /fallbackSeisRouterLanes/);
  assert.match(script, /renderSeisRouter/);
  assert.match(script, /loadSeisRouterArtifact/);
  assert.match(script, /renderMissionRoutePreview/);
  assert.match(script, /predictMissionRoute/);
  assert.match(script, /laneId: route\.laneId/);
  assert.match(script, /tool: route\.tool/);
  assert.match(script, /defaultGate,/);
  assert.match(script, /routeSource: route\.routeSource/);
  assert.match(script, /Object\.hasOwn\(viewMeta, next\.activeView\)/);
  assert.match(script, /getAiCoreScenarioForRoute/);
  assert.match(script, /providerState: runtimeDecision/);
  assert.match(script, /executionPerformed: false/);
  assert.match(script, /providerCallsPerformed: false/);
  assert.match(script, /status: "Review"/);
  assert.match(script, /handlePrimaryAction/);
  assert.match(script, /window\.location\.assign\("search-center\.html"\)/);
  assert.match(script, /operationsReadiness/);
  assert.match(script, /renderOperationsReadiness/);
  assert.match(script, /featureGrowthLedger/);
  assert.match(script, /renderFeatureGrowthLedger/);
  assert.match(script, /workflowRuns/);
  assert.match(script, /approvalGates/);
  assert.match(script, /rollbackEvidence/);
  assert.match(script, /securityReports/);
  assert.match(script, /permissionReviews/);
  assert.match(script, /dependencyScans/);
  assert.match(script, /securityAudits/);
  assert.match(script, /aiSystems/);
  assert.match(script, /operatingDomains/);
  assert.match(script, /platformPhases/);
  assert.match(script, /dependencyGraph/);
  assert.match(script, /moduleRelationships/);
  assert.match(script, /technicalDebtRegister/);
  assert.match(script, /recentActivity/);
  assert.match(script, /dependencyRisk/);
  assert.match(script, /renderAgentDetail/);
  assert.match(script, /orchestrationLanes/);
  assert.match(script, /handoffAudit/);
  assert.match(script, /agent-routing-matrix/);
  assert.match(script, /renderAgentRoutingMatrix/);
  assert.match(script, /knowledgeGraphNodes/);
  assert.match(script, /knowledgeEdges/);
  assert.match(script, /memoryEvidence/);
  assert.match(script, /decisionHistory/);
  assert.match(script, /reusablePatterns/);
  assert.match(script, /openCommandPalette/);
});

test("SEIS Command Center exposes 10-lane router contract", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const artifact = JSON.parse(await readFile(new URL("data/seis-router-routes.json", root), "utf8"));
  assert.match(html, /10-Lane SEIS Router/);
  assert.match(html, /id="mission-route-preview"/);
  assert.match(html, /id="seis-router-lanes"/);
  assert.match(html, /id="agent-routing-matrix"/);
  assert.match(script, /data\/seis-router-routes\.json/);
  assert.match(script, /extractMissionRouteFeatures/);
  assert.match(script, /scoreMissionRoute/);
  assert.equal(artifact.sourcePolicy, "scripts/ai-routing-policy.cjs#chooseAutoRoute");
  assert.ok(artifact.policy?.routeHints?.length > 0);
  assert.ok(artifact.model?.labels?.length >= 10);
  assert.equal(artifact.routes.length, 10);
  for (const lane of [
    "seis",
    "seis-governance",
    "seis-cloud",
    "seis-code",
    "seis-design",
    "seis-data",
    "seis-security",
    "seis-research",
    "seis-automation",
    "seis-product"
  ]) {
    assert.ok(artifact.routes.some((route) => route.laneId === lane), `${lane} should exist in router artifact`);
  }
  for (const field of ["tool", "defaultGate", "integrationTool"]) {
    assert.ok(artifact.routes.every((route) => field in route), `${field} should exist on every route`);
  }
});

test("SEIS Command Center agents expose operational evidence", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  for (const field of ["capabilities", "tasks", "logs", "outputs"]) {
    assert.match(script, new RegExp(`${field}: \\[`));
  }
});

test("SEIS Command Center supports multi-model orchestration", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  for (const model of ["OpenAI", "Claude", "Gemini", "Qwen", "Local Models", "Future AI Systems"]) {
    assert.match(script, new RegExp(`name: "${model}"|primary: "${model}"`));
  }
  for (const lane of ["Plan", "Build", "Validate", "Counter-Review", "Private Draft", "Future Adapter"]) {
    assert.match(script, new RegExp(`lane: "${lane}"`));
  }
});

test("SEIS Command Center binds specialist lanes and Store through a local control plane", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const css = await readFile(new URL("styles.css", root), "utf8");
  const registry = JSON.parse(await readFile(new URL("data/seis-core-ecosystem-registry.json", root), "utf8"));

  for (const id of ["ecosystem-control-state", "ecosystem-control-summary", "ecosystem-control-grid", "ecosystem-lane-detail", "ecosystem-control-feedback"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const signal of [
    "fallbackSeisCoreEcosystemRegistry",
    "renderEcosystemControlPlane",
    "validateEcosystemRegistryForBrowser",
    "loadSeisCoreEcosystemRegistry",
    "data-ecosystem-lane",
    "copyEcosystemGate"
  ]) {
    assert.match(script, new RegExp(signal));
  }
  for (const selector of [
    "ecosystem-control-plane",
    "ecosystem-control-layout",
    "ecosystem-lane-button",
    "ecosystem-lane-detail",
    "ecosystem-boundary-strip",
    "ecosystem-term-list",
    "ecosystem-lane-actions"
  ]) {
    assert.match(css, new RegExp(selector));
  }
  assert.equal(registry.id, "seis-core-ecosystem-registry");
  assert.equal(registry.schemaVersion, "2.0.0");
  assert.equal(registry.status, "source-backed-local-demo");
  assert.deepEqual(registry.counts, {
    coreLanes: 6,
    bundledPluginSources: 6,
    repoSkills: 25,
    auditedInstalledEnabledPlugins: 185,
    cataloguedHelperPlugins: 300,
    providers: 7,
    mcpTools: 37,
    mcpResources: 30,
    mcpPrompts: 3,
    productModules: 18,
    dataContracts: 18,
    validatedDataContracts: 16,
    designComponents: 12,
    validatedDesignComponents: 12,
    managedAgentRoles: 13
  });
  assert.equal(registry.runtimeBoundary.browserLocalReadOnly, true);
  assert.equal(registry.runtimeBoundary.humanApprovalRequiredForExternalMutation, true);
  for (const lane of ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data", "seis-store"]) {
    const record = registry.lanes.find((candidate) => candidate.id === lane);
    assert.ok(record, `${lane} should have a Core control-plane record`);
    assert.ok(record.route.href, `${lane} should have a direct local route`);
    assert.ok(record.qualityGates.every((gate) => /^npm run check:/.test(gate) || gate === "npm run seis:check"));
    assert.equal(record.executionAuthority, false);
    assert.equal(record.mcp.executionAuthority, false);
    assert.equal(record.status === "Connected", false, `${lane} must not claim a live connection`);
  }
  const sshBinding = registry.lanes.find((candidate) => candidate.id === "seis-cloud")?.sshBinding;
  assert.equal(sshBinding?.alias, "SEIS-SSH");
  assert.equal(sshBinding?.contract, "deploy/seis-ssh-public-access-contract.json");
  assert.equal(sshBinding?.serverAndPortPolicy, "preserve-existing-server-and-port");
  assert.equal(sshBinding?.serverOrPortChanged, false);
  assert.equal(sshBinding?.strictReady, false);
  assert.equal(sshBinding?.runtimeMode, "status-and-plan-only");
  assert.match(script, /sshBinding/);
  assert.match(script, /SSH evidence/);
});

test("SEIS Command Center binds the source-backed AI Core runtime snapshot", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const css = await readFile(new URL("styles.css", root), "utf8");
  const snapshot = JSON.parse(await readFile(new URL("data/seis-ai-core-runtime-snapshot.json", root), "utf8"));

  for (const id of [
    "ai-core-runtime-state",
    "ai-core-runtime-summary",
    "ai-core-provider-grid",
    "ai-core-scenario-list",
    "ai-core-decision",
    "ai-core-mesh-strip",
    "ai-core-runtime-feedback",
    "ai-workforce-registry-state",
    "ai-workforce-registry-summary",
    "ai-workforce-assignment-list",
    "ai-workforce-assignment-detail",
    "ai-workforce-registry-feedback",
    "ai-training-registry-state",
    "ai-training-registry-summary",
    "ai-training-role-list",
    "ai-training-role-detail",
    "ai-training-loop-list",
    "ai-training-target-list",
    "ai-training-registry-feedback"
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }

  for (const signal of [
    "fallbackSeisAiCoreRuntimeSnapshot",
    "renderAiCoreRuntime",
    "renderManagedAgentRegistry",
    "renderAIWorkforceRegistry",
    "renderAIWorkforceTrainingRegistry",
    "loadSeisAiCoreRuntimeSnapshot",
    "getActiveAiCoreScenario",
    "copyAiCoreDecision",
    "data-ai-core-capability-inventory",
    "data-ai-workforce-assignment",
    "data-ai-training-role",
    "data-ai-training-loop",
    "data-ai-training-target",
    "data/seis-ai-core-runtime-snapshot.json"
  ]) {
    assert.match(script, new RegExp(signal.replaceAll("/", "\\/")));
  }

  for (const selector of [
    "ai-core-runtime-panel",
    "ai-core-summary-card",
    "ai-core-provider-card",
    "ai-core-scenario-button",
    "ai-core-decision-card",
    "ai-core-mesh-strip",
    "ai-workforce-registry-panel",
    "ai-workforce-summary-item",
    "ai-workforce-assignment-button",
    "ai-workforce-assignment-detail",
    "ai-training-registry-panel",
    "ai-training-summary-item",
    "ai-training-role-button",
    "ai-training-role-detail",
    "ai-training-loop",
    "ai-training-target"
  ]) {
    assert.match(css, new RegExp(`\\.${selector}`));
  }

  assert.equal(snapshot.id, "seis-ai-core-runtime-snapshot");
  assert.equal(snapshot.status, "local-readiness-linked");
  assert.equal(snapshot.mode, "Local Demo");
  assert.equal(snapshot.providerRegistry.coreCredentialRequirement, "none");
  assert.equal(snapshot.providerRegistry.providerCount, 7);
  assert.equal(snapshot.providerRegistry.missingKeyProviderCount, 3);
  assert.equal(snapshot.pluginMesh.installedEnabledCount, 185);
  assert.equal(snapshot.pluginMesh.helperUniquePlugins, 300);
  assert.equal(snapshot.pluginMesh.personalLaneCount, 5);
  assert.equal(snapshot.pluginMesh.personalLaneToolCount, 10);
  assert.equal(snapshot.installedCapabilityInventory.bigTech.installedSkillCount, 38);
  assert.equal(snapshot.installedCapabilityInventory.bigTech.cliToolProfiles.length, 3);
  assert.equal(snapshot.installedCapabilityInventory.bigTech.currentSessionMCPSurfaceCount, 17);
  assert.equal(snapshot.installedCapabilityInventory.nvidia.integrationIDs.length, 11);
  assert.equal(snapshot.installedCapabilityInventory.runtimeBoundary.runtimeAuthority, false);
  assert.equal(snapshot.installedCapabilityInventory.runtimeBoundary.humanApprovalRequiredForActivation, true);
  assert.equal(snapshot.workforceAssignmentRegistry.id, "seis-ai-workforce-assignments");
  assert.equal(snapshot.workforceAssignmentRegistry.status, "source-backed-metadata-only");
  assert.equal(snapshot.workforceAssignmentRegistry.assignmentCount, 10);
  assert.equal(snapshot.workforceAssignmentRegistry.writerPolicy.primaryWriter, "codex");
  assert.equal(snapshot.workforceAssignmentRegistry.assignments.length, 10);
  assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.executionAuthority, false);
  assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.providerCalls, false);
  assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.credentialsRead, false);
  assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.externalMutationPerformed, false);
  assert.equal(snapshot.workforceAssignmentRegistry.runtimeBoundary.humanApprovalRequiredForMutation, true);
  assert.equal(snapshot.workforceTrainingRegistry.id, "seis-ai-workforce-training-plan");
  assert.equal(snapshot.workforceTrainingRegistry.status, "source-backed-metadata-only");
  assert.equal(snapshot.workforceTrainingRegistry.trainerRoles.length, 10);
  assert.equal(snapshot.workforceTrainingRegistry.trainingLoops.length, 7);
  assert.equal(snapshot.workforceTrainingRegistry.modelTargets.length, 4);
  assert.ok(snapshot.workforceTrainingRegistry.trainerRoles.every((role) => role.secretAccessAllowed === false));
  assert.ok(snapshot.workforceTrainingRegistry.trainerRoles.every((role) => role.liveProviderCallAllowed === false));
  assert.ok(snapshot.workforceTrainingRegistry.modelTargets.every((target) => target.runtimeAuthority === false));
  assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.trainingPerformed, false);
  assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.liveProviderCalls, false);
  assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.externalDatasetDownloaded, false);
  assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.runtimeAuthority, false);
  assert.equal(snapshot.workforceTrainingRegistry.runtimeBoundary.humanApprovalRequiredForLiveActions, true);
  assert.equal(snapshot.agentRegistry.managedLaneCount, 9);
  assert.equal(snapshot.agentRegistry.agentCount, 13);
  assert.equal(snapshot.agentRegistry.runtimeAuthority, false);
  assert.ok(snapshot.agentRegistry.agents.every((agent) => agent.executionAuthority === false));
  assert.ok(Object.values(snapshot.agentRegistry.safetyBoundary).every((value) => value === false));
  assert.equal(snapshot.mcpRuntime.toolCount, 37);
  assert.equal(snapshot.mcpRuntime.resourceCount, 30);
  assert.equal(snapshot.mcpRuntime.promptCount, 3);
  assert.equal(snapshot.router.scenarioCount, 7);
  assert.ok(snapshot.providerRegistry.providers.some((provider) => provider.publicStatus === "Missing Key"));
  assert.ok(snapshot.router.scenarios.some((scenario) => scenario.decision.providerState === "Disabled"));
  assert.ok(snapshot.router.scenarios.every((scenario) => scenario.decision.routeEligible === false));
  assert.ok(snapshot.router.scenarios.every((scenario) => scenario.decision.executionPerformed === false));
  assert.ok(snapshot.router.scenarios.every((scenario) => scenario.decision.providerCallsPerformed === false));
  assert.equal(snapshot.runtimeBoundary.liveMcpSessionStarted, false);
  assert.equal(snapshot.runtimeBoundary.sshExecuted, false);
  assert.equal(snapshot.runtimeBoundary.deploymentPerformed, false);
  assert.equal(snapshot.runtimeBoundary.githubMutationPerformed, false);
});

test("SEIS Command Center exposes the managed lane and agent registry", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const css = await readFile(new URL("styles.css", root), "utf8");

  for (const id of [
    "managed-agent-registry-state",
    "managed-agent-registry-summary",
    "managed-agent-lanes",
    "managed-agent-list",
    "managed-agent-detail",
    "managed-agent-registry-feedback"
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const signal of ["activeManagedAgentId", "renderManagedAgentRegistry", "data-managed-agent", "humanApprovalRequiredForMutation"]) {
    assert.match(script, new RegExp(signal));
  }
  for (const selector of ["managed-agent-registry-panel", "managed-agent-summary-item", "managed-agent-button", "managed-agent-detail"]) {
    assert.match(css, new RegExp(`\\.${selector}`));
  }
});

test("SEIS Command Center exposes the source-backed AI workforce assignment registry", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const css = await readFile(new URL("styles.css", root), "utf8");

  for (const id of [
    "ai-workforce-registry-state",
    "ai-workforce-registry-summary",
    "ai-workforce-assignment-list",
    "ai-workforce-assignment-detail",
    "ai-workforce-registry-feedback"
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const signal of ["activeAIWorkforceAssignmentId", "renderAIWorkforceRegistry", "data-ai-workforce-assignment", "source-backed-metadata-only"]) {
    assert.match(script, new RegExp(signal));
  }
  for (const selector of ["ai-workforce-registry-panel", "ai-workforce-summary-item", "ai-workforce-assignment-button", "ai-workforce-assignment-detail"]) {
    assert.match(css, new RegExp(`\\.${selector}`));
  }
  assert.match(html, /id="ai-workforce-assignment-detail"[^>]*aria-label="Selected AI workforce assignment detail"/);
});

test("SEIS Command Center exposes the source-backed AI workforce training control plane", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const css = await readFile(new URL("styles.css", root), "utf8");

  for (const id of [
    "ai-training-registry-state",
    "ai-training-registry-summary",
    "ai-training-role-list",
    "ai-training-role-detail",
    "ai-training-loop-list",
    "ai-training-target-list",
    "ai-training-registry-feedback"
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const signal of ["activeAITrainingRoleId", "renderAIWorkforceTrainingRegistry", "data-ai-training-role", "data-ai-training-loop", "data-ai-training-target"]) {
    assert.match(script, new RegExp(signal));
  }
  for (const selector of ["ai-training-registry-panel", "ai-training-summary-item", "ai-training-role-button", "ai-training-role-detail", "ai-training-loop", "ai-training-target"]) {
    assert.match(css, new RegExp(`\\.${selector}`));
  }
  assert.match(html, /id="ai-training-role-detail"[^>]*aria-label="Selected AI workforce training role detail"/);
});


test("SEIS Command Center covers the required ecosystem operating domains", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  for (const domain of [
    "Repositories",
    "AI Agents",
    "MCP Systems",
    "Plugin Systems",
    "Documentation",
    "Architecture Decisions",
    "Roadmap Planning",
    "Goal Tracking",
    "Automation Workflows",
    "Cloud Infrastructure",
    "Knowledge Systems",
    "Security Systems"
  ]) {
    assert.match(script, new RegExp(`name: "${domain}"`));
  }
});

test("SEIS Command Center design system preserves required tokens", async () => {
  const css = await readFile(new URL("styles.css", root), "utf8");
  for (const token of ["--sidebar", "--accent", "--surface", "--radius"]) {
    assert.match(css, new RegExp(token));
  }
  assert.doesNotMatch(css, /html,\s*body\s*{[^}]*overflow-x:/s);
  assert.match(css, /\.sidebar\s*{[^}]*position:\s*sticky/s);
  assert.match(css, /\.topbar\s*{[^}]*position:\s*sticky/s);
  assert.match(css, /plugin-card/);
  assert.match(css, /godmode-workbench/);
  assert.match(css, /mission-composer/);
  assert.match(css, /mission-route-preview/);
  assert.match(css, /route-preview-card/);
  assert.match(css, /lane-chip/);
  assert.match(css, /protocol-step/);
  assert.match(css, /ai-setup-card/);
  assert.match(css, /run-step/);
  assert.match(css, /run-route-meta/);
  assert.match(css, /guardrail-row/);
  assert.match(css, /artifact-card/);
  assert.match(css, /router-lane-card/);
  assert.match(css, /router-facts/);
  assert.match(css, /ai-core-runtime-panel/);
  assert.match(css, /ai-core-provider-card/);
  assert.match(css, /ai-core-scenario-button/);
  assert.match(css, /ai-core-decision-card/);
  assert.match(css, /managed-agent-registry-panel/);
  assert.match(css, /routing-matrix-row/);
  assert.match(css, /operations-readiness-panel/);
  assert.match(css, /readiness-card/);
  assert.match(css, /readiness-row/);
  assert.match(css, /decision-summary-card/);
  assert.match(css, /feature-growth-ledger/);
  assert.match(css, /ledger-row/);
  assert.match(css, /blocker-row/);
  assert.match(css, /automation-card/);
  assert.match(css, /automation-ops-layout/);
  assert.match(css, /workflow-run-row/);
  assert.match(css, /approval-row/);
  assert.match(css, /rollback-row/);
  assert.match(css, /security-card/);
  assert.match(css, /security-ops-layout/);
  assert.match(css, /permission-review-row/);
  assert.match(css, /dependency-scan-row/);
  assert.match(css, /security-audit-row/);
  assert.match(css, /domain-card/);
  assert.match(css, /phase-row/);
  assert.match(css, /architecture-ops-layout/);
  assert.match(css, /dependency-edge/);
  assert.match(css, /relationship-row/);
  assert.match(css, /debt-row/);
  assert.match(css, /activity-row/);
  assert.match(css, /dependency-row/);
  assert.match(css, /agent-detail/);
  assert.match(css, /orchestration-card/);
  assert.match(css, /handoff-row/);
  assert.match(css, /knowledge-map-panel/);
  assert.match(css, /knowledge-node-card/);
  assert.match(css, /knowledge-edge-row/);
  assert.match(css, /memory-evidence-row/);
  assert.match(css, /decision-history-row/);
  assert.match(css, /pattern-card/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("SEIS Command Center knowledge system exposes graph and memory evidence", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  for (const id of [
    "knowledge-node-grid",
    "knowledge-edge-list",
    "memory-evidence-list",
    "decision-history-list",
    "pattern-library"
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const signal of [
    "Repository Memory",
    "Research Sources",
    "Decision History",
    "Reusable Patterns",
    "Security Policy",
    "AI Agent Handoffs"
  ]) {
    assert.match(script, new RegExp(signal));
  }
});
