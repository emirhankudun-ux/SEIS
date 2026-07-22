#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.length === 3 && process.argv[2] === "--check";
if (process.argv.length > 2 && !checkMode) throw new Error("Usage: node scripts/create-seis-general-plugin-autopilot.mjs [--check]");

const outputPath = "content/development/seis-general-plugin-autopilot.json";
const documentPath = "docs/roadmap/SEIS_TEN_GENERAL_PLUGIN_30_STEP_ROADMAP.md";
const executionLedgerPath = "content/development/seis-general-plugin-autopilot-execution.json";
const family = readJson("content/development/seis-public-plugin-family.json");
const program = buildProgram();
const outputs = [
  [outputPath, `${JSON.stringify(program, null, 2)}\n`],
  [documentPath, `${buildDocument(program)}\n`],
];

validate(program);
if (checkMode) {
  const stale = outputs.filter(([file, content]) => readOptional(file) !== content).map(([file]) => file);
  if (stale.length) {
    console.error("SEIS ten-general-plugin Auto Mode files are stale:");
    for (const file of stale) console.error(`- ${file}`);
    process.exit(1);
  }
  console.log("SEIS ten-general-plugin Auto Mode check passed.");
} else {
  for (const [file, content] of outputs) fs.writeFileSync(path.join(root, file), content);
  console.log("Wrote SEIS ten-general-plugin Auto Mode program and 30-step roadmap.");
}

function buildProgram() {
  const rounds = buildRounds();
  return {
    schemaVersion: 3,
    id: "seis-ten-general-plugin-autopilot",
    goalId: "SEIS-GOAL-0029",
    generatedAt: "2026-07-22",
    status: "active-foreground-cadence-plan",
    currentMarketplace: {
      canonicalInstall: "seis-ai-agent@seis-repo",
      publicCardCount: 10,
      generalPluginCardCount: 10,
      internalPackageCardCount: 0,
      internalPackageCount: 30,
      internalPackagesPerGeneralPlugin: 3,
      retainedSourceCapabilityCount: 380,
      maximumPackageSize: 15,
    },
    executionModel: {
      planAndBuildInOneInvocation: true,
      roleExecution: "foreground-sequential-reviewed-allowlist",
      persistentProcess: false,
      backgroundExecution: false,
      externalWrites: false,
      intentionalNetworkActions: false,
      intentionalSecretAccess: false,
      githubPush: false,
      publication: false,
      localRepositoryWrites: "only deterministic generated artifacts and the bounded execution ledger during --apply-safe",
      note: "This records a supervised operating model; it does not claim that agents continue after the current task ends.",
    },
    executionLedger: {
      path: executionLedgerPath,
      status: "separate-foreground-evidence-required",
      actualCompletionAuthority: "only the bounded execution ledger written by the Goal 0029 runner",
      automaticCompletion: false,
      acceptsExternalDeliveryEvidence: false,
    },
    immediateCycle: {
      status: "execution-state-in-external-ledger",
      totalSteps: 150,
      roundCount: 5,
      stepsPerRound: 30,
      rounds,
      note: "This generated document is a plan. It does not claim that any round has run; inspect the execution ledger for real foreground evidence.",
    },
    fiveWaveSeries: {
      status: "blocked-by-incomplete-five-30-step-rounds",
      activeWave: null,
      nextWave: 1,
      waves: 5,
      stepsPerWave: 100,
      roundsPerWave: 5,
      waveStatuses: Array.from({ length: 5 }, (_, index) => ({
        wave: index + 1,
        status: "planned-not-background",
        completedSteps: 0,
        nextStep: null,
        blocker: "five-30-step-rounds-require-reproducible-foreground-evidence",
        backgroundExecution: false,
      })),
      nextSeries: { waves: 5, stepsPerWave: 200, status: "gated-until-five-100-step-waves-complete" },
    },
    escalationSeries: {
      direction: "increase-100-steps-per-wave-after-each-five-wave-series",
      tierCount: 5,
      waveCountPerTier: 5,
      tiers: [200, 300, 400, 500, 600].map((stepsPerWave, index) => ({
        id: `five-wave-${stepsPerWave}`,
        order: index + 1,
        stepsPerWave,
        waveCount: 5,
        totalPlannedSteps: stepsPerWave * 5,
        status: index === 0 ? "gated-until-five-100-step-waves-complete" : "strategic-gated-not-background",
        activationAuthority: "not-yet-granted",
        activeCycle: null,
        backgroundExecution: false,
        marketplaceCardExpansion: false,
      })),
    },
    tenYearHorizon: Array.from({ length: 10 }, (_, index) => ({
      year: index + 1,
      escalationTierId: `five-wave-${[200, 300, 400, 500, 600][Math.floor(index / 2)]}`,
      execution: "strategic-gated-not-background",
      focus: ["foundation", "product workflows", "multi-platform", "reliability", "stable platform"][Math.min(4, Math.floor(index / 2))],
    })),
    automationRoles: [
      { id: "architect-planner", responsibility: "goal, ownership, scope, and dependency decisions" },
      { id: "package-builder", responsibility: "deterministic local artifact generation" },
      { id: "safety-reviewer", responsibility: "least privilege, approval, and public/private review" },
      { id: "qa-validator", responsibility: "focused validation and freshness checks" },
      { id: "evidence-reporter", responsibility: "bounded foreground evidence and skipped-check reporting" },
      { id: "delivery-coordinator", responsibility: "focused commit and approval-gated GitHub handoff" },
    ],
    canonicalAutomation: {
      goalId: "SEIS-GOAL-0029",
      runner: "scripts/run-seis-general-plugin-autopilot.mjs",
      reviewedPhaseCount: 30,
      repositoryAnchored: true,
      evidenceLedger: executionLedgerPath,
      note: "The runner owns a hard-coded local command allowlist. This generated roadmap supplies labels and topology only, so it cannot inject commands or self-mark planned work complete.",
    },
    evidenceBoundary: {
      manualUiCheckRequired: true,
      localConfigCheckOptional: true,
      publicationRequiresHumanApproval: true,
      historical34CardArtifacts: "retained as history and excluded from the active v2 validation allowlist",
    },
    familyContract: {
      publicPluginCount: family?.marketplace?.publicPluginCount,
      generalPluginCount: family?.marketplace?.generalPluginCount,
      internalPackageCount: family?.marketplace?.internalPackageCount,
      sourceCapabilityCount: family?.marketplace?.sourceCapabilityCount,
    },
  };
}

