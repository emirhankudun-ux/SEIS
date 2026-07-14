#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ALLOWED_DISPOSITIONS,
  EXPECTED_DATASET_ID,
  EXPECTED_SNAPSHOT_DIGEST,
  EXPECTED_SNAPSHOT_COUNT,
  EXPECTED_SOURCE_COMMAND,
  IDENTITY_FIELDS,
  PROTECTED_PULL_REQUESTS,
  computeSnapshotDigest,
  formatReviewRow,
  renderPortfolioReviewDocument,
  summarizePortfolio,
  validatePackageScripts,
  validatePortfolioData,
  validatePortfolioDocuments,
  validateWorkflow,
} from './check-seis-open-pr-portfolio.mjs';
import {
  compareSnapshotIdentities,
  normalizeLivePullRequests,
} from './reconcile-seis-open-pr-portfolio-live.mjs';

const FIXTURE_COUNT = 6;
let assertions = 0;

const base = createFixture();
expectPass('canonical fixture', base);

const normalizedLiveFixture = normalizeLivePullRequests(
  [...base.pullRequests].reverse().map(toRestPullRequest),
);
assert.deepEqual(normalizedLiveFixture, base.pullRequests.map(toIdentityRecord));
assert.deepEqual(compareSnapshotIdentities(base.pullRequests, normalizedLiveFixture), []);
assertions += 2;

const driftedLiveFixture = structuredClone(normalizedLiveFixture);
driftedLiveFixture[4].title = 'Changed live title';
assert.deepEqual(compareSnapshotIdentities(base.pullRequests, driftedLiveFixture), [
  { number: 200, kind: 'identity-drift', fields: ['title'] },
]);
assertions += 1;

const changedSetLiveFixture = structuredClone(normalizedLiveFixture.slice(1));
changedSetLiveFixture.push({ ...toIdentityRecord(base.pullRequests[0]), number: 999 });
assert.deepEqual(compareSnapshotIdentities(base.pullRequests, changedSetLiveFixture), [
  { number: 177, kind: 'removed-from-live' },
  { number: 999, kind: 'added-to-live' },
]);
assertions += 1;

assert.throws(() => normalizeLivePullRequests({}), /pull-request array/);
assertions += 1;

const mixedCaseLabelFixture = toRestPullRequest(base.pullRequests[0]);
mixedCaseLabelFixture.labels = [{ name: 'a' }, { name: 'Z' }];
assert.deepEqual(normalizeLivePullRequests([mixedCaseLabelFixture])[0].labels, ['Z', 'a']);
assertions += 1;

expectFailure(
  'production count cannot be self-asserted',
  fixture => fixture,
  'immutable expected count 90',
  {
    productionDefault: true,
  },
);

expectFailure(
  'dataset identity drift',
  fixture => {
    fixture.datasetId = 'partial-capture';
  },
  'datasetId must be',
);

expectFailure(
  'source command injection',
  fixture => {
    fixture.snapshot.sourceCommand += '; gh pr close 177';
  },
  'canonical read-only open-PR query',
);

expectFailure(
  'duplicate pull request',
  fixture => {
    fixture.pullRequests[5].number = fixture.pullRequests[4].number;
  },
  'must appear exactly once',
);

expectFailure(
  'non-object pull request',
  fixture => {
    fixture.pullRequests[4] = null;
  },
  'must be an object',
);

expectFailure(
  'invalid disposition',
  fixture => {
    fixture.pullRequests[4].classification.disposition = 'delete-now';
  },
  'disposition is invalid',
);

expectFailure(
  'draft merge candidate',
  fixture => {
    fixture.pullRequests[2].classification.disposition = 'merge-candidate';
  },
  'draft pull requests must not be merge candidates',
);

expectFailure(
  'dangling successor',
  fixture => {
    fixture.pullRequests[4].classification.successorPullRequests = [999];
  },
  'references unknown PR 999',
);

expectFailure(
  'self dependency',
  fixture => {
    fixture.pullRequests[4].classification.dependsOnPullRequests = [200];
  },
  'must not reference its own pull request',
);

expectFailure(
  'dependency successor overlap',
  fixture => {
    fixture.pullRequests[4].classification.successorPullRequests = [201];
    fixture.pullRequests[4].classification.dependsOnPullRequests = [201];
  },
  'both a successor and dependency',
);

