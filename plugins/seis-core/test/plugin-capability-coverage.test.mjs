import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  PLUGIN_CAPABILITY_COVERAGE_ID,
  PLUGIN_CAPABILITY_COVERAGE_LIMITS,
  auditPluginCapabilityCoverage,
} from "../seis-plugin-capability-coverage/runtime/plugin-capability-coverage.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const serverPath = path.join(repositoryRoot, "plugins/seis-core/seis-plugin-capability-coverage/scripts/seis-plugin-capability-coverage-mcp-server.mjs");

test("reports bounded declared capability coverage for fixed public SEIS Repo registry projections", () => {
  const report = auditPluginCapabilityCoverage(repositoryRoot);

  assert.equal(report.plugin, PLUGIN_CAPABILITY_COVERAGE_ID);
  assert.equal(report.state, "ready");
  assert.equal(report.ok, true);
  assert.equal(report.classification, "bounded-declared-seis-plugin-capability-coverage");
  assert.equal(report.summary.registryReadable, true);
  assert.ok(report.summary.sourcePluginCount > 0);
  assert.equal(report.summary.sourcePluginCount, report.summary.catalogPluginCount);
  assert.equal(report.summary.sourcePluginCount, report.summary.matrixPluginCount);
  assert.equal(report.summary.sourcePluginCount, report.summary.marketplaceApplicationCardCount);
  assert.equal(report.reconciliation.reconciled, true);
  assert.equal(report.reconciliation.mismatchCount, 0);
  assert.ok(report.coverage.categoryCounts.length > 0);
  assert.ok(report.coverage.capabilityTokenFrequencies.length > 0);
  assert.equal(report.permissions.write.length, 0);
  assert.equal(report.permissions.network.length, 0);
  assert.equal(report.permissions.secrets.length, 0);
  assert.equal(report.safety.readsPersonalMarketplace, false);
  assert.equal(report.safety.writesFiles, false);
  assert.equal(report.safety.usesNetwork, false);
  assert.equal(report.outputBoundary.rawRegistryContentReturned, false);
  assert.equal(report.outputBoundary.absolutePathsReturned, false);
  assert.equal(JSON.stringify(report).includes(repositoryRoot), false);
});

test("produces deterministic category, capability-token, and reconciliation summaries", () => {
  const fixtureRoot = createFixture();
  try {
    const report = auditPluginCapabilityCoverage(fixtureRoot);
    assert.equal(report.state, "ready");
    assert.deepEqual(report.coverage.categoryCounts, [{ category: "developer", count: 2 }]);
    assert.deepEqual(report.coverage.capabilityTokenFrequencies, [
      { token: "registry-coverage", count: 2 },
      { token: "read-only", count: 1 },
    ]);
    assert.equal(report.coverage.declaredCapabilityTokenCount, 3);
    assert.equal(report.reconciliation.sourcePluginCount, 2);
    assert.equal(report.reconciliation.marketplacePublicCardCount, 3);
    assert.equal(report.reconciliation.reconciled, true);
  } finally {
    removeFixture(fixtureRoot);
  }
});

test("reports projection drift without returning registry names or raw values", () => {
  const fixtureRoot = createFixture();
  try {
    const catalogPath = fixedPath(fixtureRoot, "apps/seis-core/data/seis-core-plugin-catalog.json");
    const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
    catalog.plugins.pop();
    fs.writeFileSync(catalogPath, JSON.stringify(catalog));

    const report = auditPluginCapabilityCoverage(fixtureRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "registry-projection-mismatch"));
    assert.equal(report.reconciliation.reconciled, false);
    assert.equal(JSON.stringify(report).includes("fixture-alpha"), false);
    assert.equal(JSON.stringify(report).includes("fixture-beta"), false);
  } finally {
    removeFixture(fixtureRoot);
  }
});

test("refuses symlinked and oversized fixed registry files without reading them", () => {
  const fixtureRoot = createFixture();
  try {
    const sourcePath = fixedPath(fixtureRoot, "apps/seis-core/data/seis-core-plugin-sources.json");
    const movedPath = path.join(fixtureRoot, "unsafe-source.json");
    fs.renameSync(sourcePath, movedPath);
    fs.symlinkSync(movedPath, sourcePath, "file");
    const symlinkReport = auditPluginCapabilityCoverage(fixtureRoot);
    assert.equal(symlinkReport.ok, false);
    assert.ok(symlinkReport.findings.some((finding) => finding.code === "registry-not-regular-file"));
    assert.equal(JSON.stringify(symlinkReport).includes(movedPath), false);
  } finally {
    removeFixture(fixtureRoot);
  }

  const oversizedRoot = createFixture();
  try {
    const sourcePath = fixedPath(oversizedRoot, "apps/seis-core/data/seis-core-plugin-sources.json");
    fs.writeFileSync(sourcePath, "x".repeat(PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxRegistryBytes + 1));
    const oversizedReport = auditPluginCapabilityCoverage(oversizedRoot);
    assert.equal(oversizedReport.ok, false);
    assert.ok(oversizedReport.findings.some((finding) => finding.code === "registry-byte-limit-exceeded"));
    assert.equal(JSON.stringify(oversizedReport).includes("x".repeat(32)), false);
  } finally {
    removeFixture(oversizedRoot);
  }
});

