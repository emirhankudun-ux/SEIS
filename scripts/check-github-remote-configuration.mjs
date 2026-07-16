import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  repositorySlugFromRemote,
  safeGitEnvironment
} from "./discover-seis-local-workspaces.mjs";

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
  return spawnSync("git", ["-c", "core.fsmonitor=false", ...args], {
    encoding: "utf8",
    env: safeGitEnvironment()
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
  ensure(record.version === 2, "remote configuration version must be 2");
  ensure(record.status === "configured-canonical-remote", "remote configuration status must be configured-canonical-remote");
  ensure(record.repository?.slug === "emirhankudun-ux/SEIS", "canonical repository slug must be emirhankudun-ux/SEIS");
  ensure(record.repository?.remoteName === "origin", "remote name must be origin");
  ensure(
    isSeisRemoteUrl(record.repository?.remoteUrl),
    "remote URL must target SEIS"
  );
  ensure(record.repository?.targetBranch === "main", "target branch must be main");
  ensure(record.localBranchMode?.strategy === "task-scoped-pr-branches", "local branch mode must use task-scoped PR branches");
  ensure(record.localBranchMode?.permanentLocalExecutionBranch === null, "remote configuration must not pin a permanent local execution branch");
  ensure(record.routingRegistry === "data/seis-local-workspace-registry.json", "remote configuration must reference the workspace registry");
  ensure(record.publishReadiness?.remoteConfigured === true, "remoteConfigured must be true");
  ensure(record.publishReadiness?.pushAllowed === false, "pushAllowed must remain false until auth, branch protection, and branch readiness are proven");
  ensure(Array.isArray(record.publishReadiness?.pushRequires) && record.publishReadiness.pushRequires.length >= 5, "publish readiness must define push requirements");
  ensure((record.qualityCommands || []).includes("npm run check:github-remote-configuration"), "quality commands must include the remote configuration check");
}

const remoteUrl = git(["config", "--local", "--no-includes", "--get", "remote.origin.url"]);
if (remoteUrl.status === 0) {
  const url = remoteUrl.stdout.trim();
  ensure(
    repositorySlugFromRemote(url) === "emirhankudun-ux/SEIS",
    "origin remote identity mismatch (value redacted)"
  );
  notes.push("origin repository identity verified: emirhankudun-ux/SEIS");
} else {
  ensure(false, "origin remote must be configured locally");
}

const currentBranch = git(["branch", "--show-current"]);
if (currentBranch.status === 0) {
  const branch = currentBranch.stdout.trim();
  notes.push(`current execution branch: ${branch || "unknown"}`);
}

for (const requiredText of [
  "GitHub Remote Configuration",
  "content/development/github-remote-configuration.json",
  record?.repository?.remoteUrl,
  "emirhankudun-ux/SEIS",
  "main",
  "task-scoped PR branch",
  "data/seis-local-workspace-registry.json",
  "npm run check:github-remote-configuration",
  "npm run check:seis-local-workspace-registry",
  "Branch protection and signature rules can still block or warn on direct pushes"
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

function isSeisRemoteUrl(value) {
  return [
    "git@github.com:emirhankudun-ux/SEIS.git",
    "https://github.com/emirhankudun-ux/SEIS.git"
  ].includes(value);
}
