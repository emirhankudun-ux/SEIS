import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildSeisPublicBundlePlan,
  SEIS_PUBLIC_BUNDLE_SIZE,
} from "../../../scripts/lib/seis-public-bundle-plan.mjs";
import { validateExpectedBundleTree } from "../../../scripts/lib/seis-public-bundle-output-tree.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const familyPath = path.join(repositoryRoot, "content/development/seis-public-plugin-family.json");
const catalogPath = path.join(repositoryRoot, "content/development/seis-public-plugin-bundle-catalog.json");
const selectionGuidePath = path.join(repositoryRoot, "content/development/seis-public-plugin-selection-guide.json");
const agentSelectionGuidePath = path.join(repositoryRoot, "plugins/seis-ai-agent/assets/public-bundle-selection-guide.json");
const marketplacePath = path.join(repositoryRoot, ".agents/plugins/marketplace.json");
const unifiedSuitePath = path.join(repositoryRoot, "plugins/seis-ai-agent/assets/unified-suite.json");
const agentRoot = path.join(repositoryRoot, "plugins/seis-ai-agent");
const agentRuntimePath = path.join(agentRoot, "scripts/seis-ai-agent-mcp-server.mjs");
const bundleRoot = path.join(repositoryRoot, "plugins/seis-bundles/seis-application-bundle-01");
const runtimePath = path.join(bundleRoot, "scripts/seis-bundle-mcp-server.mjs");

test("curates 375 source packages into 33 exact-once bounded bundles", () => {
  const family = readJson(familyPath);
  const catalog = readJson(catalogPath);
  const marketplace = readJson(marketplacePath);
  const plan = buildSeisPublicBundlePlan({
    applicationPlugins: family.applicationPlugins,
    topicPlugins: family.topicPlugins,
  });

  assert.equal(plan.targetMarketplaceCardCount, 34);
  assert.equal(plan.publicBundleCardCount, 33);
  assert.equal(plan.applicationBundleCount, 6);
  assert.equal(plan.topicBundleCount, 27);
  assert.deepEqual(plan.applicationBundles.map((bundle) => bundle.memberCount), [14, 9, 11, 14, 14, 13]);
  assert.ok(plan.bundles.every((bundle) => bundle.memberCount > 0 && bundle.memberCount <= SEIS_PUBLIC_BUNDLE_SIZE));
  assert.ok(plan.topicBundles.every((bundle) => bundle.categoryLabels.length === 1));

  const memberNames = plan.bundles.flatMap((bundle) => bundle.members.map((member) => member.name));
  const sourceNames = [...family.applicationPlugins, ...family.topicPlugins].map((plugin) => plugin.name);
  assert.equal(memberNames.length, 375);
  assert.equal(new Set(memberNames).size, 375);
  assert.deepEqual([...memberNames].sort(), [...sourceNames].sort());

  for (const category of ["ELENI-NEFERI", "PANTECHNOEPISTEMONOESIS", "SEIS"]) {
    assert.ok(plan.topicBundles.some((bundle) => bundle.categoryLabels.length === 1 && bundle.categoryLabels[0] === category));
  }
  assert.equal(catalog.marketplace.publicCardCount, 34);
  assert.equal(catalog.marketplace.bundleCardCount, 33);
  assert.equal(catalog.bundles.length, 33);
  assert.equal(marketplace.plugins.length, 34);
  assert.deepEqual(marketplace.plugins.map((plugin) => plugin.name), ["seis-ai-agent", ...plan.bundles.map((bundle) => bundle.id)]);
});

test("rejects a source capability duplicated across application and topic families", () => {
  const family = readJson(familyPath);
  const applicationPlugins = family.applicationPlugins.map((plugin) => ({ ...plugin }));
  const topicPlugins = family.topicPlugins.map((plugin) => ({ ...plugin }));
  topicPlugins[0] = {
    ...topicPlugins[0],
    name: applicationPlugins[0].name,
    sourcePath: applicationPlugins[0].sourcePath,
  };
  assert.throws(
    () => buildSeisPublicBundlePlan({ applicationPlugins, topicPlugins }),
    /combined application and topic source coverage is not exact-once/i,
  );
});

