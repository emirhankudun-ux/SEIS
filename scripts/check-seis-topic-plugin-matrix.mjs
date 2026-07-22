#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  TOPIC_PLUGIN_SOURCE_ROOT,
  TOPIC_PLUGIN_TARGET,
  assertTopicObjective,
  flattenTopicObjective,
  readTopicObjective,
} from "../plugins/seis-topics/runtime/topic-definitions.mjs";
import { buildSeisPublicTopicBundles } from "./lib/seis-public-bundle-plan.mjs";

const root = process.cwd();
const runMcpSmoke = process.argv.includes("--mcp-smoke");
const objective = readTopicObjective(root);
const topics = flattenTopicObjective(objective);
const failures = [];
assertTopicObjective(objective, topics);
const topicBundles = buildSeisPublicTopicBundles({
  topicPlugins: topics.map((topic) => ({ name: topic.id, displayName: topic.displayName, sourcePath: topic.sourcePath, category: topic.category })),
});
const topicBundleByMember = new Map(topicBundles.flatMap((bundle) => bundle.members.map((member) => [member.name, bundle.id])));
ensure(topicBundles.length === 27 && topicBundleByMember.size === TOPIC_PLUGIN_TARGET, "topic bundle coverage must contain 27 cards and 300 exact-once members");

const sourceRoot = path.join(root, TOPIC_PLUGIN_SOURCE_ROOT);
const actualDirectories = fs.existsSync(sourceRoot)
  ? fs.readdirSync(sourceRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory() && entry.name !== "runtime").map((entry) => entry.name).sort()
  : [];
const expectedDirectories = topics.map((topic) => topic.id).sort();
ensure(actualDirectories.length === TOPIC_PLUGIN_TARGET, `topic directory count must be ${TOPIC_PLUGIN_TARGET}; found ${actualDirectories.length}`);
ensure(JSON.stringify(actualDirectories) === JSON.stringify(expectedDirectories), "topic directories must exactly match the objective-derived IDs");

for (const topic of topics) {
  const pluginRoot = path.join(root, TOPIC_PLUGIN_SOURCE_ROOT, topic.id);
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const mcpPath = path.join(pluginRoot, ".mcp.json");
  const profilePath = path.join(pluginRoot, "assets", "topic-profile.json");
  const skillPath = path.join(pluginRoot, "skills", topic.id, "SKILL.md");
  const readmePath = path.join(pluginRoot, "README.md");
  const runtimePath = path.join(pluginRoot, "runtime", "topic-plugin-runtime.mjs");
  const mcpScriptPath = path.join(pluginRoot, "scripts", `${topic.id}-mcp-server.mjs`);
  for (const [filePath, label] of [
    [manifestPath, "manifest"],
    [mcpPath, "MCP manifest"],
    [profilePath, "topic profile"],
    [skillPath, "skill"],
    [readmePath, "README"],
    [runtimePath, "runtime"],
    [mcpScriptPath, "MCP script"],
  ]) ensure(fs.existsSync(filePath), `${topic.id}: ${label} is missing`);

  const manifest = readJson(manifestPath, topic.id);
  const mcp = readJson(mcpPath, topic.id);
  const profile = readJson(profilePath, topic.id);
  const readme = fs.readFileSync(readmePath, "utf8");
  const marketplaceBundleId = topicBundleByMember.get(topic.id);
  const marketplaceInstallId = `${marketplaceBundleId}@seis-repo`;
  ensure(manifest?.name === topic.id, `${topic.id}: manifest name must match`);
  ensure(manifest?.license === "MIT", `${topic.id}: manifest license must be MIT`);
  ensure(manifest?.version === "0.1.0", `${topic.id}: manifest version must be 0.1.0`);
  ensure(manifest?.mcpServers === "./.mcp.json", `${topic.id}: manifest must reference .mcp.json`);
  ensure(Array.isArray(manifest?.interface?.capabilities) && manifest.interface.capabilities.length >= 5, `${topic.id}: capabilities must be meaningful`);
  ensure(profile?.id === topic.id, `${topic.id}: profile id must match`);
  ensure(profile?.sourcePath === topic.sourcePath, `${topic.id}: profile source path must match`);
  ensure(profile?.sourceText === topic.sourceText, `${topic.id}: profile source text must match the objective`);
  ensure(profile?.categoryId === topic.categoryId, `${topic.id}: profile category id must match`);
  ensure(profile?.license === "MIT", `${topic.id}: profile license must be MIT`);
  ensure(profile?.publicAudience === "everyone", `${topic.id}: profile audience must be everyone`);
  ensure(profile?.publicMarketplace === true, `${topic.id}: profile must be public marketplace available`);
  ensure(profile?.schemaVersion === 2, `${topic.id}: profile schema version must be 2`);
  ensure(profile?.marketplaceDiscoverable === true, `${topic.id}: source must be discoverable through the curated marketplace`);
  ensure(profile?.marketplaceCard === false, `${topic.id}: retained source must not be a direct marketplace card`);
  ensure(profile?.marketplaceBundleId === marketplaceBundleId, `${topic.id}: source must name its exact topic bundle`);
  ensure(profile?.installId === marketplaceInstallId, `${topic.id}: install id must resolve through its exact topic bundle`);
  ensure(profile?.installId !== `${topic.id}@seis-repo`, `${topic.id}: retained source must not expose a self-named marketplace install id`);
  ensure(readme.includes(`\`${marketplaceInstallId}\``), `${topic.id}: README must name the exact topic bundle install id`);
  ensure(profile?.liveRuntimeStatus === "local-demo-only", `${topic.id}: runtime state must remain local-demo-only`);
  for (const permission of ["write", "network", "secrets"]) {
    ensure(Array.isArray(profile?.permissions?.[permission]) && profile.permissions[permission].length === 0, `${topic.id}: ${permission} permissions must be empty`);
  }
  const servers = Object.entries(mcp?.mcpServers || {});
  ensure(servers.length === 1 && servers[0][0] === topic.id, `${topic.id}: MCP server id must match the topic`);
  const server = servers[0]?.[1];
  ensure(server?.command === "node", `${topic.id}: MCP server must use node`);
  ensure(JSON.stringify(server?.args) === JSON.stringify([`./scripts/${topic.id}-mcp-server.mjs`]), `${topic.id}: MCP script path must remain package-local`);

  const status = spawnSync(process.execPath, [mcpScriptPath, "--status"], {
    cwd: pluginRoot,
    env: { ...process.env, SEIS_ROOT: root, SEIS_REPO_ROOT: root, SEIS_WORKSPACE_ROOT: root, SEIS_TOPIC_PLUGIN_ROOT: pluginRoot },
    encoding: "utf8",
    timeout: 8000,
  });
  if (status.error) failures.push(`${topic.id}: status failed: ${status.error.message}`);
  else if (status.status !== 0) failures.push(`${topic.id}: status exited ${status.status}: ${String(status.stderr || "").trim().slice(0, 200)}`);
  else {
    try {
      const payload = JSON.parse(status.stdout);
      ensure(payload?.plugin === topic.id, `${topic.id}: status plugin id must match`);
      ensure(payload?.status === "ready", `${topic.id}: status must be ready`);
      ensure(payload?.mode === "local-read-only", `${topic.id}: status must be local-read-only`);
    } catch (error) {
      failures.push(`${topic.id}: status JSON invalid: ${error.message}`);
    }
  }
}

