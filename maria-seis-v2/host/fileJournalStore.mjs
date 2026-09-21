import { closeSync, constants, existsSync, fstatSync, lstatSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

function validateTarget(filePath,maxBytes){
  if (!path.isAbsolute(filePath)) throw new TypeError('journal file path must be absolute');
  if (!Number.isInteger(maxBytes) || maxBytes<1024 || maxBytes>1048576) throw new TypeError('invalid journal maxBytes');
}

function inspect(filePath,maxBytes){
  if (!existsSync(filePath)) return null;
  const stat=lstatSync(filePath);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('journal-file-unsafe');
  if (stat.size>maxBytes) throw new Error('journal-file-too-large');
  return stat;
}

export function createFileJournalStore({filePath,maxBytes=262144}={}){
  validateTarget(filePath,maxBytes);
  const resolved=path.resolve(filePath);
  return Object.freeze({
    read(){
      const stat=inspect(resolved,maxBytes);
      if (!stat) return null;
      const flags=constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0);
      let fd;
      try {
        fd=openSync(resolved,flags);
        const opened=fstatSync(fd);
        if (!opened.isFile() || opened.size>maxBytes) throw new Error(opened.size>maxBytes?'journal-file-too-large':'journal-file-unsafe');
        const value=readFileSync(fd,'utf8');
        if (Buffer.byteLength(value,'utf8')>maxBytes) throw new Error('journal-file-too-large');
        return value;
      } finally { if (fd!==undefined) closeSync(fd); }
    },
    write(value){
      if (typeof value!=='string') throw new TypeError('journal value must be text');
      if (Buffer.byteLength(value,'utf8')>maxBytes) throw new Error('journal-file-too-large');
      inspect(resolved,maxBytes);
      const temp=`${resolved}.${process.pid}.${randomUUID()}.tmp`;
      try {
        writeFileSync(temp,value,{encoding:'utf8',mode:0o600,flag:'wx'});
        renameSync(temp,resolved);
      } catch (error) {
        try { unlinkSync(temp); } catch {}
        throw error;
      }
    },
    filePath:resolved,
    maxBytes
  });
}
