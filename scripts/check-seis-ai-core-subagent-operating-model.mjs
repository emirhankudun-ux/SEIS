#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const modelPath = path.join(root, "content", "development", "seis-ai-core-subagent-operating-model.json");
const pluginIntegrationPath = path.join(root, "content", "development", "seis-agent-plugin-integration.json");
const laneStatusPath = path.join(root, "content", "development", "seis-agent-lane-status.json");
const longHorizonPlanPath = path.join(root, "content", "development", "seis-sub-agent-5-year-plan.json");
const swarmRoundLedgerPath = path.join(root, "content", "development", "seis-ai-core-subagent-swarm-round-ledger.json");
const roundExecutionEvidenceLedgerPath = path.join(root, "content", "development", "seis-ai-core-subagent-round-execution-evidence-ledger.json");
const longHorizonReviewPath = path.join(root, "docs", "reviews", "SUB_AGENT_LONG_HORIZON_AUDIT.md");
const roleSchemaPath = path.join(root, "content", "development", "seis-ai-core-agent-role-schema.json");
const permissionMatrixPath = path.join(root, "content", "development", "seis-ai-core-agent-permission-matrix.json");
const dryRunTaskQueuePath = path.join(root, "content", "development", "seis-ai-core-dry-run-task-queue.json");
const cancellationFixturePath = path.join(root, "content", "development", "seis-ai-core-cancellation-fixture.json");
const approvalFixturePath = path.join(root, "content", "development", "seis-ai-core-approval-fixture.json");
const redactionFixturePath = path.join(root, "content", "development", "seis-ai-core-redaction-fixture.json");
const executionLedgerFixturePath = path.join(root, "content", "development", "seis-ai-core-execution-ledger-fixture.json");
const runtimeFixturesPath = path.join(root, "content", "development", "seis-ai-core-subagent-runtime-fixtures.json");
const reviewLedgerPath = path.join(root, "content", "development", "seis-ai-core-subagent-review-ledger.json");
const versionRegistryPath = path.join(root, "content", "development", "seis-ai-core-version-registry.json");
const versionPromotionGatesPath = path.join(root, "content", "development", "seis-ai-core-version-promotion-gates.json");
const aiCoreDocPath = path.join(root, "docs", "ai", "seis-ai-core.md");
const agentRuntimeDocPath = path.join(root, "docs", "ai", "agent-runtime.md");
const helperPath = path.join(root, "packages", "seis-ai", "src", "lib", "plugin-integration.mjs");
const toolsPath = path.join(root, "packages", "seis-ai", "src", "agent", "tools.mjs");
const mcpPath = path.join(root, "packages", "seis-ai", "src", "mcp", "server.mjs");
const packagePath = path.join(root, "package.json");

const requiredLanes = [
  ["seis", "seis_hub_status", "seis_hub_plan"],
  ["seis-cloud", "seis_cloud_status", "seis_cloud_plan"],
  ["seis-code", "seis_code_status", "seis_code_plan"],
  ["seis-design", "seis_design_status", "seis_design_plan"],
  ["seis-data", "seis_data_status", "seis_data_plan"],
];
const requiredPermissionLevels = ["read-only", "plan-only", "write-gated", "external-gated", "forbidden"];
const requiredEvidence = [
  "agent role schema",
  "permission matrix",
  "task queue fixture",
  "cancellation fixture",
  "approval fixture",
  "redaction fixture",
  "execution ledger fixture",
  "round execution evidence ledger",
  "runtime fixture pack",
  "quarterly review ledger",
  "redacted tool-output test",
  "persistent execution ledger",
  "quarterly review cadence",
];

