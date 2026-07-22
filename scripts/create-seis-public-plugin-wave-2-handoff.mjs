#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-2-handoff.json";
const APPLE_PLUGIN_ID = "seis-apple-native-readiness";
const APPLE_BUNDLE_ID = "seis-application-bundle-04";
const WAVE_3_PLUGIN_ID = "seis-swift-concurrency-audit";
const WAVE_3_BUNDLE_ID = "seis-application-bundle-06";
const PATHS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  releaseReadiness: "apps/seis-core/data/seis-core-plugin-release-readiness.json",
  wave1Handoff: "content/development/seis-public-plugin-wave-1-handoff.json",
  wave2Program: "content/development/seis-public-plugin-wave-2-program.json",
  capabilityDecision: "content/development/seis-public-plugin-wave-2-capability-decision.json",
  appleReadiness: "content/development/seis-apple-native-readiness.json",
  distributionReview: "content/development/seis-public-plugin-wave-2-distribution-review.json",
  followUpDecision: "content/development/seis-public-plugin-wave-2-follow-up-decision.json",
  wave3Program: "content/development/seis-public-plugin-wave-3-program.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
  freshTaskReload: "content/development/seis-public-plugin-fresh-task-reload-evidence.json",
  mcpPermission: "content/development/seis-mcp-permission-risk-matrix.json",
});
const CURRENT_DISTRIBUTION = Object.freeze({
  marketplaceCardCount: 34,
  canonicalCardCount: 1,
  bundleCardCount: 33,
  applicationBundleCardCount: 6,
  topicBundleCardCount: 27,
  retainedSourceCapabilityCount: 380,
  rootSourceCapabilityCount: 5,
  applicationSourceCapabilityCount: APP_PLUGIN_EXPANSION_TARGET,
  topicSourceCapabilityCount: 300,
});
const HISTORICAL_WAVE_2_DISTRIBUTION = Object.freeze({
  applicationSourcePackageCount: 72,
  topicSourcePackageCount: 300,
  migratedRootCardCount: 5,
  canonicalCardCount: 1,
  directApplicationCardCount: 72,
  marketplaceCardCount: 378,
});
const HISTORICAL_WAVE_3_DISTRIBUTION = Object.freeze({
  applicationSourcePackageCount: 73,
  directApplicationCardCount: 73,
  marketplaceCardCount: 379,
});
const SECRET_PATTERNS = [
  { id: "openai-like-api-key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "private-key-header", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-2-handoff`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 2 handoff check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for the completed public Wave 2 handoff.");
}

