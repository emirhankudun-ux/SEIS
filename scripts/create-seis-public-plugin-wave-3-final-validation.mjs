#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-final-validation.json";
const SELECTED_CAPABILITY = "seis-swift-concurrency-audit";
const CURRENT_DISTRIBUTION = Object.freeze({
  publicCardCount: 34,
  canonicalCardCount: 1,
  bundleCardCount: 33,
  applicationBundleCardCount: 6,
  topicBundleCardCount: 27,
  rootSourceModuleCount: 5,
  applicationSourcePackageCount: 75,
  topicSourcePackageCount: 300,
  retainedSourcePackageCount: 380,
});
const PRIOR_FEATURE_CHECKPOINT = "7382fdb448f20c33b7cd29a3efee33b31798743d";
const PATHS = Object.freeze({
  wave3Program: "content/development/seis-public-plugin-wave-3-program.json",
  capabilityDecision: "content/development/seis-public-plugin-wave-3-capability-decision.json",
  handoffReadiness: "content/development/seis-public-plugin-wave-3-handoff-readiness.json",
  round3Checkpoint: "content/development/seis-public-plugin-wave-3-round-3-checkpoint.json",
  round4Review: "content/development/seis-public-plugin-wave-3-round-4-review.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  auditEvidence: "content/development/seis-swift-concurrency-audit.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  marketplace: ".agents/plugins/marketplace.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  mcpPermission: "content/development/seis-mcp-permission-risk-matrix.json",
  pluginManifest: "plugins/seis-core/seis-swift-concurrency-audit/.codex-plugin/plugin.json",
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-3-final-validation");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 final-validation check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 3 step 81.");
}

