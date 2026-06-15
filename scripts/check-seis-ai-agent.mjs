#!/usr/bin/env node
import { spawnSync } from "node:child_process";
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
const identities = readJson("data/seis-operating-identities.json");
ensure(manifest?.name === "seis-ai-agent", "manifest name must be seis-ai-agent");
ensure(manifest?.mcpServers === "./.mcp.json", "manifest must reference ./.mcp.json");
ensure(manifest?.interface?.capabilities?.includes("Unified SEIS orchestration"), "manifest must expose unified orchestration");
ensure(manifest?.interface?.displayName === "SEIS-Agent", "manifest display name must be SEIS-Agent");
ensure(manifest?.interface?.capabilities?.includes("Memory and context governance"), "manifest must expose memory and context governance");
ensure(profile?.displayName === "SEIS-Agent", "profile display name must be SEIS-Agent");
ensure(profile?.aliases?.includes("SEIS-AI Agent"), "profile must preserve SEIS-AI Agent alias");
ensure(profile?.installId === "seis-ai-agent@seis-repo", "profile install id must use seis-repo");
for (const name of ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]) ensure(profile?.composedPlugins?.includes(name), `profile missing ${name}`);
for (const platform of ["macos", "windows", "linux"]) ensure(profile?.terminalInstall?.platforms?.includes(platform), `profile missing ${platform}`);
ensure(profile?.websiteRoadmap?.direction?.includes("Cinematic"), "website roadmap must preserve cinematic direction");
ensure((identities?.identities || []).some((identity) => identity.name === "SEIS-Agent" && identity.repoSurface === "plugins/seis-ai-agent"), "operating identities must map SEIS-Agent to plugin");
ensure(mcp?.mcpServers?.["seis-ai-agent"]?.args?.[0] === "./scripts/seis-ai-agent-mcp-server.mjs", "MCP manifest must point at server");
ensure(marketplace?.plugins?.some((plugin) => plugin.name === "seis-ai-agent" && plugin.source?.path === "./plugins/seis-ai-agent"), "marketplace must include seis-ai-agent");
contains("scripts/install-seis-ai-agent.mjs", "seis-ai-agent@seis-repo", "installer must include repo install id");
contains("scripts/install-seis-ai-agent.mjs", "plan-only", "installer must default to plan-only");
contains("docs/platform/seis-ai-agent.md", "macOS", "platform doc must mention macOS");
contains("docs/platform/seis-ai-agent.md", "Windows", "platform doc must mention Windows");
contains("docs/platform/seis-ai-agent.md", "Linux", "platform doc must mention Linux");
contains("docs/platform/seis-ai-agent.md", "SEIS-Agent", "platform doc must use SEIS-Agent identity");
contains("docs/platform/seis-ai-agent.md", "Consolidation Rule", "platform doc must define consolidation rule");
contains("plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs", "seis_ai_agent_status", "MCP server must expose status tool");
contains("plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs", "SEIS-Data: memory, context systems", "MCP server must route memory/context through SEIS-Data");
validateInstallerPlan([], false);
validateInstallerPlan(["--with-lanes"], true);
validateMcpSmoke();
if (failures.length) { console.error("SEIS-AI Agent check failed:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("SEIS-AI Agent check passed.");
function ensure(condition, message) { if (!condition) failures.push(message); }
function readJson(file) { try { return JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch { failures.push(`invalid JSON: ${file}`); return null; } }
function contains(file, token, message) { if (fs.existsSync(path.join(root, file))) ensure(fs.readFileSync(path.join(root, file), "utf8").includes(token), message); }
function validateInstallerPlan(extraArgs, expectStandaloneTargets) {
  const result = spawnSync(process.execPath, ["scripts/install-seis-ai-agent.mjs", ...extraArgs], { cwd: root, encoding: "utf8", timeout: 5000 });
  if (result.error) {
    failures.push(`installer plan failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    failures.push(`installer plan exited ${result.status}: ${String(result.stderr || "").trim()}`);
    return;
  }
  let payload;
  try {
    payload = JSON.parse(result.stdout);
  } catch {
    failures.push("installer plan must emit JSON");
    return;
  }
  const targets = payload?.readiness?.targets || [];
  ensure(payload?.mode === "plan-only", "installer must default to plan-only");
  ensure(targets[0] === "seis-ai-agent@seis-repo", "installer first target must be seis-ai-agent@seis-repo");
  ensure(payload?.readiness?.primaryInstallId === "seis-ai-agent@seis-repo", "installer readiness must expose primary install id");
  ensure(payload?.readiness?.consolidationPolicy?.includes("default installs only SEIS-Agent"), "installer must document consolidation policy");
  const standaloneTargets = ["seis@seis-repo", "seis-cloud@seis-repo", "seis-code@seis-repo", "seis-design@seis-repo", "seis-data@seis-repo"];
  for (const target of standaloneTargets) {
    ensure(targets.includes(target) === expectStandaloneTargets, `installer target ${target} must be ${expectStandaloneTargets ? "included with --with-lanes" : "excluded by default"}`);
  }
}
function frame(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}
function parseResponses(stdout) {
  const responses = [];
  let buffer = Buffer.from(stdout);
  while (buffer.length > 0) {
    const separator = buffer.indexOf("\r\n\r\n");
    if (separator < 0) break;
    const header = buffer.slice(0, separator).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) break;
    const start = separator + 4;
    const end = start + Number(match[1]);
    if (buffer.length < end) break;
    responses.push(JSON.parse(buffer.slice(start, end).toString("utf8")));
    buffer = buffer.slice(end);
  }
  return responses;
}
function validateMcpSmoke() {
  const server = path.join(root, "plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs");
  if (!fs.existsSync(server)) return;
  const input = [
    frame({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
    frame({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    frame({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_ai_agent_status", arguments: {} } }),
    frame({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_ai_agent_plan", arguments: { request: "Plan memory context governance." } } }),
  ].join("");
  const result = spawnSync("node", [server], { cwd: root, input, timeout: 5000 });
  if (result.error) {
    failures.push(`MCP smoke failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    failures.push(`MCP smoke exited ${result.status}: ${String(result.stderr || "").trim()}`);
    return;
  }
  const responses = parseResponses(result.stdout);
  const tools = responses.find((response) => response.id === 2)?.result?.tools || [];
  ensure(tools.some((tool) => tool.name === "seis_ai_agent_status"), "MCP tools/list must include status");
  ensure(responses.find((response) => response.id === 3)?.result?.identity === "SEIS-Agent", "MCP status must report SEIS-Agent identity");
  const plan = responses.find((response) => response.id === 4)?.result;
  ensure(plan?.lanes?.some((lane) => String(lane).includes("SEIS-Data: memory, context systems")), "MCP plan must route memory/context through SEIS-Data");
}
