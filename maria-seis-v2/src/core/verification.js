export function verifyPrototype(result) {
  const checks = [
    { id:'runtime-result', pass:result?.ok === true, evidence:`runtime:${result?.runtime ?? 'unknown'}` },
    { id:'intent-preserved', pass:Boolean(result?.intent), evidence:`intent:${result?.intent ?? 'missing'}` },
    { id:'side-effects', pass:result?.sideEffects === false, evidence:'side-effects:none' }
  ];
  const verified = checks.every(c=>c.pass);
  return { verified, checks, evidence:checks.map(c=>c.evidence), summary:verified ? 'Workflow verified inside the safe prototype runtime.' : 'Workflow finished but verification did not fully pass.' };
}
