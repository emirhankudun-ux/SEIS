import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("Auto Mode declares the requested 30-step cadence without self-marking planned rounds complete", () => {
  const check = run(["scripts/create-seis-general-plugin-autopilot.mjs", "--check"]);
  assert.equal(check.status, 0, check.stderr || check.stdout);
  const program = JSON.parse(fs.readFileSync(path.join(root, "content/development/seis-general-plugin-autopilot.json"), "utf8"));
  assert.equal(program.schemaVersion, 3);
  assert.equal(program.currentMarketplace.publicCardCount, 10);
  assert.equal(program.currentMarketplace.internalPackageCount, 30);
  assert.equal(program.currentMarketplace.maximumPackageSize, 15);
  assert.equal(program.immediateCycle.status, "execution-state-in-external-ledger");
  assert.equal(program.immediateCycle.totalSteps, 150);
  assert.equal(program.immediateCycle.stepsPerRound, 30);
  assert.equal(program.immediateCycle.rounds.length, 5);
  assert.ok(program.immediateCycle.rounds.every((round) => round.status === "planned-not-executed" && round.steps.length === 30 && round.steps.every((step) => step.status === "planned-not-executed")));
  assert.equal(program.immediateCycle.completedRoundCount, undefined);
  assert.equal(program.executionLedger.path, "content/development/seis-general-plugin-autopilot-execution.json");
  assert.equal(program.executionLedger.automaticCompletion, false);
  assert.equal(program.fiveWaveSeries.status, "blocked-by-incomplete-five-30-step-rounds");
  assert.equal(program.fiveWaveSeries.activeWave, null);
  assert.equal(program.fiveWaveSeries.nextWave, 1);
  assert.deepEqual(program.escalationSeries.tiers.map((tier) => tier.stepsPerWave), [200, 300, 400, 500, 600]);
  assert.equal(program.tenYearHorizon.length, 10);
  assert.equal(program.executionModel.backgroundExecution, false);
  assert.equal(program.executionModel.planAndBuildInOneInvocation, true);
  assert.equal(program.canonicalAutomation.goalId, "SEIS-GOAL-0029");
  assert.equal(program.canonicalAutomation.runner, "scripts/run-seis-general-plugin-autopilot.mjs");
  assert.equal(program.canonicalAutomation.reviewedPhaseCount, 30);
  assert.equal(program.commandAllowlist, undefined);
});

test("Auto Mode plan and ledger checks are foreground-only and expose one reviewed 30-step round", () => {
  const plan = run(["scripts/run-seis-general-plugin-autopilot.mjs", "--plan"]);
  assert.equal(plan.status, 0, plan.stderr || plan.stdout);
  const report = JSON.parse(plan.stdout);
  assert.equal(report.status, "planned");
  assert.equal(report.foregroundOnly, true);
  assert.equal(report.backgroundExecution, false);
  assert.equal(report.externalWrites, false);
  assert.equal(report.intentionalNetworkActions, false);
  assert.equal(report.intentionalSecretAccess, false);
  assert.equal(report.commandExecuted, false);
  assert.equal(report.githubDelivery.automaticPush, false);
  assert.equal(report.plan.initialRoundCount, 5);
  assert.equal(report.plan.stepsPerInitialRound, 30);
  assert.equal(report.plan.totalInitialSteps, 150);
  assert.ok(Number.isInteger(report.plan.completedRoundCount) && report.plan.completedRoundCount >= 0 && report.plan.completedRoundCount <= 5);
  assert.equal(report.plan.fiveWaveStatus, report.plan.completedRoundCount === 5 ? "ready-for-foreground-wave-1" : "blocked-by-incomplete-five-30-step-rounds");
  assert.equal(report.approvedLocalPhases.length, report.plan.nextRound === null ? 0 : 30);
  assert.equal(report.roleLanes.length, 6);
  assert.ok(report.roleLanes.every((lane) => lane.execution === "foreground-sequential-reviewed-allowlist"));
  const ledgerCheck = run(["scripts/run-seis-general-plugin-autopilot.mjs", "--check"]);
  assert.equal(ledgerCheck.status, 0, ledgerCheck.stderr || ledgerCheck.stdout);
  assert.equal(JSON.parse(ledgerCheck.stdout).status, "valid");
});

function run(args) {
  return spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
}
