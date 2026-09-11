const listeners = new Set();
const state = {
  projectId:'deadly-evil', mode:'Auto', systemState:'READY', listening:false, vision:false, busy:false,
  settings:{ localFirst:true, wakeWord:true, ambient:false, autoVerify:true, safeMode:true, communityPlugins:true },
  activity:{ agent:'MARIA', title:'System ready', body:'Waiting for a natural-language command.', progress:100, result:'Ready', tone:'green' }
};
export const store = {
  get:()=>structuredClone(state),
  set(patch){ Object.assign(state,patch); listeners.forEach(fn=>fn(this.get())); },
  update(key,value){ state[key]=value; listeners.forEach(fn=>fn(this.get())); },
  subscribe(fn){ listeners.add(fn); fn(this.get()); return ()=>listeners.delete(fn); }
};