test("redacts machine paths and credential assignment markers from bounded output", () => {
  const fixtureRoot = createFixture();
  try {
    const sourcePath = fixedPath(fixtureRoot, "apps/seis-core/data/seis-core-plugin-sources.json");
    const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    source.note = "/Users/example/fixture-machine-path";
    source.api_key = "fixture-secret-value";
    fs.writeFileSync(sourcePath, JSON.stringify(source));
    const report = auditPluginCapabilityCoverage(fixtureRoot);
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "machine-path-marker-redacted"));
    assert.ok(report.findings.some((finding) => finding.code === "credential-assignment-marker-found"));
    assert.equal(JSON.stringify(report).includes("fixture-machine-path"), false);
    assert.equal(JSON.stringify(report).includes("fixture-secret-value"), false);
  } finally {
    removeFixture(fixtureRoot);
  }
});

test("MCP exposes only bounded tools and refuses arbitrary report paths", () => {
  const toolsResponse = sendMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  const reportResponse = sendMcpRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "seis_plugin_capability_coverage_report",
      arguments: { path: "../../outside-workspace" },
    },
  });

  assert.equal(toolsResponse.result.tools.length, 3);
  assert.equal(reportResponse.result.state, "attention");
  assert.equal(reportResponse.result.ok, false);
  assert.equal(reportResponse.result.findings[0].code, "invalid-report-path");
  assert.equal(JSON.stringify(reportResponse).includes(repositoryRoot), false);
});

test("status remains non-mutating and does not install plugins", () => {
  const sourcePath = path.join(repositoryRoot, "apps/seis-core/data/seis-core-plugin-sources.json");
  const before = fs.readFileSync(sourcePath, "utf8");
  const result = spawnSync(process.execPath, [serverPath, "--status"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  const status = JSON.parse(result.stdout);
  assert.equal(status.status, "ready");
  assert.equal(status.safety.installsPlugins, false);
  assert.equal(status.safety.writesFiles, false);
  assert.equal(fs.readFileSync(sourcePath, "utf8"), before);
});

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "seis-plugin-capability-coverage-"));
  writeJson(root, "apps/seis-core/data/seis-core-plugin-sources.json", {
    id: "seis-core-plugin-sources",
    plugins: [{ name: "fixture-alpha" }, { name: "fixture-beta" }],
  });
  writeJson(root, "apps/seis-core/data/seis-core-plugin-catalog.json", {
    id: "seis-core-application-plugin-catalog",
    plugins: [
      { name: "fixture-alpha", category: "Developer", capabilities: ["Read-only", "Registry Coverage"] },
      { name: "fixture-beta", category: "Developer", capabilities: ["Registry Coverage"] },
    ],
  });
  writeJson(root, "content/development/seis-core-plugin-matrix.json", {
    id: "seis-core-plugin-matrix",
    plugins: [{ name: "fixture-alpha" }, { name: "fixture-beta" }],
  });
  writeJson(root, ".agents/plugins/marketplace.json", {
    name: "seis-repo",
    interface: { displayName: "SEIS Repo" },
    plugins: [
      { name: "fixture-alpha", source: { path: "./plugins/seis-core/fixture-alpha" } },
      { name: "fixture-beta", source: { path: "./plugins/seis-core/fixture-beta" } },
      { name: "fixture-root", source: { path: "./plugins/seis" } },
    ],
  });
  return root;
}

function writeJson(root, relativePath, value) {
  const file = fixedPath(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
}

function fixedPath(root, relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function removeFixture(root) {
  if (root && fs.existsSync(root)) fs.rmSync(root, { recursive: true, force: true });
}

function sendMcpRequest(request) {
  const payload = JSON.stringify(request);
  const result = spawnSync(process.execPath, [serverPath], {
    cwd: repositoryRoot,
    encoding: "utf8",
    input: `Content-Length: ${Buffer.byteLength(payload, "utf8")}\r\n\r\n${payload}`,
  });
  assert.equal(result.status, 0, result.stderr);
  const separator = result.stdout.indexOf("\r\n\r\n");
  assert.ok(separator >= 0, result.stdout);
  return JSON.parse(result.stdout.slice(separator + 4));
}
