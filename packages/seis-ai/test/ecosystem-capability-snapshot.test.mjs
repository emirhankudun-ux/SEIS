import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  SEIS_CORE_ECOSYSTEM_SNAPSHOT_ID,
  SEIS_CORE_ECOSYSTEM_SNAPSHOT_PATH,
  buildSeisEcosystemCapabilitySnapshot,
} from "../src/model/ecosystem-capability-snapshot.mjs";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const expectedCounts = {
  coreLanes: 6,
  bundledPluginSources: 6,
  repoSkills: 25,
  auditedInstalledEnabledPlugins: 185,
  cataloguedHelperPlugins: 300,
  providers: 7,
  mcpTools: 35,
  mcpResources: 30,
  mcpPrompts: 3,
  productModules: 18,
  dataContracts: 18,
  validatedDataContracts: 16,
  designComponents: 12,
  validatedDesignComponents: 12,
  managedAgentRoles: 13,
};

test("ecosystem snapshot binds all six SEIS lanes to verified local routes", () => {
  const snapshot = buildSeisEcosystemCapabilitySnapshot(repoRoot);
  const expectedRoutes = new Map([
    ["seis", "../web/desktop.html?app=seis-command-center"],
    ["seis-cloud", "../web/desktop.html?app=seis-cloud"],
    ["seis-code", "../web/seis-code.html"],
    ["seis-design", "../web/desktop.html?app=seis-design"],
    ["seis-data", "../web/desktop.html?app=second-brain"],
    ["seis-store", "../web/desktop.html?app=seis-store"],
  ]);

  assert.equal(snapshot.id, SEIS_CORE_ECOSYSTEM_SNAPSHOT_ID);
  assert.equal(snapshot.schemaVersion, "2.0.0");
  assert.equal(snapshot.status, "source-backed-local-demo");
  assert.equal(snapshot.mode, "read-only-capability-control-plane");
  assert.deepEqual(snapshot.counts, expectedCounts);
  assert.deepEqual(snapshot.lanes.map((lane) => lane.id), [...expectedRoutes.keys()]);

  for (const lane of snapshot.lanes) {
    assert.equal(lane.route.href, expectedRoutes.get(lane.id));
    assert.equal(lane.executionAuthority, false);
    assert.equal(lane.mcp.executionAuthority, false);
    assert.ok(lane.qualityGates.every((gate) => gate.startsWith("npm run check:")));
  }

  const hub = snapshot.lanes.find((lane) => lane.id === "seis");
  assert.equal(hub.mcp.server, "seis-ai-agent");
  assert.equal(hub.mcp.sourceServer, "seis-governance");
  assert.match(hub.authorityNote, /historical SEIS Governance server label/);

  const cloud = snapshot.lanes.find((lane) => lane.id === "seis-cloud");
  assert.equal(cloud.sshBinding.serverAndPortPolicy, "preserve-existing-server-and-port");
  assert.equal(cloud.sshBinding.serverOrPortChanged, false);
  assert.equal(cloud.sshBinding.strictReady, false);

  const store = snapshot.lanes.find((lane) => lane.id === "seis-store");
  assert.equal(store.pluginBinding, null);
  assert.equal(store.mcp.toolCount, 0);
});

test("ecosystem snapshot keeps plugin, provider, MCP, and mutation claims fail closed", () => {
  const snapshot = buildSeisEcosystemCapabilitySnapshot(repoRoot);
  const falseBoundaryFields = [
    "providerCalls",
    "credentialsRead",
    "frontendSecretsAllowed",
    "liveMcpSessionStarted",
    "backgroundAutomation",
    "agentExecution",
    "sshExecuted",
    "deploymentPerformed",
    "githubMutationPerformed",
    "packageInstallationPerformed",
    "privateContentRead",
  ];

  assert.equal(snapshot.pluginAudit.state, "dated-source-audit-not-live-rescan");
  assert.equal(snapshot.helperPluginUniverse.state, "catalogued-not-blanket-activated");
  assert.equal(snapshot.mcpRuntime.liveBrowserSessionStarted, false);
  assert.ok(snapshot.providers.records.every((provider) => provider.backendOnly && !provider.frontendSecretAllowed));
  assert.ok(snapshot.plugins.every((plugin) => plugin.executionAuthority === false));
  assert.ok(falseBoundaryFields.every((field) => snapshot.runtimeBoundary[field] === false));
  assert.equal(snapshot.runtimeBoundary.browserLocalReadOnly, true);
  assert.equal(snapshot.runtimeBoundary.humanApprovalRequiredForExternalMutation, true);
  assert.doesNotMatch(JSON.stringify(snapshot), /\/Users\//);
});

test("generated ecosystem artifact is fresh", () => {
  const generated = JSON.parse(readFileSync(path.join(repoRoot, SEIS_CORE_ECOSYSTEM_SNAPSHOT_PATH), "utf8"));
  assert.deepEqual(generated, buildSeisEcosystemCapabilitySnapshot(repoRoot));
});

test("ecosystem builder rejects a provider that permits frontend secrets", () => {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), "seis-ecosystem-snapshot-"));
  const fixturePaths = [
    "data/seis-operating-identities.json",
    "data/seis-runtime-capability-atlas.json",
    "content/development/seis-agent-plugin-integration.json",
    "content/development/seis-ai-core-provider-registry.json",
    "content/development/seis-ai-core-mcp-runtime-contract.json",
    "content/development/seis-agent-registry.json",
    "content/development/seis-design-component-inventory.json",
    "content/development/seis-data-schema-registry.json",
    "content/development/seis-ssh-live-readiness-evidence.json",
    "deploy/seis-ssh-public-access-contract.json",
    "apps/web/desktop.js",
    "plugins/seis-ai-agent",
    "plugins/seis",
    "plugins/seis-cloud",
    "plugins/seis-code",
    "plugins/seis-design",
    "plugins/seis-data",
  ];

  try {
    for (const relativePath of fixturePaths) {
      const destination = path.join(fixtureRoot, relativePath);
      mkdirSync(path.dirname(destination), { recursive: true });
      cpSync(path.join(repoRoot, relativePath), destination, { recursive: true });
    }
    const providerPath = path.join(fixtureRoot, "content/development/seis-ai-core-provider-registry.json");
    const providerRegistry = JSON.parse(readFileSync(providerPath, "utf8"));
    providerRegistry.providers[0].frontendSecretAllowed = true;
    writeFileSync(providerPath, `${JSON.stringify(providerRegistry, null, 2)}\n`, "utf8");

    assert.throws(
      () => buildSeisEcosystemCapabilitySnapshot(fixtureRoot),
      /violates the backend-only secret boundary/,
    );
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
