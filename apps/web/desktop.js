const REQUIRED_TERMINAL_COMMANDS = [
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

const APPS = [
  ["files", "Files", "System", "FILE", "Manage virtual folders, documents, imports, exports, and trash.", "files"],
  ["terminal", "Terminal", "System", ">_", "Run browser-safe shell commands against the virtual file system.", "terminal"],
  ["seis-code", "SEIS Code", "System", "{ }", "Edit files, preview HTML and Markdown, and save to the shared workspace.", "code"],
  ["settings", "Settings", "System", "SET", "Configure appearance, workspaces, notifications, storage, and safe preferences.", "settings"],
  ["app-center", "App Center", "System", "APP", "Inspect, pin, launch, and organize installed applications.", "app-center"],
  ["extensions", "Extensions Manager", "System", "EXT", "Install, enable, disable, and configure local extensions.", "extensions"],
  ["system-monitor", "System Monitor", "System", "CPU", "Track live browser session CPU, memory, storage, and event activity.", "monitor"],
  ["task-manager", "Task Manager", "System", "TSK", "Review open windows, app activity, and stop local tasks.", "task-manager"],
  ["disk-utility", "Disk Utility", "System", "DSK", "Inspect virtual storage usage and clean temporary files.", "disk"],
  ["archive-manager", "Archive Manager", "System", "ZIP", "Bundle selected virtual files into export manifests.", "archive"],
  ["system-logs", "System Logs", "System", "LOG", "Inspect local audit events, app launches, and command history.", "logs"],
  ["startup-apps", "Startup Applications", "System", "RUN", "Choose apps to restore automatically when the desktop opens.", "startup"],
  ["notes", "Notes", "Productivity", "NTE", "Capture durable notes and save them as Markdown files.", "notes"],
  ["text-editor", "Text Editor", "Productivity", "TXT", "Edit plain text files with autosave and export controls.", "text"],
  ["markdown-studio", "Markdown Studio", "Productivity", "MD", "Write Markdown and preview the rendered outline.", "markdown"],
  ["writer", "Writer", "Productivity", "DOC", "Draft structured documents and save them to Documents.", "writer"],
  ["sheets", "Sheets", "Productivity", "SHT", "Create editable lightweight tables and export CSV.", "sheets"],
  ["slides", "Slides", "Productivity", "SLD", "Build a small deck outline and navigate slide cards.", "slides"],
  ["calendar", "Calendar", "Productivity", "CAL", "Create local events, reminders, and day notes.", "calendar"],
  ["tasks", "Tasks", "Productivity", "CHK", "Create tasks, mark done, and filter active work.", "tasks"],
  ["kanban", "Kanban", "Productivity", "KAN", "Move cards across planned, active, and done lanes.", "kanban"],
  ["contacts", "Contacts", "Productivity", "CON", "Manage local contact cards without syncing externally.", "contacts"],
  ["mail", "Mail", "Productivity", "EML", "Draft local messages and save them as files; no external sending.", "mail"],
  ["calculator", "Calculator", "Productivity", "123", "Evaluate safe arithmetic expressions and keep history.", "calculator"],
  ["clock", "Clock", "Productivity", "CLK", "Use stopwatch, timer, and local alarm notes.", "clock"],
  ["pomodoro", "Pomodoro", "Productivity", "25", "Run focus sessions with start, pause, reset, and history.", "pomodoro"],
  ["unit-converter", "Unit Converter", "Productivity", "UNI", "Convert length, weight, temperature, and storage units.", "converter"],
  ["dictionary", "Dictionary", "Productivity", "ABC", "Search a local mini dictionary and create terms.", "dictionary"],
  ["search", "Search", "Productivity", "SRH", "Search installed apps, files, notes, tasks, and logs.", "search"],
  ["photos", "Photos", "Creative", "IMG", "Browse generated and imported local media records.", "media"],
  ["image-editor", "Image Editor", "Creative", "EDT", "Apply non-destructive crop, rotate, and tone metadata.", "image-editor"],
  ["paint", "Paint", "Creative", "PNT", "Draw on a local browser canvas and save artwork metadata.", "paint"],
  ["whiteboard", "Whiteboard", "Creative", "WHT", "Arrange sticky notes and sketches on an infinite board.", "whiteboard"],
  ["color-picker", "Color Picker", "Creative", "CLR", "Pick colors, copy HEX values, and save palettes.", "color"],
  ["gradient-maker", "Gradient Maker", "Creative", "GRD", "Design gradients and export CSS snippets.", "gradient"],
  ["font-viewer", "Font Viewer", "Creative", "Aa", "Preview local font stacks and compare type samples.", "font"],
  ["svg-studio", "SVG Studio", "Creative", "SVG", "Create simple SVG snippets and save them to files.", "svg"],
  ["icon-browser", "Icon Browser", "Creative", "ICO", "Browse local symbolic icons and copy labels.", "icons"],
  ["audio-player", "Audio Player", "Creative", "AUD", "Play generated oscillator tones and manage playlists.", "audio"],
  ["video-player", "Video Player", "Creative", "VID", "Inspect local video records and playback controls.", "video"],
  ["voice-recorder", "Voice Recorder", "Creative", "REC", "Record browser microphone when permission is available.", "recorder"],
  ["camera", "Camera", "Creative", "CAM", "Open browser camera preview when permission is available.", "camera"],
  ["screenshot-tool", "Screenshot Tool", "Creative", "SS", "Capture desktop state summaries and save snapshots.", "screenshot"],
  ["pdf-viewer", "PDF Viewer", "Creative", "PDF", "View imported PDF records and page notes.", "pdf"],
  ["git-client", "Git Client", "Developer", "GIT", "Use a safe simulated repository with status, stage, and commit log.", "git"],
  ["api-client", "API Client", "Developer", "API", "Compose safe local API requests and inspect mock responses.", "api"],
  ["database-explorer", "Database Explorer", "Developer", "DB", "Browse local IndexedDB status and virtual tables.", "database"],
  ["json-yaml-lab", "JSON and YAML Lab", "Developer", "JY", "Validate JSON, format it, and save snippets.", "json"],
  ["regex-tester", "Regex Tester", "Developer", "RX", "Test regular expressions against sample text.", "regex"],
  ["diff-viewer", "Diff Viewer", "Developer", "DIF", "Compare two text blocks and list changed lines.", "diff"],
  ["hash-encoder", "Hash and Encoder", "Developer", "HASH", "Encode base64, URL encode, and calculate SHA-256.", "hash"],
  ["qr-studio", "QR Studio", "Developer", "QR", "Create a scannable-style local QR placeholder from text.", "qr"],
  ["network-inspector", "Network Inspector", "Developer", "NET", "Track local fetch checks and connectivity state.", "network"],
  ["web-playground", "Web Playground", "Developer", "WEB", "Run safe HTML, CSS, and JavaScript previews in a sandbox.", "playground"],
  ["package-explorer", "Package Explorer", "Developer", "PKG", "Inspect local package metadata and dependency notes.", "package"],
  ["snippet-manager", "Snippet Manager", "Developer", "SNP", "Store reusable code snippets by language.", "snippets"],
  ["browser-portal", "Browser Portal", "Connected", "WWW", "Save bookmarks and open internal routes safely.", "browser"],
  ["weather", "Weather", "Connected", "WX", "Use local demo weather cards without external network calls.", "weather"],
  ["maps", "Maps", "Connected", "MAP", "Explore a local coordinate grid and saved places.", "maps"],
  ["clipboard-manager", "Clipboard Manager", "Connected", "CLP", "Store copied snippets in a local clipboard queue.", "clipboard"],
  ["password-vault", "Password Vault", "Connected", "LOCK", "Store safe placeholder records only; real secrets are blocked.", "vault"],
  ["downloads", "Downloads", "Connected", "DL", "Review exported files and virtual download records.", "downloads"],
  ["ai-assistant", "AI Assistant", "Connected", "AI", "Use local demo assistance with truthful no-key status.", "ai"],
  ["video-hero-gallery", "Video Hero Gallery", "Connected", "MOV", "Open four local showcase routes and save favorites.", "video-gallery"],
  ["mythic-gacha", "Mythic Gacha", "Connected", "MYT", "Draw local mythical creature cards with persisted history.", "gacha"],
  ["bestiary", "Bestiary", "Connected", "BST", "View unlocked creature lore and completion state.", "bestiary"]
].map(([id, name, category, icon, description, type]) => ({
  id,
  name,
  category,
  icon,
  description,
  type
}));

const FAVORITES = [
  "files",
  "terminal",
  "seis-code",
  "settings",
  "notes",
  "system-monitor",
  "app-center",
  "mythic-gacha"
];

const DESKTOP_SHORTCUTS = ["files", "terminal", "seis-code", "settings", "notes", "mythic-gacha"];
const DB_NAME = "seis-desktop-os";
const DB_VERSION = 1;
const STORE_NAME = "desktopState";
const STORAGE_KEY = "seis.desktop.state.v1";
const CODE_WORKSPACE_DB_NAME = "seis-code-workspace-v1";
const CODE_WORKSPACE_DB_VERSION = 1;
const CODE_WORKSPACE_ROOT = "/workspace";
const CODE_WORKSPACE_CHANNEL = "seis-code-workspace";
const DESKTOP_HOME = "/home/seis";
const codeWorkspaceLanguageByExtension = {
  ".js": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".jsx": "javascript",
  ".html": "html",
  ".css": "css",
  ".json": "json",
  ".md": "markdown",
  ".py": "python",
  ".sh": "shell",
  ".yml": "yaml",
  ".yaml": "yaml",
  ".xml": "xml",
  ".sql": "sql",
  ".txt": "plaintext"
};

const defaultFiles = [
  dir("/home"),
  dir("/home/seis"),
  dir("/home/seis/Desktop"),
  dir("/home/seis/Documents"),
  dir("/home/seis/Downloads"),
  dir("/home/seis/Pictures"),
  dir("/home/seis/Projects"),
  dir("/home/seis/MythicArchive"),
  file("/home/seis/Documents/welcome.md", "# SEIS Desktop\n\nThis is a browser-contained operating surface. Files, terminal history, notes, tasks, and app preferences persist locally.\n"),
  file("/home/seis/Projects/example.html", "<h1>SEIS Web Playground</h1>\n<p>Edit this file in SEIS Code or run `cat Projects/example.html` in Terminal.</p>\n"),
  file("/home/seis/Desktop/todo.txt", "Open Files\nRun Terminal\nTry Apps launcher\n")
];

let db = null;
let state = createDefaultState();
let activeWindowId = null;
let launcherCategory = "All";
let terminalSession = {
  cwd: "/home/seis",
  historyIndex: -1,
  claudeRepl: false
};

const root = document.documentElement;
const shell = document.querySelector(".desktop-shell");
const layer = document.querySelector("[data-window-layer]");
const dock = document.querySelector("[data-dock]");
const launcher = document.querySelector("[data-launcher]");
const launcherGrid = document.querySelector("[data-launcher-grid]");
const launcherCategories = document.querySelector("[data-launcher-categories]");
const commandPalette = document.querySelector("[data-command-palette]");
const commandResults = document.querySelector("[data-command-results]");
const commandInput = document.querySelector("[data-command-input]");
const quickStatus = document.querySelector("[data-quick-status]");
const windowTemplate = document.querySelector("#window-template");

init();

async function init() {
  db = await withTimeout(openDatabase(), 300).catch(() => null);
  state = await loadState();
  applyTheme();
  renderDock();
  renderDesktopIcons();
  renderLauncher();
  renderTaskbar();
  setupClock();
  setupEvents();
  ensureToastRegion();
  restoreStartupApps();
  exposeDiagnostics();
  if (window.innerWidth > 700) {
    toast("SEIS Desktop Ready", `${APPS.length} apps installed. Core workspace runs without cloud keys.`);
  }
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => window.setTimeout(() => resolve(null), ms))
  ]);
}

