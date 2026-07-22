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
    nextSeriesWaveCount: program.fiveWaveSeries.nextSeries.waves,
    nextSeriesStepsPerWave: program.fiveWaveSeries.nextSeries.stepsPerWave,
    round11StepCount: program.round11Cycle.totalSteps,
    round11Status: program.round11Cycle.status,
    tenYearHorizonCount: program.tenYearHorizon.length,
    automationRoles: program.automationRoles.map((role) => role.id),
  },
  approvedLocalPhases: phases.map((phase) => phase.label),
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
  assert(value?.executionModel?.planAndBuildInOneInvocation === true, "plan-and-build contract is missing");
  assert(value?.executionModel?.persistentProcess === false && value?.executionModel?.backgroundExecution === false, "foreground-only contract is invalid");
  assert(value?.executionModel?.externalWrites === false && value?.executionModel?.intentionalNetworkActions === false && value?.executionModel?.intentionalSecretAccess === false, "external boundary is invalid");
  assert(value?.executionModel?.isolationLevel === "reviewed-allowlist-no-os-sandbox" && value?.executionModel?.ambientNetworkIsolationEnforced === false && value?.executionModel?.ambientFilesystemIsolationEnforced === false && value?.executionModel?.descendantTerminationGuaranteed === false, "isolation disclosure is invalid");
  assert(value?.executionModel?.githubPush === false && value?.executionModel?.commit === false && value?.executionModel?.merge === false && value?.executionModel?.release === false && value?.executionModel?.deployment === false, "delivery boundary is invalid");
  assert(value?.currentMarketplace?.canonicalInstall === "seis-ai-agent@seis-repo", "canonical installation is invalid");
  assert(value?.currentMarketplace?.publicCardCount >= 30 && value?.currentMarketplace?.publicCardCount <= 50, "public-card range is invalid");
  assert(value?.currentMarketplace?.retainedSourceCapabilityCount === 380 && value?.currentMarketplace?.maximumBundleSize === 15, "bundle boundary is invalid");
  assert(value?.immediateCycle?.totalSteps === 30 && value?.immediateCycle?.rounds?.length === 5 && value.immediateCycle.rounds.every((round) => round.steps?.length === 6), "30-step cycle is invalid");
  assert(value?.fiveWaveSeries?.waves === 5 && value?.fiveWaveSeries?.stepsPerWave === 100 && value?.fiveWaveSeries?.roundsPerWave === 5, "five-wave cadence is invalid");
  assert(value?.fiveWaveSeries?.nextSeries?.waves === 5 && value?.fiveWaveSeries?.nextSeries?.stepsPerWave === 200 && value?.fiveWaveSeries?.nextSeries?.status === "active-round-11-plan-and-local-build", "next-series cadence is invalid");
  assert(value?.round11Cycle?.round === 11 && value?.round11Cycle?.totalSteps === 200 && value?.round11Cycle?.status === "in-progress-plan-and-local-build" && value?.round11Cycle?.rounds?.length === 10 && value.round11Cycle.rounds.every((round) => round.steps?.length === 20), "Round 11 cycle is invalid");
  assert(value?.tenYearHorizon?.length === 10 && value.tenYearHorizon.every((year, index) => year.year === index + 1 && year.execution === "strategic-gated-not-background"), "ten-year horizon is invalid");
  assert(Array.isArray(value?.automationRoles) && value.automationRoles.length === 6, "automation roles are invalid");
  assert(Array.isArray(value?.commandAllowlist) && value.commandAllowlist.length === 46, "command allowlist is invalid");
}

