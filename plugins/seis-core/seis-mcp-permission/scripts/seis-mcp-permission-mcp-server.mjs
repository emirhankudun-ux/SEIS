#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACTS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
  family: "content/development/seis-public-plugin-family.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  sources: "apps/seis-core/data/seis-core-plugin-sources.json",
  ledger: "content/development/seis-mcp-permission-risk-matrix.json",
});
const MAX_VISIBLE_RECORDS = 24;

function status() {
  return {
    plugin: "seis-mcp-permission",
    status: isRegularFile(path.join(pluginRoot, "skills", "seis-mcp-permission", "SKILL.md")) ? "ready" : "partial",
    mode: "public-seis-repo-mcp-permission-read-only",
    startsMcpServers: false,
    permissionGrant: false,
    writes: "disabled-by-design",
    network: "disabled-by-design",
    secrets: "not-read",
    permissions: permissionBoundary(),
    publicReleaseAllowed: false,
  };
}

function validateMcpPermission() {
  const located = findRepoRoot();
  if (!located) return unavailable("seis-repo-marketplace-not-found");
  const loaded = loadContracts(located.repoRoot);
  if (loaded.error) return unavailable(loaded.error);

  const { marketplace, family, bundleCatalog, sources, ledger } = loaded.contracts;
  const findings = [];
  const cards = array(marketplace.plugins);
  const directAppCards = cards.filter((card) => typeof card?.source?.path === "string" && card.source.path.startsWith("./plugins/seis-core/"));
  const expectedNames = array(sources.plugins).map((item) => safePluginId(item?.name)).filter(Boolean).sort();
  const recordNames = array(ledger.records).map((item) => safePluginId(item?.name)).filter(Boolean).sort();
  const canonicalCardNames = names(family.publicPlugins);
  const rootSourceNames = names(family.migratedRootPlugins);
  const applicationSourceNames = names(family.applicationPlugins);
  const topicSourceNames = names(family.topicPlugins);
  const bundleState = validateBundleCatalog(bundleCatalog, cards, expectedNames, topicSourceNames, findings);
  const sourceCapabilityCount = rootSourceNames.length + applicationSourceNames.length + topicSourceNames.length;

  ensure(marketplace.name === "seis-repo", findings, "marketplace-name-invalid");
  ensure(marketplace.interface?.displayName === "SEIS Repo", findings, "marketplace-display-name-invalid");
  ensure(bundleCatalog.id === "seis-public-plugin-bundle-catalog", findings, "bundle-catalog-id-invalid");
  ensure(sources.id === "seis-core-plugin-sources", findings, "source-manifest-id-invalid");
  ensure(sources.sourceRoot === "plugins/seis-core", findings, "source-manifest-root-invalid");
  ensure(sources.pluginCount === expectedNames.length, findings, "source-manifest-count-invalid");
  ensure(new Set(expectedNames).size === expectedNames.length, findings, "source-manifest-names-invalid");
  ensure(sameStringSet(applicationSourceNames, expectedNames), findings, "family-application-source-names-stale");
  ensure(ledger.id === "seis-mcp-permission-risk-matrix", findings, "ledger-id-invalid");
  ensure(ledger.schemaVersion === 2, findings, "ledger-schema-version-invalid");
  ensure(ledger.goalId === "SEIS-GOAL-021", findings, "ledger-goal-invalid");
  ensure(ledger.plugin?.name === "seis-mcp-permission", findings, "ledger-plugin-invalid");
  ensure(ledger.plugin?.marketplaceCard === false, findings, "ledger-plugin-direct-card-invalid");
  ensure(ledger.plugin?.distributionBundleId === bundleState.applicationBundleBySourceName.get("seis-mcp-permission"), findings, "ledger-plugin-distribution-bundle-invalid");
  ensure(ledger.plugin?.marketplaceName === "seis-repo", findings, "ledger-marketplace-invalid");
  ensure(ledger.scope?.marketplaceName === "seis-repo", findings, "ledger-scope-marketplace-invalid");
  ensure(ledger.scope?.marketplaceDisplayName === "SEIS Repo", findings, "ledger-scope-display-name-invalid");
  ensure(ledger.scope?.bundleCatalogPath === CONTRACTS.bundleCatalog, findings, "ledger-bundle-catalog-path-invalid");
  ensure(ledger.counts?.marketplaceCardCount === cards.length, findings, "ledger-marketplace-count-stale");
  ensure(ledger.counts?.canonicalOrchestratorCount === canonicalCardNames.length, findings, "ledger-canonical-card-count-stale");
  ensure(ledger.counts?.bundleCardCount === bundleState.bundles.length, findings, "ledger-bundle-card-count-stale");
  ensure(ledger.counts?.applicationBundleCardCount === bundleState.applicationBundles.length, findings, "ledger-application-bundle-card-count-stale");
  ensure(ledger.counts?.topicBundleCardCount === bundleState.topicBundles.length, findings, "ledger-topic-bundle-card-count-stale");
  ensure(ledger.counts?.sourceCapabilityCount === sourceCapabilityCount, findings, "ledger-source-capability-count-stale");
  ensure(ledger.counts?.retainedRootSourceCapabilityCount === rootSourceNames.length, findings, "ledger-root-source-count-stale");
  ensure(ledger.counts?.applicationSourceCapabilityCount === expectedNames.length, findings, "ledger-application-source-count-stale");
  ensure(ledger.counts?.topicSourceCapabilityCount === topicSourceNames.length, findings, "ledger-topic-source-count-stale");
  ensure(ledger.counts?.directApplicationMarketplaceCardCount === 0, findings, "ledger-direct-application-card-count-invalid");
  ensure(ledger.counts?.applicationBundleMembershipCount === expectedNames.length, findings, "ledger-application-bundle-membership-count-stale");
  ensure(ledger.counts?.applicationMcpServerCount === expectedNames.length, findings, "ledger-server-count-stale");
  ensure(ledger.counts?.localStdioServerCount === expectedNames.length, findings, "ledger-local-stdio-count-stale");
  ensure(ledger.counts?.remoteServerCount === 0, findings, "ledger-remote-server-count-invalid");
  ensure(ledger.counts?.writePermissionGrantCount === 0, findings, "ledger-write-grant-count-invalid");
  ensure(ledger.counts?.networkPermissionGrantCount === 0, findings, "ledger-network-grant-count-invalid");
  ensure(ledger.counts?.secretPermissionGrantCount === 0, findings, "ledger-secret-grant-count-invalid");
  ensure(ledger.counts?.validRecordCount === expectedNames.length, findings, "ledger-valid-record-count-stale");
  ensure(ledger.counts?.invalidRecordCount === 0, findings, "ledger-invalid-record-count-invalid");
  ensure(directAppCards.length === 0, findings, "marketplace-direct-application-card-present");
  ensure(sameStringSet(cards.map((card) => safePluginId(card?.name)).filter(Boolean), [...canonicalCardNames, ...bundleState.bundles.map((bundle) => bundle.id)]), findings, "marketplace-curated-card-projection-stale");
  ensure(family.marketplace?.publicPluginCount === cards.length, findings, "family-marketplace-card-count-stale");
  ensure(family.marketplace?.canonicalOrchestratorCount === canonicalCardNames.length, findings, "family-canonical-card-count-stale");
  ensure(family.marketplace?.bundlePluginCount === bundleState.bundles.length, findings, "family-bundle-card-count-stale");
  ensure(family.marketplace?.applicationBundlePluginCount === bundleState.applicationBundles.length, findings, "family-application-bundle-card-count-stale");
  ensure(family.marketplace?.topicBundlePluginCount === bundleState.topicBundles.length, findings, "family-topic-bundle-card-count-stale");
  ensure(family.marketplace?.migratedRootPluginCount === rootSourceNames.length, findings, "family-root-source-count-stale");
  ensure(family.marketplace?.applicationPluginCount === expectedNames.length, findings, "family-application-source-count-stale");
  ensure(family.marketplace?.topicPluginCount === topicSourceNames.length, findings, "family-topic-source-count-stale");
  ensure(family.marketplace?.sourceCapabilityCount === sourceCapabilityCount, findings, "family-source-capability-count-stale");
  ensure(bundleCatalog.marketplace?.publicCardCount === cards.length, findings, "bundle-catalog-marketplace-count-stale");
  ensure(bundleCatalog.marketplace?.canonicalCardCount === canonicalCardNames.length, findings, "bundle-catalog-canonical-count-stale");
  ensure(bundleCatalog.marketplace?.bundleCardCount === bundleState.bundles.length, findings, "bundle-catalog-card-count-stale");
  ensure(bundleCatalog.marketplace?.applicationBundleCardCount === bundleState.applicationBundles.length, findings, "bundle-catalog-application-bundle-count-stale");
  ensure(bundleCatalog.marketplace?.topicBundleCardCount === bundleState.topicBundles.length, findings, "bundle-catalog-topic-bundle-count-stale");
  ensure(bundleCatalog.sourceCapabilityInventory?.rootSourceModuleCount === rootSourceNames.length, findings, "bundle-catalog-root-source-count-stale");
  ensure(bundleCatalog.sourceCapabilityInventory?.applicationSourcePackageCount === expectedNames.length, findings, "bundle-catalog-application-source-count-stale");
  ensure(bundleCatalog.sourceCapabilityInventory?.topicSourcePackageCount === topicSourceNames.length, findings, "bundle-catalog-topic-source-count-stale");
  ensure(bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount === sourceCapabilityCount, findings, "bundle-catalog-retained-source-count-stale");
  ensure(sameStringSet(recordNames, expectedNames), findings, "ledger-record-names-stale");
  ensure(emptyPermissionSet(ledger.policy?.permissions), findings, "ledger-policy-permissions-invalid");
  ensure(ledger.policy?.transport === "local-stdio", findings, "ledger-transport-invalid");
  ensure(ledger.policy?.command === "node", findings, "ledger-command-invalid");
  ensure(ledger.policy?.remoteUrlAllowed === false, findings, "ledger-remote-url-policy-invalid");
  ensure(ledger.policy?.environmentInjectionAllowed === false, findings, "ledger-environment-policy-invalid");
  ensure(emptyPermissionSet(ledger.safety), findings, "ledger-safety-permissions-invalid");
  ensure(ledger.safety?.startsMcpServers === false, findings, "ledger-mcp-start-policy-invalid");
  ensure(ledger.safety?.permissionGrant === false, findings, "ledger-permission-grant-policy-invalid");
  ensure(ledger.safety?.publicReleaseAllowed === false, findings, "ledger-release-policy-invalid");
  ensure(!containsUnsafeVisibleTerm(ledger), findings, "ledger-visible-unsafe-term");

  for (const record of array(ledger.records)) validateRecord(record, expectedNames, bundleState, findings);

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  return {
    state: errorCount ? "attention" : "ready",
    ok: errorCount === 0,
    mode: "public-seis-repo-mcp-permission-read-only",
    marketplaceName: marketplace.name === "seis-repo" ? "seis-repo" : null,
    marketplaceDisplayName: marketplace.interface?.displayName === "SEIS Repo" ? "SEIS Repo" : null,
    publicCards: {
      count: cards.length,
      canonicalOrchestratorCount: canonicalCardNames.length,
      bundleCardCount: bundleState.bundles.length,
      applicationBundleCardCount: bundleState.applicationBundles.length,
      topicBundleCardCount: bundleState.topicBundles.length,
      directApplicationCardCount: directAppCards.length,
    },
    sourceCapabilities: {
      count: sourceCapabilityCount,
      retainedRootCount: rootSourceNames.length,
      applicationCount: expectedNames.length,
      topicCount: topicSourceNames.length,
      applicationBundleMembershipCount: bundleState.applicationBundleBySourceName.size,
      applicationMcpServerCount: array(ledger.records).length,
    },
    policy: compactPolicy(ledger.policy),
    errorCount,
    findings: findings.slice(0, MAX_VISIBLE_RECORDS),
    permissions: permissionBoundary(),
    limitations: [
      "Validation reads fixed public SEIS Repo contracts, including curated bundle membership, and does not start, connect to, or probe an MCP server.",
      "Retained source capabilities are not direct marketplace cards and bundle selection does not automatically install members.",
      "A valid declared boundary is not proof of current Codex enablement, external connectivity, authorization, or release approval.",
      "Validation does not install, enable, update, publish, deploy, push, or grant permissions to any plugin.",
    ],
  };
}

