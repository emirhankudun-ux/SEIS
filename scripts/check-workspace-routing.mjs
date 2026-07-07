import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const failures = [];
const notes = [];
const githubRemotePath = "content/development/github-remote-configuration.json";
const branchPolicyPath = "docs/governance/branch-policy.md";
const branchPolicyReconciliationPath = "docs/governance/branch-policy-reconciliation.md";

function fail(message) {
  failures.push(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
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

if (!existsSync("AGENTS.md")) {
  fail("missing AGENTS.md workspace instructions");
}

if (!existsSync("content/lab/development-process.json")) {
  fail("missing content/lab/development-process.json");
}

if (!existsSync("docs/deployment/workspace-routing.md")) {
  fail("missing docs/deployment/workspace-routing.md");
}

const processConfig = existsSync("content/lab/development-process.json")
  ? readJson("content/lab/development-process.json")
  : {};
const branchPolicy = processConfig.activeBranchPolicy || {};
const githubRemoteConfig = existsSync(githubRemotePath) ? readJson(githubRemotePath) : {};
const branchPolicyText = existsSync(branchPolicyPath) ? readFileSync(branchPolicyPath, "utf8") : "";
const branchPolicyReconciliation = existsSync(branchPolicyReconciliationPath)
  ? readFileSync(branchPolicyReconciliationPath, "utf8")
  : "";
const mainCenteredPolicy =
  branchPolicyText.includes("`main` is the only permanent branch for SEIS") &&
  branchPolicyReconciliation.includes("active-main-centered-reconciled") &&
  branchPolicyReconciliation.includes("`UIXAppTTR` is not the current SEIS target branch");
const legacyExpectedBranch = branchPolicy.githubBranch || githubRemoteConfig?.repository?.targetBranch || "main";
const expectedBranch = mainCenteredPolicy ? githubRemoteConfig?.repository?.targetBranch || "main" : legacyExpectedBranch;
const expectedRemote = githubRemoteConfig?.repository?.remoteUrl;
const expectedRemotePath = typeof expectedRemote === "string"
  ? expectedRemote.replace(/^https:\/\//, "").split("/").slice(1).join("/")
  : "";
const expectedRemotePathAlt = expectedRemotePath ? expectedRemotePath.replace("/", ":") : "";

const insideWorkTree = git(["rev-parse", "--is-inside-work-tree"]);

if (insideWorkTree.status === 0 && insideWorkTree.stdout.trim() === "true") {
  const branch = git(["branch", "--show-current"]);
  const remote = git(["remote", "-v"]);
  const currentBranch = branch.stdout.trim();
  const reviewBranchPrefixes = ["feature/", "fix/", "docs/", "chore/", "experiment/", "codex/", "claude/"];
  const allowedReviewBranch = mainCenteredPolicy && reviewBranchPrefixes.some((prefix) => currentBranch.startsWith(prefix));

  if (currentBranch !== expectedBranch && !allowedReviewBranch) {
    const branchRule = mainCenteredPolicy ? `${expectedBranch} or a short-lived review branch` : expectedBranch;
    fail(`git workspace must use ${branchRule}, got ${currentBranch || "unknown"}`);
  }

  if (expectedRemote && !remote.stdout.includes(expectedRemote) && !remote.stdout.includes(expectedRemotePath) && !remote.stdout.includes(expectedRemotePathAlt)) {
    fail("git workspace must point at the SEIS GitHub remote");
  }

  notes.push(`git workspace detected on ${currentBranch || "unknown"}`);
  if (allowedReviewBranch) {
    notes.push(`main-centered review branch accepted; permanent branch remains ${expectedBranch}`);
  }
} else {
  const agents = existsSync("AGENTS.md") ? readFileSync("AGENTS.md", "utf8") : "";
  const packageJson = existsSync("package.json") ? readJson("package.json") : {};

  if (!agents.includes("high-efficiency / low-power")) {
    fail("local staging workspace must keep low-power operating instructions");
  }

  if (packageJson.name !== "seis-digital-experience-foundation") {
    fail("local staging workspace must expose the SEIS foundation package");
  }

  notes.push(`local staging workspace detected; Git branch target remains ${expectedBranch}`);
}

if (failures.length > 0) {
  console.error("SEIS workspace routing check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS workspace routing check passed.");
for (const note of notes) {
  console.log(`- ${note}`);
}
