import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, normalize, resolve } from "node:path";
import { tmpdir } from "node:os";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const SCREENSHOT_DIR = join(ROOT, "dist", "qa", "second-brain-smoke");
const HOST = "127.0.0.1";
const DEBUG_HOST = "127.0.0.1";
const failures = [];

const REQUIRED_ARTIFACTS = [
  "/home/seis/SecondBrain/seis-second-brain-vault-snapshot.md",
  "/home/seis/SecondBrain/graph-links.json",
  "/home/seis/SecondBrain/second-brain-review-gate.md",
  "/home/seis/SecondBrain/github-readiness-review.md",
  "/home/seis/SecondBrain/search-index-snapshot.md",
  "/home/seis/SecondBrain/07-learning/seis-agent-training-pack.md"
];

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

async function listenStaticServer(server) {
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, HOST, () => {
      server.off("error", rejectListen);
      resolveListen();
    });
  }).catch((error) => {
    if (error?.code === "EPERM" && error?.address === HOST) {
      throw new Error(`Cannot run Second Brain browser smoke because this environment cannot bind ${HOST}. Original error: ${error.message}`);
    }
    throw error;
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
  await delay(250);
}

function collectRelevantIssues(events) {
  return events
    .filter((event) => ["Runtime.exceptionThrown", "Log.entryAdded", "Network.loadingFailed"].includes(event.method))
    .map((event) => ({
      level: event.params?.entry?.level || event.params?.type || event.method,
      text: event.params?.entry?.text
        || event.params?.exceptionDetails?.exception?.description
        || event.params?.exceptionDetails?.exception?.value
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

function validateStaticContract() {
  const requiredFiles = [
    "apps/web/desktop.html",
    "apps/web/desktop.js",
    "apps/web/desktop.css",
    "content/development/seis-second-brain-system.json",
    "docs/product/seis-second-brain.md",
    "scripts/check-seis-second-brain.mjs",
    "package.json"
  ];

  for (const file of requiredFiles) {
    ensure(existsSync(join(ROOT, file)), `missing required file: ${file}`);
  }

  if (failures.length > 0) return;

  const desktopJs = readFileSync(join(ROOT, "apps/web/desktop.js"), "utf8");
  const desktopCss = readFileSync(join(ROOT, "apps/web/desktop.css"), "utf8");
  const productDoc = readFileSync(join(ROOT, "docs/product/seis-second-brain.md"), "utf8");
  const packageJson = readFileSync(join(ROOT, "package.json"), "utf8");

  for (const marker of [
    "SEIS_SECOND_BRAIN_SYSTEM",
    "data-second-brain-app",
    "data-ai-second-brain-bridge",
    "data-second-brain-installed-ai",
    "data-second-brain-subagents",
    "data-second-brain-agent-roster",
    "data-second-brain-search-panel",
    "data-second-brain-search-results",
    "data-second-brain-search-filters",
    "data-second-brain-search-query",
    "second-brain-capture",
    "second-brain-link",
    "second-brain-training-pack",
    "second-brain-review",
    "second-brain-export-github",
    "second-brain-run-search",
    "second-brain-set-search-filter",
    "second-brain-record-search",
    "SEIS_SECOND_BRAIN_SEARCH_FILTERS",
    "seis-agent-training-pack.md",
    "search-index-snapshot.md",
    "seis-language-model-training-curriculum.json",
    "Language Model Training Curriculum",
    "No model install",
    "Obsidian bridge planned",
    "Human review before GitHub"
  ]) {
    ensure(desktopJs.includes(marker), `desktop.js missing marker: ${marker}`);
  }

  for (const marker of [
    ".second-brain-app",
    ".second-brain-vault",
    ".second-brain-graph",
    ".second-brain-inspector",
    ".second-brain-ai-index",
    ".second-brain-search-panel",
    ".second-brain-search-result"
  ]) {
    ensure(desktopCss.includes(marker), `desktop.css missing marker: ${marker}`);
  }

  ensure(productDoc.includes("browser-smoke"), "Second Brain product doc must mention browser-smoke evidence.");
  ensure(packageJson.includes("check:seis-second-brain-browser-smoke"), "package.json missing Second Brain browser-smoke script.");
}

async function bootDesktop(client, baseUrl) {
  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  await waitFor(client, "window.__SEIS_DESKTOP__?.appCount >= 50", 10000);
  await waitFor(client, "window.__SEIS_DESKTOP__?.bootState?.().complete === true", 6000);
}

async function openSecondBrain(client) {
  await evaluate(client, "window.__SEIS_DESKTOP__.openApp('second-brain')");
  const opened = await waitFor(client, "Boolean(document.querySelector('.app-window[data-app-id=\"second-brain\"]:not([hidden]) [data-second-brain-app]'))", 5000);
  if (!opened) throw new Error("Timed out opening SEIS Second Brain.");
}

async function smokeSecondBrain(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false
  });

  await bootDesktop(client, baseUrl);
  await openSecondBrain(client);

  const initial = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const root = document.querySelector('.app-window[data-app-id="second-brain"]:not([hidden]) [data-second-brain-app]');
    const text = root?.innerText || '';
    return {
      title: document.title,
      appCount: diagnostics.appCount,
      openWindows: diagnostics.openWindows(),
      hasRoot: Boolean(root),
      hasVault: Boolean(root?.querySelector('[data-second-brain-vault]')),
      hasGraph: Boolean(root?.querySelector('[data-second-brain-graph]')),
      hasInspector: Boolean(root?.querySelector('[data-second-brain-inspector]')),
      hasGithubGate: Boolean(root?.querySelector('[data-second-brain-github-gate]')),
      hasAgentRegistry: Boolean(root?.querySelector('[data-second-brain-agent-registry]')),
      hasSearchPanel: Boolean(root?.querySelector('[data-second-brain-search-panel]')),
      noteButtons: root?.querySelectorAll('[data-second-brain-vault] [data-action="second-brain-select-note"]').length || 0,
      graphNodes: root?.querySelectorAll('[data-second-brain-graph] [data-action="second-brain-select-note"]').length || 0,
      searchFilters: root?.querySelectorAll('[data-second-brain-search-filters] [data-action="second-brain-set-search-filter"]').length || 0,
      searchResults: root?.querySelectorAll('[data-second-brain-search-results] .second-brain-search-result').length || 0,
      installedAiRows: root?.querySelectorAll('[data-second-brain-installed-ai] tbody tr').length || 0,
      subAgentRows: root?.querySelectorAll('[data-second-brain-subagents] tbody tr').length || 0,
      agentRosterRows: root?.querySelectorAll('[data-second-brain-agent-roster] tbody tr').length || 0,
      contextProfileRows: root?.querySelectorAll('[data-second-brain-context-profiles] tbody tr').length || 0,
      managedLaneMetric: root?.querySelector('[data-second-brain-managed-lanes] p')?.textContent?.trim() || '',
      contextProfileMetric: root?.querySelector('[data-second-brain-context-profile-count] p')?.textContent?.trim() || '',
      agentRegistryDecision: root?.querySelector('[data-second-brain-agent-registry-decision]')?.innerText || '',
      agentRegistryText: root?.querySelector('[data-second-brain-agent-registry]')?.innerText || '',
      searchPanelText: root?.querySelector('[data-second-brain-search-panel]')?.innerText || '',
      searchSourceCounts: root?.querySelector('[data-second-brain-search-source-counts]')?.innerText || '',
      mcpContext: root?.querySelector('[data-second-brain-mcp-resource]')?.innerText || '',
      managedLaneText: root?.querySelector('[data-second-brain-subagents]')?.innerText || '',
      contextProfileText: root?.querySelector('[data-second-brain-context-profiles]')?.innerText || '',
      agentRosterText: root?.querySelector('[data-second-brain-agent-roster]')?.innerText || '',
      actionButtons: root?.querySelectorAll('[data-action="app-primary"], [data-action="second-brain-capture"], [data-action="second-brain-link"], [data-action="second-brain-training-pack"], [data-action="second-brain-review"], [data-action="second-brain-export-github"]').length || 0,
      localDemoCopy: text.includes('Local Demo'),
      obsidianCopy: text.includes('Obsidian bridge planned'),
      githubReviewCopy: text.includes('Human review before GitHub'),
      noMutationCopy: text.includes('No Obsidian plugin install') && text.includes('GitHub mutation') && text.includes('credential access'),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
    };
  })()`);

  ensure(initial.title === "SEIS System OS", `Desktop title mismatch: ${initial.title}`);
  ensure(initial.appCount >= 50, `expected Desktop app catalog, got ${initial.appCount}`);
  ensure(initial.openWindows.includes("SEIS Second Brain"), `Second Brain window missing from diagnostics: ${JSON.stringify(initial.openWindows)}`);
  ensure(initial.hasRoot, "Second Brain root marker missing.");
  ensure(initial.hasVault, "Second Brain vault panel missing.");
  ensure(initial.hasGraph, "Second Brain graph panel missing.");
  ensure(initial.hasInspector, "Second Brain inspector missing.");
  ensure(initial.hasGithubGate, "Second Brain GitHub gate panel missing.");
  ensure(initial.hasAgentRegistry, "Second Brain agent registry evidence panel missing.");
  ensure(initial.hasSearchPanel, "Second Brain local search panel missing.");
  ensure(initial.noteButtons === 6, `expected six vault notes, got ${initial.noteButtons}`);
  ensure(initial.graphNodes === 6, `expected six graph nodes, got ${initial.graphNodes}`);
  ensure(initial.searchFilters === 9, `expected nine Second Brain search filters, got ${initial.searchFilters}`);
  ensure(initial.searchResults >= 8, `expected at least eight Second Brain search results, got ${initial.searchResults}`);
  ensure(initial.installedAiRows === 6, `expected six installed AI rows, got ${initial.installedAiRows}`);
  ensure(initial.subAgentRows === 9, `expected nine managed lane rows, got ${initial.subAgentRows}`);
  ensure(initial.agentRosterRows === 13, `expected thirteen autonomous agent rows, got ${initial.agentRosterRows}`);
  ensure(initial.contextProfileRows === 9, `expected nine local context profiles, got ${initial.contextProfileRows}`);
  ensure(initial.managedLaneMetric === "9", `expected managed lane metric 9, got ${initial.managedLaneMetric}`);
  ensure(initial.contextProfileMetric === "9", `expected context profile metric 9, got ${initial.contextProfileMetric}`);
  ensure(initial.agentRegistryDecision.includes("NO-GO"), "Second Brain must render the agent registry NO-GO decision.");
  ensure(initial.agentRegistryText.includes("second-brain-agent-registry-latest.json") && initial.agentRegistryText.includes("NO-GO-autonomous-execution-not-approved"), "Second Brain must render the agent registry artifact and decision.");
  ensure(initial.searchPanelText.includes("notes, backlinks, tags, apps, routes, files, plugins, and agent duties"), "Second Brain search panel must describe all local index sources.");
  ensure(["Notes", "Backlinks", "Tags", "Apps", "Routes", "Files", "Plugins", "Agents"].every((label) => initial.searchSourceCounts.includes(label)), "Second Brain search source counts must cover every local source type.");
  ensure(initial.mcpContext.includes("seis://brain/second-brain-system.json"), "Second Brain must render the read-only MCP context resource.");
  ensure(initial.managedLaneText.includes("SEIS Product") && initial.managedLaneText.includes("seis_product_status"), "Second Brain managed lane table must expose the SEIS Product MCP lane.");
  ensure(initial.contextProfileText.includes("@seis-data") && initial.contextProfileText.includes("seis_product_plan"), "Second Brain context profiles must expose the SEIS Data and Product planning lanes.");
  ensure(initial.agentRosterText.includes("Product Agent"), "Second Brain autonomous roster must expose Product Agent.");
  ensure(initial.actionButtons === 6, `expected six Second Brain actions, got ${initial.actionButtons}`);
  ensure(initial.localDemoCopy, "Second Brain must label Local Demo mode.");
  ensure(initial.obsidianCopy, "Second Brain must label Obsidian bridge as planned.");
  ensure(initial.githubReviewCopy, "Second Brain must label human review before GitHub.");
  ensure(initial.noMutationCopy, "Second Brain must keep no-plugin/no-GitHub/no-credential boundary copy visible.");
  ensure(!initial.horizontalOverflow, "Second Brain desktop viewport has horizontal overflow.");

  await clickSelector(client, '.app-window[data-app-id="second-brain"]:not([hidden]) [data-action="second-brain-select-note"][data-value="github-readiness"]');
  const selected = await evaluate(client, `(() => {
    const active = document.querySelector('.app-window[data-app-id="second-brain"]:not([hidden]) [data-second-brain-vault] .is-active');
    const inspector = document.querySelector('.app-window[data-app-id="second-brain"]:not([hidden]) [data-second-brain-inspector]')?.innerText || '';
    return { value: active?.dataset?.value || '', inspector };
  })()`);
  ensure(selected.value === "github-readiness", `expected GitHub Readiness note selection, got ${JSON.stringify(selected)}`);
  ensure(selected.inspector.includes("GitHub Readiness"), "Second Brain inspector did not follow selected note.");

  await clickSelector(client, '.app-window[data-app-id="second-brain"]:not([hidden]) [data-action="second-brain-set-search-filter"][data-value="Plugins"]');
  await clickSelector(client, '.app-window[data-app-id="second-brain"]:not([hidden]) [data-action="second-brain-run-search"]');
  await clickSelector(client, '.app-window[data-app-id="second-brain"]:not([hidden]) [data-action="second-brain-record-search"]');
  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/SecondBrain/search-index-snapshot.md')", 5000);
  const searchSnapshot = await evaluate(client, `(() => {
    const root = document.querySelector('.app-window[data-app-id="second-brain"]:not([hidden]) [data-second-brain-app]');
    const text = root?.innerText || '';
    return {
      filterText: root?.querySelector('[data-second-brain-search-source-counts]')?.innerText || '',
      results: root?.querySelectorAll('[data-second-brain-search-results] .second-brain-search-result').length || 0,
      snapshotVisible: text.includes('search-index-snapshot.md') || text.includes('Local search snapshot saved')
    };
  })()`);
  ensure(searchSnapshot.filterText.includes("Plugins"), "Second Brain search filter did not switch to Plugins.");
  ensure(searchSnapshot.results >= 1, `Second Brain plugin search should show results: ${JSON.stringify(searchSnapshot)}`);
  ensure(searchSnapshot.snapshotVisible, "Second Brain search snapshot action did not update visible state.");

  await clickSelector(client, '.app-window[data-app-id="second-brain"]:not([hidden]) [data-action="app-primary"][data-app-id="second-brain"]');
  await clickSelector(client, '.app-window[data-app-id="second-brain"]:not([hidden]) [data-action="second-brain-capture"]');
  await clickSelector(client, '.app-window[data-app-id="second-brain"]:not([hidden]) [data-action="second-brain-link"]');
  await clickSelector(client, '.app-window[data-app-id="second-brain"]:not([hidden]) [data-action="second-brain-training-pack"]');
  await clickSelector(client, '.app-window[data-app-id="second-brain"]:not([hidden]) [data-action="second-brain-review"]');
  await clickSelector(client, '.app-window[data-app-id="second-brain"]:not([hidden]) [data-action="second-brain-export-github"]');

  await waitFor(client, "window.__SEIS_DESKTOP__.filePaths().includes('/home/seis/SecondBrain/github-readiness-review.md')", 5000);
  const artifacts = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const paths = diagnostics.filePaths();
    const secondBrainPaths = paths.filter((path) => path.startsWith('/home/seis/SecondBrain/')).sort();
    const text = document.querySelector('.app-window[data-app-id="second-brain"]:not([hidden]) [data-second-brain-app]')?.innerText || '';
    return {
      secondBrainPaths,
      fixedArtifacts: ${JSON.stringify(REQUIRED_ARTIFACTS)}.filter((path) => paths.includes(path)),
      capturePaths: secondBrainPaths.filter((path) => path.startsWith('/home/seis/SecondBrain/00-inbox/capture-')),
      notePaths: secondBrainPaths.filter((path) => path.endsWith('.md') && !path.includes('capture-')),
      lastActionVisible: text.includes('GitHub readiness export saved'),
      reviewVisible: text.includes('Human review required') || text.includes('human-review-required'),
      trainingPackVisible: text.toLowerCase().includes('training pack saved'),
      status: diagnostics.appStatus('second-brain')
    };
  })()`);

  ensure(artifacts.fixedArtifacts.length === REQUIRED_ARTIFACTS.length, `missing Second Brain artifacts: ${JSON.stringify(artifacts)}`);
  ensure(artifacts.capturePaths.length >= 1, "Second Brain capture action did not create an inbox note.");
  ensure(artifacts.notePaths.length >= 8, `Second Brain expected snapshot plus note/review markdown files, got ${artifacts.notePaths.length}`);
  ensure(artifacts.lastActionVisible, "Second Brain GitHub readiness action did not update visible state.");
  ensure(artifacts.reviewVisible, "Second Brain review state not visible after actions.");
  ensure(artifacts.trainingPackVisible, "Second Brain training pack action did not update visible state.");
  ensure(artifacts.status?.lastAction?.includes("GitHub readiness export saved"), `Second Brain app status should record the readiness export: ${JSON.stringify(artifacts.status)}`);

  await evaluate(client, "window.__SEIS_DESKTOP__.openApp('ai-assistant')");
  await waitFor(client, "Boolean(document.querySelector('.app-window[data-app-id=\"ai-assistant\"]:not([hidden]) [data-ai-app]'))", 5000);
  await clickSelector(client, '.app-window[data-app-id="ai-assistant"]:not([hidden]) [data-ai-plugin-tab="Second Brain"]');
  const aiBridge = await evaluate(client, `(() => {
    const bridge = document.querySelector('.app-window[data-app-id="ai-assistant"]:not([hidden]) [data-ai-second-brain-bridge]');
    const text = bridge?.innerText || '';
    return {
      hasBridge: Boolean(bridge),
      metricCards: bridge?.querySelectorAll('.metric-card').length || 0,
      rows: bridge?.querySelectorAll('[data-ai-second-brain-sources] tbody tr').length || 0,
      registryText: bridge?.querySelector('[data-ai-second-brain-agent-registry-panel]')?.innerText || '',
      localOnlyCopy: text.includes('Local Demo context only'),
      noMutationCopy: text.includes('no private vault import') && text.includes('GitHub mutation') && text.includes('SSH')
    };
  })()`);
  ensure(aiBridge.hasBridge, "SEIS AI Second Brain bridge did not render.");
  ensure(aiBridge.metricCards >= 6, `SEIS AI Second Brain bridge expected six metric cards, got ${aiBridge.metricCards}`);
  ensure(aiBridge.rows === 6, `SEIS AI Second Brain bridge expected six note rows, got ${aiBridge.rows}`);
  ensure(aiBridge.registryText.includes("second-brain-agent-registry-latest.json") && aiBridge.registryText.includes("NO-GO-autonomous-execution-not-approved"), "SEIS AI Second Brain bridge must render agent registry evidence.");
  ensure(aiBridge.localOnlyCopy, "SEIS AI Second Brain bridge must label local context only.");
  ensure(aiBridge.noMutationCopy, "SEIS AI Second Brain bridge must label private vault/GitHub/SSH boundary.");

  const screenshotPath = await screenshot(client, "second-brain-desktop.png");

  await goto(client, `${baseUrl}/desktop.html`);
  await waitFor(client, "Boolean(window.__SEIS_DESKTOP__)", 10000);
  const persistence = await evaluate(client, `(() => {
    const paths = window.__SEIS_DESKTOP__.filePaths();
    return {
      fixedArtifacts: ${JSON.stringify(REQUIRED_ARTIFACTS)}.filter((path) => paths.includes(path)),
      capturePaths: paths.filter((path) => path.startsWith('/home/seis/SecondBrain/00-inbox/capture-')),
      openWindows: window.__SEIS_DESKTOP__.openWindows()
    };
  })()`);
  ensure(persistence.fixedArtifacts.length === REQUIRED_ARTIFACTS.length, `Second Brain VFS artifacts did not persist after reload: ${JSON.stringify(persistence)}`);
  ensure(persistence.capturePaths.length >= 1, "Second Brain inbox capture did not persist after reload.");

  return {
    initial,
    searchSnapshot,
    artifacts,
    aiBridge,
    persistence,
    screenshot: screenshotPath
  };
}

