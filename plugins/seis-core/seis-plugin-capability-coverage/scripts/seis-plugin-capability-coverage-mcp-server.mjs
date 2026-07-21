#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  PLUGIN_CAPABILITY_COVERAGE_ID,
  auditPluginCapabilityCoverage,
} from "../runtime/plugin-capability-coverage.mjs";

const argv = process.argv.slice(2);
const REPO_ROOT = locateRepositoryRoot(process.env.SEIS_WORKSPACE_ROOT || process.env.SEIS_REPO_ROOT || process.cwd());
const GENERATED_EVIDENCE_PATH = path.join(REPO_ROOT, "content", "development", "seis-plugin-capability-coverage.json");

if (argv.includes("--status")) {
  process.stdout.write(JSON.stringify(status(), null, 2) + "\n");
} else if (argv.includes("--report") || argv.includes("--audit")) {
  process.stdout.write(JSON.stringify(report(argumentValue("--path") || "."), null, 2) + "\n");
} else if (argv.includes("--evidence")) {
  process.stdout.write(JSON.stringify(evidence(), null, 2) + "\n");
} else {
  serveMcp();
}

function status() {
  const audit = report(".");
  return {
    status: audit.state,
    ok: audit.ok,
    plugin: PLUGIN_CAPABILITY_COVERAGE_ID,
    mode: audit.mode,
    classification: audit.classification,
    summary: audit.summary,
    reconciliation: audit.reconciliation,
    findingCodes: audit.findings.map((finding) => finding.code).filter(Boolean).sort(),
    permissions: audit.permissions,
    safety: audit.safety,
  };
}

function report(rawPath) {
  if (!isRepositoryRootRequest(rawPath)) return invalidReportPath();
  return auditPluginCapabilityCoverage(REPO_ROOT);
}

function evidence() {
  const audit = report(".");
  return {
    state: audit.state,
    ok: audit.ok,
    audit: {
      classification: audit.classification,
      reconciliationAvailable: audit.summary.reconciliationAvailable,
      sourcePluginCount: audit.summary.sourcePluginCount,
      catalogPluginCount: audit.summary.catalogPluginCount,
      matrixPluginCount: audit.summary.matrixPluginCount,
      marketplaceApplicationCardCount: audit.summary.marketplaceApplicationCardCount,
      declaredCategoryCount: audit.summary.declaredCategoryCount,
      declaredCapabilityTokenKindCount: audit.summary.declaredCapabilityTokenKindCount,
      findingCodes: audit.findings.map((finding) => finding.code).filter(Boolean).sort(),
    },
    evidence: readGeneratedEvidence(),
    permissions: audit.permissions,
  };
}

function invalidReportPath() {
  return {
    state: "attention",
    ok: false,
    plugin: PLUGIN_CAPABILITY_COVERAGE_ID,
    mode: "fixed-public-registry-capability-coverage-static-read-only",
    classification: "bounded-declared-seis-plugin-capability-coverage",
    errorCount: 1,
    warningCount: 0,
    findings: [{ severity: "error", code: "invalid-report-path", count: 1 }],
    permissions: { read: ["four fixed checked-in public SEIS Repo registry projections"], write: [], network: [], secrets: [] },
    limitations: ["Only the current local SEIS repository root is an allowed report target."],
  };
}

function readGeneratedEvidence() {
  if (!fs.existsSync(GENERATED_EVIDENCE_PATH)) return null;
  try {
    const record = JSON.parse(fs.readFileSync(GENERATED_EVIDENCE_PATH, "utf8"));
    if (record?.id !== PLUGIN_CAPABILITY_COVERAGE_ID) return null;
    return {
      id: record.id,
      status: record.status || null,
      goalId: record.goalId || null,
      wave: record.wave || null,
      marketplace: record.marketplace || null,
      audit: {
        state: record.audit?.state || null,
        ok: record.audit?.ok === true,
        classification: record.audit?.classification || null,
        reconciliationAvailable: record.audit?.reconciliationAvailable === true,
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
    result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: PLUGIN_CAPABILITY_COVERAGE_ID, version: "0.1.0" } };
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
      name: "seis_plugin_capability_coverage_status",
      description: "Read the local-only SEIS public plugin capability coverage status.",
      inputSchema: { type: "object", additionalProperties: false },
    },
    {
      name: "seis_plugin_capability_coverage_report",
      description: "Read four fixed public SEIS Repo registry projections and return only derived coverage counts.",
      inputSchema: { type: "object", properties: { path: { type: "string" } }, additionalProperties: false },
    },
    {
      name: "seis_plugin_capability_coverage_evidence",
      description: "Read committed capability coverage evidence without release authority.",
      inputSchema: { type: "object", additionalProperties: false },
    },
  ];
}

function callTool(params) {
  if (params.name === "seis_plugin_capability_coverage_status") return status();
  if (params.name === "seis_plugin_capability_coverage_report") return report(params.arguments?.path || ".");
  if (params.name === "seis_plugin_capability_coverage_evidence") return evidence();
  return { error: "unknown-tool" };
}

function frame(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}
