#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/merge-readiness-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/merge-readiness-latest.md";

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
  const workflow = readText(".github/workflows/seis-ssh-public-access.yml", blockers);
  const scripts = packageJson?.scripts || {};

  const expectedRuleset = {
    name: "SEIS",
    enforcement: "ACTIVE",
    target: "BRANCH",
    requiredApprovingReviewCount: 10,
    requireCodeOwnerReview: true,
    requireLastPushApproval: true,
    requiredReviewThreadResolution: true,
    dismissStaleReviewsOnPush: true,
    requiredSignatures: true
  };

  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must remain SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("contract must preserve the same server and port");
  if (!contract?.githubExperience?.mergeReadinessReport) blockers.push("contract must link merge readiness report command");
  if (scripts["check:seis-ssh-public-merge-readiness"] !== "node scripts/create-seis-ssh-public-merge-readiness.mjs --check") blockers.push("package check script must be declared");
  if (scripts["report:seis-ssh-public-merge-readiness"] !== "node scripts/create-seis-ssh-public-merge-readiness.mjs --write") blockers.push("package report script must be declared");
  if (!workflow.includes("npm run check:seis-ssh-public-merge-readiness")) blockers.push("CI workflow must run merge readiness gate");

  for (const command of [
    "npm run check:seis-ssh-public-merge-readiness",
    "npm run report:seis-ssh-public-merge-readiness"
  ]) {
    if (!(contract?.requiredCommands || []).includes(command)) blockers.push(`contract must require ${command}`);
  }

  for (const surface of [
    "scripts/create-seis-ssh-public-merge-readiness.mjs",
    "reports/seis-ssh-public-access/merge-readiness-latest.md"
  ]) {
    if (!(contract?.evidenceSurfaces || []).includes(surface)) blockers.push(`contract evidence surfaces must include ${surface}`);
  }

  const docs = `${runbook}\n${status}\n${queue}`;
  for (const token of [
    "npm run check:seis-ssh-public-merge-readiness",
    "npm run report:seis-ssh-public-merge-readiness",
    "requiredApprovingReviewCount: 10",
    "requireCodeOwnerReview: true",
    "requireLastPushApproval: true",
    "required signatures",
    "mergeStateStatus: BLOCKED",
    "auto-merge"
  ]) {
    if (!docs.includes(token)) blockers.push(`docs must include ${token}`);
  }

  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-public-merge-readiness",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok ? "policy-blocked-review-ready" : "blocked",
    mode: "read-only-no-live-ssh-no-github-auth-no-merge",
    alias: "SEIS-SSH",
    purpose: "Keep the public SEIS-SSH PR merge state honest: static public SSH gates may be green while GitHub repository rules still require human approval, signed commits, and review completion.",
    serverAndPortPolicy: {
      invariant: "Keep the same server and port.",
      turkishInvariant: "Ayni sunucu ve baglanti noktasi korunur.",
      mutationAllowed: false,
      migrationRequiresApproval: true
    },
    githubPolicySnapshot: expectedRuleset,
    mergeState: {
      observedPr: "#56",
      observedState: "mergeStateStatus: BLOCKED",
      mergeable: "MERGEABLE",
      autoMerge: "enabled",
      technicalChecks: "green",
      remainingHumanOrPolicyWork: [
        "satisfy requiredApprovingReviewCount: 10",
        "obtain required code owner review",
        "obtain last-push approval",
        "resolve any required review threads",
        "use verified signed commits or approved repository bypass"
      ]
    },
    commands: {
      check: "npm run check:seis-ssh-public-merge-readiness",
      report: "npm run report:seis-ssh-public-merge-readiness",
      safePrereqs: [
        "npm run check:seis-ssh-public-access",
        "npm run check:seis-ssh-public-artifact-hygiene",
        "npm run check:seis-ssh-public-readiness-matrix",
        "npm run check:seis-ssh-public-github-policy",
        "npm run check:seis-ssh-public-signing-guide",
        "gh pr checks 56"
      ],
      approvalGated: [
        "gh pr merge 56 --merge --admin",
        "changing repository rulesets",
        "signing or re-signing historical commits",
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
          "Keep auto-merge enabled and wait for required GitHub approvals/signature policy satisfaction.",
          "Do not claim the PR is merged while mergeStateStatus remains BLOCKED.",
          "Do not change SEIS-SSH server or port to work around GitHub governance."
        ]
      : ["Fix merge readiness wiring, then rerun npm run check:seis-ssh-public-merge-readiness."],
    safety: [
      "This report does not open a live SSH session.",
      "This report does not call gh auth status or mutate GitHub state.",
      "This report does not merge, admin-bypass, force-push, or change repository rules.",
      "This report does not print private keys, tokens, cookies, full hostnames, full IPv4/IPv6 addresses, or provider credentials.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function renderMarkdown(report) {
  return `# SEIS SSH Public Merge Readiness

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

## Current Merge State

- PR: ${report.mergeState.observedPr}
- State: ${report.mergeState.observedState}
- Mergeable: ${report.mergeState.mergeable}
- Auto-merge: ${report.mergeState.autoMerge}
- Technical checks: ${report.mergeState.technicalChecks}

## Remaining Human Or Policy Work

${renderList(report.mergeState.remainingHumanOrPolicyWork, "none")}

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
  console.log(`Usage: node scripts/create-seis-ssh-public-merge-readiness.mjs [--check] [--write] [--output file] [--markdown file]

Creates a read-only SEIS-SSH public PR merge readiness report. It does not open
SSH, call gh auth status, merge, bypass rules, change repository settings, or
change server/port.`);
}
