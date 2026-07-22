#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-supervised-autopilot.json";
const DOCUMENT_PATH = "docs/roadmap/SEIS_PUBLIC_PLUGIN_SUPERVISED_AUTOPILOT.md";
const MAX_INPUT_BYTES = 16 * 1024 * 1024;
let writeSequence = 0;
const PATHS = Object.freeze({
  goal: "goals/active/SEIS-GOAL-0025--supervised-public-plugin-autopilot.yaml",
  parentGoal: "goals/active/SEIS-GOAL-0024--curated-public-plugin-capability-packages.yaml",
  consolidation: "content/development/seis-public-plugin-consolidation.json",
  continuity: "content/development/seis-public-plugin-continuity-cadence.json",
  generalAutopilot: "content/development/seis-general-plugin-autopilot.json",
  family: "content/development/seis-public-plugin-family.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const program = buildProgram();
const document = buildDocument(program);
const outputs = [
  [OUTPUT_PATH, `${JSON.stringify(program, null, 2)}\n`],
  [DOCUMENT_PATH, `${document}\n`],
];

if (CHECK_MODE) {
  const stale = outputs.filter(([file, expected]) => readOptionalText(file) !== expected).map(([file]) => file);
  if (stale.length > 0) {
    console.error("SEIS public plugin supervised autopilot files are stale:");
    for (const file of stale) console.error(`- ${file}`);
    console.error("Run npm run automation:seis-public-plugin-supervised-autopilot to refresh them.");
    process.exit(1);
  }
  console.log("SEIS public plugin supervised autopilot check passed.");
} else {
  for (const [file, text] of outputs) writeText(file, text);
  console.log("Wrote supervised public plugin autopilot program and roadmap.");
}

function buildProgram() {
  const goalText = readRequiredText(PATHS.goal);
  const parentGoalText = readRequiredText(PATHS.parentGoal);
  const consolidation = readJson(PATHS.consolidation);
  const continuity = readJson(PATHS.continuity);
  const generalAutopilot = readJson(PATHS.generalAutopilot);
  const family = readJson(PATHS.family);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const immediateCycle = buildCurrentImmediateCycle(generalAutopilot);
  const fiveWaveSeries = buildFiveWaveSeries(generalAutopilot);
  const escalationSeries = buildEscalationSeries(generalAutopilot);
  const round11Cycle = buildRound11Cycle();
  const tenYearHorizon = buildTenYearHorizon(escalationSeries);
  const automationRoles = buildAutomationRoles();
  const commandAllowlist = assignAutomationRoles(buildCommandAllowlist(), automationRoles);

  const checks = {
    activeGoal: goalText.includes("id: SEIS-GOAL-0025")
      && goalText.includes("parent_goal: SEIS-GOAL-0024")
      && goalText.includes("background agents continuing after the command exits"),
    parentGoal: parentGoalText.includes("id: SEIS-GOAL-0024")
      && parentGoalText.includes("expose exactly ten public marketplace cards")
      && parentGoalText.includes("exactly thirty internal packages"),
    curatedMarketplace: consolidation?.id === "seis-public-plugin-consolidation"
      && consolidation?.status === "implemented-repository-local-not-published"
      && consolidation?.inventory?.publicCardCount === 10
      && consolidation?.inventory?.generalPluginCardCount === 10
      && consolidation?.inventory?.internalPackageCount === 30
      && consolidation?.inventory?.internalPackageCardCount === 0
      && consolidation?.inventory?.retainedSourceCapabilityCount === 380
      && consolidation?.packagePlan?.maximumPackageSize === 15
      && consolidation?.packagePlan?.exactOnceCoverage === true,
    currentCadence: generalAutopilot?.id === "seis-ten-general-plugin-autopilot"
      && generalAutopilot?.goalId === "SEIS-GOAL-0029"
      && generalAutopilot?.immediateCycle?.status === "execution-state-in-external-ledger"
      && generalAutopilot?.immediateCycle?.totalSteps === 150
      && generalAutopilot?.immediateCycle?.roundCount === 5
      && generalAutopilot?.immediateCycle?.stepsPerRound === 30
      && generalAutopilot?.executionLedger?.path === "content/development/seis-general-plugin-autopilot-execution.json"
      && generalAutopilot?.fiveWaveSeries?.status === "blocked-by-incomplete-five-30-step-rounds"
      && generalAutopilot?.fiveWaveSeries?.activeWave === null
      && generalAutopilot?.fiveWaveSeries?.waves === 5
      && generalAutopilot?.fiveWaveSeries?.stepsPerWave === 100
      && generalAutopilot?.fiveWaveSeries?.nextSeries?.stepsPerWave === 200
      && generalAutopilot?.fiveWaveSeries?.nextSeries?.status === "gated-until-five-100-step-waves-complete",
    historicalContinuity: continuity?.id === "seis-public-plugin-continuity-cadence"
      && continuity?.cadence?.bootstrap?.totalSteps === 30
      && continuity?.cadence?.bootstrap?.roundCount === 5
      && continuity?.cadence?.bootstrap?.stepsPerRound === 6
      && continuity?.cadence?.waveSeries?.waveCount === 5
      && continuity?.cadence?.waveSeries?.stepsPerWave === 100
      && continuity?.cadence?.waveSeries?.roundsPerWave === 5
      && continuity?.cadence?.afterFiveWaves?.nextWaveCount === 5
      && continuity?.cadence?.afterFiveWaves?.nextWaveSteps === 200
      && continuity?.cadence?.afterFiveWaves?.activationState === "gated-until-wave-5-completes"
      && continuity?.cadence?.afterFiveWaves?.historicalEvidenceState === "wave-5-first-80-steps-completed-step-81-in-progress"
      && continuity?.executionBoundary?.backgroundExecutionClaimed === false,
    escalationCadence: generalAutopilot?.escalationSeries?.tierCount === 5
      && generalAutopilot?.escalationSeries?.waveCountPerTier === 5
      && list(generalAutopilot?.escalationSeries?.tiers).map((tier) => tier?.stepsPerWave).join(",") === "200,300,400,500,600"
      && generalAutopilot?.escalationSeries?.tiers?.[0]?.status === "gated-until-five-100-step-waves-complete"
      && list(generalAutopilot?.escalationSeries?.tiers).every((tier) => tier?.waveCount === 5 && tier?.activationAuthority === "not-yet-granted" && tier?.activeCycle === null && tier?.backgroundExecution === false && tier?.marketplaceCardExpansion === false),
    bundleProjection: family?.id === "seis-public-plugin-family"
      && family?.marketplace?.publicPluginCount === consolidation?.inventory?.publicCardCount
      && family?.marketplace?.generalPluginCount === consolidation?.inventory?.generalPluginCardCount
      && family?.marketplace?.internalPackageCount === consolidation?.inventory?.internalPackageCount
      && family?.marketplace?.internalPackageMarketplaceCardCount === 0
      && bundleCatalog?.id === "seis-public-plugin-package-catalog"
      && bundleCatalog?.marketplace?.publicCardCount === family?.marketplace?.publicPluginCount
      && bundleCatalog?.marketplace?.internalPackageCount === 30,
    immediateCycle: immediateCycle.totalSteps === 150
      && immediateCycle.rounds.length === 5
      && immediateCycle.rounds.every((round) => round.steps.length === 30),
    fiveWaveSeries: fiveWaveSeries.status === "blocked-by-incomplete-five-30-step-rounds"
      && fiveWaveSeries.activeWave === null
      && fiveWaveSeries.waves === 5
      && fiveWaveSeries.stepsPerWave === 100
      && fiveWaveSeries.nextSeries?.status === "gated-until-five-100-step-waves-complete",
    tenYearHorizon: tenYearHorizon.length === 10
      && tenYearHorizon.every((year, index) => year.year === index + 1 && year.execution === "strategic-gated-not-background"),
    commandAllowlist: commandAllowlist.every((command) => command.command === "node" || command.command === "git")
      && commandAllowlist.every((command) => command.externalWrite === false && command.network === false && command.secrets === false),
    automationRoleAssignments: commandAllowlist.length === 27
      && commandAllowlist.every((command) => automationRoles.some((role) => role.id === command.automationRoleId))
      && automationRoles.every((role) => commandAllowlist.some((command) => command.automationRoleId === role.id)),
  };

  const result = {
    schemaVersion: 1,
    id: "seis-public-plugin-supervised-autopilot",
    goalId: "SEIS-GOAL-0025",
    parentGoalId: "SEIS-GOAL-0024",
    status: "active-supervised-foreground-automation",
    maturity: "prototype",
    generatedAt: "2026-07-22",
    purpose: "Run an explicit local plan, generation, and validation sequence in one foreground invocation while preserving the curated public plugin marketplace, the ordered five-by-30 then five-by-100 cadence, and the gate against premature escalation.",
    currentMarketplace: {
      canonicalInstall: "seis-ai-agent@seis-repo",
      publicCardCount: consolidation.inventory.publicCardCount,
      generalPluginCardCount: consolidation.inventory.generalPluginCardCount,
      internalPackageCount: consolidation.inventory.internalPackageCount,
      internalPackageCardCount: consolidation.inventory.internalPackageCardCount,
      retainedSourceCapabilityCount: consolidation.inventory.retainedSourceCapabilityCount,
      maximumPackageSize: consolidation.packagePlan.maximumPackageSize,
    },
    executionModel: {
      name: "supervised-foreground-plan-and-build",
      planAndBuildInOneInvocation: true,
      persistentProcess: false,
      backgroundExecution: false,
      subagentsAreAutomationRoles: true,
      roleExecution: "foreground-sequential-reviewed-allowlist",
      externalWrites: false,
      intentionalNetworkActions: false,
      intentionalSecretAccess: false,
      isolationLevel: "reviewed-allowlist-no-os-sandbox",
      ambientNetworkIsolationEnforced: false,
      ambientFilesystemIsolationEnforced: false,
      descendantTerminationGuaranteed: false,
      githubPush: false,
      commit: false,
      merge: false,
      release: false,
      deployment: false,
      destructiveActions: false,
      rule: "The runner exists only while its foreground command is running. It cannot continue work after the command exits.",
    },
    automationRoles,
    immediateCycle,
    fiveWaveSeries,
    historicalContinuity: {
      source: PATHS.continuity,
      status: "legacy-wave-5-incomplete-retained-evidence",
      activeWave: continuity?.cadence?.waveSeries?.activeWave,
      completedSteps: continuity?.waves?.[4]?.completedSteps,
      inProgressSteps: list(continuity?.waves?.[4]?.inProgressSteps),
      closeoutClaimed: continuity?.cadence?.afterFiveWaves?.historicalWave5CloseoutClaimed,
      escalationActivationState: continuity?.cadence?.afterFiveWaves?.activationState,
      note: "This is retained legacy evidence only. It cannot activate the current 200-step series or override the Goal 0029 cadence.",
    },
    escalationSeries,
    round11Cycle,
    tenYearHorizon,
    commandAllowlist,
    modes: {
      plan: {
        command: "npm run seis:public-plugin-autopilot -- --plan",
        writesGeneratedArtifacts: false,
        purpose: "Inspect current local state and report the next safe foreground phases.",
      },
      applySafe: {
        command: "npm run seis:public-plugin-autopilot -- --apply-safe",
        writesGeneratedArtifacts: true,
        purpose: "Run only the reviewed local generation and validation allowlist during the current foreground invocation.",
      },
    },
    githubDelivery: {
      branch: "plugins/seis-plugin-root-20260715",
      status: "approval-and-environment-gated",
      automaticPush: false,
      nextAction: "After a focused commit and current authorization, use a separate feature-branch delivery action. Do not push from the autopilot.",
    },
    validation: [
      "npm run check:seis-public-plugin-supervised-autopilot",
      "npm run seis:public-plugin-autopilot -- --plan",
      "npm run seis:public-plugin-autopilot -- --apply-safe",
      "node --test plugins/seis-core/test/public-plugin-supervised-autopilot.test.mjs",
      "git diff --check",
    ],
    validatorBoundary: {
      bundledChecksIncluded: true,
      officialPluginCreatorValidator: "manual-external-gate-not-embedded",
      reason: "The official validator and its Python dependencies are environment-owned, so the portable runner does not hard-code a machine-specific path or install dependencies.",
    },
    checks,
    publicBoundary: {
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      protectedDefaultBranchWrites: false,
      publicReleaseAllowed: false,
    },
    rollback: {
      strategy: "revert",
      scope: "Revert the focused autopilot generator, runner, documentation, and package scripts. The curated marketplace and retained source packages are unaffected by plan mode.",
      dataMigrationRequired: false,
    },
  };
  validateProgram(result);
  return result;
}

function buildCurrentImmediateCycle(generalAutopilot) {
  return {
    ...generalAutopilot.immediateCycle,
    source: PATHS.generalAutopilot,
  };
}

function buildFiveWaveSeries(generalAutopilot) {
  return {
    ...generalAutopilot.fiveWaveSeries,
    source: PATHS.generalAutopilot,
    backgroundExecution: false,
  };
}

function buildLegacyImmediateCycleTemplate() {
  const rounds = [
    [
      "Inspect the active goal, branch, worktree, and source-of-truth boundaries.",
      "Snapshot the canonical install, public-card count, bundle count, and retained-source count.",
      "Confirm public-only, no-personal, no-network, no-secret, and no-external-write boundaries.",
      "Inspect maximum bundle size, exact-once coverage, and protected product-category boundaries.",
      "Record risks, rollback, and any concurrent-generator change before overlapping writes.",
      "Emit the plan-only foreground report and choose the smallest safe next phase.",
    ],
    [
      "Regenerate the public plugin family from reviewed source data.",
      "Regenerate the bounded public bundle packages from the family projection.",
      "Regenerate the consolidation record and retained-source evidence.",
      "Regenerate this supervised automation program and documentation.",
      "Run freshness checks for every generated artifact.",
      "Inspect the local diff for unexpected changes without committing or pushing.",
    ],
    [
      "Run deterministic bundle coverage and local MCP boundary tests.",
      "Run consolidation projection and exact-once source-coverage tests.",
      "Run the supervised-autopilot plan/report tests.",
      "Validate that no allowlisted phase calls network, credentials, or external delivery tools.",
      "Validate that the canonical SEIS-Agent install remains the only default install.",
      "Stop and report any failing phase before planning additional work.",
    ],
    [
      "Review category and product-identity boundaries for bundle clarity.",
      "Review source-retention and rollback evidence before any scope expansion.",
      "Review command output bounds, link safety, and symbolic-link rejection behavior.",
      "Review documentation freshness and user-facing installation language.",
      "Review feature-branch delivery readiness without executing GitHub delivery.",
      "Create explicit follow-up work only when it has a goal, risk, validation, and rollback boundary.",
    ],
    [
      "Summarize foreground build and validation evidence.",
      "Record failed, skipped, blocked, and approval-gated actions honestly.",
      "Check worktree state and keep unrelated changes untouched.",
      "Prepare a focused local commit recommendation without creating a commit automatically.",
      "Prepare a separate GitHub feature-branch delivery decision without pushing automatically.",
      "Keep the legacy 30-step bootstrap as historical evidence only; preserve Wave 5 as incomplete and never activate a 200-step tier before the current five-wave series closes.",
    ],
  ];
  let number = 1;
  return {
    totalSteps: 30,
    rounds: rounds.map((titles, index) => ({
      round: index + 1,
      name: ["Inspect and plan", "Build deterministically", "Validate locally", "Review boundaries", "Handoff deliberately"][index],
      steps: titles.map((title) => ({ number: number++, title, status: "ready-for-supervised-foreground-run" })),
    })),
    steps: rounds.flatMap((titles, roundIndex) => titles.map((title, stepIndex) => ({
      number: roundIndex * 6 + stepIndex + 1,
      round: roundIndex + 1,
      title,
      status: "ready-for-supervised-foreground-run",
    }))),
  };
}

function buildRound11Cycle() {
  const themes = [
    ["Authority and repository truth", "Reconcile active goals, ownership, branch state, aliases, and public/private boundaries."],
    ["Curated marketplace architecture", "Keep ten concise general marketplace plugins backed by thirty hidden bounded internal packages."],
    ["Exact capability preservation", "Prove all retained application and topic capabilities remain mapped exactly once."],
    ["Bundle runtime safety", "Harden input, output, filesystem, profile, and permission boundaries with adversarial tests."],
    ["Manifest and registry reconciliation", "Align the project manifest, marketplace, family, bundle catalog, and audit evidence."],
    ["Supervised autopilot integrity", "Keep plan-and-build execution anchored, allowlisted, bounded, foreground-only, and honestly scoped."],
    ["Continuity and historical evidence", "Preserve prior-wave facts while keeping the 200-step template gated until the current five-wave series closes."],
    ["Cross-project identity boundaries", "Keep SEIS, Eleni-Neferi, and Pantechnoesis distinct while documenting explicit interoperability."],
    ["Validation and delivery readiness", "Run local quality gates, disclose unavailable checks, and prepare reversible feature-branch delivery."],
    ["Human usability and handoff", "Review discovery clarity, installation choices, documentation, risks, rollback, and the next decision."],
  ];
  const actions = [
    "Inspect the authoritative goal and non-goals",
    "Verify canonical repository ownership and affected paths",
    "Snapshot the current branch and worktree without rewriting unrelated changes",
    "Confirm public/private, network, secret, and external-write boundaries",
    "Inventory current inputs and generated outputs",
    "Identify the smallest reversible implementation slice",
    "Check dependencies, blockers, and concurrent-writer risk",
    "Define measurable acceptance evidence",
    "Implement the bounded local change",
    "Regenerate only declared deterministic artifacts",
    "Run syntax and freshness checks",
    "Run focused unit and integration tests",
    "Run adversarial boundary tests",
    "Inspect the diff for scope drift and machine-specific data",
    "Review security, architecture, documentation, and usability impact",
    "Record failed, skipped, and environment-blocked checks",
    "Update goal, risk, rollback, and evidence records",
    "Prepare a focused commit and feature-branch delivery decision",
    "Recheck repository state and retained-source invariants",
    "Hand off the verified result and next bounded action",
  ];
  let stepNumber = 1;
  const rounds = themes.map(([name, objective], index) => ({
    round: index + 1,
    name,
    objective,
    stepRange: [index * 20 + 1, index * 20 + 20],
    steps: actions.map((action) => {
      const number = stepNumber++;
      return {
        number,
        title: `${action} for ${name.toLowerCase()}.`,
        status: "planned-gated",
      };
    }),
  }));
  return {
    round: 11,
    seriesWave: 1,
    totalSteps: 200,
    roundCount: 10,
    stepsPerRound: 20,
    status: "gated-template-not-active",
    activationAuthority: "not-yet-granted",
    historicalWave5EvidenceState: "wave-5-first-80-steps-completed-step-81-in-progress",
    historicalWave5CloseoutClaimed: false,
    backgroundExecution: false,
    progress: {
      completedStepCount: 0,
      inProgressStepNumbers: [],
      plannedStepCount: 200,
    },
    rounds,
  };
}

function buildEscalationSeries(generalAutopilot) {
  const source = generalAutopilot?.escalationSeries;
  const entryGate = "All five current 100-step waves need reproducible completion evidence, followed by a current goal, scope, risk, validation, rollback, ownership, and human-authority review.";
  return {
    source: PATHS.generalAutopilot,
    id: "seis-public-plugin-five-wave-step-escalation",
    direction: source?.direction,
    tierCount: source?.tierCount,
    waveCountPerTier: source?.waveCountPerTier,
    stepIncreasePerTier: 100,
    currentMarketplaceCardCount: 10,
    maximumBundleSize: 15,
    workflowStepsAreMarketplaceCards: false,
    activationRule: "No 200-step or later tier is active while the current five-by-100 series is incomplete.",
    tiers: list(source?.tiers).map((tier, index) => ({
      id: tier?.id,
      order: tier?.order,
      waveCount: tier?.waveCount,
      stepsPerWave: tier?.stepsPerWave,
      roundsPerWave: tier?.stepsPerWave / 20,
      stepsPerRound: 20,
      totalPlannedSteps: tier?.totalPlannedSteps,
      years: [index * 2 + 1, index * 2 + 2],
      status: tier?.status,
      activationAuthority: "not-yet-granted",
      activeCycle: null,
      entryGate,
      backgroundExecution: tier?.backgroundExecution,
      marketplaceCardExpansion: tier?.marketplaceCardExpansion,
    })),
  };
}

function buildTenYearHorizon(escalationSeries) {
  const themes = [
    ["Public package clarity", "Stabilize the curated marketplace, exact-once source maps, and bundle usability evidence."],
    ["Bundle experience maturity", "Improve selection language, migration compatibility, and reversible package evolution."],
    ["Cross-platform contracts", "Align public package contracts with macOS, iPadOS, iOS, web, and CLI evidence where justified."],
    ["Quality and resilience", "Increase local validation, compatibility, security, performance, and documentation coverage."],
    ["Contributor readiness", "Prepare public contribution, review, and package lifecycle guidance without weakening governance."],
    ["Extension governance", "Evaluate plugin and MCP extension pathways under least privilege and reviewed permissions."],
    ["Ecosystem interoperability", "Publish stable, explicit contracts between SEIS, Eleni-Neferi, and Pantechnoesis without identity collapse."],
    ["Sustainable operations", "Strengthen rollback, deprecation, observability, and long-horizon maintenance evidence."],
    ["Public quality benchmark", "Review public package discovery, accessibility, performance, and documentation against current user evidence."],
    ["Ten-year renewal", "Run a human-owned strategy review, retire stale assumptions, and define the next horizon only with current evidence."],
  ];
  return themes.map(([theme, outcome], index) => {
    const year = index + 1;
    const tier = escalationSeries.tiers.find((candidate) => candidate.years.includes(year));
    assert(tier, `missing strategic escalation tier for year ${year}`);
    return {
      year,
      theme,
      intendedOutcome: outcome,
      escalationTierId: tier.id,
      seriesWaveCount: tier.waveCount,
      stepsPerWave: tier.stepsPerWave,
      tierStatus: tier.status,
      execution: "strategic-gated-not-background",
      entryGate: "Current goal, risk, validation, rollback, repository ownership, and human authority are required before work starts.",
      prohibitedAssumption: "No future work, agent process, external delivery, or provider integration is presumed to run automatically.",
    };
  });
}

function buildAutomationRoles() {
  return [
    {
      id: "architect-planner",
      responsibility: "Check goal, source-of-truth inputs, current marketplace boundary, risks, and the next bounded cycle.",
      automatedActions: ["read approved local artifacts", "produce a deterministic plan"],
    },
    {
      id: "bundle-builder",
      responsibility: "Regenerate deterministic marketplace, bundle-package, and consolidation artifacts only through the allowlist.",
      automatedActions: ["run reviewed local generators"],
    },
    {
      id: "safety-reviewer",
      responsibility: "Verify no network, secret, external-write, source-deletion, or bulk-install claim enters the generated contract.",
      automatedActions: ["run local safety validations"],
    },
    {
      id: "qa-validator",
      responsibility: "Run deterministic freshness and node test suites and expose failures directly.",
      automatedActions: ["run reviewed local checks"],
    },
    {
      id: "evidence-reporter",
      responsibility: "Return a bounded foreground report with success, failure, blocked-delivery, and next-action state.",
      automatedActions: ["format local report"],
    },
    {
      id: "delivery-coordinator",
      responsibility: "Prepare but never execute a separate feature-branch GitHub delivery decision.",
      automatedActions: ["report approval-gated next step"],
    },
  ];
}

function assignAutomationRoles(commands, roles) {
  const roleIds = new Set(roles.map((role) => role.id));
  const assigned = commands.map((command, index) => ({
    ...command,
    automationRoleId: automationRoleForPhaseIndex(index),
  }));
  assert(assigned.length === 27, "automation role assignment length is invalid");
  assert(assigned.every((command) => roleIds.has(command.automationRoleId)), "automation role assignment is invalid");
  assert(roles.every((role) => assigned.some((command) => command.automationRoleId === role.id)), "automation role coverage is invalid");
  return assigned;
}

function automationRoleForPhaseIndex(index) {
  if (index >= 0 && index <= 2) return "bundle-builder";
  if (index >= 3 && index <= 5) return "architect-planner";
  if ((index >= 6 && index <= 10) || index === 24) return "safety-reviewer";
  if ((index >= 11 && index <= 15) || (index >= 17 && index <= 23) || index === 25) return "qa-validator";
  if (index === 16) return "evidence-reporter";
  if (index === 26) return "delivery-coordinator";
  throw new Error("automation role assignment index is invalid");
}

function buildCommandAllowlist() {
  return [
    command("node", ["scripts/create-seis-general-plugin-distribution.mjs"], "regenerate the ten-card, thirty-package distribution"),
    command("node", ["scripts/create-seis-general-unified-suite.mjs"], "regenerate the ten-general-plugin unified suite"),
    command("node", ["scripts/create-seis-public-plugin-consolidation.mjs"], "regenerate current consolidation evidence"),
    command("node", ["scripts/create-seis-general-plugin-autopilot.mjs"], "regenerate the canonical cadence roadmap"),
    command("node", ["scripts/create-seis-public-plugin-supervised-autopilot.mjs"], "regenerate this supervised contract"),
    command("node", ["scripts/create-seis-general-plugin-autopilot.mjs"], "reconcile cadence delegation after the supervised contract"),
    command("node", ["scripts/create-seis-general-plugin-distribution.mjs", "--check"], "check distribution freshness"),
    command("node", ["scripts/check-seis-general-plugin-distribution.mjs"], "check the ten-card distribution contract"),
    command("node", ["scripts/create-seis-general-unified-suite.mjs", "--check"], "check unified-suite freshness"),
    command("node", ["scripts/create-seis-public-plugin-consolidation.mjs", "--check"], "check consolidation freshness"),
    command("node", ["scripts/check-seis-public-plugin-release-policy.mjs"], "check the structural release policy"),
    command("node", ["scripts/check-seis-ai-agent-v2.mjs"], "check the current SEIS-Agent contract"),
    command("node", ["scripts/check-seis-agent-plugin-integration-v2.mjs"], "check current agent and plugin integration"),
    command("node", ["scripts/check-seis-general-plugin-install-smoke.mjs", "--mcp-smoke"], "run current install and MCP smoke checks"),
    command("node", ["scripts/create-seis-general-plugin-autopilot.mjs", "--check"], "check canonical cadence freshness"),
    command("node", ["scripts/create-seis-public-plugin-supervised-autopilot.mjs", "--check"], "check supervised contract freshness"),
    command("node", ["scripts/check-seis-general-plugin-user-readiness.mjs", "--json"], "report repository-only user readiness"),
    command("node", ["--test", "plugins/seis-core/test/ten-general-plugin-distribution.test.mjs"], "run ten-general distribution tests"),
    command("node", ["--test", "plugins/seis-core/test/public-plugin-bundles.test.mjs"], "run bundle tests"),
    command("node", ["--test", "plugins/seis-core/test/public-plugin-consolidation.test.mjs"], "run consolidation tests"),
    command("node", ["--test", "plugins/seis-core/test/general-plugin-runtime.test.mjs"], "run general-plugin runtime tests"),
    command("node", ["--test", "plugins/seis-core/test/public-plugin-supervised-autopilot.test.mjs"], "run supervised autopilot tests"),
    command("node", ["--test", "plugins/seis-core/test/ten-general-plugin-autopilot.test.mjs"], "run canonical cadence tests"),
    command("node", ["--test", "plugins/seis-core/test/public-plugin-user-readiness.test.mjs"], "run user-readiness tests"),
    command("node", ["--test", "plugins/seis-core/test/public-marketplace-local-cleanup.test.mjs"], "run bounded local-config fixture tests"),
    command("node", ["--test", "plugins/seis-core/test/marketplace-integrity.test.mjs"], "run marketplace integrity tests"),
    command("git", ["diff", "--check"], "check diff whitespace"),
  ];
}

function command(commandName, args, purpose) {
  return {
    command: commandName,
    args,
    purpose,
    externalWrite: false,
    network: false,
    secrets: false,
    approvalRequired: false,
  };
}

function buildDocument(value) {
  return [
    "# SEIS Public Plugin Supervised Autopilot",
    "",
    `- Goal: ${value.goalId}`,
    `- Parent goal: ${value.parentGoalId}`,
    `- Current marketplace: ${value.currentMarketplace.publicCardCount} general cards (${value.currentMarketplace.internalPackageCount} hidden internal packages, ${value.currentMarketplace.retainedSourceCapabilityCount} retained source capabilities)`,
    `- Reviewed local phases: ${value.commandAllowlist.length}`,
    `- Canonical install: \`${value.currentMarketplace.canonicalInstall}\``,
    "- Execution: supervised foreground plan-and-build only; no background execution.",
    `- Role execution: ${value.executionModel.roleExecution}; each reviewed local phase is assigned exactly once.`,
    `- Current cadence: five 30-step rounds are defined; actual completion is recorded only in ${value.immediateCycle.source.replace(".json", "-execution.json")}. The 100-step series is ${value.fiveWaveSeries.status}.`,
    `- First 200-step template: ${value.round11Cycle.status}; activation authority is ${value.round11Cycle.activationAuthority}.`,
    `- Escalation ladder: ${value.escalationSeries.tiers.map((tier) => tier.stepsPerWave).join(", ")}-step five-wave tiers; workflow steps never expand the ${value.currentMarketplace.publicCardCount}-card marketplace.`,
    `- Isolation: ${value.executionModel.isolationLevel}; ambient network/filesystem isolation and descendant termination are not OS-enforced.`,
    "",
    "## Commands",
    "",
    "```bash",
    "npm run seis:public-plugin-autopilot -- --plan",
    "npm run seis:public-plugin-autopilot -- --apply-safe",
    "```",
    "",
    "`--plan` reads local evidence and reports the next safe phases. `--apply-safe` runs only the reviewed local generator and validation allowlist during the current command invocation. The named roles below are deterministic, sequential automation lanes inside that one process; they are not persistent or parallel sub-agent processes. Neither mode intentionally commits, pushes, merges, installs, releases, deploys, accesses a provider, reads a secret, or opens the network. This is source-reviewed command containment, not a kernel sandbox; child code retains ambient process permissions, and descendant termination is not guaranteed after a hostile child. The reviewed phases are foreground local scripts and are not designed to spawn persistent descendants.",
    "",
    "## Five 30-Step Rounds",
    "",
    ...value.immediateCycle.rounds.flatMap((round) => [
      `### ${round.title}`,
      "",
      ...round.steps.map((step) => `${step.number}. ${step.label}`),
      "",
    ]),
    "## Five-Wave Cadence",
    "",
    `The canonical cadence defines five 30-step rounds (${value.immediateCycle.totalSteps} checkpoints), followed by ${value.fiveWaveSeries.waves} waves of ${value.fiveWaveSeries.stepsPerWave} steps. Completion is not inferred from this plan: only the Goal 0029 execution ledger can advance the cadence. The first ${value.fiveWaveSeries.nextSeries.stepsPerWave}-step series remains ${value.fiveWaveSeries.nextSeries.status}.`,
    "",
    `The legacy continuity artifact is retained at Wave ${value.historicalContinuity.activeWave}, ${value.historicalContinuity.completedSteps}/100 complete, with step ${value.historicalContinuity.inProgressSteps.join(", ")} in progress. It is historical evidence, not current schedule authority.`,
    "",
    "## Escalating Five-Wave Series",
    "",
    "After all five current 100-step waves close with evidence, each later tier retains five waves and adds 100 steps per wave. These are workflow planning steps, never extra marketplace cards or installations. Every 200-step-or-later tier is currently gated and non-background.",
    "",
    "| Tier | Years | Waves | Steps per wave | Total planned steps | State |",
    "| --- | --- | ---: | ---: | ---: | --- |",
    ...value.escalationSeries.tiers.map((tier) => `| ${tier.id} | ${tier.years.join("–")} | ${tier.waveCount} | ${tier.stepsPerWave} | ${tier.totalPlannedSteps} | ${tier.status} |`),
    "",
    "## Gated 200-Step Compatibility Template",
    "",
    ...value.round11Cycle.rounds.flatMap((round) => [
      `### ${round.round}. ${round.name} (steps ${round.stepRange[0]}–${round.stepRange[1]})`,
      "",
      round.objective,
      "",
      ...round.steps.map((step) => `${step.number}. ${step.title} — ${step.status}`),
      "",
    ]),
    "",
    "## Ten-Year Strategic Horizon",
    "",
    "| Year | Tier | Steps per wave | Theme | Intended outcome | Execution boundary |",
    "| --- | --- | ---: | --- | --- | --- |",
    ...value.tenYearHorizon.map((year) => `| ${year.year} | ${year.escalationTierId} | ${year.stepsPerWave} | ${year.theme} | ${year.intendedOutcome} | ${year.execution} |`),
    "",
    "## Automation Roles",
    "",
    "Named roles are a reviewable execution ledger, not independently running agents. Phases always run sequentially in the reviewed allowlist order.",
    "",
    "| Role | Reviewed local phases | Responsibility |",
    "| --- | ---: | --- |",
    ...value.automationRoles.map((role) => `| ${role.id} | ${value.commandAllowlist.filter((command) => command.automationRoleId === role.id).length} | ${role.responsibility} |`),
    "",
    "## GitHub Delivery",
    "",
    `${value.githubDelivery.nextAction} This runner never executes that action.`,
    "",
    "## Rollback",
    "",
    value.rollback.scope,
  ].join("\n");
}

function validateProgram(value) {
  assert(value.id === "seis-public-plugin-supervised-autopilot" && value.goalId === "SEIS-GOAL-0025" && value.parentGoalId === "SEIS-GOAL-0024", "program identity is invalid");
  assert(value.status === "active-supervised-foreground-automation" && value.maturity === "prototype", "program status is invalid");
  assert(value.currentMarketplace?.canonicalInstall === "seis-ai-agent@seis-repo" && value.currentMarketplace?.publicCardCount === 10 && value.currentMarketplace?.generalPluginCardCount === 10 && value.currentMarketplace?.internalPackageCount === 30 && value.currentMarketplace?.internalPackageCardCount === 0 && value.currentMarketplace?.retainedSourceCapabilityCount === 380 && value.currentMarketplace?.maximumPackageSize === 15, "marketplace state is invalid");
  assert(value.executionModel?.planAndBuildInOneInvocation === true && value.executionModel?.persistentProcess === false && value.executionModel?.backgroundExecution === false && value.executionModel?.roleExecution === "foreground-sequential-reviewed-allowlist" && value.executionModel?.githubPush === false && value.executionModel?.externalWrites === false && value.executionModel?.intentionalNetworkActions === false && value.executionModel?.intentionalSecretAccess === false && value.executionModel?.destructiveActions === false, "execution boundary is invalid");
  assert(value.executionModel?.isolationLevel === "reviewed-allowlist-no-os-sandbox" && value.executionModel?.ambientNetworkIsolationEnforced === false && value.executionModel?.ambientFilesystemIsolationEnforced === false && value.executionModel?.descendantTerminationGuaranteed === false, "isolation disclosure is invalid");
  const roleIds = ["architect-planner", "bundle-builder", "safety-reviewer", "qa-validator", "evidence-reporter", "delivery-coordinator"];
  assert(value.automationRoles?.length === roleIds.length && value.automationRoles.every((role, index) => role?.id === roleIds[index]), "automation roles are invalid");
  assert(value.immediateCycle?.source === PATHS.generalAutopilot && value.immediateCycle?.status === "execution-state-in-external-ledger" && value.immediateCycle?.totalSteps === 150 && value.immediateCycle?.roundCount === 5 && value.immediateCycle?.stepsPerRound === 30 && value.immediateCycle?.rounds?.length === 5 && value.immediateCycle?.rounds?.every((round) => round.status === "planned-not-executed" && round.steps?.length === 30), "immediate cycle is invalid");
  assert(value.fiveWaveSeries?.source === PATHS.generalAutopilot && value.fiveWaveSeries?.status === "blocked-by-incomplete-five-30-step-rounds" && value.fiveWaveSeries?.activeWave === null && value.fiveWaveSeries?.nextWave === 1 && value.fiveWaveSeries?.waves === 5 && value.fiveWaveSeries?.stepsPerWave === 100 && value.fiveWaveSeries?.roundsPerWave === 5 && value.fiveWaveSeries?.waveStatuses?.length === 5 && value.fiveWaveSeries.waveStatuses.every((wave) => wave.status === "planned-not-background" && wave.completedSteps === 0 && wave.nextStep === null) && value.fiveWaveSeries?.nextSeries?.waves === 5 && value.fiveWaveSeries?.nextSeries?.stepsPerWave === 200 && value.fiveWaveSeries?.nextSeries?.status === "gated-until-five-100-step-waves-complete" && value.fiveWaveSeries?.backgroundExecution === false, "five-wave series is invalid");
  const escalationTiers = list(value.escalationSeries?.tiers);
  const expectedEscalationSteps = [200, 300, 400, 500, 600];
  assert(value.escalationSeries?.source === PATHS.generalAutopilot && value.escalationSeries?.id === "seis-public-plugin-five-wave-step-escalation" && value.escalationSeries?.direction === "increase-100-steps-per-wave-after-each-five-wave-series" && value.escalationSeries?.tierCount === 5 && value.escalationSeries?.waveCountPerTier === 5 && value.escalationSeries?.stepIncreasePerTier === 100 && value.escalationSeries?.currentMarketplaceCardCount === 10 && value.escalationSeries?.maximumBundleSize === 15 && value.escalationSeries?.workflowStepsAreMarketplaceCards === false, "escalation series identity is invalid");
  assert(escalationTiers.length === expectedEscalationSteps.length && escalationTiers.every((tier, index) => tier?.id === `five-wave-${expectedEscalationSteps[index]}` && tier?.order === index + 1 && tier?.waveCount === 5 && tier?.stepsPerWave === expectedEscalationSteps[index] && tier?.roundsPerWave === expectedEscalationSteps[index] / 20 && tier?.stepsPerRound === 20 && tier?.totalPlannedSteps === expectedEscalationSteps[index] * 5 && list(tier?.years).join(",") === `${index * 2 + 1},${index * 2 + 2}` && tier?.backgroundExecution === false && tier?.marketplaceCardExpansion === false), "escalation series tiers are invalid");
  assert(escalationTiers[0]?.status === "gated-until-five-100-step-waves-complete", "first escalation tier must remain gated");
  assert(escalationTiers.slice(1).every((tier) => tier?.status === "strategic-gated-not-background"), "later escalation tiers must remain strategic and gated");
  assert(escalationTiers.every((tier) => tier?.activationAuthority === "not-yet-granted" && tier?.activeCycle === null), "all escalation tiers must remain gated");
  assert(value.round11Cycle?.round === 11 && value.round11Cycle?.totalSteps === 200 && value.round11Cycle?.roundCount === 10 && value.round11Cycle?.stepsPerRound === 20 && value.round11Cycle?.status === "gated-template-not-active" && value.round11Cycle?.activationAuthority === "not-yet-granted" && value.round11Cycle?.historicalWave5CloseoutClaimed === false && value.round11Cycle?.progress?.completedStepCount === 0 && list(value.round11Cycle?.progress?.inProgressStepNumbers).length === 0 && value.round11Cycle?.progress?.plannedStepCount === 200 && value.round11Cycle?.rounds?.every((round) => round.steps?.length === 20 && round.steps.every((step) => step.status === "planned-gated")), "Round 11 compatibility template is invalid");
  assert(value.historicalContinuity?.status === "legacy-wave-5-incomplete-retained-evidence" && value.historicalContinuity?.activeWave === 5 && value.historicalContinuity?.completedSteps === 80 && list(value.historicalContinuity?.inProgressSteps).join(",") === "81" && value.historicalContinuity?.closeoutClaimed === false && value.historicalContinuity?.escalationActivationState === "gated-until-wave-5-completes", "historical continuity boundary is invalid");
  assert(value.tenYearHorizon?.length === 10 && value.tenYearHorizon?.every((year, index) => year?.year === index + 1 && year?.execution === "strategic-gated-not-background" && year?.escalationTierId === `five-wave-${expectedEscalationSteps[Math.floor(index / 2)]}` && year?.seriesWaveCount === 5 && year?.stepsPerWave === expectedEscalationSteps[Math.floor(index / 2)]), "ten-year horizon is invalid");
  assert(value.commandAllowlist?.length === 27 && value.commandAllowlist?.every((entry) => (entry.command === "node" || entry.command === "git") && entry.externalWrite === false && entry.network === false && entry.secrets === false && roleIds.includes(entry.automationRoleId)) && roleIds.every((roleId) => value.commandAllowlist.some((entry) => entry.automationRoleId === roleId)), "command allowlist is invalid");
  assert(Object.values(value.checks || {}).every(Boolean), "one or more source checks are invalid");
  assert(value.publicBoundary?.personalMarketplaceRead === false && value.publicBoundary?.personalMarketplaceMutation === false && value.publicBoundary?.network === false && value.publicBoundary?.externalWrites === false && value.publicBoundary?.secrets === false && value.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(value)), "program must not contain a machine-specific path");
}

function readJson(relativePath) {
  return JSON.parse(readRequiredText(relativePath));
}

function readRequiredText(relativePath) {
  return readBoundedText(relativePath, true);
}

function readOptionalText(relativePath) {
  return readBoundedText(relativePath, false);
}

function readBoundedText(relativePath, required) {
  const absolutePath = safePath(relativePath);
  const parts = path.relative(ROOT, absolutePath).split(path.sep).filter(Boolean);
  let current = ROOT;
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) {
      if (required) throw new Error(`SEIS public plugin supervised autopilot: required input is missing: ${relativePath}`);
      return null;
    }
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error(`SEIS public plugin supervised autopilot: symbolic-link input component is forbidden: ${relativePath}`);
    const final = index === parts.length - 1;
    if ((!final && !stat.isDirectory()) || (final && (!stat.isFile() || stat.size > MAX_INPUT_BYTES))) {
      throw new Error(`SEIS public plugin supervised autopilot: unsafe required input: ${relativePath}`);
    }
  }
  const descriptor = fs.openSync(absolutePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile() || stat.size > MAX_INPUT_BYTES) throw new Error(`SEIS public plugin supervised autopilot: unsafe required input: ${relativePath}`);
    return fs.readFileSync(descriptor, "utf8");
  } finally {
    fs.closeSync(descriptor);
  }
}

