const { readFileSync, existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");

function run(root, command, args) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8"
  });
}

function trim(value) {
  return String(value || "").trim();
}

function readContract() {
  try {
    if (!existsSync("content/development/publish-gate-contract.json")) {
      return {};
    }

    return JSON.parse(readFileSync("content/development/publish-gate-contract.json", "utf8"));
  } catch (error) {
    return {};
  }
}

function parseDirtyFiles(stdout) {
  return String(stdout || "")
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

function getPublishReadinessState(root = process.cwd()) {
  const contract = readContract();
  const expectedBranch = trim(contract?.remote?.targetBranch) || "main";
  const expectedRemoteName = trim(contract?.remote?.name) || "origin";
  const expectedUpstream = `${expectedRemoteName}/${expectedBranch}`;
  const git = (args) => run(root, "git", args);
  const inside = git(["rev-parse", "--is-inside-work-tree"]);
  const gitInside = inside.status === 0;

  if (!gitInside) {
    return {
      gitInside: false,
      branchName: "",
      statusLine: "",
      dirtyFiles: [],
      hasRemote: false,
      isExpectedBranch: false,
      upstreamName: "",
      hasUpstream: false,
      isExpectedUpstream: false,
      worktreeClean: false,
      ghAvailable: false,
      authReady: false,
      aheadCount: null,
      behindCount: null,
      syncLabel: "unknown",
      blocker: "workspace is not a git working tree",
      action: "initialize or attach this directory to the intended repository",
      ready: false
    };
  }

  const branch = git(["branch", "--show-current"]);
  const status = git(["status", "--short", "--branch"]);
  const porcelainStatus = git(["status", "--short"]);
  const remote = git(["remote", "-v"]);
  const upstream = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
  const ghAuth = run(root, "gh", ["auth", "status", "-h", "github.com"]);

  const branchName = trim(branch.stdout);
  const statusLine = trim(status.stdout).split("\n").filter(Boolean)[0] || "";
  const dirtyFiles = parseDirtyFiles(porcelainStatus.stdout);
  const upstreamName = upstream.status === 0 ? trim(upstream.stdout) : "";
  const hasRemote = trim(remote.stdout).length > 0;
  const hasUpstream = upstream.status === 0 && upstreamName.length > 0;
  const isExpectedBranch = branchName === expectedBranch;
  const isExpectedUpstream = upstreamName === expectedUpstream;
  const worktreeClean = dirtyFiles.length === 0;
  const ghAvailable = !ghAuth.error;
  const authReady = hasRemote && ghAvailable && ghAuth.status === 0;

  let aheadCount = null;
  let behindCount = null;

  if (hasUpstream) {
    const divergence = git(["rev-list", "--left-right", "--count", "@{u}...HEAD"]);
    const [behindValue, aheadValue] = trim(divergence.stdout).split(/\s+/);
    behindCount = Number.parseInt(behindValue || "0", 10);
    aheadCount = Number.parseInt(aheadValue || "0", 10);
  }

  const syncLabel = hasUpstream ? `ahead ${aheadCount}, behind ${behindCount}` : "unknown";

  let blocker = "";
  let action = "";

  if (!hasRemote) {
    blocker = "git remote is not configured";
    action = "configure the intended origin remote before publish preflight";
  } else if (!isExpectedBranch) {
    blocker = `active branch is not ${expectedBranch}`;
    action = `switch to ${expectedBranch} before publish preflight`;
  } else if (!worktreeClean) {
    blocker = "working tree must be clean before publish";
    action = "commit intended changes before push and keep unrelated edits out of the publish path";
  } else if (!hasUpstream) {
    blocker = "branch is not tracking a remote upstream";
    action = `run git branch --set-upstream-to ${expectedUpstream} ${expectedBranch}`;
  } else if (!isExpectedUpstream) {
    blocker = `branch upstream is not ${expectedUpstream}`;
    action = `point ${expectedBranch} to ${expectedUpstream} before publish preflight`;
  } else if (!ghAvailable) {
    blocker = "GitHub CLI is not available in this environment";
    action = "install GitHub CLI before publish preflight";
  } else if (!authReady) {
    blocker = "GitHub CLI auth is missing";
    action = "run gh auth login -h github.com";
  } else if (Number.isInteger(behindCount) && behindCount > 0) {
    blocker = `local branch is behind ${expectedUpstream}`;
    action = `integrate ${expectedUpstream} into ${expectedBranch} before pushing`;
  }

  return {
    gitInside,
    branchName,
    statusLine,
    dirtyFiles,
    hasRemote,
    isExpectedBranch,
    expectedBranch,
    expectedRemoteName,
    expectedUpstream,
    upstreamName,
    hasUpstream,
    isExpectedUpstream,
    worktreeClean,
    ghAvailable,
    authReady,
    aheadCount,
    behindCount,
    syncLabel,
    blocker,
    action,
    ready: blocker.length === 0
  };
}

module.exports = {
  getPublishReadinessState
};
