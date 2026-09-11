import { classifyIntent } from './router.js';
import { evaluatePermission } from './permissions.js';
import { verifyPrototype } from './verification.js';
import { selectProviders } from './providerRouter.js';
import { eventBus } from './eventBus.js';
import { MockRuntimeAdapter } from '../adapters/runtime.js';
const runtime = new MockRuntimeAdapter();
export async function runCommand(command, projectId, hooks={}, policy={localFirst:true}) {
  const plan = classifyIntent(command, projectId);
  eventBus.emit('PLAN_CREATED', plan); hooks.onPlan?.(plan);
  const permission = evaluatePermission(plan);
  if (!permission.allowed) { eventBus.emit('APPROVAL_REQUIRED',{plan,permission}); return { status:'approval', plan, permission }; }
  const selectedProviders = selectProviders(plan, policy);
  eventBus.emit('PROVIDERS_SELECTED',{plan,selectedProviders}); hooks.onProviders?.(selectedProviders);
  const result = await runtime.execute(plan, hooks.onProgress, {providers:selectedProviders});
  eventBus.emit('ACTION_COMPLETED', result);
  const verification = verifyPrototype(result);
  eventBus.emit(verification.verified ? 'VERIFICATION_PASSED' : 'VERIFICATION_FAILED', verification);
  return { status:verification.verified ? 'complete':'unverified', plan, selectedProviders, result, verification };
}
