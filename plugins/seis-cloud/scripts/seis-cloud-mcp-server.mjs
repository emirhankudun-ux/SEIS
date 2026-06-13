#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const LANE = {
  id: "seis-cloud",
  toolPrefix: "seis_cloud",
  pluginName: "seis-cloud",
  skillPath: "skills/seis-cloud/SKILL.md",
  focus: "provider-neutral deployment readiness, public cloud targets for everyone, team/workplace VPN cloud, cloud preflight, rollback planning, and secret-safe infrastructure automation",
};

let pending = Buffer.alloc(0);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function pluginRoot() {
  return path.resolve(process.env.SEIS_CLOUD_PLUGIN_ROOT || path.join(scriptDir, ".."));
}

function repoRoot() {
  const home = process.env.HOME || "";
  const candidates = [
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.join(home, "Library", "Mobile Documents", "com~apple~CloudDocs", "Github", "SEIS"),
    path.resolve(pluginRoot(), "..", "SEIS"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "package.json"))) {
      return path.resolve(candidate);
    }
  }
  return null;
}

const TOOLS = [
  {
    name: "seis_cloud_status",
    description: "Report SEIS Cloud plugin, skill, MCP, marketplace, and repo-mirror readiness.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seis_cloud_plan",
    description: "Create a scoped SEIS Cloud plan for deployment, server target, provider preflight, or infrastructure readiness work.",
    inputSchema: {
      type: "object",
      required: ["request"],
      properties: {
        request: { type: "string", description: "Cloud or deployment request to plan." },
      },
    },
  },
];

function status() {
  const root = pluginRoot();
  const repo = repoRoot();
  const profilePath = path.join(root, "assets", "lane-profile.json");
  const profile = fs.existsSync(profilePath) ? JSON.parse(fs.readFileSync(profilePath, "utf8")) : null;
  const accessPolicyPath = repo ? path.join(repo, "deploy", "cloud-access-policy.json") : null;
  const accessPolicy = accessPolicyPath && fs.existsSync(accessPolicyPath)
    ? JSON.parse(fs.readFileSync(accessPolicyPath, "utf8"))
    : null;
  return {
    status: profile ? "ready" : "partial",
    lane: LANE.id,
    pluginRoot: root,
    repoRoot: repo,
    skillExists: fs.existsSync(path.join(root, LANE.skillPath)),
    mcpManifestExists: fs.existsSync(path.join(root, ".mcp.json")),
    repoMirrorExists: repo ? fs.existsSync(path.join(repo, "plugins", LANE.pluginName, ".codex-plugin", "plugin.json")) : false,
    accessPolicy,
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
      "Inspect git status, branch, remote, and current cloud target records.",
      "Classify access audience: public cloud for everyone or team/workplace VPN cloud for approved peers.",
      "Classify provider, server target, secrets, public URL, rollback owner, and authentication scope.",
      "Run or update provider-neutral preflight records before provider-specific mutation.",
      "Keep apply/deploy commands behind explicit user confirmation.",
      "Validate cloud access policy, cloud reports, server target checks, rollback notes, and blockers.",
    ],
    accessPolicy: status().accessPolicy,
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
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-cloud", version: "0.1.0" } } });
    return;
  }
  if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools: TOOLS } });
    return;
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_cloud_status" ? status() : name === "seis_cloud_plan" ? plan(args) : null;
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
