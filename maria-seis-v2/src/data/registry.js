export const projects = [
  { id:'deadly-evil', label:'Deadly Evil', context:'DEADLY EVIL', headline:'Buradayım, Emirhan.', subline:"Ne yapmak istediğini söyle. SEIS doğru modeli, agent'ı ve aracı kendisi seçsin." },
  { id:'seis', label:'SEIS Core', context:'SEIS CORE', headline:'SEIS hazır.', subline:'Model, agent, MCP ve doğrulama katmanları tek merkezden yönetiliyor.' },
  { id:'portfolio', label:'Portfolio', context:'PORTFOLIO', headline:'Creative mode aktif.', subline:'Tasarım, UI/UX ve içerik kararlarını aynı yaratıcı bağlamda tutuyorum.' }
];
export const modes = ['Auto','Game Director','Creative Director','Developer','Research'];
export const capabilities = [
  { id:'plugins', label:'Plugins', status:'ready' },
  { id:'voice', label:'Voice', status:'ready' },
  { id:'vision', label:'Vision', status:'ready' },
  { id:'memory', label:'Memory', status:'ready' },
  { id:'models', label:'Models', status:'ready' },
  { id:'agents', label:'Agents', status:'ready' },
  { id:'mcp', label:'MCP', status:'degraded' },
  { id:'computer', label:'Computer', status:'mock' },
  { id:'automation', label:'Automation', status:'ready' },
  { id:'verify', label:'Verify', status:'ready' }
];
export const agents = [
  { id:'director', code:'GD', label:'Game Director', detail:'Ready', status:'ready' },
  { id:'unreal', code:'UE', label:'Unreal Engineer', detail:'Adapter ready', status:'ready' },
  { id:'ai', code:'AI', label:'Enemy AI', detail:'Verified workflow', status:'ready' },
  { id:'qa', code:'QA', label:'QA Engineer', detail:'Monitoring', status:'ready' },
  { id:'creative', code:'CD', label:'Creative Director', detail:'Standby', status:'idle' },
  { id:'research', code:'RS', label:'Research Agent', detail:'Standby', status:'idle' }
];
export const quickActions = ['Son build durumunu kontrol et','Enemy AI testlerini çalıştır','MCP health kontrol et','Aktif projeyi özetle'];
export const settings = [
  { id:'communityPlugins', label:'Community plugin layer', help:'Allow manifest-validated third-party capability packages.', enabled:true },
  { id:'localFirst', label:'Local-first routing', help:'Sensitive retrieval stays on-device when possible.', enabled:true },
  { id:'wakeWord', label:'Voice wake word', help:'Wake phrase: “Maria”.', enabled:true },
  { id:'ambient', label:'Ambient context', help:'Use active app and project state when authorized.', enabled:false },
  { id:'autoVerify', label:'Automatic verification', help:'Run the verifier after meaningful execution.', enabled:true },
  { id:'safeMode', label:'Safe mode fallback', help:'Degrade to read-only when trust boundaries fail.', enabled:true }
];
