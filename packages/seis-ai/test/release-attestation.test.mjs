import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MODEL_RELEASE_TRUST_ROOT_PATH,
  RELEASE_ATTESTATION_ALGORITHM,
  RELEASE_ATTESTATION_AUDIENCE,
  RELEASE_ATTESTATION_POLICY_VERSION,
  RELEASE_ATTESTATION_PROFILE,
  RELEASE_ATTESTATION_TRUST_DOMAIN,
  RELEASE_ATTESTATION_VERIFIER_ID,
  computeReleaseApprovalPayloadDigest,
  deriveEd25519JwkThumbprint,
  readModelReleaseTrustRoot,
  releaseApprovalMessage,
  validateModelReleaseTrustRoot,
  verifyReleaseApprovalAttestation,
} from '../src/model/release-attestation.mjs';
import {
  computeEvidenceRecordHash,
  loadTrainingEvidenceSchemas,
  validateTrainingEvidenceChain,
} from '../src/model/training-evidence.mjs';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const releaseFixture = readJson(
  path.join(
    workspaceRoot,
    'packages/evals/fixtures/training-evidence/valid/06-release-decision.json',
  ),
);
const trustRootSchema = readJson(
  path.join(workspaceRoot, 'packages/shared-types/schemas/model-release-trust-root.schema.json'),
);
const fixedNow = new Date('2026-07-12T08:05:00Z');

