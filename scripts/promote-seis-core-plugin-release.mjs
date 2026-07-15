#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  APP_PLUGIN_RELEASE_MAX_LABEL,
  APP_PLUGIN_RELEASE_SEED_LABEL,
  APP_PLUGIN_RELEASE_TRAIN_PATH,
  assertReleaseKind,
  compareReleases,
  nextLargeCodeRelease,
  nextMajorRelease,
  parseReleaseLabel,
  releaseRecord,
} from "./seis-core-plugin-release-policy.mjs";

const root = process.cwd();
const sourceRoot = "plugins/seis-core";
const apply = process.argv.includes("--apply");
const trainBeforePromotion = readJson(APP_PLUGIN_RELEASE_TRAIN_PATH);
const current = parseReleaseLabel(trainBeforePromotion.currentRelease?.label || APP_PLUGIN_RELEASE_SEED_LABEL);
const requestedLabel = readOption("--label");
const requestedKind = readOption("--kind");
const majorMode = process.argv.includes("--major");
const annualMode = process.argv.includes("--annual");
const codeLines = readIntegerOption("--code-lines");
const largeCodeChangeThreshold = trainBeforePromotion.policy?.largeCodeChangeThreshold ?? 500;
const largeCodeMode = process.argv.includes("--large-code-change") || (codeLines !== null && codeLines >= largeCodeChangeThreshold);

if ((majorMode || annualMode) && largeCodeMode) throw new Error("Choose either --major/--annual or --large-code-change, not both.");
if (majorMode && annualMode) throw new Error("Choose either --major or --annual, not both.");
if (requestedLabel && (majorMode || annualMode || largeCodeMode)) throw new Error("Use --label explicitly or choose an automatic promotion mode, not both.");
if (largeCodeMode && codeLines !== null && codeLines < largeCodeChangeThreshold) {
  throw new Error(`--code-lines must be at least ${largeCodeChangeThreshold} for a large-code promotion.`);
}

const annualYear = annualMode ? (readIntegerOption("--year") ?? new Date().getUTCFullYear()) : null;
const lastAnnualYear = trainBeforePromotion.currentRelease?.annualYear ?? trainBeforePromotion.cadence?.lastAnnualYear ?? null;
const nextAnnualYear = trainBeforePromotion.cadence?.nextAnnualYear ?? (lastAnnualYear === null ? new Date().getUTCFullYear() + 1 : lastAnnualYear + 1);
if (annualMode && annualYear < nextAnnualYear) {
  throw new Error(`Annual release year must be at least ${nextAnnualYear}; received ${annualYear}.`);
}

const promotion = determinePromotion({ current, requestedLabel, requestedKind, majorMode, annualMode, largeCodeMode });
if (compareReleases(promotion.parsed, current) < 0) {
  throw new Error(`Release promotion cannot move backwards from ${current.label} to ${promotion.parsed.label}.`);
}
const plugins = listPlugins();

if (plugins.length !== 50) {
  throw new Error(`Expected 50 app-owned plugins, found ${plugins.length}.`);
}

const evidence = {
  trigger: promotion.kind === "large-code-change" ? "explicit --large-code-change" : promotion.kind === "annual" ? `annual release ${annualYear}` : promotion.kind,
  codeLines,
  codeLineThreshold: largeCodeChangeThreshold,
  annualYear: promotion.kind === "annual" ? annualYear : lastAnnualYear,
  reason: readOption("--reason") || (promotion.kind === "large-code-change" ? "large code change after the previous app release" : promotion.kind === "annual" ? `annual app release for ${annualYear}` : promotion.kind === "initial" ? "user-selected initial app release baseline" : "major app plugin update"),
};

if (!apply) {
  console.log(JSON.stringify({
    mode: "dry-run",
    goalId: "SEIS-GOAL-021",
    application: "apps/seis-core",
    pluginCount: plugins.length,
    previousRelease: current,
    nextRelease: releaseRecord(promotion.parsed, promotion.kind, evidence),
    range: { start: APP_PLUGIN_RELEASE_SEED_LABEL, maximum: APP_PLUGIN_RELEASE_MAX_LABEL },
    filesToUpdate: plugins.length * 2 + 6,
    publicMarketplaceMutation: false,
    message: "Pass --apply to update all app-owned plugin manifests, profiles, release metadata, and generated projections.",
  }, null, 2));
  process.exit(0);
}

