import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../../..");
const generator = path.join(root, "scripts/create-seis-public-plugin-supervised-autopilot.mjs");
const runner = path.join(root, "scripts/run-seis-public-plugin-supervised-autopilot.mjs");
const programPath = path.join(root, "content/development/seis-public-plugin-supervised-autopilot.json");
const roadmapPath = path.join(root, "docs/roadmap/SEIS_PUBLIC_PLUGIN_SUPERVISED_AUTOPILOT.md");

test("supervised autopilot program is fresh and preserves the curated public boundary", () => {
  const check = spawnSync(process.execPath, [generator, "--check"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(check.status, 0, check.stderr || check.stdout);

  const program = JSON.parse(fs.readFileSync(programPath, "utf8"));
  assert.equal(program.id, "seis-public-plugin-supervised-autopilot");
  assert.equal(program.goalId, "SEIS-GOAL-0025");
  assert.equal(program.parentGoalId, "SEIS-GOAL-0024");
  assert.equal(program.currentMarketplace.canonicalInstall, "seis-ai-agent@seis-repo");
  assert.equal(program.currentMarketplace.publicCardCount, 10);
  assert.equal(program.currentMarketplace.generalPluginCardCount, 10);
  assert.equal(program.currentMarketplace.internalPackageCount, 30);
  assert.equal(program.currentMarketplace.internalPackageCardCount, 0);
  assert.equal(program.currentMarketplace.retainedSourceCapabilityCount, 380);
  assert.equal(program.currentMarketplace.maximumPackageSize, 15);
  assert.equal(program.immediateCycle.totalSteps, 30);
  assert.equal(program.immediateCycle.rounds.length, 5);
  assert.ok(program.immediateCycle.rounds.every((round) => round.steps.length === 6));
  assert.equal(program.fiveWaveSeries.waves, 5);
  assert.equal(program.fiveWaveSeries.stepsPerWave, 100);
  assert.equal(program.fiveWaveSeries.roundsPerWave, 5);
  assert.equal(program.fiveWaveSeries.nextSeries.waves, 5);
  assert.equal(program.fiveWaveSeries.nextSeries.stepsPerWave, 200);
  assert.equal(program.fiveWaveSeries.nextSeries.status, "active-round-11-plan-and-local-build");
  assert.equal(program.escalationSeries.id, "seis-public-plugin-five-wave-step-escalation");
  assert.equal(program.escalationSeries.tierCount, 5);
  assert.equal(program.escalationSeries.waveCountPerTier, 5);
  assert.equal(program.escalationSeries.stepIncreasePerTier, 100);
  assert.equal(program.escalationSeries.currentMarketplaceCardCount, 10);
  assert.equal(program.escalationSeries.maximumBundleSize, 15);
  assert.equal(program.escalationSeries.workflowStepsAreMarketplaceCards, false);
  assert.deepEqual(program.escalationSeries.tiers.map((tier) => tier.stepsPerWave), [200, 300, 400, 500, 600]);
  assert.deepEqual(program.escalationSeries.tiers.map((tier) => tier.years), [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]);
  assert.ok(program.escalationSeries.tiers.every((tier) => tier.waveCount === 5 && tier.stepsPerRound === 20 && tier.roundsPerWave === tier.stepsPerWave / 20 && tier.totalPlannedSteps === tier.stepsPerWave * 5 && tier.backgroundExecution === false && tier.marketplaceCardExpansion === false));
  assert.equal(program.escalationSeries.tiers[0].status, "active-round-11-plan-and-local-build");
  assert.equal(program.escalationSeries.tiers[0].activationAuthority, "current-user-direction-2026-07-22");
  assert.deepEqual(program.escalationSeries.tiers[0].activeCycle.inProgressStepNumbers, [1]);
  assert.ok(program.escalationSeries.tiers.slice(1).every((tier) => tier.status === "strategic-gated-not-background" && tier.activationAuthority === "not-yet-granted" && tier.activeCycle === null));
  assert.equal(program.round11Cycle.round, 11);
  assert.equal(program.round11Cycle.totalSteps, 200);
  assert.equal(program.round11Cycle.rounds.length, 10);
  assert.ok(program.round11Cycle.rounds.every((round) => round.steps.length === 20));
  assert.equal(program.round11Cycle.status, "in-progress-plan-and-local-build");
  assert.equal(program.round11Cycle.historicalWave5CloseoutClaimed, false);
  assert.equal(program.tenYearHorizon.length, 10);
  assert.ok(program.tenYearHorizon.every((year, index) => year.year === index + 1 && year.execution === "strategic-gated-not-background" && year.escalationTierId === `five-wave-${[200, 300, 400, 500, 600][Math.floor(index / 2)]}` && year.seriesWaveCount === 5 && year.stepsPerWave === [200, 300, 400, 500, 600][Math.floor(index / 2)]));
  assert.deepEqual(program.automationRoles.map((role) => role.id), ["architect-planner", "bundle-builder", "safety-reviewer", "qa-validator", "evidence-reporter", "delivery-coordinator"]);
  assert.equal(program.executionModel.persistentProcess, false);
  assert.equal(program.executionModel.backgroundExecution, false);
  assert.equal(program.executionModel.roleExecution, "foreground-sequential-reviewed-allowlist");
  assert.equal(program.executionModel.intentionalNetworkActions, false);
  assert.equal(program.executionModel.intentionalSecretAccess, false);
  assert.equal(program.executionModel.isolationLevel, "reviewed-allowlist-no-os-sandbox");
  assert.equal(program.executionModel.ambientNetworkIsolationEnforced, false);
  assert.equal(program.executionModel.ambientFilesystemIsolationEnforced, false);
  assert.equal(program.executionModel.descendantTerminationGuaranteed, false);
  assert.equal(program.executionModel.githubPush, false);
  assert.equal(program.executionModel.commit, false);
  assert.equal(program.executionModel.merge, false);
  assert.equal(program.executionModel.release, false);
  assert.equal(program.executionModel.deployment, false);
  assert.equal(program.commandAllowlist.length, 48);
  assert.ok(program.commandAllowlist.every((entry) => (entry.command === "node" || entry.command === "git") && entry.externalWrite === false && entry.network === false && entry.secrets === false && typeof entry.automationRoleId === "string"));
  assert.ok(program.automationRoles.every((role) => program.commandAllowlist.some((entry) => entry.automationRoleId === role.id)));
});

test("plan mode is read-only and reports a foreground-only plan", () => {
  const before = [digest(programPath), digest(roadmapPath)];
  const result = spawnSync(process.execPath, [runner, "--plan"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, "plan");
  assert.equal(report.status, "planned");
  assert.equal(report.foregroundOnly, true);
  assert.equal(report.backgroundExecution, false);
  assert.equal(report.externalWrites, false);
  assert.equal(report.intentionalNetworkActions, false);
  assert.equal(report.intentionalSecretAccess, false);
  assert.equal(report.isolationLevel, "reviewed-allowlist-no-os-sandbox");
  assert.equal(report.ambientNetworkIsolationEnforced, false);
  assert.equal(report.ambientFilesystemIsolationEnforced, false);
  assert.equal(report.descendantTerminationGuaranteed, false);
  assert.equal(report.commandExecuted, false);
  assert.equal(report.results.length, 0);
  assert.equal(report.approvedLocalPhases.length, 48);
  assert.equal(report.plan.nextSeriesWaveCount, 5);
  assert.equal(report.plan.nextSeriesStepsPerWave, 200);
  assert.equal(report.plan.round11StepCount, 200);
  assert.equal(report.plan.round11Status, "in-progress-plan-and-local-build");
  assert.equal(report.plan.escalationTierCount, 5);
  assert.equal(report.plan.activeEscalationTierId, "five-wave-200");
  assert.equal(report.plan.activeEscalationStepsPerWave, 200);
  assert.equal(report.plan.nextStrategicEscalationTierId, "five-wave-300");
  assert.equal(report.plan.nextStrategicEscalationStepsPerWave, 300);
  assert.equal(report.plan.roleExecution, "foreground-sequential-reviewed-allowlist");
  assert.deepEqual(report.roleLanes.map((lane) => lane.id), ["architect-planner", "bundle-builder", "safety-reviewer", "qa-validator", "evidence-reporter", "delivery-coordinator"]);
  assert.equal(report.roleLanes.reduce((count, lane) => count + lane.phaseCount, 0), 48);
  assert.ok(report.roleLanes.every((lane) => lane.execution === "foreground-sequential-reviewed-allowlist" && lane.phaseCount === lane.phases.length && lane.phaseCount > 0));
  assert.equal(report.githubDelivery.automaticPush, false);
  assert.deepEqual([digest(programPath), digest(roadmapPath)], before);
});

test("plan mode is anchored to the runner repository from a foreign working directory", () => {
  const before = [digest(programPath), digest(roadmapPath)];
  const foreign = fs.mkdtempSync(path.join(os.tmpdir(), "seis-autopilot-foreign-cwd-"));
  try {
    const result = spawnSync(process.execPath, [runner, "--plan"], {
      cwd: foreign,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout);
    assert.equal(report.mode, "plan");
    assert.equal(report.approvedLocalPhases.length, 48);
    assert.deepEqual([digest(programPath), digest(roadmapPath)], before);
  } finally {
    fs.rmSync(foreign, { recursive: true, force: true });
  }
});

test("runner rejects a card count that is not the exact current ten-card projection", () => {
  const fixture = makeRunnerFixture();
  const fixtureProgramPath = path.join(fixture.root, "content/development/seis-public-plugin-supervised-autopilot.json");
  try {
    const fixtureProgram = JSON.parse(fs.readFileSync(fixtureProgramPath, "utf8"));
    fixtureProgram.currentMarketplace.publicCardCount = 11;
    fs.writeFileSync(fixtureProgramPath, `${JSON.stringify(fixtureProgram, null, 2)}\n`);
    const result = spawnSync(process.execPath, [path.join(fixture.root, "scripts/run-seis-public-plugin-supervised-autopilot.mjs"), "--plan"], {
      cwd: fixture.root,
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /current public-card count is invalid/);
  } finally {
    fs.rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test("runner rejects a future escalation tier that claims automatic activation", () => {
  const fixture = makeRunnerFixture();
  const fixtureProgramPath = path.join(fixture.root, "content/development/seis-public-plugin-supervised-autopilot.json");
  try {
    const fixtureProgram = JSON.parse(fs.readFileSync(fixtureProgramPath, "utf8"));
    fixtureProgram.escalationSeries.tiers[1].status = "active-round-12-without-current-authorization";
    fs.writeFileSync(fixtureProgramPath, `${JSON.stringify(fixtureProgram, null, 2)}\n`);
    const result = spawnSync(process.execPath, [path.join(fixture.root, "scripts/run-seis-public-plugin-supervised-autopilot.mjs"), "--plan"], {
      cwd: fixture.root,
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /future escalation tiers must remain gated/);
  } finally {
    fs.rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test("runner rejects a tampered reviewed phase-to-role assignment", () => {
  const fixture = makeRunnerFixture();
  const fixtureProgramPath = path.join(fixture.root, "content/development/seis-public-plugin-supervised-autopilot.json");
  try {
    const fixtureProgram = JSON.parse(fs.readFileSync(fixtureProgramPath, "utf8"));
    fixtureProgram.commandAllowlist[0].automationRoleId = "delivery-coordinator";
    fs.writeFileSync(fixtureProgramPath, `${JSON.stringify(fixtureProgram, null, 2)}\n`);
    const result = spawnSync(process.execPath, [path.join(fixture.root, "scripts/run-seis-public-plugin-supervised-autopilot.mjs"), "--plan"], {
      cwd: fixture.root,
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /allowlist automation role mismatch/);
  } finally {
    fs.rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test("runner rejects a symlinked allowlisted phase target in an anchored fixture", () => {
  const fixture = makeRunnerFixture();
  const outside = path.join(fixture.parent, "outside-phase.mjs");
  const target = path.join(fixture.root, "scripts/create-seis-public-plugin-family.mjs");
  try {
    fs.writeFileSync(outside, "// outside\n");
    fs.rmSync(target);
    fs.symlinkSync(outside, target);
    const result = spawnSync(process.execPath, [path.join(fixture.root, "scripts/run-seis-public-plugin-supervised-autopilot.mjs"), "--plan"], {
      cwd: fixture.parent,
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /symbolic-link repository path is forbidden/);
  } finally {
    fs.rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test("runner has a fixed local allowlist and no shell or external-delivery path", () => {
  const source = fs.readFileSync(runner, "utf8");
  assert.match(source, /spawnSync/);
  assert.match(source, /shell:\s*false/);
  assert.match(source, /O_NOFOLLOW/);
  assert.match(source, /fileURLToPath\(import\.meta\.url\)/);
  assert.match(source, /rev-parse/);
  assert.match(source, /phase target changed after allowlist validation/);
  assert.match(source, /automationRoleId/);
  assert.match(source, /GIT_CONFIG_NOSYSTEM/);
  assert.match(source, /GIT_CONFIG_GLOBAL/);
  assert.match(source, /MAX_PHASE_OUTPUT_BYTES/);
  assert.doesNotMatch(source, /execSync|execFileSync|shell:\s*true|https?:\/\/|fetch\s*\(|\bgh\s+|git\s+push/);
  assert.doesNotMatch(source, /HOME:\s*process\.env\.HOME/);
  assert.doesNotMatch(source, /process\.argv\.slice\(2\).*command/);
  assert.match(source, /scripts\/create-seis-public-plugin-family\.mjs/);
  assert.match(source, /scripts\/create-seis-public-plugin-bundles\.mjs/);
  assert.match(source, /scripts\/create-seis-core-plugin-catalog\.mjs/);
  assert.match(source, /scripts\/create-seis-unified-plugin-suite\.mjs/);
  assert.match(source, /scripts\/create-seis-mcp-permission\.mjs/);
  assert.match(source, /scripts\/create-seis-public-plugin-consolidation\.mjs/);
  assert.match(source, /scripts\/create-seis-public-plugin-supervised-autopilot\.mjs/);
  assert.match(source, /scripts\/check-seis-agent-plugin-integration\.mjs/);
  assert.match(source, /plugins\/seis-core\/test\/marketplace-integrity\.test\.mjs/);
  assert.match(source, /plugins\/seis-core\/test\/project-manifest-audit\.test\.mjs/);
  assert.match(source, /\["diff", "--check"\]/);
});

function makeRunnerFixture() {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "seis-autopilot-runner-fixture-"));
  const fixtureRoot = path.join(parent, "repo");
  fs.mkdirSync(path.join(fixtureRoot, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, "content/development"), { recursive: true });
  fs.copyFileSync(runner, path.join(fixtureRoot, "scripts/run-seis-public-plugin-supervised-autopilot.mjs"));
  fs.copyFileSync(programPath, path.join(fixtureRoot, "content/development/seis-public-plugin-supervised-autopilot.json"));
  fs.writeFileSync(path.join(fixtureRoot, "project.ecosystem.yaml"), "project:\n  id: seis-plugin-root\n");
  fs.writeFileSync(path.join(fixtureRoot, "package.json"), "{\"name\":\"seis\"}\n");
  const program = JSON.parse(fs.readFileSync(programPath, "utf8"));
  for (const entry of program.commandAllowlist.filter((item) => item.command === "node")) {
    const relativeTarget = entry.args[0] === "--test" ? entry.args[1] : entry.args[0];
    const absoluteTarget = path.join(fixtureRoot, relativeTarget);
    fs.mkdirSync(path.dirname(absoluteTarget), { recursive: true });
    fs.writeFileSync(absoluteTarget, "// reviewed fixture target\n");
  }
  const git = spawnSync("/usr/bin/git", ["init", "--quiet"], { cwd: fixtureRoot, encoding: "utf8" });
  assert.equal(git.status, 0, git.stderr);
  return { parent, root: fixtureRoot };
}

function digest(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
