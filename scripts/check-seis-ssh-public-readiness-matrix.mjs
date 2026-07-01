#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tempHome = mkdtempSync(join(tmpdir(), "seis-ssh-public-readiness-"));
const failures = [];

const checks = [
  {
    id: "clean-runner-access-report",
    command: ["scripts/create-seis-ssh-public-access-report.mjs", "--check"],
    expect: (payload) => {
      ensure(payload.ok === true, "clean runner access report must pass");
      ensure(payload.status === "setup-needed", "clean runner access report must be setup-needed");
      ensure(payload.localSshConfig?.configured === false, "clean runner access report must not require a local alias");
      ensure(payload.localSshConfig?.port === "22", "clean runner access report must preserve port 22");
      ensure(payload.localSshConfig?.liveConnectionAttempted === false, "clean runner access report must not attempt live SSH");
      ensure((payload.blockers || []).length === 0, "clean runner access report must not have blockers");
    }
  },
  {
    id: "clean-runner-contributor-doctor",
    command: ["scripts/check-seis-ssh-public-contributor-doctor.mjs", "--check"],
    expect: (payload) => {
      ensure(payload.ok === true, "clean runner contributor doctor must pass");
      ensure(payload.status === "review-ready", "clean runner contributor doctor must be review-ready");
      ensure(payload.contributorReadiness?.githubReviewReady === true, "clean runner contributor doctor must be GitHub-review ready");
      ensure(payload.contributorReadiness?.localPrereqsReady === false, "clean runner contributor doctor must not claim local prereqs are ready");
      ensure(payload.contributorReadiness?.sharedCredentialsRequired === false, "clean runner contributor doctor must not require shared credentials");
      ensure(payload.serverAndPortPolicy?.currentSnapshot?.configured === false, "clean runner contributor doctor must not require a local alias");
      ensure(payload.serverAndPortPolicy?.currentSnapshot?.port === "22", "clean runner contributor doctor must preserve port 22");
      ensure((payload.blockers || []).length === 0, "clean runner contributor doctor must not have blockers");
    }
  },
  {
    id: "clean-runner-support-packet",
    command: ["scripts/create-seis-ssh-public-support-packet.mjs", "--check"],
    expect: (payload) => {
      ensure(payload.ok === true, "clean runner support packet must pass");
      ensure(payload.status === "issue-ready", "clean runner support packet must be issue-ready");
      ensure(payload.issueFormCopy?.supportCase === "First-run setup", "clean runner support packet must classify first-run setup");
      ensure(payload.issueFormCopy?.sanitizedStatus?.packetStatus === "issue-ready", "clean runner support packet must emit an issue-ready sanitized status");
      ensure(payload.serverAndPortPolicy?.currentSnapshot?.port === "22", "clean runner support packet must preserve port 22");
      ensure(payload.serverAndPortPolicy?.currentSnapshot?.liveConnectionAttempted === false, "clean runner support packet must not attempt live SSH");
      ensure((payload.blockers || []).length === 0, "clean runner support packet must not have blockers");
    }
  },
  {
    id: "clean-runner-github-quickstart",
    command: ["scripts/create-seis-ssh-public-github-quickstart.mjs", "--check"],
    expect: (payload) => {
      const steps = Object.fromEntries((payload.quickstartSteps || []).map((step) => [step.id, step]));
      ensure(payload.ok === true, "clean runner GitHub quickstart must pass");
      ensure(payload.status === "quickstart-ready", "clean runner GitHub quickstart must be quickstart-ready");
      ensure(payload.decision === "Setup is needed locally before live SSH can be considered.", "clean runner GitHub quickstart must keep setup-needed wording");
      ensure(steps["first-run"]?.expectedSafeResult === "setup-needed", "clean runner GitHub quickstart must mark first-run as setup-needed");
      ensure(steps["contributor-doctor"]?.expectedSafeResult === "review-ready", "clean runner GitHub quickstart must keep contributor doctor review-ready");
      ensure(steps["support-packet"]?.expectedSafeResult === "issue-ready", "clean runner GitHub quickstart must keep support packet issue-ready");
      ensure(payload.serverAndPortPolicy?.currentSnapshot?.port === "22", "clean runner GitHub quickstart must preserve port 22");
      ensure(payload.serverAndPortPolicy?.currentSnapshot?.liveConnectionAttempted === false, "clean runner GitHub quickstart must not attempt live SSH");
      ensure((payload.blockers || []).length === 0, "clean runner GitHub quickstart must not have blockers");
    }
  }
];

