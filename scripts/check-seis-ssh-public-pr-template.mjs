#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log(`Usage: node scripts/check-seis-ssh-public-pr-template.mjs

Validates that the GitHub pull request template includes the SEIS-SSH public
review checklist, same-server/port invariant, approval-gated live SSH boundary,
secret-safety wording, and required public review commands.
`);
  process.exit(0);
}

const files = {
  prTemplate: ".github/PULL_REQUEST_TEMPLATE.md",
  supportIssueTemplate: ".github/ISSUE_TEMPLATE/seis_ssh_access.yml",
  contract: "deploy/seis-ssh-public-access-contract.json",
  packageJson: "package.json",
  runbook: "docs/deployment/seis-ssh-public-github-access.md"
};

const failures = [];

for (const file of Object.values(files)) read(file);

const prTemplate = read(files.prTemplate);
const contract = readJson(files.contract);
const packageJson = readJson(files.packageJson);
const scripts = packageJson?.scripts || {};

for (const token of [
  "## SEIS-SSH Public Access Review",
  "Keep the same server and port.",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "I did not rename `SEIS-SSH`.",
  "I did not add a duplicate visible SEIS SSH alias.",
  "I did not change `HostName` or `Port` for `SEIS-SSH` without linked maintainer approval.",
  "I did not paste private keys, tokens, passwords, cookies, `.env` values, full hostnames, full IPv4/IPv6 addresses, or provider credentials.",
  "No live SSH session was attempted for this PR unless explicit maintainer approval is linked.",
  "Live-ready, mobile-24x7-ready, and picker-ready claims are supported by strict evidence or left as `blocked` / `approval-gated`.",
  "Public artifacts were checked before attaching them to a public issue or PR.",
  "GitHub merge readiness is represented honestly when repository rules keep `mergeStateStatus: BLOCKED`.",
  "Signed commit setup, last-push approval, code owner review, and review-thread resolution requirements are acknowledged.",
  "Verified signed commits are covered by the public signing guide when required signatures are active.",
  "Public review bundle was generated or checked before requesting SEIS-SSH review.",
  "AI/MCP handoff was checked when installed AI, MCP, plugin, or connector context is relevant.",
  "Client compatibility matrix was checked when user, device, IDE, picker, AI, MCP, plugin, or VPN behavior is relevant.",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-access",
  "npm run check:seis-ssh-public-merge-readiness",
  "npm run check:seis-ssh-public-github-policy",
  "npm run check:seis-ssh-public-signing-guide",
  "npm run check:seis-ssh-public-review-bundle",
  "npm run check:seis-ssh-ai-mcp-handoff",
  "npm run check:seis-ssh-public-client-compatibility",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-readiness-matrix",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "npm run check:seis-ssh-live-readiness-evidence",
  ".github/ISSUE_TEMPLATE/seis_ssh_access.yml",
  "docs/deployment/seis-ssh-public-github-access.md"
]) {
  ensure(prTemplate.includes(token), `pull request template must include ${token}`);
}

ensure(contract?.githubExperience?.pullRequestTemplate === files.prTemplate, "contract must link the SEIS-SSH pull request template");
ensure((contract?.evidenceSurfaces || []).includes(files.prTemplate), "contract evidence surfaces must include the pull request template");
ensure((contract?.evidenceSurfaces || []).includes("scripts/check-seis-ssh-public-pr-template.mjs"), "contract evidence surfaces must include the pull request template checker");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-public-pr-template"), "contract required commands must include the pull request template checker");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-public-signing-guide"), "contract required commands must include the public signing guide checker");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-public-review-bundle"), "contract required commands must include the public review bundle checker");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-ai-mcp-handoff"), "contract required commands must include the AI/MCP handoff checker");
ensure((contract?.requiredCommands || []).includes("npm run check:seis-ssh-public-client-compatibility"), "contract required commands must include the client compatibility checker");
ensure(scripts["check:seis-ssh-public-pr-template"] === "node scripts/check-seis-ssh-public-pr-template.mjs", "package script check:seis-ssh-public-pr-template must be declared");
ensure(scripts["check:seis-ssh-public-signing-guide"] === "node scripts/create-seis-ssh-public-signing-guide.mjs --check", "package script check:seis-ssh-public-signing-guide must be declared");
ensure(scripts["check:seis-ssh-public-review-bundle"] === "node scripts/create-seis-ssh-public-review-bundle.mjs --check", "package script check:seis-ssh-public-review-bundle must be declared");
ensure(scripts["check:seis-ssh-ai-mcp-handoff"] === "node scripts/create-seis-ssh-ai-mcp-handoff-bundle.mjs --check", "package script check:seis-ssh-ai-mcp-handoff must be declared");
ensure(scripts["check:seis-ssh-public-client-compatibility"] === "node scripts/create-seis-ssh-public-client-compatibility.mjs --check", "package script check:seis-ssh-public-client-compatibility must be declared");

for (const file of Object.values(files)) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained tokens");
  requireNotMatches(file, /gh[pousr]_[A-Za-z0-9_]{20,}/, "GitHub tokens");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /(password|token|secret)\s*[:=]\s*["'][^"']{8,}/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS SSH public PR template check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH public PR template check passed.");

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
