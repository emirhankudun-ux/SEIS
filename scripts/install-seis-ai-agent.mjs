#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const marketplace = "seis-repo";
const JOURNEY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BUNDLE_ID_PATTERN = /^seis-(?:application|topic)-bundle-\d{2}$/;
const parsedArgs = parseArguments(process.argv.slice(2));
const canonicalizationPath = path.join(repoRoot, "content", "development", "seis-plugin-canonicalization.json");
const unifiedSuitePath = path.join(repoRoot, "plugins", "seis-ai-agent", "assets", "unified-suite.json");
const selectionGuidePath = path.join(repoRoot, "content", "development", "seis-public-plugin-selection-guide.json");
const bundleCatalogPath = path.join(repoRoot, "content", "development", "seis-public-plugin-bundle-catalog.json");
const canonicalization = readJsonIfExists(canonicalizationPath);
const unifiedSuite = readJsonIfExists(unifiedSuitePath);
const selectionGuide = readJsonIfExists(selectionGuidePath);
const bundleCatalog = readJsonIfExists(bundleCatalogPath);
const primaryInstallId = canonicalization?.canonicalOrchestrator || "seis-ai-agent@seis-repo";
const embeddedModules = Array.isArray(unifiedSuite?.components) ? unifiedSuite.components : [];
const embeddedLanes = embeddedModules.map((module) => module.moduleId || module.id).filter((id) => id && id !== "seis-ai-agent");
const applicationDistribution = unifiedSuite?.applicationDistribution || {};
const canonicalFamilyTargets = Array.isArray(canonicalization?.canonicalPluginIds) && canonicalization.canonicalPluginIds.length
  ? canonicalization.canonicalPluginIds
  : [primaryInstallId];
const legacyAliases = Array.isArray(canonicalization?.aliases) ? canonicalization.aliases : [];

if (
  canonicalFamilyTargets.length !== 1 ||
  canonicalFamilyTargets[0] !== primaryInstallId ||
  !primaryInstallId.endsWith("@seis-repo")
) {
  fail("SEIS-Agent must be the only canonical public install target");
}

if (parsedArgs.help) {
  console.log([
    "Usage: node scripts/install-seis-ai-agent.mjs [--check-only] [--journey <known-journey-id>]",
    "       node scripts/install-seis-ai-agent.mjs --apply [--journey <known-journey-id>]",
    "",
    "Without --journey, the plan contains only seis-ai-agent@seis-repo.",
    "A known --journey adds only that journey's first optional bundle to the plan.",
    "No installation occurs without --apply; bulk bundle and member installation are not supported.",
  ].join("\n"));
  process.exit(0);
}

const selectedJourney = selectJourney(parsedArgs.journeyId, selectionGuide, bundleCatalog);
const targets = [primaryInstallId, ...(selectedJourney ? [selectedJourney.initialBundle.installId] : [])];
const planCommand = installCommandFor(parsedArgs.journeyId, false);
const applyCommand = installCommandFor(parsedArgs.journeyId, true);

