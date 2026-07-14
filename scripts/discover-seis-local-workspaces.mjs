#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const CANONICAL_REPOSITORY_SLUG = 'emirhankudun-ux/SEIS';
export const SNAPSHOT_DATASET_ID = 'seis-local-workspace-registry-2026-07-14';
export const GOAL_ID = 'OPS-GOAL-0002';
export const EXPECTED_TASK_BRANCH = 'audit/seis-workspace-truth-recovery';
export const PROTECTED_DEFAULT_BRANCH = 'main';
export const CANDIDATE_IDS = Object.freeze([
  'direct-seis-intake',
  'ops2-task-worktree',
  'shared-seis-common-root',
  'workspace-metadata',
]);

export const RECORD_KINDS = Object.freeze([
  'workspace-root-metadata',
  'non-git-intake',
  'git-common-root',
  'task-worktree',
]);
export const GIT_STATES = Object.freeze(['valid', 'not-repository', 'incomplete-metadata']);
export const WORKTREE_STATES = Object.freeze(['clean', 'dirty', 'unverified', 'not-applicable']);
export const ROUTING_DECISIONS = Object.freeze([
  'blocked',
  'read-only',
  'recovery-read-only',
  'task-scoped-write',
]);
export const EVIDENCE_METHODS = Object.freeze([
  'filesystem-metadata-presence',
  'git-branch-show-current',
  'git-common-dir',
  'git-index-mode-scan',
  'git-origin-slug',
  'git-rev-list-left-right-count',
  'git-rev-parse',
  'git-status-porcelain-v1-uall-counts',
]);
export const REASON_CODES = Object.freeze([
  'canonical-repository-slug-verified',
  'clean-at-capture',
  'common-root-link-unverified',
  'dirty-shared-common-root',
  'focused-goal-worktree',
  'gitlink-state-not-observed',
  'incomplete-git-metadata',
  'mutation-not-authorized',
  'not-a-git-worktree',
  'repository-identity-unverified',
  'shared-common-dir-not-owned',
  'submodule-state-unverified',
  'task-branch-not-approved',
  'task-worktree-not-clean',
  'recovery-human-approval-required',
]);
export const SCOPE_LIMITATIONS = Object.freeze([
  'does-not-enumerate-all-sibling-worktrees',
  'does-not-authorize-recovery-or-cleanup',
  'snapshot-is-not-live-state',
  'records-may-have-distinct-observation-times',
]);

const TOP_LEVEL_KEYS = Object.freeze([
  'schemaVersion',
  'datasetId',
  'goalId',
  'canonicalRepositorySlug',
  'capturedAt',
  'scope',
  'policy',
  'records',
  'summary',
  'digest',
]);
const SCOPE_KEYS = Object.freeze([
  'selectionMode',
  'coverage',
  'candidateIds',
  'candidateCount',
  'limitations',
]);
const POLICY_KEYS = Object.freeze([
  'disclosureMode',
  'canonicalIdentityField',
  'defaultRoutingDecision',
  'liveDiscoveryMode',
  'snapshotRoutingAuthority',
  'mutationsPerformed',
  'humanApprovalRequiredForRecovery',
]);
const RECORD_KEYS = Object.freeze([
  'id',
  'kind',
  'repositorySlug',
  'gitCommonRootId',
  'gitState',
  'worktreeState',
  'routingDecision',
  'writeEligibleAtObservation',
  'dirtyCounts',
  'divergence',
  'evidenceMethods',
  'reasonCodes',
  'observedAt',
  'humanApprovalRequired',
]);
const SUMMARY_KEYS = Object.freeze([
  'totalRecords',
  'writeEligibleAtObservationRecords',
  'byKind',
  'byGitState',
  'byRoutingDecision',
]);
const DIRTY_COUNT_KEYS = Object.freeze(['modified', 'deleted', 'untracked', 'total']);
const DIVERGENCE_KEYS = Object.freeze(['ahead', 'behind', 'comparison']);
const LIVE_DATASET_PATTERN = /^seis-local-workspace-live-observation-\d{8}T\d{6}Z$/;

const INTERNAL_LOCATORS = Object.freeze({
  directSeisIntake: 'SEIS',
  sharedSeisCommonRoot: join('Github', 'SEIS'),
});

const READ_ONLY_GIT_ARGUMENTS = new Set(
  [
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
  ].map(argumentsList => JSON.stringify(argumentsList)),
);

export function isAllowedGitInspectionArgs(args) {
  return Array.isArray(args) && READ_ONLY_GIT_ARGUMENTS.has(JSON.stringify(args));
}

