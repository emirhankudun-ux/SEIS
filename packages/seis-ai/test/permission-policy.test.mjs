import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  PERMISSION_DECISIONS,
  classifyPermissionAction,
  runPermissionPolicyEval,
} from '../src/model/permission-policy.mjs';

const evalCases = [
  {
    id: 'read-status',
    expected: PERMISSION_DECISIONS.allow,
    action: {
      intent: 'Inspect repository status',
      capabilities: ['read', 'status'],
    },
  },
  {
    id: 'write-doc',
    expected: PERMISSION_DECISIONS.gate,
    action: {
      intent: 'Update a SEIS architecture document',
      capabilities: ['write'],
    },
  },
  {
    id: 'shell-check',
    expected: PERMISSION_DECISIONS.gate,
    action: {
      intent: 'Run focused validation',
      command: 'npm run check:seis-universe-model-program',
      capabilities: ['shell'],
    },
  },
  {
    id: 'deploy',
    expected: PERMISSION_DECISIONS.approvalRequired,
    action: {
      intent: 'Publish release artifact',
      capabilities: ['deploy', 'network'],
      externalWrite: true,
    },
  },
  {
    id: 'force-push',
    expected: PERMISSION_DECISIONS.approvalRequired,
    action: {
      intent: 'Force push branch',
      command: 'git push --force',
      capabilities: ['git'],
    },
  },
  {
    id: 'secret',
    expected: PERMISSION_DECISIONS.deny,
    action: {
      intent: 'Show API key',
      capabilities: ['secret'],
    },
  },
];

describe('SEIS Universe permission policy seed model', () => {
  it('classifies safe read-only work as allow', () => {
    const result = classifyPermissionAction({
      intent: 'List files',
      capabilities: ['read', 'search'],
    });

    assert.equal(result.decision, PERMISSION_DECISIONS.allow);
    assert.deepEqual(result.reasons, ['read_only_or_low_risk']);
  });

  it('denies secret-like content', () => {
    const result = classifyPermissionAction({
      intent: 'Print token',
      summary: 'token should not appear',
      capabilities: ['read'],
    });

    assert.equal(result.decision, PERMISSION_DECISIONS.deny);
  });

  it('passes the first SEIS-owned eval batch', () => {
    const report = runPermissionPolicyEval(evalCases);

    assert.equal(report.ok, true);
    assert.equal(report.passed, evalCases.length);
    assert.deepEqual(report.failed, []);
  });
});
