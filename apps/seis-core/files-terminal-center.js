const STORE_KEY = "seis.files.terminal.center.v1";

const safetyFlags = Object.freeze({
  commandExecuted: false,
  sshExecuted: false,
  filesystemMutated: false,
  credentialRead: false,
});

const seedFolders = [
  { id: "root", name: "Command Center", parent: null, kind: "folder", updated: "Now" },
  { id: "ai", name: "AI Core", parent: "root", kind: "folder", updated: "Demo" },
  { id: "ops", name: "Operations", parent: "root", kind: "folder", updated: "Demo" },
  { id: "design", name: "Design Studio", parent: "root", kind: "folder", updated: "Demo" },
];

const seedFiles = [
  {
    id: "readme",
    name: "README.md",
    kind: "file",
    parent: "root",
    type: "Markdown",
    updated: "Pinned",
    body: "# SEIS Files\n\nThis browser-local route previews the Files and Terminal workspace without host filesystem writes.",
  },
  {
    id: "agent-log",
    name: "agent-activity.log",
    kind: "file",
    parent: "ai",
    type: "Log",
    updated: "Local demo",
    body: "Architect Agent: planned safe virtual file flow.\nSecurity Agent: confirmed no host shell or credentials are used.",
  },
  {
    id: "terminal-policy",
    name: "terminal-policy.md",
    kind: "file",
    parent: "ops",
    type: "Policy",
    updated: "Local demo",
    body: "Allowed demo commands: help, status, ls, pwd, readiness, clear. Other commands return a blocked-state message.",
  },
  {
    id: "tokens",
    name: "design-tokens.json",
    kind: "file",
    parent: "design",
    type: "JSON",
    updated: "Local demo",
    body: '{\n  "surface": "graphite glass",\n  "accent": "cyan",\n  "motion": "reduced-motion aware"\n}',
  },
];

const allowedCommands = ["help", "status", "ls", "pwd", "readiness", "clear"];
const agents = ["Files Agent", "Terminal Agent", "Security Agent"];

const fallbackState = {
  currentFolder: "root",
  selectedId: null,
  view: "grid",
  query: "",
  folders: seedFolders,
  files: seedFiles,
  recent: [],
  terminal: [
    { type: "system", text: "SEIS Terminal Center ready. Type help to see browser-local commands." },
    { type: "system", text: "No host shell, remote connection, credential access, or filesystem mutation is available in this demo." },
  ],
};

let state = loadState();

const gridEl = document.querySelector("#fileGrid");
const folderNameEl = document.querySelector("#folderName");
const searchEl = document.querySelector("#fileSearch");
const previewTitleEl = document.querySelector("#preview-title");
const previewMetaEl = document.querySelector("#previewMeta");
const previewBodyEl = document.querySelector("#previewBody");
const recentEl = document.querySelector("#recentFiles");
const terminalOutputEl = document.querySelector("#terminalOutput");
const terminalFormEl = document.querySelector("#terminalForm");
const terminalInputEl = document.querySelector("#terminalInput");

function loadState() {
  try {
    const cached = localStorage.getItem(STORE_KEY);
    if (!cached) return structuredClone(fallbackState);
    const parsed = JSON.parse(cached);
    return {
      ...structuredClone(fallbackState),
      ...parsed,
      folders: Array.isArray(parsed.folders) ? parsed.folders : seedFolders,
      files: Array.isArray(parsed.files) ? parsed.files : seedFiles,
      terminal: Array.isArray(parsed.terminal) ? parsed.terminal : fallbackState.terminal,
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
    };
  } catch {
    return structuredClone(fallbackState);
  }
}

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ ...state, safetyFlags }));
}

function currentFolder() {
  return state.folders.find((folder) => folder.id === state.currentFolder) || state.folders[0];
}

function folderChildren() {
  const query = state.query.trim().toLowerCase();
  const items = [...state.folders, ...state.files].filter((item) => item.parent === state.currentFolder);
  if (!query) return items;
  return items.filter((item) => `${item.name} ${item.type || "folder"}`.toLowerCase().includes(query));
}

