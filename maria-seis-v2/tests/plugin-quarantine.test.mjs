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
const context=signal=>({grantedPermissions:['project.read'],...(signal?{signal}:{})});
const gate=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
const turn=()=>new Promise(resolve=>setImmediate(resolve));

test('abandoned initialization without a disposer is quarantined after late settlement',async()=>{
  const ready=gate();
  let calls=0;
  const host=createPluginHost({timeoutMs:1000});
  host.register(manifest,async()=>{
    calls+=1;
    if(calls===1) await ready.promise;
    return {inspect:()=>calls===1?'stale':'fresh'};
  });

  const controller=new AbortController();
  const pending=host.invoke('uncooperative','inspect',{},context(controller.signal));
  await turn();
  controller.abort();
  assert.deepEqual(await pending,{status:'cancelled',reason:'plugin-cancelled'});

  ready.resolve();
  await turn();

  assert.equal(host.getResidency('uncooperative').state,'quarantined');
  assert.deepEqual(await host.invoke('uncooperative','inspect',{},context()),
    {status:'unavailable',reason:'plugin-quarantined'});
  assert.equal(calls,1);
});
