#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/client-compatibility-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/client-compatibility-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const compatibility = buildCompatibility();

if (write) {
  writeFile(outputJson, `${JSON.stringify(compatibility, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(compatibility));
}

if (!write) {
  console.log(JSON.stringify(compatibility, null, 2));
}

if (check && !compatibility.ok) {
  process.exit(1);
}

function buildCompatibility() {
  const blockers = [];
  const warnings = [];
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", blockers);
  const accessModel = readJson("deploy/seis-ssh-access-model.json", blockers);
  const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json", blockers);
  const packageJson = readJson("package.json", blockers);
  const workflow = readText(".github/workflows/seis-ssh-public-access.yml", blockers);
  const prTemplate = readText(".github/PULL_REQUEST_TEMPLATE.md", blockers);
  const runbook = readText("docs/deployment/seis-ssh-public-github-access.md", blockers);
  const readme = readText("README.md", blockers);
  const status = readText("docs/STATUS.md", blockers);
  const desktop = readText("apps/web/desktop.js", blockers);
  const scripts = packageJson?.scripts || {};
  const reviewBundle = runJsonScript("scripts/create-seis-ssh-public-review-bundle.mjs");
  const aiMcpHandoff = runJsonScript("scripts/create-seis-ssh-ai-mcp-handoff-bundle.mjs");
  const snapshot = reviewBundle?.serverAndPortPolicy?.currentSnapshot || aiMcpHandoff?.serverAndPortPolicy?.currentSnapshot || {};

  validateCompatibilityWiring({
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
    desktop
  });

  if (reviewBundle.ok !== true) {
    blockers.push("public review bundle must be ready before client compatibility matrix");
    warnings.push(...prefixItems("review-bundle", reviewBundle.warnings));
    blockers.push(...prefixItems("review-bundle", reviewBundle.blockers));
  }
  if (aiMcpHandoff.ok !== true) {
    blockers.push("AI/MCP handoff must be ready before client compatibility matrix");
    warnings.push(...prefixItems("ai-mcp-handoff", aiMcpHandoff.warnings));
    blockers.push(...prefixItems("ai-mcp-handoff", aiMcpHandoff.blockers));
  }

  const clients = [
    {
      id: "github-contributor-clean-runner",
      label: "GitHub Contributor / Clean Runner",
      status: "review-ready-setup-needed",
      canUseNow: true,
      liveSshAllowed: false,
      evidence: "npm run run:seis-ssh-public-github-quickstart",
      reviewerCommand: "npm run check:seis-ssh-public-readiness-matrix",
      userExpectation: "A fresh clone can review SEIS-SSH safely even when no local SSH alias exists.",
      boundary: "Missing local SEIS-SSH config is setup-needed evidence, not live readiness."
    },
    {
      id: "terminal-openssh",
      label: "Terminal OpenSSH",
      status: snapshot.configured ? "terminal-compatible-when-authenticated" : "setup-needed",
      canUseNow: snapshot.configured === true,
      liveSshAllowed: false,
      evidence: "npm run check:seis-ssh-public-access-report",
      reviewerCommand: "npm run report:seis-ssh-public-support-packet",
      userExpectation: "When the local alias exists, the visible command remains ssh SEIS-SSH.",
      boundary: "This matrix does not run ssh SEIS-SSH; live SSH requires explicit approval."
    },
    {
      id: "chatgpt-codex-picker",
      label: "ChatGPT / Codex SSH Picker",
      status: snapshot.pickerLikelyCompatible ? "picker-compatible" : "picker-warning",
      canUseNow: snapshot.configured === true,
      liveSshAllowed: false,
      evidence: "npm run check:seis-ssh-picker-compatibility",
      reviewerCommand: "npm run check:seis-ssh-public-troubleshooting",
      userExpectation: "Keep one memorable SEIS-SSH alias even if a GUI picker warns on ProxyCommand transports.",
      boundary: "Do not add duplicate aliases or change HostName/Port to make a picker look online."
    },
    {
      id: "vscode-remote-ssh-ide",
      label: "VS Code / IDE Remote SSH",
      status: "manual-client-setup-needed",
      canUseNow: false,
      liveSshAllowed: false,
      evidence: "docs/deployment/seis-ssh-public-github-access.md",
      reviewerCommand: "npm run check:seis-ssh-public-troubleshooting",
      userExpectation: "IDE clients should reuse SEIS-SSH after the user-owned SSH client setup is complete.",
      boundary: "SEIS does not write IDE settings, install extensions, copy keys, or claim IDE live readiness."
    },
    {
      id: "ai-mcp-plugin-reviewer",
      label: "Installed AI / MCP / Plugin Reviewer",
      status: "review-ready",
      canUseNow: true,
      liveSshAllowed: false,
      evidence: "npm run run:seis-ssh-ai-mcp-handoff",
      reviewerCommand: "npm run check:seis-ssh-ai-mcp-handoff",
      userExpectation: "Installed AI assistants and MCP/plugin reviewers get one safe SEIS-SSH handoff.",
      boundary: "No provider call, MCP execution, connector auth, GitHub mutation, or live SSH occurs."
    },
    {
      id: "company-team-vpn",
      label: "Company / Team VPN SSH",
      status: "approval-gated",
      canUseNow: false,
      liveSshAllowed: false,
      evidence: "npm run check:ssh-vpn-cloud-server",
      reviewerCommand: "npm run check:seis-ssh-access-model",
      userExpectation: "Teams use the same visible alias with approved peer-authenticated VPN controls.",
      boundary: "No broad VPN ranges, firewall changes, peer inventory changes, or team access without approval."
    },
    {
      id: "new-device-mobile",
      label: "New Device / Mobile Continuity",
      status: "blocked-until-strict-online-evidence",
      canUseNow: false,
      liveSshAllowed: false,
      evidence: "npm run check:seis-ssh-live-readiness-evidence",
      reviewerCommand: "npm run check:seis-ssh-public-github-quickstart",
      userExpectation: "New devices start with the public quickstart and support packet before any live claim.",
      boundary: "Mobile/24x7 readiness remains blocked until strict online evidence passes."
    },
    {
      id: "maintainer-merge-review",
      label: "Maintainer Merge Review",
      status: "policy-blocked-review-ready",
      canUseNow: true,
      liveSshAllowed: false,
      evidence: "npm run run:seis-ssh-public-review-bundle",
      reviewerCommand: "npm run check:seis-ssh-public-merge-readiness",
      userExpectation: "Maintainers can review a complete public bundle while merge remains ruleset-gated.",
      boundary: "Merge, ruleset bypass, release, and public live-ready claims require human approval."
    }
  ];

  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-public-client-compatibility",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok ? "client-compatibility-ready" : "blocked",
    mode: "read-only-no-live-ssh-no-config-write-no-provider-call-no-mcp-mutation-no-github-auth",
    alias: "SEIS-SSH",
    purpose: "Show every public SEIS-SSH user, client, AI reviewer, MCP reviewer, plugin lane, and maintainer which path is ready, setup-needed, warning, approval-gated, or blocked while preserving the same server and port.",
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
    compatibilitySummary: {
      readyOrReviewReady: clients.filter((client) => client.canUseNow).length,
      setupNeeded: clients.filter((client) => client.status.includes("setup-needed")).length,
      warning: clients.filter((client) => client.status.includes("warning")).length,
      approvalGated: clients.filter((client) => client.status.includes("approval-gated")).length,
      blocked: clients.filter((client) => client.status.includes("blocked")).length,
      liveSshAllowedCount: clients.filter((client) => client.liveSshAllowed).length
    },
    clients,
    commands: {
      check: "npm run check:seis-ssh-public-client-compatibility",
      report: "npm run report:seis-ssh-public-client-compatibility",
      oneCommand: "npm run run:seis-ssh-public-client-compatibility",
      safePrereqs: [
        "npm run check:seis-ssh-public-review-bundle",
        "npm run check:seis-ssh-ai-mcp-handoff",
        "npm run check:seis-ssh-public-readiness-matrix",
        "npm run check:seis-ssh-public-artifact-hygiene"
      ],
      approvalGated: [
        "ssh SEIS-SSH",
        "changing HostName or Port",
        "adding duplicate visible aliases",
        "writing SSH, IDE, VPN, provider, connector, or GitHub config",
        "provider API calls or MCP execution",
        "team VPN peer changes",
        "merging PR #56 or publishing live-ready claims"
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
          "Attach client-compatibility-latest.md when a user asks which SEIS-SSH client path is ready or blocked.",
          "Keep one visible SEIS-SSH alias even when specific clients need setup or show picker warnings.",
          "Do not change the SEIS-SSH server or port to satisfy a client, IDE, AI, MCP, VPN, billing, signing, or merge blocker."
        ]
      : ["Fix client compatibility blockers, then rerun npm run check:seis-ssh-public-client-compatibility."],
    safety: [
      "This compatibility matrix does not open a live SSH session.",
      "This compatibility matrix does not call providers or execute MCP tools.",
      "This compatibility matrix does not call gh auth status or contact GitHub.",
      "This compatibility matrix does not write SSH config, IDE settings, git config, repository settings, workflow settings, provider settings, connector settings, VPN settings, or firewall settings.",
      "This compatibility matrix does not print private keys, signing keys, tokens, cookies, full hostnames, full IPv4/IPv6 addresses, provider keys, OAuth credentials, or service accounts.",
      "Ayni sunucu ve baglanti noktasi korunur."
    ]
  };
}

function validateCompatibilityWiring({ blockers, contract, accessModel, roadmap, scripts, workflow, prTemplate, runbook, readme, status, desktop }) {
  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must remain SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("contract must preserve the same server and port");
  if (contract?.githubExperience?.clientCompatibility !== "npm run report:seis-ssh-public-client-compatibility") blockers.push("contract must link client compatibility report command");
  if (scripts["check:seis-ssh-public-client-compatibility"] !== "node scripts/create-seis-ssh-public-client-compatibility.mjs --check") blockers.push("package check script must be declared");
  if (scripts["report:seis-ssh-public-client-compatibility"] !== "node scripts/create-seis-ssh-public-client-compatibility.mjs --write") blockers.push("package report script must be declared");
  if (scripts["run:seis-ssh-public-client-compatibility"] !== "npm run check:seis-ssh-public-client-compatibility && npm run report:seis-ssh-public-client-compatibility") blockers.push("package run script must be declared");
  if (!workflow.includes("npm run check:seis-ssh-public-client-compatibility")) blockers.push("CI workflow must run the client compatibility check");
  if (!prTemplate.includes("Client compatibility matrix was checked when user, device, IDE, picker, AI, MCP, plugin, or VPN behavior is relevant.")) blockers.push("PR template must ask for client compatibility evidence");
  if (!prTemplate.includes("npm run check:seis-ssh-public-client-compatibility")) blockers.push("PR template must include client compatibility check command");

  for (const command of [
    "npm run check:seis-ssh-public-client-compatibility",
    "npm run report:seis-ssh-public-client-compatibility"
  ]) {
    if (!(contract?.requiredCommands || []).includes(command)) blockers.push(`contract must require ${command}`);
  }

  for (const surface of [
    "scripts/create-seis-ssh-public-client-compatibility.mjs",
    "reports/seis-ssh-public-access/client-compatibility-latest.md"
  ]) {
    if (!(contract?.evidenceSurfaces || []).includes(surface)) blockers.push(`contract evidence surfaces must include ${surface}`);
  }

  if (!((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-client-compatibility"))) blockers.push("access model quality commands must include client compatibility check");
  if (!((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-client-compatibility"))) blockers.push("roadmap validation commands must include client compatibility check");
  const sameServerEvidence = (roadmap?.invariants || []).find((invariant) => invariant.id === "same-server-port-preservation");
  if (!((sameServerEvidence?.evidence || []).includes("npm run check:seis-ssh-public-client-compatibility"))) blockers.push("same-server/port invariant must include client compatibility check");

  const docs = `${runbook}\n${readme}\n${status}`;
  for (const token of [
    "npm run check:seis-ssh-public-client-compatibility",
    "npm run report:seis-ssh-public-client-compatibility",
    "client compatibility",
    "reports/seis-ssh-public-access/client-compatibility-latest.md",
    "GitHub Contributor / Clean Runner",
    "ChatGPT / Codex SSH Picker",
    "Installed AI / MCP / Plugin Reviewer",
    "same server and port",
    "SEIS-SSH"
  ]) {
    if (!docs.includes(token)) blockers.push(`docs must include ${token}`);
  }

  for (const token of [
    "clientCompatibilityCommand",
    "clientCompatibilityArtifact",
    "Client Compatibility",
    "client-compatibility"
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

function renderMarkdown(compatibility) {
  return `# SEIS SSH Public Client Compatibility

Generated: ${compatibility.generatedAt}

Status: ${compatibility.status}
Mode: ${compatibility.mode}
Alias: ${compatibility.alias}

## Purpose

${compatibility.purpose}

## Same Server And Port

- ${compatibility.serverAndPortPolicy.invariant}
- ${compatibility.serverAndPortPolicy.turkishInvariant}
- Mutation allowed: no
- Migration requires approval: yes
- Current transport: ${compatibility.serverAndPortPolicy.currentSnapshot.transport}
- Current port: ${compatibility.serverAndPortPolicy.currentSnapshot.port}
- Live connection attempted: ${compatibility.serverAndPortPolicy.currentSnapshot.liveConnectionAttempted}

## Summary

- Ready or review-ready paths: ${compatibility.compatibilitySummary.readyOrReviewReady}
- Setup-needed paths: ${compatibility.compatibilitySummary.setupNeeded}
- Warning paths: ${compatibility.compatibilitySummary.warning}
- Approval-gated paths: ${compatibility.compatibilitySummary.approvalGated}
- Blocked paths: ${compatibility.compatibilitySummary.blocked}
- Live SSH allowed by this report: ${compatibility.compatibilitySummary.liveSshAllowedCount}

## Client Matrix

| Client | Status | Can Use Now | Evidence | Boundary |
| --- | --- | --- | --- | --- |
${compatibility.clients.map((client) => `| ${client.label} | ${client.status} | ${client.canUseNow ? "yes" : "no"} | ${client.evidence} | ${client.boundary} |`).join("\n")}

## Commands

- Check: \`${compatibility.commands.check}\`
- Report: \`${compatibility.commands.report}\`
- One command: \`${compatibility.commands.oneCommand}\`

## Safe Prereqs

${renderList(compatibility.commands.safePrereqs, "none")}

## Approval-Gated Actions

${renderList(compatibility.commands.approvalGated, "none")}

## Blockers

${renderList(compatibility.blockers, "none")}

## Warnings

${renderList(compatibility.warnings, "none")}

## Next Actions

${renderList(compatibility.nextActions, "none")}

## Safety

${renderList(compatibility.safety, "none")}
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
  console.log(`Usage: node scripts/create-seis-ssh-public-client-compatibility.mjs [--check] [--write] [--output PATH] [--markdown PATH]

Builds one read-only client compatibility matrix for public SEIS-SSH users,
installed AI/MCP/plugin reviewers, IDE/picker users, teams, mobile/new-device
flows, and maintainers. It does not call providers, execute MCP tools, open
SSH, contact GitHub, write config, change server/port, or expose secrets.`);
}