function buildRecord() {
  const wave3Program = readJson(PATHS.wave3Program);
  const capabilityDecision = readJson(PATHS.capabilityDecision);
  const handoffReadiness = readJson(PATHS.handoffReadiness);
  const round3Checkpoint = readJson(PATHS.round3Checkpoint);
  const round4Review = readJson(PATHS.round4Review);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const auditEvidence = readJson(PATHS.auditEvidence);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const marketplace = readJson(PATHS.marketplace);
  const matrix = readJson(PATHS.matrix);
  const mcpPermission = readJson(PATHS.mcpPermission);
  const pluginManifest = readJson(PATHS.pluginManifest);
  const plugins = list(sourceManifest.plugins);
  const cards = list(marketplace.plugins);
  const selectedSourceEntries = plugins.filter((entry) => entry?.name === SELECTED_CAPABILITY);
  const selectedCardEntries = cards.filter((entry) => entry?.name === SELECTED_CAPABILITY);
  const selectedMatrixEntries = list(matrix.plugins).filter((entry) => entry?.name === SELECTED_CAPABILITY);
  const selectedMcpEntries = list(mcpPermission.records).filter((entry) => entry?.name === SELECTED_CAPABILITY);
  const selectedCapabilityRetainedByCuratedProjection = selectedCardEntries.length === 0
    && cards.length === CURRENT_DISTRIBUTION.publicCardCount
    && cards.some((entry) => entry?.name === "seis-ai-agent" && entry?.source?.path === "./plugins/seis-ai-agent")
    && isCurrentMarketplaceProjection(capabilityDecision.currentMarketplaceProjection);
  const inputSafetyScan = scanPublicSafeInputs(Object.values(PATHS));
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-3-final-validation",
    goalId: "SEIS-GOAL-021",
    wave: 3,
    step: 81,
    status: "completed-repository-local-final-validation",
    generatedAt: "2026-07-21",
    purpose: "Record the current Wave 3 tracker and capability-decision validation boundary without completing the wave, activating Wave 4, or claiming external installation, native execution, or release.",
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 80,
      activeStepBeforeTrackerUpdate: 81,
      nextPlannedValidationStep: 82,
      finalWaveHandoffPublished: false,
      waveCompleted: false,
    },
    checks: {
      wave3Tracker: wave3Program.id === "seis-public-plugin-wave-3-program"
        && ["in-progress", "completed"].includes(wave3Program.status)
        && number(wave3Program.progress?.completedStepCount) >= 80
        && (wave3Program.status === "completed" || number(wave3Program.progress?.nextStepNumber) >= 81)
        && wave3Program.selection?.selectedCapability === SELECTED_CAPABILITY,
      capabilityDecision: capabilityDecision.id === "seis-public-plugin-wave-3-capability-decision"
        && capabilityDecision.status === "approved-public-local-implementation"
        && capabilityDecision.decision?.selectedCapability === SELECTED_CAPABILITY
        && capabilityDecision.decision?.implementationStarted === true
        && capabilityDecision.decision?.historicalAdditionalDirectCardAddedAtExecution === true
        && isCurrentMarketplaceProjection(capabilityDecision.currentMarketplaceProjection),
      priorReadiness: handoffReadiness.id === "seis-public-plugin-wave-3-handoff-readiness"
        && handoffReadiness.status === "completed-repository-local-handoff-readiness"
        && handoffReadiness.step === 80
        && handoffReadiness.futureWaveDecision?.activationApproved === false,
      resilienceReviews: round3Checkpoint.id === "seis-public-plugin-wave-3-round-3-checkpoint"
        && round3Checkpoint.status === "completed-repository-local-checkpoint"
        && round4Review.id === "seis-public-plugin-wave-3-round-4-review"
        && round4Review.status === "completed-repository-local-round-review",
      selectedPackage: pluginManifest.name === SELECTED_CAPABILITY
        && selectedSourceEntries.length === 1
        && selectedCardEntries.length === 0
        && selectedCapabilityRetainedByCuratedProjection
        && selectedMatrixEntries.length === 1
        && selectedMcpEntries.length === 1
        && plugins.length === APP_PLUGIN_EXPANSION_TARGET
        && cards.length === CURRENT_DISTRIBUTION.publicCardCount
        && matrix.pluginCount === APP_PLUGIN_EXPANSION_TARGET
        && matrix.failureCount === 0,
      staticAudit: auditEvidence.status === "attention-public-static-concurrency-evidence"
        && auditEvidence.audit?.ok === true
        && number(auditEvidence.audit?.blockingFindingCount) === 0,
      denyByDefaultMcp: list(selectedMcpEntries[0]?.permissions?.write).length === 0
        && list(selectedMcpEntries[0]?.permissions?.network).length === 0
        && list(selectedMcpEntries[0]?.permissions?.secrets).length === 0
        && selectedMcpEntries[0]?.remoteEndpointDeclared === false
        && selectedMcpEntries[0]?.environmentInjectionDeclared === false,
      continuityGate: continuityCadence.id === "seis-public-plugin-continuity-cadence"
        && ["in-progress", "completed"].includes(continuityCadence.waves?.[2]?.status)
        && number(continuityCadence.waves?.[2]?.completedSteps) >= 80
        && ["planned-gated", "in-progress", "completed"].includes(continuityCadence.waves?.[3]?.status)
        && ["planned-gated", "in-progress", "completed"].includes(continuityCadence.waves?.[4]?.status),
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
      compiledSwift: auditEvidence.safety?.compilesSwift === true,
      nativeRuntime: auditEvidence.safety?.startsNativeApplication === true,
      independentInstallation: false,
      publicRelease: false,
    },
    futureWaveDecision: {
      wave: 4,
      status: "planned-gated",
      activationApproved: false,
      selectedCapability: null,
      reason: "Step 81 validates the current Wave 3 tracker and capability decision only. Wave 3 final validation, handoff, and a fresh Wave 4 scope and risk decision remain required.",
    },
    delivery: {
      featureBranch: "plugins/seis-plugin-root-20260715",
      priorFeatureCheckpointCommit: PRIOR_FEATURE_CHECKPOINT,
      protectedDefaultBranchWritten: false,
      checkpointRule: "This repository-local validation record is committed and delivered only through the current feature branch after local validation. It does not predict a future commit SHA or assert a public release.",
    },
    validation: [
      "npm run check:seis-public-plugin-wave-3-final-validation",
      "npm run check:seis-public-plugin-wave-3-program",
      "npm run check:seis-public-plugin-wave-3-capability-decision",
      "npm run check:seis-public-plugin-continuity",
    ],
    risks: [
      {
        id: "RISK-W3-008",
        status: "tracked",
        description: "A tracker validation checkpoint could be mistaken for a completed Wave 3 or an approved Wave 4.",
        mitigation: "Keep Wave 3 in progress, retain later steps, and set Wave 4 activationApproved false.",
      },
      {
        id: "RISK-W3-009",
        status: "tracked",
        description: "Static audit evidence could be confused with compiled Swift, native runtime, independent installation, or release proof.",
        mitigation: "Record each external claim as false and preserve the public-release gate.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this focused Wave 3 validation record and its tracking references on the feature branch; no external state, publication, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function isCurrentMarketplaceProjection(projection) {
  return projection?.projectionModel === "curated-bundle-cards"
    && projection?.distributionMode === "curated-bounded-public-bundles"
    && projection?.marketplaceName === "seis-repo"
    && projection?.marketplaceDisplayName === "SEIS Repo"
    && projection?.publicCardCount === CURRENT_DISTRIBUTION.publicCardCount
    && projection?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount
    && projection?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount
    && projection?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount
    && projection?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount
    && projection?.sourceCapabilityInventory?.rootSourceModuleCount === CURRENT_DISTRIBUTION.rootSourceModuleCount
    && projection?.sourceCapabilityInventory?.applicationSourcePackageCount === CURRENT_DISTRIBUTION.applicationSourcePackageCount
    && projection?.sourceCapabilityInventory?.topicSourcePackageCount === CURRENT_DISTRIBUTION.topicSourcePackageCount
    && projection?.sourceCapabilityInventory?.retainedSourcePackageCount === CURRENT_DISTRIBUTION.retainedSourcePackageCount
    && projection?.sourceCapabilityInventory?.sourcePackagesDeleted === false
    && projection?.selectedApplicationCapability?.id === SELECTED_CAPABILITY
    && projection?.selectedApplicationCapability?.retainedSource === true
    && projection?.selectedApplicationCapability?.directMarketplaceCardRequired === false
    && projection?.selectedApplicationCapability?.directMarketplaceCardCount === 0
    && projection?.selectedApplicationCapability?.bundleCardCount === 1
    && projection?.selectedApplicationCapability?.bundleId === "seis-application-bundle-06"
    && projection?.selectedApplicationCapability?.bundleFamily === "application";
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-3-final-validation" && record.goalId === "SEIS-GOAL-021" && record.wave === 3 && record.step === 81 && record.status === "completed-repository-local-final-validation", "final-validation identity is invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 80 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 81 && record.stateAtCheckpoint?.nextPlannedValidationStep === 82 && record.stateAtCheckpoint?.finalWaveHandoffPublished === false && record.stateAtCheckpoint?.waveCompleted === false, "final-validation state snapshot is invalid");
  assert(Object.values(record.checks).every(Boolean), "a required tracker or decision validation contract is not current");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.externalClaims?.compiledSwift === false && record.externalClaims?.nativeRuntime === false && record.externalClaims?.independentInstallation === false && record.externalClaims?.publicRelease === false, "external claim boundary is invalid");
  assert(record.futureWaveDecision?.wave === 4 && record.futureWaveDecision?.status === "planned-gated" && record.futureWaveDecision?.activationApproved === false && record.futureWaveDecision?.selectedCapability === null, "Wave 4 gate is invalid");
  assert(record.delivery?.featureBranch === "plugins/seis-plugin-root-20260715" && record.delivery?.priorFeatureCheckpointCommit === PRIOR_FEATURE_CHECKPOINT && record.delivery?.protectedDefaultBranchWritten === false, "delivery boundary is invalid");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "final-validation inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "final-validation record must not contain a machine-specific path");
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

function number(value) {
  return Number.isFinite(value) ? value : 0;
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 3 final validation: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 final validation: required input is missing");
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
