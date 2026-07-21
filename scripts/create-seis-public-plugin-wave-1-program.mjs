#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-1-program.json";
const INITIAL_PROGRAM_PATH = "content/development/seis-public-plugin-expansion-program.json";

const ROUND_DEFINITIONS = [
  {
    name: "State-boundary foundation",
    objective: "Close the Command Center's four missing static state markers with accessible, no-key, non-live UI copy and evidence.",
    tasks: [
      "Verify the delivered 30-step public-plugin baseline.",
      "Verify the current feature branch and clean worktree.",
      "Verify the public SEIS Repo and no-personal-marketplace boundary.",
      "Read the project manifest and current public count contract.",
      "Inspect the Command Center plugin source surface.",
      "Capture the static UI-state audit baseline.",
      "Record Wave 1 scope and explicit non-goals.",
      "Record no-key, no-live-provider, and no-write safety boundaries.",
      "Define accessibility semantics for state-boundary content.",
      "Define focused test and generated-evidence requirements.",
      "Create the Wave 1 one-hundred-step record.",
      "Add deterministic Wave 1 validation.",
      "Expose Wave 1 through a package check command.",
      "Document the Wave 1 execution boundary and rounds.",
      "Add the Command Center state-boundary model.",
      "Render the accessible operational-state panel.",
      "Add responsive state-boundary panel styling.",
      "Reconcile the visible app-plugin filter count.",
      "Update focused UI-state contract expectations.",
      "Regenerate and validate UI-state evidence.",
    ],
  },
  {
    name: "Interaction and recovery semantics",
    objective: "Strengthen static interaction, focus, and recovery evidence for the new boundary surface without inventing remote behavior.",
    tasks: [
      "Review keyboard reachability of the state-boundary panel.",
      "Review the panel's reading order and heading hierarchy.",
      "Review aria-live use for catalog and boundary updates.",
      "Add source assertions for boundary panel semantic markers.",
      "Add state-transition fixture coverage without a live provider.",
      "Document catalog-fallback versus provider-failure separation.",
      "Document no-result versus degraded-mode separation.",
      "Review reduced-motion behavior around status updates.",
      "Review contrast and non-color state cues.",
      "Review filtering behavior with the new panel present.",
      "Extend focus-navigation source evidence if warranted.",
      "Capture static accessibility evidence for state labels.",
      "Verify no action control claims an unavailable capability.",
      "Verify no provider request is introduced by the panel.",
      "Verify no local storage mutation is introduced by the panel.",
      "Review desktop and Command Center state-contract overlap.",
      "Record web-surface gaps as separate planned work.",
      "Run focused Command Center source checks.",
      "Refresh related generated evidence.",
      "Publish the Round 2 evidence decision.",
    ],
  },
  {
    name: "Public evidence and contract clarity",
    objective: "Make source, generated artifacts, documentation, and public-distribution terminology agree without turning local evidence into release proof.",
    tasks: [
      "Review public plugin family evidence after the state-boundary change.",
      "Review UI-state audit limitations for accuracy.",
      "Review project-manifest count reconciliation.",
      "Review app catalog fallback metadata for current counts.",
      "Review release-readiness copy for local-only accuracy.",
      "Review marketplace terminology for personal-label leakage.",
      "Review public install-state language for activation claims.",
      "Review public runtime-status language for cache claims.",
      "Review source-provenance evidence boundaries.",
      "Review independent-runner evidence boundaries.",
      "Add a concise Wave 1 evidence index if needed.",
      "Validate generated JSON contains no machine-specific paths.",
      "Validate generated JSON contains no secret-like values.",
      "Validate source manifests retain empty permissions.",
      "Validate public app count remains reconciled.",
      "Validate catalog release labels remain reconciled.",
      "Validate public audience remains everyone.",
      "Run public marketplace terminology validation.",
      "Run public evidence-contract validation.",
      "Publish the Round 3 evidence decision.",
    ],
  },
  {
    name: "Next capability selection",
    objective: "Select at most one non-duplicative public plugin capability from audited evidence; do not create a card solely to inflate the catalog.",
    tasks: [
      "Inventory existing state, focus, and provenance plugin responsibilities.",
      "Audit candidate capability overlap.",
      "Choose a single next capability only if a clear gap remains.",
      "Write scope, non-goals, and rollback before scaffolding.",
      "Confirm public-only marketplace placement.",
      "Confirm no personal marketplace read or mutation is needed.",
      "Confirm no external write or network capability is needed.",
      "Define source inputs and bounded output schema.",
      "Define deterministic test fixtures.",
      "Define MCP tool boundaries when relevant.",
      "Create package metadata only after the decision gate passes.",
      "Create runtime module only after metadata passes validation.",
      "Create MCP server only when a bounded tool is justified.",
      "Create documentation and skill guidance.",
      "Register generated evidence.",
      "Integrate source, catalog, and matrix contracts.",
      "Validate plugin structure with plugin-creator rules.",
      "Run focused tests and MCP framing smoke.",
      "Review public/provenance security evidence.",
      "Publish the Round 4 capability decision.",
    ],
  },
  {
    name: "Release-quality handoff",
    objective: "Finish Wave 1 with current validation, public-safe documentation, focused commits, and feature-branch delivery.",
    tasks: [
      "Run source, catalog, and matrix regressions.",
      "Run UI-state and focus-navigation regressions.",
      "Run project-manifest and integration regressions.",
      "Run public marketplace and install-state regressions.",
      "Run lifecycle, provenance, and fresh-task regressions.",
      "Run unified suite and AI Core registry regressions.",
      "Run baseline SEIS web checks.",
      "Run Wave 1 tracker validation.",
      "Review documentation, registry, and count drift.",
      "Review release-readiness evidence if plugin source changed.",
      "Review diff for whitespace and generated-artifact consistency.",
      "Run public-safe boundary checks.",
      "Inspect worktree and staged scope.",
      "Prepare a focused local commit.",
      "Push the current feature branch when authorized.",
      "Verify the remote feature reference.",
      "Record exact validation evidence and skipped checks.",
      "Record risk, rollback, and follow-up work.",
      "Mark Wave 1 complete only when all evidence is current.",
      "Run a fresh scope and risk review before activating Wave 2.",
    ],
  },
];

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-1-program`);
    process.exit(1);
  }
  console.log(`SEIS public plugin Wave 1 program check passed (${record.steps.length} steps).`);
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with ${record.steps.length} Wave 1 steps.`);
}

