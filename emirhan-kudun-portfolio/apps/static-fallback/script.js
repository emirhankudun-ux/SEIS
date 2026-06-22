(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  hero.dataset.readyAt = new Date().toISOString();
})();