function buildPhases() {
  return [
    localNode("regenerate curated marketplace projection", ["scripts/create-seis-public-plugin-family.mjs"]),
    localNode("regenerate bounded bundle packages", ["scripts/create-seis-public-plugin-bundles.mjs"]),
    localNode("regenerate SEIS Core application catalog", ["scripts/create-seis-core-plugin-catalog.mjs"]),
    localNode("regenerate unified plugin suite", ["scripts/create-seis-unified-plugin-suite.mjs"]),
    localNode("regenerate MCP permission evidence", ["scripts/create-seis-mcp-permission.mjs"]),
    localNode("regenerate public install state", ["scripts/create-seis-public-install-state.mjs"]),
    localNode("regenerate public install evidence", ["scripts/create-seis-public-install-evidence.mjs"]),
    localNode("regenerate public runtime status", ["scripts/create-seis-public-runtime-status.mjs"]),
    localNode("regenerate UI state audit evidence", ["scripts/create-seis-ui-state-contract-audit.mjs"]),
    localNode("regenerate Wave 4 integration checkpoint", ["scripts/create-seis-public-plugin-wave-4-integration-checkpoint.mjs"]),
    localNode("regenerate Wave 4 public-boundary decision", ["scripts/create-seis-public-plugin-wave-4-public-boundary-decision.mjs"]),
    localNode("regenerate Wave 4 handoff preparation", ["scripts/create-seis-public-plugin-wave-4-handoff-preparation.mjs"]),
    localNode("regenerate Wave 4 closeout-sequence decision", ["scripts/create-seis-public-plugin-wave-4-closeout-sequence-decision.mjs"]),
    localNode("regenerate Wave 4 repository-local handoff", ["scripts/create-seis-public-plugin-wave-4-repository-local-handoff.mjs"]),
    localNode("regenerate Wave 4 following-wave review", ["scripts/create-seis-public-plugin-wave-4-following-wave-review.mjs"]),
    localNode("regenerate Wave 4 evidence retention", ["scripts/create-seis-public-plugin-wave-4-evidence-retention.mjs"]),
    localNode("regenerate Wave 4 closeout", ["scripts/create-seis-public-plugin-wave-4-closeout.mjs"]),
    localNode("regenerate Wave 4 program", ["scripts/create-seis-public-plugin-wave-4-program.mjs"]),
    localNode("regenerate continuity cadence", ["scripts/create-seis-public-plugin-continuity-cadence.mjs"]),
    localNode("regenerate consolidation evidence", ["scripts/create-seis-public-plugin-consolidation.mjs"]),
    localNode("regenerate supervised autopilot program", ["scripts/create-seis-public-plugin-supervised-autopilot.mjs"]),
    localNode("regenerate project manifest audit evidence", ["scripts/create-seis-project-manifest-audit.mjs"]),
    localNode("check marketplace freshness", ["scripts/create-seis-public-plugin-family.mjs", "--check"]),
    localNode("check bundle freshness", ["scripts/create-seis-public-plugin-bundles.mjs", "--check"]),
    localNode("check SEIS Core application catalog freshness", ["scripts/create-seis-core-plugin-catalog.mjs", "--check"]),
    localNode("check unified plugin suite freshness", ["scripts/create-seis-unified-plugin-suite.mjs", "--check"]),
    localNode("check MCP permission freshness", ["scripts/create-seis-mcp-permission.mjs", "--check"]),
    localNode("check public install state freshness", ["scripts/create-seis-public-install-state.mjs", "--check"]),
    localNode("check UI state audit freshness", ["scripts/create-seis-ui-state-contract-audit.mjs", "--check"]),
    localNode("check Wave 4 integration checkpoint freshness", ["scripts/create-seis-public-plugin-wave-4-integration-checkpoint.mjs", "--check"]),
    localNode("check Wave 4 public-boundary decision freshness", ["scripts/create-seis-public-plugin-wave-4-public-boundary-decision.mjs", "--check"]),
    localNode("check consolidation freshness", ["scripts/create-seis-public-plugin-consolidation.mjs", "--check"]),
    localNode("check autopilot freshness", ["scripts/create-seis-public-plugin-supervised-autopilot.mjs", "--check"]),
    localNode("check continuity cadence freshness", ["scripts/create-seis-public-plugin-continuity-cadence.mjs", "--check"]),
    localNode("check expansion program", ["scripts/check-seis-public-plugin-expansion-program.mjs"]),
    localNode("check canonical plugin bundle", ["scripts/check-seis-plugin-bundle.mjs", "--no-local"]),
    localNode("check curated specialist packages", ["scripts/check-seis-specialist-plugins.mjs"]),
    localNode("check public marketplace terminology", ["scripts/check-seis-public-marketplace-terminology.mjs"]),
    localNode("check SEIS-Agent integration", ["scripts/check-seis-agent-plugin-integration.mjs"]),
    localNode("run bundle tests", ["--test", "plugins/seis-core/test/public-plugin-bundles.test.mjs"]),
    localNode("run consolidation tests", ["--test", "plugins/seis-core/test/public-plugin-consolidation.test.mjs"]),
    localNode("run supervised autopilot tests", ["--test", "plugins/seis-core/test/public-plugin-supervised-autopilot.test.mjs"]),
    localNode("run marketplace integrity tests", ["--test", "plugins/seis-core/test/marketplace-integrity.test.mjs"]),
    localNode("check project manifest audit freshness", ["scripts/create-seis-project-manifest-audit.mjs", "--check"]),
    localNode("run project manifest audit tests", ["--test", "plugins/seis-core/test/project-manifest-audit.test.mjs"]),
    localGit("check diff whitespace", ["diff", "--check"]),
  ];
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
    assert(entry.externalWrite === false && entry.network === false && entry.secrets === false, `allowlist boundary mismatch at phase ${index + 1}`);
  }
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
