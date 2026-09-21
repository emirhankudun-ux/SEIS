import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createOrchestrator } from '../src/core/orchestrator.js';
import { createExecutionJournal, createPersistentExecutionJournal } from '../src/core/executionJournal.js';
import { EventBus } from '../src/core/eventBus.js';

// Receipt fixture only: these tests do not connect a model or perform an external action.
const registry = [{id:'local',kind:'local-model',status:'available',implemented:true,
  connected:true,healthVerified:true,capabilities:['reasoning']}];
const policy = {executionMode:'live',safeMode:true};
const receipt = plan => ({ok:true,runtime:'host-runtime-v1',mode:'live',providerId:'local',
  runId:plan.runId,projectId:plan.projectId,intent:plan.intent,transportVerified:true,
  verificationScope:'model-response-transport',outcomeVerified:false,evidence:['fixture:transport']});
function live(journal, bus = new EventBus(), execute = async plan => receipt(plan)) {
  let calls = 0;
  const run = createOrchestrator({journal,bus,providerRegistry:registry,timeoutMs:100,
    runtime:{mode:'live',execute(...args){ calls++; return execute(...args); }}});
  return {run:()=>run('Durumu kontrol et','seis',{},policy),calls:()=>calls};
}
const returns = {
  promise: () => Promise.resolve(),
  pending: () => new Promise(()=>{}),
  false: () => false,
  thenable: () => ({then(resolve){resolve();}})
};
for (const [name, result] of Object.entries(returns)) {
  test(`live start refuses ${name} audit acknowledgement before execution`, async () => {
    const fixture = live({begin:result,complete(){}});
    const out = await fixture.run();
    assert.equal(out.status,'unavailable');
    assert.equal(out.auditRecorded,false);
    assert.equal(fixture.calls(),0);
  });
  test(`live terminal refuses ${name} audit acknowledgement without replay`, async () => {
    const fixture = live({begin(){},complete:result});
    const out = await fixture.run();
    assert.equal(out.status,'unverified');
    assert.equal(out.auditRecorded,false);
    assert.equal(out.verification.verifiedTransport,true);
    assert.equal(out.verification.verifiedExternalAction,false);
    assert.equal(fixture.calls(),1);
  });
  test(`persistent journal cannot advance memory on ${name} storage write`, () => {
    const journal=createPersistentExecutionJournal({storage:{read:()=>null,write:result}});
    assert.throws(()=>journal.begin({runId:'new',executionMode:'live'}),/journal-persist-failed/);
    assert.deepEqual(journal.list(),[]);
  });
}

test('legacy synchronous append-only journal remains compatible', async () => {
  const entries=[];
  const out=await live({append(entry){entries.push(entry);}}).run();
  assert.equal(out.status,'verified');
  assert.equal(out.auditRecorded,true);
  assert.deepEqual(entries.map(e=>e.status),['running','verified']);
});

test('legacy append-only journal cannot hide an asynchronous acknowledgement', async () => {
  const fixture=live({append:()=>Promise.resolve()});
  assert.equal((await fixture.run()).status,'unavailable');
  assert.equal(fixture.calls(),0);
});

test('sync storage failure acknowledgement preserves an existing running marker', () => {
  let stored=null;
  let fail=false;
  const journal=createPersistentExecutionJournal({storage:{read:()=>stored,
    write(value){if(fail) return false; stored=value;}}});
  journal.begin({runId:'open',executionMode:'live'});
  const before=stored;
  fail=true;
  assert.throws(()=>journal.complete({runId:'open',status:'verified'}),/journal-persist-failed/);
  assert.equal(journal.list()[0].status,'running');
  assert.equal(stored,before);
});

test('failed clear acknowledgement does not erase in-memory audit history', () => {
  let fail=false;
  const journal=createPersistentExecutionJournal({storage:{read:()=>null,write(){return fail?false:undefined;}}});
  journal.append({runId:'done',status:'unverified'});
  fail=true;
  assert.throws(()=>journal.clear(),/journal-persist-failed/);
  assert.equal(journal.list().length,1);
});

test('live finished observation happens after terminal commit and carries audit status', async () => {
  const journal=createExecutionJournal();
  const bus=new EventBus();
  const observations=[];
  bus.on('LIVE_EXECUTION_FINISHED',event=>observations.push({
    payload:event.payload,status:journal.list().find(e=>e.runId===event.payload.plan.runId)?.status
  }));
  const out=await live(journal,bus).run();
  assert.equal(observations.length,1);
  assert.equal(observations[0].status,'verified');
  assert.equal(observations[0].payload.status,out.status);
  assert.equal(observations[0].payload.auditRecorded,true);
});