function inspectLedger(requestedPlugin) {
  const validation = validateMcpPermission();
  if (!validation.ok) return validation;
  const located = findRepoRoot();
  const loaded = located ? loadContracts(located.repoRoot) : { error: "seis-repo-marketplace-not-found" };
  if (loaded.error) return unavailable(loaded.error);
  const ledger = loaded.contracts.ledger;
  const filter = safePluginId(requestedPlugin);
  if (requestedPlugin && !filter) return invalidInput("plugin-id-invalid");
  const allRecords = array(ledger.records);
  const selected = filter ? allRecords.filter((record) => record.name === filter) : allRecords;
  if (filter && selected.length === 0) return invalidInput("source-capability-not-found");
  return {
    state: "ready",
    ok: true,
    mode: "public-seis-repo-mcp-permission-read-only",
    marketplaceName: validation.marketplaceName,
    marketplaceDisplayName: validation.marketplaceDisplayName,
    recordCount: allRecords.length,
    returnedRecordCount: Math.min(selected.length, MAX_VISIBLE_RECORDS),
    records: selected.slice(0, MAX_VISIBLE_RECORDS).map(compactRecord),
    policy: validation.policy,
    permissions: permissionBoundary(),
    publicReleaseAllowed: false,
    limitations: [
      "Only declared retained source-capability metadata and its curated bundle id are shown; no MCP server is started or contacted.",
      "The ledger does not grant an MCP tool, network, write, secret, or release permission.",
    ],
  };
}

