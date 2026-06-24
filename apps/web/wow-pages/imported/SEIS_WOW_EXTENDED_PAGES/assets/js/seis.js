
document.querySelectorAll('[data-open]').forEach(btn=>{
  btn.addEventListener('click',()=>alert('SEIS demo interaction: '+btn.dataset.open));
});
document.querySelectorAll('.dock button,.nav-item,.app-icon,.folder,.button').forEach(el=>{
  el.addEventListener('click', e=>{
    el.animate([{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:180});
  });
});
