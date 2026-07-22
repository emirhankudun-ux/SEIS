#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";
import {
  buildWave1MarketplaceCompatibility,
  resolveCurrentApplicationCapability,
} from "./lib/seis-wave-1-marketplace-compatibility.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-1-handoff.json";
const PATHS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
  publicFamily: "content/development/seis-public-plugin-family.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  releaseReadiness: "apps/seis-core/data/seis-core-plugin-release-readiness.json",
  waveProgram: "content/development/seis-public-plugin-wave-1-program.json",
  waveEvidence: "content/development/seis-public-plugin-wave-1-evidence-index.json",
  pluginEvidence: "content/development/seis-evidence-index.json",
  capabilityDecision: "content/development/seis-public-plugin-wave-1-capability-decision.json",
  wave2Program: "content/development/seis-public-plugin-wave-2-program.json",
  wave2CapabilityDecision: "content/development/seis-public-plugin-wave-2-capability-decision.json",
  wave2Handoff: "content/development/seis-public-plugin-wave-2-handoff.json",
  wave3Program: "content/development/seis-public-plugin-wave-3-program.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
  freshTaskReload: "content/development/seis-public-plugin-fresh-task-reload-evidence.json",
  mcpPermission: "content/development/seis-mcp-permission-risk-matrix.json",
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
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-1-handoff");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 1 handoff check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for the completed public Wave 1 handoff.");
}

