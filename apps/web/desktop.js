Warning: truncated output (original token count: 135744)
Total output lines: 10696

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
  ["code-ide", "Code IDE", "System", "IDE", "Open a dedicated IDE cockpit for SEIS Code, Monaco, terminal, extensions, and workspace files.", "code-ide"],
  ["settings", "Settings", "System", "SET", "Configure appearance, workspaces, notifications, storage, and safe preferences.", "settings"],
  ["launchpad", "Launchpad", "System", "GRID", "Open a full-window SEIS app launcher with search, categories, and quick launch.", "launchpad"],
  ["seis-system-os", "SEIS System OS", "System", "OS", "Control the Linux, macOS, and Windows-inspired SEIS shell, widgets, recents, workspaces, and system evidence.", "system-os"],
  ["seis-command-center", "SEIS Command Center", "System", "CMD", "Unify V17 demo modules, validation evidence, mock/real/planned states, and review actions.", "seis-command-center"],
  ["demo-studio", "SEIS Demo Studio", "System", "RUN", "Run guided product journeys across OS, AI, Search, Code, Design, Cloud, Store, Music, Files, Terminal, Agents, Plugins, and Website.", "demo-studio"],
  ["linux-replica", "SEIS Linux Replica", "System", "LNX", "Open the supplied-code Web Linux shell adaptation with boot, login, taskbar, launcher, VFS, terminal, and 64 apps.", "linux-replica"],
  ["seis-store", "SEIS Store", "System", "STORE", "Browse installable SEIS apps, extensions, website demos, and local capability packs.", "store"],
  ["app-center", "App Center", "System", "APP", "Inspect, pin, launch, and organize installed applications.", "app-center"],
  ["extensions", "Extensions Manager", "System", "EXT", "Install, enable, disable, and configure local extensions.", "extensions"],
  ["system-monitor", "System Monitor", "System", "CPU", "Track live browser session CPU, memory, storage, and event activity.", "monitor"],
  ["task-manager", "Task Manager", "System", "TSK", "Review open windows, app activity, and stop local tasks.", "task-manager"],
  ["disk-utility", "Disk Utility", "System", "DSK", "Inspect virtual storage usage and clean temporary files.", "disk"],
  ["archive-manager", "Archive Manager", "System", "ZIP", "Bundle selected virtual files into export manifests.", "archive"],
  ["system-logs", "System Logs", "System", "LOG", "Inspect local audit events, app launches, and command history.", "logs"],
  ["startup-apps", "Startup Applications", "System", "RUN", "Choose apps to restore automatically when the desktop opens.", "startup"],
  ["notes", "Notes", "Productivity", "NTE", "Capture durable notes and save them as Markdown files.", "notes"],
  ["second-brain", "SEIS Second Brain", "Productivity", "BRAIN", "Link Obsidian-style Markdown vault notes, installed AI profiles, sub-agent lanes, and GitHub readiness gates.", "second-brain"],
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
  ["seis-design", "SEIS Design", "Creative", "DSN", "Open the design cockpit for showcase pages, product polish, motion, and website handoff.", "seis-design"],
  ["seis-website", "SEIS Website", "Creative", "WEB", "Open the premium product website map for SEIS AI, OS, Code, Design, Search, Cloud, Store, and Agents.", "seis-website"],
  ["photos", "Photos", "Creative", "IMG", "Browse generated and imported local media records.", "media"],
  ["image-editor", "Image Editor", "Creative", "EDT", "Apply non-destructive crop, rotate, and tone metadata.", "image-editor"],
  ["paint", "Paint", "Creative", "PNT", "Draw on a local browser canvas and save artwork metadata.", "paint"],
  ["whiteboard", "Whiteboard", "Creative", "WHT", "Arrange sticky notes and sketches on an infinite board.", "whiteboard"],
  ["color-picker", "Color Picker", "Creative", "CLR", "Pick colors, copy HEX values, and save palettes.", "color"],
  ["gradient-maker", "Gradient Maker", "Creative", "GRD", "Design gradients and export CSS snippets.", "gradient"],
  ["font-viewer", "Font Viewer", "Creative", "Aa", "Preview local font stacks and compare type samples.", "font"],
  ["svg-studio", "SVG Studio", "Creative", "SVG", "Create simple SVG snippets and save them to files.", "svg"],
  ["icon-browser", "Icon Browser", "Creative", "ICO", "Browse local symbolic icons and copy labels.", "icons"],
  ["music", "Music", "Creative", "MUS", "Play local SEIS demo tracks, manage a playlist, and save listening notes.", "music"],
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
  ["seis-cloud", "SEIS Cloud", "Connected", "CLD", "Inspect local cloud readiness, SSH boundaries, deployment handoff, and no-key status.", "seis-cloud"],
  ["seis-evolution", "SEIS Evolution", "Connected", "EVO", "Unify pinned SEIS AI work, desktop demo scope, websites, and SEIS-SSH boundaries.", "seis-evolution"],
  ["sub-agent-control", "Sub-Agent Control", "Connected", "5Y", "Inspect the five-year bounded sub-agent plan, dry-run queue, redaction gates, and ledger evidence.", "subagent-control"],
  ["nvidia-catalog", "NVIDIA Catalog", "Connected", "NV", "Review the NVIDIA GitHub org, Build skills, and run-anywhere model catalog as an approval-gated accelerator intake.", "nvidia-catalog"],
  ["wow-gallery", "SEIS WOW Gallery", "Connected", "WOW", "Browse imported SEIS_WOW visual pages and Kimi references as safe design sources.", "wow-gallery"],
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
  "launchpad",
  "seis-system-os",
  "demo-studio",
  "linux-replica",
  "seis-code",
  "code-ide",
  "search",
  "seis-store",
  "ai-assistant",
  "seis-design",
  "seis-website",
  "seis-cloud",
  "second-brain",
  "music",
  "wow-gallery",
  "seis-evolution",
  "sub-agent-control",
  "nvidia-catalog",
  "settings",
  "notes",
  "app-center",
  "mythic-gacha"
];

const DESKTOP_SHORTCUTS = ["files", "terminal", "settings", "search", "demo-studio", "linux-replica", "seis-code", "seis-design", "second-brain", "seis-store", "nvidia-catalog", "music"];
const KEYBOARD_SHORTCUT_GROUPS = [
  {
    name: "System",
    shortcuts: [
      { keys: "Ctrl/Cmd + /", action: "Toggle keyboard shortcuts", command: "toggle-shortcuts" },
      { keys: "Ctrl/Cmd + K", action: "Open command palette", command: "open-search" },
      { keys: "Ctrl/Cmd + Space", action: "Open application launcher", command: "toggle-launcher" },
      { keys: "Esc", action: "Close overlays", command: "close-overlays" }
    ]
  },
  {
    name: "Apps",
    shortcuts: [
      { keys: "Ctrl/Cmd + Alt + T", action: "Open Terminal", command: "open-terminal" },
      { keys: "Ctrl/Cmd + Alt + F", action: "Open Files", command: "open-files" },
      { keys: "Ctrl/Cmd + Alt + N", action: "Open Notes", command: "open-notes" },
      { keys: "Ctrl/Cmd + Alt + S", action: "Open Settings", command: "open-settings" }
    ]
  },
  {
    name: "Shell",
    shortcuts: [
      { keys: "Ctrl/Cmd + Alt + C", action: "Open Control Center", command: "toggle-control-center" },
      { keys: "Ctrl/Cmd + Alt + 1", action: "Switch to workspace 1", command: "workspace-1" },
      { keys: "Ctrl/Cmd + Alt + 2", action: "Switch to workspace 2", command: "workspace-2" },
      { keys: "Ctrl/Cmd + Alt + 3", action: "Switch to workspace 3", command: "workspace-3" }
    ]
  }
];
const SEIS_WEBSITE_PAGE_ROUTES = [
  {
    id: "seis-website-hub",
    label: "SEIS Website Hub",
    kind: "Website",
    path: "./website/index.html",
    keywords: "website hub product pages ai os code design search cloud store agents"
  },
  {
    id: "seis-website-ai",
    label: "SEIS AI Website",
    kind: "Website",
    path: "./website/seis-ai.html",
    keywords: "website seis ai core model router local demo provider agents"
  },
  {
    id: "seis-website-os",
    label: "SEIS OS Website",
    kind: "Website",
    path: "./website/seis-os.html",
    keywords: "website seis os linux macos windows desktop shell"
  },
  {
    id: "seis-website-code",
    label: "SEIS Code Website",
    kind: "Website",
    path: "./website/seis-code.html",
    keywords: "website seis code ide vscode monaco terminal"
  },
  {
    id: "seis-website-design",
    label: "SEIS Design Website",
    kind: "Website",
    path: "./website/seis-design.html",
    keywords: "website seis design studio video hero gacha wow"
  },
  {
    id: "seis-website-search",
    label: "SEIS Search Website",
    kind: "Website",
    path: "./website/seis-search.html",
    keywords: "website seis search engine gateway files apps plugins cloud"
  },
  {
    id: "seis-website-cloud",
    label: "SEIS Cloud Website",
    kind: "Website",
    path: "./website/seis-cloud.html",
    keywords: "website seis cloud ssh deployment status disabled planned"
  },
  {
    id: "seis-website-store",
    label: "SEIS Store Website",
    kind: "Website",
    path: "./website/seis-store.html",
    keywords: "website seis store apps plugins agents themes extensions"
  },
  {
    id: "seis-website-agents",
    label: "SEIS Agents Website",
    kind: "Website",
    path: "./website/seis-agents.html",
    keywords: "website seis agents sub-agent five year dry run governance"
  }
];
const DEMO_DEFAULT_ROUTE_IDS = [
  "seis-ai-app",
  "seis-system-os-app",
  "seis-command-center-app",
  "seis-website-hub",
  "seis-code-app",
  "seis-design-app",
  "seis-cloud-app",
  "seis-second-brain-app",
  "seis-evolution-app",
  "seis-ai-core-3d-demo",
  "sub-agent-os-demo",
  "seis-code-web",
  "wow-gallery-web",
  "mythic-gacha-web",
  "video-hero-gallery",
  "desktop-entry"
];
const SEARCH_SPOTLIGHT_ITEMS = [
  {
    title: "SEIS System OS",
    meta: "Linux, macOS, Windows-inspired shell",
    description: "Open the connected operating system center with widgets, live activity, app switcher, workspaces, recents, and evidence.",
    action: "open-app",
    appId: "seis-system-os",
    keywords: "seis system os linux macos windows widgets dynamic island app switcher workspace"
  },
  {
    title: "SEIS Code",
    meta: "VS Code-like desktop app",
    description: "Open the Monaco workspace with Explorer, Search, Source Control, Run/Debug, Extensions, and terminal.",
    action: "open-app",
    appId: "seis-code",
    keywords: "seis code vs code monaco ide terminal extensions"
  },
  {
    title: "Code IDE",
    meta: "Dedicated IDE cockpit",
    description: "Open the focused Code IDE surface that links SEIS Code, terminal, extensions, files, and the standalone IDE route.",
    action: "open-app",
    appId: "code-ide",
    keywords: "code ide cockpit workspace terminal extensions"
  },
  {
    title: "SEIS Design",
    meta: "Design and website studio",
    description: "Open the visual command surface for Video Hero, Mythic Gacha, product pages, motion, and export flows.",
    action: "open-app",
    appId: "seis-design",
    keywords: "seis design websites video hero mythic gacha"
  },
  {
    title: "SEIS Website",
    meta: "Premium product pages",
    description: "Open product pages for SEIS AI, OS, Code, Design, Search, Cloud, Store, and Agents.",
    action: "open-app",
    appId: "seis-website",
    keywords: "seis website product pages ai os code design search cloud store agents"
  },
  {
    title: "SEIS Cloud",
    meta: "Cloud and SSH safety center",
    description: "Review local/cloud boundaries, SSH readiness, deployment gates, and no-secret demo status.",
    action: "open-app",
    appId: "seis-cloud",
    keywords: "seis cloud ssh deployment vpn server safety"
  },
  {
    title: "Launchpad",
    meta: "SEIS app grid",
    description: "Open the full-window launcher with all installed SEIS apps, categories, websites, and core demo entries.",
    action: "open-app",
    appId: "launchpad",
    keywords: "launchpad app grid installed apps"
  },
  {
    title: "SEIS Store",
    meta: "App and website catalog",
    description: "Open the local App Store/Microsoft Store-style catalog for SEIS apps, extensions, and website routes.",
    action: "open-app",
    appId: "seis-store",
    keywords: "store app catalog microsoft app store extensions website"
  },
  {
    title: "Music",
    meta: "Local soundtrack app",
    description: "Open the demo music player with a persistent SEIS playlist and local listening state.",
    action: "open-app",
    appId: "music",
    keywords: "music playlist local soundtrack audio"
  },
  {
    title: "SEIS WOW Gallery",
    meta: "190 imported page references",
    description: "Open the safe Kimi and SEIS_WOW visual reference catalog with PNG previews, imported HTML links, and System OS screens.",
    action: "open-demo-route",
    routeId: "wow-gallery-web",
    keywords: "kimi linuxos vscode web seis wow imported pages visual reference gallery"
  },
  {
    title: "SEIS AI Core 3D",
    meta: "Big-tech AI demo route",
    description: "Launch the 3D AI Core showcase with model router, prompt engine, agent runtime, and sub-agent plan.",
    action: "open-demo-route",
    routeId: "seis-ai-core-3d-demo",
    keywords: "ai core 3d sub agent five year version"
  },
  {
    title: "SEIS Second Brain",
    meta: "Obsidian-style knowledge OS",
    description: "Open the browser-local Markdown vault, graph, installed AI matrix, sub-agent council, and GitHub review gates.",
    action: "open-app",
    appId: "second-brain",
    keywords: "second brain obsidian markdown vault knowledge graph backlinks ai agents github readiness"
  },
  {
    title: "SEIS Command Center",
    meta: "V17 operating center",
    description: "Open the V17 review cockpit for Desktop OS, AI Core, Search, Code, Design, Cloud, Store, Music, Files, Terminal, Website, Agents, and Plugins.",
    action: "open-app",
    appId: "seis-command-center",
    keywords: "v17 command center operating center ai native creative os demo validation modules mock real planned"
  },
  {
    title: "SEIS Evolution",
    meta: "Screenshot context and 5-year map",
    description: "Open the pinned-task style workspace that ties GitHub 2, SEIS-SSH, Code, Design, Cloud, and websites together.",
    action: "open-app",
    appId: "seis-evolution",
    keywords: "github 2 screenshot pinned tasks evolution ssh"
  },
  {
    title: "Local Tool Inventory",
    meta: "SEIS-mapped local apps and folders",
    description: "Open the SEIS Evolution map for Adobe, Figma, Xcode, Antigravity, Codex, Ollama, Qwen, and repository folders.",
    action: "open-app",
    appId: "seis-evolution",
    keywords: "local tools adobe figma xcode antigravity codex ollama qwen github folder"
  },
  {
    title: "SEIS Code Web",
    meta: "Single-URL IDE page",
    description: "Open the standalone SEIS Code route for the VS Code-like web editor experience.",
    action: "open-demo-route",
    routeId: "seis-code-web",
    keywords: "single url vscode web seis code"
  },
  {
    title: "Mythic Gacha",
    meta: "Playable website",
    description: "Open the Shan Hai Jing-inspired card draw game and bestiary.",
    action: "open-demo-route",
    routeId: "mythic-gacha-web",
    keywords: "mythic gacha shan hai jing bestiary website"
  },
  {
    title: "Video Hero Gallery",
    meta: "Four showcase pages",
    description: "Open Nature, Still Life, Materials, and Metal Parts cinematic product hero routes.",
    action: "open-demo-route",
    routeId: "video-hero-gallery",
    keywords: "video hero nature still life materials metal parts"
  }
];
const DEMO_ROUTES = [
  {
    id: "desktop-entry",
    label: "SEIS Desktop OS Demo",
    kind: "Single entry",
    appId: "search",
    path: "./desktop.html",
    keywords: "linux macos windows desktop launcher search app gateway single demo"
  },
  {
    id: "seis-search-gateway",
    label: "SEIS Search Engine",
    kind: "Demo gateway",
    appId: "search",
    path: "./desktop.html#search",
    keywords: "seis arama motoru search engine gateway websites code design cloud"
  },
  {
    id: "seis-ai-app",
    label: "SEIS AI Control Center",
    kind: "Local Demo AI",
    appId: "ai-assistant",
    path: "./desktop.html#ai-assistant",
    keywords: "seis ai app assistant plugin center local demo provider"
  },
  {
    id: "seis-system-os-app",
    label: "SEIS System OS",
    kind: "Desktop app",
    appId: "seis-system-os",
    path: "./desktop.html#seis-system-os",
    keywords: "seis system os linux macos windows widgets dynamic island app switcher workspace"
  },
  {
    id: "seis-command-center-app",
    label: "SEIS Command Center",
    kind: "Desktop app",
    appId: "seis-command-center",
    path: "./desktop.html#seis-command-center",
    keywords: "seis command center v17 operating center validation demo modules"
  },
  {
    id: "seis-linux-replica-web",
    label: "SEIS Linux Replica",
    kind: "Web Linux route",
    appId: "linux-replica",
    path: "./seis-linux-replica.html",
    keywords: "supplied code nebulaos web linux replica boot login taskbar start menu windows vfs terminal apps"
  },
  {
    id: "sub-agent-os-demo",
    label: "Sub-Agent OS Demo",
    kind: "Desktop control app",
    appId: "sub-agent-control",
    path: "./desktop.html#sub-agent-control",
    keywords: "sub agent five year autonomous dry run linux mac windows desktop demo"
  },
  {
    id: "seis-code-app",
    label: "SEIS Code Workspace",
    kind: "Desktop app",
    appId: "seis-code",
    path: "./desktop.html#seis-code",
    keywords: "vs code ide editor monaco terminal extensions linux macos windows code"
  },
  {
    id: "seis-design-app",
    label: "SEIS Design Studio",
    kind: "Desktop app",
    appId: "seis-design",
    path: "./desktop.html#seis-design",
    keywords: "seis design websites video hero mythic gacha motion product showcase"
  },
  {
    id: "seis-cloud-app",
    label: "SEIS Cloud Center",
    kind: "Desktop app",
    appId: "seis-cloud",
    path: "./desktop.html#seis-cloud",
    keywords: "seis cloud ssh vpn deployment local cloud boundary windows linux macos"
  },
  {
    id: "seis-second-brain-app",
    label: "SEIS Second Brain",
    kind: "Desktop app",
    appId: "second-brain",
    path: "./desktop.html#second-brain",
    keywords: "second brain obsidian markdown vault knowledge graph backlinks installed ai sub agents github readiness"
  },
  {
    id: "seis-evolution-app",
    label: "SEIS Evolution + SSH Demo",
    kind: "Desktop app",
    appId: "seis-evolution",
    path: "./desktop.html#seis-evolution",
    keywords: "seis ai linux macos windows ssh github 2 pinned tasks demo desktop websites five year folders screenshot"
  },
  {
    id: "seis-ai-core-3d-demo",
    label: "SEIS AI Core 3D Demo",
    kind: "Website",
    path: "./ai-core-demo/index.html",
    keywords: "seis ai core 3d animation sub agent five year versioned website big tech demo"
  },
  ...SEIS_WEBSITE_PAGE_ROUTES,
  {
    id: "seis-code-web",
    label: "SEIS Code Web",
    kind: "Full-page IDE",
    path: "./seis-code.html",
    keywords: "website vs code web monaco multi tab terminal indexeddb"
  },
  {
    id: "wow-gallery-web",
    label: "SEIS WOW Gallery",
    kind: "Website",
    path: "./wow-gallery.html",
    keywords: "website kimi linuxos vscode web imported png html visual reference gallery"
  },
  {
    id: "kimi-linuxos-reference",
    label: "Kimi LinuxOS Reference",
    kind: "External reference",
    external: true,
    path: "https://dwfcctyh2o6me.ok.kimi.link/?id=2045932438926155776&share_id=19d9fdbd-d7d2-8a19-8000-00001d7799f6",
    keywords: "kimi linuxos external reference desktop os"
  },
  {
    id: "kimi-vscode-web-reference",
    label: "Kimi VS Code Web Reference",
    kind: "External reference",
    external: true,
    path: "https://gmzousbtqpx5w.kimi.page/?id=2057731079068581888&share_id=19e4e6a6-9342-8f07-8000-0000296a37dd",
    keywords: "kimi vscode web external reference code ide"
  },
  {
    id: "mythic-gacha-web",
    label: "Mythic Gacha Web",
    kind: "Playable route",
    path: "./mythic-gacha.html",
    keywords: "website shan hai jing gacha bestiary cards game"
  },
  {
    id: "video-hero-web",
    label: "Video Hero Gallery",
    kind: "Showcase route",
    path: "./showcase/nature.html",
    keywords: "website video hero nature still life materials metal"
  },
  {
    id: "video-hero-nature",
    label: "Nature Video Hero",
    kind: "Website",
    path: "./showcase/nature.html",
    keywords: "website nature forest ocean hero video"
  },
  {
    id: "video-hero-still-life",
    label: "Still Life Video Hero",
    kind: "Website",
    path: "./showcase/still-life.html",
    keywords: "website still life ceramics glassware hero video"
  },
  {
    id: "video-hero-materials",
    label: "Materials Video Hero",
    kind: "Website",
    path: "./showcase/materials.html",
    keywords: "website materials leather fabric textures hero video"
  },
  {
    id: "video-hero-metal-parts",
    label: "Metal Parts Video Hero",
    kind: "Website",
    path: "./showcase/metal-parts.html",
    keywords: "website metal parts mechanical gears hero video"
  }
];

const SEIS_V17_COMMAND_CENTER_VALIDATION_QUEUE = [
  ["Desktop OS contract", "npm run check:desktop-os", "Runnable shell, windows, launcher, VFS, persistence, and diagnostics."],
  ["Browser product smoke", "npm run check:product-experience-browser-smoke", "Desktop, SEIS Code, AI Plugin Center, product routes, and mobile overflow proof."],
  ["AI Core package", "npm test --prefix packages/seis-ai", "Provider registry, MCP tools/resources, local agent loop, and non-claim boundaries."],
  ["Model scaling profile", "npm run check:seis-model-scaling-hardware-profile", "20B on 16GB+ RAM planning profile, memory budget contract, future 70B ladder, 150B frontier lane, and 512B AGI apex boundary."],
  ["NVIDIA accelerator catalog", "npm run check:seis-nvidia-accelerator-catalog", "NVIDIA GitHub, Build skills, and model catalog are dry-run only; no clone, download, NIM call, GPU, Docker, SSH, or credential use."],
  ["NVIDIA installed integrations", "npm run check:seis-nvidia-installed-integrations", "11 local NVIDIA Codex skill manifests are installed into SEIS as runtime-gated capability records."],
  ["Frontier escalation policy", "npm run check:seis-model-frontier-escalation-policy", "No-skip-20B policy, 70B research gate, 150B frontier gate, 512B AGI apex gate, and highest-parameter non-claim boundary."],
  ["Second Brain contract", "npm run check:seis-second-brain", "Obsidian-style vault, installed AI, sub-agent, GitHub readiness, and no-secret knowledge boundary."],
  ["150B frontier model program", "npm run check:seis-150b-frontier-model-program", "150B program charter, plan-only stages, non-claim flags, and promotion gates for future 70B/150B+ escalation."],
  ["512B apex AGI program", "npm run check:seis-512b-apex-model-program", "512B AGI research charter, all-agent plan-only review, non-claim flags, and blocked promotion gates."],
  ["Model scaling sub-agent council", "npm run check:seis-model-scaling-subagent-council", "12 plan-only agents bound to 20B evidence preparation and 70B/150B/512B non-claim gates."],
  ["Website pages", "npm run check:seis-website-pages", "Premium product pages for SEIS AI, OS, Code, Design, Search, Cloud, Store, and Agents."]
];

const SEIS_SEARCH_TABS = ["AI", "Web", "Code", "Design", "Cloud", "Apps", "Plugins", "Files"];

