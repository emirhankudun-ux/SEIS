#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";
import {
  TOPIC_PLUGIN_SOURCE_ROOT,
  TOPIC_PLUGIN_TARGET,
  assertTopicObjective,
  flattenTopicObjective,
  readTopicObjective,
} from "../plugins/seis-topics/runtime/topic-definitions.mjs";
import {
  SEIS_GENERAL_PLUGIN_ROOT,
  SEIS_GENERAL_PLUGIN_TARGET,
  SEIS_INTERNAL_PACKAGE_TARGET,
  SEIS_PUBLIC_BUNDLE_ROOT,
  SEIS_PUBLIC_BUNDLE_SIZE,
  SEIS_PUBLIC_MARKETPLACE_CARD_COUNT,
  buildSeisPublicBundlePlan,
} from "./lib/seis-public-bundle-plan.mjs";
import {
  CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
  PREVIOUS_SEIS_PUBLIC_RELEASE_VERSION,
  SEIS_PUBLIC_RELEASE_CHANGE_ID,
  SEIS_PUBLIC_RELEASE_CHANGE_KIND,
  assertStructuralReleaseVersion,
} from "./lib/seis-public-release-version.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const GENERATED_AT = "2026-07-22";
const CANONICAL_INSTALL_ID = "seis-ai-agent@seis-repo";
const FAMILY_PATH = "content/development/seis-public-plugin-family.json";
const CATALOG_PATH = "content/development/seis-public-plugin-bundle-catalog.json";
const GUIDE_PATH = "content/development/seis-public-plugin-selection-guide.json";
const GUIDE_ASSET_PATH = "plugins/seis-ai-agent/assets/public-bundle-selection-guide.json";
const GUIDE_DOC_PATH = "docs/roadmap/SEIS_PUBLIC_PLUGIN_SELECTION_GUIDE.md";
const FAMILY_REPORT_PATH = "reports/seis-public-plugin-family.md";
const RELEASE_POLICY_PATH = "content/development/seis-public-plugin-release-policy.json";
const RELEASE_POLICY_DOC_PATH = "docs/roadmap/SEIS_PUBLIC_PLUGIN_VERSION_POLICY.md";
const AGENT_MANIFEST_PATH = "plugins/seis-ai-agent/.codex-plugin/plugin.json";
const AGENT_PROFILE_PATH = "plugins/seis-ai-agent/assets/agent-profile.json";
const LEGACY_GENERATED_BUNDLE_PATTERN = /^seis-(?:application|topic)-bundle-\d{2}$/u;
const MIGRATED_ROOT_NAMES = new Set(["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]);
const ROOT_MODULES = Object.freeze([
  Object.freeze({ name: "seis-ai-agent", displayName: "SEIS-Agent", role: "orchestrator", category: "Developer", sourcePath: "./plugins/seis-ai-agent" }),
  Object.freeze({ name: "seis", displayName: "SEIS", role: "governance", category: "Developer", sourcePath: "./plugins/seis" }),
  Object.freeze({ name: "seis-cloud", displayName: "SEIS Cloud", role: "cloud", category: "Developer", sourcePath: "./plugins/seis-cloud" }),
  Object.freeze({ name: "seis-code", displayName: "SEIS-Code", role: "code", category: "Developer", sourcePath: "./plugins/seis-code" }),
  Object.freeze({ name: "seis-design", displayName: "SEIS-Design", role: "design", category: "Design", sourcePath: "./plugins/seis-design" }),
  Object.freeze({ name: "seis-data", displayName: "SEIS-DATA", role: "data", category: "Data", sourcePath: "./plugins/seis-data" }),
  Object.freeze({ name: "seis-security", displayName: "SEIS Security", role: "security", category: "Security", sourcePath: "./plugins/seis-security" }),
  Object.freeze({ name: "seis-research", displayName: "SEIS Research", role: "research", category: "Research", sourcePath: "./plugins/seis-research" }),
  Object.freeze({ name: "seis-automation", displayName: "SEIS Automation", role: "automation", category: "Developer", sourcePath: "./plugins/seis-automation" }),
  Object.freeze({ name: "seis-product", displayName: "SEIS Product", role: "product", category: "Productivity", sourcePath: "./plugins/seis-product" }),
]);

assertStructuralReleaseVersion();
const topicObjective = readTopicObjective(ROOT);
const topicDefinitions = flattenTopicObjective(topicObjective);
assertTopicObjective(topicObjective, topicDefinitions);
const applicationPlugins = discoverApplicationPlugins();
const topicPlugins = discoverTopicPlugins();
assert(applicationPlugins.length === APP_PLUGIN_EXPANSION_TARGET, "application source count is invalid");
assert(topicPlugins.length === TOPIC_PLUGIN_TARGET, "topic source count is invalid");

const plan = buildSeisPublicBundlePlan({ applicationPlugins, topicPlugins });
const packageById = new Map(plan.internalPackages.map((candidate) => [candidate.id, candidate]));
const generalByPackageId = new Map(
  plan.generalPlugins.flatMap((plugin) => plugin.internalPackageIds.map((packageId) => [packageId, plugin])),
);
assert(plan.generalPlugins.length === SEIS_GENERAL_PLUGIN_TARGET, "general plugin count is invalid");
assert(plan.internalPackages.length === SEIS_INTERNAL_PACKAGE_TARGET, "internal package count is invalid");
assert(plan.internalPackages.every((candidate) => candidate.memberCount >= 1 && candidate.memberCount <= SEIS_PUBLIC_BUNDLE_SIZE), "internal package size is invalid");

const marketplace = {
  name: "seis-repo",
  interface: { displayName: "SEIS Repo" },
  plugins: plan.generalPlugins.map((plugin) => ({
    name: plugin.name,
    source: { source: "local", path: plugin.sourcePath },
    policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    category: plugin.category,
  })),
};
const family = buildFamily();
const catalog = buildCatalog();
const guide = buildGuide();
const releasePolicy = buildReleasePolicy();
const agentManifest = buildAgentManifest(readJson(AGENT_MANIFEST_PATH));
const agentProfile = buildAgentProfile(readJson(AGENT_PROFILE_PATH));
const outputs = [
  [".agents/plugins/marketplace.json", json(marketplace)],
  [FAMILY_PATH, json(family)],
  [CATALOG_PATH, json(catalog)],
  [GUIDE_PATH, json(guide)],
  [GUIDE_ASSET_PATH, json(guide)],
  [FAMILY_REPORT_PATH, familyMarkdown()],
  [GUIDE_DOC_PATH, guideMarkdown()],
  [RELEASE_POLICY_PATH, json(releasePolicy)],
  [RELEASE_POLICY_DOC_PATH, releasePolicyMarkdown()],
  [AGENT_MANIFEST_PATH, json(agentManifest)],
  [AGENT_PROFILE_PATH, json(agentProfile)],
  ...plan.internalPackages.flatMap((candidate) => internalPackageOutputs(candidate)),
  ...plan.generalPlugins.filter((plugin) => !plugin.canonical).flatMap((plugin) => generalPluginOutputs(plugin)),
];

validateContracts();
if (CHECK_MODE) {
  const stale = outputs.filter(([file, expected]) => readOptionalText(file) !== expected).map(([file]) => file);
  const directoryFailures = [
    ...directorySetFailures(SEIS_PUBLIC_BUNDLE_ROOT, plan.internalPackages.map((candidate) => candidate.id)),
    ...directorySetFailures(SEIS_GENERAL_PLUGIN_ROOT, plan.generalPlugins.filter((plugin) => !plugin.canonical).map((plugin) => plugin.name)),
  ];
  if (stale.length || directoryFailures.length) {
    console.error("SEIS ten-plugin distribution files are stale:");
    for (const file of stale) console.error("- " + file);
    for (const failure of directoryFailures) console.error("- " + failure);
    console.error("Run node scripts/create-seis-general-plugin-distribution.mjs to refresh them.");
    process.exit(1);
  }
  console.log("SEIS ten-plugin distribution check passed (10 general plugins / 30 internal packages / 15 capability cap).");
} else {
  removeLegacyGeneratedBundleDirectories();
  for (const [file, value] of outputs) writeText(file, value);
  assert(directorySetFailures(SEIS_PUBLIC_BUNDLE_ROOT, plan.internalPackages.map((candidate) => candidate.id)).length === 0, "internal package directory set is invalid after generation");
  assert(directorySetFailures(SEIS_GENERAL_PLUGIN_ROOT, plan.generalPlugins.filter((plugin) => !plugin.canonical).map((plugin) => plugin.name)).length === 0, "general plugin directory set is invalid after generation");
  console.log("SEIS ten-plugin distribution generated (10 general plugins / 30 internal packages).");
}

function buildFamily() {
  const internalPackages = plan.internalPackages.map((candidate) => {
    const owner = generalByPackageId.get(candidate.id);
    assert(owner, "internal package has no general plugin owner: " + candidate.id);
    return {
      ...packageRecord(candidate),
      generalPlugin: generalRecord(owner),
      publicStatus: "internal-package-not-marketplace-card",
      liveRuntimeStatus: "local_read_only_metadata",
    };
  });
  const generalPlugins = plan.generalPlugins.map((plugin) => ({
    ...generalRecord(plugin),
    publicStatus: "repo_marketplace_available_general_plugin",
    liveRuntimeStatus: "local_demo_or_auth_gated",
  }));
  return {
    version: 6,
    id: "seis-public-plugin-family",
    generatedAt: GENERATED_AT,
    mode: "ten_general_seis_plugins_with_thirty_internal_packages",
    summary: "SEIS exposes ten concise general marketplace plugins, led by SEIS-Agent. Thirty hidden internal packages retain every app and topic source capability with at most fifteen members each, so users do not browse or install hundreds of duplicate source cards.",
    defaultInstall: {
      installId: CANONICAL_INSTALL_ID,
      mode: "canonical-general-plugin",
      unifiedSuite: "plugins/seis-ai-agent/assets/unified-suite.json",
      recommendedTaskSelection: "one-general-plugin-per-scoped-task",
    },
    marketplace: {
      path: ".agents/plugins/marketplace.json",
      name: marketplace.name,
      installationPolicy: "AVAILABLE",
      authenticationPolicy: "ON_INSTALL",
      publicAudience: "everyone",
      publicPluginCount: marketplace.plugins.length,
      canonicalOrchestratorCount: 1,
      generalPluginCount: plan.generalPlugins.length,
      internalPackageCount: plan.internalPackages.length,
      internalPackageMarketplaceCardCount: 0,
      migratedRootPluginCount: MIGRATED_ROOT_NAMES.size,
      applicationPluginCount: applicationPlugins.length,
      topicPluginCount: topicPlugins.length,
      sourceCapabilityCount: MIGRATED_ROOT_NAMES.size + applicationPlugins.length + topicPlugins.length,
      entries: marketplace.plugins.map((entry) => ({
        name: entry.name,
        sourcePath: entry.source.path,
        category: entry.category,
        installation: entry.policy.installation,
        authentication: entry.policy.authentication,
      })),
    },
    generalPlugins,
    publicPlugins: generalPlugins,
    internalPackages,
    bundlePackages: internalPackages,
    applicationPlugins: sourceRecords(applicationPlugins, "application"),
    topicPlugins: sourceRecords(topicPlugins, "topic"),
    migratedRootPlugins: ROOT_MODULES.filter((module) => MIGRATED_ROOT_NAMES.has(module.name)).map((module) => ({
      ...module,
      installId: CANONICAL_INSTALL_ID,
      license: "MIT",
      publicStatus: "embedded-retained-source-module",
      marketplaceDiscoverable: true,
      marketplaceCard: false,
      internalPackageId: null,
      publicAudience: "everyone",
      liveRuntimeStatus: "local_demo_or_auth_gated",
    })),
    embeddedModules: ROOT_MODULES.map((module) => ({
      ...module,
      canonicalInstallId: CANONICAL_INSTALL_ID,
      license: "MIT",
      publicStatus: module.name === "seis-ai-agent" ? "canonical-general-plugin" : "embedded-retained-source-module",
      liveRuntimeStatus: "local_demo_or_auth_gated",
      connectedToSeisAi: true,
    })),
    sourceInventory: {
      retainedRootSourceModuleCount: MIGRATED_ROOT_NAMES.size,
      retainedApplicationSourcePackageCount: applicationPlugins.length,
      retainedTopicSourcePackageCount: topicPlugins.length,
      retainedSourcePackageCount: MIGRATED_ROOT_NAMES.size + applicationPlugins.length + topicPlugins.length,
      internalPackageSourceCapabilityCount: applicationPlugins.length + topicPlugins.length,
      sourcePackagesDeleted: false,
      maximumSourceCapabilitiesPerPackage: SEIS_PUBLIC_BUNDLE_SIZE,
      exactOnceInternalPackageCoverage: true,
    },
    release: {
      currentVersion: CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
      previousVersion: PREVIOUS_SEIS_PUBLIC_RELEASE_VERSION,
      changeKind: SEIS_PUBLIC_RELEASE_CHANGE_KIND,
      changeId: SEIS_PUBLIC_RELEASE_CHANGE_ID,
      publicReleaseAllowed: false,
    },
    seisAiConnection: {
      orchestrator: CANONICAL_INSTALL_ID,
      mcpServer: "plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs",
      connectedLanes: ROOT_MODULES.map((module) => module.name),
      embeddedSkillSource: "plugins/seis-ai-agent/skills",
      embeddedLaneProfiles: "plugins/seis-ai-agent/assets/lanes",
      topicPluginSourceRoot: TOPIC_PLUGIN_SOURCE_ROOT,
      topicPluginCount: topicPlugins.length,
    },
    securityModel: {
      secrets: "no_secrets_credentials_tokens_env_values_private_keys_or_cookies_are_committed_or_required_for_core_demo",
      cloud: "public_plugin_availability_does_not_grant_cloud_deploy_ssh_or_provider_access",
      data: "public_plugin_availability_does_not_grant_private_dataset_connector_or_export_access",
      auth: "oauth_account_login_and_live_integrations_require_explicit_user_action",
      destructiveActions: "delete_force_push_deploy_merge_and_live_ssh_actions_remain_approval_gated",
    },
    longHorizonGovernance: [
      "Keep the public marketplace at exactly ten named general plugins, never hundreds of source cards.",
      "Keep SEIS-Agent as the canonical default and select one general plugin per scoped task.",
      "Keep thirty internal packages as non-marketplace selection units with no more than fifteen retained capabilities each.",
      "Keep every application and topic source capability in exactly one internal package and retain source directories.",
      "Require a recorded semver increase for every structural distribution change.",
      "Do not treat marketplace availability as authenticated runtime access.",
    ],
    validation: [
      "npm run check:seis-public-plugin-family",
      "npm run check:seis-public-plugin-bundles",
      "npm run check:seis-public-plugin-release-policy",
      "npm run check:seis-unified-plugin-suite",
      "npm run check:seis-public-plugin-user-readiness",
    ],
  };
}

function buildCatalog() {
  return {
    schemaVersion: 2,
    id: "seis-public-plugin-package-catalog",
    legacyId: "seis-public-plugin-bundle-catalog",
    goalId: "SEIS-GOAL-0029",
    generatedAt: GENERATED_AT,
    status: "repository-local-ten-general-plugin-distribution",
    maturity: "prototype",
    canonicalInstall: CANONICAL_INSTALL_ID,
    marketplace: {
      name: marketplace.name,
      publicCardCount: 10,
      canonicalCardCount: 1,
      generalPluginCardCount: 10,
      internalPackageCardCount: 0,
      internalPackageCount: 30,
      maximumPackageSize: SEIS_PUBLIC_BUNDLE_SIZE,
    },
    sourceCapabilityInventory: {
      rootSourceModuleCount: MIGRATED_ROOT_NAMES.size,
      applicationSourcePackageCount: applicationPlugins.length,
      topicSourcePackageCount: topicPlugins.length,
      retainedSourcePackageCount: MIGRATED_ROOT_NAMES.size + applicationPlugins.length + topicPlugins.length,
      internalPackageSourceCapabilityCount: applicationPlugins.length + topicPlugins.length,
      sourcePackagesDeleted: false,
    },
    installationPolicy: {
      default: "Install SEIS-Agent or one other task-matched general plugin. Its three internal packages are selection metadata, not extra installs.",
      maximumGeneralPluginSelectionsPerTask: 1,
      bulkInstallRequired: false,
      internalPackagesAutoInstalled: false,
      sourceMembersAutoInstalled: false,
      sourcePackagesRemainRepositorySources: true,
    },
    generalPlugins: plan.generalPlugins.map(generalRecord),
    internalPackages: plan.internalPackages.map(packageRecord),
    bundles: plan.internalPackages.map(packageRecord),
    legacyArtifacts: {
      retiredGeneratedCardPrefix: "seis-(application|topic)-bundle-",
      status: "not-in-current-marketplace-projection",
      automaticDeletion: false,
    },
    permissions: { read: ["general profile", "bounded internal package metadata"], write: [], network: [], secrets: [] },
    externalClaims: { publicRelease: false, providerConnectivity: false, deployment: false, signing: false, automaticSourceDeletion: false },
  };
}

function buildGuide() {
  const journeys = plan.generalPlugins.map((plugin) => ({
    id: plugin.id,
    label: plugin.displayName,
    category: plugin.category,
    generalPlugin: {
      id: plugin.id,
      name: plugin.name,
      displayName: plugin.displayName,
      installId: plugin.name + "@seis-repo",
      internalPackageIds: plugin.internalPackageIds,
      sourcePath: plugin.sourcePath,
    },
    internalPackageIds: plugin.internalPackageIds,
    keywords: plugin.keywords,
    selectionInstruction: "Choose this one general plugin only when it matches the scoped task. Its internal packages are not extra install targets.",
  }));
  return {
    version: 2,
    id: "seis-general-plugin-selection-guide",
    generatedAt: GENERATED_AT,
    purpose: "Select one of ten concise general SEIS plugins. Thirty internal packages remain hidden selection units and never become extra marketplace cards.",
    canonicalInstall: CANONICAL_INSTALL_ID,
    marketplace: {
      name: marketplace.name,
      publicCardCount: 10,
      canonicalCardCount: 1,
      generalPluginCardCount: 10,
      internalPackageCardCount: 0,
      internalPackageCount: 30,
      maximumPackageSize: SEIS_PUBLIC_BUNDLE_SIZE,
    },
    selectionBoundary: {
      defaultInstall: CANONICAL_INSTALL_ID,
      maximumGeneralPluginSelectionsPerTask: 1,
      maximumInternalPackageSelectionsPerPlugin: 3,
      bulkInstallAllowed: false,
      internalPackagesAutoInstalled: false,
      sourceMembersAutoInstalled: false,
    },
    finder: {
      id: "seis-general-plugin-finder",
      mode: "local-deterministic-token-match",
      maximumResults: 3,
      maximumQueryLength: 96,
      maximumSearchTermsPerJourney: 96,
      externalAccess: false,
      installation: false,
      sourceTermsReturned: false,
    },
    starterPaths: journeys,
    journeys,
  };
}

function buildReleasePolicy() {
  return {
    schemaVersion: 1,
    id: "seis-public-plugin-release-policy",
    goalId: "SEIS-GOAL-0029",
    generatedAt: GENERATED_AT,
    status: "active-public-release-gated",
    currentRelease: {
      version: CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
      changeKind: SEIS_PUBLIC_RELEASE_CHANGE_KIND,
      changeId: SEIS_PUBLIC_RELEASE_CHANGE_ID,
      reason: "Replace self-reported automation completion with reproducible foreground evidence while retaining the ten general plugins and thirty bounded internal packages.",
      publicRelease: false,
    },
    predecessor: { version: PREVIOUS_SEIS_PUBLIC_RELEASE_VERSION, status: "superseded-by-current-structural-distribution-change" },
    policy: {
      structuralDistributionChangeRequiresVersionIncrease: true,
      directMarketplaceCardCountChangeRequiresVersionIncrease: true,
      internalPackageTopologyChangeRequiresVersionIncrease: true,
      majorAutopilotEvidenceContractChangeRequiresVersionIncrease: true,
      publicReleaseRequiresHumanApproval: true,
      releaseNotesRequired: true,
      rollbackStrategy: "revert-focused-distribution-commit",
    },
    validation: {
      semverIncreased: true,
      publicMarketplaceCardCount: 10,
      internalPackageCount: 30,
      generalPluginCount: 10,
      maximumInternalPackageSize: SEIS_PUBLIC_BUNDLE_SIZE,
    },
  };
}

function sourceRecords(sources, origin) {
  return sources.map((source) => {
    const internalPackage = plan.internalPackages.find((candidate) => candidate.members.some((member) => member.name === source.name));
    const generalPlugin = internalPackage ? generalByPackageId.get(internalPackage.id) : null;
    assert(internalPackage && generalPlugin, "source routing is incomplete for " + source.name);
    return {
      name: source.name,
      displayName: source.displayName,
      sourcePath: source.sourcePath,
      category: source.category,
      installId: generalPlugin.name + "@seis-repo",
      license: "MIT",
      publicStatus: "retained-source-module-internal-package",
      marketplaceDiscoverable: true,
      marketplaceCard: false,
      internalPackageId: internalPackage.id,
      generalPluginId: generalPlugin.id,
      generalPluginName: generalPlugin.name,
      publicAudience: "everyone",
      liveRuntimeStatus: origin === "application" ? "local_demo_or_auth_gated" : "local_demo_only",
    };
  });
}

function packageRecord(candidate) {
  return {
    id: candidate.id,
    name: candidate.name,
    family: candidate.family,
    familyId: candidate.familyId,
    familyLabel: candidate.familyLabel,
    displayName: candidate.displayName,
    sourcePath: candidate.sourcePath,
    category: candidate.category,
    categoryLabels: candidate.categoryLabels,
    memberCount: candidate.memberCount,
    memberNames: candidate.members.map((member) => member.name),
    members: candidate.members,
    license: "MIT",
  };
}

function generalRecord(plugin) {
  return {
    id: plugin.id,
    name: plugin.name,
    displayName: plugin.displayName,
    category: plugin.category,
    sourcePath: plugin.sourcePath,
    installId: plugin.name + "@seis-repo",
    canonical: plugin.canonical,
    status: plugin.status,
    shortDescription: plugin.shortDescription,
    longDescription: plugin.longDescription,
    keywords: plugin.keywords,
    internalPackageIds: plugin.internalPackageIds,
    internalPackageCount: plugin.internalPackageCount,
    license: "MIT",
  };
}

function buildAgentManifest(existing) {
  const interfaceValue = object(existing.interface);
  return {
    ...existing,
    version: CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
    description: "Canonical SEIS-Agent general plugin. One of ten concise public SEIS plugins backed by bounded internal capability packages.",
    interface: {
      ...interfaceValue,
      displayName: "SEIS-Agent",
      shortDescription: "Canonical SEIS AI, agent, routing, and orchestration plugin.",
      longDescription: "SEIS-Agent is the canonical default among ten public general SEIS plugins. It keeps source capabilities behind thirty bounded internal packages rather than exposing hundreds of duplicate marketplace cards.",
      capabilities: uniqueStrings([
        ...list(interfaceValue.capabilities).slice(0, 12),
        "Ten general SEIS plugin selection",
        "Thirty bounded internal packages",
        "One general plugin per scoped task",
      ]),
      defaultPrompt: [
        "Choose one of the ten general SEIS plugins for this scoped task; never bulk-install internal packages.",
        "Route this SEIS work across cloud, code, design, data, security, research, automation, and product.",
        "Plan the next SEIS-Agent milestone without publishing, deploying, or enabling external write access.",
      ],
    },
  };
}

function buildAgentProfile(existing) {
  const profile = object(existing);
  const {
    applicationSourceBoundary: ignoredApplicationSourceBoundary,
    terminalInstall: ignoredTerminalInstall,
    publicBundleFinder: ignoredPublicBundleFinder,
    publicGeneralPluginFinder: ignoredPublicGeneralPluginFinder,
    ...stableProfile
  } = profile;
  const {
    publicMarketplaceBundleCount: ignoredPublicMarketplaceBundleCount,
    ...stableApplicationSourceBoundary
  } = object(ignoredApplicationSourceBoundary);
  return {
    ...stableProfile,
    version: Math.max(Number(profile.version) || 0, 3),
    releaseVersion: CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
    status: "development",
    intent: "Unify SEIS specialist lanes and retained public source packages into ten concise general plugins with thirty bounded internal packages while keeping live external capabilities approval-gated.",
    consolidationPolicy: {
      ...object(profile.consolidationPolicy),
      primaryInstallId: CANONICAL_INSTALL_ID,
      defaultInstallMode: "canonical-general-plugin",
      marketplacePolicy: "ten-general-seis-plugins-with-thirty-hidden-bounded-internal-packages",
      futurePluginIntake: "Every future SEIS source capability must enter the unified suite and exactly one reviewed internal package before one of ten general plugins can expose it.",
    },
    applicationSourceBoundary: {
      ...stableApplicationSourceBoundary,
      distributionScope: "ten-general-plugins-with-internal-packages",
      applicationOwnedPluginCount: applicationPlugins.length,
      publicMarketplaceEntryCount: 10,
      publicMarketplaceCardCount: 10,
      publicMarketplaceGeneralPluginCount: 10,
      publicMarketplaceInternalPackageCardCount: 0,
      publicMarketplaceInternalPackageCount: 30,
      internalPackageCount: 30,
      sourceCapabilityCount: MIGRATED_ROOT_NAMES.size + applicationPlugins.length + topicPlugins.length,
      futureIntake: "New SEIS Command Center plugins remain public repository sources, enter exactly one internal package, and surface through one of ten general plugins.",
    },
    terminalInstall: {
      entrypoint: "node scripts/install-seis-ai-agent.mjs",
      packageScript: "npm run install:seis-ai-agent",
      defaultTarget: CANONICAL_INSTALL_ID,
      generalPluginSelection: {
        guide: "assets/public-bundle-selection-guide.json",
        argument: "--journey <general-plugin-id>",
        defaultTargetCount: 1,
        maximumGeneralPluginSelectionsPerTask: 1,
        planOnlyByDefault: true,
        applyRequiresExplicitFlag: true,
        finder: { argument: "--find <short-local-need>", maximumResults: 3, maximumQueryLength: 96, planOnly: true, installation: false, externalAccess: false },
      },
    },
    publicGeneralPluginFinder: {
      tool: "seis_general_plugin_find",
      guide: "assets/public-bundle-selection-guide.json",
      mode: "local-deterministic-token-match",
      maximumResults: 3,
      maximumQueryLength: 96,
      externalAccess: false,
      installation: false,
    },
    qualityCommands: uniqueStrings([...list(profile.qualityCommands), "npm run check:seis-public-plugin-release-policy", "npm run check:seis-public-plugin-user-readiness"]),
  };
}

function internalPackageOutputs(candidate) {
  const root = SEIS_PUBLIC_BUNDLE_ROOT + "/" + candidate.id;
  const profile = {
    schemaVersion: 1,
    id: candidate.id,
    kind: "seis-internal-capability-package",
    generatedAt: GENERATED_AT,
    version: CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
    visibility: "internal-not-marketplace-card",
    memberCount: candidate.memberCount,
    maximumMemberCount: SEIS_PUBLIC_BUNDLE_SIZE,
    category: candidate.category,
    categoryLabels: candidate.categoryLabels,
    generalPlugin: generalRecord(generalByPackageId.get(candidate.id)),
    members: candidate.members,
  };
  return pluginArtifactOutputs(root, candidate.id, candidate.displayName, candidate.category, candidate.longDescription, ["seis", "internal-package"], profile, "package-profile.json");
}

function generalPluginOutputs(plugin) {
  const root = SEIS_GENERAL_PLUGIN_ROOT + "/" + plugin.name;
  const profile = {
    schemaVersion: 1,
    id: plugin.id,
    name: plugin.name,
    displayName: plugin.displayName,
    generatedAt: GENERATED_AT,
    version: CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
    status: "release-ready-not-published",
    visibility: "public-general-plugin",
    canonical: false,
    installId: plugin.name + "@seis-repo",
    internalPackageIds: plugin.internalPackageIds,
    internalPackageCount: plugin.internalPackageCount,
    taskSelectionBoundary: "one-general-plugin-per-scoped-task",
    permissions: { read: ["profile", "internal package metadata"], write: [], network: [], secrets: [] },
  };
  return pluginArtifactOutputs(root, plugin.name, plugin.displayName, plugin.category, plugin.longDescription, ["seis", "general-plugin", ...plugin.keywords], profile, "general-plugin-profile.json");
}

function pluginArtifactOutputs(root, name, displayName, category, description, keywords, profile, profileFile) {
  const manifest = {
    name,
    version: CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
    description,
    author: { name: "emirhankudun-ux", url: "https://github.com/emirhankudun-ux" },
    homepage: "https://github.com/emirhankudun-ux/SEIS",
    repository: "https://github.com/emirhankudun-ux/SEIS",
    license: "MIT",
    keywords: uniqueStrings(keywords),
    skills: "./skills/",
    interface: {
      displayName,
      shortDescription: boundedDescription(description, 120),
      longDescription: description,
      developerName: "emirhankudun-ux",
      category,
      capabilities: ["Read-only source discovery", "Scoped planning", "Bounded package metadata"],
      websiteURL: "https://github.com/emirhankudun-ux/SEIS",
      defaultPrompt: ["Use " + displayName + " for this scoped SEIS task."],
    },
  };
  return [
    [root + "/.codex-plugin/plugin.json", json(manifest)],
    [root + "/assets/" + profileFile, json(profile)],
    [root + "/skills/" + name + "/SKILL.md", ["---", "name: " + name, "description: " + boundedDescription(description, 160), "---", "", "# " + displayName, "", "Use this bounded SEIS surface for one scoped task. It does not grant network, write, secret, deployment, or publication access.", ""].join("\n")],
    [root + "/README.md", ["# " + displayName, "", description, "", "This is a versioned, public-safe SEIS plugin artifact. It never bulk-installs source members or grants external access.", ""].join("\n")],
  ];
}

function boundedDescription(description, maximumLength) {
  return description.length <= maximumLength ? description : description.slice(0, maximumLength).trimEnd();
}

function familyMarkdown() {
  return [
    "# SEIS Public Plugin Family",
    "",
    "- Release version: " + CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
    "- Marketplace cards: 10",
    "- General plugins: 10",
    "- Internal packages: 30",
    "- Maximum capabilities per internal package: 15",
    "- Retained source capabilities: 380",
    "",
    "The marketplace shows ten named general plugins. A user chooses one relevant plugin for a scoped task; its three internal packages are not extra marketplace cards or automatic installs.",
    "",
    "## General plugins",
    "",
    ...plan.generalPlugins.map((plugin) => "- " + plugin.displayName + " - " + plugin.internalPackageIds.join(", ")),
    "",
  ].join("\n");
}

function guideMarkdown() {
  return [
    "# SEIS General Plugin Selection Guide",
    "",
    "Start with SEIS-Agent or choose exactly one of the ten general plugins when a scoped task is clearly specialized. The three internal packages behind a general plugin are never separate installs.",
    "",
    "| General plugin | Focus | Packages |",
    "| --- | --- | ---: |",
    ...plan.generalPlugins.map((plugin) => "| " + plugin.displayName + " | " + plugin.keywords.join(", ") + " | " + String(plugin.internalPackageIds.length) + " |"),
    "",
  ].join("\n");
}

function releasePolicyMarkdown() {
  return [
    "# SEIS Public Plugin Version Policy",
    "",
    "- Previous version: " + PREVIOUS_SEIS_PUBLIC_RELEASE_VERSION,
    "- Current version: " + CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
    "- Change kind: " + SEIS_PUBLIC_RELEASE_CHANGE_KIND,
    "",
    "Every structural public distribution change, including marketplace-card count, internal-package topology, or the major Auto Mode evidence contract, must record a semver increase and release notes before publication.",
    "",
  ].join("\n");
}

function discoverApplicationPlugins() {
  const sourceRoot = path.join(ROOT, "plugins", "seis-core");
  return fs.readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const pluginRoot = path.join(sourceRoot, entry.name);
      const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
      const profilePath = path.join(pluginRoot, "assets", "plugin-profile.json");
      if (!fs.existsSync(manifestPath) || !fs.existsSync(profilePath)) return null;
      const manifest = readJson(relativePath(manifestPath));
      const profile = readJson(relativePath(profilePath));
      return { name: manifest.name || entry.name, displayName: manifest.interface && manifest.interface.displayName || manifest.name || entry.name, sourcePath: "./plugins/seis-core/" + entry.name, category: manifest.interface && manifest.interface.category || profile.category || "Developer" };
    })
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name));
}

