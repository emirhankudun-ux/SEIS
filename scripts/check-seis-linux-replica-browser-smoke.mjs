import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, normalize } from "node:path";
import { tmpdir } from "node:os";
import vm from "node:vm";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const SCREENSHOT_DIR = join(ROOT, "dist", "qa", "seis-linux-replica-smoke");
const REPORT_FILE = join(SCREENSHOT_DIR, "summary.json");
const HOST = "127.0.0.1";
const DEBUG_HOST = "127.0.0.1";
const failures = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".ico")) return "image/x-icon";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webmanifest")) return "application/manifest+json";
  return "application/octet-stream";
}

function createStaticServer() {
  return createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${HOST}`);
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    const relativePath = decodedPath === "/" ? "/seis-linux-replica.html" : decodedPath;
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

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function removeDirectoryWithRetries(directory) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      rmSync(directory, { recursive: true, force: true });
      return;
    } catch (error) {
      if (!existsSync(directory)) return;
      if (attempt === 5) {
        console.warn(`Warning: could not remove temporary Chrome profile ${directory}: ${error.code || error.message}`);
        return;
      }
      await delay(250 * (attempt + 1));
    }
  }
}

async function fetchJsonWithRetry(url, options = {}, timeoutMs = 15000) {
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

  const message = lastError?.message || "timed out";
  throw new Error(`Timed out waiting for ${url}: ${message}`);
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
        if (message.error) rejectPending(new Error(`${message.error.message}: ${message.error.data || ""}`));
        else resolvePending(message.result || {});
        return;
      }
      if (message.method) this.events.push(message);
    });
  }

  send(method, params = {}, timeoutMs = 10000) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolvePending, rejectPending) => {
      this.pending.set(id, { resolvePending, rejectPending });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        rejectPending(new Error(`CDP command timed out: ${method}`));
      }, timeoutMs);
    });
  }

  close() {
    this.ws.close();
  }
}

async function newTab(debugPort) {
  await fetchJsonWithRetry(`http://${DEBUG_HOST}:${debugPort}/json/version`, {}, 30000);
  const target = await fetchJsonWithRetry(`http://${DEBUG_HOST}:${debugPort}/json/new?about:blank`, { method: "PUT" }, 30000);
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.open();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Log.enable");
  await client.send("Network.enable");
  return client;
}

async function evaluate(client, expression, timeoutMs = 10000) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true
  }, timeoutMs);

  if (result.exceptionDetails) {
    const detail = result.exceptionDetails.exception?.description
      || result.exceptionDetails.exception?.value
      || result.exceptionDetails.text;
    throw new Error(`Evaluation failed: ${detail}`);
  }

  return result.result?.value;
}

async function waitFor(client, expression, timeoutMs = 10000, intervalMs = 150) {
  const deadline = Date.now() + timeoutMs;
  let lastValue;

  while (Date.now() < deadline) {
    lastValue = await evaluate(client, expression);
    if (lastValue) return lastValue;
    await delay(intervalMs);
  }

  return lastValue;
}

async function goto(client, url) {
  await client.send("Page.navigate", { url }, 20000);
  const ready = await waitFor(client, "document.readyState === 'interactive' || document.readyState === 'complete'", 12000);
  if (!ready) throw new Error(`Timed out loading ${url}`);
}

async function screenshot(client, name) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  }, 30000);
  const file = join(SCREENSHOT_DIR, name);
  writeFileSync(file, Buffer.from(result.data, "base64"));
  return file;
}

function collectRelevantIssues(events) {
  return events
    .filter((event) => ["Runtime.exceptionThrown", "Log.entryAdded", "Network.loadingFailed"].includes(event.method))
    .map((event) => ({
      level: event.params?.entry?.level || event.params?.type || event.method,
      text: event.params?.entry?.text
        || event.params?.exceptionDetails?.text
        || event.params?.args?.map((arg) => arg.value || arg.description || "").join(" ")
        || event.params?.errorText
        || "",
      url: event.params?.entry?.url || event.params?.url || ""
    }))
    .filter((issue) => `${issue.text} ${issue.url}`.trim())
    .filter((issue) => !(issue.level === "Image" && issue.text === "net::ERR_ABORTED" && !issue.url))
    .filter((issue) => !`${issue.text} ${issue.url}`.includes("favicon"));
}

