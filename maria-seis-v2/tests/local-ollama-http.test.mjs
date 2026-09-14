import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createLocalOllamaAdapter } from '../src/adapters/localOllama.js';
import { createHostAdapterManager } from '../src/adapters/hostAdapter.js';

test('native Ollama adapter crosses real loopback HTTP without upgrading transport evidence to external outcome', async t=>{
  const requests=[];
  const server=http.createServer(async(req,res)=>{
    requests.push(`${req.method} ${req.url}`);
    res.setHeader('content-type','application/json');
    if(req.method==='GET' && req.url==='/api/tags'){
      res.end(JSON.stringify({models:[{name:'qwen3:8b',model:'qwen3:8b'}]}));
      return;
    }
    if(req.method==='POST' && req.url==='/api/chat'){
      let body='';
      for await (const chunk of req) body+=chunk;
      const input=JSON.parse(body);
      assert.equal(input.model,'qwen3:8b');
      assert.equal(input.stream,false);
      res.end(JSON.stringify({
        model:'qwen3:8b',created_at:'2026-09-11T17:30:00Z',
        message:{role:'assistant',content:'loopback ready'},done:true,done_reason:'stop',
        prompt_eval_count:4,eval_count:2,total_duration:456
      }));
      return;
    }
    res.statusCode=404; res.end(JSON.stringify({error:'not-found'}));
  });
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  t.after(()=>server.close());
  const {port}=server.address();
  const adapter=createLocalOllamaAdapter({id:'ollama-local',baseUrl:`http://127.0.0.1:${port}`,model:'qwen3:8b'});
  const manager=createHostAdapterManager();
  manager.register(adapter);
  const state=await manager.connect('ollama-local');
  assert.equal(state.status,'ready');
  assert.equal(state.healthVerified,true);
  const outcome=await manager.execute('ollama-local','reasoning',{command:'status?',runId:'run-http',projectId:'seis',intent:'general'});
  assert.equal(outcome.status,'ok');
  const receipt=outcome.result;
  assert.equal(receipt.output,'loopback ready');
  assert.equal(receipt.transportVerified,true);
  assert.equal(receipt.outcomeVerified,false);
  assert.equal(receipt.verificationScope,'model-response-transport');
  await manager.disconnect('ollama-local');
  assert.deepEqual(requests,['GET /api/tags','GET /api/tags','POST /api/chat']);
});
