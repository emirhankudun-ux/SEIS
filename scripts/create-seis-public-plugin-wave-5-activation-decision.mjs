#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const CANDIDATE = "seis-plugin-capability-coverage";
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-5-activation-decision.json";
const PATHS = Object.freeze({
  wave4Closeout: "content/development/seis-public-plugin-wave-4-closeout.json",
  wave4FollowingWaveReview: "content/development/seis-public-plugin-wave-4-following-wave-review.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  marketplace: ".agents/plugins/marketplace.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;
const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-5-activation-decision`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 5 activation decision check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for the active Wave 5 public-only scope.`);
}

function buildRecord() {
  const wave4Closeout = readJson(PATHS.wave4Closeout);
  const followingWaveReview = readJson(PATHS.wave4FollowingWaveReview);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const sourceEntries = list(sourceManifest.plugins);
  const catalogEntries = list(catalog.plugins);
  const matrixEntries = list(matrix.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const candidateBundles = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(CANDIDATE));
  const candidateBundleId = candidateBundles.length === 1 ? candidateBundles[0].id : null;
  const candidateSourcePath = `plugins/seis-core/${CANDIDATE}`;
  const candidatePresence = {
    sourceDirectory: fs.existsSync(path.join(ROOT, candidateSourcePath)),
    sourceManifest: sourceEntries.filter((entry) => entry?.name === CANDIDATE).length === 1,
    catalog: catalogEntries.filter((entry) => entry?.name === CANDIDATE).length === 1,
    matrix: matrixEntries.filter((entry) => entry?.name === CANDIDATE && entry?.ok === true).length === 1,
    directMarketplaceCardRemoved: marketplaceEntries.filter((entry) => entry?.name === CANDIDATE).length === 0,
    bundleMembership: candidateBundles.length === 1,
    bundleMarketplaceCard: Boolean(candidateBundleId && marketplaceEntries.filter((entry) => entry?.name === candidateBundleId && entry?.source?.path === `./plugins/seis-bundles/${candidateBundleId}`).length === 1),
  };
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-5-activation-decision",
    goalId: "SEIS-GOAL-021",
    parentProgramId: "seis-public-plugin-expansion-program",
    wave: 5,
    status: "approved-public-local-wave-5-activation",
    maturity: "prototype",
    generatedAt: "2026-07-21",
    purpose: "Record the separate user-authorized activation decision for one bounded public SEIS Repo capability-coverage source package and reconcile its current optional bundle projection. This decision approves only repository-local, read-only implementation and does not approve a release, merge, deployment, signing, provider access, personal marketplace access, or protected-default-branch write.",
    authority: {
      source: "active-thread-user-continuation-objective",
      permits: [
        "one fixed-registry public repository package",
        "one exact optional SEIS Repo bundle membership",
        "repository-local validation and feature-branch delivery",
      ],
      excludes: [
        "personal marketplace access",
        "network or provider activation",
        "secrets or credential reads",
        "external write actions",
        "protected default branch writes",
        "merge, release, publish, deployment, signing, or installation claims",
      ],
    },
    decision: {
      selectedCapability: CANDIDATE,
      intendedDisplayName: "SEIS Plugin Capability Coverage",
      activationApproved: true,
      implementationApproved: true,
      implementationStarted: candidatePresence.sourceDirectory,
      candidatePackageExists: candidatePresence.sourceDirectory,
      candidateDirectPublicCardExists: false,
      candidateBundleId,
      candidateBundleCardExists: candidatePresence.bundleMarketplaceCard,
      publicReleaseApproved: false,
      scope: "Read exactly five fixed checked-in public SEIS Repo registry projections and return only derived category counts, normalized capability-token frequencies, and aggregate projection reconciliation counts.",
      nonGoals: [
        "Reading or mutating a personal marketplace, arbitrary path, secret, remote service, or external system.",
        "Replacing marketplace integrity, plugin discovery, technology ontology, or canonical registry validation.",
        "Installing packages, invoking providers, compiling or running native code, deploying, signing, publishing, merging, or releasing artifacts.",
      ],
    },
    preconditions: {
      wave4Closed: wave4Closeout?.status === "completed-repository-local-wave-closeout"
        && wave4Closeout?.completion?.nextWaveSelectedCapability === CANDIDATE
        && wave4Closeout?.completion?.nextWaveImplementationApproved === false
        && wave4Closeout?.completion?.nextWaveActivationApproved === false,
      scopeReviewRetained: followingWaveReview?.status === "completed-following-wave-scope-review"
        && followingWaveReview?.followingWaveDecision?.selectedCapability === CANDIDATE
        && followingWaveReview?.followingWaveDecision?.implementationApproved === false
        && followingWaveReview?.followingWaveDecision?.activationApproved === false,
      distinctScope: list(followingWaveReview?.candidateContract?.distinctFrom).length === 4
        && list(followingWaveReview?.candidateContract?.permissions?.write).length === 0
        && list(followingWaveReview?.candidateContract?.permissions?.network).length === 0
        && list(followingWaveReview?.candidateContract?.permissions?.secrets).length === 0,
      currentCandidateProjection: Object.values(candidatePresence).every(Boolean),
      currentPublicMarketplace: marketplace?.name === "seis-repo" && marketplace?.interface?.displayName === "SEIS Repo",
    },
    currentProjection: {
      sourcePluginCount: sourceEntries.length,
      catalogPluginCount: catalogEntries.length,
      matrixPluginCount: matrixEntries.length,
      publicCardCount: marketplaceEntries.length,
      candidatePresence,
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
    permissions: {
      read: ["five fixed checked-in public SEIS Repo registry projections"],
      write: [],
      network: [],
      secrets: [],
    },
    validation: [
      "npm run check:seis-plugin-capability-coverage",
      "npm run check:seis-public-plugin-wave-5-activation-decision",
      "npm run check:seis-repo-marketplace",
      "node --test plugins/seis-core/test/plugin-capability-coverage.test.mjs",
    ],
    risks: [
      {
        id: "RISK-W5-001",
        status: "tracked",
        description: "A capability coverage report could be mistaken for a replacement for existing integrity, discovery, ontology, or canonical ownership validators.",
        mitigation: "Keep fixed inputs, aggregate-only coverage output, explicit distinctness boundaries, and existing validators unchanged.",
      },
      {
        id: "RISK-W5-002",
        status: "tracked",
        description: "Registry content could contain path or credential-like markers that leak through a report.",
        mitigation: "Refuse unsafe markers, return only aggregate derived records, and test machine-path and credential-assignment redaction.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 5 package, evidence, registry-card projection, and activation decision on the feature branch; no external state or data migration is created.",
      dataMigrationRequired: false,
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
    evidence: PATHS,
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-5-activation-decision" && record.goalId === "SEIS-GOAL-021" && record.wave === 5 && record.status === "approved-public-local-wave-5-activation" && record.maturity === "prototype", "record identity is invalid");
  assert(record.authority?.source === "active-thread-user-continuation-objective" && list(record.authority?.permits).length === 3 && list(record.authority?.excludes).length === 6, "authority boundary is invalid");
  assert(record.decision?.selectedCapability === CANDIDATE && record.decision?.activationApproved === true && record.decision?.implementationApproved === true && record.decision?.implementationStarted === true && record.decision?.candidatePackageExists === true && record.decision?.candidateDirectPublicCardExists === false && typeof record.decision?.candidateBundleId === "string" && record.decision?.candidateBundleCardExists === true && record.decision?.publicReleaseApproved === false, "activation decision is invalid");
  assert(Object.values(record.preconditions || {}).every(Boolean), "Wave 5 activation preconditions are not current");
  assert(record.currentProjection?.sourcePluginCount === record.currentProjection?.catalogPluginCount && record.currentProjection?.sourcePluginCount === record.currentProjection?.matrixPluginCount, "registry projections are not reconciled");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.protectedDefaultBranchWrites === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(list(record.permissions?.write).length === 0 && list(record.permissions?.network).length === 0 && list(record.permissions?.secrets).length === 0, "permissions must remain deny-by-default");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "activation inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "record must not contain a machine-specific path");
}

function scanPublicSafeInputs(paths) {
  const findings = [];
  for (const relativePath of paths) {
    const source = readText(relativePath);
    if (MACHINE_PATH_PATTERN.test(source)) findings.push({ path: relativePath, category: "machine-specific-path" });
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(source)) findings.push({ path: relativePath, category: "secret-like-marker" });
      pattern.lastIndex = 0;
    }
  }
  return {
    inputCount: paths.length,
    machineSpecificPathFindingCount: findings.filter((finding) => finding.category === "machine-specific-path").length,
    secretLikeFindingCount: findings.filter((finding) => finding.category === "secret-like-marker").length,
    findings,
    rawValuesStored: false,
  };
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 5 activation decision: ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 5 activation decision: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
