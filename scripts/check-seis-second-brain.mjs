#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = "content/development/seis-second-brain-system.json";
const docsPath = "docs/product/seis-second-brain.md";
const desktopJsPath = "apps/web/desktop.js";
const desktopCssPath = "apps/web/desktop.css";
const packagePath = "package.json";
const trainingCurriculumPath = "content/development/seis-language-model-training-curriculum.json";
const trainingCurriculumReportPath = "reports/seis-model-scaling/seis-language-model-training-curriculum.md";
const workforcePath = "SEIS_AGENT_WORKFORCE.md";
const subAgentsPath = "SEIS_SUB_AGENTS.md";
const vaultWorkforcePath = "seis-brain/vault/05_Agents/Agent Workforce.md";
const vaultProductAgentPath = "seis-brain/vault/05_Agents/Product Agent.md";
const obsidianContextPath = "seis-brain/vault/12_Context_Packs/SEIS Obsidian Context.md";
const secondBrainMcpResource = "seis://brain/second-brain-system.json";
const mcpQuickstartPath = "docs/ai/seis-second-brain-mcp-quickstart.md";
const docsIndexPath = "docs/INDEX.md";
const readmePath = "README.md";
const demoStatusPath = "docs/product/seis-demo-status.md";
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
const requiredSecondBrainAgentLanes = [
  "Architect Agent",
  "Code Agent",
  "Design Agent",
  "Search Agent",
  "Security Agent",
  "Documentation Agent",
  "Research Agent",
  "Automation Agent",
  "Product Agent"
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

for (const [filePath, label] of [
  [contractPath, "Second Brain contract"],
  [docsPath, "Second Brain product docs"],
  [desktopJsPath, "Desktop runtime"],
  [desktopCssPath, "Desktop styles"],
  [packagePath, "package.json"],
  [trainingCurriculumPath, "language model training curriculum"],
  [trainingCurriculumReportPath, "language model training curriculum report"],
  [workforcePath, "SEIS Agent Workforce roster"],
  [subAgentsPath, "SEIS sub-agent contract"],
  [vaultWorkforcePath, "Obsidian vault workforce note"],
  [vaultProductAgentPath, "Obsidian vault Product Agent note"],
  [obsidianContextPath, "Obsidian context pack"],
  [mcpQuickstartPath, "Second Brain MCP quickstart"],
  [docsIndexPath, "documentation index"],
  [readmePath, "repository README"],
  [demoStatusPath, "SEIS demo status docs"]
]) {
  ensureFile(filePath, label);
}

const contract = readJson(contractPath, "Second Brain contract");
const docs = readText(docsPath, "Second Brain product docs");
const desktopJs = readText(desktopJsPath, "Desktop runtime");
const desktopCss = readText(desktopCssPath, "Desktop styles");
const packageJson = readJson(packagePath, "package.json");
const workforce = readText(workforcePath, "SEIS Agent Workforce roster");
const subAgents = readText(subAgentsPath, "SEIS sub-agent contract");
const vaultWorkforce = readText(vaultWorkforcePath, "Obsidian vault workforce note");
const vaultProductAgent = readText(vaultProductAgentPath, "Obsidian vault Product Agent note");
const obsidianContext = readText(obsidianContextPath, "Obsidian context pack");
const mcpQuickstart = readText(mcpQuickstartPath, "Second Brain MCP quickstart");
const docsIndex = readText(docsIndexPath, "documentation index");
const readme = readText(readmePath, "repository README");
const demoStatus = readText(demoStatusPath, "SEIS demo status docs");

if (contract) {
  ensure(contract.id === "seis-second-brain-system", "contract id must be seis-second-brain-system");
  ensure(contract.status === "local-demo", "contract status must be local-demo");
  ensure(contract.qualityGate === "npm run check:seis-second-brain", "contract must declare the npm quality gate");
  ensure(contract.desktopAppId === "second-brain", "contract must bind desktop app id second-brain");
  ensure(contract.routeId === "seis-second-brain-app", "contract must bind route id seis-second-brain-app");
  ensure(contract.vaultRoot === "/home/seis/SecondBrain", "contract must declare browser-local vault root");
  ensure(contract.trainingPackPath === "/home/seis/SecondBrain/07-learning/seis-agent-training-pack.md", "contract must declare browser-local training pack path");
  ensure(contract.mcpResource === secondBrainMcpResource, "contract must declare the read-only Second Brain MCP resource");
  ensure(contract.repositoryContextPack?.status === "repo-owned-public-safe", "contract repository context pack must remain repo-owned and public-safe");
  ensure(contract.repositoryContextPack?.path === obsidianContextPath, "contract repository context pack path mismatch");
  ensure(contract.repositoryContextPack?.access === "read-only local and MCP contract context", "contract repository context pack must stay read-only");
  ensure(contract.repositoryContextPack?.privateVaultRead === false, "contract repository context pack must not read private vaults");
  ensure(contract.repositoryContextPack?.modelWeightTraining === false, "contract repository context pack must not claim model-weight training");
  ensure(contract.releaseReviewPacketPath === "reports/seis-public-demo/pr54-review-packet-latest.md", "contract must declare PR #54 release review packet path");
  ensure(contract.languageModelTrainingCurriculum?.status === "planned-training-contract", "contract must bind planned language model training curriculum");
  ensure(contract.languageModelTrainingCurriculum?.contractPath === trainingCurriculumPath, "contract language model training curriculum path mismatch");
  ensure(contract.languageModelTrainingCurriculum?.reportPath === trainingCurriculumReportPath, "contract language model training curriculum report path mismatch");
  ensure(String(contract.languageModelTrainingCurriculum?.boundary || "").includes("No model install"), "contract language model training curriculum boundary must block model installs");
  ensure(contract.obsidianBridge?.status === "planned", "Obsidian bridge must remain planned until implemented and reviewed");
  ensure(contract.securityBoundary?.storesSecrets === false, "Second Brain must not store secrets");
  ensure(contract.securityBoundary?.providerCalls === false, "Second Brain must not call providers in Local Demo mode");
  ensure(contract.securityBoundary?.sshExecution === false, "Second Brain must not execute SSH");
  ensure(contract.securityBoundary?.deployment === false, "Second Brain must not deploy");
  ensure(contract.securityBoundary?.githubMutation === false, "Second Brain must not mutate GitHub");
  ensure(contract.securityBoundary?.requiresHumanReviewBeforePublicUse === true, "Second Brain must require human review before public use");
  ensureArrayMin(contract.installedAiProfiles, 6, "installedAiProfiles");
  ensureArrayMin(contract.managedSubAgentLanes, 9, "managedSubAgentLanes");
  ensureArrayMin(contract.vaultNotes, 6, "vaultNotes");
  ensureArrayMin(contract.agentLanes, 9, "agentLanes");
  ensureArrayMin(contract.autonomousAgentRoster, 13, "autonomousAgentRoster");
  ensureArrayMin(contract.pipeline, 4, "pipeline");
  ensureArrayMin(contract.githubGates, 4, "githubGates");
  ensureArrayIncludesAll(contract.managedSubAgentLanes, requiredManagedSubAgentLanes, "managedSubAgentLanes");
  ensureArrayIncludesAll((contract.agentLanes || []).map((lane) => lane.agent), requiredSecondBrainAgentLanes, "agentLanes");
  ensureArrayIncludesAll((contract.autonomousAgentRoster || []).map((agent) => agent.agent), requiredAutonomousAgentRoster, "autonomousAgentRoster");

  const noteIds = new Set((contract.vaultNotes || []).map((note) => note.id));
  for (const note of contract.vaultNotes || []) {
    ensure(note.path?.startsWith("/home/seis/SecondBrain/"), `note ${note.id} must stay inside browser-local SecondBrain path`);
    ensure(Array.isArray(note.links), `note ${note.id} must define links`);
    for (const target of note.links || []) {
      ensure(noteIds.has(target), `note ${note.id} links to unknown note ${target}`);
    }
  }

  for (const gate of [
    "no secrets or private vault content",
    "mock, planned, disabled, and real labels are explicit",
    "human approval before push, merge, release, Pages publication, or public community launch"
  ]) {
    ensure((contract.githubGates || []).includes(gate), `contract githubGates missing ${gate}`);
  }
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-second-brain"] === "node scripts/check-seis-second-brain.mjs",
    "package.json must expose check:seis-second-brain"
  );
}

