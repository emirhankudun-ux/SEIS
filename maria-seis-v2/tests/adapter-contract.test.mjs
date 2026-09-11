import test from 'node:test';
import assert from 'node:assert/strict';
import { createHostAdapterManager, validateHostAdapter } from '../src/adapters/hostAdapter.js';

test('host adapter contract rejects incompatible or incomplete adapters', () => {
  const incomplete = validateHostAdapter({ id:'local-model', apiVersion:'1', capabilities:['reasoning'] });
  assert.equal(incomplete.valid,false);
  assert.ok(incomplete.errors.includes('missing connect'));
  const incompatible = validateHostAdapter({
    id:'local-model', apiVersion:'9', capabilities:['reasoning'],
    connect:async()=>({}), health:async()=>({ok:true}), execute:async()=>({ok:true}), disconnect:async()=>{}
  });
  assert.equal(incompatible.valid,false);
  assert.ok(incompatible.errors.includes('incompatible apiVersion'));
});

test('manager marks adapter ready only after successful handshake and verified health', async () => {
  const manager=createHostAdapterManager({apiVersion:'2'});
  manager.register({
    id:'local-model', apiVersion:'2', capabilities:['reasoning','coding'],
    connect:async()=>({sessionId:'s1'}),
    health:async()=>({ok:true, capabilities:['reasoning'], evidence:'model-loaded'}),
    execute:async()=>({ok:true}), disconnect:async()=>{}
  });
  assert.equal(manager.get('local-model').status,'unconfigured');
  const result=await manager.connect('local-model');
  assert.equal(result.status,'ready');
  const state=manager.get('local-model');
  assert.equal(state.healthVerified,true);
  assert.deepEqual(state.capabilities,['reasoning']);
  assert.equal(state.sessionId,'s1');
});

test('failed health check never exposes adapter as ready', async () => {
  const manager=createHostAdapterManager({apiVersion:'2'});
  manager.register({
    id:'mcp', apiVersion:'2', capabilities:['tools'],
    connect:async()=>({sessionId:'m1'}), health:async()=>({ok:false,reason:'gateway-offline'}),
    execute:async()=>({ok:true}), disconnect:async()=>{}
  });
  const result=await manager.connect('mcp');
  assert.equal(result.status,'degraded');
  assert.equal(manager.get('mcp').healthVerified,false);
  assert.equal(manager.get('mcp').lastError,'gateway-offline');
});

test('execute requires ready state and a verified capability', async () => {
  let calls=0;
  const manager=createHostAdapterManager({apiVersion:'2'});
  manager.register({
    id:'local-model', apiVersion:'2', capabilities:['reasoning'],
    connect:async()=>({}), health:async()=>({ok:true,capabilities:['reasoning']}),
    execute:async(request)=>{calls++;return {ok:true,request}}, disconnect:async()=>{}
  });
  const before=await manager.execute('local-model','reasoning',{prompt:'x'});
  assert.equal(before.status,'unavailable');
  await manager.connect('local-model');
  const denied=await manager.execute('local-model','coding',{prompt:'x'});
  assert.equal(denied.status,'denied');
  const ok=await manager.execute('local-model','reasoning',{prompt:'x'});
  assert.equal(ok.status,'ok');
  assert.equal(calls,1);
});

test('disconnect clears verified session state', async () => {
  const manager=createHostAdapterManager({apiVersion:'2'});
  manager.register({
    id:'local-model', apiVersion:'2', capabilities:['reasoning'],
    connect:async()=>({sessionId:'s1'}), health:async()=>({ok:true,capabilities:['reasoning']}),
    execute:async()=>({ok:true}), disconnect:async()=>{}
  });
  await manager.connect('local-model');
  const result=await manager.disconnect('local-model');
  assert.equal(result.status,'unconfigured');
  const state=manager.get('local-model');
  assert.equal(state.healthVerified,false);
  assert.equal(state.sessionId,null);
  assert.deepEqual(state.capabilities,[]);
});
