#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-continuity-cadence.json";
const INITIAL_PROGRAM_PATH = "content/development/seis-public-plugin-expansion-program.json";
const WAVE_1_PROGRAM_PATH = "content/development/seis-public-plugin-wave-1-program.json";
const WAVE_1_HANDOFF_PATH = "content/development/seis-public-plugin-wave-1-handoff.json";
const WAVE_2_PROGRAM_PATH = "content/development/seis-public-plugin-wave-2-program.json";
const WAVE_2_HANDOFF_PATH = "content/development/seis-public-plugin-wave-2-handoff.json";
const WAVE_3_PROGRAM_PATH = "content/development/seis-public-plugin-wave-3-program.json";
const WAVE_3_ROUND_4_REVIEW_PATH = "content/development/seis-public-plugin-wave-3-round-4-review.json";
const WAVE_3_FINAL_VALIDATION_PATH = "content/development/seis-public-plugin-wave-3-final-validation.json";
const WAVE_3_FINAL_PREFLIGHT_PATH = "content/development/seis-public-plugin-wave-3-final-preflight.json";
const WAVE_3_DELIVERY_EVIDENCE_PATH = "content/development/seis-public-plugin-wave-3-delivery-evidence.json";
const WAVE_3_REPOSITORY_LOCAL_HANDOFF_PATH = "content/development/seis-public-plugin-wave-3-repository-local-handoff.json";
const WAVE_3_FOLLOWING_WAVE_REVIEW_PATH = "content/development/seis-public-plugin-wave-3-following-wave-review.json";
const WAVE_3_CLOSEOUT_PATH = "content/development/seis-public-plugin-wave-3-closeout.json";
const WAVE_4_ACTIVATION_DECISION_PATH = "content/development/seis-public-plugin-wave-4-activation-decision.json";
const WAVE_4_PROGRAM_PATH = "content/development/seis-public-plugin-wave-4-program.json";
const WAVE_4_TOPOLOGY_EVIDENCE_PATH = "content/development/seis-swift-package-topology.json";
const WAVE_4_INTEGRATION_CHECKPOINT_PATH = "content/development/seis-public-plugin-wave-4-integration-checkpoint.json";
const WAVE_4_VALIDATION_DELIVERY_EVIDENCE_PATH = "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json";
const WAVE_4_PUBLIC_BOUNDARY_DECISION_PATH = "content/development/seis-public-plugin-wave-4-public-boundary-decision.json";
const WAVE_4_HANDOFF_PREPARATION_PATH = "content/development/seis-public-plugin-wave-4-handoff-preparation.json";
const WAVE_4_CLOSEOUT_SEQUENCE_DECISION_PATH = "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json";
const WAVE_4_REPOSITORY_LOCAL_HANDOFF_PATH = "content/development/seis-public-plugin-wave-4-repository-local-handoff.json";
const WAVE_4_FOLLOWING_WAVE_REVIEW_PATH = "content/development/seis-public-plugin-wave-4-following-wave-review.json";
const WAVE_4_EVIDENCE_RETENTION_PATH = "content/development/seis-public-plugin-wave-4-evidence-retention.json";
const WAVE_4_CLOSEOUT_PATH = "content/development/seis-public-plugin-wave-4-closeout.json";
const WAVE_5_ACTIVATION_DECISION_PATH = "content/development/seis-public-plugin-wave-5-activation-decision.json";
const WAVE_5_PROGRAM_PATH = "content/development/seis-public-plugin-wave-5-program.json";
const WAVE_5_CAPABILITY_EVIDENCE_PATH = "content/development/seis-plugin-capability-coverage.json";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-continuity-cadence");
    process.exit(1);
  }
  console.log("SEIS public plugin continuity cadence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " with one 30-step bootstrap and five 100-step waves.");
}

