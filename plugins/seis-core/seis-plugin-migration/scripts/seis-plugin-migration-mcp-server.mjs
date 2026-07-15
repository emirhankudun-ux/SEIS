#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function status() {
  return {
    plugin: "seis-plugin-migration",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-plugin-migration", "SKILL.md")) ? "ready" : "partial",
    mode: "metadata-only-dry-run",
    network: "disabled-by-design",
    executesCandidateCode: false,
    copiesFiles: false,
    writes: "disabled-by-design"
  };
}
function readJson(file) {
  try { return { data: JSON.parse(fs.readFileSync(file, "utf8")) }; }
  catch { return { error: "invalid-json" }; }
}
function candidateDirs(root) {
  const ownManifest = path.join(root, ".codex-plugin", "plugin.json");
  if (fs.existsSync(ownManifest)) return [{ directory: root, relativePath: "." }];
  let entries = [];
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return []; }
  return entries.filter((entry) => entry.isDirectory() && !entry.isSymbolicLink() && !entry.name.startsWith("."))
    .map((entry) => ({ directory: path.join(root, entry.name), relativePath: entry.name }))
    .filter(({ directory }) => fs.existsSync(path.join(directory, ".codex-plugin", "plugin.json")));
}
function inspectCandidate(candidate) {
  const manifestPath = path.join(candidate.directory, ".codex-plugin", "plugin.json");
  const profilePath = path.join(candidate.directory, "assets", "plugin-profile.json");
  const skillPath = path.join(candidate.directory, "skills");
  const manifestResult = readJson(manifestPath);
  const profileResult = fs.existsSync(profilePath) ? readJson(profilePath) : { error: "profile-missing" };
  const blockers = [];
  const manifest = manifestResult.data;
  const profile = profileResult.data;
  if (manifestResult.error) blockers.push(manifestResult.error);
  if (profileResult.error) blockers.push(profileResult.error);
  if (!manifest?.name) blockers.push("manifest-name-missing");
  if (!manifest?.version) blockers.push("manifest-version-missing");
  if (!profile?.sourceClassification) blockers.push("source-classification-missing");
  if (!profile?.license) blockers.push("license-missing");
  if (!profile?.rollback) blockers.push("rollback-missing");
  const permissions = profile?.permissions;
  if (!permissions || !Array.isArray(permissions.write) || !Array.isArray(permissions.network)) blockers.push("permission-boundary-missing");
  if (Array.isArray(permissions?.write) && permissions.write.length) blockers.push("write-permission-declared");
  if (Array.isArray(permissions?.network) && permissions.network.length) blockers.push("network-permission-declared");
  if (!fs.existsSync(skillPath)) blockers.push("skill-directory-missing");
  return {
    relativePath: candidate.relativePath,
    name: manifest?.name ?? null,
    version: manifest?.version ?? null,
    sourceClassification: profile?.sourceClassification ?? null,
    reviewState: profile?.reviewState ?? null,
    classification: blockers.length ? "needs-review" : "ready-for-reviewed-import",
    blockers,
    wouldCopy: false,
    wouldExecute: false
  };
}
function plan(input) {
  if (!input) return { state: "invalid-input", ok: false, mode: "metadata-only-dry-run", reason: "explicit-path-required" };
  const root = path.resolve(String(input));
  let stat;
  try { stat = fs.lstatSync(root); } catch { return { state: "not-verified", ok: false, mode: "metadata-only-dry-run", reason: "directory-not-found" }; }
  if (!stat.isDirectory()) return { state: "invalid-input", ok: false, mode: "metadata-only-dry-run", reason: "path-is-not-directory" };
  if (stat.isSymbolicLink()) return { state: "blocked", ok: false, mode: "metadata-only-dry-run", reason: "symlink-root-refused" };
  const candidates = candidateDirs(root).map(inspectCandidate);
  return {
    state: candidates.length ? "ready" : "not-verified",
    ok: candidates.length > 0 && candidates.every((candidate) => candidate.classification === "ready-for-reviewed-import"),
    mode: "metadata-only-dry-run",
    rootSelected: true,
    candidatesScanned: candidates.length,
    readyForReviewedImport: candidates.filter((candidate) => candidate.classification === "ready-for-reviewed-import").length,
    candidates,
    dryRun: true,
    copyPlan: [],
    limitations: ["No files are copied, executed, committed, or registered.", "Readiness is a metadata gate and does not grant authorization for migration.", "Human ownership, rights, dependency, and Git diff review remain required."]
  };
}
const tools = [
  { name: "seis_plugin_migration_status", description: "Report metadata-only migration planning readiness.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_plugin_migration", description: "Create a dry-run plan for an explicitly selected plugin root.", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } }
];
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-plugin-migration", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_plugin_migration_status" ? status() : name === "seis_plugin_migration" ? plan(args.path) : null;
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
else if (args.includes("--plan")) {
  const index = args.indexOf("--path");
  console.log(JSON.stringify(plan(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
