#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const failures = [];
const baseRef = process.env.SEIS_CLOUD_SSH_CENTER_BASE_REF || "origin/main";

const allowedChangedFiles = new Set([
  "apps/seis-core/README.md",
  "apps/seis-core/cloud-ssh-center.css",
  "apps/seis-core/cloud-ssh-center.html",
  "apps/seis-core/cloud-ssh-center.js",
  "apps/seis-core/script.js",
  "apps/seis-core/styles.css",
  "apps/seis-core/test/seis-cloud-ssh-center-static.test.js",
  "apps/seis-core/test/seis-core-static.test.js",
  "content/development/seis-cloud-ssh-center-readiness.json",
  "docs/deployment/seis-cloud-ssh-center-demo.md",
  "docs/deployment/seis-ssh-chatgpt-mobile-24x7.md",
  "docs/operations/seis-ssh-mobile-24x7.md",
  "package.json",
  "scripts/check-seis-cloud-ssh-center-pr-boundary.mjs",
  "scripts/check-seis-cloud-ssh-center-readiness.mjs",
  "scripts/check-seis-ssh-mobile-direct-cloud.mjs",
  "scripts/create-seis-ssh-mobile-24x7-report.mjs",
  "scripts/tests/seis-ssh-mobile-24x7-report.test.mjs"
]);

const forbiddenDiffPrefixes = [
  ".github/workflows/",
  "sources/",
  "reports/",
  "dist/",
  "build/",
  "node_modules/"
];

const forbiddenHeadPaths = [
  "sources/github-unified-source/_generated/github-code-bundle.txt"
];

const changedFiles = git(["diff", "--name-only", "--diff-filter=ACMR", `${baseRef}...HEAD`])
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

ensure(changedFiles.length > 0, `expected Cloud SSH Center PR diff against ${baseRef}`);

for (const file of changedFiles) {
  ensure(allowedChangedFiles.has(file), `unexpected changed file outside Cloud SSH Center PR boundary: ${file}`);
  for (const prefix of forbiddenDiffPrefixes) {
    ensure(!file.startsWith(prefix), `changed file must not touch forbidden prefix ${prefix}: ${file}`);
  }
}

for (const file of forbiddenHeadPaths) {
  const existsInHead = git(["ls-tree", "-r", "--name-only", "HEAD", "--", file]).trim() === file;
  ensure(!existsInHead, `forbidden generated secret-history bundle must not exist in HEAD: ${file}`);
}

for (const file of changedFiles) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, "utf8");
  requireNotMatches(file, text, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API key");
  requireNotMatches(file, text, /ghp_[A-Za-z0-9_]{20,}/, "GitHub personal access token");
  requireNotMatches(file, text, /github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained token");
  requireNotMatches(file, text, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private key");
  requireNotMatches(file, text, /\b(?:password|token|secret)\s*[:=]\s*["'][^"']{8,}/i, "inline credential assignment");
}

if (failures.length > 0) {
  console.error("SEIS Cloud SSH Center PR boundary check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Cloud SSH Center PR boundary check passed.");
console.log(`- baseRef: ${baseRef}`);
console.log(`- changedFiles: ${changedFiles.length}`);
console.log("- generated secret-history bundle present in HEAD: false");
console.log("- changed-file secret pattern findings: 0");

function git(args) {
  const result = spawnSync("git", args, {
    encoding: "utf8",
    timeout: 45000
  });
  if (result.status !== 0) {
    failures.push(`git ${args.join(" ")} failed: ${result.stderr || result.stdout || "unknown error"}`);
    return "";
  }
  return result.stdout || "";
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function requireNotMatches(file, text, pattern, reason) {
  if (pattern.test(text)) failures.push(`${file} must not include ${reason}`);
}
