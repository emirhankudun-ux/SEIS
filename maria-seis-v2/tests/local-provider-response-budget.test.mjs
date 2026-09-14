import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createLocalOpenAICompatibleAdapter } from '../src/adapters/localOpenAICompatible.js';
import { createLocalOllamaAdapter } from '../src/adapters/localOllama.js';

const specs = [
  {name:'openai-compatible', create:createLocalOpenAICompatibleAdapter, listPath:'/v1/models',
    list:model=>({data:[{id:model}]}), chatPath:'/v1/chat/completions',
    chat:model=>({id:'receipt-1',model,choices:[{message:{content:'ready'}}]})},
  {name:'ollama', create:createLocalOllamaAdapter, listPath:'/api/tags',
    list:model=>({models:[{name:model,model}]}), chatPath:'/api/chat',
    chat:model=>({model,created_at:'2026-09-13T10:00:00Z',done:true,message:{content:'ready'}})},
];

function jsonResponse(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return new Response(bytes, {status:200, headers:{'content-type':'application/json','content-length':String(bytes.byteLength)}});
}

for (const spec of specs) {
  test(`${spec.name}: rejects a declared response larger than the configured byte budget before body parsing`, async () => {
    let bodyRead = false;
    const adapter = spec.create({model:'fixture',maxResponseBytes:1024,fetchImpl:async()=>({
      ok:true,
      headers:new Headers({'content-length':'2048'}),
      body:{getReader(){ bodyRead=true; throw new Error('must not read'); }},
    })});
    await assert.rejects(adapter.connect(), /models response too large/);
    assert.equal(bodyRead,false);
  });

  test(`${spec.name}: rejects a chunked response once streamed bytes exceed the budget`, async () => {
    const huge = {data:'🌍'.repeat(700)};
    const encoded = new TextEncoder().encode(JSON.stringify(huge));
    let cancelled = false;
    let reads = 0;
    const reader = {
      async read() {
        reads += 1;
        if (reads === 1) return {done:false,value:encoded.subarray(0,700)};
        if (reads === 2) return {done:false,value:encoded.subarray(700)};
        return new Promise(()=>{});
      },
      async cancel() { cancelled = true; },
      releaseLock() {},
    };
    const adapter = spec.create({model:'fixture',maxResponseBytes:1024,fetchImpl:async()=>({
      ok:true,headers:new Headers(),body:{getReader:()=>reader},
    })});
    await assert.rejects(adapter.connect(), /models response too large/);
    assert.equal(cancelled,true);
  });

  test(`${spec.name}: response budget counts UTF-8 bytes rather than JavaScript characters`, async () => {
    const payload = spec.list('fixture');
    payload.padding = '🌍'.repeat(300);
    const encoded = new TextEncoder().encode(JSON.stringify(payload));
    assert.ok(encoded.byteLength > 1024);
    const adapter = spec.create({model:'fixture',maxResponseBytes:1024,fetchImpl:async()=>new Response(encoded,{status:200})});
    await assert.rejects(adapter.connect(), /models response too large/);
  });

  test(`${spec.name}: valid JSON at the exact byte boundary is accepted`, async () => {
    const payload = spec.list('fixture');
    const encoded = new TextEncoder().encode(JSON.stringify(payload));
    const adapter = spec.create({model:'fixture',maxResponseBytes:encoded.byteLength,fetchImpl:async()=>new Response(encoded,{status:200})});
    const session = await adapter.connect();
    assert.equal(typeof session.sessionId,'string');
    await adapter.disconnect({sessionId:session.sessionId});
  });

  test(`${spec.name}: invalid response budgets are rejected at construction`, () => {
    for (const value of [0,-1,1.5,NaN,Infinity,'1024',true,17*1024*1024]) {
      assert.throws(()=>spec.create({model:'fixture',maxResponseBytes:value}), /invalid response byte budget/);
    }
  });
}

test('stream reader acquisition errors are redacted', async () => {
  const adapter = createLocalOllamaAdapter({
    model:'fixture',maxResponseBytes:1024,
    fetchImpl:async()=>({
      ok:true,headers:new Headers(),body:{getReader(){ throw new Error('private stream detail'); }},
    }),
  });
  await assert.rejects(adapter.connect(), error => {
    assert.equal(error.message,'models response invalid');
    return true;
  });
});

test('oversize rejection does not wait for an uncooperative reader cancel hook', async () => {
  const encoded = new TextEncoder().encode(JSON.stringify({padding:'x'.repeat(3000)}));
  let reads = 0;
  const reader = {
    async read() {
      reads += 1;
      return reads === 1
        ? {done:false,value:encoded}
        : new Promise(()=>{});
    },
    cancel() { return new Promise(()=>{}); },
    releaseLock() {},
  };
  const adapter = createLocalOllamaAdapter({
    model:'fixture',maxResponseBytes:1024,requestTimeoutMs:5000,
    fetchImpl:async()=>({ok:true,headers:new Headers(),body:{getReader:()=>reader}}),
  });
  const outcome = await Promise.race([
    adapter.connect().then(()=>({ok:true}),error=>({error})),
    new Promise(resolve=>setTimeout(()=>resolve({pending:true}),150)),
  ]);
  assert.equal(outcome.pending,undefined,'oversize rejection waited for reader.cancel()');
  assert.match(outcome.error?.message ?? '',/models response too large/);
});

test('real loopback chunked body is aborted after crossing the byte budget', {timeout:6000}, async t => {
  let closeResolve;
  const closed = new Promise(resolve => { closeResolve = resolve; });
  const server = http.createServer((req,res)=>{
    if (req.url!=='/api/tags') { res.statusCode=404; res.end(); return; }
    res.writeHead(200, {'content-type':'application/json'});
    res.write('{"models":[{"name":"fixture","model":"fixture"}],"padding":"');
    const chunk='x'.repeat(512);
    let sent=0;
    const timer=setInterval(()=>{
      if (sent>20) { clearInterval(timer); res.end('"}'); return; }
      res.write(chunk); sent+=1;
    },5);
    res.once('close',()=>{ clearInterval(timer); closeResolve(); });
  });
  t.after(async()=>{
    const done=new Promise(done=>server.close(done));
    server.closeAllConnections();
    await done;
  });
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  const adapter=createLocalOllamaAdapter({
    model:'fixture',baseUrl:`http://127.0.0.1:${server.address().port}`,maxResponseBytes:1024,
  });
  await assert.rejects(adapter.connect(), /models response too large/);
  await Promise.race([closed,new Promise((_,reject)=>setTimeout(()=>reject(new Error('socket was not closed')),3000))]);
});
