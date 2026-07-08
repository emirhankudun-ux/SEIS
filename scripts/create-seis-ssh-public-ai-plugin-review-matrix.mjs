#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/ai-plugin-review-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/ai-plugin-review-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const matrix = buildMatrix();

if (write) {
  writeFile(outputJson, `${JSON.stringify(matrix, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(matrix));
}

if (!write) {
  console.log(JSON.stringify(matrix, null, 2));
}

if (check && !matrix.ok) {
  process.exit(1);
}

function buildMatrix() {
  const blockers = [];
  const warnings = [];
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", blockers);
  const accessModel = readJson("deploy/seis-ssh-access-model.json", blockers);
  const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json", blockers);
  const packageJson = readJson("package.json", blockers);
  const pluginIntegration = readJson("content/development/seis-agent-plugin-integration.json", blockers);
  const mcpRuntime = readJson("content/development/seis-ai-core-mcp-runtime-contract.json", blockers);
  const workflow = readText(".github/workflows/seis-ssh-public-access.yml", blockers);
  const prTemplate = readText(".github/PULL_REQUEST_TEMPLATE.md", blockers);
  const runbook = readText("docs/deployment/seis-ssh-public-github-access.md", blockers);
  const readme = readText("README.md", blockers);
  const status = readText("docs/STATUS.md", blockers);
  const desktop = readText("apps/web/desktop.js", blockers);
  const scripts = packageJson?.scripts || {};
  const aiMcpHandoff = runJsonScript("scripts/create-seis-ssh-ai-mcp-handoff-bundle.mjs");
  const clientCompatibility = runJsonScript("scripts/create-seis-ssh-public-client-compatibility.mjs");
  const snapshot = aiMcpHandoff?.serverAndPortPolicy?.currentSnapshot
    || clientCompatibility?.serverAndPortPolicy?.currentSnapshot
    || {};

  validateMatrixWiring({
    blockers,
    contract,
    accessModel,
    roadmap,
    scripts,
    workflow,
    prTemplate,
    runbook,
    readme,
    status,
    desktop,
    pluginIntegration,
    mcpRuntime
  });

  if (aiMcpHandoff.ok !== true) {
    blockers.push("AI/MCP handoff must be ready before AI/plugin review matrix");
    warnings.push(...prefixItems("ai-mcp-handoff", aiMcpHandoff.warnings));
    blockers.push(...prefixItems("ai-mcp-handoff", aiMcpHandoff.blockers));
  }

  if (clientCompatibility.ok !== true) {
    blockers.push("client compatibility must be ready before AI/plugin review matrix");
    warnings.push(...prefixItems("client-compatibility", clientCompatibility.warnings));
    blockers.push(...prefixItems("client-compatibility", clientCompatibility.blockers));
  }

  const installedAiRoutes = (aiMcpHandoff.installedAiRoutes || []).map((route) => ({
    id: slug(route.installedAi || "installed-ai"),
    label: route.installedAi || "Installed AI",
    versionTarget: route.versionTarget || "unknown",
    providerState: route.providerState || "unknown",
    routeMode: route.routeMode || "unknown",
    permission: route.providerState === "Available" ? "supervised-review-or-local-demo" : "planned-or-disabled",
    sshAuthority: "none",
    safeForPublicReview: true,
    boundary: "May read repo evidence only; no live provider call, SSH execution, credential access, or GitHub mutation."
  }));

  const pluginLanes = (pluginIntegration?.lanes || []).map((lane) => ({
    id: lane.id,
    label: lane.displayName,
    role: lane.role,
    tools: lane.mcpTools || [],
    defaultGate: lane.defaultGate,
    permission: "plan-only-or-status-only",
    sshAuthority: "none",
    safeForPublicReview: true,
    boundary: "Lane may explain safe SEIS-SSH steps from repo evidence; it cannot run SSH, change config, call providers, or mutate GitHub."
  }));

  const mcpSurfaces = (mcpRuntime?.surfaces || []).map((surface) => ({
    id: surface.id,
    label: surface.label,
    state: surface.state,
    count: surface.count,
    method: surface.method,
    permission: "local-smoke-or-read-only-resource",
    sshAuthority: "none",
    safeForPublicReview: true,
    boundary: "MCP surface is local stdio evidence only; no remote MCP server, SSH session, connector auth, or external mutation is invoked."
  }));

  const platformPluginEvidence = [
    {
      id: "installed-codex-plugin-audit",
      label: "Installed Codex Plugin Audit",
      source: "content/development/seis-agent-plugin-integration.json",
      status: pluginIntegration?.status || "unknown",
      installedEnabledCount: pluginIntegration?.auditedSnapshot?.installedEnabledCount || 0,
      notInstalledCount: pluginIntegration?.auditedSnapshot?.notInstalledCount || 0,
      permission: "inventory-only",
      boundary: "Inventory proves local plugin posture only; it does not prove authentication, live connector readiness, SSH access, or production integration."
    },
    {
      id: "helper-plugin-universe",
      label: "Helper Plugin Universe",
      source: pluginIntegration?.helperPluginUniverse?.sourceRegistry || "content/development/requested-plugin-inventory.json",
      status: "activation-policy-gated",
      uniquePlugins: pluginIntegration?.helperPluginUniverse?.uniquePlugins || 0,
      laneCount: pluginIntegration?.helperPluginUniverse?.laneCount || 0,
      permission: "activate-only-when-relevant-authenticated-scoped-and-approved",
      boundary: "Helper plugins stay dormant until task relevance, auth, scope, cost, and user approval are explicit."
    },
    {
      id: "big-tech-mcp-skill-inventory",
      label: "Big Tech MCP And Skill Inventory",
      source: "docs/platform/big-tech-mcp-skill-inventory.md",
      status: "repo-documented",
      permission: "documentation-evidence-only",
      boundary: "Session capabilities and installed skills are not production access claims."
    }
  ];

  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-public-ai-plugin-review",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok ? "ai-plugin-review-ready" : "blocked",
    mode: "read-only-no-live-ssh-no-config-write-no-provider-call-no-mcp-mutation-no-connector-auth-no-github-auth",
    alias: "SEIS-SSH",
    purpose: "Give GitHub reviewers one matrix that shows how installed AI routes, MCP runtime surfaces, SEIS plugin lanes, and platform plugin evidence can review SEIS-SSH without changing the server or port.",
    serverAndPortPolicy: {
      invariant: "Keep the same server and port.",
      turkishInvariant: "Ayni sunucu ve baglanti noktasi korunur.",
      preservationMode: contract?.serverAndPortPolicy?.mode || "unknown",
      mutationAllowed: false,
      migrationRequiresApproval: true,
      currentSnapshot: {
        configured: snapshot.configured === true,
        transport: snapshot.transport || "unknown",
        hostnameKind: snapshot.hostnameKind || "unknown",
        hostnameSha256Prefix: snapshot.hostnameSha256Prefix || null,
        port: snapshot.port || "22",
        pickerLikelyCompatible: snapshot.pickerLikelyCompatible === true,
        liveConnectionAttempted: false
      }
    },
    coverageSummary: {
      installedAiRoutes: installedAiRoutes.length,
      pluginReviewLanes: pluginLanes.length,
      mcpRuntimeTools: mcpRuntime?.toolCount || 0,
      mcpRuntimeResources: mcpRuntime?.resourceCount || 0,
      mcpRuntimePrompts: mcpRuntime?.promptCount || 0,
      installedEnabledPlugins: pluginIntegration?.auditedSnapshot?.installedEnabledCount || 0,
      helperPluginUniverse: pluginIntegration?.helperPluginUniverse?.uniquePlugins || 0,
      liveSshAllowedCount: 0,
      providerCallsAllowedCount: 0,
      mcpMutationsAllowedCount: 0,
      configWritesAllowedCount: 0
    },
    installedAiRoutes,
    pluginReviewLanes: pluginLanes,
    mcpRuntimeSurfaces: mcpSurfaces,
    platformPluginEvidence,
    reviewerCommands: {
      check: "npm run check:seis-ssh-public-ai-plugin-review",
      report: "npm run report:seis-ssh-public-ai-plugin-review",
      oneCommand: "npm run run:seis-ssh-public-ai-plugin-review",
      safePrereqs: [
        "npm run check:seis-ssh-ai-mcp-handoff",
        "npm run check:seis-ssh-public-client-compatibility",
        "npm run check:seis-agent-plugin-integration",
        "npm run check:seis-plugin-bundle",
        "npm run check:seis-specialist-plugins -- --include-legacy-personal"
      ],
      approvalGated: [
        "ssh SEIS-SSH",
        "changing HostName or Port",
        "provider API key validation or live AI calls",
        "remote MCP server execution",
        "connector installation or OAuth authorization",
        "GitHub mutation, merge, ruleset bypass, or release",
        "writing SSH, provider, connector, VPN, firewall, IDE, git, or workflow config"
      ]
    },
    generatedArtifacts: {
      json: outputJson,
      markdown: outputMarkdown
    },
    blockers: unique(blockers).map(sanitize),
    warnings: unique(warnings).map(sanitize),
    nextActions: ok
      ? [
          "Attach ai-plugin-review-latest.md when a reviewer asks how installed AIs, MCP surfaces, or plugin lanes relate to SEIS-SSH.",
          "Keep every lane read-only or plan-only until a human approves live SSH, provider calls, connector auth, or GitHub mutation.",
          "Do not change the SEIS-SSH server or port to satisfy an AI route, MCP lane, plugin inventory, connector auth, billing, signing, picker, or merge blocker."
        ]
      : ["Fix AI/plugin review blockers, then rerun npm run check:seis-ssh-public-ai-plugin-review."],
    safety: [
      "This matrix does not open a live SSH session.",
      "This matrix does not call providers or execute MCP tools.",
      "This matrix does not install connectors or start OAuth authorization.",
      "This matrix does not call gh auth status or contact GitHub.",
      "This matrix does not write SSH config, git config, repository settings, workflow settings, provider settings, connector settings, VPN settings, firewall settings, or IDE settings.",
      "This matrix does not print private keys, signing keys, tokens, cookies, full hostnames, full IPv4/IPv6 addresses, provider keys, OAuth credentials, or service accounts.",
      "Ayni sunucu ve baglanti noktasi korunur."
    ]
  };
}

function validateMatrixWiring({
  blockers,
  contract,
  accessModel,
  roadmap,
  scripts,
  workflow,
  prTemplate,
  runbook,
  readme,
  status,
  desktop,
  pluginIntegration,
  mcpRuntime
}) {
  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must remain SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("contract must preserve the same server and port");
  if (contract?.githubExperience?.aiPluginReviewMatrix !== "npm run report:seis-ssh-public-ai-plugin-review") blockers.push("contract must link AI/plugin review matrix report command");
  if (scripts["check:seis-ssh-public-ai-plugin-review"] !== "node scripts/create-seis-ssh-public-ai-plugin-review-matrix.mjs --check") blockers.push("package check script must be declared");
  if (scripts["report:seis-ssh-public-ai-plugin-review"] !== "node scripts/create-seis-ssh-public-ai-plugin-review-matrix.mjs --write") blockers.push("package report script must be declared");
  if (scripts["run:seis-ssh-public-ai-plugin-review"] !== "npm run check:seis-ssh-public-ai-plugin-review && npm run report:seis-ssh-public-ai-plugin-review") blockers.push("package run script must be declared");
  if (!workflow.includes("npm run check:seis-ssh-public-ai-plugin-review")) blockers.push("CI workflow must run the AI/plugin review matrix check");
  if (!prTemplate.includes("AI/plugin review matrix was checked when installed AI, MCP runtime, plugin lane, or connector evidence is relevant.")) blockers.push("PR template must ask for AI/plugin review matrix evidence");
  if (!prTemplate.includes("npm run check:seis-ssh-public-ai-plugin-review")) blockers.push("PR template must include AI/plugin review matrix command");

  for (const command of [
    "npm run check:seis-ssh-public-ai-plugin-review",
    "npm run report:seis-ssh-public-ai-plugin-review"
  ]) {
    if (!(contract?.requiredCommands || []).includes(command)) blockers.push(`contract must require ${command}`);
  }

  for (const surface of [
    "scripts/create-seis-ssh-public-ai-plugin-review-matrix.mjs",
    "reports/seis-ssh-public-access/ai-plugin-review-latest.md"
  ]) {
    if (!(contract?.evidenceSurfaces || []).includes(surface)) blockers.push(`contract evidence surfaces must include ${surface}`);
  }

  if (!((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-ai-plugin-review"))) blockers.push("access model quality commands must include AI/plugin review matrix check");
  if (!((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-ai-plugin-review"))) blockers.push("roadmap validation commands must include AI/plugin review matrix check");
  const sameServerEvidence = (roadmap?.invariants || []).find((invariant) => invariant.id === "same-server-port-preservation");
  if (!((sameServerEvidence?.evidence || []).includes("npm run check:seis-ssh-public-ai-plugin-review"))) blockers.push("same-server/port invariant must include AI/plugin review matrix check");

  if (!Array.isArray(pluginIntegration?.lanes) || pluginIntegration.lanes.length === 0) blockers.push("plugin integration must expose plugin lanes");
  if ((pluginIntegration?.auditedSnapshot?.installedEnabledCount || 0) <= 0) blockers.push("plugin integration must expose installed enabled plugin count");
  if ((mcpRuntime?.toolCount || 0) <= 0) blockers.push("MCP runtime must expose tool count");
  if ((mcpRuntime?.resourceCount || 0) <= 0) blockers.push("MCP runtime must expose resource count");

  const docs = `${runbook}\n${readme}\n${status}`;
  for (const token of [
    "npm run check:seis-ssh-public-ai-plugin-review",
    "npm run report:seis-ssh-public-ai-plugin-review",
    "AI/plugin review matrix",
    "reports/seis-ssh-public-access/ai-plugin-review-latest.md",
    "installed AI routes",
    "MCP runtime",
    "plugin lanes",
    "same server and port",
    "SEIS-SSH"
  ]) {
    if (!docs.includes(token)) blockers.push(`docs must include ${token}`);
  }

  for (const token of [
    "aiPluginReviewCommand",
    "aiPluginReviewArtifact",
    "AI/Plugin Review",
    "ai-plugin-review"
  ]) {
    if (!desktop.includes(token)) blockers.push(`desktop demo must include ${token}`);
  }
}

function runJsonScript(script) {
  const result = spawnSync(process.execPath, [script], {
    encoding: "utf8",
    timeout: 30000
  });
  if (result.status !== 0) {
    return {
      ok: false,
      status: "blocked",
      blockers: [`${script} exited with status ${result.status ?? 1}`],
      warnings: sanitizeLines([result.stderr, result.stdout])
    };
  }
  try {
    return JSON.parse(result.stdout || "{}");
  } catch (error) {
    return {
      ok: false,
      status: "blocked",
      blockers: [`${script} returned invalid JSON: ${error.message}`],
      warnings: sanitizeLines([result.stderr, result.stdout])
    };
  }
}

function renderMarkdown(matrix) {
  return `# SEIS SSH Public AI/Plugin Review Matrix

Generated: ${matrix.generatedAt}

Status: ${matrix.status}
Mode: ${matrix.mode}
Alias: ${matrix.alias}

## Purpose

${matrix.purpose}

## Same Server And Port

- ${matrix.serverAndPortPolicy.invariant}
- ${matrix.serverAndPortPolicy.turkishInvariant}
- Mutation allowed: no
- Migration requires approval: yes
- Current transport: ${matrix.serverAndPortPolicy.currentSnapshot.transport}
- Current port: ${matrix.serverAndPortPolicy.currentSnapshot.port}
- Live connection attempted: ${matrix.serverAndPortPolicy.currentSnapshot.liveConnectionAttempted}

## Coverage Summary

- Installed AI routes: ${matrix.coverageSummary.installedAiRoutes}
- Plugin review lanes: ${matrix.coverageSummary.pluginReviewLanes}
- MCP runtime tools: ${matrix.coverageSummary.mcpRuntimeTools}
- MCP runtime resources: ${matrix.coverageSummary.mcpRuntimeResources}
- MCP runtime prompts: ${matrix.coverageSummary.mcpRuntimePrompts}
- Installed enabled plugins: ${matrix.coverageSummary.installedEnabledPlugins}
- Helper plugin universe: ${matrix.coverageSummary.helperPluginUniverse}
- Live SSH allowed by this report: ${matrix.coverageSummary.liveSshAllowedCount}
- Provider calls allowed by this report: ${matrix.coverageSummary.providerCallsAllowedCount}
- MCP mutations allowed by this report: ${matrix.coverageSummary.mcpMutationsAllowedCount}
- Config writes allowed by this report: ${matrix.coverageSummary.configWritesAllowedCount}

## Installed AI Routes

| AI | Version Target | Provider State | Route Mode | Permission | Boundary |
| --- | --- | --- | --- | --- | --- |
${matrix.installedAiRoutes.map((route) => `| ${route.label} | ${route.versionTarget} | ${route.providerState} | ${route.routeMode} | ${route.permission} | ${route.boundary} |`).join("\n")}

## Plugin Review Lanes

| Lane | Tools | Gate | Permission | Boundary |
| --- | --- | --- | --- | --- |
${matrix.pluginReviewLanes.map((lane) => `| ${lane.label} | ${lane.tools.join(", ")} | ${lane.defaultGate} | ${lane.permission} | ${lane.boundary} |`).join("\n")}

## MCP Runtime Surfaces

| Surface | State | Count | Method | Permission | Boundary |
| --- | --- | --- | --- | --- | --- |
${matrix.mcpRuntimeSurfaces.map((surface) => `| ${surface.label} | ${surface.state} | ${surface.count} | ${surface.method} | ${surface.permission} | ${surface.boundary} |`).join("\n")}

## Platform Plugin Evidence

| Evidence | Status | Source | Permission | Boundary |
| --- | --- | --- | --- | --- |
${matrix.platformPluginEvidence.map((item) => `| ${item.label} | ${item.status} | ${item.source} | ${item.permission} | ${item.boundary} |`).join("\n")}

## Reviewer Commands

- Check: \`${matrix.reviewerCommands.check}\`
- Report: \`${matrix.reviewerCommands.report}\`
- One command: \`${matrix.reviewerCommands.oneCommand}\`

## Safe Prereqs

${renderList(matrix.reviewerCommands.safePrereqs, "none")}

## Approval-Gated Actions

${renderList(matrix.reviewerCommands.approvalGated, "none")}

## Blockers

${renderList(matrix.blockers, "none")}

## Warnings

${renderList(matrix.warnings, "none")}

## Next Actions

${renderList(matrix.nextActions, "none")}

## Safety

${renderList(matrix.safety, "none")}
`;
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "item";
}

function prefixItems(prefix, values) {
  if (!Array.isArray(values)) return [];
  return values.map((value) => `${prefix}: ${value}`);
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function sanitize(value) {
  return String(value || "")
    .replace(/-----BEGIN [^-]+PRIVATE KEY-----[\s\S]*?-----END [^-]+PRIVATE KEY-----/g, "[redacted-private-key]")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[redacted-api-key]")
    .replace(/github_pat_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[redacted-ip]")
    .replace(/\b(?:[a-f0-9]{1,4}:){4,7}[a-f0-9]{1,4}\b/gi, "[redacted-ipv6]")
    .replace(/\b(?:f[cd][a-f0-9]{0,2}|fe80):[a-f0-9:]{2,}\b/gi, "[redacted-ipv6]")
    .replace(/\/Users\/[^/\s]+/g, "~")
    .slice(0, 700);
}

function sanitizeLines(values) {
  return values.filter(Boolean).map(sanitize);
}

function readJson(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function readText(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function writeFile(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--write") parsed.write = true;
    else if (token === "--check") parsed.check = true;
    else if (token === "--help" || token === "-h") parsed.help = true;
    else if (token === "--output") parsed.output = tokens[index + 1];
    else if (token.startsWith("--output=")) parsed.output = token.slice("--output=".length);
    else if (token === "--markdown") parsed.markdown = tokens[index + 1];
    else if (token.startsWith("--markdown=")) parsed.markdown = token.slice("--markdown=".length);
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/create-seis-ssh-public-ai-plugin-review-matrix.mjs [--check] [--write] [--output PATH] [--markdown PATH]

Builds one read-only public review matrix that maps installed AI routes, MCP
runtime surfaces, SEIS plugin lanes, and platform plugin evidence to the
SEIS-SSH public GitHub access contract. It does not call providers, execute MCP
tools, open SSH, contact GitHub, write config, change server/port, or expose
secrets.`);
}
