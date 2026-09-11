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
