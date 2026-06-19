#!/usr/bin/env node

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import net from "node:net";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const hostAlias = args.host || "SEIS-SSH";
const requireReady = Boolean(args["require-ready"]);
const connectTimeout = Number(args["connect-timeout"] || "12");
const identityFile = expandHome(args["identity-file"] || "");

const result = {
  ok: false,
  status: "blocked",
  mode: "read-only",
  host: hostAlias,
  target: "chatgpt-mobile-24x7-ssh",
  checks: {
    sshConfig: {
      checked: false,
      transport: "unknown",
      hostname: null,
      user: null,
      port: "22",
      proxyCommand: null,
      identityFile: identityFile || null,
      pickerCompatible: false,
      mobile24x7Compatible: false
    },
    tcp: {
      checked: false,
      reachable: false,
      error: null
    },
    sshAuth: {
      checked: false,
      authenticated: false,
      error: null
    },
    remoteRuntime: {
      checked: false,
      online: false,
      sshAiInstalled: false,
      sshAiDaemonActive: false,
      sshAiBridgeActive: false,
      repoPresent: false,
      codexAvailable: false,
      error: null
    }
  },
  blockers: [],
  warnings: [],
  nextActions: [],
  safety: [
    "This check does not print SSH private keys or tokens.",
    "ChatGPT mobile 24/7 mode requires the same single visible alias: SEIS-SSH.",
    "Codespaces can be terminal-online, but it is not treated as 24/7 mobile SSH because it uses ProxyCommand and can sleep.",
    "Direct-cloud mode must prove TCP reachability, SSH key auth, and remote runtime readiness before it is called mobile-ready."
  ]
};

const config = run("ssh", ["-G", hostAlias]);
result.checks.sshConfig.checked = true;
if (config.status !== 0) {
  result.blockers.push("ssh-config-unavailable");
  result.checks.sshConfig.error = sanitize(config.stderr);
} else {
  const values = parseSshConfig(config.stdout);
  const transport = detectTransport(values);
  const configuredIdentity = normalizeIdentityFile(values.identityfile);
  result.checks.sshConfig = {
    checked: true,
    transport,
    hostname: values.hostname || null,
    user: values.user || null,
    port: values.port || "22",
    proxyCommand: normalizeProxyCommand(values.proxycommand),
    identityFile: identityFile || configuredIdentity || null,
    pickerCompatible: transport === "direct-cloud",
    mobile24x7Compatible: transport === "direct-cloud"
  };

  if (transport !== "direct-cloud") {
    result.blockers.push("mobile-24x7-requires-direct-cloud-transport");
    if (transport === "codespace") {
      result.warnings.push("codespaces-online-but-not-24x7-mobile-ssh");
    }
  }
}

const directHost = result.checks.sshConfig.hostname;
const directPort = Number(result.checks.sshConfig.port || "22");
const directUser = result.checks.sshConfig.user || "root";
const directIdentity = identityFile || result.checks.sshConfig.identityFile || "";

if (result.blockers.length === 0 && directHost) {
  const tcp = await probeTcp(directHost, directPort, connectTimeout * 1000);
  result.checks.tcp = {
    checked: true,
    reachable: tcp.reachable,
    error: tcp.error
  };
  if (!tcp.reachable) {
    result.blockers.push(`direct-cloud-endpoint-unreachable: ${tcp.error || "unknown"}`);
  }
}

if (result.blockers.length === 0) {
  if (!directIdentity || !existsSync(directIdentity)) {
    result.blockers.push(`identity-file-missing: ${directIdentity || "<not-set>"}`);
  } else {
    const auth = probeSshAuth(directHost, directPort, directUser, directIdentity, connectTimeout);
    result.checks.sshAuth = {
      checked: true,
      authenticated: auth.ok,
      error: auth.error || null
    };
    if (!auth.ok) {
      result.blockers.push(`direct-cloud-ssh-auth-unavailable: ${auth.error || "unknown"}`);
    }
  }
}

if (result.blockers.length === 0) {
  const runtime = probeRemoteRuntime(directHost, directPort, directUser, directIdentity, connectTimeout);
  result.checks.remoteRuntime = runtime;
  if (!runtime.online) result.blockers.push("remote-runtime-offline");
  if (!runtime.sshAiInstalled) result.blockers.push("ssh-ai-not-installed");
  if (!runtime.sshAiDaemonActive) result.blockers.push("ssh-ai-daemon-inactive");
  if (!runtime.repoPresent) result.warnings.push("remote-seis-repo-not-confirmed");
  if (!runtime.codexAvailable) result.warnings.push("remote-codex-cli-not-confirmed");
}

result.ok = result.blockers.length === 0;
result.status = result.ok ? "mobile-24x7-ready" : "blocked";
result.nextActions = nextActions(result);

console.log(JSON.stringify(result, null, 2));
if (requireReady && !result.ok) process.exit(1);

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "require-ready" || key === "skip-mobile-check") {
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
    timeout: 45000
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

function normalizeProxyCommand(value) {
  if (!value || value === "none") return null;
  return value;
}

function normalizeIdentityFile(value) {
  if (!value || value === "none") return null;
  return expandHome(String(value).split(/\s+/)[0]);
}

function detectTransport(values) {
  const hostname = values.hostname || "";
  const proxyCommand = normalizeProxyCommand(values.proxycommand);
  if (hostname === "github.codespaces" && (proxyCommand || "").includes("gh cs ssh")) return "codespace";
  if (!proxyCommand && hostname && !isLocalHost(hostname)) return "direct-cloud";
  return "unknown";
}

function probeTcp(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let finished = false;
    const finish = (value) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish({ reachable: true, error: null }));
    socket.once("timeout", () => finish({ reachable: false, error: "timeout" }));
    socket.once("error", (error) => finish({ reachable: false, error: error.message }));
    socket.connect(port, host);
  });
}

