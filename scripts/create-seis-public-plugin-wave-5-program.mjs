#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-5-program.json";
const CANDIDATE = "seis-plugin-capability-coverage";
const COMPLETED_STEP_COUNT = 80;
const NEXT_STEP_NUMBER = 81;
const PLANNED_STEP_COUNT = 19;
const COMPLETED_ROUND_COUNT = 4;
const PATHS = Object.freeze({
  activationDecision: "content/development/seis-public-plugin-wave-5-activation-decision.json",
  capabilityEvidence: "content/development/seis-plugin-capability-coverage.json",
  round3Checkpoint: "content/development/seis-public-plugin-wave-5-round-3-checkpoint.json",
  consolidation: "content/development/seis-public-plugin-consolidation.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  marketplace: ".agents/plugins/marketplace.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  predecessorReview: "content/development/seis-public-plugin-wave-4-following-wave-review.json",
  predecessorCloseout: "content/development/seis-public-plugin-wave-4-closeout.json",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const ROUND_DEFINITIONS = Object.freeze([
  {
    name: "Activation and bounded capability contract",
    objective: "Turn the selected public-only candidate into one fixed-registry package without widening its permissions or data scope.",
    tasks: [
      "Reconfirm the completed Wave 4 scope review and public-only candidate boundary.",
      "Record the separate Wave 5 activation decision with current user authority.",
      "Record the five-round, 100-step Wave 5 program and first 30-step delivery tranche.",
      "Create the public package manifest with a fixed-registry coverage description.",
      "Create the public profile with deny-by-default permission declarations.",
      "Create the local MCP manifest with one repo-local Node entrypoint.",
      "Document the static-only safety boundary in the public skill.",
      "Fix the only allowed source manifest path below the SEIS repository root.",
      "Fix the only allowed catalog path below the SEIS repository root.",
      "Fix the only allowed matrix path below the SEIS repository root.",
      "Fix the only allowed repo marketplace and public bundle-catalog paths below the SEIS repository root.",
      "Refuse arbitrary roots and paths before registry access.",
      "Require regular files and refuse symlinks before registry reads.",
      "Enforce the 512 KiB registry byte limit before JSON parsing.",
      "Detect machine-path markers without returning raw source values.",
      "Detect credential-assignment markers without returning raw source values.",
      "Define safe plugin-name normalization for aggregate reconciliation.",
      "Define safe category and capability-token normalization for aggregate output.",
      "Keep raw registry JSON, descriptions, and capability phrases outside the output contract.",
      "Keep write, network, secret, provider, installation, signing, deployment, and release claims disabled.",
    ],
  },
  {
    name: "Coverage implementation and public projection",
    objective: "Complete the first 30 repository-local steps: deterministic coverage analysis, public card projection, evidence, and validation.",
    tasks: [
      "Implement fixed source-manifest plugin-name parsing.",
      "Implement fixed catalog category and capability-token parsing.",
      "Implement fixed matrix plugin-name parsing.",
      "Implement fixed optional bundle-catalog membership parsing.",
      "Implement aggregate source, catalog, matrix, bundle-member, and marketplace-card reconciliation counts.",
      "Implement deterministic declared category-count summaries.",
      "Implement deterministic declared capability-token frequency summaries.",
      "Report aggregate projection drift as attention without returning plugin names.",
      "Expose status, report, and committed-evidence MCP tools with no arbitrary path access.",
      "Add focused fixture, safety, redaction, MCP, and non-mutation tests.",
      "Generate the bounded public capability-coverage evidence record.",
      "Register the candidate through the app-owned public source manifest projection.",
      "Refresh the public application catalog projection.",
      "Refresh the local status matrix projection.",
      "Refresh the exact optional SEIS Repo bundle membership projection.",
      "Refresh public-family, lifecycle, installation, runtime, permission, and provenance projections.",
      "Reconcile app and public-card count validators in one change.",
      "Run plugin-creator structural validation for the repo-backed package.",
      "Run focused package, evidence, and Wave 5 program checks.",
      "Run the full public marketplace and SEIS validation suite before the feature-branch checkpoint.",
    ],
  },
  {
    name: "Coverage interpretation and resilience review",
    objective: "Extend only after the first public checkpoint proves the static contract remains clear, bounded, and useful.",
    tasks: [
      "Review aggregate coverage categories for clarity without collecting new private data.",
      "Review capability-token normalization for stable public terminology.",
      "Review attention-state wording for actionable but non-alarming output.",
      "Test malformed source-manifest structures without raw echoes.",
      "Test malformed catalog structures without raw echoes.",
      "Test malformed matrix structures without raw echoes.",
      "Test malformed marketplace structures without raw echoes.",
      "Test duplicate plugin-name handling across each fixed projection.",
      "Test category and capability-token count limits.",
      "Test fixed-root validation from the package entrypoint.",
      "Test evidence output when the committed record is unavailable.",
      "Review safe output size bounds for large capability vocabularies.",
      "Document registry evolution and backward-compatibility assumptions.",
      "Review read-only permission boundaries against the public profile.",
      "Review source, catalog, matrix, and marketplace count consistency.",
      "Review terminology against SEIS Repo public-marketplace policy.",
      "Record a resilience checkpoint with no external runtime claim.",
      "Inspect the feature-branch worktree and generated evidence drift.",
      "Prepare a focused reversible continuation commit if the next tranche is approved.",
      "Record the next active Wave 5 step and its evidence requirement.",
    ],
  },
  {
    name: "Public-install consolidation and integration maintenance",
    objective: "Keep one canonical public install while grouping overlapping discovery cards into existing SEIS source and suite boundaries without expanding authority or silently deleting packages.",
    tasks: [
      "Inventory the canonical install, embedded modules, app-owned packages, and topic-card surfaces without reading a personal marketplace.",
      "Record the one-install default policy so public discovery cards are not interpreted as a 600-plugin requirement.",
      "Measure public discovery-card counts and category coverage using checked-in SEIS Repo metadata only.",
      "Detect exact normalized capability-profile overlaps as merge-review candidates without exposing private data.",
      "Separate exact overlaps from complementary specialist packages before any consolidation decision.",
      "Define which overlapping skills can live inside an existing canonical package or SEIS-Agent lane.",
      "Require compatibility, ownership, rollback, and human approval before any physical package merge or deletion.",
      "Keep direct source packages optional and preserve one canonical default install target.",
      "Treat topic cards as discoverability metadata rather than default installations.",
      "Review public install-state wording so availability never implies recommended bulk installation.",
      "Review source ownership and redirect requirements for any future consolidation.",
      "Review public marketplace category wording for clear bundle discovery.",
      "Generate a deterministic public consolidation record and stale-artifact check.",
      "Add focused tests for counts, grouping boundaries, and no automatic physical merge.",
      "Link the consolidation record to the existing unified-suite policy rather than creating a second install root.",
      "Review documentation links, rollout language, and the no-bulk-install user journey.",
      "Review secret, provider, deployment, signing, and release non-claims for the consolidation surface.",
      "Record a consolidation checkpoint with current validation evidence.",
      "Prepare the next reversible continuation sequence without changing protected branches.",
      "Confirm any future physical merge remains explicitly approved and separately reversible.",
    ],
  },
  {
    name: "Wave 5 closeout and next-series decision",
    objective: "Finish only when all remaining steps have current evidence; keep future series activation separate and human-authorized.",
    tasks: [
      "Run the dedicated Wave 5 program and activation-decision checks.",
      "Run the public SEIS Repo marketplace validation with terminology checks.",
      "Run complete plugin tests and disclose skipped checks honestly.",
      "Run repository web and governance checks applicable to the change.",
      "Run whitespace, generated-artifact, and public-safety drift checks.",
      "Inspect the scoped diff and worktree before any closeout commit.",
      "Create a focused reversible commit after required validation succeeds.",
      "Push only the current feature branch when authorized and available.",
      "Verify the remote feature-branch reference without claiming a merge.",
      "Record protected-branch, review, code-scanning, and signature-policy observations honestly.",
      "Record count reconciliation only when the public card is actually present.",
      "Record no independent install, runtime, provider, deployment, signing, or release claim.",
      "Review whether any external proof or human approval remains required.",
      "Create follow-up goals for deferred environment or runtime validation.",
      "Retain all public evidence and rollback artifacts until closeout is current.",
      "Prepare a repository-local handoff with exact validation evidence.",
      "Review the next 30-step scope and risk decision after Wave 5 completion.",
      "Keep the following five-wave series gated until current user authority exists.",
      "Produce the final Wave 5 goal report with exact repository state.",
      "Mark Wave 5 complete only after all prior closeout evidence is current.",
    ],
  },
]);

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-5-program`);
    process.exit(1);
  }
  console.log(`SEIS public plugin Wave 5 program check passed (${record.progress.completedStepCount} completed, step ${record.progress.nextStepNumber} in progress).`);
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with the first ${record.progress.completedStepCount} Wave 5 steps completed.`);
}

