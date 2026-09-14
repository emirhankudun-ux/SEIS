/** Implemented product behavior only; a registry entry does not enable a feature. */
export const featureFlags = Object.freeze({
  voice:false, vision:false, memory:false, modelRouter:false, agentRouter:false,
  mcpGateway:false, computerControl:false, automation:false, verification:false,
  providerMarketplace:false, simulation:true, simulationContractChecks:true,
  pluginManifestValidation:true, sessionState:true
});
export function isFeatureEnabled(id) { return featureFlags[id] === true; }
