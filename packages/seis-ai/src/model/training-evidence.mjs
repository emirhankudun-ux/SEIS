import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';

import { assertNoCredentialLikeJsonContent } from '../lib/credential-safety.mjs';
import { resolveInside } from '../lib/repo.mjs';
import { assertValidJsonSchema, validateJsonSchema } from './json-schema-validation.mjs';

export const TRAINING_EVIDENCE_CHAIN_PATH =
  'content/development/seis-model-training-evidence-chain.json';
export const TRAINING_EVIDENCE_RESOURCE_URI = 'seis://ai/model-training-evidence-chain.json';
export const TRAINING_EVIDENCE_STATUS_TOOL = 'seis_ai_core_training_evidence_status';
export const TRAINING_EVIDENCE_CARD_TEMPLATE_PATHS = Object.freeze({
  modelCard: 'content/development/seis-20b-model-card-template.json',
  datasetCard: 'content/development/seis-20b-dataset-card-template.json',
});

export const TRAINING_EVIDENCE_SCHEMA_PATHS = Object.freeze({
  'dataset-manifest': 'packages/data/schemas/model-dataset-manifest.schema.json',
  'compute-approval': 'packages/shared-types/schemas/model-compute-approval.schema.json',
  'training-run': 'packages/evals/schemas/model-training-run.schema.json',
  'checkpoint-record': 'packages/evals/schemas/checkpoint-record.schema.json',
  'evaluation-report': 'packages/evals/schemas/model-evaluation-report.schema.json',
  'release-decision': 'packages/evals/schemas/model-release-decision.schema.json',
});

const RECORD_ORDER = [
  'dataset-manifest',
  'compute-approval',
  'training-run',
  'checkpoint-record',
  'evaluation-report',
  'release-decision',
];

const ZERO_EVIDENCE_FIELDS = [
  'datasetManifests',
  'computeApprovals',
  'trainingRuns',
  'checkpoints',
  'evaluationReports',
  'releaseApprovals',
];
const MAX_EVIDENCE_JSON_BYTES = 2 * 1024 * 1024;

export function readTrainingEvidenceChain(repoRoot) {
  return readJsonInside(repoRoot, TRAINING_EVIDENCE_CHAIN_PATH, 'SEIS training evidence chain');
}

export function loadTrainingEvidenceSchemas(repoRoot) {
  return Object.fromEntries(
    Object.entries(TRAINING_EVIDENCE_SCHEMA_PATHS).map(([recordType, relativePath]) => [
      recordType,
      readJsonInside(repoRoot, relativePath, `${recordType} schema`),
    ]),
  );
}

export function computeEvidenceRecordHash(record) {
  const canonical = { ...record };
  delete canonical.recordHash;
  const digest = createHash('sha256').update(stableStringify(canonical)).digest('hex');
  return `sha256:${digest}`;
}

export function validateEvidenceRecord(record, schema) {
  const errors = validateJsonSchema(schema, record);
  if (!record || typeof record !== 'object' || Array.isArray(record)) return errors;

  if (record.recordHash !== computeEvidenceRecordHash(record)) {
    errors.push('$.recordHash: does not match canonical record content');
  }

  switch (record.recordType) {
    case 'dataset-manifest':
      validateDatasetManifest(record, errors);
      break;
    case 'compute-approval':
      validateComputeApproval(record, errors);
      break;
    case 'training-run':
      validateTrainingRun(record, errors);
      break;
    case 'checkpoint-record':
      validateCheckpoint(record, errors);
      break;
    case 'evaluation-report':
      validateEvaluation(record, errors);
      break;
    case 'release-decision':
      validateReleaseDecision(record, errors);
      break;
    default:
      errors.push('$.recordType: unsupported training evidence record type');
  }
  return errors;
}

