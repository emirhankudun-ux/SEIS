#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-capability-decision.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const BUNDLE_CATALOG_PATH = "content/development/seis-public-plugin-bundle-catalog.json";
const WAVE_2_HANDOFF_PATH = "content/development/seis-public-plugin-wave-2-handoff.json";
const WAVE_3_PROGRAM_PATH = "content/development/seis-public-plugin-wave-3-program.json";
const CANDIDATE_ID = "seis-swift-concurrency-audit";
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
  marketplaceCardCount: 379,
});
const SOURCE_ROOTS = Object.freeze([
  "packages/seis_platform_swift/Sources/SeisPlatformKit",
  "packages/seis_platform_swift/Sources/SeisAppleNativeShell",
]);
const LIMITS = Object.freeze({
  maxSwiftFiles: 64,
  maxFileBytes: 128 * 1024,
  maxTotalBytes: 1024 * 1024,
  maxRelativeDepth: 4,
  maxReportedPaths: 24,
});
const SIGNALS = Object.freeze({
  uncheckedSendable: /@unchecked\s+Sendable/g,
  mainActor: /@MainActor\b/g,
  actorDeclaration: /\bactor\s+[A-Za-z_][A-Za-z0-9_]*/g,
  sendableDeclaration: /\bSendable\b/g,
  taskDetached: /\bTask\s*\.\s*detached\b/g,
  taskMainActor: /\bTask\s*\{\s*@MainActor\b/g,
  dispatchQueue: /\bDispatchQueue\b/g,
  await: /\bawait\b/g,
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;
const CREDENTIAL_ASSIGNMENT_PATTERN = /\b(?:api[_-]?key|access[_-]?token|auth(?:entication)?[_-]?token|password|secret)\b\s*[:=]\s*["'][^"'\r\n]+["']/gi;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-3-capability-decision`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 capability decision check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for the bounded ${CANDIDATE_ID} repository-local implementation.`);
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const bundleCatalog = readJson(BUNDLE_CATALOG_PATH);
  const wave2Handoff = readJson(WAVE_2_HANDOFF_PATH);
  const wave3Program = readJson(WAVE_3_PROGRAM_PATH);
  const sourceEntries = list(sourceManifest.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const sourceCandidate = sourceEntries.find((entry) => entry?.name === CANDIDATE_ID) || null;
  const marketplaceCandidate = marketplaceEntries.find((entry) => entry?.name === CANDIDATE_ID) || null;
  const bundleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(CANDIDATE_ID));
  const distributionBundle = bundleMemberships.length === 1 ? bundleMemberships[0] : null;
  const distributionBundleCard = marketplaceEntries.find((entry) => entry?.name === distributionBundle?.id) || null;
  const currentMarketplaceProjection = buildCurrentMarketplaceProjection({
    sourceManifest,
    marketplace,
    bundleCatalog,
    sourceCandidate,
    marketplaceCandidate,
    distributionBundle,
    distributionBundleCard,
    bundleMembershipCount: bundleMemberships.length,
  });
  const sourceSnapshot = collectSourceSnapshot();

  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-3-capability-decision",
    goalId: "SEIS-GOAL-021",
    backlogId: "SEIS-BL-021",
    generatedAt: "2026-07-21",
    status: "approved-public-local-implementation",
    wave: 3,
    purpose: "Preserve the historical Wave 3 Swift concurrency audit implementation decision while proving the capability remains a retained source package discoverable through exactly one current curated SEIS Repo bundle. This remains static-only and does not claim an external installation, provider, deployment, native runtime, or public release.",
    decision: {
      selectedCapability: CANDIDATE_ID,
      displayName: "SEIS Swift Concurrency Audit",
      implementationStarted: true,
      historicalAdditionalDirectCardAddedAtExecution: true,
      historicalMarketplaceSnapshot: true,
      currentDistributionMode: "retained-source-capability-in-curated-bundle",
      selectionReason: "The existing public Apple Native Readiness package verifies declared Swift Package, source/test-presence, and platform-strategy evidence, but deliberately does not inspect concurrency annotations or static risk signals. A focused concurrency audit can provide a distinct, bounded review of checked-in Swift source markers without compiling, running, or claiming concurrency correctness.",
      implementationGate: "The Wave 3 program was activated after a focused package contract, deny-by-default runtime, deterministic fixtures, structural validation, and a direct SEIS Repo card existed. The retained source capability is now presented through one curated bundle card; this record does not convert either state into a release claim.",
      overlapReview: [
        {
          plugin: "seis-apple-native-readiness",
          decision: "retain",
          reason: "It owns Swift Package and Apple platform static readiness, not concurrency annotation or actor-isolation signal review.",
        },
        {
          plugin: "seis-workspace-inspector",
          decision: "retain",
          reason: "It inventories workspace metadata and does not provide a bounded Swift concurrency signal analysis.",
        },
        {
          plugin: "seis-technology-ontology",
          decision: "retain",
          reason: "It classifies declared technologies rather than evaluating source-level concurrency markers.",
        },
        {
          plugin: "seis-source-provenance",
          decision: "retain",
          reason: "It records source provenance and hashes without classifying Swift concurrency signals.",
        },
      ],
    },
    scope: {
      repositories: ["SEIS"],
      sourceInputs: SOURCE_ROOTS,
      dataClassification: "public-checked-in-Swift-source-metadata-and-derived-static-signals",
      outcome: "Provide a bounded static-only concurrency signal review using aggregate counts and capped repository-relative filenames, never raw source content.",
    },
    nonGoals: [
      "Compiling, testing, building, running, signing, provisioning, deploying, or releasing a Swift package or native application.",
      "Claiming actor isolation, Sendable conformance, data-race freedom, runtime correctness, simulator/device behavior, or a completed SwiftPM test result.",
      "Reading arbitrary workspace paths, following symlinks, returning raw source, machine paths, private context, or credential-like values.",
      "Reading or mutating a personal marketplace, making network calls, writing external state, or adding a card merely to increase counts.",
    ],
    acceptanceCriteria: [
      "The package uses only the fixed source roots and rejects arbitrary paths and symlinks.",
      "The package enforces file-count, file-size, total-byte, depth, and output-path limits.",
      "Its output distinguishes static attention signals from a concurrency-correctness claim and excludes raw source.",
      "Its write, network, and secret permissions remain empty.",
      "The retained capability is reconciled with exactly one current curated SEIS Repo bundle card, focused tests, plugin validation, metadata generation, and repository-local evidence.",
    ],
    implementation: {
      sourcePath: sourceCandidate?.sourcePath || null,
      marketplaceSourcePath: marketplaceCandidate?.source?.path || null,
      packageExists: sourceCandidate !== null,
      publicCardExists: marketplaceCandidate !== null,
      directMarketplaceCard: marketplaceCandidate !== null,
      distributionBundleId: distributionBundle?.id || null,
      distributionBundleSourcePath: distributionBundle?.sourcePath || null,
      distributionBundleCardExists: distributionBundleCard !== null,
      distributionBundleMembershipCount: bundleMemberships.length,
      implementationStarted: true,
      historicalAdditionalDirectCardAddedAtExecution: true,
    },
    preconditions: {
      wave2HandoffId: wave2Handoff.id || null,
      wave2HandoffStatus: wave2Handoff.status || null,
      wave3ProgramId: wave3Program.id || null,
      wave3ProgramStatus: "in-progress",
      wave3ProgramSelectionStatus: wave3Program.selection?.status || null,
      wave3ProgramSelectedCapability: wave3Program.selection?.selectedCapability ?? null,
    },
    historicalWave3Distribution: {
      classification: "immutable-wave-3-direct-card-completion-snapshot",
      observedAt: "2026-07-21",
      projectionModel: "direct-source-package-marketplace-cards",
      ...HISTORICAL_WAVE_3_DISTRIBUTION,
      selectedCapability: CANDIDATE_ID,
      selectedCapabilityHadDirectMarketplaceCard: true,
      additionalDirectCardAddedAtExecution: true,
      note: "These counts and direct-card facts are immutable Wave 3 execution history and do not describe the current curated marketplace.",
    },
    currentMarketplaceProjection,
    staticEvidence: sourceSnapshot,
    publicBoundary: {
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      publicAudience: "everyone",
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      publicReleaseAllowed: false,
      sourceCodeExecuted: false,
      compilerInvoked: false,
      nativeRuntimeStarted: false,
    },
    validation: [
      "npm run check:seis-public-plugin-wave-3-program",
      "npm run check:seis-public-plugin-wave-3-capability-decision",
      "node --test plugins/seis-core/test/public-plugin-wave-3-capability-decision.test.mjs",
      "npm run check:seis-repo-marketplace",
      "npm run check:seis-agent-plugin-integration",
    ],
    risks: [
      {
        id: "RISK-W3-001",
        status: "tracked",
        description: "Static annotations and keyword counts can be mistaken for compiler or runtime concurrency verification.",
        mitigation: "Label every result static-only, preserve no-build/no-runtime claims, and require a separately controlled execution record for any future runtime assertion.",
      },
      {
        id: "RISK-W3-002",
        status: "tracked",
        description: "A broad source scan could expose source text or machine-specific information.",
        mitigation: "Use fixed relative roots, refuse symlinks and bounds violations, emit aggregate counts and capped relative paths only, and do not serialize source text or raw matches.",
      },
      {
        id: "RISK-W3-003",
        status: "tracked",
        description: "The retained capability could be duplicated across bundles or reintroduced as a separate marketplace card.",
        mitigation: "Require exact-one bundle membership, reject direct source-package cards, retain the overlap review, and require focused and broad repository-local validation before any external release decision.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 3 capability compatibility update, generated evidence, tests, and documentation on the feature branch. It creates no external state or data migration.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function buildCurrentMarketplaceProjection({
  sourceManifest,
  marketplace,
  bundleCatalog,
  sourceCandidate,
  marketplaceCandidate,
  distributionBundle,
  distributionBundleCard,
  bundleMembershipCount,
}) {
  const marketplaceEntries = list(marketplace.plugins);
  const sourceEntries = list(sourceManifest.plugins);
  assert(marketplace.name === "seis-repo" && marketplace.interface?.displayName === "SEIS Repo", "current marketplace identity is invalid");
  assert(sourceManifest.publicDistribution?.distributionMode === "curated-bounded-public-bundles" && sourceManifest.publicDistribution?.separateMarketplaceCards === false, "current source distribution mode is invalid");
  assert(marketplaceEntries.length === CURRENT_DISTRIBUTION.publicCardCount && sourceEntries.length === CURRENT_DISTRIBUTION.applicationSourcePackageCount, "current marketplace or application-source count is invalid");
  assert(bundleCatalog.marketplace?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && bundleCatalog.marketplace?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && bundleCatalog.marketplace?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && bundleCatalog.marketplace?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && bundleCatalog.marketplace?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current bundle-card inventory is invalid");
  assert(bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && bundleCatalog.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && bundleCatalog.sourceCapabilityInventory?.sourcePackagesDeleted === false, "current retained-source inventory is invalid");
  assert(sourceCandidate?.sourcePath === `plugins/seis-core/${CANDIDATE_ID}` && marketplaceCandidate === null, "current selected capability must remain a retained source without a direct card");
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
      id: CANDIDATE_ID,
      retainedSource: true,
      sourcePath: sourceCandidate.sourcePath,
      directMarketplaceCardRequired: false,
      directMarketplaceCardCount: 0,
      bundleCardCount: 1,
      bundleId: distributionBundle.id,
      bundleSourcePath: distributionBundle.sourcePath,
      bundleFamily: distributionBundle.family,
    },
  };
}

function collectSourceSnapshot() {
  const signals = Object.fromEntries(Object.keys(SIGNALS).map((name) => [name, { count: 0, relativePaths: [] }]));
  const relativePathSets = Object.fromEntries(Object.keys(SIGNALS).map((name) => [name, new Set()]));
  const snapshot = {
    classification: "bounded-static-concurrency-signals-only",
    state: "bounded-static-signals-collected",
    sourceRoots: SOURCE_ROOTS,
    limits: LIMITS,
    rootCount: SOURCE_ROOTS.length,
    discoveredSwiftFileCount: 0,
    scannedSwiftFileCount: 0,
    boundedSwiftByteCount: 0,
    maxFileBytesObserved: 0,
    maxRelativeDepthObserved: 0,
    symlinkCount: 0,
    fileLimitExceeded: false,
    fileSizeLimitExceeded: false,
    totalByteLimitExceeded: false,
    depthLimitExceeded: false,
    unreadableFileCount: 0,
    machineSpecificPathFindingCount: 0,
    credentialAssignmentFindingCount: 0,
    rawSourceReturned: false,
    sourceFilesCompiled: false,
    roots: [],
    signals,
  };

  for (const rootRelativePath of SOURCE_ROOTS) {
    const rootPath = repositoryPath(rootRelativePath);
    const rootStat = fs.lstatSync(rootPath);
    assert(rootStat.isDirectory() && !rootStat.isSymbolicLink(), `${rootRelativePath} must be a real directory`);
    const rootRecord = { relativePath: rootRelativePath, discoveredSwiftFileCount: 0, scannedSwiftFileCount: 0 };
    snapshot.roots.push(rootRecord);
    walkSourceTree(rootPath, rootPath, rootRecord, snapshot, signals, relativePathSets);
  }

  for (const [name, pathSet] of Object.entries(relativePathSets)) {
    signals[name].relativePaths = [...pathSet].sort().slice(0, LIMITS.maxReportedPaths);
  }
  snapshot.inputSafety = {
    machineSpecificPathMarkerState: snapshot.machineSpecificPathFindingCount > 0 ? "attention" : "clear",
    credentialAssignmentMarkerState: snapshot.credentialAssignmentFindingCount > 0 ? "attention" : "clear",
    rawMatchedValuesStored: false,
  };
  return snapshot;
}

function walkSourceTree(directoryPath, sourceRootPath, rootRecord, snapshot, signals, relativePathSets) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isSymbolicLink()) {
      snapshot.symlinkCount += 1;
      continue;
    }
    if (entry.isDirectory()) {
      walkSourceTree(entryPath, sourceRootPath, rootRecord, snapshot, signals, relativePathSets);
      continue;
    }
    if (!entry.isFile() || path.extname(entry.name) !== ".swift") continue;

    const fileStat = fs.statSync(entryPath);
    const relativePath = relativeRepositoryPath(entryPath);
    const relativeDepth = sourceRelativeDepth(sourceRootPath, entryPath);
    snapshot.discoveredSwiftFileCount += 1;
    rootRecord.discoveredSwiftFileCount += 1;
    snapshot.maxFileBytesObserved = Math.max(snapshot.maxFileBytesObserved, fileStat.size);
    snapshot.maxRelativeDepthObserved = Math.max(snapshot.maxRelativeDepthObserved, relativeDepth);

    if (snapshot.discoveredSwiftFileCount > LIMITS.maxSwiftFiles) {
      snapshot.fileLimitExceeded = true;
      continue;
    }
    if (fileStat.size > LIMITS.maxFileBytes) {
      snapshot.fileSizeLimitExceeded = true;
      continue;
    }
    if (snapshot.boundedSwiftByteCount + fileStat.size > LIMITS.maxTotalBytes) {
      snapshot.totalByteLimitExceeded = true;
      continue;
    }
    if (relativeDepth > LIMITS.maxRelativeDepth) {
      snapshot.depthLimitExceeded = true;
      continue;
    }

    let source;
    try {
      source = fs.readFileSync(entryPath, "utf8");
    } catch {
      snapshot.unreadableFileCount += 1;
      continue;
    }
    snapshot.scannedSwiftFileCount += 1;
    rootRecord.scannedSwiftFileCount += 1;
    snapshot.boundedSwiftByteCount += fileStat.size;
    snapshot.machineSpecificPathFindingCount += countMatches(source, /(?:\/Users\/|\/home\/|[A-Za-z]:\\|[A-Za-z]:\/(?!\/))/g);
    snapshot.credentialAssignmentFindingCount += countMatches(source, CREDENTIAL_ASSIGNMENT_PATTERN);

    for (const [name, pattern] of Object.entries(SIGNALS)) {
      const count = countMatches(source, pattern);
      if (count === 0) continue;
      signals[name].count += count;
      relativePathSets[name].add(relativePath);
    }
  }
}

