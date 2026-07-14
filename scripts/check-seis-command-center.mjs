import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { buildAiCoreRuntimeSnapshot } from "../packages/seis-ai/src/model/core-runtime-snapshot.mjs";
import { buildSeisEcosystemCapabilitySnapshot } from "../packages/seis-ai/src/model/ecosystem-capability-snapshot.mjs";

const root = process.cwd();
const appRoot = path.join(root, "apps", "seis-core");
const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "data/seis-core-ecosystem-registry.json",
  "data/seis-ai-core-runtime-snapshot.json",
  "manifest.webmanifest",
  "README.md",
  "test/seis-core-runtime.test.js",
  "test/seis-core-static.test.js"
];

const requiredModules = [
  "Dashboard",
  "God Mode",
  "Goals",
  "Repositories",
  "Documentation",
  "Agents",
  "Plugins",
  "Automation",
  "Security",
  "Architecture",
  "Knowledge"
];

const requiredScriptSignals = [
  "localStorage",
  "pluginFamilies",
  "automationWorkflows",
  "godModeLanes",
  "godModeProtocol",
  "seisAiSetup",
  "godModeGuardrails",
  "godModeArtifacts",
  "godModeRuns",
  "renderGodMode",
  "operationsReadiness",
  "renderOperationsReadiness",
  "featureGrowthLedger",
  "renderFeatureGrowthLedger",
  "workflowRuns",
  "approvalGates",
  "rollbackEvidence",
  "securityReports",
  "permissionReviews",
  "dependencyScans",
  "securityAudits",
  "aiSystems",
  "operatingDomains",
  "platformPhases",
  "dependencyGraph",
  "moduleRelationships",
  "technicalDebtRegister",
  "recentActivity",
  "dependencyRisk",
  "renderAgentDetail",
  "orchestrationLanes",
  "handoffAudit",
  "knowledgeGraphNodes",
  "knowledgeEdges",
  "memoryEvidence",
  "decisionHistory",
  "reusablePatterns",
  "renderEcosystemControlPlane",
  "loadSeisCoreEcosystemRegistry",
  "copyEcosystemGate",
  "fallbackSeisAiCoreRuntimeSnapshot",
  "renderAiCoreRuntime",
  "renderManagedAgentRegistry",
  "loadSeisAiCoreRuntimeSnapshot",
  "copyAiCoreDecision",
  "renderCommandResults"
];

const requiredDocSections = [
  "Folder Structure",
  "Component Map",
  "Data Model",
  "Ecosystem Control Plane",
  "AI Core Runtime Snapshot",
  "Managed Agent Registry",
  "Operating Model",
  "God Mode Operations Model",
  "Operations Readiness Model",
  "AI Orchestration Model",
  "Automation Operations Model",
  "Architecture Operations Model",
  "Security Operations Model",
  "Knowledge System Model",
  "API Design",
  "Testing Strategy",
  "Roadmap",
  "Platform Phases",
  "Deployment Strategy",
  "Security Model"
];

const requiredOperatingDomains = [
  "Repositories",
  "AI Agents",
  "MCP Systems",
  "Plugin Systems",
  "Documentation",
  "Architecture Decisions",
  "Roadmap Planning",
  "Goal Tracking",
  "Automation Workflows",
  "Cloud Infrastructure",
  "Knowledge Systems",
  "Security Systems"
];

const requiredAiSystems = [
  "OpenAI",
  "Claude",
  "Gemini",
  "Qwen",
  "Local Models",
  "Future AI Systems"
];

const requiredOrchestrationLanes = [
  "Plan",
  "Build",
  "Validate",
  "Counter-Review",
  "Private Draft",
  "Future Adapter"
];

function fail(message) {
  console.error(`SEIS Command Center check failed: ${message}`);
  process.exit(1);
}

for (const file of requiredFiles) {
  const filePath = path.join(appRoot, file);
  if (!existsSync(filePath)) {
    fail(`missing apps/seis-core/${file}`);
  }
}

const html = await readFile(path.join(appRoot, "index.html"), "utf8");
const script = await readFile(path.join(appRoot, "script.js"), "utf8");
const css = await readFile(path.join(appRoot, "styles.css"), "utf8");
const ecosystemRegistry = JSON.parse(await readFile(path.join(appRoot, "data", "seis-core-ecosystem-registry.json"), "utf8"));
const aiCoreRuntimeSnapshot = JSON.parse(await readFile(path.join(appRoot, "data", "seis-ai-core-runtime-snapshot.json"), "utf8"));
const expectedEcosystemRegistry = buildSeisEcosystemCapabilitySnapshot(root);
const expectedAiCoreRuntimeSnapshot = buildAiCoreRuntimeSnapshot(root);
const manifest = JSON.parse(await readFile(path.join(appRoot, "manifest.webmanifest"), "utf8"));
const readme = await readFile(path.join(appRoot, "README.md"), "utf8");
const architectureDocPath = path.join(root, "docs", "architecture", "seis-command-center.md");

