#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const recordPath = path.join(root, "content", "development", "seis-public-plugin-expansion-program.json");
const handoffPath = path.join(root, "content", "development", "seis-public-plugin-wave-1-handoff.json");
const wave2ProgramPath = path.join(root, "content", "development", "seis-public-plugin-wave-2-program.json");
const wave2HandoffPath = path.join(root, "content", "development", "seis-public-plugin-wave-2-handoff.json");
const wave3ProgramPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-program.json");
const wave3DecisionPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-capability-decision.json");
const wave3Round3CheckpointPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-round-3-checkpoint.json");
const wave3Round4ReviewPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-round-4-review.json");
const wave3HandoffReadinessPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-handoff-readiness.json");
const wave3FinalValidationPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-final-validation.json");
const wave3FinalPreflightPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-final-preflight.json");
const wave3DeliveryEvidencePath = path.join(root, "content", "development", "seis-public-plugin-wave-3-delivery-evidence.json");
const wave3RepositoryLocalHandoffPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-repository-local-handoff.json");
const wave3FollowingWaveReviewPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-following-wave-review.json");
const wave3CloseoutPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-closeout.json");
const wave4ActivationDecisionPath = path.join(root, "content", "development", "seis-public-plugin-wave-4-activation-decision.json");
const wave4ProgramPath = path.join(root, "content", "development", "seis-public-plugin-wave-4-program.json");
const wave4TopologyEvidencePath = path.join(root, "content", "development", "seis-swift-package-topology.json");
const wave4IntegrationCheckpointPath = path.join(root, "content", "development", "seis-public-plugin-wave-4-integration-checkpoint.json");
const wave4ValidationDeliveryEvidencePath = path.join(root, "content", "development", "seis-public-plugin-wave-4-validation-delivery-evidence.json");
const wave4PublicBoundaryDecisionPath = path.join(root, "content", "development", "seis-public-plugin-wave-4-public-boundary-decision.json");
const wave4HandoffPreparationPath = path.join(root, "content", "development", "seis-public-plugin-wave-4-handoff-preparation.json");
const wave4CloseoutSequenceDecisionPath = path.join(root, "content", "development", "seis-public-plugin-wave-4-closeout-sequence-decision.json");
const wave4RepositoryLocalHandoffPath = path.join(root, "content", "development", "seis-public-plugin-wave-4-repository-local-handoff.json");
const wave4FollowingWaveReviewPath = path.join(root, "content", "development", "seis-public-plugin-wave-4-following-wave-review.json");
const wave4EvidenceRetentionPath = path.join(root, "content", "development", "seis-public-plugin-wave-4-evidence-retention.json");
const wave4CloseoutPath = path.join(root, "content", "development", "seis-public-plugin-wave-4-closeout.json");
const wave5ActivationDecisionPath = path.join(root, "content", "development", "seis-public-plugin-wave-5-activation-decision.json");
const wave5ProgramPath = path.join(root, "content", "development", "seis-public-plugin-wave-5-program.json");
const wave5CapabilityEvidencePath = path.join(root, "content", "development", "seis-plugin-capability-coverage.json");
const continuityCadencePath = path.join(root, "content", "development", "seis-public-plugin-continuity-cadence.json");
const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
const handoff = fs.existsSync(handoffPath) ? JSON.parse(fs.readFileSync(handoffPath, "utf8")) : null;
const wave2Program = fs.existsSync(wave2ProgramPath) ? JSON.parse(fs.readFileSync(wave2ProgramPath, "utf8")) : null;
const wave2Handoff = fs.existsSync(wave2HandoffPath) ? JSON.parse(fs.readFileSync(wave2HandoffPath, "utf8")) : null;
const wave3Program = fs.existsSync(wave3ProgramPath) ? JSON.parse(fs.readFileSync(wave3ProgramPath, "utf8")) : null;
const wave3Decision = fs.existsSync(wave3DecisionPath) ? JSON.parse(fs.readFileSync(wave3DecisionPath, "utf8")) : null;
const wave3Round3Checkpoint = fs.existsSync(wave3Round3CheckpointPath) ? JSON.parse(fs.readFileSync(wave3Round3CheckpointPath, "utf8")) : null;
const wave3Round4Review = fs.existsSync(wave3Round4ReviewPath) ? JSON.parse(fs.readFileSync(wave3Round4ReviewPath, "utf8")) : null;
const wave3HandoffReadiness = fs.existsSync(wave3HandoffReadinessPath) ? JSON.parse(fs.readFileSync(wave3HandoffReadinessPath, "utf8")) : null;
const wave3FinalValidation = fs.existsSync(wave3FinalValidationPath) ? JSON.parse(fs.readFileSync(wave3FinalValidationPath, "utf8")) : null;
const wave3FinalPreflight = fs.existsSync(wave3FinalPreflightPath) ? JSON.parse(fs.readFileSync(wave3FinalPreflightPath, "utf8")) : null;
const wave3DeliveryEvidence = fs.existsSync(wave3DeliveryEvidencePath) ? JSON.parse(fs.readFileSync(wave3DeliveryEvidencePath, "utf8")) : null;
const wave3RepositoryLocalHandoff = fs.existsSync(wave3RepositoryLocalHandoffPath) ? JSON.parse(fs.readFileSync(wave3RepositoryLocalHandoffPath, "utf8")) : null;
const wave3FollowingWaveReview = fs.existsSync(wave3FollowingWaveReviewPath) ? JSON.parse(fs.readFileSync(wave3FollowingWaveReviewPath, "utf8")) : null;
const wave3Closeout = fs.existsSync(wave3CloseoutPath) ? JSON.parse(fs.readFileSync(wave3CloseoutPath, "utf8")) : null;
const wave4ActivationDecision = fs.existsSync(wave4ActivationDecisionPath) ? JSON.parse(fs.readFileSync(wave4ActivationDecisionPath, "utf8")) : null;
const wave4Program = fs.existsSync(wave4ProgramPath) ? JSON.parse(fs.readFileSync(wave4ProgramPath, "utf8")) : null;
const wave4TopologyEvidence = fs.existsSync(wave4TopologyEvidencePath) ? JSON.parse(fs.readFileSync(wave4TopologyEvidencePath, "utf8")) : null;
const wave4IntegrationCheckpoint = fs.existsSync(wave4IntegrationCheckpointPath) ? JSON.parse(fs.readFileSync(wave4IntegrationCheckpointPath, "utf8")) : null;
const wave4ValidationDeliveryEvidence = fs.existsSync(wave4ValidationDeliveryEvidencePath) ? JSON.parse(fs.readFileSync(wave4ValidationDeliveryEvidencePath, "utf8")) : null;
const wave4PublicBoundaryDecision = fs.existsSync(wave4PublicBoundaryDecisionPath) ? JSON.parse(fs.readFileSync(wave4PublicBoundaryDecisionPath, "utf8")) : null;
const wave4HandoffPreparation = fs.existsSync(wave4HandoffPreparationPath) ? JSON.parse(fs.readFileSync(wave4HandoffPreparationPath, "utf8")) : null;
const wave4CloseoutSequenceDecision = fs.existsSync(wave4CloseoutSequenceDecisionPath) ? JSON.parse(fs.readFileSync(wave4CloseoutSequenceDecisionPath, "utf8")) : null;
const wave4RepositoryLocalHandoff = fs.existsSync(wave4RepositoryLocalHandoffPath) ? JSON.parse(fs.readFileSync(wave4RepositoryLocalHandoffPath, "utf8")) : null;
const wave4FollowingWaveReview = fs.existsSync(wave4FollowingWaveReviewPath) ? JSON.parse(fs.readFileSync(wave4FollowingWaveReviewPath, "utf8")) : null;
const wave4EvidenceRetention = fs.existsSync(wave4EvidenceRetentionPath) ? JSON.parse(fs.readFileSync(wave4EvidenceRetentionPath, "utf8")) : null;
const wave4Closeout = fs.existsSync(wave4CloseoutPath) ? JSON.parse(fs.readFileSync(wave4CloseoutPath, "utf8")) : null;
const wave5ActivationDecision = fs.existsSync(wave5ActivationDecisionPath) ? JSON.parse(fs.readFileSync(wave5ActivationDecisionPath, "utf8")) : null;
const wave5Program = fs.existsSync(wave5ProgramPath) ? JSON.parse(fs.readFileSync(wave5ProgramPath, "utf8")) : null;
const wave5CapabilityEvidence = fs.existsSync(wave5CapabilityEvidencePath) ? JSON.parse(fs.readFileSync(wave5CapabilityEvidencePath, "utf8")) : null;
const continuityCadence = fs.existsSync(continuityCadencePath) ? JSON.parse(fs.readFileSync(continuityCadencePath, "utf8")) : null;
const failures = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

