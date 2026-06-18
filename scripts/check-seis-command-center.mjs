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
  "securityReports",
  "aiSystems",
  "renderCommandResults"
];

const requiredDocSections = [
  "Folder Structure",
  "Component Map",
  "Data Model",
  "API Design",
  "Testing Strategy",
  "Roadmap",
  "Deployment Strategy",
  "Security Model"
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

for (const selector of [".plugin-card", ".automation-card", ".security-card", ".system-card"]) {
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

if (!readme.includes("SEIS Command Center") || !readme.includes("Plugins & Extensions")) {
  fail("README must describe SEIS Command Center and plugin surface");
}

console.log("SEIS Command Center check passed.");
