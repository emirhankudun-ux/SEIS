import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const { getPublishReadinessState } = require("./lib/publish-readiness-state.cjs");

const contractPath = "content/development/publish-gate-contract.json";
const githubRemotePath = "content/development/github-remote-configuration.json";
const docsPath = "docs/deployment/publish-gate-contract.md";
const packagePath = "package.json";

const failures = [];
const notes = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function normalizeGitHubRemoteUrl(value) {
  let remote = String(value || "")
    .trim()
    .replace(/^git@github\.com:/i, "https://github.com/")
    .replace(/^ssh:\/\/[^@/]+@github\.com\//i, "https://github.com/");

  if (/^https?:\/\//i.test(remote)) {
    try {
      const url = new URL(remote);
      if (url.hostname.toLowerCase() === "github.com") {
        remote = `https://github.com${url.pathname}`;
      }
    } catch {
      // Keep the trimmed remote for the final canonicalization below.
    }
  }

  return remote
    .replace(/\.git$/i, "")
    .replace(/\/+$/g, "")
    .toLowerCase();
}

function describeRemoteForError(value) {
  return normalizeGitHubRemoteUrl(value) || "empty";
}

function remoteUrlsTargetSameRepo(actual, expected) {
  const normalizedActual = normalizeGitHubRemoteUrl(actual);
  const normalizedExpected = normalizeGitHubRemoteUrl(expected);
  return normalizedActual.length > 0 && normalizedActual === normalizedExpected;
}

function branchAllowedByContract(branchName, contract) {
  const branch = String(branchName || "").trim();
  if (branch.length === 0) return true;
  const acceptedBranches = contract?.remote?.acceptedLocalBranches || [];
  const acceptedPrefixes = contract?.remote?.acceptedLocalBranchPrefixes || [];
  return acceptedBranches.includes(branch) || acceptedPrefixes.some((prefix) => branch.startsWith(prefix));
}

function git(args) {
  return spawnSync("git", args, {
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0"
    }
  });
}

for (const path of [contractPath, docsPath, packagePath]) {
  ensure(existsSync(path), `missing ${path}`);
}

const contract = existsSync(contractPath) ? readJson(contractPath) : null;
const docs = existsSync(docsPath) ? readFileSync(docsPath, "utf8") : "";
const manifest = existsSync(packagePath) ? readJson(packagePath) : null;
const githubRemote = existsSync(githubRemotePath) ? readJson(githubRemotePath) : null;
const state = getPublishReadinessState(process.cwd());
const expectedRemoteName = githubRemote?.repository?.remoteName || contract?.remote?.name || "origin";
const expectedTargetBranch = contract?.remote?.targetBranch || githubRemote?.repository?.targetBranch || "main";
const expectedRemoteUrl = githubRemote?.repository?.remoteUrl || contract?.remote?.url || "";

if (contract) {
  ensure(contract.id === "seis-publish-gate-contract", "publish gate contract id must stay stable");
  ensure(contract.status === "active", "publish gate contract must remain active");
  ensure(contract.remote?.name === expectedRemoteName, `contract remote name must be ${expectedRemoteName}`);
  ensure(contract.remote?.url === expectedRemoteUrl, `publish gate remote URL must target ${expectedRemoteUrl || "configured remote"}`);
  ensure(contract.remote?.targetBranch === expectedTargetBranch, `publish gate target branch must be ${expectedTargetBranch}`);
  ensure(
    (contract.remote?.acceptedLocalBranches || []).includes(expectedTargetBranch),
    `publish gate contract must accept ${expectedTargetBranch} as the publishing branch`
  );
  ensure((contract.remote?.acceptedLocalBranches || []).includes("work"), "contract must document the local work execution branch");
  ensure((contract.remote?.acceptedLocalBranchPrefixes || []).includes("codex/"), "contract must document codex review branch preflight prefix");

  const levels = contract.readinessLevels || [];
  const levelIds = new Set(levels.map((level) => level.id));
  for (const requiredLevel of ["configured", "publish-preflight", "deployment-ready"]) {
    ensure(levelIds.has(requiredLevel), `contract missing readiness level: ${requiredLevel}`);
  }

  for (const level of levels) {
    ensure(level.meaning, `readiness level ${level.id || "unknown"} must define meaning`);
    ensure(Array.isArray(level.allows) && level.allows.length > 0, `readiness level ${level.id || "unknown"} must define allowed actions`);
    ensure(Array.isArray(level.blocks) && level.blocks.length > 0, `readiness level ${level.id || "unknown"} must define blocked actions`);
  }

  ensure(contract.currentEnvironmentPolicy?.expectedResult === "configured-but-not-publish-ready", "current environment policy must expect configured-but-not-publish-ready");
  ensure((contract.qualityCommands || []).includes("npm run check:publish-gate-contract"), "quality commands must include check:publish-gate-contract");
}

const origin = git(["remote", "get-url", "origin"]);
ensure(origin.status === 0, "origin remote must be configured");
ensure(
  remoteUrlsTargetSameRepo(origin.stdout.trim(), contract?.remote?.url),
  `origin remote must target contract repository, got ${describeRemoteForError(origin.stdout.trim())}`
);

if (state.gitInside) {
  ensure(state.hasRemote, "publish state must see a configured remote");
  ensure(branchAllowedByContract(state.branchName, contract), `current branch ${state.branchName || "detached"} must be documented as accepted local branch or review prefix`);

  if (state.ready) {
    ensure(state.branchName === contract?.remote?.targetBranch, `ready publish state must be on ${expectedTargetBranch}`);
    ensure(state.upstreamName === `${expectedRemoteName}/${expectedTargetBranch}`, `ready publish state must track ${expectedRemoteName}/${expectedTargetBranch}`);
    ensure(state.authReady, "ready publish state must have GitHub auth");
    notes.push("publish preflight is ready");
  } else {
    ensure(state.blocker.length > 0, "blocked publish state must explain the blocker");
    ensure(state.action.length > 0, "blocked publish state must explain the next action");
    notes.push(`publish blocked: ${state.blocker}`);
  }
} else {
  ensure(false, "publish gate contract requires a git working tree");
}

for (const requiredText of [
  "Publish Gate Contract",
  "content/development/publish-gate-contract.json",
  "configured",
  "publish-preflight",
  "deployment-ready",
  "codex/*",
  "npm run check:publish-gate-contract",
  "npm run automation:publish-readiness"
]) {
  ensure(docs.includes(requiredText), `docs missing required text: ${requiredText}`);
}

ensure(
  manifest?.scripts?.["check:publish-gate-contract"] === "node scripts/check-publish-gate-contract.mjs",
  "package.json must expose check:publish-gate-contract"
);

if (failures.length > 0) {
  console.error("SEIS publish gate contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS publish gate contract check passed.");
for (const note of notes) console.log(`- ${note}`);
