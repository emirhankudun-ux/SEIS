#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const taxonomy = [
  ["ai-core", "AI Core", "artificial-intelligence", ["router", "agent", "model"]],
  ["model-router", "Model Router", "ai-core", ["9router", "routing"]],
  ["agent-runtime", "Agent Runtime", "ai-core", ["agent", "handoff", "approval"]],
  ["mcp", "Model Context Protocol", "integration", ["mcp", "tool"]],
  ["swiftui", "SwiftUI", "apple-native", ["swift", "macos", "ios"]],
  ["tauri", "Tauri", "desktop", ["rust", "webview", "desktop"]],
  ["typescript", "TypeScript", "web", ["javascript", "frontend"]],
  ["sqlite", "SQLite", "data", ["database", "migration"]],
  ["rag", "Retrieval-Augmented Generation", "knowledge", ["retrieval", "search", "citation"]],
  ["observability", "Observability", "operations", ["telemetry", "metrics", "audit"]],
  ["accessibility", "Accessibility", "quality", ["a11y", "keyboard", "screen-reader"]],
  ["provenance", "Source Provenance", "governance", ["rights", "license", "hash"]],
];

function status() {
  return { plugin: "seis-technology-ontology", status: fs.existsSync(path.join(pluginRoot, "skills", "seis-technology-ontology", "SKILL.md")) ? "ready" : "partial", mode: "local-read-only", network: "disabled-by-design", writes: "disabled-by-design" };
}
function search(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return { state: "invalid-input", error: "query-required", mode: "local-read-only" };
  const results = taxonomy.filter(([, name, domain, aliases]) => [name, domain, ...aliases].join(" ").toLowerCase().includes(q)).map(([id, name, domain, aliases]) => ({ id, name, domain, aliases, relatedTerms: taxonomy.filter((item) => item[2] === id || item[0] === domain).map((item) => item[0]).slice(0, 6) }));
  return { state: "ready", mode: "local-read-only", query: q, results, taxonomySize: taxonomy.length, limitations: ["The taxonomy is a local seed projection, not a claim of complete ecosystem coverage.", "No external ontology or provider is queried."] };
}
const tools = [
  { name: "seis_technology_ontology_status", description: "Report local ontology plugin readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_technology_search", description: "Search the bounded local SEIS technology taxonomy.", inputSchema: { type: "object", required: ["query"], properties: { query: { type: "string" } } } },
];
function send(message) { const body = JSON.stringify(message); process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`); }
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-technology-ontology", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") { const name = message.params?.name; const args = message.params?.arguments || {}; const result = name === "seis_technology_ontology_status" ? status() : name === "seis_technology_search" ? search(args.query) : null; if (result) send({ jsonrpc: "2.0", id: message.id, result }); else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${name ?? "undefined"}` } }); }
}
function processStream() { while (true) { const separator = pending.indexOf("\r\n\r\n"); if (separator < 0) return; const match = /Content-Length:\s*(\d+)/i.exec(pending.slice(0, separator).toString("utf8")); if (!match) { pending = pending.slice(separator + 4); continue; } const length = Number.parseInt(match[1], 10); const start = separator + 4; if (pending.length < start + length) return; try { handle(JSON.parse(pending.slice(start, start + length).toString("utf8"))); } catch {} pending = pending.slice(start + length); } }
const args = process.argv.slice(2);
if (args.includes("--status")) console.log(JSON.stringify(status(), null, 2));
else if (args.includes("--search")) { const index = args.indexOf("--query"); console.log(JSON.stringify(search(index >= 0 ? args[index + 1] : undefined), null, 2)); }
else { process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); }); process.stdin.on("end", () => process.exit(0)); }
