import { store } from './core/store.js';
import { runCommand } from './core/orchestrator.js';
import { projects, modes, capabilities, agents, quickActions, settings } from './data/registry.js';
import { providers } from './data/providers.js';
import { createSafePreferences } from './core/persistence.js';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const projectById = id => projects.find(project => project.id === id) ?? projects[0];
let controller = null;
let allAgents = false;
let previousFocus = null;

let preferences = null;
try {
  preferences = createSafePreferences(window.localStorage);
  const saved = preferences.load();
  const current = store.get();
  const projectId = projects.some(project => project.id === saved.projectId) ? saved.projectId : current.projectId;
  const mode = modes.includes(saved.mode) ? saved.mode : current.mode;
  store.set({projectId,mode,settings:{...current.settings,
    ...(typeof saved.localFirst === 'boolean' ? {localFirst:saved.localFirst} : {}),
    ...(typeof saved.allowCloud === 'boolean' ? {allowCloud:saved.allowCloud} : {})}});
} catch { preferences = null; }
function persistPreferences(state) {
  if (!preferences) return;
  try { preferences.save({projectId:state.projectId,mode:state.mode,localFirst:state.settings.localFirst,allowCloud:state.settings.allowCloud}); } catch {}
}

function renderAgents() {
  $('#agentList').innerHTML = (allAgents ? agents : agents.slice(0,4)).map(agent =>
    `<div class="agent-row"><span class="agent-code">${agent.code}</span><div><strong>${agent.label}</strong><small>${agent.detail}</small></div><i class="agent-state idle" aria-hidden="true"></i></div>`).join('');
  $('#expandAgents').textContent = allAgents ? 'Daha az' : 'Tüm roller';
  $('#expandAgents').setAttribute('aria-expanded',String(allAgents));
}
function renderStatic() {
  $('#systemList').innerHTML = capabilities.slice(0,5).map(c => `<button class="nav-row" data-cap="${c.id}"><span>${c.label}</span><b class="status ${c.status}">${c.status}</b></button>`).join('');
  $('#projectList').innerHTML = projects.map((p,i) => `<button class="nav-row project-nav" data-project="${p.id}"><span><small>${String(i+1).padStart(2,'0')}</small>${p.label}</span><b aria-hidden="true">›</b></button>`).join('');
  $('#modeList').innerHTML = modes.map(mode => `<button class="mode-row" data-mode="${mode}">${mode}</button>`).join('');
  $('#quickActions').innerHTML = quickActions.map(command => `<button data-command="${command}">${command}</button>`).join('');
  $('#capabilityGrid').innerHTML = capabilities.map(c => `<div class="capability" title="${c.status}"><span>${c.label}</span><small>${c.status}</small></div>`).join('');
  $('#projectMenu').innerHTML = projects.map(p => `<button data-project="${p.id}">${p.label}</button>`).join('');
  $('#settingsList').innerHTML = settings.map(s => `<div class="setting-row"><div><strong id="setting-${s.id}">${s.label}</strong><span>${s.help}</span></div><button class="toggle" data-setting="${s.id}" role="switch" aria-labelledby="setting-${s.id}" ${s.editable ? '' : 'disabled'}><i></i></button></div>`).join('');
  $('#providerList').innerHTML = providers.map(p => `<div class="provider-row"><div><strong>${p.label}</strong><span>${p.kind} · ${p.capabilities.slice(0,3).join(' / ')}</span></div><b class="provider-status ${p.kind === 'simulation' ? 'simulation' : p.status}">${p.kind === 'simulation' ? 'SIMULATION' : p.status}</b></div>`).join('');
  $('#healthScore').textContent = `${providers.filter(p => p.kind !== 'simulation' && p.connected && p.healthVerified).length} bağlı`;
  renderAgents();
}
function render(state) {
  const project = projectById(state.projectId);
  $('#projectLabel').textContent = project.label; $('#contextText').textContent = project.context;
  $('#headline').textContent = state.message?.headline ?? project.headline;
  $('#assistantText').textContent = state.message?.body ?? project.subline;
  $('#stateText').textContent = state.systemState;
  $('#orb').className = `orb state-${state.systemState.toLowerCase().replace(/[^a-z-]/g,'-')}`;
  $('#mainPanel').setAttribute('aria-busy',String(state.busy));
  $$('.project-nav').forEach(button => button.classList.toggle('active',button.dataset.project === state.projectId));
  $$('.mode-row').forEach(button => { button.classList.toggle('active',button.dataset.mode === state.mode); button.setAttribute('aria-pressed',String(button.dataset.mode === state.mode)); });
  $$('[data-project], [data-mode], [data-command], #projectSwitch, #orb, #micBtn, #visionBtn, #brandButton').forEach(button => {button.disabled=state.busy;});
  $('#commandInput').disabled = state.busy;
  $('#sendBtn').textContent = state.busy ? '■' : '→';
  $('#sendBtn').setAttribute('aria-label',state.busy ? 'Durdur' : 'Gönder');
  const activity = state.activity;
  $('#activityAgent').textContent = activity.agent; $('#activityTitle').textContent = activity.title;
  $('#activityBody').textContent = activity.body; $('#progressBar').style.width = `${activity.progress}%`;
  $('#activityResult').textContent = activity.result; $('#resultDot').className = activity.tone;
  $('#footerState').textContent = 'Demo · harici bağlantı yok';
  $('#routeText').textContent = state.settings.localFirst ? 'Rota tercihi: local-first · yürütücü: simülatör' : 'Rota tercihi: esnek · yürütücü: simülatör';
  $$('.toggle').forEach(button => {const enabled=state.settings[button.dataset.setting] === true; button.classList.toggle('on',enabled); button.setAttribute('aria-checked',String(enabled));});
}
function activity(agent,title,body,progress=100,result='Harici işlem yok',tone='amber') { return {agent,title,body,progress,result,tone}; }
async function submitCommand(command) {
  if (!command.trim() || store.get().busy) return;
  const current = store.get();
  controller = new AbortController();
  $('#approvalCard').classList.add('hidden');
  store.set({busy:true,systemState:'UNDERSTANDING',message:{headline:'İş akışına bakalım.',body:command},activity:activity('Intent Engine','Komut çözümleniyor',command,15)});
  try {
    const outcome = await runCommand(command,current.projectId,{
      onPlan(plan) { store.set({systemState:'ROUTING',activity:activity('Intent Engine','Plan hazır',`Intent: ${plan.intent} · Risk: ${plan.risk}`,35)}); },
      onProviders(selected) { store.set({activity:activity('Router','Simülasyon yolu',selected.map(p=>p.label).join(' + '),44)}); },
      onProgress(step) { store.set({systemState:step.stage === 'observing' ? 'VERIFYING' : 'SIMULATING',activity:activity('Simülatör','İş akışı simülasyonu',step.message,step.progress)}); }
    },current.settings,{signal:controller.signal});
    if (outcome.status === 'simulated') {
      store.set({systemState:'SIMULATED',message:{headline:'Simülasyon tamamlandı.',body:outcome.verification.summary},activity:activity('Contract verifier','Simülasyon sözleşmesi geçti',outcome.verification.evidence.join(' · '),100,'Gerçek görev doğrulanmadı')});
    } else if (outcome.status === 'approval') {
      $('#approvalCard').classList.remove('hidden'); $('#approvalText').textContent = outcome.reason;
      store.set({systemState:'APPROVAL REQUIRED',message:{headline:'İşlem yapılmadı.',body:'Bu komut açık yetkilendirme gerektiriyor. Demo harici işlem yapamaz.'},activity:activity('Permission Engine','Yetkilendirme gerekiyor',outcome.reason,0,'Engellendi','red')});
    } else {
      const labels = {cancelled:'İşlem durduruldu.', 'timed-out':'Süre sınırına ulaşıldı.',unavailable:'Bağlantı bulunamadı.',invalid:'Komutu kontrol edelim.',blocked:'İşlem engellendi.',unverified:'Sonuç doğrulanamadı.',error:'İşlem başarısız.'};
      const headline = labels[outcome.status] ?? 'Sonuç doğrulanamadı.';
      store.set({systemState:outcome.status.toUpperCase(),message:{headline,body:outcome.reason ?? 'Başarı iddiası yok; harici işlem yapılmadı.'},activity:activity('MARIA',headline,outcome.reason ?? 'Doğrulama başarısız.',0,'Tamamlanmadı',outcome.status==='cancelled'?'amber':'red')});
    }
  } catch {
    store.set({systemState:'ERROR',message:{headline:'Bir hata oluştu.',body:'İşlem doğrulanmadı. Yeniden deneyebilirsin.'},activity:activity('MARIA','Beklenmeyen hata','Hassas hata ayrıntıları ekrana yazılmadı.',0,'Doğrulanmadı','red')});
  } finally { controller = null; store.set({busy:false}); $('#commandInput').focus(); }
}
function send() { if (store.get().busy) {controller?.abort();return;} const input = $('#commandInput'); const text=input.value; input.value=''; void submitCommand(text); }
function changeProject(id) { if (store.get().busy || !projects.some(project=>project.id===id)) return; $('#approvalCard').classList.add('hidden'); store.set({projectId:id,systemState:'READY',message:null,activity:activity('MARIA','Proje bağlamı değişti','Yalnızca oturum bağlamı değişti; proje dosyalarına erişilmedi.',0)}); }
function explainUnavailable(name) { store.set({systemState:'UNAVAILABLE',message:{headline:`${name} bağlı değil.`,body:'Bu alpha sürümünde yalnızca iş akışı simülasyonu var. Kayıt veya harici işlem başlatılmadı.'},activity:activity('Capability registry','Adaptör gerekiyor',`${name} için gerçek bağlantı henüz yok.`,0)}); }
function closeProjectMenu() { $('#projectMenu').classList.add('hidden'); $('#projectSwitch').setAttribute('aria-expanded','false'); }
function openSettings() { previousFocus=document.activeElement; closeProjectMenu(); $('#settingsSheet').classList.remove('hidden'); $('.app-shell').inert=true; $('#closeSettings').focus(); }
function closeSettings() { $('#settingsSheet').classList.add('hidden'); $('.app-shell').inert=false; if (previousFocus?.isConnected) previousFocus.focus(); }
renderStatic(); store.subscribe(state=>{ render(state); persistPreferences(state); });
$('#sendBtn').addEventListener('click',send);
$('#commandInput').addEventListener('keydown',event=>{if(event.key==='Enter' && !event.isComposing) send();});
$('#quickActions').addEventListener('click',event=>{const button=event.target.closest('[data-command]');if(button) void submitCommand(button.dataset.command);});
$('#projectList').addEventListener('click',event=>{const button=event.target.closest('[data-project]');if(button) changeProject(button.dataset.project);});
$('#modeList').addEventListener('click',event=>{const button=event.target.closest('[data-mode]');if(button && !store.get().busy) store.set({mode:button.dataset.mode,message:{headline:'Çalışma odağı seçildi.',body:`${button.dataset.mode} bir oturum tercihi. Gerçek bir agent başlatılmadı.`}});});
$('#orb').addEventListener('click',()=>explainUnavailable('Voice'));
$('#micBtn').addEventListener('click',()=>explainUnavailable('Voice'));
$('#visionBtn').addEventListener('click',()=>explainUnavailable('Vision'));
$('#systemList').addEventListener('click',openSettings);
$('#brandButton').addEventListener('click',()=>changeProject(store.get().projectId));
$('#expandAgents').addEventListener('click',()=>{allAgents=!allAgents;renderAgents();});
$('#projectSwitch').addEventListener('click',()=>{const menu=$('#projectMenu');const show=menu.classList.contains('hidden');const rect=$('#projectSwitch').getBoundingClientRect();menu.style.top=`${rect.bottom+8}px`;menu.style.left=`${Math.max(12,rect.right-190)}px`;menu.classList.toggle('hidden',!show);$('#projectSwitch').setAttribute('aria-expanded',String(show));if(show) menu.querySelector('button').focus();});
$('#projectMenu').addEventListener('click',event=>{const button=event.target.closest('[data-project]');if(button){changeProject(button.dataset.project);closeProjectMenu();$('#projectSwitch').focus();}});
$('#settingsBtn').addEventListener('click',openSettings);
$('#closeSettings').addEventListener('click',closeSettings);
$('#settingsSheet').addEventListener('click',event=>{if(event.target===event.currentTarget) closeSettings();});
$('#settingsList').addEventListener('click',event=>{const button=event.target.closest('[data-setting]');if(!button || button.disabled) return;const definition=settings.find(item=>item.id===button.dataset.setting);if(!definition?.editable)return;const current=store.get();store.set({settings:{...current.settings,[definition.id]:!current.settings[definition.id]}});});
$('#approvalCard').addEventListener('click',()=>{$('#approvalCard').classList.add('hidden');store.set({systemState:'READY',message:{headline:'İstek kapatıldı.',body:'Onay verilmedi; harici işlem yapılmadı.'},activity:activity('Permission Engine','İstek kapatıldı','Kapatmak, yürütme onayı değildir.',0)});});
document.addEventListener('click',event=>{if(!event.target.closest('#projectMenu, #projectSwitch'))closeProjectMenu();});
document.addEventListener('keydown',event=>{const dialogOpen=!$('#settingsSheet').classList.contains('hidden');if(event.key==='Escape'){if(dialogOpen)closeSettings();else closeProjectMenu();}if(dialogOpen && event.key==='Tab'){const focusable=[...$('#settingsSheet').querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]')];const first=focusable[0],last=focusable.at(-1);if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}}if(!dialogOpen && (event.metaKey||event.ctrlKey) && event.key.toLowerCase()==='k'){event.preventDefault();$('#commandInput').focus();}});
