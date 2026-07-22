#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROGRAM_PATH = "content/development/seis-general-plugin-autopilot.json";
const LEDGER_PATH = "content/development/seis-general-plugin-autopilot-execution.json";
const MAX_JSON_BYTES = 2 * 1024 * 1024;
const MAX_PHASE_TARGET_BYTES = 4 * 1024 * 1024;
const MAX_PHASE_OUTPUT_BYTES = 1024 * 1024;
const NODE = process.execPath;
const ROLE_IDS = ["architect-planner", "package-builder", "safety-reviewer", "qa-validator", "evidence-reporter", "delivery-coordinator"];
const COMMANDS_BY_CHECKPOINT = Object.freeze({
  inspect: [
    command("check marketplace topology", "scripts/check-seis-general-plugin-distribution.mjs"),
    command("check canonical SEIS-Agent", "scripts/check-seis-ai-agent-v2.mjs"),
    command("check unified ten/30 suite", "scripts/create-seis-general-unified-suite.mjs", ["--check"]),
    command("check release policy", "scripts/check-seis-public-plugin-release-policy.mjs"),
    command("check bounded MCP install smoke", "scripts/check-seis-general-plugin-install-smoke.mjs", ["--mcp-smoke"]),
    command("check repository user readiness", "scripts/check-seis-general-plugin-user-readiness.mjs", ["--json"]),
  ],
  plan: [
    command("check distribution generator freshness", "scripts/create-seis-general-plugin-distribution.mjs", ["--check"]),
    command("check unified-suite generator freshness", "scripts/create-seis-general-unified-suite.mjs", ["--check"]),
    command("check Goal 0029 cadence freshness", "scripts/create-seis-general-plugin-autopilot.mjs", ["--check"]),
    command("check supervised automation freshness", "scripts/create-seis-public-plugin-supervised-autopilot.mjs", ["--check"]),
    command("check release-policy evidence", "scripts/check-seis-public-plugin-release-policy.mjs"),
    command("check canonical agent integration", "scripts/check-seis-ai-agent-v2.mjs"),
  ],
  build: [
    command("regenerate general-plugin distribution", "scripts/create-seis-general-plugin-distribution.mjs"),
    command("regenerate general-plugin unified suite", "scripts/create-seis-general-unified-suite.mjs"),
    command("regenerate public-plugin consolidation", "scripts/create-seis-public-plugin-consolidation.mjs"),
    command("regenerate Goal 0029 cadence plan", "scripts/create-seis-general-plugin-autopilot.mjs"),
    command("regenerate supervised automation", "scripts/create-seis-public-plugin-supervised-autopilot.mjs"),
    command("regenerate public-plugin continuity record", "scripts/create-seis-public-plugin-continuity-cadence.mjs"),
  ],
  validate: [
    command("validate marketplace topology", "scripts/check-seis-general-plugin-distribution.mjs"),
    command("validate unified suite", "scripts/create-seis-general-unified-suite.mjs", ["--check"]),
    command("validate canonical agent", "scripts/check-seis-ai-agent-v2.mjs"),
    command("validate release boundary", "scripts/check-seis-public-plugin-release-policy.mjs"),
    command("validate Goal 0029 plan", "scripts/create-seis-general-plugin-autopilot.mjs", ["--check"]),
    command("validate supervised automation", "scripts/create-seis-public-plugin-supervised-autopilot.mjs", ["--check"]),
  ],
});

validateRepositoryIdentity();
const invocation = parseInvocation(process.argv.slice(2));
const program = readJson(PROGRAM_PATH, false);
validateProgram(program);
const planDigest = digestPlan(program);
const ledger = readLedger(planDigest);
const executionState = buildExecutionState(ledger, program);

if (invocation.mode === "check") {
  console.log(JSON.stringify(buildReport({ mode: "check", status: "valid", program, ledger, executionState, phases: [] }), null, 2));
  process.exit(0);
}

const round = invocation.round ?? executionState.nextRound;
const phases = round === null ? [] : buildRoundPhases(program, round);
if (invocation.mode === "plan") {
  console.log(JSON.stringify(buildReport({ mode: "plan", status: "planned", program, ledger, executionState, phases }), null, 2));
  process.exit(0);
}

