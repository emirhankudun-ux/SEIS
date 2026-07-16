#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { pluginIntegrationStatus } from "../packages/seis-ai/src/lib/plugin-integration.mjs";
import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const requireInstalled = args.has("--require-installed");
const runMcpSmoke = args.has("--mcp-smoke");
const cacheRoot = process.env.SEIS_CODEX_PLUGIN_CACHE_ROOT || path.join(os.homedir(), ".codex", "plugins", "cache");
const marketplaceName = "seis-repo";
const marketplaceCacheRoot = path.join(cacheRoot, marketplaceName);
const failures = [];

const publicFamily = readJson("content/development/seis-public-plugin-family.json", "public plugin family contract");
const marketplace = readJson(".agents/plugins/marketplace.json", "repo marketplace");
const integration = pluginIntegrationStatus(root);
const installer = runInstallerCheck();
const retiredCompatibilityInstaller = runInstallerCheck(["--with-standalone-lanes"]);

const entries = publicFamily?.marketplace?.entries || [];
const expectedNames = ["seis-ai-agent"];
const expectedApplicationNames = (publicFamily?.applicationPlugins || []).map((plugin) => plugin.name);
const expectedMarketplaceNames = [...expectedNames, ...expectedApplicationNames];
const expectedEmbeddedModuleNames = (publicFamily?.embeddedModules || []).map((module) => module.name);
const expectedInstallIds = expectedNames.map((name) => `${name}@${marketplaceName}`);
const expectedReleaseVersions = Object.fromEntries(expectedNames.map((name) => {
  const manifest = readJson(`plugins/${name}/.codex-plugin/plugin.json`, `${name} source manifest`);
  return [name, manifest?.version || null];
}));

ensure(Array.isArray(entries), "public plugin family entries must be an array");
ensure(entries.length === expectedMarketplaceNames.length, "public plugin family must expose the canonical agent and every public app marketplace entry");
ensure(publicFamily?.marketplace?.canonicalOrchestratorCount === expectedNames.length, "public plugin family must keep one canonical orchestrator");
ensure(publicFamily?.marketplace?.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET, "public plugin family must expose every app marketplace entry");
ensure(publicFamily?.defaultInstall?.installId === "seis-ai-agent@seis-repo", "public plugin family must keep SEIS-Agent as the canonical install");
ensure(publicFamily?.defaultInstall?.mode === "single-public-plugin", "public plugin family must use single-public-plugin mode");
ensure(publicFamily?.defaultInstall?.unifiedSuite === "plugins/seis-ai-agent/assets/unified-suite.json", "public plugin family must point at the unified suite");
ensure(expectedEmbeddedModuleNames.length >= 10, "public plugin family must retain every SEIS source module");
ensure(integration.ok === true, "SEIS AI plugin integration must load");
ensure(integration.installMode === "single-public-plugin", "SEIS AI integration must use single-public-plugin mode");
ensure(integration.standaloneLaneInstallMode === "source-module-only", "SEIS AI integration must keep lane packages as source modules only");
ensure(integration.publicPluginCount === expectedNames.length, "SEIS AI integration must expose one public plugin");
ensure(integration.embeddedModuleCount === expectedEmbeddedModuleNames.length, "SEIS AI integration must expose every embedded source module");
ensure(integration.unifiedSuite?.canonicalInstallId === "seis-ai-agent@seis-repo", "SEIS AI integration must expose the unified suite canonical install");
ensure(integration.unifiedSuite?.componentCount >= expectedEmbeddedModuleNames.length, "SEIS AI unified suite must contain every embedded source module");
ensure(integration.applicationOwnedPluginCount === APP_PLUGIN_EXPANSION_TARGET, "SEIS AI integration must expose every app-owned plugin");
ensure(integration.applicationPluginSourceRoot === "plugins/seis-core", "SEIS AI integration must expose the app-owned source root");
ensure(integration.applicationPluginManifest === "apps/seis-core/data/seis-core-plugin-sources.json", "SEIS AI integration must expose the app-owned source manifest");
ensure(integration.applicationPluginInstallSurface === "repo-source-app", "SEIS AI integration must expose the direct repo app surface");
ensure(integration.applicationPluginSourceAvailableInRepository === true, "SEIS AI integration must mark app-owned sources as repo-available");
ensure(integration.applicationPluginPublicRepositoryAvailable === true, "SEIS AI integration must mark app-owned sources as public-repository available");
ensure(integration.applicationPluginPublicAudience === "everyone", "SEIS AI integration app public audience must be everyone");
ensure(integration.applicationPluginMarketplaceEntryCount === APP_PLUGIN_EXPANSION_TARGET, "app-owned plugins must expose separate seis-repo marketplace entries");

