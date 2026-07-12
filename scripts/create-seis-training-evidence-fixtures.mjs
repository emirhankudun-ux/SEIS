#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { format } from 'prettier';

import { computeEvidenceRecordHash } from '../packages/seis-ai/src/model/training-evidence.mjs';

const root = process.cwd();
const validDir = path.join(root, 'packages/evals/fixtures/training-evidence/valid');
const invalidDir = path.join(root, 'packages/evals/fixtures/training-evidence/invalid');
mkdirSync(validDir, { recursive: true });
mkdirSync(invalidDir, { recursive: true });

const ids = {
  dataset: 'dataset:synthetic-test-fixture:v1',
  compute: 'compute-approval:synthetic-test-fixture:v1',
  run: 'training-run:synthetic-test-fixture:v1',
  checkpoint: 'checkpoint:synthetic-test-fixture:v1',
  evaluation: 'evaluation:synthetic-test-fixture:v1',
  release: 'release-decision:synthetic-test-fixture:v1',
  modelCard: 'model-card:synthetic-test-fixture:v1',
  datasetCard: 'dataset-card:synthetic-test-fixture:v1',
};

const configHash = `sha256:${createHash('sha256')
  .update('seis-synthetic-test-fixture-config-v1')
  .digest('hex')}`;
const modelCardHash = fixtureContentHash('seis-synthetic-model-card-fixture-v1');
const datasetCardHash = fixtureContentHash('seis-synthetic-dataset-card-fixture-v1');