if (round === null) throw new Error("All five initial rounds have local evidence; do not start the 100-step series without a new reviewed runner and activation evidence.");
if (round !== executionState.nextRound) throw new Error(`Round ${round} cannot run before round ${executionState.nextRound} has reproducible local evidence.`);

const results = [];
for (const phase of phases) {
  const result = runPhase(phase, results);
  results.push(result);
  if (!result.ok) {
    const report = buildReport({ mode: "apply-safe", status: "failed", program, ledger, executionState, phases, results, failedPhase: phase.label });
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
}

const nextLedger = {
  ...ledger,
  rounds: [...ledger.rounds, {
    round,
    status: "completed-local-checkpoint-run",
    completedAt: new Date().toISOString(),
    steps: results,
  }],
};
validateLedger(nextLedger, planDigest, program);
writeLedger(nextLedger);
const completedState = buildExecutionState(nextLedger, program);
console.log(JSON.stringify(buildReport({ mode: "apply-safe", status: "completed-local-round", program, ledger: nextLedger, executionState: completedState, phases, results }), null, 2));

function command(label, script, args = []) {
  return Object.freeze({ label, script, args: Object.freeze([...args]) });
}

function parseInvocation(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === "--plan")) return { mode: "plan", round: null };
  if (args.length === 1 && args[0] === "--check") return { mode: "check", round: null };
  if (args.length === 3 && args[0] === "--apply-safe" && args[1] === "--round" && /^[1-5]$/.test(args[2])) return { mode: "apply-safe", round: Number(args[2]) };
  throw new Error("Usage: node scripts/run-seis-general-plugin-autopilot.mjs [--plan|--check|--apply-safe --round <1-5>]");
}

function buildRoundPhases(value, roundNumber) {
  const round = value.immediateCycle.rounds[roundNumber - 1];
  if (!round) throw new Error(`Round ${roundNumber} is not declared by the reviewed cadence plan.`);
  return round.steps.map((step, index) => {
    const objectiveIndex = index % 6;
    const automationRoleId = ROLE_IDS[objectiveIndex];
    if (step.checkpoint === "record-command-evidence-for") {
      return {
        number: step.number,
        globalNumber: step.globalNumber,
        checkpoint: step.checkpoint,
        label: step.label,
        automationRoleId,
        kind: "evidence",
        sourceStepNumbers: [objectiveIndex + 1, objectiveIndex + 7, objectiveIndex + 13, objectiveIndex + 19],
      };
    }
    const checkpointCommands = COMMANDS_BY_CHECKPOINT[step.checkpoint];
    const selected = checkpointCommands?.[objectiveIndex];
    if (!selected) throw new Error(`No reviewed local action exists for ${step.checkpoint} step ${step.number}.`);
    return {
      number: step.number,
      globalNumber: step.globalNumber,
      checkpoint: step.checkpoint,
      label: step.label,
      automationRoleId,
      kind: "command",
      action: selected.label,
      command: NODE,
      programCommand: "node",
      args: [selected.script, ...selected.args],
      targetIndex: 0,
      targetPath: selected.script,
    };
  });
}

