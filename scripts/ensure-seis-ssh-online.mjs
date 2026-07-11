#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const host = args.host || "SEIS-SSH";
const visibleHost = host === "SEIS-SSH" ? "SEIS-SSH" : "custom-ssh-target";
const codespace = args.codespace || process.env.SEIS_CLOUD_CODESPACE || "seis-cloud-primary-q75g47p769j6hxrv";
const connectTimeout = args["connect-timeout"] || "20";
const requirePickerCompatible = Boolean(args["require-picker-compatible"]);

const result = {
  ok: false,
  mode: "ensure-online",
  host: visibleHost,
  transport: null,
  codespaceConfigured: Boolean(codespace),
  steps: [],
  blockers: [],
  warnings: [],
  nextActions: [],
  safety: [
    "This script keeps SEIS-SSH as the only visible SEIS SSH alias.",
    "It does not print SSH private keys or GitHub tokens.",
    "It does not switch transport unless direct-cloud is already configured and verified."
  ]
};

const sshConfig = run("ssh", ["-G", host]);
if (sshConfig.status !== 0) {
  result.blockers.push("ssh-config-unavailable");
  result.steps.push({
    name: "ssh-config-read",
    ok: false,
    status: sshConfig.status,
    stderr: sanitize(sshConfig.stderr)
  });
  result.nextActions.push("Run npm run cloud:ssh-config:install to recreate SEIS-SSH config.");
} else {
  const values = parseSshConfig(sshConfig.stdout);
  result.transport = detectTransport(values);
  if (!["codespace", "direct-cloud"].includes(result.transport)) {
    result.blockers.push("ssh-config-not-cloud-only");
  }
  result.steps.push({
    name: "ssh-config-read",
    ok: true,
    transport: result.transport,
    hostnameKind: classifyHostname(values.hostname, result.transport),
    userPresent: Boolean(values.user),
    proxyCommandShape: normalizeProxyCommandShape(values.proxycommand)
  });
}

if (result.blockers.length === 0 && result.transport === "codespace") {
  const list = run("gh", ["cs", "list", "--json", "name,state,repository,lastUsedAt"]);
  result.steps.push({
    name: "codespace-list",
    ok: list.status === 0,
    status: list.status,
    stderr: sanitize(list.stderr)
  });

  if (list.status === 0) {
    try {
      const rows = JSON.parse(list.stdout || "[]");
      const match = rows.find((row) => row.name === codespace);
      result.codespaceState = match?.state || "missing";
      if (!match) {
        result.blockers.push("codespace-missing");
        result.nextActions.push("Create or select the approved Codespace for the SEIS repository.");
      }
    } catch {
      result.warnings.push("codespace-list-json-parse-failed");
    }
  } else {
    result.blockers.push("codespace-list-failed");
    result.nextActions.push("Refresh GitHub CLI auth with gh auth refresh -h github.com -s codespace.");
  }
}

if (result.blockers.length === 0) {
  const remoteCmd = [
    "set -eu",
    "export PATH=\"$HOME/.local/bin:$PATH\"",
    "echo online=yes",
    "echo remote_hostname=$(hostname)",
    "echo remote_user=$(whoami)",
    "test -d /workspaces/SEIS && echo repo=yes || echo repo=no",
    "if command -v codex >/dev/null 2>&1; then echo codex=yes; echo codex_version=$(codex --version | tr ' ' '_'); else echo codex=no; fi"
  ];

  const remote = run("ssh", [
    "-o", `ConnectTimeout=${connectTimeout}`,
    "-o", "BatchMode=yes",
    host,
    remoteCmd.join("; ")
  ]);

  const parsed = remote.status === 0 ? parseKeyValue(remote.stdout) : {};

  result.steps.push({
    name: "remote-warmup",
    ok: remote.status === 0,
    status: remote.status,
    stderr: sanitize(remote.stderr)
  });

  if (remote.status === 0) {
    const remoteOnline = parsed.online === "yes";
    const repoPresent = parsed.repo === "yes";
    const codexAvailable = parsed.codex === "yes";
    result.remote = {
      online: remoteOnline,
      hostnameKind: parsed.remote_hostname ? "redacted-remote-host" : "missing",
      userPresent: Boolean(parsed.remote_user),
      repoPresent,
      codexAvailable,
      codexVersion: parsed.codex_version ? parsed.codex_version.replace(/_/g, " ") : null
    };

    if (!remoteOnline) {
      result.blockers.push("ssh-remote-offline");
    }
    if (!repoPresent) {
      result.blockers.push("seis-repo-missing");
    }
    if (!codexAvailable) {
      result.blockers.push("codex-cli-missing");
    }
  } else {
    result.blockers.push("ssh-remote-offline");
  }
}

