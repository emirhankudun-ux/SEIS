import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-validation-delivery-evidence.mjs");

test("records Wave 4 validation and feature-branch delivery without a release claim", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const evidence = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(evidence.schemaVersion, 2);
  assert.equal(evidence.status, "completed-repository-local-validation-delivery-evidence");
  assert.equal(evidence.maturity, "prototype");
  assert.equal(evidence.wave, 4);
  assert.equal(evidence.round, 5);
  assert.deepEqual(evidence.completedSteps, [81, 82, 83, 84, 85, 86, 87, 88, 89, 90]);
  assert.equal(evidence.stateAtCheckpoint.completedStepCountBeforeTrackerUpdate, 80);
  assert.equal(evidence.stateAtCheckpoint.activeStepBeforeTrackerUpdate, 81);
  assert.equal(evidence.stateAtCheckpoint.nextPlannedStep, 91);
  assertCurrentAndHistoricalMarketplaceSemantics(evidence);
  assert.ok(Object.values(evidence.checks).every(Boolean));
  assert.equal(evidence.observedDelivery.sourceIntegrationCommit, "e3cc34d6138c0e47fa582c5fa09e3c92c04a005e");
  assert.equal(evidence.observedDelivery.featureBranch, "plugins/seis-plugin-root-20260715");
  assert.equal(evidence.observedDelivery.pushed, true);
  assert.equal(evidence.observedDelivery.remoteReferenceVerified, true);
  assert.equal(evidence.observedDelivery.protectedDefaultBranchWritten, false);
  assert.equal(evidence.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(evidence.publicBoundary.personalMarketplaceRead, false);
  assert.equal(evidence.publicBoundary.personalMarketplaceMutation, false);
  assert.ok(Object.values(evidence.externalClaims).every((value) => value === false));
  assert.equal(evidence.remainingWork.nextStep, 91);
  assert.equal(JSON.stringify(evidence).includes(repositoryRoot), false);
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
