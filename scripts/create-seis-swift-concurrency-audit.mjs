#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";
import {
  SWIFT_CONCURRENCY_AUDIT_ID,
  SWIFT_CONCURRENCY_AUDIT_LIMITS,
  auditSwiftConcurrency,
} from "../plugins/seis-core/seis-swift-concurrency-audit/runtime/swift-concurrency-audit.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-swift-concurrency-audit.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const DECISION_PATH = "content/development/seis-public-plugin-wave-3-capability-decision.json";
const RUNTIME_PATH = "plugins/seis-core/seis-swift-concurrency-audit/runtime/swift-concurrency-audit.mjs";
const TEST_PATH = "plugins/seis-core/test/swift-concurrency-audit.test.mjs";
const SKILL_PATH = "plugins/seis-core/seis-swift-concurrency-audit/skills/seis-swift-concurrency-audit/SKILL.md";
const CANONICAL_ORCHESTRATOR_COUNT = 1;
const MIGRATED_ROOT_PLUGIN_COUNT = 5;
const TOPIC_PLUGIN_COUNT = 300;
const HISTORICAL_APPLICATION_PLUGIN_COUNT = 73;
const HISTORICAL_PUBLIC_CARD_COUNT = 379;
const CURRENT_EXPECTED_PUBLIC_CARD_COUNT = CANONICAL_ORCHESTRATOR_COUNT + MIGRATED_ROOT_PLUGIN_COUNT + APP_PLUGIN_EXPANSION_TARGET + TOPIC_PLUGIN_COUNT;
const WAVE_4_CANDIDATE_ID = "seis-swift-package-topology";
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-swift-concurrency-audit`);
    process.exit(1);
  }
  console.log("SEIS Swift concurrency audit evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with ${record.audit.scannedSwiftFileCount} bounded Swift files.`);
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const decision = readJson(DECISION_PATH);
  assertCurrentInventory(sourceManifest, marketplace);
  const plugin = list(sourceManifest.plugins).find((entry) => entry?.name === SWIFT_CONCURRENCY_AUDIT_ID);
  const marketplaceEntry = list(marketplace.plugins).find((entry) => entry?.name === SWIFT_CONCURRENCY_AUDIT_ID);
  const audit = auditSwiftConcurrency(ROOT);
  const runtimeSource = readText(RUNTIME_PATH);
  const testSource = readText(TEST_PATH);
  const skillSource = readText(SKILL_PATH);
  const machineMarker = list(audit.findings).find((finding) => finding?.code === "machine-path-marker-redacted");
  const credentialMarker = list(audit.findings).find((finding) => finding?.code === "credential-assignment-marker-found");
  const record = {
    schemaVersion: 1,
    id: SWIFT_CONCURRENCY_AUDIT_ID,
    goalId: "SEIS-GOAL-021",
    generatedAt: "2026-07-21",
    status: "attention-public-static-concurrency-evidence",
    purpose: "Record bounded, read-only Swift concurrency static signals without claiming compiler diagnostics, Sendable or actor correctness, data-race freedom, SwiftPM test completion, native runtime, signing, deployment, provider, or release outcomes.",
    plugin: {
      name: plugin?.name || null,
      sourcePath: plugin?.sourcePath || null,
      version: plugin?.version || null,
      releaseTrainVersion: plugin?.releaseTrainVersion || null,
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      publicAudience: "everyone",
      publicMarketplace: marketplaceEntry?.source?.path === `./plugins/seis-core/${SWIFT_CONCURRENCY_AUDIT_ID}`,
    },
    marketplace: {
      publicCardCount: HISTORICAL_PUBLIC_CARD_COUNT,
      expectedPublicCardCount: HISTORICAL_PUBLIC_CARD_COUNT,
      applicationPluginCount: HISTORICAL_APPLICATION_PLUGIN_COUNT,
      expectedApplicationPluginCount: HISTORICAL_APPLICATION_PLUGIN_COUNT,
      canonicalOrchestratorCount: CANONICAL_ORCHESTRATOR_COUNT,
      migratedRootPluginCount: MIGRATED_ROOT_PLUGIN_COUNT,
      topicPluginCount: TOPIC_PLUGIN_COUNT,
    },
    decision: {
      id: decision.id || null,
      status: decision.status || null,
      selectedCapability: decision.decision?.selectedCapability || null,
      implementationStarted: decision.decision?.implementationStarted === true,
      additionalPublicCardAdded: decision.decision?.additionalPublicCardAdded === true,
    },
    audit: {
      state: audit.state,
      ok: audit.ok,
      mode: audit.mode,
      classification: audit.classification,
      scannedSwiftFileCount: audit.summary?.scannedSwiftFileCount || 0,
      boundedSwiftByteCount: audit.summary?.boundedSwiftByteCount || 0,
      maxFileBytesObserved: audit.summary?.maxFileBytesObserved || 0,
      maxRelativeDepthObserved: audit.summary?.maxRelativeDepthObserved || 0,
      sourceRootCount: list(audit.summary?.sourceRoots).length,
      sourceRootStates: list(audit.summary?.sourceRoots).map((sourceRoot) => ({ id: sourceRoot.id, safe: sourceRoot.safe === true })),
      signalCounts: audit.summary?.signalCounts || {},
      reportedPathCounts: Object.fromEntries(Object.entries(audit.signals || {}).map(([name, signal]) => [name, list(signal?.relativePaths).length])),
      findingCodes: list(audit.findings).map((finding) => finding?.code).filter(Boolean).sort(),
      reviewRequired: audit.summary?.reviewRequired === true,
      blockingFindingCount: audit.summary?.blockingFindingCount || 0,
    },
    resilienceReview: buildResilienceReview(runtimeSource, testSource, skillSource),
    safety: {
      read: audit.permissions?.read || [],
      write: [],
      network: [],
      secrets: [],
      compilesSwift: false,
      runsSwiftTests: false,
      startsNativeApplication: false,
      signsArtifacts: false,
      installsPlugins: false,
      publicReleaseAllowed: false,
    },
    limitations: audit.limitations,
    inputSafety: {
      machineSpecificPathMarkerCount: machineMarker?.count || 0,
      credentialAssignmentFindingCount: credentialMarker?.count || 0,
      rawSourceReturned: false,
      rawMatchedValuesReturned: false,
      sourceFilesCompiled: false,
    },
    validation: [
      "node plugins/seis-core/seis-swift-concurrency-audit/scripts/seis-swift-concurrency-audit-mcp-server.mjs --status",
      "node plugins/seis-core/seis-swift-concurrency-audit/scripts/seis-swift-concurrency-audit-mcp-server.mjs --audit --path .",
      "node plugins/seis-core/seis-swift-concurrency-audit/scripts/seis-swift-concurrency-audit-mcp-server.mjs --evidence",
      "node --test plugins/seis-core/test/swift-concurrency-audit.test.mjs",
      "npm run check:seis-swift-concurrency-audit",
    ],
    publicBoundary: {
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      publicReleaseAllowed: false,
    },
  };
  validateRecord(record);
  return record;
}