function validateStaticContract() {
  const routePath = "apps/web/seis-linux-replica.html";
  const capabilityAtlasPath = "apps/web/seis-runtime-capability-atlas.js";
  const capabilityAtlasSourcePath = "data/seis-runtime-capability-atlas.json";
  const referenceAppsPath = "apps/web/reference-banks/reference-apps.js";
  const routesPath = "apps/web/src/config/routes.json";
  const serviceWorkerPath = "apps/web/service-worker.js";
  const readmePath = "README.md";

  for (const file of [routePath, capabilityAtlasPath, capabilityAtlasSourcePath, referenceAppsPath, routesPath, serviceWorkerPath, readmePath]) {
    ensure(existsSync(file), `missing required file: ${file}`);
  }

  if (failures.length > 0) return;

  const html = readFileSync(routePath, "utf8");
  const capabilityAtlasAsset = readFileSync(capabilityAtlasPath, "utf8");
  const capabilityAtlasSource = JSON.parse(readFileSync(capabilityAtlasSourcePath, "utf8"));
  const referenceApps = readFileSync(referenceAppsPath, "utf8");
  const routes = readFileSync(routesPath, "utf8");
  const serviceWorker = readFileSync(serviceWorkerPath, "utf8");
  const readme = readFileSync(readmePath, "utf8");
  const baseCatalogBlock = html.match(/const BASE_APP_ENTRIES=\[([\s\S]*?)\n  \];/);
  const baseAppCount = baseCatalogBlock ? (baseCatalogBlock[1].match(/^\s+\["/gm) || []).length : 0;
  const referenceCount = (referenceApps.match(/"id":"ref-/g) || []).length;
  let referenceManifest = [];
  let capabilityAtlas = null;
  let routeConfig = null;

  try {
    const sandbox = { window: {} };
    vm.runInNewContext(referenceApps, sandbox, { timeout: 1000 });
    referenceManifest = Array.isArray(sandbox.window.SEIS_REFERENCE_APPS)
      ? sandbox.window.SEIS_REFERENCE_APPS
      : [];
  } catch (error) {
    ensure(false, `reference app manifest could not be evaluated: ${error.message}`);
  }
  try {
    const sandbox = { window: {} };
    vm.runInNewContext(capabilityAtlasAsset, sandbox, { timeout: 1000 });
    capabilityAtlas = sandbox.window.SEIS_RUNTIME_CAPABILITY_ATLAS || null;
  } catch (error) {
    ensure(false, `capability atlas asset could not be evaluated: ${error.message}`);
  }
  try {
    routeConfig = JSON.parse(routes);
  } catch (error) {
    ensure(false, `routes.json could not be parsed: ${error.message}`);
  }

  ensure(html.includes("<title>SEIS Linux Replica</title>"), "Linux Replica route must expose a SEIS title.");
  ensure(/<script src="\.\/seis-runtime-capability-atlas\.js"(?: defer)?><\/script>/.test(html), "Linux Replica route must load the source-backed capability atlas asset.");
  ensure(html.includes("data-seis-linux-replica"), "Linux Replica route must expose a runtime marker.");
  ensure(html.includes("data-boot"), "Linux Replica route must expose a boot surface.");
  ensure(html.includes("id=\"loginButton\""), "Linux Replica route must expose a real login action.");
  ensure(html.includes("id=\"localeButton\""), "Linux Replica route must expose a real locale switcher action.");
  ensure(html.includes("data-locale-value"), "Linux Replica route must expose a visible locale value.");
  ensure(html.includes("seis.locale.v1"), "Linux Replica route must persist locale through the shared SEIS locale key.");
  ensure(html.includes("document.documentElement.lang"), "Linux Replica route must update the document language.");
  ensure(html.includes("DEFAULT_LOCALE=\"tr\""), "Linux Replica route must keep Turkish as the default locale.");
  ensure(html.includes("SESSION_KEY=\"seis-linux-replica-session.v1\""), "Linux Replica route must define a safe session persistence key.");
  ensure(html.includes("saveSession("), "Linux Replica route must persist safe session state.");
  ensure(html.includes("session:readSession"), "Linux Replica diagnostics must expose session state.");
  ensure(html.includes("id=\"startButton\""), "Linux Replica route must expose a launcher action.");
  ensure(html.includes("id=\"startSearch\""), "Linux Replica route must expose launcher search.");
  ensure(html.includes("id=\"sideRail\""), "Linux Replica route must expose a pinned side rail.");
  ensure(html.includes("renderSideRail"), "Linux Replica route must render pinned side rail apps.");
  ensure(html.includes("data-quick-app"), "Linux Replica route must wire quick app launch controls.");
  ensure(html.includes("window.__SEIS_LINUX_REPLICA__"), "Linux Replica route must expose smoke diagnostics.");
  ensure(baseAppCount >= 65, `expected at least 65 Linux Replica core app targets, found ${baseAppCount}.`);
  ensure(baseAppCount >= 66, `expected Capability Atlas to raise Linux Replica core app targets to at least 66, found ${baseAppCount}.`);
  ensure(referenceCount >= 219, `expected at least 219 supplied reference modules, found ${referenceCount}.`);
  ensure(referenceManifest.length >= 219, `expected at least 219 parsed reference manifest entries, found ${referenceManifest.length}.`);
  ensure(JSON.stringify(capabilityAtlas) === JSON.stringify(capabilityAtlasSource), "capability atlas web asset must match the JSON source exactly.");
  ensure(capabilityAtlas?.runtimeBoundary?.currentLevel === "status-and-plan-only", "capability atlas must expose status-and-plan-only boundary.");
  ensure(capabilityAtlas?.runtimeBoundary?.liveMcpSession === "not-started-from-browser", "capability atlas must not claim a live browser MCP session.");
  ensure(Array.isArray(capabilityAtlas?.lanes) && capabilityAtlas.lanes.length === 5, "capability atlas must expose the five embedded SEIS lanes.");
  ensure(Array.isArray(capabilityAtlas?.agentRoster) && capabilityAtlas.agentRoster.length >= 13, "capability atlas must expose the source-backed agent roster.");
  ensure(Array.isArray(capabilityAtlas?.productModules) && capabilityAtlas.productModules.length >= 15, "capability atlas must expose the SEIS product module set.");
  ensure(Array.isArray(capabilityAtlas?.dryRunQueue) && capabilityAtlas.dryRunQueue.length >= capabilityAtlas.agentRoster.length, "capability atlas must expose one or more dry-run tasks per source-backed agent.");
  const missingReferenceAssets = referenceManifest.flatMap((entry) => {
    const checks = [];
    if (entry?.route) checks.push({ kind: "route", value: entry.route });
    if (entry?.thumbnail) checks.push({ kind: "thumbnail", value: entry.thumbnail });
    return checks
      .filter((item) => typeof item.value === "string" && item.value.trim())
      .map((item) => ({
        id: entry.id || entry.name || "unknown",
        kind: item.kind,
        value: item.value,
        path: normalize(join(WEB_ROOT, item.value))
      }))
      .filter((item) => !item.path.startsWith(WEB_ROOT) || !existsSync(item.path));
  });
  ensure(
    missingReferenceAssets.length === 0,
    `reference manifest has missing route/thumbnail files: ${JSON.stringify(missingReferenceAssets.slice(0, 6))}`
  );
  ensure(html.includes("data-reference-vault"), "Linux Replica route must render the supplied ZIP Reference Vault.");
  ensure(html.includes("data-live-demo-console"), "Linux Replica route must render the Live Demo Console.");
  ensure(html.includes("renderLiveDemo"), "Linux Replica route must define a Live Demo Console renderer.");
  ensure(html.includes("readDemoIntent"), "Linux Replica route must define a live demo deep-link intent.");
  ensure(html.includes("demoIntent:()=>DEMO_INTENT"), "Linux Replica diagnostics must expose demo deep-link intent.");
  ensure(html.includes("Math.min(size.w,innerWidth-24)"), "Linux Replica windows must clamp width to the viewport.");
  ensure(html.includes("Math.min(size.h,innerHeight-120)"), "Linux Replica windows must clamp height to the viewport.");
  ensure(html.includes("referenceCount:REFERENCE_APP_ENTRIES.length"), "Linux Replica diagnostics must expose reference module count.");
  ensure(html.includes("SEIS_BRIDGE_TARGETS"), "Linux Replica route must define connected SEIS bridge targets.");
  ensure(html.includes("data-seis-search-gateway"), "Linux Replica route must render a connected SEIS Search gateway.");
  ensure(html.includes("data-seis-connected-result"), "Linux Replica route must render connected SEIS result cards.");
  ensure(html.includes("data-mini-code-ide"), "Linux Replica route must expose a mini SEIS Code IDE workspace.");
  ensure(html.includes("data-design-studio"), "Linux Replica route must expose a mini SEIS Design Studio workspace.");
  ensure(html.includes("data-cloud-panel"), "Linux Replica route must expose a SEIS Cloud status workspace.");
  ensure(html.includes("data-store-panel"), "Linux Replica route must expose a SEIS Store workspace.");
  ensure(html.includes("data-music-panel"), "Linux Replica route must expose a SEIS Music workspace.");
  ensure(html.includes("data-ai-core-panel"), "Linux Replica route must expose a SEIS AI Core workspace.");
  ensure(html.includes("data-security-gate-app"), "Linux Replica route must expose a Security Gate app.");
  ensure(html.includes("data-evolution-console"), "Linux Replica route must expose the five-year Evolution Console.");
  ensure(html.includes("SEIS_FIVE_YEAR_PLAN_VIEW"), "Linux Replica route must load the five-year plan adapter.");
  ensure(html.includes("human approval required"), "Linux Replica Evolution Console must keep the approval boundary visible.");
  ensure(html.includes("seis-vfs-store.js"), "Linux Replica route must load the browser-local VFS store.");
  ensure(html.includes("loadPersistentVfs().finally(boot)"), "Linux Replica boot must wait for VFS restore.");
  ensure(html.includes("vfsPersistence:()=>"), "Linux Replica diagnostics must expose VFS persistence state.");
  ensure(html.includes("data-capability-atlas"), "Linux Replica route must render a source-backed Capability Atlas app.");
  ensure(html.includes("data-capability-lane"), "Linux Replica route must render Capability Atlas lane cards.");
  ensure(html.includes("data-capability-agent"), "Linux Replica route must render Capability Atlas agent cards.");
  ensure(html.includes("data-capability-task"), "Linux Replica route must render Capability Atlas dry-run task cards.");
  ensure(html.includes("bridgeTargetCount"), "Linux Replica diagnostics must expose bridge target count.");
  ensure(html.includes("capabilityAtlas:()=>capabilityStats()"), "Linux Replica diagnostics must expose Capability Atlas counts.");
  for (const marker of ["SEIS Search Gateway", "SEIS Code IDE", "SEIS Design Studio", "SEIS Data", "SEIS Cloud Center", "SEIS Store", "SEIS Website Hub", "SEIS AI Core", "SEIS Capability Atlas"]) {
    ensure(html.includes(marker), `Linux Replica SEIS bridge missing marker: ${marker}`);
  }
  ensure(html.includes("No SSH") || html.includes("SSH disabled"), "Linux Replica route must keep SSH disabled and labeled.");
  ensure(html.includes("no host OS commands") || html.includes("no host shell"), "Linux Replica route must keep host shell disabled and labeled.");
  ensure(html.includes("no provider keys") || html.includes("No provider keys"), "Linux Replica route must keep provider keys out of the route.");
  ensure(html.includes("sudo disabled"), "Linux Replica terminal must block sudo.");
  ensure(html.includes("SSH disabled. Human approval required."), "Linux Replica terminal must block SSH with approval copy.");
  ensure(html.includes("seis:()=>SEIS_BRIDGE_TARGETS"), "Linux Replica terminal must expose the SEIS bridge command.");
  ensure(html.includes("routes:()=>SEIS_BRIDGE_TARGETS"), "Linux Replica terminal must expose the route listing command.");
  ensure(html.includes("capabilities:()=>"), "Linux Replica terminal must expose the source-backed Capability Atlas command.");
  ensure(html.includes("atlas:()=>"), "Linux Replica terminal must expose the Capability Atlas launcher command.");
  ensure(html.includes("refs:(args)=>"), "Linux Replica terminal must expose the reference listing command.");
  ensure(html.includes("refopen:(args)=>"), "Linux Replica terminal must expose the reference opening command.");
  ensure(html.includes("sources:()=>referenceSourceRows"), "Linux Replica terminal must expose supplied ZIP source coverage.");
  ensure(html.includes("security:()=>"), "Linux Replica terminal must expose the security gate command.");
  ensure(html.includes("live:()=>"), "Linux Replica terminal must expose the live demo command.");
  ensure(html.includes("[\"live-demo\",\"demo-readiness\",\"capability-atlas\",\"security-gate\",\"reference-vault\""), "Linux Replica live tour must open the Capability Atlas and Security Gate before the Reference Vault.");
  ensure(html.includes("tour:()=>"), "Linux Replica terminal must expose the live demo tour command.");
  ensure(routes.includes("/seis-linux-replica.html"), "routes.json must register SEIS Linux Replica.");
  ensure(
    routeConfig?.routes?.find((route) => route.path === "/seis-linux-replica.html")?.sections?.includes("capability-atlas"),
    "routes.json must register the Linux Replica Capability Atlas section."
  );
  ensure(serviceWorker.includes("./seis-linux-replica.html"), "service worker must precache SEIS Linux Replica.");
  ensure(serviceWorker.includes("./seis-runtime-capability-atlas.js"), "service worker must precache the Linux Replica Capability Atlas asset.");
  ensure(readme.includes("seis-linux-replica.html"), "README must document SEIS Linux Replica route.");
  ensure(readme.includes("Live Demo Console"), "README must document the SEIS Linux Replica Live Demo Console.");
  ensure(readme.includes("Security Gate") && readme.includes("Issue #129"), "README must document the Linux Replica Security Gate owner handoff.");
  ensure(readme.includes("terminal `live` /") && readme.includes("`readiness` / `sources` / `security` commands"), "README must document the Linux Replica live/readiness/sources/security terminal commands.");
}

async function smokeLinuxReplica(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false
  });

  await goto(client, `${baseUrl}/seis-linux-replica.html`);
  const title = await evaluate(client, "document.title");
  ensure(title === "SEIS Linux Replica", `unexpected title: ${title}`);
  await waitFor(client, "Boolean(window.__SEIS_LINUX_REPLICA__)", 10000);
  await waitFor(client, "document.querySelector('#login')?.classList.contains('is-active')", 9000);

  const initialLocale = await evaluate(client, `(() => ({
    lang: document.documentElement.lang,
    visibleValue: document.querySelector('[data-locale-value]')?.textContent?.trim(),
    stored: localStorage.getItem('seis.locale.v1'),
    loginLabel: document.querySelector('#loginButton')?.textContent?.trim(),
    exposed: window.__SEIS_LINUX_REPLICA__?.locale?.()
  }))()`);
  ensure(initialLocale.lang === "tr", `expected initial document lang tr, found ${initialLocale.lang}`);
  ensure(initialLocale.visibleValue === "TR", `expected initial locale label TR, found ${initialLocale.visibleValue}`);
  ensure(initialLocale.stored === null, `expected fresh profile locale storage to start empty, found ${initialLocale.stored}`);
  ensure(initialLocale.loginLabel === "Masaustune Gir", `expected Turkish login label, found ${initialLocale.loginLabel}`);
  ensure(initialLocale.exposed === "tr", `expected diagnostics locale tr, found ${initialLocale.exposed}`);

  await evaluate(client, "document.querySelector('#localeButton').click()");
  await waitFor(client, "document.documentElement.lang === 'en' && document.querySelector('[data-locale-value]')?.textContent?.trim() === 'EN' && localStorage.getItem('seis.locale.v1') === 'en'", 3000);
  const toggledLocale = await evaluate(client, `(() => ({
    lang: document.documentElement.lang,
    visibleValue: document.querySelector('[data-locale-value]')?.textContent?.trim(),
    stored: localStorage.getItem('seis.locale.v1'),
    loginLabel: document.querySelector('#loginButton')?.textContent?.trim(),
    exposed: window.__SEIS_LINUX_REPLICA__?.locale?.()
  }))()`);
  ensure(toggledLocale.lang === "en", `expected toggled document lang en, found ${toggledLocale.lang}`);
  ensure(toggledLocale.visibleValue === "EN", `expected toggled locale label EN, found ${toggledLocale.visibleValue}`);
  ensure(toggledLocale.stored === "en", `expected persisted locale en, found ${toggledLocale.stored}`);
  ensure(toggledLocale.loginLabel === "Enter Desktop", `expected English login label, found ${toggledLocale.loginLabel}`);
  ensure(toggledLocale.exposed === "en", `expected diagnostics locale en, found ${toggledLocale.exposed}`);

  await evaluate(client, "document.querySelector('#loginButton').click()");
  await waitFor(client, "document.querySelector('#shell')?.classList.contains('is-active')", 5000);
  await waitFor(client, "window.__SEIS_LINUX_REPLICA__?.terminalReady?.() === true", 5000);
  await waitFor(client, "Boolean(document.querySelector('[data-terminal] input'))", 5000);

  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal] input');
    input.value = 'neofetch';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  })()`);
  await waitFor(client, "document.body.innerText.includes('Apps: ' + window.__SEIS_LINUX_REPLICA__.appCount) && document.body.innerText.includes('References: ' + window.__SEIS_LINUX_REPLICA__.referenceCount)", 5000);

  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal] input');
    input.value = 'sources';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  })()`);
  await waitFor(client, "document.body.innerText.includes('Stitch Web Based Linux Desktop') && document.body.innerText.includes('Stitch Yapay Zeka Web Platformu')", 5000);

  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal] input');
    input.value = 'live';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  })()`);
  await waitFor(client, "document.querySelector('[data-live-demo-console]') && document.querySelector('[data-security-gate-app]') && document.body.innerText.includes('opened Live Demo Console')", 5000);

  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal] input');
    input.value = 'security';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  })()`);
  await waitFor(client, "document.querySelector('[data-security-gate-app]') && document.body.innerText.includes('opened Security Gate owner tracker')", 5000);

  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal] input');
    input.value = 'seis';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  })()`);
  await waitFor(client, "document.body.innerText.includes('SEIS Code IDE') && document.body.innerText.includes('SEIS Cloud Center') && document.body.innerText.includes('SEIS Capability Atlas')", 5000);

  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal] input');
    input.value = 'capabilities';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  })()`);
  await waitFor(client, "document.body.innerText.includes('SEIS Capability Atlas') && document.body.innerText.includes('lanes/agents/modules/tasks:') && document.body.innerText.includes('no live MCP session')", 5000);

  await evaluate(client, "document.querySelector('#startButton').click()");
  await waitFor(client, "document.querySelector('#startMenu')?.classList.contains('is-active')", 3000);
  const summary = await evaluate(client, `(() => {
    const horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 2;
    document.querySelector('[data-quick-app="live-demo"]')?.click();
    document.querySelector('[data-quick-app="demo"]')?.click();
    document.querySelector('#sideRail [data-side-app="search"]')?.click();
    window.__SEIS_LINUX_REPLICA__.openApp('live-demo');
    window.__SEIS_LINUX_REPLICA__.openApp('demo-readiness');
    window.__SEIS_LINUX_REPLICA__.openApp('capability-atlas');
    window.__SEIS_LINUX_REPLICA__.openApp('calculator');
    window.__SEIS_LINUX_REPLICA__.openApp('settings');
    window.__SEIS_LINUX_REPLICA__.openApp('reference-vault');
    window.__SEIS_LINUX_REPLICA__.openApp('search');
    window.__SEIS_LINUX_REPLICA__.openApp('code');
    window.__SEIS_LINUX_REPLICA__.openApp('paint');
    window.__SEIS_LINUX_REPLICA__.openApp('cloud');
    window.__SEIS_LINUX_REPLICA__.openApp('store');
    window.__SEIS_LINUX_REPLICA__.openApp('music');
    window.__SEIS_LINUX_REPLICA__.openApp('demo');
    window.__SEIS_LINUX_REPLICA__.openApp('evolution-console');
    document.querySelector('[data-evolution-year="5"]')?.click();
    document.querySelector('[data-evolution-quarter="Y5-Q4"]')?.click();
    document.querySelector('[data-capability-lane="seis-code"]')?.click();
    document.querySelector('[data-capability-agent="code-agent"]')?.click();
    document.querySelector('[data-capability-task="code-route-action-contract"]')?.click();
    document.querySelector('[data-capability-query]')?.focus();
    document.querySelector('[data-code-tab="agent-runtime.json"]')?.click();
    document.querySelector('[data-run-code-check]')?.click();
    document.querySelector('[data-design-swatch="#19c6d4"]')?.click();
    document.querySelector('[data-save-token]')?.click();
    document.querySelector('[data-cloud-refresh]')?.click();
    document.querySelector('[data-store-install]')?.click();
    document.querySelector('[data-music-play]')?.click();
    document.querySelector('[data-ai-agent="Security"]')?.click();
    document.querySelector('[data-ref-random]')?.click();
    document.querySelector('#sideRail [data-side-app="reference-vault"]')?.click();
    const launcherTiles = document.querySelectorAll('.app-tile').length;
    const openWindows = document.querySelectorAll('.window').length;
    const taskbarApps = document.querySelectorAll('.taskbar-app').length;
    const topbarVisible = Boolean(document.querySelector('.topbar'));
    const quickAppButtons = document.querySelectorAll('[data-quick-app]').length;
    const activityCards = document.querySelectorAll('.activity-card[data-quick-app]').length;
    const sideRailButtons = document.querySelectorAll('#sideRail [data-side-app]').length;
    const sideRailActive = Boolean(document.querySelector('#sideRail [data-side-app].is-active'));
    const searchScopes = document.querySelectorAll('[data-seis-search-scope]').length;
    const connectedResults = document.querySelectorAll('[data-seis-connected-result]').length;
    const bridgeApps = document.querySelectorAll('[data-seis-bridge-app]').length;
    const codeWorkspace = document.querySelectorAll('[data-mini-code-ide]').length;
    const designStudio = document.querySelectorAll('[data-design-studio]').length;
    const cloudPanel = document.querySelectorAll('[data-cloud-panel]').length;
    const storePanel = document.querySelectorAll('[data-store-panel]').length;
    const musicPanel = document.querySelectorAll('[data-music-panel]').length;
    const aiCorePanel = document.querySelectorAll('[data-ai-core-panel]').length;
    const capabilityAtlas = window.__SEIS_LINUX_REPLICA__.capabilityAtlas();
    const capabilityAtlasApp = document.querySelectorAll('[data-capability-atlas]').length;
    const capabilityLanes = document.querySelectorAll('[data-capability-lane]').length;
    const capabilityAgents = document.querySelectorAll('[data-capability-agent]').length;
    const capabilityTasks = document.querySelectorAll('[data-capability-task]').length;
    const capabilityModules = document.querySelectorAll('[data-capability-module]').length;
    const securityGateApp = document.querySelectorAll('[data-security-gate-app]').length;
    const evolutionConsole = document.querySelectorAll('[data-evolution-console]').length;
    const evolutionYearButtons = document.querySelectorAll('[data-evolution-year]').length;
    const evolutionQuarterButtons = document.querySelectorAll('[data-evolution-quarter]').length;
    const evolutionSelected = document.querySelector('[data-evolution-quarter="Y5-Q4"].is-active') !== null;
    const securityPathCards = document.querySelectorAll('.security-path').length;
    const liveDemoConsole = document.querySelectorAll('[data-live-demo-console]').length;
    const liveStepButtons = document.querySelectorAll('[data-live-step]').length;
    const liveSourceRows = document.querySelectorAll('.source-row').length;
    const liveTourButtons = document.querySelectorAll('[data-run-live-tour]').length;
    const demoReadiness = document.querySelectorAll('[data-demo-readiness]').length;
    const readinessGates = document.querySelectorAll('[data-readiness-gate]').length;
    const readinessActions = document.querySelectorAll('[data-readiness-action]').length;
    const referenceVault = document.querySelectorAll('[data-reference-vault]').length;
    const referenceTiles = document.querySelectorAll('.reference-tile').length;
    const referenceFrames = document.querySelectorAll('.reference-frame[data-ref-frame-surface]').length;
    const referenceSources = window.__SEIS_LINUX_REPLICA__.referenceSources();
    const bodyText = document.body.innerText;
    const blockedCopy = bodyText.includes('No SSH') || bodyText.includes('SSH disabled') || bodyText.includes('no host shell');
    const securityGateVisible = bodyText.includes('Security Gate') && bodyText.includes('Issue #129') && bodyText.includes('Bypass');
    const securityTerminalVisible = bodyText.includes('opened Security Gate owner tracker');
    const sessionSnapshot = window.__SEIS_LINUX_REPLICA__.session();
    return {
      appCount: window.__SEIS_LINUX_REPLICA__.appCount,
      referenceCount: window.__SEIS_LINUX_REPLICA__.referenceCount,
      referenceSources,
      bridgeTargetCount: window.__SEIS_LINUX_REPLICA__.bridgeTargetCount,
      terminalReady: window.__SEIS_LINUX_REPLICA__.terminalReady(),
      fileCount: window.__SEIS_LINUX_REPLICA__.fileCount(),
      launcherTiles,
      openWindows,
      taskbarApps,
      topbarVisible,
      quickAppButtons,
      activityCards,
      sideRailButtons,
      sideRailActive,
      searchScopes,
      connectedResults,
      bridgeApps,
      codeWorkspace,
      designStudio,
      cloudPanel,
      storePanel,
      musicPanel,
      aiCorePanel,
      capabilityAtlas,
      capabilityAtlasApp,
      capabilityLanes,
      capabilityAgents,
      capabilityTasks,
      capabilityModules,
      securityGateApp,
      evolutionConsole,
      evolutionYearButtons,
      evolutionQuarterButtons,
      evolutionSelected,
      securityPathCards,
      liveDemoConsole,
      liveStepButtons,
      liveSourceRows,
      liveTourButtons,
      demoReadiness,
      readinessGates,
      readinessActions,
      referenceVault,
      referenceTiles,
      referenceFrames,
      horizontalOverflow,
      blockedCopy,
      sessionStored: Boolean(localStorage.getItem('seis-linux-replica-session.v1')),
      sessionOpenApps: Array.isArray(sessionSnapshot.openApps) ? sessionSnapshot.openApps.length : 0,
      sessionFocusedApp: sessionSnapshot.focusedApp || null,
      neofetchVisible: bodyText.includes('Apps: ' + window.__SEIS_LINUX_REPLICA__.appCount) && bodyText.includes('References: ' + window.__SEIS_LINUX_REPLICA__.referenceCount),
      sourcesVisible: bodyText.includes('Stitch Web Based Linux Desktop') && bodyText.includes('Stitch Yapay Zeka Web Platformu'),
      liveCommandVisible: bodyText.includes('opened Live Demo Console'),
      securityGateVisible,
      securityTerminalVisible,
      capabilitiesVisible: bodyText.includes('lanes/agents/modules/tasks:') && bodyText.includes('Browser catalog only'),
      capabilityAtlasVisible: bodyText.includes('SEIS Capability Atlas') && bodyText.includes('status-and-plan-only') && bodyText.includes('Browser-local catalog'),
      liveConsoleVisible: bodyText.includes('SEIS Live Linux-like Demo'),
      codeCheckVisible: bodyText.includes('PASS local UI contract'),
      designSnapshotVisible: bodyText.includes('Snapshot saved to VFS') || bodyText.includes('design-token-'),
      cloudRefreshVisible: bodyText.includes('Mock health refreshed'),
      storeInstallVisible: bodyText.includes('installed') || bodyText.includes('Enabled'),
      musicPlayingVisible: bodyText.includes('Playing local track') || bodyText.includes('Pause'),
      aiAgentVisible: bodyText.includes('Security Agent is active in Local Demo mode.'),
      searchGatewayVisible: bodyText.includes('SEIS Search Gateway'),
      codeVisible: bodyText.includes('SEIS Code IDE'),
      designVisible: bodyText.includes('SEIS Design Studio'),
      cloudVisible: bodyText.includes('SEIS Cloud Center'),
      websiteVisible: bodyText.includes('SEIS Website Hub')
    };
  })()`);

  ensure(summary.appCount >= 286, `expected runtime appCount to include core apps, Capability Atlas, SEIS Data, and supplied references, found ${summary.appCount}`);
  ensure(summary.referenceCount >= 219, `expected at least 219 runtime reference modules, found ${summary.referenceCount}`);
  ensure(Array.isArray(summary.referenceSources) && summary.referenceSources.length >= 2, "expected at least two reference source groups.");
  ensure(summary.bridgeTargetCount >= 10, `expected ten connected SEIS bridge targets including SEIS Data and Music, found ${summary.bridgeTargetCount}`);
  ensure(summary.terminalReady === true, "terminal did not initialize.");
  ensure(summary.launcherTiles >= summary.appCount, `expected launcher tiles to include all runtime apps, found ${summary.launcherTiles} for ${summary.appCount} apps.`);
  ensure(summary.openWindows >= 9, `expected at least nine open windows after smoke, found ${summary.openWindows}`);
  ensure(summary.taskbarApps >= 9, `expected at least nine taskbar app buttons, found ${summary.taskbarApps}`);
  ensure(summary.topbarVisible === true, "SEIS system topbar did not render.");
  ensure(summary.quickAppButtons >= 7, `expected quick app controls, found ${summary.quickAppButtons}`);
  ensure(summary.activityCards === 5, `expected five SEIS activity cards, found ${summary.activityCards}`);
  ensure(summary.sideRailButtons >= 8, `expected pinned side rail app buttons, found ${summary.sideRailButtons}`);
  ensure(summary.sideRailActive === true, "pinned side rail did not track the focused app.");
  ensure(summary.searchScopes >= 10, `expected at least ten SEIS Search scopes including References, found ${summary.searchScopes}`);
  ensure(summary.connectedResults >= 8, `expected connected SEIS Search result cards, found ${summary.connectedResults}`);
  ensure(summary.bridgeApps >= 6, `expected at least six SEIS bridge app windows, found ${summary.bridgeApps}`);
  ensure(summary.codeWorkspace >= 1, "mini SEIS Code workspace did not render.");
  ensure(summary.designStudio >= 1, "mini SEIS Design Studio workspace did not render.");
  ensure(summary.cloudPanel >= 1, "mini SEIS Cloud workspace did not render.");
  ensure(summary.storePanel >= 1, "mini SEIS Store workspace did not render.");
  ensure(summary.musicPanel >= 1, "mini SEIS Music workspace did not render.");
  ensure(summary.aiCorePanel >= 1, "mini SEIS AI Core workspace did not render.");
  ensure(summary.capabilityAtlas?.lanes === 5, `expected five source-backed capability lanes, found ${summary.capabilityAtlas?.lanes}.`);
  ensure(summary.capabilityAtlas?.agents >= 13, `expected source-backed agent roster, found ${summary.capabilityAtlas?.agents}.`);
  ensure(summary.capabilityAtlas?.modules >= 15, `expected SEIS product module coverage, found ${summary.capabilityAtlas?.modules}.`);
  ensure(summary.capabilityAtlas?.tasks >= summary.capabilityAtlas?.agents, `expected dry-run task coverage for every source-backed agent, found ${summary.capabilityAtlas?.tasks} tasks for ${summary.capabilityAtlas?.agents} agents.`);
  ensure(summary.capabilityAtlas?.boundary === "status-and-plan-only", `expected plan-only capability boundary, found ${summary.capabilityAtlas?.boundary}.`);
  ensure(summary.capabilityAtlasApp >= 1, "Capability Atlas app did not render.");
  ensure(summary.capabilityLanes >= 1, `expected visible Capability Atlas lane cards, found ${summary.capabilityLanes}.`);
  ensure(summary.capabilityAgents >= 1, `expected visible Capability Atlas agent cards, found ${summary.capabilityAgents}.`);
  ensure(summary.capabilityTasks >= 1, `expected visible Capability Atlas dry-run task cards, found ${summary.capabilityTasks}.`);
  ensure(summary.capabilityModules >= 1, `expected visible Capability Atlas module cards, found ${summary.capabilityModules}.`);
  ensure(summary.securityGateApp >= 1, "Security Gate app did not render.");
  ensure(summary.evolutionConsole >= 1, "Evolution Console did not render.");
  ensure(summary.evolutionYearButtons === 5, "expected five Evolution Console year buttons, found " + summary.evolutionYearButtons + ".");
  ensure(summary.evolutionQuarterButtons === 4, "expected four Evolution Console quarter buttons, found " + summary.evolutionQuarterButtons + ".");
  ensure(summary.evolutionSelected === true, "Evolution Console did not select Y5-Q4.");
  ensure(summary.securityPathCards >= 3, `expected three Security Gate owner paths, found ${summary.securityPathCards}.`);
  ensure(summary.liveDemoConsole >= 1, "Live Demo Console did not render.");
  ensure(summary.demoReadiness >= 1, "Demo Readiness did not render.");
  ensure(summary.readinessGates >= 6, `expected at least six Demo Readiness gates, found ${summary.readinessGates}.`);
  ensure(summary.readinessActions >= 3, `expected at least three Demo Readiness actions, found ${summary.readinessActions}.`);
  ensure(summary.liveStepButtons >= 8, `expected at least eight Live Demo flow steps, found ${summary.liveStepButtons}.`);
  ensure(summary.liveSourceRows >= 2, `expected Live Demo source coverage rows, found ${summary.liveSourceRows}.`);
  ensure(summary.liveTourButtons >= 1, "Live Demo Console did not expose a live tour action.");
  ensure(summary.referenceVault >= 1, "Reference Vault did not render.");
  ensure(summary.referenceTiles >= 24, `expected visible supplied reference tiles, found ${summary.referenceTiles}.`);
  ensure(summary.referenceFrames >= 1, "opening a reference module did not render an iframe.");
  ensure(summary.codeCheckVisible === true, "mini SEIS Code local check action did not update output.");
  ensure(summary.cloudRefreshVisible === true, "mini SEIS Cloud refresh action did not update output.");
  ensure(summary.musicPlayingVisible === true, "mini SEIS Music play action did not update output.");
  ensure(summary.aiAgentVisible === true, "mini SEIS AI agent action did not update output.");
  ensure(summary.fileCount >= 8, `expected VFS files to be mounted, found ${summary.fileCount}`);
  ensure(summary.sessionStored === true, "safe Linux Replica session snapshot was not stored.");
  ensure(summary.sessionOpenApps >= 8, `expected session to persist open apps, found ${summary.sessionOpenApps}`);
  ensure(typeof summary.sessionFocusedApp === "string" && summary.sessionFocusedApp.length > 0, "session did not persist focused app.");
  ensure(summary.neofetchVisible === true, "terminal neofetch output did not show runtime app and reference counts.");
  ensure(summary.sourcesVisible === true, "terminal sources command did not show supplied ZIP source coverage.");
  ensure(summary.liveCommandVisible === true, "terminal live command did not report the live tour output.");
  ensure(summary.securityTerminalVisible === true, "terminal security command did not report the Security Gate output.");
  ensure(summary.capabilitiesVisible === true, "terminal capabilities command did not show source-backed atlas output.");
  ensure(summary.capabilityAtlasVisible === true, "Capability Atlas app copy is not visible.");
  ensure(summary.securityGateVisible === true, "Security Gate owner tracker copy is not visible.");
  ensure(summary.liveConsoleVisible === true, "Live Demo Console copy is not visible.");
  ensure(summary.searchGatewayVisible && summary.codeVisible && summary.designVisible && summary.cloudVisible && summary.websiteVisible, "connected SEIS bridge surfaces are not all visible.");
  ensure(summary.blockedCopy === true, "local-only SSH/host-shell boundary copy is missing.");
  ensure(summary.horizontalOverflow === false, "desktop has horizontal overflow at 1440 x 960.");

  const screenshotPath = await screenshot(client, "desktop.png");
  const issues = collectRelevantIssues(client.events);
  ensure(issues.length === 0, `browser emitted ${issues.length} relevant issue(s): ${JSON.stringify(issues.slice(0, 3))}`);

  return { ...summary, title, locale: { initial: initialLocale, toggled: toggledLocale }, screenshot: screenshotPath, relevantIssueCount: issues.length };
}

