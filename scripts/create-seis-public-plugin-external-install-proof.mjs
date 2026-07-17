#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH,
  inspectIndependentRunnerEvidence,
} from "./check-seis-public-plugin-independent-runner-evidence.mjs";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "content/development/seis-public-plugin-external-install-proof.json";
const reportPath = "reports/seis-public-plugin-external-install-proof.md";
const familyPath = "content/development/seis-public-plugin-family.json";
const marketplacePath = ".agents/plugins/marketplace.json";
const independentRunnerEvidenceContractPath = INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH;
const independentRunnerEvidenceContractReportPath = "reports/seis-public-plugin-independent-runner-evidence-contract.md";
const unifiedSuitePath = "plugins/seis-ai-agent/assets/unified-suite.json";

const family = readJson(familyPath);
const marketplace = readJson(marketplacePath);
const artifactStaging = stagePublicPluginArtifacts(family, marketplace);
const independentRunnerEvidence = inspectIndependentRunnerEvidence(root);
const unifiedSuite = readJson(unifiedSuitePath);

const proof = {
  id: "seis-public-plugin-external-install-proof",
  version: 1,
  generatedAt,
  status: proofStatus(artifactStaging, independentRunnerEvidence),
  decision: "not-ready-for-public-preview",
  sourcePath,
  reportPath,
  publicPluginFamily: familyPath,
  marketplace: marketplacePath,
  independentRunnerEvidenceContract: independentRunnerEvidenceContractPath,
  independentRunnerEvidenceContractReport: independentRunnerEvidenceContractReportPath,
  unifiedSuite: {
    path: unifiedSuitePath,
    status: unifiedSuite?.status || "missing",
    releaseVersion: unifiedSuite?.releaseVersion || null,
    canonicalInstallId: unifiedSuite?.canonicalInstall?.installId || null,
    defaultInstallMode: unifiedSuite?.canonicalInstall?.defaultInstallMode || null,
    componentCount: unifiedSuite?.componentCount || 0,
    publicPluginCount: unifiedSuite?.publicDistribution?.publicPluginCount || 0,
    embeddedModuleCount: unifiedSuite?.publicDistribution?.embeddedModuleCount || 0,
  },
  publicReleaseAllowed: false,
  purpose:
    "Stage the canonical SEIS-Agent artifact, every public SEIS Core repository package, and every objective-derived SEIS topic package in a disposable clean directory, verify their marketplace and source contracts, and retain independent runner/public installation proof as an explicit release gate.",
  repoLocalArtifactStaging: artifactStaging,
  externalCleanRunnerEvidence: {
    status: externalEvidenceStatus(independentRunnerEvidence),
    evidencePath: independentRunnerEvidence.evidencePath,
    evidenceRecorded: independentRunnerEvidence.evidenceRecorded === true,
    evidenceValid: independentRunnerEvidence.evidenceValid === true,
    validationFailures: independentRunnerEvidence.failures || [],
    repoLocalStagingIsNotIndependentProof: true,
    requiredEvidence: [
      "A clean runner or machine that cannot read the original working tree or existing Codex plugin cache.",
      "The public SEIS marketplace source or published package revision used for the install, including its immutable revision identifier.",
      "Installation evidence for seis-ai-agent@seis-repo plus the public app-package and objective-derived topic entries selected from the seis-repo marketplace, including the embedded module inventory.",
      "MCP initialization, tools/list, and representative tool-call evidence from the independent runner.",
      "A newly opened Codex task after the independent installation, with the SEIS AI public-plugin-family bridge visible.",
      "Sanitized runner metadata: operating system, Node major version, Codex version, and command exit summaries only.",
    ],
    prohibitedEvidence: [
      "API keys, tokens, cookies, credentials, private keys, .env contents, or private repository data.",
      "Claims that repo-local staging, a local cache, or a static manifest alone proves an external installation.",
    ],
  },
  releaseBoundary: {
    externalNetworkAccessUsed: false,
    publicMarketplacePublicationUsed: false,
    liveProviderAccessUsed: false,
    liveSshUsed: false,
    publicReleaseAllowed: false,
  },
  remainingReleaseBlockers: buildBlockers(artifactStaging, independentRunnerEvidence),
  qualityGates: [
    "npm run check:seis-public-plugin-external-install-proof",
    "npm run check:seis-public-plugin-independent-runner-evidence-contract",
    "npm run check:seis-public-plugin-independent-runner-evidence",
    "npm run check:seis-public-plugin-independent-runner-evidence:recorded",
    "npm run check:seis-unified-plugin-suite",
    "npm run check:seis-public-plugin-security-provenance-review",
    "npm run check:seis-public-plugin-install-smoke:local:mcp",
    "npm run check:seis-agent-plugin-integration",
  ],
  completionRule:
    "This record is complete for internal review when the disposable clean artifact stage validates every public plugin and the independent-runner evidence intake is available while publicReleaseAllowed remains false. Public preview remains blocked until strict independent clean-runner/public installation evidence and human approval are recorded.",
};

