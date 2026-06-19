import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const appRoot = path.join(root, "apps", "seis-core");
const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "manifest.webmanifest",
  "README.md",
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
  "renderCommandResults"
];

const requiredDocSections = [
  "Folder Structure",
  "Component Map",
  "Data Model",
  "Operating Model",
  "God Mode Operations Model",
  "AI Orchestration Model",
  "Automation Operations Model",
  "Architecture Operations Model",
  "Security Operations Model",
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
  ".godmode-workbench",
  ".mission-composer",
  ".lane-chip",
  ".protocol-step",
  ".ai-setup-card",
  ".run-step",
  ".guardrail-row",
  ".artifact-card",
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
  ".handoff-row"
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

if (!readme.includes("SEIS Command Center") || !readme.includes("Plugins & Extensions") || !readme.includes("Operating Model")) {
  fail("README must describe SEIS Command Center, operating model, and plugin surface");
}

console.log("SEIS Command Center check passed.");
