const trimBase=value=>{
  const url=new URL(value);
  if (!['http:','https:'].includes(url.protocol)) throw new TypeError('baseUrl must be http(s)');
  return url.toString().replace(/\/$/,'');
};
const sessionId=()=>`local-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;

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

export function createLocalOpenAICompatibleAdapter({id='local-openai-compatible',baseUrl='http://127.0.0.1:1234',model,fetchImpl=globalThis.fetch,requestTimeoutMs=10000}={}){
  if (typeof fetchImpl!=='function') throw new TypeError('fetch implementation required');
  if (typeof model!=='string' || !model.trim()) throw new TypeError('model required');
  if (!Number.isFinite(requestTimeoutMs) || requestTimeoutMs<10 || requestTimeoutMs>60000) throw new TypeError('invalid request timeout');
  if (typeof id!=='string' || !/^[a-z][a-z0-9-]{0,63}$/.test(id)) throw new TypeError('invalid adapter id');
  const base=trimBase(baseUrl);
  const configuredModel=model.trim();
  const sessions=new Map();

  const request=async(path,options={},externalSignal)=>{
    const linked=linkedSignal(externalSignal,requestTimeoutMs);
    try { return await fetchImpl(`${base}${path}`,{...options,signal:linked.signal}); }
    catch {
      if (externalSignal?.aborted) throw new Error('request cancelled');
      if (linked.timedOut()) throw new Error('request timed out');
      throw new Error('local provider unavailable');
    } finally { linked.cleanup(); }
  };

  return Object.freeze({
    id, apiVersion:'2', capabilities:Object.freeze(['reasoning','coding']),
    async connect({signal}={}){
      const payload=await readJson(await request('/v1/models',{},signal),'models');
      const models=Array.isArray(payload?.data)?payload.data.map(item=>item?.id).filter(id=>typeof id==='string'):[];
      if (!models.includes(configuredModel)) throw new Error('configured model unavailable');
      const id=sessionId();
      const state=Object.freeze({sessionId:id,model:configuredModel,connectedAt:new Date().toISOString()});
      sessions.set(id,state);
      return state;
    },
    async health({session}={}){
      const id=session?.sessionId;
      const current=id?sessions.get(id):null;
      return current && current.model===configuredModel
        ? {ok:true,capabilities:['reasoning','coding'],model:configuredModel}
        : {ok:false,reason:'session-unavailable',capabilities:[]};
    },
    async execute(requestPayload,{capability,sessionId:activeSessionId,signal}={}){
      const session=sessions.get(activeSessionId);
      if (!session) throw new Error('session unavailable');
      if (!['reasoning','coding'].includes(capability)) throw new Error('capability unavailable');
      const command=typeof requestPayload?.command==='string'?requestPayload.command.trim():'';
      if (!command) throw new Error('command required');
      const response=await request('/v1/chat/completions',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({model:configuredModel,messages:[{role:'user',content:command}],temperature:0.2,stream:false})
      },signal);
      const payload=await readJson(response,'completion');
      const output=payload?.choices?.[0]?.message?.content;
      const receiptId=payload?.id;
      if (typeof output!=='string' || !output.trim() || typeof receiptId!=='string' || !receiptId.trim()) throw new Error('invalid completion response');
      if (payload?.model!==configuredModel) throw new Error('completion model mismatch');
      return {
        ok:true,output:output.trim(),providerReceiptId:receiptId,model:payload?.model||configuredModel,
        providerId:id,runId:requestPayload?.runId??null,projectId:requestPayload?.projectId??null,intent:requestPayload?.intent??null,
        verificationScope:'model-response-transport',
        usage:payload?.usage??null,transportVerified:true,outcomeVerified:false,
        evidence:[`transport:openai-compatible`,`model:${configuredModel}`,`provider-receipt:${receiptId}`]
      };
    },
    async disconnect({sessionId:activeSessionId}={}){
      if (activeSessionId) sessions.delete(activeSessionId);
      return {ok:true};
    }
  });
}
