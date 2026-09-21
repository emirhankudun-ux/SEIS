import test from 'node:test';
import assert from 'node:assert/strict';
import { createProviderLifecycle } from '../src/core/providerLifecycle.js';
import { createSafePreferences } from '../src/core/persistence.js';
import { validatePluginManifestV2, createPluginHost } from '../src/plugins/host.js';
import { createExecutionJournal } from '../src/core/executionJournal.js';
import { createOrchestrator } from '../src/core/orchestrator.js';

test('provider lifecycle rejects impossible transitions and records verified health', async () => {
  const life = createProviderLifecycle([{id:'local',status:'unconfigured'}]);
  assert.throws(() => life.transition('local','ready'));
  life.transition('local','connecting');
  life.transition('local','ready',{healthVerified:true, capabilities:['reasoning']});
  const current = life.get('local');
  assert.equal(current.status,'ready');
  assert.equal(current.healthVerified,true);
  assert.deepEqual(current.capabilities,['reasoning']);
});

test('provider lifecycle degrades after failed health check without losing identity', () => {
  const life = createProviderLifecycle([{id:'mcp',status:'connecting'}]);
  life.transition('mcp','ready',{healthVerified:true});
  life.markHealth('mcp',{ok:false,reason:'timeout'});
  const current = life.get('mcp');
  assert.equal(current.id,'mcp');
  assert.equal(current.status,'degraded');
  assert.equal(current.healthVerified,false);
  assert.equal(current.lastError,'timeout');
});

test('safe preferences persist only allowlisted non-secret values', () => {
  const memory = new Map();
  const storage = {getItem:k=>memory.get(k) ?? null,setItem:(k,v)=>memory.set(k,v)};
  const prefs = createSafePreferences(storage,'maria-test');
  prefs.save({projectId:'seis',mode:'Focus',localFirst:false,allowCloud:true,apiKey:'SECRET',token:'SECRET'});
  assert.deepEqual(prefs.load(),{projectId:'seis',mode:'Focus',localFirst:false,allowCloud:true});
  assert.equal(JSON.stringify([...memory.values()]).includes('SECRET'),false);
});

test('corrupt persisted preferences fail closed to defaults', () => {
  const storage = {getItem:()=>'{bad json',setItem:()=>{}};
  const prefs = createSafePreferences(storage,'maria-test');
  assert.deepEqual(prefs.load({projectId:'deadly-evil',localFirst:true}),{projectId:'deadly-evil',localFirst:true});
});

test('plugin v2 requires API compatibility and declared permissions', () => {
  const good = validatePluginManifestV2({id:'unreal-bridge',name:'Unreal Bridge',version:'1.2.3',apiVersion:'2',capabilities:['build'],permissions:['project.read'],risk:'safe'});
  assert.equal(good.valid,true);
  const incompatible = validatePluginManifestV2({id:'old',name:'Old',version:'1.0.0',apiVersion:'1',capabilities:['build'],permissions:['project.read'],risk:'safe'});
  assert.equal(incompatible.valid,false);
});

test('plugin host isolates crashes and never grants undeclared capability', async () => {
  const host = createPluginHost({apiVersion:'2'});
  host.register({id:'safe-plugin',name:'Safe',version:'1.0.0',apiVersion:'2',capabilities:['inspect'],permissions:['project.read'],risk:'observe'}, () => ({inspect:()=>{throw new Error('boom')}}));
  const denied = await host.invoke('safe-plugin','deleteEverything',{});
  assert.equal(denied.status,'denied');
  const noGrant = await host.invoke('safe-plugin','inspect',{});
  assert.equal(noGrant.status,'denied');
  assert.equal(noGrant.reason,'permission-not-granted');
  const crashed = await host.invoke('safe-plugin','inspect',{}, {grantedPermissions:['project.read']});
  assert.equal(crashed.status,'failed');
  assert.equal(crashed.reason,'plugin-crashed');
});

test('execution journal redacts secrets, bounds history, and freezes returned records', () => {
  const journal = createExecutionJournal({limit:2});
  journal.append({runId:'1',status:'simulated',provider:'simulation',evidence:{token:'abc',message:'ok'}});
  journal.append({runId:'2',status:'blocked',provider:null,evidence:{apiKey:'xyz'}});
  journal.append({runId:'3',status:'verified',provider:'local',evidence:{result:'ok'}});
  const records = journal.list();
  assert.equal(records.length,2);
  assert.deepEqual(records.map(r=>r.runId),['2','3']);
  assert.equal(records[0].evidence.apiKey,'[REDACTED]');
  assert.equal(Object.isFrozen(records[0]),true);
});

test('orchestrator writes a truthful terminal journal entry', async () => {
  const journal=createExecutionJournal({limit:10});
  const run=createOrchestrator({journal});
  const outcome=await run('Deadly Evil durumunu kontrol et','deadly-evil',{}, {executionMode:'simulation'});
  const entries=journal.list();
  assert.equal(entries.length,1);
  assert.equal(entries[0].runId,outcome.plan.runId);
  assert.equal(entries[0].status,outcome.status);
  assert.equal(entries[0].executionMode,'simulation');
  assert.equal(entries[0].verifiedExternalAction,false);
});

test('orchestrator journals blocked live execution without inventing evidence', async () => {
  const journal=createExecutionJournal({limit:10});
  const run=createOrchestrator({journal});
  const outcome=await run('Deadly Evil build al','deadly-evil',{}, {executionMode:'live',allowProjectModification:true});
  assert.equal(outcome.status,'unavailable');
  const [entry]=journal.list();
  assert.equal(entry.status,'unavailable');
  assert.deepEqual(entry.evidence,[]);
});

test('plugin host bounds a hung capability with timeout', async () => {
  const host=createPluginHost({apiVersion:'2',timeoutMs:15});
  host.register({id:'slow-plugin',name:'Slow',version:'1.0.0',apiVersion:'2',capabilities:['inspect'],permissions:[],risk:'observe'},()=>({inspect:()=>new Promise(()=>{})}));
  const result=await host.invoke('slow-plugin','inspect',{});
  assert.equal(result.status,'failed');
  assert.equal(result.reason,'plugin-timeout');
});
