import test from 'node:test';
import assert from 'node:assert/strict';
import { createMcpAdapter } from '../src/adapters/mcpClient.js';

function transport(handler){return async request=>handler(request)}

test('discovers tools only after initialize handshake', async()=>{
  const calls=[];
  const adapter=createMcpAdapter({providerId:'mcp',transport:transport(async req=>{
    calls.push(req.method);
    if(req.method==='initialize') return {protocolVersion:'2025-06-18',serverInfo:{name:'test'}};
    if(req.method==='tools/list') return {tools:[{name:'repo.read',description:'read'}]};
  })});
  const session=await adapter.connect({});
  const health=await adapter.health({session});
  assert.equal(health.ok,true);
  assert.deepEqual(health.capabilities,['tool-call']);
  assert.deepEqual(adapter.tools(),['repo.read']);
  assert.deepEqual(calls,['initialize','tools/list']);
});

test('rejects calling undiscovered tool', async()=>{
  const adapter=createMcpAdapter({providerId:'mcp',transport:transport(async req=>{
    if(req.method==='initialize') return {protocolVersion:'2025-06-18'};
    if(req.method==='tools/list') return {tools:[{name:'repo.read'}]};
  })});
  const s=await adapter.connect({}); await adapter.health({session:s});
  await assert.rejects(()=>adapter.execute({tool:'repo.write',arguments:{}},{capability:'tool-call'}),/tool-not-discovered/);
});

test('tool call returns attributable receipt evidence', async()=>{
  const adapter=createMcpAdapter({providerId:'mcp',transport:transport(async req=>{
    if(req.method==='initialize') return {protocolVersion:'2025-06-18'};
    if(req.method==='tools/list') return {tools:[{name:'repo.read'}]};
    if(req.method==='tools/call') return {content:[{type:'text',text:'ok'}],isError:false};
  })});
  const s=await adapter.connect({}); await adapter.health({session:s});
  const receipt=await adapter.execute({tool:'repo.read',arguments:{path:'README.md'},runId:'r1',projectId:'seis',intent:'general'},{capability:'tool-call'});
  assert.equal(receipt.ok,true);
  assert.equal(receipt.providerId,'mcp');
  assert.equal(receipt.tool,'repo.read');
  assert.equal(receipt.outcomeVerified,true);
  assert.ok(receipt.evidence.some(x=>x.includes('mcp-tool:repo.read')));
});

test('authorization header is host-side and never returned in receipt', async()=>{
  let seen;
  const adapter=createMcpAdapter({providerId:'mcp',authToken:'secret-token',transport:async req=>{
    seen=req.headers?.authorization;
    if(req.method==='initialize') return {protocolVersion:'2025-06-18'};
    if(req.method==='tools/list') return {tools:[]};
  }});
  const s=await adapter.connect({}); const health=await adapter.health({session:s});
  assert.equal(seen,'Bearer secret-token');
  assert.ok(!JSON.stringify(health).includes('secret-token'));
});

test('abort signal cancels tool call', async()=>{
  const controller=new AbortController();
  const adapter=createMcpAdapter({providerId:'mcp',transport:async req=>{
    if(req.method==='initialize') return {protocolVersion:'2025-06-18'};
    if(req.method==='tools/list') return {tools:[{name:'slow'}]};
    return new Promise((_,reject)=>req.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
  }});
  const s=await adapter.connect({}); await adapter.health({session:s});
  const pending=adapter.execute({tool:'slow',arguments:{}},{capability:'tool-call',signal:controller.signal});
  controller.abort();
  await assert.rejects(()=>pending);
});
