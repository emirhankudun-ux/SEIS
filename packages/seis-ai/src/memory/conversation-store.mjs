import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import {
  chmodSync,
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir, platform } from 'node:os';
import path from 'node:path';

import { canonicalJsonStringify } from '../lib/canonical-json.mjs';
import { assertNoCredentialLikeJsonContent } from '../lib/credential-safety.mjs';
import { redactSecretText } from '../lib/redaction.mjs';
import { resolveInside } from '../lib/repo.mjs';
import { readSafeJsonInside } from '../lib/safe-json-file.mjs';
import { assertValidJsonSchema, validateJsonSchema } from '../model/json-schema-validation.mjs';

export const CONVERSATION_NEXUS_CONTRACT_PATH = 'content/development/seis-conversation-nexus.json';
export const CONVERSATION_SESSION_SCHEMA_PATH =
  'packages/shared-types/schemas/seis-conversation-session.schema.json';
export const CONVERSATION_ENVELOPE_SCHEMA_PATH =
  'packages/shared-types/schemas/seis-conversation-envelope.schema.json';
export const CONVERSATION_NEXUS_RESOURCE_URI = 'seis://ai/conversation-nexus.json';
export const CONVERSATION_STATUS_TOOL = 'seis_ai_core_conversation_status';
export const CONVERSATION_SEARCH_TOOL = 'seis_ai_core_conversation_search';
export const CONVERSATION_STORE_DIRECTORY = 'conversations';
export const LEGACY_SESSION_RELATIVE_PATH = '.seis/sessions';
export const CONVERSATION_EXPORT_DIRECTORY = 'exports';
export const CONVERSATION_VAULT_KEY_FILENAME = 'conversation-vault.key';

