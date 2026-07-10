#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const shouldWrite = Boolean(args.write);
const shouldCheck = Boolean(args.check);

const paths = {
  secondBrain: "content/development/seis-second-brain-system.json",
  aiWorkforce: "content/development/ai-workforce-assignments.json",
  roleSchema: "content/development/seis-ai-core-agent-role-schema.json",
  permissionMatrix: "content/development/seis-ai-core-agent-permission-matrix.json",
  subagentOperatingModel: "content/development/seis-ai-core-subagent-operating-model.json",
  laneStatus: "content/development/seis-agent-lane-status.json",
  bigTechInventory: "content/development/seis-big-tech-mcp-skill-inventory.json",
  pluginSkillMap: "content/development/plugin-skill-capability-map.json",
  connectorRegistry: "content/development/connector-capability-registry.json",
  obsidianContract: "content/development/seis-obsidian-bridge-safe-import-contract.json",
  obsidianContextPack: "seis-brain/vault/12_Context_Packs/SEIS Obsidian Context.md",
  routerContract: "content/development/seis-read-only-model-router-contract.json",
  outputJson: typeof args.output === "string" ? args.output : "reports/seis-public-demo/second-brain-agent-registry-latest.json",
  outputMarkdown: typeof args.markdown === "string" ? args.markdown : "reports/seis-public-demo/second-brain-agent-registry-latest.md"
};

const failures = [];
const requiredManagedSubAgentLanes = [
  "SEIS Hub",
  "SEIS Cloud",
  "SEIS-Code",
  "SEIS-Design",
  "SEIS-DATA",
  "SEIS-Security",
  "SEIS-Research",
  "SEIS-Automation",
  "SEIS-Product"
];
const requiredAutonomousAgentRoster = [
  "Architect Agent",
  "Code Agent",
  "Design Agent",
  "UI/UX Agent",
  "Research Agent",
  "Search Agent",
  "Security Agent",
  "DevOps Agent",
  "Documentation Agent",
  "QA Agent",
  "Cloud Agent",
  "Automation Agent",
  "Product Agent"
];
const secondBrainMcpResource = "seis://brain/second-brain-system.json";

const secondBrain = readJson(paths.secondBrain, "Second Brain contract");
const aiWorkforce = readJson(paths.aiWorkforce, "AI workforce assignments");
const roleSchema = readJson(paths.roleSchema, "agent role schema");
const permissionMatrix = readJson(paths.permissionMatrix, "agent permission matrix");
const subagentOperatingModel = readJson(paths.subagentOperatingModel, "sub-agent operating model");
const laneStatus = readJson(paths.laneStatus, "agent lane status");
const bigTechInventory = readJson(paths.bigTechInventory, "Big Tech MCP and skill inventory");
const pluginSkillMap = readJson(paths.pluginSkillMap, "plugin skill capability map");
const connectorRegistry = readJson(paths.connectorRegistry, "connector capability registry");
const obsidianContract = readJson(paths.obsidianContract, "Obsidian bridge safe import contract");
const obsidianContextText = readText(paths.obsidianContextPack, "repo-owned Obsidian context pack");
const routerContract = readJson(paths.routerContract, "read-only model-router contract");

ensure(obsidianContextText.includes("Vault-first structure"), "repo-owned Obsidian context pack must retain vault-first guidance.");
ensure(obsidianContextText.includes("Public/private separation mandatory"), "repo-owned Obsidian context pack must retain public/private separation guidance.");

const report = buildReport(new Date().toISOString());
validateReport(report, "generated Second Brain agent registry");

if (shouldWrite) {
  writeJson(paths.outputJson, report);
  writeText(paths.outputMarkdown, renderMarkdown(report));
}

