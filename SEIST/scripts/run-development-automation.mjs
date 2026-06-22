import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const checks = [
  {
    id: "workspace-routing",
    command: ["npm", ["run", "check:workspace"]],
    required: true
  },
  {
    id: "foundation",
    command: ["npm", ["run", "check:foundation"]],
    required: true
  },
  {
    id: "javascript-syntax",
    command: ["npm", ["run", "check:js"]],
    required: true
  },
  {
    id: "deploy-readiness",
    command: ["node", ["scripts/check-deploy-readiness.mjs"]],
    required: true
  }
];

function run(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0"
    }
  });
}

function getGitSignal() {
  const insideWorkTree = run("git", ["rev-parse", "--is-inside-work-tree"]);

  if (insideWorkTree.status !== 0 || insideWorkTree.stdout.trim() !== "true") {
    return {
      available: false,
      severity: "orta",
      message: "Local staging workspace detected; Git history is not connected here.",
      nextStep: "Connect or clone the GitHub repository before commit/push automation."
    };
  }

  const branch = run("git", ["branch", "--show-current"]);
  const status = run("git", ["status", "--short", "--branch"]);
  const remote = run("git", ["remote", "-v"]);

  return {
    available: true,
    severity: status.stdout.includes("\n") ? "orta" : "dusuk",
    branch: branch.stdout.trim() || "unknown",
    status: status.stdout.trim(),
    remote: remote.stdout.trim(),
    message: "Git workspace detected.",
    nextStep: "Review status, then commit and push from the active protected branch flow."
  };
}

function getGithubAuthSignal() {
  const auth = run("gh", ["auth", "status", "-h", "github.com"]);

  if (auth.status === 0) {
    return {
      available: true,
      severity: "dusuk",
      message: "GitHub CLI authentication is available."
    };
  }

  return {
    available: false,
    severity: "yuksek",
    message: "GitHub CLI authentication is missing or unavailable.",
    nextStep: "Run gh auth login -h github.com before origin push automation."
  };
}

function runChecks() {
  return checks.map(check => {
    const [command, args] = check.command;
    const result = run(command, args);

    return {
      id: check.id,
      required: check.required,
      ok: result.status === 0,
      status: result.status,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim()
    };
  });
}

function buildNextActions(gitSignal, githubAuthSignal, checkResults) {
  const failedChecks = checkResults.filter(check => !check.ok);
  const checksAreGreen = failedChecks.length === 0;
  const actions = [];

  if (failedChecks.length > 0) {
    actions.push({
      priority: "yuksek",
      action: describeFailedChecks(failedChecks)
    });
  }

  if (!gitSignal.available) {
    actions.push({
      priority: "orta",
      action: "Reconnect this staging workspace to the intended GitHub repository."
    });
  }

  if (!githubAuthSignal.available) {
    actions.push({
      priority: "orta",
      action: "Authenticate GitHub CLI before trying to push origin."
    });
  }

  if (checksAreGreen && (!gitSignal.available || !githubAuthSignal.available)) {
    actions.push({
      priority: "dusuk",
      action: "Continue local staging work with one reversible UI, content, governance, or quality improvement while publish blockers are resolved separately."
    });
  }

  if (actions.length === 0) {
    actions.push({
      priority: "dusuk",
      action: "Pick one small UI, content, or governance improvement and keep the diff reversible."
    });
  }

  return actions.slice(0, 4);
}

function describeFailedChecks(failedChecks) {
  const failedIds = failedChecks.map(check => check.id);
  const deployReadiness = failedChecks.find(check => check.id === "deploy-readiness");

  if (deployReadiness?.stderr.includes("server package sha256 does not match manifest")) {
    return "Refresh release artifacts with npm run automation:refresh-release, then rerun npm run automation:develop.";
  }

  if (deployReadiness?.stderr.includes("server package is older than packaged source")) {
    return "Packaged source changed after the last release build; run npm run automation:refresh-release, then rerun npm run automation:develop.";
  }

  return `Fix failing checks: ${failedIds.join(", ")}`;
}

function printSummary(report) {
  console.log("SEIS Development Automation");
  console.log(`- mode: ${report.mode}`);
  console.log(`- generatedAt: ${report.generatedAt}`);
  console.log(`- git: ${report.git.message}`);
  console.log(`- githubAuth: ${report.githubAuth.message}`);

  for (const check of report.checks) {
    console.log(`- ${check.id}: ${check.ok ? "pass" : "fail"}`);
  }

  console.log("Next actions:");
  for (const item of report.nextActions) {
    console.log(`- ${item.priority}: ${item.action}`);
  }
}

const git = getGitSignal();
const githubAuth = getGithubAuthSignal();
const checkResults = runChecks();
const report = {
  name: "seis-development-automation",
  mode: "high-efficiency-low-power",
  generatedAt: new Date().toISOString(),
  git,
  githubAuth,
  checks: checkResults,
  nextActions: buildNextActions(git, githubAuth, checkResults)
};

if (process.argv.includes("--write-report")) {
  const reportPath = "dist/development-automation-report.json";
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(`${reportPath}`, `${JSON.stringify(report, null, 2)}\n`);
}

printSummary(report);

if (checkResults.some(check => !check.ok)) {
  process.exit(1);
}
