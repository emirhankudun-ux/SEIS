#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const outputPath = "content/development/seis-general-plugin-autopilot.json";
const documentPath = "docs/roadmap/SEIS_TEN_GENERAL_PLUGIN_30_STEP_ROADMAP.md";
const family = readJson("content/development/seis-public-plugin-family.json");
const supervisedProgram = readJson("content/development/seis-public-plugin-supervised-autopilot.json");
const supervisedRunner = readOptional("scripts/run-seis-public-plugin-supervised-autopilot.mjs") || "";
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
  const checkpoints = ["Inspect", "Plan", "Build", "Validate", "Record evidence for"];
  const rounds = [
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
      "Verify the structural distribution version increased from 0.3.0 to 0.4.0.",
      "Require a future version increase for card-count or package-topology changes.",
      "Keep marketplace publication, tags, deploys, credentials, and external writes human-approved.",
    ]],
    ["Round 5 — Evidence and continuation", [
      "Run focused distribution, version-policy, unified-suite, agent, and MCP smoke checks.",
      "Run user-readiness checks without reading local Codex configuration by default.",
      "Run the optional read-only local configuration review only when requested.",
      "Require manual Codex refresh to verify the rendered ten-card UI.",
      "Prepare a focused branch commit that excludes unrelated user-staged evidence.",
      "Push only the focused commit; keep public release separate and approval-gated.",
    ]],
  ].map(([title, labels], index) => ({
    id: `round-${index + 1}`,
    title,
    status: "completed-in-round-ledger",
    steps: checkpoints.flatMap((checkpoint, checkpointIndex) => labels.map((label, itemIndex) => ({
      number: checkpointIndex * labels.length + itemIndex + 1,
      globalNumber: index * 30 + checkpointIndex * labels.length + itemIndex + 1,
      checkpoint: checkpoint.toLowerCase().replace(/\s+/g, "-"),
      label: `${checkpoint}: ${label}`,
      status: "recorded-in-round-ledger",
    }))),
  }));
  return {
    schemaVersion: 2,
    id: "seis-ten-general-plugin-autopilot",
    goalId: "SEIS-GOAL-0029",
    generatedAt: "2026-07-22",
    status: "active-foreground-plan-and-build",
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
      note: "This records a supervised operating model; it does not claim that agents continue after the current task ends.",
    },
    immediateCycle: { status: "completed-five-30-step-rounds", completedRoundCount: 5, totalSteps: 150, roundCount: 5, stepsPerRound: 30, rounds },
    fiveWaveSeries: {
      status: "wave-1-in-progress-foreground-only",
      activeWave: 1,
      waves: 5,
      stepsPerWave: 100,
      roundsPerWave: 5,
      waveStatuses: Array.from({ length: 5 }, (_, index) => ({
        wave: index + 1,
        status: index === 0 ? "in-progress" : "planned-not-background",
        completedSteps: 0,
        nextStep: index === 0 ? 1 : null,
        backgroundExecution: false,
      })),
      nextSeries: { waves: 5, stepsPerWave: 200, status: "strategic-gated-not-background" },
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
        status: index === 0 ? "ready-after-five-100-step-waves" : "strategic-gated-not-background",
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
      { id: "evidence-reporter", responsibility: "evidence, risk, rollback, and skipped-check reporting" },
      { id: "delivery-coordinator", responsibility: "focused commit and approval-gated GitHub handoff" },
    ],
    canonicalAutomation: {
      goalId: "SEIS-GOAL-0025",
      contract: "content/development/seis-public-plugin-supervised-autopilot.json",
      runner: "scripts/run-seis-public-plugin-supervised-autopilot.mjs",
      reviewedPhaseCount: supervisedProgram?.commandAllowlist?.length,
      roleCount: supervisedProgram?.automationRoles?.length,
      repositoryAnchored: supervisedRunner.includes("fileURLToPath(import.meta.url)") && supervisedRunner.includes("snapshotPhaseTarget") && supervisedRunner.includes("verifyPhaseTarget"),
      note: "This Goal 0029 record is a cadence and distribution roadmap only. All execution delegates to the hardened Goal 0025 runner; it defines no second editable command allowlist.",
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
    "## Five 30-step rounds",
    "",
  ];
  for (const round of program.immediateCycle.rounds) {
    lines.push(`### ${round.title}`, "");
    for (const step of round.steps) lines.push(`${step.number}. ${step.label}`);
    lines.push("");
  }
  lines.push("## Current transition", "", "All five 30-step round ledgers are closed. Wave 1 of the five 100-step series is now in progress with step 1 next; this status authorizes no background execution or automatic external delivery.", "");
  lines.push("## Long-horizon cadence", "", "The roadmap begins with five 30-step rounds (150 recorded checkpoints), then moves to five 100-step waves. Each later five-wave series adds 100 steps per wave: 200, 300, 400, 500, then 600. These are strategic planning tiers across a ten-year horizon; they never create background agents or expand the 10-card user surface by themselves.", "", "## Automation boundary", "", "This Goal 0029 roadmap defines no competing executable allowlist. Plan-and-build execution delegates to the repository-anchored, revalidated Goal 0025 runner. Commit, push, publication, release, deployment, credential use, and external write access remain separate human-approved actions.");
  return lines.join("\n");
}