test('failed terminal audit is observed before the downgraded finished event', async () => {
  const bus=new EventBus();
  const observations=[];
  bus.on('*',event=>observations.push(event));
  const journal={begin(){},complete(){throw new Error('private-sentinel');}};
  const out=await live(journal,bus).run();
  const terminal=observations.filter(e=>['JOURNAL_FAILED','LIVE_EXECUTION_FINISHED'].includes(e.type));
  assert.deepEqual(terminal.map(e=>e.type),['JOURNAL_FAILED','LIVE_EXECUTION_FINISHED']);
  assert.equal(terminal[1].payload.status,'unverified');
  assert.equal(terminal[1].payload.auditRecorded,false);
  assert.equal(terminal[1].payload.status,out.status);
  assert.equal(JSON.stringify(terminal).includes('private-sentinel'),false);
});

test('malformed receipt plus audit failure never claims the live result was verified', async () => {
  const out=await live({begin(){},complete(){throw new Error('disk');}},new EventBus(),async()=>({})).run();
  assert.equal(out.status,'unverified');
  assert.equal(out.verification.verified,false);
  assert.doesNotMatch(out.reason,/sonuç doğrulandı/i);
});

test('stopped observation happens after error audit and includes auditRecorded', async () => {
  const journal=createExecutionJournal();
  const bus=new EventBus();
  const observations=[];
  bus.on('EXECUTION_STOPPED',event=>observations.push({
    payload:event.payload,status:journal.list().find(e=>e.runId===event.payload.runId)?.status
  }));
  const out=await live(journal,bus,async()=>{throw new Error('private-sentinel');}).run();
  assert.equal(out.status,'error');
  assert.equal(observations[0].status,'error');
  assert.equal(observations[0].payload.auditRecorded,true);
});

test('simulation remains simulation when optional journal rejects acknowledgement', async () => {
  const run=createOrchestrator({journal:{append:()=>Promise.resolve()},runtime:{mode:'simulation',
    async execute(plan){return {...receipt(plan),runtime:'mock-runtime-v4',mode:'simulation',sideEffects:false};}}});
  const out=await run('Durum','seis');
  assert.equal(out.status,'simulated');
  assert.equal(out.auditRecorded,false);
  assert.equal(out.verification.verified,false);
});

for (const phase of ['begin','complete','read','write']) {
  test(`rejected ${phase} Promise is contained without unhandled rejection or secret diagnostics`, () => {
    const source=`
      import assert from 'node:assert/strict';
      import {createOrchestrator} from ${JSON.stringify(new URL('../src/core/orchestrator.js',import.meta.url).href)};
      import {createPersistentExecutionJournal} from ${JSON.stringify(new URL('../src/core/executionJournal.js',import.meta.url).href)};
      import {EventBus} from ${JSON.stringify(new URL('../src/core/eventBus.js',import.meta.url).href)};
      const fail=()=>Promise.reject(new Error('private-sentinel'));
      const phase=${JSON.stringify(phase)};
      if(phase==='read') {
        assert.throws(()=>createPersistentExecutionJournal({storage:{read:fail,write(){}}}),/journal-storage-corrupt/);
      } else if(phase==='write') {
        const j=createPersistentExecutionJournal({storage:{read:()=>null,write:fail}});
        assert.throws(()=>j.begin({runId:'run'}),/journal-persist-failed/);
        assert.deepEqual(j.list(),[]);
      } else {
        let calls=0;
        const bus=new EventBus(); const events=[]; bus.on('*',e=>events.push(e));
        const journal={begin(){},complete(){},[phase]:fail};
        const run=createOrchestrator({journal,bus,providerRegistry:${JSON.stringify(registry)},runtime:{mode:'live',
          async execute(plan){calls++; return {...${JSON.stringify(receipt({}))},runId:plan.runId,projectId:plan.projectId,intent:plan.intent};}}});
        const out=await run('Durum','seis',{},${JSON.stringify(policy)});
        assert.equal(out.status,phase==='begin'?'unavailable':'unverified');
        assert.equal(out.auditRecorded,false); assert.equal(calls,phase==='begin'?0:1);
        assert.equal(JSON.stringify(events).includes('private-sentinel'),false);
      }
      await new Promise(resolve=>setImmediate(resolve));
      console.log('contained');
    `;
    const child=spawnSync(process.execPath,['--unhandled-rejections=strict','--input-type=module','-e',source],
      {encoding:'utf8',timeout:5000,maxBuffer:32768});
    assert.equal(child.error,undefined);
    assert.equal(child.status,0,child.stderr);
    assert.equal(child.stdout.trim(),'contained');
    assert.equal(child.stderr,'');
  });
}

