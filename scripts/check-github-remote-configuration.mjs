import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const recordPath = "content/development/github-remote-configuration.json";
const docsPath = "docs/deployment/github-remote-configuration.md";
const packagePath = "package.json";

const failures = [];
const notes = [];

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
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

for (const path of [recordPath, docsPath, packagePath]) {
  ensure(existsSync(path), `missing ${path}`);
}

const record = existsSync(recordPath) ? readJson(recordPath) : null;
const docs = existsSync(docsPath) ? readFileSync(docsPath, "utf8") : "";
const manifest = existsSync(packagePath) ? readJson(packagePath) : null;

if (record) {
  ensure(record.id === "github-remote-configuration", "remote configuration id must stay stable");
  ensure(record.status === "configured-local-remote", "remote configuration status must be configured-local-remote");
  ensure(record.repository?.remoteName === "origin", "remote name must be origin");
  ensure(typeof record.repository?.remoteUrl === "string" && record.repository.remoteUrl.length > 0, "remote URL must be defined");
  ensure(typeof record.repository?.targetBranch === "string" && record.repository.targetBranch.length > 0, "target branch must be defined");
  ensure(record.publishReadiness?.remoteConfigured === true, "remoteConfigured must be true");
  ensure(record.publishReadiness?.pushAllowed === false, "pushAllowed must remain false until auth and branch readiness are proven");
  ensure(Array.isArray(record.publishReadiness?.pushRequires) && record.publishReadiness.pushRequires.length >= 5, "publish readiness must define push requirements");
  ensure((record.qualityCommands || []).includes("npm run check:github-remote-configuration"), "quality commands must include the remote configuration check");
}

const remoteUrl = git(["remote", "get-url", "origin"]);
if (remoteUrl.status === 0) {
  const url = remoteUrl.stdout.trim();
  ensure(url === record?.repository?.remoteUrl, `origin remote URL mismatch: ${url || "empty"}`);
  notes.push(`origin remote configured: ${url}`);
} else {
  ensure(false, "origin remote must be configured locally");
}

const currentBranch = git(["branch", "--show-current"]);
if (currentBranch.status === 0) {
  const branch = currentBranch.stdout.trim();
  ensure(branch === record?.localBranchMode?.currentWorkingBranch, `current branch record mismatch: ${branch || "unknown"}`);
  notes.push(`current execution branch: ${branch || "unknown"}`);
}

const branchRemote = git(["config", "--get", `branch.${record?.localBranchMode?.currentWorkingBranch}.remote`]);
const branchMerge = git(["config", "--get", `branch.${record?.localBranchMode?.currentWorkingBranch}.merge`]);
ensure(branchRemote.stdout.trim() === record?.repository?.remoteName, "current branch remote tracking must point to origin");
ensure(branchMerge.stdout.trim() === `refs/heads/${record?.repository?.targetBranch}`, "current branch merge target must point to UIXAppTTR");

for (const requiredText of [
  "GitHub Remote Configuration",
  "content/development/github-remote-configuration.json",
  record?.repository?.remoteUrl,
  record?.repository?.targetBranch,
  "npm run check:github-remote-configuration",
  "CONNECT tunnel failed, response 403"
]) {
  ensure(docs.includes(requiredText), `docs missing required text: ${requiredText}`);
}

ensure(
  manifest?.scripts?.["check:github-remote-configuration"] === "node scripts/check-github-remote-configuration.mjs",
  "package.json must expose check:github-remote-configuration"
);

if (failures.length > 0) {
  console.error("SEIS GitHub remote configuration check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS GitHub remote configuration check passed.");
for (const note of notes) {
  console.log(`- ${note}`);
}
