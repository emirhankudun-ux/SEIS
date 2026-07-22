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
const profilePath = path.join(repositoryRoot, "plugins/seis-core/seis-plugin-capability-coverage/assets/plugin-profile.json");
const manifestPath = path.join(repositoryRoot, "plugins/seis-core/seis-plugin-capability-coverage/.codex-plugin/plugin.json");

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
  assert.equal(report.summary.sourcePluginCount, report.summary.bundleApplicationMemberCount);
  assert.equal(report.summary.declaredCategoryCount, report.summary.reportedCategoryCount);
  assert.equal(report.summary.declaredCapabilityTokenKindCount, report.summary.reportedCapabilityTokenKindCount);
  assert.equal(report.summary.coverageOutputTruncated, false);
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
  assert.equal(report.attention.disposition, "not-required");
  assert.equal(report.outputBoundary.rawRegistryContentReturned, false);
  assert.equal(report.outputBoundary.absolutePathsReturned, false);
  assert.equal(report.outputBoundary.aggregateOutputBounded, true);
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
    assert.equal(report.reconciliation.marketplacePublicCardCount, 2);
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

test("reports malformed fixed registry structures without echoing raw values", () => {
  const cases = [
    { relativePath: "apps/seis-core/data/seis-core-plugin-sources.json", field: "plugins", code: "invalid-source-manifest-plugins", marker: "malformed-source-private-marker" },
    { relativePath: "apps/seis-core/data/seis-core-plugin-catalog.json", field: "plugins", code: "invalid-catalog-plugins", marker: "malformed-catalog-private-marker" },
    { relativePath: "content/development/seis-core-plugin-matrix.json", field: "plugins", code: "invalid-matrix-plugins", marker: "malformed-matrix-private-marker" },
    { relativePath: ".agents/plugins/marketplace.json", field: "plugins", code: "invalid-marketplace-plugins", marker: "malformed-marketplace-private-marker" },
    { relativePath: "content/development/seis-public-plugin-bundle-catalog.json", field: "bundles", code: "invalid-bundle-catalog-bundles", marker: "malformed-bundle-private-marker" },
  ];

  for (const { relativePath, field, code, marker } of cases) {
    const fixtureRoot = createFixture();
    try {
      const file = fixedPath(fixtureRoot, relativePath);
      const registry = JSON.parse(fs.readFileSync(file, "utf8"));
      registry[field] = marker;
      fs.writeFileSync(file, JSON.stringify(registry));

      const report = auditPluginCapabilityCoverage(fixtureRoot);
      assert.equal(report.state, "attention");
      assert.equal(report.ok, false);
      assert.ok(report.findings.some((finding) => finding.code === code));
      assert.equal(JSON.stringify(report).includes(marker), false);
    } finally {
      removeFixture(fixtureRoot);
    }
  }
});

test("flags duplicate names in every fixed projection without returning those names", () => {
  const cases = [
    "apps/seis-core/data/seis-core-plugin-sources.json",
    "apps/seis-core/data/seis-core-plugin-catalog.json",
    "content/development/seis-core-plugin-matrix.json",
    ".agents/plugins/marketplace.json",
  ];

  for (const relativePath of cases) {
    const fixtureRoot = createFixture();
    try {
      const file = fixedPath(fixtureRoot, relativePath);
      const registry = JSON.parse(fs.readFileSync(file, "utf8"));
      registry.plugins.push(JSON.parse(JSON.stringify(registry.plugins[0])));
      fs.writeFileSync(file, JSON.stringify(registry));

      const report = auditPluginCapabilityCoverage(fixtureRoot);
      assert.equal(report.state, "attention");
      assert.equal(report.ok, false);
      assert.ok(report.findings.some((finding) => finding.code === "duplicate-plugin-name"));
      assert.equal(JSON.stringify(report).includes("fixture-alpha"), false);
    } finally {
      removeFixture(fixtureRoot);
    }
  }
});

test("enforces category and capability-token limits while bounding large valid output", () => {
  const categoryLimitRoot = createFixtureWithCatalog(Array.from(
    { length: PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxCategoryKinds + 1 },
    (_, index) => ({
      name: `fixture-category-${index}`,
      category: `Category ${index}`,
      capabilities: ["Read-only"],
    }),
  ));
  try {
    const report = auditPluginCapabilityCoverage(categoryLimitRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "category-kind-limit-exceeded"));
    assert.equal(report.coverage.coverageAvailable, false);
    assert.equal(JSON.stringify(report).includes("fixture-category-0"), false);
  } finally {
    removeFixture(categoryLimitRoot);
  }

  const capabilityLimitRoot = createFixtureWithCatalog(Array.from(
    { length: Math.ceil((PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxCapabilityTokens + 1) / PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxCapabilitiesPerPlugin) },
    (_, pluginIndex) => ({
      name: `fixture-capability-${pluginIndex}`,
      category: "Developer",
      capabilities: Array.from(
        { length: PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxCapabilitiesPerPlugin },
        (_, capabilityIndex) => `Capability ${pluginIndex}-${capabilityIndex}`,
      ),
    }),
  ));
  try {
    const report = auditPluginCapabilityCoverage(capabilityLimitRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "capability-token-kind-limit-exceeded"));
    assert.equal(report.coverage.coverageAvailable, false);
    assert.equal(JSON.stringify(report).includes("capability-0-0"), false);
  } finally {
    removeFixture(capabilityLimitRoot);
  }

  const boundedOutputRoot = createFixtureWithCatalog(Array.from(
    { length: 5 },
    (_, pluginIndex) => ({
      name: `fixture-output-${pluginIndex}`,
      category: "Developer",
      capabilities: Array.from(
        { length: PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxCapabilitiesPerPlugin },
        (_, capabilityIndex) => `Output Token ${pluginIndex}-${capabilityIndex}`,
      ),
    }),
  ));
  try {
    const report = auditPluginCapabilityCoverage(boundedOutputRoot);
    assert.equal(report.state, "ready");
    assert.equal(report.ok, true);
    assert.equal(report.summary.declaredCapabilityTokenKindCount, 5 * PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxCapabilitiesPerPlugin);
    assert.equal(report.summary.reportedCapabilityTokenKindCount, PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxReturnedCapabilityTokenKinds);
    assert.equal(report.summary.coverageOutputTruncated, true);
    assert.equal(report.coverage.capabilityTokenFrequenciesTruncated, true);
    assert.equal(report.coverage.capabilityTokenFrequencies.length, PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxReturnedCapabilityTokenKinds);
    assert.equal(JSON.stringify(report).includes("output-token-4-63"), false);
  } finally {
    removeFixture(boundedOutputRoot);
  }
});

