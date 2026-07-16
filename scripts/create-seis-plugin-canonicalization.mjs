#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "content/development/seis-plugin-canonicalization.json";
const reportPath = "reports/seis-plugin-canonicalization.md";
const integrationPath = "content/development/seis-agent-plugin-integration.json";
const familyPath = "content/development/seis-public-plugin-family.json";

const integration = readJson(integrationPath);
const family = readJson(familyPath);
const publicPlugins = Array.isArray(family.publicPlugins) ? family.publicPlugins : [];
const embeddedModules = Array.isArray(family.embeddedModules) ? family.embeddedModules : family.plugins || [];
const personalPlugins = Array.isArray(integration.personalPlugins) ? integration.personalPlugins : [];
const canonicalPluginIds = publicPlugins.map((plugin) => plugin.installId);
const aliases = personalPlugins.map((plugin) => buildAlias(plugin));

const contract = {
  id: "seis-plugin-canonicalization",
  version: 1,
  generatedAt,
  status: "active-non-destructive-canonicalization",
  decision: "ready-for-internal-review",
  sourcePath,
  reportPath,
  integrationManifest: integrationPath,
  publicPluginFamily: familyPath,
  publicReleaseAllowed: false,
  purpose:
    "Combine duplicate personal and seis-repo SEIS plugin identities into one public SEIS-Agent installation while preserving user-installed personal plugins as read-only legacy aliases until a human chooses a separate cleanup action.",
  canonicalMarketplace: "seis-repo",
  canonicalOrchestrator: "seis-ai-agent@seis-repo",
  canonicalPluginIds,
  effectivePluginCount: canonicalPluginIds.length,
  embeddedModuleCount: embeddedModules.length,
  currentBaselinePluginCount: 1,
  currentBaselineModuleCount: 10,
  legacyAliasCount: aliases.length,
  duplicateResolutionMode: "legacy-personal-alias-to-single-seis-ai-agent",
  globalMarketplaceMutation: {
    performed: false,
    allowedWithoutHumanApproval: false,
    rationale:
      "Personal marketplace entries and user plugin folders are preserved. SEIS AI and installer output use canonical repo identities without deleting, disabling, or rewriting user-installed plugins.",
  },
  aliases,
  runtimeBehavior: {
    statusSurface: "SEIS AI reports one public SEIS-Agent installation, its embedded modules, and personal duplicates as legacy aliases rather than additional active lanes.",
    installSurface: "The SEIS installer targets only seis-ai-agent@seis-repo and never adds or removes @personal duplicates.",
    mcpSurface: "SEIS AI lane routing uses embedded modules through the one public SEIS-Agent plugin; legacy aliases remain compatibility evidence only.",
  },
  qualityGates: [
    "npm run check:seis-plugin-canonicalization",
    "npm run check:seis-agent-plugin-integration",
    "npm run check:seis-public-plugin-family",
    "npm run check:seis-public-plugin-install-smoke:local:mcp",
    "npm run check:seis-ai-agent",
  ],
  humanApprovalRequiredFor: [
    "removing, disabling, or editing personal marketplace entries",
    "deleting or replacing user plugin directories",
    "public preview, publication, push, merge, tag, deployment, live SSH, or provider access",
  ],
  completionRule:
    "Canonicalization is complete for internal review when five personal aliases map to the one public SEIS-Agent installation, every registered current or future SEIS source plugin appears once as an embedded module, installer output excludes personal duplicates, and SEIS AI exposes the mapping. Public release remains separately gated.",
};

const report = renderReport(contract);