const records = [
  {
    schemaRef: 'packages/data/schemas/model-dataset-manifest.schema.json',
    schemaVersion: 1,
    recordType: 'dataset-manifest',
    id: ids.dataset,
    recordStatus: 'fixture-only-not-evidence',
    fixtureOnly: true,
    recordHash: '',
    previousRecordHash: null,
    version: 1,
    createdAt: null,
    ownerRole: 'data-agent',
    datasetCard: {
      id: ids.datasetCard,
      contentHash: datasetCardHash,
      status: 'fixture-only-not-evidence',
    },
    datasetReady: false,
    provenanceStatus: 'not-reviewed',
    licenseStatus: 'not-reviewed',
    containsPrivateData: false,
    sourceCount: 0,
    sources: [],
    splits: {
      train: { sampleCount: 0, manifestSha256: null },
      dev: { sampleCount: 0, manifestSha256: null },
      test: { sampleCount: 0, manifestSha256: null },
    },
    contaminationReview: {
      status: 'not-run',
      reportPath: null,
      reviewedAt: null,
    },
    humanApproval: {
      required: true,
      status: 'missing',
      approvalId: null,
    },
    truthBoundary:
      'Synthetic schema fixture only; no dataset was collected, downloaded, approved, or used for training.',
  },
  {
    schemaRef: 'packages/shared-types/schemas/model-compute-approval.schema.json',
    schemaVersion: 1,
    recordType: 'compute-approval',
    id: ids.compute,
    recordStatus: 'fixture-only-not-evidence',
    fixtureOnly: true,
    recordHash: '',
    previousRecordHash: null,
    createdAt: null,
    approved: false,
    executionAllowed: false,
    scope: {
      modelClass: 'seed',
      methods: ['sft'],
      provider: null,
      hardwareClass: 'not-selected',
      region: null,
      maxBudgetUsd: 0,
      maxGpuHours: 0,
    },
    costStop: {
      enabled: false,
      hardLimitUsd: 0,
      ownerRole: 'cloud-agent',
    },
    expiresAt: null,
    approverRole: null,
    approvalId: null,
    truthBoundary:
      'Synthetic schema fixture only; no compute, provider, budget, GPU, or execution was approved.',
  },
  {
    schemaRef: 'packages/evals/schemas/model-training-run.schema.json',
    schemaVersion: 1,
    recordType: 'training-run',
    id: ids.run,
    recordStatus: 'fixture-only-not-evidence',
    fixtureOnly: true,
    recordHash: '',
    previousRecordHash: null,
    method: 'sft',
    modelClass: 'seed',
    datasetManifestId: ids.dataset,
    computeApprovalId: ids.compute,
    baseModel: {
      id: 'unselected-fixture-base',
      owner: 'unknown',
      license: 'not-reviewed',
      artifactHash: null,
    },
    configHash,
    codeCommit: null,
    createdAt: null,
    startedAt: null,
    completedAt: null,
    trainingPerformed: false,
    logs: [],
    checkpointIds: [ids.checkpoint],
    cancellationReason: null,
    truthBoundary:
      'Synthetic schema fixture only; no model, dataset, code revision, log, or training run exists.',
  },
  {
    schemaRef: 'packages/evals/schemas/checkpoint-record.schema.json',
    schemaVersion: 1,
    recordType: 'checkpoint-record',
    id: ids.checkpoint,
    recordStatus: 'fixture-only-not-evidence',
    fixtureOnly: true,
    recordHash: '',
    previousRecordHash: null,
    trainingRunId: ids.run,
    modelClass: 'seed',
    architectureId: 'unselected-fixture-architecture',
    tokenizerId: 'unselected-fixture-tokenizer',
    datasetManifestId: ids.dataset,
    dependencyLockHash: null,
    containerImageDigest: null,
    hardwareProfile: 'not-selected-fixture',
    runtimeVersion: 'not-executed-fixture',
    verificationStatus: 'not-run',
    safetyReviewStatus: 'not-reviewed',
    privacyReviewStatus: 'not-reviewed',
    modelCard: {
      id: ids.modelCard,
      contentHash: modelCardHash,
      status: 'fixture-only-not-evidence',
    },
    step: 0,
    artifactExists: false,
    artifactUri: null,
    artifactHash: null,
    parentCheckpointId: null,
    createdAt: null,
    evaluationReportIds: [ids.evaluation],
    published: false,
    routeEligible: false,
    truthBoundary:
      'Synthetic schema fixture only; no checkpoint artifact, model weights, publication, or route exists.',
  },
  {
    schemaRef: 'packages/evals/schemas/model-evaluation-report.schema.json',
    schemaVersion: 1,
    recordType: 'evaluation-report',
    id: ids.evaluation,
    recordStatus: 'fixture-only-not-evidence',
    fixtureOnly: true,
    recordHash: '',
    previousRecordHash: null,
    trainingRunId: ids.run,
    checkpointId: ids.checkpoint,
    benchmarkExecuted: false,
    codeCommit: null,
    configHash,
    randomSeeds: [0],
    hardwareProfile: 'not-selected-fixture',
    runtimeVersion: 'not-executed-fixture',
    datasetManifestIds: [ids.dataset],
    metrics: [],
    safetyCriticalFailureCount: 0,
    contaminationStatus: 'not-run',
    independentReviewStatus: 'not-reviewed',
    reportUri: null,
    reportHash: null,
    rawOutputUri: null,
    rawOutputHash: null,
    createdAt: null,
    truthBoundary:
      'Synthetic schema fixture only; no benchmark, metric, safety evaluation, or independent review was run.',
  },
  {
    schemaRef: 'packages/evals/schemas/model-release-decision.schema.json',
    schemaVersion: 2,
    recordType: 'release-decision',
    id: ids.release,
    recordStatus: 'fixture-only-not-evidence',
    fixtureOnly: true,
    recordHash: '',
    previousRecordHash: null,
    subjectType: 'checkpoint',
    subjectId: ids.checkpoint,
    decision: 'deny',
    datasetManifestIds: [ids.dataset],
    computeApprovalId: ids.compute,
    trainingRunId: ids.run,
    checkpointIds: [ids.checkpoint],
    evaluationReportIds: [ids.evaluation],
    modelCard: {
      id: ids.modelCard,
      contentHash: modelCardHash,
      status: 'fixture-only-not-evidence',
    },
    datasetCards: [
      {
        id: ids.datasetCard,
        datasetManifestId: ids.dataset,
        contentHash: datasetCardHash,
        status: 'fixture-only-not-evidence',
      },
    ],
    allRequiredEvidenceAccepted: false,
    humanApprovalId: null,
    approvalAttestation: {
      verificationStatus: 'not-verified',
      attestationId: null,
      profile: null,
      trustDomain: null,
      audience: null,
      policyVersion: null,
      approvedAt: null,
      keyId: null,
      algorithm: null,
      payloadDigest: null,
      signature: null,
      verifiedAt: null,
      verifierId: null,
    },
    published: false,
    routeEligible: false,
    reasons: ['Synthetic fixture cannot authorize release or routing.'],
    createdAt: null,
    truthBoundary:
      'Synthetic schema fixture only; no release, publication, route promotion, model ownership, or AGI claim is allowed.',
  },
];

