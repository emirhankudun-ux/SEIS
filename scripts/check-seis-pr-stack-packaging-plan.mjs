#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const files = {
  plan: "content/development/seis-pr-stack-packaging-plan.json",
  doc: "docs/development/seis-pr-stack-packaging-plan.md",
  index: "docs/INDEX.md",
  nextQueue: "docs/roadmap/NEXT_PR_QUEUE.md"
};

const command = "node scripts/check-seis-pr-stack-packaging-plan.mjs";
const failures = [];

function fail(message) {
  failures.push(message);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function readText(file) {
  if (!existsSync(file)) {
    fail(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(file) {
  const text = readText(file);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON in ${file}: ${error.message}`);
    return {};
  }
}

function sliceById(plan, id) {
  return (plan.slices || []).find((slice) => slice.id === id) || {};
}

function pathMatches(candidate, rule) {
  return (rule.paths || []).includes(candidate) ||
    (rule.pathPrefixes || []).some((prefix) => candidate.startsWith(prefix));
}

function classifyPath(candidate, classifications) {
  return classifications.find((rule) => pathMatches(candidate, rule));
}

function git(args) {
  try {
    return {
      ok: true,
      stdout: execFileSync("git", args, {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"]
      })
    };
  } catch (error) {
    return {
      ok: false,
      stdout: "",
      error
    };
  }
}

const planText = readText(files.plan);
const docText = readText(files.doc);
const indexText = readText(files.index);
const nextQueueText = readText(files.nextQueue);
const plan = readJson(files.plan);

ensure(plan.id === "seis-pr-stack-packaging-plan", "plan id mismatch");
ensure(plan.visibility === "public-safe", "plan must be public-safe");
ensure(plan.status === "active-local-packaging-guard", "plan status mismatch");
ensure(plan.branchStack?.currentBranchRequiresStackedPrPackaging === true, "current branch must require stacked PR packaging");
ensure(plan.branchStack?.doNotOpenCurrentBranchAsSinglePr2DataOnly === true, "current branch must not be opened as single PR2 data-only");
ensure(plan.branchStack?.comparisonBase === "origin/feature/apple-first-foundation", "comparison base mismatch");
ensure(plan.branchStack?.diffCommand === "git diff --name-status origin/feature/apple-first-foundation...HEAD", "branch diff command mismatch");
ensure(plan.branchStack?.packagingClaim === "branch-stack-not-single-pr2-data-only", "packaging claim mismatch");
ensure(plan.branchStack?.singlePr2DataOnlyClaimAllowed === false, "single PR2 data-only claim must be disabled");
ensure(plan.branchStack?.doNotPushWithoutOwnerApproval === true, "plan must block push without owner approval");
ensure(plan.branchStack?.failOnUnclassifiedChangedPaths === true, "plan must fail on unclassified changed paths");
ensure(plan.branchStack?.failOnDeleteRenameCopy === true, "plan must fail on delete/rename/copy changes");
ensure(plan.branchStack?.requiredPublicStatement === "current branch is a branch stack, not a single PR2 data-only PR", "required public statement mismatch");
ensure(plan.branchStack?.pr2DataOnlyAllowedPaths?.includes("apps/seis-demo-web/data/seis-foundation-dashboard.json"), "strict PR2 allowlist must include dashboard data");
ensure(!plan.branchStack?.pr2DataOnlyAllowedPaths?.includes("apps/seis-demo-web/script.js"), "strict PR2 allowlist must exclude script.js");
ensure(plan.branchStack?.forbiddenIfClaimingSinglePr2?.includes("apps/seis-demo-web/script.js"), "single PR2 forbidden paths must include script.js");
ensure(plan.branchStack?.forbiddenIfClaimingSinglePr2?.includes(".github/"), "single PR2 forbidden paths must include GitHub metadata");
ensure(plan.branchStack?.forbiddenIfClaimingSinglePr2?.includes("deploy/"), "single PR2 forbidden paths must include deploy");
ensure(plan.branchStack?.requiresExplicitOwnerApproval?.some((entry) => entry.includes("provider or live AI")), "approval list must include provider/live AI");
ensure(plan.githubPolicy?.pushAllowedNow === false, "push must be blocked now");
ensure(plan.githubPolicy?.requiresExplicitOwnerApprovalBeforePush === true, "push must require explicit owner approval");
ensure(plan.githubPolicy?.directPushToMainAllowed === false, "direct main push must be blocked");
ensure(plan.githubPolicy?.forcePushAllowed === false, "force push must be blocked");
ensure(plan.githubPolicy?.mergeAllowedNow === false, "merge must be blocked now");
ensure(plan.truthBoundary?.githubPublished === false, "plan must not claim GitHub publication");
ensure(plan.truthBoundary?.singlePrCompletionClaimAllowed === false, "plan must block single-PR completion claims");
ensure(plan.truthBoundary?.liveAiClaimAllowed === false, "plan must block live AI claims");
ensure(plan.truthBoundary?.providerCredentialClaimAllowed === false, "plan must block provider credential claims");
ensure(plan.truthBoundary?.elapsedFiveYearExecutionClaimAllowed === false, "plan must block elapsed five-year execution claims");
ensure(plan.truthBoundary?.subagentRuntimeAutonomyClaimAllowed === false, "plan must block runtime autonomy claims");
ensure(Array.isArray(plan.changedPathClassifications) && plan.changedPathClassifications.length >= 10, "plan must define changed path classifications");
ensure(Boolean(classifyPath("apps/seis-demo-web/script.js", plan.changedPathClassifications || [])), "classifications must cover script.js");
ensure(Boolean(classifyPath("packages/seis-ai/src/mcp/server.mjs", plan.changedPathClassifications || [])), "classifications must cover AI runtime");
ensure(Boolean(classifyPath(".github/workflows/foundation-check.yml", plan.changedPathClassifications || [])), "classifications must cover GitHub workflow paths");

for (const [label, file] of Object.entries(plan.sourceRefs || {})) {
  ensure(typeof file === "string" && file.length > 0, `sourceRefs.${label} must be a path`);
  ensure(existsSync(file), `sourceRefs.${label} path missing: ${file}`);
}

const pr2 = sliceById(plan, "pr2-web-demo-visibility-data-first");
ensure(pr2.status === "data-ready-ui-pending", "PR2 slice must be data-ready-ui-pending");
ensure(pr2.allowedPaths?.includes("apps/seis-demo-web/data/seis-foundation-dashboard.json"), "PR2 allowed paths must include dashboard data");
ensure(pr2.allowedPaths?.includes("scripts/check-seis-demo-foundation-dashboard-boundary.mjs"), "PR2 allowed paths must include boundary checker");
ensure(pr2.blockedPaths?.includes("apps/seis-demo-web/script.js"), "PR2 blocked paths must include existing demo script");
ensure(!pr2.allowedPaths?.includes("apps/seis-demo-web/script.js"), "PR2 allowed paths must not include existing demo script");
ensure(pr2.requiredValidation?.includes("npm run check:seis-demo-foundation-dashboard-boundary"), "PR2 validation must include boundary checker");
ensure(pr2.requiredValidation?.includes("staged path/secret scan"), "PR2 validation must include staged path/secret scan");

ensure(sliceById(plan, "public-readiness-hardening").status === "stacked-local-commits", "public-readiness slice must be stacked-local-commits");
ensure(sliceById(plan, "swift-model-foundation").status === "stacked-local-commits", "Swift model slice must be stacked-local-commits");

ensure(docText.includes(command), "packaging doc must include direct node command");
ensure(docText.includes("not as a PR2 data-only branch"), "packaging doc must warn against single PR2 branch framing");
ensure(docText.includes(plan.branchStack.requiredPublicStatement), "packaging doc must include required public statement");
ensure(indexText.includes("seis-pr-stack-packaging-plan.md"), "docs index must link packaging plan doc");
ensure(indexText.includes("seis-pr-stack-packaging-plan.json"), "docs index must link packaging plan record");
ensure(nextQueueText.includes("seis-pr-stack-packaging-plan.json"), "NEXT_PR_QUEUE must reference packaging plan record");
ensure(nextQueueText.includes("check-seis-pr-stack-packaging-plan.mjs"), "NEXT_PR_QUEUE must reference packaging checker");
ensure(nextQueueText.includes(plan.branchStack.requiredPublicStatement), "NEXT_PR_QUEUE must include required public statement");

for (const secretPattern of [
  /\/Users\//,
  /~\//,
  /BEGIN PRIVATE KEY/,
  /sk-[A-Za-z0-9_-]{16,}/,
  /AKIA[0-9A-Z]{16}/,
  /ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}/
]) {
  ensure(!secretPattern.test(planText), `plan text matches sensitive or local path pattern: ${secretPattern}`);
}

if (existsSync(".git") && plan.branchStack?.baseRef) {
  const base = String(plan.branchStack.comparisonBase || plan.branchStack.baseRef);
  const baseExists = git(["rev-parse", "--verify", `${base}^{commit}`]);
  if (baseExists.ok) {
    const diff = git(["diff", "--name-status", `${base}...HEAD`]);
    if (diff.ok) {
      const branchEntries = diff.stdout
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
      const branchPaths = branchEntries.map((entry) => entry.path);
      const nonPr2Paths = branchPaths.filter((candidate) => !plan.branchStack.pr2DataOnlyAllowedPaths?.includes(candidate));

      if (plan.branchStack.failOnDeleteRenameCopy) {
        for (const entry of branchEntries) {
          ensure(!/^[DRC]/.test(entry.status), `branch diff must not contain delete/rename/copy in packaging guard: ${entry.raw}`);
        }
      }

      if (plan.branchStack.failOnUnclassifiedChangedPaths) {
        for (const entry of branchEntries) {
          ensure(Boolean(classifyPath(entry.path, plan.changedPathClassifications || [])), `branch diff path is unclassified: ${entry.path}`);
        }
      }

      if (nonPr2Paths.length > 0) {
        ensure(plan.branchStack.singlePr2DataOnlyClaimAllowed === false, "non-PR2 paths exist, so single PR2 data-only claim must be false");
        ensure(plan.branchStack.doNotOpenCurrentBranchAsSinglePr2DataOnly === true, "non-PR2 paths exist, so current branch must not be opened as PR2 data-only");
      }

      if (branchPaths.includes("apps/seis-demo-web/script.js")) {
        ensure(
          plan.branchStack.knownNonPr2PathsThatMayExistInBranchDiff?.includes("apps/seis-demo-web/script.js"),
          "branch diff includes apps/seis-demo-web/script.js, so plan must acknowledge it as non-PR2"
        );
        ensure(
          plan.branchStack.doNotOpenCurrentBranchAsSinglePr2DataOnly === true,
          "branch diff includes non-PR2 script.js, so single PR2 framing must be blocked"
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS PR stack packaging plan check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS PR stack packaging plan check passed.");