const report = renderReport(proof);

if (checkMode) {
  assertSame(sourcePath, `${JSON.stringify(proof, null, 2)}\n`);
  assertSame(reportPath, report);
  validateProof(proof);
  console.log("SEIS public plugin external-install proof check passed.");
} else {
  writeFile(sourcePath, `${JSON.stringify(proof, null, 2)}\n`);
  writeFile(reportPath, report);
  validateProof(proof);
  console.log(`Wrote ${sourcePath}`);
  console.log(`Wrote ${reportPath}`);
}

function stagePublicPluginArtifacts(publicFamily, repoMarketplace) {
  const canonicalPlugins = (Array.isArray(publicFamily.publicPlugins) ? publicFamily.publicPlugins : [])
    .map((plugin) => ({ ...plugin, sourceKind: "public-plugin" }));
  const applicationPlugins = (Array.isArray(publicFamily.applicationPlugins) ? publicFamily.applicationPlugins : [])
    .map((plugin) => ({ ...plugin, sourceKind: "public-application-package" }));
  const topicPlugins = (Array.isArray(publicFamily.topicPlugins) ? publicFamily.topicPlugins : [])
    .map((plugin) => ({ ...plugin, sourceKind: "public-topic-package" }));
  const plugins = [...canonicalPlugins, ...applicationPlugins, ...topicPlugins];
  const embeddedModules = Array.isArray(publicFamily.embeddedModules) ? publicFamily.embeddedModules : (publicFamily.plugins || []);
  const expectedNames = plugins.map((plugin) => plugin.name);
  const failures = [];
  const excludedSourceArtifacts = [];
  const disallowedSourceArtifacts = [];
  const pluginResults = [];
  const embeddedModuleFindings = validateEmbeddedSourceModules(embeddedModules);
  failures.push(...embeddedModuleFindings);
  let stagingRoot = null;
  let result;

  try {
    stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-public-plugin-artifacts-"));
    const stagingMarketplacePath = path.join(stagingRoot, ".agents", "plugins", "marketplace.json");
    fs.mkdirSync(path.dirname(stagingMarketplacePath), { recursive: true });
    fs.copyFileSync(path.join(root, marketplacePath), stagingMarketplacePath);

    const stagedMarketplace = readJsonAt(stagingMarketplacePath);
    const stagedMarketplacePlugins = Array.isArray(stagedMarketplace?.plugins) ? stagedMarketplace.plugins : [];
    if (stagedMarketplacePlugins.length !== expectedNames.length) {
      failures.push(`staged marketplace must contain ${expectedNames.length} public plugins`);
    }

    for (const plugin of plugins) {
      const pluginFailures = [];
      const normalizedSourcePath = normalizeSourcePath(plugin.sourcePath);
      const marketplaceEntry = repoMarketplace.plugins?.find((entry) => entry.name === plugin.name);
      const sourceRoot = normalizedSourcePath ? path.join(root, normalizedSourcePath) : null;
      const stagedRoot = normalizedSourcePath ? path.join(stagingRoot, normalizedSourcePath) : null;

      if (!normalizedSourcePath) pluginFailures.push("plugin source path must be a safe relative path");
      if (!marketplaceEntry) pluginFailures.push("plugin is missing from the repo marketplace");
      if (marketplaceEntry?.source?.path !== plugin.sourcePath) pluginFailures.push("plugin marketplace source path does not match the public family");
      if (marketplaceEntry?.policy?.installation !== "AVAILABLE") pluginFailures.push("plugin marketplace installation policy must be AVAILABLE");
      if (marketplaceEntry?.policy?.authentication !== "ON_INSTALL") pluginFailures.push("plugin marketplace authentication policy must be ON_INSTALL");
      if (!sourceRoot || !fs.existsSync(sourceRoot)) {
        pluginFailures.push("plugin source directory is missing");
      } else if (stagedRoot) {
        const copyResult = copyPluginTree(sourceRoot, stagedRoot);
        excludedSourceArtifacts.push(...copyResult.excluded);
        disallowedSourceArtifacts.push(...copyResult.disallowed);
        pluginFailures.push(...copyResult.failures);
        pluginFailures.push(...validateStagedPlugin(plugin, stagedRoot, { requireReadme: plugin.sourceKind !== "public-application-package" }));
        if (plugin.sourceKind === "public-application-package") {
          pluginFailures.push(...validateStagedApplicationPackage(plugin, stagedRoot));
        } else if (plugin.sourceKind === "public-topic-package") {
          pluginFailures.push(...validateStagedTopicPackage(plugin, stagedRoot));
        } else {
          pluginFailures.push(...validateStagedEmbeddedSuite(plugin, stagedRoot, embeddedModules));
        }
        pluginResults.push({
          name: plugin.name,
          sourcePath: plugin.sourcePath,
          sourceFileCount: copyResult.sourceFileCount,
          stagedFileCount: copyResult.stagedFileCount,
          excludedArtifactCount: copyResult.excluded.length,
          disallowedArtifactCount: copyResult.disallowed.length,
          mcpEntryScriptCount: countMcpEntryScripts(stagedRoot),
          stageReady: pluginFailures.length === 0,
          findings: pluginFailures,
        });
      }

      if (!pluginResults.some((entry) => entry.name === plugin.name)) {
        pluginResults.push({
          name: plugin.name,
          sourcePath: plugin.sourcePath,
          sourceFileCount: 0,
          stagedFileCount: 0,
          excludedArtifactCount: 0,
          disallowedArtifactCount: 0,
          mcpEntryScriptCount: 0,
          stageReady: false,
          findings: pluginFailures,
        });
      }
      failures.push(...pluginFailures.map((finding) => `${plugin.name}: ${finding}`));
    }

    const stagedFiles = listFiles(stagingRoot);
    const stagedForbiddenArtifacts = stagedFiles
      .map((file) => toPosix(path.relative(stagingRoot, file)))
      .filter((relativePath) => forbiddenArtifactId(relativePath));
    if (stagedForbiddenArtifacts.length) {
      failures.push("staged artifact contains forbidden files");
    }

    result = {
      ok: failures.length === 0,
      mode: "temporary-local-clean-artifact-staging",
      externalNetworkAccessUsed: false,
      existingCodexCacheUsed: false,
      publicMarketplacePublished: false,
      canonicalOrchestratorCount: canonicalPlugins.length,
      applicationPluginCount: applicationPlugins.length,
      topicPluginCount: topicPlugins.length,
      marketplaceEntryCount: expectedNames.length,
      expectedPluginCount: expectedNames.length,
      embeddedModuleCount: embeddedModules.length,
      embeddedModuleFindings,
      stagedPluginCount: pluginResults.filter((plugin) => plugin.stageReady).length,
      stagedManifestCount: pluginResults.filter((plugin) => manifestExists(stagingRoot, plugin.sourcePath)).length,
      stagedMcpEntryScriptCount: pluginResults.reduce((sum, plugin) => sum + plugin.mcpEntryScriptCount, 0),
      stagedFileCount: stagedFiles.length,
      excludedSourceArtifactCount: excludedSourceArtifacts.length,
      excludedSourceArtifacts: excludedSourceArtifacts.sort((a, b) => a.path.localeCompare(b.path)),
      disallowedSourceArtifactCount: disallowedSourceArtifacts.length,
      disallowedSourceArtifacts: disallowedSourceArtifacts.sort((a, b) => a.path.localeCompare(b.path)),
      stagedForbiddenArtifactCount: stagedForbiddenArtifacts.length,
      stagedForbiddenArtifacts: stagedForbiddenArtifacts.sort(),
      stageDeletedAfterValidation: false,
      plugins: pluginResults,
      failures,
    };
  } catch (error) {
    result = {
      ok: false,
      mode: "temporary-local-clean-artifact-staging",
      externalNetworkAccessUsed: false,
      existingCodexCacheUsed: false,
      publicMarketplacePublished: false,
      canonicalOrchestratorCount: canonicalPlugins.length,
      applicationPluginCount: applicationPlugins.length,
      topicPluginCount: topicPlugins.length,
      marketplaceEntryCount: expectedNames.length,
      expectedPluginCount: expectedNames.length,
      embeddedModuleCount: embeddedModules.length,
      embeddedModuleFindings,
      stagedPluginCount: 0,
      stagedManifestCount: 0,
      stagedMcpEntryScriptCount: 0,
      stagedFileCount: 0,
      excludedSourceArtifactCount: excludedSourceArtifacts.length,
      excludedSourceArtifacts,
      disallowedSourceArtifactCount: disallowedSourceArtifacts.length,
      disallowedSourceArtifacts,
      stagedForbiddenArtifactCount: 0,
      stagedForbiddenArtifacts: [],
      stageDeletedAfterValidation: false,
      plugins: pluginResults,
      failures: [...failures, `artifact staging failed: ${sanitizeError(error)}`],
    };
  } finally {
    if (stagingRoot) {
      fs.rmSync(stagingRoot, { recursive: true, force: true });
    }
  }

  result.stageDeletedAfterValidation = Boolean(stagingRoot) && !fs.existsSync(stagingRoot);
  if (!result.stageDeletedAfterValidation) {
    result.ok = false;
    result.failures.push("temporary artifact staging directory was not removed");
  }
  return result;
}