async function smokeLinuxReplicaVfsPersistence(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 860,
    deviceScaleFactor: 1,
    mobile: false
  });

  const filename = "year2-vfs-persistence-smoke.txt";
  await goto(client, baseUrl + "/seis-linux-replica.html?vfs-persistence=write");
  await waitFor(client, "Boolean(window.__SEIS_LINUX_REPLICA__)", 10000);
  await waitFor(client, "document.querySelector('#login')?.classList.contains('is-active')", 9000);
  await evaluate(client, "document.querySelector('#loginButton').click()");
  await waitFor(client, "document.querySelector('#shell')?.classList.contains('is-active')", 5000);
  await waitFor(client, "window.__SEIS_LINUX_REPLICA__?.vfsPersistence?.().ready === true", 5000);
  await waitFor(client, "Boolean(document.querySelector('[data-terminal] input'))", 5000);
  await evaluate(client, "(() => { const input=document.querySelector('[data-terminal] input'); input.value='touch /home/seis/" + filename + "'; input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); return true; })()");
  await waitFor(client, "Boolean(window.__SEIS_LINUX_REPLICA__?.vfsPersistence?.().lastSavedAt)", 5000);
  const afterWrite = await evaluate(client, "window.__SEIS_LINUX_REPLICA__.vfsPersistence()");

  await goto(client, baseUrl + "/seis-linux-replica.html?vfs-persistence=reload");
  await waitFor(client, "Boolean(window.__SEIS_LINUX_REPLICA__)", 10000);
  await waitFor(client, "document.querySelector('#login')?.classList.contains('is-active')", 9000);
  await evaluate(client, "document.querySelector('#loginButton').click()");
  await waitFor(client, "document.querySelector('#shell')?.classList.contains('is-active')", 5000);
  await waitFor(client, "window.__SEIS_LINUX_REPLICA__?.vfsPersistence?.().ready === true", 5000);
  await evaluate(client, "window.__SEIS_LINUX_REPLICA__.openApp('files')");
  await waitFor(client, "document.body.innerText.includes('" + filename + "')", 5000);
  const afterReload = await evaluate(client, "(() => ({ persistence: window.__SEIS_LINUX_REPLICA__.vfsPersistence(), fileVisible: document.body.innerText.includes('" + filename + "') }))()");

  ensure(afterWrite.mode === "indexeddb", "VFS smoke write did not use IndexedDB.");
  ensure(afterReload.persistence.mode === "indexeddb", "VFS smoke reload did not restore from IndexedDB.");
  ensure(afterReload.fileVisible === true, "VFS smoke file was not visible after route reload.");
  return { filename, afterWrite, afterReload };
}

