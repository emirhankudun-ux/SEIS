import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-handoff-preparation.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-handoff-preparation.mjs");

test("completes Wave 4 step 96 without creating a terminal handoff", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const preparation = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(preparation.schemaVersion, 2);
  assert.equal(preparation.status, "completed-repository-local-handoff-preparation");
  assert.equal(preparation.step, 96);
  assert.equal(preparation.stateAtPreparation.completedStepCount, 95);
  assert.equal(preparation.stateAtPreparation.activeStep, 96);
  assert.deepEqual(preparation.stateAtPreparation.remainingStepNumbers, [97, 98, 99, 100]);
  assert.equal(preparation.completionState.completedStep, 96);
  assert.equal(preparation.completionState.nextActiveStep, 97);
  assertCurrentAndHistoricalMarketplaceSemantics(preparation);
  assert.ok(Object.values(preparation.completedEvidence).every(Boolean));
  assert.equal(preparation.handoffGate.ready, false);
  assert.equal(preparation.handoffGate.allOneHundredStepsHaveCurrentEvidence, false);
  assert.equal(preparation.handoffGate.preparationCompleted, true);
  assert.equal(preparation.handoffGate.currentStepRemainsInProgress, false);
  assert.equal(preparation.handoffGate.nextActiveStep, 97);
  assert.equal(preparation.handoffGate.terminalHandoffPublished, false);
  assert.equal(preparation.handoffGate.waveCompleted, false);
  assert.equal(preparation.handoffGate.wave5ActivationApproved, false);
  assert.ok(Object.values(preparation.externalClaims).every((value) => value === false));
  assert.equal(preparation.recommendedFollowUp.status, "accepted-applied-to-canonical-program");
  assert.equal(preparation.recommendedFollowUp.decisionPath, "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json");
  assert.equal(preparation.recommendedFollowUp.approvalSource, "active-thread-user-continuation-objective");
  assert.equal(JSON.stringify(preparation).includes(repositoryRoot), false);
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
