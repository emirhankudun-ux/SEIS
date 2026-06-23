import { existsSync, readFileSync } from "node:fs";
import { TextDecoder, TextEncoder } from "node:util";
import { JSDOM } from "jsdom";

const failures = [];

const requiredFiles = [
  "apps/web/desktop.html",
  "apps/web/desktop.css",
  "apps/web/desktop.js"
];

for (const file of requiredFiles) {
  if (!existsSync(file)) failures.push(`missing required file: ${file}`);
}

if (failures.length === 0) {
  const html = readFileSync("apps/web/desktop.html", "utf8");
  const css = readFileSync("apps/web/desktop.css", "utf8");
  const js = readFileSync("apps/web/desktop.js", "utf8");
  const index = readFileSync("apps/web/index.html", "utf8");
  const routes = readFileSync("apps/web/src/config/routes.json", "utf8");
  const serviceWorker = readFileSync("apps/web/service-worker.js", "utf8");
  const packageJson = readFileSync("package.json", "utf8");

  const appBlock = js.match(/const APPS = \[([\s\S]*?)\]\.map/);
  const commandBlock = js.match(/const REQUIRED_TERMINAL_COMMANDS = \[([\s\S]*?)\];/);
  const appCount = appBlock ? (appBlock[1].match(/^\s+\["/gm) || []).length : 0;
  const commandCount = commandBlock ? (commandBlock[1].match(/"[^"]+"/g) || []).length : 0;

  ensure(appCount >= 50, `expected at least 50 apps, found ${appCount}`);
  ensure(commandCount >= 12, `expected at least 12 terminal commands, found ${commandCount}`);
  ensure(html.includes("data-launcher"), "desktop.html must include launcher surface.");
  ensure(html.includes("data-window-layer"), "desktop.html must include window layer.");
  ensure(html.includes("data-command-palette"), "desktop.html must include command palette.");
  ensure(css.includes("@media (max-width: 900px)"), "desktop.css must include tablet/mobile layout.");
  ensure(css.includes("prefers-reduced-motion"), "desktop.css must include reduced-motion handling.");
  ensure(js.includes("indexedDB.open"), "desktop.js must use IndexedDB when available.");
  ensure(js.includes("localStorage.setItem"), "desktop.js must include persistence fallback.");
  ensure(js.includes("seis-code-workspace-v1"), "desktop.js must mirror eligible files into the SEIS Code workspace store.");
  ensure(js.includes("workspace-file-created"), "desktop.js must notify SEIS Code when mirrored files change.");
  ensure(js.includes("desktopPathToCodeWorkspacePath"), "desktop.js must map desktop paths into the SEIS Code workspace explicitly.");
  ensure(js.includes("claude"), "desktop.js must include Claude-style terminal command.");
  ensure(js.includes("Local Demo"), "desktop.js must truthfully label local demo AI mode.");
  ensure(js.includes("__SEIS_DESKTOP__"), "desktop.js must expose safe smoke diagnostics.");
  ensure(js.includes("data-action=\"generic-new\""), "desktop.js must render functional app actions.");
  ensure(index.includes("desktop.html"), "index.html must link to desktop route.");
  ensure(routes.includes("\"/desktop.html\""), "routes.json must include desktop route.");
  ensure(serviceWorker.includes("./desktop.html"), "service worker must cache desktop route.");
  ensure(packageJson.includes("check:desktop-os"), "package.json must expose desktop validation script.");

  await runRuntimeSmoke(html, js);
}

if (failures.length > 0) {
  console.error("SEIS desktop OS check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS desktop OS check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

async function runRuntimeSmoke(html, js) {
  const dom = new JSDOM(html, {
    url: "http://127.0.0.1/desktop.html",
    runScripts: "dangerously",
    pretendToBeVisual: true
  });

  const { window } = dom;
  window.TextEncoder = TextEncoder;
  window.TextDecoder = TextDecoder;
  window.innerWidth = 1280;
  window.innerHeight = 860;
  window.prompt = () => null;
  window.alert = () => {};
  window.confirm = () => true;
  window.URL.createObjectURL = () => "blob:seis-desktop-smoke";
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = () => {};

  try {
    window.eval(js);
    await delay(450);

    const diagnostics = window.__SEIS_DESKTOP__;
    ensure(diagnostics, "desktop runtime must expose safe diagnostics.");
    if (!diagnostics) return;

    ensure(diagnostics.appCount >= 50, `runtime expected at least 50 apps, found ${diagnostics.appCount}`);
    ensure(diagnostics.terminalCommands.length >= 12, `runtime expected at least 12 terminal commands, found ${diagnostics.terminalCommands.length}`);
    ensure(diagnostics.openWindows().includes("Files"), "runtime must restore Files at startup.");
    ensure(diagnostics.openWindows().includes("Terminal"), "runtime must restore Terminal at startup.");

    const launcherToggle = window.document.querySelector("[data-action=\"toggle-launcher\"]");
    ensure(launcherToggle, "runtime must render launcher toggle button.");
    launcherToggle?.click();
    await delay(20);

    const launcherApps = window.document.querySelectorAll(".launcher-app[data-action=\"open-app\"]");
    ensure(launcherApps.length >= 50, `launcher must render at least 50 app buttons, found ${launcherApps.length}`);

    const calculatorButton = window.document.querySelector(".launcher-app[data-app-id=\"calculator\"]");
    ensure(calculatorButton, "launcher must include Calculator app button.");
    calculatorButton?.click();
    await delay(20);
    ensure(diagnostics.openWindows().includes("Calculator"), "clicking Calculator must open a Calculator window.");
    ensure(window.document.querySelector("[data-calculator-expression]"), "Calculator must render an interactive expression input.");

    const terminalRan = diagnostics.runTerminalCommand("help");
    await delay(20);
    ensure(terminalRan, "diagnostic terminal command runner must execute commands.");
    ensure(window.document.body.textContent.includes("Available commands"), "terminal help command must print available commands.");

    const paletteButton = window.document.querySelector("[data-action=\"open-search\"]");
    ensure(paletteButton, "runtime must render command palette/search button.");
    paletteButton?.click();
    await delay(20);
    ensure(!window.document.querySelector("[data-command-palette]")?.hasAttribute("hidden"), "command palette button must open the palette.");

    for (const app of diagnostics.appCatalog) {
      diagnostics.openApp(app.id);
    }
    await delay(120);
    ensure(diagnostics.openWindows().length >= 50, `runtime expected at least 50 openable app windows, found ${diagnostics.openWindows().length}`);
    ensure(window.document.querySelectorAll("[data-action=\"app-primary\"]").length >= 35, "runtime must expose primary workflow actions for at least 35 app surfaces.");
    const appAudit = diagnostics.appActionAudit();
    const unopenedApps = appAudit.filter((app) => !app.opened);
    const weakApps = appAudit.filter((app) => !app.functional);
    const primaryWorkflowApps = appAudit.filter((app) => app.hasPrimaryWorkflow);
    ensure(appAudit.length >= 50, `runtime app audit expected at least 50 entries, found ${appAudit.length}`);
    ensure(unopenedApps.length === 0, `all apps must open windows; missing: ${unopenedApps.map((app) => app.id).join(", ")}`);
    ensure(weakApps.length === 0, `all apps must expose functional controls; weak: ${weakApps.map((app) => `${app.id}(${app.actions.length}/${app.formControls})`).join(", ")}`);
    ensure(primaryWorkflowApps.length >= 35, `expected at least 35 primary workflow app surfaces, found ${primaryWorkflowApps.length}`);

    const workflowSamples = [
      "notes",
      "sheets",
      "slides",
      "tasks",
      "paint",
      "git-client",
      "weather",
      "video-hero-gallery",
      "downloads"
    ];
    for (const appId of workflowSamples) {
      await runPrimaryWorkflow(window, diagnostics, appId);
    }

    const summary = diagnostics.interactivitySummary();
    ensure(summary.buttons >= 50, `runtime expected at least 50 rendered buttons, found ${summary.buttons}`);
    ensure(summary.rate >= 0.8, `runtime interactivity rate must be at least 80%, found ${(summary.rate * 100).toFixed(1)}%`);
  } finally {
    window.close();
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPrimaryWorkflow(window, diagnostics, appId) {
  diagnostics.openApp(appId);
  await delay(20);
  const beforeFiles = diagnostics.filePaths();
  const button = window.document.querySelector(`[data-action="app-primary"][data-app-id="${appId}"]`);
  ensure(button, `${appId} must expose a primary workflow button.`);
  button?.click();
  await delay(80);
  const status = diagnostics.appStatus(appId);
  ensure(status.lastAction && status.lastAction !== "Ready", `${appId} primary workflow must update app status.`);
  if (["notes", "sheets", "paint", "downloads"].includes(appId)) {
    ensure(diagnostics.filePaths().length > beforeFiles.length, `${appId} primary workflow must create a virtual file artifact.`);
  }
}
