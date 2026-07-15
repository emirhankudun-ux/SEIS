#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models"]);
const packageFiles = new Set(["package.json", "cargo.toml", "pyproject.toml", "requirements.txt", "package.swift"]);
const lockFiles = new Set(["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "cargo.lock", "poetry.lock", "package.resolved"]);
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
    plugin: "seis-sbom-generator",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-sbom-generator", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    artifactWritten: false,
    registry: "not-queried",
    writes: "disabled-by-design"
  };
}
function generate(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const files = filesUnder(root);
  const components = [];
  const findings = [];
  for (const file of files.filter((file) => packageFiles.has(path.basename(file).toLowerCase()))) {
    const full = path.join(root, file);
    if (path.basename(file).toLowerCase() === "package.json") {
      let data;
      try { data = JSON.parse(fs.readFileSync(full, "utf8")); } catch {
        findings.push({ severity: "error", code: "invalid-json", file });
        continue;
      }
      components.push({ type: "library", name: data.name || path.dirname(file), version: data.version || null, licenseDeclared: typeof data.license === "string" });
    } else {
      components.push({ type: "manifest", name: path.basename(file), version: null, licenseDeclared: false });
    }
  }
  const localLocks = files.filter((file) => lockFiles.has(path.basename(file).toLowerCase())).length;
  return {
    state: components.length === 0 ? "not-verified" : findings.length ? "attention" : "ready",
    ok: components.length > 0 && findings.length === 0,
    mode: "local-read-only",
    components,
    componentCount: components.length,
    lockfileCount: localLocks,
    artifactWritten: false,
    findings,
    limitations: ["This is an in-memory local projection, not a complete SBOM artifact.", "No registry, license database or dependency resolver is queried."]
  };
}
const tools = [
  { name: "seis_sbom_generator_status", description: "Report local SBOM projection readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_sbom_generate", description: "Generate an in-memory redacted SBOM projection from local manifests.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-sbom-generator", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_sbom_generator_status" ? status() : name === "seis_sbom_generate" ? generate(args.path) : null;
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
else if (args.includes("--generate")) {
  const index = args.indexOf("--path");
  console.log(JSON.stringify(generate(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
