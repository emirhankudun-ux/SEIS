import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const entrypoint = path.join(pluginRoot, "seis-mcp-permission", "scripts", "seis-mcp-permission-mcp-server.mjs");
const ledger = JSON.parse(readFileSync(path.join(repoRoot, "content", "development", "seis-mcp-permission-risk-matrix.json"), "utf8"));

test("SEIS MCP Permission validates retained app-source MCP boundaries", () => {
  const result = runCli(["--validate"]);

  assert.equal(result.state, "ready");
  assert.equal(result.ok, true);
  assert.equal(result.mode, "public-seis-repo-mcp-permission-read-only");
  assert.equal(result.marketplaceName, "seis-repo");
  assert.equal(result.marketplaceDisplayName, "SEIS Repo");
  assert.deepEqual(result.publicCards, {
    count: 34,
    canonicalOrchestratorCount: 1,
    bundleCardCount: 33,
    applicationBundleCardCount: 6,
    topicBundleCardCount: 27,
    directApplicationCardCount: 0,
  });
  assert.deepEqual(result.sourceCapabilities, {
    count: 380,
    retainedRootCount: 5,
    applicationCount: 75,
    topicCount: 300,
    applicationBundleMembershipCount: 75,
    applicationMcpServerCount: ledger.counts.applicationMcpServerCount,
  });
  assert.equal(result.policy.transport, "local-stdio");
  assert.equal(result.policy.command, "node");
  assert.equal(result.policy.remoteUrlAllowed, false);
  assert.equal(result.policy.environmentInjectionAllowed, false);
  assert.deepEqual(result.permissions.write, []);
  assert.deepEqual(result.permissions.network, []);
  assert.deepEqual(result.permissions.secrets, []);
  assert.deepEqual(result.findings, []);
});

test("SEIS MCP Permission returns a bounded public ledger record", () => {
  const result = runCli(["--ledger", "--plugin", "seis-mcp-permission"]);

  assert.equal(result.state, "ready");
  assert.equal(result.ok, true);
  assert.equal(result.recordCount, ledger.records.length);
  assert.equal(result.returnedRecordCount, 1);
  assert.deepEqual(result.records, [{
    name: "seis-mcp-permission",
    marketplaceCard: false,
    distributionBundleId: "seis-application-bundle-03",
    transport: "local-stdio",
    command: "node",
    permissionState: "deny-by-default",
    remoteEndpointDeclared: false,
    environmentInjectionDeclared: false,
    risk: "low",
    state: "validated-declared-boundary",
  }]);
  assert.equal(result.publicReleaseAllowed, false);
  assert.equal(JSON.stringify(result).includes("/Users/"), false);
  assert.equal(JSON.stringify(result).includes("/home/"), false);
});