function buildRecord() {
  const initialProgram = readJson(INITIAL_PROGRAM_PATH);
  assert(initialProgram?.id === "seis-public-plugin-expansion-program", "initial program id is invalid");
  assert(initialProgram?.status === "completed", "initial 30-step program must be completed");
  assert(initialProgram?.steps?.length === 30 && initialProgram.steps.every((step) => step.status === "completed"), "initial program evidence is incomplete");
  assert(initialProgram?.nextWaves?.[0]?.status === "in-progress", "Wave 1 must be active in the initial program");
  assert(initialProgram?.nextWaves?.[0]?.programId === "seis-public-plugin-wave-1-program", "Wave 1 program linkage is invalid");

  const steps = ROUND_DEFINITIONS.flatMap((round, roundIndex) => round.tasks.map((title, taskIndex) => {
    const number = (roundIndex * 20) + taskIndex + 1;
    return {
      number,
      round: roundIndex + 1,
      title,
      status: number <= 60 ? "completed" : number === 61 ? "in-progress" : "planned",
      validation: validationFor(number),
    };
  }));
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-1-program",
    goalId: "SEIS-GOAL-021",
    parentProgramId: initialProgram.id,
    status: "in-progress",
    createdAt: "2026-07-21",
    updatedAt: "2026-07-21",
    wave: {
      number: 1,
      totalSteps: 100,
      roundCount: 5,
      stepsPerRound: 20,
      initialProgramCommit: initialProgram.delivery?.initialCheckpointCommit || null,
    },
    scope: {
      repositories: ["SEIS"],
      paths: [
        "apps/seis-core",
        "plugins/seis-core/seis-ui-state-contract-audit",
        "content/development",
        "docs/roadmap",
      ],
      outcome: "Make Command Center operational-state boundaries visible and testable without converting static source evidence into a live provider, deployment, or release claim.",
    },
    nonGoals: [
      "Reading or mutating the personal marketplace.",
      "Adding provider credentials, live provider calls, or external activation.",
      "Writing to the protected default branch.",
      "Treating static source evidence as browser, screen-reader, provider, or release proof.",
    ],
    executionBoundary: {
      publicMarketplace: "seis-repo",
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      sourceWrites: "repository-only-and-reversible",
      protectedDefaultBranchWrites: false,
      backgroundExecutionClaimed: false,
    },
    rounds: ROUND_DEFINITIONS.map((round, index) => ({
      round: index + 1,
      name: round.name,
      objective: round.objective,
      steps: Array.from({ length: 20 }, (_, taskIndex) => (index * 20) + taskIndex + 1),
      status: index <= 2 ? "completed" : index === 3 ? "in-progress" : "planned",
    })),
    steps,
    qualityGates: {
      architecture: "required",
      security: "required",
      accessibility: "required",
      documentation: "required",
      publicBoundary: "required",
      liveProviderClaims: "forbidden",
    },
    nextWaveGate: {
      required: true,
      rule: "Wave 2 remains not planned until Wave 1 has current validation, a scope review, and a risk review.",
    },
  };
  validateRecord(record);
  return record;
}

