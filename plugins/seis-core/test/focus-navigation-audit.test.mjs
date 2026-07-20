import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { auditStaticUi } from "../seis-focus-navigation-audit/runtime/static-ui-audit.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const entrypoint = path.join(pluginRoot, "seis-focus-navigation-audit", "scripts", "seis-focus-navigation-audit-mcp-server.mjs");

test("SEIS Focus Navigation Audit finds static evidence in the Command Center source", () => {
  const result = auditStaticUi(path.join(repoRoot, "apps", "seis-core"), {
    files: ["index.html", "script.js", "styles.css"],
  });

  assert.equal(result.state, "ready");
  assert.equal(result.ok, true);
  assert.equal(result.mode, "local-static-ui-audit-read-only");
  assert.equal(result.staticEvidence.semanticInteractiveControls, true);
  assert.equal(result.staticEvidence.keyboardEventHandler, true);
  assert.equal(result.staticEvidence.focusStyle, true);
  assert.equal(result.staticEvidence.reducedMotionStyle, true);
  assert.deepEqual(result.findings, []);
  assert.equal(JSON.stringify(result).includes(repoRoot), false);
});

test("SEIS Focus Navigation Audit flags unsafe static interaction patterns", () => {
  const fixture = mkdtempSync(path.join(os.tmpdir(), "seis-focus-navigation-"));
  try {
    writeFileSync(path.join(fixture, "index.html"), '<div role="button" onclick="openPanel()">Open</div><div tabindex="4">Skip</div>');
    writeFileSync(path.join(fixture, "styles.css"), "button { outline: none; }");
    writeFileSync(path.join(fixture, "app.js"), 'document.addEventListener("click", () => {});');
    const result = auditStaticUi(fixture);

    assert.equal(result.state, "attention");
    assert.equal(result.ok, false);
    assert.equal(result.findings.some((finding) => finding.code === "non-native-interactive-role-missing-tabindex"), true);
    assert.equal(result.findings.some((finding) => finding.code === "positive-tabindex"), true);
    assert.equal(JSON.stringify(result).includes(fixture), false);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("SEIS Focus Navigation Audit exposes bounded MCP tools and committed evidence", () => {
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_focus_navigation_audit", arguments: { path: "apps/seis-core", files: ["index.html", "script.js", "styles.css"] } } },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_focus_navigation_evidence", arguments: {} } },
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
  assert.deepEqual(toolNames.sort(), ["seis_focus_navigation_audit", "seis_focus_navigation_audit_status", "seis_focus_navigation_evidence"]);
  const audit = responses.find((response) => response.id === 3)?.result;
  assert.equal(audit?.state, "ready");
  assert.deepEqual(audit?.permissions?.write, []);
  assert.deepEqual(audit?.permissions?.network, []);
  assert.deepEqual(audit?.permissions?.secrets, []);
  const evidence = responses.find((response) => response.id === 4)?.result;
  assert.equal(evidence?.state, "ready");
  assert.equal(evidence?.evidence?.id, "seis-focus-navigation-audit");
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