function validateRecord(record, expectedNames, bundleState, findings) {
  const name = safePluginId(record?.name);
  if (!name || !expectedNames.includes(name)) {
    ensure(false, findings, "ledger-record-plugin-invalid");
    return;
  }
  ensure(record.marketplaceCard === false, findings, "ledger-record-direct-marketplace-card-invalid", name);
  ensure(record.distributionBundleId === bundleState.applicationBundleBySourceName.get(name), findings, "ledger-record-distribution-bundle-invalid", name);
  ensure(bundleState.marketplaceBundleCardNames.has(record.distributionBundleId), findings, "ledger-record-distribution-card-missing", name);
  ensure(record.sourcePath === `plugins/seis-core/${name}`, findings, "ledger-record-source-path-invalid", name);
  ensure(record.transport === "local-stdio", findings, "ledger-record-transport-invalid", name);
  ensure(record.serverName === name, findings, "ledger-record-server-name-invalid", name);
  ensure(record.command === "node", findings, "ledger-record-command-invalid", name);
  ensure(isRelativeEntrypoint(record.entrypoint), findings, "ledger-record-entrypoint-invalid", name);
  ensure(record.permissionState === "deny-by-default", findings, "ledger-record-permission-state-invalid", name);
  ensure(emptyPermissionSet(record.permissions), findings, "ledger-record-permissions-invalid", name);
  ensure(record.remoteEndpointDeclared === false, findings, "ledger-record-remote-endpoint-invalid", name);
  ensure(record.environmentInjectionDeclared === false, findings, "ledger-record-environment-invalid", name);
  ensure(record.risk === "low", findings, "ledger-record-risk-invalid", name);
  ensure(record.state === "validated-declared-boundary", findings, "ledger-record-state-invalid", name);
}

