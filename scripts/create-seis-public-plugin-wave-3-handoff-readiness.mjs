#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-handoff-readiness.json";
const PATHS = Object.freeze({
  wave3Program: "content/development/seis-public-plugin-wave-3-program.json",
  round3Checkpoint: "content/development/seis-public-plugin-wave-3-round-3-checkpoint.json",
  round4Review: "content/development/seis-public-plugin-wave-3-round-4-review.json",
  capabilityDecision: "content/development/seis-public-plugin-wave-3-capability-decision.json",
  auditEvidence: "content/development/seis-swift-concurrency-audit.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  marketplace: ".agents/plugins/marketplace.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  mcpPermission: "content/development/seis-mcp-permission-risk-matrix.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  freshTaskReload: "content/development/seis-public-plugin-fresh-task-reload-evidence.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
  externalProof: "content/development/seis-public-plugin-external-install-proof.json",
  installState: "content/development/seis-public-install-state.json",
  installEvidence: "content/development/seis-public-install-evidence.json",
});
const EXPECTED_PUBLIC_CARD_COUNT = APP_PLUGIN_EXPANSION_TARGET + 306;
const PRIOR_VALIDATED_CHECKPOINT = "3e8d4a598cd369742f8591de89d6c98f67b17006";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-3-handoff-readiness");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 handoff-readiness check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 3 step 80 readiness.");
}

