#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_FINDINGS = 100;
const MAX_CACHE_PLUGIN_DIRECTORIES = 500;
const MAX_CACHE_VERSIONS_PER_PLUGIN = 24;
const MAX_VISIBLE_RECORDS = 100;
const CONTRACTS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
  family: "content/development/seis-public-plugin-family.json",
  installState: "content/development/seis-public-install-state.json",
  runtimeStatus: "content/development/seis-public-runtime-status.json"
});

function status() {
  const validation = validateRuntimeStatus();
  const runtime = inspectRuntimeCache();
  return {
    plugin: "seis-public-runtime-status",
    status: validation.ok ? "ready" : validation.state,
    mode: "public-seis-repo-runtime-cache-read-only",
    marketplace: compactMarketplace(validation),
    runtimeCache: compactRuntime(runtime),
    network: "disabled-by-design",
    installsPackages: false,
    enablesPackages: false,
    executesCachedPluginCode: false,
    writes: "disabled-by-design",
    secrets: "not-read"
  };
}

function validateRuntimeStatus() {
  const located = findRepoRoot();
  if (!located) return unavailable("seis-repo-marketplace-not-found");
  const loaded = readContracts(located.repoRoot);
  if (loaded.error) return unavailable(loaded.error);

  const { marketplace, family, installState, runtimeStatus } = loaded.contracts;
  const findings = [];
  const cards = array(marketplace.plugins);
  const canonicalCards = array(family.publicPlugins);
  const rootCards = array(family.migratedRootPlugins);
  const applicationCards = array(family.applicationPlugins);
  const topicCards = array(family.topicPlugins);
  const expectedCardCount = canonicalCards.length + rootCards.length + applicationCards.length + topicCards.length;
  const runtimeCard = cards.find((card) => card?.name === "seis-public-runtime-status");

  ensure(marketplace.name === "seis-repo", findings, "marketplace-name-invalid");
  ensure(marketplace.interface?.displayName === "SEIS Repo", findings, "marketplace-display-name-invalid");
  ensure(cards.length === expectedCardCount, findings, "marketplace-card-count-mismatch");
  ensure(cardsHavePublicSource(cards), findings, "marketplace-public-source-boundary-invalid");
  ensure(family.marketplace?.publicPluginCount === expectedCardCount, findings, "family-card-count-mismatch");
  ensure(family.marketplace?.applicationPluginCount === applicationCards.length, findings, "family-application-count-mismatch");
  ensure(installState.publicCards?.count === expectedCardCount, findings, "install-state-card-count-stale");
  ensure(Boolean(runtimeCard), findings, "runtime-status-card-missing");
  ensure(runtimeCard?.source?.path === "./plugins/seis-core/seis-public-runtime-status", findings, "runtime-status-card-source-path-invalid");
  ensure(runtimeCard?.policy?.installation === "AVAILABLE", findings, "runtime-status-card-installation-invalid");
  ensure(runtimeCard?.policy?.authentication === "ON_INSTALL", findings, "runtime-status-card-authentication-invalid");
  ensure(runtimeStatus.id === "seis-public-runtime-status", findings, "runtime-status-id-invalid");
  ensure(runtimeStatus.goalId === "SEIS-GOAL-021", findings, "runtime-status-goal-invalid");
  ensure(runtimeStatus.plugin?.name === "seis-public-runtime-status", findings, "runtime-status-plugin-name-invalid");
  ensure(runtimeStatus.plugin?.marketplaceName === "seis-repo", findings, "runtime-status-plugin-marketplace-invalid");
  ensure(runtimeStatus.plugin?.sourcePath === "plugins/seis-core/seis-public-runtime-status", findings, "runtime-status-plugin-source-path-invalid");
  ensure(runtimeStatus.publicCards?.count === expectedCardCount, findings, "runtime-status-card-count-invalid");
  ensure(runtimeStatus.publicCards?.applicationPluginCount === applicationCards.length, findings, "runtime-status-application-count-invalid");
  ensure(runtimeStatus.observationBoundary?.cacheRecordIsInstallationProof === false, findings, "runtime-status-must-not-claim-installation");
  ensure(runtimeStatus.observationBoundary?.cacheRecordIsEnablementProof === false, findings, "runtime-status-must-not-claim-enablement");
  ensure(runtimeStatus.observationBoundary?.publicReleaseAllowed === false, findings, "runtime-status-must-not-claim-public-release");
  ensure(runtimeStatus.safety?.write?.length === 0, findings, "runtime-status-write-boundary-invalid");
  ensure(runtimeStatus.safety?.network?.length === 0, findings, "runtime-status-network-boundary-invalid");
  ensure(runtimeStatus.safety?.secrets?.length === 0, findings, "runtime-status-secret-boundary-invalid");
  ensure(!/\bpersonal\b/i.test(JSON.stringify(runtimeStatus)), findings, "runtime-status-visible-personal-terminology");
  ensure(!/(?:^\/|^~\/|^[A-Za-z]:[\\/]|\/Users\/|\/home\/)/.test(JSON.stringify(runtimeStatus)), findings, "runtime-status-machine-path");

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  return {
    state: errorCount ? "attention" : "ready",
    ok: errorCount === 0,
    mode: "public-seis-repo-runtime-cache-read-only",
    marketplaceName: marketplace.name === "seis-repo" ? "seis-repo" : null,
    marketplaceDisplayName: marketplace.interface?.displayName === "SEIS Repo" ? "SEIS Repo" : null,
    publicCards: {
      count: cards.length,
      canonicalOrchestratorCount: canonicalCards.length,
      migratedRootPluginCount: rootCards.length,
      applicationPluginCount: applicationCards.length,
      topicPluginCount: topicCards.length
    },
    observationBoundary: runtimeStatus.observationBoundary || null,
    errorCount,
    findings: findings.slice(0, MAX_FINDINGS),
    permissions: permissionBoundary(),
    limitations: [
      "Validation reads fixed public SEIS Repo contracts only.",
      "A cache record is not proof that Codex currently enables a package, that a clean runner independently installed it, or that a release is approved.",
      "Validation does not install, enable, update, publish, deploy, push, or authorize any plugin capability."
    ]
  };
}

