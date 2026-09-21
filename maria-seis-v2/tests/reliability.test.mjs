import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyIntent } from '../src/core/router.js';
import { evaluatePermission } from '../src/core/permissions.js';
import { selectProviders } from '../src/core/providerRouter.js';
import { verifyPrototype } from '../src/core/verification.js';
import { runCommand } from '../src/core/orchestrator.js';
import { resolveTruth } from '../src/core/sourceOfTruth.js';
import { EventBus } from '../src/core/eventBus.js';
import { validatePluginManifest, defineMariaPlugin } from '../src/plugins/sdk.js';

const manifest = () => ({ id:'sample-plugin', name:'Sample', version:'1.0.0', capabilities:['inspect'], risk:'observe' });

test('silah is not the destructive command sil', () => {
  assert.equal(classifyIntent('Silah tasarımını incele','deadly-evil').risk, 'safe');
});
test('mail is not enemy AI', () => {
  assert.equal(classifyIntent('Mail durumunu göster','seis').intent, 'general');
});
test('Turkish uppercase input routes consistently', () => {
  assert.equal(classifyIntent('TASARIMI İNCELE','portfolio').intent, 'creative-review');
});
test('blank and oversized commands are rejected', () => {
  assert.throws(() => classifyIntent('   ','seis'), /command/i);
  assert.throws(() => classifyIntent('a'.repeat(4001),'seis'), /command/i);
});
test('unknown risk fails closed', () => {
  assert.equal(evaluatePermission({ risk:'unexpected' }).allowed, false);
});
test('missing plan fails closed without throwing', () => {
  assert.equal(evaluatePermission(null).allowed, false);
});
test('project modification needs explicit scoped policy', () => {
  assert.equal(evaluatePermission({ risk:'modify' }).allowed, false);
});
test('safe mode wins over modification permission', () => {
  assert.equal(evaluatePermission({ risk:'modify' }, { allowProjectWrites:true, safeMode:true }).allowed, false);
});
test('unconnected providers cannot be selected in live mode', () => {
  assert.deepEqual(selectProviders({intent:'build'},{executionMode:'live'}), []);
});
test('simulation routing names only the simulator', () => {
  const selected = selectProviders({intent:'build'},{executionMode:'simulation'});
  assert.deepEqual(selected.map(p => p.id), ['simulation']);
});
test('disabled cloud fallback never selects cloud', () => {
  const selected = selectProviders({intent:'general'},{executionMode:'live',allowCloud:false});
  assert.ok(selected.every(p => p.kind !== 'cloud-model'));
});
test('a mock result cannot verify an external action', () => {
  const result = verifyPrototype({ok:true,runtime:'mock-runtime-v4',intent:'build',sideEffects:false});
  assert.equal(result.verified, false);
});
test('verifier never fabricates no-side-effect evidence', () => {
  const result = verifyPrototype({ok:true,intent:'build',sideEffects:true});
  assert.equal(result.evidence.includes('side-effects:none'), false);
});
test('equal-ranking conflicting memories are preserved', () => {
  const candidates = [{source:'canonical-governance',value:'A'}, {source:'canonical-governance',value:'B'}];
  const result = resolveTruth(candidates);
  assert.equal(result.status, 'conflict');
  assert.equal(result.candidates.length, 2);
  assert.deepEqual(candidates.map(c => c.value), ['A','B']);
});
test('an unverified runtime claim cannot outrank canon', () => {
  const result = resolveTruth([{source:'verified-runtime-state',value:'invented',verified:false}, {source:'canonical-governance',value:'canon'}]);
  assert.equal(result.value, 'canon');
});
test('a user wish is not an observed fact', () => {
  const result = resolveTruth([{source:'current-user-instruction',value:'build passed'}, {source:'verified-runtime-state',value:'build failed',verified:true}]);
  assert.equal(result.value, 'build failed');
});
test('malformed plugin identifiers and versions are rejected', () => {
  assert.equal(validatePluginManifest({...manifest(), id:''}).valid, false);
  assert.equal(validatePluginManifest({...manifest(), version:'whatever'}).valid, false);
  assert.equal(validatePluginManifest({...manifest(), capabilities:[null]}).valid, false);
});
test('plugin factory must be callable', () => {
  assert.throws(() => defineMariaPlugin(manifest(), null), /factory/i);
});
test('plugin capability grants are copied and frozen', () => {
  const source = manifest(); const plugin = defineMariaPlugin(source, () => ({}));
  source.capabilities.push('delete');
  assert.deepEqual(plugin.manifest.capabilities, ['inspect']);
  assert.ok(Object.isFrozen(plugin.manifest.capabilities));
});
test('a broken event subscriber cannot stop another subscriber', () => {
  const bus = new EventBus(); let reached=false;
  bus.on('TEST', () => { throw new Error('observer failed'); });
  bus.on('TEST', () => { reached=true; });
  assert.doesNotThrow(() => bus.emit('TEST'));
  assert.equal(reached, true);
});
test('simulation finishes without claiming external completion', async () => {
  const result = await runCommand('Son build durumunu kontrol et','seis');
  assert.equal(result.status, 'simulated');
  assert.equal(result.verification.verified, false);
  assert.equal(result.verification.contractVerified, true);
});
test('already cancelled work never starts', async () => {
  const controller = new AbortController(); controller.abort();
  const result = await runCommand('Build kontrol et','seis',{}, {}, {signal:controller.signal});
  assert.equal(result.status, 'cancelled');
});
test('live mode without an adapter does not silently run simulation', async () => {
  const result = await runCommand('Build kontrol et','seis',{}, {executionMode:'live'});
  assert.equal(result.status, 'unavailable');
});
test('plan observers cannot downgrade the authorization decision', async () => {
  const result = await runCommand('production deploy yap','seis',{onPlan(plan){ plan.risk='safe'; }});
  assert.equal(result.status, 'approval');
});
