import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));

const registry = read('content/development/seis-full-technology-registry.json');
const engines = read('content/development/seis-engine-capability-registry.json');
const cube = read('content/development/seis-cube-runtime-contract.json');
const composer = read('content/development/seis-workbench-composer.json');

test('full technology registry is evidence-honest and domain-complete', () => {
  assert.equal(registry.requestedGoalId, 'SEIS-GOAL-021');
  assert.equal(registry.canonicalGoalBinding.status, 'unresolved');
  assert.equal(registry.domains.length, 16);
  assert.equal(new Set(registry.domains.map((d) => d.id)).size, 16);
  assert.equal(registry.summary.capabilityCount, 96);
});

test('security boundary is deny-by-default', () => {
  assert.equal(registry.safetyBoundary.defaultNetwork, 'deny');
  assert.equal(registry.safetyBoundary.defaultWrite, 'deny');
  assert.equal(registry.safetyBoundary.externalMutationRequiresApproval, true);
  assert.equal(registry.safetyBoundary.credentialsInRegistry, false);
});

test('engine registry contains the four required first-wave engine families', () => {
  const ids = engines.engines.map((engine) => engine.id);
  assert.deepEqual(ids, ['seis-game-engine', 'seis-reality-engine', 'seis-3d-engine', 'seis-digital-human']);
  for (const engine of engines.engines) assert.ok(engine.capabilities.length >= 15);
  assert.equal(engines.safety.proprietaryCopying, 'forbidden');
});

test('digital human contract preserves an original SEIS-native provenance boundary', () => {
  const human = engines.engines.find((engine) => engine.id === 'seis-digital-human');
  assert.ok(human.capabilities.includes('canonical-identity'));
  assert.ok(human.capabilities.includes('performance-validation'));
  assert.match(human.provenanceBoundary, /SEIS-native/);
  assert.match(human.provenanceBoundary, /no MetaHuman assets/);
});

test('Cube cannot create verified product truth from decoration', () => {
  assert.equal(cube.truthBoundary.rendererMayInferRuntimeTruth, false);
  assert.equal(cube.truthBoundary.decorativeAnimationsCreateEvidence, false);
  assert.equal(cube.truthBoundary.canonicalSourceRequiredForVerifiedState, true);
  assert.equal(cube.accessibility.keyboardTraversal, 'required');
  assert.equal(cube.accessibility.screenReaderTree, 'required');
});

test('Workbench Composer keeps tool surfaces focused and non-executing', () => {
  assert.ok(composer.presets.length >= 12);
  assert.equal(composer.rules.autoExecuteTools, false);
  assert.equal(composer.rules.externalActionsRequireApproval, true);
  for (const preset of composer.presets) {
    assert.ok(preset.tools.length >= composer.rules.minimumPrimaryTools);
    assert.ok(preset.tools.length <= composer.rules.maxVisiblePrimaryTools);
  }
});
