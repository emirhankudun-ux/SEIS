const root=document.documentElement;
const saved=localStorage.getItem('seis-theme');
if(saved)root.dataset.theme=saved;

document.querySelectorAll('.theme-toggle').forEach(b=>b.addEventListener('click',()=>{
  root.dataset.theme=root.dataset.theme==='light'?'dark':'light';
  localStorage.setItem('seis-theme',root.dataset.theme);
}));

const navToggle=document.querySelector('.nav-toggle'),nav=document.querySelector('.main-nav');
navToggle?.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded',String(open));
});

const layer=document.querySelector('.command-layer'),cmdInput=document.querySelector('.command-input input');
function openCommand(){layer?.classList.add('open');layer?.setAttribute('aria-hidden','false');setTimeout(()=>cmdInput?.focus(),30);}
function closeCommand(){layer?.classList.remove('open');layer?.setAttribute('aria-hidden','true');}
document.querySelectorAll('.command-open').forEach(b=>b.addEventListener('click',openCommand));
layer?.addEventListener('click',e=>{if(e.target===layer)closeCommand();});
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand();}
  if(e.key==='Escape')closeCommand();
});

const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('in');obs.unobserve(entry.target);}
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

document.querySelectorAll('[data-tabs]').forEach(shell=>{
  const buttons=[...shell.querySelectorAll('[data-tab]')],panels=[...shell.querySelectorAll('.tab-panel')];
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    buttons.forEach(b=>b.classList.remove('active'));
    panels.forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    shell.querySelector('#'+btn.dataset.tab)?.classList.add('active');
  }));
});

document.querySelectorAll('[data-filter]').forEach(bar=>{
  const target=bar.dataset.target||'.studio-grid';
  const grid=document.querySelector(target)||bar.closest('section')?.querySelector('.studio-grid');
  bar.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
    bar.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const value=btn.dataset.filterValue;
    grid?.querySelectorAll('[data-type]').forEach(card=>{
      card.style.display=value==='all'||card.dataset.type===value?'':'none';
    });
  }));
});

document.querySelectorAll('.video-trigger').forEach(btn=>btn.addEventListener('click',()=>{
  openCommand();
  if(cmdInput)cmdInput.placeholder='Product tour: open prototype, studio and workflow scenes…';
}));

const hdr=document.querySelector('.site-header');
if(hdr){window.addEventListener('scroll',()=>hdr.classList.toggle('elevated',window.scrollY>20),{passive:true});}

const yearEl=document.querySelector('.year');
if(yearEl)yearEl.textContent=new Date().getFullYear();
