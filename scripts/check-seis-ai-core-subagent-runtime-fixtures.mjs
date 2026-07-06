#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  roleSchema: "content/development/seis-ai-core-agent-role-schema.json",
  permissionMatrix: "content/development/seis-ai-core-agent-permission-matrix.json",
  queue: "content/development/seis-ai-core-dry-run-task-queue.json",
  cancellation: "content/development/seis-ai-core-cancellation-fixture.json",
  approval: "content/development/seis-ai-core-approval-fixture.json",
  redaction: "content/development/seis-ai-core-redaction-fixture.json",
  executionLedger: "content/development/seis-ai-core-execution-ledger-fixture.json",
  runtimeFixtures: "content/development/seis-ai-core-subagent-runtime-fixtures.json",
  reviewLedger: "content/development/seis-ai-core-subagent-review-ledger.json",
  versionRegistry: "content/development/seis-ai-core-version-registry.json",
  versionPromotionGates: "content/development/seis-ai-core-version-promotion-gates.json",
  operatingModel: "content/development/seis-ai-core-subagent-operating-model.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  agentRuntimeDoc: "docs/ai/agent-runtime.md",
  subagentRuntimeTest: "packages/seis-ai/test/subagent-runtime-fixtures.test.mjs",
  subagentRuntimePolicy: "packages/seis-ai/src/lib/subagent-runtime-policy.mjs",
  subagentRuntimePolicyTest: "packages/seis-ai/test/subagent-runtime-policy.test.mjs",
  tools: "packages/seis-ai/src/agent/tools.mjs",
  mcpServer: "packages/seis-ai/src/mcp/server.mjs",
  pluginHelper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  packageJson: "package.json",
};

const requiredLanes = ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"];
const requiredRoles = [
  "repository-governance-subagent",
  "cloud-readiness-subagent",
  "engineering-subagent",
  "product-design-subagent",
  "data-provenance-subagent",
];
const requiredLevels = ["read-only", "plan-only", "write-gated", "external-gated", "forbidden"];
const requiredQueueStates = ["queued", "assigned", "running", "awaiting-approval", "cancelled", "failed", "validated", "archived"];
const requiredApprovalActions = [
  "GitHub push or merge",
  "deployment",
  "SSH or VPN operation",
  "credential access or rotation",
  "model training or publishing",
];

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(abs(relativePath), label);
}

const roleSchema = readJson(paths.roleSchema, "agent role schema");
const permissionMatrix = readJson(paths.permissionMatrix, "agent permission matrix");
const queue = readJson(paths.queue, "dry-run task queue");
const cancellation = readJson(paths.cancellation, "cancellation fixture");
const approval = readJson(paths.approval, "approval fixture");
const redaction = readJson(paths.redaction, "redaction fixture");
const executionLedger = readJson(paths.executionLedger, "execution ledger fixture");
const runtimeFixtures = readJson(paths.runtimeFixtures, "consolidated runtime fixture pack");
const operatingModel = readJson(paths.operatingModel, "sub-agent operating model");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration manifest");
const aiCoreDoc = readText(paths.aiCoreDoc, "SEIS AI Core docs");
const agentRuntimeDoc = readText(paths.agentRuntimeDoc, "agent runtime docs");
const subagentRuntimeTest = readText(paths.subagentRuntimeTest, "sub-agent runtime fixture simulation test");
const subagentRuntimePolicy = readText(paths.subagentRuntimePolicy, "sub-agent runtime policy helper");
const subagentRuntimePolicyTest = readText(paths.subagentRuntimePolicyTest, "sub-agent runtime policy test");
const tools = readText(paths.tools, "SEIS AI Core agent tools");
const mcpServer = readText(paths.mcpServer, "SEIS AI Core MCP server");
const pluginHelper = readText(paths.pluginHelper, "SEIS AI Core plugin helper");
const packageJson = readJson(paths.packageJson, "package.json");

