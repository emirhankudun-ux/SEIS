#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";
import { APPLE_NATIVE_READINESS_ID, auditAppleNativeReadiness } from "../plugins/seis-core/seis-apple-native-readiness/runtime/apple-native-readiness.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-apple-native-readiness.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const PROJECT_MANIFEST_PATH = "project.ecosystem.yaml";
const CANONICAL_ORCHESTRATOR_COUNT = 1;
const MIGRATED_ROOT_PLUGIN_COUNT = 5;
const TOPIC_PLUGIN_COUNT = 300;
const EXPECTED_PUBLIC_CARD_COUNT = CANONICAL_ORCHESTRATOR_COUNT + MIGRATED_ROOT_PLUGIN_COUNT + APP_PLUGIN_EXPANSION_TARGET + TOPIC_PLUGIN_COUNT;
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-apple-native-readiness`);
    process.exit(1);
  }
  console.log("SEIS Apple-native readiness evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with ${record.audit.checkCount} bounded static checks.`);
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const plugin = (sourceManifest.plugins || []).find((entry) => entry?.name === APPLE_NATIVE_READINESS_ID);
  const marketplaceEntry = (marketplace.plugins || []).find((entry) => entry?.name === APPLE_NATIVE_READINESS_ID);
  const audit = auditAppleNativeReadiness(ROOT);
  const publicCardCount = list(marketplace.plugins).length;
  const applicationPluginCount = list(sourceManifest.plugins).length;
  const record = {
    schemaVersion: 1,
    id: APPLE_NATIVE_READINESS_ID,
    goalId: "SEIS-GOAL-021",
    generatedAt: "2026-07-21",
    status: "completed-public-static-readiness-evidence",
    purpose: "Record bounded local Apple/Swift Package readiness evidence without claiming a Swift build, device run, signing, provisioning, deployment, provider, App Store, or release outcome.",
    plugin: {
      name: plugin?.name || null,
      sourcePath: plugin?.sourcePath || null,
      version: plugin?.version || null,
      releaseTrainVersion: plugin?.releaseTrainVersion || null,
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      publicAudience: "everyone",
      publicMarketplace: marketplaceEntry?.source?.path === `./plugins/seis-core/${APPLE_NATIVE_READINESS_ID}`,
    },
    marketplace: {
      publicCardCount,
      expectedPublicCardCount: EXPECTED_PUBLIC_CARD_COUNT,
      applicationPluginCount,
      expectedApplicationPluginCount: APP_PLUGIN_EXPANSION_TARGET,
      canonicalOrchestratorCount: CANONICAL_ORCHESTRATOR_COUNT,
      migratedRootPluginCount: MIGRATED_ROOT_PLUGIN_COUNT,
      topicPluginCount: TOPIC_PLUGIN_COUNT,
    },
    audit: {
      state: audit.state,
      ok: audit.ok,
      mode: audit.mode,
      classification: audit.classification,
      checkCount: list(audit.checks).length,
      readyCheckCount: list(audit.checks).filter((check) => check?.state === "ready").length,
      findingCodes: list(audit.findings).map((finding) => finding?.code).filter(Boolean).sort(),
      summary: audit.summary,
    },
    safety: {
      read: audit.permissions?.read || [],
      write: [],
      network: [],
      secrets: [],
      compilesSwift: false,
      startsNativeApplication: false,
      signsArtifacts: false,
      installsPlugins: false,
      publicReleaseAllowed: false,
    },
    limitations: audit.limitations,
    validation: [
      "node plugins/seis-core/seis-apple-native-readiness/scripts/seis-apple-native-readiness-mcp-server.mjs --status",
      "node plugins/seis-core/seis-apple-native-readiness/scripts/seis-apple-native-readiness-mcp-server.mjs --audit --path .",
      "node --test plugins/seis-core/test/apple-native-readiness.test.mjs",
      "npm run check:seis-apple-native-readiness",
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
    inputSafety: {
      machineSpecificPathFindingCount: 0,
      rawSourceReturned: false,
      sourceFilesCompiled: false,
      projectManifestPath: PROJECT_MANIFEST_PATH,
    },
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === APPLE_NATIVE_READINESS_ID, "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021", "goal linkage is invalid");
  assert(record.status === "completed-public-static-readiness-evidence", "record status is invalid");
  assert(record.plugin?.name === APPLE_NATIVE_READINESS_ID && record.plugin?.sourcePath === `plugins/seis-core/${APPLE_NATIVE_READINESS_ID}`, "plugin source contract is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo" && record.plugin?.marketplaceDisplayName === "SEIS Repo" && record.plugin?.publicMarketplace === true, "public marketplace contract is invalid");
  assert(record.marketplace?.publicCardCount === EXPECTED_PUBLIC_CARD_COUNT && record.marketplace?.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET, "public count contract is invalid");
  assert(record.audit?.state === "ready" && record.audit?.ok === true && record.audit?.classification === "documented-static-readiness-only", "static readiness audit is invalid");
  assert(record.audit?.checkCount >= 16 && record.audit?.readyCheckCount === record.audit?.checkCount && list(record.audit?.findingCodes).length === 0, "static readiness checks are incomplete");
  assert(record.safety?.write?.length === 0 && record.safety?.network?.length === 0 && record.safety?.secrets?.length === 0, "safety permissions must be empty");
  assert(record.safety?.compilesSwift === false && record.safety?.startsNativeApplication === false && record.safety?.signsArtifacts === false && record.safety?.installsPlugins === false && record.safety?.publicReleaseAllowed === false, "native execution boundary is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.inputSafety?.machineSpecificPathFindingCount === 0 && record.inputSafety?.rawSourceReturned === false && record.inputSafety?.sourceFilesCompiled === false, "input safety record is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "record must not contain a machine-specific path");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS Apple-native readiness evidence: required input is missing: ${relativePath}`);
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
  if (!condition) throw new Error(`SEIS Apple-native readiness evidence: ${message}`);
}