ensureFile(modelPath, "SEIS AI Core sub-agent operating model");
ensureFile(pluginIntegrationPath, "SEIS-Agent plugin integration manifest");
ensureFile(laneStatusPath, "SEIS agent lane status contract");
ensureFile(longHorizonPlanPath, "SEIS sub-agent five-year plan");
ensureFile(swarmRoundLedgerPath, "SEIS sub-agent swarm round ledger");
ensureFile(roundExecutionEvidenceLedgerPath, "SEIS sub-agent round execution evidence ledger");
ensureFile(longHorizonReviewPath, "SEIS sub-agent long-horizon audit");
ensureFile(roleSchemaPath, "SEIS AI Core role schema fixture");
ensureFile(permissionMatrixPath, "SEIS AI Core permission matrix fixture");
ensureFile(dryRunTaskQueuePath, "SEIS AI Core dry-run task queue fixture");
ensureFile(cancellationFixturePath, "SEIS AI Core cancellation fixture");
ensureFile(approvalFixturePath, "SEIS AI Core approval fixture");
ensureFile(redactionFixturePath, "SEIS AI Core redaction fixture");
ensureFile(executionLedgerFixturePath, "SEIS AI Core execution ledger fixture");
ensureFile(runtimeFixturesPath, "SEIS AI Core consolidated runtime fixture pack");
ensureFile(reviewLedgerPath, "SEIS AI Core sub-agent review ledger");
ensureFile(versionRegistryPath, "SEIS AI Core version registry");
ensureFile(versionPromotionGatesPath, "SEIS AI Core version promotion gates");
ensureFile(aiCoreDocPath, "SEIS AI Core docs");
ensureFile(agentRuntimeDocPath, "SEIS agent runtime docs");
ensureFile(helperPath, "SEIS AI plugin integration helper");
ensureFile(toolsPath, "SEIS AI tool loop");
ensureFile(mcpPath, "SEIS AI MCP server");
ensureFile(packagePath, "package.json");

const model = readJson(modelPath, "SEIS AI Core sub-agent operating model");
const pluginIntegration = readJson(pluginIntegrationPath, "SEIS-Agent plugin integration manifest");
const laneStatus = readJson(laneStatusPath, "SEIS agent lane status contract");
const longHorizonPlan = readJson(longHorizonPlanPath, "SEIS sub-agent five-year plan");
const swarmRoundLedger = readJson(swarmRoundLedgerPath, "SEIS sub-agent swarm round ledger");
const roundExecutionEvidenceLedger = readJson(roundExecutionEvidenceLedgerPath, "SEIS sub-agent round execution evidence ledger");
const longHorizonReview = readText(longHorizonReviewPath, "SEIS sub-agent long-horizon audit");
const aiCoreDocs = readText(aiCoreDocPath, "SEIS AI Core docs");
const agentRuntimeDocs = readText(agentRuntimeDocPath, "SEIS agent runtime docs");
const helper = readText(helperPath, "SEIS AI plugin integration helper");
const tools = readText(toolsPath, "SEIS AI tool loop");
const mcp = readText(mcpPath, "SEIS AI MCP server");
const packageJson = readJson(packagePath, "package.json");

