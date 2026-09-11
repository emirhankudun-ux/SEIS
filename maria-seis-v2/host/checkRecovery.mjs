/** Local crash-recovery acceptance check. It never resumes an interrupted action automatically. */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createFileJournalStore } from './fileJournalStore.mjs';
import { createPersistentExecutionJournal } from '../src/core/executionJournal.js';
import { findInterruptedRuns } from '../src/core/recovery.js';

const home=path.dirname(fileURLToPath(import.meta.url));

export function runRecoveryCheck(){
  const directory=mkdtempSync(path.join(tmpdir(),'maria-recovery-'));
  const journalPath=path.join(directory,'execution-journal.json');
  const runId=randomUUID();
  let report={status:'failed',scope:'local-execution-recovery',resumeAllowed:false,cleanup:false};
  try {
    const child=spawnSync(process.execPath,[path.join(home,'recoveryCrashProbe.mjs'),journalPath,runId],{
      shell:false,
      cwd:directory,
      env:process.platform==='win32' ? {SystemRoot:process.env.SystemRoot,ComSpec:process.env.ComSpec} : {},
      encoding:'utf8',
      timeout:5000,
      maxBuffer:16384
    });
    if (child.error || child.status!==23) throw new Error('recovery-probe-failed');
    const journal=createPersistentExecutionJournal({storage:createFileJournalStore({filePath:journalPath}),limit:20});
    const interrupted=findInterruptedRuns(journal.list());
    if (interrupted.length!==1 || interrupted[0].runId!==runId || interrupted[0].resumeAllowed!==false) throw new Error('recovery-marker-missing');
    journal.complete({runId,status:'error',executionMode:'live',provider:'recovery-probe',verifiedExternalAction:false,evidence:['recovery:interrupted-process-reconciled']});
    const reloaded=createPersistentExecutionJournal({storage:createFileJournalStore({filePath:journalPath}),limit:20});
    const remaining=findInterruptedRuns(reloaded.list());
    report={status:remaining.length===0?'verified':'unverified',scope:'local-execution-recovery',childExitCode:child.status,
      interruptedRuns:interrupted.length,resumeAllowed:false,remainingInterruptedRuns:remaining.length,cleanup:false};
  } catch {
    report.reason='recovery-check-failed';
  } finally {
    try { rmSync(directory,{recursive:true,force:true}); report.cleanup=true; } catch { report.cleanup=false; report.status='unverified'; }
  }
  return report;
}

if (process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  if (process.argv.length>2) { console.error('No CLI arguments accepted.'); process.exitCode=2; }
  else { const result=runRecoveryCheck(); console.log(JSON.stringify(result,null,2)); process.exitCode=result.status==='verified'?0:1; }
}