const readiness = {
  repoRoot,
  platform: process.platform,
  nodeVersion: process.version,
  marketplaceExists: fs.existsSync(path.join(repoRoot, ".agents", "plugins", "marketplace.json")),
  codexAvailable: commandExists("codex"),
  primaryInstallId,
  defaultInstallMode: "single-public-plugin",
  unifiedSuite: {
    path: "plugins/seis-ai-agent/assets/unified-suite.json",
    status: unifiedSuite?.status || "missing",
    releaseVersion: unifiedSuite?.releaseVersion || null,
    componentCount: unifiedSuite?.componentCount || 0,
    publicPluginCount: unifiedSuite?.publicDistribution?.publicPluginCount || 0,
  },
  applicationSource: {
    application: applicationDistribution.applicationId || "seis-core",
    applicationPath: applicationDistribution.applicationPath || "apps/seis-core",
    ownership: applicationDistribution.ownership || null,
    sourceRoot: applicationDistribution.sourceRoot || null,
    sourceManifest: applicationDistribution.sourceManifest || null,
    releaseTrain: applicationDistribution.releaseTrain || null,
    releaseLabel: applicationDistribution.releaseLabel || null,
    releaseSemver: applicationDistribution.releaseSemver || null,
    pluginCount: applicationDistribution.pluginCount || 0,
    sourceAvailableInRepository: applicationDistribution.sourceAvailableInRepository === true,
    publicRepositoryAvailable: applicationDistribution.publicRepositoryAvailable === true,
    publicAudience: applicationDistribution.publicAudience || null,
    publicDistribution: applicationDistribution.publicDistribution || null,
    marketplaceName: applicationDistribution.marketplaceName || null,
    publicMarketplace: applicationDistribution.publicMarketplace === true,
    installSurface: applicationDistribution.installSurface || null,
    marketplaceEntryCount: applicationDistribution.marketplaceEntryCount ?? null,
    marketplaceCardCount: applicationDistribution.marketplaceCardCount ?? null,
    sourceCapabilityCount: applicationDistribution.sourceCapabilityCount ?? null,
    publicReleaseAllowed: applicationDistribution.publicReleaseAllowed === true,
  },
  embeddedLanes,
  canonicalization: {
    contractPath: "content/development/seis-plugin-canonicalization.json",
    status: canonicalization?.status || "contract-missing-fallback-targets",
    effectivePluginCount: canonicalization?.effectivePluginCount || 1,
    legacyAliasCount: legacyAliases.length,
    aliases: legacyAliases.map((alias) => ({ legacyInstallId: alias.legacyInstallId, canonicalInstallId: alias.canonicalInstallId })),
    personalMarketplaceMutation: false,
    globalMarketplaceMutation: {
      performed: canonicalization?.globalMarketplaceMutation?.performed === true,
      allowedWithoutHumanApproval: canonicalization?.globalMarketplaceMutation?.allowedWithoutHumanApproval === true,
    },
  },
  bundleSelection: {
    guidePath: "content/development/seis-public-plugin-selection-guide.json",
    requestedJourneyId: parsedArgs.journeyId,
    selectionMode: selectedJourney ? "one-explicit-optional-bundle" : "canonical-only",
    selectedJourney,
    maximumOptionalBundleSelectionsPerTask: 1,
    bulkInstallAllowed: false,
    bundleMembersAutoInstalled: false,
    defaultInstallIncludesOptionalBundle: false,
    applyRequiresExplicitFlag: true,
    planCommand,
    applyCommand,
  },
  consolidationPolicy: `SEIS-Agent is the canonical public install target; specialist source modules run through the embedded suite, and ${APP_PLUGIN_EXPANSION_TARGET} MIT-licensed app-owned source packages remain available in the SEIS repository through curated public bundles (${applicationDistribution.marketplaceEntryCount ?? 0} application bundle cards within ${applicationDistribution.marketplaceCardCount ?? 0} total public cards). The default never adds an optional bundle. A known --journey may add only its validated first optional bundle, and bundle members are never bulk-installed. Live external capabilities remain approval-gated.`,
  embeddedModuleCount: embeddedModules.length,
  embeddedModuleIds: embeddedModules.map((module) => module.moduleId || module.id).filter(Boolean),
  targets,
};

if (parsedArgs.checkOnly) {
  console.log(JSON.stringify(readiness, null, 2));
  process.exit(readiness.marketplaceExists ? 0 : 1);
}

if (!readiness.marketplaceExists) fail("repo marketplace is missing");
if (!parsedArgs.apply) {
  console.log(JSON.stringify({
    mode: "plan-only",
    planCommand,
    applyCommand,
    readiness,
    commands: [
      ["codex", "plugin", "marketplace", "add", repoRoot],
      ...targets.map((target) => ["codex", "plugin", "add", target])
    ]
  }, null, 2));
  process.exit(0);
}

if (!readiness.codexAvailable) fail("codex CLI is not available in PATH");
run("codex", ["plugin", "marketplace", "add", repoRoot]);
for (const target of targets) run("codex", ["plugin", "add", target]);
console.log("SEIS-AI Agent terminal install completed.");
console.log(`Installed targets: ${targets.join(", ")}`);
console.log("Start a new Codex thread to pick up refreshed skills and MCP tools.");

