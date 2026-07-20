#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const GENERATED_AT = "2026-07-20";
const OUTPUT_PATH = "content/development/seis-mcp-permission-risk-matrix.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const FAMILY_PATH = "content/development/seis-public-plugin-family.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const RELEASE_TRAIN_PATH = "content/development/seis-core-plugin-release-train.json";
const SOURCE_ROOT = "plugins/seis-core";
const PLUGIN_ID = "seis-mcp-permission";

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  const actual = readText(OUTPUT_PATH);
  if (actual !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-mcp-permission`);
    process.exit(1);
  }
  console.log("SEIS MCP permission boundary check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for ${record.counts.applicationPluginCount} public app MCP declarations.`);
}

function buildRecord() {
  const marketplace = readJson(MARKETPLACE_PATH);
  const family = readJson(FAMILY_PATH);
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const releaseTrain = readJson(RELEASE_TRAIN_PATH);
  const currentRelease = releaseTrain.currentRelease || {};
  const bundles = discoverBundles();
  const cards = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
  const appCards = cards.filter((card) => typeof card?.source?.path === "string" && card.source.path.startsWith(`./${SOURCE_ROOT}/`));
  const sourceEntries = Array.isArray(sourceManifest.plugins) ? sourceManifest.plugins : [];
  const expectedCardCount = Array.isArray(family.publicPlugins) ? family.publicPlugins.length : 0;
  const rootCardCount = Array.isArray(family.migratedRootPlugins) ? family.migratedRootPlugins.length : 0;
  const topicCardCount = Array.isArray(family.topicPlugins) ? family.topicPlugins.length : 0;
  const expectedMarketplaceCount = expectedCardCount + rootCardCount + bundles.length + topicCardCount;

  assert(marketplace.name === "seis-repo", "marketplace must be seis-repo");
  assert(marketplace.interface?.displayName === "SEIS Repo", "marketplace display name must be SEIS Repo");
  assert(bundles.length === APP_PLUGIN_EXPANSION_TARGET, `app plugin count must be ${APP_PLUGIN_EXPANSION_TARGET}`);
  assert(sourceManifest.pluginCount === bundles.length, "app source manifest plugin count is stale");
  assert(sourceEntries.length === bundles.length, "app source manifest entries are incomplete");
  assert(new Set(sourceEntries.map((entry) => entry?.name)).size === bundles.length, "app source manifest names must be unique");
  assert(appCards.length === bundles.length, "marketplace app card count is stale");
  assert(cards.length === expectedMarketplaceCount, "marketplace card count is stale");
  assert(family.marketplace?.publicPluginCount === cards.length, "public family card count is stale");
  assert(family.marketplace?.applicationPluginCount === bundles.length, "public family app count is stale");
  assert(currentRelease.label && currentRelease.semver, "app release train is incomplete");

  const records = bundles.map((bundle) => buildBundleRecord(bundle, cards, sourceEntries, currentRelease));
  const record = {
    schemaVersion: 1,
    id: "seis-mcp-permission-risk-matrix",
    goalId: "SEIS-GOAL-021",
    generatedAt: GENERATED_AT,
    status: "active-public-seis-repo-deny-by-default",
    purpose: "Keep the declared local stdio MCP envelope for every public SEIS Repo app package observable and deterministic without starting servers, granting permissions, or treating a metadata check as release approval.",
    plugin: {
      name: PLUGIN_ID,
      displayName: "SEIS MCP Permission Boundary",
      marketplaceName: "seis-repo",
      sourcePath: `${SOURCE_ROOT}/${PLUGIN_ID}`,
      publicAudience: "everyone",
      publicMarketplace: true,
    },
    scope: {
      marketplacePath: MARKETPLACE_PATH,
      sourceManifestPath: SOURCE_MANIFEST_PATH,
      releaseTrainPath: RELEASE_TRAIN_PATH,
      sourceRoot: SOURCE_ROOT,
      marketplaceName: marketplace.name,
      marketplaceDisplayName: marketplace.interface?.displayName,
      releaseLabel: currentRelease.label,
      releaseSemver: currentRelease.semver,
    },
    policy: {
      transport: "local-stdio",
      command: "node",
      exactlyOneServerPerPackage: true,
      serverNameRule: "matches-public-plugin-id",
      entrypointRule: "declared-mcp-argument-matches-profile-entrypoint",
      acceptedServerConfigKeys: ["args", "command"],
      remoteUrlAllowed: false,
      environmentInjectionAllowed: false,
      permissions: {
        write: [],
        network: [],
        secrets: [],
      },
      humanApprovalRequiredFor: [
        "permission changes",
        "remote MCP access",
        "credentials",
        "network access",
        "external writes",
        "public release",
      ],
    },
    counts: {
      marketplaceCardCount: cards.length,
      canonicalOrchestratorCount: expectedCardCount,
      migratedRootPluginCount: rootCardCount,
      applicationPluginCount: bundles.length,
      topicPluginCount: topicCardCount,
      applicationMcpServerCount: records.length,
      localStdioServerCount: records.length,
      remoteServerCount: 0,
      writePermissionGrantCount: 0,
      networkPermissionGrantCount: 0,
      secretPermissionGrantCount: 0,
      validRecordCount: records.length,
      invalidRecordCount: 0,
    },
    records,
    safety: {
      reads: [MARKETPLACE_PATH, FAMILY_PATH, SOURCE_MANIFEST_PATH, RELEASE_TRAIN_PATH, `${SOURCE_ROOT}/*/.codex-plugin/plugin.json`, `${SOURCE_ROOT}/*/.mcp.json`, `${SOURCE_ROOT}/*/assets/plugin-profile.json`],
      write: [],
      network: [],
      secrets: [],
      startsMcpServers: false,
      permissionGrant: false,
      publicReleaseAllowed: false,
    },
    limitations: [
      "This ledger validates declared public package metadata only; it does not start or connect to an MCP server.",
      "An empty declared permission set is not proof of current Codex enablement, external safety, authorization, or release approval.",
      "Remote endpoints, provider credentials, mutable tool calls, and external writes remain outside this plugin boundary.",
    ],
  };

  validateRecord(record, { bundles, cards, currentRelease });
  return record;
}

