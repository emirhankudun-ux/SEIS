#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const requireReady = Boolean(args["require-ready"]);
const host = args.host || args.target || process.env.SEIS_SSH_VPN_HOST || "";
const user = args.user || args["ssh-user"] || process.env.SEIS_SSH_VPN_USER || "";
const target = args["ssh-target"] || (host && user ? `${user}@${host}` : host);
const vpnHost = args["vpn-host"] || process.env.SEIS_SSH_VPN_ADDRESS || "10.44.0.1";
const connectTimeout = args["connect-timeout"] || "8";

if (args.help) {
  printHelp();
  process.exit(0);
}

const blockers = [];
const warnings = [];
const checks = {
  ssh: {
    available: commandAvailable("ssh")
  },
  target: {
    configured: Boolean(target),
    value: target || null,
    vpnHost
  },
  remote: {
    checked: false,
    reachable: false,
    codexAvailable: false,
    gitAvailable: false,
    curlAvailable: false,
    rsyncAvailable: false,
    sudoAvailable: false,
    unzipAvailable: false,
    wireguardAvailable: false,
    wg0Active: false,
    serverPublicKeyPresent: false,
    seisRootPresent: false,
    releasesDirPresent: false,
    currentDirPresent: false,
    rawStatus: null
  }
};

if (!checks.ssh.available) blockers.push("ssh-unavailable");
if (!target) blockers.push("ssh-target-missing");

if (checks.ssh.available && target) {
  const probe = runSsh(target, connectTimeout, [
    "set -eu",
    "command -v codex >/dev/null 2>&1 && echo codex=yes || echo codex=no",
    "command -v git >/dev/null 2>&1 && echo git=yes || echo git=no",
    "command -v curl >/dev/null 2>&1 && echo curl=yes || echo curl=no",
    "command -v rsync >/dev/null 2>&1 && echo rsync=yes || echo rsync=no",
    "command -v sudo >/dev/null 2>&1 && echo sudo=yes || echo sudo=no",
    "command -v unzip >/dev/null 2>&1 && echo unzip=yes || echo unzip=no",
    "command -v wg >/dev/null 2>&1 && echo wireguard=yes || echo wireguard=no",
    "systemctl is-active --quiet wg-quick@wg0 >/dev/null 2>&1 && echo wg0=active || echo wg0=inactive",
    "test -f /opt/seis/vpn/wireguard-server-public.key && echo server_public_key=yes || echo server_public_key=no",
    "test -d /opt/seis && echo seis_root=yes || echo seis_root=no",
    "test -d /opt/seis/releases && echo releases_dir=yes || echo releases_dir=no",
    "test -d /opt/seis/current && echo current_dir=yes || echo current_dir=no"
  ].join("; "));

  checks.remote.checked = true;
  checks.remote.rawStatus = probe.status;
  checks.remote.reachable = probe.status === 0;

  if (probe.status === 0) {
    const values = parseKeyValueLines(probe.stdout);
    checks.remote.codexAvailable = values.codex === "yes";
    checks.remote.gitAvailable = values.git === "yes";
    checks.remote.curlAvailable = values.curl === "yes";
    checks.remote.rsyncAvailable = values.rsync === "yes";
    checks.remote.sudoAvailable = values.sudo === "yes";
    checks.remote.unzipAvailable = values.unzip === "yes";
    checks.remote.wireguardAvailable = values.wireguard === "yes";
    checks.remote.wg0Active = values.wg0 === "active";
    checks.remote.serverPublicKeyPresent = values.server_public_key === "yes";
    checks.remote.seisRootPresent = values.seis_root === "yes";
    checks.remote.releasesDirPresent = values.releases_dir === "yes";
    checks.remote.currentDirPresent = values.current_dir === "yes";
  } else {
    checks.remote.stderr = probe.stderr.trim();
  }
}

if (checks.remote.checked && !checks.remote.reachable) blockers.push("ssh-unreachable");
if (checks.remote.reachable && !checks.remote.codexAvailable) blockers.push("codex-missing");
if (checks.remote.reachable && !checks.remote.gitAvailable) blockers.push("git-missing");
if (checks.remote.reachable && !checks.remote.curlAvailable) blockers.push("curl-missing");
if (checks.remote.reachable && !checks.remote.rsyncAvailable) blockers.push("rsync-missing");
if (checks.remote.reachable && !checks.remote.sudoAvailable) blockers.push("sudo-missing");
if (checks.remote.reachable && !checks.remote.unzipAvailable) blockers.push("unzip-missing");
if (checks.remote.reachable && !checks.remote.wireguardAvailable) blockers.push("wireguard-missing");
if (checks.remote.reachable && !checks.remote.wg0Active) blockers.push("wireguard-interface-inactive");
if (checks.remote.reachable && !checks.remote.serverPublicKeyPresent) blockers.push("wireguard-server-public-key-missing");
if (checks.remote.reachable && !checks.remote.seisRootPresent) blockers.push("seis-root-missing");
if (checks.remote.reachable && !checks.remote.releasesDirPresent) blockers.push("release-root-missing");
if (checks.remote.reachable && !checks.remote.currentDirPresent) blockers.push("current-release-root-missing");

