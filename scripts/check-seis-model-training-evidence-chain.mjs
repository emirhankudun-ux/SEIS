#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import {
  TRAINING_EVIDENCE_CARD_TEMPLATE_PATHS,
  TRAINING_EVIDENCE_CHAIN_PATH,
  TRAINING_EVIDENCE_RESOURCE_URI,
  TRAINING_EVIDENCE_SCHEMA_PATHS,
  TRAINING_EVIDENCE_STATUS_TOOL,
  trainingEvidenceStatus,
} from '../packages/seis-ai/src/model/training-evidence.mjs';

const root = process.cwd();
const failures = [];
const paths = {
  packageJson: 'package.json',
  aiPackageJson: 'packages/seis-ai/package.json',
  aiPackageLock: 'packages/seis-ai/package-lock.json',
  manifest: 'content/development/seis-agent-plugin-integration.json',
  launchPlan: 'content/development/seis-frontier-training-launch-plan.json',
  mcpContract: 'content/development/seis-ai-core-mcp-runtime-contract.json',
  schemaRegistry: 'content/development/seis-data-schema-registry.json',
  generator: 'scripts/create-seis-training-evidence-fixtures.mjs',
  validator: 'packages/seis-ai/src/model/training-evidence.mjs',
  agentTools: 'packages/seis-ai/src/agent/tools.mjs',
  agentLoop: 'packages/seis-ai/src/agent/loop.mjs',
  mcpServer: 'packages/seis-ai/src/mcp/server.mjs',
  tests: 'packages/seis-ai/test/training-evidence.test.mjs',
  docs: 'docs/ai/training-evidence-chain.md',
  docsIndex: 'docs/INDEX.md',
  gitignore: '.gitignore',
};

for (const relativePath of [
  TRAINING_EVIDENCE_CHAIN_PATH,
  ...Object.values(TRAINING_EVIDENCE_SCHEMA_PATHS),
  ...Object.values(TRAINING_EVIDENCE_CARD_TEMPLATE_PATHS),
  ...Object.values(paths),
]) {
  ensureFile(relativePath);
}

const status = trainingEvidenceStatus(root, {
  includeContract: true,
});
ensure(status.ok === true, `training evidence status failed closed: ${status.error || 'unknown'}`);
ensure(status.tool === TRAINING_EVIDENCE_STATUS_TOOL, 'training evidence tool id mismatch');
ensure(
  status.resourceUri === TRAINING_EVIDENCE_RESOURCE_URI,
  'training evidence resource URI mismatch',
);
ensure(status.schemaCount === 6, 'exactly six evidence schemas are required');
ensure(status.currentEvidenceRecordCount === 0, 'real evidence record count must remain zero');
ensure(status.releaseDecision === 'deny', 'default release decision must remain deny');
ensure(status.failClosed === true, 'release policy must remain fail closed');
ensure(status.trainingAuthorized === false, 'training must remain unauthorized');
ensure(status.routeEligibleToday === false, 'route eligibility must remain false');
ensure(status.runtimeAuthority === false, 'runtime authority must remain false');
ensure(
  status.trustRoot?.status === 'not-configured',
  'external trust root must remain unconfigured',
);
ensure(
  status.trustRoot?.releaseAllowWithoutVerifiedAttestation === false,
  'release allow must require verified external attestation',
);
ensure(
  status.fixtureValidation?.validRecordCount === 6,
  'six valid synthetic fixtures are required',
);
ensure(status.fixtureValidation?.invalidCaseCount === 8, 'eight invalid fixtures are required');
ensure(status.fixtureValidation?.allValidFixturesPassed === true, 'valid fixture chain must pass');
ensure(
  status.fixtureValidation?.allInvalidFixturesRejected === true,
  'invalid fixtures must be rejected',
);
ensure(
  Object.values(status.executionEvidence || {}).every(value => value === false),
  'execution evidence flags must remain false',
);

const contract = status.contract || {};
ensure(contract.status === 'schema-foundation-no-execution', 'contract status mismatch');
ensure(
  contract.trustRoot?.attestationVerification === 'not-implemented' &&
    contract.trustRoot?.trustedApprovalKeyIds?.length === 0,
  'trust-root verifier and trusted keys must remain unavailable in this foundation pass',
);
ensure(
  Object.values(contract.currentEvidence || {}).every(
    records => Array.isArray(records) && records.length === 0,
  ),
  'all currentEvidence arrays must remain empty',
);
ensure(
  contract.cardTemplates?.modelCard === TRAINING_EVIDENCE_CARD_TEMPLATE_PATHS.modelCard &&
    contract.cardTemplates?.datasetCard === TRAINING_EVIDENCE_CARD_TEMPLATE_PATHS.datasetCard,
  'card template paths must be bound into the evidence contract',
);
ensure(
  (contract.linkRules || []).some(rule => rule.includes('model-card')) &&
    (contract.linkRules || []).some(rule => rule.includes('dataset-card')),
  'evidence link rules must bind model and dataset cards',
);

const modelCard = readJson(TRAINING_EVIDENCE_CARD_TEMPLATE_PATHS.modelCard);
const datasetCard = readJson(TRAINING_EVIDENCE_CARD_TEMPLATE_PATHS.datasetCard);
for (const [card, expectedId, label] of [
  [modelCard, 'model-card:seis-20b-template:v1', 'model card'],
  [datasetCard, 'dataset-card:seis-20b-template:v1', 'dataset card'],
]) {
  ensure(card?.immutableIdentity?.id === expectedId, `${label} immutable id mismatch`);
  ensure(card?.immutableIdentity?.contentHash === null, `${label} template hash must remain null`);
  ensure(
    card?.immutableIdentity?.status === 'template-not-filled',
    `${label} template status must remain template-not-filled`,
  );
  ensure(
    card?.evidenceQualityGate === 'npm run check:seis-model-training-evidence-chain',
    `${label} must bind the evidence quality gate`,
  );
}