test("retained sources resolve through real cards and reject self-named install ids", () => {
  const family = readJson(familyPath);
  const unifiedSuite = readJson(unifiedSuitePath);
  const plan = buildSeisPublicBundlePlan({
    applicationPlugins: family.applicationPlugins,
    topicPlugins: family.topicPlugins,
  });
  const bundleIdByMember = new Map(
    plan.bundles.flatMap((bundle) => bundle.members.map((member) => [member.name, bundle.id])),
  );

  assert.equal(family.migratedRootPlugins.length, 5);
  assert.equal(family.applicationPlugins.length, 75);
  assert.equal(family.topicPlugins.length, 300);
  for (const source of family.migratedRootPlugins) {
    assert.equal(source.installId, "seis-ai-agent@seis-repo", `${source.name}: canonical root resolution`);
    assert.notEqual(source.installId, `${source.name}@seis-repo`, `${source.name}: no self-named install`);
    assert.equal(source.marketplaceDiscoverable, true);
    assert.equal(source.marketplaceCard, false);
    assert.equal(source.marketplaceBundleId, null);
  }

  for (const source of [...family.applicationPlugins, ...family.topicPlugins]) {
    const expectedBundleId = bundleIdByMember.get(source.name);
    assert.ok(expectedBundleId, `${source.name}: exact bundle membership`);
    assert.equal(source.marketplaceBundleId, expectedBundleId, `${source.name}: exact bundle id`);
    assert.equal(source.installId, `${expectedBundleId}@seis-repo`, `${source.name}: exact bundle install`);
    assert.notEqual(source.installId, `${source.name}@seis-repo`, `${source.name}: no self-named install`);
    assert.equal(source.marketplaceDiscoverable, true);
    assert.equal(source.marketplaceCard, false);
  }

  for (const source of unifiedSuite.applicationDistribution.plugins) {
    const expectedBundleId = bundleIdByMember.get(source.moduleId);
    assert.equal(source.marketplaceBundleId, expectedBundleId, `${source.moduleId}: suite bundle id`);
    assert.equal(source.canonicalInstallId, `${expectedBundleId}@seis-repo`, `${source.moduleId}: suite bundle install`);
    assert.notEqual(source.canonicalInstallId, `${source.moduleId}@seis-repo`, `${source.moduleId}: suite no self-named install`);
    assert.equal(source.marketplaceDiscoverable, true);
    assert.equal(source.marketplaceCard, false);
  }
});

test("closed-world bundle tree validation rejects undeclared files", (context) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-bundle-tree-"));
  context.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  const expectedPath = "plugins/seis-bundles/example/README.md";
  fs.mkdirSync(path.join(temporaryRoot, "plugins/seis-bundles/example"), { recursive: true });
  fs.writeFileSync(path.join(temporaryRoot, expectedPath), "expected\n", "utf8");
  assert.equal(validateExpectedBundleTree({
    repositoryRoot: temporaryRoot,
    bundleRootRelative: "plugins/seis-bundles",
    expectedFilePaths: [expectedPath],
  }).fileCount, 1);
  fs.writeFileSync(path.join(temporaryRoot, "plugins/seis-bundles/example/undeclared.md"), "undeclared\n", "utf8");
  assert.throws(() => validateExpectedBundleTree({
    repositoryRoot: temporaryRoot,
    bundleRootRelative: "plugins/seis-bundles",
    expectedFilePaths: [expectedPath],
  }), /extra files: plugins\/seis-bundles\/example\/undeclared\.md/i);
});