describe('SEIS model release Ed25519 attestation', () => {
  it('loads an implemented but unconfigured public-key trust root', () => {
    const trustRoot = readModelReleaseTrustRoot(workspaceRoot);

    assert.equal(MODEL_RELEASE_TRUST_ROOT_PATH.endsWith('.json'), true);
    assert.equal(trustRoot.status, 'not-configured');
    assert.equal(trustRoot.attestationVerification, 'implemented');
    assert.equal(trustRoot.runtimeAuthority, false);
    assert.equal(trustRoot.provenance.source, 'repository-default');
    assert.deepEqual(trustRoot.trustedApprovalKeys, []);
  });

  it('rejects a configured trust root persisted in the repository boundary', () => {
    const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'seis-release-root-'));
    const schemaPath = path.join(
      temporaryRoot,
      'packages/shared-types/schemas/model-release-trust-root.schema.json',
    );
    const configPath = path.join(temporaryRoot, MODEL_RELEASE_TRUST_ROOT_PATH);
    const { trustedKey } = createApprovalKeyPair();

    try {
      mkdirSync(path.dirname(schemaPath), { recursive: true });
      mkdirSync(path.dirname(configPath), { recursive: true });
      writeFileSync(schemaPath, `${JSON.stringify(trustRootSchema, null, 2)}\n`, 'utf8');
      writeFileSync(
        configPath,
        `${JSON.stringify(createTrustRoot(trustedKey), null, 2)}\n`,
        'utf8',
      );

      assert.throws(
        () => readModelReleaseTrustRoot(temporaryRoot),
        /configured roots require a separately governed external startup boundary/,
      );
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
    }
  });

  it('matches the RFC 8037 Ed25519 JWK thumbprint example', () => {
    const keyId = deriveEd25519JwkThumbprint({
      kty: 'OKP',
      crv: 'Ed25519',
      x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo',
    });

    assert.equal(keyId, 'jkt-sha256:kPrK_qmxVWaYVA9wwBF6Iuo3vVzz7TxHCTwXBygrS4k');
  });

  it('verifies a domain-separated release approval with a trusted active key', () => {
    const signed = createSignedRelease();
    const result = verifyReleaseApprovalAttestation({ ...signed, now: fixedNow });

    assert.equal(result.ok, true);
    assert.equal(result.code, 'verified');
    assert.equal(result.keyId, signed.release.approvalAttestation.keyId);
    assert.equal(result.payloadDigest, signed.release.approvalAttestation.payloadDigest);
  });

  it('rejects a payload changed after signing', () => {
    const signed = createSignedRelease();
    signed.release.reasons = ['Changed after the human approval signature was produced.'];

    const result = verifyReleaseApprovalAttestation({ ...signed, now: fixedNow });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'attestation-payload-digest-mismatch');
  });

  it('rejects signature replay across a different release id', () => {
    const signed = createSignedRelease();
    signed.release.id = 'release-decision:another-model:v1';
    signed.release.approvalAttestation.payloadDigest = computeReleaseApprovalPayloadDigest(
      signed.release,
    );

    const result = verifyReleaseApprovalAttestation({ ...signed, now: fixedNow });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'attestation-signature-invalid');
  });

  it('rejects a valid signature when the trust root contains a different key', () => {
    const signed = createSignedRelease();
    const replacement = createApprovalKeyPair();
    signed.trustRoot.trustedApprovalKeys = [replacement.trustedKey];
    signed.release.approvalAttestation.keyId = replacement.trustedKey.keyId;
    signed.release.approvalAttestation.payloadDigest = computeReleaseApprovalPayloadDigest(
      signed.release,
    );

    const result = verifyReleaseApprovalAttestation({ ...signed, now: fixedNow });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'attestation-signature-invalid');
  });

  it('rejects private JWK members in the public trust root', () => {
    const { privateKey, trustedKey } = createApprovalKeyPair();
    const privateJwk = privateKey.export({ format: 'jwk' });
    const trustRoot = createTrustRoot({
      ...trustedKey,
      publicKeyJwk: privateJwk,
    });

    const errors = validateModelReleaseTrustRoot(trustRoot, trustRootSchema);
    assert.ok(errors.some(error => error.includes('additional properties')));
    assert.ok(errors.some(error => error.includes('only crv, kty, and x')));
  });

  it('rejects revoked and expired approval keys', () => {
    const revoked = createSignedRelease();
    revoked.trustRoot.trustedApprovalKeys[0].status = 'revoked';
    assert.equal(
      verifyReleaseApprovalAttestation({ ...revoked, now: fixedNow }).code,
      'approval-key-not-active',
    );

    const expired = createSignedRelease();
    expired.trustRoot.trustedApprovalKeys[0].validUntil = '2026-07-01T00:00:00Z';
    assert.equal(
      verifyReleaseApprovalAttestation({ ...expired, now: fixedNow }).code,
      'approval-key-outside-validity-window',
    );

    const backdated = createSignedRelease();
    backdated.trustRoot.trustedApprovalKeys[0].validUntil = '2026-07-12T08:02:00Z';
    assert.equal(
      verifyReleaseApprovalAttestation({ ...backdated, now: fixedNow }).code,
      'approval-key-outside-validity-window',
    );
  });

  it('rejects stale approvals even when their signing key remains valid', () => {
    const signed = createSignedRelease();
    const result = verifyReleaseApprovalAttestation({
      ...signed,
      now: new Date('2026-07-12T08:30:01Z'),
    });

    assert.equal(result.ok, false);
    assert.equal(result.code, 'attestation-approval-too-old');
  });

  it('binds verification metadata into the signed approval envelope', () => {
    const signed = createSignedRelease();
    signed.release.approvalAttestation.verifiedAt = '2026-07-12T08:01:00Z';

    const result = verifyReleaseApprovalAttestation({ ...signed, now: fixedNow });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'attestation-payload-digest-mismatch');
  });

  it('rejects approval replay into another configured audience', () => {
    const signed = createSignedRelease();
    signed.trustRoot.audience = 'another-model-registry';

    const result = verifyReleaseApprovalAttestation({ ...signed, now: fixedNow });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'trust-root-policy-mismatch');
  });

  it('rejects an unconfigured trust root before signature processing', () => {
    const signed = createSignedRelease();
    signed.trustRoot.status = 'not-configured';
    signed.trustRoot.trustedApprovalKeys = [];

    const result = verifyReleaseApprovalAttestation({ ...signed, now: fixedNow });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'trust-root-not-configured');
  });

  it('rejects self-asserted verification metadata without a valid signature', () => {
    const signed = createSignedRelease();
    signed.release.approvalAttestation.signature = 'A'.repeat(86);

    const result = verifyReleaseApprovalAttestation({ ...signed, now: fixedNow });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'attestation-signature-invalid');
  });

  it('fails closed on malformed or noncanonical base64url signatures', () => {
    for (const signature of ['A'.repeat(85), `${'A'.repeat(85)}=`, '!'.repeat(86)]) {
      const signed = createSignedRelease();
      signed.release.approvalAttestation.signature = signature;

      const result = verifyReleaseApprovalAttestation({ ...signed, now: fixedNow });
      assert.equal(result.ok, false);
      assert.ok(
        ['attestation-signature-encoding-invalid', 'attestation-signature-length-invalid'].includes(
          result.code,
        ),
      );
    }
  });

  it('accepts a fully linked in-memory evidence chain only with the real verifier', () => {
    const records = buildAcceptedEvidenceChain();
    const schemas = loadTrainingEvidenceSchemas(workspaceRoot);
    const { privateKey, trustedKey } = createApprovalKeyPair();
    const release = records.at(-1);

    release.approvalAttestation = createApprovalAttestation(release, privateKey, trustedKey);
    rehashEvidenceChain(records);

    const result = validateTrainingEvidenceChain(records, schemas, {
      trustRoot: createTrustRoot(trustedKey),
    });
    assert.equal(result.ok, true, result.errors.join('\n'));

    release.reasons = ['Tampered after the trusted approval signature was created.'];
    rehashEvidenceChain(records);
    const tampered = validateTrainingEvidenceChain(records, schemas, {
      trustRoot: createTrustRoot(trustedKey),
    });
    assert.equal(tampered.ok, false);
    assert.ok(tampered.errors.some(error => error.includes('attestation-payload-digest-mismatch')));
  });

  it('rejects cryptographically valid chains with unbound or extra references', () => {
    const cases = [
      {
        mutate: records => {
          records.at(-1).subjectId = 'checkpoint:unrelated-synthetic:v1';
        },
        expected: 'release allow subject must bind the accepted checkpoint',
      },
      {
        mutate: records => {
          records.at(-1).datasetManifestIds.push('dataset:unresolved-synthetic:v1');
        },
        expected: 'release dataset reference mismatch',
      },
      {
        mutate: records => {
          records[2].checkpointIds = [];
        },
        expected: 'training run checkpoint reference mismatch',
      },
    ];

    for (const testCase of cases) {
      const records = buildAcceptedEvidenceChain();
      const schemas = loadTrainingEvidenceSchemas(workspaceRoot);
      const { privateKey, trustedKey } = createApprovalKeyPair();
      testCase.mutate(records);
      records.at(-1).approvalAttestation = createApprovalAttestation(
        records.at(-1),
        privateKey,
        trustedKey,
      );
      rehashEvidenceChain(records);

      const result = validateTrainingEvidenceChain(records, schemas, {
        trustRoot: createTrustRoot(trustedKey),
      });
      assert.equal(result.ok, false);
      assert.ok(result.errors.includes(testCase.expected), result.errors.join('\n'));
    }
  });
});

