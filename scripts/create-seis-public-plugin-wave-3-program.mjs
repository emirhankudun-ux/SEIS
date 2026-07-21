#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-program.json";
const INITIAL_PROGRAM_PATH = "content/development/seis-public-plugin-expansion-program.json";
const WAVE_2_PROGRAM_PATH = "content/development/seis-public-plugin-wave-2-program.json";
const WAVE_2_HANDOFF_PATH = "content/development/seis-public-plugin-wave-2-handoff.json";
const ROUND_3_CHECKPOINT_PATH = "content/development/seis-public-plugin-wave-3-round-3-checkpoint.json";
const ROUND_4_REVIEW_PATH = "content/development/seis-public-plugin-wave-3-round-4-review.json";
const HANDOFF_READINESS_PATH = "content/development/seis-public-plugin-wave-3-handoff-readiness.json";
const FINAL_VALIDATION_PATH = "content/development/seis-public-plugin-wave-3-final-validation.json";
const SELECTED_CAPABILITY = "seis-swift-concurrency-audit";
const COMPLETED_STEP_COUNT = 81;
const IN_PROGRESS_STEP_NUMBER = 82;

const ROUND_DEFINITIONS = Object.freeze([
  {
    name: "Evidence-led discovery",
    objective: "Inspect current public evidence and identify one real, non-duplicative public capability gap before any package source is created.",
    tasks: [
      "Confirm the completed Wave 2 program, its repository-local handoff requirement, and the public-only boundary.",
      "Confirm the current feature branch and the prohibition on personal marketplace access.",
      "Read the Wave 2 risk, rollback, native-validation, and external-proof limits before selecting work.",
      "Inventory current public plugin capabilities by responsibility rather than by card count.",
      "Inventory active attention findings, known gaps, and current repository-local evidence.",
      "Identify candidate work that adds measurable value without duplicating an existing public package.",
      "Reject candidates that need private context, credentials, external writes, or live provider access.",
      "Reject candidates whose value depends on an unverified release, installation, or deployment claim.",
      "Record candidate input paths, data classification, and bounded output expectations.",
      "Record candidate non-goals, public/private boundary, and no-network default.",
      "Check Apple-first, AI-core, accessibility, and documentation impact for each viable candidate.",
      "Check whether a focused existing plugin extension is safer than a new public card.",
      "Review package ownership and source-manifest placement for any proposed capability.",
      "Review testability and deterministic validation before a capability is selected.",
      "Review release, provenance, lifecycle, and install-boundary implications without promotion.",
      "Review no-personal terminology and public SEIS Repo naming for all planned evidence.",
      "Run bounded source, catalog, matrix, and marketplace discovery checks.",
      "Run an evidence safety scan for secret-like and machine-specific values.",
      "Publish a capability-selection decision or explicitly keep the selection empty.",
      "Close discovery only when the decision has measurable acceptance criteria and rollback.",
    ],
  },
  {
    name: "Bounded capability design",
    objective: "Design only the approved capability with least privilege, explicit limitations, and testable local contracts.",
    tasks: [
      "Confirm the selected capability is approved by the Wave 3 discovery decision.",
      "Define its repository owner, source root, public card behavior, and non-goals.",
      "Define fixed relative input paths and reject arbitrary workspace paths.",
      "Define maximum traversal, text, record, and response bounds where source inspection is required.",
      "Define read-only, no-network, no-secret, and no-external-write permissions by default.",
      "Define output categories that distinguish ready, attention, unavailable, and approval-required states.",
      "Define no-live-provider, no-deployment, and no-public-release wording where applicable.",
      "Define source and generated-evidence boundaries that prevent raw private values from being returned.",
      "Define deterministic fixtures for positive, negative, malformed, and boundary scenarios.",
      "Define accessible, concise human-facing status language for the public card.",
      "Define MCP tool schemas only when they remain bounded and read-only.",
      "Define source-manifest, catalog, matrix, registry, and integration update requirements.",
      "Define lifecycle, provenance, fresh-task, and release-boundary inputs before implementation.",
      "Define no-duplicate and no-unrelated-refactor checks for the change set.",
      "Define validation commands, expected evidence, and skipped-check disclosure rules.",
      "Define the rollback scope as a focused feature-branch revert with no data migration.",
      "Review the design against Apple-first and Swift-first long-term architecture constraints.",
      "Review security, privacy, accessibility, and performance effects before source scaffolding.",
      "Create a focused implementation plan only after the design contract validates.",
      "Keep the round planned if a safe, non-duplicative capability cannot be selected.",
    ],
  },
  {
    name: "Approved implementation and integration",
    objective: "Implement at most one approved, bounded public capability and reconcile every repository-local contract it affects.",
    tasks: [
      "Create a public package only when the Wave 3 capability decision selects one.",
      "Add public metadata, profile, and skill content with honest local-only limits.",
      "Implement only deterministic, bounded runtime behavior required by the approved scope.",
      "Add positive tests that prove the documented local contract.",
      "Add negative tests that prove path, size, malformed-input, and permission refusal boundaries.",
      "Validate the package structure with the plugin-creator validator.",
      "Generate bounded repository-local evidence without raw source, machine path, or secret leakage.",
      "Register the package only in the public SEIS Repo marketplace if a card is approved.",
      "Refresh source-manifest, catalog, matrix, registry, and unified-suite contracts when the package changes.",
      "Refresh agent integration and requested-capability coverage when applicable.",
      "Refresh lifecycle, provenance, fresh-task, install, and release-boundary evidence when applicable.",
      "Validate empty write, network, and secret permission grants for the changed public surface.",
      "Validate public SEIS Repo terminology and absence of visible personal labels.",
      "Validate project manifest counts only when a public card was actually added.",
      "Validate documentation and roadmap references for the selected capability.",
      "Run focused runtime and MCP tests before broad marketplace checks.",
      "Run source, catalog, matrix, marketplace, and integration regressions.",
      "Run baseline SEIS checks applicable to the changed source surface.",
      "Record external validation gaps without turning them into success claims.",
      "Prepare a focused feature-branch checkpoint only after all local gates pass.",
    ],
  },
  {
    name: "Resilience and public-contract review",
    objective: "Review the approved scope for drift, safety, accessibility, performance, and evidence quality before handoff.",
    tasks: [
      "Re-run capability overlap review after implementation to detect accidental duplication.",
      "Review fixed-path and path-escape refusal behavior with focused fixtures.",
      "Review source traversal, byte, record, and output limits for practical local safety.",
      "Review empty, malformed, stale, unavailable, and approval-required state handling.",
      "Review accessible naming, keyboard semantics, focus behavior, and reduced-motion impact where UI changes exist.",
      "Review performance impact and avoid broad scans or heavyweight dependencies.",
      "Review output for raw source, machine-path, secret-like, or private-context leakage.",
      "Review MCP permissions and tool boundaries for deny-by-default behavior.",
      "Review provider, deployment, browser, installation, and release wording for false claims.",
      "Review provenance, lifecycle, fresh-task, and public-install boundary records.",
      "Review source-manifest, catalog, matrix, registry, and project-manifest counts for drift.",
      "Review documentation for public SEIS Repo terminology and current capability status.",
      "Review integration tests and coverage for the newly selected capability or explicit no-change decision.",
      "Review release readiness without promotion, tagging, or protected-branch writes.",
      "Review working-tree diff for unrelated files and generated-artifact drift.",
      "Run whitespace and focused secret-safe checks.",
      "Re-run plugin-creator validation for any changed public package.",
      "Re-run focused tests and broad public marketplace regressions.",
      "Publish explicit risks, blockers, and rollback updates.",
      "Prepare a handoff only when every affected local contract has current evidence.",
    ],
  },
  {
    name: "Wave 3 handoff",
    objective: "Complete the wave only with current evidence, feature-branch delivery, and a separate scope gate for any following wave.",
    tasks: [
      "Run the Wave 3 tracker and capability-decision checks.",
      "Run focused package generators, validators, and tests for the selected scope.",
      "Run source, catalog, matrix, marketplace, registry, and unified-suite regressions.",
      "Run agent integration and requested-capability coverage regressions where applicable.",
      "Run lifecycle, provenance, fresh-task, install-boundary, and release-readiness checks.",
      "Run applicable baseline SEIS checks without expanding into unrelated systems.",
      "Review generated evidence for count, terminology, and public-boundary drift.",
      "Review source and documentation for personal marketplace references.",
      "Review source and generated records for secret-like or machine-specific values.",
      "Review native, provider, browser, deployment, installation, and release gaps honestly.",
      "Keep public release blocked unless independent evidence and explicit approval exist.",
      "Inspect the working tree and diff for unrelated changes.",
      "Run whitespace and focused security boundary checks.",
      "Prepare a focused local commit with goal and Wave 3 context.",
      "Push only the current feature branch when authorized.",
      "Verify the remote feature reference when possible.",
      "Publish a Wave 3 repository-local handoff with risks and rollback.",
      "Review whether a following wave is justified by current evidence rather than cadence alone.",
      "Create a separate plan for any following wave only after a new scope and risk review.",
      "Mark Wave 3 complete only when all one hundred steps have current evidence.",
    ],
  },
]);

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-3-program`);
    process.exit(1);
  }
  console.log(`SEIS public plugin Wave 3 program check passed (${record.progress.completedStepCount} completed, step ${record.progress.nextStepNumber} in progress).`);
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with ${record.progress.completedStepCount} completed Wave 3 steps.`);
}

