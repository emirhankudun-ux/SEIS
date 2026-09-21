/** Fault injection exercises the real host entry points, not an alternate lifecycle.
 * Only OS spawn/fs boundaries are replaced; no provider or user process is touched.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { runLocalModelCheck } from '../host/checkLocalModel.mjs';
import { runPackageCheck } from '../host/checkMcp.mjs';
import { runRecoveryCheck } from '../host/checkRecovery.mjs';

function replaceBuiltin(t, owner, key, implementation) {
  const replacement = t.mock.method(owner, key, implementation);
  syncBuiltinESMExports();
  t.after(() => { replacement.mock.restore(); syncBuiltinESMExports(); });
}

function observeTimers(t, {fast = false} = {}) {
  const schedule = globalThis.setTimeout;
  const clear = globalThis.clearTimeout;
  const active = new Set();
  t.mock.method(globalThis, 'setTimeout', (callback, ms, ...args) => {
    let handle;
    handle = schedule(() => { active.delete(handle); callback(...args); }, fast && ms === 1500 ? 20 : ms);
    active.add(handle);
    return handle;
  });
  t.mock.method(globalThis, 'clearTimeout', handle => { active.delete(handle); return clear(handle); });
  t.after(() => { for (const handle of active) clear(handle); });
  return active;
}

function replaceChild(t, {shutdown = 'term', startup = 'ready'} = {}) {
  const child = new EventEmitter();
  child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough();
  child.exitCode = null; child.signalCode = null;
  const signals = [];
  const exit = signal => {
    child.exitCode = signal ? null : 0; child.signalCode = signal;
    child.emit('exit', child.exitCode, child.signalCode);
    child.emit('close', child.exitCode, child.signalCode);
  };
  child.kill = signal => {
    signals.push(signal);
    if (shutdown === 'throw') throw new Error('synthetic private OS error');
    if (shutdown === 'sync') exit(null);
    else if (shutdown === 'term' && signal === 'SIGTERM') setImmediate(() => exit(null));
    else if (shutdown === 'force' && signal === 'SIGKILL') setImmediate(() => exit('SIGKILL'));
    return shutdown !== 'never';
  };
  replaceBuiltin(t, childProcess, 'spawn', () => {
    queueMicrotask(() => {
      if (startup === 'error') child.emit('error', new Error('synthetic startup failure'));
      else child.stdout.write(JSON.stringify({type:'ready',port:12345,model:'maria-reference-model'}) + '\n');
    });
    return child;
  });
  t.after(() => { child.stdin.destroy(); child.stdout.destroy(); child.stderr.destroy(); });
  return {child, signals};
}

function replaceProvider(t) {
  t.mock.method(globalThis, 'fetch', async (url, options = {}) => {
    if (url.endsWith('/v1/models')) return {ok:true,json:async()=>({data:[{id:'maria-reference-model'}]})};
    const command = JSON.parse(options.body).messages[0].content;
    if (command.includes('DELAY_CANCEL')) return new Promise((_, reject) => {
      if (options.signal.aborted) reject(new Error('aborted'));
      else options.signal.addEventListener('abort', () => reject(new Error('aborted')), {once:true});
    });
    return {ok:true,json:async()=>({id:'fixture-receipt',model:'maria-reference-model',
      choices:[{message:{content:'REFERENCE_TRANSPORT_OK:fixture'}}]})};
  });
}

test('successful reference cleanup clears its losing timeout and never sends a late SIGKILL', async t => {
  const active = observeTimers(t);
  const {signals} = replaceChild(t);
  replaceProvider(t);
  const result = await runLocalModelCheck();
  assert.equal(result.status, 'verified');
  assert.deepEqual(result.cleanup, {closed:true,code:0,signal:null});
  assert.deepEqual(signals, ['SIGTERM']);
  assert.equal(active.size, 0, 'a settled check retains a live timeout');
});

test('reference cleanup observes an exit that happens during signal dispatch', async t => {
  observeTimers(t, {fast:true});
  const {signals} = replaceChild(t, {shutdown:'sync',startup:'error'});
  const result = await runLocalModelCheck();
  assert.deepEqual(result.cleanup, {closed:true,code:0,signal:null});
  assert.deepEqual(signals, ['SIGTERM']);
  assert.equal(result.status, 'failed');
});

test('forced reference cleanup waits for the exit event rather than a successful kill return', async t => {
  const active = observeTimers(t, {fast:true});
  const {child, signals} = replaceChild(t, {shutdown:'force',startup:'error'});
  const result = await runLocalModelCheck();
  assert.deepEqual(result.cleanup, {closed:true,code:null,signal:'SIGKILL'});
  assert.equal(child.signalCode, 'SIGKILL');
  assert.deepEqual(signals, ['SIGTERM','SIGKILL']);
  assert.equal(result.status, 'failed');
  assert.equal(active.size, 0);
});

test('unobserved reference exit stays unclosed and does not erase the primary failure', async t => {
  const active = observeTimers(t, {fast:true});
  replaceChild(t, {shutdown:'never',startup:'error'});
  const result = await runLocalModelCheck();
  assert.equal(result.cleanup.closed, false);
  assert.equal(result.status, 'failed');
  assert.equal(result.reason, 'local-model-check-failed');
  assert.equal(active.size, 0);
});

test('cleanup delivery errors are bounded and redacted instead of escaping the host report', async t => {
  observeTimers(t, {fast:true});
  replaceChild(t, {shutdown:'throw',startup:'error'});
  let result;
  try { result = await runLocalModelCheck(); }
  catch { assert.fail('cleanup exception escaped instead of returning an unclosed report'); }
  assert.equal(result.status, 'failed');
  assert.equal(result.cleanup.closed, false);
  assert.ok(!JSON.stringify(result).includes('private OS error'));
});

test('successful transport with unclosed reference child is still downgraded', async t => {
  observeTimers(t, {fast:true});
  replaceChild(t, {shutdown:'never'});
  replaceProvider(t);
  const result = await runLocalModelCheck();
  assert.equal(result.status, 'unverified');
  assert.equal(result.verification.verifiedTransport, true);
  assert.equal(result.verification.verifiedExternalAction, false);
  assert.equal(result.cleanup.closed, false);
});

test('failed MCP startup stays failed when its owned child cannot be reaped', async t => {
  observeTimers(t, {fast:true});
  replaceChild(t, {shutdown:'never',startup:'error'});
  const result = await runPackageCheck();
  assert.equal(result.cleanup.closed, false);
  assert.equal(result.status, 'failed');
  assert.equal(result.reason, 'package-check-failed');
});

for (const probeSucceeded of [false, true]) {
  test(`recovery cleanup failure preserves ${probeSucceeded ? 'the success downgrade' : 'the primary failure'}`, t => {
    const realRemove = fs.rmSync;
    const directories = [];
    replaceBuiltin(t, fs, 'rmSync', directory => { directories.push(directory); throw new Error('fixture cleanup failure'); });
    t.after(() => { for (const directory of directories) realRemove(directory, {recursive:true,force:true}); });
    if (!probeSucceeded) replaceBuiltin(t, childProcess, 'spawnSync', () => ({status:1}));
    const result = runRecoveryCheck();
    assert.equal(result.cleanup, false);
    assert.equal(result.status, probeSucceeded ? 'unverified' : 'failed');
    if (!probeSucceeded) assert.equal(result.reason, 'recovery-check-failed');
    assert.equal(directories.length, 1);
  });
}

test('cancelled MCP startup keeps its cancellation reason despite cleanup failure', async t => {
  observeTimers(t, {fast:true});
  replaceChild(t, {shutdown:'never',startup:'error'});
  const controller = new AbortController();
  const pending = runPackageCheck({signal:controller.signal});
  controller.abort();
  const result = await pending;
  assert.equal(result.status, 'failed');
  assert.equal(result.reason, 'cancelled');
  assert.equal(result.cleanup.closed, false);
});

test('real reference child that ignores SIGTERM is observed exiting after SIGKILL', {timeout:10000}, async t => {
  const realSpawn = childProcess.spawn;
  const moduleUrl = new URL('../host/openAIReferenceServer.mjs', import.meta.url).href;
  const source = `import {runReferenceServer} from ${JSON.stringify(moduleUrl)};
    process.on('SIGTERM',()=>{});
    const {port,model}=await runReferenceServer();
    process.stdout.write(JSON.stringify({type:'ready',port,model})+'\\n');`;
  let child, closed;
  replaceBuiltin(t, childProcess, 'spawn', (command, _args, options) => {
    child = realSpawn(command, ['--input-type=module','-e',source], options);
    closed = new Promise(resolve=>child.once('close',()=>resolve(true)));
    return child;
  });
  t.after(async () => {
    if (!child) return;
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    let timer;
    try { assert.equal(await Promise.race([closed,new Promise(resolve=>{timer=setTimeout(()=>resolve(false),2000)})]),true); }
    finally { clearTimeout(timer); }
  });
  const result = await runLocalModelCheck();
  assert.equal(result.status,'verified',JSON.stringify(result));
  assert.equal(result.verification.verifiedExternalAction,false);
  assert.equal(result.cleanup.closed,true);
  assert.equal(result.cleanup.signal,process.platform==='win32'?'SIGTERM':'SIGKILL');
  assert.equal(child.signalCode,result.cleanup.signal);
});
