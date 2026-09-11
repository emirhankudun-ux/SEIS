export const truthPriority = Object.freeze([
  'current-user-instruction','verified-runtime-state','canonical-governance',
  'approved-project-decision','project-memory','conversation-history','model-inference'
]);
export function resolveTruth(candidates = []) {
  const rank = new Map(truthPriority.map((key,index)=>[key,index]));
  return [...candidates].filter(item=>rank.has(item.source)).sort((a,b)=>rank.get(a.source)-rank.get(b.source)||Number(b.verified)-Number(a.verified))[0] ?? null;
}