function buildBundleRecord(bundle, cards, sourceEntries, currentRelease) {
  const { name, manifest, profile, mcp } = bundle;
  const card = cards.find((candidate) => candidate?.name === name);
  const sourceEntry = sourceEntries.find((candidate) => candidate?.name === name);
  const servers = mcp?.mcpServers;
  const serverNames = servers && typeof servers === "object" && !Array.isArray(servers) ? Object.keys(servers) : [];
  const server = servers?.[name];
  const expectedSourcePath = `./${SOURCE_ROOT}/${name}`;

  assert(Boolean(card), `${name}: marketplace card is missing`);
  assert(card?.source?.source === "local", `${name}: marketplace source must be local`);
  assert(card?.source?.path === expectedSourcePath, `${name}: marketplace source path is invalid`);
  assert(card?.policy?.installation === "AVAILABLE", `${name}: marketplace installation policy is invalid`);
  assert(card?.policy?.authentication === "ON_INSTALL", `${name}: marketplace authentication policy is invalid`);
  assert(sourceEntry?.sourcePath === `${SOURCE_ROOT}/${name}`, `${name}: source manifest path is invalid`);
  assert(manifest.name === name, `${name}: manifest name is invalid`);
  assert(manifest.version === currentRelease.semver, `${name}: manifest release is stale`);
  assert(manifest.mcpServers === "./.mcp.json", `${name}: manifest MCP reference is invalid`);
  assert(profile.stableId === name, `${name}: profile identifier is invalid`);
  assert(profile.version === currentRelease.semver, `${name}: profile release is stale`);
  assert(profile.releaseTrainVersion === currentRelease.label, `${name}: profile release label is stale`);
  assert(profile.entrypoint && isRelativePluginPath(profile.entrypoint), `${name}: profile entrypoint is invalid`);
  assert(emptyPermissionSet(profile.permissions), `${name}: profile must retain deny-by-default permissions`);
  assert(Object.keys(mcp || {}).length === 1 && Object.hasOwn(mcp || {}, "mcpServers"), `${name}: MCP envelope is invalid`);
  assert(serverNames.length === 1 && serverNames[0] === name, `${name}: MCP server name must match the public plugin id`);
  assert(server && typeof server === "object" && !Array.isArray(server), `${name}: MCP server declaration is invalid`);
  assert(sameStringSet(Object.keys(server), ["args", "command"]), `${name}: MCP server config keys are invalid`);
  assert(server.command === "node", `${name}: MCP server command must be node`);
  assert(Array.isArray(server.args) && server.args.length === 1 && server.args[0] === profile.entrypoint, `${name}: MCP args must match the profile entrypoint`);
  assert(isRelativePluginPath(server.args?.[0]), `${name}: MCP entrypoint is invalid`);
  assert(!containsSensitiveOrMachineSpecific({ manifest, profile, mcp, card, sourceEntry }), `${name}: public MCP metadata contains an unsafe visible term`);

  return {
    name,
    marketplaceCard: true,
    sourcePath: `${SOURCE_ROOT}/${name}`,
    transport: "local-stdio",
    serverName: name,
    command: "node",
    entrypoint: profile.entrypoint,
    permissionState: "deny-by-default",
    permissions: { write: [], network: [], secrets: [] },
    remoteEndpointDeclared: false,
    environmentInjectionDeclared: false,
    risk: "low",
    state: "validated-declared-boundary",
  };
}

