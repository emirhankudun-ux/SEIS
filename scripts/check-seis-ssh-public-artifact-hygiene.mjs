#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const artifacts = [
  {
    id: "access-report",
    script: "scripts/create-seis-ssh-public-access-report.mjs",
    expectedId: "seis-ssh-public-access-report"
  },
  {
    id: "first-run",
    script: "scripts/create-seis-ssh-public-first-run.mjs",
    expectedId: "seis-ssh-public-first-run"
  },
  {
    id: "troubleshooting",
    script: "scripts/create-seis-ssh-public-troubleshooting-guide.mjs",
    expectedId: "seis-ssh-public-troubleshooting-guide"
  },
  {
    id: "support-packet",
    script: "scripts/create-seis-ssh-public-support-packet.mjs",
    expectedId: "seis-ssh-public-support-packet"
  },
  {
    id: "github-quickstart",
    script: "scripts/create-seis-ssh-public-github-quickstart.mjs",
    expectedId: "seis-ssh-public-github-quickstart"
  },
  {
    id: "onboarding-pack",
    script: "scripts/create-seis-ssh-public-onboarding-pack.mjs",
    expectedId: "seis-ssh-public-onboarding-pack"
  },
  {
    id: "contributor-doctor",
    script: "scripts/check-seis-ssh-public-contributor-doctor.mjs",
    expectedId: "seis-ssh-public-contributor-doctor"
  }
];

const failures = [];
const warnings = [];
const tempDir = mkdtempSync(join(tmpdir(), "seis-ssh-public-artifact-hygiene-"));

for (const artifact of artifacts) {
  const jsonPath = join(tempDir, `${artifact.id}.json`);
  const markdownPath = join(tempDir, `${artifact.id}.md`);
  const result = run(process.execPath, [
    artifact.script,
    "--write",
    "--output",
    jsonPath,
    "--markdown",
    markdownPath
  ]);

  if (result.status !== 0) {
    failures.push(`${artifact.id}: generator exited with status ${result.status}`);
    warnings.push(...sanitizeLines([result.stderr, result.stdout]));
    continue;
  }

  if (!existsSync(jsonPath)) failures.push(`${artifact.id}: JSON artifact was not written`);
  if (!existsSync(markdownPath)) failures.push(`${artifact.id}: Markdown artifact was not written`);
  if (!existsSync(jsonPath) || !existsSync(markdownPath)) continue;

  const jsonText = readFileSync(jsonPath, "utf8");
  const markdownText = readFileSync(markdownPath, "utf8");
  let json;
  try {
    json = JSON.parse(jsonText);
  } catch (error) {
    failures.push(`${artifact.id}: JSON artifact is invalid: ${error.message}`);
    continue;
  }

  validateJsonArtifact({ artifact, json });
  validateTextArtifact({ artifact, jsonText, markdownText });
}

const report = {
  id: "seis-ssh-public-artifact-hygiene",
  generatedAt: new Date().toISOString(),
  ok: failures.length === 0,
  status: failures.length === 0 ? "passed" : "blocked",
  mode: "read-only-temp-artifact-scan-no-live-ssh-no-config-write-no-network-auth-check",
  alias: "SEIS-SSH",
  artifactCount: artifacts.length,
  tempArtifactDirectory: sanitizePath(tempDir),
  publicReportPaths: [
    "reports/seis-ssh-public-access/latest.json",
    "reports/seis-ssh-public-access/latest.md",
    "reports/seis-ssh-public-access/first-run-latest.json",
    "reports/seis-ssh-public-access/first-run-latest.md",
    "reports/seis-ssh-public-access/troubleshooting-latest.json",
    "reports/seis-ssh-public-access/troubleshooting-latest.md",
    "reports/seis-ssh-public-access/support-packet-latest.json",
    "reports/seis-ssh-public-access/support-packet-latest.md",
    "reports/seis-ssh-public-access/github-quickstart-latest.json",
    "reports/seis-ssh-public-access/github-quickstart-latest.md",
    "reports/seis-ssh-public-access/onboarding-pack-latest.json",
    "reports/seis-ssh-public-access/onboarding-pack-latest.md",
    "reports/seis-ssh-public-access/contributor-doctor-latest.json",
    "reports/seis-ssh-public-access/contributor-doctor-latest.md"
  ],
  checks: [
    "generate all public SEIS-SSH JSON and Markdown reports in a temporary directory",
    "reject private keys, API keys, GitHub tokens, inline credential assignments, full IPv4 addresses, private /Users paths, raw ProxyCommand details, and identity-file paths",
    "reject liveConnectionAttempted true and strict-ready overclaims",
    "require SEIS-SSH alias, same server/port invariant, and preserved port 22 where a snapshot exists"
  ],
  blockers: failures,
  warnings,
  safety: [
    "This hygiene check does not open a live SSH session.",
    "This hygiene check does not write ~/.ssh/config.",
    "This hygiene check does not call gh auth status or contact GitHub.",
    "This hygiene check writes only temporary artifacts outside the repository tree.",
    "Changing HostName or Port remains approval-gated."
  ]
};

