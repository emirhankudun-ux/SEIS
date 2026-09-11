const wait = (ms) => new Promise(r => setTimeout(r, ms));
export class MockRuntimeAdapter {
  name = 'mock-runtime-v4';
  async execute(plan, onProgress, context={}) {
    onProgress?.({ stage:'routing', progress:46, message:`${plan.agents.join(' + ')} selected · ${context.providers?.map(p=>p.label).join(' + ') || 'safe runtime'}.` });
    await wait(180);
    onProgress?.({ stage:'acting', progress:72, message:'Executing through permission-bounded adapter contract.' });
    await wait(220);
    onProgress?.({ stage:'observing', progress:84, message:'Collecting runtime evidence before verification.' });
    await wait(140);
    return { ok:true, runtime:this.name, intent:plan.intent, sideEffects:false, output:'Prototype action completed with no external side effects.', providerIds:context.providers?.map(p=>p.id) ?? [] };
  }
}
