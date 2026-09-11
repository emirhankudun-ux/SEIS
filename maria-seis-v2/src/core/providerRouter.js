import { providers } from '../data/providers.js';
const intentNeeds = {
  build:['game-dev','build'],
  'enemy-ai':['reasoning','game-dev'],
  'mcp-health':['health'],
  'creative-review':['vision','reasoning'],
  general:['reasoning']
};
export function selectProviders(plan, policy={localFirst:true}) {
  const needs = intentNeeds[plan.intent] ?? intentNeeds.general;
  const usable = providers.filter(p => !['disabled'].includes(p.status));
  const scored = usable.map(provider => {
    const coverage = needs.filter(n => provider.capabilities.includes(n)).length;
    const locality = policy.localFirst && provider.kind === 'local-model' ? 25 : 0;
    const degraded = provider.status === 'degraded' ? -20 : 0;
    return { ...provider, score: provider.priority + coverage*30 + locality + degraded };
  }).sort((a,b)=>b.score-a.score);
  const selected = scored.filter(p => needs.some(n => p.capabilities.includes(n))).slice(0,2);
  return selected.length ? selected : scored.slice(0,1);
}
