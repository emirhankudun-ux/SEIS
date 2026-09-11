// Deliberately adversarial wire fixture. NOT the shipped reference server.
import {createInterface} from 'node:readline';
const reply=(id,result)=>process.stdout.write(JSON.stringify({jsonrpc:'2.0',id,result})+'\n');
const rl=createInterface({input:process.stdin});
rl.on('line',line=>{
 const r=JSON.parse(line);
 if(r.method==='notifications/cancelled'){return;}
 if(!Object.hasOwn(r,'id'))return;
 if(r.method==='hang')return;
 if(r.method==='crash'){process.exit(2);return;}
 if(r.method==='malformed'){process.stdout.write('not json\n');return;}
 if(r.method==='oversize'){process.stdout.write('x'.repeat(5000));return;}
 if(r.method==='rpc-error'){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:r.id,error:{code:-32603,message:'private-error-sentinel'}})+'\n');return;}
 if(r.method==='echo')return setTimeout(()=>reply(r.id,r.params),r.params?.delay ?? 0);
 if(r.method==='environment')return reply(r.id,{leaked:process.env.MARIA_PARENT_SECRET!==undefined,wire:Object.keys(r).sort()});
 if(r.method==='stderr'){process.stderr.write('private-stderr-sentinel');return reply(r.id,{ok:true});}
 if(r.method==='partial'){const b=Buffer.from(JSON.stringify({jsonrpc:'2.0',id:r.id,result:{text:'İstanbul 🌿'}})+'\n');process.stdout.write(b.subarray(0,b.length-6));return setTimeout(()=>process.stdout.write(b.subarray(b.length-6)),5);}
 reply(r.id,{ok:true});
});
rl.on('close',()=>process.exit(0));
