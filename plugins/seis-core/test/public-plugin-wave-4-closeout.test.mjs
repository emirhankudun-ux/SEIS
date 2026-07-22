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

test("preserves the Wave 4 local closeout alongside the active public-only Wave 5 context", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const closeout = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(closeout.schemaVersion, 2);
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
  assert.equal(closeout.currentContext.activeWave, 5);
  assert.equal(closeout.currentContext.activeWaveState, "wave-5-first-80-steps-completed-step-81-in-progress");
  assert.equal(closeout.currentContext.status, "in-progress");
  assert.equal(closeout.currentContext.completedSteps, 80);
  assert.deepEqual(closeout.currentContext.inProgressSteps, [81]);
  assertCurrentAndHistoricalMarketplaceSemantics(closeout);
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

function assertCurrentAndHistoricalMarketplaceSemantics(record) {
  assert.equal(record.historicalWave4DirectCardSnapshot.projectionModel, "direct-source-cards");
  assert.equal(record.historicalWave4DirectCardSnapshot.publicCardCount, 380);
  assert.equal(record.historicalWave4DirectCardSnapshot.retainedSourceCapabilityCount, 379);
  assert.equal(record.historicalWave4DirectCardSnapshot.current, false);
  assert.equal(record.historicalWave4DirectCardSnapshot.immutableHistoricalEvidence, true);
  assert.equal(record.currentMarketplaceProjection.projectionModel, "curated-bundle-cards");
  assert.equal(record.currentMarketplaceProjection.publicCardCount, 34);
  assert.notEqual(record.currentMarketplaceProjection.publicCardCount, 380);
  assert.notEqual(record.currentMarketplaceProjection.publicCardCount, 381);
  assert.equal(record.currentMarketplaceProjection.canonicalCardCount, 1);
  assert.equal(record.currentMarketplaceProjection.bundleCardCount, 33);
  assert.equal(record.currentMarketplaceProjection.applicationBundleCardCount, 6);
  assert.equal(record.currentMarketplaceProjection.topicBundleCardCount, 27);
  assert.equal(record.currentMarketplaceProjection.sourceCapabilityInventory.rootSourceModuleCount, 5);
  assert.equal(record.currentMarketplaceProjection.sourceCapabilityInventory.applicationSourcePackageCount, 75);
  assert.equal(record.currentMarketplaceProjection.sourceCapabilityInventory.topicSourcePackageCount, 300);
  assert.equal(record.currentMarketplaceProjection.sourceCapabilityInventory.retainedSourcePackageCount, 380);
  assert.equal(record.currentMarketplaceProjection.sourceCapabilityInventory.sourcePackagesDeleted, false);
  assert.equal(record.currentMarketplaceProjection.directSourceCapabilityCardCount, 0);
}
