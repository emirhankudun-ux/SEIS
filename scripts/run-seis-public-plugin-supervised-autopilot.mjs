#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = safeRepositoryRoot(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const PROGRAM_PATH = "content/development/seis-public-plugin-supervised-autopilot.json";
const MAX_PROGRAM_BYTES = 2 * 1024 * 1024;
const MAX_PHASE_TARGET_BYTES = 4 * 1024 * 1024;
const MAX_PHASE_OUTPUT_BYTES = 1024 * 1024;
const GIT_COMMAND = "/usr/bin/git";
validateRepositoryIdentity();
const mode = parseMode(process.argv.slice(2));
const program = readProgram();
validateProgram(program);

const phases = buildPhases().map(snapshotPhaseTarget);
validateAllowlist(program.commandAllowlist, phases);

const report = {
  schemaVersion: 1,
  id: "seis-public-plugin-supervised-autopilot-run",
  mode,
  status: "planned",
  foregroundOnly: true,
  backgroundExecution: false,
  externalWrites: false,
  intentionalNetworkActions: false,
  intentionalSecretAccess: false,
  isolationLevel: "reviewed-allowlist-no-os-sandbox",
  ambientNetworkIsolationEnforced: false,
  ambientFilesystemIsolationEnforced: false,
  descendantTerminationGuaranteed: false,
  commandExecuted: false,
  currentMarketplace: program.currentMarketplace,
  plan: {
    immediateStepCount: program.immediateCycle.totalSteps,
    immediateRoundCount: program.immediateCycle.rounds.length,
    fiveWaveCount: program.fiveWaveSeries.waves,
    activeWave: program.fiveWaveSeries.activeWave,
    activeWaveStatus: program.fiveWaveSeries.status,
    activeWaveNextStep: program.fiveWaveSeries.waveStatuses[0].nextStep,
    nextSeriesWaveCount: program.fiveWaveSeries.nextSeries.waves,
    nextSeriesStepsPerWave: program.fiveWaveSeries.nextSeries.stepsPerWave,
    nextSeriesStatus: program.fiveWaveSeries.nextSeries.status,
    round11StepCount: program.round11Cycle.totalSteps,
    round11Status: program.round11Cycle.status,
    escalationTierCount: program.escalationSeries.tierCount,
    activeEscalationTierId: null,
    activeEscalationStepsPerWave: null,
    nextGatedEscalationTierId: program.escalationSeries.tiers[0].id,
    nextGatedEscalationStepsPerWave: program.escalationSeries.tiers[0].stepsPerWave,
    tenYearHorizonCount: program.tenYearHorizon.length,
    automationRoles: program.automationRoles.map((role) => role.id),
    roleExecution: program.executionModel.roleExecution,
  },
  approvedLocalPhases: phases.map((phase) => phase.label),
  roleLanes: buildRoleLanes(program.automationRoles, phases),
  githubDelivery: {
    status: "approval-and-environment-gated",
    automaticPush: false,
    nextAction: "Use a separate, explicitly approved feature-branch delivery action after a focused commit.",
  },
  results: [],
  nextAction: mode === "plan"
    ? "Review the plan and run --apply-safe only when current local generation is desired."
    : "Review the local report; commits and external delivery remain separate approval-gated actions.",
};

if (mode === "apply-safe") {
  report.commandExecuted = true;
  for (const phase of phases) {
    const result = runPhase(phase);
    report.results.push(result);
    if (!result.ok) {
      report.status = "failed";
      report.failedPhase = phase.label;
      console.log(JSON.stringify(report, null, 2));
      process.exit(1);
    }
  }
  report.status = "completed-reviewed-local-phases";
}

console.log(JSON.stringify(report, null, 2));

function parseMode(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === "--plan")) return "plan";
  if (args.length === 1 && args[0] === "--apply-safe") return "apply-safe";
  throw new Error("Usage: node scripts/run-seis-public-plugin-supervised-autopilot.mjs [--plan|--apply-safe]");
}

function readProgram() {
  const absolutePath = safePath(PROGRAM_PATH);
  const parts = path.relative(ROOT, absolutePath).split(path.sep).filter(Boolean);
  let current = ROOT;
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) throw new Error(`SEIS public plugin supervised autopilot: missing ${PROGRAM_PATH}; run its reviewed generator first.`);
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error("SEIS public plugin supervised autopilot: program input is unsafe.");
    const final = index === parts.length - 1;
    if ((!final && !stat.isDirectory()) || (final && (!stat.isFile() || stat.size > MAX_PROGRAM_BYTES))) {
      throw new Error("SEIS public plugin supervised autopilot: program input is unsafe.");
    }
  }
  const descriptor = fs.openSync(absolutePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile() || stat.size > MAX_PROGRAM_BYTES) throw new Error("SEIS public plugin supervised autopilot: program input is unsafe.");
    return JSON.parse(fs.readFileSync(descriptor, "utf8"));
  } finally {
    fs.closeSync(descriptor);
  }
}

