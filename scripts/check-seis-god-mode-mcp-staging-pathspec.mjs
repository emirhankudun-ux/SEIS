#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const pathspecPath = "content/development/seis-god-mode-mcp-staging-pathspec.json";
const docsPath = "docs/development/seis-god-mode-mcp-staging-pathspec.md";
const failures = [];

function fail(message) {
  failures.push(message);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function readText(repoPath) {
  const filePath = path.join(repoRoot, repoPath);
  if (!existsSync(filePath)) {
    fail(`missing ${repoPath}`);
    return "";
  }
  return readFileSync(filePath, "utf8");
}

function readJson(repoPath) {
  const text = readText(repoPath);
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON in ${repoPath}: ${error.message}`);
    return {};
  }
}

function includesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
}

function ensureNoSecretsOrLocalPaths(text, label) {
  ensure(!/\/Users\/[A-Za-z0-9._-]+\/[^\s"'`<>]+/.test(text), `${label} must not contain concrete local absolute paths`);
  ensure(!/BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY/.test(text), `${label} must not contain private key markers`);
  ensure(!/sk-[A-Za-z0-9_-]{16,}/.test(text), `${label} must not contain provider API key-shaped values`);
  ensure(!/AKIA[0-9A-Z]{16}/.test(text), `${label} must not contain AWS access-key-shaped values`);
  ensure(!/ghp_[A-Za-z0-9_]{20,}/.test(text), `${label} must not contain GitHub token-shaped values`);
  ensure(!/github_pat_[A-Za-z0-9_]{20,}/.test(text), `${label} must not contain GitHub fine-grained token-shaped values`);
  ensure(!/xox[baprs]-[A-Za-z0-9-]{10,}/.test(text), `${label} must not contain Slack token-shaped values`);
}

const rawPathspec = readText(pathspecPath);
const docs = readText(docsPath);
const pathspec = readJson(pathspecPath);

ensureNoSecretsOrLocalPaths(rawPathspec, pathspecPath);
ensureNoSecretsOrLocalPaths(docs, docsPath);

ensure(pathspec.id === "seis-god-mode-mcp-staging-pathspec", "pathspec id mismatch");
ensure(pathspec.status === "active-local-staging-boundary", "pathspec status mismatch");
ensure(pathspec.visibility === "public-safe", "pathspec must be public-safe");
ensure(pathspec.activeSlice === "god-mode-mcp-prerequisite", "active slice mismatch");
ensure(pathspec.qualityGate === "node scripts/check-seis-god-mode-mcp-staging-pathspec.mjs", "quality gate mismatch");
ensure(pathspec.stagedBoundaryGate === "node scripts/check-seis-god-mode-mcp-staged-boundary.mjs", "staged boundary gate mismatch");
ensure(pathspec.cleanWorktreeClaimAllowed === false, "clean worktree claims must remain disabled");

for (const phrase of [
  "does not prove live AI",
  "720B weights",
  "AGI capability",
  "provider calls",
  "SSH/cloud provisioning",
  "deployment",
  "GitHub mutation",
  "production readiness",
  "always-on background agents"
]) {
  ensure(String(pathspec.claimBoundary || "").includes(phrase), `claim boundary missing ${phrase}`);
}

ensure(pathspec.expectedIntermediateMcpSnapshot?.toolCount === 35, "expected tool count must be 35");
ensure(pathspec.expectedIntermediateMcpSnapshot?.resourceCount === 29, "expected resource count must be 29");
ensure(pathspec.expectedIntermediateMcpSnapshot?.promptCount === 3, "expected prompt count must be 3");
ensure(
  pathspec.expectedIntermediateMcpSnapshot?.smokeTest === "node --test packages/seis-ai/test/mcp-smoke.test.mjs",
  "expected smoke test mismatch"
);

includesAll(pathspec.stageCommandPolicy?.forbidden, [
  "git add .",
  "git add docs",
  "git add scripts",
  "git add packages",
  "git add content/development",
  "git add package.json",
  "git add apps"
], "stageCommandPolicy.forbidden");

includesAll(pathspec.pathspecSafeInclude, [
  "content/development/seis-god-mode-mcp-staging-pathspec.json",
  "docs/development/seis-god-mode-mcp-staging-pathspec.md",
  "scripts/check-seis-god-mode-mcp-staging-pathspec.mjs",
  "scripts/check-seis-god-mode-mcp-staged-boundary.mjs"
], "pathspecSafeInclude");

