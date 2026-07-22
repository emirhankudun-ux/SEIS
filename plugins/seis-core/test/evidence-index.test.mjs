import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { auditEvidenceIndex, EVIDENCE_INDEX_ID } from "../seis-evidence-index/runtime/evidence-index.mjs";
import { buildWave1MarketplaceCompatibility } from "../../../scripts/lib/seis-wave-1-marketplace-compatibility.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const entrypoint = path.join(pluginRoot, "seis-evidence-index", "scripts", "seis-evidence-index-mcp-server.mjs");

test("SEIS Evidence Index summarizes checked-in public Wave 1 evidence without leaking the repository path", () => {
  const result = auditEvidenceIndex(repoRoot);

  assert.equal(result.state, "ready");
  assert.equal(result.ok, true);
  assert.equal(result.mode, "public-evidence-index-read-only");
  assert.equal(result.indexId, EVIDENCE_INDEX_ID);
  assert.equal(result.summary.marketplaceName, "seis-repo");
  assert.equal(result.summary.historicalWave1PublicCardCount, 377);
  assert.equal(result.summary.historicalWave1ApplicationPluginCount, 71);
  assert.equal(result.summary.publicCardCount, 34);
  assert.equal(result.summary.bundleCardCount, 33);
  assert.equal(result.summary.applicationPluginCount, 75);
  assert.equal(result.summary.selectedCapabilityBundleId, "seis-application-bundle-04");
  assert.equal(result.summary.selectedCapabilityDirectCardRequired, false);
  assert.equal(result.summary.recordedAttentionContractIds.includes("ui-state-contract"), true);
  assert.equal(result.summary.completedWaveStepCount, 100);
  assert.deepEqual(result.summary.inProgressWaveStepNumbers, []);
  assert.deepEqual(result.permissions.write, []);
  assert.deepEqual(result.permissions.network, []);
  assert.deepEqual(result.permissions.secrets, []);
  assert.equal(JSON.stringify(result).includes(repoRoot), false);
});

test("Wave 1 compatibility preserves historical facts while resolving the current bundle card", () => {
  const compatibility = buildCompatibilityFixture();

  assert.equal(compatibility.historicalWave1Snapshot.publicCardCount, 377);
  assert.equal(compatibility.historicalWave1Snapshot.applicationPluginCount, 71);
  assert.equal(compatibility.historicalWave1Snapshot.selectedCapabilityDirectCardCount, 1);
  assert.equal(compatibility.currentMarketplaceProjection.publicCardCount, 34);
  assert.equal(compatibility.currentMarketplaceProjection.sourceCapabilityInventory.retainedSourcePackageCount, 380);
  assert.deepEqual(compatibility.currentMarketplaceProjection.selectedApplicationCapability, {
    id: "seis-evidence-index",
    retainedSource: true,
    sourcePath: "plugins/seis-core/seis-evidence-index",
    directMarketplaceCardRequired: false,
    directMarketplaceCardCount: 0,
    bundleCardCount: 1,
    bundleId: "seis-application-bundle-04",
    bundleSourcePath: "./plugins/seis-bundles/seis-application-bundle-04",
    bundleFamily: "application",
  });
});