if (roleSchema) {
  ensure(roleSchema.id === "seis-ai-core-agent-role-schema", "role schema id mismatch");
  ensure(roleSchema.status === "documented-fixture", "role schema must stay documented-fixture");
  ensure(roleSchema.runtimeBoundary === "status-and-plan-only", "role schema must keep status-and-plan-only boundary");
  ensure(roleSchema.qualityGate === "npm run check:seis-ai-core-subagent-runtime-fixtures", "role schema quality gate mismatch");
  ensureArrayIncludesAll(roleSchema.requiredFields, [
    "id",
    "laneId",
    "statusTool",
    "planTool",
    "authority",
    "allowedPermissionLevels",
    "deniedPermissionLevels",
    "allowedTools",
    "deniedTools",
    "fileScopes",
    "networkScope",
    "maxSteps",
    "maxDelegationDepth",
    "timeoutMinutes",
    "approvalRequiredFor",
    "validationMethod",
    "failureBehavior",
    "outputSchema",
  ], "roleSchema.requiredFields");

  const roles = Array.isArray(roleSchema.roles) ? roleSchema.roles : [];
  ensureArrayIncludesAll(roles.map((role) => role.id), requiredRoles, "roleSchema.roles");
  ensureArrayIncludesAll(roles.map((role) => role.laneId), requiredLanes, "roleSchema.role laneIds");
  assertUnique(roles.map((role) => role.id), "role ids");
  assertUnique(roles.map((role) => role.laneId), "role lane ids");
  for (const role of roles) {
    ensure(requiredLanes.includes(role.laneId), `${role.id}.laneId must be known`);
    ensure(role.authority === "plan-only", `${role.id}.authority must stay plan-only`);
    ensureArrayIncludesAll(role.allowedPermissionLevels, ["read-only", "plan-only"], `${role.id}.allowedPermissionLevels`);
    ensureArrayIncludesAll(role.deniedPermissionLevels, ["write-gated", "external-gated", "forbidden"], `${role.id}.deniedPermissionLevels`);
    ensure(role.allowedTools?.includes(role.statusTool), `${role.id}.allowedTools must include status tool`);
    ensure(role.allowedTools?.includes(role.planTool), `${role.id}.allowedTools must include plan tool`);
    ensure(Array.isArray(role.deniedTools) && role.deniedTools.length > 0, `${role.id}.deniedTools must not be empty`);
    ensure(Number.isInteger(role.maxDelegationDepth) && role.maxDelegationDepth <= 1, `${role.id}.maxDelegationDepth must be <= 1`);
    ensure(Number.isInteger(role.maxSteps) && role.maxSteps > 0 && role.maxSteps <= 8, `${role.id}.maxSteps must be 1-8`);
    ensure(Number.isInteger(role.timeoutMinutes) && role.timeoutMinutes > 0 && role.timeoutMinutes <= 30, `${role.id}.timeoutMinutes must be 1-30`);
    ensure(Array.isArray(role.fileScopes) && role.fileScopes.length > 0, `${role.id}.fileScopes must not be empty`);
    ensure(role.networkScope === "none", `${role.id}.networkScope must be none`);
    ensure(Array.isArray(role.approvalRequiredFor) && role.approvalRequiredFor.length > 0, `${role.id}.approvalRequiredFor must not be empty`);
    ensure(typeof role.validationMethod === "string" && role.validationMethod.length > 0, `${role.id}.validationMethod must be set`);
    ensure(typeof role.failureBehavior === "string" && role.failureBehavior.length > 0, `${role.id}.failureBehavior must be set`);
    ensure(typeof role.outputSchema === "string" && role.outputSchema.length > 0, `${role.id}.outputSchema must be set`);
  }
}

if (permissionMatrix) {
  ensure(permissionMatrix.id === "seis-ai-core-agent-permission-matrix", "permission matrix id mismatch");
  ensure(permissionMatrix.status === "documented-fixture", "permission matrix must stay documented-fixture");
  ensure(permissionMatrix.runtimeBoundary === "status-and-plan-only", "permission matrix must keep status-and-plan-only boundary");
  const levels = new Map((permissionMatrix.levels || []).map((level) => [level.level, level]));
  for (const level of requiredLevels) {
    const record = levels.get(level);
    ensure(Boolean(record), `permission level missing: ${level}`);
    if (!record) continue;
    ensure(Array.isArray(record.actions) && record.actions.length > 0, `${level}.actions must not be empty`);
    ensure(Array.isArray(record.evidenceRequired) && record.evidenceRequired.length > 0, `${level}.evidenceRequired must not be empty`);
  }
  ensure(levels.get("read-only")?.status === "enabled", "read-only must stay enabled");
  ensure(levels.get("plan-only")?.status === "enabled", "plan-only must stay enabled");
  ensure(levels.get("write-gated")?.status === "planned", "write-gated must stay planned");
  ensure(levels.get("external-gated")?.status === "planned", "external-gated must stay planned");
  ensure(levels.get("external-gated")?.approvalRequired === true, "external-gated must require approval");
  ensure(levels.get("forbidden")?.status === "active", "forbidden must stay active");
  ensureArrayIncludesAll(permissionMatrix.forbiddenWithoutSeparatePlan, [
    "credential access",
    "private key handling",
    "history rewrite",
    "model training",
  ], "permissionMatrix.forbiddenWithoutSeparatePlan");
}