function writeText(relativePath, value) {
  const absolutePath = safePath(relativePath);
  const parent = path.dirname(absolutePath);
  validateDirectoryChain(parent);
  if (fs.existsSync(absolutePath)) {
    const stat = fs.lstatSync(absolutePath);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`SEIS public plugin supervised autopilot: unsafe output: ${relativePath}`);
  }
  writeSequence += 1;
  const temporaryPath = path.join(ROOT, `.seis-public-autopilot-write.${process.pid}.${writeSequence}.tmp`);
  let descriptor = null;
  try {
    descriptor = fs.openSync(temporaryPath, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o644);
    fs.writeFileSync(descriptor, value, "utf8");
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = null;
    validateDirectoryChain(parent);
    if (fs.existsSync(absolutePath)) {
      const stat = fs.lstatSync(absolutePath);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`SEIS public plugin supervised autopilot: output changed to an unsafe entry: ${relativePath}`);
    }
    fs.renameSync(temporaryPath, absolutePath);
  } catch (error) {
    if (descriptor !== null) fs.closeSync(descriptor);
    if (fs.existsSync(temporaryPath) && !fs.lstatSync(temporaryPath).isSymbolicLink()) fs.unlinkSync(temporaryPath);
    throw error;
  }
}

function validateDirectoryChain(directory) {
  const rootStat = fs.lstatSync(ROOT);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error("SEIS public plugin supervised autopilot: repository root must be a regular directory");
  const relative = path.relative(ROOT, directory);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("SEIS public plugin supervised autopilot: output parent escapes repository root");
  let current = ROOT;
  for (const part of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const stat = fs.lstatSync(current);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`SEIS public plugin supervised autopilot: unsafe output parent: ${path.relative(ROOT, current)}`);
  }
}

function safePath(relativePath) {
  if (typeof relativePath !== "string" || !relativePath || path.isAbsolute(relativePath)) throw new Error(`SEIS public plugin supervised autopilot: invalid repository-relative path: ${String(relativePath)}`);
  const absolutePath = path.resolve(ROOT, relativePath);
  const relative = path.relative(ROOT, absolutePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`SEIS public plugin supervised autopilot: path escapes repository root: ${relativePath}`);
  return absolutePath;
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin supervised autopilot: ${message}`);
}
