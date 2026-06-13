#!/usr/bin/env node

import { spawnSync } from "node:child_process";
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
    pluginRootEnv: "SEIS_CODE_PLUGIN_ROOT",
    mcpServer: "seis-code",
    tools: ["seis_code_status", "seis_code_plan"],
  },
  {
    name: "seis-design",
    displayName: "SEIS-Design",
    marketplaceCategory: "Design",
    pluginRootEnv: "SEIS_DESIGN_PLUGIN_ROOT",
    mcpServer: "seis-design",
    tools: ["seis_design_status", "seis_design_plan"],
  },
  {
    name: "seis-data",
    displayName: "SEIS-DATA",
    marketplaceCategory: "Data",
    pluginRootEnv: "SEIS_DATA_PLUGIN_ROOT",
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

const specialistManifest = validateJsonObject(path.join(ROOT, "data", "seis-specialist-plugins-2026-06-12.json"), "specialist plugin manifest", ["id", "version", "plugins", "marketplace", "centralMcpTools"]);
if (specialistManifest) {
  ensure(Array.isArray(specialistManifest.centralMcpTools), "specialist plugin manifest centralMcpTools must be an array");
  for (const tool of ["seis_specialist_lanes", "seis_specialist_lane_status", "seis_specialist_lane_plan"]) {
    ensure(specialistManifest.centralMcpTools?.includes(tool), `specialist plugin manifest centralMcpTools missing ${tool}`);
  }
}

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
validateCentralMcpSmoke(centralMcp);

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
  validateMcpServerSmoke(pluginRoot, mcpScript, lane, scope);
}

function validateMcpServerSmoke(pluginRoot, mcpScript, lane, scope) {
  if (!fs.existsSync(mcpScript)) {
    return;
  }

  const request = `Validate ${lane.displayName} lane readiness.`;
  const input = [
    frameMcpMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
    frameMcpMessage({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: lane.tools[0], arguments: {} },
    }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: lane.tools[1], arguments: { request } },
    }),
  ].join("");

  const result = spawnSync("node", [mcpScript], {
    cwd: pluginRoot,
    env: smokeEnvironment(lane, pluginRoot),
    input,
    timeout: 5000,
  });

  if (result.error) {
    fail(`${scope} ${lane.name}: MCP smoke failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    fail(`${scope} ${lane.name}: MCP smoke exited ${exitDetail(result)}: ${trimmedOutputText(result.stderr)}`);
    return;
  }

  const responses = parseMcpResponses(result.stdout, `${scope} ${lane.name}`);
  const toolsList = responses.find((message) => message.id === 2)?.result?.tools || [];
  for (const tool of lane.tools) {
    ensure(
      toolsList.some((record) => record.name === tool),
      `${scope} ${lane.name}: MCP tools/list missing ${tool}`
    );
  }

  const statusPayload = responses.find((message) => message.id === 3)?.result;
  ensure(statusPayload?.status === "ready", `${scope} ${lane.name}: MCP status must be ready`);
  ensure(statusPayload?.lane === lane.name, `${scope} ${lane.name}: MCP status lane must match`);
  ensure(statusPayload?.repoMirrorExists === true, `${scope} ${lane.name}: MCP status must see repo mirror`);

  const planPayload = responses.find((message) => message.id === 4)?.result;
  ensure(planPayload?.lane === lane.name, `${scope} ${lane.name}: MCP plan lane must match`);
  ensure(planPayload?.request === request, `${scope} ${lane.name}: MCP plan must echo request`);
  ensure(Array.isArray(planPayload?.steps) && planPayload.steps.length >= 4, `${scope} ${lane.name}: MCP plan must include steps`);
  ensure(Array.isArray(planPayload?.defaultChecks) && planPayload.defaultChecks.length > 0, `${scope} ${lane.name}: MCP plan must include default checks`);
}

function validateCentralMcpSmoke(centralMcp) {
  if (!fs.existsSync(centralMcp)) {
    return;
  }

  const request = "Plan a governed specialist plugin handoff.";
  const input = [
    frameMcpMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
    frameMcpMessage({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "seis_specialist_lanes", arguments: {} },
    }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "seis_specialist_lane_status", arguments: { lane: "seis-code" } },
    }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: { name: "seis_specialist_lane_plan", arguments: { lane: "seis-data", request } },
    }),
  ].join("");

  const result = spawnSync("node", [centralMcp], {
    cwd: ROOT,
    env: { ...process.env, SEIS_ROOT: ROOT },
    input,
    timeout: 5000,
  });

  if (result.error) {
    fail(`central MCP smoke failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    fail(`central MCP smoke exited ${exitDetail(result)}: ${trimmedOutputText(result.stderr)}`);
    return;
  }

  const responses = parseMcpResponses(result.stdout, "central MCP");
  const toolsList = responses.find((message) => message.id === 2)?.result?.tools || [];
  for (const tool of ["seis_specialist_lanes", "seis_specialist_lane_status", "seis_specialist_lane_plan"]) {
    ensure(
      toolsList.some((record) => record.name === tool),
      `central MCP tools/list missing ${tool}`
    );
  }

  const lanesPayload = responses.find((message) => message.id === 3)?.result;
  ensure(lanesPayload?.status === "ready", "central MCP specialist lanes status must be ready");
  ensure(lanesPayload?.laneCount === lanes.length, "central MCP specialist lane count must match");

  const statusPayload = responses.find((message) => message.id === 4)?.result;
  ensure(statusPayload?.id === "seis-code", "central MCP specialist status id must match");
  ensure(statusPayload?.status === "ready", "central MCP specialist status must be ready");

  const planPayload = responses.find((message) => message.id === 5)?.result;
  ensure(planPayload?.lane === "seis-data", "central MCP specialist plan lane must match");
  ensure(planPayload?.request === request, "central MCP specialist plan must echo request");
  ensure(Array.isArray(planPayload?.steps) && planPayload.steps.length >= 4, "central MCP specialist plan must include steps");
}

