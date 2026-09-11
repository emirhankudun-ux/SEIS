import test from 'node:test';
import assert from 'node:assert/strict';
import { runRecoveryCheck } from '../host/checkRecovery.mjs';

test('real subprocess interruption leaves a durable recovery marker that is reconciled without auto-resume',()=>{
  const report=runRecoveryCheck();
  assert.equal(report.status,'verified');
  assert.equal(report.scope,'local-execution-recovery');
  assert.equal(report.childExitCode,23);
  assert.equal(report.interruptedRuns,1);
  assert.equal(report.resumeAllowed,false);
  assert.equal(report.remainingInterruptedRuns,0);
  assert.equal(report.cleanup,true);
});