test("keeps family and bundle generators fresh", () => {
  for (const script of ["scripts/create-seis-public-plugin-family.mjs", "scripts/create-seis-public-plugin-bundles.mjs"]) {
    const result = spawnSync(process.execPath, [path.join(repositoryRoot, script), "--check"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `${script}: ${result.stderr}`);
  }
});

test("generates a bounded public selection guide without adding marketplace cards", () => {
  const catalog = readJson(catalogPath);
  const guide = readJson(selectionGuidePath);
  const agentGuide = readJson(agentSelectionGuidePath);
  const bundleIds = catalog.bundles.map((bundle) => bundle.id);
  const guideBundleIds = guide.journeys.flatMap((journey) => journey.bundleIds);

  assert.equal(guide.id, "seis-public-plugin-selection-guide");
  assert.equal(guide.canonicalInstall, "seis-ai-agent@seis-repo");
  assert.equal(guide.marketplace.publicCardCount, 34);
  assert.equal(guide.marketplace.canonicalCardCount, 1);
  assert.equal(guide.marketplace.optionalBundleCardCount, 33);
  assert.equal(guide.marketplace.maximumBundleSize, SEIS_PUBLIC_BUNDLE_SIZE);
  assert.equal(guide.selectionBoundary.maximumOptionalBundleSelectionsPerTask, 1);
  assert.equal(guide.selectionBoundary.bulkInstallAllowed, false);
  assert.equal(guide.selectionBoundary.bundleMembersAutoInstalled, false);
  assert.equal(guide.selectionBoundary.sourcePackagesRetained, true);
  assert.equal(guide.finder.id, "seis-public-bundle-finder");
  assert.equal(guide.finder.mode, "local-deterministic-token-match");
  assert.equal(guide.finder.maximumResults, 3);
  assert.equal(guide.finder.maximumQueryLength, 96);
  assert.equal(guide.finder.maximumSearchTermsPerJourney, 96);
  assert.equal(guide.finder.externalAccess, false);
  assert.equal(guide.finder.installation, false);
  assert.equal(guide.finder.sourceTermsReturned, false);
  assert.equal(guide.starterPaths.length, 6);
  assert.equal(guide.journeys.length, 19);
  assert.equal(new Set(guide.journeys.map((journey) => journey.id)).size, 19);
  assert.equal(guideBundleIds.length, 33);
  assert.equal(new Set(guideBundleIds).size, 33);
  assert.deepEqual([...guideBundleIds].sort(), [...bundleIds].sort());
  assert.equal(guide.journeys.reduce((total, journey) => total + journey.sourceCapabilityCount, 0), 375);
  assert.deepEqual(agentGuide, guide);

  for (const journey of guide.journeys) {
    assert.equal(journey.initialBundle.id, journey.bundleIds[0], `${journey.id}: first bundle`);
    assert.equal(journey.initialBundle.installId, `${journey.initialBundle.id}@seis-repo`, `${journey.id}: install identity`);
    assert.equal(journey.initialBundle.journeyPart, 1, `${journey.id}: initial part`);
    assert.ok(journey.initialBundle.memberCount > 0 && journey.initialBundle.memberCount <= SEIS_PUBLIC_BUNDLE_SIZE, `${journey.id}: bundle size`);
    assert.equal(journey.continuationBundleIds.length, journey.bundleIds.length - 1, `${journey.id}: continuation count`);
    assert.ok(Array.isArray(journey.searchTerms) && journey.searchTerms.length > 0 && journey.searchTerms.length <= 96, `${journey.id}: finder terms`);
    assert.equal(new Set(journey.searchTerms).size, journey.searchTerms.length, `${journey.id}: finder terms unique`);
    assert.ok(journey.searchTerms.every((term) => /^[a-z0-9]{2,64}$/.test(term)), `${journey.id}: finder terms safe`);
  }
  for (const starter of guide.starterPaths) {
    const journey = guide.journeys.find((candidate) => candidate.id === starter.journeyId);
    assert.ok(journey, `${starter.journeyId}: known starter journey`);
    assert.equal(starter.initialBundle.id, journey.initialBundle.id, `${starter.journeyId}: starter bundle`);
  }
});

test("SEIS-Agent rejects a tampered public bundle selection guide", (context) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-agent-guide-"));
  context.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  fs.cpSync(agentRoot, temporaryRoot, { recursive: true });
  const guidePath = path.join(temporaryRoot, "assets/public-bundle-selection-guide.json");
  const guide = readJson(guidePath);
  guide.starterPaths[0].initialBundle.id = "seis-topic-bundle-01";
  fs.writeFileSync(guidePath, `${JSON.stringify(guide, null, 2)}\n`, "utf8");

  const result = runAgentRuntime(frame({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "seis_public_bundle_guide", arguments: {} },
  }), temporaryRoot);
  assert.equal(result.status, 0, result.stderr);
  const responses = parseFrames(result.stdout);
  assert.equal(responses.length, 1);
  assert.equal(responses[0].error.code, -32603);
  assert.match(responses[0].error.message, /unavailable or unsafe/i);
});

