import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CONVERSATION_EXPORT_DIRECTORY,
  CONVERSATION_NEXUS_CONTRACT_PATH,
  CONVERSATION_SESSION_SCHEMA_PATH,
  CONVERSATION_STORE_DIRECTORY,
  CONVERSATION_VAULT_KEY_FILENAME,
  computeConversationRecordHash,
  conversationNexusStatus,
  deleteConversationSession,
  exportConversationSession,
  migrateLegacyConversationSession,
  readConversationHistory,
  resolveConversationStateRoot,
  saveConversationSession,
  searchConversationSessions,
} from '../src/memory/conversation-store.mjs';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const fixedNow = '2026-07-12T12:00:00.000Z';
let temporaryRoot = null;
let temporaryStateRoot = null;

afterEach(() => {
  if (temporaryRoot) rmSync(temporaryRoot, { recursive: true, force: true });
  temporaryRoot = null;
  temporaryStateRoot = null;
});

describe('SEIS Conversation Nexus local-private store', () => {
  it('persists visible text only with canonical hashes and owner-only modes', () => {
    const root = makeWorkspace();
    const summary = saveConversationSession(root, sessionInput());
    const loaded = readConversationHistory(root, 'architecture', stateOptions());
    const recordPath = path.join(
      temporaryStateRoot,
      CONVERSATION_STORE_DIRECTORY,
      'architecture.json',
    );
    const keyPath = path.join(temporaryStateRoot, CONVERSATION_VAULT_KEY_FILENAME);
    const raw = readFileSync(recordPath, 'utf8');

    assert.equal(summary.messageCount, 3);
    assert.equal(loaded.source, 'conversation-nexus');
    assert.equal(loaded.messages.length, 3);
    assert.equal(typeof loaded.messages[1].content, 'string');
    assert.equal(JSON.stringify(loaded).includes('tool_use'), false);
    assert.equal(JSON.stringify(loaded).includes('tool_result'), false);
    assert.equal(JSON.stringify(loaded).includes('signature'), false);
    assert.equal(loaded.record.recordHash, computeConversationRecordHash(loaded.record));
    assert.equal(loaded.record.consent.providerUploadAllowed, false);
    assert.equal(loaded.record.consent.githubPublicationAllowed, false);
    assert.match(raw, /seis-encrypted-conversation-envelope/);
    assert.equal(raw.includes('Prepare architecture evidence'), false);
    assert.equal(raw.includes('Architecture evidence is ready'), false);
    if (process.platform !== 'win32') {
      assert.equal(statSync(recordPath).mode & 0o777, 0o600);
      assert.equal(statSync(keyPath).mode & 0o777, 0o600);
      assert.equal(statSync(path.dirname(recordPath)).mode & 0o777, 0o700);
    }
    assert.deepEqual(
      readdirSync(path.dirname(recordPath)).filter(name => name.endsWith('.tmp')),
      [],
    );
  });

  it('redacts credential-shaped visible text and drops tool payloads before disk write', () => {
    const root = makeWorkspace();
    const messages = sessionInput().messages;
    messages[0].content = `use github_pat_${'A'.repeat(24)} and Bearer ${'B'.repeat(24)}`;
    messages[1].content[0].input = {
      token: `sk-ant-${'C'.repeat(24)}`,
      nested: { password: 'synthetic-password-value' },
    };
    messages[1].content.push({
      type: 'text',
      text: `api_key=synthetic-visible-value and ["X-API-Key", "${'Z'.repeat(24)}"]`,
    });
    const summary = saveConversationSession(root, { ...sessionInput(), messages });
    const raw = readFileSync(
      path.join(temporaryStateRoot, CONVERSATION_STORE_DIRECTORY, 'architecture.json'),
      'utf8',
    );
    const resumed = readConversationHistory(root, 'architecture', stateOptions());

    assert.equal(summary.redactionApplied, true);
    assert.ok(summary.redactionReplacementCount >= 2);
    assert.equal(raw.includes('github_pat_'), false);
    assert.equal(raw.includes('sk-ant-'), false);
    assert.equal(raw.includes('synthetic-password-value'), false);
    assert.equal(raw.includes('synthetic-visible-value'), false);
    assert.equal(raw.includes('Z'.repeat(24)), false);
    assert.equal(raw.includes('toolu_test'), false);
    assert.equal(raw.includes('REDACTED'), false);
    assert.equal(JSON.stringify(resumed).includes('[REDACTED_SECRET]'), true);
    assert.equal(
      resumed.messages.every(message => typeof message.content === 'string'),
      true,
    );
  });

  it('searches private content locally but returns metadata without excerpts or message bodies', () => {
    const root = makeWorkspace();
    saveConversationSession(root, sessionInput());
    saveConversationSession(root, {
      ...sessionInput(),
      sessionName: 'design',
      messages: [{ role: 'user', content: 'Review typography and accessibility tokens.' }],
    });

    const result = searchConversationSessions(root, {
      ...stateOptions(),
      query: 'architecture evidence',
      limit: 5,
    });
    assert.equal(result.ok, true);
    assert.equal(result.resultCount, 1);
    assert.equal(result.results[0].sessionName, 'architecture');
    assert.equal(result.results[0].contentReturned, false);
    assert.equal('messages' in result.results[0], false);
    assert.equal('query' in result, false);
    assert.equal('terms' in result, false);
    assert.match(result.queryHash, /^sha256:[a-f0-9]{64}$/);
    assert.equal(JSON.stringify(result).includes('Prepare architecture evidence'), false);
  });

  it('rejects credential-shaped search input instead of indexing or echoing it', () => {
    const root = makeWorkspace();
    saveConversationSession(root, sessionInput());
    assert.throws(
      () =>
        searchConversationSessions(root, {
          ...stateOptions(),
          query: `github_pat_${'D'.repeat(24)}`,
        }),
      /blocked credential-like material/,
    );
  });

  it('reports counts and explicit no-provider/no-mutation boundaries', () => {
    const root = makeWorkspace();
    saveConversationSession(root, sessionInput());
    const status = conversationNexusStatus(root, {
      ...stateOptions(),
      includeSessions: true,
    });

    assert.equal(status.ok, true);
    assert.equal(status.status, 'local-private-runtime');
    assert.equal(status.sessionCount, 1);
    assert.equal(status.messageCount, 3);
    assert.equal(status.sessions[0].contentReturned, false);
    assert.equal(status.providerCallsPerformed, false);
    assert.equal(status.externalMutationPerformed, false);
    assert.equal(status.privacy.providerUploadAllowed, false);
  });

  it('migrates a legacy session only when explicitly requested and preserves the source file', () => {
    const root = makeWorkspace();
    const legacyPath = path.join(root, '.seis/sessions/legacy.json');
    mkdirSync(path.dirname(legacyPath), { recursive: true });
    writeFileSync(
      legacyPath,
      `${JSON.stringify({ model: 'claude-test', messages: sessionInput().messages }, null, 2)}\n`,
      'utf8',
    );

    const legacy = readConversationHistory(root, 'legacy', {
      ...stateOptions(),
      allowLegacy: true,
    });
    assert.equal(legacy.source, 'legacy-session');
    const migrated = migrateLegacyConversationSession(root, 'legacy', stateOptions());
    assert.equal(migrated.sessionName, 'legacy');
    assert.equal(existsSync(legacyPath), true);
    assert.equal(
      readConversationHistory(root, 'legacy', stateOptions()).source,
      'conversation-nexus',
    );
  });

  it('fails closed on corrupt records and skips symlinked session entries', () => {
    const root = makeWorkspace();
    saveConversationSession(root, sessionInput());
    const store = path.join(temporaryStateRoot, CONVERSATION_STORE_DIRECTORY);
    writeFileSync(path.join(store, 'corrupt.json'), '{not-json', 'utf8');
    symlinkSync(path.join(store, 'architecture.json'), path.join(store, 'linked.json'));

    const status = conversationNexusStatus(root, stateOptions());
    assert.equal(status.ok, true);
    assert.equal(status.sessionCount, 1);
    assert.equal(status.corruptSessionCount, 1);
    assert.equal(status.skippedSymlinkCount, 1);
    assert.throws(() => readConversationHistory(root, 'linked', stateOptions()), /symbolic link/);
  });

  it('requires exact export/delete confirmation and cascades local copies', () => {
    const root = makeWorkspace();
    saveConversationSession(root, sessionInput());
    assert.throws(
      () => exportConversationSession(root, 'architecture', stateOptions()),
      /exact session-name confirmation/,
    );
    const exported = exportConversationSession(root, 'architecture', {
      ...stateOptions(),
      confirmation: 'architecture',
    });
    const exportPath = path.join(temporaryStateRoot, exported.relativeStatePath);

    assert.equal(exported.relativeStatePath.startsWith(`${CONVERSATION_EXPORT_DIRECTORY}/`), true);
    assert.equal(exported.encryptedAtRest, true);
    assert.equal(existsSync(exportPath), true);
    const exportEnvelope = JSON.parse(readFileSync(exportPath, 'utf8'));
    assert.equal(exportEnvelope.recordType, 'seis-encrypted-conversation-envelope');
    assert.equal(exportEnvelope.encryption.algorithm, 'aes-256-gcm');
    assert.equal(readFileSync(exportPath, 'utf8').includes('conversation-session-local-export'), false);
    if (process.platform !== 'win32') assert.equal(statSync(exportPath).mode & 0o777, 0o600);
    assert.throws(
      () => deleteConversationSession(root, 'architecture', { confirmation: 'wrong' }),
      /exact session-name confirmation/,
    );
    assert.equal(
      deleteConversationSession(root, 'architecture', {
        ...stateOptions(),
        confirmation: 'architecture',
      }).deleted,
      true,
    );
    assert.equal(existsSync(exportPath), false);
    assert.equal(readConversationHistory(root, 'architecture', stateOptions()), null);
  });

  it('rejects traversal names, oversized strings, and tampered record hashes', () => {
    const root = makeWorkspace();
    assert.throws(() => saveConversationSession(root, sessionInput('../escape')), /session names/);
    assert.throws(
      () =>
        saveConversationSession(root, {
          ...sessionInput(),
          messages: [{ role: 'user', content: 'x'.repeat(256 * 1024 + 1) }],
        }),
      /string exceeds/,
    );

    saveConversationSession(root, sessionInput());
    const recordPath = path.join(
      temporaryStateRoot,
      CONVERSATION_STORE_DIRECTORY,
      'architecture.json',
    );
    const envelope = JSON.parse(readFileSync(recordPath, 'utf8'));
    envelope.ciphertext = `${envelope.ciphertext.slice(0, -4)}AAAA`;
    writeFileSync(recordPath, `${JSON.stringify(envelope, null, 2)}\n`, 'utf8');
    assert.throws(
      () => readConversationHistory(root, 'architecture', stateOptions()),
      /authentication failed/,
    );
  });

  it('rejects repository and known synchronized state roots', () => {
    const root = makeWorkspace();
    assert.throws(
      () =>
        resolveConversationStateRoot({
          repoRoot: root,
          stateRoot: path.join(root, 'private-conversations'),
        }),
      /outside the repository/,
    );
    assert.throws(
      () =>
        resolveConversationStateRoot({
          repoRoot: root,
          stateRoot: path.join(tmpdir(), 'Dropbox', 'seis-conversations'),
        }),
      /known synchronized folder/,
    );
  });

  it('preserves retention and blocks expired read, search, resume, and export', () => {
    const root = makeWorkspace();
    saveConversationSession(root, {
      ...sessionInput(),
      retention: { expiresAt: '2026-07-12T13:00:00Z' },
    });
    saveConversationSession(root, {
      ...sessionInput(),
      now: '2026-07-12T12:30:00Z',
    });
    const beforeExpiry = readConversationHistory(
      root,
      'architecture',
      stateOptions('2026-07-12T12:45:00Z'),
    );
    assert.equal(beforeExpiry.record.retention.expiresAt, '2026-07-12T13:00:00.000Z');

    const expiredOptions = stateOptions('2026-07-12T14:00:00Z');
    assert.throws(
      () => readConversationHistory(root, 'architecture', expiredOptions),
      /session expired/,
    );
    const search = searchConversationSessions(root, {
      ...expiredOptions,
      query: 'architecture',
    });
    assert.equal(search.resultCount, 0);
    assert.throws(
      () =>
        exportConversationSession(root, 'architecture', {
          ...expiredOptions,
          confirmation: 'architecture',
        }),
      /session expired/,
    );
  });

  it('rejects broad file permissions and preserves a competing write lock', () => {
    const root = makeWorkspace();
    saveConversationSession(root, sessionInput());
    const recordPath = path.join(
      temporaryStateRoot,
      CONVERSATION_STORE_DIRECTORY,
      'architecture.json',
    );
    if (process.platform !== 'win32') {
      chmodSync(recordPath, 0o644);
      assert.throws(
        () => readConversationHistory(root, 'architecture', stateOptions()),
        /owner-only/,
      );
      chmodSync(recordPath, 0o600);
    }
    const lockPath = `${recordPath}.lock`;
    writeFileSync(lockPath, 'held\n', { encoding: 'utf8', mode: 0o600 });
    assert.throws(() => saveConversationSession(root, sessionInput()), /EEXIST|exist/i);
    assert.equal(existsSync(lockPath), true);
  });

  it('fails closed when the repository privacy contract is weakened', () => {
    const root = makeWorkspace();
    const contractPath = path.join(root, CONVERSATION_NEXUS_CONTRACT_PATH);
    const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
    contract.privacy.providerUploadAllowed = true;
    writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');

    const status = conversationNexusStatus(root, stateOptions());
    assert.equal(status.ok, false);
    assert.equal(status.status, 'invalid-fail-closed');
    assert.equal(status.providerCallsPerformed, false);
  });
});

