#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models"]);
function rootFor(value) { return path.resolve(String(value || process.cwd())); }
function filesUnder(root, limit = 600) {
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
    plugin: "seis-docs-freshness",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-docs-freshness", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    source: "filesystem-metadata",
    writes: "disabled-by-design"
  };
}
function audit(input, maxAgeDays = 180) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const docs = filesUnder(root).filter((file) => /\.(md|markdown|mdx)$/i.test(file));
  const now = Date.now();
  const findings = [];
  const reports = [];
  for (const file of docs) {
    const full = path.join(root, file);
    let stat;
    let content = "";
    try { stat = fs.statSync(full); content = fs.readFileSync(full, "utf8").slice(0, 12000); } catch { continue; }
    const heading = (content.split(/\r?\n/).find((line) => /^#\s+\S+/.test(line.trim())) || "").replace(/^#\s+/, "").slice(0, 120);
    const ageDays = Math.max(0, Math.floor((now - stat.mtimeMs) / 86400000));
    if (ageDays > maxAgeDays) findings.push({ severity: "warning", code: "stale-documentation", file, ageDays, thresholdDays: maxAgeDays });
    reports.push({ file, heading: heading || null, ageDays });
  }
  return {
    state: docs.length === 0 ? "not-verified" : findings.length ? "attention" : "ready",
    ok: docs.length > 0 && findings.length === 0,
    mode: "local-read-only",
    thresholdDays: maxAgeDays,
    filesScanned: docs.length,
    reports,
    findings,
    limitations: ["Freshness is based on local modification metadata, not semantic truth or external review records.", "No document is changed."]
  };
}
const tools = [
  { name: "seis_docs_freshness_status", description: "Report local documentation freshness readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_docs_freshness", description: "Report bounded local Markdown freshness.", inputSchema: { type: "object", properties: { path: { type: "string" }, maxAgeDays: { type: "number" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-docs-freshness", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_docs_freshness_status" ? status() : name === "seis_docs_freshness" ? audit(args.path, Number.isFinite(args.maxAgeDays) ? args.maxAgeDays : 180) : null;
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
else if (args.includes("--audit")) {
  const pathIndex = args.indexOf("--path");
  const daysIndex = args.indexOf("--days");
  const days = daysIndex >= 0 ? Number.parseInt(args[daysIndex + 1], 10) : 180;
  console.log(JSON.stringify(audit(pathIndex >= 0 ? args[pathIndex + 1] : undefined, Number.isFinite(days) ? days : 180), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
