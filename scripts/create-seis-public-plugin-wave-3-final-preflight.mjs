#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-final-preflight.json";
const SELECTED_CAPABILITY = "seis-swift-concurrency-audit";
const EXPECTED_PUBLIC_CARD_COUNT = APP_PLUGIN_EXPANSION_TARGET + 306;
const PRIOR_FEATURE_CHECKPOINT = "a10e61b3b0ce1d52246c50548d0cf80d47563c0a";
const COMPLETED_STEPS = range(82, 91);
const PATHS = Object.freeze({
  wave3Program: "content/development/seis-public-plugin-wave-3-program.json",
  capabilityDecision: "content/development/seis-public-plugin-wave-3-capability-decision.json",
  finalValidation: "content/development/seis-public-plugin-wave-3-final-validation.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  marketplace: ".agents/plugins/marketplace.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  mcpPermission: "content/development/seis-mcp-permission-risk-matrix.json",
  pluginManifest: "plugins/seis-core/seis-swift-concurrency-audit/.codex-plugin/plugin.json",
  staticAudit: "content/development/seis-swift-concurrency-audit.json",
  agentIntegration: "content/development/seis-agent-plugin-integration.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
  freshTaskProof: "content/development/seis-public-plugin-fresh-task-proof.json",
  freshTaskReloadEvidence: "content/development/seis-public-plugin-fresh-task-reload-evidence.json",
  externalInstallProof: "content/development/seis-public-plugin-external-install-proof.json",
  publicInstallState: "content/development/seis-public-install-state.json",
  publicInstallEvidence: "content/development/seis-public-install-evidence.json",
  releaseReadiness: "apps/seis-core/data/seis-core-plugin-release-readiness.json",
  continuityCadence: "content/development/seis-public-plugin-continuity-cadence.json",
  continuityDocs: "docs/roadmap/SEIS_PUBLIC_PLUGIN_CONTINUITY_CADENCE.md",
  expansionDocs: "docs/roadmap/SEIS_PUBLIC_PLUGIN_EXPANSION_30_STEP_PROGRAM.md",
  capabilityDocs: "docs/development/SEIS_PUBLIC_PLUGIN_WAVE_3_DISCOVERY_DECISION.md",
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-3-final-preflight");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 final-preflight check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 3 steps 82–91.");
}

