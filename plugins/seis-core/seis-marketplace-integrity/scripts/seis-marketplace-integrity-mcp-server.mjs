#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_FINDINGS = 100;

function status() {
  const marketplace = marketplaceStatus();
  return {
    plugin: "seis-marketplace-integrity",
    status: isRegularFile(path.join(pluginRoot, "skills", "seis-marketplace-integrity", "SKILL.md")) ? "ready" : "partial",
    mode: "public-seis-repo-marketplace-read-only",
    marketplace,
    network: "disabled-by-design",
    executesPluginCode: false,
    followsSymlinks: false,
    writes: "disabled-by-design",
    secrets: "not-read",
  };
}

function marketplaceStatus() {
  const located = findMarketplace();
  if (!located) {
    return {
      state: "unavailable",
      available: false,
      reason: "seis-repo-marketplace-not-found",
    };
  }

  const result = readJson(located.marketplacePath);
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
    marketplaceName: result.data.name === "seis-repo" ? "seis-repo" : null,
    marketplaceDisplayName: result.data.interface?.displayName === "SEIS Repo" ? "SEIS Repo" : null,
    cardCount: result.data.plugins.length,
  };
}

function validateMarketplace() {
  const located = findMarketplace();
  if (!located) {
    return {
      state: "unavailable",
      ok: false,
      mode: "public-seis-repo-marketplace-read-only",
      reason: "seis-repo-marketplace-not-found",
      permissions: permissionBoundary(),
    };
  }

  const result = readJson(located.marketplacePath);
  if (result.error || !Array.isArray(result.data?.plugins)) {
    return {
      state: "attention",
      ok: false,
      mode: "public-seis-repo-marketplace-read-only",
      reason: result.error || "marketplace-plugin-list-missing",
      permissions: permissionBoundary(),
    };
  }

  const marketplace = result.data;
  const findings = [];
  if (marketplace.name !== "seis-repo") addFinding(findings, "error", "marketplace-name-invalid");
  if (marketplace.interface?.displayName !== "SEIS Repo") addFinding(findings, "error", "marketplace-display-name-invalid");

  const names = new Set();
  let manifestCount = 0;
  for (const card of marketplace.plugins) {
    const cardName = normalizedText(card?.name);
    const safeName = publicName(cardName);
    if (!cardName) {
      addFinding(findings, "error", "card-name-missing");
      continue;
    }
    if (names.has(cardName)) addFinding(findings, "error", "card-name-duplicate", safeName);
    names.add(cardName);
    if (containsPersonal(cardName)) addFinding(findings, "error", "visible-personal-terminology", null);
    if (card?.source?.source !== "local") addFinding(findings, "error", "card-source-type-invalid", safeName);
    if (!validInstallationPolicy(card?.policy?.installation)) addFinding(findings, "error", "card-installation-policy-invalid", safeName);
    if (!validAuthenticationPolicy(card?.policy?.authentication)) addFinding(findings, "error", "card-authentication-policy-invalid", safeName);
    if (!normalizedText(card?.category)) addFinding(findings, "error", "card-category-missing", safeName);

    const source = validateSourcePath(card?.source?.path, located.repoRoot);
    if (!source.ok) {
      addFinding(findings, "error", source.code, safeName);
      continue;
    }
    if (containsPersonal(source.relativePath)) addFinding(findings, "error", "visible-personal-terminology", safeName);

    const pluginDirectory = source.absolutePath;
    if (!isSafeDirectory(pluginDirectory)) {
      addFinding(findings, "error", "plugin-directory-missing-or-unsafe", safeName);
      continue;
    }
    const manifestDirectory = path.join(pluginDirectory, ".codex-plugin");
    if (!isSafeDirectory(manifestDirectory)) {
      addFinding(findings, "error", "plugin-manifest-directory-missing-or-unsafe", safeName);
      continue;
    }
    const manifestPath = path.join(manifestDirectory, "plugin.json");
    if (!isRegularFile(manifestPath)) {
      addFinding(findings, "error", "plugin-manifest-missing-or-unsafe", safeName);
      continue;
    }
    const manifestResult = readJson(manifestPath);
    if (manifestResult.error || !manifestResult.data || typeof manifestResult.data !== "object") {
      addFinding(findings, "error", "plugin-manifest-invalid-json", safeName);
      continue;
    }

    manifestCount += 1;
    const manifest = manifestResult.data;
    if (manifest.name !== cardName) addFinding(findings, "error", "plugin-manifest-name-mismatch", safeName);
    for (const field of visibleManifestFields(manifest)) {
      if (containsPersonal(field.value)) addFinding(findings, "error", "visible-personal-terminology", safeName);
    }
  }

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  const warningCount = findings.filter((finding) => finding.severity === "warning").length;
  return {
    state: errorCount ? "attention" : "ready",
    ok: errorCount === 0,
    mode: "public-seis-repo-marketplace-read-only",
    marketplaceName: marketplace.name === "seis-repo" ? "seis-repo" : null,
    marketplaceDisplayName: marketplace.interface?.displayName === "SEIS Repo" ? "SEIS Repo" : null,
    cardCount: marketplace.plugins.length,
    uniqueCardCount: names.size,
    manifestCount,
    errorCount,
    warningCount,
    findings: findings.slice(0, MAX_FINDINGS),
    permissions: permissionBoundary(),
    limitations: [
      "Only the public marketplace header, card metadata, and declared plugin manifests are read.",
      "Plugin code, assets, credentials, caches, cloud folders, and arbitrary device paths are not read.",
      "Validation does not install, enable, execute, or authorize any plugin capability.",
    ],
  };
}

