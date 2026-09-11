import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  buildWorkspaceSessionPlan,
  summarizeWorkspaceSessionPlan,
  validateWorkspaceSessionInput,
} from '../packages/seis-workspace-planner/src/workspace-session-planner.mjs';

const fixture = JSON.parse(fs.readFileSync('packages/seis-workspace-planner/fixtures/public-session.json', 'utf8'));

test('validates and deterministically plans the public SEIS workspace session', () => {
  const result = validateWorkspaceSessionInput(fixture);
  assert.equal(result.ok, true, result.errors.join('\n'));
  const first = buildWorkspaceSessionPlan(fixture);
  const second = buildWorkspaceSessionPlan(structuredClone(fixture));
  assert.deepEqual(first, second);
  assert.equal(first.status, 'ready-for-local-execution');
  assert.equal(first.summary.totalPlannedMinutes, 120);
  assert.equal(first.summary.remainingMinutes, 0);
  assert.equal(first.policy.executionPerformed, false);
});

test('produces dependency-safe order, stage groups, checkpoints, and recovery instructions', () => {
  const plan = buildWorkspaceSessionPlan(fixture);
  assert.deepEqual(plan.executionOrder.map((task) => task.id), [
    'inspect-current-state',
    'define-bounded-scope',
    'implement-focused-slice',
    'review-boundaries',
    'run-focused-checks',
    'prepare-handoff',
  ]);
  assert.deepEqual(plan.stageOrder, ['prepare', 'build', 'verify', 'handoff']);
  assert.equal(plan.checkpoints.length, 4);
  assert.ok(plan.recovery.every((entry) => entry.resumeAfterTaskId));
  assert.equal(summarizeWorkspaceSessionPlan(plan).taskCount, 6);
});

test('blocks plans that need unavailable capabilities or explicit owner approval', () => {
  const blocked = structuredClone(fixture);
  blocked.tasks.push({
    id: 'publish-release',
    label: 'Publish release',
    stage: 'handoff',
    durationMinutes: 10,
    dependsOn: ['prepare-handoff'],
    requiredCapabilities: ['deployment-access'],
    approval: 'owner-required',
    evidence: ['owner-approval', 'release-record'],
  });
  blocked.timeboxMinutes = 140;
  const plan = buildWorkspaceSessionPlan(blocked);
  assert.equal(plan.status, 'blocked');
  assert.ok(plan.blockers.some((entry) => entry.type === 'missing-capability' && entry.taskId === 'publish-release'));
  assert.ok(plan.blockers.some((entry) => entry.type === 'owner-approval' && entry.taskId === 'publish-release'));
  assert.equal(plan.policy.executionPerformed, false);
});

test('rejects cycles, impossible timeboxes, backward stage dependencies, and duplicate task ids', () => {
  const invalid = structuredClone(fixture);
  invalid.tasks[0].dependsOn = ['prepare-handoff'];
  invalid.tasks[2].id = 'define-bounded-scope';
  invalid.timeboxMinutes = 30;
  const errors = validateWorkspaceSessionInput(invalid).errors.join('\n');
  assert.match(errors, /duplicate task id/);
  assert.match(errors, /dependency cycle/);
  assert.match(errors, /timeboxMinutes/);
  assert.match(errors, /stage order/);
});

test('rejects authority widening, private data, sensitive fields, and malformed evidence', () => {
  const invalid = structuredClone(fixture);
  invalid.policy.externalWrites = true;
  invalid.policy.providerExecution = true;
  invalid.policy.privateData = true;
  invalid.mission.accessToken = 'not-allowed';
  invalid.tasks[0].evidence = ['../private.txt'];
  const errors = validateWorkspaceSessionInput(invalid).errors.join('\n');
  assert.match(errors, /policy.externalWrites must be false/);
  assert.match(errors, /policy.providerExecution must be false/);
  assert.match(errors, /policy.privateData must be false/);
  assert.match(errors, /sensitive-shaped key/);
  assert.match(errors, /evidence.*safe identifier/);
});
