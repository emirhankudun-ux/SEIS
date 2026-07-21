#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { auditProjectManifest, PROJECT_MANIFEST_AUDIT_ID } from "../runtime/project-manifest-audit.mjs";

const REPO_ROOT = path.resolve(process.env.SEIS_REPO_ROOT || process.cwd());
const EVIDENCE_PATH = path.join(REPO_ROOT, "content", "development", "seis-project-manifest-audit.json");
const argv = process.argv.slice(2);

if (argv.includes("--status")) {
  process.stdout.write(`${JSON.stringify(status(), null, 2)}\n`);
} else if (argv.includes("--audit")) {
  process.stdout.write(`${JSON.stringify(audit(argumentValue("--path") || "."), null, 2)}\n`);
} else if (argv.includes("--evidence")) {
  process.stdout.write(`${JSON.stringify(evidence(), null, 2)}\n`);
} else {
  serveMcp();
}

function status() {
  const report = audit(".");
  return {
    status: report.state,
    ok: report.ok,
    auditId: PROJECT_MANIFEST_AUDIT_ID,
    mode: report.mode,
    counts: report.counts,
    permissions: report.permissions,
  };
}

function audit(rawPath) {
  const target = resolveAuditRoot(rawPath);
  if (!target) {
    return {
      state: "attention",
      ok: false,
      mode: "project-manifest-governance-read-only",
      auditId: PROJECT_MANIFEST_AUDIT_ID,
      errorCount: 1,
      warningCount: 0,
      findings: [{ severity: "error", code: "invalid-audit-path" }],
      permissions: { read: ["bounded local repository metadata"], write: [], network: [], secrets: [] },
    };
  }
  return auditProjectManifest(target);
}

function evidence() {
  const report = audit(".");
  const record = readEvidence();
  return {
    state: report.state,
    ok: report.ok,
    audit: report,
    evidence: record,
    permissions: report.permissions,
  };
}

function readEvidence() {
  if (!fs.existsSync(EVIDENCE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(EVIDENCE_PATH, "utf8"));
  } catch {
    return null;
  }
}

function resolveAuditRoot(rawPath) {
  if (typeof rawPath !== "string" || !rawPath.trim()) return null;
  const candidate = path.resolve(REPO_ROOT, rawPath);
  return candidate === REPO_ROOT || candidate.startsWith(`${REPO_ROOT}${path.sep}`) ? candidate : null;
}

function argumentValue(flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : null;
}

function serveMcp() {
  let buffer = Buffer.alloc(0);
  process.stdin.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const separator = buffer.indexOf("\r\n\r\n");
      if (separator < 0) return;
      const header = buffer.subarray(0, separator).toString("utf8");
      const lengthMatch = /Content-Length:\s*(\d+)/i.exec(header);
      if (!lengthMatch) {
        buffer = Buffer.alloc(0);
        return;
      }
      const length = Number.parseInt(lengthMatch[1], 10);
      const start = separator + 4;
      if (buffer.length < start + length) return;
      const message = JSON.parse(buffer.subarray(start, start + length).toString("utf8"));
      buffer = buffer.subarray(start + length);
      respond(message);
    }
  });
}

function respond(message) {
  const id = message?.id ?? null;
  let result;
  if (message?.method === "initialize") result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: PROJECT_MANIFEST_AUDIT_ID, version: "0.1.0" } };
  else if (message?.method === "tools/list") result = { tools: tools() };
  else if (message?.method === "tools/call") result = callTool(message.params || {});
  else result = { error: "unsupported-method" };
  frame({ jsonrpc: "2.0", id, result });
}

function tools() {
  return [
    { name: "seis_project_manifest_audit_status", description: "Read the bounded SEIS project manifest governance status.", inputSchema: { type: "object", additionalProperties: false } },
    { name: "seis_project_manifest_audit", description: "Audit a bounded local SEIS project root without writes.", inputSchema: { type: "object", properties: { path: { type: "string" } }, additionalProperties: false } },
    { name: "seis_project_manifest_audit_evidence", description: "Read committed project-manifest audit evidence without release authority.", inputSchema: { type: "object", additionalProperties: false } },
  ];
}

function callTool(params) {
  if (params.name === "seis_project_manifest_audit_status") return status();
  if (params.name === "seis_project_manifest_audit") return audit(params.arguments?.path || ".");
  if (params.name === "seis_project_manifest_audit_evidence") return evidence();
  return { error: "unknown-tool" };
}

function frame(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}