function findMarketplace() {
  const candidates = [process.env.SEIS_REPO_ROOT, process.env.SEIS_ROOT, pluginRoot]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => path.resolve(value));

  for (const candidate of candidates) {
    let current = candidate;
    while (true) {
      const marketplacePath = path.join(current, ".agents", "plugins", "marketplace.json");
      if (isRegularFile(marketplacePath)) {
        const result = readJson(marketplacePath);
        if (result.data?.name === "seis-repo" && Array.isArray(result.data?.plugins)) {
          return { marketplacePath, repoRoot: current };
        }
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

function validateSourcePath(value, repoRoot) {
  const relativePath = normalizedText(value);
  if (!relativePath || !relativePath.startsWith("./plugins/") || relativePath.includes("\\") || relativePath.endsWith("/")) {
    return { ok: false, code: "card-source-path-invalid" };
  }
  const relativeSegments = relativePath.slice(2).split("/");
  if (relativeSegments.length < 2 || relativeSegments.some((segment) => !segment || segment === "." || segment === "..")) {
    return { ok: false, code: "card-source-path-invalid" };
  }
  const pluginsRoot = path.resolve(repoRoot, "plugins");
  const absolutePath = path.resolve(repoRoot, relativePath.slice(2));
  if (!isDescendant(absolutePath, pluginsRoot)) return { ok: false, code: "card-source-path-escapes-plugin-root" };
  return { ok: true, relativePath, absolutePath };
}

function visibleManifestFields(manifest) {
  return [
    { name: "name", value: manifest?.name },
    { name: "description", value: manifest?.description },
    { name: "displayName", value: manifest?.interface?.displayName },
    { name: "shortDescription", value: manifest?.interface?.shortDescription },
    { name: "longDescription", value: manifest?.interface?.longDescription },
  ];
}

function validInstallationPolicy(value) {
  return ["AVAILABLE", "INSTALLED_BY_DEFAULT", "NOT_AVAILABLE"].includes(value);
}

function validAuthenticationPolicy(value) {
  return ["ON_INSTALL", "ON_USE"].includes(value);
}

function isDescendant(candidate, root) {
  const relative = path.relative(root, candidate);
  return Boolean(relative) && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function isSafeDirectory(filePath) {
  const stat = lstat(filePath);
  return Boolean(stat && !stat.isSymbolicLink() && stat.isDirectory());
}

function isRegularFile(filePath) {
  const stat = lstat(filePath);
  return Boolean(stat && !stat.isSymbolicLink() && stat.isFile());
}

function lstat(filePath) {
  try {
    return fs.lstatSync(filePath);
  } catch {
    return null;
  }
}

function readJson(filePath) {
  try {
    return { data: JSON.parse(fs.readFileSync(filePath, "utf8")) };
  } catch {
    return { error: "invalid-json" };
  }
}

function normalizedText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function containsPersonal(value) {
  return /\bpersonal\b/i.test(String(value || ""));
}

function publicName(value) {
  return value && !containsPersonal(value) ? value : null;
}

function addFinding(findings, severity, code, plugin) {
  if (findings.length >= MAX_FINDINGS) return;
  const finding = { severity, code };
  if (plugin) finding.plugin = plugin;
  findings.push(finding);
}

function permissionBoundary() {
  return { read: ["bounded public marketplace metadata", "declared plugin manifests"], write: [], network: [], secrets: [] };
}

const tools = [
  {
    name: "seis_marketplace_integrity_status",
    description: "Report bounded public SEIS Repo marketplace validation readiness without writes.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seis_marketplace_integrity_validate",
    description: "Validate public SEIS Repo card identity, source boundaries, and declared manifests without executing plugins.",
    inputSchema: { type: "object", properties: {} },
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
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-marketplace-integrity", version: "0.0.13" } } });
  } else if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  } else if (message.method === "tools/call") {
    const name = message.params?.name;
    if (name === "seis_marketplace_integrity_status") send({ jsonrpc: "2.0", id: message.id, result: status() });
    else if (name === "seis_marketplace_integrity_validate") send({ jsonrpc: "2.0", id: message.id, result: validateMarketplace() });
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
      // Ignore malformed MCP frames without echoing caller input.
    }
    pending = pending.slice(start + length);
  }
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  console.log(JSON.stringify(status(), null, 2));
} else if (args.includes("--validate")) {
  console.log(JSON.stringify(validateMarketplace(), null, 2));
} else {
  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
  process.stdin.on("end", () => process.exit(0));
}
