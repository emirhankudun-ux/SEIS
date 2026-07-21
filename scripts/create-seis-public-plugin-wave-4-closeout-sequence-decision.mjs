#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json";
const REMAINING_STEPS = [97, 98, 99, 100];
const PATHS = Object.freeze({
  handoffPreparation: "content/development/seis-public-plugin-wave-4-handoff-preparation.json",
  wave4Program: "content/development/seis-public-plugin-wave-4-program.json",
  publicBoundaryDecision: "content/development/seis-public-plugin-wave-4-public-boundary-decision.json",
  expansionProgram: "content/development/seis-public-plugin-expansion-program.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;
const SECRET_PATTERNS = [
  { id: "openai-like-api-key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "private-key-header", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-closeout-sequence-decision");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 closeout-sequence decision check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " as a non-terminal owner-decision gate.");
}

function buildRecord() {
  const handoffPreparation = readJson(PATHS.handoffPreparation);
  const wave4Program = readJson(PATHS.wave4Program);
  const publicBoundaryDecision = readJson(PATHS.publicBoundaryDecision);
  const expansionProgram = readJson(PATHS.expansionProgram);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-4-closeout-sequence-decision",
    goalId: "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE",
    parentGoalId: "SEIS-GOAL-021",
    wave: 4,
    round: 5,
    status: "proposed-owner-decision-required",
    maturity: "specification",
    generatedAt: "2026-07-21",
    purpose: "Expose the non-circular closeout-order decision required before Wave 4 steps 96 through 100 can change status. This proposed record does not create a terminal handoff, complete Wave 4, activate Wave 5, merge, publish, sign, install, deploy, or claim independent external proof.",
    stateAtDecision: {
      completedStepCount: 95,
      activeStep: 96,
      plannedStepNumbers: REMAINING_STEPS,
      terminalHandoffPublished: false,
      waveCompleted: false,
      wave5ActivationApproved: false,
    },
    currentEvidence: {
      handoffPreparation: isSupportedHandoffPreparation(handoffPreparation),
      wave4Program: isSupportedWave4Program(wave4Program),
      publicBoundaryDecision: isSupportedPublicBoundaryDecision(publicBoundaryDecision),
      expansionProgram: isSupportedExpansionProgram(expansionProgram),
      continuityCadence: isSupportedContinuityCadence(continuityCadence),
    },
    decisionBoundary: {
      status: "owner-decision-required",
      approvalRequired: true,
      approved: false,
      appliedToCanonicalProgram: false,
      automaticStepStatusChangesAllowed: false,
      terminalHandoffPublished: false,
      waveCompleted: false,
      wave5ActivationApproved: false,
    },
    cycleAnalysis: {
      detected: true,
      summary: "Step 96 requires current evidence for all one hundred planned steps, while the following closeout actions are intended to create or classify evidence needed for terminal handoff and completion. Without an explicit ordering decision, automatically changing any remaining step would make a circular or inferred completion claim.",
      affectedSteps: [96, ...REMAINING_STEPS],
      safeguards: [
        "Keep step 96 in progress and steps 97 through 100 planned until an owner-approved sequence is recorded in the canonical program.",
        "Do not interpret a feature-branch push, local validation, or this proposal as a terminal handoff, merge, release, signing, installation, deployment, or independent external proof.",
        "Keep Wave 5 planned-gated until a separate scope and risk review is approved after any valid Wave 4 closeout.",
      ],
    },
    proposedResolution: {
      status: "proposed-not-applied",
      ownerDecisionRequired: true,
      noStepStatusChanges: true,
      sequence: [
        {
          order: 1,
          action: "Record the closeout evidence-order decision.",
          canonicalStep: null,
          effect: "This is a proposal record only; it does not complete a Wave 4 program step.",
        },
        {
          order: 2,
          action: "Obtain an explicit owner decision on whether to adopt a non-circular canonical mapping for steps 96 through 100.",
          canonicalStep: null,
          effect: "No tracker, handoff, completion, archive, report, or Wave 5 state changes before approval.",
        },
        {
          order: 3,
          action: "If approved, make one focused canonical-program update and collect each step's evidence only at the point its gate is satisfied.",
          canonicalStep: null,
          effect: "Preserve distinct repository-local, external-proof, release, and Wave 5 approval boundaries.",
        },
      ],
    },
    ownerOptions: [
      {
        id: "accept-non-circular-mapping",
        status: "not-selected",
        effect: "Authorize a separate focused canonical-program change that records an explicit non-circular evidence order before any terminal closeout action.",
      },
      {
        id: "retain-current-order",
        status: "not-selected",
        effect: "Keep Wave 4 at step 96 and require separately specified evidence or approval that satisfies the existing all-one-hundred-steps prerequisite without inference.",
      },
      {
        id: "pause-or-cancel-wave-4-closeout",
        status: "not-selected",
        effect: "Stop the closeout sequence without claiming completion; retain the public repository-local evidence and rollback boundary.",
      },
    ],
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
    risks: [
      {
        id: "RISK-W4-017",
        status: "tracked",
        description: "A proposal could be misread as authorization to rewrite the canonical closeout order or to mark remaining steps complete.",
        mitigation: "Set approvalRequired=true, approved=false, appliedToCanonicalProgram=false, and noStepStatusChanges=true until an owner decision is recorded.",
      },
      {
        id: "RISK-W4-018",
        status: "tracked",
        description: "A repository-local evidence record could be confused with public release, independent installation, runtime, merge, or protected-branch policy proof.",
        mitigation: "Keep every external claim false and preserve the existing feature-branch-only, public-release-gated boundary.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this proposed closeout-sequence decision and its feature-branch references. No terminal handoff, external state, release, publication, data migration, or canonical step-status transition exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function isSupportedHandoffPreparation(record) {
  return record?.id === "seis-public-plugin-wave-4-handoff-preparation"
    && record?.status === "in-progress-repository-local-handoff-preparation"
    && record?.step === 96
    && record?.stateAtPreparation?.completedStepCount === 95
    && record?.stateAtPreparation?.activeStep === 96
    && list(record?.stateAtPreparation?.remainingStepNumbers).join(",") === REMAINING_STEPS.join(",")
    && record?.handoffGate?.ready === false
    && record?.handoffGate?.terminalHandoffPublished === false
    && record?.handoffGate?.waveCompleted === false
    && record?.handoffGate?.wave5ActivationApproved === false
    && record?.recommendedFollowUp?.goalId === "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE"
    && record?.recommendedFollowUp?.status === "created-proposed-owner-decision-required"
    && record?.recommendedFollowUp?.decisionPath === OUTPUT_PATH
    && Object.values(record?.externalClaims || {}).every((value) => value === false);
}

function isSupportedWave4Program(record) {
  return record?.id === "seis-public-plugin-wave-4-program"
    && record?.status === "in-progress"
    && record?.progress?.completedStepCount === 95
    && list(record?.progress?.inProgressStepNumbers).join(",") === "96"
    && record?.progress?.plannedStepCount === 4
    && record?.evidence?.handoffPreparationPath === PATHS.handoffPreparation
    && record?.evidence?.closeoutSequenceDecisionPath === OUTPUT_PATH
    && Object.values(record?.externalClaims || {}).every((value) => value === false);
}

function isSupportedPublicBoundaryDecision(record) {
  return record?.id === "seis-public-plugin-wave-4-public-boundary-decision"
    && record?.status === "completed-repository-local-public-boundary-decision"
    && list(record?.completedSteps).join(",") === "91,92,93,94,95"
    && record?.publicCountReconciliation?.marketplaceName === "seis-repo"
    && record?.publicCountReconciliation?.marketplaceDisplayName === "SEIS Repo"
    && record?.publicCountReconciliation?.applicationPluginCount === 74
    && record?.publicCountReconciliation?.publicCardCount === 380
    && record?.externalProofAndApprovals?.publicReleaseAllowed === false
    && Object.values(record?.externalClaims || {}).every((value) => value === false);
}

function isSupportedExpansionProgram(record) {
  const wave4 = list(record?.nextWaves)[3];
  return record?.id === "seis-public-plugin-expansion-program"
    && wave4?.status === "in-progress"
    && wave4?.programPath === PATHS.wave4Program
    && wave4?.handoffPreparationPath === PATHS.handoffPreparation
    && wave4?.closeoutSequenceDecisionPath === OUTPUT_PATH
    && list(record?.nextWaves)[4]?.status === "planned-gated";
}

function isSupportedContinuityCadence(record) {
  const wave4 = list(record?.waves)[3];
  return record?.id === "seis-public-plugin-continuity-cadence"
    && record?.status === "active-evidence-led-cadence"
    && record?.cadence?.waveSeries?.activeWave === 4
    && wave4?.status === "in-progress"
    && wave4?.completedSteps === 95
    && list(wave4?.inProgressSteps).join(",") === "96"
    && wave4?.handoffPreparationPath === PATHS.handoffPreparation
    && wave4?.closeoutSequenceDecisionPath === OUTPUT_PATH
    && list(record?.waves)[4]?.status === "planned-gated";
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-closeout-sequence-decision" && record.goalId === "SEIS-GOAL-021-W4-CLOSEOUT-SEQUENCE" && record.parentGoalId === "SEIS-GOAL-021" && record.wave === 4 && record.round === 5 && record.status === "proposed-owner-decision-required" && record.maturity === "specification", "closeout-sequence identity is invalid");
  assert(record.stateAtDecision?.completedStepCount === 95 && record.stateAtDecision?.activeStep === 96 && list(record.stateAtDecision?.plannedStepNumbers).join(",") === REMAINING_STEPS.join(",") && record.stateAtDecision?.terminalHandoffPublished === false && record.stateAtDecision?.waveCompleted === false && record.stateAtDecision?.wave5ActivationApproved === false, "closeout-sequence state is invalid");
  assert(Object.values(record.currentEvidence || {}).every(Boolean), "a required closeout-sequence evidence input is not current");
  assert(record.decisionBoundary?.status === "owner-decision-required" && record.decisionBoundary?.approvalRequired === true && record.decisionBoundary?.approved === false && record.decisionBoundary?.appliedToCanonicalProgram === false && record.decisionBoundary?.automaticStepStatusChangesAllowed === false && record.decisionBoundary?.terminalHandoffPublished === false && record.decisionBoundary?.waveCompleted === false && record.decisionBoundary?.wave5ActivationApproved === false, "closeout-sequence decision boundary is invalid");
  assert(record.cycleAnalysis?.detected === true && list(record.cycleAnalysis?.affectedSteps).join(",") === [96, ...REMAINING_STEPS].join(",") && list(record.cycleAnalysis?.safeguards).length === 3, "closeout-sequence cycle analysis is invalid");
  assert(record.proposedResolution?.status === "proposed-not-applied" && record.proposedResolution?.ownerDecisionRequired === true && record.proposedResolution?.noStepStatusChanges === true && list(record.proposedResolution?.sequence).length === 3 && list(record.ownerOptions).length === 3 && list(record.ownerOptions).every((option) => option?.status === "not-selected"), "closeout-sequence proposal is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "closeout-sequence public boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "closeout-sequence external claims must remain false");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "closeout-sequence risks or rollback are invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "closeout-sequence inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "closeout-sequence record must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 4 closeout sequence: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 closeout sequence: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