for (const phase of ['begin','complete']) {
  test(`late ${phase} fulfilment cannot promote a rejected acknowledgement`, async () => {
    let resolve;
    const pending=new Promise(done=>{resolve=done;});
    let attempts=0;
    const fixture=live({begin(){},complete(){},[phase](){attempts++; return pending;}});
    const out=await fixture.run();
    const expected=phase==='begin'?'unavailable':'unverified';
    assert.equal(out.status,expected);
    resolve();
    await new Promise(done=>setImmediate(done));
    assert.equal(out.status,expected);
    assert.equal(out.auditRecorded,false);
    assert.equal(attempts,1);
    assert.equal(fixture.calls(),phase==='begin'?0:1);
  });
  test(`throwing ${phase} then accessor fails closed with redacted observations`, async () => {
    const bus=new EventBus(); const events=[]; bus.on('*',e=>events.push(e));
    const fixture=live({begin(){},complete(){},[phase](){return {get then(){throw new Error('private-sentinel');}};}},bus);
    const out=await fixture.run();
    assert.equal(out.status,phase==='begin'?'unavailable':'unverified');
    assert.equal(out.auditRecorded,false);
    assert.equal(JSON.stringify(events).includes('private-sentinel'),false);
  });
}

for (const outcome of ['cancelled','timed-out']) {
  test(`${outcome} observation reports failed audit after the audit attempt`, async () => {
    const controller=new AbortController(); const bus=new EventBus(); const events=[];
    bus.on('*',event=>events.push(event));
    const run=createOrchestrator({bus,providerRegistry:registry,timeoutMs:5,
      journal:{begin(){},complete(){return false;}},runtime:{mode:'live',execute(){
        if(outcome==='cancelled') controller.abort();
        return new Promise(()=>{});
      }}});
    const out=await run('Durum','seis',{},policy,{signal:controller.signal});
    assert.equal(out.status,outcome);
    assert.equal(out.auditRecorded,false);
    const terminal=events.filter(e=>['JOURNAL_FAILED','EXECUTION_STOPPED'].includes(e.type));
    assert.deepEqual(terminal.map(e=>e.type),['JOURNAL_FAILED','EXECUTION_STOPPED']);
    assert.equal(terminal[1].payload.auditRecorded,false);
    assert.equal(terminal[1].payload.status,outcome);
    assert.equal(events.some(e=>e.type==='LIVE_EXECUTION_FINISHED'),false);
  });
}

test('observer failures cannot change committed outcome or leak diagnostic text', async () => {
  const journal=createExecutionJournal(); const bus=new EventBus();
  bus.on('LIVE_EXECUTION_FINISHED',()=>{throw new Error('private-sentinel');});
  const out=await live(journal,bus).run();
  assert.equal(out.status,'verified');
  assert.equal(out.auditRecorded,true);
  assert.equal(journal.list()[0].status,'verified');
  assert.deepEqual(bus.diagnostics(),[{type:'LIVE_EXECUTION_FINISHED',code:'OBSERVER_FAILED'}]);
});

test('rejecting a lazy thenable never starts its deferred operation', async () => {
  let deferredCalls=0;
  const fixture=live({begin(){return {then(){deferredCalls++;}};},complete(){}});
  const out=await fixture.run();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(out.status,'unavailable');
  assert.equal(deferredCalls,0);
  assert.equal(fixture.calls(),0);
});

for (const variant of ['overridden-then','cross-realm']) {
  test(`rejection containment supports genuine ${variant} Promise without calling custom then`, () => {
    const source=`
      import assert from 'node:assert/strict';
      import vm from 'node:vm';
      import {createPersistentExecutionJournal} from ${JSON.stringify(new URL('../src/core/executionJournal.js',import.meta.url).href)};
      let customCalls=0;
      const promise=${JSON.stringify(variant)}==='cross-realm'
        ? vm.runInNewContext('Promise.reject(new Error("private-sentinel"))')
        : Promise.reject(new Error('private-sentinel'));
      if(${JSON.stringify(variant)}==='overridden-then') promise.then=()=>{customCalls++; throw new Error('private-sentinel');};
      const journal=createPersistentExecutionJournal({storage:{read:()=>null,write:()=>promise}});
      assert.throws(()=>journal.begin({runId:'fixture'}),/journal-persist-failed/);
      await new Promise(resolve=>setImmediate(resolve));
      assert.equal(customCalls,0); assert.deepEqual(journal.list(),[]);
      console.log('contained');
    `;
    const child=spawnSync(process.execPath,['--unhandled-rejections=strict','--input-type=module','-e',source],
      {encoding:'utf8',timeout:5000,maxBuffer:32768});
    assert.equal(child.error,undefined);
    assert.equal(child.status,0,child.stderr);
    assert.equal(child.stdout.trim(),'contained');
    assert.equal(child.stderr,'');
  });
}

for (const phase of ['begin','complete','write']) {
  test(`native Promise with hidden then cannot bypass the ${phase} acknowledgement gate`, async () => {
    const result=()=>{const p=Promise.resolve(); p.then=null; return p;};
    if(phase==='write') {
      const journal=createPersistentExecutionJournal({storage:{read:()=>null,write:result}});
      assert.throws(()=>journal.begin({runId:'hidden'}),/journal-persist-failed/);
      assert.deepEqual(journal.list(),[]);
    } else {
      const fixture=live({begin(){},complete(){},[phase]:result});
      const out=await fixture.run();
      assert.equal(out.status,phase==='begin'?'unavailable':'unverified');
      assert.equal(out.auditRecorded,false);
    }
  });
}
