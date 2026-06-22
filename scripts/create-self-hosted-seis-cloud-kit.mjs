#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const sshTarget = args["ssh-target"] || targetFromParts(args);
const operatorUser = args["operator-user"] || args.user || "seis";
const remoteRoot = args.path || "/opt/seis";
const vpnPort = args["vpn-port"] || "51820";
const vpnServerAddress = args["vpn-server-address"] || "10.44.0.1/24";
const vpnHost = args["vpn-host"] || "10.44.0.1";
const vpnSubnet = args["vpn-subnet"] || "10.44.0.0/24";
const sshAlias = args.alias || "seis-cloud-vps";
const vpnAlias = args["vpn-alias"] || "seis-cloud-vpn";
const identityFile = args["identity-file"] || "~/.ssh/id_ed25519_seis_codex";
const outputDir = resolve(ROOT, args.output || "dist/seis-cloud-self-hosted-kit");
const installerPath = resolve(ROOT, "server/cloud/ssh-wireguard/install-seis-cloud-host.sh");
const peers = listArg(args["vpn-peer"] || peerFromParts(args));

const failures = [];
if (!sshTarget) failures.push("Missing --ssh-target or --host plus --ssh-user.");
if (!isValidLinuxUser(operatorUser)) failures.push("Invalid --operator-user. Use a non-root Linux username such as 'seis'.");
if (!existsSync(installerPath)) failures.push("Missing server/cloud/ssh-wireguard/install-seis-cloud-host.sh.");
if (peers.length === 0) failures.push("Missing --vpn-peer or --peer-public-key.");
for (const peer of peers) {
  if (!isValidPeer(peer)) failures.push(`Invalid WireGuard peer: ${peer}`);
}
if (sshTarget && hasBroadHost(sshTarget)) failures.push("Refusing wildcard or broad SSH host.");

