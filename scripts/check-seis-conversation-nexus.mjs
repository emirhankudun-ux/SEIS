#!/usr/bin/env node

import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  CONVERSATION_NEXUS_CONTRACT_PATH,
  CONVERSATION_NEXUS_RESOURCE_URI,
  CONVERSATION_ENVELOPE_SCHEMA_PATH,
  CONVERSATION_SEARCH_TOOL,
  CONVERSATION_SESSION_SCHEMA_PATH,
  CONVERSATION_STATUS_TOOL,
  conversationNexusStatus,
} from '../packages/seis-ai/src/memory/conversation-store.mjs';
import { assertValidJsonSchema } from '../packages/seis-ai/src/model/json-schema-validation.mjs';

const root = process.cwd();
const failures = [];
const paths = {
  packageJson: 'package.json',
  aiPackageJson: 'packages/seis-ai/package.json',
  aiPackageLock: 'packages/seis-ai/package-lock.json',
  manifest: 'content/development/seis-agent-plugin-integration.json',
  mcpContract: 'content/development/seis-ai-core-mcp-runtime-contract.json',
  schemaRegistry: 'content/development/seis-data-schema-registry.json',
  runtime: 'packages/seis-ai/src/memory/conversation-store.mjs',
  cli: 'packages/seis-ai/bin/seis-conversations.mjs',
  agentCli: 'packages/seis-ai/bin/seis-agent.mjs',
  agentTools: 'packages/seis-ai/src/agent/tools.mjs',
  agentLoop: 'packages/seis-ai/src/agent/loop.mjs',
  mcpServer: 'packages/seis-ai/src/mcp/server.mjs',
  tests: 'packages/seis-ai/test/conversation-store.test.mjs',
  cliTests: 'packages/seis-ai/test/conversation-cli.test.mjs',
  agentTests: 'packages/seis-ai/test/agent.test.mjs',
  mcpTests: 'packages/seis-ai/test/mcp-smoke.test.mjs',
  docs: 'docs/ai/conversation-nexus.md',
  docsIndex: 'docs/INDEX.md',
  statusDocs: 'docs/STATUS.md',
  platformDocs: 'docs/platform/seis-agent-plugin-integration.md',
  gitignore: '.gitignore',
};

for (const relativePath of [
  CONVERSATION_NEXUS_CONTRACT_PATH,
  CONVERSATION_SESSION_SCHEMA_PATH,
  CONVERSATION_ENVELOPE_SCHEMA_PATH,
  ...Object.values(paths),
]) {
  ensureFile(relativePath);
}

const status = conversationNexusStatus(root, {
  stateRoot: path.join(tmpdir(), `seis-conversation-check-${process.pid}-${Date.now()}`),
  includeContract: true,
});
ensure(status.ok === true, `conversation nexus status failed closed: ${status.error || 'unknown'}`);
ensure(status.tool === CONVERSATION_STATUS_TOOL, 'conversation status tool id mismatch');
ensure(
  status.resourceUri === CONVERSATION_NEXUS_RESOURCE_URI,
  'conversation resource URI mismatch',
);
ensure(status.status === 'local-private-runtime', 'conversation runtime status mismatch');
ensure(status.runtimeAuthority === false, 'conversation runtime authority must remain false');
ensure(status.providerCallsPerformed === false, 'conversation status must not call a provider');
ensure(
  status.externalMutationPerformed === false,
  'conversation status must not mutate externally',
);

