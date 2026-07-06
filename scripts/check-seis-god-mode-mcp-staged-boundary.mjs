#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const pathspecPath = "content/development/seis-god-mode-mcp-staging-pathspec.json";
const checkerPath = "scripts/check-seis-god-mode-mcp-staged-boundary.mjs";
const pathspecCheckerPath = "scripts/check-seis-god-mode-mcp-staging-pathspec.mjs";
const docsPath = "docs/development/seis-god-mode-mcp-staging-pathspec.md";
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(repoPath) {
  const filePath = path.join(repoRoot, repoPath);
  if (!existsSync(filePath)) {
    fail(`missing ${repoPath}`);
    return {};
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`invalid JSON in ${repoPath}: ${error.message}`);
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

function matches(candidate, blocked) {
  return candidate === blocked || (blocked.endsWith("/") && candidate.startsWith(blocked));
}

function readStagedBlob(repoPath) {
  try {
    return execFileSync("git", ["show", `:${repoPath}`], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024
    });
  } catch (error) {
    fail(`could not read staged blob for ${repoPath}: ${error.message}`);
    return "";
  }
}

function scanForSecretsOrLocalPaths(blob, repoPath) {
  if (/\/Users\/[A-Za-z0-9._-]+\/[^\s"'`<>]+/.test(blob)) {
    fail(`staged blob contains concrete local absolute path: ${repoPath}`);
  }

  if (/BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY/.test(blob)) {
    fail(`staged blob contains private key marker: ${repoPath}`);
  }

  if (/(^|[^A-Za-z0-9_])sk-[A-Za-z0-9_-]{16,}/.test(blob)) {
    fail(`staged blob contains provider API key-shaped value: ${repoPath}`);
  }

  if (/AKIA[0-9A-Z]{16}/.test(blob)) {
    fail(`staged blob contains AWS access-key-shaped value: ${repoPath}`);
  }

  if (/ghp_[A-Za-z0-9_]{20,}/.test(blob)) {
    fail(`staged blob contains GitHub token-shaped value: ${repoPath}`);
  }

  if (/github_pat_[A-Za-z0-9_]{20,}/.test(blob)) {
    fail(`staged blob contains GitHub fine-grained token-shaped value: ${repoPath}`);
  }

  if (/xox[baprs]-[A-Za-z0-9-]{10,}/.test(blob)) {
    fail(`staged blob contains Slack token-shaped value: ${repoPath}`);
  }
}

const pathspec = readJson(pathspecPath);
const safeInclude = new Set(Array.isArray(pathspec.pathspecSafeInclude) ? pathspec.pathspecSafeInclude : []);
const hunkReview = new Set(Array.isArray(pathspec.candidateHunkReviewOnly) ? pathspec.candidateHunkReviewOnly : []);
const allowed = new Set([...safeInclude, ...hunkReview]);
const blocked = Array.isArray(pathspec.mustRemainUnstagedUntilSeparatePr)
  ? pathspec.mustRemainUnstagedUntilSeparatePr
  : [];
const forbiddenPayloadMarkers = Array.isArray(pathspec.forbiddenPayloadMarkers)
  ? pathspec.forbiddenPayloadMarkers
  : [];
const maintenancePaths = new Set([pathspecPath, checkerPath, pathspecCheckerPath, docsPath]);

for (const repoPath of maintenancePaths) {
  if (!existsSync(path.join(repoRoot, repoPath))) {
    fail(`God Mode MCP staging control path missing from working tree: ${repoPath}`);
  }
}

const staged = parseNameStatus(
  execFileSync("git", ["diff", "--cached", "--name-status"], {
    cwd: repoRoot,
    encoding: "utf8"
  })
);
const maintenanceOnly = staged.length > 0 && staged.every((item) => maintenancePaths.has(item.path));

for (const entry of staged) {
  if (/^[DRC]/.test(entry.status)) {
    fail(`God Mode MCP staged boundary forbids delete/rename/copy changes: ${entry.raw}`);
    continue;
  }

  for (const blockedPath of blocked) {
    if (matches(entry.path, blockedPath)) {
      fail(`path reserved for a separate PR is staged: ${entry.path}`);
    }
  }

  if (!allowed.has(entry.path) && !maintenanceOnly) {
    fail(`staged path is outside God Mode MCP allowlist: ${entry.path}`);
    continue;
  }

  const blob = readStagedBlob(entry.path);
  if (!blob) continue;

  scanForSecretsOrLocalPaths(blob, entry.path);

  if (maintenancePaths.has(entry.path)) {
    continue;
  }

  for (const forbiddenMarker of forbiddenPayloadMarkers) {
    if (blob.includes(forbiddenMarker)) {
      fail(`${entry.path} staged blob contains marker reserved for another slice: ${forbiddenMarker}`);
    }
  }

  if (entry.path === "content/development/seis-ai-core-mcp-runtime-contract.json") {
    if (!blob.includes('"toolCount": 35')) {
      fail("God Mode MCP runtime contract must stage the intermediate 35-tool count");
    }
    if (!blob.includes('"resourceCount": 29')) {
      fail("God Mode MCP runtime contract must stage the intermediate 29-resource count");
    }
    if (!blob.includes('"promptCount": 3')) {
      fail("God Mode MCP runtime contract must stage the intermediate 3-prompt count");
    }
    if (blob.includes('"resourceCount": 32')) {
      fail("God Mode MCP runtime contract must not stage the later 32-resource AI truth-boundary count");
    }
  }

  if (entry.path === "packages/seis-ai/test/mcp-smoke.test.mjs") {
    if (!blob.includes('"seis_god_mode_status"')) {
      fail("God Mode MCP smoke test must include the God Mode status tool assertion");
    }
    if (blob.includes("seis://ai/720b-agi-frontier-boundary.json")) {
      fail("God Mode MCP smoke test must not stage 720B truth-boundary resource assertions");
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS God Mode MCP staged boundary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEIS God Mode MCP staged boundary check passed: ${staged.length} staged path(s).`);
