#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-15";
const registryPath = "content/development/seis-ai-core-plugin-registry.json";
const targetCount = 5000;
const canonicalInstallId = "seis-ai-agent@seis-repo";
const sourceRoots = ["plugins", "plugins/seis-core"];
const applicationPluginSourceRoot = "plugins/seis-core";
const applicationPluginManifest = "apps/seis-core/data/seis-core-plugin-sources.json";
const releaseTrainPath = "content/development/seis-core-plugin-release-train.json";
const personalCoveragePath = "content/development/seis-ai-core-personal-plugin-coverage.json";
const marketplacePath = ".agents/plugins/marketplace.json";
const publicFamilyPath = "content/development/seis-public-plugin-family.json";
const marketplace = readJson(marketplacePath);
const publicFamily = readJson(publicFamilyPath);
const migratedRootPluginNames = new Set((publicFamily.migratedRootPlugins || []).map((plugin) => plugin.name));

const domains = `
workspace project repository branch commit pull-request issue discussion goal task evidence risk validation roadmap decision architecture contract schema migration backup rollback file vfs storage document chunk collection citation knowledge memory retrieval ontology taxonomy prompt context provider model capability route agent agent-run task-run handoff workflow workflow-run trigger condition approval tool skill mcp plugin connector integration secret-reference permission policy security-event audit telemetry metric trace log cost latency evaluation benchmark dataset design-token component icon asset template theme localization notification release channel artifact license provenance compliance incident feature-flag configuration environment platform-adapter cloud ssh dependency supply-chain accessibility performance-budget local-app technology source media rights public-private-boundary plugin-marketplace extension-sdk ai-core
`.trim().split(/\s+/);

const operations = `
inspect validate audit plan explain inventory compare trace project recover classify index search summarize benchmark simulate lint diff map score review redact migrate rollback route budget verify catalog govern observe measure evaluate export import normalize reconcile provenance permission approval fallback localize accessibility performance security dependency release backup restore handoff evidence
`.trim().split(/\s+/);

const registry = buildRegistry();

