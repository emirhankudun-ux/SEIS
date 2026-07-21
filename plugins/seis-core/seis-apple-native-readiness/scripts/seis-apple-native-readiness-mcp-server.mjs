#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APPLE_NATIVE_READINESS_ID, auditAppleNativeReadiness } from "../runtime/apple-native-readiness.mjs";

const argv = process.argv.slice(2);
const REPO_ROOT = locateRepositoryRoot(process.env.SEIS_WORKSPACE_ROOT || process.env.SEIS_REPO_ROOT || process.cwd());
const GENERATED_EVIDENCE_PATH = path.join(REPO_ROOT, "content", "development", "seis-apple-native-readiness.json");

if (argv.includes("--status")) {
  process.stdout.write(JSON.stringify(status(), null, 2) + "\n");
} else if (argv.includes("--audit") || argv.includes("--report")) {
  process.stdout.write(JSON.stringify(audit(argumentValue("--path") || "."), null, 2) + "\n");
} else if (argv.includes("--evidence")) {
  process.stdout.write(JSON.stringify(evidence(), null, 2) + "\n");
} else {
  serveMcp();
}

function status() {
  const report = audit(".");
  return {
    status: report.state,
    ok: report.ok,
    plugin: APPLE_NATIVE_READINESS_ID,
    mode: report.mode,
    classification: report.classification,
    summary: report.summary,
    permissions: report.permissions,
  };
}

function audit(rawPath) {
  const target = resolveAuditRoot(rawPath);
  if (!target) {
    return {
      state: "attention",
      ok: false,
      plugin: APPLE_NATIVE_READINESS_ID,
      mode: "apple-native-static-readiness-read-only",
      classification: "documented-static-readiness-only",
      errorCount: 1,
      warningCount: 0,
      findings: [{ severity: "error", code: "invalid-audit-path" }],
      permissions: { read: ["bounded local Apple-native source evidence"], write: [], network: [], secrets: [] },
      limitations: ["The requested path must remain inside the local SEIS repository boundary."],
    };
  }
  return auditAppleNativeReadiness(target);
}

function evidence() {
  const report = audit(".");
  return {
    state: report.state,
    ok: report.ok,
    audit: {
      classification: report.classification,
      summary: report.summary,
      checkCount: report.checks?.length || 0,
      findingCodes: (report.findings || []).map((finding) => finding.code).filter(Boolean).sort(),
    },
    evidence: readGeneratedEvidence(),
    permissions: report.permissions,
  };
}

function readGeneratedEvidence() {
  if (!fs.existsSync(GENERATED_EVIDENCE_PATH)) return null;
  try {
    const record = JSON.parse(fs.readFileSync(GENERATED_EVIDENCE_PATH, "utf8"));
    if (record?.id !== APPLE_NATIVE_READINESS_ID) return null;
    return {
      id: record.id,
      status: record.status || null,
      goalId: record.goalId || null,
      marketplace: record.marketplace || null,
      audit: record.audit || null,
    };
  } catch {
    return null;
  }
}

function resolveAuditRoot(rawPath) {
  if (typeof rawPath !== "string" || !rawPath.trim()) return null;
  const candidate = path.resolve(REPO_ROOT, rawPath);
  return candidate === REPO_ROOT || candidate.startsWith(REPO_ROOT + path.sep) ? candidate : null;
}

function locateRepositoryRoot(start) {
  let candidate = path.resolve(start);
  for (let index = 0; index < 8; index += 1) {
    if (fs.existsSync(path.join(candidate, "project.ecosystem.yaml"))) return candidate;
    const parent = path.dirname(candidate);
    if (parent === candidate) break;
    candidate = parent;
  }
  return path.resolve(start);
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
      const payload = buffer.subarray(start, start + length).toString("utf8");
      buffer = buffer.subarray(start + length);
      try {
        respond(JSON.parse(payload));
      } catch {
        continue;
      }
    }
  });
}

function respond(message) {
  const id = message?.id ?? null;
  let result;
  if (message?.method === "initialize") {
    result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: APPLE_NATIVE_READINESS_ID, version: "0.1.0" } };
  } else if (message?.method === "tools/list") {
    result = { tools: tools() };
  } else if (message?.method === "tools/call") {
    result = callTool(message.params || {});
  } else {
    result = { error: "unsupported-method" };
  }
  frame({ jsonrpc: "2.0", id, result });
}

function tools() {
  return [
    {
      name: "seis_apple_native_readiness_status",
      description: "Read the local-only SEIS Apple-native static readiness status.",
      inputSchema: { type: "object", additionalProperties: false },
    },
    {
      name: "seis_apple_native_readiness_audit",
      description: "Audit bounded Swift Package, source/test, and strategy evidence without compiling or writing.",
      inputSchema: { type: "object", properties: { path: { type: "string" } }, additionalProperties: false },
    },
    {
      name: "seis_apple_native_readiness_evidence",
      description: "Read committed static-readiness metadata without release authority.",
      inputSchema: { type: "object", additionalProperties: false },
    },
  ];
}

function callTool(params) {
  if (params.name === "seis_apple_native_readiness_status") return status();
  if (params.name === "seis_apple_native_readiness_audit") return audit(params.arguments?.path || ".");
  if (params.name === "seis_apple_native_readiness_evidence") return evidence();
  return { error: "unknown-tool" };
}

function frame(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