function discoverTopicPlugins() {
  const sourceRoot = path.join(ROOT, TOPIC_PLUGIN_SOURCE_ROOT);
  const definitionsById = new Map(topicDefinitions.map((topic) => [topic.id, topic]));
  return fs.readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "runtime")
    .map((entry) => {
      const pluginRoot = path.join(sourceRoot, entry.name);
      const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
      const profilePath = path.join(pluginRoot, "assets", "topic-profile.json");
      const definition = definitionsById.get(entry.name);
      if (!definition || !fs.existsSync(manifestPath) || !fs.existsSync(profilePath)) return null;
      const manifest = readJson(relativePath(manifestPath));
      const profile = readJson(relativePath(profilePath));
      return { name: manifest.name || entry.name, displayName: manifest.interface && manifest.interface.displayName || "SEIS " + definition.displayName, sourcePath: "./" + TOPIC_PLUGIN_SOURCE_ROOT + "/" + entry.name, category: manifest.interface && manifest.interface.category || profile.category || definition.category };
    })
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name));
}

function validateContracts() {
  assert(marketplace.plugins.length === SEIS_PUBLIC_MARKETPLACE_CARD_COUNT, "marketplace must expose exactly ten cards");
  assert(marketplace.plugins.filter((entry) => entry.name === "seis-ai-agent").length === 1, "marketplace must expose one canonical SEIS-Agent");
  assert(family.marketplace.publicPluginCount === 10 && family.marketplace.internalPackageCount === 30, "family counts are invalid");
  assert(catalog.marketplace.publicCardCount === 10 && catalog.marketplace.internalPackageCount === 30, "catalog counts are invalid");
  assert(guide.journeys.length === 10 && guide.starterPaths.length === 10, "guide must expose ten general choices");
  assert(releasePolicy.validation.semverIncreased, "release policy must record a semver increase");
  assert(plan.internalPackages.every((candidate) => packageById.has(candidate.id)), "internal package identity is invalid");
}