function buildRecord() {
  const initialProgram = readJson(INITIAL_PROGRAM_PATH);
  const wave2Program = readJson(WAVE_2_PROGRAM_PATH);
  const round3Checkpoint = readJson(ROUND_3_CHECKPOINT_PATH);
  const round4Review = readJson(ROUND_4_REVIEW_PATH);
  const handoffReadiness = readJson(HANDOFF_READINESS_PATH);
  const finalValidation = readJson(FINAL_VALIDATION_PATH);
  assert(initialProgram?.id === "seis-public-plugin-expansion-program" && initialProgram?.status === "completed", "initial program is invalid");
  assert(initialProgram?.nextWaves?.[1]?.status === "completed" && initialProgram?.nextWaves?.[1]?.handoffEvidencePath === WAVE_2_HANDOFF_PATH, "Wave 2 completion is not recorded in the initial program");
  assert(initialProgram?.nextWaves?.[2]?.status === "in-progress" && initialProgram?.nextWaves?.[2]?.programId === "seis-public-plugin-wave-3-program", "Wave 3 is not active in the initial program");
  assert(wave2Program?.id === "seis-public-plugin-wave-2-program" && wave2Program?.status === "completed" && wave2Program?.progress?.completedStepCount === 100, "Wave 2 completion evidence is invalid");
  assert(round3Checkpoint?.id === "seis-public-plugin-wave-3-round-3-checkpoint" && round3Checkpoint?.status === "completed-repository-local-checkpoint" && list(round3Checkpoint?.completedSteps).join(",") === Array.from({ length: 14 }, (_, index) => index + 47).join(","), "Wave 3 round 3 checkpoint evidence is invalid");
  assert(round4Review?.id === "seis-public-plugin-wave-3-round-4-review" && round4Review?.status === "completed-repository-local-round-review" && list(round4Review?.completedSteps).join(",") === Array.from({ length: 19 }, (_, index) => index + 61).join(","), "Wave 3 round 4 review evidence is invalid");
  assert(handoffReadiness?.id === "seis-public-plugin-wave-3-handoff-readiness" && handoffReadiness?.status === "completed-repository-local-handoff-readiness" && handoffReadiness?.step === 80 && handoffReadiness?.futureWaveDecision?.activationApproved === false, "Wave 3 handoff readiness evidence is invalid");
  assert(finalValidation?.id === "seis-public-plugin-wave-3-final-validation" && finalValidation?.status === "completed-repository-local-final-validation" && finalValidation?.step === 81 && finalValidation?.futureWaveDecision?.activationApproved === false, "Wave 3 final validation evidence is invalid");

  const steps = ROUND_DEFINITIONS.flatMap((round, roundIndex) => round.tasks.map((title, taskIndex) => ({
    number: (roundIndex * 20) + taskIndex + 1,
    round: roundIndex + 1,
    title,
    status: stepStatus((roundIndex * 20) + taskIndex + 1),
    validation: validationFor(roundIndex + 1, taskIndex + 1),
  })));

  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-3-program",
    goalId: "SEIS-GOAL-021",
    parentProgramId: initialProgram.id,
    status: "in-progress",
    maturity: "prototype",
    createdAt: "2026-07-21",
    updatedAt: "2026-07-21",
    wave: {
      number: 3,
      totalSteps: 100,
      roundCount: 5,
      stepsPerRound: 20,
      predecessor: {
        programPath: WAVE_2_PROGRAM_PATH,
        handoffPath: WAVE_2_HANDOFF_PATH,
        requiredProgramStatus: "completed",
        requiredHandoffStatus: "completed-repository-local-handoff",
      },
    },
    scope: {
      repositories: ["SEIS"],
      outcome: "Deliver one non-duplicative public SEIS Repo capability through bounded repository-local evidence. The selected Swift concurrency package remains static-only, deny-by-default, and release-gated.",
      entryRule: "Wave 3 entered in-progress only after the Wave 2 handoff and a separate capability decision recorded an approved, testable, non-duplicative scope.",
    },
    nonGoals: [
      "Reading or mutating the personal marketplace.",
      "Adding more than the one approved public package or card without a new capability decision.",
      "Protected default branch writes, force pushes, destructive repository actions, or background-execution claims.",
      "Live provider, browser, deployment, native runtime, external installation, signing, App Store, or public-release claims without separate current evidence and authorization.",
    ],
    selection: {
      status: "implementation-approved",
      selectedCapability: SELECTED_CAPABILITY,
      additionalPublicCardAdded: true,
      implementationStarted: true,
      nonDuplicativeCapabilityRequired: true,
      separateDecisionRequiredBeforeImplementation: true,
    },
    evidence: {
      round3CheckpointPath: ROUND_3_CHECKPOINT_PATH,
      round4ReviewPath: ROUND_4_REVIEW_PATH,
      handoffReadinessPath: HANDOFF_READINESS_PATH,
      finalValidationPath: FINAL_VALIDATION_PATH,
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
    rounds: ROUND_DEFINITIONS.map((round, index) => ({
      round: index + 1,
      name: round.name,
      objective: round.objective,
      status: index < 4 ? "completed" : index === 4 ? "in-progress" : "planned",
      steps: Array.from({ length: 20 }, (_, taskIndex) => (index * 20) + taskIndex + 1),
    })),
    steps,
    progress: {
      completedStepCount: COMPLETED_STEP_COUNT,
      plannedStepCount: 100 - COMPLETED_STEP_COUNT - 1,
      inProgressStepNumbers: [IN_PROGRESS_STEP_NUMBER],
      completedRoundCount: 4,
      nextStepNumber: IN_PROGRESS_STEP_NUMBER,
    },
    qualityGates: [
      "npm run check:seis-public-plugin-expansion-program",
      "npm run check:seis-public-plugin-wave-2-program",
      "npm run check:seis-public-plugin-wave-2-handoff",
      "npm run check:seis-public-plugin-wave-3-program",
      "npm run check:seis-repo-marketplace",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:seis-core-plugin-sources",
      "npm run check:seis-core-plugin-catalog",
      "npm run check:seis-core-plugin-matrix",
    ],
    risks: [
      {
        id: "RISK-W3-001",
        status: "tracked",
        description: "Cadence pressure can create a duplicate public plugin instead of improving a validated capability gap.",
        mitigation: "Require discovery, overlap review, and an explicit selectedCapability before any source or marketplace change.",
      },
      {
        id: "RISK-W3-002",
        status: "tracked",
        description: "An in-progress public card can be mistaken for an installed, released, or live external capability.",
        mitigation: "Keep public release false and external proof requirements explicit while the selected package remains repository-local static evidence.",
      },
      {
        id: "RISK-W3-003",
        status: "tracked",
        description: "A valid repository-local scope can drift into personal marketplace access or external writes.",
        mitigation: "Preserve deny-by-default permissions and reject any plan that needs personal configuration, credentials, network access, or external mutation.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 3 package, public card, generated evidence, and program references on the current feature branch; no external state or data migration is created.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function validationFor(round, task) {
  if (round === 1 && task <= 16) return "current repository evidence, public-boundary, and overlap review";
  if (round === 1) return "bounded source/catalog/matrix/marketplace discovery and safety scan";
  if (round === 2 && task <= 16) return "capability decision and local contract design review";
  if (round === 2) return "architecture, security, accessibility, performance, and rollback review";
  if (round === 3 && task <= 7) return "approved package implementation, focused tests, and plugin-creator validation";
  if (round === 3 && task <= 15) return "public distribution, registry, lifecycle, provenance, and permission reconciliation";
  if (round === 3) return "focused and broad repository-local regression evidence";
  if (round === 4 && task <= 15) return "resilience, public-contract, accessibility, performance, and evidence-leakage review";
  if (round === 4) return "focused validation, risk update, and handoff readiness evidence";
  if (round === 5 && task <= 13) return "current Wave 3 repository-local validation evidence";
  if (round === 5 && task <= 16) return "feature-branch delivery and remote-reference verification when authorized";
  return "Wave 3 handoff and following-wave scope review evidence";
}

function stepStatus(number) {
  if (number <= COMPLETED_STEP_COUNT) return "completed";
  if (number === IN_PROGRESS_STEP_NUMBER) return "in-progress";
  return "planned";
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-3-program", "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021" && record.parentProgramId === "seis-public-plugin-expansion-program", "goal linkage is invalid");
  assert(record.status === "in-progress" && record.maturity === "prototype", "Wave 3 must remain an in-progress prototype");
  assert(record.wave?.number === 3 && record.wave?.totalSteps === 100 && record.wave?.roundCount === 5 && record.wave?.stepsPerRound === 20, "Wave 3 cadence is invalid");
  assert(record.wave?.predecessor?.programPath === WAVE_2_PROGRAM_PATH && record.wave?.predecessor?.handoffPath === WAVE_2_HANDOFF_PATH && record.wave?.predecessor?.requiredProgramStatus === "completed" && record.wave?.predecessor?.requiredHandoffStatus === "completed-repository-local-handoff", "Wave 3 predecessor is invalid");
  assert(list(record.rounds).length === 5 && list(record.steps).length === 100, "Wave 3 structure is incomplete");
  for (let index = 0; index < 100; index += 1) {
    const step = record.steps[index];
    assert(step?.number === index + 1 && step?.round === Math.floor(index / 20) + 1, `step ${index + 1} is invalid`);
    assert(step?.status === stepStatus(index + 1) && typeof step?.title === "string" && step.title.length > 0 && typeof step?.validation === "string" && step.validation.length > 0, `step ${index + 1} has invalid progress metadata`);
  }
  assert(record.progress?.completedStepCount === COMPLETED_STEP_COUNT && record.progress?.plannedStepCount === 100 - COMPLETED_STEP_COUNT - 1 && list(record.progress?.inProgressStepNumbers).join(",") === String(IN_PROGRESS_STEP_NUMBER) && record.progress?.completedRoundCount === 4 && record.progress?.nextStepNumber === IN_PROGRESS_STEP_NUMBER, "Wave 3 progress is invalid");
  assert(record.selection?.status === "implementation-approved" && record.selection?.selectedCapability === SELECTED_CAPABILITY && record.selection?.additionalPublicCardAdded === true && record.selection?.implementationStarted === true && record.selection?.nonDuplicativeCapabilityRequired === true && record.selection?.separateDecisionRequiredBeforeImplementation === true, "Wave 3 selection boundary is invalid");
  assert(record.evidence?.round3CheckpointPath === ROUND_3_CHECKPOINT_PATH && record.evidence?.round4ReviewPath === ROUND_4_REVIEW_PATH && record.evidence?.handoffReadinessPath === HANDOFF_READINESS_PATH && record.evidence?.finalValidationPath === FINAL_VALIDATION_PATH, "Wave 3 evidence linkage is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public safety boundary is invalid");
  assert(list(record.nonGoals).length === 4 && list(record.risks).length === 3 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "scope, risks, or rollback is invalid");
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 3 program: ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 3 program: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
