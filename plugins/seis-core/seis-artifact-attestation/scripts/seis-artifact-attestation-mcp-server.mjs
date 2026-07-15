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
function recordsFrom(data) {
  if (Array.isArray(data)) return data.filter((value) => value && typeof value === "object");
  for (const key of ["artifacts", "attestations", "provenance", "records", "releases"]) {
    if (Array.isArray(data?.[key])) return data[key].filter((value) => value && typeof value === "object");
  }
  return data && typeof data === "object" ? [data] : [];
}
function valueFrom(record, keys) {
  for (const key of keys) if (record?.[key] !== undefined && record[key] !== null && record[key] !== "") return record[key];
  return null;
}
function status() {
  return {
    plugin: "seis-artifact-attestation",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-artifact-attestation", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    network: "disabled-by-design",
    writes: "disabled-by-design",
    signsArtifacts: false,
    publishesArtifacts: false
  };
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /\.(json|sha256|sha512|sig|attest|txt)$/i.test(file) && /artifact|attest|provenance|release|build|checksum/i.test(file));
  const findings = [];
  const reports = [];
  let evidenceRecords = 0;
  for (const file of candidates) {
    const full = path.join(root, file);
    if (!/\.json$/i.test(file)) {
      let content = "";
      try { content = fs.readFileSync(full, "utf8").slice(0, 100000); } catch {
        findings.push({ severity: "error", code: "unreadable-evidence", file });
        continue;
      }
      const digestLines = content.split(/\r?\n/).filter((line) => /^[a-f0-9]{64,128}\s+\S+/i.test(line));
      if (!digestLines.length) findings.push({ severity: "warning", code: "missing-recognized-digest-line", file });
      reports.push({ file, kind: "text-evidence", digestLines: digestLines.length });
      evidenceRecords += digestLines.length;
      continue;
    }
    let data;
    try { data = JSON.parse(fs.readFileSync(full, "utf8")); } catch {
      findings.push({ severity: "error", code: "invalid-json", file });
      continue;
    }
    for (const [index, record] of recordsFrom(data).entries()) {
      const artifact = valueFrom(record, ["artifact", "artifactName", "subject", "file", "name"]);
      const digest = valueFrom(record, ["digest", "sha256", "sha512", "checksum", "hash"]);
      const builder = valueFrom(record, ["builder", "buildId", "source", "workflow"]);
      const createdAt = valueFrom(record, ["createdAt", "timestamp", "builtAt"]);
      const missing = [];
      if (artifact === null) missing.push("artifact");
      if (digest === null) missing.push("digest");
      if (builder === null) missing.push("builder");
      if (missing.length) findings.push({ severity: "warning", code: "incomplete-provenance-record", file, record: index + 1, missing });
      reports.push({ file, record: index + 1, artifactPresent: artifact !== null, digestPresent: digest !== null, builderPresent: builder !== null, timestampPresent: createdAt !== null });
      evidenceRecords += 1;
    }
  }
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    evidenceRecords,
    reports,
    findings,
    limitations: ["A recorded digest is not cryptographically verified by this demo.", "No signing key, registry, release service, or artifact upload is used.", "Missing evidence remains a review gap."]
  };
}
const tools = [
  { name: "seis_artifact_attestation_status", description: "Report local artifact provenance review readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_artifact_attestation", description: "Review bounded local artifact and digest evidence.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-artifact-attestation", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_artifact_attestation_status" ? status() : name === "seis_artifact_attestation" ? audit(args.path) : null;
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
