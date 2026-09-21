import test from 'node:test';
import assert from 'node:assert/strict';

let createLocalOllamaAdapter;
try {
  ({createLocalOllamaAdapter} = await import('../src/adapters/localOllama.js'));
} catch {}

function response(json,status=200){return {ok:status>=200&&status<300,status,json:async()=>json};}

test('native Ollama adapter exists as a separate host transport',()=>{
  assert.equal(typeof createLocalOllamaAdapter,'function');
});

test('connect and health require the exact configured model from /api/tags',async()=>{
  assert.equal(typeof createLocalOllamaAdapter,'function');
  const calls=[];
  const fetchImpl=async(url,options={})=>{
    calls.push([String(url),options.method||'GET']);
    return response({models:[{name:'qwen3:8b',model:'qwen3:8b'}]});
  };
  const adapter=createLocalOllamaAdapter({model:'qwen3:8b',fetchImpl});
  const session=await adapter.connect();
  const health=await adapter.health({session});
  assert.equal(session.model,'qwen3:8b');
  assert.equal(health.ok,true);
  assert.deepEqual(health.capabilities,['reasoning','coding']);
  assert.deepEqual(calls.map(([url])=>url),['http://127.0.0.1:11434/api/tags','http://127.0.0.1:11434/api/tags']);
});

test('execute uses /api/chat and returns transport-only evidence without external-action claims',async()=>{
  assert.equal(typeof createLocalOllamaAdapter,'function');
  const fetchImpl=async(url,options={})=>{
    if(String(url).endsWith('/api/tags')) return response({models:[{name:'qwen3:8b',model:'qwen3:8b'}]});
    if(String(url).endsWith('/api/chat')) {
      const body=JSON.parse(options.body);
      assert.equal(body.model,'qwen3:8b');
      assert.equal(body.stream,false);
      assert.equal(body.messages.at(-1).content,'status?');
      return response({model:'qwen3:8b',created_at:'2026-09-11T17:00:00Z',message:{role:'assistant',content:'ready'},done:true,done_reason:'stop',prompt_eval_count:3,eval_count:1,total_duration:123});
    }
    throw new Error('unexpected');
  };
  const adapter=createLocalOllamaAdapter({id:'ollama-local',model:'qwen3:8b',fetchImpl});
  const session=await adapter.connect();
  const receipt=await adapter.execute({command:'status?',projectId:'seis',runId:'run-ollama',intent:'general'},{capability:'reasoning',sessionId:session.sessionId});
  assert.equal(receipt.ok,true);
  assert.equal(receipt.output,'ready');
  assert.equal(receipt.providerId,'ollama-local');
  assert.equal(receipt.model,'qwen3:8b');
  assert.equal(receipt.transportVerified,true);
  assert.equal(receipt.outcomeVerified,false);
  assert.equal(receipt.verificationScope,'model-response-transport');
  assert.equal(receipt.providerReceiptId,null);
  assert.ok(receipt.evidence.includes('transport:ollama-native'));
  assert.ok(receipt.evidence.includes('model:qwen3:8b'));
  assert.ok(receipt.evidence.includes('ollama-created-at:2026-09-11T17:00:00Z'));
});

test('execute rejects incomplete or wrong-model Ollama responses',async()=>{
  assert.equal(typeof createLocalOllamaAdapter,'function');
  for (const payload of [
    {model:'other',created_at:'2026-09-11T17:00:00Z',message:{content:'ready'},done:true},
    {model:'qwen3:8b',created_at:'2026-09-11T17:00:00Z',message:{content:'ready'},done:false}
  ]) {
    const fetchImpl=async url=>String(url).endsWith('/api/tags')
      ? response({models:[{name:'qwen3:8b',model:'qwen3:8b'}]})
      : response(payload);
    const adapter=createLocalOllamaAdapter({model:'qwen3:8b',fetchImpl});
    const session=await adapter.connect();
    await assert.rejects(()=>adapter.execute({command:'x'},{capability:'reasoning',sessionId:session.sessionId}),/model mismatch|incomplete response/);
  }
});

test('external cancellation aborts the native Ollama request',async()=>{
  assert.equal(typeof createLocalOllamaAdapter,'function');
  const controller=new AbortController();
  let executeSignal;
  const fetchImpl=async(url,options={})=>{
    if(String(url).endsWith('/api/tags')) return response({models:[{name:'qwen3:8b'}]});
    executeSignal=options.signal;
    return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
  };
  const adapter=createLocalOllamaAdapter({model:'qwen3:8b',fetchImpl,requestTimeoutMs:1000});
  const session=await adapter.connect();
  const pending=adapter.execute({command:'x',projectId:'seis',runId:'r',intent:'general'},{capability:'reasoning',sessionId:session.sessionId,signal:controller.signal});
  controller.abort();
  await assert.rejects(()=>pending,/request cancelled/);
  assert.equal(executeSignal?.aborted,true);
});

test('pre-aborted external signal prevents native Ollama request from starting',async()=>{
  const controller=new AbortController();
  controller.abort();
  let chatCalls=0;
  const fetchImpl=async(url)=>{
    if(String(url).endsWith('/api/tags')) return response({models:[{name:'qwen3:8b'}]});
    chatCalls+=1;
    return response({model:'qwen3:8b',created_at:'2026-09-11T17:00:00Z',message:{content:'should-not-run'},done:true});
  };
  const adapter=createLocalOllamaAdapter({model:'qwen3:8b',fetchImpl});
  const session=await adapter.connect();
  await assert.rejects(()=>adapter.execute({command:'x'},{capability:'reasoning',sessionId:session.sessionId,signal:controller.signal}),/request cancelled/);
  assert.equal(chatCalls,0);
});
