#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-closeout.json";
const MAX_INPUT_BYTES = 2 * 1024 * 1024;
const PATHS = Object.freeze({
  wave4Program: "content/development/seis-public-plugin-wave-4-program.json",
  evidenceRetention: "content/development/seis-public-plugin-wave-4-evidence-retention.json",
  followingWaveReview: "content/development/seis-public-plugin-wave-4-following-wave-review.json",
  repositoryLocalHandoff: "content/development/seis-public-plugin-wave-4-repository-local-handoff.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  expansionProgram: "content/development/seis-public-plugin-expansion-program.json",
  activationDecision: "content/development/seis-public-plugin-wave-4-activation-decision.json",
  topologyEvidence: "content/development/seis-swift-package-topology.json",
  integrationCheckpoint: "content/development/seis-public-plugin-wave-4-integration-checkpoint.json",
  validationDeliveryEvidence: "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json",
  publicBoundaryDecision: "content/development/seis-public-plugin-wave-4-public-boundary-decision.json",
  wave5ActivationDecision: "content/development/seis-public-plugin-wave-5-activation-decision.json",
  capabilityCoverage: "content/development/seis-plugin-capability-coverage.json",
  wave5Program: "content/development/seis-public-plugin-wave-5-program.json",
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-closeout");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 closeout check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 4 step 100.");
}

