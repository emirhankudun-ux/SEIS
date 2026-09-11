export const truthPriority = Object.freeze([
  'current-user-instruction','verified-runtime-state','canonical-governance',
  'approved-project-decision','project-memory','conversation-history','model-inference'
]);
/** Resolve facts separately from desired instructions. Equal-rank conflicts stay unresolved. */
export function resolveTruth(candidates = [], { domain = 'fact' } = {}) {
  if (!Array.isArray(candidates)) throw new TypeError('candidates must be an array');
  if (!['fact','instruction'].includes(domain)) throw new TypeError('Unknown truth domain');
  const rank = new Map(truthPriority.map((source,index) => [source,index]));
  const usable = candidates.filter(item => item && rank.has(item.source))
    .filter(item => domain === 'instruction' || item.source !== 'current-user-instruction')
    .filter(item => item.source !== 'verified-runtime-state' || item.verified === true)
    .sort((a,b) => rank.get(a.source) - rank.get(b.source));
  if (!usable.length) return null;
  const top = usable.filter(item => item.source === usable[0].source);
  // Conservative equality: ambiguous structured values are kept as a conflict.
  const sameValue = top.every(item => Object.is(item.value, top[0].value));
  if (!sameValue) return { status:'conflict', source:top[0].source, candidates:structuredClone(top) };
  return structuredClone(top[0]);
}