test("aligns the public profile and manifest with fixed read-only SEIS Repo boundaries", () => {
  const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  assert.deepEqual(profile.permissions.write, []);
  assert.deepEqual(profile.permissions.network, []);
  assert.deepEqual(profile.permissions.secrets, []);
  assert.equal(profile.publicAudience, "everyone");
  assert.equal(profile.publicMarketplace, true);
  assert.equal(profile.audit.fixedRegistryPaths.length, 5);
  assert.ok(profile.audit.fixedRegistryPaths.includes("content/development/seis-public-plugin-bundle-catalog.json"));
  assert.equal(JSON.stringify(manifest.interface).toLowerCase().includes("personal"), false);
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

test("package entrypoint accepts only the fixed local root and bounds unavailable evidence", () => {
  const validResult = spawnSync(process.execPath, [serverPath, "--report", "--path", "."], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(validResult.status, 0, validResult.stderr);
  assert.equal(JSON.parse(validResult.stdout).state, "ready");

  const invalidResult = spawnSync(process.execPath, [serverPath, "--report", "--path", "./nested"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(invalidResult.status, 0, invalidResult.stderr);
  const invalidReport = JSON.parse(invalidResult.stdout);
  assert.equal(invalidReport.state, "attention");
  assert.equal(invalidReport.findings[0].code, "invalid-report-path");
  assert.equal(JSON.stringify(invalidReport).includes(repositoryRoot), false);

  const fixtureRoot = createFixture();
  try {
    const evidenceResult = spawnSync(process.execPath, [serverPath, "--evidence"], {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env, SEIS_WORKSPACE_ROOT: fixtureRoot },
    });
    assert.equal(evidenceResult.status, 0, evidenceResult.stderr);
    const evidence = JSON.parse(evidenceResult.stdout);
    assert.equal(evidence.state, "ready");
    assert.equal(evidence.evidence, null);
    assert.equal(JSON.stringify(evidence).includes(fixtureRoot), false);
  } finally {
    removeFixture(fixtureRoot);
  }
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
  return createFixtureWithCatalog([
    { name: "fixture-alpha", category: "Developer", capabilities: ["Read-only", "Registry Coverage"] },
    { name: "fixture-beta", category: "Developer", capabilities: ["Registry Coverage"] },
  ]);
}

function createFixtureWithCatalog(catalogPlugins) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "seis-plugin-capability-coverage-"));
  const applicationBundles = [];
  for (let index = 0; index < catalogPlugins.length; index += 15) {
    applicationBundles.push({
      id: `fixture-application-bundle-${String(applicationBundles.length + 1).padStart(2, "0")}`,
      family: "application",
      memberNames: catalogPlugins.slice(index, index + 15).map((plugin) => plugin.name),
    });
  }
  writeJson(root, "apps/seis-core/data/seis-core-plugin-sources.json", {
    id: "seis-core-plugin-sources",
    plugins: catalogPlugins.map((plugin) => ({ name: plugin.name })),
  });
  writeJson(root, "apps/seis-core/data/seis-core-plugin-catalog.json", {
    id: "seis-core-application-plugin-catalog",
    plugins: catalogPlugins,
  });
  writeJson(root, "content/development/seis-core-plugin-matrix.json", {
    id: "seis-core-plugin-matrix",
    plugins: catalogPlugins.map((plugin) => ({ name: plugin.name })),
  });
  writeJson(root, ".agents/plugins/marketplace.json", {
    name: "seis-repo",
    interface: { displayName: "SEIS Repo" },
    plugins: [
      { name: "seis-ai-agent", source: { path: "./plugins/seis-ai-agent" } },
      ...applicationBundles.map((bundle) => ({ name: bundle.id, source: { path: `./plugins/seis-bundles/${bundle.id}` } })),
    ],
  });
  writeJson(root, "content/development/seis-public-plugin-bundle-catalog.json", {
    id: "seis-public-plugin-bundle-catalog",
    bundles: applicationBundles,
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
