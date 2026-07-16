#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  CANDIDATE_IDS,
  computeRegistryDigest as computeDiscoveryRegistryDigest,
  summarize as summarizeDiscoveryRecords,
  validateWorkspaceObservation,
} from './discover-seis-local-workspaces.mjs';

export const REGISTRY_PATH = 'data/seis-local-workspace-registry.json';
export const SCHEMA_PATH = 'data/seis-local-workspace-registry.schema.json';
export const REVIEW_PATH = 'docs/reviews/SEIS_WORKSPACE_UNIFICATION_REVIEW.md';
export const STATUS_PATH = 'docs/STATUS.md';
export const BACKLOG_PATH = 'docs/roadmap/MASTER_BACKLOG.md';
export const QUEUE_PATH = 'docs/roadmap/NEXT_PR_QUEUE.md';

export const EXPECTED_SCHEMA_VERSION = 1;
export const EXPECTED_SCHEMA_DIGEST =
  'sha256:c351e32dd2c0e7f5049b22232789b16ea0900a4d7f988dd58a58b0cfbc24c75f';
export const EXPECTED_DATASET_ID = 'seis-local-workspace-registry-2026-07-14';
export const EXPECTED_GOAL_ID = 'OPS-GOAL-0002';
export const EXPECTED_REPOSITORY_SLUG = 'emirhankudun-ux/SEIS';
export const EXPECTED_RECORD_COUNT = 4;
export const EXPECTED_REGISTRY_DIGEST =
  'sha256:5ad26241ec18c6f5ca122637b1b7989123ef1f854c52c7f1cfb61daa8bca6bcf';
export const EXPECTED_DIRTY_COUNTS = Object.freeze({
  modified: 158,
  deleted: 865,
  untracked: 93,
  total: 1116,
});

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

export const METADATA_BLOCK_BEGIN = '<!-- BEGIN OPS-GOAL-0002 REGISTRY METADATA -->';
export const METADATA_BLOCK_END = '<!-- END OPS-GOAL-0002 REGISTRY METADATA -->';
export const REVIEW_TABLE_BEGIN = '<!-- BEGIN OPS-GOAL-0002 WORKSPACE TABLE -->';
export const REVIEW_TABLE_END = '<!-- END OPS-GOAL-0002 WORKSPACE TABLE -->';

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
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const EXPECTED_WORKFLOW_RUN_COMMANDS = Object.freeze([
  'npm ci',
  'npm run check:seis-governance-foundation',
  'npm run check:open-source-governance',
  'npm run seis:check',
  'npm run check:workspace',
  'npm run check:seis-platform-language-policy',
  'npm run check:foundation',
  'npm run check:goal-tracking',
  'npm run check:ecosystem-foundation',
  'npm run test:ecosystem-foundation',
  'npm run check:seis-open-pr-portfolio',
  'npm run test:seis-open-pr-portfolio',
  'npm run check:seis-local-workspace-registry',
  'npm run test:seis-local-workspace-registry',
  'npm run check:plugin-interface-roadmap',
  'npm run check:seis-code',
  'npm run check:mythic-gacha',
  'npm run check:video-hero-showcase',
  'npm run audit:ai-providers',
]);
const EXPECTED_WORKFLOW_ACTIONS = Object.freeze([
  'actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10',
  'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e',
]);
const EXPECTED_WORKFLOW_SOURCE_DIGEST =
  'sha256:34dde3583605457e02c2ea6b721a7c17d7f504a2abbee8f3bab63dac6da54d15';
const JSON_SCHEMA_PATTERN_MATCHERS = new Map([
  [
    '^seis-local-workspace-live-observation-[0-9]{8}T[0-9]{6}Z$',
    /^seis-local-workspace-live-observation-[0-9]{8}T[0-9]{6}Z$/,
  ],
  ['Z$', /Z$/],
  ['^sha256:[0-9a-f]{64}$', /^sha256:[0-9a-f]{64}$/],
]);