function validationFor(number) {
  if (number <= 20) return "Wave 1 program validation, focused UI-state tests, generated evidence, and source review";
  if (number <= 40) return "focused interaction, accessibility, and source-evidence checks";
  if (number <= 60) return "public contract, provenance, and generated-artifact checks";
  if (number <= 80) return "portfolio overlap review, plugin validation, and focused tests";
  return "full regression, diff review, feature-branch delivery, and remote-ref verification";
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-1-program", "program id is invalid");
  assert(record.goalId === "SEIS-GOAL-021", "goal linkage is invalid");
  assert(record.parentProgramId === "seis-public-plugin-expansion-program", "parent program linkage is invalid");
  assert(record.status === "in-progress", "Wave 1 must remain in progress");
  assert(record.wave?.number === 1 && record.wave?.totalSteps === 100, "Wave 1 must contain 100 steps");
  assert(record.wave?.roundCount === 5 && record.wave?.stepsPerRound === 20, "Wave 1 must contain five rounds of twenty");
  assert(record.executionBoundary?.publicMarketplace === "seis-repo", "Wave 1 must target the public SEIS Repo marketplace");
  assert(record.executionBoundary?.personalMarketplaceRead === false && record.executionBoundary?.personalMarketplaceMutation === false, "personal marketplace boundary is invalid");
  assert(record.executionBoundary?.network === false && record.executionBoundary?.protectedDefaultBranchWrites === false, "network or protected-branch boundary is invalid");
  assert(record.executionBoundary?.backgroundExecutionClaimed === false, "Wave 1 must not claim background execution");
  assert(Array.isArray(record.rounds) && record.rounds.length === 5, "Wave 1 rounds are incomplete");
  assert(Array.isArray(record.steps) && record.steps.length === 100, "Wave 1 step list is incomplete");
  for (let index = 0; index < 100; index += 1) {
    const step = record.steps[index];
    assert(step?.number === index + 1, `step ${index + 1} number is invalid`);
    assert(step?.round === Math.floor(index / 20) + 1, `step ${index + 1} round is invalid`);
    assert(typeof step?.title === "string" && step.title.length > 0, `step ${index + 1} title is invalid`);
    assert(typeof step?.validation === "string" && step.validation.length > 0, `step ${index + 1} validation is invalid`);
  }
  for (let index = 0; index < 5; index += 1) {
    const round = record.rounds[index];
    assert(round?.round === index + 1, `round ${index + 1} is invalid`);
    assert(Array.isArray(round?.steps) && round.steps.length === 20, `round ${index + 1} must contain twenty steps`);
  }
  assert(record.steps.filter((step) => step.status === "completed").length === 60, "Round 3 completion count is invalid");
  assert(record.steps.filter((step) => step.status === "in-progress").length === 1, "exactly one Wave 1 step must be in progress");
  assert(record.steps[60]?.status === "in-progress", "step 61 must start Round 4");
  assert(record.rounds[0]?.status === "completed" && record.rounds[1]?.status === "completed" && record.rounds[2]?.status === "completed" && record.rounds[3]?.status === "in-progress", "Wave 1 round status is invalid");
  assert(Array.isArray(record.nonGoals) && record.nonGoals.length >= 4, "Wave 1 non-goals are incomplete");
  assert(!/(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m.test(JSON.stringify(record)), "record must not contain machine-specific paths");
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 1 program: ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
