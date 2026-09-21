import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once, getEventListeners } from 'node:events';
import { createLocalOpenAICompatibleAdapter } from '../src/adapters/localOpenAICompatible.js';
import { createLocalOllamaAdapter } from '../src/adapters/localOllama.js';

// These are protocol fixtures, not installed models or semantic AI acceptance.
const specs = [
  { name: 'openai-compatible', create: createLocalOpenAICompatibleAdapter,
    listPath: '/v1/models', list: { data: [{ id: 'fixture' }] },
    reply: { id: 'fixture-receipt', model: 'fixture', choices: [{ message: { content: 'ready' } }] } },
  { name: 'ollama', create: createLocalOllamaAdapter,
    listPath: '/api/tags', list: { models: [{ name: 'fixture', model: 'fixture' }] },
    reply: { model: 'fixture', created_at: '2026-09-13T00:00:00Z', done: true,
      message: { content: 'ready' } } },
];
const response = value => ({ ok: true, json: async () => value });
const pendingBody = () => new Promise(() => {});
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};
const execute = (adapter, session, signal) => adapter.execute(
  { command: 'fixture status', projectId: 'seis', runId: 'fixture-run', intent: 'general' },
  { capability: 'reasoning', sessionId: session.sessionId, signal },
);
async function boundedOutcome(promise, ms = 1000) {
  let timer;
  try {
    return await Promise.race([
      promise.then(value => ({ value }), error => ({ error })),
      new Promise(resolve => { timer = setTimeout(() => resolve({ pending: true }), ms); }),
    ]);
  } finally { clearTimeout(timer); }
}
function assertFailure(result, message) {
  assert.equal(result.pending, undefined, 'request outlived the adapter deadline/cancellation');
  assert.equal(result.error?.message, message);
  assert.equal(result.value, undefined, 'failed request must not publish a session or receipt');
}

