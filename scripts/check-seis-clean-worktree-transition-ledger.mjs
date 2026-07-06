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

function sliceById(ledger, id) {
  return (ledger.reviewSlices || []).find((slice) => slice.id === id) || {};
}

function includesPath(slice, candidate) {
  return (slice.includePaths || []).includes(candidate) || (slice.includePathPrefixes || []).includes(candidate);
}

function assertRepoPathExists(repoRelativePath) {
  assert(fs.existsSync(path.join(repoRoot, repoRelativePath)), `referenced path must exist: ${repoRelativePath}`);
}

const raw = readText(ledgerPath);
assert(!/\/Users\/|~\/|[A-Za-z]:\\/.test(raw), "ledger must not commit local absolute paths");
assert(!raw.includes("BEGIN PRIVATE KEY"), "ledger must not contain private key blocks");
assert(!/sk-[A-Za-z0-9_-]{16,}/.test(raw), "ledger must not contain provider API key-shaped values");

const ledger = readJson(ledgerPath);

assert(ledger.id === "seis-clean-worktree-transition-ledger", "ledger id mismatch");
assert(ledger.visibility === "public-safe", "ledger must be public-safe");
assert(ledger.qualityGate === "node scripts/check-seis-clean-worktree-transition-ledger.mjs", "quality gate must be direct node command");
assert(ledger.sourceOfTruth === "content/development/seis-pr0-pr1-pr2-implementation-sequence.json", "ledger must point at PR0/PR1/PR2 sequence source of truth");
assertRepoPathExists(ledger.sourceOfTruth);
assert(ledger.pr0StagingPathspec === "content/development/seis-pr0-foundation-staging-pathspec.json", "ledger must point at PR0 staging pathspec");
assertRepoPathExists(ledger.pr0StagingPathspec);
assert(ledger.pr0StagedBoundaryGate === "node scripts/check-seis-pr0-staged-boundary.mjs", "ledger must expose PR0 staged boundary gate");
assertRepoPathExists("scripts/check-seis-pr0-staged-boundary.mjs");
assert(ledger.activeSlice === "pr0-foundation-manifest-package", "active slice must remain PR0 until explicitly advanced");
assert(ledger.cleanWorktreeClaimAllowed === false, "ledger must not allow clean-worktree claims yet");
assert(ledger.currentState?.completionClaim === "not-clean-yet", "ledger must not claim clean worktree completion");
assert(ledger.singleWriterPolicy?.writer === "Codex", "ledger must keep Codex as writer");
assert(ledger.singleWriterPolicy?.subagents === "read-only-reviewers", "subagents must remain read-only reviewers");
assert(ledger.singleWriterPolicy?.noOverwriteUserWork === true, "ledger must protect user work");
assert(Array.isArray(ledger.reviewSlices) && ledger.reviewSlices.length >= 4, "ledger must define review slices");
assert(Array.isArray(ledger.quarantineGroups) && ledger.quarantineGroups.length >= 5, "ledger must define quarantine groups");
assert(Array.isArray(ledger.includeAfterValidation), "ledger must define includeAfterValidation");
assert(Array.isArray(ledger.stackedAfterPr0), "ledger must define stackedAfterPr0");
assert(Array.isArray(ledger.plannedLater), "ledger must define plannedLater");
assert(Array.isArray(ledger.excludedUntilExplicitReview), "ledger must define excludedUntilExplicitReview");
assert(Array.isArray(ledger.blockedActions) && ledger.blockedActions.includes("git reset --hard"), "ledger must block destructive reset");
assert(ledger.blockedActions?.includes("bulk add all"), "ledger must block bulk add all");
assert(ledger.truthBoundary?.includes("does not claim the worktree is clean today"), "truth boundary must avoid clean-worktree overclaim");

const requiredSlices = [
  "pr0-foundation-manifest-package",
  "pr1-swift-model-foundation",
  "pr0-pr1-roadmap-splice",
  "pr2-web-demo-visibility-data-first"
];

for (const id of requiredSlices) {
  assert(sliceById(ledger, id).id === id, `missing review slice ${id}`);
}

const pr0 = sliceById(ledger, "pr0-foundation-manifest-package");
const pr1 = sliceById(ledger, "pr1-swift-model-foundation");
const coordination = sliceById(ledger, "pr0-pr1-roadmap-splice");
const pr2 = sliceById(ledger, "pr2-web-demo-visibility-data-first");

for (const requiredPath of [
  "content/development/seis-source-provenance-intake.json",
  "scripts/check-seis-source-provenance-intake.mjs",
  "docs/decisions/adr-0005-seis-source-provenance-intake.md"
]) {
  assert(includesPath(pr0, requiredPath), `PR0 slice must include ${requiredPath}`);
  assertRepoPathExists(requiredPath);
}

