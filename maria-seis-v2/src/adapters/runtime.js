function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new Error('cancelled')); return; }
    const abort = () => { clearTimeout(timer); signal?.removeEventListener('abort', abort); reject(new Error('cancelled')); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, ms);
    signal?.addEventListener('abort', abort, {once:true});
  });
}
/** No network, microphone, filesystem, model inference or external actions. */
export class MockRuntimeAdapter {
  name = 'mock-runtime-v4';
  mode = 'simulation';
  async execute(plan, onProgress, context = {}) {
    onProgress?.({stage:'routing',progress:46,message:'Yalnızca yerel simülatör seçildi; harici bağlantı yok.'});
    await wait(180, context.signal);
    onProgress?.({stage:'acting',progress:72,message:'İş akışı simüle ediliyor; araç veya model çağrılmıyor.'});
    await wait(220, context.signal);
    onProgress?.({stage:'observing',progress:84,message:'Simülasyon yanıtının sözleşmesi kontrol ediliyor.'});
    await wait(140, context.signal);
    return {ok:true,runtime:this.name,mode:this.mode,intent:plan.intent,projectId:plan.projectId,
      runId:plan.runId,sideEffects:false,output:'Simülasyon tamamlandı. Harici işlem yapılmadı.',providerIds:['simulation']};
  }
}