for (const phrase of [
  "SEIS Second Brain",
  "Obsidian-style Markdown vault",
  "installed AI profiles",
  "bounded sub-agent lanes",
  "all 6 current installed AI profiles",
  "All 9 current managed SEIS sub-agent lanes",
  "13-agent target roster",
  "Repo-owned Obsidian context pack",
  "seis://brain/second-brain-system.json",
  "GitHub readiness",
  "Agent training pack",
  "Language model training curriculum",
  "without installing models",
  "Human review required",
  "npm run check:seis-second-brain",
  "does not import a private Obsidian vault",
  "does not execute SSH"
]) {
  ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
}

for (const [text, label, phrases] of [
  [workforce, "SEIS Agent Workforce roster", ["`Product Agent`", "Product Agent boundary", "status/plan-only"]],
  [subAgents, "SEIS sub-agent contract", ["- Product Agent", "Product Agent boundary", "does not approve releases"]],
  [vaultWorkforce, "Obsidian vault workforce note", ["`Product Agent`", "[[Product Agent]]", "status/plan-only"]],
  [vaultProductAgent, "Obsidian vault Product Agent note", ["# Product Agent", "module: seis-product", "status: draft", "visibility: public", "Status/plan-only"]],
  [obsidianContext, "Obsidian context pack", ["[[Product Agent]]", "status/plan-only"]],
  [demoStatus, "SEIS demo status docs", ["all 9 current managed sub-agent lanes", "13-agent target roster"]]
]) {
  for (const phrase of phrases) {
    ensure(text.includes(phrase), `${label} missing phrase: ${phrase}`);
  }
}

