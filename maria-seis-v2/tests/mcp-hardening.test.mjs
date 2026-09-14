import test from 'node:test';
import assert from 'node:assert/strict';
import {createMcpAdapter} from '../src/adapters/mcpClient.js';
const init=()=>({protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'fixture',version:'1.0.0'}});
const tool=name=>({name,inputSchema:{type:'object',properties:{}}});
const ok=()=>({content:[{type:'text',text:'returned'}],isError:false});
const make=(handler,options={})=>createMcpAdapter({protocolVersion:'2025-06-18',transport:async r=>{
  if(r.method==='initialize')return init();
  if(r.method==='notifications/initialized')return undefined;
  if(r.method==='tools/list')return {tools:[tool('package.inspect')]};
  return handler?.(r)??ok();
},...options});
async function ready(adapter){await adapter.connect();await adapter.health();return adapter;}
const payload={tool:'package.inspect',arguments:{},runId:'run-a',projectId:'seis',intent:'mcp-health'};
const ctx={capability:'tool-call'};

test('MCP initialization sends ID-less initialized notification before discovery',async()=>{
 const seen=[];const a=make(null,{transport:async r=>{seen.push(r);return r.method==='initialize'?init():r.method==='tools/list'?{tools:[]}:undefined;}});
 await ready(a);assert.deepEqual(seen.map(r=>r.method),['initialize','notifications/initialized','tools/list']);assert.ok(!Object.hasOwn(seen[1],'id'));
});
for(const value of [{},null,{...init(),protocolVersion:'2099-01-01'},{...init(),capabilities:{}},{...init(),serverInfo:{}}]){
 test(`rejects malformed/unsupported initialize ${JSON.stringify(value)}`,async()=>{
  const a=make(null,{transport:async()=>value});await assert.rejects(()=>a.connect());assert.deepEqual(a.tools(),[]);
 });
}
test('discovery is not authorization; default host policy denies calls',async()=>{
 let called=false;const a=await ready(make(()=>{called=true;return ok();}));
 await assert.rejects(()=>a.execute(payload,ctx),/not-authorized/);assert.equal(called,false);
});
test('only literal true authorizes; truthy promises are denied',async()=>{
 const a=await ready(make(null,{authorizeTool:()=>Promise.resolve(true)}));await assert.rejects(()=>a.execute(payload,ctx),/not-authorized/);
});
test('an authorized transport result alone is not verified outcome',async()=>{
 const a=await ready(make(null,{authorizeTool:()=>true}));const r=await a.execute(payload,ctx);
 assert.equal(r.ok,true);assert.equal(r.transportVerified,true);assert.equal(r.outcomeVerified,false);assert.equal(r.providerId,'mcp');
});
for(const result of [undefined,null,{}, {isError:false}, {content:[]}, {content:[{type:'text'}]}, {content:[{type:'text',text:'ok'}],isError:'false'}]){
 test(`malformed result never becomes success ${JSON.stringify(result)}`,async()=>{
  const a=await ready(make(null,{authorizeTool:()=>true,transport:async r=>r.method==='initialize'?init():r.method==='tools/list'?{tools:[tool('package.inspect')]}:r.method==='tools/call'?result:undefined}));
  await assert.rejects(()=>a.execute(payload,ctx),/invalid-tool-result/);
 });
}
test('tool-level isError is not execution success',async()=>{
 const a=await ready(make(()=>({...ok(),isError:true}),{authorizeTool:()=>true,verifyResult:()=>true}));const r=await a.execute(payload,ctx);assert.equal(r.ok,false);assert.equal(r.outcomeVerified,false);
});
test('explicit independent verifier can confirm result but cannot mutate identity',async()=>{
 const a=await ready(make(null,{authorizeTool:()=>true,verifyResult:({request})=>{try{request.runId='wrong';}catch{}return true;}}));
 const r=await a.execute(payload,ctx);assert.equal(r.runId,'run-a');assert.equal(r.outcomeVerified,true);
});
test('paginated discovery collects all pages atomically',async()=>{
 const a=make(null,{transport:async r=>r.method==='initialize'?init():r.method==='tools/list'?(r.params.cursor?{tools:[tool('second')]}:{tools:[tool('first')],nextCursor:'page-2'}):undefined});
 await ready(a);assert.deepEqual(a.tools(),['first','second']);
});
test('repeated discovery cursor fails closed',async()=>{
 const a=make(null,{transport:async r=>r.method==='initialize'?init():{tools:[tool('first')],nextCursor:'repeat'}});
 await a.connect();await assert.rejects(()=>a.health());assert.deepEqual(a.tools(),[]);
});
test('failed refresh removes previously discovered tool eligibility',async()=>{
 let fail=false;const a=make(null,{transport:async r=>{if(r.method==='initialize')return init();if(r.method==='tools/list'){if(fail)throw Error('private detail');return{tools:[tool('package.inspect')]};}}});
 await ready(a);fail=true;await assert.rejects(()=>a.health());assert.deepEqual(a.tools(),[]);
});
test('disconnect during discovery prevents late result from restoring tools',async()=>{
 let resolve;const a=make(null,{transport:async r=>r.method==='initialize'?init():r.method==='tools/list'?new Promise(r=>resolve=r):undefined});
 await a.connect();const pending=a.health();await Promise.resolve();await a.disconnect();resolve({tools:[tool('package.inspect')]});await assert.rejects(()=>pending);assert.deepEqual(a.tools(),[]);
});
test('mutating original arguments during authorization cannot change dispatched request',async()=>{
 const input={...payload,arguments:{value:'original'}};let sent;
 const a=await ready(make(r=>{sent=r.params;return ok();},{authorizeTool:()=>{input.arguments.value='changed';return true;}}));
 await a.execute(input,ctx);assert.equal(sent.arguments.value,'original');
});

test('known credential is redacted safely even with quote and backslash characters',async()=>{
 const secret='s"quoted\\value';const a=await ready(make(()=>({content:[{type:'text',text:`echo: ${secret}`}]}),{authorizeTool:()=>true,authToken:secret}));
 const r=await a.execute(payload,ctx);assert.equal(r.result.content[0].text,'echo: [REDACTED]');
});
test('older failed discovery cannot erase a newer completed snapshot',async()=>{
 let rejectOld,n=0;const a=make(null,{transport:async r=>{
  if(r.method==='initialize')return init();if(r.method==='notifications/initialized')return;
  if(r.method==='tools/list'){if(++n===1)return new Promise((_,reject)=>rejectOld=reject);return {tools:[tool('new-tool')]};}
 }});
 await a.connect();const old=a.health();await Promise.resolve();await a.health();rejectOld(Error('old failure'));await assert.rejects(()=>old);assert.deepEqual(a.tools(),['new-tool']);
});
test('older successful discovery cannot replace a newer snapshot',async()=>{
 let resolveOld,n=0;const a=make(null,{transport:async r=>{
  if(r.method==='initialize')return init();if(r.method==='notifications/initialized')return;
  if(r.method==='tools/list'){if(++n===1)return new Promise(resolve=>resolveOld=resolve);return {tools:[tool('new-tool')]};}
 }});
 await a.connect();const old=a.health();await Promise.resolve();await a.health();resolveOld({tools:[tool('old-tool')]});await assert.rejects(()=>old);assert.deepEqual(a.tools(),['new-tool']);
});