function frameMcpMessage(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

function smokeEnvironment(lane, pluginRoot) {
  return {
    ...process.env,
    SEIS_ROOT: ROOT,
    SEIS_REPO_ROOT: ROOT,
    [lane.pluginRootEnv]: pluginRoot,
  };
}

function parseMcpResponses(output, label) {
  const responses = [];
  if (!output) {
    fail(`${label}: MCP smoke produced no output`);
    return responses;
  }

  const buffer = Buffer.isBuffer(output) ? output : Buffer.from(String(output), "utf8");
  let cursor = 0;

  while (cursor < buffer.length) {
    const separatorIndex = buffer.indexOf("\r\n\r\n", cursor, "utf8");
    if (separatorIndex < 0) break;
    const header = buffer.subarray(cursor, separatorIndex).toString("utf8");
    const lengthMatch = /Content-Length:\s*(\d+)/i.exec(header);
    if (!lengthMatch) {
      fail(`${label}: malformed MCP response header`);
      break;
    }
    const contentLength = Number.parseInt(lengthMatch[1], 10);
    const bodyStart = separatorIndex + 4;
    const bodyEnd = bodyStart + contentLength;
    const body = buffer.subarray(bodyStart, bodyEnd);
    if (body.length !== contentLength) {
      fail(`${label}: truncated MCP response body`);
      break;
    }
    try {
      responses.push(JSON.parse(body.toString("utf8")));
    } catch {
      fail(`${label}: invalid MCP response JSON`);
      break;
    }
    cursor = bodyEnd;
  }

  ensure(responses.length >= 4, `${label}: MCP smoke should return initialize, tools/list, status, and plan responses`);
  return responses;
}

function outputText(output) {
  if (!output) return "";
  return Buffer.isBuffer(output) ? output.toString("utf8") : String(output);
}

function trimmedOutputText(output) {
  return outputText(output).trim();
}

function exitDetail(result) {
  return result.status ?? result.signal ?? "unknown";
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

  return record;
}

function validateCodeContains(filePath, token, message) {
  if (!fs.existsSync(filePath)) {
    fail(`file not found: ${path.relative(ROOT, filePath)}`);
    return;
  }

  const text = fs.readFileSync(filePath, "utf8");
  ensure(text.includes(token), `${message}: ${path.relative(ROOT, filePath)}`);
}
