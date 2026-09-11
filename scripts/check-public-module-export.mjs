import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const REQUIRED_PROMOTION_GATES = Object.freeze([
  'source-provenance',
  'license-review',
  'secret-and-private-data-scan',
  'dependency-and-supply-chain-review',
  'duplicate-runtime-review',
  'contract-compatibility',
  'test-and-evidence-review',
  'public-claim-review',
]);

const ROLE_NAMESPACES = Object.freeze({
  'platform-runtime': 'platform',
  'creative-intelligence': 'creative',
  'research-intelligence': 'research',
  'public-presentation': 'presentation',
});

const EXACT_KEYS = Object.freeze({
  root: ['schemaVersion', 'contractId', 'moduleId', 'displayName', 'projectId', 'role', 'source', 'target', 'boundary', 'promotion', 'verification'],
  source: ['repository', 'paths'],
  target: ['namespace', 'path'],
  boundary: ['exportClass', 'publicSafe', 'containsSecrets', 'containsPrivateData', 'containsClientData', 'runtimeAuthority', 'crossRepositoryWrite'],
  promotion: ['state', 'requiredGates'],
  verification: ['commands', 'remoteEvidence'],
});

const SECRET_KEY_PATTERN = /(api.?key|api.?token|access.?token|password|passwd|private.?key|client.?secret|credential|secret)/i;
const SECRET_VALUE_PATTERN = new RegExp([
  ['gh', 'p_'].join('') + '[A-Za-z0-9]{4,}',
  ['github', 'pat_'].join('_') + '[A-Za-z0-9_]{4,}',
  ['s', 'k-'].join('') + '[A-Za-z0-9]{8,}',
  ['AK', 'IA'].join('') + '[0-9A-Z]{16}',
  ['BEGIN ', '(?:RSA |EC |OPENSSH )?', 'PRIVATE KEY'].join(''),
].join('|'));
const SAFE_COMMAND_PATTERN = /^(?:node\s+|npm\s+(?:run|test)(?:\s|$)|ruby\s+|python3\s+|bash\s+scripts\/|swift\s+test(?:\s|$))/;
const SHELL_META_PATTERN = /[|;&><`]/;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function checkExactKeys(value, allowedKeys, label, errors) {
  if (!isObject(value)) {
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

function scanForSecrets(value, trail, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForSecrets(item, [...trail, String(index)], errors));
    return;
  }
  if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      const fieldPath = [...trail, key].join('.');
      const explicitNegative = key === 'containsSecrets' && child === false;
      if (SECRET_KEY_PATTERN.test(key) && !explicitNegative) errors.push(`secret-like key is not allowed: ${fieldPath}`);
      scanForSecrets(child, [...trail, key], errors);
    }
    return;
  }
  if (typeof value === 'string' && SECRET_VALUE_PATTERN.test(value)) {
    errors.push(`secret-like value is not allowed: ${trail.join('.') || 'root'}`);
  }
}

function isSafePath(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 240) return false;
  if (value.startsWith('/') || value.startsWith('\\') || value.includes('\0')) return false;
  const normalized = value.replaceAll('\\', '/');
  if (normalized.split('/').some((segment) => segment === '..')) return false;
  return !/^[a-z][a-z0-9+.-]*:\/\//i.test(normalized);
}

function checkStringArray(value, label, errors) {
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

export function validatePublicModuleExport(record, bridge) {
  const errors = [];
  if (!isObject(record)) return { ok: false, errors: ['record must be an object'] };
  if (!isObject(bridge)) return { ok: false, errors: ['bridge must be an object'] };

  scanForSecrets(record, [], errors);
  checkExactKeys(record, EXACT_KEYS.root, 'record', errors);
  checkExactKeys(record.source, EXACT_KEYS.source, 'source', errors);
  checkExactKeys(record.target, EXACT_KEYS.target, 'target', errors);
  checkExactKeys(record.boundary, EXACT_KEYS.boundary, 'boundary', errors);
  checkExactKeys(record.promotion, EXACT_KEYS.promotion, 'promotion', errors);
  checkExactKeys(record.verification, EXACT_KEYS.verification, 'verification', errors);

  if (bridge.publicExport?.contractId !== 'ecosystem-module-export-v1') errors.push('bridge publicExport.contractId must be ecosystem-module-export-v1');
  if (bridge.publicExport?.schemaVersion !== 1) errors.push('bridge publicExport.schemaVersion must be 1');
  if (bridge.publicExport?.manifestPath !== 'content/ecosystem/public-module-export.json') errors.push('bridge publicExport.manifestPath is incorrect');
  if (bridge.publicExport?.schemaOwner !== 'unified-flagship') errors.push('bridge publicExport.schemaOwner must be unified-flagship');

  if (record.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (record.contractId !== 'ecosystem-module-export-v1') errors.push('contractId must be ecosystem-module-export-v1');
  if (record.projectId !== bridge.project?.id) errors.push(`projectId must match bridge project ${bridge.project?.id}`);
  if (record.role !== bridge.project?.role) errors.push(`role must match bridge role ${bridge.project?.role}`);
  if (record.source?.repository !== bridge.project?.sourceRepository) errors.push(`source.repository must match bridge repository ${bridge.project?.sourceRepository}`);
  if (typeof record.moduleId !== 'string' || !record.moduleId.startsWith(`${bridge.project?.id}.`)) errors.push(`moduleId must start with ${bridge.project?.id}.`);
  if (typeof record.displayName !== 'string' || record.displayName.length < 3 || record.displayName.trim() !== record.displayName) errors.push('displayName must be a trimmed human-readable string');

  const expectedNamespace = ROLE_NAMESPACES[bridge.project?.role];
  if (!expectedNamespace) errors.push(`bridge role has no registered namespace: ${bridge.project?.role}`);
  if (record.target?.namespace !== expectedNamespace) errors.push(`target.namespace must be ${expectedNamespace}`);
  if (!isSafePath(record.target?.path)) errors.push('target.path must be repository-relative and traversal-free');
  else if (expectedNamespace && !record.target.path.startsWith(`${expectedNamespace}/`)) errors.push(`target.path must remain inside ${expectedNamespace}/`);

  const sourcePaths = checkStringArray(record.source?.paths, 'source.paths', errors);
  for (const sourcePath of sourcePaths) {
    if (typeof sourcePath === 'string' && !isSafePath(sourcePath)) errors.push(`source.paths entry must be repository-relative and traversal-free: ${sourcePath}`);
  }
  if (new Set(sourcePaths).size !== sourcePaths.length) errors.push('source.paths must not contain duplicates');

  const expectedBoundary = {
    exportClass: 'metadata-only',
    publicSafe: true,
    containsSecrets: false,
    containsPrivateData: false,
    containsClientData: false,
    runtimeAuthority: false,
    crossRepositoryWrite: false,
  };
  for (const [key, expected] of Object.entries(expectedBoundary)) {
    if (record.boundary?.[key] !== expected) errors.push(`boundary.${key} must be ${JSON.stringify(expected)}`);
  }

  if (record.promotion?.state !== 'source-only') errors.push('promotion.state must remain source-only');
  const gates = checkStringArray(record.promotion?.requiredGates, 'promotion.requiredGates', errors);
  const seenGates = new Set();
  for (const gate of gates) {
    if (seenGates.has(gate)) errors.push(`duplicate promotion gate: ${gate}`);
    seenGates.add(gate);
    if (!REQUIRED_PROMOTION_GATES.includes(gate)) errors.push(`unexpected promotion gate: ${gate}`);
  }
  for (const gate of REQUIRED_PROMOTION_GATES) {
    if (!seenGates.has(gate)) errors.push(`missing promotion gate: ${gate}`);
  }

  const commands = checkStringArray(record.verification?.commands, 'verification.commands', errors);
  for (const command of commands) {
    if (typeof command === 'string' && (!SAFE_COMMAND_PATTERN.test(command) || SHELL_META_PATTERN.test(command))) {
      errors.push(`unsafe verification command: ${command}`);
    }
  }
  if (new Set(commands).size !== commands.length) errors.push('verification.commands must not contain duplicates');
  if (record.verification?.remoteEvidence !== 'not-recorded') errors.push('verification.remoteEvidence must remain not-recorded');

  return { ok: errors.length === 0, errors };
}

export function runPublicModuleExportCheck({
  bridgePath = 'content/ecosystem/unified-bridge.json',
  exportPath = 'content/ecosystem/public-module-export.json',
} = {}) {
  const bridge = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));
  const record = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const result = validatePublicModuleExport(record, bridge);
  if (!result.ok) {
    console.error('public-module-export: failed');
    result.errors.forEach((error) => console.error(`- ${error}`));
    return 1;
  }
  console.log(`public-module-export: ok (${record.projectId}, ${record.moduleId}, ${record.promotion.requiredGates.length} gates)`);
  return 0;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) process.exitCode = runPublicModuleExportCheck();
