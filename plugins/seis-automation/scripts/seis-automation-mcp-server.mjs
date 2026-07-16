#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const LANE = {
  id: "seis-automation",
  label: "SEIS Automation",
  pluginName: "seis-automation",
  skillPath: "skills/seis-automation/SKILL.md",
  focus: "SEIS Automation gives Codex a public SEIS plugin lane for repeatable scripts, checks, generators, scheduled jobs, CI steps, runbooks, agent loops, and human-approved automation gates under SEIS-Agent governance.",
  statusTool: "seis_automation_status",
  planTool: "seis_automation_plan",
  planSteps: [
  "Classify the automation as a script, check, generator, CI step, runbook, scheduled job, or agent loop.",
  "Define inputs, outputs, owner, rollback path, failure behavior, and validation command.",
  "Reuse existing scripts and package commands before adding a new workflow.",
  "Default mutating automation to plan-only or dry-run mode.",
  "Validate syntax and one representative execution path before handoff."
],
};

let pending = Buffer.alloc(0);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function pluginRoot() {
  return path.resolve(process.env[envName(LANE.id)] || path.join(scriptDir, ".."));
}

function repoRoot() {
  const candidates = [
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.resolve(pluginRoot(), "..", ".."),
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "package.json"))) || null;
}

const TOOLS = [
  {
    name: LANE.statusTool,
    description: "Report embedded SEIS source-module lane readiness and SEIS-Agent connection status.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: LANE.planTool,
    description: "Create a scoped plan for this embedded SEIS source-module lane.",
    inputSchema: {
      type: "object",
      required: ["request"],
      properties: {
        request: { type: "string", description: "SEIS lane request to plan." },
      },
    },
  },
];

function status() {
  const root = pluginRoot();
  const repo = repoRoot();
  const profile = readJson(path.join(root, "assets", "lane-profile.json"));
  const agentProfile = repo ? readJson(path.join(repo, "plugins", "seis-ai-agent", "assets", "agent-profile.json")) : null;
  return {
    status: profile ? "ready" : "partial",
    lane: LANE.id,
    pluginRoot: root,
    repoRoot: repo,
    skillExists: fs.existsSync(path.join(root, LANE.skillPath)),
    mcpManifestExists: fs.existsSync(path.join(root, ".mcp.json")),
    repoMirrorExists: repo ? fs.existsSync(path.join(repo, "plugins", LANE.pluginName, ".codex-plugin", "plugin.json")) : false,
    connectedToSeisAi: Boolean(agentProfile?.composedLanes?.includes(LANE.id) && agentProfile?.consolidationPolicy?.embeddedSkills?.includes(LANE.id)),
    profile,
  };
}

function plan(input) {
  if (typeof input?.request !== "string" || !input.request.trim()) {
    return { error: { code: -32602, message: "Invalid params: request is required." } };
  }
  return {
    lane: LANE.id,
    request: input.request,
    focus: LANE.focus,
    steps: LANE.planSteps,
    connection: "planned through the single public SEIS-Agent plugin",
    defaultChecks: status().profile?.qualityCommands || [],
  };
}

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function envName(value) {
  return `${value.toUpperCase().replaceAll("-", "_")}_PLUGIN_ROOT`;
}

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: LANE.id, version: "0.3.0+codex.20260712" } } });
    return;
  }
  if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools: TOOLS } });
    return;
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === LANE.statusTool ? status() : name === LANE.planTool ? plan(args) : null;
    if (result?.error) {
      send({ jsonrpc: "2.0", id: message.id, error: result.error });
      return;
    }
    if (result) {
      send({ jsonrpc: "2.0", id: message.id, result });
      return;
    }
    send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${name ?? "undefined"}` } });
  }
}

function parseBody(bodyBuffer) {
  try {
    return JSON.parse(bodyBuffer.toString("utf8"));
  } catch {
    return null;
  }
}

function processStream() {
  while (true) {
    const separatorIndex = pending.indexOf("\r\n\r\n");
    if (separatorIndex < 0) return;
    const headerRaw = pending.slice(0, separatorIndex).toString("utf8");
    const lengthMatch = /Content-Length:\s*(\d+)/i.exec(headerRaw);
    if (!lengthMatch) {
      pending = pending.slice(separatorIndex + 4);
      continue;
    }
    const contentLength = Number.parseInt(lengthMatch[1], 10);
    const bodyStart = separatorIndex + 4;
    if (pending.length < bodyStart + contentLength) return;
    const body = parseBody(pending.slice(bodyStart, bodyStart + contentLength));
    pending = pending.slice(bodyStart + contentLength);
    handle(body);
  }
}

process.stdin.on("data", (chunk) => {
  pending = Buffer.concat([pending, Buffer.from(chunk)]);
  processStream();
});

process.stdin.on("end", () => process.exit(0));
