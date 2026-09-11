import { settings } from '../data/registry.js';
const listeners = new Set();
const state = {
  projectId:'deadly-evil', mode:'Auto', systemState:'READY', message:null,
  listening:false, vision:false, busy:false,
  settings:{...Object.fromEntries(settings.map(item => [item.id,item.enabled])),executionMode:'simulation'},
  activity:{agent:'MARIA',title:'Simülasyon hazır',body:'Gerçek araç bağlantısı yok. Bir iş akışını simüle edebilirsin.',progress:0,result:'Harici işlem yok',tone:'amber'}
};
export const store = {
  get:() => structuredClone(state),
  set(patch) { Object.assign(state,patch); for (const fn of listeners) fn(this.get()); },
  update(key,value) { this.set({[key]:value}); },
  subscribe(fn) { listeners.add(fn); fn(this.get()); return () => listeners.delete(fn); }
};
