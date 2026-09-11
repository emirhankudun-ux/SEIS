export const projects = [
  {id:'deadly-evil',label:'Deadly Evil',context:'DEADLY EVIL',headline:'Buradayım, Emirhan.',subline:'İş akışını birlikte inceleyelim. Bu sürüm simülasyon modunda; harici uygulamalara bağlı değil.'},
  {id:'seis',label:'SEIS Core',context:'SEIS CORE',headline:'Birlikte geliştirelim.',subline:'Yönlendirme ve izin akışını simüle et. Gerçek model, araç ve dosya işlemleri bağlı değil.'},
  {id:'portfolio',label:'Portfolio',context:'PORTFOLIO',headline:'Yaratıcılığa alan aç.',subline:'Tasarım iş akışını incele. Bu demo portfolyo dosyalarını okumaz veya değiştirmez.'}
];
export const modes = ['Auto','Game Director','Creative Director','Developer','Research'];
export const capabilities = [
  {id:'plugins',label:'Plugins',status:'schema-only'},
  {id:'voice',label:'Voice',status:'unconfigured'},
  {id:'vision',label:'Vision',status:'unconfigured'},
  {id:'memory',label:'Memory',status:'session-only'},
  {id:'models',label:'Models',status:'unconfigured'},
  {id:'agents',label:'Agents',status:'role-catalog'},
  {id:'mcp',label:'MCP',status:'unconfigured'},
  {id:'computer',label:'Computer',status:'disabled'},
  {id:'automation',label:'Automation',status:'unconfigured'},
  {id:'verify',label:'Verify',status:'simulation'}
];
export const agents = [
  {id:'director',code:'GD',label:'Game Director'}, {id:'unreal',code:'UE',label:'Unreal Engineer'},
  {id:'ai',code:'AI',label:'Enemy AI'}, {id:'qa',code:'QA',label:'QA Engineer'},
  {id:'creative',code:'CD',label:'Creative Director'}, {id:'research',code:'RS',label:'Research Agent'}
].map(agent => ({...agent,detail:'Rol tanımı · çalışan agent değil',status:'idle'}));
export const quickActions = ['Son build durumunu kontrol et','Enemy AI testlerini çalıştır','MCP health kontrol et','Aktif projeyi özetle'];
export const settings = [
  {id:'localFirst',label:'Local-first routing',help:'Rota tercihi. Bu sürümde yalnızca simülatör çalışır.',enabled:true,editable:true},
  {id:'wakeWord',label:'Voice wake word',help:'Bağlı ses adaptörü yok; mikrofon kaydı yapılmaz.',enabled:false,editable:false},
  {id:'ambient',label:'Ambient context',help:'Ekran veya uygulama gözlemi bağlı değil.',enabled:false,editable:false},
  {id:'communityPlugins',label:'Community plugins',help:'Şema doğrulayıcı mevcut. Eklenti yükleme ve çalıştırma yok.',enabled:false,editable:false},
  {id:'autoVerify',label:'Simulation contract checks',help:'Yalnızca simülasyon yanıtı kontrol edilir; kapatılamaz.',enabled:true,editable:false},
  {id:'safeMode',label:'Read-only demo boundary',help:'Harici işlem ve dosya yazımı bu sürümde kapalıdır.',enabled:true,editable:false}
];
