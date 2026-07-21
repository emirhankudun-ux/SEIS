#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-program.json";
const WAVE_3_CLOSEOUT_PATH = "content/development/seis-public-plugin-wave-3-closeout.json";
const FOLLOWING_WAVE_REVIEW_PATH = "content/development/seis-public-plugin-wave-3-following-wave-review.json";
const ACTIVATION_DECISION_PATH = "content/development/seis-public-plugin-wave-4-activation-decision.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const CATALOG_PATH = "apps/seis-core/data/seis-core-plugin-catalog.json";
const MATRIX_PATH = "content/development/seis-core-plugin-matrix.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const CANDIDATE_CAPABILITY = "seis-swift-package-topology";
const CANDIDATE_SOURCE_PATH = `plugins/seis-core/${CANDIDATE_CAPABILITY}`;
const CANDIDATE_EVIDENCE_PATH = "content/development/seis-swift-package-topology.json";
const INTEGRATION_CHECKPOINT_PATH = "content/development/seis-public-plugin-wave-4-integration-checkpoint.json";
const VALIDATION_DELIVERY_EVIDENCE_PATH = "content/development/seis-public-plugin-wave-4-validation-delivery-evidence.json";
const PUBLIC_BOUNDARY_DECISION_PATH = "content/development/seis-public-plugin-wave-4-public-boundary-decision.json";
const HANDOFF_PREPARATION_PATH = "content/development/seis-public-plugin-wave-4-handoff-preparation.json";
const CLOSEOUT_SEQUENCE_DECISION_PATH = "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json";
const BASELINE_INVENTORY = Object.freeze({ applicationPluginCount: 73, publicCardCount: 379 });
const INTEGRATED_INVENTORY = Object.freeze({ applicationPluginCount: 74, publicCardCount: 380 });
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;
const SECRET_PATTERNS = [
  { id: "openai-like-api-key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "private-key-header", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

const ROUND_DEFINITIONS = Object.freeze([
  {
    name: "Scope, ownership, and static contract",
    objective: "Keep the candidate bounded to one checked-in manifest and establish an unambiguous static-topology contract before any implementation is considered.",
    tasks: [
      "Reconfirm the completed Wave 3 following-wave scope review and its unactivated candidate decision.",
      "Reconfirm that no candidate source directory, source entry, catalog entry, matrix entry, or SEIS Repo card exists.",
      "Confirm SEIS remains the canonical repository owner for the public package and its generated evidence.",
      "Lock the only permitted input to packages/seis_platform_swift/Package.swift.",
      "Define the supported static manifest grammar subset and an attention state for unsupported syntax.",
      "Define a derived declared-platform record without returning raw manifest text.",
      "Define a derived product-to-target mapping record.",
      "Define a derived target-kind record for target, executableTarget, and testTarget declarations.",
      "Define a derived target-dependency edge record.",
      "Define a derived executable-resource mapping record.",
      "Define a derived test-target dependency record.",
      "Set bounded file-size, regular-file, and symlink-refusal rules for the fixed manifest.",
      "Set malformed, missing, unreadable, and oversized manifest attention states.",
      "Set raw-source, raw-match, absolute-path, and machine-path output prohibitions.",
      "Set deny-by-default write, network, and secret permissions.",
      "Set explicit non-claims for SwiftPM resolution, compiler diagnostics, test success, and native runtime behavior.",
      "Draft public plugin metadata, summary wording, and implementation maturity labels without publishing a card.",
      "Define zero-dependency and no-provider requirements for the planned package.",
      "Review contract overlap against Apple readiness, Swift concurrency, and package-adoption responsibilities.",
      "Record Round 1 scope, risk, rollback, and activation-gate evidence.",
    ],
  },
  {
    name: "Bounded parser and MCP design",
    objective: "Specify the implementation only after Wave 4 activation, with a deterministic static parser and no execution side effects.",
    tasks: [
      "Create the public package skeleton only after an explicit Wave 4 activation decision.",
      "Implement fixed-root and fixed-manifest path resolution with outside-root refusal.",
      "Implement regular-file and symlink checks before any manifest read.",
      "Implement the manifest byte limit before parsing.",
      "Implement deterministic platform extraction for the supported grammar subset.",
      "Implement deterministic library and executable product extraction.",
      "Implement deterministic target-kind extraction.",
      "Implement deterministic target-dependency extraction.",
      "Implement deterministic test-target relation extraction.",
      "Implement deterministic executable-resource extraction.",
      "Represent unsupported syntax as bounded attention rather than a guessed topology.",
      "Emit only derived topology fields and counts, never raw manifest content.",
      "Add bounded status output that reports local static mode and limitations.",
      "Add bounded audit output with a fixed default root only.",
      "Add bounded evidence output that declares public, deny-by-default permissions.",
      "Refuse arbitrary path arguments through the MCP and CLI surfaces.",
      "Document no compile, test, resolve, run, install, signing, provider, deployment, or release behavior.",
      "Add deterministic ordering for every product, target, edge, and resource record.",
      "Review parser error paths for secret, raw-text, and absolute-path leakage.",
      "Record Round 2 implementation-design evidence without promoting release maturity.",
    ],
  },
  {
    name: "Focused tests and resilience",
    objective: "Define a fixture-backed test suite proving the planned parser remains bounded, static, and honest about malformed evidence.",
    tasks: [
      "Add a happy-path fixture that matches the checked-in declared platform and product topology.",
      "Test deterministic target, dependency, test-target, and resource ordering.",
      "Test missing manifest handling without returning a fixture path.",
      "Test oversized manifest refusal before content is read.",
      "Test direct manifest symlink refusal without following it.",
      "Test an unsupported platform declaration as attention rather than an inferred value.",
      "Test malformed product declarations as attention without raw manifest echo.",
      "Test malformed target declarations as attention without raw manifest echo.",
      "Test unsupported dependency syntax as attention without a guessed edge.",
      "Test malformed resource declarations as attention without raw manifest echo.",
      "Test an arbitrary audit path is refused before filesystem traversal.",
      "Test outside-workspace roots are refused.",
      "Test output never contains absolute or machine-specific paths.",
      "Test output never contains raw manifest or matched fragments.",
      "Test declared permissions remain empty for write, network, and secrets.",
      "Test status mode remains non-mutating and does not install packages.",
      "Test evidence mode preserves compiler, SwiftPM, runtime, and release claims as false.",
      "Test generated evidence remains deterministic across repeated local runs.",
      "Review fixture safety and remove any accidental credential-like values.",
      "Record Round 3 resilience, limitations, and rollback evidence.",
    ],
  },
  {
    name: "Public repository integration",
    objective: "Plan only the reversible repository projections needed after implementation and focused validation pass; do not alter public counts before activation.",
    tasks: [
      "Reconfirm current source, catalog, matrix, and SEIS Repo counts before any planned integration.",
      "Add the candidate to the app source generator only after focused parser tests pass.",
      "Add the candidate to the public SEIS Repo marketplace only after source validation passes.",
      "Update the app catalog generator and assert a single catalog entry.",
      "Update the plugin matrix generator and assert a single matrix entry.",
      "Update count-based validators from the previous baseline only as one reconciled change.",
      "Update lifecycle, provenance, and permission records with static-only limitations.",
      "Update public terminology checks without reintroducing personal marketplace wording.",
      "Update installation and runtime records without claiming independent installation or runtime proof.",
      "Update evidence indexing with the fixed-manifest topology boundary.",
      "Update plugin catalog search metadata with a distinct topology responsibility.",
      "Update package and MCP validation commands without granting writes or network access.",
      "Run plugin-creator structural validation against the new repo-backed package.",
      "Run focused source, catalog, matrix, marketplace, and terminology checks.",
      "Run public permission and release-boundary checks.",
      "Review generated files for stale counts, duplicate labels, and personal marketplace wording.",
      "Review public docs for static-only, no-execution language.",
      "Review accessibility and clarity of the public card metadata.",
      "Record a focused integration checkpoint with no default-branch update.",
      "Record Round 4 integration risks, rollback, and remaining external-proof limits.",
    ],
  },
  {
    name: "Validation, delivery, and closeout",
    objective: "Plan a reviewable release-quality handoff while preserving the distinction between repository-local validation and external proof.",
    tasks: [
      "Run the dedicated Wave 4 program and candidate-contract checks.",
      "Run the full SEIS public plugin continuity check.",
      "Run the SEIS Repo marketplace validation with public-only terminology checks.",
      "Run the complete plugin test suite and disclose failures or skips.",
      "Run the repository web and governance checks applicable to the change.",
      "Run whitespace and generated-artifact drift checks.",
      "Inspect the feature-branch worktree and focused diff before commit.",
      "Create a focused reversible commit after validation succeeds.",
      "Push only the current feature branch when authorization and network conditions permit.",
      "Verify the remote feature-branch reference without claiming a merge.",
      "Record protected-branch, pull-request, code-scanning, and signature-policy observations honestly.",
      "Record public marketplace count reconciliation only if a candidate card was actually added.",
      "Record no independent installation, SwiftPM, compiler, runtime, provider, deployment, signing, or release claims.",
      "Review whether external proof or human approval remains required.",
      "Create follow-up goals for any deferred environment, release, or runtime validation.",
      "Prepare a repository-local Wave 4 handoff only after all one hundred planned steps have current evidence.",
      "Mark Wave 4 complete only after required evidence and quality gates are current.",
      "Keep Wave 5 planned-gated pending a separate scope and risk review.",
      "Archive or retain artifacts according to public evidence and rollback policy.",
      "Produce a final goal report with exact repository state and next recommended decision.",
    ],
  },
]);

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-program");
    process.exit(1);
  }
  console.log(`SEIS public plugin Wave 4 program check passed (${record.progress.completedStepCount} completed, step ${record.progress.nextStepNumber} in progress).`);
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " as an active 100-step Wave 4 program.");
}