const MAX_SESSION_FILE_BYTES = 8 * 1024 * 1024;
const MAX_SESSION_COUNT = 512;
const MAX_MESSAGE_COUNT = 2048;
const MAX_STRING_BYTES = 256 * 1024;
const MAX_CONTENT_BLOCKS = 256;
const ENCRYPTED_ENVELOPE_RECORD_TYPE = 'seis-encrypted-conversation-envelope';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const SESSION_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const SYNCED_PATH_PATTERNS = [
  /\/Library\/Mobile Documents\//i,
  /\/iCloud Drive\//i,
  /\/Dropbox[^/]*(?:\/|$)/i,
  /\/OneDrive[^/]*(?:\/|$)/i,
  /\/Google Drive[^/]*(?:\/|$)/i,
  /\/Syncthing(?:\/|$)/i,
];
const STRONG_SECRET_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  /\b(?:hf_[A-Za-z0-9]{20,}|sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}|github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|(?:AKIA|ASIA)[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|xox[baprs]-[A-Za-z0-9-]{20,})\b/g,
  /\bBearer\s+[A-Za-z0-9._~+/-]{20,}={0,2}\b/gi,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  /[a-z][a-z0-9+.-]*:\/\/[^/\s:@]+:[^/\s@]+@/gi,
  /\b(api[-_ ]?key|access[-_ ]?key|private[-_ ]?key|authorization|cookie|token|password|secret)\b\s*[:=]\s*[^\s,;"']{8,}/gi,
  /(["']?(?:x-api-key|authorization|cookie|token|password|secret)["']?\s*,\s*["'])[^"']{8,}(["'])/gi,
];

export function resolveConversationStateRoot(options = {}) {
  const candidate = options.stateRoot || defaultConversationStateRoot();
  if (typeof candidate !== 'string' || !path.isAbsolute(candidate)) {
    throw new Error('conversation state root must be an absolute local path');
  }
  const normalized = canonicalizePotentialPath(candidate);
  const policyPath = normalized.split(path.sep).join('/');
  if (SYNCED_PATH_PATTERNS.some(pattern => pattern.test(policyPath))) {
    throw new Error('conversation state root must not be inside a known synchronized folder');
  }
  if (options.repoRoot && pathContains(canonicalizePotentialPath(options.repoRoot), normalized)) {
    throw new Error('conversation state root must remain outside the repository');
  }
  return normalized;
}

export function conversationNexusStatus(repoRoot, options = {}) {
  try {
    const contract = readConversationNexusContract(repoRoot);
    const stateRoot = resolveConversationStateRoot({ repoRoot, stateRoot: options.stateRoot });
    const scan = scanConversationStore(repoRoot, stateRoot, { now: options.now });
    const legacySessionCount = countSessionFiles(repoRoot, LEGACY_SESSION_RELATIVE_PATH);
    const payload = {
      ok: true,
      tool: CONVERSATION_STATUS_TOOL,
      id: contract.id,
      version: contract.version,
      status: contract.status,
      resourceUri: CONVERSATION_NEXUS_RESOURCE_URI,
      storage: {
        storageClass: 'os-private-state-root',
        directory: CONVERSATION_STORE_DIRECTORY,
        repositoryStorageAllowed: false,
        knownSynchronizedFolderAllowed: false,
        encryptionAtRest: 'implemented-aes-256-gcm-local-keyfile',
        encryptionAlgorithm: ENCRYPTION_ALGORITHM,
        keySource: 'owner-only-local-key-file',
        ownerOnlyTargetMode: '0700-directory/0600-file',
      },
      sessionCount: scan.sessions.length,
      messageCount: scan.sessions.reduce((total, session) => total + session.messageCount, 0),
      expiredSessionCount: scan.sessions.filter(session => session.expired).length,
      corruptSessionCount: scan.corruptSessionCount,
      skippedSymlinkCount: scan.skippedSymlinkCount,
      legacySessionCount,
      migration: {
        automatic: false,
        explicitOnly: true,
        legacyFilesDeleted: false,
      },
      privacy: contract.privacy,
      sourceAdapters: contract.sourceAdapters,
      mcpBoundary: contract.mcpBoundary,
      runtimeAuthority: false,
      providerCallsPerformed: false,
      externalMutationPerformed: false,
    };
    if (options.includeSessions === true) payload.sessions = scan.sessions;
    if (options.includeContract === true) payload.contract = contract;
    return payload;
  } catch (error) {
    return {
      ok: false,
      tool: CONVERSATION_STATUS_TOOL,
      status: 'invalid-fail-closed',
      sessionCount: 0,
      messageCount: 0,
      runtimeAuthority: false,
      providerCallsPerformed: false,
      externalMutationPerformed: false,
      error: error.message,
    };
  }
}

export function conversationNexusContract(repoRoot) {
  return structuredClone(readConversationNexusContract(repoRoot));
}

export function searchConversationSessions(repoRoot, options = {}) {
  readConversationNexusContract(repoRoot);
  const stateRoot = resolveConversationStateRoot({ repoRoot, stateRoot: options.stateRoot });
  const query = normalizeSearchQuery(options.query);
  const limit = normalizeLimit(options.limit, 10, 1, 50);
  const terms = tokenize(query);
  const scan = scanConversationStore(repoRoot, stateRoot, {
    includeRecords: true,
    now: options.now,
  });
  const matches = [];

  for (const session of scan.sessions) {
    if (session.expired) continue;
    const record = session.record;
    const matchedRoles = new Set();
    let matchedMessageCount = 0;
    let score =
      scoreText(`${record.sessionName} ${record.provider.id} ${record.provider.model}`, terms) * 5;

    for (const message of record.messages) {
      const messageScore = scoreText(message.content, terms);
      if (messageScore > 0) {
        matchedMessageCount += 1;
        matchedRoles.add(message.role);
        score += messageScore;
      }
    }
    if (score === 0) continue;

    matches.push({
      sessionId: record.id,
      sessionName: record.sessionName,
      providerId: record.provider.id,
      model: record.provider.model,
      updatedAt: record.updatedAt,
      messageCount: record.messageCount,
      matchedMessageCount,
      matchedRoles: [...matchedRoles].sort(),
      score,
      contentReturned: false,
      openRequiresExplicitLocalSessionSelection: true,
    });
  }

  matches.sort(
    (left, right) =>
      right.score - left.score ||
      Date.parse(right.updatedAt) - Date.parse(left.updatedAt) ||
      left.sessionName.localeCompare(right.sessionName),
  );

  return {
    ok: true,
    tool: CONVERSATION_SEARCH_TOOL,
    queryHash: `sha256:${createHash('sha256').update(query).digest('hex')}`,
    termCount: terms.length,
    resultCount: Math.min(matches.length, limit),
    totalMatchCount: matches.length,
    results: matches.slice(0, limit),
    contentReturned: false,
    privacyMode: 'local-only-metadata',
    providerCallsPerformed: false,
    externalMutationPerformed: false,
  };
}

export function readConversationHistory(repoRoot, sessionName, options = {}) {
  const normalizedName = normalizeSessionName(sessionName);
  const stateRoot = resolveConversationStateRoot({ repoRoot, stateRoot: options.stateRoot });
  const recordPath = resolveStatePath(stateRoot, sessionRecordPath(normalizedName));
  if (existsSync(recordPath)) {
    const record = readConversationRecord(repoRoot, stateRoot, normalizedName, {
      now: options.now,
    });
    return {
      source: 'conversation-nexus',
      migrated: false,
      record,
      messages: record.messages.map(message => ({ role: message.role, content: message.content })),
    };
  }
  if (options.allowLegacy !== true) return null;

  const legacyPath = `${LEGACY_SESSION_RELATIVE_PATH}/${normalizedName}.json`;
  if (!existsSync(resolveInside(repoRoot, legacyPath))) return null;
  const legacy = readSafeJsonInside(repoRoot, legacyPath, {
    label: 'SEIS legacy conversation session',
    maxBytes: MAX_SESSION_FILE_BYTES,
  });
  validateIncomingMessageArray(legacy.messages);
  return {
    source: 'legacy-session',
    migrated: false,
    record: null,
    model: normalizeText(legacy.model || 'unknown-model', 'legacy model', 256),
    messages: structuredClone(legacy.messages),
  };
}

export function saveConversationSession(repoRoot, input = {}) {
  const sessionName = normalizeSessionName(input.sessionName);
  const messages = validateIncomingMessageArray(input.messages);
  const providerId = normalizeIdentifier(input.providerId || 'anthropic', 'provider id');
  const model = normalizeText(input.model || 'unknown-model', 'model', 256);
  const now = normalizeNow(input.now);
  const stateRoot = resolveConversationStateRoot({ repoRoot, stateRoot: input.stateRoot });
  const existing = tryReadConversationRecord(repoRoot, stateRoot, sessionName, { now });
  const sanitized = sanitizeMessages(messages);
  const createdAt = existing?.createdAt || now;
  const retention = normalizeRetention(
    input.retention === undefined && existing
      ? { expiresAt: existing.retention.expiresAt }
      : input.retention,
    now,
  );
  const id = `conversation:seis-agent-${sessionName.toLowerCase()}:v1`;

  const record = {
    schemaRef: CONVERSATION_SESSION_SCHEMA_PATH,
    schemaVersion: 1,
    recordType: 'conversation-session',
    id,
    sessionName,
    status: 'local-private',
    privacyMode: 'local-only',
    consent: {
      capture: 'explicit-cli-session',
      providerUploadAllowed: false,
      githubPublicationAllowed: false,
      externalSyncAllowed: false,
    },
    provenance: {
      entityId: id,
      activityId: `conversation-activity:${shortHash(`${sessionName}:${createdAt}`)}`,
      agentId: `provider-profile:${providerId}`,
      sourceType: 'seis-agent-cli-session',
      sourceSessionName: sessionName,
    },
    provider: {
      id: providerId,
      model,
      liveProviderUsed: input.liveProviderUsed === true,
    },
    retention,
    redaction: {
      applied: sanitized.replacementCount > 0,
      replacementCount: sanitized.replacementCount,
      policy: 'seis-conversation-redaction-v1',
    },
    messageCount: sanitized.messages.length,
    messages: sanitized.messages,
    createdAt,
    updatedAt: now,
    recordHash: null,
    truthBoundary:
      'Local private conversation state only. It is not training data, public memory, provider-neutral context approval, model ownership evidence, or permission to publish conversation content.',
  };
  record.recordHash = computeConversationRecordHash(record);
  validateConversationRecord(repoRoot, record);
  writeOwnerOnlyJson(stateRoot, sessionRecordPath(sessionName), record);
  return summarizeConversationRecord(record);
}

export function migrateLegacyConversationSession(repoRoot, sessionName, options = {}) {
  const normalizedName = normalizeSessionName(sessionName);
  const stateRoot = resolveConversationStateRoot({ repoRoot, stateRoot: options.stateRoot });
  if (tryReadConversationRecord(repoRoot, stateRoot, normalizedName, { now: options.now })) {
    throw new Error(`conversation session already exists: ${normalizedName}`);
  }
  const legacy = readConversationHistory(repoRoot, normalizedName, { allowLegacy: true });
  if (!legacy || legacy.source !== 'legacy-session') {
    throw new Error(`legacy conversation session missing: ${normalizedName}`);
  }
  return saveConversationSession(repoRoot, {
    stateRoot,
    sessionName: normalizedName,
    model: legacy.model,
    providerId: options.providerId || 'anthropic',
    messages: legacy.messages,
    liveProviderUsed: true,
    now: options.now,
  });
}

export function exportConversationSession(repoRoot, sessionName, options = {}) {
  const normalizedName = normalizeSessionName(sessionName);
  if (options.confirmation !== normalizedName) {
    throw new Error('conversation export requires an exact session-name confirmation');
  }
  const stateRoot = resolveConversationStateRoot({ repoRoot, stateRoot: options.stateRoot });
  const record = readConversationRecord(repoRoot, stateRoot, normalizedName, { now: options.now });
  const exportedAt = normalizeNow(options.now);
  const exportEnvelope = {
    schemaVersion: 1,
    recordType: 'conversation-session-local-export',
    localExport: {
      exportedAt,
      exportId: `conversation-export:${shortHash(`${record.id}:${exportedAt}`)}`,
      destination: 'owner-only-local-file',
      providerUploadAllowed: false,
      githubPublicationAllowed: false,
    },
    session: record,
  };
  const relativeStatePath = `${CONVERSATION_EXPORT_DIRECTORY}/${normalizedName}-${exportedAt.replaceAll(':', '-')}.json`;
  writeOwnerOnlyJson(stateRoot, relativeStatePath, exportEnvelope);
  return {
    ok: true,
    sessionName: normalizedName,
    relativeStatePath,
    contentExported: true,
    encryptedAtRest: true,
    encryptionAlgorithm: ENCRYPTION_ALGORITHM,
    localOnly: true,
    providerUploadAllowed: false,
    githubPublicationAllowed: false,
  };
}

export function deleteConversationSession(repoRoot, sessionName, options = {}) {
  const normalizedName = normalizeSessionName(sessionName);
  if (options.confirmation !== normalizedName) {
    throw new Error('conversation deletion requires an exact session-name confirmation');
  }
  const stateRoot = resolveConversationStateRoot({ repoRoot, stateRoot: options.stateRoot });
  const filePath = resolveStatePath(stateRoot, sessionRecordPath(normalizedName));
  let deletedSessionCount = 0;
  if (existsSync(filePath)) {
    assertRegularPrivateFile(filePath, 'conversation deletion target');
    rmSync(filePath);
    deletedSessionCount = 1;
  }
  const deletedExportCount = deleteMatchingLocalFiles(
    stateRoot,
    CONVERSATION_EXPORT_DIRECTORY,
    name => name.startsWith(`${normalizedName}-`) && name.endsWith('.json'),
  );
  const deletedTemporaryCount = deleteMatchingLocalFiles(
    stateRoot,
    CONVERSATION_STORE_DIRECTORY,
    name => name.startsWith(`.${normalizedName}.json.`) && name.endsWith('.tmp'),
  );
  const legacyPath = resolveInside(
    repoRoot,
    `${LEGACY_SESSION_RELATIVE_PATH}/${normalizedName}.json`,
  );
  let deletedLegacyCount = 0;
  if (existsSync(legacyPath)) {
    const legacyStat = lstatSync(legacyPath);
    if (legacyStat.isSymbolicLink() || !legacyStat.isFile()) {
      throw new Error('legacy conversation deletion target must be a regular non-symlink file');
    }
    rmSync(legacyPath);
    deletedLegacyCount = 1;
  }
  if (deletedSessionCount + deletedExportCount + deletedTemporaryCount + deletedLegacyCount === 0) {
    throw new Error(`conversation session missing: ${normalizedName}`);
  }
  return {
    ok: true,
    sessionName: normalizedName,
    deleted: deletedSessionCount > 0,
    deletedSessionCount,
    deletedExportCount,
    deletedTemporaryCount,
    deletedLegacyCount,
    legacySessionDeleted: deletedLegacyCount > 0,
    externalMutationPerformed: false,
  };
}

export function computeConversationRecordHash(record) {
  const canonical = structuredClone(record);
  delete canonical.recordHash;
  const digest = createHash('sha256').update(canonicalJsonStringify(canonical)).digest('hex');
  return `sha256:${digest}`;
}

function readConversationNexusContract(repoRoot) {
  const contract = readSafeJsonInside(repoRoot, CONVERSATION_NEXUS_CONTRACT_PATH, {
    label: 'SEIS conversation nexus contract',
  });
  if (
    contract.id !== 'seis-conversation-nexus' ||
    contract.status !== 'local-private-runtime' ||
    contract.storage?.storageClass !== 'os-private-state-root' ||
    contract.storage?.repositoryStorageAllowed !== false ||
    contract.storage?.knownSynchronizedFolderAllowed !== false ||
    contract.storage?.atRestEncryptionImplemented !== true ||
    contract.privacy?.providerUploadAllowed !== false ||
    contract.privacy?.githubPublicationAllowed !== false ||
    contract.mcpBoundary?.contentReturned !== false
  ) {
    throw new Error('SEIS conversation nexus contract failed closed');
  }
  return contract;
}

function readConversationRecord(repoRoot, stateRoot, sessionName, options = {}) {
  const record = readPrivateJson(stateRoot, sessionRecordPath(sessionName), {
    label: 'SEIS private conversation session',
    maxBytes: MAX_SESSION_FILE_BYTES,
  });
  validateConversationRecord(repoRoot, record);
  if (record.sessionName !== sessionName) throw new Error('conversation session name mismatch');
  const now = normalizeNow(options.now);
  if (
    options.allowExpired !== true &&
    record.retention.expiresAt !== null &&
    Date.parse(record.retention.expiresAt) <= Date.parse(now)
  ) {
    throw new Error(
      `conversation session expired: ${sessionName}; confirmed local deletion required`,
    );
  }
  return record;
}

function tryReadConversationRecord(repoRoot, stateRoot, sessionName, options = {}) {
  const filePath = resolveStatePath(stateRoot, sessionRecordPath(sessionName));
  return existsSync(filePath)
    ? readConversationRecord(repoRoot, stateRoot, sessionName, options)
    : null;
}

function validateConversationRecord(repoRoot, record) {
  const schema = readSafeJsonInside(repoRoot, CONVERSATION_SESSION_SCHEMA_PATH, {
    label: 'SEIS conversation session schema',
  });
  assertValidJsonSchema(schema);
  const errors = validateJsonSchema(schema, record);
  if (record.recordHash !== computeConversationRecordHash(record)) {
    errors.push('$.recordHash: does not match canonical conversation content');
  }
  if (record.messageCount !== record.messages.length) errors.push('$.messageCount: mismatch');
  for (const [index, message] of record.messages.entries()) {
    if (message.sequence !== index) errors.push(`$.messages[${index}].sequence: mismatch`);
    if (
      message.contentHash !== computeMessageHash(message.sequence, message.role, message.content)
    ) {
      errors.push(`$.messages[${index}].contentHash: mismatch`);
    }
  }
  if (errors.length > 0) {
    throw new Error(`SEIS conversation session failed closed: ${errors.join('; ')}`);
  }
}

function scanConversationStore(repoRoot, stateRoot, options = {}) {
  const directory = resolveStatePath(stateRoot, CONVERSATION_STORE_DIRECTORY);
  if (!existsSync(directory)) {
    return { sessions: [], corruptSessionCount: 0, skippedSymlinkCount: 0 };
  }
  assertPrivateDirectory(directory, 'SEIS conversation store');
  const entries = readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.name.endsWith('.json'))
    .sort((left, right) => left.name.localeCompare(right.name));
  if (entries.length > MAX_SESSION_COUNT) {
    throw new Error(`SEIS conversation store exceeds ${MAX_SESSION_COUNT} sessions`);
  }

  const sessions = [];
  let corruptSessionCount = 0;
  let skippedSymlinkCount = 0;
  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      skippedSymlinkCount += 1;
      continue;
    }
    if (!entry.isFile()) continue;
    const sessionName = entry.name.slice(0, -'.json'.length);
    if (!SESSION_NAME_PATTERN.test(sessionName)) {
      corruptSessionCount += 1;
      continue;
    }
    try {
      const record = readConversationRecord(repoRoot, stateRoot, sessionName, {
        allowExpired: true,
        now: options.now,
      });
      const summary = summarizeConversationRecord(record);
      summary.expired =
        record.retention.expiresAt !== null &&
        Date.parse(record.retention.expiresAt) <= Date.parse(normalizeNow(options.now));
      if (options.includeRecords === true) summary.record = record;
      sessions.push(summary);
    } catch {
      corruptSessionCount += 1;
    }
  }
  return { sessions, corruptSessionCount, skippedSymlinkCount };
}