function buildRecord() {
  const marketplace = readJson(PATHS.marketplace);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const matrix = readJson(PATHS.matrix);
  const releaseReadiness = readJson(PATHS.releaseReadiness);
  const wave1Handoff = readJson(PATHS.wave1Handoff);
  const wave2Program = readJson(PATHS.wave2Program);
  const capabilityDecision = readJson(PATHS.capabilityDecision);
  const appleReadiness = readJson(PATHS.appleReadiness);
  const distributionReview = readJson(PATHS.distributionReview);
  const followUpDecision = readJson(PATHS.followUpDecision);
  const wave3Program = readJson(PATHS.wave3Program);
  const lifecycle = readJson(PATHS.lifecycle);
  const securityReview = readJson(PATHS.securityReview);
  const freshTaskReload = readJson(PATHS.freshTaskReload);
  const mcpPermission = readJson(PATHS.mcpPermission);
  const cards = list(marketplace.plugins);
  const plugins = list(sourceManifest.plugins);
  const appleDirectCard = cards.find((card) => card?.name === APPLE_PLUGIN_ID || card?.source?.path === `./plugins/seis-core/${APPLE_PLUGIN_ID}`);
  const appleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(APPLE_PLUGIN_ID));
  const appleBundle = appleMemberships[0];
  const appleBundleCard = cards.find((card) => card?.name === appleBundle?.id);
  const wave3DirectCard = cards.find((card) => card?.name === WAVE_3_PLUGIN_ID || card?.source?.path === `./plugins/seis-core/${WAVE_3_PLUGIN_ID}`);
  const wave3Memberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(WAVE_3_PLUGIN_ID));
  const wave3Bundle = wave3Memberships[0];
  const wave3BundleCard = cards.find((card) => card?.name === wave3Bundle?.id);
  const inputSafetyScan = scanPublicSafeInputs(Object.values(PATHS));
  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-2-handoff",
    goalId: "SEIS-GOAL-021",
    generatedAt: "2026-07-22",
    status: "completed-repository-local-handoff",
    purpose: "Record a reproducible repository-local Wave 2 completion, preserve its historical direct-card facts, reconcile the current curated SEIS Repo boundary, retain native and external validation limits, and identify Wave 3 as completed and bundle-distributed. This is not a public release, independent installation, provider, deployment, or approval claim.",
    program: {
      id: wave2Program.id,
      status: wave2Program.status,
      completedStepCount: list(wave2Program.steps).filter((step) => step?.status === "completed").length,
      inProgressStepNumbers: list(wave2Program.steps)
        .filter((step) => step?.status === "in-progress" && Number.isInteger(step.number))
        .map((step) => step.number)
        .sort((left, right) => left - right),
      completedRoundCount: list(wave2Program.rounds).filter((round) => round?.status === "completed").length,
      selectedCapability: wave2Program.capability?.selectedCapability || null,
    },
    marketplace: {
      name: marketplace.name,
      displayName: marketplace.interface?.displayName || null,
      distributionMode: sourceManifest.publicDistribution?.distributionMode || null,
      marketplaceCardCount: cards.length,
      expectedMarketplaceCardCount: CURRENT_DISTRIBUTION.marketplaceCardCount,
      canonicalCardCount: bundleCatalog.marketplace?.canonicalCardCount ?? null,
      bundleCardCount: bundleCatalog.marketplace?.bundleCardCount ?? null,
      applicationBundleCardCount: bundleCatalog.marketplace?.applicationBundleCardCount ?? null,
      topicBundleCardCount: bundleCatalog.marketplace?.topicBundleCardCount ?? null,
      retainedSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount ?? null,
      rootSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount ?? null,
      applicationSourceCapabilityCount: plugins.length,
      topicSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount ?? null,
      separateMarketplaceCards: sourceManifest.publicDistribution?.separateMarketplaceCards ?? null,
      appleReadiness: {
        sourcePath: plugins.find((plugin) => plugin?.name === APPLE_PLUGIN_ID)?.sourcePath || null,
        marketplaceCard: Boolean(appleDirectCard),
        distributionBundleId: appleBundle?.id || null,
        distributionBundleCardPresent: Boolean(appleBundleCard),
        bundleMembershipCount: appleMemberships.length,
      },
    },
    validation: {
      wave1Continuity: wave1Handoff.id === "seis-public-plugin-wave-1-handoff" && wave1Handoff.status === "completed-repository-local-handoff",
      sourceAndCatalog: plugins.length === APP_PLUGIN_EXPANSION_TARGET
        && cards.length === CURRENT_DISTRIBUTION.marketplaceCardCount
        && sourceManifest.publicDistribution?.distributionMode === "curated-bounded-public-bundles"
        && sourceManifest.publicDistribution?.separateMarketplaceCards === false
        && !appleDirectCard
        && appleMemberships.length === 1
        && appleBundle?.id === APPLE_BUNDLE_ID
        && Boolean(appleBundleCard),
      matrix: matrix.pluginCount === APP_PLUGIN_EXPANSION_TARGET && matrix.expectedPluginCount === APP_PLUGIN_EXPANSION_TARGET && matrix.failureCount === 0,
      appleReadiness: appleReadiness.id === "seis-apple-native-readiness" && appleReadiness.status === "completed-public-static-readiness-evidence" && appleReadiness.resilienceReview?.status === "completed-repository-local-resilience-review",
      capabilityDecision: capabilityDecision.id === "seis-public-plugin-wave-2-capability-decision" && capabilityDecision.status === "approved-public-local-implementation" && capabilityDecision.decision?.selectedCapability === "seis-apple-native-readiness",
      distributionReview: distributionReview.id === "seis-public-plugin-wave-2-distribution-review" && distributionReview.status === "completed-repository-local-distribution-maintenance-review",
      followUpDecision: followUpDecision.id === "seis-public-plugin-wave-2-follow-up-decision" && followUpDecision.status === "completed-no-additional-public-plugin-selected" && followUpDecision.decision?.selectedCapability === null && followUpDecision.publicDistribution?.currentDirectCardAdded === false,
      lifecycle: lifecycle.id === "seis-public-plugin-lifecycle",
      provenance: number(securityReview.aggregate?.secretFindingCount) === 0 && number(securityReview.aggregate?.blockingFindingCount) === 0,
      freshTaskReload: freshTaskReload.id === "seis-public-plugin-fresh-task-reload-evidence",
      releaseReadiness: releaseReadiness.id === "seis-core-plugin-release-readiness"
        && typeof releaseReadiness.decision === "string"
        && ["large-code-promotion-evidence-ready", "continue-code-before-large-code-promotion"].includes(releaseReadiness.decision),
      mcpBoundary: list(mcpPermission.safety?.write).length === 0 && list(mcpPermission.safety?.network).length === 0 && list(mcpPermission.safety?.secrets).length === 0,
      wave3Continuation: wave3Program.id === "seis-public-plugin-wave-3-program"
        && wave3Program.status === "completed"
        && Number.isInteger(wave3Program.progress?.completedStepCount)
        && wave3Program.progress.completedStepCount === 100
        && list(wave3Program.progress?.inProgressStepNumbers).length === 0
        && wave3Program.selection?.status === "implementation-approved"
        && wave3Program.selection?.selectedCapability === WAVE_3_PLUGIN_ID
        && wave3Program.selection?.implementationStarted === true
        && wave3Program.selection?.additionalPublicCardAdded === true
        && !wave3DirectCard
        && wave3Memberships.length === 1
        && wave3Bundle?.id === WAVE_3_BUNDLE_ID
        && Boolean(wave3BundleCard),
    },
    publicBoundary: {
      marketplaceName: wave2Program.publicBoundary?.marketplaceName,
      marketplaceDisplayName: wave2Program.publicBoundary?.marketplaceDisplayName,
      publicAudience: wave2Program.publicBoundary?.publicAudience,
      personalMarketplaceRead: wave2Program.publicBoundary?.personalMarketplaceRead,
      personalMarketplaceMutation: wave2Program.publicBoundary?.personalMarketplaceMutation,
      network: wave2Program.publicBoundary?.network,
      externalWrites: wave2Program.publicBoundary?.externalWrites,
      secrets: wave2Program.publicBoundary?.secrets,
      publicReleaseAllowed: wave2Program.publicBoundary?.publicReleaseAllowed,
    },
    historicalWave3Planning: {
      statusAtWave2Handoff: "planned",
      selectionStatusAtWave2Handoff: "discovery-required",
      selectedCapabilityAtWave2Handoff: null,
      implementationStartedAtWave2Handoff: false,
      additionalPublicCardAddedAtWave2Handoff: false,
      note: "This preserves the Wave 3 state recorded when the completed Wave 2 handoff was first prepared; the current continuation is tracked separately below.",
    },
    historicalWave2Distribution: {
      classification: "immutable-wave-2-handoff-snapshot",
      distributionMode: "direct-source-package-marketplace-cards",
      ...HISTORICAL_WAVE_2_DISTRIBUTION,
      appleReadinessHadDirectMarketplaceCard: true,
      note: "These counts are historical facts and do not describe the current curated marketplace.",
    },
    historicalWave3Distribution: {
      classification: "immutable-wave-3-direct-card-completion-snapshot",
      distributionMode: "direct-source-package-marketplace-cards",
      ...HISTORICAL_WAVE_3_DISTRIBUTION,
      selectedCapability: WAVE_3_PLUGIN_ID,
      selectedCapabilityHadDirectMarketplaceCard: true,
      note: "Wave 3 historically added a direct card; the current source capability is retained behind a curated bundle card.",
    },
    nativeValidationBoundary: {
      packageGraphStatus: followUpDecision.swiftPmEvidence?.packageGraph?.manifestInspection || null,
      swiftToolchain: followUpDecision.swiftPmEvidence?.localToolingObservation?.swiftToolchain || null,
      swiftTestState: followUpDecision.swiftPmEvidence?.localToolingObservation?.swiftTestState || null,
      swiftTestCompletionClaim: followUpDecision.swiftPmEvidence?.localToolingObservation?.swiftTestCompletionClaim || null,
      compiledSwiftClaim: followUpDecision.swiftPmEvidence?.validationBoundary?.compiledSwiftClaim ?? null,
      testPassClaim: followUpDecision.swiftPmEvidence?.validationBoundary?.testPassClaim ?? null,
      nativeApplicationRunClaim: followUpDecision.swiftPmEvidence?.validationBoundary?.nativeApplicationRunClaim ?? null,
      deploymentOrAppStoreClaim: followUpDecision.swiftPmEvidence?.validationBoundary?.deploymentOrAppStoreClaim ?? null,
    },
    delivery: {
      featureBranch: "plugins/seis-plugin-root-20260715",
      priorValidatedCheckpointCommit: "c62d059898190f943802a11eb66ad35659e31d50",
      priorRemoteReferenceVerified: true,
      protectedDefaultBranchWritten: false,
      finalCheckpointRule: "The handoff record must be delivered only through the current feature branch after final local validation; it intentionally does not predict its own future commit SHA.",
    },
    knownGaps: [
      {
        id: "swiftpm-test-completion",
        state: "approval-required",
        decision: "The local SwiftPM test attempt was interrupted after a no-output observation window. No compiled-Swift or test-pass claim is made; a controlled longer local or CI run is required before that evidence can exist.",
      },
      {
        id: "independent-public-installation",
        state: "approval-required",
        decision: "Repository-local marketplace evidence is not independent external installation or publication proof. Keep public release blocked pending explicit approval and independent evidence.",
      },
    ],
    skippedChecks: [
      "No completed SwiftPM test result is claimed; the prior local attempt remains recorded as interrupted and non-claimable.",
      "No live provider, browser, GitHub API, external installation, deployment, signing, App Store, or public publication check was run or claimed by this handoff record.",
      "No release promotion was initiated; current repository-local release-readiness evidence remains a gate rather than a release action.",
    ],
    releaseReadiness: {
      currentLabel: releaseReadiness.currentRelease?.label || null,
      currentSemver: releaseReadiness.currentRelease?.semver || null,
      codeLinesChanged: number(releaseReadiness.workingTree?.codeLinesChanged),
      decision: releaseReadiness.decision || null,
      promoted: false,
    },
    risks: [
      {
        id: "RISK-W2-001",
        status: "tracked",
        description: "Static Apple/Swift readiness evidence can be misread as proof that native build, signing, or release gates passed.",
        mitigation: "Keep native execution and release claims false until a separately controlled validation produces current evidence.",
      },
      {
        id: "RISK-W2-002",
        status: "tracked",
        description: "Public marketplace metadata can drift when retained source-capability counts are confused with curated bundle-card counts.",
        mitigation: "Require source, bundle catalog, matrix, marketplace, lifecycle, provenance, and manifest reconciliation while reporting cards and retained sources separately.",
      },
      {
        id: "RISK-W2-003",
        status: "tracked",
        description: "A completed wave could be misreported as still active or its historical direct card could be mistaken for current distribution.",
        mitigation: "Keep Wave 3 completed, preserve its direct-card facts only in the historical snapshot, and validate its current exact-one bundle membership.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 2 package, program, decisions, evidence, and handoff references on the feature branch; do not mutate the protected default branch.",
      dataMigrationRequired: false,
    },
    nextWave: {
      number: 3,
      status: wave3Program.status || null,
      programId: wave3Program.id,
      selectionStatus: wave3Program.selection?.status || null,
      selectedCapability: wave3Program.selection?.selectedCapability || null,
      implementationStarted: wave3Program.selection?.implementationStarted === true,
      completedStepCount: wave3Program.progress?.completedStepCount ?? null,
      currentDistributionMode: sourceManifest.publicDistribution?.distributionMode || null,
      marketplaceCard: Boolean(wave3DirectCard),
      distributionBundleId: wave3Bundle?.id || null,
      distributionBundleCardPresent: Boolean(wave3BundleCard),
      bundleMembershipCount: wave3Memberships.length,
      historicalAdditionalDirectCardAddedAtExecution: wave3Program.selection?.additionalPublicCardAdded === true,
      historicalStatusAtWave2Handoff: "planned",
      historicalSelectionStatusAtWave2Handoff: "discovery-required",
      scopeRiskReviewPath: OUTPUT_PATH,
      activationRule: "Wave 3 completed after a separate non-duplicative capability decision and repository-local validation. Its retained source capability is now distributed through a curated bundle; this does not authorize external release or protected-branch writes.",
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-2-handoff", "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021" && record.status === "completed-repository-local-handoff", "goal linkage or status is invalid");
  assert(record.program?.id === "seis-public-plugin-wave-2-program" && record.program?.status === "completed" && record.program?.completedStepCount === 100 && record.program?.completedRoundCount === 5 && list(record.program?.inProgressStepNumbers).length === 0 && record.program?.selectedCapability === "seis-apple-native-readiness", "Wave 2 completion evidence is invalid");
  assert(record.marketplace?.name === "seis-repo" && record.marketplace?.displayName === "SEIS Repo", "public marketplace identity is invalid");
  assert(record.marketplace?.distributionMode === "curated-bounded-public-bundles" && record.marketplace?.separateMarketplaceCards === false, "current marketplace distribution mode is invalid");
  assert(record.marketplace?.marketplaceCardCount === CURRENT_DISTRIBUTION.marketplaceCardCount && record.marketplace?.expectedMarketplaceCardCount === CURRENT_DISTRIBUTION.marketplaceCardCount && record.marketplace?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && record.marketplace?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.marketplace?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.marketplace?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current marketplace card counts are invalid");
  assert(record.marketplace?.retainedSourceCapabilityCount === CURRENT_DISTRIBUTION.retainedSourceCapabilityCount && record.marketplace?.rootSourceCapabilityCount === CURRENT_DISTRIBUTION.rootSourceCapabilityCount && record.marketplace?.applicationSourceCapabilityCount === CURRENT_DISTRIBUTION.applicationSourceCapabilityCount && record.marketplace?.topicSourceCapabilityCount === CURRENT_DISTRIBUTION.topicSourceCapabilityCount, "current source capability counts are invalid");
  assert(record.marketplace?.appleReadiness?.sourcePath === `plugins/seis-core/${APPLE_PLUGIN_ID}` && record.marketplace?.appleReadiness?.marketplaceCard === false && record.marketplace?.appleReadiness?.distributionBundleId === APPLE_BUNDLE_ID && record.marketplace?.appleReadiness?.distributionBundleCardPresent === true && record.marketplace?.appleReadiness?.bundleMembershipCount === 1, "Apple readiness current bundle distribution is invalid");
  assert(Object.values(record.validation).every(Boolean), "a required Wave 2 validation contract is not current");
  assert(record.publicBoundary?.publicAudience === "everyone" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false, "personal marketplace boundary is invalid");
  assert(record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public safety boundary is invalid");
  assert(record.nativeValidationBoundary?.packageGraphStatus === "completed-local-package-graph-inspection" && record.nativeValidationBoundary?.swiftTestState === "interrupted-after-no-output-observation-window" && record.nativeValidationBoundary?.swiftTestCompletionClaim === "not-completed-and-not-claimed" && record.nativeValidationBoundary?.compiledSwiftClaim === false && record.nativeValidationBoundary?.testPassClaim === false && record.nativeValidationBoundary?.nativeApplicationRunClaim === false && record.nativeValidationBoundary?.deploymentOrAppStoreClaim === false, "native validation boundary is invalid");
  assert(record.delivery?.featureBranch === "plugins/seis-plugin-root-20260715" && record.delivery?.priorRemoteReferenceVerified === true && record.delivery?.protectedDefaultBranchWritten === false, "delivery boundary is invalid");
  assert(list(record.knownGaps).length === 2 && record.knownGaps[0]?.id === "swiftpm-test-completion" && record.knownGaps[1]?.id === "independent-public-installation", "known gaps are invalid");
  assert(record.releaseReadiness?.promoted === false && ["large-code-promotion-evidence-ready", "continue-code-before-large-code-promotion"].includes(record.releaseReadiness?.decision), "handoff must not claim a release promotion");
  assert(record.historicalWave3Planning?.statusAtWave2Handoff === "planned" && record.historicalWave3Planning?.selectionStatusAtWave2Handoff === "discovery-required" && record.historicalWave3Planning?.selectedCapabilityAtWave2Handoff === null && record.historicalWave3Planning?.implementationStartedAtWave2Handoff === false && record.historicalWave3Planning?.additionalPublicCardAddedAtWave2Handoff === false, "Wave 3 historical planning snapshot is invalid");
  assert(record.historicalWave2Distribution?.applicationSourcePackageCount === HISTORICAL_WAVE_2_DISTRIBUTION.applicationSourcePackageCount && record.historicalWave2Distribution?.marketplaceCardCount === HISTORICAL_WAVE_2_DISTRIBUTION.marketplaceCardCount && record.historicalWave2Distribution?.directApplicationCardCount === HISTORICAL_WAVE_2_DISTRIBUTION.directApplicationCardCount && record.historicalWave2Distribution?.appleReadinessHadDirectMarketplaceCard === true, "Wave 2 historical distribution snapshot is invalid");
  assert(record.historicalWave3Distribution?.applicationSourcePackageCount === HISTORICAL_WAVE_3_DISTRIBUTION.applicationSourcePackageCount && record.historicalWave3Distribution?.marketplaceCardCount === HISTORICAL_WAVE_3_DISTRIBUTION.marketplaceCardCount && record.historicalWave3Distribution?.directApplicationCardCount === HISTORICAL_WAVE_3_DISTRIBUTION.directApplicationCardCount && record.historicalWave3Distribution?.selectedCapability === WAVE_3_PLUGIN_ID && record.historicalWave3Distribution?.selectedCapabilityHadDirectMarketplaceCard === true, "Wave 3 historical distribution snapshot is invalid");
  assert(record.nextWave?.number === 3 && record.nextWave?.status === "completed" && record.nextWave?.programId === "seis-public-plugin-wave-3-program" && record.nextWave?.selectionStatus === "implementation-approved" && record.nextWave?.selectedCapability === WAVE_3_PLUGIN_ID && record.nextWave?.implementationStarted === true && record.nextWave?.completedStepCount === 100 && record.nextWave?.currentDistributionMode === "curated-bounded-public-bundles" && record.nextWave?.marketplaceCard === false && record.nextWave?.distributionBundleId === WAVE_3_BUNDLE_ID && record.nextWave?.distributionBundleCardPresent === true && record.nextWave?.bundleMembershipCount === 1 && record.nextWave?.historicalAdditionalDirectCardAddedAtExecution === true && record.nextWave?.historicalStatusAtWave2Handoff === "planned" && record.nextWave?.historicalSelectionStatusAtWave2Handoff === "discovery-required" && record.nextWave?.scopeRiskReviewPath === OUTPUT_PATH, "Wave 3 completed bundle continuation is invalid");
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

function number(value) {
  return Number.isFinite(value) ? value : 0;
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 2 handoff: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 2 handoff: required input is missing");
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
