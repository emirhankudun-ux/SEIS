#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

import { isLocalOrLanHost as isLocalHost } from "./lib/seis-ssh-network.mjs";

const START = "# BEGIN SEIS CLOUD REMOTE SSH";
const END = "# END SEIS CLOUD REMOTE SSH";
const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const codespace = args.codespace || process.env.SEIS_CLOUD_CODESPACE || "seis-cloud-primary-q75g47p769j6hxrv";
const codespaceIdentityFile = args["codespace-identity-file"] || process.env.SEIS_CLOUD_CODESPACE_IDENTITY_FILE || `${homedir()}/.ssh/codespaces.auto`;
const transport = args.transport || process.env.SEIS_CLOUD_SSH_TRANSPORT || "codespace";
const directHost = args["direct-host"] || process.env.SEIS_CLOUD_DIRECT_HOST || "";
const directUser = args["direct-user"] || process.env.SEIS_CLOUD_DIRECT_USER || "root";
const directPort = args["direct-port"] || process.env.SEIS_CLOUD_DIRECT_PORT || "22";
const directIdentityFile = args["identity-file"] || args["direct-identity-file"] || process.env.SEIS_CLOUD_DIRECT_IDENTITY_FILE || `${homedir()}/.ssh/id_ed25519_seis_codex`;
const ghPath = args["gh-path"] || process.env.SEIS_CLOUD_GH_PATH || commandPath("gh") || "gh";
const output = args.output || join(homedir(), ".ssh", "config");
const dryRun = Boolean(args["dry-run"]);
const managedAliases = new Set(["SEIS-SSH", "SEIS-CLOUD", "seis-cloud", "seis-cloud-codespace", "seis-cloud-vps", "seis-cloud-root", "seis-cloud-vpn", "seis-local-mac", "seis-lan-mac"]);

const failures = [];
if (!/^[A-Za-z0-9_.-]+$/.test(codespace)) failures.push("Invalid --codespace.");
if (!["codespace", "direct-cloud"].includes(transport)) failures.push("Unsupported transport. Use codespace or direct-cloud.");
if (transport === "direct-cloud") {
  if (!directHost) failures.push("--direct-host is required for --transport direct-cloud.");
  if (isLocalHost(directHost)) failures.push("--direct-host must be a public cloud host, not loopback, private, link-local, or LAN transport.");
  if (!/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(directUser)) failures.push("Invalid --direct-user.");
  if (!/^[0-9]+$/.test(directPort) || Number(directPort) < 1 || Number(directPort) > 65535) failures.push("Invalid --direct-port.");
}