function runPhase(phase, priorResults) {
  if (phase.kind === "evidence") {
    const sourceResults = phase.sourceStepNumbers.map((number) => priorResults.find((result) => result.number === number));
    const sourcePassed = sourceResults.length === phase.sourceStepNumbers.length && sourceResults.every((result) => result?.ok === true);
    return {
      number: phase.number,
      globalNumber: phase.globalNumber,
      checkpoint: phase.checkpoint,
      label: phase.label,
      automationRoleId: phase.automationRoleId,
      kind: "evidence",
      sourceStepNumbers: phase.sourceStepNumbers,
      status: sourcePassed ? "recorded-command-evidence" : "blocked-missing-command-evidence",
      ok: sourcePassed,
    };
  }

  verifyPhaseTarget(phase);
  const executionArgs = [...phase.args];
  executionArgs[phase.targetIndex] = safePath(phase.targetPath);
  const child = spawnSync(phase.command, executionArgs, {
    cwd: ROOT,
    env: safeEnvironment(),
    encoding: "utf8",
    maxBuffer: MAX_PHASE_OUTPUT_BYTES,
    timeout: 120000,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    number: phase.number,
    globalNumber: phase.globalNumber,
    checkpoint: phase.checkpoint,
    label: phase.label,
    automationRoleId: phase.automationRoleId,
    kind: "command",
    action: phase.action,
    command: phase.programCommand,
    args: phase.args,
    status: child.status === 0 && !child.error ? "passed-local-command" : "failed-local-command",
    ok: child.status === 0 && !child.error,
    exitCode: child.status,
    timedOut: child.error?.code === "ETIMEDOUT" || child.signal === "SIGTERM",
    stdoutBytes: Buffer.byteLength(child.stdout || "", "utf8"),
    stderrBytes: Buffer.byteLength(child.stderr || "", "utf8"),
    errorCode: typeof child.error?.code === "string" ? child.error.code : null,
  };
}

function buildReport({ mode, status, program: value, ledger: currentLedger, executionState: state, phases, results = [], failedPhase = null }) {
  return {
    schemaVersion: 1,
    id: "seis-general-plugin-autopilot-run",
    goalId: "SEIS-GOAL-0029",
    mode,
    status,
    foregroundOnly: true,
    backgroundExecution: false,
    externalWrites: false,
    intentionalNetworkActions: false,
    intentionalSecretAccess: false,
    githubDelivery: {
      automaticPush: false,
      publication: false,
      nextAction: "Keep commits, pushes, releases, publication, credentials, and external writes as separate human-approved actions.",
    },
    currentMarketplace: value.currentMarketplace,
    plan: {
      initialRoundCount: value.immediateCycle.roundCount,
      stepsPerInitialRound: value.immediateCycle.stepsPerRound,
      totalInitialSteps: value.immediateCycle.totalSteps,
      completedRoundCount: state.completedRoundCount,
      completedStepCount: state.completedStepCount,
      nextRound: state.nextRound,
      nextWave: state.nextWave,
      fiveWaveStatus: state.fiveWaveStatus,
      fiveWaveCount: value.fiveWaveSeries.waves,
      stepsPerFiveWave: value.fiveWaveSeries.stepsPerWave,
      nextSeriesStepsPerWave: value.fiveWaveSeries.nextSeries.stepsPerWave,
      escalationStepsPerWave: value.escalationSeries.tiers.map((tier) => tier.stepsPerWave),
      tenYearHorizonCount: value.tenYearHorizon.length,
    },
    executionLedger: {
      path: value.executionLedger.path,
      exists: currentLedger.rounds.length > 0,
      completedRounds: currentLedger.rounds.map((entry) => entry.round),
      planDigest: currentLedger.planDigest,
    },
    approvedLocalPhases: phases.map((phase) => ({
      number: phase.number,
      checkpoint: phase.checkpoint,
      label: phase.label,
      automationRoleId: phase.automationRoleId,
      kind: phase.kind,
      command: phase.kind === "command" ? [phase.programCommand, ...phase.args] : null,
    })),
    roleLanes: buildRoleLanes(value.automationRoles, phases),
    commandExecuted: mode === "apply-safe",
    results,
    failedPhase,
  };
}

function buildRoleLanes(roles, phases) {
  return roles.map((role) => {
    const assigned = phases.filter((phase) => phase.automationRoleId === role.id);
    return {
      id: role.id,
      responsibility: role.responsibility,
      execution: "foreground-sequential-reviewed-allowlist",
      phaseCount: assigned.length,
      phases: assigned.map((phase) => phase.number),
    };
  });
}

function readLedger(currentPlanDigest) {
  const absolutePath = safePath(LEDGER_PATH);
  if (!fs.existsSync(absolutePath)) return {
    schemaVersion: 1,
    id: "seis-general-plugin-autopilot-execution",
    goalId: "SEIS-GOAL-0029",
    planDigest: currentPlanDigest,
    rounds: [],
  };
  const value = readJson(LEDGER_PATH, false);
  validateLedger(value, currentPlanDigest, program);
  return value;
}

function validateLedger(value, currentPlanDigest, plan) {
  assert(value?.schemaVersion === 1 && value?.id === "seis-general-plugin-autopilot-execution" && value?.goalId === "SEIS-GOAL-0029", "execution ledger identity is invalid");
  assert(value?.planDigest === currentPlanDigest, "execution ledger does not match the reviewed cadence plan");
  assert(Array.isArray(value?.rounds) && value.rounds.length <= 5, "execution ledger rounds are invalid");
  for (const [roundIndex, entry] of value.rounds.entries()) {
    const plannedRound = plan.immediateCycle.rounds[roundIndex];
    assert(entry?.round === roundIndex + 1 && entry?.status === "completed-local-checkpoint-run" && typeof entry?.completedAt === "string" && Array.isArray(entry?.steps) && entry.steps.length === 30, `execution ledger round ${roundIndex + 1} is invalid`);
    for (const [stepIndex, result] of entry.steps.entries()) {
      const plannedStep = plannedRound.steps[stepIndex];
      assert(result?.number === plannedStep.number && result?.globalNumber === plannedStep.globalNumber && result?.label === plannedStep.label && result?.automationRoleId === ROLE_IDS[stepIndex % 6] && result?.ok === true, `execution ledger round ${roundIndex + 1} step ${stepIndex + 1} is invalid`);
      const validStatus = stepIndex >= 24 ? result?.status === "recorded-command-evidence" : result?.status === "passed-local-command";
      assert(validStatus, `execution ledger round ${roundIndex + 1} step ${stepIndex + 1} status is invalid`);
    }
  }
}

function buildExecutionState(currentLedger, value) {
  const completedRoundCount = currentLedger.rounds.length;
  const completedStepCount = completedRoundCount * value.immediateCycle.stepsPerRound;
  const nextRound = completedRoundCount < value.immediateCycle.roundCount ? completedRoundCount + 1 : null;
  return {
    completedRoundCount,
    completedStepCount,
    nextRound,
    nextWave: nextRound === null ? 1 : null,
    fiveWaveStatus: nextRound === null ? "ready-for-foreground-wave-1" : "blocked-by-incomplete-five-30-step-rounds",
  };
}

function digestPlan(value) {
  const stablePlan = {
    id: value.id,
    goalId: value.goalId,
    currentMarketplace: value.currentMarketplace,
    immediateCycle: value.immediateCycle,
    canonicalAutomation: value.canonicalAutomation,
  };
  return createHash("sha256").update(JSON.stringify(stablePlan)).digest("hex");
}

function readJson(relativePath) {
  const absolutePath = safePath(relativePath);
  const stat = fs.lstatSync(absolutePath);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_JSON_BYTES) throw new Error(`Unsafe JSON input: ${relativePath}`);
  const descriptor = fs.openSync(absolutePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const descriptorStat = fs.fstatSync(descriptor);
    if (!descriptorStat.isFile() || descriptorStat.size > MAX_JSON_BYTES) throw new Error(`Unsafe JSON input: ${relativePath}`);
    return JSON.parse(fs.readFileSync(descriptor, "utf8"));
  } finally {
    fs.closeSync(descriptor);
  }
}

