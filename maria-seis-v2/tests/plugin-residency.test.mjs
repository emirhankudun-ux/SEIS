import test from 'node:test';
import assert from 'node:assert/strict';
import {createPluginHost} from '../src/plugins/host.js';

const manifest=(id='sample')=>({id,name:id,version:'1.0.0',apiVersion:'2',
  capabilities:['inspect'],permissions:['project.read'],risk:'observe'});
const context=signal=>({grantedPermissions:['project.read'],...(signal?{signal}:{})});
const invoke=(host,id='sample',signal)=>host.invoke(id,'inspect',{},context(signal));
const gate=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const turn=()=>new Promise(resolve=>setImmediate(resolve));
function managed(host,id='sample',factory=()=>({inspect:()=>id}),dispose=()=>{}) {
  host.register(manifest(id),factory,{dispose});
}
const limit={status:'unavailable',reason:'plugin-residency-limit'};
const busy={status:'unavailable',reason:'plugin-busy'};

test('200 registrations remain lazy and registered after unloading eight requested plugins',async()=>{
  const host=createPluginHost({resourceProfile:'standard'});
  let created=0,disposed=0;
  for(let i=0;i<200;i++) managed(host,`item-${i}`,()=>{created++;return {inspect:()=>i};},()=>{disposed++;});
  assert.equal(created,0);
  assert.equal(typeof host.residencyStats,'function');
  assert.equal(host.residencyStats().registered,200);
  assert.equal(host.residencyStats().resident,0);
  for(let i=0;i<8;i++) assert.equal((await invoke(host,`item-${i}`)).value,i);
  assert.deepEqual(await invoke(host,'item-8'),limit);
  assert.equal(created,8);
  const released=await host.unloadIdle();
  assert.equal(released.filter(x=>x.unloaded).length,8);
  assert.equal(disposed,8);
  assert.equal(host.residencyStats().resident,0);
  assert.equal(host.list().length,200);
  assert.equal((await invoke(host,'item-8')).value,8);
  await host.unloadIdle();
});

for(const [profile,count] of [['lite',4],['standard',8],['workstation',16]]) {
  test(`${profile} limits resident instances, not the number of registrations`,async()=>{
    const host=createPluginHost({resourceProfile:profile});let created=0;
    for(let i=0;i<=count;i++) managed(host,`p-${i}`,()=>{created++;return {inspect:()=>i};});
    for(let i=0;i<count;i++) await invoke(host,`p-${i}`);
    assert.deepEqual(await invoke(host,`p-${count}`),limit);
    assert.equal(created,count);
    assert.equal(host.list().length,count+1);
    await host.unloadIdle();
  });
}

test('unload preserves metadata and reload checks permissions again',async()=>{
  const host=createPluginHost();let created=0,disposed=0;
  managed(host,'sample',()=>{created++;return {inspect:()=>created};},()=>{disposed++;});
  assert.equal((await invoke(host)).value,1);
  assert.equal(typeof host.unload,'function');
  assert.deepEqual(await host.unload('sample'),{status:'ok',unloaded:true});
  assert.deepEqual(host.list(),[manifest()]);
  assert.equal(host.getResidency('sample').state,'registered');
  assert.equal((await host.invoke('sample','inspect',{})).status,'denied');
  assert.equal(created,1);
  assert.equal((await invoke(host)).value,2);
  assert.equal(disposed,1);
  await host.unload('sample');
});

test('active work cannot be unloaded by a manual call or idle sweep',async()=>{
  const done=gate();const host=createPluginHost();let disposed=0;
  managed(host,'sample',()=>({inspect:()=>done.promise}),()=>{disposed++;});
  const call=invoke(host);await turn();
  assert.equal(typeof host.unload,'function');
  assert.deepEqual(await host.unload('sample'),busy);
  assert.deepEqual(await host.unloadIdle(),[]);
  assert.equal(disposed,0);
  done.resolve('completed');assert.equal((await call).value,'completed');
  assert.equal((await host.unload('sample')).unloaded,true);
});

test('cancelled caller does not make an uncooperative running capability idle',async()=>{
  const done=gate(),controller=new AbortController();const host=createPluginHost();
  managed(host,'sample',()=>({inspect:()=>done.promise}));
  const call=invoke(host,'sample',controller.signal);await turn();controller.abort();
  assert.equal((await call).status,'cancelled');
  assert.equal(typeof host.unload,'function');
  assert.deepEqual(await host.unload('sample'),busy);
  assert.equal(host.getResidency('sample').activeExecutions,1);
  done.resolve('late');await turn();
  assert.equal((await host.unload('sample')).unloaded,true);
});

test('timed-out capability retains its resident slot until actual settlement',async()=>{
  const done=gate();const host=createPluginHost({timeoutMs:20,maxResidentPlugins:1});
  managed(host,'sample',()=>({inspect:()=>done.promise}));managed(host,'other');
  assert.equal((await invoke(host)).reason,'plugin-timeout');
  assert.deepEqual(await invoke(host,'other'),limit);
  assert.deepEqual(await host.unload('sample'),busy);
  done.reject(new Error('private late failure'));await turn();
  await host.unload('sample');assert.equal((await invoke(host,'other')).status,'ok');
  await host.unloadIdle();
});

