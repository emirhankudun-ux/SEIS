import test from 'node:test';
import assert from 'node:assert/strict';
import { createHostAdapterManager } from '../src/adapters/hostAdapter.js';

const gate=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject};};
const turn=()=>new Promise(resolve=>setImmediate(resolve));
function setup(overrides={}){
  const manager=createHostAdapterManager();
  manager.register({id:'owned',apiVersion:'2',capabilities:['reasoning'],
    connect:async()=>({sessionId:'same-id'}),health:async()=>({ok:true,capabilities:['reasoning']}),
    execute:async()=>({value:'ok'}),disconnect:async()=>{},...overrides});
  return manager;
}

test('disconnect during handshake revokes readiness and cleans the late session before reconnection',async()=>{
  const connected=gate();let signal,healthCalls=0;const cleaned=[];
  const manager=setup({connect:context=>{signal=context.signal;return connected.promise},
    health:async()=>{healthCalls++;return {ok:true}},disconnect:async context=>{cleaned.push(context.sessionId)}});
  const opening=manager.connect('owned');
  const closing=manager.disconnect('owned');
  const during=manager.get('owned');
  connected.resolve({sessionId:'late-session'});
  const [opened,closed]=await Promise.all([opening,closing]);
  assert.equal(during.status,'disconnecting');
  assert.equal(during.healthVerified,false);
  assert.equal(signal.aborted,true);
  assert.notEqual(opened.status,'ready');
  assert.equal(healthCalls,0);
  assert.deepEqual(cleaned,['late-session']);
  assert.equal(closed.status,'unconfigured');
  assert.equal(manager.get('owned').sessionId,null);
});

test('late health success cannot reopen a disconnected session',async()=>{
  const health=gate();const started=gate();const cleaned=[];
  const manager=setup({health:()=>{started.resolve();return health.promise},disconnect:async c=>{cleaned.push(c.sessionId)}});
  const opening=manager.connect('owned');await started.promise;
  const closing=manager.disconnect('owned');
  health.resolve({ok:true,capabilities:['reasoning']});
  const [opened,closed]=await Promise.all([opening,closing]);
  assert.notEqual(opened.status,'ready');
  assert.equal(closed.status,'unconfigured');
  assert.equal(manager.get('owned').healthVerified,false);
  assert.deepEqual(cleaned,['same-id']);
});

test('disconnect blocks new execution immediately while cleanup is still pending',async()=>{
  const cleanup=gate();let executions=0;
  const manager=setup({execute:async()=>{executions++},disconnect:()=>cleanup.promise});
  await manager.connect('owned');const closing=manager.disconnect('owned');
  const result=await manager.execute('owned','reasoning',{});
  cleanup.resolve();await closing;
  assert.equal(result.status,'unavailable');assert.equal(executions,0);
});

for(const outcome of ['resolve','reject'])test(`late execution ${outcome} cannot publish for a replacement session with the same ID`,async()=>{
  const execution=gate();
  const manager=setup({execute:()=>execution.promise});
  await manager.connect('owned');const work=manager.execute('owned','reasoning',{});
  await manager.disconnect('owned');await manager.connect('owned');
  if(outcome==='resolve')execution.resolve({value:'stale'});else execution.reject(new Error('private old failure'));
  assert.deepEqual(await work,{status:'unavailable',reason:'adapter-session-ended'});
  assert.equal(manager.get('owned').status,'ready');await manager.disconnect('owned');
});

test('parallel connect is explicitly refused instead of leaking another session or mixing contexts',async()=>{
  const first=gate();let calls=0;
  const manager=setup({connect:()=>++calls===1?first.promise:Promise.resolve({sessionId:'duplicate'})});
  const opening=manager.connect('owned');
  const other=manager.connect('owned',{identity:'other'}).then(()=>null,error=>error);
  first.resolve({sessionId:'first'});await opening;
  assert.match((await other)?.message??'',/adapter lifecycle busy/);
  assert.equal(calls,1);await manager.disconnect('owned');
});