function validateProgram(value) {
  assert(value?.id === "seis-public-plugin-supervised-autopilot", "program identity is invalid");
  assert(value?.goalId === "SEIS-GOAL-0025" && value?.parentGoalId === "SEIS-GOAL-0024", "program goal linkage is invalid");
  assert(value?.executionModel?.planAndBuildInOneInvocation === true && value.executionModel?.roleExecution === "foreground-sequential-reviewed-allowlist", "plan-and-build contract is missing");
  assert(value?.executionModel?.persistentProcess === false && value?.executionModel?.backgroundExecution === false, "foreground-only contract is invalid");
  assert(value?.executionModel?.externalWrites === false && value?.executionModel?.intentionalNetworkActions === false && value?.executionModel?.intentionalSecretAccess === false, "external boundary is invalid");
  assert(value?.executionModel?.isolationLevel === "reviewed-allowlist-no-os-sandbox" && value?.executionModel?.ambientNetworkIsolationEnforced === false && value?.executionModel?.ambientFilesystemIsolationEnforced === false && value?.executionModel?.descendantTerminationGuaranteed === false, "isolation disclosure is invalid");
  assert(value?.executionModel?.githubPush === false && value?.executionModel?.commit === false && value?.executionModel?.merge === false && value?.executionModel?.release === false && value?.executionModel?.deployment === false, "delivery boundary is invalid");
  assert(value?.currentMarketplace?.canonicalInstall === "seis-ai-agent@seis-repo", "canonical installation is invalid");
  assert(value?.currentMarketplace?.publicCardCount === 10 && value?.currentMarketplace?.generalPluginCardCount === 10, "current public-card count is invalid");
  assert(value?.currentMarketplace?.internalPackageCount === 30 && value?.currentMarketplace?.internalPackageCardCount === 0 && value?.currentMarketplace?.retainedSourceCapabilityCount === 380 && value?.currentMarketplace?.maximumPackageSize === 15, "internal package boundary is invalid");
  assert(value?.immediateCycle?.status === "execution-state-in-external-ledger" && value?.immediateCycle?.totalSteps === 150 && value?.immediateCycle?.roundCount === 5 && value?.immediateCycle?.stepsPerRound === 30 && value?.immediateCycle?.rounds?.length === 5 && value.immediateCycle.rounds.every((round) => round.status === "planned-not-executed" && round.steps?.length === 30), "five-by-30 cycle is invalid");
  assert(value?.fiveWaveSeries?.status === "blocked-by-incomplete-five-30-step-rounds" && value?.fiveWaveSeries?.activeWave === null && value?.fiveWaveSeries?.nextWave === 1 && value?.fiveWaveSeries?.waves === 5 && value?.fiveWaveSeries?.stepsPerWave === 100 && value?.fiveWaveSeries?.roundsPerWave === 5 && value?.fiveWaveSeries?.waveStatuses?.length === 5 && value.fiveWaveSeries.waveStatuses.every((wave) => wave.status === "planned-not-background" && wave.completedSteps === 0 && wave.nextStep === null), "five-wave cadence is invalid");
  assert(value?.fiveWaveSeries?.nextSeries?.waves === 5 && value?.fiveWaveSeries?.nextSeries?.stepsPerWave === 200 && value?.fiveWaveSeries?.nextSeries?.status === "gated-until-five-100-step-waves-complete", "next-series cadence is invalid");
  const escalationTiers = Array.isArray(value?.escalationSeries?.tiers) ? value.escalationSeries.tiers : [];
  const expectedEscalationSteps = [200, 300, 400, 500, 600];
  assert(value?.escalationSeries?.source === "content/development/seis-general-plugin-autopilot.json" && value?.escalationSeries?.id === "seis-public-plugin-five-wave-step-escalation" && value?.escalationSeries?.direction === "increase-100-steps-per-wave-after-each-five-wave-series" && value?.escalationSeries?.tierCount === 5 && value?.escalationSeries?.waveCountPerTier === 5 && value?.escalationSeries?.stepIncreasePerTier === 100 && value?.escalationSeries?.currentMarketplaceCardCount === 10 && value?.escalationSeries?.maximumBundleSize === 15 && value?.escalationSeries?.workflowStepsAreMarketplaceCards === false, "escalation-series contract is invalid");
  assert(escalationTiers.length === expectedEscalationSteps.length && escalationTiers.every((tier, index) => tier?.id === `five-wave-${expectedEscalationSteps[index]}` && tier?.order === index + 1 && tier?.waveCount === 5 && tier?.stepsPerWave === expectedEscalationSteps[index] && tier?.roundsPerWave === expectedEscalationSteps[index] / 20 && tier?.stepsPerRound === 20 && tier?.totalPlannedSteps === expectedEscalationSteps[index] * 5 && Array.isArray(tier?.years) && tier.years.join(",") === `${index * 2 + 1},${index * 2 + 2}` && tier?.backgroundExecution === false && tier?.marketplaceCardExpansion === false), "escalation-series tiers are invalid");
  assert(escalationTiers[0]?.status === "gated-until-five-100-step-waves-complete", "first escalation tier must remain gated");
  assert(escalationTiers.slice(1).every((tier) => tier?.status === "strategic-gated-not-background"), "later escalation tiers must remain strategic and gated");
  assert(escalationTiers.every((tier) => tier?.activationAuthority === "not-yet-granted" && tier?.activeCycle === null), "all escalation tiers must remain gated");
  assert(value?.round11Cycle?.round === 11 && value?.round11Cycle?.totalSteps === 200 && value?.round11Cycle?.status === "gated-template-not-active" && value?.round11Cycle?.activationAuthority === "not-yet-granted" && value?.round11Cycle?.progress?.completedStepCount === 0 && Array.isArray(value?.round11Cycle?.progress?.inProgressStepNumbers) && value.round11Cycle.progress.inProgressStepNumbers.length === 0 && value?.round11Cycle?.progress?.plannedStepCount === 200 && value?.round11Cycle?.rounds?.length === 10 && value.round11Cycle.rounds.every((round) => round.steps?.length === 20 && round.steps.every((step) => step.status === "planned-gated")), "Round 11 compatibility template is invalid");
  assert(value?.historicalContinuity?.status === "legacy-wave-5-incomplete-retained-evidence" && value?.historicalContinuity?.activeWave === 5 && value?.historicalContinuity?.completedSteps === 80 && Array.isArray(value?.historicalContinuity?.inProgressSteps) && value.historicalContinuity.inProgressSteps.join(",") === "81" && value?.historicalContinuity?.closeoutClaimed === false && value?.historicalContinuity?.escalationActivationState === "gated-until-wave-5-completes", "historical continuity boundary is invalid");
  assert(value?.tenYearHorizon?.length === 10 && value.tenYearHorizon.every((year, index) => year.year === index + 1 && year.execution === "strategic-gated-not-background" && year.escalationTierId === `five-wave-${expectedEscalationSteps[Math.floor(index / 2)]}` && year.seriesWaveCount === 5 && year.stepsPerWave === expectedEscalationSteps[Math.floor(index / 2)]), "ten-year horizon is invalid");
  validateAutomationRoles(value);
  assert(Array.isArray(value?.commandAllowlist) && value.commandAllowlist.length === 27, "command allowlist is invalid");
}