function summarizeConversationRecord(record) {
  return {
    sessionId: record.id,
    sessionName: record.sessionName,
    status: record.status,
    privacyMode: record.privacyMode,
    providerId: record.provider.id,
    model: record.provider.model,
    messageCount: record.messageCount,
    redactionApplied: record.redaction.applied,
    redactionReplacementCount: record.redaction.replacementCount,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    expiresAt: record.retention.expiresAt,
    recordHash: record.recordHash,
    contentReturned: false,
  };
}

function sanitizeMessages(messages) {
  const state = { replacementCount: 0 };
  const sanitizedMessages = [];
  for (const message of messages) {
    const role = normalizeRole(message.role);
    const visibleText = projectVisibleText(message.content);
    if (visibleText === null || visibleText.trim().length === 0) continue;
    const content = sanitizeString(visibleText, state);
    const sequence = sanitizedMessages.length;
    sanitizedMessages.push({
      sequence,
      role,
      content,
      contentHash: computeMessageHash(sequence, role, content),
    });
  }
  return { messages: sanitizedMessages, replacementCount: state.replacementCount };
}

function projectVisibleText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    if (value.length > MAX_CONTENT_BLOCKS) {
      throw new Error(`conversation content exceeds ${MAX_CONTENT_BLOCKS} blocks`);
    }
    const visible = value
      .filter(
        block =>
          block &&
          typeof block === 'object' &&
          !Array.isArray(block) &&
          block.type === 'text' &&
          typeof block.text === 'string',
      )
      .map(block => block.text);
    return visible.length > 0 ? visible.join('\n') : null;
  }
  throw new TypeError('conversation content must be text or provider text blocks');
}

