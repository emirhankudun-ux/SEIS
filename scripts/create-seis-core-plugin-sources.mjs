#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const sourceRoot = "plugins/seis-core";
const outputPath = "apps/seis-core/data/seis-core-plugin-sources.json";
const releaseTrainPath = "content/development/seis-core-plugin-release-train.json";
const registryPath = "content/development/seis-ai-core-plugin-registry.json";
const coveragePath = "content/development/seis-ai-core-personal-plugin-coverage.json";

const record = checkMode
  ? readJson(outputPath)
  : buildRecord();

validateRecord(record);

if (checkMode) {
  assertSame(outputPath, `${JSON.stringify(record, null, 2)}\n`);
  console.log("SEIS Command Center app plugin source check passed.");
} else {
  writeFile(outputPath, `${JSON.stringify(record, null, 2)}\n`);
  console.log(`Wrote ${outputPath} for ${record.pluginCount} app-owned plugins.`);
}

function buildRecord() {
  const absoluteRoot = path.join(root, ...sourceRoot.split("/"));
  const releaseTrain = readJson(releaseTrainPath);
  const plugins = listPluginNames(absoluteRoot).map((name) => {
    const pluginRoot = path.join(absoluteRoot, name);
    const manifest = readJson(path.join(pluginRoot, ".codex-plugin", "plugin.json"));
    const profile = readJson(path.join(pluginRoot, "assets", "plugin-profile.json"));
    return {
      id: manifest.id || manifest.name || name,
      name: manifest.name || name,
      version: manifest.version || null,
      releaseTrainVersion: profile.releaseTrainVersion || null,
      releaseMajor: profile.releaseMajor ?? null,
      releaseRevision: profile.releaseRevision ?? null,
      releaseMicroUnits: profile.releaseMicroUnits ?? null,
      sourcePath: `${sourceRoot}/${name}`,
      entrypoint: profile.entrypoint || null,
      status: profile.status || "review-required",
      implementationState: profile.implementationState || "manifest-only",
    };
  });

  return {
    schemaVersion: 1,
    id: "seis-core-plugin-sources",
    generatedAt: "2026-07-15",
    goalId: "SEIS-GOAL-021",
    status: "active-public-repository-boundary",
    owner: "apps/seis-core",
    releaseTrainPath,
    releaseTrainVersion: releaseTrain.currentRelease?.label || null,
    releaseSemver: releaseTrain.currentRelease?.semver || null,
    releaseKind: releaseTrain.currentRelease?.kind || null,
    releaseMajor: releaseTrain.currentRelease?.major ?? null,
    releaseRevision: releaseTrain.currentRelease?.revision ?? null,
    releaseMicroUnits: releaseTrain.currentRelease?.microUnits ?? null,
    application: {
      id: "seis-core",
      displayName: "SEIS Command Center",
      role: "public-repository-plugin-host",
      sourceExecution: "task-scoped-local-demo-only",
      publicAudience: "everyone",
      publicRepositoryAvailable: true,
      publicReleaseMode: "repo-source-public; live external capabilities approval-gated",
    },
    sourceRoot,
    pluginCount: plugins.length,
    plugins,
    coreBoundary: {
      package: "packages/seis-ai",
      owns: [
        "content/development/seis-ai-core-plugin-registry.json",
        "packages/seis-ai/src/lib/plugin-registry.mjs",
        "packages/seis-ai/src/lib/plugin-integration.mjs",
        "read-only metadata and permission contracts",
      ],
      personalPluginSourcePolicy: "No personal plugin source packages are owned under packages/seis-ai/plugins.",
    },
    registryProjection: registryPath,
    legacyCompatibilityCoverage: coveragePath,
    publicDistribution: {
      repository: "SEIS",
      marketplace: ".agents/plugins/marketplace.json",
      marketplaceName: "seis-repo",
      sourceRoot,
      audience: "everyone",
      directRepoSource: true,
      publicMarketplace: true,
      marketplaceEntryCount: plugins.length,
      separateMarketplaceCards: true,
      liveExternalCapabilities: "approval-gated",
    },
    activationPolicy: {
      mode: "task-scoped",
      defaultPermissions: { read: ["declared local SEIS scope"], write: [], network: [], secrets: [] },
      externalWrites: "disabled-by-default",
      humanApprovalRequiredFor: ["network", "secrets", "filesystem writes", "provider calls", "public release"],
    },
    safety: {
      sourceCodeExecutedDuringInventory: false,
      sourceCodeExecutedByThisManifest: false,
      publicRepositoryMutation: false,
      personalMarketplaceMutation: false,
      absoluteSourcePathsStored: false,
    },
    qualityGates: [
      "npm run check:seis-core-plugin-sources",
      "npm run check:seis-core-plugin-release",
      "npm run check:seis-core-plugin-release-policy",
      "npm run check:seis-core-plugin-catalog",
      "npm run check:seis-core-plugin-expansion",
      "npm run check:seis-core-plugin-audits",
      "npm run check:seis-core-plugin-release-readiness",
      "npm run check:seis-core-plugin-change-evidence",
      "npm run check:seis-core-plugin-matrix",
      "npm run check:seis-core-plugin-discovery",
      "npm run check:seis-core-marketplace-integrity",
      "npm run check:seis-core-public-distribution-audit",
      "npm run check:seis-core-trusted-marketplace",
      "npm run check:seis-public-install-state",
      "npm run check:seis-core-public-install-state",
      "npm run check:seis-public-install-evidence",
      "npm run check:seis-core-public-install-evidence",
      "npm run check:seis-public-runtime-status",
      "npm run check:seis-core-public-runtime-status",
      "npm run check:seis-mcp-permission",
      "npm run check:seis-core-mcp-permission",
      "npm run check:seis-focus-navigation-audit",
      "npm run check:seis-core-focus-navigation-audit",
      "npm run check:seis-ui-state-contract-audit",
      "npm run check:seis-core-ui-state-contract-audit",
      "npm run check:seis-project-manifest-audit",
      "npm run check:seis-core-project-manifest-audit",
      "npm run check:seis-core-requested-plugin-coverage",
      "npm run check:seis-core-plugin-surface",
      "npm run check:seis-core-plugin-public-repository",
      "npm run check:seis-ai-core-plugin-registry",
      "node --test plugins/seis-core/test/plugin-catalog.test.mjs",
      "npm test --prefix packages/seis-ai",
    ],
  };
}

