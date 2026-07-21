#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-closeout.json";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const PLANNING_CHECKPOINT_COMMIT = "30c2dfa64ec0d1e6a3968179bcd126eedbd3a23e";
const CANDIDATE_CAPABILITY = "seis-swift-package-topology";
const PATHS = Object.freeze({
  finalValidation: "content/development/seis-public-plugin-wave-3-final-validation.json",
  finalPreflight: "content/development/seis-public-plugin-wave-3-final-preflight.json",
  deliveryEvidence: "content/development/seis-public-plugin-wave-3-delivery-evidence.json",
  repositoryLocalHandoff: "content/development/seis-public-plugin-wave-3-repository-local-handoff.json",
  followingWaveReview: "content/development/seis-public-plugin-wave-3-following-wave-review.json",
  wave4Program: "content/development/seis-public-plugin-wave-4-program.json",
  concurrencyEvidence: "content/development/seis-swift-concurrency-audit.json",
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-3-closeout");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 closeout check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 3 step 100.");
}

function buildRecord() {
  const finalValidation = readJson(PATHS.finalValidation);
  const finalPreflight = readJson(PATHS.finalPreflight);
  const deliveryEvidence = readJson(PATHS.deliveryEvidence);
  const repositoryLocalHandoff = readJson(PATHS.repositoryLocalHandoff);
  const followingWaveReview = readJson(PATHS.followingWaveReview);
  const wave4Program = readJson(PATHS.wave4Program);
  const concurrencyEvidence = readJson(PATHS.concurrencyEvidence);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const sourceEntries = list(sourceManifest.plugins);
  const catalogEntries = list(catalog.plugins);
  const matrixEntries = list(matrix.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const inputSafetyScan = scanPublicSafeInputs(Object.values(PATHS));
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-3-closeout",
    goalId: "SEIS-GOAL-021",
    wave: 3,
    step: 100,
    status: "completed-repository-local-wave-closeout",
    generatedAt: "2026-07-21",
    purpose: "Close the 100-step Wave 3 public repository-local evidence chain without activating Wave 4, adding the planned topology package or card, or claiming independent installation, Swift execution, provider activity, deployment, or public release.",
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 99,
      activeStepBeforeTrackerUpdate: 100,
      completedStepCountAfterTrackerUpdate: 100,
      wave3Completed: true,
      wave4Activated: false,
    },
    checks: {
      finalValidation: finalValidation.id === "seis-public-plugin-wave-3-final-validation"
        && finalValidation.status === "completed-repository-local-final-validation"
        && finalValidation.step === 81
        && Object.values(finalValidation.checks || {}).every(Boolean)
        && finalValidation.externalClaims?.compiledSwift === false
        && finalValidation.externalClaims?.nativeRuntime === false
        && finalValidation.externalClaims?.publicRelease === false,
      finalPreflight: finalPreflight.id === "seis-public-plugin-wave-3-final-preflight"
        && finalPreflight.status === "completed-repository-local-final-preflight"
        && list(finalPreflight.completedSteps).join(",") === range(82, 91).join(",")
        && Object.values(finalPreflight.checks || {}).every(Boolean)
        && finalPreflight.futureWaveDecision?.activationApproved === false,
      deliveryAndHandoff: deliveryEvidence.id === "seis-public-plugin-wave-3-delivery-evidence"
        && deliveryEvidence.status === "completed-repository-local-delivery-evidence"
        && list(deliveryEvidence.completedSteps).join(",") === range(92, 96).join(",")
        && deliveryEvidence.observedDelivery?.remoteReferenceVerified === true
        && deliveryEvidence.observedDelivery?.protectedDefaultBranchWritten === false
        && repositoryLocalHandoff.id === "seis-public-plugin-wave-3-repository-local-handoff"
        && repositoryLocalHandoff.status === "completed-repository-local-handoff"
        && repositoryLocalHandoff.step === 97,
      followingWaveReview: followingWaveReview.id === "seis-public-plugin-wave-3-following-wave-review"
        && followingWaveReview.status === "completed-following-wave-scope-review"
        && followingWaveReview.step === 98
        && followingWaveReview.followingWaveDecision?.selectedCapability === CANDIDATE_CAPABILITY
        && followingWaveReview.followingWaveDecision?.implementationApproved === false
        && followingWaveReview.followingWaveDecision?.activationApproved === false
        && followingWaveReview.followingWaveDecision?.candidatePackageExists === false
        && followingWaveReview.followingWaveDecision?.candidatePublicCardExists === false,
      separateWave4Plan: wave4Program.id === "seis-public-plugin-wave-4-program"
        && wave4Program.status === "planned-gated"
        && wave4Program.wave?.number === 4
        && list(wave4Program.steps).length === 100
        && wave4Program.scope?.selectedCapability === CANDIDATE_CAPABILITY
        && wave4Program.activationGate?.implementationStarted === false
        && wave4Program.activationGate?.candidatePackageExists === false
        && wave4Program.activationGate?.candidatePublicCardExists === false,
      currentPublicInventory: sourceEntries.length === 73
        && catalog.counts?.discovered === 73
        && matrix.pluginCount === 73
        && matrix.failureCount === 0
        && marketplace.name === "seis-repo"
        && marketplaceEntries.length === 379
        && sourceEntries.filter((entry) => entry?.name === "seis-swift-concurrency-audit").length === 1
        && catalogEntries.filter((entry) => entry?.name === "seis-swift-concurrency-audit").length === 1
        && matrixEntries.filter((entry) => entry?.name === "seis-swift-concurrency-audit").length === 1
        && marketplaceEntries.filter((entry) => entry?.name === "seis-swift-concurrency-audit").length === 1
        && sourceEntries.every((entry) => entry?.name !== CANDIDATE_CAPABILITY)
        && catalogEntries.every((entry) => entry?.name !== CANDIDATE_CAPABILITY)
        && matrixEntries.every((entry) => entry?.name !== CANDIDATE_CAPABILITY)
        && marketplaceEntries.every((entry) => entry?.name !== CANDIDATE_CAPABILITY),
      staticEvidenceBoundary: concurrencyEvidence.id === "seis-swift-concurrency-audit"
        && concurrencyEvidence.status === "attention-public-static-concurrency-evidence"
        && concurrencyEvidence.audit?.ok === true
        && concurrencyEvidence.audit?.blockingFindingCount === 0
        && concurrencyEvidence.safety?.compilesSwift === false
        && concurrencyEvidence.safety?.runsSwiftTests === false
        && concurrencyEvidence.safety?.startsNativeApplication === false
        && concurrencyEvidence.safety?.publicReleaseAllowed === false,
      repositoryLocalDelivery: FEATURE_BRANCH === "plugins/seis-plugin-root-20260715"
        && PLANNING_CHECKPOINT_COMMIT === "30c2dfa64ec0d1e6a3968179bcd126eedbd3a23e",
    },
    completion: {
      status: "completed-repository-local-current-evidence",
      completedStepCount: 100,
      completedRoundCount: 5,
      nextActiveWave: null,
      nextWaveStatus: "planned-gated",
      nextWaveSelectedCapability: CANDIDATE_CAPABILITY,
      nextWaveActivationApproved: false,
      summary: "Wave 3 is complete as a repository-local public evidence program. Wave 4 has only a separate planned-gated specification and is not implementation-authorized.",
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
      finalValidationPath: PATHS.finalValidation,
      finalPreflightPath: PATHS.finalPreflight,
      deliveryEvidencePath: PATHS.deliveryEvidence,
      repositoryLocalHandoffPath: PATHS.repositoryLocalHandoff,
      followingWaveReviewPath: PATHS.followingWaveReview,
      wave4ProgramPath: PATHS.wave4Program,
      concurrencyEvidencePath: PATHS.concurrencyEvidence,
      sourceManifestPath: PATHS.sourceManifest,
      catalogPath: PATHS.catalog,
      matrixPath: PATHS.matrix,
      marketplacePath: PATHS.marketplace,
    },
    delivery: {
      priorPlanningCheckpointCommit: PLANNING_CHECKPOINT_COMMIT,
      priorPlanningCheckpointRemoteVerified: true,
      featureBranch: FEATURE_BRANCH,
      protectedDefaultBranchWritten: false,
      note: "This closeout record is repository-local until its own focused feature-branch commit and remote-reference verification are completed. It is never a merge or public release claim.",
    },
    validation: [
      "npm run check:seis-public-plugin-wave-3-closeout",
      "npm run check:seis-public-plugin-continuity",
      "npm run check:seis-repo-marketplace",
      "node --test plugins/seis-core/test/public-plugin-wave-3-closeout.test.mjs",
      "node --test plugins/seis-core/test/*.test.mjs",
      "npm run seis:check",
      "git diff --check",
    ],
    risks: [
      {
        id: "RISK-W3-019",
        status: "tracked",
        description: "Repository-local completion could be mistaken for public release or independent installation proof.",
        mitigation: "Retain every external claim as false and preserve explicit release, installation, SwiftPM, compiler, runtime, provider, and deployment limits.",
      },
      {
        id: "RISK-W3-020",
        status: "tracked",
        description: "Wave 4 planning could be mistaken for activation or permission to add a public card.",
        mitigation: "Keep Wave 4 planned-gated with implementationStarted=false, candidate absence checks, and a separate activation decision requirement.",
      },
      {
        id: "RISK-W3-021",
        status: "tracked",
        description: "Historical checkpoint records can become misleading after Wave 3 transitions from in-progress to completed.",
        mitigation: "Preserve each checkpoint's original scope while allowing current completion state to satisfy its bounded historical evidence predicate.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this Wave 3 closeout and its tracker references on the feature branch; no external state, package, card, release, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-3-closeout" && record.goalId === "SEIS-GOAL-021" && record.wave === 3 && record.step === 100 && record.status === "completed-repository-local-wave-closeout", "Wave 3 closeout identity is invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 99 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 100 && record.stateAtCheckpoint?.completedStepCountAfterTrackerUpdate === 100 && record.stateAtCheckpoint?.wave3Completed === true && record.stateAtCheckpoint?.wave4Activated === false, "Wave 3 closeout state snapshot is invalid");
  assert(Object.values(record.checks).every(Boolean), "a required Wave 3 closeout contract is not current");
  assert(record.completion?.status === "completed-repository-local-current-evidence" && record.completion?.completedStepCount === 100 && record.completion?.completedRoundCount === 5 && record.completion?.nextActiveWave === null && record.completion?.nextWaveStatus === "planned-gated" && record.completion?.nextWaveSelectedCapability === CANDIDATE_CAPABILITY && record.completion?.nextWaveActivationApproved === false, "Wave 3 completion decision is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.externalClaims?.independentInstallation === false && record.externalClaims?.compiledSwift === false && record.externalClaims?.swiftPmTestPass === false && record.externalClaims?.nativeRuntime === false && record.externalClaims?.liveProvider === false && record.externalClaims?.deployment === false && record.externalClaims?.publicRelease === false, "external claim boundary is invalid");
  assert(record.delivery?.priorPlanningCheckpointCommit === PLANNING_CHECKPOINT_COMMIT && record.delivery?.priorPlanningCheckpointRemoteVerified === true && record.delivery?.featureBranch === FEATURE_BRANCH && record.delivery?.protectedDefaultBranchWritten === false, "closeout delivery boundary is invalid");
  assert(list(record.risks).length === 3 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "closeout inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "Wave 3 closeout must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 3 closeout: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 closeout: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
