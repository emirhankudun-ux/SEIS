#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const ledgerPath = path.join(repoRoot, "content", "development", "seis-clean-worktree-transition-ledger.json");

const failures = [];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function readJson(repoRelativePath) {
  const filePath = path.join(repoRoot, repoRelativePath);
  if (!fs.existsSync(filePath)) {
    fail(`missing ${repoRelativePath}`);
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`invalid JSON in ${repoRelativePath}: ${error.message}`);
    return {};
  }
}

function parseNameStatus(output) {
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("\t");
      return {
        status: parts[0],
        path: parts.at(-1),
        raw: line
      };
    });
}

function matchesForbidden(candidate, forbidden) {
  return candidate === forbidden || (forbidden.endsWith("/") && candidate.startsWith(forbidden));
}

const ledger = readJson("content/development/seis-clean-worktree-transition-ledger.json");
const pr0 = (ledger.reviewSlices || []).find((slice) => slice.id === "pr0-foundation-manifest-package") || {};
const allowed = new Set(pr0.includePaths || []);
const forbidden = new Set([
  ...(pr0.blockedPaths || []),
  ...(ledger.excludedUntilExplicitReview || []),
  "package.json",
  "apps/seis-demo-web/script.js"
]);

assert(fs.existsSync(ledgerPath), "clean-worktree transition ledger must exist");
assert(ledger.activeSlice === "pr0-foundation-manifest-package", "ledger active slice must be PR0");
assert(allowed.size >= 18, "PR0 includePaths must define the staged allowlist");
assert(forbidden.has("package.json"), "forbidden set must hard-code package.json");
assert(forbidden.has("apps/seis-demo-web/script.js"), "forbidden set must hard-code apps/seis-demo-web/script.js");

const nameStatus = execFileSync("git", ["diff", "--cached", "--name-status"], {
  cwd: repoRoot,
  encoding: "utf8"
});

const staged = parseNameStatus(nameStatus);

for (const entry of staged) {
  if (/^[DRC]/.test(entry.status)) {
    fail(`PR0 staged boundary forbids delete/rename/copy changes: ${entry.raw}`);
    continue;
  }

  for (const forbiddenPath of forbidden) {
    if (matchesForbidden(entry.path, forbiddenPath)) {
      fail(`forbidden path is staged in PR0 boundary: ${entry.path}`);
    }
  }

  if (!allowed.has(entry.path)) {
    fail(`staged path is outside PR0 allowlist: ${entry.path}`);
    continue;
  }

  let blob = "";
  try {
    blob = execFileSync("git", ["show", `:${entry.path}`], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024
    });
  } catch (error) {
    fail(`could not read staged blob for ${entry.path}: ${error.message}`);
    continue;
  }

  if (/\/Users\/[A-Za-z0-9._-]+\/[^\s"'`<>]+/.test(blob)) {
    fail(`staged blob contains concrete local absolute path: ${entry.path}`);
  }

  if (/BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY/.test(blob)) {
    fail(`staged blob contains private key marker: ${entry.path}`);
  }

  if (/sk-[A-Za-z0-9_-]{16,}/.test(blob)) {
    fail(`staged blob contains provider API key-shaped value: ${entry.path}`);
  }

  if (/AKIA[0-9A-Z]{16}/.test(blob)) {
    fail(`staged blob contains AWS access-key-shaped value: ${entry.path}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS PR0 staged boundary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEIS PR0 staged boundary check passed: ${staged.length} staged path(s).`);
