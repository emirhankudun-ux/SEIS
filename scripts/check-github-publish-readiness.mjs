import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));

const expectedBranch = "main";
const expectedRemoteHint = "SEIS";
const fullQualityMode = process.env.SEIS_PUBLISH_READINESS_FULL === "1";
const emitJson = Boolean(args.json) || Boolean(args.ci);

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

function hasDirtyWorktree(statusText) {
  return statusText
    .split("\n")
    .map((line) => line.trim())
    .some((line) => line && !line.startsWith("##"));
}

function getDivergence(statusText) {
  const branchLine = statusText
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("##")) || "";
  const ahead = Number((branchLine.match(/ahead (\d+)/) || [])[1] || 0);
  const behind = Number((branchLine.match(/behind (\d+)/) || [])[1] || 0);
  return { ahead, behind };
}

function getGitState() {
  const insideWorkTree = run("git", ["rev-parse", "--is-inside-work-tree"]);

  if (insideWorkTree.status !== 0 || trim(insideWorkTree.stdout) !== "true") {
    return {
      ok: false,
      reason: "workspace is not a Git working tree",
      nextStep: "Connect this folder to the intended GitHub repository before commit/push."
    };
  }

  const branch = run("git", ["branch", "--show-current"]);
  const remote = run("git", ["remote", "-v"]);
  const status = run("git", ["status", "--short", "--branch"]);
  const upstream = run("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
  const currentBranch = trim(branch.stdout);
  const remoteText = trim(remote.stdout);
  const statusText = trim(status.stdout);
  const divergence = getDivergence(statusText);
  const statusLines = statusText ? statusText.split("\n") : [];
  const worktreeClean = statusLines.length <= 1;
  const upstreamText = trim(upstream.stdout);
  const isExpectedUpstream = upstreamText === `origin/${expectedBranch}`;

  if (currentBranch !== expectedBranch) {
    return {
      ok: false,
      branch: currentBranch,
      remote: remoteText,
      status: statusText,
      divergence,
      reason: `expected branch ${expectedBranch}, got ${currentBranch || "unknown"}`,
      nextStep: `Switch to ${expectedBranch} before publishing SEIS.`
    };
  }

  if (!remoteText.includes(expectedRemoteHint)) {
    return {
      ok: false,
      branch: currentBranch,
      remote: remoteText,
      status: statusText,
      divergence,
      reason: `origin remote must include ${expectedRemoteHint}`,
      nextStep: "Set the intended GitHub remote before publishing."
    };
  }

  if (!worktreeClean) {
    return {
      ok: false,
      branch: currentBranch,
      remote: remoteText,
      status: statusText,
      divergence,
      reason: "working tree must be clean before publishing",
      nextStep: "Commit intended changes before pushing and keep unrelated edits out of the publish path."
    };
  }

  if (upstream.status !== 0 || !upstreamText) {
    return {
      ok: false,
      branch: currentBranch,
      remote: remoteText,
      status: statusText,
      divergence,
      reason: "branch upstream is not configured",
      nextStep: `Set ${expectedBranch} to track origin/${expectedBranch} before publishing.`
    };
  }

  if (!isExpectedUpstream) {
    return {
      ok: false,
      branch: currentBranch,
      remote: remoteText,
      status: statusText,
      divergence,
      upstream: upstreamText,
      reason: `expected upstream origin/${expectedBranch}, got ${upstreamText}`,
      nextStep: `Point ${expectedBranch} to origin/${expectedBranch} before publishing.`
    };
  }

  if (divergence.behind > 0) {
    return {
      ok: false,
      branch: currentBranch,
      remote: remoteText,
      status: statusText,
      divergence,
      upstream: upstreamText,
      reason: "local branch is behind origin",
      nextStep: `Run git pull --rebase origin ${expectedBranch}, resolve conflicts, then rerun publish preflight.`
    };
  }

  return {
    ok: true,
    branch: currentBranch,
    remote: remoteText,
    status: statusText,
    divergence,
    upstream: upstreamText,
    reason: "Git working tree and branch are publish-ready."
  };
}

function parseAuthSuggestions(output) {
  const details = String(output || "").toLowerCase();
  const suggestions = new Set();

  if (!details) {
    suggestions.add("Install GitHub CLI (`brew install gh`) and run `gh auth login -h github.com`.");
    return Array.from(suggestions);
  }

  if (details.includes("not logged into any accounts") || details.includes("no users logged into") || details.includes("not authenticated")) {
    suggestions.add("gh auth login -h github.com");
  }

  if (details.includes("must have admin rights") || details.includes("must have write") || details.includes("permission denied") || details.includes("forbidden")) {
    suggestions.add("gh auth refresh -h github.com -s codespace -s repo");
    suggestions.add("gh auth refresh -h github.com -s codespace");
  }

  if (details.includes("scope") && details.includes("missing") && details.includes("codespace")) {
    suggestions.add("gh auth refresh -h github.com -s codespace");
  }

  if (suggestions.size === 0) {
    suggestions.add("Run gh auth login -h github.com, then verify with gh auth status -h github.com.");
  }

  return Array.from(suggestions);
}

function getGithubAuthState() {
  const auth = run("gh", ["auth", "status", "-h", "github.com"]);
  const output = [trim(auth.stdout), trim(auth.stderr)].filter(Boolean).join("\n");
  const suggestions = parseAuthSuggestions(output);

  if (auth.status === 0) {
    return {
      ok: true,
      reason: "GitHub CLI authentication is available.",
      suggestions: []
    };
  }

  return {
    ok: false,
    reason: "GitHub CLI auth is missing or token scope is insufficient.",
    nextStep: suggestions[0] || "Run gh auth login -h github.com",
    suggestions,
    raw: output
  };
}

function getQualityState() {
  const checks = fullQualityMode
    ? [
        { id: "automation:develop", command: "npm", args: ["run", "automation:develop"] }
      ]
    : [
        { id: "open-source-governance", command: "node", args: ["scripts/check-open-source-governance.mjs"] },
        { id: "foundation", command: "node", args: ["scripts/check-foundation.mjs"] },
        { id: "workspace", command: "node", args: ["scripts/check-workspace.cjs"] },
        { id: "web-audit", command: "node", args: ["packages/seis-ai/bin/seis-check.mjs"] },
        { id: "seis-platform-language-policy", command: "python3", args: ["scripts/create-seis-platform-language-policy.py", "--check"] },
        { id: "seis-platform-kernel", command: "python3", args: ["scripts/check-seis-platform-kernel.py"] },
        { id: "javascript-syntax", command: "node", args: ["--check", "scripts/check-github-publish-readiness.mjs"] }
      ];

  const results = checks.map((check) => {
    const result = run(check.command, check.args);
    return {
      id: check.id,
      ok: result.status === 0,
      status: result.status,
      stdout: trim(result.stdout),
      stderr: trim(result.stderr)
    };
  });
  const failed = results.filter((result) => !result.ok);

  return {
    ok: failed.length === 0,
    mode: fullQualityMode ? "full" : "quick",
    reason: failed.length === 0
      ? `${fullQualityMode ? "Full" : "Quick"} publish readiness checks passed.`
      : `${fullQualityMode ? "Full" : "Quick"} publish readiness checks failed.`,
    checks: results,
    nextStep: failed.length === 0
      ? null
      : `Fix failing checks: ${failed.map((result) => result.id).join(", ")}.`
  };
}

function buildReport() {
  const git = getGitState();
  const githubAuth = getGithubAuthState();
  const quality = getQualityState();
  const blockers = [
    !git.ok ? { area: "git", reason: git.reason, nextStep: git.nextStep } : null,
    !githubAuth.ok ? { area: "github-auth", reason: githubAuth.reason, nextStep: githubAuth.nextStep, suggestions: githubAuth.suggestions || [] } : null,
    !quality.ok ? { area: "quality", reason: quality.reason, nextStep: quality.nextStep } : null
  ].filter(Boolean);

  return {
    ok: blockers.length === 0,
    mode: "publish-readiness-preflight",
    qualityMode: quality.mode,
    generatedAt: new Date().toISOString(),
    expectedBranch,
    expectedRemoteHint,
    git,
    githubAuth,
    quality,
    blockers,
    nextCommand: blockers.length === 0 ? `GIT_TERMINAL_PROMPT=0 git push origin ${expectedBranch}` : null
  };
}

function printHuman(report) {
  console.log(report.ok ? "Publish readiness: ready" : "Publish readiness: blocked");
  console.log(`- branch: ${report.git.branch || "unknown"}`);
  console.log(`- branch status: ${report.git.status || "unknown"}`);
  console.log(`- remote: ${report.git.remote || "none"}`);
  console.log(`- worktree clean: ${report.git.ok ? "yes" : "no"}`);
  if (!report.ok) {
    for (const blocker of report.blockers) {
      console.log(`- blocker [${blocker.area}]: ${blocker.reason}`);
      if (blocker.nextStep) console.log(`  next: ${blocker.nextStep}`);
    }
  }
}

const report = buildReport();

if (emitJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHuman(report);
}

if (!report.ok) {
  process.exit(1);
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help") {
      parsed[key] = true;
      continue;
    }
    if (key === "json" || key === "ci") {
      parsed[key] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}
