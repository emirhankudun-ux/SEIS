#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-continuity-cadence.json";
const INITIAL_PROGRAM_PATH = "content/development/seis-public-plugin-expansion-program.json";
const WAVE_1_PROGRAM_PATH = "content/development/seis-public-plugin-wave-1-program.json";
const WAVE_1_HANDOFF_PATH = "content/development/seis-public-plugin-wave-1-handoff.json";
const WAVE_2_PROGRAM_PATH = "content/development/seis-public-plugin-wave-2-program.json";
const WAVE_2_HANDOFF_PATH = "content/development/seis-public-plugin-wave-2-handoff.json";
const WAVE_3_PROGRAM_PATH = "content/development/seis-public-plugin-wave-3-program.json";
const WAVE_3_ROUND_4_REVIEW_PATH = "content/development/seis-public-plugin-wave-3-round-4-review.json";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-continuity-cadence");
    process.exit(1);
  }
  console.log("SEIS public plugin continuity cadence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " with one 30-step bootstrap and five 100-step waves.");
}

function buildRecord() {
  const initialProgram = readJson(INITIAL_PROGRAM_PATH);
  const wave1Program = readJson(WAVE_1_PROGRAM_PATH);
  const wave1Handoff = readJson(WAVE_1_HANDOFF_PATH);
  const wave2Program = readJson(WAVE_2_PROGRAM_PATH);
  const wave2Handoff = readJson(WAVE_2_HANDOFF_PATH);
  const wave3Program = readJson(WAVE_3_PROGRAM_PATH);
  const wave3Round4Review = readJson(WAVE_3_ROUND_4_REVIEW_PATH);
  const futureWaveTemplate = buildFutureWaveTemplate(wave3Program.steps);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-continuity-cadence",
    goalId: "SEIS-GOAL-021",
    status: "active-evidence-led-cadence",
    maturity: "specification",
    generatedAt: "2026-07-21",
    purpose: "Make the requested 30-step bootstrap, five 100-step public SEIS Repo waves, and future series handoff explicit without claiming background execution or pre-approving future capability changes.",
    parentProgramPath: INITIAL_PROGRAM_PATH,
    executionBoundary: {
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      publicAudience: "everyone",
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      protectedDefaultBranchWrites: false,
      backgroundExecutionClaimed: false,
      featureBranchDeliveryRequired: true,
    },
    cadence: {
      bootstrap: {
        totalSteps: 30,
        roundCount: 5,
        stepsPerRound: 6,
        status: initialProgram.status || null,
        programPath: INITIAL_PROGRAM_PATH,
      },
      waveSeries: {
        waveCount: 5,
        stepsPerWave: 100,
        roundsPerWave: 5,
        stepsPerRound: 20,
        totalPlannedWaveSteps: 500,
        activeWave: 3,
      },
      githubDelivery: {
        branch: FEATURE_BRANCH,
        rule: "After each validated, reviewable, reversible checkpoint, commit the scoped work and push only the current feature branch when the environment and authorization permit.",
        protectedDefaultBranchWrites: false,
        remoteReferenceVerificationRequired: true,
        externalBlockerHandling: "Record an unavailable network, approval, or branch-policy limit honestly; do not replace it with a success claim.",
      },
      afterFiveWaves: {
        nextBootstrapSteps: 30,
        nextWaveCount: 5,
        nextWaveSteps: 100,
        continuationRule: "Start a new 30-step scope, dependency, risk, and rollback review before another five-wave series. The next series is not automatic and requires current evidence plus current user authority.",
        backgroundExecutionClaimed: false,
      },
    },
    waves: [
      {
        wave: 1,
        status: "completed",
        programPath: WAVE_1_PROGRAM_PATH,
        handoffPath: WAVE_1_HANDOFF_PATH,
        completedSteps: completedStepCount(wave1Program),
        entryRule: "The 30-step bootstrap and a separate Wave 1 scope review provided current evidence.",
      },
      {
        wave: 2,
        status: "completed",
        programPath: WAVE_2_PROGRAM_PATH,
        handoffPath: WAVE_2_HANDOFF_PATH,
        completedSteps: completedStepCount(wave2Program),
        entryRule: "Wave 1 completed with a current repository-local handoff and a new scope and risk review.",
      },
      {
        wave: 3,
        status: "in-progress",
        programPath: WAVE_3_PROGRAM_PATH,
        completedSteps: completedStepCount(wave3Program),
        inProgressSteps: list(wave3Program.progress?.inProgressStepNumbers),
        currentEvidencePath: WAVE_3_ROUND_4_REVIEW_PATH,
        entryRule: "Wave 2 completed with a current handoff, an approved non-duplicative capability decision, and continued user authority.",
      },
      {
        wave: 4,
        status: "planned-gated",
        programId: "seis-public-plugin-wave-4-program",
        totalSteps: 100,
        stepTemplateId: futureWaveTemplate.id,
        predecessor: "Wave 3 repository-local handoff",
        entryRule: "Activate only after Wave 3 handoff, current validation, an explicit scope and risk decision, and current user authority.",
      },
      {
        wave: 5,
        status: "planned-gated",
        programId: "seis-public-plugin-wave-5-program",
        totalSteps: 100,
        stepTemplateId: futureWaveTemplate.id,
        predecessor: "Wave 4 repository-local handoff",
        entryRule: "Activate only after Wave 4 handoff, current validation, an explicit scope and risk decision, and current user authority.",
      },
    ],
    futureWaveTemplate,
    rolloutRules: [
      "A wave can contain at most one newly approved public capability unless a separate capability decision changes that scope.",
      "Every package stays deny-by-default for writes, network, and secrets until a reviewed change explicitly grants a narrower permission.",
      "A public card, source availability, feature-branch push, and repository-local test result are not independent installation, native runtime, provider, deployment, signing, or public-release proof.",
      "Every active round ends with current validation, a focused reversible commit, and feature-branch delivery when authorized.",
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused active-wave commit and generated cadence records on the feature branch; future planned waves create no external state.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function buildFutureWaveTemplate(sourceSteps) {
  const steps = list(sourceSteps).map((step) => ({
    number: step.number,
    round: step.round,
    title: genericizeTitle(step.title),
    validation: genericizeTitle(step.validation),
    status: "planned-template",
  }));
  return {
    id: "seis-public-plugin-future-wave-template",
    totalSteps: 100,
    roundCount: 5,
    stepsPerRound: 20,
    status: "planned-gated-template",
    purpose: "Reusable 100-step evidence-led template for Waves 4 and 5 after each receives its own selected scope.",
    rounds: [
      { round: 1, name: "Evidence-led discovery", steps: range(1, 20) },
      { round: 2, name: "Bounded scope and design", steps: range(21, 40) },
      { round: 3, name: "Approved implementation and integration", steps: range(41, 60) },
      { round: 4, name: "Resilience and public-contract review", steps: range(61, 80) },
      { round: 5, name: "Handoff and next-wave decision", steps: range(81, 100) },
    ],
    steps,
  };
}

function genericizeTitle(value) {
  return String(value || "")
    .replaceAll("Wave 3", "the active wave")
    .replaceAll("Wave 2", "the prior wave")
    .replaceAll("Swift concurrency", "the selected public capability")
    .replaceAll("SwiftPM", "the selected platform validation")
    .replaceAll("selected capability", "selected capability");
}

function completedStepCount(program) {
  if (Number.isInteger(program?.progress?.completedStepCount)) return program.progress.completedStepCount;
  return list(program?.steps).filter((step) => step?.status === "completed").length;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-continuity-cadence" && record.goalId === "SEIS-GOAL-021" && record.status === "active-evidence-led-cadence" && record.maturity === "specification", "record identity is invalid");
  assert(record.executionBoundary?.marketplaceName === "seis-repo" && record.executionBoundary?.marketplaceDisplayName === "SEIS Repo" && record.executionBoundary?.personalMarketplaceRead === false && record.executionBoundary?.personalMarketplaceMutation === false && record.executionBoundary?.network === false && record.executionBoundary?.externalWrites === false && record.executionBoundary?.secrets === false && record.executionBoundary?.protectedDefaultBranchWrites === false && record.executionBoundary?.backgroundExecutionClaimed === false && record.executionBoundary?.featureBranchDeliveryRequired === true, "execution boundary is invalid");
  assert(record.cadence?.bootstrap?.totalSteps === 30 && record.cadence?.bootstrap?.roundCount === 5 && record.cadence?.bootstrap?.stepsPerRound === 6 && record.cadence?.bootstrap?.status === "completed", "30-step bootstrap is invalid");
  assert(record.cadence?.waveSeries?.waveCount === 5 && record.cadence?.waveSeries?.stepsPerWave === 100 && record.cadence?.waveSeries?.roundsPerWave === 5 && record.cadence?.waveSeries?.stepsPerRound === 20 && record.cadence?.waveSeries?.totalPlannedWaveSteps === 500 && record.cadence?.waveSeries?.activeWave === 3, "five-wave cadence is invalid");
  assert(record.cadence?.githubDelivery?.branch === FEATURE_BRANCH && record.cadence?.githubDelivery?.protectedDefaultBranchWrites === false && record.cadence?.githubDelivery?.remoteReferenceVerificationRequired === true, "GitHub delivery boundary is invalid");
  assert(record.cadence?.afterFiveWaves?.nextBootstrapSteps === 30 && record.cadence?.afterFiveWaves?.nextWaveCount === 5 && record.cadence?.afterFiveWaves?.nextWaveSteps === 100 && record.cadence?.afterFiveWaves?.backgroundExecutionClaimed === false, "post-series continuation is invalid");
  assert(list(record.waves).length === 5 && record.waves[0]?.status === "completed" && record.waves[0]?.completedSteps === 100 && record.waves[1]?.status === "completed" && record.waves[1]?.completedSteps === 100 && record.waves[2]?.status === "in-progress" && record.waves[2]?.completedSteps === 80 && list(record.waves[2]?.inProgressSteps).join(",") === "81" && record.waves[3]?.status === "planned-gated" && record.waves[3]?.totalSteps === 100 && record.waves[4]?.status === "planned-gated" && record.waves[4]?.totalSteps === 100, "wave states are invalid");
  assert(record.futureWaveTemplate?.id === "seis-public-plugin-future-wave-template" && record.futureWaveTemplate?.totalSteps === 100 && record.futureWaveTemplate?.roundCount === 5 && record.futureWaveTemplate?.stepsPerRound === 20 && list(record.futureWaveTemplate?.rounds).length === 5 && list(record.futureWaveTemplate?.steps).length === 100 && list(record.futureWaveTemplate?.steps).every((step, index) => step?.number === index + 1 && step?.round === Math.floor(index / 20) + 1 && step?.status === "planned-template" && typeof step?.title === "string" && step.title.length > 0), "future wave template is invalid");
  assert(list(record.rolloutRules).length === 4 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "rollout rule or rollback boundary is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "cadence must not contain a machine-specific path");
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin continuity cadence: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin continuity cadence: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
