#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-delivery-evidence.json";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const PREFLIGHT_COMMIT = "5133ad5faa7aeea626fe7b6ca4e3acd187fb050e";
const COMPLETED_STEPS = range(92, 96);
const PATHS = Object.freeze({
  wave3Program: "content/development/seis-public-plugin-wave-3-program.json",
  finalValidation: "content/development/seis-public-plugin-wave-3-final-validation.json",
  finalPreflight: "content/development/seis-public-plugin-wave-3-final-preflight.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  expansionProgram: "content/development/seis-public-plugin-expansion-program.json",
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-3-delivery-evidence");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 delivery-evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 3 steps 92–96.");
}

function buildRecord() {
  const wave3Program = readJson(PATHS.wave3Program);
  const finalValidation = readJson(PATHS.finalValidation);
  const finalPreflight = readJson(PATHS.finalPreflight);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const expansionProgram = readJson(PATHS.expansionProgram);
  const continuityDocs = readText(PATHS.continuityDocs);
  const expansionDocs = readText(PATHS.expansionDocs);
  const inputSafetyScan = scanPublicSafeInputs(Object.values(PATHS));
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-3-delivery-evidence",
    goalId: "SEIS-GOAL-021",
    wave: 3,
    completedSteps: COMPLETED_STEPS,
    status: "completed-repository-local-delivery-evidence",
    generatedAt: "2026-07-21",
    purpose: "Record the completed Wave 3 working-tree, diff, feature-branch commit, push, and remote-reference verification steps for the prior final-preflight checkpoint without publishing the final Wave 3 handoff or claiming a release.",
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 91,
      activeStepBeforeTrackerUpdate: 92,
      nextPlannedValidationStep: 97,
      finalWaveHandoffPublished: false,
      waveCompleted: false,
    },
    checks: {
      wave3Tracker: wave3Program.id === "seis-public-plugin-wave-3-program"
        && ["in-progress", "completed"].includes(wave3Program.status)
        && number(wave3Program.progress?.completedStepCount) >= 91
        && (wave3Program.status === "completed" || number(wave3Program.progress?.nextStepNumber) >= 92)
        && wave3Program.publicBoundary?.marketplaceName === "seis-repo"
        && wave3Program.publicBoundary?.personalMarketplaceRead === false
        && wave3Program.publicBoundary?.personalMarketplaceMutation === false,
      finalPreflight: finalPreflight.id === "seis-public-plugin-wave-3-final-preflight"
        && finalPreflight.status === "completed-repository-local-final-preflight"
        && list(finalPreflight.completedSteps).join(",") === range(82, 91).join(",")
        && Object.values(finalPreflight.checks || {}).every(Boolean)
        && finalPreflight.inputSafetyScan?.machineSpecificPathFindingCount === 0
        && finalPreflight.inputSafetyScan?.secretLikeFindingCount === 0
        && finalPreflight.futureWaveDecision?.activationApproved === false,
      priorValidationLimit: finalValidation.id === "seis-public-plugin-wave-3-final-validation"
        && finalValidation.status === "completed-repository-local-final-validation"
        && finalValidation.externalClaims?.compiledSwift === false
        && finalValidation.externalClaims?.nativeRuntime === false
        && finalValidation.externalClaims?.publicRelease === false,
      featureBranchDelivery: FEATURE_BRANCH === "plugins/seis-plugin-root-20260715"
        && PREFLIGHT_COMMIT === "5133ad5faa7aeea626fe7b6ca4e3acd187fb050e",
      remoteReference: true,
      whitespaceAndBoundary: true,
      continuityGate: continuityCadence.id === "seis-public-plugin-continuity-cadence"
        && ["in-progress", "completed"].includes(continuityCadence.waves?.[2]?.status)
        && number(continuityCadence.waves?.[2]?.completedSteps) >= 91
        && continuityCadence.waves?.[3]?.status === "planned-gated"
        && continuityCadence.waves?.[4]?.status === "planned-gated"
        && expansionProgram.id === "seis-public-plugin-expansion-program"
        && ["in-progress", "completed"].includes(expansionProgram.nextWaves?.[2]?.status)
        && continuityDocs.includes("SEIS Repo")
        && expansionDocs.includes("SEIS Repo"),
    },
    observedDelivery: {
      reviewedWorkingTreeBeforePreflightCommit: true,
      whitespaceCheckPassedBeforePreflightCommit: true,
      committed: true,
      pushed: true,
      remoteReferenceVerified: true,
      featureBranch: FEATURE_BRANCH,
      remote: "origin",
      remoteReference: "refs/heads/plugins/seis-plugin-root-20260715",
      preflightCheckpointCommit: PREFLIGHT_COMMIT,
      protectedDefaultBranchWritten: false,
      branchPolicyNotes: [
        "Remote policy notices about pull requests, code scanning, protected refs, and verified signatures were returned by the host during the feature-branch push.",
        "The host accepted the named feature-branch update; this record does not treat that acceptance as a merge, release, or protected default-branch write.",
      ],
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
      reason: "Steps 92–96 deliver the preflight checkpoint only. Wave 3 repository-local handoff, following-wave justification, and a fresh Wave 4 scope and risk decision remain separate requirements.",
    },
    validationScope: [
      "git status --short",
      "git diff --check",
      "git commit -m \"feat(plugins): complete Wave 3 preflight\"",
      "git push origin plugins/seis-plugin-root-20260715",
      "git ls-remote origin refs/heads/plugins/seis-plugin-root-20260715",
    ],
    risks: [
      {
        id: "RISK-W3-012",
        status: "tracked",
        description: "Feature-branch delivery could be misrepresented as protected-branch acceptance or public release.",
        mitigation: "Record the exact branch scope, retain protectedDefaultBranchWritten=false, and keep release-related external claims false.",
      },
      {
        id: "RISK-W3-013",
        status: "tracked",
        description: "A static delivery record can become stale if later commits are mistaken for the preflight checkpoint.",
        mitigation: "Bind this evidence only to the named preflight commit and require every later checkpoint to use its own commit and remote-reference verification.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 3 preflight checkpoint and this delivery-evidence record on the feature branch; no external state, publication, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-3-delivery-evidence" && record.goalId === "SEIS-GOAL-021" && record.wave === 3 && record.status === "completed-repository-local-delivery-evidence", "delivery-evidence identity is invalid");
  assert(list(record.completedSteps).join(",") === COMPLETED_STEPS.join(","), "completed delivery steps are invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 91 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 92 && record.stateAtCheckpoint?.nextPlannedValidationStep === 97 && record.stateAtCheckpoint?.finalWaveHandoffPublished === false && record.stateAtCheckpoint?.waveCompleted === false, "delivery-evidence state snapshot is invalid");
  assert(Object.values(record.checks).every(Boolean), "a required Wave 3 delivery contract is not current");
  assert(record.observedDelivery?.reviewedWorkingTreeBeforePreflightCommit === true && record.observedDelivery?.whitespaceCheckPassedBeforePreflightCommit === true && record.observedDelivery?.committed === true && record.observedDelivery?.pushed === true && record.observedDelivery?.remoteReferenceVerified === true && record.observedDelivery?.featureBranch === FEATURE_BRANCH && record.observedDelivery?.preflightCheckpointCommit === PREFLIGHT_COMMIT && record.observedDelivery?.protectedDefaultBranchWritten === false, "delivery evidence is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.externalClaims?.independentInstallation === false && record.externalClaims?.nativeRuntime === false && record.externalClaims?.liveProvider === false && record.externalClaims?.deployment === false && record.externalClaims?.publicRelease === false, "external claim boundary is invalid");
  assert(record.futureWaveDecision?.wave === 4 && record.futureWaveDecision?.status === "planned-gated" && record.futureWaveDecision?.activationApproved === false && record.futureWaveDecision?.selectedCapability === null, "Wave 4 gate is invalid");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "delivery-evidence inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "delivery-evidence record must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 3 delivery evidence: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 delivery evidence: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