expectFailure(
  'dependency cycle',
  fixture => {
    fixture.pullRequests[4].classification.dependsOnPullRequests = [201];
    fixture.pullRequests[5].classification.dependsOnPullRequests = [200];
  },
  'dependency cycle detected',
);

expectFailure(
  'successor cycle',
  fixture => {
    fixture.pullRequests[4].classification.successorPullRequests = [201];
    fixture.pullRequests[5].classification.successorPullRequests = [200];
  },
  'successor cycle detected',
);

expectFailure(
  'dependency in later sequence lane',
  fixture => {
    fixture.pullRequests[0].classification.dependsOnPullRequests = [200];
  },
  'place dependency PR 200 no later than dependent PR 177',
);

expectFailure(
  'unsorted references',
  fixture => {
    fixture.pullRequests[4].classification.successorPullRequests = [182, 177];
  },
  'strictly ascending order',
);

expectFailure(
  'replacement without successor',
  fixture => {
    fixture.pullRequests[4].classification.disposition = 'superseded';
    fixture.pullRequests[4].classification.successorPullRequests = [];
    fixture.pullRequests[4].classification.externalReferences = [];
  },
  'requires a successor or external replacement reference',
);

expectFailure(
  'protected PR disposition drift',
  fixture => {
    fixture.pullRequests[0].classification.disposition = 'close-candidate';
  },
  'protected pull request 177 must remain retained or a merge candidate',
);

expectFailure(
  'mutation claim',
  fixture => {
    fixture.policy.githubMutationsPerformed = true;
  },
  'githubMutationsPerformed must be false',
);

expectFailure(
  'unsafe next action',
  fixture => {
    fixture.pullRequests[4].classification.nextSafeAction =
      'Human review: gh pr close 200 after this check';
  },
  'must not encode a direct mutation command',
);

expectFailure(
  'unsafe evidence command',
  fixture => {
    fixture.pullRequests[4].classification.evidence = ['Run gh pr review 200 before publication.'];
  },
  'must not encode a direct mutation command',
);

expectFailure(
  'unsafe API write',
  fixture => {
    fixture.pullRequests[4].classification.rationale =
      'This rationale directs gh api --method POST against the pull request endpoint.';
  },
  'must not encode a direct mutation command',
);

expectFailure(
  'unsafe curl write',
  fixture => {
    fixture.pullRequests[4].classification.evidence = ['curl --request DELETE the remote record'];
  },
  'must not encode a direct mutation command',
);

expectFailure(
  'unsafe git push',
  fixture => {
    fixture.pullRequests[4].classification.evidence = ['git push origin main'];
  },
  'must not encode a direct mutation command',
);

for (const [name, command] of [
  ['PR comment', 'Run gh pr comment 200 --body approved.'],
  ['PR ready', 'Run gh pr ready 200.'],
  ['API compact method', 'Run gh api -XPOST repos/example/SEIS/issues/200.'],
  ['API equals method', 'Run gh api --method=PATCH repos/example/SEIS/pulls/200.'],
  ['API implicit POST field', 'Run gh api repos/example/SEIS/issues/200 -f state=closed.'],
  ['multiline PR close', 'Run gh\npr\nclose 200.'],
  ['escaped-whitespace PR close', 'Run gh\\npr\\nclose 200.'],
  ['issue edit', 'Run gh issue edit 200 --add-label archive.'],
  ['curl compact POST', 'Run curl -XPOST https://api.github.example/resource.'],
  ['git rebase', 'Run git rebase main.'],
  ['git branch delete', 'Run git branch -D stale-branch.'],
]) {
  expectFailure(
    `unsafe ${name}`,
    fixture => {
      fixture.pullRequests[4].classification.evidence = [command];
    },
    'must not encode a direct mutation command',
  );
}

expectFailure(
  'unsafe command split across nested strings',
  fixture => {
    fixture.pullRequests[4].classification.evidence = ['Run gh', 'pr close 200.'];
  },
  'must not encode a direct mutation command',
);

expectFailure(
  'unsafe sequence gate',
  fixture => {
    fixture.sequence[1].gate = 'Human owner must git push the branch before review.';
  },
  'sequence[1] must not encode a direct mutation command',
);

