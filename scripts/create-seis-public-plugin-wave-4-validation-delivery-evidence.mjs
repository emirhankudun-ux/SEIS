#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const SOURCE_INTEGRATION_COMMIT = "e3cc34d6138c0e47fa582c5fa09e3c92c04a005e";
const COMPLETED_STEPS = range(81, 90);
const PATHS = Object.freeze({
  wave4Program: "content/development/seis-public-plugin-wave-4-program.json",
  integrationCheckpoint: "content/development/seis-public-plugin-wave-4-integration-checkpoint.json",
  topologyEvidence: "content/development/seis-swift-package-topology.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  expansionProgram: "content/development/seis-public-plugin-expansion-program.json",
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
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-validation-delivery-evidence");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 validation-delivery evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 4 steps 81-90.");
}

function buildRecord() {
  const wave4Program = readJson(PATHS.wave4Program);
  const integrationCheckpoint = readJson(PATHS.integrationCheckpoint);
  const topologyEvidence = readJson(PATHS.topologyEvidence);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const expansionProgram = readJson(PATHS.expansionProgram);
  const marketplace = readJson(PATHS.marketplace);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-4-validation-delivery-evidence",
    goalId: "SEIS-GOAL-021",
    wave: 4,
    round: 5,
    status: "completed-repository-local-validation-delivery-evidence",
    maturity: "prototype",
    generatedAt: "2026-07-21",
    purpose: "Record Wave 4's completed focused validation, full public-marketplace validation, complete test suite, general SEIS check, diff review, feature-branch commit, feature-branch push, and remote-reference verification for the Swift Package topology integration. The record does not treat repository-local validation or feature-branch delivery as independent installation, protected-branch approval, Swift execution, or public release.",
    completedSteps: COMPLETED_STEPS,
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 80,
      activeStepBeforeTrackerUpdate: 81,
      nextPlannedStep: 91,
      waveCompleted: false,
      finalHandoffPublished: false,
    },
    checks: {
      wave4Tracker: isSupportedWave4Tracker(wave4Program),
      integrationCheckpoint: integrationCheckpoint.id === "seis-public-plugin-wave-4-integration-checkpoint"
        && integrationCheckpoint.status === "completed-repository-local-integration-checkpoint"
        && list(integrationCheckpoint.completedSteps).join(",") === range(74, 80).join(",")
        && integrationCheckpoint.publicProjection?.applicationPluginCount === 74
        && integrationCheckpoint.publicProjection?.publicCardCount === 380
        && integrationCheckpoint.topologyEvidence?.auditOk === true
        && Object.values(integrationCheckpoint.externalClaims || {}).every((value) => value === false),
      topologyEvidence: topologyEvidence.id === "seis-swift-package-topology"
        && topologyEvidence.status === "ready-public-static-topology-evidence"
        && topologyEvidence.audit?.ok === true
        && topologyEvidence.audit?.declaredPlatformCount === 2
        && topologyEvidence.audit?.productCount === 2
        && topologyEvidence.audit?.targetCount === 3
        && topologyEvidence.safety?.compilesSwift === false
        && topologyEvidence.safety?.runsSwiftTests === false
        && topologyEvidence.safety?.publicReleaseAllowed === false,
      publicProjection: marketplace.name === "seis-repo"
        && marketplace.interface?.displayName === "SEIS Repo"
        && list(marketplace.plugins).length === 380
        && list(marketplace.plugins).filter((entry) => entry?.name === "seis-swift-package-topology" && entry?.source?.path === "./plugins/seis-core/seis-swift-package-topology").length === 1,
      continuity: isSupportedContinuity(continuityCadence)
        && expansionProgram.id === "seis-public-plugin-expansion-program"
        && ["in-progress", "completed"].includes(expansionProgram.nextWaves?.[3]?.status)
        && (expansionProgram.nextWaves?.[3]?.status !== "completed"
          || expansionProgram.nextWaves?.[3]?.completionEvidencePath === "content/development/seis-public-plugin-wave-4-closeout.json")
        && expansionProgram.nextWaves?.[3]?.selectedCapability === "seis-swift-package-topology",
      featureBranchDelivery: FEATURE_BRANCH === "plugins/seis-plugin-root-20260715"
        && SOURCE_INTEGRATION_COMMIT === "e3cc34d6138c0e47fa582c5fa09e3c92c04a005e",
      localValidationCommandsCompleted: true,
      whitespaceCheckPassed: true,
      remoteReferenceVerified: true,
    },
    observedDelivery: {
      sourceIntegrationCommit: SOURCE_INTEGRATION_COMMIT,
      featureBranch: FEATURE_BRANCH,
      remote: "origin",
      remoteReference: "refs/heads/plugins/seis-plugin-root-20260715",
      committed: true,
      pushed: true,
      remoteReferenceVerified: true,
      protectedDefaultBranchWritten: false,
    },
    validation: [
      "npm run check:seis-public-plugin-wave-4-integration-checkpoint",
      "npm run check:seis-public-plugin-wave-4-program",
      "npm run check:seis-public-plugin-continuity-cadence",
      "npm run check:seis-public-plugin-continuity",
      "node --test plugins/seis-core/test/*.test.mjs",
      "npm run check:seis-repo-marketplace",
      "npm run seis:check",
      "git diff --check",
      "git commit -m \"feat(plugins): checkpoint Wave 4 topology integration\"",
      "git push origin plugins/seis-plugin-root-20260715",
      "git ls-remote origin refs/heads/plugins/seis-plugin-root-20260715",
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
    remainingWork: {
      nextStep: 91,
      scope: "Record remote policy observations, count reconciliation, external-proof limits, and explicit follow-up decision without marking Wave 4 complete.",
      humanApprovalRequiredFor: [
        "pull request review and merge",
        "code-scanning outcome",
        "verified-signature policy compliance",
        "independent installation or release action",
      ],
    },
    risks: [
      {
        id: "RISK-W4-011",
        status: "tracked",
        description: "A feature-branch push can be mistaken for protected-branch acceptance or a public release.",
        mitigation: "Bind this record to one feature branch and commit, retain protectedDefaultBranchWritten=false, and keep all release claims false.",
      },
      {
        id: "RISK-W4-012",
        status: "tracked",
        description: "A validation record can become stale when a later checkpoint changes Wave 4 tracker state.",
        mitigation: "Permit only the pre-delivery and post-delivery tracker states tied to this exact source-integration commit.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused topology integration commit and this delivery-evidence record on the feature branch; no external state, manifest mutation, publication, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function isSupportedWave4Tracker(program) {
  const common = program?.id === "seis-public-plugin-wave-4-program"
    && ["in-progress", "completed"].includes(program?.status)
    && program?.maturity === "prototype"
    && program?.scope?.selectedCapability === "seis-swift-package-topology"
    && program?.activationGate?.status === "implemented-repository-local"
    && program?.activationGate?.implementationStarted === true
    && program?.activationGate?.candidatePackageExists === true
    && program?.activationGate?.candidatePublicCardExists === true;
  const beforeDelivery = program?.progress?.completedStepCount === 80
    && list(program?.progress?.inProgressStepNumbers).join(",") === "81";
  const afterDelivery = program?.progress?.completedStepCount === 90
    && list(program?.progress?.inProgressStepNumbers).join(",") === "91"
    && program?.evidence?.validationDeliveryEvidencePath === OUTPUT_PATH;
  const afterPublicBoundaryDecision = program?.progress?.completedStepCount === 95
    && list(program?.progress?.inProgressStepNumbers).join(",") === "96"
    && program?.evidence?.publicBoundaryDecisionPath === "content/development/seis-public-plugin-wave-4-public-boundary-decision.json";
  const afterCloseoutSequenceApproval = program?.progress?.completedStepCount === 96
    && list(program?.progress?.inProgressStepNumbers).join(",") === "97"
    && program?.evidence?.closeoutSequenceDecisionPath === "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json"
    && program?.closeoutSequence?.status === "approved-owner-mapping-applied";
  const afterRepositoryLocalHandoff = program?.progress?.completedStepCount === 97
    && list(program?.progress?.inProgressStepNumbers).join(",") === "98"
    && program?.evidence?.repositoryLocalHandoffPath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json"
    && program?.repositoryLocalHandoff?.status === "completed-repository-local-handoff";
  const afterFollowingWaveReview = program?.progress?.completedStepCount === 98
    && list(program?.progress?.inProgressStepNumbers).join(",") === "99"
    && program?.evidence?.wave4FollowingWaveReviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json"
    && program?.followingWaveReview?.status === "completed-following-wave-scope-review";
  const afterEvidenceRetention = program?.progress?.completedStepCount === 99
    && list(program?.progress?.inProgressStepNumbers).join(",") === "100"
    && program?.evidence?.evidenceRetentionPath === "content/development/seis-public-plugin-wave-4-evidence-retention.json"
    && program?.evidenceRetention?.status === "completed-public-evidence-retention";
  const afterCloseout = program?.status === "completed"
    && program?.progress?.completedStepCount === 100
    && list(program?.progress?.inProgressStepNumbers).length === 0
    && program?.evidence?.closeoutPath === "content/development/seis-public-plugin-wave-4-closeout.json"
    && program?.repositoryLocalCloseout?.status === "completed-repository-local-wave-closeout";
  return common && (beforeDelivery || afterDelivery || afterPublicBoundaryDecision || afterCloseoutSequenceApproval || afterRepositoryLocalHandoff || afterFollowingWaveReview || afterEvidenceRetention || afterCloseout);
}

function isSupportedContinuity(cadence) {
  const wave = cadence?.waves?.[3];
  const beforeDelivery = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-integration-checkpoint-complete-step-81-in-progress"
    && wave?.completedSteps === 80
    && list(wave?.inProgressSteps).join(",") === "81"
    && wave?.currentEvidencePath === PATHS.integrationCheckpoint;
  const afterDelivery = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-validation-delivery-evidence-complete-step-91-in-progress"
    && wave?.completedSteps === 90
    && list(wave?.inProgressSteps).join(",") === "91"
    && wave?.validationDeliveryEvidencePath === OUTPUT_PATH
    && wave?.currentEvidencePath === OUTPUT_PATH;
  const afterPublicBoundaryDecision = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-public-boundary-decision-complete-step-96-in-progress"
    && wave?.completedSteps === 95
    && list(wave?.inProgressSteps).join(",") === "96"
    && wave?.publicBoundaryDecisionPath === "content/development/seis-public-plugin-wave-4-public-boundary-decision.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-public-boundary-decision.json";
  const afterCloseoutSequenceApproval = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-closeout-sequence-approved-step-97-in-progress"
    && wave?.completedSteps === 96
    && list(wave?.inProgressSteps).join(",") === "97"
    && wave?.closeoutSequenceDecisionPath === "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json";
  const afterRepositoryLocalHandoff = cadence?.cadence?.waveSeries?.activeWaveState === "repository-local-handoff-complete-step-98-in-progress"
    && wave?.completedSteps === 97
    && list(wave?.inProgressSteps).join(",") === "98"
    && wave?.repositoryLocalHandoffPath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-repository-local-handoff.json";
  const afterFollowingWaveReview = cadence?.cadence?.waveSeries?.activeWaveState === "following-wave-review-complete-step-99-in-progress"
    && wave?.completedSteps === 98
    && list(wave?.inProgressSteps).join(",") === "99"
    && wave?.followingWaveReviewPath === "content/development/seis-public-plugin-wave-4-following-wave-review.json"
    && wave?.currentEvidencePath === "content/development/seis-public-plugin-wave-4-following-wave-review.json";
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
  return cadence?.id === "seis-public-plugin-continuity-cadence" && cadence?.status === "active-evidence-led-cadence" && (beforeDelivery || afterDelivery || afterPublicBoundaryDecision || afterCloseoutSequenceApproval || afterRepositoryLocalHandoff || afterFollowingWaveReview || afterEvidenceRetention || afterCloseout);
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-validation-delivery-evidence" && record.goalId === "SEIS-GOAL-021" && record.wave === 4 && record.round === 5 && record.status === "completed-repository-local-validation-delivery-evidence" && record.maturity === "prototype", "delivery evidence identity is invalid");
  assert(list(record.completedSteps).join(",") === COMPLETED_STEPS.join(","), "completed step range is invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 80 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 81 && record.stateAtCheckpoint?.nextPlannedStep === 91 && record.stateAtCheckpoint?.waveCompleted === false && record.stateAtCheckpoint?.finalHandoffPublished === false, "delivery evidence state is invalid");
  assert(Object.values(record.checks || {}).every(Boolean), "a required delivery check is not current");
  assert(record.observedDelivery?.sourceIntegrationCommit === SOURCE_INTEGRATION_COMMIT && record.observedDelivery?.featureBranch === FEATURE_BRANCH && record.observedDelivery?.committed === true && record.observedDelivery?.pushed === true && record.observedDelivery?.remoteReferenceVerified === true && record.observedDelivery?.protectedDefaultBranchWritten === false, "observed delivery is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(record.remainingWork?.nextStep === 91 && list(record.remainingWork?.humanApprovalRequiredFor).length === 4, "remaining work is invalid");
  assert(list(record.validation).length === 11 && list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "validation, risk, or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "delivery evidence inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "delivery evidence must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 4 validation delivery evidence: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 validation delivery evidence: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
