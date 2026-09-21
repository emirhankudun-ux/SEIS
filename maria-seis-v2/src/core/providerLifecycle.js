const TRANSITIONS = Object.freeze({
  unconfigured:new Set(['connecting','disabled']),
  connecting:new Set(['ready','failed','disabled']),
  ready:new Set(['degraded','failed','disabled']),
  degraded:new Set(['connecting','ready','failed','disabled']),
  failed:new Set(['connecting','disabled']),
  disabled:new Set(['connecting'])
});
const clone = value => structuredClone(value);
export function createProviderLifecycle(initial=[]) {
  const records = new Map(initial.map(item => [item.id,{healthVerified:false,capabilities:[],lastError:null,...clone(item)}]));
  const requireProvider = id => { if (!records.has(id)) throw new Error(`Unknown provider: ${id}`); return records.get(id); };
  return Object.freeze({
    get(id) { return clone(requireProvider(id)); },
    list() { return [...records.values()].map(clone); },
    transition(id,next,metadata={}) {
      const current = requireProvider(id);
      if (!TRANSITIONS[current.status]?.has(next)) throw new Error(`Invalid provider transition: ${current.status} -> ${next}`);
      const updated = {...current,...clone(metadata),status:next};
      if (next !== 'ready') updated.healthVerified = false;
      if (Array.isArray(updated.capabilities)) updated.capabilities = [...new Set(updated.capabilities)];
      records.set(id,updated);
      return clone(updated);
    },
    markHealth(id,{ok,reason=null,capabilities}={}) {
      const current = requireProvider(id);
      const updated = {...current};
      if (ok === true) {
        updated.healthVerified = true;
        updated.lastError = null;
        if (updated.status === 'degraded' || updated.status === 'connecting') updated.status = 'ready';
        if (Array.isArray(capabilities)) updated.capabilities = [...new Set(capabilities)];
      } else {
        updated.healthVerified = false;
        updated.lastError = typeof reason === 'string' && reason ? reason.slice(0,240) : 'health-check-failed';
        if (updated.status === 'ready') updated.status = 'degraded';
        else if (updated.status === 'connecting') updated.status = 'failed';
      }
      records.set(id,updated);
      return clone(updated);
    }
  });
}
