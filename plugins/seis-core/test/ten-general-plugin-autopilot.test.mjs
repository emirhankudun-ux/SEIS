import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("Auto Mode records the requested 30-step, five-round, five-wave, ten-year foreground cadence", () => {
  const check = spawnSync(process.execPath, ["scripts/create-seis-general-plugin-autopilot.mjs", "--check"], { cwd: root, encoding: "utf8" });
  assert.equal(check.status, 0, check.stderr || check.stdout);
  const program = JSON.parse(fs.readFileSync(path.join(root, "content/development/seis-general-plugin-autopilot.json"), "utf8"));
  assert.equal(program.currentMarketplace.publicCardCount, 10);
  assert.equal(program.currentMarketplace.internalPackageCount, 30);
  assert.equal(program.currentMarketplace.maximumPackageSize, 15);
  assert.equal(program.immediateCycle.status, "completed-five-30-step-rounds");
  assert.equal(program.immediateCycle.completedRoundCount, 5);
  assert.equal(program.immediateCycle.totalSteps, 150);
  assert.equal(program.immediateCycle.stepsPerRound, 30);
  assert.equal(program.immediateCycle.rounds.length, 5);
  assert.ok(program.immediateCycle.rounds.every((round) => round.steps.length === 30));
  assert.equal(program.fiveWaveSeries.waves, 5);
  assert.equal(program.fiveWaveSeries.stepsPerWave, 100);
  assert.equal(program.fiveWaveSeries.activeWave, 1);
  assert.equal(program.fiveWaveSeries.status, "wave-1-in-progress-foreground-only");
  assert.deepEqual(program.escalationSeries.tiers.map((tier) => tier.stepsPerWave), [200, 300, 400, 500, 600]);
  assert.equal(program.tenYearHorizon.length, 10);
  assert.equal(program.executionModel.backgroundExecution, false);
  assert.equal(program.executionModel.planAndBuildInOneInvocation, true);
  assert.equal(program.canonicalAutomation.goalId, "SEIS-GOAL-0025");
  assert.equal(program.canonicalAutomation.reviewedPhaseCount, 48);
  assert.equal(program.canonicalAutomation.repositoryAnchored, true);
  assert.equal(program.commandAllowlist, undefined);
});

test("Auto Mode plan contains only local foreground phases and no delivery action", () => {
  const result = spawnSync(process.execPath, ["scripts/run-seis-general-plugin-autopilot.mjs", "--plan"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "planned");
  assert.equal(report.foregroundOnly, true);
  assert.equal(report.backgroundExecution, false);
  assert.equal(report.externalWrites, false);
  assert.equal(report.intentionalNetworkActions, false);
  assert.equal(report.commandExecuted, false);
  assert.equal(report.githubDelivery.automaticPush, false);
  assert.equal(report.approvedLocalPhases.length, 48);
  assert.equal(report.roleLanes.length, 6);
});
