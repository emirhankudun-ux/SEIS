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
  assert.equal(mesh.probe.verifiedServerCount, 6);
  assert.equal(mesh.probe.failedServerCount, 0);
  assert.ok(mesh.servers.every((server) => server.status === "probe-verified"));
  assert.ok(mesh.servers.every((server) => server.toolInventory.toolCount > 0));
  assert.ok(mesh.servers.every((server) => server.externalMutationPerformed === false));
  assert.equal(mesh.boundary.externalMutationPerformed, false);
  assert.doesNotMatch(JSON.stringify(mesh), /ghp_[A-Za-z0-9]/);
});
