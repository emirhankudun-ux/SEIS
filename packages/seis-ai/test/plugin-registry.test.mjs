import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  AI_CORE_PLUGIN_REGISTRY_TARGET_COUNT,
  aiCorePluginRegistryStatus,
  readAiCorePluginRegistry,
} from "../src/lib/plugin-registry.mjs";
import { APP_PLUGIN_EXPANSION_TARGET } from "../../../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const EXPECTED_PHYSICAL_PLUGIN_COUNT = APP_PLUGIN_EXPANSION_TARGET + 10;
const EXPECTED_CATALOG_ONLY_ENTRY_COUNT = AI_CORE_PLUGIN_REGISTRY_TARGET_COUNT - EXPECTED_PHYSICAL_PLUGIN_COUNT;
const bundleCatalog = JSON.parse(readFileSync(path.join(root, "content", "development", "seis-public-plugin-bundle-catalog.json"), "utf8"));
const EXPECTED_PUBLIC_MARKETPLACE_PLUGIN_COUNT = bundleCatalog.marketplace.publicCardCount;
const EXPECTED_MIGRATED_ROOT_MARKETPLACE_PLUGIN_COUNT = 0;
const EXPECTED_APPLICATION_MARKETPLACE_PLUGIN_COUNT = bundleCatalog.marketplace.applicationBundleCardCount;
const EXPECTED_TOPIC_MARKETPLACE_PLUGIN_COUNT = bundleCatalog.marketplace.topicBundleCardCount;
const EXPECTED_RETAINED_SOURCE_CAPABILITY_COUNT = bundleCatalog.sourceCapabilityInventory.retainedSourcePackageCount;

