#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  BACKLOG_PATH,
  EXPECTED_DIRTY_COUNTS,
  EXPECTED_RECORD_COUNT,
  EXPECTED_REGISTRY_DIGEST,
  METADATA_BLOCK_BEGIN,
  QUEUE_PATH,
  REGISTRY_PATH,
  REVIEW_PATH,
  REVIEW_TABLE_BEGIN,
  SCHEMA_PATH,
  STATUS_PATH,
  computeRegistryDigest,
  containsUnsafeMutationCommand,
  isContainedCandidatePath,
  registryMetadataLines,
  renderRegistryTable,
  summarizeRegistry,
  validateDiscoverySource,
  validateJsonSchemaInstance,
  validatePackageScripts,
  validateRegistryData,
  validateRegistryDocuments,
  validateRegistrySchema,
  validateWorkflow,
} from './check-seis-local-workspace-registry.mjs';
import {
  CANDIDATE_IDS,
  computeRegistryDigest as computeDiscoveryRegistryDigest,
  countPorcelain,
  discoverSeisLocalWorkspaces,
  EXPECTED_TASK_BRANCH,
  isAllowedGitInspectionArgs,
  isSafeLocalGitConfigKey,
  liveDatasetId,
  repositorySlugFromRemote,
  safeGitEnvironment,
  sanitizeErrorCode,
  summarize as summarizeDiscoveryRecords,
  validateWorkspaceObservation,
} from './discover-seis-local-workspaces.mjs';

const registry = readJson(REGISTRY_PATH);
const schema = readJson(SCHEMA_PATH);
const documents = Object.fromEntries(
  [REVIEW_PATH, STATUS_PATH, BACKLOG_PATH, QUEUE_PATH].map(path => [
    path,
    readFileSync(path, 'utf8'),
  ]),
);
const packageJson = readJson('package.json');
const workflow = readFileSync('.github/workflows/foundation-check.yml', 'utf8');
const discoverySource = readFileSync('scripts/discover-seis-local-workspaces.mjs', 'utf8');
const checkerSource = readFileSync('scripts/check-seis-local-workspace-registry.mjs', 'utf8');

let assertionCount = 0;

expectNoFailures('canonical registry', validateRegistryData(registry));
expectNoFailures('canonical schema', validateRegistrySchema(schema));
expectNoFailures(
  'canonical registry JSON Schema instance',
  validateJsonSchemaInstance(schema, registry),
);
expectNoFailures('canonical documentation', validateRegistryDocuments(registry, documents));
expectNoFailures('canonical package scripts', validatePackageScripts(packageJson));
expectNoFailures('canonical foundation workflow', validateWorkflow(workflow));
expectNoFailures('canonical discovery source', validateDiscoverySource(discoverySource));

const schemaExtraRoot = clone(registry);
schemaExtraRoot.machinePath = '/redacted';
expectIncludes(
  'JSON Schema rejects an additional root field',
  validateJsonSchemaInstance(schema, schemaExtraRoot),
  'must not contain additional key machinePath',
);
const schemaDuplicateCandidate = clone(registry);
schemaDuplicateCandidate.scope.candidateIds[1] = schemaDuplicateCandidate.scope.candidateIds[0];
expectIncludes(
  'JSON Schema rejects duplicate candidate IDs',
  validateJsonSchemaInstance(schema, schemaDuplicateCandidate),
  'must contain unique items',
);
const schemaReorderedRecords = clone(registry);
[schemaReorderedRecords.records[0], schemaReorderedRecords.records[1]] = [
  schemaReorderedRecords.records[1],
  schemaReorderedRecords.records[0],
];
expectIncludes(
  'JSON Schema rejects reordered prefix records',
  validateJsonSchemaInstance(schema, schemaReorderedRecords),
  'must equal the schema constant',
);
const schemaUnverifiedWithoutReason = clone(registry);
recordById(schemaUnverifiedWithoutReason, 'ops2-task-worktree').reasonCodes = [
  'canonical-repository-slug-verified',
  'focused-goal-worktree',
  'mutation-not-authorized',
];
expectIncludes(
  'JSON Schema enforces the unverified Gitlink reason',
  validateJsonSchemaInstance(schema, schemaUnverifiedWithoutReason),
  'must contain an item matching contains',
);
const schemaDirtyWritable = clone(registry);
const schemaDirtyShared = recordById(schemaDirtyWritable, 'shared-seis-common-root');
schemaDirtyShared.writeEligibleAtObservation = true;
expectIncludes(
  'JSON Schema rejects writable dirty records',
  validateJsonSchemaInstance(schema, schemaDirtyWritable),
  'must equal the schema constant',
);
const schemaImpossibleCalendarDate = clone(registry);
schemaImpossibleCalendarDate.capturedAt = '2026-02-30T07:24:28Z';
for (const record of schemaImpossibleCalendarDate.records) {
  record.observedAt = schemaImpossibleCalendarDate.capturedAt;
}
expectIncludes(
  'JSON Schema rejects impossible calendar dates',
  validateJsonSchemaInstance(schema, schemaImpossibleCalendarDate),
  'must be a valid date-time',
);

equal(
  computeRegistryDigest(registry),
  EXPECTED_REGISTRY_DIGEST,
  'checker digest must match the frozen observation',
);
equal(
  computeDiscoveryRegistryDigest(registry),
  EXPECTED_REGISTRY_DIGEST,
  'discovery digest must match the frozen observation',
);
deepEqual(
  summarizeRegistry(registry.records),
  registry.summary,
  'checker summary must match the persisted summary',
);
deepEqual(
  summarizeDiscoveryRecords(registry.records),
  registry.summary,
  'discovery summary must match the persisted summary',
);
deepEqual(
  registry.records.map(record => record.id),
  CANDIDATE_IDS,
  'persisted records must use canonical opaque IDs and order',
);
equal(registry.records.length, EXPECTED_RECORD_COUNT, 'record count must remain frozen');

const reversedKeyRegistry = reverseObjectKeys(registry);
equal(
  computeRegistryDigest(reversedKeyRegistry),
  EXPECTED_REGISTRY_DIGEST,
  'digest must be independent of JSON object key order',
);
const digestMutation = clone(registry);
digestMutation.summary.totalRecords += 1;
notEqual(
  computeRegistryDigest(digestMutation),
  EXPECTED_REGISTRY_DIGEST,
  'digest must change when canonical payload content changes',
);

const renderedTable = renderRegistryTable(registry);
ok(renderedTable.includes('| direct-seis-intake |'), 'rendered table must use opaque IDs');
ok(!renderedTable.includes('/Users/'), 'rendered table must not expose an absolute local path');
ok(!renderedTable.includes('://'), 'rendered table must not expose a remote URL');
equal(registryMetadataLines(registry).length, 9, 'metadata block must have nine frozen lines');

