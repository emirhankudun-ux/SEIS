import { createHash, createPublicKey, verify as cryptoVerify } from 'node:crypto';

import { canonicalJsonStringify } from '../lib/canonical-json.mjs';
import { readSafeJsonInside } from '../lib/safe-json-file.mjs';
import { assertValidJsonSchema, validateJsonSchema } from './json-schema-validation.mjs';

export const MODEL_RELEASE_TRUST_ROOT_PATH =
  'content/development/seis-model-release-trust-root.json';
export const MODEL_RELEASE_TRUST_ROOT_SCHEMA_PATH =
  'packages/shared-types/schemas/model-release-trust-root.schema.json';
export const RELEASE_ATTESTATION_PROFILE = 'seis-ed25519-release-v1';
export const RELEASE_ATTESTATION_ALGORITHM = 'ed25519';
export const RELEASE_ATTESTATION_VERIFIER_ID = 'seis-ed25519-release-verifier-v1';
export const RELEASE_ATTESTATION_KEY_ID_PREFIX = 'jkt-sha256:';
export const RELEASE_ATTESTATION_TRUST_DOMAIN = 'seis-model-release';
export const RELEASE_ATTESTATION_AUDIENCE = 'seis-public-model-registry';
export const RELEASE_ATTESTATION_POLICY_VERSION = '2026.07.12';

const RELEASE_ATTESTATION_DOMAIN = 'https://seis.dev/attestations/model-release/v1';
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const TIMESTAMP_SECONDS_PATTERN =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/;
const TIMESTAMP_MILLISECONDS_PATTERN =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/;

export function readModelReleaseTrustRoot(repoRoot) {
  const schema = readSafeJsonInside(repoRoot, MODEL_RELEASE_TRUST_ROOT_SCHEMA_PATH, {
    label: 'SEIS model release trust-root schema',
  });
  assertValidJsonSchema(schema);

  const trustRoot = readSafeJsonInside(repoRoot, MODEL_RELEASE_TRUST_ROOT_PATH, {
    label: 'SEIS model release trust root',
  });
  const errors = validateModelReleaseTrustRoot(trustRoot, schema);
  if (errors.length > 0) {
    throw new Error(`SEIS model release trust root failed closed: ${errors.join('; ')}`);
  }
  if (
    trustRoot.status !== 'not-configured' ||
    trustRoot.trustedApprovalKeys.length !== 0 ||
    trustRoot.provenance.source !== 'repository-default'
  ) {
    throw new Error(
      'SEIS repository trust root must remain empty; configured roots require a separately governed external startup boundary',
    );
  }
  return trustRoot;
}

export function validateModelReleaseTrustRoot(trustRoot, schema) {
  const errors = validateJsonSchema(schema, trustRoot);
  const seenKeyIds = new Set();

  for (const [index, key] of (trustRoot?.trustedApprovalKeys || []).entries()) {
    if (seenKeyIds.has(key.keyId)) errors.push(`$.trustedApprovalKeys[${index}]: duplicate keyId`);
    seenKeyIds.add(key.keyId);

    try {
      const derivedKeyId = deriveEd25519JwkThumbprint(key.publicKeyJwk);
      if (derivedKeyId !== key.keyId) {
        errors.push(`$.trustedApprovalKeys[${index}].keyId: RFC 7638 thumbprint mismatch`);
      }
    } catch (error) {
      errors.push(`$.trustedApprovalKeys[${index}].publicKeyJwk: ${error.message}`);
    }

    const validFrom = parseTimestamp(key.validFrom);
    const validUntil = key.validUntil === null ? null : parseTimestamp(key.validUntil);
    if (validFrom === null || (key.validUntil !== null && validUntil === null)) {
      errors.push(`$.trustedApprovalKeys[${index}]: invalid key validity timestamp`);
    } else if (validUntil !== null && validUntil <= validFrom) {
      errors.push(`$.trustedApprovalKeys[${index}].validUntil: must be after validFrom`);
    }
  }

  return errors;
}

export function deriveEd25519JwkThumbprint(jwk) {
  assertPublicEd25519Jwk(jwk);
  const canonical = canonicalJsonStringify({
    crv: 'Ed25519',
    kty: 'OKP',
    x: jwk.x,
  });
  const thumbprint = createHash('sha256').update(canonical, 'utf8').digest('base64url');
  return `${RELEASE_ATTESTATION_KEY_ID_PREFIX}${thumbprint}`;
}

