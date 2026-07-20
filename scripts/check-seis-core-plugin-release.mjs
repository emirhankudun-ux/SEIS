#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  APP_PLUGIN_RELEASE_MAX_LABEL,
  APP_PLUGIN_RELEASE_INITIAL_LABEL,
  APP_PLUGIN_RELEASE_SEED_LABEL,
  APP_PLUGIN_RELEASE_TRAIN_PATH,
  compareReleases,
  nextLargeCodeRelease,
  nextMajorRelease,
  parseReleaseLabel,
} from "./seis-core-plugin-release-policy.mjs";
import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const root = process.cwd();
const appManifestPath = "apps/seis-core/data/seis-core-plugin-sources.json";
const appCatalogPath = "apps/seis-core/data/seis-core-plugin-catalog.json";
const readinessPath = "apps/seis-core/data/seis-core-plugin-release-readiness.json";
const registryPath = "content/development/seis-ai-core-plugin-registry.json";
const sourceRoot = "plugins/seis-core";
const failures = [];

const releaseTrain = readJson(APP_PLUGIN_RELEASE_TRAIN_PATH);
const appManifest = readJson(appManifestPath);
const appCatalog = readJson(appCatalogPath);
const readiness = readJson(readinessPath);
const registry = readJson(registryPath);
const current = releaseTrain.currentRelease || {};
let parsedCurrent = null;

ensure(releaseTrain.id === "seis-core-plugin-release-train", "release train id is invalid");
ensure(releaseTrain.goalId === "SEIS-GOAL-021", "release train must bind to SEIS-GOAL-021");
ensure(releaseTrain.schemaVersion === 2, "release train schema must be version 2");
ensure(releaseTrain.scope?.application === "apps/seis-core", "release train must target apps/seis-core");
ensure(releaseTrain.scope?.sourceRoot === sourceRoot, "release train source root is invalid");
ensure(releaseTrain.scope?.pluginCount === APP_PLUGIN_EXPANSION_TARGET, "release train app-owned plugin scope is stale");
ensure(releaseTrain.policy?.minimumLabel === APP_PLUGIN_RELEASE_SEED_LABEL, "release train minimum label is invalid");
ensure(releaseTrain.policy?.initialLabel === APP_PLUGIN_RELEASE_INITIAL_LABEL, "release train initial label is invalid");
ensure(releaseTrain.policy?.maximumLabel === APP_PLUGIN_RELEASE_MAX_LABEL, "release train maximum label is invalid");
ensure(releaseTrain.policy?.catalogSlotsCarryNoApplicationReleaseTrain === true, "catalog slots must not inherit the app release train");
ensure(releaseTrain.policy?.publicMarketplaceMutation === false, "release train must not mutate the marketplace");
ensure(releaseTrain.policy?.majorIncrement === 1, "major release increment must be +1");
ensure(releaseTrain.policy?.annualIncrement === 1, "annual release increment must be +1");
ensure(releaseTrain.policy?.largeCodeChangeIncrement === 1, "large-code release increment must be +1");
ensure(releaseTrain.policy?.largeCodeChangeThreshold === 500, "large-code release threshold must be 500 lines");
ensure(releaseTrain.policy?.bulkPromotionAllowed === false, "bulk promotion must be disabled");
ensure(releaseTrain.policy?.currentBaselineLabel === APP_PLUGIN_RELEASE_INITIAL_LABEL, "release train current baseline is invalid");
ensure(releaseTrain.cadence?.mode === "gradual", "release cadence must be gradual");
ensure(releaseTrain.cadence?.annualPromotionCommand === "npm run promote:seis-core-plugin-annual-release", "annual promotion command is invalid");
const lastAnnualYear = releaseTrain.cadence?.lastAnnualYear ?? null;
const nextAnnualYear = releaseTrain.cadence?.nextAnnualYear;
const expectedNextAnnualYear = lastAnnualYear === null ? 2027 : lastAnnualYear + 1;
ensure(Number.isInteger(nextAnnualYear), "next annual release year must be an integer");
ensure(nextAnnualYear === expectedNextAnnualYear, "next annual release year is inconsistent with the cadence history");

try {
  parsedCurrent = parseReleaseLabel(current.label);
  ensure(compareReleases(parsedCurrent, parseReleaseLabel(APP_PLUGIN_RELEASE_SEED_LABEL)) >= 0, "current release is below the seed label");
  ensure(compareReleases(parsedCurrent, parseReleaseLabel(APP_PLUGIN_RELEASE_MAX_LABEL)) <= 0, "current release exceeds the 45.0000 ceiling");
  ensure(current.label === parsedCurrent.label, "current release label must use the canonical ladder format");
  ensure(current.semver === parsedCurrent.semver, "current release semver does not match the ladder mapping");
  ensure(current.major === parsedCurrent.major, "current release major is stale");
  ensure(current.revision === parsedCurrent.revision, "current release revision is stale");
  ensure(current.microUnits === (parsedCurrent.microUnits ?? null), "current release micro units are stale");
  ensure(current.minor === parsedCurrent.minor, "current release minor is stale");
  ensure(current.patch === parsedCurrent.patch, "current release patch is stale");
  ensure(["initial", "major", "annual", "large-code-change"].includes(current.kind), "current app release kind is invalid");
  ensure(current.annualYear === lastAnnualYear, "current release annual year is inconsistent with the cadence history");
  ensure(!(releaseTrain.legacyLabels || []).includes(current.label), "current release label must not be listed as legacy");
} catch (error) {
  failures.push(error.message);
}