function validateAutomationRoles(value) {
  const expectedRoleIds = ["architect-planner", "bundle-builder", "safety-reviewer", "qa-validator", "evidence-reporter", "delivery-coordinator"];
  assert(Array.isArray(value?.automationRoles) && value.automationRoles.length === expectedRoleIds.length && value.automationRoles.every((role, index) => role?.id === expectedRoleIds[index]), "automation roles are invalid");
  assert(Array.isArray(value?.commandAllowlist) && value.commandAllowlist.every((entry) => expectedRoleIds.includes(entry?.automationRoleId)) && expectedRoleIds.every((roleId) => value.commandAllowlist.some((entry) => entry.automationRoleId === roleId)), "automation role assignments are invalid");
}

function buildPhases() {
  const phases = [
    localNode("regenerate the ten-card, thirty-package distribution", ["scripts/create-seis-general-plugin-distribution.mjs"]),
    localNode("regenerate the ten-general-plugin unified suite", ["scripts/create-seis-general-unified-suite.mjs"]),
    localNode("regenerate current consolidation evidence", ["scripts/create-seis-public-plugin-consolidation.mjs"]),
    localNode("regenerate the canonical cadence roadmap", ["scripts/create-seis-general-plugin-autopilot.mjs"]),
    localNode("regenerate this supervised contract", ["scripts/create-seis-public-plugin-supervised-autopilot.mjs"]),
    localNode("reconcile cadence delegation after the supervised contract", ["scripts/create-seis-general-plugin-autopilot.mjs"]),
    localNode("check distribution freshness", ["scripts/create-seis-general-plugin-distribution.mjs", "--check"]),
    localNode("check the ten-card distribution contract", ["scripts/check-seis-general-plugin-distribution.mjs"]),
    localNode("check unified-suite freshness", ["scripts/create-seis-general-unified-suite.mjs", "--check"]),
    localNode("check consolidation freshness", ["scripts/create-seis-public-plugin-consolidation.mjs", "--check"]),
    localNode("check the structural release policy", ["scripts/check-seis-public-plugin-release-policy.mjs"]),
    localNode("check the current SEIS-Agent contract", ["scripts/check-seis-ai-agent-v2.mjs"]),
    localNode("check current agent and plugin integration", ["scripts/check-seis-agent-plugin-integration-v2.mjs"]),
    localNode("run current install and MCP smoke checks", ["scripts/check-seis-general-plugin-install-smoke.mjs", "--mcp-smoke"]),
    localNode("check canonical cadence freshness", ["scripts/create-seis-general-plugin-autopilot.mjs", "--check"]),
    localNode("check supervised contract freshness", ["scripts/create-seis-public-plugin-supervised-autopilot.mjs", "--check"]),
    localNode("report repository-only user readiness", ["scripts/check-seis-general-plugin-user-readiness.mjs", "--json"]),
    localNode("run ten-general distribution tests", ["--test", "plugins/seis-core/test/ten-general-plugin-distribution.test.mjs"]),
    localNode("run bundle tests", ["--test", "plugins/seis-core/test/public-plugin-bundles.test.mjs"]),
    localNode("run consolidation tests", ["--test", "plugins/seis-core/test/public-plugin-consolidation.test.mjs"]),
    localNode("run general-plugin runtime tests", ["--test", "plugins/seis-core/test/general-plugin-runtime.test.mjs"]),
    localNode("run supervised autopilot tests", ["--test", "plugins/seis-core/test/public-plugin-supervised-autopilot.test.mjs"]),
    localNode("run canonical cadence tests", ["--test", "plugins/seis-core/test/ten-general-plugin-autopilot.test.mjs"]),
    localNode("run user-readiness tests", ["--test", "plugins/seis-core/test/public-plugin-user-readiness.test.mjs"]),
    localNode("run bounded local-config fixture tests", ["--test", "plugins/seis-core/test/public-marketplace-local-cleanup.test.mjs"]),
    localNode("run marketplace integrity tests", ["--test", "plugins/seis-core/test/marketplace-integrity.test.mjs"]),
    localGit("check diff whitespace", ["diff", "--check"]),
  ];
  return phases.map((phase, index) => ({ ...phase, automationRoleId: automationRoleForPhaseIndex(index) }));
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

function localNode(label, args) {
  const targetIndex = args[0] === "--test" ? 1 : 0;
  return { label, command: process.execPath, programCommand: "node", args, targetIndex, targetPath: args[targetIndex] };
}

function localGit(label, args) {
  return { label, command: GIT_COMMAND, programCommand: "git", args };
}

function validateAllowlist(entries, phases) {
  assert(entries.length === phases.length, "allowlist length differs from the hard-coded local phases");
  for (const [index, phase] of phases.entries()) {
    const entry = entries[index];
    assert(entry.command === phase.programCommand, `allowlist command mismatch at phase ${index + 1}`);
    assert(Array.isArray(entry.args) && entry.args.length === phase.args.length && entry.args.every((arg, argIndex) => arg === phase.args[argIndex]), `allowlist argument mismatch at phase ${index + 1}`);
    assert(entry.automationRoleId === phase.automationRoleId, `allowlist automation role mismatch at phase ${index + 1}`);
    assert(entry.externalWrite === false && entry.network === false && entry.secrets === false, `allowlist boundary mismatch at phase ${index + 1}`);
  }
}

function buildRoleLanes(roles, phases) {
  return roles.map((role) => {
    const assigned = phases.filter((phase) => phase.automationRoleId === role.id);
    return {
      id: role.id,
      responsibility: role.responsibility,
      execution: "foreground-sequential-reviewed-allowlist",
      phaseCount: assigned.length,
      phases: assigned.map((phase) => phase.label),
    };
  });
}

function runPhase(phase) {
  verifyPhaseTarget(phase);
  const executionArgs = [...phase.args];
  if (Number.isInteger(phase.targetIndex)) executionArgs[phase.targetIndex] = safePath(phase.targetPath);
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
    label: phase.label,
    automationRoleId: phase.automationRoleId,
    command: phase.programCommand,
    args: phase.args,
    ok: child.status === 0 && !child.error,
    exitCode: child.status,
    timedOut: child.error?.code === "ETIMEDOUT" || child.signal === "SIGTERM",
    outputCaptured: Boolean(child.stdout || child.stderr),
    stdoutBytes: Buffer.byteLength(child.stdout || "", "utf8"),
    stderrBytes: Buffer.byteLength(child.stderr || "", "utf8"),
    errorCode: typeof child.error?.code === "string" ? child.error.code : null,
  };
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

function validateRepositoryIdentity() {
  const project = readBoundedText("project.ecosystem.yaml", MAX_PROGRAM_BYTES);
  const packageManifest = JSON.parse(readBoundedText("package.json", MAX_PROGRAM_BYTES));
  assert(/(?:^|\n)project:\s*\n(?:[ \t].*\n)*?[ \t]+id:\s*seis-plugin-root\s*(?:\n|$)/m.test(project), "project manifest identity is invalid");
  assert(packageManifest?.name === "seis", "package identity is invalid");
  const git = spawnSync(GIT_COMMAND, ["rev-parse", "--show-toplevel"], {
    cwd: ROOT,
    env: safeEnvironment(),
    encoding: "utf8",
    maxBuffer: 64 * 1024,
    timeout: 10_000,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
  assert(git.status === 0 && !git.error, "Git repository identity could not be verified");
  assert(path.resolve(String(git.stdout || "").trim()) === ROOT, "Git top-level does not match the anchored repository root");
}

function snapshotPhaseTarget(phase) {
  if (!phase.targetPath) return phase;
  return { ...phase, targetSnapshot: fileSnapshot(phase.targetPath, MAX_PHASE_TARGET_BYTES) };
}

function verifyPhaseTarget(phase) {
  if (!phase.targetPath) return;
  const current = fileSnapshot(phase.targetPath, MAX_PHASE_TARGET_BYTES);
  const expected = phase.targetSnapshot;
  assert(current.device === expected.device && current.inode === expected.inode && current.size === expected.size && current.digest === expected.digest, `phase target changed after allowlist validation: ${phase.targetPath}`);
}

function fileSnapshot(relativePath, maximumBytes) {
  const absolutePath = safePath(relativePath);
  validateRegularPath(relativePath, maximumBytes);
  const descriptor = fs.openSync(absolutePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(descriptor, { bigint: true });
    assert(stat.isFile() && stat.size <= BigInt(maximumBytes), `unsafe phase target: ${relativePath}`);
    const bytes = fs.readFileSync(descriptor);
    return {
      device: stat.dev.toString(),
      inode: stat.ino.toString(),
      size: Number(stat.size),
      digest: createHash("sha256").update(bytes).digest("hex"),
    };
  } finally {
    fs.closeSync(descriptor);
  }
}

function readBoundedText(relativePath, maximumBytes) {
  const absolutePath = safePath(relativePath);
  validateRegularPath(relativePath, maximumBytes);
  const descriptor = fs.openSync(absolutePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(descriptor);
    assert(stat.isFile() && stat.size <= maximumBytes, `unsafe repository identity input: ${relativePath}`);
    return fs.readFileSync(descriptor, "utf8");
  } finally {
    fs.closeSync(descriptor);
  }
}

function validateRegularPath(relativePath, maximumBytes) {
  const absolutePath = safePath(relativePath);
  const parts = path.relative(ROOT, absolutePath).split(path.sep).filter(Boolean);
  let current = ROOT;
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    assert(fs.existsSync(current), `required repository path is missing: ${relativePath}`);
    const stat = fs.lstatSync(current);
    assert(!stat.isSymbolicLink(), `symbolic-link repository path is forbidden: ${relativePath}`);
    const final = index === parts.length - 1;
    assert(final ? stat.isFile() && stat.size <= maximumBytes : stat.isDirectory(), `unsafe repository path: ${relativePath}`);
  }
}

function safeRepositoryRoot(candidate) {
  const absolute = path.resolve(candidate);
  const stat = fs.lstatSync(absolute);
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error("SEIS public plugin supervised autopilot: repository root must be a regular directory.");
  }
  return absolute;
}

function safePath(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);
  const relative = path.relative(ROOT, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("SEIS public plugin supervised autopilot: program path escapes repository root.");
  }
  return absolutePath;
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin supervised autopilot: ${message}`);
}