function buildRounds() {
  const checkpoints = ["Inspect", "Plan", "Build", "Validate", "Record command evidence for"];
  const specifications = [
    ["Round 1 — Truth and topology", [
      "Confirm the ten public marketplace names are unique and user-readable.",
      "Confirm SEIS-Agent remains the canonical default entry point.",
      "Confirm the thirty internal packages cover app and topic sources exactly once.",
      "Confirm every internal package contains no more than fifteen capabilities.",
      "Remove active references to numbered duplicate topic and application cards.",
      "Record version, risk, rollback, and public-release approval boundaries.",
    ]],
    ["Round 2 — User selection", [
      "Generate the ten-card marketplace projection from the canonical family plan.",
      "Generate each general-plugin profile with exactly three internal packages.",
      "Validate the default SEIS-Agent plan without installing anything.",
      "Validate deterministic local finder results stay at three or fewer candidates.",
      "Validate a scoped general-plugin plan never targets an internal package directly.",
      "Document the one-general-plugin-per-task rule in README, skill, and platform docs.",
    ]],
    ["Round 3 — Supervised automation", [
      "Assign architect-planner responsibility for scope and ownership review.",
      "Assign package-builder responsibility for deterministic artifact generation.",
      "Assign safety-reviewer responsibility for permissions and public/private boundaries.",
      "Assign QA-validator responsibility for freshness, package, and install checks.",
      "Assign evidence-reporter responsibility for generated reports and skipped checks.",
      "Assign delivery-coordinator responsibility for reviewable commit and approval-gated GitHub delivery.",
    ]],
    ["Round 4 — Runtime and release", [
      "Validate the MCP server exposes local read-only general-plugin guidance.",
      "Keep legacy public-bundle MCP names as compatibility aliases only.",
      "Regenerate the unified suite with the ten/30 topology.",
      "Verify the structural distribution version increased for this major update.",
      "Require a future version increase for card-count or package-topology changes.",
      "Keep marketplace publication, tags, deploys, credentials, and external writes human-approved.",
    ]],
    ["Round 5 — Evidence and continuation", [
      "Run focused distribution, version-policy, unified-suite, agent, and MCP smoke checks.",
      "Run user-readiness checks without reading local Codex configuration by default.",
      "Run the optional read-only local configuration review only when requested.",
      "Require manual Codex refresh to verify the rendered ten-card UI.",
      "Prepare a focused branch commit that excludes unrelated user-staged evidence.",
      "Push only a focused commit; keep public release separate and approval-gated.",
    ]],
  ];
  return specifications.map(([title, objectives], roundIndex) => ({
    id: `round-${roundIndex + 1}`,
    title,
    status: "planned-not-executed",
    steps: checkpoints.flatMap((checkpoint, checkpointIndex) => objectives.map((objective, objectiveIndex) => ({
      number: checkpointIndex * objectives.length + objectiveIndex + 1,
      globalNumber: roundIndex * 30 + checkpointIndex * objectives.length + objectiveIndex + 1,
      checkpoint: checkpoint.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      label: `${checkpoint}: ${objective}`,
      status: "planned-not-executed",
    }))),
  }));
}