function copyPluginTree(sourceRoot, stagedRoot) {
  const result = {
    sourceFileCount: 0,
    stagedFileCount: 0,
    excluded: [],
    disallowed: [],
    failures: [],
  };

  const copyDirectory = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from).sort()) {
      const sourcePath = path.join(from, entry);
      const stagedPath = path.join(to, entry);
      const relativePath = toPosix(path.relative(root, sourcePath));
      const stat = fs.lstatSync(sourcePath);

      if (entry === ".DS_Store") {
        result.excluded.push({ path: relativePath, reason: "macos-metadata" });
        continue;
      }
      const disallowedId = forbiddenArtifactId(relativePath);
      if (disallowedId) {
        result.disallowed.push({ path: relativePath, reason: disallowedId });
        continue;
      }
      if (stat.isSymbolicLink()) {
        result.disallowed.push({ path: relativePath, reason: "symbolic-link" });
        continue;
      }
      if (stat.isDirectory()) {
        copyDirectory(sourcePath, stagedPath);
        continue;
      }
      if (!stat.isFile()) {
        result.disallowed.push({ path: relativePath, reason: "unsupported-artifact-type" });
        continue;
      }
      result.sourceFileCount += 1;
      fs.copyFileSync(sourcePath, stagedPath);
      result.stagedFileCount += 1;
    }
  };

  copyDirectory(sourceRoot, stagedRoot);
  if (result.disallowed.length) result.failures.push("source contains disallowed release artifacts");
  return result;
}

