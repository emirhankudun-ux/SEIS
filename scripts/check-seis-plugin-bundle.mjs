#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const args = parseArgs(process.argv.slice(2));

  if (args.help) {
  console.log(`
Usage:
  node scripts/check-seis-plugin-bundle.mjs [options]

Options:
  --source <repo-root>      Repository root (default: process.cwd())
  --local <plugin-root>     Local plugin root (auto-detected)
  --strict                  Treat optional bridge assets as required
  --no-local                Skip parity checks against local plugin installation
  --help                    Show usage
`);
  process.exit(0);
}

const sourceRoot = resolvePath(args.source || ROOT);
const localRoot = resolveLocalPluginRoot(args.local, sourceRoot);
const strict = Boolean(args.strict);
const checkLocal = args["no-local"] !== true;

const failures = [];

const pluginSourceRoot = path.join(sourceRoot, "plugins", "seis");
const requiredRepoFiles = [
  path.join(pluginSourceRoot, ".codex-plugin", "plugin.json"),
  path.join(pluginSourceRoot, ".mcp.json"),
  path.join(pluginSourceRoot, "scripts", "seis-mcp-launcher.mjs"),
  path.join(pluginSourceRoot, "scripts", "seis-mcp-bundle-audit.sh"),
  path.join(pluginSourceRoot, "skills", "seis-hub", "SKILL.md"),
  path.join(pluginSourceRoot, "skills", "seis-cloud", "SKILL.md"),
  path.join(pluginSourceRoot, "skills", "seis-code", "SKILL.md"),
  path.join(pluginSourceRoot, "skills", "seis-design", "SKILL.md"),
  path.join(pluginSourceRoot, "skills", "seis-data", "SKILL.md"),
  path.join(pluginSourceRoot, "skills", "seis-github-workflow", "SKILL.md"),
  path.join(pluginSourceRoot, "skills", "seis-github-workflow", "agents", "openai.yaml"),
  path.join(pluginSourceRoot, "skills", "seis-focus-mode", "SKILL.md"),
  path.join(pluginSourceRoot, "skills", "seis-focus-mode", "agents", "openai.yaml"),
  path.join(pluginSourceRoot, "skills", "seis-god-mode-developer", "SKILL.md"),
  path.join(pluginSourceRoot, "skills", "seis-god-mode-developer", "agents", "openai.yaml"),
  path.join(pluginSourceRoot, "skills", "seis-master-prompt", "SKILL.md"),
  path.join(pluginSourceRoot, "skills", "seis-master-prompt", "agents", "openai.yaml"),
  path.join(pluginSourceRoot, "skills", "seis-security-review", "SKILL.md"),
  path.join(pluginSourceRoot, "skills", "seis-security-review", "agents", "openai.yaml"),
];

const requiredBundleAssets = [
  path.join(sourceRoot, "data", "seis-mcp-server-2026-06-07.json"),
  path.join(sourceRoot, "data", "seis-repos-llm-bridge-2026-06-08.json"),
  path.join(sourceRoot, "content", "development", "llm-package-registry.json"),
  path.join(sourceRoot, "content", "development", "llm-task-routing-policy.json"),
  path.join(sourceRoot, "content", "development", "llm-adapter-readiness.json"),
  path.join(sourceRoot, "content", "development", "llm-request-blueprints.json"),
  path.join(sourceRoot, "packages", "ai-language", "src", "llm-task-planner.mjs"),
];

const requiredMcpAssets = [
  path.join(sourceRoot, "mcp", "seis-mcp-server.mjs"),
];

ensureDir(pluginSourceRoot, "source plugin root");
for (const file of requiredRepoFiles) {
  ensureFile(file, `${file} (repo source)`);
}

for (const file of requiredMcpAssets) {
  ensureFile(file, `${file} (mcp server entry)`);
}

if (strict) {
  for (const file of requiredBundleAssets) {
    ensureFile(file, `${file} (bundle asset)`);
  }
} else {
  for (const file of requiredBundleAssets) {
    if (!fs.existsSync(file)) {
      console.log(`[optional-missing] ${path.relative(ROOT, file)}`);
    }
  }
}