function writeLedger(value) {
  const target = safePath(LEDGER_PATH);
  const temporary = path.join(path.dirname(target), `.${path.basename(target)}.${process.pid}.${Date.now()}.tmp`);
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, target);
}

function verifyPhaseTarget(phase) {
  const absolutePath = safePath(phase.targetPath);
  const stat = fs.lstatSync(absolutePath);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_PHASE_TARGET_BYTES) {
    throw new Error(`Reviewed phase target is unsafe: ${phase.targetPath}`);
  }
}

function safePath(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);
  const relative = path.relative(ROOT, absolutePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Path escapes repository root: ${relativePath}`);
  return absolutePath;
}

function safeEnvironment() {
  return {
    PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
    LANG: "C",
    GIT_TERMINAL_PROMPT: "0",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_PAGER: "cat",
    NO_COLOR: "1",
  };
}

function validateProgram(value) {
  assert(value?.schemaVersion === 3 && value?.id === "seis-ten-general-plugin-autopilot" && value?.goalId === "SEIS-GOAL-0029", "program identity is invalid");
  assert(value?.status === "active-foreground-cadence-plan", "program status is invalid");
  assert(value?.executionModel?.planAndBuildInOneInvocation === true && value.executionModel?.roleExecution === "foreground-sequential-reviewed-allowlist", "plan-and-build contract is invalid");
  assert(value?.executionModel?.persistentProcess === false && value.executionModel?.backgroundExecution === false && value.executionModel?.externalWrites === false && value.executionModel?.intentionalNetworkActions === false && value.executionModel?.intentionalSecretAccess === false && value.executionModel?.githubPush === false && value.executionModel?.publication === false, "foreground execution boundary is invalid");
  assert(value?.currentMarketplace?.canonicalInstall === "seis-ai-agent@seis-repo" && value.currentMarketplace?.publicCardCount === 10 && value.currentMarketplace?.generalPluginCardCount === 10 && value.currentMarketplace?.internalPackageCardCount === 0 && value.currentMarketplace?.internalPackageCount === 30 && value.currentMarketplace?.maximumPackageSize === 15, "marketplace topology is invalid");
  assert(value?.executionLedger?.path === LEDGER_PATH && value.executionLedger?.status === "separate-foreground-evidence-required" && value.executionLedger?.automaticCompletion === false, "execution ledger boundary is invalid");
  assert(value?.immediateCycle?.status === "execution-state-in-external-ledger" && value.immediateCycle?.totalSteps === 150 && value.immediateCycle?.roundCount === 5 && value.immediateCycle?.stepsPerRound === 30 && value.immediateCycle?.rounds?.length === 5 && value.immediateCycle.rounds.every((round, roundIndex) => round?.id === `round-${roundIndex + 1}` && round?.status === "planned-not-executed" && round?.steps?.length === 30 && round.steps.every((step, stepIndex) => step?.number === stepIndex + 1 && step?.globalNumber === roundIndex * 30 + stepIndex + 1 && typeof step?.label === "string" && step.status === "planned-not-executed")), "five 30-step rounds are invalid");
  assert(value?.fiveWaveSeries?.status === "blocked-by-incomplete-five-30-step-rounds" && value.fiveWaveSeries?.activeWave === null && value.fiveWaveSeries?.nextWave === 1 && value.fiveWaveSeries?.waves === 5 && value.fiveWaveSeries?.stepsPerWave === 100 && value.fiveWaveSeries?.waveStatuses?.length === 5 && value.fiveWaveSeries.waveStatuses.every((wave) => wave.status === "planned-not-background" && wave.completedSteps === 0 && wave.nextStep === null && wave.backgroundExecution === false), "five-wave cadence is invalid");
  assert(value?.fiveWaveSeries?.nextSeries?.waves === 5 && value.fiveWaveSeries?.nextSeries?.stepsPerWave === 200 && value.fiveWaveSeries?.nextSeries?.status === "gated-until-five-100-step-waves-complete", "next-series cadence is invalid");
  assert(value?.escalationSeries?.tiers?.map((tier) => tier.stepsPerWave).join(",") === "200,300,400,500,600" && value.escalationSeries?.tiers?.[0]?.status === "gated-until-five-100-step-waves-complete" && value.escalationSeries.tiers.every((tier) => tier.activationAuthority === "not-yet-granted" && tier.activeCycle === null && tier.backgroundExecution === false && tier.marketplaceCardExpansion === false), "escalation cadence is invalid");
  assert(value?.tenYearHorizon?.length === 10 && value.tenYearHorizon.every((year) => year.execution === "strategic-gated-not-background"), "ten-year horizon is invalid");
  assert(value?.automationRoles?.map((role) => role.id).join(",") === ROLE_IDS.join(","), "automation roles are invalid");
  assert(value?.canonicalAutomation?.goalId === "SEIS-GOAL-0029" && value.canonicalAutomation?.runner === "scripts/run-seis-general-plugin-autopilot.mjs" && value.canonicalAutomation?.reviewedPhaseCount === 30 && value.canonicalAutomation?.repositoryAnchored === true && value.canonicalAutomation?.evidenceLedger === LEDGER_PATH && value?.commandAllowlist === undefined, "canonical automation contract is invalid");
}

function validateRepositoryIdentity() {
  const packageManifest = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  assert(packageManifest?.name === "seis", "package identity is invalid");
  const git = spawnSync("/usr/bin/git", ["rev-parse", "--show-toplevel"], {
    cwd: ROOT,
    env: safeEnvironment(),
    encoding: "utf8",
    maxBuffer: 64 * 1024,
    timeout: 10_000,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
  assert(git.status === 0 && !git.error && path.resolve(String(git.stdout || "").trim()) === ROOT, "Git top-level does not match the anchored repository root");
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS general-plugin Auto Mode: ${message}`);
}