if (runMcpSmoke) {
  for (const topic of [topics[0], topics[Math.floor(topics.length / 2)], topics.at(-1)]) {
    const pluginRoot = path.join(root, TOPIC_PLUGIN_SOURCE_ROOT, topic.id);
    const script = path.join(pluginRoot, "scripts", `${topic.id}-mcp-server.mjs`);
    const prefix = topic.id.replaceAll("-", "_");
    const input = [
      frame({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
      frame({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
      frame({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: `seis_${prefix}_status`, arguments: {} } }),
      frame({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: `seis_${prefix}_report`, arguments: { path: root } } }),
    ].join("");
    const result = spawnSync(process.execPath, [script], {
      cwd: pluginRoot,
      env: { ...process.env, SEIS_ROOT: root, SEIS_REPO_ROOT: root, SEIS_WORKSPACE_ROOT: root, SEIS_TOPIC_PLUGIN_ROOT: pluginRoot },
      input,
      encoding: "utf8",
      timeout: 8000,
    });
    if (result.error || result.status !== 0) {
      failures.push(`${topic.id}: MCP smoke failed`);
      continue;
    }
    const responses = parseResponses(result.stdout);
    const tools = responses.find((message) => message.id === 2)?.result?.tools || [];
    ensure(tools.some((tool) => tool.name === `seis_${prefix}_status`), `${topic.id}: status tool missing`);
    ensure(tools.some((tool) => tool.name === `seis_${prefix}_report`), `${topic.id}: report tool missing`);
    ensure(responses.find((message) => message.id === 3)?.result?.status === "ready", `${topic.id}: MCP status must be ready`);
    ensure(responses.find((message) => message.id === 4)?.result?.evidenceMode === "repository-shape", `${topic.id}: MCP report must be repository-shape evidence`);
  }
}

if (failures.length) {
  console.error(`SEIS topic plugin matrix failed: ${failures.length} finding(s).`);
  for (const failure of failures.slice(0, 50)) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, objectiveRecords: topics.length, packages: topics.length, statusChecks: topics.length, mcpSmoke: runMcpSmoke ? 3 : 0 }, null, 2));

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(filePath, id) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${id}: invalid JSON at ${path.relative(root, filePath)}: ${error.message}`);
    return null;
  }
}

function frame(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

function parseResponses(stdout) {
  const responses = [];
  let pending = Buffer.from(stdout || "", "utf8");
  while (pending.length) {
    const separator = pending.indexOf("\r\n\r\n");
    if (separator < 0) break;
    const match = /Content-Length:\s*(\d+)/i.exec(pending.slice(0, separator).toString("utf8"));
    if (!match) break;
    const length = Number.parseInt(match[1], 10);
    const start = separator + 4;
    if (pending.length < start + length) break;
    responses.push(JSON.parse(pending.slice(start, start + length).toString("utf8")));
    pending = pending.slice(start + length);
  }
  return responses;
}
