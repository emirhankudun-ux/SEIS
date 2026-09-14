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
  const lifecycles=new Map();
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
      lifecycles.set(adapter.id,{generation:0,connecting:null,disconnecting:null,controller:null,owned:false});
      states.set(adapter.id,{id:adapter.id,status:'unconfigured',healthVerified:false,sessionId:null,capabilities:[],lastError:null});
      return read(adapter.id);
    },
    get(id) { return read(id); },
    async connect(id,context={}) {
      const adapter=adapters.get(id); if (!adapter) throw new Error('unknown adapter');
      const life=lifecycles.get(id);
      // Never silently share a handshake that may carry another caller's context.
      if (life.connecting || life.disconnecting) throw new Error('adapter lifecycle busy');
      if (life.owned) throw new Error('adapter session requires disconnect');
      const generation=++life.generation;
      const controller=new AbortController();
      let finish;
      const operation={finished:new Promise(resolve=>{finish=resolve;})};
      life.connecting=operation;life.controller=controller;
      set(id,{status:'connecting',healthVerified:false,sessionId:null,lastError:null,capabilities:[]});
      let signal;
      const cancel=()=>controller.abort();
      const revoked=()=>generation!==life.generation;
      try {
        const connectContext={...context};
        signal=connectContext.signal;
        if (signal!=null) {
          if (typeof signal.aborted!=='boolean' || typeof signal.addEventListener!=='function'
            || typeof signal.removeEventListener!=='function') throw new TypeError('invalid abort signal');
          signal.addEventListener('abort',cancel,{once:true});
          if (signal.aborted) cancel();
        }
        controller.signal.throwIfAborted();
        const session=await adapter.connect({...connectContext,signal:controller.signal}) ?? {};
        // Retain even a late/stateless session until its explicit owner teardown.
        life.owned=true;
        set(id,{sessionId:session.sessionId ?? null});
        if (revoked()) return read(id);
        controller.signal.throwIfAborted();
        const health=await adapter.health({...connectContext,session,signal:controller.signal});
        if (revoked()) return read(id);
        controller.signal.throwIfAborted();
        if (health?.ok!==true) return set(id,{status:'degraded',healthVerified:false,lastError:health?.reason ?? 'health-check-failed',capabilities:[]});
        const verifiedCaps=(Array.isArray(health.capabilities)?health.capabilities:adapter.capabilities)
          .filter(cap=>adapter.capabilities.includes(cap));
        return set(id,{status:'ready',healthVerified:true,lastError:null,capabilities:verifiedCaps});
      } catch {
        if (revoked()) return read(id);
        return set(id,{status:'failed',healthVerified:false,lastError:controller.signal.aborted?'connect-cancelled':'connect-failed',capabilities:[]});
      } finally {
        try { signal?.removeEventListener('abort',cancel); } catch {}
        if (life.connecting===operation) life.connecting=null;
        finish();
      }
    },
    async execute(id,capability,request,context={}) {
      const adapter=adapters.get(id); if (!adapter) throw new Error('unknown adapter');
      const state=states.get(id);
      if (state.status!=='ready' || state.healthVerified!==true) return {status:'unavailable',reason:'adapter-not-ready'};
      if (!state.capabilities.includes(capability)) return {status:'denied',reason:'capability-not-verified'};
      const generation=lifecycles.get(id).generation;
      const ended=()=>generation!==lifecycles.get(id).generation || states.get(id).status!=='ready';
      try {
        const result=await adapter.execute(request,{...context,capability,sessionId:state.sessionId});
        if (ended()) return {status:'unavailable',reason:'adapter-session-ended'};
        return {status:'ok',result};
      } catch {
        if (ended()) return {status:'unavailable',reason:'adapter-session-ended'};
        return {status:'failed',reason:'adapter-execution-failed'};
      }
    },
    async disconnect(id,context={}) {
      const adapter=adapters.get(id); if (!adapter) throw new Error('unknown adapter');
      const life=lifecycles.get(id);
      if (life.disconnecting) return life.disconnecting;
      const connecting=life.connecting;
      ++life.generation;
      // Revoke before invoking user cleanup or signalling a pending handshake.
      set(id,{status:'disconnecting',healthVerified:false,lastError:null,capabilities:[]});
      life.owned=true;
      const task=Promise.resolve().then(async()=>{
        // Some adapters disconnect globally. Never overlap their old cleanup
        // with a replacement handshake, even when the old one ignores abort.
        if (connecting) await connecting.finished;
        try {
          await adapter.disconnect({...context,sessionId:states.get(id).sessionId});
          life.owned=false;life.controller=null;
          return set(id,{status:'unconfigured',healthVerified:false,sessionId:null,lastError:null,capabilities:[]});
        } catch {
          return set(id,{status:'failed',healthVerified:false,lastError:'disconnect-failed',capabilities:[]});
        }
      }).finally(()=>{if (life.disconnecting===task) life.disconnecting=null;});
      life.disconnecting=task;
      life.controller?.abort();
      return task;
    }
  });
}
