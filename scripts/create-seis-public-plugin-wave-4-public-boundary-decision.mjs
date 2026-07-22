#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-public-boundary-decision.json";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const VALIDATION_DELIVERY_COMMIT = "6f94f08612839984fc841ac56f01e224010456c3";
const COMPLETED_STEPS = range(91, 95);
const CAPABILITY = "seis-swift-package-topology";
const DISTRIBUTION_BUNDLE_ID = "seis-application-bundle-06";
const HISTORICAL_WAVE_4_DISTRIBUTION = Object.freeze({ applicationPluginCount: 74, publicCardCount: 380 });
const CURRENT_DISTRIBUTION = Object.freeze({
  publicCardCount: 34,
  canonicalCardCount: 1,
  bundleCardCount: 33,
  applicationBundleCardCount: 6,
  topicBundleCardCount: 27,
  rootSourceModuleCount: 5,
  applicationSourcePackageCount: 75,
  topicSourcePackageCount: 300,
  retainedSourcePackageCount: 380,
});
const PATHS = Object.freeze({
  wave4Program: "content/development/seis-public-plugin-wave-4-program.json",
  validationDeliveryEvidence: "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json",
  integrationCheckpoint: "content/development/seis-public-plugin-wave-4-integration-checkpoint.json",
  topologyEvidence: "content/development/seis-swift-package-topology.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  marketplace: ".agents/plugins/marketplace.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  installState: "content/development/seis-public-install-state.json",
  installEvidence: "content/development/seis-public-install-evidence.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-public-boundary-decision");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 public-boundary decision check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 4 steps 91-95.");
}