for (const phrase of [
  "SEIS Second Brain MCP Quickstart",
  "packages/seis-ai/bin/seis-mcp.mjs",
  secondBrainMcpResource,
  "SEIS Hub",
  "SEIS Cloud",
  "SEIS-Code",
  "SEIS-Design",
  "SEIS-DATA",
  "SEIS Security",
  "SEIS Research",
  "SEIS Automation",
  "SEIS Product",
  "seis_product_status",
  "No private Obsidian vault",
  "model-weight training"
]) {
  ensure(mcpQuickstart.includes(phrase), `Second Brain MCP quickstart missing phrase: ${phrase}`);
}

ensure(docsIndex.includes("ai/seis-second-brain-mcp-quickstart.md"), "documentation index must link the Second Brain MCP quickstart");
ensure(readme.includes("./docs/ai/seis-second-brain-mcp-quickstart.md"), "README must link the Second Brain MCP quickstart");

for (const phrase of [
  "SEIS_SECOND_BRAIN_SYSTEM",
  "second-brain",
  "seis-second-brain-app",
  "data-second-brain-app",
  "data-ai-second-brain-bridge",
  "data-second-brain-github-gate",
  "data-second-brain-ai-index",
  "data-second-brain-installed-ai",
  "data-second-brain-subagents",
  "data-second-brain-agent-roster",
  "second-brain-capture",
  "second-brain-link",
  "second-brain-training-pack",
  "second-brain-review",
  "second-brain-export-github",
  "Save Vault Snapshot",
  "buildSecondBrainSnapshotMarkdown",
  "saveSecondBrainSnapshot",
  "reviewSecondBrainVault",
  "exportSecondBrainGithubReadiness",
  "seis-second-brain-vault-snapshot.md",
  "github-readiness-review.md",
  "seis-agent-training-pack.md",
  "releaseReviewPacketPath",
  "pr54-review-packet-latest.md",
  "repositoryContextPack",
  "seis://brain/second-brain-system.json",
  "Repo-owned Obsidian context pack",
  "seis-language-model-training-curriculum.json",
  "seis-language-model-training-curriculum.md",
  "Language Model Training Curriculum",
  "No model install",
  "exportSecondBrainTrainingPack",
  "buildSecondBrainTrainingPackMarkdown",
  "SEIS_INSTALLED_AI_SYSTEMS.length",
  "managedSubAgentLanes",
  "data-second-brain-managed-lanes",
  "seis_product_status",
  "autonomousAgentRoster",
  "Obsidian bridge planned",
  "Human review before GitHub",
  "npm run check:seis-second-brain"
]) {
  ensure(desktopJs.includes(phrase), `desktop.js missing phrase: ${phrase}`);
}

ensure(desktopJs.includes("const laneRows = SEIS_SECOND_BRAIN_SYSTEM.managedSubAgentLanes.map"), "Second Brain training pack must use the canonical managed sub-agent lanes");
ensure(desktopJs.includes("Observed sub-agent lanes: ${SEIS_SECOND_BRAIN_SYSTEM.managedSubAgentLanes.length}"), "Second Brain training pack must report the canonical managed-lane count");
ensure(desktopJs.includes("managedSubAgentLanes: SEIS_SECOND_BRAIN_SYSTEM.managedSubAgentLanes.length"), "Second Brain training-pack activity must record the canonical managed-lane count");
ensure(!desktopJs.includes("Observed sub-agent lanes: ${SUB_AGENT_DEMO.lanes.length}"), "Second Brain training pack must not report the legacy six-lane demo count");

for (const appId of [
  "seis-system-os",
  "search",
  "ai-assistant",
  "seis-command-center",
  "files"
]) {
  ensure(desktopJs.includes(`data-app-id="${appId}"`) || desktopJs.includes(`appId: "${appId}"`) || desktopJs.includes(`"${appId}"`), `desktop.js must connect Second Brain with ${appId}`);
}

for (const selector of [
  ".second-brain-app",
  ".second-brain-hero",
  ".second-brain-layout",
  ".second-brain-vault",
  ".second-brain-graph",
  ".second-brain-node",
  ".second-brain-inspector",
  ".second-brain-pipeline"
]) {
  ensure(desktopCss.includes(selector), `desktop.css missing selector ${selector}`);
}

for (const filePath of [
  contractPath,
  docsPath,
  desktopJsPath,
  trainingCurriculumPath,
  trainingCurriculumReportPath,
  workforcePath,
  subAgentsPath,
  vaultWorkforcePath,
  vaultProductAgentPath,
  obsidianContextPath,
  mcpQuickstartPath,
  demoStatusPath
]) {
  requireNotMatches(filePath, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(filePath, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(filePath, /\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS Second Brain check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Second Brain check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function ensureArrayMin(value, minimum, label) {
  ensure(Array.isArray(value), `${label} must be an array`);
  ensure(Array.isArray(value) && value.length >= minimum, `${label} must include at least ${minimum} records`);
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) return "";
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

function requireNotMatches(filePath, pattern, label) {
  const text = readText(filePath, filePath);
  if (pattern.test(text)) failures.push(`${filePath} contains ${label}`);
}
