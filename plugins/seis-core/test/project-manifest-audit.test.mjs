import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { auditProjectManifest, PROJECT_MANIFEST_AUDIT_ID } from "../seis-project-manifest-audit/runtime/project-manifest-audit.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const entrypoint = path.join(pluginRoot, "seis-project-manifest-audit", "scripts", "seis-project-manifest-audit-mcp-server.mjs");

test("SEIS Project Manifest Audit reconciles the checked-in public repository contract", () => {
  const result = auditProjectManifest(repoRoot);

  assert.equal(result.state, "ready");
  assert.equal(result.ok, true);
  assert.equal(result.mode, "project-manifest-governance-read-only");
  assert.equal(result.auditId, PROJECT_MANIFEST_AUDIT_ID);
  assert.equal(result.counts.declaredApplicationMarketplaceEntryCount, result.counts.sourceManifestPluginCount);
  assert.equal(result.counts.declaredMarketplaceEntryCount, result.counts.marketplaceEntryCount);
  assert.equal(result.findings.length, 0);
  assert.deepEqual(result.permissions.write, []);
  assert.deepEqual(result.permissions.network, []);
  assert.deepEqual(result.permissions.secrets, []);
  assert.equal(JSON.stringify(result).includes(repoRoot), false);
});

test("SEIS Project Manifest Audit reports a bounded malformed project root without leaking paths", () => {
  const fixture = mkdtempSync(path.join(os.tmpdir(), "seis-project-manifest-"));
  try {
    writeFileSync(path.join(fixture, "project.ecosystem.yaml"), "project:\n  id: wrong-root\n");
    const result = auditProjectManifest(fixture);

    assert.equal(result.state, "attention");
    assert.equal(result.ok, false);
    assert.equal(result.findings.some((finding) => finding.code === "project-manifest-value-mismatch"), true);
    assert.equal(JSON.stringify(result).includes(fixture), false);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("SEIS Project Manifest Audit exposes bounded MCP tools and committed evidence", () => {
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_project_manifest_audit", arguments: { path: "." } } },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_project_manifest_audit_evidence", arguments: {} } },
  ];
  const result = spawnSync(process.execPath, [entrypoint], {
    cwd: repoRoot,
    env: { ...process.env, SEIS_REPO_ROOT: repoRoot },
    input: requests.map(frame).join(""),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  const responses = parseFrames(result.stdout);
  const toolNames = responses.find((response) => response.id === 2)?.result?.tools?.map((tool) => tool.name) || [];
  assert.deepEqual(toolNames.sort(), ["seis_project_manifest_audit", "seis_project_manifest_audit_evidence", "seis_project_manifest_audit_status"]);
  const audit = responses.find((response) => response.id === 3)?.result;
  assert.equal(audit?.state, "ready");
  assert.equal(audit?.ok, true);
  assert.deepEqual(audit?.permissions?.write, []);
  const evidence = responses.find((response) => response.id === 4)?.result;
  assert.equal(evidence?.state, "ready");
  assert.equal(evidence?.evidence?.id, PROJECT_MANIFEST_AUDIT_ID);
  assert.equal(JSON.stringify(responses).includes(repoRoot), false);
});

function frame(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

function parseFrames(output) {
  const bytes = Buffer.from(output, "utf8");
  const messages = [];
  let offset = 0;
  while (offset < bytes.length) {
    const headerEnd = bytes.indexOf(Buffer.from("\r\n\r\n"), offset);
    assert.notEqual(headerEnd, -1, "MCP response header is incomplete");
    const header = bytes.slice(offset, headerEnd).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    assert.ok(match, "MCP response must include Content-Length");
    const length = Number.parseInt(match[1], 10);
    const start = headerEnd + 4;
    const end = start + length;
    assert.ok(end <= bytes.length, "MCP response body is incomplete");
    messages.push(JSON.parse(bytes.slice(start, end).toString("utf8")));
    offset = end;
  }
  return messages;
}
