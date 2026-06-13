#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const args = parseArgs(process.argv.slice(2));
const apply = Boolean(args.apply);
const project = args.project || process.env.GCP_PROJECT || process.env.CLOUDSDK_CORE_PROJECT || "";
const zone = args.zone || process.env.GCP_ZONE || "us-central1-a";
const instance = args.instance || process.env.GCP_INSTANCE || "seis-cloud-dev";
const machineType = args["machine-type"] || process.env.GCP_MACHINE_TYPE || "e2-micro";
const bootDiskSize = args["boot-disk-size"] || process.env.GCP_BOOT_DISK_SIZE || "20GB";
const sshUser = args["ssh-user"] || process.env.GCP_SSH_USER || "seis";
const sshSourceRange = args["ssh-source-range"] || process.env.GCP_SSH_SOURCE_RANGE || "";
const vpn = args.vpn || process.env.SEIS_VPN || "wireguard";
const vpnPort = args["vpn-port"] || process.env.SEIS_VPN_PORT || "51820";
const vpnSourceRange = args["vpn-source-range"] || process.env.SEIS_VPN_SOURCE_RANGE || "";
const vpnSubnet = args["vpn-subnet"] || process.env.SEIS_VPN_SUBNET || "10.44.0.0/24";
const vpnServerAddress = args["vpn-server-address"] || process.env.SEIS_VPN_SERVER_ADDRESS || "10.44.0.1/24";
const vpnPeers = listArg(args["vpn-peer"] || process.env.SEIS_VPN_PEERS || []);
const vpnAudience = "workplaces-and-teams";
const publicKeyPath = resolvePath(args["public-key"] || process.env.GCP_SSH_PUBLIC_KEY || "~/.ssh/id_ed25519_seis_codex.pub");
const startupScript = resolve(ROOT, "server/cloud/gcp/startup-seis-cloud.sh");
const networkTag = args["network-tag"] || "seis-codex-ssh";
const firewallRule = args["firewall-rule"] || "seis-allow-ssh-codex";
const vpnFirewallRule = args["vpn-firewall-rule"] || "seis-allow-wireguard-vpn";

if (args.help) {
  printHelp();
  process.exit(0);
}

const failures = [];
if (!project) failures.push("Missing --project or GCP_PROJECT.");
if (!existsSync(startupScript)) failures.push(`Missing startup script: ${relative(startupScript)}`);
if (!existsSync(publicKeyPath)) failures.push(`Missing SSH public key: ${publicKeyPath}`);
if (apply && !sshSourceRange) failures.push("Apply requires --ssh-source-range CIDR. Do not open SSH broadly by default.");
if (vpn !== "wireguard" && vpn !== "none") failures.push("VPN must be wireguard or none.");
if (apply && vpn === "wireguard" && !vpnSourceRange) failures.push("Apply with WireGuard requires --vpn-source-range CIDR.");
if (vpn === "wireguard" && hasBroadCidr(vpnSourceRange)) failures.push("WireGuard VPN source ranges must be scoped to workplace/team networks, not 0.0.0.0/0 or ::/0.");
for (const peer of vpnPeers) {
  if (!isValidPeer(peer)) failures.push(`Invalid --vpn-peer format: ${peer}`);
}

const activeAccount = run("gcloud", ["auth", "list", "--filter=status:ACTIVE", "--format=value(account)"], { allowFailure: true }).stdout.trim();
if (!activeAccount) failures.push("No active gcloud account. Run gcloud auth login first.");

