#!/usr/bin/env node

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const failures = [];
const tempRoot = mkdtempSync(join(tmpdir(), "seis-ssh-report-"));

try {
  const missingAliasConfig = join(tempRoot, "missing-alias.conf");
  const explicitAliasConfig = join(tempRoot, "explicit-alias.conf");
  writeFileSync(missingAliasConfig, "Host OTHER\n  HostName github.codespaces\n  Port 22\n");
  writeFileSync(explicitAliasConfig, [
    "Host SEIS-SSH",
    "  HostName github.codespaces",
    "  Port 22",
    "  User vscode",
    "  ProxyCommand gh cs ssh -c public-contract-fixture",
    ""
  ].join("\n"));

  const missing = runReport(missingAliasConfig);
  ensure(missing.status !== 0, "missing explicit Host SEIS-SSH must fail --check");
  ensure(missing.report.ok === false, "missing alias report must set ok false");
  ensure(missing.report.status === "blocked", "missing alias report must stay blocked");
  ensure(missing.report.readinessReady === false, "missing alias report must not claim readiness");
  ensure(missing.report.localSshConfig?.explicitHostBlock === false, "missing alias must be recorded explicitly");
  ensure((missing.report.blockers || []).includes("explicit-host-block-missing"), "missing alias blocker must be stable");

  const explicit = runReport(explicitAliasConfig);
  ensure(explicit.status === 0, "explicit static fixture must pass --check");
  ensure(explicit.report.ok === true, "explicit static fixture must set ok true");
  ensure(explicit.report.status === "static-fixture-verified", "fixture result must not be presented as live readiness");
  ensure(explicit.report.readinessReady === false, "static fixture must never claim contributor readiness");
  ensure(explicit.report.localSshConfig?.transport === "codespace", "fixture must retain Codespaces transport");
  ensure(explicit.report.localSshConfig?.port === "22", "fixture must retain port 22");
  ensure(explicit.report.localSshConfig?.liveConnectionAttempted === false, "fixture must not open SSH");

  const doctor = runDoctorInGithubActions();
  ensure(doctor.status === 0, "GitHub Actions contributor doctor must pass static governance checks");
  ensure(doctor.report.ok === true, "GitHub Actions contributor doctor must keep static contract status green");
  ensure(doctor.report.status === "blocked", "GitHub Actions fixture must not mark contributor doctor review-ready");
  ensure(doctor.report.readinessReady === false, "GitHub Actions fixture must never claim contributor readiness");
  ensure(doctor.report.serverAndPortPolicy?.currentSnapshot?.configSource === "explicit-static-fixture", "GitHub Actions doctor must identify the static fixture source");
  ensure(doctor.report.contributorReadiness?.liveReadinessProven === false, "GitHub Actions doctor must keep live readiness unproven");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error("SEIS SSH public access report fixture check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  missingAliasFailsClosed: true,
  explicitAliasFixtureVerified: true,
  githubActionsFixtureReadinessBlocked: true,
  liveSshExecuted: false,
  serverAndPortChanged: false
}, null, 2));

function runReport(configPath) {
  const result = spawnSync(process.execPath, [
    "scripts/create-seis-ssh-public-access-report.mjs",
    "--check",
    "--ssh-config",
    configPath
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 15000
  });
  let report = {};
  try {
    report = JSON.parse(result.stdout || "{}");
  } catch (error) {
    failures.push(`report returned invalid JSON: ${error.message}`);
  }
  return { status: result.status ?? 1, report };
}

function runDoctorInGithubActions() {
  const env = { ...process.env, GITHUB_ACTIONS: "true" };
  delete env.SEIS_SSH_CONFIG_PATH;
  const result = spawnSync(process.execPath, [
    "scripts/check-seis-ssh-public-contributor-doctor.mjs",
    "--check"
  ], {
    cwd: process.cwd(),
    env,
    encoding: "utf8",
    timeout: 30000
  });
  let report = {};
  try {
    report = JSON.parse(result.stdout || "{}");
  } catch (error) {
    failures.push(`contributor doctor returned invalid JSON: ${error.message}`);
  }
  return { status: result.status ?? 1, report };
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