if (shouldCheck) {
  ensureFile(paths.outputJson, "Second Brain agent registry JSON artifact");
  ensureFile(paths.outputMarkdown, "Second Brain agent registry Markdown artifact");
  const existingJson = readJson(paths.outputJson, "Second Brain agent registry JSON artifact");
  const existingMarkdown = readText(paths.outputMarkdown, "Second Brain agent registry Markdown artifact");
  if (existingJson) validateReport(existingJson, "existing Second Brain agent registry artifact");
  for (const phrase of [
    "SEIS Second Brain Agent Registry",
    "NO-GO-autonomous-execution-not-approved",
    "providerCallsPerformed: false",
    "privateObsidianVaultReadPerformed: false",
    "autonomousWriteExecutionPerformed: false",
    "No private Obsidian import, provider call, credential validation, SSH, GitHub mutation, or deployment is performed"
  ]) {
    ensure(existingMarkdown.includes(phrase), `Markdown artifact missing phrase: ${phrase}.`);
  }
}

if (failures.length > 0) {
  console.error("SEIS Second Brain agent registry check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (shouldWrite) {
  console.log(`Wrote ${paths.outputJson}`);
  console.log(`Wrote ${paths.outputMarkdown}`);
} else if (shouldCheck) {
  console.log("SEIS Second Brain agent registry check passed.");
} else {
  console.log(JSON.stringify(report, null, 2));
}

function buildReport(generatedAt) {
  const workforceAssignments = (aiWorkforce?.assignments || []).map((assignment) => ({
    id: assignment.id,
    displayName: assignment.displayName,
    category: assignment.category,
    route: assignment.route,
    status: assignment.launcherStatus || assignment.status || "unknown",
    allowedOutputs: assignment.allowedOutputs || [],
    writeAuthority: assignment.id === aiWorkforce?.writerPolicy?.primaryWriter ? "primary-writer-human-supervised" : "review-or-plan-only"
  }));

  const providerProfiles = (secondBrain?.installedAiProfiles || []).map((profileId) => ({
    profileId,
    status: inferProfileStatus(profileId, workforceAssignments),
    secondBrainUse: profileId === "seis-local-demo" ? "local-demo-context" : "review-context-only",
    liveProviderRouteEnabled: false,
    promptBodyStorageAllowed: false,
    credentialAccessAllowed: false
  }));

  const managedSubAgentLanes = secondBrain?.managedSubAgentLanes || [];
  const autonomousAgentRoster = secondBrain?.autonomousAgentRoster || [];
  const roleSchemaRoles = roleSchema?.roles || [];
  const permissionLevels = permissionMatrix?.levels || [];
  const operatingLanes = subagentOperatingModel?.lanes || [];
  const laneStatusRecords = laneStatus?.lanes || laneStatus?.laneStatus || [];
  const localAppsDetected = (bigTechInventory?.local_apps_detected || []).map((item) => ({
    app: item.app,
    status: item.status
  }));
  const mcpSurfaces = (bigTechInventory?.current_session_mcp_surfaces || []).map((item) => ({
    vendor: item.vendor,
    surfaceCount: item.surfaces?.length || 0,
    status: item.status,
    liveActionGate: item.write_gate || item.activation_gate || "explicit user approval required before mutations"
  }));
  const pluginCapabilities = pluginSkillMap?.capabilities || [];
  const connectorCapabilities = connectorRegistry?.connectors || [];

  return {
    id: "seis-second-brain-agent-registry-pr54",
    title: "SEIS Second Brain Agent Registry",
    generatedAt,
    status: "review-only-agent-registry",
    mode: "repo-local-no-live-execution",
    decision: "NO-GO-autonomous-execution-not-approved",
    sourcePaths: {
      secondBrain: paths.secondBrain,
      aiWorkforce: paths.aiWorkforce,
      roleSchema: paths.roleSchema,
      permissionMatrix: paths.permissionMatrix,
      subagentOperatingModel: paths.subagentOperatingModel,
      laneStatus: paths.laneStatus,
      bigTechInventory: paths.bigTechInventory,
      pluginSkillMap: paths.pluginSkillMap,
      connectorRegistry: paths.connectorRegistry,
      obsidianContract: paths.obsidianContract,
      obsidianContextPack: paths.obsidianContextPack,
      routerContract: paths.routerContract
    },
    secondBrainBinding: {
      status: secondBrain?.status,
      vaultRoot: secondBrain?.vaultRoot,
      trainingPackPath: secondBrain?.trainingPackPath,
      mcpResource: secondBrain?.mcpResource,
      repositoryContextPack: {
        status: secondBrain?.repositoryContextPack?.status || "unknown",
        path: secondBrain?.repositoryContextPack?.path || null,
        access: secondBrain?.repositoryContextPack?.access || "unknown",
        privateVaultRead: secondBrain?.repositoryContextPack?.privateVaultRead ?? false,
        modelWeightTraining: secondBrain?.repositoryContextPack?.modelWeightTraining ?? false
      },
      obsidianBridgeStatus: secondBrain?.obsidianBridge?.status,
      privateVaultImportEnabled: obsidianContract?.currentRuntime?.privateVaultImportEnabled ?? false,
      hostVaultReadEnabled: obsidianContract?.currentRuntime?.hostVaultReadEnabled ?? false,
      bodyImportPolicy: obsidianContract?.dryRunManifestSchema?.bodyImportPolicy || "metadata-only-by-default",
      githubMutationEnabled: secondBrain?.securityBoundary?.githubMutation ?? false
    },
    providerProfiles,
    workforceAssignments,
    subAgentMesh: {
      managedSubAgentLanes,
      autonomousAgentRoster,
      roleSchemaRoles: roleSchemaRoles.map((role) => ({
        id: role.id,
        laneId: role.laneId,
        authority: role.authority,
        networkScope: role.networkScope,
        maxSteps: role.maxSteps,
        maxDelegationDepth: role.maxDelegationDepth
      })),
      permissionLevels: permissionLevels.map((level) => ({
        level: level.level,
        status: level.status,
        approvalRequired: level.approvalRequired
      })),
      operatingLanes: operatingLanes.map((lane) => ({
        laneId: lane.id || lane.laneId || lane.name,
        status: lane.status || subagentOperatingModel?.runtimeBoundary?.currentLevel || "status-and-plan-only"
      })),
      laneStatusCount: laneStatusRecords.length
    },
    contextAccessMatrix: autonomousAgentRoster.map((agent) => ({
      agent: agent.agent,
      status: agent.status,
      contextAccess: "read-only repo-local context and plan input",
      mcpResource: secondBrain?.mcpResource || null,
      contextPackPath: secondBrain?.repositoryContextPack?.path || null,
      privateVaultRead: false,
      autonomousWriteAllowed: false
    })),
    pluginAndMcpSurface: {
      installedSkillCount: bigTechInventory?.installed_skill_pass?.installed_skill_count || 0,
      installedSkills: bigTechInventory?.installed_skill_pass?.skills || [],
      localAppsDetected,
      mcpSurfaces,
      pluginCapabilityCount: pluginCapabilities.length,
      connectorCapabilityCount: connectorCapabilities.length
    },
    governance: {
      writerPolicy: aiWorkforce?.writerPolicy || null,
      credentialBoundary: aiWorkforce?.credentialBoundary || null,
      routerStatus: routerContract?.status,
      routerRuntimeAuthority: routerContract?.runtimeAuthority ?? false,
      permissionRuntimeBoundary: permissionMatrix?.runtimeBoundary,
      subagentRuntimeBoundary: subagentOperatingModel?.runtimeBoundary?.currentLevel || subagentOperatingModel?.runtimeBoundary
    },
    requiredEvidenceBeforeAutonomousUse: [
      "human approval for autonomous write execution",
      "permission matrix enforced by executable tests",
      "approval fixture enforced before write-gated actions",
      "redaction fixture enforced before any provider or connector routing",
      "explicit user-selected Obsidian source path before private vault dry-run",
      "backend-only provider mediation before live model routing",
      "current browser-smoke evidence and manual accessibility review",
      "clean release-candidate worktree review before GitHub publication"
    ],
    safetyBoundary: {
      privateObsidianVaultReadPerformed: false,
      privateNoteBodyCopied: false,
      providerCallsPerformed: false,
      credentialValidationPerformed: false,
      browserSecretsExposed: false,
      promptBodiesStored: false,
      autonomousWriteExecutionPerformed: false,
      backgroundRunnerEnabled: false,
      externalConnectorMutationPerformed: false,
      sshExecuted: false,
      deploymentPerformed: false,
      githubMutationPerformed: false,
      releaseApprovalGranted: false
    },
    summary: {
      installedAiProfileCount: providerProfiles.length,
      workforceAssignmentCount: workforceAssignments.length,
      managedSubAgentLaneCount: managedSubAgentLanes.length,
      autonomousAgentRosterCount: autonomousAgentRoster.length,
      contextAccessAgentCount: autonomousAgentRoster.length,
      roleSchemaRoleCount: roleSchemaRoles.length,
      permissionLevelCount: permissionLevels.length,
      localAppDetectedCount: localAppsDetected.length,
      mcpVendorSurfaceCount: mcpSurfaces.length,
      installedSkillCount: bigTechInventory?.installed_skill_pass?.installed_skill_count || 0,
      pluginCapabilityCount: pluginCapabilities.length,
      connectorCapabilityCount: connectorCapabilities.length
    }
  };
}

function inferProfileStatus(profileId, assignments) {
  const byProfile = {
    "codex-operator": "codex",
    "claude-review-profile": "claude",
    "qwen-review-profile": "qwen",
    "gemini-validation-profile": "gemini",
    "ollama-local-profile": "ollama"
  };
  if (profileId === "seis-local-demo") return "local-demo";
  const match = assignments.find((assignment) => assignment.id === byProfile[profileId]);
  return match?.status || "recorded-profile";
}

function validateReport(value, label) {
  ensure(value?.id === "seis-second-brain-agent-registry-pr54", `${label} id mismatch.`);
  ensure(value?.title === "SEIS Second Brain Agent Registry", `${label} title mismatch.`);
  ensure(value?.status === "review-only-agent-registry", `${label} status mismatch.`);
  ensure(value?.mode === "repo-local-no-live-execution", `${label} mode mismatch.`);
  ensure(value?.decision === "NO-GO-autonomous-execution-not-approved", `${label} decision must block autonomous execution.`);
  ensure(value?.sourcePaths?.secondBrain === paths.secondBrain, `${label} Second Brain source path mismatch.`);
  ensure(value?.sourcePaths?.aiWorkforce === paths.aiWorkforce, `${label} AI workforce source path mismatch.`);
  ensure(value?.sourcePaths?.roleSchema === paths.roleSchema, `${label} role schema source path mismatch.`);
  ensure(value?.sourcePaths?.obsidianContextPack === paths.obsidianContextPack, `${label} Obsidian context pack source path mismatch.`);
  ensure(value?.secondBrainBinding?.status === "local-demo", `${label} Second Brain binding must stay local-demo.`);
  ensure(value?.secondBrainBinding?.mcpResource === secondBrainMcpResource, `${label} Second Brain MCP resource mismatch.`);
  ensure(value?.secondBrainBinding?.repositoryContextPack?.status === "repo-owned-public-safe", `${label} repository context pack must remain repo-owned and public-safe.`);
  ensure(value?.secondBrainBinding?.repositoryContextPack?.path === paths.obsidianContextPack, `${label} repository context pack path mismatch.`);
  ensure(value?.secondBrainBinding?.repositoryContextPack?.access === "read-only local and MCP contract context", `${label} repository context pack must stay read-only.`);
  ensure(value?.secondBrainBinding?.repositoryContextPack?.privateVaultRead === false, `${label} repository context pack must not read private vaults.`);
  ensure(value?.secondBrainBinding?.repositoryContextPack?.modelWeightTraining === false, `${label} repository context pack must not claim model-weight training.`);
  ensure(value?.secondBrainBinding?.privateVaultImportEnabled === false, `${label} private vault import must be disabled.`);
  ensure(value?.secondBrainBinding?.hostVaultReadEnabled === false, `${label} host vault reads must be disabled.`);
  ensure(value?.secondBrainBinding?.githubMutationEnabled === false, `${label} GitHub mutation must be disabled.`);
  ensureArrayMin(value?.providerProfiles, 6, `${label} providerProfiles`);
  ensureArrayMin(value?.workforceAssignments, 10, `${label} workforceAssignments`);
  ensureArrayMin(value?.subAgentMesh?.managedSubAgentLanes, 9, `${label} managedSubAgentLanes`);
  ensureArrayMin(value?.subAgentMesh?.autonomousAgentRoster, 13, `${label} autonomousAgentRoster`);
  ensureArrayMin(value?.contextAccessMatrix, 13, `${label} contextAccessMatrix`);
  ensureArrayIncludesAll(value?.subAgentMesh?.managedSubAgentLanes, requiredManagedSubAgentLanes, `${label} managedSubAgentLanes`);
  ensureArrayIncludesAll(
    (value?.subAgentMesh?.autonomousAgentRoster || []).map((agent) => agent.agent),
    requiredAutonomousAgentRoster,
    `${label} autonomousAgentRoster`
  );
  ensureArrayMin(value?.subAgentMesh?.roleSchemaRoles, 5, `${label} roleSchemaRoles`);
  ensureArrayMin(value?.subAgentMesh?.permissionLevels, 5, `${label} permissionLevels`);
  ensure(value?.summary?.installedAiProfileCount >= 6, `${label} installed AI profile count too low.`);
  ensure(value?.summary?.workforceAssignmentCount >= 10, `${label} workforce assignment count too low.`);
  ensure(value?.summary?.managedSubAgentLaneCount === requiredManagedSubAgentLanes.length, `${label} managed sub-agent lane count mismatch.`);
  ensure(value?.summary?.autonomousAgentRosterCount === requiredAutonomousAgentRoster.length, `${label} autonomous agent roster count mismatch.`);
  ensure(value?.summary?.contextAccessAgentCount === requiredAutonomousAgentRoster.length, `${label} context access agent count mismatch.`);
  ensure(value?.summary?.mcpVendorSurfaceCount >= 10, `${label} MCP vendor surface count too low.`);
  ensure(value?.summary?.installedSkillCount >= 30, `${label} installed skill count too low.`);
  ensureArrayMin(value?.requiredEvidenceBeforeAutonomousUse, 8, `${label} requiredEvidenceBeforeAutonomousUse`);
  for (const profile of value?.providerProfiles || []) {
    ensure(profile.liveProviderRouteEnabled === false, `${label} provider profile ${profile.profileId} must not enable live routing.`);
    ensure(profile.promptBodyStorageAllowed === false, `${label} provider profile ${profile.profileId} must not allow prompt body storage.`);
    ensure(profile.credentialAccessAllowed === false, `${label} provider profile ${profile.profileId} must not allow credential access.`);
  }
  ensureArrayIncludesAll(
    (value?.contextAccessMatrix || []).map((entry) => entry.agent),
    requiredAutonomousAgentRoster,
    `${label} contextAccessMatrix`
  );
  for (const entry of value?.contextAccessMatrix || []) {
    ensure(entry.contextAccess === "read-only repo-local context and plan input", `${label} context entry ${entry.agent} must remain read-only.`);
    ensure(entry.mcpResource === secondBrainMcpResource, `${label} context entry ${entry.agent} MCP resource mismatch.`);
    ensure(entry.contextPackPath === paths.obsidianContextPack, `${label} context entry ${entry.agent} context pack path mismatch.`);
    ensure(entry.privateVaultRead === false, `${label} context entry ${entry.agent} must not read private vaults.`);
    ensure(entry.autonomousWriteAllowed === false, `${label} context entry ${entry.agent} must not allow autonomous writes.`);
  }
  for (const [key, expected] of [
    ["privateObsidianVaultReadPerformed", false],
    ["privateNoteBodyCopied", false],
    ["providerCallsPerformed", false],
    ["credentialValidationPerformed", false],
    ["browserSecretsExposed", false],
    ["promptBodiesStored", false],
    ["autonomousWriteExecutionPerformed", false],
    ["backgroundRunnerEnabled", false],
    ["externalConnectorMutationPerformed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["githubMutationPerformed", false],
    ["releaseApprovalGranted", false]
  ]) {
    ensure(value?.safetyBoundary?.[key] === expected, `${label} safetyBoundary.${key} must be ${expected}.`);
  }
  const serialized = JSON.stringify(value);
  ensure(!serialized.includes("file://"), `${label} must not include file:// paths.`);
  ensure(!serialized.includes("/Users/"), `${label} must not include absolute private /Users paths.`);
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), `${label} must not contain OpenAI-style API keys.`);
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), `${label} must not contain private keys.`);
  ensure(!/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(serialized), `${label} must not contain inline credential assignments.`);
  ensure(!/"(?:promptBodyText|promptText|messages|conversation)"\s*:/i.test(serialized), `${label} must not include prompt body fields.`);
}