function createSignedRelease() {
  const { privateKey, trustedKey } = createApprovalKeyPair();
  const release = structuredClone(releaseFixture);
  release.fixtureOnly = false;
  release.recordStatus = 'accepted';
  release.decision = 'allow';
  release.allRequiredEvidenceAccepted = true;
  release.humanApprovalId = 'approval:synthetic-unit-test:v1';
  release.createdAt = '2026-07-12T08:00:00Z';
  release.modelCard.status = 'accepted';
  release.datasetCards.forEach(card => {
    card.status = 'accepted';
  });
  release.approvalAttestation = createApprovalAttestation(release, privateKey, trustedKey);

  return {
    release,
    trustRoot: createTrustRoot(trustedKey),
  };
}

function createApprovalAttestation(release, privateKey, trustedKey) {
  const attestation = {
    verificationStatus: 'verified',
    attestationId: 'release-attestation:synthetic-unit-test:v1',
    profile: RELEASE_ATTESTATION_PROFILE,
    trustDomain: RELEASE_ATTESTATION_TRUST_DOMAIN,
    audience: RELEASE_ATTESTATION_AUDIENCE,
    policyVersion: RELEASE_ATTESTATION_POLICY_VERSION,
    approvedAt: release.createdAt,
    keyId: trustedKey.keyId,
    algorithm: RELEASE_ATTESTATION_ALGORITHM,
    payloadDigest: null,
    signature: null,
    verifiedAt: release.createdAt,
    verifierId: RELEASE_ATTESTATION_VERIFIER_ID,
  };
  release.approvalAttestation = attestation;
  attestation.payloadDigest = computeReleaseApprovalPayloadDigest(release);
  attestation.signature = sign(null, releaseApprovalMessage(release), privateKey).toString(
    'base64url',
  );
  return attestation;
}

function createApprovalKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const publicKeyJwk = publicKey.export({ format: 'jwk' });
  const keyId = deriveEd25519JwkThumbprint(publicKeyJwk);
  return {
    privateKey,
    trustedKey: {
      keyId,
      status: 'active',
      authorityId: 'approval-authority:synthetic-unit-test:v1',
      publicKeyJwk,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2027-01-01T00:00:00Z',
      approvalScopes: ['model-release'],
      truthBoundary:
        'Synthetic in-memory unit-test key. It is never persisted and never authorizes a real release.',
    },
  };
}

function createTrustRoot(trustedKey) {
  return {
    schemaRef: 'packages/shared-types/schemas/model-release-trust-root.schema.json',
    schemaVersion: 1,
    id: 'seis-model-release-trust-root',
    version: '2026.07.12',
    status: 'configured',
    attestationVerification: 'implemented',
    signatureProfile: RELEASE_ATTESTATION_PROFILE,
    signatureAlgorithm: RELEASE_ATTESTATION_ALGORITHM,
    keyIdScheme: 'rfc7638-jwk-thumbprint-sha256',
    trustDomain: RELEASE_ATTESTATION_TRUST_DOMAIN,
    audience: RELEASE_ATTESTATION_AUDIENCE,
    policyVersion: RELEASE_ATTESTATION_POLICY_VERSION,
    maxApprovalAgeSeconds: 900,
    provenance: {
      source: 'external-startup',
      sourceId: 'synthetic-test-startup-boundary',
      truthBoundary:
        'Synthetic in-memory startup trust boundary for local tests only; never a real authority.',
    },
    trustedApprovalKeys: [trustedKey],
    releaseAllowWithoutVerifiedAttestation: false,
    runtimeAuthority: false,
    updatedAt: '2026-07-12T00:00:00Z',
    truthBoundary:
      'Synthetic configured trust root for local unit tests only. It grants no runtime authority.',
  };
}