function buildRecord() {
  const wave3Program = readJson(PATHS.wave3Program);
  const round3Checkpoint = readJson(PATHS.round3Checkpoint);
  const round4Review = readJson(PATHS.round4Review);
  const capabilityDecision = readJson(PATHS.capabilityDecision);
  const auditEvidence = readJson(PATHS.auditEvidence);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const marketplace = readJson(PATHS.marketplace);
  const matrix = readJson(PATHS.matrix);
  const mcpPermission = readJson(PATHS.mcpPermission);
  const lifecycle = readJson(PATHS.lifecycle);
  const freshTaskReload = readJson(PATHS.freshTaskReload);
  const securityReview = readJson(PATHS.securityReview);
  const externalProof = readJson(PATHS.externalProof);
  const installState = readJson(PATHS.installState);
  const installEvidence = readJson(PATHS.installEvidence);
  const cards = list(marketplace.plugins);
  const plugins = list(sourceManifest.plugins);
  const selectedSourceEntries = plugins.filter((entry) => entry?.name === "seis-swift-concurrency-audit");
  const selectedCardEntries = cards.filter((entry) => entry?.name === "seis-swift-concurrency-audit");
  const selectedMatrixEntries = list(matrix.plugins).filter((entry) => entry?.name === "seis-swift-concurrency-audit");
  const selectedMcpEntries = list(mcpPermission.records).filter((entry) => entry?.name === "seis-swift-concurrency-audit");
  const inputSafetyScan = scanPublicSafeInputs(Object.values(PATHS));
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-3-handoff-readiness",
    goalId: "SEIS-GOAL-021",
    wave: 3,
    step: 80,
    status: "completed-repository-local-handoff-readiness",
    generatedAt: "2026-07-21",
    purpose: "Prepare the Wave 3 handoff boundary from current repository-local evidence without presenting Wave 3 as complete or activating Wave 4.",
    stateAtReadiness: {
      completedStepCountBeforeReadiness: 79,
      activeStepBeforeReadiness: 80,
      completedRoundCountBeforeReadiness: 3,
      finalValidationRoundSteps: range(81, 100),
      finalWaveHandoffPublished: false,
    },
    currentProgram: {
      id: wave3Program.id || null,
      status: "in-progress",
      selectedCapability: wave3Program.selection?.selectedCapability || null,
      implementationStarted: wave3Program.selection?.implementationStarted === true,
      additionalPublicCardAdded: wave3Program.selection?.additionalPublicCardAdded === true,
      hasAtLeastReadinessPredecessor: number(wave3Program.progress?.completedStepCount) >= 79,
    },
    completedEvidence: {
      round3Checkpoint: round3Checkpoint.status === "completed-repository-local-checkpoint",
      round4Review: round4Review.status === "completed-repository-local-round-review",
      capabilityDecision: capabilityDecision.status === "approved-public-local-implementation"
        && capabilityDecision.decision?.selectedCapability === "seis-swift-concurrency-audit",
      staticAudit: auditEvidence.status === "attention-public-static-concurrency-evidence"
        && auditEvidence.audit?.ok === true
        && number(auditEvidence.audit?.blockingFindingCount) === 0,
      sourceAndMarketplace: selectedSourceEntries.length === 1
        && selectedCardEntries.length === 1
        && selectedMatrixEntries.length === 1
        && selectedMcpEntries.length === 1
        && plugins.length === APP_PLUGIN_EXPANSION_TARGET
        && cards.length === EXPECTED_PUBLIC_CARD_COUNT,
      denyByDefaultMcp: list(selectedMcpEntries[0]?.permissions?.write).length === 0
        && list(selectedMcpEntries[0]?.permissions?.network).length === 0
        && list(selectedMcpEntries[0]?.permissions?.secrets).length === 0
        && selectedMcpEntries[0]?.remoteEndpointDeclared === false
        && selectedMcpEntries[0]?.environmentInjectionDeclared === false,
      matrix: matrix.pluginCount === APP_PLUGIN_EXPANSION_TARGET
        && matrix.failureCount === 0
        && selectedMatrixEntries[0]?.ok === true,
      lifecycle: lifecycle.status === "active-local-proof-public-release-gated"
        && lifecycle.externalInstallProofSummary?.publicReleaseAllowed === false,
      securityProvenance: securityReview.status === "repo-local-security-provenance-reviewed"
        && number(securityReview.aggregate?.secretFindingCount) === 0
        && number(securityReview.aggregate?.blockingFindingCount) === 0,
      continuity: continuityCadence.id === "seis-public-plugin-continuity-cadence"
        && ["in-progress", "completed"].includes(continuityCadence.waves?.[2]?.status)
        && number(continuityCadence.waves?.[2]?.completedSteps) >= 79
        && ["planned-gated", "in-progress"].includes(continuityCadence.waves?.[3]?.status)
        && continuityCadence.waves?.[4]?.status === "planned-gated",
    },
    publicBoundary: {
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      publicAudience: wave3Program.publicBoundary?.publicAudience || null,
      personalMarketplaceRead: wave3Program.publicBoundary?.personalMarketplaceRead === true,
      personalMarketplaceMutation: wave3Program.publicBoundary?.personalMarketplaceMutation === true,
      network: wave3Program.publicBoundary?.network === true,
      externalWrites: wave3Program.publicBoundary?.externalWrites === true,
      secrets: wave3Program.publicBoundary?.secrets === true,
      publicReleaseAllowed: wave3Program.publicBoundary?.publicReleaseAllowed === true,
    },
    futureWaveDecision: {
      wave: 4,
      status: "planned-gated",
      activationApproved: false,
      selectedCapability: null,
      reason: "Wave 3 final validation and its terminal handoff are still pending; a new Wave 4 scope, risk, rollback, and capability decision does not yet exist.",
      requiredBeforeActivation: [
        "Wave 3 final validation round completes with current evidence.",
        "Wave 3 terminal repository-local handoff is published.",
        "A fresh non-duplicative Wave 4 scope and capability decision is approved.",
        "Wave 4 validation, risk, rollback, public boundary, and user authority are current.",
      ],
    },
    externalGaps: {
      freshTaskReloadStatus: freshTaskReload.status || null,
      independentInstallState: installState.status || null,
      independentInstallEvidence: installEvidence.status || null,
      externalProofStatus: externalProof.status || null,
      compiledSwiftClaim: auditEvidence.safety?.compilesSwift === true,
      nativeRuntimeClaim: auditEvidence.safety?.startsNativeApplication === true,
      publicReleaseAllowed: externalProof.publicReleaseAllowed === true,
    },
    delivery: {
      featureBranch: FEATURE_BRANCH,
      priorValidatedCheckpointCommit: PRIOR_VALIDATED_CHECKPOINT,
      priorRemoteReferenceVerified: true,
      protectedDefaultBranchWritten: false,
      currentCheckpointRule: "The readiness record must be committed and delivered only through the current feature branch after final local validation; it does not predict its own future commit SHA.",
    },
    validation: [
      "npm run check:seis-public-plugin-wave-3-handoff-readiness",
      "npm run check:seis-public-plugin-continuity",
      "npm run check:seis-repo-marketplace",
      "plugin-creator structural validator for plugins/seis-core/seis-swift-concurrency-audit",
      "npm run seis:check",
      "git diff --check",
    ],
    risks: [
      {
        id: "RISK-W3-005",
        status: "tracked",
        description: "Handoff readiness could be mistaken for a completed Wave 3 or activated Wave 4.",
        mitigation: "Keep the record non-terminal, retain final steps 81-100, and set Wave 4 activationApproved false.",
      },
      {
        id: "RISK-W3-006",
        status: "tracked",
        description: "Local static evidence could be confused with independent installation or native execution proof.",
        mitigation: "Preserve fresh-task, independent-install, compiled-Swift, runtime, and release gaps as false or pending.",
      },
      {
        id: "RISK-W3-007",
        status: "tracked",
        description: "Cadence can pressure a premature new public package.",
        mitigation: "Require a later non-duplicative Wave 4 selection decision and current user authority before activation.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this readiness record and the focused Wave 3 tracking references on the feature branch; no external state, publication, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-3-handoff-readiness" && record.goalId === "SEIS-GOAL-021" && record.wave === 3 && record.step === 80 && record.status === "completed-repository-local-handoff-readiness", "readiness identity is invalid");
  assert(record.stateAtReadiness?.completedStepCountBeforeReadiness === 79 && record.stateAtReadiness?.activeStepBeforeReadiness === 80 && record.stateAtReadiness?.completedRoundCountBeforeReadiness === 3 && list(record.stateAtReadiness?.finalValidationRoundSteps).join(",") === range(81, 100).join(",") && record.stateAtReadiness?.finalWaveHandoffPublished === false, "readiness state snapshot is invalid");
  assert(record.currentProgram?.id === "seis-public-plugin-wave-3-program" && record.currentProgram?.status === "in-progress" && record.currentProgram?.selectedCapability === "seis-swift-concurrency-audit" && record.currentProgram?.implementationStarted === true && record.currentProgram?.additionalPublicCardAdded === true && record.currentProgram?.hasAtLeastReadinessPredecessor === true, "current Wave 3 program is invalid");
  assert(Object.values(record.completedEvidence).every(Boolean), "a required readiness evidence contract is not current");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.futureWaveDecision?.wave === 4 && record.futureWaveDecision?.status === "planned-gated" && record.futureWaveDecision?.activationApproved === false && record.futureWaveDecision?.selectedCapability === null && list(record.futureWaveDecision?.requiredBeforeActivation).length === 4, "Wave 4 gate is invalid");
  assert(record.externalGaps?.freshTaskReloadStatus === "incomplete-local-fresh-task-evidence" && record.externalGaps?.independentInstallState === "public-seis-repo-source-available-independent-install-pending" && record.externalGaps?.independentInstallEvidence === "public-seis-repo-independent-install-evidence-gate" && record.externalGaps?.compiledSwiftClaim === false && record.externalGaps?.nativeRuntimeClaim === false && record.externalGaps?.publicReleaseAllowed === false, "external validation boundary is invalid");
  assert(record.delivery?.featureBranch === FEATURE_BRANCH && record.delivery?.priorValidatedCheckpointCommit === PRIOR_VALIDATED_CHECKPOINT && record.delivery?.priorRemoteReferenceVerified === true && record.delivery?.protectedDefaultBranchWritten === false, "delivery boundary is invalid");
  assert(list(record.risks).length === 3 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "readiness inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "readiness record must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 3 handoff readiness: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 handoff readiness: required input is missing");
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