includesAll(pathspec.candidateHunkReviewOnly, [
  "content/development/seis-ai-core-mcp-runtime-contract.json",
  "content/development/seis-agent-plugin-integration.json",
  "packages/seis-ai/src/lib/plugin-integration.mjs",
  "packages/seis-ai/src/mcp/server.mjs",
  "packages/seis-ai/test/mcp-smoke.test.mjs",
  "scripts/create-seis-command-center-god-mode-status.mjs"
], "candidateHunkReviewOnly");

includesAll(pathspec.mustRemainUnstagedUntilSeparatePr, [
  "package.json",
  "apps/seis-demo-web/script.js",
  "apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json",
  "apps/web/",
  "apps/seis-core/",
  "deploy/",
  ".github/",
  "reports/",
  "packages/seis-ai/downloadable/",
  "packages/seis-ai/models/nvidia-nim-run-anywhere-downloadable-registry.json",
  "docs/reviews/NVIDIA_SKILLS_DOWNLOADABLE_CATALOG_QA.md",
  "scripts/check-seis-ai-nvidia-skills-downloadable.mjs",
  "content/development/seis-720b-agi-frontier-boundary.json",
  "content/development/seis-ai-core-subagent-swarm-round-ledger.json",
  "content/development/seis-ai-core-subagent-round-execution-evidence-ledger.json",
  "content/development/seis-ai-truth-boundary-language-policy.json",
  "scripts/check-seis-720b-agi-frontier-boundary.mjs",
  "scripts/check-seis-ai-core-subagent-swarm-round-ledger.mjs",
  "scripts/check-seis-ai-core-subagent-round-execution-evidence-ledger.mjs",
  "scripts/check-seis-ai-truth-boundary-language.mjs"
], "mustRemainUnstagedUntilSeparatePr");

includesAll(pathspec.allowedGodModeMarkers, [
  "GOD_MODE_STATUS_TOOL",
  "GOD_MODE_STATUS_RESOURCE_URI",
  "god-mode-status",
  "seis_god_mode_status",
  "seis://agent/god-mode-status.json"
], "allowedGodModeMarkers");

includesAll(pathspec.forbiddenPayloadMarkers, [
  "seis://ai/720b-agi-frontier-boundary.json",
  "seis://ai/subagent-swarm-round-ledger.json",
  "seis://ai/subagent-round-execution-evidence-ledger.json",
  "AI_CORE_720B_AGI_FRONTIER_BOUNDARY",
  "SUBAGENT_SWARM_ROUND_LEDGER",
  "SUBAGENT_ROUND_EXECUTION_EVIDENCE_LEDGER",
  "seis-ai-core-subagent-swarm-round-ledger",
  "seis-ai-core-subagent-round-execution-evidence-ledger",
  "nvidia-nim-run-anywhere-downloadable-registry",
  "check:seis-public-readiness-lanes",
  "check:seis-public-readiness-evidence",
  "check:seis-public-readiness-sensitive-boundary",
  "intake:third-party"
], "forbiddenPayloadMarkers");

includesAll(pathspec.validation, [
  "node scripts/check-seis-god-mode-mcp-staging-pathspec.mjs",
  "node scripts/check-seis-god-mode-mcp-staged-boundary.mjs",
  "node scripts/check-seis-ai-truth-boundary-core.mjs",
  "git diff --cached --check",
  "focused secret-shaped scan over staged God Mode MCP paths"
], "validation");

for (const repoPath of pathspec.pathspecSafeInclude || []) {
  ensure(existsSync(path.join(repoRoot, repoPath)), `pathspec-safe file missing: ${repoPath}`);
}

for (const phrase of [
  "# SEIS God Mode MCP Staging Pathspec",
  "Tool count: `35`",
  "Resource count: `29`",
  "does not prove live AI",
  "node scripts/check-seis-god-mode-mcp-staging-pathspec.mjs",
  "node scripts/check-seis-god-mode-mcp-staged-boundary.mjs"
]) {
  ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
}

if (failures.length > 0) {
  console.error("SEIS God Mode MCP staging pathspec check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS God Mode MCP staging pathspec check passed.");
