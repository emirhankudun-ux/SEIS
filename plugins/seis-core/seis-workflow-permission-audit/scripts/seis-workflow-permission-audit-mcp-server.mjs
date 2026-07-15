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
    plugin: "seis-workflow-permission-audit",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-workflow-permission-audit", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    executesWorkflows: false,
    githubWrites: false,
    writes: "disabled-by-design"
  };
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /\.(json|ya?ml)$/i.test(file) && (/(^|\/)\.github\/workflows\//i.test(file) || /workflow/i.test(path.basename(file))));
  const findings = [];
  const reports = [];
  for (const file of candidates) {
    let content = "";
    try { content = fs.readFileSync(path.join(root, file), "utf8").slice(0, 300000); } catch { continue; }
    const lower = content.toLowerCase();
    const hasPermissions = /\bpermissions\s*:/i.test(content) || /"permissions"\s*:/i.test(content);
    if (!hasPermissions) findings.push({ severity: "warning", code: "missing-permissions-boundary", file });
    const writes = [];
    for (const key of ["contents", "actions", "checks", "deployments", "id-token", "packages", "pull-requests"]) {
      const pattern = new RegExp("[\"']?" + key.replace("-", "\\-") + "[\"']?\\s*:\\s*[\"']?write\\b", "i");
      if (pattern.test(content)) writes.push(key);
    }
    if (writes.length) findings.push({ severity: "error", code: "write-permission-declared", file, scopes: writes });
    if (/\brun:\s*.*\b(curl|wget|ssh|scp)\b/i.test(content)) findings.push({ severity: "warning", code: "network-shell-action", file });
    reports.push({ file, permissionsDeclared: hasPermissions, writeScopes: writes, workflowTextBytes: lower.length });
  }
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    reports,
    findings,
    limitations: ["JSON and YAML-like text declarations are inspected without executing workflows.", "No GitHub ruleset, secret or token permission is verified."]
  };
}
const tools = [
  { name: "seis_workflow_permission_audit_status", description: "Report workflow permission audit readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_workflow_permission_audit", description: "Audit bounded local workflow permission declarations.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-workflow-permission-audit", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_workflow_permission_audit_status" ? status() : name === "seis_workflow_permission_audit" ? audit(args.path) : null;
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
