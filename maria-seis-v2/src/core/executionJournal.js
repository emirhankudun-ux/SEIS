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

function validateLimit(limit) {
  if (!Number.isInteger(limit)||limit<1||limit>1000) throw new TypeError('Invalid journal limit');
}

function prepareRecord(record,clock,{preserveTimestamp=false}={}) {
  if (!record || typeof record!=='object' || Array.isArray(record) || typeof record.runId!=='string' || !record.runId) throw new TypeError('Invalid journal record');
  const timestamp=preserveTimestamp ? record.timestamp : clock().toISOString();
  if (typeof timestamp!=='string' || Number.isNaN(Date.parse(timestamp))) throw new TypeError('Invalid journal timestamp');
  return deepFreeze(redact({...structuredClone(record),timestamp}));
}

function replaceEntries(target,next) {
  target.splice(0,target.length,...next);
}

function lifecycleApi({entries,limit,clock,persist}) {
  const commit=next=>{ persist?.(next); replaceEntries(entries,next); };
  const bounded=next=>next.length>limit ? next.slice(next.length-limit) : next;
  const add=record=>{
    const safe=prepareRecord(record,clock);
    commit(bounded([...entries,safe]));
    return safe;
  };
  return Object.freeze({
    append:add,
    begin(record) {
      return add({...record,status:'running',verifiedExternalAction:false});
    },
    complete(record) {
      const safe=prepareRecord(record,clock);
      const index=entries.findLastIndex(entry=>entry.runId===safe.runId && entry.status==='running');
      const next=[...entries];
      if (index>=0) next[index]=safe; else next.push(safe);
      commit(bounded(next));
      return safe;
    },
    list() { return entries.map(entry=>deepFreeze(structuredClone(entry))); },
    clear() { commit([]); }
  });
}

export function createExecutionJournal({limit=100,clock=()=>new Date()}={}) {
  validateLimit(limit);
  if (typeof clock!=='function') throw new TypeError('Invalid journal clock');
  return lifecycleApi({entries:[],limit,clock,persist:null});
}

export function createPersistentExecutionJournal({storage,limit=200,clock=()=>new Date()}={}) {
  validateLimit(limit);
  if (!storage || typeof storage.read!=='function' || typeof storage.write!=='function') throw new TypeError('Journal storage adapter required');
  if (typeof clock!=='function') throw new TypeError('Invalid journal clock');
  let parsed=[];
  try {
    const raw=storage.read();
    if (raw!==null && raw!==undefined && raw!=='') {
      const value=JSON.parse(raw);
      if (!Array.isArray(value)) throw new Error('not-array');
      parsed=value.map(record=>prepareRecord(record,clock,{preserveTimestamp:true}));
    }
  } catch { throw new Error('journal-storage-corrupt'); }
  const entries=parsed.length>limit ? parsed.slice(parsed.length-limit) : parsed;
  const persist=next=>{
    try { storage.write(JSON.stringify(next)); }
    catch { throw new Error('journal-persist-failed'); }
  };
  return lifecycleApi({entries,limit,clock,persist});
}

export const executionJournal = createExecutionJournal({limit:200});
