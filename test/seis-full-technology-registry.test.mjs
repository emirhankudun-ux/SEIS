import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync(new URL('../content/development/seis-full-technology-registry.json', import.meta.url), 'utf8'));
const composer = JSON.parse(fs.readFileSync(new URL('../content/development/seis-workbench-composer.json', import.meta.url), 'utf8'));

test('full technology registry is bound to SEIS-GOAL-021', () => {
  assert.equal(registry.goalId, 'SEIS-GOAL-021');
  assert.equal(registry.status, 'prototype');
});

test('full technology registry exposes 16 unique domains', () => {
  assert.equal(registry.domains.length, 16);
  const ids = registry.domains.map((domain) => domain.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every domain has a meaningful capability set', () => {
  for (const domain of registry.domains) {
    assert.ok(domain.capabilities.length >= 4, domain.id);
  }
});

test('safety boundary is deny by default', () => {
  assert.equal(registry.safetyBoundary.defaultNetwork, 'deny');
  assert.equal(registry.safetyBoundary.defaultWrite, 'deny');
  assert.equal(registry.safetyBoundary.externalMutationRequiresApproval, true);
  assert.equal(registry.safetyBoundary.credentialsInRegistry, false);
});

test('workbench composer exposes focused deterministic presets', () => {
  assert.equal(composer.goalId, 'SEIS-GOAL-021');
  assert.equal(composer.mode, 'deterministic-local-demo');
  assert.ok(composer.presets.length >= 5);
  assert.ok(composer.presets.some((preset) => preset.id === 'digital-human'));
  assert.ok(composer.presets.some((preset) => preset.id === 'game-scene-optimize'));
  assert.equal(composer.rules.autoExecuteTools, false);
  assert.equal(composer.rules.externalActionsRequireApproval, true);
});