export function discoverSeisLocalWorkspaces({
  workspaceRoot = resolve(process.cwd(), '..'),
  taskWorktree = process.cwd(),
  capturedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
} = {}) {
  assertUtcTimestamp(capturedAt);

  const root = safeRealDirectory(workspaceRoot, 'workspace-root-invalid');
  const task = safeRealDirectory(taskWorktree, 'task-worktree-invalid');
  assertContained(root, task, 'task-worktree-outside-root');

  const direct = boundedCandidate(
    root,
    INTERNAL_LOCATORS.directSeisIntake,
    'direct-intake-invalid',
  );
  const shared = boundedCandidate(
    root,
    INTERNAL_LOCATORS.sharedSeisCommonRoot,
    'shared-common-root-invalid',
  );
  const candidateRealPaths = [root, task, direct, shared];
  if (new Set(candidateRealPaths).size !== candidateRealPaths.length) {
    throw new Error('candidate-identity-collision');
  }

  assertPassiveGitMarker(root, 'workspace-git-metadata-untrusted');
  assertPassiveGitMarker(direct, 'direct-git-metadata-untrusted');
  const sharedMetadataRoot = requireSharedGitDirectory(shared);
  const expectedTaskGitDir = requireTaskGitDirectory(task, sharedMetadataRoot);

  const observedAt = capturedAt;
  const datasetId = liveDatasetId(capturedAt);
  const sharedGit = inspectGitWorktree(shared, {
    expectedCommonDir: sharedMetadataRoot,
    expectedGitDir: sharedMetadataRoot,
  });
  const taskGit = inspectGitWorktree(task, {
    expectedCommonDir: sharedMetadataRoot,
    expectedGitDir: expectedTaskGitDir,
  });
  const sharedOwnsCommonDir = ownsCommonGitDirectory(shared, sharedGit.commonDir);
  const commonRootLinked =
    sharedGit.valid &&
    taskGit.valid &&
    sharedGit.commonDir !== null &&
    sharedGit.commonDir === taskGit.commonDir &&
    sharedGit.gitDir === sharedMetadataRoot &&
    taskGit.gitDir === expectedTaskGitDir &&
    sharedOwnsCommonDir &&
    sharedGit.repositorySlug === CANONICAL_REPOSITORY_SLUG &&
    taskGit.repositorySlug === CANONICAL_REPOSITORY_SLUG;

  const records = [
    inspectDirectIntake(direct, observedAt),
    inspectTaskWorktree(taskGit, commonRootLinked, sharedOwnsCommonDir, observedAt),
    inspectSharedCommonRoot(sharedGit, commonRootLinked, sharedOwnsCommonDir, observedAt),
    inspectWorkspaceMetadata(root, observedAt),
  ].sort((left, right) => left.id.localeCompare(right.id, 'en'));

  const registry = {
    schemaVersion: 1,
    datasetId,
    goalId: GOAL_ID,
    canonicalRepositorySlug: CANONICAL_REPOSITORY_SLUG,
    capturedAt,
    scope: {
      selectionMode: 'bounded-routing-critical-candidates',
      coverage: 'four-candidate-observation',
      candidateIds: [...CANDIDATE_IDS],
      candidateCount: CANDIDATE_IDS.length,
      limitations: [...SCOPE_LIMITATIONS],
    },
    policy: {
      disclosureMode: 'opaque-workspace-identifiers',
      canonicalIdentityField: 'repositorySlug',
      defaultRoutingDecision: 'blocked',
      liveDiscoveryMode: 'stdout-only',
      snapshotRoutingAuthority: 'none',
      mutationsPerformed: false,
      humanApprovalRequiredForRecovery: true,
    },
    records,
    summary: summarize(records),
  };

  const observation = {
    ...registry,
    digest: computeRegistryDigest(registry),
  };
  const failures = validateWorkspaceObservation(observation, { expectedDatasetId: datasetId });
  if (failures.length > 0) throw new Error('observation-validation-failed');
  return observation;
}

export function liveDatasetId(capturedAt) {
  assertUtcTimestamp(capturedAt);
  return `seis-local-workspace-live-observation-${capturedAt.replace(/[-:]/g, '')}`;
}

export function computeRegistryDigest(registry) {
  const payload = { ...registry };
  delete payload.digest;
  return `sha256:${createHash('sha256').update(stableStringify(payload)).digest('hex')}`;
}

export function summarize(records) {
  const byKind = {
    'workspace-root-metadata': 0,
    'non-git-intake': 0,
    'git-common-root': 0,
    'task-worktree': 0,
  };
  const byGitState = {
    valid: 0,
    'not-repository': 0,
    'incomplete-metadata': 0,
  };
  const byRoutingDecision = {
    blocked: 0,
    'read-only': 0,
    'recovery-read-only': 0,
    'task-scoped-write': 0,
  };

  for (const record of records) {
    if (!isPlainObservationObject(record)) continue;
    byKind[record.kind] = (byKind[record.kind] || 0) + 1;
    byGitState[record.gitState] = (byGitState[record.gitState] || 0) + 1;
    byRoutingDecision[record.routingDecision] =
      (byRoutingDecision[record.routingDecision] || 0) + 1;
  }

  return {
    totalRecords: records.length,
    writeEligibleAtObservationRecords: records.filter(
      record => record?.writeEligibleAtObservation === true,
    ).length,
    byKind,
    byGitState,
    byRoutingDecision,
  };
}

