#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models"]);
const headingPattern = /^#{1,6}\s+(?:\[?v?(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)\]?|(\d{4}-\d{2}-\d{2})|unreleased|next)\b/i;
function rootFor(value) { return path.resolve(String(value || process.cwd())); }
function filesUnder(root, limit = 500) {
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
    plugin: "seis-release-cadence",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-release-cadence", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    github: "not-queried",
    publishes: false,
    writes: "disabled-by-design"
  };
}
function analyze(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /(^|\/)(changelog|changes|release-notes)([-_.].*)?\.(md|markdown|txt)$/i.test(file));
  const findings = [];
  const reports = [];
  for (const file of candidates) {
    let content = "";
    try { content = fs.readFileSync(path.join(root, file), "utf8").slice(0, 400000); } catch { continue; }
    const markers = [];
    for (const line of content.split(/\r?\n/)) {
      const match = headingPattern.exec(line.trim());
      if (!match) continue;
      const date = match[2] || (line.match(/\b\d{4}-\d{2}-\d{2}\b/) || [])[0] || null;
      markers.push({ date, versioned: Boolean(match[1]), dated: Boolean(date) });
    }
    if (markers.length === 0) findings.push({ severity: "warning", code: "no-release-heading", file });
    reports.push({ file, releaseMarkers: markers.length, datedMarkers: markers.filter((marker) => marker.dated).length });
  }
  const dates = reports.length ? reports.flatMap((report) => []) : [];
  const dated = [];
  for (const file of candidates) {
    let content = "";
    try { content = fs.readFileSync(path.join(root, file), "utf8").slice(0, 400000); } catch { continue; }
    for (const line of content.split(/\r?\n/)) {
      const match = headingPattern.exec(line.trim());
      const date = match && (match[2] || (line.match(/\b\d{4}-\d{2}-\d{2}\b/) || [])[0]);
      if (date) dated.push(date);
    }
  }
  const timestamps = dated.map((date) => Date.parse(date)).filter(Number.isFinite).sort((a, b) => b - a);
  const intervalsDays = timestamps.slice(1).map((timestamp, index) => Math.round((timestamps[index] - timestamp) / 86400000));
  const averageIntervalDays = intervalsDays.length ? Math.round(intervalsDays.reduce((sum, value) => sum + value, 0) / intervalsDays.length) : null;
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    releaseHeadings: dated.length,
    intervalsDays,
    averageIntervalDays,
    reports,
    findings,
    limitations: ["Cadence is derived only from dated local headings.", "No GitHub, tag, release API or delivery metric is queried."]
  };
}
const tools = [
  { name: "seis_release_cadence_status", description: "Report local release cadence readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_release_cadence", description: "Analyze bounded local changelog release intervals.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-release-cadence", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_release_cadence_status" ? status() : name === "seis_release_cadence" ? analyze(args.path) : null;
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
else if (args.includes("--analyze")) {
  const index = args.indexOf("--path");
  console.log(JSON.stringify(analyze(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