function buildRecord() {
  const wave4Program = readJson(PATHS.wave4Program);
  const evidenceRetention = readJson(PATHS.evidenceRetention);
  const followingWaveReview = readJson(PATHS.followingWaveReview);
  const repositoryLocalHandoff = readJson(PATHS.repositoryLocalHandoff);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const expansionProgram = readJson(PATHS.expansionProgram);
  const wave5ActivationDecision = readJson(PATHS.wave5ActivationDecision);
  const capabilityCoverage = readJson(PATHS.capabilityCoverage);
  const wave5Program = readJson(PATHS.wave5Program);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const sourceEntries = list(sourceManifest.plugins);
  const catalogEntries = list(catalog.plugins);
  const matrixEntries = list(matrix.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const inputMetadata = Object.entries(PATHS).map(([key, relativePath]) => inputMetadataFor(key, relativePath));
  const inputSafetyScan = scanPublicSafeInputs(Object.values(PATHS));
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-4-closeout",
    goalId: "SEIS-GOAL-021",
    parentGoalId: "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE",
    wave: 4,
    step: 100,
    status: "completed-repository-local-wave-closeout",
    maturity: "prototype",
    generatedAt: "2026-07-21",
    purpose: "Retain the completed 100-step Wave 4 repository-local, public-only closeout with its later active Wave 5 continuity context. The Wave 4 checkpoint did not activate Wave 5; this current record retains no personal marketplace access, protected-default-branch write, publication, installation, compiler, runtime, provider, deployment, signing, or release claim.",
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 99,
      activeStepBeforeTrackerUpdate: 100,
      completedStepCountAfterTrackerUpdate: 100,
      completedRoundCountAfterTrackerUpdate: 5,
      waveCompleted: true,
      nextActiveWave: null,
      nextWaveStatus: "planned-gated",
      nextWaveImplementationApproved: false,
      nextWaveActivationApproved: false,
    },
    currentContext: currentWave5Context(continuityCadence, expansionProgram, wave5ActivationDecision, capabilityCoverage, wave5Program),
    checks: {
      wave4Tracker: isSupportedWave4Tracker(wave4Program),
      evidenceRetention: evidenceRetention.id === "seis-public-plugin-wave-4-evidence-retention"
        && evidenceRetention.status === "completed-public-evidence-retention"
        && evidenceRetention.step === 99
        && evidenceRetention.retention?.status === "bounded-public-evidence-retained"
        && evidenceRetention.retention?.deletionPerformed === false
        && evidenceRetention.retention?.externalStorageUsed === false
        && Object.values(evidenceRetention.checks || {}).every(Boolean),
      followingWaveReview: followingWaveReview.id === "seis-public-plugin-wave-4-following-wave-review"
        && followingWaveReview.status === "completed-following-wave-scope-review"
        && followingWaveReview.step === 98
        && followingWaveReview.followingWaveDecision?.selectedCapability === "seis-plugin-capability-coverage"
        && followingWaveReview.followingWaveDecision?.implementationApproved === false
        && followingWaveReview.followingWaveDecision?.activationApproved === false
        && Object.values(followingWaveReview.checks || {}).every(Boolean),
      repositoryLocalHandoff: repositoryLocalHandoff.id === "seis-public-plugin-wave-4-repository-local-handoff"
        && repositoryLocalHandoff.status === "completed-repository-local-handoff"
        && repositoryLocalHandoff.step === 97
        && repositoryLocalHandoff.handoff?.delivery?.protectedDefaultBranchWritten === false
        && repositoryLocalHandoff.futureWaveDecision?.activationApproved === false
        && Object.values(repositoryLocalHandoff.checks || {}).every(Boolean),
      continuity: isSupportedContinuity(continuityCadence),
      expansionProgram: isSupportedExpansionProgram(expansionProgram),
      publicInventory: isSupportedPublicInventory(sourceEntries, catalogEntries, matrixEntries, marketplaceEntries, catalog, matrix, marketplace),
      currentWave5: isSupportedActiveWave5(continuityCadence, expansionProgram, wave5ActivationDecision, capabilityCoverage, wave5Program),
      boundedInputs: inputMetadata.length === Object.keys(PATHS).length
        && inputMetadata.every((entry) => entry.regularFile === true && entry.symlink === false && entry.bytes > 0 && entry.bytes <= MAX_INPUT_BYTES),
      evidenceBoundary: inputSafetyScan.machineSpecificPathFindingCount === 0
        && inputSafetyScan.secretLikeFindingCount === 0
        && inputSafetyScan.rawValuesStored === false,
    },
    completion: {
      status: "completed-repository-local-current-evidence",
      completedStepCount: 100,
      completedRoundCount: 5,
      nextActiveWave: null,
      nextWaveStatus: "planned-gated",
      nextWaveSelectedCapability: "seis-plugin-capability-coverage",
      nextWaveImplementationApproved: false,
      nextWaveActivationApproved: false,
      terminalHandoffPublished: false,
      protectedDefaultBranchWritten: false,
      publicReleaseAllowed: false,
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
      signing: false,
      publicRelease: false,
    },
    evidence: {
      wave4ProgramPath: PATHS.wave4Program,
      evidenceRetentionPath: PATHS.evidenceRetention,
      followingWaveReviewPath: PATHS.followingWaveReview,
      repositoryLocalHandoffPath: PATHS.repositoryLocalHandoff,
      continuityCadencePath: PATHS.continuityCadence,
      expansionProgramPath: PATHS.expansionProgram,
      wave5ActivationDecisionPath: PATHS.wave5ActivationDecision,
      capabilityCoveragePath: PATHS.capabilityCoverage,
      wave5ProgramPath: PATHS.wave5Program,
      inputMetadata,
    },
    validation: [
      "npm run check:seis-public-plugin-wave-4-closeout",
      "npm run check:seis-public-plugin-wave-4-evidence-retention",
      "npm run check:seis-public-plugin-wave-4-program",
      "npm run check:seis-public-plugin-continuity-cadence",
      "npm run check:seis-public-plugin-expansion-program",
      "npm run check:seis-public-plugin-wave-5-activation-decision",
      "npm run check:seis-plugin-capability-coverage",
      "npm run check:seis-public-plugin-wave-5-program",
      "npm run check:seis-repo-marketplace",
      "node --test plugins/seis-core/test/public-plugin-wave-4-closeout.test.mjs",
    ],
    risks: [
      {
        id: "RISK-W4-025",
        status: "tracked",
        description: "A repository-local closeout could be misread as a public release, merge, or independent installation proof.",
        mitigation: "Keep terminalHandoffPublished, protectedDefaultBranchWritten, and publicReleaseAllowed false and preserve all external claims as false.",
      },
      {
        id: "RISK-W4-026",
        status: "tracked",
        description: "The historical Wave 5 candidate gate could be mistaken for the later active Wave 5 decision, or Wave 4 closeout could be mistaken for a release.",
        mitigation: "Keep historical closeout fields separate from current Wave 5 context; require the separate activation decision and preserve all release and external claims as false.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this Wave 4 closeout record and its program/cadence references on the feature branch; no external state, publication, release, package, card, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function isSupportedWave4Tracker(program) {
  const shared = program?.id === "seis-public-plugin-wave-4-program" && program?.maturity === "prototype";
  const beforeTrackerUpdate = program?.status === "in-progress"
    && program?.progress?.completedStepCount === 99
    && list(program?.progress?.inProgressStepNumbers).join(",") === "100"
    && program?.progress?.nextStepNumber === 100
    && program?.evidenceRetention?.status === "completed-public-evidence-retention";
  const afterTrackerUpdate = program?.status === "completed"
    && program?.progress?.completedStepCount === 100
    && list(program?.progress?.inProgressStepNumbers).length === 0
    && program?.progress?.nextStepNumber === null
    && program?.evidence?.closeoutPath === OUTPUT_PATH
    && program?.repositoryLocalCloseout?.status === "completed-repository-local-wave-closeout";
  return shared && (beforeTrackerUpdate || afterTrackerUpdate);
}

function isSupportedContinuity(cadence) {
  const wave = cadence?.waves?.[3];
  const wave5 = cadence?.waves?.[4];
  const shared = cadence?.id === "seis-public-plugin-continuity-cadence" && cadence?.status === "active-evidence-led-cadence";
  const beforeTrackerUpdate = cadence?.cadence?.waveSeries?.activeWave === 4
    && cadence?.cadence?.waveSeries?.activeWaveState === "public-evidence-retention-complete-step-100-in-progress"
    && wave?.status === "in-progress"
    && wave?.completedSteps === 99
    && list(wave?.inProgressSteps).join(",") === "100"
    && wave?.evidenceRetentionPath === PATHS.evidenceRetention
    && wave?.currentEvidencePath === PATHS.evidenceRetention;
  const afterTrackerUpdate = cadence?.cadence?.waveSeries?.activeWave === null
    && cadence?.cadence?.waveSeries?.activeWaveState === "wave-4-completed-wave-5-planned-gated"
    && wave?.status === "completed"
    && wave?.completedSteps === 100
    && list(wave?.inProgressSteps).length === 0
    && wave?.closeoutPath === OUTPUT_PATH
    && wave?.currentEvidencePath === OUTPUT_PATH;
  const activeWave5 = cadence?.cadence?.waveSeries?.activeWave === 5
    && cadence?.cadence?.waveSeries?.activeWaveState === "wave-5-first-40-steps-completed-step-41-in-progress"
    && wave?.status === "completed"
    && wave?.completedSteps === 100
    && wave?.closeoutPath === OUTPUT_PATH
    && wave5?.status === "in-progress"
    && wave5?.completedSteps === 40
    && list(wave5?.inProgressSteps).join(",") === "41"
    && wave5?.activationDecisionPath === PATHS.wave5ActivationDecision
    && wave5?.capabilityEvidencePath === PATHS.capabilityCoverage
    && wave5?.programPath === PATHS.wave5Program;
  return shared && (beforeTrackerUpdate || afterTrackerUpdate || activeWave5);
}

function isSupportedExpansionProgram(program) {
  const wave4 = program?.nextWaves?.[3];
  const wave5 = program?.nextWaves?.[4];
  const shared = program?.id === "seis-public-plugin-expansion-program"
    && wave5?.selectedCapability === "seis-plugin-capability-coverage";
  const beforeTrackerUpdate = wave4?.status === "in-progress"
    && wave4?.evidenceRetentionPath === PATHS.evidenceRetention;
  const afterTrackerUpdate = wave4?.status === "completed"
    && wave4?.completionEvidencePath === OUTPUT_PATH;
  const plannedWave5 = wave5?.status === "planned-gated"
    && wave5?.implementationApproved === false
    && wave5?.activationApproved === false;
  const activeWave5 = wave5?.status === "in-progress"
    && wave5?.programPath === PATHS.wave5Program
    && wave5?.activationDecisionPath === PATHS.wave5ActivationDecision
    && wave5?.capabilityEvidencePath === PATHS.capabilityCoverage
    && wave5?.implementationApproved === true
    && wave5?.activationApproved === true
    && wave5?.implementationStarted === true
    && wave5?.candidatePackageExists === true
    && wave5?.candidatePublicCardExists === true
    && wave5?.completedSteps === 40
    && list(wave5?.inProgressSteps).join(",") === "41";
  return shared && (beforeTrackerUpdate || afterTrackerUpdate) && (plannedWave5 || activeWave5);
}

function isSupportedPublicInventory(sourceEntries, catalogEntries, matrixEntries, marketplaceEntries, catalog, matrix, marketplace) {
  const shared = matrix?.failureCount === 0
    && marketplace?.name === "seis-repo"
    && marketplace?.interface?.displayName === "SEIS Repo"
    && sourceEntries.filter((entry) => entry?.name === "seis-swift-package-topology").length === 1
    && catalogEntries.filter((entry) => entry?.name === "seis-swift-package-topology").length === 1
    && matrixEntries.filter((entry) => entry?.name === "seis-swift-package-topology").length === 1;
  const wave4Snapshot = sourceEntries.length === 74
    && catalog?.counts?.discovered === 74
    && matrix?.pluginCount === 74
    && marketplaceEntries.length === 380;
  const activeWave5 = sourceEntries.length === 75
    && catalog?.counts?.discovered === 75
    && matrix?.pluginCount === 75
    && marketplaceEntries.length === 381
    && sourceEntries.filter((entry) => entry?.name === "seis-plugin-capability-coverage").length === 1
    && catalogEntries.filter((entry) => entry?.name === "seis-plugin-capability-coverage").length === 1
    && matrixEntries.filter((entry) => entry?.name === "seis-plugin-capability-coverage").length === 1;
  return shared && (wave4Snapshot || activeWave5);
}

function isSupportedActiveWave5(cadence, expansionProgram, activationDecision, capabilityCoverage, wave5Program) {
  const wave5 = expansionProgram?.nextWaves?.[4];
  return cadence?.cadence?.waveSeries?.activeWave === 5
    && activationDecision?.id === "seis-public-plugin-wave-5-activation-decision"
    && activationDecision?.status === "approved-public-local-wave-5-activation"
    && activationDecision?.decision?.selectedCapability === "seis-plugin-capability-coverage"
    && activationDecision?.decision?.activationApproved === true
    && activationDecision?.decision?.implementationApproved === true
    && capabilityCoverage?.id === "seis-plugin-capability-coverage"
    && capabilityCoverage?.status === "ready-public-static-capability-coverage-evidence"
    && capabilityCoverage?.activation?.activationApproved === true
    && capabilityCoverage?.audit?.reconciliation?.reconciled === true
    && wave5Program?.id === "seis-public-plugin-wave-5-program"
    && wave5Program?.status === "in-progress"
    && wave5Program?.progress?.completedStepCount === 40
    && list(wave5Program?.progress?.inProgressStepNumbers).join(",") === "41"
    && wave5?.status === "in-progress";
}

function currentWave5Context(cadence, expansionProgram, activationDecision, capabilityCoverage, wave5Program) {
  return {
    activeWave: cadence?.cadence?.waveSeries?.activeWave,
    activeWaveState: cadence?.cadence?.waveSeries?.activeWaveState,
    status: expansionProgram?.nextWaves?.[4]?.status,
    completedSteps: wave5Program?.progress?.completedStepCount,
    inProgressSteps: list(wave5Program?.progress?.inProgressStepNumbers),
    activationDecisionPath: PATHS.wave5ActivationDecision,
    capabilityCoveragePath: PATHS.capabilityCoverage,
    activationDecisionStatus: activationDecision?.status,
    capabilityCoverageStatus: capabilityCoverage?.status,
  };
}

function inputMetadataFor(key, relativePath) {
  const stats = fs.lstatSync(path.join(ROOT, relativePath));
  return {
    key,
    path: relativePath,
    regularFile: stats.isFile(),
    symlink: stats.isSymbolicLink(),
    bytes: stats.size,
  };
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-closeout" && record.goalId === "SEIS-GOAL-021" && record.parentGoalId === "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE" && record.wave === 4 && record.step === 100 && record.status === "completed-repository-local-wave-closeout" && record.maturity === "prototype", "closeout identity is invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 99 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 100 && record.stateAtCheckpoint?.completedStepCountAfterTrackerUpdate === 100 && record.stateAtCheckpoint?.completedRoundCountAfterTrackerUpdate === 5 && record.stateAtCheckpoint?.waveCompleted === true && record.stateAtCheckpoint?.nextActiveWave === null && record.stateAtCheckpoint?.nextWaveStatus === "planned-gated" && record.stateAtCheckpoint?.nextWaveImplementationApproved === false && record.stateAtCheckpoint?.nextWaveActivationApproved === false, "closeout state is invalid");
  assert(record.currentContext?.activeWave === 5 && record.currentContext?.activeWaveState === "wave-5-first-40-steps-completed-step-41-in-progress" && record.currentContext?.status === "in-progress" && record.currentContext?.completedSteps === 40 && list(record.currentContext?.inProgressSteps).join(",") === "41" && record.currentContext?.activationDecisionPath === PATHS.wave5ActivationDecision && record.currentContext?.capabilityCoveragePath === PATHS.capabilityCoverage && record.currentContext?.activationDecisionStatus === "approved-public-local-wave-5-activation" && record.currentContext?.capabilityCoverageStatus === "ready-public-static-capability-coverage-evidence", "current Wave 5 context is invalid");
  assert(Object.values(record.checks || {}).every(Boolean), "a required closeout check is not current");
  assert(record.completion?.status === "completed-repository-local-current-evidence" && record.completion?.completedStepCount === 100 && record.completion?.completedRoundCount === 5 && record.completion?.nextActiveWave === null && record.completion?.nextWaveStatus === "planned-gated" && record.completion?.nextWaveSelectedCapability === "seis-plugin-capability-coverage" && record.completion?.nextWaveImplementationApproved === false && record.completion?.nextWaveActivationApproved === false && record.completion?.terminalHandoffPublished === false && record.completion?.protectedDefaultBranchWritten === false && record.completion?.publicReleaseAllowed === false, "completion state is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.protectedDefaultBranchWrites === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(list(record.evidence?.inputMetadata).length === Object.keys(PATHS).length && list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "evidence, risk, or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "closeout inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "closeout record must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 4 closeout: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 closeout: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
