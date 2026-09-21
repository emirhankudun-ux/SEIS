import test from 'node:test';
import assert from 'node:assert/strict';
import {setTimeout as schedule,clearTimeout as clear} from 'node:timers';
import {createPluginHost} from '../src/plugins/host.js';

const manifest=(id='shared')=>({id,name:id,version:'1.0.0',apiVersion:'2',
  capabilities:['inspect'],permissions:['project.read'],risk:'observe'});
const context=signal=>({grantedPermissions:['project.read'],...(signal?{signal}:{})});
const gate=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const turn=()=>new Promise(resolve=>setImmediate(resolve));
async function bounded(promise){let timer;try{return await Promise.race([promise,new Promise(resolve=>{timer=schedule(()=>resolve({status:'test-timeout'}),150);})]);}finally{clear(timer);}}
const cancelled={status:'cancelled',reason:'plugin-cancelled'};
const draining={status:'unavailable',reason:'plugin-initialization-pending'};
function setup(factory,options={}){const host=createPluginHost({timeoutMs:1000,...options});host.register(manifest(),factory);return host;}
function controlledTimers(t){
  const timers=[];
  t.mock.method(globalThis,'setTimeout',(callback,ms)=>{const timer={callback,ms,cleared:false};timers.push(timer);return timer;});
  t.mock.method(globalThis,'clearTimeout',timer=>{if(timer)timer.cleared=true;});
  return timers;
}

test('concurrent authorized invocations share exactly one factory and keep input contexts separate',async()=>{
  const ready=gate(); let calls=0; const seen=[];
  const host=setup(async factoryContext=>{calls++;assert.deepEqual(factoryContext.permissions,['project.read']);
    assert.ok(Object.isFrozen(factoryContext.permissions));await ready.promise;
    return {inspect:(input,ctx)=>{seen.push(ctx);return input.name;}};});
  const results=Array.from({length:6},(_,i)=>host.invoke('shared','inspect',{name:`task-${i}`},context()));
  await turn();const initializations=calls;ready.resolve();
  assert.deepEqual(await Promise.all(results),Array.from({length:6},(_,i)=>({status:'ok',value:`task-${i}`})));
  assert.equal(initializations,1);assert.equal(calls,1);
  assert.equal(new Set(seen.map(ctx=>ctx.signal)).size,6);
  assert.ok(seen.every(ctx=>Object.isFrozen(ctx.grantedPermissions)));
});

for(const which of ['first','joined'])test(`cancelling the ${which} caller leaves another initialization waiter active`,async()=>{
  const ready=gate();let factorySignal,calls=0;const executed=[];
  const host=setup(async({signal})=>{factorySignal=signal;calls++;await ready.promise;return {inspect:x=>{executed.push(x);return x;}};});
  const a=new AbortController(),b=new AbortController();
  const first=host.invoke('shared','inspect','first',context(a.signal));
  const second=host.invoke('shared','inspect','second',context(b.signal));
  await turn();(which==='first'?a:b).abort();
  assert.deepEqual(await(which==='first'?first:second),cancelled);
  assert.equal(factorySignal.aborted,false);ready.resolve();
  assert.deepEqual(await(which==='first'?second:first),{status:'ok',value:which==='first'?'second':'first'});
  assert.equal(calls,1);assert.deepEqual(executed,[which==='first'?'second':'first']);
});

test('last waiter cancellation aborts once, blocks overlapping factories, and discards a late instance',async()=>{
  const ready=gate();let calls=0,aborts=0,executions=0;
  const host=setup(async({signal})=>{calls++;signal.addEventListener('abort',()=>{aborts++;},{once:true});
    if(calls===1){await ready.promise;return {inspect:()=>{executions++;return 'stale';}};}
    return {inspect:()=> 'fresh'};});
  const a=new AbortController(),b=new AbortController();
  const first=host.invoke('shared','inspect',{},context(a.signal));
  const second=host.invoke('shared','inspect',{},context(b.signal));
  await turn();a.abort();b.abort();assert.deepEqual(await Promise.all([first,second]),[cancelled,cancelled]);
  assert.equal(aborts,1);assert.equal(calls,1);
  assert.deepEqual(await host.invoke('shared','inspect',{},context()),draining);
  assert.equal(calls,1);ready.resolve();await turn();
  assert.deepEqual(await host.invoke('shared','inspect',{},context()),{status:'ok',value:'fresh'});
  assert.equal(calls,2);assert.equal(executions,0);
});