async function smokeLinuxReplicaMobile(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await goto(client, `${baseUrl}/seis-linux-replica.html?mobile-smoke=1`);
  await waitFor(client, "Boolean(window.__SEIS_LINUX_REPLICA__)", 10000);
  await waitFor(client, "document.querySelector('#login')?.classList.contains('is-active')", 9000);
  await evaluate(client, "document.querySelector('#loginButton').click()");
  await waitFor(client, "document.querySelector('#shell')?.classList.contains('is-active')", 5000);

  const summary = await evaluate(client, `(() => {
    window.__SEIS_LINUX_REPLICA__.openApp('live-demo');
    window.__SEIS_LINUX_REPLICA__.openApp('capability-atlas');
    window.__SEIS_LINUX_REPLICA__.openApp('reference-vault');
    window.__SEIS_LINUX_REPLICA__.openApp('terminal');
    window.__SEIS_LINUX_REPLICA__.openApp('evolution-console');
    document.querySelector('#startButton')?.click();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const windows = Array.from(document.querySelectorAll('.window')).map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        appId: node.dataset.appId,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        right: Math.round(rect.right)
      };
    });
    const widestWindow = windows.reduce((max, item) => Math.max(max, item.width), 0);
    const overflowWindows = windows.filter((item) => item.width > viewportWidth + 2);
    const sideRail = document.querySelector('#sideRail')?.getBoundingClientRect();
    const taskbar = document.querySelector('.taskbar')?.getBoundingClientRect();
    const bodyText = document.body.innerText;

    return {
      viewportWidth,
      viewportHeight,
      windowCount: windows.length,
      widestWindow,
      overflowWindowCount: overflowWindows.length,
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 2,
      liveDemoConsole: document.querySelectorAll('[data-live-demo-console]').length,
      capabilityAtlasApp: document.querySelectorAll('[data-capability-atlas]').length,
      capabilityBoundary: window.__SEIS_LINUX_REPLICA__?.capabilityAtlas?.()?.boundary || "",
      referenceVault: document.querySelectorAll('[data-reference-vault]').length,
      evolutionConsole: document.querySelectorAll('[data-evolution-console]').length,
      terminalReady: window.__SEIS_LINUX_REPLICA__.terminalReady(),
      launcherOpen: document.querySelector('#startMenu')?.classList.contains('is-active'),
      launcherTiles: document.querySelectorAll('.app-tile').length,
      sideRailButtons: document.querySelectorAll('#sideRail [data-side-app]').length,
      sideRailFits: sideRail ? sideRail.width <= viewportWidth + 2 : false,
      taskbarFits: taskbar ? taskbar.width <= viewportWidth + 2 : false,
      liveConsoleVisible: bodyText.includes('SEIS Live Linux-like Demo'),
      referenceVisible: bodyText.includes('Reference Vault'),
      localBoundaryVisible: bodyText.includes('No SSH') || bodyText.includes('SSH disabled') || bodyText.includes('no host shell')
    };
  })()`);

  ensure(summary.viewportWidth <= 430, `expected mobile viewport width, found ${summary.viewportWidth}.`);
  ensure(summary.windowCount >= 3, `expected restored/open mobile windows, found ${summary.windowCount}.`);
  ensure(summary.widestWindow <= summary.viewportWidth + 2, `mobile window width exceeds viewport: ${summary.widestWindow} > ${summary.viewportWidth}.`);
  ensure(summary.overflowWindowCount === 0, `mobile viewport has ${summary.overflowWindowCount} oversized window(s).`);
  ensure(summary.horizontalOverflow === false, "mobile desktop has horizontal overflow.");
  ensure(summary.liveDemoConsole >= 1, "mobile Live Demo Console did not render.");
  ensure(summary.capabilityAtlasApp >= 1, "mobile Capability Atlas did not render.");
  ensure(summary.capabilityBoundary === "status-and-plan-only", `mobile Capability Atlas boundary changed: ${summary.capabilityBoundary}.`);
  ensure(summary.referenceVault >= 1, "mobile Reference Vault did not render.");
  ensure(summary.evolutionConsole >= 1, "mobile Evolution Console did not render.");
  ensure(summary.terminalReady === true, "mobile terminal did not initialize.");
  ensure(summary.launcherOpen === true, "mobile launcher did not open.");
  ensure(summary.launcherTiles >= summary.sideRailButtons, "mobile launcher did not expose app tiles.");
  ensure(summary.sideRailButtons >= 8, `expected mobile side rail buttons, found ${summary.sideRailButtons}.`);
  ensure(summary.sideRailFits === true, "mobile side rail does not fit the viewport.");
  ensure(summary.taskbarFits === true, "mobile taskbar does not fit the viewport.");
  ensure(summary.liveConsoleVisible === true, "mobile Live Demo Console copy is not visible.");
  ensure(summary.referenceVisible === true, "mobile Reference Vault copy is not visible.");
  ensure(summary.localBoundaryVisible === true, "mobile local-only boundary copy is missing.");

  const screenshotPath = await screenshot(client, "mobile.png");
  return { ...summary, screenshot: screenshotPath };
}

