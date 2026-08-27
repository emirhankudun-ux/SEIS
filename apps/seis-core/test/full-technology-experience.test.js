import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../../../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('Full Technology Center exposes Cube, active Workbench and local review controls', async () => {
  const html = await read('apps/seis-core/full-technology.html');

  assert.match(html, /data-section="cube"/);
  assert.match(html, /id="cube-navigator"/);
  assert.match(html, /aria-label="Cube face navigator"/);
  assert.match(html, /id="active-workbench-panel"/);
  assert.match(html, /id="workbench-status"/);
  assert.match(html, /id="export-snapshot"/);
  assert.match(html, /id="close-workbench"/);
});

test('Full Technology controller persists local state and never auto-executes a Workbench', async () => {
  const script = await read('apps/seis-core/full-technology-center.js');

  assert.match(script, /seis-full-technology-state-v2/);
  assert.match(script, /function loadStoredState\(/);
  assert.match(script, /function saveStoredState\(/);
  assert.match(script, /function renderCube\(/);
  assert.match(script, /function launchWorkbench\(/);
  assert.match(script, /function closeWorkbench\(/);
  assert.match(script, /function exportReviewSnapshot\(/);
  assert.match(script, /activeWorkbenchId/);
  assert.match(script, /URL\.createObjectURL/);
  assert.match(script, /ArrowRight|ArrowLeft/);
  assert.match(script, /event\.key === '\/'/);
  assert.doesNotMatch(script, /window\.open\(/);
  assert.doesNotMatch(script, /eval\(/);
});

test('Cube and Workbench experience keeps accessible and low-motion fallbacks', async () => {
  const css = await read('apps/seis-core/full-technology-center.css');

  assert.match(css, /\.cube-face/);
  assert.match(css, /\.active-workbench-panel/);
  assert.match(css, /\.workbench-tool/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /focus-visible/);
});

test('PWA manifest exposes Full Technology Center as an explicit shortcut', async () => {
  const manifest = JSON.parse(await read('apps/seis-core/manifest.webmanifest'));
  const shortcut = manifest.shortcuts?.find((item) => item.url === './full-technology.html');

  assert.ok(shortcut, 'Full Technology Center shortcut must exist');
  assert.equal(shortcut.name, 'Full Technology Center');
});
