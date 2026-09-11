import test from 'node:test';
import assert from 'node:assert/strict';
import { createMcpAdapter } from '../src/adapters/mcpClient.js';

function transport(handler){return async request=>handler(request)}

test('discovers tools only after initialize handshake', async()=>{
  const calls=[];
  const adapter=createMcpAdapter({providerId:'mcp',protocolVersion:'2025-06-18',transport:transport(async req=>{
    calls.push(req.method);
    if(req.method==='initialize') return {protocolVersion:'2025-06-18',serverInfo:{name:'test'}};
    if(req.method==='notifications/initialized') return undefined;
    if(req.method==='tools/list') return {tools:[{name:'repo.read',description:'read'}]};
  })});
  const session=await adapter.connect({});
  const health=await adapter.health({session});
  assert.equal(health.ok,true);
  assert.deepEqual(health.capabilities,['tool-call']);
  assert.deepEqual(adapter.tools(),['repo.read']);
  assert.deepEqual(calls,['initialize','notifications/initialized','tools/list']);
});

test('defaults to modern MCP discovery and stamps per-request metadata', async()=>{
  const calls=[];
  const adapter=createMcpAdapter({providerId:'mcp',transport:transport(async req=>{
    calls.push(req);
    if(req.method==='server/discover') return {supportedVersions:['2026-07-28'],capabilities:{tools:{}}};
    if(req.method==='tools/list') return {tools:[{name:'repo.read'}]};
    if(req.method==='tools/call') return {content:[{type:'text',text:'ok'}],isError:false};
  })});
  await adapter.connect({});
  await adapter.health({});
  const receipt=await adapter.execute({tool:'repo.read',arguments:{}},{capability:'tool-call'});
  assert.equal(receipt.ok,true);
  assert.equal(receipt.protocolVersion,'2026-07-28');
  for(const call of calls){
    assert.equal(call.params?._meta?.['io.modelcontextprotocol/protocolVersion'],'2026-07-28');
    assert.equal(call.params?._meta?.['io.modelcontextprotocol/clientInfo']?.name,'MARIA-SEIS');
  }
});

test('auto mode falls back to legacy initialize when discover is unsupported', async()=>{
  const calls=[];
  const adapter=createMcpAdapter({transport:transport(async req=>{
    calls.push(req.method);
    if(req.method==='server/discover') { const error=new Error('method not found'); error.code=-32601; throw error; }
    if(req.method==='initialize') return {protocolVersion:'2025-11-25',capabilities:{tools:{}}};
    if(req.method==='notifications/initialized') return undefined;
    if(req.method==='tools/list') return {tools:[]};
  })});
  const connection=await adapter.connect({});
  const health=await adapter.health({});
  assert.equal(connection.protocolVersion,'2025-11-25');
  assert.equal(health.ok,true);
  assert.deepEqual(calls,['server/discover','initialize','notifications/initialized','tools/list']);
});

test('rejects legacy protocol version that the client does not support', async()=>{
  const adapter=createMcpAdapter({protocolVersion:'2025-06-18',transport:transport(async req=>{
    if(req.method==='initialize') return {protocolVersion:'2024-11-05',capabilities:{tools:{}}};
  })});
  await assert.rejects(()=>adapter.connect({}),/unsupported-protocol-version/);
});

test('rejects calling undiscovered tool', async()=>{
  const adapter=createMcpAdapter({protocolVersion:'2025-06-18',providerId:'mcp',transport:transport(async req=>{
    if(req.method==='initialize') return {protocolVersion:'2025-06-18'};
    if(req.method==='notifications/initialized') return undefined;
    if(req.method==='tools/list') return {tools:[{name:'repo.read'}]};
  })});
  const s=await adapter.connect({}); await adapter.health({session:s});
  await assert.rejects(()=>adapter.execute({tool:'repo.write',arguments:{}},{capability:'tool-call'}),/tool-not-discovered/);
});

test('tool call returns attributable receipt evidence', async()=>{
  const adapter=createMcpAdapter({protocolVersion:'2025-06-18',providerId:'mcp',transport:transport(async req=>{
    if(req.method==='initialize') return {protocolVersion:'2025-06-18'};
    if(req.method==='notifications/initialized') return undefined;
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

test('empty or malformed tool result is not marked verified', async()=>{
  const adapter=createMcpAdapter({protocolVersion:'2025-06-18',transport:transport(async req=>{
    if(req.method==='initialize') return {protocolVersion:'2025-06-18'};
    if(req.method==='notifications/initialized') return undefined;
    if(req.method==='tools/list') return {tools:[{name:'repo.read'}]};
    if(req.method==='tools/call') return {};
  })});
  await adapter.connect({}); await adapter.health({});
  const receipt=await adapter.execute({tool:'repo.read'},{capability:'tool-call'});
  assert.equal(receipt.ok,false);
  assert.equal(receipt.outcomeVerified,false);
});

test('authorization header is host-side and never returned in receipt', async()=>{
  let seen;
  const adapter=createMcpAdapter({protocolVersion:'2025-06-18',providerId:'mcp',authToken:'secret-token',transport:async req=>{
    seen=req.headers?.authorization;
    if(req.method==='initialize') return {protocolVersion:'2025-06-18'};
    if(req.method==='notifications/initialized') return undefined;
    if(req.method==='tools/list') return {tools:[]};
  }});
  const s=await adapter.connect({}); const health=await adapter.health({session:s});
  assert.equal(seen,'Bearer secret-token');
  assert.ok(!JSON.stringify(health).includes('secret-token'));
});

test('abort signal cancels tool call', async()=>{
  const controller=new AbortController();
  const adapter=createMcpAdapter({protocolVersion:'2025-06-18',providerId:'mcp',transport:async req=>{
    if(req.method==='initialize') return {protocolVersion:'2025-06-18'};
    if(req.method==='notifications/initialized') return undefined;
    if(req.method==='tools/list') return {tools:[{name:'slow'}]};
    return new Promise((_,reject)=>req.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
  }});
  const s=await adapter.connect({}); await adapter.health({session:s});
  const pending=adapter.execute({tool:'slow',arguments:{}},{capability:'tool-call',signal:controller.signal});
  controller.abort();
  await assert.rejects(()=>pending);
});
