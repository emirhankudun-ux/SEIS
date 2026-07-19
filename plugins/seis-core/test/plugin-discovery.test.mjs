import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const entrypoint = path.join(pluginRoot, "seis-plugin-discovery", "scripts", "seis-plugin-discovery-mcp-server.mjs");

test("SEIS Plugin Discovery lists bounded public marketplace metadata", () => {
  const result = runCli(["--catalog", "--query", "security", "--limit", "3"]);
  assert.equal(result.state, "ready");
  assert.equal(result.ok, true);
  assert.equal(result.mode, "repo-marketplace-metadata-only");
  assert.equal(result.marketplaceName, "seis-repo");
  assert.equal(result.marketplaceDisplayName, "SEIS Repo");
  assert.equal(result.cardCount, 366);
  assert.ok(result.matchedCardCount >= result.returnedCardCount);
  assert.ok(result.returnedCardCount <= 3);
  assert.ok(result.cards.every((card) => card.sourcePath.startsWith("./plugins/")));
  assert.ok(result.cards.every((card) => !/personal/i.test(card.name)));
});

test("SEIS Plugin Discovery exposes catalog inspection through MCP without writes", () => {
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_plugin_discovery_catalog", arguments: { query: "security", limit: 2 } } },
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
  assert.deepEqual(toolNames.sort(), ["seis_plugin_discovery", "seis_plugin_discovery_catalog", "seis_plugin_discovery_status"]);

  const catalog = responses.find((response) => response.id === 3)?.result;
  assert.equal(catalog?.ok, true);
  assert.equal(catalog?.cardCount, 366);
  assert.equal(catalog?.returnedCardCount, 2);
  assert.ok(catalog?.cards?.every((card) => card.sourcePath.startsWith("./plugins/")));
});

function runCli(args) {
  const result = spawnSync(process.execPath, [entrypoint, ...args], {
    cwd: repoRoot,
    env: { ...process.env, SEIS_REPO_ROOT: repoRoot },
    encoding: "utf8",
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
