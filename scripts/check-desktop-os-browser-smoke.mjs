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
}

function collectRelevantIssues(events) {
  return events
    .filter((event) => ["Runtime.exceptionThrown", "Log.entryAdded", "Network.loadingFailed"].includes(event.method))
    .map((event) => ({
      level: event.params?.type || event.method,
      text: event.params?.args?.map((arg) => arg.value || arg.description || "").join(" ") || event.params?.errorText || "",
      url: event.params?.url || ""
    }))
    .filter((issue) => !`${issue.text} ${issue.url}`.includes("favicon"))
    .filter((issue) => !`${issue.text} ${issue.url}`.includes("net::ERR_ABORTED"))
    .filter((issue) => !`${issue.text} ${issue.url}`.includes("cdn.jsdelivr.net/npm/monaco-editor"));
}

async function smokeDesktop(client, baseUrl) {
  await bootDesktop(client, baseUrl);

  const initial = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const summary = diagnostics.interactivitySummary();
    return {
      title: document.title,
      appCount: diagnostics.appCount,
      terminalCommands: diagnostics.terminalCommands.length,
      openWindows: diagnostics.openWindows(),
      launcherApps: document.querySelectorAll('.launcher-app[data-action="open-app"]').length,
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

  ensure(initial.title === "SEIS Desktop", `Desktop title mismatch: ${initial.title}`);
  ensure(initial.appCount >= 50, `Desktop expected at least 50 apps, got ${initial.appCount}`);
  ensure(initial.terminalCommands >= 12, `Desktop expected at least 12 terminal commands, got ${initial.terminalCommands}`);
  ensure(initial.openWindows.includes("Files"), "Desktop must boot with Files open.");
  ensure(initial.openWindows.includes("Terminal"), "Desktop must boot with Terminal open.");
  ensure(initial.launcherApps >= 50, `Desktop launcher expected at least 50 app buttons, got ${initial.launcherApps}`);
  ensure(initial.dockApps >= 8, `Desktop dock expected useful launch targets, got ${initial.dockApps}`);
  ensure(initial.desktopShortcuts >= 4, `Desktop expected desktop shortcuts, got ${initial.desktopShortcuts}`);
  ensure(initial.terminalReady, "Desktop terminal input missing.");
  ensure(!initial.horizontalOverflow, "Desktop horizontal overflow detected.");
  ensure(initial.interactivityRate >= 0.8, `Desktop interactivity rate below 80%: ${(initial.interactivityRate * 100).toFixed(1)}%`);
  ensure(!initial.overlayText, "Desktop framework/error overlay text detected.");

  await clickSelector(client, "[data-action='toggle-launcher']");
  const launcherOpen = await evaluate(client, "!document.querySelector('[data-launcher]')?.hasAttribute('hidden')");
  ensure(launcherOpen, "Desktop launcher toggle must open launcher.");

  await clickSelector(client, ".launcher-app[data-app-id='calculator']");
  await waitFor(client, "window.__SEIS_DESKTOP__.openWindows().includes('Calculator')", 5000);
  const calculatorReady = await evaluate(client, "Boolean(document.querySelector('[data-calculator-expression]'))");
  ensure(calculatorReady, "Calculator app must render expression input.");

  await clickSelector(client, "[data-action='open-search']");
  const paletteOpen = await evaluate(client, "!document.querySelector('[data-command-palette]')?.hasAttribute('hidden')");
  ensure(paletteOpen, "Desktop command palette must open.");

  const afterTerminal = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    diagnostics.runTerminalCommand('echo browser-smoke > qa/browser-smoke.txt');
    diagnostics.runTerminalCommand('cat qa/browser-smoke.txt');
    diagnostics.runTerminalCommand('claude');
    diagnostics.runTerminalCommand('/status');
    diagnostics.runTerminalCommand('/exit');
    return {
      terminalText: document.querySelector('[data-terminal-output]')?.textContent || '',
      fileVisible: diagnostics.filePaths().includes('/home/seis/qa/browser-smoke.txt')
    };
  })()`);
  ensure(afterTerminal.terminalText.includes("browser-smoke"), "Desktop terminal must write and read virtual files.");
  ensure(afterTerminal.terminalText.includes("Local Demo"), "Desktop claude command must truthfully show Local Demo mode.");
  ensure(afterTerminal.fileVisible, "Desktop terminal-created file must appear in virtual file system.");

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
  })()`);

  ensure(audit.openWindows >= 50, `Desktop expected at least 50 open app windows, got ${audit.openWindows}`);
  ensure(audit.auditedApps >= 50, `Desktop expected at least 50 audited apps, got ${audit.auditedApps}`);
  ensure(audit.unopened.length === 0, `Desktop apps failed to open: ${audit.unopened.join(", ")}`);
  ensure(audit.weak.length === 0, `Desktop apps missing functional controls: ${audit.weak.join(", ")}`);
  ensure(audit.primaryWorkflowApps >= 35, `Desktop expected at least 35 primary workflow surfaces, got ${audit.primaryWorkflowApps}`);
  ensure(audit.interactivityRate >= 0.8, `Desktop post-open interactivity rate below 80%: ${(audit.interactivityRate * 100).toFixed(1)}%`);

  const screenshotPath = await screenshot(client, "desktop-os-desktop.png");
  return { initial, audit, screenshot: screenshotPath };
}

