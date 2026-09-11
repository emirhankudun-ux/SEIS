import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createFileJournalStore } from '../host/fileJournalStore.mjs';
import { createPersistentExecutionJournal } from '../src/core/executionJournal.js';
import { findInterruptedRuns } from '../src/core/recovery.js';
import { createOrchestrator } from '../src/core/orchestrator.js';
import { EventBus } from '../src/core/eventBus.js';

const registry=[{id:'local',kind:'local-model',status:'available',implemented:true,
  connected:true,healthVerified:true,capabilities:['reasoning']}];
// A fixture model receipt; only journal filesystem I/O and child processes are real here.
const runtime={mode:'live',async execute(plan){return {ok:true,runtime:'host-runtime-v1',mode:'live',
  runId:plan.runId,projectId:plan.projectId,intent:plan.intent,providerId:'local',
  transportVerified:true,verificationScope:'model-response-transport',outcomeVerified:false,evidence:['fixture:transport']};}};
function temporary(t) {
  const directory=mkdtempSync(path.join(tmpdir(),'maria-audit-acceptance-'));
  t.after(()=>rmSync(directory,{recursive:true,force:true}));
  return path.join(directory,'journal.json');
}

test('real file is terminal before finished observers run and survives reload', async t => {
  const filePath=temporary(t);
  const journal=createPersistentExecutionJournal({storage:createFileJournalStore({filePath})});
  const bus=new EventBus(); const observed=[];
  bus.on('LIVE_EXECUTION_FINISHED',event=>observed.push({
    status:event.payload.status,auditRecorded:event.payload.auditRecorded,
    entries:JSON.parse(readFileSync(filePath,'utf8'))
  }));
  const out=await createOrchestrator({journal,bus,runtime,providerRegistry:registry})(
    'Durum','seis',{}, {executionMode:'live'});
  assert.equal(observed[0].entries[0].status,'verified');
  assert.equal(observed[0].entries[0].runId,out.plan.runId);
  assert.equal(observed[0].auditRecorded,true);
  assert.equal(observed[0].entries[0].verifiedExternalAction,false);
  const reloaded=createPersistentExecutionJournal({storage:createFileJournalStore({filePath})});
  assert.equal(reloaded.list()[0].status,'verified');
  assert.deepEqual(findInterruptedRuns(reloaded.list()),[]);
});

test('real persisted running marker survives refused terminal acknowledgement', async t => {
  const filePath=temporary(t); const store=createFileJournalStore({filePath});
  let writes=0; let initial;
  const storage={read:()=>store.read(),write(value){
    if(++writes>1) return false;
    store.write(value); initial=readFileSync(filePath,'utf8');
  }};
  const journal=createPersistentExecutionJournal({storage});
  const out=await createOrchestrator({journal,runtime,providerRegistry:registry})(
    'Durum','seis',{}, {executionMode:'live'});
  assert.equal(out.status,'unverified');
  assert.equal(out.auditRecorded,false);
  assert.equal(readFileSync(filePath,'utf8'),initial);
  assert.equal(writes,2);
  const recovered=createPersistentExecutionJournal({storage:createFileJournalStore({filePath})});
  const candidates=findInterruptedRuns(recovered.list());
  assert.equal(candidates.length,1);
  assert.equal(candidates[0].runId,out.plan.runId);
  assert.equal(candidates[0].resumeAllowed,false);
});

test('real child-process exit leaves a durable marker without an execution replay', t => {
  const filePath=temporary(t);
  const source=`
    import {createFileJournalStore} from ${JSON.stringify(new URL('../host/fileJournalStore.mjs',import.meta.url).href)};
    import {createPersistentExecutionJournal} from ${JSON.stringify(new URL('../src/core/executionJournal.js',import.meta.url).href)};
    const journal=createPersistentExecutionJournal({storage:createFileJournalStore({filePath:${JSON.stringify(filePath)}})});
    journal.begin({runId:'interrupted-fixture',executionMode:'live'});
    process.exit(23);
  `;
  const child=spawnSync(process.execPath,['--input-type=module','-e',source],
    {encoding:'utf8',timeout:5000,maxBuffer:32768});
  assert.equal(child.error,undefined);
  assert.equal(child.status,23);
  assert.equal(child.stderr,'');
  const journal=createPersistentExecutionJournal({storage:createFileJournalStore({filePath})});
  assert.equal(findInterruptedRuns(journal.list())[0].resumeAllowed,false);
  journal.complete({runId:'interrupted-fixture',status:'error',executionMode:'live',
    verifiedExternalAction:false,evidence:['fixture:explicit-reconciliation']});
  const reloaded=createPersistentExecutionJournal({storage:createFileJournalStore({filePath})});
  assert.deepEqual(findInterruptedRuns(reloaded.list()),[]);
});
