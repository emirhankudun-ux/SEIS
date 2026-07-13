import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import {
  PERSONAL_LANE_CYCLE_TOOL,
  PERSONAL_LANE_CYCLE_CHECKS_TOOL,
  PERSONAL_PLUGIN_LANE_TOOLS,
  personalPluginLaneCycle,
  runPersonalLaneCycleChecks,
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
    mkdirSync(path.join(root, "plugins", lane.laneId, "assets"), { recursive: true });
    mkdirSync(path.join(root, "skills"), { recursive: true });
    writeFileSync(path.join(root, "skills", `${lane.laneId}.md`), `# ${lane.displayName}\n`, "utf8");
    writeFileSync(
      path.join(root, "plugins", lane.laneId, "assets", "lane-profile.json"),
      JSON.stringify({ qualityCommands: ["node scripts/check-lane.mjs"] }),
      "utf8"
    );
  }
  mkdirSync(path.join(root, "scripts"), { recursive: true });
  writeFileSync(
    path.join(root, "scripts", "check-lane.mjs"),
    'console.log("local check passed; token: ghp_1234567890abcdef");\n',
    "utf8"
  );
  execFileSync("git", ["init", "-q"], { cwd: root });
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
  assert.ok(toolDefinitions().some((tool) => tool.name === PERSONAL_LANE_CYCLE_CHECKS_TOOL));
  const root = fixtureRoot();
  try {
    const output = JSON.parse(executeTool(PERSONAL_LANE_CYCLE_TOOL, { request: "inspect" }, { repoRoot: root, webRoot: root }));
    assert.equal(output.ok, true);
    assert.equal(output.summary.total, 5);
    const checksOutput = JSON.parse(executeTool(PERSONAL_LANE_CYCLE_CHECKS_TOOL, { request: "inspect", timeoutMs: 1000 }, { repoRoot: root, webRoot: root }));
    assert.equal(checksOutput.ok, true);
    assert.equal(checksOutput.summary.checkPassed, 5);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runs only allowlisted local checks and redacts their output", () => {
  const root = fixtureRoot();
  try {
    const cycle = personalPluginLaneCycle(root, "validate the lane cycle");
    const result = runPersonalLaneCycleChecks(root, cycle, { timeoutMs: 1000 });

    assert.equal(result.ok, true);
    assert.equal(result.status, "checks-passed");
    assert.equal(result.summary.checkTotal, 5);
    assert.equal(result.summary.checkPassed, 5);
    assert.equal(result.checkBoundary.shell, false);
    assert.equal(result.checkBoundary.outputRedacted, true);
    assert.equal(result.runtimeBoundary.localValidationPerformed, true);
    assert.equal(result.runtimeBoundary.workspaceMutationDetected, false);
    assert.ok(result.checks.every((check) => check.status === "passed"));
    assert.ok(result.checks.every((check) => !check.output.includes("ghp_")));
    assert.ok(result.checks.every((check) => check.output.includes("[REDACTED_SECRET]")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("blocks an unsafe check command before spawning a process", () => {
  const root = fixtureRoot();
  try {
    const cycle = personalPluginLaneCycle(root, "validate the lane cycle");
    cycle.plans[0].defaultChecks = ["node scripts/check-lane.mjs; touch unsafe.txt"];
    const result = runPersonalLaneCycleChecks(root, cycle, { timeoutMs: 1000 });

    assert.equal(result.ok, false);
    assert.equal(result.summary.checkBlocked, 1);
    assert.equal(result.checks[0].status, "blocked");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
