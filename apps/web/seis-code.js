const DB_NAME = "seis-code-workspace-v1";
const DB_VERSION = 1;
const WORKSPACE = "/workspace";
const SHARED_VFS_ROOT = "/workspace";
const WORKSPACE_CHANNEL = "seis-code-workspace";
const MONACO_LOADER_URL = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js";

const languageByExtension = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  md: "markdown",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  h: "cpp",
  cs: "csharp",
  go: "go",
  rs: "rust",
  php: "php",
  rb: "ruby",
  swift: "swift",
  kt: "kotlin",
  kts: "kotlin",
  sql: "sql",
  sh: "shell",
  bash: "shell",
  yml: "yaml",
  yaml: "yaml",
  xml: "xml",
  dockerfile: "dockerfile"
};

const supportedLanguageModes = [
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

const aiTruthfulnessMarker = "not Anthropic";

const evolutionPhases = [
  {
    id: "v0.1-foundation",
    horizon: "Year 1",
    title: "Foundation",
    status: "Validated local workspace",
    evidence: "Monaco, terminal, IndexedDB, activity views, menus, and Local Demo REPL.",
    mission: "Make the browser IDE feel complete without cloud keys, fake providers, or decorative controls.",
    qualityGate: "100% interactivity smoke, no-key startup, and shared virtual file persistence.",
    nextAction: "Keep hardening the command surface and preserve the Local Demo truth boundary."
  },
  {
    id: "v0.2-coherence",
    horizon: "Year 2",
    title: "Coherence",
    status: "Designed",
    evidence: "Command Lens, evidence-first status, shared file context, and keyboard-led operations.",
    mission: "Unify editor, terminal, search, source control, and AI Core status into one calm operator flow.",
    qualityGate: "Every command palette item maps to a real action, selected state, modal, or file operation.",
    nextAction: "Promote the Command Lens from status rail to context-aware operating surface."
  },
  {
    id: "v0.3-collaboration",
    horizon: "Year 3",
    title: "Collaboration",
    status: "Planned",
    evidence: "Safe repository adapters, review queues, and audited workspace sharing.",
    mission: "Add human-reviewed collaboration flows without pretending browser-local Git is live GitHub.",
    qualityGate: "Repository actions are simulated, read-only, or write-gated with visible approval status.",
    nextAction: "Define adapter contracts before introducing any live repository writes."
  },
  {
    id: "v0.4-intelligence",
    horizon: "Year 4",
    title: "Intelligence",
    status: "Planned",
    evidence: "Provider-neutral AI Core through a backend gateway, with local-first policy.",
    mission: "Route AI work through capability-aware, provider-neutral infrastructure with truthful identity.",
    qualityGate: "Missing keys do not crash the IDE, local-only mode blocks cloud fallback, and logs are redacted.",
    nextAction: "Keep provider setup backend-only and make actual model identity visible in every AI surface."
  },
  {
    id: "v0.5-platform",
    horizon: "Year 5",
    title: "Platform",
    status: "Planned",
    evidence: "Extensible design system, capability-scoped agents, and validated release workflows.",
    mission: "Turn SEIS Code into a durable platform shell for extensions, agents, evidence, and release review.",
    qualityGate: "Extension permissions, agent scopes, release evidence, and public readiness are independently auditable.",
    nextAction: "Keep future platform work staged behind explicit contracts and validation gates."
  }
];

const extensionCatalog = [
  { id: "theme.midnight-command", name: "Midnight Command Theme", capability: "Theme", installed: true, enabled: true },
  { id: "lang.polyglot-pack", name: "SEIS Polyglot Language Pack", capability: "24 language highlighting", installed: true, enabled: true },
  { id: "tools.markdown-preview", name: "Markdown Preview", capability: "Preview", installed: true, enabled: true },
  { id: "tools.html-preview", name: "HTML Preview", capability: "Sandbox run", installed: false, enabled: false },
  { id: "ai.local-demo-repl", name: "Claude Code Local Demo REPL", capability: "No-key assistant shell", installed: true, enabled: true },
  { id: "scm.browser-safe", name: "Browser Source Control", capability: "Simulated Git", installed: true, enabled: true },
  { id: "format.json-css", name: "JSON and CSS Formatter", capability: "Formatting", installed: false, enabled: false },
  { id: "terminal.virtual-unix", name: "Virtual Unix Commands", capability: "Terminal", installed: true, enabled: true }
];

const claudeToolDefinitions = [
  { name: "list_files", destructive: false, description: "List virtual workspace paths." },
  { name: "read_file", destructive: false, description: "Read a virtual file." },
  { name: "create_file", destructive: false, description: "Create a virtual file." },
  { name: "write_file", destructive: false, description: "Overwrite one virtual file." },
  { name: "append_file", destructive: false, description: "Append text to one virtual file." },
  { name: "apply_patch", destructive: false, description: "Apply a constrained search/replace patch to one virtual file." },
  { name: "rename_file", destructive: false, description: "Rename one virtual file." },
  { name: "move_file", destructive: false, description: "Move one virtual file." },
  { name: "delete_file", destructive: true, description: "Delete one virtual file after local policy checks." },
  { name: "search_files", destructive: false, description: "Search file contents." },
  { name: "get_file_metadata", destructive: false, description: "Inspect virtual file metadata." },
  { name: "run_virtual_command", destructive: false, description: "Run a browser-safe terminal command." },
  { name: "open_file_in_editor", destructive: false, description: "Open a virtual file in the editor." },
  { name: "show_diff", destructive: false, description: "Show active file differences against the clean baseline." }
];

const defaultFiles = [
  {
    path: "/workspace/README.md",
    content: `# SEIS Code

SEIS Code is a browser workspace slice.

- Monaco editor runs real typing and multi-tab editing.
- Files persist to IndexedDB.
- The terminal runs against the same virtual file system.
- The \`claude\` command starts a clearly labeled Local Demo REPL.

Try:

\`\`\`sh
ls
cat README.md
mkdir notes
echo "hello SEIS" > notes/hello.txt
grep SEIS README.md
claude
\`\`\`
`
  },
  {
    path: "/workspace/src/main.ts",
    content: `type ProviderState = "Available" | "Missing Key" | "Disabled" | "Rate Limited" | "Error";

interface WorkspaceSignal {
  id: string;
  label: string;
  status: ProviderState;
  evidence: string;
}

const signals: WorkspaceSignal[] = [
  {
    id: "local-demo",
    label: "Local Demo AI",
    status: "Available",
    evidence: "Runs in the browser without cloud credentials."
  },
  {
    id: "anthropic",
    label: "Anthropic Claude",
    status: "Missing Key",
    evidence: "No backend provider gateway is configured in this static slice."
  }
];

export function summarizeSignals() {
  return signals.map((signal) => \`\${signal.label}: \${signal.status}\`).join("\\n");
}
`
  },
  {
    path: "/workspace/src/app.js",
    content: `export function boot() {
  const root = document.querySelector("#app");
  if (!root) return;
  root.textContent = "SEIS Code sandbox preview is running.";
}

boot();
`
  },
  {
    path: "/workspace/index.html",
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>SEIS Code Preview</title>
    <link rel="stylesheet" href="./styles/site.css">
  </head>
  <body>
    <main id="app">Loading preview...</main>
    <script type="module" src="./src/app.js"></script>
  </body>
</html>
`
  },
  {
    path: "/workspace/styles/site.css",
    content: `:root {
  color-scheme: dark;
  font-family: Inter, system-ui, sans-serif;
  background: #101820;
  color: #e7edf5;
}

body {
  margin: 0;
  display: grid;
  min-height: 100vh;
  place-items: center;
}

main {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 2rem;
}
`
  },
  {
    path: "/workspace/package.json",
    content: `{
  "name": "seis-code-sandbox",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "browser-sandbox",
    "test": "local-demo"
  }
}
`
  },
  {
    path: "/workspace/.seis/extensions.json",
    content: JSON.stringify(extensionCatalog, null, 2)
  }
];

const app = {
  db: null,
  files: new Map(),
  openTabs: [],
  activePath: "/workspace/README.md",
  activeView: "explorer",
  cwd: WORKSPACE,
  terminalHistory: [],
  historyIndex: -1,
  terminalQueue: Promise.resolve(),
  terminalBusy: false,
  paletteItems: [],
  paletteActiveIndex: 0,
  paletteRecentCommandIds: [],
  env: {
    SEIS_ENVIRONMENT: "local",
    SEIS_DATA_MODE: "indexeddb",
    SEIS_AI_MODE: "local-demo"
  },
  staged: new Set(),
  commits: [],
  extensions: [],
  repl: {
    active: false,
    model: "Local Demo",
    history: [],
    toolRuns: []
  },
  settings: {
    wordWrap: "off",
    minimap: true,
    theme: "seis-dark",
    commandLens: true,
    evolutionPhaseId: "v0.1-foundation"
  },
  monaco: null,
  editor: null,
  monacoReady: false,
  fallbackReady: false,
  sharedVfsQueue: Promise.resolve(),
  sharedVfsMode: "unavailable",
  sharedVfsLastSavedAt: "",
  sharedVfsError: ""
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function basename(path) {
  if (path === "/") return "/";
  return path.replace(/\/+$/, "").split("/").pop() || "/";
}

function dirname(path) {
  if (path === "/") return "/";
  const clean = path.replace(/\/+$/, "");
  const index = clean.lastIndexOf("/");
  return index <= 0 ? "/" : clean.slice(0, index);
}

function extname(path) {
  const base = basename(path).toLowerCase();
  if (base === "dockerfile") return "dockerfile";
  const index = base.lastIndexOf(".");
  return index === -1 ? "" : base.slice(index + 1);
}

function normalizePath(input, base = app.cwd) {
  const value = String(input || "").trim();
  const safeBase = base === WORKSPACE || String(base).startsWith(`${WORKSPACE}/`) ? base : WORKSPACE;
  if (!value || value === ".") return safeBase;
  if (value.includes("\0") || value.includes("\\") || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) {
    throw new Error("Path contains unsupported or unsafe characters.");
  }
  const raw = value.startsWith("/") ? value : `${safeBase}/${value}`;
  const parts = [];
  raw.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") {
      parts.pop();
      return;
    }
    parts.push(part);
  });
  const normalized = `/${parts.join("/")}`;
  if (normalized !== WORKSPACE && !normalized.startsWith(`${WORKSPACE}/`)) {
    throw new Error("Path is outside the browser workspace.");
  }
  return normalized;
}

function getLanguage(path) {
  return languageByExtension[extname(path)] || "plaintext";
}

function createFileEntry(path, content = "", type = "file") {
  const now = new Date().toISOString();
  return {
    path,
    name: basename(path),
    parent: dirname(path),
    type,
    content: type === "file" ? content : "",
    language: type === "file" ? getLanguage(path) : "",
    createdAt: now,
    updatedAt: now,
    baseContent: type === "file" ? content : ""
  };
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "path" });
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
      if (!db.objectStoreNames.contains("history")) db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
      if (!db.objectStoreNames.contains("extensions")) db.createObjectStore("extensions", { keyPath: "id" });
      if (!db.objectStoreNames.contains("commits")) db.createObjectStore("commits", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx(store, mode = "readonly") {
  return app.db.transaction(store, mode).objectStore(store);
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAll(store) {
  return requestToPromise(tx(store).getAll());
}

function put(store, value) {
  return requestToPromise(tx(store, "readwrite").put(value));
}

function remove(store, key) {
  return requestToPromise(tx(store, "readwrite").delete(key));
}

async function saveSetting(key, value) {
  await put("settings", { key, value });
}

async function loadSetting(key, fallback) {
  const entry = await requestToPromise(tx("settings").get(key));
  return entry ? entry.value : fallback;
}

async function saveFile(entry) {
  entry.updatedAt = new Date().toISOString();
  entry.language = entry.type === "file" ? getLanguage(entry.path) : "";
  app.files.set(entry.path, entry);
  await put("files", entry);
  void saveSharedWorkspace("code-file-save");
  renderAll();
}

async function seedWorkspace() {
  const files = await getAll("files");
  app.files = new Map(files.map((file) => [file.path, file]));
  const hasRequiredSeed = defaultFiles.every((file) => app.files.has(file.path));
  if (hasRequiredSeed) return;
  await put("files", createFileEntry(WORKSPACE, "", "folder"));
  app.files.set(WORKSPACE, createFileEntry(WORKSPACE, "", "folder"));
  const folders = new Set(defaultFiles.map((file) => dirname(file.path)));
  for (const folder of folders) {
    if (folder !== WORKSPACE) await ensureFolder(folder);
  }
  for (const file of defaultFiles) {
    if (!app.files.has(file.path)) {
      const entry = createFileEntry(file.path, file.content, "file");
      app.files.set(entry.path, entry);
      await put("files", entry);
    }
  }
  for (const extension of extensionCatalog) await put("extensions", extension);
  await saveSetting("openTabs", ["/workspace/README.md", "/workspace/src/main.ts"]);
  await saveSetting("activePath", "/workspace/README.md");
}

async function ensureFolder(path) {
  if (app.files.has(path)) return;
  const parent = dirname(path);
  if (parent !== path && parent.startsWith(WORKSPACE) && !app.files.has(parent)) await ensureFolder(parent);
  const entry = createFileEntry(path, "", "folder");
  app.files.set(path, entry);
  await put("files", entry);
}

async function reloadState() {
  const files = await getAll("files");
  app.files = new Map(files.map((file) => [file.path, file]));
  app.openTabs = await loadSetting("openTabs", ["/workspace/README.md"]);
  app.activePath = await loadSetting("activePath", app.openTabs[0] || "/workspace/README.md");
  app.cwd = await loadSetting("cwd", WORKSPACE);
  app.terminalHistory = await loadSetting("terminalHistory", []);
  app.paletteRecentCommandIds = await loadSetting("paletteRecentCommandIds", []);
  app.settings = { ...app.settings, ...(await loadSetting("settings", app.settings)) };
  app.extensions = await getAll("extensions");
  if (!app.extensions.length) {
    app.extensions = extensionCatalog;
    for (const extension of app.extensions) await put("extensions", extension);
  }
  app.commits = (await getAll("commits")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!app.files.has(app.activePath)) app.activePath = app.openTabs.find((path) => app.files.has(path)) || "/workspace/README.md";
  app.openTabs = app.openTabs.filter((path) => app.files.has(path));
  if (!app.openTabs.includes(app.activePath) && app.files.has(app.activePath)) app.openTabs.unshift(app.activePath);
}

function sharedEntriesFromCode() {
  return Array.from(app.files.values())
    .filter((entry) => entry?.path === SHARED_VFS_ROOT || entry?.path?.startsWith(`${SHARED_VFS_ROOT}/`))
    .map((entry) => ({
      ...entry,
      type: entry.type === "folder" ? "folder" : "file",
      content: entry.type === "folder" ? "" : String(entry.content || "")
    }));
}

async function loadSharedWorkspace(source = "shared-vfs") {
  const adapter = window.SEIS_SHARED_VFS;
  if (!adapter?.load) return { restored: false, imported: 0, mode: "unavailable" };
  try {
    const result = await adapter.load();
    app.sharedVfsMode = result.mode || "memory";
    app.sharedVfsError = "";
    if (!result.restored) {
      await saveSharedWorkspace(`code-seed:${source}`);
      return { ...result, imported: 0 };
    }
    let imported = 0;
    for (const entry of result.entries) {
      const safePath = normalizePath(entry.path);
      const existing = app.files.get(safePath);
      const normalized = createFileEntry(safePath, entry.content || "", entry.type === "folder" ? "folder" : "file");
      normalized.createdAt = entry.createdAt || normalized.createdAt;
      normalized.updatedAt = entry.updatedAt || normalized.updatedAt;
      normalized.baseContent = entry.baseContent ?? normalized.content;
      app.files.set(safePath, existing?.type === normalized.type ? { ...existing, ...normalized } : normalized);
      await put("files", app.files.get(safePath));
      imported += 1;
    }
    return { ...result, imported };
  } catch (error) {
    app.sharedVfsMode = "memory";
    app.sharedVfsError = error.message || String(error);
    return { restored: false, imported: 0, mode: "memory", error: app.sharedVfsError };
  }
}

function saveSharedWorkspace(reason = "code-mutation") {
  const adapter = window.SEIS_SHARED_VFS;
  if (!adapter?.save) return Promise.resolve({ mode: "unavailable" });
  app.sharedVfsQueue = app.sharedVfsQueue.then(async () => {
    try {
      const result = await adapter.save(sharedEntriesFromCode(), reason);
      app.sharedVfsMode = result.mode || app.sharedVfsMode;
      app.sharedVfsLastSavedAt = result.savedAt || app.sharedVfsLastSavedAt;
      app.sharedVfsError = result.error || "";
      return result;
    } catch (error) {
      app.sharedVfsMode = "memory";
      app.sharedVfsError = error.message || String(error);
      return { mode: app.sharedVfsMode, error: app.sharedVfsError };
    }
  });
  return app.sharedVfsQueue;
}

function renderAll() {
  renderFileTree();
  renderTabs();
  renderSearchResults();
  renderSourceControl();
  renderExtensions();
  renderProblems();
  renderStatus();
}

function renderStatus() {
  const persistence = $("[data-persistence-status]");
  if (persistence) persistence.textContent = `IndexedDB ready - shared ${app.sharedVfsMode} - ${app.files.size} nodes`;
  const breadcrumbs = $("[data-breadcrumbs]");
  if (breadcrumbs) breadcrumbs.textContent = app.activePath;
  const provider = $("[data-provider-status]");
  if (provider) provider.textContent = app.repl.active ? "AI: Claude REPL command, Local Demo runtime" : "AI: Local Demo, no cloud key required";
  const mode = $("[data-terminal-mode]");
  if (mode) mode.textContent = app.repl.active ? "Claude Code REPL" : "Shell";
  const prompt = $("[data-terminal-prompt]");
  if (prompt) prompt.textContent = app.repl.active ? "claude(local-demo)> " : `${app.cwd} $`;
  renderCommandLens();
}

function renderCommandLens() {
  const workspace = $(".workspace");
  const lens = $("[data-command-lens]");
  const toggle = $("[data-action=\"toggle-command-lens\"]");
  if (workspace) workspace.classList.toggle("lens-hidden", !app.settings.commandLens);
  if (lens) lens.setAttribute("aria-hidden", String(!app.settings.commandLens));
  if (toggle) toggle.setAttribute("aria-pressed", String(Boolean(app.settings.commandLens)));
  if (!lens) return;

  const activeFile = app.files.get(app.activePath);
  const dirty = activeFile?.type === "file" && activeFile.content !== activeFile.baseContent;
  const installedExtensions = app.extensions.filter((item) => item.installed).length;
  const summary = $("[data-command-lens-summary]", lens);
  const active = $("[data-lens-active-file]", lens);
  const provider = $("[data-lens-provider]", lens);
  const storage = $("[data-lens-storage]", lens);
  const rail = $("[data-evolution-rail]", lens);
  const detail = $("[data-evolution-detail]", lens);
  const selectedPhase = getSelectedEvolutionPhase();

  if (summary) {
    summary.textContent = `Apple-grade Command Lens tracks the active file, Local Demo AI state, and selected horizon: ${selectedPhase.horizon} / ${selectedPhase.title}.`;
  }
  if (active) {
    active.textContent = `${app.activePath || WORKSPACE} - ${getLanguage(app.activePath || "")}${dirty ? " - unsaved" : ""}`;
  }
  if (provider) {
    provider.textContent = app.repl.active
      ? `Claude command active, runtime Local Demo (${aiTruthfulnessMarker})`
      : "Local Demo available, cloud providers disabled";
  }
  if (storage) {
    storage.textContent = `${app.files.size} nodes, ${app.openTabs.length} tabs, ${app.terminalHistory.length} commands, ${installedExtensions} extensions`;
  }
  if (rail) {
    rail.innerHTML = evolutionPhases.map((phase) => `
      <button
        class="evolution-phase ${phase.id === selectedPhase.id ? "is-active" : ""}"
        type="button"
        data-action="select-evolution-phase"
        data-evolution-phase="${escapeHtml(phase.id)}"
        aria-pressed="${phase.id === selectedPhase.id}"
        aria-label="${escapeHtml(`${phase.horizon}: ${phase.title}`)}"
      >
        <em>${escapeHtml(phase.horizon)} - ${escapeHtml(phase.status)}</em>
        <strong>${escapeHtml(phase.title)}</strong>
        <span>${escapeHtml(phase.evidence)}</span>
      </button>
    `).join("");
  }
  if (detail) {
    detail.innerHTML = `
      <strong>${escapeHtml(selectedPhase.horizon)} / ${escapeHtml(selectedPhase.title)}</strong>
      <p>${escapeHtml(selectedPhase.mission)}</p>
      <dl>
        <div>
          <dt>Proof gate</dt>
          <dd>${escapeHtml(selectedPhase.qualityGate)}</dd>
        </div>
        <div>
          <dt>Next action</dt>
          <dd>${escapeHtml(selectedPhase.nextAction)}</dd>
        </div>
      </dl>
    `;
  }
}

function getSelectedEvolutionPhase() {
  return evolutionPhases.find((phase) => phase.id === app.settings.evolutionPhaseId) || evolutionPhases[0];
}

function renderFileTree() {
  const tree = $("[data-file-tree]");
  if (!tree) return;
  tree.replaceChildren();
  const files = Array.from(app.files.values()).sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });
  files
    .filter((file) => file.path !== WORKSPACE)
    .forEach((file) => {
      const depth = Math.max(0, file.path.replace(`${WORKSPACE}/`, "").split("/").length - 1);
      const row = document.createElement("button");
      row.type = "button";
      row.className = `tree-row ${file.path === app.activePath ? "is-active" : ""}`;
      row.style.paddingLeft = `${7 + depth * 14}px`;
      row.dataset.path = file.path;
      row.dataset.action = file.type === "folder" ? "open-folder" : "open-file";
      row.innerHTML = `<span class="tree-kind">${file.type === "folder" ? "DIR" : getLanguage(file.path).slice(0, 3).toUpperCase()}</span><span class="tree-path">${escapeHtml(file.name)}</span>`;
      tree.append(row);
    });
}

function renderTabs() {
  const tabs = $("[data-tabs]");
  if (!tabs) return;
  tabs.replaceChildren();
  app.openTabs.forEach((path) => {
    const file = app.files.get(path);
    if (!file) return;
    const dirty = file.content !== file.baseContent;
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = `tab ${path === app.activePath ? "is-active" : ""}`;
    tab.dataset.path = path;
    tab.dataset.action = "activate-tab";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", path === app.activePath ? "true" : "false");
    tab.innerHTML = `<span class="tab-label">${escapeHtml(file.name)}</span>${dirty ? '<span class="dirty">M</span>' : ""}<span class="tab-close" data-close-tab="${escapeAttr(path)}">x</span>`;
    tabs.append(tab);
  });
}

function renderSearchResults() {
  const results = $("[data-search-results]");
  const queryInput = $("[data-search-query]");
  if (!results || !queryInput) return;
  const query = queryInput.value;
  results.replaceChildren();
  if (!query) {
    const empty = document.createElement("p");
    empty.className = "panel-note";
    empty.textContent = "Type a search term to scan virtual files.";
    results.append(empty);
    return;
  }
  const matches = searchFiles(query, {
    caseSensitive: $("[data-search-case]")?.checked,
    wholeWord: $("[data-search-word]")?.checked,
    regex: $("[data-search-regex]")?.checked
  });
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "panel-note";
    empty.textContent = "No matches found.";
    results.append(empty);
    return;
  }
  matches.slice(0, 80).forEach((match) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "search-result";
    item.dataset.action = "open-search-result";
    item.dataset.path = match.path;
    item.dataset.line = String(match.line);
    item.innerHTML = `<strong>${escapeHtml(match.path.replace(`${WORKSPACE}/`, ""))}:${match.line}</strong><span>${escapeHtml(match.preview.trim())}</span>`;
    results.append(item);
  });
}

function renderSourceControl() {
  const summary = $("[data-source-summary]");
  const list = $("[data-source-list]");
  const log = $("[data-commit-log]");
  if (!summary || !list || !log) return;
  const changed = Array.from(app.files.values()).filter((file) => file.type === "file" && file.content !== file.baseContent);
  summary.textContent = `${changed.length} modified file${changed.length === 1 ? "" : "s"}. ${app.staged.size} staged.`;
  list.replaceChildren();
  if (!changed.length) {
    const empty = document.createElement("p");
    empty.className = "panel-note";
    empty.textContent = "No virtual changes.";
    list.append(empty);
  } else {
    changed.forEach((file) => {
      const row = document.createElement("div");
      row.className = "source-row";
      row.innerHTML = `<div><strong>${escapeHtml(file.name)}</strong><span>${escapeHtml(file.path)}</span></div>`;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.action = app.staged.has(file.path) ? "unstage-file" : "stage-file";
      button.dataset.path = file.path;
      button.textContent = app.staged.has(file.path) ? "Unstage" : "Stage";
      row.append(button);
      list.append(row);
    });
  }
  log.replaceChildren();
  if (!app.commits.length) {
    log.textContent = "No commits in simulated history.";
  } else {
    app.commits.slice(0, 6).forEach((commit) => {
      const line = document.createElement("div");
      line.textContent = `${commit.id.slice(0, 7)} ${commit.message} (${commit.files.length} files)`;
      log.append(line);
    });
  }
}

function renderExtensions() {
  const list = $("[data-extensions-list]");
  const input = $("[data-extension-search]");
  if (!list) return;
  const query = (input?.value || "").toLowerCase();
  list.replaceChildren();
  app.extensions
    .filter((extension) => !query || `${extension.name} ${extension.capability}`.toLowerCase().includes(query))
    .forEach((extension) => {
      const card = document.createElement("div");
      card.className = "extension-card";
      card.innerHTML = `<div><strong>${escapeHtml(extension.name)}</strong><span>${escapeHtml(extension.capability)} - ${extension.installed ? extension.enabled ? "Enabled" : "Disabled" : "Not installed"}</span></div>`;
      const actions = document.createElement("div");
      actions.className = "panel-actions";
      const install = document.createElement("button");
      install.type = "button";
      install.dataset.action = extension.installed ? "uninstall-extension" : "install-extension";
      install.dataset.id = extension.id;
      install.textContent = extension.installed ? "Uninstall" : "Install";
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.dataset.action = extension.enabled ? "disable-extension" : "enable-extension";
      toggle.dataset.id = extension.id;
      toggle.textContent = extension.enabled ? "Disable" : "Enable";
      toggle.disabled = !extension.installed;
      actions.append(install, toggle);
      card.append(actions);
      list.append(card);
    });
}

function renderProblems() {
  const list = $("[data-problems-list]");
  if (!list) return;
  list.replaceChildren();
  const problems = [];
  for (const file of app.files.values()) {
    if (file.type !== "file") continue;
    if (file.content.includes("TODO")) problems.push({ path: file.path, message: "TODO marker needs review.", level: "info" });
    if (file.path.endsWith(".json")) {
      try {
        JSON.parse(file.content);
      } catch {
        problems.push({ path: file.path, message: "Invalid JSON.", level: "error" });
      }
    }
  }
  if (!problems.length) {
    list.textContent = "No problems detected in local checks.";
    return;
  }
  problems.forEach((problem) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "problem-item";
    item.dataset.action = "open-file";
    item.dataset.path = problem.path;
    item.innerHTML = `<span>${escapeHtml(problem.message)}</span><span>${escapeHtml(problem.path.replace(`${WORKSPACE}/`, ""))}</span>`;
    list.append(item);
  });
}

function setupMonaco() {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const useFallback = () => {
      if (settled || app.monacoReady) return;
      setupFallbackEditor();
      finish(false);
    };
    const fallbackTimer = window.setTimeout(() => {
      useFallback();
    }, 5000);

    const startMonaco = () => {
      if (settled || !window.require) return;
      window.require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" } });
      window.require.onError = () => {
        window.clearTimeout(fallbackTimer);
        useFallback();
      };
      window.require(["vs/editor/editor.main"], () => {
        if (settled) return;
        window.clearTimeout(fallbackTimer);
        if (app.fallbackReady) {
          const textarea = $("[data-fallback-textarea]");
          const file = app.files.get(app.activePath);
          if (textarea && file && file.type === "file") {
            file.content = textarea.value;
            file.updatedAt = new Date().toISOString();
            app.files.set(file.path, file);
            put("files", file);
          }
        }
        app.monaco = window.monaco;
        app.monacoReady = true;
        app.fallbackReady = false;
        $("#monaco-editor").hidden = false;
        $("[data-editor-fallback]").hidden = true;
        app.monaco.editor.defineTheme("seis-dark", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "comment", foreground: "728296" },
            { token: "keyword", foreground: "70a5ff" },
            { token: "string", foreground: "86e3a8" },
            { token: "number", foreground: "f2bd6b" }
          ],
          colors: {
            "editor.background": "#101820",
            "editor.foreground": "#e7edf5",
            "editorLineNumber.foreground": "#536274",
            "editorCursor.foreground": "#72dfc1",
            "editor.selectionBackground": "#2d4663"
          }
        });
        app.editor = app.monaco.editor.create($("#monaco-editor"), {
          value: "",
          language: "markdown",
          theme: "seis-dark",
          automaticLayout: true,
          minimap: { enabled: app.settings.minimap },
          wordWrap: app.settings.wordWrap,
          fontFamily: "SFMono-Regular, Cascadia Code, Menlo, Consolas, monospace",
          fontSize: 13,
          lineHeight: 20,
          tabSize: 2,
          renderWhitespace: "selection",
          scrollBeyondLastLine: false
        });
        app.editor.onDidChangeModelContent(() => {
          const file = app.files.get(app.activePath);
          if (!file || file.type !== "file") return;
          file.content = app.editor.getValue();
          file.updatedAt = new Date().toISOString();
          app.files.set(file.path, file);
          put("files", file);
          renderTabs();
          renderSourceControl();
          renderProblems();
        });
        app.editor.onDidChangeCursorPosition((event) => {
          const status = $("[data-cursor-status]");
          if (status) status.textContent = `Ln ${event.position.lineNumber}, Col ${event.position.column}`;
        });
        openFile(app.activePath);
        finish(true);
      }, () => {
        window.clearTimeout(fallbackTimer);
        useFallback();
      });
    };

    if (window.require) {
      startMonaco();
      return;
    }

    let loader = document.querySelector("[data-monaco-loader]");
    if (!loader) {
      loader = document.createElement("script");
      loader.src = MONACO_LOADER_URL;
      loader.async = true;
      loader.dataset.monacoLoader = "true";
      document.head.append(loader);
    }
    loader.addEventListener("load", startMonaco, { once: true });
    loader.addEventListener("error", () => {
      window.clearTimeout(fallbackTimer);
      useFallback();
    }, { once: true });
  });
}

function setupFallbackEditor() {
  if (app.fallbackReady) {
    openFile(app.activePath);
    return;
  }
  app.fallbackReady = true;
  $("#monaco-editor").hidden = true;
  $("[data-editor-fallback]").hidden = false;
  const textarea = $("[data-fallback-textarea]");
  textarea.addEventListener("input", () => {
    const file = app.files.get(app.activePath);
    if (!file) return;
    file.content = textarea.value;
    file.updatedAt = new Date().toISOString();
    app.files.set(file.path, file);
    put("files", file);
    renderTabs();
    renderSourceControl();
  });
  openFile(app.activePath);
}

function setEditorContent(file) {
  if (app.monacoReady && app.editor) {
    const model = app.monaco.editor.createModel(file.content, getLanguage(file.path), app.monaco.Uri.parse(`seis://${file.path}`));
    const oldModel = app.editor.getModel();
    app.editor.setModel(model);
    if (oldModel) oldModel.dispose();
    app.editor.updateOptions({ minimap: { enabled: app.settings.minimap }, wordWrap: app.settings.wordWrap });
    app.editor.focus();
    return;
  }
  if (app.fallbackReady) {
    $("[data-fallback-textarea]").value = file.content;
    $("[data-fallback-textarea]").focus();
  }
}

