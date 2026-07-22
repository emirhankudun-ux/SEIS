#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";
import {
  SWIFT_CONCURRENCY_AUDIT_ID,
  SWIFT_CONCURRENCY_AUDIT_LIMITS,
  auditSwiftConcurrency,
} from "../plugins/seis-core/seis-swift-concurrency-audit/runtime/swift-concurrency-audit.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-swift-concurrency-audit.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const BUNDLE_CATALOG_PATH = "content/development/seis-public-plugin-bundle-catalog.json";
const DECISION_PATH = "content/development/seis-public-plugin-wave-3-capability-decision.json";
const RUNTIME_PATH = "plugins/seis-core/seis-swift-concurrency-audit/runtime/swift-concurrency-audit.mjs";
const TEST_PATH = "plugins/seis-core/test/swift-concurrency-audit.test.mjs";
const SKILL_PATH = "plugins/seis-core/seis-swift-concurrency-audit/skills/seis-swift-concurrency-audit/SKILL.md";
const DISTRIBUTION_BUNDLE_ID = "seis-application-bundle-06";
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
const HISTORICAL_WAVE_3_DISTRIBUTION = Object.freeze({
  applicationSourcePackageCount: 73,
  directApplicationCardCount: 73,
  publicCardCount: 379,
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-swift-concurrency-audit`);
    process.exit(1);
  }
  console.log("SEIS Swift concurrency audit evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with ${record.audit.scannedSwiftFileCount} bounded Swift files.`);
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const bundleCatalog = readJson(BUNDLE_CATALOG_PATH);
  const decision = readJson(DECISION_PATH);
  assertCurrentInventory(sourceManifest, marketplace, bundleCatalog);
  const plugin = list(sourceManifest.plugins).find((entry) => entry?.name === SWIFT_CONCURRENCY_AUDIT_ID);
  const directMarketplaceEntry = list(marketplace.plugins).find((entry) => entry?.name === SWIFT_CONCURRENCY_AUDIT_ID) || null;
  const bundleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(SWIFT_CONCURRENCY_AUDIT_ID));
  const distributionBundle = bundleMemberships.length === 1 ? bundleMemberships[0] : null;
  const distributionBundleEntry = list(marketplace.plugins).find((entry) => entry?.name === distributionBundle?.id) || null;
  const currentMarketplaceProjection = buildCurrentMarketplaceProjection({
    sourceManifest,
    marketplace,
    bundleCatalog,
    plugin,
    directMarketplaceEntry,
    distributionBundle,
    distributionBundleEntry,
    bundleMembershipCount: bundleMemberships.length,
  });
  const audit = auditSwiftConcurrency(ROOT);
  const runtimeSource = readText(RUNTIME_PATH);
  const testSource = readText(TEST_PATH);
  const skillSource = readText(SKILL_PATH);
  const machineMarker = list(audit.findings).find((finding) => finding?.code === "machine-path-marker-redacted");
  const credentialMarker = list(audit.findings).find((finding) => finding?.code === "credential-assignment-marker-found");
  const record = {
    schemaVersion: 2,
    id: SWIFT_CONCURRENCY_AUDIT_ID,
    goalId: "SEIS-GOAL-021",
    generatedAt: "2026-07-21",
    status: "attention-public-static-concurrency-evidence",
    purpose: "Record bounded, read-only Swift concurrency static signals without claiming compiler diagnostics, Sendable or actor correctness, data-race freedom, SwiftPM test completion, native runtime, signing, deployment, provider, or release outcomes.",
    plugin: {
      name: plugin?.name || null,
      sourcePath: plugin?.sourcePath || null,
      version: plugin?.version || null,
      releaseTrainVersion: plugin?.releaseTrainVersion || null,
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      publicAudience: "everyone",
      publicMarketplace: distributionBundleEntry?.source?.path === distributionBundle?.sourcePath,
      directMarketplaceCard: directMarketplaceEntry !== null,
      distributionBundleId: distributionBundle?.id || null,
      distributionBundleSourcePath: distributionBundle?.sourcePath || null,
      distributionBundleMembershipCount: bundleMemberships.length,
    },
    marketplace: currentMarketplaceProjection,
    currentMarketplaceProjection,
    historicalWave3Snapshot: {
      classification: "immutable-wave-3-direct-card-evidence-snapshot",
      projectionModel: "direct-source-package-marketplace-cards",
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      ...HISTORICAL_WAVE_3_DISTRIBUTION,
      selectedCapability: SWIFT_CONCURRENCY_AUDIT_ID,
      selectedCapabilityHadDirectMarketplaceCard: true,
      additionalDirectCardAddedAtExecution: true,
      current: false,
      immutableHistoricalEvidence: true,
      note: "These counts and direct-card facts are immutable Wave 3 execution history and do not describe the current curated marketplace.",
    },
    decision: {
      id: decision.id || null,
      status: decision.status || null,
      selectedCapability: decision.decision?.selectedCapability || null,
      implementationStarted: decision.decision?.implementationStarted === true,
      historicalAdditionalDirectCardAddedAtExecution: decision.decision?.historicalAdditionalDirectCardAddedAtExecution === true,
      currentDirectMarketplaceCard: directMarketplaceEntry !== null,
      currentDistributionBundleId: distributionBundle?.id || null,
      currentDistributionBundleMembershipCount: bundleMemberships.length,
    },
    audit: {
      state: audit.state,
      ok: audit.ok,
      mode: audit.mode,
      classification: audit.classification,
      scannedSwiftFileCount: audit.summary?.scannedSwiftFileCount || 0,
      boundedSwiftByteCount: audit.summary?.boundedSwiftByteCount || 0,
      maxFileBytesObserved: audit.summary?.maxFileBytesObserved || 0,
      maxRelativeDepthObserved: audit.summary?.maxRelativeDepthObserved || 0,
      sourceRootCount: list(audit.summary?.sourceRoots).length,
      sourceRootStates: list(audit.summary?.sourceRoots).map((sourceRoot) => ({ id: sourceRoot.id, safe: sourceRoot.safe === true })),
      signalCounts: audit.summary?.signalCounts || {},
      reportedPathCounts: Object.fromEntries(Object.entries(audit.signals || {}).map(([name, signal]) => [name, list(signal?.relativePaths).length])),
      findingCodes: list(audit.findings).map((finding) => finding?.code).filter(Boolean).sort(),
      reviewRequired: audit.summary?.reviewRequired === true,
      blockingFindingCount: audit.summary?.blockingFindingCount || 0,
    },
    resilienceReview: buildResilienceReview(runtimeSource, testSource, skillSource),
    safety: {
      read: audit.permissions?.read || [],
      write: [],
      network: [],
      secrets: [],
      compilesSwift: false,
      runsSwiftTests: false,
      startsNativeApplication: false,
      signsArtifacts: false,
      installsPlugins: false,
      publicReleaseAllowed: false,
    },
    limitations: audit.limitations,
    inputSafety: {
      machineSpecificPathMarkerCount: machineMarker?.count || 0,
      credentialAssignmentFindingCount: credentialMarker?.count || 0,
      rawSourceReturned: false,
      rawMatchedValuesReturned: false,
      sourceFilesCompiled: false,
    },
    validation: [
      "node plugins/seis-core/seis-swift-concurrency-audit/scripts/seis-swift-concurrency-audit-mcp-server.mjs --status",
      "node plugins/seis-core/seis-swift-concurrency-audit/scripts/seis-swift-concurrency-audit-mcp-server.mjs --audit --path .",
      "node plugins/seis-core/seis-swift-concurrency-audit/scripts/seis-swift-concurrency-audit-mcp-server.mjs --evidence",
      "node --test plugins/seis-core/test/swift-concurrency-audit.test.mjs",
      "npm run check:seis-swift-concurrency-audit",
    ],
    publicBoundary: {
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      publicReleaseAllowed: false,
    },
  };
  validateRecord(record);
  return record;
}