expectRegistryFailure(
  'absolute-path field',
  fixture => {
    fixture.absolutePath = `/${['Users', 'example', 'SEIS'].join('/')}`;
  },
  ['forbidden public registry field', 'absolute local path'],
);
expectRegistryFailure(
  'record path escape',
  fixture => {
    fixture.records[0].relativePath = `${'..'}/outside`;
  },
  ['forbidden public registry field', 'path-escape locator'],
);
expectRegistryFailure(
  'credential-bearing remote field',
  fixture => {
    fixture.records[1].remoteUrl = `${'https'}://${'user'}:${'credential'}@example.invalid/repo`;
  },
  ['forbidden public registry field', 'remote or local URL'],
);
expectRegistryFailure(
  'credential-bearing repository slug',
  fixture => {
    fixture.records[1].repositorySlug = `${'https'}://${'user'}:${'credential'}@example.invalid/repo`;
  },
  ['repositorySlug must be canonical or null', 'remote or local URL'],
);
expectRegistryFailure(
  'SCP remote repository slug',
  fixture => {
    fixture.records[1].repositorySlug = `${'git'}@example.invalid:owner/repo`;
  },
  ['repositorySlug must be canonical or null', 'SCP-style remote URL'],
);
expectRegistryFailure(
  'duplicate record IDs',
  fixture => {
    fixture.records[1].id = fixture.records[0].id;
  },
  ['canonical candidate IDs in exact order', 'record IDs must be unique'],
);
expectRegistryFailure(
  'record order drift',
  fixture => {
    [fixture.records[0], fixture.records[1]] = [fixture.records[1], fixture.records[0]];
  },
  'canonical candidate IDs in exact order',
);
expectRegistryFailure(
  'candidate ID drift',
  fixture => {
    fixture.scope.candidateIds[0] = 'unknown-workspace';
  },
  'scope.candidateIds must match',
);
expectRegistryFailure(
  'candidate count drift',
  fixture => {
    fixture.scope.candidateCount = 5;
  },
  ['scope.candidateCount must be 4', 'scope.candidateCount must equal records.length'],
);
expectRegistryFailure(
  'record count drift',
  fixture => {
    fixture.records.pop();
  },
  'records.length must equal the immutable expected count',
);
expectRegistryFailure(
  'scope limitation drift',
  fixture => {
    fixture.scope.limitations.pop();
  },
  'scope.limitations must match',
);
expectRegistryFailure(
  'mutation policy drift',
  fixture => {
    fixture.policy.mutationsPerformed = true;
  },
  'policy.mutationsPerformed must be false',
);
expectRegistryFailure(
  'disclosure policy drift',
  fixture => {
    fixture.policy.disclosureMode = 'local-paths';
  },
  'policy.disclosureMode must be opaque-workspace-identifiers',
);
expectRegistryFailure(
  'live discovery policy drift',
  fixture => {
    fixture.policy.liveDiscoveryMode = 'write-file';
  },
  'policy.liveDiscoveryMode must be stdout-only',
);
expectRegistryFailure(
  'dirty common root made writable',
  fixture => {
    recordById(fixture, 'shared-seis-common-root').writeEligibleAtObservation = true;
    recordById(fixture, 'ops2-task-worktree').writeEligibleAtObservation = false;
  },
  ['shared-seis-common-root contract', 'dirty worktrees must never be write eligible'],
);
expectRegistryFailure(
  'dirty task worktree made writable',
  fixture => {
    const task = recordById(fixture, 'ops2-task-worktree');
    task.worktreeState = 'dirty';
    task.dirtyCounts = { modified: 1, deleted: 0, untracked: 0, total: 1 };
  },
  'worktreeState must match the ops2-task-worktree contract',
);
expectRegistryFailure(
  'non-Git intake claims canonical repository',
  fixture => {
    recordById(fixture, 'direct-seis-intake').repositorySlug = fixture.canonicalRepositorySlug;
  },
  'repositorySlug must match the direct-seis-intake contract',
);
expectRegistryFailure(
  'non-Git intake claims valid Git state',
  fixture => {
    recordById(fixture, 'direct-seis-intake').gitState = 'valid';
  },
  'gitState must match the direct-seis-intake contract',
);
expectRegistryFailure(
  'incomplete workspace metadata claims canonical repository',
  fixture => {
    recordById(fixture, 'workspace-metadata').repositorySlug = fixture.canonicalRepositorySlug;
  },
  'repositorySlug must match the workspace-metadata contract',
);
expectRegistryFailure(
  'workspace metadata loses incomplete state',
  fixture => {
    recordById(fixture, 'workspace-metadata').gitState = 'not-repository';
  },
  'gitState must match the workspace-metadata contract',
);
expectRegistryFailure(
  'task loses common-root evidence',
  fixture => {
    recordById(fixture, 'ops2-task-worktree').gitCommonRootId = null;
  },
  'gitCommonRootId must match the ops2-task-worktree contract',
);
expectRegistryFailure(
  'missing evidence methods',
  fixture => {
    recordById(fixture, 'ops2-task-worktree').evidenceMethods = [];
  },
  'evidenceMethods must be a non-empty array',
);
expectRegistryFailure(
  'duplicate evidence methods',
  fixture => {
    const task = recordById(fixture, 'ops2-task-worktree');
    task.evidenceMethods.push(task.evidenceMethods[0]);
  },
  'evidenceMethods must not contain duplicates',
);
expectRegistryFailure(
  'unknown evidence method',
  fixture => {
    recordById(fixture, 'ops2-task-worktree').evidenceMethods[0] = 'filesystem-write';
  },
  'evidenceMethods[0] is invalid',
);
expectRegistryFailure(
  'missing reason codes',
  fixture => {
    recordById(fixture, 'workspace-metadata').reasonCodes = [];
  },
  'reasonCodes must be a non-empty array',
);
expectRegistryFailure(
  'invalid record timestamp',
  fixture => {
    recordById(fixture, 'ops2-task-worktree').observedAt = '2026-07-14 07:24:28';
  },
  'observedAt must be an exact UTC timestamp',
);
expectRegistryFailure(
  'future record timestamp',
  fixture => {
    recordById(fixture, 'ops2-task-worktree').observedAt = '2026-07-14T07:24:29Z';
  },
  'observedAt must not follow capturedAt',
);
expectRegistryFailure(
  'capture boundary drift',
  fixture => {
    fixture.capturedAt = '2026-07-14T07:24:29Z';
  },
  'capturedAt must equal the latest per-record observation boundary',
);
expectRegistryFailure(
  'dirty-count arithmetic drift',
  fixture => {
    recordById(fixture, 'shared-seis-common-root').dirtyCounts.total -= 1;
  },
  'total must equal modified + deleted + untracked',
);
expectRegistryFailure(
  'negative dirty count',
  fixture => {
    recordById(fixture, 'shared-seis-common-root').dirtyCounts.modified = -1;
  },
  'modified must be a non-negative integer',
);
expectRegistryFailure(
  'dirty-count field drift',
  fixture => {
    recordById(fixture, 'shared-seis-common-root').dirtyCounts.renamed = 2;
  },
  'dirtyCounts keys must be exactly',
);
expectRegistryFailure(
  'shared divergence missing',
  fixture => {
    recordById(fixture, 'shared-seis-common-root').divergence = null;
  },
  'divergence must be present for the shared common root',
);
expectRegistryFailure(
  'negative divergence',
  fixture => {
    recordById(fixture, 'shared-seis-common-root').divergence.ahead = -1;
  },
  'ahead must be a non-negative integer',
);
expectRegistryFailure(
  'fractional divergence',
  fixture => {
    recordById(fixture, 'shared-seis-common-root').divergence.behind = 1.5;
  },
  'behind must be a non-negative integer',
);
expectRegistryFailure(
  'divergence comparison drift',
  fixture => {
    recordById(fixture, 'shared-seis-common-root').divergence.comparison = 'origin-vs-head';
  },
  'comparison must be local-head-vs-origin-main',
);
expectRegistryFailure(
  'divergence field drift',
  fixture => {
    recordById(fixture, 'shared-seis-common-root').divergence.base = 'main';
  },
  'divergence keys must be exactly',
);
expectRegistryFailure(
  'summary count drift',
  fixture => {
    fixture.summary.totalRecords += 1;
  },
  'summary does not match the workspace records',
  { refreshSummary: false },
);
expectRegistryFailure(
  'summary shape drift',
  fixture => {
    fixture.summary.extra = 1;
  },
  'summary does not match the workspace records',
  { refreshSummary: false },
);
expectRegistryFailure(
  'digest payload drift',
  fixture => {
    fixture.digest = `sha256:${'0'.repeat(64)}`;
  },
  'digest does not match the canonical registry payload',
  { refreshDigest: false },
);

const refrozenTimestamp = clone(registry);
refrozenTimestamp.capturedAt = '2026-07-14T07:24:29Z';
for (const record of refrozenTimestamp.records) record.observedAt = refrozenTimestamp.capturedAt;
refrozenTimestamp.summary = summarizeRegistry(refrozenTimestamp.records);
refrozenTimestamp.digest = computeRegistryDigest(refrozenTimestamp);
expectIncludes(
  'immutable digest rejects a newly self-consistent snapshot',
  validateRegistryData(refrozenTimestamp),
  'digest must equal the immutable expected digest',
);

expectRegistryFailure(
  'GitHub-token-shaped secret',
  fixture => {
    recordById(fixture, 'workspace-metadata').reasonCodes[0] = `${'gh'}${'p_'}${'A'.repeat(20)}`;
  },
  'must not contain a GitHub token',
);
expectRegistryFailure(
  'credential assignment',
  fixture => {
    recordById(fixture, 'workspace-metadata').reasonCodes[0] = `${'password'}='${'x'.repeat(12)}'`;
  },
  'must not contain a credential assignment',
);
expectRegistryFailure(
  'unsafe command in registry content',
  fixture => {
    recordById(fixture, 'workspace-metadata').reasonCodes[0] = 'git reset --hard';
  },
  'must not contain a direct mutation command',
);
expectRegistryFailure(
  'path escape in registry content',
  fixture => {
    recordById(fixture, 'workspace-metadata').reasonCodes[0] = `${'..'}/outside`;
  },
  'must not contain a path or remote locator',
);

deepEqual(
  countPorcelain(' M modified\nM  staged\n D deleted\nD  removed\n?? new-file\nA  added\n'),
  { modified: 3, deleted: 2, untracked: 1, total: 6 },
  'porcelain parser must classify aggregate changes deterministically',
);
deepEqual(
  countPorcelain(''),
  { modified: 0, deleted: 0, untracked: 0, total: 0 },
  'porcelain parser must return zero counts for a clean worktree',
);
deepEqual(
  countPorcelain('R  old -> new\nUU conflict\n'),
  { modified: 2, deleted: 0, untracked: 0, total: 2 },
  'porcelain parser must count non-delete tracked statuses as modified',
);

