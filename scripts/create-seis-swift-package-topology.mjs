#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";
import {
  SWIFT_PACKAGE_TOPOLOGY_ID,
  auditSwiftPackageTopology,
} from "../plugins/seis-core/seis-swift-package-topology/runtime/swift-package-topology.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-swift-package-topology.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const CATALOG_PATH = "apps/seis-core/data/seis-core-plugin-catalog.json";
const MATRIX_PATH = "content/development/seis-core-plugin-matrix.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const ACTIVATION_DECISION_PATH = "content/development/seis-public-plugin-wave-4-activation-decision.json";
const RUNTIME_PATH = "plugins/seis-core/seis-swift-package-topology/runtime/swift-package-topology.mjs";
const TEST_PATH = "plugins/seis-core/test/swift-package-topology.test.mjs";
const SKILL_PATH = "plugins/seis-core/seis-swift-package-topology/skills/seis-swift-package-topology/SKILL.md";
const CANONICAL_ORCHESTRATOR_COUNT = 1;
const MIGRATED_ROOT_PLUGIN_COUNT = 5;
const TOPIC_PLUGIN_COUNT = 300;
const EXPECTED_PUBLIC_CARD_COUNT = CANONICAL_ORCHESTRATOR_COUNT + MIGRATED_ROOT_PLUGIN_COUNT + APP_PLUGIN_EXPANSION_TARGET + TOPIC_PLUGIN_COUNT;
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-swift-package-topology`);
    process.exit(1);
  }
  console.log("SEIS Swift Package topology evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with ${record.audit.targetCount} declared targets.`);
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const catalog = readJson(CATALOG_PATH);
  const matrix = readJson(MATRIX_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const activation = readJson(ACTIVATION_DECISION_PATH);
  const sourceEntry = list(sourceManifest.plugins).find((entry) => entry?.name === SWIFT_PACKAGE_TOPOLOGY_ID);
  const catalogEntry = list(catalog.plugins).find((entry) => entry?.name === SWIFT_PACKAGE_TOPOLOGY_ID);
  const matrixEntry = list(matrix.plugins).find((entry) => entry?.name === SWIFT_PACKAGE_TOPOLOGY_ID);
  const marketplaceEntry = list(marketplace.plugins).find((entry) => entry?.name === SWIFT_PACKAGE_TOPOLOGY_ID);
  const audit = auditSwiftPackageTopology(ROOT);
  const runtimeSource = readText(RUNTIME_PATH);
  const testSource = readText(TEST_PATH);
  const skillSource = readText(SKILL_PATH);
  const record = {
    schemaVersion: 1,
    id: SWIFT_PACKAGE_TOPOLOGY_ID,
    goalId: "SEIS-GOAL-021",
    wave: 4,
    generatedAt: "2026-07-21",
    status: "ready-public-static-topology-evidence",
    purpose: "Record one bounded, read-only Swift Package manifest topology report without claiming SwiftPM resolution, compiler diagnostics, test completion, native runtime, signing, independent installation, provider access, deployment, or public release.",
    plugin: {
      name: sourceEntry?.name || null,
      sourcePath: sourceEntry?.sourcePath || null,
      version: sourceEntry?.version || null,
      releaseTrainVersion: sourceEntry?.releaseTrainVersion || null,
      catalogStatus: catalogEntry?.status?.state || null,
      matrixStatus: matrixEntry?.status || null,
      matrixOk: matrixEntry?.ok === true,
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      marketplaceCategory: marketplaceEntry?.category || null,
      publicAudience: "everyone",
      publicMarketplace: marketplaceEntry?.source?.path === `./plugins/seis-core/${SWIFT_PACKAGE_TOPOLOGY_ID}`,
    },
    marketplace: {
      publicCardCount: list(marketplace.plugins).length,
      expectedPublicCardCount: EXPECTED_PUBLIC_CARD_COUNT,
      applicationPluginCount: list(sourceManifest.plugins).length,
      expectedApplicationPluginCount: APP_PLUGIN_EXPANSION_TARGET,
      canonicalOrchestratorCount: CANONICAL_ORCHESTRATOR_COUNT,
      migratedRootPluginCount: MIGRATED_ROOT_PLUGIN_COUNT,
      topicPluginCount: TOPIC_PLUGIN_COUNT,
    },
    activation: {
      id: activation.id || null,
      status: activation.status || null,
      selectedCapability: activation.decision?.selectedCapability || null,
      activationApproved: activation.decision?.activationApproved === true,
      implementationAuthorized: activation.decision?.implementationApproved === true,
      implementationObserved: Boolean(sourceEntry && catalogEntry && matrixEntry && marketplaceEntry),
      publicReleaseApproved: activation.decision?.publicReleaseApproved === true,
    },
    audit: {
      state: audit.state,
      ok: audit.ok,
      mode: audit.mode,
      classification: audit.classification,
      manifestRelativePath: audit.summary?.manifestRelativePath || null,
      boundedManifestByteCount: audit.summary?.boundedManifestByteCount || 0,
      topologyAvailable: audit.summary?.topologyAvailable === true,
      declaredPlatformCount: audit.summary?.declaredPlatformCount || 0,
      productCount: audit.summary?.productCount || 0,
      targetCount: audit.summary?.targetCount || 0,
      targetDependencyEdgeCount: audit.summary?.targetDependencyEdgeCount || 0,
      testTargetDependencyCount: audit.summary?.testTargetDependencyCount || 0,
      executableResourceCount: audit.summary?.executableResourceCount || 0,
      platforms: audit.topology?.platforms || [],
      products: audit.topology?.products || [],
      targets: audit.topology?.targets || [],
      targetDependencies: audit.topology?.targetDependencies || [],
      testTargetDependencies: audit.topology?.testTargetDependencies || [],
      executableResources: audit.topology?.executableResources || [],
      findingCodes: list(audit.findings).map((finding) => finding?.code).filter(Boolean).sort(),
    },
    resilienceReview: buildResilienceReview(runtimeSource, testSource, skillSource),
    safety: {
      read: audit.permissions?.read || [],
      write: [],
      network: [],
      secrets: [],
      resolvesSwiftPackages: false,
      compilesSwift: false,
      runsSwiftTests: false,
      startsNativeApplication: false,
      signsArtifacts: false,
      installsPlugins: false,
      publicReleaseAllowed: false,
    },
    limitations: audit.limitations,
    validation: [
      "node plugins/seis-core/seis-swift-package-topology/scripts/seis-swift-package-topology-mcp-server.mjs --status",
      "node plugins/seis-core/seis-swift-package-topology/scripts/seis-swift-package-topology-mcp-server.mjs --audit --path .",
      "node plugins/seis-core/seis-swift-package-topology/scripts/seis-swift-package-topology-mcp-server.mjs --evidence",
      "node --test plugins/seis-core/test/swift-package-topology.test.mjs",
      "npm run check:seis-swift-package-topology",
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
    rollback: {
      strategy: "revert",
      scope: "Revert the source package, public SEIS Repo card, generated topology evidence, and their reconciled projections on the feature branch; no manifest mutation, external state, release, or data migration exists.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function buildResilienceReview(runtimeSource, testSource, skillSource) {
  const requiredRuntimeMarkers = [
    "manifest-not-regular-file",
    "manifest-byte-limit-exceeded",
    "unsupported-platform-declaration",
    "unsupported-target-dependency-syntax",
    "credential-assignment-marker-found",
    "rawManifestReturned: false",
  ];
  const requiredTestMarkers = [
    "refuses an oversized fixed manifest before reading it",
    "refuses a direct fixed-manifest symlink without following it",
    "treats an unsupported platform as attention instead of inferring a topology",
    "treats unsupported dependency syntax as attention without guessed edges",
    "MCP exposes only bounded tools and refuses arbitrary or outside-workspace paths",
  ];
  const requiredSkillMarker = "never returns raw manifest text";
  assert(requiredRuntimeMarkers.every((marker) => runtimeSource.includes(marker)), "runtime resilience markers are missing");
  assert(requiredTestMarkers.every((marker) => testSource.includes(marker)), "resilience regression fixtures are missing");
  assert(skillSource.includes(requiredSkillMarker), "resilience limitation documentation is missing");
  return {
    status: "completed-repository-local-resilience-review",
    limitReachedState: "attention",
    coveredFailureModes: [
      "fixed-manifest-missing-or-unreadable",
      "fixed-manifest-non-regular-or-symlink",
      "fixed-manifest-byte-limit",
      "unsupported-or-malformed-syntax",
      "unsupported-dependency-or-resource-syntax",
      "machine-path-and-credential-marker-redaction",
      "MCP-arbitrary-audit-path",
    ],
    outputBoundary: {
      rawManifestReturned: false,
      rawMatchedValuesReturned: false,
      machineSpecificPathReturned: false,
      absolutePathsReturned: false,
      network: false,
      writes: false,
      secrets: false,
    },
    nativeExecution: "not-run-and-not-claimed",
  };
}

function validateRecord(record) {
  assert(record.id === SWIFT_PACKAGE_TOPOLOGY_ID && record.goalId === "SEIS-GOAL-021" && record.wave === 4, "record identity is invalid");
  assert(record.status === "ready-public-static-topology-evidence", "record status is invalid");
  assert(record.plugin?.name === SWIFT_PACKAGE_TOPOLOGY_ID && record.plugin?.sourcePath === `plugins/seis-core/${SWIFT_PACKAGE_TOPOLOGY_ID}` && record.plugin?.catalogStatus === "ready" && record.plugin?.matrixStatus === "ready" && record.plugin?.matrixOk === true, "plugin projection is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo" && record.plugin?.marketplaceDisplayName === "SEIS Repo" && record.plugin?.marketplaceCategory === "Developer" && record.plugin?.publicMarketplace === true, "public marketplace contract is invalid");
  assert(record.marketplace?.publicCardCount === EXPECTED_PUBLIC_CARD_COUNT && record.marketplace?.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET, "public count contract is invalid");
  assert(record.activation?.id === "seis-public-plugin-wave-4-activation-decision" && record.activation?.selectedCapability === SWIFT_PACKAGE_TOPOLOGY_ID && record.activation?.activationApproved === true && record.activation?.implementationAuthorized === true && record.activation?.implementationObserved === true && record.activation?.publicReleaseApproved === false, "Wave 4 activation linkage is invalid");
  assert(record.audit?.state === "ready" && record.audit?.ok === true && record.audit?.classification === "bounded-static-swift-package-manifest-topology" && record.audit?.manifestRelativePath === "packages/seis_platform_swift/Package.swift" && record.audit?.topologyAvailable === true, "static topology audit is invalid");
  assert(record.audit?.declaredPlatformCount === 2 && record.audit?.productCount === 2 && record.audit?.targetCount === 3 && record.audit?.targetDependencyEdgeCount === 1 && record.audit?.testTargetDependencyCount === 1 && record.audit?.executableResourceCount === 2 && list(record.audit?.findingCodes).length === 0, "declared topology is invalid");
  assert(record.resilienceReview?.status === "completed-repository-local-resilience-review" && list(record.resilienceReview?.coveredFailureModes).length === 7, "resilience review is invalid");
  assert(record.safety?.write?.length === 0 && record.safety?.network?.length === 0 && record.safety?.secrets?.length === 0 && record.safety?.resolvesSwiftPackages === false && record.safety?.compilesSwift === false && record.safety?.runsSwiftTests === false && record.safety?.startsNativeApplication === false && record.safety?.signsArtifacts === false && record.safety?.installsPlugins === false && record.safety?.publicReleaseAllowed === false, "execution boundary is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "rollback boundary is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "record must not contain a machine-specific path");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS Swift Package topology evidence: required input is missing: ${relativePath}`);
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
  if (!condition) throw new Error(`SEIS Swift Package topology evidence: ${message}`);
}