if (model) {
  ensure(model.id === "seis-ai-core-subagent-operating-model", "model id must be seis-ai-core-subagent-operating-model");
  ensure(model.status === "active", "model status must be active");
  ensure(
    model.qualityGate === "npm run check:seis-ai-core-subagent-operating-model",
    "model must declare check:seis-ai-core-subagent-operating-model as quality gate"
  );
  ensure(model.runtimeBoundary?.currentLevel === "status-and-plan-only", "runtime boundary must remain status-and-plan-only");
  ensure(model.runtimeBoundary?.backgroundAutomation === "disabled", "background automation must remain disabled");
  ensure(model.runtimeBoundary?.connectorAuthenticationClaim === "not-claimed", "connector authentication claim must remain not-claimed");
  ensure(
    model.sourceOfTruth?.versionRegistry === "content/development/seis-ai-core-version-registry.json",
    "model source of truth must point to the SEIS AI Core version registry"
  );
  ensure(
    model.sourceOfTruth?.versionPromotionGates === "content/development/seis-ai-core-version-promotion-gates.json",
    "model source of truth must point to the SEIS AI Core version promotion gates"
  );
  ensure(
    model.sourceOfTruth?.longHorizonPlan === "content/development/seis-sub-agent-5-year-plan.json",
    "model source of truth must point to the sub-agent five-year plan"
  );
  ensure(
    model.sourceOfTruth?.swarmRoundLedger === "content/development/seis-ai-core-subagent-swarm-round-ledger.json",
    "model source of truth must point to the sub-agent swarm round ledger"
  );
  ensure(
    model.sourceOfTruth?.roundExecutionEvidenceLedger === "content/development/seis-ai-core-subagent-round-execution-evidence-ledger.json",
    "model source of truth must point to the sub-agent round execution evidence ledger"
  );
  ensure(
    model.sourceOfTruth?.longHorizonReview === "docs/reviews/SUB_AGENT_LONG_HORIZON_AUDIT.md",
    "model source of truth must point to the sub-agent long-horizon audit"
  );
  ensure(
    model.sourceOfTruth?.roleSchema === "content/development/seis-ai-core-agent-role-schema.json",
    "model source of truth must point to the role schema fixture"
  );
  ensure(
    model.sourceOfTruth?.permissionMatrix === "content/development/seis-ai-core-agent-permission-matrix.json",
    "model source of truth must point to the permission matrix fixture"
  );
  ensure(
    model.sourceOfTruth?.dryRunTaskQueue === "content/development/seis-ai-core-dry-run-task-queue.json",
    "model source of truth must point to the dry-run task queue fixture"
  );
  ensure(
    model.sourceOfTruth?.cancellationFixture === "content/development/seis-ai-core-cancellation-fixture.json",
    "model source of truth must point to the cancellation fixture"
  );
  ensure(
    model.sourceOfTruth?.approvalFixture === "content/development/seis-ai-core-approval-fixture.json",
    "model source of truth must point to the approval fixture"
  );
  ensure(
    model.sourceOfTruth?.redactionFixture === "content/development/seis-ai-core-redaction-fixture.json",
    "model source of truth must point to the redaction fixture"
  );
  ensure(
    model.sourceOfTruth?.executionLedgerFixture === "content/development/seis-ai-core-execution-ledger-fixture.json",
    "model source of truth must point to the execution ledger fixture"
  );
  ensure(
    model.sourceOfTruth?.runtimeFixtures === "content/development/seis-ai-core-subagent-runtime-fixtures.json",
    "model source of truth must point to the consolidated runtime fixture pack"
  );
  ensure(
    model.sourceOfTruth?.reviewLedger === "content/development/seis-ai-core-subagent-review-ledger.json",
    "model source of truth must point to the quarterly review ledger"
  );
  ensureArrayIncludesAll(model.runtimeBoundary?.forbiddenWithoutApproval, [
    "push or merge GitHub changes",
    "deploy or mutate cloud infrastructure",
    "execute SSH, VPN, firewall, or sudo actions",
    "access, rotate, or transmit credentials",
    "train or publish models",
  ], "runtimeBoundary.forbiddenWithoutApproval");

  const permissionLevels = new Map((model.permissionMatrix || []).map((item) => [item.level, item]));
  for (const level of requiredPermissionLevels) {
    const permission = permissionLevels.get(level);
    ensure(Boolean(permission), `permission level missing: ${level}`);
    if (!permission) continue;
    ensureNonEmpty(permission.status, `${level}.status`);
    ensure(permission.evidenceRequired?.length > 0, `${level}.evidenceRequired must not be empty`);
  }
  ensure(permissionLevels.get("read-only")?.status === "enabled", "read-only permission level must be enabled");
  ensure(permissionLevels.get("plan-only")?.status === "enabled", "plan-only permission level must be enabled");
  ensure(permissionLevels.get("write-gated")?.status === "planned", "write-gated permission level must remain planned");
  ensure(permissionLevels.get("external-gated")?.approvalRequired === true, "external-gated actions must require approval");

  const lanes = new Map((model.lanes || []).map((lane) => [lane.id, lane]));
  for (const [laneId, statusTool, planTool] of requiredLanes) {
    const lane = lanes.get(laneId);
    ensure(Boolean(lane), `lane missing: ${laneId}`);
    if (!lane) continue;
    ensure(lane.statusTool === statusTool, `${laneId}.statusTool must be ${statusTool}`);
    ensure(lane.planTool === planTool, `${laneId}.planTool must be ${planTool}`);
    ensure(lane.currentPermissionLevel === "plan-only", `${laneId}.currentPermissionLevel must be plan-only`);
    ensureFile(path.join(root, lane.sourceMirror || ""), `${laneId} source mirror`);
    ensureFile(path.join(root, lane.skillPath || ""), `${laneId} skill path`);
    ensureNonEmpty(lane.qualityGate, `${laneId}.qualityGate`);
    ensureNonEmpty(lane.fiveYearDuty, `${laneId}.fiveYearDuty`);
  }

  ensure(Array.isArray(model.fiveYearRoadmap) && model.fiveYearRoadmap.length === 5, "fiveYearRoadmap must contain exactly five years");
  for (const year of [1, 2, 3, 4, 5]) {
    const item = (model.fiveYearRoadmap || []).find((entry) => entry.year === year);
    ensure(Boolean(item), `fiveYearRoadmap missing year ${year}`);
    if (!item) continue;
    ensureNonEmpty(item.theme, `year ${year}.theme`);
    ensureNonEmpty(item.promotionGate, `year ${year}.promotionGate`);
    ensure(item.requiredEvidence?.length >= 4, `year ${year}.requiredEvidence must include at least four items`);
  }

  ensure(model.cadence?.quarterly === "five-year roadmap promotion-gate review", "cadence must include quarterly promotion-gate review");
  ensure(model.cadence?.annual?.includes("model-claims audit"), "annual cadence must include model-claims audit");
  ensureArrayIncludesAll(model.evidenceRequirements, requiredEvidence, "evidenceRequirements");
}