function inspectRuntimeCache() {
  const located = findRepoRoot();
  if (!located) return unavailable("seis-repo-marketplace-not-found");
  const loaded = readContracts(located.repoRoot);
  if (loaded.error) return unavailable(loaded.error);

  const validation = validateRuntimeStatus();
  if (!validation.ok) {
    return {
      ...validation,
      reason: "public-runtime-status-contract-invalid",
      runtimeObserved: false
    };
  }

  const sources = readDeclaredSourceRecords(located.repoRoot, array(loaded.contracts.marketplace.plugins));
  if (sources.findings.length) {
    return {
      state: "attention",
      ok: false,
      mode: "public-seis-repo-runtime-cache-read-only",
      reason: "declared-source-manifest-invalid",
      marketplaceName: validation.marketplaceName,
      marketplaceDisplayName: validation.marketplaceDisplayName,
      publicCards: validation.publicCards,
      runtimeObserved: false,
      findings: sources.findings.slice(0, MAX_FINDINGS),
      permissions: permissionBoundary()
    };
  }

  const cacheRoot = findCacheRoot();
  if (!cacheRoot) {
    return {
      state: "unavailable",
      ok: false,
      mode: "public-seis-repo-runtime-cache-read-only",
      reason: "seis-repo-cache-not-found-or-unsafe",
      marketplaceName: validation.marketplaceName,
      marketplaceDisplayName: validation.marketplaceDisplayName,
      publicCards: validation.publicCards,
      runtimeObserved: false,
      cacheRootDetected: false,
      permissions: permissionBoundary(),
      limitations: [
        "No safe local seis-repo cache root was available for observation.",
        "The source contract remains valid even when a local cache record is absent."
      ]
    };
  }

  return inspectCacheRoot(cacheRoot, sources.records, validation);
}

