import test from 'node:test';
import assert from 'node:assert/strict';
import { createExecutionJournal, createPersistentExecutionJournal } from '../src/core/executionJournal.js';
import { createOrchestrator } from '../src/core/orchestrator.js';

function memoryStorage(initial=null){
  let value=initial;
  return { read(){ return value; }, write(next){ value=next; }, snapshot(){ return value; } };
}

test('journal evicts completed history before an active recovery marker',()=>{
  const journal=createExecutionJournal({limit:3,clock:()=>new Date('2026-09-11T16:00:00.000Z')});
  journal.begin({runId:'active',executionMode:'live'});
  journal.append({runId:'old-1',status:'verified'});
  journal.append({runId:'old-2',status:'verified'});
  journal.append({runId:'newest',status:'verified'});
  const entries=journal.list();
  assert.equal(entries.length,3);
  assert.equal(entries.some(entry=>entry.runId==='active' && entry.status==='running'),true);
  assert.deepEqual(entries.map(entry=>entry.runId),['active','old-2','newest']);
});

test('journal refuses a new active run instead of evicting an existing active run',()=>{
  const journal=createExecutionJournal({limit:2});
  journal.begin({runId:'active-1',executionMode:'live'});
  journal.begin({runId:'active-2',executionMode:'live'});
  assert.throws(()=>journal.begin({runId:'active-3',executionMode:'live'}),/journal-active-capacity-exhausted/);
  assert.deepEqual(journal.list().map(entry=>entry.runId),['active-1','active-2']);
});

test('persistent reload preserves active runs when bounded history is compacted',()=>{
  const initial=JSON.stringify([
    {runId:'active',status:'running',timestamp:'2026-09-11T15:00:00.000Z'},
    {runId:'old',status:'verified',timestamp:'2026-09-11T15:00:01.000Z'},
    {runId:'newest',status:'verified',timestamp:'2026-09-11T15:00:02.000Z'}
  ]);
  const journal=createPersistentExecutionJournal({storage:memoryStorage(initial),limit:2});
  assert.deepEqual(journal.list().map(entry=>entry.runId),['active','newest']);
});

test('completed latest state makes an older running marker evictable',()=>{
  const initial=JSON.stringify([
    {runId:'done',status:'running',timestamp:'2026-09-11T15:00:00.000Z'},
    {runId:'done',status:'verified',timestamp:'2026-09-11T15:00:01.000Z'},
    {runId:'active',status:'running',timestamp:'2026-09-11T15:00:02.000Z'}
  ]);
  const journal=createPersistentExecutionJournal({storage:memoryStorage(initial),limit:2});
  assert.deepEqual(journal.list().map(entry=>[entry.runId,entry.status]),[
    ['done','verified'],
    ['active','running']
  ]);
});

test('live orchestration fails closed when active recovery markers consume journal capacity',async()=>{
  const journal=createExecutionJournal({limit:1});
  journal.begin({runId:'interrupted-existing',executionMode:'live',provider:'local'});
  let executions=0;
  const runtime={mode:'live',execute:async()=>{executions+=1;return {};}};
  const registry=[{id:'local',label:'Local',kind:'local-model',status:'available',implemented:true,connected:true,healthVerified:true,capabilities:['reasoning'],priority:100}];
  const run=createOrchestrator({runtime,journal,providerRegistry:registry});
  const out=await run('SEIS durumunu kontrol et','seis',{}, {executionMode:'live',localFirst:true,safeMode:true});
  assert.equal(out.status,'unavailable');
  assert.equal(out.auditRecorded,false);
  assert.equal(executions,0);
  assert.deepEqual(journal.list().map(entry=>entry.runId),['interrupted-existing']);
});
