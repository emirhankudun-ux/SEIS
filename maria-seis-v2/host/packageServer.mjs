/** Read-only MCP reference server: inspects ONLY package.json beneath its explicit root. */
import {open, lstat, realpath} from 'node:fs/promises';
import {constants} from 'node:fs';
import {resolve, join} from 'node:path';
import {createHash} from 'node:crypto';
const root = await realpath(resolve(process.argv[2] ?? '.'));
const version='2025-06-18', maxBytes=262144;
let phase='new', count=0;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const send=value=>process.stdout.write(JSON.stringify(value)+'\n');
const error=(id,code,message)=>send({jsonrpc:'2.0',id,error:{code,message}});
const tool=Object.freeze({name:'package.inspect',description:'Read-only name, version, byte count and SHA-256 of this root package.json.',
  inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}});
async function inspectPackage(){
  const target=join(root,'package.json');
  const entry=await lstat(target);
  if(!entry.isFile()||entry.isSymbolicLink()||entry.size>maxBytes)throw new Error('package-rejected');
  const handle=await open(target,constants.O_RDONLY|(constants.O_NOFOLLOW??0)|(constants.O_NONBLOCK??0));
  try{
    const stat=await handle.stat();
    if(!stat.isFile()||stat.size>maxBytes)throw new Error('package-rejected');
    // Bounded fd read; do not follow a replacement path after opening or read a growing file unboundedly.
    const buffer=Buffer.alloc(maxBytes+1);let length=0;
    while(length<buffer.length){const {bytesRead}=await handle.read(buffer,length,buffer.length-length,null);if(!bytesRead)break;length+=bytesRead;}
    if(length>maxBytes)throw new Error('package-rejected');
    const bytes=buffer.subarray(0,length),data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
    if(!object(data))throw new Error('package-rejected');
    const text=(value)=>typeof value==='string'&&value.length<=160?value:null;
    return {name:text(data.name),version:text(data.version),bytes:length,sha256:createHash('sha256').update(bytes).digest('hex')};
  }finally{await handle.close();}
}
async function handle(message){
  if(!object(message)||message.jsonrpc!=='2.0'||typeof message.method!=='string')return error(null,-32600,'Invalid request');
  const hasId=Object.hasOwn(message,'id'),id=message.id;
  if(!hasId){if(message.method==='notifications/initialized'&&phase==='initializing')phase='ready';return;}
  if(!(typeof id==='string'||Number.isSafeInteger(id)))return error(null,-32600,'Invalid request');
  if(message.method==='ping')return send({jsonrpc:'2.0',id,result:{}});
  if(message.method==='initialize'){
    if(phase!=='new'||message.params?.protocolVersion!==version)return error(id,-32602,'Unsupported initialization');
    phase='initializing';return send({jsonrpc:'2.0',id,result:{protocolVersion:version,capabilities:{tools:{}},serverInfo:{name:'maria-package-inspector',version:'1.0.0'}}});
  }
  if(phase!=='ready')return error(id,-32002,'Not initialized');
  if(message.method==='tools/list')return send({jsonrpc:'2.0',id,result:{tools:[tool]}});
  if(message.method!=='tools/call')return error(id,-32601,'Unknown method');
  if(message.params?.name!==tool.name)return error(id,-32602,'Unknown tool');
  try{
    const args=message.params?.arguments??{};
    if(!object(args)||Object.keys(args).length)throw new Error('arguments-rejected');
    const result=await inspectPackage();
    send({jsonrpc:'2.0',id,result:{content:[{type:'text',text:JSON.stringify(result)}],structuredContent:result,isError:false}});
  }catch{send({jsonrpc:'2.0',id,result:{content:[{type:'text',text:'Package inspection rejected or unavailable.'}],isError:true}});}
}
let buffer=Buffer.alloc(0);
try{
  for await(const chunk of process.stdin){
    let offset=0;
    while(offset<chunk.length){
      const next=chunk.indexOf(10,offset),end=next===-1?chunk.length:next;
      if(buffer.length+end-offset>65536||count>256)throw new Error('input-limit');
      buffer=Buffer.concat([buffer,chunk.subarray(offset,end)]);
      if(next===-1)break;
      const line=buffer;buffer=Buffer.alloc(0);offset=next+1;count++;
      let message;try{message=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(line));}catch{error(null,-32700,'Invalid JSON');continue;}
      await handle(message);
    }
  }
}catch{process.exitCode=1;}
