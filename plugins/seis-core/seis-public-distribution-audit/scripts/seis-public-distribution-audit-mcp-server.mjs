#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_FINDINGS = 100;
const PERSONAL_TERM = /\bpersonal\b/i;
const ABSOLUTE_PATH = /(?:^\/|^~\/|^[A-Za-z]:[\\/]|\/Users\/|\/home\/)/;
const CONTRACTS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
  family: "content/development/seis-public-plugin-family.json",
  appSources: "apps/seis-core/data/seis-core-plugin-sources.json",
  appCatalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  unifiedSuite: "plugins/seis-ai-agent/assets/unified-suite.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  project: "project.ecosystem.yaml"
});

function status() {
  const report = validateDistribution({ includeCatalogStatus: false });
  return {
    plugin: "seis-public-distribution-audit",
    status: report.ok ? "ready" : report.state,
    mode: "public-seis-repo-distribution-read-only",
    distribution: compactReport(report),
    network: "disabled-by-design",
    executesPluginCode: false,
    followsSymlinks: false,
    writes: "disabled-by-design",
    secrets: "not-read"
  };
}

function validateDistribution({ includeCatalogStatus = true } = {}) {
  const located = findRepoRoot();
  if (!located) return unavailable("seis-repo-marketplace-not-found");

  const loaded = readContracts(located.repoRoot);
  if (loaded.error) return unavailable(loaded.error);

  const findings = [];
  const marketplace = loaded.contracts.marketplace;
  const family = loaded.contracts.family;
  const appSources = loaded.contracts.appSources;
  const appCatalog = loaded.contracts.appCatalog;
  const unifiedSuite = loaded.contracts.unifiedSuite;
  const lifecycle = loaded.contracts.lifecycle;
  const project = parseProjectBoundary(loaded.contracts.project);
  const rootPlugins = safeArray(family.migratedRootPlugins);
  const appPlugins = safeArray(family.applicationPlugins);
  const topicPlugins = safeArray(family.topicPlugins);
  const canonicalPlugins = safeArray(family.publicPlugins);
  const marketplaceEntries = safeArray(marketplace.plugins);
  const expectedCardCount = canonicalPlugins.length + rootPlugins.length + appPlugins.length + topicPlugins.length;
  const appNames = names(appPlugins);
  const topicNames = names(topicPlugins);
  const rootNames = names(rootPlugins);
  const canonicalNames = names(canonicalPlugins);
  const marketplaceNames = names(marketplaceEntries);

  ensure(marketplace.name === "seis-repo", findings, "marketplace-name-invalid");
  ensure(marketplace.interface?.displayName === "SEIS Repo", findings, "marketplace-display-name-invalid");
  ensure(marketplaceEntries.length === expectedCardCount, findings, "marketplace-card-count-mismatch");
  ensure(unique(marketplaceNames), findings, "marketplace-card-names-not-unique");
  ensure(canonicalNames.length === 1 && canonicalNames[0] === "seis-ai-agent", findings, "canonical-orchestrator-invalid");
  ensure(rootNames.length === 5, findings, "migrated-root-count-invalid");
  ensure(appNames.length > 0 && unique(appNames), findings, "application-plugin-list-invalid");
  ensure(topicNames.length === 300 && unique(topicNames), findings, "topic-plugin-list-invalid");
  ensure(family.marketplace?.name === "seis-repo", findings, "family-marketplace-name-invalid");
  ensure(family.marketplace?.publicPluginCount === expectedCardCount, findings, "family-marketplace-count-mismatch");
  ensure(family.marketplace?.canonicalOrchestratorCount === canonicalNames.length, findings, "family-canonical-count-mismatch");
  ensure(family.marketplace?.migratedRootPluginCount === rootNames.length, findings, "family-root-count-mismatch");
  ensure(family.marketplace?.applicationPluginCount === appNames.length, findings, "family-application-count-mismatch");
  ensure(family.marketplace?.topicPluginCount === topicNames.length, findings, "family-topic-count-mismatch");

  validateMarketplaceFamilies(marketplaceEntries, canonicalNames, rootNames, appNames, topicNames, findings);
  validateApplicationProjections(appSources, appCatalog, unifiedSuite, lifecycle, appNames, findings, includeCatalogStatus);
  validateProjectBoundary(project, expectedCardCount, appNames.length, topicNames.length, rootNames.length, findings);
  validatePublicTerminology(marketplace, family, appSources, appCatalog, unifiedSuite, lifecycle, project, findings);

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  return {
    state: errorCount ? "attention" : "ready",
    ok: errorCount === 0,
    mode: "public-seis-repo-distribution-read-only",
    marketplaceName: marketplace.name === "seis-repo" ? "seis-repo" : null,
    marketplaceDisplayName: marketplace.interface?.displayName === "SEIS Repo" ? "SEIS Repo" : null,
    cardCount: marketplaceEntries.length,
    expectedCardCount,
    canonicalPluginCount: canonicalNames.length,
    migratedRootPluginCount: rootNames.length,
    applicationPluginCount: appNames.length,
    topicPluginCount: topicNames.length,
    errorCount,
    warningCount: 0,
    findings: findings.slice(0, MAX_FINDINGS),
    permissions: permissionBoundary(),
    limitations: [
      "Only fixed public distribution contracts inside the SEIS repository are read.",
      "Legacy compatibility aliases are not treated as active public marketplace cards.",
      "Validation does not install, enable, execute, publish, or authorize any plugin capability."
    ]
  };
}

