#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { IDENTITY_FIELDS, compareCanonicalStrings } from './check-seis-open-pr-portfolio.mjs';

const ENDPOINT =
  'repos/emirhankudun-ux/SEIS/pulls?state=open&per_page=100&sort=created&direction=desc';

export function normalizeLivePullRequests(rawPullRequests) {
  if (!Array.isArray(rawPullRequests)) {
    throw new TypeError('GitHub response must be a pull-request array');
  }
  return rawPullRequests
    .map(pullRequest => ({
      number: pullRequest.number,
      title: pullRequest.title,
      url: pullRequest.html_url,
      isDraft: pullRequest.draft,
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at,
      headRefName: pullRequest.head?.ref,
      headRefOid: pullRequest.head?.sha,
      baseRefName: pullRequest.base?.ref,
      baseRefOid: pullRequest.base?.sha,
      author: pullRequest.user?.login,
      labels: (pullRequest.labels || []).map(label => label.name).sort(compareCanonicalStrings),
    }))
    .sort((left, right) => left.number - right.number);
}

export function compareSnapshotIdentities(snapshotPullRequests, livePullRequests) {
  const snapshot = new Map(
    snapshotPullRequests.map(pullRequest => [pullRequest.number, pullRequest]),
  );
  const live = new Map(livePullRequests.map(pullRequest => [pullRequest.number, pullRequest]));
  const numbers = [...new Set([...snapshot.keys(), ...live.keys()])].sort(
    (left, right) => left - right,
  );
  const deltas = [];

  for (const number of numbers) {
    const snapshotPullRequest = snapshot.get(number);
    const livePullRequest = live.get(number);
    if (!snapshotPullRequest || !livePullRequest) {
      deltas.push({
        number,
        kind: snapshotPullRequest ? 'removed-from-live' : 'added-to-live',
      });
      continue;
    }
    const fields = [];
    for (const field of IDENTITY_FIELDS) {
      if (JSON.stringify(snapshotPullRequest[field]) !== JSON.stringify(livePullRequest[field])) {
        fields.push(field);
      }
    }
    if (fields.length > 0) deltas.push({ number, kind: 'identity-drift', fields });
  }
  return deltas;
}

function runCli() {
  const portfolio = JSON.parse(readFileSync('data/seis-open-pr-portfolio.json', 'utf8'));
  const response = execFileSync('gh', ['api', '--method', 'GET', ENDPOINT], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const livePullRequests = normalizeLivePullRequests(JSON.parse(response));
  const deltas = compareSnapshotIdentities(portfolio.pullRequests, livePullRequests);

  if (deltas.length > 0) {
    console.error('SEIS open PR live reconciliation detected snapshot drift:');
    for (const delta of deltas) {
      const fields = delta.fields ? ` (${delta.fields.join(', ')})` : '';
      console.error(`- PR #${delta.number}: ${delta.kind}${fields}`);
    }
    process.exit(1);
  }

  console.log(
    `SEIS open PR live reconciliation passed: ${livePullRequests.length} identities match ` +
      `${portfolio.datasetId} at ${portfolio.snapshot.digest}.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
