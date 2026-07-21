#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-activation-decision.json";
const CANDIDATE_CAPABILITY = "seis-swift-package-topology";
const BASELINE = Object.freeze({ applicationPluginCount: 73, publicCardCount: 379 });
const ACTIVATED_INVENTORY = Object.freeze({ applicationPluginCount: 74, publicCardCount: 380 });
const PATHS = Object.freeze({
  wave3Closeout: "content/development/seis-public-plugin-wave-3-closeout.json",
  followingWaveReview: "content/development/seis-public-plugin-wave-3-following-wave-review.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  marketplace: ".agents/plugins/marketplace.json",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;
const SECRET_PATTERNS = [
  { id: "openai-like-api-key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "private-key-header", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-4-activation-decision`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 activation decision check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for the Wave 4 activation decision.`);
}

function buildRecord() {
  const wave3Closeout = readJson(PATHS.wave3Closeout);
  const followingWaveReview = readJson(PATHS.followingWaveReview);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const sourceEntries = list(sourceManifest.plugins);
  const catalogEntries = list(catalog.plugins);
  const matrixEntries = list(matrix.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const candidateCounts = {
    sourceManifest: countNamed(sourceEntries, CANDIDATE_CAPABILITY),
    catalog: countNamed(catalogEntries, CANDIDATE_CAPABILITY),
    matrix: countNamed(matrixEntries, CANDIDATE_CAPABILITY),
    marketplace: countNamed(marketplaceEntries, CANDIDATE_CAPABILITY),
  };
  const baselineInventory = sourceEntries.length === BASELINE.applicationPluginCount
    && catalog.counts?.discovered === BASELINE.applicationPluginCount
    && matrix.pluginCount === BASELINE.applicationPluginCount
    && marketplaceEntries.length === BASELINE.publicCardCount
    && Object.values(candidateCounts).every((count) => count === 0);
  const postActivationInventory = sourceEntries.length === ACTIVATED_INVENTORY.applicationPluginCount
    && catalog.counts?.discovered === ACTIVATED_INVENTORY.applicationPluginCount
    && matrix.pluginCount === ACTIVATED_INVENTORY.applicationPluginCount
    && marketplaceEntries.length === ACTIVATED_INVENTORY.publicCardCount
    && Object.values(candidateCounts).every((count) => count === 1);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-4-activation-decision",
    goalId: "SEIS-GOAL-021",
    wave: 4,
    step: 0,
    status: "approved-public-local-wave-4-activation",
    maturity: "implementation-authorized",
    generatedAt: "2026-07-21",
    purpose: "Authorize only a bounded, public SEIS Repo implementation of the static Swift Package topology capability after Wave 3 closed. This decision creates no package source or marketplace card by itself and does not authorize any external, personal, release, SwiftPM, compiler, runtime, provider, deployment, or secret-bearing action.",
    stateAtDecision: {
      wave3Completed: true,
      wave4PreviouslyActivated: false,
      candidatePackageExisted: false,
      candidatePublicCardExisted: false,
      applicationPluginCountBeforeActivation: BASELINE.applicationPluginCount,
      publicCardCountBeforeActivation: BASELINE.publicCardCount,
    },
    decision: {
      selectedCapability: CANDIDATE_CAPABILITY,
      activationApproved: true,
      implementationApproved: true,
      implementationStarted: false,
      candidatePackageAuthorized: true,
      candidatePublicCardAuthorized: true,
      publicReleaseApproved: false,
      currentUserContinuationObserved: true,
      outcome: "Wave 4 may begin its documented repository-local implementation only for one fixed-manifest, read-only topology package. A public SEIS Repo card may be added only together with its source, generated projections, and successful local validation; neither is present at this decision checkpoint.",
    },
    scope: {
      canonicalRepository: "SEIS",
      fixedManifestPath: "packages/seis_platform_swift/Package.swift",
      allowedRead: ["one fixed checked-in Swift Package manifest"],
      maximumManifestBytes: 131072,
      allowedOutputs: [
        "declared platform versions",
        "library and executable product-to-target mappings",
        "target kinds and declared dependencies",
        "test-target dependencies",
        "declared executable resource mappings",
      ],
      nonGoals: [
        "Compiling, testing, describing, resolving, or running SwiftPM packages.",
        "Reading arbitrary paths, following symlinks, returning raw manifest text, or returning absolute paths.",
        "Writing files, using a network, reading secrets, calling providers, deploying, signing, installing, or releasing artifacts.",
        "Reading or mutating any personal marketplace or protected default branch.",
      ],
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
      protectedDefaultBranchWrites: false,
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
      wave3CloseoutPath: PATHS.wave3Closeout,
      followingWaveReviewPath: PATHS.followingWaveReview,
      sourceManifestPath: PATHS.sourceManifest,
      catalogPath: PATHS.catalog,
      matrixPath: PATHS.matrix,
      marketplacePath: PATHS.marketplace,
    },
    checks: {
      wave3Closeout: wave3Closeout.id === "seis-public-plugin-wave-3-closeout"
        && wave3Closeout.status === "completed-repository-local-wave-closeout"
        && wave3Closeout.completion?.completedStepCount === 100
        && wave3Closeout.completion?.nextWaveStatus === "planned-gated"
        && wave3Closeout.completion?.nextWaveActivationApproved === false,
      priorScopeReview: followingWaveReview.id === "seis-public-plugin-wave-3-following-wave-review"
        && followingWaveReview.status === "completed-following-wave-scope-review"
        && followingWaveReview.followingWaveDecision?.selectedCapability === CANDIDATE_CAPABILITY
        && followingWaveReview.followingWaveDecision?.implementationApproved === false
        && followingWaveReview.followingWaveDecision?.activationApproved === false
        && followingWaveReview.followingWaveDecision?.candidatePackageExists === false
        && followingWaveReview.followingWaveDecision?.candidatePublicCardExists === false,
      currentInventoryCompatibility: (baselineInventory || postActivationInventory)
        && matrix.failureCount === 0
        && marketplace.name === "seis-repo",
      fixedStaticBoundary: followingWaveReview.candidateContract?.input?.fixedManifestPath === "packages/seis_platform_swift/Package.swift"
        && followingWaveReview.candidateContract?.input?.maximumTextBytes === 131072
        && list(followingWaveReview.candidateContract?.permissions?.write).length === 0
        && list(followingWaveReview.candidateContract?.permissions?.network).length === 0
        && list(followingWaveReview.candidateContract?.permissions?.secrets).length === 0,
    },
    risks: [
      {
        id: "RISK-W4-005",
        status: "tracked",
        description: "Activation can be confused with a public release, independent installation, or native validation result.",
        mitigation: "Keep every external claim false, require repository-local validation, and keep public release separately approval-gated.",
      },
      {
        id: "RISK-W4-006",
        status: "tracked",
        description: "A manually parsed Package.swift file can silently infer unsupported Swift syntax.",
        mitigation: "Use a narrow grammar subset, attention states for unsupported declarations, and derived outputs only.",
      },
      {
        id: "RISK-W4-007",
        status: "tracked",
        description: "Adding a package could desynchronize source, catalog, matrix, marketplace, and count validators.",
        mitigation: "Require one atomic repository-local projection update and the full public marketplace suite before delivery.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this activation decision and any subsequently authorized Wave 4 package, card, generated evidence, and projections on the feature branch; no external state or data migration is created.",
      dataMigrationRequired: false,
    },
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-activation-decision" && record.goalId === "SEIS-GOAL-021" && record.wave === 4 && record.step === 0 && record.status === "approved-public-local-wave-4-activation" && record.maturity === "implementation-authorized", "activation decision identity is invalid");
  assert(record.stateAtDecision?.wave3Completed === true && record.stateAtDecision?.wave4PreviouslyActivated === false && record.stateAtDecision?.candidatePackageExisted === false && record.stateAtDecision?.candidatePublicCardExisted === false && record.stateAtDecision?.applicationPluginCountBeforeActivation === BASELINE.applicationPluginCount && record.stateAtDecision?.publicCardCountBeforeActivation === BASELINE.publicCardCount, "activation snapshot is invalid");
  assert(record.decision?.selectedCapability === CANDIDATE_CAPABILITY && record.decision?.activationApproved === true && record.decision?.implementationApproved === true && record.decision?.implementationStarted === false && record.decision?.candidatePackageAuthorized === true && record.decision?.candidatePublicCardAuthorized === true && record.decision?.publicReleaseApproved === false && record.decision?.currentUserContinuationObserved === true, "activation decision boundary is invalid");
  assert(record.scope?.canonicalRepository === "SEIS" && record.scope?.fixedManifestPath === "packages/seis_platform_swift/Package.swift" && record.scope?.maximumManifestBytes === 131072 && list(record.scope?.allowedRead).length === 1 && list(record.scope?.allowedOutputs).length === 5 && list(record.scope?.nonGoals).length === 4, "activation scope is invalid");
  assert(Object.values(record.checks).every(Boolean), "a required activation precondition is not current");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.protectedDefaultBranchWrites === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.externalClaims?.independentInstallation === false && record.externalClaims?.compiledSwift === false && record.externalClaims?.swiftPmTestPass === false && record.externalClaims?.nativeRuntime === false && record.externalClaims?.liveProvider === false && record.externalClaims?.deployment === false && record.externalClaims?.publicRelease === false, "external claim boundary is invalid");
  assert(list(record.risks).length === 3 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "activation risks or rollback are invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "activation inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "activation decision must not contain a machine-specific path");
}

function countNamed(entries, name) {
  return list(entries).filter((entry) => entry?.name === name).length;
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
  if (!condition) throw new Error(`SEIS public plugin Wave 4 activation decision: ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 4 activation decision: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