try {
  const results = checks.map(runCheck);
  const matrix = {
    id: "seis-ssh-public-readiness-matrix",
    ok: failures.length === 0,
    status: failures.length === 0 ? "passed" : "failed",
    mode: "read-only-clean-runner-no-live-ssh-no-config-write-no-network-auth-check",
    alias: "SEIS-SSH",
    cleanRunnerHome: "temporary-empty-home",
    serverAndPortPolicy: {
      invariant: "Keep the same server and port.",
      turkishInvariant: "Ayni sunucu ve baglanti noktasi korunur.",
      expectedPort: "22",
      mutationAllowed: false
    },
    checks: results,
    blockers: failures,
    safety: [
      "This matrix does not open a live SSH session.",
      "This matrix does not write ~/.ssh/config.",
      "This matrix does not call gh auth status or contact GitHub.",
      "This matrix does not print private keys, tokens, cookies, full hostnames, full IPv4/IPv6 addresses, or provider credentials.",
      "Changing HostName or Port remains approval-gated."
    ]
  };

  console.log(JSON.stringify(matrix, null, 2));
  if (!matrix.ok) process.exit(1);
} finally {
  rmSync(tempHome, { recursive: true, force: true });
}

function runCheck(definition) {
  const result = spawnSync(process.execPath, definition.command, {
    encoding: "utf8",
    timeout: 30000,
    env: cleanEnv()
  });

  if (result.status !== 0) {
    failures.push(`${definition.id} exited with status ${result.status}`);
    failures.push(...sanitizeLines([result.stderr, result.stdout]).filter(Boolean));
    return { id: definition.id, status: "failed", command: renderCommand(definition.command) };
  }

  const output = result.stdout || "";
  requireNoSensitiveOutput(definition.id, [output, result.stderr || ""]);

  try {
    const payload = JSON.parse(output || "{}");
    definition.expect(payload);
    return {
      id: definition.id,
      status: "passed",
      command: renderCommand(definition.command),
      reportStatus: payload.status || "unknown",
      configured: payload.localSshConfig?.configured
        ?? payload.serverAndPortPolicy?.currentSnapshot?.configured
        ?? payload.contributorReadiness?.localPrereqsReady
        ?? false,
      port: payload.localSshConfig?.port
        || payload.serverAndPortPolicy?.currentSnapshot?.port
        || "22",
      liveConnectionAttempted: payload.localSshConfig?.liveConnectionAttempted
        ?? payload.serverAndPortPolicy?.currentSnapshot?.liveConnectionAttempted
        ?? false
    };
  } catch (error) {
    failures.push(`${definition.id} returned invalid JSON: ${error.message}`);
    return { id: definition.id, status: "failed", command: renderCommand(definition.command) };
  }
}

function cleanEnv() {
  const env = { ...process.env, HOME: tempHome, USERPROFILE: tempHome };
  delete env.SSH_AUTH_SOCK;
  delete env.SEIS_SSH_HOST;
  delete env.SEIS_SSH_PORT;
  return env;
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function requireNoSensitiveOutput(id, chunks) {
  const text = chunks.join("\n");
  for (const [pattern, label] of [
    [/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private key"],
    [/sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API key"],
    [/github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained token"],
    [/gh[pousr]_[A-Za-z0-9_]{20,}/, "GitHub token"],
    [/\/Users\/[^"'`\s]+/, "private /Users path"],
    [/\b(?:\d{1,3}\.){3}\d{1,3}\b/, "full IPv4 address"],
    [/\b(?:[a-f0-9]{1,4}:){4,7}[a-f0-9]{1,4}\b/i, "full IPv6 address"],
    [/\b(?:f[cd][a-f0-9]{0,2}|fe80):[a-f0-9:]{2,}\b/i, "private IPv6 address"],
    [/\bProxyCommand\b/, "raw ProxyCommand detail"],
    [/\bIdentityFile\b/, "raw IdentityFile detail"],
    [/liveConnectionAttempted"\s*:\s*true/, "live SSH attempt"]
  ]) {
    if (pattern.test(text)) failures.push(`${id} output must not include ${label}`);
  }
}

function renderCommand(command) {
  return `node ${command.join(" ")}`;
}

function sanitizeLines(values) {
  return values
    .join("\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line
      .replace(/-----BEGIN [^-]+PRIVATE KEY-----[\s\S]*?-----END [^-]+PRIVATE KEY-----/g, "[redacted-private-key]")
      .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[redacted-api-key]")
      .replace(/github_pat_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
      .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
      .replace(/\b(?:[a-f0-9]{1,4}:){4,7}[a-f0-9]{1,4}\b/gi, "[redacted-ipv6]")
      .replace(/\b(?:f[cd][a-f0-9]{0,2}|fe80):[a-f0-9:]{2,}\b/gi, "[redacted-ipv6]")
      .replace(/\/Users\/[^"'`\s]+/g, "[redacted-private-path]")
      .slice(0, 240));
}