describe("SEIS AI Core plugin registry", () => {
  it("keeps exactly 5000 canonical registry entries under SEIS", () => {
    const registry = readAiCorePluginRegistry(root);

    assert.equal(registry.schemaVersion, 2);
    assert.equal(registry.goalId, "SEIS-GOAL-021");
    assert.equal(registry.canonicalOwnership.repository, "SEIS");
    assert.equal(registry.target.requestedPluginCount, AI_CORE_PLUGIN_REGISTRY_TARGET_COUNT);
    assert.equal(registry.entries.length, AI_CORE_PLUGIN_REGISTRY_TARGET_COUNT);
    assert.equal(new Set(registry.entries.map((entry) => entry.id)).size, AI_CORE_PLUGIN_REGISTRY_TARGET_COUNT);
    assert.equal(new Set(registry.entries.map((entry) => entry.slug)).size, AI_CORE_PLUGIN_REGISTRY_TARGET_COUNT);
    assert.equal(registry.historicalMarketplaceProjection.projectionModel, "direct-source-cards");
    assert.equal(registry.historicalMarketplaceProjection.publicCardCount, 381);
    assert.equal(registry.historicalMarketplaceProjection.compatibilityOnly, true);
    assert.equal(registry.currentMarketplaceProjection.projectionModel, "curated-bundle-cards");
    assert.equal(registry.currentMarketplaceProjection.publicCardCount, 34);
    assert.equal(registry.currentMarketplaceProjection.bundleCardCount, 33);
    assert.equal(registry.currentMarketplaceProjection.applicationBundleCardCount, 6);
    assert.equal(registry.currentMarketplaceProjection.topicBundleCardCount, 27);
    assert.equal(registry.currentMarketplaceProjection.sourceCapabilityInventory.retainedSourcePackageCount, 380);
  });

  it("separates migrated physical plugins from plan-only catalog slots", () => {
    const registry = readAiCorePluginRegistry(root);
    const physical = registry.entries.filter((entry) => entry.recordType === "physical-repo-plugin");
    const catalog = registry.entries.filter((entry) => entry.recordType === "capability-plugin-slot");

    assert.equal(registry.target.physicalPluginCount, physical.length);
    assert.equal(registry.target.catalogOnlyEntryCount, catalog.length);
    assert.equal(registry.target.physicalPluginCount, EXPECTED_PHYSICAL_PLUGIN_COUNT);
    assert.equal(registry.target.catalogOnlyEntryCount, EXPECTED_CATALOG_ONLY_ENTRY_COUNT);
    assert.equal(registry.target.appOwnedPluginCount, APP_PLUGIN_EXPANSION_TARGET);
    assert.equal(registry.target.functionalLocalDemoCount, APP_PLUGIN_EXPANSION_TARGET);
    assert.equal(registry.target.publicMarketplacePluginCount, EXPECTED_PUBLIC_MARKETPLACE_PLUGIN_COUNT);
    assert.equal(registry.target.migratedRootMarketplacePluginCount, EXPECTED_MIGRATED_ROOT_MARKETPLACE_PLUGIN_COUNT);
    assert.equal(registry.target.applicationMarketplacePluginCount, EXPECTED_APPLICATION_MARKETPLACE_PLUGIN_COUNT);
    assert.equal(registry.target.topicMarketplacePluginCount, EXPECTED_TOPIC_MARKETPLACE_PLUGIN_COUNT);
    assert.equal(registry.target.bundleMarketplacePluginCount, 33);
    assert.equal(registry.target.applicationSourcePackageCount, APP_PLUGIN_EXPANSION_TARGET);
    assert.equal(registry.target.topicSourcePackageCount, 300);
    assert.equal(registry.target.retainedSourceCapabilityCount, EXPECTED_RETAINED_SOURCE_CAPABILITY_COUNT);
    assert.equal(registry.target.personalPluginCount, 55);
    assert.equal(registry.target.personalRepoCounterpartCount, 55);
    assert.equal(registry.canonicalOwnership.applicationPluginSourceRoot, "plugins/seis-core");
    assert.equal(registry.canonicalOwnership.applicationPluginManifest, "apps/seis-core/data/seis-core-plugin-sources.json");
    assert.equal(registry.applicationRelease.releaseTrainPath, "content/development/seis-core-plugin-release-train.json");
    assert.match(registry.applicationRelease.label, /^(?:0\.\d{1,9}|\d+\.\d{4})$/);
    assert.match(registry.applicationRelease.semver, /^\d+\.0\.\d+$/);
    assert.equal(registry.applicationRelease.label, registry.target.appReleaseLabel);
    assert.equal(registry.applicationRelease.semver, registry.target.appReleaseSemver);
    assert.equal(registry.applicationRelease.major, registry.target.appReleaseMajor);
    assert.equal(registry.applicationRelease.revision, registry.target.appReleaseRevision);
    assert.equal(registry.entries.filter((entry) => entry.sourcePath?.startsWith("packages/seis-ai/plugins/")).length, 0);
    assert.ok(physical.some((entry) => entry.sourcePath === "plugins/seis-core/seis-workspace-inspector"));
    assert.ok(catalog.every((entry) => entry.sourcePath === null && entry.routeEligible === false && entry.implementationState === "catalog-contract"));

    const applicationSources = physical.filter((entry) => entry.sourcePath?.startsWith("plugins/seis-core/"));
    assert.equal(applicationSources.length, APP_PLUGIN_EXPANSION_TARGET);
    assert.ok(applicationSources.every((entry) => entry.publicMarketplace === false
      && entry.publicMarketplaceCard === false
      && entry.directMarketplaceCard === false
      && entry.marketplacePresentation === "retained-source-through-bundle-card"
      && entry.discoverableViaBundle === true
      && entry.bundleId?.startsWith("seis-application-bundle-")
      && entry.bundleInstallId === `${entry.bundleId}@seis-repo`
      && entry.canonicalInstallId === entry.bundleInstallId));
    assert.equal(new Set(applicationSources.map((entry) => entry.bundleId)).size, EXPECTED_APPLICATION_MARKETPLACE_PLUGIN_COUNT);
    assert.deepEqual(physical.filter((entry) => entry.publicMarketplace === true).map((entry) => entry.id), ["seis-ai-agent"]);
    assert.equal(physical.filter((entry) => entry.marketplacePresentation === "retained-root-source-in-canonical-orchestrator").length, 5);
  });

  it("exposes bounded AI Core status and search without enabling catalog execution", () => {
    const registry = readAiCorePluginRegistry(root);
    const status = aiCorePluginRegistryStatus(root, { query: "security", limit: 5 });

    assert.equal(status.ok, true);
    assert.equal(status.requestedPluginCount, 5000);
    assert.equal(status.registryEntryCount, 5000);
    assert.equal(status.physicalPluginCount, EXPECTED_PHYSICAL_PLUGIN_COUNT);
    assert.equal(status.catalogOnlyEntryCount, EXPECTED_CATALOG_ONLY_ENTRY_COUNT);
    assert.equal(status.appOwnedPluginCount, APP_PLUGIN_EXPANSION_TARGET);
    assert.equal(status.applicationPluginSourceRoot, "plugins/seis-core");
    assert.equal(status.applicationPluginManifest, "apps/seis-core/data/seis-core-plugin-sources.json");
    assert.equal(status.applicationPluginReleaseTrain, "content/development/seis-core-plugin-release-train.json");
    assert.equal(status.applicationPluginReleaseLabel, registry.applicationRelease.label);
    assert.equal(status.applicationPluginReleaseSemver, registry.applicationRelease.semver);
    assert.equal(status.applicationPluginReleaseMajor, registry.applicationRelease.major);
    assert.equal(status.applicationPluginReleaseRevision, registry.applicationRelease.revision);
    assert.equal(status.applicationPluginReleaseMicroUnits, registry.applicationRelease.microUnits);
    assert.equal(status.personalPluginCount, 55);
    assert.equal(status.personalRepoCounterpartCount, 55);
    assert.equal(status.publicMarketplacePluginCount, EXPECTED_PUBLIC_MARKETPLACE_PLUGIN_COUNT);
    assert.equal(status.migratedRootMarketplacePluginCount, EXPECTED_MIGRATED_ROOT_MARKETPLACE_PLUGIN_COUNT);
    assert.equal(status.applicationMarketplacePluginCount, EXPECTED_APPLICATION_MARKETPLACE_PLUGIN_COUNT);
    assert.equal(status.personalPluginCoveragePath, "content/development/seis-ai-core-personal-plugin-coverage.json");
    assert.equal(status.migration.personalMarketplaceMutation, false);
    assert.ok(status.matches.length <= 5);
    assert.equal(status.routeEligibleCount, APP_PLUGIN_EXPANSION_TARGET);
  });
});
