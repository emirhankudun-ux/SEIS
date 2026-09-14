import fs from 'node:fs';
const required=['index.html','src/app.js','src/styles.css','src/core/orchestrator.js','src/adapters/runtime.js'];
for(const f of required){ if(!fs.existsSync(new URL(`../${f}`, import.meta.url))) throw new Error(`Missing ${f}`); }
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
for(const id of ['commandInput','orb','settingsSheet']){ if(!html.includes(`id="${id}"`) && !html.includes(`class="${id}"`)) throw new Error(`Missing UI hook ${id}`); }
console.log('smoke: ok');
