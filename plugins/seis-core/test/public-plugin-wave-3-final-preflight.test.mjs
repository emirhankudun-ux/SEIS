import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-final-preflight.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-final-preflight.mjs");

test("reconciles Wave 3 steps 82 through 91 without declaring final delivery or release", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const preflight = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(preflight.status, "completed-repository-local-final-preflight");
  assert.deepEqual(preflight.completedSteps, [82, 83, 84, 85, 86, 87, 88, 89, 90, 91]);
  assert.equal(preflight.stateAtCheckpoint.completedStepCountBeforeTrackerUpdate, 81);
  assert.equal(preflight.stateAtCheckpoint.activeStepBeforeTrackerUpdate, 82);
  assert.equal(preflight.stateAtCheckpoint.nextPlannedValidationStep, 92);
  assert.equal(preflight.stateAtCheckpoint.finalWaveHandoffPublished, false);
  assert.equal(preflight.stateAtCheckpoint.waveCompleted, false);
  assert.ok(Object.values(preflight.checks).every(Boolean));
  assert.equal(preflight.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(preflight.publicBoundary.marketplaceDisplayName, "SEIS Repo");
  assert.equal(preflight.publicBoundary.personalMarketplaceRead, false);
  assert.equal(preflight.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(preflight.publicBoundary.publicReleaseAllowed, false);
  assert.equal(preflight.externalClaims.compiledSwift, false);
  assert.equal(preflight.externalClaims.nativeRuntime, false);
  assert.equal(preflight.externalClaims.independentInstallation, false);
  assert.equal(preflight.externalClaims.publicRelease, false);
  assert.equal(preflight.futureWaveDecision.activationApproved, false);
  assert.equal(preflight.inputSafetyScan.machineSpecificPathFindingCount, 0);
  assert.equal(preflight.inputSafetyScan.secretLikeFindingCount, 0);
  assert.equal(JSON.stringify(preflight).includes(repositoryRoot), false);
});
