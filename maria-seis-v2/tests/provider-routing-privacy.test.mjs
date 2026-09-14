import test from 'node:test';
import assert from 'node:assert/strict';
import { selectProviders } from '../src/core/providerRouter.js';

const ready = overrides => ({
  id:'provider',
  kind:'local-model',
  locality:'local',
  status:'available',
  implemented:true,
  connected:true,
  healthVerified:true,
  capabilities:['reasoning'],
  priority:50,
  ...overrides
});

test('local-only routing rejects a healthy cloud fallback even when cloud use is otherwise allowed', () => {
  const cloud=ready({id:'cloud',kind:'cloud-model',locality:'remote',priority:100});
  const selected=selectProviders(
    {intent:'general'},
    {executionMode:'live',allowCloud:true,localOnly:true},
    [cloud]
  );
  assert.deepEqual(selected,[]);
});

test('local-only routing accepts a verified provider explicitly declared local', () => {
  const local=ready({id:'local',kind:'local-model',locality:'local'});
  const selected=selectProviders(
    {intent:'general'},
    {executionMode:'live',allowCloud:true,localOnly:true},
    [local]
  );
  assert.equal(selected.length,1);
  assert.equal(selected[0].id,'local');
});

test('local-only routing fails closed when provider locality is not declared', () => {
  const unknown=ready({id:'unknown'});
  delete unknown.locality;
  const selected=selectProviders(
    {intent:'general'},
    {executionMode:'live',allowCloud:true,localOnly:true},
    [unknown]
  );
  assert.deepEqual(selected,[]);
});