if (!existsSync(architectureDocPath)) {
  fail("missing docs/architecture/seis-command-center.md");
}

const architectureDoc = await readFile(architectureDocPath, "utf8");

for (const moduleName of requiredModules) {
  if (!html.includes(`>${moduleName}<`) && !html.includes(`>${moduleName} &amp;`)) {
    fail(`missing module navigation label: ${moduleName}`);
  }
}

for (const signal of requiredScriptSignals) {
  if (!script.includes(signal)) {
    fail(`missing script signal: ${signal}`);
  }
}

for (const id of ["ecosystem-control-state", "ecosystem-control-summary", "ecosystem-control-grid", "ecosystem-lane-detail", "ecosystem-control-feedback"]) {
  if (!html.includes(`id="${id}"`)) {
    fail(`missing ecosystem control plane target: ${id}`);
  }
}

for (const id of [
  "ai-core-runtime-state",
  "ai-core-runtime-summary",
  "ai-core-provider-grid",
  "ai-core-scenario-list",
  "ai-core-decision",
  "ai-core-mesh-strip",
  "ai-core-runtime-feedback"
]) {
  if (!html.includes(`id="${id}"`)) {
    fail(`missing AI Core runtime target: ${id}`);
  }
}

for (const id of [
  "managed-agent-registry-state",
  "managed-agent-registry-summary",
  "managed-agent-lanes",
  "managed-agent-list",
  "managed-agent-detail",
  "managed-agent-registry-feedback"
]) {
  if (!html.includes(`id="${id}"`)) {
    fail(`missing managed agent registry target: ${id}`);
  }
}

if (JSON.stringify(ecosystemRegistry) !== JSON.stringify(expectedEcosystemRegistry)) {
  fail("ecosystem capability snapshot is stale; run npm run automation:seis-core-ecosystem-registry");
}
if (ecosystemRegistry.schemaVersion !== "2.0.0" || ecosystemRegistry.status !== "source-backed-local-demo") {
  fail("ecosystem capability snapshot must use the source-backed v2 local-demo contract");
}
if (ecosystemRegistry.counts?.coreLanes !== 6
  || ecosystemRegistry.counts?.bundledPluginSources !== 6
  || ecosystemRegistry.counts?.repoSkills !== 25
  || ecosystemRegistry.counts?.auditedInstalledEnabledPlugins !== 185
  || ecosystemRegistry.counts?.cataloguedHelperPlugins !== 300
  || ecosystemRegistry.counts?.providers !== 7
  || ecosystemRegistry.counts?.mcpTools !== 37
  || ecosystemRegistry.counts?.mcpResources !== 30
  || ecosystemRegistry.counts?.mcpPrompts !== 3) {
  fail("ecosystem capability snapshot coverage counts drifted");
}
if (!ecosystemRegistry.lanes?.every((lane) => lane.executionAuthority === false && lane.mcp?.executionAuthority === false && lane.route?.href)) {
  fail("ecosystem lanes must remain execution-disabled and expose local launch routes");
}
if (ecosystemRegistry.runtimeBoundary?.providerCalls !== false
  || ecosystemRegistry.runtimeBoundary?.credentialsRead !== false
  || ecosystemRegistry.runtimeBoundary?.liveMcpSessionStarted !== false
  || ecosystemRegistry.runtimeBoundary?.sshExecuted !== false
  || ecosystemRegistry.runtimeBoundary?.deploymentPerformed !== false
  || ecosystemRegistry.runtimeBoundary?.githubMutationPerformed !== false) {
  fail("ecosystem runtime snapshot violates the browser no-execution boundary");
}

if (aiCoreRuntimeSnapshot.id !== "seis-ai-core-runtime-snapshot") fail("AI Core runtime snapshot id mismatch");
if (JSON.stringify(aiCoreRuntimeSnapshot) !== JSON.stringify(expectedAiCoreRuntimeSnapshot)) {
  fail("AI Core runtime snapshot is stale; run npm run automation:seis-core-ai-runtime-snapshot");
}
if (aiCoreRuntimeSnapshot.status !== "local-readiness-linked") fail("AI Core runtime snapshot must be source-backed and linked");
if (aiCoreRuntimeSnapshot.providerRegistry?.coreCredentialRequirement !== "none") fail("AI Core runtime snapshot must keep the core zero-key");
if (aiCoreRuntimeSnapshot.providerRegistry?.providerCount !== 7) fail("AI Core runtime snapshot provider count drifted");
if (aiCoreRuntimeSnapshot.pluginMesh?.personalLaneCount !== 5) fail("AI Core runtime snapshot must expose five personal lanes");
if (aiCoreRuntimeSnapshot.pluginMesh?.installedEnabledCount !== 185) fail("AI Core runtime snapshot installed plugin audit drifted");
if (aiCoreRuntimeSnapshot.pluginMesh?.helperUniquePlugins !== 300) fail("AI Core runtime snapshot helper universe drifted");
if (aiCoreRuntimeSnapshot.agentRegistry?.managedLaneCount !== 9) fail("AI Core runtime snapshot managed lane count drifted");
if (aiCoreRuntimeSnapshot.agentRegistry?.agentCount !== 13) fail("AI Core runtime snapshot managed agent count drifted");
if (aiCoreRuntimeSnapshot.agentRegistry?.runtimeAuthority !== false) fail("AI Core managed agent registry must not have runtime authority");
if (!aiCoreRuntimeSnapshot.agentRegistry?.agents?.every((agent) => agent.executionAuthority === false)) {
  fail("AI Core managed agent records must remain execution-disabled");
}
if (!Object.values(aiCoreRuntimeSnapshot.agentRegistry?.safetyBoundary || {}).every((value) => value === false)) {
  fail("AI Core managed agent registry safety claims must remain false");
}
if (aiCoreRuntimeSnapshot.mcpRuntime?.toolCount !== 37 || aiCoreRuntimeSnapshot.mcpRuntime?.resourceCount !== 30) {
  fail("AI Core runtime snapshot MCP counts drifted from the canonical runtime contract");
}
if (!aiCoreRuntimeSnapshot.router?.scenarios?.every((scenario) => scenario.decision?.executionPerformed === false && scenario.decision?.providerCallsPerformed === false)) {
  fail("AI Core runtime scenarios must remain decision-only with provider calls disabled");
}