async function smokeLinuxReplicaDeepLink(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 860,
    deviceScaleFactor: 1,
    mobile: false
  });

  await goto(client, `${baseUrl}/seis-linux-replica.html?demo=live`);
  await waitFor(client, "window.__SEIS_LINUX_REPLICA__?.demoIntent?.() === true", 10000);
  await waitFor(client, "document.querySelector('#shell')?.classList.contains('is-active')", 10000);
  await waitFor(client, "document.querySelector('[data-live-demo-console]') && document.querySelector('[data-demo-readiness]') && document.querySelector('[data-capability-atlas]')", 10000);
  const summary = await evaluate(client, `(() => {
    const bodyText = document.body.innerText;
    return {
      demoIntent: window.__SEIS_LINUX_REPLICA__?.demoIntent?.() === true,
      shellActive: document.querySelector('#shell')?.classList.contains('is-active') === true,
      liveDemoConsole: document.querySelectorAll('[data-live-demo-console]').length,
      demoReadiness: document.querySelectorAll('[data-demo-readiness]').length,
      capabilityAtlasApp: document.querySelectorAll('[data-capability-atlas]').length,
      referenceVault: document.querySelectorAll('[data-reference-vault]').length,
      evolutionConsole: document.querySelectorAll('[data-evolution-console]').length,
      terminalReady: window.__SEIS_LINUX_REPLICA__?.terminalReady?.() === true,
      tourCopyVisible: bodyText.includes('SEIS Live Linux-like Demo'),
      readinessCopyVisible: bodyText.includes('Demo Readiness'),
      blockedCopy: bodyText.includes('No SSH') || bodyText.includes('SSH disabled') || bodyText.includes('no host shell')
    };
  })()`);

  ensure(summary.demoIntent === true, "deep-link diagnostics did not expose demo intent.");
  ensure(summary.shellActive === true, "deep-link did not auto-enter the desktop shell.");
  ensure(summary.liveDemoConsole >= 1, "deep-link did not open Live Demo Console.");
  ensure(summary.demoReadiness >= 1, "deep-link did not open Demo Readiness.");
  ensure(summary.capabilityAtlasApp >= 1, "deep-link did not open Capability Atlas.");
  ensure(summary.referenceVault >= 1, "deep-link did not open Reference Vault.");
  ensure(summary.evolutionConsole >= 1, "deep-link did not open Evolution Console.");
  ensure(summary.terminalReady === true, "deep-link did not leave terminal ready.");
  ensure(summary.tourCopyVisible === true, "deep-link live tour copy was not visible.");
  ensure(summary.readinessCopyVisible === true, "deep-link readiness copy was not visible.");
  ensure(summary.blockedCopy === true, "deep-link did not preserve SSH/host-shell boundary copy.");

  return summary;
}