if (checkMode) {
  assertSame(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  validateRegistry(registry);
  console.log("SEIS AI Core plugin registry check passed.");
} else {
  writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  validateRegistry(registry);
  console.log(`Wrote ${registryPath} with ${registry.entries.length} entries.`);
}

function buildRegistry() {
  const physicalEntries = discoverPhysicalPlugins();
  const personalCoverage = readJson(personalCoveragePath);
  const releaseTrain = readJson(releaseTrainPath);
  const currentRelease = releaseTrain.currentRelease || {};
  if (physicalEntries.length >= targetCount) {
    throw new Error(`Physical plugin source count ${physicalEntries.length} leaves no room for the ${targetCount}-entry catalog target.`);
  }

  const catalogEntries = [];
  const occupiedSlugs = new Set(physicalEntries.map((entry) => entry.slug));
  let sequence = 1;
  for (const domain of domains) {
    for (const operation of operations) {
      if (catalogEntries.length >= targetCount - physicalEntries.length) break;
      const slug = `seis-${domain}-${operation}`;
      if (occupiedSlugs.has(slug)) continue;
      occupiedSlugs.add(slug);
      catalogEntries.push(createCatalogEntry({ domain, operation, sequence }));
      sequence += 1;
    }
    if (catalogEntries.length >= targetCount - physicalEntries.length) break;
  }

  if (catalogEntries.length < targetCount - physicalEntries.length) {
    throw new Error(`Taxonomy generated ${catalogEntries.length} catalog entries; ${targetCount - physicalEntries.length} are required.`);
  }

  const entries = [...physicalEntries, ...catalogEntries];
  return {
    schemaVersion: 1,
    id: "seis-ai-core-plugin-registry",
    generatedAt,
    goalId: "SEIS-GOAL-021",
    status: "active-repo-canonical",
    maturity: "catalog-and-local-demo-foundation",
    applicationRelease: {
      releaseTrainPath,
      label: currentRelease.label || null,
      semver: currentRelease.semver || null,
      kind: currentRelease.kind || null,
      major: currentRelease.major ?? null,
      revision: currentRelease.revision ?? null,
      microUnits: currentRelease.microUnits ?? null,
      scope: applicationPluginSourceRoot,
      pluginCount: physicalEntries.filter((entry) => entry.sourcePath.startsWith(`${applicationPluginSourceRoot}/`)).length,
    },
    purpose:
      "Keep every SEIS AI plugin record in the public SEIS repository and expose a deterministic 5000-entry capability catalog to the AI Core without creating 5000 artificial source folders. Public app plugin source packages remain owned by the SEIS Command Center application.",
    canonicalOwnership: {
      repository: "SEIS",
      repositoryRole: "canonical-source-of-truth",
      registryPath,
      runtimePackage: "packages/seis-ai",
      runtimeEntryPoint: "packages/seis-ai/src/lib/plugin-registry.mjs",
      coreSourcePolicy: "packages/seis-ai owns registry, contracts, permission policy, and read-only inspection; it does not own public app plugin source packages",
      applicationPluginSourceRoot,
      applicationPluginManifest,
      applicationPluginReleaseTrain: releaseTrainPath,
      applicationPluginReleaseLabel: currentRelease.label || null,
      applicationPluginReleaseSemver: currentRelease.semver || null,
      applicationPluginReleaseMajor: currentRelease.major ?? null,
      applicationPluginReleaseRevision: currentRelease.revision ?? null,
      applicationPluginReleaseMicroUnits: currentRelease.microUnits ?? null,
      personalPluginCoverage: personalCoveragePath,
      orchestrator: canonicalInstallId,
      publicMarketplacePolicy: "seis-ai-agent-is-the-canonical-orchestrator-and-migrated-root-app-and-topic-sources-are-public-seis-repo-marketplace-packages",
      publicMarketplacePath: marketplacePath,
      publicRepositoryAvailable: true,
      publicAudience: "everyone",
    },
    target: {
      requestedPluginCount: targetCount,
      registryEntryCount: entries.length,
      physicalPluginCount: physicalEntries.length,
      appOwnedPluginCount: physicalEntries.filter((entry) => entry.sourcePath.startsWith(`${applicationPluginSourceRoot}/`)).length,
      appReleaseLabel: currentRelease.label || null,
      appReleaseSemver: currentRelease.semver || null,
      appReleaseMajor: currentRelease.major ?? null,
      appReleaseRevision: currentRelease.revision ?? null,
      appReleaseMicroUnits: currentRelease.microUnits ?? null,
      catalogOnlyEntryCount: catalogEntries.length,
      functionalLocalDemoCount: physicalEntries.filter((entry) => entry.implementationState === "functional-local-demo").length,
      publicMarketplacePluginCount: marketplace.plugins.length,
      migratedRootMarketplacePluginCount: migratedRootPluginNames.size,
      applicationMarketplacePluginCount: physicalEntries.filter((entry) => entry.sourcePath.startsWith(`${applicationPluginSourceRoot}/`)).length,
      publicRepositoryPluginCount: physicalEntries.filter((entry) => entry.sourcePath.startsWith(`${applicationPluginSourceRoot}/`)).length,
      personalPluginCount: personalCoverage.personalMarketplace?.pluginCount ?? null,
      personalRepoCounterpartCount: personalCoverage.repository?.counterpartCount ?? null,
      countRule: "registryEntryCount must equal requestedPluginCount; physical and catalog-only states must remain distinct",
    },
    sourceRoots,
    migration: {
      sourceClass: "public-repository-plugin-source",
      destinationRoot: applicationPluginSourceRoot,
      destinationOwner: "apps/seis-core",
      applicationPluginManifest,
      migratedOn: generatedAt,
      migratedPluginCount: physicalEntries.filter((entry) => entry.sourcePath.startsWith(`${applicationPluginSourceRoot}/`)).length,
      legacyCompatibilityCount: personalCoverage.personalMarketplace?.pluginCount ?? null,
      legacyRepoCounterpartCount: personalCoverage.repository?.counterpartCount ?? null,
      legacyCompatibilityCoveragePath: personalCoveragePath,
      personalPluginCount: personalCoverage.personalMarketplace?.pluginCount ?? null,
      personalRepoCounterpartCount: personalCoverage.repository?.counterpartCount ?? null,
      personalPluginCoveragePath: personalCoveragePath,
      personalMarketplaceMutation: false,
      migratedRootMarketplacePluginCount: migratedRootPluginNames.size,
      sourceCodeExecutedDuringMigration: false,
      copiedSecrets: false,
      publicReleaseAllowed: false,
      licensePolicy:
        "Public app packages use MIT metadata; live external capability release remains separately approval-gated.",
    },
    catalogModel: {
      recordType: "capability-plugin-slot",
      generatedFrom: "SEIS master prompt plugin, registry, team, and technology ontology terms",
      domainCount: domains.length,
      operationCount: operations.length,
      generationRule: "domain x operation combinations are deterministic; physical repo plugins take precedence; catalog entries are plan-only until implemented and validated.",
      catalogExecution: "not-route-eligible",
      catalogSource: "generated-SEIS-catalog",
    },
    security: {
      defaultPrivacyClass: "public-safe-metadata",
      defaultPermissions: { read: ["bounded SEIS repository metadata"], write: [], network: [], secrets: [] },
      externalWrites: "disabled-by-default",
      credentials: "not stored in the registry",
      approvalRequiredFor: ["network", "secrets", "filesystem writes", "external writes", "provider calls", "public release"],
    },
    qualityGates: [
      "npm run check:seis-ai-core-plugin-registry",
      "npm run check:seis-ai-personal-plugin-coverage",
      "npm run check:seis-ai-core-plugin-sources",
      "npm run check:seis-core-plugin-release",
      "npm test --prefix packages/seis-ai",
      "git diff --check",
    ],
    entries,
  };
}

function discoverPhysicalPlugins() {
  const records = [];
  const seen = new Set();
  for (const sourceRoot of sourceRoots) {
    const absoluteRoot = path.join(root, sourceRoot);
    if (!fs.existsSync(absoluteRoot)) continue;
    for (const entry of fs.readdirSync(absoluteRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory()) continue;
      const sourcePath = path.join(sourceRoot, entry.name).split(path.sep).join("/");
      const manifestPath = path.join(root, sourcePath, ".codex-plugin", "plugin.json");
      if (!fs.existsSync(manifestPath)) continue;
      const manifest = readJson(manifestPath);
      const id = manifest.id || manifest.name || entry.name;
      if (seen.has(id)) throw new Error(`Duplicate physical plugin id: ${id}`);
      seen.add(id);
      records.push(createPhysicalEntry({ sourcePath, manifest }));
    }
  }
  return records.sort((a, b) => a.id.localeCompare(b.id));
}

function createPhysicalEntry({ sourcePath, manifest }) {
  const profilePath = path.join(root, sourcePath, "assets", "plugin-profile.json");
  const profile = fs.existsSync(profilePath) ? readJson(profilePath) : null;
  const mcpPath = path.join(root, sourcePath, ".mcp.json");
  const mcp = fs.existsSync(mcpPath) ? readJson(mcpPath) : null;
  const implementationState = profile?.implementationState || "repository-source-module";
  const license = profile?.license ?? manifest.license ?? null;
  const isApplicationPlugin = sourcePath.startsWith(`${applicationPluginSourceRoot}/`);
  const isMigratedRootPlugin = migratedRootPluginNames.has(manifest.name || manifest.id);
  return {
    recordType: "physical-repo-plugin",
    id: manifest.id || manifest.name,
    slug: manifest.name,
    displayName: manifest.interface?.displayName || manifest.name,
    description: manifest.description || "SEIS repository-owned plugin source.",
    version: manifest.version || "0.0.0",
    ...(isApplicationPlugin
      ? {
          releaseTrainVersion: profile?.releaseTrainVersion || null,
          releaseSemver: manifest.version || null,
          releaseMajor: profile?.releaseMajor ?? null,
          releaseRevision: profile?.releaseRevision ?? null,
          releaseMicroUnits: profile?.releaseMicroUnits ?? null,
        }
      : {}),
    category: profile?.category || manifest.interface?.category || "Developer",
    owner: profile?.owner || "@seis-ai-agent",
    publisher: manifest.author?.name || profile?.publisher || "SEIS",
    sourceClassification: profile?.sourceClassification || "repository-owned-source-module",
    license,
    status: profile?.status || "repo-source-module",
    implementationState,
    availability: implementationState === "functional-local-demo" ? "local-demo" : "source-module",
    sourcePath,
    entrypoint: profile?.entrypoint || null,
    canonicalInstallId: isApplicationPlugin || isMigratedRootPlugin ? `${manifest.name || manifest.id}@seis-repo` : canonicalInstallId,
    publicMarketplace: sourcePath === "plugins/seis-ai-agent" || ((isApplicationPlugin || isMigratedRootPlugin) && license === "MIT"),
    publicRepositoryAvailable: (isApplicationPlugin || isMigratedRootPlugin) && license === "MIT",
    publicAudience: isApplicationPlugin || isMigratedRootPlugin ? "everyone" : null,
    routeEligible: implementationState === "functional-local-demo" && license === "MIT",
    permissions: profile?.permissions || { read: ["declared local SEIS scope"], write: [], network: [], secrets: [] },
    privacyClass: "repo-internal-public-safe-boundary",
    riskClass: license === "MIT" ? "low" : "review-required",
    validation: profile?.validation || ["npm run check:seis-ai-core-plugin-registry"],
    rollback: profile?.rollback || "Disable the registry record or revert the repository source-module commit.",
    reviewState: profile?.reviewState || "repository-source-review",
    provenance: sourcePath.startsWith(`${applicationPluginSourceRoot}/`)
      ? "Public SEIS repository source owned by the SEIS Command Center application boundary."
      : "SEIS repository-owned source module.",
    relatedGoalIds: ["SEIS-GOAL-021"],
    declaredMcpServerCount: Object.keys(mcp?.mcpServers || {}).length,
  };
}

function createCatalogEntry({ domain, operation, sequence }) {
  const id = `seis-ai-catalog-${String(sequence).padStart(4, "0")}`;
  const slug = `seis-${domain}-${operation}`;
  return {
    recordType: "capability-plugin-slot",
    id,
    slug,
    displayName: `SEIS ${titleCase(domain)} ${titleCase(operation)}`,
    description: `Plan-only ${operation} capability for the ${domain} registry surface in SEIS AI Core.`,
    version: "0.1.0-catalog",
    category: categoryFor(domain),
    owner: ownerFor(domain),
    publisher: "SEIS",
    sourceClassification: "generated-SEIS-catalog",
    license: "SEIS-CATALOG-INTERNAL",
    status: "cataloged",
    implementationState: "catalog-contract",
    availability: "plan-only",
    sourcePath: null,
    entrypoint: "packages/seis-ai/src/lib/plugin-registry.mjs",
    canonicalInstallId,
    publicMarketplace: false,
    routeEligible: false,
    permissions: { read: ["bounded SEIS registry metadata"], write: [], network: [], secrets: [] },
    privacyClass: "public-safe-metadata",
    riskClass: riskFor(domain),
    validation: ["npm run check:seis-ai-core-plugin-registry", "SEIS-Agent catalog status review"],
    rollback: "Disable or remove this catalog record before implementation; no runtime capability is enabled by catalog presence.",
    reviewState: "catalog-review-required",
    provenance: "Generated from the SEIS master prompt taxonomy; not evidence of an implemented or connected plugin.",
    relatedGoalIds: ["SEIS-GOAL-021"],
    declaredMcpServerCount: 0,
    domain,
    operation,
  };
}

function categoryFor(domain) {
  if (["design-token", "component", "icon", "asset", "template", "theme", "localization", "accessibility", "performance-budget", "media", "rights"].includes(domain)) return "Design and Experience";
  if (["provider", "model", "capability", "route", "agent", "prompt", "context", "memory", "retrieval", "evaluation", "benchmark", "tool", "skill", "mcp", "plugin", "connector", "ai-core", "model-fallback"].includes(domain)) return "AI Core";
  if (["secret-reference", "permission", "policy", "security-event", "audit", "license", "provenance", "compliance", "supply-chain", "public-private-boundary", "ssh"].includes(domain)) return "Security and Governance";
  if (["document", "chunk", "collection", "citation", "knowledge", "ontology", "taxonomy", "dataset", "source", "technology"].includes(domain)) return "Knowledge and Data";
  if (["cloud", "dependency", "platform-adapter", "configuration", "environment", "storage", "vfs", "backup", "rollback", "release", "channel", "artifact"].includes(domain)) return "Platform and Delivery";
  return "SEIS Core";
}

function ownerFor(domain) {
  if (["workspace", "project", "repository", "branch", "commit", "pull-request", "issue", "discussion", "goal", "task", "evidence", "risk", "validation", "roadmap"].includes(domain)) return "@seis-governance";
  if (["provider", "model", "capability", "route", "agent", "agent-run", "task-run", "handoff", "prompt", "context", "memory", "evaluation", "model-fallback", "ai-core"].includes(domain)) return "@seis-ai-agent";
  if (["document", "chunk", "collection", "citation", "knowledge", "retrieval", "ontology", "taxonomy", "dataset", "source", "technology"].includes(domain)) return "@seis-knowledge";
  if (["tool", "skill", "mcp", "plugin", "connector", "integration", "plugin-marketplace", "extension-sdk"].includes(domain)) return "@seis-mcp";
  if (["secret-reference", "permission", "policy", "security-event", "audit", "license", "provenance", "compliance", "supply-chain", "public-private-boundary", "ssh"].includes(domain)) return "@seis-security";
  if (["design-token", "component", "icon", "asset", "template", "theme", "localization", "accessibility", "performance-budget", "media", "rights"].includes(domain)) return "@seis-design";
  if (["workflow", "workflow-run", "trigger", "condition", "approval", "feature-flag", "notification"].includes(domain)) return "@seis-automation";
  if (["cloud", "platform-adapter", "environment", "dependency", "storage", "vfs", "backup", "rollback", "release", "channel", "artifact"].includes(domain)) return "@seis-platform";
  return "@seis-architecture";
}

function riskFor(domain) {
  return ["secret-reference", "permission", "policy", "security-event", "mcp", "plugin", "connector", "integration", "cloud", "ssh", "public-private-boundary", "supply-chain", "license", "provenance"].includes(domain)
    ? "medium"
    : "low";
}

function titleCase(value) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function validateRegistry(record) {
  const failures = [];
  if (record.id !== "seis-ai-core-plugin-registry") failures.push("invalid registry id");
  if (record.goalId !== "SEIS-GOAL-021") failures.push("registry must bind to SEIS-GOAL-021");
  const releaseTrain = readJson(releaseTrainPath);
  const currentRelease = releaseTrain.currentRelease || {};
  if (record.applicationRelease?.releaseTrainPath !== releaseTrainPath) failures.push("registry must point to the app release train");
  if (record.applicationRelease?.label !== currentRelease.label) failures.push("registry app release label is stale");
  if (record.applicationRelease?.semver !== currentRelease.semver) failures.push("registry app release semver is stale");
  if (record.applicationRelease?.major !== currentRelease.major) failures.push("registry app release major is stale");
  if (record.applicationRelease?.revision !== currentRelease.revision) failures.push("registry app release revision is stale");
  if ((record.applicationRelease?.microUnits ?? null) !== (currentRelease.microUnits ?? null)) failures.push("registry app release micro units are stale");
  if (record.target.requestedPluginCount !== targetCount) failures.push(`target must remain ${targetCount}`);
  if (record.target.registryEntryCount !== targetCount) failures.push(`registry must contain exactly ${targetCount} entries`);
  if (record.entries.length !== targetCount) failures.push(`entries length must equal ${targetCount}`);
  if (new Set(record.entries.map((entry) => entry.id)).size !== targetCount) failures.push("plugin ids must be unique");
  if (new Set(record.entries.map((entry) => entry.slug)).size !== targetCount) failures.push("plugin slugs must be unique");
  if (record.target.catalogOnlyEntryCount + record.target.physicalPluginCount !== targetCount) failures.push("physical and catalog counts must add to target");
  if (record.target.publicMarketplacePluginCount !== marketplace.plugins.length) failures.push("registry public marketplace plugin count is stale");
  if (record.target.migratedRootMarketplacePluginCount !== migratedRootPluginNames.size || migratedRootPluginNames.size !== 5) failures.push("registry migrated root marketplace package count is stale");
  if (record.target.applicationMarketplacePluginCount !== APP_PLUGIN_EXPANSION_TARGET) failures.push("registry app marketplace plugin count is stale");
  if (record.target.publicRepositoryPluginCount !== APP_PLUGIN_EXPANSION_TARGET) failures.push("registry public repository plugin count is stale");
  if (record.canonicalOwnership?.publicRepositoryAvailable !== true) failures.push("registry must mark the public repository source boundary");
  if (record.canonicalOwnership?.publicAudience !== "everyone") failures.push("registry public audience must be everyone");
  if (record.target.appOwnedPluginCount !== APP_PLUGIN_EXPANSION_TARGET) failures.push("registry app-owned plugin count is stale");
  if (record.target.appReleaseLabel !== currentRelease.label) failures.push("registry target app release label is stale");
  if (record.target.appReleaseSemver !== currentRelease.semver) failures.push("registry target app release semver is stale");
  if (record.target.appReleaseMajor !== currentRelease.major) failures.push("registry target app release major is stale");
  if (record.target.appReleaseRevision !== currentRelease.revision) failures.push("registry target app release revision is stale");
  if ((record.target.appReleaseMicroUnits ?? null) !== (currentRelease.microUnits ?? null)) failures.push("registry target app release micro units are stale");
  if (record.target.personalPluginCount !== 55 || record.target.personalRepoCounterpartCount !== 55) failures.push("registry must preserve 55 personal plugins with 55 repository counterparts");
  if (record.migration?.personalPluginCount !== 55 || record.migration?.personalRepoCounterpartCount !== 55) failures.push("migration metadata must preserve complete personal plugin coverage");
  if (record.migration?.personalPluginCoveragePath !== personalCoveragePath) failures.push("migration metadata must point to the personal coverage artifact");
  for (const entry of record.entries) {
    if (!entry.id || !entry.slug || !entry.owner || !entry.status || !entry.implementationState) failures.push(`${entry.id || "entry"} is missing identity/state fields`);
    if (entry.recordType === "capability-plugin-slot" && (entry.sourcePath !== null || entry.routeEligible === true || entry.implementationState !== "catalog-contract")) failures.push(`${entry.id} catalog slot is overstated`);
    if (typeof entry.sourcePath === "string" && (entry.sourcePath.startsWith("/") || entry.sourcePath.includes(".."))) failures.push(`${entry.id} leaks an absolute or parent source path`);
    if (entry.sourcePath?.startsWith(`${applicationPluginSourceRoot}/`)) {
      if (entry.releaseTrainVersion !== currentRelease.label) failures.push(`${entry.id} app release label is stale`);
      if (entry.releaseSemver !== currentRelease.semver) failures.push(`${entry.id} app release semver is stale`);
      if (entry.releaseMajor !== currentRelease.major) failures.push(`${entry.id} app release major is stale`);
      if (entry.releaseRevision !== currentRelease.revision) failures.push(`${entry.id} app release revision is stale`);
      if ((entry.releaseMicroUnits ?? null) !== (currentRelease.microUnits ?? null)) failures.push(`${entry.id} app release micro units are stale`);
    } else if (entry.recordType === "capability-plugin-slot") {
      if (Object.prototype.hasOwnProperty.call(entry, "releaseTrainVersion")) failures.push(`${entry.id} catalog slot must not carry an app release label`);
      if (Object.prototype.hasOwnProperty.call(entry, "releaseSemver")) failures.push(`${entry.id} catalog slot must not carry an app release semver`);
      if (Object.prototype.hasOwnProperty.call(entry, "releaseMajor")) failures.push(`${entry.id} catalog slot must not carry an app release major`);
      if (Object.prototype.hasOwnProperty.call(entry, "releaseRevision")) failures.push(`${entry.id} catalog slot must not carry an app release revision`);
      if (Object.prototype.hasOwnProperty.call(entry, "releaseMicroUnits")) failures.push(`${entry.id} catalog slot must not carry app release micro units`);
    }
  }
  if (failures.length) {
    console.error("SEIS AI Core plugin registry validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function readJson(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
  fs.writeFileSync(path.join(root, filePath), content);
}

function assertSame(filePath, expected) {
  const actualPath = path.join(root, filePath);
  const actual = fs.existsSync(actualPath) ? fs.readFileSync(actualPath, "utf8") : "";
  if (actual !== expected) {
    console.error(`${filePath} is out of date. Run: npm run automation:seis-ai-core-plugin-registry`);
    process.exit(1);
  }
}