expectFailure(
  'missing human review prefix',
  fixture => {
    fixture.pullRequests[4].classification.nextSafeAction =
      'Keep this advisory record pending explicit human review.';
  },
  'must begin with Human review:',
);

expectFailure(
  'missing human approval',
  fixture => {
    fixture.pullRequests[4].classification.humanApprovalRequired = false;
  },
  'humanApprovalRequired must be true',
);

expectFailure(
  'identity digest drift',
  fixture => {
    fixture.pullRequests[4].headRefOid = 'a'.repeat(40);
  },
  'snapshot.digest does not match',
);

expectFailure(
  'zero SHA',
  fixture => {
    fixture.pullRequests[4].headRefOid = '0'.repeat(40);
  },
  'non-zero 40-character SHA',
);

expectFailure(
  'impossible timestamp',
  fixture => {
    fixture.pullRequests[4].updatedAt = '2026-99-99T99:99:99Z';
  },
  'exact UTC timestamp',
);

expectFailure(
  'updated after retrieval',
  fixture => {
    fixture.pullRequests[4].updatedAt = '2026-07-13T10:00:00Z';
  },
  'must not follow snapshot.retrievedAt',
);

expectFailure(
  'pull-request order drift',
  fixture => {
    [fixture.pullRequests[4], fixture.pullRequests[5]] = [
      fixture.pullRequests[5],
      fixture.pullRequests[4],
    ];
  },
  'strictly ascending number order',
);

expectFailure(
  'updated before created',
  fixture => {
    fixture.pullRequests[4].updatedAt = '2026-07-12T00:00:00Z';
  },
  'updatedAt must not precede createdAt',
);

expectFailure(
  'orphaned stacked base',
  fixture => {
    fixture.pullRequests[4].baseRefName = 'missing/stack-base';
  },
  'must resolve to main or a captured open pull-request head',
);

expectFailure(
  'stacked base SHA mismatch',
  fixture => {
    fixture.pullRequests[1].baseRefOid = 'a'.repeat(40);
  },
  'must match the captured head SHA of its stacked base',
);

expectFailure(
  'stacked base dependency omission',
  fixture => {
    fixture.pullRequests[1].classification.dependsOnPullRequests = [];
  },
  'must declare its stacked base PR as a dependency',
);

expectFailure(
  'summary drift',
  fixture => {
    fixture.classificationSummary.total += 1;
  },
  'classificationSummary does not match',
);

expectFailure(
  'prototype-like cluster name',
  fixture => {
    fixture.pullRequests[4].classification.cluster = '__proto__';
  },
  'lowercase kebab-case identifier',
);

expectFailure(
  'constructor cluster name',
  fixture => {
    fixture.pullRequests[4].classification.cluster = 'constructor';
  },
  'classificationSummary does not match',
);

expectFailure(
  'sequence omission',
  fixture => {
    fixture.sequence[1].prNumbers.pop();
  },
  'sequence must cover every pull request exactly once',
);

expectFailure(
  'cluster mismatch',
  fixture => {
    fixture.sequence[1].prNumbers.push(177);
  },
  'from a different cluster',
);

expectFailure(
  'invalid URL identity',
  fixture => {
    fixture.pullRequests[4].url = 'https://github.com/emirhankudun-ux/SEIS/pull/201';
  },
  'url must match its pull-request number',
);

expectFailure(
  'unknown record key',
  fixture => {
    fixture.pullRequests[4].approved = true;
  },
  'keys must be exactly',
);

expectFailure(
  'nondeterministic labels',
  fixture => {
    fixture.pullRequests[4].labels = ['zeta', 'alpha'];
  },
  'labels must be sorted',
);

expectFailure(
  'whitespace external reference',
  fixture => {
    fixture.pullRequests[4].classification.externalReferences = [' '];
  },
  'trimmed non-empty strings',
);

expectFailure(
  'arbitrary external reference',
  fixture => {
    fixture.pullRequests[4].classification.externalReferences = ['some future thing'];
  },
  'contains noncanonical reference',
);

expectFailure(
  'machine path disclosure',
  fixture => {
    fixture.pullRequests[4].classification.evidence = ['/Users/example/private-review.txt'];
  },
  'machine-specific path or editor URI',
);

