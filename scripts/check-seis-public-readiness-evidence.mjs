#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const failures = [];

const matrixPath = "content/development/seis-public-readiness-status.json";
const packageJsonPath = "package.json";
const matrix = readJson(matrixPath);
const packageJson = readJson(packageJsonPath);
const scripts = packageJson?.scripts || {};
const surfaces = Array.isArray(matrix?.surfaces) ? matrix.surfaces : [];

ensure(
  scripts["check:seis-public-readiness-evidence"] ===
    "node scripts/check-seis-public-readiness-evidence.mjs",
  "package.json must expose check:seis-public-readiness-evidence"
);

ensure(matrix?.id === "seis-public-readiness-status", "matrix id must be seis-public-readiness-status");
ensure(surfaces.length > 0, "matrix must include public-readiness surfaces");

let evidenceCount = 0;
let npmCheckCount = 0;
let externalCheckCount = 0;

for (const surface of surfaces) {
  ensure(typeof surface.id === "string" && surface.id.length > 0, "each surface must have an id");
  ensure(Array.isArray(surface.evidence), `${surface.id} evidence must be an array`);
  ensure(Array.isArray(surface.requiredChecks), `${surface.id} requiredChecks must be an array`);

  for (const evidence of surface.evidence || []) {
    evidenceCount += 1;
    validateEvidence(surface.id, evidence);
  }

  for (const check of surface.requiredChecks || []) {
    if (check.startsWith("npm run ")) {
      npmCheckCount += 1;
      validateNpmCheck(surface.id, check);
    } else {
      externalCheckCount += 1;
      validateExternalCheck(surface.id, check);
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS public readiness evidence check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `SEIS public readiness evidence check passed: ${surfaces.length} surfaces, ${evidenceCount} evidence links, ${npmCheckCount} npm checks, ${externalCheckCount} external checks.`
);

function validateEvidence(surfaceId, evidence) {
  ensure(typeof evidence === "string" && evidence.length > 0, `${surfaceId} has empty evidence entry`);

  if (!evidence || evidence.includes("://") || isAbsolute(evidence)) {
    failures.push(`${surfaceId} evidence must be a repo-local path: ${evidence}`);
    return;
  }

  const normalized = evidence.replace(/\/+$/, "");
  const absolutePath = resolve(root, normalized);
  ensure(isInsideRoot(absolutePath), `${surfaceId} evidence path must stay inside repo root: ${evidence}`);
  if (!isInsideRoot(absolutePath)) {
    return;
  }

  ensure(existsSync(absolutePath), `${surfaceId} evidence path missing: ${evidence}`);

  if (existsSync(absolutePath)) {
    const stat = statSync(absolutePath);
    ensure(stat.isFile() || stat.isDirectory(), `${surfaceId} evidence must be file or directory: ${evidence}`);
  }
}

function validateNpmCheck(surfaceId, check) {
  const scriptName = check
    .slice("npm run ".length)
    .trim()
    .split(/\s+/)[0];

  ensure(Boolean(scriptName), `${surfaceId} npm check is missing script name`);
  ensure(Boolean(scripts[scriptName]), `${surfaceId} references missing package script: ${check}`);
}

function validateExternalCheck(surfaceId, check) {
  if (check === "swift test --package-path packages/seis_platform_swift") {
    ensure(
      existsSync(resolve(root, "packages", "seis_platform_swift", "Package.swift")),
      `${surfaceId} Swift package check requires packages/seis_platform_swift/Package.swift`
    );
    return;
  }

  failures.push(`${surfaceId} uses unsupported non-npm public-readiness check: ${check}`);
}

function readJson(file) {
  const absolutePath = resolve(root, file);
  if (!existsSync(absolutePath)) {
    failures.push(`missing ${file}`);
    return null;
  }

  try {
    return JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    failures.push(`${file} must be valid JSON: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function isInsideRoot(absolutePath) {
  const fromRoot = relative(root, absolutePath);
  return fromRoot === "" || (!fromRoot.startsWith("..") && !isAbsolute(fromRoot));
}
