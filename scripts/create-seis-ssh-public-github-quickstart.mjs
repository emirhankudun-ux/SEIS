#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/github-quickstart-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/github-quickstart-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const quickstart = buildQuickstart();

if (write) {
  writeFile(outputJson, `${JSON.stringify(quickstart, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(quickstart));
}

if (!write) {
  console.log(JSON.stringify(quickstart, null, 2));
}

if (check && !quickstart.ok) {
  process.exit(1);
}

function buildQuickstart() {
  const blockers = [];
  const warnings = [];
  const packageJson = readJson("package.json", blockers);
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", blockers);
  const issueTemplate = readText(".github/ISSUE_TEMPLATE/seis_ssh_access.yml", blockers);
  const runbook = readText("docs/deployment/seis-ssh-public-github-access.md", blockers);
  const liveEvidence = readJson("content/development/seis-ssh-live-readiness-evidence.json", blockers);
  const firstRun = runJsonScript("scripts/create-seis-ssh-public-first-run.mjs", []);
  const troubleshooting = runJsonScript("scripts/create-seis-ssh-public-troubleshooting-guide.mjs", []);
  const doctor = runJsonScript("scripts/check-seis-ssh-public-contributor-doctor.mjs", []);
  const supportPacket = runJsonScript("scripts/create-seis-ssh-public-support-packet.mjs", []);
  const snapshot = supportPacket.serverAndPortPolicy?.currentSnapshot
    || firstRun.serverAndPortPolicy?.currentSnapshot
    || troubleshooting.serverAndPortPolicy?.currentSnapshot
    || doctor.serverAndPortPolicy?.currentSnapshot
    || {};
  const scripts = packageJson?.scripts || {};

  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must be SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("server and port policy must preserve the existing target");
  if (!issueTemplate.includes("SEIS SSH access support")) blockers.push("support issue form must exist");
  if (!runbook.includes("npm run run:seis-ssh-public-github-quickstart")) blockers.push("runbook must document GitHub quickstart command");
  if (scripts["check:seis-ssh-public-github-quickstart"] !== "node scripts/create-seis-ssh-public-github-quickstart.mjs --check") blockers.push("package script check:seis-ssh-public-github-quickstart must be declared");
  if (scripts["report:seis-ssh-public-github-quickstart"] !== "node scripts/create-seis-ssh-public-github-quickstart.mjs --write") blockers.push("package script report:seis-ssh-public-github-quickstart must be declared");
  if (scripts["run:seis-ssh-public-github-quickstart"] !== "npm run check:seis-ssh-public-github-quickstart && npm run report:seis-ssh-public-github-quickstart") blockers.push("package script run:seis-ssh-public-github-quickstart must be declared");
  if (snapshot.transport === "local-or-lan") blockers.push("SEIS-SSH resolves to a local or private LAN target.");
  if (firstRun.ok !== true) blockers.push(...prefixItems("first-run", firstRun.blockers));
  if (troubleshooting.ok !== true) blockers.push(...prefixItems("troubleshooting", troubleshooting.blockers));
  if (doctor.ok !== true) blockers.push(...prefixItems("contributor-doctor", doctor.blockers));
  if (supportPacket.ok !== true) blockers.push(...prefixItems("support-packet", supportPacket.blockers));

  warnings.push(...prefixItems("first-run", firstRun.warnings));
  warnings.push(...prefixItems("troubleshooting", troubleshooting.warnings));
  warnings.push(...prefixItems("contributor-doctor", doctor.warnings));
  warnings.push(...prefixItems("support-packet", supportPacket.warnings));
  if (liveEvidence?.status === "blocked-provider-billing") warnings.push("live-readiness-blocked-by-billing");
  if (liveEvidence?.liveProbe?.strictReady !== true) warnings.push("live-ready-claim-forbidden");

  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-public-github-quickstart",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok ? "quickstart-ready" : "blocked",
    mode: "read-only-no-live-ssh-no-config-write-no-network-auth-check",
    alias: "SEIS-SSH",
    purpose: "Give GitHub contributors one safe SEIS-SSH path from first run to support request without exposing secrets, opening SSH, writing config, or changing server/port.",
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
    quickstartSteps: [
      {
        id: "first-run",
        label: "Start here",
        command: "npm run run:seis-ssh-public-first-run",
        expectedSafeResult: firstRun.status || statusLabel(firstRun),
        claim: "Local setup snapshot only; no SSH session and no config write."
      },
      {
        id: "troubleshooting",
        label: "Self-diagnose warnings",
        command: "npm run run:seis-ssh-public-troubleshooting",
        expectedSafeResult: troubleshooting.status || statusLabel(troubleshooting),
        claim: "Maps missing alias, picker warning, billing blocker, and live-ready boundaries."
      },
      {
        id: "contributor-doctor",
        label: "Check local prerequisites",
        command: "npm run report:seis-ssh-public-contributor-doctor",
        expectedSafeResult: doctor.status || statusLabel(doctor),
        claim: "Checks local tools and sanitized SEIS-SSH state without contacting GitHub."
      },
      {
        id: "support-packet",
        label: "Open a clean GitHub support issue",
        command: "npm run run:seis-ssh-public-support-packet",
        expectedSafeResult: supportPacket.status || statusLabel(supportPacket),
        claim: "Produces copy/paste issue fields with sanitized warning and blocker IDs."
      },
      {
        id: "live-ssh",
        label: "Live SSH only after approval",
        command: "ssh SEIS-SSH",
        expectedSafeResult: "approval-gated",
        claim: "A real SSH session is outside this quickstart and needs explicit maintainer approval."
      }
    ],
    githubIssueForm: {
      template: ".github/ISSUE_TEMPLATE/seis_ssh_access.yml",
      titlePrefix: "[SEIS-SSH]",
      safePayloadSource: "reports/seis-ssh-public-access/support-packet-latest.md",
      doNotPaste: [
        "private keys",
        "tokens",
        "passwords",
        "cookies",
        ".env values",
        "full hostnames",
        "full IP addresses",
        "provider credentials"
      ]
    },
    decision: decision({ ok, snapshot, liveEvidence, warnings }),
    commands: {
      oneCommand: "npm run run:seis-ssh-public-github-quickstart",
      reviewCommands: [
        "npm run check:seis-ssh-public-github-quickstart",
        "npm run report:seis-ssh-public-github-quickstart",
        "npm run check:seis-ssh-public-pr-template",
        "npm run check:seis-ssh-public-artifact-hygiene",
        "npm run check:seis-ssh-public-access",
        "npm run check:seis-ssh-public-support-packet"
      ],
      approvalGatedLive: [
        "ssh SEIS-SSH",
        "npm run cloud:ssh:online:strict"
      ]
    },
    generatedArtifacts: {
      json: outputJson,
      markdown: outputMarkdown
    },
    blockers: unique(blockers).map(sanitize),
    warnings: unique(warnings).map(sanitize),
    nextActions: nextActions({ ok, snapshot, liveEvidence, warnings }),
    safety: [
      "This quickstart does not open a live SSH session.",
      "This quickstart does not write ~/.ssh/config.",
      "This quickstart does not call gh auth status or contact GitHub.",
      "This quickstart does not print private keys, tokens, cookies, full hostnames, full IP addresses, or provider credentials.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function decision({ ok, snapshot, liveEvidence, warnings }) {
  if (!ok) return "Fix blocker labels, then rerun the quickstart.";
  if (snapshot.configured !== true) return "Setup is needed locally before live SSH can be considered.";
  if (liveEvidence?.status === "blocked-provider-billing") return "Static onboarding is ready; live readiness remains blocked by provider billing evidence.";
  if ((warnings || []).length > 0) return "Static onboarding is ready with warnings; paste warning IDs into the support form.";
  return "Static onboarding is ready; request explicit approval before any live SSH session.";
}

function nextActions({ ok, snapshot, liveEvidence, warnings }) {
  const actions = [];
  if (!ok) actions.push("Fix blockers, then rerun npm run check:seis-ssh-public-github-quickstart.");
  if (snapshot.configured !== true) actions.push("Run the dry-run SSH config installer before any write or live SSH request.");
  if (snapshot.transport === "codespace") actions.push("Keep Codespaces picker warnings visible without creating duplicate aliases.");
  if (liveEvidence?.status === "blocked-provider-billing") actions.push("Do not claim live readiness until the billing blocker is resolved and strict evidence passes.");
  if ((warnings || []).length > 0) actions.push("Use warning IDs and the support packet instead of raw ssh -G output in GitHub issues.");
  if (actions.length === 0) actions.push("Attach github-quickstart-latest.md to PR review and request explicit approval before live SSH.");
  return actions;
}

function statusLabel(result) {
  if (result?.ok === true) return "passed";
  if (result?.ok === false) return "failed";
  return "unknown";
}

function runJsonScript(script, argv) {
  const result = run(process.execPath, [script, ...argv]);
  if (result.status !== 0) {
    return {
      ok: false,
      status: "blocked",
      blockers: [`${script} exited with status ${result.status}`],
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

function run(command, argv) {
  const result = spawnSync(command, argv, {
    encoding: "utf8",
    timeout: 20000
  });
  return {
    status: result.status ?? (result.error ? 1 : 0),
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error?.message || null
  };
}

function readJson(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return null;
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

function readText(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function prefixItems(prefix, values) {
  if (!Array.isArray(values)) return [];
  return values.map((value) => `${prefix}: ${value}`);
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function renderMarkdown(quickstart) {
  const snapshot = quickstart.serverAndPortPolicy.currentSnapshot;
  return `# SEIS SSH Public GitHub Quickstart

Generated: ${quickstart.generatedAt}

Status: ${quickstart.status}
Mode: ${quickstart.mode}
Alias: ${quickstart.alias}

## Purpose

${quickstart.purpose}

## Same Server And Port

- ${quickstart.serverAndPortPolicy.invariant}
- ${quickstart.serverAndPortPolicy.turkishInvariant}
- Preservation mode: ${quickstart.serverAndPortPolicy.preservationMode}
- Mutation allowed: no
- Migration requires approval: yes

## Sanitized Snapshot

| Field | Value |
| --- | --- |
| Configured | ${snapshot.configured ? "yes" : "no"} |
| Transport | ${snapshot.transport} |
| Hostname kind | ${snapshot.hostnameKind} |
| Host fingerprint | ${snapshot.hostnameSha256Prefix || "none"} |
| Port | ${snapshot.port} |
| Picker likely compatible | ${snapshot.pickerLikelyCompatible ? "yes" : "no"} |
| Live connection attempted | no |

## Quickstart Steps

${quickstart.quickstartSteps.map((step, index) => `${index + 1}. ${step.label}
   - Command: \`${step.command}\`
   - Safe result: \`${step.expectedSafeResult}\`
   - Boundary: ${step.claim}`).join("\n\n")}

## GitHub Issue Form

- Template: ${quickstart.githubIssueForm.template}
- Title prefix: ${quickstart.githubIssueForm.titlePrefix}
- Safe payload source: ${quickstart.githubIssueForm.safePayloadSource}
- Do not paste: ${quickstart.githubIssueForm.doNotPaste.join(", ")}

## Decision

${quickstart.decision}

## Review Commands

\`\`\`bash
${quickstart.commands.reviewCommands.join("\n")}
\`\`\`

## Approval-Gated Live Commands

\`\`\`bash
${quickstart.commands.approvalGatedLive.join("\n")}
\`\`\`

## Blockers

${renderList(quickstart.blockers, "none")}

## Warnings

${renderList(quickstart.warnings, "none")}

## Next Actions

${renderList(quickstart.nextActions, "none")}

## Safety

${renderList(quickstart.safety, "none")}
`;
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
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[redacted-ip]")
    .replace(/(?:[a-z0-9-]+\.)+[a-z]{2,}/gi, "[redacted-hostname]")
    .replace(/\/Users\/[^/\s]+/g, "~")
    .slice(0, 700);
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
  console.log(`Usage: node scripts/create-seis-ssh-public-github-quickstart.mjs [--check] [--write] [--output file] [--markdown file]

Creates a read-only, secret-safe SEIS-SSH GitHub quickstart for public contributors.
It does not open SSH, write SSH config, contact GitHub, change server/port, or expose secrets.`);
}
