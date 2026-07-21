#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  SWIFT_PACKAGE_TOPOLOGY_ID,
  auditSwiftPackageTopology,
} from "../runtime/swift-package-topology.mjs";

const argv = process.argv.slice(2);
const REPO_ROOT = locateRepositoryRoot(process.env.SEIS_WORKSPACE_ROOT || process.env.SEIS_REPO_ROOT || process.cwd());
const GENERATED_EVIDENCE_PATH = path.join(REPO_ROOT, "content", "development", "seis-swift-package-topology.json");

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
    plugin: SWIFT_PACKAGE_TOPOLOGY_ID,
    mode: report.mode,
    classification: report.classification,
    summary: report.summary,
    findingCodes: report.findings.map((finding) => finding.code).filter(Boolean).sort(),
    permissions: report.permissions,
    safety: report.safety,
  };
}

function audit(rawPath) {
  if (!isRepositoryRootRequest(rawPath)) return invalidAuditPath();
  return auditSwiftPackageTopology(REPO_ROOT);
}

function evidence() {
  const report = audit(".");
  return {
    state: report.state,
    ok: report.ok,
    audit: {
      classification: report.classification,
      topologyAvailable: report.summary.topologyAvailable,
      declaredPlatformCount: report.summary.declaredPlatformCount,
      productCount: report.summary.productCount,
      targetCount: report.summary.targetCount,
      findingCodes: report.findings.map((finding) => finding.code).filter(Boolean).sort(),
    },
    evidence: readGeneratedEvidence(),
    permissions: report.permissions,
  };
}

function invalidAuditPath() {
  return {
    state: "attention",
    ok: false,
    plugin: SWIFT_PACKAGE_TOPOLOGY_ID,
    mode: "swift-package-manifest-topology-static-read-only",
    classification: "bounded-static-swift-package-manifest-topology",
    errorCount: 1,
    warningCount: 0,
    findings: [{ severity: "error", code: "invalid-audit-path", count: 1 }],
    permissions: { read: ["one fixed checked-in Swift Package manifest"], write: [], network: [], secrets: [] },
    limitations: ["Only the current local SEIS repository root is an allowed audit target."],
  };
}

function readGeneratedEvidence() {
  if (!fs.existsSync(GENERATED_EVIDENCE_PATH)) return null;
  try {
    const record = JSON.parse(fs.readFileSync(GENERATED_EVIDENCE_PATH, "utf8"));
    if (record?.id !== SWIFT_PACKAGE_TOPOLOGY_ID) return null;
    return {
      id: record.id,
      status: record.status || null,
      goalId: record.goalId || null,
      marketplace: record.marketplace || null,
      audit: {
        state: record.audit?.state || null,
        ok: record.audit?.ok === true,
        classification: record.audit?.classification || null,
        findingCodes: record.audit?.findingCodes || [],
      },
    };
  } catch {
    return null;
  }
}

function isRepositoryRootRequest(rawPath) {
  return rawPath === "." || rawPath === "./";
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
    result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: SWIFT_PACKAGE_TOPOLOGY_ID, version: "0.1.0" } };
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
      name: "seis_swift_package_topology_status",
      description: "Read the local-only SEIS Swift Package static topology status.",
      inputSchema: { type: "object", additionalProperties: false },
    },
    {
      name: "seis_swift_package_topology_audit",
      description: "Read one fixed Swift Package manifest without resolving, compiling, writing, or returning raw manifest text.",
      inputSchema: { type: "object", properties: { path: { type: "string" } }, additionalProperties: false },
    },
    {
      name: "seis_swift_package_topology_evidence",
      description: "Read committed static topology evidence without release authority.",
      inputSchema: { type: "object", additionalProperties: false },
    },
  ];
}

function callTool(params) {
  if (params.name === "seis_swift_package_topology_status") return status();
  if (params.name === "seis_swift_package_topology_audit") return audit(params.arguments?.path || ".");
  if (params.name === "seis_swift_package_topology_evidence") return evidence();
  return { error: "unknown-tool" };
}

function frame(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
