#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-following-wave-review.json";
const CANDIDATE_CAPABILITY = "seis-swift-package-topology";
const CANDIDATE_SOURCE_PATH = `plugins/seis-core/${CANDIDATE_CAPABILITY}`;
const PACKAGE_MANIFEST_PATH = "packages/seis_platform_swift/Package.swift";
const MAX_MANIFEST_BYTES = 128 * 1024;
const HISTORICAL_APPLICATION_PLUGIN_COUNT = 73;
const HISTORICAL_PUBLIC_CARD_COUNT = 379;
const INTEGRATED_APPLICATION_PLUGIN_COUNT = 74;
const INTEGRATED_PUBLIC_CARD_COUNT = 380;
const ACTIVE_WAVE_5_APPLICATION_PLUGIN_COUNT = 75;
const ACTIVE_WAVE_5_PUBLIC_CARD_COUNT = 381;
const ACTIVE_WAVE_5_CAPABILITY = "seis-plugin-capability-coverage";
const PATHS = Object.freeze({
  repositoryLocalHandoff: "content/development/seis-public-plugin-wave-3-repository-local-handoff.json",
  wave2FollowUpDecision: "content/development/seis-public-plugin-wave-2-follow-up-decision.json",
  appleReadinessEvidence: "content/development/seis-apple-native-readiness.json",
  swiftConcurrencyEvidence: "content/development/seis-swift-concurrency-audit.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  marketplace: ".agents/plugins/marketplace.json",
});
const REQUIRED_MANIFEST_MARKERS = Object.freeze([
  'name: "SeisPlatformKit"',
  ".macOS(.v13)",
  ".iOS(.v16)",
  '.library(name: "SeisPlatformKit"',
  '.executable(name: "SeisAppleNativeShell"',
  '.target(name: "SeisPlatformKit")',
  ".executableTarget(",
  '.testTarget(name: "SeisPlatformKitTests"',
]);
const SECRET_PATTERNS = [
  { id: "openai-like-api-key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "private-key-header", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-3-following-wave-review");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 following-wave review check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 3 step 98.");
}

