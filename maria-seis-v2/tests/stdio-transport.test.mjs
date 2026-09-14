import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const {createStdioTransport}=await import('../host/stdioTransport.mjs').catch(()=>({}));
const fixture=fileURLToPath(new URL('./fixtures/mcp-process.mjs',import.meta.url));
function transport(t,opts={}){assert.equal(typeof createStdioTransport,'function','stdio transport must exist');const p=createStdioTransport({command:process.execPath,args:[fixture],requestTimeoutMs:800,...opts});t.after(()=>p.close());return p;}
const rpc=(id,method,params={},extras={})=>({jsonrpc:'2.0',id,method,params,...extras});

test('real child process correlates concurrent responses arriving out of order',async t=>{
 const p=transport(t);const a=p.send(rpc('a','echo',{name:'first',delay:30}));const b=p.send(rpc('b','echo',{name:'second'}));
 assert.deepEqual((await Promise.all([a,b])).map(r=>r.name),['first','second']);assert.equal(p.snapshot().pending,0);assert.ok(p.snapshot().pid>0);
});
test('partial UTF-8 frame reconstructs exact text',async t=>{const p=transport(t);assert.equal((await p.send(rpc(1,'partial'))).text,'İstanbul 🌿');});
test('parent secrets and transport-only headers are not serialized or inherited',async t=>{
 process.env.MARIA_PARENT_SECRET='private-parent-sentinel';t.after(()=>delete process.env.MARIA_PARENT_SECRET);
 const p=transport(t);const r=await p.send(rpc(1,'environment',{}, {headers:{authorization:'private-header-sentinel'}}));
 assert.equal(r.leaked,false);assert.deepEqual(r.wire,['id','jsonrpc','method','params']);
});
test('request timeout rejects and removes pending work',async t=>{const p=transport(t,{requestTimeoutMs:80});await assert.rejects(()=>p.send(rpc(1,'hang')),/timeout/);assert.equal(p.snapshot().pending,0);});
test('explicit cancellation rejects promptly and late response is ignored',async t=>{
 const p=transport(t);await p.send(rpc('warm','echo'));const c=new AbortController();const pending=p.send(rpc(2,'echo',{delay:60},{signal:c.signal}));setTimeout(()=>c.abort(),10);
 await assert.rejects(()=>pending,/aborted/);await new Promise(r=>setTimeout(r,90));assert.equal(p.snapshot().pending,0);assert.equal((await p.send(rpc(3,'echo',{ok:true}))).ok,true);
});
test('pre-aborted request does not start a process',async t=>{const p=transport(t);const c=new AbortController();c.abort();await assert.rejects(()=>p.send(rpc(1,'echo',{}, {signal:c.signal})),/aborted/);assert.equal(p.snapshot().pid,null);});
test('child crash rejects all pending requests without leaking diagnostics',async t=>{
 const p=transport(t);const pending=p.send(rpc(1,'hang'));const crash=p.send(rpc(2,'crash'));
 const r=await Promise.allSettled([pending,crash]);assert.ok(r.every(x=>x.status==='rejected'));assert.equal(p.snapshot().pending,0);
});
for(const method of ['malformed','oversize'])test(`${method} stdout is rejected and bounded`,async t=>{const p=transport(t,{maxMessageBytes:1024});await assert.rejects(()=>p.send(rpc(1,method)),/protocol|limit/);assert.equal(p.snapshot().pending,0);});
test('remote RPC errors are normalized without raw exception values',async t=>{const p=transport(t);await assert.rejects(()=>p.send(rpc(1,'rpc-error')),e=>e.message==='mcp-rpc-error'&&e.code===-32603&&!String(e).includes('private-error-sentinel'));});
test('stderr is drained but never exposed in diagnostics',async t=>{const p=transport(t);await p.send(rpc(1,'stderr'));assert.ok(!JSON.stringify(p.snapshot()).includes('private-stderr-sentinel'));});
test('pending-request cap refuses overload while preserving the existing call',async t=>{
 const p=transport(t,{maxPending:1});await p.start();const first=p.send(rpc(1,'echo',{delay:60}));await assert.rejects(()=>p.send(rpc(2,'echo')),/limit/);await first;
});
test('close is idempotent and actually reaps the child',async t=>{const p=transport(t);await p.send(rpc(1,'echo'));const pid=p.snapshot().pid;await p.close();await p.close();assert.equal(p.snapshot().closed,true);assert.throws(()=>process.kill(pid,0));});
test('missing executable fails without unhandled child errors',async t=>{const p=transport(t,{command:'/nonexistent/maria-executable'});await assert.rejects(()=>p.start(),/spawn/);});
test('unsafe configuration is rejected before starting anything',()=>{assert.equal(typeof createStdioTransport,'function');for(const options of [{command:'node'},{command:process.execPath,args:'evil'},{command:process.execPath,requestTimeoutMs:0},{command:process.execPath,maxPending:Infinity}])assert.throws(()=>createStdioTransport(options));});
