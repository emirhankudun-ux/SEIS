#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { auditStaticUi } from "../runtime/static-ui-audit.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PERMISSIONS = Object.freeze({ read: ["bounded local UI source and committed static evidence"], write: [], network: [], secrets: [] });
const EVIDENCE_PATH = path.join("content", "development", "seis-focus-navigation-audit.json");

function rootFor(value) {
  return path.resolve(String(value || process.cwd()));
}

function repoRoot() {
  return path.resolve(String(process.env.SEIS_REPO_ROOT || process.cwd()));
}

function status() {
  return {
    plugin: "seis-focus-navigation-audit",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-focus-navigation-audit", "SKILL.md")) ? "ready" : "partial",
    mode: "local-static-ui-audit-read-only",
    launchesBrowser: false,
    controlsScreenReader: false,
    writes: "disabled-by-design",
    permissions: PERMISSIONS,
  };
}

function audit(input) {
  const options = {};
  if (Array.isArray(input?.files)) options.files = input.files.slice(0, 80);
  if (input?.maxFiles !== undefined) options.maxFiles = input.maxFiles;
  const result = auditStaticUi(rootFor(input?.path), options);
  return { ...result, permissions: PERMISSIONS };
}

function evidence() {
  const file = path.join(repoRoot(), EVIDENCE_PATH);
  try {
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw new Error("unsafe-evidence-file");
    const record = JSON.parse(fs.readFileSync(file, "utf8"));
    if (record?.id !== "seis-focus-navigation-audit" || record?.plugin?.name !== "seis-focus-navigation-audit" || containsUnsafeReference(record)) {
      throw new Error("invalid-evidence-record");
    }
    return {
      state: "ready",
      ok: true,
      mode: "local-static-ui-audit-read-only",
      evidence: {
        id: record.id,
        goalId: record.goalId,
        status: record.status,
        surfaceCount: Array.isArray(record.surfaces) ? record.surfaces.length : 0,
        manualEvidenceRequired: record.manualEvidenceRequired || [],
      },
      permissions: PERMISSIONS,
    };
  } catch {
    return {
      state: "not-verified",
      ok: false,
      mode: "local-static-ui-audit-read-only",
      reason: "static-evidence-record-unavailable-or-invalid",
      permissions: PERMISSIONS,
    };
  }
}

function containsUnsafeReference(value) {
  const serialized = JSON.stringify(value);
  return /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m.test(serialized)
    || /\b(?:gh[pousr]_[A-Za-z0-9_-]{20,}|github_pat_[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16})\b/.test(serialized);
}

const tools = [
  { name: "seis_focus_navigation_audit_status", description: "Report the bounded static focus-navigation audit boundary.", inputSchema: { type: "object", properties: {} } },
  { name: "seis_focus_navigation_audit", description: "Inspect local UI source for static focus, keyboard, semantic-control, and reduced-motion evidence.", inputSchema: { type: "object", properties: { path: { type: "string" }, files: { type: "array", items: { type: "string" } }, maxFiles: { type: "integer", minimum: 1, maximum: 500 } } } },
  { name: "seis_focus_navigation_evidence", description: "Summarize the committed SEIS static focus-navigation evidence contract.", inputSchema: { type: "object", properties: {} } },
];

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-focus-navigation-audit", version: "0.1.0" } } });
    return;
  }
  if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
    return;
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_focus_navigation_audit_status"
      ? status()
      : name === "seis_focus_navigation_audit"
        ? audit(args)
        : name === "seis_focus_navigation_evidence"
          ? evidence()
          : null;
    if (result) send({ jsonrpc: "2.0", id: message.id, result });
    else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${String(name || "undefined")}` } });
  }
}

function processStream() {
  while (true) {
    const separator = pending.indexOf("\r\n\r\n");
    if (separator < 0) return;
    const match = /Content-Length:\s*(\d+)/i.exec(pending.slice(0, separator).toString("utf8"));
    if (!match) {
      pending = pending.slice(separator + 4);
      continue;
    }
    const length = Number.parseInt(match[1], 10);
    const start = separator + 4;
    if (pending.length < start + length) return;
    try {
      handle(JSON.parse(pending.slice(start, start + length).toString("utf8")));
    } catch {
      // Invalid requests are ignored so the stdio server never emits source text or stack traces.
    }
    pending = pending.slice(start + length);
  }
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  console.log(JSON.stringify(status(), null, 2));
} else if (args.includes("--audit")) {
  const pathIndex = args.indexOf("--path");
  console.log(JSON.stringify(audit({ path: pathIndex >= 0 ? args[pathIndex + 1] : undefined }), null, 2));
} else if (args.includes("--evidence")) {
  console.log(JSON.stringify(evidence(), null, 2));
} else {
  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
  process.stdin.on("end", () => process.exit(0));
}