async function openFile(path, line = 1) {
  const safePath = normalizePath(path);
  const file = app.files.get(safePath);
  if (!file || file.type !== "file") return;
  app.activePath = safePath;
  if (!app.openTabs.includes(safePath)) app.openTabs.push(safePath);
  await saveSetting("activePath", app.activePath);
  await saveSetting("openTabs", app.openTabs);
  setEditorContent(file);
  if (app.monacoReady && app.editor && line > 1) {
    app.editor.revealLineInCenter(line);
    app.editor.setPosition({ lineNumber: line, column: 1 });
  }
  renderAll();
}

async function closeTab(path) {
  app.openTabs = app.openTabs.filter((item) => item !== path);
  if (app.activePath === path) {
    app.activePath = app.openTabs[0] || Array.from(app.files.values()).find((file) => file.type === "file")?.path || "";
    if (app.activePath) await openFile(app.activePath);
  }
  await saveSetting("openTabs", app.openTabs);
  renderTabs();
}

async function saveActiveFile() {
  const file = app.files.get(app.activePath);
  if (!file || file.type !== "file") return;
  if (app.monacoReady && app.editor) file.content = app.editor.getValue();
  if (app.fallbackReady) file.content = $("[data-fallback-textarea]").value;
  await saveFile(file);
  appendOutput(`Saved ${file.path}`);
}