if (queue) {
  ensure(queue.id === "seis-ai-core-dry-run-task-queue", "queue id mismatch");
  ensure(queue.status === "dry-run-only", "queue status must stay dry-run-only");
  ensure(queue.writerPolicy === "single-writer", "queue must keep single-writer policy");
  ensure(queue.dryRunOnly === true, "queue must be dryRunOnly");
  ensureArrayIncludesAll(queue.states, requiredQueueStates, "queue.states");
  const roleIds = new Set(roleSchema?.roles?.map((role) => role.id) || []);
  const tasks = Array.isArray(queue.sampleTasks) ? queue.sampleTasks : [];
  ensure(tasks.length >= 4, "queue must include at least four sample tasks");
  for (const task of tasks) {
    ensure(requiredLanes.includes(task.laneId), `${task.id}.laneId must be known`);
    ensure(roleIds.has(task.roleId), `${task.id}.roleId must map to role schema`);
    ensure(queue.states.includes(task.state), `${task.id}.state must be declared`);
    ensure(task.dryRunOnly === true, `${task.id}.dryRunOnly must be true`);
    ensure(task.externalMutation === false, `${task.id}.externalMutation must be false`);
    ensure(Array.isArray(task.targetScope) && task.targetScope.length > 0, `${task.id}.targetScope must not be empty`);
    ensure(typeof task.validator === "string" && task.validator.length > 0, `${task.id}.validator must be set`);
    ensure(typeof task.rollbackNote === "string" && task.rollbackNote.length > 0, `${task.id}.rollbackNote must be set`);
  }
  ensure(tasks.some((task) => task.state === "awaiting-approval" && task.approvalRequired === true), "queue must include an awaiting approval task");
}

if (cancellation) {
  ensure(cancellation.id === "seis-ai-core-cancellation-fixture", "cancellation id mismatch");
  ensure(cancellation.status === "documented-fixture", "cancellation fixture must stay documented-fixture");
  ensure(cancellation.cancellationTokenRequired === true, "cancellation token must be required");
  ensureArrayIncludesAll(cancellation.supportedSignals, ["operator-cancel", "timeout", "policy-deny", "validation-failure"], "cancellation.supportedSignals");
  ensureArrayIncludesAll(cancellation.terminalStates, ["cancelled", "failed", "validated", "archived"], "cancellation.terminalStates");
  ensureArrayIncludesAll(cancellation.forbiddenAfterCancellation, ["tool call", "file write", "external request"], "cancellation.forbiddenAfterCancellation");
  ensure(cancellation.sampleCancellation?.toState === "cancelled", "sample cancellation must end cancelled");
  ensure(cancellation.sampleCancellation?.artifactsPreserved === true, "sample cancellation must preserve artifacts");
  ensure(cancellation.sampleCancellation?.externalMutationPerformed === false, "sample cancellation must not mutate externally");
  ensure(cancellation.sampleCancellation?.laterToolCallsAllowed === false, "sample cancellation must deny later tool calls");
}

if (approval) {
  ensure(approval.id === "seis-ai-core-approval-fixture", "approval id mismatch");
  ensure(approval.status === "documented-fixture", "approval fixture must stay documented-fixture");
  ensure(approval.approvalModel === "scoped-action-specific-expiring", "approval model must be scoped/action-specific/expiring");
  ensure(approval.blanketApprovalAllowed === false, "blanket approval must be disallowed");
  ensureArrayIncludesAll(approval.approvalRequiredFor, requiredApprovalActions, "approval.approvalRequiredFor");
  ensureArrayIncludesAll(approval.statuses, ["pending-human-approval", "approved", "denied", "expired"], "approval.statuses");
  const requests = Array.isArray(approval.sampleRequests) ? approval.sampleRequests : [];
  ensure(requests.length >= 2, "approval fixture must include at least two sample requests");
  for (const request of requests) {
    ensure(request.status === "pending-human-approval", `${request.id}.status must be pending-human-approval`);
    ensure(request.actor === "human-operator-required", `${request.id}.actor must require human operator`);
    ensure(Number.isInteger(request.expiresAfterMinutes) && request.expiresAfterMinutes > 0, `${request.id}.expiresAfterMinutes must be positive`);
    ensure(request.executionBlocked === true, `${request.id}.executionBlocked must be true`);
    ensure(Array.isArray(request.targetScope) && request.targetScope.length > 0, `${request.id}.targetScope must not be empty`);
    ensure(Array.isArray(request.requiredEvidence) && request.requiredEvidence.length > 0, `${request.id}.requiredEvidence must not be empty`);
  }
  ensureArrayIncludesAll(approval.forbiddenApprovalShortcuts, [
    "approval by another autonomous agent",
    "approval inferred from previous conversation",
    "approval without action, actor, target, expiry, and rollback evidence",
  ], "approval.forbiddenApprovalShortcuts");
}

