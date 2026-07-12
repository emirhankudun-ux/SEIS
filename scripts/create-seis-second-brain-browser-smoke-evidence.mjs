#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createSourceDigest as createSharedSourceDigest, sourcePaths } from "./lib/browser-smoke-evidence-digest.mjs";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const shouldWrite = Boolean(args.write);
const shouldCheck = Boolean(args.check);
const maxEvidenceAgeMs = 36 * 60 * 60 * 1000;
const paths = {
  smokeScript: "scripts/check-seis-second-brain-browser-smoke.mjs",
  outputJson: typeof args.output === "string" ? args.output : "reports/seis-public-demo/second-brain-browser-smoke-evidence-latest.json",
  outputMarkdown: typeof args.markdown === "string" ? args.markdown : "reports/seis-public-demo/second-brain-browser-smoke-evidence-latest.md"
};
const failures = [];

if (shouldWrite && shouldCheck) failures.push("Use either --write or --check, not both.");

if (shouldWrite && failures.length === 0) {
  const smoke = runBrowserSmoke();
  if (smoke) {
    const report = buildReport(smoke);
    validateReport(report, "generated browser-smoke evidence");
    if (failures.length === 0) {
      const jsonWritten = writeJson(paths.outputJson, report);
      const markdownWritten = jsonWritten && writeText(paths.outputMarkdown, renderMarkdown(report));
      if (jsonWritten && markdownWritten && failures.length === 0) {
        console.log(`Wrote ${paths.outputJson}`);
        console.log(`Wrote ${paths.outputMarkdown}`);
      }
    }
  }
}

if (shouldCheck && failures.length === 0) {
  ensureFile(paths.outputJson, "Second Brain browser-smoke evidence JSON");
  ensureFile(paths.outputMarkdown, "Second Brain browser-smoke evidence Markdown");
  const report = readJson(paths.outputJson, "Second Brain browser-smoke evidence JSON");
  const markdown = readText(paths.outputMarkdown, "Second Brain browser-smoke evidence Markdown");
  if (report) validateReport(report, "existing browser-smoke evidence");
  for (const phrase of [
    "SEIS Second Brain Browser Smoke Evidence",
    "passed-local-browser-smoke",
    "@seis-code",
    "sourceDigest",
    "providerCallsPerformed: false",
    "githubMutationPerformed: false"
  ]) {
    ensure(markdown.includes(phrase), `browser-smoke evidence Markdown missing phrase: ${phrase}.`);
  }
}

if (!shouldWrite && !shouldCheck && failures.length === 0) {
  console.log(JSON.stringify({
    id: "seis-second-brain-browser-smoke-evidence-pr54",
    sourcePaths,
    sourceDigest: createSourceDigest(),
    command: "npm run report:seis-second-brain-browser-smoke-evidence",
    checkCommand: "npm run check:seis-second-brain-browser-smoke-evidence"
  }, null, 2));
}

