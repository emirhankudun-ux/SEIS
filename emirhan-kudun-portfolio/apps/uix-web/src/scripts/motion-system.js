import { initArtworkGallery } from "./gallery-system.js";
import { initDevelopmentMode } from "./development-mode.js";
import { initEfficiencyGovernor } from "./efficiency-governor.js";
import { initHandoffSystem } from "./handoff-system.js";
import { initI18n, translateKey } from "./i18n-system.js";
import { initPwaSystem } from "./pwa-system.js";
import { initSystemPulse } from "./system-pulse.js";
import { initWeeklyUsageGovernor } from "./weekly-usage-governor.js";

const root = document.documentElement;
const body = document.body;
const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

root.classList.remove("no-js");
root.classList.add("js");

const motionState = {
  manualMode: readMotionMode(),
  get reduced() {
    return reduceQuery.matches || this.manualMode === "low";
  }
};

applyMotionMode(motionState.manualMode, false);
initLoader();
initI18n();
initPwaSystem();
initMotionToggle();
initSystemPulse();
initDevelopmentMode();
initEfficiencyGovernor();
initWeeklyUsageGovernor();
initHandoffSystem();
initArtworkGallery();
initReveal();
initDepthCards();
initTouchFeedback();
initAnchorTransitions();
initParallax();
initCinematicField();

function readMotionMode() {
  try {
    return window.localStorage.getItem("seis-motion-mode") === "low" ? "low" : "standard";
  } catch (_error) {
    return "standard";
  }
}

function persistMotionMode(mode) {
  try {
    window.localStorage.setItem("seis-motion-mode", mode);
  } catch (_error) {
    /* localStorage can be unavailable in strict browser modes. */
  }
}

function applyMotionMode(mode, persist = true) {
  const nextMode = mode === "low" ? "low" : "standard";
  motionState.manualMode = nextMode;
  root.dataset.motion = motionState.reduced ? "low" : "standard";
  const button = document.querySelector("[data-motion-toggle]");
  if (button) {
    const labelKey = motionState.reduced ? "motion.standard" : "motion.low";
    const pressed = motionState.reduced ? "true" : "false";
    button.setAttribute("aria-pressed", pressed);
    button.dataset.i18n = labelKey;
    button.textContent = translateKey(labelKey);
  }
  if (persist) {
    persistMotionMode(nextMode);
  }
}

function initLoader() {
  const delay = motionState.reduced ? 0 : 520;
  window.setTimeout(() => {
    body.classList.add("is-loaded");
  }, delay);
}

function initMotionToggle() {
  const button = document.querySelector("[data-motion-toggle]");
  if (!button) return;

  button.addEventListener("click", () => {
    applyMotionMode(motionState.manualMode === "low" ? "standard" : "low");
    revealAllWhenReduced();
  });

  reduceQuery.addEventListener("change", () => {
    applyMotionMode(motionState.manualMode, false);
    revealAllWhenReduced();
  });
}

