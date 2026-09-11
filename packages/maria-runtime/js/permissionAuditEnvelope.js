export const PERMISSION_AUDIT_SCHEMA_VERSION = 'maria.permission-audit.v1';

const ACTION_CLASSES = new Set([
  'read',
  'safe-execute',
  'modify',
  'external',
  'destructive',
  'financial',
  'privacy-sensitive',
]);

const ENVELOPE_KEYS = [
  'schemaVersion',
  'actionClass',
  'target',
  'allowed',
  'requiresApproval',
  'reason',
  'reversible',
  'targetEvidence',
];

const EVIDENCE_KEYS = ['target', 'source', 'observedAt', 'verified'];
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const UTC_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{6}))?Z$/;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function invalid() {
  throw new TypeError('permission-audit-envelope-invalid');
}

function dataRecord(value, expectedKeys) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) invalid();
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) invalid();

  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Reflect.ownKeys(descriptors);
  if (keys.some((key) => typeof key !== 'string')) invalid();
  if (keys.length !== expectedKeys.length || expectedKeys.some((key) => !Object.hasOwn(descriptors, key))) invalid();

  const record = {};
  for (const key of expectedKeys) {
    const descriptor = descriptors[key];
    if (!descriptor || !Object.hasOwn(descriptor, 'value') || descriptor.get || descriptor.set) invalid();
    record[key] = descriptor.value;
  }
  return record;
}

function exactString(value) {
  if (typeof value !== 'string' || value.length === 0 || value !== value.trim() || CONTROL_CHARACTERS.test(value)) invalid();
  return value;
}

function boolean(value) {
  if (typeof value !== 'boolean') invalid();
  return value;
}

function isLeapYear(year) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function canonicalUtcTimestamp(value) {
  if (typeof value !== 'string') invalid();
  const match = UTC_TIMESTAMP.exec(value);
  if (!match) invalid();

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);

  if (year < 1 || month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) invalid();
  const maxDay = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];
  if (day < 1 || day > maxDay) invalid();

  return value;
}

function validateEvidence(value) {
  if (value === null) return null;
  const record = dataRecord(value, EVIDENCE_KEYS);
  return Object.freeze({
    target: exactString(record.target),
    source: exactString(record.source),
    observedAt: canonicalUtcTimestamp(record.observedAt),
    verified: boolean(record.verified),
  });
}

/**
 * Validate and isolate a cross-runtime permission audit envelope.
 *
 * The returned object is descriptive audit data only. Validation never grants
 * authority, re-evaluates permission, performs an effect, or persists data.
 */
export function validatePermissionAuditEnvelope(value) {
  const record = dataRecord(value, ENVELOPE_KEYS);
  if (record.schemaVersion !== PERMISSION_AUDIT_SCHEMA_VERSION) invalid();
  if (!ACTION_CLASSES.has(record.actionClass)) invalid();
  if (record.reversible !== null && typeof record.reversible !== 'boolean') invalid();

  return Object.freeze({
    schemaVersion: PERMISSION_AUDIT_SCHEMA_VERSION,
    actionClass: record.actionClass,
    target: exactString(record.target),
    allowed: boolean(record.allowed),
    requiresApproval: boolean(record.requiresApproval),
    reason: exactString(record.reason),
    reversible: record.reversible,
    targetEvidence: validateEvidence(record.targetEvidence),
  });
}