async function markActiveClean() {
  const file = app.files.get(app.activePath);
  if (!file) return;
  file.baseContent = file.content;
  await saveFile(file);
}

async function createNewFile() {
  const name = prompt("New file path under /workspace", "notes/untitled.md");
  if (!name) return;
  const path = normalizePath(name);
  if (app.files.has(path)) {
    showModal("File exists", `<p>${escapeHtml(path)} already exists.</p>`);
    return;
  }
  await ensureFolder(dirname(path));
  await saveFile(createFileEntry(path, ""));
  await openFile(path);
}

async function createNewFolder() {
  const name = prompt("New folder path under /workspace", "notes");
  if (!name) return;
  const path = normalizePath(name);
  await ensureFolder(path);
  await reloadState();
  renderAll();
}

function searchFiles(query, options = {}) {
  const matches = [];
  if (!query) return matches;
  let matcher;
  try {
    if (options.regex) {
      matcher = new RegExp(query, options.caseSensitive ? "g" : "gi");
    } else {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const source = options.wholeWord ? `\\b${escaped}\\b` : escaped;
      matcher = new RegExp(source, options.caseSensitive ? "g" : "gi");
    }
  } catch {
    return matches;
  }
  for (const file of app.files.values()) {
    if (file.type !== "file") continue;
    file.content.split("\n").forEach((line, index) => {
      matcher.lastIndex = 0;
      if (matcher.test(line)) matches.push({ path: file.path, line: index + 1, preview: line });
    });
  }
  return matches;
}

