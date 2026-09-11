import test from 'node:test';
import assert from 'node:assert/strict';
import { createProviderSupervisor } from '../src/core/providerSupervisor.js';
import { selectProviders } from '../src/core/providerRouter.js';

const localDefinition = (overrides={}) => ({
  id:'local', label:'Local Models', kind:'local-model', status:'unconfigured', implemented:false,
  connected:false, healthVerified:false, capabilities:['reasoning','coding'], priority:95, ...overrides
});

test('provider without an adapter stays unroutable', async () => {
  const supervisor=createProviderSupervisor({definitions:[localDefinition()]});
  const result=await supervisor.probe('local');
  assert.equal(result.status,'unavailable');
  assert.equal(result.reason,'adapter-not-registered');
  assert.deepEqual(selectProviders({intent:'general'},{executionMode:'live'},supervisor.routingSnapshot()),[]);
});

test('successful probe makes only verified declared capabilities routable', async () => {
  const supervisor=createProviderSupervisor({definitions:[localDefinition()]});
  supervisor.registerAdapter('local',{probe:async()=>({ok:true,capabilities:['reasoning']})});
  const result=await supervisor.probe('local');
  assert.equal(result.status,'ready');
  const [provider]=supervisor.routingSnapshot();
  assert.equal(provider.status,'available');
  assert.equal(provider.connected,true);
  assert.equal(provider.healthVerified,true);
  assert.deepEqual(provider.capabilities,['reasoning']);
  assert.equal(selectProviders({intent:'general'},{executionMode:'live'},[provider])[0].id,'local');
});

test('probe cannot escalate beyond capabilities declared by provider definition', async () => {
  const supervisor=createProviderSupervisor({definitions:[localDefinition()]});
  supervisor.registerAdapter('local',{probe:async()=>({ok:true,capabilities:['reasoning','filesystem-admin']})});
  const result=await supervisor.probe('local');
  assert.equal(result.status,'failed');
  assert.equal(result.reason,'undeclared-capability');
  assert.equal(supervisor.routingSnapshot()[0].healthVerified,false);
});

test('verified health expires and stops routing until re-probed', async () => {
  let now=1000;
  const supervisor=createProviderSupervisor({definitions:[localDefinition()],clock:()=>now,healthTtlMs:5000});
  supervisor.registerAdapter('local',{probe:async()=>({ok:true,capabilities:['reasoning']})});
  await supervisor.probe('local');
  assert.equal(supervisor.routingSnapshot()[0].healthVerified,true);
  now=6001;
  const stale=supervisor.routingSnapshot()[0];
  assert.equal(stale.healthVerified,false);
  assert.equal(stale.connected,false);
  assert.equal(stale.status,'degraded');
  assert.deepEqual(selectProviders({intent:'general'},{executionMode:'live'},[stale]),[]);
});

test('hung provider probe is bounded and private adapter errors are not exposed', async () => {
  const supervisor=createProviderSupervisor({definitions:[localDefinition()],probeTimeoutMs:15});
  supervisor.registerAdapter('local',{probe:()=>new Promise(()=>{})});
  const timedOut=await supervisor.probe('local');
  assert.equal(timedOut.status,'failed');
  assert.equal(timedOut.reason,'probe-timeout');

  supervisor.registerAdapter('local',{probe:async()=>{throw new Error('private-credential-sentinel');}},{replace:true});
  const failed=await supervisor.probe('local');
  assert.equal(failed.status,'failed');
  assert.equal(failed.reason,'probe-failed');
  assert.ok(!JSON.stringify(failed).includes('private-credential-sentinel'));
});

test('concurrent probes are deduplicated per provider', async () => {
  let calls=0;
  let release;
  const gate=new Promise(resolve=>{release=resolve;});
  const supervisor=createProviderSupervisor({definitions:[localDefinition()]});
  supervisor.registerAdapter('local',{probe:async()=>{calls++; await gate; return {ok:true,capabilities:['reasoning']};}});
  const first=supervisor.probe('local');
  const second=supervisor.probe('local');
  await Promise.resolve();
  assert.equal(calls,1);
  release();
  const [a,b]=await Promise.all([first,second]);
  assert.equal(a.status,'ready');
  assert.equal(b.status,'ready');
  assert.equal(calls,1);
});

test('external cancellation returns cancelled without marking provider healthy', async () => {
  const controller=new AbortController();
  const supervisor=createProviderSupervisor({definitions:[localDefinition()],probeTimeoutMs:1000});
  supervisor.registerAdapter('local',{probe:({signal})=>new Promise((resolve,reject)=>{
    signal.addEventListener('abort',()=>reject(new Error('cancelled')), {once:true});
  })});
  const pending=supervisor.probe('local',{signal:controller.signal});
  controller.abort();
  const result=await pending;
  assert.equal(result.status,'cancelled');
  assert.equal(supervisor.routingSnapshot()[0].healthVerified,false);
});

