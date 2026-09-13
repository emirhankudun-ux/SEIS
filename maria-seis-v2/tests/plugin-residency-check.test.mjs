import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('plugin acceptance command verifies 200 lazy registrations across all resource profiles',()=>{
  const result=spawnSync(process.execPath,[fileURLToPath(new URL('../host/checkPlugins.mjs',import.meta.url))],
    {encoding:'utf8',timeout:5000,maxBuffer:1024*1024});
  assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);
  assert.equal(report.status,'verified');assert.equal(report.scope,'controlled-plugin-residency');
  assert.equal(report.fixtureCount,200);assert.equal(report.externalPluginsTested,false);
  assert.deepEqual(report.profiles.map(x=>[x.profile,x.peakResident]),[['lite',4],['standard',8],['workstation',16]]);
  for(const profile of report.profiles){
    assert.equal(profile.registered,200);assert.equal(profile.initialResident,0);
    assert.equal(profile.afterSweepResident,0);assert.equal(profile.reloaded,true);
  }
});