function compactPolicy(policy) {
  return {
    transport: policy?.transport === "local-stdio" ? "local-stdio" : null,
    command: policy?.command === "node" ? "node" : null,
    remoteUrlAllowed: policy?.remoteUrlAllowed === false ? false : null,
    environmentInjectionAllowed: policy?.environmentInjectionAllowed === false ? false : null,
    permissions: { write: [], network: [], secrets: [] },
    humanApprovalRequiredFor: array(policy?.humanApprovalRequiredFor).filter((item) => typeof item === "string").slice(0, 8),
  };
}

function compactRecord(record) {
  return {
    name: safePluginId(record?.name),
    marketplaceCard: record?.marketplaceCard === true,
    distributionBundleId: safePluginId(record?.distributionBundleId),
    transport: record?.transport === "local-stdio" ? "local-stdio" : null,
    command: record?.command === "node" ? "node" : null,
    permissionState: record?.permissionState === "deny-by-default" ? "deny-by-default" : null,
    remoteEndpointDeclared: record?.remoteEndpointDeclared === true,
    environmentInjectionDeclared: record?.environmentInjectionDeclared === true,
    risk: record?.risk === "low" ? "low" : null,
    state: record?.state === "validated-declared-boundary" ? "validated-declared-boundary" : null,
  };
}