async function smokeWebsiteProductCta(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 860,
    deviceScaleFactor: 1,
    mobile: false
  });

  await goto(client, `${baseUrl}/website/seis-os.html`);
  await waitFor(client, "document.querySelector('[data-product-page] h1')?.textContent?.trim() === 'SEIS OS'", 10000);
  const ctaBeforeClick = await evaluate(client, `(() => {
    const cta = document.querySelector('.hero-actions .primary-action');
    return {
      label: cta?.textContent?.trim() || "",
      href: cta ? new URL(cta.getAttribute('href'), location.href).pathname + new URL(cta.getAttribute('href'), location.href).search : ""
    };
  })()`);
  ensure(ctaBeforeClick.label === "Open Live SEIS OS", `SEIS OS product CTA label changed: ${ctaBeforeClick.label}`);
  ensure(ctaBeforeClick.href === "/seis-linux-replica.html?demo=live", `SEIS OS product CTA must target live demo deep link, found ${ctaBeforeClick.href}`);

  await evaluate(client, "document.querySelector('.hero-actions .primary-action')?.click()");
  await waitFor(client, "window.__SEIS_LINUX_REPLICA__?.demoIntent?.() === true", 10000);
  await waitFor(client, "document.querySelector('#shell')?.classList.contains('is-active')", 10000);
  await waitFor(client, "document.querySelector('[data-live-demo-console]') && document.querySelector('[data-demo-readiness]')", 10000);
  const summary = await evaluate(client, `(() => {
    const bodyText = document.body.innerText;
    return {
      ctaLabel: ${JSON.stringify(ctaBeforeClick.label)},
      ctaHref: ${JSON.stringify(ctaBeforeClick.href)},
      path: location.pathname,
      search: location.search,
      demoIntent: window.__SEIS_LINUX_REPLICA__?.demoIntent?.() === true,
      shellActive: document.querySelector('#shell')?.classList.contains('is-active') === true,
      liveDemoConsole: document.querySelectorAll('[data-live-demo-console]').length,
      demoReadiness: document.querySelectorAll('[data-demo-readiness]').length,
      blockedCopy: bodyText.includes('No SSH') || bodyText.includes('SSH disabled') || bodyText.includes('no host shell')
    };
  })()`);

  ensure(summary.path === "/seis-linux-replica.html", `SEIS OS product CTA landed on ${summary.path}.`);
  ensure(summary.search === "?demo=live", `SEIS OS product CTA search params changed: ${summary.search}`);
  ensure(summary.demoIntent === true, "SEIS OS product CTA did not preserve demo intent.");
  ensure(summary.shellActive === true, "SEIS OS product CTA did not auto-enter the desktop shell.");
  ensure(summary.liveDemoConsole >= 1, "SEIS OS product CTA did not open Live Demo Console.");
  ensure(summary.demoReadiness >= 1, "SEIS OS product CTA did not open Demo Readiness.");
  ensure(summary.blockedCopy === true, "SEIS OS product CTA did not preserve SSH/host-shell boundary copy.");

  return summary;
}