function validateRecord(record) {
  const evidence = record.staticEvidence || {};
  assert(record.id === "seis-public-plugin-wave-3-capability-decision" && record.goalId === "SEIS-GOAL-021" && record.backlogId === "SEIS-BL-021" && record.wave === 3, "decision identity is invalid");
  assert(record.status === "approved-public-local-implementation" && record.decision?.selectedCapability === CANDIDATE_ID && record.decision?.implementationStarted === true && record.decision?.historicalAdditionalDirectCardAddedAtExecution === true, "implementation decision state is invalid");
  assert(list(record.decision?.overlapReview).length === 4 && list(record.nonGoals).length === 4 && list(record.acceptanceCriteria).length === 5, "scope is incomplete");
  assert(record.implementation?.packageExists === true && record.implementation?.publicCardExists === false && record.implementation?.directMarketplaceCard === false && record.implementation?.sourcePath === `plugins/seis-core/${CANDIDATE_ID}` && record.implementation?.marketplaceSourcePath === null && record.implementation?.distributionBundleId === DISTRIBUTION_BUNDLE_ID && record.implementation?.distributionBundleSourcePath === `./plugins/seis-bundles/${DISTRIBUTION_BUNDLE_ID}` && record.implementation?.distributionBundleCardExists === true && record.implementation?.distributionBundleMembershipCount === 1 && record.implementation?.implementationStarted === true && record.implementation?.historicalAdditionalDirectCardAddedAtExecution === true, "implementation evidence is invalid");
  assert(record.preconditions?.wave2HandoffId === "seis-public-plugin-wave-2-handoff" && record.preconditions?.wave2HandoffStatus === "completed-repository-local-handoff", "Wave 2 handoff precondition is invalid");
  assert(record.preconditions?.wave3ProgramId === "seis-public-plugin-wave-3-program" && record.preconditions?.wave3ProgramStatus === "in-progress" && record.preconditions?.wave3ProgramSelectionStatus === "implementation-approved" && record.preconditions?.wave3ProgramSelectedCapability === CANDIDATE_ID, "Wave 3 implementation precondition is invalid");
  assert(record.historicalWave3Distribution?.classification === "immutable-wave-3-direct-card-completion-snapshot" && record.historicalWave3Distribution?.projectionModel === "direct-source-package-marketplace-cards" && record.historicalWave3Distribution?.applicationSourcePackageCount === HISTORICAL_WAVE_3_DISTRIBUTION.applicationSourcePackageCount && record.historicalWave3Distribution?.directApplicationCardCount === HISTORICAL_WAVE_3_DISTRIBUTION.directApplicationCardCount && record.historicalWave3Distribution?.marketplaceCardCount === HISTORICAL_WAVE_3_DISTRIBUTION.marketplaceCardCount && record.historicalWave3Distribution?.selectedCapability === CANDIDATE_ID && record.historicalWave3Distribution?.selectedCapabilityHadDirectMarketplaceCard === true && record.historicalWave3Distribution?.additionalDirectCardAddedAtExecution === true, "historical Wave 3 distribution is invalid");
  assert(record.currentMarketplaceProjection?.projectionModel === "curated-bundle-cards" && record.currentMarketplaceProjection?.distributionMode === "curated-bounded-public-bundles" && record.currentMarketplaceProjection?.marketplaceName === "seis-repo" && record.currentMarketplaceProjection?.marketplaceDisplayName === "SEIS Repo" && record.currentMarketplaceProjection?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount && record.currentMarketplaceProjection?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && record.currentMarketplaceProjection?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.currentMarketplaceProjection?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.currentMarketplaceProjection?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current marketplace card projection is invalid");
  assert(record.currentMarketplaceProjection?.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.applicationSourcePackageCount === APP_PLUGIN_EXPANSION_TARGET && record.currentMarketplaceProjection?.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount && record.currentMarketplaceProjection?.sourceCapabilityInventory?.sourcePackagesDeleted === false, "current retained-source projection is invalid");
  assert(record.currentMarketplaceProjection?.selectedApplicationCapability?.id === CANDIDATE_ID && record.currentMarketplaceProjection?.selectedApplicationCapability?.retainedSource === true && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardRequired === false && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardCount === 0 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleId === DISTRIBUTION_BUNDLE_ID && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleFamily === "application", "current selected-capability projection is invalid");
  assert(evidence.classification === "bounded-static-concurrency-signals-only" && evidence.state === "bounded-static-signals-collected" && evidence.rootCount === SOURCE_ROOTS.length && evidence.discoveredSwiftFileCount > 0 && evidence.discoveredSwiftFileCount <= LIMITS.maxSwiftFiles && evidence.scannedSwiftFileCount === evidence.discoveredSwiftFileCount && evidence.boundedSwiftByteCount <= LIMITS.maxTotalBytes && evidence.maxFileBytesObserved <= LIMITS.maxFileBytes && evidence.maxRelativeDepthObserved <= LIMITS.maxRelativeDepth, "static source bounds are invalid");
  assert(evidence.symlinkCount === 0 && evidence.fileLimitExceeded === false && evidence.fileSizeLimitExceeded === false && evidence.totalByteLimitExceeded === false && evidence.depthLimitExceeded === false && evidence.unreadableFileCount === 0, "static source traversal is unsafe or incomplete");
  assert(evidence.machineSpecificPathFindingCount >= 0 && evidence.credentialAssignmentFindingCount === 0 && evidence.rawSourceReturned === false && evidence.sourceFilesCompiled === false && evidence.inputSafety?.rawMatchedValuesStored === false, "static evidence safety boundary is invalid");
  assert((evidence.signals?.uncheckedSendable?.count || 0) + (evidence.signals?.mainActor?.count || 0) + (evidence.signals?.sendableDeclaration?.count || 0) + (evidence.signals?.await?.count || 0) > 0, "candidate must have real static concurrency signals");
  assert(Object.values(evidence.signals || {}).every((signal) => signal?.relativePaths?.length <= LIMITS.maxReportedPaths), "reported paths exceed the output limit");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false && record.publicBoundary?.sourceCodeExecuted === false && record.publicBoundary?.compilerInvoked === false && record.publicBoundary?.nativeRuntimeStarted === false, "public safety boundary is invalid");
  assert(list(record.risks).length === 3 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "decision record must not contain a machine-specific path");
}

function repositoryPath(relativePath) {
  const repositoryRoot = path.resolve(ROOT);
  const absolutePath = path.resolve(repositoryRoot, relativePath);
  assert(absolutePath.startsWith(`${repositoryRoot}${path.sep}`), "source path escapes repository root");
  return absolutePath;
}

function relativeRepositoryPath(absolutePath) {
  return path.relative(ROOT, absolutePath).split(path.sep).join("/");
}

function sourceRelativeDepth(sourceRootPath, filePath) {
  const relative = path.relative(sourceRootPath, filePath);
  return Math.max(0, relative.split(path.sep).length - 1);
}

function countMatches(value, pattern) {
  const expression = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  return [...value.matchAll(expression)].length;
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = repositoryPath(relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 3 capability decision: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = repositoryPath(relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 3 capability decision: ${message}`);
}
