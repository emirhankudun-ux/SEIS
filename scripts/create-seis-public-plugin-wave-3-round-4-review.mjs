#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-round-4-review.json";
const ROUND_3_CHECKPOINT_PATH = "content/development/seis-public-plugin-wave-3-round-3-checkpoint.json";
const AUDIT_PATH = "content/development/seis-swift-concurrency-audit.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const BUNDLE_CATALOG_PATH = "content/development/seis-public-plugin-bundle-catalog.json";
const MATRIX_PATH = "content/development/seis-core-plugin-matrix.json";
const MCP_PERMISSION_PATH = "content/development/seis-mcp-permission-risk-matrix.json";
const LIFECYCLE_PATH = "content/development/seis-public-plugin-lifecycle.json";
const EXTERNAL_PROOF_PATH = "content/development/seis-public-plugin-external-install-proof.json";
const PLUGIN_MANIFEST_PATH = "plugins/seis-core/seis-swift-concurrency-audit/.codex-plugin/plugin.json";
const PLUGIN_PROFILE_PATH = "plugins/seis-core/seis-swift-concurrency-audit/assets/plugin-profile.json";
const RUNTIME_PATH = "plugins/seis-core/seis-swift-concurrency-audit/runtime/swift-concurrency-audit.mjs";
const DOCUMENTATION_PATH = "docs/development/SEIS_SWIFT_CONCURRENCY_AUDIT.md";
const SKILL_PATH = "plugins/seis-core/seis-swift-concurrency-audit/skills/seis-swift-concurrency-audit/SKILL.md";
const RUNTIME_TEST_PATH = "plugins/seis-core/test/swift-concurrency-audit.test.mjs";
const EVIDENCE_TEST_PATH = "plugins/seis-core/test/swift-concurrency-audit-evidence.test.mjs";
const CHECKPOINT_COMMIT = "d6bfaab79ec26451d8ef9ca1c9556c5cb689f186";
const CAPABILITY = "seis-swift-concurrency-audit";
const DISTRIBUTION_BUNDLE_ID = "seis-application-bundle-06";
const HISTORICAL_INVENTORY = Object.freeze({ applicationPluginCount: 73, marketplaceCardCount: 379, matrixPluginCount: 73, matrixAttentionCount: 3 });
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-3-round-4-review");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 round 4 review check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " with steps 61-79 reconciled.");
}

