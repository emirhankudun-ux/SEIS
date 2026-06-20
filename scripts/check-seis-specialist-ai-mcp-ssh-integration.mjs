#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const files = {
  contract: 'content/development/seis-specialist-ai-mcp-ssh-integration-contract.json',
  doc: 'docs/platform/seis-specialist-ai-mcp-ssh-integration.md',
  specialistManifest: 'data/seis-specialist-plugins-2026-06-12.json',
  aiAgentProfile: 'plugins/seis-ai-agent/assets/agent-profile.json',
  aiAgentMcpServer: 'plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs',
  centralMcpServer: 'mcp/seis-mcp-server.mjs',
  llmBridge: 'data/seis-repos-llm-bridge-2026-06-08.json',
  sshContract: 'content/development/seis-ssh-mobile-direct-cloud-contract.json',
  sshRunbook: 'docs/operations/seis-ssh-mobile-24x7.md',
  packageJson: 'package.json',
};

for (const file of Object.values(files)) {
  read(file);
}

const contract = readJson(files.contract);
const specialistManifest = readJson(files.specialistManifest);
const aiAgentProfile = readJson(files.aiAgentProfile);
const llmBridge = readJson(files.llmBridge);
const sshContract = readJson(files.sshContract);
const packageJson = readJson(files.packageJson);

ensure(
  packageJson?.scripts?.['check:seis-specialist-ai-mcp-ssh-integration'] ===
    'node scripts/check-seis-specialist-ai-mcp-ssh-integration.mjs',
  'package.json must expose check:seis-specialist-ai-mcp-ssh-integration',
);
ensure(
  String(packageJson?.scripts?.['quality:governance'] || '').includes(
    'npm run check:seis-specialist-ai-mcp-ssh-integration',
  ),
  'quality:governance must include the specialist AI MCP SSH integration check',
);

if (contract) {
  ensure(contract.id === 'seis-specialist-ai-mcp-ssh-integration', 'contract id must be stable');
  ensure(contract.status === 'foundation-active', 'contract status must be foundation-active');
  ensure(
    contract.branch === 'seis/specialist-ai-mcp-ssh-integration',
    'contract branch must match the integration branch',
  );
  ensure(
    contract.qualityGate === 'npm run check:seis-specialist-ai-mcp-ssh-integration',
    'contract quality gate must match package script',
  );
  ensure(
    contract.sourceOfTruth?.centralMcpServer === files.centralMcpServer,
    'contract must point at central MCP server',
  );
  ensure(
    contract.sourceOfTruth?.sshContract === files.sshContract,
    'contract must point at SSH contract',
  );
  ensure(
    contract.sourceOfTruth?.integrationDoc === files.doc,
    'contract must point at integration doc',
  );
  ensure(
    contract.canonicalPluginPolicy?.primaryInstallId === 'seis-ai-agent@seis-repo',
    'contract must preserve canonical install id',
  );
  ensure(
    contract.canonicalPluginPolicy?.publishedPluginCount === 1,
    'contract must keep one published plugin',
  );
  ensure(
    contract.canonicalPluginPolicy?.standaloneLaneInstallMode === 'disabled',
    'contract must keep standalone lane installs disabled',
  );
  ensure(
    contract.sshExecutionModel?.modeBeforeHumanApproval === 'dry-run-only',
    'contract must keep SSH dry-run only before approval',
  );
  ensure(
    contract.sshExecutionModel?.liveSshAllowedByDefault === false,
    'contract must block live SSH by default',
  );
  ensure(
    contract.sshExecutionModel?.bootstrapApplyRequiresHumanApproval === true,
    'contract must require approval for bootstrap apply',
  );
  ensure(
    contract.sshExecutionModel?.privateKeyLeavesUserControl === false,
    'contract must keep private key under user control',
  );
  ensure(
    contract.sshExecutionModel?.singleVisibleAlias === 'SEIS-SSH',
    'contract must preserve SEIS-SSH alias',
  );
  ensure(Array.isArray(contract.requiredLanes), 'contract must define required lanes');
  for (const lane of ['seis-governance', 'seis-cloud', 'seis-code', 'seis-design', 'seis-data']) {
    ensure(contract.requiredLanes?.includes(lane), `contract requiredLanes missing ${lane}`);
  }
  for (const tool of [
    'seis_specialist_lanes',
    'seis_specialist_lane_status',
    'seis_specialist_lane_plan',
  ]) {
    ensure(contract.centralMcpTools?.includes(tool), `contract centralMcpTools missing ${tool}`);
  }
  for (const tool of ['seis_llm_plan_request', 'seis_llm_role_plan_request']) {
    ensure(
      contract.aiPlanningSurfaces?.includes(tool),
      `contract aiPlanningSurfaces missing ${tool}`,
    );
  }
  ensure(
    contract.integrationStages?.some(
      stage =>
        stage.id === 'stage-4-live-ssh-approval' &&
        stage.status === 'blocked-until-explicit-approval',
    ),
    'contract must block live SSH until explicit approval',
  );
  ensure(
    contract.forbiddenClaims?.includes('cloud is ready without strict doctor evidence'),
    'contract must forbid unsupported cloud ready claims',
  );
  ensure(
    contract.forbiddenClaims?.includes('qlty passed without a returned qlty check context'),
    'contract must preserve qlty evidence discipline',
  );
}

