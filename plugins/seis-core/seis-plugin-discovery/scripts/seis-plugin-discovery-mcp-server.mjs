#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_CATALOG_RESULTS = 100;

function status() {
  return {
    plugin: "seis-plugin-discovery",
    status: fs.existsSync(path.join(pluginRoot, "skills", "seis-plugin-discovery", "SKILL.md")) ? "ready" : "partial",
    mode: "metadata-only-public-catalog-and-selected-local-read-only",
    publicCatalog: catalogStatus(),
    explicitPathRequired: true,
    network: "disabled-by-design",
    executesCandidateCode: false,
    followsSymlinks: false,
    writes: "disabled-by-design",
  };
}

function catalogStatus() {
  const marketplacePath = findMarketplacePath();
  if (!marketplacePath) {
    return {
      state: "unavailable",
      available: false,
      reason: "seis-repo-marketplace-not-found",
    };
  }

  const result = readJson(marketplacePath);
  if (result.error || !Array.isArray(result.data?.plugins)) {
    return {
      state: "attention",
      available: false,
      reason: result.error || "marketplace-plugin-list-missing",
    };
  }

  return {
    state: "ready",
    available: true,
    marketplaceName: result.data.name || null,
    marketplaceDisplayName: result.data.interface?.displayName || null,
    cardCount: result.data.plugins.length,
  };
}

function catalog(input = {}) {
  const availability = catalogStatus();
  if (!availability.available) {
    return {
      state: availability.state,
      ok: false,
      mode: "repo-marketplace-metadata-only",
      reason: availability.reason,
    };
  }

  const marketplacePath = findMarketplacePath();
  const result = readJson(marketplacePath);
  const entries = result.data.plugins || [];
  const query = String(input.query || "").trim().toLowerCase();
  const limit = normalizeLimit(input.limit);
  const matched = entries.filter((entry) => matchesCatalogQuery(entry, query));
  const cards = matched.slice(0, limit).map((entry) => ({
    name: entry.name || null,
    category: entry.category || null,
    installation: entry.policy?.installation || null,
    authentication: entry.policy?.authentication || null,
    sourcePath: safePublicSourcePath(entry.source?.path),
  }));

  return {
    state: "ready",
    ok: true,
    mode: "repo-marketplace-metadata-only",
    marketplaceName: result.data.name || null,
    marketplaceDisplayName: result.data.interface?.displayName || null,
    query: query || null,
    cardCount: entries.length,
    matchedCardCount: matched.length,
    returnedCardCount: cards.length,
    cards,
    limitations: [
      "Only public marketplace metadata is read.",
      "No plugin code, credentials, private cache data, or selected directories are read in catalog mode.",
      "Catalog availability does not imply that a card is installed or authorized for external actions.",
    ],
  };
}

function matchesCatalogQuery(entry, query) {
  if (!query) return true;
  return [entry?.name, entry?.category, entry?.source?.path]
    .some((value) => String(value || "").toLowerCase().includes(query));
}

function normalizeLimit(value) {
  const numeric = Number(value);
  if (!Number.isSafeInteger(numeric) || numeric < 1) return MAX_CATALOG_RESULTS;
  return Math.min(numeric, MAX_CATALOG_RESULTS);
}

function safePublicSourcePath(value) {
  const sourcePath = String(value || "");
  return sourcePath.startsWith("./plugins/") && !sourcePath.includes("..") ? sourcePath : null;
}

