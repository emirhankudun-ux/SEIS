#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];
const workflowPath = ".github/workflows/seis-ssh-public-access.yml";
const contractPath = "deploy/seis-ssh-public-access-contract.json";
const runbookPath = "docs/deployment/seis-ssh-public-github-access.md";
const codeownersPath = ".github/CODEOWNERS";
const packagePath = "package.json";

const workflow = readText(workflowPath);
const runbook = readText(runbookPath);
const codeowners = readText(codeownersPath);
const contract = readJson(contractPath);
const packageJson = readJson(packagePath);
const workflowPathPatterns = [...workflow.matchAll(/^\s+- '([^']+)'$/gm)].map((match) => match[1]);

const requiredWorkflowText = [
  "name: SEIS-SSH Public Access Contract",
  "pull_request:",
  "workflow_dispatch:",
  "permissions:",
  "contents: read",
  "timeout-minutes: 10",
  "actions/checkout@",
  "actions/setup-node@",
  "node-version: 20",
  "npm run check:seis-ssh-github-pr-contract",
  "npm run check:seis-ssh-public-access",
  "npm run check:seis-ssh-public-access-report",
  "npm run check:seis-ssh-public-onboarding",
  "npm run check:seis-ssh-public-contributor-doctor",
  "npm run check:seis-ssh-live-readiness-evidence",
  "npm run check:seis-ssh-access-model",
  "npm run check:seis-ssh-cloud-roadmap",
  "npm run check:seis-ssh-closed-runtime",
  "npm run check:seis-ssh-enterprise-benchmark",
  "git diff --check"
];

for (const token of requiredWorkflowText) {
  ensure(workflow.includes(token), `${workflowPath} must include ${token}`);
}

for (const pathPattern of [
  ".github/workflows/seis-ssh-public-access.yml",
  "deploy/seis-ssh-*.json",
  "docs/deployment/seis-ssh-*.md",
  "docs/deployment/seis-codex-git-ssh-handoff.md",
  "scripts/check-seis-ssh-*.mjs",
  "scripts/create-seis-ssh-public-*.mjs",
  "content/development/seis-ssh-*.json",
  "apps/web/desktop.js",
  "docs/STATUS.md",
  "docs/roadmap/MASTER_BACKLOG.md",
  "docs/roadmap/NEXT_PR_QUEUE.md",
  "package.json"
]) {
  ensure(workflow.includes(`- '${pathPattern}'`), `${workflowPath} must trigger on ${pathPattern}`);
}

for (const forbidden of [
  "gh auth",
  "gh cs ssh",
  "ssh -T",
  "ssh -o",
  "npm run cloud:ssh:",
  "SEIS_SSH_HOST",
  "SEIS_SSH_PORT",
  "secrets."
]) {
  ensure(!workflow.toLowerCase().includes(forbidden.toLowerCase()), `${workflowPath} must not execute or expose ${forbidden}`);
}

ensure(/^\s*uses:\s+actions\/checkout@[0-9a-f]{40}\s+#/m.test(workflow), `${workflowPath} must pin actions/checkout to a commit SHA`);
ensure(/^\s*uses:\s+actions\/setup-node@[0-9a-f]{40}\s+#/m.test(workflow), `${workflowPath} must pin actions/setup-node to a commit SHA`);
ensure(packageJson?.scripts?.["check:seis-ssh-github-pr-contract"] === "node scripts/check-seis-ssh-github-pr-contract.mjs", "package.json must expose the GitHub PR contract check");

const prWorkflow = contract?.githubExperience?.pullRequestWorkflow || {};
ensure(prWorkflow.workflow === workflowPath, "public access contract must point to the SSH GitHub PR workflow");
ensure(prWorkflow.mode === "static-contract-only-no-live-ssh", "SSH GitHub PR workflow must remain static-contract-only-no-live-ssh");
ensure(Array.isArray(prWorkflow.triggers) && prWorkflow.triggers.includes("pull_request") && prWorkflow.triggers.includes("workflow_dispatch"), "SSH GitHub PR workflow must declare pull_request and workflow_dispatch triggers");
ensure(prWorkflow.permissions?.contents === "read", "SSH GitHub PR workflow must request contents: read only");
ensure(Array.isArray(prWorkflow.forbiddenActions) && prWorkflow.forbiddenActions.includes("live SSH"), "public access contract must forbid live SSH in the PR workflow");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-github-pr-contract"), "public access contract requiredCommands must include the GitHub PR contract check");
for (const evidenceSurface of contract?.evidenceSurfaces || []) {
  ensure(
    workflowPathPatterns.some((pattern) => pathPatternMatches(pattern, evidenceSurface)),
    `${workflowPath} must trigger when evidence surface changes: ${evidenceSurface}`
  );
}

for (const token of [
  "## GitHub Pull Request Guard",
  workflowPath,
  "npm run check:seis-ssh-github-pr-contract",
  "static-only",
  "does not open live SSH"
]) {
  ensure(runbook.includes(token), `${runbookPath} must include ${token}`);
}

for (const pattern of [
  "/deploy/seis-ssh-*.json @emirhankudun-ux",
  "/docs/deployment/seis-ssh-*.md @emirhankudun-ux",
  "/scripts/check-seis-ssh-*.mjs @emirhankudun-ux",
  "/scripts/create-seis-ssh-public-*.mjs @emirhankudun-ux",
  "/.github/workflows/seis-ssh-public-access.yml @emirhankudun-ux"
]) {
  ensure(codeowners.includes(pattern), `${codeownersPath} must require owner review for ${pattern}`);
}

for (const [file, content] of [[workflowPath, workflow], [runbookPath, runbook], [codeownersPath, codeowners]]) {
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(content), `${file} must not contain private keys`);
  ensure(!/(?:ghp_|github_pat_)[A-Za-z0-9_]+/.test(content), `${file} must not contain GitHub tokens`);
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(content), `${file} must not contain provider API keys`);
}

if (failures.length > 0) {
  console.error("SEIS SSH GitHub PR contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  workflow: workflowPath,
  mode: prWorkflow.mode,
  triggers: prWorkflow.triggers,
  permissions: prWorkflow.permissions,
  checks: requiredWorkflowText.slice(9),
  liveSshExecuted: false,
  credentialsRead: false,
  serverAndPortChanged: false
}, null, 2));

function readText(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(file) {
  const text = readText(file);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${file} is not valid JSON: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function pathPatternMatches(pattern, value) {
  const expression = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${expression}$`).test(value);
}