if (pluginIntegration) {
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.versionRegistry === "content/development/seis-ai-core-version-registry.json",
    "plugin integration must point to the SEIS AI Core version registry"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.versionPromotionGates === "content/development/seis-ai-core-version-promotion-gates.json",
    "plugin integration must point to the SEIS AI Core version promotion gates"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.operatingModel === "content/development/seis-ai-core-subagent-operating-model.json",
    "plugin integration must point to the machine-readable sub-agent operating model"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.currentRuntimeBoundary === "status-and-plan-only",
    "plugin integration must keep current runtime boundary status-and-plan-only"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.longHorizonPlan === "content/development/seis-sub-agent-5-year-plan.json",
    "plugin integration must point to the sub-agent five-year plan"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.longHorizonReview === "docs/reviews/SUB_AGENT_LONG_HORIZON_AUDIT.md",
    "plugin integration must point to the sub-agent long-horizon audit"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.roleSchema === "content/development/seis-ai-core-agent-role-schema.json",
    "plugin integration must point to the role schema fixture"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.permissionMatrix === "content/development/seis-ai-core-agent-permission-matrix.json",
    "plugin integration must point to the permission matrix fixture"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.dryRunTaskQueue === "content/development/seis-ai-core-dry-run-task-queue.json",
    "plugin integration must point to the dry-run task queue fixture"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.cancellationFixture === "content/development/seis-ai-core-cancellation-fixture.json",
    "plugin integration must point to the cancellation fixture"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.approvalFixture === "content/development/seis-ai-core-approval-fixture.json",
    "plugin integration must point to the approval fixture"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.redactionFixture === "content/development/seis-ai-core-redaction-fixture.json",
    "plugin integration must point to the redaction fixture"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.executionLedgerFixture === "content/development/seis-ai-core-execution-ledger-fixture.json",
    "plugin integration must point to the execution ledger fixture"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.runtimeFixtures === "content/development/seis-ai-core-subagent-runtime-fixtures.json",
    "plugin integration must point to the consolidated runtime fixture pack"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.reviewLedger === "content/development/seis-ai-core-subagent-review-ledger.json",
    "plugin integration must point to the quarterly review ledger"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.swarmRoundLedger === "content/development/seis-ai-core-subagent-swarm-round-ledger.json",
    "plugin integration must point to the swarm round ledger"
  );
  ensure(
    pluginIntegration.fiveYearSubagentDevelopment?.roundExecutionEvidenceLedger === "content/development/seis-ai-core-subagent-round-execution-evidence-ledger.json",
    "plugin integration must point to the round execution evidence ledger"
  );
  ensure(
    pluginIntegration.runtimeIntegration?.subagentOperatingModelTool === "seis_ai_core_subagent_model",
    "plugin integration must expose seis_ai_core_subagent_model"
  );
  ensureArrayIncludesAll(pluginIntegration.runtimeIntegration?.mcpResources, [
    "seis://ai/version-registry.json",
    "seis://ai/20b-model-card-template.json",
    "seis://ai/20b-dataset-card-template.json",
    "seis://ai/720b-agi-frontier-boundary.json",
    "seis://ai/subagent-operating-model.json",
    "seis://ai/sub-agent-5-year-plan.json",
    "seis://ai/subagent-swarm-round-ledger.json",
    "seis://ai/subagent-round-execution-evidence-ledger.json",
    "seis://ai/agent-role-schema.json",
    "seis://ai/agent-permission-matrix.json",
    "seis://ai/dry-run-task-queue.json",
    "seis://ai/cancellation-fixture.json",
    "seis://ai/approval-fixture.json",
    "seis://ai/redaction-fixture.json",
    "seis://ai/execution-ledger-fixture.json",
    "seis://ai/subagent-runtime-fixtures.json",
    "seis://ai/subagent-review-ledger.json",
  ], "pluginIntegration.runtimeIntegration.mcpResources");
}

