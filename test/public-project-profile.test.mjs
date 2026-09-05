import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validatePublicProjectProfile,
} from '../scripts/check-public-project-profile.mjs';

const validBridge = () => ({
  schemaVersion: 1,
  contractId: 'unified-ecosystem-bridge-v1',
  project: {
    id: 'seis',
    displayName: 'SEIS',
    role: 'platform-runtime',
    sourceRepository: 'emirhankudun-ux/SEIS',
  },
  publicExport: {
    enabled: true,
    policy: 'public-safe-curated-only',
  },
  projectProfile: {
    declared: true,
    contractId: 'ecosystem-project-profile-v1',
    schemaVersion: 1,
    manifestPath: 'content/ecosystem/public-project-profile.json',
    schemaOwner: 'unified-flagship',
  },
});

const validProfile = () => ({
  schemaVersion: 1,
  contractId: 'ecosystem-project-profile-v1',
  projectId: 'seis',
  displayName: 'SEIS',
  role: 'platform-runtime',
  repository: 'emirhankudun-ux/SEIS',
  visibility: 'public',
  summary: 'Apple-first platform runtime coordinating supervised AI, agents, tools, local workspaces, evidence, and public-safe engineering demonstrations.',
  capabilityGroups: [
    {
      id: 'platform-foundation',
      label: 'Platform Foundation',
      status: 'source-declared',
      capabilities: ['workspace-runtime', 'native-platform', 'command-center'],
    },
    {
      id: 'ai-orchestration',
      label: 'AI Orchestration',
      status: 'source-declared',
      capabilities: ['ai-core', 'agent-runtime', 'model-router'],
    },
  ],
  publicBoundary: {
    exportEnabled: true,
    containsPrivateMemory: false,
    containsPrivateData: false,
    containsClientData: false,
    credentialsRequired: false,
    runtimeAuthority: false,
    crossRepositoryWrite: false,
  },
  verification: {
    commands: ['node scripts/check-public-project-profile.mjs'],
    evidenceState: 'not-recorded',
  },
});

test('accepts the SEIS profile aligned with the local bridge', () => {
  const result = validatePublicProjectProfile(validProfile(), validBridge());
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('rejects project identity and visibility drift', () => {
  const profile = validProfile();
  profile.projectId = 'eleni-neferi';
  profile.repository = 'example/other';
  profile.visibility = 'private';

  const result = validatePublicProjectProfile(profile, validBridge());
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /projectId/);
  assert.match(result.errors.join('\n'), /repository/);
  assert.match(result.errors.join('\n'), /visibility/);
});

test('rejects authority widening and private-data boundaries', () => {
  const profile = validProfile();
  profile.publicBoundary.runtimeAuthority = true;
  profile.publicBoundary.crossRepositoryWrite = true;
  profile.publicBoundary.containsPrivateData = true;

  const result = validatePublicProjectProfile(profile, validBridge());
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /runtimeAuthority/);
  assert.match(result.errors.join('\n'), /crossRepositoryWrite/);
  assert.match(result.errors.join('\n'), /containsPrivateData/);
});

test('rejects duplicate capabilities and secret-shaped fields', () => {
  const profile = validProfile();
  profile.capabilityGroups[1].capabilities.push('ai-core');
  profile.verification.accessToken = 'example';

  const result = validatePublicProjectProfile(profile, validBridge());
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /duplicate capability/);
  assert.match(result.errors.join('\n'), /secret-like key/);
});
