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

/** Verifies transport attribution separately from independently checked external outcomes. */
export function verifyLiveReceipt(result, expected = {}) {
  const evidence=Array.isArray(result?.evidence) ? result.evidence.filter(item=>typeof item==='string' && item.trim()).slice(0,32) : [];
  const allowedScopes=new Set(['live-transport','model-response-transport','tool-response-transport','external-outcome']);
  const scope=allowedScopes.has(result?.verificationScope) ? result.verificationScope : 'live-transport';
  const identityChecks=[
    {id:'runtime-result',pass:result?.ok===true,evidence:result?.ok===true?'runtime:ok':'runtime:not-ok'},
    {id:'live-runtime',pass:result?.runtime==='host-runtime-v1' && result?.mode==='live',evidence:`mode:${result?.mode==='live'?'live':'unknown'}`},
    {id:'provider-matched',pass:!!expected.providerId && result?.providerId===expected.providerId,evidence:`provider:${!!expected.providerId&&result?.providerId===expected.providerId?'matched':'unmatched'}`},
    {id:'intent-preserved',pass:!!expected.intent && result?.intent===expected.intent,evidence:`intent:${!!expected.intent&&result?.intent===expected.intent?'matched':'unmatched'}`},
    {id:'run-matched',pass:!!expected.runId && result?.runId===expected.runId,evidence:`run:${!!expected.runId&&result?.runId===expected.runId?'matched':'unmatched'}`},
    {id:'project-matched',pass:!!expected.projectId && result?.projectId===expected.projectId,evidence:`project:${!!expected.projectId&&result?.projectId===expected.projectId?'matched':'unmatched'}`}
  ];
  const identityVerified=identityChecks.every(check=>check.pass);
  const transportVerified=identityVerified && result?.transportVerified===true && evidence.length>0;
  const externalOutcomeVerified=transportVerified && scope==='external-outcome' && result?.outcomeVerified===true;
  const checks=[...identityChecks,
    {id:'transport-verification',pass:transportVerified,evidence:`transport:${transportVerified?'verified':'unverified'}`},
    {id:'external-outcome',pass:externalOutcomeVerified,evidence:`external:${externalOutcomeVerified?'verified':'unverified'}`}
  ];
  const summary=externalOutcomeVerified
    ? 'Canlı yürütme kimliği, taşıma yolu ve bağımsız dış sonuç kanıtı eşleşti.'
    : transportVerified
      ? 'Canlı taşıma ve yanıt kimliği doğrulandı; dış sonuç veya semantik doğruluk iddiası yok.'
      : 'Canlı sonuç kimliği veya taşıma kanıtı doğrulanamadı; başarı iddiası yok.';
  return {
    verified:transportVerified,
    verifiedTransport:transportVerified,
    verifiedExternalAction:externalOutcomeVerified,
    contractVerified:transportVerified,
    scope,
    checks,
    evidence:[...checks.map(c=>c.evidence),...evidence],
    summary
  };
}