if (laneStatus) {
  const laneIds = new Set((laneStatus.lanes || []).map((lane) => lane.id));
  for (const [laneId] of requiredLanes) {
    const expectedLaneId = laneId === "seis" ? "seis-hub" : laneId;
    ensure(laneIds.has(expectedLaneId), `lane status contract missing ${expectedLaneId}`);
  }
}

if (longHorizonPlan) {
  ensure(longHorizonPlan.id === "sub-agent-5-year-plan", "long-horizon plan id must be sub-agent-5-year-plan");
  ensure(longHorizonPlan.status === "documented", "long-horizon plan must remain documented until runtime evidence exists");
  ensure(longHorizonPlan.governance?.writerPolicy === "single-writer", "long-horizon plan must keep single-writer policy");
  ensure(
    longHorizonPlan.swarmRoundLedger === "content/development/seis-ai-core-subagent-swarm-round-ledger.json",
    "long-horizon plan must link the swarm round ledger"
  );
  ensure(
    longHorizonPlan.roundExecutionEvidenceLedger === "content/development/seis-ai-core-subagent-round-execution-evidence-ledger.json",
    "long-horizon plan must link the round execution evidence ledger"
  );
  ensure(Array.isArray(longHorizonPlan.years) && longHorizonPlan.years.length === 5, "long-horizon plan must cover five years");
}
if (swarmRoundLedger) {
  ensure(swarmRoundLedger.id === "seis-ai-core-subagent-swarm-round-ledger", "swarm round ledger id mismatch");
  ensure(swarmRoundLedger.status === "plan-only-supervised-ledger", "swarm round ledger must stay plan-only supervised");
  ensure(swarmRoundLedger.ownerObjectiveMap?.defaultRoundWindow === 15, "swarm round ledger default window must be 15");
  ensure(swarmRoundLedger.ownerObjectiveMap?.expandedRoundWindow === 30, "swarm round ledger expanded window must be 30");
  ensure(swarmRoundLedger.ownerObjectiveMap?.expandedRoundWindowRequiresOwnerApproval === true, "30-round expansion must require owner approval");
  ensure(swarmRoundLedger.runtimeBoundary?.continuousBackgroundRuntime === "not-authorized", "swarm ledger must reject continuous background runtime");
  ensure(swarmRoundLedger.runtimeBoundary?.agiClaimAllowed === false, "swarm ledger must block AGI claims");
  ensure(Array.isArray(swarmRoundLedger.roundAssignments) && swarmRoundLedger.roundAssignments.length === 15, "swarm ledger must define 15 default round assignments");
}
if (roundExecutionEvidenceLedger) {
  ensure(roundExecutionEvidenceLedger.id === "seis-ai-core-subagent-round-execution-evidence-ledger", "round execution evidence ledger id mismatch");
  ensure(roundExecutionEvidenceLedger.status === "repo-local-supervised-closeout-evidence", "round execution evidence ledger status mismatch");
  ensure(roundExecutionEvidenceLedger.resourceUri === "seis://ai/subagent-round-execution-evidence-ledger.json", "round execution evidence ledger resource URI mismatch");
  ensure(roundExecutionEvidenceLedger.roundWindowState?.defaultRoundWindow === 15, "round execution evidence ledger default window must be 15");
  ensure(roundExecutionEvidenceLedger.roundWindowState?.expandedRoundWindow === 30, "round execution evidence ledger expanded window must be 30");
  const closeoutRecords = Array.isArray(roundExecutionEvidenceLedger.closeoutRecords)
    ? roundExecutionEvidenceLedger.closeoutRecords
    : [];
  ensure(closeoutRecords.length >= 5, "round execution evidence ledger must preserve at least five closeouts");
  ensure(
    roundExecutionEvidenceLedger.roundWindowState?.recordedCloseoutCount === closeoutRecords.length,
    "round execution evidence ledger recorded count must match closeout records"
  );
  ensure(
    roundExecutionEvidenceLedger.evidenceSummary?.totalCloseoutRecords === closeoutRecords.length,
    "round execution evidence ledger summary count must match closeout records"
  );
  ensure(roundExecutionEvidenceLedger.runtimeBoundary?.continuousBackgroundRuntime === "not-authorized", "round execution evidence ledger must reject continuous background runtime");
  ensure(roundExecutionEvidenceLedger.runtimeBoundary?.credentialAccessPerformed === false, "round execution evidence ledger must not perform credential access");
  ensure(roundExecutionEvidenceLedger.runtimeBoundary?.sshExecutionPerformed === false, "round execution evidence ledger must not perform SSH execution");
  ensure(roundExecutionEvidenceLedger.runtimeBoundary?.providerCallPerformed === false, "round execution evidence ledger must not perform provider calls");
  ensure(roundExecutionEvidenceLedger.runtimeBoundary?.modelTrainingPerformed === false, "round execution evidence ledger must not perform model training");
  ensure(roundExecutionEvidenceLedger.runtimeBoundary?.agiClaimAllowed === false, "round execution evidence ledger must block AGI claims");
  ensure(roundExecutionEvidenceLedger.runtimeBoundary?.routeEligibleToday === false, "round execution evidence ledger must not be route eligible");
}
for (const token of ["# SEIS Sub-Agent Long-Horizon Audit", "5-Year Gap", "Human Approval Needed"]) {
  ensure(longHorizonReview.includes(token), `long-horizon audit missing ${token}`);
}