const RUNTIME_CAPTURED_AT = '2026-07-14T08:09:10Z';
const RUNTIME_DATASET_ID = 'seis-local-workspace-live-observation-20260714T080910Z';

equal(
  liveDatasetId(RUNTIME_CAPTURED_AT),
  RUNTIME_DATASET_ID,
  'live dataset ID must be timestamp-derived and deterministic',
);
expectThrowsCode(
  'live dataset invalid timestamp',
  () => liveDatasetId('2026-07-14T08:09:10.000Z'),
  'captured-at-invalid',
);

for (const remote of [
  'git@github.com:emirhankudun-ux/SEIS.git',
  'https://github.com/emirhankudun-ux/SEIS',
  'ssh://git@github.com/emirhankudun-ux/SEIS.git',
]) {
  equal(
    repositorySlugFromRemote(remote),
    'emirhankudun-ux/SEIS',
    `canonical GitHub remote must normalize without being persisted: ${remote}`,
  );
}
for (const remote of [
  ' https://github.com/emirhankudun-ux/SEIS',
  'https://user:secret@github.com/emirhankudun-ux/SEIS',
  'ssh://other@github.com/emirhankudun-ux/SEIS',
  'https://example.invalid/emirhankudun-ux/SEIS',
  'https://github.com:8443/emirhankudun-ux/SEIS',
  'https://github.com/emirhankudun-ux/SEIS?token=redacted',
  'file:///tmp/SEIS',
  'github:emirhankudun-ux/SEIS',
]) {
  equal(
    repositorySlugFromRemote(remote),
    null,
    `unsafe or ambiguous remote must fail closed: ${remote}`,
  );
}

deepEqual(
  safeGitEnvironment({
    PATH: '/controlled/bin',
    HOME: '/private/home',
    GIT_DIR: '/private/repository',
    GIT_WORK_TREE: '/private/worktree',
    GIT_CONFIG_PARAMETERS: "'url.fake.insteadOf'='https://github.com/'",
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'url.fake.insteadOf',
    GIT_CONFIG_VALUE_0: 'https://github.com/',
    GH_TOKEN: 'redacted',
  }),
  {
    PATH: '/controlled/bin',
    LANG: 'C',
    LC_ALL: 'C',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_ATTR_NOSYSTEM: '1',
    GIT_PAGER: '',
    GIT_NO_LAZY_FETCH: '1',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_TERMINAL_PROMPT: '0',
  },
  'Git inspection environment must retain only the bounded read-only variables',
);

for (const args of [
  ['rev-parse', '--is-inside-work-tree'],
  ['rev-parse', '--show-toplevel'],
  ['rev-parse', '--git-common-dir'],
  ['rev-parse', '--git-dir'],
  ['ls-files', '--format=%(objectmode)'],
  ['status', '--porcelain=v1', '-z', '-uall', '--no-renames', '--ignore-submodules=all'],
  ['branch', '--show-current'],
  ['config', '--local', '--no-includes', '--name-only', '--list'],
  ['config', '--local', '--no-includes', '--get', 'remote.origin.url'],
  ['rev-list', '--left-right', '--count', 'origin/main...HEAD'],
]) {
  ok(
    isAllowedGitInspectionArgs(args),
    `read-only Git argument vector must be allowlisted: ${args[0]}`,
  );
}
for (const args of [
  ['fetch'],
  ['status', '--short'],
  ['config', '--get', 'remote.origin.url'],
  ['update-index', '--refresh'],
  ['rev-parse', '--show-prefix'],
]) {
  ok(
    !isAllowedGitInspectionArgs(args),
    `non-contract Git argument vector must be rejected: ${args[0]}`,
  );
}
for (const key of [
  'user.name',
  'user.email',
  'remote.origin.url',
  'branch.main.remote',
  'branch.audit/seis-workspace-truth-recovery.merge',
]) {
  ok(isSafeLocalGitConfigKey(key), `ordinary local Git config key must remain allowed: ${key}`);
}
for (const key of [
  'include.path',
  'includeIf.gitdir:example.path',
  'filter.evil.process',
  'diff.evil.textconv',
  'core.hooksPath',
  'core.fsmonitor',
  'url.example.insteadOf',
  'submodule.example.update',
  'branch.audit/../escape.remote',
  'maintenance.repo.schedule',
]) {
  ok(!isSafeLocalGitConfigKey(key), `external-command or include config must be rejected: ${key}`);
}
equal(
  sanitizeErrorCode(new Error('task-git-metadata-invalid')),
  'task-git-metadata-invalid',
  'allowlisted machine error codes must remain stable',
);
equal(
  sanitizeErrorCode(new Error('/private/example/SEIS failed')),
  'internal-error',
  'path-bearing errors must be redacted',
);
equal(
  sanitizeErrorCode({ message: 'workspace-root-invalid' }),
  'internal-error',
  'non-Error values must not become public error codes',
);

let cleanRuntimeObservation;
withWorkspaceFixture({}, fixture => {
  cleanRuntimeObservation = discoverFixture(fixture);
  const eligible = cleanRuntimeObservation.records.filter(
    record => record.writeEligibleAtObservation,
  );
  equal(eligible.length, 1, 'clean canonical fixture must expose exactly one eligible observation');
  equal(
    eligible[0].id,
    'ops2-task-worktree',
    'only the verified clean task worktree may be eligible at observation time',
  );
  expectNoFailures(
    'clean runtime observation generic validation',
    validateWorkspaceObservation(cleanRuntimeObservation, {
      expectedDatasetId: RUNTIME_DATASET_ID,
    }),
  );
  expectNoFailures(
    'clean runtime observation JSON Schema instance',
    validateJsonSchemaInstance(schema, cleanRuntimeObservation),
  );
  equal(
    recordById(cleanRuntimeObservation, 'workspace-metadata').gitState,
    'incomplete-metadata',
    'bounded fixture must report incomplete workspace-root Git metadata without traversing it',
  );
});

withWorkspaceFixture({}, fixture => {
  writeFileSync(join(fixture.task, 'dirty-only-in-task.txt'), 'dirty\n');
  const observation = discoverFixture(fixture);
  const task = recordById(observation, 'ops2-task-worktree');
  equal(task.worktreeState, 'dirty', 'dirty task fixture must be observed as dirty');
  equal(task.writeEligibleAtObservation, false, 'dirty task fixture must fail closed');
  equal(task.routingDecision, 'blocked', 'dirty task fixture must never receive write routing');
  ok(
    task.reasonCodes.includes('task-worktree-not-clean'),
    'dirty task fixture must carry a non-clean reason code',
  );
});

withWorkspaceFixture({ remote: 'https://github.com/example/not-seis.git' }, fixture => {
  const observation = discoverFixture(fixture);
  const task = recordById(observation, 'ops2-task-worktree');
  equal(task.repositorySlug, null, 'wrong origin must not be normalized to canonical identity');
  equal(task.writeEligibleAtObservation, false, 'wrong origin must block write eligibility');
});

for (const taskMode of ['wrong-branch', 'main', 'detached']) {
  withWorkspaceFixture({ taskMode }, fixture => {
    const observation = discoverFixture(fixture);
    const task = recordById(observation, 'ops2-task-worktree');
    equal(task.writeEligibleAtObservation, false, `${taskMode} task must fail closed`);
    equal(task.routingDecision, 'blocked', `${taskMode} task must remain blocked`);
    ok(
      task.reasonCodes.includes('task-branch-not-approved'),
      `${taskMode} task must record the branch-policy rejection`,
    );
  });
}

withParentRepositoryFixture(fixture => {
  expectThrowsCode(
    'parent repository nested candidates',
    () => discoverFixture(fixture),
    'shared-git-metadata-invalid',
  );
});

withIntermediateSymlinkFixture(fixture => {
  expectThrowsCode(
    'intermediate symlink escape',
    () => discoverFixture(fixture),
    'shared-common-root-invalid',
  );
});

withWorkspaceFixture({}, fixture => {
  expectThrowsCode(
    'task aliases shared common root',
    () =>
      discoverSeisLocalWorkspaces({
        workspaceRoot: fixture.root,
        taskWorktree: fixture.shared,
        capturedAt: RUNTIME_CAPTURED_AT,
      }),
    'candidate-identity-collision',
  );
});

withExternalCommonDirectoryFixture(fixture => {
  expectThrowsCode(
    'external common directory linked as shared candidate',
    () => discoverFixture(fixture),
    'shared-git-metadata-invalid',
  );
});

