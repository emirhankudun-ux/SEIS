#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "content/development/seis-public-plugin-lifecycle.json";
const reportPath = "reports/seis-public-plugin-lifecycle.md";
const publicFamilyPath = "content/development/seis-public-plugin-family.json";
const freshTaskProofPath = "content/development/seis-public-plugin-fresh-task-proof.json";
const freshTaskReloadEvidencePath = "content/development/seis-public-plugin-fresh-task-reload-evidence.json";
const freshTaskReloadEvidenceReportPath = "reports/seis-public-plugin-fresh-task-reload-evidence.md";
const securityProvenanceReviewPath = "content/development/seis-public-plugin-security-provenance-review.json";
const securityProvenanceReviewReportPath = "reports/seis-public-plugin-security-provenance-review.md";
const externalInstallProofPath = "content/development/seis-public-plugin-external-install-proof.json";
const externalInstallProofReportPath = "reports/seis-public-plugin-external-install-proof.md";
const canonicalizationPath = "content/development/seis-plugin-canonicalization.json";
const canonicalizationReportPath = "reports/seis-plugin-canonicalization.md";
const independentRunnerEvidenceContractPath = "content/development/seis-public-plugin-independent-runner-evidence-contract.json";
const independentRunnerEvidenceContractReportPath = "reports/seis-public-plugin-independent-runner-evidence-contract.md";
const unifiedSuitePath = "plugins/seis-ai-agent/assets/unified-suite.json";
const marketplacePath = ".agents/plugins/marketplace.json";

const publicFamily = readJson(publicFamilyPath);
const marketplace = readJson(marketplacePath);
const externalInstallProof = readOptionalJson(externalInstallProofPath);
const externalInstallProofSummary = summarizeExternalInstallProof(externalInstallProof);
const canonicalization = readJson(canonicalizationPath);
const canonicalizationSummary = summarizeCanonicalization(canonicalization);
const unifiedSuite = readJson(unifiedSuitePath);
const unifiedSuiteSummary = summarizeUnifiedSuite(unifiedSuite);
const independentRunnerEvidenceContract = readJson(independentRunnerEvidenceContractPath);
const independentRunnerEvidenceIntake = summarizeIndependentRunnerEvidenceIntake(independentRunnerEvidenceContract, externalInstallProofSummary);
const publicPlugins = (publicFamily.publicPlugins || []).map((plugin) => {
  const manifest = readJson(path.join(plugin.sourcePath, ".codex-plugin", "plugin.json"));
  const mcp = readJson(path.join(plugin.sourcePath, ".mcp.json"));
  const marketplaceEntry = marketplace.plugins.find((entry) => entry.name === plugin.name);
  return {
    name: plugin.name,
    displayName: plugin.displayName,
    role: plugin.role,
    sourcePath: plugin.sourcePath,
    installId: plugin.installId,
    version: manifest.version || "0.1.0",
    license: manifest.license,
    category: marketplaceEntry?.category || plugin.category,
    mcpServers: Object.keys(mcp.mcpServers || {}),
  };
});
const embeddedModules = (publicFamily.embeddedModules || publicFamily.plugins || []).map((module) => {
  const manifest = readJson(path.join(module.sourcePath, ".codex-plugin", "plugin.json"));
  const mcp = readJson(path.join(module.sourcePath, ".mcp.json"));
  return {
    name: module.name,
    displayName: module.displayName,
    role: module.role,
    sourcePath: module.sourcePath,
    canonicalInstallId: module.canonicalInstallId || "seis-ai-agent@seis-repo",
    sourceModuleStatus: module.publicStatus || "embedded-source-module",
    version: manifest.version || "0.1.0",
    license: manifest.license,
    mcpServers: Object.keys(mcp.mcpServers || {}),
  };
});