if (result.blockers.length === 0) {
  const onlineArgs = ["run", "cloud:ssh:online:strict", "--", "--connect-timeout", connectTimeout];
  if (requirePickerCompatible) onlineArgs.push("--require-picker-compatible");
  const online = run("npm", onlineArgs);
  result.steps.push({
    name: "strict-online-check",
    ok: online.status === 0,
    status: online.status,
    stderr: sanitize(online.stderr)
  });
  if (online.status !== 0) {
    result.blockers.push("strict-online-check-failed");
    if (requirePickerCompatible && result.transport === "codespace") {
      result.nextActions.push("Switch to direct-cloud after a reachable endpoint. Use --direct-host and --apply.");
    }
  }
}

result.ok = result.blockers.length === 0;
result.status = result.ok ? "online" : "blocked";
result.nextActions = Array.from(new Set(result.nextActions));

if (result.transport === "direct-cloud") {
  result.nextActions.push("Keep the existing direct-cloud target; if transport degrades, update firewall/sshd and rerun the switch command.");
}

if (result.blockers.length > 0 && result.transport === "direct-cloud") {
  result.nextActions.push("Verify public cloud reachability and /etc/ssh/sshd_config remote settings on the target host.");
}

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "require-picker-compatible") {
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
  const output = spawnSync(command, argv, {
    encoding: "utf8",
    timeout: 30000
  });
  return {
    status: output.status ?? 1,
    stdout: output.stdout || "",
    stderr: output.stderr || ""
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

function normalizeProxyCommandShape(value) {
  const normalized = normalizeProxyCommand(value);
  if (!normalized) return null;
  if (/(?:^|\s)(?:\S+\/)?gh\s+cs\s+ssh(?:\s|$)/.test(normalized)) return "gh cs ssh <codespace-endpoint>";
  return "proxy-command-present";
}

function detectTransport(values) {
  const hostname = values.hostname || "";
  const proxyCommand = normalizeProxyCommand(values.proxycommand);
  if (hostname === "github.codespaces" && (proxyCommand || "").includes("gh cs ssh")) return "codespace";
  if (!proxyCommand && hostname && !isLocalHost(hostname)) return "direct-cloud";
  return "unknown";
}

function classifyHostname(hostname, transport) {
  if (!hostname) return "missing";
  if (transport === "codespace") return "github.codespaces";
  if (transport === "direct-cloud") return "redacted-direct-cloud-host";
  if (isLocalHost(hostname)) return "blocked-local-or-lan";
  return "redacted-unknown-host";
}

function sanitize(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  if (/permission denied|authentication/i.test(text)) return "authentication-failed";
  if (/timeout/i.test(text)) return "timeout";
  return "remote-check-failed";
}

function isLocalHost(host) {
  const value = String(host || "").toLowerCase();
  return value === "localhost"
    || value === "127.0.0.1"
    || value === "::1"
    || value.endsWith(".local");
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh:ensure-online
  npm run cloud:ssh:ensure-online -- --connect-timeout 30

Options:
  --host HOST                 SSH alias. Default: SEIS-SSH.
  --codespace NAME            Codespace name. Default: seis-cloud-primary-q75g47p769j6hxrv.
  --connect-timeout SEC       SSH connect timeout. Default: 20.
  --require-picker-compatible Request picker compatibility when running strict checks.
`);
}
