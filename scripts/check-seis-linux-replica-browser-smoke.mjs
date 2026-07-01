import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, normalize } from "node:path";
import { homedir, tmpdir } from "node:os";
import vm from "node:vm";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const SCREENSHOT_DIR = join(ROOT, "dist", "qa", "seis-linux-replica-smoke");
const REPORT_FILE = join(SCREENSHOT_DIR, "summary.json");
const HOST = "127.0.0.1";
const DEBUG_HOST = "127.0.0.1";
const STATIC_ONLY = process.argv.includes("--static") || process.argv.includes("--contract-only");
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

function playwrightChromeCandidates() {
  const cacheRoot = join(homedir(), "Library", "Caches", "ms-playwright");
  if (!existsSync(cacheRoot)) return [];

  try {
    return readdirSync(cacheRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium-"))
      .flatMap((entry) => [
        join(cacheRoot, entry.name, "chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
        join(cacheRoot, entry.name, "chrome-mac", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
        join(cacheRoot, entry.name, "chrome-linux", "chrome")
      ]);
  } catch {
    return [];
  }
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    ...playwrightChromeCandidates(),
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

async function sendTerminalCommand(client, command, timeoutMs = 5000) {
  const serializedCommand = JSON.stringify(command);
  const sent = await waitFor(client, `(() => {
    const input = document.querySelector('[data-terminal] input');
    if (!input) return false;
    input.focus();
    input.value = ${serializedCommand};
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  })()`, timeoutMs);
  ensure(sent === true, `terminal input was not ready for command: ${command}`);
}

async function goto(client, url) {
  await client.send("Page.navigate", { url }, 20000);
  const ready = await waitFor(client, "document.readyState === 'interactive' || document.readyState === 'complete'", 12000);
  if (!ready) throw new Error(`Timed out loading ${url}`);
}

async function screenshot(client, name) {
  let result;
  const params = {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      result = await client.send("Page.captureScreenshot", params, 90000);
      break;
    } catch (error) {
      if (attempt === 1 || !String(error.message || "").includes("Page.captureScreenshot")) throw error;
      await new Promise((resolve) => setTimeout(resolve, 750));
    }
  }
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
  const referenceAppsPath = "apps/web/reference-banks/reference-apps.js";
  const routesPath = "apps/web/src/config/routes.json";
  const serviceWorkerPath = "apps/web/service-worker.js";
  const functionalAppsPath = "apps/web/seis-linux-functional-apps.js";
  const readmePath = "README.md";

  for (const file of [routePath, referenceAppsPath, routesPath, serviceWorkerPath, functionalAppsPath, readmePath]) {
    ensure(existsSync(file), `missing required file: ${file}`);
  }

  if (failures.length > 0) return null;

  const html = readFileSync(routePath, "utf8");
  const referenceApps = readFileSync(referenceAppsPath, "utf8");
  const routes = readFileSync(routesPath, "utf8");
  const serviceWorker = readFileSync(serviceWorkerPath, "utf8");
  const functionalApps = readFileSync(functionalAppsPath, "utf8");
  const readme = readFileSync(readmePath, "utf8");
  const baseCatalogBlock = html.match(/const BASE_APP_ENTRIES=\[([\s\S]*?)\n {2}\];/);
  const baseAppIds = baseCatalogBlock ? Array.from(baseCatalogBlock[1].matchAll(/^\s+\["([^"]+)"/gm)).map((match) => match[1]) : [];
  const baseAppCount = baseCatalogBlock ? (baseCatalogBlock[1].match(/^\s+\["/gm) || []).length : 0;
  const referenceCount = (referenceApps.match(/"id":"ref-/g) || []).length;
  let referenceManifest = [];
  let functionalManifest = [];
  let enhancedManifest = [];
  let gameManifest = [];

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
    vm.runInNewContext(functionalApps, sandbox, { timeout: 1000 });
    functionalManifest = Array.isArray(sandbox.window.SEIS_FUNCTIONAL_APP_IDS)
      ? sandbox.window.SEIS_FUNCTIONAL_APP_IDS
      : [];
    enhancedManifest = Array.isArray(sandbox.window.SEIS_ENHANCED_APP_IDS)
      ? sandbox.window.SEIS_ENHANCED_APP_IDS
      : [];
    gameManifest = Array.isArray(sandbox.window.SEIS_GAME_APP_IDS)
      ? sandbox.window.SEIS_GAME_APP_IDS
      : [];
    ensure(typeof sandbox.window.SEIS_RENDER_FUNCTIONAL_APP === "function", "functional app renderer must be exported.");
    ensure(typeof sandbox.window.SEIS_RENDER_FUNCTIONAL_GAME === "function", "functional game renderer must be exported.");
  } catch (error) {
    ensure(false, `functional app runtime could not be evaluated: ${error.message}`);
  }

  ensure(html.includes("<title>SEIS Linux Replica</title>"), "Linux Replica route must expose a SEIS title.");
  ensure(html.includes("data-seis-linux-replica"), "Linux Replica route must expose a runtime marker.");
  ensure(html.includes("./seis-linux-functional-apps.js"), "Linux Replica route must load the functional app runtime.");
  ensure(html.includes("SEIS_RENDER_FUNCTIONAL_APP"), "Linux Replica route must delegate generic apps to the functional app runtime.");
  ensure(html.includes("SEIS_RENDER_FUNCTIONAL_GAME"), "Linux Replica route must delegate games to the functional app runtime.");
  ensure(html.includes("functionalAppCount"), "Linux Replica diagnostics must expose the functional app count.");
  ensure(html.includes("functionalCoverageRows"), "Linux Replica route must build a functional app coverage ledger.");
  ensure(html.includes("data-functional-coverage"), "Linux Replica route must render functional app coverage evidence.");
  ensure(html.includes("data-coverage-app"), "Linux Replica route must render per-app functional coverage rows.");
  ensure(html.includes("renderFunctionalAuditEvidence"), "Linux Replica route must define visible functional audit evidence.");
  ensure(html.includes("data-functional-audit-evidence"), "Linux Replica route must render visible functional audit evidence.");
  ensure(html.includes("data-audit-metric"), "Linux Replica route must expose functional audit metrics.");
  ensure(
    html.includes("data-audit-proof=\\\"state-flow\\\"") || html.includes("data-audit-proof=\"state-flow\""),
    "Linux Replica route must expose functional state-flow audit proof."
  );
  ensure(html.includes("functionalAppIds:()=>FUNCTIONAL_APP_IDS.slice()"), "Linux Replica diagnostics must expose the functional app id list.");
  ensure(html.includes("enhancedWorkbenchCount:()=>ENHANCED_WORKBENCH_IDS.length"), "Linux Replica diagnostics must expose the enhanced workbench count.");
  ensure(html.includes("aiChatAliasCount:()=>AI_CHAT_ALIAS_APP_IDS.length"), "Linux Replica diagnostics must expose the AI Chat alias count.");
  ensure(html.includes("apps:()=>commands.coreapps()"), "Linux Replica terminal must expose a functional apps command.");
  ensure(functionalManifest.length >= 50, `expected at least 50 functional app ids, found ${functionalManifest.length}.`);
  ensure(enhancedManifest.length >= 35, `expected at least 35 enhanced app slots including compatibility aliases, found ${enhancedManifest.length}.`);
  ensure(gameManifest.length >= 8, `expected at least 8 playable local games, found ${gameManifest.length}.`);
  ensure(new Set(functionalManifest).size === functionalManifest.length, "functional app manifest must not contain duplicate ids.");
  ensure(new Set(enhancedManifest).size === enhancedManifest.length, "enhanced functional app manifest must not contain duplicate ids.");
  ensure(new Set(gameManifest).size === gameManifest.length, "playable game manifest must not contain duplicate ids.");
  const aiChatAliasManifest = enhancedManifest.filter((id) => id === "chat");
  const enhancedWorkbenchManifest = enhancedManifest.filter((id) => id !== "chat");
  ensure(aiChatAliasManifest.length >= 1, "enhanced manifest must keep the legacy chat id as a SEIS AI Chat compatibility alias.");
  const missingFunctionalCatalogIds = functionalManifest.filter((id) => !baseAppIds.includes(id));
  const missingEnhancedFunctionalIds = enhancedManifest.filter((id) => !functionalManifest.includes(id));
  const missingGameFunctionalIds = gameManifest.filter((id) => !functionalManifest.includes(id));
  ensure(missingFunctionalCatalogIds.length === 0, `functional app ids missing from base catalog: ${missingFunctionalCatalogIds.join(", ")}`);
  ensure(missingEnhancedFunctionalIds.length === 0, `enhanced app ids missing from functional manifest: ${missingEnhancedFunctionalIds.join(", ")}`);
  ensure(missingGameFunctionalIds.length === 0, `game app ids missing from functional manifest: ${missingGameFunctionalIds.join(", ")}`);
  for (const marker of ["data-functional-app", "data-app-workbench", "data-functional-game", "data-functional-action", "data-game-action"]) {
    ensure(functionalApps.includes(marker), `functional app runtime missing marker: ${marker}`);
  }
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
  ensure(referenceCount >= 219, `expected at least 219 supplied ZIP app surfaces, found ${referenceCount}.`);
  ensure(referenceManifest.length >= 219, `expected at least 219 parsed reference manifest entries, found ${referenceManifest.length}.`);
  const referenceSourceCounts = referenceManifest.reduce((counts, entry) => {
    counts[entry.source] = (counts[entry.source] || 0) + 1;
    return counts;
  }, {});
  ensure(
    referenceSourceCounts.stitch_web_based_linux_desktop === 148,
    `expected 148 Ubuntu Web Desktop app surfaces, found ${referenceSourceCounts.stitch_web_based_linux_desktop || 0}.`
  );
  ensure(
    referenceSourceCounts.stitch_yapay_zeka_web_platformu === 71,
    `expected 71 Website / AI Platform app surfaces, found ${referenceSourceCounts.stitch_yapay_zeka_web_platformu || 0}.`
  );
  ensure(html.includes("Website / AI Platform"), "Linux Replica route must label the website ZIP as Website / AI Platform.");
  ensure(html.includes("Ubuntu Web Desktop"), "Linux Replica route must label the desktop ZIP as Ubuntu Web Desktop.");
  ensure(html.includes("SEIS App Library"), "SEIS App Library copy must be visible.");
  ensure(html.includes("Website Lane"), "SEIS App Library must expose Website Lane copy.");
  ensure(html.includes("Ubuntu Desktop"), "SEIS App Library must expose Ubuntu Desktop copy.");
  ensure(html.includes("readReferenceSourceIntent"), "SEIS App Library must read source-focused deep-link intent.");
  ensure(html.includes("referenceSourceIntent:()=>readReferenceSourceIntent()"), "Linux Replica diagnostics must expose reference source intent.");
  ensure(html.includes("referenceSourceFocusCopy"), "SEIS App Library must define focused lane copy.");
  ensure(html.includes("referenceDesignCards"), "SEIS App Library must render design board cards.");
  ensure(html.includes("referenceCategoryLabel"), "SEIS App Library must map internal reference categories to SEIS lane labels.");
  ensure(html.includes("App Lane Coverage"), "Live demo must use SEIS App Lane wording for visible coverage.");
  ensure(html.includes('const STARTUP_APP_FLOW=["live-demo","reference-vault","code-ai","ai-chat"]'), "Linux Replica startup must enter Website/Ubuntu context and focus SEIS AI Chat.");
  ensure(html.includes('const DEMO_TOUR_APP_FLOW=["live-demo","code-ai","agi-control","ssh-control","demo-readiness","reference-vault","apple-native-shell","terminal","search","code","paint","cloud","ai-chat"]'), "Linux Replica demo tour must finish on SEIS AI Chat after Website/Ubuntu and Apple Native surfaces.");
  ensure(html.includes("(restored.length?restored:startup).forEach(openApp)"), "Linux Replica must use the chat-centered startup flow when no session is restored.");
  ensure(html.includes('data-quick-app="ai-chat"><small>AI Chat</small><strong>Conversation Center</strong>'), "Linux Replica first activity card must open SEIS AI Chat.");
  ensure(html.includes('["Talk","SEIS AI Chat","ai-chat"]'), "Live Demo talk step must open SEIS AI Chat.");
  ensure(html.includes('data-local-app=\\"ai-chat\\" title=\\"SEIS AI Chat\\" aria-label=\\"SEIS AI Chat\\">"+appActionSymbolMarkup("ai-chat","MSG","data-live-action-symbol")'), "Live Demo MSG action must target SEIS AI Chat through icon-first markup.");
  ensure(!html.includes('data-local-app=\\"chat\\" title=\\"SEIS Conversation\\"'), "Live Demo must not route MSG to the legacy generic chat surface.");
  ensure(html.includes('["chat","SEIS Chat","MSG","system","Compatibility alias for the SEIS AI Chat Conversation Center.'), "Legacy chat app id must be a SEIS AI Chat alias.");
  ensure(!html.includes('["chat","SEIS Conversation","MSG","system","Start and continue a browser-local SEIS transcript. No provider call.","generic",true]'), "Legacy generic chat surface must not remain in the app catalog.");
  ensure(!html.includes('"apple-native-shell","chat","demo"'), "Pinned side rail must not expose a duplicate legacy chat button.");
  ensure(html.includes("startupAppFlow:()=>STARTUP_APP_FLOW.slice()"), "Linux Replica diagnostics must expose the startup app flow.");
  ensure(html.includes("demoTourAppFlow:()=>DEMO_TOUR_APP_FLOW.slice()"), "Linux Replica diagnostics must expose the demo tour app flow.");
  ensure(html.includes("\"apple-native-shell\",\"Apple Native Shell\",\"APL\",\"native\""), "Linux Replica must register Apple Native Shell as a contained native app.");
  ensure(html.includes("data-seis-apple-native-shell"), "Linux Replica must render the contained Apple Native Shell capsule.");
  ensure(html.includes('data-native-shell-contained=\\"linux-replica\\"'), "Apple Native Shell capsule must declare Linux Replica containment.");
  ensure(html.includes("data-native-capsule-stage"), "Apple Native Shell capsule must render an icon-first contained stage.");
  ensure(html.includes("data-native-capsule-dock"), "Apple Native Shell capsule must expose compact icon dock controls.");
  ensure(html.includes("data-native-dock-symbol"), "Apple Native Shell capsule dock must expose semantic icon symbols.");
  ensure(html.includes("data-native-dock-code"), "Apple Native Shell capsule dock must preserve compact accessible app codes.");
  ensure(html.includes(".native-capsule-dock .app-code-label{position:absolute"), "Apple Native Shell capsule dock code labels must be visually hidden.");
  ensure(html.includes("data-native-signal"), "Apple Native Shell capsule must render visual signal tiles.");
  ensure(html.includes("SeisAppleNativeShell is contained as a controlled native capsule"), "Apple Native Shell capsule must explain the containment boundary.");
  ensure(html.includes("No app bundle launch, host shell, provider key, SSH, or credential action runs here."), "Apple Native Shell capsule must preserve no-host-launch boundary copy.");
  ensure(html.includes('scope:"Apple",state:"Contained"'), "SEIS Search must expose Apple Native Shell as a contained Apple scope.");
  ensure(html.includes("apple:()=>{openApp(\"apple-native-shell\")"), "Linux Replica terminal must open the contained Apple Native Shell capsule with apple.");
  ensure(html.includes("Try <span class=\\\"info\\\">apple</span>"), "Linux Replica terminal help must surface the Apple Native Shell shortcut.");
  ensure(html.includes('data-app=\\"apple-native-shell\\" title=\\"Apple Native Shell\\" aria-label=\\"Apple Native Shell\\">"+appActionSymbolMarkup("apple-native-shell","APL","data-launchpad-action-symbol")'), "Linux Replica Launchpad must expose an icon-first Apple Native Shell shortcut.");
  ensure(html.includes("function appSystemCode"), "Linux Replica route must define SEIS OS app code labels.");
  ensure(html.includes("app-code-label"), "Linux Replica route must render compact app code labels in OS chrome.");
  ensure(html.includes("function appIconKind"), "Linux Replica route must define semantic app icon roles.");
  ensure(html.includes("function appSymbolMarkup"), "Linux Replica route must render reusable semantic app symbols.");
  ensure(html.includes("function actionSymbolMarkup"), "Linux Replica route must render reusable icon-first action symbols.");
  ensure(html.includes("function launchpadCardSymbolMarkup"), "Launchpad app cards must use the shared semantic app symbol helper.");
  ensure(html.includes("icon-action-strip"), "Linux Replica action strips must use icon-first control styling.");
  ensure(html.includes("data-app-symbol"), "Linux Replica OS chrome must expose icon-first app symbols.");
  ensure(html.includes("data-window-head-symbol"), "Linux Replica window chrome must expose semantic app symbols.");
  ensure(html.includes(".window-head .window-head-symbol"), "Linux Replica window chrome must style semantic header symbols.");
  ensure(html.includes("function categoryIconKind"), "Linux Replica launcher categories must map to semantic icon roles.");
  ensure(html.includes("data-category-symbol"), "Linux Replica launcher categories must expose semantic icon symbols.");
  ensure(html.includes("dataset.categoryFilter"), "Linux Replica launcher category controls must be measurable in browser smoke.");
  ensure(html.includes("data-start-action-symbol"), "Linux Replica launcher close/lock controls must expose semantic action symbols.");
  ensure(html.includes("data-start-route-symbol"), "Linux Replica launcher footer route chip must expose a semantic symbol.");
  ensure(html.includes("data-topbar-action-symbol"), "Linux Replica topbar quick actions must expose semantic icon symbols.");
  ensure(html.includes("data-arrange-windows"), "Linux Replica must expose a browser-local arrange windows control.");
  ensure(html.includes("data-window-arrange-symbol"), "Linux Replica arrange windows control must expose a semantic icon symbol.");
  ensure(html.includes("windowArrangementSnapshot"), "Linux Replica must expose window arrangement evidence.");
  ensure(html.includes('w.appId==="apple-native-shell"'), "Linux Replica arrange windows control must pin the contained Apple Native Shell capsule when it is open.");
  ensure(html.includes("data-about-action-symbol"), "About quick actions must expose semantic icon symbols.");
  ensure(html.includes("data-readiness-action-symbol"), "Demo Readiness quick actions must expose semantic icon symbols.");
  ensure(html.includes("data-live-action-symbol"), "Live Demo quick actions must expose semantic icon symbols.");
  ensure(html.includes("data-launchpad-action-strip"), "Launchpad quick actions must expose an icon-first action strip.");
  ensure(html.includes("data-launchpad-action-symbol"), "Launchpad quick actions must expose semantic icon symbols.");
  ensure(html.includes("data-launchpad-card-symbol"), "Launchpad app cards must expose semantic icon symbols.");
  ensure(html.includes("data-launchpad-core-card"), "Launchpad core app cards must be measurable in browser smoke.");
  ensure(html.includes("data-launchpad-reference-card"), "Launchpad Website / Ubuntu cards must be measurable in browser smoke.");
  ensure(html.includes("data-file-action-strip"), "Files toolbar must use an icon-first action strip.");
  ensure(html.includes("data-file-action-symbol"), "Files toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-editor-action-strip"), "Editor toolbar must use an icon-first action strip.");
  ensure(html.includes("data-editor-action-symbol"), "Editor toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-task-action-strip"), "App Switcher actions must use icon-first action strips.");
  ensure(html.includes("data-task-action-symbol"), "App Switcher actions must expose semantic icon symbols.");
  ensure(html.includes("data-log-action-strip"), "Logs toolbar must use an icon-first action strip.");
  ensure(html.includes("data-log-action-symbol"), "Logs toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-browser-action-strip"), "Browser fallback toolbar must use an icon-first action strip.");
  ensure(html.includes("data-browser-action-symbol"), "Browser fallback toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-game-action-strip"), "Game fallback toolbar must use an icon-first action strip.");
  ensure(html.includes("data-game-shell-action-symbol"), "Game fallback toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-generic-action-strip"), "Generic fallback toolbar must use an icon-first action strip.");
  ensure(html.includes("data-generic-action-symbol"), "Generic fallback toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-settings-action-strip"), "Settings toolbar must use an icon-first action strip.");
  ensure(html.includes("data-settings-action-symbol"), "Settings toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-todo-action-strip"), "To-Do toolbar must use an icon-first action strip.");
  ensure(html.includes("data-todo-action-symbol"), "To-Do toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-paint-action-strip"), "Paint fallback toolbar must use an icon-first action strip.");
  ensure(html.includes("data-paint-action-symbol"), "Paint fallback toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-media-action-strip"), "Media fallback toolbar must use an icon-first action strip.");
  ensure(html.includes("data-media-action-symbol"), "Media fallback toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-monitor-action-strip"), "System Monitor toolbar must use an icon-first action strip.");
  ensure(html.includes("data-monitor-action-symbol"), "System Monitor toolbar actions must expose semantic icon symbols.");
  ensure(html.includes("data-code-ai-action-strip"), "SEIS Code AI actions must use an icon-first action strip.");
  ensure(html.includes("data-code-ai-action-symbol"), "SEIS Code AI actions must expose semantic icon symbols.");
  ensure(html.includes("data-ssh-control-action-strip"), "SEIS SSH Control actions must use an icon-first action strip.");
  ensure(html.includes("data-ssh-control-action-symbol"), "SEIS SSH Control actions must expose semantic icon symbols.");
  ensure(html.includes("data-bridge-action-strip"), "SEIS bridge hero actions must use an icon-first action strip.");
  ensure(html.includes("data-bridge-action-symbol"), "SEIS bridge hero actions must expose semantic icon symbols.");
  ensure(html.includes("data-code-workspace-action-symbol"), "SEIS Code workspace actions must expose semantic icon symbols.");
  ensure(html.includes("data-design-action-symbol"), "SEIS Design workspace actions must expose semantic icon symbols.");
  ensure(html.includes("data-cloud-action-symbol"), "SEIS Cloud workspace actions must expose semantic icon symbols.");
  ensure(html.includes("data-store-action-symbol"), "SEIS Store install actions must expose semantic icon symbols.");
  ensure(html.includes("data-store-route-action-symbol"), "SEIS Store route action must expose a semantic icon symbol.");
  ensure(html.includes("data-music-action-symbol"), "SEIS Music actions must expose semantic icon symbols.");
  ensure(html.includes("data-music-state"), "SEIS Music must expose browser-local play state as a semantic marker.");
  ensure(html.includes("data-ai-core-action-symbol"), "SEIS AI Core route actions must expose semantic icon symbols.");
  ensure(html.includes("data-web-action-symbol"), "SEIS Website Hub actions must expose semantic icon symbols.");
  ensure(html.includes("data-bridge-workspace-action-symbol"), "SEIS bridge fallback workspace actions must expose semantic icon symbols.");
  ensure(html.includes(".icon-action-strip .app-code-label{position:absolute"), "Icon-first quick action text codes must be visually hidden.");
  ensure(!html.includes('<strong>"+escapeHtml(app.icon)+" "+escapeHtml(app.name)+"</strong>'), "Launchpad cards must not prefix visible names with raw text glyphs.");
  ensure(html.includes('host.dataset.iconFirstRail="true"'), "Linux Replica side rail must mark itself as an icon-first dock.");
  ensure(html.includes(".side-rail .app-code-label{position:absolute"), "Linux Replica side rail must visually hide text codes while preserving accessible labels.");
  ensure(html.includes("<strong>SEIS OS</strong>"), "Linux Replica side rail must use SEIS OS chrome wording.");
  ensure(html.includes('b.setAttribute("aria-label","Open "+app.name)'), "Linux Replica desktop icons must keep accessible app names while showing codes.");
  ensure(html.includes('b.setAttribute("aria-label","Focus "+app.name)'), "Linux Replica taskbar icons must keep accessible app names while showing codes.");
  ensure(html.includes('class=\\\"app-tile\\\" data-app=\\\""+escapeHtml(app.id)+"\\\" title=\\\""+escapeHtml(app.name)+"\\\" aria-label=\\\"Open "+escapeHtml(app.name)'), "Linux Replica launcher tiles must keep accessible names while showing codes.");
  ensure(html.includes('class=\\\"app-code-label\\\">"+escapeHtml(appSystemCode(app))'), "Linux Replica launcher tiles must show SEIS app codes.");
  ensure(!html.includes('<button type=\\"button\\" data-side-app=\\""+escapeHtml(app.id)+"\\" title=\\""+escapeHtml(app.name)+"\\" aria-label=\\"Open "+escapeHtml(app.name)+"\\"><span>"+escapeHtml(app.icon)+"</span>'), "Linux Replica side rail must not use text glyphs as the primary icon system.");
  ensure(!html.includes('b.innerHTML="<span>"+escapeHtml(app.icon)+"</span><span class=\\"app-code-label\\">'), "Linux Replica taskbar must not use raw text glyphs as its primary icon system.");
  ensure(!html.includes('class=\\\"window-mark\\\">"+escapeHtml(app.icon)+"</span>'), "Linux Replica window headers must not use raw text glyph marks.");
  ensure(!html.includes("b.textContent=renderCategoryLabel(cat)"), "Linux Replica launcher categories must not render visible text labels as primary controls.");
  ensure(!html.includes('b.innerHTML="<span>"+escapeHtml(app.icon)+"</span><span>"+escapeHtml(app.name)+"</span>"'), "Linux Replica taskbar must not show long app names in the OS chrome.");
  ensure(!html.includes('b.innerHTML="<strong>"+escapeHtml(app.icon)+"</strong><span>"+escapeHtml(app.name)+"</span>"'), "Linux Replica desktop icons must not show long app names in the OS chrome.");
  ensure(!html.includes('<strong>"+escapeHtml(app.icon)+"</strong><span>"+escapeHtml(app.name)+"</span></button>'), "Linux Replica launcher tiles must not show long app names in the OS chrome.");
  ensure(html.includes("lanes:()=>commands.sources()"), "Linux Replica terminal must expose lanes as the user-facing source coverage alias.");
  ensure(!html.includes("raw source folders"), "SEIS App Library visible copy must not expose raw source folder wording.");
  ensure(!html.includes("Source Lane Coverage"), "Live demo visible copy must not expose Source Lane Coverage.");
  ensure(!html.includes("design source"), "Reference detail visible copy must use SEIS design-signal wording.");
  ensure(!html.includes("Category:</strong> <span class=\\\"muted\\\">\"+escapeHtml(app.category)"), "Reference detail cards must not render internal category values.");
  ensure(!html.includes("<p class=\\\"muted\\\">\"+escapeHtml(app.category)+\"</p>"), "Installed-app cards must not render internal category values.");
  ensure(html.includes("data-reference-active-source"), "SEIS App Library must tag the active source lane.");
  ensure(html.includes("data-reference-lane-focus"), "SEIS App Library must render a focused lane strip.");
  ensure(html.includes("data-reference-design-board"), "SEIS App Library must render a visible Design Board.");
  ensure(html.includes("data-seis-system-actions"), "SEIS App Library must expose coded SEIS system actions for app tiles.");
  ensure(html.includes("data-reference-hero-action-symbol"), "SEIS App Library hero actions must expose semantic icon symbols.");
  ensure(html.includes("data-reference-action-symbol"), "SEIS App Library tile actions must expose semantic icon symbols.");
  ensure(html.includes("data-reference-index-symbol"), "SEIS App Library tile index chips must expose semantic icon symbols.");
  ensure(html.includes("data-reference-detail-action-symbol"), "SEIS App Library detail actions must expose semantic icon symbols.");
  ensure(html.includes(".reference-actions .app-code-label"), "SEIS App Library tile action codes must be visually hidden.");
  ensure(!html.includes(">APP</button><button class=\\\"secondary\\\" data-ref-route"), "SEIS App Library tiles must not show APP/TAB as visible action text.");
  ensure(!html.includes("<span class=\\\"reference-code\\\">SYS #"), "SEIS App Library tiles must not show SYS index codes as visible text.");
  ensure(!html.includes(">Open</button><button class=\\\"secondary\\\" data-ref-route"), "SEIS App Library tiles must not show generic Open/Tab action text.");
  ensure(html.includes('data-ref-focus=\\"website\\"'), "SEIS App Library must expose a Website lane focus control.");
  ensure(html.includes('data-ref-focus=\\"ubuntu\\"'), "SEIS App Library must expose an Ubuntu lane focus control.");
  if (referenceManifest.some((entry) => !entry.thumbnail)) {
    ensure(html.includes("referencePlaceholderMarkup"), "SEIS App Library must render fallback markup for modules without thumbnails.");
    ensure(html.includes(".reference-preview.is-placeholder"), "SEIS App Library must style tile fallbacks for modules without thumbnails.");
    ensure(html.includes(".reference-cover.is-placeholder"), "Reference detail view must style fallbacks for modules without thumbnails.");
  }
  ensure(html.includes("website:()=>commands.refs([\"website\"])"), "Linux Replica terminal must expose a website app shortcut.");
  ensure(html.includes("ubuntu:()=>commands.refs([\"ubuntu\"])"), "Linux Replica terminal must expose an Ubuntu app shortcut.");
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
  ensure(html.includes("data-reference-vault"), "Linux Replica route must render the supplied ZIP SEIS App Library.");
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
  ensure(html.includes("data-seis-ai-chat"), "Linux Replica route must expose a separate SEIS AI Chat workspace.");
  ensure(html.includes("data-seis-code-ai"), "Linux Replica route must expose a separate SEIS Code AI workspace.");
  ensure(html.includes("seis-ai-chat-transcript.v1"), "SEIS AI Chat must persist a browser-local transcript key.");
  ensure(html.includes('data-ai-chat-continuity=\\"localStorage\\"'), "SEIS AI Chat must label local transcript continuity.");
  ensure(html.includes("data-ai-conversation-core"), "SEIS AI Chat must render a conversation-first core surface.");
  ensure(html.includes("data-ai-conversation-dock"), "SEIS AI Chat must expose compact dock controls.");
  ensure(html.includes("data-ai-intent-chip"), "SEIS AI Chat must expose intent chips for first interaction.");
  ensure(html.includes("data-ai-intent-symbol"), "SEIS AI Chat intent chips must expose semantic icon symbols.");
  ensure(html.includes("data-ai-dock-symbol"), "SEIS AI Chat dock controls must expose semantic icon symbols.");
  ensure(html.includes(".ai-conversation-dock .app-code-label{position:absolute"), "SEIS AI Chat dock code labels must be visually hidden.");
  ensure(html.includes("data-ai-chat-open-code"), "SEIS AI Chat must link to the separate SEIS Code AI lane.");
  ensure(html.includes("Conversation Center"), "SEIS AI Chat must use conversation-center product language.");
  ensure(html.includes("seis-code-ai-plan.v1"), "SEIS Code AI must persist a separate browser-local plan key.");
  ensure(html.includes('data-code-ai-separate=\\"chat-isolated\\"'), "SEIS Code AI must stay isolated from the chat transcript.");
  ensure(html.includes("Keep coding memory separate from SEIS AI Chat"), "SEIS Code AI generated plan must preserve chat/code separation.");
  ensure(html.includes("data-seis-agi-control"), "Linux Replica route must expose a SEIS AGI Control workspace.");
  ensure(html.includes("data-seis-ssh-control"), "Linux Replica route must expose a SEIS SSH Control workspace.");
  ensure(html.includes("bridgeTargetCount"), "Linux Replica diagnostics must expose bridge target count.");
  for (const marker of ["SEIS Search Gateway", "SEIS Code IDE", "SEIS Design Studio", "SEIS Cloud Center", "SEIS Store", "SEIS Website Hub", "SEIS AI Core"]) {
    ensure(html.includes(marker), `Linux Replica SEIS bridge missing marker: ${marker}`);
  }
  ensure(html.includes("No SSH") || html.includes("SSH disabled"), "Linux Replica route must keep SSH disabled and labeled.");
  ensure(html.includes("no host OS commands") || html.includes("no host shell"), "Linux Replica route must keep host shell disabled and labeled.");
  ensure(html.includes("no provider keys") || html.includes("No provider keys"), "Linux Replica route must keep provider keys out of the route.");
  ensure(html.includes("sudo disabled"), "Linux Replica terminal must block sudo.");
  ensure(html.includes("ssh:()=>{openApp(\"ssh-control\")"), "Linux Replica terminal must open SSH Control instead of running host SSH.");
  ensure(html.includes("seis:()=>SEIS_BRIDGE_TARGETS"), "Linux Replica terminal must expose the SEIS bridge command.");
  ensure(html.includes("routes:()=>SEIS_BRIDGE_TARGETS"), "Linux Replica terminal must expose the route listing command.");
  ensure(html.includes("refs:(args)=>"), "Linux Replica terminal must expose the app library listing command.");
  ensure(html.includes("appopen:(args)=>"), "Linux Replica terminal must expose the app library opening command.");
  ensure(html.includes("sources:()=>referenceSourceRows"), "Linux Replica terminal must expose supplied ZIP source coverage.");
  ensure(html.includes("live:()=>"), "Linux Replica terminal must expose the live demo command.");
  ensure(html.includes("tour:()=>"), "Linux Replica terminal must expose the live demo tour command.");
  ensure(routes.includes("/seis-linux-replica.html"), "routes.json must register SEIS Linux Replica.");
  ensure(serviceWorker.includes("./seis-linux-replica.html"), "service worker must precache SEIS Linux Replica.");
  ensure(serviceWorker.includes("./seis-linux-functional-apps.js"), "service worker must precache the Linux Replica functional app runtime.");
  ensure(readme.includes("seis-linux-replica.html"), "README must document SEIS Linux Replica route.");
  ensure(readme.includes("Live Demo Console"), "README must document the SEIS Linux Replica Live Demo Console.");
  ensure(
    readme.includes("terminal `live` /")
      && readme.includes("`readiness` / `apps` / `refs` / `sources` commands"),
    "README must document the Linux Replica live/readiness/apps/refs/sources terminal commands."
  );

  return {
    ok: failures.length === 0,
    routePath,
    referenceModules: referenceManifest.length,
    referenceSources: referenceSourceCounts,
    functionalApps: functionalManifest.length,
    enhancedAppSlots: enhancedManifest.length,
    enhancedWorkbenches: enhancedWorkbenchManifest.length,
    aiChatAliases: aiChatAliasManifest.length,
    playableGames: gameManifest.length
  };
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
  await evaluate(client, "window.__SEIS_LINUX_REPLICA__.openApp('terminal')");
  await waitFor(client, "window.__SEIS_LINUX_REPLICA__?.terminalReady?.() === true", 5000);
  await waitFor(client, "Boolean(document.querySelector('[data-terminal] input'))", 5000);

  await sendTerminalCommand(client, "neofetch");
  await waitFor(client, "document.body.innerText.includes('Apps: ' + window.__SEIS_LINUX_REPLICA__.appCount) && document.body.innerText.includes('Library Apps: ' + window.__SEIS_LINUX_REPLICA__.referenceCount)", 5000);

  await sendTerminalCommand(client, "apps");
  await waitFor(client, "document.body.innerText.includes('calendar') && document.body.innerText.includes('Workbench') && document.body.innerText.includes('snake') && document.body.innerText.includes('Playable')", 5000);

  await sendTerminalCommand(client, "sources");
  await waitFor(client, "document.body.innerText.includes('Ubuntu Web Desktop') && document.body.innerText.includes('Website / AI Platform')", 5000);

  await sendTerminalCommand(client, "website");
  await waitFor(client, "document.body.innerText.includes('Website / AI Platform')", 5000);

  await sendTerminalCommand(client, "ubuntu");
  await waitFor(client, "document.body.innerText.includes('Ubuntu Web Desktop')", 5000);

  await sendTerminalCommand(client, "live");
  await waitFor(client, "document.querySelector('[data-live-demo-console]') && document.querySelector('[data-seis-agi-control]') && document.querySelector('[data-seis-ssh-control]') && document.body.innerText.includes('opened Live Demo Console')", 7000);

  await sendTerminalCommand(client, "seis");
  await waitFor(client, "document.body.innerText.includes('SEIS Code IDE') && document.body.innerText.includes('SEIS Cloud Center')", 5000);

  await evaluate(client, "document.querySelector('#startButton').click()");
  await waitFor(client, "document.querySelector('#startMenu')?.classList.contains('is-active')", 3000);
  const summary = await evaluate(client, `(() => {
    const horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 2;
    document.querySelector('[data-quick-app="ai-chat"]')?.click();
    document.querySelector('[data-quick-app="live-demo"]')?.click();
    document.querySelector('[data-quick-app="demo"]')?.click();
    document.querySelector('#sideRail [data-side-app="search"]')?.click();
    window.__SEIS_LINUX_REPLICA__.openApp('live-demo');
    window.__SEIS_LINUX_REPLICA__.openApp('demo-readiness');
    window.__SEIS_LINUX_REPLICA__.openApp('calculator');
    window.__SEIS_LINUX_REPLICA__.openApp('settings');
    window.__SEIS_LINUX_REPLICA__.openApp('about');
    window.__SEIS_LINUX_REPLICA__.openApp('launcher');
    window.__SEIS_LINUX_REPLICA__.openApp('reference-vault');
    window.__SEIS_LINUX_REPLICA__.openApp('apple-native-shell');
    window.__SEIS_LINUX_REPLICA__.openApp('search');
    window.__SEIS_LINUX_REPLICA__.openApp('code');
    window.__SEIS_LINUX_REPLICA__.openApp('paint');
    window.__SEIS_LINUX_REPLICA__.openApp('cloud');
    window.__SEIS_LINUX_REPLICA__.openApp('store');
    window.__SEIS_LINUX_REPLICA__.openApp('music');
    window.__SEIS_LINUX_REPLICA__.openApp('browser');
    window.__SEIS_LINUX_REPLICA__.openApp('todo');
    window.__SEIS_LINUX_REPLICA__.openApp('system-monitor');
    window.__SEIS_LINUX_REPLICA__.openApp('demo');
    window.__SEIS_LINUX_REPLICA__.openApp('ai-chat');
    window.__SEIS_LINUX_REPLICA__.openApp('chat');
    window.__SEIS_LINUX_REPLICA__.openApp('code-ai');
    window.__SEIS_LINUX_REPLICA__.openApp('ssh-control');
    window.__SEIS_LINUX_REPLICA__.openApp('files');
    window.__SEIS_LINUX_REPLICA__.openApp('text-editor');
    window.__SEIS_LINUX_REPLICA__.openApp('task-manager');
    window.__SEIS_LINUX_REPLICA__.openApp('logs');
    document.querySelector('[data-ai-intent-chip]')?.click();
    document.querySelector('[data-ai-chat-form]')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    document.querySelector('[data-ai-chat-open-code]')?.click();
    ['calendar', 'kanban', 'spreadsheet', 'json', 'regex', 'pixel', 'password', 'backup', 'snake', '2048'].forEach((id) => window.__SEIS_LINUX_REPLICA__.openApp(id));
    document.querySelector('[data-code-tab="agent-runtime.json"]')?.click();
    document.querySelector('[data-run-code-check]')?.click();
    document.querySelector('[data-design-swatch="#19c6d4"]')?.click();
    document.querySelector('[data-save-token]')?.click();
    document.querySelector('[data-cloud-refresh]')?.click();
    document.querySelector('[data-store-install]')?.click();
    document.querySelector('[data-music-play]')?.click();
    document.querySelector('[data-ai-agent="Security"]')?.click();
    document.querySelector('[data-ref-random]')?.click();
    document.querySelector('[data-functional-app="json"] [data-functional-action="primary"]')?.click();
    document.querySelector('[data-functional-app="regex"] [data-functional-action="primary"]')?.click();
    document.querySelector('[data-functional-app="calendar"] [data-functional-action="primary"]')?.click();
    document.querySelector('[data-functional-app="pixel"] [data-functional-action="primary"]')?.click();
    document.querySelector('[data-functional-app="password"] [data-functional-action="primary"]')?.click();
    document.querySelector('[data-functional-app="backup"] [data-functional-action="primary"]')?.click();
    document.querySelector('[data-functional-game="snake"] [data-game-action="right"]')?.click();
    document.querySelector('[data-functional-game="2048"] [data-game-action="left"]')?.click();
    const allFunctionalAppAudit = (() => {
      const ids = window.__SEIS_LINUX_REPLICA__.functionalAppIds?.() || [];
      const enhanced = new Set(window.SEIS_ENHANCED_APP_IDS || []);
      const games = new Set(window.SEIS_GAME_APP_IDS || []);
      const beforeOpenIds = new Set(Array.from(document.querySelectorAll('.window')).map((win) => win.dataset.appId));
      const modeCounts = { workbench: 0, game: 0, native: 0 };
      const passedByMode = { workbench: 0, game: 0, native: 0 };
      const interactionCounts = { workbench: 0, game: 0, native: 0 };
      const interactionPassedByMode = { workbench: 0, game: 0, native: 0 };
      const stateFlowCounts = { snapshot: 0, reset: 0, gameReset: 0 };
      const stateFlowPassed = { snapshot: 0, reset: 0, gameReset: 0 };
      const aliasCounts = { aiChat: 0 };
      const aliasPassed = { aiChat: 0 };
      const specificActions = {};
      const issues = [];
      const results = [];
      const findWindow = (id) => Array.from(document.querySelectorAll('.window')).reverse().find((win) => win.dataset.appId === id);

      ids.forEach((id) => {
        const wasOpen = beforeOpenIds.has(id);
        window.__SEIS_LINUX_REPLICA__.openApp(id);
        const win = findWindow(id);
        const body = win?.querySelector('.window-body');
        const text = (body?.innerText || '').trim();
        const isAiChatAlias = id === 'chat';
        const isWorkbench = enhanced.has(id) && !isAiChatAlias;
        const isGame = games.has(id);
        const mode = isWorkbench ? 'workbench' : isGame ? 'game' : 'native';
        const controlCount = body ? body.querySelectorAll('button,input,textarea,select,canvas').length : 0;
        const markerCount = body ? body.querySelectorAll('[data-functional-app],[data-functional-game],[data-terminal],[data-reference-vault],[data-live-demo-console],[data-demo-readiness],[data-seis-search-gateway],[data-seis-bridge-app],[data-mini-code-ide],[data-design-studio],[data-cloud-panel],[data-store-panel],[data-music-panel],[data-ai-core-panel],[data-system-monitor],[data-about-app],[data-logs-app],.file-shell,.calc-grid,.editor').length : 0;
        const expectedMode = isAiChatAlias
          ? Boolean(body?.querySelector('[data-seis-ai-chat]') && body.querySelector('[data-ai-conversation-core]') && text.includes('Conversation Center') && text.includes('No frontend keys'))
          : isWorkbench
          ? Boolean(body?.querySelector('[data-functional-app="' + id + '"][data-app-workbench]') && body.querySelectorAll('[data-functional-action]').length >= 3 && body.querySelector('[data-functional-preview]'))
          : isGame
            ? Boolean(body?.querySelector('[data-functional-game="' + id + '"]') && body.querySelector('[data-game-board]') && body.querySelectorAll('[data-game-action]').length >= 2)
            : Boolean(text.length >= 12 && (controlCount > 0 || markerCount > 0));
        const passed = Boolean(win && body && text.length >= 12 && expectedMode);
        let interactionPassed = passed;
        let interactionEvidence = 'surface-only';
        if (isAiChatAlias) {
          aliasCounts.aiChat += 1;
          if (passed) {
            aliasPassed.aiChat += 1;
            interactionCounts.native += 1;
            interactionEvidence = 'SEIS AI Chat compatibility alias';
          }
        } else if (passed && isWorkbench) {
          interactionCounts.workbench += 1;
          const primary = body.querySelector('[data-functional-action="primary"]');
          primary?.click();
          const primaryText = (body.querySelector('[data-functional-output]')?.innerText || '').trim();
          if (['json', 'regex', 'calendar', 'pixel', 'password', 'backup'].includes(id)) specificActions[id] = primaryText;
          const primaryPassed = Boolean(primary && primaryText.includes('action ran in Local Demo mode.') && body.querySelector('[data-functional-preview]'));
          const snapshot = body.querySelector('[data-functional-action="snapshot"]');
          stateFlowCounts.snapshot += 1;
          snapshot?.click();
          const snapshotText = (body.querySelector('[data-functional-output]')?.innerText || '').trim();
          const snapshotPassed = Boolean(snapshot && snapshotText.includes('Snapshot saved to VFS.'));
          if (snapshotPassed) stateFlowPassed.snapshot += 1;
          const reset = body.querySelector('[data-functional-action="reset"]');
          stateFlowCounts.reset += 1;
          reset?.click();
          const resetText = (body.querySelector('[data-functional-output]')?.innerText || '').trim();
          const resetPassed = Boolean(reset && resetText.includes('Local state reset.'));
          if (resetPassed) stateFlowPassed.reset += 1;
          interactionEvidence = [primaryText, snapshotText, resetText].join(' | ').slice(0, 180);
          interactionPassed = primaryPassed && snapshotPassed && resetPassed;
        } else if (passed && isGame) {
          interactionCounts.game += 1;
          const action = body.querySelector('[data-game-action]:not([data-game-action="reset"])');
          action?.click();
          const actionText = (body.querySelector('.workbench-output')?.innerText || '').trim();
          if (['snake', '2048'].includes(id)) specificActions[id] = actionText;
          const actionPassed = Boolean(action && actionText.includes('complete') && body.querySelector('[data-game-board]'));
          const reset = body.querySelector('[data-game-action="reset"]');
          stateFlowCounts.gameReset += 1;
          reset?.click();
          const resetText = (body.querySelector('.workbench-output')?.innerText || '').trim();
          const resetPassed = Boolean(reset && resetText.includes('Game reset.'));
          if (resetPassed) stateFlowPassed.gameReset += 1;
          interactionEvidence = [actionText, resetText].join(' | ').slice(0, 180);
          interactionPassed = actionPassed && resetPassed;
        } else if (passed) {
          interactionCounts.native += 1;
          interactionEvidence = controlCount > 0 ? 'native controls present' : 'native marker present';
        }
        modeCounts[mode] += 1;
        if (passed) passedByMode[mode] += 1;
        if (interactionPassed) interactionPassedByMode[mode] += 1;
        if (!passed || !interactionPassed) issues.push({ id, mode, passed, interactionPassed, textLength: text.length, controls: controlCount, markers: markerCount, interactionEvidence });
        results.push({ id, mode, passed, interactionPassed, controls: controlCount, markers: markerCount });
        if (!wasOpen) win?.querySelector('[data-win="close"]')?.click();
      });
      document.querySelector('#toasts')?.replaceChildren();

      return {
        total: ids.length,
        passed: results.filter((item) => item.passed).length,
        failed: issues.length,
        modeCounts,
        passedByMode,
        interactionCounts,
        interactionPassedByMode,
        stateFlowCounts,
        stateFlowPassed,
        aliasCounts,
        aliasPassed,
        specificActions,
        issues: issues.slice(0, 8)
      };
    })();
    document.querySelector('#sideRail [data-side-app="reference-vault"]')?.click();
    const launcherTiles = document.querySelectorAll('.app-tile').length;
    const openWindows = document.querySelectorAll('.window').length;
    const taskbarApps = document.querySelectorAll('.taskbar-app').length;
    const windowHeadSymbols = document.querySelectorAll('.window-head [data-window-head-symbol]').length;
    const windowHeadRawMarks = document.querySelectorAll('.window-head .window-mark').length;
    const topbarVisible = Boolean(document.querySelector('.topbar'));
    const quickAppButtons = document.querySelectorAll('[data-quick-app]').length;
    const topbarActionButtons = document.querySelectorAll('.topbar-actions button').length;
    const topbarActionSymbols = document.querySelectorAll('.topbar-actions [data-topbar-action-symbol], .topbar-actions [data-window-arrange-symbol]').length;
    const windowArrangeButtons = document.querySelectorAll('[data-arrange-windows]').length;
    const windowArrangeSymbols = document.querySelectorAll('[data-window-arrange-symbol]').length;
    const topbarActionVisibleCodeLabels = Array.from(document.querySelectorAll('.topbar-actions .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const activityCards = document.querySelectorAll('.activity-card[data-quick-app]').length;
    const aiChatActivityCards = document.querySelectorAll('.activity-card[data-quick-app="ai-chat"]').length;
    const liveDemoAiChatActions = document.querySelectorAll('[data-live-demo-console] [data-local-app="ai-chat"]').length;
    const liveDemoLegacyChatActions = document.querySelectorAll('[data-live-demo-console] [data-local-app="chat"]').length;
    const liveDemoAiChatSteps = document.querySelectorAll('[data-live-step="ai-chat"]').length;
    const sideRailLegacyChatButtons = document.querySelectorAll('#sideRail [data-side-app="chat"]').length;
    const legacyChatAliasPanels = document.querySelectorAll('.window[data-app-id="chat"] [data-seis-ai-chat]').length;
    const sideRailButtons = document.querySelectorAll('#sideRail [data-side-app]').length;
    const sideRailActive = Boolean(document.querySelector('#sideRail [data-side-app].is-active'));
    const iconFirstRail = document.querySelector('#sideRail')?.dataset.iconFirstRail === 'true';
    const sideRailSymbols = document.querySelectorAll('#sideRail [data-app-symbol]').length;
    const taskbarSymbols = document.querySelectorAll('.taskbar-app [data-app-symbol]').length;
    const launcherSymbols = document.querySelectorAll('.app-tile [data-app-symbol]').length;
    const categoryButtons = document.querySelectorAll('#categories [data-category-filter]').length;
    const categorySymbols = document.querySelectorAll('#categories [data-category-symbol]').length;
    const activeCategorySymbols = document.querySelectorAll('#categories [data-category-filter].is-active [data-category-symbol]').length;
    const categoryVisibleLabels = Array.from(document.querySelectorAll('#categories .cat-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const startActionButtons = document.querySelectorAll('#closeStart, #lockButton').length;
    const startActionSymbols = document.querySelectorAll('#startMenu [data-start-action-symbol]').length;
    const startRouteSymbols = document.querySelectorAll('#startMenu [data-start-route-symbol]').length;
    const startActionVisibleCodeLabels = Array.from(document.querySelectorAll('#startMenu .start-icon-button .app-code-label, #startMenu .route-chip .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const desktopSymbols = document.querySelectorAll('.desktop-icon [data-app-symbol]').length;
    const sideRailVisibleCodeLabels = Array.from(document.querySelectorAll('#sideRail .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const searchScopes = document.querySelectorAll('[data-seis-search-scope]').length;
    const connectedResults = document.querySelectorAll('[data-seis-connected-result]').length;
    const bridgeApps = document.querySelectorAll('[data-seis-bridge-app]').length;
    const codeWorkspace = document.querySelectorAll('[data-mini-code-ide]').length;
    const designStudio = document.querySelectorAll('[data-design-studio]').length;
    const cloudPanel = document.querySelectorAll('[data-cloud-panel]').length;
    const storePanel = document.querySelectorAll('[data-store-panel]').length;
    const musicPanel = document.querySelectorAll('[data-music-panel]').length;
    const aiCorePanel = document.querySelectorAll('[data-ai-core-panel]').length;
    const aiChatPanel = document.querySelectorAll('[data-seis-ai-chat]').length;
    const aiConversationCore = document.querySelectorAll('[data-ai-conversation-core]').length;
    const aiConversationDockButtons = document.querySelectorAll('[data-ai-conversation-dock] button').length;
    const aiIntentChips = document.querySelectorAll('[data-ai-intent-chip]').length;
    const aiIntentSymbols = document.querySelectorAll('[data-ai-intent-symbol]').length;
    const aiDockSymbols = document.querySelectorAll('[data-ai-dock-symbol]').length;
    const aiDockVisibleCodeLabels = Array.from(document.querySelectorAll('[data-ai-conversation-dock] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const codeAiPanel = document.querySelectorAll('[data-seis-code-ai]').length;
    const codeAiSeparate = document.querySelectorAll('[data-code-ai-separate="chat-isolated"]').length;
    const agiControlPanel = document.querySelectorAll('[data-seis-agi-control]').length;
    const sshControlPanel = document.querySelectorAll('[data-seis-ssh-control]').length;
    const appleNativePanel = document.querySelectorAll('[data-seis-apple-native-shell][data-native-shell-contained="linux-replica"]').length;
    const nativeCapsuleStage = document.querySelectorAll('[data-native-capsule-stage]').length;
    const nativeCapsuleDockButtons = document.querySelectorAll('[data-native-capsule-dock] button').length;
    const nativeDockSymbols = document.querySelectorAll('[data-native-dock-symbol]').length;
    const nativeDockVisibleCodeLabels = Array.from(document.querySelectorAll('[data-native-capsule-dock] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const nativeSignalTiles = document.querySelectorAll('[data-native-signal]').length;
    const functionalAppWorkbenches = document.querySelectorAll('[data-functional-app][data-app-workbench]').length;
    const functionalGameWorkbenches = document.querySelectorAll('[data-functional-game]').length;
    const functionalActions = document.querySelectorAll('[data-functional-action]').length;
    const gameActions = document.querySelectorAll('[data-game-action]').length;
    const functionalCoverageLedgers = document.querySelectorAll('[data-functional-coverage]').length;
    const functionalCoverageRows = document.querySelectorAll('[data-coverage-app]').length;
    const functionalAuditEvidence = document.querySelectorAll('[data-functional-audit-evidence]').length;
    const auditMetrics = document.querySelectorAll('[data-audit-metric]').length;
    const liveDemoConsole = document.querySelectorAll('[data-live-demo-console]').length;
    const liveStepButtons = document.querySelectorAll('[data-live-step]').length;
    const liveSourceRows = document.querySelectorAll('.source-row').length;
    const liveTourButtons = document.querySelectorAll('[data-run-live-tour]').length;
    const demoReadiness = document.querySelectorAll('[data-demo-readiness]').length;
    const readinessGates = document.querySelectorAll('[data-readiness-gate]').length;
    const readinessActions = document.querySelectorAll('[data-readiness-action]').length;
    const aboutActionButtons = document.querySelectorAll('[data-about-action-strip] button').length;
    const aboutActionSymbols = document.querySelectorAll('[data-about-action-symbol]').length;
    const aboutActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-about-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const launchpadActionButtons = document.querySelectorAll('[data-launchpad-action-strip] button').length;
    const launchpadActionSymbols = document.querySelectorAll('[data-launchpad-action-symbol]').length;
    const launchpadActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-launchpad-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const launchpadCoreCards = document.querySelectorAll('[data-launchpad-core-card]').length;
    const launchpadReferenceCards = document.querySelectorAll('[data-launchpad-reference-card]').length;
    const launchpadCardSymbols = document.querySelectorAll('[data-launchpad-card-symbol]').length;
    const fileActionButtons = document.querySelectorAll('[data-file-action-strip] button').length;
    const fileActionSymbols = document.querySelectorAll('[data-file-action-symbol]').length;
    const fileActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-file-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const editorActionButtons = document.querySelectorAll('[data-editor-action-strip] button').length;
    const editorActionSymbols = document.querySelectorAll('[data-editor-action-symbol]').length;
    const editorActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-editor-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const taskActionButtons = document.querySelectorAll('[data-task-action-strip] button').length;
    const taskActionSymbols = document.querySelectorAll('[data-task-action-symbol]').length;
    const taskActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-task-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const logActionButtons = document.querySelectorAll('[data-log-action-strip] button').length;
    const logActionSymbols = document.querySelectorAll('[data-log-action-symbol]').length;
    const logActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-log-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const settingsActionButtons = document.querySelectorAll('[data-settings-action-strip] button').length;
    const settingsActionSymbols = document.querySelectorAll('[data-settings-action-symbol]').length;
    const settingsActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-settings-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const todoActionButtons = document.querySelectorAll('[data-todo-action-strip] button').length;
    const todoActionSymbols = document.querySelectorAll('[data-todo-action-symbol]').length;
    const todoActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-todo-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const monitorActionButtons = document.querySelectorAll('[data-monitor-action-strip] button').length;
    const monitorActionSymbols = document.querySelectorAll('[data-monitor-action-symbol]').length;
    const monitorActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-monitor-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const codeAiActionButtons = document.querySelectorAll('[data-code-ai-action-strip] button').length;
    const codeAiActionSymbols = document.querySelectorAll('[data-code-ai-action-symbol]').length;
    const codeAiActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-code-ai-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const sshControlActionButtons = document.querySelectorAll('[data-ssh-control-action-strip] button').length;
    const sshControlActionSymbols = document.querySelectorAll('[data-ssh-control-action-symbol]').length;
    const sshControlActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-ssh-control-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const bridgeWorkspaceActionSelector = '[data-bridge-action-strip] button,[data-code-workspace-action-strip] button,[data-design-action-strip] button,[data-cloud-action-strip] button,[data-store-panel] [data-store-install],[data-store-route-action-strip] button,[data-music-action-strip] button,[data-ai-core-action-strip] button,[data-web-action-strip] button,[data-bridge-workspace-action-strip] button';
    const bridgeWorkspaceSymbolSelector = '[data-bridge-action-symbol],[data-code-workspace-action-symbol],[data-design-action-symbol],[data-cloud-action-symbol],[data-store-action-symbol],[data-store-route-action-symbol],[data-music-action-symbol],[data-ai-core-action-symbol],[data-web-action-symbol],[data-bridge-workspace-action-symbol]';
    const bridgeWorkspaceCodeLabelSelector = '[data-bridge-action-strip] .app-code-label,[data-code-workspace-action-strip] .app-code-label,[data-design-action-strip] .app-code-label,[data-cloud-action-strip] .app-code-label,[data-store-panel] .app-code-label,[data-music-action-strip] .app-code-label,[data-ai-core-action-strip] .app-code-label,[data-web-action-strip] .app-code-label,[data-bridge-workspace-action-strip] .app-code-label';
    const bridgeWorkspaceActionButtons = document.querySelectorAll(bridgeWorkspaceActionSelector).length;
    const bridgeWorkspaceActionSymbols = document.querySelectorAll(bridgeWorkspaceSymbolSelector).length;
    const bridgeWorkspaceActionVisibleCodeLabels = Array.from(document.querySelectorAll(bridgeWorkspaceCodeLabelSelector)).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const readinessActionSymbols = document.querySelectorAll('[data-readiness-action-symbol]').length;
    const readinessActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-readiness-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const liveActionButtons = document.querySelectorAll('[data-live-action-strip] button').length;
    const liveActionSymbols = document.querySelectorAll('[data-live-action-symbol]').length;
    const liveActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-live-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const referenceVault = document.querySelectorAll('[data-reference-vault]').length;
    const referenceTiles = document.querySelectorAll('.reference-tile').length;
    const referenceFrames = document.querySelectorAll('.reference-frame[data-ref-frame-surface]').length;
    const referenceHeroActions = document.querySelectorAll('[data-reference-hero-action-strip] button').length;
    const referenceHeroActionSymbols = document.querySelectorAll('[data-reference-hero-action-symbol]').length;
    const referenceHeroActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-reference-hero-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const referenceActionButtons = document.querySelectorAll('[data-seis-system-actions] button').length;
    const referenceActionSymbols = document.querySelectorAll('[data-seis-system-actions] [data-reference-action-symbol]').length;
    const referenceIndexSymbols = document.querySelectorAll('[data-seis-system-actions] [data-reference-index-symbol]').length;
    const referenceActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-seis-system-actions] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const referenceDetailActionSymbols = document.querySelectorAll('[data-reference-detail-action-symbol]').length;
    const referenceDetailActionVisibleCodeLabels = Array.from(document.querySelectorAll('[data-reference-detail-action-strip] .app-code-label')).filter((label) => {
      const rect = label.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).length;
    const referenceSources = window.__SEIS_LINUX_REPLICA__.referenceSources();
    const bodyText = document.body.innerText;
    const blockedCopy = bodyText.includes('No SSH') || bodyText.includes('SSH disabled') || bodyText.includes('no host shell');
    const auditStateFlowProof = Boolean(document.querySelector('[data-audit-proof="state-flow"]'))
      && bodyText.includes('Workbench snapshots')
      && bodyText.includes('Workbench resets')
      && bodyText.includes('Game resets')
      && bodyText.includes('Primary actions');
    const auditNoKeyProof = bodyText.includes('No keys')
      && bodyText.includes('No SSH')
      && bodyText.includes('scripts/check-seis-linux-replica-browser-smoke.mjs');
    const sessionSnapshot = window.__SEIS_LINUX_REPLICA__.session();
    return {
      appCount: window.__SEIS_LINUX_REPLICA__.appCount,
      referenceCount: window.__SEIS_LINUX_REPLICA__.referenceCount,
      referenceSources,
      bridgeTargetCount: window.__SEIS_LINUX_REPLICA__.bridgeTargetCount,
      functionalAppCount: window.__SEIS_LINUX_REPLICA__.functionalAppCount?.(),
      enhancedAppCount: window.__SEIS_LINUX_REPLICA__.enhancedAppCount?.(),
      enhancedWorkbenchCount: window.__SEIS_LINUX_REPLICA__.enhancedWorkbenchCount?.(),
      aiChatAliasCount: window.__SEIS_LINUX_REPLICA__.aiChatAliasCount?.(),
      terminalReady: window.__SEIS_LINUX_REPLICA__.terminalReady(),
      fileCount: window.__SEIS_LINUX_REPLICA__.fileCount(),
      launcherTiles,
      openWindows,
      taskbarApps,
      windowHeadSymbols,
      windowHeadRawMarks,
      topbarVisible,
      quickAppButtons,
      topbarActionButtons,
      topbarActionSymbols,
      windowArrangeButtons,
      windowArrangeSymbols,
      topbarActionVisibleCodeLabels,
      activityCards,
      aiChatActivityCards,
      liveDemoAiChatActions,
      liveDemoLegacyChatActions,
      liveDemoAiChatSteps,
      sideRailLegacyChatButtons,
      legacyChatAliasPanels,
      sideRailButtons,
      sideRailActive,
      iconFirstRail,
      sideRailSymbols,
      taskbarSymbols,
      launcherSymbols,
      categoryButtons,
      categorySymbols,
      activeCategorySymbols,
      categoryVisibleLabels,
      startActionButtons,
      startActionSymbols,
      startRouteSymbols,
      startActionVisibleCodeLabels,
      desktopSymbols,
      sideRailVisibleCodeLabels,
      searchScopes,
      connectedResults,
      bridgeApps,
      codeWorkspace,
      designStudio,
      cloudPanel,
      storePanel,
      musicPanel,
      aiCorePanel,
      aiChatPanel,
      aiConversationCore,
      aiConversationDockButtons,
      aiIntentChips,
      aiIntentSymbols,
      aiDockSymbols,
      aiDockVisibleCodeLabels,
      codeAiPanel,
      codeAiSeparate,
      agiControlPanel,
      sshControlPanel,
      appleNativePanel,
      nativeCapsuleStage,
      nativeCapsuleDockButtons,
      nativeDockSymbols,
      nativeDockVisibleCodeLabels,
      nativeSignalTiles,
      functionalAppWorkbenches,
      functionalGameWorkbenches,
      functionalActions,
      gameActions,
      functionalCoverageLedgers,
      functionalCoverageRows,
      functionalAuditEvidence,
      auditMetrics,
      auditStateFlowProof,
      auditNoKeyProof,
      liveDemoConsole,
      liveStepButtons,
      liveSourceRows,
      liveTourButtons,
      demoReadiness,
      readinessGates,
      readinessActions,
      aboutActionButtons,
      aboutActionSymbols,
      aboutActionVisibleCodeLabels,
      launchpadActionButtons,
      launchpadActionSymbols,
      launchpadActionVisibleCodeLabels,
      launchpadCoreCards,
      launchpadReferenceCards,
      launchpadCardSymbols,
      fileActionButtons,
      fileActionSymbols,
      fileActionVisibleCodeLabels,
      editorActionButtons,
      editorActionSymbols,
      editorActionVisibleCodeLabels,
      taskActionButtons,
      taskActionSymbols,
      taskActionVisibleCodeLabels,
      logActionButtons,
      logActionSymbols,
      logActionVisibleCodeLabels,
      settingsActionButtons,
      settingsActionSymbols,
      settingsActionVisibleCodeLabels,
      todoActionButtons,
      todoActionSymbols,
      todoActionVisibleCodeLabels,
      monitorActionButtons,
      monitorActionSymbols,
      monitorActionVisibleCodeLabels,
      codeAiActionButtons,
      codeAiActionSymbols,
      codeAiActionVisibleCodeLabels,
      sshControlActionButtons,
      sshControlActionSymbols,
      sshControlActionVisibleCodeLabels,
      bridgeWorkspaceActionButtons,
      bridgeWorkspaceActionSymbols,
      bridgeWorkspaceActionVisibleCodeLabels,
      readinessActionSymbols,
      readinessActionVisibleCodeLabels,
      liveActionButtons,
      liveActionSymbols,
      liveActionVisibleCodeLabels,
      referenceVault,
      referenceTiles,
      referenceFrames,
      referenceHeroActions,
      referenceHeroActionSymbols,
      referenceHeroActionVisibleCodeLabels,
      referenceActionButtons,
      referenceActionSymbols,
      referenceIndexSymbols,
      referenceActionVisibleCodeLabels,
      referenceDetailActionSymbols,
      referenceDetailActionVisibleCodeLabels,
      horizontalOverflow,
      blockedCopy,
      sessionStored: Boolean(localStorage.getItem('seis-linux-replica-session.v1')),
      sessionOpenApps: Array.isArray(sessionSnapshot.openApps) ? sessionSnapshot.openApps.length : 0,
      sessionFocusedApp: sessionSnapshot.focusedApp || null,
      neofetchVisible: bodyText.includes('Apps: ' + window.__SEIS_LINUX_REPLICA__.appCount) && bodyText.includes('Library Apps: ' + window.__SEIS_LINUX_REPLICA__.referenceCount),
      terminalAppsVisible: bodyText.includes('calendar') && bodyText.includes('Workbench') && bodyText.includes('snake') && bodyText.includes('Playable'),
      sourcesVisible: bodyText.includes('Ubuntu Web Desktop') && bodyText.includes('Website / AI Platform'),
      referenceLaneCopyVisible: bodyText.includes('Website Lane') && bodyText.includes('Ubuntu Desktop'),
      liveCommandVisible: bodyText.includes('opened Live Demo Console'),
      aiChatLocalContinuationVisible: bodyText.includes('Local continuation saved.'),
      liveConsoleVisible: bodyText.includes('SEIS Live Linux-like Demo'),
      codeCheckVisible: bodyText.includes('PASS local UI contract'),
      designSnapshotVisible: bodyText.includes('Snapshot saved to VFS') || bodyText.includes('design-token-') || window.__SEIS_LINUX_REPLICA__.fileCount() >= 16,
      cloudRefreshVisible: bodyText.includes('Mock health refreshed'),
      storeInstallVisible: Array.from(document.querySelectorAll('[data-store-install]')).some((button) => {
        const id = button.getAttribute('data-store-install') || '';
        return button.title.includes('Enabled') || button.getAttribute('aria-label')?.includes('Enabled') || localStorage.getItem('seis-store-' + id) === 'installed';
      }),
      musicPlayingVisible: document.querySelector('[data-music-panel]')?.getAttribute('data-music-state') === 'playing' || bodyText.includes('Playing local track'),
      aiAgentVisible: bodyText.includes('Security Agent is active in Local Demo mode.'),
      functionalJsonVisible: bodyText.includes('JSON is valid and formatted.') || allFunctionalAppAudit.specificActions.json?.includes('JSON is valid and formatted.'),
      functionalRegexVisible: bodyText.includes('match(es) found.') || allFunctionalAppAudit.specificActions.regex?.includes('match(es) found.'),
      functionalCalendarVisible: bodyText.includes('Added Design review to the agenda.') || allFunctionalAppAudit.specificActions.calendar?.includes('Added Design review to the agenda.'),
      functionalPixelVisible: bodyText.includes('Painted pixel') || allFunctionalAppAudit.specificActions.pixel?.includes('Painted pixel'),
      functionalPasswordVisible: bodyText.includes('Placeholder password generated') || allFunctionalAppAudit.specificActions.password?.includes('Placeholder password generated'),
      functionalBackupVisible: bodyText.includes('Backup manifest created locally') || bodyText.includes('backup-manifest.json') || allFunctionalAppAudit.specificActions.backup?.includes('Backup manifest created locally'),
      functionalGameVisible: (bodyText.includes('snake action') && bodyText.includes('2048 action') && bodyText.includes('complete')) || (allFunctionalAppAudit.specificActions.snake?.includes('complete') && allFunctionalAppAudit.specificActions['2048']?.includes('complete')),
      allFunctionalAppAudit,
      searchGatewayVisible: bodyText.includes('SEIS Search Gateway'),
      codeVisible: bodyText.includes('SEIS Code IDE'),
      designVisible: bodyText.includes('SEIS Design Studio'),
      cloudVisible: bodyText.includes('SEIS Cloud Center'),
      websiteVisible: bodyText.includes('SEIS Website Hub')
    };
  })()`);
  summary.windowArrangement = await evaluate(client, `(() => window.__SEIS_LINUX_REPLICA__.arrangeWindows?.() || null)()`);
  summary.appleNativeArrangement = await evaluate(client, `(() => {
    const win = Array.from(document.querySelectorAll('.window')).find((node) => node.dataset.appId === 'apple-native-shell');
    if (!win) return null;
    const rect = win.getBoundingClientRect();
    return {
      arranged: win.dataset.windowArranged,
      minimized: win.classList.contains('is-min'),
      visible: rect.width > 0 && rect.height > 0,
      containedPanel: win.querySelectorAll('[data-seis-apple-native-shell][data-native-shell-contained="linux-replica"]').length
    };
  })()`);

  ensure(summary.appCount >= 284, `expected runtime appCount to include core apps plus supplied references, found ${summary.appCount}`);
  ensure(summary.referenceCount >= 219, `expected at least 219 runtime ZIP app surfaces, found ${summary.referenceCount}`);
  ensure(Array.isArray(summary.referenceSources) && summary.referenceSources.length >= 2, "expected at least two reference source groups.");
  ensure(summary.bridgeTargetCount >= 8, `expected at least eight connected SEIS bridge targets, found ${summary.bridgeTargetCount}`);
  ensure(summary.functionalAppCount >= 50, `expected at least fifty functional local app ids, found ${summary.functionalAppCount}`);
  ensure(summary.enhancedAppCount >= 35, `expected at least thirty-five enhanced app slots including aliases, found ${summary.enhancedAppCount}`);
  ensure(summary.enhancedWorkbenchCount >= 34, `expected at least thirty-four enhanced workbenches, found ${summary.enhancedWorkbenchCount}`);
  ensure(summary.aiChatAliasCount >= 1, `expected at least one SEIS AI Chat compatibility alias, found ${summary.aiChatAliasCount}`);
  ensure(summary.terminalReady === true, "terminal did not initialize.");
  ensure(summary.launcherTiles >= summary.appCount, `expected launcher tiles to include all runtime apps, found ${summary.launcherTiles} for ${summary.appCount} apps.`);
  ensure(summary.openWindows >= 9, `expected at least nine open windows after smoke, found ${summary.openWindows}`);
  ensure(summary.taskbarApps >= 9, `expected at least nine taskbar app buttons, found ${summary.taskbarApps}`);
  ensure(summary.windowHeadSymbols >= summary.openWindows, `expected semantic window header symbols for every open window, found ${summary.windowHeadSymbols} for ${summary.openWindows}.`);
  ensure(summary.windowHeadRawMarks === 0, `window headers still expose ${summary.windowHeadRawMarks} raw text glyph mark(s).`);
  ensure(summary.topbarVisible === true, "SEIS system topbar did not render.");
  ensure(summary.quickAppButtons >= 7, `expected quick app controls, found ${summary.quickAppButtons}`);
  ensure(summary.topbarActionButtons >= 4, `expected topbar icon actions including arrange, found ${summary.topbarActionButtons}.`);
  ensure(summary.topbarActionSymbols >= summary.topbarActionButtons, `expected topbar semantic action symbols for every control, found ${summary.topbarActionSymbols} for ${summary.topbarActionButtons}.`);
  ensure(summary.windowArrangeButtons >= 1, "topbar arrange windows control did not render.");
  ensure(summary.windowArrangeSymbols >= summary.windowArrangeButtons, `expected arrange windows semantic symbol, found ${summary.windowArrangeSymbols}.`);
  ensure(summary.topbarActionVisibleCodeLabels === 0, `topbar actions still expose ${summary.topbarActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.windowArrangement?.visibleWindows <= 6, `arrange windows should stage at most six visible windows, found ${summary.windowArrangement?.visibleWindows}.`);
  ensure(summary.windowArrangement?.arrangedWindows >= Math.min(6, summary.openWindows), `arrange windows did not mark the staged windows, found ${summary.windowArrangement?.arrangedWindows}.`);
  ensure(summary.windowArrangement?.minimizedWindows >= Math.max(0, summary.openWindows - 6), `arrange windows did not minimize overflow windows, found ${summary.windowArrangement?.minimizedWindows}.`);
  ensure(summary.windowArrangement?.horizontalOverflow === false, "arranged windows overflow horizontally.");
  ensure(summary.windowArrangement?.verticalOverflow === false, "arranged windows overflow vertically.");
  ensure(summary.appleNativeArrangement?.arranged === "true", "arrange windows did not keep Apple Native Shell in the staged Linux capsule set.");
  ensure(summary.appleNativeArrangement?.minimized === false, "arrange windows minimized the contained Apple Native Shell capsule.");
  ensure(summary.appleNativeArrangement?.visible === true, "contained Apple Native Shell capsule is not visible after arrange windows.");
  ensure(summary.appleNativeArrangement?.containedPanel >= 1, "Apple Native Shell staged window lost its contained Linux Replica capsule panel.");
  ensure(summary.activityCards === 5, `expected five SEIS activity cards, found ${summary.activityCards}`);
  ensure(summary.aiChatActivityCards >= 1, "desktop first-interaction activity strip did not expose SEIS AI Chat.");
  ensure(summary.liveDemoAiChatActions >= 1, "Live Demo MSG action did not target SEIS AI Chat.");
  ensure(summary.liveDemoLegacyChatActions === 0, "Live Demo still exposes the legacy generic chat action.");
  ensure(summary.liveDemoAiChatSteps >= 1, "Live Demo flow did not include a SEIS AI Chat step.");
  ensure(summary.sideRailLegacyChatButtons === 0, "pinned side rail still exposes duplicate legacy chat.");
  ensure(summary.legacyChatAliasPanels >= 1, "legacy chat app id did not render the SEIS AI Chat panel.");
  ensure(summary.sideRailButtons >= 8, `expected pinned side rail app buttons, found ${summary.sideRailButtons}`);
  ensure(summary.sideRailActive === true, "pinned side rail did not track the focused app.");
  ensure(summary.iconFirstRail === true, "pinned side rail did not expose the icon-first dock contract.");
  ensure(summary.sideRailSymbols >= summary.sideRailButtons, `expected side rail icons for every pinned app, found ${summary.sideRailSymbols} for ${summary.sideRailButtons}.`);
  ensure(summary.sideRailVisibleCodeLabels === 0, `side rail still exposes ${summary.sideRailVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.taskbarSymbols >= summary.taskbarApps, `expected taskbar icons for every open app, found ${summary.taskbarSymbols} for ${summary.taskbarApps}.`);
  ensure(summary.launcherSymbols >= summary.launcherTiles, `expected launcher icons for every app tile, found ${summary.launcherSymbols} for ${summary.launcherTiles}.`);
  ensure(summary.categoryButtons >= 10, `expected icon-first launcher category controls, found ${summary.categoryButtons}.`);
  ensure(summary.categorySymbols >= summary.categoryButtons, `expected launcher category symbols for every category control, found ${summary.categorySymbols} for ${summary.categoryButtons}.`);
  ensure(summary.activeCategorySymbols >= 1, "active launcher category did not retain its semantic symbol.");
  ensure(summary.categoryVisibleLabels === 0, `launcher category filters still expose ${summary.categoryVisibleLabels} visible text label(s).`);
  ensure(summary.startActionButtons >= 2, `expected launcher close and lock icon controls, found ${summary.startActionButtons}.`);
  ensure(summary.startActionSymbols >= summary.startActionButtons, `expected launcher chrome symbols for every control, found ${summary.startActionSymbols} for ${summary.startActionButtons}.`);
  ensure(summary.startRouteSymbols >= 1, "launcher footer route chip did not expose a semantic symbol.");
  ensure(summary.startActionVisibleCodeLabels === 0, `launcher close/lock/footer controls still expose ${summary.startActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.desktopSymbols >= 8, `expected icon-first desktop shortcuts, found ${summary.desktopSymbols}.`);
  ensure(summary.searchScopes >= 10, `expected at least ten SEIS Search scopes including Library, found ${summary.searchScopes}`);
  ensure(summary.connectedResults >= 8, `expected connected SEIS Search result cards, found ${summary.connectedResults}`);
  ensure(summary.bridgeApps >= 6, `expected at least six SEIS bridge app windows, found ${summary.bridgeApps}`);
  ensure(summary.codeWorkspace >= 1, "mini SEIS Code workspace did not render.");
  ensure(summary.designStudio >= 1, "mini SEIS Design Studio workspace did not render.");
  ensure(summary.cloudPanel >= 1, "mini SEIS Cloud workspace did not render.");
  ensure(summary.storePanel >= 1, "mini SEIS Store workspace did not render.");
  ensure(summary.musicPanel >= 1, "mini SEIS Music workspace did not render.");
  ensure(summary.aiCorePanel >= 1, "mini SEIS AI Core workspace did not render.");
  ensure(summary.aiChatPanel >= 1, "SEIS AI Chat workspace did not render.");
  ensure(summary.aiConversationCore >= 1, "SEIS AI Chat conversation-first core did not render.");
  ensure(summary.aiConversationDockButtons >= 4, `expected SEIS AI Chat dock controls, found ${summary.aiConversationDockButtons}.`);
  ensure(summary.aiIntentChips >= 4, `expected SEIS AI Chat first-interaction intent chips, found ${summary.aiIntentChips}.`);
  ensure(summary.aiIntentSymbols >= summary.aiIntentChips, `expected SEIS AI Chat intent symbols for every chip, found ${summary.aiIntentSymbols} for ${summary.aiIntentChips}.`);
  ensure(summary.aiDockSymbols >= summary.aiConversationDockButtons, `expected SEIS AI Chat dock symbols for every dock control, found ${summary.aiDockSymbols} for ${summary.aiConversationDockButtons}.`);
  ensure(summary.aiDockVisibleCodeLabels === 0, `SEIS AI Chat dock still exposes ${summary.aiDockVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.aiChatLocalContinuationVisible === true, "SEIS AI Chat did not save a local continuation during smoke.");
  ensure(summary.codeAiPanel >= 1, "SEIS Code AI workspace did not render.");
  ensure(summary.codeAiSeparate >= 1, "SEIS Code AI did not preserve chat-isolated separation.");
  ensure(summary.agiControlPanel >= 1, "SEIS AGI Control workspace did not render.");
  ensure(summary.sshControlPanel >= 1, "SEIS SSH Control workspace did not render.");
  ensure(summary.appleNativePanel >= 1, "Apple Native Shell contained panel did not render.");
  ensure(summary.nativeCapsuleStage >= 1, "Apple Native Shell icon-first capsule stage did not render.");
  ensure(summary.nativeCapsuleDockButtons >= 5, `expected Apple Native Shell compact dock controls, found ${summary.nativeCapsuleDockButtons}.`);
  ensure(summary.nativeDockSymbols >= summary.nativeCapsuleDockButtons, `expected Apple Native Shell dock symbols for every dock control, found ${summary.nativeDockSymbols} for ${summary.nativeCapsuleDockButtons}.`);
  ensure(summary.nativeDockVisibleCodeLabels === 0, `Apple Native Shell dock still exposes ${summary.nativeDockVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.nativeSignalTiles >= 4, `expected Apple Native Shell visual signal tiles, found ${summary.nativeSignalTiles}.`);
  ensure(summary.functionalAppWorkbenches >= 8, `expected enhanced functional app workbenches, found ${summary.functionalAppWorkbenches}.`);
  ensure(summary.functionalGameWorkbenches >= 2, `expected playable functional game workbenches, found ${summary.functionalGameWorkbenches}.`);
  ensure(summary.functionalActions >= 20, `expected functional app action controls, found ${summary.functionalActions}.`);
  ensure(summary.gameActions >= 8, `expected playable game action controls, found ${summary.gameActions}.`);
  ensure(summary.functionalCoverageLedgers >= 2, `expected Live Demo and Demo Readiness functional coverage ledgers, found ${summary.functionalCoverageLedgers}.`);
  ensure(summary.functionalCoverageRows >= summary.functionalAppCount, `expected coverage rows to cover all functional apps, found ${summary.functionalCoverageRows} for ${summary.functionalAppCount}.`);
  ensure(summary.functionalAuditEvidence >= 2, `expected visible functional audit evidence in Live Demo and Demo Readiness, found ${summary.functionalAuditEvidence}.`);
  ensure(summary.auditMetrics >= 16, `expected repeated functional audit metrics, found ${summary.auditMetrics}.`);
  ensure(summary.auditStateFlowProof === true, "visible functional audit did not expose state-flow evidence.");
  ensure(summary.auditNoKeyProof === true, "visible functional audit did not expose no-key/no-SSH browser smoke evidence.");
  ensure(summary.liveDemoConsole >= 1, "Live Demo Console did not render.");
  ensure(summary.demoReadiness >= 1, "Demo Readiness did not render.");
  ensure(summary.readinessGates >= 6, `expected at least six Demo Readiness gates, found ${summary.readinessGates}.`);
  ensure(summary.readinessActions >= 3, `expected at least three Demo Readiness actions, found ${summary.readinessActions}.`);
  ensure(summary.aboutActionButtons >= 3, `expected at least three About quick actions, found ${summary.aboutActionButtons}.`);
  ensure(summary.aboutActionSymbols >= summary.aboutActionButtons, `expected About quick action symbols for every control, found ${summary.aboutActionSymbols} for ${summary.aboutActionButtons}.`);
  ensure(summary.aboutActionVisibleCodeLabels === 0, `About quick actions still expose ${summary.aboutActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.launchpadActionButtons >= 6, `expected at least six Launchpad quick actions, found ${summary.launchpadActionButtons}.`);
  ensure(summary.launchpadActionSymbols >= summary.launchpadActionButtons, `expected Launchpad action symbols for every control, found ${summary.launchpadActionSymbols} for ${summary.launchpadActionButtons}.`);
  ensure(summary.launchpadActionVisibleCodeLabels === 0, `Launchpad quick actions still expose ${summary.launchpadActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.launchpadCoreCards >= 60, `expected Launchpad core app cards, found ${summary.launchpadCoreCards}.`);
  ensure(summary.launchpadReferenceCards >= 24, `expected Launchpad Website / Ubuntu sample cards, found ${summary.launchpadReferenceCards}.`);
  ensure(summary.launchpadCardSymbols >= summary.launchpadCoreCards + summary.launchpadReferenceCards, `expected semantic Launchpad card symbols for every card, found ${summary.launchpadCardSymbols} for ${summary.launchpadCoreCards + summary.launchpadReferenceCards}.`);
  ensure(summary.fileActionButtons >= 3, `expected Files icon actions, found ${summary.fileActionButtons}.`);
  ensure(summary.fileActionSymbols >= summary.fileActionButtons, `expected Files action symbols for every control, found ${summary.fileActionSymbols} for ${summary.fileActionButtons}.`);
  ensure(summary.fileActionVisibleCodeLabels === 0, `Files actions still expose ${summary.fileActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.editorActionButtons >= 2, `expected Editor icon actions, found ${summary.editorActionButtons}.`);
  ensure(summary.editorActionSymbols >= summary.editorActionButtons, `expected Editor action symbols for every control, found ${summary.editorActionSymbols} for ${summary.editorActionButtons}.`);
  ensure(summary.editorActionVisibleCodeLabels === 0, `Editor actions still expose ${summary.editorActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.taskActionButtons >= 2, `expected App Switcher icon actions, found ${summary.taskActionButtons}.`);
  ensure(summary.taskActionSymbols >= summary.taskActionButtons, `expected App Switcher action symbols for every control, found ${summary.taskActionSymbols} for ${summary.taskActionButtons}.`);
  ensure(summary.taskActionVisibleCodeLabels === 0, `App Switcher actions still expose ${summary.taskActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.logActionButtons >= 2, `expected Logs icon actions, found ${summary.logActionButtons}.`);
  ensure(summary.logActionSymbols >= summary.logActionButtons, `expected Logs action symbols for every control, found ${summary.logActionSymbols} for ${summary.logActionButtons}.`);
  ensure(summary.logActionVisibleCodeLabels === 0, `Logs actions still expose ${summary.logActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.settingsActionButtons >= 2, `expected Settings icon actions, found ${summary.settingsActionButtons}.`);
  ensure(summary.settingsActionSymbols >= summary.settingsActionButtons, `expected Settings action symbols for every control, found ${summary.settingsActionSymbols} for ${summary.settingsActionButtons}.`);
  ensure(summary.settingsActionVisibleCodeLabels === 0, `Settings actions still expose ${summary.settingsActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.todoActionButtons >= 1, `expected To-Do icon actions, found ${summary.todoActionButtons}.`);
  ensure(summary.todoActionSymbols >= summary.todoActionButtons, `expected To-Do action symbols for every control, found ${summary.todoActionSymbols} for ${summary.todoActionButtons}.`);
  ensure(summary.todoActionVisibleCodeLabels === 0, `To-Do actions still expose ${summary.todoActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.monitorActionButtons >= 2, `expected System Monitor icon actions, found ${summary.monitorActionButtons}.`);
  ensure(summary.monitorActionSymbols >= summary.monitorActionButtons, `expected System Monitor action symbols for every control, found ${summary.monitorActionSymbols} for ${summary.monitorActionButtons}.`);
  ensure(summary.monitorActionVisibleCodeLabels === 0, `System Monitor actions still expose ${summary.monitorActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.codeAiActionButtons >= 3, `expected SEIS Code AI icon actions, found ${summary.codeAiActionButtons}.`);
  ensure(summary.codeAiActionSymbols >= summary.codeAiActionButtons, `expected SEIS Code AI action symbols for every control, found ${summary.codeAiActionSymbols} for ${summary.codeAiActionButtons}.`);
  ensure(summary.codeAiActionVisibleCodeLabels === 0, `SEIS Code AI actions still expose ${summary.codeAiActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.sshControlActionButtons >= 2, `expected SEIS SSH Control icon actions, found ${summary.sshControlActionButtons}.`);
  ensure(summary.sshControlActionSymbols >= summary.sshControlActionButtons, `expected SEIS SSH Control action symbols for every control, found ${summary.sshControlActionSymbols} for ${summary.sshControlActionButtons}.`);
  ensure(summary.sshControlActionVisibleCodeLabels === 0, `SEIS SSH Control actions still expose ${summary.sshControlActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.bridgeWorkspaceActionButtons >= 18, `expected SEIS bridge workspace icon actions, found ${summary.bridgeWorkspaceActionButtons}.`);
  ensure(summary.bridgeWorkspaceActionSymbols >= summary.bridgeWorkspaceActionButtons, `expected SEIS bridge workspace symbols for every control, found ${summary.bridgeWorkspaceActionSymbols} for ${summary.bridgeWorkspaceActionButtons}.`);
  ensure(summary.bridgeWorkspaceActionVisibleCodeLabels === 0, `SEIS bridge workspace actions still expose ${summary.bridgeWorkspaceActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.readinessActionSymbols >= summary.readinessActions, `expected Demo Readiness action symbols for every control, found ${summary.readinessActionSymbols} for ${summary.readinessActions}.`);
  ensure(summary.readinessActionVisibleCodeLabels === 0, `Demo Readiness quick actions still expose ${summary.readinessActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.liveActionSymbols >= summary.liveActionButtons, `expected Live Demo action symbols for every control, found ${summary.liveActionSymbols} for ${summary.liveActionButtons}.`);
  ensure(summary.liveActionVisibleCodeLabels === 0, `Live Demo quick actions still expose ${summary.liveActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.liveStepButtons >= 8, `expected at least eight Live Demo flow steps, found ${summary.liveStepButtons}.`);
  ensure(summary.liveSourceRows >= 2, `expected Live Demo source coverage rows, found ${summary.liveSourceRows}.`);
  ensure(summary.liveTourButtons >= 1, "Live Demo Console did not expose a live tour action.");
  ensure(summary.referenceVault >= 1, "SEIS App Library did not render.");
  ensure(summary.referenceTiles >= 24, `expected visible supplied reference tiles, found ${summary.referenceTiles}.`);
  ensure(summary.referenceFrames >= 1, "opening a reference module did not render an iframe.");
  ensure(summary.referenceHeroActionSymbols >= summary.referenceHeroActions, `expected SEIS App Library hero symbols for every action, found ${summary.referenceHeroActionSymbols} for ${summary.referenceHeroActions}.`);
  ensure(summary.referenceHeroActionVisibleCodeLabels === 0, `SEIS App Library hero actions still expose ${summary.referenceHeroActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.referenceActionButtons >= summary.referenceTiles * 2, `expected two SEIS App Library tile actions per visible tile, found ${summary.referenceActionButtons} for ${summary.referenceTiles} tile(s).`);
  ensure(summary.referenceActionSymbols >= summary.referenceActionButtons, `expected SEIS App Library tile action symbols for every action, found ${summary.referenceActionSymbols} for ${summary.referenceActionButtons}.`);
  ensure(summary.referenceIndexSymbols >= summary.referenceTiles, `expected SEIS App Library index symbols for every visible tile, found ${summary.referenceIndexSymbols} for ${summary.referenceTiles}.`);
  ensure(summary.referenceActionVisibleCodeLabels === 0, `SEIS App Library tile actions still expose ${summary.referenceActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.referenceDetailActionSymbols >= 1, "SEIS App Library detail actions did not expose semantic symbols.");
  ensure(summary.referenceDetailActionVisibleCodeLabels === 0, `SEIS App Library detail actions still expose ${summary.referenceDetailActionVisibleCodeLabels} visible text code label(s).`);
  ensure(summary.referenceLaneCopyVisible === true, "SEIS App Library did not expose Website Lane and Ubuntu Desktop copy.");
  ensure(summary.codeCheckVisible === true, "mini SEIS Code local check action did not update output.");
  ensure(summary.cloudRefreshVisible === true, "mini SEIS Cloud refresh action did not update output.");
  ensure(summary.musicPlayingVisible === true, "mini SEIS Music play action did not update output.");
  ensure(summary.aiAgentVisible === true, "mini SEIS AI agent action did not update output.");
  ensure(summary.functionalJsonVisible === true, "JSON functional app did not run its local formatter.");
  ensure(summary.functionalRegexVisible === true, "Regex functional app did not run its local matcher.");
  ensure(summary.functionalCalendarVisible === true, "Calendar functional app did not add a local event.");
  ensure(summary.functionalPixelVisible === true, "Pixel functional app did not paint local state.");
  ensure(summary.functionalPasswordVisible === true, "Password functional app did not generate placeholder output.");
  ensure(summary.functionalBackupVisible === true, "Backup functional app did not create a browser-local manifest.");
  ensure(summary.functionalGameVisible === true, "Playable functional games did not update local game state.");
  ensure(summary.allFunctionalAppAudit?.total >= summary.functionalAppCount, `expected all functional apps to be audited, found ${summary.allFunctionalAppAudit?.total} for ${summary.functionalAppCount}.`);
  ensure(summary.allFunctionalAppAudit?.failed === 0, `functional app audit failed: ${JSON.stringify(summary.allFunctionalAppAudit?.issues || [])}`);
  const aiChatAliasPassed = summary.allFunctionalAppAudit?.aliasPassed?.aiChat || 0;
  const auditedWorkbenchTarget = summary.enhancedWorkbenchCount || Math.max((summary.enhancedAppCount || 0) - aiChatAliasPassed, 0);
  ensure(aiChatAliasPassed >= 1, "legacy chat compatibility alias did not resolve to SEIS AI Chat.");
  ensure(summary.allFunctionalAppAudit?.passedByMode?.workbench >= auditedWorkbenchTarget, `expected enhanced workbenches plus SEIS AI Chat alias to pass audit, found ${summary.allFunctionalAppAudit?.passedByMode?.workbench} workbenches and ${aiChatAliasPassed} alias for ${summary.enhancedAppCount}.`);
  ensure(summary.allFunctionalAppAudit?.passedByMode?.game >= 8, `expected all playable games to pass audit, found ${summary.allFunctionalAppAudit?.passedByMode?.game}.`);
  ensure(summary.allFunctionalAppAudit?.passedByMode?.native >= 20, `expected native/local functional apps to pass audit, found ${summary.allFunctionalAppAudit?.passedByMode?.native}.`);
  ensure(summary.allFunctionalAppAudit?.interactionPassedByMode?.workbench >= auditedWorkbenchTarget, `expected enhanced workbench primary actions plus SEIS AI Chat alias to pass, found ${summary.allFunctionalAppAudit?.interactionPassedByMode?.workbench} workbenches and ${aiChatAliasPassed} alias for ${summary.enhancedAppCount}.`);
  ensure(summary.allFunctionalAppAudit?.interactionPassedByMode?.game >= 8, `expected all playable game actions to pass, found ${summary.allFunctionalAppAudit?.interactionPassedByMode?.game}.`);
  ensure(summary.allFunctionalAppAudit?.interactionPassedByMode?.native >= 20, `expected native/local functional surfaces to remain interactive, found ${summary.allFunctionalAppAudit?.interactionPassedByMode?.native}.`);
  ensure(summary.allFunctionalAppAudit?.stateFlowPassed?.snapshot >= auditedWorkbenchTarget, `expected enhanced workbench snapshots to pass, found ${summary.allFunctionalAppAudit?.stateFlowPassed?.snapshot} for ${auditedWorkbenchTarget}.`);
  ensure(summary.allFunctionalAppAudit?.stateFlowPassed?.reset >= auditedWorkbenchTarget, `expected enhanced workbench resets to pass, found ${summary.allFunctionalAppAudit?.stateFlowPassed?.reset} for ${auditedWorkbenchTarget}.`);
  ensure(summary.allFunctionalAppAudit?.stateFlowPassed?.gameReset >= 8, `expected all playable game resets to pass, found ${summary.allFunctionalAppAudit?.stateFlowPassed?.gameReset}.`);
  ensure(summary.fileCount >= 8, `expected VFS files to be mounted, found ${summary.fileCount}`);
  ensure(summary.sessionStored === true, "safe Linux Replica session snapshot was not stored.");
  ensure(summary.sessionOpenApps >= 8, `expected session to persist open apps, found ${summary.sessionOpenApps}`);
  ensure(typeof summary.sessionFocusedApp === "string" && summary.sessionFocusedApp.length > 0, "session did not persist focused app.");
  ensure(summary.neofetchVisible === true, "terminal neofetch output did not show runtime app and reference counts.");
  ensure(summary.terminalAppsVisible === true, "terminal apps command did not show functional app coverage.");
  ensure(summary.sourcesVisible === true, "terminal sources command did not show supplied ZIP source coverage.");
  ensure(summary.liveCommandVisible === true, "terminal live command did not report the live tour output.");
  ensure(summary.liveConsoleVisible === true, "Live Demo Console copy is not visible.");
  ensure(summary.searchGatewayVisible && summary.codeVisible && summary.designVisible && summary.cloudVisible && summary.websiteVisible, "connected SEIS bridge surfaces are not all visible.");
  ensure(summary.blockedCopy === true, "local-only SSH/host-shell boundary copy is missing.");
  ensure(summary.horizontalOverflow === false, "desktop has horizontal overflow at 1440 x 960.");

  const screenshotPath = await screenshot(client, "desktop.png");
  const issues = collectRelevantIssues(client.events);
  ensure(issues.length === 0, `browser emitted ${issues.length} relevant issue(s): ${JSON.stringify(issues.slice(0, 3))}`);

  return { ...summary, title, locale: { initial: initialLocale, toggled: toggledLocale }, screenshot: screenshotPath, relevantIssueCount: issues.length };
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
    window.__SEIS_LINUX_REPLICA__.openApp('reference-vault');
    window.__SEIS_LINUX_REPLICA__.openApp('terminal');
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
      referenceVault: document.querySelectorAll('[data-reference-vault]').length,
      terminalReady: window.__SEIS_LINUX_REPLICA__.terminalReady(),
      launcherOpen: document.querySelector('#startMenu')?.classList.contains('is-active'),
      launcherTiles: document.querySelectorAll('.app-tile').length,
      sideRailButtons: document.querySelectorAll('#sideRail [data-side-app]').length,
      sideRailFits: sideRail ? sideRail.width <= viewportWidth + 2 : false,
      taskbarFits: taskbar ? taskbar.width <= viewportWidth + 2 : false,
      liveConsoleVisible: bodyText.includes('SEIS Live Linux-like Demo'),
      referenceVisible: bodyText.includes('SEIS App Library'),
      localBoundaryVisible: bodyText.includes('No SSH') || bodyText.includes('Backend required') || bodyText.includes('no host shell')
    };
  })()`);

  ensure(summary.viewportWidth <= 430, `expected mobile viewport width, found ${summary.viewportWidth}.`);
  ensure(summary.windowCount >= 3, `expected restored/open mobile windows, found ${summary.windowCount}.`);
  ensure(summary.widestWindow <= summary.viewportWidth + 2, `mobile window width exceeds viewport: ${summary.widestWindow} > ${summary.viewportWidth}.`);
  ensure(summary.overflowWindowCount === 0, `mobile viewport has ${summary.overflowWindowCount} oversized window(s).`);
  ensure(summary.horizontalOverflow === false, "mobile desktop has horizontal overflow.");
  ensure(summary.liveDemoConsole >= 1, "mobile Live Demo Console did not render.");
  ensure(summary.referenceVault >= 1, "mobile SEIS App Library did not render.");
  ensure(summary.terminalReady === true, "mobile terminal did not initialize.");
  ensure(summary.launcherOpen === true, "mobile launcher did not open.");
  ensure(summary.launcherTiles >= summary.sideRailButtons, "mobile launcher did not expose app tiles.");
  ensure(summary.sideRailButtons >= 8, `expected mobile side rail buttons, found ${summary.sideRailButtons}.`);
  ensure(summary.sideRailFits === true, "mobile side rail does not fit the viewport.");
  ensure(summary.taskbarFits === true, "mobile taskbar does not fit the viewport.");
  ensure(summary.liveConsoleVisible === true, "mobile Live Demo Console copy is not visible.");
  ensure(summary.referenceVisible === true, "mobile SEIS App Library copy is not visible.");
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
  await waitFor(client, "document.querySelector('[data-live-demo-console]') && document.querySelector('[data-demo-readiness]')", 10000);
  await waitFor(client, "window.__SEIS_LINUX_REPLICA__?.terminalReady?.() === true", 10000);
  const summary = await evaluate(client, `(() => {
    const bodyText = document.body.innerText;
    return {
      demoIntent: window.__SEIS_LINUX_REPLICA__?.demoIntent?.() === true,
      shellActive: document.querySelector('#shell')?.classList.contains('is-active') === true,
      liveDemoConsole: document.querySelectorAll('[data-live-demo-console]').length,
      demoReadiness: document.querySelectorAll('[data-demo-readiness]').length,
      referenceVault: document.querySelectorAll('[data-reference-vault]').length,
      terminalReady: window.__SEIS_LINUX_REPLICA__?.terminalReady?.() === true,
      tourCopyVisible: bodyText.includes('SEIS Live Linux-like Demo'),
      readinessCopyVisible: bodyText.includes('Demo Readiness'),
      blockedCopy: bodyText.includes('No SSH') || bodyText.includes('Backend required') || bodyText.includes('no host shell')
    };
  })()`);

  ensure(summary.demoIntent === true, "deep-link diagnostics did not expose demo intent.");
  ensure(summary.shellActive === true, "deep-link did not auto-enter the desktop shell.");
  ensure(summary.liveDemoConsole >= 1, "deep-link did not open Live Demo Console.");
  ensure(summary.demoReadiness >= 1, "deep-link did not open Demo Readiness.");
  ensure(summary.referenceVault >= 1, "deep-link did not open SEIS App Library.");
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
  const staticContract = validateStaticContract();
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }

  if (STATIC_ONLY) {
    console.log(JSON.stringify({
      ok: true,
      generatedAt: new Date().toISOString(),
      mode: "static-contract",
      staticContract
    }, null, 2));
    return;
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
      seisLinuxReplicaMobile: mobileSummary,
      seisLinuxReplicaDeepLink: deepLinkSummary,
      seisLinuxReplicaProductPageCta: productPageCtaSummary,
      seisLinuxReplicaLandingCta: landingCtaSummary,
      staticContract
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
    appServer.closeIdleConnections?.();
    appServer.closeAllConnections?.();
    await new Promise((resolveClose) => appServer.close(resolveClose));
    await removeDirectoryWithRetries(userDataDir);
  }

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
