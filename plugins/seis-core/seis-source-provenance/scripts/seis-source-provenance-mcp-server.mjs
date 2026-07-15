#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(scriptDir, "..");
const ignoredNames = new Set([".git", "node_modules", "dist", "build", "target", "DerivedData", ".next", "coverage", "vendor", "cache", "caches", "model-weights"]);
const maxBytes = 5 * 1024 * 1024;
const privateName = (name) => name === ".env" || (name.startsWith(".env.") && name !== ".env.example") || /(?:secret|credential|token|private|\.pem$|\.key$|^id_(?:rsa|ed25519)$)/i.test(name);
const generatedName = (name) => /(?:^|[-_.])(dist|build|generated|compiled|coverage)(?:[-_.]|$)/i.test(name);

function pluginStatus() {
  return {
    plugin: "seis-source-provenance",
    status: fs.existsSync(path.join(pluginRoot, ".codex-plugin", "plugin.json")) && fs.existsSync(path.join(pluginRoot, "skills", "seis-source-provenance", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    hashing: "SHA-256",
    upload: "disabled-by-design",
    writes: "disabled-by-design",
  };
}

function classify(relativePath) {
  const name = path.basename(relativePath).toLowerCase();
  const ext = path.extname(name);
  if (generatedName(name) || relativePath.split("/").some((part) => /^(dist|build|generated|coverage)$/.test(part))) return "generated-or-build";
  if ([".md", ".mdx", ".txt", ".rst"].includes(ext)) return "documentation";
  if ([".json", ".yaml", ".yml", ".toml", ".xml", ".ini"].includes(ext) || ["package.json", "project.ecosystem.yaml", "cargo.toml"].includes(name)) return "manifest-or-config";
  if ([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".swift", ".rs", ".py", ".go", ".java", ".kt", ".css", ".html", ".sql", ".sh"].includes(ext)) return "source-code";
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".mp4", ".mov", ".wav", ".mp3", ".pdf"].includes(ext)) return "asset";
  if ([".test", ".spec"].some((suffix) => name.includes(suffix)) || relativePath.split("/").includes("tests")) return "test";
  return "unknown";
}

function collectFiles(root, depth = 0, result = []) {
  if (depth > 4 || result.length >= 250) return result;
  let entries;
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return result; }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ignoredNames.has(entry.name)) continue;
    const full = path.join(root, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) collectFiles(full, depth + 1, result);
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

function provenance(rawPath, requestedLimit) {
  const root = path.resolve(rawPath || process.env.SEIS_WORKSPACE_ROOT || process.cwd());
  try {
    const stat = fs.lstatSync(root);
    if (stat.isSymbolicLink()) return { state: "invalid-input", error: "symlink-target-refused", mode: "local-read-only" };
    if (!stat.isDirectory()) return { state: "invalid-input", error: "workspace-is-not-directory", mode: "local-read-only" };
  } catch { return { state: "invalid-input", error: "workspace-not-found", mode: "local-read-only" }; }
  const limit = Math.max(1, Math.min(Number.parseInt(requestedLimit || "250", 10) || 250, 250));
  const candidates = collectFiles(root).slice(0, limit);
  const files = [];
  const skipped = [];
  for (const file of candidates) {
    const relative = path.relative(root, file).split(path.sep).join("/");
    const name = path.basename(file);
    if (privateName(name) || relative.split("/").some((part) => /^(secrets|private|credentials|tokens|\.ssh)$/.test(part))) {
      skipped.push({ path: relative, reason: "private-risk-name" });
      continue;
    }
    let stat;
    try { stat = fs.statSync(file); } catch { skipped.push({ path: relative, reason: "stat-unavailable" }); continue; }
    if (stat.size > maxBytes) {
      skipped.push({ path: relative, reason: "file-too-large", sizeBytes: stat.size });
      continue;
    }
    try {
      const digest = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
      const category = classify(relative);
      files.push({ path: relative, sizeBytes: stat.size, sha256: digest, category, rightsState: category === "asset" || category === "unknown" ? "review-required" : "unknown-local" });
    } catch { skipped.push({ path: relative, reason: "read-unavailable" }); }
  }
  const rightsReviewCount = files.filter((file) => file.rightsState === "review-required").length;
  return {
    state: rightsReviewCount || skipped.length ? "attention" : "ready",
    mode: "local-read-only",
    rootName: path.basename(root) || "/",
    filesScanned: files.length,
    skippedCount: skipped.length,
    rightsReviewCount,
    files,
    skipped,
    limitations: ["Relative paths and hashes are emitted; file contents are never emitted.", "Private-risk filenames are skipped rather than opened.", "A hash proves file identity at scan time, not ownership, license compatibility, or public-readiness."],
  };
}

const tools = [
  { name: "seis_source_provenance_status", description: "Report the provenance plugin boundary.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_source_provenance_scan", description: "Hash and classify a bounded local file set without uploading or writing.", inputSchema: { type: "object", properties: { path: { type: "string" }, maxFiles: { type: "integer", minimum: 1, maximum: 250 } } } },
];
function send(message) { const body = JSON.stringify(message); process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`); }
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-source-provenance", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_source_provenance_status" ? pluginStatus() : name === "seis_source_provenance_scan" ? provenance(args.path, args.maxFiles) : null;
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
else if (args.includes("--scan")) {
  const index = args.indexOf("--path");
  const limitIndex = args.indexOf("--max-files");
  console.log(JSON.stringify(provenance(index >= 0 ? args[index + 1] : undefined, limitIndex >= 0 ? args[limitIndex + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
