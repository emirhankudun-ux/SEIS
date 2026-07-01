#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/github-policy-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/github-policy-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const report = buildReport();

if (write) {
  writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(report));
}

if (!write) {
  console.log(JSON.stringify(report, null, 2));
}

if (check && !report.ok) {
  process.exit(1);
}

function buildReport() {
  const blockers = [];
  const warnings = [];
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", blockers);
  const packageJson = readJson("package.json", blockers);
  const runbook = readText("docs/deployment/seis-ssh-public-github-access.md", blockers);
  const status = readText("docs/STATUS.md", blockers);
  const queue = readText("docs/roadmap/NEXT_PR_QUEUE.md", blockers);
  const prTemplate = readText(".github/PULL_REQUEST_TEMPLATE.md", blockers);
  const workflow = readText(".github/workflows/seis-ssh-public-access.yml", blockers);
  const scripts = packageJson?.scripts || {};
  const signing = inspectSigning();

  const expectedRuleset = {
    name: "SEIS",
    enforcement: "ACTIVE",
    target: "BRANCH",
    requiredApprovingReviewCount: 10,
    requireCodeOwnerReview: true,
    requireLastPushApproval: true,
    requiredReviewThreadResolution: true,
    requiredSignatures: true
  };

  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must remain SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("contract must preserve the same server and port");
  if (contract?.githubExperience?.policyDoctor !== "npm run report:seis-ssh-public-github-policy") blockers.push("contract must link GitHub policy doctor report command");
  if (scripts["check:seis-ssh-public-github-policy"] !== "node scripts/create-seis-ssh-public-github-policy-doctor.mjs --check") blockers.push("package check script must be declared");
  if (scripts["report:seis-ssh-public-github-policy"] !== "node scripts/create-seis-ssh-public-github-policy-doctor.mjs --write") blockers.push("package report script must be declared");
  if (scripts["run:seis-ssh-public-github-policy"] !== "npm run check:seis-ssh-public-github-policy && npm run report:seis-ssh-public-github-policy") blockers.push("package run script must be declared");
  if (!workflow.includes("npm run check:seis-ssh-public-github-policy")) blockers.push("CI workflow must run GitHub policy doctor");

  for (const command of [
    "npm run check:seis-ssh-public-github-policy",
    "npm run report:seis-ssh-public-github-policy"
  ]) {
    if (!(contract?.requiredCommands || []).includes(command)) blockers.push(`contract must require ${command}`);
  }

  for (const surface of [
    "scripts/create-seis-ssh-public-github-policy-doctor.mjs",
    "reports/seis-ssh-public-access/github-policy-latest.md"
  ]) {
    if (!(contract?.evidenceSurfaces || []).includes(surface)) blockers.push(`contract evidence surfaces must include ${surface}`);
  }

  const docs = `${runbook}\n${status}\n${queue}\n${prTemplate}`;
  for (const token of [
    "npm run check:seis-ssh-public-github-policy",
    "npm run report:seis-ssh-public-github-policy",
    "signed commit setup",
    "required signatures",
    "last-push approval",
    "code owner review",
    "review-thread resolution",
    "same server and port"
  ]) {
    if (!docs.includes(token)) blockers.push(`docs must include ${token}`);
  }

  if (!signing.signatureReady) warnings.push("local signed commit setup is not proven");
  if (signing.latestCommitSignature.state !== "good-signature") warnings.push(`latest local commit signature state is ${signing.latestCommitSignature.state}`);

  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-public-github-policy-doctor",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok && signing.signatureReady ? "policy-ready-local-signing-detected" : ok ? "policy-setup-needed" : "blocked",
    mode: "read-only-no-github-auth-no-live-ssh-no-merge-no-config-write",
    alias: "SEIS-SSH",
    purpose: "Help public SEIS-SSH contributors understand GitHub review, last-push approval, signed commit setup, and merge policy prerequisites before they push or request merge.",
    serverAndPortPolicy: {
      invariant: "Keep the same server and port.",
      turkishInvariant: "Ayni sunucu ve baglanti noktasi korunur.",
      mutationAllowed: false,
      migrationRequiresApproval: true
    },
    githubPolicySnapshot: expectedRuleset,
    localGitSigning: signing,
    contributorChecklist: [
      "Keep SEIS-SSH as the only visible alias and preserve the same server and port.",
      "Run npm run check:seis-ssh-public-github-policy before pushing a SEIS-SSH PR update.",
      "Use signed commits or obtain an approved repository bypass before merge.",
      "Plan for requiredApprovingReviewCount: 10, code owner review, last-push approval, and review-thread resolution.",
      "Keep auto-merge enabled only after static gates are green and human policy work is acknowledged."
    ],
    commands: {
      check: "npm run check:seis-ssh-public-github-policy",
      report: "npm run report:seis-ssh-public-github-policy",
      safePrereqs: [
        "npm run check:seis-ssh-public-access",
        "npm run check:seis-ssh-public-merge-readiness",
        "npm run check:seis-ssh-public-artifact-hygiene",
        "git config --get commit.gpgsign"
      ],
      approvalGated: [
        "changing repository rulesets",
        "admin-bypassing required signatures",
        "signing or re-signing historical commits",
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
          "If local signing is not ready, configure commit signing outside this repo before the next public SEIS-SSH push.",
          "Keep required GitHub approvals and review-thread resolution visible in PR updates.",
          "Do not change SEIS-SSH host or port to work around GitHub policy blockers."
        ]
      : ["Fix GitHub policy doctor wiring, then rerun npm run check:seis-ssh-public-github-policy."],
    safety: [
      "This doctor does not call gh auth status or contact GitHub.",
      "This doctor does not open a live SSH session.",
      "This doctor does not merge, admin-bypass, force-push, or change repository rules.",
      "This doctor does not print signing keys, private keys, tokens, cookies, hostnames, full IPv4/IPv6 addresses, or provider credentials.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function inspectSigning() {
  const commitGpgSign = readGitConfig("commit.gpgsign");
  const gpgFormat = readGitConfig("gpg.format");
  const signingKey = readGitConfig("user.signingkey");
  const tagGpgSign = readGitConfig("tag.gpgsign");
  const latestSignature = latestCommitSignature();
  const commitSigningEnabled = normalizeBoolean(commitGpgSign.value) === true;
  const signatureReady = commitSigningEnabled && signingKey.present && ["good-signature", "good-signature-untrusted"].includes(latestSignature.state);

  return {
    checked: true,
    commitSigningEnabled,
    commitGpgSign: normalizeConfigBoolean(commitGpgSign),
    gpgFormat: gpgFormat.present ? sanitizeConfigValue(gpgFormat.value) : "unset",
    signingKeyConfigured: signingKey.present,
    tagGpgSign: normalizeConfigBoolean(tagGpgSign),
    latestCommitSignature: latestSignature,
    signatureReady,
    notes: [
      "Signing key values are intentionally not printed.",
      "Missing local signing config is setup-needed, not a SEIS-SSH server or port failure."
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
  return `# SEIS SSH Public GitHub Policy Doctor

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

## GitHub Policy Snapshot

- Ruleset: ${report.githubPolicySnapshot.name}
- Enforcement: ${report.githubPolicySnapshot.enforcement}
- Target: ${report.githubPolicySnapshot.target}
- requiredApprovingReviewCount: ${report.githubPolicySnapshot.requiredApprovingReviewCount}
- requireCodeOwnerReview: ${report.githubPolicySnapshot.requireCodeOwnerReview}
- requireLastPushApproval: ${report.githubPolicySnapshot.requireLastPushApproval}
- requiredReviewThreadResolution: ${report.githubPolicySnapshot.requiredReviewThreadResolution}
- required signatures: ${report.githubPolicySnapshot.requiredSignatures}

## Local Signed Commit Setup

- Commit signing enabled: ${report.localGitSigning.commitSigningEnabled}
- commit.gpgsign: ${report.localGitSigning.commitGpgSign}
- gpg.format: ${report.localGitSigning.gpgFormat}
- Signing key configured: ${report.localGitSigning.signingKeyConfigured}
- tag.gpgsign: ${report.localGitSigning.tagGpgSign}
- Latest commit signature state: ${report.localGitSigning.latestCommitSignature.state}
- Signature ready: ${report.localGitSigning.signatureReady}

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
  console.log(`Usage: node scripts/create-seis-ssh-public-github-policy-doctor.mjs [--check] [--write] [--output file] [--markdown file]

Creates a read-only SEIS-SSH public GitHub policy doctor. It does not contact
GitHub, open SSH, merge, admin-bypass, change repository settings, print
signing keys, or change server/port.`);
}
