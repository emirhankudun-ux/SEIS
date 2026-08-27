import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, stat } from 'node:fs/promises';

const repositoryRoot = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.svg', 'image/svg+xml']
]);

function resolveRequestPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://local.test').pathname);
  const candidate = path.resolve(repositoryRoot, `.${pathname}`);
  const rootWithSeparator = `${repositoryRoot}${path.sep}`;
  if (candidate !== repositoryRoot && !candidate.startsWith(rootWithSeparator)) {
    throw new Error('Path traversal rejected');
  }
  return candidate;
}

async function serveFile(request, response) {
  try {
    let filePath = resolveRequestPath(request.url);
    const metadata = await stat(filePath);
    if (metadata.isDirectory()) filePath = path.join(filePath, 'index.html');
    const body = await readFile(filePath);
    response.writeHead(200, {
      'content-type': contentTypes.get(path.extname(filePath)) ?? 'application/octet-stream',
      'cache-control': 'no-store'
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}

async function withServer(run) {
  const server = http.createServer((request, response) => void serveFile(request, response));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('repository-root HTTP route serves the complete Full Technology slice', async () => {
  await withServer(async (origin) => {
    const routes = [
      '/apps/seis-core/full-technology.html',
      '/apps/seis-core/full-technology-center.css',
      '/apps/seis-core/full-technology-center.js',
      '/apps/seis-core/full-technology-runtime.js',
      '/apps/seis-core/full-technology-service-worker.js',
      '/apps/seis-core/manifest.webmanifest',
      '/content/development/seis-full-technology-registry.json',
      '/content/development/seis-technology-tool-catalog.json',
      '/content/development/seis-workbench-composer.json',
      '/content/development/seis-engine-capability-registry.json',
      '/content/development/seis-full-technology-command-center.json',
      '/content/development/seis-full-technology-demo-acceptance.json'
    ];

    for (const route of routes) {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, `${route} must be served from repository root`);
    }

    const html = await fetch(`${origin}/apps/seis-core/full-technology.html`).then((response) => response.text());
    assert.match(html, /type="module" src="full-technology-center\.js"/);

    const registry = await fetch(`${origin}/content/development/seis-full-technology-registry.json`).then((response) => response.json());
    const catalog = await fetch(`${origin}/content/development/seis-technology-tool-catalog.json`).then((response) => response.json());
    const composer = await fetch(`${origin}/content/development/seis-workbench-composer.json`).then((response) => response.json());
    assert.equal(registry.domains.length, 16);
    assert.equal(catalog.tools.length, 48);
    assert.equal(composer.presets.length, 12);
  });
});

test('repository-root smoke server rejects traversal paths', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/%2e%2e%2fpackage.json`);
    assert.equal(response.status, 404);
  });
});
