import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const repoRoot = new URL('../../../', import.meta.url);

const [html, js, css, registry, catalog, composer, commandCenter] = await Promise.all([
  readFile(new URL('full-technology.html', root), 'utf8'),
  readFile(new URL('full-technology-center.js', root), 'utf8'),
  readFile(new URL('full-technology-center.css', root), 'utf8'),
  readFile(new URL('content/development/seis-full-technology-registry.json', repoRoot), 'utf8').then(JSON.parse),
  readFile(new URL('content/development/seis-technology-tool-catalog.json', repoRoot), 'utf8').then(JSON.parse),
  readFile(new URL('content/development/seis-workbench-composer.json', repoRoot), 'utf8').then(JSON.parse),
  readFile(new URL('content/development/seis-full-technology-command-center.json', repoRoot), 'utf8').then(JSON.parse)
]);

test('Full Technology Center exposes accessible primary structure', () => {
  assert.match(html, /<main id="main"/);
  assert.match(html, /aria-label="Technology navigation"/);
  assert.match(html, /id="technology-search"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /role="alert"/);
});

test('Full Technology Center loads canonical repository records rather than hard-coded metric counts', () => {
  assert.match(js, /seis-full-technology-registry\.json/);
  assert.match(js, /seis-technology-tool-catalog\.json/);
  assert.match(js, /seis-workbench-composer\.json/);
  assert.match(js, /seis-engine-capability-registry\.json/);
  assert.match(js, /seis-full-technology-command-center\.json/);
  assert.equal(registry.domains.length, 16);
  assert.equal(catalog.tools.length, 48);
  assert.equal(composer.presets.length, 12);
  assert.equal(commandCenter.summary.verifiedRuntimeClaims, 0);
});

test('browser controller fails visibly instead of fabricating fallback state', () => {
  assert.match(js, /error-state/);
  assert.match(js, /throw new Error\('Command Center projection is stale/);
  assert.doesNotMatch(js, /https:\/\//);
});

test('surface preserves reduced-motion and responsive behavior', () => {
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /focus-visible/);
});
