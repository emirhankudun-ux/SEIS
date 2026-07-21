#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-2-program.json";
const INITIAL_PROGRAM_PATH = "content/development/seis-public-plugin-expansion-program.json";
const DECISION_PATH = "content/development/seis-public-plugin-wave-2-capability-decision.json";
const EVIDENCE_PATH = "content/development/seis-apple-native-readiness.json";
const DISTRIBUTION_REVIEW_PATH = "content/development/seis-public-plugin-wave-2-distribution-review.json";
const PLUGIN_ROOT = "plugins/seis-core/seis-apple-native-readiness";

const ROUND_DEFINITIONS = Object.freeze([
  {
    name: "Apple/Swift evidence foundation",
    objective: "Select and deliver one non-duplicative, bounded Apple-native static-readiness plugin without compiling or overstating native capability.",
    status: "completed",
    tasks: [
      "Confirm the completed initial 30-step program and current user continuation authority.",
      "Confirm the current feature branch, public SEIS Repo boundary, and no-personal-marketplace rule.",
      "Review the completed Wave 1 handoff and its release, provenance, and attention boundaries.",
      "Inventory existing public plugin responsibilities for Apple/Swift capability overlap.",
      "Inventory the real Swift Package, source, test, and Apple strategy inputs within a bounded local scope.",
      "Select a single non-duplicative capability or stop if a useful gap is absent.",
      "Record Wave 2 scope, non-goals, risks, rollback, and public-only permission boundaries.",
      "Create the Wave 2 one-hundred-step record and deterministic tracker validation.",
      "Define static-evidence-only terminology that avoids build, signing, deployment, provider, and release claims.",
      "Define fixed relative input paths, byte bounds, source traversal bounds, and path-escape refusal behavior.",
      "Create public plugin metadata, profile, skill, and MCP declaration for the selected readiness audit.",
      "Implement the bounded Swift Package manifest contract audit.",
      "Implement bounded Swift source-area presence checks without returning source content.",
      "Implement focused Swift test-file presence checks without running SwiftPM.",
      "Implement Apple platform strategy and anti-symbolic-code marker checks.",
      "Implement status, audit/report, evidence, and MCP tool responses with empty write/network/secret permissions.",
      "Add positive and negative Node tests for the static readiness runtime.",
      "Generate repository-local Apple-native readiness evidence without source, machine-path, or secret leakage.",
      "Register the package in the public SEIS Repo family and refresh source, catalog, matrix, and AI Core integration artifacts.",
      "Run structural package validation and focused local readiness checks before closing the first round.",
    ],
  },
  {
    name: "Native evidence resilience",
    objective: "Strengthen test fixtures and bounded error handling only when real source evidence identifies a gap.",
    status: "completed",
    tasks: [
      "Review Wave 2 Round 1 evidence for stale or overly broad static markers.",
      "Review path-boundary behavior against invalid and symlinked input scenarios.",
      "Review text-size and source-file traversal limits for practical local safety.",
      "Add fixture coverage only for an observed static-readiness failure mode.",
      "Review platform-version markers against the checked-in Package.swift declaration.",
      "Review source-area checks for false confidence caused by empty directories.",
      "Review test-file checks for changes in the focused Swift test contract.",
      "Review static evidence terminology for native-runtime ambiguity.",
      "Review accessibility and documentation wording for clear limitation disclosure.",
      "Review no-raw-source and no-machine-path output guarantees.",
      "Run focused runtime and MCP framing regressions.",
      "Run package catalog status-only regression.",
      "Reconcile generated evidence after any bounded source contract change.",
      "Review public marketplace card labels for SEIS Repo terminology.",
      "Review source-manifest permissions and implementation state.",
      "Review AI Core registry treatment of the physical public package.",
      "Record any unmet native validation need as a separate future goal.",
      "Update risk and rollback evidence if source boundaries change.",
      "Prepare a focused review checkpoint if Round 2 produces a real change.",
      "Validate Round 2 evidence before marking any of its tasks complete.",
    ],
  },
  {
    name: "Public contract maintenance",
    objective: "Keep public distribution, catalog, release, and lifecycle artifacts coherent while preserving approval-gated external boundaries.",
    status: "completed",
    tasks: [
      "Review public family and marketplace counts after any Wave 2 source change.",
      "Review source-manifest and catalog count reconciliation.",
      "Review plugin matrix, registry, and unified-suite source discovery.",
      "Review public install-state wording without claiming external installation.",
      "Review public runtime-status wording without claiming a provider or deployment.",
      "Review MCP permission ledger for empty write, network, and secret permissions.",
      "Review public security and provenance evidence for source-boundary drift.",
      "Review release readiness without promoting a version automatically.",
      "Review project manifest count and public-audience declarations.",
      "Review public marketplace terminology for personal-label leakage.",
      "Run source, catalog, matrix, and public-family checks.",
      "Run AI Core integration and requested-plugin coverage checks.",
      "Run public lifecycle, provenance, fresh-task, and external-install boundary checks.",
      "Inspect generated records for machine-specific paths and secret-like values.",
      "Document any approval-gated external validation separately from repository evidence.",
      "Update non-goals if a public card begins to imply a live integration.",
      "Prepare a reversible checkpoint only after all relevant local checks pass.",
      "Commit and push the scoped checkpoint only with current user delivery authority.",
      "Verify the feature-branch reference when the network environment permits.",
      "Record failed or skipped external checks without converting them into success claims.",
    ],
  },
  {
    name: "Apple-native follow-up selection",
    objective: "Select at most one follow-up only if current evidence shows a non-duplicative gap beyond static readiness.",
    status: "planned",
    tasks: [
      "Review whether a follow-up needs real SwiftPM validation rather than another metadata audit.",
      "Review whether a platform-specific test can run in the current environment.",
      "Review existing native diagnostics and package tests before proposing new code.",
      "Review design, accessibility, privacy, and performance consequences of a native follow-up.",
      "Review signing, provisioning, and App Store boundaries as approval-gated non-goals.",
      "Review macOS, iPadOS, iOS, and visionOS roles without asserting deployment readiness.",
      "Inventory candidate overlap with existing repository and plugin capabilities.",
      "Choose no follow-up when the remaining work is a duplicate or cannot be validated safely.",
      "Write a separate capability decision before scaffolding any additional package.",
      "Define local-only inputs, outputs, validation, risks, and rollback for a selected follow-up.",
      "Confirm public SEIS Repo placement and no-personal-marketplace boundary.",
      "Confirm empty write, network, and secret permissions by default.",
      "Confirm no live provider, deployment, or release claim is needed.",
      "Add tests before broad marketplace integration.",
      "Refresh generated artifacts only after source validation succeeds.",
      "Run focused plugin-creator validation for the selected package.",
      "Run public source, catalog, and integration checks.",
      "Record any external validation gap as approval-required.",
      "Prepare a reviewable feature-branch checkpoint.",
      "Do not mark Round 4 complete without evidence for every listed task.",
    ],
  },
  {
    name: "Wave 2 handoff",
    objective: "Close the wave only with current evidence, explicit risks, a reversible handoff, and a feature-branch delivery record.",
    status: "planned",
    tasks: [
      "Run the Wave 2 tracker and capability-decision checks.",
      "Run Apple-native readiness generator and focused tests.",
      "Run plugin-creator structural validation for every Wave 2 package.",
      "Run source, catalog, matrix, marketplace, and unified-suite regressions.",
      "Run AI Core integration and requested-plugin coverage regressions.",
      "Run public lifecycle, provenance, fresh-task, and install-boundary regressions.",
      "Run baseline SEIS repository checks where applicable.",
      "Review generated artifacts for count, release, and terminology drift.",
      "Review source and documentation for personal marketplace references.",
      "Review source and generated evidence for secret-like or machine-specific values.",
      "Review external install, provider, browser, deployment, and release gaps honestly.",
      "Review release-readiness evidence without performing a promotion unless explicitly approved.",
      "Inspect the working tree and diff for unrelated changes.",
      "Run whitespace and focused security boundary checks.",
      "Prepare a focused local commit with goal and Wave 2 context.",
      "Push only the current feature branch when authorized.",
      "Verify the remote feature reference when possible.",
      "Publish a Wave 2 repository-local handoff with risks and rollback.",
      "Plan Wave 3 only after current Wave 2 handoff evidence and scope review.",
      "Mark Wave 2 complete only when all one hundred steps have current evidence.",
    ],
  },
]);

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-2-program`);
    process.exit(1);
  }
  console.log(`SEIS public plugin Wave 2 program check passed (${record.steps.length} steps, ${record.progress.completedStepCount} completed).`);
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with ${record.steps.length} Wave 2 steps.`);
}