export function validateWorkspaceObservation(observation, { expectedDatasetId = null } = {}) {
  const failures = [];
  const fail = message => failures.push(message);
  if (!isPlainObservationObject(observation)) return ['observation root must be an object'];

  requireObservationKeys(observation, TOP_LEVEL_KEYS, 'observation', fail);
  const liveObservation = LIVE_DATASET_PATTERN.test(observation.datasetId || '');
  if (observation.schemaVersion !== 1) fail('schemaVersion must be 1');
  if (
    observation.datasetId !== SNAPSHOT_DATASET_ID &&
    !LIVE_DATASET_PATTERN.test(observation.datasetId || '')
  ) {
    fail('datasetId must identify the immutable snapshot or a timestamped live observation');
  }
  if (expectedDatasetId !== null && observation.datasetId !== expectedDatasetId) {
    fail(`datasetId must equal ${expectedDatasetId}`);
  }
  if (observation.goalId !== GOAL_ID) fail(`goalId must be ${GOAL_ID}`);
  if (observation.canonicalRepositorySlug !== CANONICAL_REPOSITORY_SLUG) {
    fail(`canonicalRepositorySlug must be ${CANONICAL_REPOSITORY_SLUG}`);
  }
  if (!isExactUtcTimestampValue(observation.capturedAt)) {
    fail('capturedAt must be an exact UTC timestamp');
  } else if (liveObservation && observation.datasetId !== liveDatasetId(observation.capturedAt)) {
    fail('live datasetId must be derived exactly from capturedAt');
  }

  validateObservationScope(observation.scope, fail);
  validateObservationPolicy(observation.policy, fail);

  if (!Array.isArray(observation.records) || observation.records.length !== CANDIDATE_IDS.length) {
    fail(`records must contain exactly ${CANDIDATE_IDS.length} observations`);
    return failures;
  }
  if (
    !arraysEqualObservation(
      observation.records.map(recordValue => recordValue?.id),
      CANDIDATE_IDS,
    )
  ) {
    fail('records must use the canonical candidate IDs in exact order');
  }

  const expectedKinds = {
    'direct-seis-intake': 'non-git-intake',
    'ops2-task-worktree': 'task-worktree',
    'shared-seis-common-root': 'git-common-root',
    'workspace-metadata': 'workspace-root-metadata',
  };
  for (const [index, recordValue] of observation.records.entries()) {
    const label = `records[${index}]`;
    if (!isPlainObservationObject(recordValue)) {
      fail(`${label} must be an object`);
      continue;
    }
    requireObservationKeys(recordValue, RECORD_KEYS, label, fail);
    if (recordValue.kind !== expectedKinds[recordValue.id]) {
      fail(`${label}.kind must match its canonical candidate ID`);
    }
    if (!RECORD_KINDS.includes(recordValue.kind)) fail(`${label}.kind is invalid`);
    if (
      recordValue.repositorySlug !== null &&
      recordValue.repositorySlug !== CANONICAL_REPOSITORY_SLUG
    ) {
      fail(`${label}.repositorySlug must be canonical or null`);
    }
    if (
      recordValue.gitCommonRootId !== null &&
      recordValue.gitCommonRootId !== 'shared-seis-common-root'
    ) {
      fail(`${label}.gitCommonRootId must be the shared common-root ID or null`);
    }
    if (!GIT_STATES.includes(recordValue.gitState)) fail(`${label}.gitState is invalid`);
    if (!WORKTREE_STATES.includes(recordValue.worktreeState)) {
      fail(`${label}.worktreeState is invalid`);
    }
    if (!ROUTING_DECISIONS.includes(recordValue.routingDecision)) {
      fail(`${label}.routingDecision is invalid`);
    }
    if (typeof recordValue.writeEligibleAtObservation !== 'boolean') {
      fail(`${label}.writeEligibleAtObservation must be boolean`);
    }
    if (typeof recordValue.humanApprovalRequired !== 'boolean') {
      fail(`${label}.humanApprovalRequired must be boolean`);
    }
    validateObservationEnumArray(
      recordValue.evidenceMethods,
      EVIDENCE_METHODS,
      `${label}.evidenceMethods`,
      fail,
    );
    validateObservationEnumArray(
      recordValue.reasonCodes,
      REASON_CODES,
      `${label}.reasonCodes`,
      fail,
    );
    if (!isExactUtcTimestampValue(recordValue.observedAt)) {
      fail(`${label}.observedAt must be an exact UTC timestamp`);
    } else if (
      isExactUtcTimestampValue(observation.capturedAt) &&
      Date.parse(recordValue.observedAt) > Date.parse(observation.capturedAt)
    ) {
      fail(`${label}.observedAt must not follow capturedAt`);
    } else if (liveObservation && recordValue.observedAt !== observation.capturedAt) {
      fail(`${label}.observedAt must equal capturedAt for a live observation`);
    }

    validateObservationDirtyCounts(recordValue.dirtyCounts, `${label}.dirtyCounts`, fail);
    validateObservationDivergence(recordValue.divergence, `${label}.divergence`, fail);
    validateObservationRecordSemantics(recordValue, label, fail, { liveObservation });
  }

  const eligible = observation.records.filter(
    recordValue => recordValue?.writeEligibleAtObservation === true,
  );
  if (eligible.length > 1) fail('at most one observation may be write eligible');
  if (eligible.length === 1 && eligible[0].id !== 'ops2-task-worktree') {
    fail('only the OPS2 task worktree may be write eligible');
  }

  const calculatedSummary = summarize(observation.records);
  if (!isPlainObservationObject(observation.summary)) {
    fail('summary must be an object');
  } else {
    requireObservationKeys(observation.summary, SUMMARY_KEYS, 'summary', fail);
    if (stableStringify(observation.summary) !== stableStringify(calculatedSummary)) {
      fail('summary must match the observation records');
    }
    if (
      !Number.isInteger(observation.summary.writeEligibleAtObservationRecords) ||
      observation.summary.writeEligibleAtObservationRecords < 0 ||
      observation.summary.writeEligibleAtObservationRecords > 1
    ) {
      fail('summary.writeEligibleAtObservationRecords must be 0 or 1');
    }
  }

  if (!/^sha256:[0-9a-f]{64}$/.test(observation.digest || '')) {
    fail('digest must be a lowercase sha256 digest');
  } else if (observation.digest !== computeRegistryDigest(observation)) {
    fail('digest must match the canonical observation payload');
  }
  const latestObservedAt = observation.records
    .map(recordValue => recordValue?.observedAt)
    .filter(isExactUtcTimestampValue)
    .sort()
    .at(-1);
  if (latestObservedAt && latestObservedAt !== observation.capturedAt) {
    fail('capturedAt must equal the latest record observation boundary');
  }
  return failures;
}

function validateObservationScope(scope, fail) {
  if (!isPlainObservationObject(scope)) {
    fail('scope must be an object');
    return;
  }
  requireObservationKeys(scope, SCOPE_KEYS, 'scope', fail);
  if (scope.selectionMode !== 'bounded-routing-critical-candidates') {
    fail('scope.selectionMode is invalid');
  }
  if (scope.coverage !== 'four-candidate-observation') fail('scope.coverage is invalid');
  if (!arraysEqualObservation(scope.candidateIds, CANDIDATE_IDS)) {
    fail('scope.candidateIds must match the canonical candidate IDs');
  }
  if (scope.candidateCount !== CANDIDATE_IDS.length) fail('scope.candidateCount must be 4');
  if (!arraysEqualObservation(scope.limitations, SCOPE_LIMITATIONS)) {
    fail('scope.limitations must match the bounded observation limitations');
  }
}

function validateObservationPolicy(policy, fail) {
  if (!isPlainObservationObject(policy)) {
    fail('policy must be an object');
    return;
  }
  requireObservationKeys(policy, POLICY_KEYS, 'policy', fail);
  const expected = {
    disclosureMode: 'opaque-workspace-identifiers',
    canonicalIdentityField: 'repositorySlug',
    defaultRoutingDecision: 'blocked',
    liveDiscoveryMode: 'stdout-only',
    snapshotRoutingAuthority: 'none',
    mutationsPerformed: false,
    humanApprovalRequiredForRecovery: true,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (policy[key] !== value) fail(`policy.${key} must be ${String(value)}`);
  }
}

