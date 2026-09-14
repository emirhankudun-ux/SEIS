import test from 'node:test';
import assert from 'node:assert/strict';
import {createProviderSupervisor} from '../src/core/providerSupervisor.js';
import {selectProviders} from '../src/core/providerRouter.js';

const definition={id:'local',kind:'local-model',status:'unconfigured',implemented:false,
  connected:false,healthVerified:false,capabilities:['reasoning','coding'],priority:95};
const gate=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const turn=()=>new Promise(resolve=>setImmediate(resolve));
const cancelled={status:'cancelled',reason:'probe-cancelled'};
async function seed({status='ready',ttl=100,timeout=1000}={}){
  let now=1000;
  const supervisor=createProviderSupervisor({definitions:[{...definition,status:status==='disabled'?'disabled':'unconfigured'}],
    clock:()=>now,healthTtlMs:ttl,probeTimeoutMs:timeout});
  supervisor.registerAdapter('local',{probe:async()=>({ok:true,capabilities:['reasoning']})});
  if(status==='ready'||status==='degraded')await supervisor.probe('local');
  if(status==='failed'||status==='degraded'){
    supervisor.registerAdapter('local',{probe:async()=>({ok:false})},{replace:true});await supervisor.probe('local');
  }
  return {supervisor,setTime:value=>{now=value;}};
}

for(const status of ['ready','unconfigured','disabled','failed','degraded'])test(`cancelled ${status} probe preserves prior observed metadata`,async()=>{
  const {supervisor}=await seed({status});const before=supervisor.get('local');
  const pendingProbe=gate();let signal;
  supervisor.registerAdapter('local',{probe:ctx=>{signal=ctx.signal;return pendingProbe.promise;}},{replace:true});
  const controller=new AbortController();const pending=supervisor.probe('local',{signal:controller.signal});
  await turn();controller.abort();assert.deepEqual(await pending,cancelled);
  assert.equal(signal.aborted,true);assert.deepEqual(supervisor.get('local'),before);
  pendingProbe.resolve({ok:true,capabilities:['coding']});await turn();assert.deepEqual(supervisor.get('local'),before);
});

test('cancellation retains original health expiry and does not grant a new TTL',async()=>{
  const {supervisor,setTime}=await seed();const pendingProbe=gate();
  supervisor.registerAdapter('local',{probe:()=>pendingProbe.promise},{replace:true});
  const controller=new AbortController();const pending=supervisor.probe('local',{signal:controller.signal});
  await turn();setTime(1101);controller.abort();assert.deepEqual(await pending,cancelled);
  const record=supervisor.get('local');assert.equal(record.lastHealthAt,1000);
  assert.equal(record.healthVerified,false);assert.equal(record.connected,false);
  assert.deepEqual(selectProviders({intent:'general'},{executionMode:'live'},[record]),[]);
  pendingProbe.resolve({ok:true,capabilities:['coding']});await turn();assert.equal(supervisor.get('local').lastHealthAt,1000);
});

test('all refresh waiters cancelling preserve existing fresh health',async()=>{
  const {supervisor}=await seed();const before=supervisor.get('local');const pendingProbe=gate();
  supervisor.registerAdapter('local',{probe:()=>pendingProbe.promise},{replace:true});
  const a=new AbortController(),b=new AbortController();
  const first=supervisor.probe('local',{signal:a.signal});const second=supervisor.probe('local',{signal:b.signal});
  await turn();a.abort();b.abort();assert.deepEqual(await Promise.all([first,second]),[cancelled,cancelled]);
  assert.deepEqual(supervisor.get('local'),before);pendingProbe.resolve({ok:false});await turn();
  assert.deepEqual(supervisor.get('local'),before);
});

test('late cancelled result cannot overwrite a newer successful refresh',async()=>{
  const {supervisor,setTime}=await seed();const old=gate();
  supervisor.registerAdapter('local',{probe:()=>old.promise},{replace:true});
  const controller=new AbortController();const pending=supervisor.probe('local',{signal:controller.signal});
  await turn();controller.abort();await pending;
  supervisor.registerAdapter('local',{probe:async()=>({ok:true,capabilities:['coding']})},{replace:true});
  setTime(1050);assert.equal((await supervisor.probe('local')).status,'ready');
  const before=supervisor.get('local');old.resolve({ok:true,capabilities:['reasoning']});await turn();
  assert.deepEqual(supervisor.get('local'),before);assert.equal(before.lastHealthAt,1050);assert.deepEqual(before.capabilities,['coding']);
});

for(const mode of ['unhealthy','undeclared','throw','timeout'])test(`actual ${mode} refresh still revokes readiness`,async()=>{
  const {supervisor}=await seed({timeout:15});
  const outcome=mode==='unhealthy'?()=>({ok:false}):mode==='undeclared'?()=>({ok:true,capabilities:['admin']}):
    mode==='throw'?()=>{throw new Error('private probe detail');}:()=>new Promise(()=>{});
  supervisor.registerAdapter('local',{probe:outcome},{replace:true});
  const result=await supervisor.probe('local');assert.equal(result.status,'failed');
  const record=supervisor.get('local');assert.equal(record.healthVerified,false);assert.equal(record.lastHealthAt,null);
  assert.deepEqual(selectProviders({intent:'general'},{executionMode:'live'},[record]),[]);
  assert.ok(!JSON.stringify(result).includes('private probe detail'));
});

test('throwing cancellation registration does not erase a previous health observation',async()=>{
  const {supervisor}=await seed();const before=supervisor.get('local');let calls=0;
  supervisor.registerAdapter('local',{probe:()=>{calls++;return {ok:true,capabilities:['coding']};}},{replace:true});
  const signal={aborted:false,addEventListener(){throw new Error('fixture registration');},removeEventListener(){}};
  await assert.rejects(supervisor.probe('local',{signal}),/fixture registration/);await turn();
  assert.deepEqual(supervisor.get('local'),before);assert.equal(calls,0);
});

test('a pending first probe leaves observations unchanged until an actual outcome',async()=>{
  const {supervisor}=await seed({status:'unconfigured'});const before=supervisor.get('local'),ready=gate();
  supervisor.registerAdapter('local',{probe:()=>ready.promise},{replace:true});const pending=supervisor.probe('local');
  await turn();const during=supervisor.get('local');ready.resolve({ok:true,capabilities:['reasoning']});
  assert.equal((await pending).status,'ready');assert.deepEqual(during,before);
});
