/** Checks the simulator's response contract, not a build, a model, or an external tool. */
export function verifyPrototype(result, expected = {}) {
  const effects = result?.sideEffects === false ? 'none' : result?.sideEffects === true ? 'reported' : 'unknown';
  const checks = [
    { id:'runtime-result', pass:result?.ok === true, evidence:result?.ok === true ? 'runtime:ok' : 'runtime:not-ok' },
    { id:'simulation', pass:result?.runtime === 'mock-runtime-v4' && result?.mode === 'simulation', evidence:`mode:${result?.mode === 'simulation' ? 'simulation' : 'unknown'}` },
    { id:'intent-preserved', pass:!!expected.intent && result?.intent === expected.intent, evidence:`intent:${result?.intent === expected.intent && !!expected.intent ? 'matched' : 'unmatched'}` },
    { id:'run-matched', pass:!!expected.runId && result?.runId === expected.runId, evidence:`run:${!!expected.runId && result?.runId === expected.runId ? 'matched' : 'unmatched'}` },
    { id:'project-matched', pass:!!expected.projectId && result?.projectId === expected.projectId, evidence:`project:${!!expected.projectId && result?.projectId === expected.projectId ? 'matched' : 'unmatched'}` },
    { id:'side-effects', pass:result?.sideEffects === false, evidence:`side-effects:${effects}` }
  ];
  const contractVerified = checks.every(check => check.pass);
  return { verified:false, contractVerified, scope:'simulation', checks, evidence:checks.map(c => c.evidence),
    summary:contractVerified ? 'Simülasyon sözleşmesi doğrulandı. Harici işlem yapılmadı.' : 'Simülasyon sonucu doğrulanamadı. Gerçek başarı iddiası yok.' };
}

/** Verifies attribution and identity for a live adapter receipt. This is intentionally stricter than adapter health. */
export function verifyLiveReceipt(result, expected = {}) {
  const evidence=Array.isArray(result?.evidence) ? result.evidence.filter(item=>typeof item==='string' && item.trim()).slice(0,32) : [];
  const checks=[
    {id:'runtime-result',pass:result?.ok===true,evidence:result?.ok===true?'runtime:ok':'runtime:not-ok'},
    {id:'live-runtime',pass:result?.runtime==='host-runtime-v1' && result?.mode==='live',evidence:`mode:${result?.mode==='live'?'live':'unknown'}`},
    {id:'provider-attributed',pass:typeof result?.providerId==='string' && !!result.providerId,evidence:`provider:${typeof result?.providerId==='string'&&result.providerId?'attributed':'missing'}`},
    {id:'intent-preserved',pass:!!expected.intent && result?.intent===expected.intent,evidence:`intent:${!!expected.intent&&result?.intent===expected.intent?'matched':'unmatched'}`},
    {id:'run-matched',pass:!!expected.runId && result?.runId===expected.runId,evidence:`run:${!!expected.runId&&result?.runId===expected.runId?'matched':'unmatched'}`},
    {id:'project-matched',pass:!!expected.projectId && result?.projectId===expected.projectId,evidence:`project:${!!expected.projectId&&result?.projectId===expected.projectId?'matched':'unmatched'}`},
    {id:'external-verification',pass:result?.outcomeVerified===true && evidence.length>0,evidence:`external:${result?.outcomeVerified===true&&evidence.length?'verified':'unverified'}`}
  ];
  const verified=checks.every(check=>check.pass);
  return {verified,verifiedExternalAction:verified,contractVerified:verified,scope:'live',checks,evidence:[...checks.map(c=>c.evidence),...evidence],summary:verified?'Canlı yürütme kimliği ve dış doğrulama kanıtı eşleşti.':'Canlı sonuç tam doğrulanamadı; başarı iddiası yok.'};
}