export function validateTrainingEvidenceChain(records, schemas, options = {}) {
  const errors = [];
  if (!Array.isArray(records)) return { ok: false, errors: ['records must be an array'] };
  if (records.length !== RECORD_ORDER.length) {
    errors.push(`records: expected ${RECORD_ORDER.length} fixture records`);
  }

  const ids = new Set();
  records.forEach((record, index) => {
    const expectedType = RECORD_ORDER[index];
    if (record?.recordType !== expectedType) {
      errors.push(`records[${index}]: expected recordType ${expectedType}`);
    }
    if (ids.has(record?.id)) errors.push(`records[${index}]: duplicate id ${record?.id}`);
    ids.add(record?.id);

    const schema = schemas?.[record?.recordType];
    if (!schema) {
      errors.push(`records[${index}]: schema missing for ${record?.recordType}`);
    } else {
      for (const error of validateEvidenceRecord(record, schema)) {
        errors.push(`records[${index}] ${error}`);
      }
    }

    const expectedPrevious = index === 0 ? null : records[index - 1]?.recordHash;
    if (record?.previousRecordHash !== expectedPrevious) {
      errors.push(`records[${index}]: previousRecordHash mismatch`);
    }
  });

  const byType = Object.fromEntries(records.map(record => [record.recordType, record]));
  validateReferences(byType, errors, options);

  return {
    ok: errors.length === 0,
    errors,
    recordCount: records.length,
    chainHead: records.at(-1)?.recordHash || null,
  };
}

export function validateInvalidEvidenceCases(cases, schemas) {
  const failures = [];
  for (const testCase of Array.isArray(cases) ? cases : []) {
    const schema = schemas?.[testCase.recordType];
    const errors = schema
      ? validateEvidenceRecord(testCase.record, schema)
      : [`schema missing for ${testCase.recordType}`];
    if (errors.length === 0) {
      failures.push(`${testCase.id}: invalid record unexpectedly passed`);
      continue;
    }
    for (const expected of testCase.expectedErrorIncludes || []) {
      if (!errors.some(error => error.includes(expected))) {
        failures.push(`${testCase.id}: missing expected error ${expected}`);
      }
    }
  }
  return {
    ok: failures.length === 0,
    failures,
    caseCount: Array.isArray(cases) ? cases.length : 0,
  };
}

export function trainingEvidenceStatus(repoRoot, options = {}) {
  try {
    const contract = readTrainingEvidenceChain(repoRoot);
    const schemas = loadTrainingEvidenceSchemas(repoRoot);
    const issues = validateEvidenceContract(contract, schemas, repoRoot);

    const validRecords = contract.fixtures.validRecords.map(relativePath =>
      readJsonInside(repoRoot, relativePath, 'SEIS training evidence valid fixture'),
    );
    const invalidCases = readJsonInside(
      repoRoot,
      contract.fixtures.invalidCases,
      'SEIS training evidence invalid fixture cases',
    );
    const validFixtureResult = validateTrainingEvidenceChain(validRecords, schemas, {
      trustRoot: contract.trustRoot,
    });
    const invalidFixtureResult = validateInvalidEvidenceCases(invalidCases.cases, schemas);
    if (!validFixtureResult.ok) issues.push(...validFixtureResult.errors);
    if (!invalidFixtureResult.ok) issues.push(...invalidFixtureResult.failures);

    if (issues.length > 0)
      throw new Error(`training evidence contract failed closed: ${issues.join('; ')}`);

    const payload = {
      ok: true,
      tool: TRAINING_EVIDENCE_STATUS_TOOL,
      id: contract.id,
      version: contract.version,
      status: contract.status,
      resourceUri: contract.resourceUri,
      qualityGate: contract.qualityGate,
      schemaCount: Object.keys(schemas).length,
      schemaPaths: contract.schemas,
      cardTemplatePaths: contract.cardTemplates,
      trustRoot: contract.trustRoot,
      evidenceCounts: contract.evidenceCounts,
      currentEvidenceRecordCount: countCurrentEvidence(contract.currentEvidence),
      releaseDecision: contract.releasePolicy.defaultDecision,
      failClosed: contract.releasePolicy.failClosed === true,
      routeEligibleToday: false,
      runtimeAuthority: false,
      trainingAuthorized: false,
      fixtureValidation: {
        validRecordCount: validFixtureResult?.recordCount ?? null,
        validChainHead: validFixtureResult?.chainHead ?? null,
        invalidCaseCount: invalidFixtureResult?.caseCount ?? null,
        allValidFixturesPassed: validFixtureResult?.ok ?? null,
        allInvalidFixturesRejected: invalidFixtureResult?.ok ?? null,
      },
      executionEvidence: deniedExecutionEvidence(),
      humanApprovalRequiredFor: contract.humanApprovalRequiredFor,
      nextSafeActions: contract.nextSafeActions,
    };
    if (options.includeContract === true) payload.contract = contract;
    return payload;
  } catch (error) {
    return {
      ok: false,
      tool: TRAINING_EVIDENCE_STATUS_TOOL,
      status: 'invalid-fail-closed',
      releaseDecision: 'deny',
      failClosed: true,
      routeEligibleToday: false,
      runtimeAuthority: false,
      trainingAuthorized: false,
      executionEvidence: deniedExecutionEvidence(),
      error: error.message,
    };
  }
}