const plugins = listPlugins();
ensure(plugins.length === APP_PLUGIN_EXPANSION_TARGET, `expected ${APP_PLUGIN_EXPANSION_TARGET} app-owned plugins, found ${plugins.length}`);
if (parsedCurrent) {
  for (const plugin of plugins) {
    const manifest = readJson(path.join(sourceRoot, plugin, ".codex-plugin", "plugin.json"));
    const profile = readJson(path.join(sourceRoot, plugin, "assets", "plugin-profile.json"));
    ensure(manifest.version === parsedCurrent.semver, `${plugin}: plugin manifest version must be ${parsedCurrent.semver}`);
    ensure(profile.version === parsedCurrent.semver, `${plugin}: profile version must be ${parsedCurrent.semver}`);
    ensure(profile.releaseTrainVersion === parsedCurrent.label, `${plugin}: profile releaseTrainVersion must be ${parsedCurrent.label}`);
    ensure(profile.releaseKind === current.kind, `${plugin}: profile releaseKind must be ${current.kind}`);
    ensure(profile.releaseMajor === parsedCurrent.major, `${plugin}: profile releaseMajor is stale`);
    ensure(profile.releaseRevision === parsedCurrent.revision, `${plugin}: profile releaseRevision is stale`);
  }
}

ensure(appManifest.releaseTrainPath === APP_PLUGIN_RELEASE_TRAIN_PATH, "app source manifest must point to the release train");
ensure(appManifest.releaseTrainVersion === current.label, "app source manifest release label is stale");
ensure(appManifest.releaseSemver === current.semver, "app source manifest release semver is stale");
ensure(appManifest.releaseKind === current.kind, "app source manifest release kind is stale");
ensure(appManifest.releaseMajor === current.major, "app source manifest release major is stale");
ensure(appManifest.releaseRevision === current.revision, "app source manifest release revision is stale");
ensure(appManifest.releaseMicroUnits === (parsedCurrent?.microUnits ?? null), "app source manifest release micro units are stale");
ensure(appManifest.pluginCount === APP_PLUGIN_EXPANSION_TARGET, "app source manifest plugin count is stale");
for (const plugin of appManifest.plugins || []) {
  ensure(plugin.version === current.semver, `${plugin.name}: app source manifest version is stale`);
  ensure(plugin.releaseTrainVersion === current.label, `${plugin.name}: app source manifest release label is stale`);
  ensure(plugin.releaseMajor === current.major, `${plugin.name}: app source manifest release major is stale`);
  ensure(plugin.releaseRevision === current.revision, `${plugin.name}: app source manifest release revision is stale`);
  ensure(plugin.releaseMicroUnits === (parsedCurrent?.microUnits ?? null), `${plugin.name}: app source manifest release micro units are stale`);
}

ensure(appCatalog.id === "seis-core-application-plugin-catalog", "app plugin catalog id is invalid");
ensure(appCatalog.sourceRoot === sourceRoot, "app plugin catalog source root is invalid");
ensure(appCatalog.counts?.discovered === APP_PLUGIN_EXPANSION_TARGET, "app plugin catalog discovered count is stale");
ensure(appCatalog.plugins?.length === APP_PLUGIN_EXPANSION_TARGET, "app plugin catalog length is stale");
ensure(appCatalog.release?.label === current.label, "app plugin catalog release label is stale");
ensure(appCatalog.release?.semver === current.semver, "app plugin catalog release semver is stale");
ensure(appCatalog.policy?.sourceMutation === false, "app plugin catalog must not mutate source");
ensure(appCatalog.policy?.executableAction === "status-only", "app plugin catalog executable action must be status-only");
ensure(appCatalog.counts?.statusOk === APP_PLUGIN_EXPANSION_TARGET, "app plugin catalog operational status count is stale");
ensure((appCatalog.counts?.statusReady || 0) + (appCatalog.counts?.statusAttention || 0) === APP_PLUGIN_EXPANSION_TARGET, "app plugin catalog ready/attention status split is stale");
ensure(appCatalog.counts?.statusFailed === 0 && appCatalog.counts?.statusNotChecked === 0, "app plugin catalog must not contain failed or unchecked statuses");
for (const plugin of appCatalog.plugins || []) {
  ensure(plugin.sourcePath?.startsWith(`${sourceRoot}/`), `${plugin.name}: app plugin catalog source path is invalid`);
  ensure(plugin.release?.label === current.label, `${plugin.name}: app plugin catalog release label is stale`);
  ensure(plugin.release?.semver === current.semver, `${plugin.name}: app plugin catalog release semver is stale`);
}

