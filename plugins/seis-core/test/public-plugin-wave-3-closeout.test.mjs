import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-closeout.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-closeout.mjs");

test("closes Wave 3 at 100 repository-local evidence steps without activating Wave 4", () => {
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
  assert.equal(closeout.stateAtCheckpoint.wave3Completed, true);
  assert.equal(closeout.stateAtCheckpoint.wave4Activated, false);
  assert.ok(Object.values(closeout.checks).every(Boolean));
  assert.equal(closeout.completion.completedStepCount, 100);
  assert.equal(closeout.completion.completedRoundCount, 5);
  assert.equal(closeout.completion.nextActiveWave, null);
  assert.equal(closeout.completion.nextWaveStatus, "planned-gated");
  assert.equal(closeout.completion.nextWaveSelectedCapability, "seis-swift-package-topology");
  assert.equal(closeout.completion.nextWaveActivationApproved, false);
  assert.equal(closeout.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(closeout.publicBoundary.personalMarketplaceRead, false);
  assert.equal(closeout.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(closeout.externalClaims.compiledSwift, false);
  assert.equal(closeout.externalClaims.swiftPmTestPass, false);
  assert.equal(closeout.externalClaims.publicRelease, false);
  assert.equal(JSON.stringify(closeout).includes(repositoryRoot), false);
});