const phases = [
  {
    id: "repo-contract",
    label: "Repo Contract",
    status: "active",
    ownerLane: "seis-governance",
    requiredEvidence: [
      "content/development/seis-public-plugin-family.json",
      ".agents/plugins/marketplace.json",
      "npm run check:seis-public-plugin-family",
    ],
    exitRule: "All public plugin manifests, marketplace entries, source mirrors, and SEIS AI lane links validate in the repo.",
  },
  {
    id: "canonical-alias-resolution",
    label: "Canonical Alias Resolution",
    status: canonicalizationSummary.ready ? "active-non-destructive-canonicalization" : "blocked-canonicalization-contract",
    ownerLane: "seis-governance",
    requiredEvidence: [
      canonicalizationPath,
      canonicalizationReportPath,
      "npm run check:seis-plugin-canonicalization",
      "five @personal compatibility aliases resolve to the single public SEIS-Agent install without mutating user installations",
    ],
    exitRule: "SEIS AI and the installer report one canonical public SEIS-Agent install while preserving legacy personal plugins as read-only compatibility aliases.",
  },
  {
    id: "single-public-install",
    label: "Single Public Install",
    status: unifiedSuiteSummary.ready ? "active-single-public-plugin" : "blocked-unified-suite",
    ownerLane: "seis-ai-agent",
    requiredEvidence: [
      unifiedSuitePath,
      "npm run check:seis-unified-plugin-suite",
      "npm run install:seis-ai-agent",
      "the default installer targets only seis-ai-agent@seis-repo",
    ],
    exitRule: "All SEIS source modules share one versioned suite file, and SEIS-Agent is the only public install target; module folders do not create standalone public installs.",
  },
  {
    id: "installed-cache",
    label: "Installed Cache",
    status: "active-local-proof",
    ownerLane: "seis-automation",
    requiredEvidence: [
      "npm run check:seis-public-plugin-install-smoke:local",
      "npm run check:seis-public-plugin-install-smoke:local:mcp",
    ],
    exitRule: "The single public SEIS-Agent plugin exists in the local Codex cache, its MCP server initializes, lists tools, and answers representative lane calls.",
  },
  {
    id: "clean-artifact-stage",
    label: "Clean Artifact Stage",
    status: externalInstallProofSummary.artifactStagingOk ? "repo-local-artifact-staged" : "pending-or-blocked-artifact-stage",
    ownerLane: "seis-automation",
    requiredEvidence: [
      externalInstallProofPath,
      externalInstallProofReportPath,
      "npm run check:seis-public-plugin-external-install-proof",
      "disposable local stage excludes macOS metadata and forbidden artifact classes",
    ],
    exitRule: "A disposable local artifact stage contains the sole marketplace plugin plus its embedded module suite without forbidden release artifacts. This does not prove an independent installation.",
  },
  {
    id: "fresh-task-reload",
    label: "Fresh Task Reload",
    status: "human-triggered-next-proof",
    ownerLane: "seis-product",
    requiredEvidence: [
      freshTaskProofPath,
      freshTaskReloadEvidencePath,
      freshTaskReloadEvidenceReportPath,
      "npm run check:seis-public-plugin-fresh-task-proof",
      "npm run check:seis-public-plugin-fresh-task-reload-evidence",
      "new Codex task opened after plugin install",
      "installed plugin skills and MCP tools visible in the new task",
      "same smoke commands pass from the refreshed task context",
    ],
    exitRule: "A newly started task can use the public SEIS plugin family without relying on this thread's pre-install tool surface.",
  },
  {
    id: "independent-runner-evidence",
    label: "Independent Runner Evidence",
    status: independentRunnerEvidenceIntake.status,
    ownerLane: "seis-automation",
    requiredEvidence: [
      independentRunnerEvidenceContractPath,
      independentRunnerEvidenceContractReportPath,
      "npm run check:seis-public-plugin-independent-runner-evidence-contract",
      "npm run check:seis-public-plugin-independent-runner-evidence:recorded",
      "sanitized evidence from an external clean runner or public package install",
    ],
    exitRule: "A strict recorded-evidence check proves the single SEIS-Agent public plugin installed from an independent public source, exposed every embedded module, passed MCP smoke, and was visible through SEIS AI in a fresh task. Human approval still remains required.",
  },
  {
    id: "public-preview",
    label: "Public Preview",
    status: "approval-gated",
    ownerLane: "seis-security",
    requiredEvidence: [
      "license and provenance review",
      securityProvenanceReviewPath,
      securityProvenanceReviewReportPath,
      "npm run check:seis-public-plugin-security-provenance-review",
      externalInstallProofPath,
      externalInstallProofReportPath,
      "npm run check:seis-public-plugin-external-install-proof",
      canonicalizationPath,
      "npm run check:seis-plugin-canonicalization",
      unifiedSuitePath,
      "npm run check:seis-unified-plugin-suite",
      independentRunnerEvidenceContractPath,
      "npm run check:seis-public-plugin-independent-runner-evidence:recorded",
      "independent clean-runner or public package installation proof",
      "secret scan and access review",
      "human approval for public release or PR",
      "rollback note and release notes",
    ],
    exitRule: "Security, provenance, clean-artifact staging, independent installation, validation, rollback, and human release approval are recorded before public preview claims.",
  },
  {
    id: "stable",
    label: "Stable",
    status: "planned",
    ownerLane: "seis-governance",
    requiredEvidence: [
      "repeatable CI checks",
      "fresh clone install proof",
      "versioned changelog",
      "compatibility matrix across supported Codex runtimes",
    ],
    exitRule: "Stable is only claimed after repeatable install/runtime evidence exists outside this local machine.",
  },
];