function buildResilienceReview(runtimeSource, testSource, skillSource) {
  const requiredRuntimeMarkers = [
    "swift-source-symlink-refused",
    "swift-source-file-limit-exceeded",
    "swift-source-file-size-limit-exceeded",
    "swift-source-total-byte-limit-exceeded",
    "swift-source-depth-limit-exceeded",
    "credential-assignment-marker-found",
    "maximumReportedPathsPerSignal",
  ];
  const requiredTestMarkers = [
    "refuses source trees beyond the declared depth without returning raw source",
    "refuses a direct source-area symlink without following it",
    "refuses oversized Swift source before reading it",
    "refuses Swift source file counts above the declared limit",
    "refuses aggregate Swift source bytes above the declared limit",
    "refuses an exact credential-assignment marker without returning its value",
    "serves bounded MCP responses and refuses an arbitrary audit path",
  ];
  const requiredSkillMarker = "never returns raw Swift source";
  assert(requiredRuntimeMarkers.every((marker) => runtimeSource.includes(marker)), "runtime resilience markers are missing");
  assert(requiredTestMarkers.every((marker) => testSource.includes(marker)), "resilience regression fixtures are missing");
  assert(skillSource.includes(requiredSkillMarker), "resilience limitation documentation is missing");
  return {
    status: "completed-repository-local-resilience-review",
    limits: SWIFT_CONCURRENCY_AUDIT_LIMITS,
    limitReachedState: "attention",
    coveredFailureModes: [
      "source-depth-limit",
      "source-file-count-limit",
      "source-file-size-limit",
      "source-total-byte-limit",
      "source-symlink",
      "credential-assignment-marker",
      "MCP-arbitrary-audit-path",
    ],
    outputBoundary: {
      rawSourceReturned: false,
      rawMatchedValuesReturned: false,
      machineSpecificPathReturned: false,
      network: false,
      writes: false,
      secrets: false,
    },
    nativeExecution: "not-run-and-not-claimed",
  };
}

