#!/usr/bin/env node

import { resolveRepoRoot } from '../src/lib/repo.mjs';
import { redactSecretText } from '../src/lib/redaction.mjs';
import {
  conversationNexusStatus,
  deleteConversationSession,
  exportConversationSession,
  migrateLegacyConversationSession,
  searchConversationSessions,
} from '../src/memory/conversation-store.mjs';

function usage() {
  console.log(`seis-conversations - local-private SEIS Conversation Nexus control

Usage:
  seis-conversations status [--include-sessions]
  seis-conversations search --query "text" [--limit 10]
  seis-conversations export --session <name> --confirm <name>
  seis-conversations migrate --session <name>
  seis-conversations delete --session <name> --confirm <name>

Rules:
  - No command calls an AI provider or network service.
  - Search returns matching session metadata, never message bodies.
  - Export writes an owner-only local file under the OS-private SEIS state root.
  - Export and delete require an exact session-name confirmation.
  - Legacy migration is explicit and never deletes the legacy file.`);
}

const args = process.argv.slice(2);
const command = args.shift();
const options = parseOptions(args);
if (!command || options.help) {
  usage();
  process.exit(command ? 0 : 2);
}

const repoRoot = resolveRepoRoot();
const stateRoot = process.env.SEIS_CONVERSATION_STATE_DIR || undefined;

try {
  let result;
  switch (command) {
    case 'status':
      result = conversationNexusStatus(repoRoot, {
        stateRoot,
        includeSessions: options.includeSessions === true,
      });
      break;
    case 'search':
      result = searchConversationSessions(repoRoot, {
        stateRoot,
        query: requiredString(options.query, '--query'),
        limit: options.limit === undefined ? undefined : Number(options.limit),
      });
      break;
    case 'export':
      result = exportConversationSession(repoRoot, requiredString(options.session, '--session'), {
        stateRoot,
        confirmation: requiredString(options.confirm, '--confirm'),
      });
      break;
    case 'migrate':
      result = migrateLegacyConversationSession(
        repoRoot,
        requiredString(options.session, '--session'),
        { stateRoot },
      );
      break;
    case 'delete':
      result = deleteConversationSession(repoRoot, requiredString(options.session, '--session'), {
        stateRoot,
        confirmation: requiredString(options.confirm, '--confirm'),
      });
      break;
    default:
      usage();
      process.exit(2);
  }
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(`seis-conversations: ${safeErrorMessage(error)}`);
  process.exit(1);
}

function safeErrorMessage(error) {
  const redacted = redactSecretText(String(error?.message || 'operation rejected'));
  return redacted.includes('/') || redacted.includes('\\')
    ? `operation rejected (${error?.name || 'Error'})`
    : redacted.slice(0, 240);
}

function parseOptions(values) {
  const options = {};
  for (let index = 0; index < values.length; index += 1) {
    const argument = values[index];
    if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--include-sessions') options.includeSessions = true;
    else if (['--query', '--limit', '--session', '--confirm'].includes(argument)) {
      const value = values[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
      options[argument.slice(2)] = value;
      index += 1;
    } else {
      throw new Error(`unknown option: ${argument}`);
    }
  }
  return options;
}

function requiredString(value, flag) {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${flag} is required`);
  return value;
}
