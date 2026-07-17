#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "content/development/seis-public-plugin-security-provenance-review.json";
const reportPath = "reports/seis-public-plugin-security-provenance-review.md";
const familyPath = "content/development/seis-public-plugin-family.json";
const lifecyclePath = "content/development/seis-public-plugin-lifecycle.json";
const freshTaskProofPath = "content/development/seis-public-plugin-fresh-task-proof.json";
const reloadEvidencePath = "content/development/seis-public-plugin-fresh-task-reload-evidence.json";
const unifiedSuitePath = "plugins/seis-ai-agent/assets/unified-suite.json";

const secretPatterns = [
  { id: "openai-api-key", category: "api_key", regex: /(^|[^A-Za-z0-9_])sk-[A-Za-z0-9]{20,}/ },
  { id: "aws-access-key", category: "cloud_key", regex: /AKIA[0-9A-Z]{16}/ },
  { id: "github-token", category: "github_token", regex: /ghp_[A-Za-z0-9_]{20,}/ },
  { id: "slack-token", category: "slack_token", regex: /xox[baprs]-[A-Za-z0-9-]{20,}/ },
  { id: "private-key-header", category: "private_key", regex: /BEGIN (RSA|OPENSSH|PRIVATE) KEY/ },
  { id: "inline-password-assignment", category: "password_assignment", regex: /password\s*=\s*['"][^'"]+['"]/i },
  { id: "inline-token-assignment", category: "token_assignment", regex: /token\s*=\s*['"][^'"]+['"]/i },
  { id: "inline-api-key-assignment", category: "api_key_assignment", regex: /api[_-]?key\s*=\s*['"][^'"]+['"]/i },
];

const scannedExtensions = new Set([
  ".json",
  ".md",
  ".mjs",
  ".js",
  ".cjs",
  ".ts",
  ".tsx",
  ".yml",
  ".yaml",
  ".sh",
  ".txt",
]);

const family = readJson(familyPath);
const lifecycle = readJson(lifecyclePath);
const freshTaskProof = readJson(freshTaskProofPath);
const reloadEvidence = readJson(reloadEvidencePath);
const unifiedSuite = readJson(unifiedSuitePath);

const plugins = (family.publicPlugins || []).map((plugin) => reviewPlugin({ ...plugin, sourceKind: "public-plugin" }));
const embeddedModules = (family.embeddedModules || family.plugins || []).map((module) => reviewPlugin({
  ...module,
  installId: module.canonicalInstallId || "seis-ai-agent@seis-repo",
  sourceKind: "embedded-source-module",
}));
const topicPlugins = (family.topicPlugins || []).map((plugin) => reviewPlugin({ ...plugin, sourceKind: "public-topic-package" }));
const reviewedUnits = [...plugins, ...embeddedModules, ...topicPlugins];
const secretFindings = reviewedUnits.flatMap((plugin) => plugin.secretFindings);
const blockingFindings = reviewedUnits.flatMap((plugin) => plugin.blockingFindings);
const hygieneFindings = reviewedUnits.flatMap((plugin) => plugin.hygieneFindings);
const reviewPassed = blockingFindings.length === 0 && secretFindings.length === 0;