ensure(readiness.id === "seis-core-plugin-release-readiness", "release readiness id is invalid");
ensure(readiness.sourceRoot === sourceRoot, "release readiness source root is invalid");
ensure(readiness.currentRelease?.label === current.label, "release readiness current label is stale");
ensure(readiness.currentRelease?.semver === current.semver, "release readiness current semver is stale");
ensure(readiness.next?.largeCode?.label === (() => { try { return nextLargeCodeRelease(parsedCurrent).label; } catch { return null; } })(), "release readiness next large-code label is stale");
ensure(readiness.next?.annual?.label === (() => { try { return nextMajorRelease(parsedCurrent).label; } catch { return null; } })(), "release readiness next annual label is stale");
ensure(readiness.policy?.largeCodeChangeRequiresEvidence === true, "release readiness must require large-code evidence");
ensure(readiness.workingTree?.codeLinesChanged >= 0, "release readiness code line count is invalid");

ensure(registry.applicationRelease?.releaseTrainPath === APP_PLUGIN_RELEASE_TRAIN_PATH, "registry must point to the app release train");
ensure(registry.applicationRelease?.label === current.label, "registry app release label is stale");
ensure(registry.applicationRelease?.semver === current.semver, "registry app release semver is stale");
ensure(registry.applicationRelease?.kind === current.kind, "registry app release kind is stale");
ensure(registry.applicationRelease?.major === current.major, "registry app release major is stale");
ensure(registry.applicationRelease?.revision === current.revision, "registry app release revision is stale");
ensure(registry.applicationRelease?.microUnits === (parsedCurrent?.microUnits ?? null), "registry app release micro units are stale");
ensure(registry.target?.appReleaseLabel === current.label, "registry target app release label is stale");
ensure(registry.target?.appReleaseSemver === current.semver, "registry target app release semver is stale");
ensure(registry.target?.appReleaseMajor === current.major, "registry target app release major is stale");
ensure(registry.target?.appReleaseRevision === current.revision, "registry target app release revision is stale");
ensure(registry.target?.appReleaseMicroUnits === (parsedCurrent?.microUnits ?? null), "registry target app release micro units are stale");

const appEntries = (registry.entries || []).filter((entry) => entry.sourcePath?.startsWith(`${sourceRoot}/`));
const catalogEntries = (registry.entries || []).filter((entry) => entry.recordType === "capability-plugin-slot");
ensure(appEntries.length === APP_PLUGIN_EXPANSION_TARGET, "registry app-owned physical entry count is stale");
for (const entry of appEntries) {
  ensure(entry.version === current.semver, `${entry.id}: registry semver is stale`);
  ensure(entry.releaseSemver === current.semver, `${entry.id}: registry release semver is stale`);
  ensure(entry.releaseTrainVersion === current.label, `${entry.id}: registry release label is stale`);
  ensure(entry.releaseMajor === current.major, `${entry.id}: registry release major is stale`);
  ensure(entry.releaseRevision === current.revision, `${entry.id}: registry release revision is stale`);
  ensure(entry.releaseMicroUnits === (parsedCurrent?.microUnits ?? null), `${entry.id}: registry release micro units are stale`);
}
for (const entry of catalogEntries) {
  ensure(!Object.prototype.hasOwnProperty.call(entry, "releaseTrainVersion"), `${entry.id}: catalog slot must not carry app release label`);
  ensure(!Object.prototype.hasOwnProperty.call(entry, "releaseSemver"), `${entry.id}: catalog slot must not carry app release semver`);
  ensure(!Object.prototype.hasOwnProperty.call(entry, "releaseMajor"), `${entry.id}: catalog slot must not carry app release major`);
  ensure(!Object.prototype.hasOwnProperty.call(entry, "releaseRevision"), `${entry.id}: catalog slot must not carry app release revision`);
}

if (failures.length) {
  console.error("SEIS Command Center plugin release validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  goalId: releaseTrain.goalId,
  application: releaseTrain.scope.application,
  releaseLabel: current.label,
  releaseSemver: current.semver,
  releaseKind: current.kind,
  releaseMajor: current.major,
  releaseRevision: current.revision,
  releaseMicroUnits: current.microUnits ?? null,
  range: { start: APP_PLUGIN_RELEASE_SEED_LABEL, maximum: APP_PLUGIN_RELEASE_MAX_LABEL },
  pluginCount: plugins.length,
  registryAppEntries: appEntries.length,
  catalogEntriesWithoutAppRelease: catalogEntries.length,
  marketplaceMutation: false,
}, null, 2));

function listPlugins() {
  const absoluteRoot = path.join(root, ...sourceRoot.split("/"));
  if (!fs.existsSync(absoluteRoot)) return [];
  return fs.readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(absoluteRoot, entry.name, ".codex-plugin", "plugin.json")))
    .map((entry) => entry.name)
    .sort();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
