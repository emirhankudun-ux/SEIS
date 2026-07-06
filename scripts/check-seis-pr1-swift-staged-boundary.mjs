#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const failures = [];
const checkerPath = "scripts/check-seis-pr1-swift-staged-boundary.mjs";

const allowed = new Set([
  "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisMCPPermissionRiskRecord.swift",
  "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisStitchModuleFamily.swift",
  "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisFoundationManifestLoadingTests.swift"
]);

const forbidden = [
  "package.json",
  "apps/seis-demo-web/script.js",
  "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleContinuationWindow.swift",
  "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAppleNativeShellShowcaseView.swift",
  "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformPolicyTests.swift"
];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
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

for (const repoPath of allowed) {
  assert(existsSync(path.join(repoRoot, repoPath)), `PR1 allowlisted file is missing: ${repoPath}`);
}

const nameStatus = execFileSync("git", ["diff", "--cached", "--name-status"], {
  cwd: repoRoot,
  encoding: "utf8"
});

const staged = parseNameStatus(nameStatus);

for (const entry of staged) {
  if (/^[DRC]/.test(entry.status)) {
    fail(`PR1 Swift boundary forbids delete/rename/copy changes: ${entry.raw}`);
    continue;
  }

  const checkerMaintenanceOnly = entry.path === checkerPath && staged.length === 1;
  if (entry.path === checkerPath && !checkerMaintenanceOnly) {
    fail("PR1 Swift boundary checker maintenance must not be staged with Swift PR1 payload files");
    continue;
  }

  for (const forbiddenPath of forbidden) {
    if (matches(entry.path, forbiddenPath)) {
      fail(`forbidden path is staged in PR1 Swift boundary: ${entry.path}`);
    }
  }

  if (!allowed.has(entry.path) && !checkerMaintenanceOnly) {
    fail(`staged path is outside PR1 Swift allowlist: ${entry.path}`);
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
  console.error("SEIS PR1 Swift staged boundary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEIS PR1 Swift staged boundary check passed: ${staged.length} staged path(s).`);
