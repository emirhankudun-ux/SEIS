#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import net from "node:net";

import { isLocalOrLanHost as isLocalHost } from "./lib/seis-ssh-network.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const directHost = args["direct-host"] || process.env.SEIS_CLOUD_DIRECT_HOST || "";
const directPublicIp = args["public-ip"] || process.env.SEIS_CLOUD_PUBLIC_IP || "";
const provider = args.provider || process.env.SEIS_CLOUD_PROVIDER || "";
const project = args.project || process.env.SEIS_CLOUD_PROJECT || "";
const user = args["direct-user"] || process.env.SEIS_CLOUD_DIRECT_USER || "root";
const port = args["direct-port"] || process.env.SEIS_CLOUD_DIRECT_PORT || "22";
const identityFile = expandHome(
  args["identity-file"]
  || args["direct-identity-file"]
  || process.env.SEIS_CLOUD_DIRECT_IDENTITY_FILE
  || `${homedir()}/.ssh/id_ed25519_seis_codex`
);
const sshConfigPath = expandHome(args.output || process.env.SEIS_CLOUD_SSH_CONFIG || join(homedir(), ".ssh", "config"));
const timeoutMs = Number(args["timeout-ms"] || "8000");
const apply = Boolean(args.apply);

const resolvedHost = resolveDirectHost(directHost, directPublicIp, provider, project);
const host = resolvedHost.value;
const blockers = [];
if (!host) blockers.push("--direct-host or --public-ip is required for --transport direct-cloud.");
if (host && isLocalHost(host)) blockers.push("direct host must be a public cloud host, not loopback, private, link-local, or LAN transport.");
if (!/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(user)) blockers.push("--direct-user is invalid.");
if (!/^[0-9]+$/.test(port) || Number(port) < 1 || Number(port) > 65535) blockers.push("--direct-port must be 1-65535.");
if (!identityFile || !existsSync(identityFile)) blockers.push(`direct-cloud-identity-file-missing: ${identityFile}`);

const result = {
  ok: false,
  mode: apply ? "apply" : "plan",
  targetAlias: "SEIS-SSH",
  requestedTransport: "direct-cloud",
  directHost: host || null,
  directHostSource: resolvedHost.source || null,
  directProvider: provider || null,
  directProject: project || null,
  directUser: user,
  directPort: port,
  identityFile,
  sshConfigPath,
  reachable: false,
  sshAuthenticated: false,
  switched: false,
  verified: false,
  rollback: {
    attempted: false,
    restored: false,
    reason: null
  },
  blockers,
  nextActions: [],
  safety: [
    "This script keeps SEIS-SSH as the only visible alias.",
    "It refuses to switch if the direct cloud endpoint is not reachable.",
    "It does not print private keys or tokens."
  ]
};

if (blockers.length === 0) {
    const probe = await probeTcp(host, Number(port), timeoutMs);
    result.reachable = probe.reachable;
    if (!probe.reachable) {
      blockers.push(`direct-cloud-endpoint-unreachable: ${probe.error || "unknown"}`);
      result.nextActions.push(`Fix cloud firewall, security group, sshd, or IP assignment for ${host}:${port}.`);
      result.nextActions.push("Keep the current Codespaces SEIS-SSH transport until the endpoint is reachable.");
    }
}

if (blockers.length === 0) {
  const authProbe = probeSshAuth(host, Number(port), user, identityFile, timeoutMs);
  result.sshAuthenticated = authProbe.ok;
  result.sshAuthProbe = authProbe;
  if (!authProbe.ok) {
    blockers.push(`direct-cloud-ssh-auth-unavailable: ${authProbe.error || "unknown"}`);
    result.nextActions.push(`Verify root key authorization, sshd policy, and allowed users for ${user}@${host}:${port}.`);
    result.nextActions.push("Do not apply direct-cloud mode until an SSH BatchMode probe succeeds.");
  }
}

if (blockers.length === 0 && !apply) {
  result.ok = true;
  result.nextActions.push("Re-run with --apply to switch SEIS-SSH to direct-cloud.");
}

const previousConfig = apply ? snapshotFile(sshConfigPath) : null;

if (blockers.length === 0 && apply) {
  const installArgs = [
    "run",
    "cloud:ssh-config:install",
    "--",
    "--transport",
    "direct-cloud",
    "--direct-host",
    host,
    "--direct-user",
    user,
    "--direct-port",
    port
  ];
  if (identityFile) installArgs.push("--identity-file", identityFile);
  if (sshConfigPath) installArgs.push("--output", sshConfigPath);

  const install = run("npm", installArgs);
  if (install.status !== 0) {
    blockers.push("direct-cloud-install-failed");
    result.installStderr = install.stderr.trim();
    rollbackConfig(previousConfig, result, "install-failed");
  } else {
    result.switched = true;
  }
}

