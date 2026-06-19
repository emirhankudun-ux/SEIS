#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const dryRun = args.has("--dry-run") || !write;
const force = args.has("--force");

const env = process.env;
const alias = env.SEIS_SSH_ALIAS || "SEIS-SSH";
const host = env.SEIS_SSH_HOST || env.SEIS_CLOUD_HOST || "";
const port = Number(env.SEIS_SSH_PORT || "22");
const user = env.SEIS_SSH_USER || "aiuser";
const identityFile = env.SEIS_SSH_IDENTITY_FILE || "~/.ssh/id_ed25519_seis_codex";
const configPath = expandHome(env.SSH_CONFIG_PATH || "~/.ssh/config");

const markerStart = "# >>> SEIS SSH Mobile Direct Cloud (managed by SEIS)";
const markerEnd = "# <<< SEIS SSH Mobile Direct Cloud (managed by SEIS)";

const failures = [];
if (!host) failures.push("SEIS_SSH_HOST or SEIS_CLOUD_HOST is required.");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  failures.push("SEIS_SSH_PORT must be a TCP port between 1 and 65535.");
}
if (!/^[A-Za-z0-9._-]+$/.test(alias)) failures.push("SEIS_SSH_ALIAS must be a simple SSH host alias.");

const block = [
  markerStart,
  `Host ${alias}`,
  `  HostName ${host || "<always-on-public-ip-or-dns>"}`,
  `  User ${user}`,
  `  Port ${port}`,
  `  IdentityFile ${identityFile}`,
  "  IdentitiesOnly yes",
  "  ServerAliveInterval 30",
  "  ServerAliveCountMax 3",
  "  TCPKeepAlive yes",
  "  RequestTTY force",
  markerEnd,
  "",
].join("\n");

if (failures.length) {
  console.error("SEIS SSH mobile direct-cloud config is blocked:");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("\nPlanned managed block:");
  console.error(block);
  process.exit(1);
}

const existing = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf8") : "";
const next = upsertManagedBlock(existing, block);

const hasUnmanagedAlias = unmanagedAliasExists(existing, alias) && !existing.includes(markerStart);

if (write && !force && hasUnmanagedAlias) {
  console.error(`Refusing to overwrite unmanaged SSH alias: ${alias}`);
  console.error("Use --force only after manually confirming the existing alias is safe to replace.");
  process.exit(1);
}

if (dryRun) {
  console.log(`Dry run: would update ${configPath}`);
  if (hasUnmanagedAlias) {
    console.log(`Warning: unmanaged SSH alias already exists: ${alias}`);
    console.log("Install mode will refuse to replace it unless --force is passed.");
  }
  console.log(block);
  process.exit(0);
}

fs.mkdirSync(path.dirname(configPath), { recursive: true, mode: 0o700 });
fs.writeFileSync(configPath, next, { mode: 0o600 });
try {
  fs.chmodSync(path.dirname(configPath), 0o700);
  fs.chmodSync(configPath, 0o600);
} catch {
  // chmod can fail on non-POSIX systems; write remains explicit and local.
}

console.log(`Installed managed ${alias} SSH config block: ${configPath}`);
console.log(`Connect with: ssh ${alias}`);

function expandHome(value) {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return value;
}

function upsertManagedBlock(existingText, managedBlock) {
  const cleanedText = removeAliasBlocks(existingText, alias);
  if (!cleanedText.trim()) return managedBlock;

  const pattern = new RegExp(`${escapeRegExp(markerStart)}[\\s\\S]*?${escapeRegExp(markerEnd)}\\n?`, "m");
  if (pattern.test(cleanedText)) return cleanedText.replace(pattern, managedBlock);

  const separator = cleanedText.endsWith("\n") ? "" : "\n";
  return `${cleanedText}${separator}\n${managedBlock}`;
}

function removeAliasBlocks(existingText, targetAlias) {
  const lines = existingText.split(/\r?\n/);
  const output = [];
  const hostRegex = /^\s*Host\s+(.+)$/;

  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    const match = line.match(hostRegex);
    if (!match) {
      output.push(line);
      i += 1;
      continue;
    }

    const aliasNames = match[1].trim().split(/\s+/);
    if (!aliasNames.includes(targetAlias)) {
      output.push(line);
      i += 1;
      continue;
    }

    i += 1;
    while (i < lines.length) {
      if (hostRegex.test(lines[i])) break;
      i += 1;
    }
  }

  return output.join("\n");
}

function unmanagedAliasExists(existingText, sshAlias) {
  const hostPattern = new RegExp(`^\\s*Host\\s+${escapeRegExp(sshAlias)}\\s*$`, "m");
  return hostPattern.test(existingText);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