function validateBundleCatalog(bundleCatalog, cards, expectedApplicationNames, expectedTopicNames, findings) {
  const bundles = array(bundleCatalog.bundles);
  const applicationBundles = bundles.filter((bundle) => bundle?.family === "application");
  const topicBundles = bundles.filter((bundle) => bundle?.family === "topic");
  const marketplaceCardByName = new Map(cards.map((card) => [safePluginId(card?.name), card]));
  const marketplaceBundleCardNames = new Set();
  const applicationBundleBySourceName = new Map();
  const applicationMemberNames = [];
  const topicMemberNames = [];
  const allMemberNames = [];

  ensure(new Set(bundles.map((bundle) => safePluginId(bundle?.id))).size === bundles.length, findings, "bundle-ids-not-unique");

  for (const bundle of bundles) {
    const id = safePluginId(bundle?.id);
    const memberNames = array(bundle?.memberNames).map(safePluginId).filter(Boolean);
    const card = marketplaceCardByName.get(id);
    ensure(Boolean(id), findings, "bundle-id-invalid");
    ensure(bundle?.family === "application" || bundle?.family === "topic", findings, "bundle-family-invalid", id);
    ensure(bundle?.sourcePath === `./plugins/seis-bundles/${id}`, findings, "bundle-source-path-invalid", id);
    ensure(bundle?.memberCount === memberNames.length && memberNames.length > 0 && memberNames.length <= 15, findings, "bundle-member-count-invalid", id);
    ensure(memberNames.length === array(bundle?.memberNames).length && new Set(memberNames).size === memberNames.length, findings, "bundle-member-names-invalid", id);
    ensure(Boolean(card), findings, "bundle-marketplace-card-missing", id);
    ensure(card?.source?.source === "local" && card?.source?.path === bundle?.sourcePath, findings, "bundle-marketplace-source-invalid", id);
    ensure(card?.policy?.installation === "AVAILABLE" && card?.policy?.authentication === "ON_INSTALL", findings, "bundle-marketplace-policy-invalid", id);
    if (id && card) marketplaceBundleCardNames.add(id);
    allMemberNames.push(...memberNames);
    if (bundle?.family === "application") {
      applicationMemberNames.push(...memberNames);
      for (const memberName of memberNames) {
        ensure(!applicationBundleBySourceName.has(memberName), findings, "application-source-multiple-bundle-memberships", memberName);
        if (!applicationBundleBySourceName.has(memberName)) applicationBundleBySourceName.set(memberName, id);
      }
    } else if (bundle?.family === "topic") {
      topicMemberNames.push(...memberNames);
    }
  }

  ensure(new Set(allMemberNames).size === allMemberNames.length, findings, "bundle-member-duplicated-across-catalog");
  ensure(sameStringSet(applicationMemberNames, expectedApplicationNames), findings, "application-bundle-membership-incomplete");
  ensure(sameStringSet(topicMemberNames, expectedTopicNames), findings, "topic-bundle-membership-incomplete");
  ensure(applicationBundleBySourceName.size === expectedApplicationNames.length, findings, "application-bundle-membership-count-stale");

  return { bundles, applicationBundles, topicBundles, marketplaceBundleCardNames, applicationBundleBySourceName };
}

function loadContracts(repoRoot) {
  try {
    return {
      contracts: Object.fromEntries(Object.entries(CONTRACTS).map(([key, relativePath]) => [key, readJson(repoRoot, relativePath)])),
    };
  } catch (error) {
    return { error: error.code || "public-mcp-permission-contract-unavailable" };
  }
}