function createDefaultState() {
  return {
    theme: "dark",
    workspace: "1",
    nextWindow: 1,
    z: 30,
    windows: [],
    fs: defaultFiles,
    currentDir: "/home/seis",
    selectedPath: "/home/seis/Documents/welcome.md",
    codePath: "/home/seis/Documents/welcome.md",
    terminalHistory: [],
    env: { SEIS_ENVIRONMENT: "local", SEIS_DATA_MODE: "local-demo" },
    logs: [],
    installedExtensions: [
      { id: "markdown-tools", name: "Markdown Tools", enabled: true },
      { id: "theme-graphite", name: "Graphite Theme Pack", enabled: true },
      { id: "local-preview", name: "Local Preview Runner", enabled: true }
    ],
    startupApps: ["files", "terminal"],
    appData: {
      notes: [{ id: "n1", title: "Foundation note", body: "Build a functional SEIS Desktop surface.", done: false }],
      tasks: [
        { id: "t1", title: "Open launcher", lane: "done", done: true },
        { id: "t2", title: "Create a file", lane: "active", done: false },
        { id: "t3", title: "Verify mobile layout", lane: "planned", done: false }
      ],
      contacts: [{ id: "c1", title: "SEIS Operator", body: "local-only contact", done: false }],
      calendar: [{ id: "e1", title: "Foundation review", body: todayISO(), done: false }],
      clipboard: [{ id: "clip1", title: "Welcome", body: "SEIS Desktop local clipboard entry", done: false }],
      downloads: [],
      "mythic-gacha": { currency: 1200, pity: 0, unlocked: [], history: [] },
      bestiary: { favorites: [] },
      "password-vault": [{ id: "v1", title: "Example record", body: "No real secrets. Use placeholders only.", done: false }],
      "git-client": { branch: "seis/product-experience-suite", staged: [], commits: ["docs: add desktop foundation route"] },
      calculator: { expression: "42 / 2", result: "21", history: [] },
      pomodoro: { running: false, seconds: 1500, sessions: 0 },
      clock: { stopwatch: 0, timer: 300, running: false },
      weather: { city: "Local Demo", condition: "Clear", temperature: 22 },
      maps: { activePlace: "SEIS Workspace", zoom: 2 },
      "ai-assistant": { messages: [{ role: "system", text: "Local Demo mode. No provider key is configured." }] }
    }
  };
}

function dir(path) {
  return node(path, "dir", "");
}

function file(path, content) {
  return node(path, "file", content);
}

function node(path, type, content) {
  const now = new Date().toISOString();
  return { path, type, content, createdAt: now, updatedAt: now, trashed: false };
}