async function replaceMatches(all = false) {
  const query = $("[data-search-query]")?.value || "";
  const replacement = $("[data-replace-query]")?.value || "";
  const matches = searchFiles(query, {
    caseSensitive: $("[data-search-case]")?.checked,
    wholeWord: $("[data-search-word]")?.checked,
    regex: $("[data-search-regex]")?.checked
  });
  const targets = all ? matches : matches.slice(0, 1);
  for (const target of targets) {
    const file = app.files.get(target.path);
    if (!file) continue;
    file.content = file.content.replace(query, replacement);
    await saveFile(file);
  }
  if (app.files.get(app.activePath)) setEditorContent(app.files.get(app.activePath));
  appendOutput(`Replaced ${targets.length} match${targets.length === 1 ? "" : "es"}.`);
}

async function stageFile(path) {
  app.staged.add(normalizePath(path));
  renderSourceControl();
}

async function unstageFile(path) {
  app.staged.delete(normalizePath(path));
  renderSourceControl();
}

async function commitStaged() {
  if (!app.staged.size) {
    showModal("Nothing staged", "<p>Stage at least one modified virtual file before committing.</p>");
    return;
  }
  const message = $("[data-commit-message]")?.value.trim() || "workspace: save browser changes";
  const files = Array.from(app.staged);
  for (const path of files) {
    const file = app.files.get(path);
    if (!file) continue;
    file.baseContent = file.content;
    await saveFile(file);
  }
  const commit = {
    id: `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`,
    message,
    files,
    createdAt: new Date().toISOString()
  };
  await put("commits", commit);
  app.commits.unshift(commit);
  app.staged.clear();
  appendOutput(`Committed ${files.length} virtual file(s): ${message}`);
  renderSourceControl();
}

async function updateExtension(id, patch) {
  const extension = app.extensions.find((item) => item.id === id);
  if (!extension) return;
  Object.assign(extension, patch);
  await put("extensions", extension);
  await saveExtensionsFile();
  renderExtensions();
}

async function saveExtensionsFile() {
  const path = "/workspace/.seis/extensions.json";
  let file = app.files.get(path);
  if (!file) {
    await ensureFolder("/workspace/.seis");
    file = createFileEntry(path, "", "file");
  }
  file.content = JSON.stringify(app.extensions, null, 2);
  await saveFile(file);
}

function setupMenus() {
  document.addEventListener("click", (event) => {
    const menuButton = event.target.closest(".menu-button");
    if (menuButton) {
      const menu = menuButton.closest(".menu");
      const alreadyOpen = menu.classList.contains("is-open");
      closeMenus();
      if (!alreadyOpen) {
        menu.classList.add("is-open");
        menuButton.setAttribute("aria-expanded", "true");
        const rect = menuButton.getBoundingClientRect();
        const popover = $(".menu-popover", menu);
        popover.style.top = `${rect.bottom + 4}px`;
        popover.style.left = `${rect.left}px`;
      }
      return;
    }
    if (!event.target.closest(".menu")) closeMenus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenus();
      hidePalette();
      hideModal();
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "p") {
      event.preventDefault();
      showPalette();
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveActiveFile();
    }
  });
}

function closeMenus() {
  $$(".menu.is-open").forEach((menu) => {
    menu.classList.remove("is-open");
    $(".menu-button", menu)?.setAttribute("aria-expanded", "false");
  });
}

function setupActions() {
  document.addEventListener("click", async (event) => {
    const close = event.target.closest("[data-close-tab]");
    if (close) {
      event.stopPropagation();
      await closeTab(close.dataset.closeTab);
      return;
    }
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const path = target.dataset.path;
    closeMenus();

    const actions = {
      "new-file": createNewFile,
      "new-folder": createNewFolder,
      "save-file": saveActiveFile,
      "export-workspace": exportWorkspace,
      undo: () => app.editor?.trigger("keyboard", "undo", null),
      redo: () => app.editor?.trigger("keyboard", "redo", null),
      find: () => app.editor?.getAction("actions.find")?.run(),
      format: formatActiveFile,
      "select-all": () => app.editor?.trigger("keyboard", "editor.action.selectAll", null),
      "copy-path": () => navigator.clipboard?.writeText(app.activePath),
      "reveal-file": () => switchView("explorer"),
      "toggle-sidebar": toggleSidebar,
      "toggle-command-lens": toggleCommandLens,
      "select-evolution-phase": () => selectEvolutionPhase(target.dataset.evolutionPhase),
      "toggle-minimap": toggleMinimap,
      "toggle-word-wrap": toggleWordWrap,
      "quick-open": showPalette,
      "next-tab": nextTab,
      "previous-tab": previousTab,
      "run-active": runActiveFile,
      "stop-run": () => appendOutput("Run stopped."),
      "restart-run": async () => {
        appendOutput("Run restarted.");
        await runActiveFile();
      },
      "open-debug": () => switchView("run"),
      "new-terminal": () => appendTermLine("New terminal tab created in this sandbox session.", "muted"),
      "clear-terminal": clearTerminal,
      "start-claude": startClaudeRepl,
      "open-ai-repl": startClaudeRepl,
      "focus-terminal": focusTerminal,
      "show-five-year-plan": showFiveYearPlan,
      "show-shortcuts": showShortcuts,
      "show-about": showAbout,
      "reset-demo": resetDemo,
      "command-palette": showPalette,
      "run-search": renderSearchResults,
      "replace-one": () => replaceMatches(false),
      "replace-all": () => replaceMatches(true),
      "refresh-source": renderSourceControl,
      "commit-staged": commitStaged,
      "refresh-extensions": renderExtensions,
      "show-provider-status": showProviderStatus,
      "show-language-list": showLanguageList,
      "show-storage": showStorage,
      "show-line-column": () => app.editor?.focus(),
      "close-modal": hideModal
    };

    if (action === "open-file" || action === "activate-tab") await openFile(path);
    else if (action === "open-search-result") await openFile(path, Number(target.dataset.line || "1"));
    else if (action === "stage-file") await stageFile(path);
    else if (action === "unstage-file") await unstageFile(path);
    else if (action === "install-extension") await updateExtension(target.dataset.id, { installed: true, enabled: true });
    else if (action === "uninstall-extension") await updateExtension(target.dataset.id, { installed: false, enabled: false });
    else if (action === "enable-extension") await updateExtension(target.dataset.id, { enabled: true });
    else if (action === "disable-extension") await updateExtension(target.dataset.id, { enabled: false });
    else if (actions[action]) await actions[action]();
  });

  $$("[data-view-button]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.viewButton));
  });

  $$("[data-bottom-panel]").forEach((button) => {
    button.addEventListener("click", () => switchBottomPanel(button.dataset.bottomPanel));
  });

  $("[data-search-query]")?.addEventListener("input", renderSearchResults);
  $("[data-extension-search]")?.addEventListener("input", renderExtensions);
}

