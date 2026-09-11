const SECRET_KEY=/(token|secret|password|api[-_]?key|authorization|credential)/i;
function redact(value,key='') {
  if (SECRET_KEY.test(key)) return '[REDACTED]';
  if (Array.isArray(value)) return value.map(v=>redact(v));
  if (value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,redact(v,k)]));
  return value;
}
function deepFreeze(value) {
  if (value && typeof value==='object' && !Object.isFrozen(value)) { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); }
  return value;
}
export function createExecutionJournal({limit=100}={}) {
  if (!Number.isInteger(limit)||limit<1||limit>1000) throw new TypeError('Invalid journal limit');
  const entries=[];
  return Object.freeze({
    append(record) {
      if (!record || typeof record!=='object' || typeof record.runId!=='string' || !record.runId) throw new TypeError('Invalid journal record');
      const safe=deepFreeze(redact({...structuredClone(record),timestamp:new Date().toISOString()}));
      entries.push(safe); if (entries.length>limit) entries.splice(0,entries.length-limit);
      return safe;
    },
    list() { return entries.map(entry=>deepFreeze(structuredClone(entry))); },
    clear() { entries.length=0; }
  });
}

export const executionJournal = createExecutionJournal({limit:200});
