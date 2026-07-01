#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const jsonOut = args["json-out"] || "reports/seis-ssh-mobile-24x7-readiness.json";
const mdOut = args["md-out"] || "reports/seis-ssh-mobile-24x7-readiness.md";
const requireReady = Boolean(args["require-ready"]);

let readiness;
if (args["readiness-json"]) {
  readiness = readReadinessJson(args["readiness-json"]);
} else {
  const checkArgs = ["scripts/check-seis-ssh-mobile-24x7.mjs"];
  for (const key of ["host", "identity-file", "connect-timeout"]) {
    if (args[key]) checkArgs.push(`--${key}`, args[key]);
  }

  const check = spawnSync(process.execPath, checkArgs, {
    encoding: "utf8",
    timeout: 120000
  });

  if (check.error) {
    console.error(`Failed to run mobile readiness check: ${check.error.message}`);
    process.exit(1);
  }

  try {
    readiness = JSON.parse(check.stdout || "{}");
  } catch (error) {
    console.error("Mobile readiness check did not return JSON.");
    if (check.stdout) console.error(check.stdout);
    if (check.stderr) console.error(check.stderr);
    process.exit(1);
  }
}

const report = buildReport(sanitize(readiness), { strictDoctorRequested: requireReady });
writeJson(jsonOut, report);
writeText(mdOut, renderMarkdown(report));

console.log(`Wrote ${jsonOut}`);
console.log(`Wrote ${mdOut}`);
console.log(`SEIS SSH mobile 24/7 status: ${report.status}`);
if (!report.ok) {
  console.log(`Blockers: ${report.blockers.join(", ") || "none"}`);
}
if (requireReady && !report.ok) process.exit(1);

function buildReport(readiness, options = {}) {
  const transport = readiness.checks?.sshConfig?.transport || "unknown";
  const mobileReady = readiness.ok === true;
  const strictDoctorRequested = options.strictDoctorRequested === true;
  const claimGate = buildClaimGate(readiness, {
    mobileReady,
    strictDoctorRequested,
    transport
  });
  const handoff = buildHandoff();
  const handoffReplay = buildHandoffReplay(claimGate, handoff);
  const evidenceManifest = buildEvidenceManifest(readiness, claimGate);
  const generatedAt = new Date().toISOString();
  return {
    id: "seis-ssh-mobile-24x7-readiness",
    generatedAt,
    ok: mobileReady,
    status: readiness.status || (mobileReady ? "mobile-24x7-ready" : "blocked"),
    target: readiness.target || "chatgpt-mobile-24x7-ssh",
    host: readiness.host || "SEIS-SSH",
    transport,
    mobile24x7Compatible: readiness.checks?.sshConfig?.mobile24x7Compatible === true,
    pickerCompatible: readiness.checks?.sshConfig?.pickerCompatible === true,
    claimGate,
    handoffReplay,
    evidenceManifest,
    blockers: readiness.blockers || [],
    warnings: readiness.warnings || [],
    checks: readiness.checks || {},
    nextActions: readiness.nextActions || [],
    handoff,
    safety: readiness.safety || []
  };
}

function buildClaimGate(readiness, { mobileReady, strictDoctorRequested, transport }) {
  const strictDoctorPassed = mobileReady && strictDoctorRequested;
  const blockers = buildClaimBlockers(readiness, { mobileReady, strictDoctorRequested });
  return {
    id: "seis-ssh-mobile-24x7-claim-gate",
    readyClaim: "SEIS-SSH is ChatGPT mobile/Codex 24x7 ready",
    continuityClaim: "SEIS remains reachable when the local Mac is closed",
    status: strictDoctorPassed ? "mobile-24x7-ready" : "blocked",
    allowedOnlyAfterCommand: "npm run cloud:ssh:mobile-direct:doctor:strict",
    allowedOnlyAfterClaimScope: "mobile-24x7-ready",
    strictDoctorRequired: true,
    strictDoctorRequested,
    strictDoctorPassed,
    readyClaimAllowed: strictDoctorPassed,
    continuityClaimAllowed: strictDoctorPassed,
    macOffClaimAllowed: strictDoctorPassed,
    localMacDependencyAllowed: false,
    codespacesContinuityAllowed: false,
    browserLocalProofAllowed: false,
    directCloudTransport: transport === "direct-cloud",
    blockedBy: strictDoctorPassed ? [] : blockers,
    generatedBy: "scripts/create-seis-ssh-mobile-24x7-report.mjs",
    remoteMutationAllowed: false,
    credentialRead: false,
    secretStored: false
  };
}