function switchView(view) {
  app.activeView = view;
  $(".workspace").dataset.view = view;
  $$("[data-view-button]").forEach((button) => button.classList.toggle("is-active", button.dataset.viewButton === view));
  $$("[data-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === view));
}

function switchBottomPanel(panel) {
  $$("[data-bottom-panel]").forEach((button) => button.classList.toggle("is-active", button.dataset.bottomPanel === panel));
  $$("[data-bottom-content]").forEach((content) => content.classList.toggle("is-active", content.dataset.bottomContent === panel));
}

function toggleSidebar() {
  $(".workspace").classList.toggle("sidebar-hidden");
}

async function toggleCommandLens() {
  app.settings.commandLens = !app.settings.commandLens;
  await saveSetting("settings", app.settings);
  renderCommandLens();
  appendOutput(`Command Lens ${app.settings.commandLens ? "shown" : "hidden"}.`);
}

function focusTerminal() {
  switchBottomPanel("terminal");
  const input = $("[data-terminal-input]");
  input?.focus();
  appendTermLine("Command Lens focused the virtual terminal.", "muted");
}

async function selectEvolutionPhase(phaseId) {
  const phase = evolutionPhases.find((item) => item.id === phaseId) || evolutionPhases[0];
  app.settings.evolutionPhaseId = phase.id;
  app.settings.commandLens = true;
  await saveSetting("settings", app.settings);
  renderCommandLens();
  appendOutput(`Command Lens selected ${phase.horizon}: ${phase.title}. Next action: ${phase.nextAction}`);
}

async function toggleMinimap() {
  app.settings.minimap = !app.settings.minimap;
  await saveSetting("settings", app.settings);
  app.editor?.updateOptions({ minimap: { enabled: app.settings.minimap } });
  appendOutput(`Minimap ${app.settings.minimap ? "enabled" : "disabled"}.`);
}

async function toggleWordWrap() {
  app.settings.wordWrap = app.settings.wordWrap === "on" ? "off" : "on";
  await saveSetting("settings", app.settings);
  app.editor?.updateOptions({ wordWrap: app.settings.wordWrap });
  appendOutput(`Word wrap ${app.settings.wordWrap}.`);
}

function nextTab() {
  const index = app.openTabs.indexOf(app.activePath);
  const next = app.openTabs[(index + 1) % app.openTabs.length];
  if (next) openFile(next);
}

function previousTab() {
  const index = app.openTabs.indexOf(app.activePath);
  const next = app.openTabs[(index - 1 + app.openTabs.length) % app.openTabs.length];
  if (next) openFile(next);
}

async function formatActiveFile() {
  const file = app.files.get(app.activePath);
  if (!file) return;
  let content = app.monacoReady && app.editor ? app.editor.getValue() : file.content;
  if (file.path.endsWith(".json")) {
    try {
      content = JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      appendOutput("Format failed: invalid JSON.");
      return;
    }
  } else {
    content = content.replace(/[ \t]+$/gm, "");
  }
  file.content = content;
  await saveFile(file);
  setEditorContent(file);
  appendOutput(`Formatted ${file.path}.`);
}

async function runActiveFile() {
  const file = app.files.get(app.activePath);
  if (!file) return;
  switchBottomPanel("output");
  if (file.path.endsWith(".html")) {
    showModal("Browser Sandbox Preview", `<iframe sandbox="allow-scripts" srcdoc="${escapeAttr(file.content)}"></iframe>`);
    appendOutput(`Preview opened for ${file.path}.`);
  } else if (file.path.endsWith(".js") || file.path.endsWith(".ts")) {
    const lines = file.content.split("\n").length;
    appendOutput(`Browser sandbox accepted ${basename(file.path)} (${lines} lines). Native execution is intentionally disabled in this static slice.`);
  } else if (file.path.endsWith(".md")) {
    showModal("Markdown Preview", `<pre>${escapeHtml(file.content)}</pre>`);
    appendOutput(`Markdown preview opened for ${file.path}.`);
  } else {
    appendOutput(`No run configuration for ${file.path}.`);
  }
}

function appendOutput(text) {
  const output = $("[data-output-log]");
  if (!output) return;
  output.textContent += `${new Date().toLocaleTimeString()} ${text}\n`;
}

function clearTerminal() {
  $("[data-terminal-output]").replaceChildren();
}

function appendTermLine(text, className = "") {
  const output = $("[data-terminal-output]");
  const line = document.createElement("div");
  line.className = `terminal-line ${className}`.trim();
  line.textContent = text;
  output.append(line);
  output.scrollTop = output.scrollHeight;
  return line;
}

function appendTermHtml(html, className = "") {
  const output = $("[data-terminal-output]");
  const line = document.createElement("div");
  line.className = `terminal-line ${className}`.trim();
  line.innerHTML = html;
  output.append(line);
  output.scrollTop = output.scrollHeight;
  return line;
}

function setupTerminal() {
  const form = $("[data-terminal-form]");
  const input = $("[data-terminal-input]");
  appendTermLine("SEIS Code virtual terminal. Type help, ls, cat README.md, or claude.", "muted");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const command = input.value.trim();
    if (!command) return;
    input.value = "";
    queueTerminalCommand(command);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      app.historyIndex = Math.max(0, app.historyIndex - 1);
      input.value = app.terminalHistory[app.historyIndex] || "";
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      app.historyIndex = Math.min(app.terminalHistory.length, app.historyIndex + 1);
      input.value = app.terminalHistory[app.historyIndex] || "";
    }
    if (event.key === "Tab") {
      event.preventDefault();
      input.value = completeCommand(input.value);
    }
  });
}

function queueTerminalCommand(command) {
  app.terminalQueue = app.terminalQueue
    .catch(() => undefined)
    .then(() => processTerminalCommand(command));
  return app.terminalQueue;
}

async function processTerminalCommand(command) {
  app.terminalBusy = true;
  try {
    app.terminalHistory.push(command);
    app.historyIndex = app.terminalHistory.length;
    await saveSetting("terminalHistory", app.terminalHistory.slice(-200));
    appendTermLine(`${app.repl.active ? "claude(local-demo)> " : `${app.cwd} $ `}${command}`, "command");
    if (app.repl.active) await handleClaudeInput(command);
    else await handleShellInput(command);
  } finally {
    app.terminalBusy = false;
    renderStatus();
  }
}

function completeCommand(value) {
  const commands = "help clear pwd ls cd mkdir touch cat echo printf head tail cp mv rm rmdir grep find tree history date whoami uname env export which open code nano stat wc sort uniq basename dirname sleep claude exit".split(" ");
  const parts = value.split(/\s+/);
  if (parts.length === 1) {
    const match = commands.find((command) => command.startsWith(parts[0]));
    return match || value;
  }
  const last = parts.at(-1);
  const match = Array.from(app.files.keys()).map((path) => path.replace(`${app.cwd}/`, "")).find((path) => path.startsWith(last));
  if (match) {
    parts[parts.length - 1] = match;
    return parts.join(" ");
  }
  return value;
}

async function handleShellInput(commandLine) {
  try {
    const result = await executePipeline(commandLine);
    if (result.clear) clearTerminal();
    if (result.output) appendTermLine(result.output);
  } catch (error) {
    appendTermLine(error.message, "error");
  }
}

async function executePipeline(commandLine, input = "") {
  const segments = splitPipes(commandLine);
  let current = input;
  let clear = false;
  for (const segment of segments) {
    const result = await executeCommand(segment, current);
    current = result.output || "";
    if (result.clear) clear = true;
  }
  return { output: current, clear };
}