test('shared factory rejection is redacted for every waiter and a later invocation can retry',async()=>{
  const ready=gate();let calls=0;
  const host=setup(async()=>{calls++;if(calls===1)await ready.promise;return {inspect:()=> 'retry'};});
  const first=host.invoke('shared','inspect',{},context());const second=host.invoke('shared','inspect',{},context());
  await turn();ready.reject(new Error('synthetic private initialization detail'));
  assert.deepEqual(await Promise.all([first,second]),[{status:'failed',reason:'plugin-crashed'},{status:'failed',reason:'plugin-crashed'}]);
  assert.equal(calls,1);
  assert.deepEqual(await host.invoke('shared','inspect',{},context()),{status:'ok',value:'retry'});assert.equal(calls,2);
});

test('each waiter retains its own total timeout while shared initialization remains needed',async t=>{
  const timers=controlledTimers(t),ready=gate();let calls=0,signal;
  const host=setup(async ctx=>{calls++;signal=ctx.signal;await ready.promise;return {inspect:()=> 'ok'};});
  const first=host.invoke('shared','inspect',{},context());const second=host.invoke('shared','inspect',{},context());
  await turn();timers[0].callback();
  assert.deepEqual(await first,{status:'failed',reason:'plugin-timeout'});assert.equal(signal.aborted,false);
  ready.resolve();assert.deepEqual(await second,{status:'ok',value:'ok'});assert.equal(calls,1);
  assert.ok(timers.every(timer=>timer.cleared));
});

test('timeout during uncooperative initialization cannot launch another factory until settlement',async t=>{
  const timers=controlledTimers(t),ready=gate();let calls=0,signal;
  const host=setup(async ctx=>{signal=ctx.signal;calls++;await ready.promise;return {inspect:()=> 'late'};});
  const pending=host.invoke('shared','inspect',{},context());await turn();timers[0].callback();
  assert.deepEqual(await pending,{status:'failed',reason:'plugin-timeout'});assert.equal(signal.aborted,true);
  const next=await bounded(host.invoke('shared','inspect',{},context()));
  ready.reject(new Error('late private rejection'));await turn();
  assert.deepEqual(next,draining);assert.equal(calls,1);
  assert.ok(timers.every(timer=>timer.cleared));
});

test('cancelling before the queued factory starts never calls user initialization code',async()=>{
  let calls=0;const host=setup(()=>{calls++;return {inspect:()=> 'no'};});
  const controller=new AbortController();const pending=host.invoke('shared','inspect',{},context(controller.signal));
  controller.abort();assert.deepEqual(await pending,cancelled);await turn();assert.equal(calls,0);
});

test('cancelling a queued cached capability does not execute it or invalidate the shared instance',async()=>{
  let calls=0,executions=0;const host=setup(()=>{calls++;return {inspect:()=>++executions};});
  assert.deepEqual(await host.invoke('shared','inspect',{},context()),{status:'ok',value:1});
  const controller=new AbortController();const pending=host.invoke('shared','inspect',{},context(controller.signal));
  controller.abort();assert.deepEqual(await pending,cancelled);await turn();assert.equal(executions,1);
  assert.deepEqual(await host.invoke('shared','inspect',{},context()),{status:'ok',value:2});assert.equal(calls,1);
});

test('capability cancellation does not abort factory context or another capability on the shared instance',async()=>{
  const entered=gate(),finish=gate();let factorySignal,calls=0;
  const host=setup(({signal})=>{calls++;factorySignal=signal;return {inspect:async input=>{
    if(input==='cancel'){entered.resolve();await finish.promise;}return input;}};});
  const controller=new AbortController();const pending=host.invoke('shared','inspect','cancel',context(controller.signal));
  await entered.promise;controller.abort();assert.deepEqual(await pending,cancelled);
  assert.equal(factorySignal.aborted,false);
  assert.deepEqual(await host.invoke('shared','inspect','other',context()),{status:'ok',value:'other'});
  finish.resolve();await turn();assert.equal(calls,1);
});

