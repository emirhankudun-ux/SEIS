import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const fallbackBranch = process.env.SEIS_PRIMARY_BRANCH || "main";
const publishContractPath = "content/development/publish-gate-contract.json";
const remoteConfigPath = "content/development/github-remote-configuration.json";
const fullQualityMode = process.env.SEIS_PUBLISH_READINESS_FULL === "1";

const publishContract = existsSync(publishContractPath)
  ? (() => {
      try {
        return JSON.parse(readFileSync(publishContractPath, "utf8"));
      } catch (error) {
        return null;
      }
    })()
  : null;

const remoteConfig = existsSync(remoteConfigPath)
  ? (() => {
      try {
        return JSON.parse(readFileSync(remoteConfigPath, "utf8"));
      } catch (error) {
        return null;
      }
    })()
  : null;

const expectedBranch = String((publishContract && publishContract.remote && publishContract.remote.targetBranch) || fallbackBranch);
const expectedRemote = String((publishContract && publishContract.remote && publishContract.remote.name) || "origin");
const expectedRemoteHint = String(
  (publishContract && publishContract.remote && publishContract.remote.url) ||
  (remoteConfig && remoteConfig.repository && remoteConfig.repository.remoteUrl) ||
  "github.com"
);
const expectedUpstream = `${expectedRemote}/${expectedBranch}`;

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
  const isExpectedUpstream = upstreamText === expectedUpstream;

  if (currentBranch !== expectedBranch) {
    return {
      ok: false,
      branch: currentBranch,
      remote: remoteText,
      status: statusText,
      divergence,
      reason: `expected branch ${expectedBranch}, got ${currentBranch || "unknown"}`,
      nextStep: `Switch to ${expectedBranch} before publishing.`
    };
  }

  if (!remoteText.includes(expectedRemoteHint)) {
    return {
      ok: false,
      branch: currentBranch,
      remote: remoteText,
      status: statusText,
      divergence,
      reason: `remote must include ${expectedRemoteHint}`,
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
      upstream: upstreamText || null,
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
      upstream: null,
      reason: "branch upstream is not configured",
      nextStep: `Set ${expectedBranch} to track ${expectedUpstream} before publishing.`
    };
  }

  if (!isExpectedUpstream) {
    return {
      ok: false,
      branch: currentBranch,
      remote: remoteText,
      status: statusText,
      upstream: upstreamText,
      divergence,
      reason: `expected upstream ${expectedUpstream}, got ${upstreamText}`,
      nextStep: `Point ${expectedBranch} to ${expectedUpstream} before publishing.`
    };
  }

  if (divergence.behind > 0) {
    return {
      ok: false,
      branch: currentBranch,
      remote: remoteText,
      status: statusText,
      upstream: upstreamText,
      divergence,
      reason: `local branch is behind ${expectedUpstream}`,
      nextStep: `Run git pull --rebase ${expectedRemote} ${expectedBranch}, resolve conflicts, then rerun publish preflight.`
    };
  }

  return {
    ok: true,
    branch: currentBranch,
    remote: remoteText,
    status: statusText,
    divergence,
    upstream: upstreamText,
    reason: "Git branch, clean worktree, and upstream are publish-ready."
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
    nextStep: `Run gh auth login -h github.com before pushing to ${expectedRemote}.`
  };
}

function getQualityState() {
  const checks = fullQualityMode
    ? [
        { id: "automation:develop", command: "npm", args: ["run", "automation:develop"] }
      ]
    : [
        { id: "foundation", command: "node", args: ["scripts/check-foundation.mjs"] },
        { id: "seo-metadata", command: "node", args: ["scripts/check-seo-metadata.mjs"] },
        { id: "locales", command: "node", args: ["scripts/check-locales.mjs"] },
        { id: "code-automation-plan", command: "node", args: ["scripts/check-code-automation-plan.cjs"] },
        { id: "aggressive-capability-map", command: "node", args: ["scripts/check-aggressive-capability-map.cjs"] },
        { id: "server-target", command: "node", args: ["scripts/check-server-targets.mjs"] },
        { id: "server-cloud-report", command: "node", args: ["scripts/create-server-cloud-activation-report.cjs", "--check"] },
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
    !githubAuth.ok ? { area: "github-auth", reason: githubAuth.reason, nextStep: githubAuth.nextStep } : null,
    !quality.ok ? { area: "quality", reason: quality.reason, nextStep: quality.nextStep } : null
  ].filter(Boolean);

  return {
    ok: blockers.length === 0,
    mode: "publish-readiness-preflight",
    qualityMode: quality.mode,
    expectedBranch,
    expectedRemote,
    expectedUpstream,
    expectedRemoteHint,
    git,
    githubAuth,
    quality,
    blockers,
    nextCommand: blockers.length === 0 ? `GIT_TERMINAL_PROMPT=0 git push ${expectedRemote} ${expectedBranch}` : null
  };
}

const report = buildReport();

console.log(JSON.stringify(report, null, 2));

if (!report.ok) {
  process.exit(1);
}
