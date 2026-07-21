#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-program.json";
const WAVE_3_CLOSEOUT_PATH = "content/development/seis-public-plugin-wave-3-closeout.json";
const WAVE_3_FOLLOWING_WAVE_REVIEW_PATH = "content/development/seis-public-plugin-wave-3-following-wave-review.json";
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
const REPOSITORY_LOCAL_HANDOFF_PATH = "content/development/seis-public-plugin-wave-4-repository-local-handoff.json";
const WAVE_4_FOLLOWING_WAVE_REVIEW_PATH = "content/development/seis-public-plugin-wave-4-following-wave-review.json";
const EVIDENCE_RETENTION_PATH = "content/development/seis-public-plugin-wave-4-evidence-retention.json";
const CLOSEOUT_PATH = "content/development/seis-public-plugin-wave-4-closeout.json";
const BASELINE_INVENTORY = Object.freeze({ applicationPluginCount: 73, publicCardCount: 379 });
const INTEGRATED_INVENTORY = Object.freeze({ applicationPluginCount: 74, publicCardCount: 380 });
const ACTIVE_WAVE_5_INVENTORY = Object.freeze({ applicationPluginCount: 75, publicCardCount: 381 });
const ACTIVE_WAVE_5_CAPABILITY = "seis-plugin-capability-coverage";
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
      "Record the user-authorized non-circular closeout sequence before any terminal handoff or completion transition.",
      "Prepare the repository-local Wave 4 terminal-handoff evidence only after its retained artifacts and quality gates are current.",
      "Keep Wave 5 planned-gated pending a separate scope and risk review.",
      "Retain all public evidence and rollback artifacts in place until the terminal closeout report is current.",
      "Produce the final goal report with exact repository state, then mark Wave 4 complete only after all prior closeout evidence is current.",
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
  console.log(record.status === "completed"
    ? "SEIS public plugin Wave 4 program check passed (100 completed, repository-local closeout recorded)."
    : `SEIS public plugin Wave 4 program check passed (${record.progress.completedStepCount} completed, step ${record.progress.nextStepNumber} in progress).`);
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " with the current Wave 4 program state.");
}