for (const spec of specs) {
  test(`${spec.name}: discovery deadline includes a non-settling JSON body`, async () => {
    let transportSignal;
    const adapter = spec.create({ model: 'fixture', requestTimeoutMs: 30,
      fetchImpl: async (_url, options) => {
        transportSignal = options.signal;
        return { ok: true, json: pendingBody };
      } });
    assertFailure(await boundedOutcome(adapter.connect()), 'request timed out');
    assert.equal(transportSignal.aborted, true);
  });

  test(`${spec.name}: execution deadline covers response consumption`, async () => {
    let transportSignal;
    const adapter = spec.create({ model: 'fixture', requestTimeoutMs: 30,
      fetchImpl: async (url, options) => {
        if (url.endsWith(spec.listPath)) return response(spec.list);
        transportSignal = options.signal;
        return { ok: true, json: pendingBody };
      } });
    const session = await adapter.connect();
    assertFailure(await boundedOutcome(execute(adapter, session)), 'request timed out');
    assert.equal(transportSignal.aborted, true);
  });

  test(`${spec.name}: cancellation during discovery body closes only this request`, async () => {
    const controller = new AbortController();
    const started = deferred();
    let transportSignal;
    const adapter = spec.create({ model: 'fixture', requestTimeoutMs: 5000,
      fetchImpl: async (_url, options) => {
        transportSignal = options.signal;
        return { ok: true, json() { started.resolve(); return pendingBody(); } };
      } });
    const pending = adapter.connect({ signal: controller.signal });
    await started.promise;
    controller.abort(new Error('private cancellation details'));
    assertFailure(await boundedOutcome(pending), 'request cancelled');
    assert.equal(transportSignal.aborted, true);
    assert.equal(getEventListeners(controller.signal, 'abort').length, 0);
  });

  test(`${spec.name}: cancelled completion cannot become a late success`, async () => {
    const controller = new AbortController();
    const started = deferred();
    const body = deferred();
    const adapter = spec.create({ model: 'fixture', requestTimeoutMs: 5000,
      fetchImpl: async url => url.endsWith(spec.listPath) ? response(spec.list)
        : { ok: true, json() { started.resolve(); return body.promise; } } });
    const session = await adapter.connect();
    const pending = execute(adapter, session, controller.signal);
    await started.promise;
    controller.abort();
    body.resolve(spec.reply);
    assertFailure(await boundedOutcome(pending), 'request cancelled');
    assert.equal(getEventListeners(controller.signal, 'abort').length, 0);
  });

  test(`${spec.name}: pre-aborted discovery and execution never dispatch`, async () => {
    const controller = new AbortController();
    controller.abort();
    let calls = 0;
    const adapter = spec.create({ model: 'fixture', fetchImpl: async () => {
      calls += 1; return response(spec.list);
    } });
    assertFailure(await boundedOutcome(adapter.connect({ signal: controller.signal })), 'request cancelled');
    assert.equal(calls, 0);
    const session = await adapter.connect();
    const before = calls;
    assertFailure(await boundedOutcome(execute(adapter, session, controller.signal)), 'request cancelled');
    assert.equal(calls, before);
  });

  test(`${spec.name}: timeout settles even when fetch ignores cancellation`, async () => {
    const headers = deferred();
    let jsonCalls = 0;
    let transportSignal;
    const adapter = spec.create({ model: 'fixture', requestTimeoutMs: 30,
      fetchImpl: (_url, options) => { transportSignal = options.signal; return headers.promise; } });
    const result = await boundedOutcome(adapter.connect());
    headers.resolve({ ok: true, json() { jsonCalls += 1; return spec.list; } });
    await new Promise(resolve => setImmediate(resolve));
    assertFailure(result, 'request timed out');
    assert.equal(transportSignal.aborted, true);
    assert.equal(jsonCalls, 0, 'late headers must not start body processing');
  });

  test(`${spec.name}: completed requests detach the caller and clear their timer`, async () => {
    const controller = new AbortController();
    let transportSignal;
    const adapter = spec.create({ model: 'fixture', requestTimeoutMs: 30,
      fetchImpl: async (_url, options) => { transportSignal = options.signal; return response(spec.list); } });
    await adapter.connect({ signal: controller.signal });
    assert.equal(getEventListeners(controller.signal, 'abort').length, 0);
    controller.abort();
    await new Promise(resolve => setTimeout(resolve, 60));
    assert.equal(transportSignal.aborted, false, 'a completed request must not be aborted later');
  });

  test(`${spec.name}: body parsing errors stay redacted and detach listeners`, async () => {
    const controller = new AbortController();
    const adapter = spec.create({ model: 'fixture', fetchImpl: async () => ({ ok: true,
      json: async () => { throw new Error('private provider payload'); } }) });
    assertFailure(await boundedOutcome(adapter.connect({ signal: controller.signal })), 'models response invalid');
    assert.equal(getEventListeners(controller.signal, 'abort').length, 0);
  });

  for (const phase of ['discovery-timeout', 'completion-cancel']) {
    test(`${spec.name}: real HTTP ${phase} aborts a body after headers`, { timeout: 6000 }, async t => {
      const started = deferred();
      const closed = deferred();
      const reading = deferred();
      let stall = true;
      const server = http.createServer((req, res) => {
        req.resume();
        const discovery = req.url === spec.listPath;
        if (stall && (phase === 'discovery-timeout' ? discovery : !discovery)) {
          res.writeHead(200, { 'content-type': 'application/json' });
          res.flushHeaders();
          res.write('{');
          res.once('close', closed.resolve);
          started.resolve();
        } else {
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(discovery ? spec.list : spec.reply));
        }
      });
      t.after(async () => {
        const done = new Promise(resolve => server.close(resolve));
        server.closeAllConnections();
        await done;
      });
      server.listen(0, '127.0.0.1');
      await once(server, 'listening');
      const controller = new AbortController();
      const adapter = spec.create({ model: 'fixture', baseUrl: `http://127.0.0.1:${server.address().port}`,
        requestTimeoutMs: 400,
        fetchImpl: async (url, options) => {
          const res = await fetch(url, options);
          const discovery = url.endsWith(spec.listPath);
          return { ok: res.ok, json() {
            if (stall && (phase === 'discovery-timeout' ? discovery : !discovery)) reading.resolve();
            return res.json();
          } };
        } });
      let pending;
      if (phase === 'discovery-timeout') pending = adapter.connect({ signal: controller.signal });
      else {
        const session = await adapter.connect();
        pending = execute(adapter, session, controller.signal);
      }
      // Attach rejection handlers immediately, before waiting for the server.
      const outcome = boundedOutcome(pending, 2500);
      assert.equal((await boundedOutcome(started.promise, 2000)).pending, undefined, 'fixture never sent headers');
      assert.equal((await boundedOutcome(reading.promise, 2000)).pending, undefined, 'client never consumed body');
      if (phase === 'completion-cancel') controller.abort();
      assertFailure(await outcome, phase === 'completion-cancel' ? 'request cancelled' : 'request timed out');
      assert.equal((await boundedOutcome(closed.promise, 1000)).pending, undefined, 'transport socket stayed open');
      stall = false;
      const session = await adapter.connect();
      const receipt = await execute(adapter, session);
      assert.equal(receipt.output, 'ready');
      assert.equal(receipt.outcomeVerified, false);
      assert.equal(receipt.verificationScope, 'model-response-transport');
      await adapter.disconnect({ sessionId: session.sessionId });
    });
  }
}

test('Ollama health refresh retains cancellation while reading tags', async () => {
  const controller = new AbortController();
  const started = deferred();
  let first = true;
  const spec = specs[1];
  const adapter = spec.create({ model: 'fixture', fetchImpl: async () => {
    if (first) { first = false; return response(spec.list); }
    return { ok: true, json() { started.resolve(); return pendingBody(); } };
  } });
  const session = await adapter.connect();
  const pending = adapter.health({ session, signal: controller.signal });
  await started.promise;
  controller.abort();
  assertFailure(await boundedOutcome(pending), 'request cancelled');
});