const contract = status.contract || {};
ensure(contract.id === 'seis-conversation-nexus', 'conversation contract id mismatch');
ensure(contract.status === 'local-private-runtime', 'conversation contract status mismatch');
ensure(contract.privacy?.providerUploadAllowed === false, 'provider upload must remain forbidden');
ensure(
  contract.privacy?.githubPublicationAllowed === false,
  'GitHub publication must remain forbidden',
);
ensure(
  contract.privacy?.trainingUseAllowed === false,
  'conversation training use must remain forbidden',
);
ensure(
  contract.storage?.storageClass === 'os-private-state-root',
  'OS-private storage class mismatch',
);
ensure(
  contract.storage?.repositoryStorageAllowed === false,
  'repository storage must remain forbidden',
);
ensure(
  contract.storage?.knownSynchronizedFolderAllowed === false,
  'known synchronized-folder storage must remain forbidden',
);
ensure(
  contract.storage?.atRestEncryptionImplemented === true,
  'at-rest encryption must be implemented for Conversation Nexus',
);
ensure(
  contract.storage?.atRestEncryption?.algorithm === 'aes-256-gcm',
  'conversation encryption algorithm must be aes-256-gcm',
);
ensure(
  contract.storage?.atRestEncryption?.keySource === 'owner-only-local-key-file',
  'conversation encryption key source must be owner-only local key file',
);
ensure(
  contract.storage?.atRestEncryption?.plaintextSessionFilesAllowed === false,
  'plaintext conversation session files must remain forbidden',
);
ensure(
  contract.retention?.exportEncryptionAtRestImplemented === true,
  'conversation exports must be encrypted at rest',
);
ensure(
  contract.retention?.expiredReadSearchResumeExportAllowed === false,
  'expired sessions must remain unavailable',
);
ensure(
  contract.importBoundary?.externalImportRuntimeEnabled === false,
  'external import must remain disabled',
);
ensure(
  contract.importBoundary?.allChatsAlreadyImportedClaimed === false,
  'all-chat import claim must remain false',
);
ensure(contract.mcpBoundary?.registrationVerified === true, 'MCP registration must be verified');
ensure(
  contract.mcpBoundary?.enabledByDefault === false,
  'MCP metadata must remain disabled by default',
);
ensure(
  contract.mcpBoundary?.cloudAgentToolRegistration === false,
  'cloud agent tools must remain absent',
);
ensure(contract.mcpBoundary?.contentReturned === false, 'MCP content return must remain false');
ensure(contract.mcpBoundary?.writeToolsExposed === false, 'MCP write tools must remain absent');
ensure(
  contract.mcpBoundary?.tools?.length === 2,
  'exactly two conversation MCP tools are required',
);
ensure(
  contract.mcpBoundary?.tools?.some(tool => tool.name === CONVERSATION_STATUS_TOOL),
  'conversation status tool missing from contract',
);
ensure(
  contract.mcpBoundary?.tools?.some(tool => tool.name === CONVERSATION_SEARCH_TOOL),
  'conversation search tool missing from contract',
);
ensure(
  contract.mcpBoundary?.resources?.length === 1 &&
    contract.mcpBoundary.resources[0]?.uri === CONVERSATION_NEXUS_RESOURCE_URI,
  'conversation contract must expose one repository-safe MCP resource',
);
ensure(
  (contract.sourceAdapters || [])
    .filter(adapter => adapter.id !== 'seis-agent-cli-session')
    .every(
      adapter => adapter.runtimeEnabled === false && adapter.status === 'planned-approval-gated',
    ),
  'external source adapters must remain planned and disabled',
);

const schema = readJson(CONVERSATION_SESSION_SCHEMA_PATH);
try {
  assertValidJsonSchema(schema);
} catch (error) {
  failures.push(`invalid conversation session schema: ${error.message}`);
}
ensure(
  schema?.$schema === 'https://json-schema.org/draft/2020-12/schema',
  'schema dialect mismatch',
);
ensure(schema?.type === 'object', 'conversation schema root must be an object');
ensure(
  schema?.additionalProperties === false,
  'conversation schema must reject extra root properties',
);
ensure(schema?.properties?.messages?.maxItems === 2048, 'conversation message limit mismatch');
ensure(schema?.$defs?.hash?.pattern === '^sha256:[a-f0-9]{64}$', 'record hash pattern mismatch');
ensure(schema?.$defs?.contentValue?.type === 'string', 'only visible text may be persisted');

const envelopeSchema = readJson(CONVERSATION_ENVELOPE_SCHEMA_PATH);
try {
  assertValidJsonSchema(envelopeSchema);
} catch (error) {
  failures.push(`invalid conversation envelope schema: ${error.message}`);
}
ensure(
  envelopeSchema?.$schema === 'https://json-schema.org/draft/2020-12/schema',
  'envelope schema dialect mismatch',
);
ensure(
  envelopeSchema?.additionalProperties === false,
  'conversation envelope schema must reject extra root properties',
);
ensure(
  envelopeSchema?.properties?.recordType?.const === 'seis-encrypted-conversation-envelope',
  'conversation envelope record type mismatch',
);
ensure(
  envelopeSchema?.properties?.encryption?.properties?.algorithm?.const === 'aes-256-gcm',
  'conversation envelope algorithm mismatch',
);

const packageJson = readJson(paths.packageJson);
const aiPackageJson = readJson(paths.aiPackageJson);
const aiPackageLock = readJson(paths.aiPackageLock);
ensure(
  packageJson?.scripts?.['check:seis-conversation-nexus'] ===
    'node scripts/check-seis-conversation-nexus.mjs',
  'root package must expose the conversation checker',
);
ensure(
  packageJson?.scripts?.['seis:conversations'] ===
    'node packages/seis-ai/bin/seis-conversations.mjs',
  'root package must expose the conversation CLI',
);
ensure(
  String(packageJson?.scripts?.['quality:governance'] || '').includes(
    'check:seis-conversation-nexus',
  ),
  'quality:governance must include the conversation checker',
);
ensure(
  aiPackageJson?.bin?.['seis-conversations'] === 'bin/seis-conversations.mjs',
  'AI package bin must expose seis-conversations',
);
ensure(
  aiPackageJson?.scripts?.conversations === 'node bin/seis-conversations.mjs',
  'AI package scripts must expose conversations',
);
ensure(
  aiPackageLock?.packages?.['']?.bin?.['seis-conversations'] === 'bin/seis-conversations.mjs',
  'AI package lock must bind seis-conversations',
);

