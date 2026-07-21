#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-repository-local-handoff.json";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const PRIOR_REMOTE_REFERENCE = "9604666a57db30f7384a1c6939c2f828c4b00d69";
const PATHS = Object.freeze({
  wave4Program: "content/development/seis-public-plugin-wave-4-program.json",
  closeoutSequenceDecision: "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json",
  handoffPreparation: "content/development/seis-public-plugin-wave-4-handoff-preparation.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  expansionProgram: "content/development/seis-public-plugin-expansion-program.json",
  publicBoundaryDecision: "content/development/seis-public-plugin-wave-4-public-boundary-decision.json",
  validationDeliveryEvidence: "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json",
  integrationCheckpoint: "content/development/seis-public-plugin-wave-4-integration-checkpoint.json",
  topologyEvidence: "content/development/seis-swift-package-topology.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  installState: "content/development/seis-public-install-state.json",
  installEvidence: "content/development/seis-public-install-evidence.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
});
const SECRET_PATTERNS = [
  { id: "openai-like-api-key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "private-key-header", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-repository-local-handoff");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 repository-local handoff check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 4 step 97.");
}

function buildRecord() {
  const wave4Program = readJson(PATHS.wave4Program);
  const closeoutSequenceDecision = readJson(PATHS.closeoutSequenceDecision);
  const handoffPreparation = readJson(PATHS.handoffPreparation);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const expansionProgram = readJson(PATHS.expansionProgram);
  const publicBoundaryDecision = readJson(PATHS.publicBoundaryDecision);
  const validationDeliveryEvidence = readJson(PATHS.validationDeliveryEvidence);
  const integrationCheckpoint = readJson(PATHS.integrationCheckpoint);
  const topologyEvidence = readJson(PATHS.topologyEvidence);
  const lifecycle = readJson(PATHS.lifecycle);
  const installState = readJson(PATHS.installState);
  const installEvidence = readJson(PATHS.installEvidence);
  const securityReview = readJson(PATHS.securityReview);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-4-repository-local-handoff",
    goalId: "SEIS-GOAL-021",
    parentGoalId: "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE",
    wave: 4,
    round: 5,
    step: 97,
    status: "completed-repository-local-handoff",
    maturity: "prototype",
    generatedAt: "2026-07-21",
    purpose: "Record Wave 4's repository-local terminal-handoff evidence after the user-authorized closeout order and completed handoff preparation. It does not publish a terminal handoff, complete Wave 4, activate Wave 5, merge, release, sign, install, deploy, or claim independent external proof.",
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 96,
      activeStepBeforeTrackerUpdate: 97,
      nextPlannedDecisionStep: 98,
      terminalHandoffPublished: false,
      waveCompleted: false,
      wave5ActivationApproved: false,
    },
    checks: {
      wave4Tracker: isPreHandoffWave4Tracker(wave4Program),
      closeoutSequenceDecision: closeoutSequenceDecision.id === "seis-public-plugin-wave-4-closeout-sequence-decision"
        && closeoutSequenceDecision.status === "approved-current-user-continuation-authority"
        && closeoutSequenceDecision.decisionBoundary?.status === "approved-owner-mapping-applied"
        && closeoutSequenceDecision.decisionBoundary?.approved === true
        && closeoutSequenceDecision.decisionBoundary?.appliedToCanonicalProgram === true
        && closeoutSequenceDecision.decisionBoundary?.automaticStepStatusChangesAllowed === false
        && closeoutSequenceDecision.stateAfterApplication?.completedStepCount === 96
        && closeoutSequenceDecision.stateAfterApplication?.activeStep === 97
        && Object.values(closeoutSequenceDecision.externalClaims || {}).every((value) => value === false),
      handoffPreparation: handoffPreparation.id === "seis-public-plugin-wave-4-handoff-preparation"
        && handoffPreparation.status === "completed-repository-local-handoff-preparation"
        && handoffPreparation.step === 96
        && handoffPreparation.completionState?.completedStep === 96
        && handoffPreparation.completionState?.nextActiveStep === 97
        && Object.values(handoffPreparation.completedEvidence || {}).every(Boolean)
        && handoffPreparation.handoffGate?.ready === false
        && handoffPreparation.handoffGate?.preparationCompleted === true
        && handoffPreparation.handoffGate?.terminalHandoffPublished === false
        && handoffPreparation.handoffGate?.waveCompleted === false
        && handoffPreparation.handoffGate?.wave5ActivationApproved === false,
      repositoryEvidence: publicBoundaryDecision.id === "seis-public-plugin-wave-4-public-boundary-decision"
        && publicBoundaryDecision.status === "completed-repository-local-public-boundary-decision"
        && list(publicBoundaryDecision.completedSteps).join(",") === "91,92,93,94,95"
        && publicBoundaryDecision.publicCountReconciliation?.marketplaceName === "seis-repo"
        && publicBoundaryDecision.publicCountReconciliation?.applicationPluginCount === 74
        && publicBoundaryDecision.publicCountReconciliation?.publicCardCount === 380
        && validationDeliveryEvidence.id === "seis-public-plugin-wave-4-validation-delivery-evidence"
        && validationDeliveryEvidence.status === "completed-repository-local-validation-delivery-evidence"
        && validationDeliveryEvidence.observedDelivery?.remoteReferenceVerified === true
        && validationDeliveryEvidence.observedDelivery?.protectedDefaultBranchWritten === false
        && integrationCheckpoint.id === "seis-public-plugin-wave-4-integration-checkpoint"
        && integrationCheckpoint.status === "completed-repository-local-integration-checkpoint"
        && topologyEvidence.id === "seis-swift-package-topology"
        && topologyEvidence.audit?.ok === true
        && Object.values(publicBoundaryDecision.externalClaims || {}).every((value) => value === false)
        && Object.values(validationDeliveryEvidence.externalClaims || {}).every((value) => value === false)
        && Object.values(integrationCheckpoint.externalClaims || {}).every((value) => value === false),
      continuity: isSupportedContinuityState(continuityCadence)
        && expansionProgram.id === "seis-public-plugin-expansion-program"
        && ["in-progress", "completed"].includes(expansionProgram.nextWaves?.[3]?.status)
        && (expansionProgram.nextWaves?.[3]?.status !== "completed"
          || expansionProgram.nextWaves?.[3]?.completionEvidencePath === "content/development/seis-public-plugin-wave-4-closeout.json")
        && ["planned-gated", "in-progress", "completed"].includes(expansionProgram.nextWaves?.[4]?.status),
      releaseBoundary: lifecycle.status === "active-local-proof-public-release-gated"
        && lifecycle.externalInstallProofSummary?.publicReleaseAllowed === false
        && installState.decision === "not-ready-for-public-release"
        && installState.readiness?.publicReleaseAllowed === false
        && installEvidence.releaseBoundary?.publicReleaseAllowed === false
        && securityReview.publicReleaseAllowed === false,
    },
    handoff: {
      scope: "One bounded, public SEIS Repo static Swift Package topology capability and its already reconciled repository-local evidence chain.",
      evidencePaths: {
        closeoutSequenceDecision: PATHS.closeoutSequenceDecision,
        handoffPreparation: PATHS.handoffPreparation,
        publicBoundaryDecision: PATHS.publicBoundaryDecision,
        validationDeliveryEvidence: PATHS.validationDeliveryEvidence,
        integrationCheckpoint: PATHS.integrationCheckpoint,
        topologyEvidence: PATHS.topologyEvidence,
        continuityCadence: PATHS.continuityCadence,
      },
      delivery: {
        featureBranch: FEATURE_BRANCH,
        priorRemoteReference: PRIOR_REMOTE_REFERENCE,
        priorRemoteReferenceVerified: true,
        currentCheckpointRemoteVerified: false,
        protectedDefaultBranchWritten: false,
        note: "This record is repository-local until this focused checkpoint is committed, pushed to the named feature branch, and its remote reference is independently verified. It is not a merge or public release claim.",
      },
      knownLimits: [
        "No independent clean-runner or public package installation proof is recorded.",
        "No compiled Swift, SwiftPM test, native runtime, live provider, deployment, signing, or public-release proof is recorded.",
        "The terminal handoff has not been published and Wave 4 is not complete.",
        "Wave 5 remains planned-gated without a selected capability or activation approval.",
      ],
      nextDecision: "Step 98 must keep or refine the Wave 5 gate through a separate scope and risk review; it may not activate a new capability automatically.",
    },
    publicBoundary: {
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      publicAudience: "everyone",
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      publicReleaseAllowed: false,
    },
    externalClaims: {
      independentInstallation: false,
      compiledSwift: false,
      swiftPmTestPass: false,
      nativeRuntime: false,
      liveProvider: false,
      deployment: false,
      signing: false,
      publicRelease: false,
    },
    futureWaveDecision: {
      wave: 5,
      status: "planned-gated",
      selectedCapability: null,
      activationApproved: false,
      reason: "This handoff closes only step 97. Wave 5 requires a fresh scope, dependency, risk, rollback, validation, and user-authority decision after Wave 4 closeout evidence is current.",
    },
    validation: [
      "npm run check:seis-public-plugin-wave-4-repository-local-handoff",
      "npm run check:seis-public-plugin-continuity",
      "npm run check:seis-repo-marketplace",
      "node --test plugins/seis-core/test/public-plugin-wave-4-repository-local-handoff.test.mjs",
      "git diff --check",
    ],
    risks: [
      {
        id: "RISK-W4-019",
        status: "tracked",
        description: "A repository-local handoff could be misread as a published terminal handoff, completed Wave 4, or Wave 5 authorization.",
        mitigation: "Keep terminalHandoffPublished=false, waveCompleted=false, and Wave 5 planned-gated with activationApproved=false.",
      },
      {
        id: "RISK-W4-020",
        status: "tracked",
        description: "A prior feature-branch remote verification could be misread as proof for this new checkpoint.",
        mitigation: "Record currentCheckpointRemoteVerified=false until the focused checkpoint is committed, pushed, and independently checked after validation.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this Wave 4 repository-local handoff record and its focused tracker references on the feature branch; no external state, release, publication, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function isPreHandoffWave4Tracker(program) {
  const shared = program?.id === "seis-public-plugin-wave-4-program"
    && ["in-progress", "completed"].includes(program?.status)
    && program?.maturity === "prototype"
    && program?.evidence?.closeoutSequenceDecisionPath === PATHS.closeoutSequenceDecision
    && Object.values(program?.externalClaims || {}).every((value) => value === false);
  const beforeTrackerUpdate = program?.progress?.completedStepCount === 96
    && list(program?.progress?.inProgressStepNumbers).join(",") === "97"
    && program?.progress?.nextStepNumber === 97
    && program?.closeoutSequence?.status === "approved-owner-mapping-applied"
    && program?.closeoutSequence?.completedStep === 96
    && program?.closeoutSequence?.activeStep === 97;
  const afterTrackerUpdate = program?.progress?.completedStepCount === 97
    && list(program?.progress?.inProgressStepNumbers).join(",") === "98"
    && program?.progress?.nextStepNumber === 98
    && program?.repositoryLocalHandoff?.status === "completed-repository-local-handoff"
    && program?.repositoryLocalHandoff?.handoffPath === OUTPUT_PATH;
  const afterFollowingWaveReview = program?.progress?.completedStepCount === 98
    && list(program?.progress?.inProgressStepNumbers).join(",") === "99"
    && program?.progress?.nextStepNumber === 99
    && program?.followingWaveReview?.status === "completed-following-wave-scope-review"
    && program?.followingWaveReview?.reviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json";
  const afterEvidenceRetention = program?.progress?.completedStepCount === 99
    && list(program?.progress?.inProgressStepNumbers).join(",") === "100"
    && program?.progress?.nextStepNumber === 100
    && program?.evidenceRetention?.status === "completed-public-evidence-retention"
    && program?.evidenceRetention?.retentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json";
  const afterCloseout = program?.status === "completed"
    && program?.progress?.completedStepCount === 100
    && list(program?.progress?.inProgressStepNumbers).length === 0
    && program?.progress?.nextStepNumber === null
    && program?.repositoryLocalCloseout?.status === "completed-repository-local-wave-closeout";
  return shared && (beforeTrackerUpdate || afterTrackerUpdate || afterFollowingWaveReview || afterEvidenceRetention || afterCloseout);
}

function isSupportedContinuityState(cadence) {
  const wave = cadence?.waves?.[3];
  const shared = cadence?.id === "seis-public-plugin-continuity-cadence"
    && cadence?.status === "active-evidence-led-cadence";
  const beforeTrackerUpdate = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-closeout-sequence-approved-step-97-in-progress"
    && wave?.completedSteps === 96
    && list(wave?.inProgressSteps).join(",") === "97"
    && wave?.currentEvidencePath === PATHS.closeoutSequenceDecision;
  const afterTrackerUpdate = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-handoff-complete-step-98-in-progress"
    && wave?.completedSteps === 97
    && list(wave?.inProgressSteps).join(",") === "98"
    && wave?.repositoryLocalHandoffPath === OUTPUT_PATH
    && wave?.currentEvidencePath === OUTPUT_PATH;
  const afterFollowingWaveReview = cadence?.cadence?.waveSeries?.activeWaveState === "following-wave-review-complete-step-99-in-progress"
    && wave?.completedSteps === 98
    && list(wave?.inProgressSteps).join(",") === "99"
    && wave?.followingWaveReviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-following-wave-review.json";
  const afterEvidenceRetention = cadence?.cadence?.waveSeries?.activeWaveState === "public-evidence-retention-complete-step-100-in-progress"
    && wave?.completedSteps === 99
    && list(wave?.inProgressSteps).join(",") === "100"
    && wave?.evidenceRetentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-evidence-retention.json";
  const afterCloseout = cadence?.cadence?.waveSeries?.activeWave === null
    && cadence?.cadence?.waveSeries?.activeWaveState === "wave-4-completed-wave-5-planned-gated"
    && wave?.status === "completed"
    && wave?.completedSteps === 100
    && list(wave?.inProgressSteps).length === 0
    && wave?.closeoutPath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-closeout.json";
  const activeWave5 = cadence?.cadence?.waveSeries?.activeWave === 5
    && cadence?.cadence?.waveSeries?.activeWaveState === "wave-5-first-40-steps-completed-step-41-in-progress"
    && wave?.status === "completed"
    && wave?.completedSteps === 100
    && list(wave?.inProgressSteps).length === 0
    && cadence?.waves?.[4]?.status === "in-progress"
    && cadence?.waves?.[4]?.selectedCapability === "seis-plugin-capability-coverage"
    && cadence?.waves?.[4]?.completedSteps === 40
    && list(cadence?.waves?.[4]?.inProgressSteps).join(",") === "41";
  return shared && (beforeTrackerUpdate || afterTrackerUpdate || afterFollowingWaveReview || afterEvidenceRetention || afterCloseout || activeWave5);
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-repository-local-handoff" && record.goalId === "SEIS-GOAL-021" && record.parentGoalId === "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE" && record.wave === 4 && record.round === 5 && record.step === 97 && record.status === "completed-repository-local-handoff" && record.maturity === "prototype", "handoff identity is invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 96 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 97 && record.stateAtCheckpoint?.nextPlannedDecisionStep === 98 && record.stateAtCheckpoint?.terminalHandoffPublished === false && record.stateAtCheckpoint?.waveCompleted === false && record.stateAtCheckpoint?.wave5ActivationApproved === false, "handoff state is invalid");
  assert(Object.values(record.checks || {}).every(Boolean), "a required Wave 4 handoff check is not current");
  assert(record.handoff?.delivery?.featureBranch === FEATURE_BRANCH && record.handoff?.delivery?.priorRemoteReference === PRIOR_REMOTE_REFERENCE && record.handoff?.delivery?.priorRemoteReferenceVerified === true && record.handoff?.delivery?.currentCheckpointRemoteVerified === false && record.handoff?.delivery?.protectedDefaultBranchWritten === false, "handoff delivery boundary is invalid");
  assert(list(record.handoff?.knownLimits).length === 4, "handoff limits are incomplete");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(record.futureWaveDecision?.wave === 5 && record.futureWaveDecision?.status === "planned-gated" && record.futureWaveDecision?.selectedCapability === null && record.futureWaveDecision?.activationApproved === false, "future-wave gate is invalid");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "handoff inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "handoff record must not contain a machine-specific path");
}

function scanPublicSafeInputs(paths) {
  const findings = [];
  for (const relativePath of paths) {
    const source = readText(relativePath);
    if (MACHINE_PATH_PATTERN.test(source)) findings.push({ path: relativePath, category: "machine-specific-path" });
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(source)) findings.push({ path: relativePath, category: pattern.id });
    }
  }
  return {
    inputCount: paths.length,
    machineSpecificPathFindingCount: findings.filter((finding) => finding.category === "machine-specific-path").length,
    secretLikeFindingCount: findings.filter((finding) => finding.category !== "machine-specific-path").length,
    findings,
    rawValuesStored: false,
  };
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 4 repository-local handoff: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 repository-local handoff: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
