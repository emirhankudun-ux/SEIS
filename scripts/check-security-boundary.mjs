#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
let root = process.cwd();

for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === '--root') {
    const value = args[index + 1];
    if (!value) {
      console.error('Security boundary check failed:');
      console.error('- command line: --root requires a path');
      process.exit(1);
    }
    root = value;
    index += 1;
  } else if (argument.startsWith('--root=')) {
    root = argument.slice('--root='.length);
  } else {
    console.error('Security boundary check failed:');
    console.error('- command line: unsupported option');
    process.exit(1);
  }
}

root = resolve(root);
const failures = [];
const cache = new Map();

function fail(path, control) {
  failures.push(`${path}: ${control}`);
}

function read(path) {
  if (cache.has(path)) return cache.get(path);

  const absolutePath = resolve(root, path);
  if (!existsSync(absolutePath)) {
    fail(path, 'missing required file');
    cache.set(path, '');
    return '';
  }

  const contents = readFileSync(absolutePath, 'utf8');
  cache.set(path, contents);
  return contents;
}

function nonCommentLines(contents) {
  return contents
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function markdownHeadings(contents) {
  return new Set(
    contents
      .split(/\r?\n/u)
      .map(line =>
        line
          .match(/^#{2,6}\s+(.+?)\s*#*\s*$/u)?.[1]
          ?.trim()
          .toLowerCase(),
      )
      .filter(Boolean),
  );
}

function requireHeadings(path, requiredHeadings) {
  const headings = markdownHeadings(read(path));
  for (const heading of requiredHeadings) {
    if (!headings.has(heading.toLowerCase())) {
      fail(path, `missing required heading: ${heading}`);
    }
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function hasMarkdownLink(contents, basename) {
  const escaped = escapeRegExp(basename);
  return new RegExp(`\\[[^\\]]+\\]\\([^\\n)]*${escaped}(?:[#?][^\\n)]*)?\\)`, 'u').test(contents);
}

function shellLogicalLines(contents) {
  return contents.replace(/\\\r?\n\s*/gu, ' ').split(/\r?\n/u);
}

function commandHasFlag(contents, commandPattern, flag) {
  return shellLogicalLines(contents)
    .filter(line => commandPattern.test(line))
    .every(line => new RegExp(`(?:^|\\s)${escapeRegExp(flag)}(?:\\s|$)`, 'u').test(line));
}

function topLevelContentsRead(contents) {
  const lines = contents.split(/\r?\n/u);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^permissions:\s*\{[^}]*\bcontents:\s*read\b[^}]*\}\s*$/u.test(line)) return true;
    if (!/^permissions:\s*$/u.test(line)) continue;

    for (let nested = index + 1; nested < lines.length; nested += 1) {
      const nestedLine = lines[nested];
      if (!nestedLine.trim() || nestedLine.trimStart().startsWith('#')) continue;
      if (!/^\s/u.test(nestedLine)) break;
      if (/^\s+contents:\s*read\s*(?:#.*)?$/u.test(nestedLine)) return true;
    }
  }
  return false;
}

const gitignorePath = '.gitignore';
const gitignoreLines = nonCommentLines(read(gitignorePath));
const gitignoreSet = new Set(gitignoreLines);
const requiredIgnoreRules = [
  '.env',
  '.env.*',
  '!.env.example',
  '.seis-secrets/',
  'secrets/',
  '.private/',
  'local-data/',
  'credentials.json',
  'tokens.json',
  '!package-lock.json',
  '*.pem',
  '*.key',
  'id_rsa',
  'id_ed25519',
];

for (const rule of requiredIgnoreRules) {
  if (!gitignoreSet.has(rule)) fail(gitignorePath, `missing required ignore rule: ${rule}`);
}

for (const line of gitignoreLines) {
  if (line.startsWith('!')) continue;
  const normalized = line.replace(/^\/+|\/+$/gu, '');
  if (/^(?:\*\*\/)?\.github(?:\/\*{1,2})?$/u.test(normalized)) {
    fail(gitignorePath, 'broad .github ignore is forbidden');
  }
  if (/^(?:\*\*\/)?scripts\/security(?:\/\*{1,2})?$/u.test(normalized)) {
    fail(gitignorePath, 'broad scripts/security ignore is forbidden');
  }
  if (normalized === 'package-lock.json' || normalized === '**/package-lock.json') {
    fail(gitignorePath, 'package-lock.json ignore is forbidden');
  }
}

for (const rule of [
  '!docs/security/',
  '!docs/security/*.md',
  '!docs/security/**/*.md',
  '!docs/security/hardening/hardening.json',
]) {
  if (!gitignoreSet.has(rule))
    fail(gitignorePath, `missing security documentation unignore: ${rule}`);
}

for (const protectedPath of [
  '.env.example',
  'package-lock.json',
  '.github/workflows/foundation-check.yml',
  '.github/workflows/security-guardian.yml',
  'scripts/security/scan-secrets.sh',
  'docs/security/SECRET_STORAGE.md',
  'docs/security/CREDENTIAL_INCIDENT_RESPONSE.md',
  'docs/security/hardening/hardening.json',
]) {
  const result = spawnSync(
    'git',
    [
      '-c',
      'core.excludesFile=/dev/null',
      'check-ignore',
      '--no-index',
      '--quiet',
      '--',
      protectedPath,
    ],
    { cwd: root, encoding: 'utf8' },
  );
  if (result.status === 0) {
    fail(gitignorePath, `protected path must remain visible: ${protectedPath}`);
  } else if (result.status !== 1) {
    fail(gitignorePath, `unable to verify effective ignore state: ${protectedPath}`);
  }
}

const hardeningArtifactPath = 'docs/security/hardening/hardening.json';
const hardeningArtifactContents = read(hardeningArtifactPath);
try {
  JSON.parse(hardeningArtifactContents);
} catch {
  fail(hardeningArtifactPath, 'hardening artifact must contain valid JSON');
}

const envPath = '.env.example';
const envContents = read(envPath);
const secretLikeKey =
  /(?:API_KEY|AUTH_TOKEN|ACCESS_KEY|CLIENT_SECRET|CREDENTIAL|PASSWORD|PASSWD|PRIVATE_KEY|SECRET|TOKEN)$/iu;

for (const line of envContents.split(/\r?\n/u)) {
  const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=([\s\S]*)$/u);
  if (!match) continue;
  const [, key, rawValue] = match;
  if (secretLikeKey.test(key) && rawValue.trim() !== '') {
    fail(envPath, `secret-like variable must be empty: ${key}`);
  }
}

const secretStoragePath = 'docs/security/SECRET_STORAGE.md';
const incidentPath = 'docs/security/CREDENTIAL_INCIDENT_RESPONSE.md';
const securityPolicyPath = 'docs/SECURITY.md';
const boundaryPath = 'docs/PUBLIC_PRIVATE_BOUNDARY.md';
const baselinePath = 'docs/security/security-baseline.md';

requireHeadings(secretStoragePath, [
  'Purpose',
  'Approved Secret Stores',
  'Ownership And Access',
  'Revocation And Rotation',
  'Redaction And Logging',
  'Server And Browser Boundary',
  'Validation',
]);

requireHeadings(incidentPath, [
  'Purpose',
  'Detection And Triage',
  'Containment',
  'Revocation And Rotation',
  'Access Review',
  'Git History Approval Gate',
  'Notification',
  'Recovery Validation',
  'Post-Incident Review',
  'Evidence And Closure',
  'Known Issue 129 Limitation',
]);

const incidentContents = read(incidentPath);
if (!/(?:Issue\s*#?129|issues\/129)/iu.test(incidentContents)) {
  fail(incidentPath, 'missing Issue 129 limitation reference');
}
if (!/\b(?:open|unresolved|not\s+resolved|residual\s+risk)\b/iu.test(incidentContents)) {
  fail(incidentPath, 'Issue 129 limitation must remain unresolved or explicitly accepted');
}
if (!/\bowner(?:-authorized|\s+approval|\s+authorization)\b/iu.test(incidentContents)) {
  fail(incidentPath, 'Git history action requires owner authorization');
}

const baselineContents = read(baselinePath);
if (!/(?:Issue\s*#?129|issues\/129)/iu.test(baselineContents)) {
  fail(baselinePath, 'missing Issue 129 limitation reference');
}
if (!baselineContents.includes('sources/github-unified-source/_generated/github-code-bundle.txt')) {
  fail(baselinePath, 'missing historical allowlist path limitation');
}

const linkedDocuments = [
  securityPolicyPath,
  boundaryPath,
  secretStoragePath,
  incidentPath,
  baselinePath,
];

for (const source of linkedDocuments) {
  const contents = read(source);
  for (const target of linkedDocuments) {
    if (source === target) continue;
    const basename = target.split('/').at(-1);
    if (!hasMarkdownLink(contents, basename)) {
      fail(source, `missing required documentation link: ${basename}`);
    }
  }
}

const workflowPath = '.github/workflows/security-guardian.yml';
const workflowContents = read(workflowPath);
const workflowLogicalLines = shellLogicalLines(workflowContents);

function checkoutStepsUseNoCredentials(contents) {
  const lines = contents.split(/\r?\n/u);
  const checkoutLines = lines
    .map((line, index) => ({ index, line }))
    .filter(({ line }) => /uses:\s*actions\/checkout@/u.test(line));

  return (
    checkoutLines.length > 0 &&
    checkoutLines.every(({ index, line }) => {
      const usesIndent = line.match(/^\s*/u)?.[0].length ?? 0;
      const stepIndent = Math.max(0, usesIndent - 2);
      let end = lines.length;
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        const match = lines[cursor].match(/^(\s*)-\s+/u);
        if (match && match[1].length === stepIndent) {
          end = cursor;
          break;
        }
      }
      return lines
        .slice(index, end)
        .some(candidate => /persist-credentials:\s*false\b/u.test(candidate));
    })
  );
}

if (!topLevelContentsRead(workflowContents)) {
  fail(workflowPath, 'top-level permissions must set contents to read');
}
if (/^\s*contents:\s*(?!read\b)\S+/mu.test(workflowContents)) {
  fail(workflowPath, 'contents permission must not exceed read');
}
if (!checkoutStepsUseNoCredentials(workflowContents)) {
  fail(workflowPath, 'every checkout step must disable persisted credentials');
}
if (!/GITLEAKS_VERSION\s*=\s*["']?8\.30\.1["']?/u.test(workflowContents)) {
  fail(workflowPath, 'Gitleaks version must be pinned to 8.30.1');
}
if (
  !/GITLEAKS_ARCHIVE\s*=\s*["']gitleaks_\$\{GITLEAKS_VERSION\}_linux_x64\.tar\.gz["']/u.test(
    workflowContents,
  )
) {
  fail(workflowPath, 'Gitleaks archive must be the reviewed Linux x64 release artifact');
}
if (
  !/GITLEAKS_SHA256\s*=\s*["']551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb["']/u.test(
    workflowContents,
  )
) {
  fail(workflowPath, 'Gitleaks digest must match the reviewed 8.30.1 Linux x64 artifact');
}
if (
  !/https:\/\/github\.com\/gitleaks\/gitleaks\/releases\/download\/v\$\{GITLEAKS_VERSION\}\/\$\{GITLEAKS_ARCHIVE\}/u.test(
    workflowContents,
  )
) {
  fail(workflowPath, 'Gitleaks archive must use the exact official release URL');
}

const checksumIndex = workflowLogicalLines.findIndex(
  line => /\bsha256sum\b/u.test(line) && /(?:--check|\s-c(?:\s|$))/u.test(line),
);
const extractionIndex = workflowLogicalLines.findIndex(line => /\btar\s+-[^\n]*[xz]/u.test(line));
if (checksumIndex < 0) {
  fail(workflowPath, 'Gitleaks archive checksum verification is required');
} else if (extractionIndex >= 0 && checksumIndex > extractionIndex) {
  fail(workflowPath, 'Gitleaks checksum must be verified before extraction');
}
if (
  !workflowLogicalLines.some(
    line =>
      /\bcurl\b/u.test(line) &&
      /--output\s+["']\$\{RUNNER_TEMP\}\/\$\{GITLEAKS_ARCHIVE\}["']/u.test(line) &&
      /https:\/\/github\.com\/gitleaks\/gitleaks\/releases\/download\/v\$\{GITLEAKS_VERSION\}\/\$\{GITLEAKS_ARCHIVE\}/u.test(
        line,
      ),
  )
) {
  fail(workflowPath, 'Gitleaks download must bind the official URL to the reviewed archive path');
}
if (
  !workflowLogicalLines.some(line =>
    /echo\s+["']\$\{GITLEAKS_SHA256\}\s{2}\$\{RUNNER_TEMP\}\/\$\{GITLEAKS_ARCHIVE\}["']\s*\|\s*sha256sum\s+--check\s+--strict/u.test(
      line,
    ),
  )
) {
  fail(workflowPath, 'Gitleaks checksum must bind the reviewed digest to the downloaded archive');
}
if (
  !workflowLogicalLines.some(line =>
    /\btar\s+-xzf\s+["']\$\{RUNNER_TEMP\}\/\$\{GITLEAKS_ARCHIVE\}["']\s+-C\s+["']\$\{RUNNER_TEMP\}["']/u.test(
      line,
    ),
  )
) {
  fail(workflowPath, 'Gitleaks extraction must use the checksum-verified archive');
}

if (!/(?:^|\s)(?:bash\s+)?scripts\/security\/scan-secrets\.sh(?:\s|$)/mu.test(workflowContents)) {
  fail(workflowPath, 'workflow must invoke the repository secret scanner');
}

const auditLines = workflowLogicalLines.filter(line => /\bnpm\s+audit\b/u.test(line));
if (
  auditLines.length === 0 ||
  !auditLines.some(line => /--audit-level(?:=|\s+)high\b/u.test(line))
) {
  fail(workflowPath, 'dependency audit must fail closed at high severity');
}
if (auditLines.some(line => /\|\|\s*true\b/u.test(line))) {
  fail(workflowPath, 'dependency audit must not suppress failures');
}
const auditStep = workflowContents
  .split(/\r?\n(?=\s*-\s+(?:name|uses):)/u)
  .find(block => /\bnpm\s+audit\b/u.test(block));
if (!auditStep || !/^\s*if:\s*always\(\)\s*$/mu.test(auditStep)) {
  fail(workflowPath, 'dependency audit step must run with if always');
}
if (
  !/(?:configured exceptions?|allowlist)[^\n]*(?:issue\s*#?129|issues\/129)|(?:issue\s*#?129|issues\/129)[^\n]*(?:configured exceptions?|allowlist)/iu.test(
    workflowContents,
  )
) {
  fail(workflowPath, 'successful security summary must preserve the Issue 129 exception caveat');
}

const foundationWorkflowPath = '.github/workflows/foundation-check.yml';
const foundationWorkflow = read(foundationWorkflowPath);
if (!checkoutStepsUseNoCredentials(foundationWorkflow)) {
  fail(foundationWorkflowPath, 'every checkout step must disable persisted credentials');
}
const foundationInstallLines = shellLogicalLines(foundationWorkflow).filter(line =>
  /\bnpm\s+ci\b/u.test(line),
);
if (
  foundationInstallLines.length === 0 ||
  foundationInstallLines.some(line => !/(?:^|\s)--ignore-scripts(?:\s|$)/u.test(line))
) {
  fail(foundationWorkflowPath, 'npm ci must use ignore-scripts');
}

const scannerPath = 'scripts/security/scan-secrets.sh';
const scannerContents = read(scannerPath);
const scannerLogicalLines = shellLogicalLines(scannerContents);
const scannerGitleaksLines = scannerLogicalLines.filter(line =>
  /\bgitleaks\s+detect\b/u.test(line),
);

if (scannerGitleaksLines.length === 0) {
  fail(scannerPath, 'missing Gitleaks detect command');
} else if (!commandHasFlag(scannerContents, /\bgitleaks\s+detect\b/u, '--redact')) {
  fail(scannerPath, 'Gitleaks detect command must use redaction');
}
if (
  !/command\s+-v\s+gitleaks/u.test(scannerContents) ||
  !/https:\/\/github\.com\/gitleaks\/gitleaks/u.test(scannerContents)
) {
  fail(scannerPath, 'missing fail-closed manual setup guidance');
}

const scannerForbiddenControls = [
  ['sudo execution is forbidden', /\bsudo\b/iu],
  ['Homebrew execution is forbidden', /\bbrew\b/iu],
  ['wget execution is forbidden', /\bwget\b/iu],
  ['automatic installation is forbidden', /\bauto(?:matic)?[- ]?install\b/iu],
  ['filter-branch guidance is forbidden', /\bfilter-branch\b/iu],
  ['BFG guidance is forbidden', /\bBFG(?:\s+Repo-Cleaner)?\b/u],
];

for (const [control, pattern] of scannerForbiddenControls) {
  if (pattern.test(scannerContents)) fail(scannerPath, control);
}

if (failures.length > 0) {
  console.error('Security boundary check failed:');
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Security boundary check passed.');