function buildClaimBlockers(readiness, { mobileReady, strictDoctorRequested }) {
  const blockers = Array.isArray(readiness.blockers) ? readiness.blockers : [];
  if (blockers.length > 0) return blockers;
  if (!strictDoctorRequested) return ["strict-doctor-required"];
  if (!mobileReady) return ["mobile-24x7-readiness-not-proven"];
  return ["strict-doctor-required"];
}

function buildHandoff() {
  return {
    strictCommand: "npm run cloud:ssh:mobile-24x7:strict",
    reportCommand: "npm run cloud:ssh:mobile-24x7:report",
    directCloudProfileCommand: "npm run cloud:ssh:mobile-direct:profile",
    directCloudBootstrapPlanCommand: "npm run cloud:ssh:mobile-direct:bootstrap:plan",
    directCloudBootstrapApplyCommand: "npm run cloud:ssh:mobile-direct:bootstrap:apply",
    directCloudConfigPlanCommand: "npm run cloud:ssh:mobile-direct:config:plan",
    directCloudConfigInstallCommand: "npm run cloud:ssh:mobile-direct:config:install",
    directCloudProbeCommand: "npm run cloud:ssh:mobile-direct:probe",
    directCloudDoctorCommand: "npm run cloud:ssh:mobile-direct:doctor",
    directCloudDoctorStrictCommand: "npm run cloud:ssh:mobile-direct:doctor:strict",
    directCloudSwitchCommand: "npm run cloud:ssh:direct-cloud:switch -- --public-ip <PUBLIC_IP> --direct-user root --apply",
    mobileReadyDefinition: "SEIS-SSH must use direct-cloud transport, prove TCP reachability, pass SSH key auth, and confirm the remote SSH-AI runtime."
  };
}

function buildHandoffReplay(claimGate, handoff) {
  const replayableOnNewDevice = claimGate.strictDoctorPassed === true;
  return {
    id: "seis-ssh-mobile-24x7-handoff-replay",
    singleVisibleAlias: "SEIS-SSH",
    replayableOnNewDevice,
    requiresStrictDoctor: true,
    requiresDirectCloudTransport: true,
    requiresSecretFreeReport: true,
    requiresLocalKeyMaterialOutsideGit: true,
    browserLocalProofAllowed: false,
    codespacesReplayAllowedFor24x7: false,
    localMacReplayDependencyAllowed: false,
    blockedBy: replayableOnNewDevice ? [] : claimGate.blockedBy,
    commands: {
      profile: handoff.directCloudProfileCommand,
      bootstrapPlan: handoff.directCloudBootstrapPlanCommand,
      configPlan: handoff.directCloudConfigPlanCommand,
      configInstall: handoff.directCloudConfigInstallCommand,
      probeStrict: "npm run cloud:ssh:mobile-direct:probe:strict",
      doctorStrict: handoff.directCloudDoctorStrictCommand
    },
    generatedBy: "scripts/create-seis-ssh-mobile-24x7-report.mjs",
    remoteMutationAllowed: false,
    credentialRead: false,
    secretStored: false
  };
}