function validateMarketplaceFamilies(entries, canonicalNames, rootNames, appNames, topicNames, findings) {
  const byName = new Map(entries.map((entry) => [entry?.name, entry]));
  validateFamilyEntries(canonicalNames, byName, "./plugins/", findings, "canonical");
  validateFamilyEntries(rootNames, byName, "./plugins/", findings, "root", true);
  validateFamilyEntries(appNames, byName, "./plugins/seis-core/", findings, "application");
  validateFamilyEntries(topicNames, byName, "./plugins/seis-topics/", findings, "topic");
}

function validateFamilyEntries(pluginNames, entries, sourcePrefix, findings, family, rootOnly = false) {
  for (const name of pluginNames) {
    const entry = entries.get(name);
    if (!entry) {
      addFinding(findings, "error", family + "-marketplace-card-missing", name);
      continue;
    }
    const sourcePath = text(entry.source?.path);
    const pathMatches = rootOnly
      ? sourcePath === "./plugins/" + name
      : sourcePath === sourcePrefix + name;
    ensure(pathMatches, findings, family + "-marketplace-path-invalid", name);
    ensure(entry.source?.source === "local", findings, family + "-marketplace-source-invalid", name);
    ensure(entry.policy?.installation === "AVAILABLE", findings, family + "-marketplace-installation-invalid", name);
    ensure(entry.policy?.authentication === "ON_INSTALL", findings, family + "-marketplace-authentication-invalid", name);
  }
}

function validateApplicationProjections(appSources, appCatalog, unifiedSuite, lifecycle, appNames, findings, includeCatalogStatus) {
  const appCount = appNames.length;
  ensure(appSources.id === "seis-core-plugin-sources", findings, "app-source-id-invalid");
  ensure(appSources.status === "active-public-repository-boundary", findings, "app-source-status-invalid");
  ensure(appSources.sourceRoot === "plugins/seis-core", findings, "app-source-root-invalid");
  ensure(appSources.pluginCount === appCount, findings, "app-source-count-mismatch");
  ensure(appSources.application?.publicAudience === "everyone", findings, "app-source-audience-invalid");
  ensure(appSources.application?.publicRepositoryAvailable === true, findings, "app-source-public-repository-invalid");
  ensure(appSources.publicDistribution?.marketplaceName === "seis-repo", findings, "app-source-marketplace-invalid");
  ensure(appSources.publicDistribution?.publicMarketplace === true, findings, "app-source-public-marketplace-invalid");
  ensure(appSources.publicDistribution?.directRepoSource === true, findings, "app-source-direct-repository-invalid");
  ensure(appSources.publicDistribution?.marketplaceEntryCount === appCount, findings, "app-source-marketplace-count-mismatch");
  ensure(sameNames(appNames, names(safeArray(appSources.plugins))), findings, "app-source-name-set-mismatch");

  ensure(appCatalog.id === "seis-core-application-plugin-catalog", findings, "app-catalog-id-invalid");
  ensure(appCatalog.distribution?.marketplaceName === "seis-repo", findings, "app-catalog-marketplace-invalid");
  ensure(appCatalog.distribution?.publicMarketplace === true, findings, "app-catalog-public-marketplace-invalid");
  ensure(appCatalog.distribution?.publicAudience === "everyone", findings, "app-catalog-audience-invalid");
  ensure(appCatalog.distribution?.marketplaceEntryCount === appCount, findings, "app-catalog-marketplace-count-mismatch");
  ensure(appCatalog.counts?.discovered === appCount, findings, "app-catalog-discovered-count-mismatch");
  ensure(appCatalog.counts?.contractValid === appCount, findings, "app-catalog-contract-count-mismatch");
  if (includeCatalogStatus) ensure(appCatalog.counts?.statusReady === appCount, findings, "app-catalog-status-count-mismatch");
  ensure(sameNames(appNames, names(safeArray(appCatalog.plugins))), findings, "app-catalog-name-set-mismatch");

  const appDistribution = unifiedSuite.applicationDistribution || {};
  const publicDistribution = unifiedSuite.publicDistribution || {};
  ensure(appDistribution.marketplaceName === "seis-repo", findings, "suite-marketplace-invalid");
  ensure(appDistribution.publicMarketplace === true, findings, "suite-public-marketplace-invalid");
  ensure(appDistribution.publicAudience === "everyone", findings, "suite-audience-invalid");
  ensure(appDistribution.pluginCount === appCount, findings, "suite-app-count-mismatch");
  ensure(appDistribution.marketplaceEntryCount === appCount, findings, "suite-marketplace-count-mismatch");
  ensure(sameNames(appNames, names(safeArray(appDistribution.plugins), "moduleId")), findings, "suite-app-name-set-mismatch");
  ensure(publicDistribution.applicationOwnedPluginCount === appCount, findings, "suite-public-app-count-mismatch");
  ensure(publicDistribution.applicationMarketplacePluginCount === appCount, findings, "suite-public-marketplace-count-mismatch");
  ensure(sameNames(appNames, safeArray(unifiedSuite.sourceDiscovery?.discoveredApplicationPluginNames)), findings, "suite-discovery-name-set-mismatch");

  const lifecycleDistribution = lifecycle.publicDistribution || {};
  ensure(lifecycleDistribution.marketplaceName === "seis-repo", findings, "lifecycle-marketplace-invalid");
  ensure(lifecycleDistribution.applicationPluginCount === appCount, findings, "lifecycle-app-count-mismatch");
}