function validateRecord(record, context) {
  assert(record.id === "seis-mcp-permission-risk-matrix", "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021", "record goal id is invalid");
  assert(record.plugin?.name === PLUGIN_ID, "plugin name is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo", "plugin marketplace is invalid");
  assert(record.scope?.marketplaceName === "seis-repo", "scope marketplace is invalid");
  assert(record.scope?.marketplaceDisplayName === "SEIS Repo", "scope marketplace display name is invalid");
  assert(record.scope?.releaseLabel === context.currentRelease.label, "scope release label is stale");
  assert(record.scope?.releaseSemver === context.currentRelease.semver, "scope release semver is stale");
  assert(record.counts?.applicationPluginCount === context.bundles.length, "record application count is stale");
  assert(record.counts?.marketplaceCardCount === context.cards.length, "record marketplace card count is stale");
  assert(record.counts?.applicationMcpServerCount === context.bundles.length, "record MCP server count is stale");
  assert(record.counts?.localStdioServerCount === context.bundles.length, "record local stdio count is stale");
  assert(record.counts?.remoteServerCount === 0, "record must not declare remote servers");
  assert(record.counts?.writePermissionGrantCount === 0, "record must not declare write grants");
  assert(record.counts?.networkPermissionGrantCount === 0, "record must not declare network grants");
  assert(record.counts?.secretPermissionGrantCount === 0, "record must not declare secret grants");
  assert(Array.isArray(record.records) && record.records.length === context.bundles.length, "record list is incomplete");
  assert(new Set(record.records.map((entry) => entry.name)).size === context.bundles.length, "record names must be unique");
  for (const item of record.records) {
    assert(item.marketplaceCard === true, `${item.name}: record marketplace state is invalid`);
    assert(item.transport === "local-stdio", `${item.name}: record transport is invalid`);
    assert(item.serverName === item.name, `${item.name}: record server name is invalid`);
    assert(item.command === "node", `${item.name}: record command is invalid`);
    assert(isRelativePluginPath(item.entrypoint), `${item.name}: record entrypoint is invalid`);
    assert(item.permissionState === "deny-by-default", `${item.name}: record permission state is invalid`);
    assert(emptyPermissionSet(item.permissions), `${item.name}: record permissions are invalid`);
    assert(item.remoteEndpointDeclared === false, `${item.name}: record remote endpoint state is invalid`);
    assert(item.environmentInjectionDeclared === false, `${item.name}: record environment state is invalid`);
  }
  assert(emptyPermissionSet(record.policy?.permissions), "policy permissions must remain empty");
  assert(record.policy?.remoteUrlAllowed === false, "policy must reject remote URLs");
  assert(record.policy?.environmentInjectionAllowed === false, "policy must reject environment injection");
  assert(record.safety?.write?.length === 0, "safety write permissions must be empty");
  assert(record.safety?.network?.length === 0, "safety network permissions must be empty");
  assert(record.safety?.secrets?.length === 0, "safety secret permissions must be empty");
  assert(record.safety?.startsMcpServers === false, "safety must not start MCP servers");
  assert(record.safety?.permissionGrant === false, "safety must not grant permissions");
  assert(record.safety?.publicReleaseAllowed === false, "safety must not allow public release");
  assert(!containsSensitiveOrMachineSpecific(record), "record contains an unsafe visible term");
}

