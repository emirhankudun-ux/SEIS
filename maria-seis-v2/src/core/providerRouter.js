import { providers } from '../data/providers.js';
const intentNeeds = Object.freeze({
  build:['game-dev','build'], 'enemy-ai':['reasoning'], 'mcp-health':['health'],
  'creative-review':['vision','reasoning'], general:['reasoning']
});
/** Select only verified connections; suggestions must never masquerade as executions. */
export function selectProviders(plan, policy = {}, registry = providers) {
  const mode = policy?.executionMode ?? 'simulation';
  if (!plan || !Array.isArray(registry)) return [];
  const ready = registry.filter(p => p?.status === 'available' && p.implemented === true
    && p.connected === true && p.healthVerified === true && Array.isArray(p.capabilities));
  if (mode === 'simulation') return ready.filter(p => p.kind === 'simulation').slice(0,1);
  if (mode !== 'live' || !Object.hasOwn(intentNeeds, plan.intent)) return [];
  const needs = intentNeeds[plan.intent];
  return ready.filter(p => p.kind !== 'simulation')
    .filter(p => p.kind !== 'cloud-model' || policy.allowCloud === true)
    .filter(p => needs.every(capability => p.capabilities.includes(capability)))
    .sort((a,b) => {
      const score = p => (Number.isFinite(p.priority) ? p.priority : 0)
        + (policy.localFirst !== false && p.kind === 'local-model' ? 25 : 0);
      return score(b) - score(a) || String(a.id).localeCompare(String(b.id));
    }).slice(0,1);
}