function validateRecord(record) {
  const failures = [];
  const releaseTrain = readJson(releaseTrainPath);
  const currentRelease = releaseTrain.currentRelease || {};
  if (record?.id !== "seis-core-plugin-sources") failures.push("app plugin source manifest id is invalid");
  if (record?.owner !== "apps/seis-core") failures.push("app plugin source owner must be apps/seis-core");
  if (record?.releaseTrainPath !== releaseTrainPath) failures.push("app manifest must point to the app release train");
  if (record?.releaseTrainVersion !== currentRelease.label) failures.push("app manifest release label is stale");
  if (record?.releaseSemver !== currentRelease.semver) failures.push("app manifest release semver is stale");
  if (record?.releaseKind !== currentRelease.kind) failures.push("app manifest release kind is stale");
  if (record?.releaseMajor !== currentRelease.major) failures.push("app manifest release major is stale");
  if (record?.releaseRevision !== currentRelease.revision) failures.push("app manifest release revision is stale");
  if ((record?.releaseMicroUnits ?? null) !== (currentRelease.microUnits ?? null)) failures.push("app manifest release micro units are stale");
  if (record?.sourceRoot !== sourceRoot) failures.push("app plugin source root is invalid");
  if (record?.pluginCount !== APP_PLUGIN_EXPANSION_TARGET) failures.push(`app plugin source manifest must contain ${APP_PLUGIN_EXPANSION_TARGET} app-owned plugins`);
  if (!Array.isArray(record?.plugins) || record.plugins.length !== record.pluginCount) failures.push("app plugin source list is incomplete");
  if (new Set((record?.plugins || []).map((plugin) => plugin.name)).size !== record?.pluginCount) failures.push("app plugin names must be unique");
  if (record?.coreBoundary?.package !== "packages/seis-ai") failures.push("core boundary package is invalid");
  if (record?.coreBoundary?.personalPluginSourcePolicy?.includes("No personal plugin source") !== true) failures.push("core boundary must forbid personal source ownership");
  if (record?.registryProjection !== registryPath) failures.push("app manifest must point to the canonical registry projection");
  if (record?.legacyCompatibilityCoverage !== coveragePath) failures.push("app manifest must point to legacy compatibility coverage evidence");
  if (record?.status !== "active-public-repository-boundary") failures.push("app manifest must declare the public repository boundary");
  if (record?.application?.role !== "public-repository-plugin-host") failures.push("app manifest must declare the public repository host role");
  if (record?.application?.publicAudience !== "everyone") failures.push("app manifest public audience must be everyone");
  if (record?.application?.publicRepositoryAvailable !== true) failures.push("app manifest must mark app plugins as public-repository available");
  if (record?.publicDistribution?.directRepoSource !== true) failures.push("app manifest must mark direct repo source distribution");
  if (record?.publicDistribution?.marketplaceName !== "seis-repo") failures.push("app manifest must identify the public seis-repo marketplace");
  if (record?.publicDistribution?.publicMarketplace !== true) failures.push("app manifest must mark app packages as public marketplace entries");
  if (record?.publicDistribution?.marketplaceEntryCount !== record?.pluginCount) failures.push("app manifest marketplace count must match app plugin count");
  if (record?.publicDistribution?.separateMarketplaceCards !== true) failures.push("app manifest must expose one public repo marketplace card per app package");
  if (record?.activationPolicy?.defaultPermissions?.write?.length !== 0) failures.push("app plugin writes must be empty by default");
  if (record?.activationPolicy?.defaultPermissions?.network?.length !== 0) failures.push("app plugin network permissions must be empty by default");
  if (record?.activationPolicy?.defaultPermissions?.secrets?.length !== 0) failures.push("app plugin secret permissions must be empty by default");
  for (const plugin of record?.plugins || []) {
    if (!plugin.name || plugin.name !== plugin.id) failures.push(`${plugin.name || "plugin"}: id/name mismatch`);
    if (plugin.version !== currentRelease.semver) failures.push(`${plugin.name}: manifest version is stale`);
    if (plugin.releaseTrainVersion !== currentRelease.label) failures.push(`${plugin.name}: release train label is stale`);
    if (plugin.releaseMajor !== currentRelease.major) failures.push(`${plugin.name}: release major is stale`);
    if (plugin.releaseRevision !== currentRelease.revision) failures.push(`${plugin.name}: release revision is stale`);
    if ((plugin.releaseMicroUnits ?? null) !== (currentRelease.microUnits ?? null)) failures.push(`${plugin.name}: release micro units are stale`);
    if (!plugin.sourcePath?.startsWith(`${sourceRoot}/`) || plugin.sourcePath.includes("..")) failures.push(`${plugin.name}: source path escapes app root`);
  }
  const serialized = JSON.stringify(record);
  if (/\/Users\/|\/home\/|[A-Za-z]:\\/.test(serialized)) failures.push("app manifest must not store machine-specific paths");
  if (serialized.includes("packages/seis-ai/plugins/")) failures.push("app manifest must not point personal sources at the core plugin root");
  if (failures.length) {
    console.error("SEIS Command Center app plugin source validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function listPluginNames(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(directory, entry.name, ".codex-plugin", "plugin.json")))
    .map((entry) => entry.name)
    .sort();
}

function readJson(file) {
  const absolutePath = path.isAbsolute(file) ? file : path.join(root, file);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function writeFile(file, body) {
  const absolutePath = path.join(root, file);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, body);
}

function assertSame(file, expected) {
  const actualPath = path.join(root, file);
  const actual = fs.existsSync(actualPath) ? fs.readFileSync(actualPath, "utf8") : "";
  if (actual !== expected) {
    console.error(`${file} is out of date. Run: node scripts/create-seis-core-plugin-sources.mjs`);
    process.exit(1);
  }
}