function validateEvidenceContract(contract, schemas, repoRoot) {
  const issues = [];
  if (contract.id !== 'seis-model-training-evidence-chain') issues.push('contract id mismatch');
  if (contract.status !== 'schema-foundation-no-execution') issues.push('contract status mismatch');
  if (contract.resourceUri !== TRAINING_EVIDENCE_RESOURCE_URI) issues.push('resource URI mismatch');
  if (contract.releasePolicy?.defaultDecision !== 'deny')
    issues.push('default release decision must deny');
  if (contract.releasePolicy?.failClosed !== true) issues.push('release policy must fail closed');
  if (contract.releasePolicy?.humanFinalApprovalRequired !== true) {
    issues.push('human final approval must be required');
  }
  if (
    contract.trustRoot?.status !== 'not-configured' ||
    contract.trustRoot?.attestationVerification !== 'not-implemented' ||
    contract.trustRoot?.releaseAllowWithoutVerifiedAttestation !== false ||
    !Array.isArray(contract.trustRoot?.trustedApprovalKeyIds) ||
    contract.trustRoot.trustedApprovalKeyIds.length !== 0
  ) {
    issues.push('external approval trust root must remain unconfigured and fail closed');
  }

  for (const [recordType, expectedPath] of Object.entries(TRAINING_EVIDENCE_SCHEMA_PATHS)) {
    if (contract.schemas?.[recordType] !== expectedPath)
      issues.push(`${recordType} schema path mismatch`);
    const schema = schemas?.[recordType];
    try {
      assertValidJsonSchema(schema);
    } catch (error) {
      issues.push(`${recordType} schema compilation failed: ${error.message}`);
    }
    if (schema?.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
      issues.push(`${recordType} schema must use draft 2020-12`);
    }
    if (schema?.additionalProperties !== false) {
      issues.push(`${recordType} schema must reject unknown top-level fields`);
    }
  }

  const expectedCardIds = {
    modelCard: 'model-card:seis-20b-template:v1',
    datasetCard: 'dataset-card:seis-20b-template:v1',
  };
  for (const [cardType, expectedPath] of Object.entries(TRAINING_EVIDENCE_CARD_TEMPLATE_PATHS)) {
    if (contract.cardTemplates?.[cardType] !== expectedPath) {
      issues.push(`${cardType} template path mismatch`);
      continue;
    }
    try {
      const card = readJsonInside(repoRoot, expectedPath, `${cardType} template`);
      if (card.immutableIdentity?.id !== expectedCardIds[cardType]) {
        issues.push(`${cardType} immutable identity mismatch`);
      }
      if (card.immutableIdentity?.contentHash !== null) {
        issues.push(`${cardType} template content hash must remain null before review`);
      }
      if (card.immutableIdentity?.status !== 'template-not-filled') {
        issues.push(`${cardType} template status must remain template-not-filled`);
      }
    } catch (error) {
      issues.push(`${cardType} template validation failed: ${error.message}`);
    }
  }

  for (const field of ZERO_EVIDENCE_FIELDS) {
    if (contract.evidenceCounts?.[field] !== 0)
      issues.push(`${field} evidence count must remain zero`);
    if (
      !Array.isArray(contract.currentEvidence?.[field]) ||
      contract.currentEvidence[field].length !== 0
    ) {
      issues.push(`${field} current evidence must remain empty`);
    }
  }
  if (Object.values(contract.executionEvidence || {}).some(value => value !== false)) {
    issues.push('execution evidence flags must remain false');
  }
  if (
    !Array.isArray(contract.fixtures?.validRecords) ||
    contract.fixtures.validRecords.length !== 6
  ) {
    issues.push('six valid fixture records are required');
  }
  if (typeof contract.fixtures?.invalidCases !== 'string')
    issues.push('invalid fixture path missing');
  return issues;
}

