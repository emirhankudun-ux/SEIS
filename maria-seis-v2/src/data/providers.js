export const providers = [
  { id:'openai', label:'OpenAI', kind:'cloud-model', status:'available', capabilities:['reasoning','coding','vision','tools'], auth:'connector-or-key', priority:80 },
  { id:'local', label:'Local Models', kind:'local-model', status:'available', capabilities:['private-routing','coding','reasoning'], auth:'local', priority:95 },
  { id:'mcp', label:'MCP Gateway', kind:'tool-gateway', status:'degraded', capabilities:['tools','capability-discovery','health'], auth:'per-server', priority:90 },
  { id:'unreal', label:'Unreal Engine', kind:'app-adapter', status:'adapter-ready', capabilities:['game-dev','build','editor'], auth:'local-permission', priority:90 },
  { id:'blender', label:'Blender', kind:'app-adapter', status:'adapter-ready', capabilities:['3d','scene','export'], auth:'local-permission', priority:85 },
  { id:'macos', label:'macOS Control', kind:'os-adapter', status:'disabled', capabilities:['computer-control'], auth:'accessibility', priority:75 }
];
