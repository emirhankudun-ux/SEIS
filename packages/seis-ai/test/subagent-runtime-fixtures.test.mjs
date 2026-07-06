import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));

function readFixture(relativePath) {
  return JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

const queue = readFixture("content/development/seis-ai-core-dry-run-task-queue.json");
const cancellation = readFixture("content/development/seis-ai-core-cancellation-fixture.json");
const approval = readFixture("content/development/seis-ai-core-approval-fixture.json");
const redaction = readFixture("content/development/seis-ai-core-redaction-fixture.json");
const ledger = readFixture("content/development/seis-ai-core-execution-ledger-fixture.json");
const runtimeFixtures = readFixture("content/development/seis-ai-core-subagent-runtime-fixtures.json");

function getTask(taskId) {
  const task = queue.sampleTasks.find((candidate) => candidate.id === taskId);
  assert.ok(task, `missing sample task: ${taskId}`);
  return task;
}

function simulateDryRunDecision(task, decision, overrides = {}) {
  const record = {
    id: `simulated-${task.id}-${decision}`,
    taskId: task.id,
    laneId: task.laneId,
    roleId: task.roleId,
    permissionLevel: task.permissionLevel,
    decision,
    stateBefore: task.state,
    stateAfter: overrides.stateAfter ?? task.state,
    dryRunOnly: true,
    realExecutionBlocked: true,
    externalMutationPerformed: false,
    fileMutationPerformed: false,
    approvalRequired: Boolean(task.approvalRequired),
    approvalRecordId: overrides.approvalRecordId ?? null,
    cancellationSignal: overrides.cancellationSignal ?? null,
    validator: task.validator,
    rollbackNote: task.rollbackNote,
    redactionStatus: "passed",
    secretValuesStored: false,
    createdAt: "2026-06-23T00:00:00.000Z",
  };

  for (const field of ledger.requiredFields) {
    assert.ok(Object.hasOwn(record, field), `simulated ledger record missing ${field}`);
  }

  return record;
}

describe("SEIS AI Core sub-agent runtime fixture simulation", () => {
  it("keeps the consolidated runtime pack simulation-only", () => {
    assert.equal(runtimeFixtures.runtimeBoundary.currentLevel, "status-and-plan-only");
    assert.equal(runtimeFixtures.runtimeBoundary.backgroundAutomation, "disabled");
    assert.equal(runtimeFixtures.runtimeBoundary.writeExecution, "disabled");
    assert.equal(runtimeFixtures.runtimeBoundary.credentialAccess, "forbidden");
    assert.equal(runtimeFixtures.executableDryRunTestPlan.path, "packages/seis-ai/test/subagent-runtime-fixtures.test.mjs");
    assert.equal(runtimeFixtures.executableDryRunTestPlan.mode, "simulation-only");
    assert.equal(runtimeFixtures.executableDryRunTestPlan.enablesRuntimeExecution, false);
  });

  it("blocks approval-gated tasks while approval is pending", () => {
    const task = getTask("approval-gated-cloud-deploy-preview");
    const request = approval.sampleRequests.find((candidate) => candidate.id === "approval-cloud-deploy-preview");

    assert.equal(task.state, "awaiting-approval");
    assert.equal(task.approvalRequired, true);
    assert.equal(task.externalMutation, false);
    assert.equal(request.status, "pending-human-approval");
    assert.equal(request.executionBlocked, true);

    const record = simulateDryRunDecision(task, "blocked-pending-human-approval", {
      stateAfter: "awaiting-approval",
      approvalRecordId: request.id,
    });

    assert.equal(record.realExecutionBlocked, true);
    assert.equal(record.externalMutationPerformed, false);
    assert.equal(record.fileMutationPerformed, false);
    assert.equal(record.secretValuesStored, false);
  });

  it("cancels a running dry-run task without allowing later tool calls", () => {
    const task = { ...getTask(cancellation.sampleCancellation.taskId), state: cancellation.sampleCancellation.fromState };

    assert.equal(cancellation.cancellationTokenRequired, true);
    assert.ok(cancellation.supportedSignals.includes(cancellation.sampleCancellation.reason));
    assert.ok(cancellation.terminalStates.includes(cancellation.sampleCancellation.toState));
    assert.equal(cancellation.sampleCancellation.externalMutationPerformed, false);
    assert.equal(cancellation.sampleCancellation.laterToolCallsAllowed, false);

    const record = simulateDryRunDecision(task, "cancelled", {
      stateAfter: cancellation.sampleCancellation.toState,
      cancellationSignal: cancellation.sampleCancellation.reason,
    });

    assert.equal(record.stateBefore, "running");
    assert.equal(record.stateAfter, "cancelled");
    assert.equal(record.externalMutationPerformed, false);
    assert.equal(record.fileMutationPerformed, false);
    assert.equal(record.realExecutionBlocked, true);
  });

  it("keeps sample ledger records mapped to known tasks and redacted", () => {
    const taskIds = new Set(queue.sampleTasks.map((task) => task.id));

    for (const record of ledger.sampleRecords) {
      assert.equal(taskIds.has(record.taskId), true, `${record.id} must map to a sample dry-run task`);
      assert.equal(record.dryRunOnly, true);
      assert.equal(record.realExecutionBlocked, true);
      assert.equal(record.externalMutationPerformed, false);
      assert.equal(record.fileMutationPerformed, false);
      assert.equal(record.secretValuesStored, false);
      assert.equal(record.redactionStatus, "passed");
    }
  });

  it("requires redacted diagnostics before future promotion", () => {
    assert.equal(redaction.promptAndResponseLoggingDefault, "disabled");
    assert.equal(redaction.rawProviderErrorsExposed, false);
    assert.equal(redaction.sampleOutputContainsSecretValue, false);

    for (const record of redaction.sampleRecords) {
      assert.equal(record.containsSecretValue, false);
      assert.equal(record.usesPlaceholders, true);
      assert.ok(record.placeholderExamples.every((value) => value.startsWith("<REDACTED_")));
      assert.ok(record.forbiddenDiagnosticFields.includes("rawErrorBody"));
      assert.ok(record.forbiddenDiagnosticFields.includes("authorizationHeader"));
      assert.ok(record.forbiddenDiagnosticFields.includes("credentialValue"));
    }
  });
});
