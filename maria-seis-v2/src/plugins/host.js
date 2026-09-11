import { validatePluginManifest } from './sdk.js';
const PERMISSION=/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)*$/;
export function validatePluginManifestV2(manifest,{apiVersion='2'}={}) {
  const base=validatePluginManifest(manifest);
  const errors=[...base.errors];
  if (manifest?.apiVersion !== apiVersion) errors.push('incompatible apiVersion');
  if (!Array.isArray(manifest?.permissions) || manifest.permissions.length > 32 || manifest.permissions.some(p=>typeof p!=='string'||!PERMISSION.test(p)) || new Set(manifest.permissions).size!==manifest.permissions.length) errors.push('invalid permissions');
  return {valid:errors.length===0,errors};
}
export function createPluginHost({apiVersion='2',timeoutMs=3000}={}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw new TypeError('Invalid plugin timeout');
  const plugins=new Map();
  return Object.freeze({
    register(manifest,factory) {
      const checked=validatePluginManifestV2(manifest,{apiVersion});
      if (!checked.valid) throw new TypeError(`Invalid MARIA plugin v2: ${checked.errors.join(', ')}`);
      if (typeof factory!=='function') throw new TypeError('Plugin factory must be callable');
      if (plugins.has(manifest.id)) throw new Error(`Plugin already registered: ${manifest.id}`);
      plugins.set(manifest.id,{manifest:structuredClone(manifest),factory,instance:null});
    },
    list() { return [...plugins.values()].map(({manifest})=>structuredClone(manifest)); },
    async invoke(id,capability,input,context={}) {
      const entry=plugins.get(id);
      if (!entry) return {status:'unavailable',reason:'plugin-not-found'};
      if (!entry.manifest.capabilities.includes(capability)) return {status:'denied',reason:'capability-not-declared'};
      const granted=new Set(Array.isArray(context?.grantedPermissions) ? context.grantedPermissions : []);
      if (entry.manifest.permissions.some(permission=>!granted.has(permission))) return {status:'denied',reason:'permission-not-granted'};
      let timer;
      try {
        entry.instance ??= await entry.factory(Object.freeze({permissions:Object.freeze([...entry.manifest.permissions]),apiVersion}));
        const fn=entry.instance?.[capability];
        if (typeof fn!=='function') return {status:'unavailable',reason:'capability-not-implemented'};
        const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('plugin-timeout')),timeoutMs);});
        const value=await Promise.race([Promise.resolve().then(()=>fn(structuredClone(input),Object.freeze({...context}))),timeout]);
        return {status:'ok',value};
      } catch (error) {
        return {status:'failed',reason:error?.message==='plugin-timeout'?'plugin-timeout':'plugin-crashed'};
      } finally { if (timer) clearTimeout(timer); }
    }
  });
}
