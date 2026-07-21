#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-5-program.json";
const CANDIDATE = "seis-plugin-capability-coverage";
const PATHS = Object.freeze({
  activationDecision: "content/development/seis-public-plugin-wave-5-activation-decision.json",
  capabilityEvidence: "content/development/seis-plugin-capability-coverage.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  marketplace: ".agents/plugins/marketplace.json",
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
      "Fix the only allowed repo marketplace path below the SEIS repository root.",
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
      "Implement fixed app-owned marketplace-card parsing.",
      "Implement aggregate source, catalog, matrix, and marketplace reconciliation counts.",
      "Implement deterministic declared category-count summaries.",
      "Implement deterministic declared capability-token frequency summaries.",
      "Report aggregate projection drift as attention without returning plugin names.",
      "Expose status, report, and committed-evidence MCP tools with no arbitrary path access.",
      "Add focused fixture, safety, redaction, MCP, and non-mutation tests.",
      "Generate the bounded public capability-coverage evidence record.",
      "Register the candidate through the app-owned public source manifest projection.",
      "Refresh the public application catalog projection.",
      "Refresh the local status matrix projection.",
      "Refresh the one public SEIS Repo marketplace card projection.",
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
    name: "Public-contract and integration maintenance",
    objective: "Keep the coverage package interoperable with existing registry and marketplace contracts without expanding its authority.",
    tasks: [
      "Review catalog search wording for the coverage package.",
      "Review app source ownership documentation for the coverage package.",
      "Review matrix status behavior under registry attention conditions.",
      "Review public install-state language for static metadata packages.",
      "Review public runtime-state language for status-only tools.",
      "Review MCP permission ledger wording for fixed registry reads.",
      "Review public-family report language for app-owned package counts.",
      "Review lifecycle metadata for the extra public card.",
      "Review provenance metadata for source and artifact safety.",
      "Review external-install proof boundaries without claiming external proof.",
      "Review secret scan coverage for the new package files.",
      "Review documentation link integrity for the Wave 5 evidence chain.",
      "Review test coverage gaps and create explicit follow-up tasks.",
      "Review rollback instructions for package and evidence removal.",
      "Review provider, deployment, signing, and release non-claims.",
      "Review accessibility and clarity of marketplace metadata.",
      "Review performance implications of bounded JSON parsing.",
      "Record a public-contract checkpoint with current validation evidence.",
      "Prepare the next non-destructive continuation sequence.",
      "Confirm no protected-default-branch write is implied by repository evidence.",
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
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const predecessorReview = readJson(PATHS.predecessorReview);
  const predecessorCloseout = readJson(PATHS.predecessorCloseout);
  const sourceEntries = list(sourceManifest.plugins);
  const catalogEntries = list(catalog.plugins);
  const matrixEntries = list(matrix.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const steps = ROUND_DEFINITIONS.flatMap((round, roundIndex) => round.tasks.map((title, taskIndex) => {
    const number = (roundIndex * 20) + taskIndex + 1;
    return {
      number,
      round: roundIndex + 1,
      title,
      status: number <= 30 ? "completed" : number === 31 ? "in-progress" : "planned",
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
      && marketplaceEntries.filter((entry) => entry?.name === CANDIDATE && entry?.source?.path === `./plugins/seis-core/${CANDIDATE}`).length === 1,
    coverageEvidence: capabilityEvidence?.id === CANDIDATE
      && capabilityEvidence?.status === "ready-public-static-capability-coverage-evidence"
      && capabilityEvidence?.activation?.activationApproved === true
      && capabilityEvidence?.audit?.ok === true
      && capabilityEvidence?.audit?.reconciliation?.reconciled === true,
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
      outcome: "One public repository package now reports bounded, derived coverage across four fixed public SEIS Repo registry projections. The first 30 Wave 5 steps are implemented and validated locally; step 31 starts the next resilience-review tranche. No personal marketplace, external write, network, secret, installation, runtime, provider, deployment, signing, or release claim is authorized.",
      entryRule: "Wave 4 closed with a historical candidate review, the separate Wave 5 activation decision records current user authority and bounded scope, and the active package has current public source, catalog, matrix, marketplace, evidence, and deny-by-default permission projections.",
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
      candidatePublicCardExists: true,
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
      status: index === 0 ? "completed" : index === 1 ? "in-progress" : "planned",
      steps: Array.from({ length: 20 }, (_, taskIndex) => (index * 20) + taskIndex + 1),
    })),
    steps,
    progress: {
      completedStepCount: 30,
      plannedStepCount: 69,
      inProgressStepNumbers: [31],
      completedRoundCount: 1,
      nextStepNumber: 31,
      firstDeliveryTranche: {
        totalSteps: 30,
        status: "completed-repository-local",
        scope: "activation, fixed-registry runtime, tests, public projections, evidence, and validation",
      },
    },
    evidence: PATHS,
    checks,
    validation: [
      "npm run check:seis-public-plugin-wave-5-activation-decision",
      "npm run check:seis-plugin-capability-coverage",
      "npm run check:seis-public-plugin-wave-5-program",
      "npm run check:seis-public-plugin-continuity",
      "npm run check:seis-repo-marketplace",
      "node --test plugins/seis-core/test/plugin-capability-coverage.test.mjs",
      "node --test plugins/seis-core/test/plugin-capability-coverage-evidence.test.mjs",
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
      scope: "Revert the focused Wave 5 package, generated evidence, public card projection, and program records on the feature branch; no external state or data migration exists.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function validationFor(number) {
  if (number <= 20) return "focused runtime, MCP, and fixture test";
  if (number <= 30) return "public projection, evidence, and repository validation";
  return "future evidence required before completion";
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-5-program" && record.goalId === "SEIS-GOAL-021" && record.status === "in-progress" && record.maturity === "prototype", "record identity is invalid");
  assert(record.wave?.number === 5 && record.wave?.totalSteps === 100 && record.wave?.roundCount === 5 && record.wave?.stepsPerRound === 20, "wave shape is invalid");
  assert(record.scope?.selectedCapability === CANDIDATE && record.activationGate?.status === "implemented-repository-local" && record.activationGate?.implementationStarted === true && record.activationGate?.candidatePackageExists === true && record.activationGate?.candidatePublicCardExists === true && record.activationGate?.publicReleaseApproved === false, "activation gate is invalid");
  assert(list(record.rounds).length === 5 && list(record.steps).length === 100 && record.steps.every((step, index) => step?.number === index + 1 && step?.round === Math.floor(index / 20) + 1 && typeof step?.title === "string" && step.title.length > 0), "step plan is invalid");
  assert(record.steps.filter((step) => step.status === "completed").length === 30 && list(record.steps.filter((step) => step.status === "in-progress")).map((step) => step.number).join(",") === "31" && record.steps.filter((step) => step.status === "planned").length === 69, "step status plan is invalid");
  assert(record.progress?.completedStepCount === 30 && record.progress?.plannedStepCount === 69 && list(record.progress?.inProgressStepNumbers).join(",") === "31" && record.progress?.completedRoundCount === 1 && record.progress?.nextStepNumber === 31 && record.progress?.firstDeliveryTranche?.totalSteps === 30 && record.progress?.firstDeliveryTranche?.status === "completed-repository-local", "progress is invalid");
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