function removeLegacyGeneratedBundleDirectories() {
  const root = safePath(SEIS_PUBLIC_BUNDLE_ROOT);
  if (!fs.existsSync(root)) return;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !LEGACY_GENERATED_BUNDLE_PATTERN.test(entry.name)) continue;
    const target = path.join(root, entry.name);
    const relation = path.relative(root, target);
    assert(relation === entry.name && !path.isAbsolute(relation), "legacy bundle cleanup target is unsafe");
    const stat = fs.lstatSync(target);
    assert(stat.isDirectory() && !stat.isSymbolicLink(), "legacy bundle cleanup target is not a regular directory");
    fs.rmSync(target, { recursive: true, force: false });
  }
}

function directorySetFailures(relativeRoot, expectedNames) {
  const root = safePath(relativeRoot);
  if (!fs.existsSync(root)) return [relativeRoot + " is missing"];
  const actualDirectories = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink())
    .map((entry) => entry.name)
    .sort();
  const expectedDirectories = [...expectedNames].sort();
  const unexpected = actualDirectories.filter((name) => !expectedDirectories.includes(name));
  const missing = expectedDirectories.filter((name) => !actualDirectories.includes(name));
  return [
    ...unexpected.map((name) => relativeRoot + "/" + name + " is not in the canonical generated directory set"),
    ...missing.map((name) => relativeRoot + "/" + name + " is missing from the canonical generated directory set"),
  ];
}

function json(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

function writeText(relative, value) {
  const absolute = safePath(relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, value, "utf8");
}

function readJson(relative) {
  return JSON.parse(readText(relative));
}

function readText(relative) {
  return fs.readFileSync(safePath(relative), "utf8");
}

function readOptionalText(relative) {
  const absolute = safePath(relative);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : null;
}

function relativePath(absolute) {
  return path.relative(ROOT, absolute).replaceAll(path.sep, "/");
}

function safePath(relative) {
  const absolute = path.resolve(ROOT, relative);
  const relation = path.relative(ROOT, absolute);
  if (relation === "" || relation === ".." || relation.startsWith(".." + path.sep) || path.isAbsolute(relation)) {
    throw new Error("SEIS general plugin distribution path escaped the repository: " + relative);
  }
  return absolute;
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()))];
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS general plugin distribution: " + message);
}