const sourcePluginManifest = readJson(path.join(pluginSourceRoot, ".codex-plugin", "plugin.json"));
if (!sourcePluginManifest) {
  fail("source plugin manifest could not be read");
} else {
  ensure(sourcePluginManifest.name === "seis", "source plugin manifest must define name: seis");
  ensure(sourcePluginManifest.mcpServers === "./.mcp.json", "source plugin manifest must set mcpServers to ./.mcp.json");
  ensure(Array.isArray(sourcePluginManifest.interface?.capabilities), "source plugin capabilities must be an array");
  const requiredCapabilities = [
    "Repository workflow",
    "Plugin development",
    "Migration safety",
    "SEIS Repos bridge",
    "LLM package governance",
    "LLM adapter readiness",
    "LLM request planning",
    "MCP bundled install",
    "MCP source proof",
    "SEIS Cloud deployment lane",
    "SEIS-Code engineering lane",
    "SEIS-Design product lane",
    "SEIS-DATA knowledge lane",
    "SEIS GitHub workflow governance",
    "SEIS Master Prompt governance",
    "SEIS Security Review governance",
    "SEIS Focus Mode AGI operating lane",
    "SEIS God Mode Developer cross-layer lane",
  ];
  for (const capability of requiredCapabilities) {
    ensure(sourcePluginManifest.interface.capabilities.includes(capability), `source plugin capability missing: ${capability}`);
  }
  const defaultPrompt = Array.isArray(sourcePluginManifest.interface?.defaultPrompt)
    ? sourcePluginManifest.interface.defaultPrompt.join("\n")
    : "";
  ensure(
    defaultPrompt.includes("Use SEIS Master Prompt governance"),
    "source plugin defaultPrompt must expose SEIS Master Prompt governance"
  );
  ensure(
    defaultPrompt.includes("Use SEIS GitHub workflow governance"),
    "source plugin defaultPrompt must expose SEIS GitHub workflow governance"
  );
  ensure(
    defaultPrompt.includes("Use SEIS Security Review governance"),
    "source plugin defaultPrompt must expose SEIS Security Review governance"
  );
  ensure(
    defaultPrompt.includes("Use SEIS Focus Mode"),
    "source plugin defaultPrompt must expose SEIS Focus Mode"
  );
  ensure(
    defaultPrompt.includes("Use SEIS God Mode Developer"),
    "source plugin defaultPrompt must expose SEIS God Mode Developer"
  );
}

const sourceMcpManifest = readJson(path.join(pluginSourceRoot, ".mcp.json"));
if (!sourceMcpManifest) {
  fail("source .mcp manifest could not be read");
} else {
  const server = sourceMcpManifest?.mcpServers?.seis;
  ensure(server?.command === "node", "source MCP server must use node command");
  ensure(Array.isArray(server?.args) && server.args.length > 0, "source MCP server must provide args");
  ensure(
    String(server.args[0]).includes("seis-mcp-launcher.mjs") || String(server.args[0]).includes("mcp/seis-mcp-server.mjs"),
    "source MCP server args must point to seis-mcp-launcher.mjs or seis-mcp-server.mjs"
  );
}

if (checkLocal) {
  if (fs.existsSync(localRoot)) {
    ensureDir(localRoot, "local plugin root");
    const localPluginManifestPath = path.join(localRoot, ".codex-plugin", "plugin.json");
    ensureFile(localPluginManifestPath, "local plugin manifest");

    const localPluginManifest = readJson(localPluginManifestPath);
    if (localPluginManifest) {
      ensure(localPluginManifest.name === "seis", "local plugin manifest must define name: seis");
    }

    const localMcpManifest = readJson(path.join(localRoot, ".mcp.json"));
    if (localMcpManifest) {
      const localServer = localMcpManifest?.mcpServers?.seis;
      ensure(localServer?.command === "node", "local MCP server must use node command");
      ensure(Array.isArray(localServer?.args) && localServer.args.length > 0, "local MCP server must provide args");
    }

    const localMirrorFiles = [
      path.join(localRoot, "scripts", "seis-mcp-launcher.mjs"),
      path.join(localRoot, "scripts", "seis-mcp-bundle-audit.sh"),
      path.join(localRoot, "skills", "seis-hub", "SKILL.md"),
      path.join(localRoot, "skills", "seis-cloud", "SKILL.md"),
      path.join(localRoot, "skills", "seis-code", "SKILL.md"),
      path.join(localRoot, "skills", "seis-design", "SKILL.md"),
      path.join(localRoot, "skills", "seis-data", "SKILL.md"),
      path.join(localRoot, ".codex-plugin", "plugin.json"),
      path.join(localRoot, ".mcp.json"),
    ];
    for (const localFile of localMirrorFiles) {
      ensureFile(localFile, `local mirror file: ${path.relative(ROOT, localFile)}`);
    }
  } else {
    console.log(`[skip] local plugin root not found: ${localRoot}`);
  }
}

if (fs.existsSync(path.join(sourceRoot, "data", "seis-mcp-server-2026-06-07.json")) || strict) {
  validateJsonObject(path.join(sourceRoot, "data", "seis-mcp-server-2026-06-07.json"), "mcp server manifest", ["id", "version", "status", "updatedAt"]);
}