function buildRecord() {
  const wave4Program = readJson(PATHS.wave4Program);
  const validationDeliveryEvidence = readJson(PATHS.validationDeliveryEvidence);
  const integrationCheckpoint = readJson(PATHS.integrationCheckpoint);
  const topologyEvidence = readJson(PATHS.topologyEvidence);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const marketplace = readJson(PATHS.marketplace);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const lifecycle = readJson(PATHS.lifecycle);
  const installState = readJson(PATHS.installState);
  const installEvidence = readJson(PATHS.installEvidence);
  const securityReview = readJson(PATHS.securityReview);
  const sourceEntry = list(sourceManifest.plugins).find((entry) => entry?.name === CAPABILITY) || null;
  const directMarketplaceEntry = list(marketplace.plugins).find((entry) => entry?.name === CAPABILITY) || null;
  const bundleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(CAPABILITY));
  const distributionBundle = bundleMemberships.length === 1 ? bundleMemberships[0] : null;
  const distributionBundleCard = list(marketplace.plugins).find((entry) => entry?.name === distributionBundle?.id) || null;
  const currentMarketplaceProjection = buildCurrentMarketplaceProjection({ sourceManifest, marketplace, bundleCatalog, sourceEntry, directMarketplaceEntry, distributionBundle, distributionBundleCard, bundleMembershipCount: bundleMemberships.length });
  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-4-public-boundary-decision",
    goalId: "SEIS-GOAL-021",
    wave: 4,
    round: 5,
    status: "completed-repository-local-public-boundary-decision",
    maturity: "prototype",
    generatedAt: "2026-07-21",
    purpose: "Record Wave 4's remote-policy observations, public marketplace count reconciliation, non-release boundary, remaining independent-proof requirements, and recommended follow-up decision without turning a feature-branch update into merge, signing, deployment, independent installation, or public-release evidence.",
    completedSteps: COMPLETED_STEPS,
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 90,
      activeStepBeforeTrackerUpdate: 91,
      nextPlannedStep: 96,
      waveCompleted: false,
      finalHandoffPublished: false,
    },
    checks: {
      wave4Tracker: isSupportedWave4Tracker(wave4Program),
      validationDelivery: validationDeliveryEvidence.id === "seis-public-plugin-wave-4-validation-delivery-evidence"
        && validationDeliveryEvidence.status === "completed-repository-local-validation-delivery-evidence"
        && list(validationDeliveryEvidence.completedSteps).join(",") === range(81, 90).join(",")
        && validationDeliveryEvidence.observedDelivery?.sourceIntegrationCommit === "e3cc34d6138c0e47fa582c5fa09e3c92c04a005e"
        && validationDeliveryEvidence.observedDelivery?.pushed === true
        && validationDeliveryEvidence.observedDelivery?.remoteReferenceVerified === true
        && validationDeliveryEvidence.observedDelivery?.protectedDefaultBranchWritten === false,
      topologyBoundary: integrationCheckpoint.id === "seis-public-plugin-wave-4-integration-checkpoint"
        && integrationCheckpoint.topologyEvidence?.auditOk === true
        && topologyEvidence.id === "seis-swift-package-topology"
        && topologyEvidence.audit?.ok === true
        && topologyEvidence.safety?.compilesSwift === false
        && topologyEvidence.safety?.runsSwiftTests === false
        && topologyEvidence.safety?.publicReleaseAllowed === false,
      publicCountReconciliation: marketplace.name === "seis-repo"
        && marketplace.interface?.displayName === "SEIS Repo"
        && list(marketplace.plugins).length === CURRENT_DISTRIBUTION.publicCardCount
        && list(sourceManifest.plugins).length === CURRENT_DISTRIBUTION.applicationSourcePackageCount
        && directMarketplaceEntry === null
        && bundleMemberships.length === 1
        && distributionBundle?.id === DISTRIBUTION_BUNDLE_ID
        && distributionBundleCard?.source?.path === distributionBundle.sourcePath,
      releaseBoundary: lifecycle.status === "active-local-proof-public-release-gated"
        && lifecycle.externalInstallProofSummary?.publicReleaseAllowed === false
        && installState.decision === "not-ready-for-public-release"
        && installState.readiness?.publicReleaseAllowed === false
        && installEvidence.releaseBoundary?.publicReleaseAllowed === false
        && securityReview.publicReleaseAllowed === false,
      continuity: isSupportedContinuity(continuityCadence),
      remoteReferenceVerified: true,
    },
    remotePolicyObservations: {
      featureBranch: FEATURE_BRANCH,
      remote: "origin",
      remoteReference: "refs/heads/plugins/seis-plugin-root-20260715",
      validationDeliveryCommit: VALIDATION_DELIVERY_COMMIT,
      remoteReferenceVerified: true,
      protectedDefaultBranchWritten: false,
      hostReported: [
        "Waiting for Code Scanning results.",
        "Changes must be made through a pull request.",
        "Cannot update this protected ref.",
        "Commits must have verified signatures.",
      ],
      interpretation: "The host accepted the named feature-branch update while retaining policy observations. This is not a merge, a protected default-branch write, code-scanning success, or a verified-signature claim.",
    },
    historicalWave4Distribution: {
      classification: "immutable-wave-4-public-boundary-direct-card-snapshot",
      projectionModel: "direct-source-package-marketplace-cards",
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      ...HISTORICAL_WAVE_4_DISTRIBUTION,
      topologyCardCount: 1,
      selectedCapability: CAPABILITY,
      selectedCapabilityHadDirectMarketplaceCard: true,
      note: "These counts and direct-card facts are immutable Wave 4 public-boundary history and do not describe the current curated marketplace.",
    },
    currentMarketplaceProjection,
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
    externalProofAndApprovals: {
      independentInstallationEvidenceRecorded: false,
      publicReleaseAllowed: false,
      approvalsStillRequired: [
        "pull request review and merge",
        "code-scanning result review",
        "verified-signature policy compliance",
        "independent installation or clean-runner evidence",
        "any public release, deployment, signing, or publication action",
      ],
    },
    recommendedFollowUp: {
      goalId: "SEIS-GOAL-021-W4-EXTERNAL-PROOF",
      status: "proposed-not-created",
      purpose: "Collect separately authorized independent installation or clean-runner evidence only when an approved environment and human release decision exist.",
    },
    risks: [
      {
        id: "RISK-W4-013",
        status: "tracked",
        description: "Feature-branch host acceptance can be misconstrued as satisfying PR, scanning, signature, or protected-branch policy.",
        mitigation: "Store each policy observation verbatim as a classification, retain all corresponding approval states as pending, and never infer merge or release.",
      },
      {
        id: "RISK-W4-014",
        status: "tracked",
        description: "Public source availability and count reconciliation can be misconstrued as independent installation proof.",
        mitigation: "Keep independentInstallation=false and link the still-pending evidence and human-approval gates.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused public-boundary decision and related tracker references on the feature branch; no external state, release, publication, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function isSupportedWave4Tracker(program) {
  const common = program?.id === "seis-public-plugin-wave-4-program"
    && ["in-progress", "completed"].includes(program?.status)
    && program?.maturity === "prototype"
    && program?.scope?.selectedCapability === "seis-swift-package-topology";
  const beforeDecision = program?.progress?.completedStepCount === 90
    && list(program?.progress?.inProgressStepNumbers).join(",") === "91";
  const afterDecision = program?.progress?.completedStepCount === 95
    && list(program?.progress?.inProgressStepNumbers).join(",") === "96"
    && program?.evidence?.publicBoundaryDecisionPath === OUTPUT_PATH;
  const afterCloseoutSequenceApproval = program?.progress?.completedStepCount === 96
    && list(program?.progress?.inProgressStepNumbers).join(",") === "97"
    && program?.evidence?.closeoutSequenceDecisionPath === "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json"
    && program?.closeoutSequence?.status === "approved-owner-mapping-applied";
  const afterRepositoryLocalHandoff = program?.progress?.completedStepCount === 97
    && list(program?.progress?.inProgressStepNumbers).join(",") === "98"
    && program?.evidence?.repositoryLocalHandoffPath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json"
    && program?.repositoryLocalHandoff?.status === "completed-repository-local-handoff";
  const afterFollowingWaveReview = program?.progress?.completedStepCount === 98
    && list(program?.progress?.inProgressStepNumbers).join(",") === "99"
    && program?.evidence?.wave4FollowingWaveReviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json"
    && program?.followingWaveReview?.status === "completed-following-wave-scope-review";
  const afterEvidenceRetention = program?.progress?.completedStepCount === 99
    && list(program?.progress?.inProgressStepNumbers).join(",") === "100"
    && program?.evidence?.evidenceRetentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json"
    && program?.evidenceRetention?.status === "completed-public-evidence-retention";
  const afterCloseout = program?.status === "completed"
    && program?.progress?.completedStepCount === 100
    && list(program?.progress?.inProgressStepNumbers).length === 0
    && program?.evidence?.closeoutPath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && program?.repositoryLocalCloseout?.status === "completed-repository-local-wave-closeout";
  return common && (beforeDecision || afterDecision || afterCloseoutSequenceApproval || afterRepositoryLocalHandoff || afterFollowingWaveReview || afterEvidenceRetention || afterCloseout);
}

function isSupportedContinuity(cadence) {
  const wave = cadence?.waves?.[3];
  const beforeDecision = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-validation-delivery-evidence-complete-step-91-in-progress"
    && wave?.completedSteps === 90
    && list(wave?.inProgressSteps).join(",") === "91";
  const afterDecision = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-public-boundary-decision-complete-step-96-in-progress"
    && wave?.completedSteps === 95
    && list(wave?.inProgressSteps).join(",") === "96"
    && wave?.publicBoundaryDecisionPath === OUTPUT_PATH
    && wave?.currentEvidencePath === OUTPUT_PATH;
  const afterCloseoutSequenceApproval = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-closeout-sequence-approved-step-97-in-progress"
    && wave?.completedSteps === 96
    && list(wave?.inProgressSteps).join(",") === "97"
    && wave?.closeoutSequenceDecisionPath === "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json";
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
    && ["wave-5-first-60-steps-completed-step-61-in-progress", "wave-5-first-80-steps-completed-step-81-in-progress"].includes(cadence?.cadence?.waveSeries?.activeWaveState)
    && wave?.status === "completed"
    && wave?.completedSteps === 100
    && list(wave?.inProgressSteps).length === 0
    && cadence?.waves?.[4]?.status === "in-progress"
    && cadence?.waves?.[4]?.selectedCapability === "seis-plugin-capability-coverage"
    && [[60, "61"], [80, "81"]].some(([completedSteps, activeStep]) => cadence?.waves?.[4]?.completedSteps === completedSteps && list(cadence?.waves?.[4]?.inProgressSteps).join(",") === activeStep);
  return cadence?.id === "seis-public-plugin-continuity-cadence" && cadence?.status === "active-evidence-led-cadence" && (beforeDecision || afterDecision || afterCloseoutSequenceApproval || afterRepositoryLocalHandoff || afterFollowingWaveReview || afterEvidenceRetention || afterCloseout || activeWave5);
}

function buildCurrentMarketplaceProjection({ sourceManifest, marketplace, bundleCatalog, sourceEntry, directMarketplaceEntry, distributionBundle, distributionBundleCard, bundleMembershipCount }) {
  const sourceEntries = list(sourceManifest.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  assert(marketplace.name === "seis-repo" && marketplace.interface?.displayName === "SEIS Repo", "current marketplace identity is invalid");
  assert(sourceManifest.publicDistribution?.distributionMode === "curated-bounded-public-bundles" && sourceManifest.publicDistribution?.separateMarketplaceCards === false, "current source distribution mode is invalid");
  assert(sourceEntries.length === CURRENT_DISTRIBUTION.applicationSourcePackageCount && marketplaceEntries.length === CURRENT_DISTRIBUTION.publicCardCount, "current source or marketplace count is invalid");
  assert(bundleCatalog.marketplace?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && bundleCatalog.marketplace?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && bundleCatalog.marketplace?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && bundleCatalog.marketplace?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && bundleCatalog.marketplace?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current bundle-card inventory is invalid");
  assert(bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && bundleCatalog.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.sourcePackagesDeleted === false, "current retained-source inventory is invalid");
  assert(sourceEntry?.sourcePath === `plugins/seis-core/${CAPABILITY}` && directMarketplaceEntry === null, "current selected capability must remain a retained source without a direct card");
  assert(distributionBundle?.id === DISTRIBUTION_BUNDLE_ID && distributionBundle?.family === "application" && distributionBundle?.sourcePath === `./plugins/seis-bundles/${DISTRIBUTION_BUNDLE_ID}` && bundleMembershipCount === 1, "current selected capability bundle membership is invalid");
  assert(distributionBundleCard?.source?.path === distributionBundle.sourcePath, "current selected capability bundle card is invalid");
  return {
    observedAt: bundleCatalog.generatedAt || null,
    projectionModel: "curated-bundle-cards",
    distributionMode: "curated-bounded-public-bundles",
    marketplaceName: marketplace.name,
    marketplaceDisplayName: marketplace.interface.displayName,
    publicCardCount: marketplaceEntries.length,
    canonicalCardCount: bundleCatalog.marketplace.canonicalCardCount,
    bundleCardCount: bundleCatalog.marketplace.bundleCardCount,
    applicationBundleCardCount: bundleCatalog.marketplace.applicationBundleCardCount,
    topicBundleCardCount: bundleCatalog.marketplace.topicBundleCardCount,
    sourceCapabilityInventory: {
      rootSourceModuleCount: bundleCatalog.sourceCapabilityInventory.rootSourceModuleCount,
      applicationSourcePackageCount: sourceEntries.length,
      topicSourcePackageCount: bundleCatalog.sourceCapabilityInventory.topicSourcePackageCount,
      retainedSourcePackageCount: bundleCatalog.sourceCapabilityInventory.retainedSourcePackageCount,
      sourcePackagesDeleted: false,
    },
    selectedApplicationCapability: {
      id: CAPABILITY,
      retainedSource: true,
      sourcePath: sourceEntry.sourcePath,
      directMarketplaceCardRequired: false,
      directMarketplaceCardCount: 0,
      bundleCardCount: 1,
      bundleId: distributionBundle.id,
      bundleSourcePath: distributionBundle.sourcePath,
      bundleFamily: distributionBundle.family,
    },
  };
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-public-boundary-decision" && record.goalId === "SEIS-GOAL-021" && record.wave === 4 && record.round === 5 && record.status === "completed-repository-local-public-boundary-decision" && record.maturity === "prototype", "public-boundary decision identity is invalid");
  assert(list(record.completedSteps).join(",") === COMPLETED_STEPS.join(","), "completed step range is invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 90 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 91 && record.stateAtCheckpoint?.nextPlannedStep === 96 && record.stateAtCheckpoint?.waveCompleted === false && record.stateAtCheckpoint?.finalHandoffPublished === false, "decision state is invalid");
  assert(Object.values(record.checks || {}).every(Boolean), "a required public-boundary check is not current");
  assert(record.remotePolicyObservations?.validationDeliveryCommit === VALIDATION_DELIVERY_COMMIT && record.remotePolicyObservations?.remoteReferenceVerified === true && record.remotePolicyObservations?.protectedDefaultBranchWritten === false && list(record.remotePolicyObservations?.hostReported).length === 4, "remote policy observations are invalid");
  assert(record.historicalWave4Distribution?.classification === "immutable-wave-4-public-boundary-direct-card-snapshot" && record.historicalWave4Distribution?.projectionModel === "direct-source-package-marketplace-cards" && record.historicalWave4Distribution?.marketplaceName === "seis-repo" && record.historicalWave4Distribution?.marketplaceDisplayName === "SEIS Repo" && record.historicalWave4Distribution?.applicationPluginCount === HISTORICAL_WAVE_4_DISTRIBUTION.applicationPluginCount && record.historicalWave4Distribution?.publicCardCount === HISTORICAL_WAVE_4_DISTRIBUTION.publicCardCount && record.historicalWave4Distribution?.topologyCardCount === 1 && record.historicalWave4Distribution?.selectedCapability === CAPABILITY && record.historicalWave4Distribution?.selectedCapabilityHadDirectMarketplaceCard === true, "historical Wave 4 distribution is invalid");
  assert(record.currentMarketplaceProjection?.projectionModel === "curated-bundle-cards" && record.currentMarketplaceProjection?.distributionMode === "curated-bounded-public-bundles" && record.currentMarketplaceProjection?.marketplaceName === "seis-repo" && record.currentMarketplaceProjection?.marketplaceDisplayName === "SEIS Repo" && record.currentMarketplaceProjection?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && record.currentMarketplaceProjection?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && record.currentMarketplaceProjection?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.currentMarketplaceProjection?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.currentMarketplaceProjection?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current marketplace card projection is invalid");
  assert(record.currentMarketplaceProjection?.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && record.currentMarketplaceProjection?.selectedApplicationCapability?.id === CAPABILITY && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardRequired === false && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardCount === 0 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleId === DISTRIBUTION_BUNDLE_ID, "current retained-source or selected-capability projection is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(record.externalProofAndApprovals?.independentInstallationEvidenceRecorded === false && record.externalProofAndApprovals?.publicReleaseAllowed === false && list(record.externalProofAndApprovals?.approvalsStillRequired).length === 5, "external proof boundary is invalid");
  assert(record.recommendedFollowUp?.goalId === "SEIS-GOAL-021-W4-EXTERNAL-PROOF" && record.recommendedFollowUp?.status === "proposed-not-created", "follow-up decision is invalid");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "decision inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "public-boundary decision must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 4 public-boundary decision: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 public-boundary decision: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
