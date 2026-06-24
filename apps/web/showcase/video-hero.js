const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

const hero = document.querySelector("[data-video-hero]");
const video = document.querySelector("[data-hero-video]");
const statusNode = document.querySelector("[data-video-status]");
const playButton = document.querySelector('[data-video-action="toggle-play"]');
const muteButton = document.querySelector('[data-video-action="toggle-mute"]');
const fullscreenButton = document.querySelector('[data-video-action="fullscreen"]');
const savePosterButton = document.querySelector('[data-video-action="save-poster"]');
const scrollLinks = document.querySelectorAll("[data-smooth-scroll]");
const preloadTargets = document.querySelectorAll("[data-next-video]");
const SEIS_CODE_WORKSPACE_DB_NAME = "seis-code-workspace-v1";
const SEIS_CODE_WORKSPACE_DB_VERSION = 1;
const SEIS_VIDEO_POSTER_DIR = "/workspace/Pictures";
const SEIS_CODE_WORKSPACE_CHANNEL = "seis-code-workspace";

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

function slugify(value) {
  return String(value || "video-hero")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "video-hero";
}

function basename(path) {
  return path.replace(/\/+$/, "").split("/").pop() || "/";
}

function dirname(path) {
  const clean = path.replace(/\/+$/, "");
  const index = clean.lastIndexOf("/");
  return index <= 0 ? "/" : clean.slice(0, index);
}

function createWorkspaceEntry(path, content = "", type = "file") {
  const now = new Date().toISOString();
  return {
    path,
    name: basename(path),
    parent: dirname(path),
    type,
    content: type === "file" ? content : "",
    language: type === "file" ? "json" : "",
    createdAt: now,
    updatedAt: now,
    baseContent: type === "file" ? content : ""
  };
}

function openCodeWorkspaceDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB unavailable."));
      return;
    }

    const request = indexedDB.open(SEIS_CODE_WORKSPACE_DB_NAME, SEIS_CODE_WORKSPACE_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("files")) database.createObjectStore("files", { keyPath: "path" });
      if (!database.objectStoreNames.contains("settings")) database.createObjectStore("settings", { keyPath: "key" });
      if (!database.objectStoreNames.contains("history")) database.createObjectStore("history", { keyPath: "id", autoIncrement: true });
      if (!database.objectStoreNames.contains("extensions")) database.createObjectStore("extensions", { keyPath: "id" });
      if (!database.objectStoreNames.contains("commits")) database.createObjectStore("commits", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function putWorkspaceEntry(database, entry) {
  return new Promise((resolve, reject) => {
    const tx = database.transaction("files", "readwrite");
    tx.objectStore("files").put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function saveVideoPoster() {
  const title = document.querySelector(".video-hero__title")?.textContent?.trim() || document.title || "Video Hero";
  const theme = document.body.className.replace(/^theme-/, "").replaceAll("-", " ") || "showcase";
  const videoUrl = video?.currentSrc || video?.querySelector("source")?.src || "";
  const sourcePage = document.querySelector("link[rel='canonical']")?.href || window.location.href;
  const record = {
    kind: "seis-video-hero-poster",
    title,
    theme,
    sourcePage,
    videoUrl,
    posterMode: "css-fallback-plus-runtime-video-frame",
    note: "Saved from a SEIS Video Hero page without storing the remote video binary.",
    savedAt: new Date().toISOString()
  };
  const filename = `${slugify(title)}-poster.json`;
  const workspacePath = `${SEIS_VIDEO_POSTER_DIR}/${filename}`;
  const payload = JSON.stringify(record, null, 2);

  if (savePosterButton) {
    savePosterButton.disabled = true;
    savePosterButton.textContent = "Saving";
  }

  try {
    const database = await openCodeWorkspaceDatabase();
    await putWorkspaceEntry(database, createWorkspaceEntry("/workspace", "", "directory"));
    await putWorkspaceEntry(database, createWorkspaceEntry(SEIS_VIDEO_POSTER_DIR, "", "directory"));
    await putWorkspaceEntry(database, createWorkspaceEntry(workspacePath, payload));
    database.close();

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(SEIS_CODE_WORKSPACE_CHANNEL);
      channel.postMessage({ type: "workspace-file-created", path: workspacePath, source: "video-hero" });
      channel.close();
    }

    setStatus(`Poster record saved to ${workspacePath}.`);
  } catch (_error) {
    localStorage.setItem("seis-video-hero-poster-fallback", payload);
    setStatus("Poster record saved to local fallback storage. IndexedDB workspace is unavailable.");
  } finally {
    if (savePosterButton) {
      savePosterButton.disabled = false;
      savePosterButton.textContent = "Save Poster";
    }
  }
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

  if (savePosterButton) {
    savePosterButton.addEventListener("click", () => {
      void saveVideoPoster();
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