function validateProjectBoundary(project, expectedCardCount, appCount, topicCount, rootCount, findings) {
  ensure(project.marketplaceName === "seis-repo", findings, "project-marketplace-name-invalid");
  ensure(project.publicMarketplace === true, findings, "project-public-marketplace-invalid");
  ensure(project.marketplaceEntryCount === expectedCardCount, findings, "project-marketplace-count-mismatch");
  ensure(project.applicationEntryCount === appCount, findings, "project-application-count-mismatch");
  ensure(project.topicEntryCount === topicCount, findings, "project-topic-count-mismatch");
  ensure(project.migratedRootEntryCount === rootCount, findings, "project-root-count-mismatch");
}

function validatePublicTerminology(marketplace, family, appSources, appCatalog, unifiedSuite, lifecycle, project, findings) {
  const values = [
    marketplace.name,
    marketplace.interface?.displayName,
    ...safeArray(marketplace.plugins).flatMap((entry) => [entry?.name, entry?.source?.path]),
    family.marketplace?.name,
    ...safeArray(family.applicationPlugins).flatMap((entry) => [entry?.name, entry?.sourcePath, entry?.installId]),
    ...safeArray(family.migratedRootPlugins).flatMap((entry) => [entry?.name, entry?.sourcePath, entry?.installId]),
    ...safeArray(family.topicPlugins).flatMap((entry) => [entry?.name, entry?.sourcePath, entry?.installId]),
    appSources.publicDistribution?.marketplaceName,
    appSources.publicDistribution?.sourceRoot,
    appCatalog.distribution?.marketplaceName,
    unifiedSuite.applicationDistribution?.marketplaceName,
    unifiedSuite.publicDistribution?.applicationSourceRoot,
    lifecycle.publicDistribution?.marketplaceName,
    project.marketplaceName
  ];
  for (const value of values) {
    const candidate = text(value);
    ensure(!PERSONAL_TERM.test(candidate), findings, "visible-personal-terminology");
    ensure(!ABSOLUTE_PATH.test(candidate), findings, "machine-specific-public-path");
  }
}

