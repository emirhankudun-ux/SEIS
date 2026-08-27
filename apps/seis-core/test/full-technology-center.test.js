const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('apps/seis-core/full-technology.html', 'utf8');
const js = fs.readFileSync('apps/seis-core/full-technology-center.js', 'utf8');
const css = fs.readFileSync('apps/seis-core/full-technology-center.css', 'utf8');
const registry = JSON.parse(fs.readFileSync('content/development/seis-full-technology-registry.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('content/development/seis-technology-tool-catalog.json', 'utf8'));
const composer = JSON.parse(fs.readFileSync('content/development/seis-workbench-composer.json', 'utf8'));
const commandCenter = JSON.parse(fs.readFileSync('content/development/seis-full-technology-command-center.json', 'utf8'));

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
  assert.match(js, /Full Technology data unavailable|error-state/);
  assert.match(js, /throw new Error\('Command Center projection is stale/);
  assert.doesNotMatch(js, /https:\/\//);
});

test('surface preserves reduced-motion and responsive behavior', () => {
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /focus-visible/);
});