function buildEvidenceManifest(readiness, claimGate) {
  const checks = readiness.checks || {};
  const ssh = checks.sshConfig || {};
  const tcp = checks.tcp || {};
  const auth = checks.sshAuth || {};
  const runtime = checks.remoteRuntime || {};
  const directCloud = ssh.transport === "direct-cloud";
  const readinessPassed = readiness.ok === true;
  return {
    id: "seis-ssh-mobile-24x7-evidence-manifest",
    sourceLedger: "content/development/seis-ssh-mobile-direct-cloud-acceptance-ledger.json",
    secretFree: true,
    credentialValuesIncluded: false,
    entries: [
      {
        id: "profile-contract",
        command: "npm run cloud:ssh:mobile-direct:profile",
        artifact: "reports/seis-ssh-mobile-direct-cloud-profile.json",
        status: directCloud ? "observed-direct-cloud" : "blocked",
        claimScope: "configuration-only"
      },
      {
        id: "bootstrap-dry-run",
        command: "npm run cloud:ssh:mobile-direct:bootstrap:plan",
        artifact: "stdout-json",
        status: "operator-review-required",
        claimScope: "bootstrap-plan-only"
      },
      {
        id: "bootstrap-apply",
        command: "npm run cloud:ssh:mobile-direct:bootstrap:apply",
        artifact: "remote-systemd-state",
        status: runtime.online === true ? "runtime-observed" : "not-verified-by-report",
        claimScope: "remote-bootstrap"
      },
      {
        id: "ssh-config-install",
        command: "npm run cloud:ssh:mobile-direct:config:install",
        artifact: "~/.ssh/config",
        status: directCloud && ssh.pickerCompatible === true ? "observed-managed-alias" : "blocked",
        claimScope: "local-client-config"
      },
      {
        id: "readiness-probe",
        command: "npm run cloud:ssh:mobile-direct:probe:strict",
        artifact: "stdout-json",
        status: readinessPassed && tcp.reachable === true && auth.authenticated === true ? "passed" : "blocked",
        claimScope: "runtime-readiness"
      },
      {
        id: "handoff-doctor",
        command: "npm run cloud:ssh:mobile-direct:doctor:strict",
        artifact: "reports/seis-ssh-mobile-24x7-readiness.json",
        status: claimGate.strictDoctorPassed === true ? "passed" : "strict-doctor-required",
        claimScope: "mobile-24x7-ready"
      },
      {
        id: "contract-guard",
        command: "npm run check:seis-ssh-mobile-direct-cloud",
        artifact: "ci-log",
        status: "separate-check-required",
        claimScope: "governance-contract"
      }
    ]
  };
}

function sanitize(value) {
  const home = homedir();
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, sanitize(nested)]));
  }
  if (typeof value !== "string") return value;
  return value
    .replaceAll(home, "~")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "<redacted-api-key>")
    .replace(/-----BEGIN (OPENSSH|RSA|EC|DSA) PRIVATE KEY-----[\s\S]*?-----END \1 PRIVATE KEY-----/g, "<redacted-private-key>");
}

function readReadinessJson(file) {
  try {
    return JSON.parse(readFileSync(resolve(file), "utf8"));
  } catch (error) {
    console.error(`Failed to read readiness JSON: ${error.message}`);
    process.exit(1);
  }
}

function writeJson(file, data) {
  const absolute = resolve(file);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeText(file, text) {
  const absolute = resolve(file);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, text, "utf8");
}

