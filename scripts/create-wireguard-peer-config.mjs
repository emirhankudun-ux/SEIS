#!/usr/bin/env node

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const name = args.name || "";
const publicKey = args["public-key"] || "";
const address = args.address || "";
const endpoint = args.endpoint || "EXTERNAL_IP:51820";
const serverPublicKey = args["server-public-key"] || "SERVER_PUBLIC_KEY";
const allowedIps = args["allowed-ips"] || "10.44.0.1/32";

const failures = [];
if (!/^[A-Za-z0-9_.-]+$/.test(name)) failures.push("Missing or invalid --name.");
if (!/^[A-Za-z0-9+/=]{40,60}$/.test(publicKey)) failures.push("Missing or invalid --public-key.");
if (!/^10\.44\.0\.[0-9]{1,3}\/32$/.test(address)) failures.push("Missing or invalid --address. Use 10.44.0.x/32.");

if (failures.length > 0) {
  console.error("SEIS WireGuard peer config failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const metadataPeer = `${name}|${publicKey}|${address}`;
const clientConfig = [
  "[Interface]",
  "PrivateKey = CLIENT_PRIVATE_KEY",
  `Address = ${address}`,
  "",
  "[Peer]",
  `PublicKey = ${serverPublicKey}`,
  `Endpoint = ${endpoint}`,
  `AllowedIPs = ${allowedIps}`,
  "PersistentKeepalive = 25"
].join("\n");

console.log(JSON.stringify({
  ok: true,
  metadataPeer,
  applyFlag: `--vpn-peer ${shellQuote(metadataPeer)}`,
  clientConfig,
  safety: [
    "Generate the client private key on the client device.",
    "Do not commit client private keys or full client configs containing private keys.",
    "AllowedIPs defaults to the SEIS cloud host only, not full-tunnel internet routing."
  ]
}, null, 2));

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
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}

function shellQuote(value) {
  if (/^[A-Za-z0-9_./:=,@+| -]+$/.test(value)) return `'${value}'`;
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function printHelp() {
  console.log(`Usage:
  npm run vpn:wireguard:peer -- --name USER --public-key CLIENT_PUBLIC_KEY --address 10.44.0.2/32

Options:
  --name USER                 Peer label used in VM metadata.
  --public-key KEY            Client WireGuard public key.
  --address CIDR              Client VPN address, for example 10.44.0.2/32.
  --server-public-key KEY     Optional server public key for the client template.
  --endpoint HOST:PORT        Optional server endpoint for the client template.
  --allowed-ips CIDR          Optional route. Default: 10.44.0.1/32.
`);
}
