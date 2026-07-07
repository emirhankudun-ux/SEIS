#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  binding: "content/development/seis-full-usage-mcp-binding.json",
  fullUsage: "content/development/seis-full-usage-operating-mode.json",
  matrix: "content/development/seis-mcp-permission-risk-matrix.json",
  runtime: "content/development/seis-ai-core-mcp-runtime-contract.json",
  credentialBoundary: "docs/governance/mcp-connector-credential-boundary.md",
  runbook: "reports/seis-ai-routing/full-usage-mcp-binding.md",
  hermesLedger: "reports/seis-ai-routing/hermes-full-usage-mcp-dry-run-ledger.md",
  aiCliStack: "docs/development/ai-cli-stack.md",
  index: "docs/INDEX.md",
  mcpConfig: ".mcp.json",
  server: "packages/seis-ai/src/mcp/server.mjs",
  pluginIntegration: "packages/seis-ai/src/lib/plugin-integration.mjs",
  smokeTest: "packages/seis-ai/test/mcp-smoke.test.mjs"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(abs(relativePath), label);

const binding = readJson(paths.binding, "full usage MCP binding");
const fullUsage = readJson(paths.fullUsage, "full usage operating mode");
const matrix = readJson(paths.matrix, "MCP permission risk matrix");
const runtime = readJson(paths.runtime, "MCP runtime contract");
const mcpConfig = readJson(paths.mcpConfig, "workspace MCP config");
const runbook = readText(paths.runbook, "full usage MCP binding runbook");
const hermesLedger = readText(paths.hermesLedger, "Hermes full usage MCP dry-run ledger");
const aiCliStack = readText(paths.aiCliStack, "AI CLI stack docs");
const index = readText(paths.index, "docs index");
const server = readText(paths.server, "SEIS MCP server");
const pluginIntegration = readText(paths.pluginIntegration, "plugin integration library");
const smokeTest = readText(paths.smokeTest, "MCP smoke test");
const credentialBoundary = readText(paths.credentialBoundary, "credential boundary");

