/** Node-only, bounded MCP stdio transport. Launch only a trusted executable; this is NOT an OS sandbox. */
import {spawn} from 'node:child_process';
import {isAbsolute} from 'node:path';

const integer=(x,min,max)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validId=x=>typeof x==='string'&&x.length>0&&x.length<=160||Number.isSafeInteger(x);
export function createStdioTransport({command,args=[],cwd,env={},requestTimeoutMs=3000,
  maxMessageBytes=1048576,maxPending=16,shutdownMs=250}={}) {
  if(typeof command!=='string'||!isAbsolute(command)||command.includes('\0'))throw new TypeError('absolute executable required');
  if(!Array.isArray(args)||args.length>64||args.some(a=>typeof a!=='string'||a.length>8192||a.includes('\0')))throw new TypeError('invalid arguments');
  if(cwd!==undefined&&(typeof cwd!=='string'||!isAbsolute(cwd)))throw new TypeError('absolute cwd required');
  if(!object(env)||Object.entries(env).some(([k,v])=>typeof v!=='string'||k.includes('=')||k.includes('\0')||v.includes('\0')))throw new TypeError('invalid environment');
  if(!integer(requestTimeoutMs,1,60000)||!integer(maxMessageBytes,256,4194304)||!integer(maxPending,1,128)||!integer(shutdownMs,1,5000))throw new TypeError('invalid transport bounds');
  // Snapshot launch configuration. Never inherit provider keys, NODE_OPTIONS or shell configuration.
  const launchArgs=[...args], launchEnv={...(process.platform==='win32'?{SystemRoot:process.env.SystemRoot??''}:{}),...env};
  let child=null,startPromise=null,closePromise=null,exitPromise=null,resolveExit;
  let status='idle',closed=false,buffer=Buffer.alloc(0),frameCount=0;
  const pending=new Map();
  function settle(id,error,result){
    const item=pending.get(id);if(!item)return;
    pending.delete(id);clearTimeout(item.timer);item.signal?.removeEventListener('abort',item.abort);
    if(error)item.reject(error);else item.resolve(result);
  }
  function stopPending(reason){for(const id of [...pending.keys()])settle(id,new Error(reason));}
  function fail(reason){status='failed';buffer=Buffer.alloc(0);stopPending(reason);void close();}
  function wire(message){
    const text=JSON.stringify(message)+'\n';
    if(Buffer.byteLength(text)>maxMessageBytes)throw new Error('mcp-message-limit');
    if(!child||status!=='ready'||child.stdin.destroyed)throw new Error('mcp-transport-unavailable');
    if(child.stdin.writableLength+Buffer.byteLength(text)>maxMessageBytes*maxPending)throw new Error('mcp-write-limit');
    child.stdin.write(text,error=>{if(error&&!closed&&status!=='closing')fail('mcp-write-failed');});
  }
  function receive(line){
    if(++frameCount>10000){fail('mcp-frame-limit');return;}
    let message;
    try {message=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(line));}
    catch {fail('mcp-protocol-error');return;}
    if(!object(message)||message.jsonrpc!=='2.0'){fail('mcp-protocol-error');return;}
    if(typeof message.method==='string'){
      if(Object.hasOwn(message,'id')){
        if(!validId(message.id)){fail('mcp-protocol-error');return;}
        // Do not honor sampling, filesystem or arbitrary server-initiated operations.
        try {wire(message.method==='ping'?{jsonrpc:'2.0',id:message.id,result:{}}:{jsonrpc:'2.0',id:message.id,error:{code:-32601,message:'Unsupported client method'}});}catch{fail('mcp-write-failed');}
      }
      return;
    }
    if(!validId(message.id)||Object.hasOwn(message,'result')===Object.hasOwn(message,'error')){fail('mcp-protocol-error');return;}
    if(Object.hasOwn(message,'error')){
      if(!object(message.error)||!Number.isInteger(message.error.code)){fail('mcp-protocol-error');return;}
      settle(message.id,Object.assign(new Error('mcp-rpc-error'),{code:message.error.code}));
    }else settle(message.id,null,message.result);
  }
  function onData(chunk){
    if(status!=='ready')return;
    let offset=0;
    while(offset<chunk.length&&status==='ready'){
      const newline=chunk.indexOf(10,offset),end=newline===-1?chunk.length:newline;
      if(buffer.length+end-offset>maxMessageBytes){fail('mcp-message-limit');return;}
      buffer=Buffer.concat([buffer,chunk.subarray(offset,end)]);
      if(newline===-1)return;
      const line=buffer;buffer=Buffer.alloc(0);receive(line);offset=newline+1;
    }
  }
  function start(){
    if(status==='ready')return Promise.resolve();
    if(startPromise&&status==='starting')return startPromise;
    if(status!=='idle')return Promise.reject(new Error('mcp-transport-closed'));
    status='starting';exitPromise=new Promise(resolve=>{resolveExit=resolve;});
    startPromise=new Promise((resolve,reject)=>{
      try {child=spawn(command,launchArgs,{cwd,env:launchEnv,shell:false,stdio:['pipe','pipe','pipe'],windowsHide:true});}
      catch {status='failed';closed=true;resolveExit();reject(new Error('mcp-spawn-failed'));return;}
      child.once('spawn',()=>{if(status==='starting'){status='ready';resolve();}else reject(new Error('mcp-transport-closed'));});
      child.once('error',()=>{reject(new Error('mcp-spawn-failed'));fail('mcp-spawn-failed');});
      child.once('close',()=>{closed=true;buffer=Buffer.alloc(0);if(status!=='failed')status='closed';stopPending('mcp-process-closed');resolveExit();});
      child.stdout.on('data',onData);
      child.stdout.on('error',()=>fail('mcp-read-failed'));
      child.stdin.on('error',()=>{if(status==='ready')fail('mcp-write-failed');});
      // Drain logs without storing/printing server-supplied secrets or unbounded stderr.
      child.stderr.on('data',()=>{});child.stderr.on('error',()=>{});
    });
    return startPromise;
  }
  async function send(request){
    if(request?.signal?.aborted)throw new Error('mcp-aborted');
    if(!object(request)||request.jsonrpc!=='2.0'||typeof request.method!=='string'||!request.method||request.method.length>160)throw new TypeError('invalid rpc request');
    const hasId=Object.hasOwn(request,'id');
    if(hasId&&!validId(request.id))throw new TypeError('invalid rpc id');
    const message={jsonrpc:'2.0',...(hasId?{id:request.id}:{}),method:request.method,...(request.params===undefined?{}:{params:request.params})};
    // JSON round-trip before awaits prevents caller mutation; headers/signal never reach the wire.
    const serialized=JSON.stringify(message);
    if(Buffer.byteLength(serialized)+1>maxMessageBytes)throw new Error('mcp-message-limit');
    const captured=JSON.parse(serialized),signal=request.signal;
    if(status!=='ready')await start();
    if(signal?.aborted)throw new Error('mcp-aborted');
    if(!hasId){wire(captured);return;}
    if(pending.size>=maxPending)throw new Error('mcp-pending-limit');
    if(pending.has(captured.id))throw new Error('mcp-duplicate-id');
    return new Promise((resolve,reject)=>{
      const cancel=reason=>{
        if(!pending.has(captured.id))return;
        settle(captured.id,new Error(reason));
        // Initialization requests MUST NOT receive MCP cancellation notifications.
        if(captured.method==='initialize'){void close();return;}
        try{wire({jsonrpc:'2.0',method:'notifications/cancelled',params:{requestId:captured.id,reason:reason==='mcp-aborted'?'Cancelled':'Timed out'}});}catch{}
      };
      const abort=()=>cancel('mcp-aborted');
      const timer=setTimeout(()=>cancel('mcp-request-timeout'),requestTimeoutMs);
      pending.set(captured.id,{resolve,reject,timer,signal,abort});
      signal?.addEventListener('abort',abort,{once:true});
      if(signal?.aborted){abort();return;}
      try{wire(captured);}catch(error){settle(captured.id,error);}
    });
  }
  function close(){
    if(closePromise)return closePromise;
    stopPending('mcp-transport-closed');buffer=Buffer.alloc(0);
    if(!child){closed=true;status='closed';return Promise.resolve({closed:true});}
    if(closed)return Promise.resolve({closed:true});
    if(status!=='failed')status='closing';
    closePromise=(async()=>{
      let term,kill,deadline;
      try{
        child.stdin.end();
        term=setTimeout(()=>{if(!closed)child.kill('SIGTERM');},shutdownMs);
        kill=setTimeout(()=>{if(!closed)child.kill('SIGKILL');},shutdownMs*2);
        await Promise.race([exitPromise,new Promise(resolve=>{deadline=setTimeout(resolve,shutdownMs*3);})]);
        return {closed};
      }finally{clearTimeout(term);clearTimeout(kill);clearTimeout(deadline);}
    })();
    return closePromise;
  }
  return Object.freeze({start,send,close,snapshot:()=>Object.freeze({status,closed,pid:child?.pid??null,pending:pending.size,bufferedBytes:buffer.length})});
}