const SEIS_MODEL_SCALING_UI_PROFILE = {
  currentTarget: "SEIS 20B Local Compatibility Target",
  ramClass: "16GB+ RAM",
  frontierTarget: "SEIS 150B Frontier Research Target",
  frontierStatus: "150B gated / frontier-research-roadmap / not scoped",
  apexTarget: "SEIS 512B AGI Apex Research Target",
  apexStatus: "apex-program-plan-only / not scoped / AGI not demonstrated",
  frontierEscalationPolicy: "content/development/seis-model-frontier-escalation-policy.json",
  frontierEscalationResource: "seis://ai/model-frontier-escalation-policy.json",
  frontierEscalationStatus: "policy-active-research-gated",
  frontierEscalationQualityGate: "npm run check:seis-model-frontier-escalation-policy",
  frontierEscalationRule: "No-skip-20B: 70B, 150B, and 512B cannot become runtime-scoped until lower-tier evidence exists.",
  frontierModelProgram: "content/development/seis-150b-frontier-model-program.json",
  frontierModelProgramResource: "seis://ai/150b-frontier-model-program.json",
  frontierModelProgramStatus: "frontier-program-plan-only",
  frontierModelProgramQualityGate: "npm run check:seis-150b-frontier-model-program",
  frontierModelProgramSummary: "150B is a frontier program plan; training, weights, inference, benchmark, cloud/GPU, SSH, and deployment remain blocked.",
  frontierModelProgramStages: [
    ["Charter", "Planned", "Not route eligible"],
    ["Clean-room data", "Blocked until provenance plan", "Not route eligible"],
    ["Architecture selection", "Not selected", "Not route eligible"],
    ["Distributed runtime", "Budget and approval needed", "Not route eligible"],
    ["Training readiness", "Not authorized", "Not route eligible"],
    ["Evaluation and safety", "Not run", "Not route eligible"]
  ],
  apexModelProgram: "content/development/seis-512b-apex-model-program.json",
  apexModelProgramResource: "seis://ai/512b-apex-model-program.json",
  apexModelProgramStatus: "apex-program-plan-only",
  apexModelProgramQualityGate: "npm run check:seis-512b-apex-model-program",
  apexModelProgramSummary: "512B is an AGI research target only; AGI capability, training, weights, inference, benchmark, cloud/GPU, SSH, and deployment remain blocked.",
  apexModelProgramStages: [
    ["512B charter", "Planned", "Not route eligible"],
    ["Installed AI council", "Plan-only", "Not route eligible"],
    ["Clean-room frontier data", "Blocked until provenance plan", "Not route eligible"],
    ["Architecture selection", "Not selected", "Not route eligible"],
    ["Frontier cluster plan", "Approval needed", "Not route eligible"],
    ["Training readiness", "Not authorized", "Not route eligible"],
    ["Evaluation and safety", "Not run", "Not route eligible"]
  ],
  modelScalingSubagentCouncil: "content/development/seis-model-scaling-subagent-council.json",
  modelScalingSubagentCouncilStatus: "active-plan-only",
  modelScalingSubagentCouncilQualityGate: "npm run check:seis-model-scaling-subagent-council",
  modelScalingSubagentCouncilSummary: "12 plan-only agents coordinate 20B evidence preparation while 70B, 150B, and 512B remain blocked.",
  parameterLadderPath: "content/development/seis-model-parameter-ladder.json",
  parameterLadderResource: "seis://ai/model-parameter-ladder.json",
  parameterLadderStatus: "planning-contract-not-runtime",
  parameterLadderQualityGate: "npm run check:seis-model-parameter-ladder",
  compatibilityClaim: "not-verified",
  memoryBudgetStatus: "planning-estimate-not-benchmark-evidence",
  benchmarkManifest: "reports/seis-model-scaling/20b-16gb-memory-benchmark.json",
  benchmarkStatus: "template-not-measured",
  benchmarkDryRunReport: "reports/seis-model-scaling/20b-benchmark-dry-run.json",
  benchmarkDryRunStatus: "dry-run-not-measured",
  modelCardTemplate: "content/development/seis-20b-model-card-template.json",
  datasetCardTemplate: "content/development/seis-20b-dataset-card-template.json",
  evidenceTemplateStatus: "template-not-filled / human-review-required",
  preflightReport: "/home/seis/Documents/seis-20b-local-preflight.md",
  preflightStatus: "dry-run-only",
  hostPreflightCommand: "npm run inspect:seis-model-local-hardware",
  hostPreflightOutput: "dist/qa/model-scaling/local-hardware-preflight.json",
  compatibilityProfiles: [
    ["16GB+ developer floor", "20B / Q4 candidate", "Local Demo only", "Not verified"],
    ["24GB+ candidate lane", "20B / Q4 candidate", "Local Demo only", "Not verified"],
    ["32GB+ validation lane", "20B / Q5-Q6 candidate", "Approved adapter tests later", "Not verified"],
    ["64GB+ research lane", "70B research", "Planning only", "Research roadmap"],
    ["Distributed frontier lane", "150B+ future", "Disabled", "Not scoped"],
    ["Apex AGI lane", "512B future", "Disabled", "AGI not demonstrated"]
  ],
  benchmarkGates: [
    "Model artifact license and clean-room provenance",
    "Peak resident memory and KV-cache memory",
    "OS memory pressure and context length",
    "Tokens per second and startup time",
    "Local-only fallback and redacted logs",
    "Human review before compatibility claim"
  ],
  creationStages: [
    ["Stage 0", "Local Demo / seed-model lab", "Active"],
    ["Stage 1", "20B local compatibility", "Planned / not validated"],
    ["Stage 2", "70B research", "Research roadmap"],
    ["Stage 3", "150B frontier", "Frontier roadmap"],
    ["Stage 4", "512B AGI apex", "Plan-only / blocked"],
    ["Stage 5", "Highest future class", "Not scoped"]
  ],
  subagentCouncilAssignments: [
    ["20B", "Architect, Code, Security, QA, Documentation", "Planned / not validated", "Not route eligible"],
    ["70B", "Research, DevOps, Cloud, Security", "Research roadmap", "Not route eligible"],
    ["150B", "Architect, Research, Cloud, Security, QA", "Frontier roadmap", "Not route eligible"],
    ["512B", "All 12 installed AI / sub-agent roles", "Apex plan-only", "Not route eligible"],
    ["Highest future", "Architect, Research, Security, Documentation", "Not scoped", "Not route eligible"]
  ],
  parameterLadderTargets: [
    ["20B", "16GB+ RAM", "Planned / not validated", "Local Demo and dry-run only"],
    ["70B", "64GB+ or approved accelerator", "Research roadmap", "Planning only"],
    ["150B", "Distributed or cloud research runtime", "Frontier roadmap", "Disabled"],
    ["300B+", "Not scoped", "Exploration boundary", "Disabled"],
    ["512B", "Frontier-scale distributed cluster", "Apex AGI plan-only", "Disabled / AGI not demonstrated"],
    ["Highest available future", "Defined after lower-tier evidence", "Not scoped", "Disabled"]
  ],
  quantizationProfiles: [
    ["Q4-class 20B local candidate", "Planned / not benchmarked", "Not route eligible"],
    ["Q5/Q6-class 20B workstation candidate", "Planned / not benchmarked", "Not route eligible"],
    ["Higher precision research lane", "Future research", "Not route eligible"],
    ["150B distributed frontier lane", "Future frontier / not scoped", "Not route eligible"],
    ["512B AGI apex lane", "Future apex / AGI not demonstrated", "Not route eligible"]
  ],
  localRuntimeCandidates: [
    ["llama.cpp-compatible local runtime", "Candidate only", "No key, approval required"],
    ["Ollama local runtime", "Candidate only", "No key, approval required"],
    ["Approved distributed research runtime", "Future only", "Cloud/GPU/SSH approval required"]
  ],
  requiredMeasurements: [
    "Peak resident memory",
    "Context-length memory",
    "Tokens per second",
    "Fallback behavior",
    "Redacted logs"
  ],
  frontierRequiredEvidence: [
    "20B and 70B gate evidence",
    "Clean-room training plan",
    "Distributed runtime budget",
    "Privacy and safety review",
    "Observability and rollback plan",
    "Explicit human approval"
  ]
};

const SEIS_MASTER_OBJECTIVE_COVERAGE_UI = {
  source: "data/seis-master-objective-coverage.json",
  report: "reports/seis-master-objective-coverage.md",
  activeCoverage: "seis-ai-150b-frontier-boundary",
  activeCoverageStatus: "active / evidence-gated",
  activeRequirement: "Track SEIS AI 150B as a frontier research lane without claiming trained weights, routeable inference, provider access, SSH execution, or production readiness.",
  items: [
    {
      id: "user-work-protection",
      status: "active",
      requirement: "Protect user work, preserve dirty worktrees, and keep changes reversible.",
      evidence: "docs/governance/seis-master-prompt.md; docs/governance/seis-master-prompt-change-checklist.md",
      check: "npm run check:seis-master-prompt",
      gap: "Requires current diff review before every commit."
    },
    {
      id: "security-and-privacy",
      status: "active",
      requirement: "Prevent secrets exposure and govern SSH hardening risk.",
      evidence: "data/ssh-hardening-operation-contract.json; docs/deployment/ssh-wireguard-vps-cloud-server.md",
      check: "npm run check:ssh-hardening-contract",
      gap: "Track mode-isolation, lockout-safety, and fail-fast validation until direct-cloud SSH is proven."
    },
    {
      id: "architecture-and-maintainability",
      status: "active",
      requirement: "Keep governance and implementation surfaces mapped to a single operating contract.",
      evidence: "data/seis-master-prompt-implementation-map.json; docs/governance/adr-0001-seis-master-prompt-operating-contract.md",
      check: "npm run check:seis-master-prompt",
      gap: "Continue reducing duplicated governance text."
    },
    {
      id: "documentation-traceability",
      status: "active",
      requirement: "Make governance evidence reproducible through generated reports.",
      evidence: "reports/seis-master-prompt-governance.md; reports/seis-master-objective-coverage.md",
      check: "npm run check:seis-master-objective-coverage-report",
      gap: "Reports must be regenerated after source JSON changes."
    },
    {
      id: "apple-first-platform",
      status: "mapped",
      requirement: "Preserve Apple-first platform direction while keeping cross-platform checks realistic.",
      evidence: "docs/governance/seis-supreme-vision.md; AGENTS.md",
      check: "npm run check:seis-master-prompt",
      gap: "Apple-native runtime checks remain platform-specific."
    },
    {
      id: "design-accessibility-experience",
      status: "mapped",
      requirement: "Treat design, accessibility, and product experience as engineering systems.",
      evidence: "docs/governance/seis-supreme-vision.md; data/seis-operational-goal-tracker.json",
      check: "npm run check:seis-operational-goal-tracker",
      gap: "Needs ongoing product-surface validation."
    },
    {
      id: "ai-data-cloud-automation",
      status: "active",
      requirement: "Keep AI, data, cloud, SSH, and automation work governed and measurable.",
      evidence: "data/ssh-hardening-operation-contract.json; docs/deployment/ssh-wireguard-vps-cloud-server.md",
      check: "npm run check:ssh-vpn-cloud-server",
      gap: "Direct cloud mobile SSH remains blocked until strict readiness passes."
    },
    {
      id: "seis-ai-150b-frontier-boundary",
      status: "active",
      requirement: "Track the requested SEIS AI 150B direction as an evidence-gated frontier research lane without claiming trained weights, routeable inference, provider access, SSH execution, or production readiness.",
      evidence: "content/development/seis-model-scaling-hardware-profile.json; docs/ai/seis-model-scaling.md; packages/seis-ai/src/lib/plugin-integration.mjs; apps/web/desktop.js",
      check: "npm run check:seis-model-scaling-hardware-profile",
      gap: "150B remains blocked until 20B and 70B evidence, clean-room training plan, distributed runtime budget, privacy and safety review, observability, rollback, and explicit human approval exist."
    },
    {
      id: "open-source-github-readiness",
      status: "active",
      requirement: "Keep GitHub, community, governance, and CI readiness visible.",
      evidence: "data/seis-master-prompt-github-controls.json; .github/workflows/seis-master-prompt-governance.yml",
      check: "npm run check:open-source-governance",
      gap: "External GitHub branch settings must be verified before claiming enforcement."
    },
    {
      id: "god-mode-every-topic-feature-growth",
      status: "active",
      requirement: "Treat God Mode as incomplete unless Dashboard, Goals, Repos, Docs, Agents, security, AI policy, rollback, validation, and handoff all receive explicit feature or governance improvement evidence.",
      evidence: "content/development/seis-god-mode-feature-growth-ledger.json; content/development/seis-god-mode-module-coverage.json; content/development/seis-god-mode-completion-audit.json",
      check: "npm run check:seis-god-mode-feature-growth-ledger",
      gap: "Commit, push, CI, and final staged-boundary evidence are still required before the broad God Mode objective can be marked complete."
    }
  ],
  evidence: [
    "content/development/seis-model-scaling-hardware-profile.json",
    "docs/ai/seis-model-scaling.md",
    "packages/seis-ai/src/lib/plugin-integration.mjs",
    "apps/web/desktop.js"
  ],
  checks: [
    "npm run check:seis-master-objective-coverage",
    "npm run check:seis-master-objective-coverage-report",
    "npm run check:seis-model-scaling-hardware-profile",
    "npm test --prefix packages/seis-ai",
    "npm run check:desktop-os"
  ],
  blockedUntil: [
    "20B and 70B evidence",
    "clean-room training plan",
    "distributed runtime budget",
    "privacy and safety review",
    "observability and rollback",
    "explicit human approval"
  ]
};

const CODE_IDE_PANELS = [
  { id: "explorer", label: "Explorer", glyph: "EX", detail: "Browse browser-local VFS project files." },
  { id: "search", label: "Search", glyph: "SR", detail: "Search local files without external indexing." },
  { id: "source-control", label: "Source Control", glyph: "SC", detail: "Safe/mock Git review surface; no Git writes." },
  { id: "preview", label: "Preview", glyph: "PV", detail: "Render markdown, HTML, or code previews locally." },
  { id: "assistant", label: "AI Assistant", glyph: "AI", detail: "Local Demo code assistant; no provider key used." },
  { id: "extensions", label: "Extensions", glyph: "XT", detail: "Inspect installed SEIS editor extensions." }
];

const CODE_IDE_COMMANDS = [
  { id: "palette", label: "Command Palette", detail: "Open the desktop command palette." },
  { id: "search", label: "Run Local Search", detail: "Refresh local search results." },
  { id: "source-review", label: "Source Review", detail: "Open safe/mock source-control review." },
  { id: "preview", label: "Preview Active File", detail: "Open the active local preview panel." },
  { id: "assistant-review", label: "Ask Local Assistant", detail: "Generate local-only review guidance." }
];

const CODE_IDE_SOURCE_CONTROL_CHANGES = [
  ["apps/web/desktop.js", "Modified", "Desktop OS, Command Center, and IDE surface changes require browser smoke."],
  ["docs/STATUS.md", "Modified", "Status should describe mock, planned, and real states honestly."],
  ["content/development/seis-model-scaling-hardware-profile.json", "Tracked", "Model scaling profile is evidence-only until reviewed."]
];

const SEIS_V17_COMMAND_CENTER_MODULES = [
  {
    id: "desktop-os",
    label: "SEIS Desktop OS",
    status: "Working",
    state: "working",
    appId: "seis-system-os",
    routeId: "seis-system-os-app",
    evidence: "npm run check:desktop-os",
    detail: "Boot, desktop, launcher, windows, VFS, persistence, notifications, and shell controls."
  },
  {
    id: "ai-core",
    label: "SEIS AI Core",
    status: "Local Demo",
    state: "local-demo",
    appId: "ai-assistant",
    routeId: "seis-ai-app",
    evidence: "npm test --prefix packages/seis-ai",
    detail: "Provider-neutral AI layer, Local Demo mode, plugin awareness, model router concept, and safe agent plan."
  },
  {
    id: "second-brain",
    label: "SEIS Second Brain",
    status: "Local Demo",
    state: "local-demo",
    appId: "second-brain",
    routeId: "seis-second-brain-app",
    evidence: "npm run check:seis-second-brain",
    detail: "Obsidian-style Markdown vault, installed AI profiles, sub-agent lanes, Search/Files bridge, and GitHub readiness gates."
  },
  {
    id: "model-scaling",
    label: "SEIS Model Scaling",
    status: "Planned/Gated",
    state: "planned-gated",
    appId: "ai-assistant",
    routeId: "seis-ai-core-3d-demo",
    evidence: "npm run check:seis-model-scaling-hardware-profile",
    detail: "16GB+ RAM starts at the documented 20B profile; 70B and 150B frontier tiers stay future-gated until hardware, inference, training, safety, and validation evidence exist."
  },
  {
    id: "nvidia-accelerator-catalog",
    label: "NVIDIA Accelerator Catalog",
    status: "Planned/Gated",
    state: "planned-gated",
    appId: "nvidia-catalog",
    evidence: "npm run check:seis-nvidia-accelerator-catalog",
    detail: "NVIDIA GitHub, Build skills, run-anywhere model sources, and 11 local NVIDIA skill manifests are installed as SEIS registry/UI records only; repo clone, model download, NIM calls, Docker, GPU, SSH, and credentials remain approval-gated."
  },
  {
    id: "search",
    label: "SEIS Search",
    status: "Working",
    state: "working",
    appId: "search",
    routeId: "seis-search-gateway",
    evidence: "npm run check:desktop-os",
    detail: "Searches apps, files, website routes, Code, Design, Cloud, plugins, and local evidence."
  },
  {
    id: "code",
    label: "SEIS Code IDE",
    status: "Working",
    state: "working",
    appId: "code-ide",
    routeId: "seis-code-web",
    evidence: "npm run check:product-experience-browser-smoke",
    detail: "File explorer, editor, terminal, tabs, extensions, source-control safe mode, and standalone web IDE route."
  },
  {
    id: "design",
    label: "SEIS Design Studio",
    status: "Local Demo",
    state: "local-demo",
    appId: "seis-design",
    routeId: "seis-design-app",
    evidence: "npm run check:product-experience-browser-smoke",
    detail: "Canvas, tokens, component cards, website handoff, prototype preview, and safe design assistant mode."
  },
  {
    id: "cloud",
    label: "SEIS Cloud",
    status: "Mock Safe",
    state: "mock-safe",
    appId: "seis-cloud",
    routeId: "seis-cloud-app",
    evidence: "docs/product/seis-desktop-os.md",
    detail: "Cloud, deployment, SSH, backup, and health concepts are represented without live server mutation."
  },
  {
    id: "store",
    label: "SEIS Store",
    status: "Local Demo",
    state: "local-demo",
    appId: "seis-store",
    evidence: "npm run check:desktop-os",
    detail: "Local app, plugin, theme, tool, install, update, and enable/disable state catalog."
  },
  {
    id: "music",
    label: "SEIS Music",
    status: "Working",
    state: "working",
    appId: "music",
    evidence: "npm run check:desktop-os",
    detail: "Player, playlist, album cards, visualizer bars, and play/pause/next/previous interactions."
  },
  {
    id: "launchpad",
    label: "SEIS Launchpad",
    status: "Working",
    state: "working",
    appId: "launchpad",
    evidence: "npm run check:desktop-os",
    detail: "Full app grid, categories, search, quick launch, favorites, and route shortcuts."
  },
  {
    id: "files",
    label: "SEIS Files",
    status: "Working",
    state: "working",
    appId: "files",
    evidence: "npm run check:desktop-os",
    detail: "Virtual folders, files, list/grid workflow, safe create, open, export, trash, and Code workspace mirroring."
  },
  {
    id: "terminal",
    label: "Terminal / SSH Center",
    status: "Local Demo",
    state: "local-demo",
    appId: "terminal",
    evidence: "npm run check:desktop-os",
    detail: "Browser-safe command history and VFS commands. Real SSH is disabled until explicitly approved."
  },
  {
    id: "website",
    label: "SEIS Website",
    status: "Working",
    state: "working",
    appId: "seis-website",
    routeId: "seis-website-hub",
    evidence: "npm run check:seis-website-pages",
    detail: "Product pages for AI, OS, Code, Design, Search, Cloud, Store, and Agents."
  },
  {
    id: "agents",
    label: "SEIS Agents",
    status: "Local Demo",
    state: "local-demo",
    appId: "sub-agent-control",
    routeId: "sub-agent-os-demo",
    evidence: "npm run check:seis-sub-agent-5-year-plan",
    detail: "Bounded Architect, Code, Design, Security, DevOps, Documentation, QA, Cloud, and Automation lanes."
  },
  {
    id: "plugins",
    label: "SEIS Plugin System",
    status: "Local Demo",
    state: "local-demo",
    appId: "ai-assistant",
    evidence: "npm run check:seis-agent-plugin-integration",
    detail: "Personal SEIS plugin bridge, MCP tool/resource map, and local-only plugin status exports."
  },
  {
    id: "command-center",
    label: "SEIS Command Center",
    status: "Working",
    state: "working",
    appId: "seis-command-center",
    routeId: "seis-command-center-app",
    evidence: "npm run check:desktop-os",
    detail: "This V17 cockpit unifies module status, evidence, launch actions, mock/real labels, and review queue."
  }
];

