#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const failures = [];
const generatedBundlePrefix = "sources/github-unified-source/_generated/";
const remediationDoc = "docs/security/gitleaks-history-remediation.md";

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readText(file) {
  return readFileSync(path.join(root, file), "utf8");
}

const gitLsFiles = spawnSync("git", ["ls-files", "--", generatedBundlePrefix], {
  cwd: root,
  encoding: "utf8"
});

ensure(gitLsFiles.status === 0, "git ls-files must be available for generated bundle guard.");

const trackedGeneratedFiles = gitLsFiles.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

ensure(
  trackedGeneratedFiles.length === 0,
  `${generatedBundlePrefix} must not be tracked. Keep generated source bundles local-only.`
);

ensure(existsSync(path.join(root, remediationDoc)), `${remediationDoc} must document the remediation path.`);

if (existsSync(path.join(root, ".gitignore"))) {
  const gitignore = readText(".gitignore");
  ensure(
    gitignore.includes(generatedBundlePrefix),
    ".gitignore must keep generated unified source bundles out of git."
  );
  ensure(
    gitignore.includes("!docs/security/*.md"),
    ".gitignore must allow public-safe security remediation docs."
  );
}

if (failures.length > 0) {
  console.error("Generated source bundle guard failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Generated source bundle guard passed.");
