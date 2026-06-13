const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, "content", "development", "aggressive-execution-plan.json");
const REPORT_PATH = path.join(ROOT, "content", "development", "aggressive-local-run-report.json");
const CHECK_MODE = process.argv.includes("--check");

const SAFE_COMMANDS = [
  "npm run check:aggressive-execution-plan",
  "npm run check:workspace",
  "npm run check:release-sync",
  "npm run check:motion-evidence",
  "npm run check:mobile-ergonomics",
  "npm run check:aggressive-capability-map"
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function runCommand(command) {
  const startedAt = Date.now();
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0"
    }
  });

  return {
    command,
    status: result.status === 0 ? "passed" : "failed",
    exitCode: result.status,
    durationMs: Date.now() - startedAt,
    summary: String(result.stdout || result.stderr || "").split("\n").filter(Boolean).slice(-2).join(" | ")
  };
}

function validateReport(report) {
  const failures = [];
  if (report.id !== "seis-aggressive-local-run-report") failures.push("report id must stay stable");
  if (report.mode !== "safe-local-aggressive-cycle") failures.push("report mode must stay safe-local-aggressive-cycle");
  if (!Array.isArray(report.commands) || report.commands.length < SAFE_COMMANDS.length) failures.push("report must include all safe commands");
  for (const command of SAFE_COMMANDS) {
    if (!report.commands?.some((entry) => entry.command === command && entry.status === "passed")) {
      failures.push(`missing passing command: ${command}`);
    }
  }
  if (report.publishPosture?.pushAllowed !== false) failures.push("local aggressive run must keep pushAllowed false");
  if (!Array.isArray(report.doNotCross) || report.doNotCross.length < 5) failures.push("report must preserve do-not-cross boundaries");
  return failures;
}

if (CHECK_MODE) {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error("Aggressive local run report is missing. Run npm run automation:aggressive-local-cycle.");
    process.exit(1);
  }
  const report = readJson(REPORT_PATH);
  if (report.generatedAt) {
    const ageMs = Date.now() - new Date(report.generatedAt).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    if (ageHours > 24) {
      console.warn(`Warning: aggressive local run report is ${Math.round(ageHours)}h old — re-run to revalidate.`);
    }
  }
  const failures = validateReport(report);
  if (failures.length > 0) {
    console.error("Aggressive local run report check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log("Aggressive local run report check passed.");
  process.exit(0);
}

if (!fs.existsSync(PLAN_PATH)) {
  console.error("Missing aggressive execution plan. Run npm run automation:aggressive-execution-plan first.");
  process.exit(1);
}

const plan = readJson(PLAN_PATH);
const commands = SAFE_COMMANDS.map(runCommand);
const failed = commands.filter((entry) => entry.status !== "passed");
const report = {
  id: "seis-aggressive-local-run-report",
  version: 1,
  mode: "safe-local-aggressive-cycle",
  generatedAt: "2026-06-06T00:00:00.000Z",
  sourcePlan: "content/development/aggressive-execution-plan.json",
  sprintWindowMinutes: plan.sprintWindowMinutes,
  publishPosture: {
    configuredRemote: plan.publishState?.configuredRemote === true,
    pushAllowed: false,
    reason: plan.publishState?.expectedBlocker || "publish gated"
  },
  commands,
  passed: failed.length === 0,
  nextAction: failed.length === 0
    ? "Continue with the next reversible cockpit or governance batch; do not push until publish readiness is clean."
    : "Fix failing local checks before continuing aggressive work.",
  doNotCross: plan.doNotCross || []
};

fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Aggressive local run report written: ${path.relative(ROOT, REPORT_PATH)}`);

if (failed.length > 0) {
  for (const failure of failed) console.error(`- failed: ${failure.command}`);
  process.exit(1);
}