function sanitizeString(value, state) {
  if (Buffer.byteLength(value, 'utf8') > MAX_STRING_BYTES) {
    throw new Error(`conversation string exceeds ${MAX_STRING_BYTES} bytes`);
  }
  let sanitized = value;
  for (const pattern of STRONG_SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED_SECRET]');
  }
  sanitized = redactSecretText(sanitized, '[REDACTED_SECRET]');
  const homePath = homedir();
  if (homePath && homePath !== path.parse(homePath).root) {
    sanitized = sanitized.split(homePath).join('[REDACTED_HOME]');
  }
  if (sanitized !== value) state.replacementCount += 1;
  return sanitized;
}

function validateIncomingMessageArray(messages) {
  if (!Array.isArray(messages) || messages.length > MAX_MESSAGE_COUNT) {
    throw new Error(`conversation messages must be an array of at most ${MAX_MESSAGE_COUNT} items`);
  }
  for (const [index, message] of messages.entries()) {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      throw new Error(`conversation message ${index} must be an object`);
    }
    normalizeRole(message.role);
    if (!('content' in message)) throw new Error(`conversation message ${index} content missing`);
    projectVisibleText(message.content);
  }
  return messages;
}

function normalizeRole(role) {
  if (!['user', 'assistant'].includes(role)) {
    throw new Error('conversation message role must be user or assistant');
  }
  return role;
}