function validateDatasetManifest(record, errors) {
  if (record.sourceCount !== record.sources?.length)
    errors.push('$.sourceCount: must equal sources length');
  if (record.fixtureOnly) {
    requireFixtureStatus(record, errors);
    if (record.datasetReady) errors.push('$.datasetReady: fixture cannot be ready');
    if (record.datasetCard?.status !== 'fixture-only-not-evidence') {
      errors.push('$.datasetCard.status: fixture card must remain fixture-only-not-evidence');
    }
    if (record.provenanceStatus !== 'not-reviewed')
      errors.push('$.provenanceStatus: fixture must be not-reviewed');
    if (record.licenseStatus !== 'not-reviewed')
      errors.push('$.licenseStatus: fixture must be not-reviewed');
    if (record.sourceCount !== 0) errors.push('$.sourceCount: fixture must be zero');
    if (record.contaminationReview?.status !== 'not-run') {
      errors.push('$.contaminationReview.status: fixture must be not-run');
    }
    if (record.humanApproval?.status !== 'missing') {
      errors.push('$.humanApproval.status: fixture approval must be missing');
    }
  }
  if (record.datasetReady) {
    if (record.datasetCard?.status !== 'accepted' || !record.datasetCard?.contentHash) {
      errors.push('$.datasetCard: ready dataset requires an accepted immutable dataset card');
    }
    if (record.provenanceStatus !== 'accepted')
      errors.push('$.provenanceStatus: ready dataset must be accepted');
    if (record.licenseStatus !== 'accepted')
      errors.push('$.licenseStatus: ready dataset license must be accepted');
    if (record.containsPrivateData)
      errors.push('$.containsPrivateData: ready dataset cannot contain private data');
    if (record.contaminationReview?.status !== 'passed') {
      errors.push('$.contaminationReview.status: ready dataset requires passed review');
    }
    if (record.humanApproval?.status !== 'accepted') {
      errors.push('$.humanApproval.status: ready dataset requires accepted approval');
    }
    if (!record.humanApproval?.approvalId) {
      errors.push('$.humanApproval.approvalId: ready dataset requires an approval id');
    }
    if (
      record.sourceCount < 1 ||
      !record.sources?.every(
        source =>
          source.approvedForTraining === true &&
          Boolean(source.sha256) &&
          source.accessClass !== 'prohibited',
      )
    ) {
      errors.push('$.sources: ready dataset requires hashed approved sources');
    }
    if (
      record.splits?.train?.sampleCount < 1 ||
      !record.splits?.train?.manifestSha256 ||
      !record.splits?.dev?.manifestSha256 ||
      !record.splits?.test?.manifestSha256
    ) {
      errors.push(
        '$.splits: ready dataset requires non-empty train data and immutable split manifests',
      );
    }
    if (!record.contaminationReview?.reportPath || !record.contaminationReview?.reviewedAt) {
      errors.push('$.contaminationReview: ready dataset requires a dated report');
    }
  }
}

function validateComputeApproval(record, errors) {
  if (record.approved !== record.executionAllowed) {
    errors.push('$.executionAllowed: must match approved state');
  }
  if (record.costStop?.hardLimitUsd > record.scope?.maxBudgetUsd) {
    errors.push('$.costStop.hardLimitUsd: cannot exceed approved budget');
  }
  if (record.fixtureOnly) {
    requireFixtureStatus(record, errors);
    if (record.approved || record.executionAllowed)
      errors.push('$.approved: fixture cannot authorize compute');
    if (record.approvalId !== null) errors.push('$.approvalId: fixture approval must be null');
  }
  if (record.approved) {
    if (record.recordStatus !== 'accepted')
      errors.push('$.recordStatus: approved compute must be accepted');
    if (!record.approvalId || !record.approverRole)
      errors.push('$.approvalId: approved compute requires human approval');
    if (record.costStop?.enabled !== true)
      errors.push('$.costStop.enabled: approved compute requires cost stop');
    if (
      !record.scope?.provider ||
      !record.scope?.hardwareClass ||
      !record.scope?.region ||
      record.scope?.maxBudgetUsd <= 0 ||
      record.scope?.maxGpuHours <= 0 ||
      !record.expiresAt
    ) {
      errors.push(
        '$.scope: approved compute requires provider, hardware, region, positive limits, and expiry',
      );
    }
  }
}