if (checkMode) {
  assertSame(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  assertSame(reportPath, report);
  validateContract(contract);
  console.log("SEIS plugin canonicalization check passed.");
} else {
  writeFile(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  writeFile(reportPath, report);
  validateContract(contract);
  console.log(`Wrote ${sourcePath}`);
  console.log(`Wrote ${reportPath}`);
}

function buildAlias(plugin) {
  const pluginName = plugin.id?.split("@")[0] || "";
  const canonical = publicPlugins.find((candidate) => candidate.installId === "seis-ai-agent@seis-repo");
  const module = embeddedModules.find((candidate) => candidate.name === pluginName);
  const canonicalSourcePath = canonical?.sourcePath?.replace(/^\.\//, "") || null;
  const manifestPath = canonicalSourcePath ? path.join(canonicalSourcePath, ".codex-plugin", "plugin.json") : null;
  const manifest = manifestPath ? readJson(manifestPath) : null;
  return {
    legacyInstallId: plugin.id,
    canonicalInstallId: canonical?.installId || null,
    pluginName,
    lane: plugin.embeddedAs || null,
    canonicalModuleId: module?.name || null,
    canonicalModuleSourceMirror: module?.sourcePath?.replace(/^\.\//, "") || null,
    legacyStatus: plugin.status,
    canonicalSourceMirror: canonicalSourcePath,
    canonicalManifestLicense: manifest?.license || null,
    canonicalManifestVersion: manifest?.version || null,
    resolution: "resolve-to-single-seis-ai-agent",
    userPluginPreserved: true,
    automaticRemoval: false,
  };
}

function validateContract(record) {
  const failures = [];
  if (record.id !== "seis-plugin-canonicalization") failures.push("canonicalization id is invalid");
  if (record.publicReleaseAllowed !== false) failures.push("canonicalization must not allow public release");
  if (record.canonicalMarketplace !== "seis-repo") failures.push("canonical marketplace must be seis-repo");
  if (record.canonicalOrchestrator !== "seis-ai-agent@seis-repo") failures.push("canonical orchestrator must be seis-ai-agent@seis-repo");
  if (record.canonicalPluginIds.length !== record.currentBaselinePluginCount) failures.push("canonical family must contain only the one public SEIS-Agent plugin");
  if (new Set(record.canonicalPluginIds).size !== record.canonicalPluginIds.length) failures.push("canonical plugin ids must be unique");
  if (record.effectivePluginCount !== record.canonicalPluginIds.length) failures.push("effective plugin count must match the canonical family");
  if (record.embeddedModuleCount < record.currentBaselineModuleCount) failures.push("canonicalization must cover every current embedded module");
  if (record.legacyAliasCount !== 5) failures.push("five personal aliases must be combined");
  if (record.duplicateResolutionMode !== "legacy-personal-alias-to-single-seis-ai-agent") failures.push("duplicate resolution mode is invalid");
  if (record.globalMarketplaceMutation.performed !== false) failures.push("canonicalization must not mutate the personal marketplace");
  if (record.globalMarketplaceMutation.allowedWithoutHumanApproval !== false) failures.push("personal marketplace mutation must require human approval");

  for (const alias of record.aliases) {
    if (!alias.legacyInstallId?.endsWith("@personal")) failures.push("legacy alias must use personal marketplace identity");
    if (!alias.canonicalInstallId?.endsWith("@seis-repo")) failures.push(`${alias.legacyInstallId} must map to a canonical seis-repo identity`);
    if (alias.canonicalInstallId !== "seis-ai-agent@seis-repo") failures.push(`${alias.legacyInstallId} must map to the one public SEIS-Agent install`);
    if (!alias.canonicalModuleId || !embeddedModules.some((module) => module.name === alias.canonicalModuleId)) failures.push(`${alias.legacyInstallId} must retain its embedded module mapping`);
    if (alias.canonicalManifestLicense !== "MIT") failures.push(`${alias.canonicalInstallId} must use an MIT manifest`);
    if (alias.resolution !== "resolve-to-single-seis-ai-agent") failures.push(`${alias.legacyInstallId} resolution is invalid`);
    if (alias.userPluginPreserved !== true || alias.automaticRemoval !== false) failures.push(`${alias.legacyInstallId} must preserve user plugin state`);
  }
  if (failures.length) {
    console.error("SEIS plugin canonicalization validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function renderReport(record) {
  const aliases = record.aliases
    .map((alias) => `| ${alias.legacyInstallId} | ${alias.canonicalInstallId} | ${alias.lane || "n/a"} | ${alias.canonicalManifestVersion || "n/a"} | ${alias.canonicalManifestLicense || "n/a"} | preserved |`)
    .join("\n");
  return `# SEIS Plugin Canonicalization

- Generated: ${record.generatedAt}
- Status: ${record.status}
- Canonical marketplace: ${record.canonicalMarketplace}
- Canonical orchestrator: ${record.canonicalOrchestrator}
- Effective public plugin count: ${record.effectivePluginCount}
- Embedded module count: ${record.embeddedModuleCount}
- Legacy aliases combined: ${record.legacyAliasCount}
- Public release allowed: ${record.publicReleaseAllowed ? "yes" : "no"}

## Alias Resolution

| legacy install id | canonical install id | embedded module | lane | canonical version | license | user plugin |
| --- | --- | --- | --- | --- | --- | --- |
${record.aliases.map((alias) => `| ${alias.legacyInstallId} | ${alias.canonicalInstallId} | ${alias.canonicalModuleId || "n/a"} | ${alias.lane || "n/a"} | ${alias.canonicalManifestVersion || "n/a"} | ${alias.canonicalManifestLicense || "n/a"} | preserved |`).join("\n")}

## Runtime Behavior

- Status: ${record.runtimeBehavior.statusSurface}
- Install: ${record.runtimeBehavior.installSurface}
- MCP: ${record.runtimeBehavior.mcpSurface}

## Safety Boundary

No personal marketplace entry or user plugin directory is deleted, disabled, or
rewritten by this contract. Those actions require explicit human approval.

## Quality Gates

\`\`\`bash
${record.qualityGates.join("\n")}
\`\`\`

## Decision

The duplicate identities are combined logically through canonical resolution.
Personal copies remain compatibility aliases until a human chooses a separate,
reviewed cleanup action.
`;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeFile(file, body) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), body);
}

function assertSame(file, expected) {
  const filePath = path.join(root, file);
  const actual = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (actual !== expected) {
    console.error(`${file} is out of date. Run: npm run automation:seis-plugin-canonicalization`);
    process.exit(1);
  }
}