test("Wave 1 compatibility rejects source, membership, and marketplace-card drift", () => {
  const baseline = loadCompatibilityInputs();
  const cases = [
    {
      label: "missing selected source",
      mutate(input) {
        input.sourceManifest.plugins = input.sourceManifest.plugins.filter((plugin) => plugin.name !== EVIDENCE_INDEX_ID);
      },
      pattern: /remain exactly once/,
    },
    {
      label: "duplicate selected source",
      mutate(input) {
        const source = input.sourceManifest.plugins.find((plugin) => plugin.name === EVIDENCE_INDEX_ID);
        input.sourceManifest.plugins.push({ ...source });
      },
      pattern: /remain exactly once/,
    },
    {
      label: "missing bundle membership",
      mutate(input) {
        for (const bundle of input.bundleCatalog.bundles) {
          bundle.memberNames = bundle.memberNames.filter((name) => name !== EVIDENCE_INDEX_ID);
        }
      },
      pattern: /occur exactly once/,
    },
    {
      label: "duplicate membership in one bundle",
      mutate(input) {
        const bundle = input.bundleCatalog.bundles.find((candidate) => candidate.memberNames.includes(EVIDENCE_INDEX_ID));
        bundle.memberNames.push(EVIDENCE_INDEX_ID);
      },
      pattern: /occur exactly once/,
    },
    {
      label: "cross-family membership",
      mutate(input) {
        const applicationBundle = input.bundleCatalog.bundles.find((candidate) => candidate.memberNames.includes(EVIDENCE_INDEX_ID));
        const topicBundle = input.bundleCatalog.bundles.find((candidate) => candidate.family === "topic");
        applicationBundle.memberNames = applicationBundle.memberNames.filter((name) => name !== EVIDENCE_INDEX_ID);
        topicBundle.memberNames.push(EVIDENCE_INDEX_ID);
      },
      pattern: /application bundle/,
    },
    {
      label: "wrong bundle-card path",
      mutate(input) {
        const card = input.marketplace.plugins.find((candidate) => candidate.name === "seis-application-bundle-04");
        card.source.path = "./plugins/seis-bundles/wrong";
      },
      pattern: /card identities and source paths/,
    },
    {
      label: "wrong canonical-card path",
      mutate(input) {
        const card = input.marketplace.plugins.find((candidate) => candidate.name === "seis-ai-agent");
        card.source.path = "./plugins/wrong";
      },
      pattern: /card identities and source paths/,
    },
    {
      label: "wrong nonselected bundle-card path",
      mutate(input) {
        const card = input.marketplace.plugins.find((candidate) => candidate.name === "seis-application-bundle-01");
        card.source.path = "./plugins/seis-bundles/wrong";
      },
      pattern: /card identities and source paths/,
    },
    {
      label: "duplicate nonselected member with unchanged count",
      mutate(input) {
        const bundle = input.bundleCatalog.bundles.find((candidate) => candidate.id === "seis-application-bundle-01");
        bundle.memberNames[1] = bundle.memberNames[0];
      },
      pattern: /occur exactly once across application bundle members/,
    },
    {
      label: "rogue direct card with unchanged total",
      mutate(input) {
        const card = input.marketplace.plugins.find((candidate) => candidate.name === "seis-application-bundle-04");
        card.name = EVIDENCE_INDEX_ID;
        card.source.path = "./plugins/seis-core/seis-evidence-index";
      },
      pattern: /canonical card plus bundle catalog cards/,
    },
  ];

  for (const fixtureCase of cases) {
    const input = structuredClone(baseline);
    fixtureCase.mutate(input);
    assert.throws(
      () => buildWave1MarketplaceCompatibility(input),
      fixtureCase.pattern,
      fixtureCase.label,
    );
  }
});

test("generated SEIS Evidence Index record uses the historical/current schema", () => {
  const evidence = loadJson("content/development/seis-evidence-index.json");

  assert.equal(evidence.schemaVersion, 2);
  assert.equal(evidence.capabilityDecision.historicalWave1Snapshot.publicCardCount, 377);
  assert.equal(evidence.capabilityDecision.currentMarketplaceProjection.publicCardCount, 34);
  assert.equal(evidence.plugin.currentMarketplacePresentation, "retained-source-through-bundle-card");
  assert.equal(evidence.plugin.currentBundleId, "seis-application-bundle-04");
  assert.equal(evidence.plugin.directMarketplaceCardRequired, false);
});