async function smokeLandingCta(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 860,
    deviceScaleFactor: 1,
    mobile: false
  });

  await goto(client, `${baseUrl}/index.html`);
  await waitFor(client, "document.querySelector('#hero-title')?.textContent?.trim() === 'SEIS'", 10000);
  const ctaBeforeClick = await evaluate(client, `(() => {
    const cta = document.querySelector('.hero-actions .hero-button.primary');
    return {
      label: cta?.textContent?.trim() || "",
      href: cta ? new URL(cta.getAttribute('href'), location.href).pathname + new URL(cta.getAttribute('href'), location.href).search : ""
    };
  })()`);
  ensure(ctaBeforeClick.label === "Open the OS", `Landing hero CTA label changed: ${ctaBeforeClick.label}`);
  ensure(ctaBeforeClick.href === "/seis-linux-replica.html?demo=live", `Landing hero CTA must target live demo deep link, found ${ctaBeforeClick.href}`);

  await evaluate(client, "document.querySelector('.hero-actions .hero-button.primary')?.click()");
  await waitFor(client, "window.__SEIS_LINUX_REPLICA__?.demoIntent?.() === true", 10000);
  await waitFor(client, "document.querySelector('#shell')?.classList.contains('is-active')", 10000);
  await waitFor(client, "document.querySelector('[data-live-demo-console]') && document.querySelector('[data-demo-readiness]')", 10000);
  const summary = await evaluate(client, `(() => {
    const bodyText = document.body.innerText;
    return {
      ctaLabel: ${JSON.stringify(ctaBeforeClick.label)},
      ctaHref: ${JSON.stringify(ctaBeforeClick.href)},
      path: location.pathname,
      search: location.search,
      demoIntent: window.__SEIS_LINUX_REPLICA__?.demoIntent?.() === true,
      shellActive: document.querySelector('#shell')?.classList.contains('is-active') === true,
      liveDemoConsole: document.querySelectorAll('[data-live-demo-console]').length,
      demoReadiness: document.querySelectorAll('[data-demo-readiness]').length,
      blockedCopy: bodyText.includes('No SSH') || bodyText.includes('SSH disabled') || bodyText.includes('no host shell')
    };
  })()`);

  ensure(summary.path === "/seis-linux-replica.html", `Landing hero CTA landed on ${summary.path}.`);
  ensure(summary.search === "?demo=live", `Landing hero CTA search params changed: ${summary.search}`);
  ensure(summary.demoIntent === true, "Landing hero CTA did not preserve demo intent.");
  ensure(summary.shellActive === true, "Landing hero CTA did not auto-enter the desktop shell.");
  ensure(summary.liveDemoConsole >= 1, "Landing hero CTA did not open Live Demo Console.");
  ensure(summary.demoReadiness >= 1, "Landing hero CTA did not open Demo Readiness.");
  ensure(summary.blockedCopy === true, "Landing hero CTA did not preserve SSH/host-shell boundary copy.");

  return summary;
}