export function buildReleaseApprovalPayload(release) {
  if (!release || typeof release !== 'object' || Array.isArray(release)) {
    throw new TypeError('release approval payload requires a release object');
  }
  const releaseStatement = structuredClone(release);
  delete releaseStatement.recordHash;
  delete releaseStatement.approvalAttestation;
  const attestation = release.approvalAttestation || {};
  return {
    domain: RELEASE_ATTESTATION_DOMAIN,
    profile: RELEASE_ATTESTATION_PROFILE,
    approval: {
      verificationStatus: attestation.verificationStatus,
      attestationId: attestation.attestationId,
      profile: attestation.profile,
      trustDomain: attestation.trustDomain,
      audience: attestation.audience,
      policyVersion: attestation.policyVersion,
      approvedAt: attestation.approvedAt,
      keyId: attestation.keyId,
      algorithm: attestation.algorithm,
      verifiedAt: attestation.verifiedAt,
      verifierId: attestation.verifierId,
    },
    release: releaseStatement,
  };
}

export function releaseApprovalMessage(release) {
  return Buffer.from(canonicalJsonStringify(buildReleaseApprovalPayload(release)), 'utf8');
}

export function computeReleaseApprovalPayloadDigest(release) {
  const digest = createHash('sha256').update(releaseApprovalMessage(release)).digest('hex');
  return `sha256:${digest}`;
}

export function verifyReleaseApprovalAttestation({
  release,
  trustRoot,
  now = new Date(),
  maxClockSkewMs = MAX_CLOCK_SKEW_MS,
} = {}) {
  try {
    if (trustRoot?.status !== 'configured') return failed('trust-root-not-configured');
    if (
      trustRoot.attestationVerification !== 'implemented' ||
      trustRoot.signatureProfile !== RELEASE_ATTESTATION_PROFILE ||
      trustRoot.signatureAlgorithm !== RELEASE_ATTESTATION_ALGORITHM ||
      trustRoot.keyIdScheme !== 'rfc7638-jwk-thumbprint-sha256' ||
      trustRoot.trustDomain !== RELEASE_ATTESTATION_TRUST_DOMAIN ||
      trustRoot.audience !== RELEASE_ATTESTATION_AUDIENCE ||
      trustRoot.policyVersion !== RELEASE_ATTESTATION_POLICY_VERSION ||
      trustRoot.provenance?.source !== 'external-startup' ||
      trustRoot.releaseAllowWithoutVerifiedAttestation !== false ||
      trustRoot.runtimeAuthority !== false
    ) {
      return failed('trust-root-policy-mismatch');
    }
    if (
      release?.decision !== 'allow' ||
      release?.fixtureOnly !== false ||
      release?.recordStatus !== 'accepted'
    ) {
      return failed('release-not-eligible-for-attestation');
    }

    const attestation = release.approvalAttestation;
    if (
      attestation?.verificationStatus !== 'verified' ||
      !attestation?.attestationId ||
      attestation?.profile !== RELEASE_ATTESTATION_PROFILE ||
      attestation?.trustDomain !== trustRoot.trustDomain ||
      attestation?.audience !== trustRoot.audience ||
      attestation?.policyVersion !== trustRoot.policyVersion ||
      attestation?.algorithm !== RELEASE_ATTESTATION_ALGORITHM ||
      attestation?.verifierId !== RELEASE_ATTESTATION_VERIFIER_ID
    ) {
      return failed('attestation-metadata-mismatch');
    }

    const key = trustRoot.trustedApprovalKeys?.find(entry => entry.keyId === attestation.keyId);
    if (!key) return failed('approval-key-not-trusted');
    if (key.status !== 'active') return failed('approval-key-not-active');
    if (!key.approvalScopes?.includes('model-release'))
      return failed('approval-key-scope-mismatch');
    if (deriveEd25519JwkThumbprint(key.publicKeyJwk) !== key.keyId) {
      return failed('approval-key-thumbprint-mismatch');
    }

    const releaseTime = parseTimestamp(release.createdAt);
    const approvalTime = parseTimestamp(attestation.approvedAt);
    const verifiedTime = parseTimestamp(attestation.verifiedAt);
    const nowTime = now instanceof Date ? now.getTime() : Number(now);
    if (
      releaseTime === null ||
      approvalTime === null ||
      verifiedTime === null ||
      !Number.isFinite(nowTime)
    ) {
      return failed('attestation-time-invalid');
    }
    if (!Number.isSafeInteger(maxClockSkewMs) || maxClockSkewMs < 0) {
      return failed('attestation-clock-skew-invalid');
    }
    if (
      approvalTime < releaseTime ||
      approvalTime > nowTime + maxClockSkewMs ||
      verifiedTime < approvalTime ||
      verifiedTime > nowTime + maxClockSkewMs
    ) {
      return failed('attestation-time-out-of-bounds');
    }
    const maxApprovalAgeMs = trustRoot.maxApprovalAgeSeconds * 1000;
    if (
      !Number.isSafeInteger(maxApprovalAgeMs) ||
      maxApprovalAgeMs <= 0 ||
      nowTime - approvalTime > maxApprovalAgeMs + maxClockSkewMs
    ) {
      return failed('attestation-approval-too-old');
    }

    const validFrom = parseTimestamp(key.validFrom);
    const validUntil = key.validUntil === null ? null : parseTimestamp(key.validUntil);
    if (
      validFrom === null ||
      approvalTime < validFrom ||
      nowTime < validFrom ||
      (validUntil !== null && (approvalTime >= validUntil || nowTime >= validUntil))
    ) {
      return failed('approval-key-outside-validity-window');
    }

    const expectedDigest = computeReleaseApprovalPayloadDigest(release);
    if (attestation.payloadDigest !== expectedDigest) {
      return failed('attestation-payload-digest-mismatch');
    }

    let signature;
    try {
      signature = decodeCanonicalBase64Url(attestation.signature);
    } catch {
      return failed('attestation-signature-encoding-invalid');
    }
    if (signature.length !== 64) return failed('attestation-signature-length-invalid');

    const publicKey = createPublicKey({ key: key.publicKeyJwk, format: 'jwk' });
    if (publicKey.type !== 'public' || publicKey.asymmetricKeyType !== 'ed25519') {
      return failed('approval-key-type-invalid');
    }
    if (!cryptoVerify(null, releaseApprovalMessage(release), publicKey, signature)) {
      return failed('attestation-signature-invalid');
    }

    return {
      ok: true,
      code: 'verified',
      profile: RELEASE_ATTESTATION_PROFILE,
      verifierId: RELEASE_ATTESTATION_VERIFIER_ID,
      keyId: key.keyId,
      payloadDigest: expectedDigest,
    };
  } catch {
    return failed('attestation-verification-error');
  }
}

