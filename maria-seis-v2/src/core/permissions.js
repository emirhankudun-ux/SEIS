export function evaluatePermission(plan) {
  if (plan.risk === 'high') return { allowed:false, approval:true, reason:'High-impact action requires explicit approval.' };
  return { allowed:true, approval:false, reason:'Action is within current prototype-safe boundary.' };
}
