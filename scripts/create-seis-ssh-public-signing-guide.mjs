#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/signing-guide-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/signing-guide-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const guide = buildGuide();

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

function buildGuide() {
  const blockers = [];
  const warnings = [];
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", blockers);
  const packageJson = readJson("package.json", blockers);
  const runbook = readText("docs/deployment/seis-ssh-public-github-access.md", blockers);
  const readme = readText("README.md", blockers);
  const prTemplate = readText(".github/PULL_REQUEST_TEMPLATE.md", blockers);
  const workflow = readText(".github/workflows/seis-ssh-public-access.yml", blockers);
  const scripts = packageJson?.scripts || {};
  const signing = inspectSigning();

  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must remain SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("contract must preserve the same server and port");
  if (contract?.githubExperience?.signingGuide !== "npm run report:seis-ssh-public-signing-guide") blockers.push("contract must link public signing guide report command");

  if (scripts["check:seis-ssh-public-signing-guide"] !== "node scripts/create-seis-ssh-public-signing-guide.mjs --check") blockers.push("package check script must be declared");
  if (scripts["report:seis-ssh-public-signing-guide"] !== "node scripts/create-seis-ssh-public-signing-guide.mjs --write") blockers.push("package report script must be declared");
  if (scripts["run:seis-ssh-public-signing-guide"] !== "npm run check:seis-ssh-public-signing-guide && npm run report:seis-ssh-public-signing-guide") blockers.push("package run script must be declared");
  if (!workflow.includes("npm run check:seis-ssh-public-signing-guide")) blockers.push("CI workflow must run the public signing guide check");

  for (const command of [
    "npm run check:seis-ssh-public-signing-guide",
    "npm run report:seis-ssh-public-signing-guide"
  ]) {
    if (!(contract?.requiredCommands || []).includes(command)) blockers.push(`contract must require ${command}`);
  }

  for (const surface of [
    "scripts/create-seis-ssh-public-signing-guide.mjs",
    "reports/seis-ssh-public-access/signing-guide-latest.md"
  ]) {
    if (!(contract?.evidenceSurfaces || []).includes(surface)) blockers.push(`contract evidence surfaces must include ${surface}`);
  }

  const docs = `${runbook}\n${readme}\n${prTemplate}`;
  for (const token of [
    "npm run check:seis-ssh-public-signing-guide",
    "npm run report:seis-ssh-public-signing-guide",
    "verified signed commits",
    "GitHub signing key",
    "same server and port",
    "required signatures"
  ]) {
    if (!docs.includes(token)) blockers.push(`docs must include ${token}`);
  }

  if (!signing.signatureReady) warnings.push("local verified signed commit setup is not proven");
  if (signing.latestCommitSignature.state !== "good-signature") warnings.push(`latest local commit signature state is ${signing.latestCommitSignature.state}`);

  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-public-signing-guide",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok && signing.signatureReady ? "signing-ready-local" : ok ? "signing-setup-needed" : "blocked",
    mode: "read-only-no-github-auth-no-live-ssh-no-config-write-no-key-print",
    alias: "SEIS-SSH",
    purpose: "Give public SEIS-SSH contributors a safe path to verified signed commits before GitHub required-signature policy blocks merge.",
    serverAndPortPolicy: {
      invariant: "Keep the same server and port.",
      turkishInvariant: "Ayni sunucu ve baglanti noktasi korunur.",
      mutationAllowed: false,
      migrationRequiresApproval: true
    },
    localGitSigning: signing,
    safeSetupPaths: [
      {
        id: "github-ssh-signing",
        label: "GitHub SSH signing key path",
        status: "manual-user-owned",
        steps: [
          "Create or select a user-owned public signing key outside the repository.",
          "Add only the public signing key to GitHub Settings as a signing key.",
          "Configure git signing outside this script using your chosen global or local scope.",
          "Make a new commit and verify it shows as signed before requesting merge."
        ],
        exampleCommandsNotRun: [
          "git config --global gpg.format ssh",
          "git config --global user.signingkey ~/.ssh/<public-signing-key>.pub",
          "git config --global commit.gpgsign true",
          "git log -1 --show-signature"
        ]
      },
      {
        id: "github-gpg-signing",
        label: "GitHub GPG signing key path",
        status: "manual-user-owned",
        steps: [
          "Generate or select a user-owned GPG signing key outside the repository.",
          "Add only the public GPG key to GitHub Settings.",
          "Configure git signing outside this script using your chosen global or local scope.",
          "Make a new commit and verify it shows as signed before requesting merge."
        ],
        exampleCommandsNotRun: [
          "git config --global gpg.format openpgp",
          "git config --global user.signingkey <public-key-id>",
          "git config --global commit.gpgsign true",
          "git log -1 --show-signature"
        ]
      }
    ],
    contributorChecklist: [
      "Run npm run check:seis-ssh-public-signing-guide before pushing a SEIS-SSH PR update.",
      "Use verified signed commits for new SEIS-SSH PR updates when repository rules require signatures.",
      "Do not paste private keys, tokens, passwords, cookies, or .env values into PRs, issues, docs, or generated reports.",
      "Keep SEIS-SSH as the only visible alias and preserve the same server and port.",
      "Treat signing setup as GitHub policy work, not as an SSH server or port change."
    ],
    commands: {
      check: "npm run check:seis-ssh-public-signing-guide",
      report: "npm run report:seis-ssh-public-signing-guide",
      safePrereqs: [
        "npm run check:seis-ssh-public-github-policy",
        "git log -1 --format=%G?",
        "git config --get commit.gpgsign"
      ],
      approvalGated: [
        "admin-bypassing required signatures",
        "signing or re-signing historical commits",
        "changing repository rulesets",
        "merging PR #56",
        "live SSH with ssh SEIS-SSH"
      ]
    },
    generatedArtifacts: {
      json: outputJson,
      markdown: outputMarkdown
    },
    blockers,
    warnings,
    nextActions: ok
      ? [
          "If signing is not ready, configure signing outside this script and create a new signed commit.",
          "Keep required GitHub approvals and last-push approval visible in PR updates.",
          "Do not change SEIS-SSH host or port to work around required-signature policy."
        ]
      : ["Fix signing guide wiring, then rerun npm run check:seis-ssh-public-signing-guide."],
    safety: [
      "This guide does not call gh auth status or contact GitHub.",
      "This guide does not open a live SSH session.",
      "This guide does not write git config, SSH config, GPG config, or repository settings.",
      "This guide does not print signing keys, private keys, tokens, cookies, hostnames, full IPv4/IPv6 addresses, or provider credentials.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function inspectSigning() {
  const commitGpgSign = readGitConfig("commit.gpgsign");
  const gpgFormat = readGitConfig("gpg.format");
  const signingKey = readGitConfig("user.signingkey");
  const latestSignature = latestCommitSignature();
  const commitSigningEnabled = normalizeBoolean(commitGpgSign.value) === true;
  const signatureReady = commitSigningEnabled && signingKey.present && ["good-signature", "good-signature-untrusted"].includes(latestSignature.state);

  return {
    checked: true,
    commitSigningEnabled,
    commitGpgSign: normalizeConfigBoolean(commitGpgSign),
    gpgFormat: gpgFormat.present ? sanitizeConfigValue(gpgFormat.value) : "unset",
    signingKeyConfigured: signingKey.present,
    latestCommitSignature: latestSignature,
    signatureReady,
    notes: [
      "Signing key values are intentionally not printed.",
      "Missing signing setup is setup-needed, not a SEIS-SSH server or port failure.",
      "This guide emits example commands but does not execute git config writes."
    ]
  };
}

function latestCommitSignature() {
  const result = run("git", ["log", "-1", "--format=%G?"]);
  const code = (result.stdout || "").trim() || "unknown";
  const states = {
    G: "good-signature",
    U: "good-signature-untrusted",
    B: "bad-signature",
    X: "expired-signature",
    Y: "expired-key",
    R: "revoked-key",
    E: "cannot-check-signature",
    N: "unsigned"
  };
  return {
    checked: result.status === 0,
    code,
    state: states[code] || "unknown"
  };
}

function readGitConfig(key) {
  const result = run("git", ["config", "--get", key]);
  return {
    key,
    present: result.status === 0 && Boolean((result.stdout || "").trim()),
    value: result.status === 0 ? (result.stdout || "").trim() : ""
  };
}

function normalizeConfigBoolean(config) {
  const value = normalizeBoolean(config.value);
  if (value === true) return "true";
  if (value === false) return "false";
  return "unset";
}

function normalizeBoolean(value) {
  if (/^(true|yes|on|1)$/i.test(value || "")) return true;
  if (/^(false|no|off|0)$/i.test(value || "")) return false;
  return null;
}

function sanitizeConfigValue(value) {
  if (/^[a-z0-9_.-]{1,32}$/i.test(value || "")) return value;
  return "configured";
}

function renderMarkdown(report) {
  return `# SEIS SSH Public Signing Guide

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Alias: ${report.alias}

## Purpose

${report.purpose}

## Same Server And Port

- ${report.serverAndPortPolicy.invariant}
- ${report.serverAndPortPolicy.turkishInvariant}
- Mutation allowed: no
- Migration requires approval: yes

## Local Signed Commit Setup

- Commit signing enabled: ${report.localGitSigning.commitSigningEnabled}
- commit.gpgsign: ${report.localGitSigning.commitGpgSign}
- gpg.format: ${report.localGitSigning.gpgFormat}
- Signing key configured: ${report.localGitSigning.signingKeyConfigured}
- Latest commit signature state: ${report.localGitSigning.latestCommitSignature.state}
- Signature ready: ${report.localGitSigning.signatureReady}

## Safe Setup Paths

${report.safeSetupPaths.map(renderSetupPath).join("\n\n")}

## Contributor Checklist

${renderList(report.contributorChecklist, "none")}

## Commands

- Check: \`${report.commands.check}\`
- Report: \`${report.commands.report}\`

## Safe Prereqs

${renderList(report.commands.safePrereqs, "none")}

## Approval-Gated Actions

${renderList(report.commands.approvalGated, "none")}

## Blockers

${renderList(report.blockers, "none")}

## Warnings

${renderList(report.warnings, "none")}

## Next Actions

${renderList(report.nextActions, "none")}

## Safety

${renderList(report.safety, "none")}
`;
}

function renderSetupPath(path) {
  return `### ${path.label}

- Status: ${path.status}
- Steps:
${renderList(path.steps, "none")}
- Example commands not run by this guide:
${renderList(path.exampleCommandsNotRun.map((command) => `\`${command}\``), "none")}`;
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
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
  console.log(`Usage: node scripts/create-seis-ssh-public-signing-guide.mjs [--check] [--write] [--output file] [--markdown file]

Creates a read-only SEIS-SSH public signing guide. It does not contact GitHub,
open SSH, write git config, print signing keys, or change server/port.`);
}