test("SEIS MCP Permission rejects a contaminated generated ledger without echoing it", () => {
  const fixture = createFixtureRoot();
  try {
    const valid = runCli(["--validate"], { SEIS_REPO_ROOT: fixture.root });
    assert.equal(valid.state, "ready");
    assert.equal(valid.ok, true);

    const contaminated = fixture.ledger();
    contaminated.records[0].permissions.network = ["https://unsafe.invalid"];
    contaminated.records[0].entrypoint = "/Users/example/secret.mjs";
    writeJson(fixture.root, "content/development/seis-mcp-permission-risk-matrix.json", contaminated);
    const invalid = runCli(["--validate"], { SEIS_REPO_ROOT: fixture.root });
    assert.equal(invalid.state, "attention");
    assert.equal(invalid.ok, false);
    assert.equal(invalid.findings.some((finding) => finding.code === "ledger-record-entrypoint-invalid"), true);
    assert.equal(invalid.findings.some((finding) => finding.code === "ledger-record-permissions-invalid"), true);
    assert.equal(JSON.stringify(invalid).includes(fixture.root), false);
    assert.equal(JSON.stringify(invalid).includes("/Users/example/secret.mjs"), false);
    assert.equal(JSON.stringify(invalid).includes("https://unsafe.invalid"), false);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("SEIS MCP Permission rejects direct app cards and duplicate bundle membership", () => {
  const fixture = createFixtureRoot();
  try {
    const marketplace = fixture.marketplace();
    marketplace.plugins.push({
      name: "seis-mcp-permission",
      source: { source: "local", path: "./plugins/seis-core/seis-mcp-permission" },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    });
    writeJson(fixture.root, ".agents/plugins/marketplace.json", marketplace);

    const catalog = fixture.bundleCatalog();
    catalog.bundles.push({
      id: "seis-application-bundle-02",
      family: "application",
      sourcePath: "./plugins/seis-bundles/seis-application-bundle-02",
      memberCount: 1,
      memberNames: ["seis-mcp-permission"],
    });
    writeJson(fixture.root, "content/development/seis-public-plugin-bundle-catalog.json", catalog);

    const invalid = runCli(["--validate"], { SEIS_REPO_ROOT: fixture.root });
    assert.equal(invalid.state, "attention");
    assert.equal(invalid.ok, false);
    assert.equal(invalid.findings.some((finding) => finding.code === "marketplace-direct-application-card-present"), true);
    assert.equal(invalid.findings.some((finding) => finding.code === "application-source-multiple-bundle-memberships"), true);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("SEIS MCP Permission exposes bounded MCP tools without writes", () => {
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_mcp_permission_status", arguments: {} } },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_mcp_permission_validate", arguments: {} } },
    { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "seis_mcp_permission_ledger", arguments: { plugin: "seis-mcp-permission" } } },
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
  assert.deepEqual(toolNames.sort(), ["seis_mcp_permission_ledger", "seis_mcp_permission_status", "seis_mcp_permission_validate"]);
  assert.equal(responses.find((response) => response.id === 3)?.result?.status, "ready");
  assert.equal(responses.find((response) => response.id === 4)?.result?.ok, true);
  assert.equal(responses.find((response) => response.id === 5)?.result?.records?.[0]?.name, "seis-mcp-permission");
  for (const id of [3, 4, 5]) {
    const payload = responses.find((response) => response.id === id)?.result;
    assert.deepEqual(payload?.permissions?.write, []);
    assert.deepEqual(payload?.permissions?.network, []);
    assert.deepEqual(payload?.permissions?.secrets, []);
  }
});

function createFixtureRoot() {
  const root = mkdtempSync(path.join(os.tmpdir(), "seis-mcp-permission-"));
  const ledger = () => ({
    schemaVersion: 2,
    id: "seis-mcp-permission-risk-matrix",
    goalId: "SEIS-GOAL-021",
    plugin: { name: "seis-mcp-permission", marketplaceName: "seis-repo", marketplaceCard: false, distributionBundleId: "seis-application-bundle-01" },
    scope: { marketplaceName: "seis-repo", marketplaceDisplayName: "SEIS Repo", bundleCatalogPath: "content/development/seis-public-plugin-bundle-catalog.json" },
    policy: {
      transport: "local-stdio",
      command: "node",
      remoteUrlAllowed: false,
      environmentInjectionAllowed: false,
      permissions: { write: [], network: [], secrets: [] },
      humanApprovalRequiredFor: ["network"],
    },
    counts: {
      marketplaceCardCount: 2,
      canonicalOrchestratorCount: 1,
      bundleCardCount: 1,
      applicationBundleCardCount: 1,
      topicBundleCardCount: 0,
      sourceCapabilityCount: 1,
      retainedRootSourceCapabilityCount: 0,
      applicationSourceCapabilityCount: 1,
      topicSourceCapabilityCount: 0,
      directApplicationMarketplaceCardCount: 0,
      applicationBundleMembershipCount: 1,
      applicationMcpServerCount: 1,
      localStdioServerCount: 1,
      remoteServerCount: 0,
      writePermissionGrantCount: 0,
      networkPermissionGrantCount: 0,
      secretPermissionGrantCount: 0,
      validRecordCount: 1,
      invalidRecordCount: 0,
    },
    records: [{
      name: "seis-mcp-permission",
      marketplaceCard: false,
      distributionBundleId: "seis-application-bundle-01",
      sourcePath: "plugins/seis-core/seis-mcp-permission",
      transport: "local-stdio",
      serverName: "seis-mcp-permission",
      command: "node",
      entrypoint: "scripts/seis-mcp-permission-mcp-server.mjs",
      permissionState: "deny-by-default",
      permissions: { write: [], network: [], secrets: [] },
      remoteEndpointDeclared: false,
      environmentInjectionDeclared: false,
      risk: "low",
      state: "validated-declared-boundary",
    }],
    safety: { write: [], network: [], secrets: [], startsMcpServers: false, permissionGrant: false, publicReleaseAllowed: false },
  });
  const marketplace = () => ({
    name: "seis-repo",
    interface: { displayName: "SEIS Repo" },
    plugins: [
      {
        name: "seis-ai-agent",
        source: { source: "local", path: "./plugins/seis-ai-agent" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      },
      {
        name: "seis-application-bundle-01",
        source: { source: "local", path: "./plugins/seis-bundles/seis-application-bundle-01" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      },
    ],
  });
  const bundleCatalog = () => ({
    id: "seis-public-plugin-bundle-catalog",
    marketplace: {
      publicCardCount: 2,
      canonicalCardCount: 1,
      bundleCardCount: 1,
      applicationBundleCardCount: 1,
      topicBundleCardCount: 0,
    },
    sourceCapabilityInventory: {
      rootSourceModuleCount: 0,
      applicationSourcePackageCount: 1,
      topicSourcePackageCount: 0,
      retainedSourcePackageCount: 1,
    },
    bundles: [{
      id: "seis-application-bundle-01",
      family: "application",
      sourcePath: "./plugins/seis-bundles/seis-application-bundle-01",
      memberCount: 1,
      memberNames: ["seis-mcp-permission"],
    }],
  });
  writeJson(root, ".agents/plugins/marketplace.json", marketplace());
  writeJson(root, "content/development/seis-public-plugin-family.json", {
    marketplace: {
      publicPluginCount: 2,
      canonicalOrchestratorCount: 1,
      bundlePluginCount: 1,
      applicationBundlePluginCount: 1,
      topicBundlePluginCount: 0,
      migratedRootPluginCount: 0,
      applicationPluginCount: 1,
      topicPluginCount: 0,
      sourceCapabilityCount: 1,
    },
    publicPlugins: [{ name: "seis-ai-agent" }],
    migratedRootPlugins: [],
    applicationPlugins: [{ name: "seis-mcp-permission" }],
    topicPlugins: [],
  });
  writeJson(root, "content/development/seis-public-plugin-bundle-catalog.json", bundleCatalog());
  writeJson(root, "apps/seis-core/data/seis-core-plugin-sources.json", {
    id: "seis-core-plugin-sources",
    sourceRoot: "plugins/seis-core",
    pluginCount: 1,
    plugins: [{ name: "seis-mcp-permission" }],
  });
  writeJson(root, "content/development/seis-mcp-permission-risk-matrix.json", ledger());
  return { root, ledger, marketplace, bundleCatalog };
}

function writeJson(root, relativePath, value) {
  const outputPath = path.join(root, relativePath);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(value, null, 2)}\n`);
}

function runCli(args, extraEnv = {}) {
  const result = spawnSync(process.execPath, [entrypoint, ...args], {
    cwd: repoRoot,
    env: { ...process.env, SEIS_REPO_ROOT: repoRoot, ...extraEnv },
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
    const headerEnd = bytes.indexOf(Buffer.from("\r\n\r\n"), offset);
    if (headerEnd < 0) break;
    const header = bytes.slice(offset, headerEnd).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    assert.ok(match, "MCP response must include Content-Length");
    const length = Number.parseInt(match[1], 10);
    const start = headerEnd + 4;
    messages.push(JSON.parse(bytes.slice(start, start + length).toString("utf8")));
    offset = start + length;
  }
  return messages;
}