function validateObservationRecordSemantics(recordValue, label, fail, { liveObservation }) {
  const hasReason = reason =>
    Array.isArray(recordValue.reasonCodes) && recordValue.reasonCodes.includes(reason);
  const hasEvidence = method =>
    Array.isArray(recordValue.evidenceMethods) && recordValue.evidenceMethods.includes(method);
  const validGit = recordValue.gitState === 'valid';
  if (validGit && !isPlainObservationObject(recordValue.dirtyCounts)) {
    fail(`${label}.dirtyCounts must be present for valid Git observations`);
  }
  if (!validGit && recordValue.dirtyCounts !== null) {
    fail(`${label}.dirtyCounts must be null outside valid Git observations`);
  }
  if (!validGit && recordValue.worktreeState !== 'not-applicable') {
    fail(`${label}.worktreeState must be not-applicable outside valid Git observations`);
  }
  if (validGit && recordValue.worktreeState === 'not-applicable') {
    fail(`${label}.worktreeState must describe a valid Git observation`);
  }
  if (recordValue.worktreeState === 'clean' && recordValue.dirtyCounts?.total !== 0) {
    fail(`${label} clean state must have zero aggregate changes`);
  }
  if (recordValue.worktreeState === 'dirty' && !(recordValue.dirtyCounts?.total > 0)) {
    fail(`${label} dirty state must have positive aggregate changes`);
  }
  if (
    recordValue.worktreeState === 'unverified' &&
    (!validGit ||
      recordValue.dirtyCounts?.total !== 0 ||
      (!hasReason('submodule-state-unverified') && !hasReason('gitlink-state-not-observed')))
  ) {
    fail(`${label} unverified state must identify an unverified Gitlink boundary`);
  }
  if (!validGit && recordValue.divergence !== null) {
    fail(`${label}.divergence must be null outside valid Git observations`);
  }
  if (recordValue.repositorySlug !== null) {
    if (!hasReason('canonical-repository-slug-verified')) {
      fail(`${label} canonical identity must carry verification evidence`);
    }
    if (!hasEvidence('git-origin-slug')) {
      fail(`${label} canonical identity must carry the Git origin evidence method`);
    }
  }
  if (
    hasReason('canonical-repository-slug-verified') &&
    recordValue.repositorySlug !== CANONICAL_REPOSITORY_SLUG
  ) {
    fail(`${label} canonical verification reason requires the canonical repository slug`);
  }
  if (recordValue.gitCommonRootId !== null) {
    if (
      !['ops2-task-worktree', 'shared-seis-common-root'].includes(recordValue.id) ||
      recordValue.repositorySlug !== CANONICAL_REPOSITORY_SLUG
    ) {
      fail(`${label}.gitCommonRootId requires a canonical task or common-root observation`);
    }
  }

  const writable = recordValue.writeEligibleAtObservation === true;
  if (writable !== (recordValue.routingDecision === 'task-scoped-write')) {
    fail(`${label} write eligibility must agree with task-scoped-write routing`);
  }
  if (recordValue.humanApprovalRequired === writable) {
    fail(`${label} human approval must be required exactly when the observation is not writable`);
  }
  if (recordValue.worktreeState === 'dirty' && writable) {
    fail(`${label} dirty observations must never be write eligible`);
  }
  if (recordValue.worktreeState === 'unverified' && writable) {
    fail(`${label} unverified observations must never be write eligible`);
  }
  if (liveObservation && validGit && !hasEvidence('git-index-mode-scan')) {
    fail(`${label} live valid Git observations must include the index-mode scan evidence`);
  }
  if (writable) {
    if (
      recordValue.id !== 'ops2-task-worktree' ||
      recordValue.kind !== 'task-worktree' ||
      recordValue.repositorySlug !== CANONICAL_REPOSITORY_SLUG ||
      recordValue.gitCommonRootId !== 'shared-seis-common-root' ||
      recordValue.gitState !== 'valid' ||
      recordValue.worktreeState !== 'clean' ||
      recordValue.dirtyCounts?.total !== 0 ||
      !hasReason('focused-goal-worktree') ||
      !hasReason('clean-at-capture') ||
      (liveObservation && !hasEvidence('git-index-mode-scan'))
    ) {
      fail(`${label} writable routing must resolve only to a verified clean OPS2 task worktree`);
    }
  }

  if (recordValue.id === 'direct-seis-intake') {
    if (
      recordValue.repositorySlug !== null ||
      recordValue.gitCommonRootId !== null ||
      recordValue.divergence !== null ||
      writable
    ) {
      fail(`${label} direct intake must remain identity-neutral and non-writable`);
    }
    const expectedRoute = validGit ? 'blocked' : 'read-only';
    if (recordValue.routingDecision !== expectedRoute) {
      fail(`${label} direct intake routing must match its Git state`);
    }
  }
  if (recordValue.id === 'ops2-task-worktree' && recordValue.divergence !== null) {
    fail(`${label} task divergence must remain null`);
  }
  if (recordValue.id === 'shared-seis-common-root') {
    if (writable) fail(`${label} shared common root must never be write eligible`);
    const recoveryRoute =
      recordValue.worktreeState === 'dirty' &&
      recordValue.repositorySlug === CANONICAL_REPOSITORY_SLUG;
    if (recordValue.routingDecision !== (recoveryRoute ? 'recovery-read-only' : 'blocked')) {
      fail(`${label} shared common-root routing must fail closed`);
    }
  }
  if (recordValue.id === 'workspace-metadata' && recordValue.routingDecision !== 'blocked') {
    fail(`${label} workspace metadata must remain blocked`);
  }
}

