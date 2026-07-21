#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-repository-local-handoff.json";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const DELIVERY_EVIDENCE_COMMIT = "03ef9ecd0b16ae1a345732bbb329166e46d57e84";
const PATHS = Object.freeze({
  wave3Program: "content/development/seis-public-plugin-wave-3-program.json",
  finalValidation: "content/development/seis-public-plugin-wave-3-final-validation.json",
  finalPreflight: "content/development/seis-public-plugin-wave-3-final-preflight.json",
  deliveryEvidence: "content/development/seis-public-plugin-wave-3-delivery-evidence.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  continuityDocs: "docs/roadmap/SEIS_PUBLIC_PLUGIN_CONTINUITY_CADENCE.md",
  expansionDocs: "docs/roadmap/SEIS_PUBLIC_PLUGIN_EXPANSION_30_STEP_PROGRAM.md",
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-3-repository-local-handoff");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 repository-local handoff check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 3 step 97.");
}

function buildRecord() {
  const wave3Program = readJson(PATHS.wave3Program);
  const finalValidation = readJson(PATHS.finalValidation);
  const finalPreflight = readJson(PATHS.finalPreflight);
  const deliveryEvidence = readJson(PATHS.deliveryEvidence);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const securityReview = readJson(PATHS.securityReview);
  const lifecycle = readJson(PATHS.lifecycle);
  const continuityDocs = readText(PATHS.continuityDocs);
  const expansionDocs = readText(PATHS.expansionDocs);
  const inputSafetyScan = scanPublicSafeInputs(Object.values(PATHS));
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-3-repository-local-handoff",
    goalId: "SEIS-GOAL-021",
    wave: 3,
    step: 97,
    status: "completed-repository-local-handoff",
    generatedAt: "2026-07-21",
    purpose: "Publish the current Wave 3 repository-local handoff with traceable evidence, risks, rollback, and next-decision boundaries without completing the wave, activating Wave 4, or claiming independent installation, native execution, or public release.",
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 96,
      activeStepBeforeTrackerUpdate: 97,
      nextPlannedDecisionStep: 98,
      waveCompleted: false,
      wave4Activated: false,
    },
    checks: {
      wave3Tracker: wave3Program.id === "seis-public-plugin-wave-3-program"
        && ["in-progress", "completed"].includes(wave3Program.status)
        && number(wave3Program.progress?.completedStepCount) >= 96
        && (wave3Program.status === "completed" || number(wave3Program.progress?.nextStepNumber) >= 97)
        && wave3Program.publicBoundary?.marketplaceName === "seis-repo"
        && wave3Program.publicBoundary?.personalMarketplaceRead === false
        && wave3Program.publicBoundary?.personalMarketplaceMutation === false,
      finalValidation: finalValidation.id === "seis-public-plugin-wave-3-final-validation"
        && finalValidation.status === "completed-repository-local-final-validation"
        && finalValidation.externalClaims?.compiledSwift === false
        && finalValidation.externalClaims?.nativeRuntime === false
        && finalValidation.externalClaims?.independentInstallation === false
        && finalValidation.externalClaims?.publicRelease === false,
      finalPreflight: finalPreflight.id === "seis-public-plugin-wave-3-final-preflight"
        && finalPreflight.status === "completed-repository-local-final-preflight"
        && list(finalPreflight.completedSteps).join(",") === range(82, 91).join(",")
        && Object.values(finalPreflight.checks || {}).every(Boolean)
        && finalPreflight.inputSafetyScan?.machineSpecificPathFindingCount === 0
        && finalPreflight.inputSafetyScan?.secretLikeFindingCount === 0,
      deliveryEvidence: deliveryEvidence.id === "seis-public-plugin-wave-3-delivery-evidence"
        && deliveryEvidence.status === "completed-repository-local-delivery-evidence"
        && list(deliveryEvidence.completedSteps).join(",") === range(92, 96).join(",")
        && Object.values(deliveryEvidence.checks || {}).every(Boolean)
        && deliveryEvidence.observedDelivery?.pushed === true
        && deliveryEvidence.observedDelivery?.remoteReferenceVerified === true
        && deliveryEvidence.observedDelivery?.protectedDefaultBranchWritten === false
        && deliveryEvidence.observedDelivery?.preflightCheckpointCommit === "5133ad5faa7aeea626fe7b6ca4e3acd187fb050e",
      securityAndLifecycle: securityReview.id === "seis-public-plugin-security-provenance-review"
        && securityReview.status === "repo-local-security-provenance-reviewed"
        && securityReview.publicReleaseAllowed === false
        && number(securityReview.aggregate?.secretFindingCount) === 0
        && number(securityReview.aggregate?.blockingFindingCount) === 0
        && securityReview.releaseBoundary?.externalNetworkAccessUsed === false
        && lifecycle.id === "seis-public-plugin-lifecycle"
        && lifecycle.status === "active-local-proof-public-release-gated"
        && lifecycle.publicDistribution?.marketplaceName === "seis-repo"
        && lifecycle.releasePolicy?.currentChannel === "internal-review-local-proof",
      continuityGate: continuityCadence.id === "seis-public-plugin-continuity-cadence"
        && ["in-progress", "completed"].includes(continuityCadence.waves?.[2]?.status)
        && number(continuityCadence.waves?.[2]?.completedSteps) >= 96
        && continuityCadence.waves?.[3]?.status === "planned-gated"
        && continuityCadence.waves?.[4]?.status === "planned-gated"
        && continuityDocs.includes("SEIS Repo")
        && expansionDocs.includes("SEIS Repo"),
    },
    handoff: {
      scope: "One approved public static Swift concurrency package and its existing SEIS Repo card, reconciled through repository-local validation and feature-branch delivery evidence.",
      evidencePaths: {
        finalValidation: PATHS.finalValidation,
        finalPreflight: PATHS.finalPreflight,
        deliveryEvidence: PATHS.deliveryEvidence,
        continuityCadence: PATHS.continuityCadence,
        securityReview: PATHS.securityReview,
        lifecycle: PATHS.lifecycle,
      },
      delivery: {
        featureBranch: FEATURE_BRANCH,
        priorDeliveryEvidenceCommit: DELIVERY_EVIDENCE_COMMIT,
        priorDeliveryEvidenceRemoteVerified: true,
        protectedDefaultBranchWritten: false,
        note: "This handoff is repository-local until its own focused feature-branch checkpoint is committed, pushed, and remotely verified. It is not a merge, public release, or default-branch update.",
      },
      knownLimits: [
        "No independent clean-runner or public package installation proof is recorded.",
        "No compiled Swift, native runtime, live provider, deployment, signing, or public-release proof is recorded.",
        "Public release remains blocked by external proof and human approval requirements.",
        "Wave 4 remains planned-gated and has no selected capability.",
      ],
      nextDecision: "Step 98 must decide whether a following wave is justified by current evidence rather than cadence alone; it may keep Wave 4 gated.",
    },
    publicBoundary: {
      marketplaceName: wave3Program.publicBoundary?.marketplaceName || null,
      marketplaceDisplayName: wave3Program.publicBoundary?.marketplaceDisplayName || null,
      publicAudience: wave3Program.publicBoundary?.publicAudience || null,
      personalMarketplaceRead: wave3Program.publicBoundary?.personalMarketplaceRead === true,
      personalMarketplaceMutation: wave3Program.publicBoundary?.personalMarketplaceMutation === true,
      network: wave3Program.publicBoundary?.network === true,
      externalWrites: wave3Program.publicBoundary?.externalWrites === true,
      secrets: wave3Program.publicBoundary?.secrets === true,
      publicReleaseAllowed: wave3Program.publicBoundary?.publicReleaseAllowed === true,
    },
    externalClaims: {
      independentInstallation: false,
      compiledSwift: false,
      nativeRuntime: false,
      liveProvider: false,
      deployment: false,
      publicRelease: false,
    },
    futureWaveDecision: {
      wave: 4,
      status: continuityCadence.waves?.[3]?.status || null,
      activationApproved: false,
      selectedCapability: null,
      reason: "This repository-local handoff closes only the current handoff record. It does not make a new capability selection or replace the required scope, dependency, risk, rollback, validation, and user-authority gate for Wave 4.",
    },
    validationScope: [
      "npm run check:seis-public-plugin-wave-3-final-validation",
      "npm run check:seis-public-plugin-wave-3-final-preflight",
      "npm run check:seis-public-plugin-wave-3-delivery-evidence",
      "npm run check:seis-public-plugin-wave-3-repository-local-handoff",
      "npm run check:seis-public-plugin-continuity",
      "npm run check:seis-repo-marketplace",
      "git diff --check",
    ],
    risks: [
      {
        id: "RISK-W3-014",
        status: "tracked",
        description: "A repository-local handoff could be misread as a completed Wave 3 or an approved following wave.",
        mitigation: "Keep waveCompleted false, leave steps 98–100 pending, and preserve activationApproved=false for Wave 4.",
      },
      {
        id: "RISK-W3-015",
        status: "tracked",
        description: "Handoff evidence can be mistaken for independent installation or a public release authorization.",
        mitigation: "List known external limits explicitly and retain every release-related external claim as false.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 3 handoff record and its tracking references on the feature branch; no external state, publication, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-3-repository-local-handoff" && record.goalId === "SEIS-GOAL-021" && record.wave === 3 && record.step === 97 && record.status === "completed-repository-local-handoff", "handoff identity is invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 96 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 97 && record.stateAtCheckpoint?.nextPlannedDecisionStep === 98 && record.stateAtCheckpoint?.waveCompleted === false && record.stateAtCheckpoint?.wave4Activated === false, "handoff state snapshot is invalid");
  assert(Object.values(record.checks).every(Boolean), "a required Wave 3 handoff contract is not current");
  assert(record.handoff?.delivery?.featureBranch === FEATURE_BRANCH && record.handoff?.delivery?.priorDeliveryEvidenceCommit === DELIVERY_EVIDENCE_COMMIT && record.handoff?.delivery?.priorDeliveryEvidenceRemoteVerified === true && record.handoff?.delivery?.protectedDefaultBranchWritten === false, "handoff delivery boundary is invalid");
  assert(list(record.handoff?.knownLimits).length === 4, "handoff limits are incomplete");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.externalClaims?.independentInstallation === false && record.externalClaims?.compiledSwift === false && record.externalClaims?.nativeRuntime === false && record.externalClaims?.liveProvider === false && record.externalClaims?.deployment === false && record.externalClaims?.publicRelease === false, "external claim boundary is invalid");
  assert(record.futureWaveDecision?.wave === 4 && record.futureWaveDecision?.status === "planned-gated" && record.futureWaveDecision?.activationApproved === false && record.futureWaveDecision?.selectedCapability === null, "Wave 4 gate is invalid");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "handoff inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "handoff record must not contain a machine-specific path");
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

function number(value) {
  return Number.isFinite(value) ? value : 0;
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 3 repository-local handoff: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 repository-local handoff: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