const review = {
  id: "seis-public-plugin-security-provenance-review",
  version: 1,
  generatedAt,
  status: reviewPassed ? "repo-local-security-provenance-reviewed" : "blocked-by-security-provenance-findings",
  decision: "not-ready-for-public-preview",
  sourcePath,
  reportPath,
  publicPluginFamily: familyPath,
  lifecycleContract: lifecyclePath,
  freshTaskProof: freshTaskProofPath,
  freshTaskReloadEvidence: reloadEvidencePath,
  unifiedSuite: unifiedSuitePath,
  publicReleaseAllowed: false,
  scope:
    "Repo-local security and provenance review for the single public SEIS-Agent plugin, all embedded SEIS source modules, and all objective-derived topic packages before any public preview, publication, deployment, push, merge, tag, or release claim.",
  evidenceInputs: {
    publicPluginCount: plugins.length,
    embeddedModuleCount: embeddedModules.length,
    topicPluginCount: topicPlugins.length,
    lifecycleStatus: lifecycle.status,
    freshTaskReloadEvidenceStatus: reloadEvidence.status,
    freshTaskProofReloadEvidenceStatus: freshTaskProof.reloadEvidence?.status || null,
    unifiedSuiteReleaseVersion: unifiedSuite.releaseVersion || null,
    unifiedSuiteComponentCount: unifiedSuite.componentCount || 0,
    unifiedSuitePublicPluginCount: unifiedSuite.publicDistribution?.publicPluginCount || 0,
    unifiedSuiteEmbeddedModuleCount: unifiedSuite.publicDistribution?.embeddedModuleCount || 0,
  },
  reviewCriteria: [
    "The one public plugin and every embedded source module path exist in the repo.",
    "Every reviewed unit has a .codex-plugin/plugin.json manifest with matching name and MIT license.",
    "Every reviewed unit has a README.md and .mcp.json.",
    "Every MCP server command uses node with repo-local script arguments.",
    "The one-file unified suite contains every current source module, uses SEIS-Agent as the single public install, and does not mutate personal marketplace entries.",
    "Every objective-derived topic package has a repo-local MIT manifest, README, MCP boundary, and no write, network, or secret permission.",
    "No high-confidence secret patterns are present in scanned plugin text files.",
    "Public availability does not imply live cloud, SSH, provider, private data, GitHub write, deploy, merge, tag, or publish authority.",
    "Provenance is repo-local and release remains human-approved.",
  ],
  aggregate: {
    pluginCount: plugins.length,
    reviewedPluginCount: plugins.filter((plugin) => plugin.reviewStatus === "pass").length,
    embeddedModuleCount: embeddedModules.length,
    reviewedEmbeddedModuleCount: embeddedModules.filter((module) => module.reviewStatus === "pass").length,
    topicPluginCount: topicPlugins.length,
    reviewedTopicPluginCount: topicPlugins.filter((plugin) => plugin.reviewStatus === "pass").length,
    secretFindingCount: secretFindings.length,
    blockingFindingCount: blockingFindings.length,
    hygieneFindingCount: hygieneFindings.length,
    scannedFileCount: reviewedUnits.reduce((sum, plugin) => sum + plugin.scannedFileCount, 0),
    totalFileCount: reviewedUnits.reduce((sum, plugin) => sum + plugin.fileCount, 0),
  },
  findings: {
    blocking: blockingFindings,
    secrets: secretFindings,
    hygiene: hygieneFindings,
  },
  releaseBoundary: {
    reviewType: "static-repo-local-review",
    rawSecretValuesStored: false,
    externalNetworkAccessUsed: false,
    liveProviderAccessUsed: false,
    liveSshUsed: false,
    publicReleaseAllowed: false,
    approvalRequiredFor: lifecycle.releasePolicy.forbiddenWithoutApproval,
  },
  remainingReleaseBlockers: [
    "Human approval for public preview, release, publish, push, merge, tag, deploy, live SSH, or provider credentials has not been recorded.",
    "External clean-runner or public package installation proof has not been recorded.",
  ],
  plugins,
  embeddedModules,
  topicPlugins,
  qualityGates: [
    "npm run check:seis-public-plugin-security-provenance-review",
    "npm run check:seis-public-plugin-fresh-task-proof",
    "npm run check:seis-public-plugin-fresh-task-reload-evidence",
    "npm run check:seis-public-plugin-external-install-proof",
    "npm run check:seis-topic-plugin-matrix",
    "npm run check:seis-unified-plugin-suite",
    "npm run check:seis-public-plugin-install-smoke:local:mcp",
    "npm run check:seis-agent-plugin-integration",
  ],
  completionRule:
    "This review is complete for internal review when the one-file unified suite, the single repo-local public SEIS-Agent component, and every embedded source module pass manifest, license, MCP command, source, README, and secret-scan checks. Public release remains blocked until human approval and external clean-runner/public install proof exist.",
};

