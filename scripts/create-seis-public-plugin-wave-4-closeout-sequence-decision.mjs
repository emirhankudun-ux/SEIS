#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json";
const REMAINING_STEPS = [97, 98, 99, 100];
const PATHS = Object.freeze({
  handoffPreparation: "content/development/seis-public-plugin-wave-4-handoff-preparation.json",
  wave4Program: "content/development/seis-public-plugin-wave-4-program.json",
  publicBoundaryDecision: "content/development/seis-public-plugin-wave-4-public-boundary-decision.json",
  expansionProgram: "content/development/seis-public-plugin-expansion-program.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;
const SECRET_PATTERNS = [
  { id: "openai-like-api-key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "private-key-header", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-closeout-sequence-decision");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 closeout-sequence decision check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " as an accepted non-terminal Wave 4 closeout-sequence decision.");
}

function buildRecord() {
  const handoffPreparation = readJson(PATHS.handoffPreparation);
  const wave4Program = readJson(PATHS.wave4Program);
  const publicBoundaryDecision = readJson(PATHS.publicBoundaryDecision);
  const expansionProgram = readJson(PATHS.expansionProgram);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const historicalWave4DirectCardSnapshot = { ...handoffPreparation.historicalWave4DirectCardSnapshot };
  const currentMarketplaceProjection = currentProjectionForRecord(handoffPreparation.currentMarketplaceProjection);
  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-4-closeout-sequence-decision",
    goalId: "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE",
    parentGoalId: "SEIS-GOAL-021",
    wave: 4,
    round: 5,
    status: "approved-current-user-continuation-authority",
    maturity: "specification",
    generatedAt: "2026-07-21",
    purpose: "Apply the user's active continuation objective to the non-circular Wave 4 closeout order. This records only the completed sequence-decision step and the next repository-local handoff-preparation step; it does not create a terminal handoff, complete Wave 4, activate Wave 5, merge, publish, sign, install, deploy, or claim independent external proof.",
    stateAtDecision: {
      completedStepCount: 95,
      activeStep: 96,
      plannedStepNumbers: REMAINING_STEPS,
      terminalHandoffPublished: false,
      waveCompleted: false,
      wave5ActivationApproved: false,
    },
    stateAfterApplication: {
      completedStepCount: 96,
      activeStep: 97,
      plannedStepNumbers: [98, 99, 100],
      terminalHandoffPublished: false,
      waveCompleted: false,
      wave5ActivationApproved: false,
    },
    historicalWave4DirectCardSnapshot,
    currentMarketplaceProjection,
    currentEvidence: {
      handoffPreparation: isSupportedHandoffPreparation(handoffPreparation),
      wave4Program: isSupportedWave4Program(wave4Program),
      publicBoundaryDecision: isSupportedPublicBoundaryDecision(publicBoundaryDecision),
      expansionProgram: isSupportedExpansionProgram(expansionProgram),
      continuityCadence: isSupportedContinuityCadence(continuityCadence),
    },
    decisionBoundary: {
      status: "approved-owner-mapping-applied",
      approvalRequired: true,
      approvalSource: "active-thread-user-continuation-objective",
      approved: true,
      appliedToCanonicalProgram: true,
      automaticStepStatusChangesAllowed: false,
      terminalHandoffPublished: false,
      waveCompleted: false,
      wave5ActivationApproved: false,
    },
    cycleAnalysis: {
      detected: true,
      summary: "Step 96 requires current evidence for all one hundred planned steps, while the following closeout actions are intended to create or classify evidence needed for terminal handoff and completion. Without an explicit ordering decision, automatically changing any remaining step would make a circular or inferred completion claim.",
      affectedSteps: [96, ...REMAINING_STEPS],
      safeguards: [
        "Record step 96 as complete only because the active user continuation objective approved this explicit canonical mapping; keep step 97 active and steps 98 through 100 planned.",
        "Do not interpret a feature-branch push, local validation, or this proposal as a terminal handoff, merge, release, signing, installation, deployment, or independent external proof.",
        "Keep Wave 5 planned-gated until a separate scope and risk review is approved after any valid Wave 4 closeout.",
      ],
    },
    proposedResolution: {
      status: "approved-applied",
      ownerDecisionRequired: false,
      noStepStatusChanges: false,
      manualCanonicalStatusChangeApplied: true,
      sequence: [
        {
          order: 1,
          action: "Record the user-authorized non-circular closeout sequence.",
          canonicalStep: 96,
          effect: "Step 96 is complete as an explicit sequence decision only; it is not a terminal handoff, Wave 4 completion, Wave 5 activation, release, or external-proof claim.",
        },
        {
          order: 2,
          action: "Prepare repository-local terminal-handoff evidence.",
          canonicalStep: 97,
          effect: "Step 97 is active and must keep repository-local, external-proof, release, and Wave 5 boundaries distinct.",
        },
        {
          order: 3,
          action: "Keep the following-wave gate, retained evidence, and final report as separate closeout actions.",
          canonicalStep: 98,
          effect: "Steps 98 through 100 remain planned and require their own current evidence before any later transition.",
        },
      ],
    },
    ownerOptions: [
      {
        id: "accept-non-circular-mapping",
        status: "selected-by-active-user-continuation-objective",
        effect: "Apply one focused canonical-program change that records the explicit non-circular evidence order before any terminal closeout action.",
      },
      {
        id: "retain-current-order",
        status: "not-selected",
        effect: "Keep Wave 4 at step 96 and require separately specified evidence or approval that satisfies the existing all-one-hundred-steps prerequisite without inference.",
      },
      {
        id: "pause-or-cancel-wave-4-closeout",
        status: "not-selected",
        effect: "Stop the closeout sequence without claiming completion; retain the public repository-local evidence and rollback boundary.",
      },
    ],
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
    risks: [
      {
        id: "RISK-W4-017",
        status: "tracked",
        description: "The accepted mapping could be misread as authorization to mark the remaining closeout steps complete automatically.",
        mitigation: "Keep automaticStepStatusChangesAllowed=false, preserve step 97 as active, preserve steps 98 through 100 as planned, and require current evidence for each later transition.",
      },
      {
        id: "RISK-W4-018",
        status: "tracked",
        description: "A repository-local evidence record could be confused with public release, independent installation, runtime, merge, or protected-branch policy proof.",
        mitigation: "Keep every external claim false and preserve the existing feature-branch-only, public-release-gated boundary.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this accepted closeout-sequence decision and its focused canonical mapping on the feature branch. No terminal handoff, external state, release, publication, data migration, or automatic later step-status transition exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function isSupportedHandoffPreparation(record) {
  const shared = record?.id === "seis-public-plugin-wave-4-handoff-preparation"
    && record?.step === 96
    && record?.stateAtPreparation?.completedStepCount === 95
    && record?.stateAtPreparation?.activeStep === 96
    && list(record?.stateAtPreparation?.remainingStepNumbers).join(",") === REMAINING_STEPS.join(",")
    && record?.handoffGate?.ready === false
    && record?.handoffGate?.terminalHandoffPublished === false
    && record?.handoffGate?.waveCompleted === false
    && record?.handoffGate?.wave5ActivationApproved === false
    && record?.recommendedFollowUp?.goalId === "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE"
    && record?.recommendedFollowUp?.decisionPath === OUTPUT_PATH
    && hasHistoricalWave4DirectCardSnapshot(record)
    && isCurrentMarketplaceProjection(record?.currentMarketplaceProjection)
    && Object.values(record?.externalClaims || {}).every((value) => value === false);
  const preApplication = record?.status === "in-progress-repository-local-handoff-preparation"
    && record?.recommendedFollowUp?.status === "created-proposed-owner-decision-required";
  const postApplication = record?.status === "completed-repository-local-handoff-preparation"
    && record?.completionState?.completedStep === 96
    && record?.completionState?.nextActiveStep === 97
    && record?.recommendedFollowUp?.status === "accepted-applied-to-canonical-program"
    && record?.recommendedFollowUp?.approvalSource === "active-thread-user-continuation-objective";
  return shared && (preApplication || postApplication);
}

function isSupportedWave4Program(record) {
  const shared = record?.id === "seis-public-plugin-wave-4-program"
    && ["in-progress", "completed"].includes(record?.status)
    && record?.evidence?.handoffPreparationPath === PATHS.handoffPreparation
    && record?.evidence?.closeoutSequenceDecisionPath === OUTPUT_PATH
    && Object.values(record?.externalClaims || {}).every((value) => value === false);
  const preApplication = record?.progress?.completedStepCount === 95
    && list(record?.progress?.inProgressStepNumbers).join(",") === "96"
    && record?.progress?.plannedStepCount === 4;
  const postApplication = record?.progress?.completedStepCount === 96
    && list(record?.progress?.inProgressStepNumbers).join(",") === "97"
    && record?.progress?.plannedStepCount === 3
    && record?.closeoutSequence?.status === "approved-owner-mapping-applied";
  const afterHandoff = record?.progress?.completedStepCount === 97
    && list(record?.progress?.inProgressStepNumbers).join(",") === "98"
    && record?.progress?.plannedStepCount === 2
    && record?.repositoryLocalHandoff?.status === "completed-repository-local-handoff";
  const afterFollowingWaveReview = record?.progress?.completedStepCount === 98
    && list(record?.progress?.inProgressStepNumbers).join(",") === "99"
    && record?.progress?.plannedStepCount === 1
    && record?.followingWaveReview?.status === "completed-following-wave-scope-review";
  const afterEvidenceRetention = record?.progress?.completedStepCount === 99
    && list(record?.progress?.inProgressStepNumbers).join(",") === "100"
    && record?.progress?.plannedStepCount === 0
    && record?.evidenceRetention?.status === "completed-public-evidence-retention";
  const afterCloseout = record?.status === "completed"
    && record?.progress?.completedStepCount === 100
    && list(record?.progress?.inProgressStepNumbers).length === 0
    && record?.progress?.nextStepNumber === null
    && record?.evidence?.closeoutPath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && record?.repositoryLocalCloseout?.status === "completed-repository-local-wave-closeout";
  return shared && (preApplication || postApplication || afterHandoff || afterFollowingWaveReview || afterEvidenceRetention || afterCloseout);
}

function isSupportedPublicBoundaryDecision(record) {
  return record?.id === "seis-public-plugin-wave-4-public-boundary-decision"
    && record?.status === "completed-repository-local-public-boundary-decision"
    && list(record?.completedSteps).join(",") === "91,92,93,94,95"
    && record?.historicalWave4Distribution?.classification === "immutable-wave-4-public-boundary-direct-card-snapshot"
    && record?.historicalWave4Distribution?.projectionModel === "direct-source-package-marketplace-cards"
    && record?.historicalWave4Distribution?.applicationPluginCount === 74
    && record?.historicalWave4Distribution?.publicCardCount === 380
    && record?.historicalWave4Distribution?.topologyCardCount === 1
    && record?.historicalWave4Distribution?.selectedCapabilityHadDirectMarketplaceCard === true
    && isCurrentMarketplaceProjection(record?.currentMarketplaceProjection)
    && record?.externalProofAndApprovals?.publicReleaseAllowed === false
    && Object.values(record?.externalClaims || {}).every((value) => value === false);
}

function isSupportedExpansionProgram(record) {
  const wave4 = list(record?.nextWaves)[3];
  const shared = record?.id === "seis-public-plugin-expansion-program"
    && ["in-progress", "completed"].includes(wave4?.status)
    && wave4?.programPath === PATHS.wave4Program
    && wave4?.handoffPreparationPath === PATHS.handoffPreparation
    && wave4?.closeoutSequenceDecisionPath === OUTPUT_PATH
    && ["planned-gated", "in-progress", "completed"].includes(list(record?.nextWaves)[4]?.status);
  const afterCloseout = wave4?.status === "completed"
    && wave4?.completionEvidencePath === "content/development/seis-public-plugin-wave-4-closeout.json";
  return shared && (wave4?.status === "in-progress" || afterCloseout);
}

function isSupportedContinuityCadence(record) {
  const wave4 = list(record?.waves)[3];
  const shared = record?.id === "seis-public-plugin-continuity-cadence"
    && record?.status === "active-evidence-led-cadence"
    && wave4?.handoffPreparationPath === PATHS.handoffPreparation
    && wave4?.closeoutSequenceDecisionPath === OUTPUT_PATH
    && ["planned-gated", "in-progress", "completed"].includes(list(record?.waves)[4]?.status);
  const preApplication = record?.cadence?.waveSeries?.activeWave === 4
    && wave4?.status === "in-progress"
    && wave4?.completedSteps === 95
    && list(wave4?.inProgressSteps).join(",") === "96";
  const postApplication = record?.cadence?.waveSeries?.activeWave === 4
    && wave4?.status === "in-progress"
    && wave4?.completedSteps === 96
    && list(wave4?.inProgressSteps).join(",") === "97"
    && wave4?.currentEvidencePath === OUTPUT_PATH;
  const afterHandoff = record?.cadence?.waveSeries?.activeWave === 4
    && wave4?.status === "in-progress"
    && wave4?.completedSteps === 97
    && list(wave4?.inProgressSteps).join(",") === "98"
    && wave4?.repositoryLocalHandoffPath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json"
    && wave4?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json";
  const afterFollowingWaveReview = record?.cadence?.waveSeries?.activeWave === 4
    && wave4?.status === "in-progress"
    && wave4?.completedSteps === 98
    && list(wave4?.inProgressSteps).join(",") === "99"
    && wave4?.followingWaveReviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json"
    && wave4?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-following-wave-review.json";
  const afterEvidenceRetention = record?.cadence?.waveSeries?.activeWave === 4
    && wave4?.status === "in-progress"
    && wave4?.completedSteps === 99
    && list(wave4?.inProgressSteps).join(",") === "100"
    && wave4?.evidenceRetentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json"
    && wave4?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-evidence-retention.json";
  const afterCloseout = record?.cadence?.waveSeries?.activeWave === null
    && record?.cadence?.waveSeries?.activeWaveState === "wave-4-completed-wave-5-planned-gated"
    && wave4?.status === "completed"
    && wave4?.completedSteps === 100
    && list(wave4?.inProgressSteps).length === 0
    && wave4?.closeoutPath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && wave4?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-closeout.json";
  const activeWave5 = record?.cadence?.waveSeries?.activeWave === 5
    && ["wave-5-first-60-steps-completed-step-61-in-progress", "wave-5-first-80-steps-completed-step-81-in-progress"].includes(record?.cadence?.waveSeries?.activeWaveState)
    && wave4?.status === "completed"
    && wave4?.completedSteps === 100
    && list(wave4?.inProgressSteps).length === 0
    && list(record?.waves)[4]?.status === "in-progress"
    && list(record?.waves)[4]?.selectedCapability === "seis-plugin-capability-coverage"
    && [[60, "61"], [80, "81"]].some(([completedSteps, activeStep]) => list(record?.waves)[4]?.completedSteps === completedSteps
      && list(list(record?.waves)[4]?.inProgressSteps).join(",") === activeStep);
  return shared && (preApplication || postApplication || afterHandoff || afterFollowingWaveReview || afterEvidenceRetention || afterCloseout || activeWave5);
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-closeout-sequence-decision" && record.goalId === "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE" && record.parentGoalId === "SEIS-GOAL-021" && record.wave === 4 && record.round === 5 && record.status === "approved-current-user-continuation-authority" && record.maturity === "specification", "closeout-sequence identity is invalid");
  assert(record.stateAtDecision?.completedStepCount === 95 && record.stateAtDecision?.activeStep === 96 && list(record.stateAtDecision?.plannedStepNumbers).join(",") === REMAINING_STEPS.join(",") && record.stateAtDecision?.terminalHandoffPublished === false && record.stateAtDecision?.waveCompleted === false && record.stateAtDecision?.wave5ActivationApproved === false, "closeout-sequence state is invalid");
  assert(record.stateAfterApplication?.completedStepCount === 96 && record.stateAfterApplication?.activeStep === 97 && list(record.stateAfterApplication?.plannedStepNumbers).join(",") === "98,99,100" && record.stateAfterApplication?.terminalHandoffPublished === false && record.stateAfterApplication?.waveCompleted === false && record.stateAfterApplication?.wave5ActivationApproved === false, "closeout-sequence applied state is invalid");
  assert(hasHistoricalWave4DirectCardSnapshot(record), "historical Wave 4 direct-card snapshot is invalid");
  assert(isCurrentMarketplaceProjection(record.currentMarketplaceProjection), "current curated marketplace projection is invalid");
  assert(Object.values(record.currentEvidence || {}).every(Boolean), "a required closeout-sequence evidence input is not current");
  assert(record.decisionBoundary?.status === "approved-owner-mapping-applied" && record.decisionBoundary?.approvalRequired === true && record.decisionBoundary?.approvalSource === "active-thread-user-continuation-objective" && record.decisionBoundary?.approved === true && record.decisionBoundary?.appliedToCanonicalProgram === true && record.decisionBoundary?.automaticStepStatusChangesAllowed === false && record.decisionBoundary?.terminalHandoffPublished === false && record.decisionBoundary?.waveCompleted === false && record.decisionBoundary?.wave5ActivationApproved === false, "closeout-sequence decision boundary is invalid");
  assert(record.cycleAnalysis?.detected === true && list(record.cycleAnalysis?.affectedSteps).join(",") === [96, ...REMAINING_STEPS].join(",") && list(record.cycleAnalysis?.safeguards).length === 3, "closeout-sequence cycle analysis is invalid");
  assert(record.proposedResolution?.status === "approved-applied" && record.proposedResolution?.ownerDecisionRequired === false && record.proposedResolution?.noStepStatusChanges === false && record.proposedResolution?.manualCanonicalStatusChangeApplied === true && list(record.proposedResolution?.sequence).length === 3 && list(record.ownerOptions).length === 3 && record.ownerOptions?.[0]?.status === "selected-by-active-user-continuation-objective" && list(record.ownerOptions).slice(1).every((option) => option?.status === "not-selected"), "closeout-sequence proposal is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "closeout-sequence public boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "closeout-sequence external claims must remain false");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "closeout-sequence risks or rollback are invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "closeout-sequence inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "closeout-sequence record must not contain a machine-specific path");
}

function currentProjectionForRecord(projection) {
  return {
    observedAt: projection?.observedAt || null,
    projectionModel: "curated-bundle-cards",
    distributionMode: "curated-bounded-public-bundles",
    marketplaceName: projection?.marketplaceName,
    marketplaceDisplayName: projection?.marketplaceDisplayName,
    publicCardCount: projection?.publicCardCount,
    canonicalCardCount: projection?.canonicalCardCount,
    bundleCardCount: projection?.bundleCardCount,
    applicationBundleCardCount: projection?.applicationBundleCardCount,
    topicBundleCardCount: projection?.topicBundleCardCount,
    sourceCapabilityInventory: { ...projection?.sourceCapabilityInventory },
    directSourceCapabilityCardCount: 0,
  };
}

function hasHistoricalWave4DirectCardSnapshot(record) {
  const snapshot = record?.historicalWave4DirectCardSnapshot;
  return snapshot?.projectionModel === "direct-source-cards"
    && snapshot?.marketplaceName === "seis-repo"
    && snapshot?.marketplaceDisplayName === "SEIS Repo"
    && snapshot?.applicationSourcePackageCount === 74
    && snapshot?.topicSourcePackageCount === 300
    && snapshot?.rootSourceModuleCount === 5
    && snapshot?.retainedSourceCapabilityCount === 379
    && snapshot?.publicCardCount === 380
    && snapshot?.current === false
    && snapshot?.immutableHistoricalEvidence === true;
}

function isCurrentMarketplaceProjection(projection) {
  const selected = projection?.selectedApplicationCapability;
  const directBoundary = projection?.directSourceCapabilityCardCount === 0
    || (selected?.id === "seis-swift-package-topology"
      && selected?.retainedSource === true
      && selected?.directMarketplaceCardRequired === false
      && selected?.directMarketplaceCardCount === 0
      && selected?.bundleCardCount === 1
      && selected?.bundleId === "seis-application-bundle-06");
  return projection?.projectionModel === "curated-bundle-cards"
    && projection?.distributionMode === "curated-bounded-public-bundles"
    && projection?.marketplaceName === "seis-repo"
    && projection?.marketplaceDisplayName === "SEIS Repo"
    && projection?.publicCardCount === 34
    && projection?.canonicalCardCount === 1
    && projection?.bundleCardCount === 33
    && projection?.applicationBundleCardCount === 6
    && projection?.topicBundleCardCount === 27
    && projection?.sourceCapabilityInventory?.rootSourceModuleCount === 5
    && projection?.sourceCapabilityInventory?.applicationSourcePackageCount === 75
    && projection?.sourceCapabilityInventory?.topicSourcePackageCount === 300
    && projection?.sourceCapabilityInventory?.retainedSourcePackageCount === 380
    && projection?.sourceCapabilityInventory?.sourcePackagesDeleted === false
    && directBoundary;
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
  if (!condition) throw new Error("SEIS public plugin Wave 4 closeout sequence: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 closeout sequence: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
