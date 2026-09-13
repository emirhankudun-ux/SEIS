import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  summarizeSeisSovereignProductTrack,
  validateSeisSovereignProductTrack,
} from '../scripts/lib/seis-sovereign-product-track.mjs';

const track = JSON.parse(fs.readFileSync('content/development/seis-sovereign-product-track.json', 'utf8'));
const knownPaths = new Set(['AGENTS.md', 'docs/SEIS_GOAL_TRACKING.md', 'project.ecosystem.yaml']);
const validate = (value) => validateSeisSovereignProductTrack(value, { pathExists: (path) => knownPaths.has(path) });

test('accepts the SEIS sovereign product track and summarizes it', () => {
  const result = validate(track);
  assert.equal(result.ok, true, result.errors.join('\n'));
  const summary = summarizeSeisSovereignProductTrack(track);
  assert.equal(summary.project.id, 'seis');
  assert.equal(summary.ownedDomainCount, 8);
  assert.equal(summary.nonOwnershipProjectCount, 3);
});

test('rejects identity drift and umbrella ownership', () => {
  const drifted = structuredClone(track);
  drifted.project.id = 'unified-ecosystem';
  assert.match(validate(drifted).errors.join('\n'), /project.id must be seis/);

  const umbrella = structuredClone(track);
  umbrella.explicitNonOwnership = umbrella.explicitNonOwnership.filter((entry) => entry.projectId !== 'eleni-neferi');
  assert.match(validate(umbrella).errors.join('\n'), /missing non-ownership boundary: eleni-neferi/);
});

test('rejects authority widening and source imports', () => {
  const widened = structuredClone(track);
  widened.interoperability.crossRepositoryWrites = true;
  widened.interoperability.sourceCodeImport = true;
  widened.policy.liveProviderExecution = true;
  const errors = validate(widened).errors.join('\n');
  assert.match(errors, /crossRepositoryWrites must be false/);
  assert.match(errors, /sourceCodeImport must be false/);
  assert.match(errors, /liveProviderExecution must be false/);
});

test('rejects duplicate domains, unsafe evidence, and missing evidence', () => {
  const invalid = structuredClone(track);
  invalid.ownedDomains.push(invalid.ownedDomains[0]);
  invalid.deliveryTracks[0].evidence = ['../private.txt', 'missing.md'];
  const errors = validate(invalid).errors.join('\n');
  assert.match(errors, /duplicate value/);
  assert.match(errors, /unsafe evidence path/);
  assert.match(errors, /missing evidence path/);
});

test('rejects sensitive-shaped fields', () => {
  const invalid = structuredClone(track);
  invalid.project.accessToken = 'not-allowed';
  assert.match(validate(invalid).errors.join('\n'), /sensitive-shaped key/);
});
