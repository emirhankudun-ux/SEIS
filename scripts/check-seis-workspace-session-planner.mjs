import fs from 'node:fs';
import {
  buildWorkspaceSessionPlan,
  summarizeWorkspaceSessionPlan,
  validateWorkspaceSessionInput,
} from '../packages/seis-workspace-planner/src/workspace-session-planner.mjs';

const inputPath = 'packages/seis-workspace-planner/fixtures/public-session.json';
const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const validation = validateWorkspaceSessionInput(input);
const errors = [...validation.errors];

if (validation.ok) {
  const first = buildWorkspaceSessionPlan(input);
  const second = buildWorkspaceSessionPlan(structuredClone(input));
  if (JSON.stringify(first) !== JSON.stringify(second)) errors.push('session plan must be deterministic');
  if (first.status !== 'ready-for-local-execution') errors.push('public fixture must be ready for local execution');
  if (first.summary.taskCount !== 6 || first.summary.stageCount !== 4) errors.push('public fixture summary drifted');
  if (first.summary.totalPlannedMinutes !== 120 || first.summary.remainingMinutes !== 0) errors.push('public fixture timebox drifted');
  if (first.checkpoints.length !== 4 || first.recovery.length !== 4) errors.push('checkpoint or recovery coverage drifted');
  if (first.policy.executionPerformed !== false || first.policy.externalWritePerformed !== false) errors.push('planner authority widened');
  if (summarizeWorkspaceSessionPlan(first).blockerCount !== 0) errors.push('public fixture unexpectedly contains blockers');
}

const schema = JSON.parse(fs.readFileSync('packages/seis-workspace-planner/schemas/workspace-session-input.schema.json', 'utf8'));
if (schema.properties?.contractId?.const !== 'seis-workspace-session-input-v1') errors.push('portable schema contractId drifted');
if (schema.additionalProperties !== false) errors.push('portable schema must reject unknown root properties');

for (const path of [
  'docs/architecture/SEIS_WORKSPACE_SESSION_PLANNER.md',
  'scripts/seis-workspace-session.mjs',
  'test/seis-workspace-session-planner.test.mjs',
  '.github/workflows/seis-workspace-session-planner.yml',
]) {
  if (!fs.existsSync(path)) errors.push(`missing session planner artifact: ${path}`);
}

if (errors.length) {
  console.error('seis-workspace-session-planner: failed');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`seis-workspace-session-planner: ok (${input.tasks.length} tasks, ${input.timeboxMinutes} minutes, no execution)`);