withMalformedSharedMarkerFixture(fixture => {
  expectThrowsCode(
    'malformed shared Git marker',
    () => discoverFixture(fixture),
    'shared-git-metadata-invalid',
  );
});

withWorkspaceFixture({}, fixture => {
  writeFileSync(join(fixture.task, '.git'), 'not-a-gitdir-pointer\n');
  expectThrowsCode(
    'malformed task Git marker',
    () => discoverFixture(fixture),
    'task-git-metadata-invalid',
  );
});

withWorkspaceFixture({}, fixture => {
  const marker = join(fixture.task, '.git');
  const target = join(fixture.sandbox, 'private-task-marker');
  renameSync(marker, target);
  symlinkSync(target, marker);
  expectThrowsCode(
    'task Git marker symlink',
    () => discoverFixture(fixture),
    'task-git-metadata-invalid',
  );
});

withWorkspaceFixture({}, fixture => {
  writeFileSync(join(fixture.task, '.git'), `gitdir: ${join(fixture.shared, '.git', 'objects')}\n`);
  expectThrowsCode(
    'task Git pointer outside worktrees directory',
    () => discoverFixture(fixture),
    'task-git-metadata-outside-worktrees-directory',
  );
});

withWorkspaceFixture({ taskMode: 'wrong-branch' }, fixture => {
  const sibling = join(fixture.root, 'approved-sibling-worktree');
  gitFixture(fixture.shared, ['worktree', 'add', '-b', EXPECTED_TASK_BRANCH, sibling, 'HEAD']);
  writeFileSync(join(fixture.task, '.git'), readFileSync(join(sibling, '.git'), 'utf8'));
  expectThrowsCode(
    'task Git marker swapped to sibling worktree entry',
    () => discoverFixture(fixture),
    'task-git-reverse-pointer-invalid',
  );
});

withWorkspaceFixture({}, fixture => {
  const executionMarker = join(fixture.sandbox, 'external-config-command-ran');
  gitFixture(fixture.shared, ['config', 'filter.evil.clean', `touch ${executionMarker}`]);
  expectThrowsCode(
    'local Git external-command configuration',
    () => discoverFixture(fixture),
    'git-local-config-not-allowlisted',
  );
  ok(!existsSync(executionMarker), 'rejected local Git configuration must not execute its command');
});

withWorkspaceFixture({}, fixture => {
  const privateGitlinkName = 'private-submodule-name-must-not-escape';
  const head = gitFixture(fixture.task, ['rev-parse', 'HEAD']).stdout.trim();
  gitFixture(fixture.task, [
    'update-index',
    '--add',
    '--cacheinfo',
    `160000,${head},${privateGitlinkName}`,
  ]);
  gitFixture(fixture.task, ['commit', '-m', 'test: add opaque gitlink fixture']);
  const observation = discoverFixture(fixture);
  const task = recordById(observation, 'ops2-task-worktree');
  equal(task.worktreeState, 'unverified', 'clean gitlink fixture must become unverified');
  equal(task.writeEligibleAtObservation, false, 'unverified gitlink fixture must be non-writable');
  ok(
    task.reasonCodes.includes('submodule-state-unverified'),
    'gitlink fixture must carry the bounded submodule-state reason',
  );
  ok(
    !JSON.stringify(observation).includes(privateGitlinkName),
    'live observation must not persist or emit submodule path names',
  );
});

withWorkspaceFixture({}, fixture => {
  expectThrowsCode(
    'discovery invalid timestamp',
    () =>
      discoverSeisLocalWorkspaces({
        workspaceRoot: fixture.root,
        taskWorktree: fixture.task,
        capturedAt: '2026-07-14 08:09:10',
      }),
    'captured-at-invalid',
  );
});

withWorkspaceFixture({}, fixture => {
  withProcessEnvironment({ PATH: '' }, () => {
    expectThrowsCode(
      'Git executable unavailable',
      () => discoverFixture(fixture),
      'git-inspection-unavailable',
    );
  });
});

withWorkspaceFixture({ remote: 'seis-env-alias:repository' }, fixture => {
  withProcessEnvironment(
    {
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'url.git@github.com:emirhankudun-ux/SEIS.git.insteadOf',
      GIT_CONFIG_VALUE_0: 'seis-env-alias:repository',
      GIT_CONFIG_PARAMETERS:
        "'url.git@github.com:emirhankudun-ux/SEIS.git.insteadOf'='seis-env-alias:repository'",
    },
    () => {
      const observation = discoverFixture(fixture);
      const task = recordById(observation, 'ops2-task-worktree');
      equal(
        task.repositorySlug,
        null,
        'environment insteadOf injection must not forge origin identity',
      );
      equal(
        task.writeEligibleAtObservation,
        false,
        'environment insteadOf injection must remain blocked',
      );
    },
  );
});

withWorkspaceFixture({}, fixture => {
  const cli = spawnSync(
    process.execPath,
    [
      resolve('scripts/discover-seis-local-workspaces.mjs'),
      '--workspace-root',
      fixture.root,
      '--task-worktree',
      fixture.task,
      '--captured-at',
      RUNTIME_CAPTURED_AT,
      '--compact',
    ],
    { cwd: process.cwd(), encoding: 'utf8', env: { ...process.env }, maxBuffer: 8 * 1024 * 1024 },
  );
  equal(cli.status, 0, 'CLI fixture must succeed without exposing diagnostic details');
  equal(cli.stderr, '', 'successful CLI discovery must not emit diagnostic details');
  for (const sensitive of [fixture.sandbox, fixture.root, fixture.task, fixture.remote]) {
    ok(!cli.stdout.includes(sensitive), 'CLI stdout must not expose a local path or raw remote');
    ok(!cli.stderr.includes(sensitive), 'CLI stderr must not expose a local path or raw remote');
  }
  const observation = JSON.parse(cli.stdout);
  equal(
    observation.datasetId,
    RUNTIME_DATASET_ID,
    'CLI output must use timestamped live dataset ID',
  );
  expectNoFailures(
    'CLI runtime observation validation',
    validateWorkspaceObservation(observation, { expectedDatasetId: RUNTIME_DATASET_ID }),
  );

  const failure = spawnSync(
    process.execPath,
    [
      resolve('scripts/discover-seis-local-workspaces.mjs'),
      '--workspace-root',
      join(fixture.root, 'private-missing-workspace-name'),
      '--task-worktree',
      fixture.task,
      '--captured-at',
      RUNTIME_CAPTURED_AT,
    ],
    { cwd: process.cwd(), encoding: 'utf8', env: { ...process.env }, maxBuffer: 8 * 1024 * 1024 },
  );
  equal(failure.status, 1, 'CLI failure fixture must return a bounded failure status');
  equal(failure.stdout, '', 'CLI failure must not write a partial observation');
  equal(
    failure.stderr,
    'SEIS local workspace discovery failed: workspace-root-invalid\n',
    'CLI failure must emit only the sanitized error code',
  );
  ok(
    !failure.stderr.includes(fixture.root),
    'CLI error must not expose the rejected workspace path',
  );
});

const duplicateLiveIds = clone(cleanRuntimeObservation);
duplicateLiveIds.records[1].id = duplicateLiveIds.records[0].id;
refreshLiveObservation(duplicateLiveIds);
expectIncludes(
  'generic validator duplicate runtime IDs',
  validateWorkspaceObservation(duplicateLiveIds, { expectedDatasetId: RUNTIME_DATASET_ID }),
  'canonical candidate IDs in exact order',
);

const mismatchedLiveDatasetId = clone(cleanRuntimeObservation);
mismatchedLiveDatasetId.datasetId = 'seis-local-workspace-live-observation-20260714T080911Z';
refreshLiveObservation(mismatchedLiveDatasetId);
expectIncludes(
  'generic validator mismatched runtime dataset ID',
  validateWorkspaceObservation(mismatchedLiveDatasetId),
  'live datasetId must be derived exactly from capturedAt',
);

const impossibleLiveDatasetId = clone(cleanRuntimeObservation);
impossibleLiveDatasetId.datasetId = 'seis-local-workspace-live-observation-20990230T250000Z';
refreshLiveObservation(impossibleLiveDatasetId);
expectIncludes(
  'generic validator impossible runtime dataset ID',
  validateWorkspaceObservation(impossibleLiveDatasetId),
  'live datasetId must be derived exactly from capturedAt',
);

const retaggedSnapshot = clone(registry);
retaggedSnapshot.datasetId = RUNTIME_DATASET_ID;
retaggedSnapshot.capturedAt = RUNTIME_CAPTURED_AT;
for (const record of retaggedSnapshot.records) record.observedAt = RUNTIME_CAPTURED_AT;
refreshLiveObservation(retaggedSnapshot);
expectIncludes(
  'generic validator rejects snapshot retagged as live',
  validateWorkspaceObservation(retaggedSnapshot, { expectedDatasetId: RUNTIME_DATASET_ID }),
  'live valid Git observations must include the index-mode scan evidence',
);

