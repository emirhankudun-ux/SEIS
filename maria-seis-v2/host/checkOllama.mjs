/**
 * Real native-Ollama acceptance check.
 * Requires an operator-provided exact model id through MARIA_OLLAMA_MODEL.
 * This proves native HTTP transport/attribution only; it does not prove semantic correctness.
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createLocalOllamaAdapter } from '../src/adapters/localOllama.js';
import { createHostAdapterManager } from '../src/adapters/hostAdapter.js';
import { LiveRuntimeAdapter } from '../src/adapters/liveRuntime.js';
import { createOrchestrator } from '../src/core/orchestrator.js';
import { createExecutionJournal } from '../src/core/executionJournal.js';

const model=(process.env.MARIA_OLLAMA_MODEL??'').trim();
const baseUrl=(process.env.MARIA_OLLAMA_BASE_URL??'http://127.0.0.1:11434').trim();

export async function runOllamaCheck(){
  if(!model) return {
    status:'unavailable',scope:'ollama-native-model-transport',reason:'MARIA_OLLAMA_MODEL is required',
    verifiedTransport:false,verifiedExternalAction:false
  };

  const journal=createExecutionJournal({limit:20});
  const manager=createHostAdapterManager();
  let connected=false;
  try{
    const adapter=createLocalOllamaAdapter({id:'local',baseUrl,model,requestTimeoutMs:15000});
    manager.register(adapter);
    const state=await manager.connect('local');
    if(state.status!=='ready'||state.healthVerified!==true) throw new Error(state.lastError||'ollama-connect-failed');
    connected=true;

    const runtime=new LiveRuntimeAdapter({manager,intentCapabilities:{general:'reasoning'}});
    const providerRegistry=[{
      id:'local',label:'Native Ollama',kind:'local-model',status:'available',implemented:true,
      connected:true,healthVerified:true,capabilities:['reasoning','coding'],priority:100
    }];
    const run=createOrchestrator({runtime,providerRegistry,journal,timeoutMs:20000});
    const result=await run(
      'Reply with a short readiness acknowledgement for this transport acceptance check.',
      'seis',{},
      {executionMode:'live',localFirst:true,safeMode:true}
    );
    if(result.status!=='verified' || result.verification?.verifiedTransport!==true || result.verification?.verifiedExternalAction!==false || result.verification?.scope!=='model-response-transport') {
      throw new Error('ollama-transport-verification-failed');
    }
    const terminal=journal.list().find(entry=>entry.runId===result.plan.runId);
    if(!terminal || terminal.verifiedExternalAction!==false) throw new Error('ollama-audit-verification-failed');

    return {
      status:'verified',scope:'ollama-native-model-transport',baseUrl,model,
      verification:{
        verifiedTransport:true,verifiedExternalAction:false,scope:result.verification.scope,
        providerId:result.result?.providerId??null,runId:result.result?.runId??null,
        providerReceiptId:result.result?.providerReceiptId??null,evidence:result.verification.evidence
      },
      audit:{terminalStatus:terminal.status,verifiedExternalAction:terminal.verifiedExternalAction},
      note:'A native Ollama model response crossed the governed live transport path. This does not verify semantic correctness or any external side effect.'
    };
  }catch(error){
    return {status:'unverified',scope:'ollama-native-model-transport',baseUrl,model,reason:'ollama-check-failed',detail:error instanceof Error?error.message:'unknown',verifiedTransport:false,verifiedExternalAction:false};
  }finally{
    if(connected) await manager.disconnect('local');
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.length>2){console.error('No CLI arguments accepted. Configure through MARIA_OLLAMA_MODEL and MARIA_OLLAMA_BASE_URL.');process.exitCode=2;}
  else{const report=await runOllamaCheck();console.log(JSON.stringify(report,null,2));process.exitCode=report.status==='verified'?0:1;}
}