function buildRecord() {
  const checkpoint = readJson(ROUND_3_CHECKPOINT_PATH);
  const audit = readJson(AUDIT_PATH);
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const bundleCatalog = readJson(BUNDLE_CATALOG_PATH);
  const matrix = readJson(MATRIX_PATH);
  const mcpPermission = readJson(MCP_PERMISSION_PATH);
  const lifecycle = readJson(LIFECYCLE_PATH);
  const externalProof = readJson(EXTERNAL_PROOF_PATH);
  const pluginManifest = readJson(PLUGIN_MANIFEST_PATH);
  const pluginProfile = readJson(PLUGIN_PROFILE_PATH);
  const runtimeSource = readText(RUNTIME_PATH);
  const documentation = readText(DOCUMENTATION_PATH);
  const skill = readText(SKILL_PATH);
  const runtimeTest = readText(RUNTIME_TEST_PATH);
  const evidenceTest = readText(EVIDENCE_TEST_PATH);
  const sourceEntries = list(sourceManifest.plugins).filter((entry) => entry?.name === CAPABILITY);
  const marketplaceEntries = list(marketplace.plugins).filter((entry) => entry?.name === CAPABILITY);
  const matrixEntries = list(matrix.plugins).filter((entry) => entry?.name === CAPABILITY);
  const mcpEntries = list(mcpPermission.records).filter((entry) => entry?.name === CAPABILITY);
  const bundleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(CAPABILITY));
  const distributionBundle = bundleMemberships.length === 1 ? bundleMemberships[0] : null;
  const distributionBundleCard = list(marketplace.plugins).find((entry) => entry?.name === distributionBundle?.id) || null;
  assertCurrentInventory(sourceManifest, marketplace, matrix);
  const currentMarketplaceProjection = buildCurrentMarketplaceProjection({ sourceManifest, marketplace, bundleCatalog, sourceEntries, marketplaceEntries, distributionBundle, distributionBundleCard, bundleMembershipCount: bundleMemberships.length });
  const checkpointDiff = inspectCheckpointDiff();
  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-3-round-4-review",
    goalId: "SEIS-GOAL-021",
    wave: 3,
    round: 4,
    status: "completed-repository-local-round-review",
    generatedAt: "2026-07-21",
    purpose: "Close the Wave 3 resilience and public-contract review for the already approved static Swift concurrency package using repository-local evidence only.",
    completedSteps: range(61, 79),
    sourceCheckpoint: {
      path: ROUND_3_CHECKPOINT_PATH,
      status: checkpoint.status || null,
      commit: checkpoint.delivery?.commit || null,
    },
    overlapReview: {
      selectedCapability: CAPABILITY,
      sourceManifestEntryCount: sourceEntries.length,
      currentMarketplaceDirectCardCount: marketplaceEntries.length,
      currentMarketplaceSourceRetained: sourceEntries.length === 1,
      currentDistributionBundleId: distributionBundle?.id || null,
      currentDistributionBundleCardPresent: distributionBundleCard !== null,
      currentDistributionBundleMembershipCount: bundleMemberships.length,
      matrixEntryCount: matrixEntries.length,
      mcpEntryCount: mcpEntries.length,
      nonDuplicative: sourceEntries.length === 1 && marketplaceEntries.length === 0 && distributionBundle?.id === DISTRIBUTION_BUNDLE_ID && distributionBundleCard !== null && bundleMemberships.length === 1 && matrixEntries.length === 1 && mcpEntries.length === 1,
    },
    pathAndLimitReview: {
      fixedSourceRootCount: audit.audit?.sourceRootCount || 0,
      sourceRootsSafe: list(audit.audit?.sourceRootStates).every((sourceRoot) => sourceRoot?.safe === true),
      maxSwiftFiles: audit.resilienceReview?.limits?.maxSwiftFiles || 0,
      maxFileBytes: audit.resilienceReview?.limits?.maxFileBytes || 0,
      maxTotalBytes: audit.resilienceReview?.limits?.maxTotalBytes || 0,
      maxSourceDepth: audit.resilienceReview?.limits?.maxSourceDepth || 0,
      maxReportedPaths: audit.resilienceReview?.limits?.maxReportedPaths || 0,
      coveredFailureModeCount: list(audit.resilienceReview?.coveredFailureModes).length,
      arbitraryPathRefusalCovered: list(audit.resilienceReview?.coveredFailureModes).includes("MCP-arbitrary-audit-path"),
      symlinkRefusalCovered: list(audit.resilienceReview?.coveredFailureModes).includes("source-symlink"),
    },
    stateAndOutputReview: {
      staticState: audit.audit?.state || null,
      staticOk: audit.audit?.ok === true,
      blockingFindingCount: audit.audit?.blockingFindingCount || 0,
      reviewRequired: audit.audit?.reviewRequired === true,
      rawSourceReturned: audit.resilienceReview?.outputBoundary?.rawSourceReturned === true,
      rawMatchedValuesReturned: audit.resilienceReview?.outputBoundary?.rawMatchedValuesReturned === true,
      machineSpecificPathReturned: audit.resilienceReview?.outputBoundary?.machineSpecificPathReturned === true,
      sourceFilesCompiled: audit.inputSafety?.sourceFilesCompiled === true,
    },
    accessibilityAndPerformance: {
      publicUiSurfaceChanged: Object.hasOwn(pluginManifest, "apps"),
      accessibilityReview: "not-applicable-no-public-ui-surface-changed",
      dependencyManifestPresent: fs.existsSync(path.join(ROOT, "plugins/seis-core/seis-swift-concurrency-audit/package.json")),
      boundedStaticScan: pluginProfile.audit?.mode === "read-only-static-signal-report",
      maxTotalBytes: pluginProfile.audit?.maxTotalBytes || 0,
    },
    permissionsAndClaims: {
      write: list(pluginProfile.permissions?.write),
      network: list(pluginProfile.permissions?.network),
      secrets: list(pluginProfile.permissions?.secrets),
      mcpTransport: mcpEntries[0]?.transport || null,
      remoteEndpointDeclared: mcpEntries[0]?.remoteEndpointDeclared === true,
      environmentInjectionDeclared: mcpEntries[0]?.environmentInjectionDeclared === true,
      compilesSwift: audit.safety?.compilesSwift === true,
      runsSwiftTests: audit.safety?.runsSwiftTests === true,
      nativeRuntimeStarted: audit.safety?.startsNativeApplication === true,
      publicReleaseAllowed: audit.safety?.publicReleaseAllowed === true,
      providerOrDeploymentClaim: documentation.includes("provider is connected") || documentation.includes("deployment succeeded"),
    },
    lifecycleState: {
      lifecycleStatus: lifecycle.status || null,
      externalProofStatus: externalProof.status || null,
      independentRunnerEvidenceStatus: lifecycle.independentRunnerEvidenceIntake?.evidenceStatus || null,
      publicReleaseAllowed: externalProof.publicReleaseAllowed === true,
      matrixFailureCount: matrix.failureCount || 0,
    },
    historicalWave3Distribution: {
      classification: "immutable-wave-3-round-4-direct-card-snapshot",
      projectionModel: "direct-source-package-marketplace-cards",
      applicationPluginCount: HISTORICAL_INVENTORY.applicationPluginCount,
      marketplaceCardCount: HISTORICAL_INVENTORY.marketplaceCardCount,
      matrixPluginCount: HISTORICAL_INVENTORY.matrixPluginCount,
      matrixAttentionCount: HISTORICAL_INVENTORY.matrixAttentionCount,
      selectedCapability: CAPABILITY,
      selectedCapabilityHadDirectMarketplaceCard: true,
      additionalDirectCardAddedAtExecution: true,
      note: "These counts and direct-card facts are immutable Wave 3 round 4 history and do not describe the current curated marketplace.",
    },
    currentMarketplaceProjection,
    documentationAndCoverage: {
      publicMarketplaceNamed: documentation.includes("SEIS Repo"),
      noCompileLimitNamed: documentation.includes("no-compile/no-native-run"),
      staticAttentionExplained: documentation.includes("static review signal"),
      skillNoCompileLimitNamed: skill.includes("compiles or runs Swift"),
      runtimeTestPresent: fs.existsSync(path.join(ROOT, RUNTIME_TEST_PATH)),
      evidenceTestPresent: fs.existsSync(path.join(ROOT, EVIDENCE_TEST_PATH)),
      pathRefusalFixturePresent: runtimeTest.includes("refuses an arbitrary audit path"),
      boundaryEvidenceFixturePresent: evidenceTest.includes("bounded Swift concurrency evidence"),
      runtimeBoundaryMarkerPresent: runtimeSource.includes("absolutePathsReturned: false"),
    },
    checkpointDiff,
    validation: [
      "git diff --check d6bfaab7^ d6bfaab7",
      "plugin-creator structural validator for plugins/seis-core/seis-swift-concurrency-audit",
      "node --test plugins/seis-core/test/swift-concurrency-audit.test.mjs",
      "node --test plugins/seis-core/test/swift-concurrency-audit-evidence.test.mjs",
      "npm run check:seis-repo-marketplace",
      "npm run seis:check",
    ],
    risks: [
      {
        id: "RISK-W3-001",
        status: "tracked",
        description: "Cadence pressure could create a duplicate public package.",
        mitigation: "Require one source-manifest, marketplace, matrix, and MCP record for the selected capability.",
      },
      {
        id: "RISK-W3-002",
        status: "tracked",
        description: "Static attention can be mistaken for a compiler, runtime, or release result.",
        mitigation: "Keep static-only limitations, blocking counts, and public-release gates explicit.",
      },
      {
        id: "RISK-W3-003",
        status: "tracked",
        description: "A later wave could cross the public-only boundary.",
        mitigation: "Keep write, network, secret, remote endpoint, and personal-marketplace permissions denied by default.",
      },
      {
        id: "RISK-W3-004",
        status: "tracked",
        description: "Checkpoint delivery can be confused with protected-branch merge or public release.",
        mitigation: "Record feature-branch-only delivery and retain independent installation and human approval gates.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 3 package, historical direct-card evidence, current bundle reconciliation, generated evidence, and review records on the feature branch. No data migration or external mutation exists.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function inspectCheckpointDiff() {
  const names = spawnSync("git", ["diff", "--name-only", CHECKPOINT_COMMIT + "^", CHECKPOINT_COMMIT], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const whitespace = spawnSync("git", ["diff", "--check", CHECKPOINT_COMMIT + "^", CHECKPOINT_COMMIT], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert(names.status === 0, "checkpoint diff name inspection failed");
  assert(whitespace.status === 0, "checkpoint diff contains whitespace errors");
  const paths = names.stdout.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  const unexpectedPathCount = paths.filter((value) => !isExpectedCheckpointPath(value)).length;
  assert(paths.length > 0 && unexpectedPathCount === 0, "checkpoint diff contains an unexpected path");
  return {
    commit: CHECKPOINT_COMMIT,
    changedFileCount: paths.length,
    unexpectedPathCount,
    whitespaceCheckPassed: true,
    allowedChangeAreas: [
      "public marketplace and application catalog",
      "development evidence and reports",
      "Wave documentation and roadmap",
      "public plugin source, tests, and metadata",
      "repository validation scripts and package scripts",
    ],
  };
}

function isExpectedCheckpointPath(value) {
  const exact = new Set([
    ".agents/plugins/marketplace.json",
    "package.json",
    "project.ecosystem.yaml",
  ]);
  const prefixes = [
    "apps/seis-core/data/",
    "content/development/",
    "docs/development/",
    "docs/platform/",
    "docs/roadmap/",
    "plugins/seis-ai-agent/assets/",
    "plugins/seis-core/",
    "reports/",
    "scripts/",
  ];
  return exact.has(value) || prefixes.some((prefix) => value.startsWith(prefix));
}

function buildCurrentMarketplaceProjection({ sourceManifest, marketplace, bundleCatalog, sourceEntries, marketplaceEntries, distributionBundle, distributionBundleCard, bundleMembershipCount }) {
  const allSourceEntries = list(sourceManifest.plugins);
  const allMarketplaceEntries = list(marketplace.plugins);
  assert(marketplace.name === "seis-repo" && marketplace.interface?.displayName === "SEIS Repo", "current marketplace identity is invalid");
  assert(sourceManifest.publicDistribution?.distributionMode === "curated-bounded-public-bundles" && sourceManifest.publicDistribution?.separateMarketplaceCards === false, "current source distribution mode is invalid");
  assert(allSourceEntries.length === CURRENT_DISTRIBUTION.applicationSourcePackageCount && allMarketplaceEntries.length === CURRENT_DISTRIBUTION.publicCardCount, "current source or marketplace count is invalid");
  assert(bundleCatalog.marketplace?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && bundleCatalog.marketplace?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && bundleCatalog.marketplace?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && bundleCatalog.marketplace?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && bundleCatalog.marketplace?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current bundle-card inventory is invalid");
  assert(bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && bundleCatalog.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.sourcePackagesDeleted === false, "current retained-source inventory is invalid");
  assert(sourceEntries.length === 1 && sourceEntries[0]?.sourcePath === `plugins/seis-core/${CAPABILITY}` && marketplaceEntries.length === 0, "current selected capability must remain a retained source without a direct card");
  assert(distributionBundle?.id === DISTRIBUTION_BUNDLE_ID && distributionBundle?.family === "application" && distributionBundle?.sourcePath === `./plugins/seis-bundles/${DISTRIBUTION_BUNDLE_ID}` && bundleMembershipCount === 1, "current selected capability bundle membership is invalid");
  assert(distributionBundleCard?.source?.path === distributionBundle.sourcePath, "current selected capability bundle card is invalid");
  return {
    observedAt: bundleCatalog.generatedAt || null,
    projectionModel: "curated-bundle-cards",
    distributionMode: "curated-bounded-public-bundles",
    marketplaceName: marketplace.name,
    marketplaceDisplayName: marketplace.interface.displayName,
    publicCardCount: allMarketplaceEntries.length,
    canonicalCardCount: bundleCatalog.marketplace.canonicalCardCount,
    bundleCardCount: bundleCatalog.marketplace.bundleCardCount,
    applicationBundleCardCount: bundleCatalog.marketplace.applicationBundleCardCount,
    topicBundleCardCount: bundleCatalog.marketplace.topicBundleCardCount,
    sourceCapabilityInventory: {
      rootSourceModuleCount: bundleCatalog.sourceCapabilityInventory.rootSourceModuleCount,
      applicationSourcePackageCount: allSourceEntries.length,
      topicSourcePackageCount: bundleCatalog.sourceCapabilityInventory.topicSourcePackageCount,
      retainedSourcePackageCount: bundleCatalog.sourceCapabilityInventory.retainedSourcePackageCount,
      sourcePackagesDeleted: false,
    },
    selectedApplicationCapability: {
      id: CAPABILITY,
      retainedSource: true,
      sourcePath: sourceEntries[0].sourcePath,
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
  assert(record.id === "seis-public-plugin-wave-3-round-4-review" && record.goalId === "SEIS-GOAL-021" && record.wave === 3 && record.round === 4, "review identity is invalid");
  assert(record.status === "completed-repository-local-round-review" && list(record.completedSteps).join(",") === range(61, 79).join(","), "completed step range is invalid");
  assert(record.sourceCheckpoint?.status === "completed-repository-local-checkpoint" && record.sourceCheckpoint?.commit === CHECKPOINT_COMMIT, "source checkpoint is invalid");
  assert(record.overlapReview?.selectedCapability === CAPABILITY && record.overlapReview?.sourceManifestEntryCount === 1 && record.overlapReview?.currentMarketplaceDirectCardCount === 0 && record.overlapReview?.currentMarketplaceSourceRetained === true && record.overlapReview?.currentDistributionBundleId === DISTRIBUTION_BUNDLE_ID && record.overlapReview?.currentDistributionBundleCardPresent === true && record.overlapReview?.currentDistributionBundleMembershipCount === 1 && record.overlapReview?.nonDuplicative === true, "capability overlap review is invalid");
  assert(record.pathAndLimitReview?.fixedSourceRootCount === 2 && record.pathAndLimitReview?.sourceRootsSafe === true && record.pathAndLimitReview?.maxSwiftFiles === 64 && record.pathAndLimitReview?.maxFileBytes === 131072 && record.pathAndLimitReview?.maxTotalBytes === 1048576 && record.pathAndLimitReview?.maxSourceDepth === 4 && record.pathAndLimitReview?.maxReportedPaths === 24 && record.pathAndLimitReview?.coveredFailureModeCount === 7 && record.pathAndLimitReview?.arbitraryPathRefusalCovered === true && record.pathAndLimitReview?.symlinkRefusalCovered === true, "path and limit review is invalid");
  assert(record.stateAndOutputReview?.staticState === "attention" && record.stateAndOutputReview?.staticOk === true && record.stateAndOutputReview?.blockingFindingCount === 0 && record.stateAndOutputReview?.reviewRequired === true && record.stateAndOutputReview?.rawSourceReturned === false && record.stateAndOutputReview?.rawMatchedValuesReturned === false && record.stateAndOutputReview?.machineSpecificPathReturned === false && record.stateAndOutputReview?.sourceFilesCompiled === false, "state and output review is invalid");
  assert(record.accessibilityAndPerformance?.publicUiSurfaceChanged === false && record.accessibilityAndPerformance?.accessibilityReview === "not-applicable-no-public-ui-surface-changed" && record.accessibilityAndPerformance?.dependencyManifestPresent === false && record.accessibilityAndPerformance?.boundedStaticScan === true && record.accessibilityAndPerformance?.maxTotalBytes === 1048576, "accessibility or performance review is invalid");
  assert(record.permissionsAndClaims?.write?.length === 0 && record.permissionsAndClaims?.network?.length === 0 && record.permissionsAndClaims?.secrets?.length === 0 && record.permissionsAndClaims?.mcpTransport === "local-stdio" && record.permissionsAndClaims?.remoteEndpointDeclared === false && record.permissionsAndClaims?.environmentInjectionDeclared === false && record.permissionsAndClaims?.compilesSwift === false && record.permissionsAndClaims?.runsSwiftTests === false && record.permissionsAndClaims?.nativeRuntimeStarted === false && record.permissionsAndClaims?.publicReleaseAllowed === false && record.permissionsAndClaims?.providerOrDeploymentClaim === false, "permission or claim boundary is invalid");
  assert(record.lifecycleState?.publicReleaseAllowed === false && record.lifecycleState?.matrixFailureCount === 0, "lifecycle review is invalid");
  assert(record.historicalWave3Distribution?.classification === "immutable-wave-3-round-4-direct-card-snapshot" && record.historicalWave3Distribution?.projectionModel === "direct-source-package-marketplace-cards" && record.historicalWave3Distribution?.applicationPluginCount === HISTORICAL_INVENTORY.applicationPluginCount && record.historicalWave3Distribution?.marketplaceCardCount === HISTORICAL_INVENTORY.marketplaceCardCount && record.historicalWave3Distribution?.matrixPluginCount === HISTORICAL_INVENTORY.matrixPluginCount && record.historicalWave3Distribution?.matrixAttentionCount === HISTORICAL_INVENTORY.matrixAttentionCount && record.historicalWave3Distribution?.selectedCapability === CAPABILITY && record.historicalWave3Distribution?.selectedCapabilityHadDirectMarketplaceCard === true && record.historicalWave3Distribution?.additionalDirectCardAddedAtExecution === true, "historical Wave 3 distribution is invalid");
  assert(record.currentMarketplaceProjection?.projectionModel === "curated-bundle-cards" && record.currentMarketplaceProjection?.distributionMode === "curated-bounded-public-bundles" && record.currentMarketplaceProjection?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && record.currentMarketplaceProjection?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && record.currentMarketplaceProjection?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.currentMarketplaceProjection?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.currentMarketplaceProjection?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current marketplace card projection is invalid");
  assert(record.currentMarketplaceProjection?.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && record.currentMarketplaceProjection?.selectedApplicationCapability?.id === CAPABILITY && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardRequired === false && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardCount === 0 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleId === DISTRIBUTION_BUNDLE_ID, "current retained-source or selected-capability projection is invalid");
  assert(record.documentationAndCoverage?.publicMarketplaceNamed === true && record.documentationAndCoverage?.noCompileLimitNamed === true && record.documentationAndCoverage?.staticAttentionExplained === true && record.documentationAndCoverage?.skillNoCompileLimitNamed === true && record.documentationAndCoverage?.runtimeTestPresent === true && record.documentationAndCoverage?.evidenceTestPresent === true && record.documentationAndCoverage?.pathRefusalFixturePresent === true && record.documentationAndCoverage?.boundaryEvidenceFixturePresent === true && record.documentationAndCoverage?.runtimeBoundaryMarkerPresent === true, "documentation or coverage review is invalid");
  assert(record.checkpointDiff?.commit === CHECKPOINT_COMMIT && record.checkpointDiff?.changedFileCount === 67 && record.checkpointDiff?.unexpectedPathCount === 0 && record.checkpointDiff?.whitespaceCheckPassed === true, "checkpoint diff review is invalid");
  assert(list(record.risks).length === 4 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback review is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "review must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 3 round 4 review: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 round 4 review: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