const nullLiveRecord = clone(cleanRuntimeObservation);
nullLiveRecord.records[0] = null;
refreshLiveObservation(nullLiveRecord);
expectIncludes(
  'generic validator null runtime record',
  validateWorkspaceObservation(nullLiveRecord, { expectedDatasetId: RUNTIME_DATASET_ID }),
  'records[0] must be an object',
);

const nullLiveReasons = clone(cleanRuntimeObservation);
recordById(nullLiveReasons, 'ops2-task-worktree').reasonCodes = null;
refreshLiveObservation(nullLiveReasons);
expectIncludes(
  'generic validator null runtime reason codes',
  validateWorkspaceObservation(nullLiveReasons, { expectedDatasetId: RUNTIME_DATASET_ID }),
  'reasonCodes must be a non-empty array',
);

const nullLiveEvidence = clone(cleanRuntimeObservation);
recordById(nullLiveEvidence, 'ops2-task-worktree').evidenceMethods = null;
refreshLiveObservation(nullLiveEvidence);
expectIncludes(
  'generic validator null runtime evidence methods',
  validateWorkspaceObservation(nullLiveEvidence, { expectedDatasetId: RUNTIME_DATASET_ID }),
  'evidenceMethods must be a non-empty array',
);

const unsafeLiveEligibility = clone(cleanRuntimeObservation);
const unsafeTask = recordById(unsafeLiveEligibility, 'ops2-task-worktree');
unsafeTask.worktreeState = 'dirty';
unsafeTask.dirtyCounts = { modified: 1, deleted: 0, untracked: 0, total: 1 };
refreshLiveObservation(unsafeLiveEligibility);
expectIncludes(
  'generic validator unsafe runtime eligibility',
  validateWorkspaceObservation(unsafeLiveEligibility, { expectedDatasetId: RUNTIME_DATASET_ID }),
  'dirty observations must never be write eligible',
);

const staleLiveDigest = clone(cleanRuntimeObservation);
staleLiveDigest.digest = `sha256:${'0'.repeat(64)}`;
expectIncludes(
  'generic validator stale runtime digest',
  validateWorkspaceObservation(staleLiveDigest, { expectedDatasetId: RUNTIME_DATASET_ID }),
  'digest must match the canonical observation payload',
);

const staleLiveSummary = clone(cleanRuntimeObservation);
staleLiveSummary.summary.totalRecords += 1;
staleLiveSummary.digest = computeDiscoveryRegistryDigest(staleLiveSummary);
expectIncludes(
  'generic validator stale runtime summary',
  validateWorkspaceObservation(staleLiveSummary, { expectedDatasetId: RUNTIME_DATASET_ID }),
  'summary must match the observation records',
);

const invalidLiveArithmetic = clone(cleanRuntimeObservation);
recordById(invalidLiveArithmetic, 'ops2-task-worktree').dirtyCounts.total = 1;
refreshLiveObservation(invalidLiveArithmetic);
expectIncludes(
  'generic validator runtime dirty-count arithmetic',
  validateWorkspaceObservation(invalidLiveArithmetic, { expectedDatasetId: RUNTIME_DATASET_ID }),
  'total must equal modified + deleted + untracked',
);

for (const [root, candidate] of [
  ['/workspace', '/workspace'],
  ['/workspace', '/workspace/task'],
  ['/workspace/', '/workspace/task/'],
  ['/workspace', '/workspace/./task'],
  ['/', '/workspace/task'],
]) {
  ok(
    isContainedCandidatePath(root, candidate),
    `contained path must pass: ${root} -> ${candidate}`,
  );
}
for (const [root, candidate] of [
  ['/workspace', '/workspace-other'],
  ['/workspace', '/workspace/../outside'],
  ['/workspace/../outside', '/workspace/task'],
  ['workspace', '/workspace/task'],
  ['/workspace', 'workspace/task'],
  ['/workspace', '\\workspace\\task'],
]) {
  ok(
    !isContainedCandidatePath(root, candidate),
    `uncontained path must fail: ${root} -> ${candidate}`,
  );
}

for (const command of [
  'rm -rf build',
  'mv source target',
  'find . -delete',
  'sed -i backup file',
  'git add .',
  'git commit -m change',
  'git push origin main',
  'git reset --hard',
  'git clean -fd',
  'git switch -C replacement',
  'git checkout -b replacement',
  'git restore --source HEAD -- file',
  'git config remote.origin.url example.invalid',
  'git remote set-url origin example.invalid',
  'git update-ref refs/heads/topic HEAD',
  'git stash push',
  'git tag release-candidate',
  'git notes remove HEAD',
  'git apply change.patch',
  'git am change.patch',
  'git revert HEAD',
  'git init replacement',
  'git clone example.invalid/repo',
  'git fetch origin main',
  'git reflog expire --all',
  'git gc --prune=now',
  'git repack -ad',
  'git replace HEAD replacement',
  'git symbolic-ref HEAD refs/heads/main',
  'git update-index --refresh',
  'git submodule update --init',
  'git lfs pull',
  'git pull origin main',
  'git worktree prune',
  'git worktree repair',
  'git checkout -- file',
  'git branch -D topic',
  'git branch -M replacement',
  'git worktree remove task',
  'gh pr close 1',
  'gh pr merge 1',
  'gh issue create --title change',
  'gh issue edit 1',
  'gh release create v1',
  'gh workflow run checks.yml',
  'gh api -X POST repos/example',
  'gh api --method PATCH repos/example',
  'curl -X DELETE example.invalid',
  'curl --request POST example.invalid',
  'curl --data value example.invalid',
  'curl --upload-file artifact example.invalid',
  'curl --form file=@artifact example.invalid',
  'chmod 777 target',
  String.raw`git\nclean -fd`,
]) {
  ok(containsUnsafeMutationCommand(command), `unsafe command must be rejected: ${command}`);
}
for (const command of [
  'git status --short',
  'git rev-parse --show-toplevel',
  'git diff --check',
  'gh pr view 1',
  'curl --head example.invalid',
  'mutation-not-authorized',
]) {
  ok(!containsUnsafeMutationCommand(command), `read-only command must remain allowed: ${command}`);
}

expectDocumentFailure(
  'missing required document',
  fixture => {
    delete fixture[STATUS_PATH];
  },
  'registry metadata document is missing',
);
expectDocumentFailure(
  'stale digest metadata',
  fixture => {
    fixture[STATUS_PATH] = fixture[STATUS_PATH].replace(
      registry.digest,
      `sha256:${'0'.repeat(64)}`,
    );
  },
  'must include exact registry metadata line once',
);
expectDocumentFailure(
  'metadata hidden in comment',
  fixture => {
    const goalLine = registryMetadataLines(registry)[0];
    fixture[BACKLOG_PATH] = fixture[BACKLOG_PATH].replace(goalLine, `<!-- ${goalLine} -->`);
  },
  'must include exact registry metadata line once',
);
expectDocumentFailure(
  'duplicate metadata marker',
  fixture => {
    fixture[QUEUE_PATH] = `${METADATA_BLOCK_BEGIN}\n${fixture[QUEUE_PATH]}`;
  },
  'must contain exactly one OPS-GOAL-0002 registry metadata block',
);
expectDocumentFailure(
  'nested HTML comments',
  fixture => {
    fixture[QUEUE_PATH] += '\n<!-- outer <!-- inner --> -->\n';
  },
  'balanced, non-nested HTML comments',
);
expectDocumentFailure(
  'unsafe metadata command',
  fixture => {
    fixture[STATUS_PATH] = fixture[STATUS_PATH].replace(
      METADATA_BLOCK_BEGIN,
      `${METADATA_BLOCK_BEGIN}\nMutation: \`git clean -fd\``,
    );
  },
  'must not contain a direct mutation command',
);
expectDocumentFailure(
  'secret-like metadata',
  fixture => {
    const secret = `${'gh'}${'p_'}${'B'.repeat(20)}`;
    fixture[STATUS_PATH] = fixture[STATUS_PATH].replace(
      METADATA_BLOCK_BEGIN,
      `${METADATA_BLOCK_BEGIN}\nCredential: \`${secret}\``,
    );
  },
  'must not contain a GitHub token',
);
expectDocumentFailure(
  'stale review table',
  fixture => {
    fixture[REVIEW_PATH] = fixture[REVIEW_PATH].replace(
      '| direct-seis-intake |',
      '| stale-direct-intake |',
    );
  },
  'workspace table must exactly match the registry',
);
expectDocumentFailure(
  'missing review table marker',
  fixture => {
    fixture[REVIEW_PATH] = fixture[REVIEW_PATH].replace(REVIEW_TABLE_BEGIN, '');
  },
  'workspace table must exactly match the registry',
);