function normalizeRetention(retention = {}, now) {
  const expiresAt = retention?.expiresAt ?? null;
  const normalizedExpiresAt = expiresAt === null ? null : normalizeNow(expiresAt);
  return {
    mode: 'user-controlled',
    expiresAt: normalizedExpiresAt,
    deletionSupported: true,
    automaticDeletion: false,
    policyReviewedAt: now,
  };
}

function normalizeSearchQuery(query) {
  const normalized = normalizeText(query, 'conversation search query', 200).trim();
  if (normalized.length < 2) throw new Error('conversation search query must contain 2 characters');
  try {
    assertNoCredentialLikeJsonContent(JSON.stringify(normalized), normalized, {
      label: 'conversation search query',
    });
  } catch {
    throw new Error('conversation search query contains blocked credential-like material');
  }
  return normalized;
}

function tokenize(value) {
  return [...new Set(value.toLocaleLowerCase('en-US').match(/[\p{L}\p{N}_-]{2,64}/gu) || [])].slice(
    0,
    8,
  );
}

function scoreText(value, terms) {
  const normalized = String(value || '').toLocaleLowerCase('en-US');
  return terms.reduce((score, term) => score + (normalized.includes(term) ? 1 : 0), 0);
}

function computeMessageHash(sequence, role, content) {
  const digest = createHash('sha256')
    .update(canonicalJsonStringify({ sequence, role, content }))
    .digest('hex');
  return `sha256:${digest}`;
}