test("SEIS Evidence Index reports malformed bounded evidence without returning raw values or paths", () => {
  const fixture = mkdtempSync(path.join(os.tmpdir(), "seis-evidence-index-"));
  try {
    mkdirSync(path.join(fixture, "content", "development"), { recursive: true });
    writeFileSync(
      path.join(fixture, "content", "development", "seis-public-plugin-wave-1-evidence-index.json"),
      JSON.stringify({ id: "wrong", secret: "sk-abcdefghijklmnopqrstuvwxyz" })
    );
    writeFileSync(
      path.join(fixture, "content", "development", "seis-public-plugin-wave-1-program.json"),
      JSON.stringify({ id: "wrong", status: "completed", steps: [] })
    );

    const result = auditEvidenceIndex(fixture);

    assert.equal(result.state, "attention");
    assert.equal(result.ok, false);
    assert.equal(result.findings.some((finding) => finding.code === "unsafe-input-content"), true);
    assert.equal(JSON.stringify(result).includes(fixture), false);
    assert.equal(JSON.stringify(result).includes("sk-abcdefghijklmnopqrstuvwxyz"), false);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("SEIS Evidence Index rejects historical and current projection drift independently", () => {
  const cases = [
    {
      label: "historical snapshot",
      checkId: "wave-evidence-historical-snapshot",
      suppressedSummaryKey: "historicalWave1PublicCardCount",
      mutate(evidence) {
        evidence.historicalWave1Snapshot.publicCardCount = 378;
      },
    },
    {
      label: "historical selected capability",
      checkId: "wave-evidence-historical-snapshot",
      suppressedSummaryKey: "historicalWave1PublicCardCount",
      mutate(evidence) {
        evidence.historicalWave1Snapshot.selectedCapability = "wrong-capability";
      },
    },
    {
      label: "historical topic count",
      checkId: "wave-evidence-historical-snapshot",
      suppressedSummaryKey: "historicalWave1PublicCardCount",
      mutate(evidence) {
        evidence.historicalWave1Snapshot.topicPluginCount = 299;
      },
    },
    {
      label: "historical root count",
      checkId: "wave-evidence-historical-snapshot",
      suppressedSummaryKey: "historicalWave1PublicCardCount",
      mutate(evidence) {
        evidence.historicalWave1Snapshot.migratedRootPluginCount = 4;
      },
    },
    {
      label: "current source inventory",
      checkId: "wave-evidence-app-count",
      suppressedSummaryKey: "applicationPluginCount",
      mutate(evidence) {
        evidence.currentMarketplaceProjection.sourceCapabilityInventory.applicationSourcePackageCount = 71;
      },
    },
    {
      label: "current retained-source count",
      checkId: "wave-evidence-app-count",
      suppressedSummaryKey: "applicationPluginCount",
      mutate(evidence) {
        evidence.currentMarketplaceProjection.sourceCapabilityInventory.retainedSourcePackageCount = 379;
      },
    },
    {
      label: "current bundle resolution",
      checkId: "wave-evidence-selected-capability-bundle",
      suppressedSummaryKey: "selectedCapabilityBundleId",
      mutate(evidence) {
        evidence.currentMarketplaceProjection.selectedApplicationCapability.bundleCardCount = 0;
      },
    },
    {
      label: "current bundle id",
      checkId: "wave-evidence-selected-capability-bundle",
      suppressedSummaryKey: "selectedCapabilityBundleId",
      mutate(evidence) {
        evidence.currentMarketplaceProjection.selectedApplicationCapability.bundleId = "seis-application-bundle-05";
      },
    },
    {
      label: "current bundle path",
      checkId: "wave-evidence-selected-capability-bundle",
      suppressedSummaryKey: "selectedCapabilityBundleId",
      mutate(evidence) {
        evidence.currentMarketplaceProjection.selectedApplicationCapability.bundleSourcePath = "./plugins/seis-bundles/wrong";
      },
    },
    {
      label: "current bundle family",
      checkId: "wave-evidence-selected-capability-bundle",
      suppressedSummaryKey: "selectedCapabilityBundleId",
      mutate(evidence) {
        evidence.currentMarketplaceProjection.selectedApplicationCapability.bundleFamily = "topic";
      },
    },
    {
      label: "current selected source path",
      checkId: "wave-evidence-selected-capability-bundle",
      suppressedSummaryKey: "selectedCapabilityBundleId",
      mutate(evidence) {
        evidence.currentMarketplaceProjection.selectedApplicationCapability.sourcePath = "plugins/seis-core/wrong";
      },
    },
  ];

  for (const fixtureCase of cases) {
    const fixture = mkdtempSync(path.join(os.tmpdir(), "seis-evidence-index-projection-"));
    try {
      const evidence = loadJson("content/development/seis-public-plugin-wave-1-evidence-index.json");
      const program = loadJson("content/development/seis-public-plugin-wave-1-program.json");
      fixtureCase.mutate(evidence);
      mkdirSync(path.join(fixture, "content", "development"), { recursive: true });
      writeFileSync(
        path.join(fixture, "content", "development", "seis-public-plugin-wave-1-evidence-index.json"),
        JSON.stringify(evidence),
      );
      writeFileSync(
        path.join(fixture, "content", "development", "seis-public-plugin-wave-1-program.json"),
        JSON.stringify(program),
      );

      const result = auditEvidenceIndex(fixture);

      assert.equal(result.ok, false, fixtureCase.label);
      assert.equal(result.checks.find((check) => check.id === fixtureCase.checkId)?.observed, false, fixtureCase.label);
      assert.equal(result.summary[fixtureCase.suppressedSummaryKey], null, fixtureCase.label);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  }
});

test("SEIS Evidence Index exposes bounded MCP tools and committed evidence", () => {
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_evidence_index", arguments: { path: "." } } },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_evidence_index_evidence", arguments: {} } },
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
  assert.deepEqual(toolNames.sort(), ["seis_evidence_index", "seis_evidence_index_evidence", "seis_evidence_index_status"]);
  const audit = responses.find((response) => response.id === 3)?.result;
  assert.equal(audit?.state, "ready");
  assert.equal(audit?.ok, true);
  assert.deepEqual(audit?.permissions?.write, []);
  const evidence = responses.find((response) => response.id === 4)?.result;
  assert.equal(evidence?.state, "ready");
  assert.equal(evidence?.evidence?.id, EVIDENCE_INDEX_ID);
  assert.equal(JSON.stringify(responses).includes(repoRoot), false);
});

function frame(message) {
  const body = JSON.stringify(message);
  return "Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body;
}

function parseFrames(output) {
  const bytes = Buffer.from(output, "utf8");
  const messages = [];
  let offset = 0;
  while (offset < bytes.length) {
    const headerEnd = bytes.indexOf(Buffer.from("\r\n\r\n"), offset);
    assert.notEqual(headerEnd, -1, "MCP response header is incomplete");
    const header = bytes.slice(offset, headerEnd).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    assert.ok(match, "MCP response must include Content-Length");
    const length = Number.parseInt(match[1], 10);
    const start = headerEnd + 4;
    const end = start + length;
    assert.ok(end <= bytes.length, "MCP response body is incomplete");
    messages.push(JSON.parse(bytes.slice(start, end).toString("utf8")));
    offset = end;
  }
  return messages;
}

function buildCompatibilityFixture() {
  return buildWave1MarketplaceCompatibility(loadCompatibilityInputs());
}

function loadCompatibilityInputs() {
  return {
    marketplace: loadJson(".agents/plugins/marketplace.json"),
    publicFamily: loadJson("content/development/seis-public-plugin-family.json"),
    sourceManifest: loadJson("apps/seis-core/data/seis-core-plugin-sources.json"),
    bundleCatalog: loadJson("content/development/seis-public-plugin-bundle-catalog.json"),
  };
}

function loadJson(relativePath) {
  return JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8"));
}