for (let index = 0; index < records.length; index += 1) {
  records[index].previousRecordHash = index === 0 ? null : records[index - 1].recordHash;
  records[index].recordHash = computeEvidenceRecordHash(records[index]);
}

const filenames = [
  '01-dataset-manifest.json',
  '02-compute-approval.json',
  '03-training-run.json',
  '04-checkpoint-record.json',
  '05-evaluation-report.json',
  '06-release-decision.json',
];
for (const [index, record] of records.entries()) {
  await writeJson(path.join(validDir, filenames[index]), record);
}

const invalidCases = [
  invalidCase(
    'dataset-unknown-property',
    0,
    record => {
      record.unexpectedField = true;
    },
    ['additional properties'],
  ),
  invalidCase(
    'dataset-ready-without-review',
    0,
    record => {
      record.datasetReady = true;
    },
    ['ready dataset must be accepted'],
  ),
  invalidCase(
    'compute-approval-state-mismatch',
    1,
    record => {
      record.approved = true;
    },
    ['must match approved state'],
  ),
  invalidCase(
    'training-run-without-evidence',
    2,
    record => {
      record.fixtureOnly = false;
      record.recordStatus = 'completed';
      record.trainingPerformed = true;
    },
    ['performed training requires', 'completed run requires'],
  ),
  invalidCase(
    'checkpoint-missing-artifact-hash',
    3,
    record => {
      record.fixtureOnly = false;
      record.recordStatus = 'accepted';
      record.artifactExists = true;
    },
    ['existing checkpoint requires'],
  ),
  invalidCase(
    'evaluation-missing-report',
    4,
    record => {
      record.fixtureOnly = false;
      record.recordStatus = 'completed';
      record.benchmarkExecuted = true;
    },
    ['executed benchmark requires'],
  ),
  invalidCase(
    'release-allow-without-approval',
    5,
    record => {
      record.fixtureOnly = false;
      record.recordStatus = 'accepted';
      record.decision = 'allow';
    },
    ['allow requires accepted evidence'],
  ),
  {
    id: 'tampered-record-hash',
    recordType: records[2].recordType,
    record: { ...records[2], recordHash: `sha256:${'f'.repeat(64)}` },
    expectedErrorIncludes: ['does not match canonical record content'],
  },
];

await writeJson(path.join(invalidDir, 'invalid-cases.json'), {
  id: 'seis-training-evidence-invalid-cases',
  status: 'synthetic-test-fixtures-not-evidence',
  cases: invalidCases,
});

console.log(
  `SEIS synthetic training evidence fixtures generated: ${records.length} valid, ${invalidCases.length} invalid`,
);

function invalidCase(id, recordIndex, mutate, expectedErrorIncludes) {
  const record = structuredClone(records[recordIndex]);
  mutate(record);
  record.recordHash = computeEvidenceRecordHash(record);
  return {
    id,
    recordType: record.recordType,
    record,
    expectedErrorIncludes,
  };
}

async function writeJson(filePath, value) {
  const output = await format(JSON.stringify(value), {
    parser: 'json',
    printWidth: 100,
    tabWidth: 2,
    endOfLine: 'lf',
  });
  writeFileSync(filePath, output, 'utf8');
}

function fixtureContentHash(label) {
  return `sha256:${createHash('sha256').update(label).digest('hex')}`;
}
