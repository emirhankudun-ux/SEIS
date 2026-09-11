import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createPersistentExecutionJournal } from '../src/core/executionJournal.js';
import { findInterruptedRuns } from '../src/core/recovery.js';
import { createFileJournalStore } from '../host/fileJournalStore.mjs';
import { createOrchestrator } from '../src/core/orchestrator.js';

function memoryStorage(initial=null){
  let value=initial;
  return {
    read(){ return value; },
    write(next){ value=next; },
    snapshot(){ return value; }
  };
}

test('persistent journal redacts before storage and survives reload',()=>{
  const storage=memoryStorage();
  const first=createPersistentExecutionJournal({storage,limit:10,clock:()=>new Date('2026-09-11T15:00:00.000Z')});
  first.append({runId:'r1',status:'running',executionMode:'live',evidence:{token:'secret',note:'safe'}});
  assert.equal(storage.snapshot().includes('secret'),false);
  const second=createPersistentExecutionJournal({storage,limit:10});
  const [entry]=second.list();
  assert.equal(entry.runId,'r1');
  assert.equal(entry.evidence.token,'[REDACTED]');
  assert.equal(entry.evidence.note,'safe');
});

test('persistent journal write failure does not advance in-memory audit state',()=>{
  let writes=0;
  const storage={read:()=>null,write:()=>{writes+=1;throw new Error('disk full')}};
  const journal=createPersistentExecutionJournal({storage,limit:10});
  assert.throws(()=>journal.append({runId:'r1',status:'running'}),/journal-persist-failed/);
  assert.equal(writes,1);
  assert.deepEqual(journal.list(),[]);
});

test('persistent journal rejects corrupt audit history instead of silently erasing it',()=>{
  const storage=memoryStorage('{not-json');
  assert.throws(()=>createPersistentExecutionJournal({storage}),/journal-storage-corrupt/);
});

test('recovery scan returns only runs whose latest record is still running',()=>{
  const candidates=findInterruptedRuns([
    {runId:'done',status:'running',executionMode:'live',provider:'local',timestamp:'2026-09-11T15:00:00.000Z'},
    {runId:'done',status:'verified',executionMode:'live',provider:'local',timestamp:'2026-09-11T15:00:01.000Z'},
    {runId:'lost',status:'running',executionMode:'live',provider:'mcp',timestamp:'2026-09-11T15:00:02.000Z'}
  ]);
  assert.deepEqual(candidates,[{
    runId:'lost',executionMode:'live',provider:'mcp',startedAt:'2026-09-11T15:00:02.000Z',reason:'interrupted-before-terminal',resumeAllowed:false
  }]);
  assert.equal(Object.isFrozen(candidates),true);
  assert.equal(Object.isFrozen(candidates[0]),true);
});

test('live execution fails closed when audit start cannot be persisted',async()=>{
  let executions=0;
  const runtime={mode:'live',execute:async()=>{executions+=1;return {ok:true,runtime:'host-runtime-v1',mode:'live',providerId:'local',runId:'x',projectId:'seis',intent:'general',outcomeVerified:true,evidence:['external:ok']};}};
  const journal={append(){throw new Error('storage unavailable')}};
  const registry=[{id:'local',label:'Local',kind:'local-model',status:'available',implemented:true,connected:true,healthVerified:true,capabilities:['reasoning'],priority:100}];
  const run=createOrchestrator({runtime,journal,providerRegistry:registry});
  const out=await run('SEIS durumunu kontrol et','seis',{}, {executionMode:'live',localFirst:true,safeMode:true});
  assert.equal(out.status,'unavailable');
  assert.match(out.reason,/denetim günlüğü/i);
  assert.equal(executions,0);
});

test('verified live result is downgraded when terminal audit commit fails',async()=>{
  let appends=0;
  const journal={append(){appends+=1;if(appends===2) throw new Error('disk full')}};
  const runtime={mode:'live',execute:async plan=>({ok:true,runtime:'host-runtime-v1',mode:'live',providerId:'local',runId:plan.runId,projectId:plan.projectId,intent:plan.intent,transportVerified:true,outcomeVerified:true,verificationScope:'external-outcome',evidence:['external:checked']})};
  const registry=[{id:'local',label:'Local',kind:'local-model',status:'available',implemented:true,connected:true,healthVerified:true,capabilities:['reasoning'],priority:100}];
  const run=createOrchestrator({runtime,journal,providerRegistry:registry});
  const out=await run('SEIS durumunu kontrol et','seis',{}, {executionMode:'live',localFirst:true,safeMode:true});
  assert.equal(out.verification.verified,true);
  assert.equal(out.status,'unverified');
  assert.equal(out.auditRecorded,false);
  assert.match(out.reason,/denetim günlüğü/i);
});

test('file journal store persists atomically across journal instances',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'maria-journal-'));
  const filePath=path.join(dir,'execution-journal.json');
  const store=createFileJournalStore({filePath});
  const first=createPersistentExecutionJournal({storage:store,limit:10});
  first.append({runId:'persisted',status:'running',executionMode:'live',evidence:{authorization:'Bearer hidden'}});
  const onDisk=await readFile(filePath,'utf8');
  assert.equal(onDisk.includes('Bearer hidden'),false);
  const second=createPersistentExecutionJournal({storage:createFileJournalStore({filePath}),limit:10});
  assert.equal(second.list()[0].runId,'persisted');
});

test('file journal store refuses an existing symlink target',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'maria-journal-link-'));
  const target=path.join(dir,'target.json');
  const link=path.join(dir,'journal.json');
  await writeFile(target,'[]');
  await symlink(target,link);
  const store=createFileJournalStore({filePath:link});
  assert.throws(()=>store.read(),/journal-file-unsafe/);
});
