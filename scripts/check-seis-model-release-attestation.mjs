#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import {
  MODEL_RELEASE_TRUST_ROOT_PATH,
  MODEL_RELEASE_TRUST_ROOT_SCHEMA_PATH,
  RELEASE_ATTESTATION_ALGORITHM,
  RELEASE_ATTESTATION_AUDIENCE,
  RELEASE_ATTESTATION_POLICY_VERSION,
  RELEASE_ATTESTATION_PROFILE,
  RELEASE_ATTESTATION_TRUST_DOMAIN,
  RELEASE_ATTESTATION_VERIFIER_ID,
  deriveEd25519JwkThumbprint,
  readModelReleaseTrustRoot,
} from '../packages/seis-ai/src/model/release-attestation.mjs';

const root = process.cwd();
const failures = [];
const paths = {
  packageJson: 'package.json',
  contract: 'content/development/seis-model-training-evidence-chain.json',
  registry: 'content/development/seis-data-schema-registry.json',
  releaseSchema: 'packages/evals/schemas/model-release-decision.schema.json',
  verifier: 'packages/seis-ai/src/model/release-attestation.mjs',
  tests: 'packages/seis-ai/test/release-attestation.test.mjs',
  docs: 'docs/ai/release-attestation.md',
  adr: 'docs/decisions/adr-0005-model-release-attestation.md',
  gitignore: '.gitignore',
};

for (const relativePath of [
  MODEL_RELEASE_TRUST_ROOT_PATH,
  MODEL_RELEASE_TRUST_ROOT_SCHEMA_PATH,
  ...Object.values(paths),
]) {
  ensureFile(relativePath);
}

let trustRoot = null;
try {
  trustRoot = readModelReleaseTrustRoot(root);
} catch (error) {
  failures.push(error.message);
}

ensure(trustRoot?.status === 'not-configured', 'default trust root must remain not-configured');
ensure(
  trustRoot?.attestationVerification === 'implemented',
  'Ed25519 attestation verifier must be implemented',
);
ensure(trustRoot?.signatureProfile === RELEASE_ATTESTATION_PROFILE, 'signature profile mismatch');
ensure(
  trustRoot?.signatureAlgorithm === RELEASE_ATTESTATION_ALGORITHM,
  'signature algorithm must be Ed25519 only',
);
ensure(
  Array.isArray(trustRoot?.trustedApprovalKeys) && trustRoot.trustedApprovalKeys.length === 0,
  'default trust root must contain zero approval keys',
);
ensure(trustRoot?.runtimeAuthority === false, 'trust root must not grant runtime authority');
ensure(
  trustRoot?.trustDomain === RELEASE_ATTESTATION_TRUST_DOMAIN &&
    trustRoot?.audience === RELEASE_ATTESTATION_AUDIENCE &&
    trustRoot?.policyVersion === RELEASE_ATTESTATION_POLICY_VERSION,
  'trust domain, audience, or policy version mismatch',
);
ensure(
  trustRoot?.provenance?.source === 'repository-default',
  'repository trust root must remain an empty repository-default',
);
ensure(
  trustRoot?.releaseAllowWithoutVerifiedAttestation === false,
  'release without verified attestation must remain forbidden',
);

ensure(
  deriveEd25519JwkThumbprint({
    kty: 'OKP',
    crv: 'Ed25519',
    x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo',
  }) === 'jkt-sha256:kPrK_qmxVWaYVA9wwBF6Iuo3vVzz7TxHCTwXBygrS4k',
  'RFC 8037 JWK thumbprint vector mismatch',
);

const packageJson = readJson(paths.packageJson);
ensure(
  packageJson?.scripts?.['check:seis-model-release-attestation'] ===
    'node scripts/check-seis-model-release-attestation.mjs',
  'root package must expose the release attestation checker',
);
ensure(
  String(packageJson?.scripts?.['quality:governance'] || '').includes(
    'check:seis-model-release-attestation',
  ),
  'quality:governance must include the release attestation checker',
);

const contract = readJson(paths.contract);
ensure(
  contract?.trustRoot?.configPath === MODEL_RELEASE_TRUST_ROOT_PATH,
  'training evidence contract trust-root config path mismatch',
);
ensure(
  contract?.trustRoot?.schemaPath === MODEL_RELEASE_TRUST_ROOT_SCHEMA_PATH,
  'training evidence contract trust-root schema path mismatch',
);
ensure(
  contract?.trustRoot?.attestationVerification === 'implemented' &&
    contract?.trustRoot?.trustedApprovalKeyCount === 0,
  'training evidence contract must expose implemented verifier with zero trusted keys',
);
ensure(
  contract?.replayProtection?.attestationIdSigned === true &&
    contract?.replayProtection?.executorLedgerRequired === true &&
    contract?.replayProtection?.executorLedgerStatus === 'not-implemented-no-release-executor',
  'release executor replay ledger must remain required and not implemented',
);

const registry = readJson(paths.registry);
const registryPaths = new Set((registry?.records || []).map(record => record.path));
ensure(
  registryPaths.has(MODEL_RELEASE_TRUST_ROOT_PATH),
  'schema registry missing trust-root config',
);
ensure(
  registryPaths.has(MODEL_RELEASE_TRUST_ROOT_SCHEMA_PATH),
  'schema registry missing trust-root schema',
);

const releaseSchema = readJson(paths.releaseSchema);
const attestationProperties = releaseSchema?.properties?.approvalAttestation?.properties;
ensure(releaseSchema?.properties?.schemaVersion?.const === 2, 'release schema must be v2');
ensure(
  attestationProperties?.profile?.enum?.includes(RELEASE_ATTESTATION_PROFILE),
  'release schema missing signature profile',
);
ensure(
  JSON.stringify(attestationProperties?.algorithm?.enum) === JSON.stringify([null, 'ed25519']),
  'release schema must allow only null or Ed25519',
);
ensure(
  attestationProperties?.verifierId?.enum?.includes(RELEASE_ATTESTATION_VERIFIER_ID),
  'release schema verifier id mismatch',
);

const verifierSource = readText(paths.verifier);
ensure(verifierSource.includes('cryptoVerify(null'), 'verifier must use Node Ed25519 verification');
ensure(
  !/\bcreatePrivateKey\b/.test(verifierSource),
  'runtime verifier must not import private keys',
);
ensure(!/\bsign\s*\(/.test(verifierSource), 'runtime verifier must not perform signing');

for (const [relativePath, marker] of [
  [paths.tests, 'signature replay across a different release id'],
  [paths.tests, 'fully linked in-memory evidence chain'],
  [paths.docs, RELEASE_ATTESTATION_PROFILE],
  [paths.adr, 'RFC 7638'],
]) {
  ensure(readText(relativePath).includes(marker), `${relativePath} missing ${marker}`);
}

const gitignore = readText(paths.gitignore);
for (const relativePath of [MODEL_RELEASE_TRUST_ROOT_PATH, MODEL_RELEASE_TRUST_ROOT_SCHEMA_PATH]) {
  ensure(
    gitignore.includes(`!${relativePath}`),
    `.gitignore missing targeted exception ${relativePath}`,
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
    console.error('SEIS model release attestation check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(
    'SEIS model release attestation check passed: Ed25519 verifier implemented, RFC 7638 key ids enforced, 0 trusted approval keys, release denied.',
  );
}