function buildRecord() {
  const initialProgram = readJson(INITIAL_PROGRAM_PATH);
  const wave1Program = readJson(WAVE_1_PROGRAM_PATH);
  const wave1Handoff = readJson(WAVE_1_HANDOFF_PATH);
  const wave2Program = readJson(WAVE_2_PROGRAM_PATH);
  const wave2Handoff = readJson(WAVE_2_HANDOFF_PATH);
  const wave3Program = readJson(WAVE_3_PROGRAM_PATH);
  const wave3Round4Review = readJson(WAVE_3_ROUND_4_REVIEW_PATH);
  const wave3FinalValidation = readJson(WAVE_3_FINAL_VALIDATION_PATH);
  const wave3FinalPreflight = readJson(WAVE_3_FINAL_PREFLIGHT_PATH);
  const wave3DeliveryEvidence = readJson(WAVE_3_DELIVERY_EVIDENCE_PATH);
  const wave3RepositoryLocalHandoff = readJson(WAVE_3_REPOSITORY_LOCAL_HANDOFF_PATH);
  const wave3FollowingWaveReview = readJson(WAVE_3_FOLLOWING_WAVE_REVIEW_PATH);
  const wave3Closeout = readJson(WAVE_3_CLOSEOUT_PATH);
  const wave4ActivationDecision = readJson(WAVE_4_ACTIVATION_DECISION_PATH);
  const wave4Program = readJson(WAVE_4_PROGRAM_PATH);
  const wave4TopologyEvidence = readJson(WAVE_4_TOPOLOGY_EVIDENCE_PATH);
  const wave4IntegrationCheckpoint = readJson(WAVE_4_INTEGRATION_CHECKPOINT_PATH);
  const wave4ValidationDeliveryEvidence = readJson(WAVE_4_VALIDATION_DELIVERY_EVIDENCE_PATH);
  const wave4PublicBoundaryDecision = readJson(WAVE_4_PUBLIC_BOUNDARY_DECISION_PATH);
  const wave4HandoffPreparation = readJson(WAVE_4_HANDOFF_PREPARATION_PATH);
  const wave4CloseoutSequenceDecision = readJson(WAVE_4_CLOSEOUT_SEQUENCE_DECISION_PATH);
  const wave4RepositoryLocalHandoff = readJson(WAVE_4_REPOSITORY_LOCAL_HANDOFF_PATH);
  const wave4FollowingWaveReview = readJson(WAVE_4_FOLLOWING_WAVE_REVIEW_PATH);
  const wave4EvidenceRetention = readJson(WAVE_4_EVIDENCE_RETENTION_PATH);
  const wave4Closeout = readJson(WAVE_4_CLOSEOUT_PATH);
  const wave5ActivationDecision = readJson(WAVE_5_ACTIVATION_DECISION_PATH);
  const wave5Program = readJson(WAVE_5_PROGRAM_PATH);
  const wave5CapabilityEvidence = readJson(WAVE_5_CAPABILITY_EVIDENCE_PATH);
  assert(wave3FinalValidation?.id === "seis-public-plugin-wave-3-final-validation" && wave3FinalValidation?.status === "completed-repository-local-final-validation" && wave3FinalValidation?.step === 81 && wave3FinalValidation?.futureWaveDecision?.activationApproved === false, "Wave 3 final validation evidence is invalid");
  assert(wave3FinalPreflight?.id === "seis-public-plugin-wave-3-final-preflight" && wave3FinalPreflight?.status === "completed-repository-local-final-preflight" && list(wave3FinalPreflight?.completedSteps).join(",") === range(82, 91).join(",") && wave3FinalPreflight?.futureWaveDecision?.activationApproved === false, "Wave 3 final preflight evidence is invalid");
  assert(wave3DeliveryEvidence?.id === "seis-public-plugin-wave-3-delivery-evidence" && wave3DeliveryEvidence?.status === "completed-repository-local-delivery-evidence" && list(wave3DeliveryEvidence?.completedSteps).join(",") === range(92, 96).join(",") && wave3DeliveryEvidence?.observedDelivery?.remoteReferenceVerified === true && wave3DeliveryEvidence?.futureWaveDecision?.activationApproved === false, "Wave 3 delivery evidence is invalid");
  assert(wave3RepositoryLocalHandoff?.id === "seis-public-plugin-wave-3-repository-local-handoff" && wave3RepositoryLocalHandoff?.status === "completed-repository-local-handoff" && wave3RepositoryLocalHandoff?.step === 97 && wave3RepositoryLocalHandoff?.futureWaveDecision?.activationApproved === false, "Wave 3 repository-local handoff evidence is invalid");
  assert(wave3FollowingWaveReview?.id === "seis-public-plugin-wave-3-following-wave-review" && wave3FollowingWaveReview?.status === "completed-following-wave-scope-review" && wave3FollowingWaveReview?.step === 98 && wave3FollowingWaveReview?.followingWaveDecision?.selectedCapability === "seis-swift-package-topology" && wave3FollowingWaveReview?.followingWaveDecision?.implementationApproved === false && wave3FollowingWaveReview?.followingWaveDecision?.activationApproved === false, "Wave 3 following-wave review is invalid");
  assert(wave3Closeout?.id === "seis-public-plugin-wave-3-closeout" && wave3Closeout?.status === "completed-repository-local-wave-closeout" && wave3Closeout?.step === 100 && wave3Closeout?.completion?.completedStepCount === 100 && wave3Closeout?.completion?.completedRoundCount === 5 && wave3Closeout?.completion?.nextActiveWave === null && wave3Closeout?.completion?.nextWaveStatus === "planned-gated" && wave3Closeout?.completion?.nextWaveActivationApproved === false, "Wave 3 closeout is invalid");
  assert(wave4ActivationDecision?.id === "seis-public-plugin-wave-4-activation-decision" && wave4ActivationDecision?.status === "approved-public-local-wave-4-activation" && wave4ActivationDecision?.decision?.selectedCapability === "seis-swift-package-topology" && wave4ActivationDecision?.decision?.activationApproved === true && wave4ActivationDecision?.decision?.implementationApproved === true && wave4ActivationDecision?.decision?.implementationStarted === false && wave4ActivationDecision?.decision?.publicReleaseApproved === false, "Wave 4 activation decision is invalid");
  assert(wave4Program?.id === "seis-public-plugin-wave-4-program" && wave4Program?.status === "completed" && wave4Program?.maturity === "prototype" && wave4Program?.wave?.number === 4 && wave4Program?.scope?.selectedCapability === "seis-swift-package-topology" && wave4Program?.activationGate?.status === "implemented-repository-local" && wave4Program?.activationGate?.activationDecisionPath === WAVE_4_ACTIVATION_DECISION_PATH && wave4Program?.activationGate?.implementationStarted === true && wave4Program?.activationGate?.candidatePackageExists === true && wave4Program?.activationGate?.candidatePublicCardExists === true && wave4Program?.progress?.completedStepCount === 100 && list(wave4Program?.progress?.inProgressStepNumbers).length === 0 && wave4Program?.progress?.plannedStepCount === 0 && wave4Program?.progress?.completedRoundCount === 5 && wave4Program?.progress?.nextStepNumber === null && wave4Program?.closeoutSequence?.status === "completed-repository-local-wave-closeout" && list(wave4Program?.closeoutSequence?.completedSteps).join(",") === "96,97,98,99,100" && wave4Program?.closeoutSequence?.activeStep === null && wave4Program?.closeoutSequence?.waveCompleted === true && wave4Program?.closeoutSequence?.completionEvidencePath === WAVE_4_CLOSEOUT_PATH && wave4Program?.repositoryLocalHandoff?.status === "completed-repository-local-handoff" && wave4Program?.repositoryLocalHandoff?.activeStep === 98 && wave4Program?.followingWaveReview?.status === "completed-following-wave-scope-review" && wave4Program?.followingWaveReview?.reviewPath === WAVE_4_FOLLOWING_WAVE_REVIEW_PATH && wave4Program?.followingWaveReview?.selectedWave5Capability === "seis-plugin-capability-coverage" && wave4Program?.followingWaveReview?.wave5ImplementationApproved === false && wave4Program?.followingWaveReview?.wave5ActivationApproved === false && wave4Program?.evidenceRetention?.status === "completed-public-evidence-retention" && wave4Program?.evidenceRetention?.retentionPath === WAVE_4_EVIDENCE_RETENTION_PATH && wave4Program?.evidenceRetention?.completedStep === 99 && wave4Program?.evidenceRetention?.activeStep === 100 && wave4Program?.evidenceRetention?.deletionPerformed === false && wave4Program?.evidenceRetention?.externalStorageUsed === false && wave4Program?.repositoryLocalCloseout?.status === "completed-repository-local-wave-closeout" && wave4Program?.repositoryLocalCloseout?.closeoutPath === WAVE_4_CLOSEOUT_PATH && wave4Program?.repositoryLocalCloseout?.nextWaveStatus === "planned-gated" && wave4Program?.repositoryLocalCloseout?.nextWaveImplementationApproved === false && wave4Program?.repositoryLocalCloseout?.nextWaveActivationApproved === false && wave4Program?.evidence?.integrationCheckpointPath === WAVE_4_INTEGRATION_CHECKPOINT_PATH && wave4Program?.evidence?.validationDeliveryEvidencePath === WAVE_4_VALIDATION_DELIVERY_EVIDENCE_PATH && wave4Program?.evidence?.publicBoundaryDecisionPath === WAVE_4_PUBLIC_BOUNDARY_DECISION_PATH && wave4Program?.evidence?.handoffPreparationPath === WAVE_4_HANDOFF_PREPARATION_PATH && wave4Program?.evidence?.closeoutSequenceDecisionPath === WAVE_4_CLOSEOUT_SEQUENCE_DECISION_PATH && wave4Program?.evidence?.repositoryLocalHandoffPath === WAVE_4_REPOSITORY_LOCAL_HANDOFF_PATH && wave4Program?.evidence?.wave4FollowingWaveReviewPath === WAVE_4_FOLLOWING_WAVE_REVIEW_PATH && wave4Program?.evidence?.evidenceRetentionPath === WAVE_4_EVIDENCE_RETENTION_PATH && wave4Program?.evidence?.closeoutPath === WAVE_4_CLOSEOUT_PATH, "Wave 4 closeout state is invalid");
  assert(wave5ActivationDecision?.id === "seis-public-plugin-wave-5-activation-decision" && wave5ActivationDecision?.status === "approved-public-local-wave-5-activation" && wave5ActivationDecision?.decision?.selectedCapability === "seis-plugin-capability-coverage" && wave5ActivationDecision?.decision?.activationApproved === true && wave5ActivationDecision?.decision?.implementationApproved === true && wave5ActivationDecision?.decision?.implementationStarted === true && wave5ActivationDecision?.decision?.candidatePackageExists === true && wave5ActivationDecision?.decision?.candidatePublicCardExists === true && wave5ActivationDecision?.decision?.publicReleaseApproved === false, "Wave 5 activation decision is invalid");
  assert(wave5CapabilityEvidence?.id === "seis-plugin-capability-coverage" && wave5CapabilityEvidence?.status === "ready-public-static-capability-coverage-evidence" && wave5CapabilityEvidence?.activation?.activationApproved === true && wave5CapabilityEvidence?.activation?.implementationObserved === true && wave5CapabilityEvidence?.audit?.ok === true && wave5CapabilityEvidence?.audit?.reconciliation?.reconciled === true && list(wave5CapabilityEvidence?.safety?.write).length === 0 && list(wave5CapabilityEvidence?.safety?.network).length === 0 && list(wave5CapabilityEvidence?.safety?.secrets).length === 0 && wave5CapabilityEvidence?.publicBoundary?.personalMarketplaceRead === false && wave5CapabilityEvidence?.publicBoundary?.personalMarketplaceMutation === false && wave5CapabilityEvidence?.publicBoundary?.publicReleaseAllowed === false, "Wave 5 capability evidence is invalid");
  assert(wave5Program?.id === "seis-public-plugin-wave-5-program" && wave5Program?.status === "in-progress" && wave5Program?.maturity === "prototype" && wave5Program?.wave?.number === 5 && wave5Program?.scope?.selectedCapability === "seis-plugin-capability-coverage" && wave5Program?.activationGate?.status === "implemented-repository-local" && wave5Program?.activationGate?.activationDecisionPath === WAVE_5_ACTIVATION_DECISION_PATH && wave5Program?.activationGate?.implementationStarted === true && wave5Program?.activationGate?.candidatePackageExists === true && wave5Program?.activationGate?.candidatePublicCardExists === true && wave5Program?.progress?.completedStepCount === 30 && list(wave5Program?.progress?.inProgressStepNumbers).join(",") === "31" && wave5Program?.progress?.plannedStepCount === 69 && wave5Program?.progress?.completedRoundCount === 1 && wave5Program?.progress?.nextStepNumber === 31 && Object.values(wave5Program?.checks || {}).every(Boolean) && Object.values(wave5Program?.externalClaims || {}).every((value) => value === false), "Wave 5 program state is invalid");
  assert(isSupportedWave4TopologyEvidence(wave4TopologyEvidence), "Wave 4 topology evidence is invalid");
  assert(wave4IntegrationCheckpoint?.id === "seis-public-plugin-wave-4-integration-checkpoint" && wave4IntegrationCheckpoint?.status === "completed-repository-local-integration-checkpoint" && list(wave4IntegrationCheckpoint?.completedSteps).join(",") === range(74, 80).join(",") && wave4IntegrationCheckpoint?.capability?.id === "seis-swift-package-topology" && wave4IntegrationCheckpoint?.publicProjection?.applicationPluginCount === 74 && wave4IntegrationCheckpoint?.publicProjection?.publicCardCount === 380 && wave4IntegrationCheckpoint?.topologyEvidence?.auditOk === true && list(wave4IntegrationCheckpoint?.permissions?.write).length === 0 && list(wave4IntegrationCheckpoint?.permissions?.network).length === 0 && list(wave4IntegrationCheckpoint?.permissions?.secrets).length === 0 && Object.values(wave4IntegrationCheckpoint?.externalClaims || {}).every((value) => value === false), "Wave 4 integration checkpoint is invalid");
  assert(wave4ValidationDeliveryEvidence?.id === "seis-public-plugin-wave-4-validation-delivery-evidence" && wave4ValidationDeliveryEvidence?.status === "completed-repository-local-validation-delivery-evidence" && list(wave4ValidationDeliveryEvidence?.completedSteps).join(",") === range(81, 90).join(",") && wave4ValidationDeliveryEvidence?.observedDelivery?.sourceIntegrationCommit === "e3cc34d6138c0e47fa582c5fa09e3c92c04a005e" && wave4ValidationDeliveryEvidence?.observedDelivery?.pushed === true && wave4ValidationDeliveryEvidence?.observedDelivery?.remoteReferenceVerified === true && wave4ValidationDeliveryEvidence?.observedDelivery?.protectedDefaultBranchWritten === false && Object.values(wave4ValidationDeliveryEvidence?.externalClaims || {}).every((value) => value === false), "Wave 4 validation-delivery evidence is invalid");
  assert(wave4PublicBoundaryDecision?.id === "seis-public-plugin-wave-4-public-boundary-decision" && wave4PublicBoundaryDecision?.status === "completed-repository-local-public-boundary-decision" && list(wave4PublicBoundaryDecision?.completedSteps).join(",") === range(91, 95).join(",") && wave4PublicBoundaryDecision?.remotePolicyObservations?.validationDeliveryCommit === "6f94f08612839984fc841ac56f01e224010456c3" && wave4PublicBoundaryDecision?.remotePolicyObservations?.remoteReferenceVerified === true && wave4PublicBoundaryDecision?.remotePolicyObservations?.protectedDefaultBranchWritten === false && wave4PublicBoundaryDecision?.publicCountReconciliation?.applicationPluginCount === 74 && wave4PublicBoundaryDecision?.publicCountReconciliation?.publicCardCount === 380 && wave4PublicBoundaryDecision?.publicCountReconciliation?.personalMarketplaceRead === false && wave4PublicBoundaryDecision?.publicCountReconciliation?.personalMarketplaceMutation === false && Object.values(wave4PublicBoundaryDecision?.externalClaims || {}).every((value) => value === false) && wave4PublicBoundaryDecision?.externalProofAndApprovals?.publicReleaseAllowed === false && wave4PublicBoundaryDecision?.recommendedFollowUp?.status === "proposed-not-created", "Wave 4 public-boundary decision is invalid");
  assert(wave4HandoffPreparation?.id === "seis-public-plugin-wave-4-handoff-preparation" && wave4HandoffPreparation?.status === "completed-repository-local-handoff-preparation" && wave4HandoffPreparation?.step === 96 && wave4HandoffPreparation?.stateAtPreparation?.completedStepCount === 95 && wave4HandoffPreparation?.stateAtPreparation?.activeStep === 96 && list(wave4HandoffPreparation?.stateAtPreparation?.remainingStepNumbers).join(",") === range(97, 100).join(",") && wave4HandoffPreparation?.completionState?.completedStep === 96 && wave4HandoffPreparation?.completionState?.nextActiveStep === 97 && Object.values(wave4HandoffPreparation?.completedEvidence || {}).every(Boolean) && wave4HandoffPreparation?.handoffGate?.ready === false && wave4HandoffPreparation?.handoffGate?.preparationCompleted === true && wave4HandoffPreparation?.handoffGate?.nextActiveStep === 97 && wave4HandoffPreparation?.handoffGate?.allOneHundredStepsHaveCurrentEvidence === false && wave4HandoffPreparation?.handoffGate?.terminalHandoffPublished === false && wave4HandoffPreparation?.handoffGate?.waveCompleted === false && wave4HandoffPreparation?.handoffGate?.wave5ActivationApproved === false && Object.values(wave4HandoffPreparation?.externalClaims || {}).every((value) => value === false) && wave4HandoffPreparation?.recommendedFollowUp?.status === "accepted-applied-to-canonical-program" && wave4HandoffPreparation?.recommendedFollowUp?.decisionPath === WAVE_4_CLOSEOUT_SEQUENCE_DECISION_PATH && wave4HandoffPreparation?.recommendedFollowUp?.approvalSource === "active-thread-user-continuation-objective", "Wave 4 handoff preparation is invalid");
  assert(wave4CloseoutSequenceDecision?.id === "seis-public-plugin-wave-4-closeout-sequence-decision" && wave4CloseoutSequenceDecision?.status === "approved-current-user-continuation-authority" && wave4CloseoutSequenceDecision?.decisionBoundary?.status === "approved-owner-mapping-applied" && wave4CloseoutSequenceDecision?.decisionBoundary?.approved === true && wave4CloseoutSequenceDecision?.decisionBoundary?.appliedToCanonicalProgram === true && wave4CloseoutSequenceDecision?.decisionBoundary?.automaticStepStatusChangesAllowed === false && wave4CloseoutSequenceDecision?.stateAfterApplication?.completedStepCount === 96 && wave4CloseoutSequenceDecision?.stateAfterApplication?.activeStep === 97 && wave4CloseoutSequenceDecision?.stateAfterApplication?.terminalHandoffPublished === false && wave4CloseoutSequenceDecision?.stateAfterApplication?.waveCompleted === false && wave4CloseoutSequenceDecision?.stateAfterApplication?.wave5ActivationApproved === false && Object.values(wave4CloseoutSequenceDecision?.externalClaims || {}).every((value) => value === false), "Wave 4 closeout-sequence decision is invalid");
  assert(wave4RepositoryLocalHandoff?.id === "seis-public-plugin-wave-4-repository-local-handoff" && wave4RepositoryLocalHandoff?.status === "completed-repository-local-handoff" && wave4RepositoryLocalHandoff?.step === 97 && wave4RepositoryLocalHandoff?.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 96 && wave4RepositoryLocalHandoff?.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 97 && wave4RepositoryLocalHandoff?.stateAtCheckpoint?.nextPlannedDecisionStep === 98 && Object.values(wave4RepositoryLocalHandoff?.checks || {}).every(Boolean) && wave4RepositoryLocalHandoff?.handoff?.delivery?.currentCheckpointRemoteVerified === false && wave4RepositoryLocalHandoff?.handoff?.delivery?.protectedDefaultBranchWritten === false && wave4RepositoryLocalHandoff?.futureWaveDecision?.status === "planned-gated" && wave4RepositoryLocalHandoff?.futureWaveDecision?.activationApproved === false && Object.values(wave4RepositoryLocalHandoff?.externalClaims || {}).every((value) => value === false), "Wave 4 repository-local handoff is invalid");
  assert(wave4FollowingWaveReview?.id === "seis-public-plugin-wave-4-following-wave-review" && wave4FollowingWaveReview?.status === "completed-following-wave-scope-review" && wave4FollowingWaveReview?.step === 98 && wave4FollowingWaveReview?.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 97 && wave4FollowingWaveReview?.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 98 && wave4FollowingWaveReview?.stateAtCheckpoint?.nextPlannedDecisionStep === 99 && Object.values(wave4FollowingWaveReview?.checks || {}).every(Boolean) && wave4FollowingWaveReview?.followingWaveDecision?.wave === 5 && wave4FollowingWaveReview?.followingWaveDecision?.selectedCapability === "seis-plugin-capability-coverage" && wave4FollowingWaveReview?.followingWaveDecision?.implementationApproved === false && wave4FollowingWaveReview?.followingWaveDecision?.activationApproved === false && wave4FollowingWaveReview?.followingWaveDecision?.candidatePackageExists === false && wave4FollowingWaveReview?.followingWaveDecision?.candidatePublicCardExists === false && Object.values(wave4FollowingWaveReview?.externalClaims || {}).every((value) => value === false), "Wave 4 following-wave review is invalid");
  assert(wave4EvidenceRetention?.id === "seis-public-plugin-wave-4-evidence-retention" && wave4EvidenceRetention?.status === "completed-public-evidence-retention" && wave4EvidenceRetention?.step === 99 && wave4EvidenceRetention?.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 98 && wave4EvidenceRetention?.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 99 && wave4EvidenceRetention?.stateAtCheckpoint?.nextPlannedDecisionStep === 100 && Object.values(wave4EvidenceRetention?.checks || {}).every(Boolean) && wave4EvidenceRetention?.retention?.status === "bounded-public-evidence-retained" && wave4EvidenceRetention?.retention?.relativePathOnly === true && wave4EvidenceRetention?.retention?.rawContentStored === false && wave4EvidenceRetention?.retention?.deletionPerformed === false && wave4EvidenceRetention?.retention?.externalStorageUsed === false && wave4EvidenceRetention?.retention?.nextActiveStep === 100 && Object.values(wave4EvidenceRetention?.externalClaims || {}).every((value) => value === false), "Wave 4 evidence retention is invalid");
  assert(wave4Closeout?.id === "seis-public-plugin-wave-4-closeout" && wave4Closeout?.status === "completed-repository-local-wave-closeout" && wave4Closeout?.step === 100 && wave4Closeout?.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 99 && wave4Closeout?.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 100 && wave4Closeout?.stateAtCheckpoint?.completedStepCountAfterTrackerUpdate === 100 && wave4Closeout?.stateAtCheckpoint?.completedRoundCountAfterTrackerUpdate === 5 && wave4Closeout?.stateAtCheckpoint?.waveCompleted === true && wave4Closeout?.completion?.nextActiveWave === null && wave4Closeout?.completion?.nextWaveStatus === "planned-gated" && wave4Closeout?.completion?.nextWaveSelectedCapability === "seis-plugin-capability-coverage" && wave4Closeout?.completion?.nextWaveImplementationApproved === false && wave4Closeout?.completion?.nextWaveActivationApproved === false && wave4Closeout?.completion?.terminalHandoffPublished === false && wave4Closeout?.completion?.publicReleaseAllowed === false && Object.values(wave4Closeout?.checks || {}).every(Boolean) && Object.values(wave4Closeout?.externalClaims || {}).every((value) => value === false), "Wave 4 closeout evidence is invalid");
  const futureWaveTemplate = buildFutureWaveTemplate(wave3Program.steps);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-continuity-cadence",
    goalId: "SEIS-GOAL-021",
    status: "active-evidence-led-cadence",
    maturity: "specification",
    generatedAt: "2026-07-21",
    purpose: "Make the requested 30-step bootstrap, five 100-step public SEIS Repo waves, and future series handoff explicit without claiming background execution or pre-approving future capability changes.",
    parentProgramPath: INITIAL_PROGRAM_PATH,
    executionBoundary: {
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      publicAudience: "everyone",
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      protectedDefaultBranchWrites: false,
      backgroundExecutionClaimed: false,
      featureBranchDeliveryRequired: true,
    },
    cadence: {
      bootstrap: {
        totalSteps: 30,
        roundCount: 5,
        stepsPerRound: 6,
        status: initialProgram.status || null,
        programPath: INITIAL_PROGRAM_PATH,
      },
      waveSeries: {
        waveCount: 5,
        stepsPerWave: 100,
        roundsPerWave: 5,
        stepsPerRound: 20,
        totalPlannedWaveSteps: 500,
        activeWave: 5,
        activeWaveState: "wave-5-first-30-steps-completed-step-31-in-progress",
      },
      githubDelivery: {
        branch: FEATURE_BRANCH,
        rule: "After each validated, reviewable, reversible checkpoint, commit the scoped work and push only the current feature branch when the environment and authorization permit.",
        protectedDefaultBranchWrites: false,
        remoteReferenceVerificationRequired: true,
        externalBlockerHandling: "Record an unavailable network, approval, or branch-policy limit honestly; do not replace it with a success claim.",
      },
      afterFiveWaves: {
        nextBootstrapSteps: 30,
        nextWaveCount: 5,
        nextWaveSteps: 100,
        continuationRule: "Start a new 30-step scope, dependency, risk, and rollback review before another five-wave series. The next series is not automatic and requires current evidence plus current user authority.",
        backgroundExecutionClaimed: false,
      },
    },
    waves: [
      {
        wave: 1,
        status: "completed",
        programPath: WAVE_1_PROGRAM_PATH,
        handoffPath: WAVE_1_HANDOFF_PATH,
        completedSteps: completedStepCount(wave1Program),
        entryRule: "The 30-step bootstrap and a separate Wave 1 scope review provided current evidence.",
      },
      {
        wave: 2,
        status: "completed",
        programPath: WAVE_2_PROGRAM_PATH,
        handoffPath: WAVE_2_HANDOFF_PATH,
        completedSteps: completedStepCount(wave2Program),
        entryRule: "Wave 1 completed with a current repository-local handoff and a new scope and risk review.",
      },
      {
        wave: 3,
        status: "completed",
        programPath: WAVE_3_PROGRAM_PATH,
        completedSteps: completedStepCount(wave3Program),
        inProgressSteps: [],
        priorValidationPath: WAVE_3_FINAL_VALIDATION_PATH,
        preflightPath: WAVE_3_FINAL_PREFLIGHT_PATH,
        deliveryEvidencePath: WAVE_3_DELIVERY_EVIDENCE_PATH,
        repositoryLocalHandoffPath: WAVE_3_REPOSITORY_LOCAL_HANDOFF_PATH,
        followingWaveReviewPath: WAVE_3_FOLLOWING_WAVE_REVIEW_PATH,
        closeoutPath: WAVE_3_CLOSEOUT_PATH,
        currentEvidencePath: WAVE_3_CLOSEOUT_PATH,
        entryRule: "Wave 2 completed with a current handoff, an approved non-duplicative capability decision, and continued user authority; Wave 3 then closed with current repository-local evidence.",
      },
      {
        wave: 4,
        status: "completed",
        programId: "seis-public-plugin-wave-4-program",
        programPath: WAVE_4_PROGRAM_PATH,
        totalSteps: 100,
        stepTemplateId: futureWaveTemplate.id,
        scopeReviewPath: WAVE_3_FOLLOWING_WAVE_REVIEW_PATH,
        activationDecisionPath: WAVE_4_ACTIVATION_DECISION_PATH,
        selectedCapability: "seis-swift-package-topology",
        activationApproved: true,
        implementationStarted: true,
        candidatePackageExists: true,
        candidatePublicCardExists: true,
        completedSteps: completedStepCount(wave4Program),
        inProgressSteps: list(wave4Program.progress?.inProgressStepNumbers),
        topologyEvidencePath: WAVE_4_TOPOLOGY_EVIDENCE_PATH,
        integrationCheckpointPath: WAVE_4_INTEGRATION_CHECKPOINT_PATH,
        validationDeliveryEvidencePath: WAVE_4_VALIDATION_DELIVERY_EVIDENCE_PATH,
        publicBoundaryDecisionPath: WAVE_4_PUBLIC_BOUNDARY_DECISION_PATH,
        handoffPreparationPath: WAVE_4_HANDOFF_PREPARATION_PATH,
        closeoutSequenceDecisionPath: WAVE_4_CLOSEOUT_SEQUENCE_DECISION_PATH,
        repositoryLocalHandoffPath: WAVE_4_REPOSITORY_LOCAL_HANDOFF_PATH,
        followingWaveReviewPath: WAVE_4_FOLLOWING_WAVE_REVIEW_PATH,
        evidenceRetentionPath: WAVE_4_EVIDENCE_RETENTION_PATH,
        closeoutPath: WAVE_4_CLOSEOUT_PATH,
        currentEvidencePath: WAVE_4_CLOSEOUT_PATH,
        predecessor: "Wave 3 repository-local handoff",
        entryRule: "Wave 3 closed with current evidence, the separate activation decision approved one fixed-manifest scope, and Wave 4 completed all 100 repository-local steps including handoff, Wave 5 candidate review, evidence retention, and closeout. This is not a merge, release, installation, or external proof claim.",
      },
      {
        wave: 5,
        status: "in-progress",
        programId: "seis-public-plugin-wave-5-program",
        programPath: WAVE_5_PROGRAM_PATH,
        totalSteps: 100,
        stepTemplateId: futureWaveTemplate.id,
        predecessor: "Wave 4 following-wave scope review",
        candidateReviewPath: WAVE_4_FOLLOWING_WAVE_REVIEW_PATH,
        activationDecisionPath: WAVE_5_ACTIVATION_DECISION_PATH,
        capabilityEvidencePath: WAVE_5_CAPABILITY_EVIDENCE_PATH,
        selectedCapability: "seis-plugin-capability-coverage",
        implementationApproved: true,
        activationApproved: true,
        implementationStarted: true,
        candidatePackageExists: true,
        candidatePublicCardExists: true,
        completedSteps: completedStepCount(wave5Program),
        inProgressSteps: list(wave5Program.progress?.inProgressStepNumbers),
        currentEvidencePath: WAVE_5_CAPABILITY_EVIDENCE_PATH,
        entryRule: "Wave 4 closed with historical scope evidence; the separate Wave 5 activation decision records current user authority. The first 30 repository-local steps are complete and step 31 starts the bounded resilience-review tranche. This is not a merge, release, installation, external runtime, provider, deployment, signing, or public proof claim.",
      },
    ],
    futureWaveTemplate,
    rolloutRules: [
      "A wave can contain at most one newly approved public capability unless a separate capability decision changes that scope.",
      "Every package stays deny-by-default for writes, network, and secrets until a reviewed change explicitly grants a narrower permission.",
      "A public card, source availability, feature-branch push, and repository-local test result are not independent installation, native runtime, provider, deployment, signing, or public-release proof.",
      "Every active round ends with current validation, a focused reversible commit, and feature-branch delivery when authorized.",
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused active-wave commit and generated cadence records on the feature branch; future planned waves create no external state.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function buildFutureWaveTemplate(sourceSteps) {
  const steps = list(sourceSteps).map((step) => ({
    number: step.number,
    round: step.round,
    title: genericizeTitle(step.title),
    validation: genericizeTitle(step.validation),
    status: "planned-template",
  }));
  return {
    id: "seis-public-plugin-future-wave-template",
    totalSteps: 100,
    roundCount: 5,
    stepsPerRound: 20,
    status: "planned-gated-template",
    purpose: "Reusable 100-step evidence-led template for Waves 4 and 5 after each receives its own selected scope.",
    rounds: [
      { round: 1, name: "Evidence-led discovery", steps: range(1, 20) },
      { round: 2, name: "Bounded scope and design", steps: range(21, 40) },
      { round: 3, name: "Approved implementation and integration", steps: range(41, 60) },
      { round: 4, name: "Resilience and public-contract review", steps: range(61, 80) },
      { round: 5, name: "Handoff and next-wave decision", steps: range(81, 100) },
    ],
    steps,
  };
}

function genericizeTitle(value) {
  return String(value || "")
    .replaceAll("Wave 3", "the active wave")
    .replaceAll("Wave 2", "the prior wave")
    .replaceAll("Swift concurrency", "the selected public capability")
    .replaceAll("SwiftPM", "the selected platform validation")
    .replaceAll("selected capability", "selected capability");
}

function completedStepCount(program) {
  if (Number.isInteger(program?.progress?.completedStepCount)) return program.progress.completedStepCount;
  return list(program?.steps).filter((step) => step?.status === "completed").length;
}

function isSupportedWave4TopologyEvidence(record) {
  const shared = record?.id === "seis-swift-package-topology"
    && record?.status === "ready-public-static-topology-evidence"
    && record?.activation?.implementationObserved === true
    && record?.audit?.ok === true
    && record?.safety?.compilesSwift === false
    && record?.safety?.runsSwiftTests === false
    && record?.publicBoundary?.personalMarketplaceRead === false
    && record?.publicBoundary?.personalMarketplaceMutation === false;
  const wave4Snapshot = record?.marketplace?.applicationPluginCount === 74
    && record?.marketplace?.publicCardCount === 380;
  const activeWave5 = record?.marketplace?.applicationPluginCount === 75
    && record?.marketplace?.publicCardCount === 381;
  return shared && (wave4Snapshot || activeWave5);
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-continuity-cadence" && record.goalId === "SEIS-GOAL-021" && record.status === "active-evidence-led-cadence" && record.maturity === "specification", "record identity is invalid");
  assert(record.executionBoundary?.marketplaceName === "seis-repo" && record.executionBoundary?.marketplaceDisplayName === "SEIS Repo" && record.executionBoundary?.personalMarketplaceRead === false && record.executionBoundary?.personalMarketplaceMutation === false && record.executionBoundary?.network === false && record.executionBoundary?.externalWrites === false && record.executionBoundary?.secrets === false && record.executionBoundary?.protectedDefaultBranchWrites === false && record.executionBoundary?.backgroundExecutionClaimed === false && record.executionBoundary?.featureBranchDeliveryRequired === true, "execution boundary is invalid");
  assert(record.cadence?.bootstrap?.totalSteps === 30 && record.cadence?.bootstrap?.roundCount === 5 && record.cadence?.bootstrap?.stepsPerRound === 6 && record.cadence?.bootstrap?.status === "completed", "30-step bootstrap is invalid");
  assert(record.cadence?.waveSeries?.waveCount === 5 && record.cadence?.waveSeries?.stepsPerWave === 100 && record.cadence?.waveSeries?.roundsPerWave === 5 && record.cadence?.waveSeries?.stepsPerRound === 20 && record.cadence?.waveSeries?.totalPlannedWaveSteps === 500 && record.cadence?.waveSeries?.activeWave === 5 && record.cadence?.waveSeries?.activeWaveState === "wave-5-first-30-steps-completed-step-31-in-progress", "five-wave cadence is invalid");
  assert(record.cadence?.githubDelivery?.branch === FEATURE_BRANCH && record.cadence?.githubDelivery?.protectedDefaultBranchWrites === false && record.cadence?.githubDelivery?.remoteReferenceVerificationRequired === true, "GitHub delivery boundary is invalid");
  assert(record.cadence?.afterFiveWaves?.nextBootstrapSteps === 30 && record.cadence?.afterFiveWaves?.nextWaveCount === 5 && record.cadence?.afterFiveWaves?.nextWaveSteps === 100 && record.cadence?.afterFiveWaves?.backgroundExecutionClaimed === false, "post-series continuation is invalid");
  const [wave1, wave2, wave3, wave4, wave5] = list(record.waves);
  assert(list(record.waves).length === 5 && wave1?.status === "completed" && wave1?.completedSteps === 100 && wave2?.status === "completed" && wave2?.completedSteps === 100, "completed predecessor waves are invalid");
  assert(wave3?.status === "completed" && wave3?.completedSteps === 100 && list(wave3?.inProgressSteps).length === 0 && wave3?.priorValidationPath === WAVE_3_FINAL_VALIDATION_PATH && wave3?.preflightPath === WAVE_3_FINAL_PREFLIGHT_PATH && wave3?.deliveryEvidencePath === WAVE_3_DELIVERY_EVIDENCE_PATH && wave3?.repositoryLocalHandoffPath === WAVE_3_REPOSITORY_LOCAL_HANDOFF_PATH && wave3?.followingWaveReviewPath === WAVE_3_FOLLOWING_WAVE_REVIEW_PATH && wave3?.closeoutPath === WAVE_3_CLOSEOUT_PATH && wave3?.currentEvidencePath === WAVE_3_CLOSEOUT_PATH, "Wave 3 cadence evidence is invalid");
  assert(wave4?.status === "completed" && wave4?.programPath === WAVE_4_PROGRAM_PATH && wave4?.scopeReviewPath === WAVE_3_FOLLOWING_WAVE_REVIEW_PATH && wave4?.activationDecisionPath === WAVE_4_ACTIVATION_DECISION_PATH && wave4?.selectedCapability === "seis-swift-package-topology" && wave4?.activationApproved === true && wave4?.implementationStarted === true && wave4?.candidatePackageExists === true && wave4?.candidatePublicCardExists === true && wave4?.completedSteps === 100 && list(wave4?.inProgressSteps).length === 0 && wave4?.topologyEvidencePath === WAVE_4_TOPOLOGY_EVIDENCE_PATH && wave4?.integrationCheckpointPath === WAVE_4_INTEGRATION_CHECKPOINT_PATH && wave4?.validationDeliveryEvidencePath === WAVE_4_VALIDATION_DELIVERY_EVIDENCE_PATH && wave4?.publicBoundaryDecisionPath === WAVE_4_PUBLIC_BOUNDARY_DECISION_PATH && wave4?.handoffPreparationPath === WAVE_4_HANDOFF_PREPARATION_PATH && wave4?.closeoutSequenceDecisionPath === WAVE_4_CLOSEOUT_SEQUENCE_DECISION_PATH && wave4?.repositoryLocalHandoffPath === WAVE_4_REPOSITORY_LOCAL_HANDOFF_PATH && wave4?.followingWaveReviewPath === WAVE_4_FOLLOWING_WAVE_REVIEW_PATH && wave4?.evidenceRetentionPath === WAVE_4_EVIDENCE_RETENTION_PATH && wave4?.closeoutPath === WAVE_4_CLOSEOUT_PATH && wave4?.currentEvidencePath === WAVE_4_CLOSEOUT_PATH && wave4?.totalSteps === 100, "Wave 4 cadence evidence is invalid");
  assert(wave5?.status === "in-progress" && wave5?.programPath === WAVE_5_PROGRAM_PATH && wave5?.candidateReviewPath === WAVE_4_FOLLOWING_WAVE_REVIEW_PATH && wave5?.activationDecisionPath === WAVE_5_ACTIVATION_DECISION_PATH && wave5?.capabilityEvidencePath === WAVE_5_CAPABILITY_EVIDENCE_PATH && wave5?.selectedCapability === "seis-plugin-capability-coverage" && wave5?.implementationApproved === true && wave5?.activationApproved === true && wave5?.implementationStarted === true && wave5?.candidatePackageExists === true && wave5?.candidatePublicCardExists === true && wave5?.completedSteps === 30 && list(wave5?.inProgressSteps).join(",") === "31" && wave5?.currentEvidencePath === WAVE_5_CAPABILITY_EVIDENCE_PATH && wave5?.totalSteps === 100, "Wave 5 cadence evidence is invalid");
  assert(record.futureWaveTemplate?.id === "seis-public-plugin-future-wave-template" && record.futureWaveTemplate?.totalSteps === 100 && record.futureWaveTemplate?.roundCount === 5 && record.futureWaveTemplate?.stepsPerRound === 20 && list(record.futureWaveTemplate?.rounds).length === 5 && list(record.futureWaveTemplate?.steps).length === 100 && list(record.futureWaveTemplate?.steps).every((step, index) => step?.number === index + 1 && step?.round === Math.floor(index / 20) + 1 && step?.status === "planned-template" && typeof step?.title === "string" && step.title.length > 0), "future wave template is invalid");
  assert(list(record.rolloutRules).length === 4 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "rollout rule or rollback boundary is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "cadence must not contain a machine-specific path");
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin continuity cadence: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin continuity cadence: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
