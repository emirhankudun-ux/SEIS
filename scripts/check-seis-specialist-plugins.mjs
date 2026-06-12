#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const args = parseArgs(process.argv.slice(2));
const checkLocal = args["no-local"] !== true;
const failures = [];

const lanes = [
  {
    name: "seis-code",
    displayName: "SEIS-Code",
    marketplaceCategory: "Developer",
    mcpServer: "seis-code",
    tools: ["seis_code_status", "seis_code_plan"],
  },
  {
    name: "seis-design",
    displayName: "SEIS-Design",
    marketplaceCategory: "Design",
    mcpServer: "seis-design",
    tools: ["seis_design_status", "seis_design_plan"],
  },
  {
    name: "seis-data",
    displayName: "SEIS-DATA",
    marketplaceCategory: "Data",
    mcpServer: "seis-data",
    tools: ["seis_data_status", "seis_data_plan"],
  },
];

if (args.help) {
  console.log(`
Usage:
  node scripts/check-seis-specialist-plugins.mjs [options]

Options:
  --no-local   Skip local plugin root and personal marketplace checks
  --help       Show usage
`);
  process.exit(0);
}

for (const lane of lanes) {
  validatePluginRoot(path.join(ROOT, "plugins", lane.name), lane, "repo");
  if (checkLocal) {
    validatePluginRoot(path.join(homeDir(), "plugins", lane.name), lane, "local");
  }
}

validateJsonObject(path.join(ROOT, "data", "seis-specialist-plugins-2026-06-12.json"), "specialist plugin manifest", ["id", "version", "plugins", "marketplace"]);

const centralMcp = path.join(ROOT, "mcp", "seis-mcp-server.mjs");
ensureFile(centralMcp, "central SEIS MCP server");
for (const token of [
  "seis_specialist_lanes",
  "seis_specialist_lane_status",
  "seis_specialist_lane_plan",
  ...lanes.flatMap((lane) => lane.tools),
]) {
  validateCodeContains(centralMcp, token, `central MCP server must expose ${token}`);
}

if (checkLocal) {
  validateMarketplace();
}