function validateObservationDirtyCounts(counts, label, fail) {
  if (counts === null) return;
  if (!isPlainObservationObject(counts)) {
    fail(`${label} must be an object or null`);
    return;
  }
  requireObservationKeys(counts, DIRTY_COUNT_KEYS, label, fail);
  for (const key of DIRTY_COUNT_KEYS) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) {
      fail(`${label}.${key} must be a non-negative integer`);
    }
  }
  if (counts.total !== counts.modified + counts.deleted + counts.untracked) {
    fail(`${label}.total must equal modified + deleted + untracked`);
  }
}

function validateObservationDivergence(divergence, label, fail) {
  if (divergence === null) return;
  if (!isPlainObservationObject(divergence)) {
    fail(`${label} must be an object or null`);
    return;
  }
  requireObservationKeys(divergence, DIVERGENCE_KEYS, label, fail);
  for (const key of ['ahead', 'behind']) {
    if (!Number.isInteger(divergence[key]) || divergence[key] < 0) {
      fail(`${label}.${key} must be a non-negative integer`);
    }
  }
  if (divergence.comparison !== 'local-head-vs-origin-main') {
    fail(`${label}.comparison must be local-head-vs-origin-main`);
  }
}

function validateObservationEnumArray(value, allowed, label, fail) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${label} must be a non-empty array`);
    return;
  }
  if (new Set(value).size !== value.length) fail(`${label} must not contain duplicates`);
  for (const [index, item] of value.entries()) {
    if (!allowed.includes(item)) fail(`${label}[${index}] is invalid`);
  }
}

function requireObservationKeys(value, expected, label, fail) {
  if (!isPlainObservationObject(value)) return;
  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...expected].sort();
  if (!arraysEqualObservation(actualKeys, expectedKeys)) {
    fail(`${label} keys must be exactly ${expected.join(', ')}`);
  }
}

function arraysEqualObservation(left, right) {
  return (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function isPlainObservationObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isExactUtcTimestampValue(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) {
    return false;
  }
  const parsed = Date.parse(value);
  return (
    Number.isFinite(parsed) && new Date(parsed).toISOString().replace(/\.000Z$/, 'Z') === value
  );
}

function inspectDirectIntake(candidate, observedAt) {
  const git = inspectGitWorktree(candidate);
  if (git.valid) {
    const worktreeState = classifyWorktreeState(git);
    return record({
      id: 'direct-seis-intake',
      kind: 'non-git-intake',
      repositorySlug: null,
      gitCommonRootId: null,
      gitState: 'valid',
      worktreeState,
      routingDecision: 'blocked',
      writeEligibleAtObservation: false,
      dirtyCounts: git.counts,
      divergence: null,
      evidenceMethods: [
        'git-index-mode-scan',
        'git-rev-parse',
        'git-status-porcelain-v1-uall-counts',
      ],
      reasonCodes: [
        ...(worktreeState === 'unverified' ? ['submodule-state-unverified'] : []),
        'mutation-not-authorized',
        'recovery-human-approval-required',
      ],
      observedAt,
      humanApprovalRequired: true,
    });
  }

  return record({
    id: 'direct-seis-intake',
    kind: 'non-git-intake',
    repositorySlug: null,
    gitCommonRootId: null,
    gitState: 'not-repository',
    worktreeState: 'not-applicable',
    routingDecision: 'read-only',
    writeEligibleAtObservation: false,
    dirtyCounts: null,
    divergence: null,
    evidenceMethods: ['git-rev-parse'],
    reasonCodes: ['not-a-git-worktree', 'mutation-not-authorized'],
    observedAt,
    humanApprovalRequired: true,
  });
}

function inspectTaskWorktree(git, commonRootLinked, sharedOwnsCommonDir, observedAt) {
  const clean = git.valid && git.counts.total === 0 && !git.hasGitlinks;
  const worktreeState = git.valid ? classifyWorktreeState(git) : 'not-applicable';
  const approvedBranch =
    git.branch === EXPECTED_TASK_BRANCH && git.branch !== PROTECTED_DEFAULT_BRANCH;
  const eligible = clean && commonRootLinked && approvedBranch;
  return record({
    id: 'ops2-task-worktree',
    kind: 'task-worktree',
    repositorySlug: commonRootLinked ? CANONICAL_REPOSITORY_SLUG : null,
    gitCommonRootId: commonRootLinked ? 'shared-seis-common-root' : null,
    gitState: git.valid ? 'valid' : 'not-repository',
    worktreeState,
    routingDecision: eligible ? 'task-scoped-write' : 'blocked',
    writeEligibleAtObservation: eligible,
    dirtyCounts: git.valid ? git.counts : null,
    divergence: null,
    evidenceMethods: git.valid
      ? [
          'git-branch-show-current',
          'git-common-dir',
          'git-index-mode-scan',
          'git-origin-slug',
          'git-rev-parse',
          'git-status-porcelain-v1-uall-counts',
        ]
      : ['git-rev-parse'],
    reasonCodes: eligible
      ? ['canonical-repository-slug-verified', 'clean-at-capture', 'focused-goal-worktree']
      : [
          'focused-goal-worktree',
          ...(commonRootLinked
            ? ['canonical-repository-slug-verified']
            : ['repository-identity-unverified']),
          ...(git.valid && git.counts.total > 0 ? ['task-worktree-not-clean'] : []),
          ...(git.valid && git.hasGitlinks ? ['submodule-state-unverified'] : []),
          ...(sharedOwnsCommonDir ? [] : ['shared-common-dir-not-owned']),
          ...(commonRootLinked ? [] : ['common-root-link-unverified']),
          ...(approvedBranch ? [] : ['task-branch-not-approved']),
          'mutation-not-authorized',
        ],
    observedAt,
    humanApprovalRequired: !eligible,
  });
}

function inspectSharedCommonRoot(git, commonRootLinked, sharedOwnsCommonDir, observedAt) {
  const dirty = git.valid && git.counts.total > 0;
  const worktreeState = git.valid ? classifyWorktreeState(git) : 'not-applicable';
  return record({
    id: 'shared-seis-common-root',
    kind: 'git-common-root',
    repositorySlug: commonRootLinked ? CANONICAL_REPOSITORY_SLUG : null,
    gitCommonRootId: commonRootLinked ? 'shared-seis-common-root' : null,
    gitState: git.valid ? 'valid' : 'not-repository',
    worktreeState,
    routingDecision: dirty && commonRootLinked ? 'recovery-read-only' : 'blocked',
    writeEligibleAtObservation: false,
    dirtyCounts: git.valid ? git.counts : null,
    divergence: git.valid ? git.divergence : null,
    evidenceMethods: git.valid
      ? [
          'git-common-dir',
          'git-index-mode-scan',
          'git-origin-slug',
          'git-rev-list-left-right-count',
          'git-rev-parse',
          'git-status-porcelain-v1-uall-counts',
        ]
      : ['git-rev-parse'],
    reasonCodes:
      dirty && commonRootLinked
        ? [
            'canonical-repository-slug-verified',
            'dirty-shared-common-root',
            'mutation-not-authorized',
            'recovery-human-approval-required',
          ]
        : [
            ...(commonRootLinked
              ? ['canonical-repository-slug-verified']
              : ['repository-identity-unverified']),
            ...(sharedOwnsCommonDir ? [] : ['shared-common-dir-not-owned']),
            ...(commonRootLinked ? [] : ['common-root-link-unverified']),
            ...(worktreeState === 'unverified' ? ['submodule-state-unverified'] : []),
            'mutation-not-authorized',
            'recovery-human-approval-required',
          ],
    observedAt,
    humanApprovalRequired: true,
  });
}

function inspectWorkspaceMetadata(root, observedAt) {
  const metadata = join(root, '.git');
  const rootGit = inspectGitWorktree(root);
  const incomplete =
    existsSync(metadata) &&
    !isSymlink(metadata) &&
    (!existsSync(join(metadata, 'HEAD')) || !existsSync(join(metadata, 'config')));
  const worktreeState = rootGit.valid ? classifyWorktreeState(rootGit) : 'not-applicable';

  return record({
    id: 'workspace-metadata',
    kind: 'workspace-root-metadata',
    repositorySlug: rootGit.repositorySlug,
    gitCommonRootId: null,
    gitState: rootGit.valid ? 'valid' : incomplete ? 'incomplete-metadata' : 'not-repository',
    worktreeState,
    routingDecision: 'blocked',
    writeEligibleAtObservation: false,
    dirtyCounts: rootGit.valid ? rootGit.counts : null,
    divergence: null,
    evidenceMethods: rootGit.valid
      ? [
          'filesystem-metadata-presence',
          'git-index-mode-scan',
          'git-origin-slug',
          'git-rev-parse',
          'git-status-porcelain-v1-uall-counts',
        ]
      : ['filesystem-metadata-presence', 'git-rev-parse'],
    reasonCodes: incomplete
      ? ['incomplete-git-metadata', 'mutation-not-authorized', 'recovery-human-approval-required']
      : [
          ...(rootGit.repositorySlug === CANONICAL_REPOSITORY_SLUG
            ? ['canonical-repository-slug-verified']
            : []),
          ...(worktreeState === 'unverified' ? ['submodule-state-unverified'] : []),
          'mutation-not-authorized',
          'recovery-human-approval-required',
        ],
    observedAt,
    humanApprovalRequired: true,
  });
}

function classifyWorktreeState(gitObservation) {
  if (!gitObservation.valid) return 'not-applicable';
  if (gitObservation.counts.total > 0) return 'dirty';
  return gitObservation.hasGitlinks ? 'unverified' : 'clean';
}

function inspectGitWorktree(cwd, { expectedCommonDir = null, expectedGitDir = null } = {}) {
  const marker = join(cwd, '.git');
  if (!existsSync(marker) || isSymlink(marker)) return invalidGitObservation();

  const localConfigNames = git(cwd, [
    'config',
    '--local',
    '--no-includes',
    '--name-only',
    '--list',
  ]);
  if (localConfigNames.error || localConfigNames.status === null) {
    throw new Error('git-inspection-unavailable');
  }
  if (localConfigNames.status !== 0) return invalidGitObservation();
  const localConfigKeys = localConfigNames.stdout.split(/\r?\n/).filter(Boolean);
  localConfigNames.stdout = '';
  localConfigNames.stderr = '';
  if (localConfigKeys.some(key => !isSafeLocalGitConfigKey(key))) {
    throw new Error('git-local-config-not-allowlisted');
  }

  const inside = git(cwd, ['rev-parse', '--is-inside-work-tree']);
  if (inside.error || inside.status === null) {
    throw new Error('git-inspection-unavailable');
  }
  if (inside.status !== 0 || inside.stdout.trim() !== 'true') {
    return invalidGitObservation();
  }

  const topLevelResult = git(cwd, ['rev-parse', '--show-toplevel']);
  const commonDirResult = git(cwd, ['rev-parse', '--git-common-dir']);
  const gitDirResult = git(cwd, ['rev-parse', '--git-dir']);
  const topLevel =
    topLevelResult.status === 0
      ? safeResolvedGitDirectory(cwd, topLevelResult.stdout.trim())
      : null;
  const commonDir =
    commonDirResult.status === 0
      ? safeResolvedGitDirectory(cwd, commonDirResult.stdout.trim())
      : null;
  const gitDir =
    gitDirResult.status === 0 ? safeResolvedGitDirectory(cwd, gitDirResult.stdout.trim()) : null;
  const currentRoot = realpathSync(cwd);
  if (
    topLevel !== currentRoot ||
    commonDir === null ||
    gitDir === null ||
    (expectedCommonDir !== null && commonDir !== expectedCommonDir) ||
    (expectedGitDir !== null && gitDir !== expectedGitDir)
  ) {
    return invalidGitObservation();
  }

  const indexModes = git(cwd, ['ls-files', '--format=%(objectmode)']);
  if (indexModes.error || indexModes.status === null || indexModes.status !== 0) {
    throw new Error('git-index-inspection-unavailable');
  }
  const modes = indexModes.stdout.split(/\r?\n/).filter(Boolean);
  if (modes.some(mode => !/^[0-9]{6}$/.test(mode))) {
    throw new Error('git-index-inspection-unavailable');
  }
  const hasGitlinks = modes.includes('160000');
  const status = git(cwd, [
    'status',
    '--porcelain=v1',
    '-z',
    '-uall',
    '--no-renames',
    '--ignore-submodules=all',
  ]);
  if (status.error || status.status === null) throw new Error('git-inspection-unavailable');
  if (status.status !== 0) {
    return invalidGitObservation();
  }

  const counts = countPorcelain(status.stdout);
  status.stdout = '';
  status.stderr = '';
  const branchResult = git(cwd, ['branch', '--show-current']);
  const branch = branchResult.status === 0 ? branchResult.stdout.trim() : '';
  const remoteResult = git(cwd, [
    'config',
    '--local',
    '--no-includes',
    '--get',
    'remote.origin.url',
  ]);
  const repositorySlug =
    remoteResult.status === 0 ? repositorySlugFromRemote(remoteResult.stdout.trim()) : null;
  const divergenceResult = git(cwd, ['rev-list', '--left-right', '--count', 'origin/main...HEAD']);
  let divergence = null;
  if (divergenceResult.status === 0) {
    const [behindText, aheadText] = divergenceResult.stdout.trim().split(/\s+/);
    const behind = Number.parseInt(behindText, 10);
    const ahead = Number.parseInt(aheadText, 10);
    if (Number.isInteger(ahead) && Number.isInteger(behind)) {
      divergence = { ahead, behind, comparison: 'local-head-vs-origin-main' };
    }
  }

  return {
    valid: true,
    commonDir,
    gitDir,
    counts,
    divergence,
    branch,
    repositorySlug,
    hasGitlinks,
  };
}

export function isSafeLocalGitConfigKey(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 512) return false;
  if (!/^[A-Za-z0-9._/-]+$/.test(value) || value.includes('..')) return false;
  const parts = value.toLowerCase().split('.');
  const section = parts[0];
  const key = parts.at(-1);
  if (
    [
      'alias',
      'credential',
      'difftool',
      'filter',
      'http',
      'include',
      'includeif',
      'maintenance',
      'mergetool',
      'pager',
      'submodule',
      'url',
    ].includes(section)
  ) {
    return false;
  }
  if (section === 'diff' && ['command', 'textconv'].includes(key)) return false;
  if (
    section === 'core' &&
    ['attributesfile', 'excludesfile', 'fsmonitor', 'hookspath', 'sshcommand', 'worktree'].includes(
      key,
    )
  ) {
    return false;
  }
  if (section === 'extensions' && key === 'worktreeconfig') return false;
  return true;
}

function invalidGitObservation() {
  return {
    valid: false,
    commonDir: null,
    gitDir: null,
    counts: null,
    divergence: null,
    branch: '',
    repositorySlug: null,
    hasGitlinks: false,
  };
}

export function repositorySlugFromRemote(value) {
  if (typeof value !== 'string' || value.trim() !== value || value === '') return null;

  const scpMatch = /^git@github\.com:([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/.exec(value);
  if (scpMatch) return `${scpMatch[1]}/${scpMatch[2]}`;

  try {
    const url = new URL(value);
    if (!['https:', 'ssh:'].includes(url.protocol)) return null;
    if (url.hostname !== 'github.com' || url.port || url.search || url.hash) return null;
    if (url.protocol === 'https:' && (url.username || url.password)) return null;
    if (url.protocol === 'ssh:' && (url.username !== 'git' || url.password)) return null;
    const match = /^\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/.exec(url.pathname);
    return match ? `${match[1]}/${match[2]}` : null;
  } catch {
    return null;
  }
}

export function countPorcelain(output) {
  let modified = 0;
  let deleted = 0;
  let untracked = 0;
  const value = String(output);
  const delimiter = value.includes('\0') ? '\0' : '\n';
  for (const line of value.split(delimiter)) {
    if (!line) continue;
    const status = line.slice(0, 2);
    if (status === '??') {
      untracked += 1;
    } else if (status.includes('D')) {
      deleted += 1;
    } else {
      modified += 1;
    }
  }
  return { modified, deleted, untracked, total: modified + deleted + untracked };
}

function git(cwd, args) {
  if (!isAllowedGitInspectionArgs(args)) throw new Error('git-command-not-allowlisted');
  return spawnSync(
    'git',
    [
      '--no-pager',
      '-c',
      'core.fsmonitor=false',
      '-c',
      'core.untrackedCache=false',
      '-c',
      'submodule.recurse=false',
      '-C',
      cwd,
      ...args,
    ],
    {
      encoding: 'utf8',
      env: safeGitEnvironment(),
      maxBuffer: 32 * 1024 * 1024,
    },
  );
}

export function safeGitEnvironment(environment = process.env) {
  return {
    PATH: environment.PATH || '',
    LANG: 'C',
    LC_ALL: 'C',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_ATTR_NOSYSTEM: '1',
    GIT_PAGER: '',
    GIT_NO_LAZY_FETCH: '1',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_TERMINAL_PROMPT: '0',
  };
}

function ownsCommonGitDirectory(sharedRoot, commonDir) {
  if (!commonDir) return false;
  const metadata = join(sharedRoot, '.git');
  if (!existsSync(metadata) || isSymlink(metadata) || !lstatSync(metadata).isDirectory()) {
    return false;
  }
  const metadataRoot = realpathSync(metadata);
  try {
    assertContained(sharedRoot, metadataRoot, 'shared-git-metadata-outside-root');
  } catch {
    return false;
  }
  return metadataRoot === commonDir;
}

function assertPassiveGitMarker(candidate, errorCode) {
  const metadata = join(candidate, '.git');
  if (!existsSync(metadata)) return;
  const stat = lstatSync(metadata);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(errorCode);
}

function requireSharedGitDirectory(sharedRoot) {
  const metadata = join(sharedRoot, '.git');
  if (!existsSync(metadata)) throw new Error('shared-git-metadata-invalid');
  const stat = lstatSync(metadata);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error('shared-git-metadata-invalid');
  }
  const resolvedMetadata = realpathSync(metadata);
  assertContained(sharedRoot, resolvedMetadata, 'shared-git-metadata-outside-root');
  return resolvedMetadata;
}

function requireTaskGitDirectory(taskRoot, sharedMetadataRoot) {
  const marker = join(taskRoot, '.git');
  if (!existsSync(marker)) throw new Error('task-git-metadata-invalid');
  const stat = lstatSync(marker);
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 4096) {
    throw new Error('task-git-metadata-invalid');
  }
  const match = /^gitdir: ([^\r\n]+)\r?\n?$/.exec(readFileSync(marker, 'utf8'));
  if (!match) throw new Error('task-git-metadata-invalid');
  const candidate = isAbsolute(match[1]) ? match[1] : resolve(taskRoot, match[1]);
  if (!existsSync(candidate) || isSymlink(candidate) || !lstatSync(candidate).isDirectory()) {
    throw new Error('task-git-metadata-invalid');
  }
  const resolvedGitDir = realpathSync(candidate);
  const worktreesDirectory = join(sharedMetadataRoot, 'worktrees');
  if (
    !existsSync(worktreesDirectory) ||
    isSymlink(worktreesDirectory) ||
    !lstatSync(worktreesDirectory).isDirectory()
  ) {
    throw new Error('task-git-metadata-invalid');
  }
  const resolvedWorktreesDirectory = realpathSync(worktreesDirectory);
  assertContained(sharedMetadataRoot, resolvedWorktreesDirectory, 'task-git-metadata-invalid');
  if (dirname(resolvedGitDir) !== resolvedWorktreesDirectory) {
    throw new Error('task-git-metadata-outside-worktrees-directory');
  }
  const reversePointer = join(resolvedGitDir, 'gitdir');
  if (!existsSync(reversePointer)) throw new Error('task-git-reverse-pointer-invalid');
  const reversePointerStat = lstatSync(reversePointer);
  if (
    reversePointerStat.isSymbolicLink() ||
    !reversePointerStat.isFile() ||
    reversePointerStat.size > 4096
  ) {
    throw new Error('task-git-reverse-pointer-invalid');
  }
  const reverseMatch = /^([^\r\n]+)\r?\n?$/.exec(readFileSync(reversePointer, 'utf8'));
  if (!reverseMatch) throw new Error('task-git-reverse-pointer-invalid');
  const reverseCandidate = isAbsolute(reverseMatch[1])
    ? reverseMatch[1]
    : resolve(resolvedGitDir, reverseMatch[1]);
  if (
    !existsSync(reverseCandidate) ||
    isSymlink(reverseCandidate) ||
    !lstatSync(reverseCandidate).isFile() ||
    realpathSync(reverseCandidate) !== realpathSync(marker)
  ) {
    throw new Error('task-git-reverse-pointer-invalid');
  }
  return resolvedGitDir;
}

function boundedCandidate(root, locator, errorCode) {
  const candidate = resolve(root, locator);
  assertContained(root, candidate, errorCode);
  if (!existsSync(candidate) || isSymlink(candidate)) throw new Error(errorCode);
  const resolvedCandidate = safeRealDirectory(candidate, errorCode);
  assertContained(root, resolvedCandidate, errorCode);
  return resolvedCandidate;
}

function safeRealDirectory(value, errorCode) {
  if (typeof value !== 'string' || value.trim() === '' || !isAbsolute(resolve(value))) {
    throw new Error(errorCode);
  }
  const absolute = resolve(value);
  if (!existsSync(absolute) || isSymlink(absolute) || !lstatSync(absolute).isDirectory()) {
    throw new Error(errorCode);
  }
  return realpathSync(absolute);
}

function safeResolvedGitDirectory(cwd, value) {
  if (!value) return null;
  const candidate = isAbsolute(value) ? value : resolve(cwd, value);
  if (!existsSync(candidate) || isSymlink(candidate) || !lstatSync(candidate).isDirectory()) {
    return null;
  }
  return realpathSync(candidate);
}

function assertContained(root, candidate, errorCode) {
  const delta = relative(root, candidate);
  if (delta === '' || (!delta.startsWith('..') && !isAbsolute(delta))) return;
  throw new Error(errorCode);
}

function isSymlink(path) {
  return existsSync(path) && lstatSync(path).isSymbolicLink();
}

function assertUtcTimestamp(value) {
  const parsed = Date.parse(value);
  const roundTrip = Number.isFinite(parsed)
    ? new Date(parsed).toISOString().replace(/\.000Z$/, 'Z')
    : '';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) || roundTrip !== value) {
    throw new Error('captured-at-invalid');
  }
}

function record(value) {
  return value;
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
}

function parseArgs(argv) {
  const options = { compact: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--compact') {
      options.compact = true;
      continue;
    }
    if (['--workspace-root', '--task-worktree', '--captured-at'].includes(argument)) {
      const value = argv[index + 1];
      if (!value) throw new Error('argument-value-missing');
      index += 1;
      if (argument === '--workspace-root') options.workspaceRoot = value;
      if (argument === '--task-worktree') options.taskWorktree = value;
      if (argument === '--captured-at') options.capturedAt = value;
      continue;
    }
    throw new Error('argument-unsupported');
  }
  return options;
}

export function runCli(argv = process.argv.slice(2)) {
  try {
    const { compact, ...options } = parseArgs(argv);
    const registry = discoverSeisLocalWorkspaces(options);
    process.stdout.write(`${JSON.stringify(registry, null, compact ? 0 : 2)}\n`);
    return 0;
  } catch (error) {
    const code = sanitizeErrorCode(error);
    process.stderr.write(`SEIS local workspace discovery failed: ${code}\n`);
    return 1;
  }
}

export function sanitizeErrorCode(error) {
  const candidate = error instanceof Error ? error.message : '';
  const safe =
    candidate.length > 0 &&
    candidate.length <= 80 &&
    candidate.split('-').every(part => part.length > 0 && /^[a-z0-9]+$/.test(part));
  return safe ? candidate : 'internal-error';
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  process.exitCode = runCli();
}
