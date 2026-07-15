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
function recordsFrom(data) {
  if (Array.isArray(data)) return data.filter((value) => value && typeof value === "object");
  for (const key of ["contexts", "requests", "usages", "records", "traces"]) {
    if (Array.isArray(data?.[key])) return data[key].filter((value) => value && typeof value === "object");
  }
  return data && typeof data === "object" ? [data] : [];
}
function valueFrom(record, keys) {
  for (const key of keys) if (record?.[key] !== undefined && record[key] !== null && record[key] !== "") return record[key];
  return null;
}
function numberFrom(record, keys) {
  const number = Number(valueFrom(record, keys));
  return Number.isFinite(number) ? number : null;
}
function median(values) {
  const ordered = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!ordered.length) return null;
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}
function average(values) {
  const usable = values.filter(Number.isFinite);
  return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : null;
}
function status() {
  return {
    plugin: "seis-context-efficiency",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-context-efficiency", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    network: "disabled-by-design",
    writes: "disabled-by-design",
    source: "recorded-local-context-usage-evidence"
  };
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /\.json$/i.test(file) && /context|token|prompt|latency|usage/i.test(file));
  const findings = [];
  const reports = [];
  let usefulTotal = 0;
  let tokenTotal = 0;
  const latencies = [];
  for (const file of candidates) {
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch {
      findings.push({ severity: "error", code: "invalid-json", file });
      continue;
    }
    for (const [index, record] of recordsFrom(data).entries()) {
      const usefulTokens = numberFrom(record, ["usefulTokens", "usefulTokenCount", "useful"]);
      const totalTokens = numberFrom(record, ["totalTokens", "contextTokens", "tokens"]);
      const latencyMs = numberFrom(record, ["latencyMs", "contextLatencyMs", "durationMs"]);
      const efficiency = usefulTokens !== null && totalTokens !== null && totalTokens > 0 ? usefulTokens / totalTokens : null;
      if (usefulTokens !== null && usefulTokens >= 0) usefulTotal += usefulTokens;
      if (totalTokens !== null && totalTokens > 0) tokenTotal += totalTokens;
      if (latencyMs !== null && latencyMs >= 0) latencies.push(latencyMs);
      if (usefulTokens !== null && totalTokens !== null && totalTokens <= 0) findings.push({ severity: "error", code: "invalid-token-denominator", file, record: index + 1 });
      if (efficiency === null) findings.push({ severity: "warning", code: "missing-usefulness-evidence", file, record: index + 1 });
      reports.push({ file, record: index + 1, usefulTokens, totalTokens, efficiency, latencyMs });
    }
  }
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    recordsScanned: reports.length,
    metrics: { weightedEfficiency: tokenTotal ? usefulTotal / tokenTotal : null, usefulTokens: usefulTotal, totalTokens: tokenTotal, latencyMs: { average: average(latencies), median: median(latencies), samples: latencies.length } },
    reports,
    findings,
    limitations: ["Only recorded token and usefulness fields are analyzed.", "No model call, prompt upload, or quality judgment is performed.", "Missing usefulness evidence remains null."]
  };
}
const tools = [
  { name: "seis_context_efficiency_status", description: "Report context-efficiency analysis readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_context_efficiency", description: "Measure recorded context usefulness and latency.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-context-efficiency", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_context_efficiency_status" ? status() : name === "seis_context_efficiency" ? audit(args.path) : null;
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
  const index = args.indexOf("--path");
  console.log(JSON.stringify(audit(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