if (failures.length > 0) {
  console.error("SEIS specialist plugin check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS specialist plugin check passed.");

function validatePluginRoot(pluginRoot, lane, scope) {
  ensureDir(pluginRoot, `${scope} ${lane.name} plugin root`);
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const mcpPath = path.join(pluginRoot, ".mcp.json");
  const skillPath = path.join(pluginRoot, "skills", lane.name, "SKILL.md");
  const openaiYamlPath = path.join(pluginRoot, "skills", lane.name, "agents", "openai.yaml");
  const profilePath = path.join(pluginRoot, "assets", "lane-profile.json");
  const readmePath = path.join(pluginRoot, "README.md");
  const statusScript = path.join(pluginRoot, "scripts", `${lane.name}-status.mjs`);
  const mcpScript = path.join(pluginRoot, "scripts", `${lane.name}-mcp-server.mjs`);

  for (const [filePath, label] of [
    [manifestPath, `${scope} ${lane.name} plugin manifest`],
    [mcpPath, `${scope} ${lane.name} MCP manifest`],
    [skillPath, `${scope} ${lane.name} skill`],
    [openaiYamlPath, `${scope} ${lane.name} openai metadata`],
    [profilePath, `${scope} ${lane.name} lane profile`],
    [readmePath, `${scope} ${lane.name} README`],
    [statusScript, `${scope} ${lane.name} status script`],
    [mcpScript, `${scope} ${lane.name} MCP server script`],
  ]) {
    ensureFile(filePath, label);
  }

  const manifest = readJson(manifestPath);
  if (manifest) {
    ensure(manifest.name === lane.name, `${scope} ${lane.name}: manifest name must match`);
    ensure(manifest.mcpServers === "./.mcp.json", `${scope} ${lane.name}: manifest must reference .mcp.json`);
    ensure(manifest.interface?.displayName === lane.displayName, `${scope} ${lane.name}: displayName must be ${lane.displayName}`);
    ensure(Array.isArray(manifest.interface?.capabilities) && manifest.interface.capabilities.length >= 5, `${scope} ${lane.name}: capabilities must be meaningful`);
    ensure(Array.isArray(manifest.interface?.defaultPrompt) && manifest.interface.defaultPrompt.length > 0, `${scope} ${lane.name}: defaultPrompt must be present`);
  }

  const mcp = readJson(mcpPath);
  if (mcp) {
    ensure(mcp.mcpServers?.[lane.mcpServer]?.command === "node", `${scope} ${lane.name}: MCP server command must be node`);
    ensure(Array.isArray(mcp.mcpServers?.[lane.mcpServer]?.args), `${scope} ${lane.name}: MCP server args must be an array`);
  }

  const profile = readJson(profilePath);
  if (profile) {
    ensure(profile.id === lane.name, `${scope} ${lane.name}: profile id must match`);
    ensure(Array.isArray(profile.qualityCommands) && profile.qualityCommands.length > 0, `${scope} ${lane.name}: profile must define quality commands`);
  }

  for (const tool of lane.tools) {
    validateCodeContains(mcpScript, tool, `${scope} ${lane.name}: MCP script must expose ${tool}`);
  }
}

function validateMarketplace() {
  const marketplacePath = path.join(homeDir(), ".agents", "plugins", "marketplace.json");
  const marketplace = readJson(marketplacePath);
  if (!marketplace) {
    fail(`marketplace missing or invalid: ${marketplacePath}`);
    return;
  }

  for (const lane of lanes) {
    const entry = marketplace.plugins?.find((plugin) => plugin.name === lane.name);
    ensure(entry, `marketplace entry missing: ${lane.name}`);
    if (!entry) continue;
    ensure(entry.source?.source === "local", `marketplace ${lane.name}: source must be local`);
    ensure(entry.source?.path === `./plugins/${lane.name}`, `marketplace ${lane.name}: path must be ./plugins/${lane.name}`);
    ensure(entry.policy?.installation === "AVAILABLE", `marketplace ${lane.name}: installation must be AVAILABLE`);
    ensure(entry.policy?.authentication === "ON_INSTALL", `marketplace ${lane.name}: authentication must be ON_INSTALL`);
    ensure(entry.category === lane.marketplaceCategory, `marketplace ${lane.name}: category must be ${lane.marketplaceCategory}`);
  }
}

function parseArgs(argv) {
  const result = {};
  for (const token of argv) {
    if (token === "--no-local") result["no-local"] = true;
    if (token === "--help") result.help = true;
  }
  return result;
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function ensureDir(candidate, label) {
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isDirectory()) {
    fail(`${label} not found: ${candidate}`);
  }
}

function ensureFile(candidate, label) {
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    fail(`${label} missing: ${candidate}`);
  }
}

function fail(message) {
  failures.push(message);
}

function homeDir() {
  return process.env.HOME || "/Users/emirhankudun";
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    fail(`invalid JSON: ${filePath}`);
    return null;
  }
}

function validateJsonObject(filePath, label, requiredKeys = []) {
  const record = readJson(filePath);
  if (!record || typeof record !== "object") {
    fail(`${label} must be a JSON object: ${path.relative(ROOT, filePath)}`);
    return;
  }

  for (const key of requiredKeys) {
    ensure(record[key] !== undefined, `${label}: key '${key}' is missing`);
  }
}

function validateCodeContains(filePath, token, message) {
  if (!fs.existsSync(filePath)) {
    fail(`file not found: ${path.relative(ROOT, filePath)}`);
    return;
  }

  const text = fs.readFileSync(filePath, "utf8");
  ensure(text.includes(token), `${message}: ${path.relative(ROOT, filePath)}`);
}