if (redaction) {
  ensure(redaction.id === "seis-ai-core-redaction-fixture", "redaction id mismatch");
  ensure(redaction.status === "documented-fixture", "redaction fixture must stay documented-fixture");
  ensure(redaction.runtimeBoundary === "status-and-plan-only", "redaction fixture must keep status-and-plan-only boundary");
  ensure(redaction.promptAndResponseLoggingDefault === "disabled", "prompt/response logging must stay disabled by default");
  ensure(redaction.rawProviderErrorsExposed === false, "redaction fixture must not expose raw provider errors");
  ensure(redaction.sampleOutputContainsSecretValue === false, "redaction fixture sample must not contain secrets");
  ensureArrayIncludesAll(redaction.redactionRequiredFor, [
    "api keys",
    "bearer tokens",
    "authorization headers",
    "private keys",
  ], "redaction.redactionRequiredFor");
  ensureArrayIncludesAll(redaction.forbiddenOutputs, [
    "full credential value",
    "partial credential prefix or suffix",
    "raw provider error body",
    "private key material",
  ], "redaction.forbiddenOutputs");
  const records = Array.isArray(redaction.sampleRecords) ? redaction.sampleRecords : [];
  ensure(records.length >= 1, "redaction fixture must include a sample record");
  for (const record of records) {
    ensure(record.containsSecretValue === false, `${record.id}.containsSecretValue must be false`);
    ensure(record.usesPlaceholders === true, `${record.id}.usesPlaceholders must be true`);
    ensureArrayIncludesAll(
      record.forbiddenDiagnosticFields,
      ["rawErrorBody", "authorizationHeader", "credentialValue"],
      `${record.id}.forbiddenDiagnosticFields`
    );
  }
}

if (executionLedger) {
  ensure(executionLedger.id === "seis-ai-core-execution-ledger-fixture", "execution ledger id mismatch");
  ensure(executionLedger.status === "documented-fixture", "execution ledger fixture must stay documented-fixture");
  ensure(executionLedger.runtimeBoundary === "status-and-plan-only", "execution ledger must keep status-and-plan-only boundary");
  ensure(executionLedger.mode === "append-only-planned", "execution ledger mode must stay append-only-planned");
  ensure(executionLedger.writerPolicy === "single-writer", "execution ledger must keep single-writer policy");
  ensureArrayIncludesAll(executionLedger.recordsForbidden, ["secret values", "private keys", "raw provider errors"], "executionLedger.recordsForbidden");
  ensureArrayIncludesAll(executionLedger.requiredFields, [
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
    "redactionStatus",
    "createdAt",
  ], "executionLedger.requiredFields");
  const records = Array.isArray(executionLedger.sampleRecords) ? executionLedger.sampleRecords : [];
  ensure(records.length >= 1, "execution ledger must include a sample record");
  for (const record of records) {
    ensure(record.dryRunOnly === true, `${record.id}.dryRunOnly must be true`);
    ensure(record.realExecutionBlocked === true, `${record.id}.realExecutionBlocked must be true`);
    ensure(record.externalMutationPerformed === false, `${record.id}.externalMutationPerformed must be false`);
    ensure(record.fileMutationPerformed === false, `${record.id}.fileMutationPerformed must be false`);
    ensure(record.secretValuesStored === false, `${record.id}.secretValuesStored must be false`);
    ensure(record.redactionStatus === "passed", `${record.id}.redactionStatus must be passed`);
  }
}

