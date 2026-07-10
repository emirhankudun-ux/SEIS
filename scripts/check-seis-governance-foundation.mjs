#!/usr/bin/env node
import fs from 'node:fs';

const canonicalDocs = [
  'docs/SEIS_GOAL_TRACKING.md',
  'docs/ARCHITECTURE.md',
  'docs/AI_CORE.md',
  'docs/MCP_REGISTRY.md',
  'docs/AGENT_REGISTRY.md',
  'docs/DESIGN_SYSTEM.md',
  'docs/APPLE_PLATFORM_STRATEGY.md',
  'docs/SECURITY.md',
  'docs/ROADMAP.md',
  'docs/ROLLBACK.md',
  'docs/TESTING.md',
  'docs/ACCESSIBILITY.md',
  'docs/DEVOPS.md',
  'docs/RELEASE.md',
  'docs/PUBLIC_PRIVATE_BOUNDARY.md',
];

const requiredFiles = [
  'AGENTS.md',
  'ARCHITECTURE.md',
  'ROADMAP.md',
  ...canonicalDocs,
  'CONTRIBUTING.md',
  'SECURITY.md',
  '.github/CODEOWNERS',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/ISSUE_TEMPLATE/bug_report.md',
  '.github/ISSUE_TEMPLATE/feature_request.md',
  '.github/workflows/foundation-check.yml',
  'docs/governance/branch-policy.md',
  'docs/governance/seis-governance-foundation-audit.md',
  'docs/goals/goal-schema.md',
  'schemas/seis-goal-execution.schema.json',
  'content/development/seis-governance-foundation-execution.json',
  'content/development/seis-goal-tracking.json',
  'package.json',
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(file) {
  if (!fs.existsSync(file)) {
    fail(`missing required file: ${file}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  const text = readText(file);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON in ${file}: ${error.message}`);
    return null;
  }
}

function requireStringArray(object, field, minimum = 0) {
  const value = object?.[field];
  if (
    !Array.isArray(value) ||
    value.length < minimum ||
    value.some(item => typeof item !== 'string' || item.length === 0)
  ) {
    fail(`focused execution ${field} must be a string array with at least ${minimum} item(s)`);
    return [];
  }
  if (new Set(value).size !== value.length)
    fail(`focused execution ${field} must not contain duplicates`);
  return value;
}

for (const file of requiredFiles) readText(file);

const agents = readText('AGENTS.md');
for (const required of [
  '# SEIS UNIFIED MASTER PROMPT',
  '**Version:** Enterprise v4.0',
  '**Authority:** Highest repository instruction',
  '# 7. Apple-First Constitution',
  '# 8. Swift-First Constitution',
  '# 21. Security Constitution',
  '# 44. Agent Swarm Constitution',
  '# 67. Quality Gates',
  '# 73. Final Execution Protocol',
  '# Appendix A',
  '# Final Unified Master Prompt Clause',
]) {
  if (!agents.includes(required))
    fail(`AGENTS.md must preserve Enterprise v4.0 marker: ${required}`);
}
for (const file of canonicalDocs) {
  if (!agents.includes(`](${file})`)) fail(`AGENTS.md must link ${file}`);
}

const schema = readJson('schemas/seis-goal-execution.schema.json');
const execution = readJson('content/development/seis-governance-foundation-execution.json');
const registry = readJson('content/development/seis-goal-tracking.json');

if (schema) {
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema')
    fail('execution schema must use JSON Schema draft 2020-12');
  if (schema.title !== 'SEIS Goal Execution') fail('execution schema title mismatch');
  if (schema.additionalProperties !== false)
    fail('execution schema must reject unknown top-level fields');
  if (!Array.isArray(schema.required) || !schema.required.includes('definition_of_done'))
    fail('execution schema must require definition_of_done');
}

const categories = new Set([
  'architecture',
  'apple',
  'design',
  'development',
  'ai',
  'llm',
  'mcp',
  'devops',
  'security',
  'testing',
  'accessibility',
  'performance',
  'documentation',
  'release',
]);
const priorities = new Set(['critical', 'high', 'medium', 'low']);
const statuses = new Set([
  'backlog',
  'planned',
  'in-progress',
  'review',
  'blocked',
  'completed',
  'archived',
]);
const horizons = new Set(['now', '30-days', '90-days', '1-year', '3-years', '5-years']);

if (execution && schema) {
  for (const field of schema.required || []) {
    if (!(field in execution)) fail(`focused execution missing schema-required field: ${field}`);
  }
  for (const field of Object.keys(execution)) {
    if (!(field in (schema.properties || {})))
      fail(`focused execution has schema-unknown field: ${field}`);
  }

  if (execution.$schema !== '../../schemas/seis-goal-execution.schema.json')
    fail('focused execution schema reference mismatch');
  if (execution.schemaVersion !== 1) fail('focused execution schemaVersion must be 1');
  if (execution.execution_id !== 'SEIS-EXEC-001')
    fail('focused execution id must be SEIS-EXEC-001');
  if (execution.requested_goal_id !== 'SEIS-GOAL-001')
    fail('requested milestone id must be SEIS-GOAL-001');
  if (execution.canonical_goal_id !== 'SEIS-GOAL-003')
    fail('focused execution must map to canonical Goal Tracking OS id SEIS-GOAL-003');
  if (execution.title !== 'Repository Governance and Goal Tracking Foundation')
    fail('focused execution title mismatch');
  if (!categories.has(execution.category))
    fail(`invalid focused execution category: ${execution.category}`);
  if (!priorities.has(execution.priority))
    fail(`invalid focused execution priority: ${execution.priority}`);
  if (!statuses.has(execution.status))
    fail(`invalid focused execution status: ${execution.status}`);
  if (execution.status !== 'review')
    fail('focused execution must remain review until owner/PR review completes');
  if (!horizons.has(execution.time_horizon))
    fail(`invalid focused execution horizon: ${execution.time_horizon}`);
  if (typeof execution.owner_agent !== 'string' || execution.owner_agent.length < 3)
    fail('focused execution owner_agent is invalid');

  requireStringArray(execution, 'supporting_agents', 3);
  const repoAreas = requireStringArray(execution, 'repo_areas', 1);
  requireStringArray(execution, 'dependencies', 1);
  requireStringArray(execution, 'definition_of_done', 7);
  const validation = requireStringArray(execution, 'validation', 1);
  requireStringArray(execution, 'risks', 1);

  if (typeof execution.rollback_plan !== 'string' || execution.rollback_plan.length < 12)
    fail('focused execution rollback_plan is incomplete');
  if (!validation.includes('npm run check:seis-governance-foundation'))
    fail('focused execution must name its direct validator');

  for (const repoPath of repoAreas) {
    if (repoPath.startsWith('/') || repoPath.split('/').includes('..'))
      fail(`focused execution repo path must be repo-relative: ${repoPath}`);
    if (!fs.existsSync(repoPath)) fail(`focused execution repo path does not exist: ${repoPath}`);
  }

  const output = execution.github_output;
  for (const field of ['issue', 'branch', 'pull_request', 'commit']) {
    if (typeof output?.[field] !== 'boolean')
      fail(`focused execution github_output.${field} must be boolean`);
  }
  for (const field of Object.keys(output || {})) {
    if (!['issue', 'branch', 'pull_request', 'commit', 'branch_name', 'pr_title'].includes(field))
      fail(`focused execution github_output has unknown field: ${field}`);
  }
  if (output?.branch_name !== 'architecture/seis-governance-v1')
    fail('focused execution branch mismatch');
  if (!output?.pr_title) fail('focused execution must name its PR title');
  if (typeof execution.identity_note !== 'string' || execution.identity_note.length < 20)
    fail('focused execution identity_note is incomplete');
}

if (
  registry &&
  !(registry.goals || []).some(
    item => item.id === 'SEIS-GOAL-003' && item.category === 'Goal Tracking OS',
  )
) {
  fail('historical registry must retain SEIS-GOAL-003 Goal Tracking OS mapping target');
}
if (
  registry &&
  !(registry.goals || []).some(
    item => item.id === 'SEIS-GOAL-001' && item.category === 'SEIS AI Core',
  )
) {
  fail('historical registry must retain SEIS-GOAL-001 AI Core identity collision evidence');
}
if (execution?.requested_goal_id === execution?.canonical_goal_id)
  fail('requested and canonical goal ids must remain distinct for this execution');

const packageJson = readJson('package.json');
if (
  packageJson?.scripts?.['check:seis-governance-foundation'] !==
  'node scripts/check-seis-governance-foundation.mjs'
) {
  fail('package.json must expose check:seis-governance-foundation');
}
if (packageJson?.license !== 'MIT')
  fail('package.json license must align with the repository MIT license');
const packageLock = readJson('package-lock.json');
if (packageLock?.packages?.['']?.license !== 'MIT')
  fail('package-lock.json root license must align with the repository MIT license');
for (const command of execution?.validation || []) {
  const match = command.match(/^npm run ([^\s]+)$/);
  if (match && !packageJson?.scripts?.[match[1]])
    fail(`focused execution references missing npm script: ${match[1]}`);
  if (command === 'npm test' && !packageJson?.scripts?.test)
    fail('focused execution references missing npm test script');
}

const foundationWorkflow = readText('.github/workflows/foundation-check.yml');
if (!foundationWorkflow.includes('npm run check:seis-governance-foundation'))
  fail('foundation CI must run the governance validator');

const pullRequestTemplate = readText('.github/PULL_REQUEST_TEMPLATE.md');
for (const heading of [
  'Summary',
  'Why',
  'Goal ID',
  'Scope',
  'Changed Files',
  'Architecture Impact',
  'Apple Impact',
  'AI Impact',
  'Security',
  'Accessibility',
  'Performance',
  'Validation',
  'Failed or Skipped Checks',
  'Evidence',
  'Risks',
  'Rollback',
  'Next Decision',
]) {
  if (!pullRequestTemplate.includes(`## ${heading}`))
    fail(`PR template must include ## ${heading}`);
}

const branchPolicy = readText('docs/governance/branch-policy.md');
for (const prefix of [
  'architecture/',
  'apple/',
  'ai/',
  'mcp/',
  'security/',
  'devops/',
  'audit/',
  'rollback/',
]) {
  if (!branchPolicy.includes(`${prefix}<short-scope>`))
    fail(`branch policy must include ${prefix}`);
}

const gitignore = readText('.gitignore');
for (const file of canonicalDocs) {
  if (!gitignore.includes(`!${file}`)) fail(`.gitignore must allow ${file}`);
}
if (!gitignore.includes('!schemas/seis-goal-execution.schema.json'))
  fail('.gitignore must allow the execution schema');

const headingRequirements = new Map([
  [
    'docs/SEIS_GOAL_TRACKING.md',
    [
      'Master Goal',
      'Clean Worktree Rule',
      'Goal Record Shape',
      'Five-Year Roadmap Order',
      'Required Agent-Swarm Roles',
      'MCP Rule',
      'Definition Of Done',
    ],
  ],
  [
    'docs/ARCHITECTURE.md',
    ['Boundaries', 'Dependency Direction', 'Product Surfaces', 'Quality Boundaries'],
  ],
  [
    'docs/AI_CORE.md',
    [
      'Responsibilities',
      'Runtime States',
      'Routing Contract',
      'Prompt and Memory Boundary',
      'Safety',
    ],
  ],
  ['docs/MCP_REGISTRY.md', ['Status Model', 'Current Records', 'Permission Rules', 'Rollback']],
  ['docs/AGENT_REGISTRY.md', ['Sources', 'Permission Defaults', 'Required Handoff']],
  [
    'docs/DESIGN_SYSTEM.md',
    ['Visual Language', 'Tokens', 'Iconography', 'Motion', 'Accessibility'],
  ],
  [
    'docs/APPLE_PLATFORM_STRATEGY.md',
    ['Platform Roles', 'Swift Package Direction', 'Native Boundaries', 'Adoption Gate'],
  ],
  ['docs/SECURITY.md', ['Secrets', 'Permission Boundaries', 'Supply Chain', 'Public Review']],
  [
    'docs/ROADMAP.md',
    [
      'Status Vocabulary',
      'Execution Order',
      'Current Milestone',
      'Five-Year Direction',
      'Roadmap Rules',
    ],
  ],
  [
    'docs/ROLLBACK.md',
    ['Required Record', 'Repository Changes', 'Runtime Changes', 'Documentation-Only Changes'],
  ],
  ['docs/TESTING.md', ['Test Layers', 'Required Evidence', 'Governance Baseline', 'Apple and UI']],
  ['docs/ACCESSIBILITY.md', ['Interaction', 'Perception', 'Motion', 'Validation']],
  ['docs/DEVOPS.md', ['CI', 'Deployment', 'Observability', 'Automation Boundary']],
  ['docs/RELEASE.md', ['Readiness', 'Status Integrity', 'Approval', 'Handoff']],
  [
    'docs/PUBLIC_PRIVATE_BOUNDARY.md',
    ['Public-Safe', 'Private or Restricted', 'Safety Rules', 'Review Gate'],
  ],
]);
for (const [file, headings] of headingRequirements) {
  const text = readText(file);
  for (const heading of headings) {
    if (!text.includes(`## ${heading}`)) fail(`${file} must include ## ${heading}`);
  }
}

const publicSafeFiles = [
  'AGENTS.md',
  ...canonicalDocs,
  'docs/governance/seis-governance-foundation-audit.md',
  'docs/governance/seis-supreme-v12-constitution.md',
  'docs/governance/seis-master-prompt.md',
  'docs/governance/adr-0001-seis-master-prompt-operating-contract.md',
  'data/seis-master-prompt-acceptance-criteria.json',
  'data/seis-master-prompt-github-controls.json',
  'data/seis-master-prompt-implementation-map.json',
  'reports/seis-master-prompt-governance.md',
  'schemas/seis-goal-execution.schema.json',
  'content/development/seis-governance-foundation-execution.json',
];
for (const file of publicSafeFiles) {
  const text = readText(file);
  if (/\/Users\/|Mobile Documents|~\/|[A-Za-z]:\\/.test(text))
    fail(`${file} contains a machine-specific path`);
  if (/BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY/.test(text))
    fail(`${file} contains private-key material`);
  if (/\b(?:sk|pk)-[A-Za-z0-9_-]{16,}\b/.test(text))
    fail(`${file} contains an API-key-shaped value`);
}

if (!readText('ARCHITECTURE.md').includes('docs/ARCHITECTURE.md'))
  fail('root ARCHITECTURE.md must be a compatibility pointer');
if (!readText('ROADMAP.md').includes('docs/ROADMAP.md'))
  fail('root ROADMAP.md must be a compatibility pointer');

if (failures.length > 0) {
  console.error(`SEIS governance foundation check failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(
  `SEIS governance foundation check passed: Enterprise v4.0, ${canonicalDocs.length} canonical docs, execution schema, CI, and PR governance are aligned.`,
);
