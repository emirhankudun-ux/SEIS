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

let pending = Buffer.alloc(0);
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
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

function parseBody(bodyBuffer) {
  try {
    return JSON.parse(bodyBuffer.toString("utf8"));
  } catch {
    return null;
  }
}

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-code", version: "0.1.0" } } });
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