function discoverBundles() {
  const root = path.join(ROOT, ...SOURCE_ROOT.split("/"));
  if (!isDirectory(root)) throw new Error("SEIS MCP permission: app plugin source root is missing");
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isRegularFile(path.join(root, entry.name, ".codex-plugin", "plugin.json")))
    .map((entry) => {
      const pluginRoot = path.join(root, entry.name);
      return {
        name: entry.name,
        manifest: readJson(path.join(SOURCE_ROOT, entry.name, ".codex-plugin", "plugin.json")),
        profile: readJson(path.join(SOURCE_ROOT, entry.name, "assets", "plugin-profile.json")),
        mcp: readJson(path.join(SOURCE_ROOT, entry.name, ".mcp.json")),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function emptyPermissionSet(value) {
  return ["write", "network", "secrets"].every((key) => Array.isArray(value?.[key]) && value[key].length === 0);
}

function sameStringSet(actual, expected) {
  return Array.isArray(actual)
    && actual.length === expected.length
    && new Set(actual).size === actual.length
    && actual.every((value) => expected.includes(value));
}

function isRelativePluginPath(value) {
  return typeof value === "string"
    && value.startsWith("scripts/")
    && value.endsWith(".mjs")
    && !value.includes("..")
    && !path.isAbsolute(value);
}

function containsSensitiveOrMachineSpecific(value) {
  const serialized = JSON.stringify(value);
  return /\bpersonal\b/i.test(serialized)
    || /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m.test(serialized)
    || /\b(?:gh[pousr]_[A-Za-z0-9_-]{20,}|github_pat_[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16})\b/.test(serialized);
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS MCP permission: ${message}`);
}

function isDirectory(filePath) {
  try {
    return fs.lstatSync(filePath).isDirectory() && !fs.lstatSync(filePath).isSymbolicLink();
  } catch {
    return false;
  }
}

function isRegularFile(filePath) {
  try {
    return fs.lstatSync(filePath).isFile() && !fs.lstatSync(filePath).isSymbolicLink();
  } catch {
    return false;
  }
}

function readJson(relativePath) {
  const absolutePath = path.isAbsolute(relativePath) ? relativePath : path.join(ROOT, relativePath);
  if (!isRegularFile(absolutePath)) throw new Error(`SEIS MCP permission: unsafe or missing JSON contract ${relativePath}`);
  const stat = fs.statSync(absolutePath);
  if (stat.size > 4 * 1024 * 1024) throw new Error(`SEIS MCP permission: JSON contract exceeds size limit ${relativePath}`);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  return isRegularFile(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
