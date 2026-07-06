#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const pathspecPath = "content/development/seis-ai-truth-boundary-staging-pathspec.json";
const checkerPath = "scripts/check-seis-ai-truth-boundary-staged-boundary.mjs";
const pathspecCheckerPath = "scripts/check-seis-ai-truth-boundary-staging-pathspec.mjs";
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

const pathspec = readJson(pathspecPath);
const core = new Set(Array.isArray(pathspec.pathspecSafeCoreInclude) ? pathspec.pathspecSafeCoreInclude : []);
const hunkReview = new Set(Array.isArray(pathspec.integrationHunkReviewOnly) ? pathspec.integrationHunkReviewOnly : []);
const allowed = new Set([...core, ...hunkReview, pathspecPath]);
const blocked = Array.isArray(pathspec.mustRemainUnstagedUntilSeparatePr)
  ? pathspec.mustRemainUnstagedUntilSeparatePr
  : [];

for (const repoPath of core) {
  if (!existsSync(path.join(repoRoot, repoPath))) {
    fail(`AI truth-boundary core path missing from working tree: ${repoPath}`);
  }
}

const staged = parseNameStatus(
  execFileSync("git", ["diff", "--cached", "--name-status"], {
    cwd: repoRoot,
    encoding: "utf8"
  })
);
const maintenancePaths = new Set([pathspecPath, checkerPath, pathspecCheckerPath]);
const maintenanceOnly = staged.length > 0 && staged.every((item) => maintenancePaths.has(item.path));

for (const entry of staged) {
  if (/^[DRC]/.test(entry.status)) {
    fail(`AI truth-boundary staged boundary forbids delete/rename/copy changes: ${entry.raw}`);
    continue;
  }

  if ((entry.path === checkerPath || entry.path === pathspecCheckerPath) && !maintenanceOnly) {
    fail("AI truth-boundary staged-boundary checker maintenance must not be mixed with payload files");
    continue;
  }

  for (const blockedPath of blocked) {
    if (matches(entry.path, blockedPath)) {
      fail(`path reserved for a separate PR is staged: ${entry.path}`);
    }
  }

  if (!allowed.has(entry.path) && !maintenanceOnly) {
    fail(`staged path is outside AI truth-boundary allowlist: ${entry.path}`);
    continue;
  }

  const blob = readStagedBlob(entry.path);
  if (!blob) continue;

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

  if (entry.path === "package.json") {
    for (const forbiddenPackageMarker of [
      "check:seis-public-readiness-lanes",
      "check:seis-public-readiness-evidence",
      "check:seis-public-readiness-sensitive-boundary",
      "check:seis-command-center-god-mode-status",
      "automation:seis-command-center-god-mode-status",
      "intake:third-party",
      "check:seis-ai-nvidia-skills-downloadable"
    ]) {
      if (blob.includes(forbiddenPackageMarker)) {
        fail(`package.json staged blob contains unrelated package script marker: ${forbiddenPackageMarker}`);
      }
    }
  }

  if (
    [
      "content/development/seis-ai-core-mcp-runtime-contract.json",
      "packages/seis-ai/src/lib/plugin-integration.mjs",
      "packages/seis-ai/src/mcp/server.mjs",
      "packages/seis-ai/test/mcp-smoke.test.mjs"
    ].includes(entry.path)
  ) {
    for (const forbiddenMcpMarker of ["GOD_MODE_STATUS", "god-mode-status", "seis_god_mode_status"]) {
      if (blob.includes(forbiddenMcpMarker)) {
        fail(`${entry.path} staged blob contains God Mode MCP marker reserved for a separate slice: ${forbiddenMcpMarker}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS AI truth-boundary staged boundary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEIS AI truth-boundary staged boundary check passed: ${staged.length} staged path(s).`);
