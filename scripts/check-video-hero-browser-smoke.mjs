import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, normalize, resolve } from "node:path";
import { tmpdir } from "node:os";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const SCREENSHOT_DIR = join(ROOT, "dist", "qa", "video-hero-smoke");
const HOST = "127.0.0.1";
const DEBUG_HOST = "127.0.0.1";
const HERO_ROUTES = [
  { id: "nature", file: "nature.html", title: "Untamed Silence" },
  { id: "still-life", file: "still-life.html", title: "Objects in Quiet Light" },
  { id: "materials", file: "materials.html", title: "Tactile Memory" },
  { id: "metal-parts", file: "metal-parts.html", title: "Precision in Motion" }
];

const failures = [];
const notes = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".webmanifest")) return "application/manifest+json";
  return "application/octet-stream";
}

function createStaticServer() {
  return createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${HOST}`);
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    const relativePath = decodedPath === "/" ? "/index.html" : decodedPath;
    const filePath = normalize(join(WEB_ROOT, relativePath));

    if (!filePath.startsWith(WEB_ROOT)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentType(filePath) });
    response.end(readFileSync(filePath));
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate));
}

async function delay(ms) {
  await new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function fetchJsonWithRetry(url, options = {}, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(150);
  }

  throw lastError || new Error(`Timed out waiting for ${url}`);
}

class CdpClient {
  constructor(wsUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.ws = new WebSocket(wsUrl);
  }

  async open() {
    await new Promise((resolveOpen, rejectOpen) => {
      this.ws.addEventListener("open", resolveOpen, { once: true });
      this.ws.addEventListener("error", rejectOpen, { once: true });
    });

    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolvePending, rejectPending } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) {
          rejectPending(new Error(`${message.error.message}: ${message.error.data || ""}`));
        } else {
          resolvePending(message.result || {});
        }
        return;
      }
      if (message.method) this.events.push(message);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolvePending, rejectPending) => {
      this.pending.set(id, { resolvePending, rejectPending });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        rejectPending(new Error(`CDP command timed out: ${method}`));
      }, 10000);
    });
  }

  close() {
    this.ws.close();
  }
}

async function newTab(debugPort) {
  await fetchJsonWithRetry(`http://${DEBUG_HOST}:${debugPort}/json/version`);
  const target = await fetchJsonWithRetry(`http://${DEBUG_HOST}:${debugPort}/json/new?about:blank`, { method: "PUT" });
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.open();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Log.enable");
  await client.send("Network.enable");
  return client;
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true
  });

  if (result.exceptionDetails) {
    throw new Error(`Evaluation failed: ${result.exceptionDetails.text}`);
  }

  return result.result?.value;
}

async function goto(client, url) {
  const startIndex = client.events.length;
  await client.send("Page.navigate", { url });
  const deadline = Date.now() + 12000;

  while (Date.now() < deadline) {
    if (client.events.slice(startIndex).some((event) => event.method === "Page.loadEventFired")) return;
    await delay(100);
  }

  throw new Error(`Timed out loading ${url}`);
}

async function screenshot(client, name) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  const file = join(SCREENSHOT_DIR, name);
  writeFileSync(file, Buffer.from(result.data, "base64"));
  return file;
}