export function summarizeModelReleaseTrustRoot(trustRoot) {
  return {
    id: trustRoot.id,
    version: trustRoot.version,
    status: trustRoot.status,
    attestationVerification: trustRoot.attestationVerification,
    signatureProfile: trustRoot.signatureProfile,
    signatureAlgorithm: trustRoot.signatureAlgorithm,
    keyIdScheme: trustRoot.keyIdScheme,
    trustDomain: trustRoot.trustDomain,
    audience: trustRoot.audience,
    policyVersion: trustRoot.policyVersion,
    maxApprovalAgeSeconds: trustRoot.maxApprovalAgeSeconds,
    provenanceSource: trustRoot.provenance.source,
    trustedApprovalKeyCount: trustRoot.trustedApprovalKeys.length,
    trustedApprovalKeyIds: trustRoot.trustedApprovalKeys.map(key => key.keyId),
    releaseAllowWithoutVerifiedAttestation: trustRoot.releaseAllowWithoutVerifiedAttestation,
    runtimeAuthority: trustRoot.runtimeAuthority,
  };
}

function assertPublicEd25519Jwk(jwk) {
  if (!jwk || typeof jwk !== 'object' || Array.isArray(jwk)) {
    throw new TypeError('public Ed25519 JWK must be an object');
  }
  const keys = Object.keys(jwk).sort();
  if (keys.join(',') !== 'crv,kty,x') {
    throw new TypeError('public Ed25519 JWK must contain only crv, kty, and x');
  }
  if (jwk.kty !== 'OKP' || jwk.crv !== 'Ed25519') {
    throw new TypeError('public JWK must use OKP Ed25519');
  }
  const publicBytes = decodeCanonicalBase64Url(jwk.x);
  if (publicBytes.length !== 32) throw new TypeError('Ed25519 public key must be 32 bytes');
}

function decodeCanonicalBase64Url(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new TypeError('value must be unpadded base64url');
  }
  const decoded = Buffer.from(value, 'base64url');
  if (decoded.toString('base64url') !== value) {
    throw new TypeError('value must use canonical unpadded base64url');
  }
  return decoded;
}

function parseTimestamp(value) {
  if (
    typeof value !== 'string' ||
    (!TIMESTAMP_SECONDS_PATTERN.test(value) && !TIMESTAMP_MILLISECONDS_PATTERN.test(value))
  ) {
    return null;
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  const expected = value.includes('.') ? value : value.replace('Z', '.000Z');
  return new Date(parsed).toISOString() === expected ? parsed : null;
}

function failed(code) {
  return {
    ok: false,
    code,
    profile: RELEASE_ATTESTATION_PROFILE,
    verifierId: RELEASE_ATTESTATION_VERIFIER_ID,
  };
}
