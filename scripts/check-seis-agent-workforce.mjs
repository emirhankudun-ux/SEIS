#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  workforceRoster: "SEIS_AGENT_WORKFORCE.md",
  vaultMirror: path.join("seis-brain", "vault", "05_Agents", "Agent Workforce.md"),
  subAgents: "SEIS_SUB_AGENTS.md",
  agentsFolder: path.join("seis-brain", "vault", "05_Agents")
};

ensureDirectory(paths.agentsFolder, "SEIS workforce vault directory");
for (const [label, relativePath] of [
  ["workforceRoster", paths.workforceRoster],
  ["vaultMirror", paths.vaultMirror],
  ["subAgents", paths.subAgents]
]) {
  ensureFile(relativePath, label);
}

const workforceText = readText(paths.workforceRoster, "SEIS agent workforce");
const vaultMirrorText = readText(paths.vaultMirror, "vault workforce mirror");
const subAgentsText = readText(paths.subAgents, "SEIS sub-agent system docs");

const workforceRoles = extractSectionRoles(workforceText, "Workforce model");
const vaultRoles = extractSectionRoles(vaultMirrorText, "Registry of bounded agents for SEIS work");

ensure(workforceRoles.length >= 8, "workforce roster must include at least eight agents");
ensure(vaultRoles.length >= 8, "vault workforce mirror must include at least eight agents");

const workforceSet = new Set(workforceRoles);
const vaultSet = new Set(vaultRoles);

const missingInVault = [...workforceSet].filter((role) => !vaultSet.has(role));
const missingInRoster = [...vaultSet].filter((role) => !workforceSet.has(role));

for (const role of missingInVault) {
  failures.push(`Role ${role} is listed in SEIS_AGENT_WORKFORCE.md but missing from vault mirror.`);
}
for (const role of missingInRoster) {
  failures.push(`Role ${role} is listed in vault mirror but missing from SEIS_AGENT_WORKFORCE.md.`);
}

for (const role of workforceSet) {
  const notePath = path.join(paths.agentsFolder, `${role}.md`);
  ensureFile(notePath, `vault role note ${role}`);
}

ensure(
  workforceText.includes("## Source-of-truth mapping"),
  "SEIS_AGENT_WORKFORCE.md must include Source-of-truth mapping section"
);
ensure(
  workforceText.includes("`SEIS_SUB_AGENTS.md`"),
  "SEIS_AGENT_WORKFORCE.md must reference SEIS_SUB_AGENTS.md"
);
ensure(
  workforceText.includes("`seis-brain/vault/05_Agents/Agent Workforce.md`"),
  "SEIS_AGENT_WORKFORCE.md must reference the vault mirror path"
);
ensure(
  vaultMirrorText.includes("`SEIS_AGENT_WORKFORCE.md`"),
  "vault mirror must reference SEIS_AGENT_WORKFORCE.md"
);
ensure(
  subAgentsText.includes("SEIS_AGENT_WORKFORCE.md"),
  "SEIS_SUB_AGENTS.md must reference SEIS_AGENT_WORKFORCE.md"
);
ensure(
  subAgentsText.includes("seis-brain/vault/05_Agents/Agent Workforce.md"),
  "SEIS_SUB_AGENTS.md must reference vault mirror path"
);

if (failures.length > 0) {
  console.error("SEIS Agent workforce check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Agent workforce check passed.");

function extractSectionRoles(text, sectionTitle) {
  const lines = text.split(/\r?\n/);
  const normalizedTitle = sectionTitle.trim().toLowerCase();
  const startsWithMarker = (line) => {
    const trimmed = line.trim().toLowerCase();
    return (
      trimmed.startsWith(`## ${normalizedTitle}`) ||
      trimmed === normalizedTitle ||
      trimmed.startsWith(`${normalizedTitle}:`)
    );
  };

  const startLine = lines.findIndex(startsWithMarker);
  if (startLine < 0) {
    failures.push(`Section "${sectionTitle}" not found`);
    return [];
  }
  const items = [];
  const seen = new Set();
  for (let index = startLine + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (/^#+\s/.test(line)) break;
    const match = line.match(/^-\s*`([^`]+)`/);
    if (!match) continue;
    const role = normalizeRole(match[1]);
    if (!role || seen.has(role)) continue;
    seen.add(role);
    items.push(role);
  }
  return items;
}

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativeOrAbsolutePath, label) {
  const filePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(root, relativeOrAbsolutePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function ensureDirectory(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isDirectory()) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function readText(relativePath, label) {
  const absolutePath = path.join(root, relativePath);
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    failures.push(`Unable to read ${label}: ${error.message}`);
    return "";
  }
}
