#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const contractPath = "content/development/seis-github-merge-gates.json";
const docsPath = "docs/governance/seis-github-merge-gates.md";
const packagePath = "package.json";

const contract = readJson(contractPath, "merge gate contract");
const docs = readText(docsPath, "merge gate docs");
const packageJson = readJson(packagePath, "package.json");

if (contract) {
  ensure(contract.id === "seis-github-merge-gates", "contract id mismatch");
  ensure(contract.status === "active-governance-evidence", "contract status must be active-governance-evidence");
  ensure(contract.qualityGate === "npm run check:seis-github-merge-gates", "quality gate mismatch");
  ensure(contract.sourceOfTruth?.repository === "emirhankudun-ux/SEIS", "repository source mismatch");
  ensure(contract.sourceOfTruth?.branch === "main", "branch source mismatch");
  ensure(contract.sourceOfTruth?.documentation === docsPath, "documentation source mismatch");
  ensure(contract.sourceOfTruth?.validator === "scripts/check-seis-github-merge-gates.mjs", "validator source mismatch");

  ensure(contract.mergePolicy?.mainDirectPushAllowed === false, "main direct push must be disallowed");
  ensure(contract.mergePolicy?.forcePushAllowed === false, "force push must be disallowed");
  ensure(contract.mergePolicy?.adminBypassAllowedForCodex === false, "Codex admin bypass must be disallowed");
  ensure(contract.mergePolicy?.autoMergeAllowedAfterRequirements === true, "auto-merge should be allowed only after requirements");
  ensure(contract.mergePolicy?.preferredMergeMethod === "squash", "preferred merge method must be squash");
  ensure(contract.mergePolicy?.humanReviewRequired === true, "human review must be required");
  ensureArrayIncludesAll(contract.mergePolicy?.allowedMergeMethods, ["merge", "squash", "rebase"], "allowed merge methods");

  const rules = new Map((contract.requiredRules || []).map((rule) => [rule.type, rule]));
  for (const type of ["pull_request", "required_signatures", "required_linear_history", "code_scanning", "code_quality", "deletion", "non_fast_forward", "creation", "update"]) {
    ensure(Boolean(rules.get(type)), `missing required rule ${type}`);
  }
  const pullRequest = rules.get("pull_request");
  ensure(pullRequest?.requiredApprovingReviewCount >= 10, "pull request rule must require at least 10 reviews");
  ensure(pullRequest?.requireCodeOwnerReview === true, "code owner review must be required");
  ensure(pullRequest?.requireLastPushApproval === true, "last push approval must be required");
  ensure(pullRequest?.requiredReviewThreadResolution === true, "review thread resolution must be required");
  ensure(pullRequest?.dismissStaleReviewsOnPush === true, "stale reviews must dismiss on push");

  const codeScanning = rules.get("code_scanning");
  ensure(codeScanning?.tool === "CodeQL", "code scanning tool must be CodeQL");
  ensure(codeScanning?.alertsThreshold === "errors", "CodeQL alerts threshold must be errors");
  ensure(codeScanning?.securityAlertsThreshold === "high_or_higher", "CodeQL security threshold must be high_or_higher");

  const examples = Array.isArray(contract.blockedPrExamples) ? contract.blockedPrExamples : [];
  ensure(examples.length >= 2, "blocked PR examples must include at least two records");
  for (const example of examples) {
    ensure(example.autoMergeEnabled === true, `PR ${example.pr} must record auto-merge enabled`);
    ensure(example.mergeStateStatus === "BLOCKED", `PR ${example.pr} must record blocked merge state`);
    ensure(typeof example.likelyRemainingGate === "string" && example.likelyRemainingGate.includes("review"), `PR ${example.pr} must mention review gate`);
  }

  ensureArrayIncludesAll(contract.safeOperatorActions, [
    "Keep work on short-lived feature branches.",
    "Open focused PRs with validation and rollback notes.",
    "Enable auto-merge after PR creation when branch policy allows it.",
  ], "safe operator actions");
  ensureArrayIncludesAll(contract.forbiddenForCodex, [
    "admin merge bypass",
    "force push",
    "direct push to main",
    "branch protection weakening",
    "history rewrite",
  ], "forbidden actions");
}

for (const token of [
  "Source of truth: `content/development/seis-github-merge-gates.json`",
  "Validator: `npm run check:seis-github-merge-gates`",
  "Auto-merge is a queue request, not a permission bypass.",
  "10 approving reviews",
  "Code owner review is required.",
  "Last-push approval is required.",
  "Do not use admin merge bypass",
]) {
  ensure(docs.includes(token), `docs missing token: ${token}`);
}

ensure(
  packageJson?.scripts?.["check:seis-github-merge-gates"] === "node scripts/check-seis-github-merge-gates.mjs",
  "package.json must expose check:seis-github-merge-gates"
);

if (failures.length) {
  console.error("SEIS GitHub merge gates check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS GitHub merge gates check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function readJson(relativePath, label) {
  const filePath = path.join(root, ...relativePath.split("/"));
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, ...relativePath.split("/"));
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}