function validate(record) {
  const failures = [];
  const assert = (condition, message) => { if (!condition) failures.push(message); };
  assert(record?.goalId === "SEIS-GOAL-0029", "goal linkage is invalid");
  assert(record?.currentMarketplace?.publicCardCount === 10 && record.currentMarketplace?.generalPluginCardCount === 10 && record.currentMarketplace?.internalPackageCount === 30 && record.currentMarketplace?.internalPackageCardCount === 0 && record.currentMarketplace?.maximumPackageSize === 15, "marketplace topology is invalid");
  assert(record?.executionModel?.planAndBuildInOneInvocation === true && record.executionModel?.backgroundExecution === false && record.executionModel?.persistentProcess === false && record.executionModel?.externalWrites === false && record.executionModel?.intentionalNetworkActions === false, "foreground execution boundary is invalid");
  assert(record?.immediateCycle?.status === "completed-five-30-step-rounds" && record.immediateCycle?.completedRoundCount === 5 && record.immediateCycle?.totalSteps === 150 && record.immediateCycle?.stepsPerRound === 30 && record.immediateCycle?.rounds?.length === 5 && record.immediateCycle.rounds.every((round) => round.status === "completed-in-round-ledger" && round.steps?.length === 30 && round.steps.every((step, index) => step.number === index + 1)), "five 30-step rounds are invalid");
  assert(record?.fiveWaveSeries?.status === "wave-1-in-progress-foreground-only" && record.fiveWaveSeries?.activeWave === 1 && record.fiveWaveSeries?.waves === 5 && record.fiveWaveSeries?.stepsPerWave === 100 && record.fiveWaveSeries?.waveStatuses?.length === 5 && record.fiveWaveSeries.waveStatuses[0]?.status === "in-progress" && record.fiveWaveSeries.waveStatuses.slice(1).every((wave) => wave.status === "planned-not-background") && record.fiveWaveSeries?.nextSeries?.stepsPerWave === 200, "five-wave cadence is invalid");
  assert(record?.escalationSeries?.tiers?.map((tier) => tier.stepsPerWave).join(",") === "200,300,400,500,600", "escalation series is invalid");
  assert(record?.tenYearHorizon?.length === 10 && record.tenYearHorizon.every((year) => year.execution === "strategic-gated-not-background"), "ten-year horizon is invalid");
  assert(record?.automationRoles?.length === 6 && record?.canonicalAutomation?.goalId === "SEIS-GOAL-0025" && record.canonicalAutomation?.reviewedPhaseCount === 48 && record.canonicalAutomation?.roleCount === 6 && record.canonicalAutomation?.repositoryAnchored === true, "canonical automation delegation is invalid");
  assert(record?.familyContract?.publicPluginCount === 10 && record.familyContract?.generalPluginCount === 10 && record.familyContract?.internalPackageCount === 30 && record.familyContract?.sourceCapabilityCount === 380, "family contract is invalid");
  if (failures.length) throw new Error(`SEIS Auto Mode validation failed: ${failures.join("; ")}`);
}
function readJson(relativePath) { return JSON.parse(readOptional(relativePath) || "null"); }
function readOptional(relativePath) { try { return fs.readFileSync(path.join(root, relativePath), "utf8"); } catch { return null; } }