const documentsWithUnrelatedBrowserPath = { ...documents };
documentsWithUnrelatedBrowserPath[STATUS_PATH] += '\nUnrelated browser VFS: /home/seis\n';
expectNoFailures(
  'unrelated browser path outside frozen metadata block',
  validateRegistryDocuments(registry, documentsWithUnrelatedBrowserPath),
);
expectIncludes(
  'non-object document collection',
  validateRegistryDocuments(registry, null),
  'registry documents input must be an object',
);

expectPackageFailure(
  'missing checker alias',
  fixture => {
    delete fixture.scripts['check:seis-local-workspace-registry'];
  },
  'package.json must expose check:seis-local-workspace-registry',
);
expectPackageFailure(
  'stale test alias',
  fixture => {
    fixture.scripts['test:seis-local-workspace-registry'] = 'node stale-test.mjs';
  },
  'package.json must expose test:seis-local-workspace-registry',
);
expectPackageFailure(
  'stale discovery alias',
  fixture => {
    fixture.scripts['inspect:seis-local-workspaces'] = 'node write-registry.mjs';
  },
  'package.json must expose inspect:seis-local-workspaces',
);

expectWorkflowFailure(
  'workflow write permission',
  workflow.replace('  contents: read', '  contents: write'),
  'top-level permissions must be exactly contents: read',
);
expectWorkflowFailure(
  'workflow extra permission',
  workflow.replace('  contents: read', '  contents: read\n  issues: read'),
  'top-level permissions must be exactly contents: read',
);
expectWorkflowFailure(
  'workflow job-level permission override',
  workflow.replace('  check:\n', '  check:\n    permissions:\n      contents: write\n'),
  'exactly one top-level permissions block',
);
expectWorkflowFailure(
  'workflow inline write-all permission',
  workflow.replace('permissions:\n  contents: read', 'permissions: write-all'),
  'exactly one top-level permissions block',
);
expectWorkflowFailure(
  'workflow duplicate named check step',
  workflow.replace(
    '      - name: Run lightweight checks',
    '      - name: Run lightweight checks\n        run: |\n          npm run check:seis-local-workspace-registry\n          npm run test:seis-local-workspace-registry\n\n      - name: Run lightweight checks',
  ),
  'exactly one Run lightweight checks step',
);
expectWorkflowFailure(
  'workflow later-step command substitution',
  workflow
    .replace(
      '      - name: Run lightweight checks',
      '      - name: Run lightweight checks\n        shell: bash',
    )
    .replace('        run: |', '      - name: Later step\n        run: |'),
  'must run npm run check:seis-local-workspace-registry exactly once',
);
expectWorkflowFailure(
  'workflow missing checker',
  workflow.replace('          npm run check:seis-local-workspace-registry\n', ''),
  'must run npm run check:seis-local-workspace-registry exactly once',
);
expectWorkflowFailure(
  'workflow duplicate checker',
  workflow.replace(
    '          npm run check:seis-local-workspace-registry',
    '          npm run check:seis-local-workspace-registry\n          npm run check:seis-local-workspace-registry',
  ),
  'must run npm run check:seis-local-workspace-registry exactly once',
);
expectWorkflowFailure(
  'workflow commented test',
  workflow.replace(
    '          npm run test:seis-local-workspace-registry',
    '          # npm run test:seis-local-workspace-registry',
  ),
  'must run npm run test:seis-local-workspace-registry exactly once',
);
expectWorkflowFailure(
  'workflow live discovery',
  workflow.replace(
    '          npm run test:seis-local-workspace-registry',
    '          npm run test:seis-local-workspace-registry\n          npm run inspect:seis-local-workspaces',
  ),
  'must not run machine-local workspace discovery',
);
expectWorkflowFailure(
  'workflow non-npm shell command',
  workflow.replace(
    '          npm run test:seis-local-workspace-registry',
    '          npm run test:seis-local-workspace-registry\n          printf unsafe > artifact.txt',
  ),
  'run commands and order must match the frozen allowlist',
);
expectWorkflowFailure(
  'workflow arbitrary npm script',
  workflow.replace(
    '          npm run test:seis-local-workspace-registry',
    '          npm run test:seis-local-workspace-registry\n          npm run arbitrary-write',
  ),
  'run commands and order must match the frozen allowlist',
);
expectWorkflowFailure(
  'workflow spaced run key',
  workflow.replace(
    '      - name: Install dependencies',
    '      - name: Spaced run key\n        run : npm run arbitrary-write\n\n      - name: Install dependencies',
  ),
  'run commands and order must match the frozen allowlist',
);
expectWorkflowFailure(
  'workflow quoted run key',
  workflow.replace(
    '      - name: Install dependencies',
    '      - "name": Quoted run key\n        "run": npm run arbitrary-write\n\n      - name: Install dependencies',
  ),
  'must match the frozen source digest',
);
expectWorkflowFailure(
  'workflow flow-style run step',
  workflow.replace(
    '      - name: Install dependencies',
    '      - { name: Hidden run, run: npm run arbitrary-write }\n\n      - name: Install dependencies',
  ),
  'must match the frozen source digest',
);
expectWorkflowFailure(
  'workflow unpinned checkout action',
  workflow.replace(
    'actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10',
    'actions/checkout@main',
  ),
  'actions must match the exact SHA-pinned allowlist',
);
expectWorkflowFailure(
  'workflow checkout input override',
  workflow.replace(
    '        uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3',
    '        uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3\n        with:\n          repository: attacker/example\n          ref: main',
  ),
  'must match the frozen source digest',
);
expectWorkflowFailure(
  'workflow extra action',
  workflow.replace(
    '      - name: Install dependencies',
    '      - name: Unreviewed action\n        uses: example/unreviewed@0123456789abcdef0123456789abcdef01234567\n\n      - name: Install dependencies',
  ),
  'actions must match the exact SHA-pinned allowlist',
);
expectWorkflowFailure(
  'workflow spaced uses key',
  workflow.replace(
    '      - name: Install dependencies',
    '      - name: Spaced uses key\n        uses : example/unreviewed@main\n\n      - name: Install dependencies',
  ),
  'actions must match the exact SHA-pinned allowlist',
);
expectWorkflowFailure(
  'workflow quoted uses key',
  workflow.replace(
    '      - name: Install dependencies',
    '      - "name": Quoted uses key\n        "uses": example/unreviewed@main\n\n      - name: Install dependencies',
  ),
  'must match the frozen source digest',
);
expectWorkflowFailure(
  'workflow flow-style uses step',
  workflow.replace(
    '      - name: Install dependencies',
    '      - { name: Hidden action, uses: example/unreviewed@main }\n\n      - name: Install dependencies',
  ),
  'must match the frozen source digest',
);
expectWorkflowFailure(
  'workflow shell semantic modifier',
  workflow.replace(
    '      - name: Install dependencies\n        run: npm ci',
    '      - name: Install dependencies\n        shell: bash -c "npm run arbitrary-write; bash {0}"\n        run: npm ci',
  ),
  'must match the frozen source digest',
);
expectWorkflowFailure(
  'workflow environment semantic modifier',
  workflow.replace(
    'permissions:\n  contents: read',
    'env:\n  NODE_OPTIONS: --require ./malicious.js\n\npermissions:\n  contents: read',
  ),
  'must match the frozen source digest',
);
expectWorkflowFailure(
  'workflow mutation command',
  `${workflow}\n# git reset --hard\n`,
  'must not contain a direct mutation command',
);

