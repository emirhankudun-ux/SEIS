#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models"]);
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
    plugin: "seis-changelog-validator",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-changelog-validator", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    publishes: false,
    writes: "disabled-by-design"
  };
}
function validate(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /(^|\/)(changelog|changes|release-notes)([-_.].*)?\.(md|markdown|txt)$/i.test(file));
  const findings = [];
  const reports = [];
  for (const file of candidates) {
    const full = path.join(root, file);
    let content = "";
    try { content = fs.readFileSync(full, "utf8").slice(0, 400000); } catch { continue; }
    const lines = content.split(/\r?\n/);
    const hasVersionHeading = lines.some((line) => /^#{1,6}\s+(?:\[?v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?\]?|unreleased|next)\b/i.test(line.trim()));
    const entryCount = lines.filter((line) => /^\s*[-*+]\s+\S+/.test(line)).length;
    if (!hasVersionHeading) findings.push({ severity: "error", code: "missing-version-heading", file });
    if (entryCount === 0) findings.push({ severity: "warning", code: "missing-change-entry", file });
    reports.push({ file, hasVersionHeading, entryCount });
  }
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    reports,
    findings,
    limitations: ["Only bounded local changelog-like files are inspected.", "No release note is edited, published or treated as a release approval."]
  };
}
const tools = [
  { name: "seis_changelog_validator_status", description: "Report local changelog validator readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_changelog_validate", description: "Validate bounded local changelog structure.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-changelog-validator", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_changelog_validator_status" ? status() : name === "seis_changelog_validate" ? validate(args.path) : null;
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
else if (args.includes("--validate")) {
  const index = args.indexOf("--path");
  console.log(JSON.stringify(validate(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
