const idPattern=/^[a-z][a-z0-9-]{0,63}$/;

function frozenState(state) {
  return Object.freeze({...state,capabilities:Object.freeze([...(state.capabilities ?? [])])});
}

export function validateHostAdapter(adapter,{apiVersion='2'}={}) {
  const errors=[];
  if (!adapter || typeof adapter!=='object' || Array.isArray(adapter)) return {valid:false,errors:['adapter must be an object']};
  if (typeof adapter.id!=='string' || !idPattern.test(adapter.id)) errors.push('invalid id');
  if (String(adapter.apiVersion ?? '')!==String(apiVersion)) errors.push('incompatible apiVersion');
  if (!Array.isArray(adapter.capabilities) || !adapter.capabilities.length || adapter.capabilities.some(c=>typeof c!=='string'||!idPattern.test(c))) errors.push('invalid capabilities');
  for (const method of ['connect','health','execute','disconnect']) if (typeof adapter[method]!=='function') errors.push(`missing ${method}`);
  return {valid:errors.length===0,errors};
}

export function createHostAdapterManager({apiVersion='2'}={}) {
  const adapters=new Map();
  const states=new Map();
  const read=id=>{
    const state=states.get(id);
    if (!state) throw new Error('unknown adapter');
    return frozenState(state);
  };
  const set=(id,patch)=>{
    const current=states.get(id);
    states.set(id,{...current,...patch,capabilities:[...(patch.capabilities ?? current.capabilities ?? [])]});
    return read(id);
  };
  return Object.freeze({
    register(adapter) {
      const check=validateHostAdapter(adapter,{apiVersion});
      if (!check.valid) throw new TypeError(`Invalid host adapter: ${check.errors.join(', ')}`);
      if (adapters.has(adapter.id)) throw new Error('adapter already registered');
      adapters.set(adapter.id,adapter);
      states.set(adapter.id,{id:adapter.id,status:'unconfigured',healthVerified:false,sessionId:null,capabilities:[],lastError:null});
      return read(adapter.id);
    },
    get(id) { return read(id); },
    async connect(id,context={}) {
      const adapter=adapters.get(id); if (!adapter) throw new Error('unknown adapter');
      set(id,{status:'connecting',healthVerified:false,lastError:null,capabilities:[]});
      try {
        const session=await adapter.connect(context) ?? {};
        const health=await adapter.health({...context,session});
        if (!health?.ok) return set(id,{status:'degraded',healthVerified:false,sessionId:session.sessionId ?? null,lastError:health?.reason ?? 'health-check-failed',capabilities:[]});
        const verifiedCaps=(Array.isArray(health.capabilities)?health.capabilities:adapter.capabilities)
          .filter(cap=>adapter.capabilities.includes(cap));
        return set(id,{status:'ready',healthVerified:true,sessionId:session.sessionId ?? null,lastError:null,capabilities:verifiedCaps});
      } catch {
        return set(id,{status:'failed',healthVerified:false,lastError:'connect-failed',capabilities:[]});
      }
    },
    async execute(id,capability,request,context={}) {
      const adapter=adapters.get(id); if (!adapter) throw new Error('unknown adapter');
      const state=states.get(id);
      if (state.status!=='ready' || state.healthVerified!==true) return {status:'unavailable',reason:'adapter-not-ready'};
      if (!state.capabilities.includes(capability)) return {status:'denied',reason:'capability-not-verified'};
      try {
        const result=await adapter.execute(request,{...context,capability,sessionId:state.sessionId});
        return {status:'ok',result};
      } catch {
        return {status:'failed',reason:'adapter-execution-failed'};
      }
    },
    async disconnect(id,context={}) {
      const adapter=adapters.get(id); if (!adapter) throw new Error('unknown adapter');
      try { await adapter.disconnect({...context,sessionId:states.get(id)?.sessionId ?? null}); } catch {}
      return set(id,{status:'unconfigured',healthVerified:false,sessionId:null,lastError:null,capabilities:[]});
    }
  });
}
