#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const marketplace = "seis-repo";
const canonicalizationPath = path.join(repoRoot, "content", "development", "seis-plugin-canonicalization.json");
const unifiedSuitePath = path.join(repoRoot, "plugins", "seis-ai-agent", "assets", "unified-suite.json");
const canonicalization = readJsonIfExists(canonicalizationPath);
const unifiedSuite = readJsonIfExists(unifiedSuitePath);
const primaryInstallId = canonicalization?.canonicalOrchestrator || "seis-ai-agent@seis-repo";
const embeddedModules = Array.isArray(unifiedSuite?.components) ? unifiedSuite.components : [];
const embeddedLanes = embeddedModules.map((module) => module.moduleId || module.id).filter((id) => id && id !== "seis-ai-agent");
const applicationDistribution = unifiedSuite?.applicationDistribution || {};
const canonicalFamilyTargets = Array.isArray(canonicalization?.canonicalPluginIds) && canonicalization.canonicalPluginIds.length
  ? canonicalization.canonicalPluginIds
  : [primaryInstallId];
const legacyAliases = Array.isArray(canonicalization?.aliases) ? canonicalization.aliases : [];
const targets = [primaryInstallId];

if (
  canonicalFamilyTargets.length !== 1 ||
  canonicalFamilyTargets[0] !== primaryInstallId ||
  !primaryInstallId.endsWith("@seis-repo")
) {
  fail("SEIS-Agent must be the only canonical public install target");
}

if (args.has("--with-standalone-lanes")) {
  fail("standalone lane installation is retired; install the single SEIS-Agent plugin instead");
}

if (args.has("--help") || args.has("-h")) {
  console.log("Usage: node scripts/install-seis-ai-agent.mjs [--apply] [--check-only]");
  process.exit(0);
}

const readiness = {
  repoRoot,
  platform: process.platform,
  nodeVersion: process.version,
  marketplaceExists: fs.existsSync(path.join(repoRoot, ".agents", "plugins", "marketplace.json")),
  codexAvailable: commandExists("codex"),
  primaryInstallId,
  defaultInstallMode: "single-public-plugin",
  unifiedSuite: {
    path: "plugins/seis-ai-agent/assets/unified-suite.json",
    status: unifiedSuite?.status || "missing",
    releaseVersion: unifiedSuite?.releaseVersion || null,
    componentCount: unifiedSuite?.componentCount || 0,
    publicPluginCount: unifiedSuite?.publicDistribution?.publicPluginCount || 0,
  },
  applicationSource: {
    application: applicationDistribution.applicationId || "seis-core",
    applicationPath: applicationDistribution.applicationPath || "apps/seis-core",
    ownership: applicationDistribution.ownership || null,
    sourceRoot: applicationDistribution.sourceRoot || null,
    sourceManifest: applicationDistribution.sourceManifest || null,
    releaseTrain: applicationDistribution.releaseTrain || null,
    releaseLabel: applicationDistribution.releaseLabel || null,
    releaseSemver: applicationDistribution.releaseSemver || null,
    pluginCount: applicationDistribution.pluginCount || 0,
    sourceAvailableInRepository: applicationDistribution.sourceAvailableInRepository === true,
    installSurface: applicationDistribution.installSurface || null,
    marketplaceEntryCount: applicationDistribution.marketplaceEntryCount ?? null,
    publicReleaseAllowed: applicationDistribution.publicReleaseAllowed === true,
  },
  embeddedLanes,
  canonicalization: {
    contractPath: "content/development/seis-plugin-canonicalization.json",
    status: canonicalization?.status || "contract-missing-fallback-targets",
    effectivePluginCount: canonicalization?.effectivePluginCount || targets.length,
    legacyAliasCount: legacyAliases.length,
    aliases: legacyAliases.map((alias) => ({ legacyInstallId: alias.legacyInstallId, canonicalInstallId: alias.canonicalInstallId })),
    personalMarketplaceMutation: false,
    globalMarketplaceMutation: {
      performed: canonicalization?.globalMarketplaceMutation?.performed === true,
      allowedWithoutHumanApproval: canonicalization?.globalMarketplaceMutation?.allowedWithoutHumanApproval === true,
    },
  },
  consolidationPolicy: "SEIS-Agent is the only public install target; duplicate @personal SEIS plugins are preserved as legacy aliases, public source modules run through the embedded suite, and app-owned plugins remain directly available from plugins/seis-core for apps/seis-core",
  embeddedModuleCount: embeddedModules.length,
  embeddedModuleIds: embeddedModules.map((module) => module.moduleId || module.id).filter(Boolean),
  targets,
};

if (args.has("--check-only")) {
  console.log(JSON.stringify(readiness, null, 2));
  process.exit(readiness.marketplaceExists ? 0 : 1);
}

if (!readiness.marketplaceExists) fail("repo marketplace is missing");
if (!args.has("--apply")) {
  console.log(JSON.stringify({
    mode: "plan-only",
    applyCommand: "npm run install:seis-ai-agent -- --apply",
    readiness,
    commands: [
      ["codex", "plugin", "marketplace", "add", repoRoot],
      ...targets.map((target) => ["codex", "plugin", "add", target])
    ]
  }, null, 2));
  process.exit(0);
}

if (!readiness.codexAvailable) fail("codex CLI is not available in PATH");
run("codex", ["plugin", "marketplace", "add", repoRoot]);
for (const target of targets) run("codex", ["plugin", "add", target]);
console.log("SEIS-AI Agent terminal install completed.");
console.log(`Installed targets: ${targets.join(", ")}`);
console.log("Start a new Codex thread to pick up refreshed skills and MCP tools.");
function commandExists(command) { return spawnSync(command, ["--version"], { stdio: "ignore", shell: process.platform === "win32" }).status === 0; }
function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); } catch { return null; }
}
function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { cwd: repoRoot, stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) fail(`${command} failed to start: ${result.error.message}`);
  if (result.status !== 0) fail(`${command} ${commandArgs.join(" ")} exited with ${result.status}`);
}
function fail(message) { console.error(`SEIS-AI Agent install failed: ${message}`); process.exit(1); }