const publicSafeTexts = [
  [JSON.stringify(binding ?? {}, null, 2), "full usage MCP binding"],
  [runbook, "full usage MCP binding runbook"],
  [hermesLedger, "Hermes full usage MCP dry-run ledger"],
  [aiCliStack, "AI CLI stack docs"],
  [index, "docs index"],
  [credentialBoundary, "credential boundary"]
];
const forbiddenPublicPatterns = [
  [/\/Users\//, "local macOS user path"],
  [/Mobile Documents/, "local iCloud path detail"],
  [/(^|[\s"'])~\/[A-Za-z0-9._/-]+/m, "home-directory shorthand"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key block"],
  [/(?:^|[^A-Za-z])sk-(?:proj-|live-|test-|svcacct-|admin-|org-|user-)?[A-Za-z0-9_]{20,}/, "provider key-shaped value"],
  [/gh[pousr]_[A-Za-z0-9_]{20,}/, "GitHub token-shaped value"],
  [/AKIA[0-9A-Z]{16}/, "AWS access key-shaped value"]
];

if (binding) {
  ensure(binding.id === "seis-full-usage-mcp-binding", "binding id mismatch");
  ensure(binding.status === "repo-owned-mcp-binding-active", "binding status mismatch");
  ensure(binding.visibility === "public-safe", "binding visibility mismatch");
  ensure(binding.qualityGate === "node scripts/check-seis-full-usage-mcp-binding.mjs", "binding quality gate mismatch");
  ensure(binding.resourceUri === "seis://ai/full-usage-mcp-binding.json", "binding resource URI mismatch");
  ensure(binding.sourceOfTruth?.fullUsageOperatingMode === paths.fullUsage, "binding must point to full usage operating mode");
  ensure(binding.sourceOfTruth?.mcpPermissionRiskMatrix === paths.matrix, "binding must point to MCP permission matrix");
  ensure(binding.sourceOfTruth?.mcpRuntimeContract === paths.runtime, "binding must point to MCP runtime contract");
  ensure(binding.sourceOfTruth?.workspaceMcpConfig === paths.mcpConfig, "binding must point to .mcp.json");
  ensure(binding.sourceOfTruth?.runbook === paths.runbook, "binding must point to runbook");
  ensure(String(binding.truthBoundary || "").includes("does not prove authenticated external MCP access"), "truth boundary must block external MCP overclaims");
  ensure(binding.activeRepoOwnedBinding?.serverId === "seis", "active binding must use the local seis server");
  ensure(binding.activeRepoOwnedBinding?.command === "node", "active binding command must be node");
  ensureArrayIncludesAll(binding.activeRepoOwnedBinding?.args, ["packages/seis-ai/bin/seis-mcp.mjs"], "active binding args");
  ensure(binding.activeRepoOwnedBinding?.transport === "stdio JSON-RPC", "active binding transport mismatch");
  ensure(binding.activeRepoOwnedBinding?.resourceExposed === binding.resourceUri, "active binding must expose the binding resource");
  ensure(binding.activeRepoOwnedBinding?.secretsRequired === false, "active binding must not require secrets");
  ensure(binding.activeRepoOwnedBinding?.externalMutationDefault === false, "active binding must not allow external mutation by default");
  ensure(binding.runtimeContract?.toolCount === 35, "binding runtime contract must record 35 tools");
  ensure(binding.runtimeContract?.resourceCount === 33, "binding runtime contract must record 33 resources");
  ensure(binding.runtimeContract?.promptCount === 3, "binding runtime contract must record 3 prompts");
  ensure(binding.runtimeContract?.newResource === binding.resourceUri, "binding runtime contract must name the new resource");
  ensureArrayIncludesAll((binding.mcpUseOrder || []).map((entry) => entry.riskRecordId), [
    "local-stdio-mcp-runtime",
    "repo-backed-resource-reads",
    "repo-backed-check-tools",
    "prompt-rendering-tools",
    "installed-safe-external-mcp",
    "candidate-mcp-ecosystem-pool",
    "external-mutation-mcp"
  ], "mcpUseOrder.riskRecordId");
  ensureArrayIncludesAll((binding.domainBindings || []).map((entry) => entry.domain), [
    "design",
    "developer",
    "devops",
    "coding",
    "llm",
    "software-engineering",
    "ai"
  ], "domainBindings.domain");
  const routerCandidate = ensureArray(binding.routerBridgeCandidates, "routerBridgeCandidates").find((entry) => entry.id === "9router");
  ensure(routerCandidate?.packageName === "9router", "9router candidate must record packageName");
  ensure(routerCandidate?.status === "candidate-package-runner-not-installed", "9router candidate must stay not-installed");
  ensure(routerCandidate?.safeImmediateRoute === "hermes-agent-as-router-under-seis-mcp-binding", "9router candidate must route safely through Hermes Agent");
  ensureArrayIncludesAll(routerCandidate?.observedRisks, [
    "postinstall hook declared",
    "runtime dependencies are installed into a user-home runtime directory",
    "source repository was not declared in the observed npm metadata"
  ], "routerBridgeCandidates.9router.observedRisks");
  ensureArrayIncludesAll(routerCandidate?.installGate, [
    "explicit owner approval for package-runner install",
    "tarball or source review before execution",
    "no credentials available during install or first run",
    "rollback command and runtime directory cleanup plan",
    "repo-only result ledger after any action"
  ], "routerBridgeCandidates.9router.installGate");
  ensureArrayIncludesAll(binding.externalMcpPoolPolicy?.blockedByDefault, [
    "credentialed-provider-mcp",
    "external-mutation-mcp",
    "browser-automation-mcp-with-authenticated-private-pages",
    "ssh-cloud-deploy-mcp",
    "package-runner-mcp-without-owner-approval"
  ], "externalMcpPoolPolicy.blockedByDefault");
  ensureArrayIncludesAll(binding.perUseLedgerFields, [
    "mcpServerId",
    "riskRecordId",
    "selectedToolPromptOrResource",
    "allowedMode",
    "permissionClass",
    "authBoundary",
    "secretsRequested",
    "externalMutationIntent",
    "outputCaptured",
    "validatorCommand"
  ], "perUseLedgerFields");
  ensureArrayIncludesAll(binding.forbiddenWithoutExplicitOwnerApproval, [
    "credential reads",
    "secret capture",
    "external connector writes",
    "provider API mutation",
    "GitHub push or merge",
    "browser automation on authenticated private pages",
    "SSH execution",
    "cloud provisioning",
    "deployment",
    "package-runner MCP activation",
    "billing or purchase actions"
  ], "forbiddenWithoutExplicitOwnerApproval");
  ensureArrayIncludesAll(binding.verificationCommands, [
    "node scripts/check-seis-full-usage-mcp-binding.mjs",
    "node scripts/check-seis-mcp-permission-risk-matrix.mjs",
    "node --test packages/seis-ai/test/mcp-smoke.test.mjs",
    "npm run check:seis-full-usage-operating-mode"
  ], "verificationCommands");
}

ensure(fullUsage?.sourceOfTruth?.mcpBinding === paths.binding, "full usage operating mode must point to MCP binding");
ensure(fullUsage?.mcpBindingPolicy?.source === paths.binding, "full usage operating mode must include MCP binding policy");
ensure(matrix?.runtimeSnapshot?.resourceCount === 33, "MCP matrix runtime snapshot must record 33 resources");
ensure(runtime?.resourceCount === 33, "MCP runtime contract must record 33 resources");
ensure(runtime?.fullUsageMcpBindingResource === "seis://ai/full-usage-mcp-binding.json", "MCP runtime contract must expose the full-usage binding resource");
ensure(mcpConfig?.mcpServers?.seis?.command === "node", ".mcp.json must keep the local seis node command");
ensureArrayIncludesAll(mcpConfig?.mcpServers?.seis?.args, ["packages/seis-ai/bin/seis-mcp.mjs"], ".mcp.json seis args");

for (const token of [
  "FULL_USAGE_MCP_BINDING_PATH",
  "FULL_USAGE_MCP_BINDING_RESOURCE_URI"
]) {
  ensure(pluginIntegration.includes(token), `plugin integration library missing ${token}`);
}

for (const token of [
  "FULL_USAGE_MCP_BINDING_RESOURCE_URI",
  "FULL_USAGE_MCP_BINDING_PATH"
]) {
  ensure(server.includes(token), `SEIS MCP server missing ${token}`);
}

for (const token of [
  "33 resources",
  "seis://ai/full-usage-mcp-binding.json",
  "seis-full-usage-mcp-binding"
]) {
  ensure(smokeTest.includes(token), `MCP smoke test missing ${token}`);
}

for (const token of [
  "seis-full-usage-mcp-binding.json",
  "full-usage-mcp-binding.md",
  "hermes-full-usage-mcp-dry-run-ledger.md"
]) {
  ensure(index.includes(token), `docs index missing ${token}`);
}

for (const token of [
  "seis-full-usage-mcp-binding.json",
  "seis://ai/full-usage-mcp-binding.json",
  "35 tools, 33 resources, 3 prompts",
  "candidate-package-runner-not-installed",
  "Hermes Agent as the supervised router surface"
]) {
  ensure(runbook.includes(token) || aiCliStack.includes(token), `runbook or AI CLI stack missing ${token}`);
}

for (const token of [
  "typed-not-submitted",
  "submit control is ambiguous",
  "candidate-package-runner-not-installed",
  "Do not ask for credentials"
]) {
  ensure(hermesLedger.includes(token), `Hermes dry-run ledger missing ${token}`);
}


for (const [text, label] of publicSafeTexts) {
  for (const [pattern, description] of forbiddenPublicPatterns) {
    ensure(!pattern.test(text), `${label} must not include ${description}`);
  }
}

if (failures.length) {
  console.error("SEIS full usage MCP binding check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS full usage MCP binding check passed.");

function abs(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) failures.push(`${label} missing: ${path.relative(root, filePath)}`);
}

function ensureArray(candidate, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  return Array.isArray(candidate) ? candidate : [];
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function readJson(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}