ensure(record?.schemaVersion === 1, "schemaVersion must be 1");
ensure(record?.id === "seis-public-plugin-expansion-program", "program id is invalid");
ensure(record?.goalId === "SEIS-GOAL-021", "goal linkage is invalid");
ensure(record?.executionBoundary?.publicMarketplace === "seis-repo", "program must target the public seis-repo marketplace");
ensure(record?.executionBoundary?.personalMarketplaceRead === false, "program must not read the personal marketplace");
ensure(record?.executionBoundary?.personalMarketplaceMutation === false, "program must not mutate the personal marketplace");
ensure(record?.executionBoundary?.backgroundExecutionClaimed === false, "program must not claim background execution");
ensure(record?.cadence?.programSteps === 30, "program must contain exactly 30 steps");
ensure(record?.cadence?.roundCount === 5 && record?.cadence?.stepsPerRound === 6, "program cadence must be five rounds of six steps");
ensure(record?.cadence?.githubDelivery?.enabled === true, "program must require validated checkpoint delivery");
ensure(record?.cadence?.githubDelivery?.protectedDefaultBranchWrites === false, "program must preserve protected default branch safety");
ensure(record?.cadence?.afterProgram?.nextWaveCount === 5 && record?.cadence?.afterProgram?.stepsPerWave === 100, "post-program cadence must define five 100-step waves");
ensure(record?.cadence?.afterProgram?.continuityCadencePath === "content/development/seis-public-plugin-continuity-cadence.json", "post-program cadence must link the continuity record");
ensure(record?.cadence?.afterProgram?.afterFiveWavesRule?.includes("30-step scope"), "post-program cadence must define the next-series scope gate");
ensure(Array.isArray(record?.rounds) && record.rounds.length === 5, "program must define five rounds");
ensure(Array.isArray(record?.steps) && record.steps.length === 30, "program must define 30 steps");
ensure(Array.isArray(record?.nextWaves) && record.nextWaves.length === 5, "program must define five next waves");

for (let index = 0; index < 30; index += 1) {
  const step = record.steps?.[index];
  const expectedNumber = index + 1;
  const expectedRound = Math.ceil(expectedNumber / 6);
  ensure(step?.number === expectedNumber, `step ${expectedNumber} number is invalid`);
  ensure(step?.round === expectedRound, `step ${expectedNumber} must belong to round ${expectedRound}`);
  ensure(typeof step?.title === "string" && step.title.length > 0, `step ${expectedNumber} needs a title`);
  ensure(typeof step?.validation === "string" && step.validation.length > 0, `step ${expectedNumber} needs validation`);
}

