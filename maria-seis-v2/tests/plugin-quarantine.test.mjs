import test from 'node:test';
import assert from 'node:assert/strict';
import {createPluginHost} from '../src/plugins/host.js';

const manifest={
  id:'uncooperative',
  name:'uncooperative',
  version:'1.0.0',
  apiVersion:'2',
  capabilities:['inspect'],
  permissions:['project.read'],
  risk:'observe'
};
const context=()=>({grantedPermissions:['project.read']});
const gate=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
const turn=()=>new Promise(resolve=>setImmediate(resolve));

test('timed out initialization without a disposer is quarantined after late settlement',async()=>{
  const ready=gate();
  let calls=0;
  const host=createPluginHost({timeoutMs:20});
  host.register(manifest,async()=>{
    calls+=1;
    if(calls===1) await ready.promise;
    return {inspect:()=>calls===1?'stale':'fresh'};
  });

  const pending=host.invoke('uncooperative','inspect',{},context());
  await turn();
  assert.deepEqual(await pending,{status:'failed',reason:'plugin-timeout'});

  ready.resolve();
  await turn();

  assert.equal(host.getResidency('uncooperative').state,'quarantined');
  assert.deepEqual(await host.invoke('uncooperative','inspect',{},context()),
    {status:'unavailable',reason:'plugin-quarantined'});
  assert.equal(calls,1);
});