if (runtimeFixtures) {
  ensure(runtimeFixtures.id === "seis-ai-core-subagent-runtime-fixtures", "runtime fixtures id mismatch");
  ensure(runtimeFixtures.status === "documented-fixture", "runtime fixtures must stay documented-fixture");
  ensure(
    runtimeFixtures.qualityGate === "npm run check:seis-ai-core-subagent-runtime-fixtures",
    "runtime fixtures quality gate mismatch"
  );
  ensure(runtimeFixtures.runtimeBoundary?.currentLevel === "status-and-plan-only", "runtime fixtures must keep status-and-plan-only boundary");
  ensure(runtimeFixtures.runtimeBoundary?.backgroundAutomation === "disabled", "runtime fixtures background automation must stay disabled");
  ensure(runtimeFixtures.runtimeBoundary?.writeExecution === "disabled", "runtime fixtures write execution must stay disabled");
  ensure(runtimeFixtures.runtimeBoundary?.credentialAccess === "forbidden", "runtime fixtures credential access must stay forbidden");
  ensure(runtimeFixtures.executableDryRunTestPlan?.path === paths.subagentRuntimeTest, "runtime fixtures must point to executable dry-run simulation test");
  ensure(runtimeFixtures.executableDryRunTestPlan?.policyHelper === paths.subagentRuntimePolicy, "runtime fixtures must point to sub-agent runtime policy helper");
  ensure(runtimeFixtures.executableDryRunTestPlan?.policyTest === paths.subagentRuntimePolicyTest, "runtime fixtures must point to sub-agent runtime policy test");
  ensure(runtimeFixtures.executableDryRunTestPlan?.mode === "simulation-only", "runtime fixtures test plan must stay simulation-only");
  ensure(runtimeFixtures.executableDryRunTestPlan?.enablesRuntimeExecution === false, "runtime fixtures test plan must not enable runtime execution");
  ensureArrayIncludesAll(runtimeFixtures.executableDryRunTestPlan?.coveredBehaviors, [
    "runtime boundary remains status-and-plan-only",
    "approval-gated tasks stay blocked while approval is pending",
    "cancellation ends in a terminal state without later tool calls",
    "ledger records remain dry-run-only and redacted",
    "redacted diagnostics are required before future promotion",
  ], "runtimeFixtures.executableDryRunTestPlan.coveredBehaviors");
  ensure(runtimeFixtures.sourceOfTruth?.operatingModel === paths.operatingModel, "runtime fixtures must point to operating model");
  ensure(
    runtimeFixtures.sourceOfTruth?.fiveYearPlan === "content/development/seis-sub-agent-5-year-plan.json",
    "runtime fixtures must point to five-year plan"
  );
  ensure(runtimeFixtures.sourceOfTruth?.roleSchema === paths.roleSchema, "runtime fixtures must point to role schema");
  ensure(runtimeFixtures.sourceOfTruth?.permissionMatrix === paths.permissionMatrix, "runtime fixtures must point to permission matrix");
  ensure(runtimeFixtures.sourceOfTruth?.dryRunTaskQueue === paths.queue, "runtime fixtures must point to dry-run queue");
  ensure(runtimeFixtures.sourceOfTruth?.cancellationFixture === paths.cancellation, "runtime fixtures must point to cancellation fixture");
  ensure(runtimeFixtures.sourceOfTruth?.approvalFixture === paths.approval, "runtime fixtures must point to approval fixture");
  ensure(runtimeFixtures.sourceOfTruth?.redactionFixture === paths.redaction, "runtime fixtures must point to redaction fixture");
  ensure(runtimeFixtures.sourceOfTruth?.executionLedgerFixture === paths.executionLedger, "runtime fixtures must point to execution ledger fixture");
  ensure(runtimeFixtures.sourceOfTruth?.reviewLedger === paths.reviewLedger, "runtime fixtures must point to review ledger");
  ensure(runtimeFixtures.sourceOfTruth?.versionRegistry === paths.versionRegistry, "runtime fixtures must point to version registry");
  ensure(runtimeFixtures.sourceOfTruth?.versionPromotionGates === paths.versionPromotionGates, "runtime fixtures must point to version promotion gates");
  ensureArrayIncludesAll(
    (runtimeFixtures.fixtures || []).map((fixture) => fixture.path),
    [paths.roleSchema, paths.permissionMatrix, paths.queue, paths.cancellation, paths.approval, paths.redaction, paths.executionLedger],
    "runtimeFixtures.fixtures"
  );
  ensureArrayIncludesAll(runtimeFixtures.roleSchema?.requiredRoleIds, requiredRoles, "runtimeFixtures.roleSchema.requiredRoleIds");
  ensureArrayIncludesAll(runtimeFixtures.roleSchema?.requiredLaneIds, requiredLanes, "runtimeFixtures.roleSchema.requiredLaneIds");
  ensureArrayIncludesAll(runtimeFixtures.permissionMatrixFixture?.requiredLevels, requiredLevels, "runtimeFixtures.permissionMatrixFixture.requiredLevels");
  ensure(runtimeFixtures.taskQueueFixture?.mode === "dry-run-only", "runtimeFixtures task queue mode must be dry-run-only");
  ensure(runtimeFixtures.taskQueueFixture?.writerPolicy === "single-writer", "runtimeFixtures task queue writer policy must be single-writer");
  ensure(runtimeFixtures.cancellationFixture?.cancellationTokenRequired === true, "runtimeFixtures must require cancellation token");
  ensure(runtimeFixtures.approvalFixture?.blanketApprovalAllowed === false, "runtimeFixtures must disallow blanket approval");
  ensure(runtimeFixtures.redactionFixture?.path === paths.redaction, "runtimeFixtures redaction fixture must point to redaction file");
  ensure(runtimeFixtures.redactionFixture?.sampleOutputContainsSecretValue === false, "runtimeFixtures redaction fixture must not contain secret sample");
  ensure(runtimeFixtures.executionLedgerFixture?.path === paths.executionLedger, "runtimeFixtures execution ledger must point to execution ledger file");
  ensure(runtimeFixtures.executionLedgerFixture?.mode === "append-only-planned", "runtimeFixtures execution ledger must stay append-only-planned");
  ensure(runtimeFixtures.executionLedgerFixture?.reviewLedger === paths.reviewLedger, "runtimeFixtures execution ledger must point to review ledger");
}

