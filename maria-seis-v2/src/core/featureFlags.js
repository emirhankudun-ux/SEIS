export const featureFlags = Object.freeze({
  voice:true, vision:true, memory:true, modelRouter:true, agentRouter:true,
  mcpGateway:true, computerControl:false, automation:true, verification:true,
  providerMarketplace:true, developerMode:true
});
export function isFeatureEnabled(id){ return featureFlags[id] === true; }
