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
  intake: "content/development/trusted-marketplace-intake.json",
  bridge: "content/development/seis-trusted-marketplace-plugin.json",
  catalog: "content/development/plugin-capability-catalog.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json"
});

function status() {
  const report = validateTrustedMarketplace();
  return {
    plugin: "seis-trusted-marketplace",
    status: report.ok ? "ready" : report.state,
    mode: "public-seis-repo-trusted-marketplace-read-only",
    marketplace: compactReport(report),
    network: "disabled-by-design",
    executesPluginCode: false,
    followsSymlinks: false,
    writes: "disabled-by-design",
    secrets: "not-read"
  };
}

function validateTrustedMarketplace() {
  const located = findRepoRoot();
  if (!located) return unavailable("seis-repo-marketplace-not-found");

  const loaded = readContracts(located.repoRoot);
  if (loaded.error) return unavailable(loaded.error);

  const findings = [];
  const marketplace = loaded.contracts.marketplace;
  const intake = loaded.contracts.intake;
  const bridge = loaded.contracts.bridge;
  const catalog = loaded.contracts.catalog;
  const bundleMemberships = safeArray(loaded.contracts.bundleCatalog?.bundles).filter((bundle) => safeArray(bundle?.memberNames).includes("seis-trusted-marketplace"));
  const distributionBundle = bundleMemberships.length === 1 ? bundleMemberships[0] : null;
  const card = safeArray(marketplace.plugins).find((entry) => entry?.name === distributionBundle?.id);
  const directCard = safeArray(marketplace.plugins).find((entry) => entry?.name === "seis-trusted-marketplace");
  const channels = safeArray(intake.marketplaceChannels);
  const shortlist = safeArray(intake.trustedSourceShortlist);
  const channelIds = new Set(channels.map((channel) => text(channel?.id)).filter(Boolean));
  const publicPlugin = intake.publicCodexPlugin || {};

  ensure(marketplace.name === "seis-repo", findings, "marketplace-name-invalid");
  ensure(marketplace.interface?.displayName === "SEIS Repo", findings, "marketplace-display-name-invalid");
  ensure(bundleMemberships.length === 1, findings, "trusted-marketplace-bundle-membership-invalid");
  ensure(distributionBundle?.id === "seis-application-bundle-06", findings, "trusted-marketplace-distribution-bundle-invalid");
  ensure(distributionBundle?.family === "application", findings, "trusted-marketplace-distribution-family-invalid");
  ensure(!directCard, findings, "trusted-marketplace-direct-source-card-present");
  ensure(Boolean(card), findings, "trusted-marketplace-bundle-card-missing");
  if (card) {
    ensure(card.source?.source === "local", findings, "trusted-marketplace-bundle-card-source-invalid");
    ensure(card.source?.path === distributionBundle?.sourcePath, findings, "trusted-marketplace-bundle-card-path-invalid");
    ensure(card.policy?.installation === "AVAILABLE", findings, "trusted-marketplace-bundle-card-installation-invalid");
    ensure(card.policy?.authentication === "ON_INSTALL", findings, "trusted-marketplace-bundle-card-authentication-invalid");
    ensure(card.category === "Developer", findings, "trusted-marketplace-bundle-card-category-invalid");
  }
  ensure(loaded.contracts.bundleCatalog?.marketplace?.publicCardCount === 34, findings, "marketplace-current-card-count-invalid");
  ensure(loaded.contracts.bundleCatalog?.marketplace?.canonicalCardCount === 1, findings, "marketplace-canonical-card-count-invalid");
  ensure(loaded.contracts.bundleCatalog?.marketplace?.bundleCardCount === 33, findings, "marketplace-bundle-card-count-invalid");
  ensure(loaded.contracts.bundleCatalog?.marketplace?.applicationBundleCardCount === 6, findings, "marketplace-application-bundle-count-invalid");
  ensure(loaded.contracts.bundleCatalog?.marketplace?.topicBundleCardCount === 27, findings, "marketplace-topic-bundle-count-invalid");
  ensure(loaded.contracts.bundleCatalog?.sourceCapabilityInventory?.retainedSourcePackageCount === 380, findings, "marketplace-retained-source-count-invalid");
  ensure(safeArray(marketplace.plugins).length === 34, findings, "marketplace-live-card-count-invalid");

  ensure(intake.id === "seis-trusted-marketplace-intake", findings, "intake-id-invalid");
  ensure(intake.mode === "curated-marketplace-readiness", findings, "intake-mode-invalid");
  ensure(channels.length >= 6, findings, "intake-channel-coverage-insufficient");
  ensure(shortlist.length >= 8, findings, "intake-shortlist-coverage-insufficient");
  for (const required of ["github-mcp-registry", "github-marketplace-actions", "github-marketplace-apps", "github-models", "awesome-github-copilot", "github-app-copilot-extensions"]) {
    ensure(channelIds.has(required), findings, "intake-required-channel-missing", required);
  }
  ensure(publicPlugin.name === "seis-trusted-marketplace", findings, "intake-public-plugin-name-invalid");
  ensure(publicPlugin.marketplaceName === "seis-repo", findings, "intake-public-plugin-marketplace-invalid");
  ensure(publicPlugin.sourcePath === "plugins/seis-core/seis-trusted-marketplace", findings, "intake-public-plugin-source-invalid");
  ensure(publicPlugin.marketplaceCard === false, findings, "intake-public-plugin-direct-card-invalid");
  ensure(publicPlugin.marketplacePresentation === "retained-source-through-bundle-card", findings, "intake-public-plugin-presentation-invalid");
  ensure(publicPlugin.distributionBundleId === "seis-application-bundle-06", findings, "intake-public-plugin-bundle-invalid");
  ensure(publicPlugin.distributionInstallId === "seis-application-bundle-06@seis-repo", findings, "intake-public-plugin-install-invalid");
  ensure(publicPlugin.directInstallAvailable === false, findings, "intake-public-plugin-direct-install-invalid");
  ensure(publicPlugin.activationPolicy === "approval-gated", findings, "intake-public-plugin-activation-policy-invalid");
  ensure(catalog.marketplaceIntake === "content/development/trusted-marketplace-intake.json", findings, "catalog-intake-link-invalid");

  ensure(bridge.id === "seis-trusted-marketplace-plugin", findings, "bridge-id-invalid");
  ensure(bridge.status === "public-repository-successor", findings, "bridge-status-invalid");
  ensure(bridge.plugin?.name === "seis-trusted-marketplace", findings, "bridge-plugin-name-invalid");
  ensure(bridge.plugin?.marketplaceName === "seis-repo", findings, "bridge-marketplace-invalid");
  ensure(bridge.plugin?.sourcePath === "plugins/seis-core/seis-trusted-marketplace", findings, "bridge-source-path-invalid");
  ensure(bridge.plugin?.publicAudience === "everyone", findings, "bridge-audience-invalid");
  ensure(bridge.plugin?.publicMarketplace === true, findings, "bridge-public-marketplace-invalid");
  ensure(bridge.plugin?.marketplaceCard === false, findings, "bridge-direct-card-invalid");
  ensure(bridge.plugin?.marketplacePresentation === "retained-source-through-bundle-card", findings, "bridge-presentation-invalid");
  ensure(bridge.plugin?.distributionBundleId === "seis-application-bundle-06", findings, "bridge-bundle-invalid");
  ensure(bridge.plugin?.directInstallAvailable === false, findings, "bridge-direct-install-invalid");
  ensure(bridge.pluginRepository?.mode === "public-repository-app-owned", findings, "bridge-repository-mode-invalid");
  ensure(bridge.pluginRepository?.canonicalRepository === "SEIS", findings, "bridge-canonical-repository-invalid");
  ensure(bridge.activationBoundary?.externalActivation === "approval-required", findings, "bridge-external-activation-boundary-invalid");

  validatePublicTerms({ card, publicPlugin, bridge, distributionBundle }, findings);

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  return {
    state: errorCount ? "attention" : "ready",
    ok: errorCount === 0,
    mode: "public-seis-repo-trusted-marketplace-read-only",
    marketplaceName: marketplace.name === "seis-repo" ? "seis-repo" : null,
    marketplaceDisplayName: marketplace.interface?.displayName === "SEIS Repo" ? "SEIS Repo" : null,
    marketplaceCard: Boolean(directCard),
    distributionBundleCardPresent: Boolean(card),
    directCardPresent: Boolean(directCard),
    distributionBundleId: distributionBundle?.id || null,
    distributionBundleMembershipCount: bundleMemberships.length,
    channelCount: channels.length,
    trustedSourceCount: shortlist.length,
    errorCount,
    warningCount: 0,
    findings: findings.slice(0, MAX_FINDINGS),
    permissions: permissionBoundary(),
    limitations: [
      "Only fixed public marketplace and intake contracts inside the SEIS repository are read.",
      "External sources remain curated candidates; no connector, provider, or marketplace action is installed or enabled.",
      "Validation does not read credentials, local user plugin directories, caches, or arbitrary device paths."
    ]
  };
}

