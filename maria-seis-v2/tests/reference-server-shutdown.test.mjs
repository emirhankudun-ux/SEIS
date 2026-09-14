import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { once } from 'node:events';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const serverFile = fileURLToPath(new URL('../host/openAIReferenceServer.mjs', import.meta.url));
async function within(promise, milliseconds, fallback = null) {
  let timer;
  try {
    return await Promise.race([promise, new Promise(resolve => {
      timer = setTimeout(() => resolve(fallback), milliseconds);
    })]);
  } finally { clearTimeout(timer); }
}

for (const phase of ['incomplete-body', 'delayed-completion']) {
  test(`reference server reaps owned ${phase} connection on shutdown`, { timeout: 8000 }, async t => {
    // No adapter mocks: a real child, TCP connection and HTTP 100-continue.
    const child = spawn(process.execPath, [serverFile], {
      shell: false, env: {}, stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stderr.resume();
    const lines = createInterface({ input: child.stdout });
    const ended = new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal })));
    const startError = new Promise(resolve => child.once('error', error => resolve({ error })));
    let request;
    t.after(async () => {
      request?.destroy();
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
      await within(ended, 2000);
      lines.close();
    });
    const first = await within(Promise.race([once(lines, 'line'), startError]), 4000);
    assert.ok(Array.isArray(first), 'reference server did not become ready');
    const ready = JSON.parse(first[0]);
    const payload = JSON.stringify({ model: ready.model,
      messages: [{ role: 'user', content: 'DELAY_CANCEL fixture shutdown' }] });
    request = http.request({ host: '127.0.0.1', port: ready.port,
      path: '/v1/chat/completions', method: 'POST', agent: false,
      headers: { expect: '100-continue', 'content-type': 'application/json',
        'content-length': phase === 'incomplete-body' ? 1024 : Buffer.byteLength(payload) } });
    request.on('error', () => {}); // Reset on owner shutdown is expected.
    const accepted = once(request, 'continue');
    request.flushHeaders();
    assert.ok(await within(accepted, 2000), 'fixture request was not accepted');
    if (phase === 'incomplete-body') request.write('{');
    else request.end(payload);
    child.kill('SIGTERM');
    const result = await within(ended, 1000);
    assert.deepEqual(result, { code: 0, signal: null },
      'owned active HTTP connection prevented bounded clean child shutdown');
  });
}
