import { createProviderLifecycle } from './providerLifecycle.js';

const clone=value=>structuredClone(value);
const normalizeStatus=definition => definition?.status==='disabled' ? 'disabled'
  : definition?.status==='available' && definition?.implemented===true && definition?.connected===true && definition?.healthVerified===true ? 'ready'
  : 'unconfigured';

export function createProviderSupervisor({definitions=[],probeTimeoutMs=3000,healthTtlMs=30000,clock=Date.now}={}) {
  if (!Array.isArray(definitions)) throw new TypeError('Provider definitions must be an array');
  if (!Number.isFinite(probeTimeoutMs)||probeTimeoutMs<1||probeTimeoutMs>30000) throw new TypeError('Invalid provider probe timeout');
  if (!Number.isFinite(healthTtlMs)||healthTtlMs<1||healthTtlMs>3600000) throw new TypeError('Invalid provider health TTL');
  if (typeof clock!=='function') throw new TypeError('Provider clock must be callable');

  const source=new Map();
  for (const item of definitions) {
    if (!item || typeof item.id!=='string' || !item.id || source.has(item.id)) throw new TypeError('Invalid provider definition');
    source.set(item.id,clone(item));
  }
  const life=createProviderLifecycle([...source.values()].map(item=>({
    ...clone(item), status:normalizeStatus(item),
    healthVerified:item.healthVerified===true && normalizeStatus(item)==='ready'
  })));
  const adapters=new Map();
  const runtime=new Map([...source.keys()].map(id=>[id,{lastHealthAt:null,connected:source.get(id).connected===true,implemented:source.get(id).implemented===true}]));
  const inFlight=new Map();

  const requireDefinition=id=>{
    const definition=source.get(id);
    if (!definition) throw new Error(`Unknown provider: ${id}`);
    return definition;
  };
  const failHealth=(id,reason)=>{
    const current=life.get(id);
    if (current.status==='unconfigured' || current.status==='failed' || current.status==='disabled') {
      if (current.status!=='failed') life.transition(id,'connecting');
    }
    life.markHealth(id,{ok:false,reason});
    const meta=runtime.get(id); meta.connected=false; meta.lastHealthAt=null;
  };

  async function runProbe(id,{signal}={}) {
    const definition=requireDefinition(id);
    const adapter=adapters.get(id);
    if (!adapter) return {status:'unavailable',reason:'adapter-not-registered'};
    if (signal?.aborted) return {status:'cancelled',reason:'probe-cancelled'};

    const before=life.get(id);
    if (before.status!=='ready') life.transition(id,'connecting');
    const controller=new AbortController();
    let timedOut=false;
    let cancelled=false;
    const forwardAbort=()=>{cancelled=true;controller.abort();};
    signal?.addEventListener('abort',forwardAbort,{once:true});
    let timer;
    const timeout=new Promise((_,reject)=>{
      timer=setTimeout(()=>{timedOut=true;controller.abort();reject(new Error('probe-stopped'));},probeTimeoutMs);
    });
    const cancellation=new Promise((_,reject)=>{
      controller.signal.addEventListener('abort',()=>reject(new Error('probe-stopped')),{once:true});
    });
    try {
      const result=await Promise.race([
        Promise.resolve().then(()=>adapter.probe({signal:controller.signal,provider:Object.freeze(clone(definition))})),
        timeout,cancellation
      ]);
      if (controller.signal.aborted) throw new Error('probe-stopped');
      if (!result || result.ok!==true || !Array.isArray(result.capabilities)) {
        failHealth(id,'probe-unhealthy');
        return {status:'failed',reason:'probe-unhealthy'};
      }
      const capabilities=[...new Set(result.capabilities)];
      if (capabilities.some(capability=>typeof capability!=='string' || !definition.capabilities?.includes(capability))) {
        failHealth(id,'undeclared-capability');
        return {status:'failed',reason:'undeclared-capability'};
      }
      const current=life.get(id);
      if (current.status==='connecting') life.transition(id,'ready',{healthVerified:true,capabilities});
      else life.markHealth(id,{ok:true,capabilities});
      const meta=runtime.get(id); meta.connected=true; meta.implemented=true; meta.lastHealthAt=clock();
      return {status:'ready',provider:routingRecord(id)};
    } catch {
      const reason=timedOut ? 'probe-timeout' : cancelled || signal?.aborted ? 'probe-cancelled' : 'probe-failed';
      failHealth(id,reason);
      return {status:reason==='probe-cancelled'?'cancelled':'failed',reason};
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort',forwardAbort);
    }
  }

  function routingRecord(id) {
    const definition=requireDefinition(id);
    const current=life.get(id);
    const meta=runtime.get(id);
    const age=meta.lastHealthAt===null ? Infinity : Math.max(0,clock()-meta.lastHealthAt);
    const fresh=current.status==='ready' && current.healthVerified===true && meta.connected===true && age<=healthTtlMs;
    return clone({
      ...definition,
      implemented:fresh ? meta.implemented===true : definition.kind==='simulation' && definition.implemented===true,
      connected:fresh ? true : definition.kind==='simulation' && definition.connected===true,
      healthVerified:fresh ? true : definition.kind==='simulation' && definition.healthVerified===true,
      status:fresh || definition.kind==='simulation' && definition.status==='available' ? 'available' : current.status==='disabled' ? 'disabled' : current.status==='ready' ? 'degraded' : current.status,
      capabilities:fresh ? current.capabilities : definition.kind==='simulation' ? [...(definition.capabilities ?? [])] : [...(current.capabilities ?? [])],
      lastHealthAt:meta.lastHealthAt
    });
  }

  return Object.freeze({
    registerAdapter(id,adapter,{replace=false}={}) {
      requireDefinition(id);
      if (!adapter || typeof adapter.probe!=='function') throw new TypeError('Provider adapter must expose probe()');
      if (adapters.has(id) && !replace) throw new Error(`Provider adapter already registered: ${id}`);
      if (inFlight.has(id)) throw new Error(`Provider probe in progress: ${id}`);
      adapters.set(id,adapter);
    },
    unregisterAdapter(id) {
      requireDefinition(id);
      if (inFlight.has(id)) throw new Error(`Provider probe in progress: ${id}`);
      adapters.delete(id);
      const meta=runtime.get(id); meta.connected=false; meta.implemented=false; meta.lastHealthAt=null;
      const current=life.get(id);
      if (current.status==='ready') life.transition(id,'disabled');
    },
    probe(id,options={}) {
      requireDefinition(id);
      if (inFlight.has(id)) return inFlight.get(id);
      const task=runProbe(id,options);
      const tracked=task.finally(()=>{if(inFlight.get(id)===tracked)inFlight.delete(id);});
      inFlight.set(id,tracked);
      return tracked;
    },
    get(id) { return routingRecord(id); },
    routingSnapshot() { return [...source.keys()].map(routingRecord); }
  });
}
