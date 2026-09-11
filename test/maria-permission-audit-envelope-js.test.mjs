import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PERMISSION_AUDIT_SCHEMA_VERSION,
  validatePermissionAuditEnvelope,
} from '../packages/maria-runtime/js/permissionAuditEnvelope.js';

const validEnvelope = () => ({
  schemaVersion: 'maria.permission-audit.v1',
  actionClass: 'modify',
  target: 'github:emirhankudun-ux/SEIS#247',
  allowed: true,
  requiresApproval: true,
  reason: 'explicit approval recorded',
  reversible: false,
  targetEvidence: {
    target: 'github:emirhankudun-ux/SEIS#247',
    source: 'github-adapter:repository-resolution',
    observedAt: '2026-09-11T20:00:00Z',
    verified: true,
  },
});

test('JavaScript accepts and isolates the canonical Python permission audit envelope', () => {
  const input = validEnvelope();
  const accepted = validatePermissionAuditEnvelope(input);

  assert.equal(PERMISSION_AUDIT_SCHEMA_VERSION, 'maria.permission-audit.v1');
  assert.deepEqual(accepted, input);
  assert.notEqual(accepted, input);
  assert.notEqual(accepted.targetEvidence, input.targetEvidence);
  assert.equal(Object.isFrozen(accepted), true);
  assert.equal(Object.isFrozen(accepted.targetEvidence), true);

  input.target = 'mutated';
  input.targetEvidence.source = 'mutated';
  assert.equal(accepted.target, 'github:emirhankudun-ux/SEIS#247');
  assert.equal(accepted.targetEvidence.source, 'github-adapter:repository-resolution');
});

test('JavaScript accepts denied and no-evidence envelopes without re-authorizing them', () => {
  const denied = validEnvelope();
  denied.allowed = false;
  denied.reason = 'approved action requires fresh verified target evidence';
  denied.targetEvidence.verified = false;
  const accepted = validatePermissionAuditEnvelope(denied);
  assert.equal(accepted.allowed, false);
  assert.equal(accepted.targetEvidence.verified, false);

  const read = validEnvelope();
  read.actionClass = 'read';
  read.allowed = true;
  read.requiresApproval = false;
  read.reason = 'policy allows low-risk action';
  read.reversible = null;
  read.targetEvidence = null;
  assert.equal(validatePermissionAuditEnvelope(read).targetEvidence, null);
});

const invalidCases = [
  ['non-object', null],
  ['array', []],
  ['wrong schema version', {...validEnvelope(), schemaVersion: 'maria.permission-audit.v2'}],
  ['unknown action class', {...validEnvelope(), actionClass: 'admin'}],
  ['whitespace target', {...validEnvelope(), target: ' github:repo'}],
  ['control target', {...validEnvelope(), target: 'github:repo\nother'}],
  ['string allowed', {...validEnvelope(), allowed: 'true'}],
  ['string requiresApproval', {...validEnvelope(), requiresApproval: 'true'}],
  ['invalid reversible', {...validEnvelope(), reversible: 'unknown'}],
  ['empty reason', {...validEnvelope(), reason: ''}],
  ['extra top-level field', {...validEnvelope(), authority: 'granted'}],
  ['extra evidence field', {...validEnvelope(), targetEvidence: {...validEnvelope().targetEvidence, receipt: 'token'}}],
  ['offset timestamp', {...validEnvelope(), targetEvidence: {...validEnvelope().targetEvidence, observedAt: '2026-09-11T23:00:00+03:00'}}],
  ['invalid timestamp', {...validEnvelope(), targetEvidence: {...validEnvelope().targetEvidence, observedAt: 'not-a-date'}}],
  ['string verified', {...validEnvelope(), targetEvidence: {...validEnvelope().targetEvidence, verified: 'true'}}],
];

for (const [name, value] of invalidCases) {
  test(`JavaScript fails closed for ${name}`, () => {
    assert.throws(() => validatePermissionAuditEnvelope(value), /permission-audit-envelope-invalid/);
  });
}

test('validation does not execute getters while inspecting unexpected properties', () => {
  const envelope = validEnvelope();
  let getterCalls = 0;
  Object.defineProperty(envelope, 'authority', {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error('should-not-run');
    },
  });

  assert.throws(() => validatePermissionAuditEnvelope(envelope), /permission-audit-envelope-invalid/);
  assert.equal(getterCalls, 0);
});
