#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-2-follow-up-decision.json";
const APPLE_PLUGIN_ID = "seis-apple-native-readiness";
const APPLE_BUNDLE_ID = "seis-application-bundle-04";
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
const PATHS = Object.freeze({
  packageManifest: "packages/seis_platform_swift/Package.swift",
  strategy: "docs/APPLE_PLATFORM_STRATEGY.md",
  source: "apps/seis-core/data/seis-core-plugin-sources.json",
  marketplace: ".agents/plugins/marketplace.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  capabilityDecision: "content/development/seis-public-plugin-wave-2-capability-decision.json",
  appleEvidence: "content/development/seis-apple-native-readiness.json",
  distributionReview: "content/development/seis-public-plugin-wave-2-distribution-review.json",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-2-follow-up-decision`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 2 follow-up decision check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} without adding a duplicate public package.`);
}

function buildRecord() {
  const packageManifest = readText(PATHS.packageManifest);
  const strategy = readText(PATHS.strategy);
  const source = readJson(PATHS.source);
  const marketplace = readJson(PATHS.marketplace);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const capabilityDecision = readJson(PATHS.capabilityDecision);
  const appleEvidence = readJson(PATHS.appleEvidence);
  const distributionReview = readJson(PATHS.distributionReview);
  const sourceApple = list(source.plugins).find((plugin) => plugin?.name === APPLE_PLUGIN_ID);
  const catalogApple = list(catalog.plugins).find((plugin) => plugin?.name === APPLE_PLUGIN_ID);
  const matrixApple = list(matrix.plugins).find((plugin) => plugin?.name === APPLE_PLUGIN_ID);
  const cards = list(marketplace.plugins);
  const directAppleCard = cards.find((card) => card?.name === APPLE_PLUGIN_ID || card?.source?.path === `./plugins/seis-core/${APPLE_PLUGIN_ID}`);
  const appleBundleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(APPLE_PLUGIN_ID));
  const appleBundle = appleBundleMemberships[0];
  const appleBundleCard = cards.find((card) => card?.name === appleBundle?.id);

  assert(packageManifest.includes('name: "SeisPlatformKit"'), "SwiftPM package identity is missing");
  assert(packageManifest.includes('.library(name: "SeisPlatformKit"') && packageManifest.includes('.executable(name: "SeisAppleNativeShell"') && packageManifest.includes('.testTarget(name: "SeisPlatformKitTests"'), "SwiftPM product or test contract is missing");
  assert(packageManifest.includes('.macOS(.v13)') && packageManifest.includes('.iOS(.v16)'), "SwiftPM platform contract is missing");
  assert(strategy.includes("macOS is the primary native Command Center.") && strategy.includes("iPadOS is the SEIS Brain, review, and creative-planning surface.") && strategy.includes("iOS is the status, alert, search, and quick-note companion.") && strategy.includes("visionOS is research-only until shared Apple foundations are healthy."), "Apple platform role boundary is missing");
  assert(sourceApple?.status === "approved-public-readonly", "Apple plugin source boundary is invalid");
  assert(catalogApple?.status?.state === "ready" && matrixApple?.status === "ready", "Apple plugin catalog or matrix state is invalid");
  assert(capabilityDecision?.decision?.selectedCapability === APPLE_PLUGIN_ID && capabilityDecision?.status === "approved-public-local-implementation", "initial Apple plugin decision is invalid");
  assert(appleEvidence?.audit?.classification === "documented-static-readiness-only" && appleEvidence?.resilienceReview?.externalNativeValidation === "not-run-and-not-claimed", "Apple static-readiness evidence is invalid");
  assert(distributionReview?.status === "completed-repository-local-distribution-maintenance-review", "distribution review is invalid");
  assert(!directAppleCard && appleBundleMemberships.length === 1 && appleBundle?.id === APPLE_BUNDLE_ID && appleBundleCard?.source?.path === `./plugins/seis-bundles/${APPLE_BUNDLE_ID}`, "Apple source current bundle distribution is invalid");

  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-2-follow-up-decision",
    goalId: "SEIS-GOAL-021",
    wave: 2,
    round: 4,
    status: "completed-no-additional-public-plugin-selected",
    generatedAt: "2026-07-22",
    purpose: "Record the evidence-based Round 4 decision not to add a duplicate public Apple/Swift plugin before a bounded, completed SwiftPM execution result exists.",
    decision: {
      selectedCapability: null,
      outcome: "no-additional-public-plugin-selected",
      selectionReason: "The existing public SEIS Apple Native Readiness package already owns bounded static Swift Package, source/test, strategy, and traversal-limit evidence. A second package would only repeat static inspection or expose an environment-specific incomplete test attempt, rather than provide a distinct, safely validated capability.",
      futureSelectionRequirement: "Any later follow-up must have a unique contract beyond static readiness and a bounded completed SwiftPM result or a reviewed reason why execution evidence remains unavailable.",
      overlapReview: [
        {
          plugin: APPLE_PLUGIN_ID,
          decision: "retain-without-duplicate",
          reason: "It already owns bounded static Apple/Swift Package readiness and explicitly separates that evidence from build or runtime claims.",
        },
        {
          plugin: "seis-test-flakiness",
          decision: "retain",
          reason: "It analyzes recorded test repetition variance and does not create a SwiftPM completion result.",
        },
        {
          plugin: "seis-release-readiness",
          decision: "retain",
          reason: "It separates recorded release evidence from publication and does not replace a native test result.",
        },
        {
          plugin: "seis-workspace-inspector",
          decision: "retain",
          reason: "It inventories workspace metadata but does not own SwiftPM execution evidence.",
        },
      ],
    },
    swiftPmEvidence: {
      packageGraph: {
        manifestInspection: "completed-local-package-graph-inspection",
        externalDependencyCount: 0,
        products: ["SeisPlatformKit", "SeisAppleNativeShell"],
        testTarget: "SeisPlatformKitTests",
        declaredPlatforms: ["macOS 13+", "iOS 16+"],
      },
      localToolingObservation: {
        swiftToolchain: "available-local-inspection-only",
        xcodebuild: "unavailable-from-active-command-line-tools-directory",
        packageDescribe: "completed-local-package-graph-inspection",
        swiftTestCommand: "swift test --package-path packages/seis_platform_swift",
        swiftTestState: "interrupted-after-no-output-observation-window",
        swiftTestCompletionClaim: "not-completed-and-not-claimed",
        buildCacheTracked: false,
        networkUsedByPackageGraph: false,
      },
      validationBoundary: {
        compiledSwiftClaim: false,
        testPassClaim: false,
        nativeApplicationRunClaim: false,
        simulatorOrDeviceClaim: false,
        signingOrProvisioningClaim: false,
        deploymentOrAppStoreClaim: false,
      },
    },
    platformBoundary: {
      macOS: "primary-native-command-center",
      iPadOS: "brain-review-and-creative-planning-surface",
      iOS: "companion-surface",
      visionOS: "research-only",
      releaseReadiness: "not-asserted",
    },
    historicalWave2Distribution: {
      classification: "immutable-wave-2-follow-up-snapshot",
      distributionMode: "direct-source-package-marketplace-cards",
      ...HISTORICAL_WAVE_2_DISTRIBUTION,
      additionalDirectCardAddedByFollowUp: false,
      note: "The follow-up added no direct card; these historical counts are not the current marketplace projection.",
    },
    publicDistribution: {
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      publicAudience: "everyone",
      distributionMode: source.publicDistribution?.distributionMode || null,
      marketplaceCardCount: cards.length,
      canonicalCardCount: bundleCatalog.marketplace?.canonicalCardCount ?? null,
      bundleCardCount: bundleCatalog.marketplace?.bundleCardCount ?? null,
      applicationBundleCardCount: bundleCatalog.marketplace?.applicationBundleCardCount ?? null,
      topicBundleCardCount: bundleCatalog.marketplace?.topicBundleCardCount ?? null,
      retainedSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount ?? null,
      rootSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount ?? null,
      applicationSourceCapabilityCount: source.pluginCount ?? null,
      topicSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount ?? null,
      separateMarketplaceCards: source.publicDistribution?.separateMarketplaceCards ?? null,
      appleReadinessSourcePath: sourceApple?.sourcePath || null,
      appleReadinessMarketplaceCard: Boolean(directAppleCard),
      appleReadinessDistributionBundleId: appleBundle?.id || null,
      appleReadinessDistributionBundleCardPresent: Boolean(appleBundleCard),
      appleReadinessBundleMembershipCount: appleBundleMemberships.length,
      additionalCardAdded: false,
      additionalCardAddedScope: "Wave 2 follow-up added no source capability or marketplace card; current Apple distribution remains bundle-only.",
      currentDirectCardAdded: false,
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      writes: false,
      network: false,
      secrets: false,
      publicReleaseAllowed: false,
    },
    externalValidationGap: {
      status: "approval-required",
      reason: "The local SwiftPM test did not complete during the observed window, while xcodebuild is unavailable from the active developer directory. A longer controlled local or CI execution window must be explicitly approved and record a sanitized completed result before a runtime-oriented follow-up is reconsidered.",
      unblockCondition: "A bounded SwiftPM execution result with command, outcome, duration class, and no secret or machine-path disclosure is recorded, or a reviewed environment limitation is accepted.",
    },
    nonGoals: [
      "Adding a public card merely to increase marketplace counts.",
      "Treating the interrupted SwiftPM attempt as a successful build or test run.",
      "Changing the active Xcode developer directory, signing, provisioning, publishing, deploying, or running a simulator or device.",
      "Reading or mutating a personal marketplace, using a network, or granting write or secret permissions.",
    ],
    validation: [
      "swift package --package-path packages/seis_platform_swift describe --type json",
      "npm run check:seis-public-plugin-wave-2-follow-up-decision",
      "node --test plugins/seis-core/test/apple-native-follow-up-decision.test.mjs",
      "npm run check:seis-core-plugin-sources",
      "npm run check:seis-core-plugin-catalog",
      "npm run check:seis-core-plugin-matrix",
      "npm run check:seis-public-plugin-bundles",
      "npm run check:seis-repo-marketplace",
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this decision record and its program references on the feature branch; it adds no plugin source, public card, external state, or release state.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-2-follow-up-decision" && record.goalId === "SEIS-GOAL-021" && record.wave === 2 && record.round === 4, "decision identity is invalid");
  assert(record.status === "completed-no-additional-public-plugin-selected" && record.decision?.selectedCapability === null && record.decision?.outcome === "no-additional-public-plugin-selected" && list(record.decision?.overlapReview).length === 4, "no-follow-up decision is invalid");
  assert(record.swiftPmEvidence?.packageGraph?.manifestInspection === "completed-local-package-graph-inspection" && record.swiftPmEvidence?.packageGraph?.externalDependencyCount === 0 && list(record.swiftPmEvidence?.packageGraph?.products).join(",") === "SeisPlatformKit,SeisAppleNativeShell" && record.swiftPmEvidence?.packageGraph?.testTarget === "SeisPlatformKitTests", "SwiftPM package evidence is invalid");
  assert(record.swiftPmEvidence?.localToolingObservation?.swiftToolchain === "available-local-inspection-only" && record.swiftPmEvidence?.localToolingObservation?.xcodebuild === "unavailable-from-active-command-line-tools-directory" && record.swiftPmEvidence?.localToolingObservation?.packageDescribe === "completed-local-package-graph-inspection" && record.swiftPmEvidence?.localToolingObservation?.swiftTestState === "interrupted-after-no-output-observation-window" && record.swiftPmEvidence?.localToolingObservation?.swiftTestCompletionClaim === "not-completed-and-not-claimed" && record.swiftPmEvidence?.localToolingObservation?.buildCacheTracked === false && record.swiftPmEvidence?.localToolingObservation?.networkUsedByPackageGraph === false, "SwiftPM local tooling observation is invalid");
  assert(record.swiftPmEvidence?.validationBoundary?.compiledSwiftClaim === false && record.swiftPmEvidence?.validationBoundary?.testPassClaim === false && record.swiftPmEvidence?.validationBoundary?.nativeApplicationRunClaim === false && record.swiftPmEvidence?.validationBoundary?.simulatorOrDeviceClaim === false && record.swiftPmEvidence?.validationBoundary?.signingOrProvisioningClaim === false && record.swiftPmEvidence?.validationBoundary?.deploymentOrAppStoreClaim === false, "native validation boundary is invalid");
  assert(record.platformBoundary?.macOS === "primary-native-command-center" && record.platformBoundary?.iPadOS === "brain-review-and-creative-planning-surface" && record.platformBoundary?.iOS === "companion-surface" && record.platformBoundary?.visionOS === "research-only" && record.platformBoundary?.releaseReadiness === "not-asserted", "platform boundary is invalid");
  assert(record.historicalWave2Distribution?.applicationSourcePackageCount === HISTORICAL_WAVE_2_DISTRIBUTION.applicationSourcePackageCount && record.historicalWave2Distribution?.marketplaceCardCount === HISTORICAL_WAVE_2_DISTRIBUTION.marketplaceCardCount && record.historicalWave2Distribution?.directApplicationCardCount === HISTORICAL_WAVE_2_DISTRIBUTION.directApplicationCardCount && record.historicalWave2Distribution?.additionalDirectCardAddedByFollowUp === false, "historical Wave 2 follow-up distribution is invalid");
  assert(record.publicDistribution?.marketplaceName === "seis-repo" && record.publicDistribution?.marketplaceDisplayName === "SEIS Repo" && record.publicDistribution?.publicAudience === "everyone" && record.publicDistribution?.distributionMode === "curated-bounded-public-bundles" && record.publicDistribution?.separateMarketplaceCards === false, "public distribution mode boundary is invalid");
  assert(record.publicDistribution?.marketplaceCardCount === CURRENT_DISTRIBUTION.marketplaceCardCount && record.publicDistribution?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && record.publicDistribution?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.publicDistribution?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.publicDistribution?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "public marketplace card counts are invalid");
  assert(record.publicDistribution?.retainedSourceCapabilityCount === CURRENT_DISTRIBUTION.retainedSourceCapabilityCount && record.publicDistribution?.rootSourceCapabilityCount === CURRENT_DISTRIBUTION.rootSourceCapabilityCount && record.publicDistribution?.applicationSourceCapabilityCount === CURRENT_DISTRIBUTION.applicationSourceCapabilityCount && record.publicDistribution?.topicSourceCapabilityCount === CURRENT_DISTRIBUTION.topicSourceCapabilityCount, "public source capability counts are invalid");
  assert(record.publicDistribution?.appleReadinessSourcePath === `plugins/seis-core/${APPLE_PLUGIN_ID}` && record.publicDistribution?.appleReadinessMarketplaceCard === false && record.publicDistribution?.appleReadinessDistributionBundleId === APPLE_BUNDLE_ID && record.publicDistribution?.appleReadinessDistributionBundleCardPresent === true && record.publicDistribution?.appleReadinessBundleMembershipCount === 1 && record.publicDistribution?.additionalCardAdded === false && record.publicDistribution?.currentDirectCardAdded === false, "Apple readiness current bundle distribution is invalid");
  assert(record.publicDistribution?.personalMarketplaceRead === false && record.publicDistribution?.personalMarketplaceMutation === false && record.publicDistribution?.writes === false && record.publicDistribution?.network === false && record.publicDistribution?.secrets === false && record.publicDistribution?.publicReleaseAllowed === false, "public safety boundary is invalid");
  assert(record.externalValidationGap?.status === "approval-required" && typeof record.externalValidationGap?.unblockCondition === "string" && list(record.nonGoals).length === 4 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "gap or rollback record is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "decision must not contain a machine-specific path");
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 2 follow-up decision: ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 2 follow-up decision: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