async function smokeMobile(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await bootDesktop(client, baseUrl);
  await openSecondBrain(client);
  await delay(500);

  const mobile = await evaluate(client, `(() => {
    const diagnostics = window.__SEIS_DESKTOP__;
    const root = document.querySelector('.app-window[data-app-id="second-brain"]:not([hidden]) [data-second-brain-app]');
    const targets = Array.from(root?.querySelectorAll('button, a, input, textarea, select') || []).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
        action: element.dataset?.action || '',
        label: (element.getAttribute('aria-label') || element.textContent || '').trim().slice(0, 48)
      };
    }).filter((target) => target.visible);
    const cramped = targets.filter((target) => target.width < 36 || target.height < 32);
    return {
      appCount: diagnostics.appCount,
      hasRoot: Boolean(root),
      targetCount: targets.length,
      crampedTargets: cramped.length,
      crampedSummary: cramped.slice(0, 8).map((target) => target.label + ' [' + target.action + '] ' + Math.round(target.width) + 'x' + Math.round(target.height)).join(' | '),
      hasVault: Boolean(root?.querySelector('[data-second-brain-vault]')),
      hasGraph: Boolean(root?.querySelector('[data-second-brain-graph]')),
      hasGithubGate: Boolean(root?.querySelector('[data-second-brain-github-gate]')),
      hasSearchPanel: Boolean(root?.querySelector('[data-second-brain-search-panel]')),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      appHeading: (root?.querySelector('h2')?.textContent || '').trim(),
      secondBrainText: (root?.innerText || '').slice(0, 400)
    };
  })()`);

  ensure(mobile.appCount >= 50, `Second Brain mobile expected app catalog, got ${mobile.appCount}`);
  ensure(mobile.hasRoot, "Second Brain mobile root missing.");
  ensure(mobile.hasVault, "Second Brain mobile vault panel missing.");
  ensure(mobile.hasGraph, "Second Brain mobile graph panel missing.");
  ensure(mobile.hasGithubGate, "Second Brain mobile GitHub gate missing.");
  ensure(mobile.hasSearchPanel, "Second Brain mobile search panel missing.");
  ensure(mobile.targetCount >= 10, `Second Brain mobile expected interactive controls, got ${mobile.targetCount}`);
  ensure(mobile.crampedTargets <= 4, `Second Brain mobile has too many cramped targets: ${mobile.crampedTargets}; ${mobile.crampedSummary}`);
  ensure(!mobile.horizontalOverflow, "Second Brain mobile viewport has horizontal overflow.");
  ensure(mobile.appHeading === "SEIS Second Brain" || mobile.secondBrainText.includes("SEIS Second Brain"), "Second Brain mobile content missing app title.");

  const screenshotPath = await screenshot(client, "second-brain-mobile.png");
  return { ...mobile, screenshot: screenshotPath };
}

