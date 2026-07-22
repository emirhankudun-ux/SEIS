export const WAVE_1_SELECTED_CAPABILITY = "seis-evidence-index";

export const HISTORICAL_WAVE_1_MARKETPLACE_SNAPSHOT = Object.freeze({
  observedAt: "2026-07-21",
  projectionModel: "direct-source-cards",
  marketplaceName: "seis-repo",
  marketplaceDisplayName: "SEIS Repo",
  publicCardCount: 377,
  canonicalOrchestratorCount: 1,
  migratedRootPluginCount: 5,
  applicationPluginCount: 71,
  topicPluginCount: 300,
  selectedCapability: WAVE_1_SELECTED_CAPABILITY,
  selectedCapabilityDirectCardCount: 1,
  immutableHistoricalEvidence: true,
  evidencePath: "docs/development/SEIS_PUBLIC_PLUGIN_WAVE_1_HANDOFF.md",
});

const CURRENT_CARD_COUNTS = Object.freeze({
  publicCardCount: 34,
  canonicalCardCount: 1,
  bundleCardCount: 33,
  applicationBundleCardCount: 6,
  topicBundleCardCount: 27,
});

const CURRENT_SOURCE_COUNTS = Object.freeze({
  rootSourceModuleCount: 5,
  applicationSourcePackageCount: 75,
  topicSourcePackageCount: 300,
  retainedSourcePackageCount: 380,
});

export function buildWave1MarketplaceCompatibility({
  marketplace,
  publicFamily,
  sourceManifest,
  bundleCatalog,
  selectedCapability = WAVE_1_SELECTED_CAPABILITY,
}) {
  assert(selectedCapability === WAVE_1_SELECTED_CAPABILITY, "selected capability is invalid");
  assert(marketplace?.name === "seis-repo", "current marketplace name is invalid");
  assert(marketplace?.interface?.displayName === "SEIS Repo", "current marketplace display name is invalid");
  assert(bundleCatalog?.marketplace?.name === "seis-repo", "bundle catalog marketplace identity is invalid");
  assert(publicFamily?.marketplace?.name === "seis-repo", "public family marketplace identity is invalid");

  const cards = list(marketplace.plugins);
  const sources = list(sourceManifest?.plugins);
  const bundles = list(bundleCatalog?.bundles);

  const expectedCardIdentities = [
    cardIdentity("seis-ai-agent", "./plugins/seis-ai-agent"),
    ...bundles.map((bundle) => cardIdentity(bundle?.id, bundle?.sourcePath)),
  ].sort();
  const actualCardIdentities = cards
    .map((card) => cardIdentity(card?.name, card?.source?.path, card?.source?.source))
    .sort();
  const familyCardIdentities = list(publicFamily.marketplace?.entries)
    .map((entry) => cardIdentity(entry?.name, entry?.sourcePath))
    .sort();
  assert(new Set(expectedCardIdentities).size === expectedCardIdentities.length, "bundle catalog card identities must be unique");
  assert(sameStrings(actualCardIdentities, expectedCardIdentities), "current marketplace card identities and source paths must equal the canonical card plus bundle catalog cards");
  assert(sameStrings(familyCardIdentities, expectedCardIdentities), "public family card identities and source paths must equal the current marketplace projection");

  const selectedApplicationCapability = resolveCurrentApplicationCapability({
    marketplace,
    sourceManifest,
    bundleCatalog,
    capabilityId: selectedCapability,
  });

  const applicationBundles = bundles.filter((bundle) => bundle?.family === "application");
  const topicBundles = bundles.filter((bundle) => bundle?.family === "topic");
  const applicationSourceNames = list(publicFamily.applicationPlugins).map((plugin) => plugin?.name).sort();
  const topicSourceNames = list(publicFamily.topicPlugins).map((plugin) => plugin?.name).sort();
  const manifestApplicationNames = sources.map((source) => source?.name).sort();
  const applicationBundleMemberNames = applicationBundles.flatMap((bundle) => list(bundle?.memberNames)).sort();
  const topicBundleMemberNames = topicBundles.flatMap((bundle) => list(bundle?.memberNames)).sort();

  assert(applicationBundles.length === CURRENT_CARD_COUNTS.applicationBundleCardCount, "current application bundle inventory is invalid");
  assert(topicBundles.length === CURRENT_CARD_COUNTS.topicBundleCardCount, "current topic bundle inventory is invalid");
  assert(bundles.every((bundle) => bundle?.memberCount === list(bundle?.memberNames).length), "bundle member counts must match their declared inventories");
  assertUnique(applicationSourceNames, "public family application source names must be unique");
  assertUnique(topicSourceNames, "public family topic source names must be unique");
  assertUnique(applicationBundleMemberNames, "application capabilities must occur exactly once across application bundle members");
  assertUnique(topicBundleMemberNames, "topic capabilities must occur exactly once across topic bundle members");
  assert(sameStrings(manifestApplicationNames, applicationSourceNames), "source manifest must equal the public family application source inventory");
  assert(sameStrings(applicationBundleMemberNames, applicationSourceNames), "application bundle members must equal the retained application source inventory");
  assert(sameStrings(topicBundleMemberNames, topicSourceNames), "topic bundle members must equal the retained topic source inventory");

  assertExactCounts(bundleCatalog.marketplace, CURRENT_CARD_COUNTS, "bundle catalog card");
  assertExactCounts(bundleCatalog.sourceCapabilityInventory, CURRENT_SOURCE_COUNTS, "bundle catalog source");
  assert(bundleCatalog.sourceCapabilityInventory?.sourcePackagesDeleted === false, "retained source packages must not be deleted");
  assert(cards.length === CURRENT_CARD_COUNTS.publicCardCount, "current marketplace card count is invalid");
  assert(list(bundleCatalog.bundles).length === CURRENT_CARD_COUNTS.bundleCardCount, "current bundle count is invalid");
  assert(publicFamily.marketplace?.publicPluginCount === CURRENT_CARD_COUNTS.publicCardCount, "public family card count is invalid");
  assert(publicFamily.marketplace?.canonicalOrchestratorCount === CURRENT_CARD_COUNTS.canonicalCardCount, "public family canonical-card count is invalid");
  assert(publicFamily.marketplace?.bundlePluginCount === CURRENT_CARD_COUNTS.bundleCardCount, "public family bundle-card count is invalid");
  assert(publicFamily.marketplace?.applicationBundlePluginCount === CURRENT_CARD_COUNTS.applicationBundleCardCount, "public family application-bundle count is invalid");
  assert(publicFamily.marketplace?.topicBundlePluginCount === CURRENT_CARD_COUNTS.topicBundleCardCount, "public family topic-bundle count is invalid");
  assert(publicFamily.marketplace?.migratedRootPluginCount === CURRENT_SOURCE_COUNTS.rootSourceModuleCount, "public family root-source count is invalid");
  assert(publicFamily.marketplace?.applicationPluginCount === CURRENT_SOURCE_COUNTS.applicationSourcePackageCount, "public family application-source count is invalid");
  assert(publicFamily.marketplace?.topicPluginCount === CURRENT_SOURCE_COUNTS.topicSourcePackageCount, "public family topic-source count is invalid");
  assert(publicFamily.marketplace?.sourceCapabilityCount === CURRENT_SOURCE_COUNTS.retainedSourcePackageCount, "public family retained-source count is invalid");
  assert(sourceManifest?.pluginCount === CURRENT_SOURCE_COUNTS.applicationSourcePackageCount, "source manifest application count is invalid");
  assert(sources.length === CURRENT_SOURCE_COUNTS.applicationSourcePackageCount, "source manifest application inventory is invalid");

  return {
    historicalWave1Snapshot: { ...HISTORICAL_WAVE_1_MARKETPLACE_SNAPSHOT },
    currentMarketplaceProjection: {
      observedAt: bundleCatalog.generatedAt || null,
      projectionModel: "curated-bundle-cards",
      marketplaceName: marketplace.name,
      marketplaceDisplayName: marketplace.interface.displayName,
      ...CURRENT_CARD_COUNTS,
      sourceCapabilityInventory: {
        ...CURRENT_SOURCE_COUNTS,
        sourcePackagesDeleted: false,
      },
      selectedApplicationCapability,
    },
  };
}

