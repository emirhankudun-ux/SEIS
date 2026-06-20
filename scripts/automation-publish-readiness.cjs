/* eslint-disable @typescript-eslint/no-require-imports, no-console */

const { mkdirSync, writeFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");
const { getPublishReadinessState } = require("./lib/publish-readiness-state.cjs");

const args = parseArgs(process.argv.slice(2));
const emitJson = true;
const root = process.cwd();

const state = getPublishReadinessState(root);
const githubResult = run(root, "node", ["scripts/check-github-publish-readiness.mjs", "--json"]);
const githubReport = parseJson(githubResult.stdout) || {
  ok: false,
  mode: "github-readiness",
  reason: "Unable to parse github readiness output",
  fallback: {
    status: githubResult.status,
    stderr: githubResult.stderr || githubResult.stdout
  }
};

const readiness = buildReadiness(state, githubReport);

if (args.artifact) {
  const outputPath = resolve(args.artifact);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(readiness, null, 2)}\n`);
}

if (args.writeArtifact && !args.artifact) {
  const outputPath = resolve("dist/publish-readiness-report.json");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(readiness, null, 2)}\n`);
}

if (args.ci) {
  const summary = readiness.ok
    ? "publish-readiness=ok"
    : "publish-readiness=blocked";
  const blocks = (readiness.blockers || []).map((entry) => entry.area).join(",") || "none";
  const next = readiness.nextAction ? readiness.nextAction : "rerun after resolving blockers";
  console.log(`${summary}; blockers=${blocks}; next=${next}`);
} else if (args.compact || !emitJson) {
  // backward-compatible compact text output
  console.log(readiness.ok ? "Publish readiness: ok" : "Publish readiness: blocked");
  if (!readiness.ok && readiness.blockers.length > 0) {
    for (const blocker of readiness.blockers) {
      console.log(`- ${blocker.area}: ${blocker.reason}`);
      if (blocker.nextStep) {
        console.log(`  next: ${blocker.nextStep}`);
      }
    }
  }
} else {
  console.log(JSON.stringify(readiness, null, 2));
}

if (!readiness.ok) {
  process.exit(1);
}

function buildReadiness(state, githubReport) {
  const blockers = [];
  if (!state.gitInside) {
    blockers.push({
      area: "git",
      reason: state.blocker,
      nextStep: state.action
    });
  } else {
    if (!state.hasRemote) {
      blockers.push({
        area: "git",
        reason: "git remote is not configured",
        nextStep: "configure the intended origin remote"
      });
    }
    if (!state.isExpectedBranch) {
      blockers.push({
        area: "git",
        reason: `active branch is not ${state.targetBranch}`,
        nextStep: `switch to ${state.targetBranch}`
      });
    }
    if (!state.worktreeClean) {
      blockers.push({
        area: "git",
        reason: "working tree must be clean before publish",
        nextStep: "commit intended changes before push"
      });
    }
    if (!state.hasUpstream) {
      blockers.push({
        area: "git",
        reason: "branch is not tracking an upstream",
        nextStep: `set upstream to ${state.expectedUpstream}`
      });
    }
    if (!state.isExpectedUpstream) {
      blockers.push({
        area: "git",
        reason: `upstream mismatch: ${state.hasUpstream ? state.upstreamName : "missing"}`,
        nextStep: `point branch to ${state.expectedUpstream}`
      });
    }
    if (state.behindCount > 0) {
      const remoteBase = state.expectedUpstream ? state.expectedUpstream.split("/")[0] : "origin";
      blockers.push({
        area: "git",
        reason: `local branch is behind ${remoteBase}`,
        nextStep: `pull/rebase ${remoteBase}/${state.targetBranch}`
      });
    }
  }

  if (githubReport.githubAuth && !githubReport.githubAuth.ok) {
    blockers.push({
      area: "github-auth",
      reason: githubReport.githubAuth.reason || "GitHub auth is not ready",
      nextStep: githubReport.githubAuth.nextStep || "run gh auth login -h github.com"
    });
  }

  if (githubReport.quality && !githubReport.quality.ok) {
    blockers.push({
      area: "quality",
      reason: githubReport.quality.reason || "publish readiness quality checks failed",
      nextStep: githubReport.quality.nextStep || "fix failing publish readiness checks"
    });
  }

  if (!githubReport.ok && !githubReport.git && !githubReport.githubAuth && !githubReport.quality) {
    blockers.push({
      area: "publish-readiness",
      reason: githubReport.reason || "publish readiness report could not be verified",
      nextStep: githubReport.nextStep || "rerun publish readiness after resolving reporter output"
    });
  }

  return {
    ok: blockers.length === 0,
    mode: "publish-readiness",
    generatedAt: new Date().toISOString(),
    gitState: state,
    github: githubReport,
    blockers,
    nextAction: blockers.length === 0
      ? `GIT_TERMINAL_PROMPT=0 git push origin ${state.targetBranch}`
      : blockers[0].nextStep,
    safety: [
      "This report does not include private keys or OAuth tokens.",
      "Use short-run command-only checks when preparing from remote-only workspaces."
    ]
  };
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "ci" || key === "compact" || key === "write-artifact") {
      parsed[key] = true;
      continue;
    }
    if (key === "artifact") {
      const value = tokens[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
      parsed[key] = value;
      index += 1;
      continue;
    }

    if (key === "json") {
      parsed[key] = true;
      continue;
    }
  }
  return parsed;
}

function run(cwd, command, args) {
  const output = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0"
    }
  });
  return {
    status: output.status ?? 1,
    stdout: output.stdout || "",
    stderr: output.stderr || ""
  };
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
