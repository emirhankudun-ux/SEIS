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

test('a throwing health check retains only the connected session for later cleanup', async () => {
  const manager = createHostAdapterManager();
  let disconnected;
  let executions = 0;
  manager.register({id:'health-failure',apiVersion:'2',capabilities:['reasoning'],
    connect:async()=>({sessionId:'cleanup-session'}),
    health:async()=>{throw new Error('synthetic private health error')},
    execute:async()=>{executions++},
    disconnect:async context=>{disconnected=context.sessionId}
  });
  const result = await manager.connect('health-failure');
  assert.equal(result.status,'failed');
  assert.equal(result.sessionId,'cleanup-session');
  assert.equal(result.healthVerified,false);
  assert.deepEqual(result.capabilities,[]);
  assert.equal(result.lastError,'connect-failed');
  assert.equal((await manager.execute('health-failure','reasoning',{})).status,'unavailable');
  await manager.disconnect('health-failure');
  assert.equal(disconnected,'cleanup-session');
  assert.equal(executions,0);
  assert.equal(manager.get('health-failure').sessionId,null);
});

test('a session is retained while health is pending without granting readiness', async () => {
  const manager = createHostAdapterManager();
  let release;
  const health = new Promise(resolve=>{release=resolve});
  manager.register({id:'pending-health',apiVersion:'2',capabilities:['reasoning'],
    connect:async()=>({sessionId:'pending-session'}),health:()=>health,
    execute:async()=>({ok:true}),disconnect:async()=>{}
  });
  const connecting=manager.connect('pending-health');
  await Promise.resolve();
  const pending=manager.get('pending-health');
  release({ok:false});
  await connecting;
  assert.equal(pending.sessionId,'pending-session');
  assert.equal(pending.status,'connecting');
  assert.equal(pending.healthVerified,false);
  assert.deepEqual(pending.capabilities,[]);
});

test('failed health cleanup releases the actual Ollama adapter session', async () => {
  const {createLocalOllamaAdapter}=await import('../src/adapters/localOllama.js');
  let requests=0;
  const adapter=createLocalOllamaAdapter({model:'fixture-model',fetchImpl:async()=>{
    requests++;
    if(requests===1)return {ok:true,json:async()=>({models:[{name:'fixture-model'}]})};
    throw new Error('synthetic offline health');
  }});
  const manager=createHostAdapterManager(); manager.register(adapter);
  const state=await manager.connect(adapter.id);
  assert.equal(state.status,'failed');
  assert.equal(typeof state.sessionId,'string');
  await manager.disconnect(adapter.id);
  const health=await adapter.health({session:{sessionId:state.sessionId}});
  assert.equal(health.reason,'session-unavailable');
  assert.equal(requests,2,'disconnected session attempted another network probe');
});