test("SEIS-Agent rejects a tampered public bundle finder index", (context) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-agent-finder-"));
  context.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  fs.cpSync(agentRoot, temporaryRoot, { recursive: true });
  const guidePath = path.join(temporaryRoot, "assets/public-bundle-selection-guide.json");
  const guide = readJson(guidePath);
  guide.journeys[0].searchTerms = [];
  fs.writeFileSync(guidePath, `${JSON.stringify(guide, null, 2)}\n`, "utf8");

  const result = runAgentRuntime(frame({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "seis_public_bundle_find", arguments: { query: "AI data" } },
  }), temporaryRoot);
  assert.equal(result.status, 0, result.stderr);
  const responses = parseFrames(result.stdout);
  assert.equal(responses.length, 1);
  assert.equal(responses[0].error.code, -32603);
  assert.match(responses[0].error.message, /unavailable or unsafe/i);
});

test("SEIS-Agent finds at most three local public bundle candidates", () => {
  const result = runAgentRuntime([
    frame({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "seis_public_bundle_find", arguments: { query: "SBOM supply chain" } },
    }),
    frame({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "seis_public_bundle_find", arguments: { query: "qzxyunmatched" } },
    }),
    frame({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "seis_public_bundle_find", arguments: { query: "seis plugin" } },
    }),
  ].join(""));
  assert.equal(result.status, 0, result.stderr);
  const responses = parseFrames(result.stdout);
  const matches = responses.find((response) => response.id === 1)?.result;
  assert.equal(matches.status, "ready");
  assert.equal(matches.finder.maximumResults, 3);
  assert.equal(matches.finder.externalAccess, false);
  assert.equal(matches.finder.installation, false);
  assert.ok(matches.candidates.length > 0 && matches.candidates.length <= 3);
  assert.ok(matches.candidates.some((candidate) => candidate.journey.id === "security"));
  assert.ok(matches.candidates.every((candidate) => !Object.prototype.hasOwnProperty.call(candidate, "searchTerms")));
  assert.equal(responses.find((response) => response.id === 2)?.result?.status, "no-match");
  assert.equal(responses.find((response) => response.id === 2)?.result?.candidates?.length, 0);
  assert.equal(responses.find((response) => response.id === 3)?.error?.code, -32602);
});

test("generated MCP runtime serves bounded read-only tools", () => {
  const runtimeSource = fs.readFileSync(runtimePath, "utf8");
  for (const required of [
    "MAX_HEADER_BYTES",
    "MAX_FRAME_BYTES",
    "MAX_BUFFER_BYTES",
    "MAX_RESPONSE_BYTES",
    "MAX_REQUEST_CHARACTERS",
    "SAFE_PERMISSIONS",
    "validateProfile",
    "regularFileWithin",
    'process.stdout.once("drain"',
  ]) {
    assert.ok(runtimeSource.includes(required), `missing ${required}`);
  }
  for (const forbidden of ["node:http", "node:https", "node:child_process", "writeFileSync", "appendFileSync", "execSync", "spawnSync"]) {
    assert.equal(runtimeSource.includes(forbidden), false, `unexpected runtime capability: ${forbidden}`);
  }

  const messages = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_application_bundle_01_status", arguments: {} } },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_application_bundle_01_plan", arguments: { request: "x".repeat(4097) } } },
  ];
  const result = runRuntime(messages.map(frame).join(""));
  assert.equal(result.status, 0, result.stderr);
  const responses = parseFrames(result.stdout);
  assert.equal(responses.length, 4);
  assert.equal(responses[0].result.serverInfo.name, "seis-application-bundle-01");
  assert.equal(responses[1].result.tools.length, 3);
  assert.equal(responses[2].result.status, "ready");
  assert.equal(responses[2].result.memberCount, 14);
  assert.equal(responses[3].error.code, -32602);
});

