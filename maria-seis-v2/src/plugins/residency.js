/** Count-based residency policy for trusted host registrations, not an RSS limit. */
export const PLUGIN_RESOURCE_PROFILES=Object.freeze({lite:4,standard:8,workstation:16});

export function createPluginResidency(plugins,{apiVersion,timeoutMs,resourceProfile='standard',maxResidentPlugins}={}) {
  if (typeof resourceProfile!=='string' || !Object.hasOwn(PLUGIN_RESOURCE_PROFILES,resourceProfile))
    throw new TypeError('Invalid plugin resource profile');
  const limit=maxResidentPlugins===undefined?PLUGIN_RESOURCE_PROFILES[resourceProfile]:maxResidentPlugins;
  if (!Number.isSafeInteger(limit) || limit<1) throw new TypeError('Invalid plugin residency limit');
  const resident=entry=>Boolean(entry.instance || entry.initialization || entry.disposal);
  const busy=entry=>Boolean(entry.calls || entry.work || entry.initialization);
  const stats=()=>Object.freeze({
    registered:plugins.size,
    resident:[...plugins.values()].filter(resident).length,
    residentLimit:limit,
    resourceProfile,
    activeExecutions:[...plugins.values()].reduce((sum,entry)=>sum+entry.work,0)
  });
  const get=id=>{
    const entry=plugins.get(id);
    if (!entry) return null;
    const state=entry.disposal?'unloading':entry.initialization?'loading':entry.cleanupFailed?'quarantined'
      :entry.cleanupRequired?'cleanup-required':busy(entry)?'active':entry.instance?'idle':'registered';
    return Object.freeze({id,state,loaded:Boolean(entry.instance),activeCalls:entry.calls,
      activeExecutions:entry.work,unloadSupported:typeof entry.dispose==='function'});
  };
  const unload=async id=>{
    const entry=plugins.get(id);
    if (!entry) return {status:'unavailable',reason:'plugin-not-found'};
    if (entry.disposal) return entry.disposal.result;
    if (busy(entry)) return {status:'unavailable',reason:'plugin-busy'};
    if (!entry.instance) return {status:'ok',unloaded:false};
    // Never guess that dropping a reference closes a plugin's owned resources.
    if (!entry.dispose) return {status:'unavailable',reason:'plugin-unload-unsupported'};
    const operation={controller:new AbortController(),result:null};
    entry.disposal=operation;
    const instance=entry.instance;
    const dispose=entry.dispose;
    const cleanup=Promise.resolve().then(()=>dispose(instance,Object.freeze({
      apiVersion,signal:operation.controller.signal
    }))).then(()=>{
      entry.instance=null;entry.cleanupRequired=false;entry.cleanupFailed=false;
      return {status:'ok',unloaded:true};
    },()=>{
      entry.cleanupFailed=true;
      return {status:'failed',reason:'plugin-unload-failed'};
    }).finally(()=>{
      // A timed-out cleanup retains this slot until its real promise settles.
      if (entry.disposal===operation) entry.disposal=null;
    });
    let timer;
    operation.result=Promise.race([cleanup,new Promise(resolve=>{
      timer=setTimeout(()=>{
        resolve({status:'failed',reason:'plugin-unload-timeout'});
        operation.controller.abort('plugin-unload-timeout');
      },timeoutMs);
    })]).finally(()=>clearTimeout(timer));
    return operation.result;
  };
  return Object.freeze({
    stats,get,unload,
    hasCapacity:()=>stats().resident<limit,
    async unloadIdle() {
      const results=[];
      // Snapshot once; cleanup callbacks cannot extend this sweep indefinitely.
      for (const id of [...plugins.keys()]) {
        const entry=plugins.get(id);
        if (entry.instance && entry.dispose && !busy(entry) && !entry.disposal && !entry.cleanupFailed)
          results.push(Object.freeze({id,...await unload(id)}));
      }
      return Object.freeze(results);
    }
  });
}
