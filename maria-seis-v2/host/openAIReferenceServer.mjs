/** Loopback-only OpenAI-compatible reference transport. This is not an AI model. */
import http from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const MODEL='maria-reference-model';
const MAX_BODY=65536;
const json=(response,status,payload)=>{
  const body=JSON.stringify(payload);
  response.writeHead(status,{'content-type':'application/json; charset=utf-8','content-length':Buffer.byteLength(body)});
  response.end(body);
};

function readBody(request){
  return new Promise((resolve,reject)=>{
    let size=0;const chunks=[];
    request.on('data',chunk=>{size+=chunk.length;if(size>MAX_BODY){reject(new Error('body-too-large'));request.destroy();return;}chunks.push(chunk);});
    request.on('end',()=>resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error',reject);
  });
}

function promptFrom(payload){
  if(!payload || typeof payload!=='object' || Array.isArray(payload) || payload.model!==MODEL || !Array.isArray(payload.messages)) return null;
  const user=payload.messages.findLast(message=>message?.role==='user');
  return typeof user?.content==='string' && user.content.trim() ? user.content.trim() : null;
}

export function createReferenceServer(){
  return http.createServer(async(request,response)=>{
    try{
      if(request.method==='GET' && request.url==='/v1/models') return json(response,200,{object:'list',data:[{id:MODEL,object:'model',owned_by:'maria-reference'}]});
      if(request.method==='POST' && request.url==='/v1/chat/completions'){
        const raw=await readBody(request);let payload;try{payload=JSON.parse(raw);}catch{return json(response,400,{error:{message:'invalid-json'}});}
        const prompt=promptFrom(payload);if(!prompt)return json(response,400,{error:{message:'invalid-request'}});
        if(prompt.includes('DELAY_CANCEL')) await new Promise(resolve=>setTimeout(resolve,2000));
        if(response.destroyed || response.writableEnded) return;
        const digest=createHash('sha256').update(prompt).digest('hex').slice(0,16);
        return json(response,200,{id:`chatcmpl-ref-${randomUUID()}`,object:'chat.completion',model:MODEL,
          choices:[{index:0,message:{role:'assistant',content:`REFERENCE_TRANSPORT_OK:${digest}`},finish_reason:'stop'}],
          usage:{prompt_tokens:1,completion_tokens:1,total_tokens:2}});
      }
      return json(response,404,{error:{message:'not-found'}});
    }catch{if(!response.headersSent)json(response,500,{error:{message:'reference-server-error'}});else response.destroy();}
  });
}

export async function runReferenceServer(){
  const server=createReferenceServer();
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const address=server.address();
  if(!address || typeof address==='string') throw new Error('reference-bind-failed');
  return {server,port:address.port,model:MODEL};
}

if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  if(process.argv.length>2){console.error('No CLI arguments accepted.');process.exitCode=2;}
  else{
    const {server,port,model}=await runReferenceServer();
    process.stdout.write(`${JSON.stringify({type:'ready',port,model})}\n`);
    const close=()=>server.close(()=>process.exit(0));
    process.once('SIGINT',close);process.once('SIGTERM',close);
  }
}