if (failures.length > 0) {
  console.error("SEIS self-hosted cloud kit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

const installerOutput = join(outputDir, "install-seis-cloud-host.sh");
const applyScript = join(outputDir, "apply-seis-cloud.sh");
const readinessScript = join(outputDir, "readiness.sh");
const sshConfigPath = join(outputDir, "ssh-config.seis-cloud");
const handoffPath = join(outputDir, "SEIS-CLOUD-HANDOFF.md");

copyFileSync(installerPath, installerOutput);
chmodSync(installerOutput, 0o755);

const peerEnv = peers.join(";");
const envPrefix = [
  `SEIS_USER=${shellValue(operatorUser)}`,
  `SEIS_ROOT=${shellValue(remoteRoot)}`,
  `SEIS_WG_PORT=${shellValue(vpnPort)}`,
  `SEIS_WG_SERVER_ADDRESS=${shellValue(vpnServerAddress)}`,
  `SEIS_WG_SUBNET=${shellValue(vpnSubnet)}`,
  `SEIS_WG_PEERS=${shellValue(peerEnv)}`
].join(" ");

const copyInstallerCommand = shellQuote(["scp", installerOutput, `${sshTarget}:/tmp/install-seis-cloud-host.sh`]);
const runInstallerCommand = shellQuote([
  "ssh",
  sshTarget,
  `sudo ${envPrefix} bash /tmp/install-seis-cloud-host.sh`
]);
const readinessCommand = shellQuote([
  "npm",
  "run",
  "cloud:ssh-vpn:readiness:strict",
  "--",
  "--ssh-target",
  sshAlias
]);
const configureTargetCommand = shellQuote([
  "node",
  "scripts/configure-server-target.mjs",
  "ssh-wireguard-vps",
  "--ssh_target",
  sshAlias,
  "--ssh_user",
  operatorUser,
  "--vpn",
  "wireguard",
  "--vpn_admin_peer",
  peers[0],
  "--origin",
  `ssh://${vpnAlias}`,
  "--path",
  remoteRoot,
  "--rollback_contact",
  "repository-maintainer"
]);

const sshConfig = [
  `Host ${sshAlias}`,
  `  HostName ${hostFromTarget(sshTarget)}`,
  `  User ${operatorUser}`,
  `  IdentityFile ${identityFile}`,
  "  IdentitiesOnly yes",
  "  ServerAliveInterval 30",
  "  ServerAliveCountMax 3",
  "",
  `Host ${vpnAlias}`,
  `  HostName ${vpnHost}`,
  `  User ${operatorUser}`,
  `  IdentityFile ${identityFile}`,
  "  IdentitiesOnly yes",
  "  ServerAliveInterval 30",
  "  ServerAliveCountMax 3",
  ""
].join("\n");

writeFileSync(sshConfigPath, sshConfig);

writeExecutable(applyScript, [
  "#!/usr/bin/env bash",
  "set -euo pipefail",
  "",
  copyInstallerCommand,
  runInstallerCommand,
  ""
].join("\n"));

writeExecutable(readinessScript, [
  "#!/usr/bin/env bash",
  "set -euo pipefail",
  "",
  "cd \"$(dirname \"$0\")/../..\"",
  readinessCommand,
  ""
].join("\n"));

writeFileSync(handoffPath, [
  "# SEIS Self-Hosted Cloud Handoff",
  "",
  "This kit prepares a private SEIS Cloud host through SSH, WireGuard, Codex remote host tooling, and release handoff roots.",
  "",
  "## Target",
  "",
  `- SSH target: \`${sshTarget}\``,
  `- Operator user: \`${operatorUser}\``,
  `- Remote root: \`${remoteRoot}\``,
  `- VPN host: \`${vpnHost}\``,
  `- VPN port: \`${vpnPort}/udp\``,
  "",
  "## Files",
  "",
  `- \`${relative(ROOT, installerOutput)}\``,
  `- \`${relative(ROOT, applyScript)}\``,
  `- \`${relative(ROOT, readinessScript)}\``,
  `- \`${relative(ROOT, sshConfigPath)}\``,
  "",
  "## Apply",
  "",
  "```bash",
  copyInstallerCommand,
  runInstallerCommand,
  "```",
  "",
  "## SSH Config",
  "",
  "Append the snippet in `ssh-config.seis-cloud` to `~/.ssh/config` after confirming the host and key.",
  "",
  "## Validate",
  "",
  "```bash",
  readinessCommand,
  configureTargetCommand,
  "npm run check:deploy-readiness",
  "```",
  "",
  "## Safety",
  "",
  "- This kit contains public peer metadata only.",
  "- Do not put SSH private keys, WireGuard private keys, tokens, or certificates in this directory.",
  "- Keep the team VPN cloud separate from everyone-facing public cloud surfaces.",
  ""
].join("\n"));

const result = {
  ok: true,
  mode: "self-hosted-kit",
  provider: "ssh-wireguard-vps",
  audience: "workplaces-and-teams",
  status: "ready-to-apply-after-host-is-reachable",
  kit: {
    outputDir: relative(ROOT, outputDir),
    files: [
      relative(ROOT, installerOutput),
      relative(ROOT, applyScript),
      relative(ROOT, readinessScript),
      relative(ROOT, sshConfigPath),
      relative(ROOT, handoffPath)
    ]
  },
  target: {
    sshTarget,
    operatorUser,
    remoteRoot,
    sshAlias,
    vpnAlias,
    vpnHost,
    vpnPort: Number(vpnPort),
    vpnSubnet
  },
  commands: {
    copyInstaller: copyInstallerCommand,
    runInstaller: runInstallerCommand,
    readiness: readinessCommand,
    configureTarget: configureTargetCommand
  },
  nextActions: [
    "Open TCP/22 from the operator IP to the selected host before applying.",
    "Open UDP/51820 only for approved workplace/team VPN peers.",
    "Append ssh-config.seis-cloud to ~/.ssh/config after confirming HostName and IdentityFile.",
    "Run apply-seis-cloud.sh only when the SSH host is reachable.",
    "Run readiness.sh after the installer returns SEIS_REMOTE_HOST_READY=1."
  ],
  safety: [
    "No private SSH or WireGuard keys were generated or written.",
    "The kit is generated under dist/ so real host handoff artifacts stay out of source control.",
    "The installer creates a non-root operator user and disables password SSH."
  ]
};

console.log(JSON.stringify(result, null, 2));

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help") {
      parsed[key] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    if (parsed[key]) {
      parsed[key] = Array.isArray(parsed[key]) ? [...parsed[key], value] : [parsed[key], value];
    } else {
      parsed[key] = value;
    }
    index += 1;
  }
  return parsed;
}

