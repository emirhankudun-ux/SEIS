import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeEvidenceRecordHash,
  loadTrainingEvidenceSchemas,
  readTrainingEvidenceChain,
  trainingEvidenceStatus,
  validateEvidenceRecord,
  validateInvalidEvidenceCases,
  validateTrainingEvidenceChain,
} from '../src/model/training-evidence.mjs';
import { assertNoCredentialLikeJsonContent } from '../src/lib/credential-safety.mjs';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
let temporaryRoot = null;

afterEach(() => {
  if (temporaryRoot) rmSync(temporaryRoot, { recursive: true, force: true });
  temporaryRoot = null;
});

describe('SEIS model training evidence chain', () => {
  it('compiles six Draft 2020-12 schemas and validates every synthetic record', () => {
    const contract = readTrainingEvidenceChain(workspaceRoot);
    const schemas = loadTrainingEvidenceSchemas(workspaceRoot);
    const records = contract.fixtures.validRecords.map(relativePath =>
      readJson(path.join(workspaceRoot, relativePath)),
    );

    assert.equal(Object.keys(schemas).length, 6);
    assert.ok(
      Object.values(schemas).every(
        schema =>
          schema.$schema === 'https://json-schema.org/draft/2020-12/schema' &&
          schema.additionalProperties === false,
      ),
    );
    for (const record of records) {
      assert.deepEqual(validateEvidenceRecord(record, schemas[record.recordType]), []);
      assert.equal(record.fixtureOnly, true);
      assert.equal(record.recordStatus, 'fixture-only-not-evidence');
      assert.equal(record.recordHash, computeEvidenceRecordHash(record));
    }
  });

  it('verifies immutable previous-hash linkage and cross-record references', () => {
    const contract = readTrainingEvidenceChain(workspaceRoot);
    const schemas = loadTrainingEvidenceSchemas(workspaceRoot);
    const records = contract.fixtures.validRecords.map(relativePath =>
      readJson(path.join(workspaceRoot, relativePath)),
    );
    const result = validateTrainingEvidenceChain(records, schemas);

    assert.equal(result.ok, true);
    assert.equal(result.recordCount, 6);
    assert.equal(result.chainHead, records.at(-1).recordHash);
  });

  it('rejects every declared invalid schema or semantic fixture', () => {
    const contract = readTrainingEvidenceChain(workspaceRoot);
    const schemas = loadTrainingEvidenceSchemas(workspaceRoot);
    const invalidCases = readJson(path.join(workspaceRoot, contract.fixtures.invalidCases));
    const result = validateInvalidEvidenceCases(invalidCases.cases, schemas);

    assert.equal(result.ok, true);
    assert.equal(result.caseCount, 8);
    assert.deepEqual(result.failures, []);
  });

  it('rejects a tampered previous hash and broken release reference', () => {
    const contract = readTrainingEvidenceChain(workspaceRoot);
    const schemas = loadTrainingEvidenceSchemas(workspaceRoot);
    const records = contract.fixtures.validRecords.map(relativePath =>
      readJson(path.join(workspaceRoot, relativePath)),
    );
    records[3].previousRecordHash = null;
    records[5].evaluationReportIds = ['evaluation:missing-fixture:v1'];
    records[3].recordHash = computeEvidenceRecordHash(records[3]);
    records[5].recordHash = computeEvidenceRecordHash(records[5]);

    const result = validateTrainingEvidenceChain(records, schemas);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(error => error.includes('previousRecordHash mismatch')));
    assert.ok(result.errors.some(error => error.includes('release evaluation reference mismatch')));
  });

  it('rejects release allow when linked evidence remains fixture-only or unaccepted', () => {
    const contract = readTrainingEvidenceChain(workspaceRoot);
    const schemas = loadTrainingEvidenceSchemas(workspaceRoot);
    const records = contract.fixtures.validRecords.map(relativePath =>
      readJson(path.join(workspaceRoot, relativePath)),
    );
    const release = records.at(-1);
    release.fixtureOnly = false;
    release.recordStatus = 'accepted';
    release.decision = 'allow';
    release.allRequiredEvidenceAccepted = true;
    release.humanApprovalId = 'approval:synthetic-test-fixture:v1';
    release.createdAt = '2026-07-11T00:00:00Z';
    release.modelCard.status = 'accepted';
    release.datasetCards.forEach(card => {
      card.status = 'accepted';
    });
    release.recordHash = computeEvidenceRecordHash(release);

    const result = validateTrainingEvidenceChain(records, schemas);
    assert.equal(result.ok, false);
    assert.ok(result.errors.includes('release allow requires accepted linked evidence'));
    assert.ok(
      result.errors.includes(
        'release allow requires a configured external trust root and verified attestation',
      ),
    );
    assert.ok(
      result.errors.some(error =>
        error.startsWith('release allow requires a successful external attestation verifier:'),
      ),
    );
  });

  it('does not trust self-asserted attestation fields without an external verifier', () => {
    const contract = readTrainingEvidenceChain(workspaceRoot);
    const schemas = loadTrainingEvidenceSchemas(workspaceRoot);
    const records = contract.fixtures.validRecords.map(relativePath =>
      readJson(path.join(workspaceRoot, relativePath)),
    );
    const release = records.at(-1);
    release.fixtureOnly = false;
    release.recordStatus = 'accepted';
    release.decision = 'allow';
    release.allRequiredEvidenceAccepted = true;
    release.humanApprovalId = 'approval:synthetic-test-fixture:v1';
    release.createdAt = '2026-07-11T00:00:00Z';
    release.modelCard.status = 'accepted';
    release.datasetCards.forEach(card => {
      card.status = 'accepted';
    });
    release.approvalAttestation = {
      verificationStatus: 'verified',
      attestationId: 'release-attestation:synthetic-self-assertion:v1',
      profile: 'seis-ed25519-release-v1',
      trustDomain: 'seis-model-release',
      audience: 'seis-public-model-registry',
      policyVersion: '2026.07.12',
      approvedAt: '2026-07-11T00:00:00Z',
      keyId: `jkt-sha256:${'A'.repeat(43)}`,
      algorithm: 'ed25519',
      payloadDigest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      signature: 'A'.repeat(86),
      verifiedAt: '2026-07-11T00:00:00Z',
      verifierId: 'seis-ed25519-release-verifier-v1',
    };
    release.recordHash = computeEvidenceRecordHash(release);

    const result = validateTrainingEvidenceChain(records, schemas, {
      trustRoot: {
        status: 'configured',
        attestationVerification: 'implemented',
        signatureProfile: 'seis-ed25519-release-v1',
        signatureAlgorithm: 'ed25519',
        keyIdScheme: 'rfc7638-jwk-thumbprint-sha256',
        trustDomain: 'seis-model-release',
        audience: 'seis-public-model-registry',
        policyVersion: '2026.07.12',
        maxApprovalAgeSeconds: 900,
        provenance: {
          source: 'external-startup',
          sourceId: 'synthetic-self-assertion-test',
          truthBoundary:
            'Synthetic test-only trust-root provenance; no external authority is configured.',
        },
        trustedApprovalKeys: [],
        releaseAllowWithoutVerifiedAttestation: false,
        runtimeAuthority: false,
      },
    });

    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(error =>
        error.startsWith('release allow requires a successful external attestation verifier:'),
      ),
    );
  });

  it('reports zero real evidence while validating synthetic fixtures', () => {
    const status = trainingEvidenceStatus(workspaceRoot);

    assert.equal(status.ok, true);
    assert.equal(status.status, 'schema-foundation-no-execution');
    assert.equal(status.schemaCount, 6);
    assert.equal(status.currentEvidenceRecordCount, 0);
    assert.equal(status.releaseDecision, 'deny');
    assert.equal(status.trainingAuthorized, false);
    assert.equal(status.routeEligibleToday, false);
    assert.equal(status.replayProtection.executorLedgerRequired, true);
    assert.equal(
      status.replayProtection.executorLedgerStatus,
      'not-implemented-no-release-executor',
    );
    assert.equal(status.fixtureValidation.validRecordCount, 6);
    assert.equal(status.fixtureValidation.invalidCaseCount, 8);
    assert.equal(status.fixtureValidation.allValidFixturesPassed, true);
    assert.equal(status.fixtureValidation.allInvalidFixturesRejected, true);
    assert.equal(status.executionEvidence.trainingRunPerformed, false);
    assert.equal(status.executionEvidence.checkpointCreated, false);
    assert.equal(status.executionEvidence.benchmarkRunPerformed, false);
  });

  it('fails closed when the real evidence counter is tampered', () => {
    temporaryRoot = mkdtempSync(path.join(tmpdir(), 'seis-training-evidence-'));
    copyEvidenceWorkspace(temporaryRoot);
    const contractPath = path.join(
      temporaryRoot,
      'content/development/seis-model-training-evidence-chain.json',
    );
    const contract = readJson(contractPath);
    contract.evidenceCounts.trainingRuns = 1;
    writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');

    const status = trainingEvidenceStatus(temporaryRoot);
    assert.equal(status.ok, false);
    assert.equal(status.status, 'invalid-fail-closed');
    assert.equal(status.releaseDecision, 'deny');
    assert.equal(status.trainingAuthorized, false);
    assert.equal(status.routeEligibleToday, false);
    assert.match(status.error, /trainingRuns evidence count must remain zero/);
  });

  it('scans decoded JSON strings so Unicode escapes cannot hide credentials', () => {
    const raw = `{"note":"github\\u005fpat\\u005f${'A'.repeat(24)}"}`;
    const parsed = JSON.parse(raw);

    assert.throws(
      () => assertNoCredentialLikeJsonContent(raw, parsed, { label: 'synthetic test record' }),
      /blocked credential category: provider-or-platform-token/,
    );
  });

  it('fails closed when an evidence path is replaced by a symlink', () => {
    temporaryRoot = mkdtempSync(path.join(tmpdir(), 'seis-training-evidence-symlink-'));
    copyEvidenceWorkspace(temporaryRoot);
    const schemaPath = path.join(
      temporaryRoot,
      'packages/evals/schemas/checkpoint-record.schema.json',
    );
    rmSync(schemaPath);
    symlinkSync(
      path.join(workspaceRoot, 'packages/evals/schemas/checkpoint-record.schema.json'),
      schemaPath,
    );

    const status = trainingEvidenceStatus(temporaryRoot);
    assert.equal(status.ok, false);
    assert.equal(status.releaseDecision, 'deny');
    assert.match(status.error, /must not be a symbolic link/);
  });
});

function copyEvidenceWorkspace(targetRoot) {
  for (const relativePath of [
    'content/development/seis-model-training-evidence-chain.json',
    'content/development/seis-model-release-trust-root.json',
    'content/development/seis-20b-model-card-template.json',
    'content/development/seis-20b-dataset-card-template.json',
    'packages/data/schemas',
    'packages/shared-types/schemas',
    'packages/evals/schemas',
    'packages/evals/fixtures/training-evidence',
  ]) {
    const targetPath = path.join(targetRoot, relativePath);
    mkdirSync(path.dirname(targetPath), { recursive: true });
    cpSync(path.join(workspaceRoot, relativePath), targetPath, {
      recursive: true,
    });
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}
