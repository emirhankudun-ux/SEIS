#!/usr/bin/env node

import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkerPath = join(repositoryRoot, 'scripts/check-security-boundary.mjs');
const syntheticSecret = 'synthetic-security-boundary-fixture-value';
const fixtureFiles = [
  '.gitignore',
  '.env.example',
  '.github/workflows/security-guardian.yml',
  '.github/workflows/foundation-check.yml',
  'docs/SECURITY.md',
  'docs/PUBLIC_PRIVATE_BOUNDARY.md',
  'docs/security/SECRET_STORAGE.md',
  'docs/security/CREDENTIAL_INCIDENT_RESPONSE.md',
  'docs/security/security-baseline.md',
  'docs/security/hardening/hardening.json',
  'scripts/security/scan-secrets.sh',
];

function copyFixture(destination) {
  for (const relativePath of fixtureFiles) {
    const source = join(repositoryRoot, relativePath);
    const target = join(destination, relativePath);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(source, target);
  }
  const initialized = spawnSync('git', ['init', '--quiet'], {
    cwd: destination,
    encoding: 'utf8',
  });
  if (initialized.status !== 0) throw new Error('fixture Git repository initialization failed');
}

function runChecker(root) {
  return spawnSync(process.execPath, [checkerPath, '--root', root], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
}

function outputOf(result) {
  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

function safeOutput(result) {
  return outputOf(result).split(syntheticSecret).join('[REDACTED]');
}

function assertPassed(label, result) {
  if (result.status !== 0) {
    throw new Error(`${label} must pass\n${safeOutput(result)}`);
  }
}

function assertRejected(label, result, expectedControl) {
  if (result.status === 0) throw new Error(`${label} must fail`);
  const output = outputOf(result);
  if (!output.includes(expectedControl)) {
    throw new Error(`${label} must report ${expectedControl}\n${safeOutput(result)}`);
  }
}

function update(root, relativePath, transform) {
  const path = join(root, relativePath);
  const before = readFileSync(path, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`fixture mutation did not change ${relativePath}`);
  writeFileSync(path, after);
}

function withFixture(label, callback) {
  const parent = mkdtempSync(join(tmpdir(), 'seis-security-boundary-'));
  const fixture = join(parent, 'fixture');
  mkdirSync(fixture);
  try {
    copyFixture(fixture);
    assertPassed(`${label} baseline`, runChecker(fixture));
    callback(fixture);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function verifyHardeningEvidence() {
  const context = readFileSync(join(repositoryRoot, 'docs/security/hardening/context.md'), 'utf8');
  const hardening = JSON.parse(
    readFileSync(join(repositoryRoot, 'docs/security/hardening/hardening.json'), 'utf8'),
  );
  const revision = hardening.sourceEvidence?.targetRevision;
  const contextDigest = context.match(/Evidence collection SHA-256: `([0-9a-f]{64})`/u)?.[1];
  const inventory = [
    ...context.matchAll(/^\| `E\d+`\s+\|[^|]*\| `([^`]+)`\s+\| `([0-9a-f]{64})`\s+\|/gmu),
  ].map(match => ({ path: match[1], hash: match[2] }));

  if (!/^[0-9a-f]{40}$/u.test(revision ?? '')) {
    throw new Error('hardening evidence must declare an exact target revision');
  }
  if (inventory.length !== hardening.sourceEvidence?.artifactCount) {
    throw new Error('hardening evidence artifact count must match the context inventory');
  }
  if (new Set(inventory.map(item => item.path)).size !== inventory.length) {
    throw new Error('hardening evidence inventory paths must be unique');
  }

  for (const item of inventory) {
    const result = spawnSync('git', ['show', `${revision}:${item.path}`], {
      cwd: repositoryRoot,
      encoding: null,
      maxBuffer: 10 * 1024 * 1024,
    });
    if (result.status !== 0) {
      throw new Error(`hardening evidence path must exist at the target revision: ${item.path}`);
    }
    const actualHash = createHash('sha256').update(result.stdout).digest('hex');
    if (actualHash !== item.hash) {
      throw new Error(`hardening evidence hash must match the target revision: ${item.path}`);
    }
  }

  const collection = `${inventory
    .map(item => `${item.hash}  ${item.path}`)
    .sort()
    .join('\n')}\n`;
  const collectionDigest = createHash('sha256').update(collection).digest('hex');
  if (
    collectionDigest !== contextDigest ||
    collectionDigest !== hardening.sourceEvidence?.collectionSha256
  ) {
    throw new Error('hardening evidence collection digest must be reproducible');
  }
}

assertPassed('repository baseline', runChecker(repositoryRoot));
verifyHardeningEvidence();

withFixture('unsafe ignore rule', fixture => {
  update(fixture, '.gitignore', contents => `${contents.trimEnd()}\n.github/\n`);
  assertRejected('unsafe ignore rule', runChecker(fixture), 'broad .github ignore is forbidden');
});

withFixture('later workflow re-ignore', fixture => {
  update(fixture, '.gitignore', contents => `${contents.trimEnd()}\n.github/workflows/\n`);
  assertRejected(
    'later workflow re-ignore',
    runChecker(fixture),
    'protected path must remain visible: .github/workflows/foundation-check.yml',
  );
});

withFixture('later scanner re-ignore', fixture => {
  update(
    fixture,
    '.gitignore',
    contents => `${contents.trimEnd()}\nscripts/security/scan-secrets.sh\n`,
  );
  assertRejected(
    'later scanner re-ignore',
    runChecker(fixture),
    'protected path must remain visible: scripts/security/scan-secrets.sh',
  );
});

withFixture('later hardening artifact re-ignore', fixture => {
  update(
    fixture,
    '.gitignore',
    contents => `${contents.trimEnd()}\ndocs/security/hardening/hardening.json\n`,
  );
  assertRejected(
    'later hardening artifact re-ignore',
    runChecker(fixture),
    'protected path must remain visible: docs/security/hardening/hardening.json',
  );
});

withFixture('ignored lockfile', fixture => {
  update(fixture, '.gitignore', contents => `${contents.trimEnd()}\npackage-lock.json\n`);
  assertRejected('ignored lockfile', runChecker(fixture), 'package-lock.json ignore is forbidden');
});

withFixture('hidden hardening artifact', fixture => {
  update(fixture, '.gitignore', contents =>
    contents.replace(/^!docs\/security\/hardening\/hardening\.json\s*$\n?/mu, ''),
  );
  assertRejected(
    'hidden hardening artifact',
    runChecker(fixture),
    'missing security documentation unignore: !docs/security/hardening/hardening.json',
  );
});

withFixture('missing hardening artifact', fixture => {
  unlinkSync(join(fixture, 'docs/security/hardening/hardening.json'));
  assertRejected(
    'missing hardening artifact',
    runChecker(fixture),
    'docs/security/hardening/hardening.json: missing required file',
  );
});

withFixture('invalid hardening artifact', fixture => {
  update(fixture, 'docs/security/hardening/hardening.json', () => '{');
  assertRejected(
    'invalid hardening artifact',
    runChecker(fixture),
    'hardening artifact must contain valid JSON',
  );
});

withFixture('nonempty secret-like environment variable', fixture => {
  update(
    fixture,
    '.env.example',
    contents => `${contents.trimEnd()}\nOPENAI_API_KEY=${syntheticSecret}\n`,
  );
  const result = runChecker(fixture);
  if (outputOf(result).includes(syntheticSecret)) {
    throw new Error('secret fixture value must never appear in checker output');
  }
  assertRejected(
    'nonempty secret-like environment variable',
    result,
    'secret-like variable must be empty: OPENAI_API_KEY',
  );
});

withFixture('missing incident step', fixture => {
  update(fixture, 'docs/security/CREDENTIAL_INCIDENT_RESPONSE.md', contents =>
    contents.replace(/^## Containment\s*$\n?/mu, ''),
  );
  assertRejected(
    'missing incident step',
    runChecker(fixture),
    'missing required heading: Containment',
  );
});

withFixture('implicit workflow permissions', fixture => {
  update(fixture, '.github/workflows/security-guardian.yml', contents =>
    contents.replace(/^permissions:\s*$\n(?:^[ \t]+.*\n)*/mu, ''),
  );
  assertRejected(
    'implicit workflow permissions',
    runChecker(fixture),
    'top-level permissions must set contents to read',
  );
});

withFixture('persisted checkout credentials', fixture => {
  update(fixture, '.github/workflows/security-guardian.yml', contents =>
    contents.replace('persist-credentials: false', 'persist-credentials: true'),
  );
  assertRejected(
    'persisted checkout credentials',
    runChecker(fixture),
    'every checkout step must disable persisted credentials',
  );
});

withFixture('foundation persisted checkout credentials', fixture => {
  update(fixture, '.github/workflows/foundation-check.yml', contents =>
    contents.replace('persist-credentials: false', 'persist-credentials: true'),
  );
  assertRejected(
    'foundation persisted checkout credentials',
    runChecker(fixture),
    'every checkout step must disable persisted credentials',
  );
});

withFixture('foundation shallow checkout', fixture => {
  update(fixture, '.github/workflows/foundation-check.yml', contents =>
    contents.replace('fetch-depth: 0', 'fetch-depth: 1'),
  );
  assertRejected(
    'foundation shallow checkout',
    runChecker(fixture),
    'checkout must fetch full history for evidence verification',
  );
});

withFixture('non-redacted scanner', fixture => {
  update(fixture, 'scripts/security/scan-secrets.sh', contents =>
    contents.replace(/(?:^|\s)--redact(?=\s|$)/u, ''),
  );
  assertRejected(
    'non-redacted scanner',
    runChecker(fixture),
    'Gitleaks detect command must use redaction',
  );
});

withFixture('automatic installer', fixture => {
  update(
    fixture,
    'scripts/security/scan-secrets.sh',
    contents => `${contents.trimEnd()}\nbrew install gitleaks\n`,
  );
  assertRejected('automatic installer', runChecker(fixture), 'Homebrew execution is forbidden');
});

withFixture('destructive history guidance', fixture => {
  update(
    fixture,
    'scripts/security/scan-secrets.sh',
    contents => `${contents.trimEnd()}\necho "git filter-branch requires review"\n`,
  );
  assertRejected(
    'destructive history guidance',
    runChecker(fixture),
    'filter-branch guidance is forbidden',
  );
});

withFixture('checksum omission', fixture => {
  update(fixture, '.github/workflows/security-guardian.yml', contents => {
    const lines = contents.split(/\r?\n/u);
    const filtered = lines.filter(line => !/\bsha256sum\b/u.test(line));
    return filtered.join('\n');
  });
  assertRejected(
    'checksum omission',
    runChecker(fixture),
    'Gitleaks archive checksum verification is required',
  );
});

withFixture('unreviewed scanner digest', fixture => {
  update(fixture, '.github/workflows/security-guardian.yml', contents =>
    contents.replace(
      '551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ),
  );
  assertRejected(
    'unreviewed scanner digest',
    runChecker(fixture),
    'Gitleaks digest must match the reviewed 8.30.1 Linux x64 artifact',
  );
});

withFixture('checksum bound to a different archive', fixture => {
  update(fixture, '.github/workflows/security-guardian.yml', contents =>
    contents.replace(
      'echo "${GITLEAKS_SHA256}  ${RUNNER_TEMP}/${GITLEAKS_ARCHIVE}"',
      'echo "${GITLEAKS_SHA256}  ${RUNNER_TEMP}/other-archive.tar.gz"',
    ),
  );
  assertRejected(
    'checksum bound to a different archive',
    runChecker(fixture),
    'Gitleaks checksum must bind the reviewed digest to the downloaded archive',
  );
});

withFixture('scanner extraction before checksum', fixture => {
  update(fixture, '.github/workflows/security-guardian.yml', contents => {
    const checksum = contents.match(/^\s*echo .*sha256sum --check --strict\s*$/mu)?.[0];
    const extraction = contents.match(/^\s*tar -xzf .*$/mu)?.[0];
    if (!checksum || !extraction) return contents;
    return contents
      .replace(checksum, '__SEIS_CHECKSUM_LINE__')
      .replace(extraction, checksum)
      .replace('__SEIS_CHECKSUM_LINE__', extraction);
  });
  assertRejected(
    'scanner extraction before checksum',
    runChecker(fixture),
    'Gitleaks checksum must be verified before extraction',
  );
});

withFixture('scanner wrapper bypass', fixture => {
  update(fixture, '.github/workflows/security-guardian.yml', contents =>
    contents.replace('bash scripts/security/scan-secrets.sh', 'gitleaks detect --redact'),
  );
  assertRejected(
    'scanner wrapper bypass',
    runChecker(fixture),
    'workflow must invoke the repository secret scanner',
  );
});

withFixture('suppressed dependency audit', fixture => {
  update(fixture, '.github/workflows/security-guardian.yml', contents =>
    contents.replace(/(npm\s+audit[^\n]*)(\n)/u, '$1 || true$2'),
  );
  assertRejected(
    'suppressed dependency audit',
    runChecker(fixture),
    'dependency audit must not suppress failures',
  );
});

withFixture('conditional dependency audit', fixture => {
  update(fixture, '.github/workflows/security-guardian.yml', contents =>
    contents.replace(/(- name:\s*Dependency Audit[^\n]*\n\s*)if:\s*always\(\)/u, '$1if: success()'),
  );
  assertRejected(
    'conditional dependency audit',
    runChecker(fixture),
    'dependency audit step must run with if always',
  );
});

withFixture('missing Issue 129 summary caveat', fixture => {
  update(fixture, '.github/workflows/security-guardian.yml', contents =>
    contents.replace(/^.*Configured exceptions remain in effect; issue #129.*$\n?/mu, ''),
  );
  assertRejected(
    'missing Issue 129 summary caveat',
    runChecker(fixture),
    'successful security summary must preserve the Issue 129 exception caveat',
  );
});

withFixture('foundation install scripts', fixture => {
  update(fixture, '.github/workflows/foundation-check.yml', contents =>
    contents.replace(/npm\s+ci\s+--ignore-scripts/u, 'npm ci'),
  );
  assertRejected(
    'foundation install scripts',
    runChecker(fixture),
    'npm ci must use ignore-scripts',
  );
});

console.log(
  'Security boundary tests passed: hardening evidence matched its target revision, and unsafe ignore, lockfile, hardening-artifact, environment, incident, permission, checkout, redaction, installation, history, scanner-integrity, summary, dependency-audit, and install-script fixtures were rejected without disclosing secret-like values.',
);