function buildRecord() {
  const wave3Program = readJson(PATHS.wave3Program);
  const capabilityDecision = readJson(PATHS.capabilityDecision);
  const finalValidation = readJson(PATHS.finalValidation);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const marketplace = readJson(PATHS.marketplace);
  const matrix = readJson(PATHS.matrix);
  const mcpPermission = readJson(PATHS.mcpPermission);
  const pluginManifest = readJson(PATHS.pluginManifest);
  const staticAudit = readJson(PATHS.staticAudit);
  const agentIntegration = readJson(PATHS.agentIntegration);
  const lifecycle = readJson(PATHS.lifecycle);
  const securityReview = readJson(PATHS.securityReview);
  const freshTaskProof = readJson(PATHS.freshTaskProof);
  const freshTaskReloadEvidence = readJson(PATHS.freshTaskReloadEvidence);
  const externalInstallProof = readJson(PATHS.externalInstallProof);
  const publicInstallState = readJson(PATHS.publicInstallState);
  const publicInstallEvidence = readJson(PATHS.publicInstallEvidence);
  const releaseReadiness = readJson(PATHS.releaseReadiness);
  const continuityCadence = readJson(PATHS.continuityCadence);
  const continuityDocs = readText(PATHS.continuityDocs);
  const expansionDocs = readText(PATHS.expansionDocs);
  const capabilityDocs = readText(PATHS.capabilityDocs);
  const plugins = list(sourceManifest.plugins);
  const cards = list(marketplace.plugins);
  const selectedSourceEntries = plugins.filter((entry) => entry?.name === SELECTED_CAPABILITY);
  const selectedCardEntries = cards.filter((entry) => entry?.name === SELECTED_CAPABILITY);
  const selectedMatrixEntries = list(matrix.plugins).filter((entry) => entry?.name === SELECTED_CAPABILITY);
  const selectedMcpEntries = list(mcpPermission.records).filter((entry) => entry?.name === SELECTED_CAPABILITY);
  const inputSafetyScan = scanPublicSafeInputs(Object.values(PATHS));

  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-3-final-preflight",
    goalId: "SEIS-GOAL-021",
    wave: 3,
    completedSteps: COMPLETED_STEPS,
    status: "completed-repository-local-final-preflight",
    generatedAt: "2026-07-21",
    purpose: "Reconcile current repository-local evidence for Wave 3 steps 82–91 without claiming final handoff, external installation, native execution, public release, or Wave 4 activation.",
    stateAtCheckpoint: {
      completedStepCountBeforeTrackerUpdate: 81,
      activeStepBeforeTrackerUpdate: 82,
      nextPlannedValidationStep: 92,
      finalWaveHandoffPublished: false,
      waveCompleted: false,
    },
    checks: {
      wave3Tracker: wave3Program.id === "seis-public-plugin-wave-3-program"
        && ["in-progress", "completed"].includes(wave3Program.status)
        && number(wave3Program.progress?.completedStepCount) >= 81
        && (wave3Program.status === "completed" || number(wave3Program.progress?.nextStepNumber) >= 82)
        && wave3Program.selection?.selectedCapability === SELECTED_CAPABILITY,
      priorFinalValidation: finalValidation.id === "seis-public-plugin-wave-3-final-validation"
        && finalValidation.status === "completed-repository-local-final-validation"
        && finalValidation.step === 81
        && finalValidation.futureWaveDecision?.activationApproved === false,
      capabilityDecision: capabilityDecision.id === "seis-public-plugin-wave-3-capability-decision"
        && capabilityDecision.status === "approved-public-local-implementation"
        && capabilityDecision.decision?.selectedCapability === SELECTED_CAPABILITY
        && capabilityDecision.decision?.implementationStarted === true
        && capabilityDecision.decision?.additionalPublicCardAdded === true,
      selectedPackageAndMatrix: pluginManifest.name === SELECTED_CAPABILITY
        && selectedSourceEntries.length === 1
        && selectedCardEntries.length === 1
        && selectedMatrixEntries.length === 1
        && selectedMcpEntries.length === 1
        && plugins.length === APP_PLUGIN_EXPANSION_TARGET
        && cards.length === EXPECTED_PUBLIC_CARD_COUNT
        && matrix.pluginCount === APP_PLUGIN_EXPANSION_TARGET
        && matrix.failureCount === 0
        && staticAudit.status === "attention-public-static-concurrency-evidence"
        && staticAudit.audit?.ok === true
        && number(staticAudit.audit?.blockingFindingCount) === 0,
      denyByDefaultMcp: list(selectedMcpEntries[0]?.permissions?.write).length === 0
        && list(selectedMcpEntries[0]?.permissions?.network).length === 0
        && list(selectedMcpEntries[0]?.permissions?.secrets).length === 0
        && selectedMcpEntries[0]?.remoteEndpointDeclared === false
        && selectedMcpEntries[0]?.environmentInjectionDeclared === false,
      agentIntegration: agentIntegration.id === "seis-agent-plugin-integration"
        && agentIntegration.status === "active"
        && agentIntegration.unifiedPluginSuite?.personalMarketplaceMutation === false
        && agentIntegration.unifiedPluginSuite?.applicationOwnedPluginCount === APP_PLUGIN_EXPANSION_TARGET
        && agentIntegration.unifiedPluginSuite?.applicationPluginMarketplaceEntryCount === APP_PLUGIN_EXPANSION_TARGET
        && agentIntegration.applicationIntegration?.pluginSourceCount === APP_PLUGIN_EXPANSION_TARGET
        && agentIntegration.applicationIntegration?.pluginMarketplaceEntryCount === APP_PLUGIN_EXPANSION_TARGET
        && agentIntegration.applicationIntegration?.pluginSourcePublicAudience === "everyone"
        && agentIntegration.applicationIntegration?.applicationPluginPublicReleaseAllowed !== true,
      lifecycleAndProvenance: lifecycle.id === "seis-public-plugin-lifecycle"
        && lifecycle.status === "active-local-proof-public-release-gated"
        && lifecycle.publicDistribution?.marketplaceName === "seis-repo"
        && lifecycle.publicDistribution?.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET
        && lifecycle.publicDistribution?.repoMarketplaceEntryCount === EXPECTED_PUBLIC_CARD_COUNT
        && lifecycle.releasePolicy?.currentChannel === "internal-review-local-proof"
        && securityReview.id === "seis-public-plugin-security-provenance-review"
        && securityReview.status === "repo-local-security-provenance-reviewed"
        && securityReview.publicReleaseAllowed === false
        && number(securityReview.aggregate?.secretFindingCount) === 0
        && number(securityReview.aggregate?.blockingFindingCount) === 0
        && securityReview.releaseBoundary?.externalNetworkAccessUsed === false
        && securityReview.releaseBoundary?.publicReleaseAllowed === false,
      freshTaskAndInstallBoundaries: freshTaskProof.id === "seis-public-plugin-fresh-task-proof"
        && freshTaskProof.status === "pending-fresh-task-reload-proof"
        && freshTaskProof.publicReleaseAllowed === false
        && freshTaskReloadEvidence.id === "seis-public-plugin-fresh-task-reload-evidence"
        && freshTaskReloadEvidence.status === "incomplete-local-fresh-task-evidence"
        && freshTaskReloadEvidence.publicReleaseAllowed === false
        && externalInstallProof.id === "seis-public-plugin-external-install-proof"
        && externalInstallProof.status === "repo-local-clean-artifact-staged-external-proof-pending"
        && externalInstallProof.publicReleaseAllowed === false
        && externalInstallProof.releaseBoundary?.externalNetworkAccessUsed === false
        && externalInstallProof.releaseBoundary?.publicMarketplacePublicationUsed === false
        && publicInstallState.id === "seis-public-install-state"
        && publicInstallState.status === "public-seis-repo-source-available-independent-install-pending"
        && publicInstallEvidence.id === "seis-public-install-evidence"
        && publicInstallEvidence.status === "public-seis-repo-independent-install-evidence-gate"
        && publicInstallEvidence.releaseBoundary?.publicReleaseAllowed === false
        && publicInstallEvidence.releaseBoundary?.humanApprovalRequired === true,
      releaseLimit: releaseReadiness.id === "seis-core-plugin-release-readiness"
        && releaseReadiness.decision === "large-code-promotion-evidence-ready"
        && releaseReadiness.policy?.bulkPromotionAllowed === false
        && wave3Program.publicBoundary?.publicReleaseAllowed === false,
      publicTerminologyPolicy: wave3Program.publicBoundary?.marketplaceName === "seis-repo"
        && wave3Program.publicBoundary?.marketplaceDisplayName === "SEIS Repo"
        && wave3Program.publicBoundary?.personalMarketplaceRead === false
        && wave3Program.publicBoundary?.personalMarketplaceMutation === false
        && continuityDocs.includes("SEIS Repo")
        && continuityDocs.includes("Personal marketplace read/mutation: prohibited")
        && expansionDocs.includes("Personal marketplace read/mutation: prohibited")
        && capabilityDocs.includes("SEIS Repo")
        && capabilityDocs.includes("No release")
        && capabilityDocs.includes("external installation authority"),
      continuityGate: continuityCadence.id === "seis-public-plugin-continuity-cadence"
        && ["in-progress", "completed"].includes(continuityCadence.waves?.[2]?.status)
        && number(continuityCadence.waves?.[2]?.completedSteps) >= 81
        && continuityCadence.waves?.[3]?.status === "planned-gated"
        && continuityCadence.waves?.[4]?.status === "planned-gated",
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
      compiledSwift: finalValidation.externalClaims?.compiledSwift === true,
      nativeRuntime: finalValidation.externalClaims?.nativeRuntime === true,
      independentInstallation: false,
      liveProvider: false,
      deployment: false,
      publicRelease: false,
    },
    futureWaveDecision: {
      wave: 4,
      status: continuityCadence.waves?.[3]?.status || null,
      activationApproved: false,
      selectedCapability: null,
      reason: "Steps 82–91 reconcile repository-local package, integration, lifecycle, safety, terminology, and release-boundary evidence only. A Wave 3 handoff and a fresh Wave 4 scope and risk decision remain required.",
    },
    delivery: {
      featureBranch: "plugins/seis-plugin-root-20260715",
      priorFeatureCheckpointCommit: PRIOR_FEATURE_CHECKPOINT,
      priorFeatureCheckpointRemoteVerified: true,
      protectedDefaultBranchWritten: false,
      checkpointRule: "This preflight records repository-local state only. Its own commit and push must be validated separately on the current feature branch; it does not predict a future commit SHA or assert a public release.",
    },
    validationScope: {
      focusedPackage: [
        "npm run check:seis-public-plugin-wave-3-final-validation",
        "npm run check:seis-core-plugin-sources",
        "npm run check:seis-core-plugin-catalog",
        "npm run check:seis-core-plugin-matrix",
      ],
      integrationAndLifecycle: [
        "npm run check:seis-agent-plugin-integration",
        "npm run check:seis-core-requested-plugin-coverage",
        "npm run check:seis-public-plugin-lifecycle",
        "npm run check:seis-public-plugin-security-provenance-review",
        "npm run check:seis-public-plugin-fresh-task-proof",
        "npm run check:seis-public-plugin-fresh-task-reload-evidence",
        "npm run check:seis-public-plugin-external-install-proof",
        "npm run check:seis-public-install-state",
        "npm run check:seis-public-install-evidence",
        "npm run check:seis-core-plugin-release-readiness",
      ],
      baselineAndBoundary: [
        "npm run check:seis-repo-marketplace",
        "npm run seis:check",
        "git diff --check",
      ],
    },
    risks: [
      {
        id: "RISK-W3-010",
        status: "tracked",
        description: "A broad local validation preflight can be mistaken for final delivery, a public release, or independent installation proof.",
        mitigation: "Keep finalWaveHandoffPublished false, record external claims as false, and require later feature-branch delivery plus release approval evidence.",
      },
      {
        id: "RISK-W3-011",
        status: "tracked",
        description: "Repeated generated evidence can drift from source, marketplace, lifecycle, or terminology records.",
        mitigation: "Assert current package, source, card, matrix, integration, lifecycle, safety, and documentation boundaries from fixed public-safe inputs.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert this focused preflight record and its Wave 3 tracking references on the feature branch; no external state, publication, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-3-final-preflight" && record.goalId === "SEIS-GOAL-021" && record.wave === 3 && record.status === "completed-repository-local-final-preflight", "preflight identity is invalid");
  assert(list(record.completedSteps).join(",") === COMPLETED_STEPS.join(","), "completed preflight steps are invalid");
  assert(record.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 81 && record.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 82 && record.stateAtCheckpoint?.nextPlannedValidationStep === 92 && record.stateAtCheckpoint?.finalWaveHandoffPublished === false && record.stateAtCheckpoint?.waveCompleted === false, "preflight state snapshot is invalid");
  assert(Object.values(record.checks).every(Boolean), "a required Wave 3 preflight contract is not current");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.externalClaims?.compiledSwift === false && record.externalClaims?.nativeRuntime === false && record.externalClaims?.independentInstallation === false && record.externalClaims?.liveProvider === false && record.externalClaims?.deployment === false && record.externalClaims?.publicRelease === false, "external claim boundary is invalid");
  assert(record.futureWaveDecision?.wave === 4 && record.futureWaveDecision?.status === "planned-gated" && record.futureWaveDecision?.activationApproved === false && record.futureWaveDecision?.selectedCapability === null, "Wave 4 gate is invalid");
  assert(record.delivery?.featureBranch === "plugins/seis-plugin-root-20260715" && record.delivery?.priorFeatureCheckpointCommit === PRIOR_FEATURE_CHECKPOINT && record.delivery?.priorFeatureCheckpointRemoteVerified === true && record.delivery?.protectedDefaultBranchWritten === false, "delivery boundary is invalid");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "preflight inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "preflight record must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 3 final preflight: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 final preflight: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
