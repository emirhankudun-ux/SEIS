#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SHELL_DIR = join(ROOT, "server/cloud/ssh-ai-shell");
const EXPECTED_VERSION = "0.4";
const EXPECTED_DISPLAY = `v${EXPECTED_VERSION}`;
const EXPECTED_USER_AGENT = `SSH-AI/${EXPECTED_VERSION}`;
const EXPECTED_RELEASE_TRACK = "5-year-lts";
const EXPECTED_RELEASE_CHANNEL = "long-term-support";
const EXPECTED_RELEASE_DATE = "2026-06-19";
const EXPECTED_SUPPORT_HORIZON_YEARS = 5;
const EXPECTED_SUPPORT_UNTIL = "2031-06-19";
const EXPECTED_RELEASE_NAME = `SSH-AI ${EXPECTED_DISPLAY} 5-Year LTS`;

const failures = [];

const files = {
  version: "server/cloud/ssh-ai-shell/version.py",
  config: "server/cloud/ssh-ai-shell/config.py",
  readme: "server/cloud/ssh-ai-shell/README.md",
  aiShell: "server/cloud/ssh-ai-shell/ai_shell.py",
  commands: "server/cloud/ssh-ai-shell/commands.py",
  webPlugin: "server/cloud/ssh-ai-shell/plugins/web_plugin.py",
  install: "server/cloud/ssh-ai-shell/install.sh",
  envExample: "server/cloud/ssh-ai-shell/.env.example",
  sshConfigInstaller: "scripts/install-seis-cloud-ssh-config.mjs"
};

const source = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, readOptional(path)])
);

ensure(source.version.includes(`SSH_AI_VERSION = "${EXPECTED_VERSION}"`), "version.py must define SSH_AI_VERSION 0.4");
ensure(source.version.includes(`SSH_AI_DISPLAY_VERSION = f"v{SSH_AI_VERSION}"`), "version.py must derive display version");
ensure(source.version.includes(`SSH_AI_USER_AGENT = f"SSH-AI/{SSH_AI_VERSION}"`), "version.py must derive user-agent");
ensure(source.version.includes(`SSH_AI_RELEASE_TRACK = "${EXPECTED_RELEASE_TRACK}"`), "version.py must define 5-year LTS release track");
ensure(source.version.includes(`SSH_AI_RELEASE_CHANNEL = "${EXPECTED_RELEASE_CHANNEL}"`), "version.py must define long-term support channel");
ensure(source.version.includes(`SSH_AI_RELEASE_DATE = "${EXPECTED_RELEASE_DATE}"`), "version.py must define 2026-06-19 release date");
ensure(source.version.includes(`SSH_AI_SUPPORT_HORIZON_YEARS = ${EXPECTED_SUPPORT_HORIZON_YEARS}`), "version.py must define 5-year support horizon");
ensure(source.version.includes(`SSH_AI_SUPPORT_UNTIL = "${EXPECTED_SUPPORT_UNTIL}"`), "version.py must define support horizon through 2031-06-19");
ensure(source.version.includes('SSH_AI_RELEASE_NAME = f"SSH-AI {SSH_AI_DISPLAY_VERSION} 5-Year LTS"'), "version.py must derive 5-Year LTS release name");
ensure(source.config.includes("from version import"), "config.py must import version metadata from version.py");
ensure(source.readme.includes(`# SSH-AI Shell ${EXPECTED_DISPLAY}`), "README must expose SSH-AI v0.4");
ensure(source.readme.includes("Version source of truth"), "README must document version source of truth");
ensure(source.readme.includes(EXPECTED_RELEASE_NAME), "README must document 5-Year LTS release name");
ensure(source.readme.includes(EXPECTED_SUPPORT_UNTIL), "README must document 5-year support end date");
ensure(source.aiShell.includes("SSH_AI_RELEASE_NAME"), "ai_shell.py must use shared release name");
ensure(source.commands.includes('if cmd == "/version":'), "commands.py must expose /version");
ensure(source.commands.includes("SSH_AI_RELEASE_NAME"), "commands.py must use shared release name");
ensure(source.commands.includes("SSH_AI_SUPPORT_UNTIL"), "commands.py must expose support horizon");
ensure(source.webPlugin.includes("SSH_AI_USER_AGENT"), "web plugin must use shared user-agent");

if (source.envExample) {
  ensure(source.envExample.includes(`# ${EXPECTED_RELEASE_NAME} environment template`), ".env.example must expose SSH-AI v0.4 5-Year LTS");
  ensure(source.envExample.includes("DAEMON_PORT=7777"), ".env.example must preserve DAEMON_PORT=7777");
  ensure(source.envExample.includes("WS_BRIDGE_PORT=7778"), ".env.example must preserve WS_BRIDGE_PORT=7778");
}

ensure(source.config.includes('DAEMON_PORT = int(os.getenv("DAEMON_PORT", "7777"))'), "config.py must preserve daemon port default 7777");
ensure(source.config.includes('WS_BRIDGE_PORT = int(os.getenv("WS_BRIDGE_PORT", "7778"))'), "config.py must preserve bridge port default 7778");
ensure(source.install.includes("DAEMON_PORT=7777"), "install.sh must preserve daemon port 7777");
ensure(source.install.includes("WS_BRIDGE_PORT=7778"), "install.sh must preserve bridge port 7778");
ensure(source.sshConfigInstaller.includes('const directPort = args["direct-port"] || process.env.SEIS_CLOUD_DIRECT_PORT || "22";'), "SSH config installer must preserve direct SSH port 22 default");
ensure(source.sshConfigInstaller.includes('"Host SEIS-SSH"'), "SSH config installer must preserve SEIS-SSH alias");
ensure(source.sshConfigInstaller.includes('"  HostName github.codespaces"'), "SSH config installer must preserve Codespaces host");

const staleMatches = findTextMatches(SHELL_DIR, [
  "SSH-AI v0.3",
  "SSH-AI/0.3",
  "v0.3"
]);
for (const match of staleMatches) {
  failures.push(`stale v0.3 marker: ${match}`);
}

if (failures.length > 0) {
  console.error("SSH-AI version check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SSH-AI version check passed.");

function readOptional(path) {
  const absolute = join(ROOT, path);
  if (!existsSync(absolute)) return "";
  return readFileSync(absolute, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function findTextMatches(directory, needles) {
  const matches = [];
  for (const file of walk(directory)) {
    if (file.endsWith(".DS_Store") || file.includes("__pycache__")) continue;
    let text = "";
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const needle of needles) {
      if (text.includes(needle)) {
        matches.push(`${relative(ROOT, file)} contains ${needle}`);
      }
    }
  }
  return matches;
}

function walk(directory) {
  const entries = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      entries.push(...walk(path));
    } else if (stat.isFile()) {
      entries.push(path);
    }
  }
  return entries;
}