for (const laneId of ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data", "seis-store"]) {
  if (!ecosystemRegistry.lanes?.some((lane) => lane.id === laneId)) {
    fail(`ecosystem registry missing lane: ${laneId}`);
  }
}

for (const domain of requiredOperatingDomains) {
  if (!script.includes(`name: "${domain}"`)) {
    fail(`missing operating domain: ${domain}`);
  }
}

for (const agentField of ["capabilities", "tasks", "logs", "outputs"]) {
  if (!script.includes(`${agentField}: [`)) {
    fail(`missing agent evidence field: ${agentField}`);
  }
}

for (const system of requiredAiSystems) {
  if (!script.includes(`name: "${system}"`) && !script.includes(`primary: "${system}"`)) {
    fail(`missing AI system support: ${system}`);
  }
}

for (const lane of requiredOrchestrationLanes) {
  if (!script.includes(`lane: "${lane}"`)) {
    fail(`missing orchestration lane: ${lane}`);
  }
}

for (const selector of [
  ".plugin-card",
  ".ecosystem-control-plane",
  ".ecosystem-control-layout",
  ".ecosystem-lane-button",
  ".ecosystem-lane-detail",
  ".ecosystem-boundary-strip",
  ".ecosystem-term-list",
  ".ecosystem-facts",
  ".ecosystem-lane-actions",
  ".ai-core-runtime-panel",
  ".ai-core-summary-card",
  ".ai-core-provider-card",
  ".ai-core-scenario-button",
  ".ai-core-decision-card",
  ".ai-core-mesh-strip",
  ".managed-agent-registry-panel",
  ".managed-agent-summary-item",
  ".managed-agent-button",
  ".managed-agent-detail",
  ".godmode-workbench",
  ".mission-composer",
  ".lane-chip",
  ".protocol-step",
  ".ai-setup-card",
  ".run-step",
  ".guardrail-row",
  ".artifact-card",
  ".operations-readiness-panel",
  ".readiness-card",
  ".readiness-row",
  ".decision-summary-card",
  ".feature-growth-ledger",
  ".ledger-row",
  ".blocker-row",
  ".automation-card",
  ".automation-ops-layout",
  ".workflow-run-row",
  ".approval-row",
  ".rollback-row",
  ".security-card",
  ".security-ops-layout",
  ".permission-review-row",
  ".dependency-scan-row",
  ".security-audit-row",
  ".system-card",
  ".domain-card",
  ".phase-row",
  ".architecture-ops-layout",
  ".dependency-edge",
  ".relationship-row",
  ".debt-row",
  ".activity-row",
  ".dependency-row",
  ".agent-detail",
  ".orchestration-card",
  ".handoff-row",
  ".knowledge-map-panel",
  ".knowledge-node-card",
  ".knowledge-edge-row",
  ".memory-evidence-row",
  ".decision-history-row",
  ".pattern-card"
]) {
  if (!css.includes(selector)) {
    fail(`missing CSS selector: ${selector}`);
  }
}

for (const section of requiredDocSections) {
  if (!architectureDoc.includes(`## ${section}`)) {
    fail(`missing architecture doc section: ${section}`);
  }
}

if (!manifest.name?.includes("SEIS Command Center")) {
  fail("manifest name must identify SEIS Command Center");
}

if (!readme.includes("SEIS Command Center") || !readme.includes("Plugins & Extensions") || !readme.includes("Operating Model") || !readme.includes("Ecosystem Control Plane") || !readme.includes("AI Core Runtime Snapshot")) {
  fail("README must describe SEIS Command Center, operating model, plugin surface, ecosystem control plane, and AI Core runtime snapshot");
}

console.log("SEIS Command Center check passed.");
