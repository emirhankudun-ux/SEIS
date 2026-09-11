/** Catalog entries are not connections. No external service is provisioned by this app. */
const catalog = [
  { id:'simulation', label:'Yerel simülatör', kind:'simulation', status:'available', implemented:true, connected:true, healthVerified:true, capabilities:['simulation'], auth:'none', priority:0 },
  { id:'openai', label:'OpenAI', kind:'cloud-model', capabilities:['reasoning','coding','vision','tools'], auth:'server-side', priority:80 },
  { id:'local', label:'Local Models', kind:'local-model', capabilities:['private-routing','coding','reasoning'], auth:'local', priority:95 },
  { id:'mcp', label:'MCP Gateway', kind:'tool-gateway', capabilities:['tools','capability-discovery','health'], auth:'per-server', priority:90 },
  { id:'unreal', label:'Unreal Engine', kind:'app-adapter', capabilities:['game-dev','build','editor'], auth:'local-permission', priority:90 },
  { id:'blender', label:'Blender', kind:'app-adapter', capabilities:['3d','scene','export'], auth:'local-permission', priority:85 },
  { id:'macos', label:'macOS Control', kind:'os-adapter', status:'disabled', capabilities:['computer-control'], auth:'accessibility', priority:75 }
];
export const providers = Object.freeze(catalog.map(provider => Object.freeze({
  status:'unconfigured', implemented:false, connected:false, healthVerified:false,
  ...provider, capabilities:Object.freeze([...provider.capabilities])
})));