expectDiscoveryFailure(
  'discovery stops using stdout',
  discoverySource.replace('process.stdout.write', 'console.log'),
  'discovery source must include process.stdout.write',
);
expectDiscoveryFailure(
  'discovery stops disabling optional locks',
  discoverySource.replace("GIT_OPTIONAL_LOCKS: '0'", "GIT_OPTIONAL_LOCKS: '1'"),
  'discovery source must include GIT_OPTIONAL_LOCKS=0',
);
expectDiscoveryFailure(
  'discovery stops disabling prompts',
  discoverySource.replace("GIT_TERMINAL_PROMPT: '0'", "GIT_TERMINAL_PROMPT: '1'"),
  'discovery source must include GIT_TERMINAL_PROMPT=0',
);
expectDiscoveryFailure(
  'discovery loses raw local origin read',
  discoverySource.replaceAll("'--no-includes'", "'--includes'"),
  'discovery source must include --no-includes',
);
expectDiscoveryFailure(
  'discovery loses exact top-level check',
  discoverySource.replaceAll("'--show-toplevel'", "'--show-prefix'"),
  'discovery source must include --show-toplevel',
);
expectDiscoveryFailure(
  'discovery loses exact Git argument allowlist guard',
  discoverySource.replaceAll('isAllowedGitInspectionArgs', 'acceptGitInspectionArgs'),
  'discovery source must include exact Git argument allowlist',
);
expectDiscoveryFailure(
  'discovery loses local Git configuration allowlist',
  discoverySource.replaceAll('isSafeLocalGitConfigKey', 'acceptLocalGitConfigKey'),
  'discovery source must include local Git configuration allowlist',
);
expectDiscoveryFailure(
  'discovery loses task branch guard',
  discoverySource.replaceAll('EXPECTED_TASK_BRANCH', 'UNVERIFIED_TASK_BRANCH'),
  'discovery source must include EXPECTED_TASK_BRANCH',
);
expectDiscoveryFailure(
  'discovery loses common-root ownership check',
  discoverySource.replaceAll('ownsCommonGitDirectory', 'assumeCommonGitDirectory'),
  'discovery source must include ownsCommonGitDirectory',
);
expectDiscoveryFailure(
  'discovery inherits Git configuration',
  discoverySource.replaceAll('safeGitEnvironment', 'isolatedGitProcessEnvironment'),
  'safeGitEnvironment',
);
expectDiscoveryFailure(
  'discovery loses containment',
  discoverySource.replaceAll('assertContained', 'uncheckedCandidate'),
  'discovery source must include assertContained',
);
expectDiscoveryFailure(
  'discovery loses symlink checks',
  discoverySource.replaceAll('isSymlink', 'uncheckedSymlink'),
  'discovery source must include isSymlink',
);
expectDiscoveryFailure(
  'discovery loses shared Git directory marker guard',
  discoverySource.replaceAll('requireSharedGitDirectory', 'uncheckedSharedGitDirectory'),
  'discovery source must include requireSharedGitDirectory',
);
expectDiscoveryFailure(
  'discovery loses task Git directory marker guard',
  discoverySource.replaceAll('requireTaskGitDirectory', 'uncheckedTaskGitDirectory'),
  'discovery source must include requireTaskGitDirectory',
);
expectDiscoveryFailure(
  'discovery loses task Git reverse-pointer guard',
  discoverySource.replaceAll(
    'task-git-reverse-pointer-invalid',
    'task-git-reverse-pointer-accepted',
  ),
  'discovery source must include task-git-reverse-pointer-invalid',
);
expectDiscoveryFailure(
  'discovery loses candidate identity collision guard',
  discoverySource.replaceAll('candidate-identity-collision', 'candidate-alias-accepted'),
  'discovery source must include candidate-identity-collision',
);
expectDiscoveryFailure(
  'discovery loses public error sanitization',
  discoverySource.replaceAll('sanitizeErrorCode', 'publicFailureCode'),
  'discovery source must include sanitizeErrorCode',
);
expectDiscoveryFailure(
  'discovery loses resolved candidate containment guard',
  discoverySource.replaceAll(
    'assertContained(root, resolvedCandidate',
    'acceptResolvedCandidate(root, resolvedCandidate',
  ),
  'discovery source must include assertContained(root, resolvedCandidate',
);
expectDiscoveryFailure(
  'discovery adds file write',
  `${discoverySource}\nconst prohibited = '${'write' + 'FileSync'}';\n`,
  `discovery source must not contain ${'write' + 'FileSync'}`,
);
expectDiscoveryFailure(
  'discovery adds Git cleanup',
  `${discoverySource}\nconst prohibited = 'git clean -fd';\n`,
  'discovery source must not contain a direct mutation command',
);
expectDiscoveryFailure(
  'discovery adds worktree removal',
  `${discoverySource}\nconst prohibited = 'git worktree remove task';\n`,
  'discovery source must not contain a direct mutation command',
);

for (const token of ['node:child_process', 'spawnSync', 'execSync', 'fetch(', 'https.request']) {
  ok(!checkerSource.includes(token), `static checker must not use live capability: ${token}`);
}

expectSchemaFailure(
  'schema draft drift',
  fixture => {
    fixture.$schema = 'http://json-schema.org/draft-07/schema#';
  },
  'schema must use JSON Schema draft 2020-12',
);
expectSchemaFailure(
  'schema opens root object',
  fixture => {
    fixture.additionalProperties = true;
  },
  'schema root must be a closed object',
);
expectSchemaFailure(
  'schema required fields drift',
  fixture => {
    fixture.required.pop();
  },
  'schema required root fields must match',
);
expectSchemaFailure(
  'schema version drift',
  fixture => {
    fixture.properties.schemaVersion.const = 2;
  },
  'schema must freeze schemaVersion',
);
expectSchemaFailure(
  'schema goal drift',
  fixture => {
    fixture.properties.goalId.const = 'OPS-GOAL-9999';
  },
  'schema must freeze goalId',
);
expectSchemaFailure(
  'schema canonical repository drift',
  fixture => {
    fixture.properties.canonicalRepositorySlug.const = 'other/repository';
  },
  'schema must freeze canonicalRepositorySlug',
);
expectSchemaFailure(
  'schema record count drift',
  fixture => {
    fixture.properties.records.maxItems = 5;
  },
  'schema must freeze the four-record observation boundary',
);
expectSchemaFailure(
  'schema record IDs drift',
  fixture => {
    fixture.$defs.recordId.enum[0] = 'unknown-workspace';
  },
  'schema recordId enum must match',
);
expectSchemaFailure(
  'schema record fields drift',
  fixture => {
    fixture.$defs.record.required.pop();
  },
  'schema record required fields must match',
);
expectSchemaFailure(
  'schema opens records',
  fixture => {
    fixture.$defs.record.additionalProperties = true;
  },
  'schema records must reject additional properties',
);
expectSchemaFailure(
  'schema Git states drift',
  fixture => {
    fixture.$defs.record.properties.gitState.enum.push('unknown');
  },
  'schema gitState enum must match',
);
expectSchemaFailure(
  'schema reason codes drift',
  fixture => {
    fixture.$defs.record.properties.reasonCodes.items.enum.pop();
  },
  'schema reasonCodes enum must match',
);
expectSchemaFailure(
  'schema allows path field',
  fixture => {
    fixture.$defs.record.properties.absolutePath = { type: 'string' };
  },
  'forbidden public registry field',
);
expectSchemaFailure(
  'schema allows remote field',
  fixture => {
    fixture.$defs.record.properties.remoteUrl = { type: 'string' };
  },
  'forbidden public registry field',
);
expectSchemaFailure(
  'schema loosens nested policy constant',
  fixture => {
    fixture.$defs.policy.properties.mutationsPerformed = { type: 'boolean' };
  },
  'frozen canonical schema digest',
);
expectSchemaFailure(
  'schema opens nested dirty counts',
  fixture => {
    fixture.$defs.dirtyCounts.additionalProperties = true;
  },
  'frozen canonical schema digest',
);
expectSchemaFailure(
  'schema loosens nested summary count',
  fixture => {
    fixture.$defs.summary.properties.totalRecords = { type: 'integer', minimum: 0 };
  },
  'frozen canonical schema digest',
);

console.log(
  `SEIS local workspace registry adversarial tests passed (${assertionCount} assertions).`,
);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function clone(value) {
  return structuredClone(value);
}

function reverseObjectKeys(value) {
  if (Array.isArray(value)) return value.map(reverseObjectKeys);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .reverse()
      .map(([key, nestedValue]) => [key, reverseObjectKeys(nestedValue)]),
  );
}

function recordById(fixture, id) {
  return fixture.records.find(record => record.id === id);
}

function refreshDerived(fixture, { refreshSummary = true, refreshDigest = true } = {}) {
  if (refreshSummary) fixture.summary = summarizeRegistry(fixture.records);
  if (refreshDigest) fixture.digest = computeRegistryDigest(fixture);
  return fixture;
}

function refreshLiveObservation(observation) {
  observation.summary = summarizeDiscoveryRecords(observation.records);
  observation.digest = computeDiscoveryRegistryDigest(observation);
  return observation;
}

function discoverFixture(fixture) {
  return discoverSeisLocalWorkspaces({
    workspaceRoot: fixture.root,
    taskWorktree: fixture.task,
    capturedAt: RUNTIME_CAPTURED_AT,
  });
}

function withWorkspaceFixture(options, callback) {
  const fixture = createWorkspaceFixture(options);
  try {
    return callback(fixture);
  } finally {
    rmSync(fixture.sandbox, { recursive: true, force: true });
  }
}