if (operatingModel) {
  ensure(operatingModel.sourceOfTruth?.roleSchema === paths.roleSchema, "operating model must point to role schema");
  ensure(operatingModel.sourceOfTruth?.permissionMatrix === paths.permissionMatrix, "operating model must point to permission matrix");
  ensure(operatingModel.sourceOfTruth?.dryRunTaskQueue === paths.queue, "operating model must point to dry-run queue");
  ensure(operatingModel.sourceOfTruth?.cancellationFixture === paths.cancellation, "operating model must point to cancellation fixture");
  ensure(operatingModel.sourceOfTruth?.approvalFixture === paths.approval, "operating model must point to approval fixture");
  ensure(operatingModel.sourceOfTruth?.redactionFixture === paths.redaction, "operating model must point to redaction fixture");
  ensure(operatingModel.sourceOfTruth?.executionLedgerFixture === paths.executionLedger, "operating model must point to execution ledger fixture");
  ensure(operatingModel.sourceOfTruth?.runtimeFixtures === paths.runtimeFixtures, "operating model must point to runtime fixture pack");
  ensure(operatingModel.sourceOfTruth?.versionRegistry === paths.versionRegistry, "operating model must point to version registry");
  ensure(operatingModel.sourceOfTruth?.versionPromotionGates === paths.versionPromotionGates, "operating model must point to version promotion gates");
  ensureArrayIncludesAll(operatingModel.evidenceRequirements, [
    "agent role schema",
    "permission matrix",
    "task queue fixture",
    "cancellation fixture",
    "approval fixture",
    "redaction fixture",
    "execution ledger fixture",
    "runtime fixture pack",
  ], "operatingModel.evidenceRequirements");
}

