#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "content/development/seis-public-plugin-fresh-task-proof.json";
const reportPath = "reports/seis-public-plugin-fresh-task-proof.md";
const familyPath = "content/development/seis-public-plugin-family.json";
const lifecyclePath = "content/development/seis-public-plugin-lifecycle.json";
const integrationPath = "content/development/seis-agent-plugin-integration.json";
const reloadEvidencePath = "content/development/seis-public-plugin-fresh-task-reload-evidence.json";
const reloadEvidenceReportPath = "reports/seis-public-plugin-fresh-task-reload-evidence.md";
const securityReviewPath = "content/development/seis-public-plugin-security-provenance-review.json";
const securityReviewReportPath = "reports/seis-public-plugin-security-provenance-review.md";
const canonicalizationPath = "content/development/seis-plugin-canonicalization.json";
const canonicalizationReportPath = "reports/seis-plugin-canonicalization.md";
const independentRunnerEvidenceContractPath = "content/development/seis-public-plugin-independent-runner-evidence-contract.json";
const independentRunnerEvidenceContractReportPath = "reports/seis-public-plugin-independent-runner-evidence-contract.md";
const unifiedSuitePath = "plugins/seis-ai-agent/assets/unified-suite.json";

const family = readJson(familyPath);
const expectedPluginCount = (family.publicPlugins || []).length;
const expectedEmbeddedModuleCount = (family.embeddedModules || family.plugins || []).length;
const lifecycle = readJson(lifecyclePath);
const integration = readJson(integrationPath);
const reloadEvidence = readOptionalJson(reloadEvidencePath);
const reloadSummary = summarizeReloadEvidence(reloadEvidence);
const securityReview = readOptionalJson(securityReviewPath);
const securitySummary = summarizeSecurityReview(securityReview);
const canonicalization = readJson(canonicalizationPath);
const independentRunnerEvidenceContract = readJson(independentRunnerEvidenceContractPath);
const unifiedSuite = readJson(unifiedSuitePath);

const plugins = (family.publicPlugins || []).map((plugin) => ({
  name: plugin.name,
  installId: plugin.installId,
  role: plugin.role,
  sourcePath: plugin.sourcePath,
  connectedToSeisAi: plugin.connectedToSeisAi === true,
  freshTaskRequiredEvidence: [
    `${plugin.name} is visible as an installed public plugin in a newly opened Codex task`,
    `${plugin.name} MCP server initializes in the newly opened task`,
    `${plugin.name} representative status or plan tool returns without an MCP protocol error`,
  ],
}));
const embeddedModules = (family.embeddedModules || family.plugins || []).map((module) => ({
  name: module.name,
  sourcePath: module.sourcePath,
  canonicalInstallId: module.canonicalInstallId || "seis-ai-agent@seis-repo",
  connectedToSeisAi: module.connectedToSeisAi === true,
}));

