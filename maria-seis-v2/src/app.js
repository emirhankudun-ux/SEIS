import { store } from './core/store.js';
import { runCommand } from './core/orchestrator.js';
import { projects, modes, capabilities, agents, quickActions, settings } from './data/registry.js';
import { providers } from './data/providers.js';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function projectById(id){ return projects.find(p => p.id === id) || projects[0]; }
function setActivity(activity){ store.set({ activity }); }
function setSystemState(systemState){ store.set({ systemState }); }

function renderStatic(){
  $('#systemList').innerHTML = capabilities.slice(0,5).map(c => `<button class="nav-row" data-cap="${c.id}"><span>${c.label}</span><b class="status ${c.status}">${c.status === 'ready' ? 'Ready' : c.status}</b></button>`).join('');
  $('#projectList').innerHTML = projects.map((p,i) => `<button class="nav-row project-nav" data-project="${p.id}"><span><small>${String(i+1).padStart(2,'0')}</small>${p.label}</span><b>›</b></button>`).join('');
  $('#modeList').innerHTML = modes.map(m => `<button class="mode-row" data-mode="${m}">${m}</button>`).join('');
  $('#quickActions').innerHTML = quickActions.map(q => `<button data-command="${q}">${q}</button>`).join('');
  $('#agentList').innerHTML = agents.slice(0,4).map(a => `<div class="agent-row"><span class="agent-code">${a.code}</span><div><strong>${a.label}</strong><small>${a.detail}</small></div><i class="agent-state ${a.status}"></i></div>`).join('');
  $('#capabilityGrid').innerHTML = capabilities.map(c => `<div class="capability"><span>${c.label}</span><i class="${c.status}"></i></div>`).join('');
  $('#projectMenu').innerHTML = projects.map(p => `<button data-project="${p.id}">${p.label}</button>`).join('');
  $('#settingsList').innerHTML = settings.map(s => `<div class="setting-row"><div><strong>${s.label}</strong><span>${s.help}</span></div><button class="toggle ${s.enabled ? 'on':''}" data-setting="${s.id}"><i></i></button></div>`).join('');
  $('#providerList').innerHTML = providers.map(p => `<div class="provider-row"><div><strong>${p.label}</strong><span>${p.kind} · ${p.capabilities.slice(0,3).join(' / ')}</span></div><b class="provider-status ${p.status}">${p.status}</b></div>`).join('');
}

function render(state){
  const p = projectById(state.projectId);
  $('#projectLabel').textContent = p.label;
  $('#contextText').textContent = p.context;
  if (!state.busy && state.systemState === 'READY') { $('#headline').textContent = p.headline; $('#assistantText').textContent = p.subline; }
  $('#stateText').textContent = state.systemState;
  $('#orb').className = `orb state-${state.systemState.toLowerCase()}`;
  $('#micBtn').classList.toggle('active', state.listening);
  $('#visionBtn').classList.toggle('active', state.vision);
  $$('.project-nav').forEach(b => b.classList.toggle('active', b.dataset.project === state.projectId));
  $$('.mode-row').forEach(b => b.classList.toggle('active', b.dataset.mode === state.mode));
  const a = state.activity;
  $('#activityAgent').textContent = a.agent; $('#activityTitle').textContent = a.title; $('#activityBody').textContent = a.body; $('#progressBar').style.width = `${a.progress}%`; $('#activityResult').textContent = a.result; $('#resultDot').className = a.tone || 'green';
  $('#footerState').textContent = state.systemState === 'READY' ? 'SEIS healthy' : `SEIS · ${state.systemState.toLowerCase()}`;
  $('#routeText').textContent = state.settings.localFirst ? 'Local-first · Cloud fallback · MCP' : 'Cloud enabled · MCP';
}

