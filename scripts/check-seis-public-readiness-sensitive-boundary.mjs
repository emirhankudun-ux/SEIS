#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const maxBytes = 1_000_000;

const textExtensions = new Set([
  ".cjs",
  ".css",
  ".env",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".py",
  ".sh",
  ".swift",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);

const textBasenames = new Set([
  ".env.example",
  ".gitignore",
  "CODEOWNERS",
  "Dockerfile",
  "LICENSE",
  "SECURITY.md",
  "SUPPORT.md"
]);

const sensitivePatterns = [
  ["ssh_private_key_block", /-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----/],
  ["github_token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/],
  ["openai_like_key", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["anthropic_like_key", /\bsk-ant-[A-Za-z0-9_-]{20,}\b/],
  ["google_api_key", /\bAIza[A-Za-z0-9_-]{20,}\b/],
  ["aws_access_key_id", /\bAKIA[0-9A-Z]{16}\b/],
  ["slack_token", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/]
];

const assignmentPattern =
  /\b(OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|AWS_SECRET_ACCESS_KEY|PRIVATE_KEY|GITHUB_TOKEN|CLOUDFLARE_API_TOKEN|VERCEL_TOKEN|NETLIFY_AUTH_TOKEN|PASSWORD|TOKEN|SECRET)\b\s*[:=]\s*["']?([^"',\s#)]+)/i;

const matrix = readJson("content/development/seis-public-readiness-status.json");
const packageJson = readJson("package.json");
const surfaces = Array.isArray(matrix?.surfaces) ? matrix.surfaces : [];
const scannedFiles = new Set();
const skippedFiles = [];
const findings = [];

ensure(
  packageJson?.scripts?.["check:seis-public-readiness-sensitive-boundary"] ===
    "node scripts/check-seis-public-readiness-sensitive-boundary.mjs",
  "package.json must expose check:seis-public-readiness-sensitive-boundary"
);

for (const surface of surfaces) {
  for (const evidence of surface.evidence || []) {
    scanEvidence(surface.id, evidence);
  }
}

if (findings.length > 0) {
  for (const finding of findings) {
    failures.push(`${finding.surface}:${finding.file}:${finding.line} has ${finding.type}; value intentionally omitted`);
  }
}

if (failures.length > 0) {
  console.error("SEIS public readiness sensitive-boundary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `SEIS public readiness sensitive-boundary check passed: ${surfaces.length} surfaces, ${scannedFiles.size} evidence files scanned, ${skippedFiles.length} large/binary files skipped, findings without values: 0.`
);

function scanEvidence(surfaceId, evidence) {
  if (typeof evidence !== "string" || !evidence || evidence.includes("://") || isAbsolute(evidence)) {
    failures.push(`${surfaceId} evidence must be a repo-local path: ${evidence}`);
    return;
  }

  const absolutePath = resolve(root, evidence.replace(/\/+$/, ""));
  if (!isInsideRoot(absolutePath)) {
    failures.push(`${surfaceId} evidence path must stay inside repo root: ${evidence}`);
    return;
  }

  if (!existsSync(absolutePath)) {
    failures.push(`${surfaceId} evidence path missing: ${evidence}`);
    return;
  }

  const stats = statSync(absolutePath);
  if (stats.isDirectory()) {
    for (const file of walk(absolutePath)) {
      scanFile(surfaceId, file);
    }
    return;
  }

  if (stats.isFile()) {
    scanFile(surfaceId, absolutePath);
  }
}

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(absolutePath));
      continue;
    }
    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }
  return files;
}

function scanFile(surfaceId, absolutePath) {
  const relativePath = toRepoPath(absolutePath);
  if (scannedFiles.has(relativePath)) {
    return;
  }

  if (!isTextCandidate(absolutePath)) {
    skippedFiles.push(relativePath);
    return;
  }

  const text = readFileSafe(absolutePath);
  if (text === null) {
    skippedFiles.push(relativePath);
    return;
  }

  scannedFiles.add(relativePath);
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (shouldIgnoreLine(line)) {
      continue;
    }

    for (const [type, pattern] of sensitivePatterns) {
      if (pattern.test(line)) {
        findings.push({ surface: surfaceId, file: relativePath, line: index + 1, type });
      }
    }

    const assignment = line.match(assignmentPattern);
    if (assignment && isSuspiciousAssignmentValue(assignment[2], line)) {
      findings.push({ surface: surfaceId, file: relativePath, line: index + 1, type: "non_empty_secret_assignment" });
    }
  }
}

function isTextCandidate(absolutePath) {
  const stats = statSync(absolutePath);
  if (!stats.isFile() || stats.size > maxBytes) {
    return false;
  }

  const basename = absolutePath.split("/").at(-1);
  return textBasenames.has(basename) || textExtensions.has(extname(basename));
}

function readFileSafe(absolutePath) {
  try {
    const text = readFileSync(absolutePath, "utf8");
    if (text.includes("\u0000")) {
      return null;
    }
    return text;
  } catch {
    return null;
  }
}

function shouldIgnoreLine(line) {
  return /intentionally omitted|value intentionally omitted|redacted|placeholder|example|process\.env|os\.environ|getenv\(|envValue\(/i.test(line)
    || /sensitivePatterns|assignmentPattern|secretFindings|hardcodedPatterns|private_key_block/i.test(line)
    || /\/.*(BEGIN|OPENAI_API_KEY|github_pat_|ghp_|sk-).*\//.test(line);
}

function isSuspiciousAssignmentValue(value, line) {
  if (!value) {
    return false;
  }

  if (/^(<|REDACTED|redacted|placeholder|example|not-needed|not_required|null|undefined|false|true|none|local-demo)$/i.test(value)) {
    return false;
  }

  if (/^\$\{?[A-Z0-9_]+\}?$/i.test(value) || /^(npm|github\/|policyVersion|check:|##)$/i.test(value)) {
    return false;
  }

  if (/^sk-/.test(value)) {
    return value.length >= 20 && !/(x{2,}|\.{2,}|example|placeholder)/i.test(value);
  }

  if (/^(gh[pousr]_|github_pat_|xox[baprs]-|AKIA|AIza|ya29\.|pk_live_|rk_live_|sk_live_)/.test(value)) {
    return value.length >= 24 && !/(x{2,}|\.{2,}|example|placeholder)/i.test(value);
  }

  return value.length >= 24 && /[A-Za-z]/.test(value) && /\d/.test(value) && !/[<>\s]/.test(value) && !line.includes("includes(");
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

function toRepoPath(absolutePath) {
  return absolutePath.slice(root.length + 1).split("/").join("/");
}

function isInsideRoot(absolutePath) {
  const fromRoot = relative(root, absolutePath);
  return fromRoot === "" || (!fromRoot.startsWith("..") && !isAbsolute(fromRoot));
}
