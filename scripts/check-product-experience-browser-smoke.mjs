import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, normalize, resolve } from "node:path";
import { tmpdir } from "node:os";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const SEIS_DEMO_WEB_ROOT = join(ROOT, "apps", "seis-demo-web");
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

function createStaticServer(root = WEB_ROOT) {
  return createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${HOST}`);
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    const relativePath = decodedPath === "/" ? "/index.html" : decodedPath;
    const filePath = normalize(join(root, relativePath));

    if (!filePath.startsWith(root)) {
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
  await fetchJsonWithRetry(`http://${DEBUG_HOST}:${debugPort}/json/version`, {}, 20000);
  const target = await fetchJsonWithRetry(`http://${DEBUG_HOST}:${debugPort}/json/new?about:blank`, { method: "PUT" }, 20000);
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
  try {
    await client.send("Page.navigate", { url }, 30000);
  } catch (error) {
    throw new Error(`${error.message} while navigating to ${url}`);
  }
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

  if (!clicked?.ok) {
    throw new Error(`Cannot click selector: ${selector} (${clicked?.reason || "unknown"})`);
  }
  await delay(250);
}

function keyCodeFor(key) {
  return {
    Enter: 13,
    Tab: 9,
    Escape: 27,
    ArrowUp: 38,
    ArrowDown: 40
  }[key] || key.toUpperCase().charCodeAt(0);
}

async function pressKey(client, key) {
  const code = key.length === 1 ? `Key${key.toUpperCase()}` : key;
  const keyCode = keyCodeFor(key);
  await client.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode
  });
  await client.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode
  });
  await delay(120);
}

async function terminalCommandByKeyboard(client, command, waitMs = 450) {
  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal-input]');
    if (!input) return false;
    input.focus();
    input.value = '';
    return true;
  })()`);
  await client.send("Input.insertText", { text: command });
  await pressKey(client, "Enter");
  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal-input]');
    const form = document.querySelector('[data-terminal-form]');
    if (!input || !form || input.value !== ${JSON.stringify(command)}) return false;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return true;
  })()`);
  await delay(waitMs);
}

async function terminalCommand(client, command, waitMs = 450) {
  const beforeHistory = await evaluate(client, `window.__SEIS_CODE__?.terminalHistoryLength?.() ?? -1`);
  await evaluate(client, `(() => {
    const input = document.querySelector('[data-terminal-input]');
    const form = document.querySelector('[data-terminal-form]');
    if (!input || !form) return false;
    input.value = ${JSON.stringify(command)};
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return true;
  })()`);
  if (beforeHistory >= 0) {
    await waitFor(
      client,
      `(window.__SEIS_CODE__?.terminalHistoryLength?.() ?? -1) > ${beforeHistory} && window.__SEIS_CODE__?.terminalBusy?.() === false`,
      Math.max(8000, waitMs + 3000)
    );
    return;
  }
  await delay(waitMs);
}