if (failures.length > 0) {
  console.error("SEIS Second Brain browser-smoke evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (shouldCheck) console.log("SEIS Second Brain browser-smoke evidence check passed.");

function runBrowserSmoke() {
  const result = spawnSync(process.execPath, [paths.smokeScript], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  if (result.status !== 0) {
    failures.push(`browser smoke failed with status ${result.status ?? "unknown"}.`);
    return null;
  }
  try {
    const parsed = JSON.parse(result.stdout || "{}");
    ensure(parsed.ok === true, "browser smoke must report ok true.");
    return parsed;
  } catch (error) {
    failures.push(`browser smoke did not emit valid JSON: ${error.message}`);
    return null;
  }
}

function buildReport(smoke) {
  const secondBrain = smoke.secondBrain || {};
  const mobile = smoke.mobile || {};
  return {
    id: "seis-second-brain-browser-smoke-evidence-pr54",
    title: "SEIS Second Brain Browser Smoke Evidence",
    generatedAt: new Date().toISOString(),
    status: "passed-local-browser-smoke",
    mode: "repo-local-chrome-smoke-evidence",
    ok: true,
    source: {
      paths: sourcePaths,
      sourceDigest: createSourceDigest(),
      sourceRevision: readGitRevision(),
      sourcePathsCleanBeforeRun: sourcePathsAreClean()
    },
    runtime: {
      browser: smoke.browser ? path.basename(smoke.browser) : "unknown",
      desktopScreenshot: toRepositoryRelativePath(secondBrain.screenshot),
      mobileScreenshot: toRepositoryRelativePath(mobile.screenshot)
    },
    result: {
      appCount: Number(secondBrain.initial?.appCount || 0),
      pluginGraphActions: Number(secondBrain.initial?.pluginGraphActions || 0),
      pluginHandoff: secondBrain.pluginHandoff?.graphPlugin || "",
      persistedPluginHandoff: secondBrain.persistence?.selectedPluginId || "",
      desktopHorizontalOverflow: Boolean(secondBrain.initial?.horizontalOverflow),
      mobileAppCount: Number(mobile.appCount || 0),
      mobileCrampedTargets: Number(mobile.crampedTargets || 0),
      mobileHorizontalOverflow: Boolean(mobile.horizontalOverflow)
    },
    safetyBoundary: {
      privateObsidianVaultReadPerformed: false,
      providerCallsPerformed: false,
      credentialValidationPerformed: false,
      sshExecuted: false,
      deploymentPerformed: false,
      githubMutationPerformed: false,
      autonomousWriteExecutionPerformed: false
    }
  };
}

function validateReport(report, label) {
  ensure(report?.id === "seis-second-brain-browser-smoke-evidence-pr54", `${label} id mismatch.`);
  ensure(report?.title === "SEIS Second Brain Browser Smoke Evidence", `${label} title mismatch.`);
  ensure(report?.status === "passed-local-browser-smoke", `${label} status mismatch.`);
  ensure(report?.mode === "repo-local-chrome-smoke-evidence", `${label} mode mismatch.`);
  ensure(report?.ok === true, `${label} must report ok true.`);
  ensure(JSON.stringify(report?.source?.paths || []) === JSON.stringify(sourcePaths), `${label} source paths mismatch.`);
  ensure(report?.source?.sourceDigest === createSourceDigest(), `${label} source digest is stale.`);
  ensure(report?.source?.sourcePathsCleanBeforeRun === true, `${label} must run with clean browser-smoke source paths.`);
  const generatedAt = Date.parse(report?.generatedAt || "");
  ensure(Number.isFinite(generatedAt), `${label} generatedAt is invalid.`);
  ensure(Number.isFinite(generatedAt) && Date.now() - generatedAt <= maxEvidenceAgeMs, `${label} is older than 36 hours.`);
  ensure(report?.result?.appCount >= 50, `${label} Desktop app count is too low.`);
  ensure(report?.result?.pluginGraphActions === 5, `${label} must capture five plugin graph handoff actions.`);
  ensure(report?.result?.pluginHandoff === "seis-code", `${label} must capture the @seis-code graph handoff.`);
  ensure(report?.result?.persistedPluginHandoff === "seis-code", `${label} must capture persisted @seis-code handoff state.`);
  ensure(report?.result?.desktopHorizontalOverflow === false, `${label} Desktop must not overflow horizontally.`);
  ensure(report?.result?.mobileAppCount >= 50, `${label} mobile app count is too low.`);
  ensure(report?.result?.mobileCrampedTargets === 0, `${label} mobile target audit must have zero cramped controls.`);
  ensure(report?.result?.mobileHorizontalOverflow === false, `${label} mobile must not overflow horizontally.`);
  for (const key of [
    "privateObsidianVaultReadPerformed",
    "providerCallsPerformed",
    "credentialValidationPerformed",
    "sshExecuted",
    "deploymentPerformed",
    "githubMutationPerformed",
    "autonomousWriteExecutionPerformed"
  ]) {
    ensure(report?.safetyBoundary?.[key] === false, `${label} safetyBoundary.${key} must be false.`);
  }
  const serialized = JSON.stringify(report);
  ensure(!serialized.includes("/Users/"), `${label} must not contain absolute private paths.`);
  ensure(!/\/home\/(?!seis\/)[^"/]+/.test(serialized), `${label} must not contain Linux absolute private home paths.`);
  ensure(!/[A-Za-z]:\\+Users\\+/.test(serialized), `${label} must not contain Windows absolute private paths.`);
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), `${label} must not contain OpenAI-style API keys.`);
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), `${label} must not contain private keys.`);
}

function createSourceDigest() {
  return createSharedSourceDigest((filePath) => readText(filePath, `browser-smoke source ${filePath}`));
}

function sourcePathsAreClean() {
  const result = spawnSync("git", ["status", "--short", "--", ...sourcePaths], {
    cwd: root,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    failures.push("unable to inspect browser-smoke source path status.");
    return false;
  }
  return !(result.stdout || "").trim();
}

function readGitRevision() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
  return result.status === 0 ? (result.stdout || "").trim() : "unknown";
}

function toRepositoryRelativePath(filePath) {
  if (!filePath) return null;
  const absolutePath = path.resolve(filePath);
  const relativePath = path.relative(root, absolutePath);
  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) return null;
  return relativePath;
}

