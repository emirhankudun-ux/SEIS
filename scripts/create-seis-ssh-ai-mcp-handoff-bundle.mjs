#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/ai-mcp-handoff-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/ai-mcp-handoff-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const handoff = buildHandoff();

if (write) {
  writeFile(outputJson, `${JSON.stringify(handoff, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(handoff));
}

if (!write) {
  console.log(JSON.stringify(handoff, null, 2));
}

if (check && !handoff.ok) {
  process.exit(1);
}

function buildHandoff() {
  const blockers = [];
  const warnings = [];
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", blockers);
  const accessModel = readJson("deploy/seis-ssh-access-model.json", blockers);
  const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json", blockers);
  const packageJson = readJson("package.json", blockers);
  const mcpRuntime = readJson("content/development/seis-ai-core-mcp-runtime-contract.json", blockers);
  const pluginIntegration = readJson("content/development/seis-agent-plugin-integration.json", blockers);
  const workflow = readText(".github/workflows/seis-ssh-public-access.yml", blockers);
  const prTemplate = readText(".github/PULL_REQUEST_TEMPLATE.md", blockers);
  const runbook = readText("docs/deployment/seis-ssh-public-github-access.md", blockers);
  const readme = readText("README.md", blockers);
  const status = readText("docs/STATUS.md", blockers);
  const desktop = readText("apps/web/desktop.js", blockers);
  const bigTechInventory = readText("docs/platform/big-tech-mcp-skill-inventory.md", blockers);
  const nvidiaIntegrations = readText("docs/ai/nvidia-installed-integrations.md", blockers);
  const fiveYearEvidence = readText("reports/seis-sub-agent-five-year-demo-evidence.md", blockers);
  const scripts = packageJson?.scripts || {};
  const reviewBundle = runJsonScript("scripts/create-seis-ssh-public-review-bundle.mjs");
  const snapshot = reviewBundle?.serverAndPortPolicy?.currentSnapshot || {};

  validateHandoffWiring({
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
    mcpRuntime,
    pluginIntegration,
    bigTechInventory,
    nvidiaIntegrations
  });

  if (reviewBundle.ok !== true) {
    blockers.push("public review bundle must be ready before AI/MCP handoff");
    warnings.push(...prefixItems("review-bundle", reviewBundle.warnings));
    blockers.push(...prefixItems("review-bundle", reviewBundle.blockers));
  }

  const installedAiRoutes = parseMarkdownTable(fiveYearEvidence, "Installed AI Core Route Matrix").map((row) => ({
    installedAi: row["Installed AI"],
    versionTarget: row["Version Target"],
    providerState: row["Provider State"],
    routeMode: row["Route Mode"],
    subAgentDuty: row["Sub-Agent Duty"]
  })).filter((row) => row.installedAi);

  const pluginLanes = (pluginIntegration?.lanes || []).map((lane) => ({
    id: lane.id,
    displayName: lane.displayName,
    role: lane.role,
    tools: lane.mcpTools || [],
    defaultGate: lane.defaultGate,
    permission: "plan-only-or-status-only"
  }));

  const personalPlugins = (pluginIntegration?.personalPlugins || []).map((plugin) => ({
    id: plugin.id,
    status: plugin.status,
    embeddedAs: plugin.embeddedAs,
    sourceMirror: plugin.sourceMirror
  }));

  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-ai-mcp-handoff",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok ? "ai-mcp-handoff-ready" : "blocked",
    mode: "read-only-no-live-ssh-no-config-write-no-provider-call-no-mcp-mutation-no-github-auth",
    alias: "SEIS-SSH",
    purpose: "Give installed AI assistants, MCP tools, plugin lanes, and GitHub reviewers one safe SEIS-SSH handoff without calling providers, executing MCP tools, opening SSH, mutating GitHub, or changing the server and port.",
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
    installedAiRoutes,
    mcpRuntime: {
      source: "content/development/seis-ai-core-mcp-runtime-contract.json",
      status: mcpRuntime?.status || "unknown",
      transport: mcpRuntime?.transport || "unknown",
      toolCount: mcpRuntime?.toolCount || 0,
      resourceCount: mcpRuntime?.resourceCount || 0,
      promptCount: mcpRuntime?.promptCount || 0,
      smokeTest: mcpRuntime?.smokeTest || null,
      pluginGate: mcpRuntime?.pluginGate || null,
      boundary: mcpRuntime?.credentialBoundary || mcpRuntime?.boundary || "unknown"
    },
    pluginBridge: {
      source: "content/development/seis-agent-plugin-integration.json",
      status: pluginIntegration?.status || "unknown",
      primaryInstallId: pluginIntegration?.primaryInstallId || pluginIntegration?.canonicalAgent?.identity || "unknown",
      installedEnabledCount: pluginIntegration?.auditedSnapshot?.installedEnabledCount || 0,
      personalPlugins,
      laneCount: pluginLanes.length,
      helperPluginUniverse: {
        uniquePlugins: pluginIntegration?.helperPluginUniverse?.uniquePlugins || 0,
        laneCount: pluginIntegration?.helperPluginUniverse?.laneCount || 0,
        activationPolicy: pluginIntegration?.helperPluginUniverse?.activationPolicy || "unknown"
      },
      lanes: pluginLanes
    },
    externalPlatformSurfaces: [
      {
        id: "big-tech-mcp-skill-inventory",
        source: "docs/platform/big-tech-mcp-skill-inventory.md",
        status: "repo-documented",
        boundary: "Callable MCP and installed skill surfaces are session capabilities, not production integration claims."
      },
      {
        id: "nvidia-installed-integrations",
        source: "docs/ai/nvidia-installed-integrations.md",
        status: "installed-into-registry-runtime-blocked",
        boundary: "NVIDIA lanes stay catalog-only until a target, credential, cost, license, network, and rollback review is approved."
      }
    ],
    reviewerCommands: {
      check: "npm run check:seis-ssh-ai-mcp-handoff",
      report: "npm run report:seis-ssh-ai-mcp-handoff",
      oneCommand: "npm run run:seis-ssh-ai-mcp-handoff",
      safeReviewCommands: [
        "npm run check:seis-ssh-public-review-bundle",
        "npm run check:seis-agent-plugin-integration",
        "npm run check:seis-plugin-bundle",
        "npm run check:seis-ssh-public-ai-plugin-review",
        "npm run check:seis-specialist-plugins -- --include-legacy-personal",
        "npm run check:connector-activation-report",
        "npm run check:seis-nvidia-installed-integrations"
      ],
      approvalGated: [
        "ssh SEIS-SSH",
        "provider API key validation or live AI calls",
        "remote MCP server execution or external mutation",
        "connector installation or OAuth authorization",
        "changing HostName or Port",
        "merging PR #56",
        "publishing live-ready or provider-ready claims"
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
          "Attach ai-mcp-handoff-latest.md when an installed AI assistant, MCP reviewer, or plugin-lane reviewer needs the safe SEIS-SSH review context.",
          "Keep provider states honest: Available, Missing Key, Disabled, Planned, and Error are not interchangeable.",
          "Do not change the SEIS-SSH server or port to satisfy an AI, MCP, plugin, connector, picker, billing, signing, or merge blocker."
        ]
      : ["Fix AI/MCP handoff blockers, then rerun npm run check:seis-ssh-ai-mcp-handoff."],
    safety: [
      "This handoff does not call providers or execute MCP tools.",
      "This handoff does not open a live SSH session.",
      "This handoff does not call gh auth status or contact GitHub.",
      "This handoff does not write SSH config, git config, repository settings, workflow settings, provider settings, or connector settings.",
      "This handoff does not print private keys, signing keys, tokens, cookies, full hostnames, full IPv4/IPv6 addresses, provider keys, OAuth credentials, or service accounts.",
      "Ayni sunucu ve baglanti noktasi korunur."
    ]
  };
}

function validateHandoffWiring({
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
  mcpRuntime,
  pluginIntegration,
  bigTechInventory,
  nvidiaIntegrations
}) {
  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must remain SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("contract must preserve the same server and port");
  if (contract?.githubExperience?.aiMcpHandoff !== "npm run report:seis-ssh-ai-mcp-handoff") blockers.push("contract must link AI/MCP handoff report command");
  if (scripts["check:seis-ssh-ai-mcp-handoff"] !== "node scripts/create-seis-ssh-ai-mcp-handoff-bundle.mjs --check") blockers.push("package check script must be declared");
  if (scripts["report:seis-ssh-ai-mcp-handoff"] !== "node scripts/create-seis-ssh-ai-mcp-handoff-bundle.mjs --write") blockers.push("package report script must be declared");
  if (scripts["run:seis-ssh-ai-mcp-handoff"] !== "npm run check:seis-ssh-ai-mcp-handoff && npm run report:seis-ssh-ai-mcp-handoff") blockers.push("package run script must be declared");
  if (!workflow.includes("npm run check:seis-ssh-ai-mcp-handoff")) blockers.push("CI workflow must run the AI/MCP handoff check");
  if (!prTemplate.includes("AI/MCP handoff was checked when installed AI, MCP, plugin, or connector context is relevant.")) blockers.push("PR template must ask for AI/MCP handoff evidence");
  if (!prTemplate.includes("npm run check:seis-ssh-ai-mcp-handoff")) blockers.push("PR template must include AI/MCP handoff check command");

  for (const command of [
    "npm run check:seis-ssh-ai-mcp-handoff",
    "npm run report:seis-ssh-ai-mcp-handoff"
  ]) {
    if (!(contract?.requiredCommands || []).includes(command)) blockers.push(`contract must require ${command}`);
  }

  for (const surface of [
    "scripts/create-seis-ssh-ai-mcp-handoff-bundle.mjs",
    "reports/seis-ssh-public-access/ai-mcp-handoff-latest.md"
  ]) {
    if (!(contract?.evidenceSurfaces || []).includes(surface)) blockers.push(`contract evidence surfaces must include ${surface}`);
  }

  if (!((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-ai-mcp-handoff"))) blockers.push("access model quality commands must include AI/MCP handoff check");
  if (!((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-ai-mcp-handoff"))) blockers.push("roadmap validation commands must include AI/MCP handoff check");
  const sameServerEvidence = (roadmap?.invariants || []).find((invariant) => invariant.id === "same-server-port-preservation");
  if (!((sameServerEvidence?.evidence || []).includes("npm run check:seis-ssh-ai-mcp-handoff"))) blockers.push("same-server/port invariant must include AI/MCP handoff check");

  const docs = `${runbook}\n${readme}\n${status}`;
  for (const token of [
    "npm run check:seis-ssh-ai-mcp-handoff",
    "npm run report:seis-ssh-ai-mcp-handoff",
    "AI/MCP handoff",
    "reports/seis-ssh-public-access/ai-mcp-handoff-latest.md",
    "installed AI",
    "MCP",
    "same server and port",
    "SEIS-SSH"
  ]) {
    if (!docs.includes(token)) blockers.push(`docs must include ${token}`);
  }

  for (const token of [
    "aiMcpHandoffCommand",
    "aiMcpHandoffArtifact",
    "AI/MCP Handoff",
    "ai-mcp-handoff"
  ]) {
    if (!desktop.includes(token)) blockers.push(`desktop demo must include ${token}`);
  }

  if (mcpRuntime?.status !== "local-smoke-verified") blockers.push("MCP runtime contract must remain local-smoke-verified");
  if (mcpRuntime?.toolCount < 1 || mcpRuntime?.resourceCount < 1 || mcpRuntime?.promptCount < 1) blockers.push("MCP runtime contract must expose non-zero tool/resource/prompt counts");
  if (!String(mcpRuntime?.credentialBoundary || "").includes("No provider keys")) blockers.push("MCP runtime boundary must keep provider keys out");
  if (!String(mcpRuntime?.credentialBoundary || "").includes("SSH credentials")) blockers.push("MCP runtime boundary must keep SSH credentials out");

  if (pluginIntegration?.status !== "active") blockers.push("plugin integration must remain active");
  if ((pluginIntegration?.personalPlugins || []).length < 5) blockers.push("plugin integration must include personal SEIS plugin lanes");
  if (pluginIntegration?.activationPolicy?.noBlanketActivation !== true) blockers.push("plugin integration must forbid blanket activation");
  if (pluginIntegration?.activationPolicy?.externalMutationRequiresUserConfirmation !== true) blockers.push("plugin integration must gate external mutation on user confirmation");

  for (const token of ["Claude", "Kimi", "GitHub", "Figma", "MCP"]) {
    if (!bigTechInventory.includes(token)) blockers.push(`big tech MCP inventory must include ${token}`);
  }
  if (!nvidiaIntegrations.includes("Runtime remains blocked")) blockers.push("NVIDIA integration doc must keep runtime blocked");
}

function parseMarkdownTable(text, sectionTitle) {
  const marker = `## ${sectionTitle}`;
  const start = text.indexOf(marker);
  if (start === -1) return [];
  const after = text.slice(start + marker.length);
  const nextHeader = after.search(/\n## /);
  const section = nextHeader === -1 ? after : after.slice(0, nextHeader);
  const rows = section.split(/\r?\n/).filter((line) => line.trim().startsWith("|"));
  if (rows.length < 3) return [];
  const headers = splitMarkdownRow(rows[0]);
  return rows.slice(2).map((row) => {
    const cells = splitMarkdownRow(row);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""]));
  });
}

function splitMarkdownRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
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

function renderMarkdown(handoff) {
  return `# SEIS SSH AI/MCP Handoff

Generated: ${handoff.generatedAt}

Status: ${handoff.status}
Mode: ${handoff.mode}
Alias: ${handoff.alias}

## Purpose

${handoff.purpose}

## Same Server And Port

- ${handoff.serverAndPortPolicy.invariant}
- ${handoff.serverAndPortPolicy.turkishInvariant}
- Mutation allowed: no
- Migration requires approval: yes
- Current transport: ${handoff.serverAndPortPolicy.currentSnapshot.transport}
- Current port: ${handoff.serverAndPortPolicy.currentSnapshot.port}
- Live connection attempted: ${handoff.serverAndPortPolicy.currentSnapshot.liveConnectionAttempted}

## Installed AI Routes

| Installed AI | Provider State | Route Mode | Duty |
| --- | --- | --- | --- |
${handoff.installedAiRoutes.map((route) => `| ${route.installedAi} | ${route.providerState} | ${route.routeMode} | ${route.subAgentDuty} |`).join("\n")}

## MCP Runtime

- Source: ${handoff.mcpRuntime.source}
- Status: ${handoff.mcpRuntime.status}
- Transport: ${handoff.mcpRuntime.transport}
- Tools: ${handoff.mcpRuntime.toolCount}
- Resources: ${handoff.mcpRuntime.resourceCount}
- Prompts: ${handoff.mcpRuntime.promptCount}
- Smoke test: ${handoff.mcpRuntime.smokeTest}
- Plugin gate: ${handoff.mcpRuntime.pluginGate}
- Boundary: ${handoff.mcpRuntime.boundary}

## Plugin Bridge

- Source: ${handoff.pluginBridge.source}
- Status: ${handoff.pluginBridge.status}
- Installed/enabled count: ${handoff.pluginBridge.installedEnabledCount}
- Personal plugins: ${handoff.pluginBridge.personalPlugins.length}
- Lane count: ${handoff.pluginBridge.laneCount}
- Helper plugin universe: ${handoff.pluginBridge.helperPluginUniverse.uniquePlugins} unique plugins across ${handoff.pluginBridge.helperPluginUniverse.laneCount} lanes

| Lane | Role | Gate |
| --- | --- | --- |
${handoff.pluginBridge.lanes.map((lane) => `| ${lane.displayName} | ${lane.role} | ${lane.defaultGate} |`).join("\n")}

## External Platform Surfaces

${handoff.externalPlatformSurfaces.map((surface) => `- ${surface.id}: ${surface.status}; ${surface.boundary}`).join("\n")}

## Commands

- Check: \`${handoff.reviewerCommands.check}\`
- Report: \`${handoff.reviewerCommands.report}\`
- One command: \`${handoff.reviewerCommands.oneCommand}\`

## Safe Review Commands

${renderList(handoff.reviewerCommands.safeReviewCommands, "none")}

## Approval-Gated Actions

${renderList(handoff.reviewerCommands.approvalGated, "none")}

## Blockers

${renderList(handoff.blockers, "none")}

## Warnings

${renderList(handoff.warnings, "none")}

## Next Actions

${renderList(handoff.nextActions, "none")}

## Safety

${renderList(handoff.safety, "none")}
`;
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
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
  console.log(`Usage: node scripts/create-seis-ssh-ai-mcp-handoff-bundle.mjs [--check] [--write] [--output PATH] [--markdown PATH]

Builds one read-only SEIS-SSH AI/MCP handoff from repo-local AI route, MCP
runtime, plugin bridge, platform inventory, and public SSH review evidence. It
does not call providers, execute MCP tools, open SSH, contact GitHub, write
config, change server/port, or expose secrets.`);
}
