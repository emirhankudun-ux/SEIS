import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../../../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('Full Technology controller registers a local scoped service worker', async () => {
  const controller = await read('apps/seis-core/full-technology-center.js');

  assert.match(controller, /function registerOfflineSupport\(/);
  assert.match(controller, /navigator\.serviceWorker\.register\('\.\/full-technology-service-worker\.js'/);
  assert.match(controller, /scope: '\.\/'/);
  assert.match(controller, /location\.protocol !== 'file:'/);
});

test('service worker caches the app shell and canonical Full Technology records', async () => {
  const worker = await read('apps/seis-core/full-technology-service-worker.js');

  for (const path of [
    './full-technology.html',
    './full-technology-center.css',
    './full-technology-center.js',
    './full-technology-runtime.js',
    '../../content/development/seis-full-technology-registry.json',
    '../../content/development/seis-technology-tool-catalog.json',
    '../../content/development/seis-workbench-composer.json',
    '../../content/development/seis-engine-capability-registry.json',
    '../../content/development/seis-full-technology-command-center.json'
  ]) {
    assert.match(worker, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(worker, /networkFirst/);
  assert.match(worker, /cacheFirst/);
  assert.match(worker, /request\.method !== 'GET'/);
  assert.match(worker, /url\.origin !== self\.location\.origin/);
  assert.match(worker, /caches\.delete/);
  assert.doesNotMatch(worker, /https:\/\//);
});
