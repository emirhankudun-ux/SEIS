import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-delivery-evidence.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-delivery-evidence.mjs");

test("records Wave 3 feature-branch delivery without treating it as final handoff or release", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const delivery = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(delivery.status, "completed-repository-local-delivery-evidence");
  assert.deepEqual(delivery.completedSteps, [92, 93, 94, 95, 96]);
  assert.equal(delivery.stateAtCheckpoint.completedStepCountBeforeTrackerUpdate, 91);
  assert.equal(delivery.stateAtCheckpoint.activeStepBeforeTrackerUpdate, 92);
  assert.equal(delivery.stateAtCheckpoint.nextPlannedValidationStep, 97);
  assert.equal(delivery.stateAtCheckpoint.finalWaveHandoffPublished, false);
  assert.equal(delivery.observedDelivery.featureBranch, "plugins/seis-plugin-root-20260715");
  assert.equal(delivery.observedDelivery.committed, true);
  assert.equal(delivery.observedDelivery.pushed, true);
  assert.equal(delivery.observedDelivery.remoteReferenceVerified, true);
  assert.equal(delivery.observedDelivery.protectedDefaultBranchWritten, false);
  assert.ok(Object.values(delivery.checks).every(Boolean));
  assert.equal(delivery.publicBoundary.personalMarketplaceRead, false);
  assert.equal(delivery.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(delivery.publicBoundary.publicReleaseAllowed, false);
  assert.equal(delivery.externalClaims.independentInstallation, false);
  assert.equal(delivery.externalClaims.publicRelease, false);
  assert.equal(delivery.futureWaveDecision.activationApproved, false);
  assert.equal(JSON.stringify(delivery).includes(repositoryRoot), false);
});
