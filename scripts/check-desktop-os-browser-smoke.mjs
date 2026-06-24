import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, normalize, resolve } from "node:path";
import { tmpdir } from "node:os";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const SCREENSHOT_DIR = join(ROOT, "dist", "qa", "desktop-os-smoke");
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
    const relativePath = decodedPath === "/" ? "/desktop.html" : decodedPath;
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
    await delay(200);
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

async function clickSelector(client, selector) {
  const clicked = await evaluate(client, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { ok: false, reason: 'missing' };
    element.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { ok: false, reason: 'not-visible' };
    element.click();
    return { ok: true };
  })()`);

  if (!clicked?.ok) throw new Error(`Cannot click selector: ${selector} (${clicked?.reason || "unknown"})`);
  await delay(200);
}

async function bootDesktop(client, baseUrl) {
  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  await waitFor(client, "window.__SEIS_DESKTOP__?.appCount >= 50", 10000);
  await waitFor(client, "document.querySelectorAll('.app-window').length >= 2", 10000);
  await waitFor(client, "window.__SEIS_DESKTOP__?.bootState?.().complete === true", 4000);
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
    .filter((issue) => !`${issue.text} ${issue.url}`.includes("favicon"))
    .filter((issue) => !`${issue.text} ${issue.url}`.includes("net::ERR_ABORTED"))
    .filter((issue) => !`${issue.text} ${issue.url}`.includes("cdn.jsdelivr.net/npm/monaco-editor"));
}

async function smokeDesktop(client, baseUrl) {
  await bootDesktop(client, baseUrl);

  const initial = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const summary = diagnostics.interactivitySummary();
    const searchInput = document.querySelector('[data-launcher-search]');
    const launcherAppsBeforeSearch = document.querySelectorAll('.launcher-app[data-action="open-app"]').length;
    const routeButtonsBeforeSearch = document.querySelectorAll('[data-demo-route-group] [data-action="open-demo-route"]').length;
    if (searchInput) {
      searchInput.value = 'linux';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return {
      title: document.title,
      appCount: diagnostics.appCount,
      terminalCommands: diagnostics.terminalCommands.length,
      openWindows: diagnostics.openWindows(),
      boot: diagnostics.bootState(),
      launcherState: diagnostics.launcherState(),
      wallpaperState: diagnostics.wallpaperState(),
      launcherApps: launcherAppsBeforeSearch,
      routeButtons: routeButtonsBeforeSearch,
      linuxReplicaAppVisible: Boolean(document.querySelector('.launcher-app[data-app-id="linux-replica"]')),
      linuxReplicaRouteVisible: Boolean(document.querySelector('[data-demo-route-group] [data-value="seis-linux-replica-web"]')),
      launcherSearchQuery: searchInput?.value || '',
      dockApps: document.querySelectorAll('[data-dock] button').length,
      desktopShortcuts: document.querySelectorAll('.desktop-shortcut').length,
      terminalReady: Boolean(document.querySelector('[data-terminal-input]')),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      interactivityRate: summary.rate,
      buttonCount: summary.buttons,
      responsiveButtonCount: summary.responsiveButtons,
      overlayText: document.body.textContent.includes('Unhandled Runtime Error') ||
        document.body.textContent.includes('Traceback') ||
        document.body.textContent.includes('Webpack')
    };
  })()`);

  ensure(initial.title === "SEIS System OS", `Desktop title mismatch: ${initial.title}`);
  ensure(initial.appCount >= 50, `Desktop expected at least 50 apps, got ${initial.appCount}`);
  ensure(initial.terminalCommands >= 12, `Desktop expected at least 12 terminal commands, got ${initial.terminalCommands}`);
  ensure(initial.openWindows.includes("Files"), "Desktop must boot with Files open.");
  ensure(initial.openWindows.includes("Terminal"), "Desktop must boot with Terminal open.");
  ensure(initial.boot.exists && initial.boot.complete, `Desktop boot sequence should complete before interaction: ${JSON.stringify(initial.boot)}`);
  ensure(initial.boot.text.includes("Browser-local demo"), `Desktop boot text must keep host/SSH boundary honest: ${JSON.stringify(initial.boot)}`);
  ensure(initial.launcherState.frequentApps.length >= 5, `Desktop launcher expected frequent apps, got ${JSON.stringify(initial.launcherState)}`);
  ensure(initial.launcherState.categories.includes("System"), `Desktop launcher categories missing System: ${JSON.stringify(initial.launcherState.categories)}`);
  ensure(initial.wallpaperState.available.some((wallpaper) => wallpaper.id === "prism"), `Desktop wallpaper catalog must include SEIS Prism Wave: ${JSON.stringify(initial.wallpaperState)}`);
  ensure(initial.launcherApps >= 50, `Desktop launcher expected at least 50 app buttons, got ${initial.launcherApps}`);
  ensure(initial.routeButtons >= 3, `Desktop launcher expected demo route buttons, got ${initial.routeButtons}`);
  ensure(initial.linuxReplicaAppVisible, "Desktop launcher must expose SEIS Linux Replica app.");
  ensure(initial.launcherSearchQuery === "linux", "Desktop launcher smoke must query Linux Replica route visibility.");
  ensure(initial.linuxReplicaRouteVisible, "Desktop launcher must expose SEIS Linux Replica route when searching linux.");
  ensure(initial.dockApps >= 8, `Desktop dock expected useful launch targets, got ${initial.dockApps}`);
  ensure(initial.desktopShortcuts >= 4, `Desktop expected desktop shortcuts, got ${initial.desktopShortcuts}`);
  ensure(initial.terminalReady, "Desktop terminal input missing.");
  ensure(!initial.horizontalOverflow, "Desktop horizontal overflow detected.");
  ensure(initial.interactivityRate >= 0.8, `Desktop interactivity rate below 80%: ${(initial.interactivityRate * 100).toFixed(1)}%`);
  ensure(!initial.overlayText, "Desktop framework/error overlay text detected.");
  const bootAndLauncher = {
    boot: initial.boot,
    frequentApps: initial.launcherState.frequentApps,
    categories: initial.launcherState.categories,
    wallpapers: initial.wallpaperState.available.map((wallpaper) => wallpaper.id)
  };

  const profileSwitch = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const shell = document.querySelector('.desktop-shell');
    const sequence = [];
    for (const profile of ['macos', 'windows', 'linux']) {
      const selector = '[data-action="set-os-profile"][data-value="' + profile + '"]';
      const button = document.querySelector(selector);
      if (button) button.click();
      sequence.push({
        profile,
        diagnosticProfile: diagnostics.osProfile(),
        shellProfile: shell?.dataset.osProfile || '',
        activePressed: Boolean(document.querySelector(selector + '.is-active[aria-pressed="true"]'))
      });
    }
    return {
      sequence,
      finalProfile: diagnostics.osProfile(),
      hasProfileButtons: document.querySelectorAll('[data-action="set-os-profile"]').length >= 3
    };
  })()`);
  ensure(profileSwitch.hasProfileButtons, "Desktop must expose Linux, macOS, and Windows profile controls.");
  ensure(
    profileSwitch.sequence.every((item) => item.diagnosticProfile === item.profile && item.shellProfile === item.profile && item.activePressed),
    `Desktop profile switching failed: ${JSON.stringify(profileSwitch.sequence)}`
  );
  ensure(profileSwitch.finalProfile === "linux", "Desktop profile smoke must restore Linux profile after switching.");

  const workspaceSwitch = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    diagnostics.openApp('notes');
    const workspaceOne = {
      activeWorkspace: diagnostics.activeWorkspace(),
      visible: diagnostics.visibleWindowTitles(),
      activePressed: Boolean(document.querySelector('[data-workspace="1"].is-active[aria-pressed="true"]'))
    };
    document.querySelector('[data-action="set-workspace"][data-workspace="2"]')?.click();
    const workspaceTwoBeforeOpen = {
      activeWorkspace: diagnostics.activeWorkspace(),
      visible: diagnostics.visibleWindowTitles(),
      notesVisible: Boolean(document.querySelector('.app-window[data-app-id="notes"]:not([hidden])')),
      activePressed: Boolean(document.querySelector('[data-workspace="2"].is-active[aria-pressed="true"]'))
    };
    diagnostics.openApp('calculator');
    const workspaceTwoAfterOpen = {
      visible: diagnostics.visibleWindowTitles(),
      calculatorVisible: Boolean(document.querySelector('.app-window[data-app-id="calculator"]:not([hidden])'))
    };
    document.querySelector('[data-action="set-workspace"][data-workspace="1"]')?.click();
    const workspaceOneReturn = {
      activeWorkspace: diagnostics.activeWorkspace(),
      visible: diagnostics.visibleWindowTitles(),
      notesVisible: Boolean(document.querySelector('.app-window[data-app-id="notes"]:not([hidden])')),
      calculatorVisible: Boolean(document.querySelector('.app-window[data-app-id="calculator"]:not([hidden])'))
    };
    document.querySelector('[data-action="set-workspace"][data-workspace="2"]')?.click();
    const workspaceTwoReturn = {
      activeWorkspace: diagnostics.activeWorkspace(),
      visible: diagnostics.visibleWindowTitles(),
      notesVisible: Boolean(document.querySelector('.app-window[data-app-id="notes"]:not([hidden])')),
      calculatorVisible: Boolean(document.querySelector('.app-window[data-app-id="calculator"]:not([hidden])')),
      windows: diagnostics.workspaceWindows()
    };
    return { workspaceOne, workspaceTwoBeforeOpen, workspaceTwoAfterOpen, workspaceOneReturn, workspaceTwoReturn };
  })()`);
  ensure(workspaceSwitch.workspaceOne.activeWorkspace === "1", `Desktop expected workspace 1 initially, got ${workspaceSwitch.workspaceOne.activeWorkspace}`);
  ensure(workspaceSwitch.workspaceOne.visible.includes("Notes"), "Workspace 1 must show a Notes window after opening Notes.");
  ensure(workspaceSwitch.workspaceOne.activePressed, "Workspace 1 button must show active pressed state.");
  ensure(workspaceSwitch.workspaceTwoBeforeOpen.activeWorkspace === "2", `Desktop expected workspace 2 after switch, got ${workspaceSwitch.workspaceTwoBeforeOpen.activeWorkspace}`);
  ensure(workspaceSwitch.workspaceTwoBeforeOpen.activePressed, "Workspace 2 button must show active pressed state.");
  ensure(!workspaceSwitch.workspaceTwoBeforeOpen.notesVisible, "Workspace 2 must hide the workspace 1 Notes window.");
  ensure(workspaceSwitch.workspaceTwoAfterOpen.calculatorVisible, "Workspace 2 must show Calculator after opening it there.");
  ensure(workspaceSwitch.workspaceOneReturn.notesVisible, "Returning to workspace 1 must show Notes again.");
  ensure(!workspaceSwitch.workspaceOneReturn.calculatorVisible, "Workspace 1 must hide the workspace 2 Calculator window.");
  ensure(workspaceSwitch.workspaceTwoReturn.calculatorVisible, "Returning to workspace 2 must show Calculator again.");
  ensure(!workspaceSwitch.workspaceTwoReturn.notesVisible, "Workspace 2 must continue hiding Notes.");
  ensure(
    workspaceSwitch.workspaceTwoReturn.windows.some((win) => win.appId === "notes" && win.workspace === "1" && !win.visible) &&
      workspaceSwitch.workspaceTwoReturn.windows.some((win) => win.appId === "calculator" && win.workspace === "2" && win.visible),
    "Desktop workspace diagnostics must expose isolated window assignments."
  );

  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  const workspacePersistence = await evaluate(client, `(() => ({
    activeWorkspace: window.__SEIS_DESKTOP__.activeWorkspace(),
    activePressed: Boolean(document.querySelector('[data-workspace="2"].is-active[aria-pressed="true"]')),
    visible: window.__SEIS_DESKTOP__.visibleWindowTitles()
  }))()`);
  ensure(workspacePersistence.activeWorkspace === "2", `Desktop active workspace should persist after reload, got ${workspacePersistence.activeWorkspace}`);
  ensure(workspacePersistence.activePressed, "Persisted workspace 2 button must restore active pressed state.");

  const windowResize = await evaluate(client, `(() => {
    window.__SEIS_DESKTOP__.openApp('terminal');
    const terminal = document.querySelector('.app-window[data-app-id="terminal"]:not([hidden])');
    const handle = terminal?.querySelector('[data-window-resize-handle]');
    if (!terminal || !handle) return { ok: false, reason: 'missing-resize-handle' };
    const before = terminal.getBoundingClientRect();
    const startX = before.right - 4;
    const startY = before.bottom - 4;
    handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: startX, clientY: startY }));
    document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: startX + 120, clientY: startY + 80 }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: startX + 120, clientY: startY + 80 }));
    const after = terminal.getBoundingClientRect();
    return {
      ok: true,
      before: { width: before.width, height: before.height },
      after: { width: after.width, height: after.height },
      hasCursor: getComputedStyle(handle).cursor.includes('resize')
    };
  })()`);
  ensure(windowResize.ok, `Desktop window resize handle missing: ${windowResize.reason || "unknown"}`);
  ensure(windowResize.after.width >= windowResize.before.width + 90, `Desktop resize should widen the window: ${JSON.stringify(windowResize)}`);
  ensure(windowResize.after.height >= windowResize.before.height + 55, `Desktop resize should heighten the window: ${JSON.stringify(windowResize)}`);
  ensure(windowResize.hasCursor, "Desktop resize handle must expose a resize cursor.");

  const windowSnap = await evaluate(client, `(() => {
    window.__SEIS_DESKTOP__.openApp('terminal');
    const terminal = document.querySelector('.app-window[data-app-id="terminal"]:not([hidden])');
    const left = terminal?.querySelector('[data-window-action="snap-left"]');
    const right = terminal?.querySelector('[data-window-action="snap-right"]');
    if (!terminal || !left || !right) return { ok: false, reason: 'missing-snap-controls' };
    left.click();
    const leftRect = terminal.getBoundingClientRect();
    const leftSnap = terminal.dataset.snap;
    right.click();
    const rightRect = terminal.getBoundingClientRect();
    const rightSnap = terminal.dataset.snap;
    return {
      ok: true,
      left: { x: leftRect.x, width: leftRect.width, snap: leftSnap },
      right: { x: rightRect.x, width: rightRect.width, snap: rightSnap },
      viewportWidth: window.innerWidth
    };
  })()`);
  ensure(windowSnap.ok, `Desktop snap controls missing: ${windowSnap.reason || "unknown"}`);
  ensure(windowSnap.left.snap === "left", `Desktop left snap state not recorded: ${JSON.stringify(windowSnap)}`);
  ensure(windowSnap.right.snap === "right", `Desktop right snap state not recorded: ${JSON.stringify(windowSnap)}`);
  ensure(windowSnap.left.x < windowSnap.viewportWidth * 0.35, `Desktop left snap should move window into left half: ${JSON.stringify(windowSnap)}`);
  ensure(windowSnap.right.x > windowSnap.left.x + 100, `Desktop right snap should move window rightward: ${JSON.stringify(windowSnap)}`);
  ensure(Math.abs(windowSnap.left.width - windowSnap.right.width) <= 2, `Desktop snap widths should match: ${JSON.stringify(windowSnap)}`);

  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  const sessionRestore = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const terminal = document.querySelector('.app-window[data-app-id="terminal"]:not([hidden])');
    const rect = terminal?.getBoundingClientRect();
    const session = diagnostics.sessionWindows();
    const terminalSession = session.find((win) => win.appId === 'terminal' && win.workspace === diagnostics.activeWorkspace());
    return {
      activeWorkspace: diagnostics.activeWorkspace(),
      visible: diagnostics.visibleWindowTitles(),
      terminalVisible: Boolean(terminal),
      snap: terminal?.dataset.snap || '',
      rect: rect ? { x: rect.x, width: rect.width, height: rect.height } : null,
      sessionCount: session.length,
      terminalSession
    };
  })()`);
  ensure(sessionRestore.activeWorkspace === "2", `Desktop session restore should preserve active workspace 2, got ${sessionRestore.activeWorkspace}`);
  ensure(sessionRestore.visible.includes("Terminal"), `Desktop session restore should keep a visible Terminal window: ${JSON.stringify(sessionRestore)}`);
  ensure(sessionRestore.terminalVisible, `Desktop session restore should render the Terminal on the active workspace: ${JSON.stringify(sessionRestore)}`);
  ensure(sessionRestore.snap === "right", `Desktop session restore should preserve Terminal snap state: ${JSON.stringify(sessionRestore)}`);
  ensure(sessionRestore.rect?.width >= 360, `Desktop session restore should preserve usable Terminal geometry: ${JSON.stringify(sessionRestore)}`);
  ensure(sessionRestore.sessionCount >= 3, `Desktop session restore should keep multiple restored app windows: ${JSON.stringify(sessionRestore)}`);
  ensure(sessionRestore.terminalSession?.snap === "right", `Desktop diagnostics should expose restored snap state: ${JSON.stringify(sessionRestore)}`);

  const shellContext = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const canvas = document.querySelector('[data-desktop-canvas]');
    canvas.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 360, clientY: 220 }));
    const desktopMenu = diagnostics.contextMenuState();
    document.querySelector('[data-context-menu] [data-action="set-wallpaper"][data-value="prism"]')?.click();
    const wallpaper = diagnostics.wallpaperState();

    diagnostics.runTerminalCommand('mkdir /home/seis/context-target');
    diagnostics.runTerminalCommand('echo context-drag > /home/seis/context-source.txt');
    diagnostics.openApp('files');
    const filesWindow = document.querySelector('.app-window[data-app-id="files"]:not([hidden])');
    const source = filesWindow?.querySelector('[data-file-card][data-path="/home/seis/context-source.txt"]');
    const target = filesWindow?.querySelector('[data-file-card][data-path="/home/seis/context-target"][data-drop-path]');
    const fileMenuTarget = target || source;
    fileMenuTarget?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 420, clientY: 300 }));
    const fileMenu = diagnostics.contextMenuState();
    document.querySelector('[data-context-menu] [data-action="copy-path"]')?.click();
    const drag = new DataTransfer();
    source?.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: drag }));
    target?.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: drag }));
    target?.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: drag }));
    const movedPath = '/home/seis/context-target/context-source.txt';

    const terminal = document.querySelector('.app-window[data-app-id="terminal"]:not([hidden])');
    terminal?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 520, clientY: 260 }));
    const windowMenu = diagnostics.contextMenuState();
    document.querySelector('[data-context-menu] [data-action="context-window-action"][data-value="fullscreen"]')?.click();
    const fullscreenWindow = document.querySelector('.app-window[data-app-id="terminal"]:not([hidden])');
    return {
      desktopMenu,
      wallpaper,
      fileMenu,
      sourceReady: Boolean(source),
      targetReady: Boolean(target),
      moved: diagnostics.filePaths().includes(movedPath),
      sourceGone: !diagnostics.filePaths().includes('/home/seis/context-source.txt'),
      copiedPathVisible: document.body.textContent.includes('/home/seis/context-target'),
      windowMenu,
      fullscreen: Boolean(fullscreenWindow?.classList.contains('is-fullscreen')),
      fullscreenSession: diagnostics.sessionWindows().find((win) => win.appId === 'terminal' && win.workspace === diagnostics.activeWorkspace())
    };
  })()`);
  ensure(shellContext.desktopMenu.kind === "desktop", `Desktop context menu should open on the canvas: ${JSON.stringify(shellContext.desktopMenu)}`);
  ensure(shellContext.desktopMenu.actions.includes("set-wallpaper"), `Desktop context menu must expose wallpaper actions: ${JSON.stringify(shellContext.desktopMenu)}`);
  ensure(shellContext.wallpaper.active === "prism" && shellContext.wallpaper.shell === "prism", `Wallpaper picker should update shell state: ${JSON.stringify(shellContext.wallpaper)}`);
  ensure(shellContext.fileMenu.kind === "file", `File context menu should open on Files cards: ${JSON.stringify(shellContext.fileMenu)}`);
  ensure(shellContext.fileMenu.actions.includes("copy-path"), `File context menu must expose copy path: ${JSON.stringify(shellContext.fileMenu)}`);
  ensure(shellContext.fileMenu.actions.includes("rename-file"), `File context menu must expose rename: ${JSON.stringify(shellContext.fileMenu)}`);
  ensure(shellContext.sourceReady && shellContext.targetReady, `Drag/drop fixture missing source or target: ${JSON.stringify(shellContext)}`);
  ensure(shellContext.moved && shellContext.sourceGone, `Files drag/drop should move VFS node into target folder: ${JSON.stringify(shellContext)}`);
  ensure(shellContext.copiedPathVisible, "File context menu copy-path action must update local clipboard/control-center state.");
  ensure(shellContext.windowMenu.kind === "window", `Window context menu should open on app windows: ${JSON.stringify(shellContext.windowMenu)}`);
  ensure(shellContext.windowMenu.actions.includes("context-window-action"), `Window context menu must expose window actions: ${JSON.stringify(shellContext.windowMenu)}`);
  ensure(shellContext.fullscreen, `Window context menu full-screen action should toggle fullscreen class: ${JSON.stringify(shellContext)}`);
  ensure(shellContext.fullscreenSession?.fullscreen === true, `Fullscreen state should be exposed in session diagnostics: ${JSON.stringify(shellContext.fullscreenSession)}`);

  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  const shellPersistence = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const terminal = document.querySelector('.app-window[data-app-id="terminal"]:not([hidden])');
    return {
      wallpaper: diagnostics.wallpaperState(),
      activeWorkspace: diagnostics.activeWorkspace(),
      terminalFullscreen: Boolean(terminal?.classList.contains('is-fullscreen')),
      moved: diagnostics.filePaths().includes('/home/seis/context-target/context-source.txt'),
      sourceGone: !diagnostics.filePaths().includes('/home/seis/context-source.txt')
    };
  })()`);
  ensure(shellPersistence.wallpaper.active === "prism" && shellPersistence.wallpaper.shell === "prism", `Wallpaper selection must persist after reload: ${JSON.stringify(shellPersistence)}`);
  ensure(shellPersistence.terminalFullscreen, `Fullscreen window state must persist after reload: ${JSON.stringify(shellPersistence)}`);
  ensure(shellPersistence.moved && shellPersistence.sourceGone, `Drag/drop moved path must persist after reload: ${JSON.stringify(shellPersistence)}`);

  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__?.systemState)", 10000);
  const controlCenter = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const statusButton = document.querySelector('[data-action="toggle-status"]');
    statusButton?.click();
    const open = !document.querySelector('[data-quick-status]')?.hasAttribute('hidden');
    const hasPanel = Boolean(document.querySelector('[data-control-center]'));
    const hasNotificationList = Boolean(document.querySelector('[data-notification-list]'));
    const before = diagnostics.systemState();
    document.querySelector('[data-action="clear-notifications"]')?.click();
    const clearedCount = diagnostics.systemState().notifications.length;
    document.querySelector('[data-action="toggle-network"]')?.click();
    document.querySelector('[data-action="toggle-audio"]')?.click();
    diagnostics.openApp('notes');
    const after = diagnostics.systemState();
    const networkLabel = document.querySelector('[data-status-network]')?.textContent?.trim() || '';
    const audioLabel = document.querySelector('[data-status-audio]')?.textContent?.trim() || '';
    const recentRows = document.querySelectorAll('[data-recent-list] button').length;
    const notifications = document.querySelectorAll('[data-notification-id]').length;
    return { open, hasPanel, hasNotificationList, before, clearedCount, after, networkLabel, audioLabel, recentRows, notifications };
  })()`);
  ensure(controlCenter.open, "Desktop Control Center must open from the top bar.");
  ensure(controlCenter.hasPanel, "Desktop Control Center panel missing.");
  ensure(controlCenter.hasNotificationList, "Desktop Notification Center list missing.");
  ensure(controlCenter.before.notifications.length >= 1, "Desktop Control Center must start with at least one persisted notification.");
  ensure(controlCenter.clearedCount === 0, `Desktop clear notifications must empty notification state: ${JSON.stringify(controlCenter)}`);
  ensure(controlCenter.after.networkOnline === false, `Desktop network toggle should persist offline state: ${JSON.stringify(controlCenter)}`);
  ensure(controlCenter.after.audioMuted === true, `Desktop audio toggle should persist muted state: ${JSON.stringify(controlCenter)}`);
  ensure(controlCenter.after.notifications.length >= 2, `Desktop status toggles should create notifications: ${JSON.stringify(controlCenter)}`);
  ensure(controlCenter.after.recent.some((item) => item.appId === "notes"), "Desktop opened apps must appear in recents.");
  ensure(controlCenter.networkLabel === "Offline", `Desktop network status label should update to Offline: ${JSON.stringify(controlCenter)}`);
  ensure(controlCenter.audioLabel === "Muted", `Desktop audio status label should update to Muted: ${JSON.stringify(controlCenter)}`);
  ensure(controlCenter.recentRows >= 1, "Desktop Control Center must render recent activity rows.");
  ensure(controlCenter.notifications >= 1, "Desktop Control Center must render persisted notification rows.");

  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  const controlCenterPersistence = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const system = diagnostics.systemState();
    document.querySelector('[data-action="toggle-status"]')?.click();
    return {
      networkOnline: system.networkOnline,
      audioMuted: system.audioMuted,
      recentNotes: system.recent.some((item) => item.appId === "notes"),
      notificationCount: system.notifications.length,
      renderedNotifications: document.querySelectorAll('[data-notification-id]').length
    };
  })()`);
  ensure(controlCenterPersistence.networkOnline === false, `Desktop network status must persist after reload: ${JSON.stringify(controlCenterPersistence)}`);
  ensure(controlCenterPersistence.audioMuted === true, `Desktop audio status must persist after reload: ${JSON.stringify(controlCenterPersistence)}`);
  ensure(controlCenterPersistence.recentNotes, "Desktop recent app history must persist after reload.");
  ensure(controlCenterPersistence.notificationCount >= 1, "Desktop notifications must persist after reload.");
  ensure(controlCenterPersistence.renderedNotifications >= 1, "Desktop notification rows must render after reload.");

  const shortcutOverlay = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', code: 'Slash', ctrlKey: true, bubbles: true }));
    const openedByKeyboard = !document.querySelector('[data-shortcut-overlay]')?.hasAttribute('hidden');
    const rows = document.querySelectorAll('[data-shortcut-grid] [data-action="run-shortcut-command"]').length;
    const groups = document.querySelectorAll('.shortcut-group').length;
    const beforeState = diagnostics.shortcutState();
    document.querySelector('[data-shortcut-grid] [data-value="workspace-1"]')?.click();
    const rowChangedWorkspace = diagnostics.activeWorkspace() === "1";
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '3', ctrlKey: true, altKey: true, bubbles: true }));
    const keyChangedWorkspace = diagnostics.activeWorkspace() === "3";
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 't', ctrlKey: true, altKey: true, bubbles: true }));
    const openedTerminalInWorkspace = diagnostics.visibleWindowTitles().includes("Terminal");
    const afterState = diagnostics.shortcutState();
    return {
      openedByKeyboard,
      rows,
      groups,
      beforeState,
      rowChangedWorkspace,
      keyChangedWorkspace,
      openedTerminalInWorkspace,
      afterState,
      topbarExpanded: document.querySelector('[data-status-shortcuts]')?.getAttribute('aria-expanded') || ''
    };
  })()`);
  ensure(shortcutOverlay.openedByKeyboard, "Desktop shortcut overlay must open from Ctrl/Cmd+/.");
  ensure(shortcutOverlay.rows >= 12, `Desktop shortcut overlay expected at least 12 executable rows, got ${shortcutOverlay.rows}.`);
  ensure(shortcutOverlay.groups === 3, `Desktop shortcut overlay expected three groups, got ${shortcutOverlay.groups}.`);
  ensure(shortcutOverlay.beforeState.shortcuts >= 12, `Desktop shortcut diagnostics expected at least 12 shortcuts, got ${shortcutOverlay.beforeState.shortcuts}.`);
  ensure(shortcutOverlay.rowChangedWorkspace, "Desktop shortcut overlay row must execute workspace switching.");
  ensure(shortcutOverlay.keyChangedWorkspace, "Desktop keyboard shortcut must switch to workspace 3.");
  ensure(shortcutOverlay.openedTerminalInWorkspace, "Desktop Ctrl/Cmd+Alt+T shortcut must open Terminal in the active workspace.");
  ensure(shortcutOverlay.afterState.lastShortcut === "open-terminal", `Desktop shortcut state must record the last keyboard shortcut: ${JSON.stringify(shortcutOverlay)}`);
  ensure(shortcutOverlay.topbarExpanded === "true", "Desktop top-bar shortcut button must expose expanded state while overlay is open.");

  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  const shortcutPersistence = await evaluate(client, `(() => {
    const state = window.__SEIS_DESKTOP__.shortcutState();
    return {
      opens: state.opens,
      lastShortcut: state.lastShortcut,
      shortcuts: state.shortcuts,
      activeWorkspace: window.__SEIS_DESKTOP__.activeWorkspace()
    };
  })()`);
  ensure(shortcutPersistence.opens >= 1, `Desktop shortcut overlay opens must persist after reload: ${JSON.stringify(shortcutPersistence)}`);
  ensure(shortcutPersistence.lastShortcut === "open-terminal", `Desktop shortcut last command must persist after reload: ${JSON.stringify(shortcutPersistence)}`);
  ensure(shortcutPersistence.shortcuts >= 12, "Desktop shortcut manifest must remain available after reload.");
  ensure(shortcutPersistence.activeWorkspace === "3", `Desktop workspace 3 selected by shortcut must persist after reload, got ${shortcutPersistence.activeWorkspace}.`);

  await clickSelector(client, "[data-action='toggle-launcher']");
  const launcherOpen = await evaluate(client, "!document.querySelector('[data-launcher]')?.hasAttribute('hidden')");
  ensure(launcherOpen, "Desktop launcher toggle must open launcher.");

  await clickSelector(client, "[data-demo-route-group] [data-value='seis-ai-app']");
  await waitFor(client, "window.__SEIS_DESKTOP__.openWindows().includes('AI Assistant')", 5000);
  const aiPluginCenter = await evaluate(client, `(() => ({
    pluginTab: Boolean(document.querySelector('[data-ai-plugin-tab="Plugin Center"]')),
    pluginCenter: Boolean(document.querySelector('[data-ai-plugin-center]')),
    pluginControls: document.querySelectorAll('[data-action="toggle-ai-plugin"]').length
  }))()`);
  ensure(aiPluginCenter.pluginTab, "AI App must expose Plugin Center tab.");
  ensure(aiPluginCenter.pluginCenter, "AI App must render Plugin Center panel.");
  ensure(aiPluginCenter.pluginControls >= 1, "AI Plugin Center must expose enable/disable controls.");
  await clickSelector(client, "[data-ai-plugin-tab='Installed AI']");
  await waitFor(client, "document.querySelector('[data-installed-ai-systems]')", 5000);
  const installedAiSystems = await evaluate(client, `(() => ({
    profileRows: document.querySelectorAll('[data-installed-ai-system]').length,
    diagnosticsCount: window.__SEIS_DESKTOP__.installedAiSystems().length,
    hasAuditButton: Boolean(document.querySelector('[data-action="audit-installed-ai-systems"]')),
    localDemoVisible: document.body.textContent.includes('SEIS Local Demo Runtime'),
    noKeyVisible: document.body.textContent.includes('No key required')
  }))()`);
  ensure(installedAiSystems.profileRows === 6, `Installed AI tab expected six system rows, got ${installedAiSystems.profileRows}.`);
  ensure(installedAiSystems.diagnosticsCount === 6, `Installed AI diagnostics expected six systems, got ${installedAiSystems.diagnosticsCount}.`);
  ensure(installedAiSystems.hasAuditButton, "Installed AI tab must expose a local audit action.");
  ensure(installedAiSystems.localDemoVisible, "Installed AI tab must show the Local Demo runtime profile.");
  ensure(installedAiSystems.noKeyVisible, "Installed AI tab must show no-key local provider language.");
  await clickSelector(client, "[data-action='audit-installed-ai-systems']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/installed-ai-systems-audit.md')", 5000);
  await clickSelector(client, "[data-ai-plugin-tab='Plugin Center']");
  await waitFor(client, "document.querySelector('[data-ai-plugin-center]')", 5000);

  await clickSelector(client, "[data-action='toggle-launcher']");
  await clickSelector(client, "[data-demo-route-group] [data-value='sub-agent-os-demo']");
  await waitFor(client, "window.__SEIS_DESKTOP__.openWindows().includes('Sub-Agent Control')", 5000);
  const subAgentInitial = await evaluate(client, `(() => ({
    hasRunButton: Boolean(document.querySelector('[data-subagent-os-demo] [data-action="run-subagent-simulation"]')),
    hasCycleButton: Boolean(document.querySelector('[data-subagent-os-demo] [data-action="run-next-subagent-cycle"]')),
    profileButtons: document.querySelectorAll('[data-subagent-os-demo] [data-action="set-os-profile"]').length,
    showsOsProfile: document.body.textContent.includes('OS Profile'),
    hasPulseButton: Boolean(document.querySelector('[data-subagent-os-demo] [data-action="pulse-subagent-processes"]')),
    hasAiCoreOrbit: Boolean(document.querySelector('[data-ai-core-orbit]')),
    aiCoreVersionCards: document.querySelectorAll('[data-ai-core-version-target]').length,
    aiCoreLaneNodes: document.querySelectorAll('[data-ai-core-lane-node]').length,
    aiCoreVersion: document.querySelector('[data-ai-core-orbit]')?.dataset.seisAiCoreVersion || '',
    processRows: document.querySelectorAll('[data-subagent-process]').length,
    diagnosticsProcessCount: window.__SEIS_DESKTOP__.subAgentProcesses().length,
    diagnosticsVersionCount: window.__SEIS_DESKTOP__.aiCoreOrbit().versionTargets.length,
    processMetric: document.body.textContent.includes('Agent Processes'),
    quarterCount: document.querySelectorAll('[data-subagent-quarter-grid] article').length
  }))()`);
  await clickSelector(client, "[data-subagent-os-demo] [data-action='rotate-ai-core-orbit']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/seis-ai-core-orbit-snapshot.md')", 5000);
  await clickSelector(client, "[data-subagent-os-demo] [data-action='promote-ai-core-version']");
  await waitFor(client, "document.querySelector('[data-ai-core-orbit]')?.dataset.seisAiCoreVersion === 'v0.2-read-only-intelligence'", 5000);
  const aiCorePreviewVersion = await evaluate(client, "document.querySelector('[data-ai-core-orbit]')?.dataset.seisAiCoreVersion || ''");
  await clickSelector(client, "[data-subagent-os-demo] [data-action='pulse-subagent-processes']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/sub-agent-process-ledger.md')", 5000);
  await clickSelector(client, "[data-subagent-process='security'] [data-action='toggle-subagent-process']");
  await waitFor(client, "window.__SEIS_DESKTOP__.subAgentProcesses().some((process) => process.laneId === 'security' && process.status === 'Suspended')", 5000);
  await clickSelector(client, "[data-subagent-os-demo] [data-action='run-next-subagent-cycle']");
  await waitFor(client, "document.body.textContent.includes('1/20 quarters') && window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/sub-agent-cycle-report.md')", 5000);
  await clickSelector(client, "[data-subagent-os-demo] [data-action='run-subagent-simulation']");
  await waitFor(client, "document.body.textContent.includes('20/20 quarters') && window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/sub-agent-five-year-simulation.md')", 5000);
  const subAgentDemo = await evaluate(client, `(() => {
    const paths = window.__SEIS_DESKTOP__.filePaths();
    const processes = window.__SEIS_DESKTOP__.subAgentProcesses();
    return {
      ...${JSON.stringify(subAgentInitial)},
      processLedgerArtifact: paths.includes('/home/seis/Documents/sub-agent-process-ledger.md'),
      aiCoreOrbitArtifact: paths.includes('/home/seis/Documents/seis-ai-core-orbit-snapshot.md'),
      aiCoreFinalVersion: document.querySelector('[data-ai-core-orbit]')?.dataset.seisAiCoreVersion || '',
      cycleReportArtifact: paths.includes('/home/seis/Documents/sub-agent-cycle-report.md'),
      suspendedSecurity: processes.some((process) => process.laneId === 'security' && process.status === 'Suspended'),
      completedText: document.body.textContent.includes('20/20 quarters'),
      simulationArtifact: paths.includes('/home/seis/Documents/sub-agent-five-year-simulation.md')
    };
  })()`);
  ensure(subAgentDemo.hasRunButton, "Sub-Agent Control must expose a five-year simulation action.");
  ensure(subAgentDemo.hasCycleButton, "Sub-Agent Control must expose a next-cycle action.");
  ensure(subAgentDemo.profileButtons === 3, `Sub-Agent Control expected 3 OS profile buttons, got ${subAgentDemo.profileButtons}`);
  ensure(subAgentDemo.showsOsProfile, "Sub-Agent Control must show the active OS profile.");
  ensure(subAgentDemo.hasPulseButton, "Sub-Agent Control must expose a process pulse action.");
  ensure(subAgentDemo.hasAiCoreOrbit, "Sub-Agent Control must render the AI Core spatial command surface.");
  ensure(subAgentDemo.aiCoreVersionCards === 5, `Sub-Agent Control expected five AI Core version cards, got ${subAgentDemo.aiCoreVersionCards}`);
  ensure(subAgentDemo.aiCoreLaneNodes === 6, `Sub-Agent Control expected six AI Core lane nodes, got ${subAgentDemo.aiCoreLaneNodes}`);
  ensure(subAgentDemo.diagnosticsVersionCount === 5, `Sub-Agent diagnostics expected five AI Core version targets, got ${subAgentDemo.diagnosticsVersionCount}`);
  ensure(subAgentDemo.aiCoreOrbitArtifact, "AI Core orbit action must create a local snapshot artifact.");
  ensure(aiCorePreviewVersion === "v0.2-read-only-intelligence", `AI Core promotion preview expected v0.2-read-only-intelligence, got ${aiCorePreviewVersion}`);
  ensure(subAgentDemo.aiCoreFinalVersion === "v1.0-public-enterprise-candidate", `AI Core five-year simulation expected v1.0-public-enterprise-candidate, got ${subAgentDemo.aiCoreFinalVersion}`);
  ensure(subAgentDemo.processRows === 6, `Sub-Agent Control expected 6 managed process rows, got ${subAgentDemo.processRows}`);
  ensure(subAgentDemo.diagnosticsProcessCount === 6, `Sub-Agent diagnostics expected 6 managed processes, got ${subAgentDemo.diagnosticsProcessCount}`);
  ensure(subAgentDemo.processLedgerArtifact, "Sub-Agent process pulse must create a local process ledger artifact.");
  ensure(subAgentDemo.cycleReportArtifact, "Sub-Agent next-cycle action must create a local cycle report artifact.");
  ensure(subAgentDemo.suspendedSecurity, "Sub-Agent process controls must suspend a local process.");
  ensure(subAgentDemo.processMetric, "Sub-Agent Control must show managed process metrics.");
  ensure(subAgentDemo.quarterCount === 20, `Sub-Agent Control expected 20 simulated quarters, got ${subAgentDemo.quarterCount}`);
  ensure(subAgentDemo.completedText, "Sub-Agent Control simulation must complete all 20 quarters locally.");
  ensure(subAgentDemo.simulationArtifact, "Sub-Agent Control simulation must create the local simulation artifact.");

  await clickSelector(client, "[data-action='toggle-launcher']");
  await clickSelector(client, ".launcher-app[data-app-id='calculator']");
  await waitFor(client, "window.__SEIS_DESKTOP__.openWindows().includes('Calculator')", 5000);
  const calculatorReady = await evaluate(client, "Boolean(document.querySelector('[data-calculator-expression]'))");
  ensure(calculatorReady, "Calculator app must render expression input.");

  await clickSelector(client, "[data-action='open-search']");
  const paletteOpen = await evaluate(client, "!document.querySelector('[data-command-palette]')?.hasAttribute('hidden')");
  ensure(paletteOpen, "Desktop command palette must open.");
  const searchRoutes = await evaluate(client, `(() => {
    const input = document.querySelector('[data-command-input]');
    input.value = 'SEIS Code Web';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return document.querySelectorAll('[data-command-results] [data-value="seis-code-web"]').length;
  })()`);
  ensure(searchRoutes >= 1, "SEIS Search must expose SEIS Code Web route.");

  const afterTerminal = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    diagnostics.runTerminalCommand('echo browser-smoke > qa/browser-smoke.txt');
    diagnostics.runTerminalCommand('mkdir qa/nested');
    diagnostics.runTerminalCommand('echo moved-smoke > qa/move-source.txt');
    diagnostics.runTerminalCommand('mv qa/move-source.txt qa/moved-smoke.txt');
    diagnostics.runTerminalCommand('cat qa/moved-smoke.txt');
    diagnostics.runTerminalCommand('echo remove-smoke > qa/remove-me.txt');
    diagnostics.runTerminalCommand('rm qa/remove-me.txt');
    diagnostics.runTerminalCommand('touch qa/type-file');
    diagnostics.runTerminalCommand('mkdir qa/type-file');
    diagnostics.runTerminalCommand('echo blocked > qa/nested');
    diagnostics.runTerminalCommand('mv qa qa/nested/qa-copy');
    diagnostics.runTerminalCommand('cat qa/browser-smoke.txt');
    diagnostics.runTerminalCommand('claude');
    diagnostics.runTerminalCommand('/status');
    diagnostics.runTerminalCommand('/exit');
    const paths = diagnostics.filePaths();
    return {
      terminalText: document.querySelector('[data-terminal-output]')?.textContent || '',
      fileVisible: paths.includes('/home/seis/qa/browser-smoke.txt'),
      folderVisible: paths.includes('/home/seis/qa/nested'),
      movedVisible: paths.includes('/home/seis/qa/moved-smoke.txt'),
      sourceGone: !paths.includes('/home/seis/qa/move-source.txt'),
      removedGone: !paths.includes('/home/seis/qa/remove-me.txt')
    };
  })()`);
  ensure(afterTerminal.terminalText.includes("browser-smoke"), "Desktop terminal must write and read virtual files.");
  ensure(afterTerminal.terminalText.includes("moved-smoke"), "Desktop terminal must read moved virtual files.");
  ensure(afterTerminal.terminalText.includes("not a directory"), "Desktop terminal must reject mkdir over an existing file.");
  ensure(afterTerminal.terminalText.includes("cannot write to directory"), "Desktop terminal must reject redirect writes into a directory.");
  ensure(afterTerminal.terminalText.includes("cannot move a directory into itself"), "Desktop terminal must reject self-subtree directory moves.");
  ensure(afterTerminal.terminalText.includes("Local Demo"), "Desktop claude command must truthfully show Local Demo mode.");
  ensure(afterTerminal.fileVisible, "Desktop terminal-created file must appear in virtual file system.");
  ensure(afterTerminal.folderVisible, "Desktop terminal-created folder must appear in virtual file system.");
  ensure(afterTerminal.movedVisible, "Desktop moved file must appear at its destination.");
  ensure(afterTerminal.sourceGone, "Desktop moved file source path must be removed.");
  ensure(afterTerminal.removedGone, "Desktop removed file must disappear from the virtual file system.");

  const audit = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    for (const app of diagnostics.appCatalog) diagnostics.openApp(app.id);
    return new Promise((resolve) => setTimeout(() => {
      const appAudit = diagnostics.appActionAudit();
      const summary = diagnostics.interactivitySummary();
      resolve({
        openWindows: diagnostics.openWindows().length,
        auditedApps: appAudit.length,
        unopened: appAudit.filter((app) => !app.opened).map((app) => app.id),
        weak: appAudit.filter((app) => !app.functional).map((app) => app.id),
        primaryWorkflowApps: appAudit.filter((app) => app.hasPrimaryWorkflow).length,
        interactivityRate: summary.rate,
        buttonCount: summary.buttons
      });
    }, 450));
  })()`, 30000);

  ensure(audit.openWindows >= 50, `Desktop expected at least 50 open app windows, got ${audit.openWindows}`);
  ensure(audit.auditedApps >= 50, `Desktop expected at least 50 audited apps, got ${audit.auditedApps}`);
  ensure(audit.unopened.length === 0, `Desktop apps failed to open: ${audit.unopened.join(", ")}`);
  ensure(audit.weak.length === 0, `Desktop apps missing functional controls: ${audit.weak.join(", ")}`);
  ensure(audit.primaryWorkflowApps >= 50, `Desktop expected at least 50 primary workflow surfaces, got ${audit.primaryWorkflowApps}`);
  ensure(audit.interactivityRate >= 0.8, `Desktop post-open interactivity rate below 80%: ${(audit.interactivityRate * 100).toFixed(1)}%`);

  const workflowExecution = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const primaryAppIds = diagnostics.appActionAudit()
      .filter((app) => app.hasPrimaryWorkflow)
      .map((app) => app.id);
    const beforePaths = diagnostics.filePaths();
    for (const id of primaryAppIds) {
      const button = document.querySelector('.app-window[data-app-id="' + id + '"] button[data-action="app-primary"]');
      if (button) button.click();
    }
    return new Promise((resolve) => setTimeout(() => {
      const statuses = diagnostics.appCatalog.map((app) => ({
        id: app.id,
        status: diagnostics.appStatus(app.id).lastAction || "Ready"
      }));
      const executed = statuses.filter((item) => item.status && item.status !== "Ready");
      const afterPaths = diagnostics.filePaths();
      const generatedWorkflowArtifactPaths = afterPaths.filter((path) => [
        "/home/seis/Documents/settings-snapshot.json",
        "/home/seis/Documents/app-center-catalog.json",
        "/home/seis/Documents/extensions-audit.json",
        "/home/seis/Documents/sub-agent-control-dry-run.md",
        "/home/seis/Documents/seis-demo-studio-evidence.md",
        "/home/seis/Documents/seis-design-demo-handoff.md",
        "/home/seis/Documents/seis-cloud-local-preflight.md",
        "/home/seis/Documents/seis-evolution-snapshot.md"
      ].includes(path) || path.startsWith("/home/seis/Documents/files-index-"));
      resolve({
        primaryButtons: primaryAppIds.length,
        executedApps: executed.length,
        fileCountDelta: afterPaths.length - beforePaths.length,
        executedAppIds: executed.map((item) => item.id),
        generatedWorkflowArtifacts: generatedWorkflowArtifactPaths.length,
        generatedWorkflowArtifactPaths,
        unexecutedPrimaryApps: statuses
          .filter((item) => item.status === "Ready")
          .map((item) => item.id)
          .filter((id) => document.querySelector('.app-window[data-app-id="' + id + '"] button[data-action="app-primary"]'))
      });
    }, 900));
  })()`, 30000);
  ensure(workflowExecution.primaryButtons >= 50, `Desktop expected at least 50 executable primary workflow buttons, got ${workflowExecution.primaryButtons}`);
  ensure(
    workflowExecution.executedApps >= 50,
    `Desktop expected at least 50 executed primary workflows, got ${workflowExecution.executedApps}; unexecuted primary apps: ${workflowExecution.unexecutedPrimaryApps.join(", ")}`
  );
  ensure(workflowExecution.generatedWorkflowArtifacts >= 6, `Desktop expected primary workflows to generate local VFS artifacts, got ${workflowExecution.generatedWorkflowArtifacts}`);

  const screenshotPath = await screenshot(client, "desktop-os-desktop.png");
  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  const workflowPersistence = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const expectedArtifactPaths = ${JSON.stringify(workflowExecution.generatedWorkflowArtifactPaths)};
    const expectedAppIds = ${JSON.stringify(workflowExecution.executedAppIds)};
    const paths = diagnostics.filePaths();
    const missingArtifacts = expectedArtifactPaths.filter((path) => !paths.includes(path));
    const persistedStatuses = expectedAppIds.filter((id) => {
      const status = diagnostics.appStatus(id).lastAction || "Ready";
      return status && status !== "Ready";
    });
    return {
      expectedArtifacts: expectedArtifactPaths.length,
      persistedArtifacts: expectedArtifactPaths.length - missingArtifacts.length,
      missingArtifacts,
      expectedExecutedApps: expectedAppIds.length,
      persistedStatuses: persistedStatuses.length
    };
  })()`);
  ensure(
    workflowPersistence.persistedArtifacts >= 6,
    `Desktop expected at least six workflow artifacts to persist after reload, got ${workflowPersistence.persistedArtifacts}; missing: ${workflowPersistence.missingArtifacts.join(", ")}`
  );
  ensure(
    workflowPersistence.persistedStatuses >= 50,
    `Desktop expected at least 50 workflow statuses to persist after reload, got ${workflowPersistence.persistedStatuses}`
  );
  return {
    initial,
    bootAndLauncher,
    profileSwitch,
    workspaceSwitch,
    workspacePersistence,
    windowResize,
    windowSnap,
    sessionRestore,
    shellContext,
    shellPersistence,
    controlCenter,
    controlCenterPersistence,
    shortcutOverlay,
    shortcutPersistence,
    subAgentDemo,
    audit,
    workflowExecution,
    workflowPersistence,
    screenshot: screenshotPath
  };
}

