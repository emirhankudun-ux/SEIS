/** Explicit local host entry point. Does not enable browser tools or import ChatGPT credentials. */
import {lstatSync,openSync,readSync,fstatSync,closeSync,constants} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {createStdioTransport} from './stdioTransport.mjs';
import {createMcpAdapter} from '../src/adapters/mcpClient.js';
import {createHostAdapterManager} from '../src/adapters/hostAdapter.js';
import {LiveRuntimeAdapter} from '../src/adapters/liveRuntime.js';
import {verifyLiveReceipt} from '../src/core/verification.js';

const home=dirname(fileURLToPath(import.meta.url));
// Independent parent-side observation, not copied from the child's asserted result.
function observe(root){
  const path=join(root,'package.json'),entry=lstatSync(path),limit=262144;
  if(!entry.isFile()||entry.isSymbolicLink()||entry.size>limit)throw new Error('package-rejected');
  const fd=openSync(path,constants.O_RDONLY|(constants.O_NOFOLLOW??0)|(constants.O_NONBLOCK??0));
  try{
    const stat=fstatSync(fd);if(!stat.isFile()||stat.size>limit)throw new Error('package-rejected');
    const buffer=Buffer.alloc(limit+1);let length=0;
    while(length<buffer.length){const n=readSync(fd,buffer,length,buffer.length-length,null);if(n===0)break;length+=n;}
    if(length>limit)throw new Error('package-rejected');
    const bytes=buffer.subarray(0,length),pkg=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
    if(!pkg||typeof pkg!=='object'||Array.isArray(pkg))throw new Error('package-rejected');
    return {name:typeof pkg.name==='string'&&pkg.name.length<=160?pkg.name:null,
      version:typeof pkg.version==='string'&&pkg.version.length<=160?pkg.version:null,
      bytes:length,sha256:createHash('sha256').update(bytes).digest('hex')};
  }finally{closeSync(fd);}
}
export async function runPackageCheck({root=resolve(home,'..'),signal}={}){
  let wire,manager;let report={status:'failed',scope:'local-package-inspection',transport:'stdio'};
  try{
    if(signal?.aborted)throw new Error('aborted');
    root=resolve(root);const expected=observe(root);
    wire=createStdioTransport({command:process.execPath,args:[join(home,'packageServer.mjs'),root],cwd:root});
    const client=createMcpAdapter({protocolVersion:'2025-06-18',transport:wire.send,
      authorizeTool:({request})=>request.tool==='package.inspect'&&request.intent==='package-inspect'&&Object.keys(request.arguments??{}).length===0,
      verifyResult:({result})=>{
        const data=result.structuredContent, fresh=observe(root);
        return data&&Object.keys(data).sort().join(',')==='bytes,name,sha256,version'
          && Object.keys(expected).every(key=>data[key]===expected[key]&&data[key]===fresh[key])
          && result.content.length===1&&JSON.stringify(JSON.parse(result.content[0].text))===JSON.stringify(data);
      }});
    // Fixed host-approved operation; natural language or model output cannot choose a tool/path here.
    const adapter=Object.freeze({...client,execute:(payload,ctx)=>client.execute({...payload,tool:'package.inspect',arguments:{}},ctx)});
    manager=createHostAdapterManager();manager.register(adapter);
    const state=await manager.connect('mcp',{signal});
    if(state.status!=='ready'||!state.healthVerified)throw new Error('connection-failed');
    const runtime=new LiveRuntimeAdapter({manager,intentCapabilities:{'package-inspect':'tool-call'}});
    const plan=Object.freeze({runId:randomUUID(),projectId:'seis',intent:'package-inspect',command:'Inspect this package manifest'});
    const receipt=await runtime.execute(plan,null,{signal,providers:[{id:'mcp'}]});
    const verification=verifyLiveReceipt(receipt,{...plan,providerId:'mcp'});
    report={status:verification.verified?'verified':'unverified',scope:'local-package-inspection',transport:'stdio',
      server:'maria-package-inspector',package:receipt.result?.structuredContent??null,
      verification:{verified:verification.verified,providerId:receipt.providerId,runId:receipt.runId,evidence:verification.evidence}};
  }catch{report.reason=signal?.aborted?'cancelled':'package-check-failed';}
  finally{
    if(manager)await manager.disconnect('mcp');
    report.cleanup=wire?await wire.close():{closed:true};
    if(!report.cleanup.closed)report.status='unverified';
  }
  return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.length>2){console.error('No CLI arguments accepted. This command inspects its own package.json only.');process.exitCode=2;}
  else{
    const controller=new AbortController(),abort=()=>controller.abort();
    process.once('SIGINT',abort);process.once('SIGTERM',abort);
    const result=await runPackageCheck({signal:controller.signal});
    process.removeListener('SIGINT',abort);process.removeListener('SIGTERM',abort);
    console.log(JSON.stringify(result,null,2));process.exitCode=result.status==='verified'?0:1;
  }
}
