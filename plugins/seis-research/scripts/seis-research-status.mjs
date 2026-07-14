#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const LANE_ID = "seis-research";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(process.argv[2] || path.join(scriptDir, ".."));
const repoRoot = findRepoRoot();
const profile = readJson(path.join(pluginRoot, "assets", "lane-profile.json"));
const manifest = readJson(path.join(pluginRoot, ".codex-plugin", "plugin.json"));
const mcp = readJson(path.join(pluginRoot, ".mcp.json"));
const agentProfile = repoRoot ? readJson(path.join(repoRoot, "plugins", "seis-ai-agent", "assets", "agent-profile.json")) : null;

console.log(JSON.stringify({
  plugin: manifest.name,
  version: manifest.version,
  lane: profile.lane,
  status: "ready",
  repoRoot,
  skill: fs.existsSync(path.join(pluginRoot, "skills", LANE_ID, "SKILL.md")),
  mcpServer: Boolean(mcp.mcpServers?.[LANE_ID]),
  connectedToSeisAi: Boolean(agentProfile?.composedLanes?.includes(LANE_ID) && agentProfile?.consolidationPolicy?.embeddedSkills?.includes(LANE_ID)),
  qualityCommands: profile.qualityCommands,
}, null, 2));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function findRepoRoot() {
  const candidates = [
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.resolve(pluginRoot, "..", ".."),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "package.json"))) return path.resolve(candidate);
  }
  return null;
}
