import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const entrypoint = path.join(pluginRoot, "seis-public-install-evidence", "scripts", "seis-public-install-evidence-mcp-server.mjs");
const generatedEvidence = JSON.parse(readFileSync(path.join(repoRoot, "content", "development", "seis-public-install-evidence.json"), "utf8"));

test("SEIS Public Install Evidence validates the public contract without release authority", () => {
  const result = runCli(["--validate"]);

  assert.equal(result.state, "ready");
  assert.equal(result.ok, true);
  assert.equal(result.mode, "public-seis-repo-independent-install-evidence-read-only");
  assert.equal(result.marketplaceName, "seis-repo");
  assert.equal(result.marketplaceDisplayName, "SEIS Repo");
  assert.equal(result.publicCards.count, generatedEvidence.publicCards.count);
  assert.equal(result.publicCards.applicationPluginCount, generatedEvidence.publicCards.applicationPluginCount);
  assert.equal(result.expectedInstallIds.length, generatedEvidence.independentEvidence.expectedPluginIds.length);
  assert.equal(result.expectedEmbeddedModuleCount, generatedEvidence.independentEvidence.expectedEmbeddedModuleCount);
  assert.deepEqual(result.permissions.write, []);
  assert.deepEqual(result.permissions.network, []);
  assert.deepEqual(result.permissions.secrets, []);
  assert.deepEqual(result.findings, []);
});

test("SEIS Public Install Evidence exposes only bounded, release-safe evidence state", () => {
  const result = runCli(["--evidence"]);

  assert.ok(["not-recorded", "invalid", "recorded-valid-awaiting-human-approval"].includes(result.state));
  assert.equal(result.publicReleaseAllowed, false);
  assert.equal(result.marketplaceName, "seis-repo");
  assert.equal(result.marketplaceDisplayName, "SEIS Repo");
  assert.deepEqual(result.permissions.write, []);
  assert.deepEqual(result.permissions.network, []);
  assert.deepEqual(result.permissions.secrets, []);
  assert.equal(JSON.stringify(result).includes("/Users/"), false);
  assert.equal(JSON.stringify(result).includes("/home/"), false);
});