function initReveal() {
  const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!nodes.length) return;

  if (motionState.reduced || !("IntersectionObserver" in window)) {
    nodes.forEach(node => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

  nodes.forEach(node => observer.observe(node));
}

function revealAllWhenReduced() {
  if (!motionState.reduced) return;
  document.querySelectorAll("[data-reveal]").forEach(node => node.classList.add("is-visible"));
}

function initDepthCards() {
  if (!finePointerQuery.matches) return;

  document.querySelectorAll("[data-depth-card]").forEach(card => {
    card.addEventListener("pointermove", event => {
      if (motionState.reduced) return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `rotateX(${y * -5}deg) rotateY(${x * 6}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function initTouchFeedback() {
  const selectors = "a, button, [data-depth-card]";
  document.addEventListener("pointerdown", event => {
    if (!event.pointerType || event.pointerType === "mouse") return;
    const target = event.target.closest(selectors);
    if (!target) return;
    target.classList.add("touch-active");
    window.setTimeout(() => target.classList.remove("touch-active"), 140);
  }, { passive: true });
}

function initAnchorTransitions() {
  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    body.classList.add("is-transitioning");
    target.scrollIntoView({ behavior: motionState.reduced ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => body.classList.remove("is-transitioning"), 260);
  });
}

function initParallax() {
  const layers = Array.from(document.querySelectorAll(".hero__depth"));
  if (!layers.length) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    if (motionState.reduced) {
      layers.forEach(layer => layer.style.removeProperty("--scroll-shift"));
      return;
    }
    const shift = Math.min(window.scrollY * 0.025, 18);
    layers.forEach((layer, index) => {
      layer.style.translate = `0 ${shift * (index + 1) * 0.3}px`;
    });
  };

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });
}

function initCinematicField() {
  const canvas = document.querySelector("[data-cinematic-field]");
  if (!canvas) return;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const scene = {
    width: 0,
    height: 0,
    ratio: 1,
    particles: [],
    running: true,
    frame: 0
  };

  const resize = () => {
    scene.width = canvas.clientWidth;
    scene.height = canvas.clientHeight;
    scene.ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1 : 1.4);
    canvas.width = Math.max(1, Math.floor(scene.width * scene.ratio));
    canvas.height = Math.max(1, Math.floor(scene.height * scene.ratio));
    context.setTransform(scene.ratio, 0, 0, scene.ratio, 0, 0);
    seedParticles();
    draw(0);
  };

  const seedParticles = () => {
    const count = motionState.reduced ? 18 : (window.innerWidth < 720 ? 24 : 64);
    scene.particles = Array.from({ length: count }, (_item, index) => {
      const lane = index / count;
      return {
        x: scene.width * ((index * 0.618) % 1),
        y: scene.height * ((index * 0.381) % 1),
        z: 0.35 + (lane * 0.65),
        drift: 0.18 + (lane * 0.52),
        hue: index % 3
      };
    });
  };

  const draw = time => {
    context.clearRect(0, 0, scene.width, scene.height);
    context.fillStyle = "rgba(8, 10, 12, 0.84)";
    context.fillRect(0, 0, scene.width, scene.height);

    const horizon = scene.height * 0.56;
    context.strokeStyle = "rgba(245, 238, 224, 0.08)";
    context.lineWidth = 1;
    for (let i = 0; i < 9; i += 1) {
      const y = horizon + i * 34;
      context.beginPath();
      context.moveTo(scene.width * 0.08, y);
      context.lineTo(scene.width * 0.92, y + i * 5);
      context.stroke();
    }

    scene.particles.forEach(particle => {
      const movement = motionState.reduced ? 0 : Math.sin(time * 0.00035 * particle.drift + particle.x) * 18;
      const x = (particle.x + movement + scene.width) % scene.width;
      const y = particle.y + Math.cos(time * 0.00025 + particle.z) * 10;
      const radius = 1.2 + particle.z * 2.8;
      const colors = [
        "rgba(214, 177, 106, 0.52)",
        "rgba(98, 199, 184, 0.46)",
        "rgba(211, 106, 120, 0.34)"
      ];

      context.beginPath();
      context.fillStyle = colors[particle.hue];
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    });
  };

  const animate = time => {
    if (!scene.running) return;
    draw(time);
    scene.frame = window.requestAnimationFrame(animate);
  };

  const setRunning = running => {
    scene.running = running;
    if (running && !motionState.reduced) {
      scene.frame = window.requestAnimationFrame(animate);
    } else {
      window.cancelAnimationFrame(scene.frame);
      draw(0);
    }
  };

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    setRunning(document.visibilityState === "visible");
  });
  reduceQuery.addEventListener("change", () => {
    seedParticles();
    setRunning(!motionState.reduced);
  });

  resize();
  setRunning(!motionState.reduced);
}