async function clickSelector(client, selector) {
  const point = await evaluate(client, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
  })()`);

  if (!point || point.width <= 0 || point.height <= 0) {
    throw new Error(`Cannot click selector: ${selector}`);
  }

  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y, button: "none" });
  await client.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await client.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await delay(300);
}

const stateExpression = `(() => {
  const hero = document.querySelector('[data-video-hero]');
  const video = document.querySelector('[data-hero-video]');
  const title = document.querySelector('h1');
  const status = document.querySelector('[data-video-status]');
  const controls = [...document.querySelectorAll('[data-video-action]')].map((button) => ({
    action: button.getAttribute('data-video-action'),
    text: button.textContent.trim(),
    pressed: button.getAttribute('aria-pressed'),
    disabled: button.disabled
  }));
  return {
    pageTitle: document.title,
    h1: title?.textContent.trim() || '',
    heroFound: Boolean(hero),
    heroClasses: hero ? [...hero.classList].join(' ') : '',
    videoFound: Boolean(video),
    videoMuted: Boolean(video?.muted),
    videoLoop: Boolean(video?.loop),
    videoPaused: Boolean(video?.paused),
    videoReadyState: video?.readyState ?? -1,
    videoPreload: video?.getAttribute('preload') || '',
    videoSourceHost: video?.querySelector('source')?.src ? new URL(video.querySelector('source').src).host : '',
    status: status?.textContent.trim() || '',
    controlCount: controls.length,
    controls,
    ctaVisible: Boolean(document.querySelector('[data-smooth-scroll]')),
    storyFocused: document.activeElement?.id === 'story',
    scrollY: Math.round(window.scrollY),
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth
    },
    overlayText: document.body.textContent.includes('Unhandled Runtime Error') ||
      document.body.textContent.includes('Traceback') ||
      document.body.textContent.includes('Vite') ||
      document.body.textContent.includes('Webpack')
  };
})()`;

function validateRouteState(route, state, context) {
  ensure(state.h1 === route.title, `${context} ${route.id}: expected title ${route.title}, got ${state.h1}`);
  ensure(state.heroFound, `${context} ${route.id}: hero container missing`);
  ensure(state.videoFound, `${context} ${route.id}: video element missing`);
  ensure(state.videoMuted, `${context} ${route.id}: video should be muted by default`);
  ensure(state.videoLoop, `${context} ${route.id}: video should loop`);
  ensure(state.videoPreload === "metadata", `${context} ${route.id}: video preload must be metadata`);
  ensure(state.videoSourceHost === "videos.pexels.com", `${context} ${route.id}: unexpected video host ${state.videoSourceHost}`);
  ensure(state.controlCount === 3, `${context} ${route.id}: expected 3 video controls, got ${state.controlCount}`);
  ensure(state.ctaVisible, `${context} ${route.id}: CTA is not visible`);
  ensure(!state.horizontalOverflow, `${context} ${route.id}: horizontal overflow detected`);
  ensure(!state.overlayText, `${context} ${route.id}: framework/error overlay text detected`);
}

function collectRelevantIssues(events) {
  return events
    .filter((event) => (
      (event.method === "Log.entryAdded" && ["error", "warning"].includes(event.params?.entry?.level)) ||
      (event.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(event.params?.type)) ||
      (event.method === "Network.loadingFailed" && !String(event.params?.errorText || "").includes("ERR_ABORTED"))
    ))
    .map((event) => {
      if (event.method === "Log.entryAdded") {
        return {
          level: event.params.entry.level,
          text: event.params.entry.text,
          url: event.params.entry.url || ""
        };
      }
      return {
        level: event.params?.type || event.method,
        text: event.params?.args?.map((arg) => arg.value || arg.description || "").join(" ") || event.params?.errorText || "",
        url: event.params?.url || ""
      };
    })
    .filter((issue) => !issue.url.endsWith("/favicon.ico"));
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    throw new Error("No Chrome or Chromium executable found. Set CHROME_PATH to run the Video Hero browser smoke.");
  }

  rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const staticServer = createStaticServer();
  await new Promise((resolveListen) => staticServer.listen(0, HOST, resolveListen));
  const appPort = staticServer.address().port;
  const debugPort = 9223 + Math.floor(Math.random() * 300);
  const userDataDir = join(tmpdir(), `seis-video-hero-chrome-${Date.now()}`);
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--autoplay-policy=no-user-gesture-required",
    "about:blank"
  ], { stdio: "ignore" });

  let client;

  try {
    client = await newTab(debugPort);
    const baseUrl = `http://${HOST}:${appPort}/showcase`;
    const desktop = [];
    const mobile = [];

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false
    });

    for (const route of HERO_ROUTES) {
      await goto(client, `${baseUrl}/${route.file}`);
      await delay(900);
      const state = await evaluate(client, stateExpression);
      validateRouteState(route, state, "desktop");
      desktop.push({ id: route.id, screenshot: await screenshot(client, `${route.id}-desktop.png`), readyState: state.videoReadyState });
    }

    await goto(client, `${baseUrl}/nature.html`);
    await delay(900);
    const beforeInteraction = await evaluate(client, stateExpression);
    await clickSelector(client, '[data-video-action="toggle-play"]');
    const afterPlay = await evaluate(client, stateExpression);
    await clickSelector(client, '[data-video-action="toggle-mute"]');
    const afterMute = await evaluate(client, stateExpression);
    await clickSelector(client, '[data-smooth-scroll]');
    await delay(900);
    const afterCta = await evaluate(client, stateExpression);
    const interactionScreenshot = await screenshot(client, "nature-after-interactions.png");

    await goto(client, `${baseUrl}/nature.html`);
    await delay(900);
    await clickSelector(client, '[data-video-action="fullscreen"]');
    const afterFullscreen = await evaluate(client, stateExpression);
    const fullscreenActive = await evaluate(client, "Boolean(document.fullscreenElement)");
    if (fullscreenActive) {
      await client.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Escape",
        code: "Escape",
        windowsVirtualKeyCode: 27
      });
      await delay(300);
    }

    ensure(beforeInteraction.controlCount === 3, "interaction: Nature controls were not present before testing");
    ensure(afterPlay.controls.some((control) => control.action === "toggle-play" && control.text === "Play" && control.pressed === "false"), "interaction: play/pause control did not toggle to Play");
    ensure(afterMute.controls.some((control) => control.action === "toggle-mute" && control.text === "Mute" && control.pressed === "true"), "interaction: mute control did not toggle to Mute");
    ensure(afterCta.scrollY > 100 || afterCta.storyFocused, "interaction: CTA did not scroll/focus the story section");
    ensure(afterFullscreen.status === "Entered fullscreen." || fullscreenActive, "interaction: fullscreen did not report activation");
    ensure(fullscreenActive, "interaction: fullscreen did not activate");

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    for (const route of HERO_ROUTES) {
      await goto(client, `${baseUrl}/${route.file}`);
      await delay(700);
      const state = await evaluate(client, stateExpression);
      validateRouteState(route, state, "mobile");
      mobile.push({ id: route.id, screenshot: await screenshot(client, `${route.id}-mobile.png`), readyState: state.videoReadyState });
    }

    await client.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }]
    });
    await goto(client, `${baseUrl}/materials.html`);
    await delay(700);
    const reducedMotion = await evaluate(client, stateExpression);
    const reducedScreenshot = await screenshot(client, "materials-reduced-motion.png");

    ensure(reducedMotion.reducedMotion, "reduced-motion: media query was not emulated");
    ensure(reducedMotion.videoPaused, "reduced-motion: video should be paused");
    ensure(reducedMotion.heroClasses.includes("is-reduced-motion"), "reduced-motion: hero class missing");

    const relevantIssues = collectRelevantIssues(client.events);
    ensure(relevantIssues.length === 0, `browser console/network issues detected: ${JSON.stringify(relevantIssues)}`);

    if (failures.length > 0) {
      console.error("Video Hero browser smoke failed:");
      for (const failure of failures) console.error(`- ${failure}`);
      process.exitCode = 1;
      return;
    }

    const summary = {
      ok: true,
      browser: chromePath,
      appPort,
      screenshotDir: resolve(SCREENSHOT_DIR),
      desktop,
      mobile,
      interaction: {
        playTextAfterClick: afterPlay.controls.find((control) => control.action === "toggle-play")?.text,
        muteTextAfterClick: afterMute.controls.find((control) => control.action === "toggle-mute")?.text,
        fullscreenActiveAfterClick: fullscreenActive,
        fullscreenStatusAfterClick: afterFullscreen.status,
        scrollYAfterCta: afterCta.scrollY,
        storyFocusedAfterCta: afterCta.storyFocused,
        screenshot: interactionScreenshot
      },
      reducedMotion: {
        reducedMotion: reducedMotion.reducedMotion,
        videoPaused: reducedMotion.videoPaused,
        screenshot: reducedScreenshot
      },
      notes
    };

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    if (client) client.close();
    chrome.kill("SIGTERM");
    staticServer.close();
    setTimeout(() => rmSync(userDataDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 }), 500);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
