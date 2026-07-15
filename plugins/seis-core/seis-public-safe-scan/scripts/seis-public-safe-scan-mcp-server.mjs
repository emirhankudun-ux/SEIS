#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models"]);
const textExtensions = new Set([".md", ".markdown", ".mdx", ".txt", ".json", ".yaml", ".yml", ".toml", ".js", ".mjs", ".ts", ".tsx", ".swift", ".py", ".go", ".rs", ".sh", ".css", ".html"]);
const patterns = [
  ["private-key-marker", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["secret-token-shape", /\b(?:sk-[A-Za-z0-9_-]{8,}|gh[pousr]_[A-Za-z0-9_]{12,}|AKIA[0-9A-Z]{12,})\b/],
  ["authorization-header", /\bBearer\s+[A-Za-z0-9._-]{12,}/i],
  ["private-host-path", /(?:\/Users\/|\/home\/[^/\s]+\/|[A-Z]:\\Users\\)/],
  ["personal-email", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ["private-vault-marker", /\b(?:private vault|personal notes|private data|local secret)\b/i]
];
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
    plugin: "seis-public-safe-scan",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-public-safe-scan", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    output: "redacted-findings-only",
    network: "disabled-by-design",
    writes: "disabled-by-design"
  };
}
function scan(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const files = filesUnder(root);
  const findings = [];
  let filesScanned = 0;
  for (const file of files) {
    const full = path.join(root, file);
    const base = path.basename(file).toLowerCase();
    if (base === ".env" || (base.startsWith(".env.") && base !== ".env.example") || /(?:credentials|tokens?|private|secret)\.(json|ya?ml|txt)$/i.test(base) || /\.(pem|key)$/i.test(base)) {
      findings.push({ severity: "warning", code: "private-risk-filename", file });
    }
    if (!textExtensions.has(path.extname(base))) continue;
    let content = "";
    try { content = fs.readFileSync(full, "utf8").slice(0, 250000); } catch { continue; }
    filesScanned += 1;
    for (const [code, pattern] of patterns) {
      const match = pattern.exec(content);
      if (match) {
        const line = content.slice(0, match.index).split(/\r?\n/).length;
        findings.push({ severity: code === "personal-email" ? "warning" : "error", code, file, line });
      }
    }
  }
  return {
    state: findings.length ? "attention" : "ready",
    ok: findings.length === 0,
    mode: "local-read-only",
    filesScanned,
    findingCount: findings.length,
    findings,
    limitations: ["Matched values and full lines are never emitted.", "This heuristic scan is not proof of public readiness."]
  };
}
const tools = [
  { name: "seis_public_safe_scan_status", description: "Report public-safe scan readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_public_safe_scan", description: "Scan bounded local files for redacted public-private boundary findings.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-public-safe-scan", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_public_safe_scan_status" ? status() : name === "seis_public_safe_scan" ? scan(args.path) : null;
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
else if (args.includes("--scan")) {
  const index = args.indexOf("--path");
  console.log(JSON.stringify(scan(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