async function smokeDesktopToCodeBridge(client, baseUrl) {
  await goto(client, `${baseUrl}/seis-code.html`);
  await waitFor(client, "Boolean(window.__SEIS_CODE__)", 10000);
  await waitFor(client, "window.__SEIS_CODE__?.fallbackReady?.() || window.__SEIS_CODE__?.monacoReady?.()", 10000);

  const bridgeReady = await waitFor(
    client,
    `(() => {
      const paths = window.__SEIS_CODE__?.filePaths?.() || [];
      return paths.includes('/workspace/qa/browser-smoke.txt') &&
        paths.includes('/workspace/qa/nested') &&
        paths.includes('/workspace/qa/moved-smoke.txt') &&
        !paths.includes('/workspace/qa/move-source.txt') &&
        !paths.includes('/workspace/qa/remove-me.txt');
    })()`,
    10000
  );
  ensure(bridgeReady, "Desktop-created, moved, and removed paths must mirror into SEIS Code workspace.");

  const bridge = await evaluate(client, `(async () => {
    const diagnostics = window.__SEIS_CODE__;
    await diagnostics.runTerminalCommand('cat qa/browser-smoke.txt');
    await diagnostics.runTerminalCommand('cat qa/moved-smoke.txt');
    const paths = diagnostics.filePaths();
    return {
      fileVisible: paths.includes('/workspace/qa/browser-smoke.txt'),
      folderVisible: paths.includes('/workspace/qa/nested'),
      movedVisible: paths.includes('/workspace/qa/moved-smoke.txt'),
      sourceGone: !paths.includes('/workspace/qa/move-source.txt'),
      removedGone: !paths.includes('/workspace/qa/remove-me.txt'),
      terminalText: diagnostics.terminalText(),
      providerText: diagnostics.providerText(),
      editorReady: diagnostics.monacoReady() || diagnostics.fallbackReady()
    };
  })()`);

  ensure(bridge.editorReady, "SEIS Code must initialize Monaco or the explicit fallback editor.");
  ensure(bridge.fileVisible, "SEIS Code diagnostics must include mirrored desktop file.");
  ensure(bridge.folderVisible, "SEIS Code diagnostics must include mirrored desktop folder.");
  ensure(bridge.movedVisible, "SEIS Code diagnostics must include mirrored moved file.");
  ensure(bridge.sourceGone, "SEIS Code diagnostics must remove old moved-file source path.");
  ensure(bridge.removedGone, "SEIS Code diagnostics must remove deleted desktop file path.");
  ensure(bridge.terminalText.includes("browser-smoke"), "SEIS Code terminal must read mirrored desktop file.");
  ensure(bridge.terminalText.includes("moved-smoke"), "SEIS Code terminal must read mirrored moved desktop file.");
  ensure(bridge.providerText.includes("Local Demo"), "SEIS Code provider identity must remain truthful in no-key mode.");

  const screenshotPath = await screenshot(client, "desktop-os-seis-code-bridge.png");
  return { ...bridge, screenshot: screenshotPath };
}

