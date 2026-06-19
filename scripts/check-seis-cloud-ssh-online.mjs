#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const sshHost = args.host || "SEIS-SSH";
const requireReady = Boolean(args["require-ready"]);
const requirePickerCompatible = Boolean(args["require-picker-compatible"]);
const connectTimeout = args["connect-timeout"] || "20";
const repoPath = args["repo-path"] || process.env.SEIS_REMOTE_REPO_PATH || "/workspaces/SEIS";

const checks = {
  sshConfig: {
    checked: false,
    host: sshHost,
    cloudOnly: false,
    transport: null,
    user: null,
    hostname: null,
    proxyCommand: null,
    identityFile: null,
    pickerCompatibility: {
      checked: true,
      likelyCompatible: false,
      reason: null
    }
  },
  remote: {
    checked: false,
    online: false,
    hostname: null,
    user: null,
    repoPresent: false,
    repoPath,
    codexAvailable: false,
    codexVersion: null,
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
  checks.sshConfig.user = values.user || null;
  checks.sshConfig.hostname = values.hostname || null;
  checks.sshConfig.proxyCommand = normalizeProxyCommand(values.proxycommand);
  checks.sshConfig.identityFile = values.identityfile || null;
  const transport = detectTransport(values);
  checks.sshConfig.transport = transport;
  checks.sshConfig.cloudOnly = transport === "codespace" || transport === "direct-cloud";
  checks.sshConfig.pickerCompatibility = pickerCompatibilityFor(transport);
  if (!checks.sshConfig.cloudOnly) blockers.push("ssh-config-not-cloud-only");
  if (transport === "codespace") warnings.push("picker-may-not-support-codespaces-proxycommand");
  if (requirePickerCompatible && !checks.sshConfig.pickerCompatibility.likelyCompatible) blockers.push("ssh-picker-not-compatible");
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
      "if command -v codex >/dev/null 2>&1; then echo codex=yes; echo codex_version=$(codex --version | tr ' ' '_'); else echo codex=no; fi"
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
    checks.remote.codexAvailable = values.codex === "yes";
    checks.remote.codexVersion = values.codex_version ? values.codex_version.replace(/_/g, " ") : null;
  }
}

if (checks.remote.checked && !checks.remote.online) blockers.push("ssh-remote-offline");
if (checks.remote.online && !checks.remote.repoPresent) blockers.push("seis-repo-missing");
if (checks.remote.online && !checks.remote.codexAvailable) blockers.push("codex-cli-missing");

const ok = blockers.length === 0;
const result = {
  ok,
  status: ok ? "online" : "blocked",
  mode: "read-only",
  host: sshHost,
  provider: "github-codespaces",
  audience: "codex-cloud",
  checks,
  blockers,
  warnings,
  nextActions: nextActions(blockers, checks.sshConfig.transport, checks.sshConfig.hostname, checks.sshConfig.user),
  safety: [
    "This check does not print SSH private keys or GitHub tokens.",
    "SEIS-SSH must remain a single cloud-only alias for Codex SSH surfaces.",
    "Local Mac, LAN, VPN, and direct VPS aliases are intentionally not part of this online target."
  ]
};

if (checks.sshConfig.transport !== "codespace") {
  result.provider = providerFor(checks.sshConfig.transport);
}

console.log(JSON.stringify(result, null, 2));

if (requireReady && !ok) process.exit(1);

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "require-ready" || key === "require-picker-compatible") {
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

function pickerCompatibilityFor(transport) {
  if (transport === "direct-cloud") {
    return {
      checked: true,
      likelyCompatible: true,
      reason: "direct-cloud SSH does not require ProxyCommand and is most compatible with generic SSH pickers"
    };
  }
  if (transport === "codespace") {
    return {
      checked: true,
      likelyCompatible: false,
      reason: "GitHub Codespaces transport requires ProxyCommand; terminal SSH works, but some UI pickers may show it offline"
    };
  }
  return {
    checked: true,
    likelyCompatible: false,
    reason: "unknown or non-cloud SSH transport"
  };
}

function providerFor(transport) {
  if (transport === "codespace") return "github-codespaces";
  if (transport === "direct-cloud") return "direct-cloud-ssh";
  return "unknown";
}

function isLocalHost(host) {
  const value = String(host || "").toLowerCase();
  return value === "localhost"
    || value === "127.0.0.1"
    || value === "::1"
    || value.endsWith(".local");
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function nextActions(items, transport, directHost = null, directUser = "root") {
  const actions = [];
  if (items.includes("ssh-config-unavailable")) actions.push("Run npm run cloud:ssh-config:install from the SEIS repo.");
  if (items.includes("ssh-config-not-cloud-only")) actions.push("Reinstall the cloud-only SEIS SSH config and remove local/VPS aliases from the Codex SSH selection.");
  if (items.includes("ssh-picker-not-compatible")) actions.push("Use npm run check:seis-ssh-picker-compatibility, then switch SEIS-SSH to --transport direct-cloud only after the cloud endpoint is reachable.");
  if (items.includes("ssh-remote-offline")) {
    if (transport === "direct-cloud") {
      actions.push(`Run host remediation planner then recheck:\n  npm run cloud:ssh:host-fix-plan -- --public-ip ${shellQuote(directHost || "<direct-host>")} --user ${shellQuote(directUser || "root")} --live --json`);
    } else {
      actions.push("Start the GitHub Codespace or refresh GitHub CLI auth with gh auth refresh -h github.com -s codespace.");
    }
  }
  if (items.includes("seis-repo-missing")) {
    if (transport === "codespace") {
      actions.push("Open or rebuild the Codespace from emirhankudun-ux/SEIS.");
    } else {
      actions.push("Create/push SEIS checkout at the remote repo path and verify with --repo-path.");
    }
  }
  if (items.includes("codex-cli-missing")) {
    if (transport === "codespace") {
      actions.push("Install Codex CLI inside the Codespace with CODEX_NON_INTERACTIVE=1 curl -fsSL https://chatgpt.com/codex/install.sh | sh.");
    } else {
      actions.push("Install Codex CLI on the direct-cloud host and confirm PATH/launch permissions.");
    }
  }
  return actions;
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh:online
  npm run cloud:ssh:online:strict

Options:
  --host HOST             SSH alias. Default: SEIS-SSH.
  --connect-timeout SEC   SSH connect timeout. Default: 20.
  --repo-path PATH        Remote SEIS repo path. Default: /workspaces/SEIS.
  --require-ready         Exit non-zero unless SEIS SSH is online and Codex-ready.
  --require-picker-compatible  Also require a picker-compatible direct-cloud SSH transport.
`);
}
