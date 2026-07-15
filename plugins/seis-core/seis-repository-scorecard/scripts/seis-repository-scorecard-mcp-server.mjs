#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "build", "dist", "coverage", "node_modules", "vendor", "cache", "caches", "models", "tmp"]);

function rootFor(value) {
  return path.resolve(String(value || process.cwd()));
}

function filesUnder(root, limit = 450) {
  const result = [];
  function visit(dir) {
    if (result.length >= limit) return;
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (result.length >= limit || entry.isSymbolicLink()) return;
      if (ignored.has(entry.name) || entry.name.startsWith(".")) {
        if (entry.isDirectory()) continue;
      }
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
    plugin: "seis-repository-scorecard",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-repository-scorecard", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    popularitySignals: false,
    network: "disabled-by-design",
    writes: "disabled-by-design"
  };
}

function score(input) {
  const root = rootFor(input);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return { state: "not-verified", ok: false, mode: "local-read-only", root: root, reason: "directory-not-found" };
  }
  const files = filesUnder(root);
  const lower = files.map((file) => file.toLowerCase());
  const hasName = (names) => names.some((name) => lower.some((file) => path.basename(file) === name.toLowerCase()));
  const hasPath = (pattern) => lower.some((file) => pattern.test(file));
  const checks = [
    { id: "identity", weight: 20, ok: hasName(["readme.md", "agents.md"]) },
    { id: "security", weight: 20, ok: hasName(["security.md", ".env.example"]) },
    { id: "governance", weight: 15, ok: hasName(["codeowners", "contributing.md", "project.ecosystem.yaml", "project.ecosystem.yml"]) || hasPath(/governance|docs\/security/) },
    { id: "testing", weight: 15, ok: hasPath(/(^|\/)(test|tests|spec|__tests__)(\/|$)/) },
    { id: "automation", weight: 15, ok: hasPath(/(^|\/)\.github\/workflows\//) || hasName(["makefile", "justfile"]) },
    { id: "release", weight: 15, ok: hasName(["changelog.md", "release-notes.md", "release.md"]) }
  ];
  const points = checks.reduce((sum, check) => sum + (check.ok ? check.weight : 0), 0);
  return {
    state: "ready",
    ok: true,
    mode: "local-read-only",
    rootName: path.basename(root),
    filesScanned: files.length,
    score: points,
    scale: 100,
    checks,
    missingEvidence: checks.filter((check) => !check.ok).map((check) => check.id),
    limitations: [
      "The score uses local evidence only and excludes popularity, stars and external GitHub metrics.",
      "A scorecard is not a security, release or architecture approval."
    ]
  };
}

const tools = [
  { name: "seis_repository_scorecard_status", description: "Report local repository scorecard readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_repository_scorecard", description: "Score bounded local repository evidence without popularity signals.", inputSchema: { type: "object", properties: { path: { type: "string" } } } }
];

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-repository-scorecard", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_repository_scorecard_status" ? status() : name === "seis_repository_scorecard" ? score(args.path) : null;
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
else if (args.includes("--score")) {
  const index = args.indexOf("--path");
  console.log(JSON.stringify(score(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