if (failures.length > 0) {
  console.error("SEIS Cloud SSH config install failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const block = transport === "direct-cloud" ? renderDirectCloudConfig() : renderCodespaceConfig();

const current = existsSync(output) ? readFileSync(output, "utf8") : "";
const next = upsertBlock(removeUnmanagedSeisCloudBlocks(current), block);

if (!dryRun) {
  mkdirSync(dirname(output), { recursive: true, mode: 0o700 });
  writeFileSync(output, next);
  chmodSync(output, 0o600);
}

console.log(JSON.stringify({
  ok: true,
  mode: dryRun ? "dry-run" : "installed",
  output,
  transport,
  codespace: transport === "codespace" ? codespace : null,
  directHost: transport === "direct-cloud" ? directHost : null,
  directUser: transport === "direct-cloud" ? directUser : null,
  directPort: transport === "direct-cloud" ? directPort : null,
  identityFile: transport === "direct-cloud" ? directIdentityFile : codespaceIdentityFile,
  aliases: ["SEIS-SSH"],
  remoteOnly: true,
  cloudOnly: true,
  pickerMode: transport === "direct-cloud" ? "picker-compatible-direct-ssh" : "terminal-compatible-codespaces-proxy",
  notes: [
    "This installer writes one cloud-only SEIS SSH alias: SEIS-SSH.",
    "SEIS-SSH can use GitHub Codespaces transport or direct-cloud SSH transport without creating extra picker aliases.",
    "Local Mac aliases such as 127.0.0.1 or .local are intentionally not part of this portable config.",
    "If a picker cannot show ProxyCommand-based Codespaces targets as online, use --transport direct-cloud only after the cloud endpoint is reachable.",
    "Private keys are not copied; provision the identity file separately on a new computer."
  ]
}, null, 2));

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "dry-run") {
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

function renderCodespaceConfig() {
  const proxy = `${ghPath} cs ssh -c ${codespace} --stdio -- -i ${codespaceIdentityFile}`;
  return [
    START,
    "Host SEIS-SSH",
    "  HostName github.codespaces",
    "  User vscode",
    `  ProxyCommand ${proxy}`,
    "  UserKnownHostsFile /dev/null",
    "  StrictHostKeyChecking no",
    "  LogLevel quiet",
    "  ControlMaster auto",
    `  IdentityFile ${codespaceIdentityFile}`,
    "",
    END
  ].join("\n");
}

function renderDirectCloudConfig() {
  return [
    START,
    "Host SEIS-SSH",
    `  HostName ${directHost}`,
    `  User ${directUser}`,
    `  Port ${directPort}`,
    `  IdentityFile ${directIdentityFile}`,
    "  IdentitiesOnly yes",
    "  StrictHostKeyChecking accept-new",
    "  ServerAliveInterval 30",
    "  ServerAliveCountMax 3",
    "  LogLevel quiet",
    "",
    END
  ].join("\n");
}

function upsertBlock(content, block) {
  const normalized = content.endsWith("\n") || content.length === 0 ? content : `${content}\n`;
  const startIndex = normalized.indexOf(START);
  const endIndex = normalized.indexOf(END);

  if (startIndex >= 0 && endIndex > startIndex) {
    const before = normalized.slice(0, startIndex).trimEnd();
    const after = normalized.slice(endIndex + END.length).trimStart();
    return [before, block, after].filter(Boolean).join("\n\n") + "\n";
  }

  return [normalized.trimEnd(), block].filter(Boolean).join("\n\n") + "\n";
}

function removeUnmanagedSeisCloudBlocks(content) {
  const lines = content.split(/\r?\n/);
  const outputLines = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const hostMatch = /^\s*Host\s+(.+)$/.exec(line);
    const hostNames = hostMatch ? hostMatch[1].trim().split(/\s+/) : [];
    const isManagedHost = hostNames.some((name) => managedAliases.has(name));

    if (!isManagedHost) {
      outputLines.push(line);
      index += 1;
      continue;
    }

    index += 1;
    while (index < lines.length && !/^\s*Host\s+/.test(lines[index]) && lines[index] !== START && lines[index] !== END) {
      index += 1;
    }
  }

  return outputLines.join("\n");
}

function commandPath(command) {
  const result = spawnSync("which", [command], {
    encoding: "utf8"
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh-config:install
  npm run cloud:ssh-config:install -- --codespace seis-cloud-primary-q75g47p769j6hxrv
  npm run cloud:ssh-config:install -- --transport direct-cloud --direct-host CLOUD_HOST --direct-user root
  npm run cloud:ssh-config:install -- --dry-run

Options:
  --transport TYPE       codespace or direct-cloud. Default: codespace.
  --codespace NAME        Codespace name for codespace transport.
  --gh-path PATH          gh CLI path for ProxyCommand. Default: command -v gh.
  --codespace-identity-file PATH  Codespaces identity path. Default: ~/.ssh/codespaces.auto.
  --direct-host HOST     Direct cloud SSH hostname or IP for picker-compatible SSH.
  --direct-user USER     Direct cloud SSH user. Default: root.
  --direct-port PORT     Direct cloud SSH port. Default: 22.
  --identity-file PATH   Direct cloud SSH identity. Default: ~/.ssh/id_ed25519_seis_codex.
  --output PATH           SSH config path. Default: ~/.ssh/config.
  --dry-run               Print metadata without writing.
`);
}
