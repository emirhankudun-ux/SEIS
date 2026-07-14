#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const ALLOWED_DISPOSITIONS = Object.freeze([
  'retain',
  'merge-candidate',
  'replace',
  'close-candidate',
  'archive-candidate',
  'superseded',
  'needs-human-review',
]);

export const PROTECTED_PULL_REQUESTS = Object.freeze([177, 179, 180, 182]);

export const EXPECTED_DATASET_ID = 'seis-open-pr-portfolio-2026-07-14';
export const EXPECTED_SNAPSHOT_COUNT = 90;
export const EXPECTED_SNAPSHOT_DIGEST =
  'sha256:7c2b783eb302f9d25f64da5a9221d03e9db3a543abe7384d86b8c46d86c4bd69';
export const EXPECTED_SOURCE_COMMAND =
  "gh api --method GET 'repos/emirhankudun-ux/SEIS/pulls?state=open&per_page=100&sort=created&direction=desc'";

const TOP_LEVEL_KEYS = Object.freeze([
  'schemaVersion',
  'datasetId',
  'goalId',
  'repository',
  'snapshot',
  'policy',
  'classificationSummary',
  'sequence',
  'pullRequests',
]);

const SNAPSHOT_KEYS = Object.freeze([
  'state',
  'retrievedAt',
  'sourceCommand',
  'count',
  'digest',
  'defaultBranchRefName',
  'defaultBranchRefOid',
  'identityFields',
]);

const POLICY_KEYS = Object.freeze([
  'advisoryOnly',
  'githubMutationsPerformed',
  'requiresHumanApprovalForGitHubMutation',
  'allowedDispositions',
  'protectedPullRequests',
]);

const RECORD_KEYS = Object.freeze([
  'number',
  'title',
  'url',
  'isDraft',
  'createdAt',
  'updatedAt',
  'headRefName',
  'headRefOid',
  'baseRefName',
  'baseRefOid',
  'author',
  'labels',
  'classification',
]);

const CLASSIFICATION_KEYS = Object.freeze([
  'disposition',
  'cluster',
  'risk',
  'rationale',
  'evidence',
  'successorPullRequests',
  'dependsOnPullRequests',
  'externalReferences',
  'nextSafeAction',
  'humanApprovalRequired',
]);

const SEQUENCE_KEYS = Object.freeze([
  'order',
  'cluster',
  'prNumbers',
  'gate',
  'rationale',
  'humanApprovalRequired',
]);

export const IDENTITY_FIELDS = Object.freeze([
  'number',
  'title',
  'url',
  'isDraft',
  'createdAt',
  'updatedAt',
  'headRefName',
  'headRefOid',
  'baseRefName',
  'baseRefOid',
  'author',
  'labels',
]);