for (const name of expectedNames) {
  const entry = entries.find((candidate) => candidate.name === name);
  ensure(Boolean(entry), `public plugin family missing ${name}`);
  ensure(entry?.installation === "AVAILABLE", `${name} must be AVAILABLE in public family contract`);
  ensure(entry?.authentication === "ON_INSTALL", `${name} must authenticate ON_INSTALL in public family contract`);
  ensureFile(entry?.sourcePath || "", `${name} source path`);

  const marketplaceEntry = marketplace?.plugins?.find((candidate) => candidate.name === name);
  ensure(Boolean(marketplaceEntry), `repo marketplace missing ${name}`);
  ensure(marketplaceEntry?.source?.path === entry?.sourcePath, `repo marketplace path mismatch for ${name}`);
  ensure(marketplaceEntry?.policy?.installation === "AVAILABLE", `repo marketplace ${name} must be AVAILABLE`);
  ensure(marketplaceEntry?.policy?.authentication === "ON_INSTALL", `repo marketplace ${name} must authenticate ON_INSTALL`);
}

for (const name of expectedApplicationNames) {
  const entry = entries.find((candidate) => candidate.name === name);
  const expectedPath = `./plugins/seis-core/${name}`;
  ensure(Boolean(entry), `public app marketplace family missing ${name}`);
  ensure(entry?.installation === "AVAILABLE", `${name} must be AVAILABLE in the public app marketplace`);
  ensure(entry?.authentication === "ON_INSTALL", `${name} must authenticate ON_INSTALL in the public app marketplace`);
  ensure(entry?.sourcePath === expectedPath, `public app marketplace path mismatch for ${name}`);
  const marketplaceEntry = marketplace?.plugins?.find((candidate) => candidate.name === name);
  ensure(Boolean(marketplaceEntry), `repo marketplace missing public app ${name}`);
  ensure(marketplaceEntry?.source?.path === expectedPath, `repo marketplace public app path mismatch for ${name}`);
  ensure(marketplaceEntry?.policy?.installation === "AVAILABLE", `repo marketplace public app ${name} must be AVAILABLE`);
  ensure(marketplaceEntry?.policy?.authentication === "ON_INSTALL", `repo marketplace public app ${name} must authenticate ON_INSTALL`);
}

ensure(marketplace?.plugins?.length === expectedMarketplaceNames.length, "repo marketplace must contain the canonical agent plus all public app packages");

for (const module of publicFamily?.embeddedModules || []) {
  ensure(module?.canonicalInstallId === "seis-ai-agent@seis-repo", `${module?.name || "embedded module"} must resolve to SEIS-Agent`);
  ensure(module?.publicStatus === "public-plugin" || module?.publicStatus === "embedded-source-module", `${module?.name || "embedded module"} must declare its public status`);
  ensureFile(module?.sourcePath || "", `${module?.name || "embedded module"} source path`);
}

ensure(installer.ok, "installer check-only command must succeed");
ensure(installer.payload?.primaryInstallId === "seis-ai-agent@seis-repo", "installer readiness must expose SEIS-Agent as primary install");
ensure(installer.payload?.defaultInstallMode === "single-public-plugin", "installer must default to one public plugin");
ensure(installer.payload?.targets?.length === 1, "default installer plan must contain only SEIS-Agent");
ensure(installer.payload?.targets?.[0] === "seis-ai-agent@seis-repo", "default installer target must be SEIS-Agent");
ensure(!retiredCompatibilityInstaller.ok, "retired standalone lane installer option must be rejected");

const cacheEntries = expectedNames.map((name) => inspectCachePlugin(name, expectedReleaseVersions[name]));
const installedCount = cacheEntries.filter((entry) => entry.installed).length;
const currentInstalledCount = cacheEntries.filter((entry) => entry.installed && entry.currentVersion).length;
const cacheComplete = currentInstalledCount === expectedNames.length;
if (requireInstalled) {
  ensure(cacheComplete, `local Codex plugin cache must contain the current public SEIS-Agent plugin; found ${currentInstalledCount} current of ${expectedNames.length} installed`);
}

const mcpSmoke = runMcpSmoke ? cacheEntries.map((entry) => smokeInstalledMcp(entry)) : [];
const mcpSmokePassed = mcpSmoke.every((entry) => entry.ok);
if (runMcpSmoke) {
  ensure(mcpSmokePassed, "installed SEIS-Agent MCP smoke must pass");
}