function renderMarkdown(value) {
  const profileRows = value.providerProfiles
    .map((item) => `| ${item.profileId} | ${item.status} | ${item.secondBrainUse} | ${item.liveProviderRouteEnabled} |`)
    .join("\n");
  const workforceRows = value.workforceAssignments
    .map((item) => `| ${item.id} | ${item.displayName} | ${item.category} | ${item.status} | ${item.writeAuthority} |`)
    .join("\n");
  const agentRows = value.subAgentMesh.autonomousAgentRoster
    .map((item) => `| ${item.agent} | ${item.status} | ${item.duty} |`)
    .join("\n");
  const contextRows = value.contextAccessMatrix
    .map((item) => `| ${item.agent} | ${item.status} | ${item.contextAccess} | ${item.privateVaultRead} | ${item.autonomousWriteAllowed} |`)
    .join("\n");
  const surfaceRows = value.pluginAndMcpSurface.mcpSurfaces
    .map((item) => `| ${item.vendor} | ${item.surfaceCount} | ${item.status} | ${item.liveActionGate} |`)
    .join("\n");

  return `# SEIS Second Brain Agent Registry

Generated: ${value.generatedAt}
Status: ${value.status}
Mode: ${value.mode}
Decision: ${value.decision}

No private Obsidian import, provider call, credential validation, SSH, GitHub mutation, or deployment is performed by this artifact.

## Summary

| Metric | Count |
| --- | ---: |
| Installed AI profiles | ${value.summary.installedAiProfileCount} |
| AI workforce assignments | ${value.summary.workforceAssignmentCount} |
| Managed sub-agent lanes | ${value.summary.managedSubAgentLaneCount} |
| Autonomous agent roster | ${value.summary.autonomousAgentRosterCount} |
| Read-only context access entries | ${value.summary.contextAccessAgentCount} |
| Role schema roles | ${value.summary.roleSchemaRoleCount} |
| Permission levels | ${value.summary.permissionLevelCount} |
| Local apps detected in inventory | ${value.summary.localAppDetectedCount} |
| MCP vendor surfaces | ${value.summary.mcpVendorSurfaceCount} |
| Installed skills in inventory | ${value.summary.installedSkillCount} |

## Second Brain Binding

- status: ${value.secondBrainBinding.status}
- vaultRoot: ${value.secondBrainBinding.vaultRoot}
- trainingPackPath: ${value.secondBrainBinding.trainingPackPath}
- mcpResource: ${value.secondBrainBinding.mcpResource}
- repositoryContextPack.status: ${value.secondBrainBinding.repositoryContextPack.status}
- repositoryContextPack.path: ${value.secondBrainBinding.repositoryContextPack.path}
- repositoryContextPack.access: ${value.secondBrainBinding.repositoryContextPack.access}
- repositoryContextPack.privateVaultRead: ${value.secondBrainBinding.repositoryContextPack.privateVaultRead}
- repositoryContextPack.modelWeightTraining: ${value.secondBrainBinding.repositoryContextPack.modelWeightTraining}
- obsidianBridgeStatus: ${value.secondBrainBinding.obsidianBridgeStatus}
- privateVaultImportEnabled: ${value.secondBrainBinding.privateVaultImportEnabled}
- hostVaultReadEnabled: ${value.secondBrainBinding.hostVaultReadEnabled}
- bodyImportPolicy: ${value.secondBrainBinding.bodyImportPolicy}
- githubMutationEnabled: ${value.secondBrainBinding.githubMutationEnabled}

## Provider Profiles

| Profile | Status | Second Brain use | Live route enabled |
| --- | --- | --- | --- |
${profileRows}

## AI Workforce Assignments

| ID | Name | Category | Status | Write authority |
| --- | --- | --- | --- | --- |
${workforceRows}

## Autonomous Agent Roster

| Agent | Status | Duty |
| --- | --- | --- |
${agentRows}

## Read-Only Context Access

- MCP resource: ${value.secondBrainBinding.mcpResource}
- Repo-owned Obsidian context pack: ${value.secondBrainBinding.repositoryContextPack.path}
- Access mode: ${value.secondBrainBinding.repositoryContextPack.access}
- Private vault read: ${value.secondBrainBinding.repositoryContextPack.privateVaultRead}
- Model-weight training: ${value.secondBrainBinding.repositoryContextPack.modelWeightTraining}

| Agent | Status | Context access | Private vault read | Autonomous write allowed |
| --- | --- | --- | --- | --- |
${contextRows}

## MCP And Plugin Surface

| Vendor | Surface count | Status | Live action gate |
| --- | ---: | --- | --- |
${surfaceRows}

## Evidence Required Before Autonomous Use

${value.requiredEvidenceBeforeAutonomousUse.map((item) => `- ${item}`).join("\n")}

## Safety Boundary

- privateObsidianVaultReadPerformed: ${value.safetyBoundary.privateObsidianVaultReadPerformed}
- privateNoteBodyCopied: ${value.safetyBoundary.privateNoteBodyCopied}
- providerCallsPerformed: ${value.safetyBoundary.providerCallsPerformed}
- credentialValidationPerformed: ${value.safetyBoundary.credentialValidationPerformed}
- browserSecretsExposed: ${value.safetyBoundary.browserSecretsExposed}
- promptBodiesStored: ${value.safetyBoundary.promptBodiesStored}
- autonomousWriteExecutionPerformed: ${value.safetyBoundary.autonomousWriteExecutionPerformed}
- backgroundRunnerEnabled: ${value.safetyBoundary.backgroundRunnerEnabled}
- externalConnectorMutationPerformed: ${value.safetyBoundary.externalConnectorMutationPerformed}
- sshExecuted: ${value.safetyBoundary.sshExecuted}
- deploymentPerformed: ${value.safetyBoundary.deploymentPerformed}
- githubMutationPerformed: ${value.safetyBoundary.githubMutationPerformed}
- releaseApprovalGranted: ${value.safetyBoundary.releaseApprovalGranted}
`;
}