for (const token of [
  "Five-Year Sub-Agent Operating Model",
  "seis-ai-core-version-registry.json",
  "seis-ai-core-version-promotion-gates.json",
  "seis_ai_core_version_status",
  "seis_ai_core_version_promotion_dry_run",
  "seis_ai_core_subagent_model",
  "seis-sub-agent-5-year-plan",
  "seis-ai-core-agent-role-schema.json",
  "seis-ai-core-agent-permission-matrix.json",
  "seis-ai-core-dry-run-task-queue.json",
  "seis-ai-core-cancellation-fixture.json",
  "seis-ai-core-approval-fixture.json",
  "seis-ai-core-redaction-fixture.json",
  "seis-ai-core-execution-ledger-fixture.json",
  "seis-ai-core-subagent-runtime-fixtures.json",
  "seis-ai-core-subagent-review-ledger.json",
  "seis_ai_core_subagent_review_ledger",
  "seis_hub_status",
  "seis_cloud_plan",
  "write-gated implementation lanes",
  "quarterly",
]) {
  ensure(aiCoreDocs.includes(token), `SEIS AI Core docs missing ${token}`);
}
for (const token of ["Personal sub-agent lanes", "permission matrix", "status/plan-only", "seis-ai-core-version-registry.json", "seis-ai-core-version-promotion-gates.json", "seis_ai_core_version_status", "seis_ai_core_version_promotion_dry_run"]) {
  ensure(agentRuntimeDocs.includes(token), `agent runtime docs missing ${token}`);
}
ensure(helper.includes("seis_ai_core_subagent_model"), "helper must define seis_ai_core_subagent_model");
ensure(helper.includes("SUBAGENT_ROUND_EXECUTION_EVIDENCE_LEDGER_PATH"), "helper must define the round execution evidence ledger path");
ensure(helper.includes("seis_ai_core_version_status"), "helper must define seis_ai_core_version_status");
ensure(helper.includes("seis_ai_core_version_promotion_dry_run"), "helper must define seis_ai_core_version_promotion_dry_run");
for (const [text, label] of [
  [helper, "helper"],
  [tools, "tool loop"],
  [mcp, "MCP server"],
]) {
  ensure(text.includes("subagentOperatingModelStatus"), `${label} must reference subagentOperatingModelStatus`);
}
ensure(tools.includes("SUBAGENT_OPERATING_MODEL_TOOL"), "tool loop must consume SUBAGENT_OPERATING_MODEL_TOOL");
ensure(tools.includes("AI_CORE_VERSION_STATUS_TOOL"), "tool loop must consume AI_CORE_VERSION_STATUS_TOOL");
ensure(tools.includes("AI_CORE_VERSION_PROMOTION_TOOL"), "tool loop must consume AI_CORE_VERSION_PROMOTION_TOOL");
ensure(mcp.includes("SUBAGENT_OPERATING_MODEL_TOOL"), "MCP server must consume SUBAGENT_OPERATING_MODEL_TOOL");
ensure(mcp.includes("AI_CORE_VERSION_STATUS_TOOL"), "MCP server must consume AI_CORE_VERSION_STATUS_TOOL");
ensure(mcp.includes("AI_CORE_VERSION_PROMOTION_TOOL"), "MCP server must consume AI_CORE_VERSION_PROMOTION_TOOL");
ensure(mcp.includes("seis://ai/version-registry.json"), "MCP server must expose the SEIS AI Core version registry resource");
ensure(mcp.includes("seis://ai/version-promotion-gates.json"), "MCP server must expose the SEIS AI Core version promotion gates resource");
ensure(mcp.includes("seis://ai/subagent-operating-model.json"), "MCP server must expose the sub-agent operating-model resource");
ensure(mcp.includes("seis://ai/sub-agent-5-year-plan.json"), "MCP server must expose the sub-agent five-year-plan resource");
ensure(mcp.includes("seis://ai/agent-role-schema.json"), "MCP server must expose the sub-agent role-schema resource");
ensure(mcp.includes("seis://ai/agent-permission-matrix.json"), "MCP server must expose the sub-agent permission-matrix resource");
ensure(mcp.includes("seis://ai/dry-run-task-queue.json"), "MCP server must expose the sub-agent dry-run queue resource");
ensure(mcp.includes("seis://ai/cancellation-fixture.json"), "MCP server must expose the sub-agent cancellation resource");
ensure(mcp.includes("seis://ai/approval-fixture.json"), "MCP server must expose the sub-agent approval resource");
ensure(mcp.includes("seis://ai/subagent-runtime-fixtures.json"), "MCP server must expose the sub-agent runtime fixture pack resource");
ensure(mcp.includes("seis://ai/subagent-review-ledger.json"), "MCP server must expose the sub-agent review ledger resource");
ensure(mcp.includes("seis://ai/subagent-swarm-round-ledger.json"), "MCP server must expose the sub-agent swarm round ledger resource");
ensure(mcp.includes("seis://ai/subagent-round-execution-evidence-ledger.json"), "MCP server must expose the sub-agent round execution evidence ledger resource");
ensure(mcp.includes("seis://ai/720b-agi-frontier-boundary.json"), "MCP server must expose the 720B AGI frontier boundary resource");

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-ai-core-subagent-operating-model"] === "node scripts/check-seis-ai-core-subagent-operating-model.mjs",
    "package.json must expose check:seis-ai-core-subagent-operating-model"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-ai-core-subagent-operating-model"),
    "quality:governance must include check:seis-ai-core-subagent-operating-model"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-ai-core-subagent-runtime-fixtures"),
    "quality:governance must include check:seis-ai-core-subagent-runtime-fixtures"
  );
  ensure(
    packageJson.scripts?.["check:seis-ai-core-subagent-round-execution-evidence-ledger"] ===
      "node scripts/check-seis-ai-core-subagent-round-execution-evidence-ledger.mjs",
    "package.json must expose check:seis-ai-core-subagent-round-execution-evidence-ledger"
  );
}

if (failures.length) {
  console.error("SEIS AI Core sub-agent operating model check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS AI Core sub-agent operating model check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function ensureNonEmpty(candidate, label) {
  ensure(typeof candidate === "string" && candidate.trim().length > 0, `${label} must be a non-empty string`);
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