test('a cancelled joined probe waiter does not cancel another caller or receive its result', async () => {
  let calls=0;
  let release;
  const gate=new Promise(resolve=>{release=resolve;});
  const supervisor=createProviderSupervisor({definitions:[localDefinition()],probeTimeoutMs:1000});
  supervisor.registerAdapter('local',{probe:async()=>{calls++; await gate; return {ok:true,capabilities:['reasoning']};}});
  const first=supervisor.probe('local');
  const controller=new AbortController();
  const second=supervisor.probe('local',{signal:controller.signal});
  controller.abort();
  release();
  const [a,b]=await Promise.all([first,second]);
  assert.equal(calls,1);
  assert.equal(a.status,'ready');
  assert.deepEqual(b,{status:'cancelled',reason:'probe-cancelled'});
  assert.equal(supervisor.routingSnapshot()[0].healthVerified,true);
});

test('cancelling the first waiter does not abort a shared probe while another waiter remains', async () => {
  let calls=0;
  let release;
  const gate=new Promise(resolve=>{release=resolve;});
  const supervisor=createProviderSupervisor({definitions:[localDefinition()],probeTimeoutMs:1000});
  supervisor.registerAdapter('local',{probe:async({signal})=>{
    calls++;
    await Promise.race([gate,new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('cancelled')),{once:true}))]);
    return {ok:true,capabilities:['reasoning']};
  }});
  const controller=new AbortController();
  const first=supervisor.probe('local',{signal:controller.signal});
  const second=supervisor.probe('local');
  controller.abort();
  release();
  const [a,b]=await Promise.all([first,second]);
  assert.equal(calls,1);
  assert.deepEqual(a,{status:'cancelled',reason:'probe-cancelled'});
  assert.equal(b.status,'ready');
  assert.equal(supervisor.routingSnapshot()[0].healthVerified,true);
});

test('pre-aborted probe is cancelled before adapter invocation', async () => {
  let calls=0;
  const supervisor=createProviderSupervisor({definitions:[localDefinition()]});
  supervisor.registerAdapter('local',{probe:async()=>{calls++; return {ok:true,capabilities:['reasoning']};}});
  const controller=new AbortController();
  controller.abort();
  const result=await supervisor.probe('local',{signal:controller.signal});
  assert.deepEqual(result,{status:'cancelled',reason:'probe-cancelled'});
  assert.equal(calls,0);
  assert.equal(supervisor.routingSnapshot()[0].healthVerified,false);
});

test('all joined waiters cancelling aborts the shared adapter probe and leaves health unverified', async () => {
  let aborts=0;
  const supervisor=createProviderSupervisor({definitions:[localDefinition()],probeTimeoutMs:1000});
  supervisor.registerAdapter('local',{probe:({signal})=>new Promise((_,reject)=>{
    signal.addEventListener('abort',()=>{aborts++;reject(new Error('cancelled'));},{once:true});
  })});
  const firstController=new AbortController();
  const secondController=new AbortController();
  const first=supervisor.probe('local',{signal:firstController.signal});
  const second=supervisor.probe('local',{signal:secondController.signal});
  await Promise.resolve();
  firstController.abort();
  secondController.abort();
  const [a,b]=await Promise.all([first,second]);
  assert.deepEqual(a,{status:'cancelled',reason:'probe-cancelled'});
  assert.deepEqual(b,{status:'cancelled',reason:'probe-cancelled'});
  assert.equal(aborts,1);
  assert.equal(supervisor.routingSnapshot()[0].healthVerified,false);
});

test('malformed cancellation signal fails closed before adapter invocation', async () => {
  let calls=0;
  const supervisor=createProviderSupervisor({definitions:[localDefinition()]});
  supervisor.registerAdapter('local',{probe:async()=>{calls++; return {ok:true,capabilities:['reasoning']};}});
  await assert.rejects(supervisor.probe('local',{signal:{aborted:false}}),/Invalid provider abort signal/);
  assert.equal(calls,0);
});

test('throwing cancellation listener registration fails closed before shared probe starts', async () => {
  let calls=0;
  const supervisor=createProviderSupervisor({definitions:[localDefinition()],probeTimeoutMs:1000});
  supervisor.registerAdapter('local',{probe:async()=>{calls++; return {ok:true,capabilities:['reasoning']};}});
  const hostileSignal={
    aborted:false,
    addEventListener(){throw new Error('listener-registration-failed');},
    removeEventListener(){}
  };
  await assert.rejects(supervisor.probe('local',{signal:hostileSignal}),/listener-registration-failed/);
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(calls,0);
  assert.equal(supervisor.routingSnapshot()[0].healthVerified,false);
});

test('throwing cancellation listener cleanup cannot strand a cancelled waiter', async () => {
  let abortHandler;
  const supervisor=createProviderSupervisor({definitions:[localDefinition()],probeTimeoutMs:1000});
  supervisor.registerAdapter('local',{probe:()=>new Promise(()=>{})});
  const hostileSignal={
    aborted:false,
    addEventListener(type,handler){ if(type==='abort') abortHandler=handler; },
    removeEventListener(){throw new Error('listener-cleanup-failed');}
  };
  const pending=supervisor.probe('local',{signal:hostileSignal});
  await Promise.resolve();
  hostileSignal.aborted=true;
  abortHandler();
  const result=await Promise.race([
    pending,
    new Promise(resolve=>setTimeout(()=>resolve({status:'hung'}),30))
  ]);
  assert.deepEqual(result,{status:'cancelled',reason:'probe-cancelled'});
  assert.equal(supervisor.routingSnapshot()[0].healthVerified,false);
});