function renderFiles() {
  const folder = currentFolder();
  folderNameEl.textContent = folder.name;
  searchEl.value = state.query;
  gridEl.className = state.view === "list" ? "file-grid list" : "file-grid";

  const children = folderChildren();
  if (!children.length) {
    gridEl.innerHTML = '<p class="muted">No browser-local files match this search.</p>';
    return;
  }

  gridEl.innerHTML = children
    .map((item) => {
      const icon = item.kind === "folder" ? "DIR" : "DOC";
      const meta = item.kind === "folder" ? "Folder" : `${item.type} file`;
      return `
        <button class="file-card" type="button" data-id="${item.id}" data-kind="${item.kind}" aria-selected="${state.selectedId === item.id}">
          <span class="file-icon" aria-hidden="true">${icon}</span>
          <span>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(meta)} / ${escapeHtml(item.updated)}</small>
          </span>
          <small>${item.kind === "folder" ? "Open" : "Preview"}</small>
        </button>`;
    })
    .join("");
}

function renderPreview() {
  const selected = state.files.find((file) => file.id === state.selectedId);
  if (!selected) {
    previewTitleEl.textContent = "No file selected";
    previewMetaEl.textContent = "Choose a virtual file to preview its browser-local content.";
    previewBodyEl.textContent = "Recent files and selections persist in localStorage only.";
    return;
  }

  previewTitleEl.textContent = selected.name;
  previewMetaEl.textContent = `${selected.type} / ${selected.updated} / browser-local preview`;
  previewBodyEl.textContent = selected.body;
}

function renderRecent() {
  const recentFiles = state.recent
    .map((id) => state.files.find((file) => file.id === id))
    .filter(Boolean)
    .slice(0, 6);

  if (!recentFiles.length) {
    recentEl.innerHTML = '<li class="muted">No files opened yet.</li>';
    return;
  }

  recentEl.innerHTML = recentFiles
    .map((file) => `<li><button type="button" data-recent="${file.id}">${escapeHtml(file.name)}<br><small>${escapeHtml(file.type)}</small></button></li>`)
    .join("");
}

function renderTerminal() {
  terminalOutputEl.innerHTML = state.terminal
    .map((line) => `<div class="terminal-line ${line.type}">${escapeHtml(line.text)}</div>`)
    .join("");
  terminalOutputEl.scrollTop = terminalOutputEl.scrollHeight;
}

function renderViewButtons() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
}

function renderAll() {
  renderFiles();
  renderPreview();
  renderRecent();
  renderTerminal();
  renderViewButtons();
  persist();
}

function selectItem(item) {
  if (item.kind === "folder") {
    state.currentFolder = item.id;
    state.selectedId = null;
    pushTerminal("system", `Opened virtual folder: ${item.name}`);
    renderAll();
    return;
  }

  state.selectedId = item.id;
  state.recent = [item.id, ...state.recent.filter((id) => id !== item.id)].slice(0, 8);
  pushTerminal("system", `Previewed browser-local file: ${item.name}`);
  renderAll();
}

function createLocalNote() {
  const count = state.files.filter((file) => file.parent === state.currentFolder && file.name.startsWith("local-note")).length + 1;
  const file = {
    id: `local-note-${Date.now()}`,
    name: `local-note-${count}.md`,
    kind: "file",
    parent: state.currentFolder,
    type: "Markdown",
    updated: "Created in browser",
    body: `# Local demo note ${count}\n\nThis note exists only in localStorage for the SEIS Files demo. It does not write to the host filesystem.`,
  };
  state.files.push(file);
  state.selectedId = file.id;
  state.recent = [file.id, ...state.recent].slice(0, 8);
  pushTerminal("system", `Created virtual note: ${file.name}`);
  renderAll();
}

