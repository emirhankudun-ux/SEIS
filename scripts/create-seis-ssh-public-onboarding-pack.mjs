#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-public-access/onboarding-pack-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/onboarding-pack-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const report = runPublicAccessReport();
const pack = buildOnboardingPack(report);

if (write) {
  writeFile(outputJson, `${JSON.stringify(pack, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(pack));
}

if (!write) {
  console.log(JSON.stringify(pack, null, 2));
}

if (check && !pack.ok) {
  process.exit(1);
}

function runPublicAccessReport() {
  const result = spawnSync(process.execPath, ["scripts/create-seis-ssh-public-access-report.mjs", "--check"], {
    encoding: "utf8",
    timeout: 15000
  });

  if (result.error) {
    return {
      ok: false,
      status: "blocked",
      blockers: [`public access report failed to start: ${result.error.message}`],
      warnings: [],
      localSshConfig: {
        checked: false,
        configured: false,
        alias: "SEIS-SSH"
      }
    };
  }

  try {
    const parsed = JSON.parse(result.stdout || "{}");
    return {
      ...parsed,
      blockers: parsed.blockers || [],
      warnings: parsed.warnings || []
    };
  } catch (error) {
    return {
      ok: false,
      status: "blocked",
      blockers: [`public access report returned invalid JSON: ${error.message}`],
      warnings: sanitizeLines([result.stderr, result.stdout]).filter(Boolean),
      localSshConfig: {
        checked: true,
        configured: false,
        alias: "SEIS-SSH"
      }
    };
  }
}

function buildOnboardingPack(report) {
  const ssh = report.localSshConfig || {};
  const blockers = [...(report.blockers || [])];
  const warnings = [...(report.warnings || [])];

  if (ssh.transport === "local-or-lan") blockers.push("local-or-lan-transport-is-not-public-github-acceptable");
  if (ssh.alias && ssh.alias !== "SEIS-SSH") blockers.push("onboarding pack must target SEIS-SSH");

  const ok = report.ok === true && blockers.length === 0;
  return {
    id: "seis-ssh-public-onboarding-pack",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok ? "review-ready" : "blocked",
    mode: "read-only-no-live-ssh-no-config-write",
    alias: "SEIS-SSH",
    publicPromise: "One memorable GitHub-facing SSH entrypoint with no shared secrets, no fake online status, and no unapproved server or port change.",
    sourceReport: {
      id: report.id || "seis-ssh-public-access-report",
      status: report.status || "unknown",
      mode: report.mode || "unknown"
    },
    serverAndPortPolicy: {
      invariant: "Keep the same server and port.",
      turkishInvariant: "Ayni sunucu ve baglanti noktasi korunur.",
      preservationMode: report.serverAndPortPolicy?.preservationMode || "preserve-existing-server-and-port",
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
    contributorPaths: [
      {
        id: "github-reviewer",
        label: "GitHub reviewer",
        status: "ready",
        promise: "Can review the public contract, run static gates, and attach the sanitized onboarding pack without credentials.",
        commands: [
          "npm run check:seis-ssh-public-first-run",
          "npm run check:seis-ssh-public-troubleshooting",
          "npm run check:seis-ssh-public-support-packet",
          "npm run check:seis-ssh-public-merge-readiness",
          "npm run check:seis-ssh-public-github-policy",
          "npm run check:seis-ssh-public-signing-guide",
          "npm run check:seis-ssh-public-review-bundle",
          "npm run check:seis-ssh-public-pr-template",
          "npm run check:seis-ssh-public-ci-workflow",
          "npm run check:seis-ssh-public-readiness-matrix",
          "npm run check:seis-ssh-public-access",
          "npm run check:seis-ssh-public-access-report",
          "npm run check:seis-ssh-public-onboarding",
          "npm run check:seis-ssh-public-contributor-doctor",
          "npm run report:seis-ssh-public-onboarding",
          "npm run report:seis-ssh-public-contributor-doctor",
          "ssh -G SEIS-SSH"
        ],
        forbiddenActions: [
          "execute live SSH",
          "change HostName or Port",
          "commit secrets",
          "claim mobile 24x7 readiness"
        ]
      },
      {
        id: "maintainer-existing-target",
        label: "Maintainer using the current target",
        status: "approval-gated",
        promise: "Uses the existing SEIS-SSH endpoint and preserves the current server and port.",
        commands: [
          "npm run report:seis-ssh-public-first-run",
          "npm run report:seis-ssh-public-troubleshooting",
          "npm run report:seis-ssh-public-support-packet",
          "npm run report:seis-ssh-public-github-quickstart",
          "npm run report:seis-ssh-public-merge-readiness",
          "npm run report:seis-ssh-public-github-policy",
          "npm run report:seis-ssh-public-signing-guide",
          "npm run report:seis-ssh-public-review-bundle",
          "npm run check:seis-ssh-public-pr-template",
          "npm run check:seis-ssh-public-ci-workflow",
          "npm run check:seis-ssh-public-readiness-matrix",
          "npm run check:seis-ssh-public-artifact-hygiene",
          "npm run report:seis-ssh-public-access",
          "npm run report:seis-ssh-public-onboarding",
          "npm run check:seis-ssh-picker-compatibility",
          "ssh -G SEIS-SSH"
        ],
        forbiddenActions: [
          "silently rewrite ~/.ssh/config",
          "replace the endpoint to make a picker look online",
          "publish live-ready status before strict online evidence"
        ]
      },
      {
        id: "new-contributor-personal-cloud",
        label: "New contributor with personal GitHub cloud workspace",
        status: "documented-not-shared-credential",
        promise: "Can use the same SEIS-SSH alias pattern for an authorized personal Codespace or approved cloud workspace without accessing maintainer secrets.",
        commands: [
          "gh auth refresh -h github.com -s codespace",
          "npm run run:seis-ssh-public-github-quickstart",
          "npm run run:seis-ssh-public-merge-readiness",
          "npm run run:seis-ssh-public-github-policy",
          "npm run run:seis-ssh-public-signing-guide",
          "npm run run:seis-ssh-public-review-bundle",
          "npm run check:seis-ssh-public-pr-template",
          "npm run check:seis-ssh-public-ci-workflow",
          "npm run check:seis-ssh-public-readiness-matrix",
          "npm run check:seis-ssh-public-artifact-hygiene",
          "npm run run:seis-ssh-public-first-run",
          "npm run run:seis-ssh-public-troubleshooting",
          "npm run run:seis-ssh-public-support-packet",
          "npm run cloud:ssh-config:install -- --dry-run",
          "npm run check:seis-ssh-picker-compatibility",
          "ssh -G SEIS-SSH",
          "npm run report:seis-ssh-public-onboarding",
          "npm run report:seis-ssh-public-contributor-doctor"
        ],
        forbiddenActions: [
          "request shared private keys",
          "reuse maintainer credentials",
          "commit generated SSH config",
          "treat a personal workspace as the maintainer server"
        ]
      }
    ],
    acceptanceGates: {
      publicReview: [
        "npm run check:seis-ssh-public-first-run",
        "npm run report:seis-ssh-public-first-run",
        "npm run check:seis-ssh-public-troubleshooting",
        "npm run report:seis-ssh-public-troubleshooting",
        "npm run check:seis-ssh-public-support-packet",
        "npm run report:seis-ssh-public-support-packet",
        "npm run check:seis-ssh-public-github-quickstart",
        "npm run report:seis-ssh-public-github-quickstart",
        "npm run check:seis-ssh-public-merge-readiness",
        "npm run report:seis-ssh-public-merge-readiness",
        "npm run check:seis-ssh-public-github-policy",
        "npm run report:seis-ssh-public-github-policy",
        "npm run check:seis-ssh-public-signing-guide",
        "npm run report:seis-ssh-public-signing-guide",
        "npm run check:seis-ssh-public-review-bundle",
        "npm run report:seis-ssh-public-review-bundle",
        "npm run check:seis-ssh-public-pr-template",
        "npm run check:seis-ssh-public-ci-workflow",
        "npm run check:seis-ssh-public-readiness-matrix",
        "npm run check:seis-ssh-public-artifact-hygiene",
        "npm run check:seis-ssh-public-access",
        "npm run check:seis-ssh-public-access-report",
        "npm run check:seis-ssh-public-onboarding",
        "npm run check:seis-ssh-public-contributor-doctor",
        "npm run report:seis-ssh-public-onboarding",
        "npm run report:seis-ssh-public-contributor-doctor"
      ],
      liveReadinessRequiresApproval: [
        "npm run cloud:ssh:online:strict",
        "npm run cloud:ssh:mobile-direct:probe:strict",
        "npm run cloud:ssh:mobile-direct:doctor:strict"
      ],
      releaseReview: [
        "npm run check:seis-ssh-access-model",
        "npm run check:seis-ssh-picker-compatibility",
        "npm run check:seis-ssh-enterprise-benchmark",
        "git diff --check"
      ]
    },
    generatedArtifacts: {
      json: outputJson,
      markdown: outputMarkdown,
      accessReportJson: "reports/seis-ssh-public-access/latest.json",
      accessReportMarkdown: "reports/seis-ssh-public-access/latest.md"
    },
    blockers,
    warnings,
    nextActions: nextActions(report, blockers, warnings),
    safety: [
      "This pack does not open a live SSH session.",
      "This pack does not write ~/.ssh/config.",
      "This pack does not print private keys, tokens, cookies, or provider credentials.",
      "Direct hostnames remain redacted; endpoint continuity is represented only by a short SHA-256 prefix.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function nextActions(report, blockers, warnings) {
  const actions = [];
  const ssh = report.localSshConfig || {};
  if (blockers.length > 0) actions.push("Fix blockers in the public access contract or local SEIS-SSH config, then regenerate this onboarding pack.");
  if (ssh.transport === "codespace") actions.push("Keep Codespaces as terminal-compatible; use an approved direct-cloud endpoint only if picker compatibility or mobile 24x7 is required.");
  if (ssh.transport === "direct-cloud") actions.push("After owner approval, run strict live readiness before claiming the endpoint is online.");
  if (warnings.length > 0) actions.push("Review warnings before attaching this pack to a public GitHub PR.");
  if (actions.length === 0) actions.push("Attach the generated Markdown pack to the SEIS-SSH public GitHub access PR.");
  return actions;
}

function renderMarkdown(pack) {
  const snapshot = pack.serverAndPortPolicy.currentSnapshot;
  return `# SEIS SSH Public Onboarding Pack

Generated: ${pack.generatedAt}

Status: ${pack.status}
Mode: ${pack.mode}
Alias: ${pack.alias}

## Public Promise

${pack.publicPromise}

## Same Server And Port

- ${pack.serverAndPortPolicy.invariant}
- ${pack.serverAndPortPolicy.turkishInvariant}
- Preservation mode: ${pack.serverAndPortPolicy.preservationMode}
- Mutation allowed: ${pack.serverAndPortPolicy.mutationAllowed ? "yes" : "no"}
- Migration requires approval: ${pack.serverAndPortPolicy.migrationRequiresApproval ? "yes" : "no"}

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

## Contributor Paths

${pack.contributorPaths.map(renderContributorPath).join("\n\n")}

## Public Review Commands

\`\`\`bash
${pack.acceptanceGates.publicReview.join("\n")}
\`\`\`

## Live Readiness Commands

Run these only after explicit owner approval:

\`\`\`bash
${pack.acceptanceGates.liveReadinessRequiresApproval.join("\n")}
\`\`\`

## Release Review Commands

\`\`\`bash
${pack.acceptanceGates.releaseReview.join("\n")}
\`\`\`

## Blockers

${renderList(pack.blockers, "none")}

## Warnings

${renderList(pack.warnings, "none")}

## Next Actions

${renderList(pack.nextActions, "none")}

## Safety

${renderList(pack.safety, "none")}
`;
}

function renderContributorPath(path) {
  return `### ${path.label}

- Status: ${path.status}
- Promise: ${path.promise}
- Commands:
${path.commands.map((command) => `  - \`${command}\``).join("\n")}
- Forbidden:
${path.forbiddenActions.map((action) => `  - ${action}`).join("\n")}`;
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function writeFile(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function sanitizeLines(values) {
  return values
    .filter(Boolean)
    .map((value) => String(value)
      .replace(/-----BEGIN [^-]+PRIVATE KEY-----[\s\S]*?-----END [^-]+PRIVATE KEY-----/g, "[redacted-private-key]")
      .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[redacted-api-key]")
      .replace(/github_pat_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
      .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
      .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[redacted-ip]")
      .replace(/\b(?:[a-f0-9]{1,4}:){4,7}[a-f0-9]{1,4}\b/gi, "[redacted-ipv6]")
      .replace(/\b(?:f[cd][a-f0-9]{0,2}|fe80):[a-f0-9:]{2,}\b/gi, "[redacted-ipv6]")
      .slice(0, 400));
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
  console.log(`Usage:
  npm run check:seis-ssh-public-onboarding
  npm run report:seis-ssh-public-onboarding
  node scripts/create-seis-ssh-public-onboarding-pack.mjs --write

Options:
  --write            Write JSON and Markdown onboarding pack.
  --check            Exit non-zero if public onboarding is blocked.
  --output PATH      JSON output path. Default: reports/seis-ssh-public-access/onboarding-pack-latest.json.
  --markdown PATH    Markdown output path. Default: reports/seis-ssh-public-access/onboarding-pack-latest.md.
`);
}