console.log(JSON.stringify(report, null, 2));

if (!report.ok) {
  process.exit(1);
}

function validateJsonArtifact({ artifact, json }) {
  if (json.id !== artifact.expectedId) failures.push(`${artifact.id}: expected id ${artifact.expectedId}`);
  if (json.alias !== "SEIS-SSH") failures.push(`${artifact.id}: alias must be SEIS-SSH`);
  if (!String(json.mode || "").includes("read-only")) failures.push(`${artifact.id}: mode must be read-only`);
  if (JSON.stringify(json).includes("\"liveConnectionAttempted\":true")) failures.push(`${artifact.id}: must not attempt live SSH`);
  if (json.serverAndPortPolicy?.invariant !== "Keep the same server and port.") failures.push(`${artifact.id}: missing same server/port invariant`);
  if (json.serverAndPortPolicy?.turkishInvariant !== "Ayni sunucu ve baglanti noktasi korunur.") failures.push(`${artifact.id}: missing Turkish same server/port invariant`);

  const snapshot = json.serverAndPortPolicy?.currentSnapshot || json.localSshConfig || null;
  if (snapshot) {
    if (snapshot.port !== "22") failures.push(`${artifact.id}: snapshot port must remain 22`);
    if (snapshot.liveConnectionAttempted !== false) failures.push(`${artifact.id}: snapshot liveConnectionAttempted must be false`);
    if (snapshot.hostname && snapshot.hostnameKind !== "redacted-direct-cloud-host") failures.push(`${artifact.id}: raw hostname field must not be emitted`);
    if (snapshot.proxyCommand) failures.push(`${artifact.id}: raw ProxyCommand field must not be emitted`);
    if (snapshot.identityFile) failures.push(`${artifact.id}: raw identityFile field must not be emitted`);
  }

  if (json.status === "live-ready" || json.status === "mobile-24x7-ready") failures.push(`${artifact.id}: must not claim live readiness`);
  if (json.liveProbe?.strictReady === true) failures.push(`${artifact.id}: must not claim strict live readiness`);
}

function validateTextArtifact({ artifact, jsonText, markdownText }) {
  const combined = `${jsonText}\n${markdownText}`;
  const checks = [
    [/-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----/i, "private key block"],
    [/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/, "GitHub token"],
    [/\bsk-[A-Za-z0-9_-]{20,}\b/, "OpenAI-style API key"],
    [/\b(?:password|token|secret|api[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/i, "inline credential assignment"],
    [/\b(?:\d{1,3}\.){3}\d{1,3}\b/, "full IPv4 address"],
    [/\/Users\/[^/\s]+/, "private /Users path"],
    [/\bgh\s+cs\s+ssh\s+-c\s+\S+/i, "raw Codespaces ProxyCommand"],
    [/\bIdentityFile\b/i, "raw SSH identity file directive"],
    [/\bid_(?:rsa|dsa|ecdsa|ed25519)(?:_[A-Za-z0-9_-]+)?\b/, "SSH key filename"]
  ];

  for (const [pattern, label] of checks) {
    if (pattern.test(combined)) failures.push(`${artifact.id}: ${label} leaked into generated artifact`);
  }
}

function run(command, argv) {
  const result = spawnSync(command, argv, {
    encoding: "utf8",
    timeout: 30000
  });
  return {
    status: result.status ?? (result.error ? 1 : 0),
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error?.message || null
  };
}

function sanitizeLines(values) {
  return values.filter(Boolean).map((value) => String(value)
    .replace(/-----BEGIN [^-]+PRIVATE KEY-----[\s\S]*?-----END [^-]+PRIVATE KEY-----/g, "[redacted-private-key]")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[redacted-api-key]")
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[redacted-ip]")
    .replace(/\/Users\/[^/\s]+/g, "~")
    .slice(0, 500));
}

function sanitizePath(path) {
  return String(path || "").replace(/\/Users\/[^/\s]+/g, "~");
}

function parseArgs(tokens) {
  const parsed = {};
  for (const token of tokens) {
    if (token === "--help") parsed.help = true;
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/check-seis-ssh-public-artifact-hygiene.mjs

Generates all public SEIS-SSH JSON and Markdown reports in a temporary directory,
then verifies they are safe to attach to GitHub issues or PR review.
It does not open SSH, write SSH config, contact GitHub, change server/port, or expose secrets.`);
}
