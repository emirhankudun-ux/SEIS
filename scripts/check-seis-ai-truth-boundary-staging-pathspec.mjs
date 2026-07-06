#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

const file = "content/development/seis-ai-truth-boundary-staging-pathspec.json";
const failures = [];

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readJson(path) {
  if (!existsSync(path)) {
    failures.push(`missing ${path}`);
    return {};
  }

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    failures.push(`invalid JSON in ${path}: ${error.message}`);
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

const pathspec = readJson(file);
const serialized = JSON.stringify(pathspec);
const localUserPathMarker = ["/", "Users", "/"].join("");
const privateKeyMarker = ["BEGIN", "PRIVATE KEY"].join(" ");

ensure(pathspec.id === "seis-ai-truth-boundary-staging-pathspec", "pathspec id mismatch");
ensure(pathspec.status === "blocked-until-hunk-review-and-status-alignment", "pathspec must remain blocked until hunk review and status alignment");
ensure(pathspec.visibility === "public-safe", "pathspec must be public-safe");
ensure(pathspec.activeSlice === "ai-truth-boundary-and-supervised-subagent-ledgers", "active slice mismatch");
ensure(pathspec.qualityGate === "node scripts/check-seis-ai-truth-boundary-staging-pathspec.mjs", "quality gate mismatch");
ensure(pathspec.cleanWorktreeClaimAllowed === false, "pathspec must not claim a clean worktree");
ensure(String(pathspec.claimBoundary || "").includes("does not prove live AI"), "claim boundary must block live AI claims");
ensure(String(pathspec.claimBoundary || "").includes("720B weights"), "claim boundary must block 720B weights claims");
ensure(String(pathspec.claimBoundary || "").includes("AGI capability"), "claim boundary must block AGI claims");

includesAll(pathspec.stageCommandPolicy?.forbidden, [
  "git add .",
  "git add docs",
  "git add scripts",
  "git add packages",
  "git add reports",
  "git add content/development"
], "stageCommandPolicy.forbidden");

includesAll(pathspec.pathspecSafeCoreInclude, [
  "content/development/seis-720b-agi-frontier-boundary.json",
  "content/development/seis-ai-core-subagent-swarm-round-ledger.json",
  "content/development/seis-ai-core-subagent-round-execution-evidence-ledger.json",
  "content/development/seis-ai-truth-boundary-language-policy.json",
  "scripts/check-seis-720b-agi-frontier-boundary.mjs",
  "scripts/check-seis-ai-core-subagent-swarm-round-ledger.mjs",
  "scripts/check-seis-ai-core-subagent-round-execution-evidence-ledger.mjs",
  "scripts/check-seis-ai-truth-boundary-language.mjs"
], "pathspecSafeCoreInclude");

includesAll(pathspec.integrationHunkReviewOnly, [
  "package.json",
  "content/development/seis-ai-core-mcp-runtime-contract.json",
  "content/development/seis-agent-plugin-integration.json",
  "content/development/seis-sub-agent-5-year-plan.json",
  "content/development/seis-ai-core-subagent-operating-model.json",
  "packages/seis-ai/src/lib/plugin-integration.mjs",
  "packages/seis-ai/src/mcp/server.mjs",
  "packages/seis-ai/test/mcp-smoke.test.mjs",
  "reports/seis-sub-agent-five-year-demo-evidence.json",
  "reports/seis-sub-agent-five-year-demo-evidence.md",
  "apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json",
  "docs/ai/seis-model-scaling.md",
  "docs/ai/seis-ai-core.md",
  "docs/STATUS.md"
], "integrationHunkReviewOnly");

includesAll(pathspec.mustRemainUnstagedUntilSeparatePr, [
  "packages/seis-ai/downloadable/",
  "packages/seis-ai/models/nvidia-nim-run-anywhere-downloadable-registry.json",
  "docs/reviews/NVIDIA_SKILLS_DOWNLOADABLE_CATALOG_QA.md",
  "scripts/check-seis-ai-nvidia-skills-downloadable.mjs",
  "apps/web/",
  "apps/seis-core/",
  "deploy/",
  ".github/",
  "apps/seis-demo-web/script.js"
], "mustRemainUnstagedUntilSeparatePr");

const blockerIds = new Set((pathspec.knownBlockers || []).map((blocker) => blocker.id));
for (const id of [
  "status-doc-resource-count-drift",
  "package-json-mixed-hunks",
  "web-report-qa-permission-blocker"
]) {
  ensure(blockerIds.has(id), `knownBlockers missing ${id}`);
}

includesAll(pathspec.validation, [
  "node scripts/check-seis-ai-truth-boundary-staging-pathspec.mjs",
  "npm run check:seis-720b-agi-frontier-boundary",
  "npm run check:seis-ai-core-subagent-swarm-round-ledger",
  "npm run check:seis-ai-core-subagent-round-execution-evidence-ledger",
  "npm run check:seis-ai-truth-boundary-language",
  "node --test packages/seis-ai/test/mcp-smoke.test.mjs",
  "focused secret-shaped scan over staged AI truth-boundary paths",
  "git diff --cached --check"
], "validation");

ensure(!serialized.includes(localUserPathMarker), "pathspec must not contain machine-local user paths");
ensure(!serialized.includes(privateKeyMarker), "pathspec must not contain private key markers");
ensure(!/sk-[A-Za-z0-9_-]{16,}/.test(serialized), "pathspec must not contain provider API key-shaped values");
ensure(!/AKIA[0-9A-Z]{16}/.test(serialized), "pathspec must not contain AWS access-key-shaped values");

if (failures.length > 0) {
  console.error("SEIS AI truth-boundary staging pathspec check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS AI truth-boundary staging pathspec check passed.");