function validateTrainingRun(record, errors) {
  if (record.fixtureOnly) {
    requireFixtureStatus(record, errors);
    if (record.trainingPerformed)
      errors.push('$.trainingPerformed: fixture cannot perform training');
    if (record.startedAt !== null || record.completedAt !== null) {
      errors.push('$.startedAt: fixture timestamps must be null');
    }
    if (record.logs?.length !== 0 || record.checkpointIds?.length !== 0) {
      errors.push('$.logs: fixture cannot claim logs or checkpoints');
    }
    if (record.codeCommit !== null || record.baseModel?.artifactHash !== null) {
      errors.push('$.baseModel: fixture cannot claim code or base-model artifact evidence');
    }
  }
  if (record.trainingPerformed) {
    if (!record.startedAt || !record.codeCommit)
      errors.push('$.startedAt: performed training requires timestamps and code commit');
    if (!record.logs?.length) errors.push('$.logs: performed training requires logs');
  }
  if (record.recordStatus === 'completed') {
    if (!record.trainingPerformed || !record.completedAt || !record.checkpointIds?.length) {
      errors.push(
        '$.recordStatus: completed run requires execution, completion time, and checkpoint',
      );
    }
  }
}

function validateCheckpoint(record, errors) {
  if (record.fixtureOnly) {
    requireFixtureStatus(record, errors);
    if (
      record.artifactExists ||
      record.artifactUri !== null ||
      record.artifactHash !== null ||
      record.dependencyLockHash !== null ||
      record.containerImageDigest !== null ||
      record.createdAt !== null ||
      record.published ||
      record.routeEligible
    ) {
      errors.push('$.artifactExists: fixture cannot claim checkpoint artifact or route state');
    }
    if (
      record.verificationStatus !== 'not-run' ||
      record.safetyReviewStatus !== 'not-reviewed' ||
      record.privacyReviewStatus !== 'not-reviewed' ||
      record.modelCard?.status !== 'fixture-only-not-evidence'
    ) {
      errors.push(
        '$.verificationStatus: fixture verification, safety, privacy, and model card must remain unaccepted',
      );
    }
  }
  if (
    record.artifactExists &&
    (!record.artifactUri ||
      !record.artifactHash ||
      !record.createdAt ||
      !record.dependencyLockHash ||
      !record.containerImageDigest ||
      String(record.architectureId || '').startsWith('unselected-') ||
      String(record.tokenizerId || '').startsWith('unselected-') ||
      String(record.hardwareProfile || '').startsWith('not-selected') ||
      String(record.runtimeVersion || '').startsWith('not-executed') ||
      record.verificationStatus !== 'passed' ||
      record.safetyReviewStatus !== 'accepted' ||
      record.privacyReviewStatus !== 'accepted' ||
      record.modelCard?.status !== 'accepted' ||
      !record.modelCard?.contentHash)
  ) {
    errors.push(
      '$.artifactHash: existing checkpoint requires artifact, lock, container, verification, safety, privacy, and model-card evidence',
    );
  }
  if (record.routeEligible && (!record.artifactExists || record.recordStatus !== 'accepted')) {
    errors.push('$.routeEligible: routeable checkpoint must exist and be accepted');
  }
}

function validateEvaluation(record, errors) {
  if (record.fixtureOnly) {
    requireFixtureStatus(record, errors);
    if (
      record.benchmarkExecuted ||
      record.metrics?.length !== 0 ||
      record.codeCommit !== null ||
      record.reportUri !== null ||
      record.reportHash !== null ||
      record.rawOutputUri !== null ||
      record.rawOutputHash !== null ||
      record.createdAt !== null
    ) {
      errors.push('$.benchmarkExecuted: fixture cannot claim evaluation execution or report');
    }
    if (
      record.contaminationStatus !== 'not-run' ||
      record.independentReviewStatus !== 'not-reviewed'
    ) {
      errors.push('$.contaminationStatus: fixture reviews must remain not-run/not-reviewed');
    }
  }
  if (
    record.benchmarkExecuted &&
    (!record.codeCommit ||
      !record.reportUri ||
      !record.reportHash ||
      !record.rawOutputUri ||
      !record.rawOutputHash ||
      !record.createdAt ||
      !record.metrics?.length ||
      String(record.hardwareProfile || '').startsWith('not-selected') ||
      String(record.runtimeVersion || '').startsWith('not-executed'))
  ) {
    errors.push(
      '$.reportHash: executed benchmark requires code, report, raw output, hashes, and timestamp',
    );
  }
  if (record.recordStatus === 'completed' && !record.benchmarkExecuted) {
    errors.push('$.recordStatus: completed evaluation requires benchmark execution');
  }
}

