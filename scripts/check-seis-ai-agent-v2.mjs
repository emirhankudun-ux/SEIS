#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];
run("distribution", ["scripts/check-seis-general-plugin-distribution.mjs"]);
run("release policy", ["scripts/check-seis-public-plugin-release-policy.mjs"]);
run("unified suite", ["scripts/create-seis-general-unified-suite.mjs", "--check"]);
run("MCP smoke", ["plugins/seis-ai-agent/scripts/seis-general-plugin-mcp-server.mjs", "--smoke"]);

const manifest = readJson("plugins/seis-ai-agent/.codex-plugin/plugin.json");
const mcp = readJson("plugins/seis-ai-agent/.mcp.json");
const profile = readJson("plugins/seis-ai-agent/assets/agent-profile.json");
ensure(manifest?.name === "seis-ai-agent" && manifest?.version === "0.4.0+codex.20260722", "SEIS-Agent manifest identity/version is invalid");
ensure(mcp?.mcpServers?.["seis-ai-agent"]?.args?.includes("./scripts/seis-general-plugin-mcp-server.mjs"), "SEIS-Agent must use the v2 general-plugin MCP server");
ensure(profile?.publicGeneralPluginFinder?.tool === "seis_general_plugin_find", "SEIS-Agent must expose the general-plugin finder");
ensure(profile?.terminalInstall?.generalPluginSelection?.maximumGeneralPluginSelectionsPerTask === 1, "SEIS-Agent terminal selection boundary is invalid");
ensure(profile?.terminalInstall?.optionalJourneySelection === undefined && profile?.publicBundleFinder === undefined, "SEIS-Agent profile must not retain legacy public-bundle selectors");

if (failures.length) {
  console.error("SEIS-Agent v2 check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("SEIS-Agent v2 check passed.");

function run(label, args) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) failures.push(`${label} failed: ${result.stderr.trim() || result.stdout.trim()}`);
}
function ensure(condition, message) { if (!condition) failures.push(message); }
function readJson(relativePath) {
  try { return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")); } catch { failures.push(`invalid or missing JSON: ${relativePath}`); return null; }
}
