import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  buildCubeProjection,
  composeWorkbench,
  createReviewSnapshot,
  normalizeExperienceState,
  validateProjection
} from '../full-technology-runtime.js';

const root = new URL('../../../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));

async function loadFixture() {
  const [registry, catalog, composer, engines, commandCenter] = await Promise.all([
    readJson('content/development/seis-full-technology-registry.json'),
    readJson('content/development/seis-technology-tool-catalog.json'),
    readJson('content/development/seis-workbench-composer.json'),
    readJson('content/development/seis-engine-capability-registry.json'),
    readJson('content/development/seis-full-technology-command-center.json')
  ]);
  return { registry, catalog, composer, engines, commandCenter };
}

test('validateProjection returns canonical counts and rejects stale projections', async () => {
  const data = await loadFixture();
  assert.deepEqual(validateProjection(data), {
    domainCount: 16,
    capabilityCount: 96,
    toolCount: 48,
    workbenchCount: 12,
    engineFamilyCount: 4,
    verifiedRuntimeClaims: 0
  });

  const stale = structuredClone(data);
  stale.commandCenter.summary.toolCount = 49;
  assert.throws(() => validateProjection(stale), /stale or inconsistent/i);
});

test('Cube projection covers every canonical domain exactly once', async () => {
  const data = await loadFixture();
  const projection = buildCubeProjection(data.registry, 'reality');
  const domainIds = projection.faces.flatMap((face) => face.domains);

  assert.equal(projection.activeFace.id, 'reality');
  assert.equal(projection.faces.length, 6);
  assert.equal(new Set(domainIds).size, 16);
  assert.deepEqual(new Set(domainIds), new Set(data.registry.domains.map((domain) => domain.id)));
});

test('Workbench composition remains local, bounded and execution-free', async () => {
  const data = await loadFixture();
  const workbench = composeWorkbench(data.composer, 'digital-human');

  assert.equal(workbench.id, 'digital-human');
  assert.ok(workbench.tools.length <= data.composer.rules.maxVisiblePrimaryTools);
  assert.equal(workbench.executionTruth.toolsExecuted, 0);
  assert.equal(workbench.executionTruth.externalWrites, 0);
  assert.equal(workbench.executionTruth.providerCalls, 0);
  assert.equal(workbench.requiresApprovalForExternalActions, true);
  assert.throws(() => composeWorkbench(data.composer, 'missing-workbench'), /Unknown Workbench/);
});

test('experience state normalization rejects stale persisted IDs', async () => {
  const data = await loadFixture();
  const normalized = normalizeExperienceState({
    section: 'unknown',
    domain: 'unknown',
    activeCubeFace: 'unknown',
    activeWorkbenchId: 'unknown',
    selected: { recordType: 'tool', id: 'unknown' }
  }, data);

  assert.deepEqual(normalized, {
    section: 'atlas',
    domain: 'all',
    activeCubeFace: 'intelligence',
    activeWorkbenchId: null,
    selected: null
  });
});

test('review snapshot is deterministic and preserves zero-execution truth', async () => {
  const data = await loadFixture();
  const snapshot = createReviewSnapshot({
    data,
    state: {
      activeCubeFace: 'creation',
      activeWorkbenchId: 'poster-design',
      selected: { recordType: 'workbench', id: 'poster-design' }
    },
    now: '2026-08-27T06:00:00.000Z'
  });

  assert.equal(snapshot.generatedAt, '2026-08-27T06:00:00.000Z');
  assert.equal(snapshot.activeWorkbench.id, 'poster-design');
  assert.deepEqual(snapshot.executionTruth, {
    toolsExecuted: 0,
    externalWrites: 0,
    providerCalls: 0,
    credentialsRead: 0
  });
  assert.equal(JSON.stringify(snapshot).includes('secret'), false);
});