function targetFromParts(values) {
  if (!values.host) return "";
  return `${values["ssh-user"] || values.user || "root"}@${values.host}`;
}

function peerFromParts(values) {
  if (!values["peer-public-key"]) return "";
  return `${values["peer-name"] || "admin"}|${values["peer-public-key"]}|${values["peer-address"] || "10.44.0.2/32"}`;
}

function listArg(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== "string" || value.length === 0) return [];
  return value.split(";").map((item) => item.trim()).filter(Boolean);
}

function isValidPeer(peer) {
  const [name, key, address, extra] = peer.split("|");
  return !extra
    && /^[A-Za-z0-9_.-]+$/.test(name || "")
    && /^[A-Za-z0-9+/=]{40,60}$/.test(key || "")
    && isValidWireGuardPeerAddress(address);
}

function isValidWireGuardPeerAddress(value) {
  const match = /^10\.44\.0\.([0-9]{1,3})\/32$/.exec(value || "");
  if (!match) return false;
  const octet = Number(match[1]);
  return Number.isInteger(octet) && octet >= 2 && octet <= 254;
}

function isValidLinuxUser(value) {
  return /^[a-z_][a-z0-9_-]{0,31}$/.test(value || "")
    && !["root", "daemon", "bin", "sys", "sync", "games", "man", "lp", "mail", "news", "uucp", "proxy", "www-data", "backup", "list", "irc", "gnats", "nobody"].includes(value);
}

function hasBroadHost(value) {
  const host = hostFromTarget(value);
  return host === "0.0.0.0" || host === "::" || host === "*";
}

function hostFromTarget(value) {
  const raw = String(value || "");
  return raw.includes("@") ? raw.slice(raw.lastIndexOf("@") + 1) : raw;
}

function shellValue(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function shellQuote(parts) {
  return parts.map((part) => {
    if (/^[A-Za-z0-9_./:=,@+-]+$/.test(part)) return part;
    return `'${String(part).replace(/'/g, "'\\''")}'`;
  }).join(" ");
}

function writeExecutable(path, content) {
  writeFileSync(path, content);
  chmodSync(path, 0o755);
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:self-hosted:kit -- --ssh-target root@example.com --peer-public-key CLIENT_PUBLIC_KEY
  npm run cloud:self-hosted:kit -- --host example.com --ssh-user root --vpn-peer 'admin|CLIENT_PUBLIC_KEY|10.44.0.2/32'

Options:
  --ssh-target TARGET             Bootstrap SSH target, usually root@host before hardening.
  --host HOST                     Host when not using --ssh-target.
  --ssh-user USER                 Bootstrap user when not using --ssh-target. Default: root.
  --operator-user USER            Non-root SEIS cloud user created on the host. Default: seis.
  --vpn-peer NAME|PUBLIC_KEY|IP   Approved WireGuard peer. May be repeated or semicolon-separated.
  --peer-public-key KEY           Convenience form for admin peer creation.
  --peer-name NAME                Peer name with --peer-public-key. Default: admin.
  --peer-address CIDR             Peer VPN address. Default: 10.44.0.2/32.
  --identity-file PATH            SSH identity used in generated config. Default: ~/.ssh/id_ed25519_seis_codex.
  --alias NAME                    SSH alias for public bootstrap route. Default: seis-cloud-vps.
  --vpn-alias NAME                SSH alias for VPN route. Default: seis-cloud-vpn.
  --output DIR                    Kit output directory. Default: dist/seis-cloud-self-hosted-kit.
`);
}
