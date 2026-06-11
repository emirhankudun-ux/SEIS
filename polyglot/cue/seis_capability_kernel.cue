package seis

#CapabilityDomain: {
  id: string & != ""
  label: string & != ""
  lane: string & != ""
  purpose: string & != ""
  agentRole: string & != ""
  algorithms: [...string] & [_, _, ...]
  foundations: [...string] & [_, _, ...]
  artifacts: [...string] & [_, _, ...]
  mcpHooks: [...string] & [_, ...]
  skillHooks: [...string] & [_, ...]
  pluginHooks: [...string] & [_, _, ...]
  qualityGates: [...string] & [_, _, _, _, ...]
  starterSurfaces: [...string] & [_, ...]
  flow: [...string] & [_, _, _, _, _, _, ...]
}

#CapabilityKernel: {
  version: 1
  id: "seis-universal-capability-kernel"
  mode: "ai_agent_mcp_skill_plugin_llm_capability_coverage"
  summary: {
    domainCount: int & >=38
    laneCount: int & >=14
    pluginGroupCount: int & >=5
    pluginInventoryCount: int & >=120
    coveredPluginCount: int & >=60
  }
  domains: [...#CapabilityDomain]
}
