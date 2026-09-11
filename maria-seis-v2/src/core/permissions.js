/** Fail-closed policy for the demo. Live authorization must also live in a trusted host. */
export function evaluatePermission(plan, policy = {}) {
  const deny = (reason, approval = false) => ({ allowed:false, approval, reason });
  if (!plan || !['safe','observe','modify','high'].includes(plan.risk)) {
    return deny('Unknown action risk. No action was executed.');
  }
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) return deny('Invalid policy.');
  if (plan.risk === 'high') return deny('High-impact action requires explicit approval. This demo cannot execute it.', true);
  if (plan.risk === 'modify' && (policy.safeMode !== false || policy.allowProjectWrites !== true)) {
    return deny('Project writes are not authorized. No files were changed.', true);
  }
  return { allowed:true, approval:false, reason:'Within the configured, non-external execution scope.' };
}