function validateStagedPlugin(plugin, stagedRoot, { requireReadme = true } = {}) {
  const failures = [];
  const manifestPath = path.join(stagedRoot, ".codex-plugin", "plugin.json");
  const mcpPath = path.join(stagedRoot, ".mcp.json");
  const readmePath = path.join(stagedRoot, "README.md");
  if (!fs.existsSync(manifestPath)) failures.push("staged plugin manifest is missing");
  if (!fs.existsSync(mcpPath)) failures.push("staged MCP manifest is missing");
  if (requireReadme && !fs.existsSync(readmePath)) failures.push("staged README is missing");

  const manifest = readJsonAt(manifestPath);
  if (manifest?.name !== plugin.name) failures.push("staged manifest name does not match plugin name");
  if (manifest?.license !== "MIT") failures.push("staged manifest license must be MIT");
  if (!manifest?.version) failures.push("staged manifest version is missing");

  const mcp = readJsonAt(mcpPath);
  const servers = Object.entries(mcp?.mcpServers || {});
  if (!servers.length) failures.push("staged MCP manifest has no server");
  for (const [serverName, server] of servers) {
    if (server.command !== "node") failures.push(`staged MCP server ${serverName} must use node`);
    if (!Array.isArray(server.args) || !server.args.length) {
      failures.push(`staged MCP server ${serverName} has no script arguments`);
      continue;
    }
    for (const arg of server.args) {
      const resolved = typeof arg === "string" ? path.resolve(stagedRoot, arg) : null;
      if (!resolved || path.isAbsolute(arg) || arg.includes("..") || !isInside(stagedRoot, resolved)) {
        failures.push(`staged MCP server ${serverName} has an unsafe script argument`);
      } else if (!fs.existsSync(resolved)) {
        failures.push(`staged MCP server ${serverName} script is missing from the artifact`);
      }
    }
  }
  return failures;
}

