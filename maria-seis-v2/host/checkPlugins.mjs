/** Controlled fixtures exercise the real host. No third-party plugins are installed. */
import assert from 'node:assert/strict';
import {createPluginHost} from '../src/plugins/host.js';
import {PLUGIN_RESOURCE_PROFILES} from '../src/plugins/residency.js';

const fixtureCount=200;
const context={grantedPermissions:['project.read']};
const profiles=[];
for(const [profile,expectedLimit] of Object.entries(PLUGIN_RESOURCE_PROFILES)) {
  const host=createPluginHost({resourceProfile:profile});
  const live=new Set(),loads=new Map();
  for(let index=0;index<fixtureCount;index++) {
    const id=`fixture-${index}`;
    host.register({id,name:id,version:'1.0.0',apiVersion:'2',risk:'observe',
      capabilities:['inspect'],permissions:['project.read']},()=>{
      loads.set(id,(loads.get(id)??0)+1);
      const instance={inspect:()=>({id,generation:loads.get(id)})};
      live.add(instance);
      return instance;
    },{dispose:instance=>{assert.equal(live.delete(instance),true);}});
  }
  const initial=host.residencyStats();
  assert.equal(initial.registered,fixtureCount);assert.equal(initial.resident,0);
  assert.equal(loads.size,0);
  assert.equal((await host.invoke('fixture-0','inspect',{})).reason,'permission-not-granted');
  assert.equal(loads.size,0);
  for(let index=0;index<expectedLimit;index++) {
    const result=await host.invoke(`fixture-${index}`,'inspect',{},context);
    assert.equal(result.status,'ok');assert.equal(result.value.id,`fixture-${index}`);
  }
  const peak=host.residencyStats();
  assert.equal(peak.resident,expectedLimit);assert.equal(live.size,expectedLimit);
  assert.equal((await host.invoke(`fixture-${expectedLimit}`,'inspect',{},context)).reason,'plugin-residency-limit');
  assert.equal(loads.size,expectedLimit);
  const released=await host.unloadIdle();
  assert.equal(released.filter(item=>item.unloaded).length,expectedLimit);
  const swept=host.residencyStats();
  assert.equal(swept.resident,0);assert.equal(live.size,0);assert.equal(swept.registered,fixtureCount);
  const reloaded=await host.invoke('fixture-0','inspect',{},context);
  assert.equal(reloaded.status,'ok');assert.equal(reloaded.value.generation,2);
  await host.unloadIdle();assert.equal(live.size,0);assert.equal(host.residencyStats().resident,0);
  profiles.push({profile,registered:host.list().length,initialResident:initial.resident,
    peakResident:peak.resident,afterSweepResident:swept.resident,reloaded:true});
}
console.log(JSON.stringify({status:'verified',scope:'controlled-plugin-residency',fixtureCount,
  profiles,externalPluginsTested:false,
  note:'Registry/instance lifecycle acceptance only; not package installation, module unloading, RSS measurement or sandbox verification.'},null,2));