test('an owned ready or failed session requires explicit disconnect before reconnect',async()=>{
  for(const throws of [false,true]){
    let calls=0;
    const manager=setup({connect:async()=>({sessionId:`session-${++calls}`}),health:async()=>{
      if(throws)throw new Error('private health');return {ok:true};
    }});
    await manager.connect('owned');
    await assert.rejects(manager.connect('owned'),/adapter session requires disconnect/);
    assert.equal(calls,1);await manager.disconnect('owned');await manager.connect('owned');
    assert.equal(calls,2);await manager.disconnect('owned');
  }
});

test('concurrent disconnect calls invoke adapter cleanup once',async()=>{
  const cleanup=gate();let calls=0;
  const manager=setup({disconnect:()=>{calls++;return cleanup.promise}});
  await manager.connect('owned');
  const a=manager.disconnect('owned'),b=manager.disconnect('owned');await turn();
  const before=calls;cleanup.resolve();await Promise.all([a,b]);
  assert.equal(before,1);assert.equal(manager.get('owned').status,'unconfigured');
});

test('reconnect is refused until pending cleanup settles; no late cleanup can erase it',async()=>{
  const cleanup=gate();let connects=0;
  const manager=setup({connect:async()=>({sessionId:`s${++connects}`}),disconnect:()=>cleanup.promise});
  await manager.connect('owned');const closing=manager.disconnect('owned');
  const attempt=manager.connect('owned').then(()=>null,error=>error);
  cleanup.resolve();await closing;
  assert.match((await attempt)?.message??'',/adapter lifecycle busy/);
  assert.equal(connects,1);await manager.connect('owned');assert.equal(manager.get('owned').sessionId,'s2');
});

test('cleanup failure preserves ownership for an explicit retry without readiness',async()=>{
  const cleaned=[];let fail=true;
  const manager=setup({disconnect:async context=>{cleaned.push(context.sessionId);if(fail)throw new Error('private cleanup');}});
  await manager.connect('owned');const result=await manager.disconnect('owned');
  assert.equal(result.status,'failed');assert.equal(result.sessionId,'same-id');
  assert.equal(result.lastError,'disconnect-failed');assert.deepEqual(result.capabilities,[]);
  await assert.rejects(manager.connect('owned'),/adapter session requires disconnect/);
  fail=false;assert.equal((await manager.disconnect('owned')).status,'unconfigured');
  assert.deepEqual(cleaned,['same-id','same-id']);
});

test('failed handshake without a returned session remains explicitly retryable',async()=>{
  let calls=0;const manager=setup({connect:async()=>{if(++calls===1)throw new Error('offline');return {sessionId:'retry'};}});
  assert.equal((await manager.connect('owned')).status,'failed');
  assert.equal((await manager.connect('owned')).status,'ready');await manager.disconnect('owned');
});

test('pre-aborted connection never dispatches handshake or health',async()=>{
  let calls=0;const controller=new AbortController();controller.abort('private reason');
  const manager=setup({connect:async()=>{calls++;return {sessionId:'wrong'}}});
  const result=await manager.connect('owned',{signal:controller.signal});
  assert.equal(result.status,'failed');assert.equal(result.lastError,'connect-cancelled');assert.equal(calls,0);
});

test('caller cancellation cannot publish a late successful health result',async()=>{
  const health=gate(),started=gate();const controller=new AbortController();let observed;
  const manager=setup({health:({signal})=>{observed=signal;started.resolve();return health.promise}});
  const opening=manager.connect('owned',{signal:controller.signal});await started.promise;
  controller.abort('private reason');health.resolve({ok:true});
  const result=await opening;
  assert.equal(observed.aborted,true);assert.equal(result.status,'failed');assert.equal(result.lastError,'connect-cancelled');
  await manager.disconnect('owned');
});

test('health must be literal true, not a truthy value',async()=>{
  for(const ok of ['false',1,{},[],Promise.resolve(true)]){
    const manager=setup({health:async()=>({ok})});
    assert.equal((await manager.connect('owned')).status,'degraded');
    assert.equal((await manager.execute('owned','reasoning',{})).status,'unavailable');
    await manager.disconnect('owned');
  }
});

test('adapter-wide cleanup cannot cross a new stateless session boundary',async()=>{
  const health=gate(),started=gate();let cleanups=0;
  const manager=setup({connect:async()=>({}),health:()=>{started.resolve();return health.promise},disconnect:async()=>{cleanups++}});
  const opening=manager.connect('owned');await started.promise;
  const closing=manager.disconnect('owned');health.resolve({ok:true});
  await Promise.all([opening,closing]);assert.equal(cleanups,1);assert.equal(manager.get('owned').status,'unconfigured');
});

