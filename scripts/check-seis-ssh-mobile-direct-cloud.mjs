#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  packageJson: "package.json",
  runbook: "docs/operations/seis-ssh-mobile-24x7.md",
  bootstrapShell: "scripts/bootstrap-seis-ssh-mobile-direct-cloud.sh",
  bootstrapRunner: "scripts/run-seis-ssh-mobile-direct-cloud-bootstrap.mjs",
  configInstaller: "scripts/install-seis-ssh-mobile-direct-cloud-config.mjs",
  readinessProbe: "scripts/check-seis-ssh-mobile-24x7.mjs",
  readinessReport: "scripts/create-seis-ssh-mobile-24x7-report.mjs",
  directProfile: "scripts/create-seis-ssh-mobile-direct-cloud-profile.mjs",
  gitignore: ".gitignore",
};

for (const file of Object.values(files)) read(file);

const packageJson = readJson(files.packageJson);
const scripts = packageJson?.scripts || {};

const requiredScripts = {
  "cloud:ssh:mobile-direct:profile": "node scripts/create-seis-ssh-mobile-direct-cloud-profile.mjs",
  "cloud:ssh:mobile-direct:config:plan": "node scripts/install-seis-ssh-mobile-direct-cloud-config.mjs --dry-run",
  "cloud:ssh:mobile-direct:config:install": "node scripts/install-seis-ssh-mobile-direct-cloud-config.mjs --write",
  "cloud:ssh:mobile-direct:bootstrap:plan": "node scripts/run-seis-ssh-mobile-direct-cloud-bootstrap.mjs",
  "cloud:ssh:mobile-direct:bootstrap:apply": "node scripts/run-seis-ssh-mobile-direct-cloud-bootstrap.mjs --apply",
  "cloud:ssh:mobile-direct:probe": "node scripts/check-seis-ssh-mobile-24x7.mjs",
  "cloud:ssh:mobile-direct:probe:strict": "node scripts/check-seis-ssh-mobile-24x7.mjs --require-ready",
  "cloud:ssh:mobile-direct:doctor": "node scripts/create-seis-ssh-mobile-24x7-report.mjs",
  "cloud:ssh:mobile-direct:doctor:strict": "node scripts/create-seis-ssh-mobile-24x7-report.mjs --require-ready",
  "check:seis-ssh-mobile-direct-cloud": "node scripts/check-seis-ssh-mobile-direct-cloud.mjs",
};

for (const [name, command] of Object.entries(requiredScripts)) {
  ensure(scripts[name] === command, `package.json script ${name} must equal ${command}`);
}

ensure(
  String(scripts["quality:governance"] || "").includes("npm run check:seis-ssh-mobile-direct-cloud"),
  "quality:governance must include check:seis-ssh-mobile-direct-cloud"
);

for (const [file, token] of [
  [files.runbook, "Use direct SSH to an always-on cloud VM"],
  [files.runbook, "npm run cloud:ssh:mobile-direct:bootstrap:plan"],
  [files.runbook, "npm run cloud:ssh:mobile-direct:bootstrap:apply"],
  [files.runbook, "npm run cloud:ssh:mobile-direct:probe:strict"],
  [files.runbook, "npm run cloud:ssh:mobile-direct:doctor:strict"],
  [files.runbook, "keeps private keys and API keys out of git and logs"],
  [files.bootstrapShell, "SEIS_AUTHORIZED_KEY"],
  [files.bootstrapShell, "PasswordAuthentication ${SEIS_PASSWORD_AUTH}"],
  [files.bootstrapShell, "PermitRootLogin ${SEIS_PERMIT_ROOT_LOGIN}"],
  [files.bootstrapShell, "seis-ssh-mobile-ready.service"],
  [files.bootstrapRunner, "mode: apply ? \"apply\" : \"dry-run\""],
  [files.bootstrapRunner, "SEIS_SSH_PUBLIC_KEY_FILE"],
  [files.bootstrapRunner, "fingerprintPublicKey"],
  [files.bootstrapRunner, "This runner reads a public key only"],
  [files.bootstrapRunner, "Runtime secrets stay on the VM"],
  [files.configInstaller, "managed by SEIS"],
  [files.configInstaller, "Refusing to overwrite unmanaged SSH alias"],
  [files.configInstaller, "ServerAliveInterval 30"],
  [files.readinessProbe, "Direct-cloud mode must prove TCP reachability"],
  [files.readinessProbe, "mobile-24x7-requires-direct-cloud-transport"],
  [files.readinessProbe, "remote-runtime-offline"],
  [files.readinessReport, "directCloudBootstrapPlanCommand"],
  [files.readinessReport, "directCloudDoctorStrictCommand"],
  [files.readinessReport, "--require-ready"],
  [files.directProfile, "bootstrapPlan"],
  [files.directProfile, "strictProbeReadiness"],
  [files.directProfile, "secretsInGitAllowed: false"],
  [files.gitignore, "reports/seis-ssh-mobile-24x7-readiness.json"],
  [files.gitignore, "reports/seis-ssh-mobile-direct-cloud-profile.json"],
  [files.gitignore, ".seis-secrets/"],
]) {
  requireIncludes(file, token);
}

for (const file of Object.values(files)) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
}

if (failures.length > 0) {
  console.error("SEIS SSH mobile direct-cloud contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH mobile direct-cloud contract check passed.");

function absolute(file) {
  return path.join(root, file);
}

function read(file) {
  const full = absolute(file);
  if (!existsSync(full)) {
    fail(`missing ${file}`);
    return "";
  }
  return readFileSync(full, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function requireIncludes(file, token) {
  if (!read(file).includes(token)) fail(`${file} must include ${token}`);
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) fail(`${file} must not include ${reason}`);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function fail(message) {
  failures.push(message);
}
