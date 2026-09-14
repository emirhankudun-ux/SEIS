import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync,symlinkSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createStdioTransport} from '../host/stdioTransport.mjs';
const {runPackageCheck}=await import('../host/checkMcp.mjs').catch(()=>({}));
const server=fileURLToPath(new URL('../host/packageServer.mjs',import.meta.url));
const rootOf=t=>{const root=mkdtempSync(path.join(tmpdir(),'maria-mcp-'));t.after(()=>rmSync(root,{recursive:true,force:true}));return root;};
const initialize={jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'test',version:'1'}}};

test('real package-inspection host returns independently verified SHA and exits its child',async t=>{
 assert.equal(typeof runPackageCheck,'function','real package checker must exist');const root=rootOf(t);const bytes=Buffer.from(JSON.stringify({name:'fixture-project',version:'1.2.3',secretField:'must-not-be-returned'}));writeFileSync(path.join(root,'package.json'),bytes);
 const report=await runPackageCheck({root});assert.equal(report.status,'verified');assert.equal(report.transport,'stdio');assert.equal(report.scope,'local-package-inspection');assert.equal(report.package.sha256,createHash('sha256').update(bytes).digest('hex'));assert.equal(report.package.bytes,bytes.length);assert.equal(report.package.name,'fixture-project');assert.equal(report.cleanup.closed,true);assert.ok(!JSON.stringify(report).includes('must-not-be-returned'));
});
test('real server rejects tools/list before initialized notification',async t=>{
 const root=rootOf(t);writeFileSync(path.join(root,'package.json'),'{}');const p=createStdioTransport({command:process.execPath,args:[server,root]});t.after(()=>p.close());
 const response=await p.send(initialize);assert.equal(response.protocolVersion,'2025-06-18');await assert.rejects(()=>p.send({jsonrpc:'2.0',id:2,method:'tools/list',params:{}}),/mcp-rpc-error/);
 await p.send({jsonrpc:'2.0',method:'notifications/initialized'});const tools=await p.send({jsonrpc:'2.0',id:3,method:'tools/list'});assert.equal(tools.tools[0].name,'package.inspect');
 const denied=await p.send({jsonrpc:'2.0',id:4,method:'tools/call',params:{name:'package.inspect',arguments:{path:'../secret'}}});assert.equal(denied.isError,true);
});
for(const mode of ['missing','invalid-json','oversized','directory','symlink'])test(`package inspection fails closed on ${mode}`,async t=>{
 assert.equal(typeof runPackageCheck,'function');const root=rootOf(t),file=path.join(root,'package.json');
 if(mode==='invalid-json')writeFileSync(file,'not-json');
 if(mode==='oversized')writeFileSync(file,'x'.repeat(270000));
 if(mode==='directory')mkdirSync(file);
 if(mode==='symlink'){writeFileSync(path.join(root,'private.json'),'{"private":"sentinel"}');symlinkSync(path.join(root,'private.json'),file);}
 const report=await runPackageCheck({root});assert.equal(report.status,'failed');assert.ok(!JSON.stringify(report).includes('sentinel'));
});
test('read-only package check does not change package bytes',async t=>{
 assert.equal(typeof runPackageCheck,'function');const root=rootOf(t),file=path.join(root,'package.json');writeFileSync(file,'{"name":"read-only","version":"1.0.0"}');const before=readFileSync(file);await runPackageCheck({root});assert.deepEqual(readFileSync(file),before);
});
