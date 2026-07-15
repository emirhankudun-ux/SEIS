#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function status() { return { plugin: "seis-route-explainer", status: fs.existsSync(path.join(pluginRoot, "skills", "seis-route-explainer", "SKILL.md")) ? "ready" : "partial", mode: "demo", providerCalls: "none", network: "disabled-by-design", writes: "disabled-by-design" }; }
function explain(input = {}) {
  const privacyClass = String(input.privacyClass || input.privacy_class || "public-safe");
  const taskClass = String(input.taskClass || input.task_class || "general");
  const offline = input.offline === true || String(input.offline).toLowerCase() === "true";
  const requiresTools = input.requiresTools === true || String(input.requiresTools).toLowerCase() === "true";
  const primary = "local/deterministic-demo";
  const reasons = ["provider-neutral demo adapter", "explainable policy output", "no credential required"];
  if (offline || privacyClass !== "public-safe") reasons.push("local-first privacy/offline constraint");
  if (requiresTools) reasons.push("tool requirement recorded for later approval review");
  return { state: "ready", mode: "demo", routeId: `demo-route-${taskClass.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, taskClass, primary, fallbacks: ["local/offline-safe"], reasons, constraints: ["no-provider-call", `privacy:${privacyClass}`, offline ? "offline-required" : "offline-available"], estimatedCostClass: "none", latencyClass: "deterministic", privacyClass, approvalRequired: requiresTools, evaluationVersion: "local-policy-v1", limitations: ["This explains a policy proposal; it does not select or call a real provider/model."] };
}
const tools = [
  { name: "seis_route_explainer_status", description: "Report route explainer demo readiness and provider boundary.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_route_explain", description: "Produce a deterministic provider-neutral route explanation.", inputSchema: { type: "object", properties: { taskClass: { type: "string" }, privacyClass: { type: "string" }, offline: { type: "boolean" }, requiresTools: { type: "boolean" } } } },
];
function send(message) { const body = JSON.stringify(message); process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`); }
let pending = Buffer.alloc(0);
function handle(message) { if (!message || typeof message !== "object") return; if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-route-explainer", version: "0.1.0" } } }); else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } }); else if (message.method === "tools/call") { const name = message.params?.name; const args = message.params?.arguments || {}; const result = name === "seis_route_explainer_status" ? status() : name === "seis_route_explain" ? explain(args) : null; if (result) send({ jsonrpc: "2.0", id: message.id, result }); else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${name ?? "undefined"}` } }); } }
function processStream() { while (true) { const separator = pending.indexOf("\r\n\r\n"); if (separator < 0) return; const match = /Content-Length:\s*(\d+)/i.exec(pending.slice(0, separator).toString("utf8")); if (!match) { pending = pending.slice(separator + 4); continue; } const length = Number.parseInt(match[1], 10); const start = separator + 4; if (pending.length < start + length) return; try { handle(JSON.parse(pending.slice(start, start + length).toString("utf8"))); } catch {} pending = pending.slice(start + length); } }
const args = process.argv.slice(2);
if (args.includes("--status")) console.log(JSON.stringify(status(), null, 2));
else if (args.includes("--explain")) { const input = {}; for (const key of ["taskClass", "privacyClass", "offline", "requiresTools"]) { const index = args.indexOf(`--${key}`); if (index >= 0) input[key] = args[index + 1]; } console.log(JSON.stringify(explain(input), null, 2)); }
else { process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); }); process.stdin.on("end", () => process.exit(0)); }
