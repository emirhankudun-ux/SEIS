#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-2-handoff.json";
const PATHS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  releaseReadiness: "apps/seis-core/data/seis-core-plugin-release-readiness.json",
  wave1Handoff: "content/development/seis-public-plugin-wave-1-handoff.json",
  wave2Program: "content/development/seis-public-plugin-wave-2-program.json",
  capabilityDecision: "content/development/seis-public-plugin-wave-2-capability-decision.json",
  appleReadiness: "content/development/seis-apple-native-readiness.json",
  distributionReview: "content/development/seis-public-plugin-wave-2-distribution-review.json",
  followUpDecision: "content/development/seis-public-plugin-wave-2-follow-up-decision.json",
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
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-2-handoff`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 2 handoff check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for the completed public Wave 2 handoff.");
}

function buildRecord() {
  const marketplace = readJson(PATHS.marketplace);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const matrix = readJson(PATHS.matrix);
  const releaseReadiness = readJson(PATHS.releaseReadiness);
  const wave1Handoff = readJson(PATHS.wave1Handoff);
  const wave2Program = readJson(PATHS.wave2Program);
  const capabilityDecision = readJson(PATHS.capabilityDecision);
  const appleReadiness = readJson(PATHS.appleReadiness);
  const distributionReview = readJson(PATHS.distributionReview);
  const followUpDecision = readJson(PATHS.followUpDecision);
  const wave3Program = readJson(PATHS.wave3Program);
  const lifecycle = readJson(PATHS.lifecycle);
  const securityReview = readJson(PATHS.securityReview);
  const freshTaskReload = readJson(PATHS.freshTaskReload);
  const mcpPermission = readJson(PATHS.mcpPermission);
  const cards = list(marketplace.plugins);
  const plugins = list(sourceManifest.plugins);
  const inputSafetyScan = scanPublicSafeInputs(Object.values(PATHS));
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-2-handoff",
    goalId: "SEIS-GOAL-021",
    generatedAt: "2026-07-21",
    status: "completed-repository-local-handoff",
    purpose: "Record a reproducible repository-local Wave 2 completion, its public SEIS Repo boundary, its known native and external validation limits, and its current Wave 3 continuation reference. This is not a public release, independent installation, provider, deployment, or approval claim.",
    program: {
      id: wave2Program.id,
      status: wave2Program.status,
      completedStepCount: list(wave2Program.steps).filter((step) => step?.status === "completed").length,
      inProgressStepNumbers: list(wave2Program.steps)
        .filter((step) => step?.status === "in-progress" && Number.isInteger(step.number))
        .map((step) => step.number)
        .sort((left, right) => left - right),
      completedRoundCount: list(wave2Program.rounds).filter((round) => round?.status === "completed").length,
      selectedCapability: wave2Program.capability?.selectedCapability || null,
    },
    marketplace: {
      name: marketplace.name,
      displayName: marketplace.interface?.displayName || null,
      publicCardCount: cards.length,
      expectedCardCount: EXPECTED_PUBLIC_CARD_COUNT,
      applicationPluginCount: plugins.length,
      expectedApplicationPluginCount: APP_PLUGIN_EXPANSION_TARGET,
    },
    validation: {
      wave1Continuity: wave1Handoff.id === "seis-public-plugin-wave-1-handoff" && wave1Handoff.status === "completed-repository-local-handoff",
      sourceAndCatalog: plugins.length === APP_PLUGIN_EXPANSION_TARGET && cards.length === EXPECTED_PUBLIC_CARD_COUNT,
      matrix: matrix.pluginCount === APP_PLUGIN_EXPANSION_TARGET && matrix.expectedPluginCount === APP_PLUGIN_EXPANSION_TARGET && matrix.failureCount === 0,
      appleReadiness: appleReadiness.id === "seis-apple-native-readiness" && appleReadiness.status === "completed-public-static-readiness-evidence" && appleReadiness.resilienceReview?.status === "completed-repository-local-resilience-review",
      capabilityDecision: capabilityDecision.id === "seis-public-plugin-wave-2-capability-decision" && capabilityDecision.status === "approved-public-local-implementation" && capabilityDecision.decision?.selectedCapability === "seis-apple-native-readiness",
      distributionReview: distributionReview.id === "seis-public-plugin-wave-2-distribution-review" && distributionReview.status === "completed-repository-local-distribution-maintenance-review",
      followUpDecision: followUpDecision.id === "seis-public-plugin-wave-2-follow-up-decision" && followUpDecision.status === "completed-no-additional-public-plugin-selected" && followUpDecision.decision?.selectedCapability === null && followUpDecision.publicDistribution?.additionalCardAdded === false,
      lifecycle: lifecycle.id === "seis-public-plugin-lifecycle",
      provenance: number(securityReview.aggregate?.secretFindingCount) === 0 && number(securityReview.aggregate?.blockingFindingCount) === 0,
      freshTaskReload: freshTaskReload.id === "seis-public-plugin-fresh-task-reload-evidence",
      releaseReadiness: releaseReadiness.id === "seis-core-plugin-release-readiness"
        && typeof releaseReadiness.decision === "string"
        && ["large-code-promotion-evidence-ready", "continue-code-before-large-code-promotion"].includes(releaseReadiness.decision),
      mcpBoundary: list(mcpPermission.safety?.write).length === 0 && list(mcpPermission.safety?.network).length === 0 && list(mcpPermission.safety?.secrets).length === 0,
      wave3Continuation: wave3Program.id === "seis-public-plugin-wave-3-program"
        && ["in-progress", "completed"].includes(wave3Program.status)
        && Number.isInteger(wave3Program.progress?.completedStepCount)
        && wave3Program.progress.completedStepCount >= 46
        && wave3Program.selection?.status === "implementation-approved"
        && wave3Program.selection?.selectedCapability === "seis-swift-concurrency-audit"
        && wave3Program.selection?.implementationStarted === true
        && wave3Program.selection?.additionalPublicCardAdded === true,
    },
    publicBoundary: {
      marketplaceName: wave2Program.publicBoundary?.marketplaceName,
      marketplaceDisplayName: wave2Program.publicBoundary?.marketplaceDisplayName,
      publicAudience: wave2Program.publicBoundary?.publicAudience,
      personalMarketplaceRead: wave2Program.publicBoundary?.personalMarketplaceRead,
      personalMarketplaceMutation: wave2Program.publicBoundary?.personalMarketplaceMutation,
      network: wave2Program.publicBoundary?.network,
      externalWrites: wave2Program.publicBoundary?.externalWrites,
      secrets: wave2Program.publicBoundary?.secrets,
      publicReleaseAllowed: wave2Program.publicBoundary?.publicReleaseAllowed,
    },
    historicalWave3Planning: {
      statusAtWave2Handoff: "planned",
      selectionStatusAtWave2Handoff: "discovery-required",
      selectedCapabilityAtWave2Handoff: null,
      implementationStartedAtWave2Handoff: false,
      additionalPublicCardAddedAtWave2Handoff: false,
      note: "This preserves the Wave 3 state recorded when the completed Wave 2 handoff was first prepared; the current continuation is tracked separately below.",
    },
    nativeValidationBoundary: {
      packageGraphStatus: followUpDecision.swiftPmEvidence?.packageGraph?.manifestInspection || null,
      swiftToolchain: followUpDecision.swiftPmEvidence?.localToolingObservation?.swiftToolchain || null,
      swiftTestState: followUpDecision.swiftPmEvidence?.localToolingObservation?.swiftTestState || null,
      swiftTestCompletionClaim: followUpDecision.swiftPmEvidence?.localToolingObservation?.swiftTestCompletionClaim || null,
      compiledSwiftClaim: followUpDecision.swiftPmEvidence?.validationBoundary?.compiledSwiftClaim ?? null,
      testPassClaim: followUpDecision.swiftPmEvidence?.validationBoundary?.testPassClaim ?? null,
      nativeApplicationRunClaim: followUpDecision.swiftPmEvidence?.validationBoundary?.nativeApplicationRunClaim ?? null,
      deploymentOrAppStoreClaim: followUpDecision.swiftPmEvidence?.validationBoundary?.deploymentOrAppStoreClaim ?? null,
    },
    delivery: {
      featureBranch: "plugins/seis-plugin-root-20260715",
      priorValidatedCheckpointCommit: "c62d059898190f943802a11eb66ad35659e31d50",
      priorRemoteReferenceVerified: true,
      protectedDefaultBranchWritten: false,
      finalCheckpointRule: "The handoff record must be delivered only through the current feature branch after final local validation; it intentionally does not predict its own future commit SHA.",
    },
    knownGaps: [
      {
        id: "swiftpm-test-completion",
        state: "approval-required",
        decision: "The local SwiftPM test attempt was interrupted after a no-output observation window. No compiled-Swift or test-pass claim is made; a controlled longer local or CI run is required before that evidence can exist.",
      },
      {
        id: "independent-public-installation",
        state: "approval-required",
        decision: "Repository-local marketplace evidence is not independent external installation or publication proof. Keep public release blocked pending explicit approval and independent evidence.",
      },
    ],
    skippedChecks: [
      "No completed SwiftPM test result is claimed; the prior local attempt remains recorded as interrupted and non-claimable.",
      "No live provider, browser, GitHub API, external installation, deployment, signing, App Store, or public publication check was run or claimed by this handoff record.",
      "No release promotion was initiated; current repository-local release-readiness evidence remains a gate rather than a release action.",
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
        id: "RISK-W2-001",
        status: "tracked",
        description: "Static Apple/Swift readiness evidence can be misread as proof that native build, signing, or release gates passed.",
        mitigation: "Keep native execution and release claims false until a separately controlled validation produces current evidence.",
      },
      {
        id: "RISK-W2-002",
        status: "tracked",
        description: "Public marketplace metadata can drift as app-owned package counts change.",
        mitigation: "Require source, catalog, matrix, marketplace, integration, lifecycle, provenance, and manifest reconciliation for every future changed public card.",
      },
      {
        id: "RISK-W2-003",
        status: "tracked",
        description: "The next wave could add a duplicate card merely to satisfy cadence.",
        mitigation: "Wave 3 became active only after a separate non-duplicative decision selected the bounded concurrency audit; future public cards still require a separate scope, overlap, and validation gate.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 2 package, program, decisions, evidence, and handoff references on the feature branch; do not mutate the protected default branch.",
      dataMigrationRequired: false,
    },
    nextWave: {
      number: 3,
      status: "in-progress",
      programId: wave3Program.id,
      selectionStatus: wave3Program.selection?.status || null,
      selectedCapability: wave3Program.selection?.selectedCapability || null,
      implementationStarted: wave3Program.selection?.implementationStarted === true,
      additionalPublicCardAdded: wave3Program.selection?.additionalPublicCardAdded === true,
      historicalStatusAtWave2Handoff: "planned",
      historicalSelectionStatusAtWave2Handoff: "discovery-required",
      scopeRiskReviewPath: OUTPUT_PATH,
      activationRule: "Wave 3 entered an in-progress implementation scope only after a separate non-duplicative capability decision, current repository-local validation evidence, and continued user authority; this does not authorize external release or protected-branch writes.",
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-2-handoff", "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021" && record.status === "completed-repository-local-handoff", "goal linkage or status is invalid");
  assert(record.program?.id === "seis-public-plugin-wave-2-program" && record.program?.status === "completed" && record.program?.completedStepCount === 100 && record.program?.completedRoundCount === 5 && list(record.program?.inProgressStepNumbers).length === 0 && record.program?.selectedCapability === "seis-apple-native-readiness", "Wave 2 completion evidence is invalid");
  assert(record.marketplace?.name === "seis-repo" && record.marketplace?.displayName === "SEIS Repo", "public marketplace identity is invalid");
  assert(record.marketplace?.publicCardCount === EXPECTED_PUBLIC_CARD_COUNT && record.marketplace?.expectedCardCount === EXPECTED_PUBLIC_CARD_COUNT, "public card count is invalid");
  assert(record.marketplace?.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.marketplace?.expectedApplicationPluginCount === APP_PLUGIN_EXPANSION_TARGET, "application plugin count is invalid");
  assert(Object.values(record.validation).every(Boolean), "a required Wave 2 validation contract is not current");
  assert(record.publicBoundary?.publicAudience === "everyone" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false, "personal marketplace boundary is invalid");
  assert(record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public safety boundary is invalid");
  assert(record.nativeValidationBoundary?.packageGraphStatus === "completed-local-package-graph-inspection" && record.nativeValidationBoundary?.swiftTestState === "interrupted-after-no-output-observation-window" && record.nativeValidationBoundary?.swiftTestCompletionClaim === "not-completed-and-not-claimed" && record.nativeValidationBoundary?.compiledSwiftClaim === false && record.nativeValidationBoundary?.testPassClaim === false && record.nativeValidationBoundary?.nativeApplicationRunClaim === false && record.nativeValidationBoundary?.deploymentOrAppStoreClaim === false, "native validation boundary is invalid");
  assert(record.delivery?.featureBranch === "plugins/seis-plugin-root-20260715" && record.delivery?.priorRemoteReferenceVerified === true && record.delivery?.protectedDefaultBranchWritten === false, "delivery boundary is invalid");
  assert(list(record.knownGaps).length === 2 && record.knownGaps[0]?.id === "swiftpm-test-completion" && record.knownGaps[1]?.id === "independent-public-installation", "known gaps are invalid");
  assert(record.releaseReadiness?.promoted === false && ["large-code-promotion-evidence-ready", "continue-code-before-large-code-promotion"].includes(record.releaseReadiness?.decision), "handoff must not claim a release promotion");
  assert(record.historicalWave3Planning?.statusAtWave2Handoff === "planned" && record.historicalWave3Planning?.selectionStatusAtWave2Handoff === "discovery-required" && record.historicalWave3Planning?.selectedCapabilityAtWave2Handoff === null && record.historicalWave3Planning?.implementationStartedAtWave2Handoff === false && record.historicalWave3Planning?.additionalPublicCardAddedAtWave2Handoff === false, "Wave 3 historical planning snapshot is invalid");
  assert(record.nextWave?.number === 3 && record.nextWave?.status === "in-progress" && record.nextWave?.programId === "seis-public-plugin-wave-3-program" && record.nextWave?.selectionStatus === "implementation-approved" && record.nextWave?.selectedCapability === "seis-swift-concurrency-audit" && record.nextWave?.implementationStarted === true && record.nextWave?.additionalPublicCardAdded === true && record.nextWave?.historicalStatusAtWave2Handoff === "planned" && record.nextWave?.historicalSelectionStatusAtWave2Handoff === "discovery-required" && record.nextWave?.scopeRiskReviewPath === OUTPUT_PATH, "Wave 3 continuation decision is invalid");
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

function list(value) {
  return Array.isArray(value) ? value : [];
}

function number(value) {
  return Number.isFinite(value) ? value : 0;
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 2 handoff: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 2 handoff: required input is missing");
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