function buildRecord() {
  const wave3Closeout = readJson(WAVE_3_CLOSEOUT_PATH);
  const followingWaveReview = readJson(FOLLOWING_WAVE_REVIEW_PATH);
  const activationDecision = readJson(ACTIVATION_DECISION_PATH);
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const catalog = readJson(CATALOG_PATH);
  const matrix = readJson(MATRIX_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const topologyEvidence = readJson(CANDIDATE_EVIDENCE_PATH);
  const integrationCheckpoint = readJson(INTEGRATION_CHECKPOINT_PATH);
  const validationDeliveryEvidence = readJson(VALIDATION_DELIVERY_EVIDENCE_PATH);
  const publicBoundaryDecision = readJson(PUBLIC_BOUNDARY_DECISION_PATH);
  const handoffPreparation = readJson(HANDOFF_PREPARATION_PATH);
  const sourceEntries = list(sourceManifest.plugins);
  const catalogEntries = list(catalog.plugins);
  const matrixEntries = list(matrix.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const candidatePresence = {
    sourceDirectory: fs.existsSync(path.join(ROOT, CANDIDATE_SOURCE_PATH)),
    sourceManifest: sourceEntries.filter((entry) => entry?.name === CANDIDATE_CAPABILITY).length === 1,
    catalog: catalogEntries.filter((entry) => entry?.name === CANDIDATE_CAPABILITY).length === 1,
    matrix: matrixEntries.filter((entry) => entry?.name === CANDIDATE_CAPABILITY).length === 1,
    marketplaceCard: marketplaceEntries.filter((entry) => entry?.name === CANDIDATE_CAPABILITY && entry?.source?.path === `./plugins/seis-core/${CANDIDATE_CAPABILITY}`).length === 1,
  };
  const steps = ROUND_DEFINITIONS.flatMap((round, roundIndex) => round.tasks.map((title, taskIndex) => ({
    number: (roundIndex * 20) + taskIndex + 1,
    round: roundIndex + 1,
    title,
    status: stepStatus((roundIndex * 20) + taskIndex + 1),
    validation: validationFor(roundIndex + 1, taskIndex + 1),
  })));
  const inputSafetyScan = scanPublicSafeInputs([FOLLOWING_WAVE_REVIEW_PATH, SOURCE_MANIFEST_PATH, CATALOG_PATH, MATRIX_PATH, MARKETPLACE_PATH, CANDIDATE_EVIDENCE_PATH, PUBLIC_BOUNDARY_DECISION_PATH, HANDOFF_PREPARATION_PATH]);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-4-program",
    goalId: "SEIS-GOAL-021",
    parentProgramId: "seis-public-plugin-expansion-program",
    status: "in-progress",
    maturity: "prototype",
    createdAt: "2026-07-21",
    updatedAt: "2026-07-21",
    wave: {
      number: 4,
      totalSteps: 100,
      roundCount: 5,
      stepsPerRound: 20,
      predecessor: {
        closeoutPath: WAVE_3_CLOSEOUT_PATH,
        scopeReviewPath: FOLLOWING_WAVE_REVIEW_PATH,
        requiredStatus: "completed-following-wave-scope-review",
        requiredCandidate: CANDIDATE_CAPABILITY,
      },
    },
    scope: {
      repositories: ["SEIS"],
      selectedCapability: CANDIDATE_CAPABILITY,
      outcome: "One public repository package now reports bounded, derived Swift Package manifest topology with a single checked-in source, SEIS Repo card, generated catalog and matrix projections, and repository-local static evidence. It remains a prototype with no external installation, SwiftPM, compiler, runtime, provider, deployment, or release claim.",
      entryRule: "Wave 3 closed step 100 and the separate activation decision confirmed current user authority, scope, risk, validation, rollback, and public-count reconciliation. Steps 1–95 now have current repository-local evidence, including remote-policy observations and explicit external-proof limits; step 96 remains in-progress with a non-terminal handoff-preparation gate, not a final handoff, release, completion, or Wave 5 activation claim.",
    },
    nonGoals: [
      "Adding more than the one activation-approved public package or card without a new capability decision.",
      "Reading or mutating a personal marketplace, using a network, granting writes or secrets, or changing protected branches.",
      "Compiling, testing, resolving, describing, running, signing, installing, deploying, or publishing Swift or plugin artifacts.",
      "Treating static manifest topology as proof of graph validity, compiler correctness, runtime behavior, independent installation, or public release.",
    ],
    activationGate: {
      status: "implemented-repository-local",
      activationDecisionPath: ACTIVATION_DECISION_PATH,
      implementationStarted: true,
      candidatePackageExists: true,
      candidatePublicCardExists: true,
      requiredBeforeActivation: [
        "Wave 3 step 100 has current closure evidence.",
        "The Wave 4 activation decision records current user authority, exact scope, risks, rollback, and validation gates.",
        "The candidate remains distinct from Apple readiness, Swift concurrency, and package-adoption responsibilities.",
        "No unreviewed permission, dependency, personal marketplace, secret, or external-write expansion is required.",
      ],
    },
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
      publicRelease: false,
    },
    rounds: ROUND_DEFINITIONS.map((round, index) => ({
      round: index + 1,
      name: round.name,
      objective: round.objective,
      status: index < 4 ? "completed" : "in-progress",
      steps: Array.from({ length: 20 }, (_, taskIndex) => (index * 20) + taskIndex + 1),
    })),
    steps,
    progress: {
      completedStepCount: 95,
      plannedStepCount: 4,
      inProgressStepNumbers: [96],
      completedRoundCount: 4,
      nextStepNumber: 96,
    },
    evidence: {
      wave3CloseoutPath: WAVE_3_CLOSEOUT_PATH,
      followingWaveReviewPath: FOLLOWING_WAVE_REVIEW_PATH,
      activationDecisionPath: ACTIVATION_DECISION_PATH,
      sourceManifestPath: SOURCE_MANIFEST_PATH,
      catalogPath: CATALOG_PATH,
      matrixPath: MATRIX_PATH,
      marketplacePath: MARKETPLACE_PATH,
      candidateSourcePath: CANDIDATE_SOURCE_PATH,
      candidateEvidencePath: CANDIDATE_EVIDENCE_PATH,
      integrationCheckpointPath: INTEGRATION_CHECKPOINT_PATH,
      validationDeliveryEvidencePath: VALIDATION_DELIVERY_EVIDENCE_PATH,
      publicBoundaryDecisionPath: PUBLIC_BOUNDARY_DECISION_PATH,
      handoffPreparationPath: HANDOFF_PREPARATION_PATH,
      closeoutSequenceDecisionPath: CLOSEOUT_SEQUENCE_DECISION_PATH,
    },
    validation: [
      "npm run check:seis-public-plugin-wave-4-program",
      "npm run check:seis-public-plugin-wave-4-activation-decision",
      "npm run check:seis-public-plugin-wave-4-integration-checkpoint",
      "npm run check:seis-public-plugin-wave-4-validation-delivery-evidence",
      "npm run check:seis-public-plugin-wave-4-public-boundary-decision",
      "npm run check:seis-public-plugin-wave-4-handoff-preparation",
      "npm run check:seis-public-plugin-wave-4-closeout-sequence-decision",
      "npm run check:seis-swift-package-topology",
      "npm run check:seis-public-plugin-wave-3-following-wave-review",
      "npm run check:seis-public-plugin-continuity-cadence",
      "npm run check:seis-public-plugin-expansion-program",
      "node --test plugins/seis-core/test/public-plugin-wave-4-program.test.mjs",
    ],
    risks: [
      {
        id: "RISK-W4-001",
        status: "tracked",
        description: "The candidate could overlap Apple readiness or be mistaken for a compiled package graph audit.",
        mitigation: "Limit the contract to derived manifest relationships and preserve all compiler, SwiftPM, runtime, and release claims as false.",
      },
      {
        id: "RISK-W4-002",
        status: "tracked",
        description: "A repository-local Wave 4 integration could be mistaken for independent installation, a public release, or an unbounded expansion.",
        mitigation: "Keep exactly one source and card, preserve external claims as false, retain the 74/380 reconciliation checks, and require separate approval for release or another package.",
      },
      {
        id: "RISK-W4-003",
        status: "tracked",
        description: "A parser may silently guess unsupported Swift Package syntax or expose raw manifest content.",
        mitigation: "Define a narrow grammar subset, attention states for unsupported syntax, bounded derived output, and fixture tests for leakage refusal.",
      },
      {
        id: "RISK-W4-004",
        status: "tracked",
        description: "Future integration can desynchronize source, catalog, matrix, marketplace, and count-based validators.",
        mitigation: "Require one reconciled integration checkpoint with generated artifacts and full public marketplace validation.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the one Wave 4 source package, SEIS Repo card, generated projections, topology evidence, and this program update on the feature branch; no manifest mutation, external state, release, or data migration exists.",
      dataMigrationRequired: false,
    },
    checks: {
      predecessorCloseout: wave3Closeout.id === "seis-public-plugin-wave-3-closeout"
        && wave3Closeout.status === "completed-repository-local-wave-closeout"
        && wave3Closeout.completion?.completedStepCount === 100
        && wave3Closeout.completion?.nextWaveStatus === "planned-gated"
        && wave3Closeout.completion?.nextWaveActivationApproved === false,
      precedingReview: followingWaveReview.id === "seis-public-plugin-wave-3-following-wave-review"
        && followingWaveReview.status === "completed-following-wave-scope-review"
        && followingWaveReview.step === 98
        && followingWaveReview.followingWaveDecision?.selectedCapability === CANDIDATE_CAPABILITY
        && followingWaveReview.followingWaveDecision?.implementationApproved === false
        && followingWaveReview.followingWaveDecision?.activationApproved === false,
      activationDecision: activationDecision.id === "seis-public-plugin-wave-4-activation-decision"
        && activationDecision.status === "approved-public-local-wave-4-activation"
        && activationDecision.decision?.selectedCapability === CANDIDATE_CAPABILITY
        && activationDecision.decision?.activationApproved === true
        && activationDecision.decision?.implementationApproved === true
        && activationDecision.decision?.implementationStarted === false
        && activationDecision.decision?.publicReleaseApproved === false,
      publicInventory: sourceEntries.length === INTEGRATED_INVENTORY.applicationPluginCount
        && catalog.counts?.discovered === INTEGRATED_INVENTORY.applicationPluginCount
        && matrix.pluginCount === INTEGRATED_INVENTORY.applicationPluginCount
        && matrix.failureCount === 0
        && marketplace.name === "seis-repo"
        && marketplaceEntries.length === INTEGRATED_INVENTORY.publicCardCount,
      candidateIntegrated: Object.values(candidatePresence).every((value) => value === true),
      topologyEvidence: topologyEvidence.id === CANDIDATE_CAPABILITY
        && topologyEvidence.status === "ready-public-static-topology-evidence"
        && topologyEvidence.plugin?.catalogStatus === "ready"
        && topologyEvidence.plugin?.matrixStatus === "ready"
        && topologyEvidence.plugin?.publicMarketplace === true
        && topologyEvidence.marketplace?.applicationPluginCount === INTEGRATED_INVENTORY.applicationPluginCount
        && topologyEvidence.marketplace?.publicCardCount === INTEGRATED_INVENTORY.publicCardCount
        && topologyEvidence.activation?.implementationObserved === true
        && topologyEvidence.audit?.ok === true
        && topologyEvidence.safety?.compilesSwift === false
        && topologyEvidence.safety?.runsSwiftTests === false
        && topologyEvidence.publicBoundary?.personalMarketplaceRead === false
        && topologyEvidence.publicBoundary?.personalMarketplaceMutation === false,
      integrationCheckpoint: integrationCheckpoint.id === "seis-public-plugin-wave-4-integration-checkpoint"
        && integrationCheckpoint.status === "completed-repository-local-integration-checkpoint"
        && integrationCheckpoint.maturity === "prototype"
        && list(integrationCheckpoint.completedSteps).join(",") === range(74, 80).join(",")
        && integrationCheckpoint.capability?.id === CANDIDATE_CAPABILITY
        && integrationCheckpoint.publicProjection?.applicationPluginCount === INTEGRATED_INVENTORY.applicationPluginCount
        && integrationCheckpoint.publicProjection?.publicCardCount === INTEGRATED_INVENTORY.publicCardCount
        && integrationCheckpoint.topologyEvidence?.auditOk === true
        && list(integrationCheckpoint.permissions?.write).length === 0
        && list(integrationCheckpoint.permissions?.network).length === 0
        && list(integrationCheckpoint.permissions?.secrets).length === 0
        && Object.values(integrationCheckpoint.externalClaims || {}).every((value) => value === false),
      validationDeliveryEvidence: validationDeliveryEvidence.id === "seis-public-plugin-wave-4-validation-delivery-evidence"
        && validationDeliveryEvidence.status === "completed-repository-local-validation-delivery-evidence"
        && validationDeliveryEvidence.maturity === "prototype"
        && list(validationDeliveryEvidence.completedSteps).join(",") === range(81, 90).join(",")
        && validationDeliveryEvidence.observedDelivery?.sourceIntegrationCommit === "e3cc34d6138c0e47fa582c5fa09e3c92c04a005e"
        && validationDeliveryEvidence.observedDelivery?.pushed === true
        && validationDeliveryEvidence.observedDelivery?.remoteReferenceVerified === true
        && validationDeliveryEvidence.observedDelivery?.protectedDefaultBranchWritten === false
        && Object.values(validationDeliveryEvidence.externalClaims || {}).every((value) => value === false),
      publicBoundaryDecision: publicBoundaryDecision.id === "seis-public-plugin-wave-4-public-boundary-decision"
        && publicBoundaryDecision.status === "completed-repository-local-public-boundary-decision"
        && publicBoundaryDecision.maturity === "prototype"
        && list(publicBoundaryDecision.completedSteps).join(",") === range(91, 95).join(",")
        && publicBoundaryDecision.remotePolicyObservations?.validationDeliveryCommit === "6f94f08612839984fc841ac56f01e224010456c3"
        && publicBoundaryDecision.remotePolicyObservations?.remoteReferenceVerified === true
        && publicBoundaryDecision.remotePolicyObservations?.protectedDefaultBranchWritten === false
        && publicBoundaryDecision.publicCountReconciliation?.applicationPluginCount === INTEGRATED_INVENTORY.applicationPluginCount
        && publicBoundaryDecision.publicCountReconciliation?.publicCardCount === INTEGRATED_INVENTORY.publicCardCount
        && publicBoundaryDecision.publicCountReconciliation?.personalMarketplaceRead === false
        && publicBoundaryDecision.publicCountReconciliation?.personalMarketplaceMutation === false
        && Object.values(publicBoundaryDecision.externalClaims || {}).every((value) => value === false)
        && publicBoundaryDecision.externalProofAndApprovals?.publicReleaseAllowed === false
        && publicBoundaryDecision.recommendedFollowUp?.status === "proposed-not-created",
      handoffPreparation: handoffPreparation.id === "seis-public-plugin-wave-4-handoff-preparation"
        && handoffPreparation.status === "in-progress-repository-local-handoff-preparation"
        && handoffPreparation.maturity === "prototype"
        && handoffPreparation.step === 96
        && handoffPreparation.stateAtPreparation?.completedStepCount === 95
        && handoffPreparation.stateAtPreparation?.activeStep === 96
        && list(handoffPreparation.stateAtPreparation?.remainingStepNumbers).join(",") === range(97, 100).join(",")
        && Object.values(handoffPreparation.completedEvidence || {}).every(Boolean)
        && handoffPreparation.handoffGate?.ready === false
        && handoffPreparation.handoffGate?.allOneHundredStepsHaveCurrentEvidence === false
        && handoffPreparation.handoffGate?.terminalHandoffPublished === false
        && handoffPreparation.handoffGate?.waveCompleted === false
        && handoffPreparation.handoffGate?.wave5ActivationApproved === false
        && Object.values(handoffPreparation.externalClaims || {}).every((value) => value === false)
        && handoffPreparation.recommendedFollowUp?.status === "created-proposed-owner-decision-required"
        && handoffPreparation.recommendedFollowUp?.decisionPath === CLOSEOUT_SEQUENCE_DECISION_PATH,
    },
    inputSafetyScan,
  };
  validateRecord(record);
  return record;
}

function validationFor(round, task) {
  if (round === 1) return task <= 16 ? "scope, contract, and static-boundary review" : "overlap, risk, rollback, and activation-gate review";
  if (round === 2) return task <= 16 ? "bounded parser and no-side-effect design review" : "deterministic output, leakage, and limitation review";
  if (round === 3) return task <= 17 ? "focused fixture and resilience-test plan" : "fixture safety, determinism, and resilience evidence review";
  if (round === 4) return task <= 15 ? "conditional post-activation repository integration plan" : "generated-artifact, documentation, and reversible checkpoint review";
  return task <= 15 ? "conditional post-activation validation and delivery plan" : "handoff, completion, and future-wave gate review";
}

function stepStatus(number) {
  if (number <= 95) return "completed";
  if (number === 96) return "in-progress";
  return "planned";
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-program" && record.goalId === "SEIS-GOAL-021" && record.parentProgramId === "seis-public-plugin-expansion-program" && record.status === "in-progress" && record.maturity === "prototype", "Wave 4 program identity is invalid");
  assert(record.wave?.number === 4 && record.wave?.totalSteps === 100 && record.wave?.roundCount === 5 && record.wave?.stepsPerRound === 20 && record.wave?.predecessor?.closeoutPath === WAVE_3_CLOSEOUT_PATH && record.wave?.predecessor?.scopeReviewPath === FOLLOWING_WAVE_REVIEW_PATH && record.wave?.predecessor?.requiredStatus === "completed-following-wave-scope-review" && record.wave?.predecessor?.requiredCandidate === CANDIDATE_CAPABILITY, "Wave 4 predecessor is invalid");
  assert(record.scope?.selectedCapability === CANDIDATE_CAPABILITY && record.scope?.entryRule?.includes("in-progress"), "Wave 4 scope is invalid");
  assert(list(record.nonGoals).length === 4, "Wave 4 non-goals are incomplete");
  assert(record.activationGate?.status === "implemented-repository-local" && record.activationGate?.activationDecisionPath === ACTIVATION_DECISION_PATH && record.activationGate?.implementationStarted === true && record.activationGate?.candidatePackageExists === true && record.activationGate?.candidatePublicCardExists === true && list(record.activationGate?.requiredBeforeActivation).length === 4, "Wave 4 activation gate is invalid");
  assert(list(record.rounds).length === 5 && list(record.steps).length === 100, "Wave 4 structure is incomplete");
  for (let index = 0; index < 100; index += 1) {
    const step = record.steps[index];
    assert(step?.number === index + 1 && step?.round === Math.floor(index / 20) + 1 && step?.status === stepStatus(index + 1) && typeof step?.title === "string" && step.title.length > 0 && typeof step?.validation === "string" && step.validation.length > 0, `Wave 4 step ${index + 1} is invalid`);
  }
  assert(record.progress?.completedStepCount === 95 && record.progress?.plannedStepCount === 4 && list(record.progress?.inProgressStepNumbers).join(",") === "96" && record.progress?.completedRoundCount === 4 && record.progress?.nextStepNumber === 96, "Wave 4 progress is invalid");
  assert(record.evidence?.publicBoundaryDecisionPath === PUBLIC_BOUNDARY_DECISION_PATH, "Wave 4 public-boundary evidence path is invalid");
  assert(record.evidence?.handoffPreparationPath === HANDOFF_PREPARATION_PATH, "Wave 4 handoff-preparation evidence path is invalid");
  assert(record.evidence?.closeoutSequenceDecisionPath === CLOSEOUT_SEQUENCE_DECISION_PATH, "Wave 4 closeout-sequence evidence path is invalid");
  assert(Object.values(record.checks).every(Boolean), "a required Wave 4 planning contract is not current");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.externalClaims?.independentInstallation === false && record.externalClaims?.compiledSwift === false && record.externalClaims?.swiftPmTestPass === false && record.externalClaims?.nativeRuntime === false && record.externalClaims?.liveProvider === false && record.externalClaims?.deployment === false && record.externalClaims?.publicRelease === false, "external claim boundary is invalid");
  assert(list(record.risks).length === 4 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "Wave 4 risks or rollback are invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "Wave 4 planning inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "Wave 4 program must not contain a machine-specific path");
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
  if (!condition) throw new Error("SEIS public plugin Wave 4 program: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 program: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
