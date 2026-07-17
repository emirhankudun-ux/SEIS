#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/support-packet-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/support-packet-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const packet = buildSupportPacket();

if (write) {
  writeFile(outputJson, `${JSON.stringify(packet, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(packet));
}

if (!write) {
  console.log(JSON.stringify(packet, null, 2));
}

if (check && !packet.ok) {
  process.exit(1);
}

function buildSupportPacket() {
  const blockers = [];
  const warnings = [];
  const packageJson = readJson("package.json", blockers);
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", blockers);
  const issueTemplate = readText(".github/ISSUE_TEMPLATE/seis_ssh_access.yml", blockers);
  const liveEvidence = readJson("content/development/seis-ssh-live-readiness-evidence.json", blockers);
  const firstRun = runJsonScript("scripts/create-seis-ssh-public-first-run.mjs", []);
  const troubleshooting = runJsonScript("scripts/create-seis-ssh-public-troubleshooting-guide.mjs", []);
  const doctor = runJsonScript("scripts/check-seis-ssh-public-contributor-doctor.mjs", []);
  const snapshot = firstRun.serverAndPortPolicy?.currentSnapshot
    || troubleshooting.serverAndPortPolicy?.currentSnapshot
    || doctor.serverAndPortPolicy?.currentSnapshot
    || {};
  const scripts = packageJson?.scripts || {};

  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must be SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("server and port policy must preserve the existing target");
  if (contract?.githubExperience?.supportIssueTemplate !== ".github/ISSUE_TEMPLATE/seis_ssh_access.yml") blockers.push("contract must link the SEIS-SSH support issue template");
  if (scripts["check:seis-ssh-public-support-packet"] !== "node scripts/create-seis-ssh-public-support-packet.mjs --check") blockers.push("package script check:seis-ssh-public-support-packet must be declared");
  if (scripts["report:seis-ssh-public-support-packet"] !== "node scripts/create-seis-ssh-public-support-packet.mjs --write") blockers.push("package script report:seis-ssh-public-support-packet must be declared");
  if (scripts["run:seis-ssh-public-support-packet"] !== "npm run check:seis-ssh-public-support-packet && npm run report:seis-ssh-public-support-packet") blockers.push("package script run:seis-ssh-public-support-packet must be declared");
  if (!issueTemplate.includes("SEIS SSH access support")) blockers.push("support issue template must be present");
  if (!issueTemplate.includes("Do not paste private keys, tokens, passwords, cookies, `.env` values, full hostnames, full IPv4/IPv6 addresses, or provider credentials.")) blockers.push("support issue template must warn against public secrets");
  if (!issueTemplate.includes("Keep the same server and port.")) blockers.push("support issue template must preserve same server and port");
  if (snapshot.transport === "local-or-lan") blockers.push("SEIS-SSH resolves to a local or private LAN target.");
  if (firstRun.ok !== true) blockers.push(...prefixItems("first-run", firstRun.blockers));
  if (troubleshooting.ok !== true) blockers.push(...prefixItems("troubleshooting", troubleshooting.blockers));
  if (doctor.ok !== true) blockers.push(...prefixItems("contributor-doctor", doctor.blockers));

  warnings.push(...prefixItems("first-run", firstRun.warnings));
  warnings.push(...prefixItems("troubleshooting", troubleshooting.warnings));
  warnings.push(...prefixItems("contributor-doctor", doctor.warnings));
  if (liveEvidence?.status === "blocked-provider-billing") warnings.push("live-readiness-blocked-by-billing");
  if (liveEvidence?.liveProbe?.strictReady !== true) warnings.push("live-ready-claim-forbidden");

  const diagnosticIds = Array.isArray(troubleshooting.diagnostics)
    ? troubleshooting.diagnostics.map((item) => `${item.id}:${item.severity}`)
    : [];
  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-public-support-packet",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok ? "issue-ready" : "blocked",
    mode: "read-only-no-live-ssh-no-config-write-no-network-auth-check",
    alias: "SEIS-SSH",
    purpose: "Create a sanitized copy/paste packet for the public SEIS-SSH GitHub support issue form without exposing secrets, opening SSH, writing config, or changing server/port.",
    supportIssueTemplate: ".github/ISSUE_TEMPLATE/seis_ssh_access.yml",
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
    issueFormCopy: {
      titlePrefix: "[SEIS-SSH]",
      userType: "GitHub contributor / Individual SEIS user / ChatGPT/Codex user",
      supportCase: supportCase({ snapshot, liveEvidence, diagnosticIds }),
      commandsRun: [
        "npm run run:seis-ssh-public-github-quickstart -> quickstart-ready",
        "npm run check:seis-ssh-public-pr-template -> passed",
        "npm run check:seis-ssh-public-ci-workflow -> passed",
        "npm run check:seis-ssh-public-readiness-matrix -> passed",
        "npm run check:seis-ssh-public-artifact-hygiene -> passed",
        "npm run check:seis-ssh-public-merge-readiness -> policy-blocked-review-ready",
        "npm run check:seis-ssh-public-github-policy -> policy-ready-or-setup-needed",
        "npm run check:seis-ssh-public-signing-guide -> signing-ready-or-setup-needed",
        "npm run check:seis-ssh-public-review-bundle -> review-bundle-ready",
        `npm run run:seis-ssh-public-first-run -> ${firstRun.status || statusLabel(firstRun)}`,
        `npm run run:seis-ssh-public-troubleshooting -> ${troubleshooting.status || statusLabel(troubleshooting)}`,
        `npm run report:seis-ssh-public-contributor-doctor -> ${doctor.status || statusLabel(doctor)}`,
        "npm run report:seis-ssh-public-support-packet -> issue-ready"
      ],
      sanitizedStatus: {
        packetStatus: ok ? "issue-ready" : "blocked",
        alias: "SEIS-SSH",
        transport: snapshot.transport || "unknown",
        hostnameKind: snapshot.hostnameKind || "unknown",
        hostnameSha256Prefix: snapshot.hostnameSha256Prefix || null,
        port: snapshot.port || "22",
        diagnostics: diagnosticIds,
        warnings: unique(warnings).map(sanitize)
      },
      expectedOutcome: "A maintainer can diagnose the public SEIS-SSH setup path from sanitized report labels without changing server/port or requesting shared credentials.",
      actualOutcome: ok
        ? "Support packet generated. Attach the sanitized fields to the SEIS SSH access support issue form."
        : "Support packet blocked. Fix blocker labels first, then regenerate the packet.",
      safetyConfirmations: [
        "No private keys, tokens, passwords, cookies, .env values, full hostnames, full IPv4/IPv6 addresses, or provider credentials are included.",
        "No request to change the SEIS-SSH server or port is included.",
        "No live SSH session was attempted by this support packet."
      ]
    },
    commands: {
      generatePacket: [
        "npm run check:seis-ssh-public-support-packet",
        "npm run report:seis-ssh-public-support-packet"
      ],
      safeInputs: [
        "npm run run:seis-ssh-public-github-quickstart",
        "npm run check:seis-ssh-public-pr-template",
        "npm run check:seis-ssh-public-ci-workflow",
        "npm run check:seis-ssh-public-readiness-matrix",
        "npm run check:seis-ssh-public-artifact-hygiene",
        "npm run check:seis-ssh-public-merge-readiness",
        "npm run check:seis-ssh-public-github-policy",
        "npm run check:seis-ssh-public-signing-guide",
        "npm run check:seis-ssh-public-review-bundle",
        "npm run run:seis-ssh-public-first-run",
        "npm run run:seis-ssh-public-troubleshooting",
        "npm run report:seis-ssh-public-contributor-doctor"
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
    blockers: unique(blockers).map(sanitize),
    warnings: unique(warnings).map(sanitize),
    nextActions: nextActions({ ok, warnings, snapshot, liveEvidence }),
    safety: [
      "This support packet does not open a live SSH session.",
      "This support packet does not write ~/.ssh/config.",
      "This support packet does not call gh auth status or contact GitHub.",
      "This support packet does not print private keys, tokens, cookies, full hostnames, full IPv4/IPv6 addresses, or provider credentials.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function supportCase({ snapshot, liveEvidence, diagnosticIds }) {
  if (snapshot.configured !== true) return "First-run setup";
  if (diagnosticIds.some((item) => item.startsWith("codespaces-picker-warning:"))) return "Codespaces picker warning";
  if (liveEvidence?.status === "blocked-provider-billing") return "GitHub Codespaces billing blocker";
  if (liveEvidence?.liveProbe?.strictReady !== true) return "Live-ready claim review";
  return "Troubleshooting guide";
}

function statusLabel(result) {
  if (result?.ok === true) return "passed";
  if (result?.ok === false) return "failed";
  return "unknown";
}

function nextActions({ ok, warnings, snapshot, liveEvidence }) {
  const actions = [];
  if (!ok) actions.push("Fix blocker labels, then rerun npm run check:seis-ssh-public-support-packet.");
  if (snapshot.transport === "codespace") actions.push("Use the support packet to report Codespaces picker warnings without creating a duplicate alias.");
  if (liveEvidence?.status === "blocked-provider-billing") actions.push("Keep the GitHub Codespaces billing blocker visible; do not claim live readiness.");
  if (warnings.length > 0) actions.push("Paste warning IDs, not raw SSH config output, into the GitHub issue form.");
  if (actions.length === 0) actions.push("Paste the sanitized support packet fields into the SEIS SSH access support issue form.");
  return actions;
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
    timeout: 15000
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

function renderMarkdown(packet) {
  const snapshot = packet.serverAndPortPolicy.currentSnapshot;
  return `# SEIS SSH Public Support Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}
Mode: ${packet.mode}
Alias: ${packet.alias}
Issue form: ${packet.supportIssueTemplate}

## Purpose

${packet.purpose}

## Same Server And Port

- ${packet.serverAndPortPolicy.invariant}
- ${packet.serverAndPortPolicy.turkishInvariant}
- Preservation mode: ${packet.serverAndPortPolicy.preservationMode}
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

## GitHub Issue Copy

### Commands Run

\`\`\`text
${packet.issueFormCopy.commandsRun.join("\n")}
\`\`\`

### Sanitized Status

\`\`\`json
${JSON.stringify(packet.issueFormCopy.sanitizedStatus, null, 2)}
\`\`\`

### Expected Outcome

${packet.issueFormCopy.expectedOutcome}

### Actual Outcome

${packet.issueFormCopy.actualOutcome}

### Safety Confirmations

${renderList(packet.issueFormCopy.safetyConfirmations, "none")}

## Support Packet Commands

\`\`\`bash
${packet.commands.generatePacket.join("\n")}
\`\`\`

## Safe Inputs

\`\`\`bash
${packet.commands.safeInputs.join("\n")}
\`\`\`

## Approval-Gated Live Commands

\`\`\`bash
${packet.commands.approvalGatedLive.join("\n")}
\`\`\`

## Blockers

${renderList(packet.blockers, "none")}

## Warnings

${renderList(packet.warnings, "none")}

## Next Actions

${renderList(packet.nextActions, "none")}

## Safety

${renderList(packet.safety, "none")}
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
    .replace(/github_pat_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[redacted-ip]")
    .replace(/\b(?:[a-f0-9]{1,4}:){4,7}[a-f0-9]{1,4}\b/gi, "[redacted-ipv6]")
    .replace(/\b(?:f[cd][a-f0-9]{0,2}|fe80):[a-f0-9:]{2,}\b/gi, "[redacted-ipv6]")
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
  console.log(`Usage: node scripts/create-seis-ssh-public-support-packet.mjs [--check] [--write] [--output file] [--markdown file]

Creates a read-only, secret-safe SEIS-SSH support packet for the public GitHub issue form.
It does not open SSH, write SSH config, contact GitHub, change server/port, or expose secrets.`);
}