function createLocalFolder() {
  const count = state.folders.filter((folder) => folder.parent === state.currentFolder && folder.name.startsWith("Local Folder")).length + 1;
  const folder = {
    id: `local-folder-${Date.now()}`,
    name: `Local Folder ${count}`,
    parent: state.currentFolder,
    kind: "folder",
    updated: "Created in browser",
  };
  state.folders.push(folder);
  pushTerminal("system", `Created virtual folder: ${folder.name}`);
  renderAll();
}

function renameSelected() {
  const selected = [...state.folders, ...state.files].find((item) => item.id === state.selectedId);
  if (!selected) {
    pushTerminal("blocked", "Rename skipped: select a virtual file first. Host files remain untouched.");
    renderAll();
    return;
  }

  const nextName = window.prompt("Rename browser-local item", selected.name);
  if (!nextName || !nextName.trim()) {
    pushTerminal("blocked", "Rename cancelled: no browser-local change recorded.");
    renderAll();
    return;
  }

  selected.name = nextName.trim().slice(0, 80);
  selected.updated = "Renamed in browser";
  pushTerminal("system", `Renamed virtual item to: ${selected.name}`);
  renderAll();
}

function deleteBlocked() {
  pushTerminal("blocked", "Delete blocked: this demo intentionally avoids destructive file actions. Use review-gated implementation work for real deletion flows.");
  renderAll();
}

function pushTerminal(type, text) {
  state.terminal.push({ type, text });
  state.terminal = state.terminal.slice(-80);
}

function runDemoCommand(rawValue) {
  const command = rawValue.trim().toLowerCase();
  if (!command) return;

  if (command === "clear") {
    state.terminal = [{ type: "system", text: "Console cleared. Safety flags remain false." }];
    renderAll();
    return;
  }

  pushTerminal("command", `seis@local-demo:~$ ${command}`);

  if (!allowedCommands.includes(command)) {
    pushTerminal("blocked", `Blocked demo command: ${command}. Allowed commands: ${allowedCommands.join(", ")}.`);
    renderAll();
    return;
  }

  const folder = currentFolder();
  const childNames = folderChildren().map((item) => item.name).join("  ") || "empty";
  const outputs = {
    help: `Allowed commands: ${allowedCommands.join(", ")}. All output is simulated and browser-local.`,
    status: `Files Agent: localStorage ready. Terminal Agent: simulated. Security Agent: protected. Flags: ${JSON.stringify(safetyFlags)}.`,
    ls: childNames,
    pwd: `/SEIS/${folder.name.replaceAll(" ", "-").toLowerCase()}`,
    readiness: `${agents.join(" / ")} report ready: no host filesystem write, no credential read, no remote call.`,
  };

  pushTerminal("system", outputs[command]);
  renderAll();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

gridEl.addEventListener("click", (event) => {
  const card = event.target.closest(".file-card");
  if (!card) return;
  const item = [...state.folders, ...state.files].find((entry) => entry.id === card.dataset.id);
  if (item) selectItem(item);
});

recentEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-recent]");
  if (!button) return;
  const file = state.files.find((entry) => entry.id === button.dataset.recent);
  if (file) selectItem(file);
});

document.querySelector("[data-folder='root']").addEventListener("click", () => {
  state.currentFolder = "root";
  state.selectedId = null;
  pushTerminal("system", "Returned to SEIS root virtual folder.");
  renderAll();
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    renderAll();
  });
});

searchEl.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderAll();
});

document.querySelector("#newNote").addEventListener("click", createLocalNote);
document.querySelector("#newFolder").addEventListener("click", createLocalFolder);
document.querySelector("#renameItem").addEventListener("click", renameSelected);
document.querySelector("#deleteItem").addEventListener("click", deleteBlocked);

terminalFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  runDemoCommand(terminalInputEl.value);
  terminalInputEl.value = "";
});

document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("click", () => runDemoCommand(button.dataset.command));
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchEl.focus();
  }
});

renderAll();
