import assert from 'node:assert/strict';
import test from 'node:test';
import { createOrchestrator } from '../src/core/orchestrator.js';
import { EventBus } from '../src/core/eventBus.js';
import { evaluatePermission } from '../src/core/permissions.js';
import { selectProviders } from '../src/core/providerRouter.js';
import { resolveTruth } from '../src/core/sourceOfTruth.js';
import { verifyPrototype } from '../src/core/verification.js';
import { validatePluginManifest } from '../src/plugins/sdk.js';

const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
const receipt = plan => ({ok:true,runtime:'mock-runtime-v4',mode:'simulation',sideEffects:false,
  intent:plan.intent,projectId:plan.projectId,runId:plan.runId,output:'Fixture result'});
const fixture = execute => ({mode:'simulation',execute});
const connected = overrides => ({id:'fixture',kind:'local-model',status:'available',implemented:true,
  connected:true,healthVerified:true,priority:1,capabilities:['reasoning'],...overrides});

test('safe read is permitted', () => assert.equal(evaluatePermission({risk:'safe'}).allowed,true));
test('scoped write policy permits modify outside safe mode', () => {
  assert.equal(evaluatePermission({risk:'modify'},{safeMode:false,allowProjectWrites:true}).allowed,true);
});
test('high impact is never implicitly authorized', () => {
  assert.equal(evaluatePermission({risk:'high'},{safeMode:false,allowProjectWrites:true}).allowed,false);
});
test('live provider needs complete requested capability coverage', () => {
  assert.deepEqual(selectProviders({intent:'build'},{executionMode:'live'},[connected({capabilities:['build']})]),[]);
});
test('a healthy connected local provider may be proposed for reasoning', () => {
  assert.equal(selectProviders({intent:'general'},{executionMode:'live'},[connected({})])[0].id,'fixture');
});
for (const field of ['implemented','connected','healthVerified']) {
  test(`provider ${field} must be explicitly true`, () => {
    assert.deepEqual(selectProviders({intent:'general'},{executionMode:'live'},[connected({[field]:false})]),[]);
  });
}
test('cloud requires explicit opt in', () => {
  const catalog=[connected({id:'cloud',kind:'cloud-model'})];
  assert.deepEqual(selectProviders({intent:'general'},{executionMode:'live'},catalog),[]);
  assert.equal(selectProviders({intent:'general'},{executionMode:'live',allowCloud:true},catalog)[0].id,'cloud');
});
test('instruction-domain resolution is explicitly opt in', () => {
  assert.equal(resolveTruth([{source:'current-user-instruction',value:'new'}],{domain:'instruction'}).value,'new');
});
test('identical canonical values do not create a conflict', () => {
  assert.equal(resolveTruth([{source:'canonical-governance',value:'A'},{source:'canonical-governance',value:'A'}]).value,'A');
});
test('empty or unknown truth sources do not fabricate a decision', () => {
  assert.equal(resolveTruth([]),null); assert.equal(resolveTruth([{source:'unknown',value:'x'}]),null);
});
test('verifier rejects a receipt from another run', () => {
  const expected={intent:'build',projectId:'seis',runId:'expected'};
  assert.equal(verifyPrototype(receipt({...expected,runId:'stale'}),expected).contractVerified,false);
});
test('verifier rejects a receipt from another project', () => {
  const expected={intent:'build',projectId:'seis',runId:'expected'};
  assert.equal(verifyPrototype(receipt({...expected,projectId:'other'}),expected).contractVerified,false);
});
test('duplicate plugin capabilities are rejected', () => {
  assert.equal(validatePluginManifest({id:'sample',name:'Sample',version:'1.0.0',risk:'safe',capabilities:['read','read']}).valid,false);
});
test('event unsubscription removes the observer', () => {
  const bus=new EventBus(); let count=0;
  const off=bus.on('X',()=>count++); off(); bus.emit('X'); assert.equal(count,0);
});
test('wildcard observer is called once for wildcard events', () => {
  const bus=new EventBus(); let count=0; bus.on('*',()=>count++); bus.emit('*'); assert.equal(count,1);
});
test('event payload mutation does not leak between observers', () => {
  const bus=new EventBus(); const original={risk:'high'};
  bus.on('X',event=>{event.payload.risk='safe';});
  bus.on('X',event=>assert.equal(event.payload.risk,'high'));
  bus.emit('X',original); assert.equal(original.risk,'high'); assert.equal(bus.diagnostics().length,0);
});
test('async observer rejection is caught without exposing its error message', async () => {
  const bus=new EventBus(); bus.on('X',async()=>{throw new Error('private-sentinel');});
  bus.emit('X'); await pause(0);
  assert.equal(bus.diagnostics().length,1);
  assert.ok(!JSON.stringify(bus.diagnostics()).includes('private-sentinel'));
});
test('observer diagnostics remain bounded', () => {
  const bus=new EventBus(); bus.on('X',()=>{throw new Error('error');});
  for(let i=0;i<80;i++) bus.emit('X');
  assert.equal(bus.diagnostics().length,50);
});
test('adapter failure becomes an explicit error outcome', async () => {
  const run=createOrchestrator({runtime:fixture(async()=>{throw new Error('private-sentinel');})});
  const result=await run('build','seis');
  assert.equal(result.status,'error'); assert.ok(!JSON.stringify(result).includes('private-sentinel'));
});
test('an adapter that ignores cancellation cannot block timeout completion', async () => {
  const run=createOrchestrator({runtime:fixture(()=>new Promise(()=>{})),timeoutMs:15});
  assert.equal((await run('build','seis')).status,'timed-out');
});
test('active cancellation terminates the orchestration', async () => {
  const controller=new AbortController();
  const run=createOrchestrator({runtime:fixture(()=>new Promise(()=>{}))});
  const pending=run('build','seis',{}, {}, {signal:controller.signal});
  controller.abort(); assert.equal((await pending).status,'cancelled');
});
test('malformed receipt cannot complete simulation', async () => {
  const run=createOrchestrator({runtime:fixture(async()=>({ok:true}))});
  assert.equal((await run('build','seis')).status,'unverified');
});
test('a live adapter cannot enter the demo execution path', async () => {
  let called=false;
  const run=createOrchestrator({runtime:{mode:'live',execute(){called=true;}}});
  assert.equal((await run('build','seis')).status,'unavailable'); assert.equal(called,false);
});
test('provider observers cannot mutate the execution selection', async () => {
  const run=createOrchestrator({runtime:fixture(async plan=>receipt(plan))});
  const result=await run('build','seis',{onProviders(selected){selected.length=0;}});
  assert.deepEqual(result.selectedProviders.map(p=>p.id),['simulation']);
});
test('late progress cannot reopen a completed workflow', async () => {
  let updates=0;
  const run=createOrchestrator({runtime:fixture(async(plan,progress)=>{
    setTimeout(()=>progress({stage:'acting',progress:50}),15); return receipt(plan);
  })});
  await run('build','seis',{onProgress(){updates++;}});
  await pause(25); assert.equal(updates,0);
});
test('two concurrent runs have distinct receipt identities', async () => {
  const run=createOrchestrator({runtime:fixture(async plan=>receipt(plan))});
  const results=await Promise.all([run('build','seis'),run('build','deadly-evil')]);
  assert.notEqual(results[0].plan.runId,results[1].plan.runId);
  assert.ok(results.every(r=>r.status==='simulated'));
});
test('invalid command returns an explicit invalid outcome', async () => {
  assert.equal((await createOrchestrator()('','seis')).status,'invalid');
});
test('timeout policy is bounded', () => {
  assert.throws(()=>createOrchestrator({timeoutMs:0}),/timeoutMs/);
  assert.throws(()=>createOrchestrator({timeoutMs:Infinity}),/timeoutMs/);
});