if (blockers.length === 0 && apply) {
  const verify = run("npm", [
    "run",
    "cloud:ssh:online:strict",
    "--",
    "--require-picker-compatible"
  ]);
  if (verify.status !== 0) {
    blockers.push("direct-cloud-verification-failed");
    result.verifyStderr = verify.stderr.trim();
    rollbackConfig(previousConfig, result, "verification-failed");
  } else {
    result.verified = true;
  }
}

result.ok = blockers.length === 0;
result.status = result.ok ? "ready" : "blocked";
result.blockers = blockers;
if (blockers.length > 0 && result.directProvider && result.directProject && !resolvedHost.value) {
  result.nextActions.push(`Set SEIS_CLOUD_${normalizeLookup(result.directProvider)}_${normalizeLookup(result.directProject)}_HOST to switch directly by provider/project.`);
}

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);

function resolveDirectHost(explicitHost, publicIp, cloudProvider, cloudProject) {
  if (explicitHost) {
    return { source: "direct-host", value: explicitHost };
  }
  if (publicIp) {
    return { source: "public-ip", value: publicIp };
  }
  if (cloudProvider && cloudProject) {
    const lookupKey = `SEIS_CLOUD_${normalizeLookup(cloudProvider)}_${normalizeLookup(cloudProject)}_HOST`;
    const value = process.env[lookupKey] || "";
    if (value) {
      return { source: `env:${lookupKey}`, value };
    }
  }
  return { source: null, value: null };
}

function normalizeLookup(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9_]+/g, "_");
}

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

function run(command, argv) {
  const output = spawnSync(command, argv, {
    encoding: "utf8",
    timeout: 60000
  });
  return {
    status: output.status ?? 1,
    stdout: output.stdout || "",
    stderr: output.stderr || ""
  };
}

function probeSshAuth(hostToProbe, portToProbe, sshUser, keyFile, timeout) {
  const output = run("ssh", [
    "-i",
    keyFile,
    "-o",
    "BatchMode=yes",
    "-o",
    `ConnectTimeout=${Math.max(1, Math.ceil(timeout / 1000))}`,
    "-o",
    "StrictHostKeyChecking=accept-new",
    "-p",
    String(portToProbe),
    `${sshUser}@${hostToProbe}`,
    "printf 'ssh_auth=yes\\n'"
  ]);
  return {
    ok: output.status === 0 && /ssh_auth=yes/.test(output.stdout),
    status: output.status,
    error: sanitize(output.stderr || output.stdout || "")
  };
}

function snapshotFile(filePath) {
  if (!filePath || !existsSync(filePath)) {
    return {
      existed: false,
      filePath,
      content: ""
    };
  }
  return {
    existed: true,
    filePath,
    content: readFileSync(filePath, "utf8")
  };
}

function rollbackConfig(snapshot, target, reason) {
  if (!snapshot || !snapshot.filePath) return;
  target.rollback.attempted = true;
  target.rollback.reason = reason;
  try {
    if (snapshot.existed) {
      writeFileSync(snapshot.filePath, snapshot.content);
      chmodSync(snapshot.filePath, 0o600);
    } else if (existsSync(snapshot.filePath)) {
      rmSync(snapshot.filePath);
    }
    target.rollback.restored = true;
  } catch (error) {
    target.rollback.error = sanitize(error.message);
  }
}

function probeTcp(hostToProbe, portToProbe, timeout) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let finished = false;
    const finish = (value) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(timeout);
    socket.once("connect", () => finish({ reachable: true, error: null }));
    socket.once("timeout", () => finish({ reachable: false, error: "timeout" }));
    socket.once("error", (error) => finish({ reachable: false, error: error.message }));
    socket.connect(portToProbe, hostToProbe);
  });
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
  npm run cloud:ssh:direct-cloud:switch -- --direct-host CLOUD_HOST --direct-user root
  npm run cloud:ssh:direct-cloud:switch -- --direct-host CLOUD_HOST --direct-user root --apply
  npm run cloud:ssh:direct-cloud:switch -- --public-ip 203.0.113.10 --apply
  npm run cloud:ssh:direct-cloud:switch -- --provider digitalocean --project seis-prod --public-ip 203.0.113.10 --apply

Options:
  --direct-host HOST       Cloud SSH endpoint to use for SEIS-SSH.
  --public-ip IP           Public IP to use directly as direct-cloud endpoint.
  --provider PROVIDER      Optional cloud provider identifier (used for host metadata resolution).
  --project PROJECT        Optional project or instance identifier (used with provider).
  --direct-user USER       SSH user. Default: root.
  --direct-port PORT       SSH port. Default: 22.
  --identity-file PATH     Identity file for direct-cloud mode.
  --output PATH            SSH config path. Default: ~/.ssh/config.
  --timeout-ms MS          TCP probe timeout. Default: 8000.
  --apply                  Actually switch SEIS-SSH after the endpoint is reachable.
`);
}