function renderMarkdown(report) {
  const checks = report.checks || {};
  const ssh = checks.sshConfig || {};
  const tcp = checks.tcp || {};
  const auth = checks.sshAuth || {};
  const runtime = checks.remoteRuntime || {};
  return `# SEIS SSH Mobile 24/7 Readiness Report

Generated: ${report.generatedAt}

## Status

| Field | Value |
| --- | --- |
| Host alias | ${report.host} |
| Target | ${report.target} |
| Status | ${report.status} |
| Mobile ready | ${report.ok ? "yes" : "no"} |
| Transport | ${report.transport} |
| Picker compatible | ${report.pickerCompatible ? "yes" : "no"} |
| Mobile 24/7 compatible | ${report.mobile24x7Compatible ? "yes" : "no"} |

## Checks

| Check | Result |
| --- | --- |
| SSH config checked | ${ssh.checked === true ? "yes" : "no"} |
| Hostname | ${ssh.hostname || "unknown"} |
| User | ${ssh.user || "unknown"} |
| Port | ${ssh.port || "22"} |
| TCP reachable | ${tcp.checked ? (tcp.reachable ? "yes" : `no (${tcp.error || "unknown"})`) : "not checked"} |
| SSH auth | ${auth.checked ? (auth.authenticated ? "yes" : `no (${auth.error || "unknown"})`) : "not checked"} |
| Remote runtime | ${runtime.checked ? (runtime.online ? "online" : `offline (${runtime.error || "unknown"})`) : "not checked"} |
| SSH-AI installed | ${runtime.checked ? (runtime.sshAiInstalled ? "yes" : "no") : "not checked"} |
| SSH-AI daemon active | ${runtime.checked ? (runtime.sshAiDaemonActive ? "yes" : "no") : "not checked"} |
| Codex available | ${runtime.checked ? (runtime.codexAvailable ? "yes" : "no") : "not checked"} |

## Claim Gate

| Claim | Value |
| --- | --- |
| Ready claim allowed | ${report.claimGate.readyClaimAllowed ? "yes" : "no"} |
| Mac-off continuity allowed | ${report.claimGate.macOffClaimAllowed ? "yes" : "no"} |
| Strict doctor required | ${report.claimGate.strictDoctorRequired ? "yes" : "no"} |
| Strict doctor requested | ${report.claimGate.strictDoctorRequested ? "yes" : "no"} |
| Strict doctor passed | ${report.claimGate.strictDoctorPassed ? "yes" : "no"} |
| Browser-local proof allowed | ${report.claimGate.browserLocalProofAllowed ? "yes" : "no"} |
| Codespaces continuity allowed | ${report.claimGate.codespacesContinuityAllowed ? "yes" : "no"} |

Blocked by:

${renderList(report.claimGate.blockedBy, "No claim blockers.")}

## Handoff Replay Gate

| Gate | Value |
| --- | --- |
| Replayable on new device | ${report.handoffReplay.replayableOnNewDevice ? "yes" : "no"} |
| Requires strict doctor | ${report.handoffReplay.requiresStrictDoctor ? "yes" : "no"} |
| Requires direct-cloud transport | ${report.handoffReplay.requiresDirectCloudTransport ? "yes" : "no"} |
| Browser-local proof allowed | ${report.handoffReplay.browserLocalProofAllowed ? "yes" : "no"} |
| Codespaces replay allowed for 24/7 | ${report.handoffReplay.codespacesReplayAllowedFor24x7 ? "yes" : "no"} |
| Local Mac replay dependency allowed | ${report.handoffReplay.localMacReplayDependencyAllowed ? "yes" : "no"} |

Blocked by:

${renderList(report.handoffReplay.blockedBy, "No handoff replay blockers.")}

## Evidence Manifest

${renderEvidenceManifest(report.evidenceManifest)}

## Blockers

${renderList(report.blockers, "No blockers.")}

## Warnings

${renderList(report.warnings, "No warnings.")}

## Next Actions

${renderList(report.nextActions, "No next actions.")}

## Handoff Commands

\`\`\`bash
${report.handoff.directCloudSwitchCommand}
${report.handoff.directCloudProfileCommand}
${report.handoff.directCloudBootstrapPlanCommand}
${report.handoff.directCloudBootstrapApplyCommand}
${report.handoff.directCloudConfigPlanCommand}
${report.handoff.directCloudConfigInstallCommand}
${report.handoff.directCloudProbeCommand}
${report.handoff.directCloudDoctorCommand}
${report.handoff.directCloudDoctorStrictCommand}
${report.handoff.strictCommand}
${report.handoff.reportCommand}
\`\`\`

## Safety

${renderList(report.safety, "No safety notes.")}
`;
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function renderEvidenceManifest(manifest) {
  const entries = Array.isArray(manifest?.entries) ? manifest.entries : [];
  if (entries.length === 0) return "- No evidence manifest entries.";
  const rows = entries.map((entry) => `| ${entry.id} | ${entry.status} | ${entry.command} | ${entry.artifact} |`);
  return [
    "| Evidence | Status | Command | Artifact |",
    "| --- | --- | --- | --- |",
    ...rows
  ].join("\n");
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "require-ready") {
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
  npm run cloud:ssh:mobile-24x7:report
  node scripts/create-seis-ssh-mobile-24x7-report.mjs --json-out <path> --md-out <path>

Options:
  --host HOST             SSH alias. Default: SEIS-SSH.
  --identity-file PATH    Override direct-cloud identity file.
  --connect-timeout SEC   SSH/TCP timeout. Default: 12.
  --require-ready         Exit non-zero after writing reports unless mobile 24/7 readiness passes.
  --readiness-json PATH   Use a precomputed readiness JSON fixture instead of probing SSH.
  --json-out PATH         JSON report path. Default: reports/seis-ssh-mobile-24x7-readiness.json.
  --md-out PATH           Markdown report path. Default: reports/seis-ssh-mobile-24x7-readiness.md.
`);
}
