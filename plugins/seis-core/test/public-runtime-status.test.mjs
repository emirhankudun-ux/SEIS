import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const entrypoint = path.join(pluginRoot, "seis-public-runtime-status", "scripts", "seis-public-runtime-status-mcp-server.mjs");
const runtimeStatus = JSON.parse(readFileSync(path.join(repoRoot, "content", "development", "seis-public-runtime-status.json"), "utf8"));
const marketplace = JSON.parse(readFileSync(path.join(repoRoot, ".agents", "plugins", "marketplace.json"), "utf8"));

test("SEIS Public Runtime Status validates public card and observation boundaries", () => {
  assert.equal(runtimeStatus.schemaVersion, 2);
  assert.equal(runtimeStatus.plugin.distributionMode, "bundled-source-capability");
  assert.equal(runtimeStatus.plugin.marketplaceCardName, "seis-application-bundle-05");
  const result = runCli(["--validate"]);
  assert.equal(result.state, "ready");
  assert.equal(result.ok, true);
  assert.equal(result.mode, "public-seis-repo-runtime-cache-read-only");
  assert.equal(result.marketplaceName, "seis-repo");
  assert.equal(result.marketplaceDisplayName, "SEIS Repo");
  assert.equal(result.publicCards.count, runtimeStatus.publicCards.count);
  assert.equal(result.publicCards.count, 34);
  assert.equal(result.publicCards.canonicalOrchestratorCount, 1);
  assert.equal(result.publicCards.bundleCardCount, 33);
  assert.equal(result.publicCards.applicationBundleCardCount, 6);
  assert.equal(result.publicCards.topicBundleCardCount, 27);
  assert.deepEqual(result.sourceCapabilities, {
    count: 380,
    migratedRootCount: 5,
    applicationCount: 75,
    topicCount: 300,
    separateMarketplaceCards: false
  });
  assert.equal(result.observationBoundary.cacheRecordIsInstallationProof, false);
  assert.equal(result.observationBoundary.cacheRecordIsEnablementProof, false);
  assert.equal(result.observationBoundary.publicReleaseAllowed, false);
  assert.deepEqual(result.permissions.write, []);
  assert.deepEqual(result.permissions.network, []);
  assert.deepEqual(result.permissions.secrets, []);
  assert.deepEqual(result.findings, []);
});

test("SEIS Public Runtime Status compares current, stale, invalid, missing, and undeclared cache records", () => {
  const cacheRoot = mkdtempSync(path.join(os.tmpdir(), "seis-public-runtime-status-"));
  try {
    const currentName = "seis-application-bundle-05";
    const staleName = "seis-application-bundle-01";
    const invalidName = "seis-application-bundle-02";
    const currentVersion = sourceVersion(currentName);
    writeCacheManifest(cacheRoot, currentName, currentVersion);
    writeCacheManifest(cacheRoot, staleName, "0.0.0");
    writeCacheManifest(cacheRoot, invalidName, "broken", "{not-json");
    writeCacheManifest(cacheRoot, "retired-seis-package", "1.0.0");

    const result = runCli(["--runtime"], { SEIS_PUBLIC_RUNTIME_CACHE_ROOT: cacheRoot });
    assert.equal(result.state, "attention");
    assert.equal(result.ok, true);
    assert.equal(result.runtimeObserved, true);
    assert.equal(result.cacheRootDetected, true);
    assert.equal(result.sourceCapabilities.count, 380);
    assert.equal(result.sourceCapabilities.separateMarketplaceCards, false);
    assert.equal(result.cacheRecordCount, 4);
    assert.equal(result.declaredCacheRecordCount, 3);
    assert.equal(result.currentCacheRecordCount, 1);
    assert.equal(result.staleCacheRecordCount, 1);
    assert.equal(result.declaredInvalidCacheRecordCount, 1);
    assert.equal(result.missingCacheRecordCount, runtimeStatus.publicCards.count - 3);
    assert.equal(result.undeclaredCacheRecordCount, 1);
    assert.equal(result.observationBoundary.cacheRecordIsInstallationProof, false);
    assert.equal(result.observationBoundary.cacheRecordIsEnablementProof, false);
    assert.equal(result.observationBoundary.publicReleaseAllowed, false);
    assert.equal(result.records.find((record) => record.name === currentName)?.cacheState, "current");
    assert.equal(result.records.find((record) => record.name === staleName)?.cacheState, "stale");
    assert.equal(result.records.find((record) => record.name === invalidName)?.cacheState, "invalid");
    assert.equal(JSON.stringify(result).includes(cacheRoot), false);
    assert.equal(JSON.stringify(result).includes("retired-seis-package"), false);
  } finally {
    rmSync(cacheRoot, { recursive: true, force: true });
  }
});

test("SEIS Public Runtime Status exposes bounded MCP tools without writes", () => {
  const cacheRoot = mkdtempSync(path.join(os.tmpdir(), "seis-public-runtime-status-mcp-"));
  try {
    const requests = [
      { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
      { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
      { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_public_runtime_status", arguments: {} } },
      { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_public_runtime_validate", arguments: {} } }
    ];
    const result = spawnSync(process.execPath, [entrypoint], {
      cwd: repoRoot,
      env: { ...process.env, SEIS_REPO_ROOT: repoRoot, SEIS_PUBLIC_RUNTIME_CACHE_ROOT: cacheRoot },
      input: requests.map(frame).join(""),
      encoding: "utf8"
    });

    assert.equal(result.status, 0, result.stderr);
    const responses = parseFrames(result.stdout);
    const toolNames = responses.find((response) => response.id === 2)?.result?.tools?.map((tool) => tool.name) || [];
    assert.deepEqual(toolNames.sort(), ["seis_public_runtime_status", "seis_public_runtime_validate"]);

    const runtime = responses.find((response) => response.id === 3)?.result;
    assert.equal(runtime?.state, "ready");
    assert.equal(runtime?.runtimeObserved, true);
    assert.equal(runtime?.sourceCapabilities?.count, 380);
    assert.equal(runtime?.missingCacheRecordCount, runtimeStatus.publicCards.count);
    assert.deepEqual(runtime?.permissions?.write, []);
    assert.deepEqual(runtime?.permissions?.network, []);
    assert.deepEqual(runtime?.permissions?.secrets, []);

    const validation = responses.find((response) => response.id === 4)?.result;
    assert.equal(validation?.ok, true);
    assert.equal(validation?.observationBoundary?.publicReleaseAllowed, false);
    assert.deepEqual(validation?.permissions?.write, []);
    assert.deepEqual(validation?.permissions?.network, []);
    assert.deepEqual(validation?.permissions?.secrets, []);
  } finally {
    rmSync(cacheRoot, { recursive: true, force: true });
  }
});

function sourceVersion(name) {
  const card = marketplace.plugins.find((item) => item?.name === name);
  assert.ok(card, `missing marketplace card: ${name}`);
  const manifestPath = path.resolve(repoRoot, card.source.path, ".codex-plugin", "plugin.json");
  return JSON.parse(readFileSync(manifestPath, "utf8")).version;
}

function writeCacheManifest(cacheRoot, name, version, rawManifest = null) {
  const manifestPath = path.join(cacheRoot, name, version, ".codex-plugin", "plugin.json");
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, rawManifest || `${JSON.stringify({ name, version }, null, 2)}\n`);
}

function runCli(args, extraEnv = {}) {
  const result = spawnSync(process.execPath, [entrypoint, ...args], {
    cwd: repoRoot,
    env: { ...process.env, SEIS_REPO_ROOT: repoRoot, ...extraEnv },
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
