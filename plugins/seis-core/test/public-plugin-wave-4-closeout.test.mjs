import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-closeout.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-closeout.mjs");

test("closes Wave 4 locally while keeping Wave 5 planned-gated", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const closeout = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(closeout.status, "completed-repository-local-wave-closeout");
  assert.equal(closeout.step, 100);
  assert.equal(closeout.stateAtCheckpoint.completedStepCountBeforeTrackerUpdate, 99);
  assert.equal(closeout.stateAtCheckpoint.activeStepBeforeTrackerUpdate, 100);
  assert.equal(closeout.stateAtCheckpoint.completedStepCountAfterTrackerUpdate, 100);
  assert.equal(closeout.stateAtCheckpoint.completedRoundCountAfterTrackerUpdate, 5);
  assert.equal(closeout.stateAtCheckpoint.waveCompleted, true);
  assert.equal(closeout.stateAtCheckpoint.nextActiveWave, null);
  assert.equal(closeout.stateAtCheckpoint.nextWaveStatus, "planned-gated");
  assert.equal(closeout.stateAtCheckpoint.nextWaveImplementationApproved, false);
  assert.equal(closeout.stateAtCheckpoint.nextWaveActivationApproved, false);
  assert.ok(Object.values(closeout.checks).every(Boolean));
  assert.equal(closeout.completion.nextWaveSelectedCapability, "seis-plugin-capability-coverage");
  assert.equal(closeout.completion.nextWaveImplementationApproved, false);
  assert.equal(closeout.completion.nextWaveActivationApproved, false);
  assert.equal(closeout.completion.terminalHandoffPublished, false);
  assert.equal(closeout.completion.protectedDefaultBranchWritten, false);
  assert.equal(closeout.completion.publicReleaseAllowed, false);
  assert.equal(closeout.publicBoundary.personalMarketplaceRead, false);
  assert.equal(closeout.publicBoundary.personalMarketplaceMutation, false);
  assert.ok(Object.values(closeout.externalClaims).every((value) => value === false));
  assert.equal(JSON.stringify(closeout).includes(repositoryRoot), false);
});