if (compareReleases(promotion.parsed, current) === 0 && !process.argv.includes("--resync")) {
  throw new Error(`Release ${promotion.parsed.label} is already current. Use --resync only to repair generated metadata.`);
}

for (const plugin of plugins) {
  const manifestPath = path.join(plugin.root, ".codex-plugin", "plugin.json");
  const profilePath = path.join(plugin.root, "assets", "plugin-profile.json");
  let manifest = fs.readFileSync(manifestPath, "utf8");
  let profile = fs.readFileSync(profilePath, "utf8");
  manifest = replaceStringProperty(manifest, "version", promotion.parsed.semver, `${plugin.name} plugin.json`);
  profile = replaceStringProperty(profile, "version", promotion.parsed.semver, `${plugin.name} plugin profile`);
  profile = upsertStringProperty(profile, "releaseTrainVersion", promotion.parsed.label);
  profile = upsertStringProperty(profile, "releaseKind", promotion.kind);
  profile = upsertNumberProperty(profile, "releaseMajor", promotion.parsed.major);
  profile = upsertNumberProperty(profile, "releaseRevision", promotion.parsed.revision);
  profile = upsertNullableNumberProperty(profile, "releaseMicroUnits", promotion.parsed.microUnits);
  fs.writeFileSync(manifestPath, manifest);
  fs.writeFileSync(profilePath, profile);
}

const previousRelease = trainBeforePromotion.currentRelease;
const previousParsed = parseReleaseLabel(previousRelease?.label || APP_PLUGIN_RELEASE_SEED_LABEL);
const resyncPromotion = compareReleases(promotion.parsed, current) === 0;
const currentEvidence = resyncPromotion
  ? {
      trigger: previousRelease?.trigger || evidence.trigger,
      codeLines: previousRelease?.codeLines ?? evidence.codeLines,
      codeLineThreshold: previousRelease?.codeLineThreshold ?? evidence.codeLineThreshold,
      annualYear: previousRelease?.annualYear ?? evidence.annualYear,
      reason: previousRelease?.reason || evidence.reason,
    }
  : evidence;
const releaseHistory = Array.isArray(trainBeforePromotion.releaseHistory) ? trainBeforePromotion.releaseHistory : [];
const history = releaseHistory.map(normalizeHistoryEntry);
if (!history.some((entry) => entry.label === previousParsed.label)) {
  history.push(releaseRecord(previousParsed, previousRelease?.kind || (previousParsed.isSeed ? "bootstrap" : "major"), {
    date: trainBeforePromotion.updatedAt || null,
    status: previousRelease?.status || "superseded",
    reason: "normalized previous release-train record",
  }));
}
history.push(releaseRecord(promotion.parsed, promotion.kind, {
  ...evidence,
  date: "2026-07-15",
  status: "internal-local-app-release",
}));

const updatedTrain = {
  ...trainBeforePromotion,
  schemaVersion: 2,
  updatedAt: "2026-07-15",
  currentRelease: releaseRecord(promotion.parsed, promotion.kind, {
    maturity: "functional-local-demo",
    status: "internal-local-app-release",
    previousLabel: previousRelease?.label !== promotion.parsed.label ? (previousRelease?.label || null) : (previousRelease?.previousLabel || null),
    previousSemver: previousRelease?.semver !== promotion.parsed.semver ? (previousRelease?.semver || null) : (previousRelease?.previousSemver || null),
    ...currentEvidence,
  }),
  cadence: {
    ...trainBeforePromotion.cadence,
    lastAnnualYear: promotion.kind === "annual" ? annualYear : lastAnnualYear,
    nextAnnualYear: (promotion.kind === "annual" ? annualYear : lastAnnualYear) === null
      ? (trainBeforePromotion.cadence?.nextAnnualYear ?? 2027)
      : (promotion.kind === "annual" ? annualYear : lastAnnualYear) + 1,
  },
  releaseHistory: dedupeHistory(history),
  legacyLabels: Array.from(new Set([...(trainBeforePromotion.legacyLabels || []), previousParsed.legacyLabel]
    .filter(Boolean)
    .filter((label) => label !== promotion.parsed.label))),
};
fs.writeFileSync(path.join(root, APP_PLUGIN_RELEASE_TRAIN_PATH), `${JSON.stringify(updatedTrain, null, 2)}\n`);

