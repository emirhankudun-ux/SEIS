import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, normalize, resolve } from "node:path";
import { tmpdir } from "node:os";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const SCREENSHOT_DIR = join(ROOT, "dist", "qa", "product-experience-smoke");
const HOST = "127.0.0.1";
const DEBUG_HOST = "127.0.0.1";
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
  if (file.endsWith(".ico")) return "image/x-icon";
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

async function waitFor(client, expression, timeoutMs = 8000, intervalMs = 150) {
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
  await client.send("Page.navigate", { url });
  const deadline = Date.now() + 12000;

  while (Date.now() < deadline) {
    const readyState = await evaluate(client, "document.readyState").catch(() => "loading");
    if (readyState === "interactive" || readyState === "complete") return;
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
  const clicked = await evaluate(client, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { ok: false, reason: 'missing' };
    element.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { ok: false, reason: 'not-visible' };
    element.click();
    return { ok: true };
  })()`);

  if (!clicked?.ok) {
    throw new Error(`Cannot click selector: ${selector} (${clicked?.reason || "unknown"})`);
  }
  await delay(250);
}

async function terminalCommand(client, command, waitMs = 450) {
  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal-input]');
    const form = document.querySelector('[data-terminal-form]');
    if (!input || !form) return false;
    input.value = ${JSON.stringify(command)};
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return true;
  })()`);
  await delay(waitMs);
}

