#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import net from "node:net";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const managedAliases = new Set([
  "SEIS-SSH",
  "SEIS-CLOUD",
  "seis-cloud",
  "seis-cloud-codespace",
  "seis-cloud-vps",
  "seis-cloud-root",
  "seis-cloud-vpn",
  "seis-local-mac",
  "seis-lan-mac",
]);

const sshHost = args.host || "SEIS-SSH";
const requirePickerCompatible = Boolean(args["require-picker-compatible"]);
const directHost = args["probe-direct-host"] || process.env.SEIS_CLOUD_DIRECT_HOST || "";
const directPort = Number(args["probe-direct-port"] || process.env.SEIS_CLOUD_DIRECT_PORT || "22");
const timeoutMs = Number(args["timeout-ms"] || "8000");

const blockers = [];
const warnings = [];
const checks = {
  sshConfig: {
    checked: false,
    host: sshHost,
    hostAliases: [],
    duplicateSeisAliases: [],
    hostname: null,
    user: null,
    proxyCommand: null,
    identityFile: null,
    transport: "unknown",
    terminalCompatible: false,
    pickerCompatible: false,
    compatibilityReason: null
  },
  directEndpointProbe: {
    checked: false,
    host: directHost || null,
    port: directPort,
    reachable: false,
    error: null
  }
};

const sshConfigText = safeRead(join(homedir(), ".ssh", "config"));
const managedHostEntries = extractManagedHostEntries(sshConfigText);
checks.sshConfig.hostAliases = managedHostEntries.map((entry) => entry.host);
checks.sshConfig.duplicateSeisAliases = managedHostEntries
  .filter((entry) => entry.host !== "SEIS-SSH")
  .map((entry) => entry.host);
if (checks.sshConfig.duplicateSeisAliases.length > 0) blockers.push("duplicate-seis-ssh-aliases");

const config = run("ssh", ["-G", sshHost]);
checks.sshConfig.checked = true;
if (config.status !== 0) {
  blockers.push("ssh-config-unavailable");
  checks.sshConfig.error = config.stderr.trim();
} else {
  const values = parseSshConfig(config.stdout);
  checks.sshConfig.hostname = values.hostname || null;
  checks.sshConfig.user = values.user || null;
  checks.sshConfig.proxyCommand = normalizeProxyCommand(values.proxycommand);
  checks.sshConfig.identityFile = values.identityfile || null;
  checks.sshConfig.transport = detectTransport(values);
  checks.sshConfig.terminalCompatible = checks.sshConfig.transport === "codespace"
    || checks.sshConfig.transport === "direct-cloud";
  checks.sshConfig.pickerCompatible = checks.sshConfig.transport === "direct-cloud";
  checks.sshConfig.compatibilityReason = compatibilityReason(checks.sshConfig.transport);
  if (!checks.sshConfig.terminalCompatible) blockers.push("ssh-config-not-cloud-only");
  if (checks.sshConfig.transport === "codespace") warnings.push("codespaces-proxycommand-may-render-offline-in-some-pickers");
  if (requirePickerCompatible && !checks.sshConfig.pickerCompatible) blockers.push("ssh-picker-not-compatible");
}

if (directHost) {
  checks.directEndpointProbe.checked = true;
  const probe = await probeTcp(directHost, directPort, timeoutMs);
  checks.directEndpointProbe.reachable = probe.reachable;
  checks.directEndpointProbe.error = probe.error;
  if (!probe.reachable) warnings.push("direct-cloud-endpoint-not-reachable");
}

const ok = blockers.length === 0;
const result = {
  ok,
  status: ok ? "ready" : "blocked",
  mode: "read-only",
  host: sshHost,
  checks,
  blockers,
  warnings,
  nextActions: nextActions(blockers, warnings, directHost),
  safety: [
    "This check does not print SSH private keys or GitHub tokens.",
    "SEIS-SSH remains the only visible SEIS SSH alias.",
    "Use direct-cloud transport only for a reachable cloud endpoint; do not add local Mac, LAN, or direct VPS picker aliases."
  ]
};