async function smokeMobile(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await bootDesktop(client, baseUrl);
  await delay(700);

  const mobile = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const tapTargets = Array.from(document.querySelectorAll('button, a, input, textarea, select')).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
        tag: element.tagName.toLowerCase(),
        className: element.className || '',
        action: element.dataset?.action || '',
        label: (element.getAttribute('aria-label') || element.textContent || '').trim().slice(0, 48)
      };
    }).filter((target) => target.visible);
    const crampedTargetDetails = tapTargets.filter((target) => target.width < 36 || target.height < 32);
    return {
      appCount: diagnostics.appCount,
      activityTargets: tapTargets.length,
      crampedTargets: crampedTargetDetails.length,
      crampedTargetDetails,
      terminalReady: Boolean(document.querySelector('[data-terminal-input]')),
      launcherApps: document.querySelectorAll('.launcher-app[data-action="open-app"]').length,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      interactivityRate: diagnostics.interactivitySummary().rate,
      windowCount: diagnostics.openWindows().length,
      shellHeight: document.querySelector('.desktop-shell')?.getBoundingClientRect().height || 0,
      crampedTargetSummary: crampedTargetDetails
        .slice(0, 12)
        .map((target) => target.label + ' [' + target.action + '] ' + Math.round(target.width) + 'x' + Math.round(target.height))
        .join(' | ')
    };
  })()`);

  ensure(mobile.appCount >= 50, `Desktop mobile expected app catalog, got ${mobile.appCount}`);
  ensure(mobile.activityTargets >= 20, `Desktop mobile expected interactive controls, got ${mobile.activityTargets}`);
  ensure(
    mobile.crampedTargets <= 4,
    `Desktop mobile has too many cramped targets: ${mobile.crampedTargets}; ${mobile.crampedTargetSummary}`
  );
  ensure(mobile.terminalReady, "Desktop mobile terminal input missing.");
  ensure(mobile.launcherApps >= 50, `Desktop mobile launcher expected 50 app buttons, got ${mobile.launcherApps}`);
  ensure(!mobile.horizontalOverflow, "Desktop mobile horizontal overflow detected.");
  ensure(mobile.interactivityRate >= 0.8, `Desktop mobile interactivity rate below 80%: ${(mobile.interactivityRate * 100).toFixed(1)}%`);
  ensure(mobile.windowCount >= 2, `Desktop mobile expected startup windows, got ${mobile.windowCount}`);
  ensure(mobile.shellHeight >= 700, `Desktop mobile shell height too small: ${mobile.shellHeight}`);

  const screenshotPath = await screenshot(client, "desktop-os-mobile.png");
  return { ...mobile, screenshot: screenshotPath };
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) throw new Error("No Chrome or Chromium executable found. Set CHROME_PATH to run the desktop OS browser smoke.");

  rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const staticServer = createStaticServer();
  await new Promise((resolveListen) => staticServer.listen(0, HOST, resolveListen));
  const appPort = staticServer.address().port;
  const debugPort = 9423 + Math.floor(Math.random() * 300);
  const userDataDir = join(tmpdir(), `seis-desktop-os-chrome-${Date.now()}`);
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    "--remote-allow-origins=*",
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank"
  ], { stdio: "ignore" });

  let client;

  try {
    client = await newTab(debugPort);
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });

    const baseUrl = `http://${HOST}:${appPort}`;
    const desktop = await smokeDesktop(client, baseUrl);
    const bridge = await smokeDesktopToCodeBridge(client, baseUrl);
    const mobile = await smokeMobile(client, baseUrl);
    const relevantIssues = collectRelevantIssues(client.events);
    ensure(relevantIssues.length === 0, `browser console/network issues detected: ${JSON.stringify(relevantIssues)}`);

    if (failures.length > 0) {
      console.error("SEIS desktop OS browser smoke failed:");
      for (const failure of failures) console.error(`- ${failure}`);
      process.exitCode = 1;
      return;
    }

    console.log(JSON.stringify({
      ok: true,
      browser: chromePath,
      appPort,
      screenshotDir: resolve(SCREENSHOT_DIR),
      desktop,
      bridge,
      mobile
    }, null, 2));
  } finally {
    if (client) client.close();
    chrome.kill("SIGTERM");
    staticServer.close();
    setTimeout(() => rmSync(userDataDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 }), 500);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
