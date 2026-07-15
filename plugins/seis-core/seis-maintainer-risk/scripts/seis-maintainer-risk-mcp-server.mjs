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
  for (const key of ["maintainers", "owners", "modules", "areas", "records", "items"]) {
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
    plugin: "seis-maintainer-risk",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-maintainer-risk", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    network: "disabled-by-design",
    writes: "disabled-by-design",
    source: "recorded-local-maintainer-and-activity-evidence",
    identityOutput: "redacted-presence-only"
  };
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /\.json$/i.test(file) && /maintain|owner|activity|risk|contributor/i.test(file));
  const findings = [];
  const reports = [];
  const now = Date.now();
  for (const file of candidates) {
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch {
      findings.push({ severity: "error", code: "invalid-json", file });
      continue;
    }
    for (const [index, record] of recordsFrom(data).entries()) {
      const owner = valueFrom(record, ["owner", "maintainer", "maintainers", "codeowner"]);
      const area = String(valueFrom(record, ["area", "module", "path", "scope"]) ?? "unassigned");
      const activityValue = valueFrom(record, ["lastActivityAt", "lastCommitAt", "updatedAt", "activityAt"]);
      const activityTimestamp = activityValue === null ? null : Date.parse(String(activityValue));
      const ageDays = Number.isFinite(activityTimestamp) ? Math.max(0, (now - activityTimestamp) / 86400000) : null;
      const busFactor = Number(valueFrom(record, ["busFactor", "ownerCount", "maintainerCount"]));
      const critical = /critical|core|production/i.test(String(valueFrom(record, ["criticality", "risk", "importance"]) ?? ""));
      const reasons = [];
      if (owner === null) reasons.push("missing-owner");
      if (ageDays === null) reasons.push("missing-activity");
      else if (ageDays > 90) reasons.push("stale-activity-over-90-days");
      else if (ageDays > 30) reasons.push("stale-activity-over-30-days");
      if (Number.isFinite(busFactor) && busFactor <= 1) reasons.push("bus-factor-one");
      if (critical && reasons.length) reasons.push("critical-area");
      const level = reasons.some((reason) => /missing-owner|over-90|bus-factor-one/.test(reason)) ? "high" : reasons.length ? "medium" : "low";
      if (level !== "low") findings.push({ severity: "warning", code: "maintainer-risk-signal", file, record: index + 1, level });
      reports.push({ file, record: index + 1, area, ownerPresent: owner !== null, lastActivityAgeDays: ageDays, busFactor: Number.isFinite(busFactor) ? busFactor : null, riskLevel: level, reasons });
    }
  }
  return {
    state: candidates.length === 0 ? "not-verified" : findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    filesScanned: candidates.length,
    areasScanned: reports.length,
    riskCounts: { high: reports.filter((report) => report.riskLevel === "high").length, medium: reports.filter((report) => report.riskLevel === "medium").length, low: reports.filter((report) => report.riskLevel === "low").length },
    reports,
    findings,
    limitations: ["Owner identities are represented only as presence.", "Staleness is calculated from supplied timestamps at audit time.", "Risk signals require human governance review and are not judgments about people."]
  };
}
const tools = [
  { name: "seis_maintainer_risk_status", description: "Report maintainer-risk analysis readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_maintainer_risk", description: "Assess bounded recorded ownership and activity risk signals.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-maintainer-risk", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_maintainer_risk_status" ? status() : name === "seis_maintainer_risk" ? audit(args.path) : null;
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
