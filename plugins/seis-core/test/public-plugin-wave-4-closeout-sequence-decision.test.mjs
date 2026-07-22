import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-closeout-sequence-decision.mjs");

test("applies the user-authorized Wave 4 closeout ordering without changing terminal state", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const decision = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(decision.schemaVersion, 2);
  assert.equal(decision.status, "approved-current-user-continuation-authority");
  assertCurrentAndHistoricalMarketplaceSemantics(decision);
  assert.equal(decision.maturity, "specification");
  assert.equal(decision.parentGoalId, "SEIS-GOAL-021");
  assert.equal(decision.stateAtDecision.completedStepCount, 95);
  assert.equal(decision.stateAtDecision.activeStep, 96);
  assert.deepEqual(decision.stateAtDecision.plannedStepNumbers, [97, 98, 99, 100]);
  assert.equal(decision.stateAfterApplication.completedStepCount, 96);
  assert.equal(decision.stateAfterApplication.activeStep, 97);
  assert.deepEqual(decision.stateAfterApplication.plannedStepNumbers, [98, 99, 100]);
  assert.ok(Object.values(decision.currentEvidence).every(Boolean));
  assert.equal(decision.decisionBoundary.approvalRequired, true);
  assert.equal(decision.decisionBoundary.status, "approved-owner-mapping-applied");
  assert.equal(decision.decisionBoundary.approvalSource, "active-thread-user-continuation-objective");
  assert.equal(decision.decisionBoundary.approved, true);
  assert.equal(decision.decisionBoundary.appliedToCanonicalProgram, true);
  assert.equal(decision.decisionBoundary.automaticStepStatusChangesAllowed, false);
  assert.equal(decision.decisionBoundary.terminalHandoffPublished, false);
  assert.equal(decision.decisionBoundary.waveCompleted, false);
  assert.equal(decision.decisionBoundary.wave5ActivationApproved, false);
  assert.equal(decision.proposedResolution.status, "approved-applied");
  assert.equal(decision.proposedResolution.noStepStatusChanges, false);
  assert.equal(decision.proposedResolution.manualCanonicalStatusChangeApplied, true);
  assert.equal(decision.ownerOptions.length, 3);
  assert.equal(decision.ownerOptions[0].status, "selected-by-active-user-continuation-objective");
  assert.ok(Object.values(decision.externalClaims).every((value) => value === false));
  assert.equal(decision.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(decision.publicBoundary.personalMarketplaceRead, false);
  assert.equal(decision.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(JSON.stringify(decision).includes(repositoryRoot), false);
});

function assertCurrentAndHistoricalMarketplaceSemantics(record) {
  assert.equal(record.historicalWave4DirectCardSnapshot.projectionModel, "direct-source-cards");
  assert.equal(record.historicalWave4DirectCardSnapshot.publicCardCount, 380);
  assert.equal(record.historicalWave4DirectCardSnapshot.retainedSourceCapabilityCount, 379);
  assert.equal(record.historicalWave4DirectCardSnapshot.current, false);
  assert.equal(record.historicalWave4DirectCardSnapshot.immutableHistoricalEvidence, true);
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
  assert.equal(record.currentMarketplaceProjection.directSourceCapabilityCardCount, 0);
}
