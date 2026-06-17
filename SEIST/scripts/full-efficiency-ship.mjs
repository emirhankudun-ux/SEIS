import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(process.cwd());
const home = process.env.HOME || "/Users/emirhan";
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const branch = process.env.SEIS_PRIMARY_BRANCH || "UIXAppTTR";
const syncTarget = process.env.SEIS_ICLOUD_SYNC_TARGET ||
  join(home, "Library/Mobile Documents/com~apple~CloudDocs/Github/seis-digital-experience-foundation");
const pushRepo = process.env.SEIS_GITHUB_REPO_DIR || syncTarget;
const backupDir = join(syncTarget, ".sync-backups", timestamp);
const reportPath = join(root, "dist", "full-efficiency-shipment-report.json");
const autoCommit = process.env.SEIS_AUTO_COMMIT === "1";

const steps = [];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || root,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0"
    }
  });

  return {
    command: [command, ...args].join(" "),
    cwd: options.cwd || root,
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim()
  };
}

function record(id, result, required = true) {
  const entry = { id, required, ...result };
  steps.push(entry);
  const label = result.ok ? "pass" : "fail";
  console.log(`- ${id}: ${label}`);
  if (result.stdout) console.log(result.stdout);
  if (result.stderr) console.error(result.stderr);
  return entry;
}

function runRequired(id, command, args, options = {}) {
  const entry = record(id, run(command, args, options), true);
  if (!entry.ok) {
    writeReport("blocked", `${id} failed`);
    process.exit(1);
  }
  return entry;
}

function syncToIcloudTarget() {
  mkdirSync(syncTarget, { recursive: true });
  mkdirSync(backupDir, { recursive: true });

  return run("rsync", [
    "-a",
    "--backup",
    `--backup-dir=${backupDir}`,
    "--exclude", ".git",
    "--exclude", ".playwright-mcp",
    "--exclude", ".serena",
    "--exclude", "node_modules",
    "--exclude", ".next",
    "--exclude", "apps/seis-nextjs-foundation/.next",
    `${root}/`,
    `${syncTarget}/`
  ]);
}

function inspectPushRepo() {
  if (!existsSync(pushRepo)) {
    return {
      ok: false,
      reason: "push_repo_missing",
      message: `Push repository not found: ${pushRepo}`
    };
  }

  const workTree = run("git", ["rev-parse", "--is-inside-work-tree"], { cwd: pushRepo });
  const currentBranch = run("git", ["branch", "--show-current"], { cwd: pushRepo });
  const remote = run("git", ["remote", "-v"], { cwd: pushRepo });
  const status = run("git", ["status", "--short", "--branch"], { cwd: pushRepo });
  const auth = run("gh", ["auth", "status", "-h", "github.com"], { cwd: pushRepo });

  steps.push({ id: "push-repo-worktree", required: true, ...workTree });
  steps.push({ id: "push-repo-branch", required: true, ...currentBranch });
  steps.push({ id: "push-repo-remote", required: true, ...remote });
  steps.push({ id: "push-repo-status", required: true, ...status });
  steps.push({ id: "github-auth", required: true, ...auth });

  if (!workTree.ok || workTree.stdout !== "true") {
    return { ok: false, reason: "not_git_worktree", message: "Push target is not a Git worktree." };
  }
  if (currentBranch.stdout !== branch) {
    return { ok: false, reason: "wrong_branch", message: `Expected ${branch}, got ${currentBranch.stdout || "unknown"}.` };
  }
  if (!remote.stdout.includes("UIX-Apps.git")) {
    return { ok: false, reason: "wrong_remote", message: "Push target must use the UIX-Apps GitHub remote." };
  }
  if (status.stdout.split("\n").slice(1).length > 0) {
    return { ok: false, reason: "dirty_worktree", message: "Push target has uncommitted changes; review and commit intentionally before push." };
  }
  if (!auth.ok) {
    return { ok: false, reason: "github_auth_missing", message: "GitHub CLI authentication is missing." };
  }

  return { ok: true, message: "Push repo is ready." };
}

function autoCommitIfRequested() {
  if (!autoCommit) return;

  const workTree = record("auto-commit-worktree", run("git", ["rev-parse", "--is-inside-work-tree"], { cwd: pushRepo }), true);
  if (!workTree.ok || workTree.stdout !== "true") return;

  const branchCheck = record("auto-commit-branch", run("git", ["branch", "--show-current"], { cwd: pushRepo }), true);
  if (!branchCheck.ok || branchCheck.stdout !== branch) return;

  const status = record("auto-commit-status", run("git", ["status", "--short"], { cwd: pushRepo }), true);
  if (!status.stdout) {
    console.log("- auto-commit: clean");
    return;
  }

  const add = record("auto-commit-add", run("git", ["add", "-A"], { cwd: pushRepo }), true);
  if (!add.ok) return;

  record("auto-commit-commit", run("git", [
    "commit",
    "-m",
    "feat: sync SEIS full-efficiency shipment"
  ], { cwd: pushRepo }), true);
}

function maybePushToGithub() {
  autoCommitIfRequested();

  const inspection = inspectPushRepo();
  if (!inspection.ok) {
    console.log(`- github-push: blocked (${inspection.reason})`);
    console.log(inspection.message);
    writeReport("blocked", inspection.message);
    return false;
  }

  const push = record("github-push", run("git", ["push", "origin", branch], { cwd: pushRepo }), true);
  writeReport(push.ok ? "shipped" : "blocked", push.ok ? "GitHub push completed." : "GitHub push failed.");
  return push.ok;
}

function writeReport(status, summary) {
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify({
    status,
    summary,
    generatedAt: new Date().toISOString(),
    source: root,
    syncTarget,
    pushRepo,
    branch,
    backupDir,
    steps
  }, null, 2)}\n`);
  console.log(`Report: ${reportPath}`);
}

runRequired("workspace-routing", "node", ["scripts/check-workspace-routing.mjs"]);
runRequired("foundation", "node", ["scripts/check-foundation.mjs"]);
runRequired("static-build", "npm", ["run", "build:static"]);
runRequired("static-build-check", "node", ["scripts/check-static-build.mjs"]);
const syncResult = record("icloud-sync-rsync", syncToIcloudTarget(), true);
if (!syncResult.ok) {
  writeReport("blocked", "iCloud sync failed.");
  process.exit(1);
}

if (!maybePushToGithub()) {
  process.exit(1);
}
