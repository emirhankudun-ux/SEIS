#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models"]);
const usesPattern = /\buses\s*:\s*([^\s#]+)@([A-Za-z0-9._/-]+)/g;
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
    plugin: "seis-action-pin-audit",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-action-pin-audit", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    executesActions: false,
    github: "not-queried",
    writes: "disabled-by-design"
  };
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /\.(ya?ml|json)$/i.test(file) && (/(^|\/)\.github\/workflows\//i.test(file) || /workflow/i.test(file)));
  const findings = [];
  const reports = [];
  for (const file of candidates) {
    let content = "";
    try { content = fs.readFileSync(path.join(root, file), "utf8").slice(0, 300000); } catch { continue; }
    const actions = [];
    let match;
    while ((match = usesPattern.exec(content)) !== null) {
      const ref = match[2];
      const pinned = /^[0-9a-f]{40}$/i.test(ref);
      actions.push({ actionDeclared: true, immutableSha: pinned });
      if (!pinned) findings.push({ severity: "warning", code: "mutable-action-reference", file });
    }
    usesPattern.lastIndex = 0;
    reports.push({ file, actionReferences: actions.length, immutablePins: actions.filter((action) => action.immutableSha).length });
  }
  return {
    state: candidates.length === 0 ? "not-verified" : "ready",
    ok: candidates.length > 0,
    mode: "local-read-only",
    filesScanned: candidates.length,
    reports,
    findings,
    limitations: ["A SHA-looking ref is not verified against a remote commit.", "No workflow or GitHub Action is executed or contacted."]
  };
}
const tools = [
  { name: "seis_action_pin_audit_status", description: "Report Action pin audit readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_action_pin_audit", description: "Audit bounded local workflow action references.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-action-pin-audit", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_action_pin_audit_status" ? status() : name === "seis_action_pin_audit" ? audit(args.path) : null;
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
