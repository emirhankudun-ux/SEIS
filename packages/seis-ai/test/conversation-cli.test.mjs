import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CONVERSATION_NEXUS_CONTRACT_PATH,
  CONVERSATION_SESSION_SCHEMA_PATH,
  saveConversationSession,
} from '../src/memory/conversation-store.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = path.resolve(packageRoot, '..', '..');
const conversationCli = path.join(packageRoot, 'bin', 'seis-conversations.mjs');
const agentCli = path.join(packageRoot, 'bin', 'seis-agent.mjs');
let fixture = null;

afterEach(() => {
  if (fixture) rmSync(fixture.temporaryRoot, { recursive: true, force: true });
  fixture = null;
});

describe('SEIS Conversation Nexus CLIs', () => {
  it('reports metadata and requires exact confirmation for local export and delete', () => {
    fixture = makeFixture();
    seedSession(fixture);

    const statusResult = runConversationCli(fixture, ['status', '--include-sessions']);
    assert.equal(statusResult.status, 0, statusResult.stderr);
    const status = JSON.parse(statusResult.stdout);
    assert.equal(status.sessionCount, 1);
    assert.equal(status.sessions[0].contentReturned, false);
    assert.equal(statusResult.stdout.includes('private visible canary'), false);

    const deniedExport = runConversationCli(fixture, ['export', '--session', 'cli-test']);
    assert.equal(deniedExport.status, 1);
    assert.match(deniedExport.stderr, /--confirm is required/);

    const exportResult = runConversationCli(fixture, [
      'export',
      '--session',
      'cli-test',
      '--confirm',
      'cli-test',
    ]);
    assert.equal(exportResult.status, 0, exportResult.stderr);
    const exported = JSON.parse(exportResult.stdout);
    assert.equal(existsSync(path.join(fixture.stateRoot, exported.relativeStatePath)), true);

    const deleteResult = runConversationCli(fixture, [
      'delete',
      '--session',
      'cli-test',
      '--confirm',
      'cli-test',
    ]);
    assert.equal(deleteResult.status, 0, deleteResult.stderr);
    const deleted = JSON.parse(deleteResult.stdout);
    assert.equal(deleted.deletedSessionCount, 1);
    assert.equal(deleted.deletedExportCount, 1);
  });

  it('refuses implicit legacy migration and stored-history provider upload before network use', () => {
    fixture = makeFixture();
    const legacyPath = path.join(fixture.repoRoot, '.seis', 'sessions', 'legacy.json');
    mkdirSync(path.dirname(legacyPath), { recursive: true });
    writeFileSync(
      legacyPath,
      `${JSON.stringify({
        model: 'claude-test',
        messages: [{ role: 'user', content: 'legacy visible canary' }],
      })}\n`,
      'utf8',
    );

    const legacyResult = runAgentCli(fixture, ['--session', 'legacy', 'do not call network']);
    assert.equal(legacyResult.status, 2);
    assert.match(legacyResult.stderr, /requires explicit migration/);
    assert.equal(legacyResult.stderr.includes('legacy visible canary'), false);

    seedSession(fixture);
    const resumeResult = runAgentCli(fixture, ['--session', 'cli-test', 'do not call network']);
    assert.equal(resumeResult.status, 2);
    assert.match(resumeResult.stderr, /--approve-session-upload cli-test/);
    assert.equal(resumeResult.stderr.includes('private visible canary'), false);
  });
});

function makeFixture() {
  const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'seis-conversation-cli-'));
  const repoRoot = path.join(temporaryRoot, 'repo');
  const stateRoot = path.join(temporaryRoot, 'private-state');
  mkdirSync(repoRoot, { recursive: true });
  for (const relativePath of [CONVERSATION_NEXUS_CONTRACT_PATH, CONVERSATION_SESSION_SCHEMA_PATH]) {
    const target = path.join(repoRoot, relativePath);
    mkdirSync(path.dirname(target), { recursive: true });
    cpSync(path.join(workspaceRoot, relativePath), target);
  }
  return { temporaryRoot, repoRoot, stateRoot };
}

function seedSession(target) {
  saveConversationSession(target.repoRoot, {
    stateRoot: target.stateRoot,
    sessionName: 'cli-test',
    providerId: 'anthropic',
    model: 'claude-test',
    messages: [{ role: 'user', content: 'private visible canary' }],
    now: '2026-07-12T12:00:00Z',
  });
}

function runConversationCli(target, args) {
  return spawnSync(process.execPath, [conversationCli, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
    env: safeEnvironment(target),
  });
}

function runAgentCli(target, args) {
  return spawnSync(process.execPath, [agentCli, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
    env: {
      ...safeEnvironment(target),
      ANTHROPIC_API_KEY: `sk-ant-${'T'.repeat(32)}`,
    },
  });
}

function safeEnvironment(target) {
  const environment = { ...process.env };
  delete environment.SEIS_CONVERSATION_MCP_METADATA;
  return {
    ...environment,
    SEIS_REPO_ROOT: target.repoRoot,
    SEIS_CONVERSATION_STATE_DIR: target.stateRoot,
  };
}