function normalizeSessionName(sessionName) {
  if (typeof sessionName !== 'string' || !SESSION_NAME_PATTERN.test(sessionName)) {
    throw new Error(
      'session names must contain 1-64 letters, digits, _ or - and start alphanumeric',
    );
  }
  return sessionName;
}

function normalizeIdentifier(value, label) {
  const normalized = normalizeText(value, label, 128).toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{1,127}$/.test(normalized)) {
    throw new Error(`${label} must be a stable lowercase identifier`);
  }
  return normalized;
}

function normalizeText(value, label, maxLength) {
  if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) {
    throw new Error(`${label} must be a non-empty string up to ${maxLength} characters`);
  }
  return value;
}

function normalizeLimit(value, fallback, minimum, maximum) {
  const normalized = value === undefined ? fallback : Number(value);
  if (!Number.isSafeInteger(normalized) || normalized < minimum || normalized > maximum) {
    throw new Error(`limit must be an integer from ${minimum} to ${maximum}`);
  }
  return normalized;
}

function normalizeNow(value) {
  const date = value === undefined ? new Date() : value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('conversation timestamp is invalid');
  return date.toISOString();
}

function sessionRecordPath(sessionName) {
  return `${CONVERSATION_STORE_DIRECTORY}/${normalizeSessionName(sessionName)}.json`;
}

