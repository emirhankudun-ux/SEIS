import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildSeisPluginMcpMesh,
  probeSeisPluginMcpMesh,
  SEIS_PLUGIN_MCP_MESH_ID,
} from "../src/lib/plugin-mcp-mesh.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

test("builds a source-backed mesh for every bundled SEIS MCP entrypoint", () => {
  const mesh = buildSeisPluginMcpMesh(repoRoot);

  assert.equal(mesh.id, SEIS_PLUGIN_MCP_MESH_ID);
  assert.equal(mesh.serverCount, 6);
  assert.equal(mesh.configuredServerCount, 6);
  assert.equal(mesh.status, "configured-local-read-only");
  assert.equal(mesh.boundary.liveSessionStarted, false);
  assert.equal(mesh.boundary.probeOptIn, true);
  assert.equal(mesh.boundary.transport, "stdio newline-delimited JSON-RPC");
  assert.ok(mesh.servers.every((server) => server.executionAuthority === false));
  assert.ok(mesh.servers.every((server) => server.credentialsRead === false));
  assert.ok(mesh.servers.every((server) => server.networkCalled === false));
  assert.ok(mesh.servers.every((server) => server.toolInventory.mode === "not-probed"));
  assert.doesNotMatch(JSON.stringify(mesh), /\/Users\//);
});

test("probes every bundled MCP entrypoint through local stdio tools/list only", () => {
  const mesh = probeSeisPluginMcpMesh(repoRoot, { timeoutMs: 5_000 });

  assert.equal(mesh.ok, true);
  assert.equal(mesh.status, "probe-verified-local-read-only");
  assert.equal(mesh.probe.performed, true);
  assert.equal(mesh.probe.transport, "stdio newline-delimited JSON-RPC");
  assert.equal(mesh.probe.lifecycle, "initialize -> notifications/initialized -> tools/list");
  assert.equal(mesh.probe.verifiedServerCount, 6);
  assert.equal(mesh.probe.failedServerCount, 0);
  assert.ok(mesh.servers.every((server) => server.status === "probe-verified"));
  assert.ok(mesh.servers.every((server) => server.toolInventory.toolCount > 0));
  assert.ok(mesh.servers.every((server) => server.externalMutationPerformed === false));
  const expectedToolNames = {
    "seis-ai-agent": [
      "seis_agent_lanes",
      "seis_ai_agent_plan",
      "seis_ai_agent_status",
      "seis_automation_plan",
      "seis_automation_status",
      "seis_cloud_plan",
      "seis_cloud_status",
      "seis_code_plan",
      "seis_code_status",
      "seis_data_plan",
      "seis_data_status",
      "seis_design_plan",
      "seis_design_status",
      "seis_governance_plan",
      "seis_governance_status",
      "seis_hub_plan",
      "seis_hub_status",
      "seis_product_plan",
      "seis_product_status",
      "seis_research_plan",
      "seis_research_status",
      "seis_security_plan",
      "seis_security_status",
    ],
    seis: [
      "seis_llm_package_snapshot",
      "seis_llm_plan_request",
      "seis_llm_role_plan_request",
      "seis_repos_bridge_status",
      "seis_specialist_lane_plan",
      "seis_specialist_lane_status",
      "seis_specialist_lanes",
    ],
    "seis-cloud": ["seis_cloud_plan", "seis_cloud_status"],
    "seis-code": ["seis_code_plan", "seis_code_status"],
    "seis-design": ["seis_design_plan", "seis_design_status"],
    "seis-data": ["seis_data_plan", "seis_data_status"],
  };
  for (const server of mesh.servers) {
    assert.deepEqual(server.toolInventory.toolNames, expectedToolNames[server.id]);
  }
  assert.equal(mesh.boundary.externalMutationPerformed, false);
  assert.doesNotMatch(JSON.stringify(mesh), /ghp_[A-Za-z0-9]/);
});

test("can opt into one allowlisted local status probe per bundled MCP entrypoint", () => {
  const mesh = probeSeisPluginMcpMesh(repoRoot, { timeoutMs: 5_000, probeSafeTools: true });

  assert.equal(mesh.ok, true);
  assert.equal(mesh.probe.safeToolCallsPerformed, true);
  assert.equal(mesh.probe.safeToolProbeCount, 6);
  assert.equal(mesh.probe.lifecycle, "initialize -> notifications/initialized -> tools/list -> allowlisted status tool");
  assert.equal(mesh.boundary.safeToolCallsPerformed, true);
  assert.match(mesh.boundary.probeScope, /allowlisted repository-local status tool/);
  assert.match(mesh.boundary.safeToolProbePolicy, /one repository-local status tool/);

  const expectedSafeTools = {
    "seis-ai-agent": "seis_ai_agent_status",
    seis: "seis_repos_bridge_status",
    "seis-cloud": "seis_cloud_status",
    "seis-code": "seis_code_status",
    "seis-design": "seis_design_status",
    "seis-data": "seis_data_status",
  };
  for (const server of mesh.servers) {
    assert.equal(server.safeToolProbe.status, "verified");
    assert.equal(server.safeToolProbe.requestedTool, expectedSafeTools[server.id]);
    assert.equal(server.safeToolProbe.error, null);
    assert.equal(server.externalMutationPerformed, false);
    assert.equal(server.networkCalled, false);
    assert.equal(server.credentialsRead, false);
  }
});