const AI_PLUGIN_TABS = ["Overview", "Installed AI", "Plugin Center", "Sub-Agent Plan", "Second Brain", "Tool Calls", "History"];
const SEIS_AI_PLUGIN_LANES = [
  { id: "seis-hub", name: "SEIS Hub", lane: "Governance", status: "Enabled", capability: "Source-of-truth routing, roadmap status, and demo orchestration." },
  { id: "seis-code", name: "SEIS Code", lane: "Engineering", status: "Enabled", capability: "Code workspace, terminal, Monaco, and implementation planning." },
  { id: "seis-design", name: "SEIS Design", lane: "Design", status: "Enabled", capability: "Product experience, visual QA, motion, and accessibility review." },
  { id: "seis-cloud", name: "SEIS Cloud", lane: "Cloud", status: "Enabled", capability: "Cloud readiness, SSH/VPN safety, deployment handoff, and no-key local status." },
  { id: "seis-evolution", name: "SEIS Evolution", lane: "Operations", status: "Enabled", capability: "Pinned work, Github 2 scope, SEIS-SSH boundary, and five-year integration view." },
  { id: "seis-data", name: "SEIS Data", lane: "Knowledge", status: "Enabled", capability: "VFS records, evidence, indexes, and local state exports." },
  { id: "seis-security", name: "SEIS Security", lane: "Safety", status: "Enabled", capability: "Secret hygiene, provider boundaries, MCP/tool permission review." }
];
const SEIS_PERSONAL_PLUGIN_BRIDGE = [
  {
    id: "seis@personal",
    embeddedAs: "seis",
    displayName: "SEIS Hub",
    lane: "Governance",
    sourceMirror: "plugins/seis",
    embeddedSkill: "plugins/seis-ai-agent/skills/seis-hub/SKILL.md",
    statusTool: "seis_hub_status",
    planTool: "seis_hub_plan",
    defaultGate: "npm run check:seis-ai-agent"
  },
  {
    id: "seis-cloud@personal",
    embeddedAs: "seis-cloud",
    displayName: "SEIS Cloud",
    lane: "Cloud",
    sourceMirror: "plugins/seis-cloud",
    embeddedSkill: "plugins/seis-ai-agent/skills/seis-cloud/SKILL.md",
    statusTool: "seis_cloud_status",
    planTool: "seis_cloud_plan",
    defaultGate: "npm run check:cloud-access-policy"
  },
  {
    id: "seis-code@personal",
    embeddedAs: "seis-code",
    displayName: "SEIS-Code",
    lane: "Engineering",
    sourceMirror: "plugins/seis-code",
    embeddedSkill: "plugins/seis-ai-agent/skills/seis-code/SKILL.md",
    statusTool: "seis_code_status",
    planTool: "seis_code_plan",
    defaultGate: "npm run check:seis-plugin-bundle"
  },
  {
    id: "seis-design@personal",
    embeddedAs: "seis-design",
    displayName: "SEIS-Design",
    lane: "Design",
    sourceMirror: "plugins/seis-design",
    embeddedSkill: "plugins/seis-ai-agent/skills/seis-design/SKILL.md",
    statusTool: "seis_design_status",
    planTool: "seis_design_plan",
    defaultGate: "npm run check:motion-evidence"
  },
  {
    id: "seis-data@personal",
    embeddedAs: "seis-data",
    displayName: "SEIS-DATA",
    lane: "Knowledge",
    sourceMirror: "plugins/seis-data",
    embeddedSkill: "plugins/seis-ai-agent/skills/seis-data/SKILL.md",
    statusTool: "seis_data_status",
    planTool: "seis_data_plan",
    defaultGate: "npm run check:plugin-capability-lanes"
  }
];
const SEIS_PERSONAL_PLUGIN_AI_CORE_LANE_MATRIX = [
  {
    pluginId: "seis@personal",
    laneId: "seis",
    displayName: "SEIS Hub",
    versionTargetId: "v0.1-foundation",
    versionLabel: "v0.1 Foundation Kernel",
    permissionLevel: "plan-only",
    versionDuty: "Keep source-of-truth, branch policy, public readiness, and plugin coordination aligned with each AI Core version.",
    toolPair: "seis_hub_status / seis_hub_plan",
    gate: "npm run check:seis-ai-agent",
    boundary: "Embedded personal plugin lane; no standalone publish, external mutation, credential access, deploy, SSH, or GitHub write without human approval."
  },
  {
    pluginId: "seis-cloud@personal",
    laneId: "seis-cloud",
    displayName: "SEIS Cloud",
    versionTargetId: "v0.4-multi-workspace-readiness",
    versionLabel: "v0.4 Multi-Workspace Readiness",
    permissionLevel: "plan-only",
    versionDuty: "Keep cloud, SSH, VPN, rollback, and deployment boundaries explicit before any version promotion.",
    toolPair: "seis_cloud_status / seis_cloud_plan",
    gate: "npm run check:cloud-access-policy",
    boundary: "Apply, deploy, SSH, firewall, VPN, and credential changes require explicit human approval."
  },
  {
    pluginId: "seis-code@personal",
    laneId: "seis-code",
    displayName: "SEIS-Code",
    versionTargetId: "v0.1-foundation",
    versionLabel: "v0.1 Foundation Kernel",
    permissionLevel: "plan-only",
    versionDuty: "Keep implementation, CI, MCP/plugin code, and test coverage tied to scoped version gates.",
    toolPair: "seis_code_status / seis_code_plan",
    gate: "npm run check:seis-plugin-bundle",
    boundary: "Implementation remains scoped, local, validation-bound, and separated from unrelated user work."
  },
  {
    pluginId: "seis-design@personal",
    laneId: "seis-design",
    displayName: "SEIS-Design",
    versionTargetId: "v0.2-read-only-intelligence",
    versionLabel: "v0.2 Read-Only Intelligence",
    permissionLevel: "plan-only",
    versionDuty: "Keep UI/UX, accessibility, design-system, and motion quality standards attached to each version.",
    toolPair: "seis_design_status / seis_design_plan",
    gate: "npm run check:motion-evidence",
    boundary: "Design and asset-generation work remains evidence-labeled, license-aware, and permissioned."
  },
  {
    pluginId: "seis-data@personal",
    laneId: "seis-data",
    displayName: "SEIS-DATA",
    versionTargetId: "v0.2-read-only-intelligence",
    versionLabel: "v0.2 Read-Only Intelligence",
    permissionLevel: "plan-only",
    versionDuty: "Keep structured records, reports, memory/context, provenance, and generated evidence deterministic.",
    toolPair: "seis_data_status / seis_data_plan",
    gate: "npm run check:plugin-capability-lanes",
    boundary: "Data, memory, RAG, and report work requires provenance, sensitivity review, and deterministic regeneration."
  }
];
const SEIS_MCP_RUNTIME_CONTRACT = {
  id: "seis-ai-core-mcp-runtime-contract",
  sourcePath: "content/development/seis-ai-core-mcp-runtime-contract.json",
  resourceUri: "seis://ai/mcp-runtime-contract.json",
  status: "local-smoke-verified",
  transport: "stdio JSON-RPC",
  fallbackRuntime: "LightweightMcpServer no-dependency fallback",
  fallback: "LightweightMcpServer no-dependency fallback",
  officialSdk: "@modelcontextprotocol/sdk remains optional unless dependencies are installed",
  toolCount: 34,
  promptCount: 3,
  resourceCount: 26,
  smokeTest: "node --test packages/seis-ai/test/mcp-smoke.test.mjs",
  pluginGate: "npm run check:seis-agent-plugin-integration",
  resourceRead: "seis://ai/mcp-runtime-contract.json",
  pluginIntegrationResource: "seis://agent/plugin-integration.json",
  boundary: "Browser demo and MCP smoke do not call remote MCP servers, store credentials, execute SSH, deploy, mutate GitHub, or run unrestricted shell tools.",
  surfaces: [
    {
      id: "tools",
      label: "Tool registry",
      count: 34,
      method: "tools/list + tools/call",
      evidence: "16 MCP smoke tests pass through stdio JSON-RPC",
      duty: "Expose repo-backed SEIS AI checks, personal plugin lane tools, provider registry status, model scaling status, and AI Core version/sub-agent tools."
    },
    {
      id: "resources",
      label: "Resource registry",
      count: 26,
      method: "resources/list + resources/read",
      evidence: "Plugin integration, provider registry, model scaling profile, model parameter ladder, frontier escalation policy, 150B frontier model program, 512B apex AGI program, 20B model/dataset card templates, and MCP runtime contract resources are read through the protocol",
      duty: "Expose source-of-truth JSON resources for plugin integration, provider states, planned model scaling, parameter ladder boundaries, no-skip-20B frontier policy, 150B frontier program, 512B apex AGI program, 20B clean-room evidence templates, MCP runtime, version gates, fixtures, and generated plan views."
    },
    {
      id: "prompts",
      label: "Prompt registry",
      count: 3,
      method: "prompts/list + prompts/get",
      evidence: "Prompt rendering is verified with arguments",
      duty: "Provide bounded audit, i18n, and review prompts without embedding secrets."
    },
    {
      id: "transport",
      label: "Transport boundary",
      count: 1,
      method: "stdio local process",
      evidence: "No dependency install required for local smoke",
      duty: "Keep MCP available for local verification while official SDK compatibility remains a separate hardening path."
    }
  ]
};
const SEIS_INSTALLED_AI_SYSTEMS = [
  {
    id: "codex-operator",
    name: "Codex",
    role: "Implementation operator",
    status: "Available",
    classification: "Current supervised operator profile",
    capability: "Repository editing, validation, and browser-local product implementation evidence.",
    boundary: "Available in the current human-supervised Codex task context; not a browser API key or autonomous background worker.",
    keyPolicy: "No browser credential"
  },
  {
    id: "seis-local-demo",
    name: "SEIS Local Demo Runtime",
    role: "No-key fallback",
    status: "Available",
    classification: "Browser-local demo provider",
    capability: "Claude-style REPL demo replies, AI Plugin Center actions, tool-call ledger, and VFS artifacts.",
    boundary: "Local Demo is not Anthropic, OpenAI, Gemini, Qwen, or a trained SEIS model.",
    keyPolicy: "No key required"
  },
  {
    id: "claude-review-profile",
    name: "Claude Review Profile",
    role: "Architecture and review profile",
    status: "Missing Key",
    classification: "External provider profile",
    capability: "Planned architecture, safety, and PR review lane through backend-only provider routing.",
    boundary: "Not connected in this browser demo; the `claude` terminal command remains Local Demo unless Anthropic is configured server-side.",
    keyPolicy: "Server-only Anthropic credential when explicitly configured"
  },
  {
    id: "qwen-review-profile",
    name: "Qwen Alternative Review",
    role: "Contradiction and archive review profile",
    status: "Disabled",
    classification: "External or local provider profile",
    capability: "Planned second-opinion reasoning and archive summarization lane.",
    boundary: "No live Qwen endpoint is configured or called by this route.",
    keyPolicy: "Server-only or local endpoint later"
  },
  {
    id: "gemini-validation-profile",
    name: "Gemini Secondary Validation",
    role: "Secondary validation profile",
    status: "Disabled",
    classification: "External provider profile",
    capability: "Planned multimodal or secondary validation lane after provider audit.",
    boundary: "No Google provider SDK is imported into the browser route.",
    keyPolicy: "Server-only Gemini credential when explicitly configured"
  },
  {
    id: "ollama-local-profile",
    name: "Ollama Local Candidate",
    role: "Zero-key local model profile",
    status: "Disabled",
    classification: "Local provider profile",
    capability: "Future local/private inference option through an allowlisted backend gateway.",
    boundary: "The browser does not probe localhost or download models automatically.",
    keyPolicy: "No key required; local service must be user-controlled"
  }
];
const SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX = [
  {
    systemId: "codex-operator",
    systemName: "Codex",
    versionTargetId: "v0.1-foundation",
    versionLabel: "v0.1 Foundation Kernel",
    providerState: "Available",
    routeMode: "supervised-operator",
    subAgentDuty: "Implementation, validation, and repository-safe edits",
    capability: "Code execution in the current human-supervised Codex task context.",
    credentialBoundary: "No browser credential; current Codex session only",
    fallback: "Local Demo planning when execution is not authorized"
  },
  {
    systemId: "seis-local-demo",
    systemName: "SEIS Local Demo Runtime",
    versionTargetId: "v0.1-foundation",
    versionLabel: "v0.1 Foundation Kernel",
    providerState: "Available",
    routeMode: "no-key-local-demo",
    subAgentDuty: "AI shell, Claude-style REPL demo, tool-call ledger, and VFS evidence",
    capability: "No-key responses and local workflow simulation without external model claims.",
    credentialBoundary: "No key required; browser-local state only",
    fallback: "Feature-disabled state for live inference"
  },
  {
    systemId: "claude-review-profile",
    systemName: "Claude Review Profile",
    versionTargetId: "v0.2-read-only-intelligence",
    versionLabel: "v0.2 Read-Only Intelligence",
    providerState: "Missing Key",
    routeMode: "backend-only-planned",
    subAgentDuty: "Architecture, safety, PR review, and large-context review lane",
    capability: "Planned Anthropic-backed review only after provider audit and server-side configuration.",
    credentialBoundary: "Server-only Anthropic credential when explicitly configured",
    fallback: "Do not relabel fallback output as Claude"
  },
  {
    systemId: "qwen-review-profile",
    systemName: "Qwen Alternative Review",
    versionTargetId: "v0.3-write-gated-runtime",
    versionLabel: "v0.3 Write-Gated Runtime",
    providerState: "Disabled",
    routeMode: "alternative-review-planned",
    subAgentDuty: "Contradiction detection, archive review, and second-opinion risk checks",
    capability: "Planned external or local Qwen-compatible review lane.",
    credentialBoundary: "Server-only or local endpoint later",
    fallback: "Local Demo labels alternative review as unavailable"
  },
  {
    systemId: "gemini-validation-profile",
    systemName: "Gemini Secondary Validation",
    versionTargetId: "v0.4-multi-workspace-readiness",
    versionLabel: "v0.4 Multi-Workspace Readiness",
    providerState: "Disabled",
    routeMode: "secondary-validation-planned",
    subAgentDuty: "Multimodal, product, and secondary validation after provider audit",
    capability: "Planned Google provider validation lane through backend-only routing.",
    credentialBoundary: "Server-only Gemini credential when explicitly configured",
    fallback: "No direct browser provider SDK"
  },
  {
    systemId: "ollama-local-profile",
    systemName: "Ollama Local Candidate",
    versionTargetId: "v0.2-read-only-intelligence",
    versionLabel: "v0.2 Read-Only Intelligence",
    providerState: "Disabled",
    routeMode: "zero-key-local-provider-planned",
    subAgentDuty: "Local/private inference candidate for local-only workspaces",
    capability: "Future allowlisted local model endpoint without automatic downloads.",
    credentialBoundary: "No key; user-controlled local service only",
    fallback: "Local Demo remains active when Ollama is offline"
  }
];
const SUB_AGENT_DEMO = {
  status: "Status/plan-only",
  runtime: "Dry-run demo",
  osSurface: "SEIS Desktop window manager",
  lanes: [
    ["SEIS Hub", "governance", "seis_hub_plan", "repository source of truth"],
    ["SEIS Cloud", "cloud", "seis_cloud_plan", "SSH/VPN/cloud preflight only"],
    ["SEIS-Code", "engineering", "seis_code_plan", "implementation planning and local validators"],
    ["SEIS-Design", "design", "seis_design_plan", "UX, accessibility, motion, visual QA"],
    ["SEIS-DATA", "data", "seis_data_plan", "provenance, memory, reports, schemas"],
    ["SEIS-Security", "security", "seis_security_plan", "approval, redaction, and permission boundaries"]
  ],
  years: [
    ["Year 1", "Foundation integrity", "status/plan tools and no-key policy"],
    ["Year 2", "Read-only intelligence", "evidence dashboards and stale-state UX"],
    ["Year 3", "Write-gated lanes", "human-approved scopes and rollback notes"],
    ["Year 4", "Cloud readiness", "SSH/VPN/deploy preflight and audit ledger"],
    ["Year 5", "Public readiness", "release evidence and model-claims governance"]
  ],
  gates: [
    "Approval fixture: scoped, action-specific, expiring human approval only",
    "Redaction fixture: no raw provider errors or credential fragments",
    "Execution ledger fixture: append-only planned records with no file/external mutation",
    "Review ledger: quarterly five-year evidence, currently status/plan-only"
  ]
};
const SEIS_AI_CORE_RESOURCE_BRIDGE = {
  status: "Generated evidence view",
  mode: "read-only-local-demo",
  sourcePlan: "content/development/seis-sub-agent-5-year-plan.json",
  planView: "apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json",
  planViewResource: "seis://ai/sub-agent-5-year-plan-view.json",
  promotionMap: "apps/seis-demo-web/data/seis-ai-core-version-promotion-map.json",
  promotionMapResource: "seis://ai/version-promotion-gates.json",
  mcpRuntimeContract: "content/development/seis-ai-core-mcp-runtime-contract.json",
  mcpRuntimeContractResource: "seis://ai/mcp-runtime-contract.json",
  providerRegistry: "content/development/seis-ai-core-provider-registry.json",
  providerRegistryResource: "seis://ai/provider-registry.json",
  pluginManifestResource: "seis://agent/plugin-integration.json",
  versionRegistryResource: "seis://ai/version-registry.json",
  generator: "scripts/create-sub-agent-five-year-demo-evidence.mjs",
  validator: "npm run check:seis-sub-agent-five-year-demo-evidence",
  pluginGate: "npm run check:seis-agent-plugin-integration",
  years: 5,
  quarters: 20,
  lanes: 6,
  versionTargets: 5,
  releasePromotionAllowed: false,
  boundary: "No provider call, no SSH, no deployment, no GitHub mutation, no credential access."
};
const SEIS_SECOND_BRAIN_SYSTEM = {
  status: "Local Demo",
  sourcePath: "content/development/seis-second-brain-system.json",
  productDoc: "docs/product/seis-second-brain.md",
  qualityGate: "npm run check:seis-second-brain",
  vaultRoot: "/home/seis/SecondBrain",
  snapshotPath: "/home/seis/SecondBrain/seis-second-brain-vault-snapshot.md",
  githubReadinessPath: "/home/seis/SecondBrain/github-readiness-review.md",
  trainingPackPath: "/home/seis/SecondBrain/07-learning/seis-agent-training-pack.md",
  releaseReviewPacketPath: "reports/seis-public-demo/pr54-review-packet-latest.md",
  languageModelTrainingCurriculum: {
    status: "planned-training-contract",
    contractPath: "content/development/seis-language-model-training-curriculum.json",
    reportPath: "reports/seis-model-scaling/seis-language-model-training-curriculum.md",
    boundary: "Planning-only curriculum. No model install, checkpoint download, foundation pretraining, fine-tuning, benchmark execution, provider call, SSH, or deployment is authorized."
  },
  obsidianState: "Obsidian bridge planned",
  runtimeBoundary: "Browser-local Markdown vault and graph. No Obsidian plugin install, provider call, SSH, deployment, GitHub mutation, credential access, or autonomous write runtime.",
  labels: ["Local Demo", "Obsidian bridge planned", "No secrets", "Human review before GitHub"],
  vaultNotes: [
    {
      id: "seis-os-map",
      title: "SEIS OS Map",
      folder: "01-system",
      path: "/home/seis/SecondBrain/01-system/seis-os-map.md",
      status: "Real Local Demo",
      summary: "Desktop OS, Search, Code, Design, Cloud, Store, Music, Files, Terminal, Agents, and Website are linked as first-class surfaces.",
      tags: ["#os", "#command-center", "#demo"],
      links: ["ai-core-router", "sub-agent-council", "github-readiness"]
    },
    {
      id: "ai-core-router",
      title: "AI Core Router",
      folder: "02-ai",
      path: "/home/seis/SecondBrain/02-ai/ai-core-router.md",
      status: "Local Demo",
      summary: "Installed AI profiles stay provider-neutral: Codex current operator, Local Demo fallback, and disabled/missing-key external profiles.",
      tags: ["#ai-core", "#model-router", "#local-demo"],
      links: ["seis-os-map", "sub-agent-council", "security-review"]
    },
    {
      id: "sub-agent-council",
      title: "Sub-Agent Council",
      folder: "03-agents",
      path: "/home/seis/SecondBrain/03-agents/sub-agent-council.md",
      status: "Status/plan-only",
      summary: "Bounded Architect, Code, Design, Cloud, Security, Documentation, and Data lanes can plan and review, not run unapproved background work.",
      tags: ["#agents", "#dry-run", "#approval-gated"],
      links: ["ai-core-router", "github-readiness", "security-review"]
    },
    {
      id: "obsidian-bridge",
      title: "Obsidian Bridge",
      folder: "04-vault",
      path: "/home/seis/SecondBrain/04-vault/obsidian-bridge.md",
      status: "Planned",
      summary: "Future Obsidian compatibility should export Markdown, backlinks, tags, and frontmatter without copying private vault contents into the repo.",
      tags: ["#obsidian", "#markdown", "#planned"],
      links: ["seis-os-map", "security-review"]
    },
    {
      id: "github-readiness",
      title: "GitHub Readiness",
      folder: "05-publish",
      path: "/home/seis/SecondBrain/05-publish/github-readiness.md",
      status: "Human review required",
      summary: "Public-ready notes need provenance, no-secret scan, docs index links, validator evidence, and review before push, merge, release, or Pages publication.",
      tags: ["#github", "#public-readiness", "#review"],
      links: ["seis-os-map", "sub-agent-council", "security-review"]
    },
    {
      id: "security-review",
      title: "Security Review",
      folder: "06-security",
      path: "/home/seis/SecondBrain/06-security/security-review.md",
      status: "Active guardrail",
      summary: "No secrets, private keys, cookies, .env values, private vault exports, or raw provider errors are stored in Second Brain artifacts.",
      tags: ["#security", "#no-secrets", "#redaction"],
      links: ["ai-core-router", "obsidian-bridge", "github-readiness"]
    }
  ],
  agentLanes: [
    ["Architect Agent", "read-only / plan-only", "Turn vault notes into architecture decisions and rollback-aware implementation slices."],
    ["Code Agent", "write-gated later", "Map notes to scoped code changes only after human-approved file scope exists."],
    ["Design Agent", "read-only / plan-only", "Extract product/design principles, screenshots, tokens, and UI review notes."],
    ["Search Agent", "read-only", "Index local notes, docs, routes, and files without external search calls."],
    ["Security Agent", "review-only", "Block secrets, private data, unsafe Obsidian exports, and unapproved GitHub/cloud actions."],
    ["Documentation Agent", "plan-only", "Convert reviewed notes into README, docs, changelog, and PR-ready summaries."]
  ],
  autonomousAgentRoster: [
    ["Architect Agent", "Status/plan-only", "architecture, module boundaries, rollback-aware implementation plans"],
    ["Code Agent", "Status/plan-only", "scoped implementation notes, validators, and code review evidence"],
    ["Design Agent", "Status/plan-only", "visual system, product feel, design tokens, and interaction evidence"],
    ["UI/UX Agent", "Status/plan-only", "usability, mobile ergonomics, focus order, and accessibility notes"],
    ["Research Agent", "Status/plan-only", "source provenance, prior-art notes, and clean-room research summaries"],
    ["Search Agent", "Status/plan-only", "local vault, docs, route, file, and plugin indexing strategy"],
    ["Security Agent", "Blocking review gate", "secret hygiene, private vault boundaries, and approval requirements"],
    ["DevOps Agent", "Status/plan-only", "CI, release, deployment, rollback, and no-live-action runbooks"],
    ["Documentation Agent", "Status/plan-only", "README, status, index, backlog, and PR queue alignment"],
    ["QA Agent", "Status/plan-only", "validator, browser-smoke, regression, and acceptance evidence"],
    ["Cloud Agent", "Status/plan-only", "cloud, SSH, storage, sync, and provider readiness boundaries"],
    ["Automation Agent", "Status/plan-only", "safe recurring workflows, ledgers, and human-approved automation gates"]
  ],
  pipeline: [
    ["Capture", "Local Demo", "Save browser-local Markdown notes under /home/seis/SecondBrain."],
    ["Link", "Local Demo", "Compute visible backlinks and graph edges from the repo-owned note map."],
    ["Review", "Human review required", "Run no-secret, provenance, and claim-boundary checks before public docs."],
    ["Publish", "Planned/Gated", "GitHub push, release, Pages, or Obsidian plugin sync require explicit approval."]
  ],
  githubGates: [
    "No secrets, private keys, .env values, cookies, or private vault exports",
    "Mock, Local Demo, planned, disabled, and real states are labeled",
    "Source JSON, product docs, Desktop app, and validator stay synchronized",
    "Human review before GitHub push, merge, release, or public Pages update"
  ]
};
const AI_CORE_VERSION_TARGETS = [
  {
    id: "v0.1-foundation",
    label: "v0.1",
    title: "Foundation Kernel",
    year: "Year 1",
    capability: "No-key desktop shell, Local Demo AI identity, VFS, and route-aware command center.",
    gate: "Desktop and product browser smokes pass."
  },
  {
    id: "v0.2-read-only-intelligence",
    label: "v0.2",
    title: "Read-Only Intelligence",
    year: "Year 2",
    capability: "Provider-neutral model router contracts, privacy modes, and local-only fallback policy.",
    gate: "Provider audit and no-key startup fixtures validate."
  },
  {
    id: "v0.3-write-gated-runtime",
    label: "v0.3",
    title: "Write-Gated Runtime",
    year: "Year 3",
    capability: "Write-gated sub-agent lanes, approval evidence, cancellation, redaction, and scoped tools.",
    gate: "Runtime fixtures pass before any background automation."
  },
  {
    id: "v0.4-multi-workspace-readiness",
    label: "v0.4",
    title: "Multi-Workspace Readiness",
    year: "Year 4",
    capability: "Read-only cloud/SSH preflight, remote workspace safety, and deployment readiness records.",
    gate: "SSH, provider, and deployment actions remain approval-gated."
  },
  {
    id: "v1.0-public-enterprise-candidate",
    label: "v1.0",
    title: "Enterprise Alpha",
    year: "Year 5",
    capability: "Public-preparation evidence, release gates, model-claims governance, and operator review pack.",
    gate: "Release evidence, security review, and human approval are complete."
  }
];
const SEIS_EVOLUTION_REFERENCE = {
  projectRootLabel: "Github 2",
  activeProject: "SEIS demo masaustu olustur",
  sshProject: "vscode",
  sshStatus: "SEIS-SSH",
  sshHealth: "Connected indicator only",
  pinned: [
    ["Define SEIS AI Core", "7 dk.", "AI Core foundation surfaced in the local AI app."],
    ["Build Linux web replica", "queued", "Linux/macOS/Windows-style desktop profile switcher."],
    ["Build a single-URL VS Code Web", "7 dk.", "SEIS Code Web route and desktop app are searchable."],
    ["SEIS AI'ya entegre et", "queued", "AI Plugin Center links Code, Design, Cloud, and Evolution lanes."],
    ["SEIS AI/Website", "7 dk.", "Website routes include SEIS Code, Mythic Gacha, and Video Hero pages."]
  ],
  integrationRows: [
    ["SEIS AI", "AI Assistant + Plugin Center", "Local Demo, no cloud key required"],
    ["Desktop OS", "Linux/macOS/Windows profiles", "Switchable browser desktop styles"],
    ["SEIS Code", "Desktop app + full-page IDE", "Monaco-style workspace and VFS bridge"],
    ["SEIS Design", "Website/demo handoff", "Video Hero, Mythic Gacha, SEIS Code Web"],
    ["SEIS Cloud", "SSH/cloud readiness", "Approval-gated, no private key in browser"],
    ["SEIS Search", "Gateway route board", "Finds Code, Design, Cloud, Evolution, and websites"]
  ]
};
const LOCAL_ECOSYSTEM_INVENTORY = {
  note: "Inventory is derived from local folder and application names only. It does not copy app bundles, private files, licensed assets, or unclear archive contents.",
  apps: [
    ["Adobe Acrobat", "Document Ops", "PDF review, export, and documentation QA", "Reference only"],
    ["Adobe Creative Cloud", "Creative Ops", "Creative-suite availability signal", "Reference only"],
    ["Adobe Illustrator", "SEIS Design", "Vector, icon, illustration, and brand asset workflow", "Reference only"],
    ["Adobe InDesign", "SEIS Design", "Editorial layout and publication system workflow", "Reference only"],
    ["Adobe InCopy", "SEIS Docs", "Editorial collaboration and copy workflow", "Reference only"],
    ["Adobe Lightroom", "SEIS Media", "Photo curation and image pipeline workflow", "Reference only"],
    ["Adobe Photoshop", "SEIS Design", "Image editing, compositing, and visual polish workflow", "Reference only"],
    ["Adobe XD", "SEIS UX", "Legacy prototype reference and UX archive review", "Reference only"],
    ["Figma", "SEIS Design", "Design system, product flows, and review handoff", "Reference only"],
    ["Xcode", "Apple Native", "Future SwiftUI/macOS/iOS Command Center path", "Reference only"],
    ["Antigravity IDE", "Agent IDE", "Preferred SEIS agent workflow shell", "Reference only"],
    ["Codex", "Implementation", "Repository execution, validation, and local demo packaging", "Reference only"],
    ["Cursor", "Development", "Alternate code workspace reference", "Reference only"],
    ["JetBrains Toolbox", "Development", "Polyglot IDE capability reference", "Reference only"],
    ["Google Chrome", "Runtime", "Primary browser validation and demo runtime", "Available"],
    ["Safari", "Runtime", "Apple browser compatibility target", "Reference only"],
    ["Ollama", "Local AI", "Zero-key local model candidate", "Optional local provider"],
    ["Qwen", "Local/Secondary AI", "Secondary reasoning and local assistant reference", "Reference only"]
  ],
  workspaces: [
    ["SEIS", "Core repository", "Active runnable demo source", "Use directly"],
    ["Github / SEIS", "Alternate checkout", "Compare before importing", "Review first"],
    ["Codex", "Agent history", "Summarize only before promotion", "Archive review"],
    ["NewDESIGN", "Design staging", "Use only reviewed exports and licensed assets", "Review first"],
    ["News / Website portfolio", "Website archive", "Promote only public-safe website material", "Review first"],
    ["SEIS runnable demo packages", "Prior builds", "Use as regression/reference packages", "Reference only"],
    ["SEIS-ai-core-app-foundation", "AI Core archive", "Extract source-of-truth-aligned ideas only", "Review first"],
    ["UIX-Apps", "UI/archive area", "Classify useful app patterns before merge", "Review first"],
    ["VSCODE", "Editor archive", "Map useful behavior into SEIS Code without copying restricted code", "Review first"],
    ["Unclear or leaked archive folders", "Restricted material", "Do not use contents; keep quarantined for legal/security review", "Quarantine"]
  ],
  routes: [
    ["SEIS Search", "Gateway for local apps, folders, and demo routes"],
    ["SEIS Code", "Code and repository workspace"],
    ["SEIS Design", "Creative/web/demo handoff"],
    ["SEIS Cloud", "Runtime, local provider, SSH, and deployment boundary"],
    ["SEIS Evolution", "Pinned tasks, local inventory, and long-horizon map"]
  ]
};
const SEIS_MUSIC_TRACKS = [
  { id: "core-orbit", title: "Core Orbit", artist: "SEIS AI Core", mood: "Ambient system pulse", duration: "02:40", lane: "AI Core" },
  { id: "launch-sequence", title: "Launch Sequence", artist: "SEIS Desktop", mood: "Cinematic boot rhythm", duration: "03:12", lane: "Desktop OS" },
  { id: "cloud-gate", title: "Cloud Gate", artist: "SEIS Cloud", mood: "Low-tempo SSH-safe signal", duration: "02:58", lane: "Cloud" },
  { id: "mythic-draw", title: "Mythic Draw", artist: "SEIS Design", mood: "Ink and mist reveal cue", duration: "01:48", lane: "Design" },
  { id: "code-night", title: "Code Night", artist: "SEIS Code", mood: "Focused editor loop", duration: "03:34", lane: "Code IDE" }
];
const SEIS_WOW_IMPORTS = [
  { id: "part1", label: "SEIS WOW Extended Pages", pages: 18, html: 19, root: "SEIS_WOW_EXTENDED_PAGES" },
  { id: "part2", label: "SEIS WOW More Pages Part 2", pages: 28, html: 29, root: "SEIS_WOW_MORE_PAGES_PART2" },
  { id: "part3", label: "SEIS WOW More Pages Part 3", pages: 24, html: 25, root: "SEIS_WOW_MORE_PAGES_PART3" },
  { id: "part4", label: "SEIS WOW More Pages Part 4", pages: 30, html: 31, root: "SEIS_WOW_MORE_PAGES_PART4" },
  { id: "part5", label: "SEIS WOW More Pages Part 5", pages: 30, html: 30, root: "SEIS_WOW_MORE_PAGES_PART5" },
  { id: "part6", label: "SEIS WOW More Pages Part 6", pages: 30, html: 30, root: "SEIS_WOW_MORE_PAGES_PART6" },
  { id: "part7", label: "SEIS WOW More Pages Part 7", pages: 30, html: 30, root: "SEIS_WOW_MORE_PAGES_PART7" }
];
const SEIS_WOW_REFERENCES = [
  { id: "kimi-linuxos-reference", title: "Kimi LinuxOS", role: "Linux-like OS reference", url: "https://dwfcctyh2o6me.ok.kimi.link/?id=2045932438926155776&share_id=19d9fdbd-d7d2-8a19-8000-00001d7799f6" },
  { id: "kimi-vscode-web-reference", title: "Kimi VS Code Web", role: "VS Code Web reference", url: "https://gmzousbtqpx5w.kimi.page/?id=2057731079068581888&share_id=19e4e6a6-9342-8f07-8000-0000296a37dd" }
];
const SEIS_WOW_DESIGN_FUSION = [
  { title: "Desktop Overview", source: "Part 1 / 03", tag: "OS shell", image: "./wow-pages/imported/SEIS_WOW_EXTENDED_PAGES/png/03_desktop_overview.png", motif: "dark wallpaper, top system bar, left activity rail, bottom dock" },
  { title: "Launchpad All Apps", source: "Part 1 / 04", tag: "Launcher", image: "./wow-pages/imported/SEIS_WOW_EXTENDED_PAGES/png/04_launchpad_all_apps.png", motif: "centered search, tabbed categories, dense app grid" },
  { title: "Command Center", source: "Part 1 / 17", tag: "Home", image: "./wow-pages/imported/SEIS_WOW_EXTENDED_PAGES/png/17_command_center.png", motif: "large greeting, white product tiles, right-side status panels" },
  { title: "Command Palette", source: "Part 3 / 47", tag: "Actions", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART3/png/47_command_palette.png", motif: "six clear action cards with colored icon blocks" },
  { title: "Window Manager", source: "Part 3 / 57", tag: "Windows", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART3/png/57_window_manager.png", motif: "window controls, workspace layout, app switching" },
  { title: "Store App Detail", source: "Part 4 / 79", tag: "Store", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART4/png/79_store_app_detail.png", motif: "dark app frame with bright feature cards and clear actions" }
];
const SEIS_SYSTEM_OS_MODULES = [
  { id: "home-widgets", title: "Home Widget Gallery", source: "Part 7 / 161", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART7/png/161_home_widget_gallery.png", status: "Connected target", action: "Open widgets from the desktop guide and System OS center." },
  { id: "dynamic-island", title: "Dynamic Island Bar", source: "Part 7 / 162", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART7/png/162_dynamic_island_bar.png", status: "Shell pattern", action: "Use quick status, media, AI, and save events as the live activity strip." },
  { id: "live-activities", title: "Live Activity Cards", source: "Part 7 / 163", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART7/png/163_live_activity_cards.png", status: "Shell pattern", action: "Show recent files, provider state, task runs, and music state." },
  { id: "app-switcher", title: "App Switcher", source: "Part 7 / 164", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART7/png/164_app_switcher.png", status: "Implemented shell behavior", action: "Open windows, dock, launcher, and recents remain connected." },
  { id: "multi-screen", title: "Multi-Screen Workspace", source: "Part 7 / 165", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART7/png/165_multiscreen_workspace.png", status: "Implemented shell behavior", action: "Workspace 1/2/3 and snapping operate as browser-safe monitor lanes." },
  { id: "terminal-mux", title: "Terminal Multiplexer", source: "Part 7 / 167", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART7/png/167_terminal_multiplexer.png", status: "Planned upgrade", action: "Terminal already runs 38 commands; multiplexer UX remains the next refinement." },
  { id: "launcher-search", title: "App Launcher Search", source: "Part 6 / 135", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART6/png/135_app_launcher_search.png", status: "Implemented shell behavior", action: "Launchpad and command palette search apps, routes, and files." },
  { id: "context-menu", title: "Context Menu System", source: "Part 6 / 136", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART6/png/136_context_menu_system.png", status: "Connected target", action: "File and app context surfaces should be promoted from reference into shell controls." },
  { id: "universal-recents", title: "Universal Recents", source: "Part 6 / 139", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART6/png/139_universal_recents.png", status: "Implemented shell behavior", action: "Control Center tracks recent apps, files, and local events." },
  { id: "file-preview", title: "File Preview Panel", source: "Part 6 / 140", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART6/png/140_file_preview_panel.png", status: "Implemented app behavior", action: "Files and SEIS Code share VFS previews and Monaco opening." },
  { id: "appearance-a11y", title: "Appearance + Accessibility", source: "Part 6 / 149", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART6/png/149_appearance_accessibility.png", status: "Implemented settings behavior", action: "Theme, OS profile, keyboard shortcuts, and responsive smoke are validated." },
  { id: "quality-system", title: "Visual Regression + Performance", source: "Part 5 / 123-125", image: "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART5/png/123_visual_regression.png", status: "Validation lane", action: "Browser smoke, static build, video, gacha, and Code validators are run locally." }
];
const SEIS_SYSTEM_OS_EVIDENCE = {
  boundary: "local-demo-only",
  quarters: 20,
  completionPercent: 100,
  lanes: 6,
  versionTargets: 5,
  mcpTools: 33,
  mcpStatus: "local-smoke-verified",
  dryRunOnly: true,
  releasePromotionAllowed: false
};
const NVIDIA_ACCELERATOR_CATALOG = {
  id: "seis-nvidia-accelerator-catalog",
  appId: "nvidia-catalog",
  sourcePath: "content/development/seis-nvidia-accelerator-catalog.json",
  docPath: "docs/ai/nvidia-accelerator-catalog.md",
  status: "catalog-ready-install-blocked",
  mode: "Local Demo catalog",
  qualityGate: "npm run check:seis-nvidia-accelerator-catalog",
  installedIntegrationsGate: "npm run check:seis-nvidia-installed-integrations",
  planCommand: "npm run plan:nvidia-catalog-install",
  installedIntegrationsRegistry: "content/development/seis-nvidia-installed-integrations.json",
  githubOrg: "https://github.com/NVIDIA",
  buildSkills: "https://build.nvidia.com/skills",
  buildModels: "https://build.nvidia.com/models",
  githubPublicRepoCount: 756,
  buildSkillsUrlStatus: 200,
  buildModelsUrlStatus: 200,
  sampleRepos: [
    ["skills", "Python", "NOASSERTION", "not-cloned"],
    ["cosmos", "Jupyter Notebook", "NOASSERTION", "not-cloned"],
    ["SkillSpector", "Python", "Apache-2.0", "not-cloned"],
    ["nv-redfish", "Rust", "Apache-2.0", "not-cloned"],
    ["Isaac-GR00T", "Python", "Apache-2.0", "not-cloned"]
  ],
  domains: ["AI and machine learning", "Physical AI", "Accelerated computing", "Infrastructure", "Developer tools"],
  audiences: ["Developer", "AI engineer", "ML engineer", "Application developer", "Platform engineer", "DevOps engineer", "Data scientist", "HPC developer", "Robotics developer", "Security engineer"],
  publishers: ["nvidia", "meta", "qwen", "mistralai", "openai", "google", "microsoft", "deepseek_ai", "stabilityai", "bytedance", "ansys", "siemens"],
  gpuTypes: ["B200", "H100 80GB", "H200", "L40S", "A100 80GB", "A10G", "GB200", "GH200", "L4", "DGX Spark", "RTX PRO 6000 Blackwell"],
  installedSkillIntegrations: [
    ["aiq-deploy", "AI-Q Deploy", "AI-Q", "installed-gated", "Deployment capability visible; live AI-Q setup remains approval-gated."],
    ["aiq-research", "AI-Q Research", "AI-Q", "installed-gated", "Research capability visible; backend query requires verified trusted endpoint."],
    ["cuopt-user-rules", "cuOpt User Rules", "Optimization", "installed-gated", "Optimization guidance visible; cuOpt server or SDK install remains gated."],
    ["dynamo-interconnect-check", "Dynamo Interconnect Check", "Dynamo", "installed-gated", "Read-only fabric validation lane visible; cluster access remains gated."],
    ["dynamo-router-starter", "Dynamo Router Starter", "Dynamo", "installed-gated", "Router bring-up lane visible; local/Kubernetes router actions remain gated."],
    ["nemoclaw-user-get-started", "NemoClaw Quickstart", "Agent Sandbox", "installed-gated", "Sandbox onboarding lane visible; remote installer execution remains gated."],
    ["omniverse-cad-to-simready", "Omniverse CAD to SimReady", "Omniverse", "installed-gated", "Design-to-simulation lane visible; asset conversion services remain gated."],
    ["omniverse-realtime-viewer", "Omniverse Realtime Viewer", "Omniverse", "installed-gated", "Realtime viewer lane visible; GPU viewer runtime remains gated."],
    ["omniverse-usd-performance-tuning", "Omniverse USD Performance Tuning", "Omniverse", "installed-gated", "USD performance lane visible; private scene profiling remains gated."],
    ["physical-ai-infrastructure-setup-and-resilient-scaling", "Physical AI Infrastructure", "Physical AI", "installed-gated", "Cloud/cluster lane visible; MicroK8s, AKS, OSMO, and NIM Operator actions remain gated."],
    ["physical-ai-neural-reconstruction", "Physical AI Neural Reconstruction", "Physical AI", "installed-gated", "Neural reconstruction lane visible; datasets and simulation jobs remain gated."]
  ],
  blockedActions: [
    "Clone all NVIDIA GitHub repositories",
    "Download model weights or NIM containers",
    "Call NVIDIA Build/NIM APIs",
    "Provision GPU infrastructure",
    "Install dependencies or Docker images",
    "Store NVIDIA credentials in browser state"
  ],
  queue: [
    ["NVIDIA GitHub inventory", "dry-run-ready", "metadata and allowlist queue only"],
    ["NVIDIA Build skills", "catalog-link-only", "skill-specific install requires license review"],
    ["NVIDIA Build models", "catalog-link-only", "model-specific hardware, cost, and credential review"],
    ["SEIS AI router alignment", "planned-gated", "backend-only provider mediation required"],
    ["SEIS Cloud GPU readiness", "planned-gated", "explicit cloud/GPU/SSH approval required"]
  ]
};
const SEIS_DEMO_STUDIO_STATUS = [
  ["Working", "Runs in this browser demo and can be opened from the journey."],
  ["Local Demo", "Interactive local state or VFS artifact only; no provider, SSH, deployment, or GitHub write."],
  ["Mock Safe", "Shown as a realistic product concept with explicit mock/safe labels."],
  ["Planned/Gated", "Requires future evidence, credentials, infrastructure, approval, or validation before becoming live."]
];
const SEIS_DEMO_JOURNEYS = [
  {
    id: "executive-demo",
    title: "Executive Product Demo",
    mode: "Local Demo",
    status: "Working",
    summary: "A tight walkthrough for showing SEIS as one premium creative operating system instead of disconnected pages.",
    primaryApp: "seis-command-center",
    routeId: "seis-website-hub",
    proof: "Desktop OS, Command Center, Website, Search, Store, Music, and Local Demo AI stay connected through one shell.",
    steps: [
      { id: "boot-os", label: "Open System OS", appId: "seis-system-os", state: "Working", output: "Shows shell, workspaces, windows, launcher, widgets, and no-key boundary." },
      { id: "command-center", label: "Open Command Center", appId: "seis-command-center", state: "Working", output: "Shows V17 module map, validation queue, model-scaling boundary, and review status." },
      { id: "search", label: "Search Across SEIS", appId: "search", state: "Working", output: "Shows AI/Web/Code/Design/Cloud/Apps/Plugins/Files result tabs." },
      { id: "website", label: "Open Website Hub", appId: "seis-website", routeId: "seis-website-hub", state: "Working", output: "Shows product pages for AI, OS, Code, Design, Search, Cloud, Store, and Agents." },
      { id: "store-music", label: "Open Store and Music", appId: "seis-store", companionAppId: "music", state: "Local Demo", output: "Shows install state, app catalog, playlist, player controls, and local soundtrack." }
    ],
    gates: ["No provider key required", "No SSH execution", "No deployment", "No trained-model claim", "Browser-local VFS evidence only"]
  },
  {
    id: "builder-flow",
    title: "Builder Workflow",
    mode: "Local Demo",
    status: "Working",
    summary: "A developer/designer path that proves SEIS can move from files to Code IDE, Design Studio, and local handoff artifacts.",
    primaryApp: "code-ide",
    routeId: "seis-code-web",
    proof: "Files, Terminal, SEIS Code, Code IDE, Design Studio, and shared VFS bridge respond as a working local workflow.",
    steps: [
      { id: "files", label: "Inspect Files", appId: "files", state: "Working", output: "Uses searchable grid/list VFS, selected preview, recents, and safe file actions." },
      { id: "terminal", label: "Run Terminal", appId: "terminal", state: "Local Demo", output: "Runs browser-safe commands, command history, file IO, and Local Demo REPL boundary." },
      { id: "code", label: "Open Code IDE", appId: "code-ide", routeId: "seis-code-web", state: "Working", output: "Shows explorer, search, source-control safe mock, preview, extensions, status bar, and Local Demo assistant." },
      { id: "design", label: "Open Design Studio", appId: "seis-design", state: "Local Demo", output: "Shows website route handoff, creative tools, local design references, and no runtime generation key." },
      { id: "handoff", label: "Export Builder Handoff", appId: "demo-studio", state: "Local Demo", output: "Writes a browser-local journey evidence file into Documents." }
    ],
    gates: ["Source control is safe/mock", "AI assistant is Local Demo", "No Git push or merge", "No dependency install", "VFS remains browser-local"]
  },
  {
    id: "ai-agent-flow",
    title: "AI Core and Agent Flow",
    mode: "Status/plan only",
    status: "Local Demo",
    summary: "A truthful AI operating-center walkthrough that shows installed AI profiles, plugin lanes, MCP resources, sub-agent planning, and model-scaling boundaries.",
    primaryApp: "ai-assistant",
    routeId: "seis-ai-core-3d-demo",
    proof: "AI Core is provider-neutral and local by default; unavailable providers stay Missing Key or Disabled instead of being faked.",
    steps: [
      { id: "ai-core", label: "Open SEIS AI", appId: "ai-assistant", state: "Local Demo", output: "Shows Local Demo chat, plugin tabs, installed AI profiles, and tool-call history." },
      { id: "installed-ai", label: "Audit Installed AI", appId: "ai-assistant", actionId: "audit-installed-ai-systems", state: "Local Demo", output: "Exports installed AI audit evidence without printing or storing credentials." },
      { id: "agents", label: "Open Sub-Agent Control", appId: "sub-agent-control", routeId: "sub-agent-os-demo", state: "Local Demo", output: "Shows bounded 20-quarter plan, process rows, AI Core orbit, and local dry-run evidence." },
      { id: "plugins", label: "Open Plugin Bridge", appId: "ai-assistant", state: "Local Demo", output: "Shows personal plugin bridge, MCP runtime contract, and plan-only lane matrix." },
      { id: "model-boundary", label: "Export 20B Preflight", appId: "seis-command-center", actionId: "export-model-preflight", state: "Planned/Gated", output: "Writes a dry-run checklist, not benchmark or trained-weight evidence." }
    ],
    gates: ["No browser secrets", "Missing Key is not Error", "No live provider call", "No autonomous write runtime", "20B/70B/150B remain evidence-gated"]
  },
  {
    id: "cloud-security-flow",
    title: "Cloud, SSH, and Security Flow",
    mode: "Mock Safe",
    status: "Planned/Gated",
    summary: "A safety-first cloud walkthrough that shows sync, deployment, SSH, logs, backup, and health states without faking live access.",
    primaryApp: "seis-cloud",
    routeId: "seis-website-cloud",
    proof: "Cloud and SSH are visible as product concepts, but real mutation remains approval-gated and disabled.",
    steps: [
      { id: "cloud", label: "Open SEIS Cloud", appId: "seis-cloud", state: "Mock Safe", output: "Shows sync, storage, repositories, SSH boundary, deployment gate, logs, backups, agents, and health concepts." },
      { id: "security", label: "Open Vault Boundary", appId: "password-vault", state: "Local Demo", output: "Shows placeholder-only secret records and redacted export behavior." },
      { id: "logs", label: "Open System Logs", appId: "system-logs", state: "Working", output: "Shows app launch and local workflow logs without private credential values." },
      { id: "cloud-preflight", label: "Run Cloud Preflight", appId: "seis-cloud", state: "Local Demo", output: "Writes browser-local preflight handoff; no SSH, deploy, cloud, or firewall mutation." },
      { id: "review-queue", label: "Return to Command Center", appId: "seis-command-center", state: "Working", output: "Shows human approval and validation gates before cloud promotion." }
    ],
    gates: ["No SSH execution", "No deploy", "No private key exposure", "No GitHub mutation", "Human approval required for live cloud actions"]
  }
];
const SEIS_STORE_ITEMS = [
  { id: "seis-system-os", name: "SEIS System OS", category: "System", status: "Installed", target: "app", targetId: "seis-system-os", detail: "Linux, macOS, and Windows-inspired browser OS shell with widgets, recents, app switcher, and validated local evidence." },
  { id: "demo-studio", name: "SEIS Demo Studio", category: "System", status: "Installed", target: "app", targetId: "demo-studio", detail: "Guided product journeys for OS, AI Core, Search, Code, Design, Cloud, Store, Music, Files, Terminal, Agents, Plugins, and Website." },
  { id: "linux-replica", name: "SEIS Linux Replica", category: "System", status: "Installed", target: "app", targetId: "linux-replica", detail: "Supplied-code Web Linux adaptation with boot, login, taskbar, launcher, windows, VFS, terminal, and 64 local app launch targets." },
  { id: "seis-code", name: "SEIS Code", category: "IDE", status: "Installed", target: "app", targetId: "seis-code", detail: "VS Code-like Monaco workspace, terminal, and VFS bridge." },
  { id: "code-ide", name: "Code IDE", category: "Developer", status: "Installed", target: "app", targetId: "code-ide", detail: "Dedicated IDE cockpit linking SEIS Code, terminal, extensions, and projects." },
  { id: "seis-design", name: "SEIS Design", category: "Creative", status: "Installed", target: "app", targetId: "seis-design", detail: "Website, product polish, motion, and design handoff cockpit." },
  { id: "seis-cloud", name: "SEIS Cloud", category: "Cloud", status: "Installed", target: "app", targetId: "seis-cloud", detail: "SSH/cloud safety, local runtime inventory, and deployment boundary." },
  { id: "music", name: "Music", category: "Creative", status: "Installed", target: "app", targetId: "music", detail: "Local soundtrack surface for the SEIS demo experience." },
  { id: "seis-website", name: "SEIS Website", category: "Website", status: "Installed", target: "app", targetId: "seis-website", detail: "Premium product website hub and eight focused product pages." },
  ...SEIS_WEBSITE_PAGE_ROUTES.map((route) => ({
    id: route.id,
    name: route.label,
    category: "Website",
    status: "Available",
    target: "route",
    targetId: route.id,
    detail: `Static product page at ${route.path}.`
  })),
  { id: "seis-linux-replica-web", name: "SEIS Linux Replica Web", category: "Website", status: "Available", target: "route", targetId: "seis-linux-replica-web", detail: "Standalone browser-local Linux replica route adapted from the supplied code." },
  { id: "wow-gallery-web", name: "SEIS WOW Gallery", category: "Website", status: "Available", target: "route", targetId: "wow-gallery-web", detail: "190 imported PNG page previews, 197 HTML references, and two Kimi external reference links." },
  { id: "mythic-gacha-web", name: "Mythic Gacha Web", category: "Website", status: "Available", target: "route", targetId: "mythic-gacha-web", detail: "Playable Shan Hai Jing-inspired gacha and bestiary route." },
  { id: "video-hero-gallery", name: "Video Hero Gallery", category: "Website", status: "Available", target: "route", targetId: "video-hero-gallery", detail: "Four immersive video hero showcase pages." },
  { id: "seis-ai-core-3d-demo", name: "SEIS AI Core 3D", category: "AI", status: "Available", target: "route", targetId: "seis-ai-core-3d-demo", detail: "Big-tech style AI Core, model router, prompt engine, and sub-agent website." },
  { id: "nvidia-catalog", name: "NVIDIA Accelerator Catalog", category: "AI", status: "Available", target: "app", targetId: "nvidia-catalog", detail: "Approval-gated catalog for NVIDIA GitHub repos, Build skills, and run-anywhere models. Install records are dry-run only." },
  ...NVIDIA_ACCELERATOR_CATALOG.installedSkillIntegrations.map(([id, name, category, status, safeUse]) => ({
    id: `nvidia-skill-${id}`,
    name,
    category: `NVIDIA ${category}`,
    status: "Installed/Gated",
    target: "app",
    targetId: "nvidia-catalog",
    detail: `${status}: ${safeUse}`
  }))
];
const DB_NAME = "seis-desktop-os";
const DB_VERSION = 1;
const STORE_NAME = "desktopState";
const STORAGE_KEY = "seis.desktop.state.v1";
const CODE_WORKSPACE_DB_NAME = "seis-code-workspace-v1";
const CODE_WORKSPACE_DB_VERSION = 1;
const CODE_WORKSPACE_ROOT = "/workspace";
const CODE_WORKSPACE_CHANNEL = "seis-code-workspace";
const SHARED_VFS_ROOT = "/workspace";
const DESKTOP_HOME = "/home/seis";
const WORKSPACE_IDS = ["1", "2", "3"];
const SESSION_WINDOW_LIMIT = 96;
const WALLPAPERS = [
  { id: "summit", name: "SEIS Summit", detail: "calm green depth" },
  { id: "aurora", name: "Aurora Mesh", detail: "cyan and violet orbit" },
  { id: "grid", name: "Command Grid", detail: "graphite blue grid" },
  { id: "dawn", name: "Copper Dawn", detail: "warm creative gradient" },
  { id: "prism", name: "SEIS Prism Wave", detail: "Linux-style abstract wave" }
];
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
  dir("/home/seis/Music"),
  dir("/home/seis/Applications"),
  dir("/home/seis/Projects"),
  dir("/home/seis/MythicArchive"),
  file("/home/seis/Documents/welcome.md", "# SEIS Desktop\n\nThis is a browser-contained operating surface. Files, terminal history, notes, tasks, and app preferences persist locally.\n"),
  file("/home/seis/Projects/example.html", "<h1>SEIS Web Playground</h1>\n<p>Edit this file in SEIS Code or run `cat Projects/example.html` in Terminal.</p>\n"),
  file("/home/seis/Documents/seis-demo-websites.md", "# SEIS Demo Websites\n\n- SEIS Website Hub: ./website/index.html\n- SEIS AI Website: ./website/seis-ai.html\n- SEIS OS Website: ./website/seis-os.html\n- SEIS Code Website: ./website/seis-code.html\n- SEIS Design Website: ./website/seis-design.html\n- SEIS Search Website: ./website/seis-search.html\n- SEIS Cloud Website: ./website/seis-cloud.html\n- SEIS Store Website: ./website/seis-store.html\n- SEIS Agents Website: ./website/seis-agents.html\n- SEIS System OS: ./desktop.html#seis-system-os\n- SEIS AI Core 3D Demo: ./ai-core-demo/index.html\n- SEIS Code Web: ./seis-code.html\n- SEIS Linux Replica: ./seis-linux-replica.html\n- SEIS WOW Gallery: ./wow-gallery.html\n- Mythic Gacha: ./mythic-gacha.html\n- Nature Video Hero: ./showcase/nature.html\n- Still Life Video Hero: ./showcase/still-life.html\n- Materials Video Hero: ./showcase/materials.html\n- Metal Parts Video Hero: ./showcase/metal-parts.html\n\nExternal references are opened only as clearly labeled reference links. The SEIS_WOW reference board now indexes 190 PNG screens and 197 HTML references. The SEIS Linux Replica route adapts the supplied Web Linux code into a SEIS-branded browser-local shell.\n"),
  file("/home/seis/Documents/seis-evolution-reference.md", "# SEIS Evolution Reference\n\nPinned scope: SEIS AI Core, Linux/macOS/Windows desktop demo, SEIS Code Web, SEIS AI integration, websites, and SEIS-SSH boundary.\n\nThis file is a local demo reference. It does not execute SSH or connect to cloud services.\n"),
  file("/home/seis/Documents/seis-local-ecosystem-inventory.md", "# SEIS Local Ecosystem Inventory\n\nThis demo maps the local application and folder names into SEIS roles without copying application bundles, private files, unclear archives, provider keys, or machine-specific paths.\n\n## SEIS Routes\n- SEIS Search: gateway for apps, folders, websites, Code, Design, Cloud, and AI Core.\n- SEIS Code: repository and editor workspace.\n- SEIS Design: Adobe/Figma-style creative workflow mapped to SEIS surfaces.\n- SEIS Cloud: Chrome/Safari/Ollama/Qwen/cloud/SSH readiness boundary.\n- SEIS Evolution: pinned work, local inventory, and long-horizon map.\n\n## Safety\nUnclear, leaked, private, generated, or licensed material remains review-only and is not merged into official SEIS behavior.\n"),
  file("/home/seis/Music/seis-demo-playlist.md", "# SEIS Demo Playlist\n\n- Core Orbit\n- Launch Sequence\n- Cloud Gate\n- Mythic Draw\n- Code Night\n\nThese are local demo track records, not external audio files.\n"),
  file("/home/seis/Applications/seis-store-catalog.md", "# SEIS Store Catalog\n\nInstalled: SEIS System OS, SEIS Linux Replica, SEIS Code, Code IDE, SEIS Design, SEIS Website, SEIS Cloud, Music, SEIS WOW Gallery.\nAvailable routes: SEIS Website pages, SEIS Linux Replica Web, SEIS WOW Gallery, Mythic Gacha Web, Video Hero Gallery, SEIS AI Core 3D.\n"),
  file("/home/seis/Documents/seis-system-os-blueprint.md", "# SEIS System OS Blueprint\n\nSEIS System OS combines Linux-like activities, macOS-like dock/status ergonomics, and Windows-like app switching/task layout into an original browser-contained SEIS shell.\n\n## Connected OS modules\n- Home widgets\n- Dynamic/live status strip\n- App switcher\n- Multi-screen workspaces\n- Launcher search\n- Universal recents\n- File previews\n- Appearance and accessibility\n- Terminal multiplexer target\n\n## Boundary\nLocal demo only. No SSH execution, provider keys, deployment, or release promotion happens from the browser shell.\n"),
  file("/home/seis/Desktop/todo.txt", "Open Files\nRun Terminal\nTry Apps launcher\n")
];

let db = null;
let state = createDefaultState();
let activeWindowId = null;
let launcherCategory = "All";
let codeWorkspaceSyncQueue = Promise.resolve();
let sharedVfsSaveQueue = Promise.resolve();
let sharedVfsMode = "unavailable";
let sharedVfsLastSavedAt = "";
let sharedVfsError = "";
let contextMenuState = null;
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
const launcherTabs = document.querySelector("[data-launcher-tabs]");
const launcherFrequent = document.querySelector("[data-launcher-frequent]");
const commandPalette = document.querySelector("[data-command-palette]");
const commandResults = document.querySelector("[data-command-results]");
const commandInput = document.querySelector("[data-command-input]");
const desktopAiCoreCanvas = document.querySelector("[data-desktop-ai-core-canvas]");
const desktopAiCoreStatus = document.querySelector("[data-desktop-ai-core-status]");
const quickStatus = document.querySelector("[data-quick-status]");
const shortcutOverlay = document.querySelector("[data-shortcut-overlay]");
const contextMenu = document.querySelector("[data-context-menu]");
const bootScreen = document.querySelector("[data-boot-screen]");
const windowTemplate = document.querySelector("#window-template");

init();

async function init() {
  db = await withTimeout(openDatabase(), 300).catch(() => null);
  state = await loadState();
  await loadSharedWorkspace("shared-vfs-startup");
  ensureAiPluginInventory();
  applyTheme();
  renderDock();
  renderDesktopIcons();
  renderLauncher();
  renderTaskbar();
  setupClock();
  renderQuickStatus();
  renderShortcutOverlay();
  updateSystemIndicators();
  setupEvents();
  startDesktopAiCoreMap();
  ensureToastRegion();
  restoreStartupApps();
  exposeDiagnostics();
  completeBootSequence();
  void syncDesktopFromCodeWorkspace("startup");
  log("system", `SEIS Desktop ready with ${APPS.length} local demo apps.`);
}

function completeBootSequence() {
  if (!bootScreen) return;
  window.setTimeout(() => {
    bootScreen.classList.add("is-complete");
    bootScreen.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      bootScreen.hidden = true;
    }, 420);
  }, 920);
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
    wallpaper: "prism",
    osProfile: "linux",
    workspace: "1",
    nextWindow: 1,
    z: 30,
    windows: [],
    sessionWindows: null,
    fs: defaultFiles,
    currentDir: "/home/seis",
    selectedPath: "/home/seis/Documents/welcome.md",
    codePath: "/home/seis/Documents/welcome.md",
    terminalHistory: [],
    env: { SEIS_ENVIRONMENT: "local", SEIS_DATA_MODE: "local-demo" },
    logs: [],
    system: createDefaultSystemState(),
    installedExtensions: [
      { id: "markdown-tools", name: "Markdown Tools", enabled: true },
      { id: "theme-graphite", name: "Graphite Theme Pack", enabled: true },
      { id: "local-preview", name: "Local Preview Runner", enabled: true },
      ...SEIS_AI_PLUGIN_LANES.map((plugin) => ({ id: plugin.id, name: plugin.name, enabled: plugin.status === "Enabled", lane: plugin.lane }))
    ],
    startupApps: ["files", "browser-portal", "seis-code", "terminal"],
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
      launchpad: { query: "", savedAt: "" },
      "seis-store": { installed: ["seis-code", "code-ide", "seis-design", "seis-cloud", "music"], lastInstall: "" },
      music: { trackId: "core-orbit", playing: false, playlist: SEIS_MUSIC_TRACKS.map((track) => track.id), notes: "Local SEIS demo soundtrack." },
      "code-ide": {
        sessionName: "SEIS Code IDE",
        lastSnapshot: "",
        activePanel: "explorer",
        searchQuery: "SEIS",
        commandHistory: [],
        sourceControlMode: "Safe Mock",
        assistantMode: "Local Demo",
        assistantNote: "Local demo assistant is ready. It does not call external providers.",
        previewMode: "Browser-local preview"
      },
      "ai-assistant": {
        activeTab: "Plugin Center",
        messages: [{ role: "system", text: "Local Demo mode. No provider key is configured." }],
        toolCalls: [
          { name: "search_routes", status: "ready", scope: "apps, routes, files" },
          { name: "read_vfs", status: "ready", scope: "/home/seis and /workspace mirror" }
        ]
      }
    }
  };
}

function createDefaultSystemState() {
  const now = new Date().toISOString();
  return {
    networkOnline: true,
    audioMuted: false,
    volume: 72,
    notifications: [
      {
        id: "welcome-notification",
        title: "SEIS Desktop Ready",
        detail: "Local browser workspace active without cloud keys.",
        scope: "system",
        time: now,
        read: false
      }
    ],
    shortcutOverlay: {
      opens: 0,
      lastOpened: "",
      lastShortcut: ""
    },
    recent: []
  };
}

function ensureAiPluginInventory() {
  if (!Array.isArray(state.installedExtensions)) state.installedExtensions = [];
  for (const plugin of SEIS_AI_PLUGIN_LANES) {
    if (!state.installedExtensions.some((item) => item.id === plugin.id)) {
      state.installedExtensions.push({ id: plugin.id, name: plugin.name, enabled: plugin.status === "Enabled", lane: plugin.lane });
    }
  }
  const assistant = getAppData("ai-assistant");
  if (!assistant.activeTab || !AI_PLUGIN_TABS.includes(assistant.activeTab)) assistant.activeTab = "Plugin Center";
  if (!Array.isArray(assistant.messages)) assistant.messages = [{ role: "system", text: "Local Demo mode. No provider key is configured." }];
  if (!Array.isArray(assistant.toolCalls)) {
    assistant.toolCalls = [
      { name: "search_routes", status: "ready", scope: "apps, routes, files" },
      { name: "read_vfs", status: "ready", scope: "/home/seis and /workspace mirror" }
    ];
  }
}

function currentWorkspace() {
  return WORKSPACE_IDS.includes(String(state.workspace)) ? String(state.workspace) : "1";
}

function normalizeWorkspaceId(workspace) {
  return WORKSPACE_IDS.includes(String(workspace)) ? String(workspace) : currentWorkspace();
}

function ensureWindowWorkspace(win) {
  if (!win.workspace || !WORKSPACE_IDS.includes(String(win.workspace))) win.workspace = currentWorkspace();
  return win.workspace;
}

function isWindowInActiveWorkspace(win) {
  return ensureWindowWorkspace(win) === currentWorkspace();
}

function visibleWindows() {
  return state.windows.filter(isWindowInActiveWorkspace);
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
  return normalizeState(fallback || persisted || createDefaultState());
}

function normalizeState(nextState) {
  const base = createDefaultState();
  const workspace = WORKSPACE_IDS.includes(String(nextState.workspace)) ? String(nextState.workspace) : base.workspace;
  const wallpaper = WALLPAPERS.some((item) => item.id === nextState.wallpaper) ? nextState.wallpaper : base.wallpaper;
  const merged = {
    ...base,
    ...nextState,
    workspace,
    wallpaper,
    fs: Array.isArray(nextState.fs) && nextState.fs.length ? nextState.fs : base.fs,
    windows: [],
    sessionWindows: Array.isArray(nextState.sessionWindows)
      ? nextState.sessionWindows.map((win) => sanitizeSessionWindow(win)).filter(Boolean)
      : base.sessionWindows,
    appData: { ...base.appData, ...(nextState.appData || {}) },
    system: normalizeSystemState(nextState.system, base.system),
    logs: Array.isArray(nextState.logs) ? nextState.logs.slice(-160) : base.logs,
    terminalHistory: Array.isArray(nextState.terminalHistory) ? nextState.terminalHistory.slice(-100) : []
  };
  return merged;
}

function normalizeSystemState(system, base = createDefaultSystemState()) {
  const nextSystem = system && typeof system === "object" ? system : {};
  return {
    ...base,
    ...nextSystem,
    volume: clamp(Number(nextSystem.volume ?? base.volume), 0, 100),
    networkOnline: nextSystem.networkOnline !== false,
    audioMuted: B…75744 tokens truncated…named to ${baseName(destination)}.`);
    renderOpenWindows("files");
    renderOpenWindows("seis-code");
  } catch (error) {
    toast("Rename Blocked", String(error.message || error), { scope: "fs" });
  }
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

function getMusicState() {
  const data = getAppData("music");
  if (!data.trackId || !SEIS_MUSIC_TRACKS.some((track) => track.id === data.trackId)) data.trackId = SEIS_MUSIC_TRACKS[0].id;
  if (!Array.isArray(data.playlist) || !data.playlist.length) data.playlist = SEIS_MUSIC_TRACKS.map((track) => track.id);
  data.playing = Boolean(data.playing);
  return data;
}

function toggleMusicPlayback() {
  const data = getMusicState();
  data.playing = !data.playing;
  data.lastAction = `${data.playing ? "Started" : "Paused"} ${SEIS_MUSIC_TRACKS.find((track) => track.id === data.trackId)?.title || "track"}.`;
  log("music", data.lastAction);
  saveState();
  renderOpenWindows("music");
  toast("Music", data.lastAction);
}

function selectMusicTrack(trackId) {
  if (!SEIS_MUSIC_TRACKS.some((track) => track.id === trackId)) return;
  const data = getMusicState();
  data.trackId = trackId;
  data.playing = true;
  const track = SEIS_MUSIC_TRACKS.find((item) => item.id === trackId);
  data.lastAction = `Selected ${track.title}.`;
  log("music", data.lastAction);
  saveState();
  renderOpenWindows("music");
  toast("Music", data.lastAction);
}

function nextMusicTrack() {
  const data = getMusicState();
  const playlist = data.playlist.filter((id) => SEIS_MUSIC_TRACKS.some((track) => track.id === id));
  const currentIndex = Math.max(0, playlist.indexOf(data.trackId));
  const nextId = playlist[(currentIndex + 1) % playlist.length] || SEIS_MUSIC_TRACKS[0].id;
  selectMusicTrack(nextId);
}

function installStoreItem(itemId) {
  const item = SEIS_STORE_ITEMS.find((entry) => entry.id === itemId);
  if (!item) return;
  const data = getAppData("seis-store");
  if (!Array.isArray(data.installed)) data.installed = [];
  if (!data.installed.includes(item.id)) data.installed.push(item.id);
  data.lastInstall = `${item.name} recorded at ${new Date().toLocaleTimeString()}`;
  getListData("seis-store").unshift({
    id: `store-${Date.now()}`,
    title: `${item.name} install recorded`,
    body: `${item.category} · ${item.detail}`,
    done: true
  });
  log("seis-store", data.lastInstall);
  saveState();
  renderOpenWindows("seis-store");
  toast("SEIS Store", data.lastInstall);
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
  const message = `Created ${app.name} local item.`;
  items.unshift({
    id: `${appId}-${Date.now()}`,
    title: `${app.name} item ${items.length + 1}`,
    body: `${app.description} Created ${new Date().toLocaleTimeString()}.`,
    done: false
  });
  getAppStatus(appId).lastAction = message;
  log(appId, message);
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

  if (app.type === "files") {
    const visible = listDir(state.currentDir).map((item) => `- ${item.type}: ${item.path}`).join("\n") || "- empty";
    const path = `/home/seis/Documents/files-index-${Date.now()}.md`;
    upsertFile(path, `# SEIS Files Index\n\nCurrent directory: ${state.currentDir}\n\n${visible}\n`);
    getListData(appId).unshift({ id: `files-${Date.now()}`, title: "File index saved", body: path, done: true });
    message = `Files index saved to ${path}.`;
  } else if (app.type === "settings") {
    const path = "/home/seis/Documents/settings-snapshot.json";
    upsertFile(path, JSON.stringify({
      theme: state.theme,
      osProfile: state.osProfile || "linux",
      workspace: state.workspace,
      providerMode: "Local Demo",
      cloudKeysStoredInBrowser: false
    }, null, 2));
    getListData(appId).unshift({ id: `settings-${Date.now()}`, title: "Settings snapshot saved", body: path, done: true });
    message = `Settings snapshot saved to ${path}.`;
  } else if (app.type === "app-center") {
    const path = "/home/seis/Documents/app-center-catalog.json";
    upsertFile(path, JSON.stringify(APPS.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      type: item.type
    })), null, 2));
    getListData(appId).unshift({ id: `app-center-${Date.now()}`, title: "Catalog audit saved", body: path, done: true });
    message = `App Center catalog audit saved to ${path}.`;
  } else if (app.type === "launchpad") {
    const data = getAppData(appId);
    const path = "/home/seis/Documents/launchpad-layout.json";
    data.savedAt = new Date().toISOString();
    upsertFile(path, JSON.stringify({
      savedAt: data.savedAt,
      appCount: APPS.length,
      favorites: FAVORITES,
      desktopShortcuts: DESKTOP_SHORTCUTS,
      categories: [...new Set(APPS.map((item) => item.category))],
      featured: ["seis-code", "code-ide", "search", "seis-design", "seis-cloud", "seis-store", "music", "ai-assistant"]
    }, null, 2));
    getListData(appId).unshift({ id: `launchpad-${Date.now()}`, title: "Launchpad layout saved", body: path, done: true });
    message = `Launchpad layout saved to ${path}.`;
  } else if (app.type === "system-os") {
    const data = getAppData(appId);
    const path = "/home/seis/Documents/seis-system-os-blueprint.md";
    const timestamp = new Date().toISOString();
    data.lastSaved = new Date(timestamp).toLocaleTimeString();
    upsertFile(path, `# SEIS System OS Blueprint\n\nGenerated: ${timestamp}\nActive profile: ${state.osProfile || "linux"}\nOpen windows: ${state.windows.length}\nInstalled apps: ${APPS.length}\nReference screens: ${SEIS_WOW_IMPORTS.reduce((sum, item) => sum + item.pages, 0)}\n\n## Goal\nBuild SEIS as the operating system first, then expose Code, Design, Cloud, Store, Music, WOW Gallery, Mythic Gacha, AI Core, and sub-agent evidence from that shell.\n\n## OS Modules\n${SEIS_SYSTEM_OS_MODULES.map((module) => `- ${module.title}: ${module.status} / ${module.source} / ${module.action}`).join("\n")}\n\n## Evidence Boundary\n- Demo boundary: ${SEIS_SYSTEM_OS_EVIDENCE.boundary}\n- Completion: ${SEIS_SYSTEM_OS_EVIDENCE.completionPercent}% local evidence\n- Lanes: ${SEIS_SYSTEM_OS_EVIDENCE.lanes}\n- Version targets: ${SEIS_SYSTEM_OS_EVIDENCE.versionTargets}\n- MCP tools: ${SEIS_SYSTEM_OS_EVIDENCE.mcpTools}\n- Release promotion allowed: ${SEIS_SYSTEM_OS_EVIDENCE.releasePromotionAllowed ? "yes" : "no"}\n\n## Safety\nThis OS shell does not execute real SSH, deploy, expose keys, or claim live provider capability. It keeps external and imported references labeled.\n`);
    getListData(appId).unshift({ id: `system-os-${Date.now()}`, title: "System OS blueprint saved", body: path, done: true });
    message = `SEIS System OS blueprint saved to ${path}.`;
  } else if (app.type === "seis-command-center") {
    const data = getAppData(appId);
    const timestamp = new Date().toISOString();
    const path = "/home/seis/Documents/seis-v17-command-center-snapshot.md";
    const coverage = getV17CommandCenterCoverage();
    data.lastSnapshot = {
      time: timestamp,
      moduleCount: coverage.moduleCount,
      workingCount: coverage.workingCount,
      localDemoCount: coverage.localDemoCount,
      mockSafeCount: coverage.mockSafeCount,
      plannedGatedCount: coverage.plannedGatedCount,
      modelScalingFloor: coverage.modelScalingFloor,
      modelScalingFuture: coverage.modelScalingFuture,
      liveSshExecution: coverage.liveSshExecution,
      liveDeployment: coverage.liveDeployment
    };
    upsertFile(path, buildV17CommandCenterSnapshotMarkdown(timestamp));
    getListData(appId).unshift({ id: `v17-command-${Date.now()}`, title: "V17 Command Center snapshot saved", body: path, done: true });
    message = `SEIS V17 Command Center snapshot saved to ${path}.`;
  } else if (app.type === "demo-studio") {
    const data = getDemoStudioData();
    const journey = getDemoJourney(data.activeJourneyId);
    const path = exportDemoJourneyEvidence(journey.id, { quiet: true });
    data.lastPrimaryAction = new Date().toISOString();
    message = `SEIS Demo Studio evidence saved to ${path}.`;
  } else if (app.type === "second-brain") {
    const path = saveSecondBrainSnapshot("primary-snapshot", { quiet: true });
    message = `SEIS Second Brain vault snapshot saved to ${path}.`;
  } else if (app.type === "linux-replica") {
    const data = getAppData(appId);
    const timestamp = new Date().toISOString();
    const path = "/home/seis/Documents/seis-linux-replica-handoff.md";
    data.lastSaved = new Date(timestamp).toLocaleTimeString();
    upsertFile(path, `# SEIS Linux Replica Handoff\n\nGenerated: ${timestamp}\nRoute: ./seis-linux-replica.html\nSource: user-supplied Web Linux / NebulaOS-style pasted code\n\n## Implemented\n- Boot screen\n- Local login\n- Taskbar\n- Start menu with search and categories\n- Draggable/minimize/maximize/close windows\n- Browser-local VFS\n- Linux-like terminal commands\n- 64 local app launch targets\n\n## Boundary\nThe pasted code ended with placeholder app comments, so SEIS completes the runnable route with local templates. This route does not execute SSH, host shell commands, deployment, provider calls, or external network mutation.\n`);
    getListData(appId).unshift({ id: `linux-replica-${Date.now()}`, title: "Linux Replica handoff saved", body: path, done: true });
    message = `SEIS Linux Replica handoff saved to ${path}.`;
  } else if (app.type === "seis-website") {
    const data = getAppData(appId);
    const timestamp = new Date().toISOString();
    const path = "/home/seis/Documents/seis-website-map.md";
    data.lastSaved = new Date(timestamp).toLocaleTimeString();
    upsertFile(path, `# SEIS Website Map\n\nGenerated: ${timestamp}\n\n## Product Pages\n${SEIS_WEBSITE_PAGE_ROUTES.map((route) => `- ${route.label}: ${route.path}`).join("\n")}\n\n## Runtime Boundary\n- Core demo API keys required: 0\n- Live SSH execution: disabled\n- Live deployment: not performed\n- Live provider routing: Local Demo unless backend provider is configured and verified\n\n## Connected Apps\n- SEIS System OS\n- SEIS AI\n- SEIS Search\n- SEIS Code\n- SEIS Design\n- SEIS Cloud\n- SEIS Store\n- SEIS Agents\n`);
    getListData(appId).unshift({ id: `website-${Date.now()}`, title: "Website map saved", body: path, done: true });
    message = `SEIS Website map saved to ${path}.`;
  } else if (app.type === "store") {
    const data = getAppData(appId);
    const path = "/home/seis/Applications/seis-store-catalog.json";
    upsertFile(path, JSON.stringify({
      auditedAt: new Date().toISOString(),
      policy: "local-catalog-only",
      installed: Array.isArray(data.installed) ? data.installed : [],
      items: SEIS_STORE_ITEMS
    }, null, 2));
    getListData(appId).unshift({ id: `store-${Date.now()}`, title: "Store catalog audited", body: path, done: true });
    message = `SEIS Store catalog saved to ${path}.`;
  } else if (app.type === "music") {
    const data = getMusicState();
    const path = "/home/seis/Music/seis-demo-playlist.json";
    const markdownPath = "/home/seis/Music/seis-demo-playlist.md";
    const tracks = data.playlist.map((id) => SEIS_MUSIC_TRACKS.find((track) => track.id === id)).filter(Boolean);
    upsertFile(path, JSON.stringify({ savedAt: new Date().toISOString(), activeTrack: data.trackId, playing: data.playing, tracks }, null, 2));
    upsertFile(markdownPath, `# SEIS Demo Playlist\n\n${tracks.map((track) => `- ${track.title} / ${track.artist} / ${track.mood} / ${track.duration}`).join("\n")}\n`);
    getListData(appId).unshift({ id: `music-${Date.now()}`, title: "Playlist saved", body: path, done: true });
    message = `Music playlist saved to ${path}.`;
  } else if (app.type === "wow-gallery") {
    const data = getAppData(appId);
    const path = "/home/seis/Documents/seis-wow-gallery-index.md";
    const timestamp = new Date().toISOString();
    data.lastSaved = new Date(timestamp).toLocaleTimeString();
    upsertFile(path, `# SEIS WOW Gallery Index\n\nGenerated: ${timestamp}\n\n## Local Gallery\n- Route: ./wow-gallery.html\n- Catalog: ./wow-pages/wow-catalog.json\n- Imported PNG pages: ${SEIS_WOW_IMPORTS.reduce((sum, item) => sum + item.pages, 0)}\n- Imported HTML references: ${SEIS_WOW_IMPORTS.reduce((sum, item) => sum + item.html, 0)}\n\n## Collections\n${SEIS_WOW_IMPORTS.map((item) => `- ${item.label}: ${item.pages} PNG / ${item.html} HTML / ${item.root}`).join("\n")}\n\n## Kimi External References\n${SEIS_WOW_REFERENCES.map((ref) => `- ${ref.title}: ${ref.role} / ${ref.url}`).join("\n")}\n\n## Safety\nThese pages are imported visual references. They are not proof of live provider integration, live SSH execution, or official production readiness.\n`);
    getListData(appId).unshift({ id: `wow-${Date.now()}`, title: "WOW index saved", body: path, done: true });
    message = `SEIS WOW Gallery index saved to ${path}.`;
  } else if (app.type === "code-ide") {
    const data = getCodeIdeData();
    const timestamp = new Date().toISOString();
    const path = "/home/seis/Documents/code-ide-session.md";
    data.lastSnapshot = new Date(timestamp).toLocaleTimeString();
    const files = getCodeIdeFiles();
    const searchResults = getCodeIdeSearchResults(data, files);
    upsertFile(path, `# SEIS Code IDE Session\n\nGenerated: ${timestamp}\n\nActive file: ${state.codePath || "none"}\nActive panel: ${data.activePanel}\nSearch query: ${data.searchQuery || ""}\nSearch results: ${searchResults.length}\nWorkspace files: ${files.length}\nTerminal commands: ${REQUIRED_TERMINAL_COMMANDS.length}\nInstalled extensions: ${state.installedExtensions.length}\nStandalone route: ./seis-code.html\n\n## Runtime Boundary\n- Source control mode: ${data.sourceControlMode}\n- AI assistant mode: ${data.assistantMode}\n- Provider keys in browser: no\n- Git push, merge, SSH, deployment, or provider call executed: no\n\n## Command History\n${data.commandHistory.slice(0, 8).map((item) => `- ${item.time}: ${item.command}`).join("\n") || "- none"}\n\n## Files\n${files.slice(0, 30).map((item) => `- ${item.path}`).join("\n")}\n`);
    getListData(appId).unshift({ id: `code-ide-${Date.now()}`, title: "IDE session saved", body: path, done: true });
    message = `Code IDE session saved to ${path}.`;
  } else if (app.type === "search") {
    const data = getAppData(appId);
    data.query = workflowInput || "SEIS";
    data.result = `${APPS.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(data.query.toLowerCase())).length} local app matches.`;
    const path = "/home/seis/Documents/seis-search-gateway-map.md";
    const websiteRoutes = DEMO_ROUTES.filter((route) => route.kind === "Website" || route.kind === "Playable route" || route.kind === "Full-page IDE" || route.kind === "Showcase route" || route.kind === "External reference");
    upsertFile(path, `# SEIS Search Gateway Map\n\nGenerated: ${new Date().toISOString()}\nQuery: ${data.query}\n\n## Core Apps\n- SEIS System OS: Linux, macOS, and Windows-inspired shell where the rest of SEIS appears.\n- SEIS Code: VS Code-like desktop app.\n- Code IDE: dedicated IDE cockpit.\n- SEIS Design: design, website, and handoff surface.\n- SEIS Cloud: SSH/cloud safety and local runtime boundary.\n- SEIS Store: local app and route catalog.\n- NVIDIA Catalog: approval-gated NVIDIA GitHub, Build skills, model catalog intake, and ${NVIDIA_ACCELERATOR_CATALOG.installedSkillIntegrations.length} runtime-gated installed skill lanes.\n- Music: local demo soundtrack.\n- SEIS WOW Gallery: imported visual reference board for Kimi and SEIS_WOW packages.\n- SEIS AI: Local Demo AI Control Center.\n\n## NVIDIA Installed Integrations\n${NVIDIA_ACCELERATOR_CATALOG.installedSkillIntegrations.map(([id, name, category, status]) => `- ${name} (${id}): NVIDIA ${category} / ${status}`).join("\n")}\n\n## Website Routes\n${websiteRoutes.map((route) => `- ${route.label}: ${route.path}`).join("\n")}\n\n## Local Tool Inventory\n${LOCAL_ECOSYSTEM_INVENTORY.apps.map(([tool, role, use, status]) => `- ${tool}: ${role} / ${use} / ${status}`).join("\n")}\n\n## Safety\nNo application bundles, private keys, provider secrets, SSH commands, or licensed app contents are copied into this browser demo. External Kimi links are labeled as references.\n`);
    getListData(appId).unshift({ id: `search-${Date.now()}`, title: "Search gateway snapshot saved", body: path, done: true });
    message = `SEIS Search gateway snapshot saved to ${path}.`;
  } else if (app.type === "extensions") {
    const path = "/home/seis/Documents/extensions-audit.json";
    upsertFile(path, JSON.stringify(state.installedExtensions.map((item) => ({
      id: item.id,
      name: item.name,
      enabled: Boolean(item.enabled),
      lane: item.lane || "local"
    })), null, 2));
    getListData(appId).unshift({ id: `extensions-${Date.now()}`, title: "Extension audit saved", body: path, done: true });
    message = `Extension audit saved to ${path}.`;
  } else if (["notes", "text", "markdown", "writer", "mail", "snippets"].includes(app.type)) {
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
  } else if (app.type === "dictionary") {
    const data = getAppData(appId);
    data.query = workflowInput || "ecosystem";
    data.result = `${data.query}: a structured SEIS knowledge term.`;
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
  } else if (app.type === "subagent-control") {
    const data = getAppData(appId);
    const timestamp = new Date().toISOString();
    const path = "/home/seis/Documents/sub-agent-control-dry-run.md";
    data.lastDryRun = {
      time: timestamp,
      mode: "status-and-plan-only",
      ok: true,
      lanes: SUB_AGENT_DEMO.lanes.length,
      years: SUB_AGENT_DEMO.years.length,
      externalMutation: false
    };
    upsertFile(path, buildSubAgentDryRunMarkdown(timestamp));
    getListData(appId).unshift({
      id: `subagent-${Date.now()}`,
      title: "Dry-run status check",
      body: `${SUB_AGENT_DEMO.lanes.length} lanes and ${SUB_AGENT_DEMO.gates.length} gates reviewed locally.`,
      done: true
    });
    message = `Sub-Agent Control dry-run updated and saved to ${path}.`;
  } else if (app.type === "seis-design") {
    const data = getAppData(appId);
    const timestamp = new Date().toISOString();
    const path = "/home/seis/Documents/seis-design-demo-handoff.md";
    data.lastHandoff = {
      time: timestamp,
      websites: DEMO_ROUTES.filter((route) => route.kind === "Website" || route.id === "seis-code-web" || route.id === "mythic-gacha-web").length,
      localCreativeTools: LOCAL_ECOSYSTEM_INVENTORY.apps.filter(([, lane]) => ["Document Ops", "Creative Ops", "SEIS Design", "SEIS UX", "SEIS Docs", "SEIS Media"].includes(lane)).length,
      runtime: "local-demo",
      providerKeysRequired: false
    };
    upsertFile(path, buildSeisDesignHandoffMarkdown(timestamp));
    getListData(appId).unshift({
      id: `seis-design-${Date.now()}`,
      title: "Design handoff saved",
      body: path,
      done: true
    });
    message = `SEIS Design handoff saved to ${path}.`;
  } else if (app.type === "seis-cloud") {
    const data = getAppData(appId);
    const timestamp = new Date().toISOString();
    const path = "/home/seis/Documents/seis-cloud-local-preflight.md";
    data.lastPreflight = {
      time: timestamp,
      runtime: "browser-local",
      localRuntimeTools: LOCAL_ECOSYSTEM_INVENTORY.apps.filter(([, lane]) => ["Runtime", "Local AI", "Local/Secondary AI", "Agent IDE", "Implementation", "Apple Native", "Development"].includes(lane)).length,
      sshExecution: false,
      publicAccessContract: SEIS_SSH_PUBLIC_ACCESS_CONTRACT.contract,
      deployment: false,
      secretsStored: false
    };
    upsertFile(path, buildSeisCloudPreflightMarkdown(timestamp));
    getListData(appId).unshift({
      id: `seis-cloud-${Date.now()}`,
      title: "Local cloud preflight recorded",
      body: path,
      done: true
    });
    message = `SEIS Cloud local preflight saved to ${path}.`;
  } else if (app.type === "nvidia-catalog") {
    const data = getAppData(appId);
    const timestamp = new Date().toISOString();
    const path = "/home/seis/Documents/nvidia-accelerator-catalog-plan.md";
    data.lastPlan = {
      time: timestamp,
      path,
      status: NVIDIA_ACCELERATOR_CATALOG.status,
      githubPublicRepos: NVIDIA_ACCELERATOR_CATALOG.githubPublicRepoCount,
      liveInstallAllowed: false
    };
    upsertFile(path, buildNvidiaCatalogMarkdown(timestamp));
    getListData(appId).unshift({
      id: `nvidia-${Date.now()}`,
      title: "NVIDIA dry-run plan saved",
      body: path,
      done: true
    });
    message = `NVIDIA accelerator dry-run plan saved to ${path}.`;
  } else if (app.type === "seis-evolution") {
    const data = getAppData(appId);
    const timestamp = new Date().toISOString();
    const path = "/home/seis/Documents/seis-evolution-snapshot.md";
    data.lastSnapshot = {
      time: timestamp,
      pinnedTasks: SEIS_EVOLUTION_REFERENCE.pinned.length,
      integrationRows: SEIS_EVOLUTION_REFERENCE.integrationRows.length,
      localTools: LOCAL_ECOSYSTEM_INVENTORY.apps.length,
      folderInputs: LOCAL_ECOSYSTEM_INVENTORY.workspaces.length,
      sshExecution: false,
      osProfile: state.osProfile || "linux"
    };
    upsertFile(path, buildSeisEvolutionSnapshotMarkdown(timestamp));
    getListData(appId).unshift({
      id: `seis-evolution-${Date.now()}`,
      title: "Evolution snapshot saved",
      body: path,
      done: true
    });
    message = `SEIS Evolution snapshot saved to ${path}.`;
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

function addSecondBrainActivity(step, status, detail) {
  const data = getSecondBrainData();
  data.activity.unshift({
    id: `second-brain-${Date.now()}`,
    step,
    status,
    detail
  });
  data.activity = data.activity.slice(0, 12);
  return data;
}

function buildSecondBrainNoteMarkdown(note, timestamp) {
  const backlinks = getSecondBrainBacklinks(note.id);
  return `# ${note.title}

Generated: ${timestamp}
Status: ${note.status}
Folder: ${note.folder}
Path: ${note.path}
Tags: ${note.tags.join(" ")}

## Summary

${note.summary}

## Outgoing Links

${note.links.map((targetId) => {
  const target = SEIS_SECOND_BRAIN_SYSTEM.vaultNotes.find((candidate) => candidate.id === targetId);
  return `- [[${target?.title || targetId}]]`;
}).join("\n")}

## Backlinks

${backlinks.length ? backlinks.map((source) => `- [[${source.title}]]`).join("\n") : "- None yet"}

## Safety Boundary

${SEIS_SECOND_BRAIN_SYSTEM.runtimeBoundary}
`;
}

function buildSecondBrainSnapshotMarkdown(timestamp, mode) {
  return `# SEIS Second Brain Snapshot

Generated: ${timestamp}
Mode: ${mode}
Status: ${SEIS_SECOND_BRAIN_SYSTEM.status}
Obsidian: ${SEIS_SECOND_BRAIN_SYSTEM.obsidianState}
Vault root: ${SEIS_SECOND_BRAIN_SYSTEM.vaultRoot}
Source contract: ${SEIS_SECOND_BRAIN_SYSTEM.sourcePath}
Product doc: ${SEIS_SECOND_BRAIN_SYSTEM.productDoc}
Quality gate: ${SEIS_SECOND_BRAIN_SYSTEM.qualityGate}

## Labels

${SEIS_SECOND_BRAIN_SYSTEM.labels.map((label) => `- ${label}`).join("\n")}

## Vault Notes

${SEIS_SECOND_BRAIN_SYSTEM.vaultNotes.map((note) => `- ${note.title}: ${note.status} / ${note.path}`).join("\n")}

## Agent Lanes

${SEIS_SECOND_BRAIN_SYSTEM.agentLanes.map(([agent, permission, duty]) => `- ${agent}: ${permission} / ${duty}`).join("\n")}

## Installed AI Profiles

${SEIS_INSTALLED_AI_SYSTEMS.map((system) => `- ${system.name}: ${system.status} / ${system.role} / ${system.boundary}`).join("\n")}

## Managed Sub-Agent Lanes

${SUB_AGENT_DEMO.lanes.map(([name, lane, tool, scope]) => `- ${name}: ${lane} / ${tool} / ${scope}`).join("\n")}

## Autonomous Agent Roster

${SEIS_SECOND_BRAIN_SYSTEM.autonomousAgentRoster.map(([agent, status, duty]) => `- ${agent}: ${status} / ${duty}`).join("\n")}

## GitHub Gates

${SEIS_SECOND_BRAIN_SYSTEM.githubGates.map((gate) => `- ${gate}`).join("\n")}

## Boundary

${SEIS_SECOND_BRAIN_SYSTEM.runtimeBoundary}
`;
}

function buildSecondBrainTrainingPackMarkdown(timestamp) {
  const installedRows = SEIS_INSTALLED_AI_SYSTEMS.map((system) => `- ${system.name} | ${system.status} | ${system.role} | ${system.boundary}`);
  const laneRows = SUB_AGENT_DEMO.lanes.map(([name, lane, tool, scope]) => `- ${name} | ${lane} | ${tool} | ${scope}`);
  const rosterRows = SEIS_SECOND_BRAIN_SYSTEM.autonomousAgentRoster.map(([agent, status, duty]) => `- ${agent} | ${status} | ${duty}`);

  return `# SEIS Second Brain Agent Training Pack

Generated: ${timestamp}
Mode: Local Demo read-only
Status: ${SEIS_SECOND_BRAIN_SYSTEM.status}
Vault root: ${SEIS_SECOND_BRAIN_SYSTEM.vaultRoot}
Snapshot path: ${SEIS_SECOND_BRAIN_SYSTEM.snapshotPath}
GitHub readiness path: ${SEIS_SECOND_BRAIN_SYSTEM.githubReadinessPath}
Training pack path: ${SEIS_SECOND_BRAIN_SYSTEM.trainingPackPath}
Observed AI profiles: ${SEIS_INSTALLED_AI_SYSTEMS.length}
Observed sub-agent lanes: ${SUB_AGENT_DEMO.lanes.length}
Observed autonomous agent roster: ${SEIS_SECOND_BRAIN_SYSTEM.autonomousAgentRoster.length}

## 1) Obsidian Bridge Safe Import

- Contract source: content/development/seis-obsidian-bridge-safe-import-contract.json
- Current mode: planned-gated, explicit user-selected import only.
- Runtime boundary:
  - No private vault import.
  - No host vault read.
  - No automatic Obsidian plugin installation.
  - No private note body commits.
  - No .obsidian workspace or plugin state copy.
  - Human approval before any GitHub publication.
- Dry-run manifest contract:
  - metadata-only-by-default
  - source path fingerprint, candidate count, blocked file count, secret scan summary, provenance labels, publishability labels, redaction summary, attachment review summary, and human approval state are required before import.

### Runtime artifact summary

${SEIS_SECOND_BRAIN_SYSTEM.vaultNotes.map((note) => `- ${note.title} (${note.id}) → ${note.path}`).join("\n")}

## 2) Second Brain Accessibility / Focus QA

- Contract source: content/development/seis-second-brain-accessibility-focus-qa.json
- Required markers:
  - Markdown vault: listbox/option with aria-selected.
  - Knowledge graph: listbox/option with aria-controls.
  - Inspector: focusable with aria-live polite.
  - Focus-visible styling and no cramped controls on mobile.
- Runtime focus/roles in UI:
  - Note list selector: .second-brain-note-list[role="listbox"]
  - Note options selector: .second-brain-note-list [role="option"]
  - Graph list selector: .second-brain-graph[role="listbox"]
  - Graph nodes selector: .second-brain-node [role="option"]
  - Inspector selector: #second-brain-inspector-panel[data-second-brain-inspector]
  - Inspector focus target: [tabindex="0"] with aria-live="polite"
- Manual public-demo evidence still required:
  - WCAG 2.2 visible focus indicator
  - manual keyboard transcript
  - screen-reader transcript
  - mobile viewport target audit
  - human accessibility review approval

## 3) Provider-Neutral Read-Only Router

- Contract source: content/development/seis-read-only-model-router-contract.json
- Provider states:
  - Local Demo, Available, Missing Key, Disabled, Rate Limited, Error, Unknown
- Routing rules:
  - Missing Key is not Error.
  - Local-only mode never routes to cloud providers.
  - No silent fallback without explicit declaration.
  - Live execution stays blocked until backend-only mediation exists.
  - Decision integrity requires redacted review-only output, explicit provider state, explicit selected provider, explicit fallback policy, blocked reasons when ineligible, no prompt body, no credential material, and executionPerformed=false.
  - Provider states declared for this contract: ${[
  "Local Demo",
  "Available",
  "Missing Key",
  "Disabled",
  "Rate Limited",
  "Error",
  "Unknown"
].join(", ")}
  - Blocked model classes:
    - ${SEIS_READ_ONLY_MODEL_ROUTER_CONTRACT.blockedModelClasses.length
    ? SEIS_READ_ONLY_MODEL_ROUTER_CONTRACT.blockedModelClasses.map((entry) => `- ${entry}`).join("\n    - ")
    : "none defined"}

## 4) Public Demo PR #54 Checklist

- Contract source: content/development/seis-public-demo-release-checklist-pr54.json
- Current status: review-gated-not-released.
- Review packet: ${SEIS_SECOND_BRAIN_SYSTEM.releaseReviewPacketPath}
- Validation path:
  - Required command list:
    - npm run check:seis-second-brain-readiness-contracts
    - npm run check:seis-second-brain
    - npm run check:seis-second-brain-browser-smoke
    - npm run check:seis-ultimate-demo
    - npm run check:product-experience-browser-smoke
- Blocked without approval:
  - merge to main
  - GitHub Pages publication
  - Obsidian private vault import
  - live provider routing
  - SSH execution
  - deployment

## 5) Language Model Training Curriculum

- Contract source: ${SEIS_SECOND_BRAIN_SYSTEM.languageModelTrainingCurriculum.contractPath}
- Report artifact: ${SEIS_SECOND_BRAIN_SYSTEM.languageModelTrainingCurriculum.reportPath}
- Current status: ${SEIS_SECOND_BRAIN_SYSTEM.languageModelTrainingCurriculum.status}
- Boundary:
  - ${SEIS_SECOND_BRAIN_SYSTEM.languageModelTrainingCurriculum.boundary}
  - Candidate model families stay metadata-only unless a specific model, license, checksum, hardware budget, model card, dataset card, rollback plan, and explicit human approval exist.
  - Retrieval and local seed-model lanes can improve Second Brain planning evidence without claiming SEIS owns a trained foundation model.

## Installed AI Profiles

${installedRows.join("\n")}

## Managed Sub-Agent Lanes

${laneRows.join("\n")}

## Autonomous Agent Roster

${rosterRows.join("\n")}

## Current Boundaries

- ${SEIS_SECOND_BRAIN_SYSTEM.runtimeBoundary}
- Snapshot path: ${SEIS_SECOND_BRAIN_SYSTEM.snapshotPath}
- GitHub readiness path: ${SEIS_SECOND_BRAIN_SYSTEM.githubReadinessPath}
- Training pack path: ${SEIS_SECOND_BRAIN_SYSTEM.trainingPackPath}
- PR #54 review packet: ${SEIS_SECOND_BRAIN_SYSTEM.releaseReviewPacketPath}
- Language model training curriculum: ${SEIS_SECOND_BRAIN_SYSTEM.languageModelTrainingCurriculum.contractPath}
- Quality gate: ${SEIS_SECOND_BRAIN_SYSTEM.qualityGate}
`;
}

const SEIS_READ_ONLY_MODEL_ROUTER_CONTRACT = {
  blockedModelClasses: [
    "20B planned-not-validated",
    "70B research-roadmap",
    "150B frontier-program-plan-only",
    "300B+ not-scoped",
    "512B apex-program-plan-only",
    "highest-available-future not-scoped"
  ]
};

function saveSecondBrainSnapshot(mode = "snapshot", { quiet = false } = {}) {
  const data = getSecondBrainData();
  const timestamp = new Date().toISOString();
  for (const note of SEIS_SECOND_BRAIN_SYSTEM.vaultNotes) {
    upsertFile(note.path, buildSecondBrainNoteMarkdown(note, timestamp));
  }
  upsertFile(SEIS_SECOND_BRAIN_SYSTEM.snapshotPath, buildSecondBrainSnapshotMarkdown(timestamp, mode));
  data.lastSnapshot = {
    time: timestamp,
    mode,
    path: SEIS_SECOND_BRAIN_SYSTEM.snapshotPath,
    noteCount: SEIS_SECOND_BRAIN_SYSTEM.vaultNotes.length,
    graphLinks: getSecondBrainLinks().length,
    externalMutation: false
  };
  getListData("second-brain").unshift({
    id: `second-brain-snapshot-${Date.now()}`,
    title: "Second Brain snapshot saved",
    body: SEIS_SECOND_BRAIN_SYSTEM.snapshotPath,
    done: true
  });
  addSecondBrainActivity("Snapshot", "Local Demo", `Saved ${SEIS_SECOND_BRAIN_SYSTEM.vaultNotes.length} Markdown notes and snapshot artifact.`);
  if (!quiet) {
    const message = `SEIS Second Brain snapshot saved to ${SEIS_SECOND_BRAIN_SYSTEM.snapshotPath}.`;
    getAppStatus("second-brain").lastAction = message;
    log("second-brain", message);
    saveState();
    renderOpenWindows("second-brain");
    renderOpenWindows("files");
    renderOpenWindows("system-logs");
    toast("SEIS Second Brain", message);
  }
  return SEIS_SECOND_BRAIN_SYSTEM.snapshotPath;
}

function exportSecondBrainTrainingPack() {
  const timestamp = new Date().toISOString();
  const path = SEIS_SECOND_BRAIN_SYSTEM.trainingPackPath;
  upsertFile(path, buildSecondBrainTrainingPackMarkdown(timestamp));
  const data = addSecondBrainActivity("Training Pack", "Read-only", `Training Pack saved to ${path}.`);
  data.lastTrainingPack = {
    time: timestamp,
    path,
    contractsCovered: 4,
    installedAiProfiles: SEIS_INSTALLED_AI_SYSTEMS.length,
    managedSubAgentLanes: SUB_AGENT_DEMO.lanes.length,
    autonomousAgentRoster: SEIS_SECOND_BRAIN_SYSTEM.autonomousAgentRoster.length,
    artifactPath: path
  };
  const message = `Second Brain training pack saved to ${path}.`;
  getAppStatus("second-brain").lastAction = message;
  log("second-brain", message);
  saveState();
  renderOpenWindows("second-brain");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
  toast("SEIS Second Brain", message);
}

function selectSecondBrainNote(noteId) {
  if (!SEIS_SECOND_BRAIN_SYSTEM.vaultNotes.some((note) => note.id === noteId)) return;
  const data = getSecondBrainData();
  data.activeNoteId = noteId;
  saveState();
  renderOpenWindows("second-brain");
  focusSecondBrainInspector();
}

function focusSecondBrainInspector() {
  setTimeout(() => {
    const inspector = document.querySelector('.app-window[data-app-id="second-brain"]:not([hidden]) [data-second-brain-inspector]');
    inspector?.focus?.({ preventScroll: true });
  }, 0);
}

function captureSecondBrainNote() {
  const timestamp = new Date().toISOString();
  const path = `/home/seis/SecondBrain/00-inbox/capture-${Date.now()}.md`;
  upsertFile(path, `# SEIS Second Brain Capture

Generated: ${timestamp}
Mode: Local Demo

This capture is a browser-local note seed. It does not import a private Obsidian vault, call AI providers, push GitHub changes, execute SSH, or expose secrets.

## Next Review

- Link to an approved source note.
- Check provenance.
- Confirm no secrets.
- Decide whether this belongs in public docs.
`);
  const data = addSecondBrainActivity("Capture", "Local Demo", `Captured browser-local note at ${path}.`);
  data.lastCapture = { time: timestamp, path };
  const message = `Second Brain capture saved to ${path}.`;
  getAppStatus("second-brain").lastAction = message;
  log("second-brain", message);
  saveState();
  renderOpenWindows("second-brain");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
  toast("SEIS Second Brain", message);
}

function linkSecondBrainGraph() {
  const timestamp = new Date().toISOString();
  const path = "/home/seis/SecondBrain/graph-links.json";
  const payload = {
    generatedAt: timestamp,
    mode: "browser-local-link-map",
    nodes: SEIS_SECOND_BRAIN_SYSTEM.vaultNotes.map((note) => ({
      id: note.id,
      title: note.title,
      status: note.status,
      path: note.path,
      tags: note.tags
    })),
    links: getSecondBrainLinks().map(([source, target]) => ({ source, target })),
    boundary: SEIS_SECOND_BRAIN_SYSTEM.runtimeBoundary
  };
  upsertFile(path, JSON.stringify(payload, null, 2));
  const data = addSecondBrainActivity("Link", "Local Demo", `Graph link map saved to ${path}.`);
  data.lastGraph = { time: timestamp, path, links: payload.links.length };
  const message = `Second Brain graph links saved to ${path}.`;
  getAppStatus("second-brain").lastAction = message;
  log("second-brain", message);
  saveState();
  renderOpenWindows("second-brain");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
  toast("SEIS Second Brain", message);
}

function reviewSecondBrainVault() {
  const timestamp = new Date().toISOString();
  const path = "/home/seis/SecondBrain/second-brain-review-gate.md";
  upsertFile(path, `# SEIS Second Brain Review Gate

Generated: ${timestamp}
Status: human-review-required

## Required Checks

${SEIS_SECOND_BRAIN_SYSTEM.githubGates.map((gate) => `- ${gate}`).join("\n")}

## Current Result

- Local Markdown vault: ready for browser demo review.
- Obsidian bridge: planned, not connected.
- GitHub publication: blocked until human review.
- Secrets: no credential values should be stored in this vault.

## Boundary

${SEIS_SECOND_BRAIN_SYSTEM.runtimeBoundary}
`);
  const data = addSecondBrainActivity("Review", "Human review required", `Review gate saved to ${path}.`);
  data.lastReview = { time: timestamp, path, githubReady: false };
  const message = `Second Brain review gate saved to ${path}.`;
  getAppStatus("second-brain").lastAction = message;
  log("second-brain", message);
  saveState();
  renderOpenWindows("second-brain");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
  toast("SEIS Second Brain", message);
}

function exportSecondBrainGithubReadiness() {
  const timestamp = new Date().toISOString();
  upsertFile(SEIS_SECOND_BRAIN_SYSTEM.githubReadinessPath, `# SEIS Second Brain GitHub Readiness

Generated: ${timestamp}
Decision: Not ready for automatic publication

## Public Use Gates

${SEIS_SECOND_BRAIN_SYSTEM.githubGates.map((gate) => `- ${gate}`).join("\n")}

## What Is Real Now

- Browser-local Markdown vault export.
- Knowledge graph and backlink display from repo-owned seed notes.
- Installed AI profile index for ${SEIS_INSTALLED_AI_SYSTEMS.length} current systems as Local Demo/Missing Key/Disabled evidence.
- Managed sub-agent lane index for ${SUB_AGENT_DEMO.lanes.length} current lanes as status/plan-only evidence.
- Autonomous agent roster for ${SEIS_SECOND_BRAIN_SYSTEM.autonomousAgentRoster.length} Second Brain duties as review-gated planning evidence.
- Validator-backed product contract: ${SEIS_SECOND_BRAIN_SYSTEM.qualityGate}

## What Is Planned Or Disabled

- Obsidian plugin sync.
- Private vault import.
- GitHub push, merge, release, Pages publication, or public community launch.
- Live provider routing or autonomous write runtime.

## Boundary

${SEIS_SECOND_BRAIN_SYSTEM.runtimeBoundary}
`);
  const data = addSecondBrainActivity("GitHub Gate", "Human review before GitHub", `GitHub readiness export saved to ${SEIS_SECOND_BRAIN_SYSTEM.githubReadinessPath}.`);
  data.lastGithubReadiness = { time: timestamp, path: SEIS_SECOND_BRAIN_SYSTEM.githubReadinessPath, ready: false };
  const message = `Second Brain GitHub readiness export saved to ${SEIS_SECOND_BRAIN_SYSTEM.githubReadinessPath}.`;
  getAppStatus("second-brain").lastAction = message;
  log("second-brain", message);
  saveState();
  renderOpenWindows("second-brain");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
  toast("SEIS Second Brain", message);
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

function exportModelScalingPreflight() {
  const timestamp = new Date().toISOString();
  const path = SEIS_MODEL_SCALING_UI_PROFILE.preflightReport;
  const data = getAppData("seis-command-center");
  data.lastModelScalingPreflight = {
    time: timestamp,
    path,
    status: SEIS_MODEL_SCALING_UI_PROFILE.preflightStatus,
    compatibilityClaim: SEIS_MODEL_SCALING_UI_PROFILE.compatibilityClaim,
    routeEligibleToday: false,
    measuredBenchmark: false
  };
  upsertFile(path, build20BLocalPreflightMarkdown(timestamp));
  getListData("seis-command-center").unshift({
    id: `model-preflight-${Date.now()}`,
    title: "20B local preflight exported",
    body: path,
    done: true
  });
  log("seis-command-center", `20B local preflight exported to ${path}.`);
  saveState();
  toast("20B Preflight Exported", path);
  renderOpenWindows("seis-command-center");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
}

function buildV17CommandCenterSnapshotMarkdown(timestamp) {
  const coverage = getV17CommandCenterCoverage();
  return `# SEIS V17 Command Center Snapshot

Generated: ${timestamp}

## Demo Coverage
- Modules: ${coverage.moduleCount}
- Working: ${coverage.workingCount}
- Local Demo: ${coverage.localDemoCount}
- Mock Safe: ${coverage.mockSafeCount}
- Planned/Gated: ${coverage.plannedGatedCount}
- App launch actions: ${coverage.appLinks}
- Route launch actions: ${coverage.routeLinks}
- Target interactivity: ${coverage.interactionTarget}

## GitHub Merge Gates
- Current state: ${coverage.githubMergeGates.currentState}
- Required approvals: ${coverage.githubMergeGates.requiredApprovals}
- Preferred merge method: ${coverage.githubMergeGates.preferredMergeMethod}
- Auto-merge is bypass: ${coverage.githubMergeGates.autoMergeIsBypass ? "yes" : "no"}
- Admin bypass allowed for Codex: ${coverage.githubMergeGates.adminBypassAllowedForCodex ? "yes" : "no"}
- Browser live GitHub mutation: ${coverage.githubMergeGates.liveGitHubMutationFromBrowser ? "yes" : "no"}
- Required rules: ${coverage.githubMergeGates.requiredRules.join("; ")}
- Observed PR gates: ${coverage.githubMergeGates.observedPrs.map(([pr, scope, checks, gate]) => `${pr} / ${scope} / ${checks} / ${gate}`).join("; ")}
- Safe actions: ${coverage.githubMergeGates.safeActions.join("; ")}
- Forbidden actions: ${coverage.githubMergeGates.forbiddenActions.join("; ")}

## Model Scaling Boundary
- 16GB+ RAM floor: ${coverage.modelScalingFloor}
- Future scale: ${coverage.modelScalingFuture}
- 150B frontier target: ${coverage.modelScalingProfile.frontierTarget} / ${coverage.modelScalingProfile.frontierStatus}
- 512B apex AGI target: ${coverage.modelScalingProfile.apexTarget} / ${coverage.modelScalingProfile.apexStatus}
- Memory budget status: ${coverage.modelScalingProfile.memoryBudgetStatus}
- Compatibility claim: ${coverage.modelScalingProfile.compatibilityClaim}
- Benchmark dry-run report: ${coverage.modelScalingPreflight.benchmarkDryRunReport} / ${coverage.modelScalingPreflight.benchmarkDryRunStatus}
- Frontier escalation policy: ${coverage.modelFrontierEscalationPolicy.path} / ${coverage.modelFrontierEscalationPolicy.status}
- Frontier escalation resource: ${coverage.modelFrontierEscalationPolicy.resource}
- Frontier escalation quality gate: ${coverage.modelFrontierEscalationPolicy.qualityGate}
- Frontier escalation rule: ${coverage.modelFrontierEscalationPolicy.rule}
- 150B frontier model program: ${coverage.frontierModelProgram.path} / ${coverage.frontierModelProgram.status}
- 150B frontier model program resource: ${coverage.frontierModelProgram.resource}
- 150B frontier model program quality gate: ${coverage.frontierModelProgram.qualityGate}
- 150B frontier model program stages: ${coverage.frontierModelProgram.stages.map(([stage, status, route]) => `${stage} / ${status} / ${route}`).join("; ")}
- 512B apex AGI program: ${coverage.apexModelProgram.path} / ${coverage.apexModelProgram.status}
- 512B apex AGI program resource: ${coverage.apexModelProgram.resource}
- 512B apex AGI program quality gate: ${coverage.apexModelProgram.qualityGate}
- 512B apex AGI capability status: ${coverage.apexModelProgram.agiCapabilityStatus}
- 512B apex AGI program stages: ${coverage.apexModelProgram.stages.map(([stage, status, route]) => `${stage} / ${status} / ${route}`).join("; ")}
- Model scaling sub-agent council: ${coverage.modelScalingSubagentCouncil.path} / ${coverage.modelScalingSubagentCouncil.status}
- Model scaling sub-agent council quality gate: ${coverage.modelScalingSubagentCouncil.qualityGate}
- Model scaling sub-agent council agents: ${coverage.modelScalingSubagentCouncil.agentCount} total / ${coverage.modelScalingSubagentCouncil.planOnlyAgentCount} plan-only
- Model scaling sub-agent council assignments: ${coverage.modelScalingSubagentCouncil.assignments.map(([stage, agents, status, routeState]) => `${stage} / ${agents} / ${status} / ${routeState}`).join("; ")}
- Parameter ladder: ${coverage.modelScalingProfile.parameterLadderPath} / ${coverage.modelScalingProfile.parameterLadderStatus}
- Parameter ladder resource: ${coverage.modelScalingProfile.parameterLadderResource}
- Parameter ladder targets: ${coverage.modelScalingProfile.parameterLadderTargets.map(([target, hardware, status, allowed]) => `${target} / ${hardware} / ${status} / ${allowed}`).join("; ")}
- Model card template: ${coverage.modelScalingProfile.modelCardTemplate} / ${coverage.modelScalingProfile.evidenceTemplateStatus}
- Dataset card template: ${coverage.modelScalingProfile.datasetCardTemplate} / ${coverage.modelScalingProfile.evidenceTemplateStatus}
- Quantization lanes: ${coverage.modelScalingProfile.quantizationProfiles.map(([lane, status, route]) => `${lane} / ${status} / ${route}`).join("; ")}
- Local runtime candidates: ${coverage.modelScalingProfile.localRuntimeCandidates.map(([runtime, status, boundary]) => `${runtime} / ${status} / ${boundary}`).join("; ")}
- Required measurements: ${coverage.modelScalingProfile.requiredMeasurements.join(", ")}
- Required 150B evidence: ${coverage.modelScalingProfile.frontierRequiredEvidence.join(", ")}
- Local preflight report: ${coverage.modelScalingPreflight.reportPath} / ${coverage.modelScalingPreflight.status}
- Preflight measured benchmark: ${coverage.modelScalingPreflight.measuredBenchmark ? "yes" : "no"}
- Preflight route eligible today: ${coverage.modelScalingPreflight.routeEligibleToday ? "yes" : "no"}
- Host RAM preflight command: ${coverage.modelScalingPreflight.hostPreflightCommand}
- Host RAM preflight output: ${coverage.modelScalingPreflight.hostPreflightOutput}
- Training/inference ownership claim: none
- AGI claim: none; 512B AGI capability is not demonstrated
- Provider keys required for core demo: ${coverage.providerKeysRequiredForCoreDemo}

## Master Objective Coverage
- Coverage source: ${coverage.masterObjectiveCoverage.source}
- Coverage report: ${coverage.masterObjectiveCoverage.report}
- Coverage items: ${coverage.masterObjectiveCoverage.itemCount}
- Active AI boundary: ${coverage.masterObjectiveCoverage.activeCoverage} / ${coverage.masterObjectiveCoverage.activeCoverageStatus}
- Active requirement: ${coverage.masterObjectiveCoverage.activeRequirement}
- Evidence: ${coverage.masterObjectiveCoverage.evidence.join("; ")}
- Checks: ${coverage.masterObjectiveCoverage.checks.join("; ")}
- 150B blocked until: ${coverage.masterObjectiveCoverage.blockedUntil.join(", ")}

## Master Objective Coverage Matrix
${coverage.masterObjectiveCoverage.items.map((item) => `- ${item.id}: ${item.status} / ${item.check} / ${item.gap}`).join("\n")}

## Module Map
${coverage.modules.map((module) => `- ${module.label}: ${module.status} / ${module.evidence} / ${module.detail}`).join("\n")}

## Validation Queue
${SEIS_V17_COMMAND_CENTER_VALIDATION_QUEUE.map(([gate, command, scope]) => `- ${gate}: ${command} / ${scope}`).join("\n")}

## Safety
- Live SSH execution: ${coverage.liveSshExecution ? "enabled" : "disabled"}
- Live deployment: ${coverage.liveDeployment ? "enabled" : "disabled"}
- Browser secret storage: disabled
- External mutation: disabled unless explicitly approved
- Dirty worktree status must be reported separately from validator status.
`;
}

function build20BLocalPreflightMarkdown(timestamp) {
  const coverage = getV17CommandCenterCoverage();
  const profile = coverage.modelScalingProfile;
  const preflight = coverage.modelScalingPreflight;
  return `# SEIS 20B Local Preflight

Generated: ${timestamp}

## Result
- Status: ${preflight.status}
- Target: ${profile.currentTarget}
- RAM class: ${profile.ramClass}
- Compatibility claim: ${preflight.compatibilityClaim}
- Route eligible today: ${preflight.routeEligibleToday ? "yes" : "no"}
- Measured benchmark: ${preflight.measuredBenchmark ? "yes" : "no"}
- Benchmark manifest: ${preflight.benchmarkManifest}
- Benchmark dry-run report: ${preflight.benchmarkDryRunReport}
- Benchmark dry-run status: ${preflight.benchmarkDryRunStatus}
- Model card template: ${preflight.modelCardTemplate}
- Dataset card template: ${preflight.datasetCardTemplate}
- Evidence template status: ${preflight.evidenceTemplateStatus}
- Optional host RAM command: ${preflight.hostPreflightCommand}
- Optional host RAM output: ${preflight.hostPreflightOutput}
- Frontier escalation policy: ${coverage.modelFrontierEscalationPolicy.path}
- Frontier escalation resource: ${coverage.modelFrontierEscalationPolicy.resource}
- Frontier escalation status: ${coverage.modelFrontierEscalationPolicy.status}
- Frontier escalation quality gate: ${coverage.modelFrontierEscalationPolicy.qualityGate}
- Frontier escalation rule: ${coverage.modelFrontierEscalationPolicy.rule}
- 150B frontier model program: ${coverage.frontierModelProgram.path}
- 150B frontier model program resource: ${coverage.frontierModelProgram.resource}
- 150B frontier model program status: ${coverage.frontierModelProgram.status}
- 150B frontier model program quality gate: ${coverage.frontierModelProgram.qualityGate}
- 150B frontier model program stages: ${coverage.frontierModelProgram.stages.map(([stage, status, route]) => `${stage} / ${status} / ${route}`).join("; ")}
- Model scaling sub-agent council: ${coverage.modelScalingSubagentCouncil.path}
- Model scaling sub-agent council status: ${coverage.modelScalingSubagentCouncil.status}
- Model scaling sub-agent council quality gate: ${coverage.modelScalingSubagentCouncil.qualityGate}
- Model scaling sub-agent council agents: ${coverage.modelScalingSubagentCouncil.agentCount} total / ${coverage.modelScalingSubagentCouncil.planOnlyAgentCount} plan-only
- Parameter ladder: ${profile.parameterLadderPath}
- Parameter ladder resource: ${profile.parameterLadderResource}
- Parameter ladder status: ${profile.parameterLadderStatus}
- Parameter ladder quality gate: ${profile.parameterLadderQualityGate}
- Parameter ladder targets: ${profile.parameterLadderTargets.map(([target, hardware, status, allowed]) => `${target} / ${hardware} / ${status} / ${allowed}`).join("; ")}

## Truth Boundary
This is a browser-local dry-run checklist. It does not download a model, run inference, train weights, call a provider, execute SSH, deploy infrastructure, measure RAM, or prove 16GB+ compatibility.

The optional host RAM command only observes the local machine RAM class and writes ignored QA evidence. It is not a model benchmark and does not change route eligibility.

## Required 20B Evidence Before Route Eligibility
${preflight.benchmarkGates.map((gate) => `- ${gate}`).join("\n")}

## Required Measurements Before Compatibility Claim
${preflight.requiredMeasurements.map((item) => `- ${item}`).join("\n")}

## Future Frontier Boundary
- 70B remains a research roadmap lane.
- 150B remains a frontier research lane.
- 300B+ remains an exploration boundary, not a scoped runtime.
- Highest available future remains undefined until 20B, 70B, and 150B evidence exists.
- No-skip-20B policy remains active.
- 150B cannot be scoped until 20B and 70B evidence, clean-room training plan, distributed runtime budget, privacy review, safety evaluation, observability, rollback, and explicit human approval exist.

## Non-Claims
- SEIS has not trained a 20B foundation model.
- SEIS has not run 20B inference.
- SEIS has not benchmarked 20B memory usage.
- SEIS has not verified 16GB+ compatibility.
- SEIS has not authorized 70B or 150B runtime scope.
`;
}

function defaultGenericText(app) {
  if (app.type === "markdown") return "# Draft\n\n- Write\n- Preview\n- Export\n";
  if (app.type === "mail") return "To: draft@example.local\nSubject: Local draft\n\nThis app saves drafts locally and does not send mail.";
  if (app.type === "weather") return `Local weather: ${getAppData("weather").temperature} C, ${getAppData("weather").condition}`;
  if (app.type === "launchpad") return `SEIS Launchpad\n\nApps: ${APPS.length}\nFeatured: SEIS Code, Code IDE, SEIS Design, SEIS Cloud, Music, Store.\n`;
  if (app.type === "seis-command-center") return buildV17CommandCenterSnapshotMarkdown(new Date().toISOString());
  if (app.type === "demo-studio") return buildDemoStudioEvidenceMarkdown(new Date().toISOString(), getDemoJourney(getDemoStudioData().activeJourneyId));
  if (app.type === "second-brain") return buildSecondBrainSnapshotMarkdown(new Date().toISOString(), "default-export");
  if (app.type === "store") return `SEIS Store\n\nLocal catalog only. No dependency installation, payment flow, external store access, or provider key is required.\n`;
  if (app.type === "music") return `SEIS Music\n\n${SEIS_MUSIC_TRACKS.map((track) => `- ${track.title} / ${track.artist} / ${track.mood}`).join("\n")}\n`;
  if (app.type === "code-ide") return `SEIS Code IDE\n\nDedicated cockpit for SEIS Code, terminal commands, extensions, VFS files, and the standalone SEIS Code Web route.\n`;
  if (app.type === "seis-website") return `SEIS Website\n\n${SEIS_WEBSITE_PAGE_ROUTES.map((route) => `- ${route.label}: ${route.path}`).join("\n")}\n`;
  if (app.type === "subagent-control") return buildSubAgentDryRunMarkdown(new Date().toISOString());
  if (app.type === "seis-design") return buildSeisDesignHandoffMarkdown(new Date().toISOString());
  if (app.type === "seis-cloud") return buildSeisCloudPreflightMarkdown(new Date().toISOString());
  if (app.type === "nvidia-catalog") return buildNvidiaCatalogMarkdown(new Date().toISOString());
  if (app.type === "seis-evolution") return buildSeisEvolutionSnapshotMarkdown(new Date().toISOString());
  return `${app.name}\n\n${app.description}\n\nUse New, Save, and Export to update persistent local state.`;
}

function buildNvidiaCatalogMarkdown(timestamp) {
  const catalog = NVIDIA_ACCELERATOR_CATALOG;
  return `# NVIDIA Accelerator Catalog Dry-Run

Generated: ${timestamp}
Mode: ${catalog.mode}
Status: ${catalog.status}
Source contract: ${catalog.sourcePath}
Documentation: ${catalog.docPath}
Installed integrations registry: ${catalog.installedIntegrationsRegistry}
Quality gate: ${catalog.qualityGate}
Installed integrations gate: ${catalog.installedIntegrationsGate}
Plan command: ${catalog.planCommand}

## Sources
- GitHub org: ${catalog.githubOrg}
- Build skills: ${catalog.buildSkills}
- Build models: ${catalog.buildModels}
- Public repos observed: ${catalog.githubPublicRepoCount}

## Dry-Run Queue
${catalog.queue.map(([title, status, next]) => `- ${title}: ${status} / ${next}`).join("\n")}

## NVIDIA Installed Integrations
${catalog.installedSkillIntegrations.map(([id, name, category, status, safeUse]) => `- ${name} (${id}): ${category} / ${status} / ${safeUse}`).join("\n")}

## Sample Repos
${catalog.sampleRepos.map(([name, language, license, state]) => `- ${name}: ${language} / ${license} / ${state}`).join("\n")}

## Blocked Actions
${catalog.blockedActions.map((item) => `- ${item}`).join("\n")}

## Build Filters
- Skill domains: ${catalog.domains.join(", ")}
- Audiences: ${catalog.audiences.join(", ")}
- Publishers: ${catalog.publishers.join(", ")}
- GPU filters: ${catalog.gpuTypes.join(", ")}

## Boundary
This artifact is browser-local Local Demo evidence. It does not clone NVIDIA repos, download models, call NIM APIs, install dependencies, pull Docker images, provision GPUs, execute SSH, mutate GitHub, or store NVIDIA credentials.
`;
}

function buildSeisDesignHandoffMarkdown(timestamp) {
  const websiteRoutes = DEMO_ROUTES.filter((route) => route.kind === "Website" || ["seis-code-web", "mythic-gacha-web", "video-hero-web"].includes(route.id));
  const creativeTools = LOCAL_ECOSYSTEM_INVENTORY.apps.filter(([, lane]) => ["Document Ops", "Creative Ops", "SEIS Design", "SEIS UX", "SEIS Docs", "SEIS Media"].includes(lane));
  const creativeWorkspaces = LOCAL_ECOSYSTEM_INVENTORY.workspaces.filter(([, type]) => ["Design staging", "Website archive", "UI/archive area"].includes(type));
  return `# SEIS Design Demo Handoff

Generated: ${timestamp}

Mode: Local Demo
Provider keys required: no

## Visible Surfaces
${websiteRoutes.map((route) => `- ${route.label}: ${route.path}`).join("\n")}

## Local Creative Tool Map
${creativeTools.map(([tool, role, use, status]) => `- ${tool}: ${role} / ${use} / ${status}`).join("\n")}

## Design Folder Inputs
${creativeWorkspaces.map(([folder, type, use, status]) => `- ${folder}: ${type} / ${use} / ${status}`).join("\n")}

## Product Boundary
- SEIS Code is the VS Code-style browser workspace.
- Mythic Gacha and Bestiary are playable local routes.
- Video Hero pages are immersive website showcases.
- Runtime card/game/showcase use does not require live image-generation keys.
- Local application bundles, private files, unclear archives, and licensed assets are not copied into the demo.
`;
}

function buildSeisCloudPreflightMarkdown(timestamp) {
  const runtimeTools = LOCAL_ECOSYSTEM_INVENTORY.apps.filter(([, lane]) => ["Runtime", "Local AI", "Local/Secondary AI", "Agent IDE", "Implementation", "Apple Native", "Development"].includes(lane));
  return `# SEIS Cloud Local Preflight

Generated: ${timestamp}

Mode: browser-local static demo
SSH execution: disabled
Deployment: not performed
Secrets stored in browser: no
Public SSH alias: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.alias}
Public SSH contract: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.contract}
Public SSH runbook: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.runbook}
Public SSH quality gate: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.qualityGate}
Public SSH report command: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.reportCommand}
Public SSH onboarding command: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.onboardingCommand}
Public SSH onboarding artifact: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.onboardingArtifact}
Public SSH contributor doctor command: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.contributorDoctorCommand}
Public SSH contributor doctor artifact: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.contributorDoctorArtifact}
Public SSH live evidence command: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.liveEvidenceCommand}
Public SSH live evidence artifact: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.liveEvidenceArtifact}
Server/port invariant: ${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.invariant}

## Boundary
- This demo can be copied as static files and run from a local server.
- SSH, deployment, cloud credentials, GitHub mutation, and server changes require explicit approval.
- Missing provider keys do not block the core desktop, code, design, cloud, video, or gacha surfaces.
- SEIS-SSH public onboarding preserves the existing HostName and Port unless the human owner approves endpoint migration.
- The public onboarding pack is not a shared credential path; contributors use authorized GitHub/Codespaces or approved cloud workspaces.
- The contributor doctor is read-only and does not contact GitHub, open SSH, or write SSH config.
- Latest live probe is blocked by GitHub Codespaces billing; do not claim online/mobile readiness until strict checks pass.

## Public GitHub SSH States
${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.states.map(([stateLabel, meaning]) => `- ${stateLabel}: ${meaning}`).join("\n")}

## Approval Gates
${SEIS_SSH_PUBLIC_ACCESS_CONTRACT.approvalGates.map((gate) => `- ${gate}`).join("\n")}

## Local Runtime Tool Map
${runtimeTools.map(([tool, role, use, status]) => `- ${tool}: ${role} / ${use} / ${status}`).join("\n")}
`;
}

function buildSeisEvolutionSnapshotMarkdown(timestamp) {
  const routes = DEMO_ROUTES.filter((route) => [
    "seis-ai-app",
    "seis-code-app",
    "seis-design-app",
    "seis-cloud-app",
    "seis-evolution-app",
    "seis-code-web",
    "mythic-gacha-web",
    "video-hero-web"
  ].includes(route.id));
  return `# SEIS Evolution Demo Snapshot

Generated: ${timestamp}

Mode: browser-local runnable demo
OS profile: ${state.osProfile || "linux"}
Project root label: ${SEIS_EVOLUTION_REFERENCE.projectRootLabel}
Active project: ${SEIS_EVOLUTION_REFERENCE.activeProject}
SSH label: ${SEIS_EVOLUTION_REFERENCE.sshStatus}
SSH execution: disabled
Cloud/provider keys required for core demo: no

## Pinned Work
${SEIS_EVOLUTION_REFERENCE.pinned.map(([title, time, note]) => `- ${title} (${time}): ${note}`).join("\n")}

## Integrated Surfaces
${SEIS_EVOLUTION_REFERENCE.integrationRows.map(([stream, surface, status]) => `- ${stream}: ${surface} / ${status}`).join("\n")}

## Local Tool Inventory
${LOCAL_ECOSYSTEM_INVENTORY.apps.map(([tool, role, use, status]) => `- ${tool}: ${role} / ${use} / ${status}`).join("\n")}

## Local Folder Inputs
${LOCAL_ECOSYSTEM_INVENTORY.workspaces.map(([folder, type, use, status]) => `- ${folder}: ${type} / ${use} / ${status}`).join("\n")}

## Search Routes
${routes.map((route) => `- ${route.label}: ${route.path}`).join("\n")}

## Safety Boundary
- This snapshot represents the requested five-year, SSH, folder, SEIS AI, SEIS Code, SEIS Design, SEIS Cloud, and website demo scope as a local product surface.
- It does not execute SSH, mutate GitHub, deploy, connect to cloud providers, store private keys, or claim real elapsed five-year execution.
- Local apps and folders are classified into SEIS roles; proprietary app bundles, unclear archives, and private content remain reference-only or quarantined.
`;
}

function buildSubAgentDryRunMarkdown(timestamp) {
  return `# SEIS Sub-Agent Control Dry Run

Generated: ${timestamp}

Mode: ${SUB_AGENT_DEMO.runtime}
Status: ${SUB_AGENT_DEMO.status}
Surface: ${SUB_AGENT_DEMO.osSurface}
OS profile: ${state.osProfile || "linux"}

This artifact is a browser-local demo handoff. It does not run background agents, call cloud AI providers, execute SSH commands, mutate GitHub, deploy, or alter repository files.

## Lanes
${SUB_AGENT_DEMO.lanes.map(([name, lane, planId, scope]) => `- ${name}: ${lane} / ${planId} / ${scope}`).join("\n")}

## Five-Year Phases
${SUB_AGENT_DEMO.years.map(([year, title, scope]) => `- ${year}: ${title} / ${scope}`).join("\n")}

## Safety Gates
${SUB_AGENT_DEMO.gates.map((gate) => `- ${gate}`).join("\n")}
`;
}

function getSubAgentQuarters() {
  const laneCycle = SUB_AGENT_DEMO.lanes;
  return SUB_AGENT_DEMO.years.flatMap(([year, title, scope], yearIndex) => [1, 2, 3, 4].map((quarter, quarterIndex) => {
    const lane = laneCycle[(yearIndex + quarterIndex) % laneCycle.length];
    return {
      id: `Y${yearIndex + 1}Q${quarter}`,
      label: `${year} Q${quarter}`,
      year,
      title,
      scope,
      laneName: lane[0],
      laneId: lane[1],
      planTool: lane[2],
      focus: quarterIndex === 0 ? "plan" : quarterIndex === 1 ? "build" : quarterIndex === 2 ? "validate" : "review"
    };
  }));
}

function getSubAgentSimulationState() {
  const data = getAppData("sub-agent-control");
  if (!data.simulation) {
    data.simulation = {
      completedQuarters: 0,
      startedAt: null,
      updatedAt: null,
      lastMode: "not-started",
      externalMutation: false,
      fileMutation: "browser-vfs-only",
      osProfile: state.osProfile || "linux"
    };
  }
  return data.simulation;
}

function getAiCoreVersionTarget(versionId) {
  return AI_CORE_VERSION_TARGETS.find((target) => target.id === versionId);
}

function getAiCoreVersionForQuarters(completedQuarters) {
  const perTarget = getSubAgentQuarters().length / AI_CORE_VERSION_TARGETS.length;
  const index = clamp(Math.floor(Math.max(Number(completedQuarters || 0) - 1, 0) / perTarget), 0, AI_CORE_VERSION_TARGETS.length - 1);
  return AI_CORE_VERSION_TARGETS[index];
}

function getAiCoreOrbitState(completedQuarters = 0) {
  const data = getAppData("sub-agent-control");
  if (!data.aiCoreOrbit || typeof data.aiCoreOrbit !== "object") {
    data.aiCoreOrbit = {
      activeVersionId: getAiCoreVersionForQuarters(completedQuarters).id,
      rotationDeg: 0,
      lastUpdated: null,
      lastMode: "not-started",
      lastSnapshotPath: null
    };
  }
  if (!getAiCoreVersionTarget(data.aiCoreOrbit.activeVersionId)) {
    data.aiCoreOrbit.activeVersionId = getAiCoreVersionForQuarters(completedQuarters).id;
  }
  data.aiCoreOrbit.rotationDeg = Number(data.aiCoreOrbit.rotationDeg || 0);
  return data.aiCoreOrbit;
}

function syncAiCoreOrbitToSimulation(completedQuarters, timestamp, mode) {
  const orbit = getAiCoreOrbitState(completedQuarters);
  orbit.activeVersionId = getAiCoreVersionForQuarters(completedQuarters).id;
  orbit.lastUpdated = timestamp;
  orbit.lastMode = mode;
  return orbit;
}

function getSubAgentProcessState() {
  const data = getAppData("sub-agent-control");
  if (!data.processState || typeof data.processState !== "object") {
    data.processState = {
      pulseCount: 0,
      lastPulse: null,
      pausedLaneIds: []
    };
  }
  if (!Array.isArray(data.processState.pausedLaneIds)) data.processState.pausedLaneIds = [];
  return data.processState;
}

function getSubAgentProcesses() {
  const quarters = getSubAgentQuarters();
  const simulation = getSubAgentSimulationState();
  const processState = getSubAgentProcessState();
  const completedQuarters = clamp(Number(simulation.completedQuarters || 0), 0, quarters.length);
  const activeQuarter = quarters[Math.min(completedQuarters, quarters.length - 1)];
  const completed = quarters.slice(0, completedQuarters);
  return SUB_AGENT_DEMO.lanes.map(([name, laneId, planId, scope], index) => {
    const paused = processState.pausedLaneIds.includes(laneId);
    const completedForLane = completed.filter((quarter) => quarter.laneId === laneId).length;
    const activeQuarterForLane = activeQuarter?.laneId === laneId && completedQuarters < quarters.length;
    const permission = ["governance", "security"].includes(laneId) ? "review-only" : "scoped-worker";
    const status = paused
      ? "Suspended"
      : completedQuarters === quarters.length
        ? "Review complete"
        : activeQuarterForLane
          ? "Active"
          : completedForLane > 0
            ? "Ready"
            : "Idle";
    return {
      pid: 5100 + index,
      name,
      laneId,
      planId,
      scope,
      status,
      permission,
      activeQuarter: activeQuarterForLane,
      completedQuarters: completedForLane,
      cpu: paused ? 0 : clamp(7 + index * 6 + completedForLane * 5 + (activeQuarterForLane ? 22 : 0) + (processState.pulseCount % 5), 2, 88),
      memory: `${64 + index * 16 + completedForLane * 4} MB`
    };
  });
}

function selectAiCoreVersion(versionId) {
  const target = getAiCoreVersionTarget(versionId);
  if (!target) return;
  const orbit = getAiCoreOrbitState(getSubAgentSimulationState().completedQuarters || 0);
  orbit.activeVersionId = target.id;
  orbit.lastUpdated = new Date().toISOString();
  orbit.lastMode = "manual-version-select";
  const message = `AI Core preview target selected: ${target.label} ${target.title}.`;
  getAppStatus("sub-agent-control").lastAction = message;
  log("ai-core-orbit", `${message} Local Demo only.`);
  saveState();
  renderOpenWindows("sub-agent-control");
  renderOpenWindows("system-logs");
  toast("AI Core Orbit", message);
}

function rotateAiCoreOrbit() {
  const data = getAppData("sub-agent-control");
  const simulation = getSubAgentSimulationState();
  const orbit = getAiCoreOrbitState(simulation.completedQuarters || 0);
  const timestamp = new Date().toISOString();
  orbit.rotationDeg = (Number(orbit.rotationDeg || 0) + 72) % 360;
  orbit.lastUpdated = timestamp;
  orbit.lastMode = "rotate-spatial-command-surface";
  const activeVersion = getAiCoreVersionTarget(orbit.activeVersionId) || getAiCoreVersionForQuarters(simulation.completedQuarters || 0);
  const path = "/home/seis/Documents/seis-ai-core-orbit-snapshot.md";
  orbit.lastSnapshotPath = path;
  data.lastAiCoreOrbit = {
    time: timestamp,
    mode: orbit.lastMode,
    activeVersionId: activeVersion.id,
    rotationDeg: orbit.rotationDeg,
    path
  };
  upsertFile(path, buildAiCoreOrbitSnapshotMarkdown(timestamp, activeVersion, orbit, getSubAgentProcesses(), simulation));
  getListData("sub-agent-control").unshift({
    id: `ai-core-orbit-${Date.now()}`,
    title: "AI Core orbit snapshot",
    body: `${activeVersion.label} ${activeVersion.title} snapshot saved to ${path}`,
    done: true
  });
  const message = `AI Core orbit rotated to ${orbit.rotationDeg}deg for ${activeVersion.label}.`;
  getAppStatus("sub-agent-control").lastAction = message;
  log("ai-core-orbit", `${message} ${path}`);
  saveState();
  renderOpenWindows("sub-agent-control");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
  toast("AI Core Orbit", message);
}

function promoteAiCoreVersion() {
  const simulation = getSubAgentSimulationState();
  const orbit = getAiCoreOrbitState(simulation.completedQuarters || 0);
  const currentIndex = AI_CORE_VERSION_TARGETS.findIndex((target) => target.id === orbit.activeVersionId);
  const nextTarget = AI_CORE_VERSION_TARGETS[clamp(currentIndex + 1, 0, AI_CORE_VERSION_TARGETS.length - 1)];
  orbit.activeVersionId = nextTarget.id;
  orbit.lastUpdated = new Date().toISOString();
  orbit.lastMode = "promotion-preview";
  const message = `AI Core promotion preview target: ${nextTarget.label} ${nextTarget.title}.`;
  getAppStatus("sub-agent-control").lastAction = message;
  log("ai-core-orbit", `${message} Preview only; no release or model promotion occurred.`);
  saveState();
  renderOpenWindows("sub-agent-control");
  renderOpenWindows("system-logs");
  toast("AI Core Preview", message);
}

function advanceSubAgentQuarter() {
  const quarters = getSubAgentQuarters();
  const simulation = getSubAgentSimulationState();
  const completed = clamp(Number(simulation.completedQuarters || 0) + 1, 0, quarters.length);
  updateSubAgentSimulation(completed, "advance-quarter");
}

function runSubAgentSimulation() {
  updateSubAgentSimulation(getSubAgentQuarters().length, "run-five-year-simulation");
}

function resetSubAgentSimulation() {
  if (!confirm("Reset the browser-local Sub-Agent Control simulation state?")) return;
  updateSubAgentSimulation(0, "reset-simulation");
}

function runNextSubAgentCycle() {
  const quarters = getSubAgentQuarters();
  const data = getAppData("sub-agent-control");
  const simulation = getSubAgentSimulationState();
  const processState = getSubAgentProcessState();
  const timestamp = new Date().toISOString();
  const before = clamp(Number(simulation.completedQuarters || 0), 0, quarters.length);
  const after = clamp(before + 1, 0, quarters.length);
  if (!simulation.startedAt && after > 0) simulation.startedAt = timestamp;
  simulation.completedQuarters = after;
  simulation.updatedAt = timestamp;
  simulation.lastMode = "run-next-agent-cycle";
  simulation.externalMutation = false;
  simulation.fileMutation = "browser-vfs-only";
  simulation.osProfile = state.osProfile || "linux";
  simulation.completedQuarterIds = quarters.slice(0, simulation.completedQuarters).map((quarter) => quarter.id);
  simulation.activeQuarterId = quarters[Math.min(simulation.completedQuarters, quarters.length - 1)]?.id || null;
  syncAiCoreOrbitToSimulation(simulation.completedQuarters, timestamp, "run-next-agent-cycle");
  processState.pulseCount = Number(processState.pulseCount || 0) + 1;
  processState.lastPulse = timestamp;
  const completedQuarter = quarters[Math.max(after - 1, 0)] || null;
  const nextQuarter = quarters[after] || null;
  const processes = getSubAgentProcesses();
  const cyclePath = "/home/seis/Documents/sub-agent-cycle-report.md";
  const processPath = "/home/seis/Documents/sub-agent-process-ledger.md";
  const simulationPath = "/home/seis/Documents/sub-agent-five-year-simulation.md";
  data.lastCycle = {
    time: timestamp,
    quarterId: completedQuarter?.id || "complete",
    focus: completedQuarter?.focus || "review",
    lane: completedQuarter?.laneName || "All lanes",
    completedQuarters: simulation.completedQuarters,
    totalQuarters: quarters.length,
    externalMutation: false
  };
  data.lastSimulation = {
    time: timestamp,
    mode: "run-next-agent-cycle",
    completedQuarters: simulation.completedQuarters,
    totalQuarters: quarters.length,
    osProfile: simulation.osProfile,
    externalMutation: false
  };
  upsertFile(cyclePath, buildSubAgentCycleReportMarkdown(timestamp, completedQuarter, nextQuarter, processes, simulation));
  upsertFile(processPath, buildSubAgentProcessLedgerMarkdown(timestamp, processes));
  upsertFile(simulationPath, buildSubAgentSimulationMarkdown(timestamp, simulation, quarters));
  getListData("sub-agent-control").unshift({
    id: `subagent-cycle-${Date.now()}`,
    title: "Agent cycle recorded",
    body: `${simulation.completedQuarters}/${quarters.length} quarters recorded. Artifact: ${cyclePath}`,
    done: simulation.completedQuarters === quarters.length
  });
  const message = `Agent cycle recorded: ${simulation.completedQuarters}/${quarters.length} quarters.`;
  getAppStatus("sub-agent-control").lastAction = message;
  log("sub-agent-cycle", `${message} No external execution changed.`);
  saveState();
  renderOpenWindows("sub-agent-control");
  renderOpenWindows("system-monitor");
  renderOpenWindows("task-manager");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
  toast("Sub-Agent Cycle", message);
}

function pulseSubAgentProcesses() {
  const processState = getSubAgentProcessState();
  const timestamp = new Date().toISOString();
  processState.pulseCount = Number(processState.pulseCount || 0) + 1;
  processState.lastPulse = timestamp;
  const processes = getSubAgentProcesses();
  const path = "/home/seis/Documents/sub-agent-process-ledger.md";
  upsertFile(path, buildSubAgentProcessLedgerMarkdown(timestamp, processes));
  getListData("sub-agent-control").unshift({
    id: `subagent-process-${Date.now()}`,
    title: "Agent process pulse",
    body: `${processes.length} bounded local processes recorded. Artifact: ${path}`,
    done: true
  });
  const message = `Recorded ${processes.length} bounded sub-agent processes.`;
  getAppStatus("sub-agent-control").lastAction = message;
  log("sub-agent-processes", `${message} ${path}`);
  saveState();
  setTimeout(() => renderOpenWindows("sub-agent-control"), 0);
  renderOpenWindows("system-monitor");
  renderOpenWindows("task-manager");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
  toast("Sub-Agent Processes", message);
}

function toggleSubAgentProcess(laneId) {
  if (!SUB_AGENT_DEMO.lanes.some((lane) => lane[1] === laneId)) return;
  const processState = getSubAgentProcessState();
  const paused = processState.pausedLaneIds.includes(laneId);
  processState.pausedLaneIds = paused
    ? processState.pausedLaneIds.filter((id) => id !== laneId)
    : [...processState.pausedLaneIds, laneId];
  const message = `${paused ? "Resumed" : "Suspended"} ${laneId} local process.`;
  getAppStatus("sub-agent-control").lastAction = message;
  log("sub-agent-processes", `${message} No external execution changed.`);
  saveState();
  setTimeout(() => renderOpenWindows("sub-agent-control"), 0);
  renderOpenWindows("system-monitor");
  renderOpenWindows("task-manager");
  toast("Sub-Agent Processes", message);
}

function updateSubAgentSimulation(completedQuarters, mode) {
  const quarters = getSubAgentQuarters();
  const data = getAppData("sub-agent-control");
  const simulation = getSubAgentSimulationState();
  const timestamp = new Date().toISOString();
  if (!simulation.startedAt && completedQuarters > 0) simulation.startedAt = timestamp;
  simulation.completedQuarters = clamp(completedQuarters, 0, quarters.length);
  simulation.updatedAt = timestamp;
  simulation.lastMode = mode;
  simulation.externalMutation = false;
  simulation.fileMutation = "browser-vfs-only";
  simulation.osProfile = state.osProfile || "linux";
  simulation.completedQuarterIds = quarters.slice(0, simulation.completedQuarters).map((quarter) => quarter.id);
  simulation.activeQuarterId = quarters[Math.min(simulation.completedQuarters, quarters.length - 1)]?.id || null;
  syncAiCoreOrbitToSimulation(simulation.completedQuarters, timestamp, mode);
  data.lastSimulation = {
    time: timestamp,
    mode,
    completedQuarters: simulation.completedQuarters,
    totalQuarters: quarters.length,
    osProfile: simulation.osProfile,
    externalMutation: false
  };
  const path = "/home/seis/Documents/sub-agent-five-year-simulation.md";
  upsertFile(path, buildSubAgentSimulationMarkdown(timestamp, simulation, quarters));
  getListData("sub-agent-control").unshift({
    id: `subagent-simulation-${Date.now()}`,
    title: mode === "reset-simulation" ? "Simulation reset" : "Simulation updated",
    body: `${simulation.completedQuarters}/${quarters.length} local quarters recorded. Artifact: ${path}`,
    done: simulation.completedQuarters === quarters.length
  });
  const message = `Sub-Agent five-year simulation ${mode.replaceAll("-", " ")}: ${simulation.completedQuarters}/${quarters.length} quarters.`;
  getAppStatus("sub-agent-control").lastAction = message;
  log("sub-agent-control", message);
  saveState();
  renderOpenWindows("sub-agent-control");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
  toast("Sub-Agent Control", message);
}

function buildSubAgentProcessLedgerMarkdown(timestamp, processes) {
  const processState = getSubAgentProcessState();
  return `# SEIS Sub-Agent Process Ledger

Generated: ${timestamp}

Mode: browser-local OS process demo
Process count: ${processes.length}
Pulse count: ${processState.pulseCount}
External mutation: no
Credentials required: no

This artifact records bounded sub-agent process state for the SEIS Desktop OS demo. It is not a background worker runtime, does not grant write authority, does not call model providers, does not execute SSH, and does not mutate GitHub.

## Processes
${processes.map((process) => `- PID ${process.pid}: ${process.name} / ${process.status} / ${process.permission} / CPU ${process.cpu}% / ${process.memory} / ${process.scope}`).join("\n")}

## Suspended Lanes
${processState.pausedLaneIds.length ? processState.pausedLaneIds.map((laneId) => `- ${laneId}`).join("\n") : "- None"}
`;
}

function buildSubAgentCycleReportMarkdown(timestamp, completedQuarter, nextQuarter, processes, simulation) {
  return `# SEIS Sub-Agent Cycle Report

Generated: ${timestamp}

Mode: browser-local managed cycle
Completed quarters: ${simulation.completedQuarters}/${getSubAgentQuarters().length}
OS profile: ${simulation.osProfile || state.osProfile || "linux"}
External mutation: no
Credentials required: no

This report records one bounded local sub-agent cycle. It advances the visible five-year timeline, pulses managed process state, and writes browser VFS artifacts only. It does not run background agents, call model providers, execute SSH, deploy, merge, push, or mutate GitHub.

## Completed Cycle
${completedQuarter ? `- ${completedQuarter.label}: ${completedQuarter.laneName} / ${completedQuarter.focus} / ${completedQuarter.title}` : "- Five-year cycle already complete"}

## Next Cycle
${nextQuarter ? `- ${nextQuarter.label}: ${nextQuarter.laneName} / ${nextQuarter.focus} / ${nextQuarter.title}` : "- Five-year cycle complete; next action is human review"}

## Managed Processes
${processes.map((process) => `- PID ${process.pid}: ${process.name} / ${process.status} / ${process.permission}`).join("\n")}

## Safety Boundary
${SUB_AGENT_DEMO.gates.map((gate) => `- ${gate}`).join("\n")}
`;
}

function buildSubAgentSimulationMarkdown(timestamp, simulation, quarters) {
  const completed = quarters.slice(0, simulation.completedQuarters);
  const next = quarters[simulation.completedQuarters];
  return `# SEIS Five-Year Sub-Agent Simulation

Generated: ${timestamp}

Mode: ${simulation.lastMode}
Completed quarters: ${simulation.completedQuarters}/${quarters.length}
Runtime boundary: browser-local status/plan simulation
OS profile: ${simulation.osProfile || state.osProfile || "linux"}
External mutation: ${simulation.externalMutation ? "yes" : "no"}
File mutation: ${simulation.fileMutation}

This artifact is a compressed demo of a five-year sub-agent development program. It does not prove five years elapsed, does not run background automation, does not call AI providers, does not execute SSH, and does not mutate GitHub.

## Completed Quarters
${completed.length ? completed.map((quarter) => `- ${quarter.label}: ${quarter.laneName} / ${quarter.focus} / ${quarter.title}`).join("\n") : "- None yet"}

## Next Quarter
${next ? `- ${next.label}: ${next.laneName} / ${next.focus} / ${next.title}` : "- Five-year simulation complete"}

## Safety Gates
${SUB_AGENT_DEMO.gates.map((gate) => `- ${gate}`).join("\n")}
`;
}

function buildAiCoreOrbitSnapshotMarkdown(timestamp, activeVersion, orbit, processes, simulation) {
  return `# SEIS AI Core Orbit Snapshot

Generated: ${timestamp}

Mode: browser-local spatial command surface
Active version: ${activeVersion.label} ${activeVersion.title}
Active version id: ${activeVersion.id}
Orbit rotation: ${orbit.rotationDeg}deg
Completed quarters: ${simulation.completedQuarters}/${getSubAgentQuarters().length}
OS profile: ${simulation.osProfile || state.osProfile || "linux"}
Provider mode: Local Demo
Credentials required: no
External mutation: no
Runtime boundary: no provider calls, no SSH, no GitHub mutation, no release promotion

This snapshot links the SEIS AI Core version preview to the Sub-Agent Control five-year local demo. It is UI/evidence state only and does not prove autonomous execution, model ownership, deployment, or live provider integration.

## Active Capability
${activeVersion.capability}

## Promotion Gate
${activeVersion.gate}

## Version Targets
${AI_CORE_VERSION_TARGETS.map((target) => `- ${target.label} ${target.title}: ${target.year} / ${target.gate}`).join("\n")}

## Managed Lanes
${processes.map((process) => `- PID ${process.pid}: ${process.name} / ${process.status} / ${process.permission} / ${process.scope}`).join("\n")}
`;
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

function setAiAssistantTab(tab) {
  const data = getAppData("ai-assistant");
  data.activeTab = AI_PLUGIN_TABS.includes(tab) ? tab : "Overview";
  saveState();
  renderOpenWindows("ai-assistant");
}

function toggleAiPlugin(id) {
  const plugin = state.installedExtensions.find((item) => item.id === id);
  if (!plugin) return;
  plugin.enabled = !plugin.enabled;
  const assistant = getAppData("ai-assistant");
  if (!Array.isArray(assistant.toolCalls)) assistant.toolCalls = [];
  assistant.toolCalls.unshift({
    name: "toggle_ai_plugin",
    status: plugin.enabled ? "enabled" : "disabled",
    scope: plugin.name
  });
  saveState();
  renderOpenWindows("ai-assistant");
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

function auditInstalledAiSystems() {
  const assistant = getAppData("ai-assistant");
  const systems = getInstalledAiSystems();
  const path = "/home/seis/Documents/installed-ai-systems-audit.md";
  const now = new Date().toLocaleString();
  upsertFile(path, buildInstalledAiSystemsAudit(systems, now));
  assistant.lastInstalledAiAudit = {
    time: now,
    profiles: systems.length,
    available: systems.filter((system) => system.status === "Available").length
  };
  if (!Array.isArray(assistant.toolCalls)) assistant.toolCalls = [];
  assistant.toolCalls.unshift({
    name: "audit_installed_ai_systems",
    status: "success",
    scope: path
  });
  toast("Installed AI Systems", `Saved ${path}.`);
  saveState();
  renderOpenWindows("ai-assistant");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
}

function exportAiCoreResourceBridge() {
  const assistant = getAppData("ai-assistant");
  const path = "/home/seis/Documents/seis-ai-core-resource-bridge.md";
  const timestamp = new Date().toISOString();
  upsertFile(path, buildAiCoreResourceBridgeMarkdown(timestamp));
  assistant.lastResourceBridgeExport = {
    time: timestamp,
    path,
    resource: SEIS_AI_CORE_RESOURCE_BRIDGE.planViewResource,
    mode: SEIS_AI_CORE_RESOURCE_BRIDGE.mode
  };
  if (!Array.isArray(assistant.toolCalls)) assistant.toolCalls = [];
  assistant.toolCalls.unshift({
    name: "export_ai_core_resource_bridge",
    status: "success",
    scope: path
  });
  log("ai-core-resource-bridge", `Exported read-only AI Core resource bridge to ${path}.`);
  toast("AI Core Resource Bridge", `Saved ${path}.`);
  saveState();
  renderOpenWindows("ai-assistant");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
}

function buildAiCoreResourceBridgeMarkdown(timestamp) {
  return `# SEIS AI Core Resource Bridge

Generated: ${timestamp}

This browser-local artifact links the generated five-year sub-agent plan view into the SEIS AI surface. It is read-only evidence for the local demo and does not prove live provider access, autonomous execution, deployment, SSH access, or credential configuration.

## Resource Map

- Status: ${SEIS_AI_CORE_RESOURCE_BRIDGE.status}
- Mode: ${SEIS_AI_CORE_RESOURCE_BRIDGE.mode}
- Plan view resource: ${SEIS_AI_CORE_RESOURCE_BRIDGE.planViewResource}
- Plan view file: ${SEIS_AI_CORE_RESOURCE_BRIDGE.planView}
- Source plan: ${SEIS_AI_CORE_RESOURCE_BRIDGE.sourcePlan}
- Promotion map resource: ${SEIS_AI_CORE_RESOURCE_BRIDGE.promotionMapResource}
- Promotion map file: ${SEIS_AI_CORE_RESOURCE_BRIDGE.promotionMap}
- MCP runtime contract resource: ${SEIS_AI_CORE_RESOURCE_BRIDGE.mcpRuntimeContractResource}
- MCP runtime contract file: ${SEIS_AI_CORE_RESOURCE_BRIDGE.mcpRuntimeContract}
- Provider registry resource: ${SEIS_AI_CORE_RESOURCE_BRIDGE.providerRegistryResource}
- Provider registry file: ${SEIS_AI_CORE_RESOURCE_BRIDGE.providerRegistry}
- Plugin manifest resource: ${SEIS_AI_CORE_RESOURCE_BRIDGE.pluginManifestResource}
- Version registry resource: ${SEIS_AI_CORE_RESOURCE_BRIDGE.versionRegistryResource}
- Generator: ${SEIS_AI_CORE_RESOURCE_BRIDGE.generator}
- Evidence validator: ${SEIS_AI_CORE_RESOURCE_BRIDGE.validator}
- Plugin integration gate: ${SEIS_AI_CORE_RESOURCE_BRIDGE.pluginGate}

## Coverage

- Years: ${SEIS_AI_CORE_RESOURCE_BRIDGE.years}
- Quarters: ${SEIS_AI_CORE_RESOURCE_BRIDGE.quarters}
- Lanes: ${SEIS_AI_CORE_RESOURCE_BRIDGE.lanes}
- Version targets: ${SEIS_AI_CORE_RESOURCE_BRIDGE.versionTargets}
- Release promotion allowed: ${SEIS_AI_CORE_RESOURCE_BRIDGE.releasePromotionAllowed ? "yes" : "no"}

## Safety Boundary

${SEIS_AI_CORE_RESOURCE_BRIDGE.boundary}

## Next Safe Action

Keep this resource bridge generated from repository-owned source data and validate it with ${SEIS_AI_CORE_RESOURCE_BRIDGE.validator} before using it as Command Center or AI Core display evidence.
`;
}

function exportInstalledAiCoreRouteMatrix() {
  const assistant = getAppData("ai-assistant");
  const path = "/home/seis/Documents/seis-installed-ai-core-route-matrix.md";
  const timestamp = new Date().toISOString();
  upsertFile(path, buildInstalledAiCoreRouteMatrixMarkdown(timestamp));
  assistant.lastAiCoreRouteMatrixExport = {
    time: timestamp,
    path,
    profileCount: SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.length,
    availableCount: SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.filter((route) => route.providerState === "Available").length
  };
  if (!Array.isArray(assistant.toolCalls)) assistant.toolCalls = [];
  assistant.toolCalls.unshift({
    name: "export_installed_ai_core_route_matrix",
    status: "success",
    scope: path
  });
  log("installed-ai-core-route-matrix", `Exported installed AI Core route matrix to ${path}.`);
  toast("Installed AI Core Route Matrix", `Saved ${path}.`);
  saveState();
  renderOpenWindows("ai-assistant");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
}

function buildInstalledAiCoreRouteMatrixMarkdown(timestamp) {
  return `# SEIS Installed AI Core Route Matrix

Generated: ${timestamp}

This browser-local artifact binds installed AI/operator profiles to SEIS AI Core version targets, route modes, credential boundaries, and sub-agent duties. It is evidence for the local demo surface only. It does not prove live provider access, model ownership, autonomous execution, deployment, SSH access, or credential configuration.

## Summary

- Routed profiles: ${SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.length}
- Available profiles: ${SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.filter((route) => route.providerState === "Available").length}
- Missing-key profiles: ${SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.filter((route) => route.providerState === "Missing Key").length}
- Disabled profiles: ${SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.filter((route) => route.providerState === "Disabled").length}
- No-key SEIS core: active through Local Demo
- Plan-view resource: ${SEIS_AI_CORE_RESOURCE_BRIDGE.planViewResource}

## Routes

${SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.map((route) => `### ${route.systemName}

- System ID: ${route.systemId}
- AI Core target: ${route.versionLabel} (${route.versionTargetId})
- Provider state: ${route.providerState}
- Route mode: ${route.routeMode}
- Sub-agent duty: ${route.subAgentDuty}
- Capability: ${route.capability}
- Credential boundary: ${route.credentialBoundary}
- Fallback: ${route.fallback}
`).join("\n")}

## Next Safe Action

Keep routing transparent: missing-key providers stay excluded from live routing, disabled providers remain disabled, and fallback output must show its actual provider identity.
`;
}

function exportPersonalPluginAiCoreLaneMatrix() {
  const assistant = getAppData("ai-assistant");
  const path = "/home/seis/Documents/seis-personal-plugin-ai-core-lane-matrix.md";
  const timestamp = new Date().toISOString();
  upsertFile(path, buildPersonalPluginAiCoreLaneMatrixMarkdown(timestamp));
  assistant.lastPersonalPluginLaneMatrixExport = {
    time: timestamp,
    path,
    laneCount: SEIS_PERSONAL_PLUGIN_AI_CORE_LANE_MATRIX.length,
    mcpResource: "seis://agent/plugin-integration.json"
  };
  if (!Array.isArray(assistant.toolCalls)) assistant.toolCalls = [];
  assistant.toolCalls.unshift({
    name: "export_personal_plugin_ai_core_lane_matrix",
    status: "success",
    scope: path
  });
  log("personal-plugin-ai-core-lane-matrix", `Exported personal plugin AI Core lane matrix to ${path}.`);
  toast("Personal Plugin AI Core Lane Matrix", `Saved ${path}.`);
  saveState();
  renderOpenWindows("ai-assistant");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
}

function buildPersonalPluginAiCoreLaneMatrixMarkdown(timestamp) {
  return `# SEIS Personal Plugin AI Core Lane Matrix

Generated: ${timestamp}

This browser-local artifact binds the installed personal SEIS plugin family into explicit SEIS AI Core version gates. It records plan-only local demo evidence and does not prove connector authentication, live model-provider access, autonomous execution, cloud deployment, SSH access, GitHub mutation, or credential readiness.

## Summary

- Plugin lanes: ${SEIS_PERSONAL_PLUGIN_AI_CORE_LANE_MATRIX.length}
- Permission boundary: plan-only
- MCP manifest resource: seis://agent/plugin-integration.json
- Plan-view resource: ${SEIS_AI_CORE_RESOURCE_BRIDGE.planViewResource}
- Core key requirement: none
- Human approval required for external mutation: yes

## Lane Matrix

${SEIS_PERSONAL_PLUGIN_AI_CORE_LANE_MATRIX.map((lane) => `### ${lane.pluginId}

- Embedded lane: ${lane.displayName} (${lane.laneId})
- AI Core target: ${lane.versionLabel} (${lane.versionTargetId})
- Permission level: ${lane.permissionLevel}
- Tool pair: ${lane.toolPair}
- Gate: ${lane.gate}
- Version duty: ${lane.versionDuty}
- Boundary: ${lane.boundary}
`).join("\n")}

## Next Safe Action

Keep these plugin lanes routed through the SEIS AI Core manifest and direct plan/status tools. Promote a lane beyond plan-only only after source-of-truth evidence, permission tests, rollback notes, and human approval are present.
`;
}

function exportMcpRuntimeContract() {
  const assistant = getAppData("ai-assistant");
  const path = "/home/seis/Documents/seis-mcp-runtime-contract.md";
  const timestamp = new Date().toISOString();
  upsertFile(path, buildMcpRuntimeContractMarkdown(timestamp));
  assistant.lastMcpRuntimeContractExport = {
    time: timestamp,
    path,
    toolCount: SEIS_MCP_RUNTIME_CONTRACT.toolCount,
    resourceCount: SEIS_MCP_RUNTIME_CONTRACT.resourceCount,
    promptCount: SEIS_MCP_RUNTIME_CONTRACT.promptCount,
    status: SEIS_MCP_RUNTIME_CONTRACT.status
  };
  if (!Array.isArray(assistant.toolCalls)) assistant.toolCalls = [];
  assistant.toolCalls.unshift({
    name: "export_mcp_runtime_contract",
    status: "success",
    scope: path
  });
  log("mcp-runtime-contract", `Exported SEIS MCP runtime contract to ${path}.`);
  toast("MCP Runtime Contract", `Saved ${path}.`);
  saveState();
  renderOpenWindows("ai-assistant");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
}

function buildMcpRuntimeContractMarkdown(timestamp) {
  return `# SEIS MCP Runtime Contract

Generated: ${timestamp}

This browser-local artifact records the SEIS AI MCP stdio contract used by the local demo and smoke tests. It does not prove remote MCP server readiness, connector authentication, unrestricted tool execution, SSH access, deployment, GitHub mutation, provider access, or credential readiness.

## Summary

- Contract source: ${SEIS_MCP_RUNTIME_CONTRACT.sourcePath}
- Contract resource: ${SEIS_MCP_RUNTIME_CONTRACT.resourceUri}
- Status: ${SEIS_MCP_RUNTIME_CONTRACT.status}
- Transport: ${SEIS_MCP_RUNTIME_CONTRACT.transport}
- Fallback: ${SEIS_MCP_RUNTIME_CONTRACT.fallback}
- Official SDK path: ${SEIS_MCP_RUNTIME_CONTRACT.officialSdk}
- Tools: ${SEIS_MCP_RUNTIME_CONTRACT.toolCount}
- Resources: ${SEIS_MCP_RUNTIME_CONTRACT.resourceCount}
- Prompts: ${SEIS_MCP_RUNTIME_CONTRACT.promptCount}
- Smoke test: ${SEIS_MCP_RUNTIME_CONTRACT.smokeTest}
- Plugin gate: ${SEIS_MCP_RUNTIME_CONTRACT.pluginGate}
- Verified resource read: ${SEIS_MCP_RUNTIME_CONTRACT.resourceRead}
- Plugin integration resource: ${SEIS_MCP_RUNTIME_CONTRACT.pluginIntegrationResource}

## Surfaces

${SEIS_MCP_RUNTIME_CONTRACT.surfaces.map((surface) => `### ${surface.label}

- ID: ${surface.id}
- Count: ${surface.count}
- Method: ${surface.method}
- Evidence: ${surface.evidence}
- SEIS AI Core duty: ${surface.duty}
`).join("\n")}

## Safety Boundary

${SEIS_MCP_RUNTIME_CONTRACT.boundary}

## Next Safe Action

Keep this contract smoke-tested with ${SEIS_MCP_RUNTIME_CONTRACT.smokeTest}. Treat official SDK installation, remote MCP servers, write tools, SSH, deployment, and GitHub mutation as separate approval-gated hardening work.
`;
}

function exportPersonalPluginBridge() {
  const assistant = getAppData("ai-assistant");
  const path = "/home/seis/Documents/seis-personal-plugin-bridge.md";
  const timestamp = new Date().toISOString();
  upsertFile(path, buildPersonalPluginBridgeMarkdown(timestamp));
  assistant.lastPersonalPluginBridgeExport = {
    time: timestamp,
    path,
    pluginCount: SEIS_PERSONAL_PLUGIN_BRIDGE.length,
    mcpResource: "seis://agent/plugin-integration.json"
  };
  if (!Array.isArray(assistant.toolCalls)) assistant.toolCalls = [];
  assistant.toolCalls.unshift({
    name: "export_personal_plugin_bridge",
    status: "success",
    scope: path
  });
  log("personal-plugin-bridge", `Exported personal SEIS plugin bridge to ${path}.`);
  toast("Personal SEIS Plugin Bridge", `Saved ${path}.`);
  saveState();
  renderOpenWindows("ai-assistant");
  renderOpenWindows("files");
  renderOpenWindows("system-logs");
}

function buildPersonalPluginBridgeMarkdown(timestamp) {
  return `# SEIS Personal Plugin Bridge

Generated: ${timestamp}

This browser-local artifact maps the installed personal SEIS plugin family into the repo-contained SEIS AI Core surface. It records local demo evidence only. It does not claim connector authentication, external provider access, autonomous background execution, SSH access, deployment authority, or credential readiness.

## Runtime Boundary

- Canonical install: seis-ai-agent@seis-repo
- Standalone lane install mode: disabled
- MCP manifest resource: seis://agent/plugin-integration.json
- Plan-view resource: ${SEIS_AI_CORE_RESOURCE_BRIDGE.planViewResource}
- Credential policy: no browser credential, no provider key, no SSH private key
- External mutation: requires explicit human approval

## Personal Plugins

${SEIS_PERSONAL_PLUGIN_BRIDGE.map((plugin) => `### ${plugin.id}

- Embedded as: ${plugin.embeddedAs}
- Display name: ${plugin.displayName}
- Lane: ${plugin.lane}
- Source mirror: ${plugin.sourceMirror}
- Embedded skill: ${plugin.embeddedSkill}
- Status tool: ${plugin.statusTool}
- Plan tool: ${plugin.planTool}
- Default gate: ${plugin.defaultGate}
`).join("\n")}

## Next Safe Action

Keep these plugin identities routed through the SEIS AI Core manifest and direct lane tools. Do not publish standalone lane plugins, call external providers, or execute cloud/SSH actions from this bridge without explicit approval and validation.
`;
}

function buildInstalledAiSystemsAudit(systems, timestamp) {
  return `# SEIS Installed AI Systems Audit

Generated: ${timestamp}

This browser-local audit describes supervised AI/operator profiles available to the SEIS demo surface. It does not prove live provider access, autonomous execution, model ownership, deployment, or credential configuration.

## Summary

- Profiles: ${systems.length}
- Available profiles: ${systems.filter((system) => system.status === "Available").length}
- Missing-key profiles: ${systems.filter((system) => system.status === "Missing Key").length}
- Disabled profiles: ${systems.filter((system) => system.status === "Disabled").length}
- Core product key requirement: none

## Systems

${systems.map((system) => `### ${system.name}

- ID: ${system.id}
- Status: ${system.status}
- Role: ${system.role}
- Classification: ${system.classification}
- Credential boundary: ${system.keyPolicy}
- Capability: ${system.capability}
- Boundary: ${system.boundary}
`).join("\n")}

## Next Safe Action

Keep SEIS AI in Local Demo mode until a backend-only provider registry, credential validation layer, and provider audit are implemented and validated.
`;
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
  const processes = getSubAgentProcesses();
  const activeProcesses = processes.filter((process) => process.status !== "Suspended").length;
  const pulseCount = getSubAgentProcessState().pulseCount || 0;
  return [
    { label: "Apps", value: `${APPS.length} installed`, percent: 92 },
    { label: "Open Windows", value: String(state.windows.length), percent: clamp(state.windows.length * 14, 6, 100) },
    { label: "Files", value: `${state.fs.length} nodes`, percent: clamp(state.fs.length * 3, 12, 100) },
    { label: "Storage", value: `${fileBytes} bytes`, percent: clamp(fileBytes / 120, 4, 96) },
    { label: "History", value: `${state.terminalHistory.length} commands`, percent: clamp(state.terminalHistory.length * 2, 5, 100) },
    { label: "Agent Processes", value: `${activeProcesses}/${processes.length} managed`, percent: clamp(activeProcesses / processes.length * 100, 1, 100) },
    { label: "Agent Pulses", value: `${pulseCount} local pulses`, percent: clamp(pulseCount * 12, 4, 100) },
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

function toast(title, detail, options = {}) {
  const region = document.querySelector(".toast-region");
  const node = document.createElement("article");
  node.className = "toast";
  node.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span>`;
  region.append(node);
  if (options.persist !== false) addNotification(title, detail, options.scope || "system", { save: options.save !== false });
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
