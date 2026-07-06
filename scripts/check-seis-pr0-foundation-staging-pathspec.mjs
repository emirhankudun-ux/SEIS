#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(repoRoot, "content", "development", "seis-pr0-foundation-staging-pathspec.json");

const failures = [];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`missing ${path.relative(repoRoot, filePath)}`);
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  const text = readText(filePath);
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON in ${path.relative(repoRoot, filePath)}: ${error.message}`);
    return {};
  }
}

function repoPathExists(repoRelativePath) {
  return fs.existsSync(path.join(repoRoot, repoRelativePath));
}

const raw = readText(manifestPath);
assert(!/\/Users\/|Mobile Documents|~\/|[A-Za-z]:\\/.test(raw), "manifest must not contain local absolute paths");
assert(!raw.includes("BEGIN PRIVATE KEY"), "manifest must not contain private key blocks");
assert(!/sk-[A-Za-z0-9_-]{16,}/.test(raw), "manifest must not contain provider API key-shaped values");
assert(!/AKIA[0-9A-Z]{16}/.test(raw), "manifest must not contain AWS access-key-shaped values");

const manifest = readJson(manifestPath);

assert(manifest.id === "seis-pr0-foundation-staging-pathspec", "manifest id mismatch");
assert(manifest.status === "active-local-staging-boundary", "manifest status mismatch");
assert(manifest.visibility === "public-safe", "manifest must be public-safe");
assert(manifest.sourceOfTruth === "content/development/seis-clean-worktree-transition-ledger.json", "sourceOfTruth must point to clean-worktree ledger");
assert(repoPathExists(manifest.sourceOfTruth), "sourceOfTruth path must exist");
assert(manifest.activeSlice === "pr0-foundation-manifest-package", "active slice must be PR0");
assert(manifest.qualityGate === "node scripts/check-seis-pr0-foundation-staging-pathspec.mjs", "qualityGate must be a direct node command");
assert(manifest.cleanWorktreeClaimAllowed === false, "manifest must not allow clean-worktree claims");
assert(manifest.stageCommandPolicy?.mode === "exact-pathspec-only", "stage command policy must be exact-pathspec-only");
assert(manifest.stageCommandPolicy?.forbidden?.includes("git add ."), "manifest must forbid git add .");

const pathspecSafeInclude = manifest.pathspecSafeInclude || [];
const controlPaths = manifest.controlPathsAllowedWhenValidatingThisLedger || [];
const hunkOnly = manifest.hunkReviewOnly || [];
const mustRemainUnstaged = manifest.mustRemainUnstaged || [];
const allowedStagedPaths = new Set([...pathspecSafeInclude, ...controlPaths]);

assert(Array.isArray(pathspecSafeInclude) && pathspecSafeInclude.length >= 18, "pathspecSafeInclude must list PR0 paths");
assert(Array.isArray(controlPaths) && controlPaths.includes("content/development/seis-pr0-foundation-staging-pathspec.json"), "control paths must include this manifest");
assert(Array.isArray(hunkOnly) && hunkOnly.includes("docs/INDEX.md"), "hunkReviewOnly must include docs/INDEX.md");
assert(Array.isArray(mustRemainUnstaged), "mustRemainUnstaged must be an array");

for (const requiredPath of [
  "content/development/seis-source-provenance-intake.json",
  "content/development/seis-five-year-agency-orchestration-contract.json",
  "content/development/seis-mcp-permission-risk-matrix.json",
  "content/development/seis-stitch-ux-screen-catalog.json",
  "content/development/seis-swift-apple-bridge-manifest.json",
  "scripts/check-seis-source-provenance-intake.mjs",
  "scripts/check-seis-five-year-agency-orchestration-contract.mjs",
  "scripts/check-seis-mcp-permission-risk-matrix.mjs",
  "scripts/check-seis-stitch-ux-screen-catalog.mjs",
  "scripts/check-seis-swift-apple-bridge-manifest.mjs"
]) {
  assert(pathspecSafeInclude.includes(requiredPath), `pathspecSafeInclude must include ${requiredPath}`);
}

for (const requiredPath of [...pathspecSafeInclude, ...controlPaths]) {
  assert(repoPathExists(requiredPath), `stageable/control path must exist: ${requiredPath}`);
}

for (const forbiddenPath of [
  "package.json",
  "apps/seis-demo-web/script.js",
  "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleContinuationWindow.swift",
  "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAppleNativeShellShowcaseView.swift",
  "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformPolicyTests.swift"
]) {
  assert(mustRemainUnstaged.includes(forbiddenPath), `mustRemainUnstaged must include ${forbiddenPath}`);
  assert(!pathspecSafeInclude.includes(forbiddenPath), `pathspecSafeInclude must not include ${forbiddenPath}`);
  assert(!controlPaths.includes(forbiddenPath), `control paths must not include ${forbiddenPath}`);
}

for (const hunkOnlyPath of hunkOnly) {
  assert(!pathspecSafeInclude.includes(hunkOnlyPath), `hunk-only path must not be pathspec-safe: ${hunkOnlyPath}`);
}

assert(manifest.enterpriseDirection?.claimBoundary?.includes("not a market-share"), "enterprise direction must avoid market-share overclaim");
assert(manifest.installedToolAndPluginUse?.blocked?.includes("blindly enabling every plugin"), "plugin policy must block blind plugin enablement");
assert(manifest.installedToolAndPluginUse?.blocked?.includes("claiming a tool was used when it was not"), "plugin policy must block fake tool usage claims");
assert(manifest.validation?.includes("npm run check:js"), "validation must include adjacent npm/js check");
assert(manifest.validation?.includes("node --test packages/seis-ai/test/mcp-smoke.test.mjs"), "validation must include local MCP smoke");

const cachedPaths = execFileSync("git", ["diff", "--cached", "--name-only"], {
  cwd: repoRoot,
  encoding: "utf8"
}).split("\n").filter(Boolean);

for (const stagedPath of cachedPaths) {
  assert(allowedStagedPaths.has(stagedPath), `staged path is outside PR0/control pathspec: ${stagedPath}`);
}

const forbiddenStatusPaths = [
  "package.json",
  "apps/seis-demo-web/script.js",
  "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleContinuationWindow.swift",
  "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAppleNativeShellShowcaseView.swift",
  "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformPolicyTests.swift"
];

const forbiddenStatus = execFileSync("git", ["status", "--porcelain=v1", "--", ...forbiddenStatusPaths], {
  cwd: repoRoot,
  encoding: "utf8"
});

for (const line of forbiddenStatus.split("\n").filter(Boolean)) {
  const indexStatus = line.at(0);
  assert(indexStatus === " " || indexStatus === "?", `forbidden path must remain unstaged: ${line}`);
}

assert(manifest.truthBoundary?.includes("does not stage files"), "truth boundary must say the manifest does not stage files");
assert(manifest.truthBoundary?.includes("does not authorize staging unrelated dirty work"), "truth boundary must block unrelated staging");

if (failures.length > 0) {
  console.error("SEIS PR0 foundation staging pathspec check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEIS PR0 foundation staging pathspec check passed: ${pathspecSafeInclude.length} PR0 paths, ${controlPaths.length} control paths.`);