test('independent adapters retain independent lifecycle ownership',async()=>{
  const slow=gate();const manager=setup({disconnect:()=>slow.promise});
  manager.register({id:'other',apiVersion:'2',capabilities:['reasoning'],connect:async()=>({sessionId:'other'}),
    health:async()=>({ok:true}),execute:async()=>({value:'independent'}),disconnect:async()=>{}});
  await manager.connect('owned');const closing=manager.disconnect('owned');
  await manager.connect('other');const result=await manager.execute('other','reasoning',{});
  slow.resolve();await closing;assert.equal(result.status,'ok');assert.equal(manager.get('other').status,'ready');
});

test('throwing context access cannot strand the lifecycle or expose raw errors',async()=>{
  let calls=0;const manager=setup({connect:async()=>{calls++;return {sessionId:'after'}}});
  const result=await manager.connect('owned',{get signal(){throw new Error('private context')}}).catch(error=>({escaped:error.message}));
  assert.equal(result.status,'failed');assert.equal(result.lastError,'connect-failed');assert.equal(calls,0);
  assert.equal((await manager.connect('owned')).status,'ready');await manager.disconnect('owned');
});

test('caller listener is detached once the handshake has settled',async()=>{
  const controller=new AbortController();let adds=0,removes=0,inner;
  const signal={get aborted(){return controller.signal.aborted},
    addEventListener(...args){adds++;controller.signal.addEventListener(...args)},
    removeEventListener(...args){removes++;controller.signal.removeEventListener(...args)}};
  const manager=setup({connect:async context=>{inner=context.signal;return {sessionId:'bound'}}});
  await manager.connect('owned',{signal});controller.abort();
  assert.equal(adds,1);assert.equal(removes,1);assert.equal(inner.aborted,false);
  await manager.disconnect('owned');assert.equal(inner.aborted,true);
});

test('real Ollama-shaped HTTP health cancellation closes only its session and allows clean reconnect',{timeout:8000},async t=>{
  const {createServer}=await import('node:http');
  const {createLocalOllamaAdapter}=await import('../src/adapters/localOllama.js');
  const accepted=gate();let lists=0,closed=gate();
  const server=createServer((request,response)=>{
    if(request.url==='/api/tags'){
      lists++;
      if(lists===2){
        response.on('close',()=>closed.resolve(true));
        response.writeHead(200,{'content-type':'application/json'});response.flushHeaders();response.write('{');
        accepted.resolve();return;
      }
      response.setHeader('content-type','application/json');response.end(JSON.stringify({models:[{name:'fixture'}]}));return;
    }
    request.resume();response.setHeader('content-type','application/json');
    response.end(JSON.stringify({model:'fixture',done:true,created_at:'2026-09-13T00:00:00Z',message:{content:'fixture response'}}));
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections()}));
  const adapter=createLocalOllamaAdapter({model:'fixture',baseUrl:`http://127.0.0.1:${server.address().port}`,requestTimeoutMs:1500});
  const manager=createHostAdapterManager();manager.register(adapter);
  const opening=manager.connect(adapter.id);
  await accepted.promise;const sessionId=manager.get(adapter.id).sessionId;
  const closing=manager.disconnect(adapter.id);const [opened,result]=await Promise.all([opening,closing]);
  assert.equal(result.status,'unconfigured');assert.notEqual(opened.status,'ready');
  assert.equal(manager.get(adapter.id).status,'unconfigured');
  assert.equal((await adapter.health({session:{sessionId}})).reason,'session-unavailable');
  let timer;try{assert.equal(await Promise.race([closed.promise,new Promise(resolve=>{timer=setTimeout(()=>resolve(false),1000)})]),true)}finally{clearTimeout(timer)}
  assert.equal(lists,2,'orphaned session performed another health request');
  assert.equal((await manager.connect(adapter.id)).status,'ready');
  const response=await manager.execute(adapter.id,'reasoning',{command:'fixture',runId:'run',projectId:'project',intent:'general'});
  assert.equal(response.status,'ok');assert.equal(response.result.outcomeVerified,false);
  await manager.disconnect(adapter.id);
});
