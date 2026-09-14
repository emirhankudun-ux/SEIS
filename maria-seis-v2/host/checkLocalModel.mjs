/** Real loopback transport acceptance check. The child is a protocol reference server, not an AI model. */
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createLocalOpenAICompatibleAdapter } from '../src/adapters/localOpenAICompatible.js';
import { createHostAdapterManager } from '../src/adapters/hostAdapter.js';
import { LiveRuntimeAdapter } from '../src/adapters/liveRuntime.js';
import { createOrchestrator } from '../src/core/orchestrator.js';
import { createExecutionJournal } from '../src/core/executionJournal.js';

const home=dirname(fileURLToPath(import.meta.url));
const root=resolve(home,'..');

function minimalEnv(){return process.platform==='win32'?{SystemRoot:process.env.SystemRoot,ComSpec:process.env.ComSpec}:{};}

function startReferenceServer(){
  const child=spawn(process.execPath,[join(home,'openAIReferenceServer.mjs')],{cwd:root,shell:false,env:minimalEnv(),stdio:['ignore','pipe','pipe']});
  child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
  let stdout='',stderr='';
  const ready=new Promise((resolveReady,reject)=>{
    const timer=setTimeout(()=>reject(new Error('reference-ready-timeout')),3000);
    const fail=error=>{clearTimeout(timer);reject(error instanceof Error?error:new Error('reference-start-failed'));};
    child.once('error',fail);child.once('exit',code=>{if(code!==null)fail(new Error(`reference-exited-${code}`));});
    child.stderr.on('data',chunk=>{if(stderr.length<8192)stderr+=chunk;});
    child.stdout.on('data',chunk=>{
      if(stdout.length>8192)return fail(new Error('reference-ready-overflow'));
      stdout+=chunk;const newline=stdout.indexOf('\n');if(newline<0)return;
      clearTimeout(timer);
      try{
        const message=JSON.parse(stdout.slice(0,newline));
        if(message?.type!=='ready'||!Number.isInteger(message.port)||message.port<1||message.port>65535||typeof message.model!=='string') throw new Error('invalid-ready');
        resolveReady(message);
      }catch{reject(new Error('invalid-reference-ready'));}
    });
  });
  let closePromise;
  const close=()=>{
    if(closePromise)return closePromise;
    if(child.exitCode!==null || child.signalCode!==null)
      return Promise.resolve({closed:true,code:child.exitCode,signal:child.signalCode});
    closePromise=new Promise(resolveClose=>{
      let forceTimer,exitTimer,settled=false;
      const finish=result=>{
        if(settled)return;
        settled=true;
        clearTimeout(forceTimer);clearTimeout(exitTimer);
        child.removeListener('exit',onExit);child.removeListener('error',onError);
        resolveClose(result);
      };
      const onExit=(code,signal)=>finish({closed:true,code,signal});
      const onError=()=>finish({closed:false});
      // Observe before sending any signal; kill() returning true is not exit proof.
      child.once('exit',onExit);child.on('error',onError);
      forceTimer=setTimeout(()=>{
        if(child.exitCode!==null || child.signalCode!==null){onExit(child.exitCode,child.signalCode);return;}
        // Keep the original TERM grace; allow a separate bounded exit observation
        // after KILL. A child that still has not exited must remain unclosed.
        exitTimer=setTimeout(()=>finish({closed:false}),1500);
        try{child.kill('SIGKILL');}catch{finish({closed:false});}
      },1500);
      try{child.kill('SIGTERM');}catch{finish({closed:false});}
    });
    return closePromise;
  };
  return {child,ready,close,getStderr:()=>stderr};
}

export async function runLocalModelCheck(){
  let processHandle,manager;
  const journal=createExecutionJournal({limit:20});
  let report={status:'failed',scope:'local-model-transport',transport:'http-loopback',cancellation:'unverified',cleanup:{closed:false}};
  try{
    processHandle=startReferenceServer();
    const ready=await processHandle.ready;
    const adapter=createLocalOpenAICompatibleAdapter({id:'local',baseUrl:`http://127.0.0.1:${ready.port}`,model:ready.model,requestTimeoutMs:3000});
    manager=createHostAdapterManager();manager.register(adapter);
    const state=await manager.connect('local');
    if(state.status!=='ready'||!state.healthVerified)throw new Error('local-reference-connect-failed');
    const runtime=new LiveRuntimeAdapter({manager,intentCapabilities:{general:'reasoning'}});
    const providerRegistry=[{id:'local',label:'Local Reference Transport',kind:'local-model',status:'available',implemented:true,connected:true,healthVerified:true,capabilities:['reasoning'],priority:100}];
    const run=createOrchestrator({runtime,providerRegistry,journal,timeoutMs:3000});
    const normal=await run('Verify the local model transport contract','seis',{}, {executionMode:'live',localFirst:true,safeMode:true});
    if(normal.status!=='verified'||normal.verification?.verifiedTransport!==true||normal.verification?.verifiedExternalAction!==false
      ||normal.verification?.scope!=='model-response-transport'||!String(normal.result?.output??'').startsWith('REFERENCE_TRANSPORT_OK:')) throw new Error('local-reference-verification-failed');
    const terminal=journal.list().find(entry=>entry.runId===normal.plan.runId);
    if(!terminal||terminal.verifiedExternalAction!==false)throw new Error('local-reference-audit-failed');

    const controller=new AbortController();
    const pending=run('DELAY_CANCEL local transport cancellation','seis',{}, {executionMode:'live',localFirst:true,safeMode:true},{signal:controller.signal});
    setTimeout(()=>controller.abort(),50);
    const cancelled=await pending;
    if(cancelled.status!=='cancelled')throw new Error('local-reference-cancellation-failed');

    report={status:'verified',scope:'local-model-transport',transport:'http-loopback',server:'maria-openai-reference',model:ready.model,
      verification:{verified:true,verifiedTransport:true,verifiedExternalAction:false,scope:normal.verification.scope,
        providerId:normal.result.providerId,runId:normal.result.runId,providerReceiptId:normal.result.providerReceiptId,evidence:normal.verification.evidence},
      cancellation:'verified',audit:{terminalStatus:terminal.status,verifiedExternalAction:terminal.verifiedExternalAction},cleanup:{closed:false},
      note:'Reference server validates real HTTP/OpenAI-compatible transport only; it is not an AI model and does not prove semantic inference quality.'};
  }catch(error){report.reason='local-model-check-failed';report.detail=error instanceof Error?error.message:'unknown';if(processHandle?.getStderr())report.stderr=processHandle.getStderr().slice(0,512);}
  finally{
    if(manager)await manager.disconnect('local');
    if(processHandle)report.cleanup=await processHandle.close();else report.cleanup={closed:true};
    if(!report.cleanup.closed && report.status==='verified')report.status='unverified';
  }
  return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.length>2){console.error('No CLI arguments accepted.');process.exitCode=2;}
  else{const result=await runLocalModelCheck();console.log(JSON.stringify(result,null,2));process.exitCode=result.status==='verified'?0:1;}
}