function splitPipes(line) {
  const parts = [];
  let current = "";
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if ((char === '"' || char === "'") && line[i - 1] !== "\\") quote = quote === char ? null : quote || char;
    if (char === "|" && !quote) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function tokenize(line) {
  const tokens = [];
  let current = "";
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if ((char === '"' || char === "'") && line[i - 1] !== "\\") {
      if (quote === char) quote = null;
      else if (!quote) quote = char;
      else current += char;
      continue;
    }
    if (/\s/.test(char) && !quote) {
      if (current) tokens.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current) tokens.push(current);
  return tokens;
}

async function executeCommand(segment, input = "") {
  let tokens = tokenize(segment);
  if (!tokens.length) return { output: input };
  let redirect = null;
  const redirectIndex = tokens.findIndex((token) => token === ">" || token === ">>");
  if (redirectIndex !== -1) {
    redirect = { append: tokens[redirectIndex] === ">>", path: normalizePath(tokens[redirectIndex + 1]) };
    tokens = tokens.slice(0, redirectIndex);
  }
  const [command, ...args] = tokens;
  let output = await runCommand(command, args, input);
  if (redirect) {
    const existing = app.files.get(redirect.path);
    const content = redirect.append && existing ? `${existing.content}${output}` : output;
    await writeVirtualFile(redirect.path, content);
    output = "";
  }
  return typeof output === "object" ? output : { output };
}

async function runCommand(command, args, input) {
  switch (command) {
    case "help":
      return "Commands: help clear pwd ls cd mkdir touch cat echo printf head tail cp mv rm rmdir grep find tree history date whoami uname env export which open code nano stat wc sort uniq basename dirname sleep claude exit";
    case "clear":
      return { output: "", clear: true };
    case "pwd":
      return app.cwd;
    case "ls":
      return listVirtualDir(args[0] ? normalizePath(args[0]) : app.cwd);
    case "cd": {
      const next = normalizePath(args[0] || WORKSPACE);
      const entry = app.files.get(next);
      if (!entry || entry.type !== "folder") throw new Error(`cd: not a folder: ${next}`);
      app.cwd = next;
      await saveSetting("cwd", app.cwd);
      return "";
    }
    case "mkdir":
      for (const arg of args) await ensureFolder(normalizePath(arg));
      await reloadState();
      renderAll();
      return "";
    case "touch":
      for (const arg of args) await writeVirtualFile(normalizePath(arg), app.files.get(normalizePath(arg))?.content || "");
      return "";
    case "cat":
      return args.map((arg) => readVirtualFile(normalizePath(arg))).join("\n");
    case "echo":
      return `${args.join(" ")}\n`;
    case "printf":
      return args.join(" ").replace(/\\n/g, "\n");
    case "head":
      return readInputOrFiles(args, input).split("\n").slice(0, 10).join("\n");
    case "tail":
      return readInputOrFiles(args, input).split("\n").slice(-10).join("\n");
    case "cp":
      await copyVirtual(args[0], args[1]);
      return "";
    case "mv":
      await moveVirtual(args[0], args[1]);
      return "";
    case "rm":
      await removeVirtual(args.filter((arg) => !arg.startsWith("-")));
      return "";
    case "rmdir":
      await removeVirtual(args);
      return "";
    case "grep":
      return grepVirtual(args, input);
    case "find":
      return findVirtual(args[0] ? normalizePath(args[0]) : app.cwd);
    case "tree":
      return treeVirtual(args[0] ? normalizePath(args[0]) : app.cwd);
    case "history":
      return app.terminalHistory.map((item, index) => `${index + 1} ${item}`).join("\n");
    case "date":
      return new Date().toString();
    case "whoami":
      return "seis";
    case "uname":
      return "SEIS Browser Sandbox";
    case "env":
      return Object.entries(app.env).map(([key, value]) => `${key}=${value}`).join("\n");
    case "export": {
      const [key, value] = args.join(" ").split("=");
      if (!key) return "";
      app.env[key] = value || "";
      return "";
    }
    case "which":
      return args.map((arg) => `/system/virtual-bin/${arg}`).join("\n");
    case "open":
    case "code":
    case "nano":
      await openFile(normalizePath(args[0] || app.activePath));
      return `Opened ${normalizePath(args[0] || app.activePath)}`;
    case "stat":
      return statVirtual(normalizePath(args[0] || app.activePath));
    case "wc": {
      const text = readInputOrFiles(args, input);
      return `${text.split("\n").length} ${text.split(/\s+/).filter(Boolean).length} ${text.length}`;
    }
    case "sort":
      return readInputOrFiles(args, input).split("\n").sort().join("\n");
    case "uniq":
      return Array.from(new Set(readInputOrFiles(args, input).split("\n"))).join("\n");
    case "basename":
      return basename(args[0] || app.activePath);
    case "dirname":
      return dirname(normalizePath(args[0] || app.activePath));
    case "sleep":
      await new Promise((resolve) => window.setTimeout(resolve, Math.min(Number(args[0] || 1) * 1000, 3000)));
      return "";
    case "claude":
      startClaudeRepl();
      return "";
    case "exit":
      return "Shell session remains available in the browser sandbox.";
    default:
      throw new Error(`${command}: command not found`);
  }
}

function readInputOrFiles(args, input) {
  if (input) return input;
  if (!args.length) return "";
  return args.map((arg) => readVirtualFile(normalizePath(arg))).join("\n");
}

function listVirtualDir(path) {
  const safePath = normalizePath(path);
  const entry = app.files.get(safePath);
  if (!entry) throw new Error(`ls: no such path: ${safePath}`);
  if (entry.type === "file") return entry.name;
  return Array.from(app.files.values())
    .filter((file) => file.parent === safePath)
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((file) => `${file.type === "folder" ? "dir " : "file"} ${file.name}`)
    .join("\n");
}

function readVirtualFile(path) {
  const safePath = normalizePath(path);
  const file = app.files.get(safePath);
  if (!file || file.type !== "file") throw new Error(`cat: no such file: ${safePath}`);
  return file.content;
}

async function writeVirtualFile(path, content) {
  const safePath = normalizePath(path);
  await ensureFolder(dirname(safePath));
  const existing = app.files.get(safePath);
  const entry = existing || createFileEntry(safePath, "");
  entry.type = "file";
  entry.content = content;
  await saveFile(entry);
}

async function copyVirtual(from, to) {
  const source = app.files.get(normalizePath(from));
  if (!source || source.type !== "file") throw new Error(`cp: no such file: ${from}`);
  await writeVirtualFile(normalizePath(to), source.content);
}

async function moveVirtual(from, to) {
  const sourcePath = normalizePath(from);
  const destPath = normalizePath(to);
  const source = app.files.get(sourcePath);
  if (!source) throw new Error(`mv: no such path: ${from}`);
  if (source.type === "folder") throw new Error("mv: folder moves are not enabled in this browser slice.");
  await writeVirtualFile(destPath, source.content);
  await remove("files", sourcePath);
  app.files.delete(sourcePath);
  app.openTabs = app.openTabs.map((path) => (path === sourcePath ? destPath : path));
  app.activePath = app.activePath === sourcePath ? destPath : app.activePath;
  await saveSetting("openTabs", app.openTabs);
  await saveSetting("activePath", app.activePath);
  renderAll();
}

async function removeVirtual(paths) {
  for (const rawPath of paths) {
    const path = normalizePath(rawPath);
    if (path === WORKSPACE) throw new Error("rm: refusing to remove workspace root");
    const entry = app.files.get(path);
    if (!entry) throw new Error(`rm: no such path: ${path}`);
    const children = Array.from(app.files.keys()).filter((child) => child.startsWith(`${path}/`));
    for (const child of children) {
      await remove("files", child);
      app.files.delete(child);
    }
    await remove("files", path);
    app.files.delete(path);
    app.openTabs = app.openTabs.filter((tab) => tab !== path);
  }
  if (!app.files.has(app.activePath)) app.activePath = app.openTabs[0] || "/workspace/README.md";
  await saveSetting("openTabs", app.openTabs);
  await saveSetting("activePath", app.activePath);
  if (app.files.has(app.activePath)) await openFile(app.activePath);
  renderAll();
}

function grepVirtual(args, input) {
  const query = args[0];
  if (!query) throw new Error("grep: missing query");
  const text = input || args.slice(1).map((arg) => readVirtualFile(normalizePath(arg))).join("\n");
  return text
    .split("\n")
    .filter((line) => line.includes(query))
    .join("\n");
}

function findVirtual(path) {
  const safePath = normalizePath(path);
  return Array.from(app.files.keys())
    .filter((filePath) => filePath === safePath || filePath.startsWith(`${safePath}/`))
    .sort()
    .join("\n");
}

function treeVirtual(path) {
  const safePath = normalizePath(path);
  const lines = [safePath];
  Array.from(app.files.values())
    .filter((file) => file.path !== safePath && file.path.startsWith(`${safePath}/`))
    .sort((a, b) => a.path.localeCompare(b.path))
    .forEach((file) => {
      const depth = file.path.replace(`${safePath}/`, "").split("/").length - 1;
      lines.push(`${"  ".repeat(depth)}- ${file.name}${file.type === "folder" ? "/" : ""}`);
    });
  return lines.join("\n");
}

function statVirtual(path) {
  const safePath = normalizePath(path);
  const file = app.files.get(safePath);
  if (!file) throw new Error(`stat: no such path: ${safePath}`);
  return [
    `Path: ${file.path}`,
    `Type: ${file.type}`,
    `Size: ${file.content?.length || 0} bytes`,
    `Language: ${file.language || "n/a"}`,
    `Updated: ${file.updatedAt}`
  ].join("\n");
}

function extractRequestedPath(prompt) {
  const explicit = String(prompt).match(/(?:path|file|open|read|write|append|patch|delete|remove|rename|move)\s+((?:\/workspace\/)?[A-Za-z0-9._/-]+\.[A-Za-z0-9]+)/i);
  if (explicit?.[1]) return explicit[1].startsWith("/") ? explicit[1] : normalizePath(explicit[1]);
  const loose = String(prompt).match(/(\/workspace\/[A-Za-z0-9._/-]+|[A-Za-z0-9._/-]+\.[A-Za-z0-9]+)/);
  if (!loose?.[1]) return "";
  return loose[1].startsWith("/") ? loose[1] : normalizePath(loose[1]);
}

function extractQuotedContent(prompt) {
  const match = String(prompt).match(/"([^"]+)"|'([^']+)'|`([^`]+)`/);
  return match?.[1] || match?.[2] || match?.[3] || "";
}

function showVirtualDiff(path) {
  const safePath = normalizePath(path);
  const file = app.files.get(safePath);
  if (!file || file.type !== "file") throw new Error(`show_diff: no such file: ${safePath}`);
  if (file.content === file.baseContent) return `No diff for ${safePath}.`;
  const before = file.baseContent.split("\n");
  const after = file.content.split("\n");
  const max = Math.max(before.length, after.length);
  const lines = [`diff -- ${safePath}`];
  for (let index = 0; index < max; index += 1) {
    if (before[index] === after[index]) continue;
    if (before[index] !== undefined) lines.push(`- ${before[index]}`);
    if (after[index] !== undefined) lines.push(`+ ${after[index]}`);
    if (lines.length >= 20) {
      lines.push("... diff truncated in Local Demo");
      break;
    }
  }
  return lines.join("\n");
}

function startClaudeRepl() {
  app.repl.active = true;
  switchBottomPanel("terminal");
  appendTermLine(`Entering Claude Code-style REPL. Runtime identity: Local Demo (${aiTruthfulnessMarker}). No Anthropic request is made.`, "muted");
  appendTermLine("Use /help, /tools, /files, /model, /status, /exit. Natural language prompts stream a local demo response.", "muted");
  renderStatus();
  $("[data-terminal-input]")?.focus();
}

async function handleClaudeInput(command) {
  if (command.startsWith("/")) {
    await handleSlashCommand(command);
    return;
  }
  app.repl.history.push({ role: "user", content: command, createdAt: new Date().toISOString() });
  const calls = inferToolCalls(command);
  for (const call of calls) {
    await runDemoToolCall(call.name, call.args);
  }
  await streamDemoResponse(command, calls);
}

async function handleSlashCommand(command) {
  const [slash, ...args] = command.split(/\s+/);
  switch (slash) {
    case "/help":
      appendTermLine("Slash commands: /help /clear /exit /model /status /files /history /tools /compact /new /rename /save /load /theme");
      break;
    case "/clear":
      clearTerminal();
      break;
    case "/exit":
      app.repl.active = false;
      appendTermLine("Exited Claude Code-style REPL. Returning to virtual shell.", "muted");
      renderStatus();
      break;
    case "/model":
      appendTermLine(`Current model: Local Demo (${aiTruthfulnessMarker}). A real Claude response requires a configured backend Anthropic provider.`);
      break;
    case "/status":
      appendTermLine(`Status: Local Demo available (${aiTruthfulnessMarker}); Anthropic missing key; cloud fallback disabled in this static single URL.`);
      break;
    case "/files":
      appendTermLine(findVirtual(WORKSPACE));
      break;
    case "/history":
      appendTermLine(app.repl.history.map((item, index) => `${index + 1}. ${item.role}: ${item.content}`).join("\n") || "No REPL history.");
      break;
    case "/tools":
      appendTermLine(
        claudeToolDefinitions
          .map((tool) => `${tool.name}${tool.destructive ? " [approval-gated]" : ""} - ${tool.description}`)
          .join("\n")
      );
      break;
    case "/compact":
      app.repl.history = app.repl.history.slice(-6);
      appendTermLine("Conversation compacted to the last 6 local-demo messages.");
      break;
    case "/new":
      await writeVirtualFile(normalizePath(args[0] || "notes/repl-note.md"), "# REPL Note\n\nCreated from /new.\n");
      appendTermLine(`Created ${normalizePath(args[0] || "notes/repl-note.md")}.`);
      break;
    case "/rename": {
      if (args.length < 2) {
        appendTermLine("Usage: /rename oldPath newPath", "error");
      } else {
        await moveVirtual(args[0], args[1]);
        appendTermLine(`Renamed ${args[0]} to ${args[1]}.`);
      }
      break;
    }
    case "/save":
      await saveActiveFile();
      appendTermLine(`Saved ${app.activePath}.`);
      break;
    case "/load":
      await openFile(normalizePath(args[0] || app.activePath));
      appendTermLine(`Loaded ${normalizePath(args[0] || app.activePath)}.`);
      break;
    case "/theme":
      app.settings.theme = app.settings.theme === "seis-dark" ? "high-contrast" : "seis-dark";
      await saveSetting("settings", app.settings);
      appendTermLine(`Theme preference set to ${app.settings.theme}.`);
      break;
    default:
      appendTermLine(`Unknown slash command: ${slash}`, "error");
  }
}

