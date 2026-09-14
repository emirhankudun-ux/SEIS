// Preserve the concurrently shipped modern lifecycle while enforcing the hardened host boundary.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createMcpAdapter} from '../src/adapters/mcpClient.js';
const modern='2026-07-28';
const old='2025-11-25';
const init=version=>({protocolVersion:version,capabilities:{tools:{}},serverInfo:{name:'fixture',version:'1'}});
const tools={tools:[{name:'repo.read',inputSchema:{type:'object',properties:{}}}]};

test('auto negotiation retains modern discovery and per-request metadata without initialize',async()=>{
 const calls=[];
 const a=createMcpAdapter({authorizeTool:()=>true,transport:async r=>{
  calls.push(r);
  if(r.method==='server/discover')return{supportedVersions:[modern],capabilities:{tools:{}}};
  if(r.method==='tools/list')return tools;
  if(r.method==='tools/call')return{content:[{type:'text',text:'result'}]};
 }});
 const connected=await a.connect();await a.health();const receipt=await a.execute({tool:'repo.read'},{capability:'tool-call'});
 assert.equal(connected.sessionId,null);assert.equal(a.mode(),'modern');assert.equal(a.protocolVersion(),modern);assert.equal(receipt.protocolVersion,modern);assert.equal(receipt.outcomeVerified,false);
 assert.deepEqual(calls.map(r=>r.method),['server/discover','tools/list','tools/call']);
 for(const r of calls){assert.equal(r.params._meta['io.modelcontextprotocol/protocolVersion'],modern);assert.equal(r.params._meta['io.modelcontextprotocol/clientInfo'].name,'MARIA-SEIS');assert.deepEqual(r.params._meta['io.modelcontextprotocol/clientCapabilities'],{});}
});
test('auto negotiation falls back only after method-not-found and preserves initialized notification',async()=>{
 const calls=[];const a=createMcpAdapter({transport:async r=>{
  calls.push(r.method);if(r.method==='server/discover')throw Object.assign(new Error('normalized'),{code:-32601});
  if(r.method==='initialize')return init(old);if(r.method==='tools/list')return tools;
 }});
 assert.equal((await a.connect()).protocolVersion,old);await a.health();assert.equal(a.mode(),'legacy');assert.deepEqual(calls,['server/discover','initialize','notifications/initialized','tools/list']);
});
test('discovery advertising only a supported legacy version uses the selected handshake',async()=>{
 const a=createMcpAdapter({transport:async r=>r.method==='server/discover'?{supportedVersions:['2025-06-18'],capabilities:{tools:{}}}:r.method==='initialize'?init(r.params.protocolVersion):undefined});
 assert.equal((await a.connect()).protocolVersion,'2025-06-18');assert.equal(a.mode(),'legacy');
});
test('unsupported modern discovery never silently falls back',async()=>{
 const seen=[];const a=createMcpAdapter({protocolVersion:modern,transport:async r=>{seen.push(r.method);return{supportedVersions:['2099-01-01'],capabilities:{tools:{}}};}});
 await assert.rejects(()=>a.connect());assert.deepEqual(seen,['server/discover']);
});
test('an authentication failure mentioning method-not-found cannot trigger downgrade',async()=>{
 const seen=[];const a=createMcpAdapter({transport:async r=>{seen.push(r.method);throw Object.assign(Error('method not found'),{code:401});}});
 await assert.rejects(()=>a.connect());assert.deepEqual(seen,['server/discover']);
});
test('an explicitly pinned legacy version skips modern discovery',async()=>{
 const seen=[];const a=createMcpAdapter({protocolVersion:old,transport:async r=>{seen.push(r.method);if(r.method==='initialize')return init(old);}});
 assert.equal((await a.connect()).protocolVersion,old);assert.deepEqual(seen,['initialize','notifications/initialized']);
});
test('disconnect invalidates late modern discovery without restoring ready state',async()=>{
 let finish;const a=createMcpAdapter({transport:()=>new Promise(r=>finish=r)});const pending=a.connect();await Promise.resolve();await a.disconnect();finish({supportedVersions:[modern],capabilities:{tools:{}}});await assert.rejects(()=>pending);assert.equal(a.mode(),null);assert.equal(a.protocolVersion(),null);
});