function makeWorkspace() {
  temporaryRoot = mkdtempSync(path.join(tmpdir(), 'seis-conversation-nexus-'));
  const repoRoot = path.join(temporaryRoot, 'repo');
  temporaryStateRoot = path.join(temporaryRoot, 'private-state');
  mkdirSync(repoRoot, { recursive: true });
  for (const relativePath of [CONVERSATION_NEXUS_CONTRACT_PATH, CONVERSATION_SESSION_SCHEMA_PATH]) {
    const source = path.join(workspaceRoot, relativePath);
    const target = path.join(repoRoot, relativePath);
    mkdirSync(path.dirname(target), { recursive: true });
    cpSync(source, target);
  }
  return repoRoot;
}

function stateOptions(now = fixedNow) {
  return { stateRoot: temporaryStateRoot, now };
}

function sessionInput(sessionName = 'architecture') {
  return {
    stateRoot: temporaryStateRoot,
    sessionName,
    providerId: 'anthropic',
    model: 'claude-test',
    liveProviderUsed: true,
    now: fixedNow,
    messages: [
      { role: 'user', content: 'Prepare architecture evidence and release boundaries.' },
      {
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'Architecture evidence is ready for bounded review.',
          },
          {
            type: 'tool_use',
            id: 'toolu_test',
            name: 'read_file',
            input: { file: 'docs/ARCHITECTURE.md' },
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Continue with the explicit release boundary.',
          },
          {
            type: 'tool_result',
            tool_use_id: 'toolu_test',
            content: 'Architecture evidence loaded.',
          },
        ],
      },
      {
        role: 'assistant',
        content: [
          {
            type: 'thinking',
            thinking: 'private chain of thought',
            signature: 'private-signature',
          },
        ],
      },
    ],
  };
}