run("scripts/create-seis-core-plugin-sources.mjs");
run("scripts/create-seis-ai-core-plugin-registry.mjs");
run("scripts/create-seis-core-plugin-catalog.mjs");
updateIntegrationManifest(promotion.parsed);
updateCommandCenterSurface(promotion.parsed);

console.log(`Promoted ${plugins.length} app-owned plugins to ${promotion.parsed.label} (${promotion.parsed.semver}).`);
console.log("Public suite and personal marketplace were not mutated.");

function determinePromotion({ current: currentRelease, requestedLabel: label, requestedKind: kind, majorMode: isMajor, annualMode: isAnnual, largeCodeMode: isLargeCode }) {
  if (isAnnual) {
    const parsed = nextMajorRelease(currentRelease);
    return { parsed, kind: "annual" };
  }
  if (isMajor) {
    const parsed = nextMajorRelease(currentRelease);
    return { parsed, kind: "major" };
  }
  if (isLargeCode) {
    const parsed = nextLargeCodeRelease(currentRelease);
    return { parsed, kind: "large-code-change" };
  }
  if (!label) {
    throw new Error("Choose a promotion mode: --major, --large-code-change, or an explicit --label.");
  }
  const parsed = parseReleaseLabel(label);
  if (compareReleases(parsed, currentRelease) === 0) {
    return { parsed, kind: assertReleaseKind(kind || trainBeforePromotion.currentRelease?.kind || "initial") };
  }
  const expectedMajor = nextMajorRelease(currentRelease);
  if (compareReleases(parsed, expectedMajor) === 0) return { parsed, kind: assertReleaseKind(kind || "major") };
  const expectedCode = nextLargeCodeRelease(currentRelease);
  if (compareReleases(parsed, expectedCode) === 0) return { parsed, kind: assertReleaseKind(kind || "large-code-change") };
  throw new Error(`Explicit label ${parsed.label} is not the next major (${expectedMajor.label}) or code revision (${expectedCode.label}).`);
}

function listPlugins() {
  const absoluteRoot = path.join(root, ...sourceRoot.split("/"));
  return fs.readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, root: path.join(absoluteRoot, entry.name) }))
    .filter((plugin) => fs.existsSync(path.join(plugin.root, ".codex-plugin", "plugin.json")))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function replaceStringProperty(text, key, value, label) {
  const pattern = new RegExp(`^(\\s*)"${key}"\\s*:\\s*"[^"]*"`, "m");
  if (!pattern.test(text)) throw new Error(`${label} is missing string property ${key}.`);
  return text.replace(pattern, `$1"${key}": "${value}"`);
}

function upsertStringProperty(text, key, value) {
  const existing = new RegExp(`^\\s*"${key}"\\s*:\\s*"[^"]*",?\\s*\\n`, "m");
  text = text.replace(existing, "");
  const versionLine = /^(\s*)"version"\s*:\s*"[^"]*",?\s*\n/m.exec(text);
  if (!versionLine) throw new Error(`Plugin profile is missing version line while inserting ${key}.`);
  const indent = versionLine[1];
  const insertion = `${indent}"${key}": "${value}",\n`;
  return text.replace(versionLine[0], `${versionLine[0]}${insertion}`);
}

