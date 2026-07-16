#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const required = [
  "plugins/seis-ai-agent/.codex-plugin/plugin.json",
  "plugins/seis-ai-agent/.mcp.json",
  "plugins/seis-ai-agent/assets/agent-profile.json",
  "plugins/seis-ai-agent/assets/lanes/seis-cloud.json",
  "plugins/seis-ai-agent/assets/lanes/seis-code.json",
  "plugins/seis-ai-agent/assets/lanes/seis-governance.json",
  "plugins/seis-ai-agent/assets/lanes/seis-design.json",
  "plugins/seis-ai-agent/assets/lanes/seis-data.json",
  "plugins/seis-ai-agent/assets/lanes/seis-security.json",
  "plugins/seis-ai-agent/assets/lanes/seis-research.json",
  "plugins/seis-ai-agent/assets/lanes/seis-automation.json",
  "plugins/seis-ai-agent/assets/lanes/seis-product.json",
  "plugins/seis-ai-agent/skills/seis-ai-agent/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-governance/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-hub/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-cloud/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-code/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-design/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-data/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-security/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-security/agents/openai.yaml",
  "plugins/seis-ai-agent/skills/seis-research/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-research/agents/openai.yaml",
  "plugins/seis-ai-agent/skills/seis-automation/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-automation/agents/openai.yaml",
  "plugins/seis-ai-agent/skills/seis-product/SKILL.md",
  "plugins/seis-ai-agent/skills/seis-product/agents/openai.yaml",
  "plugins/seis-ai-agent/README.md",
  "plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs",
  "scripts/install-seis-ai-agent.mjs",
  "scripts/check-seis-public-plugin-install-smoke.mjs",
  "scripts/create-seis-public-plugin-lifecycle.mjs",
  "scripts/create-seis-public-plugin-fresh-task-proof.mjs",
  "scripts/capture-seis-public-plugin-fresh-task-reload-evidence.mjs",
  "scripts/create-seis-public-plugin-security-provenance-review.mjs",
  "scripts/create-seis-public-plugin-external-install-proof.mjs",
  "scripts/create-seis-plugin-canonicalization.mjs",
  "scripts/create-seis-unified-plugin-suite.mjs",
  "scripts/create-seis-public-plugin-independent-runner-evidence-contract.mjs",
  "scripts/check-seis-public-plugin-independent-runner-evidence.mjs",
  "content/development/seis-public-plugin-lifecycle.json",
  "content/development/seis-public-plugin-fresh-task-proof.json",
  "content/development/seis-public-plugin-fresh-task-reload-evidence.json",
  "content/development/seis-public-plugin-security-provenance-review.json",
  "content/development/seis-public-plugin-external-install-proof.json",
  "content/development/seis-plugin-canonicalization.json",
  "content/development/seis-public-plugin-independent-runner-evidence-contract.json",
  "plugins/seis-ai-agent/assets/unified-suite.json",
  "reports/seis-public-plugin-lifecycle.md",
  "reports/seis-public-plugin-fresh-task-proof.md",
  "reports/seis-public-plugin-fresh-task-reload-evidence.md",
  "reports/seis-public-plugin-security-provenance-review.md",
  "reports/seis-public-plugin-external-install-proof.md",
  "reports/seis-plugin-canonicalization.md",
  "reports/seis-public-plugin-independent-runner-evidence-contract.md",
  "docs/platform/seis-ai-agent.md",
  "install/seis-ai-agent/install.sh",
  "install/seis-ai-agent/install.ps1",
  ".agents/plugins/marketplace.json",
  "scripts/cloud-migration-audit.mjs",
  "docs/deployment/local-to-cloud-ssh-playbook.md",
  "docs/deployment/server-target-selection.md",
  "docs/deployment/server-upload-runbook.md",
  "docs/development/first-run-quickstart.md"
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) failures.push(`missing file: ${file}`);
const manifest = readJson("plugins/seis-ai-agent/.codex-plugin/plugin.json");
const profile = readJson("plugins/seis-ai-agent/assets/agent-profile.json");
const mcp = readJson("plugins/seis-ai-agent/.mcp.json");
const marketplace = readJson(".agents/plugins/marketplace.json");
const identities = readJson("data/seis-operating-identities.json");
const packageJson = readJson("package.json");
const publicPluginEntries = [["seis-ai-agent", "./plugins/seis-ai-agent"]];
ensure(manifest?.name === "seis-ai-agent", "manifest name must be seis-ai-agent");
ensure(manifest?.mcpServers === "./.mcp.json", "manifest must reference ./.mcp.json");
ensure(manifest?.interface?.capabilities?.includes("Unified SEIS orchestration"), "manifest must expose unified orchestration");
ensure(manifest?.interface?.displayName === "SEIS-Agent", "manifest display name must be SEIS-Agent");
ensure(manifest?.interface?.capabilities?.includes("Memory and context governance"), "manifest must expose memory and context governance");
ensure(manifest?.interface?.capabilities?.includes("SEIS Security threat, secret, and release-risk review"), "manifest must expose SEIS Security capability");
ensure(manifest?.interface?.capabilities?.includes("SEIS Research evidence and source evaluation"), "manifest must expose SEIS Research capability");
ensure(manifest?.interface?.capabilities?.includes("SEIS Automation repeatable workflow and runbook design"), "manifest must expose SEIS Automation capability");
ensure(manifest?.interface?.capabilities?.includes("SEIS Product roadmap, scope, and acceptance criteria"), "manifest must expose SEIS Product capability");
ensure(profile?.displayName === "SEIS-Agent", "profile display name must be SEIS-Agent");
ensure(profile?.aliases?.includes("SEIS-AI Agent"), "profile must preserve SEIS-AI Agent alias");
ensure(profile?.installId === "seis-ai-agent@seis-repo", "profile install id must use seis-repo");
ensure(profile?.version === 2, "profile must use unified suite profile version 2");
ensure(profile?.releaseVersion === "0.3.0+codex.20260712", "profile must expose the unified release version");
ensure(profile?.consolidationPolicy?.defaultInstallMode === "single-public-plugin", "profile must use a single public install");
ensure(profile?.consolidationPolicy?.standaloneLaneInstallMode === "source-module-only", "profile must retain lane packages as source modules only");
ensure(profile?.consolidationPolicy?.marketplacePolicy === "seis-agent-is-the-only-public-plugin-with-embedded-source-modules", "profile must publish the single public install policy");
ensure(profile?.consolidationPolicy?.unifiedSuite === "assets/unified-suite.json", "profile must point at the unified suite file");
ensure(profile?.consolidationPolicy?.futurePluginIntake?.includes("assets/unified-suite.json"), "profile must route future SEIS plugins into the unified suite");
ensure(profile?.applicationSourceBoundary?.application === "apps/seis-core", "profile must expose the SEIS Core application boundary");
ensure(profile?.applicationSourceBoundary?.sourceRoot === "plugins/seis-core", "profile must expose the app-owned source root");
ensure(profile?.applicationSourceBoundary?.sourceManifest === "apps/seis-core/data/seis-core-plugin-sources.json", "profile must expose the app-owned source manifest");
ensure(profile?.applicationSourceBoundary?.installSurface === "repo-source-app", "profile must expose the direct repo app install surface");
ensure(profile?.applicationSourceBoundary?.sourceAvailableInRepository === true, "profile must mark app sources as repo-available");
ensure(profile?.applicationSourceBoundary?.applicationOwnedPluginCount === 60, "profile must expose all 60 app-owned plugins");
ensure(profile?.applicationSourceBoundary?.publicMarketplaceEntryCount === 0, "app-owned plugins must not become marketplace cards");
ensure(profile?.applicationSourceBoundary?.publicReleaseAllowed === false, "app-owned plugins must remain public-release gated");
ensure(profile?.applicationSourceBoundary?.coreSourceOwner === false, "profile must keep packages/seis-ai out of app source ownership");
ensure(profile?.terminalInstall?.defaultTarget === "seis-ai-agent@seis-repo", "profile must keep SEIS-Agent as terminal default target");
for (const name of ["seis", "seis-governance", "seis-cloud", "seis-code", "seis-design", "seis-data", "seis-security", "seis-research", "seis-automation", "seis-product"]) ensure(profile?.composedLanes?.includes(name), `profile missing lane ${name}`);
for (const name of ["seis-ai-agent", "seis-governance", "seis-hub", "seis-cloud", "seis-code", "seis-design", "seis-data", "seis-security", "seis-research", "seis-automation", "seis-product"]) ensure(profile?.consolidationPolicy?.embeddedSkills?.includes(name), `profile missing embedded skill ${name}`);
for (const platform of ["macos", "windows", "linux"]) ensure(profile?.terminalInstall?.platforms?.includes(platform), `profile missing ${platform}`);
ensure(profile?.websiteRoadmap?.direction?.includes("Cinematic"), "website roadmap must preserve cinematic direction");
ensure((identities?.identities || []).some((identity) => identity.name === "SEIS-Agent" && identity.repoSurface === "plugins/seis-ai-agent"), "operating identities must map SEIS-Agent to plugin");
ensure(mcp?.mcpServers?.["seis-ai-agent"]?.args?.[0] === "./scripts/seis-ai-agent-mcp-server.mjs", "MCP manifest must point at server");
ensure(marketplace?.plugins?.length === publicPluginEntries.length, "marketplace must publish only SEIS-Agent");
for (const [name, sourcePath] of publicPluginEntries) {
  const entry = marketplace?.plugins?.find((plugin) => plugin.name === name);
  ensure(entry?.source?.path === sourcePath, `marketplace must include ${name} at ${sourcePath}`);
  ensure(entry?.policy?.installation === "AVAILABLE", `marketplace ${name} must be AVAILABLE`);
  ensure(entry?.policy?.authentication === "ON_INSTALL", `marketplace ${name} must authenticate ON_INSTALL`);
}
ensure(packageJson?.scripts?.["cloud:migration:audit"] === "node scripts/cloud-migration-audit.mjs", "package scripts must expose cloud:migration:audit");
ensure(packageJson?.scripts?.["cloud:migration:audit:json"] === "node scripts/cloud-migration-audit.mjs --json", "package scripts must expose cloud:migration:audit:json");
ensure(packageJson?.scripts?.["cloud:migration:audit:ci"] === "node scripts/cloud-migration-audit.mjs --strict --json --output cloud-migration-audit.ci.json", "package scripts must expose cloud:migration:audit:ci");
ensure(packageJson?.scripts?.["check:seis-public-plugin-lifecycle"] === "node scripts/create-seis-public-plugin-lifecycle.mjs --check", "package scripts must expose check:seis-public-plugin-lifecycle");
ensure(packageJson?.scripts?.["check:seis-public-plugin-fresh-task-proof"] === "node scripts/create-seis-public-plugin-fresh-task-proof.mjs --check", "package scripts must expose check:seis-public-plugin-fresh-task-proof");
ensure(packageJson?.scripts?.["check:seis-public-plugin-fresh-task-reload-evidence"] === "node scripts/capture-seis-public-plugin-fresh-task-reload-evidence.mjs --check", "package scripts must expose check:seis-public-plugin-fresh-task-reload-evidence");
ensure(packageJson?.scripts?.["check:seis-public-plugin-security-provenance-review"] === "node scripts/create-seis-public-plugin-security-provenance-review.mjs --check", "package scripts must expose check:seis-public-plugin-security-provenance-review");
ensure(packageJson?.scripts?.["check:seis-public-plugin-external-install-proof"] === "node scripts/create-seis-public-plugin-external-install-proof.mjs --check", "package scripts must expose check:seis-public-plugin-external-install-proof");
ensure(packageJson?.scripts?.["check:seis-plugin-canonicalization"] === "node scripts/create-seis-plugin-canonicalization.mjs --check", "package scripts must expose check:seis-plugin-canonicalization");
ensure(packageJson?.scripts?.["check:seis-unified-plugin-suite"] === "node scripts/create-seis-unified-plugin-suite.mjs --check", "package scripts must expose check:seis-unified-plugin-suite");
ensure(packageJson?.scripts?.["check:seis-public-plugin-independent-runner-evidence-contract"] === "node scripts/create-seis-public-plugin-independent-runner-evidence-contract.mjs --check", "package scripts must expose check:seis-public-plugin-independent-runner-evidence-contract");
ensure(packageJson?.scripts?.["automation:seis-public-plugin-lifecycle"] === "node scripts/create-seis-public-plugin-lifecycle.mjs", "package scripts must expose automation:seis-public-plugin-lifecycle");
ensure(packageJson?.scripts?.["automation:seis-public-plugin-fresh-task-proof"] === "node scripts/create-seis-public-plugin-fresh-task-proof.mjs", "package scripts must expose automation:seis-public-plugin-fresh-task-proof");
ensure(packageJson?.scripts?.["automation:seis-public-plugin-fresh-task-reload-evidence"] === "node scripts/capture-seis-public-plugin-fresh-task-reload-evidence.mjs", "package scripts must expose automation:seis-public-plugin-fresh-task-reload-evidence");
ensure(packageJson?.scripts?.["automation:seis-public-plugin-security-provenance-review"] === "node scripts/create-seis-public-plugin-security-provenance-review.mjs", "package scripts must expose automation:seis-public-plugin-security-provenance-review");
ensure(packageJson?.scripts?.["automation:seis-public-plugin-external-install-proof"] === "node scripts/create-seis-public-plugin-external-install-proof.mjs", "package scripts must expose automation:seis-public-plugin-external-install-proof");
ensure(packageJson?.scripts?.["automation:seis-unified-plugin-suite"] === "node scripts/create-seis-unified-plugin-suite.mjs", "package scripts must expose automation:seis-unified-plugin-suite");
ensure(packageJson?.scripts?.["check:seis-public-plugin-install-smoke"] === "node scripts/check-seis-public-plugin-install-smoke.mjs", "package scripts must expose check:seis-public-plugin-install-smoke");
ensure(packageJson?.scripts?.["check:seis-public-plugin-install-smoke:local"] === "node scripts/check-seis-public-plugin-install-smoke.mjs --require-installed", "package scripts must expose check:seis-public-plugin-install-smoke:local");
ensure(packageJson?.scripts?.["check:seis-public-plugin-install-smoke:mcp"] === "node scripts/check-seis-public-plugin-install-smoke.mjs --mcp-smoke", "package scripts must expose check:seis-public-plugin-install-smoke:mcp");
ensure(packageJson?.scripts?.["check:seis-public-plugin-install-smoke:local:mcp"] === "node scripts/check-seis-public-plugin-install-smoke.mjs --require-installed --mcp-smoke", "package scripts must expose check:seis-public-plugin-install-smoke:local:mcp");
contains("scripts/install-seis-ai-agent.mjs", "seis-ai-agent@seis-repo", "installer must include repo install id");
contains("scripts/install-seis-ai-agent.mjs", "plan-only", "installer must default to plan-only");
contains("scripts/install-seis-ai-agent.mjs", "SEIS-Agent is the only public install target", "installer must document single public install policy");
contains("scripts/install-seis-ai-agent.mjs", "single-public-plugin", "installer must default to one public plugin");
contains("scripts/install-seis-ai-agent.mjs", "standalone lane installation is retired", "installer must reject standalone lane installation");
contains("scripts/check-seis-public-plugin-install-smoke.mjs", "publicPluginCount", "install smoke checker must report public plugin count");
contains("scripts/check-seis-public-plugin-install-smoke.mjs", "--require-installed", "install smoke checker must support local installed-cache enforcement");
contains("scripts/check-seis-public-plugin-install-smoke.mjs", "--mcp-smoke", "install smoke checker must support installed MCP server smoke checks");
contains("scripts/create-seis-public-plugin-lifecycle.mjs", "fresh task reload proof", "lifecycle generator must keep fresh task reload proof as a public preview gate");
contains("scripts/create-seis-public-plugin-fresh-task-proof.mjs", "pending-fresh-task-reload-proof", "fresh-task proof generator must keep public preview pending until fresh task evidence exists");
contains("scripts/capture-seis-public-plugin-fresh-task-reload-evidence.mjs", "CODEX_THREAD_ID", "fresh-task evidence capture must record the Codex task/thread id when exposed");
contains("scripts/create-seis-public-plugin-security-provenance-review.mjs", "rawSecretValuesStored", "security/provenance review must avoid storing raw secret values");
contains("scripts/create-seis-public-plugin-external-install-proof.mjs", "repoLocalStagingIsNotIndependentProof", "external install proof must not overstate local artifact staging");
contains("scripts/create-seis-unified-plugin-suite.mjs", "active-single-public-plugin", "unified suite generator must preserve one public install boundary");
contains("plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs", "unifiedSuite", "SEIS-Agent MCP server must expose unified suite status");
contains("content/development/seis-public-plugin-lifecycle.json", "internal-review-local-proof", "lifecycle contract must keep internal-review local proof channel");
contains("content/development/seis-public-plugin-fresh-task-proof.json", "publicReleaseAllowed\": false", "fresh-task proof contract must block public release");
contains("content/development/seis-public-plugin-fresh-task-reload-evidence.json", "publicReleaseAllowed\": false", "fresh-task reload evidence must block public release");
contains("content/development/seis-public-plugin-security-provenance-review.json", "publicReleaseAllowed\": false", "security/provenance review must block public release");
contains("content/development/seis-public-plugin-external-install-proof.json", "publicReleaseAllowed\": false", "external install proof must block public release");
contains("reports/seis-public-plugin-lifecycle.md", "Public Preview Gates", "lifecycle report must expose public preview gates");
contains("reports/seis-public-plugin-fresh-task-proof.md", "NO-GO for public preview", "fresh-task proof report must expose public preview NO-GO");
contains("reports/seis-public-plugin-fresh-task-reload-evidence.md", "NO-GO for public preview", "fresh-task reload evidence report must expose public preview NO-GO");
contains("reports/seis-public-plugin-security-provenance-review.md", "NO-GO for public preview", "security/provenance review report must expose public preview NO-GO");
contains("reports/seis-public-plugin-external-install-proof.md", "NO-GO for public preview", "external install proof report must expose public preview NO-GO");
contains("docs/platform/seis-ai-agent.md", "macOS", "platform doc must mention macOS");
contains("docs/platform/seis-ai-agent.md", "Windows", "platform doc must mention Windows");
contains("docs/platform/seis-ai-agent.md", "Linux", "platform doc must mention Linux");
contains("docs/platform/seis-ai-agent.md", "SEIS-Agent", "platform doc must use SEIS-Agent identity");
contains("docs/platform/seis-ai-agent.md", "Consolidation Rule", "platform doc must define consolidation rule");
contains("docs/platform/seis-ai-agent.md", "Cloud Access and Migration Quality", "platform doc must define cloud migration quality section");
contains("docs/platform/seis-ai-agent.md", "npm run check:cloud-access-policy", "platform doc must reference cloud access policy gate");
contains("docs/platform/seis-ai-agent.md", "npm run cloud:migration:audit", "platform doc must reference migration audit command");
contains("docs/platform/seis-ai-agent.md", "local-to-cloud-ssh-playbook.md", "platform doc must reference local-to-cloud SSH playbook");
contains("docs/platform/seis-ai-agent.md", "server-upload-runbook.md", "platform doc must reference server upload runbook");
contains("docs/platform/seis-ai-agent.md", "server-target-selection.md", "platform doc must reference server target selection playbook");
contains("plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs", "seis_ai_agent_status", "MCP server must expose status tool");
contains("plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs", "SEIS-Data: memory, context systems", "MCP server must route memory/context through SEIS-Data");
contains("plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs", "seis_agent_lanes", "MCP server must expose embedded lane inventory");
for (const tool of ["seis_hub_status", "seis_hub_plan", "seis_governance_status", "seis_governance_plan", "seis_cloud_status", "seis_cloud_plan", "seis_code_status", "seis_code_plan", "seis_design_status", "seis_design_plan", "seis_data_status", "seis_data_plan", "seis_security_status", "seis_security_plan", "seis_research_status", "seis_research_plan", "seis_automation_status", "seis_automation_plan", "seis_product_status", "seis_product_plan"]) {
  contains("plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs", tool, `MCP server must expose ${tool}`);
}
validateInstallerPlan([]);
validateRetiredInstallerOption();
validateMcpSmoke();
if (failures.length) { console.error("SEIS-AI Agent check failed:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("SEIS-AI Agent check passed.");
function ensure(condition, message) { if (!condition) failures.push(message); }
function readJson(file) { try { return JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); } catch { failures.push(`invalid JSON: ${file}`); return null; } }
function contains(file, token, message) { if (fs.existsSync(path.join(root, file))) ensure(fs.readFileSync(path.join(root, file), "utf8").includes(token), message); }
function validateInstallerPlan(extraArgs) {
  const result = spawnSync(process.execPath, ["scripts/install-seis-ai-agent.mjs", ...extraArgs], { cwd: root, encoding: "utf8", timeout: 5000 });
  if (result.error) {
    failures.push(`installer plan failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    failures.push(`installer plan exited ${result.status}: ${String(result.stderr || "").trim()}`);
    return;
  }
  let payload;
  try {
    payload = JSON.parse(result.stdout);
  } catch {
    failures.push("installer plan must emit JSON");
    return;
  }
  const targets = payload?.readiness?.targets || [];
  ensure(payload?.mode === "plan-only", "installer must default to plan-only");
  ensure(targets[0] === "seis-ai-agent@seis-repo", "installer first target must be seis-ai-agent@seis-repo");
  ensure(payload?.readiness?.primaryInstallId === "seis-ai-agent@seis-repo", "installer readiness must expose primary install id");
  ensure(payload?.readiness?.defaultInstallMode === "single-public-plugin", "installer readiness must use a single public install");
  ensure(payload?.readiness?.unifiedSuite?.componentCount >= 10, "installer unified suite must expose every current component");
  ensure(payload?.readiness?.applicationSource?.applicationPath === "apps/seis-core", "installer must expose the SEIS Core app path");
  ensure(payload?.readiness?.applicationSource?.sourceRoot === "plugins/seis-core", "installer must expose the app-owned source root");
  ensure(payload?.readiness?.applicationSource?.pluginCount === 60, "installer must expose all 60 app-owned plugins");
  ensure(payload?.readiness?.applicationSource?.sourceAvailableInRepository === true, "installer must expose app sources as repo-available");
  ensure(payload?.readiness?.applicationSource?.marketplaceEntryCount === 0, "installer must keep app-owned plugins out of marketplace cards");
  ensure(payload?.readiness?.consolidationPolicy?.includes("SEIS-Agent is the only public install target"), "installer must document single public plugin policy");
  ensure(payload?.readiness?.canonicalization?.effectivePluginCount === 1, "installer must expose one canonical public plugin");
  ensure(payload?.readiness?.canonicalization?.legacyAliasCount === 5, "installer must preserve five legacy aliases");
  ensure(payload?.readiness?.canonicalization?.personalMarketplaceMutation === false, "installer must not mutate the personal marketplace");
  ensure(targets.length === 1, "installer plan must install only SEIS-Agent");
  ensure(targets.every((target) => target.endsWith("@seis-repo")), "installer targets must remain canonical repo identities");
}
function validateRetiredInstallerOption() {
  const result = spawnSync(process.execPath, ["scripts/install-seis-ai-agent.mjs", "--with-standalone-lanes"], { cwd: root, encoding: "utf8", timeout: 5000 });
  ensure(result.status !== 0, "installer must reject the retired standalone-lane option");
  ensure(String(result.stderr || result.stdout).includes("standalone lane installation is retired"), "retired standalone-lane option must explain the single-plugin migration");
}
function frame(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}
function parseResponses(stdout) {
  const responses = [];
  let buffer = Buffer.from(stdout);
  while (buffer.length > 0) {
    const separator = buffer.indexOf("\r\n\r\n");
    if (separator < 0) break;
    const header = buffer.slice(0, separator).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) break;
    const start = separator + 4;
    const end = start + Number(match[1]);
    if (buffer.length < end) break;
    responses.push(JSON.parse(buffer.slice(start, end).toString("utf8")));
    buffer = buffer.slice(end);
  }
  return responses;
}
function validateMcpSmoke() {
  const server = path.join(root, "plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs");
  if (!fs.existsSync(server)) return;
  const input = [
    frame({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
    frame({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    frame({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "seis_ai_agent_status", arguments: {} } }),
    frame({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "seis_ai_agent_plan", arguments: { request: "Plan memory context governance." } } }),
    frame({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "seis_agent_lanes", arguments: {} } }),
    frame({ jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "seis_data_plan", arguments: { request: "Plan generated report provenance." } } }),
    frame({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "seis_security_plan", arguments: { request: "Review release security risk." } } }),
    frame({ jsonrpc: "2.0", id: 8, method: "tools/call", params: { name: "seis_research_plan", arguments: { request: "Research official integration requirements." } } }),
    frame({ jsonrpc: "2.0", id: 9, method: "tools/call", params: { name: "seis_automation_plan", arguments: { request: "Plan a repeatable validation workflow." } } }),
    frame({ jsonrpc: "2.0", id: 10, method: "tools/call", params: { name: "seis_product_plan", arguments: { request: "Scope a launch readiness slice." } } }),
  ].join("");
  const result = spawnSync("node", [server], { cwd: root, input, timeout: 5000 });
  if (result.error) {
    failures.push(`MCP smoke failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    failures.push(`MCP smoke exited ${result.status}: ${String(result.stderr || "").trim()}`);
    return;
  }
  const responses = parseResponses(result.stdout);
  const tools = responses.find((response) => response.id === 2)?.result?.tools || [];
  ensure(tools.some((tool) => tool.name === "seis_ai_agent_status"), "MCP tools/list must include status");
  for (const tool of ["seis_agent_lanes", "seis_governance_status", "seis_governance_plan", "seis_cloud_status", "seis_cloud_plan", "seis_code_status", "seis_design_status", "seis_data_status", "seis_data_plan", "seis_security_status", "seis_security_plan", "seis_research_status", "seis_research_plan", "seis_automation_status", "seis_automation_plan", "seis_product_status", "seis_product_plan"]) {
    ensure(tools.some((record) => record.name === tool), `MCP tools/list must include ${tool}`);
  }
  ensure(responses.find((response) => response.id === 3)?.result?.identity === "SEIS-Agent", "MCP status must report SEIS-Agent identity");
  const plan = responses.find((response) => response.id === 4)?.result;
  ensure(plan?.lanes?.some((lane) => String(lane).includes("SEIS-Data: memory, context systems")), "MCP plan must route memory/context through SEIS-Data");
  const lanes = responses.find((response) => response.id === 5)?.result;
  ensure(lanes?.status === "ready" && lanes?.laneCount === 10, "MCP lane inventory must report ten embedded lanes");
  const dataPlan = responses.find((response) => response.id === 6)?.result;
  ensure(dataPlan?.lane === "seis-data", "MCP data plan must route through embedded SEIS-DATA lane");
  ensure(responses.find((response) => response.id === 7)?.result?.lane === "seis-security", "MCP security plan must route through embedded SEIS Security lane");
  ensure(responses.find((response) => response.id === 8)?.result?.lane === "seis-research", "MCP research plan must route through embedded SEIS Research lane");
  ensure(responses.find((response) => response.id === 9)?.result?.lane === "seis-automation", "MCP automation plan must route through embedded SEIS Automation lane");
  ensure(responses.find((response) => response.id === 10)?.result?.lane === "seis-product", "MCP product plan must route through embedded SEIS Product lane");
}