test("SEIS Public Install Evidence distinguishes valid and secret-contaminated fixture records", () => {
  const fixture = createFixtureRoot();
  try {
    writeJson(fixture.root, fixture.evidencePath, validEvidence());
    const valid = runCli(["--evidence"], { SEIS_REPO_ROOT: fixture.root });
    assert.equal(valid.state, "recorded-valid-awaiting-human-approval");
    assert.equal(valid.ok, true);
    assert.equal(valid.evidenceRecorded, true);
    assert.equal(valid.evidenceValid, true);
    assert.equal(valid.publicReleaseAllowed, false);
    assert.equal(valid.nextAction.includes("human approval"), true);
    assert.deepEqual(valid.permissions.write, []);
    assert.deepEqual(valid.permissions.network, []);
    assert.deepEqual(valid.permissions.secrets, []);
    assert.equal(JSON.stringify(valid).includes(fixture.root), false);

    const contaminated = validEvidence();
    contaminated.source.immutableRevision = "ghp_abcdefghijklmnopqrstuvwx";
    writeJson(fixture.root, fixture.evidencePath, contaminated);
    const invalid = runCli(["--evidence"], { SEIS_REPO_ROOT: fixture.root });
    assert.equal(invalid.state, "invalid");
    assert.equal(invalid.ok, false);
    assert.equal(invalid.evidenceRecorded, true);
    assert.equal(invalid.evidenceValid, false);
    assert.equal(invalid.publicReleaseAllowed, false);
    assert.equal(JSON.stringify(invalid).includes("ghp_abcdefghijklmnopqrstuvwx"), false);
    assert.equal(JSON.stringify(invalid).includes(fixture.root), false);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("SEIS Public Install Evidence exposes bounded MCP tools without writes", () => {
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_public_install_evidence_status", arguments: {} } },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_public_install_evidence_validate", arguments: {} } },
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
  assert.deepEqual(toolNames.sort(), ["seis_public_install_evidence_status", "seis_public_install_evidence_validate"]);

  const status = responses.find((response) => response.id === 3)?.result;
  assert.ok(["not-recorded", "invalid", "recorded-valid-awaiting-human-approval"].includes(status?.state));
  assert.equal(status?.publicReleaseAllowed, false);
  assert.deepEqual(status?.permissions?.write, []);
  assert.deepEqual(status?.permissions?.network, []);
  assert.deepEqual(status?.permissions?.secrets, []);

  const validation = responses.find((response) => response.id === 4)?.result;
  assert.equal(validation?.ok, true);
  assert.deepEqual(validation?.permissions?.write, []);
  assert.deepEqual(validation?.permissions?.network, []);
  assert.deepEqual(validation?.permissions?.secrets, []);
});

function createFixtureRoot() {
  const root = mkdtempSync(path.join(os.tmpdir(), "seis-public-install-evidence-"));
  const evidencePath = "content/development/seis-public-plugin-independent-runner-evidence.json";
  const evidenceContractPath = "content/development/seis-public-plugin-independent-runner-evidence-contract.json";
  const installEvidencePath = "content/development/seis-public-install-evidence.json";
  const expectedPluginIds = ["seis-ai-agent@seis-repo"];
  const expectedEmbeddedModuleIds = ["seis-ai-agent"];

  writeJson(root, ".agents/plugins/marketplace.json", {
    name: "seis-repo",
    interface: { displayName: "SEIS Repo" },
    plugins: [
      publicCard("seis-ai-agent", "./plugins/seis-core/seis-ai-agent"),
      publicCard("seis-public-install-evidence", "./plugins/seis-core/seis-public-install-evidence"),
    ],
  });
  writeJson(root, "content/development/seis-public-plugin-family.json", {
    publicPlugins: [{ installId: "seis-ai-agent@seis-repo" }],
    migratedRootPlugins: [],
    applicationPlugins: [{ name: "seis-public-install-evidence" }],
    topicPlugins: [],
    embeddedModules: [{ name: "seis-ai-agent" }],
    marketplace: { publicPluginCount: 2, applicationPluginCount: 1 },
  });
  writeJson(root, evidenceContractPath, {
    id: "seis-public-plugin-independent-runner-evidence-contract",
    evidencePath,
    publicReleaseAllowed: false,
    expectedPluginIds,
    expectedEmbeddedModuleIds,
  });
  writeJson(root, installEvidencePath, {
    id: "seis-public-install-evidence",
    goalId: "SEIS-GOAL-021",
    plugin: {
      name: "seis-public-install-evidence",
      marketplaceName: "seis-repo",
      sourcePath: "plugins/seis-core/seis-public-install-evidence",
    },
    publicCards: { count: 2, applicationPluginCount: 1 },
    independentEvidence: {
      contractPath: evidenceContractPath,
      evidencePath,
      strictRecordedEvidenceGate: "npm run check:seis-public-plugin-independent-runner-evidence:recorded",
      expectedPluginIds,
      expectedEmbeddedModuleCount: 1,
    },
    releaseBoundary: {
      evidenceRecordIsPublicReleaseProof: false,
      publicReleaseAllowed: false,
      humanApprovalRequired: true,
    },
    safety: { write: [], network: [], secrets: [] },
  });

  return { root, evidencePath };
}

function validEvidence() {
  return {
    id: "seis-public-plugin-independent-runner-evidence",
    version: 1,
    status: "recorded-independent-clean-runner-evidence",
    recordedAt: "2026-07-20T00:00:00Z",
    publicReleaseAllowed: false,
    source: {
      marketplaceName: "seis-repo",
      artifactKind: "public-marketplace-or-package",
      immutableRevision: "abcdef1",
    },
    runner: {
      classification: "independent-clean-runner",
      sourceWorktreeAccessible: false,
      existingCodexCacheAccessible: false,
      os: "macOS",
      architecture: "arm64",
      nodeMajor: 24,
      codexVersion: "1.0.0",
    },
    installation: {
      expectedPluginIds: ["seis-ai-agent@seis-repo"],
      installedPluginIds: ["seis-ai-agent@seis-repo"],
      installedCount: 1,
      expectedEmbeddedModuleIds: ["seis-ai-agent"],
      observedEmbeddedModuleIds: ["seis-ai-agent"],
      embeddedModuleCount: 1,
      publicSourceInstalled: true,
    },
    mcpSmoke: {
      pluginCount: 1,
      initializedCount: 1,
      toolsListCount: 1,
      representativeCallCount: 1,
      allPassed: true,
    },
    freshTask: {
      observedAfterInstall: true,
      taskReference: "task-001",
      seisAiPublicPluginFamily: {
        publicPluginCount: 1,
        connectedPluginCount: 1,
        embeddedModuleCount: 1,
        connectedModuleCount: 1,
        runtimeConnected: true,
      },
    },
    redaction: {
      rawCommandOutputIncluded: false,
      secretsIncluded: false,
      privatePathsIncluded: false,
    },
    attestation: {
      evidenceSource: "external-runner",
      operatorRole: "maintainer",
    },
  };
}

function publicCard(name, sourcePath) {
  return {
    name,
    source: { source: "local", path: sourcePath },
    policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
  };
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
