import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const appRoot = path.join(root, "apps", "seis-core");
const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "ai-core-contract-fixture.js",
  "manifest.webmanifest",
  "README.md",
  "test/seis-core-static.test.js"
];
const requiredRootFiles = [
  "scripts/capture-seis-core-local-retrieval-visual.mjs",
  "scripts/capture-seis-core-ai-core-panel-navigation.mjs",
  "reports/evals/local-retrieval-browser-visual-qa.md",
  "reports/evals/ai-core-panel-navigation-browser-qa.md"
];

const requiredModules = [
  "Dashboard",
  "Goals",
  "Repositories",
  "Documentation",
  "Agents",
  "AI Core",
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
  "securityReports",
  "aiSystems",
  "aiCoreContract",
  "renderAiCore",
  "seisAiCoreContractFixture",
  "operatingDomains",
  "platformPhases",
  "renderCommandResults"
];

const requiredDocSections = [
  "Folder Structure",
  "Component Map",
  "Data Model",
  "Operating Model",
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

for (const file of requiredRootFiles) {
  const filePath = path.join(root, file);
  if (!existsSync(filePath)) {
    fail(`missing ${file}`);
  }
}

const html = await readFile(path.join(appRoot, "index.html"), "utf8");
const script = await readFile(path.join(appRoot, "script.js"), "utf8");
const css = await readFile(path.join(appRoot, "styles.css"), "utf8");
const manifest = JSON.parse(await readFile(path.join(appRoot, "manifest.webmanifest"), "utf8"));
const readme = await readFile(path.join(appRoot, "README.md"), "utf8");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const visualQaReport = await readFile(path.join(root, "reports", "evals", "local-retrieval-browser-visual-qa.md"), "utf8");
const panelNavigationQaReport = await readFile(path.join(root, "reports", "evals", "ai-core-panel-navigation-browser-qa.md"), "utf8");
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

for (const selector of [".plugin-card", ".contract-card", ".ai-core-layout", ".automation-card", ".security-card", ".system-card", ".domain-card", ".phase-row"]) {
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

if (!packageJson.scripts?.["qa:seis-core:local-retrieval:visual"]) {
  fail("package.json must expose qa:seis-core:local-retrieval:visual");
}

if (!packageJson.scripts?.["qa:seis-core:ai-core-panels"]) {
  fail("package.json must expose qa:seis-core:ai-core-panels");
}

if (!readme.includes("npm run qa:seis-core:local-retrieval:visual")) {
  fail("README must document Local Retrieval visual QA command");
}

if (!readme.includes("npm run qa:seis-core:ai-core-panels")) {
  fail("README must document AI Core panel navigation QA command");
}

if (
  !visualQaReport.includes("Browser-run visual and interaction QA evidence") ||
  !visualQaReport.includes("query/source-class/transcript-state") ||
  !visualQaReport.includes("status text") ||
  !visualQaReport.includes("Non-Claims")
) {
  fail("Local Retrieval browser QA report must document visual evidence, interaction evidence, and non-claims");
}

const normalizedPanelNavigationQaReport = panelNavigationQaReport.toLowerCase();
for (const requiredText of [
  "Browser-run AI Core panel navigation QA evidence",
  "route",
  "prompt",
  "agent",
  "approval",
  "evaluation",
  "evidence",
  "Local Retrieval",
  "desktop",
  "mobile",
  "Non-Claims"
]) {
  if (!normalizedPanelNavigationQaReport.includes(requiredText.toLowerCase())) {
    fail(`AI Core panel navigation QA report missing required text: ${requiredText}`);
  }
}

console.log("SEIS Command Center check passed.");