function inferToolCalls(prompt) {
  const lower = prompt.toLowerCase();
  const calls = [];
  const requestedPath = extractRequestedPath(prompt);
  const quotedContent = extractQuotedContent(prompt);
  if (lower.includes("list") || lower.includes("files")) calls.push({ name: "list_files", args: { path: requestedPath || WORKSPACE } });
  if (lower.includes("read") || lower.includes("summarize")) calls.push({ name: "read_file", args: { path: requestedPath || app.activePath } });
  if (lower.includes("search")) calls.push({ name: "search_files", args: { query: quotedContent || "SEIS" } });
  if (lower.includes("create")) calls.push({ name: "create_file", args: { path: requestedPath || "/workspace/notes/claude-created.md" } });
  if (lower.includes("write")) {
    calls.push({
      name: "write_file",
      args: {
        path: requestedPath || "/workspace/notes/claude-written.md",
        content: quotedContent || "# Written by Local Demo REPL\n\nThis file was written through the browser-local tool registry.\n"
      }
    });
  }
  if (lower.includes("append")) {
    calls.push({
      name: "append_file",
      args: {
        path: requestedPath || app.activePath,
        content: quotedContent || "\n\nAppended by Local Demo REPL.\n"
      }
    });
  }
  if (lower.includes("patch")) {
    calls.push({
      name: "apply_patch",
      args: {
        path: requestedPath || app.activePath,
        search: "browser workspace slice",
        replace: "single-URL VS Code Web replica"
      }
    });
  }
  if (lower.includes("rename")) {
    calls.push({
      name: "rename_file",
      args: {
        from: requestedPath || "/workspace/notes/claude-created.md",
        to: "/workspace/notes/claude-renamed.md"
      }
    });
  }
  if (lower.includes("move")) {
    calls.push({
      name: "move_file",
      args: {
        from: requestedPath || "/workspace/notes/claude-renamed.md",
        to: "/workspace/notes/archive/claude-renamed.md"
      }
    });
  }
  if (lower.includes("delete") || lower.includes("remove")) {
    calls.push({
      name: "delete_file",
      args: {
        path: requestedPath || "/workspace/notes/archive/claude-renamed.md",
        cancelled: lower.includes("workspace") || lower.includes("all files")
      }
    });
  }
  if (lower.includes("command") || lower.includes("terminal") || lower.includes("run ")) {
    calls.push({ name: "run_virtual_command", args: { command: quotedContent || "pwd" } });
  }
  if (lower.includes("open")) calls.push({ name: "open_file_in_editor", args: { path: requestedPath || app.activePath } });
  if (lower.includes("diff")) calls.push({ name: "show_diff", args: { path: requestedPath || app.activePath } });
  if (!calls.length) calls.push({ name: "get_file_metadata", args: { path: app.activePath } });
  return calls.slice(0, 5);
}

async function runDemoToolCall(name, args) {
  const definition = claudeToolDefinitions.find((tool) => tool.name === name);
  if (!definition) {
    appendTermLine(`Tool is not registered: ${name}`, "error");
    return;
  }
  const run = {
    name,
    args,
    status: "pending",
    startedAt: new Date().toISOString(),
    finishedAt: ""
  };
  app.repl.toolRuns.push(run);
  const node = appendTermHtml(`<span class="tool-call is-pending">${escapeHtml(name)} pending</span>`);
  await wait(240);
  if (args.cancelled) {
    run.status = "cancelled";
    run.finishedAt = new Date().toISOString();
    node.innerHTML = `<span class="tool-call is-cancelled">${escapeHtml(name)} cancelled</span>`;
    appendTermLine("Tool cancelled by Local Demo safety policy. Broad workspace deletion is not allowed.", "muted");
    return;
  }
  run.status = "running";
  node.innerHTML = `<span class="tool-call is-running">${escapeHtml(name)} running</span>`;
  let output = "";
  try {
    const toolPath = args.path ? normalizePath(args.path) : app.activePath;
    if (name === "list_files") output = findVirtual(toolPath);
    if (name === "read_file") output = readVirtualFile(toolPath).slice(0, 500);
    if (name === "create_file") {
      await writeVirtualFile(toolPath, "# Created by Local Demo REPL\n\nThis file was created by an approved browser-local tool call.\n");
      output = `created ${toolPath}`;
    }
    if (name === "write_file") {
      await writeVirtualFile(toolPath, args.content || "");
      output = `wrote ${toolPath}`;
    }
    if (name === "append_file") {
      const previous = app.files.get(toolPath)?.content || "";
      await writeVirtualFile(toolPath, `${previous}${args.content || ""}`);
      output = `appended ${toolPath}`;
    }
    if (name === "apply_patch") {
      const file = app.files.get(toolPath);
      if (!file || file.type !== "file") throw new Error(`apply_patch: no such file: ${toolPath}`);
      const search = args.search || "";
      const replacement = args.replace || "";
      file.content = search && file.content.includes(search)
        ? file.content.replace(search, replacement)
        : `${file.content}\n\n${replacement || "Patch note from Local Demo REPL."}\n`;
      await saveFile(file);
      if (toolPath === app.activePath) setEditorContent(file);
      output = `patched ${toolPath}`;
    }
    if (name === "rename_file" || name === "move_file") {
      const from = normalizePath(args.from || toolPath);
      const to = normalizePath(args.to || `${dirname(from)}/${basename(from).replace(/(\.[^.]+)?$/, "-moved$1")}`);
      await moveVirtual(from, to);
      output = `${name === "rename_file" ? "renamed" : "moved"} ${from} -> ${to}`;
    }
    if (name === "delete_file") {
      if (definition.destructive && app.files.get(toolPath)?.type === "folder") {
        throw new Error("delete_file: folder deletion requires explicit multi-file approval and is blocked in Local Demo.");
      }
      await removeVirtual([toolPath]);
      output = `deleted ${toolPath}`;
    }
    if (name === "search_files") output = searchFiles(args.query || "SEIS").slice(0, 5).map((match) => `${match.path}:${match.line}`).join("\n") || "No matches.";
    if (name === "get_file_metadata") output = statVirtual(toolPath);
    if (name === "run_virtual_command") output = (await executePipeline(args.command || "pwd")).output || "(no output)";
    if (name === "open_file_in_editor") {
      await openFile(toolPath);
      output = `opened ${toolPath}`;
    }
    if (name === "show_diff") output = showVirtualDiff(toolPath);
    await wait(260);
    run.status = "success";
    run.finishedAt = new Date().toISOString();
    node.innerHTML = `<span class="tool-call is-success">${escapeHtml(name)} success</span>`;
    if (output) appendTermLine(output, "muted");
  } catch (error) {
    run.status = "failed";
    run.finishedAt = new Date().toISOString();
    node.innerHTML = `<span class="tool-call is-failed">${escapeHtml(name)} failed</span>`;
    appendTermLine(error.message, "error");
  }
}

async function streamDemoResponse(prompt, calls) {
  const line = appendTermLine("Local Demo response: not Anthropic Claude output. ", "");
  const toolText = calls.map((call) => call.name).join(", ");
  const text = `I inspected the browser workspace using ${toolText}. It is browser-local demo text. For "${prompt}", the safe next step is to edit only virtual files, keep provider identity visible, and save changes to IndexedDB.`;
  const chunks = text.match(/.{1,48}/g) || [text];
  for (const chunk of chunks) {
    line.textContent += chunk;
    $("[data-terminal-output]").scrollTop = $("[data-terminal-output]").scrollHeight;
    await wait(32);
  }
  app.repl.history.push({ role: "assistant", content: text, createdAt: new Date().toISOString() });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function showPalette() {
  const palette = $("[data-palette]");
  palette.hidden = false;
  const input = $("[data-palette-input]");
  input.value = "";
  app.paletteActiveIndex = 0;
  renderPalette("");
  input.focus();
}

function hidePalette() {
  $("[data-palette]").hidden = true;
  const input = $("[data-palette-input]");
  if (input) input.setAttribute("aria-activedescendant", "");
}

function renderPalette(query) {
  const results = $("[data-palette-results]");
  if (!results) return;
  const input = $("[data-palette-input]");
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const allItems = buildPaletteItems();
  const matchesQuery = (item) => {
    if (!normalizedQuery) return true;
    return [item.label, item.detail, item.group, ...(item.keywords || [])]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  };
  const recentIds = new Set(app.paletteRecentCommandIds);
  const recentItems = app.paletteRecentCommandIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean)
    .filter(matchesQuery);
  const otherItems = allItems
    .filter((item) => !recentIds.has(item.id))
    .filter(matchesQuery);
  const grouped = [];
  if (recentItems.length) grouped.push({ group: "Recent", items: recentItems.slice(0, 5) });
  for (const groupName of ["Commands", "Five-Year Rail", "Files"]) {
    const items = otherItems.filter((item) => item.group === groupName).slice(0, groupName === "Files" ? 8 : 10);
    if (items.length) grouped.push({ group: groupName, items });
  }

  app.paletteItems = grouped.flatMap((group) => group.items);
  if (app.paletteActiveIndex >= app.paletteItems.length) app.paletteActiveIndex = Math.max(0, app.paletteItems.length - 1);
  if (app.paletteActiveIndex < 0) app.paletteActiveIndex = 0;
  results.replaceChildren();

  const status = $("[data-palette-status]");
  if (status) status.textContent = `${app.paletteItems.length} result${app.paletteItems.length === 1 ? "" : "s"} - arrows move, Enter runs`;
  const recentStatus = $("[data-palette-recent-status]");
  if (recentStatus) recentStatus.textContent = app.paletteRecentCommandIds.length
    ? `${Math.min(app.paletteRecentCommandIds.length, 5)} recent command${app.paletteRecentCommandIds.length === 1 ? "" : "s"}`
    : "No recent commands yet";

  if (!app.paletteItems.length) {
    const empty = document.createElement("div");
    empty.className = "palette-empty";
    empty.textContent = "No matching command, phase, or file.";
    results.append(empty);
    if (input) input.setAttribute("aria-activedescendant", "");
    return;
  }

  let runningIndex = 0;
  grouped.forEach((group) => {
    const heading = document.createElement("div");
    heading.className = "palette-group";
    heading.textContent = group.group;
    results.append(heading);
    group.items.forEach((item) => {
      const index = runningIndex;
      runningIndex += 1;
      const selected = index === app.paletteActiveIndex;
      const buttonId = `palette-result-${index}`;
      const button = document.createElement("button");
      button.id = buttonId;
      button.type = "button";
      button.className = `palette-result ${selected ? "is-active" : ""}`;
      button.dataset.paletteIndex = String(index);
      button.dataset.commandId = item.id;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(selected));
      button.innerHTML = `
        <span class="palette-result-main">
          <strong>${escapeHtml(item.label)}</strong>
          <em>${escapeHtml(item.group)}</em>
        </span>
        <span class="palette-result-detail">${escapeHtml(item.detail || "")}</span>
      `;
      button.addEventListener("click", async () => {
        app.paletteActiveIndex = index;
        await runPaletteItem(index);
      });
      results.append(button);
    });
  });

  if (input) input.setAttribute("aria-activedescendant", `palette-result-${app.paletteActiveIndex}`);
}