async function auditSeisCodeInteractivity(client) {
  const summary = await evaluate(client, `(() => {
    const isVisible = (element) => {
      if (element.hidden) return false;
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const describe = (element) => (
      element.dataset.action ||
      element.dataset.viewButton ||
      element.dataset.bottomPanel ||
      element.getAttribute('aria-label') ||
      element.textContent.trim() ||
      element.tagName
    );
    const controls = [...document.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [data-action], [data-view-button], [data-bottom-panel]')]
      .filter((element, index, list) => list.indexOf(element) === index)
      .filter(isVisible);
    const isResponsive = (element) => {
      if (element.disabled || element.getAttribute('aria-disabled') === 'true') return true;
      if (element.matches('input, textarea, select, a[href]')) return true;
      if (element.dataset.action || element.dataset.viewButton || element.dataset.bottomPanel || element.dataset.closeTab) return true;
      if (element.classList.contains('menu-button') || element.classList.contains('palette-result')) return true;
      return element.getAttribute('role') === 'button';
    };
    const responsive = controls.filter(isResponsive);
    const inert = controls.filter((element) => !isResponsive(element)).map(describe);
    return {
      controls: controls.length,
      responsiveControls: responsive.length,
      rate: controls.length ? responsive.length / controls.length : 1,
      inert: inert.slice(0, 20)
    };
  })()`);
  ensure(summary.rate >= 0.8, `SEIS Code interactivity rate below 80%: ${(summary.rate * 100).toFixed(1)}%; inert controls: ${summary.inert.join(", ")}`);
  return summary;
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
      event.method === "Runtime.exceptionThrown" ||
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
      if (event.method === "Runtime.exceptionThrown") {
        return {
          level: "exception",
          text: event.params?.exceptionDetails?.exception?.description || event.params?.exceptionDetails?.text || "Runtime exception",
          url: event.params?.exceptionDetails?.url || ""
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
      if (
        text.includes("cdn.jsdelivr.net") ||
        text.includes("monaco-editor") ||
        text.includes("vs/css!vs/editor/editor.main") ||
        text.includes("Here are the modules that depend on it:")
      ) {
        notes.push("Monaco CDN issue ignored because SEIS Code has a local fallback editor path.");
        return false;
      }
      if (text.includes("Array(95)") && events.some((event) => JSON.stringify(event).includes("vs/css!vs/editor/editor.main"))) {
        notes.push("Monaco loader dependency list ignored because SEIS Code fallback is validated separately.");
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
    fallbackVisible: (() => {
      const element = document.querySelector('[data-editor-fallback]');
      if (!element) return false;
      const styles = window.getComputedStyle(element);
      return styles.display !== 'none' && styles.visibility !== 'hidden' && element.getClientRects().length > 0;
    })(),
    monacoReady: Boolean(document.querySelector('.monaco-editor')),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    providerText: document.querySelector('[data-provider-status]')?.textContent.trim() || '',
    commandLensVisible: (() => {
      const element = document.querySelector('[data-command-lens]');
      if (!element) return false;
      const styles = window.getComputedStyle(element);
      return styles.display !== 'none' && styles.visibility !== 'hidden' && element.getClientRects().length > 0;
    })(),
    commandLensPhases: document.querySelectorAll('[data-evolution-phase]').length,
    commandLensSummary: document.querySelector('[data-command-lens-summary]')?.textContent.trim() || '',
    evolutionDetailText: document.querySelector('[data-evolution-detail]')?.textContent.trim() || '',
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
  ensure(!(initial.monacoReady && initial.fallbackVisible), "SEIS Code fallback editor must be visually hidden when Monaco is active");
  ensure(initial.providerText.includes("Local Demo"), "SEIS Code provider status must remain Local Demo without keys");
  ensure(initial.commandLensVisible, "SEIS Code Command Lens must be visible on desktop");
  ensure(initial.commandLensPhases === 5, `SEIS Code expected 5 Command Lens phases, got ${initial.commandLensPhases}`);
  ensure(initial.commandLensSummary.includes("Year 1"), "SEIS Code Command Lens summary must include the selected horizon");
  ensure(initial.evolutionDetailText.includes("Proof gate"), "SEIS Code Command Lens detail must include the selected proof gate");
  ensure(!initial.horizontalOverflow, "SEIS Code desktop horizontal overflow detected");
  ensure(!initial.overlayText, "SEIS Code framework/error overlay text detected");

  const initialInteractivity = await auditSeisCodeInteractivity(client);

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

  await clickSelector(client, '[data-action="toggle-command-lens"]');
  const lensHidden = await evaluate(client, `document.querySelector('.workspace')?.classList.contains('lens-hidden')`);
  ensure(lensHidden, "SEIS Code Command Lens toggle did not hide the rail");
  await clickSelector(client, '[data-action="toggle-command-lens"]');
  const lensVisibleAgain = await evaluate(client, `!document.querySelector('.workspace')?.classList.contains('lens-hidden')`);
  ensure(lensVisibleAgain, "SEIS Code Command Lens toggle did not restore the rail");
  await clickSelector(client, '[data-action="focus-terminal"]');
  const focusedTerminal = await evaluate(client, `(() => ({
    active: document.querySelector('[data-bottom-content="terminal"]')?.classList.contains('is-active'),
    text: document.querySelector('[data-terminal-output]')?.textContent || ''
  }))()`);
  ensure(focusedTerminal.active, "SEIS Code Command Lens focus terminal action did not activate terminal");
  ensure(focusedTerminal.text.includes("Command Lens focused"), "SEIS Code Command Lens focus terminal action did not write feedback");
  await clickSelector(client, '[data-evolution-phase="v0.4-intelligence"]');
  const selectedPhase = await evaluate(client, `(() => ({
    activeId: document.querySelector('.evolution-phase.is-active')?.dataset.evolutionPhase || '',
    detail: document.querySelector('[data-evolution-detail]')?.textContent || '',
    output: document.querySelector('[data-output-log]')?.textContent || ''
  }))()`);
  ensure(selectedPhase.activeId === "v0.4-intelligence", "SEIS Code Command Lens did not select Year 4 intelligence phase");
  ensure(selectedPhase.detail.includes("provider-neutral infrastructure"), "SEIS Code Command Lens detail did not update for Year 4");
  ensure(selectedPhase.output.includes("Year 4"), "SEIS Code Command Lens phase selection did not write output feedback");
  await clickSelector(client, '[data-action="show-five-year-plan"]');
  const fiveYearModal = await evaluate(client, `(() => ({
    open: document.querySelector('[data-modal]')?.hidden === false,
    title: document.querySelector('[data-modal-title]')?.textContent || '',
    body: document.querySelector('[data-modal-body]')?.textContent || ''
  }))()`);
  ensure(fiveYearModal.open, "SEIS Code Command Lens plan button did not open modal");
  ensure(fiveYearModal.title.includes("Five-Year"), "SEIS Code Command Lens modal title missing Five-Year");
  ensure(fiveYearModal.body.includes("Gate:"), "SEIS Code Command Lens modal must include phase quality gates");
  await clickSelector(client, '[data-action="close-modal"]');
  await clickSelector(client, '[data-action="command-palette"]');
  await evaluate(client, `(() => {
    const input = document.querySelector('[data-palette-input]');
    input.value = 'Year 5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  const paletteState = await evaluate(client, `(() => ({
    hasYearFive: document.querySelector('[data-palette-results]')?.textContent.includes('Command Lens: Year 5'),
    activeLabel: document.querySelector('.palette-result.is-active .palette-result-main strong')?.textContent || '',
    status: document.querySelector('[data-palette-status]')?.textContent || ''
  }))()`);
  const paletteHasYearFive = paletteState.hasYearFive;
  ensure(paletteHasYearFive, "SEIS Code command palette must expose five-year phase commands");
  ensure(paletteState.activeLabel.includes("Year 5"), "SEIS Code command palette must select the first Year 5 result");
  ensure(paletteState.status.includes("result"), "SEIS Code command palette must expose result count/status");
  await pressKey(client, "Enter");
  const yearFiveSelected = await waitFor(client, `document.querySelector('.evolution-phase.is-active')?.dataset.evolutionPhase === 'v0.5-platform'`, 5000);
  ensure(yearFiveSelected, "SEIS Code command palette Enter did not execute the Year 5 command");
  await clickSelector(client, '[data-action="command-palette"]');
  const paletteRecent = await evaluate(client, `document.querySelector('[data-palette-results]')?.textContent.includes('Recent')`);
  ensure(paletteRecent, "SEIS Code command palette must show a Recent group after execution");
  await clickSelector(client, '[data-palette]');
  await clickSelector(client, '[data-action="open-ai-repl"]');
  await waitFor(client, `document.querySelector('[data-terminal-mode]')?.textContent.includes('Claude Code REPL')`, 5000);
  await terminalCommand(client, "/exit");

  await clickSelector(client, '[data-bottom-panel="terminal"]');
  await terminalCommand(client, "echo smoke > smoke.txt");
  await terminalCommand(client, "cat smoke.txt");
  await terminalCommandByKeyboard(client, "echo keyboard-persist > /workspace/keyboard-persist.txt");
  await terminalCommand(client, "claude");
  await terminalCommand(client, "/status");
  await terminalCommand(client, "/files");
  await terminalCommand(client, "/tools");
  await terminalCommand(client, "write file notes/browser-tool.md with \"Alpha browser workspace slice\"");
  await terminalCommand(client, "append file notes/browser-tool.md with \" Beta\"");
  await terminalCommand(client, "patch file notes/browser-tool.md");
  await terminalCommand(client, "show diff for notes/browser-tool.md");
  await terminalCommand(client, "run command \"cat notes/browser-tool.md\"");
  await terminalCommand(client, "delete workspace all files");
  await terminalCommand(client, "hello", 5500);
  const responseStarted = await waitFor(client, `document.querySelector('[data-terminal-output]')?.textContent.includes('Local Demo response:')`, 8000);
  ensure(responseStarted, "SEIS Code REPL did not start streaming a Local Demo response");
  const responseCompleted = await waitFor(client, `document.querySelector('[data-terminal-output]')?.textContent.includes('save changes to IndexedDB.')`, 15000);
  ensure(responseCompleted, "SEIS Code REPL did not finish streaming the Local Demo response");
  await terminalCommand(client, "/exit");
  await waitFor(client, `document.querySelector('[data-terminal-mode]')?.textContent.trim() === 'Shell'`, 5000);
  const afterTerminal = await evaluate(client, `(() => ({
    terminalText: document.querySelector('[data-terminal-output]')?.textContent || '',
    mode: document.querySelector('[data-terminal-mode]')?.textContent.trim() || ''
  }))()`);

  ensure(afterTerminal.terminalText.includes("smoke"), "SEIS Code terminal did not write/read smoke.txt");
  ensure(afterTerminal.terminalText.includes("Status: Local Demo available"), "SEIS Code Local Demo REPL status missing");
  ensure(
    afterTerminal.terminalText.includes("Local Demo response:"),
    `SEIS Code REPL streamed response missing; terminal tail: ${afterTerminal.terminalText.slice(-500)}`
  );
  ensure(afterTerminal.terminalText.includes("not Anthropic"), "SEIS Code REPL identity disclaimer missing");
  ensure(afterTerminal.terminalText.includes("write_file success"), "SEIS Code REPL write_file tool did not execute");
  ensure(afterTerminal.terminalText.includes("append_file success"), "SEIS Code REPL append_file tool did not execute");
  ensure(afterTerminal.terminalText.includes("apply_patch success"), "SEIS Code REPL apply_patch tool did not execute");
  ensure(afterTerminal.terminalText.includes("show_diff success"), "SEIS Code REPL show_diff tool did not execute");
  ensure(afterTerminal.terminalText.includes("run_virtual_command success"), "SEIS Code REPL run_virtual_command tool did not execute");
  ensure(afterTerminal.terminalText.includes("delete_file cancelled"), "SEIS Code REPL destructive tool did not expose cancelled state");
  ensure(afterTerminal.mode === "Shell", "SEIS Code REPL did not exit back to Shell");

  const postInteractionInteractivity = await auditSeisCodeInteractivity(client);

  await goto(client, `${baseUrl}/seis-code.html?reload-persistence=${Date.now()}`);
  await waitFor(client, `Boolean(document.querySelector('[data-terminal-input]'))`, 8000);
  await waitFor(client, `document.querySelector('[data-terminal-output]')?.textContent.includes('SEIS Code booted')`, 12000);
  await terminalCommandByKeyboard(client, "cat /workspace/keyboard-persist.txt");
  const reload = await evaluate(client, `(() => ({
    terminalText: document.querySelector('[data-terminal-output]')?.textContent || '',
    historyLength: window.__SEIS_CODE__?.terminalHistoryLength?.() || 0,
    files: window.__SEIS_CODE__?.filePaths?.() || []
  }))()`);
  ensure(reload.terminalText.includes("keyboard-persist"), "SEIS Code did not preserve terminal-created file after route reload");
  ensure(reload.files.includes("/workspace/keyboard-persist.txt"), "SEIS Code IndexedDB file list missing keyboard-persist.txt after reload");

  const screenshotPath = await screenshot(client, "seis-code-desktop.png");
  return {
    initial,
    interactivity: {
      initial: initialInteractivity,
      postInteraction: postInteractionInteractivity
    },
    reloadPersistence: {
      fileVisible: reload.files.includes("/workspace/keyboard-persist.txt"),
      terminalHistoryLength: reload.historyLength
    },
    terminalModeAfterExit: afterTerminal.mode,
    screenshot: screenshotPath
  };
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

async function smokeDesktopSharedVfs(client, baseUrl) {
  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  await waitFor(client, `(() => {
    const paths = window.__SEIS_DESKTOP__?.filePaths?.() || [];
    return paths.some((path) => path.startsWith('/home/seis/MythicArchive/') && path.includes('SHJ-'));
  })()`, 10000);
  const result = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    diagnostics.runTerminalCommand('ls MythicArchive');
    diagnostics.runTerminalCommand('find MythicArchive');
    const paths = diagnostics.filePaths();
    return {
      desktopArchiveFiles: paths.filter((path) => path.startsWith('/home/seis/MythicArchive/') && path.includes('SHJ-')),
      terminalText: document.querySelector('[data-terminal-output]')?.textContent || '',
      routeButtons: document.querySelectorAll('[data-demo-route-group] [data-action="open-demo-route"]').length
    };
  })()`);
  ensure(result.desktopArchiveFiles.length >= 1, "Desktop VFS did not import MythicArchive export from SEIS Code workspace");
  ensure(result.terminalText.includes("SHJ-"), "Desktop terminal did not show imported MythicArchive export");
  ensure(result.routeButtons >= 3, "Desktop Search/Launcher route buttons missing in product smoke");

  await clickSelector(client, "[data-action='toggle-launcher']");
  await clickSelector(client, "[data-demo-route-group] [data-value='seis-command-center-app']");
  await waitFor(client, "Boolean(document.querySelector('[data-seis-command-center]'))", 5000);
  const commandCenter = await evaluate(client, `(() => ({
    modules: document.querySelectorAll('[data-seis-command-center] [data-v17-module]').length,
    appActions: document.querySelectorAll('[data-seis-command-center] [data-v17-open-app]').length,
    routeActions: document.querySelectorAll('[data-seis-command-center] [data-v17-open-route]').length,
    text: document.querySelector('[data-seis-command-center]')?.textContent || '',
    diagnostics: window.__SEIS_DESKTOP__.v17CommandCenter()
  }))()`);
  ensure(commandCenter.modules >= 16, `Desktop V17 Command Center expected at least 16 modules, got ${commandCenter.modules}`);
  ensure(commandCenter.appActions >= 15, `Desktop V17 Command Center expected at least 15 app actions, got ${commandCenter.appActions}`);
  ensure(commandCenter.routeActions >= 7, `Desktop V17 Command Center expected at least 7 route actions, got ${commandCenter.routeActions}`);
  ensure(commandCenter.diagnostics.moduleCount === commandCenter.modules, "Desktop V17 Command Center diagnostics must match rendered module count");
  ensure(commandCenter.diagnostics.providerKeysRequiredForCoreDemo === 0, "Desktop V17 Command Center must keep core demo zero-key");
  ensure(commandCenter.diagnostics.liveSshExecution === false, "Desktop V17 Command Center must keep live SSH disabled");
  ensure(commandCenter.diagnostics.liveDeployment === false, "Desktop V17 Command Center must keep live deployment disabled");
  ensure(commandCenter.text.includes("20B / 16GB+"), "Desktop V17 Command Center must show the 20B on 16GB+ model floor");
  ensure(commandCenter.text.includes("150B gated"), "Desktop V17 Command Center must show the 150B future boundary");
  ensure(commandCenter.text.includes("SEIS 150B Frontier Research Target"), "Desktop V17 Command Center must show the SEIS 150B frontier target");
  ensure(commandCenter.text.includes("content/development/seis-model-frontier-escalation-policy.json"), "Desktop V17 Command Center must show the frontier escalation policy path");
  ensure(commandCenter.text.includes("seis://ai/model-frontier-escalation-policy.json"), "Desktop V17 Command Center must show the frontier escalation policy MCP resource URI");
  ensure(commandCenter.text.includes("check:seis-model-frontier-escalation-policy"), "Desktop V17 Command Center must show the frontier escalation quality gate");
  ensure(commandCenter.text.includes("content/development/seis-150b-frontier-model-program.json"), "Desktop V17 Command Center must show the 150B frontier model program path");
  ensure(commandCenter.text.includes("seis://ai/150b-frontier-model-program.json"), "Desktop V17 Command Center must show the 150B frontier model program MCP resource URI");
  ensure(commandCenter.text.includes("check:seis-150b-frontier-model-program"), "Desktop V17 Command Center must show the 150B frontier model program quality gate");
  ensure(commandCenter.text.includes("No-skip-20B"), "Desktop V17 Command Center must show the no-skip-20B escalation rule");
  ensure(commandCenter.text.includes("Master Objective Coverage"), "Desktop V17 Command Center must show the master objective coverage panel");
  ensure(commandCenter.text.includes("seis-ai-150b-frontier-boundary"), "Desktop V17 Command Center must show the 150B objective coverage boundary");
  ensure(commandCenter.diagnostics.masterObjectiveCoverage.activeCoverage === "seis-ai-150b-frontier-boundary", "Desktop V17 Command Center diagnostics must expose the 150B objective coverage boundary");
  ensure(commandCenter.diagnostics.masterObjectiveCoverage.itemCount >= 10, "Desktop V17 Command Center diagnostics must expose all master objective coverage items");
  ensure(commandCenter.diagnostics.masterObjectiveCoverage.itemIds.includes("god-mode-every-topic-feature-growth"), "Desktop V17 Command Center diagnostics must expose God Mode coverage");
  ensure(commandCenter.text.includes("user-work-protection"), "Desktop V17 Command Center must show the coverage matrix rows");
  ensure(commandCenter.diagnostics.modelScalingPreflight.status === "dry-run-only", "Desktop V17 Command Center diagnostics must expose dry-run 20B preflight");
  ensure(commandCenter.diagnostics.modelScalingPreflight.benchmarkDryRunReport === "reports/seis-model-scaling/20b-benchmark-dry-run.json", "Desktop V17 Command Center diagnostics must expose the 20B benchmark dry-run report path");
  ensure(commandCenter.diagnostics.modelScalingPreflight.benchmarkDryRunStatus === "dry-run-not-measured", "Desktop V17 Command Center diagnostics must keep benchmark dry-run not-measured");
  ensure(commandCenter.diagnostics.modelScalingPreflight.measuredBenchmark === false, "Desktop V17 Command Center 20B preflight must not claim measured benchmark evidence");
  ensure(commandCenter.diagnostics.modelScalingPreflight.routeEligibleToday === false, "Desktop V17 Command Center 20B preflight must keep routing blocked");
  ensure(commandCenter.diagnostics.modelScalingPreflight.hostPreflightCommand === "npm run inspect:seis-model-local-hardware", "Desktop V17 Command Center must expose the host RAM preflight command");
  ensure(commandCenter.diagnostics.modelScalingPreflight.modelCardTemplate === "content/development/seis-20b-model-card-template.json", "Desktop V17 Command Center diagnostics must expose the 20B model card template path");
  ensure(commandCenter.diagnostics.modelScalingPreflight.datasetCardTemplate === "content/development/seis-20b-dataset-card-template.json", "Desktop V17 Command Center diagnostics must expose the 20B dataset card template path");
  ensure(commandCenter.diagnostics.modelScalingPreflight.evidenceTemplateStatus === "template-not-filled / human-review-required", "Desktop V17 Command Center diagnostics must keep 20B evidence templates review-gated");
  ensure(commandCenter.diagnostics.modelFrontierEscalationPolicy.path === "content/development/seis-model-frontier-escalation-policy.json", "Desktop V17 Command Center diagnostics must expose the frontier escalation policy path");
  ensure(commandCenter.diagnostics.modelFrontierEscalationPolicy.resource === "seis://ai/model-frontier-escalation-policy.json", "Desktop V17 Command Center diagnostics must expose the frontier escalation policy MCP resource URI");
  ensure(commandCenter.diagnostics.modelFrontierEscalationPolicy.status === "policy-active-research-gated", "Desktop V17 Command Center diagnostics must expose the frontier escalation policy status");
  ensure(commandCenter.diagnostics.modelFrontierEscalationPolicy.qualityGate === "npm run check:seis-model-frontier-escalation-policy", "Desktop V17 Command Center diagnostics must expose the frontier escalation policy quality gate");
  ensure(commandCenter.diagnostics.modelFrontierEscalationPolicy.routeEligibleToday === false, "Desktop V17 Command Center diagnostics must keep frontier escalation routing blocked");
  ensure(commandCenter.diagnostics.frontierModelProgram.path === "content/development/seis-150b-frontier-model-program.json", "Desktop V17 Command Center diagnostics must expose the 150B frontier model program path");
  ensure(commandCenter.diagnostics.frontierModelProgram.resource === "seis://ai/150b-frontier-model-program.json", "Desktop V17 Command Center diagnostics must expose the 150B frontier model program MCP resource URI");
  ensure(commandCenter.diagnostics.frontierModelProgram.status === "frontier-program-plan-only", "Desktop V17 Command Center diagnostics must keep the 150B frontier model program plan-only");
  ensure(commandCenter.diagnostics.frontierModelProgram.qualityGate === "npm run check:seis-150b-frontier-model-program", "Desktop V17 Command Center diagnostics must expose the 150B frontier model program quality gate");
  ensure(commandCenter.diagnostics.frontierModelProgram.routeEligibleToday === false, "Desktop V17 Command Center diagnostics must keep the 150B frontier model program route-ineligible");
  ensure(commandCenter.diagnostics.frontierModelProgram.stages.length === 6, "Desktop V17 Command Center diagnostics must expose six 150B frontier program stages");
  ensure(commandCenter.text.includes("seis-20b-local-preflight.md"), "Desktop V17 Command Center must show the 20B local preflight report path");
  ensure(commandCenter.text.includes("reports/seis-model-scaling/20b-benchmark-dry-run.json"), "Desktop V17 Command Center must show the 20B benchmark dry-run report path");
  ensure(commandCenter.text.includes("Parameter Ladder"), "Desktop V17 Command Center must show the model parameter ladder section");
  ensure(commandCenter.text.includes("content/development/seis-model-parameter-ladder.json"), "Desktop V17 Command Center must show the model parameter ladder source path");
  ensure(commandCenter.text.includes("seis://ai/model-parameter-ladder.json"), "Desktop V17 Command Center must show the model parameter ladder MCP resource URI");
  ensure(commandCenter.text.includes("300B+"), "Desktop V17 Command Center must show the 300B+ exploration boundary");
  ensure(commandCenter.text.includes("dist/qa/model-scaling/local-hardware-preflight.json"), "Desktop V17 Command Center must show the ignored host RAM preflight output path");
  ensure(commandCenter.text.includes("content/development/seis-20b-model-card-template.json"), "Desktop V17 Command Center must show the 20B model card template path");
  ensure(commandCenter.text.includes("content/development/seis-20b-dataset-card-template.json"), "Desktop V17 Command Center must show the 20B dataset card template path");
  await clickSelector(client, "[data-seis-command-center] [data-action='export-model-preflight']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/seis-20b-local-preflight.md')", 5000);
  await clickSelector(client, "[data-seis-command-center] [data-action='app-primary']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/seis-v17-command-center-snapshot.md')", 5000);

  await clickSelector(client, "[data-action='toggle-launcher']");
  await clickSelector(client, "[data-demo-route-group] [data-value='seis-ai-app']");
  await waitFor(client, "Boolean(document.querySelector('[data-window-app-id=\"ai-assistant\"]'))", 5000);
  await waitFor(client, "document.querySelectorAll('[data-ai-plugin-tab]').length >= 4 && Boolean(document.querySelector('[data-ai-plugin-center]'))", 5000);
  const pluginCenterBeforeToggle = await evaluate(client, `(() => ({
    tabs: document.querySelectorAll('[data-ai-plugin-tab]').length,
    pluginControls: document.querySelectorAll('[data-ai-plugin-center] [data-action="toggle-ai-plugin"]').length,
    personalPluginRows: document.querySelectorAll('[data-personal-plugin]').length,
    personalPluginBridgeText: document.querySelector('[data-personal-plugin-bridge]')?.textContent || '',
    personalPluginDiagnostics: window.__SEIS_DESKTOP__.personalPluginBridge()
  }))()`);
  ensure(pluginCenterBeforeToggle.tabs >= 4, "Desktop SEIS AI App Plugin Center tabs missing in product smoke");
  ensure(pluginCenterBeforeToggle.pluginControls >= 1, "Desktop SEIS AI App Plugin Center controls missing in product smoke");
  ensure(pluginCenterBeforeToggle.personalPluginRows === 5, `Desktop Personal SEIS Plugin Bridge expected five rows, got ${pluginCenterBeforeToggle.personalPluginRows}`);
  ensure(pluginCenterBeforeToggle.personalPluginDiagnostics.length === 5, `Desktop Personal SEIS Plugin Bridge diagnostics expected five entries, got ${pluginCenterBeforeToggle.personalPluginDiagnostics.length}`);
  ensure(pluginCenterBeforeToggle.personalPluginBridgeText.includes("seis@personal"), "Desktop Personal SEIS Plugin Bridge must show seis@personal");
  ensure(pluginCenterBeforeToggle.personalPluginBridgeText.includes("seis-data@personal"), "Desktop Personal SEIS Plugin Bridge must show seis-data@personal");
  await clickSelector(client, "[data-action='export-personal-plugin-bridge']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/seis-personal-plugin-bridge.md')", 5000);
  await clickSelector(client, "[data-ai-plugin-tab='Installed AI']");
  await waitFor(client, "Boolean(document.querySelector('[data-installed-ai-systems]'))", 5000);
  const installedAiSystems = await evaluate(client, `(() => ({
    profileRows: document.querySelectorAll('[data-installed-ai-system]').length,
    diagnosticsCount: window.__SEIS_DESKTOP__.installedAiSystems().length,
    routeRows: document.querySelectorAll('[data-installed-ai-core-route]').length,
    routeDiagnostics: window.__SEIS_DESKTOP__.installedAiCoreRouteMatrix(),
    personalPluginLaneRows: document.querySelectorAll('[data-personal-plugin-ai-core-lane]').length,
    personalPluginLaneDiagnostics: window.__SEIS_DESKTOP__.personalPluginAiCoreLaneMatrix(),
    personalPluginLaneMatrixText: document.querySelector('[data-personal-plugin-ai-core-lane-matrix]')?.textContent || '',
    mcpRuntimeRows: document.querySelectorAll('[data-mcp-runtime-surface]').length,
    mcpRuntimeDiagnostics: window.__SEIS_DESKTOP__.mcpRuntimeContract(),
    mcpRuntimeText: document.querySelector('[data-mcp-runtime-contract]')?.textContent || '',
    routeMatrixText: document.querySelector('[data-installed-ai-core-route-matrix]')?.textContent || '',
    localDemoText: document.querySelector('[data-installed-ai-systems]')?.textContent || '',
    resourceBridgeText: document.querySelector('[data-ai-core-resource-bridge]')?.textContent || '',
    resourceBridge: window.__SEIS_DESKTOP__.aiCoreResourceBridge()
  }))()`);
  ensure(installedAiSystems.profileRows === 6, `Desktop Installed AI expected six profiles, got ${installedAiSystems.profileRows}`);
  ensure(installedAiSystems.diagnosticsCount === 6, `Desktop Installed AI diagnostics expected six profiles, got ${installedAiSystems.diagnosticsCount}`);
  ensure(installedAiSystems.routeRows === 6, `Desktop Installed AI Core route matrix expected six rows, got ${installedAiSystems.routeRows}`);
  ensure(installedAiSystems.routeDiagnostics.length === 6, `Desktop Installed AI Core route diagnostics expected six routes, got ${installedAiSystems.routeDiagnostics.length}`);
  ensure(installedAiSystems.routeMatrixText.includes("v0.2-read-only-intelligence"), "Desktop Installed AI Core route matrix must show AI Core version targets");
  ensure(installedAiSystems.personalPluginLaneRows === 5, `Desktop Personal Plugin AI Core Lane Matrix expected five rows, got ${installedAiSystems.personalPluginLaneRows}`);
  ensure(installedAiSystems.personalPluginLaneDiagnostics.length === 5, `Desktop Personal Plugin AI Core Lane Matrix diagnostics expected five entries, got ${installedAiSystems.personalPluginLaneDiagnostics.length}`);
  ensure(installedAiSystems.personalPluginLaneMatrixText.includes("seis-cloud@personal"), "Desktop Personal Plugin AI Core Lane Matrix must show seis-cloud@personal");
  ensure(installedAiSystems.personalPluginLaneMatrixText.includes("v0.4-multi-workspace-readiness"), "Desktop Personal Plugin AI Core Lane Matrix must show canonical version targets");
  ensure(installedAiSystems.mcpRuntimeRows === 4, `Desktop MCP Runtime Contract expected four rows, got ${installedAiSystems.mcpRuntimeRows}`);
  ensure(installedAiSystems.mcpRuntimeDiagnostics.toolCount === 34, `Desktop MCP Runtime Contract diagnostics expected 34 tools, got ${installedAiSystems.mcpRuntimeDiagnostics.toolCount}`);
  ensure(installedAiSystems.mcpRuntimeDiagnostics.resourceCount === 26, `Desktop MCP Runtime Contract diagnostics expected 26 resources, got ${installedAiSystems.mcpRuntimeDiagnostics.resourceCount}`);
  ensure(installedAiSystems.mcpRuntimeDiagnostics.resourceUri === "seis://ai/mcp-runtime-contract.json", "Desktop MCP Runtime Contract diagnostics must expose the canonical MCP resource URI");
  ensure(installedAiSystems.mcpRuntimeText.includes("stdio JSON-RPC"), "Desktop MCP Runtime Contract must show stdio JSON-RPC evidence");
  await clickSelector(client, "[data-action='export-personal-plugin-ai-core-lane-matrix']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/seis-personal-plugin-ai-core-lane-matrix.md')", 5000);
  await clickSelector(client, "[data-action='export-mcp-runtime-contract']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/seis-mcp-runtime-contract.md')", 5000);
  await clickSelector(client, "[data-action='export-installed-ai-core-route-matrix']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/seis-installed-ai-core-route-matrix.md')", 5000);
  ensure(installedAiSystems.localDemoText.includes("SEIS Local Demo Runtime"), "Desktop Installed AI must show the Local Demo profile");
  ensure(installedAiSystems.resourceBridgeText.includes("seis://ai/sub-agent-5-year-plan-view.json"), "Desktop Installed AI must show the generated AI Core plan-view resource bridge");
  ensure(installedAiSystems.resourceBridgeText.includes("seis://ai/provider-registry.json"), "Desktop Installed AI must show the provider registry resource bridge");
  ensure(installedAiSystems.resourceBridgeText.includes("seis://ai/mcp-runtime-contract.json"), "Desktop Installed AI must show the MCP runtime contract resource bridge");
  ensure(installedAiSystems.resourceBridge.planView === "apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json", "Desktop diagnostics must expose the generated AI Core plan-view file");
  ensure(installedAiSystems.resourceBridge.mcpRuntimeContractResource === "seis://ai/mcp-runtime-contract.json", "Desktop diagnostics must expose the MCP runtime contract resource");
  await clickSelector(client, "[data-action='export-ai-core-resource-bridge']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/seis-ai-core-resource-bridge.md')", 5000);
  await clickSelector(client, "[data-action='audit-installed-ai-systems']");
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/installed-ai-systems-audit.md')", 5000);
  await clickSelector(client, "[data-ai-plugin-tab='Plugin Center']");
  await waitFor(client, "Boolean(document.querySelector('[data-ai-plugin-center]'))", 5000);
  await clickSelector(client, "[data-ai-plugin-center] [data-action='toggle-ai-plugin']");
  await clickSelector(client, "[data-ai-plugin-tab='Tool Calls']");
  const aiPluginCenter = await evaluate(client, `(() => ({
    toolCallText: document.querySelector('[data-ai-tool-calls]')?.textContent || ''
  }))()`);
  aiPluginCenter.tabs = pluginCenterBeforeToggle.tabs;
  aiPluginCenter.pluginControls = pluginCenterBeforeToggle.pluginControls;
  aiPluginCenter.installedAiSystems = installedAiSystems;
  ensure(aiPluginCenter.toolCallText.includes("toggle_ai_plugin"), "Desktop SEIS AI App Plugin Center toggle did not record a tool call");

  const screenshotPath = await screenshot(client, "desktop-shared-vfs.png");
  return { ...result, aiPluginCenter, screenshot: screenshotPath };
}

async function smokeSubAgentFiveYearDemo(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await goto(client, `${baseUrl}/`);
  const demoReady = await waitFor(client, `(() => (
    document.querySelector('#seis-hero-3d-canvas')?.dataset.hero3dReady === 'true' &&
    window.__SEIS_DEMO__?.hero3dDiagnostics?.()?.ready === true &&
    document.querySelectorAll('[data-sub-agent-quarter]').length === 20 &&
    document.querySelectorAll('.sub-agent-lane-card').length >= 6 &&
    document.querySelectorAll('[data-sub-agent-version-target]').length === 5 &&
    document.querySelectorAll('[data-installed-ai-route]').length === 6 &&
    document.querySelectorAll('[data-personal-plugin-lane]').length === 5 &&
    document.querySelectorAll('[data-mcp-runtime-surface]').length === 4 &&
    document.querySelectorAll('[data-constellation-node]').length === 3 &&
    document.querySelectorAll('[data-constellation-action]').length === 3 &&
    window.__SEIS_DEMO__?.constellationInspector?.()?.status === 'local-demo-integrated' &&
    Boolean(document.querySelector('#sub-agent-run-full-demo'))
  ))()`, 20000);
  ensure(demoReady, "SEIS demo did not finish generated plan-view and 3D hero startup before smoke assertions");

  const initial = await evaluate(client, `(() => ({
    heroTitle: document.querySelector('#hero-title')?.textContent || '',
    hasHero3dCanvas: Boolean(document.querySelector('#seis-hero-3d-canvas')),
    hero3dButtonCount: document.querySelectorAll('.hero-visual-toolbar button').length,
    hero3dStatus: document.querySelector('#seis-hero-3d-status')?.textContent || '',
    hero3dDiagnostics: window.__SEIS_DEMO__?.hero3dDiagnostics?.() || null,
    hero3dReady: document.querySelector('#seis-hero-3d-canvas')?.dataset.hero3dReady || '',
    hero3dMode: document.querySelector('#seis-hero-3d-canvas')?.dataset.hero3dMode || '',
    hero3dPixelSignal: (() => {
      const canvas = document.querySelector('#seis-hero-3d-canvas');
      const context = canvas?.getContext('2d', { willReadFrequently: true });
      if (!canvas || !context || !canvas.width || !canvas.height) return false;
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let litSamples = 0;
      for (let index = 3; index < data.length; index += 997) {
        if (data[index] > 0) litSamples += 1;
      }
      return litSamples > 24;
    })(),
    hasPanel: Boolean(document.querySelector('.sub-agent-plan-panel')),
    quarterButtons: document.querySelectorAll('[data-sub-agent-quarter]').length,
    laneCards: document.querySelectorAll('.sub-agent-lane-card').length,
    versionCards: document.querySelectorAll('[data-sub-agent-version-target]').length,
    installedAiRouteCards: document.querySelectorAll('[data-installed-ai-route]').length,
    personalPluginLaneCards: document.querySelectorAll('[data-personal-plugin-lane]').length,
    mcpRuntimeSurfaceCards: document.querySelectorAll('[data-mcp-runtime-surface]').length,
    constellationNodeCards: document.querySelectorAll('[data-constellation-node]').length,
    constellationActionButtons: document.querySelectorAll('[data-constellation-action]').length,
    activeVersionTarget: document.querySelector('.sub-agent-version-card.is-active')?.dataset.subAgentVersionTarget || '',
    routeMeshText: document.querySelector('#sub-agent-route-mesh')?.textContent || '',
    pluginMeshText: document.querySelector('#sub-agent-plugin-mesh')?.textContent || '',
    mcpRuntimeText: document.querySelector('#sub-agent-mcp-runtime-mesh')?.textContent || '',
    constellationText: document.querySelector('#sub-agent-constellation-inspector')?.textContent || '',
    constellationInspector: window.__SEIS_DEMO__?.constellationInspector?.() || null,
    detailText: document.querySelector('#sub-agent-quarter-detail')?.textContent || '',
    hasRunButton: Boolean(document.querySelector('#sub-agent-run-demo')),
    hasFullRunButton: Boolean(document.querySelector('#sub-agent-run-full-demo')),
    hasExportButton: Boolean(document.querySelector('#sub-agent-export-evidence')),
    hasResetButton: Boolean(document.querySelector('#sub-agent-reset-demo')),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
  }))()`);

  ensure(initial.heroTitle.includes("versioned AI Core"), "SEIS demo hero title missing versioned AI Core positioning");
  ensure(initial.hasHero3dCanvas, "SEIS demo 3D hero canvas missing");
  ensure(initial.hero3dButtonCount === 3, `SEIS demo expected three 3D hero controls, got ${initial.hero3dButtonCount}`);
  ensure(initial.hero3dStatus.includes("v0.1-foundation"), `SEIS demo 3D hero status missing active version target: ${initial.hero3dStatus}`);
  ensure(initial.hero3dDiagnostics?.ready === true, "SEIS demo 3D hero diagnostics not ready");
  ensure(initial.hero3dDiagnostics?.nodeCount >= 32, `SEIS demo 3D hero node count too low for AI routes, plugin lanes, and MCP runtime: ${initial.hero3dDiagnostics?.nodeCount}`);
  ensure(initial.hero3dDiagnostics?.nonBlankSample > 0, "SEIS demo 3D hero diagnostics appears blank");
  ensure(initial.hero3dReady === "true", "SEIS demo 3D hero canvas did not mark ready");
  ensure(["animated", "static"].includes(initial.hero3dMode), `SEIS demo 3D hero mode invalid: ${initial.hero3dMode}`);
  ensure(initial.hero3dPixelSignal, "SEIS demo 3D hero canvas appears blank");
  ensure(initial.hasPanel, "SEIS demo sub-agent panel missing");
  ensure(initial.quarterButtons === 20, `SEIS demo expected 20 sub-agent quarter buttons, got ${initial.quarterButtons}`);
  ensure(initial.laneCards >= 6, `SEIS demo expected at least 6 sub-agent lane cards, got ${initial.laneCards}`);
  ensure(initial.versionCards === 5, `SEIS demo expected five AI Core version cards, got ${initial.versionCards}`);
  ensure(initial.installedAiRouteCards === 6, `SEIS demo expected six installed AI Core route cards, got ${initial.installedAiRouteCards}`);
  ensure(initial.personalPluginLaneCards === 5, `SEIS demo expected five personal plugin lane cards, got ${initial.personalPluginLaneCards}`);
  ensure(initial.mcpRuntimeSurfaceCards === 4, `SEIS demo expected four MCP runtime surface cards, got ${initial.mcpRuntimeSurfaceCards}`);
  ensure(initial.constellationNodeCards === 3, `SEIS demo expected three AI Core constellation node cards, got ${initial.constellationNodeCards}`);
  ensure(initial.constellationActionButtons === 3, `SEIS demo expected three AI Core constellation actions, got ${initial.constellationActionButtons}`);
  ensure(initial.routeMeshText.includes("Claude Review Profile") && initial.routeMeshText.includes("Missing Key"), "SEIS demo route mesh missing Claude review Missing Key evidence");
  ensure(initial.pluginMeshText.includes("seis-cloud@personal") && initial.pluginMeshText.includes("plan-only"), "SEIS demo plugin mesh missing personal plugin plan-only evidence");
  ensure(initial.mcpRuntimeText.includes("stdio JSON-RPC") && initial.mcpRuntimeText.includes("LightweightMcpServer"), "SEIS demo MCP runtime mesh missing stdio fallback evidence");
  ensure(initial.constellationText.includes("SEIS AI Core constellation"), "SEIS demo constellation inspector title missing");
  ensure(initial.constellationText.includes("34 MCP tools") && initial.constellationText.includes("26 resources"), "SEIS demo constellation inspector missing MCP contract counts");
  ensure(initial.constellationText.includes("seis@personal") && initial.constellationText.includes("seis-data@personal"), "SEIS demo constellation inspector missing personal plugin lanes");
  ensure(initial.constellationText.includes("Local Demo only"), "SEIS demo constellation inspector missing Local Demo boundary");
  ensure(initial.constellationInspector?.status === "local-demo-integrated", `SEIS demo constellation inspector status mismatch: ${initial.constellationInspector?.status}`);
  ensure(initial.constellationInspector?.routeCount === 6, `SEIS demo constellation route count mismatch: ${initial.constellationInspector?.routeCount}`);
  ensure(initial.constellationInspector?.pluginLaneCount === 5, `SEIS demo constellation plugin lane count mismatch: ${initial.constellationInspector?.pluginLaneCount}`);
  ensure(initial.constellationInspector?.mcpRuntimeToolCount === 34, `SEIS demo constellation MCP tool count mismatch: ${initial.constellationInspector?.mcpRuntimeToolCount}`);
  ensure(Number(initial.constellationInspector?.mcpRuntimeResourceCount) === 26, `SEIS demo constellation MCP resource count mismatch: ${initial.constellationInspector?.mcpRuntimeResourceCount}`);
  ensure(initial.constellationInspector?.mcpRuntimePromptCount === 3, `SEIS demo constellation MCP prompt count mismatch: ${initial.constellationInspector?.mcpRuntimePromptCount}`);
  ensure(initial.constellationInspector?.heroNodeCount >= 32, `SEIS demo constellation 3D node count too low: ${initial.constellationInspector?.heroNodeCount}`);
  ensure(initial.hero3dDiagnostics?.installedAiRouteCount === 6, `SEIS demo 3D route diagnostic count mismatch: ${initial.hero3dDiagnostics?.installedAiRouteCount}`);
  ensure(initial.hero3dDiagnostics?.personalPluginLaneCount === 5, `SEIS demo 3D plugin lane diagnostic count mismatch: ${initial.hero3dDiagnostics?.personalPluginLaneCount}`);
  ensure(initial.hero3dDiagnostics?.mcpRuntimeSurfaceCount === 4, `SEIS demo 3D MCP surface diagnostic count mismatch: ${initial.hero3dDiagnostics?.mcpRuntimeSurfaceCount}`);
  ensure(initial.hero3dDiagnostics?.mcpRuntimeToolCount === 34, `SEIS demo 3D MCP tool diagnostic count mismatch: ${initial.hero3dDiagnostics?.mcpRuntimeToolCount}`);
  ensure(Number(initial.hero3dDiagnostics?.mcpRuntimeResourceCount) === 26, `SEIS demo 3D MCP resource diagnostic count mismatch: ${initial.hero3dDiagnostics?.mcpRuntimeResourceCount}`);
  ensure(initial.hero3dDiagnostics?.mcpRuntimePromptCount === 3, `SEIS demo 3D MCP prompt diagnostic count mismatch: ${initial.hero3dDiagnostics?.mcpRuntimePromptCount}`);
  ensure(initial.hero3dStatus.includes("6 AI routes") && initial.hero3dStatus.includes("5 plugin lanes") && initial.hero3dStatus.includes("34 MCP tools"), `SEIS demo 3D hero status missing installed AI/plugin/MCP count: ${initial.hero3dStatus}`);
  ensure(initial.activeVersionTarget === "v0.1-foundation", `SEIS demo active version target mismatch: ${initial.activeVersionTarget}`);
  ensure(initial.detailText.includes("AI Core version"), "SEIS demo quarter detail missing AI Core version evidence");
  ensure(initial.detailText.includes("Promotion decision"), "SEIS demo quarter detail missing promotion decision evidence");
  ensure(
    initial.detailText.includes("data/seis-sub-agent-five-year-plan-view.json") &&
      initial.detailText.includes("generated-from-source"),
    "SEIS demo quarter detail missing generated plan-view source evidence"
  );
  ensure(initial.hasRunButton, "SEIS demo sub-agent pulse button missing");
  ensure(initial.hasFullRunButton, "SEIS demo sub-agent full dry-run button missing");
  ensure(initial.hasExportButton, "SEIS demo sub-agent evidence export button missing");
  ensure(initial.hasResetButton, "SEIS demo sub-agent reset button missing");
  ensure(!initial.horizontalOverflow, "SEIS demo sub-agent desktop horizontal overflow detected");

  await clickSelector(client, "[data-constellation-action='sync']");
  const afterConstellationSync = await evaluate(client, `(() => {
    const events = JSON.parse(localStorage.getItem('seis-demo-events-v1') || '[]');
    return {
      diagnostics: window.__SEIS_DEMO__?.hero3dDiagnostics?.() || null,
      inspector: window.__SEIS_DEMO__?.constellationInspector?.() || null,
      syncEvent: events.some((event) => event.event_name === 'seis_demo_constellation_inspector_synced')
    };
  })()`);
  ensure(afterConstellationSync.syncEvent, "SEIS demo constellation inspector sync event missing");
  ensure(afterConstellationSync.diagnostics?.lastAction === "sync-quarter", `SEIS demo constellation sync did not drive 3D map sync: ${afterConstellationSync.diagnostics?.lastAction}`);
  ensure(afterConstellationSync.inspector?.heroInteractionCount >= 1, "SEIS demo constellation sync did not update hero interaction count");

  await clickSelector(client, "#seis-hero-3d-rotate");
  await clickSelector(client, "#seis-hero-3d-sync");
  await clickSelector(client, "#seis-hero-3d-pause");
  const afterHero3dControls = await evaluate(client, `(() => {
    const events = JSON.parse(localStorage.getItem('seis-demo-events-v1') || '[]');
    return {
      diagnostics: window.__SEIS_DEMO__?.hero3dDiagnostics?.() || null,
      statusText: document.querySelector('#seis-hero-3d-status')?.textContent || '',
      pausePressed: document.querySelector('#seis-hero-3d-pause')?.getAttribute('aria-pressed') || '',
      pauseText: document.querySelector('#seis-hero-3d-pause')?.textContent || '',
      interactionEvent: events.some((event) => event.event_name === 'seis_demo_ai_core_3d_interacted')
    };
  })()`);
  ensure(afterHero3dControls.diagnostics?.interactionCount >= 3, "SEIS demo 3D hero controls did not record three interactions");
  ensure(afterHero3dControls.statusText.includes("Y1-Q1"), "SEIS demo 3D hero status lost selected-quarter context");
  ensure(afterHero3dControls.pausePressed === "true", "SEIS demo 3D hero pause control did not update aria-pressed");
  ensure(afterHero3dControls.pauseText.includes("Resume"), "SEIS demo 3D hero pause control did not switch to Resume");
  ensure(afterHero3dControls.interactionEvent, "SEIS demo AI Core 3D interaction event missing");

  await clickSelector(client, "#sub-agent-run-demo");
  await waitFor(
    client,
    `JSON.parse(localStorage.getItem('seis-demo-sub-agent-run-ledger-v1') || '[]').length === 1`,
    5000
  );
  await clickSelector(client, "#sub-agent-run-full-demo");
  await waitFor(
    client,
    `JSON.parse(localStorage.getItem('seis-demo-sub-agent-run-ledger-v1') || '[]').length === 20`,
    5000
  );

  const afterFullRun = await evaluate(client, `(() => {
    const ledger = JSON.parse(localStorage.getItem('seis-demo-sub-agent-run-ledger-v1') || '[]');
    const events = JSON.parse(localStorage.getItem('seis-demo-events-v1') || '[]');
    return {
      ledgerCount: ledger.length,
      firstQuarter: ledger[0]?.quarterId || '',
      firstVersionTarget: ledger[0]?.aiCoreVersionTarget || '',
      lastQuarter: ledger[ledger.length - 1]?.quarterId || '',
      lastVersionTarget: ledger[ledger.length - 1]?.aiCoreVersionTarget || '',
      statusText: document.querySelector('#sub-agent-run-status')?.textContent || '',
      fullRunEvent: events.some((event) => event.event_name === 'seis_demo_sub_agent_full_run_recorded'),
      pulseEvent: events.some((event) => event.event_name === 'seis_demo_sub_agent_pulse_recorded'),
      versionMapEvent: events.some((event) => event.event_name === 'seis_demo_sub_agent_version_map_viewed')
    };
  })()`);

  ensure(afterFullRun.ledgerCount === 20, `SEIS demo full dry-run did not record 20 quarters, got ${afterFullRun.ledgerCount}`);
  ensure(afterFullRun.firstQuarter === "Y1-Q1", `SEIS demo full dry-run first quarter mismatch: ${afterFullRun.firstQuarter}`);
  ensure(afterFullRun.firstVersionTarget === "v0.1-foundation", `SEIS demo first version target mismatch: ${afterFullRun.firstVersionTarget}`);
  ensure(afterFullRun.lastQuarter === "Y5-Q4", `SEIS demo full dry-run last quarter mismatch: ${afterFullRun.lastQuarter}`);
  ensure(afterFullRun.lastVersionTarget === "v1.0-public-enterprise-candidate", `SEIS demo last version target mismatch: ${afterFullRun.lastVersionTarget}`);
  ensure(afterFullRun.statusText.includes("20/20 quarters recorded"), "SEIS demo full dry-run status did not show 20/20 progress");
  ensure(afterFullRun.statusText.includes("Local Demo only"), "SEIS demo full dry-run status must keep Local Demo boundary");
  ensure(afterFullRun.fullRunEvent, "SEIS demo full dry-run event missing");
  ensure(afterFullRun.pulseEvent, "SEIS demo pulse event missing before full dry-run");
  ensure(afterFullRun.versionMapEvent, "SEIS demo AI Core version map event missing");

  await clickSelector(client, "#sub-agent-export-evidence");
  await waitFor(
    client,
    `Boolean(JSON.parse(localStorage.getItem('seis-demo-sub-agent-evidence-report-v1') || 'null'))`,
    5000
  );
  const afterExport = await evaluate(client, `(() => {
    const report = JSON.parse(localStorage.getItem('seis-demo-sub-agent-evidence-report-v1') || 'null');
    const events = JSON.parse(localStorage.getItem('seis-demo-events-v1') || '[]');
    return {
      reportId: report?.id || '',
      status: report?.status || '',
      recordedQuarterCount: report?.recordedQuarterCount || 0,
      quarterCount: report?.quarterCount || 0,
      versionTargetCount: report?.versionTargetCount || 0,
      promotionGateCount: report?.promotionGateCount || 0,
      installedAiCoreRouteCount: report?.installedAiCoreRouteCount || 0,
      installedAiCoreRoutes: report?.installedAiCoreRoutes?.length || 0,
      personalPluginLaneCount: report?.personalPluginLaneCount || 0,
      personalPluginLaneMatrix: report?.personalPluginLaneMatrix?.length || 0,
      mcpRuntimeSurfaceCount: report?.mcpRuntimeSurfaceCount || 0,
      mcpRuntimeToolCount: report?.mcpRuntimeToolCount || 0,
      mcpRuntimeResourceCount: report?.mcpRuntimeResourceCount || 0,
      mcpRuntimePromptCount: report?.mcpRuntimePromptCount || 0,
      mcpRuntimeTransport: report?.mcpRuntimeTransport || '',
      mcpRuntimeSurfaces: report?.mcpRuntimeContract?.surfaces?.length || 0,
      constellationInspectorStatus: report?.constellationInspectorStatus || '',
      constellationInspectorRouteCount: report?.constellationInspectorRouteCount || 0,
      constellationInspectorPluginLaneCount: report?.constellationInspectorPluginLaneCount || 0,
      constellationInspectorMcpToolCount: report?.constellationInspectorMcpToolCount || 0,
      constellationInspectorMcpResourceCount: report?.constellationInspectorMcpResourceCount || 0,
      constellationInspectorHeroNodeCount: report?.constellationInspectorHeroNodeCount || 0,
      constellationInspectorBoundary: report?.constellationInspector?.boundary || '',
      seisAgentPluginIntegration: report?.seisAgentPluginIntegration || '',
      planViewSource: report?.subAgentPlanView || '',
      planViewStatus: report?.planViewStatus || '',
      planViewGeneratedBy: report?.planViewGeneratedBy || '',
      promotionMapStatus: report?.promotionMapStatus || '',
      promotionMapSource: report?.seisAiCoreVersionPromotionMap || '',
      providerRegistrySource: report?.seisAiCoreProviderRegistry || '',
      completionPercent: report?.completionPercent || 0,
      demoBoundary: report?.demoBoundary || '',
      releasePromotionAllowed: report?.releasePromotionAllowed,
      recordCount: report?.records?.length || 0,
      firstRecordVersionTarget: report?.records?.[0]?.aiCoreVersionTarget || '',
      lastRecordVersionTarget: report?.records?.[report?.records?.length - 1]?.aiCoreVersionTarget || '',
      validationBrowserSmoke: report?.validation?.browserSmoke || '',
      validationProviderRegistry: report?.validation?.providerRegistry || '',
      validationVersionRegistry: report?.validation?.versionRegistry || '',
      validationPromotionGates: report?.validation?.promotionGates || '',
      statusText: document.querySelector('#sub-agent-export-status')?.textContent || '',
      exportEvent: events.some((event) => event.event_name === 'seis_demo_sub_agent_evidence_exported')
    };
  })()`);
  ensure(afterExport.reportId === "seis-sub-agent-five-year-demo-evidence", `SEIS demo evidence report id mismatch: ${afterExport.reportId}`);
  ensure(afterExport.status === "local-demo-evidence", `SEIS demo evidence report status mismatch: ${afterExport.status}`);
  ensure(afterExport.recordedQuarterCount === 20, `SEIS demo evidence report expected 20 recorded quarters, got ${afterExport.recordedQuarterCount}`);
  ensure(afterExport.quarterCount === 20, `SEIS demo evidence report expected 20 total quarters, got ${afterExport.quarterCount}`);
  ensure(afterExport.versionTargetCount === 5, `SEIS demo evidence report expected five version targets, got ${afterExport.versionTargetCount}`);
  ensure(afterExport.promotionGateCount === 5, `SEIS demo evidence report expected five promotion gates, got ${afterExport.promotionGateCount}`);
  ensure(afterExport.installedAiCoreRouteCount === 6, `SEIS demo evidence report expected six installed AI Core routes, got ${afterExport.installedAiCoreRouteCount}`);
  ensure(afterExport.installedAiCoreRoutes === 6, `SEIS demo evidence report expected six installed AI Core route records, got ${afterExport.installedAiCoreRoutes}`);
  ensure(afterExport.personalPluginLaneCount === 5, `SEIS demo evidence report expected five personal plugin lanes, got ${afterExport.personalPluginLaneCount}`);
  ensure(afterExport.personalPluginLaneMatrix === 5, `SEIS demo evidence report expected five personal plugin lane records, got ${afterExport.personalPluginLaneMatrix}`);
  ensure(afterExport.mcpRuntimeSurfaceCount === 4, `SEIS demo evidence report expected four MCP runtime surfaces, got ${afterExport.mcpRuntimeSurfaceCount}`);
  ensure(afterExport.mcpRuntimeToolCount === 34, `SEIS demo evidence report expected 34 MCP tools, got ${afterExport.mcpRuntimeToolCount}`);
  ensure(Number(afterExport.mcpRuntimeResourceCount) === 26, `SEIS demo evidence report expected 26 MCP resources, got ${afterExport.mcpRuntimeResourceCount}`);
  ensure(afterExport.mcpRuntimePromptCount === 3, `SEIS demo evidence report expected three MCP prompts, got ${afterExport.mcpRuntimePromptCount}`);
  ensure(afterExport.mcpRuntimeTransport === "stdio JSON-RPC", `SEIS demo evidence report MCP transport mismatch: ${afterExport.mcpRuntimeTransport}`);
  ensure(afterExport.mcpRuntimeSurfaces === 4, `SEIS demo evidence report expected four MCP runtime surface records, got ${afterExport.mcpRuntimeSurfaces}`);
  ensure(afterExport.constellationInspectorStatus === "local-demo-integrated", `SEIS demo evidence constellation status mismatch: ${afterExport.constellationInspectorStatus}`);
  ensure(afterExport.constellationInspectorRouteCount === 6, `SEIS demo evidence constellation route count mismatch: ${afterExport.constellationInspectorRouteCount}`);
  ensure(afterExport.constellationInspectorPluginLaneCount === 5, `SEIS demo evidence constellation plugin count mismatch: ${afterExport.constellationInspectorPluginLaneCount}`);
  ensure(afterExport.constellationInspectorMcpToolCount === 34, `SEIS demo evidence constellation MCP tool count mismatch: ${afterExport.constellationInspectorMcpToolCount}`);
  ensure(Number(afterExport.constellationInspectorMcpResourceCount) === 26, `SEIS demo evidence constellation MCP resource count mismatch: ${afterExport.constellationInspectorMcpResourceCount}`);
  ensure(afterExport.constellationInspectorHeroNodeCount >= 32, `SEIS demo evidence constellation 3D node count too low: ${afterExport.constellationInspectorHeroNodeCount}`);
  ensure(afterExport.constellationInspectorBoundary === "local-demo-only", `SEIS demo evidence constellation boundary mismatch: ${afterExport.constellationInspectorBoundary}`);
  ensure(
    afterExport.seisAgentPluginIntegration === "content/development/seis-agent-plugin-integration.json",
    `SEIS demo evidence plugin integration source mismatch: ${afterExport.seisAgentPluginIntegration}`
  );
  ensure(
    afterExport.planViewSource === "data/seis-sub-agent-five-year-plan-view.json",
    `SEIS demo evidence plan-view source mismatch: ${afterExport.planViewSource}`
  );
  ensure(afterExport.planViewStatus === "generated-from-source", `SEIS demo evidence plan-view status mismatch: ${afterExport.planViewStatus}`);
  ensure(
    afterExport.planViewGeneratedBy === "scripts/create-sub-agent-five-year-demo-evidence.mjs",
    `SEIS demo evidence plan-view generator mismatch: ${afterExport.planViewGeneratedBy}`
  );
  ensure(afterExport.promotionMapStatus === "generated-from-source", `SEIS demo evidence promotion map status mismatch: ${afterExport.promotionMapStatus}`);
  ensure(
    afterExport.promotionMapSource === "data/seis-ai-core-version-promotion-map.json",
    `SEIS demo evidence promotion map source mismatch: ${afterExport.promotionMapSource}`
  );
  ensure(afterExport.completionPercent === 100, `SEIS demo evidence report expected 100% completion, got ${afterExport.completionPercent}`);
  ensure(afterExport.demoBoundary === "local-demo-only", `SEIS demo evidence report boundary mismatch: ${afterExport.demoBoundary}`);
  ensure(afterExport.releasePromotionAllowed === false, "SEIS demo evidence report must not allow release promotion");
  ensure(afterExport.recordCount === 20, `SEIS demo evidence report expected 20 records, got ${afterExport.recordCount}`);
  ensure(afterExport.firstRecordVersionTarget === "v0.1-foundation", `SEIS demo evidence first record version mismatch: ${afterExport.firstRecordVersionTarget}`);
  ensure(afterExport.lastRecordVersionTarget === "v1.0-public-enterprise-candidate", `SEIS demo evidence last record version mismatch: ${afterExport.lastRecordVersionTarget}`);
  ensure(afterExport.validationBrowserSmoke === "npm run check:product-experience-browser-smoke", "SEIS demo evidence report missing browser smoke validation command");
  ensure(afterExport.providerRegistrySource === "content/development/seis-ai-core-provider-registry.json", "SEIS demo evidence report missing provider registry source");
  ensure(afterExport.validationProviderRegistry === "npm run check:seis-ai-core-provider-registry", "SEIS demo evidence report missing AI Core provider registry validation command");
  ensure(afterExport.validationVersionRegistry === "npm run check:seis-ai-core-version-registry", "SEIS demo evidence report missing AI Core version registry validation command");
  ensure(afterExport.validationPromotionGates === "npm run check:seis-ai-core-version-promotion-gates", "SEIS demo evidence report missing AI Core promotion gate validation command");
  ensure(afterExport.statusText.includes("20/20 quarters"), "SEIS demo evidence export status did not show 20/20 quarters");
  ensure(afterExport.exportEvent, "SEIS demo evidence export event missing");

  await clickSelector(client, "#sub-agent-reset-demo");
  await waitFor(
    client,
    `JSON.parse(localStorage.getItem('seis-demo-sub-agent-run-ledger-v1') || '[]').length === 0`,
    5000
  );
  const afterReset = await evaluate(client, `(() => {
    const ledger = JSON.parse(localStorage.getItem('seis-demo-sub-agent-run-ledger-v1') || '[]');
    const report = localStorage.getItem('seis-demo-sub-agent-evidence-report-v1');
    const events = JSON.parse(localStorage.getItem('seis-demo-events-v1') || '[]');
    return {
      ledgerCount: ledger.length,
      evidenceCleared: report === null,
      resetEvent: events.some((event) => event.event_name === 'seis_demo_sub_agent_ledger_reset')
    };
  })()`);
  ensure(afterReset.ledgerCount === 0, "SEIS demo reset did not clear the sub-agent ledger");
  ensure(afterReset.evidenceCleared, "SEIS demo reset did not clear the evidence report");
  ensure(afterReset.resetEvent, "SEIS demo reset event missing");

  const screenshotPath = await screenshot(client, "sub-agent-five-year-demo.png");
  return { initial, afterConstellationSync, afterHero3dControls, afterFullRun, afterExport, afterReset, screenshot: screenshotPath };
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

  const staticServer = createStaticServer(WEB_ROOT);
  const demoStaticServer = createStaticServer(SEIS_DEMO_WEB_ROOT);
  await new Promise((resolveListen) => staticServer.listen(0, HOST, resolveListen));
  await new Promise((resolveListen) => demoStaticServer.listen(0, HOST, resolveListen));
  const appPort = staticServer.address().port;
  const demoPort = demoStaticServer.address().port;
  const debugPort = 9623 + Math.floor(Math.random() * 300);
  const userDataDir = join(tmpdir(), `seis-product-experience-chrome-${Date.now()}`);
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
    const seisCode = await smokeSeisCode(client, baseUrl);
    const mythicGacha = await smokeMythicGacha(client, baseUrl);
    const crossApp = await smokeCrossAppVisibility(client, baseUrl);
    const desktopSharedVfs = await smokeDesktopSharedVfs(client, baseUrl);
    const subAgentFiveYearDemo = await smokeSubAgentFiveYearDemo(client, `http://${HOST}:${demoPort}`);
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
      demoPort,
      screenshotDir: resolve(SCREENSHOT_DIR),
      seisCode,
      mythicGacha,
      crossApp,
      desktopSharedVfs,
      subAgentFiveYearDemo,
      mobile,
      notes
    }, null, 2));
  } finally {
    if (client) client.close();
    chrome.kill("SIGTERM");
    staticServer.close();
    demoStaticServer.close();
    setTimeout(() => rmSync(userDataDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 }), 500);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
