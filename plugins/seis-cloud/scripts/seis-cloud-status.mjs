#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(process.argv[2] || path.join(scriptDir, ".."));
const profilePath = path.join(pluginRoot, "assets", "lane-profile.json");
const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
const mcpPath = path.join(pluginRoot, ".mcp.json");
const repoRoot = findRepoRoot();
const accessPolicyPath = repoRoot ? path.join(repoRoot, "deploy", "cloud-access-policy.json") : null;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const profile = readJson(profilePath);
const manifest = readJson(manifestPath);
const mcp = readJson(mcpPath);
const accessPolicy = accessPolicyPath && fs.existsSync(accessPolicyPath) ? readJson(accessPolicyPath) : null;

console.log(JSON.stringify({
  plugin: manifest.name,
  version: manifest.version,
  lane: profile.lane,
  status: "ready",
  repoRoot,
  skill: fs.existsSync(path.join(pluginRoot, "skills", "seis-cloud", "SKILL.md")),
  mcpServer: Boolean(mcp.mcpServers?.["seis-cloud"]),
  accessPolicy: accessPolicy ? {
    publicCloud: accessPolicy.publicCloud,
    teamVpnCloud: accessPolicy.teamVpnCloud
  } : null,
  qualityCommands: profile.qualityCommands,
}, null, 2));

function findRepoRoot() {
  const home = process.env.HOME || "";
  const candidates = [
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.join(home, "Library", "Mobile Documents", "com~apple~CloudDocs", "Github", "SEIS"),
    path.resolve(pluginRoot, "..", "SEIS"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "deploy", "cloud-access-policy.json"))) {
      return path.resolve(candidate);
    }
  }

  return null;
}
