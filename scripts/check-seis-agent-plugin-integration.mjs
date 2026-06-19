#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const manifestPath = path.join(root, "content", "development", "seis-agent-plugin-integration.json");
const docsPath = path.join(root, "docs", "platform", "seis-agent-plugin-integration.md");
const packagePath = path.join(root, "package.json");
const toolsPath = path.join(root, "packages", "seis-ai", "src", "agent", "tools.mjs");
const loopPath = path.join(root, "packages", "seis-ai", "src", "agent", "loop.mjs");
const mcpPath = path.join(root, "packages", "seis-ai", "src", "mcp", "server.mjs");
const helperPath = path.join(root, "packages", "seis-ai", "src", "lib", "plugin-integration.mjs");
const webIndexPath = path.join(root, "apps", "seis-demo-web", "index.html");
const webScriptPath = path.join(root, "apps", "seis-demo-web", "script.js");
const serviceWorkerPath = path.join(root, "apps", "seis-demo-web", "service-worker.js");

const requiredPersonalPlugins = [
  "seis@personal",
  "seis-cloud@personal",
  "seis-code@personal",
  "seis-design@personal",
  "seis-data@personal"
];
const requiredLanes = ["seis", "seis-governance", "seis-cloud", "seis-code", "seis-design", "seis-data"];

for (const [filePath, label] of [
  [manifestPath, "plugin integration manifest"],
  [docsPath, "plugin integration docs"],
  [packagePath, "package.json"],
  [toolsPath, "SEIS AI tool loop"],
  [loopPath, "SEIS AI loop"],
  [mcpPath, "SEIS AI MCP server"],
  [helperPath, "SEIS AI plugin integration helper"],
  [webIndexPath, "SEIS demo index"],
  [webScriptPath, "SEIS demo script"],
  [serviceWorkerPath, "SEIS demo service worker"]
]) {
  ensureFile(filePath, label);
}

const manifest = readJson(manifestPath, "plugin integration manifest");
const packageJson = readJson(packagePath, "package.json");
const docs = readText(docsPath, "plugin integration docs");
const tools = readText(toolsPath, "SEIS AI tool loop");
const loop = readText(loopPath, "SEIS AI loop");
const mcp = readText(mcpPath, "SEIS AI MCP server");
const webIndex = readText(webIndexPath, "SEIS demo index");
const webScript = readText(webScriptPath, "SEIS demo script");
const serviceWorker = readText(serviceWorkerPath, "SEIS demo service worker");

if (manifest) {
  ensure(manifest.id === "seis-agent-plugin-integration", "manifest id must be seis-agent-plugin-integration");
  ensure(manifest.status === "active", "manifest status must be active");
  ensure(manifest.primaryInstallId === "seis-ai-agent@seis-repo", "manifest must bind to seis-ai-agent@seis-repo");
  ensure(manifest.canonicalAgent?.publishedPlugin === "seis-ai-agent", "manifest must publish only seis-ai-agent");
  ensure(manifest.canonicalAgent?.standaloneLaneInstallMode === "disabled", "standalone lane install mode must stay disabled");
  ensure(manifest.auditedSnapshot?.installedEnabledCount === 185, "manifest must record the 2026-06-19 installed-enabled count");
  ensure(manifest.auditedSnapshot?.notInstalledCount === 5, "manifest must record the 2026-06-19 not-installed count");
  ensure(manifest.auditedSnapshot?.authenticationClaim === "not-claimed", "manifest must not claim connector authentication readiness");
  ensureArrayIncludesAll(manifest.auditedSnapshot?.personalPluginsInstalledEnabled, requiredPersonalPlugins, "auditedSnapshot.personalPluginsInstalledEnabled");
  ensureArrayIncludesAll((manifest.personalPlugins || []).map((plugin) => plugin.id), requiredPersonalPlugins, "personalPlugins");
  ensureArrayIncludesAll((manifest.lanes || []).map((lane) => lane.id), requiredLanes, "lanes");
  ensure(manifest.helperPluginUniverse?.uniquePlugins === 300, "helper plugin universe must keep the requested unique plugin count");
  ensure(manifest.runtimeIntegration?.toolLoopTool === "seis_plugin_integration", "runtimeIntegration must expose the tool-loop tool");
  ensure(manifest.runtimeIntegration?.mcpTool === "seis_plugin_integration", "runtimeIntegration must expose the MCP tool");
  ensure(manifest.runtimeIntegration?.mcpResource === "seis://agent/plugin-integration.json", "runtimeIntegration must expose the MCP resource");
  ensureArrayIncludesAll(manifest.qualityCommands, [
    "npm run check:seis-agent-plugin-integration",
    "npm run check:seis-ai-agent",
    "npm run check:seis-specialist-plugins",
    "npm test --prefix packages/seis-ai"
  ], "qualityCommands");

  for (const plugin of manifest.personalPlugins || []) {
    ensureFile(path.join(root, plugin.sourceMirror || ""), `${plugin.id} source mirror`);
    ensureFile(path.join(root, plugin.embeddedSkill || ""), `${plugin.id} embedded skill`);
  }

  for (const lane of manifest.lanes || []) {
    ensureFile(path.join(root, lane.embeddedSkill || ""), `${lane.id} embedded skill`);
    ensure(Array.isArray(lane.mcpTools) && lane.mcpTools.length >= 2, `${lane.id} must expose MCP tools`);
  }
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-agent-plugin-integration"] === "node scripts/check-seis-agent-plugin-integration.mjs",
    "package.json must expose check:seis-agent-plugin-integration"
  );
}

for (const [text, label] of [
  [docs, "docs"],
  [tools, "tool loop"],
  [loop, "agent loop"],
  [mcp, "MCP server"],
  [webScript, "web script"]
]) {
  ensure(text.includes("seis_plugin_integration"), `${label} must reference seis_plugin_integration`);
}

for (const token of [
  "seis-agent-plugin-integration.json",
  "seis-ai-agent@seis-repo",
  "seis@personal",
  "seis-cloud@personal",
  "seis-code@personal",
  "seis-design@personal",
  "seis-data@personal"
]) {
  ensure(docs.includes(token), `docs missing ${token}`);
}

for (const token of [
  "SEIS-Agent plugin integration",
  "npm run check:seis-agent-plugin-integration",
  "seis-cloud",
  "seis-code",
  "seis-design",
  "seis-data"
]) {
  ensure(webScript.includes(token), `web script missing ${token}`);
}

ensure(webIndex.includes("plugin fabric"), "web index must expose plugin fabric copy");
ensure(serviceWorker.includes("seis-demo-web-v17"), "service worker cache must be bumped for app integration changes");

if (failures.length > 0) {
  console.error("SEIS-Agent plugin integration check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS-Agent plugin integration check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
    return;
  }
  if (!fs.statSync(filePath).isFile() && !fs.statSync(filePath).isDirectory()) {
    failures.push(`${label} is not readable: ${path.relative(root, filePath)}`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(filePath, label) {
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}