const documents = createDocuments(base);
assert.deepEqual(validatePortfolioDocuments(base, documents), []);
assertions += 1;

const staleDocuments = {
  ...documents,
  status: documents.status.replace(base.snapshot.digest, 'sha256:stale'),
};
assert.ok(
  validatePortfolioDocuments(base, staleDocuments).some(failure =>
    failure.includes('Snapshot digest'),
  ),
  'document digest drift must fail',
);
assertions += 1;

const hiddenRowDocuments = {
  ...documents,
  review: documents.review.replace(
    formatReviewRow(base.pullRequests[4]),
    `<!-- ${formatReviewRow(base.pullRequests[4])} -->`,
  ),
};
assert.ok(
  validatePortfolioDocuments(base, hiddenRowDocuments).some(
    failure => failure.includes('pull-request table block') || failure.includes('visible row'),
  ),
  'HTML-comment-hidden review rows must fail',
);
assertions += 1;

const extraRowDocuments = {
  ...documents,
  review: `${documents.review}\n| #999 | unexpected | open | retain | legacy-review | low | none | none | Human review: reject this row. |`,
};
assert.ok(
  validatePortfolioDocuments(base, extraRowDocuments).some(failure =>
    failure.includes('unexpected PR row #999'),
  ),
  'unexpected visible review rows must fail',
);
assertions += 1;

const sequenceDriftDocuments = {
  ...documents,
  review: documents.review.replace('Preserve the active stacked review order.', 'Changed gate.'),
};
assert.ok(
  validatePortfolioDocuments(base, sequenceDriftDocuments).some(failure =>
    failure.includes('sequence block'),
  ),
  'sequence drift must fail',
);
assertions += 1;

const hiddenMetadataDocuments = {
  ...documents,
  queue: documents.queue.replace(
    `Dataset ID: \`${base.datasetId}\``,
    `<!-- Dataset ID: \`${base.datasetId}\` -->`,
  ),
};
assert.ok(
  validatePortfolioDocuments(base, hiddenMetadataDocuments).some(failure =>
    failure.includes('Dataset ID'),
  ),
  'comment-hidden metadata must fail',
);
assertions += 1;

for (const key of ['review', 'status', 'backlog', 'queue']) {
  const unbalancedDocuments = {
    ...documents,
    [key]: `<!-- hidden forever\n${documents[key]}`,
  };
  assert.ok(
    validatePortfolioDocuments(base, unbalancedDocuments).some(failure =>
      failure.includes('balanced, non-nested HTML comments'),
    ),
    `unbalanced HTML comments in ${key} must fail`,
  );
  assertions += 1;
}

const contradictoryReviewDocuments = {
  ...documents,
  review: documents.review.replace(
    'This review is advisory. It performed no merge, close, reopen, rebase, label, comment, branch, history, deployment, credential, provider, or infrastructure mutation.',
    'This review is authoritative and all classified GitHub mutations were already performed.',
  ),
};
assert.ok(
  validatePortfolioDocuments(base, contradictoryReviewDocuments).some(failure =>
    failure.includes('canonical generated review'),
  ),
  'contradictory review authority text must fail',
);
assertions += 1;

assert.deepEqual(
  validatePackageScripts({
    scripts: {
      'check:seis-open-pr-portfolio': 'node scripts/check-seis-open-pr-portfolio.mjs',
      'check:seis-open-pr-portfolio-live': 'node scripts/reconcile-seis-open-pr-portfolio-live.mjs',
      'test:seis-open-pr-portfolio': 'node scripts/test-seis-open-pr-portfolio.mjs',
    },
  }),
  [],
);
assertions += 1;

assert.ok(
  validatePackageScripts({ scripts: {} }).some(failure =>
    failure.includes('check:seis-open-pr-portfolio'),
  ),
);
assertions += 1;

const workflow = [
  'name: fixture',
  '',
  'permissions:',
  '  contents: read',
  '',
  'jobs:',
  '  check:',
  '    steps:',
  '      - name: Run lightweight checks',
  '        run: |',
  '          npm run check:seis-open-pr-portfolio',
  '          npm run test:seis-open-pr-portfolio',
].join('\n');
assert.deepEqual(validateWorkflow(workflow), []);
assertions += 1;