function buildRecord() {
  const activationDecision = readJson(PATHS.activationDecision);
  const capabilityEvidence = readJson(PATHS.capabilityEvidence);
  const round3Checkpoint = readJson(PATHS.round3Checkpoint);
  const consolidation = readJson(PATHS.consolidation);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const predecessorReview = readJson(PATHS.predecessorReview);
  const predecessorCloseout = readJson(PATHS.predecessorCloseout);
  const sourceEntries = list(sourceManifest.plugins);
  const catalogEntries = list(catalog.plugins);
  const matrixEntries = list(matrix.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const applicationBundleMembers = list(bundleCatalog.bundles)
    .filter((bundle) => bundle?.family === "application")
    .flatMap((bundle) => list(bundle?.memberNames));
  const candidateBundles = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(CANDIDATE));
  const candidateBundleId = candidateBundles.length === 1 ? candidateBundles[0].id : null;
  const steps = ROUND_DEFINITIONS.flatMap((round, roundIndex) => round.tasks.map((title, taskIndex) => {
    const number = (roundIndex * 20) + taskIndex + 1;
    return {
      number,
      round: roundIndex + 1,
      title,
      status: number <= COMPLETED_STEP_COUNT ? "completed" : number === NEXT_STEP_NUMBER ? "in-progress" : "planned",
      validation: validationFor(number),
    };
  }));
  const checks = {
    predecessorScopeReview: predecessorReview?.status === "completed-following-wave-scope-review"
      && predecessorReview?.followingWaveDecision?.selectedCapability === CANDIDATE
      && predecessorReview?.followingWaveDecision?.activationApproved === false,
    predecessorCloseout: predecessorCloseout?.status === "completed-repository-local-wave-closeout"
      && predecessorCloseout?.completion?.nextWaveSelectedCapability === CANDIDATE
      && predecessorCloseout?.completion?.nextWaveActivationApproved === false,
    activationDecision: activationDecision?.status === "approved-public-local-wave-5-activation"
      && activationDecision?.decision?.selectedCapability === CANDIDATE
      && activationDecision?.decision?.activationApproved === true
      && activationDecision?.decision?.implementationApproved === true,
    publicCandidateProjection: sourceEntries.filter((entry) => entry?.name === CANDIDATE).length === 1
      && catalogEntries.filter((entry) => entry?.name === CANDIDATE && entry?.status?.state === "ready").length === 1
      && matrixEntries.filter((entry) => entry?.name === CANDIDATE && entry?.status === "ready" && entry?.ok === true).length === 1
      && candidateBundles.length === 1
      && marketplaceEntries.filter((entry) => entry?.name === candidateBundleId && entry?.source?.path === `./plugins/seis-bundles/${candidateBundleId}`).length === 1,
    coverageEvidence: capabilityEvidence?.id === CANDIDATE
      && capabilityEvidence?.status === "ready-public-static-capability-coverage-evidence"
      && capabilityEvidence?.activation?.activationApproved === true
      && capabilityEvidence?.audit?.ok === true
      && capabilityEvidence?.audit?.reconciliation?.reconciled === true,
    fixedRegistrySafetyCoverage: capabilityEvidence?.fixedRegistrySafetyCoverage?.status === "ready-fixed-registry-safety-coverage"
      && list(capabilityEvidence?.fixedRegistrySafetyCoverage?.coveredFailureModes).length === 7,
    outputBounds: capabilityEvidence?.outputBounds?.aggregateOnly === true
      && capabilityEvidence?.outputBounds?.maxReturnedCategoryKinds === 128
      && capabilityEvidence?.outputBounds?.maxReturnedCapabilityTokenKinds === 256
      && capabilityEvidence?.outputBounds?.maxReturnedFindings === 64
      && capabilityEvidence?.outputBounds?.categoryCountsTruncated === false
      && capabilityEvidence?.outputBounds?.capabilityTokenFrequenciesTruncated === false,
    round3Checkpoint: round3Checkpoint?.id === "seis-public-plugin-wave-5-round-3-checkpoint"
      && round3Checkpoint?.status === "completed-repository-local-round-3-checkpoint"
      && list(round3Checkpoint?.completedSteps).join(",") === Array.from({ length: 20 }, (_, index) => index + 41).join(",")
      && round3Checkpoint?.boundedCoverage?.sourcePluginCount === sourceEntries.length
      && round3Checkpoint?.boundedCoverage?.catalogPluginCount === catalogEntries.length
      && round3Checkpoint?.boundedCoverage?.matrixPluginCount === matrixEntries.length
      && round3Checkpoint?.boundedCoverage?.bundleApplicationMemberCount === applicationBundleMembers.length
      && round3Checkpoint?.boundedCoverage?.marketplacePublicCardCount === marketplaceEntries.length
      && Object.values(round3Checkpoint?.checks || {}).every(Boolean)
      && Object.values(round3Checkpoint?.externalClaims || {}).every((value) => value === false),
    consolidationInventory: consolidation?.id === "seis-public-plugin-consolidation"
      && consolidation?.goalId === "SEIS-GOAL-0024"
      && consolidation?.status === "implemented-repository-local-not-published"
      && consolidation?.installationPolicy?.canonicalInstallId === "seis-ai-agent@seis-repo"
      && consolidation?.installationPolicy?.defaultInstallMode === "single-public-plugin"
      && consolidation?.installationPolicy?.publicDefaultInstallCount === 1
      && consolidation?.inventory?.publicCardCount === marketplaceEntries.length
      && consolidation?.inventory?.applicationSourcePluginCount === sourceEntries.length
      && consolidation?.inventory?.applicationCatalogPluginCount === catalogEntries.length
      && consolidation?.consolidationReview?.automaticPhysicalMerge === false
      && consolidation?.consolidationReview?.physicalMergePerformed === false
      && consolidation?.bundlePlan?.status === "implemented-repository-local-not-published"
      && consolidation?.bundlePlan?.maximumBundleSize === 15
      && consolidation?.bundlePlan?.targetMarketplaceCardCount === 34
      && consolidation?.bundlePlan?.marketplaceProjectionGenerated === true
      && consolidation?.bundlePlan?.sourcePackagesDeleted === false
      && consolidation?.bundlePlan?.exactOnceCoverage === true
      && Object.values(consolidation?.checks || {}).every(Boolean)
      && Object.values(consolidation?.externalClaims || {}).every((value) => value === false),
    permissions: list(capabilityEvidence?.safety?.write).length === 0
      && list(capabilityEvidence?.safety?.network).length === 0
      && list(capabilityEvidence?.safety?.secrets).length === 0,
    publicBoundary: capabilityEvidence?.publicBoundary?.marketplaceName === "seis-repo"
      && capabilityEvidence?.publicBoundary?.personalMarketplaceRead === false
      && capabilityEvidence?.publicBoundary?.personalMarketplaceMutation === false
      && capabilityEvidence?.publicBoundary?.network === false
      && capabilityEvidence?.publicBoundary?.externalWrites === false
      && capabilityEvidence?.publicBoundary?.secrets === false
      && capabilityEvidence?.publicBoundary?.publicReleaseAllowed === false,
  };
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-5-program",
    goalId: "SEIS-GOAL-021",
    parentProgramId: "seis-public-plugin-expansion-program",
    status: "in-progress",
    maturity: "prototype",
    createdAt: "2026-07-21",
    updatedAt: "2026-07-21",
    wave: {
      number: 5,
      totalSteps: 100,
      roundCount: 5,
      stepsPerRound: 20,
      predecessor: {
        scopeReviewPath: PATHS.predecessorReview,
        closeoutPath: PATHS.predecessorCloseout,
        requiredCapability: CANDIDATE,
      },
    },
    scope: {
      repositories: ["SEIS"],
      selectedCapability: CANDIDATE,
      outcome: "One public repository package now reports bounded, derived coverage across five fixed public SEIS Repo registry projections. The first 80 Wave 5 steps are implemented and validated locally; 381 discovery cards are projected as one canonical SEIS-Agent card plus 33 optional bounded bundle cards without deleting source packages. No personal marketplace, external write, network, secret, installation, provider, deployment, signing, publication, or release claim is authorized.",
      entryRule: "Wave 4 closed with a historical candidate review, the separate Wave 5 activation decision records current user authority and bounded scope, and the active package has current source, catalog, matrix, bundle membership, marketplace, evidence, and deny-by-default permission projections.",
    },
    nonGoals: [
      "Adding a second Wave 5 package or card without a separate capability decision.",
      "Reading or mutating a personal marketplace, using a network, granting writes or secrets, or changing protected branches.",
      "Returning raw registry content, raw descriptions, raw capability phrases, raw plugin names, absolute paths, or machine-specific paths.",
      "Treating static coverage as installation, MCP activation, runtime, provider, deployment, signing, or release proof.",
    ],
    activationGate: {
      status: "implemented-repository-local",
      activationDecisionPath: PATHS.activationDecision,
      implementationStarted: true,
      candidatePackageExists: true,
      candidateDirectPublicCardExists: false,
      candidateBundleId,
      candidateBundleCardExists: true,
      publicReleaseApproved: false,
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
      protectedDefaultBranchWrites: false,
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
    rounds: ROUND_DEFINITIONS.map((round, index) => ({
      round: index + 1,
      name: round.name,
      objective: round.objective,
      status: index < COMPLETED_ROUND_COUNT ? "completed" : index === COMPLETED_ROUND_COUNT ? "in-progress" : "planned",
      steps: Array.from({ length: 20 }, (_, taskIndex) => (index * 20) + taskIndex + 1),
    })),
    steps,
    progress: {
      completedStepCount: COMPLETED_STEP_COUNT,
      plannedStepCount: PLANNED_STEP_COUNT,
      inProgressStepNumbers: [NEXT_STEP_NUMBER],
      completedRoundCount: COMPLETED_ROUND_COUNT,
      nextStepNumber: NEXT_STEP_NUMBER,
      firstDeliveryTranche: {
        totalSteps: 30,
        status: "completed-repository-local",
        scope: "activation, fixed-registry runtime, tests, public projections, evidence, and validation",
      },
      secondDeliveryTranche: {
        totalSteps: 20,
        completedSteps: 20,
        stepRange: "21-40",
        status: "completed-repository-local",
        scope: "coverage implementation, public registry projections, evidence generation, structural validation, focused checks, and full repository-local validation",
      },
      thirdDeliveryTranche: {
        totalSteps: 20,
        completedSteps: 20,
        stepRange: "41-60",
        status: "completed-repository-local",
        scope: "coverage interpretation, malformed-input resilience, fixed-root and unavailable-evidence handling, aggregate output bounds, public-contract review, and checkpoint evidence",
      },
      fourthDeliveryTranche: {
        totalSteps: 20,
        completedSteps: 20,
        stepRange: "61-80",
        status: "completed-repository-local",
        scope: "curated capability-package projection, exact-once coverage, source retention, bounded MCP runtimes, implementation documentation, and focused validation",
      },
    },
    evidence: PATHS,
    checks,
    validation: [
      "npm run check:seis-public-plugin-wave-5-activation-decision",
      "npm run check:seis-plugin-capability-coverage",
      "npm run check:seis-public-plugin-wave-5-round-3-checkpoint",
      "npm run check:seis-public-plugin-consolidation",
      "npm run check:seis-public-plugin-capability-packages",
      "npm run check:seis-public-plugin-wave-5-program",
      "npm run check:seis-public-plugin-continuity",
      "npm run check:seis-repo-marketplace",
      "node --test plugins/seis-core/test/plugin-capability-coverage.test.mjs",
      "node --test plugins/seis-core/test/plugin-capability-coverage-evidence.test.mjs",
      "node --test plugins/seis-core/test/public-plugin-consolidation.test.mjs",
      "node --test plugins/seis-core/test/public-plugin-bundles.test.mjs",
    ],
    risks: [
      {
        id: "RISK-W5-001",
        status: "tracked",
        description: "Coverage summaries could be confused with the validators they complement.",
        mitigation: "Keep explicit boundaries, fixed inputs, aggregate-only outputs, and separate existing validators.",
      },
      {
        id: "RISK-W5-002",
        status: "tracked",
        description: "Future registry schema growth could exceed the bounded parser assumptions.",
        mitigation: "Fail closed to attention, retain fixture tests, and require a new scoped decision before widening the contract.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 5 package, generated evidence, optional bundle projection, and program records on the feature branch; retained source packages remain intact and no external state or data migration exists.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function validationFor(number) {
  if (number <= 20) return "focused runtime, MCP, and fixture test";
  if (number <= 40) return "public projection, structural, evidence, and repository validation";
  if (number <= 60) return "coverage interpretation, resilience, output-bound, and public-contract validation";
  if (number <= 80) return "capability-package projection, exact-once coverage, source-retention, and bounded-runtime validation";
  return "future evidence required before completion";
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-5-program" && record.goalId === "SEIS-GOAL-021" && record.status === "in-progress" && record.maturity === "prototype", "record identity is invalid");
  assert(record.wave?.number === 5 && record.wave?.totalSteps === 100 && record.wave?.roundCount === 5 && record.wave?.stepsPerRound === 20, "wave shape is invalid");
  assert(record.scope?.selectedCapability === CANDIDATE && record.activationGate?.status === "implemented-repository-local" && record.activationGate?.implementationStarted === true && record.activationGate?.candidatePackageExists === true && record.activationGate?.candidateDirectPublicCardExists === false && typeof record.activationGate?.candidateBundleId === "string" && record.activationGate?.candidateBundleCardExists === true && record.activationGate?.publicReleaseApproved === false, "activation gate is invalid");
  assert(list(record.rounds).length === 5 && list(record.steps).length === 100 && record.steps.every((step, index) => step?.number === index + 1 && step?.round === Math.floor(index / 20) + 1 && typeof step?.title === "string" && step.title.length > 0), "step plan is invalid");
  assert(record.steps.filter((step) => step.status === "completed").length === COMPLETED_STEP_COUNT && list(record.steps.filter((step) => step.status === "in-progress")).map((step) => step.number).join(",") === String(NEXT_STEP_NUMBER) && record.steps.filter((step) => step.status === "planned").length === PLANNED_STEP_COUNT, "step status plan is invalid");
  assert(list(record.rounds).slice(0, COMPLETED_ROUND_COUNT).every((round) => round?.status === "completed") && record.rounds?.[COMPLETED_ROUND_COUNT]?.status === "in-progress", "round status plan is invalid");
  assert(record.progress?.completedStepCount === COMPLETED_STEP_COUNT && record.progress?.plannedStepCount === PLANNED_STEP_COUNT && list(record.progress?.inProgressStepNumbers).join(",") === String(NEXT_STEP_NUMBER) && record.progress?.completedRoundCount === COMPLETED_ROUND_COUNT && record.progress?.nextStepNumber === NEXT_STEP_NUMBER && record.progress?.firstDeliveryTranche?.totalSteps === 30 && record.progress?.firstDeliveryTranche?.status === "completed-repository-local" && record.progress?.secondDeliveryTranche?.stepRange === "21-40" && record.progress?.secondDeliveryTranche?.status === "completed-repository-local" && record.progress?.thirdDeliveryTranche?.stepRange === "41-60" && record.progress?.thirdDeliveryTranche?.status === "completed-repository-local" && record.progress?.fourthDeliveryTranche?.stepRange === "61-80" && record.progress?.fourthDeliveryTranche?.status === "completed-repository-local", "progress is invalid");
  assert(Object.values(record.checks || {}).every(Boolean), "required Wave 5 checks are not current");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.protectedDefaultBranchWrites === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "record must not contain a machine-specific path");
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 5 program: ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 5 program: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
