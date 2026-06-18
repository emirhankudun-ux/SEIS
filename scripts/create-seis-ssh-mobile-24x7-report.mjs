#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const jsonOut = args["json-out"] || "reports/seis-ssh-mobile-24x7-readiness.json";
const mdOut = args["md-out"] || "reports/seis-ssh-mobile-24x7-readiness.md";
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

let readiness;
try {
  readiness = JSON.parse(check.stdout || "{}");
} catch (error) {
  console.error("Mobile readiness check did not return JSON.");
  if (check.stdout) console.error(check.stdout);
  if (check.stderr) console.error(check.stderr);
  process.exit(1);
}

const report = buildReport(sanitize(readiness));
writeJson(jsonOut, report);
writeText(mdOut, renderMarkdown(report));

console.log(`Wrote ${jsonOut}`);
console.log(`Wrote ${mdOut}`);
console.log(`SEIS SSH mobile 24/7 status: ${report.status}`);
if (!report.ok) {
  console.log(`Blockers: ${report.blockers.join(", ") || "none"}`);
}

function buildReport(readiness) {
  const transport = readiness.checks?.sshConfig?.transport || "unknown";
  const mobileReady = readiness.ok === true;
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
    blockers: readiness.blockers || [],
    warnings: readiness.warnings || [],
    checks: readiness.checks || {},
    nextActions: readiness.nextActions || [],
    handoff: {
      strictCommand: "npm run cloud:ssh:mobile-24x7:strict",
      reportCommand: "npm run cloud:ssh:mobile-24x7:report",
      directCloudSwitchCommand: "npm run cloud:ssh:direct-cloud:switch -- --public-ip <PUBLIC_IP> --direct-user root --apply",
      mobileReadyDefinition: "SEIS-SSH must use direct-cloud transport, prove TCP reachability, pass SSH key auth, and confirm the remote SSH-AI runtime."
    },
    safety: readiness.safety || []
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

## Blockers

${renderList(report.blockers, "No blockers.")}

## Warnings

${renderList(report.warnings, "No warnings.")}

## Next Actions

${renderList(report.nextActions, "No next actions.")}

## Handoff Commands

\`\`\`bash
${report.handoff.directCloudSwitchCommand}
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

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help") {
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
  --json-out PATH         JSON report path. Default: reports/seis-ssh-mobile-24x7-readiness.json.
  --md-out PATH           Markdown report path. Default: reports/seis-ssh-mobile-24x7-readiness.md.
`);
}
