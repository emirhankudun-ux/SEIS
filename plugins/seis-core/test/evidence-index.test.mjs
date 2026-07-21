import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { auditEvidenceIndex, EVIDENCE_INDEX_ID } from "../seis-evidence-index/runtime/evidence-index.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const entrypoint = path.join(pluginRoot, "seis-evidence-index", "scripts", "seis-evidence-index-mcp-server.mjs");

test("SEIS Evidence Index summarizes checked-in public Wave 1 evidence without leaking the repository path", () => {
  const result = auditEvidenceIndex(repoRoot);

  assert.equal(result.state, "ready");
  assert.equal(result.ok, true);
  assert.equal(result.mode, "public-evidence-index-read-only");
  assert.equal(result.indexId, EVIDENCE_INDEX_ID);
  assert.equal(result.summary.marketplaceName, "seis-repo");
  assert.equal(result.summary.publicCardCount, result.summary.expectedCardCount);
  assert.equal(result.summary.applicationPluginCount > 0, true);
  assert.equal(result.summary.recordedAttentionContractIds.includes("ui-state-contract"), true);
  assert.deepEqual(result.permissions.write, []);
  assert.deepEqual(result.permissions.network, []);
  assert.deepEqual(result.permissions.secrets, []);
  assert.equal(JSON.stringify(result).includes(repoRoot), false);
});

test("SEIS Evidence Index reports malformed bounded evidence without returning raw values or paths", () => {
  const fixture = mkdtempSync(path.join(os.tmpdir(), "seis-evidence-index-"));
  try {
    mkdirSync(path.join(fixture, "content", "development"), { recursive: true });
    writeFileSync(
      path.join(fixture, "content", "development", "seis-public-plugin-wave-1-evidence-index.json"),
      JSON.stringify({ id: "wrong", secret: "sk-abcdefghijklmnopqrstuvwxyz" })
    );
    writeFileSync(
      path.join(fixture, "content", "development", "seis-public-plugin-wave-1-program.json"),
      JSON.stringify({ id: "wrong", status: "completed", steps: [] })
    );

    const result = auditEvidenceIndex(fixture);

    assert.equal(result.state, "attention");
    assert.equal(result.ok, false);
    assert.equal(result.findings.some((finding) => finding.code === "unsafe-input-content"), true);
    assert.equal(JSON.stringify(result).includes(fixture), false);
    assert.equal(JSON.stringify(result).includes("sk-abcdefghijklmnopqrstuvwxyz"), false);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("SEIS Evidence Index exposes bounded MCP tools and committed evidence", () => {
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_evidence_index", arguments: { path: "." } } },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_evidence_index_evidence", arguments: {} } },
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
  assert.deepEqual(toolNames.sort(), ["seis_evidence_index", "seis_evidence_index_evidence", "seis_evidence_index_status"]);
  const audit = responses.find((response) => response.id === 3)?.result;
  assert.equal(audit?.state, "ready");
  assert.equal(audit?.ok, true);
  assert.deepEqual(audit?.permissions?.write, []);
  const evidence = responses.find((response) => response.id === 4)?.result;
  assert.equal(evidence?.state, "ready");
  assert.equal(evidence?.evidence?.id, EVIDENCE_INDEX_ID);
  assert.equal(JSON.stringify(responses).includes(repoRoot), false);
});

function frame(message) {
  const body = JSON.stringify(message);
  return "Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body;
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