test('loading reserves capacity before a second factory can start',async()=>{
  const ready=gate();const host=createPluginHost({maxResidentPlugins:1});let others=0;
  managed(host,'sample',()=>ready.promise);managed(host,'other',()=>{others++;return {inspect:()=>1};});
  const pending=invoke(host);await turn();
  assert.deepEqual(await invoke(host,'other'),limit);
  assert.equal(others,0);
  assert.deepEqual(await host.unload('sample'),busy);
  ready.resolve({inspect:()=>1});await pending;await host.unloadIdle();
});

test('concurrent unload calls share one cleanup; reload is blocked until it settles',async()=>{
  const done=gate();const host=createPluginHost();let disposed=0;
  managed(host,'sample',()=>({inspect:()=>1}),()=>{disposed++;return done.promise;});
  await invoke(host);
  assert.equal(typeof host.unload,'function');
  const a=host.unload('sample'),b=host.unload('sample');await turn();
  assert.equal(disposed,1);
  assert.equal(host.getResidency('sample').state,'unloading');
  assert.equal((await invoke(host)).reason,'plugin-unloading');
  done.resolve();assert.deepEqual(await a,{status:'ok',unloaded:true});assert.deepEqual(await b,await a);
  assert.equal(host.residencyStats().resident,0);
});

test('cleanup failure quarantines the instance and permits only explicit cleanup retry',async()=>{
  const host=createPluginHost();let attempts=0;
  managed(host,'sample',()=>({inspect:()=>1}),()=>{if(++attempts===1)throw new Error('private cleanup details');});
  await invoke(host);assert.equal(typeof host.unload,'function');
  assert.deepEqual(await host.unload('sample'),{status:'failed',reason:'plugin-unload-failed'});
  assert.equal(host.getResidency('sample').state,'quarantined');
  assert.equal((await invoke(host)).reason,'plugin-quarantined');
  assert.deepEqual(await host.unloadIdle(),[]);
  assert.equal(attempts,1);
  assert.equal(host.residencyStats().resident,1);
  assert.equal((await host.unload('sample')).unloaded,true);
  assert.equal((await invoke(host)).status,'ok');await host.unloadIdle();
});

test('never-settling cleanup times out without allowing a competing instance',async()=>{
  const done=gate();const host=createPluginHost({timeoutMs:20,maxResidentPlugins:1});let signal,attempts=0;
  managed(host,'sample',()=>({inspect:()=>1}),(_instance,ctx)=>{signal=ctx.signal;attempts++;return done.promise;});
  managed(host,'other');await invoke(host);assert.equal(typeof host.unload,'function');
  assert.deepEqual(await host.unload('sample'),{status:'failed',reason:'plugin-unload-timeout'});
  assert.equal(signal.aborted,true);
  assert.equal(host.getResidency('sample').state,'unloading');
  assert.deepEqual(await invoke(host,'other'),limit);
  await host.unload('sample');assert.equal(attempts,1);
  done.resolve();await turn();
  assert.equal(host.residencyStats().resident,0);
  assert.equal((await invoke(host,'other')).status,'ok');await host.unloadIdle();
});

test('legacy plugins remain invocable but cannot be falsely reported as safely unloaded',async()=>{
  const host=createPluginHost();host.register(manifest(),()=>({inspect:()=>1}));await invoke(host);
  assert.equal(typeof host.unload,'function');
  assert.deepEqual(await host.unload('sample'),{status:'unavailable',reason:'plugin-unload-unsupported'});
  assert.equal(host.residencyStats().resident,1);
  assert.equal((await invoke(host)).value,1);
});

test('managed late initialization remains cleanup-owned and cannot publish capabilities',async()=>{
  const ready=gate(),controller=new AbortController();const host=createPluginHost({maxResidentPlugins:1});let disposed=0;
  managed(host,'sample',()=>ready.promise,()=>{disposed++;});managed(host,'other');
  const call=invoke(host,'sample',controller.signal);await turn();controller.abort();await call;
  assert.deepEqual(await invoke(host,'other'),limit);
  ready.resolve({inspect:()=>{throw new Error('must not execute abandoned instance');}});await turn();
  assert.equal((await invoke(host)).reason,'plugin-cleanup-required');
  assert.equal(host.residencyStats().resident,1);
  assert.equal((await host.unload('sample')).unloaded,true);assert.equal(disposed,1);
  assert.equal((await invoke(host,'other')).status,'ok');await host.unloadIdle();
});

test('rejected initialization releases only its reservation and can be explicitly retried',async()=>{
  const host=createPluginHost({maxResidentPlugins:1});let attempts=0;
  managed(host,'sample',()=>{if(++attempts===1)throw new Error('private');return {inspect:()=>1};});
  assert.equal((await invoke(host)).status,'failed');
  assert.equal(typeof host.residencyStats,'function');
  assert.equal(host.residencyStats().resident,0);
  assert.equal((await invoke(host)).status,'ok');await host.unloadIdle();
});

