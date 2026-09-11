import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalOpenAICompatibleAdapter } from '../src/adapters/localOpenAICompatible.js';
import { createHostAdapterManager } from '../src/adapters/hostAdapter.js';
import { LiveRuntimeAdapter } from '../src/adapters/liveRuntime.js';
import { createOrchestrator } from '../src/core/orchestrator.js';

const response=json=>({ok:true,status:200,json:async()=>json});

test('local model can complete the full verified live inference contract', async()=>{
  const fetchImpl=async(url,options={})=>{
    if(String(url).endsWith('/v1/models')) return response({data:[{id:'qwen-local'}]});
    if(String(url).endsWith('/v1/chat/completions')) return response({id:'chatcmpl-e2e-1',model:'qwen-local',choices:[{message:{role:'assistant',content:'SEIS hazır.'}}]});
    throw new Error(`unexpected url ${url}`);
  };
  const manager=createHostAdapterManager();
  manager.register(createLocalOpenAICompatibleAdapter({id:'local',model:'qwen-local',fetchImpl}));
  const state=await manager.connect('local');
  assert.equal(state.status,'ready');
  const runtime=new LiveRuntimeAdapter({manager,intentCapabilities:{general:'reasoning'}});
  const providerRegistry=[{id:'local',label:'Local Models',kind:'local-model',status:'available',implemented:true,connected:true,healthVerified:true,capabilities:['reasoning'],priority:95}];
  const run=createOrchestrator({runtime,providerRegistry});
  const result=await run('Sistem durumunu özetle','seis',{}, {executionMode:'live',localFirst:true,safeMode:true});
  assert.equal(result.status,'verified');
  assert.equal(result.result.output,'SEIS hazır.');
  assert.equal(result.verification.verified,true);
  assert.equal(result.selectedProviders[0].id,'local');
});
