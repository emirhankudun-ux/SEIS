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
  focus: "provider-neutral deployment readiness, public cloud targets for everyone, self-hosted SEIS Cloud kits, cloud-only SEIS SSH, team/workplace VPN cloud, closed developer cloud systems, cloud preflight, rollback planning, and secret-safe infrastructure automation",
};

let pending = "";
let initializationStarted = false;
let initialized = false;
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
  const sshAccessModelPath = repo ? path.join(repo, "deploy", "seis-ssh-access-model.json") : null;
  const sshAccessModel = sshAccessModelPath && fs.existsSync(sshAccessModelPath)
    ? JSON.parse(fs.readFileSync(sshAccessModelPath, "utf8"))
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
    sshAccessModel,
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
      "For SEIS SSH, keep one visible cloud-only alias: SEIS-SSH.",
      "Route individual users through normal cloud SSH, companies and teams through VPN cloud SSH, and developers through a closed cloud development system.",
      "For self-hosted SEIS Cloud, generate the local kit with `npm run cloud:self-hosted:kit` before mutating a host.",
      "Classify provider, server target, secrets, public URL, rollback owner, and authentication scope.",
      "Run or update provider-neutral preflight records before provider-specific mutation.",
      "Keep apply/deploy commands behind explicit user confirmation.",
      "Validate cloud access policy, cloud reports, server target checks, rollback notes, and blockers.",
    ],
    accessPolicy: status().accessPolicy,
    sshAccessModel: status().sshAccessModel,
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
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-cloud", version: "0.1.0" } } });
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
