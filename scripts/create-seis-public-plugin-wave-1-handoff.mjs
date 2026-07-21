#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-1-handoff.json";
const PATHS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
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
const EXPECTED_PUBLIC_CARD_COUNT = APP_PLUGIN_EXPANSION_TARGET + 306;
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
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-1-handoff",
    goalId: "SEIS-GOAL-021",
    generatedAt: "2026-07-21",
    status: "completed-repository-local-handoff",
    purpose: "Record a reproducible repository-local Wave 1 handoff and its current public-contract revalidation during later evidence-led work. This is not a public release, external installation, provider, deployment, or approval claim.",
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
    marketplace: {
      name: marketplace.name,
      displayName: marketplace.interface?.displayName || null,
      publicCardCount: cards.length,
      expectedCardCount: waveEvidence.marketplace?.expectedCardCount || null,
      applicationPluginCount: plugins.length,
      expectedApplicationPluginCount: waveEvidence.marketplace?.applicationPluginCount || null,
    },
    validation: {
      sourceAndCatalog: plugins.length === APP_PLUGIN_EXPANSION_TARGET && cards.length === EXPECTED_PUBLIC_CARD_COUNT,
      matrix: matrix.pluginCount === APP_PLUGIN_EXPANSION_TARGET && matrix.expectedPluginCount === APP_PLUGIN_EXPANSION_TARGET && matrix.failureCount === 0,
      waveEvidence: waveEvidence.status === "completed-repo-local-evidence-index" && attentionContractIds.length === 1,
      pluginEvidence: pluginEvidence.id === "seis-evidence-index" && pluginEvidence.status === "completed-public-evidence-index",
      lifecycle: lifecycle.id === "seis-public-plugin-lifecycle",
      provenance: number(securityReview.aggregate?.secretFindingCount) === 0 && number(securityReview.aggregate?.blockingFindingCount) === 0,
      freshTaskReload: freshTaskReload.id === "seis-public-plugin-fresh-task-reload-evidence",
      releaseReadiness: releaseReadiness.id === "seis-core-plugin-release-readiness"
        && typeof releaseReadiness.decision === "string"
        && ["large-code-promotion-evidence-ready", "continue-code-before-large-code-promotion"].includes(releaseReadiness.decision),
      mcpBoundary: list(mcpPermission.safety?.write).length === 0 && list(mcpPermission.safety?.network).length === 0 && list(mcpPermission.safety?.secrets).length === 0,
      wave2Completion: wave2Program.id === "seis-public-plugin-wave-2-program"
        && wave2Program.status === "completed"
        && Number.isInteger(wave2Program.progress?.completedStepCount)
        && wave2Program.progress.completedStepCount === 100
        && wave2CapabilityDecision.id === "seis-public-plugin-wave-2-capability-decision"
        && wave2CapabilityDecision.decision?.selectedCapability === "seis-apple-native-readiness"
        && wave2Handoff.id === "seis-public-plugin-wave-2-handoff"
        && wave2Handoff.status === "completed-repository-local-handoff",
      wave3Planning: wave3Program.id === "seis-public-plugin-wave-3-program"
        && wave3Program.status === "planned"
        && wave3Program.progress?.completedStepCount === 0
        && wave3Program.selection?.status === "discovery-required",
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
    plannedContinuation: {
      number: 3,
      status: wave3Program.status,
      programId: wave3Program.id,
      scopeRiskReviewPath: PATHS.wave2Handoff,
      selectionStatus: wave3Program.selection?.status || null,
      activationRule: "Wave 3 remains a discovery-first plan. It cannot select or add a public plugin before a separate non-duplicative capability decision and current validation evidence.",
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-1-handoff", "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021", "goal linkage is invalid");
  assert(record.status === "completed-repository-local-handoff", "handoff status is invalid");
  assert(record.program?.id === "seis-public-plugin-wave-1-program" && record.program?.status === "completed", "Wave 1 program status is invalid");
  assert(record.program?.completedStepCount === 100 && record.program?.completedRoundCount === 5 && list(record.program?.inProgressStepNumbers).length === 0, "Wave 1 completion evidence is invalid");
  assert(record.marketplace?.name === "seis-repo" && record.marketplace?.displayName === "SEIS Repo", "public marketplace identity is invalid");
  assert(record.marketplace?.publicCardCount === EXPECTED_PUBLIC_CARD_COUNT && record.marketplace?.expectedCardCount === EXPECTED_PUBLIC_CARD_COUNT, "public card count is invalid");
  assert(record.marketplace?.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.marketplace?.expectedApplicationPluginCount === APP_PLUGIN_EXPANSION_TARGET, "application plugin count is invalid");
  assert(Object.values(record.validation).every(Boolean), "a required Wave 1 validation contract is not current");
  assert(record.releaseReadiness?.promoted === false && ["large-code-promotion-evidence-ready", "continue-code-before-large-code-promotion"].includes(record.releaseReadiness?.decision), "handoff must not claim a release promotion");
  assert(record.publicBoundary?.publicAudience === "everyone" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false, "public marketplace boundary is invalid");
  assert(record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public safety boundary is invalid");
  assert(list(record.knownGaps).length === 1 && record.knownGaps[0]?.id === "ui-state-contract", "known attention record is invalid");
  assert(record.nextWave?.number === 2 && record.nextWave?.status === "completed" && record.nextWave?.programId === "seis-public-plugin-wave-2-program" && record.nextWave?.handoffPath === PATHS.wave2Handoff && Number.isInteger(record.nextWave?.completedStepCount) && record.nextWave.completedStepCount === 100 && record.nextWave?.scopeReviewComplete === true, "Wave 2 completion decision is invalid");
  assert(record.plannedContinuation?.number === 3 && record.plannedContinuation?.status === "planned" && record.plannedContinuation?.programId === "seis-public-plugin-wave-3-program" && record.plannedContinuation?.scopeRiskReviewPath === PATHS.wave2Handoff && record.plannedContinuation?.selectionStatus === "discovery-required", "Wave 3 planning decision is invalid");
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