const report = renderReport(review);

if (checkMode) {
  assertSame(sourcePath, `${JSON.stringify(review, null, 2)}\n`);
  assertSame(reportPath, report);
  validateReview(review, report);
  console.log("SEIS public plugin security/provenance review check passed.");
} else {
  writeFile(sourcePath, `${JSON.stringify(review, null, 2)}\n`);
  writeFile(reportPath, report);
  validateReview(review, report);
  console.log(`Wrote ${sourcePath}`);
  console.log(`Wrote ${reportPath}`);
}

function reviewPlugin(plugin) {
  const sourcePath = plugin.sourcePath.replace(/^\.\//, "");
  const pluginRoot = path.join(root, sourcePath);
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const mcpPath = path.join(pluginRoot, ".mcp.json");
  const readmePath = path.join(pluginRoot, "README.md");
  const blockingFindings = [];
  const hygieneFindings = [];
  const secretFindings = [];

  if (!fs.existsSync(pluginRoot)) blockingFindings.push(finding(plugin.name, "missing-source", sourcePath, "Plugin source path is missing."));
  if (!fs.existsSync(manifestPath)) blockingFindings.push(finding(plugin.name, "missing-manifest", path.relative(root, manifestPath), "Plugin manifest is missing."));
  if (!fs.existsSync(mcpPath)) blockingFindings.push(finding(plugin.name, "missing-mcp", path.relative(root, mcpPath), "MCP manifest is missing."));
  if (!fs.existsSync(readmePath)) blockingFindings.push(finding(plugin.name, "missing-readme", path.relative(root, readmePath), "README is missing."));

  const manifest = fs.existsSync(manifestPath) ? readJson(path.relative(root, manifestPath)) : null;
  const mcp = fs.existsSync(mcpPath) ? readJson(path.relative(root, mcpPath)) : null;
  if (manifest) {
    if (manifest.name !== plugin.name) blockingFindings.push(finding(plugin.name, "manifest-name-mismatch", path.relative(root, manifestPath), "Manifest name does not match public family plugin name."));
    if (manifest.license !== "MIT") blockingFindings.push(finding(plugin.name, "license-not-mit", path.relative(root, manifestPath), "Manifest license must be MIT for this public plugin family."));
    if (!manifest.version) blockingFindings.push(finding(plugin.name, "missing-version", path.relative(root, manifestPath), "Manifest version is missing."));
  }
  const serverReviews = reviewMcpServers(plugin.name, mcp, mcpPath, blockingFindings);
  const files = fs.existsSync(pluginRoot) ? listFiles(pluginRoot) : [];
  for (const file of files) {
    const relative = path.relative(root, file);
    if (path.basename(file) === ".DS_Store") {
      hygieneFindings.push(finding(plugin.name, "macos-ds-store", relative, "macOS metadata file should be excluded from public release artifacts."));
      continue;
    }
    if (!isTextScanCandidate(file)) continue;
    const body = safeRead(file);
    if (body === null) continue;
    for (const pattern of secretPatterns) {
      if (pattern.regex.test(body)) {
        secretFindings.push({
          plugin: plugin.name,
          id: pattern.id,
          category: pattern.category,
          path: relative,
          detail: "Potential secret-like pattern detected. Value intentionally not recorded.",
        });
      }
    }
  }

  return {
    name: plugin.name,
    installId: plugin.installId,
    sourceKind: plugin.sourceKind || "public-plugin",
    role: plugin.role,
    sourcePath: plugin.sourcePath,
    reviewStatus: blockingFindings.length === 0 && secretFindings.length === 0 ? "pass" : "fail",
    provenance: {
      origin: "repo-local-seis-plugin-family",
      sourcePath: plugin.sourcePath,
      manifestLicense: manifest?.license || null,
      manifestVersion: manifest?.version || null,
      externalDependencyManifestPresent: fs.existsSync(path.join(pluginRoot, "package.json")),
    },
    files: {
      manifest: fs.existsSync(manifestPath),
      mcp: fs.existsSync(mcpPath),
      readme: fs.existsSync(readmePath),
    },
    mcpServers: serverReviews,
    fileCount: files.length,
    scannedFileCount: files.filter(isTextScanCandidate).length,
    blockingFindings,
    secretFindings,
    hygieneFindings,
  };
}

function reviewMcpServers(pluginName, mcp, mcpPath, blockingFindings) {
  const servers = Object.entries(mcp?.mcpServers || {});
  if (servers.length === 0) {
    blockingFindings.push(finding(pluginName, "missing-mcp-server", path.relative(root, mcpPath), "No MCP server is declared."));
    return [];
  }
  return servers.map(([name, server]) => {
    const command = server.command || null;
    const args = Array.isArray(server.args) ? server.args : [];
    const commandOk = command === "node";
    const argsOk =
      args.length > 0 &&
      args.every((arg) => typeof arg === "string") &&
      args.every((arg) => !path.isAbsolute(arg)) &&
      args.every((arg) => !arg.includes("..")) &&
      args.some((arg) => arg.endsWith(".mjs") || arg.endsWith(".js"));
    if (!commandOk) blockingFindings.push(finding(pluginName, "mcp-command-not-node", path.relative(root, mcpPath), `MCP server ${name} must use node.`));
    if (!argsOk) blockingFindings.push(finding(pluginName, "mcp-args-not-repo-local", path.relative(root, mcpPath), `MCP server ${name} must use repo-local script arguments.`));
    return {
      name,
      command,
      args,
      commandOk,
      argsOk,
      envKeys: Object.keys(server.env || {}),
    };
  });
}

function validateReview(review, report) {
  const failures = [];
  if (review.id !== "seis-public-plugin-security-provenance-review") failures.push("review id is invalid");
  if (review.publicReleaseAllowed !== false) failures.push("public release must remain blocked");
  if (review.aggregate.pluginCount !== 1) failures.push("review must cover only the public SEIS-Agent plugin");
  if (review.aggregate.embeddedModuleCount < 10) failures.push("review must cover every current embedded source module");
  if (review.aggregate.reviewedEmbeddedModuleCount !== review.aggregate.embeddedModuleCount) failures.push("every embedded source module must pass review");
  if (review.aggregate.topicPluginCount !== family.topicPlugins.length) failures.push("review must cover every objective-derived topic package");
  if (review.aggregate.reviewedTopicPluginCount !== review.aggregate.topicPluginCount) failures.push("every objective-derived topic package must pass review");
  if (review.aggregate.blockingFindingCount !== 0) failures.push("blocking findings must be zero for internal review");
  if (review.aggregate.secretFindingCount !== 0) failures.push("secret findings must be zero for internal review");
  if (review.evidenceInputs.unifiedSuiteComponentCount < 10) failures.push("unified suite must contain every current SEIS component");
  if (review.evidenceInputs.unifiedSuitePublicPluginCount !== 1 || review.evidenceInputs.unifiedSuiteEmbeddedModuleCount < 10) failures.push("unified suite must expose one public plugin and every embedded source module");
  if (review.evidenceInputs.unifiedSuiteReleaseVersion !== "0.3.0+codex.20260712") failures.push("unified suite release version is invalid");
  if (review.releaseBoundary.rawSecretValuesStored !== false) failures.push("raw secret values must not be stored");
  if (!review.qualityGates.includes("npm run check:seis-public-plugin-security-provenance-review")) failures.push("quality gates must include this check");
  if (!review.qualityGates.includes("npm run check:seis-public-plugin-external-install-proof")) failures.push("quality gates must include the external install proof check");
  if (!review.qualityGates.includes("npm run check:seis-unified-plugin-suite")) failures.push("quality gates must include the unified suite check");
  if (!report.includes("NO-GO for public preview")) failures.push("report must keep public preview as NO-GO");
  if (failures.length) {
    console.error("SEIS public plugin security/provenance review validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function renderReport(review) {
  const pluginRows = review.plugins
    .map((plugin) => `| ${plugin.name} | ${plugin.installId} | ${plugin.reviewStatus} | ${plugin.provenance.manifestLicense || "n/a"} | ${plugin.mcpServers.length} | ${plugin.secretFindings.length} | ${plugin.hygieneFindings.length} |`)
    .join("\n");
  const moduleRows = review.embeddedModules
    .map((module) => `| ${module.name} | ${module.installId} | ${module.reviewStatus} | ${module.provenance.manifestLicense || "n/a"} | ${module.secretFindings.length} |`)
    .join("\n");
  const topicRows = review.topicPlugins
    .map((plugin) => `| ${plugin.name} | ${plugin.installId} | ${plugin.reviewStatus} | ${plugin.provenance.manifestLicense || "n/a"} | ${plugin.mcpServers.length} | ${plugin.secretFindings.length} |`)
    .join("\n");
  const hygieneRows = review.findings.hygiene.length
    ? review.findings.hygiene.map((item) => `| ${item.plugin} | ${item.id} | ${item.path} | ${item.detail} |`).join("\n")
    : "| none | none | none | none |";
  const blockerRows = review.findings.blocking.length
    ? review.findings.blocking.map((item) => `| ${item.plugin} | ${item.id} | ${item.path} | ${item.detail} |`).join("\n")
    : "| none | none | none | none |";
  return `# SEIS Public Plugin Security Provenance Review

- Generated: ${review.generatedAt}
- Status: ${review.status}
- Decision: ${review.decision}
- Public release allowed: ${review.publicReleaseAllowed ? "yes" : "no"}
- Secret findings: ${review.aggregate.secretFindingCount}
- Blocking findings: ${review.aggregate.blockingFindingCount}
- Hygiene findings: ${review.aggregate.hygieneFindingCount}

## Plugin Review

| plugin | install id | review | license | MCP servers | secrets | hygiene |
| --- | --- | --- | --- | --- | --- | --- |
${pluginRows}

## Embedded Source Module Review

| module | canonical install | review | license | secrets |
| --- | --- | --- | --- | --- |
${moduleRows}

## Objective-Derived Topic Package Review

| package | install id | review | license | MCP servers | secrets |
| --- | --- | --- | --- | --- | --- |
${topicRows}

## Blocking Findings

| plugin | id | path | detail |
| --- | --- | --- | --- |
${blockerRows}

## Hygiene Findings

| plugin | id | path | detail |
| --- | --- | --- | --- |
${hygieneRows}

## Release Boundary

- Raw secret values stored: ${review.releaseBoundary.rawSecretValuesStored ? "yes" : "no"}
- External network access used: ${review.releaseBoundary.externalNetworkAccessUsed ? "yes" : "no"}
- Live provider access used: ${review.releaseBoundary.liveProviderAccessUsed ? "yes" : "no"}
- Live SSH used: ${review.releaseBoundary.liveSshUsed ? "yes" : "no"}

## Remaining Release Blockers

${review.remainingReleaseBlockers.map((blocker) => `- ${blocker}`).join("\n")}

## Quality Gates

\`\`\`bash
${review.qualityGates.join("\n")}
\`\`\`

## Decision

NO-GO for public preview until human approval and external clean-runner or
public package installation proof are recorded.
`;
}

function finding(plugin, id, filePath, detail) {
  return { plugin, id, path: filePath, detail };
}

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const file = path.join(dir, entry);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) out.push(...listFiles(file));
    else if (stat.isFile()) out.push(file);
  }
  return out;
}

function isTextScanCandidate(file) {
  return scannedExtensions.has(path.extname(file)) || path.basename(file) === ".mcp.json";
}

function safeRead(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
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
    console.error(`${file} is out of date. Run: npm run automation:seis-public-plugin-security-provenance-review`);
    process.exit(1);
  }
}
