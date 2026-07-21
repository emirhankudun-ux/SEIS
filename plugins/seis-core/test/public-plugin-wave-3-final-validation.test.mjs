import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-final-validation.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-final-validation.mjs");

test("closes Wave 3 tracker and capability-decision validation without completing the wave", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const validation = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(validation.status, "completed-repository-local-final-validation");
  assert.equal(validation.step, 81);
  assert.equal(validation.stateAtCheckpoint.completedStepCountBeforeTrackerUpdate, 80);
  assert.equal(validation.stateAtCheckpoint.activeStepBeforeTrackerUpdate, 81);
  assert.equal(validation.stateAtCheckpoint.nextPlannedValidationStep, 82);
  assert.equal(validation.stateAtCheckpoint.waveCompleted, false);
  assert.equal(validation.checks.wave3Tracker, true);
  assert.equal(validation.checks.capabilityDecision, true);
  assert.equal(validation.checks.selectedPackage, true);
  assert.equal(validation.checks.denyByDefaultMcp, true);
  assert.equal(validation.publicBoundary.personalMarketplaceRead, false);
  assert.equal(validation.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(validation.publicBoundary.publicReleaseAllowed, false);
  assert.equal(validation.externalClaims.compiledSwift, false);
  assert.equal(validation.externalClaims.nativeRuntime, false);
  assert.equal(validation.externalClaims.publicRelease, false);
  assert.equal(validation.futureWaveDecision.activationApproved, false);
  assert.equal(JSON.stringify(validation).includes(repositoryRoot), false);
});