function upsertNumberProperty(text, key, value) {
  const existing = new RegExp(`^\\s*"${key}"\\s*:\\s*-?\\d+,?\\s*\\n`, "m");
  text = text.replace(existing, "");
  const versionLine = /^(\s*)"version"\s*:\s*"[^"]*",?\s*\n/m.exec(text);
  if (!versionLine) throw new Error(`Plugin profile is missing version line while inserting ${key}.`);
  const indent = versionLine[1];
  const insertion = `${indent}"${key}": ${value},\n`;
  return text.replace(versionLine[0], `${versionLine[0]}${insertion}`);
}

function upsertNullableNumberProperty(text, key, value) {
  const existing = new RegExp(`^\\s*"${key}"\\s*:\\s*(?:-?\\d+|null),?\\s*\\n`, "m");
  text = text.replace(existing, "");
  const versionLine = /^(\s*)"version"\s*:\s*"[^"]*",?\s*\n/m.exec(text);
  if (!versionLine) throw new Error(`Plugin profile is missing version line while inserting ${key}.`);
  const indent = versionLine[1];
  const rendered = value === null || value === undefined ? "null" : String(value);
  const insertion = `${indent}"${key}": ${rendered},\n`;
  return text.replace(versionLine[0], `${versionLine[0]}${insertion}`);
}

function normalizeHistoryEntry(entry) {
  const parsed = parseReleaseLabel(entry?.label || APP_PLUGIN_RELEASE_SEED_LABEL);
  return releaseRecord(parsed, entry?.kind || (parsed.isSeed ? "bootstrap" : "major"), {
    ...entry,
    label: parsed.label,
    semver: parsed.semver,
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
    revision: parsed.revision,
  });
}

function updateIntegrationManifest(parsed) {
  const filePath = "content/development/seis-agent-plugin-integration.json";
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) return;
  const manifest = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  const sections = [
    manifest.canonicalAgent,
    manifest.unifiedPluginSuite,
    manifest.helperPluginUniverse,
    manifest.runtimeIntegration,
  ];
  for (const section of sections) {
    if (!section) continue;
    section.applicationPluginReleaseTrain = APP_PLUGIN_RELEASE_TRAIN_PATH;
    section.applicationPluginReleaseLabel = parsed.label;
    section.applicationPluginReleaseSemver = parsed.semver;
    section.applicationPluginReleaseMajor = parsed.major;
    section.applicationPluginReleaseRevision = parsed.revision;
    section.applicationPluginReleaseMicroUnits = parsed.microUnits;
    section.applicationPluginReleaseMicroUnits = parsed.microUnits;
  }
  if (manifest.applicationIntegration) {
    manifest.applicationIntegration.pluginReleaseTrain = APP_PLUGIN_RELEASE_TRAIN_PATH;
    manifest.applicationIntegration.pluginReleaseLabel = parsed.label;
    manifest.applicationIntegration.pluginReleaseSemver = parsed.semver;
    manifest.applicationIntegration.pluginReleaseMajor = parsed.major;
    manifest.applicationIntegration.pluginReleaseRevision = parsed.revision;
    manifest.applicationIntegration.pluginReleaseMicroUnits = parsed.microUnits;
    manifest.applicationIntegration.pluginReleaseMicroUnits = parsed.microUnits;
  }
  fs.writeFileSync(absolutePath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function updateCommandCenterSurface(parsed) {
  const filePath = path.join(root, "apps", "seis-core", "script.js");
  if (!fs.existsSync(filePath)) return;
  const currentText = fs.readFileSync(filePath, "utf8");
  const nextText = currentText.replace(/at app release [0-9.]+/g, `at app release ${parsed.label}`);
  if (nextText !== currentText) fs.writeFileSync(filePath, nextText);
}

function dedupeHistory(history) {
  const seen = new Set();
  return history
    .sort((a, b) => compareReleases(a, b))
    .filter((entry) => {
      if (!entry?.label || seen.has(entry.label)) return false;
      seen.add(entry.label);
      return true;
    });
}

function readIntegerOption(name) {
  const value = readOption(name);
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error(`${name} must be a non-negative integer.`);
  return parsed;
}

function readOption(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function run(script) {
  execFileSync(process.execPath, [script], { cwd: root, stdio: "inherit" });
}