function readDeclaredSourceRecords(repoRoot, cards) {
  const findings = [];
  const records = [];
  for (const card of cards) {
    const cardName = text(card?.name);
    const source = validateSourcePath(card?.source?.path, repoRoot);
    if (!cardName || !source.ok) {
      ensure(false, findings, source.code || "source-card-invalid", safeName(cardName));
      continue;
    }
    const manifestPath = path.join(source.absolutePath, ".codex-plugin", "plugin.json");
    if (!isRegularFile(manifestPath)) {
      ensure(false, findings, "declared-source-manifest-missing-or-unsafe", safeName(cardName));
      continue;
    }
    const manifestResult = readJson(manifestPath);
    const manifest = manifestResult.data;
    if (manifestResult.error || manifest?.name !== cardName || !text(manifest?.version)) {
      ensure(false, findings, "declared-source-manifest-invalid", safeName(cardName));
      continue;
    }
    records.push({ name: cardName, version: text(manifest.version) });
  }
  return { records: records.sort((left, right) => left.name.localeCompare(right.name)), findings };
}

function inspectCacheRoot(cacheRoot, sourceRecords, validation) {
  const sourceByName = new Map(sourceRecords.map((record) => [record.name, record]));
  const directories = safeDirectoryEntries(cacheRoot, MAX_CACHE_PLUGIN_DIRECTORIES);
  const cacheByName = new Map();
  const declaredRecords = [];
  let undeclaredCacheRecordCount = 0;
  let invalidCacheRecordCount = 0;

  for (const directory of directories.entries) {
    const observed = inspectCachePlugin(path.join(cacheRoot, directory.name), directory.name);
    cacheByName.set(directory.name, observed);
    const expected = sourceByName.get(directory.name);
    if (!expected) {
      undeclaredCacheRecordCount += 1;
      if (observed.state === "invalid") invalidCacheRecordCount += 1;
      continue;
    }
    const state = observed.validVersions.includes(expected.version)
      ? "current"
      : observed.validVersions.length
        ? "stale"
        : "invalid";
    if (state === "invalid") invalidCacheRecordCount += 1;
    declaredRecords.push({
      name: expected.name,
      sourceVersion: expected.version,
      cacheState: state,
      observedVersionCount: observed.validVersions.length,
      observedVersions: observed.validVersions.slice(0, MAX_CACHE_VERSIONS_PER_PLUGIN)
    });
  }

  const missingRecords = sourceRecords
    .filter((record) => !cacheByName.has(record.name))
    .map((record) => ({ name: record.name, sourceVersion: record.version, cacheState: "missing", observedVersionCount: 0, observedVersions: [] }));
  const allDeclaredRecords = [...declaredRecords, ...missingRecords].sort((left, right) => left.name.localeCompare(right.name));
  const currentCacheRecordCount = allDeclaredRecords.filter((record) => record.cacheState === "current").length;
  const staleCacheRecordCount = allDeclaredRecords.filter((record) => record.cacheState === "stale").length;
  const declaredInvalidCacheRecordCount = allDeclaredRecords.filter((record) => record.cacheState === "invalid").length;
  const missingCacheRecordCount = allDeclaredRecords.filter((record) => record.cacheState === "missing").length;
  const state = staleCacheRecordCount || declaredInvalidCacheRecordCount ? "attention" : "ready";

  return {
    state,
    ok: true,
    mode: "public-seis-repo-runtime-cache-read-only",
    marketplaceName: validation.marketplaceName,
    marketplaceDisplayName: validation.marketplaceDisplayName,
    publicCards: validation.publicCards,
    runtimeObserved: true,
    cacheRootDetected: true,
    cacheRecordCount: directories.entries.length,
    cacheScanLimitReached: directories.truncated,
    declaredCacheRecordCount: allDeclaredRecords.length - missingCacheRecordCount,
    currentCacheRecordCount,
    staleCacheRecordCount,
    invalidCacheRecordCount,
    declaredInvalidCacheRecordCount,
    missingCacheRecordCount,
    undeclaredCacheRecordCount,
    records: allDeclaredRecords
      .filter((record) => record.cacheState !== "missing")
      .slice(0, MAX_VISIBLE_RECORDS),
    issueRecords: allDeclaredRecords
      .filter((record) => record.cacheState === "stale" || record.cacheState === "invalid")
      .slice(0, MAX_VISIBLE_RECORDS),
    observationBoundary: validation.observationBoundary,
    permissions: permissionBoundary(),
    limitations: [
      "Only the seis-repo cache root and cache manifests for direct child directories are read.",
      "Undeclared cache records are counted without emitting their names or paths.",
      "A cache record is not proof of current Codex enablement, independent installation, authorization, or release approval."
    ]
  };
}

