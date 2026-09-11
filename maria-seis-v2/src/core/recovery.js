const TERMINAL_STATUSES=new Set(['simulated','verified','unverified','blocked','approval','unavailable','timed-out','cancelled','error','invalid']);

function freeze(value){
  if (value && typeof value==='object' && !Object.isFrozen(value)) { Object.freeze(value); for (const child of Object.values(value)) freeze(child); }
  return value;
}

export function findInterruptedRuns(entries=[]) {
  if (!Array.isArray(entries)) throw new TypeError('journal entries must be an array');
  const latest=new Map();
  for (const entry of entries) {
    if (!entry || typeof entry!=='object' || typeof entry.runId!=='string' || !entry.runId) continue;
    const status=typeof entry.status==='string' ? entry.status : '';
    if (status==='running' || TERMINAL_STATUSES.has(status)) latest.set(entry.runId,entry);
  }
  const candidates=[];
  for (const [runId,entry] of latest) {
    if (entry.status!=='running') continue;
    candidates.push(freeze({
      runId,
      executionMode:entry.executionMode ?? 'unknown',
      provider:entry.provider ?? null,
      startedAt:entry.timestamp ?? null,
      reason:'interrupted-before-terminal',
      resumeAllowed:false
    }));
  }
  return freeze(candidates);
}