async function main() {
  validateStaticContract();
  if (failures.length > 0) {
    console.error("SEIS Second Brain browser smoke failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  const chromePath = findChrome();
  if (!chromePath) throw new Error("No Chrome or Chromium executable found. Set CHROME_PATH to run the SEIS Second Brain browser smoke.");

  rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const staticServer = createStaticServer();
  await listenStaticServer(staticServer);
  const appPort = staticServer.address().port;
  const debugPort = 59000 + Math.floor(Math.random() * 2000);
  const userDataDir = join(tmpdir(), `seis-second-brain-smoke-${Date.now()}`);
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
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
    const baseUrl = `http://${HOST}:${appPort}`;
    const secondBrain = await smokeSecondBrain(client, baseUrl);
    const mobile = await smokeMobile(client, baseUrl);
    const relevantIssues = collectRelevantIssues(client.events);
    ensure(relevantIssues.length === 0, `browser console/network issues detected: ${JSON.stringify(relevantIssues.slice(0, 3))}`);

    if (failures.length > 0) {
      console.error("SEIS Second Brain browser smoke failed:");
      for (const failure of failures) console.error(`- ${failure}`);
      process.exitCode = 1;
      return;
    }

    console.log(JSON.stringify({
      ok: true,
      browser: chromePath,
      appPort,
      screenshotDir: resolve(SCREENSHOT_DIR),
      secondBrain,
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