function buildRecord() {
  const marketplace = readJson(PATHS.marketplace);
  const publicFamily = readJson(PATHS.publicFamily);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const matrix = readJson(PATHS.matrix);
  const releaseReadiness = readJson(PATHS.releaseReadiness);
  const waveProgram = readJson(PATHS.waveProgram);
  const waveEvidence = readJson(PATHS.waveEvidence);
  const pluginEvidence = readJson(PATHS.pluginEvidence);
  const capabilityDecision = readJson(PATHS.capabilityDecision);
  const wave2Program = readJson(PATHS.wave2Program);
  const wave2CapabilityDecision = readJson(PATHS.wave2CapabilityDecision);
  const wave2Handoff = readJson(PATHS.wave2Handoff);
  const wave3Program = readJson(PATHS.wave3Program);
  const lifecycle = readJson(PATHS.lifecycle);
  const securityReview = readJson(PATHS.securityReview);
  const freshTaskReload = readJson(PATHS.freshTaskReload);
  const mcpPermission = readJson(PATHS.mcpPermission);
  const cards = list(marketplace.plugins);
  const plugins = list(sourceManifest.plugins);
  const attentionContractIds = list(waveEvidence.contracts)
    .filter((contract) => contract?.state === "attention")
    .map((contract) => contract.id)
    .filter(Boolean)
    .sort();
  const inputSafetyScan = scanPublicSafeInputs(Object.values(PATHS));
  const compatibility = buildWave1MarketplaceCompatibility({
    marketplace,
    publicFamily,
    sourceManifest,
    bundleCatalog,
  });
  const currentProjection = compatibility.currentMarketplaceProjection;
  const currentWave3Capability = resolveCurrentApplicationCapability({
    marketplace,
    sourceManifest,
    bundleCatalog,
    capabilityId: "seis-swift-concurrency-audit",
  });
  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-1-handoff",
    goalId: "SEIS-GOAL-021",
    generatedAt: "2026-07-21",
    status: "completed-repository-local-handoff",
    purpose: "Record a reproducible repository-local Wave 1 handoff and its current public-contract revalidation during later evidence-led work. This is not a public release, external installation, provider, deployment, or approval claim.",
    historicalWave1Snapshot: compatibility.historicalWave1Snapshot,
    currentMarketplaceProjection: currentProjection,
    program: {
      id: waveProgram.id,
      status: waveProgram.status,
      completedStepCount: list(waveProgram.steps).filter((step) => step?.status === "completed").length,
      inProgressStepNumbers: list(waveProgram.steps)
        .filter((step) => step?.status === "in-progress" && Number.isInteger(step.number))
        .map((step) => step.number)
        .sort((left, right) => left - right),
      completedRoundCount: list(waveProgram.rounds).filter((round) => round?.status === "completed").length,
    },
    validation: {
      sourceAndCatalog: plugins.length === APP_PLUGIN_EXPANSION_TARGET
        && cards.length === currentProjection.publicCardCount
        && currentProjection.sourceCapabilityInventory.applicationSourcePackageCount === APP_PLUGIN_EXPANSION_TARGET,
      selectedCapabilityBundleResolution: currentProjection.selectedApplicationCapability.id === "seis-evidence-index"
        && currentProjection.selectedApplicationCapability.retainedSource === true
        && currentProjection.selectedApplicationCapability.directMarketplaceCardRequired === false
        && currentProjection.selectedApplicationCapability.directMarketplaceCardCount === 0
        && currentProjection.selectedApplicationCapability.bundleCardCount === 1,
      matrix: matrix.pluginCount === APP_PLUGIN_EXPANSION_TARGET && matrix.expectedPluginCount === APP_PLUGIN_EXPANSION_TARGET && matrix.failureCount === 0,
      waveEvidence: waveEvidence.status === "completed-repo-local-evidence-index"
        && waveEvidence.historicalWave1Snapshot?.publicCardCount === 377
        && waveEvidence.currentMarketplaceProjection?.publicCardCount === currentProjection.publicCardCount
        && waveEvidence.currentMarketplaceProjection?.selectedApplicationCapability?.bundleId === currentProjection.selectedApplicationCapability.bundleId
        && attentionContractIds.length === 1,
      pluginEvidence: pluginEvidence.id === "seis-evidence-index" && pluginEvidence.status === "completed-public-evidence-index",
      lifecycle: lifecycle.id === "seis-public-plugin-lifecycle",
      provenance: number(securityReview.aggregate?.secretFindingCount) === 0 && number(securityReview.aggregate?.blockingFindingCount) === 0,
      freshTaskReload: freshTaskReload.id === "seis-public-plugin-fresh-task-reload-evidence",
      releaseReadiness: releaseReadiness.id === "seis-core-plugin-release-readiness"
        && typeof releaseReadiness.decision === "string"
        && ["large-code-promotion-evidence-ready", "continue-code-before-large-code-promotion"].includes(releaseReadiness.decision),
      mcpBoundary: list(mcpPermission.safety?.write).length === 0 && list(mcpPermission.safety?.network).length === 0 && list(mcpPermission.safety?.secrets).length === 0,
      capabilityDecisionCompatibility: capabilityDecision.historicalWave1Snapshot?.publicCardCount === 377
        && capabilityDecision.currentMarketplaceProjection?.selectedApplicationCapability?.bundleId === currentProjection.selectedApplicationCapability.bundleId
        && capabilityDecision.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1,
      wave2Completion: wave2Program.id === "seis-public-plugin-wave-2-program"
        && wave2Program.status === "completed"
        && Number.isInteger(wave2Program.progress?.completedStepCount)
        && wave2Program.progress.completedStepCount === 100
        && wave2CapabilityDecision.id === "seis-public-plugin-wave-2-capability-decision"
        && wave2CapabilityDecision.decision?.selectedCapability === "seis-apple-native-readiness"
        && wave2Handoff.id === "seis-public-plugin-wave-2-handoff"
        && wave2Handoff.status === "completed-repository-local-handoff",
      wave3HistoricalExecution: wave3Program.id === "seis-public-plugin-wave-3-program"
        && wave3Program.status === "completed"
        && Number.isInteger(wave3Program.progress?.completedStepCount)
        && wave3Program.progress.completedStepCount === 100
        && wave3Program.selection?.status === "implementation-approved"
        && wave3Program.selection?.selectedCapability === "seis-swift-concurrency-audit"
        && wave3Program.selection?.implementationStarted === true
        && wave3Program.selection?.additionalPublicCardAdded === true,
      wave3CurrentCompatibility: currentWave3Capability.id === "seis-swift-concurrency-audit"
        && currentWave3Capability.retainedSource === true
        && currentWave3Capability.directMarketplaceCardRequired === false
        && currentWave3Capability.directMarketplaceCardCount === 0
        && currentWave3Capability.bundleCardCount === 1
        && currentWave3Capability.bundleId === "seis-application-bundle-06",
    },
    publicBoundary: {
      marketplaceName: capabilityDecision.publicBoundary?.marketplaceName,
      marketplaceDisplayName: capabilityDecision.publicBoundary?.marketplaceDisplayName,
      publicAudience: capabilityDecision.publicBoundary?.publicAudience,
      personalMarketplaceRead: capabilityDecision.publicBoundary?.personalMarketplaceRead,
      personalMarketplaceMutation: capabilityDecision.publicBoundary?.personalMarketplaceMutation,
      network: capabilityDecision.publicBoundary?.network,
      externalWrites: capabilityDecision.publicBoundary?.externalWrites,
      secrets: capabilityDecision.publicBoundary?.secrets,
      publicReleaseAllowed: capabilityDecision.publicBoundary?.publicReleaseAllowed,
    },
    historicalWave3Planning: {
      statusAtWave1Handoff: "planned",
      selectionStatusAtWave1Handoff: "discovery-required",
      selectedCapabilityAtWave1Handoff: null,
      implementationStartedAtWave1Handoff: false,
      additionalPublicCardAddedAtWave1Handoff: false,
      note: "This preserves the Wave 3 state recorded when the completed Wave 1 handoff was first prepared; the current completed bundle projection is tracked separately below.",
    },
    historicalWave3Execution: {
      projectionModel: "direct-source-cards",
      statusAtCompletion: wave3Program.status,
      completedStepCount: wave3Program.progress?.completedStepCount || 0,
      selectionStatus: wave3Program.selection?.status || null,
      selectedCapability: wave3Program.selection?.selectedCapability || null,
      implementationStarted: wave3Program.selection?.implementationStarted === true,
      additionalPublicCardAdded: wave3Program.selection?.additionalPublicCardAdded === true,
      note: "These fields preserve Wave 3's completed pre-consolidation execution, when the selected source was added as a direct marketplace card.",
    },
    knownGaps: attentionContractIds.map((id) => ({
      id,
      state: "attention",
      decision: "Keep the recorded source-only attention state explicit; do not convert it into a live provider, browser, installation, or release claim.",
    })),
    skippedChecks: [
      "Independent external installation remains approval-gated and is not represented as repository-local release proof.",
      "No live provider, GitHub, browser, deployment, or public publication check was run or claimed by this handoff record.",
      "This handoff-only change is below the large-code promotion threshold; no release promotion was initiated.",
    ],
    releaseReadiness: {
      currentLabel: releaseReadiness.currentRelease?.label || null,
      currentSemver: releaseReadiness.currentRelease?.semver || null,
      codeLinesChanged: number(releaseReadiness.workingTree?.codeLinesChanged),
      decision: releaseReadiness.decision || null,
      promoted: false,
    },
    risks: [
      {
        id: "RISK-W1-001",
        status: "tracked",
        description: "The public repository can remain internally consistent while an independent installation or release is still unproven.",
        mitigation: "Keep public release blocked and require explicit human approval plus independent evidence.",
      },
      {
        id: "RISK-W1-002",
        status: "tracked",
        description: "The desktop UI-state source gap remains an attention finding outside the completed Command Center evidence scope.",
        mitigation: "Carry it as explicit follow-up work instead of silently treating it as ready.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 1 evidence-index and handoff commits on the feature branch; do not mutate the protected default branch.",
      dataMigrationRequired: false,
    },
    nextWave: {
      number: 2,
      status: wave2Program.status,
      scopeReviewComplete: true,
      programId: wave2Program.id,
      capabilityDecisionPath: PATHS.wave2CapabilityDecision,
      handoffPath: PATHS.wave2Handoff,
      completedStepCount: wave2Program.progress?.completedStepCount || 0,
      completionRule: "Wave 2 completed only after its separately reviewed, bounded public Apple/Swift static-readiness scope retained empty write, network, and secret permissions and recorded no native-runtime or public-release claim.",
    },
    currentWave3Projection: {
      number: 3,
      status: wave3Program.status,
      completedStepCount: wave3Program.progress?.completedStepCount || 0,
      programId: wave3Program.id,
      scopeRiskReviewPath: PATHS.wave2Handoff,
      selectionStatus: wave3Program.selection?.status || null,
      selectedCapability: wave3Program.selection?.selectedCapability || null,
      implementationStarted: wave3Program.selection?.implementationStarted === true,
      marketplacePresentation: "retained-source-through-bundle-card",
      sourcePath: currentWave3Capability.sourcePath,
      directMarketplaceCardRequired: currentWave3Capability.directMarketplaceCardRequired,
      directMarketplaceCardCount: currentWave3Capability.directMarketplaceCardCount,
      bundleCardCount: currentWave3Capability.bundleCardCount,
      bundleId: currentWave3Capability.bundleId,
      bundleSourcePath: currentWave3Capability.bundleSourcePath,
      bundleFamily: currentWave3Capability.bundleFamily,
      historicalStatusAtWave1Handoff: "planned",
      historicalSelectionStatusAtWave1Handoff: "discovery-required",
      completionRule: "Wave 3 completed its repository-local program after a separate non-duplicative capability decision; current discovery retains the selected source through one curated application bundle without implying external release, installation, provider, deployment, or native-runtime proof.",
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-1-handoff", "record id is invalid");
  assert(record.schemaVersion === 2, "schema version is invalid");
  assert(record.goalId === "SEIS-GOAL-021", "goal linkage is invalid");
  assert(record.status === "completed-repository-local-handoff", "handoff status is invalid");
  assert(record.program?.id === "seis-public-plugin-wave-1-program" && record.program?.status === "completed", "Wave 1 program status is invalid");
  assert(record.program?.completedStepCount === 100 && record.program?.completedRoundCount === 5 && list(record.program?.inProgressStepNumbers).length === 0, "Wave 1 completion evidence is invalid");
  assert(record.historicalWave1Snapshot?.projectionModel === "direct-source-cards" && record.historicalWave1Snapshot?.publicCardCount === 377 && record.historicalWave1Snapshot?.applicationPluginCount === 71 && record.historicalWave1Snapshot?.selectedCapabilityDirectCardCount === 1, "historical Wave 1 marketplace snapshot is invalid");
  assert(record.currentMarketplaceProjection?.marketplaceName === "seis-repo" && record.currentMarketplaceProjection?.marketplaceDisplayName === "SEIS Repo", "current public marketplace identity is invalid");
  assert(record.currentMarketplaceProjection?.publicCardCount === 34 && record.currentMarketplaceProjection?.bundleCardCount === 33 && record.currentMarketplaceProjection?.sourceCapabilityInventory?.applicationSourcePackageCount === APP_PLUGIN_EXPANSION_TARGET, "current curated marketplace projection is invalid");
  assert(record.currentMarketplaceProjection?.selectedApplicationCapability?.id === "seis-evidence-index" && record.currentMarketplaceProjection?.selectedApplicationCapability?.retainedSource === true && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardRequired === false && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1, "current selected-capability bundle resolution is invalid");
  assert(Object.values(record.validation).every(Boolean), "a required Wave 1 validation contract is not current");
  assert(record.releaseReadiness?.promoted === false && ["large-code-promotion-evidence-ready", "continue-code-before-large-code-promotion"].includes(record.releaseReadiness?.decision), "handoff must not claim a release promotion");
  assert(record.publicBoundary?.publicAudience === "everyone" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false, "public marketplace boundary is invalid");
  assert(record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public safety boundary is invalid");
  assert(list(record.knownGaps).length === 1 && record.knownGaps[0]?.id === "ui-state-contract", "known attention record is invalid");
  assert(record.nextWave?.number === 2 && record.nextWave?.status === "completed" && record.nextWave?.programId === "seis-public-plugin-wave-2-program" && record.nextWave?.handoffPath === PATHS.wave2Handoff && Number.isInteger(record.nextWave?.completedStepCount) && record.nextWave.completedStepCount === 100 && record.nextWave?.scopeReviewComplete === true, "Wave 2 completion decision is invalid");
  assert(record.historicalWave3Planning?.statusAtWave1Handoff === "planned" && record.historicalWave3Planning?.selectionStatusAtWave1Handoff === "discovery-required" && record.historicalWave3Planning?.selectedCapabilityAtWave1Handoff === null && record.historicalWave3Planning?.implementationStartedAtWave1Handoff === false && record.historicalWave3Planning?.additionalPublicCardAddedAtWave1Handoff === false, "Wave 3 historical planning snapshot is invalid");
  assert(record.historicalWave3Execution?.projectionModel === "direct-source-cards" && record.historicalWave3Execution?.statusAtCompletion === "completed" && record.historicalWave3Execution?.completedStepCount === 100 && record.historicalWave3Execution?.selectionStatus === "implementation-approved" && record.historicalWave3Execution?.selectedCapability === "seis-swift-concurrency-audit" && record.historicalWave3Execution?.implementationStarted === true && record.historicalWave3Execution?.additionalPublicCardAdded === true, "Wave 3 historical execution snapshot is invalid");
  assert(record.currentWave3Projection?.number === 3 && record.currentWave3Projection?.status === "completed" && record.currentWave3Projection?.completedStepCount === 100 && record.currentWave3Projection?.programId === "seis-public-plugin-wave-3-program" && record.currentWave3Projection?.scopeRiskReviewPath === PATHS.wave2Handoff && record.currentWave3Projection?.selectionStatus === "implementation-approved" && record.currentWave3Projection?.selectedCapability === "seis-swift-concurrency-audit" && record.currentWave3Projection?.implementationStarted === true && record.currentWave3Projection?.marketplacePresentation === "retained-source-through-bundle-card" && record.currentWave3Projection?.directMarketplaceCardRequired === false && record.currentWave3Projection?.directMarketplaceCardCount === 0 && record.currentWave3Projection?.bundleCardCount === 1 && record.currentWave3Projection?.bundleId === "seis-application-bundle-06" && record.currentWave3Projection?.bundleFamily === "application" && record.currentWave3Projection?.historicalStatusAtWave1Handoff === "planned" && record.currentWave3Projection?.historicalSelectionStatusAtWave1Handoff === "discovery-required", "current Wave 3 bundle projection is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0, "handoff inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "handoff record must not contain machine-specific paths");
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

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 1 handoff: required input is missing");
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function number(value) {
  return Number.isFinite(value) ? value : 0;
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 1 handoff: " + message);
}
