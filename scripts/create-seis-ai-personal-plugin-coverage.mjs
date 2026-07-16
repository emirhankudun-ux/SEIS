#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const outputPath = "content/development/seis-ai-core-personal-plugin-coverage.json";
const applicationSourceRoot = "plugins/seis-core";
const sourceRootOption = readOption("--source");
const marketplaceOption = readOption("--marketplace");

let coverage;
if (sourceRootOption && marketplaceOption) {
  coverage = buildCoverage(path.resolve(sourceRootOption), path.resolve(marketplaceOption));
} else if (checkMode) {
  coverage = readJson(path.join(root, outputPath));
} else {
  console.error("Usage: node scripts/create-seis-ai-personal-plugin-coverage.mjs --source <selected-local-plugin-root> --marketplace <personal-marketplace.json> [--check]");
  process.exit(2);
}

validateCoverage(coverage);

if (checkMode) {
  if (sourceRootOption && marketplaceOption) assertSame(outputPath, `${JSON.stringify(coverage, null, 2)}\n`);
  console.log("SEIS AI personal plugin coverage check passed.");
} else {
  writeFile(outputPath, `${JSON.stringify(coverage, null, 2)}\n`);
  console.log(`Wrote ${outputPath} for ${coverage.personalMarketplace.pluginCount} personal SEIS plugins.`);
}

function buildCoverage(sourceRoot, marketplacePath) {
  if (!fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) {
    throw new Error(`Selected plugin root does not exist or is not a directory: ${sourceRoot}`);
  }
  const marketplace = readJson(marketplacePath);
  const personalNames = uniqueSeisNames(marketplace.plugins || []);
  const sourceNames = listPluginNames(sourceRoot);
  const applicationNames = listPluginNames(path.join(root, ...applicationSourceRoot.split("/")));
  const applicationOnlyNames = applicationNames.filter((name) => !personalNames.includes(name));
  const repoNames = new Set([...listPluginNames(path.join(root, "plugins")), ...applicationNames]);
  const overlapNames = personalNames.filter((name) => listPluginNames(path.join(root, "plugins")).includes(name));
  const applicationOwnedNames = personalNames.filter((name) => applicationNames.includes(name));
  const missingRepoCounterparts = personalNames.filter((name) => !repoNames.has(name));
  const unlistedSourcePlugins = sourceNames.filter((name) => !personalNames.includes(name));
  const missingSourcePlugins = personalNames.filter((name) => !sourceNames.includes(name));

  return {
    schemaVersion: 1,
    id: "seis-ai-core-personal-plugin-coverage",
    generatedAt: "2026-07-15",
    goalId: "SEIS-GOAL-021",
    status: "verified-repo-counterparts",
    sourceBoundary: {
      marketplaceName: "personal",
      sourceClass: "selected-local-readonly",
      sourcePathsRedacted: true,
      sourceCodeExecutedDuringAudit: false,
      personalMarketplaceMutation: false,
    },
    personalMarketplace: {
      pluginCount: personalNames.length,
      pluginIds: personalNames,
    },
    personalSourceRoot: {
      pluginCount: sourceNames.length,
      pluginIds: sourceNames,
      missingFromSourceRoot: missingSourcePlugins,
      unlistedSourcePlugins,
    },
    repository: {
      sourceRoots: ["plugins", applicationSourceRoot],
      counterpartCount: personalNames.filter((name) => repoNames.has(name)).length,
      missingRepoCounterparts,
      overlapCount: overlapNames.length,
      overlapPluginIds: overlapNames,
      migratedCount: applicationOwnedNames.length,
      migratedPluginIds: applicationOwnedNames,
      applicationSourceRoot,
      applicationOwnedCount: applicationNames.length,
      applicationOwnedPluginIds: applicationNames,
      applicationOnlyCount: applicationOnlyNames.length,
      applicationOnlyPluginIds: applicationOnlyNames,
    },
    safety: {
      sourceCodeExecutedDuringAudit: false,
      personalMarketplaceMutation: false,
      copiedSecrets: false,
      absoluteSourcePathsStored: false,
    },
    qualityGates: [
      "npm run check:seis-ai-personal-plugin-coverage",
      "npm run check:seis-ai-core-plugin-sources",
      "npm run check:seis-ai-core-plugin-registry",
    ],
  };
}

