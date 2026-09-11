import test from 'node:test';
import assert from 'node:assert/strict';
import { createHostAdapterManager } from '../src/adapters/hostAdapter.js';
import { LiveRuntimeAdapter } from '../src/adapters/liveRuntime.js';
import { verifyLiveReceipt } from '../src/core/verification.js';
import { createOrchestrator } from '../src/core/orchestrator.js';
import { createExecutionJournal } from '../src/core/executionJournal.js';

function readyManager({receipt}={}) {
  const manager=createHostAdapterManager({apiVersion:'2'});
  manager.register({
    id:'local', apiVersion:'2', capabilities:['reasoning'],
    connect:async()=>({sessionId:'s1'}), health:async()=>({ok:true,capabilities:['reasoning']}),
    execute:async(request,ctx)=>receipt ?? ({ok:true,request,ctx,outcomeVerified:false,evidence:['host:response']}), disconnect:async()=>{}
  });
  return manager;
}

test('live verifier rejects unattributed or self-asserted success', () => {
  const expected={runId:'r1',projectId:'seis',intent:'general'};
  const bad=verifyLiveReceipt({ok:true,mode:'live',runId:'r1',projectId:'seis',intent:'general',outcomeVerified:true,evidence:[]},expected);
  assert.equal(bad.verified,false);
  assert.equal(bad.verifiedExternalAction,false);
});

test('live verifier accepts only matching attributed evidence', () => {
  const expected={runId:'r1',projectId:'seis',intent:'general'};
  const good=verifyLiveReceipt({
    ok:true,mode:'live',runtime:'host-runtime-v1',providerId:'local',runId:'r1',projectId:'seis',intent:'general',
    outcomeVerified:true,evidence:['model:health-ok','response:attributed']
  },expected);
  assert.equal(good.verified,true);
  assert.equal(good.verifiedExternalAction,true);
});

test('live runtime routes intent through ready host adapter', async () => {
  const manager=readyManager({receipt:{ok:true,outcomeVerified:false,evidence:['host:response']}});
  await manager.connect('local');
  const runtime=new LiveRuntimeAdapter({manager,intentCapabilities:{general:'reasoning'}});
  const result=await runtime.execute({runId:'r1',projectId:'seis',intent:'general'},()=>{}, {providers:[{id:'local'}]});
  assert.equal(result.mode,'live');
  assert.equal(result.providerId,'local');
  assert.equal(result.runId,'r1');
});

test('orchestrator can use injected live runtime without falling back to simulation', async () => {
  const manager=readyManager({receipt:{ok:true,outcomeVerified:true,evidence:['health:ok','response:checked']}});
  await manager.connect('local');
  const runtime=new LiveRuntimeAdapter({manager,intentCapabilities:{general:'reasoning'}});
  const journal=createExecutionJournal({limit:10});
  const registry=[{id:'local',label:'Local',kind:'local-model',status:'available',implemented:true,connected:true,healthVerified:true,capabilities:['reasoning'],priority:100}];
  const run=createOrchestrator({runtime,providerRegistry:registry,journal});
  const outcome=await run('SEIS durumunu kontrol et','seis',{}, {executionMode:'live',localFirst:true,safeMode:true});
  assert.equal(outcome.status,'verified');
  assert.equal(outcome.verification.verifiedExternalAction,true);
  const [entry]=journal.list();
  assert.equal(entry.verifiedExternalAction,true);
  assert.equal(entry.provider,'local');
});
