import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalOpenAICompatibleAdapter } from '../src/adapters/localOpenAICompatible.js';

function response(json,status=200){return {ok:status>=200&&status<300,status,json:async()=>json};}

test('connect discovers a local model and health exposes only declared capabilities', async()=>{
  const calls=[];
  const fetchImpl=async(url,options={})=>{
    calls.push([url,options.method||'GET']);
    if(String(url).endsWith('/v1/models')) return response({data:[{id:'qwen-local'}]});
    throw new Error('unexpected');
  };
  const adapter=createLocalOpenAICompatibleAdapter({baseUrl:'http://127.0.0.1:1234',fetchImpl,model:'qwen-local'});
  const session=await adapter.connect();
  const health=await adapter.health({session});
  assert.equal(session.model,'qwen-local');
  assert.equal(health.ok,true);
  assert.deepEqual(health.capabilities,['reasoning','coding']);
  assert.deepEqual(calls,[['http://127.0.0.1:1234/v1/models','GET']]);
});

test('execute returns attributable verified receipt from chat completions', async()=>{
  const fetchImpl=async(url,options={})=>{
    if(String(url).endsWith('/v1/models')) return response({data:[{id:'qwen-local'}]});
    if(String(url).endsWith('/v1/chat/completions')) {
      const body=JSON.parse(options.body);
      assert.equal(body.model,'qwen-local');
      assert.equal(body.messages.at(-1).content,'status?');
      return response({id:'chatcmpl-local-1',model:'qwen-local',choices:[{message:{role:'assistant',content:'ready'}}],usage:{prompt_tokens:3,completion_tokens:1,total_tokens:4}});
    }
    throw new Error('unexpected');
  };
  const adapter=createLocalOpenAICompatibleAdapter({baseUrl:'http://127.0.0.1:1234/',fetchImpl,model:'qwen-local'});
  const session=await adapter.connect();
  const receipt=await adapter.execute({command:'status?',projectId:'seis',runId:'run-7',intent:'general'},{capability:'reasoning',sessionId:session.sessionId});
  assert.equal(receipt.ok,true);
  assert.equal(receipt.output,'ready');
  assert.equal(receipt.providerReceiptId,'chatcmpl-local-1');
  assert.equal(receipt.transportVerified,true);
  assert.equal(receipt.outcomeVerified,false);
  assert.equal(receipt.verificationScope,'model-response-transport');
  assert.ok(receipt.evidence.includes('model:qwen-local'));
  assert.ok(receipt.evidence.includes('provider-receipt:chatcmpl-local-1'));
});

test('connect fails closed when configured model is absent', async()=>{
  const adapter=createLocalOpenAICompatibleAdapter({baseUrl:'http://127.0.0.1:1234',model:'missing',fetchImpl:async()=>response({data:[{id:'other'}]})});
  await assert.rejects(()=>adapter.connect(),/configured model unavailable/);
});

test('malformed completion is rejected and cannot become verified evidence', async()=>{
  const fetchImpl=async(url)=> String(url).endsWith('/v1/models') ? response({data:[{id:'qwen-local'}]}) : response({choices:[]});
  const adapter=createLocalOpenAICompatibleAdapter({baseUrl:'http://127.0.0.1:1234',model:'qwen-local',fetchImpl});
  const session=await adapter.connect();
  await assert.rejects(()=>adapter.execute({command:'x',projectId:'seis',runId:'r',intent:'general'},{capability:'reasoning',sessionId:session.sessionId}),/invalid completion response/);
});

test('execute forwards cancellation to fetch', async()=>{
  const controller=new AbortController();
  let executeSignal;
  const fetchImpl=async(url,options={})=>{
    if(String(url).endsWith('/v1/models')) return response({data:[{id:'qwen-local'}]});
    executeSignal=options.signal;
    return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
  };
  const adapter=createLocalOpenAICompatibleAdapter({baseUrl:'http://127.0.0.1:1234',model:'qwen-local',fetchImpl,requestTimeoutMs:1000});
  const session=await adapter.connect();
  const pending=adapter.execute({command:'x',projectId:'seis',runId:'r',intent:'general'},{capability:'reasoning',sessionId:session.sessionId,signal:controller.signal});
  controller.abort();
  await assert.rejects(()=>pending,/request cancelled/);
  assert.equal(executeSignal?.aborted,true);
});

test('adapter can bind to the canonical local provider id for host routing', async()=>{
  const adapter=createLocalOpenAICompatibleAdapter({id:'local',baseUrl:'http://127.0.0.1:1234',model:'qwen-local',fetchImpl:async()=>response({data:[{id:'qwen-local'}]})});
  assert.equal(adapter.id,'local');
});

test('completion model identity must match the configured local model', async()=>{
  const fetchImpl=async url=>String(url).endsWith('/v1/models')
    ? response({data:[{id:'qwen-local'}]})
    : response({id:'chatcmpl-wrong-model',model:'other-model',choices:[{message:{role:'assistant',content:'ready'}}]});
  const adapter=createLocalOpenAICompatibleAdapter({baseUrl:'http://127.0.0.1:1234',model:'qwen-local',fetchImpl});
  const session=await adapter.connect();
  await assert.rejects(()=>adapter.execute({command:'status?',projectId:'seis',runId:'run-model',intent:'general'},{capability:'reasoning',sessionId:session.sessionId}),/completion model mismatch/);
});
