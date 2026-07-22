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
const BUNDLE_CATALOG_PATH = "content/development/seis-public-plugin-bundle-catalog.json";
const INITIAL_PROGRAM_PATH = "content/development/seis-public-plugin-expansion-program.json";
const WAVE_1_HANDOFF_PATH = "content/development/seis-public-plugin-wave-1-handoff.json";
const APPLE_BUNDLE_ID = "seis-application-bundle-04";
const CURRENT_DISTRIBUTION = Object.freeze({
  marketplaceCardCount: 34,
  canonicalCardCount: 1,
  bundleCardCount: 33,
  applicationBundleCardCount: 6,
  topicBundleCardCount: 27,
  retainedSourceCapabilityCount: 380,
  rootSourceCapabilityCount: 5,
  applicationSourceCapabilityCount: APP_PLUGIN_EXPANSION_TARGET,
  topicSourceCapabilityCount: 300,
});
const HISTORICAL_WAVE_2_DISTRIBUTION = Object.freeze({
  applicationSourcePackageCount: 72,
  topicSourcePackageCount: 300,
  migratedRootCardCount: 5,
  canonicalCardCount: 1,
  directApplicationCardCount: 72,
  marketplaceCardCount: 378,
});
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
  const bundleCatalog = readJson(BUNDLE_CATALOG_PATH);
  const initialProgram = readJson(INITIAL_PROGRAM_PATH);
  const wave1Handoff = readJson(WAVE_1_HANDOFF_PATH);
  const sourceEntry = list(sourceManifest.plugins).find((plugin) => plugin?.name === PLUGIN_ID);
  const cards = list(marketplace.plugins);
  const directMarketplaceEntry = cards.find((plugin) => plugin?.name === PLUGIN_ID || plugin?.source?.path === `./plugins/seis-core/${PLUGIN_ID}`);
  const bundleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(PLUGIN_ID));
  const distributionBundle = bundleMemberships[0];
  const distributionCard = cards.find((card) => card?.name === distributionBundle?.id);
  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-2-capability-decision",
    goalId: "SEIS-GOAL-021",
    backlogId: "SEIS-BL-021",
    generatedAt: "2026-07-22",
    status: "approved-public-local-implementation",
    wave: 2,
    decision: {
      selectedCapability: PLUGIN_ID,
      displayName: "SEIS Apple Native Readiness",
      selectionReason: "At Wave 2 selection time, the repository contained a real Swift Package and Apple platform strategy, while the then-current public app-owned plugins only performed generic root manifest discovery, repository hygiene, package inventory, or technology taxonomy work. No existing package jointly audited the declared Swift Package targets, bounded Swift source/test presence, and anti-symbolic Apple platform strategy markers without compiling or claiming a runtime.",
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
      outcome: "Provide a bounded local static-readiness audit for real Apple/Swift Package evidence and retain it as a source capability distributed through one curated SEIS Repo application bundle.",
    },
    nonGoals: [
      "Compiling, testing, building, signing, provisioning, or distributing a Swift package or native application.",
      "Claiming a simulator, device, macOS, iPadOS, iOS, visionOS, App Store, deployment, provider, or release result.",
      "Reading or mutating the personal marketplace.",
      "Adding a plugin or direct marketplace card solely to increase public counts.",
      "Writing source, marketplace, GitHub, or release state from the plugin runtime.",
    ],
    acceptanceCriteria: [
      "A public app-owned package exists at plugins/seis-core/seis-apple-native-readiness.",
      "The package returns bounded static readiness evidence without raw source content.",
      "The package has empty write, network, and secret permissions.",
      "The retained source package has no direct marketplace card and appears exactly once in the public bundle catalog.",
      `"${APPLE_BUNDLE_ID}" has one current SEIS Repo marketplace card and includes the Apple readiness source capability.`,
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
      marketplaceCard: Boolean(directMarketplaceEntry),
      distributionBundleId: distributionBundle?.id || null,
      distributionBundleSourcePath: distributionBundle?.sourcePath || null,
      distributionBundleCardPresent: Boolean(distributionCard),
      bundleMembershipCount: bundleMemberships.length,
      pluginVersion: sourceEntry?.version || null,
      releaseTrainVersion: sourceEntry?.releaseTrainVersion || null,
      implementationState: sourceEntry?.implementationState || null,
    },
    historicalWave2Distribution: {
      classification: "immutable-wave-2-handoff-snapshot",
      distributionMode: "direct-source-package-marketplace-cards",
      ...HISTORICAL_WAVE_2_DISTRIBUTION,
      selectedCapabilityHadDirectMarketplaceCard: true,
      note: "These counts describe the historical Wave 2 handoff and are not the current marketplace projection.",
    },
    currentDistributionEvidence: {
      initialProgramId: initialProgram.id || null,
      initialWave2Status: initialProgram.nextWaves?.[1]?.status || null,
      wave1HandoffId: wave1Handoff.id || null,
      wave1HandoffStatus: wave1Handoff.status || null,
      distributionMode: sourceManifest.publicDistribution?.distributionMode || null,
      marketplaceCardCount: cards.length,
      canonicalCardCount: bundleCatalog.marketplace?.canonicalCardCount ?? null,
      bundleCardCount: bundleCatalog.marketplace?.bundleCardCount ?? null,
      applicationBundleCardCount: bundleCatalog.marketplace?.applicationBundleCardCount ?? null,
      topicBundleCardCount: bundleCatalog.marketplace?.topicBundleCardCount ?? null,
      retainedSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount ?? null,
      rootSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount ?? null,
      applicationSourceCapabilityCount: list(sourceManifest.plugins).length,
      topicSourceCapabilityCount: bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount ?? null,
      separateMarketplaceCards: sourceManifest.publicDistribution?.separateMarketplaceCards ?? null,
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
      "npm run check:seis-public-plugin-bundles",
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
  assert(record.implementation?.sourcePath === `plugins/seis-core/${PLUGIN_ID}` && record.implementation?.marketplaceCard === false, "current source placement or direct-card state is invalid");
  assert(record.implementation?.distributionBundleId === APPLE_BUNDLE_ID && record.implementation?.distributionBundleSourcePath === `./plugins/seis-bundles/${APPLE_BUNDLE_ID}` && record.implementation?.distributionBundleCardPresent === true && record.implementation?.bundleMembershipCount === 1, "current Apple bundle distribution is invalid");
  assert(record.implementation?.implementationState === "functional-local-demo", "implementation state is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.publicAudience === "everyone", "public marketplace identity is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public safety boundary is invalid");
  assert(record.historicalWave2Distribution?.marketplaceCardCount === HISTORICAL_WAVE_2_DISTRIBUTION.marketplaceCardCount && record.historicalWave2Distribution?.applicationSourcePackageCount === HISTORICAL_WAVE_2_DISTRIBUTION.applicationSourcePackageCount && record.historicalWave2Distribution?.directApplicationCardCount === HISTORICAL_WAVE_2_DISTRIBUTION.directApplicationCardCount && record.historicalWave2Distribution?.selectedCapabilityHadDirectMarketplaceCard === true, "historical Wave 2 distribution is invalid");
  assert(record.currentDistributionEvidence?.initialProgramId === "seis-public-plugin-expansion-program" && record.currentDistributionEvidence?.initialWave2Status === "completed", "Wave 2 completion evidence is invalid");
  assert(record.currentDistributionEvidence?.wave1HandoffId === "seis-public-plugin-wave-1-handoff" && record.currentDistributionEvidence?.wave1HandoffStatus === "completed-repository-local-handoff", "Wave 1 handoff evidence is invalid");
  assert(record.currentDistributionEvidence?.distributionMode === "curated-bounded-public-bundles" && record.currentDistributionEvidence?.separateMarketplaceCards === false, "current distribution mode is invalid");
  assert(record.currentDistributionEvidence?.marketplaceCardCount === CURRENT_DISTRIBUTION.marketplaceCardCount && record.currentDistributionEvidence?.canonicalCardCount === CURRENT_DISTRIBUTION.canonicalCardCount && record.currentDistributionEvidence?.bundleCardCount === CURRENT_DISTRIBUTION.bundleCardCount && record.currentDistributionEvidence?.applicationBundleCardCount === CURRENT_DISTRIBUTION.applicationBundleCardCount && record.currentDistributionEvidence?.topicBundleCardCount === CURRENT_DISTRIBUTION.topicBundleCardCount, "current marketplace card evidence is invalid");
  assert(record.currentDistributionEvidence?.retainedSourceCapabilityCount === CURRENT_DISTRIBUTION.retainedSourceCapabilityCount && record.currentDistributionEvidence?.rootSourceCapabilityCount === CURRENT_DISTRIBUTION.rootSourceCapabilityCount && record.currentDistributionEvidence?.applicationSourceCapabilityCount === CURRENT_DISTRIBUTION.applicationSourceCapabilityCount && record.currentDistributionEvidence?.topicSourceCapabilityCount === CURRENT_DISTRIBUTION.topicSourceCapabilityCount, "current source capability evidence is invalid");
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