const report = {
  ok: failures.length === 0,
  mode: runMcpSmoke ? (requireInstalled ? "require-installed-mcp-smoke" : "repo-contract-mcp-smoke") : (requireInstalled ? "require-installed" : "repo-contract"),
  repoRoot: root,
  marketplaceName,
  cacheRoot,
  status: cacheComplete ? "repo-and-local-cache-ready" : "repo-ready-local-cache-partial-or-missing",
  publicPluginCount: expectedNames.length,
  repoMarketplaceEntryCount: expectedMarketplaceNames.length,
  embeddedModuleCount: expectedEmbeddedModuleNames.length,
  applicationOwnedPluginCount: integration.applicationOwnedPluginCount,
  applicationPluginSourceRoot: integration.applicationPluginSourceRoot,
  applicationPluginManifest: integration.applicationPluginManifest,
  applicationPluginReleaseLabel: integration.applicationPluginReleaseLabel,
  applicationPluginReleaseSemver: integration.applicationPluginReleaseSemver,
  applicationPluginInstallSurface: integration.applicationPluginInstallSurface,
  applicationPluginSourceAvailableInRepository: integration.applicationPluginSourceAvailableInRepository,
  applicationPluginPublicRepositoryAvailable: integration.applicationPluginPublicRepositoryAvailable,
  applicationPluginPublicAudience: integration.applicationPluginPublicAudience,
  applicationPluginMarketplaceEntryCount: integration.applicationPluginMarketplaceEntryCount,
  installedCount,
  currentInstalledCount,
  requireInstalled,
  mcpSmokeRequested: runMcpSmoke,
  mcpSmokePassed,
  runtime: {
    ok: integration.ok,
    installMode: integration.installMode,
    standaloneLaneInstallMode: integration.standaloneLaneInstallMode,
    publicPluginCount: integration.publicPluginCount,
    embeddedModuleCount: integration.embeddedModuleCount,
    primaryInstallId: integration.primaryInstallId,
    unifiedSuite: integration.unifiedSuite,
  },
  installer: {
    ok: installer.ok,
    targetCount: installer.payload?.targets?.length ?? 0,
    targets: installer.payload?.targets || [],
    retiredStandaloneLaneOptionRejected: !retiredCompatibilityInstaller.ok,
    retiredStandaloneLaneOptionError: retiredCompatibilityInstaller.error || null,
  },
  plugins: cacheEntries,
  mcpSmoke,
  failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);

function inspectCachePlugin(name, expectedVersion) {
  const pluginCacheRoot = path.join(marketplaceCacheRoot, name);
  const versions = listDirectories(pluginCacheRoot);
  const latestVersion = versions.at(-1) || null;
  const installedRoot = latestVersion ? path.join(pluginCacheRoot, latestVersion) : null;
  const manifestPath = installedRoot ? path.join(installedRoot, ".codex-plugin", "plugin.json") : null;
  const mcpPath = installedRoot ? path.join(installedRoot, ".mcp.json") : null;
  let manifestName = null;
  if (manifestPath && fs.existsSync(manifestPath)) {
    try {
      manifestName = JSON.parse(fs.readFileSync(manifestPath, "utf8")).name;
    } catch {
      manifestName = null;
    }
  }
  return {
    name,
    installId: `${name}@${marketplaceName}`,
    cachePath: pluginCacheRoot,
    installedRoot,
    installed: Boolean(latestVersion && manifestName === name),
    version: latestVersion,
    expectedVersion,
    currentVersion: Boolean(latestVersion && expectedVersion && latestVersion === expectedVersion && manifestName === name),
    manifestPresent: Boolean(manifestPath && fs.existsSync(manifestPath)),
    mcpPresent: Boolean(mcpPath && fs.existsSync(mcpPath)),
  };
}

