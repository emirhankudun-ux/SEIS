#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "audits");
const OUT_JSON = path.join(OUT_DIR, "git-secret-history-scan.json");
const OUT_MD = path.join(OUT_DIR, "GIT_SECRET_HISTORY_SCAN.md");
const CHECK_MODE = process.argv.includes("--check");
const GENERATED_AT = "2026-06-29";
const MAX_BLOB_SIZE = 1_000_000;

const skipPathParts = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  "coverage",
  "vendor",
  "releases",
]);

const allowedExtensions = new Set([
  ".cjs",
  ".conf",
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
  ".sql",
  ".swift",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

const hardcodedPatterns = [
  ["ssh_private_key_block", /-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----/],
  ["github_token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/],
  ["openai_like_key", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["anthropic_like_key", /\bsk-ant-[A-Za-z0-9_-]{20,}\b/],
  ["google_api_key", /\bAIza[A-Za-z0-9_-]{20,}\b/],
  ["aws_access_key_id", /\bAKIA[0-9A-Z]{16}\b/],
  ["slack_token", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
];

const assignmentPattern =
  /\b(OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|AWS_SECRET_ACCESS_KEY|PRIVATE_KEY|GITHUB_TOKEN|CLOUDFLARE_API_TOKEN|VERCEL_TOKEN|NETLIFY_AUTH_TOKEN|PASSWORD|TOKEN|SECRET)\b\s*[:=]\s*["']?([^"',\s#)]+)/i;

const failures = [];
const revList = gitText(["rev-list", "--objects", "--all"]);
const historyEntries = parseHistoryEntries(revList);
const objectInfos = getObjectInfos([...historyEntries.keys()]);
const eligibleOids = objectInfos
  .filter((item) => item.type === "blob" && item.size <= MAX_BLOB_SIZE && historyEntries.has(item.oid))
  .map((item) => item.oid);
const report = scanHistory(eligibleOids, historyEntries, objectInfos);
const renderedJson = `${JSON.stringify(report, null, 2)}\n`;
const renderedMarkdown = renderMarkdown(report);

if (CHECK_MODE) {
  if (!existsSync(OUT_JSON) || readFileSync(OUT_JSON, "utf8") !== renderedJson) {
    failures.push(`${toRel(OUT_JSON)} is out of date; run npm run scan:git-secret-history`);
  }
  if (!existsSync(OUT_MD) || readFileSync(OUT_MD, "utf8") !== renderedMarkdown) {
    failures.push(`${toRel(OUT_MD)} is out of date; run npm run scan:git-secret-history`);
  }
  for (const finding of report.findings) {
    failures.push(`${finding.path}:${finding.line} has ${finding.type}; value intentionally omitted`);
  }

  if (failures.length > 0) {
    console.error("SEIS git secret history check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    `SEIS git secret history check passed. Inspected ${report.inspectedBlobs} history blobs. Findings without values: 0.`,
  );
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, renderedJson);
writeFileSync(OUT_MD, renderedMarkdown);

console.log(`Git secret history scan written: ${toRel(OUT_MD)}`);
console.log(`Git secret history scan JSON written: ${toRel(OUT_JSON)}`);
console.log(`History blobs inspected: ${report.inspectedBlobs}`);
console.log(`Secret findings without values: ${report.findings.length}`);

function parseHistoryEntries(text) {
  const entries = new Map();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const match = line.match(/^([0-9a-f]{40,64})(?:\s+(.+))?$/);
    if (!match || !match[2]) continue;
    const oid = match[1];
    const rel = match[2];
    if (!shouldInspectPath(rel)) continue;
    if (!entries.has(oid)) entries.set(oid, new Set());
    entries.get(oid).add(rel);
  }
  return entries;
}

function getObjectInfos(oids) {
  if (oids.length === 0) return [];
  const output = gitText(["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)"], `${oids.join("\n")}\n`);
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [oid, type, size] = line.split(" ");
      return { oid, type, size: Number(size) };
    });
}

function scanHistory(oids, pathsByOid, objectInfos) {
  const infoByOid = new Map(objectInfos.map((item) => [item.oid, item]));
  const findings = [];
  let inspectedBlobs = 0;
  let skippedBinaryBlobs = 0;
  const skippedLargeBlobs = objectInfos.filter((item) => item.type === "blob" && item.size > MAX_BLOB_SIZE).length;

  if (oids.length > 0) {
    const output = gitBuffer(["cat-file", "--batch"], `${oids.join("\n")}\n`);
    let offset = 0;
    while (offset < output.length) {
      const headerEnd = output.indexOf(10, offset);
      if (headerEnd === -1) break;
      const header = output.subarray(offset, headerEnd).toString("utf8");
      offset = headerEnd + 1;
      const [oid, type, sizeText] = header.split(" ");
      const size = Number(sizeText);
      const body = output.subarray(offset, offset + size);
      offset += size + 1;

      if (type !== "blob") continue;
      if (body.indexOf(0) !== -1) {
        skippedBinaryBlobs += 1;
        continue;
      }

      inspectedBlobs += 1;
      const text = body.toString("utf8");
      const paths = [...(pathsByOid.get(oid) || [])].sort();
      scanText({ oid, paths, text, findings });
    }
  }

  return {
    generatedAt: GENERATED_AT,
    mode: "redacted_git_history_secret_scan",
    commitCount: Number(gitText(["rev-list", "--count", "HEAD"]).trim() || 0),
    historyObjectsConsidered: pathsByOid.size,
    inspectedBlobs,
    skippedLargeBlobs,
    skippedBinaryBlobs,
    maxBlobSizeBytes: MAX_BLOB_SIZE,
    findings,
    findingCount: findings.length,
    secretValuesPrinted: false,
    limitations: [
      "This scan covers reachable Git history objects and text-like tracked blobs under the configured size limit.",
      "It does not replace external secret-scanning services, credential provider audit logs, or key rotation review.",
      "Findings intentionally omit matched values.",
    ],
    scannedExtensions: [...allowedExtensions].sort(),
    skippedPathParts: [...skipPathParts].sort(),
    largestInspectedBlobBytes: Math.max(
      0,
      ...[...infoByOid.values()]
        .filter((item) => item.type === "blob" && item.size <= MAX_BLOB_SIZE)
        .map((item) => item.size),
    ),
  };
}

function scanText({ oid, paths, text, findings }) {
  const lines = text.split(/\r?\n/);
  const primaryPath = paths[0] || "<unknown>";
  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    if (shouldIgnoreLine(line)) continue;

    for (const [type, pattern] of hardcodedPatterns) {
      if (pattern.test(line)) {
        findings.push(finding({ type, oid, path: primaryPath, line: lineNumber, paths }));
      }
    }

    const assignment = line.match(assignmentPattern);
    if (assignment && isSuspiciousAssignmentValue(assignment[2], line)) {
      findings.push(finding({ type: "non_empty_secret_assignment", oid, path: primaryPath, line: lineNumber, paths }));
    }
  }
}

function finding({ type, oid, path: relPath, line, paths }) {
  return {
    type,
    severity: type === "ssh_private_key_block" ? "critical" : "high",
    blob: oid.slice(0, 12),
    path: relPath,
    line,
    additionalPaths: paths.filter((item) => item !== relPath).slice(0, 5),
    value: "intentionally omitted",
  };
}

function shouldInspectPath(rel) {
  if (rel.startsWith("docs/audits/")) return false;
  if (rel === "scripts/check-git-secret-history.mjs") return false;
  if (rel.startsWith("apps/web/public/media/")) return false;
  if (rel.split("/").some((part) => skipPathParts.has(part))) return false;
  const basename = path.basename(rel);
  if (basename === ".DS_Store") return false;
  const ext = path.extname(basename);
  return allowedExtensions.has(ext) || basename === "Dockerfile";
}

function shouldIgnoreLine(line) {
  if (/^\s*regex\s*=/.test(line)) {
    return true;
  }
  if (/hardcodedPatterns|assignmentPattern|secretFindings|sensitivePatterns|private_key_block/i.test(line)) {
    return true;
  }
  if (/value intentionally omitted|intentionally omitted|redacted|placeholder|example/i.test(line)) {
    return true;
  }
  if (/process\.env|os\.environ|getenv\(|envValue\(/i.test(line)) {
    return true;
  }
  if (/\/.*(BEGIN|OPENAI_API_KEY|github_pat_|ghp_|sk-).*\//.test(line)) {
    return true;
  }
  return false;
}

function isSuspiciousAssignmentValue(value, line) {
  if (!value) return false;
  if (/^(<|REDACTED|redacted|placeholder|example|not-needed|not_required|null|undefined|false|true)$/i.test(value)) {
    return false;
  }
  if (/^\$\{?[A-Z0-9_]+\}?$/i.test(value)) {
    return false;
  }
  if (/^(npm|github\/|policyVersion|check:|##|none|local-demo)$/i.test(value)) {
    return false;
  }
  if (/^sk-/.test(value)) {
    return value.length >= 20 && !/(x{2,}|\.{2,}|example|placeholder)/i.test(value);
  }
  if (/^(gh[pousr]_|github_pat_)/.test(value)) {
    return value.length >= 24 && !/(x{2,}|\.{2,}|example|placeholder)/i.test(value);
  }
  if (/^xox[baprs]-/.test(value)) {
    return value.length >= 24 && !/(x{2,}|\.{2,}|example|placeholder)/i.test(value);
  }
  if (/^AKIA/.test(value)) {
    return /^AKIA[0-9A-Z]{16}$/.test(value);
  }
  if (/^AIza/.test(value)) {
    return value.length >= 24 && !/(x{2,}|\.{2,}|example|placeholder)/i.test(value);
  }
  if (/^(ya29\.|pk_live_|rk_live_|sk_live_)/.test(value)) {
    return value.length >= 24 && !/(x{2,}|\.{2,}|example|placeholder)/i.test(value);
  }
  return value.length >= 24 && /[A-Za-z]/.test(value) && /\d/.test(value) && !/[<>\s]/.test(value) && !line.includes("includes(");
}

function renderMarkdown(report) {
  const findingRows = report.findings.map((item) => [
    item.type,
    item.severity,
    item.path,
    String(item.line),
    item.blob,
    "value intentionally omitted",
  ]);

  return `# Git Secret History Scan

Date: ${report.generatedAt}

## Purpose

This is a redacted local Git history scan for public-readiness review. It scans
reachable text-like tracked blobs for high-risk secret patterns without printing
matched values.

## Scope

- Commits counted: ${report.commitCount}
- History objects considered: ${report.historyObjectsConsidered}
- Text blobs inspected: ${report.inspectedBlobs}
- Binary blobs skipped: ${report.skippedBinaryBlobs}
- Large blobs skipped: ${report.skippedLargeBlobs}
- Maximum blob size: ${report.maxBlobSizeBytes} bytes

## Findings

${report.findings.length === 0 ? "No secret-like values were reported by this scan." : table(["Type", "Severity", "Path", "Line", "Blob", "Value"], findingRows)}

## Limitations

${report.limitations.map((item) => `- ${item}`).join("\n")}

## Security Boundary

This report is safe to commit only because it omits matched values. If future
findings appear, rotate any real exposed credential and review the referenced
path and blob out of band without pasting the secret into issues, pull requests,
docs, or chat.
`;
}

function table(headers, rows) {
  const escapeCell = (value) => String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
  return [
    `| ${headers.map(escapeCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
  ].join("\n");
}

function gitText(args, input) {
  const result = spawnSync("git", args, {
    cwd: ROOT,
    input,
    encoding: "utf8",
    maxBuffer: 200 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
  return result.stdout;
}

function gitBuffer(args, input) {
  const result = spawnSync("git", args, {
    cwd: ROOT,
    input,
    maxBuffer: 400 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.toString("utf8")}`);
  }
  return result.stdout;
}

function toRel(fullPath) {
  return path.relative(ROOT, fullPath).split(path.sep).join("/");
}
