#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const shouldWrite = Boolean(args.write);
const shouldCheck = Boolean(args.check);

const paths = {
  contract: "content/development/seis-plugin-mcp-ten-year-continuity-map.json",
  secondBrain: "content/development/seis-second-brain-system.json",
  mcpRuntime: "content/development/seis-ai-core-mcp-runtime-contract.json",
  localAiRuntimeMatrix: "content/development/seis-local-ai-runtime-matrix.json",
  freshCloneReadinessPlan: "content/development/seis-agi-github-fresh-clone-readiness-plan.json",
  bigTechInventory: "content/development/seis-big-tech-mcp-skill-inventory.json",
  pluginSkillMap: "content/development/plugin-skill-capability-map.json",
  connectorRegistry: "content/development/connector-capability-registry.json",
  outputJson: typeof args.output === "string" ? args.output : "reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.json",
  outputMarkdown: typeof args.markdown === "string" ? args.markdown : "reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.md",
  platformDoc: typeof args.doc === "string" ? args.doc : "docs/platform/seis-plugin-mcp-ten-year-continuity-map.md"
};

const failures = [];

const contract = readJson(paths.contract, "Plugin/MCP ten-year continuity contract");
const secondBrain = readJson(paths.secondBrain, "Second Brain contract");
const mcpRuntime = readJson(paths.mcpRuntime, "MCP runtime contract");
const localAiRuntimeMatrix = readJson(paths.localAiRuntimeMatrix, "local AI runtime matrix");
const freshCloneReadinessPlan = readJson(paths.freshCloneReadinessPlan, "AGI GitHub fresh-clone readiness plan");
const bigTechInventory = readJson(paths.bigTechInventory, "Big Tech MCP and skill inventory");
const pluginSkillMap = readJson(paths.pluginSkillMap, "plugin skill capability map");
const connectorRegistry = readJson(paths.connectorRegistry, "connector capability registry");

const report = buildReport(new Date().toISOString());
validateReport(report, "generated Plugin/MCP ten-year continuity report");

if (shouldWrite) {
  writeJson(paths.outputJson, report);
  writeText(paths.outputMarkdown, renderMarkdown(report));
  writeText(paths.platformDoc, renderPlatformDoc(report));
}

if (shouldCheck) {
  ensureFile(paths.outputJson, "Plugin/MCP ten-year continuity JSON artifact");
  ensureFile(paths.outputMarkdown, "Plugin/MCP ten-year continuity Markdown artifact");
  ensureFile(paths.platformDoc, "Plugin/MCP ten-year continuity platform doc");
  const existingJson = readJson(paths.outputJson, "Plugin/MCP ten-year continuity JSON artifact");
  const existingMarkdown = readText(paths.outputMarkdown, "Plugin/MCP ten-year continuity Markdown artifact");
  const existingPlatformDoc = readText(paths.platformDoc, "Plugin/MCP ten-year continuity platform doc");
  if (existingJson) validateReport(existingJson, "existing Plugin/MCP ten-year continuity artifact");
  for (const phrase of [
    "SEIS Plugin/MCP Ten-Year Continuity Map",
    "NO-GO-live-activation-not-approved",
    "remoteMcpTrustGranted: false",
    "providerCredentialUsePerformed: false",
    "externalAiPromptOrFileSendPerformed: false",
    "pluginInstallOrPublishPerformed: false",
    "sshOrDeploymentPerformed: false",
    "githubMutationPerformed: false",
    "No live connector write, remote MCP trust, provider credential use, external AI prompt/file send, plugin install/publish, SSH, deployment, billing, cloud spend, or GitHub mutation is performed"
  ]) {
    ensure(existingMarkdown.includes(phrase), `Markdown artifact missing phrase: ${phrase}.`);
  }
  for (const phrase of [
    "SEIS Plugin/MCP Ten-Year Continuity Map",
    "Planning-only",
    "Hard Stops",
    "Validation"
  ]) {
    ensure(existingPlatformDoc.includes(phrase), `Platform doc missing phrase: ${phrase}.`);
  }
}