function buildDocument(program) {
  const lines = [
    "# SEIS Ten-General-Plugin 30-Step Roadmap",
    "",
    "This is the active distribution roadmap. It turns the previous visually repetitive marketplace into ten general user-facing plugins backed by thirty bounded internal packages. It is a foreground-only plan-and-build model, not a claim of background execution.",
    "",
    "## Fixed user surface",
    "",
    "- Public cards: 10",
    "- Internal packages: 30",
    "- Packages per general plugin: 3",
    "- Maximum capabilities per internal package: 15",
    "- Default: SEIS-Agent",
    "- Selection: one general plugin per scoped task",
    "",
    "## Evidence rule",
    "",
    `This roadmap never marks a step complete by itself. Only [${program.executionLedger.path}](../../${program.executionLedger.path}) written by the Goal 0029 foreground runner can record completed local checkpoints. It records bounded command metadata, not secrets, provider output, publication, or background work.`,
    "",
    "## Five 30-step rounds",
    "",
  ];
  for (const round of program.immediateCycle.rounds) {
    lines.push(`### ${round.title}`, "");
    for (const step of round.steps) lines.push(`${step.number}. ${step.label}`);
    lines.push("");
  }
  lines.push(
    "## Current transition",
    "",
    "The five 30-step rounds are planned but are not completed by this document. The five 100-step waves remain blocked until all initial rounds have reproducible foreground evidence. This status authorizes no background execution or automatic external delivery.",
    "",
    "## Long-horizon cadence",
    "",
    "After the five 30-step rounds (150 checkpoints) have evidence, the roadmap moves to five 100-step waves. The first 200-step wave cannot activate until all five 100-step waves have reproducible completion evidence. Each later five-wave series adds 100 steps per wave: 200, 300, 400, 500, then 600. These are strategic planning tiers across a ten-year horizon; they never create background agents or expand the 10-card user surface by themselves.",
    "",
    "## Automation boundary",
    "",
    "The Goal 0029 runner owns a reviewed, hard-coded local command allowlist and can plan plus build only during one foreground invocation. Commit, push, publication, release, deployment, credential use, and external write access remain separate human-approved actions.",
  );
  return lines.join("\n");
}