function buildAcceptedEvidenceChain() {
  const records = [1, 2, 3, 4, 5, 6].map(index =>
    readJson(
      path.join(
        workspaceRoot,
        `packages/evals/fixtures/training-evidence/valid/0${index}-${
          [
            'dataset-manifest',
            'compute-approval',
            'training-run',
            'checkpoint-record',
            'evaluation-report',
            'release-decision',
          ][index - 1]
        }.json`,
      ),
    ),
  );
  const [dataset, compute, run, checkpoint, evaluation, release] = records;
  const hash = character => `sha256:${character.repeat(64)}`;

  Object.assign(dataset, {
    fixtureOnly: false,
    recordStatus: 'accepted',
    createdAt: '2026-07-10T00:00:00Z',
    datasetReady: true,
    provenanceStatus: 'accepted',
    licenseStatus: 'accepted',
    sourceCount: 1,
    sources: [
      {
        sourceId: 'source:synthetic-unit-test',
        sourceType: 'synthetic',
        uri: 'repo://tests/synthetic-dataset',
        license: 'synthetic-test-only',
        accessClass: 'public',
        sha256: hash('1'),
        approvedForTraining: true,
      },
    ],
    splits: {
      train: { sampleCount: 8, manifestSha256: hash('2') },
      dev: { sampleCount: 2, manifestSha256: hash('3') },
      test: { sampleCount: 2, manifestSha256: hash('4') },
    },
    contaminationReview: {
      status: 'passed',
      reportPath: 'reports/tests/synthetic-contamination.json',
      reviewedAt: '2026-07-10T01:00:00Z',
    },
    humanApproval: {
      required: true,
      status: 'accepted',
      approvalId: 'approval:synthetic-dataset-unit-test:v1',
    },
    truthBoundary: 'Accepted-shaped in-memory unit-test record; not real dataset evidence.',
  });
  dataset.datasetCard.status = 'accepted';

  Object.assign(compute, {
    fixtureOnly: false,
    recordStatus: 'accepted',
    createdAt: '2026-07-10T02:00:00Z',
    approved: true,
    executionAllowed: true,
    scope: {
      modelClass: 'seed',
      methods: ['sft'],
      provider: 'synthetic-test-provider',
      hardwareClass: 'synthetic-test-cpu',
      region: 'local-test',
      maxBudgetUsd: 1,
      maxGpuHours: 1,
    },
    costStop: { enabled: true, hardLimitUsd: 1, ownerRole: 'cloud-agent' },
    expiresAt: '2026-07-20T00:00:00Z',
    approverRole: 'test-approver',
    approvalId: 'approval:synthetic-compute-unit-test:v1',
    truthBoundary: 'Accepted-shaped in-memory unit-test record; no compute was provisioned.',
  });

  Object.assign(run, {
    fixtureOnly: false,
    recordStatus: 'completed',
    baseModel: {
      id: 'synthetic-seed-model',
      owner: 'seis-test',
      license: 'synthetic-test-only',
      artifactHash: hash('5'),
    },
    codeCommit: 'a'.repeat(40),
    createdAt: '2026-07-10T03:00:00Z',
    startedAt: '2026-07-10T03:05:00Z',
    completedAt: '2026-07-10T03:10:00Z',
    trainingPerformed: true,
    logs: ['reports/tests/synthetic-training.log'],
    checkpointIds: [checkpoint.id],
    truthBoundary: 'Completed-shaped in-memory unit-test record; no model training occurred.',
  });

  Object.assign(checkpoint, {
    fixtureOnly: false,
    recordStatus: 'accepted',
    architectureId: 'synthetic-test-architecture',
    tokenizerId: 'synthetic-test-tokenizer',
    dependencyLockHash: hash('6'),
    containerImageDigest: hash('7'),
    hardwareProfile: 'synthetic-test-cpu',
    runtimeVersion: 'node-test-runtime-v1',
    verificationStatus: 'passed',
    safetyReviewStatus: 'accepted',
    privacyReviewStatus: 'accepted',
    step: 1,
    artifactExists: true,
    artifactUri: 'artifacts/tests/synthetic-checkpoint',
    artifactHash: hash('8'),
    createdAt: '2026-07-10T04:00:00Z',
    truthBoundary: 'Accepted-shaped in-memory unit-test record; no checkpoint artifact exists.',
  });
  checkpoint.modelCard.status = 'accepted';

  Object.assign(evaluation, {
    fixtureOnly: false,
    recordStatus: 'completed',
    benchmarkExecuted: true,
    codeCommit: 'a'.repeat(40),
    hardwareProfile: 'synthetic-test-cpu',
    runtimeVersion: 'node-test-runtime-v1',
    metrics: [
      {
        name: 'synthetic-score',
        value: 1,
        unit: 'ratio',
        direction: 'higher-is-better',
        threshold: 1,
        passed: true,
      },
    ],
    contaminationStatus: 'passed',
    independentReviewStatus: 'accepted',
    reportUri: 'reports/tests/synthetic-evaluation.json',
    reportHash: hash('9'),
    rawOutputUri: 'reports/tests/synthetic-evaluation-raw.json',
    rawOutputHash: hash('a'),
    createdAt: '2026-07-10T05:00:00Z',
    truthBoundary: 'Completed-shaped in-memory unit-test record; no benchmark was executed.',
  });

  Object.assign(release, {
    fixtureOnly: false,
    recordStatus: 'accepted',
    decision: 'allow',
    allRequiredEvidenceAccepted: true,
    humanApprovalId: 'approval:synthetic-release-unit-test:v1',
    reasons: ['Synthetic full-chain verifier integration test passed.'],
    createdAt: new Date().toISOString(),
    truthBoundary: 'Accepted-shaped in-memory unit-test record; no real release is authorized.',
  });
  release.modelCard.status = 'accepted';
  release.datasetCards.forEach(card => {
    card.status = 'accepted';
  });

  rehashEvidenceChain(records);
  return records;
}

function rehashEvidenceChain(records) {
  records.forEach((record, index) => {
    record.previousRecordHash = index === 0 ? null : records[index - 1].recordHash;
    record.recordHash = computeEvidenceRecordHash(record);
  });
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}