test('denied and pre-aborted callers do not join initialization or execute capabilities',async()=>{
  const ready=gate();let calls=0;const host=setup(async()=>{calls++;await ready.promise;return {inspect:()=> 'ok'};});
  const pending=host.invoke('shared','inspect',{},context());await turn();
  assert.equal((await host.invoke('shared','inspect',{},{})).reason,'permission-not-granted');
  assert.equal((await host.invoke('shared','other',{},context())).reason,'capability-not-declared');
  const controller=new AbortController();controller.abort();
  assert.deepEqual(await host.invoke('shared','inspect',{},context(controller.signal)),cancelled);
  ready.resolve();assert.equal((await pending).status,'ok');assert.equal(calls,1);
});

test('throwing abort listener registration fails closed before factory code',async()=>{
  let calls=0;const host=setup(()=>{calls++;return {inspect:()=> 'no'};});
  const signal={aborted:false,addEventListener(){throw new Error('private listener error');},removeEventListener(){}};
  let result;try{result=await host.invoke('shared','inspect',{},context(signal));}catch{assert.fail('raw listener error escaped');}
  assert.equal(result.status,'failed');assert.ok(!JSON.stringify(result).includes('private listener error'));assert.equal(calls,0);
});

test('abort during listener registration does not dispatch a factory or leak rejection',async()=>{
  let calls=0;const host=setup(()=>{calls++;return {inspect:()=> 'no'};});
  const signal={aborted:false,addEventListener(_type,callback){this.aborted=true;callback();},removeEventListener(){}};
  assert.deepEqual(await host.invoke('shared','inspect',{},context(signal)),cancelled);
  await turn();assert.equal(calls,0);
});

test('throwing listener cleanup cannot override a completed outcome',async()=>{
  const host=setup(()=>({inspect:()=> 'ok'}));
  const signal={aborted:false,addEventListener(){},removeEventListener(){throw new Error('private cleanup error');}};
  let result;try{result=await host.invoke('shared','inspect',{},context(signal));}catch{assert.fail('cleanup error escaped');}
  assert.deepEqual(result,{status:'ok',value:'ok'});
});

test('different registered plugins do not share initialization state',async()=>{
  const host=createPluginHost();const ready=gate();let first=0,second=0;
  host.register(manifest('one'),async()=>{first++;await ready.promise;return {inspect:()=> 'one'};});
  host.register(manifest('two'),()=>{second++;return {inspect:()=> 'two'};});
  const pending=host.invoke('one','inspect',{},context());
  assert.deepEqual(await host.invoke('two','inspect',{},context()),{status:'ok',value:'two'});
  ready.resolve();assert.equal((await pending).value,'one');assert.equal(first,1);assert.equal(second,1);
});

for(const stage of ['factory','capability'])test(`plugin ${stage} error text cannot impersonate host cancellation`,async()=>{
  const host=setup(()=>{if(stage==='factory')throw new Error('plugin-cancelled');return {inspect:()=>{throw new Error('plugin-timeout');}};});
  assert.deepEqual(await host.invoke('shared','inspect',{},context()),{status:'failed',reason:'plugin-crashed'});
});

test('factory completion does not reset the invocation timeout budget',async t=>{
  const timers=controlledTimers(t),ready=gate(),entered=gate(),finish=gate();
  const host=setup(async()=>{await ready.promise;return {inspect:async()=>{entered.resolve();await finish.promise;return 'late';}};});
  const pending=host.invoke('shared','inspect',{},context());await turn();ready.resolve();await entered.promise;
  assert.equal(timers.length,1);assert.equal(timers[0].cleared,false);timers[0].callback();
  assert.deepEqual(await pending,{status:'failed',reason:'plugin-timeout'});finish.resolve();await turn();
  assert.ok(timers.every(timer=>timer.cleared));
});
