import { createServer } from "node:http";
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, normalize } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const HOST = "127.0.0.1";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findChrome() {
  return [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium", "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean).find((candidate) => existsSync(candidate));
}

function createStaticServer() {
  return createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${HOST}`);
    const pathname = requestUrl.pathname === "/" ? "/seis-workspace-recovery.html" : requestUrl.pathname;
    const filePath = normalize(join(WEB_ROOT, decodeURIComponent(pathname)));
    if (!filePath.startsWith(WEB_ROOT) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    const contentType = filePath.endsWith(".html") ? "text/html; charset=utf-8" : filePath.endsWith(".css") ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(readFileSync(filePath));
  });
}

class CdpClient {
  constructor(url) { this.ws = new WebSocket(url); this.nextId = 1; this.pending = new Map(); }
  async open() {
    await new Promise((resolve, reject) => { this.ws.addEventListener("open", resolve, { once: true }); this.ws.addEventListener("error", reject, { once: true }); });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message)); else pending.resolve(message.result || {});
    });
  }
  send(method, params = {}) { const id = this.nextId++; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); }
  close() { this.ws.close(); }
}

async function fetchJson(url, options = {}) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try { const response = await fetch(url, options); if (response.ok) return response.json(); } catch {}
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
  while (Date.now() < deadline) { const value = await evaluate(client, expression); if (value) return value; await delay(150); }
  throw new Error(`Timed out waiting for ${label}`);
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) throw new Error("No Chrome or Chromium executable found.");
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, HOST, resolve));
  const port = server.address().port;
  const debugPort = 9900 + Math.floor(Math.random() * 100);
  const userDataDir = join(tmpdir(), `seis-workspace-recovery-${Date.now()}`);
  const chrome = spawn(chromePath, ["--headless=new", `--remote-debugging-port=${debugPort}`, "--remote-allow-origins=*", `--user-data-dir=${userDataDir}`, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: "ignore" });
  let client;
  try {
    const target = await fetchJson(`http://${HOST}:${debugPort}/json/new?about:blank`, { method: "PUT" });
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.open();
    await client.send("Runtime.enable");
    await client.send("Page.enable");
    const baseUrl = `http://${HOST}:${port}`;
    await client.send("Page.navigate", { url: `${baseUrl}/seis-workspace-recovery.html` });
    await waitFor(client, "Boolean(window.__SEIS_WORKSPACE_RECOVERY__?.current?.())", "recovery diagnostics");
    const smoke = await evaluate(client, `(async () => {
      const diagnostics = window.__SEIS_WORKSPACE_RECOVERY__;
      const snapshot = {
        type: 'seis-shared-vfs-snapshot',
        version: 1,
        scope: 'workspace',
        root: '/workspace',
        exportedAt: new Date().toISOString(),
        entries: [{ path: '/workspace/recovery/smoke.txt', type: 'file', content: 'recovery-ok', updatedAt: new Date().toISOString() }]
      };
      const merged = await diagnostics.importSnapshot(snapshot);
      await diagnostics.refresh();
      const exported = await diagnostics.exportSnapshot();
      return {
        merged,
        current: diagnostics.current(),
        exportedEntries: exported.entries.length,
        markerVisible: exported.entries.some((entry) => entry.path === '/workspace/recovery/smoke.txt' && entry.content === 'recovery-ok'),
        noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
        actionCount: document.querySelectorAll('button, a, input').length
      };
    })()`);
    if (!smoke.markerVisible || !smoke.noHorizontalOverflow || smoke.merged.error) throw new Error(`Recovery smoke failed: ${JSON.stringify(smoke)}`);
    await client.send("Page.navigate", { url: `${baseUrl}/seis-workspace-recovery.html` });
    await waitFor(client, "window.__SEIS_WORKSPACE_RECOVERY__?.current?.()?.entries?.some((entry) => entry.path === '/workspace/recovery/smoke.txt')", "recovery reload marker");
    const reload = await evaluate(client, "({ markerVisible: window.__SEIS_WORKSPACE_RECOVERY__.current().entries.some((entry) => entry.path === '/workspace/recovery/smoke.txt'), storage: window.__SEIS_WORKSPACE_RECOVERY__.current().mode, title: document.title })");
    console.log(JSON.stringify({ ok: true, browser: chromePath, scope: "workspace", smoke, reload }, null, 2));
  } finally {
    client?.close();
    chrome.kill("SIGTERM");
    server.close();
    setTimeout(() => rmSync(userDataDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 }), 500);
  }
}

main().catch((error) => { console.error(error.stack || error.message); process.exit(1); });
