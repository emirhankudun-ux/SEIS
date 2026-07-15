#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models"]);
const manifests = new Set(["package.json", "cargo.toml", "pyproject.toml", "requirements.txt", "packages.swift", "package.swift"]);
const locks = new Set(["package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml", "cargo.lock", "poetry.lock", "pipfile.lock", "package.resolved"]);
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
    plugin: "seis-dependency-freshness",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-dependency-freshness", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    externalRegistry: "not-queried",
    writes: "disabled-by-design"
  };
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const files = filesUnder(root);
  const manifestFiles = files.filter((file) => manifests.has(path.basename(file).toLowerCase()));
  const lockFiles = files.filter((file) => locks.has(path.basename(file).toLowerCase()));
  const findings = [];
  const reports = [];
  for (const file of manifestFiles) {
    const dir = path.dirname(file);
    const nearby = lockFiles.filter((lock) => path.dirname(lock) === dir);
    if (nearby.length === 0) findings.push({ severity: "warning", code: "manifest-without-local-lockfile", file });
    reports.push({ manifest: file, localLockfiles: nearby });
  }
  return {
    state: manifestFiles.length === 0 ? "not-verified" : findings.length ? "attention" : "ready",
    ok: manifestFiles.length > 0 && findings.length === 0,
    mode: "local-read-only",
    manifestCount: manifestFiles.length,
    lockfileCount: lockFiles.length,
    reports,
    findings,
    limitations: ["This checks local declaration and lockfile presence only.", "No registry, vulnerability database or package age is queried."]
  };
}
const tools = [
  { name: "seis_dependency_freshness_status", description: "Report local dependency freshness readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_dependency_freshness", description: "Audit local dependency and lockfile coverage.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-dependency-freshness", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_dependency_freshness_status" ? status() : name === "seis_dependency_freshness" ? audit(args.path) : null;
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