test('permission, capability and pre-cancellation gates never reserve a slot',async()=>{
  const host=createPluginHost();let created=0;managed(host,'sample',()=>{created++;return {inspect:()=>1};});
  await host.invoke('sample','inspect',{});
  await host.invoke('sample','unknown',{},context());
  const controller=new AbortController();controller.abort();await invoke(host,'sample',controller.signal);
  assert.equal(created,0);assert.equal(typeof host.residencyStats,'function');
  assert.equal(host.residencyStats().resident,0);
});

test('residency snapshots are frozen metadata, not instance or permission handles',async()=>{
  const host=createPluginHost();managed(host);await invoke(host);
  assert.equal(typeof host.getResidency,'function');
  const state=host.getResidency('sample'),stats=host.residencyStats();
  assert.ok(Object.isFrozen(state));assert.ok(Object.isFrozen(stats));
  assert.equal(state.instance,undefined);assert.equal(state.factory,undefined);assert.equal(state.dispose,undefined);
  assert.equal(state.state,'idle');await host.unloadIdle();assert.equal(state.state,'idle');
  assert.equal(host.getResidency('sample').state,'registered');
});

test('invalid profiles, limits and cleanup callbacks fail before registration or loading',()=>{
  for(const resourceProfile of ['unknown','__proto__','toString',null,1])
    assert.throws(()=>createPluginHost({resourceProfile}),TypeError);
  for(const maxResidentPlugins of [0,-1,1.5,NaN,Infinity,'8',true])
    assert.throws(()=>createPluginHost({maxResidentPlugins}),TypeError);
  const host=createPluginHost();
  for(const dispose of [null,true,1,'close',{}])
    assert.throws(()=>host.register(manifest(),()=>({}),{dispose}),TypeError);
  assert.equal(host.list().length,0);
});

test('unloading an unknown or already-sleeping registration never runs plugin code',async()=>{
  const host=createPluginHost();let created=0;managed(host,'sample',()=>{created++;return {inspect:()=>1};});
  assert.equal(typeof host.unload,'function');
  assert.deepEqual(await host.unload('missing'),{status:'unavailable',reason:'plugin-not-found'});
  assert.deepEqual(await host.unload('sample'),{status:'ok',unloaded:false});
  assert.equal(created,0);
});

test('cleanup callback receives its instance and frozen lifecycle context, not internal host state as this',async()=>{
  const host=createPluginHost();const instance={inspect:()=>1};let received=false;
  managed(host,'sample',()=>instance,function(value,ctx){
    assert.equal(this,undefined);
    assert.equal(value,instance);
    assert.deepEqual(Object.keys(ctx).sort(),['apiVersion','signal']);
    assert.equal(ctx.apiVersion,'2');assert.ok(Object.isFrozen(ctx));received=true;
  });
  await invoke(host);assert.equal((await host.unload('sample')).status,'ok');assert.equal(received,true);
});

test('one finished caller cannot unload an instance still used by a second caller',async()=>{
  const a=gate(),b=gate();const host=createPluginHost();let calls=0,disposed=0;
  managed(host,'sample',()=>({inspect:()=>++calls===1?a.promise:b.promise}),()=>{disposed++;});
  const first=invoke(host),second=invoke(host);await turn();
  assert.equal(host.getResidency('sample').activeExecutions,2);
  a.resolve('first');await first;assert.deepEqual(await host.unload('sample'),busy);
  b.reject(new Error('private task failure'));assert.equal((await second).reason,'plugin-crashed');
  assert.equal((await host.unload('sample')).unloaded,true);assert.equal(disposed,1);
});

test('a shared pending factory consumes one capacity reservation for all its authorized waiters',async()=>{
  const ready=gate();const host=createPluginHost({maxResidentPlugins:1});let factories=0;
  managed(host,'sample',()=>{factories++;return ready.promise;});managed(host,'other');
  const a=invoke(host),b=invoke(host);await turn();
  assert.equal(factories,1);assert.equal(host.residencyStats().resident,1);
  assert.deepEqual(await invoke(host,'other'),limit);
  ready.resolve({inspect:()=>1});assert.equal((await a).status,'ok');assert.equal((await b).status,'ok');
  assert.equal((await host.unloadIdle()).length,1);
});

test('idle sweep keeps quarantined and unmanaged instances without blocking cleanup of independent plugins',async()=>{
  const host=createPluginHost();let attempts=0;
  managed(host,'bad',()=>({inspect:()=>1}),()=>{attempts++;throw new Error('private');});
  managed(host,'good');host.register(manifest('legacy'),()=>({inspect:()=>1}));
  for(const id of ['bad','good','legacy']) await invoke(host,id);
  const report=await host.unloadIdle();
  assert.deepEqual(report.map(x=>[x.id,x.status]),[['bad','failed'],['good','ok']]);
  assert.equal(host.list().length,3);assert.equal(host.residencyStats().resident,2);
  assert.deepEqual(await host.unloadIdle(),[]);assert.equal(attempts,1);
});
