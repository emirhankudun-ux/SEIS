import fs from 'node:fs';

export const PROJECT_PROFILE_CONTRACT_ID = 'ecosystem-project-profile-v1';
export const PROJECT_PROFILE_SCHEMA_VERSION = 1;

const PROJECT_REGISTRY = Object.freeze({
  seis: Object.freeze({ displayName: 'SEIS', repository: 'emirhankudun-ux/SEIS', role: 'platform-runtime', visibility: 'public' }),
  'eleni-neferi': Object.freeze({ displayName: 'Eleni-Neferi', repository: 'emirhankudun-ux/Eleni-Neferi-', role: 'creative-intelligence', visibility: 'private' }),
  pantechnoepistemonoesis: Object.freeze({ displayName: 'Pantechnoepistemonoesis', repository: 'emirhankudun-ux/Pantechnoepistemonoesis', role: 'research-intelligence', visibility: 'private' }),
  'portfolio-surface': Object.freeze({ displayName: 'Emirhan Kudun Portfolio', repository: 'emirhankudun-ux/emirhan-kudun-portfolio', role: 'public-presentation', visibility: 'private' }),
});

const ALLOWED_STATUSES = Object.freeze(['source-declared', 'observed', 'implemented-local', 'planned', 'blocked']);
const EXACT_KEYS = Object.freeze({
  root: ['schemaVersion', 'contractId', 'projectId', 'displayName', 'role', 'repository', 'visibility', 'summary', 'capabilityGroups', 'publicBoundary', 'verification'],
  group: ['id', 'label', 'status', 'capabilities'],
  boundary: ['exportEnabled', 'containsPrivateMemory', 'containsPrivateData', 'containsClientData', 'credentialsRequired', 'runtimeAuthority', 'crossRepositoryWrite'],
  verification: ['commands', 'evidenceState'],
});

const IDENTIFIER_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_COMMAND_PATTERN = /^(?:node\s+|npm\s+(?:run|test)(?:\s|$)|ruby\s+|python3\s+|bash\s+scripts\/|swift\s+test(?:\s|$))/;
const SHELL_META_PATTERN = /[|;&><`]/;
const SENSITIVE_FIELD_PATTERN = /(api.?key|api.?token|access.?token|password|passwd|client.?secret|credential|secret)/i;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function checkExactKeys(value, allowedKeys, label, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${label} must be an object`);
    return;
  }
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(`${label} contains unexpected field: ${key}`);
  }
  for (const key of allowedKeys) {
    if (!(key in value)) errors.push(`${label} is missing required field: ${key}`);
  }
}

function scanSensitiveFields(value, trail, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanSensitiveFields(item, [...trail, String(index)], errors));
    return;
  }
  if (!isPlainObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const explicitNegativeBoundary = ['containsPrivateData', 'containsClientData', 'credentialsRequired'].includes(key) && child === false;
    if (SENSITIVE_FIELD_PATTERN.test(key) && !explicitNegativeBoundary) {
      errors.push(`secret-like key is not allowed: ${[...trail, key].join('.')}`);
    }
    scanSensitiveFields(child, [...trail, key], errors);
  }
}

