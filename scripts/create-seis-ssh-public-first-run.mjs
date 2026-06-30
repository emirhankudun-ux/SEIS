#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/first-run-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/first-run-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const guide = buildFirstRunGuide();

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

function buildFirstRunGuide() {
  const blockers = [];
  const warnings = [];
  const packageJson = readJson("package.json", blockers);
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", blockers);
  const runbook = readText("docs/deployment/seis-ssh-public-github-access.md", blockers);
  const access = runAccessReport();
  const ssh = access.localSshConfig || {};
  const scripts = packageJson?.scripts || {};

  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must be SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("server and port policy must preserve the existing target");
  if (scripts["check:seis-ssh-public-first-run"] !== "node scripts/create-seis-ssh-public-first-run.mjs --check") blockers.push("package script check:seis-ssh-public-first-run must be declared");
  if (scripts["report:seis-ssh-public-first-run"] !== "node scripts/create-seis-ssh-public-first-run.mjs --write") blockers.push("package script report:seis-ssh-public-first-run must be declared");
  if (!runbook.includes("npm run run:seis-ssh-public-first-run")) blockers.push("runbook must document first-run command");
  if (Array.isArray(access.blockers)) blockers.push(...access.blockers.map((item) => `access-report: ${item}`));
  if (ssh.transport === "local-or-lan") blockers.push("SEIS-SSH resolves to localhost, private LAN, or .local; public GitHub access must preserve an approved cloud endpoint");

  const tools = {
    node: commandProbe(process.execPath, ["--version"]),
    npm: commandProbe("npm", ["--version"]),
    git: commandProbe("git", ["--version"]),
    ssh: commandProbe("ssh", ["-V"]),
    gh: commandProbe("gh", ["--version"])
  };

  if (!tools.git.available) warnings.push("Git is not available; GitHub review workflows need git.");
  if (!tools.ssh.available) warnings.push("OpenSSH is not available; SSH config inspection needs ssh.");
  if (!tools.gh.available) warnings.push("GitHub CLI is not available; Codespaces-based onboarding needs gh.");
  if (ssh.configured !== true) warnings.push("SEIS-SSH is not configured locally yet; start with the dry-run installer and do not write config without approval.");
  if (ssh.transport === "codespace") warnings.push("Codespaces transport is terminal-compatible, but some GUI pickers may show ProxyCommand targets offline.");
  if (ssh.pickerLikelyCompatible !== true) warnings.push("Picker-compatible direct-cloud mode is not proven.");

  const localReady = tools.git.available
    && tools.ssh.available
    && ssh.configured === true
    && ssh.transport !== "local-or-lan";
  const status = blockers.length > 0 ? "blocked" : localReady ? "local-ready" : "setup-needed";

  return {
    id: "seis-ssh-public-first-run",
    generatedAt: new Date().toISOString(),
    ok: blockers.length === 0,
    status,
    mode: "read-only-no-live-ssh-no-config-write-no-network-auth-check",
    alias: "SEIS-SSH",
    purpose: "Give a new GitHub contributor one safe first command, a sanitized local snapshot, and the next approved path without changing the server or port.",
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
        proxyCommandPresent: ssh.proxyCommandPresent === true,
        pickerLikelyCompatible: ssh.pickerLikelyCompatible === true,
        liveConnectionAttempted: false
      }
    },
    localTools: tools,
    readiness: {
      publicReviewReady: blockers.length === 0,
      localUseReady: localReady,
      setupNeeded: !localReady,
      sharedCredentialsRequired: false,
      sshConfigWritten: false,
      liveSshAttempted: false,
      liveReadinessProven: false,
      currentBestPath: localReady
        ? "Run the public onboarding command, then request approval before any live SSH attempt."
        : "Run the dry-run installer and contributor doctor; use only your own authorized GitHub/Codespaces or approved cloud access."
    },
    commands: {
      firstRun: [
        "npm run run:seis-ssh-public-first-run"
      ],
      safeReview: [
        "npm run check:seis-ssh-public-first-run",
        "npm run report:seis-ssh-public-first-run",
        "npm run check:seis-ssh-public-access",
        "npm run check:seis-ssh-public-contributor-doctor"
      ],
      setupDryRun: [
        "gh auth refresh -h github.com -s codespace",
        "npm run cloud:ssh-config:install -- --dry-run",
        "npm run check:seis-ssh-picker-compatibility"
      ],
      localInspection: [
        "ssh -G SEIS-SSH"
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
    nextActions: nextActions({ blockers, warnings, localReady, ssh }),
    safety: [
      "This first-run guide does not open a live SSH session.",
      "This first-run guide does not write ~/.ssh/config.",
      "This first-run guide does not call gh auth status or contact GitHub.",
      "This first-run guide does not print private keys, tokens, cookies, hostnames, or provider credentials.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function runAccessReport() {
  const result = run(process.execPath, ["scripts/create-seis-ssh-public-access-report.mjs"]);
  try {
    return JSON.parse(result.stdout || "{}");
  } catch (error) {
    return {
      ok: false,
      blockers: [`access report returned invalid JSON: ${error.message}`],
      warnings: sanitizeLines([result.stderr, result.stdout]),
      localSshConfig: {
        checked: false,
        configured: false,
        alias: "SEIS-SSH"
      }
    };
  }
}

function commandProbe(command, argv) {
  const result = run(command, argv);
  const output = sanitize(`${result.stdout || ""}\n${result.stderr || ""}`).trim();
  return {
    available: result.status === 0,
    command: command === process.execPath ? "node" : command,
    version: output.split(/\r?\n/).find(Boolean) || null
  };
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

function nextActions({ blockers, warnings, localReady, ssh }) {
  const actions = [];
  if (blockers.length > 0) actions.push("Fix blocking public-access contract or unsafe SSH target issues, then rerun npm run check:seis-ssh-public-first-run.");
  if (!localReady) actions.push("Run npm run cloud:ssh-config:install -- --dry-run, then run npm run check:seis-ssh-public-contributor-doctor.");
  if (ssh.transport === "codespace") actions.push("Keep Codespaces for terminal-compatible usage; use approved direct-cloud only when picker/mobile 24x7 proof is required.");
  if (warnings.length > 0) actions.push("Keep warnings visible in PR review; do not convert setup-needed into a live-ready claim.");
  if (actions.length === 0) actions.push("Run npm run run:seis-ssh-public-onboarding, then request explicit approval before any live SSH command.");
  return actions;
}

function renderMarkdown(guide) {
  const snapshot = guide.serverAndPortPolicy.currentSnapshot;
  return `# SEIS SSH Public First Run

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
| ProxyCommand present | ${snapshot.proxyCommandPresent ? "yes" : "no"} |
| Picker likely compatible | ${snapshot.pickerLikelyCompatible ? "yes" : "no"} |
| Live connection attempted | no |

## Readiness

| Field | Value |
| --- | --- |
| Public review ready | ${guide.readiness.publicReviewReady ? "yes" : "no"} |
| Local use ready | ${guide.readiness.localUseReady ? "yes" : "no"} |
| Setup needed | ${guide.readiness.setupNeeded ? "yes" : "no"} |
| Shared credentials required | no |
| SSH config written | no |
| Live SSH attempted | no |
| Live readiness proven | no |

## Local Tools

| Tool | Available | Version |
| --- | --- | --- |
${Object.entries(guide.localTools).map(([name, item]) => `| ${name} | ${item.available ? "yes" : "no"} | ${item.version || "unknown"} |`).join("\n")}

## First Command

\`\`\`bash
${guide.commands.firstRun.join("\n")}
\`\`\`

## Safe Review Commands

\`\`\`bash
${guide.commands.safeReview.join("\n")}
\`\`\`

## Setup Dry Run

\`\`\`bash
${guide.commands.setupDryRun.join("\n")}
\`\`\`

## Local Inspection

\`\`\`bash
${guide.commands.localInspection.join("\n")}
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
  console.log(`Usage: node scripts/create-seis-ssh-public-first-run.mjs [--check] [--write] [--output file] [--markdown file]

Creates a read-only first-run guide for public SEIS-SSH GitHub onboarding.
It does not open SSH, write SSH config, contact GitHub, or expose secrets.`);
}