const FORBIDDEN_PUBLIC_KEYS = new Set([
  'path',
  'relativePath',
  'absolutePath',
  'realPath',
  'homePath',
  'remote',
  'remoteUrl',
  'url',
  'host',
  'hostname',
  'username',
  'accountName',
  'fileName',
  'fileNames',
  'fileContents',
  'externalSymlinkTarget',
]);
const SECRET_PATTERNS = Object.freeze([
  [/-----BEGIN (?:OPENSSH|RSA|EC|DSA|PGP) PRIVATE KEY-----/i, 'private-key block'],
  [/(?:ghp_|github_pat_)[A-Za-z0-9_]{12,}/, 'GitHub token'],
  [/\bsk-[A-Za-z0-9_-]{20,}/, 'provider-style key'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access-key identifier'],
  [
    /\b(?:password|passwd|token|secret|api[_-]?key|private[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/i,
    'credential assignment',
  ],
]);
const PRIVATE_LOCATION_PATTERNS = Object.freeze([
  [/(?:^|["'\s])\/(?:Users|home|private|var|etc|tmp)\//i, 'absolute local path'],
  [/(?:^|["'\s])[A-Za-z]:[\\/]/, 'Windows absolute path'],
  [/(?:^|[\s"'])~\//, 'home-relative path'],
  [/(?:^|[\s"'])\.\.?(?:\/|\\)/, 'path-escape locator'],
  [/(?:https?|ssh|file):\/\//i, 'remote or local URL'],
  [/\bgit@[^\s:]+:/i, 'SCP-style remote URL'],
]);
const UNSAFE_COMMAND_PATTERNS = Object.freeze([
  [/\brm\s+\S/i, 'filesystem removal'],
  [/\b(?:mv|cp|mkdir|touch|chmod|chown)\s+\S/i, 'filesystem mutation'],
  [/\bfind\b[^\n]*(?:-delete|-exec\s+rm\b)/i, 'destructive find'],
  [/\bsed\s+(?:-[^\s]*i[^\s]*|--in-place)\b/i, 'in-place rewrite'],
  [
    /\bgit\s+(?:add|am|apply|checkout|cherry-pick|clone|commit|config|fetch|gc|init|merge|pull|push|rebase|reflog|repack|replace|restore|revert|stash|switch|symbolic-ref|update-index|update-ref)\b/i,
    'Git mutation',
  ],
  [/\bgit\s+submodule\s+update\b/i, 'Git submodule mutation'],
  [/\bgit\s+lfs\s+pull\b/i, 'Git LFS mutation'],
  [
    /\bgit\s+remote\s+(?:add|remove|rename|set-head|set-url|prune|update)\b/i,
    'Git remote mutation',
  ],
  [/\bgit\s+notes\s+(?:add|append|copy|edit|merge|prune|remove)\b/i, 'Git notes mutation'],
  [
    /\bgit\s+tag\s+(?!--list\b|-l\b|--points-at\b|--contains\b|--no-contains\b|-n\b)\S+/i,
    'Git tag mutation',
  ],
  [/\bgit\s+(?:reset|clean)\b/i, 'destructive Git command'],
  [/\bgit\s+checkout\s+--(?:\s|$)/i, 'Git checkout rewrite'],
  [
    /\bgit\s+branch\s+(?:-[dDmMcC]|--delete|--move|--copy|--edit-description|--set-upstream-to|--unset-upstream)\b/i,
    'Git branch mutation',
  ],
  [/\bgit\s+worktree\s+(?:add|lock|move|prune|remove|repair|unlock)\b/i, 'Git worktree mutation'],
  [
    /\bgh\s+pr\s+(?:close|comment|edit|merge|ready|reopen|review)\b/i,
    'GitHub pull-request mutation',
  ],
  [/\bgh\s+issue\s+(?:close|comment|create|delete|edit|reopen)\b/i, 'GitHub issue mutation'],
  [/\bgh\s+release\s+(?:create|delete|edit|upload)\b/i, 'GitHub release mutation'],
  [/\bgh\s+workflow\s+(?:disable|enable|run)\b/i, 'GitHub workflow mutation'],
  [
    /\bgh\s+api\b[^\n]*(?:(?:--method|-X)\s*=?\s*(?:POST|PUT|PATCH|DELETE)\b|(?:--field|-f)\s+)/i,
    'GitHub API mutation',
  ],
  [
    /\bcurl\b[^\n]*(?:(?:--request|-X)\s*=?\s*(?:POST|PUT|PATCH|DELETE)\b|(?:--data(?:-ascii|-binary|-raw|-urlencode)?|-d|--form|-F|--upload-file|-T)\s+)/i,
    'HTTP mutation',
  ],
]);

const RECORD_CONTRACTS = Object.freeze({
  'direct-seis-intake': {
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
    humanApprovalRequired: true,
  },
  'ops2-task-worktree': {
    kind: 'task-worktree',
    repositorySlug: EXPECTED_REPOSITORY_SLUG,
    gitCommonRootId: 'shared-seis-common-root',
    gitState: 'valid',
    worktreeState: 'unverified',
    routingDecision: 'blocked',
    writeEligibleAtObservation: false,
    dirtyCounts: { modified: 0, deleted: 0, untracked: 0, total: 0 },
    divergence: null,
    evidenceMethods: [
      'git-branch-show-current',
      'git-common-dir',
      'git-origin-slug',
      'git-rev-parse',
      'git-status-porcelain-v1-uall-counts',
    ],
    reasonCodes: [
      'canonical-repository-slug-verified',
      'focused-goal-worktree',
      'gitlink-state-not-observed',
      'mutation-not-authorized',
    ],
    humanApprovalRequired: true,
  },
  'shared-seis-common-root': {
    kind: 'git-common-root',
    repositorySlug: EXPECTED_REPOSITORY_SLUG,
    gitCommonRootId: 'shared-seis-common-root',
    gitState: 'valid',
    worktreeState: 'dirty',
    routingDecision: 'recovery-read-only',
    writeEligibleAtObservation: false,
    dirtyCounts: EXPECTED_DIRTY_COUNTS,
    evidenceMethods: [
      'git-common-dir',
      'git-origin-slug',
      'git-rev-list-left-right-count',
      'git-rev-parse',
      'git-status-porcelain-v1-uall-counts',
    ],
    reasonCodes: [
      'canonical-repository-slug-verified',
      'dirty-shared-common-root',
      'mutation-not-authorized',
      'recovery-human-approval-required',
    ],
    humanApprovalRequired: true,
  },
  'workspace-metadata': {
    kind: 'workspace-root-metadata',
    repositorySlug: null,
    gitCommonRootId: null,
    gitState: 'incomplete-metadata',
    worktreeState: 'not-applicable',
    routingDecision: 'blocked',
    writeEligibleAtObservation: false,
    dirtyCounts: null,
    divergence: null,
    evidenceMethods: ['filesystem-metadata-presence', 'git-rev-parse'],
    reasonCodes: [
      'incomplete-git-metadata',
      'mutation-not-authorized',
      'recovery-human-approval-required',
    ],
    humanApprovalRequired: true,
  },
});

export function computeRegistryDigest(registry) {
  return computeDiscoveryRegistryDigest(registry);
}

export function summarizeRegistry(records) {
  return summarizeDiscoveryRecords(records);
}

export function validateRegistryData(
  registry,
  {
    expectedCount = EXPECTED_RECORD_COUNT,
    expectedDigest = EXPECTED_REGISTRY_DIGEST,
    expectedDirtyCounts = EXPECTED_DIRTY_COUNTS,
  } = {},
) {
  const failures = [];
  const fail = message => failures.push(message);
  if (!isPlainObject(registry)) return ['registry root must be an object'];

  failures.push(
    ...validateWorkspaceObservation(registry, { expectedDatasetId: EXPECTED_DATASET_ID }),
  );

  requireExactKeys(registry, TOP_LEVEL_KEYS, 'registry', fail);
  rejectForbiddenPublicKeys(registry, fail);
  if (registry.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    fail(`schemaVersion must be ${EXPECTED_SCHEMA_VERSION}`);
  }
  if (registry.datasetId !== EXPECTED_DATASET_ID) {
    fail(`datasetId must be ${EXPECTED_DATASET_ID}`);
  }
  if (registry.goalId !== EXPECTED_GOAL_ID) fail(`goalId must be ${EXPECTED_GOAL_ID}`);
  if (registry.canonicalRepositorySlug !== EXPECTED_REPOSITORY_SLUG) {
    fail(`canonicalRepositorySlug must be ${EXPECTED_REPOSITORY_SLUG}`);
  }
  if (!isExactUtcTimestamp(registry.capturedAt)) {
    fail('capturedAt must be an exact UTC timestamp');
  }
  if (!DIGEST_PATTERN.test(registry.digest || '')) {
    fail('digest must be a lowercase sha256 digest');
  }

  validateScope(registry.scope, expectedCount, fail);
  validatePolicy(registry.policy, fail);

  if (!Array.isArray(registry.records) || registry.records.length === 0) {
    fail('records must be a non-empty array');
    return failures;
  }
  if (expectedCount !== null && registry.records.length !== expectedCount) {
    fail(`records.length must equal the immutable expected count ${expectedCount}`);
  }
  if (registry.scope?.candidateCount !== registry.records.length) {
    fail('scope.candidateCount must equal records.length');
  }
  const recordIds = registry.records.map(record => record?.id);
  if (!arraysEqual(recordIds, CANDIDATE_IDS)) {
    fail('records must contain the four canonical candidate IDs in exact order');
  }
  if (new Set(recordIds).size !== recordIds.length) fail('record IDs must be unique');

  for (const [index, record] of registry.records.entries()) {
    const label = `records[${index}]`;
    if (!isPlainObject(record)) {
      fail(`${label} must be an object`);
      continue;
    }
    validateRecord(record, label, registry.capturedAt, expectedDirtyCounts, fail);
  }
  validateRouting(registry.records, fail);

  const calculatedSummary = summarizeRegistry(registry.records);
  if (!jsonEquivalent(registry.summary, calculatedSummary)) {
    fail('summary does not match the workspace records');
  } else if (isPlainObject(registry.summary)) {
    requireExactKeys(registry.summary, SUMMARY_KEYS, 'summary', fail);
  }
  if (registry.summary?.totalRecords !== registry.records.length) {
    fail('summary.totalRecords must equal records.length');
  }
  if (registry.summary?.writeEligibleAtObservationRecords !== 0) {
    fail('summary.writeEligibleAtObservationRecords must be exactly 0 for the frozen snapshot');
  }

  const calculatedDigest = computeRegistryDigest(registry);
  if (registry.digest !== calculatedDigest) {
    fail('digest does not match the canonical registry payload');
  }
  if (expectedDigest !== null && registry.digest !== expectedDigest) {
    fail(`digest must equal the immutable expected digest ${expectedDigest}`);
  }

  const latestObservedAt = registry.records
    .map(record => record?.observedAt)
    .filter(isExactUtcTimestamp)
    .sort()
    .at(-1);
  if (latestObservedAt && latestObservedAt !== registry.capturedAt) {
    fail('capturedAt must equal the latest per-record observation boundary');
  }

  scanRegistryPrivacy(registry, fail);
  return failures;
}

export function validateRegistrySchema(schema) {
  const failures = [];
  const fail = message => failures.push(message);
  if (!isPlainObject(schema)) return ['schema root must be an object'];
  if (computeValueDigest(schema) !== EXPECTED_SCHEMA_DIGEST) {
    fail('schema must match the frozen canonical schema digest');
  }
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
    fail('schema must use JSON Schema draft 2020-12');
  }
  if (schema.$id !== 'urn:seis:schema:local-workspace-observation:v1') {
    fail('schema must use the canonical local workspace observation identifier');
  }
  if (schema.type !== 'object' || schema.additionalProperties !== false) {
    fail('schema root must be a closed object');
  }
  if (!arraysEqual(schema.required, TOP_LEVEL_KEYS)) {
    fail('schema required root fields must match the registry contract');
  }
  if (schema.properties?.schemaVersion?.const !== EXPECTED_SCHEMA_VERSION) {
    fail('schema must freeze schemaVersion');
  }
  if (
    schema.properties?.datasetId?.oneOf?.[0]?.const !== EXPECTED_DATASET_ID ||
    schema.properties?.datasetId?.oneOf?.[1]?.pattern !==
      '^seis-local-workspace-live-observation-[0-9]{8}T[0-9]{6}Z$'
  ) {
    fail('schema datasetId must distinguish the immutable snapshot from live observations');
  }
  if (schema.properties?.goalId?.const !== EXPECTED_GOAL_ID) fail('schema must freeze goalId');
  if (schema.properties?.canonicalRepositorySlug?.const !== EXPECTED_REPOSITORY_SLUG) {
    fail('schema must freeze canonicalRepositorySlug');
  }
  if (
    schema.properties?.records?.minItems !== EXPECTED_RECORD_COUNT ||
    schema.properties?.records?.maxItems !== EXPECTED_RECORD_COUNT
  ) {
    fail('schema must freeze the four-record observation boundary');
  }
  const expectedPrefixItems = [
    '#/$defs/directIntakeRecord',
    '#/$defs/taskWorktreeRecord',
    '#/$defs/sharedCommonRootRecord',
    '#/$defs/workspaceMetadataRecord',
  ];
  const actualPrefixItems = schema.properties?.records?.prefixItems?.map(item => item?.$ref);
  if (
    !arraysEqual(actualPrefixItems, expectedPrefixItems) ||
    schema.properties?.records?.items !== false
  ) {
    fail('schema records must use ordered per-candidate prefix contracts');
  }
  if (!arraysEqual(schema.$defs?.recordId?.enum, CANDIDATE_IDS)) {
    fail('schema recordId enum must match the canonical candidate IDs');
  }
  if (!arraysEqual(schema.$defs?.record?.required, RECORD_KEYS)) {
    fail('schema record required fields must match the record contract');
  }
  if (schema.$defs?.record?.additionalProperties !== false) {
    fail('schema records must reject additional properties');
  }
  for (const [actual, expected, label] of [
    [schema.$defs?.record?.properties?.kind?.enum, RECORD_KINDS, 'kind'],
    [schema.$defs?.record?.properties?.gitState?.enum, GIT_STATES, 'gitState'],
    [schema.$defs?.record?.properties?.worktreeState?.enum, WORKTREE_STATES, 'worktreeState'],
    [schema.$defs?.record?.properties?.routingDecision?.enum, ROUTING_DECISIONS, 'routingDecision'],
    [
      schema.$defs?.record?.properties?.evidenceMethods?.items?.enum,
      EVIDENCE_METHODS,
      'evidenceMethods',
    ],
    [schema.$defs?.record?.properties?.reasonCodes?.items?.enum, REASON_CODES, 'reasonCodes'],
  ]) {
    if (!arraysEqual(actual, expected))
      fail(`schema ${label} enum must match the validator contract`);
  }
  rejectForbiddenPublicKeys(
    schema.$defs?.record?.properties || {},
    fail,
    'schema record properties',
  );
  return failures;
}

export function validateJsonSchemaInstance(schema, instance) {
  const failures = [];
  if (!isPlainObject(schema)) return ['JSON Schema root must be an object'];
  evaluateJsonSchemaNode(schema, instance, schema, '$', failures, 0);
  return failures;
}

function evaluateJsonSchemaNode(schemaNode, instance, rootSchema, path, failures, depth) {
  if (depth > 128) {
    failures.push(`${path} JSON Schema evaluation exceeded the bounded depth`);
    return;
  }
  if (schemaNode === true) return;
  if (schemaNode === false) {
    failures.push(`${path} is rejected by a false schema`);
    return;
  }
  if (!isPlainObject(schemaNode)) {
    failures.push(`${path} encountered an invalid schema node`);
    return;
  }

  const supportedKeywords = new Set([
    '$schema',
    '$id',
    '$defs',
    '$ref',
    'title',
    'type',
    'const',
    'enum',
    'allOf',
    'oneOf',
    'not',
    'if',
    'then',
    'required',
    'properties',
    'additionalProperties',
    'minItems',
    'maxItems',
    'uniqueItems',
    'prefixItems',
    'items',
    'contains',
    'minimum',
    'maximum',
    'pattern',
    'format',
  ]);
  for (const keyword of Object.keys(schemaNode)) {
    if (!supportedKeywords.has(keyword)) {
      failures.push(`${path} uses unsupported JSON Schema keyword ${keyword}`);
    }
  }

  if (typeof schemaNode.$ref === 'string') {
    const resolved = resolveLocalSchemaReference(rootSchema, schemaNode.$ref);
    if (resolved === null) {
      failures.push(`${path} contains an unresolved local JSON Schema reference`);
    } else {
      evaluateJsonSchemaNode(resolved, instance, rootSchema, path, failures, depth + 1);
    }
  }

  if ('const' in schemaNode && !jsonEquivalent(instance, schemaNode.const)) {
    failures.push(`${path} must equal the schema constant`);
  }
  if (
    Array.isArray(schemaNode.enum) &&
    !schemaNode.enum.some(value => jsonEquivalent(instance, value))
  ) {
    failures.push(`${path} must match a schema enum value`);
  }

  if (Array.isArray(schemaNode.allOf)) {
    for (const nested of schemaNode.allOf) {
      evaluateJsonSchemaNode(nested, instance, rootSchema, path, failures, depth + 1);
    }
  }
  if (Array.isArray(schemaNode.oneOf)) {
    const matches = schemaNode.oneOf.filter(nested =>
      schemaNodeMatches(nested, instance, rootSchema, path, depth + 1),
    ).length;
    if (matches !== 1) failures.push(`${path} must match exactly one oneOf branch`);
  }
  if (isPlainObject(schemaNode.not) || schemaNode.not === true || schemaNode.not === false) {
    if (schemaNodeMatches(schemaNode.not, instance, rootSchema, path, depth + 1)) {
      failures.push(`${path} must not match the rejected schema`);
    }
  }
  if (
    (isPlainObject(schemaNode.if) || schemaNode.if === true || schemaNode.if === false) &&
    schemaNodeMatches(schemaNode.if, instance, rootSchema, path, depth + 1) &&
    'then' in schemaNode
  ) {
    evaluateJsonSchemaNode(schemaNode.then, instance, rootSchema, path, failures, depth + 1);
  }

  if ('type' in schemaNode && !matchesJsonSchemaType(instance, schemaNode.type)) {
    failures.push(`${path} must have JSON Schema type ${String(schemaNode.type)}`);
    return;
  }

  if (isPlainObject(instance)) {
    if (Array.isArray(schemaNode.required)) {
      for (const key of schemaNode.required) {
        if (!Object.hasOwn(instance, key))
          failures.push(`${path} must contain required key ${key}`);
      }
    }
    if (isPlainObject(schemaNode.properties)) {
      for (const [key, nested] of Object.entries(schemaNode.properties)) {
        if (Object.hasOwn(instance, key)) {
          evaluateJsonSchemaNode(
            nested,
            instance[key],
            rootSchema,
            `${path}.${key}`,
            failures,
            depth + 1,
          );
        }
      }
      if (schemaNode.additionalProperties === false) {
        for (const key of Object.keys(instance)) {
          if (!Object.hasOwn(schemaNode.properties, key)) {
            failures.push(`${path} must not contain additional key ${key}`);
          }
        }
      }
    }
  }

  if (Array.isArray(instance)) {
    if (Number.isInteger(schemaNode.minItems) && instance.length < schemaNode.minItems) {
      failures.push(`${path} must contain at least ${schemaNode.minItems} items`);
    }
    if (Number.isInteger(schemaNode.maxItems) && instance.length > schemaNode.maxItems) {
      failures.push(`${path} must contain at most ${schemaNode.maxItems} items`);
    }
    if (
      schemaNode.uniqueItems === true &&
      new Set(instance.map(value => stableStringify(value))).size !== instance.length
    ) {
      failures.push(`${path} must contain unique items`);
    }
    const prefixItems = Array.isArray(schemaNode.prefixItems) ? schemaNode.prefixItems : [];
    prefixItems.forEach((nested, index) => {
      if (index < instance.length) {
        evaluateJsonSchemaNode(
          nested,
          instance[index],
          rootSchema,
          `${path}[${index}]`,
          failures,
          depth + 1,
        );
      }
    });
    const itemStart = prefixItems.length;
    if (schemaNode.items === false && instance.length > itemStart) {
      failures.push(`${path} must not contain items beyond prefixItems`);
    } else if (isPlainObject(schemaNode.items) || schemaNode.items === true) {
      const start = prefixItems.length > 0 ? itemStart : 0;
      for (let index = start; index < instance.length; index += 1) {
        evaluateJsonSchemaNode(
          schemaNode.items,
          instance[index],
          rootSchema,
          `${path}[${index}]`,
          failures,
          depth + 1,
        );
      }
    }
    if ('contains' in schemaNode) {
      const containsMatch = instance.some((value, index) =>
        schemaNodeMatches(schemaNode.contains, value, rootSchema, `${path}[${index}]`, depth + 1),
      );
      if (!containsMatch) failures.push(`${path} must contain an item matching contains`);
    }
  }

  if (typeof instance === 'number') {
    if (typeof schemaNode.minimum === 'number' && instance < schemaNode.minimum) {
      failures.push(`${path} must be at least ${schemaNode.minimum}`);
    }
    if (typeof schemaNode.maximum === 'number' && instance > schemaNode.maximum) {
      failures.push(`${path} must be at most ${schemaNode.maximum}`);
    }
  }
  if (typeof instance === 'string') {
    if (typeof schemaNode.pattern === 'string') {
      const pattern = JSON_SCHEMA_PATTERN_MATCHERS.get(schemaNode.pattern);
      if (!pattern) failures.push(`${path} encountered an unsupported schema pattern`);
      else if (!pattern.test(instance)) failures.push(`${path} must match the schema pattern`);
    }
    if (schemaNode.format === 'date-time' && !isSchemaDateTime(instance)) {
      failures.push(`${path} must be a valid date-time`);
    } else if ('format' in schemaNode && schemaNode.format !== 'date-time') {
      failures.push(`${path} uses an unsupported JSON Schema format`);
    }
  }
}

function schemaNodeMatches(schemaNode, instance, rootSchema, path, depth) {
  const nestedFailures = [];
  evaluateJsonSchemaNode(schemaNode, instance, rootSchema, path, nestedFailures, depth);
  return nestedFailures.length === 0;
}

function resolveLocalSchemaReference(rootSchema, reference) {
  if (reference === '#') return rootSchema;
  if (!reference.startsWith('#/')) return null;
  let current = rootSchema;
  for (const rawPart of reference.slice(2).split('/')) {
    const part = rawPart.replaceAll('~1', '/').replaceAll('~0', '~');
    if (!isPlainObject(current) || !Object.hasOwn(current, part)) return null;
    current = current[part];
  }
  return current;
}

function matchesJsonSchemaType(value, type) {
  if (type === 'null') return value === null;
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return isPlainObject(value);
  if (type === 'string') return typeof value === 'string';
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  return false;
}

function isSchemaDateTime(value) {
  if (typeof value !== 'string' || !value.endsWith('Z')) return false;
  const dateTimeParts = value.slice(0, -1).split('T');
  if (dateTimeParts.length !== 2) return false;
  const dateParts = dateTimeParts[0].split('-');
  const timeAndFraction = dateTimeParts[1].split('.');
  if (dateParts.length !== 3 || ![1, 2].includes(timeAndFraction.length)) return false;
  const timeParts = timeAndFraction[0].split(':');
  if (timeParts.length !== 3) return false;
  const componentText = [...dateParts, ...timeParts];
  if (
    !arraysEqual(
      componentText.map(part => part.length),
      [4, 2, 2, 2, 2, 2],
    ) ||
    !componentText.every(isAsciiDigits) ||
    (timeAndFraction.length === 2 &&
      (timeAndFraction[1].length < 1 ||
        timeAndFraction[1].length > 9 ||
        !isAsciiDigits(timeAndFraction[1])))
  ) {
    return false;
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return false;
  const date = new Date(parsed);
  return arraysEqual(componentText.map(Number), [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ]);
}

function isAsciiDigits(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code < 48 || code > 57) return false;
  }
  return true;
}

export function renderRegistryTable(registry) {
  const rows = (registry.records || []).map(
    record =>
      [
        `| ${record.id}`,
        record.kind,
        record.gitState,
        record.worktreeState,
        record.routingDecision,
        record.repositorySlug || 'none',
        record.dirtyCounts ? record.dirtyCounts.total : 'n/a',
        record.humanApprovalRequired ? 'yes' : 'no',
      ].join(' | ') + ' |',
  );
  return [
    '| Opaque ID | Kind | Git state | Worktree state | Routing | Repository | Aggregate changes | Human approval |',
    '| --- | --- | --- | --- | --- | --- | ---: | --- |',
    ...rows,
  ].join('\n');
}

export function registryMetadataLines(registry) {
  const dirty = registry.records?.find(
    record => record.id === 'shared-seis-common-root',
  )?.dirtyCounts;
  return [
    `Goal: \`${registry.goalId}\``,
    `Dataset: \`${REGISTRY_PATH}\``,
    `Dataset ID: \`${registry.datasetId}\``,
    `Record count: \`${registry.summary?.totalRecords} records\``,
    `Registry digest: \`${registry.digest}\``,
    `Captured at: \`${registry.capturedAt}\``,
    `Canonical repository: \`${registry.canonicalRepositorySlug}\``,
    `Write-eligible at observation: \`${registry.summary?.writeEligibleAtObservationRecords}\``,
    `Dirty aggregate: \`${dirty?.modified} modified / ${dirty?.deleted} deleted / ${dirty?.untracked} untracked / ${dirty?.total} total\``,
  ];
}

export function validateRegistryDocuments(registry, documents) {
  const failures = [];
  const fail = message => failures.push(message);
  if (!isPlainObject(documents)) return ['registry documents input must be an object'];
  const metadataLines = registryMetadataLines(registry);

  for (const path of [REVIEW_PATH, STATUS_PATH, BACKLOG_PATH, QUEUE_PATH]) {
    if (typeof documents[path] !== 'string') fail(`${path} registry metadata document is missing`);
  }

  for (const [path, content] of Object.entries(documents)) {
    if (typeof content !== 'string') {
      fail(`${path} document input must be text`);
      continue;
    }
    if (!hasBalancedHtmlComments(content)) {
      fail(`${path} must contain only balanced, non-nested HTML comments`);
    }
    const metadata = extractDelimitedBlock(content, METADATA_BLOCK_BEGIN, METADATA_BLOCK_END);
    if (metadata === null) {
      fail(`${path} must contain exactly one OPS-GOAL-0002 registry metadata block`);
      continue;
    }
    const visibleMetadata = stripHtmlComments(metadata);
    for (const line of metadataLines) {
      if (countOccurrences(visibleMetadata, line) !== 1) {
        fail(`${path} must include exact registry metadata line once: ${line}`);
      }
    }
    scanTextSafety(visibleMetadata, `${path} OPS-GOAL-0002 metadata block`, fail);
  }

  const review = documents[REVIEW_PATH];
  if (typeof review === 'string') {
    const table = extractDelimitedBlock(review, REVIEW_TABLE_BEGIN, REVIEW_TABLE_END);
    if (table !== renderRegistryTable(registry)) {
      fail(`${REVIEW_PATH} workspace table must exactly match the registry`);
    }
  }
  return failures;
}

export function validatePackageScripts(packageJson) {
  const failures = [];
  const required = {
    'check:seis-local-workspace-registry': 'node scripts/check-seis-local-workspace-registry.mjs',
    'test:seis-local-workspace-registry': 'node scripts/test-seis-local-workspace-registry.mjs',
    'inspect:seis-local-workspaces': 'node scripts/discover-seis-local-workspaces.mjs',
  };
  for (const [name, command] of Object.entries(required)) {
    if (packageJson?.scripts?.[name] !== command) failures.push(`package.json must expose ${name}`);
  }
  return failures;
}

export function validateWorkflow(workflow) {
  const failures = [];
  const workflowDigest = `sha256:${createHash('sha256')
    .update(String(workflow || ''))
    .digest('hex')}`;
  if (workflowDigest !== EXPECTED_WORKFLOW_SOURCE_DIGEST) {
    failures.push('foundation workflow must match the frozen source digest');
  }
  const permissionDeclarations = String(workflow || '')
    .split(/\r?\n/)
    .filter(line => /^\s*permissions\s*:/.test(line));
  if (permissionDeclarations.length !== 1 || permissionDeclarations[0] !== 'permissions:') {
    failures.push('foundation workflow must declare exactly one top-level permissions block');
  }
  if (!arraysEqual(extractTopLevelPermissionEntries(workflow), ['contents: read'])) {
    failures.push('foundation workflow top-level permissions must be exactly contents: read');
  }
  const stepCount = String(workflow || '')
    .split(/\r?\n/)
    .filter(line => line.trim() === '- name: Run lightweight checks').length;
  if (stepCount !== 1) {
    failures.push('foundation workflow must contain exactly one Run lightweight checks step');
  }
  const commands = extractNamedRunStepCommands(workflow, 'Run lightweight checks');
  for (const command of [
    'npm run check:seis-local-workspace-registry',
    'npm run test:seis-local-workspace-registry',
  ]) {
    if (commands?.filter(line => line === command).length !== 1) {
      failures.push(`foundation workflow must run ${command} exactly once`);
    }
  }
  if (commands?.includes('npm run inspect:seis-local-workspaces')) {
    failures.push('foundation workflow must not run machine-local workspace discovery');
  }
  const runCommands = extractWorkflowRunCommands(workflow);
  if (!arraysEqual(runCommands, EXPECTED_WORKFLOW_RUN_COMMANDS)) {
    failures.push('foundation workflow run commands and order must match the frozen allowlist');
  }
  if (!arraysEqual(extractWorkflowUses(workflow), EXPECTED_WORKFLOW_ACTIONS)) {
    failures.push('foundation workflow actions must match the exact SHA-pinned allowlist');
  }
  if (containsUnsafeMutationCommand(workflow)) {
    failures.push('foundation workflow must not contain a direct mutation command');
  }
  return failures;
}

export function validateDiscoverySource(source) {
  const failures = [];
  const value = String(source || '');
  for (const required of [
    'EXPECTED_TASK_BRANCH',
    'core.fsmonitor=false',
    'liveDatasetId',
    'repositorySlugFromRemote',
    'export function safeGitEnvironment',
    'validateWorkspaceObservation',
    'ownsCommonGitDirectory',
    'requireSharedGitDirectory',
    'requireTaskGitDirectory',
    'task-git-reverse-pointer-invalid',
    'candidate-identity-collision',
    'sanitizeErrorCode',
    'assertContained(root, resolvedCandidate',
    'process.stdout.write',
    'assertContained',
    'isSymlink',
    'countPorcelain',
  ]) {
    if (!value.includes(required)) failures.push(`discovery source must include ${required}`);
  }
  for (const [pattern, label] of [
    [/GIT_OPTIONAL_LOCKS:\s*['"]0['"]/, 'GIT_OPTIONAL_LOCKS=0'],
    [/GIT_TERMINAL_PROMPT:\s*['"]0['"]/, 'GIT_TERMINAL_PROMPT=0'],
    [/GIT_CONFIG_GLOBAL:\s*['"]\/dev\/null['"]/, 'GIT_CONFIG_GLOBAL=/dev/null'],
    [/GIT_NO_LAZY_FETCH:\s*['"]1['"]/, 'GIT_NO_LAZY_FETCH=1'],
    [/GIT_ATTR_NOSYSTEM:\s*['"]1['"]/, 'GIT_ATTR_NOSYSTEM=1'],
    [/['"]--show-toplevel['"]/, '--show-toplevel'],
    [/['"]--no-includes['"]/, '--no-includes'],
    [/['"]--ignore-submodules=all['"]/, '--ignore-submodules=all'],
    [/['"]-z['"]/, '-z'],
    [/['"]ls-files['"]\s*,\s*['"]--format=%\(objectmode\)['"]/, 'index mode scan'],
    [/isAllowedGitInspectionArgs\(args\)/, 'exact Git argument allowlist'],
    [/isSafeLocalGitConfigKey/, 'local Git configuration allowlist'],
  ]) {
    if (!pattern.test(value)) failures.push(`discovery source must include ${label}`);
  }
  for (const forbidden of [
    'writeFileSync',
    'appendFileSync',
    'rmSync',
    'unlinkSync',
    'renameSync',
    'mkdirSync',
    'git(cwd, ["clean"',
    'git(cwd, ["reset"',
    'git(cwd, ["restore"',
    'git(cwd, ["worktree", "remove"',
  ]) {
    if (value.includes(forbidden)) failures.push(`discovery source must not contain ${forbidden}`);
  }
  if (containsUnsafeMutationCommand(value)) {
    failures.push('discovery source must not contain a direct mutation command');
  }
  return failures;
}

export function isContainedCandidatePath(rootPath, candidatePath) {
  if (typeof rootPath !== 'string' || typeof candidatePath !== 'string') return false;
  if (!rootPath.startsWith('/') || !candidatePath.startsWith('/')) return false;
  if (rootPath.includes('\\') || candidatePath.includes('\\')) return false;
  if (rootPath.split('/').includes('..') || candidatePath.split('/').includes('..')) return false;
  const normalize = value =>
    `/${value
      .split('/')
      .filter(part => part && part !== '.')
      .join('/')}`;
  const root = normalize(rootPath).replace(/\/$/, '') || '/';
  const candidate = normalize(candidatePath).replace(/\/$/, '') || '/';
  return root === '/' || candidate === root || candidate.startsWith(`${root}/`);
}

export function containsUnsafeMutationCommand(value) {
  const normalized = String(value ?? '')
    .replace(/\\(?:n|r|t)/gi, ' ')
    .replace(/\\\r?\n/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return UNSAFE_COMMAND_PATTERNS.some(([pattern]) => pattern.test(normalized));
}

function validateScope(scope, expectedCount, fail) {
  if (!isPlainObject(scope)) {
    fail('scope must be an object');
    return;
  }
  requireExactKeys(scope, SCOPE_KEYS, 'scope', fail);
  if (scope.selectionMode !== 'bounded-routing-critical-candidates') {
    fail('scope.selectionMode must be bounded-routing-critical-candidates');
  }
  if (scope.coverage !== 'four-candidate-observation') {
    fail('scope.coverage must be four-candidate-observation');
  }
  if (!arraysEqual(scope.candidateIds, CANDIDATE_IDS)) {
    fail('scope.candidateIds must match the canonical candidate IDs');
  }
  if (scope.candidateCount !== CANDIDATE_IDS.length) {
    fail('scope.candidateCount must be 4');
  }
  if (expectedCount !== null && scope.candidateCount !== expectedCount) {
    fail(`scope.candidateCount must equal the immutable expected count ${expectedCount}`);
  }
  if (!arraysEqual(scope.limitations, SCOPE_LIMITATIONS)) {
    fail('scope.limitations must match the bounded snapshot limitations');
  }
}

function validatePolicy(policy, fail) {
  if (!isPlainObject(policy)) {
    fail('policy must be an object');
    return;
  }
  requireExactKeys(policy, POLICY_KEYS, 'policy', fail);
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

function validateRecord(record, label, capturedAt, expectedDirtyCounts, fail) {
  requireExactKeys(record, RECORD_KEYS, label, fail);
  if (!CANDIDATE_IDS.includes(record.id)) fail(`${label}.id is invalid`);
  if (!RECORD_KINDS.includes(record.kind)) fail(`${label}.kind is invalid`);
  if (!(record.repositorySlug === null || record.repositorySlug === EXPECTED_REPOSITORY_SLUG)) {
    fail(`${label}.repositorySlug must be canonical or null`);
  }
  if (!(record.gitCommonRootId === null || record.gitCommonRootId === 'shared-seis-common-root')) {
    fail(`${label}.gitCommonRootId must resolve to the shared common-root record or null`);
  }
  if (!GIT_STATES.includes(record.gitState)) fail(`${label}.gitState is invalid`);
  if (!WORKTREE_STATES.includes(record.worktreeState)) fail(`${label}.worktreeState is invalid`);
  if (!ROUTING_DECISIONS.includes(record.routingDecision)) {
    fail(`${label}.routingDecision is invalid`);
  }
  if (typeof record.writeEligibleAtObservation !== 'boolean') {
    fail(`${label}.writeEligibleAtObservation must be boolean`);
  }
  if (typeof record.humanApprovalRequired !== 'boolean') {
    fail(`${label}.humanApprovalRequired must be boolean`);
  }
  if (!isExactUtcTimestamp(record.observedAt)) {
    fail(`${label}.observedAt must be an exact UTC timestamp`);
  } else if (
    isExactUtcTimestamp(capturedAt) &&
    Date.parse(record.observedAt) > Date.parse(capturedAt)
  ) {
    fail(`${label}.observedAt must not follow capturedAt`);
  }
  validateEnumArray(record.evidenceMethods, EVIDENCE_METHODS, `${label}.evidenceMethods`, fail);
  validateEnumArray(record.reasonCodes, REASON_CODES, `${label}.reasonCodes`, fail);

  if (record.dirtyCounts !== null)
    validateDirtyCounts(record.dirtyCounts, `${label}.dirtyCounts`, fail);
  if (record.divergence !== null)
    validateDivergence(record.divergence, `${label}.divergence`, fail);

  const contract = RECORD_CONTRACTS[record.id];
  if (contract) {
    for (const key of [
      'kind',
      'repositorySlug',
      'gitCommonRootId',
      'gitState',
      'worktreeState',
      'routingDecision',
      'writeEligibleAtObservation',
      'evidenceMethods',
      'reasonCodes',
      'humanApprovalRequired',
    ]) {
      if (!jsonEquivalent(record[key], contract[key])) {
        fail(`${label}.${key} must match the ${record.id} contract`);
      }
    }
    if (contract.dirtyCounts === null && record.dirtyCounts !== null) {
      fail(`${label}.dirtyCounts must be null for ${record.id}`);
    } else if (contract.dirtyCounts && !jsonEquivalent(record.dirtyCounts, contract.dirtyCounts)) {
      fail(`${label}.dirtyCounts must match the ${record.id} contract`);
    }
    if ('divergence' in contract && contract.divergence === null && record.divergence !== null) {
      fail(`${label}.divergence must be null for ${record.id}`);
    }
  }
  if (record.id === 'shared-seis-common-root') {
    if (!jsonEquivalent(record.dirtyCounts, expectedDirtyCounts)) {
      fail(`${label}.dirtyCounts must match the immutable dirty observation`);
    }
    if (!isPlainObject(record.divergence)) {
      fail(`${label}.divergence must be present for the shared common root`);
    }
  }
  if (record.worktreeState === 'clean' && record.dirtyCounts?.total !== 0) {
    fail(`${label} clean worktrees must have zero aggregate changes`);
  }
  if (record.worktreeState === 'dirty' && !(record.dirtyCounts?.total > 0)) {
    fail(`${label} dirty worktrees must have positive aggregate changes`);
  }
  if (record.worktreeState === 'not-applicable' && record.dirtyCounts !== null) {
    fail(`${label} non-worktree records must not carry dirty counts`);
  }
  if (record.gitState !== 'valid' && record.divergence !== null) {
    fail(`${label} non-valid Git records must not carry divergence metadata`);
  }
}

function validateRouting(records, fail) {
  const eligible = records.filter(record => record?.writeEligibleAtObservation === true);
  if (eligible.length !== 0) fail('the frozen snapshot must not authorize any write route');
  for (const record of records) {
    if (
      record?.routingDecision !== 'task-scoped-write' &&
      record?.writeEligibleAtObservation !== false
    ) {
      fail(`${record.id} non-task routing decisions must not be write eligible`);
    }
    if (record?.worktreeState === 'dirty' && record?.writeEligibleAtObservation !== false) {
      fail(`${record.id} dirty worktrees must never be write eligible`);
    }
    if (record?.worktreeState === 'unverified' && record?.writeEligibleAtObservation !== false) {
      fail(`${record.id} unverified worktrees must never be write eligible`);
    }
    if (record?.routingDecision === 'task-scoped-write') {
      fail(`${record.id} frozen snapshot routing must not grant task-scoped-write`);
    }
  }
}

function validateDirtyCounts(counts, label, fail) {
  if (!isPlainObject(counts)) return;
  requireExactKeys(counts, DIRTY_COUNT_KEYS, label, fail);
  for (const key of DIRTY_COUNT_KEYS) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) {
      fail(`${label}.${key} must be a non-negative integer`);
    }
  }
  if (counts.total !== counts.modified + counts.deleted + counts.untracked) {
    fail(`${label}.total must equal modified + deleted + untracked`);
  }
}

function validateDivergence(divergence, label, fail) {
  if (!isPlainObject(divergence)) return;
  requireExactKeys(divergence, DIVERGENCE_KEYS, label, fail);
  for (const key of ['ahead', 'behind']) {
    if (!Number.isInteger(divergence[key]) || divergence[key] < 0) {
      fail(`${label}.${key} must be a non-negative integer`);
    }
  }
  if (divergence.comparison !== 'local-head-vs-origin-main') {
    fail(`${label}.comparison must be local-head-vs-origin-main`);
  }
}

function validateEnumArray(value, allowed, label, fail) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${label} must be a non-empty array`);
    return;
  }
  if (new Set(value).size !== value.length) fail(`${label} must not contain duplicates`);
  for (const [index, item] of value.entries()) {
    if (!allowed.includes(item)) fail(`${label}[${index}] is invalid`);
  }
}

function scanRegistryPrivacy(registry, fail) {
  walkValues(registry, (key, value, label) => {
    if (typeof value !== 'string') return;
    if (key !== 'canonicalRepositorySlug' && key !== 'repositorySlug' && /[\\/]/.test(value)) {
      fail(`${label} must not contain a path or remote locator`);
    }
    scanTextSafety(value, label, fail);
  });
}

function rejectForbiddenPublicKeys(value, fail, rootLabel = 'registry') {
  walkValues(
    value,
    (key, _nestedValue, label) => {
      if (FORBIDDEN_PUBLIC_KEYS.has(key)) fail(`${label} is a forbidden public registry field`);
    },
    rootLabel,
  );
}

function scanTextSafety(value, label, fail) {
  for (const [pattern, description] of SECRET_PATTERNS) {
    if (pattern.test(String(value))) fail(`${label} must not contain a ${description}`);
  }
  for (const [pattern, description] of PRIVATE_LOCATION_PATTERNS) {
    if (pattern.test(String(value))) fail(`${label} must not contain a ${description}`);
  }
  if (containsUnsafeMutationCommand(value))
    fail(`${label} must not contain a direct mutation command`);
}

function walkValues(value, visitor, label = 'registry', key = null) {
  if (key !== null) visitor(key, value, label);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkValues(item, visitor, `${label}[${index}]`, String(index)));
  } else if (isPlainObject(value)) {
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      walkValues(nestedValue, visitor, `${label}.${nestedKey}`, nestedKey);
    }
  }
}

function requireExactKeys(value, expectedKeys, label, fail) {
  if (!isPlainObject(value)) return;
  const actual = Object.keys(value).sort(compareCanonicalStrings);
  const expected = [...expectedKeys].sort(compareCanonicalStrings);
  if (!arraysEqual(actual, expected))
    fail(`${label} keys must be exactly ${expectedKeys.join(', ')}`);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isExactUtcTimestamp(value) {
  if (typeof value !== 'string' || !ISO_UTC_PATTERN.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().replace('.000Z', 'Z') === value;
}

function compareCanonicalStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function arraysEqual(left, right) {
  return (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value)
    .sort(compareCanonicalStrings)
    .map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
}

function computeValueDigest(value) {
  return `sha256:${createHash('sha256').update(stableStringify(value)).digest('hex')}`;
}

function jsonEquivalent(left, right) {
  return stableStringify(left) === stableStringify(right);
}

function countOccurrences(content, token) {
  if (!token) return 0;
  return String(content).split(token).length - 1;
}

function hasBalancedHtmlComments(content) {
  const tokens = String(content).match(/<!--|-->/g) || [];
  let depth = 0;
  for (const token of tokens) {
    if (token === '<!--') {
      depth += 1;
      if (depth > 1) return false;
    } else {
      depth -= 1;
      if (depth < 0) return false;
    }
  }
  return depth === 0;
}

function stripHtmlComments(content) {
  return String(content).replace(/<!--[^]*?-->/g, '');
}

function extractDelimitedBlock(content, begin, end) {
  if (countOccurrences(content, begin) !== 1 || countOccurrences(content, end) !== 1) return null;
  const start = content.indexOf(begin) + begin.length;
  const finish = content.indexOf(end, start);
  if (finish < start) return null;
  return content.slice(start, finish).replace(/^\r?\n|\r?\n$/g, '');
}

function extractTopLevelPermissionEntries(workflow) {
  const lines = String(workflow || '').split(/\r?\n/);
  const entries = [];
  let inPermissions = false;
  for (const line of lines) {
    if (/^permissions:\s*$/.test(line)) {
      inPermissions = true;
      continue;
    }
    if (inPermissions && /^\S/.test(line)) break;
    if (inPermissions) {
      const trimmed = line.trim();
      const separator = trimmed.indexOf(':');
      if (separator <= 0) continue;
      const key = trimmed.slice(0, separator);
      const value = trimmed
        .slice(separator + 1)
        .trim()
        .split(/\s+/)[0];
      if (/^[A-Za-z-]+$/.test(key) && value) entries.push(`${key}: ${value}`);
    }
  }
  return entries;
}

function extractNamedRunStepCommands(workflow, stepName) {
  const lines = String(workflow || '').split(/\r?\n/);
  const nameIndex = lines.findIndex(line => line.trim() === `- name: ${stepName}`);
  if (nameIndex < 0) return null;
  const stepIndent = lines[nameIndex].match(/^\s*/)[0].length;
  let stepEnd = lines.length;
  for (let index = nameIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    const indentation = line.match(/^\s*/)[0].length;
    if (indentation === stepIndent && line.trim().startsWith('- ')) {
      stepEnd = index;
      break;
    }
    if (indentation < stepIndent) {
      stepEnd = index;
      break;
    }
  }
  const runIndex = lines.findIndex(
    (line, index) => index > nameIndex && index < stepEnd && /^\s+run\s*:\s*\|\s*$/.test(line),
  );
  if (runIndex < 0) return null;
  const indentation = lines[runIndex].match(/^\s*/)[0].length;
  const commands = [];
  for (let index = runIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const currentIndent = line.match(/^\s*/)[0].length;
    if (line.trim() && currentIndent <= indentation) break;
    if (line.trim() && !line.trim().startsWith('#')) commands.push(line.trim());
  }
  return commands;
}

function extractWorkflowRunCommands(workflow) {
  const lines = String(workflow || '').split(/\r?\n/);
  const commands = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(\s*)run\s*:\s*(.*)$/);
    if (!match) continue;
    const indentation = match[1].length;
    const inline = match[2].trim();
    if (inline && inline !== '|') {
      commands.push(inline);
      continue;
    }
    for (index += 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (!line.trim()) continue;
      const currentIndent = line.match(/^\s*/)[0].length;
      if (currentIndent <= indentation) {
        index -= 1;
        break;
      }
      if (!line.trim().startsWith('#')) commands.push(line.trim());
    }
  }
  return commands;
}

function extractWorkflowUses(workflow) {
  return String(workflow || '')
    .split(/\r?\n/)
    .map(line => /^\s*uses\s*:\s*([^\s#]+)/.exec(line)?.[1] || null)
    .filter(Boolean);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function runCli() {
  const failures = [];
  let registry = null;
  let schema = null;
  for (const path of [REGISTRY_PATH, SCHEMA_PATH]) {
    if (!existsSync(path)) failures.push(`missing ${path}`);
  }
  if (existsSync(REGISTRY_PATH)) {
    try {
      registry = readJson(REGISTRY_PATH);
      failures.push(...validateRegistryData(registry));
    } catch (error) {
      failures.push(`${REGISTRY_PATH} must contain valid JSON: ${error.message}`);
    }
  }
  if (existsSync(SCHEMA_PATH)) {
    try {
      schema = readJson(SCHEMA_PATH);
      failures.push(...validateRegistrySchema(schema));
    } catch (error) {
      failures.push(`${SCHEMA_PATH} must contain valid JSON: ${error.message}`);
    }
  }
  if (registry && schema) {
    failures.push(
      ...validateJsonSchemaInstance(schema, registry).map(
        failure => `${REGISTRY_PATH} schema validation: ${failure}`,
      ),
    );
  }
  if (registry) {
    const documents = {};
    for (const path of [REVIEW_PATH, STATUS_PATH, BACKLOG_PATH, QUEUE_PATH]) {
      if (existsSync(path)) documents[path] = readFileSync(path, 'utf8');
    }
    failures.push(...validateRegistryDocuments(registry, documents));
  }
  if (existsSync('package.json'))
    failures.push(...validatePackageScripts(readJson('package.json')));
  if (existsSync('.github/workflows/foundation-check.yml')) {
    failures.push(
      ...validateWorkflow(readFileSync('.github/workflows/foundation-check.yml', 'utf8')),
    );
  }
  if (existsSync('scripts/discover-seis-local-workspaces.mjs')) {
    failures.push(
      ...validateDiscoverySource(
        readFileSync('scripts/discover-seis-local-workspaces.mjs', 'utf8'),
      ),
    );
  }

  if (failures.length > 0) {
    console.error('SEIS local workspace registry check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log('SEIS local workspace registry check passed.');
  console.log(`- records: ${registry.summary.totalRecords}`);
  console.log(
    `- write eligible at observation: ${registry.summary.writeEligibleAtObservationRecords}`,
  );
  console.log(`- digest: ${registry.digest}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) runCli();
