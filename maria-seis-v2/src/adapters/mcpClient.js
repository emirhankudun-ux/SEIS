const idPattern=/^[a-z][a-z0-9-]{0,63}$/;
const MODERN_PROTOCOL='2026-07-28';
const LEGACY_PROTOCOLS=Object.freeze(['2025-11-25','2025-06-18']);
const CLIENT_INFO=Object.freeze({name:'MARIA-SEIS',version:'4'});

function assertSignal(signal){
  if(signal?.aborted) throw new Error('aborted');
}

function cloneMeta(protocolVersion){
  return {
    'io.modelcontextprotocol/protocolVersion':protocolVersion,
    'io.modelcontextprotocol/clientInfo':{...CLIENT_INFO},
    'io.modelcontextprotocol/clientCapabilities':{}
  };
}

function isMethodNotFound(error){
  return error?.code===-32601 || /method not found/i.test(String(error?.message ?? ''));
}

function validToolResult(result){
  return !!result && typeof result==='object' && Array.isArray(result.content);
}

export function createMcpAdapter({providerId='mcp',transport,authToken=null,protocolVersion=null}={}) {
  if(typeof providerId!=='string'||!idPattern.test(providerId)) throw new TypeError('invalid provider id');
  if(typeof transport!=='function') throw new TypeError('transport required');
  if(protocolVersion!==null && protocolVersion!==MODERN_PROTOCOL && !LEGACY_PROTOCOLS.includes(protocolVersion)) {
    throw new TypeError('unsupported protocol version');
  }

  let initialized=false;
  let discovered=[];
  let negotiatedProtocol=null;
  let mode=null;
  let serverCapabilities={};
  let requestSequence=0;

  const headers=()=>authToken ? {authorization:`Bearer ${authToken}`} : {};
  const nextId=()=>`mcp-${Date.now()}-${++requestSequence}`;

  const rawRequest=async(method,params={},signal,{modernVersion=null}={})=>{
    assertSignal(signal);
    const requestParams=modernVersion
      ? {...params,_meta:{...(params?._meta ?? {}),...cloneMeta(modernVersion)}}
      : params;
    return transport({jsonrpc:'2.0',id:nextId(),method,params:requestParams,headers:headers(),signal});
  };

  const notify=async(method,params={},signal)=>{
    assertSignal(signal);
    return transport({jsonrpc:'2.0',method,params,headers:headers(),signal});
  };

  const request=async(method,params={},signal)=>{
    if(!initialized) throw new Error('not-initialized');
    return rawRequest(method,params,signal,{modernVersion:mode==='modern'?negotiatedProtocol:null});
  };

  const connectLegacy=async(version,signal,{strict=false}={})=>{
    const result=await rawRequest('initialize',{
      protocolVersion:version,
      capabilities:{},
      clientInfo:{...CLIENT_INFO}
    },signal);
    if(!result || typeof result!=='object' || typeof result.protocolVersion!=='string') {
      throw new Error('mcp-initialize-failed');
    }
    if(strict && result.protocolVersion!==version) throw new Error('unsupported-protocol-version');
    if(!LEGACY_PROTOCOLS.includes(result.protocolVersion)) throw new Error('unsupported-protocol-version');
    negotiatedProtocol=result.protocolVersion;
    serverCapabilities=result.capabilities && typeof result.capabilities==='object' ? result.capabilities : {};
    await notify('notifications/initialized',{},signal);
    mode='legacy';
    initialized=true;
    return {sessionId:`mcp-session-${Date.now()}`,protocolVersion:negotiatedProtocol,mode};
  };

  const connectModern=async(signal)=>{
    const result=await rawRequest('server/discover',{},signal,{modernVersion:MODERN_PROTOCOL});
    if(!result || typeof result!=='object' || !Array.isArray(result.supportedVersions)) {
      throw new Error('mcp-discovery-failed');
    }
    if(!result.supportedVersions.includes(MODERN_PROTOCOL)) throw new Error('unsupported-protocol-version');
    negotiatedProtocol=MODERN_PROTOCOL;
    serverCapabilities=result.capabilities && typeof result.capabilities==='object' ? result.capabilities : {};
    mode='modern';
    initialized=true;
    return {sessionId:null,protocolVersion:negotiatedProtocol,mode};
  };

  return Object.freeze({
    id:providerId,
    apiVersion:'2',
    capabilities:Object.freeze(['tool-call']),
    tools(){ return [...discovered]; },
    protocolVersion(){ return negotiatedProtocol; },
    mode(){ return mode; },
    async connect({signal}={}) {
      initialized=false;
      discovered=[];
      negotiatedProtocol=null;
      mode=null;
      serverCapabilities={};

      if(protocolVersion===MODERN_PROTOCOL) return connectModern(signal);
      if(protocolVersion && LEGACY_PROTOCOLS.includes(protocolVersion)) {
        return connectLegacy(protocolVersion,signal,{strict:true});
      }

      try {
        const discovery=await rawRequest('server/discover',{},signal,{modernVersion:MODERN_PROTOCOL});
        if(discovery && typeof discovery==='object' && Array.isArray(discovery.supportedVersions)) {
          if(discovery.supportedVersions.includes(MODERN_PROTOCOL)) {
            negotiatedProtocol=MODERN_PROTOCOL;
            serverCapabilities=discovery.capabilities && typeof discovery.capabilities==='object' ? discovery.capabilities : {};
            mode='modern';
            initialized=true;
            return {sessionId:null,protocolVersion:negotiatedProtocol,mode};
          }
          const legacy=LEGACY_PROTOCOLS.find(version=>discovery.supportedVersions.includes(version));
          if(legacy) return connectLegacy(legacy,signal,{strict:true});
        }
        throw new Error('unsupported-protocol-version');
      } catch(error) {
        if(!isMethodNotFound(error)) throw error;
        return connectLegacy(LEGACY_PROTOCOLS[0],signal,{strict:false});
      }
    },
    async health({signal}={}) {
      if(!initialized) return {ok:false,reason:'not-initialized',capabilities:[]};
      const listed=await request('tools/list',{},signal);
      if(!listed || typeof listed!=='object' || !Array.isArray(listed.tools)) {
        discovered=[];
        return {ok:false,reason:'invalid-tools-list',capabilities:[],protocolVersion:negotiatedProtocol};
      }
      discovered=[...new Set(listed.tools
        .map(tool=>tool?.name)
        .filter(name=>typeof name==='string'&&name.length>0&&name.length<=128))];
      return {
        ok:true,
        capabilities:['tool-call'],
        toolCount:discovered.length,
        protocolVersion:negotiatedProtocol,
        serverAdvertisedTools:!!serverCapabilities?.tools
      };
    },
    async execute(payload={},context={}) {
      if(context.capability!=='tool-call') throw new Error('capability-not-supported');
      if(!initialized) throw new Error('not-initialized');
      const tool=payload.tool;
      if(typeof tool!=='string'||!discovered.includes(tool)) throw new Error('tool-not-discovered');
      const result=await request('tools/call',{name:tool,arguments:payload.arguments ?? {}},context.signal);
      const valid=validToolResult(result);
      const ok=valid && result.isError!==true;
      return {
        ok,
        providerId,
        protocolVersion:negotiatedProtocol,
        tool,
        runId:payload.runId ?? null,
        projectId:payload.projectId ?? null,
        intent:payload.intent ?? null,
        result:valid ? result : null,
        outcomeVerified:ok,
        evidence:[`mcp-tool:${tool}`,`mcp-protocol:${negotiatedProtocol ?? 'unknown'}`,`mcp-result:${ok?'ok':'error'}`]
      };
    },
    async disconnect() {
      initialized=false;
      discovered=[];
      negotiatedProtocol=null;
      mode=null;
      serverCapabilities={};
      return {ok:true};
    }
  });
}