async function smokeDesktopToCodeBridge(client, baseUrl) {
  await goto(client, `${baseUrl}/seis-code.html`);
  await waitFor(client, "Boolean(window.__SEIS_CODE__)", 10000);
  await waitFor(client, "window.__SEIS_CODE__?.fallbackReady?.() || window.__SEIS_CODE__?.monacoReady?.()", 10000);

  const fileVisible = await waitFor(
    client,
    "window.__SEIS_CODE__?.filePaths?.().includes('/workspace/qa/browser-smoke.txt')",
    10000
  );
  ensure(fileVisible, "Desktop-created terminal file must mirror into SEIS Code workspace.");

  const bridge = await evaluate(client, `(async () => {
    const diagnostics = window.__SEIS_CODE__;
    await diagnostics.runTerminalCommand('cat qa/browser-smoke.txt');
    return {
      fileVisible: diagnostics.filePaths().includes('/workspace/qa/browser-smoke.txt'),
      terminalText: diagnostics.terminalText(),
      providerText: diagnostics.providerText(),
      editorReady: diagnostics.monacoReady() || diagnostics.fallbackReady()
    };
  })()`);

  ensure(bridge.editorReady, "SEIS Code must initialize Monaco or the explicit fallback editor.");
  ensure(bridge.fileVisible, "SEIS Code diagnostics must include mirrored desktop file.");
  ensure(bridge.terminalText.includes("browser-smoke"), "SEIS Code terminal must read mirrored desktop file.");
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
      return { width: rect.width, height: rect.height, visible: rect.width > 0 && rect.height > 0 };
    }).filter((target) => target.visible);
    const crampedTargets = tapTargets.filter((target) => target.width < 36 || target.height < 32).length;
    return {
      appCount: diagnostics.appCount,
      activityTargets: tapTargets.length,
      crampedTargets,
      terminalReady: Boolean(document.querySelector('[data-terminal-input]')),
      launcherApps: document.querySelectorAll('.launcher-app[data-action="open-app"]').length,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      interactivityRate: diagnostics.interactivitySummary().rate,
      windowCount: diagnostics.openWindows().length,
      shellHeight: document.querySelector('.desktop-shell')?.getBoundingClientRect().height || 0
    };
  })()`);

  ensure(mobile.appCount >= 50, `Desktop mobile expected app catalog, got ${mobile.appCount}`);
  ensure(mobile.activityTargets >= 20, `Desktop mobile expected interactive controls, got ${mobile.activityTargets}`);
  ensure(mobile.crampedTargets <= 4, `Desktop mobile has too many cramped targets: ${mobile.crampedTargets}`);
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