if (pluginIntegration) {
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.roleSchema === paths.roleSchema, "plugin integration must point to role schema");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.permissionMatrix === paths.permissionMatrix, "plugin integration must point to permission matrix");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.dryRunTaskQueue === paths.queue, "plugin integration must point to dry-run queue");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.cancellationFixture === paths.cancellation, "plugin integration must point to cancellation fixture");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.approvalFixture === paths.approval, "plugin integration must point to approval fixture");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.redactionFixture === paths.redaction, "plugin integration must point to redaction fixture");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.executionLedgerFixture === paths.executionLedger, "plugin integration must point to execution ledger fixture");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.runtimeFixtures === paths.runtimeFixtures, "plugin integration must point to runtime fixture pack");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.reviewLedger === paths.reviewLedger, "plugin integration must point to review ledger");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.versionRegistry === paths.versionRegistry, "plugin integration must point to version registry");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.versionPromotionGates === paths.versionPromotionGates, "plugin integration must point to version promotion gates");
  ensureArrayIncludesAll(pluginIntegration.runtimeIntegration?.mcpResources, [
    "seis://ai/version-registry.json",
    "seis://ai/20b-model-card-template.json",
    "seis://ai/20b-dataset-card-template.json",
    "seis://ai/version-promotion-gates.json",
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
  ensureArrayIncludesAll(pluginIntegration.qualityCommands, [
    "npm run check:seis-ai-core-subagent-runtime-fixtures",
    "npm run check:seis-ai-core-version-promotion-gates",
  ], "pluginIntegration.qualityCommands");
}

for (const [text, label] of [
  [aiCoreDoc, "SEIS AI Core docs"],
  [agentRuntimeDoc, "agent runtime docs"],
]) {
  for (const token of [
    "seis-ai-core-agent-role-schema.json",
    "seis-ai-core-agent-permission-matrix.json",
    "seis-ai-core-dry-run-task-queue.json",
    "seis-ai-core-cancellation-fixture.json",
    "seis-ai-core-approval-fixture.json",
    "seis-ai-core-redaction-fixture.json",
    "seis-ai-core-execution-ledger-fixture.json",
    "seis-ai-core-subagent-runtime-fixtures.json",
    "seis-ai-core-subagent-review-ledger.json",
    "seis-ai-core-version-registry.json",
    "subagent-runtime-fixtures.test.mjs",
    "subagent-runtime-policy.mjs",
    "subagent-runtime-policy.test.mjs",
  ]) {
    ensure(text.includes(token), `${label} missing ${token}`);
  }
}

for (const token of [
  "simulateDryRunDecision",
  "approval-gated-cloud-deploy-preview",
  "blocked-pending-human-approval",
  "laterToolCallsAllowed",
  "secretValuesStored",
]) {
  ensure(subagentRuntimeTest.includes(token), `sub-agent runtime fixture simulation test missing ${token}`);
}

for (const token of [
  "evaluateSubagentRuntimePolicy",
  "evaluateCancellationSignal",
  "evaluateRequestedTool",
  "evaluateRequestedPath",
  "matchesScope",
]) {
  ensure(subagentRuntimePolicy.includes(token), `sub-agent runtime policy helper missing ${token}`);
  ensure(subagentRuntimePolicyTest.includes(token) || token === "evaluateCancellationSignal" || token === "evaluateRequestedTool" || token === "evaluateRequestedPath", `sub-agent runtime policy test missing ${token}`);
}

ensure(pluginHelper.includes("evaluateSubagentRuntimePolicy"), "plugin integration helper must use shared sub-agent runtime policy");

for (const [text, label] of [
  [tools, "SEIS AI Core agent tools"],
  [mcpServer, "SEIS AI Core MCP server"],
  [pluginHelper, "SEIS AI Core plugin helper"],
]) {
  ensure(text.includes("SUBAGENT_DRY_RUN_TASK_TOOL"), `${label} must expose SUBAGENT_DRY_RUN_TASK_TOOL`);
  ensure(text.includes("subagentDryRunTaskDecision"), `${label} must reference subagentDryRunTaskDecision`);
}

for (const [text, label] of [
  [mcpServer, "SEIS AI Core MCP server"],
  [pluginHelper, "SEIS AI Core plugin helper"],
]) {
  ensure(text.includes("SUBAGENT_REDACTION_FIXTURE_PATH"), `${label} must expose SUBAGENT_REDACTION_FIXTURE_PATH`);
  ensure(text.includes("SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH"), `${label} must expose SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH`);
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-ai-core-subagent-runtime-fixtures"] ===
      "node scripts/check-seis-ai-core-subagent-runtime-fixtures.mjs",
    "package.json must expose check:seis-ai-core-subagent-runtime-fixtures"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-ai-core-subagent-runtime-fixtures"),
    "quality:governance must include check:seis-ai-core-subagent-runtime-fixtures"
  );
}

if (failures.length) {
  console.error("SEIS AI Core sub-agent runtime fixtures check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS AI Core sub-agent runtime fixtures check passed.");

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

function assertUnique(values, label) {
  const filtered = values.filter(Boolean);
  ensure(new Set(filtered).size === filtered.length, `${label} must be unique`);
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
