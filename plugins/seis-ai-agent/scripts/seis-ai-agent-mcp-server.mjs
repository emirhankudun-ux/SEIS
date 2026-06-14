#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const AGENT = {
  id: "seis-ai-agent",
  identity: "SEIS-Agent",
  profilePath: "assets/agent-profile.json",
  skillPath: "skills/seis-ai-agent/SKILL.md",
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
let pending = Buffer.alloc(0);

const tools = [
  {
    name: "seis_ai_agent_status",
    description: "Report SEIS-Agent readiness across identities, marketplace, cloud, code, design, data, memory, context, and install surfaces.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seis_ai_agent_plan",
    description: "Create a lane-aware SEIS-Agent plan for an engineering, cloud, design, data, memory, context, MCP, skill, plugin, or governance request.",
    inputSchema: {
      type: "object",
      required: ["request"],
      properties: {
        request: { type: "string", description: "SEIS-Agent request to plan." },
      },
    },
  },
];

function pluginRoot() {
  return path.resolve(process.env.SEIS_AI_AGENT_PLUGIN_ROOT || path.join(scriptDir, ".."));
}

function repoRoot() {
  const candidates = [
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.resolve(scriptDir, "..", "..", ".."),
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "package.json"))) || null;
}

function status() {
  const root = pluginRoot();
  const repo = repoRoot();
  const profile = readJson(path.join(root, AGENT.profilePath));
  const identities = repo ? readJson(path.join(repo, "data", "seis-operating-identities.json")) : null;
  const marketplace = repo ? readJson(path.join(repo, ".agents", "plugins", "marketplace.json")) : null;
  const composedPluginReadiness = Object.fromEntries((profile?.composedPlugins || []).map((name) => [
    name,
    repo ? fs.existsSync(path.join(repo, "plugins", name, ".codex-plugin", "plugin.json")) : false,
  ]));
  const readiness = {
    profile: Boolean(profile),
    skill: fs.existsSync(path.join(root, AGENT.skillPath)),
    mcpManifest: fs.existsSync(path.join(root, ".mcp.json")),
    mcpServer: fs.existsSync(path.join(root, "scripts", "seis-ai-agent-mcp-server.mjs")),
    operatingIdentities: Boolean((identities?.identities || []).find((item) => item.name === AGENT.identity)),
    marketplace: Boolean(marketplace?.plugins?.some((plugin) => plugin.name === AGENT.id && plugin.source?.path === "./plugins/seis-ai-agent")),
    installer: repo ? fs.existsSync(path.join(repo, "scripts", "install-seis-ai-agent.mjs")) : false,
    composedPlugins: Object.values(composedPluginReadiness).every(Boolean),
  };

  return {
    status: Object.values(readiness).every(Boolean) ? "ready" : "partial",
    agent: AGENT.id,
    identity: AGENT.identity,
    pluginRoot: root,
    repoRoot: repo,
    readiness,
    composedPluginReadiness,
    profile,
    operatingIdentities: identities?.identities?.map((item) => item.name) || [],
  };
}

function plan(input) {
  if (typeof input?.request !== "string" || !input.request.trim()) {
    return { error: { code: -32602, message: "Invalid params: request is required." } };
  }
  return {
    agent: AGENT.id,
    identity: AGENT.identity,
    request: input.request,
    lanes: [
      "SEIS: repository governance, architecture, documentation, quality, and source-of-truth discipline.",
      "SEIS-Agent: unified orchestration across MCP, skills, plugins, automation, memory, context, and delivery.",
      "SEIS-Cloud: public cloud for everyone; SSH/WireGuard VPN cloud for approved workplaces and teams.",
      "SEIS-Code: implementation, tests, CI, MCP/plugin code, and repo automation.",
      "SEIS-Design: premium, minimal, cinematic, accessible, responsive product and design-system work.",
      "SEIS-Data: memory, context systems, analytics, reports, source intake, and provenance.",
    ],
    steps: [
      "Confirm the request belongs under the SEIS ecosystem objective.",
      "Inspect repository status, branch, remotes, and affected generated reports.",
      "Map ownership to the smallest useful SEIS identity or lane.",
      "Create durable repo artifacts instead of prose-only decisions.",
      "Keep cloud, SSH, repository visibility, and source-intake work plan-first until explicit apply approval.",
      "Validate targeted checks, generated reports, and npm run quality before handoff.",
    ],
    defaultChecks: status().profile?.qualityCommands || [],
  };
}

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: AGENT.identity, version: "0.1.0" } } });
    return;
  }
  if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
    return;
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_ai_agent_status" ? status() : name === "seis_ai_agent_plan" ? plan(args) : null;
    if (result?.error) {
      send({ jsonrpc: "2.0", id: message.id, error: result.error });
      return;
    }
    if (result) {
      send({ jsonrpc: "2.0", id: message.id, result });
      return;
    }
    send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${name || "undefined"}` } });
  }
}

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

function readJson(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseBody(bodyBuffer) {
  try {
    return JSON.parse(bodyBuffer.toString("utf8"));
  } catch {
    return null;
  }
}

function pump() {
  while (true) {
    const separatorIndex = pending.indexOf("\r\n\r\n");
    if (separatorIndex < 0) return;
    const header = pending.slice(0, separatorIndex).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) {
      pending = pending.slice(separatorIndex + 4);
      continue;
    }
    const start = separatorIndex + 4;
    const end = start + Number(match[1]);
    if (pending.length < end) return;
    const body = parseBody(pending.slice(start, end));
    pending = pending.slice(end);
    handle(body);
  }
}

process.stdin.on("data", (chunk) => {
  pending = Buffer.concat([pending, Buffer.from(chunk)]);
  pump();
});

process.stdin.on("end", () => process.exit(0));