const contract = {
  id: "seis-public-plugin-fresh-task-proof",
  version: 1,
  generatedAt,
  status: "pending-fresh-task-reload-proof",
  decision: "not-ready-for-public-preview",
  sourcePath,
  reportPath,
  publicPluginFamily: familyPath,
  lifecycleContract: lifecyclePath,
  integrationManifest: integrationPath,
  reloadEvidencePath,
  reloadEvidenceReportPath,
  securityReviewPath,
  securityReviewReportPath,
  canonicalizationPath,
  canonicalizationReportPath,
  independentRunnerEvidenceContractPath,
  independentRunnerEvidenceContractReportPath,
  unifiedSuitePath,
  publicReleaseAllowed: false,
  purpose:
    "Define the evidence required to prove the single public SEIS-Agent plugin and its embedded source modules survive a fresh Codex task reload before any public-preview or release claim.",
  publicDistribution: {
    publicPluginCount: expectedPluginCount,
    embeddedModuleCount: expectedEmbeddedModuleCount,
    canonicalInstallId: "seis-ai-agent@seis-repo",
  },
  localProofAlreadyAvailable: {
    repoContract: "npm run check:seis-public-plugin-family",
    lifecycleContract: "npm run check:seis-public-plugin-lifecycle",
    runtimeIntegration: "npm run check:seis-agent-plugin-integration",
    installedCacheAndMcp: "npm run check:seis-public-plugin-install-smoke:local:mcp",
    cleanArtifactStaging: "npm run check:seis-public-plugin-external-install-proof",
    canonicalization: "npm run check:seis-plugin-canonicalization",
    unifiedSuite: "npm run check:seis-unified-plugin-suite",
    independentRunnerEvidenceIntake: "npm run check:seis-public-plugin-independent-runner-evidence",
    seisAiPackage: "npm test --prefix packages/seis-ai",
    freshTaskReloadEvidence: "npm run check:seis-public-plugin-fresh-task-reload-evidence",
    securityProvenanceReview: "npm run check:seis-public-plugin-security-provenance-review",
  },
  reloadEvidence: reloadSummary,
  securityProvenanceReview: securitySummary,
  freshTaskReloadProtocol: {
    trigger: "Open a new Codex task after the public plugin family is installed in the local Codex plugin cache.",
    requiredTaskProperties: [
      "The task starts after the plugin cache contains the public seis-ai-agent@seis-repo plugin.",
      "The task does not rely on this thread's already loaded tool surface.",
      "The task can inspect the same SEIS checkout and local Codex plugin cache.",
    ],
    requiredCommands: [
      "npm run check:seis-public-plugin-install-smoke:local:mcp",
      "npm run check:seis-plugin-canonicalization",
      "npm run check:seis-unified-plugin-suite",
      "npm run check:seis-agent-plugin-integration",
      "npm test --prefix packages/seis-ai",
    ],
    requiredRuntimeObservations: [
      "SEIS AI exposes seis_public_plugin_family in the tool loop.",
      "The SEIS MCP server lists 35 tools, 3 prompts, and 31 resources.",
      `seis_public_plugin_family returns publicPluginCount=${expectedPluginCount}, embeddedModuleCount=${expectedEmbeddedModuleCount}, effectivePluginCount=${expectedPluginCount}, legacyAliasCount=5, connectedPluginCount=${expectedPluginCount}, connectedModuleCount=${expectedEmbeddedModuleCount}, runtimeConnected=true, and the single public suite default install.`,
      "The installed SEIS-Agent MCP server initializes, lists required tools, and answers representative embedded-lane calls.",
    ],
  },
  requiredEvidenceToCloseGate: [
    {
      id: "fresh-task-id",
      status: reloadSummary.taskIdRecorded ? "recorded" : "missing",
      requirement: "Record the new Codex task/thread identifier used for reload proof.",
      evidence: reloadSummary.taskIdRecorded ? reloadEvidencePath : null,
    },
    {
      id: "fresh-task-start-time",
      status: reloadSummary.taskStartRecorded ? "recorded" : "missing",
      requirement: "Record the fresh task start time after local plugin cache installation.",
      evidence: reloadSummary.taskStartRecorded ? reloadEvidencePath : null,
    },
    {
      id: "fresh-task-install-smoke-output",
      status: reloadSummary.installSmokeRecorded ? "recorded" : "missing",
      requirement: "Attach or summarize the passing local installed-cache MCP smoke output from the fresh task.",
      evidence: reloadSummary.installSmokeRecorded ? reloadEvidenceReportPath : null,
    },
    {
      id: "fresh-task-seis-ai-output",
      status: reloadSummary.seisAiBridgeRecorded ? "recorded" : "missing",
      requirement: "Attach or summarize the SEIS AI public-family status output from the fresh task.",
      evidence: reloadSummary.seisAiBridgeRecorded ? reloadEvidencePath : null,
    },
    {
      id: "fresh-task-mcp-inventory",
      status: reloadSummary.mcpInventoryRecorded ? "recorded" : "missing",
      requirement: "Record the fresh task MCP inventory showing the public plugin family and SEIS AI bridge.",
      evidence: reloadSummary.mcpInventoryRecorded ? reloadEvidenceReportPath : null,
    },
  ],
  blockers: buildBlockers(reloadSummary, securitySummary),
  approvalBoundary: {
    publicPreview: "blocked_until_canonicalization_fresh_task_reload_security_provenance_strict_independent_install_and_human_approval",
    allowedNow: [
      "repo-local docs",
      "repo-local JSON contracts",
      "repo-local validators",
    "local installed-cache smoke tests",
    "local MCP smoke tests",
    "fresh-task reload evidence capture",
    "repo-local security/provenance review",
    "canonical alias resolution",
    "independent-runner evidence intake contract",
    "one-file unified suite validation",
  ],
    approvalRequiredFor: lifecycle.releasePolicy.forbiddenWithoutApproval,
  },
  acceptanceCriteria: [
    `The ${expectedPluginCount} current public plugin and all ${expectedEmbeddedModuleCount} embedded source modules are visible in the fresh task context.`,
    "The fresh task can run the local installed-cache MCP smoke successfully.",
    "The fresh task can call or verify the SEIS AI public plugin family bridge.",
    "The proof records distinguish local proof from public release approval.",
    "The proof records do not contain secrets, credentials, private keys, cookies, or provider tokens.",
  ],
  plugins,
  embeddedModules,
  qualityGates: [
    "npm run check:seis-public-plugin-fresh-task-proof",
    "npm run check:seis-public-plugin-fresh-task-reload-evidence",
    "npm run check:seis-public-plugin-security-provenance-review",
    "npm run check:seis-public-plugin-external-install-proof",
    "npm run check:seis-plugin-canonicalization",
    "npm run check:seis-unified-plugin-suite",
    "npm run check:seis-public-plugin-independent-runner-evidence-contract",
    "npm run check:seis-public-plugin-independent-runner-evidence",
    "npm run check:seis-public-plugin-install-smoke:local:mcp",
    "npm run check:seis-agent-plugin-integration",
    "npm test --prefix packages/seis-ai",
  ],
  completionRule:
    "This contract is complete for internal review when it validates canonical alias resolution, the fresh-task proof protocol, clean artifact staging, and any recorded reload evidence while keeping publicReleaseAllowed=false until security/provenance review, strict independent installation evidence, and human approval are recorded.",
};

