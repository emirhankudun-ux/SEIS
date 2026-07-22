#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-integration-checkpoint.json";
const CAPABILITY = "seis-swift-package-topology";
const SOURCE_PATH = "plugins/seis-core/seis-swift-package-topology";
const DISTRIBUTION_BUNDLE_ID = "seis-application-bundle-06";
const HISTORICAL_WAVE_4_DISTRIBUTION = Object.freeze({ applicationPluginCount: 74, catalogPluginCount: 74, matrixPluginCount: 74, publicCardCount: 380 });
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
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  marketplace: ".agents/plugins/marketplace.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  topologyEvidence: "content/development/seis-swift-package-topology.json",
  permissionMatrix: "content/development/seis-mcp-permission-risk-matrix.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  installState: "content/development/seis-public-install-state.json",
  installEvidence: "content/development/seis-public-install-evidence.json",
  runtimeStatus: "content/development/seis-public-runtime-status.json",
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-integration-checkpoint");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 integration checkpoint check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 4 steps 74-80.");
}

function buildRecord() {
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const topologyEvidence = readJson(PATHS.topologyEvidence);
  const permissionMatrix = readJson(PATHS.permissionMatrix);
  const lifecycle = readJson(PATHS.lifecycle);
  const installState = readJson(PATHS.installState);
  const installEvidence = readJson(PATHS.installEvidence);
  const runtimeStatus = readJson(PATHS.runtimeStatus);
  const securityReview = readJson(PATHS.securityReview);
  const sourceEntry = exactOne(sourceManifest.plugins, CAPABILITY, "source manifest");
  const catalogEntry = exactOne(catalog.plugins, CAPABILITY, "catalog");
  const matrixEntry = exactOne(matrix.plugins, CAPABILITY, "matrix");
  const directMarketplaceEntry = list(marketplace.plugins).find((entry) => entry?.name === CAPABILITY) || null;
  const bundleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(CAPABILITY));
  const distributionBundle = bundleMemberships.length === 1 ? bundleMemberships[0] : null;
  const distributionBundleCard = list(marketplace.plugins).find((entry) => entry?.name === distributionBundle?.id) || null;
  const permissionEntry = exactOne(permissionMatrix.records, CAPABILITY, "permission matrix");
  assertSupportedCurrentInventory(sourceManifest, catalog, matrix, marketplace);
  const currentMarketplaceProjection = buildCurrentMarketplaceProjection({ sourceManifest, marketplace, bundleCatalog, sourceEntry, directMarketplaceEntry, distributionBundle, distributionBundleCard, bundleMembershipCount: bundleMemberships.length });
  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-4-integration-checkpoint",
    goalId: "SEIS-GOAL-021",
    wave: 4,
    round: 4,
    status: "completed-repository-local-integration-checkpoint",
    maturity: "prototype",
    generatedAt: "2026-07-21",
    purpose: "Record the completed public-repository integration steps for one bounded static Swift Package topology plugin. This checkpoint preserves the historical direct-card integration while reconciling the retained source through one current curated bundle card, generated evidence, and deny-by-default permissions without treating repository-local checks as independent installation, SwiftPM, compiler, runtime, provider, deployment, signing, or public-release proof.",
    completedSteps: range(74, 80),
    capability: {
      id: CAPABILITY,
      sourceDirectoryPresent: fs.existsSync(path.join(ROOT, SOURCE_PATH)),
      fixedManifestPath: "packages/seis_platform_swift/Package.swift",
      staticOnly: true,
      sourceManifestRegistered: sourceEntry?.sourcePath === SOURCE_PATH,
      catalogRegistered: catalogEntry?.sourcePath === SOURCE_PATH,
      matrixRegistered: matrixEntry?.status === "ready" && matrixEntry?.ok === true,
      currentSourceRetained: sourceEntry?.sourcePath === SOURCE_PATH,
      currentDirectMarketplaceCard: directMarketplaceEntry !== null,
      currentDirectMarketplaceCardCount: directMarketplaceEntry === null ? 0 : 1,
      currentDistributionBundleId: distributionBundle?.id || null,
      currentDistributionBundleSourcePath: distributionBundle?.sourcePath || null,
      currentDistributionBundleCardPresent: distributionBundleCard !== null,
      currentDistributionBundleMembershipCount: bundleMemberships.length,
    },
    historicalWave4Distribution: {
      classification: "immutable-wave-4-direct-card-integration-snapshot",
      projectionModel: "direct-source-package-marketplace-cards",
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      ...HISTORICAL_WAVE_4_DISTRIBUTION,
      selectedCapability: CAPABILITY,
      selectedCapabilityHadDirectMarketplaceCard: true,
      marketplaceCardRegisteredAtCheckpoint: true,
      marketplaceCategoryAtCheckpoint: "Developer",
      installationPolicyAtCheckpoint: "AVAILABLE",
      authenticationPolicyAtCheckpoint: "ON_INSTALL",
      note: "These counts and direct-card facts are immutable Wave 4 integration history and do not describe the current curated marketplace.",
    },
    currentRegistryReconciliation: {
      applicationSourceManifestCount: list(sourceManifest.plugins).length,
      applicationCatalogCount: catalog.counts?.discovered || 0,
      applicationMatrixCount: matrix.pluginCount || 0,
      matrixFailureCount: matrix.failureCount || 0,
    },
    currentMarketplaceProjection,
    topologyEvidence: {
      path: PATHS.topologyEvidence,
      status: topologyEvidence.status || null,
      auditOk: topologyEvidence.audit?.ok === true,
      auditState: topologyEvidence.audit?.state || null,
      declaredPlatformCount: topologyEvidence.audit?.declaredPlatformCount || 0,
      productCount: topologyEvidence.audit?.productCount || 0,
      targetCount: topologyEvidence.audit?.targetCount || 0,
      targetDependencyEdgeCount: topologyEvidence.audit?.targetDependencyEdgeCount || 0,
      testTargetDependencyCount: topologyEvidence.audit?.testTargetDependencyCount || 0,
      executableResourceCount: topologyEvidence.audit?.executableResourceCount || 0,
      staticOnlyClaims: {
        compilesSwift: topologyEvidence.safety?.compilesSwift === true,
        runsSwiftTests: topologyEvidence.safety?.runsSwiftTests === true,
        startsNativeApplication: topologyEvidence.safety?.startsNativeApplication === true,
        publicReleaseAllowed: topologyEvidence.safety?.publicReleaseAllowed === true,
      },
    },
    permissions: {
      transport: permissionEntry?.transport || null,
      permissionState: permissionEntry?.permissionState || null,
      write: list(permissionEntry?.permissions?.write),
      network: list(permissionEntry?.permissions?.network),
      secrets: list(permissionEntry?.permissions?.secrets),
      remoteEndpointDeclared: permissionEntry?.remoteEndpointDeclared === true,
      environmentInjectionDeclared: permissionEntry?.environmentInjectionDeclared === true,
      risk: permissionEntry?.risk || null,
    },
    publicSafety: {
      lifecycleStatus: lifecycle.status || null,
      lifecyclePublicReleaseAllowed: lifecycle.externalInstallProofSummary?.publicReleaseAllowed === true,
      installStateStatus: installState.status || null,
      installStatePublicReleaseAllowed: installState.releaseGate?.publicReleaseAllowed === true,
      installEvidenceStatus: installEvidence.status || null,
      installEvidencePublicReleaseAllowed: installEvidence.releaseBoundary?.publicReleaseAllowed === true,
      runtimeStatus: runtimeStatus.status || null,
      runtimePublicReleaseAllowed: runtimeStatus.runtimeBoundary?.publicReleaseAllowed === true,
      securityReviewStatus: securityReview.status || null,
      securityReviewPublicReleaseAllowed: securityReview.publicReleaseAllowed === true,
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
    validation: [
      "npm run check:seis-swift-package-topology",
      "node --test plugins/seis-core/test/swift-package-topology.test.mjs",
      "node --test plugins/seis-core/test/swift-package-topology-evidence.test.mjs",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:seis-public-marketplace-terminology",
      "npm run check:seis-public-plugin-security-provenance-review",
      "npm run check:seis-public-plugin-continuity",
    ],
    externalGaps: [
      "Independent clean-runner or public-install evidence remains pending and is not created by this checkpoint.",
      "SwiftPM resolution, compilation, tests, and native runtime behavior are not run or claimed by this static topology package.",
      "No provider, deployment, signing, marketplace publication, protected-branch update, or public release was performed.",
    ],
    risks: [
      {
        id: "RISK-W4-008",
        status: "tracked",
        description: "A public SEIS Repo card could be mistaken for independent installation or release proof.",
        mitigation: "Keep the independent evidence and human-approval gates false and link their current repository records.",
      },
      {
        id: "RISK-W4-009",
        status: "tracked",
        description: "A static parser result could be mistaken for a compiler, SwiftPM, or runtime validation result.",
        mitigation: "Expose only derived manifest topology and preserve all execution claims as false.",
      },
      {
        id: "RISK-W4-010",
        status: "tracked",
        description: "Projection metadata could drift across source, catalog, matrix, marketplace, and permission records.",
        mitigation: "Require exact single-entry reconciliation and generated evidence checks before a feature-branch delivery.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused source package, historical direct-card evidence, current bundle reconciliation, generated topology evidence, integration checkpoint, and aligned projections on the feature branch; no manifest mutation, external state, release, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function buildCurrentMarketplaceProjection({ sourceManifest, marketplace, bundleCatalog, sourceEntry, directMarketplaceEntry, distributionBundle, distributionBundleCard, bundleMembershipCount }) {
  const sourceEntries = list(sourceManifest.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  assert(marketplace.name === "seis-repo" && marketplace.interface?.displayName === "SEIS Repo", "current marketplace identity is invalid");
  assert(sourceManifest.publicDistribution?.distributionMode === "curated-bounded-public-bundles" && sourceManifest.publicDistribution?.separateMarketplaceCards === false, "current source distribution mode is invalid");
  assert(sourceEntries.length === CURRENT_DISTRIBUTION.applicationSourcePackageCount && marketplaceEntries.length === CURRENT_DISTRIBUTION.publicCardCount, "current source or marketplace count is invalid");
  assert(bundleCatalog.marketplace?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && bundleCatalog.marketplace?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && bundleCatalog.marketplace?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && bundleCatalog.marketplace?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && bundleCatalog.marketplace?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current bundle-card inventory is invalid");
  assert(bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && bundleCatalog.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.sourcePackagesDeleted === false, "current retained-source inventory is invalid");
  assert(sourceEntry?.sourcePath === SOURCE_PATH && directMarketplaceEntry === null, "current selected capability must remain a retained source without a direct card");
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
  assert(record.id === "seis-public-plugin-wave-4-integration-checkpoint" && record.goalId === "SEIS-GOAL-021" && record.wave === 4 && record.round === 4 && record.status === "completed-repository-local-integration-checkpoint" && record.maturity === "prototype", "checkpoint identity is invalid");
  assert(list(record.completedSteps).join(",") === range(74, 80).join(","), "completed step range is invalid");
  assert(record.capability?.id === CAPABILITY && record.capability?.sourceDirectoryPresent === true && record.capability?.fixedManifestPath === "packages/seis_platform_swift/Package.swift" && record.capability?.staticOnly === true && record.capability?.sourceManifestRegistered === true && record.capability?.catalogRegistered === true && record.capability?.matrixRegistered === true && record.capability?.currentSourceRetained === true && record.capability?.currentDirectMarketplaceCard === false && record.capability?.currentDirectMarketplaceCardCount === 0 && record.capability?.currentDistributionBundleId === DISTRIBUTION_BUNDLE_ID && record.capability?.currentDistributionBundleCardPresent === true && record.capability?.currentDistributionBundleMembershipCount === 1, "capability projection is invalid");
  assert(record.historicalWave4Distribution?.classification === "immutable-wave-4-direct-card-integration-snapshot" && record.historicalWave4Distribution?.projectionModel === "direct-source-package-marketplace-cards" && record.historicalWave4Distribution?.marketplaceName === "seis-repo" && record.historicalWave4Distribution?.marketplaceDisplayName === "SEIS Repo" && record.historicalWave4Distribution?.applicationPluginCount === HISTORICAL_WAVE_4_DISTRIBUTION.applicationPluginCount && record.historicalWave4Distribution?.catalogPluginCount === HISTORICAL_WAVE_4_DISTRIBUTION.catalogPluginCount && record.historicalWave4Distribution?.matrixPluginCount === HISTORICAL_WAVE_4_DISTRIBUTION.matrixPluginCount && record.historicalWave4Distribution?.publicCardCount === HISTORICAL_WAVE_4_DISTRIBUTION.publicCardCount && record.historicalWave4Distribution?.selectedCapability === CAPABILITY && record.historicalWave4Distribution?.selectedCapabilityHadDirectMarketplaceCard === true && record.historicalWave4Distribution?.marketplaceCardRegisteredAtCheckpoint === true, "historical Wave 4 projection is invalid");
  assert(record.currentRegistryReconciliation?.applicationSourceManifestCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && record.currentRegistryReconciliation?.applicationCatalogCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && record.currentRegistryReconciliation?.applicationMatrixCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && record.currentRegistryReconciliation?.matrixFailureCount === 0, "current registry reconciliation is invalid");
  assert(record.currentMarketplaceProjection?.projectionModel === "curated-bundle-cards" && record.currentMarketplaceProjection?.distributionMode === "curated-bounded-public-bundles" && record.currentMarketplaceProjection?.marketplaceName === "seis-repo" && record.currentMarketplaceProjection?.marketplaceDisplayName === "SEIS Repo" && record.currentMarketplaceProjection?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && record.currentMarketplaceProjection?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && record.currentMarketplaceProjection?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.currentMarketplaceProjection?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.currentMarketplaceProjection?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current marketplace card projection is invalid");
  assert(record.currentMarketplaceProjection?.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && record.currentMarketplaceProjection?.selectedApplicationCapability?.id === CAPABILITY && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardRequired === false && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardCount === 0 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleId === DISTRIBUTION_BUNDLE_ID, "current retained-source or selected-capability projection is invalid");
  assert(record.topologyEvidence?.status === "ready-public-static-topology-evidence" && record.topologyEvidence?.auditOk === true && record.topologyEvidence?.auditState === "ready" && record.topologyEvidence?.declaredPlatformCount === 2 && record.topologyEvidence?.productCount === 2 && record.topologyEvidence?.targetCount === 3 && record.topologyEvidence?.targetDependencyEdgeCount === 1 && record.topologyEvidence?.testTargetDependencyCount === 1 && record.topologyEvidence?.executableResourceCount === 2 && Object.values(record.topologyEvidence?.staticOnlyClaims || {}).every((value) => value === false), "topology evidence is invalid");
  assert(record.permissions?.transport === "local-stdio" && record.permissions?.permissionState === "deny-by-default" && list(record.permissions?.write).length === 0 && list(record.permissions?.network).length === 0 && list(record.permissions?.secrets).length === 0 && record.permissions?.remoteEndpointDeclared === false && record.permissions?.environmentInjectionDeclared === false && record.permissions?.risk === "low", "permission boundary is invalid");
  assert(record.publicSafety?.lifecycleStatus === "active-local-proof-public-release-gated" && record.publicSafety?.lifecyclePublicReleaseAllowed === false && record.publicSafety?.installStateStatus === "public-seis-repo-source-available-independent-install-pending" && record.publicSafety?.installStatePublicReleaseAllowed === false && record.publicSafety?.installEvidenceStatus === "public-seis-repo-independent-install-evidence-gate" && record.publicSafety?.installEvidencePublicReleaseAllowed === false && record.publicSafety?.runtimeStatus === "public-seis-repo-runtime-cache-observation" && record.publicSafety?.runtimePublicReleaseAllowed === false && record.publicSafety?.securityReviewStatus === "repo-local-security-provenance-reviewed" && record.publicSafety?.securityReviewPublicReleaseAllowed === false, "public safety boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(list(record.validation).length === 7 && list(record.externalGaps).length === 3 && list(record.risks).length === 3, "validation, gaps, or risks are incomplete");
  assert(record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "rollback boundary is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "checkpoint inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "checkpoint must not contain a machine-specific path");
}

function assertSupportedCurrentInventory(sourceManifest, catalog, matrix, marketplace) {
  const sourceEntries = list(sourceManifest.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  assert(sourceEntries.length === CURRENT_DISTRIBUTION.applicationSourcePackageCount && catalog.counts?.discovered === CURRENT_DISTRIBUTION.applicationSourcePackageCount && matrix.pluginCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && matrix.failureCount === 0 && marketplaceEntries.length === CURRENT_DISTRIBUTION.publicCardCount, "current inventory must match the curated public-package projection");
}

function exactOne(entries, name, label) {
  const matches = list(entries).filter((entry) => entry?.name === name);
  assert(matches.length === 1, label + " must contain exactly one " + name + " entry");
  return matches[0];
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
  if (!condition) throw new Error("SEIS public plugin Wave 4 integration checkpoint: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 integration checkpoint: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