const RISK_LEVELS = new Set(['low', 'medium', 'high', 'critical']);
const PROTECTED_DISPOSITIONS = new Set(['retain', 'merge-candidate']);
const CLUSTER_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const EXTERNAL_REFERENCE_PATTERNS = Object.freeze([
  /^https:\/\/github\.com\/emirhankudun-ux\/SEIS\/(?:pull|issues)\/\d+$/,
  /^https:\/\/github\.com\/emirhankudun-ux\/SEIS\/actions\/runs\/\d+$/,
  /^(?:issue|PR|merged PR) #\d+$/,
  /^(?:[A-Z][A-Z0-9]*-GOAL-\d{4})(?:#[a-z0-9-]+)?$/,
  /^ADR-\d{4}$/,
  /^docs\/[A-Za-z0-9._/-]+\.md$/,
]);
const REVIEW_SUMMARY_BEGIN = '<!-- BEGIN OPS-GOAL-0001 DISPOSITION SUMMARY -->';
const REVIEW_SUMMARY_END = '<!-- END OPS-GOAL-0001 DISPOSITION SUMMARY -->';
const REVIEW_SEQUENCE_BEGIN = '<!-- BEGIN OPS-GOAL-0001 SEQUENCE -->';
const REVIEW_SEQUENCE_END = '<!-- END OPS-GOAL-0001 SEQUENCE -->';
const REVIEW_TABLE_BEGIN = '<!-- BEGIN OPS-GOAL-0001 PR TABLE -->';
const REVIEW_TABLE_END = '<!-- END OPS-GOAL-0001 PR TABLE -->';
const SENSITIVE_PATTERNS = Object.freeze([
  [/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, 'private-key block'],
  [/(?:ghp_|github_pat_)[A-Za-z0-9_]{12,}/, 'GitHub token'],
  [/\bsk-[A-Za-z0-9_-]{20,}/, 'provider-style key'],
  [/\b(?:password|token|secret|api[_-]?key)\s*[:=]\s*["'][^"']{8,}/i, 'credential assignment'],
  [/(?:file:\/\/|vscode:\/\/|\/Users\/|\/home\/vscode\/)/, 'machine-specific path or editor URI'],
]);

export function computeSnapshotDigest(pullRequests) {
  const identities = pullRequests
    .map(pullRequest =>
      Object.fromEntries(IDENTITY_FIELDS.map(field => [field, pullRequest[field]])),
    )
    .sort((left, right) => left.number - right.number);
  return `sha256:${createHash('sha256').update(JSON.stringify(identities)).digest('hex')}`;
}

export function compareCanonicalStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function summarizePortfolio(pullRequests) {
  const byDisposition = Object.fromEntries(ALLOWED_DISPOSITIONS.map(value => [value, 0]));
  const byCluster = new Map();

  for (const pullRequest of pullRequests) {
    if (!isPlainObject(pullRequest)) continue;
    const disposition = pullRequest.classification?.disposition;
    const cluster = pullRequest.classification?.cluster;
    if (Object.hasOwn(byDisposition, disposition)) byDisposition[disposition] += 1;
    if (typeof cluster === 'string' && cluster.length > 0) {
      byCluster.set(cluster, (byCluster.get(cluster) || 0) + 1);
    }
  }

  return {
    total: pullRequests.length,
    byDisposition,
    byCluster: Object.fromEntries(
      [...byCluster.entries()].sort(([left], [right]) => compareCanonicalStrings(left, right)),
    ),
  };
}

export function validatePortfolioData(
  portfolio,
  {
    expectedCount = EXPECTED_SNAPSHOT_COUNT,
    expectedDigest = expectedCount === EXPECTED_SNAPSHOT_COUNT ? EXPECTED_SNAPSHOT_DIGEST : null,
  } = {},
) {
  const failures = [];
  const fail = message => failures.push(message);

  if (!isPlainObject(portfolio)) return ['portfolio root must be an object'];
  requireExactKeys(portfolio, TOP_LEVEL_KEYS, 'portfolio', fail);
  if (portfolio.schemaVersion !== 1) fail('schemaVersion must be 1');
  if (portfolio.datasetId !== EXPECTED_DATASET_ID) {
    fail(`datasetId must be ${EXPECTED_DATASET_ID}`);
  }
  if (portfolio.goalId !== 'OPS-GOAL-0001') fail('goalId must be OPS-GOAL-0001');
  if (portfolio.repository !== 'emirhankudun-ux/SEIS') {
    fail('repository must be emirhankudun-ux/SEIS');
  }

  const snapshot = portfolio.snapshot;
  if (!isPlainObject(snapshot)) {
    fail('snapshot must be an object');
  } else {
    requireExactKeys(snapshot, SNAPSHOT_KEYS, 'snapshot', fail);
    if (snapshot.state !== 'open') fail('snapshot.state must be open');
    if (!isExactUtcTimestamp(snapshot.retrievedAt)) {
      fail('snapshot.retrievedAt must be an exact UTC timestamp');
    }
    if (snapshot.sourceCommand !== EXPECTED_SOURCE_COMMAND) {
      fail('snapshot.sourceCommand must equal the canonical read-only open-PR query');
    }
    if (
      !Array.isArray(snapshot.identityFields) ||
      !arraysEqual(snapshot.identityFields, IDENTITY_FIELDS)
    ) {
      fail('snapshot.identityFields must match the canonical identity field order');
    }
    if (snapshot.count !== expectedCount) {
      fail(`snapshot.count must equal the immutable expected count ${expectedCount}`);
    }
    if (snapshot.defaultBranchRefName !== 'main') {
      fail('snapshot.defaultBranchRefName must be main');
    }
    if (!isValidSha(snapshot.defaultBranchRefOid)) {
      fail('snapshot.defaultBranchRefOid must be a non-zero 40-character SHA');
    }
  }

  const policy = portfolio.policy;
  if (!isPlainObject(policy)) {
    fail('policy must be an object');
  } else {
    requireExactKeys(policy, POLICY_KEYS, 'policy', fail);
    if (policy.advisoryOnly !== true) fail('policy.advisoryOnly must be true');
    if (policy.githubMutationsPerformed !== false) {
      fail('policy.githubMutationsPerformed must be false');
    }
    if (policy.requiresHumanApprovalForGitHubMutation !== true) {
      fail('policy.requiresHumanApprovalForGitHubMutation must be true');
    }
    if (!arraysEqual(policy.allowedDispositions, ALLOWED_DISPOSITIONS)) {
      fail('policy.allowedDispositions must match the canonical disposition order');
    }
    if (!arraysEqual(policy.protectedPullRequests, PROTECTED_PULL_REQUESTS)) {
      fail('policy.protectedPullRequests must preserve PRs 177, 179, 180, and 182');
    }
  }

  if (!Array.isArray(portfolio.pullRequests) || portfolio.pullRequests.length === 0) {
    fail('pullRequests must be a non-empty array');
    return failures;
  }

  if (snapshot?.count !== portfolio.pullRequests.length) {
    fail('snapshot.count must equal pullRequests.length');
  }

  const numberCounts = countValues(portfolio.pullRequests.map(pullRequest => pullRequest?.number));
  for (const [number, count] of numberCounts) {
    if (count !== 1) fail(`pull request ${number} must appear exactly once`);
  }
  const knownNumbers = new Set(portfolio.pullRequests.map(pullRequest => pullRequest?.number));
  const orderedNumbers = portfolio.pullRequests.map(pullRequest => pullRequest?.number);
  if (!isStrictlyAscending(orderedNumbers)) {
    fail('pullRequests must be stored in strictly ascending number order');
  }
  const headRefCounts = countValues(
    portfolio.pullRequests.map(pullRequest => pullRequest?.headRefName),
  );
  for (const [headRefName, count] of headRefCounts) {
    if (typeof headRefName === 'string' && count !== 1) {
      fail(`head reference ${headRefName} must appear exactly once`);
    }
  }
  const knownHeadRefs = new Set(
    portfolio.pullRequests.map(pullRequest => pullRequest?.headRefName),
  );
  const recordByHeadRef = new Map(
    portfolio.pullRequests
      .filter(isPlainObject)
      .map(pullRequest => [pullRequest.headRefName, pullRequest]),
  );

  for (const [index, pullRequest] of portfolio.pullRequests.entries()) {
    const label = `pullRequests[${index}]`;
    if (!isPlainObject(pullRequest)) {
      fail(`${label} must be an object`);
      continue;
    }
    requireExactKeys(pullRequest, RECORD_KEYS, label, fail);

    if (!Number.isInteger(pullRequest.number) || pullRequest.number < 1) {
      fail(`${label}.number must be a positive integer`);
    }
    requireNonEmptyString(pullRequest.title, `${label}.title`, fail);
    if (pullRequest.url !== `https://github.com/emirhankudun-ux/SEIS/pull/${pullRequest.number}`) {
      fail(`${label}.url must match its pull-request number`);
    }
    if (typeof pullRequest.isDraft !== 'boolean') fail(`${label}.isDraft must be boolean`);
    for (const field of ['createdAt', 'updatedAt']) {
      if (!isExactUtcTimestamp(pullRequest[field])) {
        fail(`${label}.${field} must be an exact UTC timestamp`);
      }
    }
    if (
      isExactUtcTimestamp(pullRequest.createdAt) &&
      isExactUtcTimestamp(pullRequest.updatedAt) &&
      Date.parse(pullRequest.updatedAt) < Date.parse(pullRequest.createdAt)
    ) {
      fail(`${label}.updatedAt must not precede createdAt`);
    }
    if (
      isExactUtcTimestamp(pullRequest.updatedAt) &&
      isExactUtcTimestamp(snapshot?.retrievedAt) &&
      Date.parse(pullRequest.updatedAt) > Date.parse(snapshot.retrievedAt)
    ) {
      fail(`${label}.updatedAt must not follow snapshot.retrievedAt`);
    }
    for (const field of ['headRefName', 'baseRefName', 'author']) {
      requireNonEmptyString(pullRequest[field], `${label}.${field}`, fail);
    }
    for (const field of ['headRefOid', 'baseRefOid']) {
      if (!isValidSha(pullRequest[field])) {
        fail(`${label}.${field} must be a non-zero 40-character SHA`);
      }
    }
    validateUniqueStringArray(pullRequest.labels, `${label}.labels`, fail, 0);
    if (
      Array.isArray(pullRequest.labels) &&
      !arraysEqual(pullRequest.labels, [...pullRequest.labels].sort(compareCanonicalStrings))
    ) {
      fail(`${label}.labels must be sorted for deterministic identity hashing`);
    }
    if (
      pullRequest.baseRefName !== 'main' &&
      typeof pullRequest.baseRefName === 'string' &&
      !knownHeadRefs.has(pullRequest.baseRefName)
    ) {
      fail(`${label}.baseRefName must resolve to main or a captured open pull-request head`);
    }

    const classification = pullRequest.classification;
    if (!isPlainObject(classification)) {
      fail(`${label}.classification must be an object`);
      continue;
    }
    requireExactKeys(classification, CLASSIFICATION_KEYS, `${label}.classification`, fail);
    if (!ALLOWED_DISPOSITIONS.includes(classification.disposition)) {
      fail(`${label}.classification.disposition is invalid`);
    }
    requireNonEmptyString(classification.cluster, `${label}.classification.cluster`, fail);
    if (!CLUSTER_PATTERN.test(classification.cluster || '')) {
      fail(`${label}.classification.cluster must be a lowercase kebab-case identifier`);
    }
    if (!RISK_LEVELS.has(classification.risk)) fail(`${label}.classification.risk is invalid`);
    if (pullRequest.isDraft === true && classification.disposition === 'merge-candidate') {
      fail(`${label} draft pull requests must not be merge candidates`);
    }
    requireNonEmptyString(classification.rationale, `${label}.classification.rationale`, fail, 20);
    validateUniqueStringArray(classification.evidence, `${label}.classification.evidence`, fail, 1);
    validateReferenceArray(
      classification.successorPullRequests,
      `${label}.classification.successorPullRequests`,
      pullRequest.number,
      knownNumbers,
      fail,
    );
    validateReferenceArray(
      classification.dependsOnPullRequests,
      `${label}.classification.dependsOnPullRequests`,
      pullRequest.number,
      knownNumbers,
      fail,
    );
    validateExternalReferences(
      classification.externalReferences,
      `${label}.classification.externalReferences`,
      fail,
    );
    requireNonEmptyString(
      classification.nextSafeAction,
      `${label}.classification.nextSafeAction`,
      fail,
      20,
    );
    if (!(classification.nextSafeAction || '').startsWith('Human review:')) {
      fail(`${label}.classification.nextSafeAction must begin with Human review:`);
    }
    if (containsUnsafeMutationCommand(classification)) {
      fail(`${label}.classification must not encode a direct mutation command`);
    }
    if (classification.humanApprovalRequired !== true) {
      fail(`${label}.classification.humanApprovalRequired must be true`);
    }
    if (
      ['replace', 'superseded'].includes(classification.disposition) &&
      classification.successorPullRequests?.length === 0 &&
      classification.externalReferences?.length === 0
    ) {
      fail(
        `${label} ${classification.disposition} requires a successor or external replacement reference`,
      );
    }
    const overlappingReferences = classification.successorPullRequests?.filter(number =>
      classification.dependsOnPullRequests?.includes(number),
    );
    if (overlappingReferences?.length > 0) {
      fail(`${label} must not use the same PR as both a successor and dependency`);
    }
    if (pullRequest.baseRefName !== 'main' && recordByHeadRef.has(pullRequest.baseRefName)) {
      const basePullRequest = recordByHeadRef.get(pullRequest.baseRefName);
      if (pullRequest.baseRefOid !== basePullRequest.headRefOid) {
        fail(`${label}.baseRefOid must match the captured head SHA of its stacked base`);
      }
      if (!classification.dependsOnPullRequests?.includes(basePullRequest.number)) {
        fail(`${label} must declare its stacked base PR as a dependency`);
      }
    }
  }

  for (const number of PROTECTED_PULL_REQUESTS) {
    const pullRequest = portfolio.pullRequests.find(
      candidate => isPlainObject(candidate) && candidate.number === number,
    );
    if (!pullRequest) {
      fail(`protected pull request ${number} is missing`);
    } else if (!PROTECTED_DISPOSITIONS.has(pullRequest.classification?.disposition)) {
      fail(`protected pull request ${number} must remain retained or a merge candidate`);
    }
  }

  const objectRecords = portfolio.pullRequests.filter(isPlainObject);
  detectDependencyCycles(objectRecords, fail);
  detectSuccessorCycles(objectRecords, fail);

  if (objectRecords.length === portfolio.pullRequests.length) {
    const calculatedDigest = computeSnapshotDigest(portfolio.pullRequests);
    if (snapshot?.digest !== calculatedDigest) {
      fail('snapshot.digest does not match the canonical pull-request identities');
    }
    if (expectedDigest !== null && snapshot?.digest !== expectedDigest) {
      fail(`snapshot.digest must equal the immutable expected digest ${expectedDigest}`);
    }
  }

  const calculatedSummary = summarizePortfolio(portfolio.pullRequests);
  if (!jsonEquivalent(portfolio.classificationSummary, calculatedSummary)) {
    fail('classificationSummary does not match the pull-request records');
  }

  validateSequence(portfolio.sequence, portfolio.pullRequests, fail);
  const serialized = JSON.stringify(portfolio);
  for (const [pattern, description] of SENSITIVE_PATTERNS) {
    if (pattern.test(serialized)) fail(`portfolio must not contain a ${description}`);
  }
  return failures;
}

export function formatReviewRow(pullRequest) {
  const classification = pullRequest.classification;
  const successors = formatPullRequestList(classification.successorPullRequests);
  const dependencies = formatPullRequestList(classification.dependsOnPullRequests);
  return (
    [
      `| #${pullRequest.number}`,
      escapeMarkdownCell(pullRequest.title),
      pullRequest.isDraft ? 'draft' : 'open',
      classification.disposition,
      classification.cluster,
      classification.risk,
      successors,
      dependencies,
      escapeMarkdownCell(classification.nextSafeAction),
    ].join(' | ') + ' |'
  );
}

export function renderDispositionTable(portfolio) {
  const rows = Object.entries(portfolio.classificationSummary.byDisposition).map(
    ([disposition, count]) => `| ${disposition} | ${count} |`,
  );
  return ['| Disposition | Count |', '| --- | ---: |', ...rows].join('\n');
}

export function renderSequenceTable(portfolio) {
  const rows = portfolio.sequence.map(
    lane =>
      [
        `| ${lane.order}`,
        lane.cluster,
        formatPullRequestList(lane.prNumbers),
        escapeMarkdownCell(lane.gate),
        escapeMarkdownCell(lane.rationale),
      ].join(' | ') + ' |',
  );
  return [
    '| Order | Cluster | Pull requests | Gate | Rationale |',
    '| ---: | --- | --- | --- | --- |',
    ...rows,
  ].join('\n');
}

export function renderReviewTable(portfolio) {
  return [
    '| PR | Title | State | Disposition | Cluster | Risk | Successors | Dependencies | Next safe action |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...portfolio.pullRequests.map(formatReviewRow),
  ].join('\n');
}

export function renderPortfolioReviewDocument(portfolio) {
  const movingPullRequest = portfolio.pullRequests.find(pullRequest => pullRequest.number === 154);
  const reconciliationNarrative = movingPullRequest
    ? `A read-only reconciliation on 2026-07-14 detected a new PR #154 title, head, and update timestamp, so the dataset was versioned and refreshed at ${portfolio.snapshot.retrievedAt}. It is a frozen capture rather than a live dashboard; any later delta requires another versioned capture and review.`
    : `This dataset was reconciled at ${portfolio.snapshot.retrievedAt}. It is a frozen capture rather than a live dashboard; any later delta requires another versioned capture and review.`;
  const movingPullRequestEvidence = movingPullRequest
    ? `- PR #154 moved during the audit; the final capture records \`${movingPullRequest.headRefOid}\`, ${movingPullRequest.classification.evidence[1]}`
    : '- No moving-pull-request exception is recorded for this capture.';
  return [
    '# SEIS Open Pull-Request Portfolio Review',
    '',
    'Status: Recommendations only',
    'Approval boundary: Human approval is required before every GitHub mutation.',
    '',
    '## Snapshot identity',
    '',
    `Goal: \`${portfolio.goalId}\``,
    'Dataset: `data/seis-open-pr-portfolio.json`',
    `Dataset ID: \`${portfolio.datasetId}\``,
    `Snapshot count: \`${portfolio.snapshot.count} open pull requests\``,
    `Snapshot digest: \`${portfolio.snapshot.digest}\``,
    `Retrieved at: \`${portfolio.snapshot.retrievedAt}\``,
    `Source command: \`${portfolio.snapshot.sourceCommand}\``,
    `Default branch identity: \`${portfolio.snapshot.defaultBranchRefName}@${portfolio.snapshot.defaultBranchRefOid}\``,
    '',
    reconciliationNarrative,
    '',
    '## Authority and boundaries',
    '',
    'This review is advisory. It performed no merge, close, reopen, rebase, label, comment, branch, history, deployment, credential, provider, or infrastructure mutation. The structured policy keeps every recommendation human-gated and protects PRs #177, #179, #180, and #182 from destructive dispositions.',
    '',
    'Only public-safe repository metadata and concise review evidence are recorded. Pull-request bodies, secret values, private chain-of-thought, local paths, credentials, and private knowledge data are excluded.',
    '',
    '## Methodology and limitations',
    '',
    '- Reconciled the complete bounded REST result by PR number and immutable identity fields.',
    '- Reviewed public metadata, checks, history, branch topology, consolidation evidence, and targeted diffs; very large branches received bounded extraction-oriented review rather than a claim of exhaustive semantic verification.',
    '- Three independent read-only classification batches covered all 90 unique PR numbers with no missing, extra, or duplicate records.',
    movingPullRequestEvidence,
    '- Dispositions describe the next review lane. `merge-candidate` is not approval, merge authorization, or proof that branch protections remain satisfied after the capture.',
    '',
    '## Disposition summary',
    '',
    REVIEW_SUMMARY_BEGIN,
    renderDispositionTable(portfolio),
    REVIEW_SUMMARY_END,
    '',
    '## Recommended sequence',
    '',
    'Dependencies must appear in the same or an earlier lane. A lane gate must be satisfied before a human authorizes any downstream GitHub state change.',
    '',
    REVIEW_SEQUENCE_BEGIN,
    renderSequenceTable(portfolio),
    REVIEW_SEQUENCE_END,
    '',
    '## Protected review stack',
    '',
    '- PR #177 is the non-draft ecosystem Goal foundation and remains a merge candidate subject to protected review.',
    '- PR #179 depends on #177 and remains retained until its security and owner-decision gates are satisfied.',
    '- PR #180 depends on #177 and remains a draft ownership-evidence lane.',
    '- PR #182 depends on #179 and remains a draft Apple-native architecture lane pending prerequisite and ADR review.',
    '',
    '## Complete classification',
    '',
    REVIEW_TABLE_BEGIN,
    renderReviewTable(portfolio),
    REVIEW_TABLE_END,
    '',
    '## Risk and approval boundaries',
    '',
    '- `critical` and `high` records require the named security, ownership, provenance, or infrastructure review before extraction or state change.',
    '- `superseded`, `replace`, `close-candidate`, and `archive-candidate` are recommendations only. Unique value must be confirmed before any human-approved action.',
    '- The existing SEIS-SSH server and port are invariant; this audit authorizes no live SSH, firewall, deployment, credential, endpoint, or provider mutation.',
    '- Historical secret findings and issue #129 remain owner-gated; the audit neither weakens scanners nor changes history.',
    '',
    '## Validation evidence',
    '',
    'Publication requires `npm run check:seis-open-pr-portfolio`, `npm run test:seis-open-pr-portfolio`, `npm run check:ecosystem-foundation`, `npm run test:ecosystem-foundation`, `npm run check:goal-tracking`, and `git diff --check`. Exact results are recorded in the Goal evidence after execution; this document does not pre-claim them.',
    '',
    '## Rollback',
    '',
    'Revert the focused snapshot, review, validator, tests, and canonical roadmap/status updates. No classified PR state needs restoration because this Goal performs no classified-PR mutation.',
    '',
    '## Remaining gaps and follow-up Goals',
    '',
    'Human owners must decide each advisory disposition, create focused Goal-backed extraction or replacement PRs where unique value exists, and refresh the versioned snapshot whenever the open set or an identity changes. The broader ecosystem roadmap remains active beyond this repository-safety slice.',
    '',
  ].join('\n');
}

export function validatePortfolioDocuments(portfolio, documents) {
  const failures = [];
  const fail = message => failures.push(message);
  const required = {
    review: 'docs/reviews/PR_STACK_REVIEW.md',
    status: 'docs/STATUS.md',
    backlog: 'docs/roadmap/MASTER_BACKLOG.md',
    queue: 'docs/roadmap/NEXT_PR_QUEUE.md',
  };
  const count = portfolio.snapshot?.count;
  const digest = portfolio.snapshot?.digest;
  const metadataLines = [
    `Goal: \`${portfolio.goalId}\``,
    `Dataset: \`data/seis-open-pr-portfolio.json\``,
    `Dataset ID: \`${portfolio.datasetId}\``,
    `Snapshot count: \`${count} open pull requests\``,
    `Snapshot digest: \`${digest}\``,
    `Retrieved at: \`${portfolio.snapshot?.retrievedAt}\``,
  ];

  for (const [key, path] of Object.entries(required)) {
    const content = documents?.[key];
    if (typeof content !== 'string') {
      fail(`missing document input for ${path}`);
      continue;
    }
    if (!hasBalancedHtmlComments(content)) {
      fail(`${path} must contain only balanced, non-nested HTML comments`);
    }
    const visibleContent = stripHtmlComments(content);
    for (const line of metadataLines) {
      if (countOccurrences(visibleContent, line) !== 1) {
        fail(`${path} must include exact metadata line once: ${line}`);
      }
    }
    for (const [pattern, description] of SENSITIVE_PATTERNS) {
      if (pattern.test(visibleContent)) fail(`${path} must not contain a ${description}`);
    }
  }

  const rawReview = documents?.review || '';
  const review = stripHtmlComments(rawReview);
  if (rawReview !== renderPortfolioReviewDocument(portfolio)) {
    fail('docs/reviews/PR_STACK_REVIEW.md must exactly match the canonical generated review');
  }
  for (const token of ['Recommendations only', 'Human approval']) {
    if (!review.includes(token)) fail(`docs/reviews/PR_STACK_REVIEW.md must include ${token}`);
  }
  const sourceLine = `Source command: \`${portfolio.snapshot?.sourceCommand}\``;
  if (countOccurrences(review, sourceLine) !== 1) {
    fail(`docs/reviews/PR_STACK_REVIEW.md must include exact source line once: ${sourceLine}`);
  }
  for (const [begin, end, expected, label] of [
    [
      REVIEW_SUMMARY_BEGIN,
      REVIEW_SUMMARY_END,
      renderDispositionTable(portfolio),
      'disposition summary',
    ],
    [REVIEW_SEQUENCE_BEGIN, REVIEW_SEQUENCE_END, renderSequenceTable(portfolio), 'sequence'],
    [REVIEW_TABLE_BEGIN, REVIEW_TABLE_END, renderReviewTable(portfolio), 'pull-request table'],
  ]) {
    const block = extractDelimitedBlock(rawReview, begin, end);
    if (block !== expected) {
      fail(`docs/reviews/PR_STACK_REVIEW.md ${label} block must exactly match the dataset`);
    }
  }
  for (const [disposition, dispositionCount] of Object.entries(
    portfolio.classificationSummary?.byDisposition || {},
  )) {
    const token = `| ${disposition} | ${dispositionCount} |`;
    if (countOccurrences(review, token) !== 1) {
      fail(`docs/reviews/PR_STACK_REVIEW.md must include ${token} exactly once`);
    }
  }
  for (const pullRequest of portfolio.pullRequests || []) {
    const row = formatReviewRow(pullRequest);
    if (countOccurrences(review, row) !== 1) {
      fail(
        `docs/reviews/PR_STACK_REVIEW.md must include the exact canonical row for PR #${pullRequest.number} once`,
      );
    }
  }
  const expectedNumbers = new Set(
    (portfolio.pullRequests || []).map(pullRequest => pullRequest.number),
  );
  const observedNumbers = [...review.matchAll(/^\|\s*#(\d+)\s*\|/gm)].map(match =>
    Number(match[1]),
  );
  if (observedNumbers.length !== expectedNumbers.size) {
    fail('docs/reviews/PR_STACK_REVIEW.md must contain exactly one visible row per captured PR');
  }
  for (const number of observedNumbers) {
    if (!expectedNumbers.has(number)) {
      fail(`docs/reviews/PR_STACK_REVIEW.md contains unexpected PR row #${number}`);
    }
  }
  return failures;
}

export function validatePackageScripts(packageJson) {
  const failures = [];
  if (
    packageJson?.scripts?.['check:seis-open-pr-portfolio'] !==
    'node scripts/check-seis-open-pr-portfolio.mjs'
  ) {
    failures.push('package.json must expose check:seis-open-pr-portfolio');
  }
  if (
    packageJson?.scripts?.['test:seis-open-pr-portfolio'] !==
    'node scripts/test-seis-open-pr-portfolio.mjs'
  ) {
    failures.push('package.json must expose test:seis-open-pr-portfolio');
  }
  if (
    packageJson?.scripts?.['check:seis-open-pr-portfolio-live'] !==
    'node scripts/reconcile-seis-open-pr-portfolio-live.mjs'
  ) {
    failures.push('package.json must expose check:seis-open-pr-portfolio-live');
  }
  return failures;
}

export function validateWorkflow(workflow) {
  const failures = [];
  const permissionEntries = extractTopLevelPermissionEntries(workflow);
  if (!arraysEqual(permissionEntries, ['contents: read'])) {
    failures.push('foundation workflow top-level permissions must be exactly contents: read');
  }
  const activeLines = extractNamedRunStepCommands(workflow, 'Run lightweight checks');
  if (activeLines === null) {
    failures.push(
      'foundation workflow must contain one Run lightweight checks step with a literal run block',
    );
  }
  for (const command of [
    'npm run check:seis-open-pr-portfolio',
    'npm run test:seis-open-pr-portfolio',
  ]) {
    if (activeLines?.filter(line => line === command).length !== 1) {
      failures.push(`foundation workflow must run ${command} exactly once`);
    }
  }
  return failures;
}

function validateSequence(sequence, pullRequests, fail) {
  if (!Array.isArray(sequence) || sequence.length === 0) {
    fail('sequence must be a non-empty array');
    return;
  }
  const seenNumbers = [];
  const seenClusters = new Set();
  const laneOrderByPullRequest = new Map();
  const recordCluster = new Map(
    pullRequests
      .filter(isPlainObject)
      .map(pullRequest => [pullRequest.number, pullRequest.classification?.cluster]),
  );

  for (const [index, lane] of sequence.entries()) {
    const label = `sequence[${index}]`;
    if (!isPlainObject(lane)) {
      fail(`${label} must be an object`);
      continue;
    }
    requireExactKeys(lane, SEQUENCE_KEYS, label, fail);
    if (lane.order !== index + 1) fail(`${label}.order must be ${index + 1}`);
    requireNonEmptyString(lane.cluster, `${label}.cluster`, fail);
    if (seenClusters.has(lane.cluster))
      fail(`sequence cluster ${lane.cluster} must appear exactly once`);
    seenClusters.add(lane.cluster);
    if (!Array.isArray(lane.prNumbers) || lane.prNumbers.length === 0) {
      fail(`${label}.prNumbers must be a non-empty array`);
    } else {
      if (!isStrictlyAscending(lane.prNumbers)) {
        fail(`${label}.prNumbers must be stored in strictly ascending order`);
      }
      for (const number of lane.prNumbers) {
        seenNumbers.push(number);
        laneOrderByPullRequest.set(number, lane.order);
        if (!recordCluster.has(number)) fail(`${label}.prNumbers references unknown PR ${number}`);
        if (recordCluster.get(number) !== lane.cluster) {
          fail(`${label}.prNumbers contains PR ${number} from a different cluster`);
        }
      }
    }
    requireNonEmptyString(lane.gate, `${label}.gate`, fail, 12);
    requireNonEmptyString(lane.rationale, `${label}.rationale`, fail, 20);
    if (containsUnsafeMutationCommand({ gate: lane.gate, rationale: lane.rationale })) {
      fail(`${label} must not encode a direct mutation command`);
    }
    if (lane.humanApprovalRequired !== true) fail(`${label}.humanApprovalRequired must be true`);
  }

  const expected = pullRequests
    .filter(isPlainObject)
    .map(pullRequest => pullRequest.number)
    .sort((a, b) => a - b);
  const actual = [...seenNumbers].sort((a, b) => a - b);
  if (!arraysEqual(actual, expected)) fail('sequence must cover every pull request exactly once');

  for (const pullRequest of pullRequests.filter(isPlainObject)) {
    const dependentLane = laneOrderByPullRequest.get(pullRequest.number);
    for (const dependency of pullRequest.classification?.dependsOnPullRequests || []) {
      const dependencyLane = laneOrderByPullRequest.get(dependency);
      if (
        Number.isInteger(dependentLane) &&
        Number.isInteger(dependencyLane) &&
        dependencyLane > dependentLane
      ) {
        fail(
          `sequence must place dependency PR ${dependency} no later than dependent PR ${pullRequest.number}`,
        );
      }
    }
  }
}

function detectDependencyCycles(pullRequests, fail) {
  const graph = new Map(
    pullRequests.map(pullRequest => [
      pullRequest.number,
      pullRequest.classification?.dependsOnPullRequests || [],
    ]),
  );
  const visiting = new Set();
  const visited = new Set();

  function visit(number, path) {
    if (visiting.has(number)) {
      fail(`dependency cycle detected: ${[...path, number].join(' -> ')}`);
      return;
    }
    if (visited.has(number)) return;
    visiting.add(number);
    for (const dependency of graph.get(number) || []) visit(dependency, [...path, number]);
    visiting.delete(number);
    visited.add(number);
  }

  for (const number of graph.keys()) visit(number, []);
}

function detectSuccessorCycles(pullRequests, fail) {
  const graph = new Map(
    pullRequests.map(pullRequest => [
      pullRequest.number,
      pullRequest.classification?.successorPullRequests || [],
    ]),
  );
  const visiting = new Set();
  const visited = new Set();

  function visit(number, path) {
    if (visiting.has(number)) {
      fail(`successor cycle detected: ${[...path, number].join(' -> ')}`);
      return;
    }
    if (visited.has(number)) return;
    visiting.add(number);
    for (const successor of graph.get(number) || []) visit(successor, [...path, number]);
    visiting.delete(number);
    visited.add(number);
  }

  for (const number of graph.keys()) visit(number, []);
}

function validateReferenceArray(value, label, self, knownNumbers, fail) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array`);
    return;
  }
  if (new Set(value).size !== value.length) fail(`${label} must not contain duplicates`);
  if (value.some((number, index) => index > 0 && number <= value[index - 1])) {
    fail(`${label} must be stored in strictly ascending order`);
  }
  for (const number of value) {
    if (!Number.isInteger(number)) fail(`${label} must contain integer pull-request numbers`);
    if (number === self) fail(`${label} must not reference its own pull request`);
    if (!knownNumbers.has(number)) fail(`${label} references unknown PR ${number}`);
  }
}

function validateUniqueStringArray(value, label, fail, minimum) {
  if (!Array.isArray(value) || value.length < minimum) {
    fail(`${label} must be a string array with at least ${minimum} item(s)`);
    return;
  }
  if (
    value.some(item => typeof item !== 'string' || item.trim().length === 0 || item !== item.trim())
  ) {
    fail(`${label} must contain only trimmed non-empty strings`);
  }
  if (new Set(value).size !== value.length) fail(`${label} must not contain duplicates`);
}

function validateExternalReferences(value, label, fail) {
  validateUniqueStringArray(value, label, fail, 0);
  if (!Array.isArray(value)) return;
  for (const reference of value) {
    if (
      typeof reference === 'string' &&
      !EXTERNAL_REFERENCE_PATTERNS.some(pattern => pattern.test(reference))
    ) {
      fail(`${label} contains noncanonical reference: ${reference}`);
    }
  }
}

function isExactUtcTimestamp(value) {
  if (typeof value !== 'string' || !ISO_UTC_PATTERN.test(value)) return false;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return false;
  return new Date(milliseconds).toISOString() === value.replace(/Z$/, '.000Z');
}

function isValidSha(value) {
  return typeof value === 'string' && SHA_PATTERN.test(value) && !/^0{40}$/.test(value);
}

function containsUnsafeMutationCommand(value) {
  const strings = collectStringValues(value);
  const candidates = [...strings, strings.join(' ')].map(normalizePotentialCommand);
  const forbidden = [
    /\bgh\s+pr\s+(?:close|comment|create|edit|lock|merge|ready|reopen|review|unlock|update-branch)\b/,
    /\bgh\s+issue\s+(?:close|comment|create|delete|develop|edit|lock|pin|reopen|transfer|unlock|unpin)\b/,
    /\bgh\s+label\s+(?:clone|create|delete|edit)\b/,
    /\bgh\s+api\b.{0,512}(?:(?:--method|-x)\s*(?:post|put|patch|delete)\b|(?:--input|--field|--raw-field)(?:\s|$)|\s-f(?:\s|$))/,
    /\bgh\s+repo\s+edit\b/,
    /\bgh\s+workflow\s+(?:disable|enable|run)\b/,
    /\bgh\s+run\s+(?:cancel|delete|rerun)\b/,
    /\bgh\s+release\s+(?:create|delete|edit|upload)\b/,
    /\bgh\s+(?:secret|variable)\s+(?:delete|set)\b/,
    /\bcurl\b.{0,512}(?:(?:--request|-x)\s*(?:post|put|patch|delete)\b|(?:--data(?:-[a-z-]+)?|--form|--json|--upload-file)(?:\s|$)|\s-(?:d|f|t)(?:\s|[^\s]))/,
    /\bgit\s+(?:push|rebase|merge|cherry-pick|commit|reset|restore|clean|am|apply)\b/,
    /\bgit\s+(?:checkout|switch)\b/,
    /\bgit\s+(?:branch|tag)\b.{0,160}(?:\s-d\b|\s--delete\b)/,
    /\bforce\s*-?\s*push\b/,
    /\bdelete\s+(?:the\s+)?branch\b/,
    /\brewrite\s+(?:the\s+)?history\b/,
  ];
  return candidates.some(candidate => forbidden.some(pattern => pattern.test(candidate)));
}

function collectStringValues(value, seen = new Set()) {
  if (typeof value === 'string') return [value];
  if (value === null || typeof value !== 'object' || seen.has(value)) return [];
  seen.add(value);
  const children = Array.isArray(value) ? value : Object.values(value);
  return children.flatMap(child => collectStringValues(child, seen));
}

function normalizePotentialCommand(value) {
  return value
    .normalize('NFKC')
    .replace(/\\(?:r?n|t)/gi, ' ')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/["'`\\]+/g, ' ')
    .replace(/[=,:;|&(){}[\]]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function formatPullRequestList(numbers) {
  return numbers.length === 0 ? 'none' : numbers.map(number => `#${number}`).join(', ');
}

function escapeMarkdownCell(value) {
  return String(value).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function stripHtmlComments(content) {
  return content.replace(/<!--[\s\S]*?-->/g, '');
}

function hasBalancedHtmlComments(content) {
  let cursor = 0;
  while (cursor < content.length) {
    const opening = content.indexOf('<!--', cursor);
    const closing = content.indexOf('-->', cursor);
    if (opening < 0) return closing < 0;
    if (closing >= 0 && closing < opening) return false;
    const matchingClosing = content.indexOf('-->', opening + 4);
    if (matchingClosing < 0) return false;
    const nestedOpening = content.indexOf('<!--', opening + 4);
    if (nestedOpening >= 0 && nestedOpening < matchingClosing) return false;
    cursor = matchingClosing + 3;
  }
  return true;
}

function extractTopLevelPermissionEntries(workflow) {
  if (typeof workflow !== 'string') return null;
  const lines = workflow.split(/\r?\n/);
  const indexes = lines
    .map((line, index) => (/^permissions:\s*(?:#.*)?$/.test(line) ? index : -1))
    .filter(index => index >= 0);
  if (indexes.length !== 1) return null;

  const entries = [];
  for (let index = indexes[0] + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^(?:\s*$|\s*#)/.test(line)) continue;
    if (!/^\s+/.test(line)) break;
    entries.push(line.trim().replace(/\s+#.*$/, ''));
  }
  return entries;
}

function extractNamedRunStepCommands(workflow, stepName) {
  if (typeof workflow !== 'string') return null;
  const lines = workflow.split(/\r?\n/);
  const stepLine = `      - name: ${stepName}`;
  const stepIndexes = lines
    .map((line, index) => (line === stepLine ? index : -1))
    .filter(index => index >= 0);
  if (stepIndexes.length !== 1) return null;

  const stepStart = stepIndexes[0];
  let stepEnd = lines.length;
  for (let index = stepStart + 1; index < lines.length; index += 1) {
    if (/^      -\s+/.test(lines[index])) {
      stepEnd = index;
      break;
    }
  }
  const runIndexes = [];
  for (let index = stepStart + 1; index < stepEnd; index += 1) {
    if (/^        run:\s*\|\s*$/.test(lines[index])) runIndexes.push(index);
  }
  if (runIndexes.length !== 1) return null;

  const commands = [];
  for (let index = runIndexes[0] + 1; index < stepEnd; index += 1) {
    const line = lines[index];
    if (/^\s*$/.test(line)) continue;
    if (!/^          \S/.test(line)) break;
    const command = line.trim();
    if (!command.startsWith('#')) commands.push(command);
  }
  return commands;
}

function extractDelimitedBlock(content, begin, end) {
  const beginIndex = content.indexOf(begin);
  const endIndex = content.indexOf(end);
  if (beginIndex < 0 || endIndex < 0 || endIndex <= beginIndex) return null;
  if (content.indexOf(begin, beginIndex + begin.length) >= 0) return null;
  if (content.indexOf(end, endIndex + end.length) >= 0) return null;
  return content.slice(beginIndex + begin.length, endIndex).trim();
}

function requireNonEmptyString(value, label, fail, minimum = 1) {
  if (typeof value !== 'string' || value.trim().length < minimum) {
    fail(`${label} must be a non-empty string of at least ${minimum} character(s)`);
  }
}

function requireExactKeys(value, expected, label, fail) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (!arraysEqual(actual, wanted)) {
    fail(`${label} keys must be exactly: ${wanted.join(', ')}`);
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function arraysEqual(left, right) {
  return (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function jsonEquivalent(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map(key => [key, canonicalize(value[key])]),
  );
}

function isStrictlyAscending(values) {
  return values.every(
    (value, index) => Number.isInteger(value) && (index === 0 || value > values[index - 1]),
  );
}

function countValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return counts;
}

function countOccurrences(content, token) {
  if (!token) return 0;
  return content.split(token).length - 1;
}

function readText(path, failures) {
  if (!existsSync(path)) {
    failures.push(`missing ${path}`);
    return '';
  }
  return readFileSync(path, 'utf8');
}

function readJson(path, failures) {
  const content = readText(path, failures);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`invalid JSON in ${path}: ${error.message}`);
    return null;
  }
}

function runCli() {
  const failures = [];
  const portfolio = readJson('data/seis-open-pr-portfolio.json', failures);
  const packageJson = readJson('package.json', failures);
  const workflow = readText('.github/workflows/foundation-check.yml', failures);
  const documents = {
    review: readText('docs/reviews/PR_STACK_REVIEW.md', failures),
    status: readText('docs/STATUS.md', failures),
    backlog: readText('docs/roadmap/MASTER_BACKLOG.md', failures),
    queue: readText('docs/roadmap/NEXT_PR_QUEUE.md', failures),
  };

  if (portfolio) {
    const dataFailures = validatePortfolioData(portfolio);
    failures.push(...dataFailures);
    if (dataFailures.length === 0) {
      failures.push(...validatePortfolioDocuments(portfolio, documents));
    }
  }
  failures.push(...validatePackageScripts(packageJson));
  failures.push(...validateWorkflow(workflow));

  if (failures.length > 0) {
    console.error('SEIS open PR portfolio check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(
    `SEIS open PR portfolio check passed: ${portfolio.snapshot.count} open PRs, ` +
      `${Object.keys(portfolio.classificationSummary.byCluster).length} clusters, ` +
      `${portfolio.snapshot.digest}.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) runCli();