if (!target) {
  warnings.push("Set --ssh-target, --host, or SEIS_SSH_VPN_HOST to check a real cloud SSH host.");
}

const ok = blockers.length === 0;
const result = {
  ok,
  status: ok ? "ready" : "blocked",
  mode: "read-only",
  provider: "ssh-wireguard-vps",
  audience: "workplaces-and-teams",
  publicCloud: {
    audience: "everyone",
    vpnRequired: false
  },
  teamVpnCloud: {
    audience: "workplaces-and-teams",
    vpnRequired: true,
    vpn: "wireguard"
  },
  checks,
  blockers,
  warnings,
  nextActions: nextActions(blockers),
  safety: [
    "This command is read-only and does not mutate the SSH host.",
    "Use this lane only for existing workplace/team cloud hosts with approved WireGuard peers.",
    "Do not treat SSH reachability alone as VPN cloud readiness."
  ]
};

console.log(JSON.stringify(result, null, 2));

if (requireReady && !ok) {
  process.exit(1);
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "require-ready") {
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

function commandAvailable(command) {
  const result = spawnSync(command, ["-V"], {
    encoding: "utf8"
  });
  return result.status === 0 || result.status === 255;
}

function runSsh(sshTarget, timeout, command) {
  const result = spawnSync("ssh", [
    "-o", "BatchMode=yes",
    "-o", `ConnectTimeout=${timeout}`,
    sshTarget,
    command
  ], {
    encoding: "utf8"
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function parseKeyValueLines(output) {
  const values = {};
  for (const line of output.split(/\r?\n/)) {
    const index = line.indexOf("=");
    if (index === -1) continue;
    values[line.slice(0, index)] = line.slice(index + 1);
  }
  return values;
}

function nextActions(items) {
  const actions = [];
  if (items.includes("ssh-target-missing")) actions.push("Provide --ssh-target user@host or --host plus --ssh-user for an existing cloud/VPS SSH host.");
  if (items.includes("ssh-unreachable")) actions.push("Confirm SSH key auth, host reachability, and firewall rules for the selected cloud host.");
  if (items.includes("codex-missing")) actions.push("Install Codex on the host before using it as a Codex remote workspace.");
  if (items.includes("git-missing")) actions.push("Install git for source checkout and release handoff workflows.");
  if (items.includes("curl-missing")) actions.push("Install curl for Codex/bootstrap downloads and health probes.");
  if (items.includes("rsync-missing")) actions.push("Install rsync for release upload and rollback handoff.");
  if (items.includes("sudo-missing")) actions.push("Install sudo and grant the SEIS operator controlled administration rights.");
  if (items.includes("unzip-missing")) actions.push("Install unzip for release package extraction.");
  if (items.includes("wireguard-missing")) actions.push("Install WireGuard on the host.");
  if (items.includes("wireguard-interface-inactive")) actions.push("Configure and start wg-quick@wg0 with approved workplace/team peers.");
  if (items.includes("wireguard-server-public-key-missing")) actions.push("Expose /opt/seis/vpn/wireguard-server-public.key for peer configuration handoff.");
  if (items.includes("seis-root-missing")) actions.push("Create /opt/seis as the managed SEIS cloud root.");
  if (items.includes("release-root-missing")) actions.push("Create /opt/seis/releases for reversible release uploads.");
  if (items.includes("current-release-root-missing")) actions.push("Create /opt/seis/current for the active release pointer or deployment directory.");
  return actions;
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh-vpn:readiness -- --ssh-target user@example.com
  npm run cloud:ssh-vpn:readiness:strict -- --host example.com --ssh-user seis

Options:
  --ssh-target TARGET       SSH target alias or user@host.
  --host HOST               SSH host when not using --ssh-target.
  --ssh-user USER           SSH user when not using --ssh-target.
  --vpn-host ADDRESS        VPN host address. Default: 10.44.0.1.
  --connect-timeout SEC     SSH connect timeout. Default: 8.
  --require-ready           Exit non-zero unless the host is ready.
`);
}
