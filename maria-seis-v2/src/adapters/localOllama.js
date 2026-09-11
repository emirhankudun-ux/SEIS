const trimBase=value=>{
  const url=new URL(value);
  if (!['http:','https:'].includes(url.protocol)) throw new TypeError('baseUrl must be http(s)');
  return url.toString().replace(/\/$/,'');
};
const sessionId=()=>`ollama-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;

function linkedSignal(external,timeoutMs){
  const controller=new AbortController();
  let timedOut=false;
  const abort=()=>controller.abort();
  external?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeoutMs);
  return {signal:controller.signal,timedOut:()=>timedOut,cleanup(){clearTimeout(timer);external?.removeEventListener('abort',abort);}};
}

async function readJson(response,label){
  if (!response?.ok) throw new Error(`${label} request failed`);
  try { return await response.json(); } catch { throw new Error(`${label} response invalid`); }
}

export function createLocalOllamaAdapter({id='local-ollama',baseUrl='http://127.0.0.1:11434',model,fetchImpl=globalThis.fetch,requestTimeoutMs=10000}={}){
  if (typeof fetchImpl!=='function') throw new TypeError('fetch implementation required');
  if (typeof model!=='string' || !model.trim()) throw new TypeError('model required');
  if (!Number.isFinite(requestTimeoutMs) || requestTimeoutMs<10 || requestTimeoutMs>60000) throw new TypeError('invalid request timeout');
  if (typeof id!=='string' || !/^[a-z][a-z0-9-]{0,63}$/.test(id)) throw new TypeError('invalid adapter id');
  const base=trimBase(baseUrl);
  const configuredModel=model.trim();
  const sessions=new Map();

  const request=async(path,options={},externalSignal)=>{
    if (externalSignal?.aborted) throw new Error('request cancelled');
    const linked=linkedSignal(externalSignal,requestTimeoutMs);
    try { return await fetchImpl(`${base}${path}`,{...options,signal:linked.signal}); }
    catch {
      if (externalSignal?.aborted) throw new Error('request cancelled');
      if (linked.timedOut()) throw new Error('request timed out');
      throw new Error('local provider unavailable');
    } finally { linked.cleanup(); }
  };

  const listModels=async signal=>{
    const payload=await readJson(await request('/api/tags',{},signal),'models');
    if (!Array.isArray(payload?.models)) throw new Error('models response invalid');
    return payload.models.flatMap(item=>[item?.name,item?.model]).filter(value=>typeof value==='string' && value.trim());
  };

  return Object.freeze({
    id, apiVersion:'2', capabilities:Object.freeze(['reasoning','coding']),
    async connect({signal}={}){
      const models=await listModels(signal);
      if (!models.includes(configuredModel)) throw new Error('configured model unavailable');
      const activeSessionId=sessionId();
      const state=Object.freeze({sessionId:activeSessionId,model:configuredModel,connectedAt:new Date().toISOString()});
      sessions.set(activeSessionId,state);
      return state;
    },
    async health({session,signal}={}){
      const activeSessionId=session?.sessionId;
      const current=activeSessionId?sessions.get(activeSessionId):null;
      if (!current || current.model!==configuredModel) return {ok:false,reason:'session-unavailable',capabilities:[]};
      const models=await listModels(signal);
      return models.includes(configuredModel)
        ? {ok:true,capabilities:['reasoning','coding'],model:configuredModel}
        : {ok:false,reason:'configured-model-unavailable',capabilities:[]};
    },
    async execute(requestPayload,{capability,sessionId:activeSessionId,signal}={}){
      const session=sessions.get(activeSessionId);
      if (!session) throw new Error('session unavailable');
      if (!['reasoning','coding'].includes(capability)) throw new Error('capability unavailable');
      const command=typeof requestPayload?.command==='string'?requestPayload.command.trim():'';
      if (!command) throw new Error('command required');
      const response=await request('/api/chat',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({model:configuredModel,messages:[{role:'user',content:command}],stream:false,options:{temperature:0.2}})
      },signal);
      const payload=await readJson(response,'chat');
      if (payload?.model!==configuredModel) throw new Error('ollama model mismatch');
      const output=payload?.message?.content;
      const createdAt=payload?.created_at;
      if (payload?.done!==true || typeof output!=='string' || !output.trim() || typeof createdAt!=='string' || !createdAt.trim()) throw new Error('incomplete response');
      return {
        ok:true,
        output:output.trim(),
        providerReceiptId:null,
        model:configuredModel,
        providerId:id,
        runId:requestPayload?.runId??null,
        projectId:requestPayload?.projectId??null,
        intent:requestPayload?.intent??null,
        verificationScope:'model-response-transport',
        usage:{
          promptTokens:Number.isFinite(payload?.prompt_eval_count)?payload.prompt_eval_count:null,
          completionTokens:Number.isFinite(payload?.eval_count)?payload.eval_count:null,
          totalDurationNs:Number.isFinite(payload?.total_duration)?payload.total_duration:null
        },
        transportVerified:true,
        outcomeVerified:false,
        evidence:[
          'transport:ollama-native',
          `model:${configuredModel}`,
          `ollama-created-at:${createdAt.trim()}`,
          'ollama-done:true'
        ]
      };
    },
    async disconnect({sessionId:activeSessionId}={}){
      if (activeSessionId) sessions.delete(activeSessionId);
      return {ok:true};
    }
  });
}
