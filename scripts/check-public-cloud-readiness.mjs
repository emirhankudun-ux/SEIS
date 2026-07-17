#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const repo = args.repo || process.env.GITHUB_REPOSITORY || gitHubRepoFromRemote();
const requireReady = Boolean(args["require-ready"]);
const requireDefaultBranchSource = Boolean(args["require-default-branch-source"]);

if (args.help) {
  printHelp();
  process.exit(0);
}

const blockers = [];
const warnings = [];
const checks = {
  gh: { available: false },
  repo: { selected: Boolean(repo), value: repo || null },
  pages: { enabled: false, checked: false },
  publicUrl: { checked: false, reachable: false, statusCode: null }
};

const ghVersion = run("gh", ["--version"]);
checks.gh = {
  available: ghVersion.status === 0,
  version: ghVersion.stdout.split("\n")[0] || null
};

if (!checks.gh.available) blockers.push("gh-missing-or-unavailable");
if (!repo) blockers.push("github-repo-not-selected");

if (checks.gh.available && repo) {
  const repoResult = run("gh", [
    "repo",
    "view",
    repo,
    "--json",
    "nameWithOwner,visibility,defaultBranchRef,url,isPrivate,homepageUrl"
  ]);
  const repoPayload = parseJson(repoResult.stdout, {});
  checks.repo = {
    checked: true,
    selected: true,
    value: repo,
    nameWithOwner: repoPayload.nameWithOwner || repo,
    visibility: repoPayload.visibility || null,
    isPrivate: Boolean(repoPayload.isPrivate),
    defaultBranch: repoPayload.defaultBranchRef?.name || null,
    url: repoPayload.url || null,
    homepageUrl: repoPayload.homepageUrl || null,
    rawStatus: repoResult.status
  };

  if (repoResult.status !== 0) blockers.push("github-repo-unavailable");
  if (checks.repo.isPrivate || checks.repo.visibility !== "PUBLIC") blockers.push("github-repo-not-public");

  const pagesResult = run("gh", ["api", `repos/${repo}/pages`]);
  const pagesPayload = parseJson(pagesResult.stdout, {});
  checks.pages = {
    checked: true,
    enabled: pagesResult.status === 0,
    public: pagesPayload.public === true,
    htmlUrl: pagesPayload.html_url || null,
    httpsEnforced: pagesPayload.https_enforced === true,
    buildType: pagesPayload.build_type || null,
    sourceBranch: pagesPayload.source?.branch || null,
    sourcePath: pagesPayload.source?.path || null,
    cname: pagesPayload.cname || null,
    rawStatus: pagesResult.status
  };

  if (!checks.pages.enabled) blockers.push("github-pages-disabled");
  if (checks.pages.enabled && !checks.pages.public) blockers.push("github-pages-not-public");
  if (checks.pages.enabled && !checks.pages.httpsEnforced) blockers.push("github-pages-https-not-enforced");
  if (checks.pages.enabled && checks.pages.buildType !== "workflow") blockers.push("github-pages-build-type-not-workflow");
  if (checks.pages.enabled && !checks.pages.htmlUrl) blockers.push("github-pages-url-missing");

  if (
    checks.pages.sourceBranch
    && checks.repo.defaultBranch
    && checks.pages.sourceBranch !== checks.repo.defaultBranch
  ) {
    const warning = `pages-source-branch-differs-from-default:${checks.pages.sourceBranch}`;
    warnings.push(warning);
    if (requireDefaultBranchSource) blockers.push("github-pages-source-not-default-branch");
  }

  if (checks.pages.htmlUrl) {
    checks.publicUrl = publicUrlReadiness(checks.pages.htmlUrl);
    if (!checks.publicUrl.reachable) blockers.push("public-url-unreachable");
  }
}

const ready = blockers.length === 0;
const output = {
  ok: ready,
  status: ready ? "ready" : "blocked",
  mode: "read-only",
  provider: "github-pages",
  publicCloud: {
    audience: "everyone",
    vpnRequired: false
  },
  teamVpnCloud: {
    audience: "workplaces-and-teams",
    vpnRequired: true
  },
  repo: repo || null,
  checks,
  blockers,
  warnings,
  nextActions: nextActions(blockers),
  safety: [
    "This command is read-only and does not change GitHub repository or Pages settings.",
    "Public cloud readiness means the repo and Pages surface are publicly reachable without VPN.",
    "If a private workplace/team surface is needed, use the team VPN cloud lane instead."
  ]
};

console.log(JSON.stringify(output, null, 2));

if (requireReady && !ready) {
  process.exit(1);
}

function publicUrlReadiness(url) {
  const result = run("curl", ["-L", "-sS", "-o", "/dev/null", "-w", "%{http_code} %{url_effective}", url]);
  const [statusCodeText, ...effectiveParts] = result.stdout.trim().split(/\s+/);
  const statusCode = Number(statusCodeText);
  return {
    checked: true,
    reachable: result.status === 0 && statusCode >= 200 && statusCode < 400,
    statusCode: Number.isFinite(statusCode) ? statusCode : null,
    effectiveUrl: effectiveParts.join(" ") || null,
    rawStatus: result.status
  };
}

function gitHubRepoFromRemote() {
  const remote = run("git", ["remote", "get-url", "origin"]);
  const value = remote.stdout.trim();
  if (!value) return "";

  const sshMatch = value.match(/^git@github\.com:([^/]+\/[^/.]+)(?:\.git)?$/);
  if (sshMatch) return sshMatch[1];

  const httpsMatch = value.match(/^https:\/\/github\.com\/([^/]+\/[^/.]+)(?:\.git)?$/);
  if (httpsMatch) return httpsMatch[1];

  return "";
}

function nextActions(items) {
  const actions = [];
  if (items.includes("gh-missing-or-unavailable")) actions.push("Install or configure GitHub CLI.");
  if (items.includes("github-repo-not-selected")) actions.push("Pass --repo OWNER/REPO or configure origin remote.");
  if (items.includes("github-repo-unavailable")) actions.push("Verify GitHub authentication and repository access.");
  if (items.includes("github-repo-not-public")) actions.push("Keep everyone-facing public cloud surfaces in a public repository or public hosting target.");
  if (items.includes("github-pages-disabled")) actions.push("Enable GitHub Pages or select another public cloud provider.");
  if (items.includes("github-pages-not-public")) actions.push("Make the Pages surface public for everyone-facing delivery.");
  if (items.includes("github-pages-https-not-enforced")) actions.push("Enable HTTPS enforcement for GitHub Pages.");
  if (items.includes("github-pages-build-type-not-workflow")) actions.push("Configure GitHub Pages to build and deploy from GitHub Actions.");
  if (items.includes("github-pages-url-missing")) actions.push("Wait for Pages provisioning or configure the public URL.");
  if (items.includes("github-pages-source-not-default-branch")) actions.push("Move GitHub Pages source to the default branch or run without --require-default-branch-source.");
  if (items.includes("public-url-unreachable")) actions.push("Check the Pages build/deploy status and public URL route.");
  return actions;
}

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    encoding: "utf8"
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : null
  };
}

function parseJson(text, fallback) {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "require-ready" || key === "require-default-branch-source") {
      parsed[key] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:public:readiness
  npm run cloud:public:readiness -- --repo OWNER/REPO
  npm run cloud:public:readiness:strict -- --repo OWNER/REPO

Options:
  --repo OWNER/REPO                 GitHub repository. Defaults to origin remote.
  --require-ready                   Exit non-zero when public cloud is not ready.
  --require-default-branch-source   Treat Pages source branch drift as a blocker.
`);
}
