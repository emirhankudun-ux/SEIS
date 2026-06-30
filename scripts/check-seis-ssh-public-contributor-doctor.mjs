#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const requireLocalUse = Boolean(args["require-local-use"]);
const outputJson = args.output || "reports/seis-ssh-public-access/contributor-doctor-latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/contributor-doctor-latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const doctor = buildDoctor();

if (write) {
  writeFile(outputJson, `${JSON.stringify(doctor, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(doctor));
}

if (!write) {
  console.log(JSON.stringify(doctor, null, 2));
}

if ((check || requireLocalUse) && !doctor.ok) {
  process.exit(1);
}

function buildDoctor() {
  const onboarding = runJsonScript("scripts/create-seis-ssh-public-onboarding-pack.mjs", ["--check"]);
  const access = runJsonScript("scripts/create-seis-ssh-public-access-report.mjs", ["--check"]);
  const packageJson = readJson("package.json");
  const contract = readJson("deploy/seis-ssh-public-access-contract.json");
  const gitRemote = run("git", ["remote", "get-url", "origin"]);

  const tools = {
    node: commandProbe(process.execPath, ["--version"]),
    npm: commandProbe("npm", ["--version"]),
    git: commandProbe("git", ["--version"]),
    ssh: commandProbe("ssh", ["-V"]),
    gh: commandProbe("gh", ["--version"])
  };

  const blockers = [];
  const warnings = [];
  if (!onboarding.ok) blockers.push(...prefixItems("onboarding", onboarding.blockers));
  if (!access.ok) blockers.push(...prefixItems("access-report", access.blockers));
  if (contract?.targetAlias !== "SEIS-SSH") blockers.push("contract targetAlias must be SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") blockers.push("server and port policy must preserve the existing target");
  if (access.localSshConfig?.transport === "local-or-lan") blockers.push("SEIS-SSH resolves to local-or-lan transport");

  if (!tools.gh.available) warnings.push("GitHub CLI is not available; new contributors need gh for Codespaces auth.");
  if (!tools.ssh.available) warnings.push("OpenSSH client is not available; SSH use needs ssh.");
  if (!tools.git.available) warnings.push("Git is not available; GitHub review and repo workflows need git.");
  if (access.localSshConfig?.transport === "codespace") warnings.push("Current transport is Codespaces; terminal-compatible but some GUI pickers may show it offline.");
  if (access.localSshConfig?.pickerLikelyCompatible !== true) warnings.push("Picker-compatible direct-cloud mode is not proven.");

  const localUseReady = tools.gh.available
    && tools.ssh.available
    && tools.git.available
    && access.localSshConfig?.configured === true
    && access.localSshConfig?.transport !== "local-or-lan";

  if (requireLocalUse && !localUseReady) blockers.push("local contributor prerequisites are incomplete");

  const ok = blockers.length === 0;
  return {
    id: "seis-ssh-public-contributor-doctor",
    generatedAt: new Date().toISOString(),
    ok,
    status: ok ? "review-ready" : "blocked",
    mode: "read-only-no-live-ssh-no-config-write",
    alias: "SEIS-SSH",
    repo: {
      remoteKind: classifyRemote(gitRemote.stdout),
      remotePresent: gitRemote.status === 0,
      githubRemote: /github\.com[:/]/i.test(gitRemote.stdout || "")
    },
    serverAndPortPolicy: {
      invariant: "Keep the same server and port.",
      turkishInvariant: "Ayni sunucu ve baglanti noktasi korunur.",
      preservationMode: contract?.serverAndPortPolicy?.mode || "unknown",
      currentSnapshot: {
        configured: access.localSshConfig?.configured === true,
        transport: access.localSshConfig?.transport || "unknown",
        hostnameKind: access.localSshConfig?.hostnameKind || "unknown",
        hostnameSha256Prefix: access.localSshConfig?.hostnameSha256Prefix || null,
        port: access.localSshConfig?.port || "22",
        pickerLikelyCompatible: access.localSshConfig?.pickerLikelyCompatible === true,
        liveConnectionAttempted: false
      }
    },
    localTools: tools,
    contributorReadiness: {
      githubReviewReady: ok,
      localPrereqsReady: localUseReady,
      sharedCredentialsRequired: false,
      anonymousShellAccess: false,
      sshConfigWritten: false,
      liveSshAttempted: false,
      liveReadinessProven: false,
      maintainerEndpointPreserved: contract?.serverAndPortPolicy?.mode === "preserve-existing-server-and-port",
      currentBestPath: localUseReady
        ? "Run static checks and use the generated onboarding pack; live SSH still requires approval."
        : "Install local prerequisites, then run the same read-only doctor again."
    },
    commands: {
      review: [
        "npm run check:seis-ssh-public-first-run",
        "npm run check:seis-ssh-public-troubleshooting",
        "npm run check:seis-ssh-public-access",
        "npm run check:seis-ssh-public-access-report",
        "npm run check:seis-ssh-public-onboarding",
        "npm run check:seis-ssh-public-contributor-doctor"
      ],
      generatedReports: [
        "npm run report:seis-ssh-public-first-run",
        "npm run report:seis-ssh-public-troubleshooting",
        "npm run report:seis-ssh-public-access",
        "npm run report:seis-ssh-public-onboarding",
        "npm run report:seis-ssh-public-contributor-doctor"
      ],
      newContributorDryRun: [
        "gh auth refresh -h github.com -s codespace",
        "npm run run:seis-ssh-public-first-run",
        "npm run run:seis-ssh-public-troubleshooting",
        "npm run cloud:ssh-config:install -- --dry-run",
        "npm run check:seis-ssh-picker-compatibility"
      ],
      approvalGatedLive: [
        "npm run cloud:ssh:online:strict",
        "npm run cloud:ssh:mobile-direct:probe:strict",
        "npm run cloud:ssh:mobile-direct:doctor:strict"
      ]
    },
    packageScripts: {
      check: packageJson?.scripts?.["check:seis-ssh-public-contributor-doctor"] || null,
      report: packageJson?.scripts?.["report:seis-ssh-public-contributor-doctor"] || null
    },
    blockers,
    warnings,
    nextActions: nextActions({ blockers, warnings, localUseReady, access }),
    safety: [
      "This doctor does not open a live SSH session.",
      "This doctor does not call gh auth status or contact GitHub.",
      "This doctor does not write ~/.ssh/config.",
      "This doctor does not print private keys, tokens, cookies, or provider credentials.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
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

function runJsonScript(script, argv) {
  const result = run(process.execPath, [script, ...argv]);
  if (result.status !== 0) {
    return {
      ok: false,
      blockers: [`${script} exited with status ${result.status}`],
      warnings: sanitizeLines([result.stderr, result.stdout])
    };
  }
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

function readJson(file) {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

function classifyRemote(remote) {
  const value = String(remote || "").trim();
  if (!value) return "missing";
  if (/github\.com[:/]/i.test(value)) return "github";
  return "other";
}

function prefixItems(prefix, values) {
  if (!Array.isArray(values)) return [];
  return values.map((value) => `${prefix}: ${value}`);
}

function nextActions({ blockers, warnings, localUseReady, access }) {
  const actions = [];
  if (blockers.length > 0) actions.push("Fix blockers, then rerun npm run check:seis-ssh-public-contributor-doctor.");
  if (!localUseReady) actions.push("Install missing local prerequisites, then rerun the read-only doctor.");
  if (access.localSshConfig?.transport === "codespace") actions.push("Keep Codespaces for terminal-compatible usage; use approved direct-cloud only when picker/mobile 24x7 proof is required.");
  if (warnings.length > 0) actions.push("Attach warnings to PR review instead of hiding them behind a ready label.");
  if (actions.length === 0) actions.push("Attach the contributor doctor report to the SEIS-SSH public access PR.");
  return actions;
}

function renderMarkdown(doctor) {
  const snapshot = doctor.serverAndPortPolicy.currentSnapshot;
  return `# SEIS SSH Public Contributor Doctor

Generated: ${doctor.generatedAt}

Status: ${doctor.status}
Mode: ${doctor.mode}
Alias: ${doctor.alias}

## Server And Port

- ${doctor.serverAndPortPolicy.invariant}
- ${doctor.serverAndPortPolicy.turkishInvariant}
- Preservation mode: ${doctor.serverAndPortPolicy.preservationMode}
- Current transport: ${snapshot.transport}
- Hostname kind: ${snapshot.hostnameKind}
- Host fingerprint: ${snapshot.hostnameSha256Prefix || "none"}
- Port: ${snapshot.port}
- Live SSH attempted: no

## Contributor Readiness

| Field | Value |
| --- | --- |
| GitHub review ready | ${doctor.contributorReadiness.githubReviewReady ? "yes" : "no"} |
| Local prerequisites ready | ${doctor.contributorReadiness.localPrereqsReady ? "yes" : "no"} |
| Shared credentials required | no |
| Anonymous shell access | no |
| SSH config written | no |
| Live readiness proven | no |
| Maintainer endpoint preserved | ${doctor.contributorReadiness.maintainerEndpointPreserved ? "yes" : "no"} |

## Local Tools

| Tool | Available | Version |
| --- | --- | --- |
${Object.entries(doctor.localTools).map(([name, item]) => `| ${name} | ${item.available ? "yes" : "no"} | ${item.version || "unknown"} |`).join("\n")}

## Review Commands

\`\`\`bash
${doctor.commands.review.join("\n")}
\`\`\`

## Generated Reports

\`\`\`bash
${doctor.commands.generatedReports.join("\n")}
\`\`\`

## New Contributor Dry Run

\`\`\`bash
${doctor.commands.newContributorDryRun.join("\n")}
\`\`\`

## Approval-Gated Live Commands

\`\`\`bash
${doctor.commands.approvalGatedLive.join("\n")}
\`\`\`

## Blockers

${renderList(doctor.blockers, "none")}

## Warnings

${renderList(doctor.warnings, "none")}

## Next Actions

${renderList(doctor.nextActions, "none")}

## Safety

${renderList(doctor.safety, "none")}
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
    if (["write", "check", "help", "require-local-use"].includes(key)) {
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
  npm run check:seis-ssh-public-contributor-doctor
  npm run report:seis-ssh-public-contributor-doctor

Options:
  --write              Write JSON and Markdown doctor reports.
  --check              Exit non-zero when public contributor review is blocked.
  --require-local-use  Also require local tools needed for contributor use.
  --output PATH        JSON output path. Default: reports/seis-ssh-public-access/contributor-doctor-latest.json.
  --markdown PATH      Markdown output path. Default: reports/seis-ssh-public-access/contributor-doctor-latest.md.
`);
}
