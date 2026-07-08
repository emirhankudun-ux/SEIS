#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/review-bundle-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/review-bundle-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const bundle = buildBundle();

if (write) {
  writeFile(outputJson, `${JSON.stringify(bundle, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(bundle));
}

if (!write) {
  console.log(JSON.stringify(bundle, null, 2));
}

if (check && !bundle.ok) {
  process.exit(1);
}

function buildBundle() {
  const blockers = [];
  const warnings = [];
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", blockers);
  const packageJson = readJson("package.json", blockers);
  const workflow = readText(".github/workflows/seis-ssh-public-access.yml", blockers);
  const prTemplate = readText(".github/PULL_REQUEST_TEMPLATE.md", blockers);
  const runbook = readText("docs/deployment/seis-ssh-public-github-access.md", blockers);
  const readme = readText("README.md", blockers);
  const status = readText("docs/STATUS.md", blockers);
  const desktop = readText("apps/web/desktop.js", blockers);
  const accessModel = readJson("deploy/seis-ssh-access-model.json", blockers);
  const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json", blockers);
  const scripts = packageJson?.scripts || {};
  const reports = collectReports();
  const accessReport = reports.find((report) => report.id === "access-report")?.result || {};
  const supportPacket = reports.find((report) => report.id === "support-packet")?.result || {};
  const snapshot = supportPacket.serverAndPortPolicy?.currentSnapshot
    || accessReport.localSshConfig
    || {};

  validateBundleWiring({
    blockers,
    contract,
    scripts,
    workflow,
    prTemplate,
    runbook,
    readme,
    status,
    desktop,
    accessModel,
    roadmap
  });

  for (const report of reports) {
    if (report.ok !== true) blockers.push(`${report.id} report is not ready`);
    warnings.push(...prefixItems(report.id, report.warnings));
    blockers.push(...prefixItems(report.id, report.blockers));
  }

  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-public-review-bundle",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok ? "review-bundle-ready" : "blocked",
    mode: "read-only-no-live-ssh-no-config-write-no-github-auth-no-secret-output",
    alias: "SEIS-SSH",
    purpose: "Give GitHub reviewers and public contributors one safe SEIS-SSH evidence bundle across onboarding, support, merge policy, signing, and artifact hygiene.",
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
    reviewSummary: {
      publicStaticReview: ok ? "ready" : "blocked",
      mergePolicy: "PR #56 can have green static checks while mergeStateStatus stays BLOCKED until required approvals, signatures, code-owner review, last-push approval, and review-thread resolution are satisfied.",
      signingPolicy: "Use the public signing guide before pushing SEIS-SSH updates when required signatures are active.",
      liveSsh: "approval-gated; this bundle does not open SSH or prove live readiness",
      supportPath: ".github/ISSUE_TEMPLATE/seis_ssh_access.yml",
      recommendedPublicCommand: "npm run run:seis-ssh-public-review-bundle"
    },
    includedReports: reports.map((report) => ({
      id: report.id,
      command: report.command,
      status: report.status,
      ok: report.ok === true,
      artifact: report.artifact,
      warningCount: report.warnings.length,
      blockerCount: report.blockers.length
    })),
    contributorChecklist: [
      "Start review with npm run run:seis-ssh-public-review-bundle.",
      "Use the support packet instead of raw ssh -G output when opening a GitHub issue.",
      "Use the signing guide before pushing SEIS-SSH PR updates when required signatures are active.",
      "Keep SEIS-SSH as the only visible alias and preserve the same server and port.",
      "Request explicit maintainer approval before live SSH, endpoint migration, ruleset bypass, merge, release, or public live-ready claims."
    ],
    commands: {
      check: "npm run check:seis-ssh-public-review-bundle",
      report: "npm run report:seis-ssh-public-review-bundle",
      oneCommand: "npm run run:seis-ssh-public-review-bundle",
      safePrereqs: [
        "npm run check:seis-ssh-public-access",
        "npm run check:seis-ssh-public-pr-template",
        "npm run check:seis-ssh-public-ci-workflow",
        "npm run check:seis-ssh-public-artifact-hygiene",
        "npm run check:seis-ssh-ai-mcp-handoff",
        "npm run check:seis-ssh-public-client-compatibility"
      ],
      approvalGated: [
        "ssh SEIS-SSH",
        "npm run cloud:ssh:online:strict",
        "changing HostName or Port",
        "changing repository rulesets",
        "merging PR #56",
        "publishing live-ready or mobile-ready claims"
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
          "Attach review-bundle-latest.md to PR review when a single public SEIS-SSH evidence packet is needed.",
          "Keep artifact hygiene green before attaching generated reports to GitHub.",
          "Do not change the SEIS-SSH server or port to work around policy, picker, billing, or signing blockers."
        ]
      : ["Fix review bundle blockers, then rerun npm run check:seis-ssh-public-review-bundle."],
    safety: [
      "This bundle does not call gh auth status or contact GitHub.",
      "This bundle does not open a live SSH session.",
      "This bundle does not write SSH config, git config, repository settings, or workflow settings.",
      "This bundle does not print private keys, signing keys, tokens, cookies, full hostnames, full IPv4/IPv6 addresses, or provider credentials.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function collectReports() {
  const reportSpecs = [
    {
      id: "access-report",
      command: "npm run check:seis-ssh-public-access-report",
      script: "scripts/create-seis-ssh-public-access-report.mjs",
      artifact: "reports/seis-ssh-public-access/latest.md"
    },
    {
      id: "first-run",
      command: "npm run check:seis-ssh-public-first-run",
      script: "scripts/create-seis-ssh-public-first-run.mjs",
      artifact: "reports/seis-ssh-public-access/first-run-latest.md"
    },
    {
      id: "troubleshooting",
      command: "npm run check:seis-ssh-public-troubleshooting",
      script: "scripts/create-seis-ssh-public-troubleshooting-guide.mjs",
      artifact: "reports/seis-ssh-public-access/troubleshooting-latest.md"
    },
    {
      id: "support-packet",
      command: "npm run check:seis-ssh-public-support-packet",
      script: "scripts/create-seis-ssh-public-support-packet.mjs",
      artifact: "reports/seis-ssh-public-access/support-packet-latest.md"
    },
    {
      id: "github-quickstart",
      command: "npm run check:seis-ssh-public-github-quickstart",
      script: "scripts/create-seis-ssh-public-github-quickstart.mjs",
      artifact: "reports/seis-ssh-public-access/github-quickstart-latest.md"
    },
    {
      id: "merge-readiness",
      command: "npm run check:seis-ssh-public-merge-readiness",
      script: "scripts/create-seis-ssh-public-merge-readiness.mjs",
      artifact: "reports/seis-ssh-public-access/merge-readiness-latest.md"
    },
    {
      id: "github-policy",
      command: "npm run check:seis-ssh-public-github-policy",
      script: "scripts/create-seis-ssh-public-github-policy-doctor.mjs",
      artifact: "reports/seis-ssh-public-access/github-policy-latest.md"
    },
    {
      id: "signing-guide",
      command: "npm run check:seis-ssh-public-signing-guide",
      script: "scripts/create-seis-ssh-public-signing-guide.mjs",
      artifact: "reports/seis-ssh-public-access/signing-guide-latest.md"
    },
    {
      id: "onboarding-pack",
      command: "npm run check:seis-ssh-public-onboarding",
      script: "scripts/create-seis-ssh-public-onboarding-pack.mjs",
      artifact: "reports/seis-ssh-public-access/onboarding-pack-latest.md"
    },
    {
      id: "contributor-doctor",
      command: "npm run check:seis-ssh-public-contributor-doctor",
      script: "scripts/check-seis-ssh-public-contributor-doctor.mjs",
      artifact: "reports/seis-ssh-public-access/contributor-doctor-latest.md"
    }
  ];

  return reportSpecs.map((spec) => {
    const result = runJsonScript(spec.script);
    return {
      ...spec,
      ok: result.ok === true,
      status: result.status || statusLabel(result),
      result,
      warnings: Array.isArray(result.warnings) ? result.warnings : [],
      blockers: Array.isArray(result.blockers) ? result.blockers : []
    };
  });
}

function validateBundleWiring({ blockers, contract, scripts, workflow, prTemplate, runbook, readme, status, desktop, accessModel, roadmap }) {
  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must remain SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("contract must preserve the same server and port");
  if (contract?.githubExperience?.reviewBundle !== "npm run report:seis-ssh-public-review-bundle") blockers.push("contract must link public review bundle report command");
  if (scripts["check:seis-ssh-public-review-bundle"] !== "node scripts/create-seis-ssh-public-review-bundle.mjs --check") blockers.push("package check script must be declared");
  if (scripts["report:seis-ssh-public-review-bundle"] !== "node scripts/create-seis-ssh-public-review-bundle.mjs --write") blockers.push("package report script must be declared");
  if (scripts["run:seis-ssh-public-review-bundle"] !== "npm run check:seis-ssh-public-review-bundle && npm run report:seis-ssh-public-review-bundle") blockers.push("package run script must be declared");
  if (!workflow.includes("npm run check:seis-ssh-public-review-bundle")) blockers.push("CI workflow must run the public review bundle check");
  if (!prTemplate.includes("Public review bundle was generated or checked before requesting SEIS-SSH review.")) blockers.push("PR template must ask for review bundle evidence");
  if (!prTemplate.includes("npm run check:seis-ssh-public-review-bundle")) blockers.push("PR template must include review bundle check command");

  for (const command of [
    "npm run check:seis-ssh-public-review-bundle",
    "npm run report:seis-ssh-public-review-bundle"
  ]) {
    if (!(contract?.requiredCommands || []).includes(command)) blockers.push(`contract must require ${command}`);
  }

  for (const surface of [
    "scripts/create-seis-ssh-public-review-bundle.mjs",
    "reports/seis-ssh-public-access/review-bundle-latest.md"
  ]) {
    if (!(contract?.evidenceSurfaces || []).includes(surface)) blockers.push(`contract evidence surfaces must include ${surface}`);
  }

  if (!((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-review-bundle"))) blockers.push("access model quality commands must include review bundle check");
  if (!((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-review-bundle"))) blockers.push("roadmap validation commands must include review bundle check");

  const docs = `${runbook}\n${readme}\n${status}`;
  for (const token of [
    "npm run check:seis-ssh-public-review-bundle",
    "npm run report:seis-ssh-public-review-bundle",
    "public review bundle",
    "reports/seis-ssh-public-access/review-bundle-latest.md",
    "same server and port",
    "SEIS-SSH"
  ]) {
    if (!docs.includes(token)) blockers.push(`docs must include ${token}`);
  }

  for (const token of [
    "reviewBundleCommand",
    "reviewBundleArtifact",
    "Review Bundle",
    "seis-ssh-public-review-bundle.md"
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

function renderMarkdown(bundle) {
  return `# SEIS SSH Public Review Bundle

Generated: ${bundle.generatedAt}

Status: ${bundle.status}
Mode: ${bundle.mode}
Alias: ${bundle.alias}

## Purpose

${bundle.purpose}

## Same Server And Port

- ${bundle.serverAndPortPolicy.invariant}
- ${bundle.serverAndPortPolicy.turkishInvariant}
- Mutation allowed: no
- Migration requires approval: yes
- Current transport: ${bundle.serverAndPortPolicy.currentSnapshot.transport}
- Current port: ${bundle.serverAndPortPolicy.currentSnapshot.port}
- Live connection attempted: ${bundle.serverAndPortPolicy.currentSnapshot.liveConnectionAttempted}

## Review Summary

- Public static review: ${bundle.reviewSummary.publicStaticReview}
- Merge policy: ${bundle.reviewSummary.mergePolicy}
- Signing policy: ${bundle.reviewSummary.signingPolicy}
- Live SSH: ${bundle.reviewSummary.liveSsh}
- Support path: ${bundle.reviewSummary.supportPath}
- Recommended public command: \`${bundle.reviewSummary.recommendedPublicCommand}\`

## Included Reports

| Report | Status | OK | Warnings | Blockers | Artifact |
| --- | --- | --- | --- | --- | --- |
${bundle.includedReports.map((report) => `| ${report.id} | ${report.status} | ${report.ok ? "yes" : "no"} | ${report.warningCount} | ${report.blockerCount} | ${report.artifact} |`).join("\n")}

## Contributor Checklist

${renderList(bundle.contributorChecklist, "none")}

## Commands

- Check: \`${bundle.commands.check}\`
- Report: \`${bundle.commands.report}\`
- One command: \`${bundle.commands.oneCommand}\`

## Safe Prereqs

${renderList(bundle.commands.safePrereqs, "none")}

## Approval-Gated Actions

${renderList(bundle.commands.approvalGated, "none")}

## Blockers

${renderList(bundle.blockers, "none")}

## Warnings

${renderList(bundle.warnings, "none")}

## Next Actions

${renderList(bundle.nextActions, "none")}

## Safety

${renderList(bundle.safety, "none")}
`;
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function statusLabel(result) {
  if (result?.ok === true) return "passed";
  if (result?.ok === false) return "failed";
  return "unknown";
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
  console.log(`Usage: node scripts/create-seis-ssh-public-review-bundle.mjs [--check] [--write] [--output PATH] [--markdown PATH]

Builds one read-only public SEIS-SSH review bundle from the existing access,
first-run, troubleshooting, support, quickstart, merge policy, signing,
onboarding, and contributor-doctor reports. It does not open SSH, contact
GitHub, write SSH/git config, change server/port, or expose secrets.`);
}