for (const requiredPath of ledger.includeAfterValidation || []) {
  assert(includesPath(pr0, requiredPath), `includeAfterValidation path must stay in PR0 slice: ${requiredPath}`);
  assertRepoPathExists(requiredPath);
}

for (const requiredPath of [
  "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisMCPPermissionRiskRecord.swift",
  "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisStitchModuleFamily.swift",
  "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisFoundationManifestLoadingTests.swift"
]) {
  assert(includesPath(pr1, requiredPath), `PR1 slice must include ${requiredPath}`);
  assert((ledger.stackedAfterPr0 || []).includes(requiredPath), `PR1 path must be stackedAfterPr0: ${requiredPath}`);
  assertRepoPathExists(requiredPath);
}

for (const requiredPath of [
  "content/development/seis-clean-worktree-transition-ledger.json",
  "content/development/seis-pr0-foundation-staging-pathspec.json",
  "scripts/check-seis-clean-worktree-transition-ledger.mjs",
  "scripts/check-seis-pr0-foundation-staging-pathspec.mjs",
  "scripts/check-seis-pr0-staged-boundary.mjs",
  "docs/development/seis-clean-worktree-transition-ledger.md",
  "docs/development/seis-pr0-foundation-staging-pathspec.md"
]) {
  assert(includesPath(coordination, requiredPath), `coordination slice must include ${requiredPath}`);
  assertRepoPathExists(requiredPath);
}

for (const protectedPath of [
  "package.json",
  "apps/seis-demo-web/script.js",
  "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleContinuationWindow.swift",
  "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAppleNativeShellShowcaseView.swift",
  "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformPolicyTests.swift"
]) {
  assert(pr0.blockedPaths?.includes(protectedPath), `PR0 must block ${protectedPath}`);
  assert((ledger.excludedUntilExplicitReview || []).includes(protectedPath), `ledger must keep ${protectedPath} excluded until explicit review`);
  assert(!includesPath(pr0, protectedPath), `PR0 must not include ${protectedPath}`);
}

for (const protectedPath of [
  "package.json",
  "apps/seis-demo-web/script.js",
  "packages/seis_platform_swift/Package.swift"
]) {
  assert(pr1.blockedPaths?.includes(protectedPath), `PR1 must block ${protectedPath}`);
  assert(!includesPath(pr1, protectedPath), `PR1 must not include ${protectedPath}`);
}

try {
  const forbiddenStatus = execFileSync("git", [
    "status",
    "--porcelain=v1",
    "--",
    "package.json",
    "apps/seis-demo-web/script.js"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  for (const line of forbiddenStatus.split("\n").filter(Boolean)) {
    const indexStatus = line.at(0);
    assert(indexStatus === " " || indexStatus === "?", `forbidden path must not be staged: ${line}`);
  }
} catch (error) {
  fail(`could not inspect forbidden staged paths: ${error.message}`);
}

assert(pr2.blockedPaths?.includes("apps/seis-demo-web/script.js"), "PR2 must keep existing dirty web script approval-gated");
assert(pr2.validation?.includes("no-key/fake-live scan"), "PR2 must include no-key/fake-live scan");

const quarantineIds = new Set((ledger.quarantineGroups || []).map((group) => group.id));
for (const id of [
  "large-reference-downloadables",
  "ai-runtime-and-mcp-implementation",
  "web-and-product-ui",
  "ssh-cloud-and-deploy",
  "github-governance-and-ci",
  "generated-reports"
]) {
  assert(quarantineIds.has(id), `missing quarantine group ${id}`);
}

const largeReference = (ledger.quarantineGroups || []).find((group) => group.id === "large-reference-downloadables") || {};
assert(largeReference.riskLevel === "high", "large reference/downloadables quarantine must be high risk");
assert(largeReference.pathPrefixes?.includes("packages/seis-ai/downloadable/"), "downloadable tree must be quarantined");

assert(Array.isArray(ledger.cleanupSequence) && ledger.cleanupSequence.length === 5, "cleanup sequence must define five ordered steps");
assert(ledger.cleanupSequence.at(-1)?.action.includes("git status --short is empty"), "final cleanup step must require empty git status");
assert(pr0.validation?.includes("npm run check:js"), "PR0 validation must include adjacent npm/js check");
assert(pr0.validation?.includes("node --test packages/seis-ai/test/mcp-smoke.test.mjs"), "PR0 validation must include local MCP smoke");

if (failures.length > 0) {
  console.error("SEIS clean worktree transition ledger check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS clean worktree transition ledger check passed.");
