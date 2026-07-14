#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const LANE = {
  id: "seis-code",
  toolPrefix: "seis_code",
  pluginName: "seis-code",
  skillPath: "skills/seis-code/SKILL.md",
  focus: "architecture-aware implementation, refactors, tests, CI, MCP/plugin code, and repository automation",
};

let pending = "";
let initializationStarted = false;
let initialized = false;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function pluginRoot() {
  return path.resolve(process.env.SEIS_CODE_PLUGIN_ROOT || path.join(scriptDir, ".."));
}

function repoRoot() {
  const home = process.env.HOME || "";
  const candidates = [
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.resolve(scriptDir, "..", "..", ".."),
    path.join(home, "Library", "Mobile Documents", "com~apple~CloudDocs", "Github", "SEIS"),
    path.resolve(pluginRoot(), "..", "SEIS"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const packagePath = path.join(candidate, "package.json");
    if (fs.existsSync(packagePath)) {
      return path.resolve(candidate);
    }
  }
  return null;
}

const TOOLS = [
  {
    name: "seis_code_status",
    description: "Report SEIS-Code plugin, skill, MCP, marketplace, and repo-mirror readiness.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seis_code_plan",
    description: "Create a scoped SEIS-Code execution plan for an engineering request.",
    inputSchema: {
      type: "object",
      required: ["request"],
      properties: {
        request: { type: "string", description: "Engineering request to plan." },
      },
    },
  },
];

function status() {
  const root = pluginRoot();
  const repo = repoRoot();
  const profilePath = path.join(root, "assets", "lane-profile.json");
  const profile = fs.existsSync(profilePath) ? JSON.parse(fs.readFileSync(profilePath, "utf8")) : null;
  const skillExists = fs.existsSync(path.join(root, LANE.skillPath));
  const mcpManifestExists = fs.existsSync(path.join(root, ".mcp.json"));
  const repoMirrorExists = repo ? fs.existsSync(path.join(repo, "plugins", LANE.pluginName, ".codex-plugin", "plugin.json")) : false;
  return {
    status: profile && skillExists && mcpManifestExists && repoMirrorExists ? "ready" : "partial",
    lane: LANE.id,
    pluginRoot: root,
    repoRoot: repo,
    skillExists,
    mcpManifestExists,
    repoMirrorExists,
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
    steps: [
      "Inspect git status, branch, and remote before edits.",
      "Read nearest repo context and map affected code lane.",
      "Implement the smallest durable engineering change.",
      "Run scoped tests or checks tied to touched paths.",
      "Record validation, risks, rollback notes, and changed files.",
    ],
    defaultChecks: status().profile?.qualityCommands || [],
  };
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function sendError(id, code, message) {
  send({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
}

function parseBody(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function handle(message) {
  if (!message || typeof message !== "object") {
    sendError(null, -32600, "Invalid Request");
    return;
  }
  if (message.method === "initialize") {
    if (initializationStarted) {
      sendError(message.id, -32600, "Initialize may only be sent once.");
      return;
    }
    initializationStarted = true;
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-code", version: "0.1.0" } } });
    return;
  }
  if (message.method === "notifications/initialized") {
    initialized = initializationStarted;
    return;
  }
  if (!initialized) {
    if (message.id !== undefined) sendError(message.id, -32002, "Server not initialized.");
    return;
  }
  if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools: TOOLS } });
    return;
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_code_status" ? status() : name === "seis_code_plan" ? plan(args) : null;
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

function processStream() {
  while (true) {
    const newlineIndex = pending.indexOf("\n");
    if (newlineIndex < 0) return;
    const line = pending.slice(0, newlineIndex).replace(/\r$/, "");
    pending = pending.slice(newlineIndex + 1);
    if (!line.trim()) continue;
    handle(parseBody(line));
  }
}

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  pending += chunk;
  processStream();
});

process.stdin.on("end", () => process.exit(0));