function buildRecord() {
  const initialProgram = readJson(INITIAL_PROGRAM_PATH);
  const decision = readJson(DECISION_PATH);
  const evidence = readJson(EVIDENCE_PATH);
  const distributionReview = readJson(DISTRIBUTION_REVIEW_PATH);
  assert(initialProgram?.id === "seis-public-plugin-expansion-program" && initialProgram?.status === "completed", "initial program is invalid");
  assert(initialProgram?.nextWaves?.[1]?.status === "in-progress" && initialProgram?.nextWaves?.[1]?.programId === "seis-public-plugin-wave-2-program", "Wave 2 is not activated in the initial program");
  assert(decision?.decision?.selectedCapability === "seis-apple-native-readiness" && decision?.status === "approved-public-local-implementation", "Wave 2 capability decision is invalid");
  assert(evidence?.id === "seis-apple-native-readiness" && evidence?.status === "completed-public-static-readiness-evidence", "Apple-native readiness evidence is invalid");
  assert(evidence?.resilienceReview?.status === "completed-repository-local-resilience-review", "Apple-native resilience evidence is invalid");
  assert(distributionReview?.id === "seis-public-plugin-wave-2-distribution-review" && distributionReview?.status === "completed-repository-local-distribution-maintenance-review", "Wave 2 distribution review is invalid");
  assert(fs.existsSync(path.join(ROOT, PLUGIN_ROOT, ".codex-plugin", "plugin.json")), "Wave 2 plugin manifest is missing");
  assert(fs.existsSync(path.join(ROOT, PLUGIN_ROOT, "runtime", "apple-native-readiness.mjs")), "Wave 2 plugin runtime is missing");
  assert(fs.existsSync(path.join(ROOT, "plugins", "seis-core", "test", "apple-native-readiness.test.mjs")), "Wave 2 plugin test is missing");

  const completedStepCount = 60;
  const steps = ROUND_DEFINITIONS.flatMap((round, roundIndex) => round.tasks.map((title, taskIndex) => ({
    number: (roundIndex * 20) + taskIndex + 1,
    round: roundIndex + 1,
    title,
    status: roundIndex < 3 ? "completed" : "planned",
    validation: validationFor(roundIndex + 1, taskIndex + 1),
  })));

  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-2-program",
    goalId: "SEIS-GOAL-021",
    parentProgramId: initialProgram.id,
    status: "in-progress",
    createdAt: "2026-07-21",
    updatedAt: "2026-07-21",
    wave: {
      number: 2,
      totalSteps: 100,
      roundCount: 5,
      stepsPerRound: 20,
      activationEvidence: {
        initialProgramPath: INITIAL_PROGRAM_PATH,
        wave1HandoffPath: "content/development/seis-public-plugin-wave-1-handoff.json",
        capabilityDecisionPath: DECISION_PATH,
      },
    },
    scope: {
      repositories: ["SEIS"],
      paths: [
        PLUGIN_ROOT,
        "plugins/seis-core/test/apple-native-readiness.test.mjs",
        "plugins/seis-core/test/apple-native-distribution-review.test.mjs",
        "packages/seis_platform_swift/Package.swift",
        "packages/seis_platform_swift/Sources/SeisPlatformKit",
        "packages/seis_platform_swift/Sources/SeisAppleNativeShell",
        "packages/seis_platform_swift/Tests/SeisPlatformKitTests",
        "docs/APPLE_PLATFORM_STRATEGY.md",
        "content/development",
        "docs/roadmap",
      ],
      outcome: "Keep the public SEIS Repo marketplace aligned while exposing one bounded Apple/Swift Package static-readiness capability that remains local, read-only, non-releasing, and explicit about its limitations.",
    },
    nonGoals: [
      "Reading or mutating the personal marketplace.",
      "Protected default branch writes, force pushes, or destructive repository actions.",
      "Running SwiftPM, a simulator, a native application, signing, provisioning, App Store submission, deployment, provider calls, or a public release.",
      "Treating static source evidence as live native capability proof.",
      "Creating a follow-up public package without a separate overlap and risk decision.",
    ],
    rounds: ROUND_DEFINITIONS.map((round, index) => ({
      round: index + 1,
      name: round.name,
      objective: round.objective,
      status: index < 3 ? "completed" : "planned",
      steps: Array.from({ length: 20 }, (_, taskIndex) => (index * 20) + taskIndex + 1),
    })),
    steps,
    progress: {
      completedStepCount,
      plannedStepCount: steps.filter((step) => step.status === "planned").length,
      inProgressStepNumbers: steps.filter((step) => step.status === "in-progress").map((step) => step.number),
      completedRoundCount: 3,
      nextStepNumber: 61,
    },
    capability: {
      decisionId: decision.id,
      selectedCapability: decision.decision?.selectedCapability,
      evidencePath: EVIDENCE_PATH,
      implementationState: evidence.plugin?.implementationState || "functional-local-demo",
      classification: evidence.audit?.classification || null,
      resilienceReview: evidence.resilienceReview?.status || null,
      distributionReview: distributionReview.status || null,
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
    qualityGates: [
      "npm run check:seis-public-plugin-expansion-program",
      "npm run check:seis-public-plugin-wave-2-program",
      "npm run check:seis-public-plugin-wave-2-capability-decision",
      "npm run check:seis-public-plugin-wave-2-distribution-review",
      "npm run check:seis-apple-native-readiness",
      "npm run check:seis-repo-marketplace",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:seis-core-plugin-sources",
      "npm run check:seis-core-plugin-catalog",
      "npm run check:seis-core-plugin-matrix",
    ],
    risks: [
      {
        id: "RISK-W2-001",
        status: "tracked",
        description: "Static readiness evidence can be misread as proof that native build, signing, or release gates passed.",
        mitigation: "Use documented-static-readiness-only classification and keep all native execution, external release, and approval claims out of the package output.",
      },
      {
        id: "RISK-W2-002",
        status: "tracked",
        description: "Public metadata can drift when app-owned plugin count changes.",
        mitigation: "Regenerate and validate source, catalog, marketplace, matrix, registry, lifecycle, and project-manifest artifacts before each checkpoint.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert only the focused Wave 2 package, program, decision, evidence, and generated public metadata on the feature branch.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function validationFor(round, task) {
  if (round === 1 && task <= 10) return "scope, overlap, and boundary review";
  if (round === 1 && task <= 16) return "focused Apple-native readiness runtime check";
  if (round === 1 && task <= 18) return "node --test plugins/seis-core/test/apple-native-readiness.test.mjs";
  if (round === 1) return "plugin validator and public source/catalog/matrix integration checks";
  if (round === 2 && task <= 10) return "bounded resilience fixture and static-contract review";
  if (round === 2 && task <= 16) return "MCP framing, catalog, and public-boundary regression checks";
  if (round === 2) return "generated resilience evidence and feature-branch review";
  if (round === 3 && task <= 10) return "public distribution, source/catalog, and registry/suite reconciliation";
  if (round === 3 && task <= 16) return "permission, lifecycle, provenance, release-boundary, and machine-path review";
  if (round === 3) return "distribution-maintenance evidence and feature-branch verification";
  return "current evidence required before completion";
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-2-program", "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021" && record.parentProgramId === "seis-public-plugin-expansion-program", "goal linkage is invalid");
  assert(record.status === "in-progress", "Wave 2 must remain in progress");
  assert(record.wave?.number === 2 && record.wave?.totalSteps === 100 && record.wave?.roundCount === 5 && record.wave?.stepsPerRound === 20, "Wave 2 cadence is invalid");
  assert(list(record.rounds).length === 5 && list(record.steps).length === 100, "Wave 2 structure is incomplete");
  for (let index = 0; index < 100; index += 1) {
    const step = record.steps[index];
    assert(step?.number === index + 1 && step?.round === Math.floor(index / 20) + 1, `step ${index + 1} is invalid`);
    assert(typeof step?.title === "string" && step.title.length > 0 && typeof step?.validation === "string" && step.validation.length > 0, `step ${index + 1} lacks task metadata`);
    assert(index < 60 ? step.status === "completed" : step.status === "planned", `step ${index + 1} has an invalid completion state`);
  }
  assert(record.progress?.completedStepCount === 60 && record.progress?.plannedStepCount === 40 && list(record.progress?.inProgressStepNumbers).length === 0 && record.progress?.completedRoundCount === 3 && record.progress?.nextStepNumber === 61, "Wave 2 progress is invalid");
  assert(record.capability?.selectedCapability === "seis-apple-native-readiness" && record.capability?.classification === "documented-static-readiness-only" && record.capability?.resilienceReview === "completed-repository-local-resilience-review" && record.capability?.distributionReview === "completed-repository-local-distribution-maintenance-review", "Wave 2 capability linkage is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public safety boundary is invalid");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 2 program: required input is missing: ${relativePath}`);
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

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 2 program: ${message}`);
}
