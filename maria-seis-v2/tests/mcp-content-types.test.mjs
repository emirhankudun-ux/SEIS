import test from 'node:test';
import assert from 'node:assert/strict';
import {createMcpAdapter} from '../src/adapters/mcpClient.js';

const init=()=>({protocolVersion:'2025-11-25',capabilities:{tools:{}},serverInfo:{name:'fixture',version:'1.0.0'}});
const tool={name:'media.inspect',inputSchema:{type:'object',properties:{}}};
async function ready(result){
  const adapter=createMcpAdapter({protocolVersion:'2025-11-25',authorizeTool:()=>true,transport:async request=>{
    if(request.method==='initialize') return init();
    if(request.method==='notifications/initialized') return undefined;
    if(request.method==='tools/list') return {tools:[tool]};
    if(request.method==='tools/call') return result;
  }});
  await adapter.connect();
  await adapter.health();
  return adapter;
}

test('accepts standard MCP multimedia and resource tool-result blocks without upgrading outcome verification', async()=>{
  const result={isError:false,content:[
    {type:'image',data:'aGVsbG8=',mimeType:'image/png'},
    {type:'audio',data:'aGVsbG8=',mimeType:'audio/wav'},
    {type:'resource_link',uri:'file:///project/report.txt',name:'report.txt',mimeType:'text/plain',size:5},
    {type:'resource',resource:{uri:'file:///project/report.txt',mimeType:'text/plain',text:'hello'}}
  ]};
  const adapter=await ready(result);
  const receipt=await adapter.execute({tool:'media.inspect',arguments:{},runId:'run-media'},{capability:'tool-call'});
  assert.equal(receipt.ok,true);
  assert.equal(receipt.transportVerified,true);
  assert.equal(receipt.outcomeVerified,false);
  assert.equal(receipt.verificationScope,'tool-response-transport');
  assert.deepEqual(receipt.result,result);
});

test('rejects malformed or ambiguous MCP multimedia and resource result blocks', async()=>{
  const invalidBlocks=[
    {type:'image',data:'***',mimeType:'image/png'},
    {type:'image',data:'aGVsbG8=',mimeType:'audio/wav'},
    {type:'audio',data:'aGVsbG8=',mimeType:'image/png'},
    {type:'resource_link',uri:'',name:'report.txt'},
    {type:'resource_link',uri:'file:///report.txt',name:''},
    {type:'resource',resource:{uri:'file:///report.txt',text:'hello',blob:'aGVsbG8='}},
    {type:'resource',resource:{uri:'',text:'hello'}},
    {type:'unknown',value:'nope'}
  ];
  for(const block of invalidBlocks){
    const adapter=await ready({content:[block]});
    await assert.rejects(()=>adapter.execute({tool:'media.inspect',arguments:{}},{capability:'tool-call'}),/invalid-tool-result/);
  }
});
