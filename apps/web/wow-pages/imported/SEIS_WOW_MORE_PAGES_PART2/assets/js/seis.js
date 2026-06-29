
document.querySelectorAll('[data-action],.dock button,.nav-item,.button,.card').forEach(el=>{
  el.addEventListener('click',()=>{
    el.animate([{transform:'scale(1)'},{transform:'scale(.97)'},{transform:'scale(1)'}],{duration:180});
  });
});
