#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { buildWave1MarketplaceCompatibility } from "./lib/seis-wave-1-marketplace-compatibility.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-handoff-preparation.json";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const PREPARATION_BASELINE_COMMIT = "924f26541cacc76a7bcb9c76b1d4ec61c4bbb570";
const REMAINING_STEPS = range(97, 100);
const CLOSEOUT_SEQUENCE_DECISION_PATH = "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json";
const PATHS = Object.freeze({
  wave4Program: "content/development/seis-public-plugin-wave-4-program.json",
  publicBoundaryDecision: "content/development/seis-public-plugin-wave-4-public-boundary-decision.json",
  validationDeliveryEvidence: "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json",
  integrationCheckpoint: "content/development/seis-public-plugin-wave-4-integration-checkpoint.json",
  topologyEvidence: "content/development/seis-swift-package-topology.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  expansionProgram: "content/development/seis-public-plugin-expansion-program.json",
  marketplace: ".agents/plugins/marketplace.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  installState: "content/development/seis-public-install-state.json",
  installEvidence: "content/development/seis-public-install-evidence.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  publicFamily: "content/development/seis-public-plugin-family.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
});
const HISTORICAL_WAVE_4_DIRECT_CARD_SNAPSHOT = Object.freeze({
  observedAt: "2026-07-21",
  projectionModel: "direct-source-cards",
  marketplaceName: "seis-repo",
  marketplaceDisplayName: "SEIS Repo",
  applicationSourcePackageCount: 74,
  topicSourcePackageCount: 300,
  rootSourceModuleCount: 5,
  retainedSourceCapabilityCount: 379,
  publicCardCount: 380,
  current: false,
  immutableHistoricalEvidence: true,
  evidencePath: "content/development/seis-public-plugin-wave-4-integration-checkpoint.json",
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-handoff-preparation");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 handoff-preparation check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " as a completed non-terminal Wave 4 handoff-preparation checkpoint.");
}

function buildRecord() {
  const wave4Program = readJson(PATHS.wave4Program);
  const publicBoundaryDecision = readJson(PATHS.publicBoundaryDecision);
  const validationDeliveryEvidence = readJson(PATHS.validationDeliveryEvidence);
  const integrationCheckpoint = readJson(PATHS.integrationCheckpoint);
  const topologyEvidence = readJson(PATHS.topologyEvidence);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const expansionProgram = readJson(PATHS.expansionProgram);
  const marketplace = readJson(PATHS.marketplace);
  const lifecycle = readJson(PATHS.lifecycle);
  const installState = readJson(PATHS.installState);
  const installEvidence = readJson(PATHS.installEvidence);
  const securityReview = readJson(PATHS.securityReview);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const publicFamily = readJson(PATHS.publicFamily);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const compatibility = buildWave1MarketplaceCompatibility({ marketplace, publicFamily, sourceManifest, bundleCatalog });
  const currentMarketplaceProjection = currentProjectionForRecord(compatibility.currentMarketplaceProjection);
  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-4-handoff-preparation",
    goalId: "SEIS-GOAL-021",
    wave: 4,
    round: 5,
    step: 96,
    status: "completed-repository-local-handoff-preparation",
    maturity: "prototype",
    generatedAt: "2026-07-21",
    purpose: "Record completed non-terminal Wave 4 handoff preparation after the user's active continuation objective approved the non-circular closeout sequence. This advances only step 96 and leaves step 97 active; it does not create a terminal handoff, complete Wave 4, activate Wave 5, merge, publish, sign, install, deploy, or claim independent external proof.",
    stateAtPreparation: {
      completedStepCount: 95,
      activeStep: 96,
      remainingStepNumbers: REMAINING_STEPS,
      completedRoundCount: 4,
      terminalHandoffPublished: false,
      waveCompleted: false,
      wave5ActivationApproved: false,
    },
    completionState: {
      completedStep: 96,
      nextActiveStep: 97,
      terminalHandoffPublished: false,
      waveCompleted: false,
      wave5ActivationApproved: false,
    },
    historicalWave4DirectCardSnapshot: { ...HISTORICAL_WAVE_4_DIRECT_CARD_SNAPSHOT },
    currentMarketplaceProjection,
    completedEvidence: {
      wave4Tracker: isSupportedWave4Tracker(wave4Program),
      publicBoundaryDecision: publicBoundaryDecision.id === "seis-public-plugin-wave-4-public-boundary-decision"
        && publicBoundaryDecision.status === "completed-repository-local-public-boundary-decision"
        && list(publicBoundaryDecision.completedSteps).join(",") === range(91, 95).join(",")
        && publicBoundaryDecision.remotePolicyObservations?.validationDeliveryCommit === "6f94f08612839984fc841ac56f01e224010456c3"
        && publicBoundaryDecision.remotePolicyObservations?.remoteReferenceVerified === true
        && publicBoundaryDecision.remotePolicyObservations?.protectedDefaultBranchWritten === false
        && isHistoricalWave4PublicBoundaryDistribution(publicBoundaryDecision.historicalWave4Distribution)
        && isCurrentMarketplaceProjection(publicBoundaryDecision.currentMarketplaceProjection)
        && Object.values(publicBoundaryDecision.externalClaims || {}).every((value) => value === false),
      validationDeliveryEvidence: validationDeliveryEvidence.id === "seis-public-plugin-wave-4-validation-delivery-evidence"
        && validationDeliveryEvidence.status === "completed-repository-local-validation-delivery-evidence"
        && list(validationDeliveryEvidence.completedSteps).join(",") === range(81, 90).join(",")
        && validationDeliveryEvidence.observedDelivery?.sourceIntegrationCommit === "e3cc34d6138c0e47fa582c5fa09e3c92c04a005e"
        && validationDeliveryEvidence.observedDelivery?.remoteReferenceVerified === true
        && isCurrentMarketplaceProjection(validationDeliveryEvidence.currentMarketplaceProjection)
        && Object.values(validationDeliveryEvidence.externalClaims || {}).every((value) => value === false),
      historicalIntegrationCheckpoint: integrationCheckpoint.id === "seis-public-plugin-wave-4-integration-checkpoint"
        && integrationCheckpoint.status === "completed-repository-local-integration-checkpoint"
        && list(integrationCheckpoint.completedSteps).join(",") === range(74, 80).join(",")
        && isHistoricalWave4IntegrationDistribution(integrationCheckpoint.historicalWave4Distribution)
        && isCurrentMarketplaceProjection(integrationCheckpoint.currentMarketplaceProjection)
        && integrationCheckpoint.topologyEvidence?.auditOk === true
        && Object.values(integrationCheckpoint.externalClaims || {}).every((value) => value === false),
      topologyEvidence: topologyEvidence.id === "seis-swift-package-topology"
        && topologyEvidence.audit?.ok === true
        && topologyEvidence.safety?.compilesSwift === false
        && topologyEvidence.safety?.runsSwiftTests === false
        && topologyEvidence.safety?.publicReleaseAllowed === false,
      currentPublicProjection: isCurrentMarketplaceProjection(currentMarketplaceProjection),
      continuity: isSupportedContinuity(continuityCadence)
        && expansionProgram.id === "seis-public-plugin-expansion-program"
        && ["in-progress", "completed"].includes(expansionProgram.nextWaves?.[3]?.status)
        && (expansionProgram.nextWaves?.[3]?.status !== "completed"
          || expansionProgram.nextWaves?.[3]?.completionEvidencePath === "content/development/seis-public-plugin-wave-4-closeout.json")
        && expansionProgram.nextWaves?.[3]?.selectedCapability === "seis-swift-package-topology",
      releaseBoundary: lifecycle.status === "active-local-proof-public-release-gated"
        && lifecycle.externalInstallProofSummary?.publicReleaseAllowed === false
        && installState.decision === "not-ready-for-public-release"
        && installState.readiness?.publicReleaseAllowed === false
        && installEvidence.releaseBoundary?.publicReleaseAllowed === false
        && securityReview.publicReleaseAllowed === false,
    },
    handoffGate: {
      status: "sequence-approved-not-ready-for-terminal-handoff",
      ready: false,
      allOneHundredStepsHaveCurrentEvidence: false,
      preparationCompleted: true,
      currentStepRemainsInProgress: false,
      nextActiveStep: 97,
      remainingStepNumbers: REMAINING_STEPS,
      terminalHandoffPublished: false,
      waveCompleted: false,
      wave5ActivationApproved: false,
      reason: "The user-authorized closeout sequence completed step 96 only. Step 97 is active and steps 98 through 100 remain planned; this record does not infer their evidence or completion.",
    },
    remoteDeliveryBaseline: {
      featureBranch: FEATURE_BRANCH,
      precedingCommit: PREPARATION_BASELINE_COMMIT,
      remote: "origin",
      remoteReference: "refs/heads/plugins/seis-plugin-root-20260715",
      remoteReferenceVerified: true,
      protectedDefaultBranchWritten: false,
      interpretation: "The preceding checkpoint was verified on the named feature branch only. This preparation does not claim a merge, protected-branch write, code-scanning result, signature compliance, or release.",
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
    requiredBeforeTerminalHandoff: [
      "Current repository-local evidence for active step 97 without marking a future step complete in advance.",
      "Required repository-local quality gates for the terminal closeout state.",
      "An explicit terminal handoff record that preserves public-release, installation, runtime, and external-proof limits.",
      "A separate scope and risk decision before any Wave 5 activation.",
    ],
    recommendedFollowUp: {
      goalId: "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE",
      status: "accepted-applied-to-canonical-program",
      decisionPath: CLOSEOUT_SEQUENCE_DECISION_PATH,
      approvalSource: "active-thread-user-continuation-objective",
      purpose: "Prepare step 97 repository-local terminal-handoff evidence while retaining the later closeout, release, and Wave 5 gates.",
    },
    risks: [
      {
        id: "RISK-W4-015",
        status: "tracked",
        description: "A readiness gate could be misread as a terminal Wave 4 handoff or completion.",
        mitigation: "Keep ready=false, preserve step 97 as active, retain steps 98 through 100 as planned, and record terminalHandoffPublished=false and waveCompleted=false.",
      },
      {
        id: "RISK-W4-016",
        status: "tracked",
        description: "The closeout task sequence can encourage circular completion claims.",
        mitigation: "Preserve the explicit accepted sequence decision and require current evidence for every remaining step before any later transition.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this completed handoff-preparation checkpoint and its focused tracker references on the feature branch; no external state, release, publication, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function isSupportedWave4Tracker(program) {
  const shared = program?.id === "seis-public-plugin-wave-4-program"
    && ["in-progress", "completed"].includes(program?.status)
    && program?.maturity === "prototype"
    && program?.scope?.selectedCapability === "seis-swift-package-topology"
    && program?.evidence?.publicBoundaryDecisionPath === PATHS.publicBoundaryDecision
    && (!program?.evidence?.handoffPreparationPath || program.evidence.handoffPreparationPath === OUTPUT_PATH);
  const beforeSequenceApplication = program?.progress?.completedStepCount === 95
    && list(program?.progress?.inProgressStepNumbers).join(",") === "96"
    && program?.progress?.nextStepNumber === 96;
  const afterSequenceApplication = program?.progress?.completedStepCount === 96
    && list(program?.progress?.inProgressStepNumbers).join(",") === "97"
    && program?.progress?.nextStepNumber === 97
    && program?.closeoutSequence?.status === "approved-owner-mapping-applied";
  const afterRepositoryLocalHandoff = program?.progress?.completedStepCount === 97
    && list(program?.progress?.inProgressStepNumbers).join(",") === "98"
    && program?.progress?.nextStepNumber === 98
    && program?.repositoryLocalHandoff?.status === "completed-repository-local-handoff";
  const afterFollowingWaveReview = program?.progress?.completedStepCount === 98
    && list(program?.progress?.inProgressStepNumbers).join(",") === "99"
    && program?.progress?.nextStepNumber === 99
    && program?.followingWaveReview?.status === "completed-following-wave-scope-review";
  const afterEvidenceRetention = program?.progress?.completedStepCount === 99
    && list(program?.progress?.inProgressStepNumbers).join(",") === "100"
    && program?.progress?.nextStepNumber === 100
    && program?.evidenceRetention?.status === "completed-public-evidence-retention";
  const afterCloseout = program?.status === "completed"
    && program?.progress?.completedStepCount === 100
    && list(program?.progress?.inProgressStepNumbers).length === 0
    && program?.progress?.nextStepNumber === null
    && program?.repositoryLocalCloseout?.status === "completed-repository-local-wave-closeout";
  return shared && (beforeSequenceApplication || afterSequenceApplication || afterRepositoryLocalHandoff || afterFollowingWaveReview || afterEvidenceRetention || afterCloseout);
}

function isSupportedContinuity(cadence) {
  const wave = cadence?.waves?.[3];
  const shared = cadence?.id === "seis-public-plugin-continuity-cadence"
    && cadence?.status === "active-evidence-led-cadence"
    && wave?.publicBoundaryDecisionPath === PATHS.publicBoundaryDecision
    && (!wave?.handoffPreparationPath || wave.handoffPreparationPath === OUTPUT_PATH);
  const beforeSequenceApplication = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-public-boundary-decision-complete-step-96-in-progress"
    && wave?.completedSteps === 95
    && list(wave?.inProgressSteps).join(",") === "96"
    && wave?.currentEvidencePath === PATHS.publicBoundaryDecision;
  const afterSequenceApplication = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-closeout-sequence-approved-step-97-in-progress"
    && wave?.completedSteps === 96
    && list(wave?.inProgressSteps).join(",") === "97"
    && wave?.currentEvidencePath === CLOSEOUT_SEQUENCE_DECISION_PATH;
  const afterRepositoryLocalHandoff = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-handoff-complete-step-98-in-progress"
    && wave?.completedSteps === 97
    && list(wave?.inProgressSteps).join(",") === "98"
    && wave?.repositoryLocalHandoffPath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json";
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
    && [
      "wave-5-first-60-steps-completed-step-61-in-progress",
      "wave-5-first-80-steps-completed-step-81-in-progress",
    ].includes(cadence?.cadence?.waveSeries?.activeWaveState)
    && wave?.status === "completed"
    && wave?.completedSteps === 100
    && list(wave?.inProgressSteps).length === 0
    && cadence?.waves?.[4]?.status === "in-progress"
    && cadence?.waves?.[4]?.selectedCapability === "seis-plugin-capability-coverage"
    && [[60, "61"], [80, "81"]].some(([completedSteps, activeStep]) => cadence?.waves?.[4]?.completedSteps === completedSteps
      && list(cadence?.waves?.[4]?.inProgressSteps).join(",") === activeStep);
  return shared && (beforeSequenceApplication || afterSequenceApplication || afterRepositoryLocalHandoff || afterFollowingWaveReview || afterEvidenceRetention || afterCloseout || activeWave5);
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-handoff-preparation" && record.goalId === "SEIS-GOAL-021" && record.wave === 4 && record.round === 5 && record.step === 96 && record.status === "completed-repository-local-handoff-preparation" && record.maturity === "prototype", "handoff-preparation identity is invalid");
  assert(record.stateAtPreparation?.completedStepCount === 95 && record.stateAtPreparation?.activeStep === 96 && list(record.stateAtPreparation?.remainingStepNumbers).join(",") === REMAINING_STEPS.join(",") && record.stateAtPreparation?.completedRoundCount === 4 && record.stateAtPreparation?.terminalHandoffPublished === false && record.stateAtPreparation?.waveCompleted === false && record.stateAtPreparation?.wave5ActivationApproved === false, "handoff-preparation state is invalid");
  assert(record.completionState?.completedStep === 96 && record.completionState?.nextActiveStep === 97 && record.completionState?.terminalHandoffPublished === false && record.completionState?.waveCompleted === false && record.completionState?.wave5ActivationApproved === false, "handoff-preparation completion state is invalid");
  assert(record.historicalWave4DirectCardSnapshot?.projectionModel === "direct-source-cards" && record.historicalWave4DirectCardSnapshot?.publicCardCount === 380 && record.historicalWave4DirectCardSnapshot?.retainedSourceCapabilityCount === 379 && record.historicalWave4DirectCardSnapshot?.current === false && record.historicalWave4DirectCardSnapshot?.immutableHistoricalEvidence === true, "historical Wave 4 direct-card snapshot is invalid");
  assert(isCurrentMarketplaceProjection(record.currentMarketplaceProjection), "current curated marketplace projection is invalid");
  assert(Object.values(record.completedEvidence || {}).every(Boolean), "a required handoff-preparation evidence check is not current");
  assert(record.handoffGate?.status === "sequence-approved-not-ready-for-terminal-handoff" && record.handoffGate?.ready === false && record.handoffGate?.allOneHundredStepsHaveCurrentEvidence === false && record.handoffGate?.preparationCompleted === true && record.handoffGate?.currentStepRemainsInProgress === false && record.handoffGate?.nextActiveStep === 97 && list(record.handoffGate?.remainingStepNumbers).join(",") === REMAINING_STEPS.join(",") && record.handoffGate?.terminalHandoffPublished === false && record.handoffGate?.waveCompleted === false && record.handoffGate?.wave5ActivationApproved === false, "terminal handoff gate is invalid");
  assert(record.remoteDeliveryBaseline?.featureBranch === FEATURE_BRANCH && record.remoteDeliveryBaseline?.precedingCommit === PREPARATION_BASELINE_COMMIT && record.remoteDeliveryBaseline?.remoteReferenceVerified === true && record.remoteDeliveryBaseline?.protectedDefaultBranchWritten === false, "remote delivery baseline is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(list(record.requiredBeforeTerminalHandoff).length === 4 && record.recommendedFollowUp?.goalId === "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE" && record.recommendedFollowUp?.status === "accepted-applied-to-canonical-program" && record.recommendedFollowUp?.decisionPath === CLOSEOUT_SEQUENCE_DECISION_PATH && record.recommendedFollowUp?.approvalSource === "active-thread-user-continuation-objective", "terminal handoff requirements are invalid");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "handoff-preparation inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "handoff-preparation record must not contain a machine-specific path");
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

function isCurrentMarketplaceProjection(projection) {
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
    && hasCurrentSelectedCapabilityBoundary(projection);
}

function hasCurrentSelectedCapabilityBoundary(projection) {
  if (projection?.directSourceCapabilityCardCount === 0) return true;
  const selected = projection?.selectedApplicationCapability;
  return selected?.id === "seis-swift-package-topology"
    && selected?.retainedSource === true
    && selected?.directMarketplaceCardRequired === false
    && selected?.directMarketplaceCardCount === 0
    && selected?.bundleCardCount === 1
    && selected?.bundleId === "seis-application-bundle-06";
}

function isHistoricalWave4IntegrationDistribution(projection) {
  return projection?.classification === "immutable-wave-4-direct-card-integration-snapshot"
    && projection?.projectionModel === "direct-source-package-marketplace-cards"
    && projection?.marketplaceName === "seis-repo"
    && projection?.marketplaceDisplayName === "SEIS Repo"
    && projection?.applicationPluginCount === 74
    && projection?.catalogPluginCount === 74
    && projection?.matrixPluginCount === 74
    && projection?.publicCardCount === 380
    && projection?.selectedCapability === "seis-swift-package-topology"
    && projection?.selectedCapabilityHadDirectMarketplaceCard === true;
}

function isHistoricalWave4PublicBoundaryDistribution(projection) {
  return projection?.classification === "immutable-wave-4-public-boundary-direct-card-snapshot"
    && projection?.projectionModel === "direct-source-package-marketplace-cards"
    && projection?.marketplaceName === "seis-repo"
    && projection?.marketplaceDisplayName === "SEIS Repo"
    && projection?.applicationPluginCount === 74
    && projection?.publicCardCount === 380
    && projection?.topologyCardCount === 1
    && projection?.selectedCapability === "seis-swift-package-topology"
    && projection?.selectedCapabilityHadDirectMarketplaceCard === true;
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

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 4 handoff preparation: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 handoff preparation: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
