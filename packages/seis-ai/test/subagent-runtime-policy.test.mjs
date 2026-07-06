import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateSubagentRuntimePolicy,
  matchesScope,
} from "../src/lib/subagent-runtime-policy.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));

function readFixture(relativePath) {
  return JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

const roleSchema = readFixture("content/development/seis-ai-core-agent-role-schema.json");
const permissionMatrix = readFixture("content/development/seis-ai-core-agent-permission-matrix.json");
const queue = readFixture("content/development/seis-ai-core-dry-run-task-queue.json");
const cancellationFixture = readFixture("content/development/seis-ai-core-cancellation-fixture.json");
const approvalFixture = readFixture("content/development/seis-ai-core-approval-fixture.json");

function taskById(taskId) {
  const task = queue.sampleTasks.find((candidate) => candidate.id === taskId);
  assert.ok(task, `missing task ${taskId}`);
  return task;
}

function roleForTask(task) {
  const role = roleSchema.roles.find((candidate) => candidate.id === task.roleId);
  assert.ok(role, `missing role ${task.roleId}`);
  return role;
}

function permissionForTask(task) {
  const permission = permissionMatrix.levels.find((candidate) => candidate.level === task.permissionLevel);
  assert.ok(permission, `missing permission ${task.permissionLevel}`);
  return permission;
}

function evaluate(taskId, input = {}) {
  const task = taskById(taskId);
  return evaluateSubagentRuntimePolicy({
    repoRoot,
    task,
    role: roleForTask(task),
    permission: permissionForTask(task),
    cancellationFixture,
    approvalFixture,
    ...input,
  });
}

describe("SEIS AI Core sub-agent runtime policy", () => {
  it("allows in-scope plan-only evaluation while blocking real execution", () => {
    const result = evaluate("dry-run-seis-hub-foundation-review", {
      requestedTool: "seis_hub_plan",
      requestedPath: "docs/ai/agent-runtime.md",
    });

    assert.equal(result.ok, true);
    assert.equal(result.decision, "allowed");
    assert.equal(result.nextState, "validated");
    assert.equal(result.realExecutionBlocked, true);
    assert.equal(result.externalMutationPerformed, false);
    assert.equal(result.fileMutationPerformed, false);
    assert.equal(result.requestedPath.allowed, true);
  });

  it("blocks approval-gated external tasks before human approval", () => {
    const result = evaluate("approval-gated-cloud-deploy-preview", {
      requestedTool: "seis_cloud_plan",
      requestedPath: "deploy/preview-plan.md",
    });

    assert.equal(result.decision, "blocked");
    assert.equal(result.nextState, "awaiting-approval");
    assert.equal(result.approvalRequired, true);
    assert.equal(result.blanketApprovalAllowed, false);
    assert.deepEqual(result.requiredApprovalEvidence, ["target", "rollback plan", "credential boundary", "dry-run result"]);
  });

  it("denies unsupported cancellation signals before evaluating execution", () => {
    const result = evaluate("dry-run-seis-code-patch-plan", {
      signal: "unbounded-background-loop",
    });

    assert.equal(result.decision, "denied");
    assert.equal(result.cancellation.allowed, false);
    assert.match(result.reason, /unsupported cancellation signal/);
  });

  it("cancels supported dry-run signals into a terminal no-tool-call state", () => {
    const result = evaluate("dry-run-seis-code-patch-plan", {
      signal: "operator-cancel",
    });

    assert.equal(result.decision, "cancelled");
    assert.equal(result.nextState, "cancelled");
    assert.equal(result.cancellation.laterToolCallsAllowed, false);
    assert.equal(result.externalMutationPerformed, false);
    assert.equal(result.fileMutationPerformed, false);
  });

  it("denies denied tools, non-allowlisted tools, out-of-scope paths, and traversal", () => {
    const deniedTool = evaluate("dry-run-seis-code-patch-plan", {
      requestedTool: "dependency_install",
    });
    assert.equal(deniedTool.decision, "denied");
    assert.equal(deniedTool.requestedTool.allowed, false);

    const nonAllowlistedTool = evaluate("dry-run-seis-code-patch-plan", {
      requestedTool: "seis_cloud_plan",
    });
    assert.equal(nonAllowlistedTool.decision, "denied");
    assert.match(nonAllowlistedTool.reason, /not in role allowlist/);

    const outOfScope = evaluate("dry-run-seis-code-patch-plan", {
      requestedPath: "deploy/prod.yml",
    });
    assert.equal(outOfScope.decision, "denied");
    assert.equal(outOfScope.requestedPath.allowed, false);

    const traversal = evaluate("dry-run-seis-code-patch-plan", {
      requestedPath: "../private.env",
    });
    assert.equal(traversal.decision, "denied");
    assert.equal(traversal.requestedPath.reason, "path traversal denied");
  });

  it("matches only explicit scopes and bounded glob patterns", () => {
    assert.equal(matchesScope("docs/ai/agent-runtime.md", "docs/**"), true);
    assert.equal(matchesScope("docs/ai/agent-runtime.md", "docs/*"), false);
    assert.equal(matchesScope("AGENTS.md", "AGENTS.md"), true);
    assert.equal(matchesScope("AGENTS.md/extra", "AGENTS.md"), false);
    assert.equal(matchesScope("content/development/plan.json", "content/development/**"), true);
    assert.equal(matchesScope("content/private/plan.json", "content/development/**"), false);
    assert.equal(matchesScope("apps/web/index.html", "apps/**"), true);
    assert.equal(matchesScope("apps/web/index.html", "apps/*/index.html"), false);
  });
});
