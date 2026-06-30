#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];
const files = {
  doc: "docs/governance/github-pr-queue-readiness.md",
  packageJson: "package.json",
  openSourceCheck: "scripts/check-open-source-governance.mjs"
};

for (const file of Object.values(files)) read(file);

const doc = read(files.doc);
const packageJson = JSON.parse(read(files.packageJson) || "{}");

for (const token of [
  "# GitHub PR Queue Readiness",
  "#76",
  "#77",
  "#78",
  "GitHub-verified commit",
  "Security Guardian full-history Gitleaks scan",
  "sources/github-unified-source/_generated/",
  "Do not paste, summarize, or reprint detected values",
  "Do not push directly to `main`.",
  "Do not force-push rewritten signed commits without explicit owner approval.",
  "Do not weaken `.gitleaks.toml`",
  "npm run check:github-pr-queue-readiness"
]) {
  ensure(doc.includes(token), `${files.doc} must include ${token}`);
}

ensure(
  packageJson.scripts?.["check:github-pr-queue-readiness"] ===
    "node scripts/check-github-pr-queue-readiness.mjs",
  "package.json must expose check:github-pr-queue-readiness"
);

ensure(
  read(files.openSourceCheck).includes("docs/governance/github-pr-queue-readiness.md"),
  "open-source governance check must cover the PR queue readiness document"
);

for (const file of [files.doc, files.openSourceCheck]) {
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /(?:ghp_|github_pat_)[A-Za-z0-9_]+/, "GitHub tokens");
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /\b(?:password|token|secret|api[_-]?key)\s*[:=]\s*["'][^"']{8,}/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("GitHub PR queue readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("GitHub PR queue readiness check passed.");

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) failures.push(`${file} must not include ${reason}`);
}
