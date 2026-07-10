#!/usr/bin/env node

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, normalize } from "node:path";
import { tmpdir } from "node:os";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
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
  if (file.endsWith(".webmanifest")) return "application/manifest+json; charset=utf-8";
  return "application/octet-stream";
}

function createStaticOnlyServer() {
  return createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${HOST}`);

    if (requestUrl.pathname.startsWith("/_server/")) {
      response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ ok: false, error: "api_server_not_available_in_static_fallback" }));
      return;
    }

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
    await delay(150);
  }

  throw new Error(`Timed out waiting for ${url}: ${lastError?.message || "timed out"}`);
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
  const ready = await waitFor(client, "document.readyState === 'complete'", 16000);
  if (!ready) throw new Error(`Timed out loading ${url}`);
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
    .filter((issue) => issue.text !== "net::ERR_ABORTED");
}

async function smokeStaticFallback(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1366,
    height: 860,
    deviceScaleFactor: 1,
    mobile: false
  });

  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  await waitFor(client, "window.__SEIS_DESKTOP__?.bootState?.().complete === true", 12000);
  const desktop = await evaluate(client, `(() => ({
    title: document.title,
    appCount: window.__SEIS_DESKTOP__?.appCount,
    commandCount: window.__SEIS_DESKTOP__?.terminalCommands?.length,
    bootComplete: window.__SEIS_DESKTOP__?.bootState?.().complete,
    launcherApps: window.__SEIS_DESKTOP__?.launcherState?.().visibleApps?.length || 0,
    localDemo: document.body.innerText.includes('Local Demo') || document.body.innerText.includes('no host OS or SSH'),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
  }))()`);

  await goto(client, `${baseUrl}/website/index.html`);
  await waitFor(client, "document.body?.dataset?.productPage === '' || document.body?.hasAttribute('data-product-page')", 5000);
  const website = await evaluate(client, `(() => ({
    title: document.title,
    productPage: document.body.hasAttribute('data-product-page'),
    textReady: document.body.innerText.includes('SEIS'),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
  }))()`);

  const serverRequests = client.events
    .filter((event) => event.method === "Network.requestWillBeSent")
    .map((event) => event.params?.request?.url || "")
    .filter((url) => url.includes("/_server/"));
  const issues = collectRelevantIssues(client.events);

  ensure(desktop.title === "SEIS System OS", `Desktop title mismatch: ${desktop.title}`);
  ensure(desktop.appCount >= 50, `Desktop expected at least 50 apps, found ${desktop.appCount}`);
  ensure(desktop.commandCount >= 12, `Desktop expected at least 12 terminal commands, found ${desktop.commandCount}`);
  ensure(desktop.bootComplete === true, "Desktop boot did not complete without API server.");
  ensure(desktop.localDemo === true, "Desktop no-key/local boundary copy missing.");
  ensure(desktop.horizontalOverflow === false, "Desktop has horizontal overflow.");

  ensure(website.title.startsWith("SEIS Website"), `Website title mismatch: ${website.title}`);
  ensure(website.productPage === true, "Website product page marker missing.");
  ensure(website.textReady === true, "Website hub did not render SEIS content.");
  ensure(website.horizontalOverflow === false, "Website hub has horizontal overflow.");

  ensure(serverRequests.length === 0, `Static demo made ${serverRequests.length} forbidden /_server request(s): ${serverRequests.slice(0, 5).join(", ")}`);
  ensure(issues.length === 0, `browser emitted ${issues.length} relevant issue(s): ${JSON.stringify(issues.slice(0, 3))}`);

  return {
    desktop,
    website,
    forbiddenServerRequestCount: serverRequests.length,
    relevantIssueCount: issues.length
  };
}

async function main() {
  ensure(existsSync(WEB_ROOT), "apps/web must exist.");
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }

  const chrome = findChrome();
  if (!chrome) {
    console.error("Chrome/Chromium was not found for SEIS full-stack no-server fallback smoke.");
    process.exit(1);
  }

  const appServer = createStaticOnlyServer();
  const userDataDir = join(tmpdir(), `seis-fullstack-no-server-smoke-${Date.now()}`);
  const debugPort = 59000 + Math.floor(Math.random() * 2000);
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
    const summary = await smokeStaticFallback(client, baseUrl);
    console.log(JSON.stringify({
      ok: failures.length === 0,
      browser: chrome,
      appPort,
      staticOnly: true,
      noServerApiFallback: summary
    }, null, 2));
  } finally {
    client?.close();
    if (chromeProcess && chromeProcess.exitCode === null) {
      const exited = new Promise((resolveExit) => chromeProcess.once("exit", resolveExit));
      chromeProcess.kill("SIGTERM");
      await Promise.race([exited, delay(1500)]);
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