const lifecycle = {
  id: "seis-public-plugin-lifecycle",
  version: 1,
  generatedAt,
  status: "active-local-proof-public-release-gated",
  sourcePath,
  reportPath,
  publicFamilyContract: publicFamilyPath,
  freshTaskProofContract: freshTaskProofPath,
  freshTaskReloadEvidence: freshTaskReloadEvidencePath,
  freshTaskReloadEvidenceReport: freshTaskReloadEvidenceReportPath,
  securityProvenanceReview: securityProvenanceReviewPath,
  securityProvenanceReviewReport: securityProvenanceReviewReportPath,
  externalInstallProof: externalInstallProofPath,
  externalInstallProofReport: externalInstallProofReportPath,
  externalInstallProofSummary,
  canonicalizationContract: canonicalizationPath,
  canonicalizationReport: canonicalizationReportPath,
  canonicalizationSummary,
  unifiedSuite: unifiedSuitePath,
  unifiedSuiteSummary,
  independentRunnerEvidenceContract: independentRunnerEvidenceContractPath,
  independentRunnerEvidenceContractReport: independentRunnerEvidenceContractReportPath,
  independentRunnerEvidenceIntake,
  marketplace: marketplacePath,
  purpose:
    "Keep the single public SEIS-Agent plugin and its embedded SEIS source modules maintainable over a long horizon by tracking release phases, compatibility, validation gates, ownership, and approval boundaries.",
  publicAudience: "everyone",
  orchestrator: "seis-ai-agent@seis-repo",
  publicDistribution: {
    publicPluginCount: publicPlugins.length,
    embeddedModuleCount: embeddedModules.length,
    canonicalInstallId: "seis-ai-agent@seis-repo",
    mode: "single-public-plugin",
  },
  releasePolicy: {
    currentChannel: "internal-review-local-proof",
    releaseAuthority: "human_owner_required",
    publicPreviewRequires: [
      "npm run check:seis-public-plugin-family",
      "npm run check:seis-public-plugin-fresh-task-proof",
      "npm run check:seis-public-plugin-fresh-task-reload-evidence",
      "npm run check:seis-public-plugin-security-provenance-review",
      "npm run check:seis-public-plugin-external-install-proof",
      "npm run check:seis-plugin-canonicalization",
      "npm run check:seis-unified-plugin-suite",
      "npm run check:seis-public-plugin-independent-runner-evidence-contract",
      "npm run check:seis-public-plugin-independent-runner-evidence:recorded",
      "npm run check:seis-public-plugin-install-smoke:mcp",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:seis-ai-agent",
      "npm run check:seis-repo-marketplace",
      "fresh task reload proof",
      "security and provenance review",
      "independent clean-runner or public installation proof",
      "human approval",
    ],
    forbiddenWithoutApproval: [
      "push",
      "merge",
      "tag",
      "release",
      "deploy",
      "publish marketplace listing",
      "execute live SSH",
      "use provider credentials",
      "claim live cloud or AI provider connectivity",
    ],
  },
  compatibility: {
    pluginApi: "codex-plugin-json-plus-mcp-json",
    mcpTransport: "stdio-jsonrpc-content-length",
    runtime: "node",
    minimumNodeMajorObserved: 24,
    secretsRequiredForCoreDemo: false,
    defaultInstallMode: "single-public-plugin",
    standaloneLaneInstallMode: "source-module-only",
    authBoundary: "ON_INSTALL means account or provider auth is explicit and never implied by marketplace availability",
  },
  cadence: {
    patchWindow: "as-needed-small-safe-fixes",
    minorWindow: "monthly-when-feature-lanes-change",
    majorWindow: "only-after-breaking-contract-review",
    longHorizonReview: "quarterly-public-plugin-family-review",
  },
  phases,
  plugins: publicPlugins.map((plugin) => ({
    ...plugin,
    lifecycleState: "public-repo-available-local-proof",
    supportTier: "orchestrator-critical",
    compatibilityBand: "^0.3.x",
    releaseChannel: "internal-review-local-proof",
    liveRuntimeStatus: "local_demo_or_auth_gated",
    connectedToSeisAi: true,
    requiredGates: [
      "manifest-valid",
      "mcp-manifest-valid",
      "repo-marketplace-available",
      "seis-ai-connected",
      "install-smoke",
      "mcp-smoke",
      "security-boundary",
    ],
    rollback: `Remove ${plugin.installId} from the repo marketplace only with human approval, then rerun public plugin family, install smoke, and SEIS AI checks.`,
  })),
  embeddedModules: embeddedModules.map((module) => ({
    ...module,
    lifecycleState: "embedded-in-public-seis-agent",
    supportTier: module.name === "seis-ai-agent" ? "orchestrator-root" : "embedded-lane-critical",
    compatibilityBand: "^0.3.x",
    releaseChannel: "internal-review-local-proof",
    liveRuntimeStatus: "local_demo_or_auth_gated",
    connectedToSeisAi: true,
    requiredGates: [
      "source-manifest-valid",
      "embedded-suite-discovery",
      "seis-ai-connected",
      "security-boundary",
    ],
  })),
  qualityGates: [
    "npm run check:seis-public-plugin-lifecycle",
    "npm run check:seis-public-plugin-family",
    "npm run check:seis-public-plugin-fresh-task-proof",
    "npm run check:seis-public-plugin-fresh-task-reload-evidence",
    "npm run check:seis-public-plugin-security-provenance-review",
    "npm run check:seis-public-plugin-external-install-proof",
    "npm run check:seis-plugin-canonicalization",
    "npm run check:seis-unified-plugin-suite",
    "npm run check:seis-public-plugin-independent-runner-evidence-contract",
    "npm run check:seis-public-plugin-independent-runner-evidence",
    "npm run check:seis-public-plugin-install-smoke:mcp",
    "npm run check:seis-agent-plugin-integration",
    "npm run check:seis-ai-agent",
    "npm run check:seis-specialist-plugins",
    "npm run check:seis-repo-marketplace",
  ],
  completionRule:
    "The lifecycle is ready for internal review when the single public SEIS-Agent suite, embedded module discovery, canonical alias resolution, repo, clean-artifact, install-smoke, MCP-smoke, SEIS AI, specialist, and marketplace checks pass. Public release remains gated on fresh-task reload proof, security/provenance review, strict independent clean-runner/public installation evidence, and human approval.",
};

