import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import {
  PERSONAL_LANE_CYCLE_TOOL,
  PERSONAL_PLUGIN_LANE_TOOLS,
  personalPluginLaneCycle,
} from "../src/lib/plugin-integration.mjs";
import { executeTool, toolDefinitions } from "../src/agent/tools.mjs";

function fixtureRoot() {
  const root = path.join(tmpdir(), `seis-lane-cycle-${process.pid}-${Date.now()}`);
  mkdirSync(path.join(root, "content/development"), { recursive: true });
  const manifest = {
    id: "seis-agent-plugin-integration",
    status: "active",
    primaryInstallId: "seis-ai-agent@seis-repo",
    auditedSnapshot: { authenticationClaim: "not-claimed" },
    activationPolicy: {
      mode: "task-scoped-lane-activation",
      externalMutationRequiresUserConfirmation: true,
    },
    lanes: PERSONAL_PLUGIN_LANE_TOOLS.map((lane) => ({
      id: lane.laneId,
      displayName: lane.displayName,
      role: `${lane.displayName} role`,
      sourceMirror: `plugins/${lane.laneId}`,
      embeddedSkill: `skills/${lane.laneId}.md`,
      mcpTools: [lane.statusTool, lane.planTool],
      defaultGate: `npm run check:${lane.laneId}`,
    })),
  };
  writeFileSync(
    path.join(root, "content/development/seis-agent-plugin-integration.json"),
    JSON.stringify(manifest),
    "utf8"
  );
  for (const lane of PERSONAL_PLUGIN_LANE_TOOLS) {
    mkdirSync(path.join(root, "plugins", lane.laneId), { recursive: true });
    mkdirSync(path.join(root, "skills"), { recursive: true });
    writeFileSync(path.join(root, "skills", `${lane.laneId}.md`), `# ${lane.displayName}\n`, "utf8");
  }
  return root;
}

test("builds a five-lane plan-only cycle from the canonical manifest", () => {
  const root = fixtureRoot();
  try {
    const result = personalPluginLaneCycle(root, "review the next AI Core readiness change");

    assert.equal(result.ok, true);
    assert.equal(result.status, "plan-ready");
    assert.deepEqual(result.laneOrder, ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]);
    assert.equal(result.summary.total, 5);
    assert.equal(result.summary.successful, 5);
    assert.equal(result.runtimeBoundary.planOnly, true);
    assert.equal(result.runtimeBoundary.executionPerformed, false);
    assert.equal(result.runtimeBoundary.providerCallsPerformed, false);
    assert.equal(result.runtimeBoundary.liveMcpSessionStarted, false);
    assert.equal(result.runtimeBoundary.humanApprovalRequiredForExternalMutation, true);
    assert.ok(result.plans.every((plan) => plan.ok && plan.status === "ready" && plan.defaultChecks.length === 1));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects unknown or duplicate lane selections without planning", () => {
  const root = fixtureRoot();
  try {
    const unknown = personalPluginLaneCycle(root, "inspect", ["seis", "missing"]);
    assert.equal(unknown.ok, false);
    assert.match(unknown.error, /unknown personal SEIS lane/);

    const duplicate = personalPluginLaneCycle(root, "inspect", ["seis", "seis"]);
    assert.equal(duplicate.ok, false);
    assert.match(duplicate.error, /without duplicates/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("exposes the cycle through the local AI agent tool surface", () => {
  assert.ok(toolDefinitions().some((tool) => tool.name === PERSONAL_LANE_CYCLE_TOOL));
  const root = fixtureRoot();
  try {
    const output = JSON.parse(executeTool(PERSONAL_LANE_CYCLE_TOOL, { request: "inspect" }, { repoRoot: root, webRoot: root }));
    assert.equal(output.ok, true);
    assert.equal(output.summary.total, 5);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