async function selectOption(client, selector, value) {
  await evaluate(client, `(() => {
    const select = document.querySelector(${JSON.stringify(selector)});
    if (!select) return false;
    select.value = ${JSON.stringify(value)};
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await delay(250);
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
    .filter((issue) => {
      const text = `${issue.text} ${issue.url}`;
      if (text.includes("cdn.jsdelivr.net") || text.includes("monaco-editor")) {
        notes.push("Monaco CDN issue ignored because SEIS Code has a local fallback editor path.");
        return false;
      }
      return true;
    });
}

async function inspectWorkspaceFiles(client) {
  return evaluate(client, `new Promise((resolve) => {
    const request = indexedDB.open('seis-code-workspace-v1', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'path' });
    };
    request.onerror = () => resolve({ ok: false, error: String(request.error?.message || request.error) });
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('files', 'readonly');
      const getAll = tx.objectStore('files').getAll();
      getAll.onerror = () => resolve({ ok: false, error: String(getAll.error?.message || getAll.error) });
      getAll.onsuccess = () => {
        db.close();
        resolve({
          ok: true,
          paths: getAll.result.map((file) => file.path).sort(),
          archiveFiles: getAll.result
            .filter((file) => file.path.startsWith('/workspace/MythicArchive/') && file.type === 'file')
            .map((file) => ({ path: file.path, content: file.content }))
        });
      };
    };
  })`);
}

async function smokeSeisCode(client, baseUrl) {
  await goto(client, `${baseUrl}/seis-code.html`);
  await waitFor(client, `Boolean(document.querySelector('[data-terminal-input]'))`, 8000);
  await waitFor(client, `document.querySelector('[data-terminal-output]')?.textContent.includes('SEIS Code booted')`, 12000);
  await waitFor(client, `Boolean(document.querySelector('.monaco-editor')) || !document.querySelector('[data-editor-fallback]')?.hidden`, 12000);

  const initial = await evaluate(client, `(() => ({
    title: document.title,
    menuCount: document.querySelectorAll('[data-menu]').length,
    activityCount: document.querySelectorAll('[data-view-button]').length,
    bottomPanelCount: document.querySelectorAll('[data-bottom-panel]').length,
    terminalReady: Boolean(document.querySelector('[data-terminal-input]')),
    fallbackReady: !document.querySelector('[data-editor-fallback]')?.hidden,
    monacoReady: Boolean(document.querySelector('.monaco-editor')),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    providerText: document.querySelector('[data-provider-status]')?.textContent.trim() || '',
    overlayText: document.body.textContent.includes('Unhandled Runtime Error') ||
      document.body.textContent.includes('Traceback') ||
      document.body.textContent.includes('Webpack')
  }))()`);

  ensure(initial.title === "SEIS Code", `SEIS Code title mismatch: ${initial.title}`);
  ensure(initial.menuCount === 8, `SEIS Code expected 8 menus, got ${initial.menuCount}`);
  ensure(initial.activityCount === 5, `SEIS Code expected 5 activity views, got ${initial.activityCount}`);
  ensure(initial.bottomPanelCount === 4, `SEIS Code expected 4 bottom panels, got ${initial.bottomPanelCount}`);
  ensure(initial.terminalReady, "SEIS Code terminal input missing");
  ensure(initial.monacoReady || initial.fallbackReady, "SEIS Code needs Monaco or fallback editor ready");
  ensure(initial.providerText.includes("Local Demo"), "SEIS Code provider status must remain Local Demo without keys");
  ensure(!initial.horizontalOverflow, "SEIS Code desktop horizontal overflow detected");
  ensure(!initial.overlayText, "SEIS Code framework/error overlay text detected");

  for (const menu of ["file", "edit", "selection", "view", "go", "run", "terminal", "help"]) {
    await clickSelector(client, `[data-menu="${menu}"] .menu-button`);
    const open = await evaluate(client, `document.querySelector('[data-menu="${menu}"]')?.classList.contains('is-open')`);
    ensure(open, `SEIS Code menu did not open: ${menu}`);
    await evaluate(client, `document.querySelector('[data-menu="${menu}"] .menu-button')?.click()`);
  }

  for (const view of ["explorer", "search", "source", "run", "extensions"]) {
    await clickSelector(client, `[data-view-button="${view}"]`);
    const active = await evaluate(client, `document.querySelector('[data-panel="${view}"]')?.classList.contains('is-active')`);
    ensure(active, `SEIS Code activity view did not activate: ${view}`);
  }

  for (const panel of ["terminal", "problems", "output", "debug"]) {
    await clickSelector(client, `[data-bottom-panel="${panel}"]`);
    const active = await evaluate(client, `document.querySelector('[data-bottom-content="${panel}"]')?.classList.contains('is-active')`);
    ensure(active, `SEIS Code bottom panel did not activate: ${panel}`);
  }

  await clickSelector(client, '[data-bottom-panel="terminal"]');
  await terminalCommand(client, "echo smoke > smoke.txt");
  await terminalCommand(client, "cat smoke.txt");
  await terminalCommand(client, "claude");
  await terminalCommand(client, "/status");
  await terminalCommand(client, "/files");
  await terminalCommand(client, "summarize current file", 250);
  await waitFor(client, `document.querySelector('[data-terminal-output]')?.textContent.includes('This is not an Anthropic Claude response')`, 8000);
  await terminalCommand(client, "/exit");
  await waitFor(client, `document.querySelector('[data-terminal-mode]')?.textContent.trim() === 'Shell'`, 3000);
  const afterTerminal = await evaluate(client, `(() => ({
    terminalText: document.querySelector('[data-terminal-output]')?.textContent || '',
    mode: document.querySelector('[data-terminal-mode]')?.textContent.trim() || ''
  }))()`);

  ensure(afterTerminal.terminalText.includes("smoke"), "SEIS Code terminal did not write/read smoke.txt");
  ensure(afterTerminal.terminalText.includes("Status: Local Demo available"), "SEIS Code Local Demo REPL status missing");
  ensure(afterTerminal.terminalText.includes("This is not an Anthropic Claude response"), "SEIS Code REPL identity disclaimer missing");
  ensure(afterTerminal.mode === "Shell", "SEIS Code REPL did not exit back to Shell");

  const screenshotPath = await screenshot(client, "seis-code-desktop.png");
  return { initial, terminalModeAfterExit: afterTerminal.mode, screenshot: screenshotPath };
}

async function smokeMythicGacha(client, baseUrl) {
  await goto(client, `${baseUrl}/mythic-gacha.html`);
  await waitFor(client, `document.querySelectorAll('[data-creature-id]').length === 60`, 8000);

  const initial = await evaluate(client, `(() => ({
    title: document.title,
    cardCount: document.querySelectorAll('[data-creature-id]').length,
    currency: Number(document.querySelector('[data-currency]')?.textContent || 0),
    completion: document.querySelector('[data-completion]')?.textContent || '',
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    overlayText: document.body.textContent.includes('Unhandled Runtime Error') ||
      document.body.textContent.includes('Traceback') ||
      document.body.textContent.includes('Webpack')
  }))()`);

  ensure(initial.title === "SEIS Mythic Gacha", `Mythic title mismatch: ${initial.title}`);
  ensure(initial.cardCount === 60, `Mythic bestiary expected 60 cards, got ${initial.cardCount}`);
  ensure(initial.currency >= 0, "Mythic currency was not initialized");
  ensure(!initial.horizontalOverflow, "Mythic desktop horizontal overflow detected");
  ensure(!initial.overlayText, "Mythic framework/error overlay text detected");

  await clickSelector(client, '[data-action="draw-one"]');
  await waitFor(client, `document.querySelector('[data-lore-name]')?.textContent.trim() !== 'No creature drawn yet'`, 4000);
  const afterDraw = await evaluate(client, `(() => ({
    name: document.querySelector('[data-lore-name]')?.textContent.trim() || '',
    rarity: document.querySelector('[data-active-rarity]')?.textContent.trim() || '',
    completion: document.querySelector('[data-completion]')?.textContent || '',
    history: document.querySelector('[data-draw-history]')?.textContent || '',
    unlockedCards: [...document.querySelectorAll('[data-creature-id]')].filter((card) => !card.classList.contains('is-locked')).length
  }))()`);

  ensure(afterDraw.name && afterDraw.name !== "No creature drawn yet", "Mythic draw did not update lore name");
  ensure(afterDraw.rarity !== "Undiscovered", "Mythic draw did not update rarity");
  ensure(afterDraw.unlockedCards >= 1, "Mythic draw did not unlock a bestiary card");

  await clickSelector(client, '[data-action="favorite-active"]');
  await clickSelector(client, '[data-action="export-active"]');
  await waitFor(client, `document.querySelector('[data-export-status]')?.textContent.includes('/workspace/MythicArchive/')`, 5000);
  const afterExport = await evaluate(client, `(() => ({
    status: document.querySelector('[data-export-status]')?.textContent || '',
    favoriteVisible: document.body.textContent.includes('Favorite')
  }))()`);
  ensure(afterExport.status.includes("/workspace/MythicArchive/"), "Mythic export did not report SEIS Code archive path");

  await evaluate(client, `(() => {
    const search = document.querySelector('[data-filter-search]');
    search.value = document.querySelector('[data-lore-name]')?.textContent.trim() || '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await selectOption(client, "[data-filter-state]", "unlocked");
  const afterFilter = await waitFor(client, `document.querySelectorAll('[data-creature-id]').length`, 3000);
  ensure(afterFilter >= 1, "Mythic unlocked/search filters removed all visible cards after draw");

  await clickSelector(client, '[data-action="open-active"]');
  const detailOpen = await waitFor(client, `Boolean(document.querySelector('[data-detail-dialog]')?.open)`, 3000);
  ensure(detailOpen, "Mythic detail dialog did not open for active creature");
  await evaluate(client, `document.querySelector('[data-detail-dialog]')?.close()`);

  const workspace = await inspectWorkspaceFiles(client);
  ensure(workspace.ok, `SEIS Code workspace IndexedDB read failed: ${workspace.error || "unknown"}`);
  ensure(workspace.archiveFiles?.length >= 1, "Mythic export did not create a /workspace/MythicArchive file");
  ensure(workspace.archiveFiles?.some((file) => file.content.includes('"creature"') && file.content.includes('"localRecord"')), "Mythic exported JSON payload missing creature/localRecord");

  const screenshotPath = await screenshot(client, "mythic-gacha-desktop.png");
  return { initial, afterDraw, afterExport, archiveFiles: workspace.archiveFiles.map((file) => file.path), screenshot: screenshotPath };
}

async function smokeCrossAppVisibility(client, baseUrl) {
  await goto(client, `${baseUrl}/seis-code.html`);
  await delay(1300);
  await terminalCommand(client, "ls MythicArchive");
  await terminalCommand(client, "find MythicArchive");
  const terminalText = await evaluate(client, `document.querySelector('[data-terminal-output]')?.textContent || ''`);
  ensure(terminalText.includes("SHJ-"), "SEIS Code terminal did not show exported MythicArchive card");
  const screenshotPath = await screenshot(client, "seis-code-mythic-archive.png");
  return { archiveVisibleInTerminal: terminalText.includes("SHJ-"), screenshot: screenshotPath };
}

async function smokeMobile(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await goto(client, `${baseUrl}/mythic-gacha.html`);
  await delay(700);
  const mythicMobile = await evaluate(client, `(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    targetCount: document.querySelectorAll('button, input, select, a').length,
    title: document.querySelector('h1')?.textContent.trim() || ''
  }))()`);
  await goto(client, `${baseUrl}/seis-code.html`);
  await delay(900);
  const codeMobile = await evaluate(client, `(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    terminalReady: Boolean(document.querySelector('[data-terminal-input]')),
    activityCount: document.querySelectorAll('[data-view-button]').length
  }))()`);

  ensure(!mythicMobile.horizontalOverflow, "Mythic mobile horizontal overflow detected");
  ensure(mythicMobile.targetCount >= 10, "Mythic mobile expected interactive controls");
  ensure(!codeMobile.horizontalOverflow, "SEIS Code mobile horizontal overflow detected");
  ensure(codeMobile.terminalReady, "SEIS Code mobile terminal input missing");
  ensure(codeMobile.activityCount === 5, "SEIS Code mobile activity bar missing views");

  return {
    mythic: { ...mythicMobile, screenshot: await screenshot(client, "mythic-gacha-mobile.png") },
    seisCode: { ...codeMobile, screenshot: await screenshot(client, "seis-code-mobile.png") }
  };
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    throw new Error("No Chrome or Chromium executable found. Set CHROME_PATH to run the product experience browser smoke.");
  }

  rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const staticServer = createStaticServer();
  await new Promise((resolveListen) => staticServer.listen(0, HOST, resolveListen));
  const appPort = staticServer.address().port;
  const debugPort = 9623 + Math.floor(Math.random() * 300);
  const userDataDir = join(tmpdir(), `seis-product-experience-chrome-${Date.now()}`);
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
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
    const seisCode = await smokeSeisCode(client, baseUrl);
    const mythicGacha = await smokeMythicGacha(client, baseUrl);
    const crossApp = await smokeCrossAppVisibility(client, baseUrl);
    const mobile = await smokeMobile(client, baseUrl);

    const relevantIssues = collectRelevantIssues(client.events);
    ensure(relevantIssues.length === 0, `browser console/network issues detected: ${JSON.stringify(relevantIssues)}`);

    if (failures.length > 0) {
      console.error("Product experience browser smoke failed:");
      for (const failure of failures) console.error(`- ${failure}`);
      process.exitCode = 1;
      return;
    }

    console.log(JSON.stringify({
      ok: true,
      browser: chromePath,
      appPort,
      screenshotDir: resolve(SCREENSHOT_DIR),
      seisCode,
      mythicGacha,
      crossApp,
      mobile,
      notes
    }, null, 2));
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