function findRepoRoot() {
  const candidates = [process.env.SEIS_REPO_ROOT, process.env.SEIS_ROOT, pluginRoot]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => path.resolve(value));
  for (const candidate of candidates) {
    let current = candidate;
    while (true) {
      const marketplacePath = path.join(current, CONTRACTS.marketplace);
      if (isRegularFile(marketplacePath)) {
        const result = readJsonFile(marketplacePath);
        if (result.data?.name === "seis-repo" && Array.isArray(result.data?.plugins)) {
          return { repoRoot: current };
        }
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

function readContracts(repoRoot) {
  const contracts = {};
  for (const [name, relativePath] of Object.entries(CONTRACTS)) {
    const absolutePath = path.resolve(repoRoot, relativePath);
    if (!isInside(repoRoot, absolutePath) || !isRegularFile(absolutePath)) {
      return { error: "public-contract-missing-or-unsafe" };
    }
    const result = name === "project" ? readTextFile(absolutePath) : readJsonFile(absolutePath);
    if (result.error) return { error: "public-contract-invalid" };
    contracts[name] = result.data;
  }
  return { contracts };
}

function parseProjectBoundary(textValue) {
  return {
    marketplaceName: yamlValue(textValue, "marketplace_name"),
    publicMarketplace: yamlValue(textValue, "public_marketplace") === "true",
    marketplaceEntryCount: yamlNumber(textValue, "marketplace_entry_count"),
    applicationEntryCount: yamlNumber(textValue, "application_marketplace_entry_count"),
    topicEntryCount: yamlNumber(textValue, "topic_marketplace_entry_count"),
    migratedRootEntryCount: yamlNumber(textValue, "migrated_root_marketplace_entry_count")
  };
}

function yamlValue(textValue, key) {
  const match = new RegExp("^\\s*" + key + ":\\s*([^\\s#]+)", "m").exec(String(textValue || ""));
  return match ? match[1] : null;
}

function yamlNumber(textValue, key) {
  const value = Number(yamlValue(textValue, key));
  return Number.isSafeInteger(value) ? value : null;
}

function unavailable(reason) {
  return {
    state: "unavailable",
    ok: false,
    mode: "public-seis-repo-distribution-read-only",
    reason,
    findings: [],
    permissions: permissionBoundary()
  };
}

function compactReport(report) {
  return {
    state: report.state,
    available: report.ok,
    marketplaceName: report.marketplaceName || null,
    marketplaceDisplayName: report.marketplaceDisplayName || null,
    cardCount: report.cardCount ?? null,
    applicationPluginCount: report.applicationPluginCount ?? null,
    topicPluginCount: report.topicPluginCount ?? null,
    errorCount: report.errorCount ?? null
  };
}

function names(entries, key = "name") {
  return safeArray(entries).map((entry) => typeof entry === "string" ? entry : text(entry?.[key])).filter(Boolean);
}

function sameNames(left, right) {
  return left.length === right.length && unique(left) && unique(right) && left.every((value) => right.includes(value));
}

function unique(values) {
  return new Set(values).size === values.length;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function ensure(condition, findings, code, plugin) {
  if (!condition) addFinding(findings, "error", code, plugin);
}

function addFinding(findings, severity, code, plugin) {
  if (findings.length >= MAX_FINDINGS) return;
  const finding = { severity, code };
  if (plugin && !PERSONAL_TERM.test(plugin)) finding.plugin = plugin;
  findings.push(finding);
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return !relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative);
}

function isRegularFile(filePath) {
  try {
    const stat = fs.lstatSync(filePath);
    return !stat.isSymbolicLink() && stat.isFile();
  } catch {
    return false;
  }
}

function readJsonFile(filePath) {
  try {
    return { data: JSON.parse(fs.readFileSync(filePath, "utf8")) };
  } catch {
    return { error: "invalid-json" };
  }
}

function readTextFile(filePath) {
  try {
    return { data: fs.readFileSync(filePath, "utf8") };
  } catch {
    return { error: "invalid-text" };
  }
}

function permissionBoundary() {
  return {
    read: [
      "bounded public SEIS Repo distribution contracts",
      "declared marketplace projection metadata"
    ],
    write: [],
    network: [],
    secrets: []
  };
}

const tools = [
  {
    name: "seis_public_distribution_audit_status",
    description: "Report public SEIS Repo distribution contract readiness without writes.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "seis_public_distribution_audit_validate",
    description: "Validate public SEIS Repo distribution projections without executing plugin code.",
    inputSchema: { type: "object", properties: {} }
  }
];

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write("Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body);
}

let pending = Buffer.alloc(0);

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-public-distribution-audit", version: "0.0.13" } } });
  } else if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  } else if (message.method === "tools/call") {
    const name = message.params?.name;
    if (name === "seis_public_distribution_audit_status") send({ jsonrpc: "2.0", id: message.id, result: status() });
    else if (name === "seis_public_distribution_audit_validate") send({ jsonrpc: "2.0", id: message.id, result: validateDistribution() });
    else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Unknown tool: " + String(name || "undefined") } });
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
      // Ignore malformed MCP frames without echoing caller input.
    }
    pending = pending.slice(start + length);
  }
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  console.log(JSON.stringify(status(), null, 2));
} else if (args.includes("--validate")) {
  console.log(JSON.stringify(validateDistribution(), null, 2));
} else {
  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
  process.stdin.on("end", () => process.exit(0));
}
