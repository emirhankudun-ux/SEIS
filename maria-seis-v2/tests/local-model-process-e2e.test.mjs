import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('real loopback OpenAI-compatible transport passes the bounded local-model acceptance check',()=>{
  const run=spawnSync(process.execPath,[path.join(root,'host','checkLocalModel.mjs')],{
    cwd:root,shell:false,encoding:'utf8',timeout:10000,maxBuffer:65536,
    env:process.platform==='win32'?{SystemRoot:process.env.SystemRoot,ComSpec:process.env.ComSpec}:{}
  });
  assert.equal(run.status,0,run.stderr||run.stdout);
  const report=JSON.parse(run.stdout);
  assert.equal(report.status,'verified');
  assert.equal(report.scope,'local-model-transport');
  assert.equal(report.transport,'http-loopback');
  assert.equal(report.verification.verifiedTransport,true);
  assert.equal(report.verification.verifiedExternalAction,false);
  assert.equal(report.cancellation,'verified');
  assert.equal(report.cleanup.closed,true);
});