function parseArguments(argv) {
  const parsed = { apply: false, checkOnly: false, help: false, journeyId: null };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--apply") {
      if (parsed.apply) fail("--apply may be supplied only once");
      parsed.apply = true;
      continue;
    }
    if (argument === "--check-only") {
      if (parsed.checkOnly) fail("--check-only may be supplied only once");
      parsed.checkOnly = true;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      parsed.help = true;
      continue;
    }
    if (argument === "--with-standalone-lanes") {
      fail("standalone lane installation is retired; install the single SEIS-Agent plugin instead");
    }
    const inlineJourney = argument.startsWith("--journey=") ? argument.slice("--journey=".length) : null;
    if (argument === "--journey" || inlineJourney !== null) {
      if (parsed.journeyId !== null) fail("only one --journey may be supplied for a scoped task");
      const journeyId = inlineJourney ?? argv[index += 1];
      if (!JOURNEY_ID_PATTERN.test(journeyId || "")) fail("--journey must be a known public selection journey");
      parsed.journeyId = journeyId;
      continue;
    }
    fail(`unsupported option: ${argument}`);
  }
  if (parsed.apply && parsed.checkOnly) fail("--apply cannot be combined with --check-only");
  return parsed;
}

function selectJourney(journeyId, guide, catalog) {
  if (journeyId === null) return null;
  if (
    guide?.id !== "seis-public-plugin-selection-guide" ||
    guide?.canonicalInstall !== primaryInstallId ||
    guide?.marketplace?.name !== marketplace ||
    guide?.selectionBoundary?.maximumOptionalBundleSelectionsPerTask !== 1 ||
    guide?.selectionBoundary?.bulkInstallAllowed !== false ||
    guide?.selectionBoundary?.bundleMembersAutoInstalled !== false
  ) {
    fail("public selection guide is unavailable or fails the one-bundle safety boundary");
  }
  const journey = Array.isArray(guide.journeys) ? guide.journeys.find((candidate) => candidate?.id === journeyId) : null;
  const initialBundle = journey?.initialBundle;
  if (
    !journey ||
    !initialBundle ||
    !BUNDLE_ID_PATTERN.test(initialBundle.id || "") ||
    initialBundle.installId !== `${initialBundle.id}@${marketplace}` ||
    !Number.isInteger(initialBundle.memberCount) ||
    initialBundle.memberCount < 1 ||
    initialBundle.memberCount > 15 ||
    initialBundle.journeyPart !== 1
  ) {
    fail("--journey must resolve to one validated initial optional bundle");
  }
  const catalogBundle = Array.isArray(catalog?.bundles) ? catalog.bundles.find((bundle) => bundle?.id === initialBundle.id) : null;
  if (
    !catalogBundle ||
    catalogBundle.journeyId !== journeyId ||
    catalogBundle.memberCount !== initialBundle.memberCount ||
    catalogBundle.journeyPart !== 1 ||
    catalogBundle.journeyPartCount !== initialBundle.journeyPartCount
  ) {
    fail("--journey does not match the reviewed public bundle catalog");
  }
  return {
    id: journey.id,
    label: journey.label,
    family: journey.family,
    sourceCapabilityCount: journey.sourceCapabilityCount,
    initialBundle: {
      id: initialBundle.id,
      displayName: initialBundle.displayName,
      installId: initialBundle.installId,
      memberCount: initialBundle.memberCount,
      journeyPart: initialBundle.journeyPart,
      journeyPartCount: initialBundle.journeyPartCount,
    },
    continuationBundleIds: Array.isArray(journey.continuationBundleIds) ? journey.continuationBundleIds : [],
  };
}

function installCommandFor(journeyId, apply) {
  const argumentsText = [apply ? "--apply" : null, journeyId ? `--journey ${journeyId}` : null].filter(Boolean).join(" ");
  return `npm run install:seis-ai-agent${argumentsText ? ` -- ${argumentsText}` : ""}`;
}

function commandExists(command) {
  return spawnSync(command, ["--version"], { stdio: "ignore", shell: process.platform === "win32" }).status === 0;
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { cwd: repoRoot, stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) fail(`${command} failed to start: ${result.error.message}`);
  if (result.status !== 0) fail(`${command} ${commandArgs.join(" ")} exited with ${result.status}`);
}

function fail(message) {
  console.error(`SEIS-AI Agent install failed: ${message}`);
  process.exit(1);
}