test("generated MCP runtime rejects tampered bundle profiles", (context) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-bundle-profile-"));
  context.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  const mutations = [
    (profile) => { profile.members = []; profile.memberCount = 0; },
    (profile) => { profile.permissions.write = ["repository"]; },
    (profile) => { profile.members[0].sourcePath = "./plugins/unreviewed-source"; },
  ];

  for (const [index, mutate] of mutations.entries()) {
    const tamperedRoot = path.join(temporaryRoot, `case-${index + 1}`);
    fs.cpSync(bundleRoot, tamperedRoot, { recursive: true });
    const profilePath = path.join(tamperedRoot, "assets/bundle-profile.json");
    const profile = readJson(profilePath);
    mutate(profile);
    fs.writeFileSync(profilePath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
    const result = runRuntime(frame({
      jsonrpc: "2.0",
      id: index + 1,
      method: "tools/call",
      params: { name: "seis_application_bundle_01_status", arguments: {} },
    }), tamperedRoot);
    assert.equal(result.status, 0, result.stderr);
    const responses = parseFrames(result.stdout);
    assert.equal(responses.length, 1);
    assert.equal(responses[0].error.code, -32603);
    assert.match(responses[0].error.message, /unavailable or unsafe/i);
  }
});

test("generated MCP runtime rejects oversized framing", () => {
  const result = runRuntime("Content-Length: 65537\r\n\r\n{}");
  assert.equal(result.status, 0, result.stderr);
  const responses = parseFrames(result.stdout);
  assert.equal(responses.length, 1);
  assert.equal(responses[0].error.code, -32700);
  assert.match(responses[0].error.message, /configured limit/i);
});

test("generated MCP runtime rejects a symbolic-link plugin root", (context) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-bundle-runtime-"));
  context.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  const linkPath = path.join(temporaryRoot, "bundle-link");
  try {
    fs.symlinkSync(bundleRoot, linkPath, "dir");
  } catch (error) {
    context.skip(`symbolic links unavailable: ${error.message}`);
    return;
  }
  const result = runRuntime(frame({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "seis_application_bundle_01_status", arguments: {} },
  }), linkPath);
  assert.equal(result.status, 0, result.stderr);
  const responses = parseFrames(result.stdout);
  assert.equal(responses.length, 1);
  assert.equal(responses[0].error.code, -32603);
  assert.match(responses[0].error.message, /unavailable or unsafe/i);
});

function runRuntime(input, pluginRoot = bundleRoot) {
  return spawnSync(process.execPath, [runtimePath], {
    cwd: repositoryRoot,
    input,
    encoding: "utf8",
    timeout: 5000,
    env: {
      PATH: process.env.PATH || "",
      SEIS_PUBLIC_BUNDLE_ROOT: pluginRoot,
      SEIS_ROOT: repositoryRoot,
    },
  });
}

function runAgentRuntime(input, pluginRoot = agentRoot) {
  return spawnSync(process.execPath, [agentRuntimePath], {
    cwd: repositoryRoot,
    input,
    encoding: "utf8",
    timeout: 5000,
    env: {
      PATH: process.env.PATH || "",
      SEIS_AI_AGENT_PLUGIN_ROOT: pluginRoot,
      SEIS_ROOT: repositoryRoot,
    },
  });
}

function frame(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

function parseFrames(output) {
  const buffer = Buffer.from(output, "utf8");
  const messages = [];
  let cursor = 0;
  while (cursor < buffer.length) {
    const separator = buffer.indexOf("\r\n\r\n", cursor, "utf8");
    assert.notEqual(separator, -1, "response frame header is incomplete");
    const header = buffer.slice(cursor, separator).toString("utf8");
    const match = /^Content-Length:\s*(\d+)\s*$/i.exec(header);
    assert.ok(match, `invalid response header: ${header}`);
    const length = Number.parseInt(match[1], 10);
    const bodyStart = separator + 4;
    const bodyEnd = bodyStart + length;
    assert.ok(bodyEnd <= buffer.length, "response frame body is incomplete");
    messages.push(JSON.parse(buffer.slice(bodyStart, bodyEnd).toString("utf8")));
    cursor = bodyEnd;
  }
  return messages;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
