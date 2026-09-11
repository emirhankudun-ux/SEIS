export class LiveRuntimeAdapter {
  name='host-runtime-v1';
  mode='live';
  constructor({manager,intentCapabilities={}}={}) {
    if (!manager || typeof manager.execute!=='function' || typeof manager.get!=='function') throw new TypeError('manager required');
    this.manager=manager;
    this.intentCapabilities={...intentCapabilities};
  }
  async execute(plan,onProgress,context={}) {
    const provider=context.providers?.[0];
    if (!provider?.id) throw new Error('provider required');
    const capability=this.intentCapabilities[plan.intent];
    if (!capability) throw new Error('intent capability unavailable');
    onProgress?.({stage:'acting',progress:60,message:`${provider.id} üzerinden canlı yürütme başlatıldı.`});
    const outcome=await this.manager.execute(provider.id,capability,{command:plan.command,projectId:plan.projectId,runId:plan.runId,intent:plan.intent},{signal:context.signal});
    if (outcome.status!=='ok') throw new Error('host execution failed');
    const receipt=outcome.result ?? {};
    return {
      ...receipt,
      ok:receipt.ok===true,
      runtime:this.name,
      mode:this.mode,
      providerId:provider.id,
      runId:plan.runId,
      projectId:plan.projectId,
      intent:plan.intent,
      evidence:Array.isArray(receipt.evidence)?receipt.evidence:[],
      outcomeVerified:receipt.outcomeVerified===true
    };
  }
}