assert.ok(
  validateWorkflow(
    workflow.replace('  contents: read', '  contents: read\n  pull-requests: write'),
  ).some(failure => failure.includes('exactly contents: read')),
  'extra workflow write permission must fail',
);
assertions += 1;

const inertWorkflowCommands = [
  'name: fixture',
  '',
  'permissions:',
  '  contents: read',
  '',
  'env:',
  '  UNUSED: |',
  '    npm run check:seis-open-pr-portfolio',
  '    npm run test:seis-open-pr-portfolio',
  '',
  'jobs:',
  '  check:',
  '    steps:',
  '      - name: Run lightweight checks',
  '        run: echo no-op',
].join('\n');
assert.ok(
  validateWorkflow(inertWorkflowCommands).some(failure => failure.includes('literal run block')),
  'commands hidden in an unused scalar must not satisfy workflow execution checks',
);
assertions += 1;

assert.ok(
  validateWorkflow(workflow.replace('\npermissions:\n  contents: read\n', '\n')).some(failure =>
    failure.includes('contents: read'),
  ),
);
assertions += 1;

assert.ok(
  validateWorkflow(
    workflow.replace(
      'npm run test:seis-open-pr-portfolio',
      '# npm run test:seis-open-pr-portfolio',
    ),
  ).some(failure => failure.includes('test:seis-open-pr-portfolio')),
  'commented workflow commands must not count',
);
assertions += 1;

const actualPortfolio = JSON.parse(readFileSync('data/seis-open-pr-portfolio.json', 'utf8'));
assert.equal(actualPortfolio.pullRequests.length, EXPECTED_SNAPSHOT_COUNT);
assert.equal(actualPortfolio.snapshot.digest, EXPECTED_SNAPSHOT_DIGEST);
assert.deepEqual(validatePortfolioData(actualPortfolio), []);
assertions += 3;

const fabricatedCapture = structuredClone(actualPortfolio);
fabricatedCapture.pullRequests[0].title = 'Fabricated identity with a self-consistent digest';
fabricatedCapture.snapshot.digest = computeSnapshotDigest(fabricatedCapture.pullRequests);
assert.ok(
  validatePortfolioData(fabricatedCapture).some(failure =>
    failure.includes('immutable expected digest'),
  ),
  'self-consistent fabricated identities must fail the independently frozen digest',
);
assertions += 1;

const actualDocuments = {
  review: readFileSync('docs/reviews/PR_STACK_REVIEW.md', 'utf8'),
  status: readFileSync('docs/STATUS.md', 'utf8'),
  backlog: readFileSync('docs/roadmap/MASTER_BACKLOG.md', 'utf8'),
  queue: readFileSync('docs/roadmap/NEXT_PR_QUEUE.md', 'utf8'),
};
assert.deepEqual(validatePortfolioDocuments(actualPortfolio, actualDocuments), []);
assertions += 1;

console.log(`SEIS open PR portfolio adversarial tests passed: ${assertions} assertions.`);

function expectPass(name, fixture) {
  assert.deepEqual(
    validatePortfolioData(fixture, { expectedCount: FIXTURE_COUNT }),
    [],
    `${name} should pass`,
  );
  assertions += 1;
}

function expectFailure(name, mutate, expected, { productionDefault = false } = {}) {
  const fixture = structuredClone(base);
  mutate(fixture);
  const failures = productionDefault
    ? validatePortfolioData(fixture)
    : validatePortfolioData(fixture, { expectedCount: FIXTURE_COUNT });
  assert.ok(
    failures.some(failure => failure.includes(expected)),
    `${name} should fail with ${expected}; got ${failures.join(' | ')}`,
  );
  assertions += 1;
}

