#!/usr/bin/env node
import crypto from "node:crypto";
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
function recordsFrom(data) {
  if (Array.isArray(data)) return data.filter((value) => value && typeof value === "object");
  for (const key of ["contributors", "owners", "maintainers", "entries", "records"]) {
    if (Array.isArray(data?.[key])) return data[key].filter((value) => value && typeof value === "object");
  }
  return data && typeof data === "object" ? [data] : [];
}
function valueFrom(record, keys) {
  for (const key of keys) if (record?.[key] !== undefined && record[key] !== null && record[key] !== "") return record[key];
  return null;
}
function redacted(value, fallback) {
  const source = String(value ?? fallback);
  return "person-" + crypto.createHash("sha256").update(source).digest("hex").slice(0, 10);
}
function status() {
  return {
    plugin: "seis-contributor-map",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-contributor-map", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    network: "disabled-by-design",
    writes: "disabled-by-design",
    source: "recorded-local-contributor-and-ownership-evidence",
    redaction: "deterministic-identifiers-only"
  };
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /\.json$/i.test(file) && /contributor|codeowner|ownership|maintainer/i.test(file));
  const findings = [];
  const people = new Map();
  const areas = new Map();
  let recordsScanned = 0;
  for (const file of candidates) {
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch {
      findings.push({ severity: "error", code: "invalid-json", file });
      continue;
    }
    for (const [index, record] of recordsFrom(data).entries()) {
      recordsScanned += 1;
      const rawIdentity = valueFrom(record, ["login", "username", "name", "email", "id", "owner"]);
      const id = redacted(rawIdentity, file + ":" + (index + 1));
      const area = String(valueFrom(record, ["area", "module", "path", "scope", "team"]) ?? "unassigned");
      const role = String(valueFrom(record, ["role", "type"]) ?? "contributor").toLowerCase();
      if (!people.has(id)) people.set(id, { id, roles: new Set(), areas: new Set(), records: 0 });
      const person = people.get(id);
      person.roles.add(role);
      person.areas.add(area);
      person.records += 1;
      areas.set(area, (areas.get(area) || 0) + 1);
      if (rawIdentity === null) findings.push({ severity: "warning", code: "missing-identity-field", file, record: index + 1 });
    }
  }
  const contributorRows = [...people.values()].map((person) => ({ id: person.id, roles: [...person.roles].sort(), areas: [...person.areas].sort(), records: person.records }));
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    recordsScanned,
    uniqueRedactedContributors: contributorRows.length,
    ownershipByArea: Object.fromEntries([...areas.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
    contributors: contributorRows,
    findings,
    limitations: ["Raw names, emails, and handles are never emitted.", "Only matching local JSON evidence is analyzed.", "The map is not a live GitHub or organizational ownership source."]
  };
}
const tools = [
  { name: "seis_contributor_map_status", description: "Report contributor map readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_contributor_map", description: "Aggregate bounded ownership evidence with redacted identifiers.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-contributor-map", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_contributor_map_status" ? status() : name === "seis_contributor_map" ? audit(args.path) : null;
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