function createWorkspaceFixture({
  remote = 'git@github.com:emirhankudun-ux/SEIS.git',
  taskMode = 'expected-branch',
} = {}) {
  const sandbox = mkdtempSync(join(tmpdir(), 'seis-ops2-runtime-'));
  try {
    const root = join(sandbox, 'workspace');
    const shared = join(root, 'Github', 'SEIS');
    const task = join(root, 'ops2-task-worktree');
    mkdirSync(join(root, 'SEIS'), { recursive: true });
    mkdirSync(join(root, '.git'), { recursive: true });
    mkdirSync(join(root, 'Github'), { recursive: true });

    gitFixture(sandbox, ['init', '-b', 'main', shared]);
    gitFixture(shared, ['config', 'user.name', 'SEIS Runtime Fixture']);
    gitFixture(shared, ['config', 'user.email', 'seis-runtime@example.invalid']);
    writeFileSync(join(shared, 'README.md'), '# isolated runtime fixture\n');
    gitFixture(shared, ['add', 'README.md']);
    gitFixture(shared, ['commit', '-m', 'test: initialize isolated runtime fixture']);
    gitFixture(shared, ['remote', 'add', 'origin', remote]);

    if (taskMode === 'main') {
      gitFixture(shared, ['checkout', '--detach']);
      gitFixture(shared, ['worktree', 'add', task, 'main']);
    } else if (taskMode === 'detached') {
      gitFixture(shared, ['worktree', 'add', '--detach', task, 'HEAD']);
    } else {
      const branch =
        taskMode === 'wrong-branch' ? 'audit/not-the-ops2-branch' : EXPECTED_TASK_BRANCH;
      gitFixture(shared, ['worktree', 'add', '-b', branch, task, 'HEAD']);
      gitFixture(shared, ['config', `branch.${branch}.remote`, 'origin']);
      gitFixture(shared, ['config', `branch.${branch}.merge`, `refs/heads/${branch}`]);
    }

    return { sandbox, root, shared, task, remote };
  } catch (error) {
    rmSync(sandbox, { recursive: true, force: true });
    throw error;
  }
}

function withParentRepositoryFixture(callback) {
  const sandbox = mkdtempSync(join(tmpdir(), 'seis-ops2-parent-repo-'));
  try {
    const root = join(sandbox, 'workspace');
    const shared = join(root, 'Github', 'SEIS');
    const task = join(root, 'task');
    mkdirSync(join(root, 'SEIS'), { recursive: true });
    mkdirSync(shared, { recursive: true });
    mkdirSync(task, { recursive: true });
    gitFixture(sandbox, ['init', '-b', 'main', root]);
    callback({ sandbox, root, shared, task });
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

function withIntermediateSymlinkFixture(callback) {
  const sandbox = mkdtempSync(join(tmpdir(), 'seis-ops2-symlink-'));
  try {
    const root = join(sandbox, 'workspace');
    const task = join(root, 'task');
    const escapedGithub = join(sandbox, 'escaped-github');
    mkdirSync(join(root, 'SEIS'), { recursive: true });
    mkdirSync(join(root, '.git'), { recursive: true });
    mkdirSync(task, { recursive: true });
    mkdirSync(join(escapedGithub, 'SEIS'), { recursive: true });
    symlinkSync(escapedGithub, join(root, 'Github'));
    callback({ sandbox, root, shared: join(root, 'Github', 'SEIS'), task });
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

function withExternalCommonDirectoryFixture(callback) {
  const sandbox = mkdtempSync(join(tmpdir(), 'seis-ops2-external-common-'));
  try {
    const root = join(sandbox, 'workspace');
    const external = join(sandbox, 'external-primary');
    const shared = join(root, 'Github', 'SEIS');
    const task = join(root, 'task');
    mkdirSync(join(root, 'SEIS'), { recursive: true });
    mkdirSync(join(root, '.git'), { recursive: true });
    mkdirSync(join(root, 'Github'), { recursive: true });
    mkdirSync(task, { recursive: true });
    gitFixture(sandbox, ['init', '-b', 'main', external]);
    gitFixture(external, ['config', 'user.name', 'SEIS Runtime Fixture']);
    gitFixture(external, ['config', 'user.email', 'seis-runtime@example.invalid']);
    writeFileSync(join(external, 'README.md'), '# external common directory fixture\n');
    gitFixture(external, ['add', 'README.md']);
    gitFixture(external, ['commit', '-m', 'test: initialize external common fixture']);
    gitFixture(external, ['worktree', 'add', '-b', 'audit/external-common', shared, 'HEAD']);
    callback({ sandbox, root, shared, task });
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

function withMalformedSharedMarkerFixture(callback) {
  const sandbox = mkdtempSync(join(tmpdir(), 'seis-ops2-malformed-shared-'));
  try {
    const root = join(sandbox, 'workspace');
    const shared = join(root, 'Github', 'SEIS');
    const task = join(root, 'task');
    mkdirSync(join(root, 'SEIS'), { recursive: true });
    mkdirSync(join(root, '.git'), { recursive: true });
    mkdirSync(shared, { recursive: true });
    mkdirSync(task, { recursive: true });
    writeFileSync(join(shared, '.git'), 'gitdir: outside\n');
    callback({ sandbox, root, shared, task });
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

function gitFixture(cwd, args) {
  const result = spawnSync(
    'git',
    ['-c', 'core.fsmonitor=false', '-c', 'core.untrackedCache=false', '-C', cwd, ...args],
    {
      encoding: 'utf8',
      env: {
        PATH: process.env.PATH || '',
        LANG: 'C',
        LC_ALL: 'C',
        GIT_CONFIG_NOSYSTEM: '1',
        GIT_CONFIG_GLOBAL: '/dev/null',
        GIT_TERMINAL_PROMPT: '0',
      },
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  assert.equal(
    result.status,
    0,
    `isolated Git fixture command failed (${args[0] || 'unknown-command'}; status redacted)`,
  );
  return result;
}

function withProcessEnvironment(overrides, callback) {
  const previous = new Map();
  for (const [key, value] of Object.entries(overrides)) {
    previous.set(key, Object.hasOwn(process.env, key) ? process.env[key] : undefined);
    process.env[key] = value;
  }
  try {
    return callback();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function expectRegistryFailure(name, mutate, expectedMessages, controls = {}) {
  const fixture = clone(registry);
  mutate(fixture);
  refreshDerived(fixture, controls);
  const failures = validateRegistryData(fixture, {
    expectedCount: controls.expectedCount ?? EXPECTED_RECORD_COUNT,
    expectedDigest: controls.expectedDigest ?? null,
    expectedDirtyCounts: controls.expectedDirtyCounts ?? EXPECTED_DIRTY_COUNTS,
  });
  for (const expectedMessage of array(expectedMessages)) {
    expectIncludes(name, failures, expectedMessage);
  }
}

function expectSchemaFailure(name, mutate, expectedMessage) {
  const fixture = clone(schema);
  mutate(fixture);
  expectIncludes(name, validateRegistrySchema(fixture), expectedMessage);
}

function expectDocumentFailure(name, mutate, expectedMessage) {
  const fixture = { ...documents };
  mutate(fixture);
  expectIncludes(name, validateRegistryDocuments(registry, fixture), expectedMessage);
}

function expectPackageFailure(name, mutate, expectedMessage) {
  const fixture = clone(packageJson);
  mutate(fixture);
  expectIncludes(name, validatePackageScripts(fixture), expectedMessage);
}

function expectWorkflowFailure(name, fixture, expectedMessage) {
  expectIncludes(name, validateWorkflow(fixture), expectedMessage);
}

function expectDiscoveryFailure(name, fixture, expectedMessage) {
  expectIncludes(name, validateDiscoverySource(fixture), expectedMessage);
}

function expectNoFailures(name, failures) {
  assertionCount += 1;
  assert.deepEqual(failures, [], `${name} unexpectedly failed:\n${failures.join('\n')}`);
}

function expectThrowsCode(name, callback, expectedCode) {
  assertionCount += 1;
  assert.throws(
    callback,
    error => error instanceof Error && error.message === expectedCode,
    `${name} must fail with the sanitized code ${expectedCode}`,
  );
}

function expectIncludes(name, failures, expectedMessage) {
  assertionCount += 1;
  assert.ok(
    failures.some(failure => failure.includes(expectedMessage)),
    `${name} did not report ${JSON.stringify(expectedMessage)}:\n${failures.join('\n')}`,
  );
}

function ok(value, message) {
  assertionCount += 1;
  assert.ok(value, message);
}

function equal(actual, expected, message) {
  assertionCount += 1;
  assert.equal(actual, expected, message);
}

function notEqual(actual, expected, message) {
  assertionCount += 1;
  assert.notEqual(actual, expected, message);
}

function deepEqual(actual, expected, message) {
  assertionCount += 1;
  assert.deepEqual(actual, expected, message);
}

function array(value) {
  return Array.isArray(value) ? value : [value];
}