console.log(JSON.stringify(result, null, 2));
if (!ok) process.exit(1);

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

function extractManagedHostEntries(configText) {
  const entries = [];
  const lines = configText.split(/\r?\n/);

  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    const hostMatch = /^\s*Host\s+(.+)$/.exec(line);
    if (!hostMatch) continue;

    const aliases = hostMatch[1]
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    for (const alias of aliases) {
      if (managedAliases.has(alias)) {
        entries.push({ host: alias, line: idx + 1 });
      }
    }
  }

  return entries;
}

function safeRead(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
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

function compatibilityReason(transport) {
  if (transport === "direct-cloud") return "direct-cloud SSH avoids ProxyCommand and is the most picker-compatible mode";
  if (transport === "codespace") return "Codespaces SSH is terminal-compatible, but some pickers may show ProxyCommand targets as offline";
  return "unknown or local SSH transport";
}

function isLocalHost(host) {
  const value = String(host || "").toLowerCase();
  return value === "localhost"
    || value === "127.0.0.1"
    || value === "::1"
    || value.endsWith(".local");
}

function probeTcp(host, port, timeout) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let finished = false;
    const finish = (result) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeout);
    socket.once("connect", () => finish({ reachable: true, error: null }));
    socket.once("timeout", () => finish({ reachable: false, error: "timeout" }));
    socket.once("error", (error) => finish({ reachable: false, error: error.message }));
    socket.connect(port, host);
  });
}

function nextActions(blockerItems, warningItems, host) {
  const actions = [];
  if (blockerItems.includes("duplicate-seis-ssh-aliases")) actions.push("Run npm run cloud:ssh-config:install to remove stale SEIS aliases.");
  if (blockerItems.includes("ssh-config-unavailable")) actions.push("Run npm run cloud:ssh-config:install to recreate SEIS-SSH.");
  if (blockerItems.includes("ssh-config-not-cloud-only")) actions.push("Reinstall SEIS-SSH with codespace or direct-cloud transport.");
  if (blockerItems.includes("ssh-picker-not-compatible")) actions.push("Switch SEIS-SSH to --transport direct-cloud after the cloud endpoint is reachable.");
  if (warningItems.includes("codespaces-proxycommand-may-render-offline-in-some-pickers")) actions.push("If the UI picker shows offline while terminal SSH works, use a reachable direct-cloud endpoint for SEIS-SSH.");
  if (warningItems.includes("direct-cloud-endpoint-not-reachable") && host) actions.push(`Fix cloud firewall/sshd for ${host}:22 before installing direct-cloud mode.`);
  if (warningItems.includes("direct-cloud-endpoint-not-reachable") && host) {
    actions.push(`Run host remediation plan now:\n  npm run cloud:ssh:host-fix-plan -- --public-ip ${shellQuote(host)} --user root --live --json`);
  }
  return actions;
}

function shellQuote(value) {
  const text = String(value || "");
  if (!text) return "''";
  return `'${text.replaceAll("'", "'\\''")}'`;
}

function printHelp() {
  console.log(`Usage:
  npm run check:seis-ssh-picker-compatibility
  npm run check:seis-ssh-picker-compatibility -- --probe-direct-host 21.0.3.171
  npm run check:seis-ssh-picker-compatibility -- --require-picker-compatible

Options:
  --host HOST                    SSH alias. Default: SEIS-SSH.
  --probe-direct-host HOST       Probe direct cloud SSH endpoint reachability.
  --probe-direct-port PORT       Probe port. Default: 22.
  --timeout-ms MS                TCP probe timeout. Default: 8000.
  --require-picker-compatible    Exit non-zero unless SEIS-SSH is direct-cloud picker compatible.
`);
}