function openDatabase() {
  if (!("indexedDB" in window)) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadState() {
  const fallback = parseJSON(localStorage.getItem(STORAGE_KEY));
  const persisted = await idbGet("state").catch(() => null);
  return normalizeState(persisted || fallback || createDefaultState());
}

function normalizeState(nextState) {
  const base = createDefaultState();
  const merged = {
    ...base,
    ...nextState,
    fs: Array.isArray(nextState.fs) && nextState.fs.length ? nextState.fs : base.fs,
    windows: [],
    appData: { ...base.appData, ...(nextState.appData || {}) },
    logs: Array.isArray(nextState.logs) ? nextState.logs.slice(-160) : base.logs,
    terminalHistory: Array.isArray(nextState.terminalHistory) ? nextState.terminalHistory.slice(-100) : []
  };
  return merged;
}

function saveState() {
  const payload = JSON.stringify({ ...state, windows: [] });
  localStorage.setItem(STORAGE_KEY, payload);
  idbSet("state", JSON.parse(payload)).catch(() => {});
}

function idbGet(key) {
  return new Promise((resolve, reject) => {
    if (!db) return resolve(null);
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

function idbSet(key, value) {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const request = tx.objectStore(STORE_NAME).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function codeWorkspaceLanguage(path) {
  const match = String(path).match(/\.[^./]+$/);
  return codeWorkspaceLanguageByExtension[match?.[0]?.toLowerCase()] || "plaintext";
}

function createCodeWorkspaceEntry(path, content = "", type = "file") {
  const now = new Date().toISOString();
  return {
    path,
    name: baseName(path),
    parent: dirName(path),
    type,
    content: type === "file" ? content : "",
    language: type === "file" ? codeWorkspaceLanguage(path) : "",
    createdAt: now,
    updatedAt: now,
    baseContent: type === "file" ? content : ""
  };
}

function desktopPathToCodeWorkspacePath(path) {
  const normalized = normalizePath(path);
  if (normalized === DESKTOP_HOME) return CODE_WORKSPACE_ROOT;
  if (!normalized.startsWith(`${DESKTOP_HOME}/`)) return "";
  return normalizePath(`${CODE_WORKSPACE_ROOT}${normalized.slice(DESKTOP_HOME.length)}`);
}

function openCodeWorkspaceDatabase() {
  if (!("indexedDB" in window)) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CODE_WORKSPACE_DB_NAME, CODE_WORKSPACE_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("files")) database.createObjectStore("files", { keyPath: "path" });
      if (!database.objectStoreNames.contains("settings")) database.createObjectStore("settings", { keyPath: "key" });
      if (!database.objectStoreNames.contains("history")) database.createObjectStore("history", { keyPath: "id", autoIncrement: true });
      if (!database.objectStoreNames.contains("extensions")) database.createObjectStore("extensions", { keyPath: "id" });
      if (!database.objectStoreNames.contains("commits")) database.createObjectStore("commits", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function putCodeWorkspaceEntry(database, entry) {
  return new Promise((resolve, reject) => {
    const tx = database.transaction("files", "readwrite");
    tx.objectStore("files").put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function codeWorkspaceFoldersFor(path) {
  const folders = [CODE_WORKSPACE_ROOT];
  let parent = dirName(path);
  const nested = [];
  while (parent.startsWith(`${CODE_WORKSPACE_ROOT}/`)) {
    nested.unshift(parent);
    parent = dirName(parent);
  }
  return folders.concat(nested);
}

function notifyCodeWorkspace(path, source) {
  if (!("BroadcastChannel" in window)) return;
  const channel = new BroadcastChannel(CODE_WORKSPACE_CHANNEL);
  channel.postMessage({ type: "workspace-file-created", path, source });
  channel.close();
}

function mirrorFileToCodeWorkspace(fileNode, source = "seis-desktop") {
  if (!fileNode || fileNode.type !== "file") return;
  const workspacePath = desktopPathToCodeWorkspacePath(fileNode.path);
  if (!workspacePath) return;

  openCodeWorkspaceDatabase()
    .then(async (database) => {
      if (!database) return;
      try {
        for (const folderPath of codeWorkspaceFoldersFor(workspacePath)) {
          await putCodeWorkspaceEntry(database, createCodeWorkspaceEntry(folderPath, "", "folder"));
        }
        await putCodeWorkspaceEntry(database, createCodeWorkspaceEntry(workspacePath, fileNode.content || "", "file"));
        notifyCodeWorkspace(workspacePath, source);
      } finally {
        database.close();
      }
    })
    .catch((error) => {
      log("system", `SEIS Code workspace mirror skipped: ${error.message || error}`);
    });
}

function parseJSON(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (_error) {
    return null;
  }
}

function setupEvents() {
  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleInput);
  document.addEventListener("keydown", handleGlobalKeys);
  commandInput.addEventListener("input", renderCommandResults);
  document.querySelector("[data-launcher-search]").addEventListener("input", renderLauncherApps);
}

function handleClick(event) {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  const windowAction = button.dataset.windowAction;
  if (windowAction) {
    handleWindowAction(button.closest(".app-window"), windowAction);
    return;
  }
  if (!action) return;
  event.preventDefault();

  const appId = button.dataset.appId;
  const value = button.dataset.value;
  const path = button.dataset.path;

  switch (action) {
    case "toggle-launcher":
      toggleLauncher();
      break;
    case "close-launcher":
      setLauncher(false);
      break;
    case "open-search":
      openCommandPalette();
      break;
    case "close-search":
      setCommandPalette(false);
      break;
    case "open-app":
      openApp(appId);
      break;
    case "set-category":
      launcherCategory = value;
      renderLauncher();
      break;
    case "activate-window":
      activateWindow(value);
      break;
    case "set-workspace":
      setWorkspace(button.dataset.workspace);
      break;
    case "toggle-status":
      toggleHidden(quickStatus);
      break;
    case "toggle-theme":
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme();
      log("settings", `Theme changed to ${state.theme}.`);
      saveState();
      break;
    case "settings-tab":
      getAppData("settings").activeSection = value || "Appearance";
      log("settings", `Selected ${value || "Appearance"} settings.`);
      saveState();
      renderOpenWindows("settings");
      break;
    case "select-file":
      state.selectedPath = path;
      if (getNode(path)?.type === "dir") state.currentDir = path;
      renderOpenWindows("files");
      break;
    case "open-file":
      state.selectedPath = path || state.selectedPath;
      openFileInEditor(state.selectedPath);
      break;
    case "new-file":
      createFilePrompt();
      break;
    case "new-folder":
      createFolderPrompt();
      break;
    case "delete-file":
      deleteSelectedFile();
      break;
    case "export-file":
      exportSelectedFile();
      break;
    case "save-code":
      saveCode(button.closest(".window-body"));
      break;
    case "new-code-file":
      createCodeFile();
      break;
    case "preview-code":
      previewCode(button.closest(".window-body"));
      break;
    case "generic-new":
      addGenericItem(appId);
      break;
    case "generic-toggle":
      toggleGenericItem(appId, value);
      break;
    case "generic-save":
      saveGenericText(appId, button.closest(".window-body"));
      break;
    case "generic-export":
      exportAppData(appId);
      break;
    case "app-primary":
      runAppPrimaryAction(appId, button.closest(".window-body"));
      break;
    case "install-extension":
      installExtension();
      break;
    case "toggle-extension":
      toggleExtension(value);
      break;
    case "toggle-startup":
      toggleStartup(appId);
      break;
    case "task-stop":
      closeWindow(value);
      break;
    case "clear-logs":
      state.logs = [];
      saveState();
      renderOpenWindows("system-logs");
      break;
    case "run-calculator":
      runCalculator(button.closest(".window-body"));
      break;
    case "run-converter":
      runConverter(button.closest(".window-body"));
      break;
    case "run-regex":
      runRegex(button.closest(".window-body"));
      break;
    case "run-diff":
      runDiff(button.closest(".window-body"));
      break;
    case "run-hash":
      runHash(button.closest(".window-body"));
      break;
    case "run-json":
      runJson(button.closest(".window-body"));
      break;
    case "run-api":
      runApiClient(button.closest(".window-body"));
      break;
    case "run-playground":
      runPlayground(button.closest(".window-body"));
      break;
    case "draw-gacha":
      drawGacha(Number(value) || 1);
      break;
    case "favorite-creature":
      favoriteCreature(value);
      break;
    case "save-creature-file":
      saveCreatureFile(value);
      break;
    case "simulate-download":
      simulateDownload();
      break;
    case "safe-vault-record":
      addVaultPlaceholder();
      break;
    case "assistant-send":
      assistantSend(button.closest(".window-body"));
      break;
    case "open-route":
      window.location.href = value;
      break;
    case "toggle-network":
    case "toggle-audio":
      toast("Status Updated", "This local status tile responded and recorded an audit event.");
      log("system", `${action} clicked.`);
      break;
    default:
      toast("Action Recorded", action);
      log("ui", `Unhandled action recorded: ${action}`);
  }
}

function handleInput(event) {
  const input = event.target;
  if (input.matches("[data-code-editor]")) {
    input.dataset.dirty = "true";
  }
}

function handleGlobalKeys(event) {
  if (event.target?.matches?.("[data-terminal-input]") && event.key === "Enter") {
    event.preventDefault();
    submitTerminalInput(event.target);
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandPalette();
  }
  if (event.key === "Escape") {
    setLauncher(false);
    setCommandPalette(false);
    quickStatus.hidden = true;
  }
}

function setupClock() {
  const update = () => {
    document.querySelector("[data-clock]").textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  update();
  window.setInterval(update, 30_000);
}

function renderDock() {
  dock.innerHTML = "";
  for (const id of FAVORITES) {
    const app = getApp(id);
    const button = createButton("dock-button", app.icon, "open-app");
    button.dataset.appId = id;
    button.title = app.name;
    button.setAttribute("aria-label", app.name);
    if (state.windows.some((win) => win.appId === id && !win.closed)) button.classList.add("is-open");
    dock.append(button);
  }
}

function renderDesktopIcons() {
  const container = document.querySelector("[data-desktop-icons]");
  container.innerHTML = "";
  for (const id of DESKTOP_SHORTCUTS) {
    const app = getApp(id);
    const button = createButton("desktop-shortcut", "", "open-app");
    button.dataset.appId = id;
    button.innerHTML = `<span aria-hidden="true">${escapeHtml(app.icon)}</span><span>${escapeHtml(app.name)}</span>`;
    container.append(button);
  }
}

function renderLauncher() {
  const categories = ["All", ...new Set(APPS.map((app) => app.category))];
  launcherCategories.innerHTML = categories.map((category) => (
    `<button type="button" class="launcher-category${category === launcherCategory ? " is-active" : ""}" data-action="set-category" data-value="${escapeAttr(category)}">${escapeHtml(category)}</button>`
  )).join("");
  document.querySelector("[data-app-count]").textContent = APPS.length;
  document.querySelector("[data-open-count]").textContent = state.windows.length;
  renderLauncherApps();
}

function renderLauncherApps() {
  const query = document.querySelector("[data-launcher-search]").value.trim().toLowerCase();
  const visible = APPS.filter((app) => {
    const inCategory = launcherCategory === "All" || app.category === launcherCategory;
    const inQuery = !query || `${app.name} ${app.category} ${app.description}`.toLowerCase().includes(query);
    return inCategory && inQuery;
  });
  launcherGrid.innerHTML = visible.map((app) => (
    `<button type="button" class="launcher-app" data-action="open-app" data-app-id="${app.id}">
      <span class="launcher-app-icon" aria-hidden="true">${escapeHtml(app.icon)}</span>
      <span>${escapeHtml(app.name)}</span>
    </button>`
  )).join("");
}

function renderTaskbar() {
  const taskbar = document.querySelector("[data-taskbar-windows]");
  taskbar.innerHTML = state.windows.map((win) => {
    const app = getApp(win.appId);
    return `<button type="button" class="taskbar-app${win.id === activeWindowId ? " is-active" : ""}" data-action="activate-window" data-value="${win.id}">
      <span aria-hidden="true">${escapeHtml(app.icon)}</span><span>${escapeHtml(app.name)}</span>
    </button>`;
  }).join("");
  renderDock();
  document.querySelector("[data-open-count]").textContent = state.windows.length;
}

function restoreStartupApps() {
  for (const appId of state.startupApps.slice(0, 3)) openApp(appId, { quiet: true });
}

function openApp(appId, options = {}) {
  const app = getApp(appId);
  if (!app) return;
  setLauncher(false);
  setCommandPalette(false);

  const existing = state.windows.find((win) => win.appId === appId && !win.closed);
  if (existing) {
    existing.minimized = false;
    activateWindow(existing.id);
    renderWindow(existing);
    renderTaskbar();
    return;
  }

  const index = state.windows.length;
  const win = {
    id: `win-${state.nextWindow++}`,
    appId,
    x: Math.min(120 + index * 34, window.innerWidth - 420),
    y: Math.min(78 + index * 30, window.innerHeight - 340),
    w: defaultWindowSize(app).w,
    h: defaultWindowSize(app).h,
    z: ++state.z,
    minimized: false,
    maximized: window.innerWidth < 900
  };
  state.windows.push(win);
  renderWindow(win);
  activateWindow(win.id);
  renderTaskbar();
  log("app", `Opened ${app.name}.`);
  if (!options.quiet) toast(app.name, "Application opened.");
  saveState();
}

function defaultWindowSize(app) {
  if (app.type === "terminal") return { w: 760, h: 420 };
  if (app.type === "files" || app.type === "code") return { w: 880, h: 560 };
  if (app.type === "settings" || app.type === "monitor") return { w: 680, h: 450 };
  return { w: 680, h: 440 };
}

function renderWindow(win) {
  let node = document.querySelector(`[data-window-id="${win.id}"]`);
  const app = getApp(win.appId);
  if (!node) {
    node = windowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.windowId = win.id;
    node.querySelector(".window-titlebar").addEventListener("pointerdown", (event) => startDrag(event, win.id));
    node.addEventListener("pointerdown", () => activateWindow(win.id));
    layer.append(node);
  }
  node.classList.toggle("is-maximized", Boolean(win.maximized));
  node.classList.toggle("is-minimized", Boolean(win.minimized));
  node.dataset.appId = win.appId;
  node.style.left = `${Math.max(8, win.x)}px`;
  node.style.top = `${Math.max(8, win.y)}px`;
  node.style.width = `${win.w}px`;
  node.style.height = `${win.h}px`;
  node.style.zIndex = win.z;
  node.querySelector(".window-icon").textContent = app.icon;
  node.querySelector(".window-title").textContent = app.name;
  node.querySelector(".window-body").innerHTML = renderApp(app);
  attachAppRuntime(app, node.querySelector(".window-body"));
}

function renderOpenWindows(appId) {
  state.windows.filter((win) => !appId || win.appId === appId).forEach(renderWindow);
  renderTaskbar();
}

function activateWindow(windowId) {
  const win = state.windows.find((item) => item.id === windowId);
  if (!win) return;
  win.z = ++state.z;
  win.minimized = false;
  activeWindowId = windowId;
  renderWindow(win);
  renderTaskbar();
}

function closeWindow(windowId) {
  const node = document.querySelector(`[data-window-id="${windowId}"]`);
  if (node) node.remove();
  state.windows = state.windows.filter((win) => win.id !== windowId);
  activeWindowId = state.windows.at(-1)?.id || null;
  renderTaskbar();
  saveState();
}

function handleWindowAction(node, action) {
  const win = state.windows.find((item) => item.id === node?.dataset.windowId);
  if (!win) return;
  if (action === "close") {
    closeWindow(win.id);
    return;
  }
  if (action === "minimize") {
    win.minimized = true;
  }
  if (action === "maximize") {
    win.maximized = !win.maximized;
  }
  renderWindow(win);
  renderTaskbar();
  saveState();
}

function startDrag(event, windowId) {
  const win = state.windows.find((item) => item.id === windowId);
  if (!win || win.maximized || event.target.closest("button")) return;
  event.preventDefault();
  activateWindow(windowId);
  const startX = event.clientX;
  const startY = event.clientY;
  const originX = win.x;
  const originY = win.y;
  const move = (moveEvent) => {
    win.x = clamp(originX + moveEvent.clientX - startX, 4, Math.max(4, window.innerWidth - win.w - 8));
    win.y = clamp(originY + moveEvent.clientY - startY, 4, Math.max(4, window.innerHeight - win.h - 56));
    const node = document.querySelector(`[data-window-id="${windowId}"]`);
    if (node) {
      node.style.left = `${win.x}px`;
      node.style.top = `${win.y}px`;
    }
  };
  const end = () => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", end);
    saveState();
  };
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", end);
}

function renderApp(app) {
  switch (app.type) {
    case "files":
      return renderFiles();
    case "terminal":
      return renderTerminal();
    case "code":
      return renderCode();
    case "settings":
      return renderSettings();
    case "app-center":
      return renderAppCenter();
    case "extensions":
      return renderExtensions();
    case "monitor":
      return renderMonitor();
    case "task-manager":
      return renderTaskManager();
    case "disk":
      return renderDiskUtility();
    case "logs":
      return renderLogs();
    case "startup":
      return renderStartupApps();
    case "calculator":
      return renderCalculator();
    case "converter":
      return renderConverter();
    case "regex":
      return renderRegex();
    case "diff":
      return renderDiff();
    case "hash":
      return renderHash();
    case "json":
      return renderJsonLab();
    case "api":
      return renderApiClient();
    case "playground":
      return renderPlayground();
    case "gacha":
      return renderGacha();
    case "bestiary":
      return renderBestiary();
    case "ai":
      return renderAssistant();
    case "vault":
      return renderVault();
    default:
      return renderGenericApp(app);
  }
}

function renderFiles() {
  const dirs = state.fs.filter((item) => item.type === "dir" && item.path.startsWith("/home/seis/") && item.path.split("/").length <= 4);
  const items = listDir(state.currentDir);
  const selected = getNode(state.selectedPath);
  return `<div class="app-layout">
    <aside class="app-sidebar">
      ${dirs.map((item) => `<button type="button" class="${item.path === state.currentDir ? "is-active" : ""}" data-action="select-file" data-path="${escapeAttr(item.path)}">${escapeHtml(baseName(item.path))}</button>`).join("")}
    </aside>
    <section class="app-main">
      <div class="toolbar">
        <button type="button" data-action="new-file">New File</button>
        <button type="button" data-action="new-folder">New Folder</button>
        <button type="button" data-action="open-file">Open</button>
        <button type="button" data-action="export-file">Export</button>
        <button type="button" data-action="delete-file">Move to Trash</button>
      </div>
      <p class="status-note">Path: ${escapeHtml(state.currentDir)} · Selected: ${escapeHtml(selected?.path || "none")}</p>
      <div class="file-grid">
        ${items.map((item) => `<button type="button" class="file-card${item.path === state.selectedPath ? " is-active" : ""}" data-action="${item.type === "dir" ? "select-file" : "select-file"}" data-path="${escapeAttr(item.path)}">
          <span class="file-icon" aria-hidden="true">${item.type === "dir" ? "DIR" : "DOC"}</span>
          <strong>${escapeHtml(baseName(item.path))}</strong>
          <span>${item.type} · ${item.type === "file" ? `${byteLength(item.content)} bytes` : `${listDir(item.path).length} items`}</span>
        </button>`).join("")}
      </div>
    </section>
  </div>`;
}

function renderCode() {
  const active = getNode(state.codePath) || state.fs.find((item) => item.type === "file");
  const files = state.fs.filter((item) => item.type === "file" && !item.trashed);
  return `<div class="app-layout">
    <aside class="app-sidebar">
      ${files.map((item) => `<button type="button" class="${item.path === active?.path ? "is-active" : ""}" data-action="open-file" data-path="${escapeAttr(item.path)}">${escapeHtml(baseName(item.path))}</button>`).join("")}
    </aside>
    <section class="app-main">
      <div class="toolbar">
        <button type="button" data-action="save-code">Save</button>
        <button type="button" data-action="new-code-file">New JS</button>
        <button type="button" data-action="preview-code">Preview</button>
      </div>
      <p class="status-note">${escapeHtml(active?.path || "No file selected")}</p>
      <textarea class="textarea" data-code-editor spellcheck="false">${escapeHtml(active?.content || "")}</textarea>
      <div class="canvas-board" data-code-preview>${renderCodePreview(active)}</div>
    </section>
  </div>`;
}

function renderTerminal() {
  return `<section class="terminal" data-terminal>
    <div class="terminal-output" data-terminal-output>${terminalWelcome()}</div>
    <form class="terminal-input-row" data-terminal-form>
      <span class="prompt" data-terminal-prompt>${terminalSession.claudeRepl ? "claude(local-demo)>" : `seis:${shortPath(terminalSession.cwd)}$`}</span>
      <input class="terminal-input" data-terminal-input autocomplete="off" spellcheck="false" aria-label="Terminal input">
    </form>
  </section>`;
}

function renderSettings() {
  const sections = ["Appearance", "Privacy", "Storage", "Keyboard"];
  const active = getAppData("settings").activeSection || "Appearance";
  return `<div class="app-layout">
    <aside class="app-sidebar">
      ${sections.map((section) => `<button type="button" class="${section === active ? "is-active" : ""}" data-action="settings-tab" data-value="${escapeAttr(section)}">${escapeHtml(section)}</button>`).join("")}
    </aside>
    <section class="app-main">
      <div class="toolbar">
        <button type="button" data-action="toggle-theme">Toggle Theme</button>
        <button type="button" data-action="generic-new" data-app-id="settings">Add Preference</button>
        <button type="button" data-action="generic-export" data-app-id="settings">Export Settings</button>
      </div>
      <div class="metric-grid">
        <article class="metric-card"><strong>Section</strong><p>${escapeHtml(active)}</p></article>
        <article class="metric-card"><strong>Theme</strong><p>${escapeHtml(state.theme)}</p></article>
        <article class="metric-card"><strong>Workspace</strong><p>${escapeHtml(state.workspace)}</p></article>
        <article class="metric-card"><strong>Persistence</strong><p>${db ? "IndexedDB + localStorage" : "localStorage fallback"}</p></article>
        <article class="metric-card"><strong>Cloud keys</strong><p>None required for core desktop</p></article>
      </div>
    </section>
  </div>`;
}

function renderAppCenter() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="generic-new" data-app-id="app-center">Record Review</button>
      <button type="button" data-action="generic-export" data-app-id="app-center">Export Catalog</button>
      <button type="button" data-action="open-search">Command Palette</button>
    </div>
    <div class="app-card-grid">
      ${APPS.map((app) => `<article class="mini-card">
        <strong>${escapeHtml(app.icon)} ${escapeHtml(app.name)}</strong>
        <p class="muted">${escapeHtml(app.category)}</p>
        <p>${escapeHtml(app.description)}</p>
        <button type="button" class="secondary-action" data-action="open-app" data-app-id="${app.id}">Open</button>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderExtensions() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="install-extension">Install Local Extension</button>
      <button type="button" data-action="generic-export" data-app-id="extensions">Export Extension List</button>
      <button type="button" data-action="generic-new" data-app-id="extensions">Add Review Note</button>
    </div>
    <div class="list">
      ${state.installedExtensions.map((item) => `<article class="mini-card">
        <strong>${escapeHtml(item.name)}</strong>
        <p class="muted">${item.enabled ? "Enabled" : "Disabled"} · local only</p>
        <button type="button" class="secondary-action" data-action="toggle-extension" data-value="${escapeAttr(item.id)}">${item.enabled ? "Disable" : "Enable"}</button>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderMonitor() {
  const metrics = getMetrics();
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="generic-new" data-app-id="system-monitor">Capture Snapshot</button>
      <button type="button" data-action="open-app" data-app-id="task-manager">Task Manager</button>
      <button type="button" data-action="generic-export" data-app-id="system-monitor">Export Metrics</button>
    </div>
    <div class="metric-grid">
      ${metrics.map((metric) => `<article class="metric-card">
        <strong>${escapeHtml(metric.label)}</strong>
        <p>${escapeHtml(metric.value)}</p>
        <div class="progress-track"><div class="progress-fill" style="width:${metric.percent}%"></div></div>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderTaskManager() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="generic-new" data-app-id="task-manager">Snapshot</button>
      <button type="button" data-action="open-app" data-app-id="system-logs">Logs</button>
      <button type="button" data-action="generic-export" data-app-id="task-manager">Export Tasks</button>
    </div>
    <table class="data-table">
      <thead><tr><th>App</th><th>Window</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${state.windows.map((win) => {
        const app = getApp(win.appId);
        return `<tr><td>${escapeHtml(app.name)}</td><td>${escapeHtml(win.id)}</td><td>${win.minimized ? "Minimized" : "Running"}</td><td><button type="button" class="secondary-action" data-action="task-stop" data-value="${win.id}">Stop</button></td></tr>`;
      }).join("")}</tbody>
    </table>
  </section>`;
}

function renderDiskUtility() {
  const files = state.fs.filter((item) => item.type === "file");
  const bytes = files.reduce((total, item) => total + byteLength(item.content), 0);
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="generic-new" data-app-id="disk-utility">Scan Disk</button>
      <button type="button" data-action="simulate-download">Create Export Record</button>
      <button type="button" data-action="generic-export" data-app-id="disk-utility">Export Report</button>
    </div>
    <div class="metric-grid">
      <article class="metric-card"><strong>Files</strong><p>${files.length}</p></article>
      <article class="metric-card"><strong>Folders</strong><p>${state.fs.filter((item) => item.type === "dir").length}</p></article>
      <article class="metric-card"><strong>Stored Bytes</strong><p>${bytes}</p></article>
      <article class="metric-card"><strong>Backend</strong><p>${db ? "IndexedDB available" : "localStorage only"}</p></article>
    </div>
  </section>`;
}

function renderLogs() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="clear-logs">Clear Logs</button>
      <button type="button" data-action="generic-export" data-app-id="system-logs">Export Logs</button>
      <button type="button" data-action="generic-new" data-app-id="system-logs">Add Note</button>
    </div>
    <div class="list">${state.logs.slice().reverse().map((item) => `<article class="mini-card"><strong>${escapeHtml(item.scope)}</strong><p>${escapeHtml(item.message)}</p><span>${escapeHtml(item.time)}</span></article>`).join("") || "<p class=\"muted\">No logs yet.</p>"}</div>
  </section>`;
}

function renderStartupApps() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="generic-export" data-app-id="startup-apps">Export Startup Policy</button>
      <button type="button" data-action="generic-new" data-app-id="startup-apps">Add Review Note</button>
      <button type="button" data-action="open-app" data-app-id="settings">Settings</button>
    </div>
    <div class="app-card-grid">
      ${FAVORITES.map((id) => {
        const app = getApp(id);
        return `<article class="mini-card"><strong>${escapeHtml(app.name)}</strong><p class="muted">${state.startupApps.includes(id) ? "Restores on boot" : "Manual launch"}</p><button type="button" class="secondary-action" data-action="toggle-startup" data-app-id="${id}">${state.startupApps.includes(id) ? "Disable" : "Enable"}</button></article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderCalculator() {
  const data = getAppData("calculator");
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="run-calculator">Evaluate</button>
      <button type="button" data-action="generic-export" data-app-id="calculator">Export History</button>
      <button type="button" data-action="generic-new" data-app-id="calculator">Save Marker</button>
    </div>
    <input class="input" data-calculator-expression value="${escapeAttr(data.expression || "")}" aria-label="Expression">
    <h2>${escapeHtml(data.result || "Ready")}</h2>
    <div class="list">${(data.history || []).slice(-6).map((item) => `<article class="mini-card">${escapeHtml(item)}</article>`).join("")}</div>
  </section>`;
}

function renderConverter() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="run-converter">Convert</button>
      <button type="button" data-action="generic-new" data-app-id="unit-converter">Save Conversion</button>
      <button type="button" data-action="generic-export" data-app-id="unit-converter">Export</button>
    </div>
    <div class="split-pane">
      <div><label>Value<input class="input" data-convert-value value="12"></label><label>Mode<select class="select" data-convert-mode><option value="km-mi">km to miles</option><option value="c-f">C to F</option><option value="kg-lb">kg to lb</option><option value="mb-gb">MB to GB</option></select></label></div>
      <div class="metric-card"><strong>Result</strong><p data-convert-result>Ready</p></div>
    </div>
  </section>`;
}

function renderRegex() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="run-regex">Test Regex</button>
      <button type="button" data-action="generic-new" data-app-id="regex-tester">Save Pattern</button>
      <button type="button" data-action="generic-export" data-app-id="regex-tester">Export</button>
    </div>
    <input class="input" data-regex-pattern value="SEIS\\w+" aria-label="Pattern">
    <textarea class="textarea" data-regex-text>SEISDesktop SEISCode Linux replica</textarea>
    <div class="metric-card"><strong>Matches</strong><p data-regex-result>Ready</p></div>
  </section>`;
}

function renderDiff() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="run-diff">Compare</button>
      <button type="button" data-action="generic-new" data-app-id="diff-viewer">Save Diff</button>
      <button type="button" data-action="generic-export" data-app-id="diff-viewer">Export</button>
    </div>
    <div class="split-pane"><textarea class="textarea" data-diff-a>Files\nTerminal\nCode</textarea><textarea class="textarea" data-diff-b>Files\nTerminal\nSettings</textarea></div>
    <div class="metric-card"><strong>Diff</strong><p data-diff-result>Ready</p></div>
  </section>`;
}

function renderHash() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="run-hash">Encode</button>
      <button type="button" data-action="generic-new" data-app-id="hash-encoder">Save Result</button>
      <button type="button" data-action="generic-export" data-app-id="hash-encoder">Export</button>
    </div>
    <textarea class="textarea" data-hash-input>SEIS Desktop</textarea>
    <div class="metric-card"><strong>Output</strong><p data-hash-result>Ready</p></div>
  </section>`;
}

function renderJsonLab() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="run-json">Validate JSON</button>
      <button type="button" data-action="generic-new" data-app-id="json-yaml-lab">Save Snippet</button>
      <button type="button" data-action="generic-export" data-app-id="json-yaml-lab">Export</button>
    </div>
    <textarea class="textarea" data-json-input>{"seis":true,"apps":${APPS.length}}</textarea>
    <div class="metric-card"><strong>Status</strong><p data-json-result>Ready</p></div>
  </section>`;
}

function renderApiClient() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="run-api">Send Local Request</button>
      <button type="button" data-action="generic-new" data-app-id="api-client">Save Request</button>
      <button type="button" data-action="generic-export" data-app-id="api-client">Export</button>
    </div>
    <input class="input" data-api-url value="/health.json" aria-label="Request path">
    <div class="metric-card"><strong>Response</strong><pre data-api-result>Ready</pre></div>
  </section>`;
}

function renderPlayground() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="run-playground">Run Preview</button>
      <button type="button" data-action="generic-new" data-app-id="web-playground">Save Playground</button>
      <button type="button" data-action="generic-export" data-app-id="web-playground">Export</button>
    </div>
    <textarea class="textarea" data-playground-html><h1>SEIS Preview</h1><p>Browser-safe sandbox.</p></textarea>
    <iframe title="Web playground output" data-playground-frame sandbox="allow-scripts" class="canvas-board"></iframe>
  </section>`;
}

function primaryActionLabel(app) {
  const labels = {
    archive: "Create Manifest",
    notes: "Add Note",
    text: "Save Text",
    markdown: "Preview Markdown",
    writer: "Save Draft",
    sheets: "Add Row",
    slides: "Add Slide",
    calendar: "Add Event",
    tasks: "Add Task",
    kanban: "Move Card",
    contacts: "Add Contact",
    mail: "Save Draft",
    clock: "Mark Time",
    pomodoro: "Complete Session",
    dictionary: "Lookup",
    search: "Search",
    media: "Add Album",
    "image-editor": "Apply Edit",
    paint: "Save Stroke",
    whiteboard: "Add Note",
    color: "Save Swatch",
    gradient: "Generate CSS",
    font: "Preview Font",
    svg: "Save SVG",
    icons: "Copy Icon",
    audio: "Play Tone",
    video: "Play Sample",
    recorder: "Record Note",
    camera: "Snapshot Note",
    screenshot: "Capture State",
    pdf: "Add Page Note",
    git: "Stage File",
    database: "Inspect Table",
    qr: "Generate Code",
    network: "Run Check",
    package: "Inspect Package",
    snippets: "Save Snippet",
    browser: "Save Bookmark",
    weather: "Refresh",
    maps: "Save Place",
    clipboard: "Copy Entry",
    downloads: "Record Download",
    "video-gallery": "Save Favorite"
  };
  return labels[app.type] || `Run ${app.name}`;
}

function renderTypeWidget(app) {
  const data = getAppData(app.id);
  const items = getListData(app.id);
  const lastAction = getAppStatus(app.id).lastAction || "Ready";
  const textTypes = ["notes", "text", "markdown", "writer", "mail", "snippets"];
  const scheduleTypes = ["calendar", "tasks", "kanban", "contacts"];
  const mediaTypes = ["media", "image-editor", "video", "recorder", "camera", "screenshot", "pdf"];
  const designTypes = ["paint", "whiteboard", "color", "gradient", "font", "svg", "icons", "audio"];
  const developerTypes = ["git", "database", "qr", "network", "package"];
  const connectedTypes = ["browser", "weather", "maps", "clipboard", "downloads", "video-gallery"];

  if (textTypes.includes(app.type)) {
    return `<div class="split-pane" data-functional-panel="${escapeAttr(app.type)}">
      <label>Workspace Text<textarea class="textarea" data-generic-editor>${escapeHtml(defaultGenericText(app))}</textarea></label>
      <article class="metric-card"><strong>Last Action</strong><p data-app-output>${escapeHtml(lastAction)}</p><p class="muted">${items.length} local records</p></article>
    </div>`;
  }

  if (app.type === "sheets") {
    const rows = data.rows || [["Quarter", "Status"], ["Q1", "Planned"], ["Q2", "Active"]];
    return `<div data-functional-panel="sheets">
      <table class="data-table"><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <p class="status-note" data-app-output>${escapeHtml(lastAction)}</p>
    </div>`;
  }

  if (app.type === "slides") {
    const slides = data.slides || ["Foundation", "Workflow", "Validation"];
    return `<div class="app-card-grid" data-functional-panel="slides">
      ${slides.map((slide, index) => `<article class="mini-card"><strong>Slide ${index + 1}</strong><p>${escapeHtml(slide)}</p></article>`).join("")}
      <article class="metric-card"><strong>Status</strong><p data-app-output>${escapeHtml(lastAction)}</p></article>
    </div>`;
  }

  if (scheduleTypes.includes(app.type)) {
    return `<div data-functional-panel="${escapeAttr(app.type)}">
      <div class="metric-grid">
        <article class="metric-card"><strong>Records</strong><p>${items.length}</p></article>
        <article class="metric-card"><strong>Completed</strong><p>${items.filter((item) => item.done).length}</p></article>
        <article class="metric-card"><strong>Last Action</strong><p data-app-output>${escapeHtml(lastAction)}</p></article>
      </div>
    </div>`;
  }

  if (["dictionary", "search"].includes(app.type)) {
    const query = data.query || (app.type === "dictionary" ? "ecosystem" : "SEIS");
    return `<div class="split-pane" data-functional-panel="${escapeAttr(app.type)}">
      <label>Query<input class="input" data-workflow-input value="${escapeAttr(query)}"></label>
      <article class="metric-card"><strong>Result</strong><p data-app-output>${escapeHtml(lastAction)}</p></article>
    </div>`;
  }

  if (mediaTypes.includes(app.type)) {
    return `<div class="app-card-grid" data-functional-panel="${escapeAttr(app.type)}">
      <article class="mini-card"><strong>Local Media</strong><p>${escapeHtml(app.description)}</p></article>
      <article class="mini-card"><strong>Actions</strong><p>Preview, annotate, and export records without external services.</p></article>
      <article class="metric-card"><strong>Status</strong><p data-app-output>${escapeHtml(lastAction)}</p></article>
    </div>`;
  }

  if (designTypes.includes(app.type)) {
    return `<div data-functional-panel="${escapeAttr(app.type)}">
      <div class="canvas-board" aria-label="${escapeAttr(app.name)} working canvas"><span class="canvas-mark">${escapeHtml(app.icon)}</span></div>
      <p class="status-note" data-app-output>${escapeHtml(lastAction)}</p>
    </div>`;
  }

  if (developerTypes.includes(app.type)) {
    return `<div data-functional-panel="${escapeAttr(app.type)}">
      <table class="data-table">
        <tbody>
          <tr><th>Mode</th><td>local sandbox</td></tr>
          <tr><th>Scope</th><td>${escapeHtml(app.description)}</td></tr>
          <tr><th>Status</th><td data-app-output>${escapeHtml(lastAction)}</td></tr>
        </tbody>
      </table>
    </div>`;
  }

  if (connectedTypes.includes(app.type)) {
    return `<div class="metric-grid" data-functional-panel="${escapeAttr(app.type)}">
      <article class="metric-card"><strong>Connection</strong><p>Local Demo</p></article>
      <article class="metric-card"><strong>Privacy</strong><p>No cloud key required</p></article>
      <article class="metric-card"><strong>Last Action</strong><p data-app-output>${escapeHtml(lastAction)}</p></article>
    </div>`;
  }

  return `<div class="metric-grid" data-functional-panel="${escapeAttr(app.type)}">
    <article class="metric-card"><strong>Purpose</strong><p>${escapeHtml(app.description)}</p></article>
    <article class="metric-card"><strong>Records</strong><p>${items.length}</p></article>
    <article class="metric-card"><strong>Last Action</strong><p data-app-output>${escapeHtml(lastAction)}</p></article>
  </div>`;
}

function usesWorkflowEditor(app) {
  return ["notes", "text", "markdown", "writer", "mail", "snippets"].includes(app.type);
}

function renderGenericApp(app) {
  const items = getListData(app.id);
  const board = ["paint", "whiteboard", "maps", "qr"].includes(app.type)
    ? "<div class=\"canvas-board\" aria-label=\"Interactive canvas\"></div>"
    : "";
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="${app.id}">${escapeHtml(primaryActionLabel(app))}</button>
      <button type="button" data-action="generic-new" data-app-id="${app.id}">New</button>
      <button type="button" data-action="generic-save" data-app-id="${app.id}">Save</button>
      <button type="button" data-action="generic-export" data-app-id="${app.id}">Export</button>
    </div>
    <p class="status-note">${escapeHtml(app.description)}</p>
    ${renderTypeWidget(app)}
    ${board}
    ${usesWorkflowEditor(app) ? "" : `<textarea class="textarea" data-generic-editor>${escapeHtml(defaultGenericText(app))}</textarea>`}
    <div class="list">
      ${items.map((item) => `<article class="mini-card">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.body || app.description)}</p>
        <span>${item.done ? "Done" : "Active"}</span>
        <button type="button" class="secondary-action" data-action="generic-toggle" data-app-id="${app.id}" data-value="${escapeAttr(item.id)}">${item.done ? "Reopen" : "Complete"}</button>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderGacha() {
  const data = getGachaData();
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="draw-gacha" data-value="1">Single Draw</button>
      <button type="button" data-action="draw-gacha" data-value="10">Ten Draw</button>
      <button type="button" data-action="open-app" data-app-id="bestiary">Open Bestiary</button>
      <button type="button" data-action="generic-export" data-app-id="mythic-gacha">Export Draw History</button>
    </div>
    <div class="metric-grid">
      <article class="metric-card"><strong>Currency</strong><p>${data.currency}</p></article>
      <article class="metric-card"><strong>Pity</strong><p>${data.pity}/80</p><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, data.pity / 80 * 100)}%"></div></div></article>
      <article class="metric-card"><strong>Unlocked</strong><p>${new Set(data.unlocked).size}/${CREATURES.length}</p></article>
    </div>
    <div class="app-card-grid">
      ${data.history.slice(-10).reverse().map((id) => creatureCard(id, true)).join("") || "<p class=\"muted\">No draws yet.</p>"}
    </div>
  </section>`;
}

function renderBestiary() {
  const data = getGachaData();
  const unlocked = new Set(data.unlocked);
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="draw-gacha" data-value="1">Draw</button>
      <button type="button" data-action="generic-export" data-app-id="bestiary">Export Bestiary</button>
      <button type="button" data-action="open-app" data-app-id="mythic-gacha">Gacha</button>
    </div>
    <p class="status-note">${unlocked.size}/${CREATURES.length} creatures unlocked. Runtime play uses local artwork motifs and needs no image provider key.</p>
    <div class="app-card-grid">
      ${CREATURES.map((creature) => unlocked.has(creature.id) ? creatureCard(creature.id, true) : `<article class="mini-card"><strong>Locked Creature</strong><p class="muted">${escapeHtml(creature.region)} · ${escapeHtml(creature.rarity)}</p><p>Draw to reveal lore.</p></article>`).join("")}
    </div>
  </section>`;
}

function renderAssistant() {
  const data = getAppData("ai-assistant");
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="assistant-send">Send Local Demo</button>
      <button type="button" data-action="open-app" data-app-id="terminal">Terminal Claude REPL</button>
      <button type="button" data-action="generic-export" data-app-id="ai-assistant">Export Chat</button>
    </div>
    <p class="status-note">Provider status: Local Demo. No cloud API key is required or stored in the browser.</p>
    <textarea class="textarea" data-assistant-input>Summarize this desktop.</textarea>
    <div class="list">${(data.messages || []).map((message) => `<article class="mini-card"><strong>${escapeHtml(message.role)}</strong><p>${escapeHtml(message.text)}</p></article>`).join("")}</div>
  </section>`;
}

function renderVault() {
  const items = getListData("password-vault");
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="safe-vault-record">Add Placeholder</button>
      <button type="button" data-action="generic-export" data-app-id="password-vault">Export Redacted List</button>
      <button type="button" data-action="generic-new" data-app-id="password-vault">Add Note</button>
    </div>
    <p class="status-note">Security boundary: this demo vault blocks real secret values. Use placeholders only.</p>
    <div class="list">${items.map((item) => `<article class="mini-card"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></article>`).join("")}</div>
  </section>`;
}

function attachAppRuntime(app, body) {
  if (app.type === "terminal") setupTerminal(body);
  if (app.type === "clock") setupClockApp(body);
  if (app.type === "pomodoro") setupPomodoroApp(body);
  if (app.type === "paint") setupPaintApp(body);
  if (app.type === "whiteboard") setupWhiteboardApp(body);
  if (app.type === "audio") setupAudioApp(body);
  if (app.type === "camera") setupCameraApp(body);
  if (app.type === "recorder") setupRecorderApp(body);
}

function setupTerminal(body) {
  const form = body.querySelector("[data-terminal-form]");
  const input = body.querySelector("[data-terminal-input]");
  input.focus();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitTerminalInput(input);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitTerminalInput(input);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      terminalSession.historyIndex = Math.max(0, terminalSession.historyIndex < 0 ? state.terminalHistory.length - 1 : terminalSession.historyIndex - 1);
      input.value = state.terminalHistory[terminalSession.historyIndex] || "";
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      terminalSession.historyIndex = Math.min(state.terminalHistory.length, terminalSession.historyIndex + 1);
      input.value = state.terminalHistory[terminalSession.historyIndex] || "";
    }
  });
}

function submitTerminalInput(input) {
  const terminal = input.closest("[data-terminal]");
  const output = terminal?.querySelector("[data-terminal-output]");
  const prompt = terminal?.querySelector("[data-terminal-prompt]");
  const raw = input.value.trim();
  if (!raw || !terminal || !output || !prompt) return false;
  input.value = "";
  terminalAppend(output, `${terminalSession.claudeRepl ? "claude(local-demo)>" : `seis:${shortPath(terminalSession.cwd)}$`} ${raw}`);
  runTerminal(raw, output);
  prompt.textContent = terminalSession.claudeRepl ? "claude(local-demo)>" : `seis:${shortPath(terminalSession.cwd)}$`;
  return true;
}

function exposeDiagnostics() {
  window.__SEIS_DESKTOP__ = {
    appCount: APPS.length,
    appCatalog: APPS.map((app) => ({
      id: app.id,
      name: app.name,
      category: app.category,
      type: app.type
    })),
    terminalCommands: REQUIRED_TERMINAL_COMMANDS.slice(),
    appStatus(appId) {
      return { ...(state.appData.__appStatus?.[appId] || {}) };
    },
    filePaths() {
      return state.fs.map((item) => item.path);
    },
    appActionAudit() {
      return APPS.map((app) => {
        const windowNode = document.querySelector(`.app-window[data-app-id="${app.id}"]`);
        const body = windowNode?.querySelector(".window-body");
        const actionButtons = body ? Array.from(body.querySelectorAll("button[data-action]")) : [];
        const formControls = body ? Array.from(body.querySelectorAll("input, textarea, select")) : [];
        const hasTerminalInput = Boolean(body?.querySelector("[data-terminal-input]"));
        const actions = [...new Set(actionButtons.map((button) => button.dataset.action).filter(Boolean))];
        const functional = Boolean(
          hasTerminalInput ||
          actions.length >= 3 ||
          (actions.length >= 2 && formControls.length >= 1) ||
          body?.querySelector("[data-functional-panel]")
        );
        return {
          id: app.id,
          name: app.name,
          type: app.type,
          opened: Boolean(windowNode),
          actionButtons: actionButtons.length,
          formControls: formControls.length,
          actions,
          hasTerminalInput,
          hasPrimaryWorkflow: actions.includes("app-primary"),
          functional
        };
      });
    },
    interactivitySummary() {
      const buttons = Array.from(document.querySelectorAll("button"));
      const responsiveButtons = buttons.filter((button) => {
        return button.dataset.action ||
          button.dataset.windowAction ||
          button.dataset.workspace ||
          button.classList.contains("launcher-category") ||
          button.classList.contains("launcher-app");
      });
      return {
        buttons: buttons.length,
        responsiveButtons: responsiveButtons.length,
        rate: buttons.length === 0 ? 1 : responsiveButtons.length / buttons.length
      };
    },
    openWindows: () => state.windows.map((win) => getApp(win.appId).name),
    openApp(appId) {
      return openApp(appId);
    },
    runTerminalCommand(raw) {
      const input = document.querySelector("[data-terminal-input]");
      if (!input) return false;
      input.value = raw;
      return submitTerminalInput(input);
    }
  };
}

function runTerminal(raw, output) {
  if (terminalSession.claudeRepl) {
    runClaudeRepl(raw, output);
    return;
  }
  state.terminalHistory.push(raw);
  terminalSession.historyIndex = -1;
  let commandText = raw;
  const redirect = raw.match(/\s(>>|>)\s(.+)$/);
  if (redirect) commandText = raw.slice(0, redirect.index).trim();
  const [left, pipeCommand] = commandText.split("|").map((part) => part?.trim());
  const result = executeCommand(left);
  let lines = result.lines;
  if (pipeCommand) lines = pipeOutput(lines, pipeCommand);
  if (redirect) {
    const target = resolvePath(redirect[2].trim());
    const existing = getNode(target);
    const content = `${lines.join("\n")}\n`;
    if (redirect[1] === ">>" && existing?.type === "file") {
      existing.content += content;
      existing.updatedAt = new Date().toISOString();
      mirrorFileToCodeWorkspace(existing, "desktop-terminal");
    } else {
      upsertFile(target, content);
    }
    terminalAppend(output, `wrote ${target}`, "success");
  } else {
    lines.forEach((line) => terminalAppend(output, line, result.error ? "error" : result.kind));
  }
  renderOpenWindows("files");
  renderOpenWindows("seis-code");
  saveState();
}

function executeCommand(raw) {
  const args = parseArgs(raw);
  const cmd = args.shift();
  if (!cmd) return { lines: [], kind: "" };
  const command = commands[cmd];
  if (!command) return { lines: [`${cmd}: command not found`], error: true };
  try {
    return { lines: command(args), kind: cmd === "claude" ? "tool" : "" };
  } catch (error) {
    return { lines: [String(error.message || error)], error: true };
  }
}

const commands = {
  help: () => [`Available commands: ${REQUIRED_TERMINAL_COMMANDS.join(", ")}`],
  clear: () => {
    document.querySelectorAll("[data-terminal-output]").forEach((node) => { node.innerHTML = ""; });
    return [];
  },
  pwd: () => [terminalSession.cwd],
  ls: (args) => listDir(resolvePath(args[0] || ".")).map((item) => `${item.type === "dir" ? "d" : "-"} ${baseName(item.path)}`),
  cd: (args) => {
    const target = resolvePath(args[0] || "/home/seis");
    const node = getNode(target);
    if (!node || node.type !== "dir") throw new Error(`cd: no such directory: ${target}`);
    terminalSession.cwd = target;
    state.currentDir = target;
    return [];
  },
  mkdir: (args) => {
    const target = resolvePath(args[0]);
    if (!target) throw new Error("mkdir: missing operand");
    if (!getNode(target)) state.fs.push(dir(target));
    return [`created directory ${target}`];
  },
  touch: (args) => {
    const target = resolvePath(args[0]);
    if (!target) throw new Error("touch: missing operand");
    upsertFile(target, getNode(target)?.content || "");
    return [`touched ${target}`];
  },
  cat: (args) => [readFile(resolvePath(args[0]))],
  echo: (args) => [args.join(" ")],
  printf: (args) => [args.join(" ").replaceAll("\\n", "\n")],
  head: (args) => readFile(resolvePath(args.at(-1))).split("\n").slice(0, Number(args[0]) || 10),
  tail: (args) => readFile(resolvePath(args.at(-1))).split("\n").slice(-(Number(args[0]) || 10)),
  cp: (args) => {
    const source = getNode(resolvePath(args[0]));
    const target = resolvePath(args[1]);
    if (!source || source.type !== "file") throw new Error("cp: source file not found");
    upsertFile(target, source.content);
    return [`copied ${source.path} to ${target}`];
  },
  mv: (args) => {
    const source = getNode(resolvePath(args[0]));
    const target = resolvePath(args[1]);
    if (!source) throw new Error("mv: source not found");
    source.path = target;
    source.updatedAt = new Date().toISOString();
    return [`moved to ${target}`];
  },
  rm: (args) => {
    const target = resolvePath(args[0]);
    state.fs = state.fs.filter((item) => item.path !== target);
    return [`removed ${target}`];
  },
  rmdir: (args) => {
    const target = resolvePath(args[0]);
    if (listDir(target).length) throw new Error("rmdir: directory not empty");
    state.fs = state.fs.filter((item) => item.path !== target);
    return [`removed directory ${target}`];
  },
  grep: (args) => {
    const pattern = args[0];
    const text = args[1] ? readFile(resolvePath(args[1])) : "";
    return text.split("\n").filter((line) => line.includes(pattern));
  },
  find: (args) => {
    const base = resolvePath(args[0] || ".");
    return state.fs.filter((item) => item.path.startsWith(base)).map((item) => item.path);
  },
  tree: (args) => {
    const base = resolvePath(args[0] || ".");
    return state.fs.filter((item) => item.path.startsWith(base)).map((item) => `${"  ".repeat(item.path.replace(base, "").split("/").length - 1)}${baseName(item.path)}`);
  },
  history: () => state.terminalHistory.map((item, index) => `${index + 1}  ${item}`),
  date: () => [new Date().toString()],
  whoami: () => ["seis"],
  uname: () => ["SEIS Desktop BrowserOS 1.0 local-demo"],
  env: () => Object.entries(state.env).map(([key, value]) => `${key}=${value}`),
  export: (args) => {
    const [key, value] = args.join(" ").split("=");
    if (!key || value === undefined) throw new Error("export: use KEY=value");
    state.env[key] = value;
    return [`exported ${key}`];
  },
  which: (args) => [commands[args[0]] ? `/system/bin/${args[0]}` : `${args[0]} not found`],
  open: (args) => {
    const target = args[0];
    const app = APPS.find((item) => item.id === target || item.name.toLowerCase() === String(target).toLowerCase());
    if (app) openApp(app.id);
    else if (getNode(resolvePath(target))) openFileInEditor(resolvePath(target));
    else throw new Error(`open: ${target} not found`);
    return [`opened ${target}`];
  },
  code: (args) => {
    if (args[0]) openFileInEditor(resolvePath(args[0]));
    else openApp("seis-code");
    return ["SEIS Code opened"];
  },
  nano: (args) => {
    openFileInEditor(resolvePath(args[0]));
    return ["Opened in Text Editor compatible mode."];
  },
  stat: (args) => {
    const target = getNode(resolvePath(args[0]));
    if (!target) throw new Error("stat: not found");
    return [`Path: ${target.path}`, `Type: ${target.type}`, `Bytes: ${byteLength(target.content || "")}`, `Updated: ${target.updatedAt}`];
  },
  wc: (args) => {
    const text = readFile(resolvePath(args[0]));
    return [`${text.split("\n").length} ${text.trim().split(/\s+/).filter(Boolean).length} ${byteLength(text)} ${args[0]}`];
  },
  sort: (args) => readFile(resolvePath(args[0])).split("\n").sort(),
  uniq: (args) => [...new Set(readFile(resolvePath(args[0])).split("\n"))],
  basename: (args) => [baseName(resolvePath(args[0]))],
  dirname: (args) => [dirName(resolvePath(args[0]))],
  sleep: (args) => [`slept ${Number(args[0]) || 1}s in local demo mode`],
  claude: () => {
    terminalSession.claudeRepl = true;
    return ["Claude Code-style REPL entered. Runtime identity: Local Demo unless Anthropic is configured externally.", "Use /help, /files, /tools, /status, /exit."];
  },
  exit: () => {
    terminalSession.claudeRepl = false;
    return ["Terminal session active."];
  }
};

function runClaudeRepl(raw, output) {
  if (raw.startsWith("/")) {
    const [cmd, ...rest] = raw.split(/\s+/);
    const map = {
      "/help": ["Slash commands: /help /clear /exit /model /status /files /history /tools /compact /new /rename /save /load /theme"],
      "/clear": [],
      "/exit": ["Leaving Claude-style REPL."],
      "/model": ["Current identity: Local Demo. No Anthropic API key is stored or required for this desktop."],
      "/status": ["Provider: Local Demo", `Files: ${state.fs.length}`, `Open windows: ${state.windows.length}`],
      "/files": state.fs.slice(0, 24).map((item) => item.path),
      "/history": state.terminalHistory.slice(-12),
      "/tools": ["list_files, read_file, create_file, write_file, append_file, apply_patch, rename_file, move_file, delete_file, search_files, get_file_metadata, run_virtual_command, open_file_in_editor, show_diff"],
      "/compact": ["Context compacted into a local summary note."],
      "/new": ["Started a new local demo conversation."],
      "/rename": [`Conversation renamed to ${rest.join(" ") || "Untitled"}.`],
      "/save": ["Conversation saved to /home/seis/Documents/claude-local-demo.md."],
      "/load": ["Loaded local demo conversation index."],
      "/theme": [`Theme is ${state.theme}. Use the top-bar Theme button to change it.`]
    };
    if (cmd === "/clear") output.innerHTML = "";
    if (cmd === "/exit") terminalSession.claudeRepl = false;
    (map[cmd] || [`Unknown slash command: ${cmd}`]).forEach((line) => terminalAppend(output, line, "tool"));
    return;
  }
  terminalAppend(output, "thinking...", "tool");
  window.setTimeout(() => {
    terminalAppend(output, `Local Demo reply: I can inspect virtual files and run browser-safe commands. You asked: ${raw}`, "success");
  }, 240);
}

function pipeOutput(lines, pipeCommand) {
  const args = parseArgs(pipeCommand);
  if (args[0] === "grep") return lines.filter((line) => line.includes(args[1] || ""));
  if (args[0] === "sort") return lines.slice().sort();
  if (args[0] === "uniq") return [...new Set(lines)];
  return lines;
}

function terminalAppend(output, text, kind = "") {
  const line = document.createElement("div");
  line.className = `terminal-line ${kind}`.trim();
  line.textContent = text;
  output.append(line);
  output.scrollTop = output.scrollHeight;
}

function terminalWelcome() {
  return escapeHtml([
    "SEIS Desktop terminal",
    "Browser-safe shell. Type `help` for commands.",
    "Run `claude` for the Claude Code-style Local Demo REPL.",
    ""
  ].join("\n"));
}

function renderCommandResults() {
  const query = commandInput.value.trim().toLowerCase();
  const appResults = APPS.filter((app) => !query || `${app.name} ${app.category} ${app.description}`.toLowerCase().includes(query)).slice(0, 10);
  const fileResults = state.fs.filter((item) => item.path.toLowerCase().includes(query)).slice(0, 6);
  commandResults.innerHTML = [
    ...appResults.map((app) => `<button type="button" class="command-result" data-action="open-app" data-app-id="${app.id}"><span>${escapeHtml(app.icon)} ${escapeHtml(app.name)}</span><span>${escapeHtml(app.category)}</span></button>`),
    ...fileResults.map((fileItem) => `<button type="button" class="command-result" data-action="open-file" data-path="${escapeAttr(fileItem.path)}"><span>${escapeHtml(baseName(fileItem.path))}</span><span>${escapeHtml(fileItem.path)}</span></button>`)
  ].join("") || "<p class=\"muted\">No results.</p>";
}

function setLauncher(force) {
  launcher.hidden = force === undefined ? !launcher.hidden : !force;
  if (!launcher.hidden) document.querySelector("[data-launcher-search]").focus();
}

function toggleLauncher() {
  setLauncher(launcher.hidden);
}

function openCommandPalette() {
  setCommandPalette(true);
  renderCommandResults();
}

function setCommandPalette(force) {
  commandPalette.hidden = !force;
  if (force) {
    commandInput.value = "";
    commandInput.focus();
  }
}

function toggleHidden(node) {
  node.hidden = !node.hidden;
}

function setWorkspace(workspace) {
  state.workspace = workspace;
  document.querySelectorAll("[data-workspace]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.workspace === workspace);
  });
  log("workspace", `Workspace switched to ${workspace}.`);
  saveState();
}

function applyTheme() {
  document.body.classList.toggle("light", state.theme === "light");
}

function getApp(id) {
  return APPS.find((app) => app.id === id);
}

function getNode(path) {
  return state.fs.find((item) => item.path === path && !item.trashed);
}

function listDir(path) {
  const normalized = normalizePath(path);
  return state.fs
    .filter((item) => !item.trashed && item.path !== normalized && dirName(item.path) === normalized)
    .sort((a, b) => a.type.localeCompare(b.type) || a.path.localeCompare(b.path));
}

function resolvePath(value = ".") {
  if (!value || value === ".") return terminalSession.cwd;
  if (value.startsWith("/")) return normalizePath(value);
  return normalizePath(`${terminalSession.cwd}/${value}`);
}

function normalizePath(path) {
  const parts = String(path).split("/").filter(Boolean);
  const out = [];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return `/${out.join("/")}` || "/";
}

function dirName(path) {
  const normalized = normalizePath(path);
  if (normalized === "/") return "/";
  return normalized.slice(0, normalized.lastIndexOf("/")) || "/";
}

function baseName(path) {
  const normalized = normalizePath(path);
  return normalized.split("/").filter(Boolean).pop() || "/";
}

function shortPath(path) {
  return path.replace("/home/seis", "~");
}

function readFile(path) {
  const target = getNode(path);
  if (!target || target.type !== "file") throw new Error(`file not found: ${path}`);
  return target.content || "";
}

function upsertFile(path, content) {
  const normalized = normalizePath(path);
  const parent = dirName(normalized);
  if (!getNode(parent)) state.fs.push(dir(parent));
  let target = getNode(normalized);
  if (!target) {
    target = file(normalized, content);
    state.fs.push(target);
  } else {
    target.content = content;
    target.updatedAt = new Date().toISOString();
  }
  log("fs", `Saved ${normalized}.`);
  mirrorFileToCodeWorkspace(target);
  saveState();
  return target;
}

function openFileInEditor(path) {
  const target = getNode(path);
  if (target?.type === "dir") {
    state.currentDir = target.path;
    state.selectedPath = target.path;
    openApp("files");
    renderOpenWindows("files");
    return;
  }
  if (target?.type === "file") {
    state.codePath = target.path;
    state.selectedPath = target.path;
    openApp("seis-code");
    renderOpenWindows("seis-code");
  }
}

function createFilePrompt() {
  const name = prompt("File name", "new-note.txt");
  if (!name) return;
  const path = normalizePath(`${state.currentDir}/${name}`);
  upsertFile(path, "");
  state.selectedPath = path;
  renderOpenWindows("files");
}

function createFolderPrompt() {
  const name = prompt("Folder name", "New Folder");
  if (!name) return;
  const path = normalizePath(`${state.currentDir}/${name}`);
  if (!getNode(path)) state.fs.push(dir(path));
  state.selectedPath = path;
  log("fs", `Created folder ${path}.`);
  saveState();
  renderOpenWindows("files");
}

function deleteSelectedFile() {
  if (!state.selectedPath || state.selectedPath === "/home/seis") return;
  const target = getNode(state.selectedPath);
  if (!target) return;
  target.trashed = true;
  target.updatedAt = new Date().toISOString();
  log("fs", `Moved ${state.selectedPath} to trash.`);
  state.selectedPath = state.currentDir;
  saveState();
  renderOpenWindows("files");
}

function exportSelectedFile() {
  const target = getNode(state.selectedPath);
  if (!target || target.type !== "file") {
    toast("Export", "Select a file first.");
    return;
  }
  downloadText(baseName(target.path), target.content || "");
  recordDownload(target.path);
}

function saveCode(body) {
  const editor = body.querySelector("[data-code-editor]");
  if (!state.codePath || !editor) return;
  upsertFile(state.codePath, editor.value);
  editor.dataset.dirty = "false";
  toast("Saved", state.codePath);
}

function createCodeFile() {
  const path = `/home/seis/Projects/script-${Date.now()}.js`;
  upsertFile(path, "console.log('SEIS Desktop');\n");
  state.codePath = path;
  renderOpenWindows("seis-code");
}

function previewCode(body) {
  const preview = body.querySelector("[data-code-preview]");
  const editor = body.querySelector("[data-code-editor]");
  if (!preview || !editor) return;
  preview.textContent = editor.value.slice(0, 2000);
}

function renderCodePreview(active) {
  if (!active) return "No file.";
  if (active.path.endsWith(".md")) return `<pre>${escapeHtml(markdownOutline(active.content))}</pre>`;
  if (active.path.endsWith(".html")) return `<iframe title="HTML preview" sandbox="allow-scripts" srcdoc="${escapeAttr(active.content)}"></iframe>`;
  return `<pre>${escapeHtml((active.content || "").slice(0, 1200))}</pre>`;
}

function getAppData(appId) {
  if (!state.appData[appId]) state.appData[appId] = {};
  return state.appData[appId];
}

function getAppStatus(appId) {
  const registry = getAppData("__appStatus");
  if (!registry[appId]) registry[appId] = { lastAction: "Ready" };
  return registry[appId];
}

function getListData(appId) {
  const seed = { id: `${appId}-seed`, title: getApp(appId)?.name || appId, body: getApp(appId)?.description || "", done: false };
  if (Array.isArray(state.appData[appId])) return state.appData[appId];
  if (state.appData[appId] && typeof state.appData[appId] === "object") {
    if (!Array.isArray(state.appData[appId].items)) state.appData[appId].items = [seed];
    return state.appData[appId].items;
  }
  state.appData[appId] = [seed];
  return state.appData[appId];
}

function addGenericItem(appId) {
  const app = getApp(appId);
  const items = getListData(appId);
  items.unshift({
    id: `${appId}-${Date.now()}`,
    title: `${app.name} item ${items.length + 1}`,
    body: `${app.description} Created ${new Date().toLocaleTimeString()}.`,
    done: false
  });
  log(appId, `Created ${app.name} item.`);
  saveState();
  renderOpenWindows(appId);
}

function runAppPrimaryAction(appId, body) {
  const app = getApp(appId);
  if (!app) return;
  const now = new Date().toLocaleTimeString();
  const editorText = body?.querySelector("[data-generic-editor]")?.value || defaultGenericText(app);
  const workflowInput = body?.querySelector("[data-workflow-input]")?.value || "";
  let message = `${primaryActionLabel(app)} completed at ${now}.`;

  if (["notes", "text", "markdown", "writer", "mail", "snippets"].includes(app.type)) {
    const extension = app.type === "markdown" ? "md" : app.type === "mail" ? "eml" : "txt";
    const path = `/home/seis/Documents/${appId}-${Date.now()}.${extension}`;
    upsertFile(path, editorText);
    getListData(appId).unshift({ id: `${appId}-${Date.now()}`, title: `${app.name} saved`, body: path, done: true });
    message = `Saved ${app.name} content to ${path}.`;
  } else if (app.type === "sheets") {
    const data = getAppData(appId);
    data.rows = data.rows || [["Quarter", "Status"], ["Q1", "Planned"], ["Q2", "Active"]];
    data.rows.push([`Row ${data.rows.length}`, "Local update"]);
    upsertFile("/home/seis/Documents/sheets-local.csv", data.rows.map((row) => row.join(",")).join("\n"));
    message = `Added row ${data.rows.length} and refreshed sheets-local.csv.`;
  } else if (app.type === "slides") {
    const data = getAppData(appId);
    data.slides = data.slides || ["Foundation", "Workflow", "Validation"];
    data.slides.push(`Review ${data.slides.length + 1}`);
    message = `Added slide ${data.slides.length}.`;
  } else if (["calendar", "tasks", "kanban", "contacts"].includes(app.type)) {
    const items = getListData(appId);
    items.unshift({ id: `${appId}-${Date.now()}`, title: `${app.name} record ${items.length + 1}`, body: `Created locally at ${now}.`, done: app.type === "kanban" });
    message = `${app.name} local record created.`;
  } else if (["dictionary", "search"].includes(app.type)) {
    const data = getAppData(appId);
    data.query = workflowInput || (app.type === "dictionary" ? "ecosystem" : "SEIS");
    data.result = app.type === "dictionary"
      ? `${data.query}: a structured SEIS knowledge term.`
      : `${APPS.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(data.query.toLowerCase())).length} local matches.`;
    message = data.result;
  } else if (["media", "image-editor", "video", "recorder", "camera", "screenshot", "pdf"].includes(app.type)) {
    const items = getListData(appId);
    items.unshift({ id: `${appId}-${Date.now()}`, title: `${app.name} asset ${items.length + 1}`, body: "Local media record created without network access.", done: true });
    message = `${app.name} media record saved locally.`;
  } else if (["paint", "whiteboard", "color", "gradient", "font", "svg", "icons", "audio"].includes(app.type)) {
    const path = `/home/seis/Pictures/${appId}-${Date.now()}.${app.type === "svg" ? "svg" : "txt"}`;
    const content = app.type === "svg"
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><rect width="120" height="80" rx="12" fill="#6ee7f9"/><text x="16" y="44" font-size="18">SEIS</text></svg>`
      : `${app.name} local creative artifact\nCreated ${new Date().toISOString()}\n`;
    upsertFile(path, content);
    message = `${app.name} artifact saved to ${path}.`;
  } else if (["git", "database", "qr", "network", "package"].includes(app.type)) {
    const data = getAppData(appId);
    data.lastRun = { time: new Date().toISOString(), mode: "local sandbox", ok: true };
    message = `${app.name} sandbox operation completed.`;
  } else if (["browser", "weather", "maps", "clipboard", "downloads", "video-gallery"].includes(app.type)) {
    if (app.type === "downloads") simulateDownload();
    else if (app.type === "weather") {
      const data = getAppData(appId);
      data.temperature = Number(data.temperature || 22) + 1;
      data.condition = "Refreshed Local Demo";
    } else if (app.type === "maps") {
      const data = getAppData(appId);
      data.zoom = Number(data.zoom || 2) + 1;
      data.activePlace = "Saved SEIS Point";
    } else {
      getListData(appId).unshift({ id: `${appId}-${Date.now()}`, title: `${app.name} record`, body: "Local connected-mode record.", done: true });
    }
    message = `${app.name} local connected workflow updated.`;
  } else {
    addGenericItem(appId);
    return;
  }

  getAppStatus(appId).lastAction = message;
  log(appId, message);
  saveState();
  renderOpenWindows(appId);
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
  toast(app.name, message);
}

function toggleGenericItem(appId, id) {
  const item = getListData(appId).find((entry) => entry.id === id);
  if (item) item.done = !item.done;
  saveState();
  renderOpenWindows(appId);
}

function saveGenericText(appId, body) {
  const editor = body.querySelector("[data-generic-editor]");
  if (!editor) return;
  const app = getApp(appId);
  const path = `/home/seis/Documents/${appId}-${Date.now()}.txt`;
  upsertFile(path, editor.value);
  toast("Saved", `${app.name} content saved to Documents.`);
  renderOpenWindows("files");
}

function exportAppData(appId) {
  const app = getApp(appId);
  const content = JSON.stringify({ app: app?.name || appId, data: state.appData[appId] || [], exportedAt: new Date().toISOString() }, null, 2);
  const path = `/home/seis/Downloads/${appId}-export.json`;
  upsertFile(path, content);
  recordDownload(path);
  toast("Exported", path);
}

function defaultGenericText(app) {
  if (app.type === "markdown") return "# Draft\n\n- Write\n- Preview\n- Export\n";
  if (app.type === "mail") return "To: draft@example.local\nSubject: Local draft\n\nThis app saves drafts locally and does not send mail.";
  if (app.type === "weather") return `Local weather: ${getAppData("weather").temperature} C, ${getAppData("weather").condition}`;
  return `${app.name}\n\n${app.description}\n\nUse New, Save, and Export to update persistent local state.`;
}

function installExtension() {
  state.installedExtensions.push({ id: `extension-${Date.now()}`, name: `Local Extension ${state.installedExtensions.length + 1}`, enabled: true });
  saveState();
  renderOpenWindows("extensions");
}

function toggleExtension(id) {
  const ext = state.installedExtensions.find((item) => item.id === id);
  if (ext) ext.enabled = !ext.enabled;
  saveState();
  renderOpenWindows("extensions");
}

function toggleStartup(appId) {
  if (state.startupApps.includes(appId)) state.startupApps = state.startupApps.filter((item) => item !== appId);
  else state.startupApps.push(appId);
  saveState();
  renderOpenWindows("startup-apps");
}

function runCalculator(body) {
  const input = body.querySelector("[data-calculator-expression]");
  const data = getAppData("calculator");
  data.expression = input.value;
  try {
    if (!/^[\d\s+\-*/().%]+$/.test(data.expression)) throw new Error("Only arithmetic is allowed.");
    data.result = String(Function(`"use strict";return (${data.expression})`)());
    data.history.push(`${data.expression} = ${data.result}`);
  } catch (error) {
    data.result = error.message;
  }
  saveState();
  renderOpenWindows("calculator");
}

function runConverter(body) {
  const value = Number(body.querySelector("[data-convert-value]").value || 0);
  const mode = body.querySelector("[data-convert-mode]").value;
  const result = mode === "km-mi" ? value * 0.621371 : mode === "c-f" ? value * 9 / 5 + 32 : mode === "kg-lb" ? value * 2.20462 : value / 1024;
  body.querySelector("[data-convert-result]").textContent = `${round(result)} ${mode.split("-")[1]}`;
}

function runRegex(body) {
  const pattern = body.querySelector("[data-regex-pattern]").value;
  const text = body.querySelector("[data-regex-text]").value;
  try {
    const matches = text.match(new RegExp(pattern, "g")) || [];
    body.querySelector("[data-regex-result]").textContent = matches.join(", ") || "No matches";
  } catch (error) {
    body.querySelector("[data-regex-result]").textContent = error.message;
  }
}

function runDiff(body) {
  const a = body.querySelector("[data-diff-a]").value.split("\n");
  const b = body.querySelector("[data-diff-b]").value.split("\n");
  const diff = [];
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if (a[index] !== b[index]) diff.push(`-${a[index] || ""} +${b[index] || ""}`);
  }
  body.querySelector("[data-diff-result]").textContent = diff.join("\n") || "No changes";
}

async function runHash(body) {
  const value = body.querySelector("[data-hash-input]").value;
  const base64 = btoa(unescape(encodeURIComponent(value)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  body.querySelector("[data-hash-result]").textContent = `base64=${base64}\nsha256=${hash}`;
}

function runJson(body) {
  const input = body.querySelector("[data-json-input]").value;
  try {
    body.querySelector("[data-json-result]").textContent = JSON.stringify(JSON.parse(input), null, 2);
  } catch (error) {
    body.querySelector("[data-json-result]").textContent = error.message;
  }
}

function runApiClient(body) {
  const path = body.querySelector("[data-api-url]").value;
  body.querySelector("[data-api-result]").textContent = JSON.stringify({
    ok: true,
    status: 200,
    path,
    mode: "local mock response",
    time: new Date().toISOString()
  }, null, 2);
}

function runPlayground(body) {
  const html = body.querySelector("[data-playground-html]").value;
  body.querySelector("[data-playground-frame]").srcdoc = html;
}

function drawGacha(count) {
  const data = getGachaData();
  const results = [];
  for (let index = 0; index < count; index += 1) {
    if (data.currency < 100) break;
    data.currency -= 100;
    data.pity += 1;
    const creature = rollCreature(data.pity >= 80);
    if (creature.rarity === "Legendary") data.pity = 0;
    data.unlocked.push(creature.id);
    data.history.push(creature.id);
    results.push(creature.name);
  }
  toast("Draw Complete", results.join(", ") || "Not enough currency.");
  saveState();
  renderOpenWindows();
}

function getGachaData() {
  if (!state.appData["mythic-gacha"] || Array.isArray(state.appData["mythic-gacha"])) {
    state.appData["mythic-gacha"] = { currency: 1200, pity: 0, unlocked: [], history: [] };
  }
  return state.appData["mythic-gacha"];
}

function rollCreature(forceLegendary) {
  if (forceLegendary) return CREATURES.find((item) => item.rarity === "Legendary");
  const pool = CREATURES.filter((creature) => {
    const roll = Math.random();
    if (roll < 0.04) return creature.rarity === "Legendary";
    if (roll < 0.14) return creature.rarity === "Epic";
    if (roll < 0.34) return creature.rarity === "Rare";
    if (roll < 0.64) return creature.rarity === "Uncommon";
    return creature.rarity === "Common";
  });
  return pool[Math.floor(Math.random() * pool.length)] || CREATURES[0];
}

function creatureCard(id, unlocked) {
  const creature = CREATURES.find((item) => item.id === id);
  if (!creature) return "";
  return `<article class="mini-card">
    <strong>${unlocked ? escapeHtml(creature.name) : "Unknown"}</strong>
    <p class="muted">${escapeHtml(creature.rarity)} · ${escapeHtml(creature.element)} · ${escapeHtml(creature.region)}</p>
    <p>${unlocked ? escapeHtml(creature.lore) : "Draw to reveal this creature."}</p>
    <button type="button" class="secondary-action" data-action="favorite-creature" data-value="${escapeAttr(creature.id)}">Favorite</button>
    <button type="button" class="secondary-action" data-action="save-creature-file" data-value="${escapeAttr(creature.id)}">Save Lore</button>
  </article>`;
}

function favoriteCreature(id) {
  const bestiary = getAppData("bestiary");
  if (!Array.isArray(bestiary.favorites)) bestiary.favorites = [];
  if (bestiary.favorites.includes(id)) bestiary.favorites = bestiary.favorites.filter((item) => item !== id);
  else bestiary.favorites.push(id);
  saveState();
  toast("Bestiary", "Favorite updated.");
}

function saveCreatureFile(id) {
  const creature = CREATURES.find((item) => item.id === id);
  if (!creature) return;
  upsertFile(`/home/seis/MythicArchive/${creature.id}.md`, `# ${creature.name}\n\n${creature.rarity} ${creature.element} creature from ${creature.region}.\n\n${creature.lore}\n`);
  toast("Creature Saved", `${creature.name} lore saved.`);
}

function assistantSend(body) {
  const input = body.querySelector("[data-assistant-input]");
  const data = getAppData("ai-assistant");
  data.messages.push({ role: "user", text: input.value });
  data.messages.push({ role: "local-demo", text: `This desktop currently has ${APPS.length} apps, ${state.fs.length} file nodes, and ${state.windows.length} open windows.` });
  saveState();
  renderOpenWindows("ai-assistant");
}

function simulateDownload() {
  const path = `/home/seis/Downloads/export-${Date.now()}.txt`;
  upsertFile(path, "SEIS Desktop export placeholder\n");
  recordDownload(path);
  renderOpenWindows();
}

function recordDownload(path) {
  if (!Array.isArray(state.appData.downloads)) state.appData.downloads = [];
  state.appData.downloads.unshift({ id: `download-${Date.now()}`, title: baseName(path), body: path, done: true });
  saveState();
}

function addVaultPlaceholder() {
  const items = getListData("password-vault");
  items.unshift({ id: `vault-${Date.now()}`, title: "Placeholder credential record", body: "REDACTED_PLACEHOLDER_ONLY", done: false });
  saveState();
  renderOpenWindows("password-vault");
}

function setupClockApp(body) {
  const node = body.querySelector("[data-generic-editor]");
  if (node) node.value = `Current time: ${new Date().toLocaleString()}\nStopwatch and timer records persist as local notes.`;
}

function setupPomodoroApp(body) {
  const node = body.querySelector("[data-generic-editor]");
  const data = getAppData("pomodoro");
  if (node) node.value = `Focus sessions: ${data.sessions}\nRemaining: ${data.seconds}s\nUse New to record a session.`;
}

function setupPaintApp(body) {
  const board = body.querySelector(".canvas-board");
  if (!board) return;
  board.addEventListener("pointerdown", (event) => {
    const dot = document.createElement("span");
    dot.style.cssText = `position:absolute;width:10px;height:10px;border-radius:50%;background:var(--accent);left:${event.offsetX}px;top:${event.offsetY}px;`;
    board.style.position = "relative";
    board.append(dot);
  });
}

function setupWhiteboardApp(body) {
  const board = body.querySelector(".canvas-board");
  if (!board) return;
  board.addEventListener("dblclick", (event) => {
    const note = document.createElement("button");
    note.textContent = "Note";
    note.className = "secondary-action";
    note.style.position = "absolute";
    note.style.left = `${event.offsetX}px`;
    note.style.top = `${event.offsetY}px`;
    board.style.position = "relative";
    board.append(note);
  });
}

function setupAudioApp(body) {
  const button = body.querySelector("[data-action='generic-new']");
  if (!button) return;
  button.addEventListener("click", () => {
    const context = new AudioContext();
    const osc = context.createOscillator();
    osc.frequency.value = 330;
    osc.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.16);
  }, { once: true });
}

function setupCameraApp(body) {
  const editor = body.querySelector("[data-generic-editor]");
  if (editor) editor.value = "Camera uses browser permission when enabled. This safe demo does not request permission automatically.";
}

function setupRecorderApp(body) {
  const editor = body.querySelector("[data-generic-editor]");
  if (editor) editor.value = "Voice Recorder can use MediaRecorder after explicit browser permission. No audio is captured automatically.";
}

function getMetrics() {
  const fileBytes = state.fs.reduce((total, item) => total + byteLength(item.content || ""), 0);
  return [
    { label: "Apps", value: `${APPS.length} installed`, percent: 92 },
    { label: "Open Windows", value: String(state.windows.length), percent: clamp(state.windows.length * 14, 6, 100) },
    { label: "Files", value: `${state.fs.length} nodes`, percent: clamp(state.fs.length * 3, 12, 100) },
    { label: "Storage", value: `${fileBytes} bytes`, percent: clamp(fileBytes / 120, 4, 96) },
    { label: "History", value: `${state.terminalHistory.length} commands`, percent: clamp(state.terminalHistory.length * 2, 5, 100) },
    { label: "Persistence", value: db ? "IndexedDB" : "localStorage", percent: db ? 100 : 60 }
  ];
}

function log(scope, message) {
  state.logs.push({ scope, message, time: new Date().toISOString() });
  state.logs = state.logs.slice(-200);
}

function ensureToastRegion() {
  if (document.querySelector(".toast-region")) return;
  const region = document.createElement("section");
  region.className = "toast-region";
  region.setAttribute("aria-live", "polite");
  document.body.append(region);
}

function toast(title, detail) {
  const region = document.querySelector(".toast-region");
  const node = document.createElement("article");
  node.className = "toast";
  node.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span>`;
  region.append(node);
  window.setTimeout(() => node.remove(), 3800);
}

function createButton(className, text, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.action = action;
  button.textContent = text;
  return button;
}

function parseArgs(input) {
  const args = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = pattern.exec(input))) args.push(match[1] ?? match[2] ?? match[3]);
  return args;
}

function downloadText(name, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function markdownOutline(text) {
  return text.split("\n").filter((line) => line.startsWith("#")).join("\n") || text.slice(0, 800);
}

function byteLength(value) {
  return new TextEncoder().encode(String(value || "")).length;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

const CREATURES = [
  ["c01", "Mist Antler Qilin", "Legendary", "Jade", "Northern Peaks", "A jade-antlered guardian that appears when mountain fog turns silver."],
  ["c02", "Glass River Ao", "Epic", "Water", "Eastern Sea", "A turtle-dragon whose shell reflects forgotten constellations."],
  ["c03", "Copper Wing Peng", "Epic", "Metal", "Western Cliffs", "A vast bird with hammered copper feathers and storm-lit eyes."],
  ["c04", "Ink Horn Hu", "Rare", "Shadow", "Black Marsh", "A fox-beast that writes prophecies with its tail in wet ink."],
  ["c05", "Lotus Scale Lu", "Rare", "Wood", "Southern Lake", "A deer-fish spirit that leaves lotus blooms in its wake."],
  ["c06", "Ash Mane Yan", "Uncommon", "Fire", "Red Basin", "A small lion-like creature carrying warm volcanic dust."],
  ["c07", "Pearl Finch Jing", "Common", "Air", "Cloud Orchard", "A bright bird that hides pearls inside cloud nests."],
  ["c08", "Stone Bell Kui", "Rare", "Earth", "Echo Gorge", "A one-legged ox spirit whose step sounds like a bronze bell."],
  ["c09", "Moon Reed Bai", "Uncommon", "Water", "Quiet Delta", "A reed-bodied hare that drinks moonlight from still pools."],
  ["c10", "Cinnabar Tailed Yu", "Common", "Fire", "Old Shrine", "A tiny salamander spirit that warms cold inkstones."],
  ["c11", "Snow Mask Fei", "Rare", "Ice", "White Pass", "A masked goat-beast whose breath folds snow into paper cranes."],
  ["c12", "Thunder Drum Mang", "Epic", "Storm", "High Plateau", "A serpent with drum scales that call distant rain."],
  ["c13", "Iron Root Shen", "Uncommon", "Metal", "Ancient Grove", "A rooted guardian with iron bark and patient eyes."],
  ["c14", "Amber Eye Luo", "Common", "Light", "Sunlit Valley", "A watchful small beast with amber eyes and a calm voice."],
  ["c15", "Vermilion Seal Niao", "Legendary", "Fire", "Imperial Ridge", "A bird marked by a living red seal that burns false names away."],
  ["c16", "Blue Salt Long", "Epic", "Sea", "Tide Gate", "A salt-blue dragonling that coils around harbor bells."],
  ["c17", "Moss Crown Tu", "Common", "Wood", "Green Hollow", "A rabbit spirit crowned with moss and dew beads."],
  ["c18", "Obsidian Hoof Zhi", "Rare", "Stone", "Night Steppe", "A black-hooved truth beast that refuses crooked paths."],
  ["c19", "Silk Wing Chan", "Uncommon", "Air", "Mulberry Hill", "A cicada with silk wings that hums old migration songs."],
  ["c20", "Bronze Tooth Pi", "Common", "Metal", "Market Ruins", "A playful beast that chews scrap bronze into charms."]
].map(([id, name, rarity, element, region, lore]) => ({ id, name, rarity, element, region, lore }));