function smokeInstalledMcp(entry) {
  if (!entry.installedRoot) {
    return { name: entry.name, ok: false, error: "plugin is not installed" };
  }

  const mcpManifestPath = path.join(entry.installedRoot, ".mcp.json");
  const mcp = readJsonAt(mcpManifestPath);
  const serverName = Object.keys(mcp?.mcpServers || {})[0];
  const server = serverName ? mcp.mcpServers[serverName] : null;
  if (!server?.command || !Array.isArray(server.args)) {
    return { name: entry.name, ok: false, error: "MCP manifest has no runnable server" };
  }

  const toolContract = toolContractFor(entry.name);
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    ...toolContract.calls.map((call, index) => ({
      jsonrpc: "2.0",
      id: index + 3,
      method: "tools/call",
      params: call,
    })),
  ];

  const env = {
    ...process.env,
    SEIS_ROOT: root,
    SEIS_REPO_ROOT: root,
    [envName(entry.name)]: entry.installedRoot,
  };
  const result = spawnSync(server.command, server.args, {
    cwd: entry.installedRoot,
    env,
    input: requests.map(frame).join(""),
    timeout: 8000,
  });

  if (result.error) {
    return { name: entry.name, ok: false, serverName, error: result.error.message };
  }
  if (result.status !== 0) {
    return {
      name: entry.name,
      ok: false,
      serverName,
      exitStatus: result.status,
      stderr: String(result.stderr || "").slice(0, 1000),
    };
  }

  let responses;
  try {
    responses = parseMcpResponses(result.stdout);
  } catch (error) {
    return { name: entry.name, ok: false, serverName, error: error.message };
  }

  const tools = responses.find((response) => response.id === 2)?.result?.tools || [];
  const toolNames = tools.map((tool) => tool.name).sort();
  const missingTools = toolContract.requiredTools.filter((tool) => !toolNames.includes(tool));
  const callErrors = responses
    .filter((response) => response.id >= 3 && response.error)
    .map((response) => ({ id: response.id, error: response.error }));
  const missingResponses = requests
    .filter((request) => request.id !== undefined && !responses.some((response) => response.id === request.id))
    .map((request) => request.id);
  const unifiedSuite = entry.name === "seis-ai-agent"
    ? responses.find((response) => response.id === 3)?.result?.unifiedSuite || null
    : null;
  const unifiedSuiteOk =
    entry.name !== "seis-ai-agent" ||
    (
      unifiedSuite?.status === "active-single-public-plugin" &&
      unifiedSuite?.releaseVersion === "0.3.0+codex.20260712" &&
      unifiedSuite?.canonicalInstallId === "seis-ai-agent@seis-repo" &&
      unifiedSuite?.defaultInstallMode === "single-public-plugin" &&
      unifiedSuite?.componentCount >= 10 &&
      unifiedSuite?.publicPluginCount === 1 &&
      unifiedSuite?.embeddedModuleCount >= 10 &&
      unifiedSuite?.personalMarketplaceMutation === false
    );

  return {
    name: entry.name,
    ok: missingTools.length === 0 && callErrors.length === 0 && missingResponses.length === 0 && unifiedSuiteOk,
    serverName,
    command: [server.command, ...server.args].join(" "),
    toolCount: toolNames.length,
    requiredTools: toolContract.requiredTools,
    missingTools,
    callCount: toolContract.calls.length,
    callErrors,
    missingResponses,
    unifiedSuite,
    unifiedSuiteOk,
  };
}

function toolContractFor(name) {
  if (name === "seis-ai-agent") {
    return {
      requiredTools: ["seis_ai_agent_status", "seis_agent_lanes"],
      calls: [
        { name: "seis_ai_agent_status", arguments: {} },
        { name: "seis_agent_lanes", arguments: {} },
      ],
    };
  }
  if (name === "seis") {
    return {
      requiredTools: ["seis_specialist_lanes"],
      calls: [{ name: "seis_specialist_lanes", arguments: {} }],
    };
  }
  const prefix = name.replace(/^seis-/, "seis_").replaceAll("-", "_");
  return {
    requiredTools: [`${prefix}_status`, `${prefix}_plan`],
    calls: [
      { name: `${prefix}_status`, arguments: {} },
      { name: `${prefix}_plan`, arguments: { request: `Smoke test ${name} public plugin lane.` } },
    ],
  };
}

function frame(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

function parseMcpResponses(stdout) {
  const responses = [];
  let buffer = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
  while (buffer.length > 0) {
    const separator = buffer.indexOf("\r\n\r\n");
    if (separator < 0) break;
    const header = buffer.slice(0, separator).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) {
      throw new Error(`MCP response missing Content-Length header: ${header.slice(0, 120)}`);
    }
    const start = separator + 4;
    const end = start + Number(match[1]);
    if (buffer.length < end) break;
    responses.push(JSON.parse(buffer.slice(start, end).toString("utf8")));
    buffer = buffer.slice(end);
  }
  if (responses.length === 0) {
    throw new Error("MCP server returned no framed responses");
  }
  return responses;
}

function envName(name) {
  return `${name.toUpperCase().replaceAll("-", "_")}_PLUGIN_ROOT`;
}

function listDirectories(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((entry) => {
      try {
        return fs.statSync(path.join(dir, entry)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function runInstallerCheck(extraArgs = []) {
  const result = spawnSync(process.execPath, ["scripts/install-seis-ai-agent.mjs", "--check-only", ...extraArgs], {
    cwd: root,
    encoding: "utf8",
    timeout: 5000,
  });
  if (result.error) {
    return { ok: false, error: result.error.message };
  }
  if (result.status !== 0) {
    return { ok: false, error: String(result.stderr || result.stdout).trim() };
  }
  try {
    return { ok: true, payload: JSON.parse(result.stdout) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  } catch (error) {
    failures.push(`${label} missing or invalid: ${file}: ${error.message}`);
    return null;
  }
}

function readJsonAt(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(file, label) {
  ensure(Boolean(file), `${label} path missing`);
  if (file) ensure(fs.existsSync(path.join(root, file)), `${label} missing: ${file}`);
}
