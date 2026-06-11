#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(`
Usage:
  node scripts/check-seis-repos-llm-bridge.mjs

Options:
  --source <repo-root>   Source repository root (default: process.cwd())
  --help                 Show usage
`);
  process.exit(0);
}

const sourceRoot = resolvePath(args.source || ROOT);
const bridgeFile = path.join(sourceRoot, "data", "seis-repos-llm-bridge-2026-06-08.json");
const failures = [];

if (!fs.existsSync(bridgeFile)) {
  fail(`bridge file missing: ${path.relative(ROOT, bridgeFile)}`);
} else {
  const bridge = readJson(bridgeFile);
  if (!bridge) {
    fail(`bridge file is not valid JSON: ${path.relative(ROOT, bridgeFile)}`);
  } else {
    const required = [
      "id",
      "version",
      "updatedAt",
      "canonical",
      "plugin",
      "mcp",
      "llmPackages",
    ];

    for (const key of required) {
      ensure(bridge[key] !== undefined, `bridge missing key '${key}'`);
    }

    ensure(bridge.canonical?.repo, "bridge.canonical.repo is required");
    ensure(bridge.canonical?.branch, "bridge.canonical.branch is required");
    ensure(bridge.mcp?.server, "bridge.mcp.server is required");
    ensure(bridge.plugin?.manifest, "bridge.plugin.manifest is required");
    ensure(bridge.plugin?.localPath, "bridge.plugin.localPath is required");
    ensure(bridge.plugin?.mcpManifest, "bridge.plugin.mcpManifest is required");
    ensure(bridge.llmPackages?.registry, "bridge.llmPackages.registry is required");
    ensure(bridge.llmPackages?.routingPolicy, "bridge.llmPackages.routingPolicy is required");
    ensure(bridge.llmPackages?.adapters, "bridge.llmPackages.adapters is required");
    ensure(bridge.llmPackages?.requestBlueprints, "bridge.llmPackages.requestBlueprints is required");
    ensure(bridge.llmPackages?.planner, "bridge.llmPackages.planner is required");

    const checks = [
      bridge.canonical?.repo,
      bridge.mcp?.server,
      bridge.llmPackages?.registry,
      bridge.llmPackages?.routingPolicy,
      bridge.llmPackages?.adapters,
      bridge.llmPackages?.requestBlueprints,
      bridge.llmPackages?.planner,
      bridge.plugin?.manifest,
      bridge.plugin?.localPath,
      bridge.plugin?.mcpManifest,
    ];
    for (const item of checks) {
      if (item) {
        ensure(fs.existsSync(path.join(sourceRoot, item)), `${item} referenced by bridge does not exist`);
      }
    }

    validateJsonObject(path.join(sourceRoot, bridge.llmPackages?.registry), "llmPackageRegistry", ["id", "packages"]);
    validateJsonObject(path.join(sourceRoot, bridge.llmPackages?.routingPolicy), "llmTaskRoutingPolicy", ["id", "policy"]);
    validateJsonObject(path.join(sourceRoot, bridge.llmPackages?.adapters), "llmAdapterReadiness", ["id", "adapters"]);
    validateJsonObject(path.join(sourceRoot, bridge.llmPackages?.requestBlueprints), "llmRequestBlueprints", ["id", "blueprints"]);
    validateCodeContains(path.join(sourceRoot, bridge.llmPackages?.planner), "planTask", "llm task planner must export planTask");
    ensureFile(path.join(sourceRoot, bridge.mcp?.server), "mcp server entry");
    validateCodeContains(path.join(sourceRoot, bridge.mcp?.server), "initialize", "mcp server should expose initialize handling");
  }
}

if (failures.length > 0) {
  console.error("SEIS repos llm bridge check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS repos llm bridge check passed.");

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function validateJsonObject(file, label, requiredKeys = []) {
  const record = readJson(file);
  if (!record || typeof record !== "object") {
    fail(`${label} must be an object: ${path.relative(ROOT, file)}`);
    return;
  }
  for (const key of requiredKeys) {
    ensure(record[key] !== undefined, `${label}: key '${key}' is missing`);
  }
}

function validateCodeContains(file, token, message) {
  if (!fs.existsSync(file)) {
    fail(`file not found: ${path.relative(ROOT, file)}`);
    return;
  }
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes(token)) {
    fail(`${message}: ${path.relative(ROOT, file)}`);
  }
}

function ensureFile(file, label) {
  if (!file || !fs.existsSync(file)) {
    fail(`${label} missing: ${path.relative(ROOT, String(file))}`);
  }
}

function fail(message) {
  failures.push(message);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help") {
      out.help = true;
      continue;
    }

    if (token === "--source") {
      const value = argv[i + 1];
      if (value && !value.startsWith("--")) {
        out.source = value;
        i += 1;
      }
    }
  }
  return out;
}

function resolvePath(candidate) {
  return path.resolve(candidate);
}