function renderMarkdown(report) {
  return `# SEIS Second Brain Browser Smoke Evidence

Generated: ${report.generatedAt}
Status: ${report.status}
Mode: ${report.mode}
sourceDigest: ${report.source.sourceDigest}
sourceRevision: ${report.source.sourceRevision}
sourcePathsCleanBeforeRun: ${report.source.sourcePathsCleanBeforeRun}

## Runtime Result

| Signal | Value |
| --- | --- |
| Browser | ${report.runtime.browser} |
| Desktop app count | ${report.result.appCount} |
| Plugin graph handoff actions | ${report.result.pluginGraphActions} |
| Focused plugin handoff | @${report.result.pluginHandoff} |
| Persisted plugin handoff | @${report.result.persistedPluginHandoff} |
| Desktop horizontal overflow | ${report.result.desktopHorizontalOverflow} |
| Mobile cramped targets | ${report.result.mobileCrampedTargets} |
| Mobile horizontal overflow | ${report.result.mobileHorizontalOverflow} |

## Safety Boundary

- privateObsidianVaultReadPerformed: ${report.safetyBoundary.privateObsidianVaultReadPerformed}
- providerCallsPerformed: ${report.safetyBoundary.providerCallsPerformed}
- credentialValidationPerformed: ${report.safetyBoundary.credentialValidationPerformed}
- sshExecuted: ${report.safetyBoundary.sshExecuted}
- deploymentPerformed: ${report.safetyBoundary.deploymentPerformed}
- githubMutationPerformed: ${report.safetyBoundary.githubMutationPerformed}
- autonomousWriteExecutionPerformed: ${report.safetyBoundary.autonomousWriteExecutionPerformed}
`;
}

function parseArgs(values) {
  return values.reduce((acc, value, index) => {
    if (!value.startsWith("--")) return acc;
    const key = value.slice(2);
    const next = values[index + 1];
    acc[key] = next && !next.startsWith("--") ? next : true;
    return acc;
  }, {});
}

function safeOutputPath(filePath) {
  const absolutePath = path.resolve(root, filePath);
  const relativePath = path.relative(root, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    failures.push(`refusing to write outside repository: ${filePath}`);
    return path.join(root, "reports", "seis-public-demo", "second-brain-browser-smoke-evidence-refused-output.txt");
  }
  return absolutePath;
}

function writeJson(filePath, value) {
  if (failures.length > 0) return false;
  const failureCount = failures.length;
  const absolutePath = safeOutputPath(filePath);
  if (failures.length > failureCount) return false;
  try {
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
    return true;
  } catch (error) {
    recordWriteFailure("JSON", absolutePath, error);
    return false;
  }
}

function writeText(filePath, value) {
  if (failures.length > 0) return false;
  const failureCount = failures.length;
  const absolutePath = safeOutputPath(filePath);
  if (failures.length > failureCount) return false;
  try {
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, value);
    return true;
  } catch (error) {
    recordWriteFailure("Markdown", absolutePath, error);
    return false;
  }
}

function recordWriteFailure(kind, absolutePath, error) {
  const code = error && typeof error === "object" ? error.code || error.name || "unknown" : "unknown";
  failures.push(`${kind} evidence write failed for ${path.relative(root, absolutePath)} (${code}).`);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${label}: ${filePath}`);
    return "";
  }
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    failures.push(`unable to read ${label}: ${error.message}`);
    return "";
  }
}

function readJson(filePath, label) {
  const text = readText(filePath, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`invalid JSON in ${label}: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