function inspectCachePlugin(cachePluginRoot, pluginName) {
  const versions = safeDirectoryEntries(cachePluginRoot, MAX_CACHE_VERSIONS_PER_PLUGIN);
  const validVersions = [];
  let invalid = versions.entries.length === 0;
  for (const version of versions.entries) {
    const manifestPath = path.join(cachePluginRoot, version.name, ".codex-plugin", "plugin.json");
    if (!isRegularFile(manifestPath)) {
      invalid = true;
      continue;
    }
    const manifestResult = readJson(manifestPath);
    if (manifestResult.error || manifestResult.data?.name !== pluginName || !text(manifestResult.data?.version)) {
      invalid = true;
      continue;
    }
    validVersions.push(text(manifestResult.data.version));
  }
  return {
    state: validVersions.length ? "valid" : invalid ? "invalid" : "empty",
    validVersions: [...new Set(validVersions)].sort(),
    scanLimitReached: versions.truncated
  };
}

function compactMarketplace(report) {
  return {
    state: report.state,
    available: report.ok,
    marketplaceName: report.marketplaceName || null,
    marketplaceDisplayName: report.marketplaceDisplayName || null,
    publicCardCount: report.publicCards?.count ?? null,
    applicationPluginCount: report.publicCards?.applicationPluginCount ?? null
  };
}

function compactRuntime(report) {
  return {
    state: report.state,
    observed: report.runtimeObserved === true,
    cacheRootDetected: report.cacheRootDetected === true,
    currentCacheRecordCount: report.currentCacheRecordCount ?? null,
    staleCacheRecordCount: report.staleCacheRecordCount ?? null,
    invalidCacheRecordCount: report.invalidCacheRecordCount ?? null,
    missingCacheRecordCount: report.missingCacheRecordCount ?? null,
    undeclaredCacheRecordCount: report.undeclaredCacheRecordCount ?? null
  };
}

