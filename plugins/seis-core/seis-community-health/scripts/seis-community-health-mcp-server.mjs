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
    plugin: "seis-community-health",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-community-health", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    github: "not-queried",
    writes: "disabled-by-design"
  };
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const files = filesUnder(root).map((file) => file.toLowerCase());
  const checks = [
    { id: "readme", ok: files.some((file) => path.basename(file) === "readme.md") },
    { id: "contributing", ok: files.some((file) => path.basename(file) === "contributing.md") },
    { id: "code-of-conduct", ok: files.some((file) => /code.of.conduct/.test(path.basename(file))) },
    { id: "security-reporting", ok: files.some((file) => path.basename(file) === "security.md") },
    { id: "issue-template", ok: files.some((file) => /issue.template|issues\/.*\.(md|yml|yaml)$/.test(file)) },
    { id: "pull-request-template", ok: files.some((file) => /pull_request_template|pull-request-template/.test(file)) },
    { id: "support-guidance", ok: files.some((file) => path.basename(file) === "support.md" || /support/.test(file)) }
  ];
  const findings = checks.filter((check) => !check.ok).map((check) => ({ severity: "warning", code: "missing-community-surface", surface: check.id }));
  return {
    state: "ready",
    ok: true,
    mode: "local-read-only",
    checks,
    findings,
    score: Math.round((checks.filter((check) => check.ok).length / checks.length) * 100),
    limitations: ["Only local template and documentation presence is checked.", "No GitHub activity, response time or maintainer behavior is measured."]
  };
}
const tools = [
  { name: "seis_community_health_status", description: "Report local community health readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_community_health", description: "Audit bounded local community templates and guidance.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-community-health", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_community_health_status" ? status() : name === "seis_community_health" ? audit(args.path) : null;
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