function validatePublicTerms(value, findings) {
  const serialized = JSON.stringify(value);
  ensure(!PERSONAL_TERM.test(serialized), findings, "visible-personal-terminology");
  ensure(!ABSOLUTE_PATH.test(serialized), findings, "machine-specific-public-path");
}

function findRepoRoot() {
  const candidates = [process.env.SEIS_REPO_ROOT, process.env.SEIS_ROOT, pluginRoot]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => path.resolve(value));
  for (const candidate of candidates) {
    let current = candidate;
    while (true) {
      const marketplacePath = path.join(current, CONTRACTS.marketplace);
      if (isSafeRegularFile(current, marketplacePath)) {
        const marketplace = readJson(marketplacePath);
        if (marketplace.data?.name === "seis-repo" && Array.isArray(marketplace.data?.plugins)) return { repoRoot: current };
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
    if (!isInside(repoRoot, absolutePath) || !isSafeRegularFile(repoRoot, absolutePath)) return { error: "public-contract-missing-or-unsafe" };
    const result = readJson(absolutePath);
    if (result.error) return { error: "public-contract-invalid" };
    contracts[name] = result.data;
  }
  return { contracts };
}

function isSafeRegularFile(root, filePath) {
  if (!isInside(root, filePath)) return false;
  try {
    const rootStat = fs.lstatSync(root);
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) return false;
    let current = root;
    const segments = path.relative(root, filePath).split(path.sep);
    for (const segment of segments) {
      if (!segment || segment === "." || segment === "..") return false;
      current = path.join(current, segment);
      const stat = fs.lstatSync(current);
      if (stat.isSymbolicLink()) return false;
      if (current !== filePath && !stat.isDirectory()) return false;
    }
    return fs.lstatSync(filePath).isFile();
  } catch {
    return false;
  }
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function unavailable(reason) {
  return {
    state: "unavailable",
    ok: false,
    mode: "public-seis-repo-trusted-marketplace-read-only",
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
    marketplaceCard: report.marketplaceCard ?? false,
    distributionBundleCardPresent: report.distributionBundleCardPresent ?? false,
    distributionBundleId: report.distributionBundleId || null,
    channelCount: report.channelCount ?? null,
    trustedSourceCount: report.trustedSourceCount ?? null,
    errorCount: report.errorCount ?? null
  };
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function ensure(condition, findings, code, subject) {
  if (condition) return;
  const finding = { severity: "error", code };
  if (subject && !PERSONAL_TERM.test(subject)) finding.subject = subject;
  findings.push(finding);
}

function permissionBoundary() {
  return {
    read: [
      "bounded public SEIS marketplace intake contracts",
      "declared public marketplace bundle metadata"
    ],
    write: [],
    network: [],
    secrets: []
  };
}

function readJson(filePath) {
  try {
    return { data: JSON.parse(fs.readFileSync(filePath, "utf8")) };
  } catch {
    return { error: "invalid-json" };
  }
}

const tools = [
  {
    name: "seis_trusted_marketplace_status",
    description: "Report public SEIS Repo trusted-marketplace readiness without writes.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "seis_trusted_marketplace_validate",
    description: "Validate trusted-source intake and activation gates without external access.",
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
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-trusted-marketplace", version: "0.0.13" } } });
  } else if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  } else if (message.method === "tools/call") {
    const name = message.params?.name;
    if (name === "seis_trusted_marketplace_status") send({ jsonrpc: "2.0", id: message.id, result: status() });
    else if (name === "seis_trusted_marketplace_validate") send({ jsonrpc: "2.0", id: message.id, result: validateTrustedMarketplace() });
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
      // Ignore malformed MCP frames without reflecting caller-controlled input.
    }
    pending = pending.slice(start + length);
  }
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  console.log(JSON.stringify(status(), null, 2));
} else if (args.includes("--validate")) {
  console.log(JSON.stringify(validateTrustedMarketplace(), null, 2));
} else {
  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
  process.stdin.on("end", () => process.exit(0));
}