if (failures.length > 0) {
  console.error("SEIS GCP cloud server preflight failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const sshKey = readFileSync(publicKeyPath, "utf8").trim();
const metadataSshKey = `${sshUser}:${sshKey}`;
const metadata = [
  `ssh-keys=${metadataSshKey}`,
  `seis-vpn=${vpn}`,
  `seis-vpn-audience=${vpnAudience}`,
  `seis-wg-port=${vpnPort}`,
  `seis-wg-subnet=${vpnSubnet}`,
  `seis-wg-server-address=${vpnServerAddress}`
];

if (vpnPeers.length > 0) {
  metadata.push(`seis-wg-peers=${vpnPeers.join(";")}`);
}

const enableServicesCommand = [
  "gcloud", "services", "enable", "compute.googleapis.com",
  "--project", project
];
const firewallCommand = [
  "gcloud", "compute", "firewall-rules", "create", firewallRule,
  "--project", project,
  "--network", "default",
  "--direction", "INGRESS",
  "--allow", "tcp:22",
  "--source-ranges", sshSourceRange || "<your-public-ip>/32",
  "--target-tags", networkTag,
  "--description", "Allow scoped SSH access for SEIS Codex cloud host"
];
const vpnFirewallCommand = [
  "gcloud", "compute", "firewall-rules", "create", vpnFirewallRule,
  "--project", project,
  "--network", "default",
  "--direction", "INGRESS",
  "--allow", `udp:${vpnPort}`,
  "--source-ranges", vpnSourceRange || "<vpn-client-public-ip-ranges>",
  "--target-tags", networkTag,
  "--description", "Allow WireGuard VPN access for SEIS workplace/team cloud host"
];
const createInstanceCommand = [
  "gcloud", "compute", "instances", "create", instance,
  "--project", project,
  "--zone", zone,
  "--machine-type", machineType,
  "--image-family", "debian-12",
  "--image-project", "debian-cloud",
  "--boot-disk-size", bootDiskSize,
  "--boot-disk-type", "pd-balanced",
  "--tags", networkTag,
  "--metadata", metadata.join(","),
  "--metadata-from-file", `startup-script=${startupScript}`,
  "--labels", "app=seis,role=codex-cloud-host,managed-by=repo-script",
  "--shielded-secure-boot",
  "--shielded-vtpm",
  "--shielded-integrity-monitoring"
];

if (!apply) {
  console.log(JSON.stringify({
    ok: true,
    mode: "plan",
    activeAccount,
    project,
    zone,
    instance,
    machineType,
    bootDiskSize,
    sshUser,
    sshSourceRange: sshSourceRange || null,
    vpn: {
      mode: vpn,
      audience: vpn === "wireguard" ? vpnAudience : null,
      port: vpn === "wireguard" ? Number(vpnPort) : null,
      sourceRange: vpnSourceRange || null,
      subnet: vpn === "wireguard" ? vpnSubnet : null,
      serverAddress: vpn === "wireguard" ? vpnServerAddress : null,
      peerCount: vpnPeers.length
    },
    publicKey: publicKeyPath,
    startupScript: relative(startupScript),
    applyCommand: "npm run cloud:gcp:server:apply -- --project <project> --ssh-source-range <your-public-ip>/32 --vpn-source-range <vpn-client-public-ip-ranges>",
    commands: {
      enableServices: shellQuote(enableServicesCommand),
      createFirewallRule: shellQuote(firewallCommand),
      createVpnFirewallRule: vpn === "wireguard" ? shellQuote(vpnFirewallCommand) : null,
      createInstance: shellQuote(createInstanceCommand)
    },
    notes: [
      "No cloud resources were created. Re-run with --apply to mutate Google Cloud.",
      "Use a /32 SSH source range for bootstrap/admin SSH unless a wider trusted network is intentional.",
      "Public cloud surfaces remain for everyone; WireGuard cloud access is only for approved workplace/team peers.",
      "Use explicit WireGuard peers so approved team members can reach the cloud host at 10.44.0.1.",
      "Billing and Compute Engine API must be enabled before a VM can run."
    ]
  }, null, 2));
  process.exit(0);
}

runChecked(enableServicesCommand);

const existingFirewall = run("gcloud", [
  "compute", "firewall-rules", "describe", firewallRule,
  "--project", project,
  "--format=value(name)"
], { allowFailure: true }).stdout.trim();

if (!existingFirewall) {
  runChecked(firewallCommand);
}

if (vpn === "wireguard") {
  const existingVpnFirewall = run("gcloud", [
    "compute", "firewall-rules", "describe", vpnFirewallRule,
    "--project", project,
    "--format=value(name)"
  ], { allowFailure: true }).stdout.trim();

  if (!existingVpnFirewall) {
    runChecked(vpnFirewallCommand);
  }
}

const existingInstance = run("gcloud", [
  "compute", "instances", "describe", instance,
  "--project", project,
  "--zone", zone,
  "--format=value(name)"
], { allowFailure: true }).stdout.trim();

if (!existingInstance) {
  runChecked(createInstanceCommand);
}

const externalIp = runChecked([
  "gcloud", "compute", "instances", "describe", instance,
  "--project", project,
  "--zone", zone,
  "--format=get(networkInterfaces[0].accessConfigs[0].natIP)"
]).stdout.trim();

console.log(JSON.stringify({
  ok: true,
  mode: "apply",
  project,
  zone,
  instance,
  externalIp,
  sshConfig: [
    "Host seis-gcp-cloud",
    `  HostName ${externalIp}`,
    `  User ${sshUser}`,
    "  IdentityFile ~/.ssh/id_ed25519_seis_codex",
    "  IdentitiesOnly yes",
    "  ServerAliveInterval 30",
    "  ServerAliveCountMax 3"
  ].join("\n"),
  vpnSshConfig: [
    "Host seis-gcp-cloud-vpn",
    "  HostName 10.44.0.1",
    `  User ${sshUser}`,
    "  IdentityFile ~/.ssh/id_ed25519_seis_codex",
    "  IdentitiesOnly yes",
    "  ServerAliveInterval 30",
    "  ServerAliveCountMax 3"
  ].join("\n"),
  verifyCommands: [
    "ssh -o BatchMode=yes seis-gcp-cloud 'command -v codex && codex --version'",
    "ssh -o BatchMode=yes seis-gcp-cloud 'sudo cat /opt/seis/vpn/wireguard-server-public.key'",
    "ssh -o BatchMode=yes seis-gcp-cloud-vpn 'hostname && command -v codex'",
    "ssh seis-gcp-cloud 'codex login --device-auth'",
    "ssh seis-gcp-cloud 'codex remote-control start --json'"
  ]
}, null, 2));

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "apply" || key === "help") {
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

function runChecked(command) {
  const result = run(command[0], command.slice(1));
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
  return result;
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: ROOT,
    encoding: "utf8"
  });

  if (!options.allowFailure && result.error) {
    throw result.error;
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function resolvePath(input) {
  if (input.startsWith("~/")) {
    return resolve(process.env.HOME || "", input.slice(2));
  }
  return resolve(input);
}

function relative(path) {
  if (path.startsWith(ROOT)) {
    return path.slice(ROOT.length + 1);
  }
  return path;
}

function shellQuote(parts) {
  return parts.map((part) => {
    if (/^[A-Za-z0-9_./:=,@+-]+$/.test(part)) return part;
    return `'${String(part).replace(/'/g, "'\\''")}'`;
  }).join(" ");
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
    && /^10\.44\.0\.[0-9]{1,3}\/32$/.test(address || "");
}

function hasBroadCidr(value) {
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .some((item) => item === "0.0.0.0/0" || item === "::/0");
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:gcp:server:plan -- --project PROJECT
  npm run cloud:gcp:server:apply -- --project PROJECT --ssh-source-range YOUR_PUBLIC_IP/32

Options:
  --project PROJECT             Google Cloud project id.
  --zone ZONE                   Compute zone. Default: us-central1-a.
  --instance NAME               VM name. Default: seis-cloud-dev.
  --machine-type TYPE           VM machine type. Default: e2-micro.
  --boot-disk-size SIZE         Boot disk size. Default: 20GB.
  --ssh-user USER               Remote SSH user. Default: seis.
  --ssh-source-range CIDR       Required with --apply.
  --vpn wireguard|none          VPN mode. Default: wireguard.
  --vpn-source-range CIDR       Required with --apply when VPN is wireguard.
                                Must be scoped to workplace/team source ranges.
  --vpn-peer NAME|PUBLIC_KEY|10.44.0.x/32
                                 Repeatable WireGuard peer metadata.
  --vpn-port PORT               WireGuard UDP port. Default: 51820.
  --public-key PATH             Public key path. Default: ~/.ssh/id_ed25519_seis_codex.pub.
  --apply                       Create or update cloud resources.
`);
}