function validateStagedApplicationPackage(plugin, stagedRoot) {
  const failures = [];
  const profilePath = path.join(stagedRoot, "assets", "plugin-profile.json");
  const skillPath = path.join(stagedRoot, "skills", plugin.name, "SKILL.md");
  if (!fs.existsSync(profilePath)) failures.push("staged app package profile is missing");
  if (!fs.existsSync(skillPath)) failures.push("staged app package skill is missing");
  const profile = readJsonAt(profilePath);
  if (profile?.stableId !== plugin.name) failures.push("staged app package profile id does not match plugin name");
  if (profile?.license !== "MIT") failures.push("staged app package profile license must be MIT");
  if (profile?.publicRepositoryAvailable !== true) failures.push("staged app package must be public-repository available");
  if (profile?.publicAudience !== "everyone") failures.push("staged app package audience must be everyone");
  if (profile?.publicMarketplace !== true) failures.push("staged app package must be available in the public marketplace");
  for (const permission of ["write", "network", "secrets"]) {
    if (!Array.isArray(profile?.permissions?.[permission]) || profile.permissions[permission].length !== 0) {
      failures.push(`staged app package ${permission} permissions must be empty`);
    }
  }
  return failures;
}

function validateStagedTopicPackage(plugin, stagedRoot) {
  const failures = [];
  const profilePath = path.join(stagedRoot, "assets", "topic-profile.json");
  const skillPath = path.join(stagedRoot, "skills", plugin.name, "SKILL.md");
  const runtimePath = path.join(stagedRoot, "runtime", "topic-plugin-runtime.mjs");
  if (!fs.existsSync(profilePath)) failures.push("staged topic package profile is missing");
  if (!fs.existsSync(skillPath)) failures.push("staged topic package skill is missing");
  if (!fs.existsSync(runtimePath)) failures.push("staged topic package runtime is missing");
  const profile = readJsonAt(profilePath);
  if (profile?.id !== plugin.name) failures.push("staged topic package profile id does not match plugin name");
  if (profile?.license !== "MIT") failures.push("staged topic package profile license must be MIT");
  if (profile?.publicAudience !== "everyone") failures.push("staged topic package audience must be everyone");
  if (profile?.publicMarketplace !== true) failures.push("staged topic package must be available in the public marketplace");
  if (profile?.marketplace !== "seis-repo") failures.push("staged topic package marketplace must be seis-repo");
  if (profile?.sourcePath !== plugin.sourcePath) failures.push("staged topic package source path must match the public family");
  for (const permission of ["write", "network", "secrets"]) {
    if (!Array.isArray(profile?.permissions?.[permission]) || profile.permissions[permission].length !== 0) {
      failures.push(`staged topic package ${permission} permissions must be empty`);
    }
  }
  return failures;
}

function validateStagedEmbeddedSuite(plugin, stagedRoot, modules) {
  if (plugin.name !== "seis-ai-agent") return [];

  const failures = [];
  const suitePath = path.join(stagedRoot, "assets", "unified-suite.json");
  const suite = readJsonAt(suitePath);
  const expectedModuleNames = modules.map((module) => module.name).sort();
  const suiteModuleNames = (suite?.components || []).map((component) => component.moduleId).sort();

  if (suite?.canonicalInstall?.installId !== "seis-ai-agent@seis-repo") {
    failures.push("staged unified suite must retain the SEIS-Agent canonical install");
  }
  if (suite?.publicDistribution?.publicPluginCount !== 1) {
    failures.push("staged unified suite must expose one public plugin");
  }
  if (suite?.publicDistribution?.embeddedModuleCount !== expectedModuleNames.length) {
    failures.push("staged unified suite embedded module count is invalid");
  }
  if (JSON.stringify(suiteModuleNames) !== JSON.stringify(expectedModuleNames)) {
    failures.push("staged unified suite does not contain the complete embedded module inventory");
  }

  for (const module of modules) {
    const skillName = module.name === "seis" ? "seis-hub" : module.name;
    const skillPath = path.join(stagedRoot, "skills", skillName, "SKILL.md");
    if (!fs.existsSync(skillPath)) {
      failures.push(`staged unified suite is missing embedded skill for ${module.name}`);
    }

    if (module.name === "seis-ai-agent") continue;
    const profileName = module.name === "seis" ? "seis-governance" : module.name;
    const profilePath = path.join(stagedRoot, "assets", "lanes", `${profileName}.json`);
    if (!fs.existsSync(profilePath)) {
      failures.push(`staged unified suite is missing embedded lane profile for ${module.name}`);
    }
  }

  return failures;
}

function validateEmbeddedSourceModules(modules) {
  const findings = [];
  if (modules.length < 10) findings.push("embedded source module contract must contain every current SEIS module");
  for (const module of modules) {
    const sourcePath = normalizeSourcePath(module.sourcePath);
    if (!sourcePath || !fs.existsSync(path.join(root, sourcePath))) {
      findings.push(`${module.name || "embedded module"}: source module directory is missing`);
    }
    if (module.canonicalInstallId !== "seis-ai-agent@seis-repo") {
      findings.push(`${module.name || "embedded module"}: canonical install must be seis-ai-agent@seis-repo`);
    }
  }
  return findings;
}

