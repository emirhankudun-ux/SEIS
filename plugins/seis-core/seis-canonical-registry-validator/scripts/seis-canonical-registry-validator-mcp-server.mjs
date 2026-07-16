#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(scriptDir, "..");
const ignoredNames = new Set([".git", "node_modules", "dist", "build", "target", "DerivedData", ".next", "coverage", "vendor", "cache", "caches", "model-weights"]);
const allowedStatuses = new Set(["proposed", "approved-local-readonly", "approved-public-readonly", "functional-local-demo", "experimental", "beta", "stable", "deprecated", "removed", "active", "planned", "blocked", "completed"]);

function pluginStatus() {
  return {
    plugin: "seis-canonical-registry-validator",
    status: fs.existsSync(path.join(pluginRoot, ".codex-plugin", "plugin.json")) && fs.existsSync(path.join(pluginRoot, "skills", "seis-canonical-registry-validator", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    supportedSource: "bounded JSON registry projections",
    writes: "disabled-by-design",
    network: "disabled-by-design",
  };
}

function collectRegistryFiles(root, depth = 0, result = []) {
  if (depth > 4 || result.length >= 200) return result;
  let entries;
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return result; }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ignoredNames.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = path.join(root, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) collectRegistryFiles(full, depth + 1, result);
    else if (entry.isFile() && entry.name.endsWith(".json")) {
      const relative = path.relative(root, full).split(path.sep).join("/").toLowerCase();
      if (relative.includes("registr") || relative.includes("catalog")) result.push(full);
    }
  }
  return result;
}

function recordsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (typeof payload.id === "string") return [payload];
  const records = [];
  for (const key of ["records", "items", "entries", "plugins", "agents", "providers", "models", "tools", "skills", "servers"]) {
    if (Array.isArray(payload[key])) records.push(...payload[key]);
  }
  return records;
}

function validateRegistries(rawPath) {
  const root = path.resolve(rawPath || process.env.SEIS_WORKSPACE_ROOT || process.cwd());
  if (!fs.existsSync(root)) return { state: "invalid-input", error: "workspace-not-found", mode: "local-read-only" };
  const files = collectRegistryFiles(root);
  const findings = [];
  const ids = new Map();
  let recordsScanned = 0;
  for (const file of files) {
    const relative = path.relative(root, file).split(path.sep).join("/");
    let payload;
    try { payload = JSON.parse(fs.readFileSync(file, "utf8")); } catch { findings.push({ severity: "error", code: "invalid-json", file: relative }); continue; }
    const records = recordsFromPayload(payload);
    for (const record of records) {
      recordsScanned += 1;
      if (!record || typeof record !== "object") {
        findings.push({ severity: "error", code: "record-not-object", file: relative });
        continue;
      }
      const id = typeof record.id === "string" ? record.id.trim() : "";
      if (!id) findings.push({ severity: "error", code: "missing-stable-id", file: relative });
      else if (ids.has(id)) findings.push({ severity: "error", code: "duplicate-stable-id", id, files: [ids.get(id), relative] });
      else ids.set(id, relative);
      const status = typeof record.status === "string" ? record.status.trim() : "";
      if (!status) findings.push({ severity: "warning", code: "missing-status", file: relative, id: id || null });
      else if (!allowedStatuses.has(status)) findings.push({ severity: "warning", code: "unknown-status", file: relative, id: id || null, status });
      if (!record.owner && !record.ownerAgent && !record.canonicalOwner && !record.canonical_owner_repo) findings.push({ severity: "warning", code: "missing-owner", file: relative, id: id || null });
    }
  }
  const errors = findings.filter((item) => item.severity === "error");
  return {
    state: errors.length ? "attention" : files.length ? "ready" : "not-verified",
    ok: errors.length === 0 && files.length > 0,
    mode: "local-read-only",
    filesScanned: files.length,
    recordsScanned,
    uniqueIds: ids.size,
    findings,
    limitations: ["Only JSON files under bounded registry/catalog paths are inspected.", "Generated projections are not treated as canonical without repository evidence.", "No registry file is modified."],
  };
}

const tools = [
  { name: "seis_registry_validator_status", description: "Report the registry validator boundary.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_registry_validate", description: "Validate bounded JSON registry projections for IDs, owners, statuses, and duplicates.", inputSchema: { type: "object", properties: { path: { type: "string" } } } },
];
function send(message) { const body = JSON.stringify(message); process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`); }
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-canonical-registry-validator", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_registry_validator_status" ? pluginStatus() : name === "seis_registry_validate" ? validateRegistries(args.path) : null;
    if (result) send({ jsonrpc: "2.0", id: message.id, result });
    else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${name ?? "undefined"}` } });
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
    try { handle(JSON.parse(pending.slice(start, start + length).toString("utf8"))); } catch { /* ignore malformed input */ }
    pending = pending.slice(start + length);
  }
}
const args = process.argv.slice(2);
if (args.includes("--status")) console.log(JSON.stringify(pluginStatus(), null, 2));
else if (args.includes("--validate")) {
  const index = args.indexOf("--path");
  console.log(JSON.stringify(validateRegistries(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
