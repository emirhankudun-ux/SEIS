#!/usr/bin/env node

const args = parseArgs(process.argv.slice(2));
const host = args.host || process.env.SEIS_SSH_VPN_HOST || "";
const user = args.user || args["ssh-user"] || process.env.SEIS_SSH_VPN_USER || "seis";
const target = args["ssh-target"] || (host ? `${user}@${host}` : "<user@cloud-host>");
const vpnPort = args["vpn-port"] || process.env.SEIS_VPN_PORT || "51820";
const vpnServerAddress = args["vpn-server-address"] || process.env.SEIS_VPN_SERVER_ADDRESS || "10.44.0.1/24";
const vpnSubnet = args["vpn-subnet"] || process.env.SEIS_VPN_SUBNET || "10.44.0.0/24";
const vpnPeers = listArg(args["vpn-peer"] || process.env.SEIS_VPN_PEERS || []);
const path = args.path || process.env.SEIS_REMOTE_PATH || "/opt/seis";
const apply = Boolean(args.apply);

if (args.help) {
  printHelp();
  process.exit(0);
}

const failures = [];
if (apply) failures.push("Existing SSH/VPS provisioning is plan-only; review the printed commands and run them manually on the selected host.");
if (host && hasBroadHost(host)) failures.push("Host must be a named cloud/VPS host, not a wildcard address.");
if (vpnPeers.length === 0) failures.push("Plan requires at least one --vpn-peer approved workplace/team peer.");
for (const peer of vpnPeers) {
  if (!isValidPeer(peer)) failures.push(`Invalid --vpn-peer format: ${peer}`);
}

if (failures.length > 0) {
  console.error("SEIS SSH WireGuard cloud server plan failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const peerEnv = vpnPeers.length > 0 ? vpnPeers.join(";") : "<name|CLIENT_PUBLIC_KEY|10.44.0.2/32>";
const installer = "server/cloud/ssh-wireguard/install-seis-cloud-host.sh";
const remoteInstaller = "/tmp/install-seis-cloud-host.sh";
const envPrefix = [
  `SEIS_USER=${shellValue(user)}`,
  `SEIS_ROOT=${shellValue(path)}`,
  `SEIS_WG_PORT=${shellValue(vpnPort)}`,
  `SEIS_WG_SERVER_ADDRESS=${shellValue(vpnServerAddress)}`,
  `SEIS_WG_SUBNET=${shellValue(vpnSubnet)}`,
  `SEIS_WG_PEERS=${shellValue(peerEnv)}`
].join(" ");

console.log(JSON.stringify({
  ok: true,
  mode: "plan",
  provider: "ssh-wireguard-vps",
  audience: "workplaces-and-teams",
  host: host || null,
  sshTarget: target,
  path,
  vpn: {
    mode: "wireguard",
    port: Number(vpnPort),
    subnet: vpnSubnet,
    serverAddress: vpnServerAddress,
    peerCount: vpnPeers.length,
    peersRequiredBeforeApply: true
  },
  coverage: [
    "key-only SSH access",
    "Codex remote host bootstrap",
    "WireGuard workplace/team VPN",
    "release handoff root",
    "current release root",
    "git/curl/rsync/sudo/unzip deployment tooling"
  ],
  commands: {
    createPeer: "npm run vpn:wireguard:peer -- --name admin --public-key CLIENT_PUBLIC_KEY --address 10.44.0.2/32",
    copyInstaller: shellQuote(["scp", installer, `${target}:${remoteInstaller}`]),
    reviewInstaller: shellQuote(["ssh", target, `sed -n "1,220p" ${remoteInstaller}`]),
    runInstaller: shellQuote(["ssh", target, `sudo ${envPrefix} bash ${remoteInstaller}`]),
    readiness: shellQuote(["npm", "run", "cloud:ssh-vpn:readiness", "--", "--ssh-target", target])
  },
  notes: [
    "No cloud resources were created by this plan.",
    "Use this lane for an existing Linux cloud/VPS host when GCP project billing is unavailable.",
    "Run installer commands only after the host, SSH user, approved WireGuard peer, rollback owner, and maintenance window are confirmed.",
    "Public cloud remains the everyone-facing surface; this SSH/WireGuard host is only for workplaces and teams."
  ]
}, null, 2));

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "apply") {
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

function hasBroadHost(value) {
  return value === "0.0.0.0" || value === "::" || value === "*";
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

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh-vpn:server:plan -- --host example.com --ssh-user seis
  npm run cloud:ssh-vpn:server:plan -- --ssh-target seis@example.com --vpn-peer 'admin|CLIENT_PUBLIC_KEY|10.44.0.2/32'

Options:
  --host HOST                       Existing cloud/VPS host.
  --ssh-user USER                   SSH user. Default: seis.
  --ssh-target TARGET               SSH target alias or user@host.
  --path PATH                       Remote SEIS root. Default: /opt/seis.
  --vpn-peer NAME|PUBLIC_KEY|IP/32  Approved WireGuard peer. Required. IP range: 10.44.0.2-254/32.
  --vpn-port PORT                   WireGuard UDP port. Default: 51820.
  --vpn-server-address CIDR         Server VPN address. Default: 10.44.0.1/24.
  --vpn-subnet CIDR                 VPN subnet. Default: 10.44.0.0/24.
`);
}
