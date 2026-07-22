#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-2-distribution-review.json";
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
const RELEASE_READINESS_DECISIONS = Object.freeze([
  "continue-code-before-large-code-promotion",
  "large-code-promotion-evidence-ready",
]);
const PATHS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  source: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  registry: "content/development/seis-ai-core-plugin-registry.json",
  suite: "plugins/seis-ai-agent/assets/unified-suite.json",
  permission: "content/development/seis-mcp-permission-risk-matrix.json",
  installState: "content/development/seis-public-install-state.json",
  runtimeStatus: "content/development/seis-public-runtime-status.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  externalProof: "content/development/seis-public-plugin-external-install-proof.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
  releaseReadiness: "apps/seis-core/data/seis-core-plugin-release-readiness.json",
  manifestAudit: "content/development/seis-project-manifest-audit.json",
  appleEvidence: "content/development/seis-apple-native-readiness.json",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-2-distribution-review`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 2 distribution review check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for ${record.distribution.applicationSourceCapabilityCount} retained app source capabilities.`);
}

function buildRecord() {
  const marketplace = readJson(PATHS.marketplace);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const source = readJson(PATHS.source);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const registry = readJson(PATHS.registry);
  const suite = readJson(PATHS.suite);
  const permission = readJson(PATHS.permission);
  const installState = readJson(PATHS.installState);
  const runtimeStatus = readJson(PATHS.runtimeStatus);
  const lifecycle = readJson(PATHS.lifecycle);
  const externalProof = readJson(PATHS.externalProof);
  const securityReview = readJson(PATHS.securityReview);
  const releaseReadiness = readJson(PATHS.releaseReadiness);
  const manifestAudit = readJson(PATHS.manifestAudit);
  const appleEvidence = readJson(PATHS.appleEvidence);
  const sourceApple = list(source.plugins).find((plugin) => plugin?.name === APPLE_PLUGIN_ID);
  const catalogApple = list(catalog.plugins).find((plugin) => plugin?.name === APPLE_PLUGIN_ID);
  const matrixApple = list(matrix.plugins).find((plugin) => plugin?.name === APPLE_PLUGIN_ID);
  const registryApple = list(registry.entries).find((entry) => entry?.id === APPLE_PLUGIN_ID);
  const suiteApple = list(suite.applicationDistribution?.plugins).find((plugin) => plugin?.moduleId === APPLE_PLUGIN_ID);
  const cards = list(marketplace.plugins);
  const directAppleCard = cards.find((card) => card?.name === APPLE_PLUGIN_ID || card?.source?.path === `./plugins/seis-core/${APPLE_PLUGIN_ID}`);
  const appleBundleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(APPLE_PLUGIN_ID));
  const appleBundle = appleBundleMemberships[0];
  const appleBundleCard = cards.find((card) => card?.name === appleBundle?.id);

  assert(sourceApple?.status === "approved-public-readonly", "Apple plugin source status is invalid");
  assert(catalogApple?.status?.state === "ready" && catalogApple?.permissions?.write?.length === 0, "Apple plugin catalog contract is invalid");
  assert(matrixApple?.status === "ready" && matrixApple?.permissionBoundary?.network?.length === 0, "Apple plugin matrix contract is invalid");
  assert(registryApple?.id === APPLE_PLUGIN_ID, "Apple plugin registry source identity is invalid");
  assert(suiteApple?.publicMarketplace === false && suiteApple?.marketplaceBundleId === APPLE_BUNDLE_ID && suiteApple?.publicReleaseAllowed === false, "Apple plugin suite bundle contract is invalid");
  assert(source.publicDistribution?.distributionMode === "curated-bounded-public-bundles" && source.publicDistribution?.separateMarketplaceCards === false, "Apple source distribution mode is stale");
  assert(catalog.distribution?.distributionScope === "curated-bounded-public-bundles" && catalog.distribution?.separateMarketplaceCards === false, "Apple catalog distribution mode is stale");
  assert(suite.applicationDistribution?.publicDistribution === "curated-bounded-public-bundles" && suite.applicationDistribution?.marketplaceEntryCount === CURRENT_DISTRIBUTION.applicationBundleCardCount, "Apple suite distribution mode is stale");
  assert(!directAppleCard && appleBundleMemberships.length === 1 && appleBundle?.id === APPLE_BUNDLE_ID, "Apple source must have exact-one curated bundle membership and no direct card");
  assert(appleBundleCard?.source?.path === `./plugins/seis-bundles/${APPLE_BUNDLE_ID}`, "Apple distribution bundle card is invalid");

  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-2-distribution-review",
    goalId: "SEIS-GOAL-021",
    wave: 2,
    status: "completed-repository-local-distribution-maintenance-review",
    generatedAt: "2026-07-22",
    purpose: "Reconcile the historical Wave 2 direct-card facts with the current curated SEIS Repo bundle distribution without treating repository visibility, local artifacts, cache observations, or static checks as independent installation, activation, release, provider, deployment, or approval proof.",
    historicalWave2Distribution: {
      classification: "immutable-wave-2-handoff-snapshot",
      distributionMode: "direct-source-package-marketplace-cards",
      ...HISTORICAL_WAVE_2_DISTRIBUTION,
      appleReadinessHadDirectMarketplaceCard: true,
      note: "These historical counts are retained for provenance and do not describe the current marketplace projection.",
    },
    distribution: {
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      publicAudience: "everyone",
      distributionMode: source.publicDistribution?.distributionMode || null,
      marketplaceCardCount: cards.length,
      expectedMarketplaceCardCount: CURRENT_DISTRIBUTION.marketplaceCardCount,
      canonicalCardCount: bundleCatalog.marketplace?.canonicalCardCount ?? null,
      bundleCardCount: bundleCatalog.marketplace?.bundleCardCount ?? null,
      applicationBundleCardCount: bundleCatalog.marketplace?.applicationBundleCardCount ?? null,
      topicBundleCardCount: bundleCatalog.marketplace?.topicBundleCardCount ?? null,
      retainedSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount ?? null,
      rootSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount ?? null,
      applicationSourceCapabilityCount: source.pluginCount ?? null,
      topicSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount ?? null,
      separateMarketplaceCards: source.publicDistribution?.separateMarketplaceCards ?? null,
      sourceAvailableInRepository: source.publicDistribution?.directRepoSource === true,
      publicRepositoryAvailable: catalog.distribution?.publicRepositoryAvailable === true,
      appleReadiness: {
        sourcePath: sourceApple?.sourcePath || null,
        marketplaceCard: Boolean(directAppleCard),
        distributionBundleId: appleBundle?.id || null,
        distributionBundleCardPresent: Boolean(appleBundleCard),
        bundleMembershipCount: appleBundleMemberships.length,
      },
    },
    contracts: {
      sourceCatalog: {
        sourceStatus: source.status || null,
        catalogContractValid: catalog.counts?.contractInvalid === 0 && catalog.counts?.contractValid === APP_PLUGIN_EXPANSION_TARGET,
        sourcePluginCount: source.pluginCount ?? null,
        catalogPluginCount: catalog.counts?.discovered ?? null,
        applePluginStatus: catalogApple?.status?.state || null,
        sourceDistributionMode: source.publicDistribution?.distributionMode || null,
        catalogDistributionMode: catalog.distribution?.distributionScope || null,
        catalogMarketplaceEntryCount: catalog.distribution?.marketplaceEntryCount ?? null,
        separateMarketplaceCards: catalog.distribution?.separateMarketplaceCards ?? null,
      },
      matrixRegistrySuite: {
        matrixPluginCount: matrix.pluginCount ?? null,
        matrixFailureCount: matrix.failureCount ?? null,
        matrixAppleStatus: matrixApple?.status || null,
        registryEntryCount: list(registry.entries).length,
        registryAppleSourceId: registryApple?.id || null,
        registryDistributionAuthority: false,
        suiteApplicationSourceCapabilityCount: suite.applicationDistribution?.pluginCount ?? null,
        suiteMarketplaceEntryCount: suite.applicationDistribution?.marketplaceEntryCount ?? null,
        suiteMarketplaceCardCount: suite.applicationDistribution?.marketplaceCardCount ?? null,
        suiteRetainedSourceCapabilityCount: suite.applicationDistribution?.sourceCapabilityCount ?? null,
        suiteAppleMarketplaceCard: suiteApple?.publicMarketplace ?? null,
        suiteAppleDistributionBundleId: suiteApple?.marketplaceBundleId || null,
        suitePublicReleaseAllowed: suite.applicationDistribution?.publicReleaseAllowed ?? null,
      },
      permissions: {
        applicationMcpServerCount: permission.counts?.applicationMcpServerCount ?? null,
        remoteServerCount: permission.counts?.remoteServerCount ?? null,
        writePermissionGrantCount: permission.counts?.writePermissionGrantCount ?? null,
        networkPermissionGrantCount: permission.counts?.networkPermissionGrantCount ?? null,
        secretPermissionGrantCount: permission.counts?.secretPermissionGrantCount ?? null,
        publicReleaseAllowed: permission.safety?.publicReleaseAllowed ?? null,
      },
      installAndRuntime: {
        repositorySourceAvailable: installState.readiness?.repositorySourceAvailable ?? null,
        historicalSourceArtifactStageVerified: installState.readiness?.historicalSourceArtifactStageVerified ?? null,
        freshTaskReloadRecorded: installState.readiness?.freshTaskReloadRecorded ?? null,
        freshTaskReloadState: installState.evidence?.freshTaskReload?.status ?? null,
        independentInstallationVerified: installState.readiness?.independentInstallationVerified ?? null,
        humanReleaseApprovalRecorded: installState.readiness?.humanReleaseApprovalRecorded ?? null,
        runtimeCacheIsInstallationProof: runtimeStatus.observationBoundary?.cacheRecordIsInstallationProof ?? null,
        runtimeNetworkAllowed: runtimeStatus.observationBoundary?.networkAllowed ?? null,
      },
      provenanceAndRelease: {
        securitySecretFindingCount: securityReview.aggregate?.secretFindingCount ?? null,
        securityBlockingFindingCount: securityReview.aggregate?.blockingFindingCount ?? null,
        securityPublicReleaseAllowed: securityReview.publicReleaseAllowed ?? null,
        externalProofPublicReleaseAllowed: externalProof.publicReleaseAllowed ?? null,
        lifecycleReleaseAuthority: lifecycle.releasePolicy?.releaseAuthority || null,
        releaseReadinessDecision: releaseReadiness.decision || null,
        releasePromoted: false,
      },
      manifest: {
        overallState: manifestAudit.overallState || null,
        declaredMarketplaceCardCount: manifestAudit.counts?.declaredMarketplaceCardCount ?? null,
        declaredBundleCardCount: manifestAudit.counts?.declaredBundleCardCount ?? null,
        declaredRetainedSourceCapabilityCount: manifestAudit.counts?.declaredRetainedSourceCapabilityCount ?? null,
        declaredApplicationSourceCount: manifestAudit.counts?.declaredApplicationSourceCount ?? null,
        findingCount: list(manifestAudit.findings).length,
      },
      appleReadiness: {
        status: appleEvidence.status || null,
        staticState: appleEvidence.audit?.state || null,
        resilienceStatus: appleEvidence.resilienceReview?.status || null,
        externalNativeValidation: appleEvidence.resilienceReview?.externalNativeValidation || null,
      },
    },
    publicBoundary: {
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      writes: false,
      network: false,
      secrets: false,
      publicReleaseAllowed: false,
      externalInstallationProven: false,
      humanReleaseApprovalRecorded: false,
    },
    remainingGaps: [
      "Fresh-task reload evidence remains incomplete; it is not treated as a successful local reload or installation claim.",
      "Independent clean-runner or public package installation evidence has not been recorded.",
      "Human approval for public preview, release, publication, external writes, provider credentials, deployment, SSH, or protected-branch actions has not been recorded.",
      "Apple-native validation remains documented static readiness only; no SwiftPM, simulator, device, signing, provisioning, or App Store claim is made.",
    ],
    validation: [
      "npm run check:seis-core-plugin-sources",
      "npm run check:seis-core-plugin-catalog",
      "npm run check:seis-core-plugin-matrix",
      "npm run check:seis-ai-core-plugin-registry",
      "npm run check:seis-unified-plugin-suite",
      "npm run check:seis-public-plugin-bundles",
      "npm run check:seis-public-plugin-security-provenance-review",
      "npm run check:seis-repo-marketplace",
      "npm run check:seis-public-plugin-wave-2-distribution-review",
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this Wave 2 distribution-maintenance record and its program references on the feature branch; no external state, release state, or marketplace publication is changed.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-2-distribution-review" && record.goalId === "SEIS-GOAL-021" && record.wave === 2, "review identity is invalid");
  assert(record.status === "completed-repository-local-distribution-maintenance-review", "review status is invalid");
  assert(record.historicalWave2Distribution?.marketplaceCardCount === HISTORICAL_WAVE_2_DISTRIBUTION.marketplaceCardCount && record.historicalWave2Distribution?.applicationSourcePackageCount === HISTORICAL_WAVE_2_DISTRIBUTION.applicationSourcePackageCount && record.historicalWave2Distribution?.directApplicationCardCount === HISTORICAL_WAVE_2_DISTRIBUTION.directApplicationCardCount && record.historicalWave2Distribution?.appleReadinessHadDirectMarketplaceCard === true, "historical Wave 2 distribution is invalid");
  assert(record.distribution?.marketplaceName === "seis-repo" && record.distribution?.marketplaceDisplayName === "SEIS Repo" && record.distribution?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.distribution?.distributionMode === "curated-bounded-public-bundles" && record.distribution?.separateMarketplaceCards === false, "current distribution mode is invalid");
  assert(record.distribution?.marketplaceCardCount === CURRENT_DISTRIBUTION.marketplaceCardCount && record.distribution?.expectedMarketplaceCardCount === CURRENT_DISTRIBUTION.marketplaceCardCount && record.distribution?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && record.distribution?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.distribution?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.distribution?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current marketplace card counts are invalid");
  assert(record.distribution?.retainedSourceCapabilityCount === CURRENT_DISTRIBUTION.retainedSourceCapabilityCount && record.distribution?.rootSourceCapabilityCount === CURRENT_DISTRIBUTION.rootSourceCapabilityCount && record.distribution?.applicationSourceCapabilityCount === CURRENT_DISTRIBUTION.applicationSourceCapabilityCount && record.distribution?.topicSourceCapabilityCount === CURRENT_DISTRIBUTION.topicSourceCapabilityCount, "current source capability counts are invalid");
  assert(record.distribution?.appleReadiness?.sourcePath === `plugins/seis-core/${APPLE_PLUGIN_ID}` && record.distribution?.appleReadiness?.marketplaceCard === false && record.distribution?.appleReadiness?.distributionBundleId === APPLE_BUNDLE_ID && record.distribution?.appleReadiness?.distributionBundleCardPresent === true && record.distribution?.appleReadiness?.bundleMembershipCount === 1, "Apple readiness current bundle distribution is invalid");
  assert(record.distribution?.sourceAvailableInRepository === true && record.distribution?.publicRepositoryAvailable === true, "repository source boundary is invalid");
  assert(record.contracts?.sourceCatalog?.catalogContractValid === true && record.contracts?.sourceCatalog?.sourcePluginCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.sourceCatalog?.catalogPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.sourceCatalog?.applePluginStatus === "ready" && record.contracts?.sourceCatalog?.sourceDistributionMode === "curated-bounded-public-bundles" && record.contracts?.sourceCatalog?.catalogDistributionMode === "curated-bounded-public-bundles" && record.contracts?.sourceCatalog?.catalogMarketplaceEntryCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.contracts?.sourceCatalog?.separateMarketplaceCards === false, "source/catalog reconciliation is invalid");
  assert(record.contracts?.matrixRegistrySuite?.matrixPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.matrixRegistrySuite?.matrixFailureCount === 0 && record.contracts?.matrixRegistrySuite?.matrixAppleStatus === "ready" && record.contracts?.matrixRegistrySuite?.registryAppleSourceId === APPLE_PLUGIN_ID && record.contracts?.matrixRegistrySuite?.registryDistributionAuthority === false && record.contracts?.matrixRegistrySuite?.suiteApplicationSourceCapabilityCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.matrixRegistrySuite?.suiteMarketplaceEntryCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.contracts?.matrixRegistrySuite?.suiteMarketplaceCardCount === CURRENT_DISTRIBUTION.marketplaceCardCount && record.contracts?.matrixRegistrySuite?.suiteRetainedSourceCapabilityCount === CURRENT_DISTRIBUTION.retainedSourceCapabilityCount && record.contracts?.matrixRegistrySuite?.suiteAppleMarketplaceCard === false && record.contracts?.matrixRegistrySuite?.suiteAppleDistributionBundleId === APPLE_BUNDLE_ID && record.contracts?.matrixRegistrySuite?.suitePublicReleaseAllowed === false, "matrix/registry/suite reconciliation is invalid");
  assert(record.contracts?.permissions?.applicationMcpServerCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.permissions?.remoteServerCount === 0 && record.contracts?.permissions?.writePermissionGrantCount === 0 && record.contracts?.permissions?.networkPermissionGrantCount === 0 && record.contracts?.permissions?.secretPermissionGrantCount === 0 && record.contracts?.permissions?.publicReleaseAllowed === false, "permission reconciliation is invalid");
  assert(record.contracts?.installAndRuntime?.repositorySourceAvailable === true && record.contracts?.installAndRuntime?.historicalSourceArtifactStageVerified === true && record.contracts?.installAndRuntime?.freshTaskReloadRecorded === false && record.contracts?.installAndRuntime?.freshTaskReloadState === "incomplete-local-fresh-task-evidence" && record.contracts?.installAndRuntime?.independentInstallationVerified === false && record.contracts?.installAndRuntime?.humanReleaseApprovalRecorded === false && record.contracts?.installAndRuntime?.runtimeCacheIsInstallationProof === false && record.contracts?.installAndRuntime?.runtimeNetworkAllowed === false, "install/runtime boundary is invalid");
  assert(record.contracts?.provenanceAndRelease?.securitySecretFindingCount === 0 && record.contracts?.provenanceAndRelease?.securityBlockingFindingCount === 0 && record.contracts?.provenanceAndRelease?.securityPublicReleaseAllowed === false && record.contracts?.provenanceAndRelease?.externalProofPublicReleaseAllowed === false && record.contracts?.provenanceAndRelease?.lifecycleReleaseAuthority === "human_owner_required" && RELEASE_READINESS_DECISIONS.includes(record.contracts?.provenanceAndRelease?.releaseReadinessDecision) && record.contracts?.provenanceAndRelease?.releasePromoted === false, "provenance/release boundary is invalid");
  assert(record.contracts?.manifest?.overallState === "ready" && record.contracts?.manifest?.declaredMarketplaceCardCount === CURRENT_DISTRIBUTION.marketplaceCardCount && record.contracts?.manifest?.declaredBundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.contracts?.manifest?.declaredRetainedSourceCapabilityCount === CURRENT_DISTRIBUTION.retainedSourceCapabilityCount && record.contracts?.manifest?.declaredApplicationSourceCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.manifest?.findingCount === 0, "project manifest reconciliation is invalid");
  assert(record.contracts?.appleReadiness?.status === "completed-public-static-readiness-evidence" && record.contracts?.appleReadiness?.staticState === "ready" && record.contracts?.appleReadiness?.resilienceStatus === "completed-repository-local-resilience-review" && record.contracts?.appleReadiness?.externalNativeValidation === "not-run-and-not-claimed", "Apple readiness boundary is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.writes === false && record.publicBoundary?.network === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false && record.publicBoundary?.externalInstallationProven === false && record.publicBoundary?.humanReleaseApprovalRecorded === false, "public boundary is invalid");
  assert(list(record.remainingGaps).length === 4 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "gaps or rollback are invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "review must not contain a machine-specific path");
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 2 distribution review: ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 2 distribution review: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