function validateReleaseDecision(record, errors) {
  if (record.fixtureOnly) {
    requireFixtureStatus(record, errors);
    if (
      record.decision !== 'deny' ||
      record.allRequiredEvidenceAccepted ||
      record.humanApprovalId !== null ||
      record.approvalAttestation?.verificationStatus !== 'not-verified' ||
      record.published ||
      record.routeEligible
    ) {
      errors.push('$.decision: fixture release must remain denied and unpublished');
    }
    if (
      record.modelCard?.status !== 'fixture-only-not-evidence' ||
      !record.datasetCards?.every(card => card.status === 'fixture-only-not-evidence')
    ) {
      errors.push('$.modelCard: fixture cards must remain fixture-only-not-evidence');
    }
    if (
      record.approvalAttestation?.keyId !== null ||
      record.approvalAttestation?.algorithm !== null ||
      record.approvalAttestation?.signature !== null ||
      record.approvalAttestation?.verifiedAt !== null ||
      record.approvalAttestation?.verifierId !== null
    ) {
      errors.push('$.approvalAttestation: fixture attestation fields must remain null');
    }
  }
  if (record.decision === 'allow') {
    if (
      !record.allRequiredEvidenceAccepted ||
      !record.humanApprovalId ||
      !record.evaluationReportIds?.length ||
      !record.checkpointIds?.length ||
      record.modelCard?.status !== 'accepted' ||
      !record.modelCard?.contentHash ||
      !record.datasetCards?.length ||
      !record.datasetCards.every(card => card.status === 'accepted' && card.contentHash) ||
      record.recordStatus !== 'accepted' ||
      !record.createdAt ||
      record.approvalAttestation?.verificationStatus !== 'verified' ||
      !record.approvalAttestation?.keyId ||
      !record.approvalAttestation?.algorithm ||
      !record.approvalAttestation?.signature ||
      !record.approvalAttestation?.verifiedAt ||
      !record.approvalAttestation?.verifierId
    ) {
      errors.push(
        '$.decision: allow requires accepted evidence, immutable cards, and human approval',
      );
    }
  }
  if (record.routeEligible && (record.decision !== 'allow' || !record.published)) {
    errors.push('$.routeEligible: route eligibility requires allowed published release');
  }
}