function writeOwnerOnlyJson(stateRoot, relativePath, value) {
  ensurePrivateDirectory(stateRoot, path.dirname(relativePath));
  const filePath = resolveStatePath(stateRoot, relativePath);
  const directory = path.dirname(filePath);
  if (existsSync(filePath)) {
    assertRegularPrivateFile(filePath, 'conversation output target');
  }

  const lockPath = `${filePath}.lock`;
  const temporaryPath = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`,
  );
  const plaintext = `${JSON.stringify(value, null, 2)}\n`;
  assertNoCredentialLikeJsonContent(plaintext, value, {
    label: 'SEIS private conversation plaintext',
  });
  const serialized = `${JSON.stringify(encryptPrivateJsonEnvelope(stateRoot, value), null, 2)}\n`;
  if (Buffer.byteLength(serialized, 'utf8') > MAX_SESSION_FILE_BYTES) {
    throw new Error(`conversation output exceeds ${MAX_SESSION_FILE_BYTES} bytes`);
  }
  let descriptor = null;
  let lockDescriptor = null;
  try {
    lockDescriptor = openSync(lockPath, 'wx', 0o600);
    descriptor = openSync(temporaryPath, 'wx', 0o600);
    writeFileSync(descriptor, serialized, { encoding: 'utf8' });
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;
    renameSync(temporaryPath, filePath);
    chmodSync(filePath, 0o600);
    fsyncDirectory(directory);
  } catch (error) {
    if (descriptor !== null) closeSync(descriptor);
    if (existsSync(temporaryPath)) rmSync(temporaryPath, { force: true });
    throw error;
  } finally {
    if (lockDescriptor !== null) {
      closeSync(lockDescriptor);
      if (existsSync(lockPath)) rmSync(lockPath, { force: true });
    }
  }
}

function writeOwnerOnlyBytes(stateRoot, relativePath, value) {
  ensurePrivateDirectory(stateRoot, path.dirname(relativePath));
  const filePath = resolveStatePath(stateRoot, relativePath);
  if (existsSync(filePath)) {
    assertRegularPrivateFile(filePath, 'conversation private byte target');
    throw new Error('conversation private byte target already exists');
  }
  let descriptor = null;
  try {
    descriptor = openSync(filePath, 'wx', 0o600);
    writeFileSync(descriptor, value);
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;
    chmodSync(filePath, 0o600);
    fsyncDirectory(path.dirname(filePath));
  } catch (error) {
    if (descriptor !== null) closeSync(descriptor);
    if (existsSync(filePath)) rmSync(filePath, { force: true });
    throw error;
  }
}

function ensurePrivateDirectory(stateRoot, relativeDirectory) {
  const directory = resolveStatePath(stateRoot, relativeDirectory);
  for (const candidate of [stateRoot, directory]) {
    if (existsSync(candidate)) {
      const candidateStat = lstatSync(candidate);
      if (candidateStat.isSymbolicLink() || !candidateStat.isDirectory()) {
        throw new Error('SEIS private storage path must be a non-symlink directory');
      }
    } else {
      mkdirSync(candidate, { recursive: true, mode: 0o700 });
    }
    chmodSync(candidate, 0o700);
  }
  if (!statSync(directory).isDirectory()) throw new Error('SEIS private storage is unavailable');
}

function readPrivateJson(stateRoot, relativePath, options = {}) {
  const label = options.label || 'SEIS private JSON record';
  const maxBytes = options.maxBytes ?? MAX_SESSION_FILE_BYTES;
  const rootPath = resolveStatePath(stateRoot, '.');
  const filePath = resolveStatePath(stateRoot, relativePath);
  assertPrivateDirectory(rootPath, 'SEIS private state root');
  assertPrivateDirectory(path.dirname(filePath), 'SEIS private record directory');
  assertRegularPrivateFile(filePath, label);
  const fileStat = statSync(filePath);
  if (fileStat.size > maxBytes)
    throw new Error(`${label} exceeds the ${maxBytes} byte safety limit`);
  const realRoot = realpathSync(rootPath);
  const realFile = realpathSync(filePath);
  if (!pathContains(realRoot, realFile))
    throw new Error(`${label} resolves outside private state root`);
  const raw = readFileSync(realFile, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${label} contains invalid JSON`);
  }
  assertNoCredentialLikeJsonContent(raw, parsed, { label: `${label} encrypted envelope` });
  const decrypted = decryptPrivateJsonEnvelope(stateRoot, parsed, label);
  assertNoCredentialLikeJsonContent(JSON.stringify(decrypted), decrypted, { label });
  return decrypted;
}

function encryptPrivateJsonEnvelope(stateRoot, value) {
  const key = loadOrCreateConversationVaultKey(stateRoot);
  const plaintext = Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
  const iv = randomBytes(12);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    schemaVersion: 1,
    recordType: ENCRYPTED_ENVELOPE_RECORD_TYPE,
    encryption: {
      algorithm: ENCRYPTION_ALGORITHM,
      keySource: 'owner-only-local-key-file',
      keyId: conversationVaultKeyId(key),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    },
    ciphertext: ciphertext.toString('base64'),
    truthBoundary:
      'Encrypted local SEIS conversation envelope. The local key file remains required for decryption and is not provider upload, GitHub publication, or training approval.',
  };
}

