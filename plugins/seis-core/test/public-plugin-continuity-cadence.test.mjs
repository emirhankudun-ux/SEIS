import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-continuity-cadence.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-continuity-cadence.mjs");

test("keeps legacy continuity evidence honest and gates escalation behind unfinished Wave 5", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const cadence = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(cadence.schemaVersion, 2);
  assert.equal(cadence.status, "active-evidence-led-cadence");
  assert.deepEqual(cadence.scheduleAuthority, {
    current: false,
    canonicalPath: "content/development/seis-general-plugin-autopilot.json",
    classification: "legacy-continuity-evidence-only",
  });
  assert.equal(cadence.marketplaceProjectionClassification, "legacy-34-card-continuity-snapshot-not-current-v2-surface");
  assertCurrentAndHistoricalMarketplaceSemantics(cadence);
  assert.equal(cadence.cadence.bootstrap.totalSteps, 30);
  assert.equal(cadence.cadence.bootstrap.roundCount, 5);
  assert.equal(cadence.cadence.bootstrap.stepsPerRound, 6);
  assert.equal(cadence.cadence.waveSeries.waveCount, 5);
  assert.equal(cadence.cadence.waveSeries.stepsPerWave, 100);
  assert.equal(cadence.cadence.waveSeries.totalPlannedWaveSteps, 500);
  assert.equal(cadence.cadence.waveSeries.activeWave, 5);
  assert.equal(cadence.cadence.waveSeries.activeWaveState, "wave-5-first-80-steps-completed-step-81-in-progress");
  assert.equal(cadence.cadence.afterFiveWaves.completedSeriesStepSize, 100);
  assert.equal(cadence.cadence.afterFiveWaves.nextWaveCount, 5);
  assert.equal(cadence.cadence.afterFiveWaves.nextWaveSteps, 200);
  assert.equal(cadence.cadence.afterFiveWaves.activationState, "gated-until-wave-5-completes");
  assert.equal(cadence.cadence.afterFiveWaves.activationAuthority, "not-yet-granted");
  assert.equal(cadence.cadence.afterFiveWaves.historicalEvidenceState, "wave-5-first-80-steps-completed-step-81-in-progress");
  assert.equal(cadence.cadence.afterFiveWaves.historicalWave5CloseoutClaimed, false);
  const escalation = cadence.cadence.escalationSeries;
  assert.equal(escalation.id, "seis-public-plugin-five-wave-step-escalation");
  assert.equal(escalation.direction, "increase-100-steps-per-wave-after-each-five-wave-series");
  assert.equal(escalation.tierCount, 5);
  assert.equal(escalation.waveCountPerTier, 5);
  assert.equal(escalation.stepIncreasePerTier, 100);
  assert.equal(escalation.currentMarketplaceCardCount, 10);
  assert.equal(escalation.marketplaceProjectionScope, "active-v2-ten-general-plugin-marketplace");
  assert.equal(escalation.maximumBundleSize, 15);
  assert.equal(escalation.workflowStepsAreMarketplaceCards, false);
  assert.deepEqual(escalation.tiers.map((tier) => tier.stepsPerWave), [200, 300, 400, 500, 600]);
  assert.deepEqual(escalation.tiers.map((tier) => tier.years), [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]);
  assert.ok(escalation.tiers.every((tier) => tier.waveCount === 5 && tier.stepsPerRound === 20 && tier.roundsPerWave === tier.stepsPerWave / 20 && tier.totalPlannedSteps === tier.stepsPerWave * 5 && tier.backgroundExecution === false && tier.marketplaceCardExpansion === false));
  assert.equal(escalation.tiers[0].status, "gated-until-five-100-step-waves-complete");
  assert.ok(escalation.tiers.every((tier) => tier.activationAuthority === "not-yet-granted" && tier.activeCycle === null));
  assert.equal(cadence.waves.length, 5);
  assert.equal(cadence.waves[0].status, "completed");
  assert.equal(cadence.waves[1].status, "completed");
  assert.equal(cadence.waves[2].status, "completed");
  assert.equal(cadence.waves[2].completedSteps, 100);
  assert.deepEqual(cadence.waves[2].inProgressSteps, []);
  assert.equal(cadence.waves[2].priorValidationPath, "content/development/seis-public-plugin-wave-3-final-validation.json");
  assert.equal(cadence.waves[2].preflightPath, "content/development/seis-public-plugin-wave-3-final-preflight.json");
  assert.equal(cadence.waves[2].deliveryEvidencePath, "content/development/seis-public-plugin-wave-3-delivery-evidence.json");
  assert.equal(cadence.waves[2].repositoryLocalHandoffPath, "content/development/seis-public-plugin-wave-3-repository-local-handoff.json");
  assert.equal(cadence.waves[2].followingWaveReviewPath, "content/development/seis-public-plugin-wave-3-following-wave-review.json");
  assert.equal(cadence.waves[2].closeoutPath, "content/development/seis-public-plugin-wave-3-closeout.json");
  assert.equal(cadence.waves[2].currentEvidencePath, "content/development/seis-public-plugin-wave-3-closeout.json");
  assert.equal(cadence.waves[3].status, "completed");
  assert.equal(cadence.waves[3].programPath, "content/development/seis-public-plugin-wave-4-program.json");
  assert.equal(cadence.waves[3].activationDecisionPath, "content/development/seis-public-plugin-wave-4-activation-decision.json");
  assert.equal(cadence.waves[3].selectedCapability, "seis-swift-package-topology");
  assert.equal(cadence.waves[3].activationApproved, true);
  assert.equal(cadence.waves[3].implementationStarted, true);
  assert.equal(cadence.waves[3].candidatePackageExists, true);
  assert.equal(cadence.waves[3].candidatePublicCardExists, true);
  assert.equal(cadence.waves[3].completedSteps, 100);
  assert.deepEqual(cadence.waves[3].inProgressSteps, []);
  assert.equal(cadence.waves[3].topologyEvidencePath, "content/development/seis-swift-package-topology.json");
  assert.equal(cadence.waves[3].integrationCheckpointPath, "content/development/seis-public-plugin-wave-4-integration-checkpoint.json");
  assert.equal(cadence.waves[3].validationDeliveryEvidencePath, "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json");
  assert.equal(cadence.waves[3].publicBoundaryDecisionPath, "content/development/seis-public-plugin-wave-4-public-boundary-decision.json");
  assert.equal(cadence.waves[3].handoffPreparationPath, "content/development/seis-public-plugin-wave-4-handoff-preparation.json");
  assert.equal(cadence.waves[3].closeoutSequenceDecisionPath, "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json");
  assert.equal(cadence.waves[3].repositoryLocalHandoffPath, "content/development/seis-public-plugin-wave-4-repository-local-handoff.json");
  assert.equal(cadence.waves[3].followingWaveReviewPath, "content/development/seis-public-plugin-wave-4-following-wave-review.json");
  assert.equal(cadence.waves[3].evidenceRetentionPath, "content/development/seis-public-plugin-wave-4-evidence-retention.json");
  assert.equal(cadence.waves[3].closeoutPath, "content/development/seis-public-plugin-wave-4-closeout.json");
  assert.equal(cadence.waves[3].currentEvidencePath, "content/development/seis-public-plugin-wave-4-closeout.json");
  assert.equal(cadence.waves[4].status, "in-progress");
  assert.equal(cadence.waves[4].programPath, "content/development/seis-public-plugin-wave-5-program.json");
  assert.equal(cadence.waves[4].candidateReviewPath, "content/development/seis-public-plugin-wave-4-following-wave-review.json");
  assert.equal(cadence.waves[4].activationDecisionPath, "content/development/seis-public-plugin-wave-5-activation-decision.json");
  assert.equal(cadence.waves[4].capabilityEvidencePath, "content/development/seis-plugin-capability-coverage.json");
  assert.equal(cadence.waves[4].round3CheckpointPath, "content/development/seis-public-plugin-wave-5-round-3-checkpoint.json");
  assert.equal(cadence.waves[4].consolidationPath, "content/development/seis-public-plugin-consolidation.json");
  assert.equal(cadence.waves[4].selectedCapability, "seis-plugin-capability-coverage");
  assert.equal(cadence.waves[4].implementationApproved, true);
  assert.equal(cadence.waves[4].activationApproved, true);
  assert.equal(cadence.waves[4].implementationStarted, true);
  assert.equal(cadence.waves[4].candidatePackageExists, true);
  assert.equal(cadence.waves[4].candidateDirectPublicCardExists, false);
  assert.equal(typeof cadence.waves[4].candidateBundleId, "string");
  assert.equal(cadence.waves[4].candidateBundleCardExists, true);
  assert.equal(cadence.waves[4].completedSteps, 80);
  assert.deepEqual(cadence.waves[4].inProgressSteps, [81]);
  assert.equal(cadence.waves[4].currentEvidencePath, "content/development/seis-public-plugin-wave-5-program.json");
  assert.equal(cadence.futureWaveTemplate.steps.length, 100);
  assert.equal(cadence.executionBoundary.personalMarketplaceRead, false);
  assert.equal(cadence.executionBoundary.personalMarketplaceMutation, false);
  assert.equal(cadence.executionBoundary.backgroundExecutionClaimed, false);
  assert.equal(cadence.executionBoundary.protectedDefaultBranchWrites, false);
  assert.equal(JSON.stringify(cadence).includes(repositoryRoot), false);
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
