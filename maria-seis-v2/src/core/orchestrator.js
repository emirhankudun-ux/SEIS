import { classifyIntent } from './router.js';
import { evaluatePermission } from './permissions.js';
import { verifyPrototype, verifyLiveReceipt } from './verification.js';
import { selectProviders } from './providerRouter.js';
import { eventBus } from './eventBus.js';
import { MockRuntimeAdapter } from '../adapters/runtime.js';
import { executionJournal } from './executionJournal.js';
let sequence = 0;

/** Runtime is dependency-injected. The shipped app uses only the simulator; trusted hosts may inject an explicit live runtime. */
export function createOrchestrator({ runtime = new MockRuntimeAdapter(), bus = eventBus, timeoutMs = 10000, journal = executionJournal, providerRegistry = null } = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw new TypeError('Invalid timeoutMs');
  const writeJournal = entry => { try { journal?.append?.(entry); } catch { bus.emit('JOURNAL_FAILED',{runId:entry?.runId ?? null}); } };
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
    if (!policy || typeof policy !== 'object' || Array.isArray(policy)) { const out={status:'blocked',plan,reason:'Geçersiz yürütme politikası.'}; writeJournal({runId:plan.runId,status:out.status,executionMode:'unknown',verifiedExternalAction:false,evidence:[]}); return out; }
    const mode = policy.executionMode ?? 'simulation';
    if (!['simulation','live'].includes(mode)) { const out={status:'blocked',plan,reason:'Bilinmeyen yürütme modu.'}; writeJournal({runId:plan.runId,status:out.status,executionMode:String(mode),verifiedExternalAction:false,evidence:[]}); return out; }
    // Authorization precedes observers. A UI hook cannot mutate the plan or grant consent.
    const permission = evaluatePermission(plan, policy);
    bus.emit('PLAN_CREATED', plan); notify('onPlan', plan);
    if (!permission.allowed) {
      bus.emit(permission.approval ? 'APPROVAL_REQUIRED' : 'ACTION_BLOCKED', {plan,permission});
      const out={status:permission.approval ? 'approval' : 'blocked',plan,permission,reason:permission.reason}; writeJournal({runId:plan.runId,status:out.status,executionMode:mode,verifiedExternalAction:false,evidence:[]}); return out;
    }
    const runtimeCompatible = (mode === 'simulation' && runtime?.mode === 'simulation') || (mode === 'live' && runtime?.mode === 'live');
    if (!runtimeCompatible || typeof runtime?.execute !== 'function') {
      const out={status:'unavailable',plan,reason:'İstenen yürütme modu için uygun adaptör bağlı değil. Simülasyona sessizce geçilmedi.'}; writeJournal({runId:plan.runId,status:out.status,executionMode:mode,verifiedExternalAction:false,evidence:[]}); return out;
    }
    const selectedProviders = Object.freeze(selectProviders(plan, {...policy,executionMode:mode}, providerRegistry ?? undefined));
    if (!selectedProviders.length) { const out={status:'unavailable',plan,reason:'Kullanılabilir bir yürütücü yok.'}; writeJournal({runId:plan.runId,status:out.status,executionMode:mode,verifiedExternalAction:false,evidence:[]}); return out; }
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
      const verification = mode === 'live'
        ? verifyLiveReceipt(result, {...plan,providerId:selectedProviders[0]?.id})
        : verifyPrototype(result, plan);
      bus.emit(mode === 'live' ? 'LIVE_EXECUTION_FINISHED' : 'SIMULATION_FINISHED', {plan,verification});
      const status = mode === 'live' ? (verification.verified ? 'verified' : 'unverified') : (verification.contractVerified ? 'simulated' : 'unverified');
      const out={status,plan,selectedProviders,result,verification}; writeJournal({runId:plan.runId,status:out.status,executionMode:mode,provider:selectedProviders[0]?.id ?? null,verifiedExternalAction:verification.verifiedExternalAction === true,evidence:verification.evidence ?? []}); return out;
    } catch {
      const status = timedOut ? 'timed-out' : controller.signal.aborted ? 'cancelled' : 'error';
      const reason = { 'timed-out':'İşlem süre sınırında durduruldu.', cancelled:'İşlem iptal edildi.', error:'Yürütücü başarısız oldu; sonuç doğrulanmadı.' }[status];
      bus.emit('EXECUTION_STOPPED', {runId:plan.runId,status});
      const out={status,plan,reason}; writeJournal({runId:plan.runId,status,executionMode:mode,provider:selectedProviders?.[0]?.id ?? null,verifiedExternalAction:false,evidence:[]}); return out;
    } finally {
      settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', cancel);
    }
  };
}
export const runCommand = createOrchestrator();
