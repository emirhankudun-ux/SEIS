import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { JSDOM } from "jsdom";

const ROOT = process.cwd();
const HTML_FILE = path.join(ROOT, "apps", "web", "seis-code.html");
const CSS_FILE = path.join(ROOT, "apps", "web", "seis-code.css");
const JS_FILE = path.join(ROOT, "apps", "web", "seis-code.js");
const ROUTES_FILE = path.join(ROOT, "apps", "web", "src", "config", "routes.json");
const SERVICE_WORKER_FILE = path.join(ROOT, "apps", "web", "service-worker.js");
const SITEMAP_FILE = path.join(ROOT, "apps", "web", "sitemap.xml");
const failures = [];

const requiredMenus = ["file", "edit", "selection", "view", "go", "run", "terminal", "help"];
const requiredViews = ["explorer", "search", "source", "run", "extensions"];
const requiredPanels = ["terminal", "problems", "output", "debug"];
const requiredLensActions = ["toggle-command-lens", "focus-terminal", "open-ai-repl", "show-five-year-plan"];
const requiredCommands = [
  "help",
  "clear",
  "pwd",
  "ls",
  "cd",
  "mkdir",
  "touch",
  "cat",
  "echo",
  "printf",
  "head",
  "tail",
  "cp",
  "mv",
  "rm",
  "rmdir",
  "grep",
  "find",
  "tree",
  "history",
  "date",
  "whoami",
  "uname",
  "env",
  "export",
  "which",
  "open",
  "code",
  "nano",
  "stat",
  "wc",
  "sort",
  "uniq",
  "basename",
  "dirname",
  "sleep",
  "claude",
  "exit"
];
const requiredSlashCommands = [
  "/help",
  "/clear",
  "/exit",
  "/model",
  "/status",
  "/files",
  "/history",
  "/tools",
  "/compact",
  "/new",
  "/rename",
  "/save",
  "/load",
  "/theme"
];
const requiredClaudeTools = [
  "list_files",
  "read_file",
  "create_file",
  "write_file",
  "append_file",
  "apply_patch",
  "rename_file",
  "move_file",
  "delete_file",
  "search_files",
  "get_file_metadata",
  "run_virtual_command",
  "open_file_in_editor",
  "show_diff"
];
const requiredLanguages = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "html",
  "css",
  "scss",
  "json",
  "markdown",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "shell",
  "yaml",
  "xml",
  "dockerfile"
];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readText(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${path.relative(ROOT, file)}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    failures.push(`Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`);
    return null;
  }
}

function createMemoryIndexedDb() {
  const databases = new Map();

  function createRequest() {
    return {
      result: undefined,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null
    };
  }

  function succeed(request, result) {
    setTimeout(() => {
      request.result = result;
      request.onsuccess?.({ target: request });
    }, 0);
  }

  function fail(request, error) {
    setTimeout(() => {
      request.error = error;
      request.onerror?.({ target: request });
    }, 0);
  }

  function createDb(name) {
    const stores = new Map();
    const definitions = new Map();
    return {
      name,
      objectStoreNames: {
        contains: (storeName) => stores.has(storeName)
      },
      createObjectStore(storeName, options = {}) {
        if (!stores.has(storeName)) stores.set(storeName, new Map());
        definitions.set(storeName, {
          keyPath: options.keyPath,
          autoIncrement: Boolean(options.autoIncrement),
          nextKey: 1
        });
      },
      transaction(storeName) {
        if (!stores.has(storeName)) stores.set(storeName, new Map());
        if (!definitions.has(storeName)) definitions.set(storeName, { keyPath: "id", autoIncrement: false, nextKey: 1 });
        const store = stores.get(storeName);
        const definition = definitions.get(storeName);
        return {
          objectStore() {
            return {
              get(key) {
                const request = createRequest();
                succeed(request, store.get(key));
                return request;
              },
              getAll() {
                const request = createRequest();
                succeed(request, Array.from(store.values()).map((value) => structuredClone(value)));
                return request;
              },
              put(value) {
                const request = createRequest();
                try {
                  const nextValue = structuredClone(value);
                  let key = definition.keyPath ? nextValue[definition.keyPath] : undefined;
                  if ((key === undefined || key === null) && definition.autoIncrement) {
                    key = definition.nextKey;
                    definition.nextKey += 1;
                    if (definition.keyPath) nextValue[definition.keyPath] = key;
                  }
                  if (key === undefined || key === null) throw new Error(`Missing key for ${storeName}`);
                  store.set(key, nextValue);
                  succeed(request, key);
                } catch (error) {
                  fail(request, error);
                }
                return request;
              },
              delete(key) {
                const request = createRequest();
                store.delete(key);
                succeed(request, undefined);
                return request;
              }
            };
          }
        };
      },
      close() {}
    };
  }

  return {
    open(name) {
      const request = createRequest();
      setTimeout(() => {
        let db = databases.get(name);
        const fresh = !db;
        if (!db) {
          db = createDb(name);
          databases.set(name, db);
        }
        request.result = db;
        if (fresh) request.onupgradeneeded?.({ target: request });
        request.onsuccess?.({ target: request });
      }, 0);
      return request;
    },
    deleteDatabase(name) {
      const request = createRequest();
      databases.delete(name);
      succeed(request, undefined);
      return request;
    }
  };
}

