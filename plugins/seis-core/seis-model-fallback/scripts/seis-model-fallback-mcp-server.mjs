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
    plugin: "seis-model-fallback",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-model-fallback", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    modelCalls: false,
    providerCalls: false,
    writes: "disabled-by-design"
  };
}
function recordsFrom(data) {
  if (Array.isArray(data)) return data.filter((value) => value && typeof value === "object");
  for (const key of ["routes", "records", "entries", "policies"]) if (Array.isArray(data?.[key])) return data[key].filter((value) => value && typeof value === "object");
  return data && typeof data === "object" ? [data] : [];
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /\.json$/i.test(file) && /route|fallback|model|router/i.test(file));
  const findings = [];
  const routes = [];
  for (const file of candidates) {
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch {
      findings.push({ severity: "error", code: "invalid-json", file });
      continue;
    }
    for (const record of recordsFrom(data)) {
      const primary = record.primary || record.primaryModel || record.model || null;
      let fallbacks = record.fallbacks || record.fallbackChain || record.fallback || [];
      if (!Array.isArray(fallbacks)) fallbacks = fallbacks ? [fallbacks] : [];
      const privacy = String(record.privacyClass || record.privacy || "").toLowerCase() || null;
      const label = String(record.id || record.name || "route");
      if (!primary) findings.push({ severity: "error", code: "missing-primary", file, route: label });
      if (fallbacks.length === 0) findings.push({ severity: "warning", code: "missing-fallback", file, route: label });
      if (privacy === "private" && fallbacks.some((value) => /cloud|remote|provider/i.test(String(value)))) findings.push({ severity: "warning", code: "privacy-fallback-needs-review", file, route: label });
      routes.push({ file, route: label, hasPrimary: Boolean(primary), fallbackCount: fallbacks.length, privacyClass: privacy });
    }
  }
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    routesScanned: routes.length,
    routes,
    findings,
    limitations: ["Only local route declarations are inspected.", "No model is ranked, selected, called or credential-checked."]
  };
}
const tools = [
  { name: "seis_model_fallback_status", description: "Report model fallback audit readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_model_fallback", description: "Audit bounded local model fallback declarations.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-model-fallback", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_model_fallback_status" ? status() : name === "seis_model_fallback" ? audit(args.path) : null;
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