function countMcpEntryScripts(stagedRoot) {
  const mcp = readJsonAt(path.join(stagedRoot, ".mcp.json"));
  return Object.values(mcp?.mcpServers || {}).reduce((sum, server) => sum + (Array.isArray(server.args) ? server.args.length : 0), 0);
}

function manifestExists(stagingRoot, sourcePath) {
  const normalized = normalizeSourcePath(sourcePath);
  return Boolean(normalized && fs.existsSync(path.join(stagingRoot, normalized, ".codex-plugin", "plugin.json")));
}

function normalizeSourcePath(sourcePath) {
  if (typeof sourcePath !== "string" || !sourcePath.trim() || path.isAbsolute(sourcePath)) return null;
  const normalized = sourcePath.replace(/^\.\//, "").replaceAll("\\", "/");
  if (normalized.split("/").some((part) => !part || part === "." || part === "..")) return null;
  return normalized;
}

function forbiddenArtifactId(relativePath) {
  const normalized = toPosix(relativePath);
  const parts = normalized.split("/");
  const base = parts.at(-1) || "";
  if (base === ".DS_Store") return "macos-metadata";
  if (parts.some((part) => ["node_modules", "dist", "build", ".cache", ".next", ".turbo", ".venv", "__pycache__", ".secrets", "secrets"].includes(part))) {
    return "generated-or-secret-directory";
  }
  if (base === ".env" || (base.startsWith(".env.") && !base.endsWith(".example"))) return "environment-file";
  if (base === "credentials.local.json" || /^service-account.*\.json$/i.test(base)) return "credential-file";
  if (/\.(pem|key|p12|pfx|zip|rar|7z|tar|gz)$/i.test(base)) return "private-or-archive-artifact";
  return null;
}

function proofStatus(artifactStaging, independentRunnerEvidence) {
  if (!artifactStaging.ok) return "blocked-by-artifact-hygiene";
  if (independentRunnerEvidence.evidenceRecorded && !independentRunnerEvidence.evidenceValid) {
    return "blocked-by-independent-runner-evidence";
  }
  if (independentRunnerEvidence.evidenceValid) {
    return "repo-local-artifact-and-independent-runner-evidence-recorded-human-approval-pending";
  }
  return "repo-local-clean-artifact-staged-external-proof-pending";
}

function externalEvidenceStatus(independentRunnerEvidence) {
  if (independentRunnerEvidence.evidenceValid) return "recorded-independent-clean-runner-evidence";
  if (independentRunnerEvidence.evidenceRecorded) return "invalid-independent-runner-evidence";
  return "pending-independent-clean-runner-or-public-install";
}

function buildBlockers(artifactStaging, independentRunnerEvidence) {
  const blockers = [];
  if (!artifactStaging.ok) blockers.push("Repo-local clean artifact staging did not pass; inspect the recorded artifact findings before any release discussion.");
  if (independentRunnerEvidence.evidenceRecorded && !independentRunnerEvidence.evidenceValid) {
    blockers.push("Independent clean-runner evidence was supplied but does not meet the sanitized evidence contract.");
  } else if (!independentRunnerEvidence.evidenceValid) {
    blockers.push("Independent clean-runner or public package installation proof has not been recorded.");
  }
  blockers.push("Human approval for public preview, release, publish, push, merge, tag, deploy, live SSH, or provider credentials has not been recorded.");
  return blockers;
}

function validateProof(record) {
  const failures = [];
  if (record.id !== "seis-public-plugin-external-install-proof") failures.push("external install proof id is invalid");
  if (record.publicReleaseAllowed !== false) failures.push("public release must remain blocked");
  if (record.unifiedSuite.status !== "active-single-public-plugin") failures.push("unified suite must be active");
  if (record.unifiedSuite.canonicalInstallId !== "seis-ai-agent@seis-repo" || record.unifiedSuite.defaultInstallMode !== "single-public-plugin") failures.push("unified suite must keep SEIS-Agent as the single public install");
  if (record.unifiedSuite.componentCount < 10) failures.push("unified suite must include all current SEIS components");
  if (record.unifiedSuite.publicPluginCount !== 1 || record.unifiedSuite.embeddedModuleCount < 10) failures.push("unified suite must expose one public plugin and every embedded source module");
  if (record.repoLocalArtifactStaging.marketplaceEntryCount !== marketplace.plugins.length) failures.push("artifact staging marketplace count must match the repo marketplace");
  if (record.repoLocalArtifactStaging.canonicalOrchestratorCount !== 1) failures.push("artifact staging must include one canonical SEIS-Agent orchestrator");
  if (record.repoLocalArtifactStaging.applicationPluginCount !== family.applicationPlugins.length) failures.push("artifact staging must cover every public app package");
  if (record.repoLocalArtifactStaging.topicPluginCount !== family.topicPlugins.length) failures.push("artifact staging must cover every objective-derived topic package");
  if (record.repoLocalArtifactStaging.expectedPluginCount !== marketplace.plugins.length) failures.push("artifact staging must cover every public marketplace package");
  if (record.repoLocalArtifactStaging.embeddedModuleCount < 10) failures.push("artifact staging must validate every embedded source module");
  if (record.repoLocalArtifactStaging.embeddedModuleFindings.length) failures.push("embedded source module validation must pass");
  if (!record.repoLocalArtifactStaging.stageDeletedAfterValidation) failures.push("temporary stage must be deleted after validation");
  if (record.repoLocalArtifactStaging.stagedForbiddenArtifactCount !== 0) failures.push("staged artifact must not contain forbidden files");
  if (record.repoLocalArtifactStaging.disallowedSourceArtifactCount !== 0) failures.push("source artifacts must not contain disallowed release files");
  if (!record.repoLocalArtifactStaging.ok) failures.push("artifact staging must pass for every public marketplace package");
  if (record.repoLocalArtifactStaging.ok && record.repoLocalArtifactStaging.stagedPluginCount !== record.repoLocalArtifactStaging.expectedPluginCount) failures.push("successful artifact staging must include every current plugin");
  if (record.repoLocalArtifactStaging.ok && record.repoLocalArtifactStaging.stagedManifestCount !== record.repoLocalArtifactStaging.expectedPluginCount) failures.push("successful artifact staging must include every current manifest");
  if (record.repoLocalArtifactStaging.ok && record.repoLocalArtifactStaging.stagedMcpEntryScriptCount < 1) failures.push("successful artifact staging must include the public MCP entry script");
  if (![
    "pending-independent-clean-runner-or-public-install",
    "invalid-independent-runner-evidence",
    "recorded-independent-clean-runner-evidence",
  ].includes(record.externalCleanRunnerEvidence.status)) failures.push("independent runner evidence status is invalid");
  if (record.externalCleanRunnerEvidence.repoLocalStagingIsNotIndependentProof !== true) failures.push("repo-local staging must not be presented as independent proof");
  if (record.externalCleanRunnerEvidence.evidenceValid && record.externalCleanRunnerEvidence.status !== "recorded-independent-clean-runner-evidence") failures.push("valid independent runner evidence must be recorded");
  if (!record.externalCleanRunnerEvidence.evidenceRecorded && record.externalCleanRunnerEvidence.status !== "pending-independent-clean-runner-or-public-install") failures.push("missing independent runner evidence must remain pending");
  if (!record.qualityGates.includes("npm run check:seis-public-plugin-external-install-proof")) failures.push("quality gates must include this check");
  if (!record.qualityGates.includes("npm run check:seis-unified-plugin-suite")) failures.push("quality gates must include the unified suite check");
  if (!record.remainingReleaseBlockers.some((blocker) => blocker.includes("Independent clean-runner"))) failures.push("independent runner blocker must remain visible");
  if (failures.length) {
    console.error("SEIS public plugin external-install proof validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function renderReport(record) {
  const pluginRows = record.repoLocalArtifactStaging.plugins
    .map((plugin) => `| ${plugin.name} | ${plugin.sourceFileCount} | ${plugin.stagedFileCount} | ${plugin.excludedArtifactCount} | ${plugin.mcpEntryScriptCount} | ${plugin.stageReady ? "pass" : "fail"} |`)
    .join("\n");
  const excludedRows = record.repoLocalArtifactStaging.excludedSourceArtifacts.length
    ? record.repoLocalArtifactStaging.excludedSourceArtifacts.map((item) => `| ${item.path} | ${item.reason} |`).join("\n")
    : "| none | none |";
  const disallowedRows = record.repoLocalArtifactStaging.disallowedSourceArtifacts.length
    ? record.repoLocalArtifactStaging.disallowedSourceArtifacts.map((item) => `| ${item.path} | ${item.reason} |`).join("\n")
    : "| none | none |";
  return `# SEIS Public Plugin External Install Proof

- Generated: ${record.generatedAt}
- Status: ${record.status}
- Decision: ${record.decision}
- Public release allowed: ${record.publicReleaseAllowed ? "yes" : "no"}

## Repo-Local Clean Artifact Staging

- Mode: ${record.repoLocalArtifactStaging.mode}
  - Expected public marketplace packages: ${record.repoLocalArtifactStaging.expectedPluginCount}
  - Canonical orchestrators: ${record.repoLocalArtifactStaging.canonicalOrchestratorCount}
  - Application packages: ${record.repoLocalArtifactStaging.applicationPluginCount}
  - Objective-derived topic packages: ${record.repoLocalArtifactStaging.topicPluginCount}
- Staged public plugins: ${record.repoLocalArtifactStaging.stagedPluginCount}
- Embedded source modules: ${record.repoLocalArtifactStaging.embeddedModuleCount}
- Staged manifests: ${record.repoLocalArtifactStaging.stagedManifestCount}
- Staged MCP entry scripts: ${record.repoLocalArtifactStaging.stagedMcpEntryScriptCount}
- Staged files: ${record.repoLocalArtifactStaging.stagedFileCount}
- Excluded source metadata files: ${record.repoLocalArtifactStaging.excludedSourceArtifactCount}
- Disallowed source artifacts: ${record.repoLocalArtifactStaging.disallowedSourceArtifactCount}
- Forbidden files in stage: ${record.repoLocalArtifactStaging.stagedForbiddenArtifactCount}
- Temporary stage removed: ${record.repoLocalArtifactStaging.stageDeletedAfterValidation ? "yes" : "no"}
- External network used: ${record.repoLocalArtifactStaging.externalNetworkAccessUsed ? "yes" : "no"}
- Existing Codex cache used: ${record.repoLocalArtifactStaging.existingCodexCacheUsed ? "yes" : "no"}

| plugin | source files | staged files | excluded metadata | MCP entry scripts | stage |
| --- | --- | --- | --- | --- | --- |
${pluginRows}

## Excluded Source Metadata

| path | reason |
| --- | --- |
${excludedRows}

## Disallowed Source Artifacts

| path | reason |
| --- | --- |
${disallowedRows}

## Single Public Install

- Suite file: ${record.unifiedSuite.path}
- Suite status: ${record.unifiedSuite.status}
- Release version: ${record.unifiedSuite.releaseVersion}
- Canonical install: ${record.unifiedSuite.canonicalInstallId}
- Default install mode: ${record.unifiedSuite.defaultInstallMode}
- Components: ${record.unifiedSuite.componentCount}
- Public plugin count: ${record.unifiedSuite.publicPluginCount}
- Embedded module count: ${record.unifiedSuite.embeddedModuleCount}

## Independent Clean-Runner Evidence Still Required

Repo-local staging validates artifact structure only. It is not an independent
installation or public release proof.

- Evidence intake contract: \`${record.independentRunnerEvidenceContract}\`
- Evidence record: \`${record.externalCleanRunnerEvidence.evidencePath || "not recorded"}\`
- Evidence status: ${record.externalCleanRunnerEvidence.status}
- Evidence recorded: ${record.externalCleanRunnerEvidence.evidenceRecorded ? "yes" : "no"}
- Evidence valid: ${record.externalCleanRunnerEvidence.evidenceValid ? "yes" : "no"}

${record.externalCleanRunnerEvidence.validationFailures.length ? `Validation findings:\n\n${record.externalCleanRunnerEvidence.validationFailures.map((item) => `- ${item}`).join("\n")}\n` : ""}

${record.externalCleanRunnerEvidence.requiredEvidence.map((item) => `- ${item}`).join("\n")}

## Current Blockers

${record.remainingReleaseBlockers.map((blocker) => `- ${blocker}`).join("\n")}

## Quality Gates

\`\`\`bash
${record.qualityGates.join("\n")}
\`\`\`

## Decision

NO-GO for public preview. The artifact stage is local evidence only; an
independent clean runner or public installation and human approval remain
required.
`;
}

function listFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir).sort()) {
    const filePath = path.join(dir, entry);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) files.push(...listFiles(filePath));
    else if (stat.isFile()) files.push(filePath);
  }
  return files;
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function readJsonAt(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function sanitizeError(error) {
  return String(error?.message || error || "unknown error").replaceAll(root, "<repo>");
}

function writeFile(file, body) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), body);
}

function assertSame(file, expected) {
  const filePath = path.join(root, file);
  const actual = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (actual !== expected) {
    console.error(`${file} is out of date. Run: npm run automation:seis-public-plugin-external-install-proof`);
    process.exit(1);
  }
}
