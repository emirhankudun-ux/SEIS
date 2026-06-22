const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

const hero = document.querySelector("[data-video-hero]");
const video = document.querySelector("[data-hero-video]");
const statusNode = document.querySelector("[data-video-status]");
const playButton = document.querySelector('[data-video-action="toggle-play"]');
const muteButton = document.querySelector('[data-video-action="toggle-mute"]');
const fullscreenButton = document.querySelector('[data-video-action="fullscreen"]');
const scrollLinks = document.querySelectorAll("[data-smooth-scroll]");
const preloadTargets = document.querySelectorAll("[data-next-video]");

const state = {
  userPaused: false,
  heroVisible: true,
  reduced: motionPreference.matches,
  nextPreloaded: false
};

function setStatus(message) {
  if (statusNode) statusNode.textContent = message;
}

function setHeroState(name, active) {
  if (hero) hero.classList.toggle(name, active);
}

async function requestPlayback(reason = "requested") {
  if (!video || state.reduced || state.userPaused || !state.heroVisible) return;

  try {
    await video.play();
    setStatus(reason === "resumed" ? "Video resumed." : "Video playing.");
    updateControls();
  } catch (_error) {
    setHeroState("is-autoplay-blocked", true);
    setStatus("Autoplay is blocked. Use play to start the background video.");
    updateControls();
  }
}

function pausePlayback(message = "Video paused.") {
  if (!video) return;
  video.pause();
  setStatus(message);
  updateControls();
}

function updateControls() {
  if (!video) return;

  const playing = !video.paused && !video.ended;
  setHeroState("is-video-ready", video.readyState >= 2);
  setHeroState("is-video-playing", playing);

  if (playButton) {
    playButton.textContent = playing ? "Pause" : "Play";
    playButton.setAttribute("aria-pressed", playing ? "true" : "false");
  }

  if (muteButton) {
    muteButton.textContent = video.muted ? "Sound" : "Mute";
    muteButton.setAttribute("aria-pressed", video.muted ? "false" : "true");
  }
}

function setupVideoEvents() {
  if (!video) return;

  video.addEventListener("loadstart", () => {
    setHeroState("is-loading", true);
    setStatus("Loading video background.");
  });

  video.addEventListener("loadedmetadata", () => {
    setStatus("Video metadata loaded.");
  });

  video.addEventListener("canplay", () => {
    setHeroState("is-loading", false);
    setHeroState("is-video-ready", true);
    requestPlayback();
  });

  video.addEventListener("playing", updateControls);
  video.addEventListener("pause", updateControls);

  video.addEventListener("error", () => {
    setHeroState("is-loading", false);
    setHeroState("is-video-error", true);
    setStatus("Video unavailable. Showing the optimized still fallback.");
    updateControls();
  });
}

function setupControls() {
  if (playButton && video) {
    playButton.addEventListener("click", () => {
      if (video.paused) {
        state.userPaused = false;
        requestPlayback("resumed");
      } else {
        state.userPaused = true;
        pausePlayback("Video paused by viewer.");
      }
    });
  }

  if (muteButton && video) {
    muteButton.addEventListener("click", () => {
      video.muted = !video.muted;
      setStatus(video.muted ? "Video muted." : "Video sound enabled.");
      updateControls();
    });
  }

  if (fullscreenButton && hero) {
    fullscreenButton.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          setStatus("Exited fullscreen.");
          return;
        }
        await hero.requestFullscreen();
        setStatus("Entered fullscreen.");
      } catch (_error) {
        setStatus("Fullscreen is unavailable in this browser context.");
      }
    });
  }
}

function setupVisibilityControls() {
  if (!video) return;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      pausePlayback("Video paused while the page is hidden.");
      return;
    }
    requestPlayback("resumed");
  });

  if (!("IntersectionObserver" in window) || !hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      state.heroVisible = entry.isIntersecting;
      if (!entry.isIntersecting) {
        pausePlayback("Video paused outside the hero viewport.");
        return;
      }
      requestPlayback("resumed");
    },
    { threshold: 0.42 }
  );

  observer.observe(hero);
}

function setupReducedMotion() {
  const applyPreference = () => {
    state.reduced = motionPreference.matches;
    setHeroState("is-reduced-motion", state.reduced);

    if (state.reduced) {
      state.userPaused = true;
      pausePlayback("Motion reduced by system preference.");
    } else {
      state.userPaused = false;
      requestPlayback("resumed");
    }
  };

  motionPreference.addEventListener("change", applyPreference);
  applyPreference();
}

function setupSmoothScroll() {
  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: false });
      target.scrollIntoView({ behavior: state.reduced ? "auto" : "smooth", block: "start" });
    });
  });
}

function setupNextVideoPreload() {
  preloadTargets.forEach((target) => {
    const preload = () => {
      if (state.nextPreloaded || !target.dataset.nextVideo) return;
      state.nextPreloaded = true;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = target.dataset.nextVideo;
      document.head.append(link);
    };

    target.addEventListener("pointerenter", preload);
    target.addEventListener("focus", preload);
    target.addEventListener("touchstart", preload, { passive: true });
  });
}

function init() {
  setHeroState("is-loading", true);
  setupVideoEvents();
  setupControls();
  setupVisibilityControls();
  setupReducedMotion();
  setupSmoothScroll();
  setupNextVideoPreload();
  updateControls();
}

init();