function buildRecord() {
  const handoff = readJson(PATHS.repositoryLocalHandoff);
  const wave2FollowUpDecision = readJson(PATHS.wave2FollowUpDecision);
  const appleReadinessEvidence = readJson(PATHS.appleReadinessEvidence);
  const swiftConcurrencyEvidence = readJson(PATHS.swiftConcurrencyEvidence);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const manifestText = readBoundedRegularText(PACKAGE_MANIFEST_PATH);
  const sourceEntries = list(sourceManifest.plugins);
  const catalogEntries = list(catalog.plugins);
  const matrixEntries = list(matrix.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const appleCatalogEntry = catalogEntries.find((entry) => entry?.name === "seis-apple-native-readiness") || null;
  const concurrencyCatalogEntry = catalogEntries.find((entry) => entry?.name === "seis-swift-concurrency-audit") || null;
  const adoptionCatalogEntry = catalogEntries.find((entry) => entry?.name === "seis-package-adoption") || null;
  assertSupportedCurrentInventory({ sourceEntries, catalog, catalogEntries, matrix, matrixEntries, marketplace, marketplaceEntries });
  const inputSafetyScan = scanPublicSafeInputs([...Object.values(PATHS), PACKAGE_MANIFEST_PATH]);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-3-following-wave-review",
    goalId: "SEIS-GOAL-021",
    wave: 3,
    step: 98,
    status: "completed-following-wave-scope-review",
    generatedAt: "2026-07-21",
    purpose: "Decide whether a following public SEIS Repo wave is justified by current repository evidence rather than cadence alone, without creating a package or card, activating Wave 4, claiming Swift execution, or changing the public release boundary.",
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 97,
      activeStepBeforeTrackerUpdate: 98,
      nextPlannedDecisionStep: 99,
      wave3Completed: false,
      wave4Activated: false,
    },
    checks: {
      predecessorHandoff: handoff.id === "seis-public-plugin-wave-3-repository-local-handoff"
        && handoff.status === "completed-repository-local-handoff"
        && handoff.step === 97
        && handoff.stateAtCheckpoint?.waveCompleted === false
        && handoff.futureWaveDecision?.activationApproved === false,
      priorFollowUpRequirement: wave2FollowUpDecision.id === "seis-public-plugin-wave-2-follow-up-decision"
        && wave2FollowUpDecision.status === "completed-no-additional-public-plugin-selected"
        && wave2FollowUpDecision.decision?.futureSelectionRequirement?.includes("unique contract beyond static readiness")
        && wave2FollowUpDecision.decision?.futureSelectionRequirement?.includes("reviewed reason why execution evidence remains unavailable")
        && wave2FollowUpDecision.externalValidationGap?.status === "approval-required"
        && wave2FollowUpDecision.swiftPmEvidence?.validationBoundary?.compiledSwiftClaim === false
        && wave2FollowUpDecision.swiftPmEvidence?.validationBoundary?.testPassClaim === false,
      currentPublicInventory: true,
      candidateIsNotAlreadyPublished: true,
      existingCapabilityBoundaries: appleReadinessEvidence.id === "seis-apple-native-readiness"
        && appleReadinessEvidence.audit?.classification === "documented-static-readiness-only"
        && appleReadinessEvidence.safety?.compilesSwift === false
        && swiftConcurrencyEvidence.id === "seis-swift-concurrency-audit"
        && swiftConcurrencyEvidence.audit?.classification === "bounded-static-concurrency-signals-only"
        && swiftConcurrencyEvidence.safety?.compilesSwift === false
        && swiftConcurrencyEvidence.safety?.runsSwiftTests === false
        && typeof appleCatalogEntry?.description === "string"
        && appleCatalogEntry.description.includes("source, test, strategy")
        && typeof concurrencyCatalogEntry?.description === "string"
        && concurrencyCatalogEntry.description.includes("concurrency markers")
        && typeof adoptionCatalogEntry?.description === "string"
        && adoptionCatalogEntry.description.includes("recorded package adoption signals"),
      boundedManifestEvidence: manifestText.length > 0
        && manifestText.length <= MAX_MANIFEST_BYTES
        && REQUIRED_MANIFEST_MARKERS.every((marker) => manifestText.includes(marker)),
    },
    followingWaveDecision: {
      wave: 4,
      status: "candidate-identified-plan-required",
      activationApproved: false,
      implementationApproved: false,
      selectedCapability: CANDIDATE_CAPABILITY,
      candidatePackageExists: false,
      candidatePublicCardExists: false,
      outcome: "A narrowly bounded manifest-topology capability is justified for a later plan because it formalizes a reusable public static contract that the existing readiness, concurrency, and adoption packages do not own. The candidate remains unimplemented until a separate 100-step plan, risk review, and activation decision are complete.",
      reviewedExecutionLimit: "The prior SwiftPM result remains incomplete and unclaimed. This candidate is limited to checked-in manifest topology and must not imply SwiftPM, compiler, test, signing, simulator, device, runtime, provider, deployment, installation, or release proof.",
    },
    candidateContract: {
      packageName: CANDIDATE_CAPABILITY,
      intendedDisplayName: "SEIS Swift Package Topology",
      maturity: "planned",
      input: {
        fixedManifestPath: PACKAGE_MANIFEST_PATH,
        allowedRead: ["one fixed checked-in Swift Package manifest"],
        maximumTextBytes: MAX_MANIFEST_BYTES,
        regularFileRequired: true,
        symlinkRefusal: true,
      },
      output: [
        "declared platform versions",
        "library and executable product to target mappings",
        "target kinds and declared dependencies",
        "test-target dependencies",
        "declared executable resource mappings",
      ],
      distinctFrom: [
        {
          package: "seis-apple-native-readiness",
          boundary: "It verifies static markers, source/test presence, and platform strategy; it does not provide a reusable graph relation report for product, target, dependency, and resource mappings.",
        },
        {
          package: "seis-swift-concurrency-audit",
          boundary: "It analyzes bounded Swift source concurrency signals; it does not parse the Swift Package manifest topology.",
        },
        {
          package: "seis-package-adoption",
          boundary: "It summarizes recorded adoption signals; it does not inspect checked-in package topology.",
        },
      ],
      nonGoals: [
        "Compiling, testing, describing, resolving, or running SwiftPM packages.",
        "Reading arbitrary paths, traversing source trees, or following symlinks.",
        "Claiming graph validity, compiler correctness, runtime behavior, signing, installation, deployment, provider behavior, or public release.",
        "Adding a source directory, public card, dependency, permission, network call, secret, external write, or personal marketplace access during this review.",
      ],
      permissions: {
        read: ["one fixed checked-in Swift Package manifest"],
        write: [],
        network: [],
        secrets: [],
      },
    },
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
      publicRelease: false,
    },
    evidence: {
      predecessorHandoffPath: PATHS.repositoryLocalHandoff,
      priorFollowUpDecisionPath: PATHS.wave2FollowUpDecision,
      appleReadinessEvidencePath: PATHS.appleReadinessEvidence,
      swiftConcurrencyEvidencePath: PATHS.swiftConcurrencyEvidence,
      sourceManifestPath: PATHS.sourceManifest,
      catalogPath: PATHS.catalog,
      matrixPath: PATHS.matrix,
      marketplacePath: PATHS.marketplace,
      reviewedManifestPath: PACKAGE_MANIFEST_PATH,
    },
    validation: [
      "npm run check:seis-public-plugin-wave-3-following-wave-review",
      "npm run check:seis-public-plugin-wave-3-program",
      "npm run check:seis-public-plugin-continuity-cadence",
      "npm run check:seis-repo-marketplace",
      "node --test plugins/seis-core/test/public-plugin-wave-3-following-wave-review.test.mjs",
    ],
    risks: [
      {
        id: "RISK-W3-016",
        status: "tracked",
        description: "A static package topology report could duplicate Apple readiness or be misread as a compiled SwiftPM graph.",
        mitigation: "Restrict the contract to product, target, dependency, and resource relationships; retain compiler, SwiftPM, runtime, and release claims as false.",
      },
      {
        id: "RISK-W3-017",
        status: "tracked",
        description: "Selecting a later capability candidate could be mistaken for Wave 4 activation or a new public card.",
        mitigation: "Keep implementationApproved and activationApproved false, preserve candidate absence across source/catalog/matrix/marketplace, and require step 99 planning before any implementation.",
      },
      {
        id: "RISK-W3-018",
        status: "tracked",
        description: "Manifest text could expose unsafe local information if future scope expands beyond the fixed checked-in file.",
        mitigation: "Use one fixed regular-file path, cap text size, refuse symlinks, return derived topology only, and retain no raw text in the evidence record.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this focused Wave 3 following-wave review and tracker references on the feature branch; no package, card, external state, release, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function assertSupportedCurrentInventory({ sourceEntries, catalog, catalogEntries, matrix, matrixEntries, marketplace, marketplaceEntries }) {
  const historicalInventory = sourceEntries.length === HISTORICAL_APPLICATION_PLUGIN_COUNT
    && catalog.counts?.discovered === HISTORICAL_APPLICATION_PLUGIN_COUNT
    && matrix.pluginCount === HISTORICAL_APPLICATION_PLUGIN_COUNT
    && matrix.failureCount === 0
    && marketplace.name === "seis-repo"
    && marketplaceEntries.length === HISTORICAL_PUBLIC_CARD_COUNT;
  const integratedWave4Inventory = sourceEntries.length === INTEGRATED_APPLICATION_PLUGIN_COUNT
    && catalog.counts?.discovered === INTEGRATED_APPLICATION_PLUGIN_COUNT
    && matrix.pluginCount === INTEGRATED_APPLICATION_PLUGIN_COUNT
    && matrix.failureCount === 0
    && marketplace.name === "seis-repo"
    && marketplaceEntries.length === INTEGRATED_PUBLIC_CARD_COUNT
    && fs.existsSync(path.join(ROOT, CANDIDATE_SOURCE_PATH))
    && sourceEntries.some((entry) => entry?.name === CANDIDATE_CAPABILITY)
    && catalogEntries.some((entry) => entry?.name === CANDIDATE_CAPABILITY)
    && matrixEntries.some((entry) => entry?.name === CANDIDATE_CAPABILITY)
    && marketplaceEntries.some((entry) => entry?.name === CANDIDATE_CAPABILITY && entry?.source?.path === `./plugins/seis-core/${CANDIDATE_CAPABILITY}`);
  const activeWave5Inventory = sourceEntries.length === ACTIVE_WAVE_5_APPLICATION_PLUGIN_COUNT
    && catalog.counts?.discovered === ACTIVE_WAVE_5_APPLICATION_PLUGIN_COUNT
    && matrix.pluginCount === ACTIVE_WAVE_5_APPLICATION_PLUGIN_COUNT
    && matrix.failureCount === 0
    && marketplace.name === "seis-repo"
    && marketplaceEntries.length === ACTIVE_WAVE_5_PUBLIC_CARD_COUNT
    && fs.existsSync(path.join(ROOT, CANDIDATE_SOURCE_PATH))
    && fs.existsSync(path.join(ROOT, "plugins", "seis-core", ACTIVE_WAVE_5_CAPABILITY))
    && sourceEntries.some((entry) => entry?.name === CANDIDATE_CAPABILITY)
    && sourceEntries.some((entry) => entry?.name === ACTIVE_WAVE_5_CAPABILITY)
    && catalogEntries.some((entry) => entry?.name === CANDIDATE_CAPABILITY)
    && catalogEntries.some((entry) => entry?.name === ACTIVE_WAVE_5_CAPABILITY)
    && matrixEntries.some((entry) => entry?.name === CANDIDATE_CAPABILITY)
    && matrixEntries.some((entry) => entry?.name === ACTIVE_WAVE_5_CAPABILITY)
    && marketplaceEntries.some((entry) => entry?.name === CANDIDATE_CAPABILITY && entry?.source?.path === `./plugins/seis-core/${CANDIDATE_CAPABILITY}`)
    && marketplaceEntries.some((entry) => entry?.name === ACTIVE_WAVE_5_CAPABILITY && entry?.source?.path === `./plugins/seis-core/${ACTIVE_WAVE_5_CAPABILITY}`);
  assert(historicalInventory || integratedWave4Inventory || activeWave5Inventory, "current inventory is neither the Wave 3 snapshot, the one-package Wave 4 integration, nor the active Wave 5 coverage state");
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-3-following-wave-review" && record.goalId === "SEIS-GOAL-021" && record.wave === 3 && record.step === 98 && record.status === "completed-following-wave-scope-review", "following-wave review identity is invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 97 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 98 && record.stateAtCheckpoint?.nextPlannedDecisionStep === 99 && record.stateAtCheckpoint?.wave3Completed === false && record.stateAtCheckpoint?.wave4Activated === false, "following-wave review state snapshot is invalid");
  assert(Object.values(record.checks).every(Boolean), "a required following-wave review contract is not current");
  assert(record.followingWaveDecision?.wave === 4 && record.followingWaveDecision?.status === "candidate-identified-plan-required" && record.followingWaveDecision?.activationApproved === false && record.followingWaveDecision?.implementationApproved === false && record.followingWaveDecision?.selectedCapability === CANDIDATE_CAPABILITY && record.followingWaveDecision?.candidatePackageExists === false && record.followingWaveDecision?.candidatePublicCardExists === false, "following-wave activation boundary is invalid");
  assert(record.candidateContract?.packageName === CANDIDATE_CAPABILITY && record.candidateContract?.input?.fixedManifestPath === PACKAGE_MANIFEST_PATH && list(record.candidateContract?.input?.allowedRead).join(",") === "one fixed checked-in Swift Package manifest" && record.candidateContract?.input?.maximumTextBytes === MAX_MANIFEST_BYTES && record.candidateContract?.input?.regularFileRequired === true && record.candidateContract?.input?.symlinkRefusal === true, "candidate input boundary is invalid");
  assert(list(record.candidateContract?.output).length === 5 && list(record.candidateContract?.distinctFrom).length === 3 && list(record.candidateContract?.nonGoals).length === 4, "candidate contract is incomplete");
  assert(list(record.candidateContract?.permissions?.write).length === 0 && list(record.candidateContract?.permissions?.network).length === 0 && list(record.candidateContract?.permissions?.secrets).length === 0, "candidate permission boundary is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.externalClaims?.independentInstallation === false && record.externalClaims?.compiledSwift === false && record.externalClaims?.swiftPmTestPass === false && record.externalClaims?.nativeRuntime === false && record.externalClaims?.liveProvider === false && record.externalClaims?.deployment === false && record.externalClaims?.publicRelease === false, "external claim boundary is invalid");
  assert(list(record.risks).length === 3 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "following-wave review inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "following-wave review record must not contain a machine-specific path");
}

function readBoundedRegularText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 following-wave review: required input is missing: " + relativePath);
  const stat = fs.lstatSync(absolutePath);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_MANIFEST_BYTES) {
    throw new Error("SEIS public plugin Wave 3 following-wave review: manifest input is unsafe or exceeds its bound");
  }
  return fs.readFileSync(absolutePath, "utf8");
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

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 3 following-wave review: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 following-wave review: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
