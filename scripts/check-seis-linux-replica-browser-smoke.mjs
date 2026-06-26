import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, normalize } from "node:path";
import { tmpdir } from "node:os";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const SCREENSHOT_DIR = join(ROOT, "dist", "qa", "seis-linux-replica-smoke");
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
    .filter((issue) => !`${issue.text} ${issue.url}`.includes("favicon"));
}

function validateStaticContract() {
  const routePath = "apps/web/seis-linux-replica.html";
  const routesPath = "apps/web/src/config/routes.json";
  const serviceWorkerPath = "apps/web/service-worker.js";
  const readmePath = "README.md";

  for (const file of [routePath, routesPath, serviceWorkerPath, readmePath]) {
    ensure(existsSync(file), `missing required file: ${file}`);
  }

  if (failures.length > 0) return;

  const html = readFileSync(routePath, "utf8");
  const routes = readFileSync(routesPath, "utf8");
  const serviceWorker = readFileSync(serviceWorkerPath, "utf8");
  const readme = readFileSync(readmePath, "utf8");
  const catalogBlock = html.match(/const APP_CATALOG=\[([\s\S]*?)\]\.map/);
  const appCount = catalogBlock ? (catalogBlock[1].match(/^\s+\["/gm) || []).length : 0;

  ensure(html.includes("<title>SEIS Linux Replica</title>"), "Linux Replica route must expose a SEIS title.");
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
  ensure(appCount === 64, `expected 64 Linux Replica app targets, found ${appCount}.`);
  ensure(html.includes("SEIS_BRIDGE_TARGETS"), "Linux Replica route must define connected SEIS bridge targets.");
  ensure(html.includes("data-seis-search-gateway"), "Linux Replica route must render a connected SEIS Search gateway.");
  ensure(html.includes("data-seis-connected-result"), "Linux Replica route must render connected SEIS result cards.");
  ensure(html.includes("data-mini-code-ide"), "Linux Replica route must expose a mini SEIS Code IDE workspace.");
  ensure(html.includes("data-design-studio"), "Linux Replica route must expose a mini SEIS Design Studio workspace.");
  ensure(html.includes("data-cloud-panel"), "Linux Replica route must expose a SEIS Cloud status workspace.");
  ensure(html.includes("data-store-panel"), "Linux Replica route must expose a SEIS Store workspace.");
  ensure(html.includes("data-music-panel"), "Linux Replica route must expose a SEIS Music workspace.");
  ensure(html.includes("data-ai-core-panel"), "Linux Replica route must expose a SEIS AI Core workspace.");
  ensure(html.includes("bridgeTargetCount"), "Linux Replica diagnostics must expose bridge target count.");
  for (const marker of ["SEIS Search Gateway", "SEIS Code IDE", "SEIS Design Studio", "SEIS Cloud Center", "SEIS Store", "SEIS Website Hub", "SEIS AI Core"]) {
    ensure(html.includes(marker), `Linux Replica SEIS bridge missing marker: ${marker}`);
  }
  ensure(html.includes("No SSH") || html.includes("SSH disabled"), "Linux Replica route must keep SSH disabled and labeled.");
  ensure(html.includes("no host OS commands") || html.includes("no host shell"), "Linux Replica route must keep host shell disabled and labeled.");
  ensure(html.includes("no provider keys") || html.includes("No provider keys"), "Linux Replica route must keep provider keys out of the route.");
  ensure(html.includes("sudo disabled"), "Linux Replica terminal must block sudo.");
  ensure(html.includes("SSH disabled. Human approval required."), "Linux Replica terminal must block SSH with approval copy.");
  ensure(html.includes("seis:()=>SEIS_BRIDGE_TARGETS"), "Linux Replica terminal must expose the SEIS bridge command.");
  ensure(html.includes("routes:()=>SEIS_BRIDGE_TARGETS"), "Linux Replica terminal must expose the route listing command.");
  ensure(routes.includes("/seis-linux-replica.html"), "routes.json must register SEIS Linux Replica.");
  ensure(serviceWorker.includes("./seis-linux-replica.html"), "service worker must precache SEIS Linux Replica.");
  ensure(readme.includes("seis-linux-replica.html"), "README must document SEIS Linux Replica route.");
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
  await waitFor(client, "document.body.innerText.includes('Apps: 64')", 5000);

  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal] input');
    input.value = 'seis';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  })()`);
  await waitFor(client, "document.body.innerText.includes('SEIS Code IDE') && document.body.innerText.includes('SEIS Cloud Center')", 5000);

  await evaluate(client, "document.querySelector('#startButton').click()");
  await waitFor(client, "document.querySelector('#startMenu')?.classList.contains('is-active')", 3000);
  const summary = await evaluate(client, `(() => {
    const horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 2;
    document.querySelector('[data-quick-app="demo"]')?.click();
    document.querySelector('#sideRail [data-side-app="search"]')?.click();
    window.__SEIS_LINUX_REPLICA__.openApp('calculator');
    window.__SEIS_LINUX_REPLICA__.openApp('settings');
    window.__SEIS_LINUX_REPLICA__.openApp('search');
    window.__SEIS_LINUX_REPLICA__.openApp('code');
    window.__SEIS_LINUX_REPLICA__.openApp('paint');
    window.__SEIS_LINUX_REPLICA__.openApp('cloud');
    window.__SEIS_LINUX_REPLICA__.openApp('store');
    window.__SEIS_LINUX_REPLICA__.openApp('music');
    window.__SEIS_LINUX_REPLICA__.openApp('demo');
    document.querySelector('[data-code-tab="agent-runtime.json"]')?.click();
    document.querySelector('[data-run-code-check]')?.click();
    document.querySelector('[data-design-swatch="#19c6d4"]')?.click();
    document.querySelector('[data-save-token]')?.click();
    document.querySelector('[data-cloud-refresh]')?.click();
    document.querySelector('[data-store-install]')?.click();
    document.querySelector('[data-music-play]')?.click();
    document.querySelector('[data-ai-agent="Security"]')?.click();
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
    const bodyText = document.body.innerText;
    const blockedCopy = bodyText.includes('No SSH') || bodyText.includes('SSH disabled') || bodyText.includes('no host shell');
    const sessionSnapshot = window.__SEIS_LINUX_REPLICA__.session();
    return {
      appCount: window.__SEIS_LINUX_REPLICA__.appCount,
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
      horizontalOverflow,
      blockedCopy,
      sessionStored: Boolean(localStorage.getItem('seis-linux-replica-session.v1')),
      sessionOpenApps: Array.isArray(sessionSnapshot.openApps) ? sessionSnapshot.openApps.length : 0,
      sessionFocusedApp: sessionSnapshot.focusedApp || null,
      neofetchVisible: bodyText.includes('Apps: 64'),
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

  ensure(summary.appCount === 64, `expected runtime appCount 64, found ${summary.appCount}`);
  ensure(summary.bridgeTargetCount >= 8, `expected at least eight connected SEIS bridge targets, found ${summary.bridgeTargetCount}`);
  ensure(summary.terminalReady === true, "terminal did not initialize.");
  ensure(summary.launcherTiles === 64, `expected 64 launcher tiles, found ${summary.launcherTiles}`);
  ensure(summary.openWindows >= 9, `expected at least nine open windows after smoke, found ${summary.openWindows}`);
  ensure(summary.taskbarApps >= 9, `expected at least nine taskbar app buttons, found ${summary.taskbarApps}`);
  ensure(summary.topbarVisible === true, "SEIS system topbar did not render.");
  ensure(summary.quickAppButtons >= 7, `expected quick app controls, found ${summary.quickAppButtons}`);
  ensure(summary.activityCards === 5, `expected five SEIS activity cards, found ${summary.activityCards}`);
  ensure(summary.sideRailButtons >= 8, `expected pinned side rail app buttons, found ${summary.sideRailButtons}`);
  ensure(summary.sideRailActive === true, "pinned side rail did not track the focused app.");
  ensure(summary.searchScopes === 9, `expected nine SEIS Search scopes, found ${summary.searchScopes}`);
  ensure(summary.connectedResults >= 8, `expected connected SEIS Search result cards, found ${summary.connectedResults}`);
  ensure(summary.bridgeApps >= 6, `expected at least six SEIS bridge app windows, found ${summary.bridgeApps}`);
  ensure(summary.codeWorkspace >= 1, "mini SEIS Code workspace did not render.");
  ensure(summary.designStudio >= 1, "mini SEIS Design Studio workspace did not render.");
  ensure(summary.cloudPanel >= 1, "mini SEIS Cloud workspace did not render.");
  ensure(summary.storePanel >= 1, "mini SEIS Store workspace did not render.");
  ensure(summary.musicPanel >= 1, "mini SEIS Music workspace did not render.");
  ensure(summary.aiCorePanel >= 1, "mini SEIS AI Core workspace did not render.");
  ensure(summary.codeCheckVisible === true, "mini SEIS Code local check action did not update output.");
  ensure(summary.cloudRefreshVisible === true, "mini SEIS Cloud refresh action did not update output.");
  ensure(summary.musicPlayingVisible === true, "mini SEIS Music play action did not update output.");
  ensure(summary.aiAgentVisible === true, "mini SEIS AI agent action did not update output.");
  ensure(summary.fileCount >= 8, `expected VFS files to be mounted, found ${summary.fileCount}`);
  ensure(summary.sessionStored === true, "safe Linux Replica session snapshot was not stored.");
  ensure(summary.sessionOpenApps >= 8, `expected session to persist open apps, found ${summary.sessionOpenApps}`);
  ensure(typeof summary.sessionFocusedApp === "string" && summary.sessionFocusedApp.length > 0, "session did not persist focused app.");
  ensure(summary.neofetchVisible === true, "terminal neofetch output did not show Apps: 64.");
  ensure(summary.searchGatewayVisible && summary.codeVisible && summary.designVisible && summary.cloudVisible && summary.websiteVisible, "connected SEIS bridge surfaces are not all visible.");
  ensure(summary.blockedCopy === true, "local-only SSH/host-shell boundary copy is missing.");
  ensure(summary.horizontalOverflow === false, "desktop has horizontal overflow at 1440 x 960.");

  const screenshotPath = await screenshot(client, "desktop.png");
  const issues = collectRelevantIssues(client.events);
  ensure(issues.length === 0, `browser emitted ${issues.length} relevant issue(s): ${JSON.stringify(issues.slice(0, 3))}`);

  return { ...summary, title, locale: { initial: initialLocale, toggled: toggledLocale }, screenshot: screenshotPath, relevantIssueCount: issues.length };
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
    console.log(JSON.stringify({
      ok: failures.length === 0,
      browser: chrome,
      appPort,
      screenshotDir: SCREENSHOT_DIR,
      seisLinuxReplica: summary
    }, null, 2));
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
    rmSync(userDataDir, { recursive: true, force: true });
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