function validateReferences(byType, errors, options = {}) {
  const trustRoot = options.trustRoot;
  const dataset = byType['dataset-manifest'];
  const compute = byType['compute-approval'];
  const run = byType['training-run'];
  const checkpoint = byType['checkpoint-record'];
  const evaluation = byType['evaluation-report'];
  const release = byType['release-decision'];
  if (run?.datasetManifestId !== dataset?.id)
    errors.push('training run dataset reference mismatch');
  if (run?.computeApprovalId !== compute?.id)
    errors.push('training run compute reference mismatch');
  if (checkpoint?.trainingRunId !== run?.id) errors.push('checkpoint run reference mismatch');
  if (checkpoint?.datasetManifestId !== dataset?.id)
    errors.push('checkpoint dataset reference mismatch');
  if (evaluation?.trainingRunId !== run?.id) errors.push('evaluation run reference mismatch');
  if (evaluation?.checkpointId !== checkpoint?.id)
    errors.push('evaluation checkpoint reference mismatch');
  if (!evaluation?.datasetManifestIds?.includes(dataset?.id))
    errors.push('evaluation dataset reference mismatch');
  if (!release?.datasetManifestIds?.includes(dataset?.id))
    errors.push('release dataset reference mismatch');
  if (release?.computeApprovalId !== compute?.id) errors.push('release compute reference mismatch');
  if (release?.trainingRunId !== run?.id) errors.push('release run reference mismatch');
  if (!release?.checkpointIds?.includes(checkpoint?.id))
    errors.push('release checkpoint reference mismatch');
  if (!release?.evaluationReportIds?.includes(evaluation?.id))
    errors.push('release evaluation reference mismatch');
  if (
    release?.modelCard?.id !== checkpoint?.modelCard?.id ||
    release?.modelCard?.contentHash !== checkpoint?.modelCard?.contentHash
  ) {
    errors.push('release model card reference mismatch');
  }
  const releaseDatasetCard = release?.datasetCards?.find(
    card => card.datasetManifestId === dataset?.id,
  );
  if (
    !releaseDatasetCard ||
    releaseDatasetCard.id !== dataset?.datasetCard?.id ||
    releaseDatasetCard.contentHash !== dataset?.datasetCard?.contentHash
  ) {
    errors.push('release dataset card reference mismatch');
  }
  if (release?.decision === 'allow') {
    const linkedEvidenceAccepted =
      dataset?.fixtureOnly === false &&
      dataset?.recordStatus === 'accepted' &&
      dataset?.datasetReady === true &&
      compute?.fixtureOnly === false &&
      compute?.recordStatus === 'accepted' &&
      compute?.approved === true &&
      compute?.executionAllowed === true &&
      run?.fixtureOnly === false &&
      run?.recordStatus === 'completed' &&
      run?.trainingPerformed === true &&
      checkpoint?.fixtureOnly === false &&
      checkpoint?.recordStatus === 'accepted' &&
      checkpoint?.artifactExists === true &&
      checkpoint?.verificationStatus === 'passed' &&
      checkpoint?.safetyReviewStatus === 'accepted' &&
      checkpoint?.privacyReviewStatus === 'accepted' &&
      evaluation?.fixtureOnly === false &&
      evaluation?.recordStatus === 'completed' &&
      evaluation?.benchmarkExecuted === true &&
      evaluation?.metrics?.length > 0 &&
      evaluation.metrics.every(metric => metric.passed === true) &&
      evaluation?.safetyCriticalFailureCount === 0 &&
      evaluation?.contaminationStatus === 'passed' &&
      evaluation?.independentReviewStatus === 'accepted';
    if (!linkedEvidenceAccepted) {
      errors.push('release allow requires accepted linked evidence');
    }
    if (
      trustRoot?.status !== 'configured' ||
      trustRoot?.attestationVerification !== 'implemented' ||
      !Array.isArray(trustRoot?.trustedApprovalKeyIds) ||
      trustRoot.trustedApprovalKeyIds.length === 0 ||
      release.approvalAttestation?.verificationStatus !== 'verified' ||
      !trustRoot.trustedApprovalKeyIds.includes(release.approvalAttestation?.keyId)
    ) {
      errors.push(
        'release allow requires a configured external trust root and verified attestation',
      );
    }
    let externalAttestationVerified = false;
    if (typeof options.verifyApprovalAttestation === 'function') {
      try {
        externalAttestationVerified =
          options.verifyApprovalAttestation({ release, trustRoot }) === true;
      } catch {
        externalAttestationVerified = false;
      }
    }
    if (!externalAttestationVerified) {
      errors.push('release allow requires a successful external attestation verifier');
    }
  }
}

function requireFixtureStatus(record, errors) {
  if (record.recordStatus !== 'fixture-only-not-evidence') {
    errors.push('$.recordStatus: fixture must be fixture-only-not-evidence');
  }
}

function countCurrentEvidence(currentEvidence) {
  return ZERO_EVIDENCE_FIELDS.reduce(
    (total, field) =>
      total + (Array.isArray(currentEvidence?.[field]) ? currentEvidence[field].length : 0),
    0,
  );
}

function deniedExecutionEvidence() {
  return {
    datasetDownloaded: false,
    modelDownloaded: false,
    providerAuthenticated: false,
    paidComputeProvisioned: false,
    trainingRunPerformed: false,
    checkpointCreated: false,
    benchmarkRunPerformed: false,
    releasePublished: false,
    routePromoted: false,
    githubMutated: false,
  };
}

function readJsonInside(repoRoot, relativePath, label) {
  const filePath = resolveInside(repoRoot, relativePath);
  if (!existsSync(filePath)) throw new Error(`${label} missing: ${relativePath}`);
  const fileStat = lstatSync(filePath);
  if (fileStat.isSymbolicLink()) throw new Error(`${label} must not be a symbolic link`);
  if (!fileStat.isFile()) throw new Error(`${label} must be a regular file`);
  if (fileStat.size > MAX_EVIDENCE_JSON_BYTES) {
    throw new Error(`${label} exceeds the ${MAX_EVIDENCE_JSON_BYTES} byte safety limit`);
  }
  const realRoot = realpathSync(repoRoot);
  const realFile = realpathSync(filePath);
  resolveInside(realRoot, realFile);
  const raw = readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  assertNoCredentialLikeJsonContent(raw, parsed, { label });
  return parsed;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(entry => stableStringify(entry)).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
