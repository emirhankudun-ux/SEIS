#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const required = [
  "plugins/seis-ai-agent/.codex-plugin/plugin.json",
  "plugins/seis-ai-agent/.mcp.json",
  "plugins/seis-ai-agent/assets/agent-profile.json",
  "plugins/seis-ai-agent/skills/seis-ai-agent/SKILL.md",
  "plugins/seis-ai-agent/README.md",
  "plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs",
  "scripts/install-seis-ai-agent.mjs",
  "docs/platform/seis-ai-agent.md",
  "install/seis-ai-agent/install.sh",
  "install/seis-ai-agent/install.ps1",
  ".agents/plugins/marketplace.json",
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) failures.push(`missing file: ${file}`);
const manifest = readJson("plugins/seis-ai-agent/.codex-plugin/plugin.json");
const profile = readJson("plugins/seis-ai-agent/assets/agent-profile.json");
const mcp = readJson("plugins/seis-ai-agent/.mcp.json");
const marketplace = readJson(".agents/plugins/marketplace.json");
ensure(manifest?.name === "seis-ai-agent", "manifest name must be seis-ai-agent");
ensure(manifest?.mcpServers === "./.mcp.json", "manifest must reference ./.mcp.json");
ensure(manifest?.interface?.capabilities?.includes("Unified SEIS orchestration"), "manifest must expose unified orchestration");
ensure(profile?.installId === "seis-ai-agent@seis-repo", "profile install id must use seis-repo");
for (const name of ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]) ensure(profile?.composedPlugins?.includes(name), `profile missing ${name}`);
for (const platform of ["macos", "windows", "linux"]) ensure(profile?.terminalInstall?.platforms?.includes(platform), `profile missing ${platform}`);
ensure(profile?.websiteRoadmap?.direction?.includes("Cinematic"), "website roadmap must preserve cinematic direction");
ensure(mcp?.mcpServers?.["seis-ai-agent"]?.args?.[0] === "./scripts/seis-ai-agent-mcp-server.mjs", "MCP manifest must point at server");
ensure(marketplace?.plugins?.some((plugin) => plugin.name === "seis-ai-agent" && plugin.source?.path === "./plugins/seis-ai-agent"), "marketplace must include seis-ai-agent");
contains("scripts/install-seis-ai-agent.mjs", "seis-ai-agent@seis-repo", "installer must include repo install id");
contains("docs/platform/seis-ai-agent.md", "macOS", "platform doc must mention macOS");
contains("docs/platform/seis-ai-agent.md", "Windows", "platform doc must mention Windows");
contains("docs/platform/seis-ai-agent.md", "Linux", "platform doc must mention Linux");
if (failures.length) { console.error("SEIS-AI Agent check failed:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("SEIS-AI Agent check passed.");
function ensure(condition, message) { if (!condition) failures.push(message); }
function readJson(file) { try { return JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch { failures.push(`invalid JSON: ${file}`); return null; } }
function contains(file, token, message) { if (fs.existsSync(path.join(root, file))) ensure(fs.readFileSync(path.join(root, file), "utf8").includes(token), message); }
