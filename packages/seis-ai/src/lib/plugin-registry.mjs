import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const AI_CORE_PLUGIN_REGISTRY_PATH = "content/development/seis-ai-core-plugin-registry.json";
export const AI_CORE_PLUGIN_REGISTRY_STATUS_TOOL = "seis_ai_core_plugin_registry_status";
export const AI_CORE_PLUGIN_REGISTRY_RESOURCE_URI = "seis://ai/plugin-registry.json";
export const AI_CORE_PLUGIN_REGISTRY_TARGET_COUNT = 5000;

export function readAiCorePluginRegistry(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_PLUGIN_REGISTRY_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS AI Core plugin registry is missing: ${AI_CORE_PLUGIN_REGISTRY_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function aiCorePluginRegistryStatus(repoRoot, options = {}) {
  try {
    const registry = readAiCorePluginRegistry(repoRoot);
    const entries = Array.isArray(registry.entries) ? registry.entries : [];
    const query = typeof options.query === "string" ? options.query.trim().toLowerCase() : "";
    const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
    const matches = query
      ? entries.filter((entry) => [
          entry.id,
          entry.slug,
          entry.displayName,
          entry.description,
          entry.category,
          entry.owner,
          entry.domain,
          entry.operation,
        ].some((value) => String(value || "").toLowerCase().includes(query)))
      : [];
    const physical = entries.filter((entry) => entry.recordType === "physical-repo-plugin");
    const catalog = entries.filter((entry) => entry.recordType === "capability-plugin-slot");
    const statusCounts = entries.reduce((counts, entry) => {
      counts[entry.implementationState] = (counts[entry.implementationState] || 0) + 1;
      return counts;
    }, {});
    const payload = {
      ok: true,
      registryPath: AI_CORE_PLUGIN_REGISTRY_PATH,
      resourceUri: AI_CORE_PLUGIN_REGISTRY_RESOURCE_URI,
      id: registry.id,
      goalId: registry.goalId,
      status: registry.status,
      maturity: registry.maturity,
      canonicalOwner: registry.canonicalOwnership?.repository || "SEIS",
      canonicalSourcePath: registry.canonicalOwnership?.runtimePackage || "packages/seis-ai",
      canonicalInstallId: registry.canonicalOwnership?.orchestrator || "seis-ai-agent@seis-repo",
      requestedPluginCount: registry.target?.requestedPluginCount ?? null,
      registryEntryCount: entries.length,
      physicalPluginCount: physical.length,
      appOwnedPluginCount: registry.target?.appOwnedPluginCount ?? null,
      catalogOnlyEntryCount: catalog.length,
      functionalLocalDemoCount: registry.target?.functionalLocalDemoCount ?? null,
      publicMarketplacePluginCount: registry.target?.publicMarketplacePluginCount ?? null,
      migratedRootMarketplacePluginCount: registry.target?.migratedRootMarketplacePluginCount ?? null,
      applicationMarketplacePluginCount: registry.target?.applicationMarketplacePluginCount ?? null,
      personalPluginCoveragePath: registry.canonicalOwnership?.personalPluginCoverage || null,
      personalPluginCount: registry.target?.personalPluginCount ?? null,
      personalRepoCounterpartCount: registry.target?.personalRepoCounterpartCount ?? null,
      applicationPluginSourceRoot: registry.canonicalOwnership?.applicationPluginSourceRoot || null,
      applicationPluginManifest: registry.canonicalOwnership?.applicationPluginManifest || null,
      applicationPluginReleaseTrain: registry.canonicalOwnership?.applicationPluginReleaseTrain || null,
      applicationPluginReleaseLabel: registry.applicationRelease?.label || registry.canonicalOwnership?.applicationPluginReleaseLabel || null,
      applicationPluginReleaseSemver: registry.applicationRelease?.semver || registry.canonicalOwnership?.applicationPluginReleaseSemver || null,
      applicationPluginReleaseKind: registry.applicationRelease?.kind || null,
      applicationPluginReleaseMajor: registry.applicationRelease?.major ?? null,
      applicationPluginReleaseRevision: registry.applicationRelease?.revision ?? null,
      applicationPluginReleaseMicroUnits: registry.applicationRelease?.microUnits ?? null,
      coreSourcePolicy: registry.canonicalOwnership?.coreSourcePolicy || null,
      publicMarketplacePolicy: registry.canonicalOwnership?.publicMarketplacePolicy || null,
      statusCounts,
      routeEligibleCount: entries.filter((entry) => entry.routeEligible === true).length,
      defaultPermissions: registry.security?.defaultPermissions || null,
      sourceRoots: registry.sourceRoots || [],
      migration: registry.migration
        ? {
            destinationRoot: registry.migration.destinationRoot,
            destinationOwner: registry.migration.destinationOwner,
            migratedPluginCount: registry.migration.migratedPluginCount,
            personalMarketplaceMutation: registry.migration.personalMarketplaceMutation === true,
            publicReleaseAllowed: registry.migration.publicReleaseAllowed === true,
          }
        : null,
      physicalPlugins: physical.slice(0, limit).map(compactEntry),
      catalogSamples: catalog.slice(0, Math.min(5, limit)).map(compactEntry),
    };
    if (query) {
      payload.query = query;
      payload.matchCount = matches.length;
      payload.matches = matches.slice(0, limit).map(compactEntry);
    }
    if (options.includeFullRegistry === true) payload.registry = registry;
    return payload;
  } catch (error) {
    return {
      ok: false,
      registryPath: AI_CORE_PLUGIN_REGISTRY_PATH,
      error: error.message,
    };
  }
}

function compactEntry(entry) {
  return {
    id: entry.id,
    slug: entry.slug,
    displayName: entry.displayName,
    category: entry.category,
    owner: entry.owner,
    status: entry.status,
    implementationState: entry.implementationState,
    availability: entry.availability,
    sourcePath: entry.sourcePath,
    releaseTrainVersion: entry.releaseTrainVersion || null,
    releaseSemver: entry.releaseSemver || null,
    releaseMajor: entry.releaseMajor ?? null,
    releaseRevision: entry.releaseRevision ?? null,
    releaseMicroUnits: entry.releaseMicroUnits ?? null,
    routeEligible: entry.routeEligible === true,
    permissions: entry.permissions,
    riskClass: entry.riskClass,
    domain: entry.domain || null,
    operation: entry.operation || null,
  };
}