export function resolveCurrentApplicationCapability({
  marketplace,
  sourceManifest,
  bundleCatalog,
  capabilityId,
}) {
  assert(typeof capabilityId === "string" && capabilityId.length > 0, "application capability id is invalid");
  const cards = list(marketplace?.plugins);
  const sources = list(sourceManifest?.plugins);
  const bundles = list(bundleCatalog?.bundles);
  const sourceMatches = sources.filter((source) => source?.name === capabilityId);
  const directCardMatches = cards.filter((card) => card?.name === capabilityId);
  const memberOccurrences = bundles.flatMap((bundle) =>
    list(bundle?.memberNames)
      .filter((memberName) => memberName === capabilityId)
      .map(() => bundle));

  assert(sourceMatches.length === 1, "selected application capability must remain exactly once in the source manifest");
  assert(sourceMatches[0]?.sourcePath === `plugins/seis-core/${capabilityId}`, "selected application capability source path is invalid");
  assert(directCardMatches.length === 0, "selected application capability must not require a direct card in the curated projection");
  assert(memberOccurrences.length === 1, "selected application capability must occur exactly once across bundle members");

  const selectedBundle = memberOccurrences[0];
  assert(selectedBundle?.family === "application", "selected application capability must resolve through an application bundle");
  const selectedBundleCards = cards.filter((card) =>
    card?.name === selectedBundle.id
      && card?.source?.source === "local"
      && card?.source?.path === selectedBundle.sourcePath);
  assert(selectedBundleCards.length === 1, "selected application capability bundle must resolve to exactly one current marketplace card");

  return {
    id: capabilityId,
    retainedSource: true,
    sourcePath: sourceMatches[0].sourcePath,
    directMarketplaceCardRequired: false,
    directMarketplaceCardCount: directCardMatches.length,
    bundleCardCount: selectedBundleCards.length,
    bundleId: selectedBundle.id,
    bundleSourcePath: selectedBundle.sourcePath,
    bundleFamily: selectedBundle.family,
  };
}

function assertExactCounts(actual, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    assert(actual?.[key] === value, `${label} ${key} is invalid`);
  }
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function sameStrings(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function cardIdentity(name, sourcePath, sourceType = "local") {
  return JSON.stringify([name, sourceType, sourcePath]);
}

function assertUnique(values, message) {
  assert(new Set(values).size === values.length, message);
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS Wave 1 marketplace compatibility: ${message}`);
}
