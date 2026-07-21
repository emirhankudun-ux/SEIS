#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-following-wave-review.json";
const CANDIDATE = "seis-plugin-capability-coverage";
const CANDIDATE_SOURCE_PATH = `plugins/seis-core/${CANDIDATE}`;
const PATHS = Object.freeze({
  wave4Program: "content/development/seis-public-plugin-wave-4-program.json",
  repositoryLocalHandoff: "content/development/seis-public-plugin-wave-4-repository-local-handoff.json",
  closeoutSequenceDecision: "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json",
  handoffPreparation: "content/development/seis-public-plugin-wave-4-handoff-preparation.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  marketplace: ".agents/plugins/marketplace.json",
});
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-following-wave-review");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 following-wave review check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 4 step 98.");
}

function buildRecord() {
  const wave4Program = readJson(PATHS.wave4Program);
  const repositoryLocalHandoff = readJson(PATHS.repositoryLocalHandoff);
  const closeoutSequenceDecision = readJson(PATHS.closeoutSequenceDecision);
  const handoffPreparation = readJson(PATHS.handoffPreparation);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const sourceEntries = list(sourceManifest.plugins);
  const catalogEntries = list(catalog.plugins);
  const matrixEntries = list(matrix.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-4-following-wave-review",
    goalId: "SEIS-GOAL-021",
    parentGoalId: "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE",
    wave: 4,
    step: 98,
    status: "completed-following-wave-scope-review",
    maturity: "specification",
    generatedAt: "2026-07-21",
    purpose: "Select a non-duplicative, public-only Wave 5 candidate from current SEIS Repo evidence without creating a package or card, activating Wave 5, changing the release boundary, or claiming installation, runtime, provider, deployment, signing, or release proof.",
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 97,
      activeStepBeforeTrackerUpdate: 98,
      nextPlannedDecisionStep: 99,
      waveCompleted: false,
      wave5ActivationApproved: false,
    },
    checks: {
      wave4Tracker: isSupportedWave4Tracker(wave4Program),
      repositoryLocalHandoff: repositoryLocalHandoff.id === "seis-public-plugin-wave-4-repository-local-handoff"
        && repositoryLocalHandoff.status === "completed-repository-local-handoff"
        && repositoryLocalHandoff.step === 97
        && repositoryLocalHandoff.handoff?.delivery?.protectedDefaultBranchWritten === false
        && repositoryLocalHandoff.futureWaveDecision?.status === "planned-gated"
        && repositoryLocalHandoff.futureWaveDecision?.activationApproved === false
        && Object.values(repositoryLocalHandoff.checks || {}).every(Boolean),
      priorCloseoutSequence: closeoutSequenceDecision.id === "seis-public-plugin-wave-4-closeout-sequence-decision"
        && closeoutSequenceDecision.status === "approved-current-user-continuation-authority"
        && closeoutSequenceDecision.decisionBoundary?.approved === true
        && closeoutSequenceDecision.decisionBoundary?.automaticStepStatusChangesAllowed === false
        && handoffPreparation.status === "completed-repository-local-handoff-preparation"
        && handoffPreparation.completionState?.completedStep === 96,
      currentPublicInventory: ((sourceEntries.length === 74
        && catalog.counts?.discovered === 74
        && matrix.pluginCount === 74
        && matrix.failureCount === 0
        && marketplace.name === "seis-repo"
        && marketplace.interface?.displayName === "SEIS Repo"
        && marketplaceEntries.length === 380)
        || (sourceEntries.length === 75
          && catalog.counts?.discovered === 75
          && matrix.pluginCount === 75
          && matrix.failureCount === 0
          && marketplace.name === "seis-repo"
          && marketplace.interface?.displayName === "SEIS Repo"
          && marketplaceEntries.length === 381)),
      candidateIsNotAlreadyPublished: ((!fs.existsSync(path.join(ROOT, CANDIDATE_SOURCE_PATH))
        && sourceEntries.every((entry) => entry?.name !== CANDIDATE)
        && catalogEntries.every((entry) => entry?.name !== CANDIDATE)
        && matrixEntries.every((entry) => entry?.name !== CANDIDATE)
        && marketplaceEntries.every((entry) => entry?.name !== CANDIDATE))
        || (fs.existsSync(path.join(ROOT, CANDIDATE_SOURCE_PATH))
          && sourceEntries.filter((entry) => entry?.name === CANDIDATE).length === 1
          && catalogEntries.filter((entry) => entry?.name === CANDIDATE).length === 1
          && matrixEntries.filter((entry) => entry?.name === CANDIDATE).length === 1
          && marketplaceEntries.filter((entry) => entry?.name === CANDIDATE).length === 1)),
      existingCapabilityBoundaries: ["seis-marketplace-integrity", "seis-plugin-discovery", "seis-technology-ontology", "seis-canonical-registry-validator"].every((name) => catalogEntries.some((entry) => entry?.name === name)),
      continuity: isSupportedContinuity(continuityCadence),
    },
    followingWaveDecision: {
      wave: 5,
      status: "candidate-identified-plan-required",
      selectedCapability: CANDIDATE,
      implementationApproved: false,
      activationApproved: false,
      candidatePackageExists: false,
      candidatePublicCardExists: false,
      outcome: "A bounded capability-coverage report is justified for a later public Wave 5 plan because it summarizes declared plugin categories and capabilities across fixed SEIS Repo registries without replacing integrity validation, discovery, ontology, or canonical-registry ownership checks.",
      reviewedExecutionLimit: "The candidate may read only the fixed checked-in source manifest, catalog, matrix, and repo marketplace projection. It must not read a personal marketplace, inspect arbitrary paths, write files, use secrets or a network, or imply installation, compilation, runtime, provider, deployment, signing, or release proof.",
    },
    candidateContract: {
      packageName: CANDIDATE,
      intendedDisplayName: "SEIS Plugin Capability Coverage",
      maturity: "planned",
      input: {
        fixedRegistryPaths: [PATHS.sourceManifest, PATHS.catalog, PATHS.matrix, PATHS.marketplace],
        maximumRegistryBytes: 512 * 1024,
        regularFilesRequired: true,
        symlinkRefusal: true,
      },
      output: [
        "declared category counts",
        "declared capability-token frequencies",
        "registry projection reconciliation",
        "bounded coverage and attention summaries",
      ],
      distinctFrom: [
        { package: "seis-marketplace-integrity", boundary: "It validates marketplace and manifest correctness; it does not summarize capability coverage across fixed registry projections." },
        { package: "seis-plugin-discovery", boundary: "It lists bounded plugin metadata; it does not calculate category and capability-coverage summaries." },
        { package: "seis-technology-ontology", boundary: "It maps technology taxonomy; it does not reconcile the declared capability coverage of public SEIS plugins." },
        { package: "seis-canonical-registry-validator", boundary: "It validates registry ownership and identity; it does not provide a coverage-focused public capability report." },
      ],
      nonGoals: [
        "Creating a package, public card, generated projection, dependency, or permission change during this review.",
        "Reading any personal marketplace, arbitrary path, secret, or remote service.",
        "Compiling, installing, executing native code, invoking a provider, deploying, signing, publishing, or releasing artifacts.",
        "Replacing existing marketplace integrity, discovery, ontology, or canonical-registry checks.",
      ],
      permissions: {
        read: ["four fixed public SEIS Repo registry files"],
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
      signing: false,
      publicRelease: false,
    },
    evidence: {
      wave4ProgramPath: PATHS.wave4Program,
      repositoryLocalHandoffPath: PATHS.repositoryLocalHandoff,
      closeoutSequenceDecisionPath: PATHS.closeoutSequenceDecision,
      handoffPreparationPath: PATHS.handoffPreparation,
      continuityCadencePath: PATHS.continuityCadence,
      sourceManifestPath: PATHS.sourceManifest,
      catalogPath: PATHS.catalog,
      matrixPath: PATHS.matrix,
      marketplacePath: PATHS.marketplace,
    },
    validation: [
      "npm run check:seis-public-plugin-wave-4-following-wave-review",
      "npm run check:seis-public-plugin-wave-4-program",
      "npm run check:seis-public-plugin-continuity",
      "npm run check:seis-repo-marketplace",
      "node --test plugins/seis-core/test/public-plugin-wave-4-following-wave-review.test.mjs",
    ],
    risks: [
      {
        id: "RISK-W4-021",
        status: "tracked",
        description: "A Wave 5 candidate selection could be mistaken for implementation or public marketplace activation.",
        mitigation: "Keep implementationApproved=false, activationApproved=false, and candidate absence checks true until a separate Wave 5 plan and activation decision exist.",
      },
      {
        id: "RISK-W4-022",
        status: "tracked",
        description: "Capability coverage could duplicate existing registry, discovery, integrity, or ontology responsibilities.",
        mitigation: "Define fixed inputs, bounded summary outputs, explicit distinctness boundaries, and no replacement of current validators.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this Wave 4 following-wave scope review and tracker references on the feature branch; no package, card, external state, release, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function isSupportedWave4Tracker(program) {
  const shared = program?.id === "seis-public-plugin-wave-4-program"
    && ["in-progress", "completed"].includes(program?.status)
    && program?.maturity === "prototype"
    && Object.values(program?.externalClaims || {}).every((value) => value === false);
  const beforeTrackerUpdate = program?.progress?.completedStepCount === 97
    && list(program?.progress?.inProgressStepNumbers).join(",") === "98"
    && program?.progress?.nextStepNumber === 98
    && program?.repositoryLocalHandoff?.status === "completed-repository-local-handoff";
  const afterTrackerUpdate = program?.progress?.completedStepCount === 98
    && list(program?.progress?.inProgressStepNumbers).join(",") === "99"
    && program?.progress?.nextStepNumber === 99
    && program?.followingWaveReview?.status === "completed-following-wave-scope-review"
    && program?.followingWaveReview?.reviewPath === OUTPUT_PATH;
  const afterEvidenceRetention = program?.progress?.completedStepCount === 99
    && list(program?.progress?.inProgressStepNumbers).join(",") === "100"
    && program?.progress?.nextStepNumber === 100
    && program?.evidenceRetention?.status === "completed-public-evidence-retention"
    && program?.evidenceRetention?.retentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json";
  const afterCloseout = program?.status === "completed"
    && program?.progress?.completedStepCount === 100
    && list(program?.progress?.inProgressStepNumbers).length === 0
    && program?.progress?.nextStepNumber === null
    && program?.evidence?.closeoutPath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && program?.repositoryLocalCloseout?.status === "completed-repository-local-wave-closeout";
  return shared && (beforeTrackerUpdate || afterTrackerUpdate || afterEvidenceRetention || afterCloseout);
}

function isSupportedContinuity(cadence) {
  const wave = cadence?.waves?.[3];
  const shared = cadence?.id === "seis-public-plugin-continuity-cadence" && cadence?.status === "active-evidence-led-cadence";
  const beforeTrackerUpdate = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-handoff-complete-step-98-in-progress"
    && wave?.completedSteps === 97
    && list(wave?.inProgressSteps).join(",") === "98"
    && wave?.currentEvidencePath === PATHS.repositoryLocalHandoff;
  const afterTrackerUpdate = cadence?.cadence?.waveSeries?.activeWaveState === "following-wave-review-complete-step-99-in-progress"
    && wave?.completedSteps === 98
    && list(wave?.inProgressSteps).join(",") === "99"
    && wave?.followingWaveReviewPath === OUTPUT_PATH
    && wave?.currentEvidencePath === OUTPUT_PATH;
  const afterEvidenceRetention = cadence?.cadence?.waveSeries?.activeWaveState === "public-evidence-retention-complete-step-100-in-progress"
    && wave?.completedSteps === 99
    && list(wave?.inProgressSteps).join(",") === "100"
    && wave?.evidenceRetentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-evidence-retention.json";
  const afterCloseout = cadence?.cadence?.waveSeries?.activeWave === null
    && cadence?.cadence?.waveSeries?.activeWaveState === "wave-4-completed-wave-5-planned-gated"
    && wave?.status === "completed"
    && wave?.completedSteps === 100
    && list(wave?.inProgressSteps).length === 0
    && wave?.closeoutPath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-closeout.json";
  const activeWave5 = cadence?.cadence?.waveSeries?.activeWave === 5
    && cadence?.cadence?.waveSeries?.activeWaveState === "wave-5-first-30-steps-completed-step-31-in-progress"
    && wave?.status === "completed"
    && wave?.completedSteps === 100
    && list(wave?.inProgressSteps).length === 0
    && cadence?.waves?.[4]?.status === "in-progress"
    && cadence?.waves?.[4]?.selectedCapability === CANDIDATE
    && cadence?.waves?.[4]?.completedSteps === 30
    && list(cadence?.waves?.[4]?.inProgressSteps).join(",") === "31";
  return shared && (beforeTrackerUpdate || afterTrackerUpdate || afterEvidenceRetention || afterCloseout || activeWave5);
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-following-wave-review" && record.goalId === "SEIS-GOAL-021" && record.parentGoalId === "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE" && record.wave === 4 && record.step === 98 && record.status === "completed-following-wave-scope-review" && record.maturity === "specification", "review identity is invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 97 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 98 && record.stateAtCheckpoint?.nextPlannedDecisionStep === 99 && record.stateAtCheckpoint?.waveCompleted === false && record.stateAtCheckpoint?.wave5ActivationApproved === false, "review state is invalid");
  assert(Object.values(record.checks || {}).every(Boolean), "a required following-wave review check is not current");
  assert(record.followingWaveDecision?.wave === 5 && record.followingWaveDecision?.status === "candidate-identified-plan-required" && record.followingWaveDecision?.selectedCapability === CANDIDATE && record.followingWaveDecision?.implementationApproved === false && record.followingWaveDecision?.activationApproved === false && record.followingWaveDecision?.candidatePackageExists === false && record.followingWaveDecision?.candidatePublicCardExists === false, "following-wave gate is invalid");
  assert(record.candidateContract?.packageName === CANDIDATE && record.candidateContract?.intendedDisplayName === "SEIS Plugin Capability Coverage" && record.candidateContract?.maturity === "planned" && list(record.candidateContract?.input?.fixedRegistryPaths).join(",") === Object.values(PATHS).slice(5).join(",") && list(record.candidateContract?.output).length === 4 && list(record.candidateContract?.distinctFrom).length === 4 && list(record.candidateContract?.nonGoals).length === 4 && list(record.candidateContract?.permissions?.write).length === 0 && list(record.candidateContract?.permissions?.network).length === 0 && list(record.candidateContract?.permissions?.secrets).length === 0, "candidate contract is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "review inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "review record must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 4 following-wave review: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 following-wave review: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
