import test from 'node:test';
import assert from 'node:assert/strict';
import { createPluginHost } from '../src/plugins/host.js';

test('plugin timeout bounds factory initialization and signals cooperative abort', async () => {
  let abortSeen=false;
  const host=createPluginHost({apiVersion:'2',timeoutMs:15});
  host.register({id:'hung-factory',name:'Hung factory',version:'1.0.0',apiVersion:'2',capabilities:['inspect'],permissions:[],risk:'observe'},
    ({signal})=>new Promise(resolve=>{
      signal?.addEventListener('abort',()=>{ abortSeen=true; resolve({inspect:()=> 'too-late'}); },{once:true});
    }));
  const result=await Promise.race([
    host.invoke('hung-factory','inspect',{}),
    new Promise(resolve=>setTimeout(()=>resolve({status:'test-timeout'}),60))
  ]);
  assert.equal(result.status,'failed');
  assert.equal(result.reason,'plugin-timeout');
  assert.equal(abortSeen,true);
});

test('plugin timeout forwards an aborted invocation signal to capability code', async () => {
  let abortSeen=false;
  const host=createPluginHost({apiVersion:'2',timeoutMs:15});
  host.register({id:'cooperative-plugin',name:'Cooperative',version:'1.0.0',apiVersion:'2',capabilities:['inspect'],permissions:[],risk:'observe'},
    ()=>({inspect:(_input,{signal})=>new Promise(resolve=>{
      signal?.addEventListener('abort',()=>{ abortSeen=true; resolve('stopped'); },{once:true});
    })}));
  const result=await host.invoke('cooperative-plugin','inspect',{});
  assert.equal(result.status,'failed');
  assert.equal(result.reason,'plugin-timeout');
  assert.equal(abortSeen,true);
});

test('external cancellation bounds plugin invocation without waiting for timeout', async () => {
  const controller=new AbortController();
  const host=createPluginHost({apiVersion:'2',timeoutMs:500});
  host.register({id:'cancel-plugin',name:'Cancel',version:'1.0.0',apiVersion:'2',capabilities:['inspect'],permissions:[],risk:'observe'},
    ()=>({inspect:()=>new Promise(()=>{})}));
  const pending=host.invoke('cancel-plugin','inspect',{}, {signal:controller.signal});
  setTimeout(()=>controller.abort(),10);
  const result=await Promise.race([
    pending,
    new Promise(resolve=>setTimeout(()=>resolve({status:'test-timeout'}),80))
  ]);
  assert.equal(result.status,'cancelled');
  assert.equal(result.reason,'plugin-cancelled');
});
