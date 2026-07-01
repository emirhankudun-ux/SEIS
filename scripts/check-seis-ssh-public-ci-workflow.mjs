#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log(`Usage: node scripts/check-seis-ssh-public-ci-workflow.mjs

Validates that the GitHub Actions workflow for SEIS-SSH public access runs only
read-only/static gates and keeps live SSH, endpoint migration, secrets, and
config writes out of CI.
`);
  process.exit(0);
}

const files = {
  workflow: ".github/workflows/seis-ssh-public-access.yml",
  contract: "deploy/seis-ssh-public-access-contract.json",
  packageJson: "package.json",
  runbook: "docs/deployment/seis-ssh-public-github-access.md"
};

const failures = [];

for (const file of Object.values(files)) read(file);

const workflow = read(files.workflow);
const contract = readJson(files.contract);
const packageJson = readJson(files.packageJson);
const scripts = packageJson?.scripts || {};

for (const token of [
  "name: SEIS SSH Public Access",
  "pull_request:",
  "push:",
  "permissions:",
  "contents: read",
  "SEIS SSH public access gates",
  "actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10",
  "actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
  "node-version: 20",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-access",
  "npm run check:seis-ssh-public-github-quickstart",
  "npm run check:seis-ssh-public-merge-readiness",
  "npm run check:seis-ssh-public-github-policy",
  "npm run check:seis-ssh-public-signing-guide",
  "npm run check:seis-ssh-public-support-packet",
  "npm run check:seis-ssh-public-readiness-matrix",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "npm run check:seis-ssh-live-readiness-evidence",
  "git diff --check"
]) {
  ensure(workflow.includes(token), `workflow must include ${token}`);
}

for (const forbidden of [
  "ssh SEIS-SSH",
  "cloud:ssh:online:strict",
  "cloud:ssh:mobile-direct:probe:strict",
  "cloud:ssh:mobile-direct:doctor:strict",
  "gh auth",
  "SEIS_SSH_HOST",
  "SEIS_SSH_PORT",
  "IdentityFile",
  "ProxyCommand"
]) {
  ensure(!workflow.includes(forbidden), `workflow must not include ${forbidden}`);
}

ensure(contract?.githubExperience?.ciWorkflow === files.workflow, "contract must link the SEIS-SSH CI workflow");
ensure((contract?.evidenceSurfaces || []).includes(files.workflow), "contract evidence surfaces must include the CI workflow");
ensure((contract?.evidenceSurfaces || []).includes("scripts/check-seis-ssh-public-ci-workflow.mjs"), "contract evidence surfaces must include the CI workflow checker");
ensure((contract?.evidenceSurfaces || []).includes("scripts/check-seis-ssh-public-readiness-matrix.mjs"), "contract evidence surfaces must include the public readiness matrix checker");
ensure((contract?.evidenceSurfaces || []).includes("scripts/create-seis-ssh-public-merge-readiness.mjs"), "contract evidence surfaces must include the merge readiness report generator");
ensure((contract?.evidenceSurfaces || []).includes("scripts/create-seis-ssh-public-github-policy-doctor.mjs"), "contract evidence surfaces must include the GitHub policy doctor generator");
ensure((contract?.evidenceSurfaces || []).includes("scripts/create-seis-ssh-public-signing-guide.mjs"), "contract evidence surfaces must include the public signing guide generator");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-public-ci-workflow"), "contract required commands must include the CI workflow checker");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-public-readiness-matrix"), "contract required commands must include the public readiness matrix checker");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-public-merge-readiness"), "contract required commands must include the merge readiness checker");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-public-github-policy"), "contract required commands must include the GitHub policy doctor checker");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-public-signing-guide"), "contract required commands must include the public signing guide checker");
ensure(scripts["check:seis-ssh-public-ci-workflow"] === "node scripts/check-seis-ssh-public-ci-workflow.mjs", "package script check:seis-ssh-public-ci-workflow must be declared");
ensure(scripts["check:seis-ssh-public-readiness-matrix"] === "node scripts/check-seis-ssh-public-readiness-matrix.mjs", "package script check:seis-ssh-public-readiness-matrix must be declared");
ensure(scripts["check:seis-ssh-public-merge-readiness"] === "node scripts/create-seis-ssh-public-merge-readiness.mjs --check", "package script check:seis-ssh-public-merge-readiness must be declared");
ensure(scripts["check:seis-ssh-public-github-policy"] === "node scripts/create-seis-ssh-public-github-policy-doctor.mjs --check", "package script check:seis-ssh-public-github-policy must be declared");
ensure(scripts["check:seis-ssh-public-signing-guide"] === "node scripts/create-seis-ssh-public-signing-guide.mjs --check", "package script check:seis-ssh-public-signing-guide must be declared");

for (const file of Object.values(files)) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained tokens");
  requireNotMatches(file, /gh[pousr]_[A-Za-z0-9_]{20,}/, "GitHub tokens");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /(password|token|secret)\s*[:=]\s*["'][^"']{8,}/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS SSH public CI workflow check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH public CI workflow check passed.");

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    failures.push(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) failures.push(`${file} must not include ${reason}`);
}
