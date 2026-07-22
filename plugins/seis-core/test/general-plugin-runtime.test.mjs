import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = process.cwd();
const serverPath = path.join(root, "plugins/seis-ai-agent/scripts/seis-general-plugin-mcp-server.mjs");

test("general-plugin MCP exposes the bounded read-only 10/30 surface", () => {
  const responses = callMcp([
    { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05" } },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_ai_agent_status", arguments: {} } },
  ]);

  assert.equal(responses.get(1)?.result?.serverInfo?.name, "seis-ai-agent");
  const toolNames = responses.get(2)?.result?.tools?.map((tool) => tool.name) || [];
  assert.ok(toolNames.includes("seis_general_plugin_guide"));
  assert.ok(toolNames.includes("seis_general_plugin_find"));
  assert.ok(toolNames.includes("seis_general_plugin_recommend"));

  const status = content(responses.get(3));
  assert.equal(status.marketplace.publicCardCount, 10);
  assert.equal(status.marketplace.generalPluginCardCount, 10);
  assert.equal(status.marketplace.internalPackageCount, 30);
  assert.equal(status.marketplace.internalPackageCardCount, 0);
  assert.equal(status.marketplace.maximumPackageSize, 15);
  assert.equal(status.executionBoundary.writeAccess, false);
  assert.equal(status.executionBoundary.networkAccess, false);
  assert.equal(status.executionBoundary.persistentBackgroundExecution, false);
});

test("general-plugin MCP finds at most three candidates and recommends one without installing", () => {
  const responses = callMcp([
    { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "seis_general_plugin_find", arguments: { query: "security supply chain" } } },
    { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "seis_general_plugin_recommend", arguments: { generalPluginId: "security-governance" } } },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_general_plugin_find", arguments: { query: "x" } } },
  ]);

  const finder = content(responses.get(1));
  assert.equal(finder.installationPerformed, false);
  assert.ok(finder.candidates.length > 0 && finder.candidates.length <= 3);
  assert.ok(finder.candidates.every((candidate) => candidate.internalPackageCount === 3));

  const recommendation = content(responses.get(2));
  assert.equal(recommendation.id, "security-governance");
  assert.equal(recommendation.installationPerformed, false);
  assert.equal(recommendation.internalPackageIds.length, 3);
  assert.match(recommendation.planCommand, /--general-plugin security-governance$/);
  assert.equal(responses.get(3)?.error?.code, -32602);
});

function callMcp(requests) {
  const result = spawnSync(process.execPath, [serverPath], {
    cwd: root,
    encoding: "utf8",
    input: `${requests.map((request) => JSON.stringify(request)).join("\n")}\n`,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return new Map(result.stdout.trim().split("\n").filter(Boolean).map((line) => {
    const response = JSON.parse(line);
    return [response.id, response];
  }));
}

function content(response) {
  return JSON.parse(response?.result?.content?.[0]?.text || "null");
}