const manifest = readJson(paths.manifest);
ensure(
  manifest?.runtimeIntegration?.conversationStatusTool === CONVERSATION_STATUS_TOOL,
  'plugin manifest must expose the conversation status tool',
);
ensure(
  manifest?.runtimeIntegration?.conversationSearchTool === CONVERSATION_SEARCH_TOOL,
  'plugin manifest must expose the conversation search tool',
);
ensure(
  manifest?.runtimeIntegration?.conversationMetadataEnabledByDefault === false,
  'plugin manifest must keep conversation metadata disabled by default',
);
ensure(
  manifest?.runtimeIntegration?.cloudAgentConversationTools === false,
  'plugin manifest must keep conversation tools out of cloud agent loops',
);
ensure(
  manifest?.runtimeIntegration?.mcpResources?.includes(CONVERSATION_NEXUS_RESOURCE_URI),
  'plugin manifest must expose the conversation resource',
);
ensure(
  manifest?.qualityCommands?.includes('npm run check:seis-conversation-nexus'),
  'plugin manifest must include the conversation quality command',
);

const mcpContract = readJson(paths.mcpContract);
ensure(mcpContract?.toolCount === 39, 'MCP contract must record 39 tools');
ensure(mcpContract?.resourceCount === 33, 'MCP contract must record 33 resources');
ensure(
  mcpContract?.surfaces?.find(surface => surface.id === 'tools')?.count === 39,
  'MCP tool surface count must be 39',
);
ensure(
  mcpContract?.surfaces?.find(surface => surface.id === 'resources')?.count === 33,
  'MCP resource surface count must be 33',
);

const schemaRegistry = readJson(paths.schemaRegistry);
const registeredPaths = new Set((schemaRegistry?.records || []).map(record => record.path));
ensure(
  registeredPaths.has(CONVERSATION_NEXUS_CONTRACT_PATH),
  'data schema registry missing conversation contract',
);
ensure(
  registeredPaths.has(CONVERSATION_SESSION_SCHEMA_PATH),
  'data schema registry missing conversation schema',
);
ensure(
  registeredPaths.has(CONVERSATION_ENVELOPE_SCHEMA_PATH),
  'data schema registry missing conversation envelope schema',
);

const sourceChecks = [
  [paths.runtime, 'writeOwnerOnlyJson'],
  [paths.runtime, 'seis-encrypted-conversation-envelope'],
  [paths.runtime, 'aes-256-gcm'],
  [paths.runtime, 'conversation-vault.key'],
  [paths.runtime, 'projectVisibleText'],
  [paths.runtime, 'known synchronized folder'],
  [paths.runtime, 'fsyncDirectory'],
  [paths.runtime, 'contentReturned: false'],
  [paths.cli, 'delete --session <name> --confirm <name>'],
  [paths.cli, 'export --session <name> --confirm <name>'],
  [paths.agentCli, '--approve-session-upload'],
  [paths.agentTools, 'Private repository paths are unavailable'],
  [paths.agentLoop, 'Conversation Nexus metadata tools are intentionally absent'],
  [paths.mcpServer, 'SEIS_CONVERSATION_MCP_METADATA'],
  [paths.tests, 'metadata without excerpts or message bodies'],
  [paths.cliTests, 'refuses implicit legacy migration'],
  [paths.agentTests, 'filesystem tools deny private roots'],
  [paths.mcpTests, CONVERSATION_NEXUS_RESOURCE_URI],
  [paths.docs, CONVERSATION_NEXUS_RESOURCE_URI],
  [paths.docsIndex, 'ai/conversation-nexus.md'],
  [paths.statusDocs, 'Conversation Nexus'],
  [paths.platformDocs, CONVERSATION_NEXUS_RESOURCE_URI],
];
for (const [relativePath, marker] of sourceChecks) {
  ensure(readText(relativePath).includes(marker), `${relativePath} missing ${marker}`);
}

const agentToolsSource = readText(paths.agentTools);
ensure(
  !agentToolsSource.includes(CONVERSATION_STATUS_TOOL) &&
    !agentToolsSource.includes(CONVERSATION_SEARCH_TOOL),
  'cloud-provider agent tool registry must not contain Conversation Nexus tools',
);

const runtimeSource = readText(paths.runtime);
for (const forbiddenMarker of [
  "from 'node:child_process'",
  'fetch(',
  'process.env',
  'http.request(',
  'https.request(',
]) {
  ensure(
    !runtimeSource.includes(forbiddenMarker),
    `conversation store contains ${forbiddenMarker}`,
  );
}

const gitignore = readText(paths.gitignore);
for (const ignoredPath of ['.seis/conversations/', '.seis/exports/', '.seis/sessions/']) {
  ensure(gitignore.includes(ignoredPath), `.gitignore missing ${ignoredPath}`);
}
ensure(
  gitignore.includes(`!${CONVERSATION_SESSION_SCHEMA_PATH}`),
  '.gitignore must allow the public conversation schema',
);

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
    console.error('SEIS Conversation Nexus check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(
    'SEIS Conversation Nexus check passed: out-of-repo encrypted visible-text store, cloud-agent tools absent, 2 opt-in metadata-only MCP tools, external imports disabled.',
  );
}