if (specialistManifest) {
  ensure(
    specialistManifest.consolidation?.primaryInstallId === 'seis-ai-agent@seis-repo',
    'specialist manifest must use SEIS-Agent install id',
  );
  ensure(
    specialistManifest.consolidation?.marketplacePolicy === 'only-seis-ai-agent-is-published',
    'specialist manifest must publish only SEIS-Agent',
  );
  for (const tool of [
    'seis_specialist_lanes',
    'seis_specialist_lane_status',
    'seis_specialist_lane_plan',
  ]) {
    ensure(
      specialistManifest.centralMcpTools?.includes(tool),
      `specialist manifest missing central MCP tool ${tool}`,
    );
  }
}

if (aiAgentProfile) {
  ensure(
    aiAgentProfile.installId === 'seis-ai-agent@seis-repo',
    'SEIS-Agent profile must use repo install id',
  );
  for (const lane of ['seis-governance', 'seis-cloud', 'seis-code', 'seis-design', 'seis-data']) {
    ensure(
      aiAgentProfile.composedLanes?.includes(lane),
      `SEIS-Agent profile missing composed lane ${lane}`,
    );
  }
}

if (llmBridge) {
  ensure(
    llmBridge.mcp?.server === files.centralMcpServer,
    'LLM bridge must point at central MCP server',
  );
  ensure(llmBridge.plugin?.localPath === 'plugins/seis', 'LLM bridge must retain repo plugin path');
}

if (sshContract) {
  ensure(
    sshContract.transport?.required === 'direct-cloud-ssh',
    'SSH contract must require direct-cloud SSH',
  );
  ensure(
    sshContract.bootstrap?.publicKeyOnly === true,
    'SSH contract must require public-key-only bootstrap',
  );
  ensure(
    sshContract.bootstrap?.privateKeyReadableByBootstrap === false,
    'SSH contract must reject private key bootstrap reads',
  );
  ensure(
    sshContract.security?.privateKeysInGitAllowed === false,
    'SSH contract must reject private keys in git',
  );
  ensure(
    sshContract.readiness?.strictDoctorCommand === 'npm run cloud:ssh:mobile-direct:doctor:strict',
    'SSH contract must expose strict doctor command',
  );
}

for (const [file, token] of [
  [files.doc, 'GitHub remains the source of truth'],
  [files.doc, 'SSH is only an execution plane after'],
  [files.doc, 'seis-ai-agent@seis-repo'],
  [files.doc, 'seis_specialist_lane_plan'],
  [files.doc, 'dry-run only'],
  [files.doc, 'Live SSH can start only after'],
  [files.contract, 'dry-run-only'],
  [files.contract, 'stage-4-live-ssh-approval'],
  [files.centralMcpServer, 'seis_specialist_lane_status'],
  [files.centralMcpServer, 'seis_llm_role_plan_request'],
  [files.aiAgentMcpServer, 'seis_ai_agent_plan'],
  [files.aiAgentMcpServer, 'seis_agent_lanes'],
  [files.sshRunbook, 'Use direct SSH to an always-on cloud VM'],
]) {
  requireIncludes(file, token);
}

for (const file of [
  files.contract,
  files.doc,
  'scripts/check-seis-specialist-ai-mcp-ssh-integration.mjs',
]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, 'OpenAI-style API keys');
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, 'private keys');
}

if (failures.length > 0) {
  console.error('SEIS specialist AI MCP SSH integration check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS specialist AI MCP SSH integration check passed.');

function absolute(file) {
  return path.join(root, file);
}

function read(file) {
  const full = absolute(file);
  if (!existsSync(full)) {
    fail(`missing ${file}`);
    return '';
  }
  return readFileSync(full, 'utf8');
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function requireIncludes(file, token) {
  if (!read(file).includes(token)) {
    fail(`${file} must include ${token}`);
  }
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) {
    fail(`${file} must not include ${reason}`);
  }
}

function ensure(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function fail(message) {
  failures.push(message);
}
