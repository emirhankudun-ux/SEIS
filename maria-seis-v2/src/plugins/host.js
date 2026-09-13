import { validatePluginManifest } from './sdk.js';
import { createPluginResidency } from './residency.js';
const PERMISSION=/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)*$/;
export function validatePluginManifestV2(manifest,{apiVersion='2'}={}) {
  const base=validatePluginManifest(manifest);
  const errors=[...base.errors];
  if (manifest?.apiVersion !== apiVersion) errors.push('incompatible apiVersion');
  if (!Array.isArray(manifest?.permissions) || manifest.permissions.length > 32 || manifest.permissions.some(p=>typeof p!=='string'||!PERMISSION.test(p)) || new Set(manifest.permissions).size!==manifest.permissions.length) errors.push('invalid permissions');
  return {valid:errors.length===0,errors};
}
export function createPluginHost({apiVersion='2',timeoutMs=3000,resourceProfile='standard',maxResidentPlugins}={}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw new TypeError('Invalid plugin timeout');
  const plugins=new Map();
  const residency=createPluginResidency(plugins,{apiVersion,timeoutMs,resourceProfile,maxResidentPlugins});
  const startInitialization=entry=>{
    const pending={controller:new AbortController(),waiters:0,settled:false,task:null};
    entry.initialization=pending;
    const factoryContext=Object.freeze({permissions:Object.freeze([...entry.manifest.permissions]),
      apiVersion,signal:pending.controller.signal});
    pending.task=Promise.resolve().then(()=>{
      pending.controller.signal.throwIfAborted();
      return entry.factory(factoryContext);
    }).then(instance=>{
      // A factory that ignored cancellation must not publish a late instance.
      if (!pending.controller.signal.aborted) entry.instance=instance;
      else if (entry.dispose && instance) {
        // Managed late instances cannot execute, but still need their owner cleanup.
        entry.instance=instance;entry.cleanupRequired=true;
      } else {
        // Without an enforceable cleanup path, retrying can duplicate detached side effects.
        entry.cleanupFailed=true;
      }
      return instance;
    }).finally(()=>{
      pending.settled=true;
      if (entry.initialization===pending) entry.initialization=null;
    });
    return pending;
  };
  return Object.freeze({
    register(manifest,factory,{dispose}={}) {
      const checked=validatePluginManifestV2(manifest,{apiVersion});
      if (!checked.valid) throw new TypeError(`Invalid MARIA plugin v2: ${checked.errors.join(', ')}`);
      if (typeof factory!=='function') throw new TypeError('Plugin factory must be callable');
      if (dispose!==undefined && typeof dispose!=='function') throw new TypeError('Plugin disposer must be callable');
      if (plugins.has(manifest.id)) throw new Error(`Plugin already registered: ${manifest.id}`);
      plugins.set(manifest.id,{manifest:structuredClone(manifest),factory,dispose,instance:null,initialization:null,
        calls:0,work:0,disposal:null,cleanupRequired:false,cleanupFailed:false});
    },
    list() { return [...plugins.values()].map(({manifest})=>structuredClone(manifest)); },
    getResidency:residency.get,
    residencyStats:residency.stats,
    unload:residency.unload,
    unloadIdle:residency.unloadIdle,
    async invoke(id,capability,input,context={}) {
      const entry=plugins.get(id);
      if (!entry) return {status:'unavailable',reason:'plugin-not-found'};
      if (!entry.manifest.capabilities.includes(capability)) return {status:'denied',reason:'capability-not-declared'};
      const granted=new Set(Array.isArray(context?.grantedPermissions) ? context.grantedPermissions : []);
      if (entry.manifest.permissions.some(permission=>!granted.has(permission))) return {status:'denied',reason:'permission-not-granted'};
      const externalSignal=context?.signal;
      if (externalSignal !== undefined && (!externalSignal || typeof externalSignal.aborted!=='boolean' || typeof externalSignal.addEventListener!=='function' || typeof externalSignal.removeEventListener!=='function')) {
        return {status:'failed',reason:'invalid-cancellation-signal'};
      }
      if (externalSignal?.aborted) return {status:'cancelled',reason:'plugin-cancelled'};
      if (entry.disposal) return {status:'unavailable',reason:'plugin-unloading'};
      if (entry.cleanupFailed) return {status:'unavailable',reason:'plugin-quarantined'};
      if (entry.cleanupRequired) return {status:'unavailable',reason:'plugin-cleanup-required'};
      const controller=new AbortController();
      let timer,initialization;
      let rejectInterruption;
      const interruption=new Promise((_,reject)=>{ rejectInterruption=reject; });
      // Registration can invoke cancellation synchronously, before a race exists.
      interruption.catch(()=>{});
      const releaseInitialization=()=>{
        if (!initialization) return;
        const pending=initialization;initialization=null;
        pending.waiters-=1;
        if (!pending.settled && pending.waiters===0) pending.controller.abort('plugin-initialization-abandoned');
      };
      const interrupt=reason=>{
        if (controller.signal.aborted) return;
        rejectInterruption(new Error(reason));
        controller.abort(reason);
        releaseInitialization();
      };
      const cancel=()=>interrupt('plugin-cancelled');
      const check=()=>{
        if (externalSignal?.aborted && !controller.signal.aborted) cancel();
        controller.signal.throwIfAborted();
      };
      entry.calls+=1;
      try {
        externalSignal?.addEventListener('abort',cancel,{once:true});
        check();
        timer=setTimeout(()=>interrupt('plugin-timeout'),timeoutMs);
        if (!entry.instance) {
          // Keep abandoned factories registered until their actual promise settles.
          // A new invocation cannot overlap this still-pending factory call.
          if (entry.initialization?.controller.signal.aborted)
            return {status:'unavailable',reason:'plugin-initialization-pending'};
          if (!entry.initialization && !residency.hasCapacity())
            return {status:'unavailable',reason:'plugin-residency-limit'};
          initialization=entry.initialization ?? startInitialization(entry);
          initialization.waiters+=1;
          await Promise.race([initialization.task,interruption]);
          releaseInitialization();
          check();
        }
        const fn=entry.instance?.[capability];
        if (typeof fn!=='function') return {status:'unavailable',reason:'capability-not-implemented'};
        const invokeContext=Object.freeze({...context,grantedPermissions:Object.freeze([...granted]),signal:controller.signal});
        // Caller cancellation is not proof the plugin's asynchronous work stopped.
        entry.work+=1;
        const execution=Promise.resolve().then(()=>{check();return fn(structuredClone(input),invokeContext);})
          .finally(()=>{entry.work-=1;});
        const value=await Promise.race([execution,interruption]);
        check();
        return {status:'ok',value};
      } catch {
        if (controller.signal.reason==='plugin-cancelled') return {status:'cancelled',reason:'plugin-cancelled'};
        return {status:'failed',reason:controller.signal.reason==='plugin-timeout'?'plugin-timeout':'plugin-crashed'};
      } finally {
        entry.calls-=1;
        if (timer) clearTimeout(timer);
        releaseInitialization();
        try { externalSignal?.removeEventListener('abort',cancel); } catch {}
      }
    }
  });
}