function installDomHarness(window) {
  window.indexedDB = createMemoryIndexedDb();
  window.require = Object.assign(
    (_dependencies, _success, failure) => {
      setTimeout(() => failure?.(new Error("Monaco disabled in jsdom runtime smoke.")), 0);
    },
    { config() {} }
  );
  window.confirm = () => true;
  window.alert = () => {};
  window.prompt = (_message, fallback = "") => fallback || "demo";
  window.fetch = async (url) => {
    if (url !== "/_server/provider-status") throw new Error(`Unexpected runtime fetch: ${url}`);
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          ok: true,
          data: [
            { providerId: "seis-local-demo", name: "Local Demo", status: "Available", routeEligible: true, notes: "Deterministic local responses only." },
            { providerId: "openai-general", name: "OpenAI", status: "Missing Key", routeEligible: false, notes: "Backend-only and not route eligible." }
          ],
          environmentValidation: {
            status: "validated-no-network",
            configuredProviderCount: 1,
            missingRequiredProviderCount: 1,
            invalidProviderCount: 0,
            publicSecretExposureCount: 0
          }
        };
      }
    };
  };
  window.URL.createObjectURL = () => "blob:seis-code-check";
  window.URL.revokeObjectURL = () => {};
  window.BroadcastChannel = class {
    addEventListener() {}
    postMessage() {}
    close() {}
  };
  window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {}
  });
  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async () => {}
    }
  });
}

