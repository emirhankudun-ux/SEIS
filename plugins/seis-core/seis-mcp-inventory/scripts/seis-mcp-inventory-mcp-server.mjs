#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models"]);
function rootFor(value) { return path.resolve(String(value || process.cwd())); }
function filesUnder(root, limit = 700) {
  const result = [];
  function visit(dir) {
    if (result.length >= limit) return;
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (result.length >= limit || entry.isSymbolicLink()) return;
      if (entry.isDirectory() && (ignored.has(entry.name) || entry.name.startsWith("."))) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else result.push(path.relative(root, full));
    }
  }
  visit(root);
  return result;
}
function status() {
  return {
    plugin: "seis-mcp-inventory",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-mcp-inventory", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    startsServers: false,
    network: "disabled-by-design",
    writes: "disabled-by-design"
  };
}
function inventory(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => {
    const base = path.basename(file).toLowerCase();
    return base === ".mcp.json" || (path.extname(base) === ".json" && /(^|\/)(mcp|plugins)(\/|$)/i.test(file) && /mcp/i.test(base));
  });
  const findings = [];
  const manifests = [];
  const servers = [];
  for (const file of candidates) {
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch {
      findings.push({ severity: "error", code: "invalid-json", file });
      continue;
    }
    const declared = data && typeof data === "object" ? (data.mcpServers || data.servers || {}) : {};
    const names = declared && typeof declared === "object" && !Array.isArray(declared) ? Object.keys(declared) : [];
    if (names.length === 0) findings.push({ severity: "warning", code: "no-declared-server", file });
    for (const name of names) {
      const config = declared[name] && typeof declared[name] === "object" ? declared[name] : {};
      const permissionObject = config.permissions && typeof config.permissions === "object" ? config.permissions : {};
      servers.push({
        file,
        name,
        transport: typeof config.url === "string" ? "remote-declared" : typeof config.command === "string" ? "stdio" : "unclassified",
        commandDeclared: typeof config.command === "string",
        argsCount: Array.isArray(config.args) ? config.args.length : 0,
        toolsDeclared: Array.isArray(config.tools) ? config.tools.length : null,
        permissionFields: Object.keys(permissionObject).filter((key) => ["read", "write", "network", "secrets"].includes(key)),
        writeDeclared: Boolean(permissionObject.write || config.write === true)
      });
    }
    manifests.push({ file, serverCount: names.length });
  }
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    manifests,
    servers,
    findings,
    limitations: ["Only declared local JSON manifests are inspected.", "No MCP server is started and connectivity, authentication or vendor claims are not verified."]
  };
}
const tools = [
  { name: "seis_mcp_inventory_status", description: "Report local MCP inventory readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_mcp_inventory", description: "Inventory bounded local MCP manifests without starting servers.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-mcp-inventory", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_mcp_inventory_status" ? status() : name === "seis_mcp_inventory" ? inventory(args.path) : null;
    if (result) send({ jsonrpc: "2.0", id: message.id, result });
    else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Unknown tool: " + String(name || "undefined") } });
  }
}
function processStream() {
  while (true) {
    const separator = pending.indexOf("\r\n\r\n");
    if (separator < 0) return;
    const match = /Content-Length:\s*(\d+)/i.exec(pending.slice(0, separator).toString("utf8"));
    if (!match) { pending = pending.slice(separator + 4); continue; }
    const length = Number.parseInt(match[1], 10);
    const start = separator + 4;
    if (pending.length < start + length) return;
    try { handle(JSON.parse(pending.slice(start, start + length).toString("utf8"))); } catch {}
    pending = pending.slice(start + length);
  }
}
const args = process.argv.slice(2);
if (args.includes("--status")) console.log(JSON.stringify(status(), null, 2));
else if (args.includes("--inventory")) {
  const index = args.indexOf("--path");
  console.log(JSON.stringify(inventory(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