function buildCurrentMarketplaceProjection({ sourceManifest, marketplace, bundleCatalog, plugin, directMarketplaceEntry, distributionBundle, distributionBundleEntry, bundleMembershipCount }) {
  const sourceEntries = list(sourceManifest.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  assert(marketplace.name === "seis-repo" && marketplace.interface?.displayName === "SEIS Repo", "current marketplace identity is invalid");
  assert(sourceManifest.publicDistribution?.distributionMode === "curated-bounded-public-bundles" && sourceManifest.publicDistribution?.separateMarketplaceCards === false, "current source distribution mode is invalid");
  assert(sourceEntries.length === CURRENT_DISTRIBUTION.applicationSourcePackageCount && marketplaceEntries.length === CURRENT_DISTRIBUTION.publicCardCount, "current source or marketplace count is invalid");
  assert(bundleCatalog.marketplace?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && bundleCatalog.marketplace?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && bundleCatalog.marketplace?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && bundleCatalog.marketplace?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && bundleCatalog.marketplace?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current bundle-card inventory is invalid");
  assert(bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && bundleCatalog.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.sourcePackagesDeleted === false, "current retained-source inventory is invalid");
  assert(plugin?.sourcePath === `plugins/seis-core/${SWIFT_CONCURRENCY_AUDIT_ID}` && directMarketplaceEntry === null, "current concurrency capability must remain a retained source without a direct card");
  assert(distributionBundle?.id === DISTRIBUTION_BUNDLE_ID && distributionBundle?.family === "application" && distributionBundle?.sourcePath === `./plugins/seis-bundles/${DISTRIBUTION_BUNDLE_ID}` && bundleMembershipCount === 1, "current concurrency bundle membership is invalid");
  assert(distributionBundleEntry?.source?.path === distributionBundle.sourcePath, "current concurrency bundle card is invalid");
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
    directSourceCapabilityCardCount: 0,
    sourceCapabilityInventory: {
      rootSourceModuleCount: bundleCatalog.sourceCapabilityInventory.rootSourceModuleCount,
      applicationSourcePackageCount: sourceEntries.length,
      topicSourcePackageCount: bundleCatalog.sourceCapabilityInventory.topicSourcePackageCount,
      retainedSourcePackageCount: bundleCatalog.sourceCapabilityInventory.retainedSourcePackageCount,
      sourcePackagesDeleted: false,
    },
    selectedApplicationCapability: {
      id: SWIFT_CONCURRENCY_AUDIT_ID,
      retainedSource: true,
      sourcePath: plugin.sourcePath,
      directMarketplaceCardRequired: false,
      directMarketplaceCardCount: 0,
      bundleCardCount: 1,
      bundleId: distributionBundle.id,
      bundleSourcePath: distributionBundle.sourcePath,
      bundleFamily: distributionBundle.family,
    },
  };
}

function buildResilienceReview(runtimeSource, testSource, skillSource) {
  const requiredRuntimeMarkers = [
    "swift-source-symlink-refused",
    "swift-source-file-limit-exceeded",
    "swift-source-file-size-limit-exceeded",
    "swift-source-total-byte-limit-exceeded",
    "swift-source-depth-limit-exceeded",
    "credential-assignment-marker-found",
    "maximumReportedPathsPerSignal",
  ];
  const requiredTestMarkers = [
    "refuses source trees beyond the declared depth without returning raw source",
    "refuses a direct source-area symlink without following it",
    "refuses oversized Swift source before reading it",
    "refuses Swift source file counts above the declared limit",
    "refuses aggregate Swift source bytes above the declared limit",
    "refuses an exact credential-assignment marker without returning its value",
    "serves bounded MCP responses and refuses an arbitrary audit path",
  ];
  const requiredSkillMarker = "never returns raw Swift source";
  assert(requiredRuntimeMarkers.every((marker) => runtimeSource.includes(marker)), "runtime resilience markers are missing");
  assert(requiredTestMarkers.every((marker) => testSource.includes(marker)), "resilience regression fixtures are missing");
  assert(skillSource.includes(requiredSkillMarker), "resilience limitation documentation is missing");
  return {
    status: "completed-repository-local-resilience-review",
    limits: SWIFT_CONCURRENCY_AUDIT_LIMITS,
    limitReachedState: "attention",
    coveredFailureModes: [
      "source-depth-limit",
      "source-file-count-limit",
      "source-file-size-limit",
      "source-total-byte-limit",
      "source-symlink",
      "credential-assignment-marker",
      "MCP-arbitrary-audit-path",
    ],
    outputBoundary: {
      rawSourceReturned: false,
      rawMatchedValuesReturned: false,
      machineSpecificPathReturned: false,
      network: false,
      writes: false,
      secrets: false,
    },
    nativeExecution: "not-run-and-not-claimed",
  };
}

function validateRecord(record) {
  assert(record.id === SWIFT_CONCURRENCY_AUDIT_ID && record.goalId === "SEIS-GOAL-021", "record identity is invalid");
  assert(record.status === "attention-public-static-concurrency-evidence", "record status is invalid");
  assert(record.plugin?.name === SWIFT_CONCURRENCY_AUDIT_ID && record.plugin?.sourcePath === `plugins/seis-core/${SWIFT_CONCURRENCY_AUDIT_ID}`, "plugin source contract is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo" && record.plugin?.marketplaceDisplayName === "SEIS Repo" && record.plugin?.publicMarketplace === true && record.plugin?.directMarketplaceCard === false && record.plugin?.distributionBundleId === DISTRIBUTION_BUNDLE_ID && record.plugin?.distributionBundleSourcePath === `./plugins/seis-bundles/${DISTRIBUTION_BUNDLE_ID}` && record.plugin?.distributionBundleMembershipCount === 1, "public marketplace contract is invalid");
  assert(JSON.stringify(record.marketplace) === JSON.stringify(record.currentMarketplaceProjection), "MCP marketplace compatibility projection is stale");
  assert(record.currentMarketplaceProjection?.projectionModel === "curated-bundle-cards" && record.currentMarketplaceProjection?.distributionMode === "curated-bounded-public-bundles" && record.currentMarketplaceProjection?.marketplaceName === "seis-repo" && record.currentMarketplaceProjection?.marketplaceDisplayName === "SEIS Repo" && record.currentMarketplaceProjection?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && record.currentMarketplaceProjection?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && record.currentMarketplaceProjection?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.currentMarketplaceProjection?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.currentMarketplaceProjection?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount && record.currentMarketplaceProjection?.directSourceCapabilityCardCount === 0, "current curated marketplace card contract is invalid");
  assert(record.currentMarketplaceProjection?.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.applicationSourcePackageCount === APP_PLUGIN_EXPANSION_TARGET && record.currentMarketplaceProjection?.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.sourcePackagesDeleted === false, "current retained-source contract is invalid");
  assert(record.currentMarketplaceProjection?.selectedApplicationCapability?.id === SWIFT_CONCURRENCY_AUDIT_ID && record.currentMarketplaceProjection?.selectedApplicationCapability?.retainedSource === true && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardRequired === false && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardCount === 0 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleId === DISTRIBUTION_BUNDLE_ID && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleFamily === "application", "current concurrency bundle projection is invalid");
  assert(record.historicalWave3Snapshot?.classification === "immutable-wave-3-direct-card-evidence-snapshot" && record.historicalWave3Snapshot?.projectionModel === "direct-source-package-marketplace-cards" && record.historicalWave3Snapshot?.applicationSourcePackageCount === HISTORICAL_WAVE_3_DISTRIBUTION.applicationSourcePackageCount && record.historicalWave3Snapshot?.directApplicationCardCount === HISTORICAL_WAVE_3_DISTRIBUTION.directApplicationCardCount && record.historicalWave3Snapshot?.publicCardCount === HISTORICAL_WAVE_3_DISTRIBUTION.publicCardCount && record.historicalWave3Snapshot?.selectedCapability === SWIFT_CONCURRENCY_AUDIT_ID && record.historicalWave3Snapshot?.selectedCapabilityHadDirectMarketplaceCard === true && record.historicalWave3Snapshot?.additionalDirectCardAddedAtExecution === true && record.historicalWave3Snapshot?.current === false && record.historicalWave3Snapshot?.immutableHistoricalEvidence === true, "historical Wave 3 snapshot is invalid");
  assert(record.decision?.id === "seis-public-plugin-wave-3-capability-decision" && record.decision?.selectedCapability === SWIFT_CONCURRENCY_AUDIT_ID && record.decision?.implementationStarted === true && record.decision?.historicalAdditionalDirectCardAddedAtExecution === true && record.decision?.currentDirectMarketplaceCard === false && record.decision?.currentDistributionBundleId === DISTRIBUTION_BUNDLE_ID && record.decision?.currentDistributionBundleMembershipCount === 1, "Wave 3 decision linkage is invalid");
  assert(record.audit?.state === "attention" && record.audit?.ok === true && record.audit?.classification === "bounded-static-concurrency-signals-only" && record.audit?.sourceRootCount === 2 && record.audit?.scannedSwiftFileCount > 0 && record.audit?.blockingFindingCount === 0, "static concurrency audit is invalid");
  assert((record.audit?.signalCounts?.uncheckedSendable || 0) > 0 && (record.audit?.signalCounts?.sendableDeclaration || 0) > 0 && list(record.audit?.findingCodes).includes("unchecked-sendable-review-required"), "expected static review signals are missing");
  assert(record.resilienceReview?.status === "completed-repository-local-resilience-review" && record.resilienceReview?.limits?.maxSwiftFiles === SWIFT_CONCURRENCY_AUDIT_LIMITS.maxSwiftFiles && list(record.resilienceReview?.coveredFailureModes).length === 7, "resilience review is invalid");
  assert(record.safety?.write?.length === 0 && record.safety?.network?.length === 0 && record.safety?.secrets?.length === 0 && record.safety?.compilesSwift === false && record.safety?.runsSwiftTests === false && record.safety?.startsNativeApplication === false && record.safety?.signsArtifacts === false && record.safety?.installsPlugins === false && record.safety?.publicReleaseAllowed === false, "native execution boundary is invalid");
  assert(record.inputSafety?.credentialAssignmentFindingCount === 0 && record.inputSafety?.rawSourceReturned === false && record.inputSafety?.rawMatchedValuesReturned === false && record.inputSafety?.sourceFilesCompiled === false, "input safety record is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "record must not contain a machine-specific path");
}

function assertCurrentInventory(sourceManifest, marketplace, bundleCatalog) {
  const applicationPluginCount = list(sourceManifest?.plugins).length;
  const publicCardCount = list(marketplace?.plugins).length;
  const currentBundleMembers = list(bundleCatalog?.bundles).flatMap((bundle) => list(bundle?.memberNames));
  const selectedMembershipCount = currentBundleMembers.filter((name) => name === SWIFT_CONCURRENCY_AUDIT_ID).length;
  const directApplicationCardCount = list(marketplace?.plugins).filter((entry) => entry?.source?.path?.startsWith("./plugins/seis-core/")).length;
  assert(applicationPluginCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && selectedMembershipCount === 1 && directApplicationCardCount === 0, "current inventory must retain all application sources with exact-once curated bundle coverage and no direct app cards");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS Swift concurrency audit evidence: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS Swift concurrency audit evidence: ${message}`);
}