if (failures.length > 0) {
  console.error("SEIS Plugin/MCP ten-year continuity map check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (shouldWrite) {
  console.log(`Wrote ${paths.outputJson}`);
  console.log(`Wrote ${paths.outputMarkdown}`);
  console.log(`Wrote ${paths.platformDoc}`);
} else if (shouldCheck) {
  console.log("SEIS Plugin/MCP ten-year continuity map check passed.");
} else {
  console.log(JSON.stringify(report, null, 2));
}

function buildReport(generatedAt) {
  const connectorCount = Array.isArray(connectorRegistry?.connectors) ? connectorRegistry.connectors.length : 0;
  const pluginCapabilityCount = Array.isArray(pluginSkillMap?.capabilities) ? pluginSkillMap.capabilities.length : 0;
  const mcpVendorSurfaceCount = Array.isArray(bigTechInventory?.current_session_mcp_surfaces) ? bigTechInventory.current_session_mcp_surfaces.length : 0;
  const installedSkillCount = Number(bigTechInventory?.installed_skill_pass?.installed_skill_count || 0);
  const installedAiProfiles = secondBrain?.installedAiProfiles || [];
  const managedSubAgentLanes = secondBrain?.managedSubAgentLanes || [];
  const autonomousAgentRoster = secondBrain?.autonomousAgentRoster || [];
  const localAiRuntimeRows = localAiRuntimeMatrix?.runtimeRows || [];
  const localAiHardwareRuntimeLanes = localAiRuntimeMatrix?.hardwareRuntimeLanes || [];
  const freshCloneReadinessChecks = freshCloneReadinessPlan?.readinessChecks || [];

  const derivedCounts = {
    horizonYears: contract?.horizon?.years,
    reviewWindowMonths: contract?.horizon?.reviewWindowMonths,
    reviewWindowCount: contract?.horizon?.reviewWindowCount,
    mcpToolCount: mcpRuntime?.toolCount,
    mcpResourceCount: mcpRuntime?.resourceCount,
    mcpPromptCount: mcpRuntime?.promptCount,
    installedAiProfileCount: installedAiProfiles.length,
    managedSubAgentLaneCount: managedSubAgentLanes.length,
    autonomousAgentRosterCount: autonomousAgentRoster.length,
    localAiRuntimeRowCount: localAiRuntimeRows.length,
    localAiHardwareRuntimeLaneCount: localAiHardwareRuntimeLanes.length,
    freshCloneReadinessCheckCount: freshCloneReadinessChecks.length,
    freshCloneEveryoneReadyBlockerCount: freshCloneReadinessChecks.filter((item) => item.blocksEveryoneReady).length,
    connectorCount,
    pluginCapabilityCount,
    mcpVendorSurfaceCount,
    installedSkillCount
  };

  return {
    id: contract?.id,
    title: "SEIS Plugin/MCP Ten-Year Continuity Map",
    generatedAt,
    status: contract?.status,
    mode: contract?.mode,
    decision: "NO-GO-live-activation-not-approved",
    sourcePaths: {
      contract: paths.contract,
      secondBrain: paths.secondBrain,
      mcpRuntime: paths.mcpRuntime,
      localAiRuntimeMatrix: paths.localAiRuntimeMatrix,
      freshCloneReadinessPlan: paths.freshCloneReadinessPlan,
      bigTechInventory: paths.bigTechInventory,
      pluginSkillMap: paths.pluginSkillMap,
      connectorRegistry: paths.connectorRegistry
    },
    safeInterpretation: contract?.safeInterpretation,
    liveBoundary: contract?.liveBoundary,
    horizon: contract?.horizon,
    derivedCounts,
    trackedMetrics: contract?.trackedMetrics || [],
    reviewEvidence: contract?.reviewEvidence || [],
    hardStops: contract?.hardStops || [],
    phases: contract?.phases || [],
    sourceSnapshot: {
      mcpRuntimeStatus: mcpRuntime?.status,
      mcpTransport: mcpRuntime?.transport,
      mcpFallbackRuntime: mcpRuntime?.fallbackRuntime,
      localAiRuntimeStatus: localAiRuntimeMatrix?.status,
      localAiModelInstallAllowed: localAiRuntimeMatrix?.approvedToday?.modelInstall ?? false,
      localAiInferenceAllowed: localAiRuntimeMatrix?.approvedToday?.localInference ?? false,
      localAiTrainingAllowed: Boolean(localAiRuntimeMatrix?.approvedToday?.sftTraining || localAiRuntimeMatrix?.approvedToday?.loraTraining || localAiRuntimeMatrix?.approvedToday?.foundationPretraining),
      localAiAgiClaimAllowed: localAiRuntimeMatrix?.publicClaims?.canClaimAGI ?? false,
      freshClonePlanStatus: freshCloneReadinessPlan?.status,
      freshCloneVerified: freshCloneReadinessPlan?.publicClaimBoundary?.canClaimFreshCloneVerified ?? false,
      everyoneReadyClaimAllowed: freshCloneReadinessPlan?.publicClaimBoundary?.canClaimEveryoneReady ?? false,
      freshCloneAgiClaimAllowed: freshCloneReadinessPlan?.publicClaimBoundary?.canClaimRealAgi ?? false,
      aiGithubReadinessChain: freshCloneReadinessPlan?.oneCommandCandidate?.command || "npm run check:seis-ai-github-readiness-chain",
      aiGithubReadinessChainDownloadsModels: freshCloneReadinessPlan?.oneCommandCandidate?.downloadsModels ?? false,
      aiGithubReadinessChainTrainsModels: freshCloneReadinessPlan?.oneCommandCandidate?.trainsModels ?? false,
      aiGithubReadinessChainCallsProviders: freshCloneReadinessPlan?.oneCommandCandidate?.callsProviders ?? false,
      secondBrainStatus: secondBrain?.status,
      secondBrainQualityGate: secondBrain?.qualityGate,
      connectorRegistryMode: connectorRegistry?.mode,
      connectorDefaultPolicy: connectorRegistry?.policy?.default,
      bigTechInventoryStatus: bigTechInventory?.status,
      installedSkillPassRequiresCodexRestart: Boolean(bigTechInventory?.installed_skill_pass?.requires_codex_restart)
    },
    runtimeActions: {
      liveConnectorWritesPerformed: false,
      remoteMcpTrustGranted: false,
      providerCredentialUsePerformed: false,
      externalAiPromptOrFileSendPerformed: false,
      pluginInstallOrPublishPerformed: false,
      sshOrDeploymentPerformed: false,
      billingOrCloudSpendPerformed: false,
      githubMutationPerformed: false
    },
    validation: {
      qualityGate: contract?.qualityGate,
      reportCommand: contract?.reportCommand,
      desktopGate: "npm run check:desktop-os",
      publicAiReadinessGate: "npm run check:seis-public-ai-readiness",
      aiGithubReadinessChain: freshCloneReadinessPlan?.oneCommandCandidate?.command || "npm run check:seis-ai-github-readiness-chain",
      requiredEvidence: [
        paths.outputJson,
        paths.outputMarkdown,
        paths.platformDoc
      ]
    }
  };
}

function validateReport(report, label) {
  ensure(report?.id === "seis-plugin-mcp-ten-year-continuity-map", `${label} must expose the canonical id.`);
  ensure(report?.decision === "NO-GO-live-activation-not-approved", `${label} must keep live activation blocked.`);
  ensure(report?.horizon?.years === 10, `${label} must cover a ten-year horizon.`);
  ensure(report?.horizon?.reviewWindowCount === 20, `${label} must cover twenty six-month review windows.`);
  ensure(Array.isArray(report?.phases) && report.phases.length === 10, `${label} must expose ten yearly phases.`);
  ensure(Array.isArray(report?.hardStops) && report.hardStops.includes("remote_mcp_trust"), `${label} must keep remote MCP trust as a hard stop.`);
  ensure(Array.isArray(report?.hardStops) && report.hardStops.includes("provider_credential_use"), `${label} must keep provider credential use as a hard stop.`);
  ensure(report?.derivedCounts?.mcpToolCount >= 34, `${label} must preserve at least 34 MCP tools from the runtime contract.`);
  ensure(report?.derivedCounts?.mcpResourceCount >= 29, `${label} must preserve at least 29 MCP resources from the runtime contract.`);
  ensure(report?.derivedCounts?.mcpPromptCount >= 3, `${label} must preserve at least 3 MCP prompts from the runtime contract.`);
  ensure(report?.derivedCounts?.installedAiProfileCount >= 24, `${label} must include the current installed AI profile count.`);
  ensure(report?.derivedCounts?.managedSubAgentLaneCount >= 6, `${label} must include managed sub-agent lanes.`);
  ensure(report?.derivedCounts?.localAiRuntimeRowCount >= 9, `${label} must include the local AI runtime matrix rows.`);
  ensure(report?.derivedCounts?.localAiHardwareRuntimeLaneCount >= 5, `${label} must include local AI hardware runtime lanes.`);
  ensure(report?.derivedCounts?.freshCloneReadinessCheckCount >= 6, `${label} must include fresh-clone readiness checks.`);
  ensure(report?.derivedCounts?.freshCloneEveryoneReadyBlockerCount >= 4, `${label} must keep everyone-ready blockers visible.`);
  ensure(report?.sourceSnapshot?.localAiRuntimeStatus === "runtime-matrix-ready-no-install", `${label} must keep local AI runtime matrix in no-install status.`);
  ensure(report?.sourceSnapshot?.localAiModelInstallAllowed === false, `${label} must not allow local AI model installs.`);
  ensure(report?.sourceSnapshot?.localAiInferenceAllowed === false, `${label} must not allow local AI inference.`);
  ensure(report?.sourceSnapshot?.localAiTrainingAllowed === false, `${label} must not allow local AI training.`);
  ensure(report?.sourceSnapshot?.localAiAgiClaimAllowed === false, `${label} must not allow local AI AGI claims.`);
  ensure(report?.sourceSnapshot?.freshClonePlanStatus === "fresh-clone-plan-ready-evidence-missing", `${label} must keep fresh-clone status evidence-missing.`);
  ensure(report?.sourceSnapshot?.freshCloneVerified === false, `${label} must not claim fresh-clone verification.`);
  ensure(report?.sourceSnapshot?.everyoneReadyClaimAllowed === false, `${label} must not claim everyone-ready status.`);
  ensure(report?.sourceSnapshot?.freshCloneAgiClaimAllowed === false, `${label} must not allow fresh-clone AGI claims.`);
  ensure(report?.sourceSnapshot?.aiGithubReadinessChainDownloadsModels === false, `${label} readiness chain must not download models.`);
  ensure(report?.sourceSnapshot?.aiGithubReadinessChainTrainsModels === false, `${label} readiness chain must not train models.`);
  ensure(report?.sourceSnapshot?.aiGithubReadinessChainCallsProviders === false, `${label} readiness chain must not call providers.`);
  for (const [key, value] of Object.entries(report?.runtimeActions || {})) {
    ensure(value === false, `${label} must keep runtime action ${key} false.`);
  }
}

function renderMarkdown(report) {
  return `# ${report.title}

Generated: ${report.generatedAt}
Status: ${report.status}
Mode: ${report.mode}
Decision: ${report.decision}

No live connector write, remote MCP trust, provider credential use, external AI prompt/file send, plugin install/publish, SSH, deployment, billing, cloud spend, or GitHub mutation is performed by this artifact.

## Summary

| Metric | Count |
| --- | ---: |
| Horizon years | ${report.derivedCounts.horizonYears} |
| Six-month review windows | ${report.derivedCounts.reviewWindowCount} |
| MCP tools | ${report.derivedCounts.mcpToolCount} |
| MCP resources | ${report.derivedCounts.mcpResourceCount} |
| MCP prompts | ${report.derivedCounts.mcpPromptCount} |
| Installed AI profiles | ${report.derivedCounts.installedAiProfileCount} |
| Managed sub-agent lanes | ${report.derivedCounts.managedSubAgentLaneCount} |
| Autonomous agent roster | ${report.derivedCounts.autonomousAgentRosterCount} |
| Local AI runtime rows | ${report.derivedCounts.localAiRuntimeRowCount} |
| Local AI hardware lanes | ${report.derivedCounts.localAiHardwareRuntimeLaneCount} |
| Fresh-clone readiness checks | ${report.derivedCounts.freshCloneReadinessCheckCount} |
| Fresh-clone everyone-ready blockers | ${report.derivedCounts.freshCloneEveryoneReadyBlockerCount} |
| Connector records | ${report.derivedCounts.connectorCount} |
| Plugin capability records | ${report.derivedCounts.pluginCapabilityCount} |
| MCP vendor surfaces | ${report.derivedCounts.mcpVendorSurfaceCount} |
| Installed skills in inventory | ${report.derivedCounts.installedSkillCount} |

## Safety Boundary

- safeInterpretation: ${report.safeInterpretation}
- liveBoundary: ${report.liveBoundary}
- liveConnectorWritesPerformed: ${report.runtimeActions.liveConnectorWritesPerformed}
- remoteMcpTrustGranted: ${report.runtimeActions.remoteMcpTrustGranted}
- providerCredentialUsePerformed: ${report.runtimeActions.providerCredentialUsePerformed}
- externalAiPromptOrFileSendPerformed: ${report.runtimeActions.externalAiPromptOrFileSendPerformed}
- pluginInstallOrPublishPerformed: ${report.runtimeActions.pluginInstallOrPublishPerformed}
- sshOrDeploymentPerformed: ${report.runtimeActions.sshOrDeploymentPerformed}
- billingOrCloudSpendPerformed: ${report.runtimeActions.billingOrCloudSpendPerformed}
- githubMutationPerformed: ${report.runtimeActions.githubMutationPerformed}

## Ten-Year Phases

${report.phases.map((phase) => `### Year ${phase.year}: ${phase.name}

- Focus: ${phase.focus}
- Deliverable: ${phase.deliverable}
- Boundary: ${phase.boundary}`).join("\n\n")}

## Six-Month Evidence Cadence

${report.reviewEvidence.map((item) => `- ${item}`).join("\n")}

## Hard Stops

${report.hardStops.map((item) => `- ${item}`).join("\n")}

## Source Snapshot

- MCP runtime status: ${report.sourceSnapshot.mcpRuntimeStatus}
- MCP transport: ${report.sourceSnapshot.mcpTransport}
- MCP fallback runtime: ${report.sourceSnapshot.mcpFallbackRuntime}
- Local AI runtime status: ${report.sourceSnapshot.localAiRuntimeStatus}
- Local AI model install allowed: ${report.sourceSnapshot.localAiModelInstallAllowed}
- Local AI inference allowed: ${report.sourceSnapshot.localAiInferenceAllowed}
- Local AI training allowed: ${report.sourceSnapshot.localAiTrainingAllowed}
- Local AI AGI claim allowed: ${report.sourceSnapshot.localAiAgiClaimAllowed}
- Fresh-clone plan status: ${report.sourceSnapshot.freshClonePlanStatus}
- Fresh-clone verified: ${report.sourceSnapshot.freshCloneVerified}
- Everyone-ready claim allowed: ${report.sourceSnapshot.everyoneReadyClaimAllowed}
- Fresh-clone AGI claim allowed: ${report.sourceSnapshot.freshCloneAgiClaimAllowed}
- AI GitHub readiness chain: ${report.sourceSnapshot.aiGithubReadinessChain}
- AI GitHub readiness chain downloads models: ${report.sourceSnapshot.aiGithubReadinessChainDownloadsModels}
- AI GitHub readiness chain trains models: ${report.sourceSnapshot.aiGithubReadinessChainTrainsModels}
- AI GitHub readiness chain calls providers: ${report.sourceSnapshot.aiGithubReadinessChainCallsProviders}
- Second Brain status: ${report.sourceSnapshot.secondBrainStatus}
- Second Brain quality gate: ${report.sourceSnapshot.secondBrainQualityGate}
- Connector registry mode: ${report.sourceSnapshot.connectorRegistryMode}
- Connector default policy: ${report.sourceSnapshot.connectorDefaultPolicy}
- Big Tech inventory status: ${report.sourceSnapshot.bigTechInventoryStatus}

## Validation

- Quality gate: ${report.validation.qualityGate}
- Report command: ${report.validation.reportCommand}
- Desktop gate: ${report.validation.desktopGate}
`;
}

function renderPlatformDoc(report) {
  return `# SEIS Plugin/MCP Ten-Year Continuity Map

## Purpose

This document is the repo-backed planning map for using installed AI profiles, plugin capability records, connector policy, and MCP runtime surfaces over a ten-year SEIS development horizon.

## Current State

Planning-only. The current artifact is generated from repo-owned contracts and does not activate live connectors, remote MCP servers, provider credentials, plugin publishing, SSH, deployment, billing, cloud spend, or GitHub mutation.

## Evidence Counts

- Horizon years: ${report.derivedCounts.horizonYears}
- Six-month review windows: ${report.derivedCounts.reviewWindowCount}
- MCP tools: ${report.derivedCounts.mcpToolCount}
- MCP resources: ${report.derivedCounts.mcpResourceCount}
- MCP prompts: ${report.derivedCounts.mcpPromptCount}
- Installed AI profiles: ${report.derivedCounts.installedAiProfileCount}
- Managed sub-agent lanes: ${report.derivedCounts.managedSubAgentLaneCount}
- Local AI runtime rows: ${report.derivedCounts.localAiRuntimeRowCount}
- Local AI hardware lanes: ${report.derivedCounts.localAiHardwareRuntimeLaneCount}
- Fresh-clone readiness checks: ${report.derivedCounts.freshCloneReadinessCheckCount}
- Fresh-clone everyone-ready blockers: ${report.derivedCounts.freshCloneEveryoneReadyBlockerCount}
- Connector records: ${report.derivedCounts.connectorCount}

## Hard Stops

${report.hardStops.map((item) => `- ${item}`).join("\n")}

## Validation

- ${report.validation.qualityGate}
- ${report.validation.reportCommand}
- ${report.validation.desktopGate}
- ${report.validation.publicAiReadinessGate}
- ${report.validation.aiGithubReadinessChain}

## Next Actions

- Keep the Command Center panel, Desktop validator, Second Brain agent registry, MCP runtime contract, connector registry, and status docs synchronized.
- Promote one live integration at a time only after explicit human approval, credentials review, rollback plan, and security owner signoff.
`;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--write") parsed.write = true;
    else if (arg === "--check") parsed.check = true;
    else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[index + 1];
      if (next && !next.startsWith("--")) {
        parsed[key] = next;
        index += 1;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
}

function readJson(relativePath, label) {
  try {
    return JSON.parse(readText(relativePath));
  } catch (error) {
    failures.push(`${label} could not be read as JSON at ${relativePath}: ${error.message}`);
    return null;
  }
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function ensureFile(relativePath, label) {
  ensure(fs.existsSync(path.join(root, relativePath)), `${label} is missing at ${relativePath}.`);
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
