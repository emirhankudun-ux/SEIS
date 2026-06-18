const { mkdirSync, writeFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");
const { getPublishReadinessState } = require("./lib/publish-readiness-state.cjs");

const args = parseArgs(process.argv.slice(2));
const emitJson = Boolean(args.json);
const root = process.cwd();

const state = getPublishReadinessState(root);
const githubResult = run(root, "node", ["scripts/check-github-publish-readiness.mjs", "--json"]);
const githubOutput = `${githubResult.stdout || ""}\n${githubResult.stderr || ""}`.trim();
const githubReport = parseJson(githubOutput) || buildGithubFallback(githubOutput, githubResult.status, githubResult);

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
  const summary = readiness.ok ? "publish-readiness=ok" : "publish-readiness=blocked";
  const blocks = (readiness.blockers || []).map((entry) => entry.area).join(",") || "none";
  const next = readiness.nextAction ? readiness.nextAction : "rerun after resolving blockers";
  console.log(`${summary}; blockers=${blocks}; next=${next}`);
}

if (!args.ci && (args.compact || !emitJson)) {
  const label = readiness.ok ? "Publish readiness: ready" : "Publish readiness: blocked";
  console.log(label);
  if (!readiness.ok) {
    for (const blocker of readiness.blockers) {
      console.log(`- blocker [${blocker.area}]: ${blocker.reason}`);
      if (blocker.nextStep) {
        console.log(`  next: ${blocker.nextStep}`);
      }
      if (blocker.suggestions?.length > 0) {
        console.log(`  suggestions: ${blocker.suggestions.join(", ")}`);
      }
    }
  }
}

if (emitJson) {
  console.log(JSON.stringify(readiness, null, 2));
}

if (!readiness.ok) {
  process.exit(1);
}

function buildGithubFallback(output, status, result) {
  const suggestions = parseAuthSuggestions(output);
  return {
    ok: false,
    mode: "publish-readiness-fallback",
    status,
    reason: `Unable to parse github readiness output (exit=${status || -1}).`,
    nextStep: suggestions[0] || "npm run automation:publish-readiness -- --json",
    suggestions,
    fallback: {
      stderr: result.stderr,
      stdout: result.stdout,
    },
  };
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
        nextStep: "configure the intended origin remote before publish preflight"
      });
    } else if (!state.isExpectedBranch) {
      blockers.push({
        area: "git",
        reason: `active branch is not ${state.targetBranch}`,
        nextStep: `switch to ${state.targetBranch} before publish preflight`
      });
    } else if (!state.worktreeClean) {
      blockers.push({
        area: "git",
        reason: "working tree must be clean before publish",
        nextStep: "commit intended changes before push and keep unrelated edits out of the publish path"
      });
    } else if (!state.hasUpstream) {
      blockers.push({
        area: "git",
        reason: "branch is not tracking a remote upstream",
        nextStep: `run git branch --set-upstream-to ${state.expectedUpstream} ${state.targetBranch}`
      });
    } else if (!state.isExpectedUpstream) {
      blockers.push({
        area: "git",
        reason: `upstream mismatch: ${state.upstreamName || "missing"}`,
        nextStep: `point branch to ${state.expectedUpstream} before publish preflight`
      });
    } else if (state.behindCount > 0) {
      blockers.push({
        area: "git",
        reason: `local branch is behind ${state.expectedUpstream}`,
        nextStep: `integrate ${state.expectedUpstream} into ${state.targetBranch} before pushing`
      });
    }
  }

  blockers.push(...getGithubReportBlockers(githubReport));

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
      "Use command-only checks from remote-only workspaces."
    ]
  };
}

function getGithubReportBlockers(githubReport) {
  if (!githubReport || githubReport.ok) {
    return [];
  }

  if (isAuthFailure(githubReport)) {
    return [{
      area: "github-auth",
      reason: githubReport.githubAuth?.reason || githubReport.reason,
      nextStep: githubReport.githubAuth?.nextStep || githubReport.nextStep || "gh auth login -h github.com",
      suggestions: githubReport.githubAuth?.suggestions || githubReport.suggestions || []
    }];
  }

  if (githubReport.quality && githubReport.quality.ok === false) {
    return [{
      area: "github-quality",
      reason: githubReport.quality.reason || githubReport.reason,
      nextStep: githubReport.quality.nextStep || "npm run automation:publish-readiness"
    }];
  }

  if (githubReport.mode === "publish-readiness-fallback") {
    return [{
      area: "github-check",
      reason: githubReport.reason || "Publish readiness check failed.",
      nextStep: githubReport.nextStep || "npm run automation:publish-readiness -- --json"
    }];
  }

  return [];
}

function isAuthFailure(report) {
  if (!report) return false;

  if (report.githubAuth && report.githubAuth.ok === false) return true;
  if (report.nextStep && /^gh auth /i.test(report.nextStep)) return true;
  if (Array.isArray(report.suggestions) && report.suggestions.some((entry) => String(entry).toLowerCase().includes("gh auth"))) {
    return true;
  }
  if (report.githubAuth && Array.isArray(report.githubAuth.suggestions) && report.githubAuth.suggestions.some((entry) => String(entry).toLowerCase().includes("gh auth"))) {
    return true;
  }

  const reason = String(report.reason || "").toLowerCase();
  return reason.includes("auth") && reason.includes("github");
}

function parseAuthSuggestions(output) {
  const details = String(output || "").toLowerCase();
  const suggestions = new Set();

  if (!details) {
    suggestions.add("gh auth login -h github.com");
    return Array.from(suggestions);
  }

  if (details.includes("not logged into any accounts") || details.includes("not logged in") || details.includes("no users logged into") || details.includes("not authenticated")) {
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
    suggestions.add("gh auth login -h github.com");
  }

  return Array.from(suggestions);
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);

    if (key === "help") {
      console.log(["Usage: npm run automation:publish-readiness [--json] [--ci] [--compact] [--artifact <path>] [--write-artifact]", "", "Examples:", "  npm run automation:publish-readiness -- --json", "  npm run automation:publish-readiness -- --ci", "  npm run automation:publish-readiness -- --compact", "  npm run automation:publish-readiness -- --artifact reports/publish.json"].join("\n"));
      process.exit(0);
    }

    if (key === "json" || key === "ci" || key === "compact" || key === "write-artifact") {
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
    },
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
