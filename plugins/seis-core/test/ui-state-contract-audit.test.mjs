import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { auditUiStateContract, UI_STATE_CONTRACT } from "../seis-ui-state-contract-audit/runtime/static-ui-state-audit.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const entrypoint = path.join(pluginRoot, "seis-ui-state-contract-audit", "scripts", "seis-ui-state-contract-audit-mcp-server.mjs");

test("SEIS UI State Contract Audit recognizes the Command Center's explicit no-key state boundaries", () => {
  const result = auditUiStateContract(path.join(repoRoot, "apps", "seis-core"), {
    files: ["index.html", "script.js", "styles.css"],
  });

  assert.equal(result.state, "ready");
  assert.equal(result.ok, true);
  assert.equal(result.mode, "local-static-ui-state-contract-read-only");
  assert.deepEqual(result.missingStateIds, []);
  assert.equal(result.findings.length, 0);
  assert.equal(JSON.stringify(result).includes(repoRoot), false);
});

test("Command Center state-boundary panel remains semantic, non-interactive, and isolated from provider or storage actions", () => {
  const markup = readFileSync(path.join(repoRoot, "apps", "seis-core", "index.html"), "utf8");
  const source = readFileSync(path.join(repoRoot, "apps", "seis-core", "script.js"), "utf8");
  const styles = readFileSync(path.join(repoRoot, "apps", "seis-core", "styles.css"), "utf8");
  const renderer = source.slice(
    source.indexOf("function renderPluginStateBoundaries()"),
    source.indexOf("function renderPluginReleaseReadiness()"),
  );

  assert.match(markup, /<section class="panel plugin-state-boundary-panel" aria-labelledby="plugin-state-boundary-title">/);
  assert.match(markup, /<h3 id="plugin-state-boundary-title">Operational State Boundaries<\/h3>/);
  assert.match(markup, /id="plugin-state-boundary-grid" aria-live="polite"/);
  assert.match(renderer, /<article class="plugin-state-boundary-card" data-state-boundary=/);
  assert.match(renderer, /<h4>\$\{escapeHtml\(boundary\.label\)\}<\/h4>/);
  assert.match(renderer, /Current: \$\{escapeHtml\(boundary\.current\)\}/);
  assert.match(styles, /\.plugin-state-boundary-grid\s*\{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.equal(/<(?:button|input|select|textarea)\b/i.test(renderer), false);
  assert.equal(/\b(?:fetch|XMLHttpRequest)\b/.test(renderer), false);
  assert.equal(/\b(?:localStorage|sessionStorage|saveState)\b/.test(renderer), false);
  assert.equal(/\b(?:app-plugin-filter|pluginQuery)\b/.test(renderer), false);
});

test("SEIS UI State Contract Audit recognizes an explicit complete static state contract", () => {
  const fixture = mkdtempSync(path.join(os.tmpdir(), "seis-ui-state-contract-"));
  try {
    const markers = UI_STATE_CONTRACT.map((state) => state.id === "live-boundary" ? "live" : state.id === "demo" ? "local demo" : state.id.replaceAll("-", " ")).join(" ");
    writeFileSync(path.join(fixture, "state.js"), markers);
    const result = auditUiStateContract(fixture, { files: ["state.js"] });

    assert.equal(result.state, "ready");
    assert.equal(result.ok, true);
    assert.deepEqual(result.missingStateIds, []);
    assert.equal(JSON.stringify(result).includes(fixture), false);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("SEIS UI State Contract Audit exposes bounded MCP tools and committed evidence", () => {
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_ui_state_contract_audit", arguments: { path: "apps/seis-core", files: ["index.html", "script.js", "styles.css"] } } },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_ui_state_contract_evidence", arguments: {} } },
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
  assert.deepEqual(toolNames.sort(), ["seis_ui_state_contract_audit", "seis_ui_state_contract_evidence", "seis_ui_state_contract_status"]);
  const audit = responses.find((response) => response.id === 3)?.result;
  assert.equal(audit?.state, "ready");
  assert.equal(audit?.ok, true);
  assert.deepEqual(audit?.permissions?.write, []);
  assert.deepEqual(audit?.permissions?.network, []);
  assert.deepEqual(audit?.permissions?.secrets, []);
  const evidence = responses.find((response) => response.id === 4)?.result;
  assert.equal(evidence?.state, "attention");
  assert.equal(evidence?.ok, true);
  assert.equal(evidence?.evidence?.id, "seis-ui-state-contract-audit");
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
