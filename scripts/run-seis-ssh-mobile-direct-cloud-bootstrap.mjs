#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const apply = Boolean(args.apply);
const host = args.host || process.env.SEIS_SSH_HOST || process.env.SEIS_CLOUD_HOST || "";
const rootUser = args["root-user"] || process.env.SEIS_ROOT_USER || "root";
const remoteUser = args["remote-user"] || process.env.SEIS_REMOTE_USER || "aiuser";
const port = String(args.port || process.env.SEIS_SSH_PORT || "22");
const publicKeyFile = expandHome(
  args["public-key"] || process.env.SEIS_SSH_PUBLIC_KEY_FILE || "~/.ssh/id_ed25519_seis_codex.pub"
);
const bootstrapScript = args.script || "scripts/bootstrap-seis-ssh-mobile-direct-cloud.sh";
const remoteScript = args["remote-script"] || "/tmp/seis-bootstrap.sh";
const connectTimeout = String(args["connect-timeout"] || "12");

const failures = [];
if (!host) failures.push("SEIS_SSH_HOST or --host is required.");
if (!/^[1-9][0-9]{0,4}$/.test(port) || Number(port) > 65535) failures.push("SSH port must be 1-65535.");
if (!fs.existsSync(bootstrapScript)) failures.push(`Bootstrap script not found: ${bootstrapScript}`);
if (!fs.existsSync(publicKeyFile)) failures.push(`Public key file not found: ${publicKeyFile}`);

const publicKey = fs.existsSync(publicKeyFile) ? fs.readFileSync(publicKeyFile, "utf8").trim() : "";
if (publicKey && !isSshPublicKey(publicKey)) failures.push(`File does not look like an SSH public key: ${publicKeyFile}`);

const plan = {
  id: "seis-ssh-mobile-direct-cloud-bootstrap",
  mode: apply ? "apply" : "dry-run",
  host,
  port,
  rootUser,
  remoteUser,
  publicKeyFile: redactHome(publicKeyFile),
  publicKeyFingerprint: publicKey ? fingerprintPublicKey(publicKey) : null,
  bootstrapScript,
  remoteScript,
  commands: {
    copy: `scp -P ${shellQuote(port)} ${shellQuote(bootstrapScript)} ${shellQuote(`${rootUser}@${host}:${remoteScript}`)}`,
    run: `ssh -p ${shellQuote(port)} ${shellQuote(`${rootUser}@${host}`)} ${shellQuote(remoteEnvCommand(publicKey))}`,
  },
  safety: [
    "This runner reads a public key only; it never reads or prints private keys.",
    "Use --apply only after the dry-run plan points at the intended always-on direct-cloud VM.",
    "Runtime secrets stay on the VM under /etc/seis/ssh-ai.env and are not committed.",
  ],
  blockers: failures,
};

console.log(JSON.stringify(plan, null, 2));

if (failures.length > 0) process.exit(1);
if (!apply) process.exit(0);

runChecked("scp", [
  "-P",
  port,
  bootstrapScript,
  `${rootUser}@${host}:${remoteScript}`,
]);

runChecked("ssh", [
  "-o",
  "BatchMode=yes",
  "-o",
  `ConnectTimeout=${connectTimeout}`,
  "-o",
  "StrictHostKeyChecking=accept-new",
  "-p",
  port,
  `${rootUser}@${host}`,
  remoteEnvCommand(publicKey),
]);

console.log("SEIS SSH mobile direct-cloud bootstrap applied.");

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "apply") {
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

function remoteEnvCommand(publicKeyValue) {
  return [
    `SEIS_AUTHORIZED_KEY=${shellQuote(publicKeyValue)}`,
    `SEIS_REMOTE_USER=${shellQuote(remoteUser)}`,
    `SEIS_SSH_PORT=${shellQuote(port)}`,
    "bash",
    shellQuote(remoteScript),
  ].join(" ");
}

function runChecked(command, argv) {
  const result = spawnSync(command, argv, {
    stdio: "inherit",
    timeout: 300000,
  });
  if (result.error) {
    console.error(`${command} failed: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`${command} exited with status ${result.status}`);
    process.exit(result.status || 1);
  }
}

function isSshPublicKey(value) {
  return /^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp(?:256|384|521)|sk-ssh-ed25519@openssh.com|sk-ecdsa-sha2-nistp256@openssh.com)\s+[A-Za-z0-9+/=]+(?:\s+.*)?$/.test(value);
}

function fingerprintPublicKey(value) {
  const parts = value.split(/\s+/);
  if (parts.length < 2) return null;
  try {
    const digest = crypto.createHash("sha256").update(Buffer.from(parts[1], "base64")).digest("base64").replace(/=+$/, "");
    return `SHA256:${digest}`;
  } catch {
    return null;
  }
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function expandHome(value) {
  const text = String(value || "");
  if (text === "~") return os.homedir();
  if (text.startsWith("~/")) return path.join(os.homedir(), text.slice(2));
  return text;
}

function redactHome(value) {
  const home = os.homedir();
  return String(value).startsWith(home) ? `~${String(value).slice(home.length)}` : String(value);
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh:mobile-direct:bootstrap:plan
  npm run cloud:ssh:mobile-direct:bootstrap:apply

Options:
  --host HOST              Direct-cloud public IP or DNS. Default: SEIS_SSH_HOST.
  --root-user USER         Bootstrap SSH user. Default: root.
  --remote-user USER       Runtime SSH user to create. Default: aiuser.
  --port PORT              SSH port. Default: 22.
  --public-key PATH        Public key to install. Default: ~/.ssh/id_ed25519_seis_codex.pub.
  --script PATH            Local bootstrap script path.
  --remote-script PATH     Remote temporary script path. Default: /tmp/seis-bootstrap.sh.
  --connect-timeout SEC    SSH connect timeout. Default: 12.
  --apply                  Execute scp and ssh. Omit for dry-run JSON only.
`);
}
