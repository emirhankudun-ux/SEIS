#!/usr/bin/env node

import { spawnSync } from "node:child_process";

import { isLocalOrLanHost as isLocalHost } from "./lib/seis-ssh-network.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const sshHost = args.host || "SEIS-SSH";
const repoPath = args["repo-path"] || process.env.SEIS_REMOTE_REPO_PATH || "/workspaces/SEIS";
const connectTimeout = args["connect-timeout"] || "20";
const requireReady = Boolean(args["require-ready"]);

const checks = {
  sshConfig: {
    checked: false,
    host: sshHost,
    cloudOnly: false,
    transport: null,
    user: null,
    hostname: null,
    proxyCommandPresent: false,
    identityFile: null
  },
  remote: {
    checked: false,
    online: false,
    hostname: null,
    user: null,
    repoPath,
    repoPresent: false,
    gitPresent: false,
    gitBranch: null,
    gitRemoteKind: null,
    codexAvailable: false,
    codexVersion: null,
    promptExecuted: false,
    rawStatus: null,
    stderr: ""
  }
};

const blockers = [];
const warnings = [];

const config = run("ssh", ["-G", sshHost]);
checks.sshConfig.checked = true;

if (config.status !== 0) {
  blockers.push("ssh-config-unavailable");
  checks.sshConfig.stderr = config.stderr.trim();
} else {
  const values = parseSshConfig(config.stdout);
  const proxyCommand = normalizeProxyCommand(values.proxycommand);
  checks.sshConfig.user = values.user || null;
  checks.sshConfig.hostname = values.hostname || null;
  checks.sshConfig.proxyCommandPresent = Boolean(proxyCommand);
  checks.sshConfig.identityFile = values.identityfile || null;
  checks.sshConfig.transport = detectTransport(values);
  checks.sshConfig.cloudOnly = checks.sshConfig.transport === "codespace" || checks.sshConfig.transport === "direct-cloud";

  if (!checks.sshConfig.cloudOnly) blockers.push("ssh-config-not-cloud-only");
  if (checks.sshConfig.transport === "codespace") warnings.push("codespaces-proxycommand-terminal-compatible-picker-may-warn");
}

if (!blockers.includes("ssh-config-unavailable")) {
  const remote = run("ssh", [
    "-o", `ConnectTimeout=${connectTimeout}`,
    "-o", "BatchMode=yes",
    sshHost,
    [
      "set -eu",
      "export PATH=\"$HOME/.local/bin:$PATH\"",
      "echo online=yes",
      "echo remote_hostname=$(hostname)",
      "echo remote_user=$(whoami)",
      `test -d ${shellQuote(repoPath)} && echo repo=yes || echo repo=no`,
      "if command -v git >/dev/null 2>&1; then echo git=yes; else echo git=no; fi",
      `if test -d ${shellQuote(repoPath)}; then git -C ${shellQuote(repoPath)} status --short --branch --untracked-files=no | sed -n '1p' | sed 's/^/git_branch=/'; fi`,
      `if test -d ${shellQuote(repoPath)}; then remote_url=$(git -C ${shellQuote(repoPath)} remote get-url origin 2>/dev/null || true); case "$remote_url" in git@github.com:*|https://github.com/*) echo git_remote_kind=github ;; "") echo git_remote_kind=missing ;; *) echo git_remote_kind=other ;; esac; fi`,
      "if command -v codex >/dev/null 2>&1; then echo codex=yes; echo codex_version=$(codex --version | tr ' ' '_'); else echo codex=no; fi",
      "echo prompt_executed=no"
    ].join("; ")
  ]);

  checks.remote.checked = true;
  checks.remote.rawStatus = remote.status;
  checks.remote.stderr = remote.stderr.trim();

  if (remote.status === 0) {
    const values = parseKeyValue(remote.stdout);
    checks.remote.online = values.online === "yes";
    checks.remote.hostname = values.remote_hostname || null;
    checks.remote.user = values.remote_user || null;
    checks.remote.repoPresent = values.repo === "yes";
    checks.remote.gitPresent = values.git === "yes";
    checks.remote.gitBranch = values.git_branch || null;
    checks.remote.gitRemoteKind = values.git_remote_kind || null;
    checks.remote.codexAvailable = values.codex === "yes";
    checks.remote.codexVersion = values.codex_version ? values.codex_version.replace(/_/g, " ") : null;
    checks.remote.promptExecuted = values.prompt_executed === "yes";
  }
}