function findMarketplacePath() {
  const candidates = [process.env.SEIS_REPO_ROOT, process.env.SEIS_ROOT, pluginRoot]
    .filter((value) => typeof value === "string" && value.trim());

  for (const candidate of candidates) {
    let current = path.resolve(candidate);
    while (true) {
      const marketplacePath = path.join(current, ".agents", "plugins", "marketplace.json");
      if (fs.existsSync(marketplacePath)) {
        const result = readJson(marketplacePath);
        if (result.data?.name === "seis-repo" && Array.isArray(result.data?.plugins)) return marketplacePath;
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

function readJson(file) {
  try {
    return { data: JSON.parse(fs.readFileSync(file, "utf8")) };
  } catch {
    return { error: "invalid-json" };
  }
}

function classify(profile) {
  const source = String(profile?.sourceClassification ?? "").toLowerCase();
  const statusValue = String(profile?.status ?? "").toLowerCase();
  if (statusValue === "private" || source.includes("private")) return "private";
  if (source.includes("original-seis")) return "original-SEIS";
  if (source.includes("user-owned")) return "user-owned";
  if (source.includes("third-party")) return "third-party-open-source";
  if (source.includes("generated")) return "generated";
  if (source.includes("quarantined")) return "quarantined";
  if (source.includes("rejected")) return "rejected";
  if (source.includes("ready-for-reviewed-import")) return "ready-for-reviewed-import";
  return "unknown-rights";
}

function discover(input) {
  if (!input) return { state: "invalid-input", ok: false, mode: "metadata-only-local-read-only", reason: "explicit-path-required" };
  const root = path.resolve(String(input));
  let stat;
  try {
    stat = fs.lstatSync(root);
  } catch {
    return { state: "not-verified", ok: false, mode: "metadata-only-local-read-only", reason: "directory-not-found" };
  }
  if (stat.isSymbolicLink()) return { state: "blocked", ok: false, mode: "metadata-only-local-read-only", reason: "symlink-root-refused" };
  if (!stat.isDirectory()) return { state: "invalid-input", ok: false, mode: "metadata-only-local-read-only", reason: "path-is-not-directory" };

  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return { state: "attention", ok: false, mode: "metadata-only-local-read-only", reason: "directory-unreadable" };
  }

  const findings = [];
  const candidates = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      findings.push({ severity: "warning", code: "symlink-refused", entry: entry.name });
      continue;
    }
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const directory = path.join(root, entry.name);
    const manifestPath = path.join(directory, ".codex-plugin", "plugin.json");
    if (!fs.existsSync(manifestPath)) continue;
    const manifestResult = readJson(manifestPath);
    const profilePath = path.join(directory, "assets", "plugin-profile.json");
    const profileResult = fs.existsSync(profilePath) ? readJson(profilePath) : { error: "profile-missing" };
    const mcpPath = path.join(directory, ".mcp.json");
    const mcpResult = fs.existsSync(mcpPath) ? readJson(mcpPath) : { data: {} };
    const manifest = manifestResult.data;
    const profile = profileResult.data;
    const candidateFindings = [];
    if (manifestResult.error) candidateFindings.push(manifestResult.error);
    if (profileResult.error) candidateFindings.push(profileResult.error);
    if (!profile?.sourceClassification) candidateFindings.push("source-classification-missing");
    if (!profile?.license) candidateFindings.push("license-missing");
    if (!profile?.permissions) candidateFindings.push("permission-boundary-missing");
    if (!profile?.rollback) candidateFindings.push("rollback-missing");
    candidates.push({
      relativePath: entry.name,
      name: manifest?.name ?? null,
      version: manifest?.version ?? null,
      classification: classify(profile),
      reviewState: profile?.reviewState ?? null,
      mcpServerCount: Object.keys(mcpResult.data?.mcpServers ?? {}).length,
      metadataFindings: candidateFindings,
    });
  }
  return {
    state: candidates.length ? "ready" : "not-verified",
    ok: candidates.length > 0 && !findings.some((finding) => finding.severity === "error"),
    mode: "metadata-only-local-read-only",
    rootSelected: true,
    candidatesScanned: candidates.length,
    candidates,
    findings,
    limitations: [
      "Only direct children of the explicitly selected directory are inspected.",
      "Candidate code, assets, symlink targets, cloud folders, and device-wide paths are not scanned.",
      "Classification is metadata-derived and requires ownership and rights review before import.",
    ],
  };
}

const tools = [
  { name: "seis_plugin_discovery_status", description: "Report public catalog and metadata-only discovery readiness.", inputSchema: { type: "object", properties: {} } },
  {
    name: "seis_plugin_discovery_catalog",
    description: "List bounded public SEIS Repo marketplace metadata without reading plugin code.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: MAX_CATALOG_RESULTS },
      },
    },
  },
  { name: "seis_plugin_discovery", description: "Discover plugin metadata under an explicitly selected directory.", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } },
];

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

let pending = Buffer.alloc(0);

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-plugin-discovery", version: "0.1.0" } } });
  } else if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  } else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_plugin_discovery_status"
      ? status()
      : name === "seis_plugin_discovery_catalog"
        ? catalog(args)
        : name === "seis_plugin_discovery"
          ? discover(args.path)
          : null;
    if (result) send({ jsonrpc: "2.0", id: message.id, result });
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
      // Ignore malformed MCP frames without leaking input data.
    }
    pending = pending.slice(start + length);
  }
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  console.log(JSON.stringify(status(), null, 2));
} else if (args.includes("--catalog")) {
  const queryIndex = args.indexOf("--query");
  const limitIndex = args.indexOf("--limit");
  console.log(JSON.stringify(catalog({
    query: queryIndex >= 0 ? args[queryIndex + 1] : undefined,
    limit: limitIndex >= 0 ? args[limitIndex + 1] : undefined,
  }), null, 2));
} else if (args.includes("--discover")) {
  const index = args.indexOf("--path");
  console.log(JSON.stringify(discover(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
  process.stdin.on("end", () => process.exit(0));
}
