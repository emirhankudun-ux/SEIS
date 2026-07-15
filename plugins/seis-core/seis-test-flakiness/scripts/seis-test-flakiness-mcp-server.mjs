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
    plugin: "seis-test-flakiness",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-test-flakiness", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    rerunsTests: false,
    writes: "disabled-by-design"
  };
}
function recordsFrom(data) {
  if (Array.isArray(data)) return data.filter((value) => value && typeof value === "object");
  for (const key of ["tests", "records", "results", "cases"]) if (Array.isArray(data?.[key])) return data[key].filter((value) => value && typeof value === "object");
  return data && typeof data === "object" ? [data] : [];
}
function statuses(record) {
  const history = record.statusHistory || record.attempts || record.runs || record.results;
  if (Array.isArray(history)) return history.map((value) => typeof value === "string" ? value.toLowerCase() : String(value.status || value.state || "").toLowerCase()).filter(Boolean);
  if (Array.isArray(record.statuses)) return record.statuses.map((value) => String(value).toLowerCase());
  return [];
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /\.json$/i.test(file) && /test|junit|result|flak/i.test(file));
  const findings = [];
  const reports = [];
  for (const file of candidates) {
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch {
      findings.push({ severity: "error", code: "invalid-json", file });
      continue;
    }
    for (const [index, record] of recordsFrom(data).entries()) {
      const history = statuses(record);
      const hasPass = history.some((value) => /pass|success|ok/.test(value));
      const hasFail = history.some((value) => /fail|error|timeout|flak/.test(value));
      const flaky = hasPass && hasFail;
      if (flaky) findings.push({ severity: "warning", code: "mixed-test-history", file, record: index + 1 });
      reports.push({ file, record: index + 1, attempts: history.length, mixedHistory: flaky });
    }
  }
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    testsScanned: reports.length,
    flakyTests: reports.filter((report) => report.mixedHistory).length,
    reports,
    findings,
    limitations: ["Only recorded repeated test statuses are analyzed.", "No test is rerun and no current build result is claimed."]
  };
}
const tools = [
  { name: "seis_test_flakiness_status", description: "Report test flakiness analysis readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_test_flakiness", description: "Analyze bounded recorded test result histories.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-test-flakiness", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_test_flakiness_status" ? status() : name === "seis_test_flakiness" ? audit(args.path) : null;
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