function validateCoverage(record) {
  const failures = [];
  const marketplace = record?.personalMarketplace;
  const source = record?.personalSourceRoot;
  const repository = record?.repository;
  if (record?.id !== "seis-ai-core-personal-plugin-coverage") failures.push("coverage id is invalid");
  if (record?.goalId !== "SEIS-GOAL-021") failures.push("coverage must bind to SEIS-GOAL-021");
  if (record?.sourceBoundary?.marketplaceName !== "personal") failures.push("coverage must identify the personal marketplace");
  if (record?.sourceBoundary?.sourcePathsRedacted !== true) failures.push("coverage must redact local source paths");
  if (record?.sourceBoundary?.sourceCodeExecutedDuringAudit !== false) failures.push("coverage audit must not execute source code");
  if (record?.sourceBoundary?.personalMarketplaceMutation !== false) failures.push("coverage audit must not mutate the personal marketplace");
  if (marketplace?.pluginCount !== 55) failures.push("coverage must include the current 55 personal SEIS plugins");
  if (!Array.isArray(marketplace?.pluginIds) || new Set(marketplace.pluginIds).size !== marketplace.pluginCount) failures.push("personal marketplace plugin IDs must be unique");
  if (source?.pluginCount !== marketplace?.pluginCount) failures.push("personal source and marketplace counts must match");
  if (source?.missingFromSourceRoot?.length !== 0) failures.push("personal source root is missing marketplace plugins");
  if (source?.unlistedSourcePlugins?.length !== 0) failures.push("personal source root contains unlisted personal plugins");
  if (repository?.counterpartCount !== marketplace?.pluginCount) failures.push("every personal plugin must have a repository counterpart");
  if (repository?.missingRepoCounterparts?.length !== 0) failures.push("repository is missing personal plugin counterparts");
  if (repository?.overlapCount !== 5) failures.push("five personal lane plugins must resolve to existing repository modules");
  if (repository?.migratedCount !== 50) failures.push("50 personal-only plugins must be migrated into the SEIS Command Center app source root");
  if (repository?.applicationSourceRoot !== applicationSourceRoot) failures.push("personal plugin sources must be owned by apps/seis-core");
  if (repository?.applicationOwnedCount !== APP_PLUGIN_EXPANSION_TARGET) failures.push(`the SEIS Command Center app must own ${APP_PLUGIN_EXPANSION_TARGET} plugins`);
  if (repository?.applicationOnlyCount !== APP_PLUGIN_EXPANSION_TARGET - 50) failures.push("the SEIS Command Center app must record ten app-only expansion plugins");
  const serialized = JSON.stringify(record);
  if (/\/Users\/|\/home\/|[A-Za-z]:\\/.test(serialized)) failures.push("coverage must not store machine-specific absolute paths");
  if (failures.length) {
    console.error("SEIS AI personal plugin coverage validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function uniqueSeisNames(entries) {
  return [...new Set(entries
    .map((entry) => entry?.name)
    .filter((name) => typeof name === "string" && (name === "seis" || name.startsWith("seis-"))))].sort();
}

function listPluginNames(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(directory, entry.name, ".codex-plugin", "plugin.json")))
    .map((entry) => entry.name)
    .sort();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeFile(filePath, body) {
  const absolutePath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, body);
}

function assertSame(filePath, expected) {
  const actualPath = path.join(root, filePath);
  const actual = fs.existsSync(actualPath) ? fs.readFileSync(actualPath, "utf8") : "";
  if (actual !== expected) {
    console.error(`${filePath} is out of date. Run the coverage generator with the selected source and marketplace.`);
    process.exit(1);
  }
}

function readOption(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}
