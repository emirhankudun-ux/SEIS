import { createServer } from "node:http";
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, normalize } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const HOST = "127.0.0.1";
const failures = [];
const ensure = (condition, message) => { if (!condition) failures.push(message); };
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findChrome() {
  return [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium"
  ].filter(Boolean).find((candidate) => existsSync(candidate));
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  return "application/octet-stream";
}

function createStaticServer() {
  return createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${HOST}`);
    const relativePath = requestUrl.pathname === "/" ? "/desktop.html" : requestUrl.pathname;
    const filePath = normalize(join(WEB_ROOT, decodeURIComponent(relativePath)));
    if (!filePath.startsWith(WEB_ROOT) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": contentType(filePath) });
    response.end(readFileSync(filePath));
  });
}

class CdpClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
  }
  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result || {});
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  close() { this.ws.close(); }
}

async function fetchJson(url, options = {}) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
    } catch {}
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  return result.result?.value;
}

async function waitFor(client, expression, label) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const value = await evaluate(client, expression);
    if (value) return value;
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function goto(client, url) {
  await client.send("Page.navigate", { url });
  await waitFor(client, "document.readyState === 'interactive' || document.readyState === 'complete'", url);
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) throw new Error("No Chrome or Chromium executable found. Set CHROME_PATH to run the shared VFS browser smoke.");
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, HOST, resolve));
  const port = server.address().port;
  const debugPort = 9750 + Math.floor(Math.random() * 200);
  const userDataDir = join(tmpdir(), `seis-shared-vfs-chrome-${Date.now()}`);
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
    await fetchJson(`http://127.0.0.1:${debugPort}/json/version`);
    const target = await fetchJson(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" });
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.open();
    await client.send("Runtime.enable");
    const baseUrl = `http://${HOST}:${port}`;

    await goto(client, `${baseUrl}/desktop.html`);
    await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", "Desktop diagnostics");
    const desktopWrite = await evaluate(client, `(async () => {
      const diagnostics = window.__SEIS_DESKTOP__;
      diagnostics.runTerminalCommand('echo shared-vfs-cross-route > Documents/shared-vfs-cross-route.txt');
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { paths: diagnostics.filePaths(), persistence: diagnostics.sharedVfs() };
    })()`);
    ensure(desktopWrite.paths.includes("/home/seis/Documents/shared-vfs-cross-route.txt"), "Desktop must create the cross-route marker in its VFS.");
    await waitFor(client, "Boolean(window.__SEIS_DESKTOP__.sharedVfs?.().lastSavedAt)", "Desktop shared VFS save");

    await goto(client, `${baseUrl}/seis-code.html`);
    await waitFor(client, "Boolean(window.__SEIS_CODE__)", "SEIS Code diagnostics");
    await waitFor(client, "window.__SEIS_CODE__.filePaths().includes('/workspace/Documents/shared-vfs-cross-route.txt')", "Code shared marker");
    const codeRead = await evaluate(client, `(async () => {
      const diagnostics = window.__SEIS_CODE__;
      await diagnostics.runTerminalCommand('cat Documents/shared-vfs-cross-route.txt');
      return { paths: diagnostics.filePaths(), terminal: diagnostics.terminalText(), persistence: diagnostics.sharedVfs() };
    })()`);
    ensure(codeRead.terminal.includes("shared-vfs-cross-route"), "SEIS Code terminal must read the Desktop-created shared marker.");
    ensure(codeRead.persistence.scope === "workspace", "SEIS Code must report the workspace shared VFS scope.");

    await goto(client, `${baseUrl}/desktop.html`);
    await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", "Desktop reload diagnostics");
    await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/Documents/shared-vfs-cross-route.txt')", "Desktop reload marker");
    const desktopReload = await evaluate(client, "window.__SEIS_DESKTOP__.sharedVfs()");
    ensure(desktopReload.scope === "workspace", "Desktop must report the workspace shared VFS scope after reload.");

    if (failures.length) {
      console.error(JSON.stringify({ ok: false, failures, desktopWrite, codeRead, desktopReload }, null, 2));
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify({ ok: true, browser: chromePath, scope: "workspace", desktopWrite, codeRead, desktopReload }, null, 2));
  } finally {
    client?.close();
    chrome.kill("SIGTERM");
    server.close();
    setTimeout(() => rmSync(userDataDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 }), 500);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