const report = renderReport(contract);

if (checkMode) {
  assertSame(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  assertSame(reportPath, report);
  validateContract(contract, { family, lifecycle, integration, canonicalization, independentRunnerEvidenceContract, unifiedSuite });
  console.log("SEIS public plugin fresh-task proof check passed.");
} else {
  writeFile(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  writeFile(reportPath, report);
  validateContract(contract, { family, lifecycle, integration, canonicalization, independentRunnerEvidenceContract, unifiedSuite });
  console.log(`Wrote ${sourcePath}`);
  console.log(`Wrote ${reportPath}`);
}

function validateContract(contract, { family, lifecycle, integration, canonicalization, independentRunnerEvidenceContract, unifiedSuite }) {
  const failures = [];
  if (contract.status !== "pending-fresh-task-reload-proof") failures.push("fresh-task proof status must remain pending");
  if (contract.publicReleaseAllowed !== false) failures.push("public release must remain blocked by this proof contract");
  if (expectedPluginCount !== 1) failures.push("public plugin family must expose only SEIS-Agent");
  if (expectedEmbeddedModuleCount < 10) failures.push("public plugin family must retain every current source module");
  if ((contract.plugins || []).length !== expectedPluginCount) failures.push("fresh-task proof must track the public SEIS-Agent plugin");
  if ((contract.embeddedModules || []).length !== expectedEmbeddedModuleCount) failures.push("fresh-task proof must track every embedded source module");
  if (!lifecycle.releasePolicy?.publicPreviewRequires?.includes("fresh task reload proof")) failures.push("lifecycle must require fresh task reload proof");
  if (!lifecycle.releasePolicy?.publicPreviewRequires?.includes("npm run check:seis-public-plugin-independent-runner-evidence:recorded")) failures.push("lifecycle must require strict independent runner evidence");
  if (integration.runtimeIntegration?.publicPluginFamilyTool !== "seis_public_plugin_family") failures.push("integration must expose the public plugin family tool");
  if (integration.canonicalAgent?.installMode !== "single-public-plugin") failures.push("integration must use the single public plugin install mode");
  if (integration.unifiedPluginSuite?.canonicalInstallId !== "seis-ai-agent@seis-repo") failures.push("integration must expose SEIS-Agent as unified suite canonical install");
  if (integration.lifecycle?.canonicalizationContract !== canonicalizationPath) failures.push("integration must expose the canonicalization contract");
  if (canonicalization?.effectivePluginCount !== 1 || canonicalization?.embeddedModuleCount < expectedEmbeddedModuleCount || canonicalization?.legacyAliasCount !== 5) failures.push("canonicalization must report one public plugin, every embedded module, and five aliases");
  if (unifiedSuite?.canonicalInstall?.installId !== "seis-ai-agent@seis-repo" || unifiedSuite?.canonicalInstall?.defaultInstallMode !== "single-public-plugin" || unifiedSuite?.componentCount < expectedEmbeddedModuleCount) failures.push("unified suite must expose one public SEIS-Agent install for every current component");
  if (independentRunnerEvidenceContract?.validation?.strictRecordedEvidenceGate !== "npm run check:seis-public-plugin-independent-runner-evidence:recorded") failures.push("independent runner intake must expose the strict evidence gate");
  if (!contract.freshTaskReloadProtocol.requiredCommands.includes("npm run check:seis-public-plugin-install-smoke:local:mcp")) failures.push("fresh-task proof must require local MCP install smoke");
  if (!contract.freshTaskReloadProtocol.requiredCommands.includes("npm run check:seis-plugin-canonicalization")) failures.push("fresh-task proof must require canonicalization validation");
  if (!contract.freshTaskReloadProtocol.requiredCommands.includes("npm run check:seis-unified-plugin-suite")) failures.push("fresh-task proof must require unified suite validation");
  if (!contract.freshTaskReloadProtocol.requiredRuntimeObservations.some((item) => item.includes("seis_public_plugin_family"))) failures.push("fresh-task proof must require SEIS AI public-family observation");
  if (!contract.localProofAlreadyAvailable.freshTaskReloadEvidence) failures.push("fresh-task proof must expose the reload evidence check");
  if (!contract.localProofAlreadyAvailable.securityProvenanceReview) failures.push("fresh-task proof must expose the security/provenance check");
  if (!contract.localProofAlreadyAvailable.cleanArtifactStaging) failures.push("fresh-task proof must expose the clean artifact staging check");
  if (!contract.qualityGates.includes("npm run check:seis-public-plugin-fresh-task-reload-evidence")) failures.push("fresh-task proof must include the reload evidence quality gate");
  if (!contract.qualityGates.includes("npm run check:seis-public-plugin-security-provenance-review")) failures.push("fresh-task proof must include the security/provenance quality gate");
  if (!contract.qualityGates.includes("npm run check:seis-public-plugin-external-install-proof")) failures.push("fresh-task proof must include the external install proof quality gate");
  if (!contract.qualityGates.includes("npm run check:seis-plugin-canonicalization")) failures.push("fresh-task proof must include the canonicalization quality gate");
  if (!contract.qualityGates.includes("npm run check:seis-unified-plugin-suite")) failures.push("fresh-task proof must include the unified suite quality gate");
  if (!contract.qualityGates.includes("npm run check:seis-public-plugin-independent-runner-evidence-contract")) failures.push("fresh-task proof must include the independent runner contract quality gate");
  if (!["recorded-local-fresh-task-evidence", "incomplete-local-fresh-task-evidence", "missing"].includes(contract.reloadEvidence.status)) failures.push("reload evidence status is invalid");
  if (!["repo-local-security-provenance-reviewed", "blocked-by-security-provenance-findings", "missing"].includes(contract.securityProvenanceReview.status)) failures.push("security/provenance review status is invalid");
  if (!contract.requiredEvidenceToCloseGate.every((item) => ["missing", "recorded"].includes(item.status))) failures.push("fresh-task evidence statuses must be missing or recorded");
  if (contract.reloadEvidence.status === "recorded-local-fresh-task-evidence") {
    if (!contract.requiredEvidenceToCloseGate.every((item) => item.status === "recorded")) failures.push("recorded reload evidence must close every fresh-task evidence item");
    if (!contract.blockers.some((blocker) => blocker.includes("Human approval"))) failures.push("human approval must remain a blocker");
  }
  if (contract.securityProvenanceReview.status === "repo-local-security-provenance-reviewed") {
    if (contract.securityProvenanceReview.secretFindingCount !== 0) failures.push("security/provenance review must have zero secret findings");
    if (contract.securityProvenanceReview.blockingFindingCount !== 0) failures.push("security/provenance review must have zero blocking findings");
  }
  for (const plugin of contract.plugins || []) {
    if (!plugin.connectedToSeisAi) failures.push(`${plugin.name} must remain connected to SEIS AI`);
    if (!plugin.freshTaskRequiredEvidence?.length) failures.push(`${plugin.name} must define fresh-task evidence`);
  }
  for (const module of contract.embeddedModules || []) {
    if (!module.connectedToSeisAi) failures.push(`${module.name} must remain connected to SEIS AI`);
    if (module.canonicalInstallId !== "seis-ai-agent@seis-repo") failures.push(`${module.name} must resolve to SEIS-Agent`);
  }
  if (failures.length) {
    console.error("SEIS public plugin fresh-task proof validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function renderReport(contract) {
  const evidenceRows = contract.requiredEvidenceToCloseGate
    .map((item) => `| ${item.id} | ${item.status} | ${item.requirement} | ${item.evidence || "n/a"} |`)
    .join("\n");
  const pluginRows = contract.plugins
    .map((plugin) => `| ${plugin.name} | ${plugin.installId} | ${plugin.role} | ${plugin.connectedToSeisAi ? "yes" : "no"} |`)
    .join("\n");
  const moduleRows = contract.embeddedModules
    .map((module) => `| ${module.name} | ${module.canonicalInstallId} | ${module.connectedToSeisAi ? "yes" : "no"} |`)
    .join("\n");
  return `# SEIS Public Plugin Fresh Task Proof

- Generated: ${contract.generatedAt}
- Status: ${contract.status}
- Decision: ${contract.decision}
- Public release allowed: ${contract.publicReleaseAllowed ? "yes" : "no"}

## Local Proof Already Available

${Object.entries(contract.localProofAlreadyAvailable).map(([key, command]) => `- ${key}: \`${command}\``).join("\n")}

## Fresh Task Reload Protocol

Trigger: ${contract.freshTaskReloadProtocol.trigger}

Required commands:

\`\`\`bash
${contract.freshTaskReloadProtocol.requiredCommands.join("\n")}
\`\`\`

Required runtime observations:

${contract.freshTaskReloadProtocol.requiredRuntimeObservations.map((item) => `- ${item}`).join("\n")}

## Fresh Task Reload Evidence

- Evidence status: ${contract.reloadEvidence.status}
- Task/thread id recorded: ${contract.reloadEvidence.taskIdRecorded ? "yes" : "no"}
- Command output recorded: ${contract.reloadEvidence.commandOutputRecorded ? "yes" : "no"}
- MCP inventory recorded: ${contract.reloadEvidence.mcpInventoryRecorded ? "yes" : "no"}
- SEIS AI bridge recorded: ${contract.reloadEvidence.seisAiBridgeRecorded ? "yes" : "no"}
- Evidence contract: \`${contract.reloadEvidencePath}\`
- Evidence report: \`${contract.reloadEvidenceReportPath}\`

## Security Provenance Review

- Review status: ${contract.securityProvenanceReview.status}
- Secret findings: ${contract.securityProvenanceReview.secretFindingCount}
- Blocking findings: ${contract.securityProvenanceReview.blockingFindingCount}
- Hygiene findings: ${contract.securityProvenanceReview.hygieneFindingCount}
- Review contract: \`${contract.securityReviewPath}\`
- Review report: \`${contract.securityReviewReportPath}\`

## Required Evidence To Close Gate

| evidence | status | requirement | source |
| --- | --- | --- | --- |
${evidenceRows}

## Public Plugin Coverage

| plugin | install id | role | connected to SEIS AI |
| --- | --- | --- | --- |
${pluginRows}

## Embedded Source Module Coverage

| module | canonical install | connected to SEIS AI |
| --- | --- | --- |
${moduleRows}

## Current Blockers

${contract.blockers.map((blocker) => `- ${blocker}`).join("\n")}

## Quality Gates

\`\`\`bash
${contract.qualityGates.join("\n")}
\`\`\`

## Decision

NO-GO for public preview until the required fresh-task evidence, security and
provenance review, and human approval are recorded.
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

function summarizeReloadEvidence(evidence) {
  if (!evidence) {
    return {
      status: "missing",
      taskIdRecorded: false,
      taskStartRecorded: false,
      commandOutputRecorded: false,
      installSmokeRecorded: false,
      seisAiBridgeRecorded: false,
      mcpInventoryRecorded: false,
      packageTestsRecorded: false,
      publicReleaseAllowed: false,
    };
  }
  const installSmokeRecorded =
    evidence.commands?.installSmoke?.ok === true &&
    evidence.mcpInventory?.publicPluginCount === expectedPluginCount &&
    evidence.mcpInventory?.installedCount === expectedPluginCount &&
    evidence.mcpInventory?.embeddedModuleCount === expectedEmbeddedModuleCount &&
    evidence.mcpInventory?.mcpSmokePassed === true;
  const packageTestsRecorded = evidence.commands?.packageTests?.ok === true && evidence.packageTestSummary?.fail === 0;
  const agentIntegrationRecorded = evidence.commands?.agentIntegration?.ok === true;
  const seisAiBridgeRecorded =
    evidence.seisAiBridge?.runtimeConnected === true &&
    evidence.seisAiBridge?.publicPluginCount === expectedPluginCount &&
    evidence.seisAiBridge?.connectedPluginCount === expectedPluginCount &&
    evidence.seisAiBridge?.embeddedModuleCount === expectedEmbeddedModuleCount &&
    evidence.seisAiBridge?.connectedModuleCount === expectedEmbeddedModuleCount;
  const mcpInventoryRecorded = installSmokeRecorded && Array.isArray(evidence.mcpInventory?.plugins) && evidence.mcpInventory.plugins.length === expectedPluginCount;
  const taskIdRecorded = Boolean(evidence.task?.threadId);
  const taskStartRecorded = Boolean(evidence.task?.observedDate);
  const commandOutputRecorded = installSmokeRecorded && agentIntegrationRecorded && packageTestsRecorded;
  const status =
    taskIdRecorded &&
    taskStartRecorded &&
    commandOutputRecorded &&
    mcpInventoryRecorded &&
    seisAiBridgeRecorded &&
    evidence.publicReleaseAllowed === false
      ? "recorded-local-fresh-task-evidence"
      : "incomplete-local-fresh-task-evidence";
  return {
    status,
    taskIdRecorded,
    taskStartRecorded,
    commandOutputRecorded,
    installSmokeRecorded,
    seisAiBridgeRecorded,
    mcpInventoryRecorded,
    packageTestsRecorded,
    threadIdSource: evidence.task?.idSource || null,
    observedDate: evidence.task?.observedDate || null,
    publicReleaseAllowed: evidence.publicReleaseAllowed === true,
  };
}

function summarizeSecurityReview(review) {
  if (!review) {
    return {
      status: "missing",
      recorded: false,
      secretFindingCount: null,
      blockingFindingCount: null,
      hygieneFindingCount: null,
      publicReleaseAllowed: false,
    };
  }
  return {
    status: review.status,
    recorded: review.status === "repo-local-security-provenance-reviewed",
    secretFindingCount: review.aggregate?.secretFindingCount ?? null,
    blockingFindingCount: review.aggregate?.blockingFindingCount ?? null,
    hygieneFindingCount: review.aggregate?.hygieneFindingCount ?? null,
    publicReleaseAllowed: review.publicReleaseAllowed === true,
  };
}

function buildBlockers(summary, securitySummary) {
  const blockers = [];
  if (!summary.taskIdRecorded) blockers.push("No fresh Codex task id has been recorded.");
  if (!summary.commandOutputRecorded) blockers.push("No fresh-task command output has been recorded.");
  if (!summary.mcpInventoryRecorded) blockers.push("No fresh-task MCP inventory has been recorded.");
  if (!summary.seisAiBridgeRecorded) blockers.push("No fresh-task SEIS AI bridge output has been recorded.");
  if (!securitySummary.recorded) {
    blockers.push("Security and provenance review for public preview has not passed.");
  }
  blockers.push("External clean-runner or public package installation proof has not been recorded.");
  blockers.push("Human approval for public preview, release, publish, push, merge, tag, deploy, SSH, or live provider access has not been recorded.");
  return blockers;
}

function writeFile(file, body) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), body);
}

function assertSame(file, expected) {
  const filePath = path.join(root, file);
  const actual = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (actual !== expected) {
    console.error(`${file} is out of date. Run: npm run automation:seis-public-plugin-fresh-task-proof`);
    process.exit(1);
  }
}
