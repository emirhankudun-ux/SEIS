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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const profile = readJson(profilePath);
const manifest = readJson(manifestPath);
const mcp = readJson(mcpPath);

console.log(JSON.stringify({
  plugin: manifest.name,
  version: manifest.version,
  lane: profile.lane,
  status: "ready",
  skill: fs.existsSync(path.join(pluginRoot, "skills", "seis-design", "SKILL.md")),
  mcpServer: Boolean(mcp.mcpServers?.["seis-design"]),
  qualityCommands: profile.qualityCommands,
}, null, 2));
