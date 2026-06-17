import { execFileSync } from "node:child_process";

const defaultBranch = "codex/seis-ux-cinematic-premium-foundation";
const repoSlug = "emirhankudun-ux/emirhan-kudun-portfolio";
const sshRemote = `git@github.com:${repoSlug}.git`;
const args = process.argv.slice(2);
const allowMissingGhAuth = args.includes("--allow-missing-gh-auth");
const allowDirty = args.includes("--allow-dirty");
const requestedBranch = args.find((arg) => !arg.startsWith("--")) || defaultBranch;
const errors = [];

function run(command, commandArgs, options = {}) {
  try {
    return {
      ok: true,
      stdout: execFileSync(command, commandArgs, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      }).trim()
    };
  } catch (error) {
    if (!options.allowFailure) throw error;
    return {
      ok: false,
      stdout: error.stdout?.toString().trim() || "",
      stderr: error.stderr?.toString().trim() || "",
      status: error.status
    };
  }
}

function remoteMatches(url) {
  return url === sshRemote
    || url === `https://github.com/${repoSlug}.git`
    || url === `https://github.com/${repoSlug}`;
}

const branch = run("git", ["branch", "--show-current"]).stdout;
const status = run("git", ["status", "--porcelain"]).stdout;
const remote = run("git", ["remote", "get-url", "origin"], { allowFailure: true });
const gh = run("gh", ["auth", "status", "-h", "github.com"], { allowFailure: true });

if (branch !== requestedBranch) {
  errors.push(`Expected branch ${requestedBranch}, found ${branch || "unknown"}.`);
}

if (status && !allowDirty) {
  errors.push("Working tree is not clean. Commit or stash changes before push.");
}

if (!remote.ok) {
  errors.push(`Missing origin remote. Run: git remote add origin ${sshRemote}`);
} else if (!remoteMatches(remote.stdout)) {
  errors.push(`Origin remote does not match ${repoSlug}: ${remote.stdout}`);
}

if (!gh.ok && !allowMissingGhAuth) {
  errors.push("GitHub CLI is not authenticated. Run: gh auth login -h github.com");
}

const result = {
  branch,
  requestedBranch,
  clean: !status,
  origin: remote.ok ? remote.stdout : null,
  githubAuth: gh.ok ? "configured" : "missing",
  targetRemote: sshRemote,
  ready: errors.length === 0,
  errors
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
