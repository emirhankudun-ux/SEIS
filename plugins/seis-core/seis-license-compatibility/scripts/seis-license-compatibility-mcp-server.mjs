#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models"]);
const allowed = new Set(["mit", "apache-2.0", "bsd-2-clause", "bsd-3-clause", "isc", "mpl-2.0", "unlicense", "cc0-1.0", "unlicensed-local"]);
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
    plugin: "seis-license-compatibility",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-license-compatibility", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    legalApproval: false,
    writes: "disabled-by-design"
  };
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const files = filesUnder(root);
  const packages = files.filter((file) => path.basename(file).toLowerCase() === "package.json");
  const licenseFiles = files.filter((file) => /^(license|licence|copying)(\.[A-Za-z0-9._-]+)?$/i.test(path.basename(file)));
  const findings = [];
  const records = [];
  for (const file of packages) {
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch {
      findings.push({ severity: "error", code: "invalid-json", file });
      continue;
    }
    const declared = typeof data.license === "string" ? data.license : null;
    const normalized = declared ? declared.toLowerCase().replace(/[()]/g, "").trim() : null;
    if (!declared) findings.push({ severity: "warning", code: "missing-license-field", file });
    else if (!allowed.has(normalized) && !normalized.includes("or")) findings.push({ severity: "warning", code: "unknown-license-policy", file });
    records.push({ file, package: data.name || path.dirname(file), licenseDeclared: Boolean(declared), policyClass: declared ? (allowed.has(normalized) ? "recognized" : "review") : "missing" });
  }
  if (packages.length === 0 && licenseFiles.length === 0) findings.push({ severity: "warning", code: "no-license-evidence" });
  return {
    state: packages.length === 0 && licenseFiles.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: (packages.length > 0 || licenseFiles.length > 0) && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    packageFiles: packages.length,
    licenseFiles: licenseFiles.length,
    records,
    findings,
    limitations: ["Policy matching is a local heuristic, not legal advice.", "No asset, dependency registry or license database is queried."]
  };
}
const tools = [
  { name: "seis_license_compatibility_status", description: "Report local license audit readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_license_compatibility", description: "Audit bounded local license declarations.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-license-compatibility", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_license_compatibility_status" ? status() : name === "seis_license_compatibility" ? audit(args.path) : null;
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
