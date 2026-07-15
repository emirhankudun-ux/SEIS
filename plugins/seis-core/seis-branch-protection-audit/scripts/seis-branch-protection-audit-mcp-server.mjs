#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models"]);
const signals = [
  ["requiredStatusChecks", /required[_-]?status|status checks|checks required/i],
  ["requiredReviews", /required[_-]?(pull[_-]?)?request[_-]?reviews|approving reviews|review(?:s)? required/i],
  ["administratorEnforcement", /enforce[_-]?admins|enforceAdmins|administrator(?:s)? enforcement/i],
  ["forcePushBlocked", /allow[_-]?force[_-]?push\s*[:=]\s*(false|no)|force push\s*(blocked|disabled)|non[_-]?fast[_-]?forward/i],
  ["linearHistory", /linear[_-]?history|rebase[_-]?only/i]
];
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
    plugin: "seis-branch-protection-audit",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-branch-protection-audit", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    network: "disabled-by-design",
    githubRulesetsQueried: false,
    writes: "disabled-by-design"
  };
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /\.(json|ya?ml)$/i.test(file) && (/(^|\/)\.github\//i.test(file) || /branch|protection|ruleset|policy/i.test(path.basename(file))));
  const findings = [];
  const reports = [];
  for (const file of candidates) {
    let content = "";
    try { content = fs.readFileSync(path.join(root, file), "utf8").slice(0, 250000); } catch {
      findings.push({ severity: "error", code: "unreadable-policy", file });
      continue;
    }
    const present = Object.fromEntries(signals.map(([id, pattern]) => [id, pattern.test(content)]));
    const missing = Object.entries(present).filter(([, value]) => !value).map(([id]) => id);
    if (missing.length) findings.push({ severity: "warning", code: "policy-signal-missing", file, missing });
    reports.push({ file, signals: present, bytesInspected: content.length });
  }
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    reports,
    findings,
    limitations: ["Text and local policy declarations are inspected without executing or contacting GitHub.", "Presence of a signal does not prove an active remote ruleset.", "Missing signals require human policy review."]
  };
}
const tools = [
  { name: "seis_branch_protection_audit_status", description: "Report branch protection audit readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_branch_protection_audit", description: "Audit bounded local branch and ruleset policy evidence.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-branch-protection-audit", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_branch_protection_audit_status" ? status() : name === "seis_branch_protection_audit" ? audit(args.path) : null;
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
