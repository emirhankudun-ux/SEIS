#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/troubleshooting-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/troubleshooting-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const guide = buildTroubleshootingGuide();

if (write) {
  writeFile(outputJson, `${JSON.stringify(guide, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(guide));
}

if (!write) {
  console.log(JSON.stringify(guide, null, 2));
}

if (check && !guide.ok) {
  process.exit(1);
}

function buildTroubleshootingGuide() {
  const blockers = [];
  const warnings = [];
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", blockers);
  const packageJson = readJson("package.json", blockers);
  const liveEvidence = readJson("content/development/seis-ssh-live-readiness-evidence.json", blockers);
  const access = runJsonScript("scripts/create-seis-ssh-public-access-report.mjs", []);
  const firstRun = runJsonScript("scripts/create-seis-ssh-public-first-run.mjs", []);
  const ssh = firstRun.serverAndPortPolicy?.currentSnapshot || access.localSshConfig || {};
  const scripts = packageJson?.scripts || {};

  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must be SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("server and port policy must preserve the existing target");
  if (scripts["check:seis-ssh-public-troubleshooting"] !== "node scripts/create-seis-ssh-public-troubleshooting-guide.mjs --check") blockers.push("package script check:seis-ssh-public-troubleshooting must be declared");
  if (scripts["report:seis-ssh-public-troubleshooting"] !== "node scripts/create-seis-ssh-public-troubleshooting-guide.mjs --write") blockers.push("package script report:seis-ssh-public-troubleshooting must be declared");
  if (scripts["run:seis-ssh-public-troubleshooting"] !== "npm run check:seis-ssh-public-troubleshooting && npm run report:seis-ssh-public-troubleshooting") blockers.push("package script run:seis-ssh-public-troubleshooting must be declared");
  if (ssh.transport === "local-or-lan") blockers.push("SEIS-SSH resolves to localhost, private LAN, or .local; public GitHub contributors need an approved cloud endpoint.");

  const diagnostics = buildDiagnostics({ firstRun, access, liveEvidence, ssh });
  for (const diagnostic of diagnostics) {
    if (diagnostic.severity === "blocker") blockers.push(diagnostic.summary);
    if (diagnostic.severity === "warning") warnings.push(diagnostic.summary);
  }

  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-public-troubleshooting-guide",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok ? "review-ready" : "blocked",
    mode: "read-only-no-live-ssh-no-config-write-no-network-auth-check",
    alias: "SEIS-SSH",
    purpose: "Give GitHub contributors a self-service troubleshooting map for SEIS-SSH without exposing secrets, opening SSH, writing config, or changing server/port.",
    serverAndPortPolicy: {
      invariant: "Keep the same server and port.",
      turkishInvariant: "Ayni sunucu ve baglanti noktasi korunur.",
      preservationMode: contract?.serverAndPortPolicy?.mode || "unknown",
      mutationAllowed: false,
      migrationRequiresApproval: true,
      currentSnapshot: {
        configured: ssh.configured === true,
        transport: ssh.transport || "unknown",
        hostnameKind: ssh.hostnameKind || "unknown",
        hostnameSha256Prefix: ssh.hostnameSha256Prefix || null,
        port: ssh.port || "22",
        pickerLikelyCompatible: ssh.pickerLikelyCompatible === true,
        liveConnectionAttempted: false
      }
    },
    diagnostics,
    decisionTree: [
      {
        question: "Do you only need to review the GitHub PR?",
        safeAction: "Run npm run check:seis-ssh-public-access and npm run check:seis-ssh-public-troubleshooting.",
        approvalRequired: false
      },
      {
        question: "Is SEIS-SSH missing locally?",
        safeAction: "Run npm run cloud:ssh-config:install -- --dry-run and inspect the generated plan before any config write.",
        approvalRequired: false
      },
      {
        question: "Does the picker show offline while terminal config exists?",
        safeAction: "Treat Codespaces ProxyCommand picker status as a warning; do not create a duplicate alias.",
        approvalRequired: false
      },
      {
        question: "Do you need a live shell?",
        safeAction: "Request owner approval, resolve the current live blocker, then run npm run cloud:ssh:online:strict.",
        approvalRequired: true
      },
      {
        question: "Does someone suggest changing HostName or Port?",
        safeAction: "Stop and require owner approval; the public contract preserves the existing server and port.",
        approvalRequired: true
      }
    ],
    commands: {
      selfService: [
        "npm run run:seis-ssh-public-first-run",
        "npm run run:seis-ssh-public-troubleshooting",
        "npm run check:seis-ssh-public-contributor-doctor"
      ],
      safeReview: [
        "npm run check:seis-ssh-public-access",
        "npm run check:seis-ssh-public-first-run",
        "npm run check:seis-ssh-public-troubleshooting",
        "npm run check:seis-ssh-live-readiness-evidence"
      ],
      approvalGatedLive: [
        "ssh SEIS-SSH",
        "npm run cloud:ssh:online:strict",
        "npm run cloud:ssh:mobile-direct:probe:strict"
      ]
    },
    generatedArtifacts: {
      json: outputJson,
      markdown: outputMarkdown
    },
    blockers,
    warnings,
    nextActions: nextActions({ blockers, warnings, ssh, liveEvidence }),
    safety: [
      "This troubleshooting guide does not open a live SSH session.",
      "This troubleshooting guide does not write ~/.ssh/config.",
      "This troubleshooting guide does not call gh auth status or contact GitHub.",
      "This troubleshooting guide does not print private keys, tokens, cookies, hostnames, or provider credentials.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function buildDiagnostics({ firstRun, access, liveEvidence, ssh }) {
  const diagnostics = [];
  diagnostics.push({
    id: "server-port-preserved",
    severity: "pass",
    summary: "SEIS-SSH public support keeps the same server and port policy.",
    evidence: "deploy/seis-ssh-public-access-contract.json",
    safeAction: "Keep the alias as SEIS-SSH and do not change HostName or Port without owner approval."
  });

  if (ssh.configured !== true) {
    diagnostics.push({
      id: "missing-local-alias",
      severity: "warning",
      summary: "SEIS-SSH is not configured locally yet.",
      evidence: "ssh -G SEIS-SSH did not resolve a configured Host block.",
      safeAction: "Run npm run cloud:ssh-config:install -- --dry-run and inspect the plan before any approved config write."
    });
  }

  if (ssh.transport === "local-or-lan") {
    diagnostics.push({
      id: "blocked-local-or-lan-target",
      severity: "blocker",
      summary: "SEIS-SSH resolves to a local or private LAN target.",
      evidence: "public access report transport classification",
      safeAction: "Restore the approved cloud target; do not publish localhost, .local, or private LAN endpoints for GitHub access."
    });
  }

  if (ssh.transport === "codespace") {
    diagnostics.push({
      id: "codespaces-picker-warning",
      severity: "warning",
      summary: "Codespaces transport is terminal-compatible but not generic picker proven.",
      evidence: "ProxyCommand-based github.codespaces transport",
      safeAction: "Keep one visible SEIS-SSH alias; use direct-cloud only after approved endpoint proof."
    });
  }

  if (liveEvidence?.status === "blocked-provider-billing") {
    diagnostics.push({
      id: "live-readiness-blocked-by-billing",
      severity: "warning",
      summary: "Latest live readiness evidence is blocked by GitHub Codespaces billing.",
      evidence: "content/development/seis-ssh-live-readiness-evidence.json",
      safeAction: "Resolve billing or approve an equivalent cloud endpoint before rerunning strict live checks."
    });
  }

  if (liveEvidence?.liveProbe?.strictReady !== true) {
    diagnostics.push({
      id: "live-ready-claim-forbidden",
      severity: "warning",
      summary: "SEIS-SSH must not be claimed live-ready yet.",
      evidence: "strictReady is not true in live readiness evidence",
      safeAction: "Attach the blocker honestly; do not claim online/mobile/picker readiness until strict evidence passes."
    });
  }

  if (firstRun.ok === true && access.ok === true) {
    diagnostics.push({
      id: "static-review-ready",
      severity: "pass",
      summary: "Static public review, first-run, and access reports are ready.",
      evidence: "first-run and public access report generators returned ok.",
      safeAction: "Use the generated markdown reports in PR review; live SSH still requires approval."
    });
  }

  return diagnostics;
}

function runJsonScript(script, argv) {
  const result = run(process.execPath, [script, ...argv]);
  try {
    return JSON.parse(result.stdout || "{}");
  } catch (error) {
    return {
      ok: false,
      blockers: [`${script} returned invalid JSON: ${error.message}`],
      warnings: sanitizeLines([result.stderr, result.stdout])
    };
  }
}

function run(command, argv) {
  const result = spawnSync(command, argv, {
    encoding: "utf8",
    timeout: 15000
  });
  return {
    status: result.status ?? (result.error ? 1 : 0),
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error?.message || null
  };
}

function nextActions({ blockers, warnings, ssh, liveEvidence }) {
  const actions = [];
  if (blockers.length > 0) actions.push("Fix blocker diagnostics, then rerun npm run check:seis-ssh-public-troubleshooting.");
  if (ssh.configured !== true) actions.push("Run the dry-run installer and contributor doctor before asking for live SSH approval.");
  if (ssh.transport === "codespace") actions.push("Keep Codespaces as terminal-compatible; use approved direct-cloud only when picker/mobile 24x7 proof is required.");
  if (liveEvidence?.status === "blocked-provider-billing") actions.push("Resolve GitHub Codespaces billing or approve an equivalent cloud endpoint before strict live readiness.");
  if (warnings.length > 0) actions.push("Keep warnings visible in the PR and generated reports; do not present them as live-ready status.");
  if (actions.length === 0) actions.push("Attach the troubleshooting guide to PR review and request explicit approval before any live SSH session.");
  return actions;
}

function renderMarkdown(guide) {
  const snapshot = guide.serverAndPortPolicy.currentSnapshot;
  return `# SEIS SSH Public Troubleshooting Guide

Generated: ${guide.generatedAt}

Status: ${guide.status}
Mode: ${guide.mode}
Alias: ${guide.alias}

## Purpose

${guide.purpose}

## Same Server And Port

- ${guide.serverAndPortPolicy.invariant}
- ${guide.serverAndPortPolicy.turkishInvariant}
- Preservation mode: ${guide.serverAndPortPolicy.preservationMode}
- Mutation allowed: no
- Migration requires approval: yes

## Current Sanitized Snapshot

| Field | Value |
| --- | --- |
| Configured | ${snapshot.configured ? "yes" : "no"} |
| Transport | ${snapshot.transport} |
| Hostname kind | ${snapshot.hostnameKind} |
| Host fingerprint | ${snapshot.hostnameSha256Prefix || "none"} |
| Port | ${snapshot.port} |
| Picker likely compatible | ${snapshot.pickerLikelyCompatible ? "yes" : "no"} |
| Live connection attempted | no |

## Diagnostics

${guide.diagnostics.map(renderDiagnostic).join("\n\n")}

## Decision Tree

${guide.decisionTree.map((item) => `- ${item.question} ${item.safeAction} Approval required: ${item.approvalRequired ? "yes" : "no"}.`).join("\n")}

## Self-Service Commands

\`\`\`bash
${guide.commands.selfService.join("\n")}
\`\`\`

## Safe Review Commands

\`\`\`bash
${guide.commands.safeReview.join("\n")}
\`\`\`

## Approval-Gated Live Commands

\`\`\`bash
${guide.commands.approvalGatedLive.join("\n")}
\`\`\`

## Blockers

${renderList(guide.blockers, "none")}

## Warnings

${renderList(guide.warnings, "none")}

## Next Actions

${renderList(guide.nextActions, "none")}

## Safety

${renderList(guide.safety, "none")}
`;
}

function renderDiagnostic(diagnostic) {
  return `### ${diagnostic.id}

- Severity: ${diagnostic.severity}
- Summary: ${diagnostic.summary}
- Evidence: ${diagnostic.evidence}
- Safe action: ${diagnostic.safeAction}`;
}

function readJson(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return null;
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function writeFile(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function sanitize(value) {
  return String(value || "")
    .replace(/-----BEGIN [^-]+PRIVATE KEY-----[\s\S]*?-----END [^-]+PRIVATE KEY-----/g, "[redacted-private-key]")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[redacted-api-key]")
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .replace(/\/Users\/[^/\s]+/g, "~")
    .slice(0, 500);
}

function sanitizeLines(values) {
  return values.filter(Boolean).map(sanitize);
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (["write", "check", "help"].includes(key)) {
      parsed[key] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/create-seis-ssh-public-troubleshooting-guide.mjs [--check] [--write] [--output file] [--markdown file]

Creates a read-only SEIS-SSH troubleshooting guide for public GitHub onboarding.
It does not open SSH, write SSH config, contact GitHub, or expose secrets.`);
}