function validateRecord(record) {
  assert(record.id === SWIFT_CONCURRENCY_AUDIT_ID && record.goalId === "SEIS-GOAL-021", "record identity is invalid");
  assert(record.status === "attention-public-static-concurrency-evidence", "record status is invalid");
  assert(record.plugin?.name === SWIFT_CONCURRENCY_AUDIT_ID && record.plugin?.sourcePath === `plugins/seis-core/${SWIFT_CONCURRENCY_AUDIT_ID}`, "plugin source contract is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo" && record.plugin?.marketplaceDisplayName === "SEIS Repo" && record.plugin?.publicMarketplace === true, "public marketplace contract is invalid");
  assert(record.marketplace?.publicCardCount === HISTORICAL_PUBLIC_CARD_COUNT && record.marketplace?.expectedPublicCardCount === HISTORICAL_PUBLIC_CARD_COUNT && record.marketplace?.applicationPluginCount === HISTORICAL_APPLICATION_PLUGIN_COUNT && record.marketplace?.expectedApplicationPluginCount === HISTORICAL_APPLICATION_PLUGIN_COUNT, "historical Wave 3 count contract is invalid");
  assert(record.decision?.id === "seis-public-plugin-wave-3-capability-decision" && record.decision?.selectedCapability === SWIFT_CONCURRENCY_AUDIT_ID && record.decision?.implementationStarted === true && record.decision?.additionalPublicCardAdded === true, "Wave 3 decision linkage is invalid");
  assert(record.audit?.state === "attention" && record.audit?.ok === true && record.audit?.classification === "bounded-static-concurrency-signals-only" && record.audit?.sourceRootCount === 2 && record.audit?.scannedSwiftFileCount > 0 && record.audit?.blockingFindingCount === 0, "static concurrency audit is invalid");
  assert((record.audit?.signalCounts?.uncheckedSendable || 0) > 0 && (record.audit?.signalCounts?.sendableDeclaration || 0) > 0 && list(record.audit?.findingCodes).includes("unchecked-sendable-review-required"), "expected static review signals are missing");
  assert(record.resilienceReview?.status === "completed-repository-local-resilience-review" && record.resilienceReview?.limits?.maxSwiftFiles === SWIFT_CONCURRENCY_AUDIT_LIMITS.maxSwiftFiles && list(record.resilienceReview?.coveredFailureModes).length === 7, "resilience review is invalid");
  assert(record.safety?.write?.length === 0 && record.safety?.network?.length === 0 && record.safety?.secrets?.length === 0 && record.safety?.compilesSwift === false && record.safety?.runsSwiftTests === false && record.safety?.startsNativeApplication === false && record.safety?.signsArtifacts === false && record.safety?.installsPlugins === false && record.safety?.publicReleaseAllowed === false, "native execution boundary is invalid");
  assert(record.inputSafety?.credentialAssignmentFindingCount === 0 && record.inputSafety?.rawSourceReturned === false && record.inputSafety?.rawMatchedValuesReturned === false && record.inputSafety?.sourceFilesCompiled === false, "input safety record is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "record must not contain a machine-specific path");
}

function assertCurrentInventory(sourceManifest, marketplace) {
  const applicationPluginCount = list(sourceManifest?.plugins).length;
  const publicCardCount = list(marketplace?.plugins).length;
  const wave4SourcePresent = list(sourceManifest?.plugins).some((entry) => entry?.name === WAVE_4_CANDIDATE_ID);
  const wave4CardPresent = list(marketplace?.plugins).some((entry) => entry?.name === WAVE_4_CANDIDATE_ID && entry?.source?.path === `./plugins/seis-core/${WAVE_4_CANDIDATE_ID}`);
  const historicalInventory = applicationPluginCount === HISTORICAL_APPLICATION_PLUGIN_COUNT && publicCardCount === HISTORICAL_PUBLIC_CARD_COUNT;
  const integratedWave4Inventory = applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET && publicCardCount === CURRENT_EXPECTED_PUBLIC_CARD_COUNT && wave4SourcePresent && wave4CardPresent;
  assert(historicalInventory || integratedWave4Inventory, "current inventory is neither the Wave 3 snapshot nor the one-package Wave 4 integration");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS Swift concurrency audit evidence: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS Swift concurrency audit evidence: ${message}`);
}
