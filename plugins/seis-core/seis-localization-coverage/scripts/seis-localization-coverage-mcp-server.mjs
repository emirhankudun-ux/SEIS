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
    plugin: "seis-localization-coverage",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-localization-coverage", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    translates: false,
    writes: "disabled-by-design"
  };
}
function flatten(value, prefix = "", output = []) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    if (prefix) output.push(prefix);
    return output;
  }
  for (const [key, child] of Object.entries(value)) flatten(child, prefix ? prefix + "." + key : key, output);
  return output;
}
function audit(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { state: "not-verified", ok: false, mode: "local-read-only", reason: "directory-not-found" };
  const candidates = filesUnder(root).filter((file) => /\.json$/i.test(file) && (/(^|\/)(locale|locales|i18n|translation|translations|lang)(\/|$)/i.test(file) || /(^|\/)[a-z]{2}(?:[-_][A-Z]{2})?\.json$/i.test(file)));
  const findings = [];
  const locales = [];
  for (const file of candidates) {
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch {
      findings.push({ severity: "error", code: "invalid-json", file });
      continue;
    }
    const dictionary = data && typeof data.translations === "object" ? data.translations : data;
    const keys = [...new Set(flatten(dictionary))];
    const locale = path.basename(file, path.extname(file));
    locales.push({ file, locale, keys });
  }
  if (locales.length < 2) return { state: "not-verified", ok: false, mode: "local-read-only", filesScanned: locales.length, findings, limitations: ["At least two local locale dictionaries are required for comparison.", "No translations are generated or changed."] };
  const preferred = locales.find((entry) => /^(en|en[-_]US)$/i.test(entry.locale)) || locales[0];
  const base = new Set(preferred.keys);
  const reports = locales.map((locale) => {
    const keys = new Set(locale.keys);
    const missing = [...base].filter((key) => !keys.has(key)).length;
    const extra = [...keys].filter((key) => !base.has(key)).length;
    if (missing) findings.push({ severity: "warning", code: "missing-locale-keys", file: locale.file, locale: locale.locale, missingCount: missing });
    return { file: locale.file, locale: locale.locale, keyCount: keys.size, missingCount: missing, extraCount: extra, coveragePercent: base.size ? Math.round(((base.size - missing) / base.size) * 100) : 100 };
  });
  return {
    state: findings.some((finding) => finding.severity === "error") ? "attention" : "ready",
    ok: !findings.some((finding) => finding.severity === "error"),
    mode: "local-read-only",
    baseLocale: preferred.locale,
    filesScanned: locales.length,
    baseKeyCount: base.size,
    reports,
    findings,
    limitations: ["Coverage compares keys only and does not judge translation quality.", "No locale file is modified or published."]
  };
}
const tools = [
  { name: "seis_localization_coverage_status", description: "Report localization coverage readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_localization_coverage", description: "Compare bounded local locale dictionary keys.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-localization-coverage", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_localization_coverage_status" ? status() : name === "seis_localization_coverage" ? audit(args.path) : null;
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