function validate(record) {
  const failures = [];
  const assert = (condition, message) => { if (!condition) failures.push(message); };
  assert(record?.goalId === "SEIS-GOAL-0029", "goal linkage is invalid");
  assert(record?.currentMarketplace?.publicCardCount === 10 && record.currentMarketplace?.generalPluginCardCount === 10 && record.currentMarketplace?.internalPackageCount === 30 && record.currentMarketplace?.internalPackageCardCount === 0 && record.currentMarketplace?.maximumPackageSize === 15, "marketplace topology is invalid");
  assert(record?.executionModel?.planAndBuildInOneInvocation === true && record.executionModel?.backgroundExecution === false && record.executionModel?.persistentProcess === false && record.executionModel?.externalWrites === false && record.executionModel?.intentionalNetworkActions === false, "foreground execution boundary is invalid");
  assert(record?.executionLedger?.path === executionLedgerPath && record.executionLedger?.status === "separate-foreground-evidence-required" && record.executionLedger?.automaticCompletion === false, "execution-ledger boundary is invalid");
  assert(record?.immediateCycle?.status === "execution-state-in-external-ledger" && record.immediateCycle?.totalSteps === 150 && record.immediateCycle?.roundCount === 5 && record.immediateCycle?.stepsPerRound === 30 && record.immediateCycle?.rounds?.length === 5 && record.immediateCycle.rounds.every((round, roundIndex) => round.id === `round-${roundIndex + 1}` && round.status === "planned-not-executed" && round.steps?.length === 30 && round.steps.every((step, stepIndex) => step.number === stepIndex + 1 && step.globalNumber === roundIndex * 30 + stepIndex + 1 && step.status === "planned-not-executed")), "five 30-step rounds are invalid");
  assert(record?.fiveWaveSeries?.status === "blocked-by-incomplete-five-30-step-rounds" && record.fiveWaveSeries?.activeWave === null && record.fiveWaveSeries?.nextWave === 1 && record.fiveWaveSeries?.waves === 5 && record.fiveWaveSeries?.stepsPerWave === 100 && record.fiveWaveSeries?.waveStatuses?.length === 5 && record.fiveWaveSeries.waveStatuses.every((wave) => wave.status === "planned-not-background" && wave.completedSteps === 0 && wave.nextStep === null && wave.backgroundExecution === false) && record.fiveWaveSeries?.nextSeries?.stepsPerWave === 200 && record.fiveWaveSeries?.nextSeries?.status === "gated-until-five-100-step-waves-complete", "five-wave cadence is invalid");
  assert(record?.escalationSeries?.tiers?.map((tier) => tier.stepsPerWave).join(",") === "200,300,400,500,600" && record.escalationSeries.tiers[0]?.status === "gated-until-five-100-step-waves-complete" && record.escalationSeries.tiers.every((tier) => tier.activationAuthority === "not-yet-granted" && tier.activeCycle === null && tier.backgroundExecution === false && tier.marketplaceCardExpansion === false), "escalation series is invalid");
  assert(record?.tenYearHorizon?.length === 10 && record.tenYearHorizon.every((year) => year.execution === "strategic-gated-not-background"), "ten-year horizon is invalid");
  assert(record?.automationRoles?.length === 6 && record?.canonicalAutomation?.goalId === "SEIS-GOAL-0029" && record.canonicalAutomation?.runner === "scripts/run-seis-general-plugin-autopilot.mjs" && record.canonicalAutomation?.reviewedPhaseCount === 30 && record.canonicalAutomation?.repositoryAnchored === true && record.canonicalAutomation?.evidenceLedger === executionLedgerPath && record?.commandAllowlist === undefined, "canonical automation contract is invalid");
  assert(record?.familyContract?.publicPluginCount === 10 && record.familyContract?.generalPluginCount === 10 && record.familyContract?.internalPackageCount === 30 && record.familyContract?.sourceCapabilityCount === 380, "family contract is invalid");
  if (failures.length) throw new Error(`SEIS Auto Mode validation failed: ${failures.join("; ")}`);
}

function readJson(relativePath) { return JSON.parse(readOptional(relativePath) || "null"); }
function readOptional(relativePath) { try { return fs.readFileSync(path.join(root, relativePath), "utf8"); } catch { return null; } }
