#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(scriptDir, "..");
const ignoredNames = new Set([".git", "node_modules", "dist", "build", "target", "DerivedData", ".next", "coverage", "vendor", "cache", "caches", "model-weights"]);
const requiredFiles = ["AGENTS.md", "README.md", "SECURITY.md", "CONTRIBUTING.md", "LICENSE", "project.ecosystem.yaml", ".gitignore"];
const riskName = (name) => name === ".env" || (name.startsWith(".env.") && name !== ".env.example") || /(?:\.pem|\.key|credentials\.json|tokens\.json|^id_(?:rsa|ed25519)$)$/i.test(name);

function pluginStatus() {
  return {
    plugin: "seis-repository-health",
    status: fs.existsSync(path.join(pluginRoot, ".codex-plugin", "plugin.json")) && fs.existsSync(path.join(pluginRoot, "skills", "seis-repository-health", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    gitWrites: "disabled-by-design",
    network: "disabled-by-design",
    secrets: "filenames-only-risk-hints",
  };
}

function resolveRoot(rawValue) {
  const root = path.resolve(rawValue || process.env.SEIS_WORKSPACE_ROOT || process.cwd());
  try {
    const stat = fs.lstatSync(root);
    if (stat.isSymbolicLink()) return { error: "symlink-target-refused" };
    if (!stat.isDirectory()) return { error: "repository-is-not-directory" };
    return { root };
  } catch { return { error: "repository-not-found" }; }
}

function branchName(root) {
  const gitPath = path.join(root, ".git");
  try {
    if (!fs.statSync(gitPath).isDirectory()) return "worktree-marker";
    const head = fs.readFileSync(path.join(gitPath, "HEAD"), "utf8").trim();
    return head.startsWith("ref: refs/heads/") ? head.slice("ref: refs/heads/".length) : "detached-or-unreadable";
  } catch { return "unavailable"; }
}

function gitSnapshot(root) {
  if (!fs.existsSync(path.join(root, ".git"))) return { present: false, state: "not-a-git-root" };
  const result = spawnSync("git", ["-C", root, "status", "--short", "--untracked-files=no"], { encoding: "utf8", timeout: 3000, maxBuffer: 1_000_000 });
  if (result.error || result.status !== 0) return { present: true, state: "status-unavailable", branch: branchName(root) };
  const lines = result.stdout.trim() ? result.stdout.trim().split(/\r?\n/) : [];
  return { present: true, state: lines.length ? "dirty" : "clean", branch: branchName(root), trackedChangeCount: lines.length };
}

function riskFiles(root, depth = 0, result = []) {
  if (depth > 2 || result.length >= 100) return result;
  let entries;
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return result; }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ignoredNames.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = path.join(root, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (riskName(entry.name)) result.push(path.relative(root, full).split(path.sep).join("/"));
    else if (entry.isDirectory()) riskFiles(full, depth + 1, result);
  }
  return result;
}

function scanRepository(rawValue) {
  const resolved = resolveRoot(rawValue);
  if (resolved.error) return { state: "invalid-input", error: resolved.error, mode: "local-read-only" };
  const root = resolved.root;
  const present = Object.fromEntries(requiredFiles.map((name) => [name, fs.existsSync(path.join(root, name))]));
  const manifests = ["package.json", "Cargo.toml", "Package.swift", "pyproject.toml", "go.mod", "pom.xml"].filter((name) => fs.existsSync(path.join(root, name)));
  const ciPresent = fs.existsSync(path.join(root, ".github", "workflows"));
  const risks = riskFiles(root).sort();
  const git = gitSnapshot(root);
  const findings = [];
  if (!present["README.md"]) findings.push({ severity: "warning", code: "missing-readme" });
  if (!present["SECURITY.md"]) findings.push({ severity: "warning", code: "missing-security-doc" });
  if (!present[".gitignore"]) findings.push({ severity: "warning", code: "missing-gitignore" });
  if (!ciPresent) findings.push({ severity: "info", code: "ci-workflows-not-found" });
  if (git.state === "dirty") findings.push({ severity: "warning", code: "tracked-worktree-dirty", count: git.trackedChangeCount });
  if (git.state === "status-unavailable") findings.push({ severity: "warning", code: "git-status-unavailable" });
  if (risks.length) findings.push({ severity: "warning", code: "secret-risk-filenames", paths: risks });
  return {
    state: findings.some((item) => item.severity === "warning") ? "attention" : "healthy",
    mode: "local-read-only",
    rootName: path.basename(root) || "/",
    git,
    governanceFiles: present,
    detectedManifests: manifests,
    ciWorkflowsPresent: ciPresent,
    riskFilenameCount: risks.length,
    findings,
    limitations: ["Only metadata and Git status are inspected.", "Secret-risk findings contain filenames only; values are never read or printed.", "This report does not prove successful builds, tests, deployment, or remote GitHub state."],
  };
}

const tools = [
  { name: "seis_repository_health_status", description: "Report the repository health plugin boundary.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_repository_health_scan", description: "Create a read-only repository hygiene snapshot.", inputSchema: { type: "object", properties: { path: { type: "string" } } } },
];
function send(message) { const body = JSON.stringify(message); process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`); }
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-repository-health", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_repository_health_status" ? pluginStatus() : name === "seis_repository_health_scan" ? scanRepository(args.path) : null;
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
  console.log(JSON.stringify(scanRepository(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
