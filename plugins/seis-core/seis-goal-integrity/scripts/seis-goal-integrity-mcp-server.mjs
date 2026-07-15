#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(scriptDir, "..");
const ignoredNames = new Set([".git", "node_modules", "dist", "build", "target", ".next", "coverage", "vendor", "cache", "caches"]);
const allowedStatuses = new Set(["idea", "proposed", "planned", "active", "in-progress", "in-review", "validated", "completed", "blocked", "deferred", "archived", "deprecated", "cancelled"]);
const goalIdPattern = /^[A-Z0-9]+-GOAL-\d{3,}$/;

function pluginStatus() {
  return {
    plugin: "seis-goal-integrity",
    status: fs.existsSync(path.join(pluginRoot, ".codex-plugin", "plugin.json")) && fs.existsSync(path.join(pluginRoot, "skills", "seis-goal-integrity", "SKILL.md")) ? "ready" : "partial",
    mode: "local-read-only",
    parser: "bounded YAML key heuristic plus JSON records",
    writes: "disabled-by-design",
    network: "disabled-by-design",
  };
}

function collectFiles(root, depth = 0, result = []) {
  if (depth > 4 || result.length >= 500) return result;
  let entries;
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return result; }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ignoredNames.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = path.join(root, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      const rel = path.relative(root, full).split(path.sep).join("/");
      if (rel === "goals" || rel === "docs" || rel.startsWith("goals/") || rel === "docs/goals" || rel.startsWith("docs/goals/")) collectFiles(full, depth + 1, result);
    } else if (entry.isFile() && /\.(ya?ml|json)$/i.test(entry.name)) {
      const rel = path.relative(root, full).split(path.sep).join("/");
      if (rel.startsWith("goals/") || rel.startsWith("docs/goals/") || /goal/i.test(entry.name)) result.push(full);
    }
  }
  return result;
}

function parseGoal(filePath) {
  let contents;
  try { contents = fs.readFileSync(filePath, "utf8"); } catch { return { file: path.basename(filePath), parseError: "unreadable" }; }
  if (filePath.endsWith(".json")) {
    try {
      const value = JSON.parse(contents);
      if (Array.isArray(value)) return { records: value, file: path.basename(filePath) };
      return { record: value, file: path.basename(filePath) };
    } catch { return { file: path.basename(filePath), parseError: "invalid-json" }; }
  }
  const readKey = (key) => {
    const match = new RegExp(`(?:^|\\n)\\s*${key}\\s*:\\s*["']?([^"'\\n#]+)`).exec(contents);
    return match?.[1]?.trim() || null;
  };
  return {
    record: {
      id: readKey("id"),
      title: readKey("title"),
      status: readKey("status"),
      evidence: /(?:^|\n)\s*evidence\s*:/i.test(contents),
      validation: /(?:^|\n)\s*validation\s*:/i.test(contents),
      blockedBy: /(?:^|\n)\s*(?:blocked_by|blockedBy|blocker)\s*:/i.test(contents),
    },
    file: path.basename(filePath),
  };
}

function normalizeRecords(parsed) {
  if (Array.isArray(parsed.records)) return parsed.records.map((record) => ({ record, file: parsed.file }));
  return [{ record: parsed.record, file: parsed.file, parseError: parsed.parseError }];
}

function validateGoals(rawPath, primaryGoalId = "SEIS-GOAL-021") {
  const root = path.resolve(rawPath || process.env.SEIS_WORKSPACE_ROOT || process.cwd());
  if (!fs.existsSync(root)) return { state: "invalid-input", error: "workspace-not-found", mode: "local-read-only" };
  const files = collectFiles(root);
  const findings = [];
  const records = [];
  for (const file of files) records.push(...normalizeRecords(parseGoal(file)));
  if (!records.length) findings.push({ severity: "error", code: "no-goal-files", message: "No bounded goal records were found." });
  const seen = new Map();
  for (const item of records) {
    if (item.parseError) {
      findings.push({ severity: "error", code: item.parseError, file: item.file });
      continue;
    }
    const record = item.record;
    if (!record || typeof record !== "object") {
      findings.push({ severity: "error", code: "goal-record-not-object", file: item.file });
      continue;
    }
    const id = typeof record.id === "string" ? record.id.trim() : "";
    if (!id || !goalIdPattern.test(id)) findings.push({ severity: "error", code: "invalid-goal-id", file: item.file, value: id || null });
    if (id) {
      if (seen.has(id)) findings.push({ severity: "error", code: "duplicate-goal-id", id, files: [seen.get(id), item.file] });
      else seen.set(id, item.file);
    }
    const status = typeof record.status === "string" ? record.status.trim() : "";
    if (!allowedStatuses.has(status)) findings.push({ severity: "error", code: "invalid-goal-status", file: item.file, id: id || null, value: status || null });
    if (!record.title) findings.push({ severity: "warning", code: "missing-goal-title", file: item.file, id: id || null });
    if (status === "completed" && !record.evidence && !record.validation) findings.push({ severity: "warning", code: "completed-without-evidence-hint", file: item.file, id });
    if (status === "blocked" && !record.blockedBy) findings.push({ severity: "warning", code: "blocked-without-blocker-hint", file: item.file, id });
  }
  const errors = findings.filter((finding) => finding.severity === "error");
  return {
    state: errors.length ? "attention" : records.length ? "ready" : "not-verified",
    ok: errors.length === 0 && records.length > 0,
    mode: "local-read-only",
    primaryGoalId,
    primaryGoalPresent: seen.has(primaryGoalId),
    filesScanned: files.length,
    recordsScanned: records.length,
    findings,
    limitations: ["YAML is inspected through bounded top-level key heuristics; repository-native schema validators remain authoritative.", "No goal file is modified."],
  };
}

const tools = [
  { name: "seis_goal_integrity_status", description: "Report the local-only goal validator boundary.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_goal_integrity_validate", description: "Validate bounded goal files and single-goal binding hints.", inputSchema: { type: "object", properties: { path: { type: "string" }, primaryGoalId: { type: "string" } } } },
];

function send(message) { const body = JSON.stringify(message); process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`); }
let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-goal-integrity", version: "0.1.0" } } });
  else if (message.method === "tools/list") send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_goal_integrity_status" ? pluginStatus() : name === "seis_goal_integrity_validate" ? validateGoals(args.path, args.primaryGoalId) : null;
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
  const primaryIndex = args.indexOf("--primary-goal");
  console.log(JSON.stringify(validateGoals(index >= 0 ? args[index + 1] : undefined, primaryIndex >= 0 ? args[primaryIndex + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => { pending = Buffer.concat([pending, Buffer.from(chunk)]); processStream(); });
  process.stdin.on("end", () => process.exit(0));
}
