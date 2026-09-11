const idPattern=/^[a-z][a-z0-9-]{0,63}$/;

function assertSignal(signal){
  if(signal?.aborted) throw new Error('aborted');
}

export function createMcpAdapter({providerId='mcp',transport,authToken=null,protocolVersion='2025-06-18'}={}) {
  if(typeof providerId!=='string'||!idPattern.test(providerId)) throw new TypeError('invalid provider id');
  if(typeof transport!=='function') throw new TypeError('transport required');
  let initialized=false;
  let discovered=[];
  const headers=()=>authToken ? {authorization:`Bearer ${authToken}`} : {};
  const request=async(method,params={},signal)=>{
    assertSignal(signal);
    return transport({jsonrpc:'2.0',id:`mcp-${Date.now()}-${Math.random().toString(16).slice(2)}`,method,params,headers:headers(),signal});
  };
  return Object.freeze({
    id:providerId,
    apiVersion:'2',
    capabilities:Object.freeze(['tool-call']),
    tools(){ return [...discovered]; },
    async connect({signal}={}) {
      const result=await request('initialize',{protocolVersion,capabilities:{},clientInfo:{name:'MARIA-SEIS',version:'4'}},signal);
      if(!result || typeof result!=='object') throw new Error('mcp-initialize-failed');
      initialized=true;
      return {sessionId:`mcp-session-${Date.now()}`};
    },
    async health({signal}={}) {
      if(!initialized) return {ok:false,reason:'not-initialized',capabilities:[]};
      const listed=await request('tools/list',{},signal);
      const tools=Array.isArray(listed?.tools)?listed.tools:[];
      discovered=[...new Set(tools.map(t=>t?.name).filter(name=>typeof name==='string'&&name.length>0))];
      return {ok:true,capabilities:['tool-call'],toolCount:discovered.length};
    },
    async execute(payload={},context={}) {
      if(context.capability!=='tool-call') throw new Error('capability-not-supported');
      if(!initialized) throw new Error('not-initialized');
      const tool=payload.tool;
      if(typeof tool!=='string'||!discovered.includes(tool)) throw new Error('tool-not-discovered');
      const result=await request('tools/call',{name:tool,arguments:payload.arguments ?? {}},context.signal);
      const ok=result?.isError!==true;
      return {
        ok,
        providerId,
        tool,
        runId:payload.runId ?? null,
        projectId:payload.projectId ?? null,
        intent:payload.intent ?? null,
        result,
        outcomeVerified:ok,
        evidence:[`mcp-tool:${tool}`,`mcp-result:${ok?'ok':'error'}`]
      };
    },
    async disconnect() {
      initialized=false; discovered=[];
      return {ok:true};
    }
  });
}
