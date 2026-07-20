import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const entrypoint = path.join(pluginRoot, "seis-trusted-marketplace", "scripts", "seis-trusted-marketplace-mcp-server.mjs");
const intake = JSON.parse(readFileSync(path.join(repoRoot, "content", "development", "trusted-marketplace-intake.json"), "utf8"));

test("SEIS Trusted Marketplace validates the public SEIS Repo intake without activation", () => {
  const report = runCli(["--validate"]);
  assert.equal(report.state, "ready");
  assert.equal(report.ok, true);
  assert.equal(report.mode, "public-seis-repo-trusted-marketplace-read-only");
  assert.equal(report.marketplaceName, "seis-repo");
  assert.equal(report.marketplaceDisplayName, "SEIS Repo");
  assert.equal(report.cardPresent, true);
  assert.equal(report.channelCount, intake.marketplaceChannels.length);
  assert.equal(report.trustedSourceCount, intake.trustedSourceShortlist.length);
  assert.equal(report.errorCount, 0);
  assert.deepEqual(report.findings, []);
  assert.deepEqual(report.permissions.write, []);
  assert.deepEqual(report.permissions.network, []);
  assert.deepEqual(report.permissions.secrets, []);
});

test("SEIS Trusted Marketplace exposes bounded MCP tools without writes", () => {
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_trusted_marketplace_status", arguments: {} } },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_trusted_marketplace_validate", arguments: {} } }
  ];
  const result = spawnSync(process.execPath, [entrypoint], {
    cwd: repoRoot,
    env: { ...process.env, SEIS_REPO_ROOT: repoRoot },
    input: requests.map(frame).join(""),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr);
  const responses = parseFrames(result.stdout);
  const toolNames = responses.find((response) => response.id === 2)?.result?.tools?.map((tool) => tool.name) || [];
  assert.deepEqual(toolNames.sort(), ["seis_trusted_marketplace_status", "seis_trusted_marketplace_validate"]);

  const status = responses.find((response) => response.id === 3)?.result;
  assert.equal(status?.status, "ready");
  assert.equal(status?.marketplace?.marketplaceName, "seis-repo");
  assert.equal(status?.marketplace?.cardPresent, true);

  const validation = responses.find((response) => response.id === 4)?.result;
  assert.equal(validation?.ok, true);
  assert.equal(validation?.channelCount, intake.marketplaceChannels.length);
  assert.equal(validation?.trustedSourceCount, intake.trustedSourceShortlist.length);
  assert.deepEqual(validation?.permissions?.write, []);
  assert.deepEqual(validation?.permissions?.network, []);
  assert.deepEqual(validation?.permissions?.secrets, []);
});

function runCli(args) {
  const result = spawnSync(process.execPath, [entrypoint, ...args], {
    cwd: repoRoot,
    env: { ...process.env, SEIS_REPO_ROOT: repoRoot },
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function frame(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

function parseFrames(output) {
  const bytes = Buffer.from(output, "utf8");
  const messages = [];
  let offset = 0;
  while (offset < bytes.length) {
    const separator = bytes.indexOf("\r\n\r\n", offset, "utf8");
    assert.notEqual(separator, -1, "MCP frame header is incomplete");
    const header = bytes.subarray(offset, separator).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    assert.ok(match, "MCP frame has no Content-Length");
    const length = Number.parseInt(match[1], 10);
    const start = separator + 4;
    const end = start + length;
    assert.ok(end <= bytes.length, "MCP frame body is incomplete");
    messages.push(JSON.parse(bytes.subarray(start, end).toString("utf8")));
    offset = end;
  }
  return messages;
}