function createFixture() {
  const numbers = [177, 179, 180, 182, 200, 201];
  const headShaByNumber = new Map(
    numbers.map((number, index) => [number, (index + 1).toString(16).padStart(40, '0')]),
  );
  const baseNumberByNumber = new Map([
    [179, 177],
    [180, 177],
    [182, 179],
  ]);
  const pullRequests = numbers.map((number, index) => {
    const baseNumber = baseNumberByNumber.get(number);
    return {
      number,
      title: `Fixture pull request ${number}`,
      url: `https://github.com/emirhankudun-ux/SEIS/pull/${number}`,
      isDraft: number === 180 || number === 182,
      createdAt: `2026-07-13T0${index}:00:00Z`,
      updatedAt: `2026-07-13T0${index}:30:00Z`,
      headRefName: `fixture/pr-${number}`,
      headRefOid: headShaByNumber.get(number),
      baseRefName: baseNumber ? `fixture/pr-${baseNumber}` : 'main',
      baseRefOid: baseNumber ? headShaByNumber.get(baseNumber) : 'f'.repeat(40),
      author: 'fixture-owner',
      labels: [],
      classification: {
        disposition: PROTECTED_PULL_REQUESTS.includes(number) ? 'retain' : 'needs-human-review',
        cluster: PROTECTED_PULL_REQUESTS.includes(number)
          ? 'ecosystem-foundation'
          : 'legacy-review',
        risk: 'medium',
        rationale: `Fixture rationale for pull request ${number}.`,
        evidence: [`Fixture evidence for pull request ${number}.`],
        successorPullRequests: [],
        dependsOnPullRequests: baseNumber ? [baseNumber] : [],
        externalReferences: [],
        nextSafeAction:
          'Human review: keep this advisory record pending an explicit owner decision.',
        humanApprovalRequired: true,
      },
    };
  });

  const portfolio = {
    schemaVersion: 1,
    datasetId: EXPECTED_DATASET_ID,
    goalId: 'OPS-GOAL-0001',
    repository: 'emirhankudun-ux/SEIS',
    snapshot: {
      state: 'open',
      retrievedAt: '2026-07-13T09:00:00Z',
      sourceCommand: EXPECTED_SOURCE_COMMAND,
      count: pullRequests.length,
      digest: '',
      defaultBranchRefName: 'main',
      defaultBranchRefOid: 'f'.repeat(40),
      identityFields: [
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
      ],
    },
    policy: {
      advisoryOnly: true,
      githubMutationsPerformed: false,
      requiresHumanApprovalForGitHubMutation: true,
      allowedDispositions: [...ALLOWED_DISPOSITIONS],
      protectedPullRequests: [...PROTECTED_PULL_REQUESTS],
    },
    classificationSummary: {},
    sequence: [
      {
        order: 1,
        cluster: 'ecosystem-foundation',
        prNumbers: [177, 179, 180, 182],
        gate: 'Preserve the active stacked review order.',
        rationale: 'These records represent the protected ecosystem foundation stack.',
        humanApprovalRequired: true,
      },
      {
        order: 2,
        cluster: 'legacy-review',
        prNumbers: [200, 201],
        gate: 'Require focused diff and ownership review.',
        rationale: 'These records require a human uniqueness and safety decision.',
        humanApprovalRequired: true,
      },
    ],
    pullRequests,
  };
  portfolio.snapshot.digest = computeSnapshotDigest(pullRequests);
  portfolio.classificationSummary = summarizePortfolio(pullRequests);
  return portfolio;
}

function createDocuments(portfolio) {
  const metadata = [
    `Goal: \`${portfolio.goalId}\``,
    'Dataset: `data/seis-open-pr-portfolio.json`',
    `Dataset ID: \`${portfolio.datasetId}\``,
    `Snapshot count: \`${portfolio.snapshot.count} open pull requests\``,
    `Snapshot digest: \`${portfolio.snapshot.digest}\``,
    `Retrieved at: \`${portfolio.snapshot.retrievedAt}\``,
  ].join('\n');
  return {
    review: renderPortfolioReviewDocument(portfolio),
    status: metadata,
    backlog: metadata,
    queue: metadata,
  };
}

function toIdentityRecord(pullRequest) {
  return Object.fromEntries(IDENTITY_FIELDS.map(field => [field, pullRequest[field]]));
}

function toRestPullRequest(pullRequest) {
  return {
    number: pullRequest.number,
    title: pullRequest.title,
    html_url: pullRequest.url,
    draft: pullRequest.isDraft,
    created_at: pullRequest.createdAt,
    updated_at: pullRequest.updatedAt,
    head: { ref: pullRequest.headRefName, sha: pullRequest.headRefOid },
    base: { ref: pullRequest.baseRefName, sha: pullRequest.baseRefOid },
    user: { login: pullRequest.author },
    labels: [...pullRequest.labels].reverse().map(name => ({ name })),
  };
}
