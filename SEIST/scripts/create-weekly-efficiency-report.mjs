import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const reportPath = "dist/weekly-efficiency-report.json";
const lowPressureDoc = "docs/governance/full-efficiency-low-pressure-mode.md";
const manifestPath = "dist/server-upload-manifest.json";
const serverPackagePath = "dist/seis-static.zip";

function run(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0"
    }
  });
}

function trim(value) {
  return String(value || "").trim();
}

function getFileSignal(path) {
  if (!existsSync(path)) {
    return {
      exists: false
    };
  }

  const stats = statSync(path);

  return {
    exists: true,
    bytes: stats.size,
    modifiedAt: stats.mtime.toISOString()
  };
}

function readJson(path) {
  if (!existsSync(path)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    return {
      parseError: error.message
    };
  }
}

function getGitState() {
  const insideWorkTree = run("git", ["rev-parse", "--is-inside-work-tree"]);

  if (insideWorkTree.status !== 0 || trim(insideWorkTree.stdout) !== "true") {
    return {
      ok: false,
      reason: "workspace is not a Git working tree",
      nextStep: "Connect this iCloud staging folder to the intended GitHub repository before commit/push."
    };
  }

  const branch = run("git", ["branch", "--show-current"]);
  const status = run("git", ["status", "--short", "--branch"]);
  const remote = run("git", ["remote", "-v"]);

  return {
    ok: true,
    branch: trim(branch.stdout) || "unknown",
    status: trim(status.stdout),
    remote: trim(remote.stdout)
  };
}

function getGithubAuthState() {
  const auth = run("gh", ["auth", "status", "-h", "github.com"]);

  if (auth.status === 0) {
    return {
      ok: true,
      reason: "GitHub CLI authentication is available."
    };
  }

  return {
    ok: false,
    reason: "GitHub CLI authentication is missing.",
    nextStep: "Run gh auth login -h github.com before origin push."
  };
}

function runAutomation(commandName, args) {
  const result = run("npm", ["run", commandName, ...args]);

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: trim(result.stdout),
    stderr: trim(result.stderr)
  };
}

function parsePublishReadiness(stdout) {
  if (!stdout) {
    return null;
  }

  try {
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

function buildNextActions(report) {
  const actions = [];

  if (!report.release.manifest.exists || !report.release.serverPackage.exists) {
    actions.push({
      priority: "yuksek",
      action: "Create release artifacts with npm run automation:refresh-release."
    });
  }

  if (!report.developmentAutomation.ok) {
    actions.push({
      priority: "yuksek",
      action: "Resolve automation:develop blockers before publish work."
    });
  }

  if (!report.git.ok) {
    actions.push({
      priority: "orta",
      action: "Reconnect this iCloud staging workspace to the intended GitHub repository."
    });
  }

  if (!report.githubAuth.ok) {
    actions.push({
      priority: "orta",
      action: "Authenticate GitHub CLI once, then rerun publish readiness."
    });
  }

  if (actions.length === 0) {
    actions.push({
      priority: "dusuk",
      action: "Proceed with one small reversible product or governance improvement, then rerun the weekly report."
    });
  }

  return actions.slice(0, 4);
}

function printSummary(report) {
  console.log("SEIS Weekly Efficiency Report");
  console.log(`- mode: ${report.mode}`);
  console.log(`- generatedAt: ${report.generatedAt}`);
  console.log(`- lowPressureGovernance: ${report.lowPressureGovernance.exists ? "present" : "missing"}`);
  console.log(`- releaseManifest: ${report.release.manifest.exists ? "present" : "missing"}`);
  console.log(`- serverPackage: ${report.release.serverPackage.exists ? "present" : "missing"}`);
  console.log(`- automation:develop: ${report.developmentAutomation.ok ? "pass" : "fail"}`);
  console.log(`- automation:publish-readiness: ${report.publishReadiness.ok ? "pass" : "blocked"}`);
  console.log(`- git: ${report.git.ok ? "connected" : report.git.reason}`);
  console.log(`- githubAuth: ${report.githubAuth.ok ? "available" : report.githubAuth.reason}`);
  console.log("Next actions:");

  for (const item of report.nextActions) {
    console.log(`- ${item.priority}: ${item.action}`);
  }
}

const developmentAutomation = runAutomation("automation:develop", []);
const publishReadiness = runAutomation("automation:publish-readiness", []);
const publishReadinessReport = parsePublishReadiness(publishReadiness.stdout);
const manifest = readJson(manifestPath);

const report = {
  name: "seis-weekly-efficiency-report",
  mode: "full-cognition-low-machine-pressure",
  generatedAt: new Date().toISOString(),
  workspace: process.cwd(),
  lowPressureGovernance: getFileSignal(lowPressureDoc),
  release: {
    manifest: {
      ...getFileSignal(manifestPath),
      generatedAt: manifest?.generatedAt || null,
      parseError: manifest?.parseError || null
    },
    serverPackage: getFileSignal(serverPackagePath)
  },
  git: getGitState(),
  githubAuth: getGithubAuthState(),
  developmentAutomation,
  publishReadiness: {
    ...publishReadiness,
    report: publishReadinessReport
  }
};

report.nextActions = buildNextActions(report);

if (process.argv.includes("--write-report")) {
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

printSummary(report);

if (!developmentAutomation.ok) {
  process.exit(1);
}
