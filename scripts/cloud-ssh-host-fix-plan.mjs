#!/usr/bin/env node

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const alias = args.host || "SEIS-SSH";
const publicIp = args["public-ip"] || "";
const targetPort = Number(args.port || args["direct-port"] || 22);
const identityFile = expandHome(args["identity-file"] || "~/.ssh/id_ed25519_seis_codex");
const user = args.user || "root";
const outputJson = Boolean(args.json);
const includeLive = Boolean(args.live);

const config = readSshConfig(alias);
const sshConfig = parseConfig(config);

const host = publicIp || sshConfig.hostname || "";
const resolvedUser = sshConfig.user || user;
const port = Number(sshConfig.port || targetPort);

const result = {
  alias,
  host,
  user: resolvedUser,
  port,
  identityFile,
  transport: sshConfig.transport,
  checks: {
    sshConfigAvailable: config.ok,
    directHostProvided: Boolean(host),
    identityFileExists: Boolean(identityFile && existsSync(identityFile)),
    proxyCommand: sshConfig.proxyCommand || null,
    readyForPlan: false,
    tcpProbe: null,
    blockers: [],
  },
  commands: [],
  nextActions: [],
};

if (!host) {
  result.checks.blockers.push("Missing public host. Pass --public-ip or configure HostName in ~/.ssh/config for SEIS-SSH.");
}

if (sshConfig.transport === "codespace") {
  result.checks.blockers.push("Alias is not direct-cloud yet; switch to direct-cloud transport first.");
}

result.commands.push("# SSH alias inspection");
result.commands.push("ssh -G " + alias);
result.commands.push("# If proxycommand still exists, remove it and switch to direct-cloud");

if (host) {
  result.commands.push("# Confirm DNS/public route and listener expectations");
  result.commands.push(
    "ssh -o BatchMode=yes -o ConnectTimeout=5 -i " +
    quoteShellArg(identityFile) + " -p " + String(port) + " " +
    quoteShellArg(`${resolvedUser}@${host}`) + " 'echo ssh-target-ok'"
  );
  result.commands.push("sudo ss -ltnp | rg '" + String(port) + "\\b'");

  result.commands.push("# Firewall checks");
  result.commands.push("sudo ufw status verbose");
  result.commands.push("sudo firewall-cmd --state >/dev/null 2>&1 && sudo firewall-cmd --list-all || true");
  result.commands.push("sudo iptables -L INPUT -n | rg 'dpt:" + String(port) + "|22' || true");

  result.commands.push("# sshd config checks");
  result.commands.push("sudo nano /etc/ssh/sshd_config");
  result.commands.push("sudo systemctl restart sshd");
  result.commands.push("sudo systemctl status sshd");
}

if (host && includeLive) {
  const probe = probeTcp(host, port);
  result.checks.tcpProbe = probe;
  if (!probe.reachable) {
    result.checks.blockers.push(`direct-cloud-endpoint-unreachable: ${probe.error || "unknown"}`);
    result.nextActions.push("Run the host triage commands, then validate with npm run cloud:ssh:online:strict");
  }
}

result.checks.readyForPlan = result.checks.blockers.length === 0;

if (result.checks.readyForPlan && host) {
  result.nextActions.push("Run npm run cloud:ssh:host-fix-plan -- --public-ip " + host + " --user " + resolvedUser + " --json --live after each fix.");
  result.nextActions.push("Run npm run cloud:ssh:online:strict");
  result.nextActions.push("Run npm run cloud:ssh:mobile-24x7:strict");
}

if (host) {
  result.nextActions.push("If SSH still blocks, open host firewall and sshd for 22/tcp, then check for provider security group inbound rule.");
}

if (outputJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  printPlan(result);
}

process.exit(result.checks.blockers.length ? 1 : 0);

function readSshConfig(aliasName) {
  const output = run("ssh", ["-G", aliasName]);
  return {
    ok: output.status === 0,
    stdout: output.stdout,
    stderr: output.stderr,
    status: output.status,
  };
}

function parseConfig(config) {
  const values = {};
  for (const line of (config.stdout || "").split(/\r?\n/)) {
    const i = line.indexOf(" ");
    if (i < 0) continue;
    const key = line.slice(0, i).toLowerCase();
    const value = line.slice(i + 1);
    if (!values[key]) values[key] = value.trim();
  }

  return {
    hostname: values.hostname || "",
    user: values.user || "",
    port: values.port || "22",
    proxyCommand: normalize(values.proxycommand),
    transport: values.proxycommand && values.proxycommand !== "none"
      ? "codespace"
      : (values.hostname ? "direct-cloud" : "unknown"),
  };
}

function probeTcp(host, port) {
  const netcat = run("bash", ["-lc", `command -v nc >/dev/null 2>&1 && nc -z -w 5 ${host} ${port}`]);
  if (netcat.status === 0) return { reachable: true, error: null };

  const tcpFallback = run("bash", ["-lc", `bash -c 'cat < /dev/null > /dev/tcp/${host}/${port}'`]);
  if (tcpFallback.status === 0) return { reachable: true, error: null };

  return {
    reachable: false,
    error: String(tcpFallback.stderr || tcpFallback.stdout || "timeout or connection blocked"),
  };
}

function normalize(value) {
  if (!value || value === "none") return null;
  return value;
}

function printPlan(data) {
  console.log(`SEIS SSH host fix plan`);
  console.log(`Alias: ${data.alias}`);
  console.log(`Host: ${data.host || "<missing>"}`);
  console.log(`User: ${data.user}`);
  console.log(`Port: ${data.port}`);
  console.log(`Transport: ${data.transport}`);
  if (data.identityFile) console.log(`Identity: ${data.identityFile} (${data.identityFileExists ? "present" : "missing"})`);
  if (!data.checks.readyForPlan) {
    console.log("Blockers:");
    for (const blocker of data.checks.blockers) console.log(`- ${blocker}`);
  }
  console.log("Command plan:");
  for (const command of data.commands) console.log(`- ${command}`);
  console.log("Next actions:");
  for (const action of data.nextActions) console.log(`- ${action}`);
}

function printHelp() {
  console.log(`Usage:
npm run cloud:ssh:host-fix-plan
npm run cloud:ssh:host-fix-plan -- --host SEIS-SSH
npm run cloud:ssh:host-fix-plan -- --public-ip 21.0.3.171 --user root --live
 
Options:
  --host HOST             SSH alias. Default: SEIS-SSH.
  --public-ip IP          Direct host IP override.
  --user USER             SSH user for probe command. Default: root.
  --direct-port PORT       SSH port override.
  --identity-file PATH    Path to key file used in checks.
  --live                  Run live TCP probe.
  --json                  Output JSON only.
`);
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "json" || key === "live") {
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

function expandHome(value) {
  const text = String(value || "");
  if (text === "~") return homedir();
  if (text.startsWith("~/")) return join(homedir(), text.slice(2));
  return text;
}

function quoteShellArg(value) {
  const text = String(value || "");
  if (!text) return "''";
  return `'${text.replaceAll("'", "'\"'\"'")}'`;
}

function run(command, argv) {
  const result = spawnSync(command, argv, {
    encoding: "utf8",
    shell: false,
    timeout: 45000,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}