const report = renderReport(lifecycle);

if (checkMode) {
  assertSame(sourcePath, `${JSON.stringify(lifecycle, null, 2)}\n`);
  assertSame(reportPath, report);
  validateLifecycle(lifecycle);
  console.log("SEIS public plugin lifecycle check passed.");
} else {
  writeFile(sourcePath, `${JSON.stringify(lifecycle, null, 2)}\n`);
  writeFile(reportPath, report);
  validateLifecycle(lifecycle);
  console.log(`Wrote ${sourcePath}`);
  console.log(`Wrote ${reportPath}`);
}

function validateLifecycle(contract) {
  const failures = [];
  if (contract.plugins.length !== 1 || contract.plugins[0]?.name !== "seis-ai-agent") failures.push("lifecycle must expose only the public SEIS-Agent plugin");
  if (contract.embeddedModules.length < 10) failures.push("lifecycle must track every current embedded SEIS source module");
  if (contract.publicDistribution?.publicPluginCount !== 1) failures.push("lifecycle public distribution must expose one public plugin");
  if (contract.publicDistribution?.embeddedModuleCount !== contract.embeddedModules.length) failures.push("lifecycle embedded module count must match its module matrix");
  if (contract.orchestrator !== "seis-ai-agent@seis-repo") failures.push("orchestrator must be seis-ai-agent@seis-repo");
  if (contract.freshTaskProofContract !== freshTaskProofPath) failures.push("lifecycle must point at the fresh-task proof contract");
  if (contract.freshTaskReloadEvidence !== freshTaskReloadEvidencePath) failures.push("lifecycle must point at the fresh-task reload evidence contract");
  if (contract.securityProvenanceReview !== securityProvenanceReviewPath) failures.push("lifecycle must point at the security/provenance review contract");
  if (contract.externalInstallProof !== externalInstallProofPath) failures.push("lifecycle must point at the external install proof contract");
  if (contract.canonicalizationContract !== canonicalizationPath) failures.push("lifecycle must point at the canonicalization contract");
  if (contract.independentRunnerEvidenceContract !== independentRunnerEvidenceContractPath) failures.push("lifecycle must point at the independent runner evidence contract");
  if (contract.unifiedSuite !== unifiedSuitePath) failures.push("lifecycle must point at the unified suite");
  if (contract.unifiedSuiteSummary?.componentCount < 10 || contract.unifiedSuiteSummary?.defaultInstallMode !== "single-public-plugin") failures.push("unified suite must keep every current component under one public install");
  if (contract.canonicalizationSummary?.effectivePluginCount !== 1) failures.push("canonicalization must keep one effective public plugin");
  if (contract.canonicalizationSummary?.legacyAliasCount !== 5) failures.push("canonicalization must keep five legacy aliases");
  if (!contract.releasePolicy.publicPreviewRequires.includes("fresh task reload proof")) failures.push("public preview must require fresh task reload proof");
  if (!contract.releasePolicy.publicPreviewRequires.includes("npm run check:seis-public-plugin-fresh-task-proof")) failures.push("public preview must require the fresh-task proof check");
  if (!contract.releasePolicy.publicPreviewRequires.includes("npm run check:seis-public-plugin-fresh-task-reload-evidence")) failures.push("public preview must require the fresh-task reload evidence check");
  if (!contract.releasePolicy.publicPreviewRequires.includes("npm run check:seis-public-plugin-security-provenance-review")) failures.push("public preview must require the security/provenance review check");
  if (!contract.releasePolicy.publicPreviewRequires.includes("npm run check:seis-public-plugin-external-install-proof")) failures.push("public preview must require the external install proof check");
  if (!contract.releasePolicy.publicPreviewRequires.includes("npm run check:seis-plugin-canonicalization")) failures.push("public preview must require the canonicalization check");
  if (!contract.releasePolicy.publicPreviewRequires.includes("npm run check:seis-unified-plugin-suite")) failures.push("public preview must require the unified suite check");
  if (!contract.releasePolicy.publicPreviewRequires.includes("npm run check:seis-public-plugin-independent-runner-evidence:recorded")) failures.push("public preview must require strict independent runner evidence");
  if (!contract.releasePolicy.publicPreviewRequires.includes("independent clean-runner or public installation proof")) failures.push("public preview must require independent installation proof");
  if (!contract.qualityGates.includes("npm run check:seis-public-plugin-fresh-task-reload-evidence")) failures.push("quality gates must include the fresh-task reload evidence check");
  if (!contract.qualityGates.includes("npm run check:seis-public-plugin-security-provenance-review")) failures.push("quality gates must include the security/provenance review check");
  if (!contract.qualityGates.includes("npm run check:seis-public-plugin-external-install-proof")) failures.push("quality gates must include the external install proof check");
  if (!contract.qualityGates.includes("npm run check:seis-plugin-canonicalization")) failures.push("quality gates must include the canonicalization check");
  if (!contract.qualityGates.includes("npm run check:seis-unified-plugin-suite")) failures.push("quality gates must include the unified suite check");
  if (!contract.qualityGates.includes("npm run check:seis-public-plugin-independent-runner-evidence-contract")) failures.push("quality gates must include the independent runner evidence contract check");
  if (!contract.qualityGates.includes("npm run check:seis-public-plugin-independent-runner-evidence")) failures.push("quality gates must include the default independent runner evidence check");
  if (contract.compatibility.secretsRequiredForCoreDemo !== false) failures.push("core demo must not require secrets");
  for (const plugin of contract.plugins) {
    if (plugin.license !== "MIT") failures.push(`${plugin.name} must be MIT`);
    if (!plugin.mcpServers.length) failures.push(`${plugin.name} must expose an MCP server`);
    if (!plugin.requiredGates.includes("mcp-smoke")) failures.push(`${plugin.name} must require MCP smoke`);
    if (!plugin.connectedToSeisAi) failures.push(`${plugin.name} must be connected to SEIS AI`);
  }
  for (const module of contract.embeddedModules) {
    if (module.license !== "MIT") failures.push(`${module.name} must be MIT`);
    if (module.canonicalInstallId !== "seis-ai-agent@seis-repo") failures.push(`${module.name} must resolve to SEIS-Agent`);
    if (!module.connectedToSeisAi) failures.push(`${module.name} must be connected to SEIS AI`);
  }
  if (failures.length) {
    console.error("SEIS public plugin lifecycle validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function renderReport(contract) {
  const rows = contract.plugins
    .map((plugin) => `| ${plugin.name} | ${plugin.role} | ${plugin.version} | ${plugin.releaseChannel} | ${plugin.supportTier} | ${plugin.mcpServers.join(", ")} |`)
    .join("\n");
  const phasesTable = contract.phases
    .map((phase) => `| ${phase.id} | ${phase.status} | ${phase.ownerLane} | ${phase.exitRule} |`)
    .join("\n");
  const moduleRows = contract.embeddedModules
    .map((module) => `| ${module.name} | ${module.role} | ${module.sourceModuleStatus} | ${module.version} | ${module.canonicalInstallId} |`)
    .join("\n");
  return `# SEIS Public Plugin Lifecycle

- Generated: ${contract.generatedAt}
- Status: ${contract.status}
- Public audience: ${contract.publicAudience}
- Orchestrator: ${contract.orchestrator}
- Current channel: ${contract.releasePolicy.currentChannel}

## Release Phases

| phase | status | owner lane | exit rule |
| --- | --- | --- | --- |
${phasesTable}

## Public Plugin Matrix

| plugin | role | version | channel | support tier | MCP servers |
| --- | --- | --- | --- | --- | --- |
${rows}

## Embedded Source Modules

| module | role | status | version | canonical install |
| --- | --- | --- | --- | --- |
${moduleRows}

## Canonical Alias Resolution

- Canonical marketplace: ${contract.canonicalizationSummary.canonicalMarketplace}
- Effective public plugins: ${contract.canonicalizationSummary.effectivePluginCount}
- Embedded source modules: ${contract.publicDistribution.embeddedModuleCount}
- Preserved legacy aliases: ${contract.canonicalizationSummary.legacyAliasCount}
- Personal marketplace mutation: ${contract.canonicalizationSummary.personalMarketplaceMutation ? "yes" : "no"}

## Single Public Install

- Suite file: ${contract.unifiedSuite}
- Release version: ${contract.unifiedSuiteSummary.releaseVersion}
- Component count: ${contract.unifiedSuiteSummary.componentCount}
- Default install mode: ${contract.unifiedSuiteSummary.defaultInstallMode}
- Source module install mode: ${contract.unifiedSuiteSummary.standaloneLaneInstallMode}

## Independent Runner Evidence

- Intake contract status: ${contract.independentRunnerEvidenceIntake.contractStatus}
- Current evidence status: ${contract.independentRunnerEvidenceIntake.evidenceStatus}
- Strict release gate: ${contract.independentRunnerEvidenceIntake.recordedGate}

## Public Preview Gates

${contract.releasePolicy.publicPreviewRequires.map((gate) => `- ${gate}`).join("\n")}

## Approval Boundary

Without explicit human approval, SEIS public plugin work must not push, merge,
tag, release, deploy, publish marketplace listings, run live SSH, use provider
credentials, or claim live cloud/provider connectivity.

## Quality Gates

\`\`\`bash
${contract.qualityGates.join("\n")}
\`\`\`
`;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function readOptionalJson(file) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function summarizeExternalInstallProof(proof) {
  if (!proof) {
    return {
      status: "missing",
      artifactStagingOk: false,
      independentRunnerEvidenceStatus: "missing",
      publicReleaseAllowed: false,
    };
  }
  return {
    status: proof.status,
    artifactStagingOk: proof.repoLocalArtifactStaging?.ok === true,
    independentRunnerEvidenceStatus: proof.externalCleanRunnerEvidence?.status || "missing",
    publicReleaseAllowed: proof.publicReleaseAllowed === true,
  };
}

function summarizeCanonicalization(contract) {
  return {
    status: contract?.status || "missing",
    ready:
      contract?.status === "active-non-destructive-canonicalization" &&
      contract?.effectivePluginCount === 1 &&
      contract?.embeddedModuleCount >= 10 &&
      contract?.legacyAliasCount === 5 &&
      contract?.globalMarketplaceMutation?.performed === false,
    canonicalMarketplace: contract?.canonicalMarketplace || null,
    canonicalOrchestrator: contract?.canonicalOrchestrator || null,
    effectivePluginCount: contract?.effectivePluginCount ?? null,
    embeddedModuleCount: contract?.embeddedModuleCount ?? null,
    legacyAliasCount: contract?.legacyAliasCount ?? null,
    duplicateResolutionMode: contract?.duplicateResolutionMode || null,
    personalMarketplaceMutation: contract?.globalMarketplaceMutation?.performed === true,
  };
}

function summarizeUnifiedSuite(contract) {
  return {
    status: contract?.status || "missing",
    releaseVersion: contract?.releaseVersion || null,
    componentCount: contract?.componentCount ?? null,
    publicPluginCount: contract?.publicDistribution?.publicPluginCount ?? null,
    embeddedModuleCount: contract?.publicDistribution?.embeddedModuleCount ?? null,
    defaultInstallMode: contract?.canonicalInstall?.defaultInstallMode ?? null,
    standaloneLaneInstallMode: contract?.compatibility?.standaloneLaneInstallMode ?? null,
    ready:
      contract?.status === "active-single-public-plugin" &&
      contract?.componentCount >= 10 &&
      contract?.publicDistribution?.publicPluginCount === 1 &&
      contract?.publicDistribution?.embeddedModuleCount >= 10 &&
      contract?.canonicalInstall?.installId === "seis-ai-agent@seis-repo" &&
      contract?.canonicalInstall?.defaultInstallMode === "single-public-plugin" &&
      contract?.compatibility?.legacyAliasCount === 5 &&
      contract?.compatibility?.personalMarketplaceMutation === false,
  };
}

function summarizeIndependentRunnerEvidenceIntake(contract, externalProofSummary) {
  const evidenceStatus = externalProofSummary.independentRunnerEvidenceStatus || "missing";
  return {
    contractStatus: contract?.status || "missing",
    evidenceStatus,
    status:
      evidenceStatus === "recorded-independent-clean-runner-evidence"
        ? "recorded-human-approval-pending"
        : evidenceStatus === "invalid-independent-runner-evidence"
          ? "invalid-evidence-recorded"
          : "awaiting-independent-clean-runner-evidence",
    recordedGate: contract?.validation?.strictRecordedEvidenceGate || "npm run check:seis-public-plugin-independent-runner-evidence:recorded",
  };
}

function writeFile(file, body) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), body);
}

function assertSame(file, expected) {
  const actualPath = path.join(root, file);
  const actual = fs.existsSync(actualPath) ? fs.readFileSync(actualPath, "utf8") : "";
  if (actual !== expected) {
    console.error(`${file} is out of date. Run: npm run automation:seis-public-plugin-lifecycle`);
    process.exit(1);
  }
}