function findRepoRoot() {
  const starts = [process.env.SEIS_REPO_ROOT, process.cwd(), pluginRoot].filter(Boolean);
  const visited = new Set();
  for (const start of starts) {
    let current = path.resolve(start);
    for (let depth = 0; depth < 12; depth += 1) {
      if (visited.has(current)) break;
      visited.add(current);
      const marketplacePath = path.join(current, CONTRACTS.marketplace);
      if (isRegularFile(marketplacePath)) {
        try {
          const marketplace = readJson(current, CONTRACTS.marketplace);
          if (marketplace?.name === "seis-repo" && marketplace?.interface?.displayName === "SEIS Repo") return { repoRoot: current };
        } catch {
          // Continue searching upward without exposing local paths.
        }
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

function readJson(repoRoot, relativePath) {
  const filePath = safePath(repoRoot, relativePath);
  if (!isRegularFile(filePath)) throw new Error("contract-file-unavailable");
  const stat = fs.statSync(filePath);
  if (stat.size > 4 * 1024 * 1024) throw new Error("contract-file-out-of-bounds");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function safePath(root, relativePath) {
  const base = path.resolve(root);
  const target = path.resolve(base, relativePath);
  const relative = path.relative(base, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("contract-path-escapes-repository");
  return target;
}

function unavailable(reason) {
  return {
    state: "unavailable",
    ok: false,
    mode: "public-seis-repo-mcp-permission-read-only",
    reason,
    permissions: permissionBoundary(),
    publicReleaseAllowed: false,
  };
}

function invalidInput(reason) {
  return {
    state: "invalid-input",
    ok: false,
    mode: "public-seis-repo-mcp-permission-read-only",
    reason,
    permissions: permissionBoundary(),
    publicReleaseAllowed: false,
  };
}

function permissionBoundary() {
  return {
    read: ["fixed public SEIS Repo marketplace, curated bundle catalog, source inventory, and MCP permission ledger"],
    write: [],
    network: [],
    secrets: [],
  };
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function names(value) {
  return array(value).map((item) => safePluginId(item?.name)).filter(Boolean).sort();
}

function sameStringSet(actual, expected) {
  return actual.length === expected.length && new Set(actual).size === actual.length && actual.every((value) => expected.includes(value));
}

function emptyPermissionSet(value) {
  return ["write", "network", "secrets"].every((key) => Array.isArray(value?.[key]) && value[key].length === 0);
}

function safePluginId(value) {
  const text = typeof value === "string" ? value.trim() : "";
  return /^[a-z][a-z0-9-]{1,96}$/.test(text) ? text : null;
}

function isRelativeEntrypoint(value) {
  return typeof value === "string" && /^scripts\/[a-z0-9-]+-mcp-server\.mjs$/.test(value) && !value.includes("..");
}

function containsUnsafeVisibleTerm(value) {
  const serialized = JSON.stringify(value);
  return /\bpersonal\b/i.test(serialized)
    || /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m.test(serialized)
    || /\b(?:gh[pousr]_[A-Za-z0-9_-]{20,}|github_pat_[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16})\b/.test(serialized);
}

function ensure(condition, findings, code, plugin = null) {
  if (!condition) findings.push({ severity: "error", code, ...(plugin ? { plugin } : {}) });
}

function isRegularFile(filePath) {
  try {
    return fs.lstatSync(filePath).isFile() && !fs.lstatSync(filePath).isSymbolicLink();
  } catch {
    return false;
  }
}

const tools = [
  {
    name: "seis_mcp_permission_status",
    description: "Report the public SEIS Repo MCP permission boundary without granting access.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seis_mcp_permission_validate",
    description: "Validate fixed public SEIS Repo MCP permission contracts without starting servers.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seis_mcp_permission_ledger",
    description: "Inspect a bounded public MCP permission ledger record without starting or connecting a server.",
    inputSchema: { type: "object", properties: { plugin: { type: "string" } } },
  },
];

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-mcp-permission", version: readPluginVersion() } } });
  } else if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  } else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_mcp_permission_status"
      ? status()
      : name === "seis_mcp_permission_validate"
        ? validateMcpPermission()
        : name === "seis_mcp_permission_ledger"
          ? inspectLedger(args.plugin)
          : null;
    if (result) send({ jsonrpc: "2.0", id: message.id, result });
    else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Unknown tool" } });
  }
}

function processStream() {
  while (true) {
    const separator = pending.indexOf("\r\n\r\n");
    if (separator < 0) return;
    const match = /Content-Length:\s*(\d+)/i.exec(pending.slice(0, separator).toString("utf8"));
    if (!match) {
      pending = pending.slice(separator + 4);
      continue;
    }
    const length = Number.parseInt(match[1], 10);
    const start = separator + 4;
    if (pending.length < start + length) return;
    try {
      handle(JSON.parse(pending.slice(start, start + length).toString("utf8")));
    } catch {
      // Invalid local protocol input is ignored and cannot trigger an external action.
    }
    pending = pending.slice(start + length);
  }
}

function readPluginVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(pluginRoot, "assets", "plugin-profile.json"), "utf8")).version || "unknown";
  } catch {
    return "unknown";
  }
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  console.log(JSON.stringify(status(), null, 2));
} else if (args.includes("--validate")) {
  console.log(JSON.stringify(validateMcpPermission(), null, 2));
} else if (args.includes("--ledger")) {
  const index = args.indexOf("--plugin");
  console.log(JSON.stringify(inspectLedger(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
  process.stdin.on("end", () => process.exit(0));
}