function parseArgs(values) {
  return values.reduce((acc, value, index) => {
    if (!value.startsWith("--")) return acc;
    const key = value.slice(2);
    const next = values[index + 1];
    acc[key] = next && !next.startsWith("--") ? next : true;
    return acc;
  }, {});
}

function safeOutputPath(targetPath) {
  const absolutePath = path.resolve(root, targetPath);
  const relativePath = path.relative(root, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    failures.push(`refusing to write outside repository: ${targetPath}`);
    return path.join(root, "reports", "seis-public-demo", "second-brain-agent-registry-refused-output.txt");
  }
  return absolutePath;
}

function writeJson(filePath, value) {
  const absolutePath = safeOutputPath(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  const absolutePath = safeOutputPath(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function ensureArrayMin(value, minimum, label) {
  ensure(Array.isArray(value), `${label} must be an array.`);
  ensure(Array.isArray(value) && value.length >= minimum, `${label} must include at least ${minimum} records.`);
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array.`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}.`);
  }
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${label}: ${filePath}`);
    return "";
  }
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    failures.push(`unable to read ${label}: ${error.message}`);
    return "";
  }
}

function readJson(filePath, label) {
  const text = readText(filePath, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`invalid JSON in ${label}: ${error.message}`);
    return null;
  }
}