function buildPaletteItems() {
  return [
    { id: "new-file", group: "Commands", label: "New File", action: createNewFile, detail: "Create a virtual file", keywords: ["file", "create"] },
    { id: "save-file", group: "Commands", label: "Save File", action: saveActiveFile, detail: app.activePath, keywords: ["write", "persist"] },
    { id: "start-claude", group: "Commands", label: "Start Claude REPL", action: startClaudeRepl, detail: "Local Demo runtime", keywords: ["ai", "terminal", "local demo"] },
    { id: "toggle-command-lens", group: "Commands", label: "Toggle Command Lens", action: toggleCommandLens, detail: "Apple-grade control rail", keywords: ["lens", "inspector"] },
    { id: "focus-terminal", group: "Commands", label: "Focus Terminal", action: focusTerminal, detail: "Virtual shell", keywords: ["shell", "terminal"] },
    { id: "open-five-year-plan", group: "Commands", label: "Open Five-Year Plan", action: showFiveYearPlan, detail: "SEIS Code evolution map", keywords: ["roadmap", "apple"] },
    { id: "toggle-sidebar", group: "Commands", label: "Toggle Sidebar", action: toggleSidebar, detail: "Explorer rail", keywords: ["view", "side"] },
    { id: "toggle-word-wrap", group: "Commands", label: "Toggle Word Wrap", action: toggleWordWrap, detail: app.settings.wordWrap, keywords: ["editor", "wrap"] },
    { id: "toggle-minimap", group: "Commands", label: "Toggle Minimap", action: toggleMinimap, detail: app.settings.minimap ? "enabled" : "disabled", keywords: ["editor", "map"] },
    { id: "run-active", group: "Commands", label: "Run Active File", action: runActiveFile, detail: "Browser sandbox", keywords: ["debug", "preview"] },
    { id: "format-active", group: "Commands", label: "Format Document", action: formatActiveFile, detail: getLanguage(app.activePath), keywords: ["editor", "format"] },
    { id: "show-provider-status", group: "Commands", label: "Show AI Provider Status", action: showProviderStatus, detail: "Local Demo truth boundary", keywords: ["ai", "provider", "keys"] },
    ...evolutionPhases.map((phase) => ({
      id: `phase:${phase.id}`,
      group: "Five-Year Rail",
      label: `Command Lens: ${phase.horizon} ${phase.title}`,
      detail: `${phase.status} - ${phase.nextAction}`,
      keywords: ["five year", "apple", "roadmap", phase.id, phase.qualityGate],
      action: () => selectEvolutionPhase(phase.id)
    })),
    ...Array.from(app.files.values())
      .filter((file) => file.type === "file")
      .sort((a, b) => a.path.localeCompare(b.path))
      .map((file) => ({
        id: `file:${file.path}`,
        group: "Files",
        label: file.path.replace(`${WORKSPACE}/`, ""),
        detail: file.language,
        keywords: [file.path, basename(file.path), dirname(file.path)],
        action: () => openFile(file.path)
      }))
  ];
}

async function runPaletteItem(index = app.paletteActiveIndex) {
  const item = app.paletteItems[index];
  if (!item) return;
  hidePalette();
  await rememberPaletteCommand(item.id);
  await item.action();
}

async function rememberPaletteCommand(id) {
  app.paletteRecentCommandIds = [id, ...app.paletteRecentCommandIds.filter((item) => item !== id)].slice(0, 8);
  await saveSetting("paletteRecentCommandIds", app.paletteRecentCommandIds);
}

function movePaletteSelection(delta) {
  if (!app.paletteItems.length) return;
  app.paletteActiveIndex = (app.paletteActiveIndex + delta + app.paletteItems.length) % app.paletteItems.length;
  renderPalette($("[data-palette-input]")?.value || "");
}

function setupPalette() {
  $("[data-palette-input]")?.addEventListener("input", (event) => {
    app.paletteActiveIndex = 0;
    renderPalette(event.target.value);
  });
  $("[data-palette-input]")?.addEventListener("keydown", async (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      movePaletteSelection(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      movePaletteSelection(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      app.paletteActiveIndex = 0;
      renderPalette(event.currentTarget.value);
    } else if (event.key === "End") {
      event.preventDefault();
      app.paletteActiveIndex = Math.max(0, app.paletteItems.length - 1);
      renderPalette(event.currentTarget.value);
    } else if (event.key === "Enter") {
      event.preventDefault();
      await runPaletteItem();
    } else if (event.key === "Escape") {
      event.preventDefault();
      hidePalette();
    }
  });
  $("[data-palette]")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-palette]")) hidePalette();
  });
}

function showModal(title, html) {
  $("[data-modal-title]").textContent = title;
  $("[data-modal-body]").innerHTML = html;
  $("[data-modal]").hidden = false;
}

function hideModal() {
  $("[data-modal]").hidden = true;
}

function showShortcuts() {
  showModal(
    "Keyboard Shortcuts",
    `<ul>
      <li><strong>Cmd/Ctrl+P</strong> opens the command palette.</li>
      <li><strong>Cmd/Ctrl+S</strong> saves the active file.</li>
      <li><strong>Arrow Up/Down</strong> navigates terminal history.</li>
      <li><strong>Tab</strong> completes terminal commands and paths.</li>
    </ul>`
  );
}

function showAbout() {
  showModal(
    "About SEIS Code",
    `<p>SEIS Code is a single URL static IDE slice with Monaco, IndexedDB persistence, browser-safe terminal commands, five activity views, eight top menus, and a Claude Code-style Local Demo REPL.</p>
    <p>Provider identity remains truthful: Local Demo is not Anthropic.</p>
    <p class="notice">Live AI is intentionally not claimed here. A real Claude response requires a backend Anthropic integration.</p>`
  );
}

function showFiveYearPlan() {
  showModal(
    "SEIS Code Five-Year Evolution",
    `<p class="notice">This plan is product direction, not a claim that every phase is implemented. Current live evidence is limited to the local browser IDE foundation.</p>
    <table>
      <tr><th>Horizon</th><th>Phase</th><th>Status</th><th>Evidence</th></tr>
      ${evolutionPhases.map((phase) => `
        <tr>
          <td>${escapeHtml(phase.horizon)}</td>
          <td>${escapeHtml(phase.title)}</td>
          <td>${escapeHtml(phase.status)}</td>
          <td>${escapeHtml(`${phase.evidence} Gate: ${phase.qualityGate}`)}</td>
        </tr>
      `).join("")}
    </table>`
  );
}

function showProviderStatus() {
  showModal(
    "AI Provider Status",
    `<table>
      <tr><th>Provider</th><th>Status</th><th>Reason</th></tr>
      <tr><td>Local Demo</td><td>Available</td><td>Runs entirely in browser logic.</td></tr>
      <tr><td>Anthropic Claude</td><td>Missing Key</td><td>No backend gateway exists in this static slice.</td></tr>
      <tr><td>Cloud fallback</td><td>Disabled</td><td>Local-only demo policy prevents silent provider switching.</td></tr>
    </table>`
  );
}

function showLanguageList() {
  showModal("Language Highlighting", `<p>Monaco language map: ${supportedLanguageModes.join(", ")}.</p>`);
}

function showStorage() {
  showModal("IndexedDB Storage", `<p>${app.files.size} file-system nodes, ${app.openTabs.length} open tabs, ${app.terminalHistory.length} terminal history entries, ${app.extensions.filter((item) => item.installed).length} installed extensions.</p>`);
}

async function resetDemo() {
  if (!confirm("Reset SEIS Code IndexedDB demo data?")) return;
  app.db.close();
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
  window.location.reload();
}

async function exportWorkspace() {
  const payload = {
    exportedAt: new Date().toISOString(),
    files: Array.from(app.files.values()),
    openTabs: app.openTabs,
    extensions: app.extensions,
    terminalHistory: app.terminalHistory
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "seis-code-workspace.json";
  link.click();
  URL.revokeObjectURL(url);
}

function setupWorkspaceBridge() {
  if (!("BroadcastChannel" in window)) return;
  const channel = new BroadcastChannel(WORKSPACE_CHANNEL);
  channel.addEventListener("message", async (event) => {
    if (event.data?.type !== "workspace-file-created") return;
    let safePath;
    try {
      safePath = normalizePath(event.data.path);
    } catch (error) {
      appendOutput(`Blocked external workspace update: ${error.message}`);
      return;
    }
    await reloadState();
    await loadSharedWorkspace(event.data.source || "workspace-bridge");
    renderAll();
    appendOutput(`Workspace updated from ${event.data.source || "external app"}: ${safePath}`);
  });
}

function exposeDiagnostics() {
  window.__SEIS_CODE__ = {
    languageModes: () => supportedLanguageModes.slice(),
    filePaths: () => Array.from(app.files.keys()).sort(),
    openTabs: () => app.openTabs.slice(),
    activePath: () => app.activePath,
    activeView: () => app.activeView,
    bottomPanel: () => $$("[data-bottom-content]").find((node) => node.classList.contains("is-active"))?.dataset.bottomContent || "",
    menuCount: () => $$("[data-menu]").length,
    activityViewCount: () => $$("[data-view-button]").length,
    bottomPanelCount: () => $$("[data-bottom-panel]").length,
    extensionCount: () => app.extensions.length,
    installedExtensionCount: () => app.extensions.filter((item) => item.installed).length,
    monacoReady: () => app.monacoReady,
    fallbackReady: () => app.fallbackReady,
    sharedVfs: () => ({
      available: Boolean(window.SEIS_SHARED_VFS),
      scope: window.SEIS_SHARED_VFS?.scope || "",
      mode: app.sharedVfsMode,
      lastSavedAt: app.sharedVfsLastSavedAt,
      error: app.sharedVfsError,
      itemCount: sharedEntriesFromCode().length
    }),
    providerText: () => $("[data-provider-status]")?.textContent || "",
    terminalText: () => $("[data-terminal-output]")?.textContent || "",
    outputText: () => $("[data-output-log]")?.textContent || "",
    replActive: () => app.repl.active,
    replToolRunCount: () => app.repl.toolRuns.length,
    replToolStatuses: () => app.repl.toolRuns.map((run) => `${run.name}:${run.status}`),
    terminalHistoryLength: () => app.terminalHistory.length,
    terminalBusy: () => app.terminalBusy,
    commandLensVisible: () => !$(".workspace")?.classList.contains("lens-hidden"),
    commandLensSummary: () => $("[data-command-lens-summary]")?.textContent || "",
    evolutionPhaseCount: () => $$("[data-evolution-phase]").length,
    selectedEvolutionPhase: () => getSelectedEvolutionPhase().id,
    evolutionDetailText: () => $("[data-evolution-detail]")?.textContent || "",
    paletteResultText: () => $("[data-palette-results]")?.textContent || "",
    paletteStatusText: () => $("[data-palette-status]")?.textContent || "",
    paletteActiveLabel: () => $(".palette-result.is-active .palette-result-main strong")?.textContent || "",
    paletteRecentCommandIds: () => app.paletteRecentCommandIds.slice(),
    switchView,
    switchBottomPanel,
    openFile,
    installExtension: (id) => updateExtension(id, { installed: true, enabled: true }),
    async runTerminalCommand(command) {
      const input = $("[data-terminal-input]");
      const form = $("[data-terminal-form]");
      if (!input || !form) throw new Error("Terminal form is unavailable.");
      input.value = command;
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await app.terminalQueue;
    }
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

async function init() {
  app.db = await openDb();
  await seedWorkspace();
  await reloadState();
  await loadSharedWorkspace("startup");
  setupMenus();
  setupActions();
  setupWorkspaceBridge();
  setupTerminal();
  setupPalette();
  await setupMonaco();
  renderAll();
  renderSearchResults();
  exposeDiagnostics();
  appendOutput("SEIS Code booted with IndexedDB persistence.");
}

init().catch((error) => {
  console.error(error);
  const status = $("[data-persistence-status]");
  if (status) status.textContent = "Startup error";
  showModal("Startup Error", `<pre>${escapeHtml(error.stack || error.message)}</pre>`);
});
