#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const collaborationPath = "data/seis-installed-ai-collaboration.json";
const packagePath = "package.json";
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    fail(`missing ${filePath}`);
    return {};
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`invalid JSON in ${filePath}: ${error.message}`);
    return {};
  }
}

function arrayFor(value) {
  return Array.isArray(value) ? value : [];
}

const collaboration = readJson(collaborationPath);
const packageJson = readJson(packagePath);
const collaborationText = JSON.stringify(collaboration);

if (collaboration.id !== "seis-installed-ai-collaboration") {
  fail("collaboration id must be seis-installed-ai-collaboration");
}

if (collaboration.status !== "local-observed-partial") {
  fail("collaboration status must be local-observed-partial");
}

if (collaboration.mode !== "safe-readiness-and-review-attempts") {
  fail("collaboration mode must be safe-readiness-and-review-attempts");
}

if (packageJson.scripts?.["check:seis-installed-ai-collaboration"] !== "node scripts/check-seis-installed-ai-collaboration.mjs") {
  fail("package.json must expose check:seis-installed-ai-collaboration");
}

if (!`${packageJson.scripts?.["check:seis-ai-local-integration"] ?? ""}`.includes("check:seis-installed-ai-collaboration")) {
  fail("check:seis-ai-local-integration must include installed AI collaboration check");
}

const helpers = new Map(arrayFor(collaboration.helpers).map((helper) => [helper.id, helper]));

for (const helperId of ["codex", "claude", "gemini", "qwen", "opencode", "ollama"]) {
  const helper = helpers.get(helperId);
  if (!helper) {
    fail(`missing helper ${helperId}`);
    continue;
  }

  if (helper.detected !== true) {
    fail(`${helperId} must be marked detected`);
  }

  for (const field of ["displayName", "command", "version", "role", "reviewAttemptStatus", "safeUse"]) {
    if (!helper[field]) {
      fail(`${helperId} missing ${field}`);
    }
  }
}

if (helpers.get("codex")?.reviewAttemptStatus !== "active-current-session") {
  fail("codex must be recorded as active current session");
}

for (const helperId of ["claude", "gemini", "qwen"]) {
  const status = `${helpers.get(helperId)?.reviewAttemptStatus ?? ""}`;
  if (!status.startsWith("blocked-")) {
    fail(`${helperId} blocked auth state must be explicit`);
  }
}

if (!arrayFor(helpers.get("ollama")?.localModelsObserved).includes("gemma4:latest")) {
  fail("ollama must record observed local gemma4 model");
}

if (helpers.get("ollama")?.reviewAttemptStatus !== "aborted-output-not-accepted") {
  fail("ollama review attempt must be recorded as aborted, not accepted");
}

for (const boundary of [
  "No external AI helper was given secrets, private keys, tokens, .env contents, host credentials, deployment authority, or broad repository dumps.",
  "No blocked or aborted helper output is treated as validation success.",
  "Installed AI collaboration is advisory and remains subordinate to SEIS governance, local validators, tests, and human review."
]) {
  if (!arrayFor(collaboration.nonClaimBoundaries).includes(boundary)) {
    fail(`missing nonClaimBoundary: ${boundary}`);
  }
}

for (const command of [
  "npm run check:seis-installed-ai-collaboration",
  "npm run check:seis-ai-activation-matrix",
  "npm run check:seis-ai-local-integration"
]) {
  if (!arrayFor(collaboration.validation).includes(command)) {
    fail(`collaboration validation missing ${command}`);
  }
}

for (const forbidden of [
  /\/Users\//,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])gh[pousr]_[A-Za-z0-9_]{20,}/
]) {
  if (forbidden.test(collaborationText)) {
    fail(`collaboration contains forbidden sensitive or machine-specific pattern: ${forbidden}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS installed AI collaboration check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS installed AI collaboration check passed.");