if (fs.existsSync(path.join(sourceRoot, "data", "seis-repos-llm-bridge-2026-06-08.json")) || strict) {
  validateJsonObject(path.join(sourceRoot, "data", "seis-repos-llm-bridge-2026-06-08.json"), "repos-llm bridge manifest", ["id", "version", "updatedAt", "canonical", "plugin", "mcp", "llmPackages"]);
}

if (fs.existsSync(path.join(sourceRoot, "content", "development", "llm-package-registry.json")) || strict) {
  validateJsonObject(path.join(sourceRoot, "content", "development", "llm-package-registry.json"), "llm package registry", ["id", "packages"]);
}

if (fs.existsSync(path.join(sourceRoot, "content", "development", "llm-task-routing-policy.json")) || strict) {
  validateJsonObject(path.join(sourceRoot, "content", "development", "llm-task-routing-policy.json"), "llm task routing policy", ["id", "policy"]);
}

if (fs.existsSync(path.join(sourceRoot, "content", "development", "llm-adapter-readiness.json")) || strict) {
  validateJsonObject(path.join(sourceRoot, "content", "development", "llm-adapter-readiness.json"), "llm adapter readiness", ["id", "adapters"]);
}

if (fs.existsSync(path.join(sourceRoot, "content", "development", "llm-request-blueprints.json")) || strict) {
  validateJsonObject(path.join(sourceRoot, "content", "development", "llm-request-blueprints.json"), "llm request blueprints", ["id", "blueprints"]);
}
validateCodeContains(path.join(sourceRoot, "packages", "ai-language", "src", "llm-task-planner.mjs"), "planTask", "llm task planner must export planTask");
validateCodeContains(path.join(sourceRoot, "mcp", "seis-mcp-server.mjs"), "tools/list", "mcp server should expose tools/list handler stub");
for (const specialistTool of ["seis_specialist_lanes", "seis_specialist_lane_status", "seis_specialist_lane_plan"]) {
  validateCodeContains(path.join(sourceRoot, "mcp", "seis-mcp-server.mjs"), specialistTool, `mcp server should expose ${specialistTool}`);
}

if (failures.length > 0) {
  console.error("SEIS plugin bundle check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS plugin bundle check passed.");

function ensure(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function ensureDir(candidate, label) {
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isDirectory()) {
    fail(`${label} not found: ${candidate}`);
  }
}

function ensureFile(candidate, label) {
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    fail(`${label} missing: ${candidate}`);
  }
}

function fail(message) {
  failures.push(message);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    fail(`invalid JSON: ${filePath}`);
    return null;
  }
}

function validateJsonObject(filePath, label, requiredKeys = []) {
  const record = readJson(filePath);
  if (!record || typeof record !== "object") {
    fail(`${label} must be a JSON object: ${path.relative(ROOT, filePath)}`);
    return;
  }

  for (const key of requiredKeys) {
    ensure(record[key] !== undefined, `${label}: key '${key}' is missing`);
  }
}

function validateCodeContains(filePath, token, message) {
  if (!fs.existsSync(filePath)) {
    fail(`file not found: ${path.relative(ROOT, filePath)}`);
    return;
  }

  const text = fs.readFileSync(filePath, "utf8");
  ensure(text.includes(token), `${message}: ${path.relative(ROOT, filePath)}`);
}

function resolvePath(candidate) {
  return path.resolve(candidate);
}

function resolveLocalPluginRoot(explicit, sourceRoot) {
  if (explicit) {
    return resolvePath(explicit);
  }

  const explicitCandidates = [
    process.env.PLUGIN_ROOT,
    process.env.SEIS_PLUGIN_ROOT,
  ].filter(Boolean).map(resolvePath);

  const fallbackCandidates = [
    ...explicitCandidates,
    path.join(sourceRoot, "plugins", "seis"),
    path.join(process.cwd(), "plugins", "seis"),
    path.join(process.env.HOME || "", "Library", "Mobile Documents", "com~apple~CloudDocs", "Github", "SEIS", "SEIS", "plugins", "seis"),
    "/Users/emirhankudun/plugins/seis",
  ].filter(Boolean);

  for (const candidate of fallbackCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(sourceRoot, "plugins", "seis");
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) {
      continue;
    }

    if (token === "--help") {
      result.help = true;
      continue;
    }

    if (token === "--strict" || token === "--no-local") {
      result[token.replace(/^--/, "")] = true;
      continue;
    }

    const value = argv[index + 1];
    if (value && !value.startsWith("--")) {
      result[token.replace(/^--/, "")] = value;
      index += 1;
    } else {
      result[token.replace(/^--/, "")] = true;
    }
  }

  return result;
}