const packageJson = readJson(paths.packageJson);
const aiPackageJson = readJson(paths.aiPackageJson);
const aiPackageLock = readJson(paths.aiPackageLock);
ensure(aiPackageJson?.dependencies?.ajv, 'packages/seis-ai must directly own Ajv');
ensure(
  aiPackageJson?.dependencies?.['ajv-formats'],
  'packages/seis-ai must directly own ajv-formats',
);
ensure(aiPackageLock?.packages?.['']?.dependencies?.ajv, 'AI package lock must bind Ajv');
ensure(
  aiPackageLock?.packages?.['']?.dependencies?.['ajv-formats'],
  'AI package lock must bind ajv-formats',
);
ensure(
  packageJson?.scripts?.['check:seis-model-training-evidence-chain'] ===
    'node scripts/check-seis-model-training-evidence-chain.mjs',
  'root package must expose the evidence checker',
);
ensure(
  packageJson?.scripts?.['automation:seis-training-evidence-fixtures'] ===
    'node scripts/create-seis-training-evidence-fixtures.mjs',
  'root package must expose the deterministic fixture generator',
);
ensure(
  String(packageJson?.scripts?.['quality:governance'] || '').includes(
    'check:seis-model-training-evidence-chain',
  ),
  'quality:governance must include the evidence checker',
);

const manifest = readJson(paths.manifest);
ensure(
  manifest?.runtimeIntegration?.trainingEvidenceTool === TRAINING_EVIDENCE_STATUS_TOOL,
  'plugin manifest must expose the training evidence tool',
);
ensure(
  manifest?.runtimeIntegration?.mcpResources?.includes(TRAINING_EVIDENCE_RESOURCE_URI),
  'plugin manifest must expose the training evidence resource',
);
ensure(
  manifest?.qualityCommands?.includes('npm run check:seis-model-training-evidence-chain'),
  'plugin manifest must include the evidence quality command',
);

const launchPlan = readJson(paths.launchPlan);
ensure(
  Object.values(launchPlan?.sourceOfTruth || {}).includes(TRAINING_EVIDENCE_CHAIN_PATH),
  'frontier launch plan must link the training evidence contract',
);
ensure(launchPlan?.trainingAuthorized === false, 'frontier launch plan must remain unauthorized');

const mcpContract = readJson(paths.mcpContract);
ensure(mcpContract?.toolCount === 37, 'MCP contract must record 37 tools');
ensure(mcpContract?.resourceCount === 32, 'MCP contract must record 32 resources');
ensure(
  mcpContract?.surfaces?.find(surface => surface.id === 'tools')?.count === 37,
  'MCP tool surface count must be 37',
);
ensure(
  mcpContract?.surfaces?.find(surface => surface.id === 'resources')?.count === 32,
  'MCP resource surface count must be 32',
);

const schemaRegistry = readJson(paths.schemaRegistry);
const registeredPaths = new Set((schemaRegistry?.records || []).map(record => record.path));
for (const schemaPath of Object.values(TRAINING_EVIDENCE_SCHEMA_PATHS)) {
  ensure(registeredPaths.has(schemaPath), `data schema registry missing ${schemaPath}`);
}

const sourceChecks = [
  [paths.generator, 'fixture-only-not-evidence'],
  [paths.validator, 'invalid-fail-closed'],
  [paths.agentTools, 'TRAINING_EVIDENCE_STATUS_TOOL'],
  [paths.agentLoop, TRAINING_EVIDENCE_STATUS_TOOL],
  [paths.mcpServer, 'TRAINING_EVIDENCE_RESOURCE_URI'],
  [paths.tests, 'allInvalidFixturesRejected'],
  [paths.docs, TRAINING_EVIDENCE_RESOURCE_URI],
  [paths.docsIndex, 'ai/training-evidence-chain.md'],
];
for (const [relativePath, marker] of sourceChecks) {
  ensure(readText(relativePath).includes(marker), `${relativePath} missing ${marker}`);
}

const gitignore = readText(paths.gitignore);
for (const trackedJsonPath of [
  ...Object.values(TRAINING_EVIDENCE_SCHEMA_PATHS),
  ...contract.fixtures.validRecords,
  contract.fixtures.invalidCases,
]) {
  ensure(
    gitignore.includes(`!${trackedJsonPath}`),
    `.gitignore missing targeted exception ${trackedJsonPath}`,
  );
}

finish();

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath) {
  const filePath = path.join(root, relativePath || '');
  ensure(
    Boolean(relativePath) && fs.existsSync(filePath) && fs.statSync(filePath).isFile(),
    `missing file: ${relativePath}`,
  );
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
  } catch (error) {
    failures.push(`invalid JSON ${relativePath}: ${error.message}`);
    return null;
  }
}

function readText(relativePath) {
  try {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
  } catch (error) {
    failures.push(`unreadable file ${relativePath}: ${error.message}`);
    return '';
  }
}

function finish() {
  if (failures.length > 0) {
    console.error('SEIS model training evidence chain check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(
    'SEIS model training evidence chain check passed: 6 schemas, 6 valid fixtures, 8 invalid fixtures, 0 real evidence records, release denied.',
  );
}