async function main() {
  validateStaticContract();
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }

  const chrome = findChrome();
  if (!chrome) {
    console.error("Chrome/Chromium was not found for SEIS Linux Replica browser smoke.");
    process.exit(1);
  }

  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const appServer = createStaticServer();
  const userDataDir = join(tmpdir(), `seis-linux-replica-smoke-${Date.now()}`);
  const debugPort = 57000 + Math.floor(Math.random() * 2000);
  let chromeProcess;
  let client;

  try {
    await new Promise((resolveListen) => appServer.listen(0, HOST, resolveListen));
    const appPort = appServer.address().port;
    const baseUrl = `http://${HOST}:${appPort}`;

    chromeProcess = spawn(chrome, [
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank"
    ], { stdio: "ignore" });

    client = await newTab(debugPort);
    const summary = await smokeLinuxReplica(client, baseUrl);
    const vfsPersistenceSummary = await smokeLinuxReplicaVfsPersistence(client, baseUrl);
    const mobileSummary = await smokeLinuxReplicaMobile(client, baseUrl);
    const deepLinkSummary = await smokeLinuxReplicaDeepLink(client, baseUrl);
    const productPageCtaSummary = await smokeWebsiteProductCta(client, baseUrl);
    const landingCtaSummary = await smokeLandingCta(client, baseUrl);
    const report = {
      ok: failures.length === 0,
      generatedAt: new Date().toISOString(),
      browser: chrome,
      appPort,
      screenshotDir: SCREENSHOT_DIR,
      reportFile: REPORT_FILE,
      seisLinuxReplica: summary,
      seisLinuxReplicaVfsPersistence: vfsPersistenceSummary,
      seisLinuxReplicaMobile: mobileSummary,
      seisLinuxReplicaDeepLink: deepLinkSummary,
      seisLinuxReplicaProductPageCta: productPageCtaSummary,
      seisLinuxReplicaLandingCta: landingCtaSummary
    };
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    writeFileSync(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report, null, 2));
  } finally {
    client?.close();
    if (chromeProcess) {
      if (chromeProcess.exitCode === null) {
        const exited = new Promise((resolveExit) => chromeProcess.once("exit", resolveExit));
        chromeProcess.kill("SIGTERM");
        await Promise.race([exited, delay(1500)]);
      }
    }
    await new Promise((resolveClose) => appServer.close(resolveClose));
    await removeDirectoryWithRetries(userDataDir);
  }

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