async function waitFor(check, label, timeoutMs = 2500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = check();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

function click(window, selector) {
  const element = window.document.querySelector(selector);
  if (!element) throw new Error(`Missing clickable selector ${selector}`);
  element.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  return element;
}

async function runRuntimeSmoke() {
  const dom = new JSDOM(html, {
    url: "https://seis.local/seis-code.html",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  installDomHarness(dom.window);
  dom.window.eval(js);

  const diagnostics = await waitFor(() => dom.window.__SEIS_CODE__, "SEIS Code diagnostics");
  await waitFor(() => diagnostics.filePaths().length >= 7, "seeded virtual files");

  ensure(diagnostics.menuCount() === requiredMenus.length, "Runtime menu count must match the eight required top menus.");
  ensure(diagnostics.activityViewCount() === requiredViews.length, "Runtime activity view count must match the five required views.");
  ensure(diagnostics.bottomPanelCount() === requiredPanels.length, "Runtime bottom panel count must match the four required panels.");
  ensure(diagnostics.languageModes().length >= requiredLanguages.length, "Runtime language mode list must expose 25+ languages.");
  ensure(diagnostics.filePaths().includes("/workspace/README.md"), "Runtime workspace must seed README.md.");
  ensure(diagnostics.filePaths().includes("/workspace/src/main.ts"), "Runtime workspace must seed TypeScript content.");
  ensure(diagnostics.openTabs().length >= 2, "Runtime workspace must restore multiple editor tabs.");
  ensure(diagnostics.monacoReady() || diagnostics.fallbackReady(), "Runtime must initialize Monaco or the explicit fallback editor.");
  ensure(diagnostics.providerText().includes("Local Demo"), "Runtime provider status must truthfully identify Local Demo mode.");
  ensure(diagnostics.commandLensVisible(), "Runtime Command Lens must be visible by default.");
  ensure(diagnostics.evolutionPhaseCount() === 5, "Runtime Command Lens must expose the 5-year evolution rail.");
  ensure(diagnostics.commandLensSummary().includes("Year 1"), "Runtime Command Lens summary must identify the selected horizon.");
  ensure(diagnostics.evolutionDetailText().includes("Proof gate"), "Runtime Command Lens detail must expose the selected phase proof gate.");

  click(dom.window, "[data-action=\"show-provider-status\"]");
  await waitFor(() => dom.window.document.querySelector("[data-modal-body]")?.textContent.includes("validated-no-network"), "server-aware provider status modal");
  ensure(dom.window.document.querySelector("[data-modal-body]")?.textContent.includes("Network called: no"), "Provider status modal must state that the server preflight made no network call.");
  ensure(dom.window.document.querySelector("[data-modal-body]")?.textContent.includes("Local Demo"), "Provider status modal must include the Local Demo row.");
  click(dom.window, "[data-action=\"close-modal\"]");

  for (const menu of requiredMenus) {
    click(dom.window, `[data-menu="${menu}"] .menu-button`);
    ensure(dom.window.document.querySelector(`[data-menu="${menu}"]`)?.classList.contains("is-open"), `Runtime menu ${menu} must open on click.`);
  }

  for (const view of requiredViews) {
    click(dom.window, `[data-view-button="${view}"]`);
    ensure(diagnostics.activeView() === view, `Runtime activity view ${view} must activate.`);
  }

  for (const panel of requiredPanels) {
    click(dom.window, `[data-bottom-panel="${panel}"]`);
    ensure(diagnostics.bottomPanel() === panel, `Runtime bottom panel ${panel} must activate.`);
  }

  click(dom.window, "[data-action=\"toggle-command-lens\"]");
  await waitFor(() => !diagnostics.commandLensVisible(), "Command Lens hidden state");
  click(dom.window, "[data-action=\"toggle-command-lens\"]");
  await waitFor(() => diagnostics.commandLensVisible(), "Command Lens visible state");
  click(dom.window, "[data-action=\"focus-terminal\"]");
  ensure(diagnostics.bottomPanel() === "terminal", "Runtime Command Lens terminal focus action must activate the terminal panel.");
  ensure(diagnostics.terminalText().includes("Command Lens focused"), "Runtime Command Lens terminal focus action must write terminal feedback.");
  click(dom.window, "[data-action=\"open-ai-repl\"]");
  await waitFor(() => diagnostics.replActive(), "Command Lens Local Demo REPL action");
  await diagnostics.runTerminalCommand("/exit");
  click(dom.window, "[data-evolution-phase]");
  ensure(diagnostics.selectedEvolutionPhase() === "v0.1-foundation", "Runtime Command Lens phase click must select the matching phase.");
  click(dom.window, "[data-evolution-phase=\"v0.4-intelligence\"]");
  await waitFor(() => diagnostics.selectedEvolutionPhase() === "v0.4-intelligence", "Year 4 Command Lens selected phase");
  await waitFor(() => diagnostics.evolutionDetailText().includes("provider-neutral infrastructure"), "Year 4 Command Lens detail");
  await waitFor(() => diagnostics.outputText().includes("Year 4"), "Year 4 Command Lens output feedback");
  click(dom.window, "[data-action=\"show-five-year-plan\"]");
  ensure(dom.window.document.querySelector("[data-modal]")?.hidden === false, "Runtime Command Lens plan button must open the five-year plan modal.");
  ensure(dom.window.document.querySelector("[data-modal-title]")?.textContent.includes("Five-Year"), "Runtime Command Lens modal title must describe the five-year plan.");
  click(dom.window, "[data-action=\"close-modal\"]");

  const beforeInstalled = diagnostics.installedExtensionCount();
  await diagnostics.installExtension("tools.html-preview");
  ensure(diagnostics.installedExtensionCount() > beforeInstalled, "Runtime extension install action must mutate persisted extension state.");

  await diagnostics.runTerminalCommand("echo smoke > smoke.txt");
  await diagnostics.runTerminalCommand("cat smoke.txt");
  ensure(diagnostics.terminalText().includes("smoke"), "Runtime terminal must write and read a virtual file.");

  await diagnostics.runTerminalCommand("grep smoke smoke.txt");
  ensure(diagnostics.terminalText().includes("smoke"), "Runtime terminal grep must search virtual file content.");

  await diagnostics.runTerminalCommand("claude");
  ensure(diagnostics.replActive(), "Runtime terminal command claude must enter the Local Demo REPL.");
  await diagnostics.runTerminalCommand("/status");
  await diagnostics.runTerminalCommand("/tools");
  await diagnostics.runTerminalCommand("list the files");
  await diagnostics.runTerminalCommand("create file notes/runtime-tool.md");
  await diagnostics.runTerminalCommand("write file notes/runtime-tool.md with \"Alpha browser workspace slice\"");
  await diagnostics.runTerminalCommand("append file notes/runtime-tool.md with \" Beta\"");
  await diagnostics.runTerminalCommand("patch file notes/runtime-tool.md");
  await diagnostics.runTerminalCommand("show diff for notes/runtime-tool.md");
  await diagnostics.runTerminalCommand("run command \"cat notes/runtime-tool.md\"");
  await diagnostics.runTerminalCommand("open file notes/runtime-tool.md");
  await diagnostics.runTerminalCommand("search \"Alpha\"");
  await diagnostics.runTerminalCommand("delete workspace all files");
  await diagnostics.runTerminalCommand("/exit");
  ensure(!diagnostics.replActive(), "Runtime /exit must leave the Local Demo REPL.");
  const terminalText = diagnostics.terminalText();
  ensure(terminalText.includes("Local Demo"), "Runtime REPL output must label Local Demo mode.");
  ensure(terminalText.includes("not Anthropic"), "Runtime REPL output must not mislabel Local Demo as Anthropic.");
  ensure(terminalText.includes("write_file success"), "Runtime REPL write_file tool must execute.");
  ensure(terminalText.includes("append_file success"), "Runtime REPL append_file tool must execute.");
  ensure(terminalText.includes("apply_patch success"), "Runtime REPL apply_patch tool must execute.");
  ensure(terminalText.includes("show_diff success"), "Runtime REPL show_diff tool must execute.");
  ensure(terminalText.includes("run_virtual_command success"), "Runtime REPL run_virtual_command tool must execute.");
  ensure(terminalText.includes("open_file_in_editor success"), "Runtime REPL open_file_in_editor tool must execute.");
  ensure(terminalText.includes("delete_file cancelled"), "Runtime REPL destructive tool must expose cancelled state.");
  const toolStatuses = diagnostics.replToolStatuses();
  ensure(toolStatuses.some((status) => status === "write_file:success"), "Diagnostics must record write_file success.");
  ensure(toolStatuses.some((status) => status === "delete_file:cancelled"), "Diagnostics must record cancelled destructive tool.");

  click(dom.window, "[data-action=\"command-palette\"]");
  ensure(dom.window.document.querySelector("[data-palette]")?.hidden === false, "Runtime command palette must open.");
  dom.window.document.querySelector("[data-palette-input]").value = "Year 5";
  dom.window.document.querySelector("[data-palette-input]").dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  ensure(dom.window.document.querySelector("[data-palette-results]")?.textContent.includes("Command Lens: Year 5"), "Runtime command palette must expose five-year phase commands.");
  ensure(diagnostics.paletteStatusText().includes("result"), "Runtime command palette must expose result count/status text.");
  ensure(diagnostics.paletteActiveLabel().includes("Year 5"), "Runtime command palette must select the first matching result.");
  dom.window.document.querySelector("[data-palette-input]").dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
  await waitFor(() => diagnostics.selectedEvolutionPhase() === "v0.5-platform", "Command palette Enter executes Year 5 command");
  ensure(diagnostics.paletteRecentCommandIds().includes("phase:v0.5-platform"), "Runtime command palette must persist recent command IDs.");
  click(dom.window, "[data-action=\"command-palette\"]");
  ensure(diagnostics.paletteResultText().includes("Recent"), "Runtime command palette must render a Recent group after command execution.");

  dom.window.close();
}

const html = readText(HTML_FILE);
const css = readText(CSS_FILE);
const js = readText(JS_FILE);
const routes = readJson(ROUTES_FILE);
const serviceWorker = readText(SERVICE_WORKER_FILE);
const sitemap = readText(SITEMAP_FILE);

if (JS_FILE && fs.existsSync(JS_FILE)) {
  const syntax = spawnSync("node", ["--check", JS_FILE], { cwd: ROOT, encoding: "utf8" });
  ensure(syntax.status === 0, `apps/web/seis-code.js syntax check failed: ${syntax.stderr || syntax.stdout}`);
}

ensure(html.includes("monaco-editor@"), "SEIS Code must load Monaco editor.");
ensure(html.includes('src="./seis-code.js"'), "SEIS Code HTML must load its runtime script.");
ensure(html.includes("IndexedDB"), "SEIS Code HTML must expose IndexedDB persistence status.");
ensure(html.includes("Local Demo"), "SEIS Code must truthfully label no-key local demo AI mode.");
ensure(html.includes("data-command-lens"), "SEIS Code HTML must include the Command Lens rail.");
ensure(html.includes("5-Year Evolution Rail"), "SEIS Code HTML must include the five-year evolution rail.");

for (const action of requiredLensActions) {
  ensure(html.includes(`data-action="${action}"`) || js.includes(`"${action}"`), `SEIS Code missing Command Lens action: ${action}`);
}

for (const menu of requiredMenus) {
  ensure(html.includes(`data-menu="${menu}"`), `SEIS Code missing top menu: ${menu}`);
}

for (const view of requiredViews) {
  ensure(html.includes(`data-view-button="${view}"`), `SEIS Code missing activity button: ${view}`);
  ensure(html.includes(`data-panel="${view}"`), `SEIS Code missing sidebar panel: ${view}`);
}

for (const panel of requiredPanels) {
  ensure(html.includes(`data-bottom-panel="${panel}"`), `SEIS Code missing bottom panel tab: ${panel}`);
  ensure(html.includes(`data-bottom-content="${panel}"`), `SEIS Code missing bottom panel content: ${panel}`);
}

for (const command of requiredCommands) {
  ensure(js.includes(command), `SEIS Code runtime missing terminal command: ${command}`);
}

for (const command of requiredSlashCommands) {
  ensure(js.includes(command), `SEIS Code runtime missing Claude-style slash command: ${command}`);
}

for (const tool of requiredClaudeTools) {
  ensure(js.includes(`name: "${tool}"`), `SEIS Code runtime missing Claude-style tool registry entry: ${tool}`);
  ensure(js.includes(tool), `SEIS Code runtime missing Claude-style tool implementation marker: ${tool}`);
}

for (const language of requiredLanguages) {
  ensure(js.includes(`"${language}"`), `SEIS Code runtime missing language mode: ${language}`);
}

for (const required of ["indexedDB.open", "createObjectStore", "terminalHistory", "Local Demo", "not Anthropic", "list_files", "apply_patch"]) {
  ensure(js.includes(required), `SEIS Code runtime missing required capability marker: ${required}`);
}

for (const required of ["evolutionPhases", "renderCommandLens", "toggleCommandLens", "focusTerminal", "showFiveYearPlan", "selectEvolutionPhase", "getSelectedEvolutionPhase", "Apple-grade Command Lens"]) {
  ensure(js.includes(required), `SEIS Code runtime missing Command Lens capability marker: ${required}`);
}

for (const required of ["buildPaletteItems", "runPaletteItem", "rememberPaletteCommand", "movePaletteSelection", "paletteRecentCommandIds"]) {
  ensure(js.includes(required), `SEIS Code runtime missing command palette capability marker: ${required}`);
}

for (const required of ["/_server/provider-status", "cache: \"no-store\"", "renderProviderStatusReport", "LOCAL_PROVIDER_STATUS_FALLBACK", "environmentValidation"]) {
  ensure(js.includes(required), `SEIS Code runtime missing server-aware provider status marker: ${required}`);
}

for (const required of ["normalized !== WORKSPACE", "startsWith(`${WORKSPACE}/`)", "unsafe characters", "toolPath = args.path ? normalizePath(args.path)", "Blocked external workspace update"]) {
  ensure(js.includes(required), `SEIS Code runtime missing workspace path-boundary marker: ${required}`);
}

for (const required of ["let settled = false", "app.fallbackReady", "textarea.value", "finish(true)"]) {
  ensure(js.includes(required), `SEIS Code runtime missing Monaco fallback-race marker: ${required}`);
}

for (const required of [".monaco-host", ".terminal-output", ".activity-button", ".tool-call.is-success", ".tool-call.is-cancelled", "@media", "prefers-reduced-motion"]) {
  ensure(css.includes(required), `SEIS Code CSS missing required selector or media rule: ${required}`);
}

for (const required of [".command-lens", ".evolution-phase", ".evolution-detail", ".workspace.lens-hidden", ".lens-toggle"]) {
  ensure(css.includes(required), `SEIS Code CSS missing Command Lens selector: ${required}`);
}

for (const required of [".palette-meta", ".palette-group", ".palette-result-main", ".palette-result-detail", ".palette-empty"]) {
  ensure(css.includes(required), `SEIS Code CSS missing command palette selector: ${required}`);
}

const routePaths = new Set((routes?.routes || []).map((route) => route.path));
ensure(routePaths.has("/seis-code.html"), "routes config must include /seis-code.html.");
ensure(serviceWorker.includes("./seis-code.html"), "service worker must cache SEIS Code HTML.");
ensure(serviceWorker.includes("./seis-code.css"), "service worker must cache SEIS Code CSS.");
ensure(serviceWorker.includes("./seis-code.js"), "service worker must cache SEIS Code JS.");
ensure(sitemap.includes("/seis-code.html"), "sitemap must include SEIS Code route.");

if (html && js) {
  try {
    await runRuntimeSmoke();
  } catch (error) {
    failures.push(`SEIS Code runtime smoke failed: ${error.stack || error.message}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS Code check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Code check passed.");