if (checks.remote.checked && !checks.remote.online) blockers.push("ssh-remote-offline");
if (checks.remote.online && !checks.remote.repoPresent) blockers.push("seis-repo-missing");
if (checks.remote.online && !checks.remote.gitPresent) blockers.push("git-cli-missing");
if (checks.remote.online && checks.remote.repoPresent && checks.remote.gitRemoteKind !== "github") blockers.push("remote-origin-not-github");
if (checks.remote.online && !checks.remote.codexAvailable) blockers.push("codex-cli-missing");
if (checks.remote.promptExecuted) blockers.push("unexpected-prompt-execution");

const ok = blockers.length === 0;
const result = {
  ok,
  status: ok ? "ready" : "blocked",
  mode: "read-only-no-prompt-execution",
  host: sshHost,
  repoPath,
  claim: ok
    ? "SEIS-SSH can reach a cloud remote with the SEIS repo and Codex CLI available."
    : "SEIS remote Codex bridge is not ready.",
  checks,
  blockers,
  warnings,
  nextActions: nextActions(blockers),
  safety: [
    "This bridge check does not run Codex prompts.",
    "This bridge check does not mutate the remote repo.",
    "This bridge check does not print SSH private keys, GitHub tokens, provider keys, or .env values.",
    "SEIS-SSH remains the single visible cloud SSH alias.",
    "Live prompt execution, branch mutation, push, merge, deployment, and release actions remain approval-gated."
  ]
};

console.log(JSON.stringify(result, null, 2));

if (requireReady && !ok) process.exit(1);

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "require-ready") {
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

function run(command, argv) {
  const result = spawnSync(command, argv, {
    encoding: "utf8",
    timeout: 30000
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function parseSshConfig(output) {
  const values = {};
  for (const line of output.split(/\r?\n/)) {
    const index = line.indexOf(" ");
    if (index < 0) continue;
    const key = line.slice(0, index).toLowerCase();
    if (!Object.hasOwn(values, key)) values[key] = line.slice(index + 1).trim();
  }
  return values;
}

function parseKeyValue(output) {
  const values = {};
  for (const line of output.split(/\r?\n/)) {
    const index = line.indexOf("=");
    if (index < 0) continue;
    values[line.slice(0, index)] = line.slice(index + 1);
  }
  return values;
}

function normalizeProxyCommand(value) {
  if (!value || value === "none") return null;
  return value;
}

function detectTransport(values) {
  const hostname = values.hostname || "";
  const proxyCommand = normalizeProxyCommand(values.proxycommand);
  if (hostname === "github.codespaces" && (proxyCommand || "").includes("gh cs ssh")) return "codespace";
  if (!proxyCommand && hostname && !isLocalHost(hostname)) return "direct-cloud";
  return "unknown";
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function nextActions(items) {
  const actions = [];
  if (items.includes("ssh-config-unavailable")) actions.push("Run npm run cloud:ssh-config:install.");
  if (items.includes("ssh-config-not-cloud-only")) actions.push("Restore SEIS-SSH to a cloud-only transport before using remote Codex.");
  if (items.includes("ssh-remote-offline")) actions.push("Start the Codespace or direct-cloud endpoint, then rerun the strict bridge check.");
  if (items.includes("seis-repo-missing")) actions.push("Restore the SEIS checkout at the configured remote repo path.");
  if (items.includes("git-cli-missing")) actions.push("Install git on the remote runtime.");
  if (items.includes("remote-origin-not-github")) actions.push("Review the remote origin before using remote Codex for PR work.");
  if (items.includes("codex-cli-missing")) actions.push("Install or expose Codex CLI on the remote runtime PATH.");
  if (items.includes("unexpected-prompt-execution")) actions.push("Stop and review the bridge script; status checks must not execute prompts.");
  return actions;
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh:remote-codex:status
  npm run cloud:ssh:remote-codex:strict

Options:
  --host NAME             SSH alias. Default: SEIS-SSH.
  --repo-path PATH        Remote SEIS repo path. Default: /workspaces/SEIS.
  --connect-timeout SEC   SSH connect timeout. Default: 20.
  --require-ready         Exit non-zero when the bridge is blocked.
`);
}
