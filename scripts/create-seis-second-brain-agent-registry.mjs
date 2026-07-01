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
  routerContract: "content/development/seis-read-only-model-router-contract.json",
  outputJson: typeof args.output === "string" ? args.output : "reports/seis-public-demo/second-brain-agent-registry-latest.json",
  outputMarkdown: typeof args.markdown === "string" ? args.markdown : "reports/seis-public-demo/second-brain-agent-registry-latest.md"
};

const failures = [];

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
const routerContract = readJson(paths.routerContract, "read-only model-router contract");

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
      routerContract: paths.routerContract
    },
    secondBrainBinding: {
      status: secondBrain?.status,
      vaultRoot: publicSecondBrainPath(secondBrain?.vaultRoot),
      trainingPackPath: publicSecondBrainPath(secondBrain?.trainingPackPath),
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
    "ollama-local-profile": "ollama",
    "openai-general-profile": "openai",
    "anthropic-claude-profile": "anthropic",
    "chatgpt-review-profile": "chatgpt",
    "openrouter-provider-profile": "openrouter",
    "cursor-ide-profile": "cursor",
    "github-copilot-profile": "github-copilot",
    "lm-studio-local-profile": "lm-studio",
    "open-design": "open-design",
    "antigravity": "antigravity",
    "antigravity-ide": "antigravity-ide",
    "aider": "aider",
    "interpreter": "interpreter",
    "hermes": "hermes",
    "goose": "goose",
    "kimi": "kimi"
  };
  if (profileId === "seis-local-demo") return "local-demo";
  const match = assignments.find((assignment) => assignment.id === byProfile[profileId]);
  return match?.status || "recorded-profile";
}

function publicSecondBrainPath(value) {
  const text = String(value || "");
  const prefix = "/home/seis/SecondBrain";
  if (text === prefix) return "browser-vfs/SecondBrain";
  if (text.startsWith(`${prefix}/`)) return `browser-vfs/SecondBrain/${text.slice(prefix.length + 1)}`;
  return text;
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
  ensure(value?.secondBrainBinding?.status === "local-demo", `${label} Second Brain binding must stay local-demo.`);
  ensure(value?.secondBrainBinding?.privateVaultImportEnabled === false, `${label} private vault import must be disabled.`);
  ensure(value?.secondBrainBinding?.hostVaultReadEnabled === false, `${label} host vault reads must be disabled.`);
  ensure(value?.secondBrainBinding?.githubMutationEnabled === false, `${label} GitHub mutation must be disabled.`);
  ensure(!String(value?.secondBrainBinding?.vaultRoot || "").startsWith("/home/"), `${label} vaultRoot must be public-safe and repo-neutral.`);
  ensure(!String(value?.secondBrainBinding?.trainingPackPath || "").startsWith("/home/"), `${label} trainingPackPath must be public-safe and repo-neutral.`);
  ensureArrayMin(value?.providerProfiles, 6, `${label} providerProfiles`);
  ensureArrayMin(value?.workforceAssignments, 10, `${label} workforceAssignments`);
  ensureArrayMin(value?.subAgentMesh?.managedSubAgentLanes, 6, `${label} managedSubAgentLanes`);
  ensureArrayMin(value?.subAgentMesh?.autonomousAgentRoster, 12, `${label} autonomousAgentRoster`);
  ensureArrayMin(value?.subAgentMesh?.roleSchemaRoles, 5, `${label} roleSchemaRoles`);
  ensureArrayMin(value?.subAgentMesh?.permissionLevels, 5, `${label} permissionLevels`);
  ensure(value?.summary?.installedAiProfileCount >= 6, `${label} installed AI profile count too low.`);
  ensure(value?.summary?.workforceAssignmentCount >= 10, `${label} workforce assignment count too low.`);
  ensure(value?.summary?.mcpVendorSurfaceCount >= 10, `${label} MCP vendor surface count too low.`);
  ensure(value?.summary?.installedSkillCount >= 30, `${label} installed skill count too low.`);
  ensureArrayMin(value?.requiredEvidenceBeforeAutonomousUse, 8, `${label} requiredEvidenceBeforeAutonomousUse`);
  for (const profile of value?.providerProfiles || []) {
    ensure(profile.liveProviderRouteEnabled === false, `${label} provider profile ${profile.profileId} must not enable live routing.`);
    ensure(profile.promptBodyStorageAllowed === false, `${label} provider profile ${profile.profileId} must not allow prompt body storage.`);
    ensure(profile.credentialAccessAllowed === false, `${label} provider profile ${profile.profileId} must not allow credential access.`);
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
| Role schema roles | ${value.summary.roleSchemaRoleCount} |
| Permission levels | ${value.summary.permissionLevelCount} |
| Local apps detected in inventory | ${value.summary.localAppDetectedCount} |
| MCP vendor surfaces | ${value.summary.mcpVendorSurfaceCount} |
| Installed skills in inventory | ${value.summary.installedSkillCount} |

## Second Brain Binding

- status: ${value.secondBrainBinding.status}
- vaultRoot: ${value.secondBrainBinding.vaultRoot}
- trainingPackPath: ${value.secondBrainBinding.trainingPackPath}
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