function validateStringArray(value, label, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} must be a non-empty array`);
    return [];
  }
  value.forEach((item, index) => {
    if (typeof item !== 'string' || item.length === 0 || item.trim() !== item) {
      errors.push(`${label}[${index}] must be a non-empty trimmed string`);
    }
  });
  return value;
}

export function validatePublicProjectProfile(profile, bridge) {
  const errors = [];
  if (!isPlainObject(profile)) return { ok: false, errors: ['profile must be an object'] };
  if (!isPlainObject(bridge)) return { ok: false, errors: ['bridge must be an object'] };

  scanSensitiveFields(profile, [], errors);
  checkExactKeys(profile, EXACT_KEYS.root, 'profile', errors);
  checkExactKeys(profile.publicBoundary, EXACT_KEYS.boundary, 'publicBoundary', errors);
  checkExactKeys(profile.verification, EXACT_KEYS.verification, 'verification', errors);

  if (profile.schemaVersion !== PROJECT_PROFILE_SCHEMA_VERSION) errors.push(`schemaVersion must be ${PROJECT_PROFILE_SCHEMA_VERSION}`);
  if (profile.contractId !== PROJECT_PROFILE_CONTRACT_ID) errors.push(`contractId must be ${PROJECT_PROFILE_CONTRACT_ID}`);

  const expected = PROJECT_REGISTRY[bridge.project?.id];
  if (!expected) {
    errors.push(`bridge project is not registered: ${String(bridge.project?.id)}`);
  } else {
    if (profile.projectId !== bridge.project.id) errors.push('projectId must match the bridge project id');
    if (profile.displayName !== bridge.project.displayName || profile.displayName !== expected.displayName) errors.push('displayName must match the registered bridge identity');
    if (profile.role !== bridge.project.role || profile.role !== expected.role) errors.push('role must match the registered bridge role');
    if (profile.repository !== bridge.project.sourceRepository || profile.repository !== expected.repository) errors.push('repository must match the registered bridge repository');
    if (profile.visibility !== expected.visibility) errors.push(`visibility must be ${expected.visibility}`);
  }

  if (bridge.projectProfile?.declared !== true) errors.push('bridge projectProfile.declared must be true');
  if (bridge.projectProfile?.contractId !== PROJECT_PROFILE_CONTRACT_ID) errors.push('bridge projectProfile contractId mismatch');
  if (bridge.projectProfile?.schemaVersion !== PROJECT_PROFILE_SCHEMA_VERSION) errors.push('bridge projectProfile schemaVersion mismatch');
  if (bridge.projectProfile?.manifestPath !== 'content/ecosystem/public-project-profile.json') errors.push('bridge projectProfile manifestPath mismatch');
  if (bridge.projectProfile?.schemaOwner !== 'unified-flagship') errors.push('bridge projectProfile schemaOwner mismatch');

  if (profile.publicBoundary?.exportEnabled !== bridge.publicExport?.enabled) errors.push('publicBoundary.exportEnabled must match bridge publicExport.enabled');
  for (const key of ['containsPrivateMemory', 'containsPrivateData', 'containsClientData', 'credentialsRequired', 'runtimeAuthority', 'crossRepositoryWrite']) {
    if (profile.publicBoundary?.[key] !== false) errors.push(`publicBoundary.${key} must be false`);
  }

  if (typeof profile.summary !== 'string' || profile.summary.trim() !== profile.summary || profile.summary.length < 40 || profile.summary.length > 400) {
    errors.push('summary must be a trimmed human-readable string between 40 and 400 characters');
  }

  if (!Array.isArray(profile.capabilityGroups) || profile.capabilityGroups.length === 0 || profile.capabilityGroups.length > 12) {
    errors.push('capabilityGroups must contain between 1 and 12 groups');
  } else {
    const groupIds = new Set();
    const capabilityIds = new Set();
    profile.capabilityGroups.forEach((group, index) => {
      const label = `capabilityGroups[${index}]`;
      checkExactKeys(group, EXACT_KEYS.group, label, errors);
      if (!isPlainObject(group)) return;
      if (typeof group.id !== 'string' || !IDENTIFIER_PATTERN.test(group.id)) errors.push(`${label}.id must be a lowercase hyphenated identifier`);
      else if (groupIds.has(group.id)) errors.push(`duplicate capability group: ${group.id}`);
      else groupIds.add(group.id);
      if (typeof group.label !== 'string' || group.label.trim() !== group.label || group.label.length < 3) errors.push(`${label}.label must be a readable trimmed string`);
      if (!ALLOWED_STATUSES.includes(group.status)) errors.push(`${label}.status is not allowed: ${String(group.status)}`);
      const capabilities = validateStringArray(group.capabilities, `${label}.capabilities`, errors);
      for (const capabilityId of capabilities) {
        if (typeof capabilityId !== 'string') continue;
        if (!IDENTIFIER_PATTERN.test(capabilityId)) errors.push(`${label} contains invalid capability: ${capabilityId}`);
        if (capabilityIds.has(capabilityId)) errors.push(`duplicate capability declaration: ${capabilityId}`);
        capabilityIds.add(capabilityId);
      }
      if (new Set(capabilities).size !== capabilities.length) errors.push(`${label}.capabilities must not contain duplicates`);
    });
  }

  const commands = validateStringArray(profile.verification?.commands, 'verification.commands', errors);
  for (const command of commands) {
    if (typeof command !== 'string') continue;
    if (!SAFE_COMMAND_PATTERN.test(command) || SHELL_META_PATTERN.test(command)) errors.push(`unsafe verification command: ${command}`);
  }
  if (!commands.includes('node scripts/check-public-project-profile.mjs')) errors.push('verification.commands must include the project profile checker');
  if (new Set(commands).size !== commands.length) errors.push('verification.commands must not contain duplicates');
  if (profile.verification?.evidenceState !== 'not-recorded') errors.push('verification.evidenceState must remain not-recorded in a source profile');

  return { ok: errors.length === 0, errors };
}

export function checkPublicProjectProfileFiles({ profilePath = 'content/ecosystem/public-project-profile.json', bridgePath = 'content/ecosystem/unified-bridge.json' } = {}) {
  const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
  const bridge = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));
  return validatePublicProjectProfile(profile, bridge);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = checkPublicProjectProfileFiles();
  if (!result.ok) {
    console.error('public-project-profile: failed');
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('public-project-profile: ok');
}
