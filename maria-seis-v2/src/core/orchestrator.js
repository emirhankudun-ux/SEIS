import { classifyIntent } from './router.js';
import { evaluatePermission } from './permissions.js';
import { verifyPrototype } from './verification.js';
import { selectProviders } from './providerRouter.js';
import { eventBus } from './eventBus.js';
import { MockRuntimeAdapter } from '../adapters/runtime.js';
let sequence = 0;

/** Injectable for contract tests. Only the simulator is executable in this release. */
export function createOrchestrator({ runtime = new MockRuntimeAdapter(), bus = eventBus, timeoutMs = 10000 } = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw new TypeError('Invalid timeoutMs');
  return async function run(command, projectId, hooks = {}, policy = {}, options = {}) {
    let plan;
    const notify = (name, data) => {
      try {
        const result = hooks?.[name]?.(data);
        if (result && typeof result.then === 'function') Promise.resolve(result).catch(() => bus.emit('OBSERVER_FAILED', {name}));
      } catch { bus.emit('OBSERVER_FAILED', {name}); }
    };
    if (options.signal?.aborted) return {status:'cancelled',reason:'İş başlamadan iptal edildi.'};
    try {
      plan = Object.freeze({...classifyIntent(command, projectId), runId:`run-${Date.now()}-${++sequence}`});
    } catch { return {status:'invalid',reason:'Komut 1–4000 karakter olmalı ve bir proje seçilmeli.'}; }
    if (!policy || typeof policy !== 'object' || Array.isArray(policy)) return {status:'blocked',plan,reason:'Geçersiz yürütme politikası.'};
    const mode = policy.executionMode ?? 'simulation';
    if (!['simulation','live'].includes(mode)) return {status:'blocked',plan,reason:'Bilinmeyen yürütme modu.'};
    // Authorization precedes observers. A UI hook cannot mutate the plan or grant consent.
    const permission = evaluatePermission(plan, policy);
    bus.emit('PLAN_CREATED', plan); notify('onPlan', plan);
    if (!permission.allowed) {
      bus.emit(permission.approval ? 'APPROVAL_REQUIRED' : 'ACTION_BLOCKED', {plan,permission});
      return {status:permission.approval ? 'approval' : 'blocked',plan,permission,reason:permission.reason};
    }
    if (mode === 'live' || runtime?.mode !== 'simulation' || typeof runtime?.execute !== 'function') {
      return {status:'unavailable',plan,reason:'Gerçek yürütme adaptörü bağlı değil. Simülasyona sessizce geçilmedi.'};
    }
    const selectedProviders = Object.freeze(selectProviders(plan, {...policy,executionMode:mode}));
    if (!selectedProviders.length) return {status:'unavailable',plan,reason:'Kullanılabilir bir yürütücü yok.'};
    bus.emit('PROVIDERS_SELECTED', {plan,selectedProviders}); notify('onProviders', selectedProviders);
    const controller = new AbortController();
    let timedOut = false;
    let settled = false;
    const cancel = () => controller.abort();
    options.signal?.addEventListener('abort', cancel, {once:true});
    const cancellation = new Promise((_,reject) => {
      controller.signal.addEventListener('abort', () => reject(new Error('execution stopped')), {once:true});
    });
    const timer = setTimeout(() => { timedOut=true; controller.abort(); }, timeoutMs);
    try {
      if (options.signal?.aborted) controller.abort();
      const progress = step => { if (!settled && !controller.signal.aborted) notify('onProgress',step); };
      const execution = Promise.resolve().then(() => {
        if (controller.signal.aborted) throw new Error('execution stopped');
        return runtime.execute(plan, progress, {providers:selectedProviders,signal:controller.signal});
      });
      const result = await Promise.race([execution,cancellation]);
      if (controller.signal.aborted) throw new Error('execution stopped');
      const verification = verifyPrototype(result, plan);
      bus.emit('SIMULATION_FINISHED', {plan,verification});
      return {status:verification.contractVerified ? 'simulated' : 'unverified',plan,selectedProviders,result,verification};
    } catch {
      const status = timedOut ? 'timed-out' : controller.signal.aborted ? 'cancelled' : 'error';
      const reason = { 'timed-out':'İşlem süre sınırında durduruldu.', cancelled:'İşlem iptal edildi.', error:'Yürütücü başarısız oldu; sonuç doğrulanmadı.' }[status];
      bus.emit('EXECUTION_STOPPED', {runId:plan.runId,status});
      return {status,plan,reason};
    } finally {
      settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', cancel);
    }
  };
}
export const runCommand = createOrchestrator();
