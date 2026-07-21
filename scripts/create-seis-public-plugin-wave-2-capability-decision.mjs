#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-2-capability-decision.json";
const PLUGIN_ID = "seis-apple-native-readiness";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const INITIAL_PROGRAM_PATH = "content/development/seis-public-plugin-expansion-program.json";
const WAVE_1_HANDOFF_PATH = "content/development/seis-public-plugin-wave-1-handoff.json";
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-2-capability-decision`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 2 capability decision check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for ${PLUGIN_ID}.`);
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const initialProgram = readJson(INITIAL_PROGRAM_PATH);
  const wave1Handoff = readJson(WAVE_1_HANDOFF_PATH);
  const sourceEntry = list(sourceManifest.plugins).find((plugin) => plugin?.name === PLUGIN_ID);
  const marketplaceEntry = list(marketplace.plugins).find((plugin) => plugin?.name === PLUGIN_ID);
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-2-capability-decision",
    goalId: "SEIS-GOAL-021",
    backlogId: "SEIS-BL-021",
    generatedAt: "2026-07-21",
    status: "approved-public-local-implementation",
    wave: 2,
    decision: {
      selectedCapability: PLUGIN_ID,
      displayName: "SEIS Apple Native Readiness",
      selectionReason: "The repository contains a real Swift Package and Apple platform strategy, while the current public app-owned plugins only perform generic root manifest discovery, repository hygiene, package inventory, or technology taxonomy work. No existing package jointly audits the declared Swift Package targets, bounded Swift source/test presence, and anti-symbolic Apple platform strategy markers without compiling or claiming a runtime.",
      overlapReview: [
        {
          plugin: "seis-workspace-inspector",
          decision: "retain",
          reason: "It reports root-level manifest names and technologies without reading the Package.swift contract, bounded source/test presence, or Apple strategy markers.",
        },
        {
          plugin: "seis-repository-health",
          decision: "retain",
          reason: "It performs repository hygiene and root governance checks, not Apple-native contract readiness.",
        },
        {
          plugin: "seis-sbom-generator",
          decision: "retain",
          reason: "It inventories package manifests for an SBOM and does not evaluate the package target, test, or Apple strategy contract.",
        },
        {
          plugin: "seis-technology-ontology",
          decision: "retain",
          reason: "It classifies technology vocabulary and does not verify a concrete Swift Package implementation boundary.",
        },
      ],
    },
    scope: {
      repositories: ["SEIS"],
      sourceInputs: [
        "packages/seis_platform_swift/Package.swift",
        "packages/seis_platform_swift/Sources/SeisPlatformKit",
        "packages/seis_platform_swift/Sources/SeisAppleNativeShell",
        "packages/seis_platform_swift/Tests/SeisPlatformKitTests",
        "docs/APPLE_PLATFORM_STRATEGY.md",
      ],
      outcome: "Provide a bounded local static-readiness audit for real Apple/Swift Package evidence and make that evidence available through one public SEIS Repo card.",
    },
    nonGoals: [
      "Compiling, testing, building, signing, provisioning, or distributing a Swift package or native application.",
      "Claiming a simulator, device, macOS, iPadOS, iOS, visionOS, App Store, deployment, provider, or release result.",
      "Reading or mutating the personal marketplace.",
      "Adding a plugin solely to increase the public card count.",
      "Writing source, marketplace, GitHub, or release state from the plugin runtime.",
    ],
    acceptanceCriteria: [
      "A public app-owned package exists at plugins/seis-core/seis-apple-native-readiness.",
      "The package returns bounded static readiness evidence without raw source content.",
      "The package has empty write, network, and secret permissions.",
      "The package has exactly one public seis-repo marketplace card and no personal marketplace dependency.",
      "Focused test, generator, structural plugin validation, marketplace, source, catalog, matrix, and integration checks are current.",
    ],
    publicBoundary: {
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      publicAudience: "everyone",
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      publicReleaseAllowed: false,
    },
    implementation: {
      sourcePath: sourceEntry?.sourcePath || null,
      marketplaceSourcePath: marketplaceEntry?.source?.path || null,
      pluginVersion: sourceEntry?.version || null,
      releaseTrainVersion: sourceEntry?.releaseTrainVersion || null,
      implementationState: sourceEntry?.implementationState || null,
    },
    evidence: {
      initialProgramId: initialProgram.id || null,
      initialWave2Status: initialProgram.nextWaves?.[1]?.status || null,
      wave1HandoffId: wave1Handoff.id || null,
      wave1HandoffStatus: wave1Handoff.status || null,
      applicationPluginCount: list(sourceManifest.plugins).length,
      expectedApplicationPluginCount: APP_PLUGIN_EXPANSION_TARGET,
      publicCardCount: list(marketplace.plugins).length,
    },
    risks: [
      {
        id: "RISK-W2-001",
        status: "tracked",
        description: "Static source markers can be mistaken for a successful native build or platform release.",
        mitigation: "Expose documented-static-readiness-only classification and explicit limitations; do not run a compiler or claim runtime evidence.",
      },
      {
        id: "RISK-W2-002",
        status: "tracked",
        description: "A broad filesystem audit could expose source or personal data beyond the intended package boundary.",
        mitigation: "Read only fixed relative paths, bounded text, and source/test filenames; reject paths outside the repository boundary and never return raw source text.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 2 package, evidence, and generated public metadata on the feature branch; do not mutate the protected default branch.",
      dataMigrationRequired: false,
    },
    validation: [
      "npm run check:seis-public-plugin-wave-2-capability-decision",
      "npm run check:seis-apple-native-readiness",
      "npm run check:seis-repo-marketplace",
      "npm run check:seis-agent-plugin-integration",
    ],
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-2-capability-decision", "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021" && record.backlogId === "SEIS-BL-021" && record.wave === 2, "goal linkage is invalid");
  assert(record.status === "approved-public-local-implementation", "decision status is invalid");
  assert(record.decision?.selectedCapability === PLUGIN_ID && list(record.decision?.overlapReview).length === 4, "capability decision is incomplete");
  assert(record.implementation?.sourcePath === `plugins/seis-core/${PLUGIN_ID}` && record.implementation?.marketplaceSourcePath === `./plugins/seis-core/${PLUGIN_ID}`, "public source placement is invalid");
  assert(record.implementation?.implementationState === "functional-local-demo", "implementation state is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public safety boundary is invalid");
  assert(record.evidence?.initialProgramId === "seis-public-plugin-expansion-program" && record.evidence?.initialWave2Status === "completed", "Wave 2 completion evidence is invalid");
  assert(record.evidence?.wave1HandoffId === "seis-public-plugin-wave-1-handoff" && record.evidence?.wave1HandoffStatus === "completed-repository-local-handoff", "Wave 1 handoff evidence is invalid");
  assert(record.evidence?.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.evidence?.publicCardCount === APP_PLUGIN_EXPANSION_TARGET + 306, "public count evidence is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "record must not contain a machine-specific path");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 2 capability decision: required input is missing: ${relativePath}`);
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
  if (!condition) throw new Error(`SEIS public plugin Wave 2 capability decision: ${message}`);
}
