#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(pluginRoot, "..", "..");
let pending = Buffer.alloc(0);
const tools = [
  { name: "seis_ai_agent_status", description: "Report SEIS-AI Agent readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_ai_agent_plan", description: "Create a lane-aware SEIS-AI Agent plan.", inputSchema: { type: "object", required: ["request"], properties: { request: { type: "string" } } } }
];
function exists(rel) { return fs.existsSync(path.join(repoRoot, rel)); }
function status() {
  return { status: exists("plugins/seis-ai-agent/.codex-plugin/plugin.json") && exists("scripts/install-seis-ai-agent.mjs") ? "ready" : "partial", agent: "seis-ai-agent", pluginRoot, repoRoot, composedPluginReadiness: Object.fromEntries(["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"].map((name) => [name, exists(`plugins/${name}/.codex-plugin/plugin.json`)])) };
}
function plan(input) { return { agent: "seis-ai-agent", request: input?.request || "", lanes: ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"], steps: ["Map lane ownership.", "Implement repo artifact.", "Keep website gated until release decision.", "Validate install and quality gates."] }; }
function send(message) { const body = JSON.stringify(message); process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`); }
function handle(message) { if (message.method === "initialize") return send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-ai-agent", version: "0.1.0" } } }); if (message.method === "tools/list") return send({ jsonrpc: "2.0", id: message.id, result: { tools } }); if (message.method === "tools/call") { const name = message.params?.name; const args = message.params?.arguments || {}; const result = name === "seis_ai_agent_status" ? status() : name === "seis_ai_agent_plan" ? plan(args) : null; return result ? send({ jsonrpc: "2.0", id: message.id, result }) : send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Unknown tool" } }); } }
function pump() { while (true) { const sep = pending.indexOf("\r\n\r\n"); if (sep < 0) return; const header = pending.slice(0, sep).toString("utf8"); const match = /Content-Length:\s*(\d+)/i.exec(header); if (!match) { pending = pending.slice(sep + 4); continue; } const start = sep + 4; const end = start + Number(match[1]); if (pending.length < end) return; const body = JSON.parse(pending.slice(start, end).toString("utf8")); pending = pending.slice(end); handle(body); } }
process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); pump(); });
process.stdin.on("end", () => process.exit(0));
