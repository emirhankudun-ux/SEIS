#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-round-3-checkpoint.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const BUNDLE_CATALOG_PATH = "content/development/seis-public-plugin-bundle-catalog.json";
const MATRIX_PATH = "content/development/seis-core-plugin-matrix.json";
const DECISION_PATH = "content/development/seis-public-plugin-wave-3-capability-decision.json";
const AUDIT_PATH = "content/development/seis-swift-concurrency-audit.json";
const MCP_PERMISSION_PATH = "content/development/seis-mcp-permission-risk-matrix.json";
const LIFECYCLE_PATH = "content/development/seis-public-plugin-lifecycle.json";
const EXTERNAL_PROOF_PATH = "content/development/seis-public-plugin-external-install-proof.json";
const PACKAGE_PATH = "plugins/seis-core/seis-swift-concurrency-audit";
const CAPABILITY = "seis-swift-concurrency-audit";
const DISTRIBUTION_BUNDLE_ID = "seis-application-bundle-06";
const CHECKPOINT_COMMIT = "d6bfaab79ec26451d8ef9ca1c9556c5cb689f186";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const HISTORICAL_INVENTORY = Object.freeze({ applicationPluginCount: 73, marketplaceCardCount: 379, matrixPluginCount: 73, matrixReadyCount: 70, matrixAttentionCount: 3 });
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
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-3-round-3-checkpoint");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 round 3 checkpoint check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " with steps 47-60 reconciled.");
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const bundleCatalog = readJson(BUNDLE_CATALOG_PATH);
  const matrix = readJson(MATRIX_PATH);
  const decision = readJson(DECISION_PATH);
  const audit = readJson(AUDIT_PATH);
  const mcpPermission = readJson(MCP_PERMISSION_PATH);
  const lifecycle = readJson(LIFECYCLE_PATH);
  const externalProof = readJson(EXTERNAL_PROOF_PATH);
  const sourceEntry = list(sourceManifest.plugins).find((entry) => entry?.name === CAPABILITY);
  const marketplaceEntry = list(marketplace.plugins).find((entry) => entry?.name === CAPABILITY);
  const matrixEntry = list(matrix.plugins).find((entry) => entry?.name === CAPABILITY);
  const mcpEntry = list(mcpPermission.records).find((entry) => entry?.name === CAPABILITY);
  const bundleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(CAPABILITY));
  const distributionBundle = bundleMemberships.length === 1 ? bundleMemberships[0] : null;
  const distributionBundleCard = list(marketplace.plugins).find((entry) => entry?.name === distributionBundle?.id) || null;
  assertCurrentInventory(sourceManifest, marketplace, matrix);
  const currentMarketplaceProjection = buildCurrentMarketplaceProjection({ sourceManifest, marketplace, bundleCatalog, sourceEntry, marketplaceEntry, distributionBundle, distributionBundleCard, bundleMembershipCount: bundleMemberships.length });
  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-3-round-3-checkpoint",
    goalId: "SEIS-GOAL-021",
    wave: 3,
    round: 3,
    status: "completed-repository-local-checkpoint",
    generatedAt: "2026-07-21",
    purpose: "Reconcile the completed public SEIS Repo implementation and integration steps for the bounded Swift concurrency audit without converting repository-local evidence into an installation, native-runtime, provider, deployment, or release claim.",
    completedSteps: range(47, 60),
    selectedCapability: {
      id: decision.decision?.selectedCapability || null,
      implementationStarted: decision.decision?.implementationStarted === true,
      historicalAdditionalDirectCardAddedAtExecution: decision.decision?.historicalAdditionalDirectCardAddedAtExecution === true,
      packagePresent: fs.existsSync(path.join(ROOT, PACKAGE_PATH)),
    },
    historicalWave3Distribution: {
      classification: "immutable-wave-3-round-3-direct-card-snapshot",
      projectionModel: "direct-source-package-marketplace-cards",
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      marketplaceCardPresentAtCheckpoint: true,
      applicationPluginCount: HISTORICAL_INVENTORY.applicationPluginCount,
      marketplaceCardCount: HISTORICAL_INVENTORY.marketplaceCardCount,
      matrixPluginCount: HISTORICAL_INVENTORY.matrixPluginCount,
      matrixReadyCount: HISTORICAL_INVENTORY.matrixReadyCount,
      matrixAttentionCount: HISTORICAL_INVENTORY.matrixAttentionCount,
      selectedCapability: CAPABILITY,
      selectedCapabilityHadDirectMarketplaceCard: true,
      additionalDirectCardAddedAtExecution: true,
      note: "These counts and direct-card facts are immutable Wave 3 round 3 history and do not describe the current curated marketplace.",
    },
    currentMarketplaceProjection,
    localEvidence: {
      staticAuditPath: AUDIT_PATH,
      staticAuditStatus: audit.status || null,
      staticAuditOk: audit.audit?.ok === true,
      staticAuditState: audit.audit?.state || null,
      staticAuditBlockingFindingCount: audit.audit?.blockingFindingCount || 0,
      sourceManifestRegistered: sourceEntry?.sourcePath === PACKAGE_PATH,
      matrixStatus: matrixEntry?.status || null,
      matrixOk: matrixEntry?.ok === true,
      publicReleaseAllowed: audit.safety?.publicReleaseAllowed === true,
    },
    permissions: {
      write: list(mcpEntry?.permissions?.write),
      network: list(mcpEntry?.permissions?.network),
      secrets: list(mcpEntry?.permissions?.secrets),
      transport: mcpEntry?.transport || null,
      remoteEndpointDeclared: mcpEntry?.remoteEndpointDeclared === true,
      environmentInjectionDeclared: mcpEntry?.environmentInjectionDeclared === true,
    },
    lifecycle: {
      status: lifecycle.status || null,
      publicReleaseAllowed: lifecycle.externalInstallProofSummary?.publicReleaseAllowed === true,
      externalProofStatus: externalProof.status || null,
      externalProofReleaseAllowed: externalProof.publicReleaseAllowed === true,
      freshTaskReloadEvidence: lifecycle.freshTaskReloadEvidence || null,
    },
    delivery: {
      commit: CHECKPOINT_COMMIT,
      branch: FEATURE_BRANCH,
      remoteReference: "refs/heads/plugins/seis-plugin-root-20260715",
      featureBranchOnly: true,
      protectedDefaultBranchWritten: false,
      remoteReferenceVerified: true,
    },
    validation: [
      "npm run check:seis-swift-concurrency-audit",
      "node --test plugins/seis-core/test/swift-concurrency-audit.test.mjs",
      "node --test plugins/seis-core/test/swift-concurrency-audit-evidence.test.mjs",
      "npm run check:seis-repo-marketplace",
      "npm run seis:check",
      "git diff --check",
    ],
    externalGaps: [
      "Swift compilation, SwiftPM test completion, and native runtime behavior are not run or claimed by this checkpoint.",
      "Independent fresh-task reload and independent installation evidence remain external release gates.",
      "No provider, deployment, signing, marketplace publication, or public release was performed.",
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused feature-branch package, historical direct-card evidence, current bundle reconciliation, generated records, and checkpoint references; no external state or data migration exists.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function buildCurrentMarketplaceProjection({ sourceManifest, marketplace, bundleCatalog, sourceEntry, marketplaceEntry, distributionBundle, distributionBundleCard, bundleMembershipCount }) {
  const sourceEntries = list(sourceManifest.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  assert(marketplace.name === "seis-repo" && marketplace.interface?.displayName === "SEIS Repo", "current marketplace identity is invalid");
  assert(sourceManifest.publicDistribution?.distributionMode === "curated-bounded-public-bundles" && sourceManifest.publicDistribution?.separateMarketplaceCards === false, "current source distribution mode is invalid");
  assert(sourceEntries.length === CURRENT_DISTRIBUTION.applicationSourcePackageCount && marketplaceEntries.length === CURRENT_DISTRIBUTION.publicCardCount, "current source or marketplace count is invalid");
  assert(bundleCatalog.marketplace?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && bundleCatalog.marketplace?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && bundleCatalog.marketplace?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && bundleCatalog.marketplace?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && bundleCatalog.marketplace?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current bundle-card inventory is invalid");
  assert(bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && bundleCatalog.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.sourcePackagesDeleted === false, "current retained-source inventory is invalid");
  assert(sourceEntry?.sourcePath === PACKAGE_PATH && marketplaceEntry === undefined, "current selected capability must remain a retained source without a direct card");
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
  assert(record.id === "seis-public-plugin-wave-3-round-3-checkpoint" && record.goalId === "SEIS-GOAL-021" && record.wave === 3 && record.round === 3, "checkpoint identity is invalid");
  assert(record.status === "completed-repository-local-checkpoint" && list(record.completedSteps).join(",") === range(47, 60).join(","), "completed step range is invalid");
  assert(record.selectedCapability?.id === CAPABILITY && record.selectedCapability?.implementationStarted === true && record.selectedCapability?.historicalAdditionalDirectCardAddedAtExecution === true && record.selectedCapability?.packagePresent === true, "selected capability evidence is invalid");
  assert(record.historicalWave3Distribution?.classification === "immutable-wave-3-round-3-direct-card-snapshot" && record.historicalWave3Distribution?.projectionModel === "direct-source-package-marketplace-cards" && record.historicalWave3Distribution?.marketplaceName === "seis-repo" && record.historicalWave3Distribution?.marketplaceDisplayName === "SEIS Repo" && record.historicalWave3Distribution?.marketplaceCardPresentAtCheckpoint === true, "historical Wave 3 distribution identity is invalid");
  assert(record.historicalWave3Distribution?.applicationPluginCount === HISTORICAL_INVENTORY.applicationPluginCount && record.historicalWave3Distribution?.marketplaceCardCount === HISTORICAL_INVENTORY.marketplaceCardCount && record.historicalWave3Distribution?.matrixPluginCount === HISTORICAL_INVENTORY.matrixPluginCount && record.historicalWave3Distribution?.matrixReadyCount === HISTORICAL_INVENTORY.matrixReadyCount && record.historicalWave3Distribution?.matrixAttentionCount === HISTORICAL_INVENTORY.matrixAttentionCount && record.historicalWave3Distribution?.selectedCapability === CAPABILITY && record.historicalWave3Distribution?.selectedCapabilityHadDirectMarketplaceCard === true && record.historicalWave3Distribution?.additionalDirectCardAddedAtExecution === true, "historical Wave 3 counts are invalid");
  assert(record.currentMarketplaceProjection?.projectionModel === "curated-bundle-cards" && record.currentMarketplaceProjection?.distributionMode === "curated-bounded-public-bundles" && record.currentMarketplaceProjection?.marketplaceName === "seis-repo" && record.currentMarketplaceProjection?.marketplaceDisplayName === "SEIS Repo" && record.currentMarketplaceProjection?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && record.currentMarketplaceProjection?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && record.currentMarketplaceProjection?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.currentMarketplaceProjection?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.currentMarketplaceProjection?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current marketplace card projection is invalid");
  assert(record.currentMarketplaceProjection?.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && record.currentMarketplaceProjection?.selectedApplicationCapability?.id === CAPABILITY && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardRequired === false && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardCount === 0 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleId === DISTRIBUTION_BUNDLE_ID, "current retained-source or selected-capability projection is invalid");
  assert(record.localEvidence?.staticAuditStatus === "attention-public-static-concurrency-evidence" && record.localEvidence?.staticAuditOk === true && record.localEvidence?.staticAuditState === "attention" && record.localEvidence?.staticAuditBlockingFindingCount === 0 && record.localEvidence?.sourceManifestRegistered === true && record.localEvidence?.matrixStatus === "attention" && record.localEvidence?.matrixOk === true && record.localEvidence?.publicReleaseAllowed === false, "local static evidence is invalid");
  assert(record.permissions?.write?.length === 0 && record.permissions?.network?.length === 0 && record.permissions?.secrets?.length === 0 && record.permissions?.transport === "local-stdio" && record.permissions?.remoteEndpointDeclared === false && record.permissions?.environmentInjectionDeclared === false, "permission boundary is invalid");
  assert(record.lifecycle?.publicReleaseAllowed === false && record.lifecycle?.externalProofReleaseAllowed === false && record.delivery?.commit === CHECKPOINT_COMMIT && record.delivery?.branch === FEATURE_BRANCH && record.delivery?.featureBranchOnly === true && record.delivery?.protectedDefaultBranchWritten === false && record.delivery?.remoteReferenceVerified === true, "lifecycle or delivery boundary is invalid");
  assert(record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false && list(record.externalGaps).length === 3, "rollback or external gap record is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "checkpoint must not contain a machine-specific path");
}

function assertCurrentInventory(sourceManifest, marketplace, matrix) {
  const applicationPluginCount = list(sourceManifest.plugins).length;
  const marketplaceCardCount = list(marketplace.plugins).length;
  const matrixPluginCount = matrix.pluginCount || 0;
  assert(applicationPluginCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && marketplaceCardCount === CURRENT_DISTRIBUTION.publicCardCount && matrixPluginCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && matrix.failureCount === 0, "current inventory must match the curated public-package projection");
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 3 round 3 checkpoint: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 round 3 checkpoint: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