for (let index = 0; index < 5; index += 1) {
  const round = record.rounds?.[index];
  const wave = record.nextWaves?.[index];
  ensure(round?.round === index + 1, `round ${index + 1} is invalid`);
  ensure(Array.isArray(round?.steps) && round.steps.length === 6, `round ${index + 1} must contain six step references`);
  ensure(wave?.wave === index + 1 && wave?.steps === 100, `wave ${index + 1} must contain 100 steps`);
  if (index === 0) {
    ensure(wave?.status === "completed", "wave 1 must be completed after its release-quality handoff");
    ensure(wave?.programId === "seis-public-plugin-wave-1-program", "wave 1 must identify its 100-step program");
    ensure(wave?.handoffEvidencePath === "content/development/seis-public-plugin-wave-1-handoff.json", "wave 1 must identify its handoff evidence");
    ensure(handoff?.id === "seis-public-plugin-wave-1-handoff" && handoff?.status === "completed-repository-local-handoff", "wave 1 handoff evidence is invalid");
  } else if (index === 1) {
    ensure(wave?.status === "completed", "wave 2 must be completed only after current evidence, scope review, and risk review");
    ensure(wave?.programId === "seis-public-plugin-wave-2-program", "wave 2 must identify its 100-step program");
    ensure(wave?.scopeRiskReviewPath === "content/development/seis-public-plugin-wave-1-handoff.json", "wave 2 must identify its scope and risk review");
    ensure(wave?.capabilityDecisionPath === "content/development/seis-public-plugin-wave-2-capability-decision.json", "wave 2 must identify its capability decision");
    ensure(wave?.handoffEvidencePath === "content/development/seis-public-plugin-wave-2-handoff.json", "wave 2 must identify its handoff evidence");
    ensure(wave2Program?.id === "seis-public-plugin-wave-2-program" && wave2Program?.status === "completed" && wave2Program?.progress?.completedStepCount === 100, "wave 2 program evidence is invalid");
    ensure(Array.isArray(wave2Program?.steps) && wave2Program.steps.length === 100 && wave2Program.steps.every((step) => step?.status === "completed"), "wave 2 must contain one hundred completed steps");
    ensure(wave2Handoff?.id === "seis-public-plugin-wave-2-handoff" && wave2Handoff?.status === "completed-repository-local-handoff", "wave 2 handoff evidence is invalid");
  } else if (index === 2) {
    ensure(wave?.status === "completed", "wave 3 must be completed only after its repository-local closeout records all one hundred steps");
    ensure(wave?.programId === "seis-public-plugin-wave-3-program", "wave 3 must identify its 100-step program");
    ensure(wave?.scopeRiskReviewPath === "content/development/seis-public-plugin-wave-2-handoff.json", "wave 3 must identify its Wave 2 scope and risk review");
    ensure(wave?.capabilityDecisionPath === "content/development/seis-public-plugin-wave-3-capability-decision.json", "wave 3 must identify its capability decision");
    ensure(wave?.handoffEvidencePath === "content/development/seis-public-plugin-wave-3-repository-local-handoff.json", "wave 3 must identify its repository-local handoff");
    ensure(wave?.followingWaveReviewPath === "content/development/seis-public-plugin-wave-3-following-wave-review.json", "wave 3 must identify its following-wave review");
    ensure(wave?.completionEvidencePath === "content/development/seis-public-plugin-wave-3-closeout.json", "wave 3 must identify its closeout evidence");
    ensure(wave3Program?.id === "seis-public-plugin-wave-3-program" && wave3Program?.status === "completed" && wave3Program?.progress?.completedStepCount === 100 && wave3Program?.progress?.plannedStepCount === 0 && Array.isArray(wave3Program?.progress?.inProgressStepNumbers) && wave3Program.progress.inProgressStepNumbers.length === 0 && wave3Program?.progress?.completedRoundCount === 5 && wave3Program?.progress?.nextStepNumber === null, "wave 3 program evidence is invalid");
    ensure(wave3Program?.selection?.status === "implementation-approved" && wave3Program?.selection?.selectedCapability === "seis-swift-concurrency-audit" && wave3Program?.selection?.implementationStarted === true && wave3Program?.selection?.additionalPublicCardAdded === true, "wave 3 selection evidence is invalid");
    ensure(Array.isArray(wave3Program?.steps) && wave3Program.steps.length === 100 && wave3Program.steps.every((step) => step?.status === "completed"), "wave 3 step state is invalid");
    ensure(wave3Decision?.id === "seis-public-plugin-wave-3-capability-decision" && wave3Decision?.status === "approved-public-local-implementation" && wave3Decision?.decision?.selectedCapability === "seis-swift-concurrency-audit" && wave3Decision?.decision?.implementationStarted === true && wave3Decision?.decision?.additionalPublicCardAdded === true, "wave 3 decision evidence is invalid");
    ensure(wave3Round3Checkpoint?.id === "seis-public-plugin-wave-3-round-3-checkpoint" && wave3Round3Checkpoint?.status === "completed-repository-local-checkpoint" && Array.isArray(wave3Round3Checkpoint?.completedSteps) && wave3Round3Checkpoint.completedSteps.length === 14, "wave 3 round 3 checkpoint evidence is invalid");
    ensure(wave3Round4Review?.id === "seis-public-plugin-wave-3-round-4-review" && wave3Round4Review?.status === "completed-repository-local-round-review" && Array.isArray(wave3Round4Review?.completedSteps) && wave3Round4Review.completedSteps.length === 19, "wave 3 round 4 review evidence is invalid");
    ensure(wave3HandoffReadiness?.id === "seis-public-plugin-wave-3-handoff-readiness" && wave3HandoffReadiness?.status === "completed-repository-local-handoff-readiness" && wave3HandoffReadiness?.step === 80 && wave3HandoffReadiness?.futureWaveDecision?.activationApproved === false, "wave 3 handoff readiness evidence is invalid");
    ensure(wave3FinalValidation?.id === "seis-public-plugin-wave-3-final-validation" && wave3FinalValidation?.status === "completed-repository-local-final-validation" && wave3FinalValidation?.step === 81 && wave3FinalValidation?.futureWaveDecision?.activationApproved === false, "wave 3 final validation evidence is invalid");
    ensure(wave3FinalPreflight?.id === "seis-public-plugin-wave-3-final-preflight" && wave3FinalPreflight?.status === "completed-repository-local-final-preflight" && Array.isArray(wave3FinalPreflight?.completedSteps) && wave3FinalPreflight.completedSteps.length === 10 && wave3FinalPreflight.completedSteps.every((step, stepIndex) => step === stepIndex + 82) && wave3FinalPreflight?.futureWaveDecision?.activationApproved === false, "wave 3 final preflight evidence is invalid");
    ensure(wave3DeliveryEvidence?.id === "seis-public-plugin-wave-3-delivery-evidence" && wave3DeliveryEvidence?.status === "completed-repository-local-delivery-evidence" && Array.isArray(wave3DeliveryEvidence?.completedSteps) && wave3DeliveryEvidence.completedSteps.length === 5 && wave3DeliveryEvidence.completedSteps.every((step, stepIndex) => step === stepIndex + 92) && wave3DeliveryEvidence?.observedDelivery?.remoteReferenceVerified === true && wave3DeliveryEvidence?.futureWaveDecision?.activationApproved === false, "wave 3 delivery evidence is invalid");
    ensure(wave3RepositoryLocalHandoff?.id === "seis-public-plugin-wave-3-repository-local-handoff" && wave3RepositoryLocalHandoff?.status === "completed-repository-local-handoff" && wave3RepositoryLocalHandoff?.step === 97 && wave3RepositoryLocalHandoff?.futureWaveDecision?.activationApproved === false, "wave 3 repository-local handoff evidence is invalid");
    ensure(wave3FollowingWaveReview?.id === "seis-public-plugin-wave-3-following-wave-review" && wave3FollowingWaveReview?.status === "completed-following-wave-scope-review" && wave3FollowingWaveReview?.step === 98 && wave3FollowingWaveReview?.followingWaveDecision?.selectedCapability === "seis-swift-package-topology" && wave3FollowingWaveReview?.followingWaveDecision?.implementationApproved === false && wave3FollowingWaveReview?.followingWaveDecision?.activationApproved === false, "wave 3 following-wave review evidence is invalid");
    ensure(wave3Closeout?.id === "seis-public-plugin-wave-3-closeout" && wave3Closeout?.status === "completed-repository-local-wave-closeout" && wave3Closeout?.step === 100 && wave3Closeout?.stateAtCheckpoint?.wave3Completed === true && wave3Closeout?.stateAtCheckpoint?.wave4Activated === false && wave3Closeout?.completion?.completedStepCount === 100 && wave3Closeout?.completion?.completedRoundCount === 5 && wave3Closeout?.completion?.nextActiveWave === null && wave3Closeout?.completion?.nextWaveStatus === "planned-gated" && wave3Closeout?.completion?.nextWaveActivationApproved === false && Object.values(wave3Closeout?.checks || {}).every(Boolean), "wave 3 closeout evidence is invalid");
    ensure(isWave4IntegratedProgram(wave4Program), "wave 4 program evidence is invalid");
  } else if (index === 3) {
    ensure(wave?.status === "completed", "wave 4 must be completed only after its repository-local closeout records all one hundred steps");
    ensure(wave?.programId === "seis-public-plugin-wave-4-program" && wave?.programPath === "content/development/seis-public-plugin-wave-4-program.json", "wave 4 must identify its active program");
    ensure(wave?.scopeRiskReviewPath === "content/development/seis-public-plugin-wave-3-following-wave-review.json", "wave 4 must identify its scope review");
    ensure(wave?.activationDecisionPath === "content/development/seis-public-plugin-wave-4-activation-decision.json" && wave?.activationApproved === true, "wave 4 must identify its activation decision");
    ensure(wave?.implementationStarted === true && wave?.candidatePackageExists === true && wave?.candidatePublicCardExists === true && wave?.topologyEvidencePath === "content/development/seis-swift-package-topology.json" && wave?.integrationCheckpointPath === "content/development/seis-public-plugin-wave-4-integration-checkpoint.json" && wave?.validationDeliveryEvidencePath === "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json" && wave?.publicBoundaryDecisionPath === "content/development/seis-public-plugin-wave-4-public-boundary-decision.json" && wave?.handoffPreparationPath === "content/development/seis-public-plugin-wave-4-handoff-preparation.json" && wave?.closeoutSequenceDecisionPath === "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json" && wave?.repositoryLocalHandoffPath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json" && wave?.followingWaveReviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json" && wave?.evidenceRetentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json" && wave?.completionEvidencePath === "content/development/seis-public-plugin-wave-4-closeout.json", "wave 4 closeout projection is invalid");
    ensure(wave4ActivationDecision?.id === "seis-public-plugin-wave-4-activation-decision" && wave4ActivationDecision?.status === "approved-public-local-wave-4-activation" && wave4ActivationDecision?.decision?.selectedCapability === "seis-swift-package-topology" && wave4ActivationDecision?.decision?.activationApproved === true && wave4ActivationDecision?.decision?.implementationApproved === true && wave4ActivationDecision?.decision?.implementationStarted === false && wave4ActivationDecision?.decision?.publicReleaseApproved === false, "wave 4 activation decision is invalid");
    ensure(isWave4IntegratedProgram(wave4Program), "wave 4 active program is invalid");
    ensure(isWave4TopologyEvidence(wave4TopologyEvidence), "wave 4 topology evidence is invalid");
    ensure(isWave4IntegrationCheckpoint(wave4IntegrationCheckpoint), "wave 4 integration checkpoint is invalid");
    ensure(isWave4ValidationDeliveryEvidence(wave4ValidationDeliveryEvidence), "wave 4 validation-delivery evidence is invalid");
    ensure(isWave4PublicBoundaryDecision(wave4PublicBoundaryDecision), "wave 4 public-boundary decision is invalid");
    ensure(isWave4HandoffPreparation(wave4HandoffPreparation), "wave 4 handoff preparation is invalid");
    ensure(isWave4CloseoutSequenceDecision(wave4CloseoutSequenceDecision), "wave 4 closeout-sequence decision is invalid");
    ensure(isWave4RepositoryLocalHandoff(wave4RepositoryLocalHandoff), "wave 4 repository-local handoff is invalid");
    ensure(isWave4FollowingWaveReview(wave4FollowingWaveReview), "wave 4 following-wave review is invalid");
    ensure(isWave4EvidenceRetention(wave4EvidenceRetention), "wave 4 evidence retention is invalid");
    ensure(isWave4Closeout(wave4Closeout), "wave 4 closeout is invalid");
  } else if (index === 4) {
    ensure(wave?.status === "in-progress", "wave 5 must be marked in progress only after its separate activation decision");
    ensure(wave?.programId === `seis-public-plugin-wave-${index + 1}-program`, `wave ${index + 1} must identify its future program`);
    ensure(wave?.stepTemplateId === "seis-public-plugin-future-wave-template", `wave ${index + 1} must identify the 100-step template`);
    ensure(wave?.continuityCadencePath === "content/development/seis-public-plugin-continuity-cadence.json", `wave ${index + 1} must link the continuity record`);
    ensure(wave?.programPath === "content/development/seis-public-plugin-wave-5-program.json" && wave?.candidateReviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json" && wave?.activationDecisionPath === "content/development/seis-public-plugin-wave-5-activation-decision.json" && wave?.capabilityEvidencePath === "content/development/seis-plugin-capability-coverage.json" && wave?.selectedCapability === "seis-plugin-capability-coverage" && wave?.implementationApproved === true && wave?.activationApproved === true && wave?.implementationStarted === true && wave?.candidatePackageExists === true && wave?.candidatePublicCardExists === true && wave?.completedSteps === 30 && Array.isArray(wave?.inProgressSteps) && wave.inProgressSteps.join(",") === "31", "wave 5 active public-only contract is invalid");
    ensure(isWave5ActiveProgram(wave5Program) && isWave5ActivationDecision(wave5ActivationDecision) && isWave5CapabilityEvidence(wave5CapabilityEvidence), "wave 5 activation, program, or evidence is invalid");
  }
}

ensure(continuityCadence?.id === "seis-public-plugin-continuity-cadence" && continuityCadence?.status === "active-evidence-led-cadence", "continuity cadence evidence is invalid");
ensure(continuityCadence?.cadence?.bootstrap?.totalSteps === 30 && continuityCadence?.cadence?.waveSeries?.waveCount === 5 && continuityCadence?.cadence?.waveSeries?.stepsPerWave === 100 && continuityCadence?.cadence?.waveSeries?.totalPlannedWaveSteps === 500 && continuityCadence?.cadence?.waveSeries?.activeWave === 5 && continuityCadence?.cadence?.waveSeries?.activeWaveState === "wave-5-first-30-steps-completed-step-31-in-progress", "continuity cadence shape is invalid");
ensure(Array.isArray(continuityCadence?.waves) && continuityCadence.waves.length === 5 && continuityCadence.waves[2]?.status === "completed" && continuityCadence.waves[2]?.completedSteps === 100 && Array.isArray(continuityCadence.waves[2]?.inProgressSteps) && continuityCadence.waves[2].inProgressSteps.length === 0 && continuityCadence.waves[2]?.closeoutPath === "content/development/seis-public-plugin-wave-3-closeout.json" && continuityCadence.waves[2]?.currentEvidencePath === "content/development/seis-public-plugin-wave-3-closeout.json" && isWave4IntegratedCadence(continuityCadence.waves[3]) && isWave5ActiveCadence(continuityCadence.waves[4]) && Array.isArray(continuityCadence?.futureWaveTemplate?.steps) && continuityCadence.futureWaveTemplate.steps.length === 100, "continuity cadence wave evidence is invalid");

function isWave5ActivationDecision(decision) {
  return decision?.id === "seis-public-plugin-wave-5-activation-decision"
    && decision?.status === "approved-public-local-wave-5-activation"
    && decision?.decision?.selectedCapability === "seis-plugin-capability-coverage"
    && decision?.decision?.activationApproved === true
    && decision?.decision?.implementationApproved === true
    && decision?.decision?.implementationStarted === true
    && decision?.decision?.candidatePackageExists === true
    && decision?.decision?.candidatePublicCardExists === true
    && decision?.decision?.publicReleaseApproved === false
    && decision?.publicBoundary?.marketplaceName === "seis-repo"
    && decision?.publicBoundary?.personalMarketplaceRead === false
    && decision?.publicBoundary?.personalMarketplaceMutation === false
    && decision?.publicBoundary?.network === false
    && decision?.publicBoundary?.externalWrites === false
    && decision?.publicBoundary?.secrets === false
    && decision?.publicBoundary?.protectedDefaultBranchWrites === false
    && Object.values(decision?.externalClaims || {}).every((value) => value === false);
}

function isWave5CapabilityEvidence(evidence) {
  return evidence?.id === "seis-plugin-capability-coverage"
    && evidence?.status === "ready-public-static-capability-coverage-evidence"
    && evidence?.activation?.activationApproved === true
    && evidence?.activation?.implementationAuthorized === true
    && evidence?.activation?.implementationObserved === true
    && evidence?.activation?.publicReleaseApproved === false
    && evidence?.audit?.ok === true
    && evidence?.audit?.reconciliation?.reconciled === true
    && Array.isArray(evidence?.safety?.write)
    && evidence.safety.write.length === 0
    && Array.isArray(evidence?.safety?.network)
    && evidence.safety.network.length === 0
    && Array.isArray(evidence?.safety?.secrets)
    && evidence.safety.secrets.length === 0
    && evidence?.publicBoundary?.marketplaceName === "seis-repo"
    && evidence?.publicBoundary?.personalMarketplaceRead === false
    && evidence?.publicBoundary?.personalMarketplaceMutation === false
    && evidence?.publicBoundary?.network === false
    && evidence?.publicBoundary?.externalWrites === false
    && evidence?.publicBoundary?.secrets === false
    && evidence?.publicBoundary?.publicReleaseAllowed === false;
}

function isWave5ActiveProgram(program) {
  return program?.id === "seis-public-plugin-wave-5-program"
    && program?.status === "in-progress"
    && program?.maturity === "prototype"
    && program?.wave?.number === 5
    && program?.wave?.totalSteps === 100
    && program?.scope?.selectedCapability === "seis-plugin-capability-coverage"
    && program?.activationGate?.status === "implemented-repository-local"
    && program?.activationGate?.activationDecisionPath === "content/development/seis-public-plugin-wave-5-activation-decision.json"
    && program?.activationGate?.implementationStarted === true
    && program?.activationGate?.candidatePackageExists === true
    && program?.activationGate?.candidatePublicCardExists === true
    && program?.activationGate?.publicReleaseApproved === false
    && program?.progress?.completedStepCount === 30
    && Array.isArray(program?.progress?.inProgressStepNumbers)
    && program.progress.inProgressStepNumbers.join(",") === "31"
    && program?.progress?.plannedStepCount === 69
    && program?.progress?.completedRoundCount === 1
    && program?.progress?.nextStepNumber === 31
    && program?.evidence?.activationDecision === "content/development/seis-public-plugin-wave-5-activation-decision.json"
    && program?.evidence?.capabilityEvidence === "content/development/seis-plugin-capability-coverage.json"
    && Object.values(program?.checks || {}).every(Boolean)
    && Object.values(program?.externalClaims || {}).every((value) => value === false);
}

function isWave5ActiveCadence(wave) {
  return wave?.status === "in-progress"
    && wave?.programId === "seis-public-plugin-wave-5-program"
    && wave?.programPath === "content/development/seis-public-plugin-wave-5-program.json"
    && wave?.activationDecisionPath === "content/development/seis-public-plugin-wave-5-activation-decision.json"
    && wave?.capabilityEvidencePath === "content/development/seis-plugin-capability-coverage.json"
    && wave?.selectedCapability === "seis-plugin-capability-coverage"
    && wave?.implementationApproved === true
    && wave?.activationApproved === true
    && wave?.implementationStarted === true
    && wave?.candidatePackageExists === true
    && wave?.candidatePublicCardExists === true
    && wave?.completedSteps === 30
    && Array.isArray(wave?.inProgressSteps)
    && wave.inProgressSteps.join(",") === "31"
    && wave?.currentEvidencePath === "content/development/seis-plugin-capability-coverage.json"
    && wave?.totalSteps === 100;
}

function isWave4IntegratedProgram(program) {
  return program?.id === "seis-public-plugin-wave-4-program"
    && program?.status === "completed"
    && program?.maturity === "prototype"
    && program?.wave?.number === 4
    && program?.scope?.selectedCapability === "seis-swift-package-topology"
    && program?.activationGate?.status === "implemented-repository-local"
    && program?.activationGate?.activationDecisionPath === "content/development/seis-public-plugin-wave-4-activation-decision.json"
    && program?.activationGate?.implementationStarted === true
    && program?.activationGate?.candidatePackageExists === true
    && program?.activationGate?.candidatePublicCardExists === true
    && program?.progress?.completedStepCount === 100
    && Array.isArray(program?.progress?.inProgressStepNumbers)
    && program.progress.inProgressStepNumbers.length === 0
    && program?.progress?.plannedStepCount === 0
    && program?.progress?.completedRoundCount === 5
    && program?.progress?.nextStepNumber === null
    && program?.evidence?.integrationCheckpointPath === "content/development/seis-public-plugin-wave-4-integration-checkpoint.json"
    && program?.evidence?.validationDeliveryEvidencePath === "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json"
    && program?.evidence?.publicBoundaryDecisionPath === "content/development/seis-public-plugin-wave-4-public-boundary-decision.json"
    && program?.evidence?.handoffPreparationPath === "content/development/seis-public-plugin-wave-4-handoff-preparation.json"
    && program?.evidence?.closeoutSequenceDecisionPath === "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json"
    && program?.evidence?.repositoryLocalHandoffPath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json"
    && program?.evidence?.wave4FollowingWaveReviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json"
    && program?.evidence?.evidenceRetentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json"
    && program?.evidence?.closeoutPath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && program?.closeoutSequence?.status === "completed-repository-local-wave-closeout"
    && program?.closeoutSequence?.approvalSource === "active-thread-user-continuation-objective"
    && Array.isArray(program?.closeoutSequence?.completedSteps)
    && program.closeoutSequence.completedSteps.join(",") === "96,97,98,99,100"
    && program?.closeoutSequence?.activeStep === null
    && program?.closeoutSequence?.terminalHandoffPublished === false
    && program?.closeoutSequence?.waveCompleted === true
    && program?.closeoutSequence?.wave5ActivationApproved === false
    && program?.closeoutSequence?.completionEvidencePath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && program?.repositoryLocalHandoff?.status === "completed-repository-local-handoff"
    && program?.repositoryLocalHandoff?.handoffPath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json"
    && program?.repositoryLocalHandoff?.completedStep === 97
    && program?.repositoryLocalHandoff?.activeStep === 98
    && program?.repositoryLocalHandoff?.terminalHandoffPublished === false
    && program?.repositoryLocalHandoff?.waveCompleted === false
    && program?.repositoryLocalHandoff?.wave5ActivationApproved === false
    && program?.followingWaveReview?.status === "completed-following-wave-scope-review"
    && program?.followingWaveReview?.reviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json"
    && program?.followingWaveReview?.completedStep === 98
    && program?.followingWaveReview?.activeStep === 99
    && program?.followingWaveReview?.selectedWave5Capability === "seis-plugin-capability-coverage"
    && program?.followingWaveReview?.wave5ImplementationApproved === false
    && program?.followingWaveReview?.wave5ActivationApproved === false
    && program?.evidenceRetention?.status === "completed-public-evidence-retention"
    && program?.evidenceRetention?.retentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json"
    && program?.evidenceRetention?.completedStep === 99
    && program?.evidenceRetention?.activeStep === 100
    && program?.evidenceRetention?.deletionPerformed === false
    && program?.evidenceRetention?.externalStorageUsed === false
    && program?.evidenceRetention?.wave5ImplementationApproved === false
    && program?.evidenceRetention?.wave5ActivationApproved === false
    && program?.repositoryLocalCloseout?.status === "completed-repository-local-wave-closeout"
    && program?.repositoryLocalCloseout?.closeoutPath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && program?.repositoryLocalCloseout?.completedStep === 100
    && program?.repositoryLocalCloseout?.nextActiveWave === null
    && program?.repositoryLocalCloseout?.nextWaveStatus === "planned-gated"
    && program?.repositoryLocalCloseout?.nextWaveSelectedCapability === "seis-plugin-capability-coverage"
    && program?.repositoryLocalCloseout?.nextWaveImplementationApproved === false
    && program?.repositoryLocalCloseout?.nextWaveActivationApproved === false
    && program?.repositoryLocalCloseout?.terminalHandoffPublished === false
    && program?.repositoryLocalCloseout?.publicReleaseAllowed === false;
}

function isWave4FollowingWaveReview(review) {
  return review?.id === "seis-public-plugin-wave-4-following-wave-review"
    && review?.status === "completed-following-wave-scope-review"
    && review?.maturity === "specification"
    && review?.wave === 4
    && review?.step === 98
    && review?.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 97
    && review?.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 98
    && review?.stateAtCheckpoint?.nextPlannedDecisionStep === 99
    && Object.values(review?.checks || {}).every(Boolean)
    && review?.followingWaveDecision?.wave === 5
    && review?.followingWaveDecision?.selectedCapability === "seis-plugin-capability-coverage"
    && review?.followingWaveDecision?.implementationApproved === false
    && review?.followingWaveDecision?.activationApproved === false
    && review?.followingWaveDecision?.candidatePackageExists === false
    && review?.followingWaveDecision?.candidatePublicCardExists === false
    && review?.publicBoundary?.marketplaceName === "seis-repo"
    && review?.publicBoundary?.personalMarketplaceRead === false
    && review?.publicBoundary?.personalMarketplaceMutation === false
    && Object.values(review?.externalClaims || {}).every((value) => value === false);
}

function isWave4EvidenceRetention(retention) {
  return retention?.id === "seis-public-plugin-wave-4-evidence-retention"
    && retention?.status === "completed-public-evidence-retention"
    && retention?.maturity === "prototype"
    && retention?.wave === 4
    && retention?.step === 99
    && retention?.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 98
    && retention?.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 99
    && retention?.stateAtCheckpoint?.nextPlannedDecisionStep === 100
    && Object.values(retention?.checks || {}).every(Boolean)
    && retention?.retention?.status === "bounded-public-evidence-retained"
    && retention?.retention?.relativePathOnly === true
    && retention?.retention?.rawContentStored === false
    && retention?.retention?.deletionPerformed === false
    && retention?.retention?.externalStorageUsed === false
    && retention?.retention?.nextActiveStep === 100
    && retention?.publicBoundary?.marketplaceName === "seis-repo"
    && retention?.publicBoundary?.personalMarketplaceRead === false
    && retention?.publicBoundary?.personalMarketplaceMutation === false
    && Object.values(retention?.externalClaims || {}).every((value) => value === false);
}

function isWave4Closeout(closeout) {
  return closeout?.id === "seis-public-plugin-wave-4-closeout"
    && closeout?.status === "completed-repository-local-wave-closeout"
    && closeout?.maturity === "prototype"
    && closeout?.wave === 4
    && closeout?.step === 100
    && closeout?.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 99
    && closeout?.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 100
    && closeout?.stateAtCheckpoint?.completedStepCountAfterTrackerUpdate === 100
    && closeout?.stateAtCheckpoint?.completedRoundCountAfterTrackerUpdate === 5
    && closeout?.stateAtCheckpoint?.waveCompleted === true
    && closeout?.completion?.nextActiveWave === null
    && closeout?.completion?.nextWaveStatus === "planned-gated"
    && closeout?.completion?.nextWaveSelectedCapability === "seis-plugin-capability-coverage"
    && closeout?.completion?.nextWaveImplementationApproved === false
    && closeout?.completion?.nextWaveActivationApproved === false
    && closeout?.completion?.terminalHandoffPublished === false
    && closeout?.completion?.publicReleaseAllowed === false
    && Object.values(closeout?.checks || {}).every(Boolean)
    && Object.values(closeout?.externalClaims || {}).every((value) => value === false);
}

function isWave4TopologyEvidence(evidence) {
  const shared = evidence?.id === "seis-swift-package-topology"
    && evidence?.status === "ready-public-static-topology-evidence"
    && evidence?.activation?.implementationObserved === true
    && evidence?.audit?.ok === true
    && evidence?.safety?.compilesSwift === false
    && evidence?.safety?.runsSwiftTests === false
    && evidence?.publicBoundary?.personalMarketplaceRead === false
    && evidence?.publicBoundary?.personalMarketplaceMutation === false
    && evidence?.publicBoundary?.publicReleaseAllowed === false;
  const wave4Snapshot = evidence?.marketplace?.applicationPluginCount === 74
    && evidence?.marketplace?.publicCardCount === 380;
  const activeWave5 = evidence?.marketplace?.applicationPluginCount === 75
    && evidence?.marketplace?.publicCardCount === 381;
  return shared && (wave4Snapshot || activeWave5);
}

function isWave4IntegrationCheckpoint(checkpoint) {
  return checkpoint?.id === "seis-public-plugin-wave-4-integration-checkpoint"
    && checkpoint?.status === "completed-repository-local-integration-checkpoint"
    && checkpoint?.maturity === "prototype"
    && Array.isArray(checkpoint?.completedSteps)
    && checkpoint.completedSteps.join(",") === "74,75,76,77,78,79,80"
    && checkpoint?.capability?.id === "seis-swift-package-topology"
    && checkpoint?.publicProjection?.applicationPluginCount === 74
    && checkpoint?.publicProjection?.publicCardCount === 380
    && checkpoint?.topologyEvidence?.auditOk === true
    && Array.isArray(checkpoint?.permissions?.write)
    && checkpoint.permissions.write.length === 0
    && Array.isArray(checkpoint?.permissions?.network)
    && checkpoint.permissions.network.length === 0
    && Array.isArray(checkpoint?.permissions?.secrets)
    && checkpoint.permissions.secrets.length === 0
    && Object.values(checkpoint?.externalClaims || {}).every((value) => value === false);
}

function isWave4ValidationDeliveryEvidence(evidence) {
  return evidence?.id === "seis-public-plugin-wave-4-validation-delivery-evidence"
    && evidence?.status === "completed-repository-local-validation-delivery-evidence"
    && evidence?.maturity === "prototype"
    && Array.isArray(evidence?.completedSteps)
    && evidence.completedSteps.join(",") === "81,82,83,84,85,86,87,88,89,90"
    && evidence?.observedDelivery?.sourceIntegrationCommit === "e3cc34d6138c0e47fa582c5fa09e3c92c04a005e"
    && evidence?.observedDelivery?.pushed === true
    && evidence?.observedDelivery?.remoteReferenceVerified === true
    && evidence?.observedDelivery?.protectedDefaultBranchWritten === false
    && Object.values(evidence?.externalClaims || {}).every((value) => value === false);
}

function isWave4PublicBoundaryDecision(decision) {
  return decision?.id === "seis-public-plugin-wave-4-public-boundary-decision"
    && decision?.status === "completed-repository-local-public-boundary-decision"
    && decision?.maturity === "prototype"
    && Array.isArray(decision?.completedSteps)
    && decision.completedSteps.join(",") === "91,92,93,94,95"
    && decision?.remotePolicyObservations?.validationDeliveryCommit === "6f94f08612839984fc841ac56f01e224010456c3"
    && decision?.remotePolicyObservations?.remoteReferenceVerified === true
    && decision?.remotePolicyObservations?.protectedDefaultBranchWritten === false
    && decision?.publicCountReconciliation?.applicationPluginCount === 74
    && decision?.publicCountReconciliation?.publicCardCount === 380
    && decision?.publicCountReconciliation?.personalMarketplaceRead === false
    && decision?.publicCountReconciliation?.personalMarketplaceMutation === false
    && Object.values(decision?.externalClaims || {}).every((value) => value === false)
    && decision?.externalProofAndApprovals?.publicReleaseAllowed === false
    && decision?.recommendedFollowUp?.status === "proposed-not-created";
}

function isWave4HandoffPreparation(preparation) {
  return preparation?.id === "seis-public-plugin-wave-4-handoff-preparation"
    && preparation?.status === "completed-repository-local-handoff-preparation"
    && preparation?.maturity === "prototype"
    && preparation?.step === 96
    && preparation?.stateAtPreparation?.completedStepCount === 95
    && preparation?.stateAtPreparation?.activeStep === 96
    && Array.isArray(preparation?.stateAtPreparation?.remainingStepNumbers)
    && preparation.stateAtPreparation.remainingStepNumbers.join(",") === "97,98,99,100"
    && preparation?.completionState?.completedStep === 96
    && preparation?.completionState?.nextActiveStep === 97
    && Object.values(preparation?.completedEvidence || {}).every(Boolean)
    && preparation?.handoffGate?.ready === false
    && preparation?.handoffGate?.preparationCompleted === true
    && preparation?.handoffGate?.nextActiveStep === 97
    && preparation?.handoffGate?.allOneHundredStepsHaveCurrentEvidence === false
    && preparation?.handoffGate?.terminalHandoffPublished === false
    && preparation?.handoffGate?.waveCompleted === false
    && preparation?.handoffGate?.wave5ActivationApproved === false
    && Object.values(preparation?.externalClaims || {}).every((value) => value === false)
    && preparation?.recommendedFollowUp?.status === "accepted-applied-to-canonical-program"
    && preparation?.recommendedFollowUp?.decisionPath === "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json"
    && preparation?.recommendedFollowUp?.approvalSource === "active-thread-user-continuation-objective";
}

function isWave4CloseoutSequenceDecision(decision) {
  return decision?.id === "seis-public-plugin-wave-4-closeout-sequence-decision"
    && decision?.goalId === "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE"
    && decision?.parentGoalId === "SEIS-GOAL-021"
    && decision?.status === "approved-current-user-continuation-authority"
    && decision?.maturity === "specification"
    && decision?.stateAtDecision?.completedStepCount === 95
    && decision?.stateAtDecision?.activeStep === 96
    && Array.isArray(decision?.stateAtDecision?.plannedStepNumbers)
    && decision.stateAtDecision.plannedStepNumbers.join(",") === "97,98,99,100"
    && decision?.stateAfterApplication?.completedStepCount === 96
    && decision?.stateAfterApplication?.activeStep === 97
    && Array.isArray(decision?.stateAfterApplication?.plannedStepNumbers)
    && decision.stateAfterApplication.plannedStepNumbers.join(",") === "98,99,100"
    && Object.values(decision?.currentEvidence || {}).every(Boolean)
    && decision?.decisionBoundary?.approvalRequired === true
    && decision?.decisionBoundary?.status === "approved-owner-mapping-applied"
    && decision?.decisionBoundary?.approvalSource === "active-thread-user-continuation-objective"
    && decision?.decisionBoundary?.approved === true
    && decision?.decisionBoundary?.appliedToCanonicalProgram === true
    && decision?.decisionBoundary?.automaticStepStatusChangesAllowed === false
    && decision?.decisionBoundary?.terminalHandoffPublished === false
    && decision?.decisionBoundary?.waveCompleted === false
    && decision?.decisionBoundary?.wave5ActivationApproved === false
    && decision?.proposedResolution?.status === "approved-applied"
    && decision?.proposedResolution?.noStepStatusChanges === false
    && decision?.proposedResolution?.manualCanonicalStatusChangeApplied === true
    && decision?.ownerOptions?.[0]?.status === "selected-by-active-user-continuation-objective"
    && Object.values(decision?.externalClaims || {}).every((value) => value === false);
}

function isWave4RepositoryLocalHandoff(handoff) {
  return handoff?.id === "seis-public-plugin-wave-4-repository-local-handoff"
    && handoff?.status === "completed-repository-local-handoff"
    && handoff?.maturity === "prototype"
    && handoff?.step === 97
    && handoff?.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 96
    && handoff?.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 97
    && handoff?.stateAtCheckpoint?.nextPlannedDecisionStep === 98
    && Object.values(handoff?.checks || {}).every(Boolean)
    && handoff?.handoff?.delivery?.featureBranch === "plugins/seis-plugin-root-20260715"
    && handoff?.handoff?.delivery?.currentCheckpointRemoteVerified === false
    && handoff?.handoff?.delivery?.protectedDefaultBranchWritten === false
    && handoff?.futureWaveDecision?.wave === 5
    && handoff?.futureWaveDecision?.status === "planned-gated"
    && handoff?.futureWaveDecision?.selectedCapability === null
    && handoff?.futureWaveDecision?.activationApproved === false
    && Object.values(handoff?.externalClaims || {}).every((value) => value === false);
}

function isWave4IntegratedCadence(wave) {
  return wave?.status === "completed"
    && wave?.programPath === "content/development/seis-public-plugin-wave-4-program.json"
    && wave?.activationDecisionPath === "content/development/seis-public-plugin-wave-4-activation-decision.json"
    && wave?.selectedCapability === "seis-swift-package-topology"
    && wave?.activationApproved === true
    && wave?.implementationStarted === true
    && wave?.candidatePackageExists === true
    && wave?.candidatePublicCardExists === true
    && wave?.completedSteps === 100
    && Array.isArray(wave?.inProgressSteps)
    && wave.inProgressSteps.length === 0
    && wave?.topologyEvidencePath === "content/development/seis-swift-package-topology.json"
    && wave?.integrationCheckpointPath === "content/development/seis-public-plugin-wave-4-integration-checkpoint.json"
    && wave?.validationDeliveryEvidencePath === "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json"
    && wave?.publicBoundaryDecisionPath === "content/development/seis-public-plugin-wave-4-public-boundary-decision.json"
    && wave?.handoffPreparationPath === "content/development/seis-public-plugin-wave-4-handoff-preparation.json"
    && wave?.closeoutSequenceDecisionPath === "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json"
    && wave?.repositoryLocalHandoffPath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json"
    && wave?.followingWaveReviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json"
    && wave?.evidenceRetentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json"
    && wave?.closeoutPath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-closeout.json";
}

const completeSteps = record.steps.filter((step) => step.status === "completed").length;
const inProgressSteps = record.steps.filter((step) => step.status === "in-progress").length;
ensure(inProgressSteps <= 1, "only one program step may be in progress");

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, id: record.id, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  id: record.id,
  goalId: record.goalId,
  steps: record.steps.length,
  rounds: record.rounds.length,
  completedSteps: completeSteps,
  inProgressSteps,
  nextWaves: record.nextWaves.length,
  publicMarketplace: record.executionBoundary.publicMarketplace
}, null, 2));