function buildRecord() {
  const wave3Closeout = readJson(WAVE_3_CLOSEOUT_PATH);
  const wave3FollowingWaveReview = readJson(WAVE_3_FOLLOWING_WAVE_REVIEW_PATH);
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
  const closeoutSequenceDecision = readJson(CLOSEOUT_SEQUENCE_DECISION_PATH);
  const repositoryLocalHandoff = readJson(REPOSITORY_LOCAL_HANDOFF_PATH);
  const wave4FollowingWaveReview = readJson(WAVE_4_FOLLOWING_WAVE_REVIEW_PATH);
  const evidenceRetention = readJson(EVIDENCE_RETENTION_PATH);
  const closeout = readJson(CLOSEOUT_PATH);
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
  const inputSafetyScan = scanPublicSafeInputs([WAVE_3_FOLLOWING_WAVE_REVIEW_PATH, WAVE_4_FOLLOWING_WAVE_REVIEW_PATH, EVIDENCE_RETENTION_PATH, CLOSEOUT_PATH, SOURCE_MANIFEST_PATH, CATALOG_PATH, MATRIX_PATH, MARKETPLACE_PATH, CANDIDATE_EVIDENCE_PATH, PUBLIC_BOUNDARY_DECISION_PATH, HANDOFF_PREPARATION_PATH, CLOSEOUT_SEQUENCE_DECISION_PATH, REPOSITORY_LOCAL_HANDOFF_PATH]);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-4-program",
    goalId: "SEIS-GOAL-021",
    parentProgramId: "seis-public-plugin-expansion-program",
    status: "completed",
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
        scopeReviewPath: WAVE_3_FOLLOWING_WAVE_REVIEW_PATH,
        requiredStatus: "completed-following-wave-scope-review",
        requiredCandidate: CANDIDATE_CAPABILITY,
      },
    },
    scope: {
      repositories: ["SEIS"],
      selectedCapability: CANDIDATE_CAPABILITY,
      outcome: "One public repository package now reports bounded, derived Swift Package manifest topology with a single checked-in source, SEIS Repo card, generated catalog and matrix projections, and repository-local static evidence. It remains a prototype with no external installation, SwiftPM, compiler, runtime, provider, deployment, or release claim.",
      entryRule: "Wave 3 closed step 100 and the separate activation decision confirmed current user authority, scope, risk, validation, rollback, and public-count reconciliation. All 100 Wave 4 steps now have current repository-local evidence: steps 96–99 record the closeout sequence, non-published handoff, Wave 5 candidate review, and bounded public evidence retention; step 100 records repository-local closeout. Wave 5 remains planned-gated and this is not a merge, release, or external proof claim.",
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
      status: "completed",
      steps: Array.from({ length: 20 }, (_, taskIndex) => (index * 20) + taskIndex + 1),
    })),
    steps,
    progress: {
      completedStepCount: 100,
      plannedStepCount: 0,
      inProgressStepNumbers: [],
      completedRoundCount: 5,
      nextStepNumber: null,
    },
    evidence: {
      wave3CloseoutPath: WAVE_3_CLOSEOUT_PATH,
      followingWaveReviewPath: WAVE_3_FOLLOWING_WAVE_REVIEW_PATH,
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
      repositoryLocalHandoffPath: REPOSITORY_LOCAL_HANDOFF_PATH,
      wave4FollowingWaveReviewPath: WAVE_4_FOLLOWING_WAVE_REVIEW_PATH,
      evidenceRetentionPath: EVIDENCE_RETENTION_PATH,
      closeoutPath: CLOSEOUT_PATH,
    },
    closeoutSequence: {
      status: "completed-repository-local-wave-closeout",
      decisionPath: CLOSEOUT_SEQUENCE_DECISION_PATH,
      approvalSource: "active-thread-user-continuation-objective",
      completedSteps: [96, 97, 98, 99, 100],
      activeStep: null,
      terminalHandoffPublished: false,
      waveCompleted: true,
      wave5ActivationApproved: false,
      completionEvidencePath: CLOSEOUT_PATH,
    },
    repositoryLocalHandoff: {
      status: "completed-repository-local-handoff",
      handoffPath: REPOSITORY_LOCAL_HANDOFF_PATH,
      completedStep: 97,
      activeStep: 98,
      terminalHandoffPublished: false,
      waveCompleted: false,
      wave5ActivationApproved: false,
    },
    repositoryLocalCloseout: {
      status: "completed-repository-local-wave-closeout",
      closeoutPath: CLOSEOUT_PATH,
      completedStep: 100,
      nextActiveWave: null,
      nextWaveStatus: "planned-gated",
      nextWaveSelectedCapability: "seis-plugin-capability-coverage",
      nextWaveImplementationApproved: false,
      nextWaveActivationApproved: false,
      terminalHandoffPublished: false,
      publicReleaseAllowed: false,
    },
    followingWaveReview: {
      status: "completed-following-wave-scope-review",
      reviewPath: WAVE_4_FOLLOWING_WAVE_REVIEW_PATH,
      completedStep: 98,
      activeStep: 99,
      selectedWave5Capability: "seis-plugin-capability-coverage",
      wave5ImplementationApproved: false,
      wave5ActivationApproved: false,
      waveCompleted: false,
    },
    evidenceRetention: {
      status: "completed-public-evidence-retention",
      retentionPath: EVIDENCE_RETENTION_PATH,
      completedStep: 99,
      activeStep: 100,
      deletionPerformed: false,
      externalStorageUsed: false,
      waveCompleted: false,
      wave5ImplementationApproved: false,
      wave5ActivationApproved: false,
    },
    validation: [
      "npm run check:seis-public-plugin-wave-4-program",
      "npm run check:seis-public-plugin-wave-4-activation-decision",
      "npm run check:seis-public-plugin-wave-4-integration-checkpoint",
      "npm run check:seis-public-plugin-wave-4-validation-delivery-evidence",
      "npm run check:seis-public-plugin-wave-4-public-boundary-decision",
      "npm run check:seis-public-plugin-wave-4-handoff-preparation",
      "npm run check:seis-public-plugin-wave-4-evidence-retention",
      "npm run check:seis-public-plugin-wave-4-closeout",
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
      precedingReview: wave3FollowingWaveReview.id === "seis-public-plugin-wave-3-following-wave-review"
        && wave3FollowingWaveReview.status === "completed-following-wave-scope-review"
        && wave3FollowingWaveReview.step === 98
        && wave3FollowingWaveReview.followingWaveDecision?.selectedCapability === CANDIDATE_CAPABILITY
        && wave3FollowingWaveReview.followingWaveDecision?.implementationApproved === false
        && wave3FollowingWaveReview.followingWaveDecision?.activationApproved === false,
      activationDecision: activationDecision.id === "seis-public-plugin-wave-4-activation-decision"
        && activationDecision.status === "approved-public-local-wave-4-activation"
        && activationDecision.decision?.selectedCapability === CANDIDATE_CAPABILITY
        && activationDecision.decision?.activationApproved === true
        && activationDecision.decision?.implementationApproved === true
        && activationDecision.decision?.implementationStarted === false
        && activationDecision.decision?.publicReleaseApproved === false,
      publicInventory: ((sourceEntries.length === INTEGRATED_INVENTORY.applicationPluginCount
        && catalog.counts?.discovered === INTEGRATED_INVENTORY.applicationPluginCount
        && matrix.pluginCount === INTEGRATED_INVENTORY.applicationPluginCount
        && matrix.failureCount === 0
        && marketplace.name === "seis-repo"
        && marketplaceEntries.length === INTEGRATED_INVENTORY.publicCardCount)
        || (sourceEntries.length === ACTIVE_WAVE_5_INVENTORY.applicationPluginCount
          && catalog.counts?.discovered === ACTIVE_WAVE_5_INVENTORY.applicationPluginCount
          && matrix.pluginCount === ACTIVE_WAVE_5_INVENTORY.applicationPluginCount
          && matrix.failureCount === 0
          && marketplace.name === "seis-repo"
          && marketplaceEntries.length === ACTIVE_WAVE_5_INVENTORY.publicCardCount
          && sourceEntries.filter((entry) => entry?.name === ACTIVE_WAVE_5_CAPABILITY).length === 1
          && catalogEntries.filter((entry) => entry?.name === ACTIVE_WAVE_5_CAPABILITY).length === 1
          && matrixEntries.filter((entry) => entry?.name === ACTIVE_WAVE_5_CAPABILITY).length === 1
          && marketplaceEntries.filter((entry) => entry?.name === ACTIVE_WAVE_5_CAPABILITY).length === 1)),
      candidateIntegrated: Object.values(candidatePresence).every((value) => value === true),
      topologyEvidence: isSupportedTopologyEvidence(topologyEvidence),
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
        && handoffPreparation.status === "completed-repository-local-handoff-preparation"
        && handoffPreparation.maturity === "prototype"
        && handoffPreparation.step === 96
        && handoffPreparation.stateAtPreparation?.completedStepCount === 95
        && handoffPreparation.stateAtPreparation?.activeStep === 96
        && list(handoffPreparation.stateAtPreparation?.remainingStepNumbers).join(",") === range(97, 100).join(",")
        && Object.values(handoffPreparation.completedEvidence || {}).every(Boolean)
        && handoffPreparation.handoffGate?.ready === false
        && handoffPreparation.handoffGate?.allOneHundredStepsHaveCurrentEvidence === false
        && handoffPreparation.handoffGate?.preparationCompleted === true
        && handoffPreparation.handoffGate?.nextActiveStep === 97
        && handoffPreparation.handoffGate?.terminalHandoffPublished === false
        && handoffPreparation.handoffGate?.waveCompleted === false
        && handoffPreparation.handoffGate?.wave5ActivationApproved === false
        && Object.values(handoffPreparation.externalClaims || {}).every((value) => value === false)
        && handoffPreparation.completionState?.completedStep === 96
        && handoffPreparation.completionState?.nextActiveStep === 97
        && handoffPreparation.recommendedFollowUp?.status === "accepted-applied-to-canonical-program"
        && handoffPreparation.recommendedFollowUp?.decisionPath === CLOSEOUT_SEQUENCE_DECISION_PATH
        && handoffPreparation.recommendedFollowUp?.approvalSource === "active-thread-user-continuation-objective",
      closeoutSequenceDecision: closeoutSequenceDecision.id === "seis-public-plugin-wave-4-closeout-sequence-decision"
        && closeoutSequenceDecision.status === "approved-current-user-continuation-authority"
        && closeoutSequenceDecision.decisionBoundary?.status === "approved-owner-mapping-applied"
        && closeoutSequenceDecision.decisionBoundary?.approvalSource === "active-thread-user-continuation-objective"
        && closeoutSequenceDecision.decisionBoundary?.approved === true
        && closeoutSequenceDecision.decisionBoundary?.appliedToCanonicalProgram === true
        && closeoutSequenceDecision.decisionBoundary?.automaticStepStatusChangesAllowed === false
        && closeoutSequenceDecision.stateAfterApplication?.completedStepCount === 96
        && closeoutSequenceDecision.stateAfterApplication?.activeStep === 97
        && closeoutSequenceDecision.stateAfterApplication?.terminalHandoffPublished === false
        && closeoutSequenceDecision.stateAfterApplication?.waveCompleted === false
        && closeoutSequenceDecision.stateAfterApplication?.wave5ActivationApproved === false
        && Object.values(closeoutSequenceDecision.externalClaims || {}).every((value) => value === false),
      repositoryLocalHandoff: repositoryLocalHandoff.id === "seis-public-plugin-wave-4-repository-local-handoff"
        && repositoryLocalHandoff.status === "completed-repository-local-handoff"
        && repositoryLocalHandoff.step === 97
        && repositoryLocalHandoff.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 96
        && repositoryLocalHandoff.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 97
        && repositoryLocalHandoff.stateAtCheckpoint?.nextPlannedDecisionStep === 98
        && Object.values(repositoryLocalHandoff.checks || {}).every(Boolean)
        && repositoryLocalHandoff.handoff?.delivery?.currentCheckpointRemoteVerified === false
        && repositoryLocalHandoff.handoff?.delivery?.protectedDefaultBranchWritten === false
        && repositoryLocalHandoff.futureWaveDecision?.status === "planned-gated"
        && repositoryLocalHandoff.futureWaveDecision?.activationApproved === false
        && Object.values(repositoryLocalHandoff.externalClaims || {}).every((value) => value === false),
      followingWaveReview: wave4FollowingWaveReview.id === "seis-public-plugin-wave-4-following-wave-review"
        && wave4FollowingWaveReview.status === "completed-following-wave-scope-review"
        && wave4FollowingWaveReview.step === 98
        && wave4FollowingWaveReview.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 97
        && wave4FollowingWaveReview.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 98
        && wave4FollowingWaveReview.stateAtCheckpoint?.nextPlannedDecisionStep === 99
        && Object.values(wave4FollowingWaveReview.checks || {}).every(Boolean)
        && wave4FollowingWaveReview.followingWaveDecision?.wave === 5
        && wave4FollowingWaveReview.followingWaveDecision?.selectedCapability === "seis-plugin-capability-coverage"
        && wave4FollowingWaveReview.followingWaveDecision?.implementationApproved === false
        && wave4FollowingWaveReview.followingWaveDecision?.activationApproved === false
        && wave4FollowingWaveReview.followingWaveDecision?.candidatePackageExists === false
        && wave4FollowingWaveReview.followingWaveDecision?.candidatePublicCardExists === false
        && Object.values(wave4FollowingWaveReview.externalClaims || {}).every((value) => value === false),
      evidenceRetention: evidenceRetention.id === "seis-public-plugin-wave-4-evidence-retention"
        && evidenceRetention.status === "completed-public-evidence-retention"
        && evidenceRetention.step === 99
        && evidenceRetention.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 98
        && evidenceRetention.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 99
        && evidenceRetention.stateAtCheckpoint?.nextPlannedDecisionStep === 100
        && Object.values(evidenceRetention.checks || {}).every(Boolean)
        && evidenceRetention.retention?.status === "bounded-public-evidence-retained"
        && evidenceRetention.retention?.relativePathOnly === true
        && evidenceRetention.retention?.rawContentStored === false
        && evidenceRetention.retention?.deletionPerformed === false
        && evidenceRetention.retention?.externalStorageUsed === false
        && evidenceRetention.retention?.nextActiveStep === 100
        && Object.values(evidenceRetention.externalClaims || {}).every((value) => value === false),
      closeout: closeout.id === "seis-public-plugin-wave-4-closeout"
        && closeout.status === "completed-repository-local-wave-closeout"
        && closeout.step === 100
        && closeout.stateAtCheckpoint?.completedStepCountBeforeTrackerUpdate === 99
        && closeout.stateAtCheckpoint?.activeStepBeforeTrackerUpdate === 100
        && closeout.stateAtCheckpoint?.completedStepCountAfterTrackerUpdate === 100
        && closeout.stateAtCheckpoint?.completedRoundCountAfterTrackerUpdate === 5
        && closeout.stateAtCheckpoint?.waveCompleted === true
        && closeout.completion?.nextActiveWave === null
        && closeout.completion?.nextWaveStatus === "planned-gated"
        && closeout.completion?.nextWaveSelectedCapability === "seis-plugin-capability-coverage"
        && closeout.completion?.nextWaveImplementationApproved === false
        && closeout.completion?.nextWaveActivationApproved === false
        && closeout.completion?.terminalHandoffPublished === false
        && closeout.completion?.publicReleaseAllowed === false
        && Object.values(closeout.checks || {}).every(Boolean)
        && Object.values(closeout.externalClaims || {}).every((value) => value === false),
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

function isSupportedTopologyEvidence(record) {
  const shared = record?.id === CANDIDATE_CAPABILITY
    && record?.status === "ready-public-static-topology-evidence"
    && record?.plugin?.catalogStatus === "ready"
    && record?.plugin?.matrixStatus === "ready"
    && record?.plugin?.publicMarketplace === true
    && record?.activation?.implementationObserved === true
    && record?.audit?.ok === true
    && record?.safety?.compilesSwift === false
    && record?.safety?.runsSwiftTests === false
    && record?.publicBoundary?.personalMarketplaceRead === false
    && record?.publicBoundary?.personalMarketplaceMutation === false;
  const wave4Snapshot = record?.marketplace?.applicationPluginCount === INTEGRATED_INVENTORY.applicationPluginCount
    && record?.marketplace?.publicCardCount === INTEGRATED_INVENTORY.publicCardCount;
  const activeWave5 = record?.marketplace?.applicationPluginCount === ACTIVE_WAVE_5_INVENTORY.applicationPluginCount
    && record?.marketplace?.publicCardCount === ACTIVE_WAVE_5_INVENTORY.publicCardCount;
  return shared && (wave4Snapshot || activeWave5);
}

function stepStatus(number) {
  return number >= 1 && number <= 100 ? "completed" : "planned";
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-program" && record.goalId === "SEIS-GOAL-021" && record.parentProgramId === "seis-public-plugin-expansion-program" && record.status === "completed" && record.maturity === "prototype", "Wave 4 program identity is invalid");
  assert(record.wave?.number === 4 && record.wave?.totalSteps === 100 && record.wave?.roundCount === 5 && record.wave?.stepsPerRound === 20 && record.wave?.predecessor?.closeoutPath === WAVE_3_CLOSEOUT_PATH && record.wave?.predecessor?.scopeReviewPath === WAVE_3_FOLLOWING_WAVE_REVIEW_PATH && record.wave?.predecessor?.requiredStatus === "completed-following-wave-scope-review" && record.wave?.predecessor?.requiredCandidate === CANDIDATE_CAPABILITY, "Wave 4 predecessor is invalid");
  assert(record.scope?.selectedCapability === CANDIDATE_CAPABILITY && record.scope?.entryRule?.includes("All 100 Wave 4 steps"), "Wave 4 scope is invalid");
  assert(list(record.nonGoals).length === 4, "Wave 4 non-goals are incomplete");
  assert(record.activationGate?.status === "implemented-repository-local" && record.activationGate?.activationDecisionPath === ACTIVATION_DECISION_PATH && record.activationGate?.implementationStarted === true && record.activationGate?.candidatePackageExists === true && record.activationGate?.candidatePublicCardExists === true && list(record.activationGate?.requiredBeforeActivation).length === 4, "Wave 4 activation gate is invalid");
  assert(list(record.rounds).length === 5 && list(record.steps).length === 100, "Wave 4 structure is incomplete");
  for (let index = 0; index < 100; index += 1) {
    const step = record.steps[index];
    assert(step?.number === index + 1 && step?.round === Math.floor(index / 20) + 1 && step?.status === stepStatus(index + 1) && typeof step?.title === "string" && step.title.length > 0 && typeof step?.validation === "string" && step.validation.length > 0, `Wave 4 step ${index + 1} is invalid`);
  }
  assert(record.progress?.completedStepCount === 100 && record.progress?.plannedStepCount === 0 && list(record.progress?.inProgressStepNumbers).length === 0 && record.progress?.completedRoundCount === 5 && record.progress?.nextStepNumber === null, "Wave 4 progress is invalid");
  assert(record.evidence?.publicBoundaryDecisionPath === PUBLIC_BOUNDARY_DECISION_PATH, "Wave 4 public-boundary evidence path is invalid");
  assert(record.evidence?.handoffPreparationPath === HANDOFF_PREPARATION_PATH, "Wave 4 handoff-preparation evidence path is invalid");
  assert(record.evidence?.closeoutSequenceDecisionPath === CLOSEOUT_SEQUENCE_DECISION_PATH, "Wave 4 closeout-sequence evidence path is invalid");
  assert(record.evidence?.repositoryLocalHandoffPath === REPOSITORY_LOCAL_HANDOFF_PATH, "Wave 4 repository-local handoff evidence path is invalid");
  assert(record.evidence?.followingWaveReviewPath === WAVE_3_FOLLOWING_WAVE_REVIEW_PATH, "Wave 4 predecessor following-wave review evidence path is invalid");
  assert(record.evidence?.wave4FollowingWaveReviewPath === WAVE_4_FOLLOWING_WAVE_REVIEW_PATH, "Wave 4 following-wave review evidence path is invalid");
  assert(record.evidence?.evidenceRetentionPath === EVIDENCE_RETENTION_PATH, "Wave 4 evidence-retention path is invalid");
  assert(record.evidence?.closeoutPath === CLOSEOUT_PATH, "Wave 4 closeout path is invalid");
  assert(record.closeoutSequence?.status === "completed-repository-local-wave-closeout" && record.closeoutSequence?.decisionPath === CLOSEOUT_SEQUENCE_DECISION_PATH && record.closeoutSequence?.approvalSource === "active-thread-user-continuation-objective" && list(record.closeoutSequence?.completedSteps).join(",") === "96,97,98,99,100" && record.closeoutSequence?.activeStep === null && record.closeoutSequence?.terminalHandoffPublished === false && record.closeoutSequence?.waveCompleted === true && record.closeoutSequence?.wave5ActivationApproved === false && record.closeoutSequence?.completionEvidencePath === CLOSEOUT_PATH, "Wave 4 closeout-sequence state is invalid");
  assert(record.repositoryLocalHandoff?.status === "completed-repository-local-handoff" && record.repositoryLocalHandoff?.handoffPath === REPOSITORY_LOCAL_HANDOFF_PATH && record.repositoryLocalHandoff?.completedStep === 97 && record.repositoryLocalHandoff?.activeStep === 98 && record.repositoryLocalHandoff?.terminalHandoffPublished === false && record.repositoryLocalHandoff?.waveCompleted === false && record.repositoryLocalHandoff?.wave5ActivationApproved === false, "Wave 4 repository-local handoff state is invalid");
  assert(record.followingWaveReview?.status === "completed-following-wave-scope-review" && record.followingWaveReview?.reviewPath === WAVE_4_FOLLOWING_WAVE_REVIEW_PATH && record.followingWaveReview?.completedStep === 98 && record.followingWaveReview?.activeStep === 99 && record.followingWaveReview?.selectedWave5Capability === "seis-plugin-capability-coverage" && record.followingWaveReview?.wave5ImplementationApproved === false && record.followingWaveReview?.wave5ActivationApproved === false && record.followingWaveReview?.waveCompleted === false, "Wave 4 following-wave review state is invalid");
  assert(record.evidenceRetention?.status === "completed-public-evidence-retention" && record.evidenceRetention?.retentionPath === EVIDENCE_RETENTION_PATH && record.evidenceRetention?.completedStep === 99 && record.evidenceRetention?.activeStep === 100 && record.evidenceRetention?.deletionPerformed === false && record.evidenceRetention?.externalStorageUsed === false && record.evidenceRetention?.waveCompleted === false && record.evidenceRetention?.wave5ImplementationApproved === false && record.evidenceRetention?.wave5ActivationApproved === false, "Wave 4 evidence-retention state is invalid");
  assert(record.repositoryLocalCloseout?.status === "completed-repository-local-wave-closeout" && record.repositoryLocalCloseout?.closeoutPath === CLOSEOUT_PATH && record.repositoryLocalCloseout?.completedStep === 100 && record.repositoryLocalCloseout?.nextActiveWave === null && record.repositoryLocalCloseout?.nextWaveStatus === "planned-gated" && record.repositoryLocalCloseout?.nextWaveSelectedCapability === "seis-plugin-capability-coverage" && record.repositoryLocalCloseout?.nextWaveImplementationApproved === false && record.repositoryLocalCloseout?.nextWaveActivationApproved === false && record.repositoryLocalCloseout?.terminalHandoffPublished === false && record.repositoryLocalCloseout?.publicReleaseAllowed === false, "Wave 4 repository-local closeout state is invalid");
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
