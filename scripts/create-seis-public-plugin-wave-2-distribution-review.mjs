#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-2-distribution-review.json";
const APPLE_PLUGIN_ID = "seis-apple-native-readiness";
const PUBLIC_TOPIC_PLUGIN_COUNT = 300;
const MIGRATED_ROOT_MARKETPLACE_PLUGIN_COUNT = 5;
const CANONICAL_DEFAULT_INSTALL_COUNT = 1;
const EXPECTED_PUBLIC_CARD_COUNT = APP_PLUGIN_EXPANSION_TARGET
  + PUBLIC_TOPIC_PLUGIN_COUNT
  + MIGRATED_ROOT_MARKETPLACE_PLUGIN_COUNT
  + CANONICAL_DEFAULT_INSTALL_COUNT;
const PATHS = Object.freeze({
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
  console.log(`Wrote ${OUTPUT_PATH} for ${record.distribution.applicationPluginCount} public app packages.`);
}

function buildRecord() {
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

  assert(sourceApple?.status === "approved-public-readonly", "Apple plugin source status is invalid");
  assert(catalogApple?.status?.state === "ready" && catalogApple?.permissions?.write?.length === 0, "Apple plugin catalog contract is invalid");
  assert(matrixApple?.status === "ready" && matrixApple?.permissionBoundary?.network?.length === 0, "Apple plugin matrix contract is invalid");
  assert(registryApple?.canonicalInstallId === `${APPLE_PLUGIN_ID}@seis-repo`, "Apple plugin registry contract is invalid");
  assert(suiteApple?.publicMarketplace === true && suiteApple?.publicReleaseAllowed === false, "Apple plugin suite contract is invalid");

  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-2-distribution-review",
    goalId: "SEIS-GOAL-021",
    wave: 2,
    status: "completed-repository-local-distribution-maintenance-review",
    generatedAt: "2026-07-21",
    purpose: "Reconcile the public SEIS Repo application-plugin distribution chain after Wave 2 resilience work without treating repository visibility, local artifacts, cache observations, or static checks as independent installation, activation, release, provider, deployment, or approval proof.",
    distribution: {
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      publicAudience: "everyone",
      publicCardCount: installState.publicCards?.count ?? null,
      expectedPublicCardCount: EXPECTED_PUBLIC_CARD_COUNT,
      applicationPluginCount: source.pluginCount ?? null,
      expectedApplicationPluginCount: APP_PLUGIN_EXPANSION_TARGET,
      topicPluginCount: installState.publicCards?.topicPluginCount ?? null,
      sourceAvailableInRepository: source.publicDistribution?.directRepoSource === true,
      publicRepositoryAvailable: catalog.distribution?.publicRepositoryAvailable === true,
    },
    contracts: {
      sourceCatalog: {
        sourceStatus: source.status || null,
        catalogContractValid: catalog.counts?.contractInvalid === 0 && catalog.counts?.contractValid === APP_PLUGIN_EXPANSION_TARGET,
        sourcePluginCount: source.pluginCount ?? null,
        catalogPluginCount: catalog.counts?.discovered ?? null,
        applePluginStatus: catalogApple?.status?.state || null,
      },
      matrixRegistrySuite: {
        matrixPluginCount: matrix.pluginCount ?? null,
        matrixFailureCount: matrix.failureCount ?? null,
        matrixAppleStatus: matrixApple?.status || null,
        registryEntryCount: list(registry.entries).length,
        registryAppleInstallId: registryApple?.canonicalInstallId || null,
        suiteApplicationPluginCount: suite.applicationDistribution?.pluginCount ?? null,
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
        localArtifactStageVerified: installState.readiness?.localArtifactStageVerified ?? null,
        freshTaskReloadRecorded: installState.readiness?.freshTaskReloadRecorded ?? null,
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
        declaredMarketplaceEntryCount: manifestAudit.counts?.declaredMarketplaceEntryCount ?? null,
        declaredApplicationMarketplaceEntryCount: manifestAudit.counts?.declaredApplicationMarketplaceEntryCount ?? null,
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
  assert(record.distribution?.marketplaceName === "seis-repo" && record.distribution?.marketplaceDisplayName === "SEIS Repo" && record.distribution?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.distribution?.publicCardCount === EXPECTED_PUBLIC_CARD_COUNT && record.distribution?.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.distribution?.topicPluginCount === PUBLIC_TOPIC_PLUGIN_COUNT, "distribution counts are invalid");
  assert(record.distribution?.sourceAvailableInRepository === true && record.distribution?.publicRepositoryAvailable === true, "repository source boundary is invalid");
  assert(record.contracts?.sourceCatalog?.catalogContractValid === true && record.contracts?.sourceCatalog?.sourcePluginCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.sourceCatalog?.catalogPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.sourceCatalog?.applePluginStatus === "ready", "source/catalog reconciliation is invalid");
  assert(record.contracts?.matrixRegistrySuite?.matrixPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.matrixRegistrySuite?.matrixFailureCount === 0 && record.contracts?.matrixRegistrySuite?.matrixAppleStatus === "ready" && record.contracts?.matrixRegistrySuite?.registryAppleInstallId === `${APPLE_PLUGIN_ID}@seis-repo` && record.contracts?.matrixRegistrySuite?.suiteApplicationPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.matrixRegistrySuite?.suitePublicReleaseAllowed === false, "matrix/registry/suite reconciliation is invalid");
  assert(record.contracts?.permissions?.applicationMcpServerCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.permissions?.remoteServerCount === 0 && record.contracts?.permissions?.writePermissionGrantCount === 0 && record.contracts?.permissions?.networkPermissionGrantCount === 0 && record.contracts?.permissions?.secretPermissionGrantCount === 0 && record.contracts?.permissions?.publicReleaseAllowed === false, "permission reconciliation is invalid");
  assert(record.contracts?.installAndRuntime?.repositorySourceAvailable === true && record.contracts?.installAndRuntime?.localArtifactStageVerified === true && record.contracts?.installAndRuntime?.freshTaskReloadRecorded === true && record.contracts?.installAndRuntime?.independentInstallationVerified === false && record.contracts?.installAndRuntime?.humanReleaseApprovalRecorded === false && record.contracts?.installAndRuntime?.runtimeCacheIsInstallationProof === false && record.contracts?.installAndRuntime?.runtimeNetworkAllowed === false, "install/runtime boundary is invalid");
  assert(record.contracts?.provenanceAndRelease?.securitySecretFindingCount === 0 && record.contracts?.provenanceAndRelease?.securityBlockingFindingCount === 0 && record.contracts?.provenanceAndRelease?.securityPublicReleaseAllowed === false && record.contracts?.provenanceAndRelease?.externalProofPublicReleaseAllowed === false && record.contracts?.provenanceAndRelease?.lifecycleReleaseAuthority === "human_owner_required" && record.contracts?.provenanceAndRelease?.releaseReadinessDecision === "continue-code-before-large-code-promotion" && record.contracts?.provenanceAndRelease?.releasePromoted === false, "provenance/release boundary is invalid");
  assert(record.contracts?.manifest?.overallState === "ready" && record.contracts?.manifest?.declaredMarketplaceEntryCount === EXPECTED_PUBLIC_CARD_COUNT && record.contracts?.manifest?.declaredApplicationMarketplaceEntryCount === APP_PLUGIN_EXPANSION_TARGET && record.contracts?.manifest?.findingCount === 0, "project manifest reconciliation is invalid");
  assert(record.contracts?.appleReadiness?.status === "completed-public-static-readiness-evidence" && record.contracts?.appleReadiness?.staticState === "ready" && record.contracts?.appleReadiness?.resilienceStatus === "completed-repository-local-resilience-review" && record.contracts?.appleReadiness?.externalNativeValidation === "not-run-and-not-claimed", "Apple readiness boundary is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.writes === false && record.publicBoundary?.network === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false && record.publicBoundary?.externalInstallationProven === false && record.publicBoundary?.humanReleaseApprovalRecorded === false, "public boundary is invalid");
  assert(list(record.remainingGaps).length === 3 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "gaps or rollback are invalid");
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
