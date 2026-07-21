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
  assert(wave3FinalValidation?.id === "seis-public-plugin-wave-3-final-validation" && wave3FinalValidation?.status === "completed-repository-local-final-validation" && wave3FinalValidation?.step === 81 && wave3FinalValidation?.futureWaveDecision?.activationApproved === false, "Wave 3 final validation evidence is invalid");
  assert(wave3FinalPreflight?.id === "seis-public-plugin-wave-3-final-preflight" && wave3FinalPreflight?.status === "completed-repository-local-final-preflight" && list(wave3FinalPreflight?.completedSteps).join(",") === range(82, 91).join(",") && wave3FinalPreflight?.futureWaveDecision?.activationApproved === false, "Wave 3 final preflight evidence is invalid");
  assert(wave3DeliveryEvidence?.id === "seis-public-plugin-wave-3-delivery-evidence" && wave3DeliveryEvidence?.status === "completed-repository-local-delivery-evidence" && list(wave3DeliveryEvidence?.completedSteps).join(",") === range(92, 96).join(",") && wave3DeliveryEvidence?.observedDelivery?.remoteReferenceVerified === true && wave3DeliveryEvidence?.futureWaveDecision?.activationApproved === false, "Wave 3 delivery evidence is invalid");
  assert(wave3RepositoryLocalHandoff?.id === "seis-public-plugin-wave-3-repository-local-handoff" && wave3RepositoryLocalHandoff?.status === "completed-repository-local-handoff" && wave3RepositoryLocalHandoff?.step === 97 && wave3RepositoryLocalHandoff?.futureWaveDecision?.activationApproved === false, "Wave 3 repository-local handoff evidence is invalid");
  assert(wave3FollowingWaveReview?.id === "seis-public-plugin-wave-3-following-wave-review" && wave3FollowingWaveReview?.status === "completed-following-wave-scope-review" && wave3FollowingWaveReview?.step === 98 && wave3FollowingWaveReview?.followingWaveDecision?.selectedCapability === "seis-swift-package-topology" && wave3FollowingWaveReview?.followingWaveDecision?.implementationApproved === false && wave3FollowingWaveReview?.followingWaveDecision?.activationApproved === false, "Wave 3 following-wave review is invalid");
  assert(wave3Closeout?.id === "seis-public-plugin-wave-3-closeout" && wave3Closeout?.status === "completed-repository-local-wave-closeout" && wave3Closeout?.step === 100 && wave3Closeout?.completion?.completedStepCount === 100 && wave3Closeout?.completion?.completedRoundCount === 5 && wave3Closeout?.completion?.nextActiveWave === null && wave3Closeout?.completion?.nextWaveStatus === "planned-gated" && wave3Closeout?.completion?.nextWaveActivationApproved === false, "Wave 3 closeout is invalid");
  assert(wave4ActivationDecision?.id === "seis-public-plugin-wave-4-activation-decision" && wave4ActivationDecision?.status === "approved-public-local-wave-4-activation" && wave4ActivationDecision?.decision?.selectedCapability === "seis-swift-package-topology" && wave4ActivationDecision?.decision?.activationApproved === true && wave4ActivationDecision?.decision?.implementationApproved === true && wave4ActivationDecision?.decision?.implementationStarted === false && wave4ActivationDecision?.decision?.publicReleaseApproved === false, "Wave 4 activation decision is invalid");
  assert(wave4Program?.id === "seis-public-plugin-wave-4-program" && wave4Program?.status === "in-progress" && wave4Program?.wave?.number === 4 && wave4Program?.scope?.selectedCapability === "seis-swift-package-topology" && wave4Program?.activationGate?.status === "approved" && wave4Program?.activationGate?.activationDecisionPath === WAVE_4_ACTIVATION_DECISION_PATH && wave4Program?.activationGate?.implementationStarted === false && wave4Program?.activationGate?.candidatePackageExists === false && wave4Program?.activationGate?.candidatePublicCardExists === false && list(wave4Program?.progress?.inProgressStepNumbers).join(",") === "1", "Wave 4 activation is invalid");
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
        activeWave: 4,
        activeWaveState: "activation-approved-step-1-in-progress",
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
        status: "in-progress",
        programId: "seis-public-plugin-wave-4-program",
        programPath: WAVE_4_PROGRAM_PATH,
        totalSteps: 100,
        stepTemplateId: futureWaveTemplate.id,
        scopeReviewPath: WAVE_3_FOLLOWING_WAVE_REVIEW_PATH,
        activationDecisionPath: WAVE_4_ACTIVATION_DECISION_PATH,
        selectedCapability: "seis-swift-package-topology",
        activationApproved: true,
        implementationStarted: false,
        candidatePackageExists: false,
        candidatePublicCardExists: false,
        completedSteps: completedStepCount(wave4Program),
        inProgressSteps: list(wave4Program.progress?.inProgressStepNumbers),
        currentEvidencePath: WAVE_4_ACTIVATION_DECISION_PATH,
        predecessor: "Wave 3 repository-local handoff",
        entryRule: "Wave 3 closed with current evidence and the separate activation decision approved only the fixed-manifest, repository-local static-contract scope.",
      },
      {
        wave: 5,
        status: "planned-gated",
        programId: "seis-public-plugin-wave-5-program",
        totalSteps: 100,
        stepTemplateId: futureWaveTemplate.id,
        predecessor: "Wave 4 repository-local handoff",
        entryRule: "Activate only after Wave 4 handoff, current validation, an explicit scope and risk decision, and current user authority.",
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

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-continuity-cadence" && record.goalId === "SEIS-GOAL-021" && record.status === "active-evidence-led-cadence" && record.maturity === "specification", "record identity is invalid");
  assert(record.executionBoundary?.marketplaceName === "seis-repo" && record.executionBoundary?.marketplaceDisplayName === "SEIS Repo" && record.executionBoundary?.personalMarketplaceRead === false && record.executionBoundary?.personalMarketplaceMutation === false && record.executionBoundary?.network === false && record.executionBoundary?.externalWrites === false && record.executionBoundary?.secrets === false && record.executionBoundary?.protectedDefaultBranchWrites === false && record.executionBoundary?.backgroundExecutionClaimed === false && record.executionBoundary?.featureBranchDeliveryRequired === true, "execution boundary is invalid");
  assert(record.cadence?.bootstrap?.totalSteps === 30 && record.cadence?.bootstrap?.roundCount === 5 && record.cadence?.bootstrap?.stepsPerRound === 6 && record.cadence?.bootstrap?.status === "completed", "30-step bootstrap is invalid");
  assert(record.cadence?.waveSeries?.waveCount === 5 && record.cadence?.waveSeries?.stepsPerWave === 100 && record.cadence?.waveSeries?.roundsPerWave === 5 && record.cadence?.waveSeries?.stepsPerRound === 20 && record.cadence?.waveSeries?.totalPlannedWaveSteps === 500 && record.cadence?.waveSeries?.activeWave === 4 && record.cadence?.waveSeries?.activeWaveState === "activation-approved-step-1-in-progress", "five-wave cadence is invalid");
  assert(record.cadence?.githubDelivery?.branch === FEATURE_BRANCH && record.cadence?.githubDelivery?.protectedDefaultBranchWrites === false && record.cadence?.githubDelivery?.remoteReferenceVerificationRequired === true, "GitHub delivery boundary is invalid");
  assert(record.cadence?.afterFiveWaves?.nextBootstrapSteps === 30 && record.cadence?.afterFiveWaves?.nextWaveCount === 5 && record.cadence?.afterFiveWaves?.nextWaveSteps === 100 && record.cadence?.afterFiveWaves?.backgroundExecutionClaimed === false, "post-series continuation is invalid");
  assert(list(record.waves).length === 5 && record.waves[0]?.status === "completed" && record.waves[0]?.completedSteps === 100 && record.waves[1]?.status === "completed" && record.waves[1]?.completedSteps === 100 && record.waves[2]?.status === "completed" && record.waves[2]?.completedSteps === 100 && list(record.waves[2]?.inProgressSteps).length === 0 && record.waves[2]?.priorValidationPath === WAVE_3_FINAL_VALIDATION_PATH && record.waves[2]?.preflightPath === WAVE_3_FINAL_PREFLIGHT_PATH && record.waves[2]?.deliveryEvidencePath === WAVE_3_DELIVERY_EVIDENCE_PATH && record.waves[2]?.repositoryLocalHandoffPath === WAVE_3_REPOSITORY_LOCAL_HANDOFF_PATH && record.waves[2]?.followingWaveReviewPath === WAVE_3_FOLLOWING_WAVE_REVIEW_PATH && record.waves[2]?.closeoutPath === WAVE_3_CLOSEOUT_PATH && record.waves[2]?.currentEvidencePath === WAVE_3_CLOSEOUT_PATH && record.waves[3]?.status === "in-progress" && record.waves[3]?.programPath === WAVE_4_PROGRAM_PATH && record.waves[3]?.scopeReviewPath === WAVE_3_FOLLOWING_WAVE_REVIEW_PATH && record.waves[3]?.activationDecisionPath === WAVE_4_ACTIVATION_DECISION_PATH && record.waves[3]?.selectedCapability === "seis-swift-package-topology" && record.waves[3]?.activationApproved === true && record.waves[3]?.implementationStarted === false && record.waves[3]?.candidatePackageExists === false && record.waves[3]?.candidatePublicCardExists === false && record.waves[3]?.completedSteps === 0 && list(record.waves[3]?.inProgressSteps).join(",") === "1" && record.waves[3]?.currentEvidencePath === WAVE_4_ACTIVATION_DECISION_PATH && record.waves[3]?.totalSteps === 100 && record.waves[4]?.status === "planned-gated" && record.waves[4]?.totalSteps === 100, "wave states are invalid");
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