function probeSshAuth(host, port, user, keyFile, timeoutSeconds) {
  const output = run("ssh", [
    "-i",
    keyFile,
    "-o",
    "BatchMode=yes",
    "-o",
    `ConnectTimeout=${timeoutSeconds}`,
    "-o",
    "StrictHostKeyChecking=accept-new",
    "-p",
    String(port),
    `${user}@${host}`,
    "printf 'ssh_auth=yes\\n'"
  ]);
  return {
    ok: output.status === 0 && /ssh_auth=yes/.test(output.stdout),
    error: sanitize(output.stderr || output.stdout || "")
  };
}

function probeRemoteRuntime(host, port, user, keyFile, timeoutSeconds) {
  const remote = run("ssh", [
    "-i",
    keyFile,
    "-o",
    "BatchMode=yes",
    "-o",
    `ConnectTimeout=${timeoutSeconds}`,
    "-o",
    "StrictHostKeyChecking=accept-new",
    "-p",
    String(port),
    `${user}@${host}`,
    [
      "set -eu",
      "echo online=yes",
      "test -d /opt/ssh-ai && echo ssh_ai=yes || echo ssh_ai=no",
      "systemctl is-active --quiet ssh-ai && echo ssh_ai_daemon=yes || echo ssh_ai_daemon=no",
      "systemctl is-active --quiet ssh-ai-bridge && echo ssh_ai_bridge=yes || echo ssh_ai_bridge=no",
      "test -d /workspaces/SEIS && echo repo=yes || echo repo=no",
      "if command -v codex >/dev/null 2>&1; then echo codex=yes; else echo codex=no; fi"
    ].join("; ")
  ]);

  const values = remote.status === 0 ? parseKeyValue(remote.stdout) : {};
  return {
    checked: true,
    online: values.online === "yes",
    sshAiInstalled: values.ssh_ai === "yes",
    sshAiDaemonActive: values.ssh_ai_daemon === "yes",
    sshAiBridgeActive: values.ssh_ai_bridge === "yes",
    repoPresent: values.repo === "yes",
    codexAvailable: values.codex === "yes",
    error: remote.status === 0 ? null : sanitize(remote.stderr || remote.stdout || "")
  };
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

function nextActions(value) {
  const actions = [];
  if (value.blockers.includes("mobile-24x7-requires-direct-cloud-transport")) {
    actions.push("Keep SEIS-SSH as the only alias, but switch it to direct-cloud after root key auth works on the always-on host.");
    actions.push(`Run: npm run cloud:ssh:direct-cloud:switch -- --public-ip <PUBLIC_IP> --direct-user root --apply`);
  }
  if (value.blockers.some((item) => item.startsWith("direct-cloud-endpoint-unreachable"))) {
    actions.push(`Generate host-fix plan and rerun mobile check:\n  npm run cloud:ssh:host-fix-plan -- --public-ip ${quote(value.checks?.sshConfig?.hostname || "<direct-host>")} --user ${quote(value.checks?.sshConfig?.user || "root")} --live --json`);
  }
  if (value.blockers.some((item) => item.startsWith("direct-cloud-ssh-auth-unavailable"))) {
    actions.push("Install the local public key in root authorized_keys or provision aiuser, then rerun the mobile 24/7 check.");
  }
  if (value.blockers.includes("ssh-ai-not-installed")) {
    actions.push("Install server/cloud/ssh-ai-shell on the direct-cloud host.");
  }
  if (value.blockers.includes("ssh-ai-daemon-inactive")) {
    actions.push("Enable ssh-ai.service on the direct-cloud host.");
  }
  if (!actions.length) {
    actions.push("SEIS-SSH is mobile 24/7 ready. Keep this strict check in release and device-bootstrap handoff.");
  }
  return actions;
}

function quote(value) {
  const text = String(value || "");
  if (!text) return "''";
  return `'${text.replaceAll("'", "'\"'\"'")}'`;
}

function isLocalHost(host) {
  const value = String(host || "").toLowerCase();
  return value === "localhost"
    || value === "127.0.0.1"
    || value === "::1"
    || value.endsWith(".local");
}

function expandHome(value) {
  const text = String(value || "");
  if (text === "~") return homedir();
  if (text.startsWith("~/")) return join(homedir(), text.slice(2));
  return text;
}

function sanitize(value) {
  return String(value || "")
    .replace(/gho_[A-Za-z0-9_]+/g, "gho_************************************")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-************************************")
    .trim();
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh:mobile-24x7
  npm run cloud:ssh:mobile-24x7:strict

Options:
  --host HOST             SSH alias. Default: SEIS-SSH.
  --identity-file PATH    Override direct-cloud identity file.
  --connect-timeout SEC   SSH/TCP timeout. Default: 12.
  --require-ready         Exit non-zero unless mobile 24/7 readiness passes.
`);
}