async function submitCommand(command){
  command = command.trim(); if(!command || store.get().busy) return;
  const current = store.get();
  store.set({ busy:true, systemState:'UNDERSTANDING' });
  $('#headline').textContent = 'Anlıyorum.'; $('#assistantText').textContent = command;
  setActivity({agent:'Intent Engine',title:'Intent resolving',body:command,progress:18,result:'Context locked',tone:'amber'});
  const outcome = await runCommand(command, current.projectId, {
    onPlan(plan){ setSystemState('ROUTING'); setActivity({agent:plan.agents.join(' + '),title:'Execution plan ready',body:`Intent: ${plan.intent} · Risk: ${plan.risk}`,progress:38,result:'Capabilities selected',tone:'amber'}); },
    onProviders(selected){ setActivity({agent:'Provider Router',title:'Provider route selected',body:selected.map(p=>p.label).join(' + '),progress:44,result:'Policy matched',tone:'amber'}); },
    onProgress(step){ const map={acting:'ACTING',observing:'VERIFYING',routing:'ROUTING'}; setSystemState(map[step.stage] || 'ROUTING'); setActivity({agent:'SEIS Orchestrator',title:step.stage === 'acting' ? 'Adapter execution':step.stage === 'observing' ? 'Collecting evidence':'Routing specialists',body:step.message,progress:step.progress,result:'In progress',tone:'amber'}); }
  }, current.settings);
  if(outcome.status === 'approval'){
    store.set({ busy:false, systemState:'APPROVAL REQUIRED' });
    $('#approvalCard').classList.remove('hidden'); $('#approvalText').textContent = outcome.permission.reason;
    setActivity({agent:'Permission Engine',title:'Approval required',body:outcome.plan.command,progress:100,result:'No action executed',tone:'red'}); return;
  }
  setSystemState('VERIFYING');
  setActivity({agent:'Verification Agent',title:'Verifying outcome',body:outcome.verification.evidence.join(' · '),progress:88,result:'Evidence collected',tone:'amber'});
  await new Promise(r=>setTimeout(r,460));
  store.set({ busy:false, systemState:'READY' });
  $('#headline').textContent = responseHeadline(outcome.plan.intent);
  $('#assistantText').textContent = `${outcome.verification.summary} Route: ${outcome.selectedProviders.map(p=>p.label).join(' + ')}.`;
  setActivity({agent:'MARIA',title:'Workflow complete',body:outcome.result.output,progress:100,result:`${outcome.verification.verified ? 'Verified' : 'Unverified'} · ${outcome.result.runtime}`,tone:outcome.verification.verified?'green':'red'});
}
function responseHeadline(intent){ return ({build:'Build hattı hazır.', 'enemy-ai':'Enemy AI doğrulama hattı hazır.', 'mcp-health':'MCP sağlık hattı hazır.', 'creative-review':'Creative Director hazır.'})[intent] || 'Komut bağlama alındı.'; }

renderStatic(); store.subscribe(render);
$('#sendBtn').addEventListener('click',()=>{ submitCommand($('#commandInput').value); $('#commandInput').value=''; });
$('#commandInput').addEventListener('keydown',e=>{ if(e.key==='Enter'){ submitCommand(e.currentTarget.value); e.currentTarget.value=''; }});
$('#quickActions').addEventListener('click',e=>{ const b=e.target.closest('button'); if(b) submitCommand(b.dataset.command); });
$('#projectList').addEventListener('click',e=>{ const b=e.target.closest('[data-project]'); if(b) store.set({projectId:b.dataset.project}); });
$('#modeList').addEventListener('click',e=>{ const b=e.target.closest('[data-mode]'); if(b) store.set({mode:b.dataset.mode}); });
$('#orb').addEventListener('click',()=>{ const s=store.get(); const listening=!s.listening; store.set({listening,systemState:listening?'LISTENING':'READY'}); $('#headline').textContent=listening?'Dinliyorum.':projectById(s.projectId).headline; $('#assistantText').textContent=listening?'Ses adaptörü için hazır durumdayım.':projectById(s.projectId).subline; });
$('#micBtn').addEventListener('click',()=>$('#orb').click());
$('#visionBtn').addEventListener('click',()=>{ const s=store.get(); store.set({vision:!s.vision}); setActivity({agent:'Vision Engine',title:!s.vision?'Vision enabled':'Vision paused',body:!s.vision?'Screen understanding adapter is ready for an authorized provider.':'Visual capture is paused.',progress:100,result:!s.vision?'Vision ready':'Paused',tone:!s.vision?'green':'amber'}); });
$('#projectSwitch').addEventListener('click',()=>{ const r=$('#projectSwitch').getBoundingClientRect(); const menu=$('#projectMenu'); menu.style.top=`${r.bottom+8}px`; menu.style.left=`${Math.max(12,r.right-190)}px`; menu.classList.toggle('hidden'); });
$('#projectMenu').addEventListener('click',e=>{ const b=e.target.closest('[data-project]'); if(b){store.set({projectId:b.dataset.project}); e.currentTarget.classList.add('hidden');}});
$('#settingsBtn').addEventListener('click',()=>$('#settingsSheet').classList.remove('hidden'));
$('#closeSettings').addEventListener('click',()=>$('#settingsSheet').classList.add('hidden'));
$('#settingsSheet').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.classList.add('hidden')});
$('#settingsList').addEventListener('click',e=>{const b=e.target.closest('.toggle'); if(!b)return; const s=store.get(); const settings={...s.settings,[b.dataset.setting]:!s.settings[b.dataset.setting]}; b.classList.toggle('on',settings[b.dataset.setting]); store.set({settings});});
$('#approvalCard').addEventListener('click',()=>{ $('#approvalCard').classList.add('hidden'); store.set({systemState:'READY'}); setActivity({agent:'Permission Engine',title:'Approval dismissed',body:'No high-impact action was executed.',progress:100,result:'Safe state preserved',tone:'green'}); });
document.addEventListener('keydown',e=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#commandInput').focus()} if(e.key==='Escape'){ $('#projectMenu').classList.add('hidden'); $('#settingsSheet').classList.add('hidden'); }});