function decryptPrivateJsonEnvelope(stateRoot, envelope, label) {
  if (
    !envelope ||
    typeof envelope !== 'object' ||
    Array.isArray(envelope) ||
    envelope.recordType !== ENCRYPTED_ENVELOPE_RECORD_TYPE ||
    envelope.encryption?.algorithm !== ENCRYPTION_ALGORITHM ||
    envelope.encryption?.keySource !== 'owner-only-local-key-file' ||
    typeof envelope.encryption?.iv !== 'string' ||
    typeof envelope.encryption?.authTag !== 'string' ||
    typeof envelope.encryption?.keyId !== 'string' ||
    typeof envelope.ciphertext !== 'string'
  ) {
    throw new Error(`${label} must be an encrypted SEIS conversation envelope`);
  }
  const key = loadOrCreateConversationVaultKey(stateRoot);
  const keyId = conversationVaultKeyId(key);
  if (!safeEqualText(envelope.encryption.keyId, keyId)) {
    throw new Error(`${label} encrypted envelope key mismatch`);
  }
  try {
    const decipher = createDecipheriv(
      ENCRYPTION_ALGORITHM,
      key,
      Buffer.from(envelope.encryption.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(envelope.encryption.authTag, 'base64'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');
    return JSON.parse(plaintext);
  } catch {
    throw new Error(`${label} encrypted envelope authentication failed`);
  }
}

function loadOrCreateConversationVaultKey(stateRoot) {
  ensurePrivateDirectory(stateRoot, '.');
  const keyPath = resolveStatePath(stateRoot, CONVERSATION_VAULT_KEY_FILENAME);
  if (!existsSync(keyPath)) {
    writeOwnerOnlyBytes(stateRoot, CONVERSATION_VAULT_KEY_FILENAME, randomBytes(32));
  }
  assertRegularPrivateFile(keyPath, 'SEIS conversation vault key');
  const key = readFileSync(keyPath);
  if (key.length !== 32) throw new Error('SEIS conversation vault key must be 32 bytes');
  return key;
}

function conversationVaultKeyId(key) {
  return `sha256:${createHash('sha256').update(key).digest('hex')}`;
}

function safeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function resolveStatePath(stateRoot, relativePath) {
  const root = path.resolve(stateRoot);
  const resolved = path.resolve(root, relativePath);
  if (!pathContains(root, resolved))
    throw new Error('conversation state path escapes private root');
  return resolved;
}

function assertPrivateDirectory(directory, label) {
  const directoryStat = lstatSync(directory);
  if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) {
    throw new Error(`${label} must be a non-symlink directory`);
  }
  assertOwnerOnlyMode(directoryStat, label, 0o700);
}

function assertRegularPrivateFile(filePath, label) {
  const fileStat = lstatSync(filePath);
  if (fileStat.isSymbolicLink() || !fileStat.isFile()) {
    throw new Error(`${label} must be a regular file and not a symbolic link`);
  }
  assertOwnerOnlyMode(fileStat, label, 0o600);
}

function assertOwnerOnlyMode(fileStat, label, expectedMode) {
  if (platform() === 'win32') return;
  if ((fileStat.mode & 0o077) !== 0) {
    throw new Error(`${label} permissions must be owner-only (${expectedMode.toString(8)})`);
  }
}

function deleteMatchingLocalFiles(stateRoot, relativeDirectory, predicate) {
  const directory = resolveStatePath(stateRoot, relativeDirectory);
  if (!existsSync(directory)) return 0;
  assertPrivateDirectory(directory, 'SEIS private deletion directory');
  let deleted = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!predicate(entry.name)) continue;
    if (entry.isSymbolicLink() || !entry.isFile()) {
      throw new Error('conversation deletion encountered a non-regular local copy');
    }
    const filePath = resolveStatePath(stateRoot, `${relativeDirectory}/${entry.name}`);
    assertRegularPrivateFile(filePath, 'conversation local copy');
    rmSync(filePath);
    deleted += 1;
  }
  if (deleted > 0) fsyncDirectory(directory);
  return deleted;
}

function fsyncDirectory(directory) {
  if (platform() === 'win32') return;
  let descriptor = null;
  try {
    descriptor = openSync(directory, 'r');
    fsyncSync(descriptor);
  } finally {
    if (descriptor !== null) closeSync(descriptor);
  }
}

function defaultConversationStateRoot() {
  if (platform() === 'darwin') {
    return path.join(
      homedir(),
      'Library',
      'Application Support',
      'SEIS',
      'private',
      'conversation-nexus-v1',
    );
  }
  if (platform() === 'win32') {
    return path.join(homedir(), 'AppData', 'Local', 'SEIS', 'private', 'conversation-nexus-v1');
  }
  return path.join(homedir(), '.local', 'state', 'seis', 'private', 'conversation-nexus-v1');
}

function canonicalizePotentialPath(candidate) {
  const missing = [];
  let cursor = path.resolve(candidate);
  while (!existsSync(cursor)) {
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    missing.unshift(path.basename(cursor));
    cursor = parent;
  }
  const canonicalBase = existsSync(cursor) ? realpathSync(cursor) : cursor;
  return path.join(canonicalBase, ...missing);
}

function pathContains(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function countSessionFiles(repoRoot, relativeDirectory) {
  const directory = resolveInside(repoRoot, relativeDirectory);
  if (!existsSync(directory)) return 0;
  const directoryStat = lstatSync(directory);
  if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) return 0;
  return readdirSync(directory, { withFileTypes: true }).filter(
    entry => entry.isFile() && entry.name.endsWith('.json'),
  ).length;
}

function shortHash(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 24);
}