function findRepoRoot() {
  const candidates = [process.env.SEIS_REPO_ROOT, process.env.SEIS_ROOT, process.env.SEIS_WORKSPACE_ROOT, pluginRoot]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => path.resolve(value));
  for (const candidate of candidates) {
    let current = candidate;
    while (true) {
      const marketplacePath = path.join(current, CONTRACTS.marketplace);
      if (isRegularFile(marketplacePath)) {
        const result = readJson(marketplacePath);
        if (result.data?.name === "seis-repo" && Array.isArray(result.data?.plugins)) return { repoRoot: current };
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

function findCacheRoot() {
  const candidates = [
    process.env.SEIS_PUBLIC_RUNTIME_CACHE_ROOT,
    path.join(os.homedir(), ".codex", "plugins", "cache", "seis-repo")
  ].filter((value) => typeof value === "string" && value.trim());
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (isSafeDirectory(resolved)) return resolved;
  }
  return null;
}

function readContracts(repoRoot) {
  const contracts = {};
  for (const [name, relativePath] of Object.entries(CONTRACTS)) {
    const absolutePath = path.resolve(repoRoot, relativePath);
    if (!isInside(repoRoot, absolutePath) || !isRegularFile(absolutePath)) return { error: "public-runtime-contract-missing-or-unsafe" };
    const result = readJson(absolutePath);
    if (result.error) return { error: "public-runtime-contract-invalid" };
    contracts[name] = result.data;
  }
  return { contracts };
}

function validateSourcePath(value, repoRoot) {
  const relativePath = text(value);
  if (!relativePath || !relativePath.startsWith("./plugins/") || relativePath.includes("\\") || relativePath.includes("..") || relativePath.endsWith("/")) {
    return { ok: false, code: "declared-source-path-invalid" };
  }
  const pluginsRoot = path.resolve(repoRoot, "plugins");
  const absolutePath = path.resolve(repoRoot, relativePath.slice(2));
  if (!isInside(pluginsRoot, absolutePath)) return { ok: false, code: "declared-source-path-escapes-plugin-root" };
  return { ok: true, absolutePath };
}

function cardsHavePublicSource(cards) {
  return cards.length > 0 && cards.every((card) =>
    text(card?.name)
    && card?.source?.source === "local"
    && text(card?.source?.path).startsWith("./plugins/")
    && !text(card?.source?.path).includes("..")
    && card?.policy?.installation === "AVAILABLE"
    && card?.policy?.authentication === "ON_INSTALL"
  );
}

function safeDirectoryEntries(directory, limit) {
  let entries = [];
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink() && safeDirectoryName(entry.name))
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch {
    return { entries: [], truncated: false };
  }
  return { entries: entries.slice(0, limit), truncated: entries.length > limit };
}

function safeDirectoryName(value) {
  return /^[A-Za-z0-9][A-Za-z0-9._+-]{0,127}$/.test(String(value || ""));
}

function unavailable(reason) {
  return {
    state: "unavailable",
    ok: false,
    mode: "public-seis-repo-runtime-cache-read-only",
    reason,
    findings: [],
    permissions: permissionBoundary()
  };
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeName(value) {
  const normalized = text(value);
  return normalized && !/\bpersonal\b/i.test(normalized) ? normalized : null;
}

function ensure(condition, findings, code, plugin) {
  if (condition || findings.length >= MAX_FINDINGS) return;
  const finding = { severity: "error", code };
  if (plugin) finding.plugin = plugin;
  findings.push(finding);
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function isSafeDirectory(filePath) {
  try {
    const stat = fs.lstatSync(filePath);
    return !stat.isSymbolicLink() && stat.isDirectory();
  } catch {
    return false;
  }
}

function isRegularFile(filePath) {
  try {
    const stat = fs.lstatSync(filePath);
    return !stat.isSymbolicLink() && stat.isFile();
  } catch {
    return false;
  }
}

function readJson(filePath) {
  try {
    return { data: JSON.parse(fs.readFileSync(filePath, "utf8")) };
  } catch {
    return { error: "invalid-json" };
  }
}

function permissionBoundary() {
  return {
    read: ["bounded public SEIS Repo metadata and declared cache manifests"],
    write: [],
    network: [],
    secrets: []
  };
}

const tools = [
  {
    name: "seis_public_runtime_status",
    description: "Compare public SEIS Repo cards with bounded local cache records without installing or enabling packages.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "seis_public_runtime_validate",
    description: "Validate public SEIS Repo runtime-status contracts without reading other cache roots, writing files, or using the network.",
    inputSchema: { type: "object", properties: {} }
  }
];

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

let pending = Buffer.alloc(0);

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-public-runtime-status", version: "0.1.0" } } });
  } else if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  } else if (message.method === "tools/call") {
    const name = message.params?.name;
    if (name === "seis_public_runtime_status") send({ jsonrpc: "2.0", id: message.id, result: inspectRuntimeCache() });
    else if (name === "seis_public_runtime_validate") send({ jsonrpc: "2.0", id: message.id, result: validateRuntimeStatus() });
    else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${String(name || "undefined")}` } });
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
      // Ignore malformed MCP frames without writing or exposing input data.
    }
    pending = pending.slice(start + length);
  }
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  console.log(JSON.stringify(status(), null, 2));
} else if (args.includes("--validate")) {
  console.log(JSON.stringify(validateRuntimeStatus(), null, 2));
} else if (args.includes("--runtime")) {
  console.log(JSON.stringify(inspectRuntimeCache(), null, 2));
} else {
  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
  process.stdin.on("end", () => process.exit(0));
}
