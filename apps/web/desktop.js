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
  "seis-code",
  "code-ide",
  "search",
  "seis-store",
  "ai-assistant",
  "seis-design",
  "seis-website",
  "seis-cloud",
  "music",
  "wow-gallery",
  "seis-evolution",
  "sub-agent-control",
  "settings",
  "notes",
  "app-center",
  "mythic-gacha"
];

const DESKTOP_SHORTCUTS = ["files", "terminal", "settings", "search", "seis-code", "seis-design", "seis-store", "music"];
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
  ["Model scaling profile", "npm run check:seis-model-scaling-hardware-profile", "20B on 16GB+ RAM planning profile, memory budget contract, future 70B ladder, and 150B frontier research lane."],
  ["Website pages", "npm run check:seis-website-pages", "Premium product pages for SEIS AI, OS, Code, Design, Search, Cloud, Store, and Agents."]
];

const SEIS_SEARCH_TABS = ["AI", "Web", "Code", "Design", "Cloud", "Apps", "Plugins", "Files"];

const SEIS_MODEL_SCALING_UI_PROFILE = {
  currentTarget: "SEIS 20B Local Compatibility Target",
  ramClass: "16GB+ RAM",
  frontierTarget: "SEIS 150B Frontier Research Target",
  frontierStatus: "frontier-research-roadmap / not scoped",
  compatibilityClaim: "not-verified",
  memoryBudgetStatus: "planning-estimate-not-benchmark-evidence",
  benchmarkManifest: "reports/seis-model-scaling/20b-16gb-memory-benchmark.json",
  benchmarkStatus: "template-not-measured",
  compatibilityProfiles: [
    ["16GB+ developer floor", "20B / Q4 candidate", "Local Demo only", "Not verified"],
    ["24GB+ candidate lane", "20B / Q4 candidate", "Local Demo only", "Not verified"],
    ["32GB+ validation lane", "20B / Q5-Q6 candidate", "Approved adapter tests later", "Not verified"],
    ["64GB+ research lane", "70B research", "Planning only", "Research roadmap"],
    ["Distributed frontier lane", "150B+ future", "Disabled", "Not scoped"]
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
    ["Stage 4", "Highest future class", "Not scoped"]
  ],
  quantizationProfiles: [
    ["Q4-class 20B local candidate", "Planned / not benchmarked", "Not route eligible"],
    ["Q5/Q6-class 20B workstation candidate", "Planned / not benchmarked", "Not route eligible"],
    ["Higher precision research lane", "Future research", "Not route eligible"],
    ["150B distributed frontier lane", "Future frontier / not scoped", "Not route eligible"]
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

const AI_PLUGIN_TABS = ["Overview", "Installed AI", "Plugin Center", "Sub-Agent Plan", "Tool Calls", "History"];
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
  resourceCount: 20,
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
      evidence: "14 MCP smoke tests pass through stdio JSON-RPC",
      duty: "Expose repo-backed SEIS AI checks, personal plugin lane tools, provider registry status, model scaling status, and AI Core version/sub-agent tools."
    },
    {
      id: "resources",
      label: "Resource registry",
      count: 20,
      method: "resources/list + resources/read",
      evidence: "Plugin integration, provider registry, model scaling profile, and MCP runtime contract resources are read through the protocol",
      duty: "Expose source-of-truth JSON resources for plugin integration, provider states, planned model scaling, MCP runtime, version gates, fixtures, and generated plan views."
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
const SEIS_STORE_ITEMS = [
  { id: "seis-system-os", name: "SEIS System OS", category: "System", status: "Installed", target: "app", targetId: "seis-system-os", detail: "Linux, macOS, and Windows-inspired browser OS shell with widgets, recents, app switcher, and validated local evidence." },
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
  { id: "wow-gallery-web", name: "SEIS WOW Gallery", category: "Website", status: "Available", target: "route", targetId: "wow-gallery-web", detail: "190 imported PNG page previews, 197 HTML references, and two Kimi external reference links." },
  { id: "mythic-gacha-web", name: "Mythic Gacha Web", category: "Website", status: "Available", target: "route", targetId: "mythic-gacha-web", detail: "Playable Shan Hai Jing-inspired gacha and bestiary route." },
  { id: "video-hero-gallery", name: "Video Hero Gallery", category: "Website", status: "Available", target: "route", targetId: "video-hero-gallery", detail: "Four immersive video hero showcase pages." },
  { id: "seis-ai-core-3d-demo", name: "SEIS AI Core 3D", category: "AI", status: "Available", target: "route", targetId: "seis-ai-core-3d-demo", detail: "Big-tech style AI Core, model router, prompt engine, and sub-agent website." }
];
const DB_NAME = "seis-desktop-os";
const DB_VERSION = 1;
const STORE_NAME = "desktopState";
const STORAGE_KEY = "seis.desktop.state.v1";
const CODE_WORKSPACE_DB_NAME = "seis-code-workspace-v1";
const CODE_WORKSPACE_DB_VERSION = 1;
const CODE_WORKSPACE_ROOT = "/workspace";
const CODE_WORKSPACE_CHANNEL = "seis-code-workspace";
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
  file("/home/seis/Documents/seis-demo-websites.md", "# SEIS Demo Websites\n\n- SEIS Website Hub: ./website/index.html\n- SEIS AI Website: ./website/seis-ai.html\n- SEIS OS Website: ./website/seis-os.html\n- SEIS Code Website: ./website/seis-code.html\n- SEIS Design Website: ./website/seis-design.html\n- SEIS Search Website: ./website/seis-search.html\n- SEIS Cloud Website: ./website/seis-cloud.html\n- SEIS Store Website: ./website/seis-store.html\n- SEIS Agents Website: ./website/seis-agents.html\n- SEIS System OS: ./desktop.html#seis-system-os\n- SEIS AI Core 3D Demo: ./ai-core-demo/index.html\n- SEIS Code Web: ./seis-code.html\n- SEIS WOW Gallery: ./wow-gallery.html\n- Mythic Gacha: ./mythic-gacha.html\n- Nature Video Hero: ./showcase/nature.html\n- Still Life Video Hero: ./showcase/still-life.html\n- Materials Video Hero: ./showcase/materials.html\n- Metal Parts Video Hero: ./showcase/metal-parts.html\n\nExternal references are opened only as clearly labeled reference links. The SEIS_WOW reference board now indexes 190 PNG screens and 197 HTML references.\n"),
  file("/home/seis/Documents/seis-evolution-reference.md", "# SEIS Evolution Reference\n\nPinned scope: SEIS AI Core, Linux/macOS/Windows desktop demo, SEIS Code Web, SEIS AI integration, websites, and SEIS-SSH boundary.\n\nThis file is a local demo reference. It does not execute SSH or connect to cloud services.\n"),
  file("/home/seis/Documents/seis-local-ecosystem-inventory.md", "# SEIS Local Ecosystem Inventory\n\nThis demo maps the local application and folder names into SEIS roles without copying application bundles, private files, unclear archives, provider keys, or machine-specific paths.\n\n## SEIS Routes\n- SEIS Search: gateway for apps, folders, websites, Code, Design, Cloud, and AI Core.\n- SEIS Code: repository and editor workspace.\n- SEIS Design: Adobe/Figma-style creative workflow mapped to SEIS surfaces.\n- SEIS Cloud: Chrome/Safari/Ollama/Qwen/cloud/SSH readiness boundary.\n- SEIS Evolution: pinned work, local inventory, and long-horizon map.\n\n## Safety\nUnclear, leaked, private, generated, or licensed material remains review-only and is not merged into official SEIS behavior.\n"),
  file("/home/seis/Music/seis-demo-playlist.md", "# SEIS Demo Playlist\n\n- Core Orbit\n- Launch Sequence\n- Cloud Gate\n- Mythic Draw\n- Code Night\n\nThese are local demo track records, not external audio files.\n"),
  file("/home/seis/Applications/seis-store-catalog.md", "# SEIS Store Catalog\n\nInstalled: SEIS System OS, SEIS Code, Code IDE, SEIS Design, SEIS Website, SEIS Cloud, Music, SEIS WOW Gallery.\nAvailable routes: SEIS Website pages, SEIS WOW Gallery, Mythic Gacha Web, Video Hero Gallery, SEIS AI Core 3D.\n"),
  file("/home/seis/Documents/seis-system-os-blueprint.md", "# SEIS System OS Blueprint\n\nSEIS System OS combines Linux-like activities, macOS-like dock/status ergonomics, and Windows-like app switching/task layout into an original browser-contained SEIS shell.\n\n## Connected OS modules\n- Home widgets\n- Dynamic/live status strip\n- App switcher\n- Multi-screen workspaces\n- Launcher search\n- Universal recents\n- File previews\n- Appearance and accessibility\n- Terminal multiplexer target\n\n## Boundary\nLocal demo only. No SSH execution, provider keys, deployment, or release promotion happens from the browser shell.\n"),
  file("/home/seis/Desktop/todo.txt", "Open Files\nRun Terminal\nTry Apps launcher\n")
];

let db = null;
let state = createDefaultState();
let activeWindowId = null;
let launcherCategory = "All";
let codeWorkspaceSyncQueue = Promise.resolve();
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
    audioMuted: Boolean(nextSystem.audioMuted),
    shortcutOverlay: {
      ...base.shortcutOverlay,
      ...(nextSystem.shortcutOverlay && typeof nextSystem.shortcutOverlay === "object" ? nextSystem.shortcutOverlay : {})
    },
    notifications: Array.isArray(nextSystem.notifications) ? nextSystem.notifications.slice(-40) : base.notifications,
    recent: Array.isArray(nextSystem.recent) ? nextSystem.recent.slice(0, 12) : base.recent
  };
}

function saveState() {
  const payload = JSON.stringify({ ...state, windows: [], sessionWindows: serializeSessionWindows() });
  localStorage.setItem(STORAGE_KEY, payload);
  idbSet("state", JSON.parse(payload)).catch(() => {});
}

function serializeSessionWindows() {
  return state.windows
    .filter((win) => !win.closed)
    .map((win) => sanitizeSessionWindow(win))
    .filter(Boolean)
    .sort((a, b) => a.z - b.z)
    .slice(-SESSION_WINDOW_LIMIT);
}

function sanitizeSessionWindow(win) {
  if (!win || typeof win !== "object") return null;
  const app = getApp(win.appId);
  if (!app) return null;
  const fallbackSize = defaultWindowSize(app);
  const viewportWidth = Math.max(420, window.innerWidth || 1280);
  const viewportHeight = Math.max(360, window.innerHeight || 860);
  const width = clamp(Number(win.w || win.width || fallbackSize.w), 320, Math.max(360, viewportWidth - 16));
  const height = clamp(Number(win.h || win.height || fallbackSize.h), 240, Math.max(280, viewportHeight - 72));
  const workspace = WORKSPACE_IDS.includes(String(win.workspace)) ? String(win.workspace) : "1";
  return {
    id: typeof win.id === "string" && /^win-\d+$/.test(win.id) ? win.id : "",
    appId: app.id,
    x: clamp(Number(win.x ?? 96), 4, Math.max(4, viewportWidth - width - 8)),
    y: clamp(Number(win.y ?? 72), 4, Math.max(4, viewportHeight - height - 56)),
    w: width,
    h: height,
    z: clamp(Number(win.z || 31), 31, 9999),
    minimized: Boolean(win.minimized),
    maximized: Boolean(win.maximized),
    fullscreen: Boolean(win.fullscreen),
    workspace,
    snap: ["left", "right"].includes(win.snap) ? win.snap : null
  };
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

function codeWorkspacePathToDesktopPath(path) {
  const normalized = normalizePath(path);
  if (normalized === CODE_WORKSPACE_ROOT) return DESKTOP_HOME;
  if (!normalized.startsWith(`${CODE_WORKSPACE_ROOT}/`)) return "";
  return normalizePath(`${DESKTOP_HOME}${normalized.slice(CODE_WORKSPACE_ROOT.length)}`);
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

function queueCodeWorkspaceSync(description, task) {
  codeWorkspaceSyncQueue = codeWorkspaceSyncQueue
    .then(task)
    .catch((error) => {
      log("system", `${description} skipped: ${error.message || error}`);
    });
  return codeWorkspaceSyncQueue;
}

function mirrorFileToCodeWorkspace(fileNode, source = "seis-desktop") {
  mirrorNodeToCodeWorkspace(fileNode, source);
}

function mirrorNodeToCodeWorkspace(fileNode, source = "seis-desktop") {
  if (!fileNode || !["file", "dir"].includes(fileNode.type)) return;
  const workspacePath = desktopPathToCodeWorkspacePath(fileNode.path);
  if (!workspacePath) return;

  queueCodeWorkspaceSync("SEIS Code workspace mirror", async () => {
    const database = await openCodeWorkspaceDatabase();
    if (!database) return;
    try {
      for (const folderPath of codeWorkspaceFoldersFor(workspacePath)) {
        await putCodeWorkspaceEntry(database, createCodeWorkspaceEntry(folderPath, "", "folder"));
      }
      const type = fileNode.type === "dir" ? "folder" : "file";
      await putCodeWorkspaceEntry(database, createCodeWorkspaceEntry(workspacePath, fileNode.content || "", type));
      notifyCodeWorkspace(workspacePath, source);
    } finally {
      database.close();
    }
  });
}

function removePathFromCodeWorkspace(desktopPath, source = "seis-desktop-remove") {
  const workspacePath = desktopPathToCodeWorkspacePath(desktopPath);
  if (!workspacePath) return;

  queueCodeWorkspaceSync("SEIS Code workspace removal", async () => {
    const database = await openCodeWorkspaceDatabase();
    if (!database) return;
    try {
      await new Promise((resolve, reject) => {
        const tx = database.transaction("files", "readwrite");
        tx.objectStore("files").delete(workspacePath);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      notifyCodeWorkspace(workspacePath, source);
    } finally {
      database.close();
    }
  });
}

function readCodeWorkspaceEntries(database) {
  return new Promise((resolve, reject) => {
    const tx = database.transaction("files", "readonly");
    const request = tx.objectStore("files").getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function syncDesktopFromCodeWorkspace(source = "seis-code-workspace") {
  const database = await openCodeWorkspaceDatabase();
  if (!database) return { imported: 0 };
  let imported = 0;
  try {
    const entries = await readCodeWorkspaceEntries(database);
    for (const entry of entries) {
      const desktopPath = codeWorkspacePathToDesktopPath(entry.path);
      if (!desktopPath || desktopPath === DESKTOP_HOME) continue;
      if (entry.type === "folder") {
        ensureDirectory(desktopPath);
      } else {
        ensureDirectory(dirName(desktopPath));
        const existing = getNode(desktopPath);
        const content = entry.content || "";
        if (existing) {
          if (existing.type !== "file") continue;
          if (existing.content === content) continue;
          existing.content = content;
          existing.updatedAt = entry.updatedAt || new Date().toISOString();
        } else {
          state.fs.push(file(desktopPath, content));
        }
      }
      imported += 1;
    }
  } finally {
    database.close();
  }
  if (imported) {
    log("vfs", `Imported ${imported} workspace item(s) from ${source}.`);
    saveState();
    renderOpenWindows("files");
    renderOpenWindows("terminal");
    renderOpenWindows("seis-code");
  }
  return { imported };
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
  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("dragstart", handleDragStart);
  document.addEventListener("dragover", handleDragOver);
  document.addEventListener("drop", handleDrop);
  commandInput.addEventListener("input", renderCommandResults);
  document.querySelector("[data-launcher-search]").addEventListener("input", renderLauncherApps);
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CODE_WORKSPACE_CHANNEL);
    channel.addEventListener("message", (event) => {
      const source = event.data?.source || "workspace";
      if (source.startsWith("seis-desktop")) return;
      if (event.data?.type === "workspace-file-created") {
        void syncDesktopFromCodeWorkspace(source);
      }
    });
  }
}

function handleClick(event) {
  const button = event.target.closest("button");
  if (!button) {
    closeContextMenu();
    return;
  }
  const insideContextMenu = button.closest("[data-context-menu]");
  const action = button.dataset.action;
  const windowAction = button.dataset.windowAction;
  if (windowAction) {
    closeContextMenu();
    handleWindowAction(button.closest(".app-window"), windowAction);
    return;
  }
  if (!action) {
    closeContextMenu();
    return;
  }
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
    case "open-demo-route":
      openDemoRoute(value);
      break;
    case "dismiss-demo-guide":
      dismissDemoGuide();
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
      toggleControlCenter();
      break;
    case "toggle-shortcuts":
      toggleShortcutOverlay("button");
      break;
    case "close-shortcuts":
      setShortcutOverlay(false);
      break;
    case "run-shortcut-command":
      executeShortcutCommand(value);
      break;
    case "toggle-theme":
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme();
      updateSystemIndicators();
      renderQuickStatus();
      log("settings", `Theme changed to ${state.theme}.`);
      addNotification("Theme Updated", `${state.theme} theme is active.`, "settings", { save: false });
      saveState();
      break;
    case "set-wallpaper":
      setWallpaper(value);
      break;
    case "copy-path":
      copyPathToClipboard(path || state.selectedPath);
      break;
    case "rename-file":
      renameSelectedFile(path || state.selectedPath);
      break;
    case "context-window-action":
      handleContextWindowAction(button.dataset.windowId, value);
      break;
    case "clear-notifications":
      clearNotifications();
      break;
    case "dismiss-notification":
      dismissNotification(value);
      break;
    case "set-os-profile":
      setOsProfile(value);
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
      if (path) state.selectedPath = path;
      deleteSelectedFile();
      break;
    case "export-file":
      if (path) state.selectedPath = path;
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
    case "set-search-tab":
      setSearchTab(value);
      break;
    case "code-ide-panel":
      selectCodeIdePanel(value);
      break;
    case "code-ide-open-file":
      openFileInCodeIde(path);
      break;
    case "code-ide-command":
      runCodeIdeCommand(value, button.closest(".window-body"));
      break;
    case "music-toggle":
      toggleMusicPlayback();
      break;
    case "music-next":
      nextMusicTrack();
      break;
    case "music-select":
      selectMusicTrack(value);
      break;
    case "store-install":
      installStoreItem(value);
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
    case "rotate-ai-core-orbit":
      rotateAiCoreOrbit();
      break;
    case "promote-ai-core-version":
      promoteAiCoreVersion();
      break;
    case "select-ai-core-version":
      selectAiCoreVersion(value);
      break;
    case "advance-subagent-quarter":
      advanceSubAgentQuarter();
      break;
    case "run-next-subagent-cycle":
      runNextSubAgentCycle();
      break;
    case "run-subagent-simulation":
      runSubAgentSimulation();
      break;
    case "reset-subagent-simulation":
      resetSubAgentSimulation();
      break;
    case "pulse-subagent-processes":
      pulseSubAgentProcesses();
      break;
    case "toggle-subagent-process":
      toggleSubAgentProcess(value);
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
    case "set-ai-tab":
      setAiAssistantTab(value);
      break;
    case "audit-installed-ai-systems":
      auditInstalledAiSystems();
      break;
    case "export-ai-core-resource-bridge":
      exportAiCoreResourceBridge();
      break;
    case "export-installed-ai-core-route-matrix":
      exportInstalledAiCoreRouteMatrix();
      break;
    case "export-personal-plugin-ai-core-lane-matrix":
      exportPersonalPluginAiCoreLaneMatrix();
      break;
    case "export-mcp-runtime-contract":
      exportMcpRuntimeContract();
      break;
    case "export-personal-plugin-bridge":
      exportPersonalPluginBridge();
      break;
    case "toggle-ai-plugin":
      toggleAiPlugin(value);
      break;
    case "open-route":
      window.location.href = value;
      break;
    case "toggle-network":
      toggleNetworkStatus();
      break;
    case "toggle-audio":
      toggleAudioStatus();
      break;
    default:
      toast("Action Recorded", action);
      log("ui", `Unhandled action recorded: ${action}`);
  }
  if (insideContextMenu) closeContextMenu();
}

function handleInput(event) {
  const input = event.target;
  if (input.matches("[data-code-editor]")) {
    input.dataset.dirty = "true";
  }
  if (input.matches("[data-code-ide-search-query]")) {
    getCodeIdeData().searchQuery = input.value;
  }
}

function handleGlobalKeys(event) {
  if (event.target?.matches?.("[data-terminal-input]") && event.key === "Enter") {
    event.preventDefault();
    submitTerminalInput(event.target);
    return;
  }
  const mod = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();
  if (mod && event.altKey && ["1", "2", "3"].includes(event.key)) {
    event.preventDefault();
    runKeyboardShortcut(`workspace-${event.key}`, () => setWorkspace(event.key));
    return;
  }
  if (mod && event.altKey && key === "t") {
    event.preventDefault();
    runKeyboardShortcut("open-terminal", () => openApp("terminal"));
    return;
  }
  if (mod && event.altKey && key === "f") {
    event.preventDefault();
    runKeyboardShortcut("open-files", () => openApp("files"));
    return;
  }
  if (mod && event.altKey && key === "n") {
    event.preventDefault();
    runKeyboardShortcut("open-notes", () => openApp("notes"));
    return;
  }
  if (mod && event.altKey && key === "s") {
    event.preventDefault();
    runKeyboardShortcut("open-settings", () => openApp("settings"));
    return;
  }
  if (mod && event.altKey && key === "c") {
    event.preventDefault();
    runKeyboardShortcut("toggle-control-center", () => setControlCenter(true));
    return;
  }
  if (mod && (event.key === "/" || event.code === "Slash")) {
    event.preventDefault();
    runKeyboardShortcut("toggle-shortcuts", () => toggleShortcutOverlay("keyboard"));
    return;
  }
  if (mod && event.code === "Space") {
    event.preventDefault();
    runKeyboardShortcut("toggle-launcher", () => toggleLauncher());
    return;
  }
  if (mod && key === "k") {
    event.preventDefault();
    runKeyboardShortcut("open-search", () => openCommandPalette());
    return;
  }
  if (event.key === "Escape") {
    setLauncher(false);
    setCommandPalette(false);
    setControlCenter(false);
    setShortcutOverlay(false);
  }
}

function setupClock() {
  const update = () => {
    const nextTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
    document.querySelectorAll("[data-clock]").forEach((clock) => {
      clock.textContent = nextTime;
    });
    if (!quickStatus.hidden) renderQuickStatus();
  };
  update();
  window.setInterval(update, 30_000);
}

function getSystemState() {
  state.system = normalizeSystemState(state.system);
  return state.system;
}

function updateSystemIndicators() {
  const system = getSystemState();
  const network = document.querySelector("[data-status-network]");
  const audio = document.querySelector("[data-status-audio]");
  const theme = document.querySelector("[data-status-theme]");
  const status = document.querySelector("[data-action=\"toggle-status\"]");
  if (network) {
    network.textContent = system.networkOnline ? "Wi-Fi" : "Offline";
    network.dataset.state = system.networkOnline ? "online" : "offline";
  }
  if (audio) {
    audio.textContent = system.audioMuted ? "Muted" : `${system.volume}%`;
    audio.dataset.state = system.audioMuted ? "muted" : "active";
  }
  if (theme) {
    theme.textContent = state.theme === "light" ? "Light" : "Dark";
    theme.dataset.state = state.theme;
  }
  if (status) status.setAttribute("aria-expanded", String(!quickStatus.hidden));
  const shortcuts = document.querySelector("[data-status-shortcuts]");
  if (shortcuts) shortcuts.setAttribute("aria-expanded", String(!shortcutOverlay.hidden));
}

function toggleControlCenter() {
  setControlCenter(quickStatus.hidden);
}

function setControlCenter(open) {
  quickStatus.hidden = !open;
  if (open) renderQuickStatus();
  updateSystemIndicators();
}

function runKeyboardShortcut(command, callback) {
  const system = getSystemState();
  system.shortcutOverlay.lastShortcut = command;
  callback();
  log("keyboard", `Shortcut executed: ${command}.`);
  saveState();
  renderShortcutOverlay();
}

function toggleShortcutOverlay(source = "button") {
  setShortcutOverlay(shortcutOverlay.hidden, source);
}

function setShortcutOverlay(open, source = "button") {
  if (!shortcutOverlay) return;
  shortcutOverlay.hidden = !open;
  if (open) {
    setLauncher(false);
    setCommandPalette(false);
    setControlCenter(false);
    const system = getSystemState();
    system.shortcutOverlay.opens = Number(system.shortcutOverlay.opens || 0) + 1;
    system.shortcutOverlay.lastOpened = new Date().toISOString();
    system.shortcutOverlay.lastShortcut = source === "keyboard" ? "toggle-shortcuts" : system.shortcutOverlay.lastShortcut;
    renderShortcutOverlay();
    log("keyboard", `Shortcut overlay opened by ${source}.`);
    saveState();
  }
  updateSystemIndicators();
}

function renderShortcutOverlay() {
  if (!shortcutOverlay) return;
  const system = getSystemState();
  const panel = shortcutOverlay.querySelector("[data-shortcut-panel]");
  if (!panel) return;
  panel.innerHTML = `<div class="shortcut-titlebar">
    <div>
      <h2 id="shortcut-title">Keyboard Shortcuts</h2>
      <p>Local browser desktop shortcuts. Host OS commands are not executed.</p>
    </div>
    <button type="button" class="icon-button" data-action="close-shortcuts" aria-label="Close keyboard shortcuts">×</button>
  </div>
  <div class="shortcut-stats" data-shortcut-stats>
    <article><strong>${KEYBOARD_SHORTCUT_GROUPS.reduce((total, group) => total + group.shortcuts.length, 0)}</strong><span>active shortcuts</span></article>
    <article><strong>${Number(system.shortcutOverlay.opens || 0)}</strong><span>overlay opens</span></article>
    <article><strong>${escapeHtml(system.shortcutOverlay.lastShortcut || "none")}</strong><span>last shortcut</span></article>
  </div>
  <div class="shortcut-grid" data-shortcut-grid>
    ${KEYBOARD_SHORTCUT_GROUPS.map((group) => `<section class="shortcut-group">
      <h3>${escapeHtml(group.name)}</h3>
      ${group.shortcuts.map((shortcut) => `<button type="button" class="shortcut-row" data-action="run-shortcut-command" data-value="${escapeAttr(shortcut.command)}">
        <kbd>${escapeHtml(shortcut.keys)}</kbd>
        <span>${escapeHtml(shortcut.action)}</span>
      </button>`).join("")}
    </section>`).join("")}
  </div>`;
}

function executeShortcutCommand(command) {
  const actions = {
    "toggle-shortcuts": () => toggleShortcutOverlay("overlay"),
    "open-search": () => openCommandPalette(),
    "toggle-launcher": () => toggleLauncher(),
    "close-overlays": () => {
      setLauncher(false);
      setCommandPalette(false);
      setControlCenter(false);
      setShortcutOverlay(false);
    },
    "open-terminal": () => openApp("terminal"),
    "open-files": () => openApp("files"),
    "open-notes": () => openApp("notes"),
    "open-settings": () => openApp("settings"),
    "toggle-control-center": () => setControlCenter(true),
    "workspace-1": () => setWorkspace("1"),
    "workspace-2": () => setWorkspace("2"),
    "workspace-3": () => setWorkspace("3")
  };
  const action = actions[command];
  if (!action) return;
  runKeyboardShortcut(command, action);
}

function setWallpaper(wallpaperId) {
  const selected = WALLPAPERS.find((item) => item.id === wallpaperId) || WALLPAPERS[0];
  state.wallpaper = selected.id;
  applyTheme();
  renderQuickStatus();
  renderOpenWindows("settings");
  log("settings", `Wallpaper changed to ${selected.name}.`);
  addNotification("Wallpaper Updated", `${selected.name} is active.`, "settings", { save: false });
  saveState();
}

function handleContextMenu(event) {
  const fileCard = event.target.closest("[data-file-card]");
  const windowNode = event.target.closest(".app-window");
  const appNode = event.target.closest("[data-context-app-id]");
  const canvas = event.target.closest("[data-desktop-canvas]");
  if (!fileCard && !windowNode && !appNode && !canvas) return;
  event.preventDefault();
  if (fileCard) {
    const path = fileCard.dataset.path;
    if (path) {
      state.selectedPath = path;
      openContextMenu("file", event, { path });
      return;
    }
  }
  if (windowNode) {
    activateWindow(windowNode.dataset.windowId);
    openContextMenu("window", event, { windowId: windowNode.dataset.windowId });
    return;
  }
  if (appNode?.dataset.contextAppId) {
    openContextMenu("app", event, { appId: appNode.dataset.contextAppId });
    return;
  }
  openContextMenu("desktop", event, { path: canvas?.dataset.dropPath || "/home/seis/Desktop" });
}

function openContextMenu(type, event, payload = {}) {
  if (!contextMenu) return;
  contextMenuState = { type, ...payload };
  contextMenu.innerHTML = renderContextMenu(type, payload);
  contextMenu.hidden = false;
  const menuWidth = 260;
  const menuHeight = Math.min(420, 70 + contextMenu.querySelectorAll("button").length * 42);
  contextMenu.style.left = `${clamp(event.clientX, 8, Math.max(8, window.innerWidth - menuWidth - 8))}px`;
  contextMenu.style.top = `${clamp(event.clientY, 8, Math.max(8, window.innerHeight - menuHeight - 8))}px`;
  log("ui", `Opened ${type} context menu.`);
}

function closeContextMenu() {
  if (!contextMenu || contextMenu.hidden) return;
  contextMenu.hidden = true;
  contextMenuState = null;
}

function renderContextMenu(type, payload) {
  const title = {
    desktop: "Desktop",
    file: baseName(payload.path || state.selectedPath || DESKTOP_HOME),
    window: getApp(state.windows.find((win) => win.id === payload.windowId)?.appId)?.name || "Window",
    app: getApp(payload.appId)?.name || "Application"
  }[type] || "Context";
  const body = type === "desktop"
    ? renderDesktopContextMenu()
    : type === "file"
      ? renderFileContextMenu(payload.path)
      : type === "window"
        ? renderWindowContextMenu(payload.windowId)
        : renderAppContextMenu(payload.appId);
  return `<div class="context-menu-card" role="menu" data-context-kind="${escapeAttr(type)}">
    <strong>${escapeHtml(title)}</strong>
    ${body}
  </div>`;
}

function renderDesktopContextMenu() {
  return `<button type="button" role="menuitem" data-action="toggle-launcher">Open Launcher</button>
    <button type="button" role="menuitem" data-action="open-search">Search Desktop</button>
    <button type="button" role="menuitem" data-action="new-file">New File</button>
    <button type="button" role="menuitem" data-action="new-folder">New Folder</button>
    <button type="button" role="menuitem" data-action="open-app" data-app-id="settings">Settings</button>
    <div class="context-menu-divider" role="separator"></div>
    ${WALLPAPERS.map((wallpaper) => `<button type="button" role="menuitem" data-action="set-wallpaper" data-value="${escapeAttr(wallpaper.id)}">
      <span>${escapeHtml(wallpaper.name)}</span><small>${escapeHtml(wallpaper.detail)}</small>
    </button>`).join("")}`;
}

function renderFileContextMenu(path) {
  const target = getNode(path || state.selectedPath);
  const normalized = target?.path || state.selectedPath || DESKTOP_HOME;
  return `<button type="button" role="menuitem" data-action="open-file" data-path="${escapeAttr(normalized)}">Open</button>
    <button type="button" role="menuitem" data-action="rename-file" data-path="${escapeAttr(normalized)}">Rename</button>
    <button type="button" role="menuitem" data-action="copy-path" data-path="${escapeAttr(normalized)}">Copy Path</button>
    ${target?.type === "file" ? `<button type="button" role="menuitem" data-action="export-file" data-path="${escapeAttr(normalized)}">Export</button>` : ""}
    <button type="button" role="menuitem" data-action="delete-file" data-path="${escapeAttr(normalized)}">Move to Trash</button>`;
}

function renderWindowContextMenu(windowId) {
  return `<button type="button" role="menuitem" data-action="context-window-action" data-window-id="${escapeAttr(windowId)}" data-value="fullscreen">Full Screen</button>
    <button type="button" role="menuitem" data-action="context-window-action" data-window-id="${escapeAttr(windowId)}" data-value="maximize">Maximize / Restore</button>
    <button type="button" role="menuitem" data-action="context-window-action" data-window-id="${escapeAttr(windowId)}" data-value="snap-left">Snap Left</button>
    <button type="button" role="menuitem" data-action="context-window-action" data-window-id="${escapeAttr(windowId)}" data-value="snap-right">Snap Right</button>
    <button type="button" role="menuitem" data-action="context-window-action" data-window-id="${escapeAttr(windowId)}" data-value="minimize">Minimize</button>
    <button type="button" role="menuitem" data-action="context-window-action" data-window-id="${escapeAttr(windowId)}" data-value="close">Close</button>`;
}

function renderAppContextMenu(appId) {
  const app = getApp(appId);
  return `<button type="button" role="menuitem" data-action="open-app" data-app-id="${escapeAttr(appId)}">Open ${escapeHtml(app?.name || "App")}</button>
    <button type="button" role="menuitem" data-action="open-search">Find Related</button>
    <button type="button" role="menuitem" data-action="open-app" data-app-id="app-center">Open App Center</button>`;
}

function handleContextWindowAction(windowId, action) {
  const win = state.windows.find((item) => item.id === windowId);
  if (!win) return;
  handleWindowAction(document.querySelector(`[data-window-id="${windowId}"]`), action);
}

function copyPathToClipboard(path) {
  const normalized = normalizePath(path || state.selectedPath || DESKTOP_HOME);
  const entries = getListData("clipboard-manager");
  entries.unshift({ id: `clip-${Date.now()}`, title: baseName(normalized), body: normalized, done: true });
  recordRecent({ type: "file", path: normalized, title: baseName(normalized) });
  toast("Path Copied", normalized);
  log("clipboard", `Copied ${normalized} into browser-local clipboard history.`);
  saveState();
  renderQuickStatus();
  renderOpenWindows("clipboard-manager");
}

function handleDragStart(event) {
  const source = event.target.closest("[data-drag-path]");
  if (!source) return;
  if (!event.dataTransfer) return;
  event.dataTransfer?.setData("text/seis-path", source.dataset.dragPath);
  event.dataTransfer?.setData("text/plain", source.dataset.dragPath);
  event.dataTransfer.effectAllowed = "move";
}

function handleDragOver(event) {
  const dropTarget = event.target.closest("[data-drop-path]");
  if (!dropTarget) return;
  const target = getNode(dropTarget.dataset.dropPath);
  if (!target || target.type !== "dir") return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
}

function handleDrop(event) {
  const dropTarget = event.target.closest("[data-drop-path]");
  if (!dropTarget) return;
  const sourcePath = event.dataTransfer?.getData("text/seis-path") || event.dataTransfer?.getData("text/plain");
  if (!sourcePath) return;
  event.preventDefault();
  try {
    const destination = moveNodePath(sourcePath, dropTarget.dataset.dropPath);
    state.selectedPath = destination;
    toast("File Moved", `${baseName(sourcePath)} moved to ${shortPath(dirName(destination))}.`);
    renderOpenWindows("files");
    renderOpenWindows("seis-code");
  } catch (error) {
    toast("Move Blocked", String(error.message || error), { scope: "fs" });
    log("fs", `Drag/drop blocked: ${error.message || error}.`);
  }
}

function toggleNetworkStatus() {
  const system = getSystemState();
  system.networkOnline = !system.networkOnline;
  const detail = system.networkOnline ? "Local demo network indicator is online." : "Local demo network indicator is offline.";
  log("system", detail);
  toast("Network Status", detail, { scope: "system" });
  updateSystemIndicators();
  renderQuickStatus();
  saveState();
}

function toggleAudioStatus() {
  const system = getSystemState();
  system.audioMuted = !system.audioMuted;
  const detail = system.audioMuted ? "Audio muted for local browser session." : `Audio restored at ${system.volume}%.`;
  log("system", detail);
  toast("Audio Status", detail, { scope: "system" });
  updateSystemIndicators();
  renderQuickStatus();
  saveState();
}

function addNotification(title, detail, scope = "system", options = {}) {
  const system = getSystemState();
  const item = {
    id: `notification-${Date.now()}-${system.notifications.length}`,
    title,
    detail,
    scope,
    time: new Date().toISOString(),
    read: false
  };
  system.notifications.unshift(item);
  system.notifications = system.notifications.slice(0, 40);
  renderQuickStatus();
  if (options.save !== false) saveState();
  return item;
}

function dismissNotification(id) {
  const system = getSystemState();
  system.notifications = system.notifications.filter((item) => item.id !== id);
  log("system", `Dismissed notification ${id}.`);
  renderQuickStatus();
  saveState();
}

function clearNotifications() {
  const system = getSystemState();
  system.notifications = [];
  log("system", "Notification Center cleared.");
  renderQuickStatus();
  saveState();
}

function recordRecent(item) {
  const system = getSystemState();
  const id = `${item.type}:${item.path || item.appId || item.title}`;
  system.recent = [
    { id, time: new Date().toISOString(), ...item },
    ...system.recent.filter((entry) => entry.id !== id)
  ].slice(0, 12);
  renderQuickStatus();
}

function renderQuickStatus() {
  if (!quickStatus) return;
  const system = getSystemState();
  const latestClipboard = Array.isArray(state.appData.clipboard) ? state.appData.clipboard[0] : null;
  const recentItems = system.recent.slice(0, 5);
  const notificationItems = system.notifications.slice(0, 6);
  const wallpaper = WALLPAPERS.find((item) => item.id === state.wallpaper) || WALLPAPERS[0];
  quickStatus.innerHTML = `<div class="quick-card control-center-panel" data-control-center>
    <header class="control-center-head">
      <div>
        <strong>Control Center</strong>
        <span>${escapeHtml(new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }))} · ${escapeHtml(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))}</span>
      </div>
      <button type="button" class="secondary-action" data-action="open-app" data-app-id="settings">Settings</button>
    </header>

    <div class="quick-toggle-grid" aria-label="Quick settings toggles">
      <button type="button" class="quick-toggle" data-action="toggle-network" data-state="${system.networkOnline ? "online" : "offline"}">
        <strong>Network</strong><span>${system.networkOnline ? "Wi-Fi local demo" : "Offline mode"}</span>
      </button>
      <button type="button" class="quick-toggle" data-action="toggle-audio" data-state="${system.audioMuted ? "muted" : "active"}">
        <strong>Audio</strong><span>${system.audioMuted ? "Muted" : `${system.volume}% output`}</span>
      </button>
      <button type="button" class="quick-toggle" data-action="toggle-theme" data-state="${escapeAttr(state.theme)}">
        <strong>Theme</strong><span>${state.theme === "light" ? "Light appearance" : "Dark appearance"}</span>
      </button>
      <button type="button" class="quick-toggle" data-action="open-app" data-app-id="settings">
        <strong>Wallpaper</strong><span>${escapeHtml(wallpaper.name)}</span>
      </button>
      <button type="button" class="quick-toggle" data-action="toggle-shortcuts">
        <strong>Shortcuts</strong><span>Keyboard overlay</span>
      </button>
      <button type="button" class="quick-toggle" data-action="open-app" data-app-id="system-monitor">
        <strong>Monitor</strong><span>${state.fs.length} VFS nodes</span>
      </button>
    </div>

    <section class="quick-section" aria-label="Notification Center">
      <div class="quick-section-head">
        <strong>Notifications</strong>
        <button type="button" data-action="clear-notifications">Clear</button>
      </div>
      <div class="notification-list" data-notification-list>
        ${notificationItems.map((item) => `<article class="notification-item" data-notification-id="${escapeAttr(item.id)}">
          <div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p><span>${escapeHtml(relativeTime(item.time))} · ${escapeHtml(item.scope)}</span></div>
          <button type="button" data-action="dismiss-notification" data-value="${escapeAttr(item.id)}" aria-label="Dismiss ${escapeAttr(item.title)}">×</button>
        </article>`).join("") || "<p class=\"muted\">No notifications.</p>"}
      </div>
    </section>

    <section class="quick-section" aria-label="Clipboard and recent activity">
      <div class="quick-meta-grid">
        <article>
          <strong>Clipboard</strong>
          <p>${latestClipboard ? escapeHtml(latestClipboard.body || latestClipboard.title) : "No clipboard items yet."}</p>
          <button type="button" data-action="open-app" data-app-id="clipboard-manager">Open Clipboard</button>
        </article>
        <article>
          <strong>Recents</strong>
          <div class="recent-list" data-recent-list>
            ${recentItems.map((item) => recentItemButton(item)).join("") || "<span class=\"muted\">No recent items.</span>"}
          </div>
        </article>
      </div>
    </section>
  </div>`;
}

function recentItemButton(item) {
  if (item.type === "file" && item.path) {
    return `<button type="button" data-action="open-file" data-path="${escapeAttr(item.path)}">${escapeHtml(item.title || baseName(item.path))}</button>`;
  }
  if (item.type === "app" && item.appId) {
    return `<button type="button" data-action="open-app" data-app-id="${escapeAttr(item.appId)}">${escapeHtml(item.title || item.appId)}</button>`;
  }
  return `<span>${escapeHtml(item.title || "Recent item")}</span>`;
}

function relativeTime(time) {
  const age = Date.now() - new Date(time).getTime();
  if (!Number.isFinite(age) || age < 0) return "now";
  if (age < 60_000) return "now";
  if (age < 3_600_000) return `${Math.floor(age / 60_000)}m ago`;
  if (age < 86_400_000) return `${Math.floor(age / 3_600_000)}h ago`;
  return `${Math.floor(age / 86_400_000)}d ago`;
}

function startDesktopAiCoreMap() {
  if (!desktopAiCoreCanvas) return;
  if (window.navigator.userAgent.toLowerCase().includes("jsdom")) {
    desktopAiCoreCanvas.dataset.aiCoreMiniMapReady = "true";
    desktopAiCoreCanvas.dataset.aiCoreMiniMapMode = "static";
    if (desktopAiCoreStatus) desktopAiCoreStatus.textContent = "Static SEIS AI Core map for local validation";
    return;
  }
  const context = desktopAiCoreCanvas.getContext("2d", { alpha: true });
  if (!context) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = [
    ["SEIS AI Core", "#f4f1e9", 0, 1.15],
    ["SEIS Code", "#75d6ff", 0.15, 0.86],
    ["SEIS Design", "#ffb85b", 1.1, 0.82],
    ["SEIS Cloud", "#63c6ba", 2.08, 0.84],
    ["SEIS Search", "#a78bfa", 3.12, 0.78],
    ["SSH Gate", "#f87171", 4.04, 0.74],
    ["5Y Agents", "#facc15", 5.08, 0.8]
  ];
  let frame = 0;

  const draw = () => {
    const rect = desktopAiCoreCanvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(360, Math.round(rect.width || desktopAiCoreCanvas.clientWidth || 720));
    const height = Math.max(176, Math.round(rect.height || desktopAiCoreCanvas.clientHeight || 280));
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (desktopAiCoreCanvas.width !== pixelWidth || desktopAiCoreCanvas.height !== pixelHeight) {
      desktopAiCoreCanvas.width = pixelWidth;
      desktopAiCoreCanvas.height = pixelHeight;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const centerX = width * 0.48;
    const centerY = height * 0.48;
    const spin = reduceMotion ? 0.7 : frame * 0.016;
    const orbitX = Math.min(width * 0.35, 240);
    const orbitY = Math.min(height * 0.24, 58);

    const background = context.createRadialGradient(centerX, centerY, 4, centerX, centerY, Math.max(width, height) * 0.52);
    background.addColorStop(0, "rgba(117, 214, 255, 0.26)");
    background.addColorStop(0.42, "rgba(99, 198, 186, 0.08)");
    background.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    for (let ring = 0; ring < 3; ring += 1) {
      context.save();
      context.translate(centerX, centerY);
      context.rotate((spin * 0.45) + ring * 0.38);
      context.scale(1, 0.34 + ring * 0.04);
      context.strokeStyle = `rgba(244, 241, 233, ${0.14 - ring * 0.025})`;
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(0, 0, orbitX * (0.62 + ring * 0.19), orbitY * (1.15 + ring * 0.12), 0, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }

    const plotted = nodes.map(([label, color, offset, size], index) => {
      if (index === 0) {
        return { label, color, x: centerX, y: centerY, depth: 1, radius: 22 * size };
      }
      const angle = spin + offset;
      const depth = (Math.sin(angle) + 1) / 2;
      return {
        label,
        color,
        x: centerX + Math.cos(angle) * orbitX * (0.74 + index * 0.015),
        y: centerY + Math.sin(angle) * orbitY - depth * 16,
        depth,
        radius: (10 + depth * 7) * size
      };
    }).sort((a, b) => a.depth - b.depth);

    const core = plotted.find((node) => node.label === "SEIS AI Core");
    for (const node of plotted) {
      if (!core || node === core) continue;
      context.strokeStyle = node.label === "SSH Gate" ? "rgba(248, 113, 113, 0.32)" : "rgba(117, 214, 255, 0.22)";
      context.lineWidth = 1 + node.depth;
      context.beginPath();
      context.moveTo(core.x, core.y);
      context.lineTo(node.x, node.y);
      context.stroke();
    }

    for (const node of plotted) {
      const glow = context.createRadialGradient(node.x, node.y, 1, node.x, node.y, node.radius * 2.8);
      glow.addColorStop(0, `${node.color}ee`);
      glow.addColorStop(0.24, `${node.color}55`);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(node.x, node.y, node.radius * 2.8, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = node.color;
      context.beginPath();
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = node.label === "SEIS AI Core" ? "#111719" : "rgba(5, 12, 22, 0.9)";
      context.font = node.label === "SEIS AI Core" ? "800 12px system-ui" : "800 10px system-ui";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(node.label === "SEIS AI Core" ? "AI" : node.label.split(" ")[1]?.slice(0, 3) || node.label.slice(0, 3), node.x, node.y);
    }

    context.fillStyle = "rgba(244, 241, 233, 0.78)";
    context.font = "800 11px system-ui";
    context.textAlign = "left";
    context.fillText("v0.1 -> v1.0 / local demo mesh", 14, 22);

    desktopAiCoreCanvas.dataset.aiCoreMiniMapReady = "true";
    desktopAiCoreCanvas.dataset.aiCoreMiniMapMode = reduceMotion ? "static" : "animated";
    if (desktopAiCoreStatus) {
      desktopAiCoreStatus.textContent = reduceMotion
        ? "Static SEIS AI Core map: Code, Design, Cloud, SSH, Search, Agents"
        : "Live local mesh: Code, Design, Cloud, SSH, Search, and 5Y agents";
    }

    frame += 1;
    if (!reduceMotion && document.contains(desktopAiCoreCanvas)) {
      window.requestAnimationFrame(draw);
    }
  };

  draw();
}

function renderDock() {
  dock.innerHTML = "";
  for (const id of FAVORITES) {
    const app = getApp(id);
    const button = createButton("dock-button", app.icon, "open-app");
    button.dataset.appId = id;
    button.dataset.contextAppId = id;
    button.title = app.name;
    button.setAttribute("aria-label", app.name);
    if (visibleWindows().some((win) => win.appId === id && !win.closed)) button.classList.add("is-open");
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
    button.dataset.contextAppId = id;
    button.innerHTML = `<span aria-hidden="true">${escapeHtml(app.icon)}</span><span>${escapeHtml(app.name)}</span>`;
    container.append(button);
  }
}

function renderLauncher() {
  const categories = ["All", ...new Set(APPS.map((app) => app.category))];
  const categoryButtons = categories.map((category) => (
    `<button type="button" class="launcher-category${category === launcherCategory ? " is-active" : ""}" data-action="set-category" data-value="${escapeAttr(category)}">${escapeHtml(category)}</button>`
  )).join("");
  launcherCategories.innerHTML = categoryButtons;
  if (launcherTabs) launcherTabs.innerHTML = categoryButtons;
  document.querySelector("[data-app-count]").textContent = APPS.length;
  document.querySelector("[data-open-count]").textContent = `${visibleWindows().length}/${state.windows.length}`;
  renderLauncherFrequentApps();
  renderLauncherApps();
}

function renderLauncherFrequentApps() {
  const system = getSystemState();
  const recentApps = system.recent.filter((item) => item.type === "app").map((item) => item.appId);
  const frequentIds = [...new Set([...recentApps, ...FAVORITES])].filter(Boolean).slice(0, 8);
  launcherFrequent.innerHTML = `<div class="launcher-frequent-title">Frequently used</div>
    <div class="launcher-frequent-row">
      ${frequentIds.map((id) => {
        const app = getApp(id);
        return app ? `<button type="button" class="launcher-frequent-app" data-action="open-app" data-app-id="${escapeAttr(app.id)}">
          <span class="launcher-app-icon" aria-hidden="true">${escapeHtml(app.icon)}</span>
          <span>${escapeHtml(app.name)}</span>
        </button>` : "";
      }).join("")}
    </div>`;
}

function renderLauncherApps() {
  const query = document.querySelector("[data-launcher-search]").value.trim().toLowerCase();
  const visible = APPS.filter((app) => {
    const inCategory = launcherCategory === "All" || app.category === launcherCategory;
    const inQuery = !query || `${app.name} ${app.category} ${app.description}`.toLowerCase().includes(query);
    return inCategory && inQuery;
  });
  launcherGrid.innerHTML = [
    ...visible.map((app) => (
    `<button type="button" class="launcher-app" data-action="open-app" data-app-id="${app.id}">
      <span class="launcher-app-icon" aria-hidden="true">${escapeHtml(app.icon)}</span>
      <span>${escapeHtml(app.name)}</span>
    </button>`
    )),
    renderLauncherRoutes(query)
  ].join("");
}

function routeMatches(route, query) {
  if (!query) return DEMO_DEFAULT_ROUTE_IDS.includes(route.id);
  return `${route.label} ${route.kind} ${route.path} ${route.keywords}`.toLowerCase().includes(query);
}

function renderLauncherRoutes(query) {
  const routes = DEMO_ROUTES.filter((route) => routeMatches(route, query)).slice(0, 10);
  if (!routes.length) return "";
  return `<div class="launcher-route-group" data-demo-route-group>
    ${routes.map((route) => `<button type="button" class="launcher-route" data-action="open-demo-route" data-value="${escapeAttr(route.id)}">
      <span>${escapeHtml(route.label)}</span>
      <small>${escapeHtml(route.kind)} · ${escapeHtml(route.path)}</small>
    </button>`).join("")}
  </div>`;
}

function renderTaskbar() {
  const taskbar = document.querySelector("[data-taskbar-windows]");
  const windows = visibleWindows();
  taskbar.innerHTML = windows.map((win) => {
    const app = getApp(win.appId);
    return `<button type="button" class="taskbar-app${win.id === activeWindowId ? " is-active" : ""}" data-action="activate-window" data-value="${win.id}">
      <span aria-hidden="true">${escapeHtml(app.icon)}</span><span>${escapeHtml(app.name)}</span>
    </button>`;
  }).join("");
  renderDock();
  document.querySelector("[data-open-count]").textContent = `${windows.length}/${state.windows.length}`;
}

function restoreStartupApps() {
  if (restoreSessionWindows()) return;
  for (const appId of state.startupApps.slice(0, 4)) openApp(appId, { quiet: true });
  applyReferenceStartupLayout({ minimized: true });
}

function applyReferenceStartupLayout(options = {}) {
  if (window.innerWidth < 900 || !layer) return;
  const canvasWidth = Math.max(900, layer.clientWidth || window.innerWidth - 84);
  const dockClearance = 94;
  const canvasHeight = Math.max(520, (layer.clientHeight || window.innerHeight - 92) - dockClearance);
  const margin = 24;
  const gap = 20;
  const top = 28;
  const leftWidth = Math.min(560, Math.max(420, Math.floor((canvasWidth - margin * 2 - gap) * 0.44)));
  const rightX = margin + leftWidth + gap;
  const rightWidth = Math.max(430, canvasWidth - margin * 2 - gap - leftWidth);
  const topHeight = Math.min(360, Math.max(260, Math.floor((canvasHeight - top - gap - 28) * 0.53)));
  const bottomY = top + topHeight + gap;
  const bottomHeight = Math.max(210, canvasHeight - bottomY - 28);
  const frames = {
    files: { x: margin, y: top, w: leftWidth, h: topHeight },
    "browser-portal": { x: margin, y: bottomY, w: leftWidth, h: bottomHeight },
    "seis-code": { x: rightX, y: top, w: rightWidth, h: Math.min(canvasHeight - top - 28, topHeight + 80) },
    terminal: { x: rightX, y: bottomY + Math.min(42, Math.max(0, bottomHeight * 0.12)), w: Math.min(rightWidth, 560), h: Math.max(200, bottomHeight - 24) }
  };

  for (const [appId, frame] of Object.entries(frames)) {
    const win = state.windows.find((item) => item.appId === appId && ensureWindowWorkspace(item) === currentWorkspace());
    if (!win) continue;
    Object.assign(win, frame, { maximized: false, fullscreen: false, minimized: Boolean(options.minimized), snap: null });
    win.z = ++state.z;
    renderWindow(win);
  }
  activeWindowId = options.minimized
    ? null
    : state.windows.find((item) => item.appId === "terminal" && ensureWindowWorkspace(item) === currentWorkspace())?.id || activeWindowId;
  renderTaskbar();
  saveState();
}

function restoreSessionWindows() {
  const snapshots = Array.isArray(state.sessionWindows)
    ? state.sessionWindows.map((win) => sanitizeSessionWindow(win)).filter(Boolean)
    : [];
  if (!snapshots.length) return false;

  let maxWindowNumber = 0;
  let maxZ = Number(state.z || 30);
  state.windows = snapshots.map((snapshot, index) => {
    const idNumber = Number(snapshot.id.replace("win-", ""));
    if (Number.isFinite(idNumber)) maxWindowNumber = Math.max(maxWindowNumber, idNumber);
    maxZ = Math.max(maxZ, snapshot.z);
    return {
      ...snapshot,
      id: snapshot.id || `win-${state.nextWindow + index}`
    };
  });
  state.nextWindow = Math.max(Number(state.nextWindow || 1), maxWindowNumber + 1, state.windows.length + 1);
  state.z = maxZ;
  activeWindowId = visibleWindows()
    .filter((win) => !win.minimized)
    .sort((a, b) => a.z - b.z)
    .at(-1)?.id || visibleWindows().at(-1)?.id || null;
  for (const win of state.windows) renderWindow(win);
  renderTaskbar();
  log("session", `Restored ${state.windows.length} browser-local window${state.windows.length === 1 ? "" : "s"}.`);
  return true;
}

function openApp(appId, options = {}) {
  const app = getApp(appId);
  if (!app) return;
  setLauncher(false);
  setCommandPalette(false);

  const workspace = currentWorkspace();
  const existing = state.windows.find((win) => win.appId === appId && ensureWindowWorkspace(win) === workspace && !win.closed);
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
    maximized: window.innerWidth < 900,
    fullscreen: false,
    workspace,
    snap: null
  };
  state.windows.push(win);
  renderWindow(win);
  activateWindow(win.id);
  renderTaskbar();
  log("app", `Opened ${app.name}.`);
  if (!options.quiet) {
    recordRecent({ type: "app", appId, title: app.name });
    toast(app.name, "Application opened.", { scope: "app" });
  }
  saveState();
}

function defaultWindowSize(app) {
  if (app.type === "terminal") return { w: 760, h: 420 };
  if (app.type === "files" || app.type === "code") return { w: 880, h: 560 };
  if (app.type === "search") return { w: 1000, h: 650 };
  if (app.type === "system-os") return { w: 1120, h: 700 };
  if (app.type === "seis-command-center") return { w: 1120, h: 700 };
  if (app.type === "seis-website") return { w: 1040, h: 660 };
  if (app.type === "seis-evolution") return { w: 1040, h: 660 };
  if (app.type === "subagent-control") return { w: 920, h: 610 };
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
    node.querySelector("[data-window-resize-handle]")?.addEventListener("pointerdown", (event) => startResize(event, win.id));
    node.addEventListener("pointerdown", () => activateWindow(win.id));
    layer.append(node);
  }
  node.classList.toggle("is-maximized", Boolean(win.maximized));
  node.classList.toggle("is-fullscreen", Boolean(win.fullscreen));
  node.classList.toggle("is-minimized", Boolean(win.minimized));
  node.classList.toggle("is-workspace-hidden", !isWindowInActiveWorkspace(win));
  node.hidden = !isWindowInActiveWorkspace(win);
  node.dataset.appId = win.appId;
  node.dataset.workspace = ensureWindowWorkspace(win);
  node.dataset.snap = win.snap || "";
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
  if (!isWindowInActiveWorkspace(win)) {
    state.workspace = ensureWindowWorkspace(win);
    updateWorkspaceControls();
    renderOpenWindows();
  }
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
  activeWindowId = visibleWindows().at(-1)?.id || null;
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
  if (action === "snap-left" || action === "snap-right") {
    snapWindow(win, action === "snap-left" ? "left" : "right");
  }
  if (action === "fullscreen") {
    win.fullscreen = !win.fullscreen;
    win.maximized = false;
    win.minimized = false;
    win.snap = null;
  }
  if (action === "maximize") {
    win.maximized = !win.maximized;
    win.fullscreen = false;
    win.snap = null;
  }
  renderWindow(win);
  renderTaskbar();
  saveState();
}

function snapWindow(win, side) {
  const gap = 8;
  const layerWidth = Math.max(720, layer.clientWidth || window.innerWidth);
  const layerHeight = Math.max(420, layer.clientHeight || window.innerHeight - 88);
  const snappedWidth = Math.max(360, Math.floor((layerWidth - gap * 3) / 2));
  win.x = side === "right" ? gap * 2 + snappedWidth : gap;
  win.y = gap;
  win.w = snappedWidth;
  win.h = Math.max(320, layerHeight - gap * 2);
  win.maximized = false;
  win.fullscreen = false;
  win.minimized = false;
  win.snap = side;
}

function startDrag(event, windowId) {
  const win = state.windows.find((item) => item.id === windowId);
  if (!win || win.maximized || win.fullscreen || event.target.closest("button")) return;
  event.preventDefault();
  activateWindow(windowId);
  const startX = event.clientX;
  const startY = event.clientY;
  const originX = win.x;
  const originY = win.y;
  win.snap = null;
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

function startResize(event, windowId) {
  const win = state.windows.find((item) => item.id === windowId);
  if (!win || win.maximized || win.fullscreen) return;
  event.preventDefault();
  event.stopPropagation();
  activateWindow(windowId);
  const startX = event.clientX;
  const startY = event.clientY;
  const originW = win.w;
  const originH = win.h;
  win.snap = null;
  const minW = Math.min(384, Math.max(320, window.innerWidth - 32));
  const minH = 256;
  const move = (moveEvent) => {
    win.w = clamp(originW + moveEvent.clientX - startX, minW, Math.max(minW, window.innerWidth - win.x - 8));
    win.h = clamp(originH + moveEvent.clientY - startY, minH, Math.max(minH, window.innerHeight - win.y - 56));
    const node = document.querySelector(`[data-window-id="${windowId}"]`);
    if (node) {
      node.style.width = `${win.w}px`;
      node.style.height = `${win.h}px`;
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
    case "code-ide":
      return renderCodeIdeApp();
    case "settings":
      return renderSettings();
    case "launchpad":
      return renderLaunchpadApp();
    case "system-os":
      return renderSeisSystemOSApp();
    case "seis-command-center":
      return renderSeisCommandCenter();
    case "store":
      return renderSeisStore();
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
    case "music":
      return renderMusicApp();
    case "gacha":
      return renderGacha();
    case "bestiary":
      return renderBestiary();
    case "ai":
      return renderAssistant();
    case "search":
      return renderSeisSearchGateway();
    case "seis-website":
      return renderSeisWebsiteApp();
    case "wow-gallery":
      return renderWowGalleryApp();
    case "seis-design":
      return renderSeisDesign();
    case "seis-cloud":
      return renderSeisCloud();
    case "seis-evolution":
      return renderSeisEvolution();
    case "subagent-control":
      return renderSubAgentControl();
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
        <button type="button" data-action="app-primary" data-app-id="files">Create File Index</button>
        <button type="button" data-action="new-file">New File</button>
        <button type="button" data-action="new-folder">New Folder</button>
        <button type="button" data-action="open-file">Open</button>
        <button type="button" data-action="export-file">Export</button>
        <button type="button" data-action="delete-file">Move to Trash</button>
      </div>
      <p class="status-note">Path: ${escapeHtml(state.currentDir)} · Selected: ${escapeHtml(selected?.path || "none")}</p>
      <div class="file-grid" data-file-grid>
        ${items.map((item) => `<button type="button" class="file-card${item.path === state.selectedPath ? " is-active" : ""}" data-file-card data-action="select-file" data-path="${escapeAttr(item.path)}" data-drag-path="${escapeAttr(item.path)}"${item.type === "dir" ? ` data-drop-path="${escapeAttr(item.path)}"` : ""} draggable="true">
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
  const wallpaper = WALLPAPERS.find((item) => item.id === state.wallpaper) || WALLPAPERS[0];
  return `<div class="app-layout">
    <aside class="app-sidebar">
      ${sections.map((section) => `<button type="button" class="${section === active ? "is-active" : ""}" data-action="settings-tab" data-value="${escapeAttr(section)}">${escapeHtml(section)}</button>`).join("")}
    </aside>
    <section class="app-main">
      <div class="toolbar">
        <button type="button" data-action="app-primary" data-app-id="settings">Save Settings Snapshot</button>
        <button type="button" data-action="toggle-theme">Toggle Theme</button>
        <button type="button" data-action="generic-new" data-app-id="settings">Add Preference</button>
        <button type="button" data-action="generic-export" data-app-id="settings">Export Settings</button>
      </div>
      <div class="metric-grid">
        <article class="metric-card"><strong>Section</strong><p>${escapeHtml(active)}</p></article>
        <article class="metric-card"><strong>Theme</strong><p>${escapeHtml(state.theme)}</p></article>
        <article class="metric-card"><strong>Wallpaper</strong><p>${escapeHtml(wallpaper.name)}</p></article>
        <article class="metric-card"><strong>Workspace</strong><p>${escapeHtml(state.workspace)}</p></article>
        <article class="metric-card"><strong>Persistence</strong><p>${db ? "IndexedDB + localStorage" : "localStorage fallback"}</p></article>
        <article class="metric-card"><strong>Cloud keys</strong><p>None required for core desktop</p></article>
      </div>
      <div class="wallpaper-picker" data-wallpaper-picker>
        ${WALLPAPERS.map((item) => `<button type="button" class="wallpaper-choice${item.id === state.wallpaper ? " is-active" : ""}" data-action="set-wallpaper" data-value="${escapeAttr(item.id)}" aria-pressed="${item.id === state.wallpaper}">
          <span data-wallpaper-preview="${escapeAttr(item.id)}"></span>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.detail)}</small>
        </button>`).join("")}
      </div>
    </section>
  </div>`;
}

function renderAppCenter() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="app-center">Audit Catalog</button>
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
      <button type="button" data-action="app-primary" data-app-id="extensions">Audit Extensions</button>
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
      <button type="button" data-action="pulse-subagent-processes">Pulse Agent Processes</button>
      <button type="button" data-action="generic-export" data-app-id="system-monitor">Export Metrics</button>
    </div>
    <div class="metric-grid">
      ${metrics.map((metric) => `<article class="metric-card">
        <strong>${escapeHtml(metric.label)}</strong>
        <p>${escapeHtml(metric.value)}</p>
        <div class="progress-track"><div class="progress-fill" style="width:${metric.percent}%"></div></div>
      </article>`).join("")}
    </div>
    ${renderSubAgentProcessPanel("system-monitor")}
  </section>`;
}

function renderTaskManager() {
  return `<section class="app-main">
    <div class="toolbar">
      <button type="button" data-action="generic-new" data-app-id="task-manager">Snapshot</button>
      <button type="button" data-action="open-app" data-app-id="system-logs">Logs</button>
      <button type="button" data-action="pulse-subagent-processes">Pulse Agent Processes</button>
      <button type="button" data-action="generic-export" data-app-id="task-manager">Export Tasks</button>
    </div>
    <table class="data-table">
      <thead><tr><th>App</th><th>Window</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${state.windows.map((win) => {
        const app = getApp(win.appId);
        return `<tr><td>${escapeHtml(app.name)}</td><td>${escapeHtml(win.id)}</td><td>${win.minimized ? "Minimized" : "Running"}</td><td><button type="button" class="secondary-action" data-action="task-stop" data-value="${win.id}">Stop</button></td></tr>`;
      }).join("")}</tbody>
    </table>
    ${renderSubAgentProcessPanel("task-manager")}
  </section>`;
}

function renderSubAgentProcessPanel(source) {
  const processes = getSubAgentProcesses();
  const processState = getSubAgentProcessState();
  return `<section class="subagent-panel agent-process-panel" data-subagent-process-monitor data-source="${escapeAttr(source)}">
    <div class="panel-heading-row">
      <div>
        <h3>Managed Sub-Agent Processes</h3>
        <p class="status-note">Browser-local process supervision only. These controls do not grant background write, SSH, deployment, provider, or GitHub authority.</p>
      </div>
      <strong>${processes.filter((process) => process.status !== "Suspended").length}/${processes.length} active</strong>
    </div>
    <table class="data-table agent-process-table">
      <thead><tr><th>PID</th><th>Agent</th><th>Status</th><th>CPU</th><th>Memory</th><th>Permission</th><th>Action</th></tr></thead>
      <tbody>${processes.map((process) => `<tr data-subagent-process="${escapeAttr(process.laneId)}">
        <td>${process.pid}</td>
        <td><strong>${escapeHtml(process.name)}</strong><br><span class="muted">${escapeHtml(process.scope)}</span></td>
        <td>${escapeHtml(process.status)}${process.activeQuarter ? " · active quarter" : ""}</td>
        <td>${process.cpu}%</td>
        <td>${escapeHtml(process.memory)}</td>
        <td>${escapeHtml(process.permission)}</td>
        <td><button type="button" class="secondary-action" data-action="toggle-subagent-process" data-value="${escapeAttr(process.laneId)}">${process.status === "Suspended" ? "Resume" : "Suspend"}</button></td>
      </tr>`).join("")}</tbody>
    </table>
    <p class="status-note">Pulses: ${processState.pulseCount}. Last pulse: ${processState.lastPulse || "not recorded"}. Ledger path: /home/seis/Documents/sub-agent-process-ledger.md.</p>
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
    search: "Save Search Snapshot",
    launchpad: "Save Layout",
    "system-os": "Save OS Blueprint",
    "seis-command-center": "Save V17 Snapshot",
    "seis-website": "Save Website Map",
    store: "Audit Store",
    music: "Save Playlist",
    "code-ide": "Save IDE Session",
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
    "video-gallery": "Save Favorite",
    "seis-design": "Save Design Handoff",
    "seis-cloud": "Run Local Preflight",
    "subagent-control": "Run Dry-Run Check"
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

function renderLaunchpadApp() {
  const categories = [...new Set(APPS.map((app) => app.category))];
  const featuredIds = ["seis-code", "code-ide", "search", "seis-design", "seis-cloud", "seis-store", "music", "ai-assistant", "video-hero-gallery", "mythic-gacha"];
  const featured = featuredIds.map(getApp).filter(Boolean);
  return `<section class="app-main launchpad-app" data-launchpad-app>
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="launchpad">Save Layout</button>
      <button type="button" data-action="open-search">Open SEIS Search</button>
      <button type="button" data-action="open-app" data-app-id="seis-store">Open SEIS Store</button>
      <button type="button" data-action="open-app" data-app-id="code-ide">Open Code IDE</button>
      <button type="button" data-action="generic-export" data-app-id="launchpad">Export Layout</button>
    </div>
    <p class="status-note">Launchpad is a full-window app launcher for the Linux/macOS/Windows-like SEIS desktop. Every app tile opens a real local demo surface.</p>
    <div class="metric-grid">
      <article class="metric-card"><strong>Total Apps</strong><p>${APPS.length}</p></article>
      <article class="metric-card"><strong>Featured</strong><p>${featured.length}</p></article>
      <article class="metric-card"><strong>Websites</strong><p>${DEMO_ROUTES.filter((route) => route.kind === "Website" || route.kind === "Playable route" || route.kind === "Full-page IDE").length}</p></article>
      <article class="metric-card"><strong>Mode</strong><p>Local + IndexedDB</p></article>
    </div>
    <section class="launchpad-featured" aria-label="Featured SEIS apps">
      ${featured.map((app) => `<button type="button" class="launchpad-feature-card" data-action="open-app" data-app-id="${escapeAttr(app.id)}">
        <span>${escapeHtml(app.icon)}</span>
        <strong>${escapeHtml(app.name)}</strong>
        <small>${escapeHtml(app.category)}</small>
      </button>`).join("")}
    </section>
    <section class="launchpad-section">
      <h3>Categories</h3>
      <div class="launchpad-category-strip">
        ${categories.map((category) => `<article>
          <strong>${escapeHtml(category)}</strong>
          <span>${APPS.filter((app) => app.category === category).length} apps</span>
        </article>`).join("")}
      </div>
    </section>
    <section class="launchpad-section">
      <h3>All Applications</h3>
      <div class="launchpad-grid">
        ${APPS.map((app) => `<button type="button" class="launchpad-card" data-action="open-app" data-app-id="${escapeAttr(app.id)}">
          <span class="launchpad-card-icon">${escapeHtml(app.icon)}</span>
          <strong>${escapeHtml(app.name)}</strong>
          <small>${escapeHtml(app.category)}</small>
        </button>`).join("")}
      </div>
    </section>
  </section>`;
}

function renderSeisStore() {
  const data = getAppData("seis-store");
  const installed = new Set(Array.isArray(data.installed) ? data.installed : []);
  return `<section class="app-main seis-store-app" data-seis-store-app>
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="seis-store">Audit Store</button>
      <button type="button" data-action="open-app" data-app-id="launchpad">Open Launchpad</button>
      <button type="button" data-action="open-app" data-app-id="extensions">Open Extensions</button>
      <button type="button" data-action="open-app" data-app-id="search">Open Search</button>
      <button type="button" data-action="generic-export" data-app-id="seis-store">Export Catalog</button>
    </div>
    <p class="status-note">SEIS Store is an App Store/Microsoft Store-style local catalog. It records installs in browser state only; it does not download packages, install dependencies, or call external services.</p>
    <div class="metric-grid">
      <article class="metric-card"><strong>Catalog Items</strong><p>${SEIS_STORE_ITEMS.length}</p></article>
      <article class="metric-card"><strong>Installed</strong><p>${installed.size}</p></article>
      <article class="metric-card"><strong>Routes</strong><p>${SEIS_STORE_ITEMS.filter((item) => item.target === "route").length}</p></article>
      <article class="metric-card"><strong>Last Install</strong><p>${data.lastInstall || "None this session"}</p></article>
    </div>
    <div class="store-grid">
      ${SEIS_STORE_ITEMS.map((item) => {
        const isInstalled = installed.has(item.id) || item.status === "Installed";
        return `<article class="store-card">
          <div>
            <span class="store-status ${isInstalled ? "is-installed" : "is-available"}">${isInstalled ? "Installed" : "Available"}</span>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.category)}</small>
          </div>
          <p>${escapeHtml(item.detail)}</p>
          <div class="store-card-actions">
            ${item.target === "app"
              ? `<button type="button" class="secondary-action" data-action="open-app" data-app-id="${escapeAttr(item.targetId)}">Open</button>`
              : `<button type="button" class="secondary-action" data-action="open-demo-route" data-value="${escapeAttr(item.targetId)}">Open Route</button>`}
            <button type="button" class="secondary-action" data-action="store-install" data-value="${escapeAttr(item.id)}">${isInstalled ? "Record Install" : "Install Local"}</button>
          </div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderMusicApp() {
  const data = getAppData("music");
  const activeTrack = SEIS_MUSIC_TRACKS.find((track) => track.id === data.trackId) || SEIS_MUSIC_TRACKS[0];
  const playlist = Array.isArray(data.playlist) ? data.playlist : SEIS_MUSIC_TRACKS.map((track) => track.id);
  const playlistTracks = playlist.map((id) => SEIS_MUSIC_TRACKS.find((track) => track.id === id)).filter(Boolean);
  return `<section class="app-main music-app" data-music-app>
    <div class="toolbar">
      <button type="button" data-action="music-toggle">${data.playing ? "Pause" : "Play"}</button>
      <button type="button" data-action="music-next">Next</button>
      <button type="button" data-action="app-primary" data-app-id="music">Save Playlist</button>
      <button type="button" data-action="open-app" data-app-id="launchpad">Launchpad</button>
      <button type="button" data-action="generic-export" data-app-id="music">Export Music State</button>
    </div>
    <div class="music-hero">
      <div class="music-orb ${data.playing ? "is-playing" : ""}" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div class="music-now">
        <span>Now playing</span>
        <h3>${escapeHtml(activeTrack.title)}</h3>
        <p>${escapeHtml(activeTrack.artist)} · ${escapeHtml(activeTrack.mood)}</p>
        <div class="music-bars" aria-hidden="true">${Array.from({ length: 18 }, (_, index) => `<i style="--bar-index:${index}"></i>`).join("")}</div>
      </div>
      <div class="music-meta">
        <strong>${escapeHtml(activeTrack.duration)}</strong>
        <small>${escapeHtml(activeTrack.lane)}</small>
        <span>${data.playing ? "Playing local demo track" : "Paused"}</span>
      </div>
    </div>
    <section class="music-section">
      <h3>SEIS Demo Playlist</h3>
      <div class="music-track-list">
        ${playlistTracks.map((track) => `<button type="button" class="music-track-button ${track.id === activeTrack.id ? "is-active" : ""}" data-action="music-select" data-value="${escapeAttr(track.id)}">
          <span>${escapeHtml(track.title)}</span>
          <small>${escapeHtml(track.artist)} · ${escapeHtml(track.duration)}</small>
          <em>${escapeHtml(track.mood)}</em>
        </button>`).join("")}
      </div>
    </section>
  </section>`;
}

function getCodeIdeData() {
  const data = getAppData("code-ide");
  if (!CODE_IDE_PANELS.some((panel) => panel.id === data.activePanel)) data.activePanel = "explorer";
  if (typeof data.searchQuery !== "string") data.searchQuery = "SEIS";
  if (!Array.isArray(data.commandHistory)) data.commandHistory = [];
  data.sourceControlMode = data.sourceControlMode || "Safe Mock";
  data.assistantMode = data.assistantMode || "Local Demo";
  data.assistantNote = data.assistantNote || "Local demo assistant is ready. It does not call external providers.";
  data.previewMode = data.previewMode || "Browser-local preview";
  return data;
}

function getCodeIdeFiles() {
  return state.fs
    .filter((item) => item.type === "file" && !item.trashed && ["/home/seis/Projects", "/home/seis/Documents"].some((rootPath) => item.path.startsWith(rootPath)))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function getCodeIdeSearchResults(data, files) {
  const query = String(data.searchQuery || "").trim().toLowerCase();
  if (!query) return [];
  return files
    .filter((item) => `${item.path}\n${item.content || ""}`.toLowerCase().includes(query))
    .slice(0, 8)
    .map((item) => ({
      path: item.path,
      title: baseName(item.path),
      excerpt: String(item.content || item.path).replace(/\s+/g, " ").slice(0, 120)
    }));
}

function rememberCodeIdeCommand(command) {
  const data = getCodeIdeData();
  data.commandHistory.unshift({ id: `cmd-${Date.now()}`, command, time: new Date().toLocaleTimeString() });
  data.commandHistory = data.commandHistory.slice(0, 8);
  data.lastCommand = command;
}

function selectCodeIdePanel(panelId) {
  const panel = CODE_IDE_PANELS.find((item) => item.id === panelId) || CODE_IDE_PANELS[0];
  getCodeIdeData().activePanel = panel.id;
  rememberCodeIdeCommand(`Open ${panel.label}`);
  log("code-ide", `Panel selected: ${panel.label}.`);
  saveState();
  renderOpenWindows("code-ide");
}

function setSearchTab(tab) {
  const activeTab = SEIS_SEARCH_TABS.includes(tab) ? tab : "AI";
  const data = getAppData("search");
  data.activeTab = activeTab;
  data.lastAction = `Selected ${activeTab} search results.`;
  log("search", data.lastAction);
  saveState();
  renderOpenWindows("search");
}

function openFileInCodeIde(path) {
  const target = getNode(path);
  if (!target || target.type !== "file") return;
  state.codePath = target.path;
  state.selectedPath = target.path;
  getCodeIdeData().activePanel = "explorer";
  rememberCodeIdeCommand(`Open ${baseName(target.path)}`);
  recordRecent({ type: "file", path: target.path, title: baseName(target.path) });
  saveState();
  renderOpenWindows("code-ide");
}

function buildCodeIdeAssistantNote(active) {
  const name = active ? baseName(active.path) : "no active file";
  const lines = active?.content ? active.content.split("\n").length : 0;
  return `Local Demo review for ${name}: check naming, keep provider secrets out of browser code, add focused validation, and preserve mock/planned labels. Lines inspected: ${lines}.`;
}

function runCodeIdeCommand(commandId, body) {
  const data = getCodeIdeData();
  const active = getNode(state.codePath);
  if (commandId === "palette") {
    rememberCodeIdeCommand("Open command palette");
    saveState();
    openCommandPalette();
    return;
  }
  if (commandId === "search") {
    const query = body?.querySelector("[data-code-ide-search-query]")?.value?.trim() || data.searchQuery || "SEIS";
    data.searchQuery = query;
    data.activePanel = "search";
    rememberCodeIdeCommand(`Search ${query}`);
  } else if (commandId === "source-review") {
    data.activePanel = "source-control";
    rememberCodeIdeCommand("Source review safe mock");
  } else if (commandId === "preview") {
    data.activePanel = "preview";
    rememberCodeIdeCommand("Preview active file");
  } else if (commandId === "assistant-review") {
    data.activePanel = "assistant";
    data.assistantNote = buildCodeIdeAssistantNote(active);
    rememberCodeIdeCommand("Local assistant review");
  } else if (commandId === "extensions") {
    data.activePanel = "extensions";
    rememberCodeIdeCommand("Inspect extensions");
  }
  log("code-ide", data.lastCommand || commandId);
  saveState();
  renderOpenWindows("code-ide");
}

function codeIdeLanguage(path = "") {
  if (path.endsWith(".md")) return "Markdown";
  if (path.endsWith(".html")) return "HTML";
  if (path.endsWith(".css")) return "CSS";
  if (path.endsWith(".json")) return "JSON";
  if (path.endsWith(".js") || path.endsWith(".mjs")) return "JavaScript";
  return "Text";
}

function renderCodeIdeCode(active) {
  const content = active?.content || "Open a local VFS file from Explorer.";
  const lines = content.split("\n").slice(0, 80);
  return lines.map((line, index) => `<span class="code-ide-line"><i>${index + 1}</i><code>${escapeHtml(line || " ")}</code></span>`).join("");
}

function renderCodeIdeInspector(panelId, data, active, files, searchResults) {
  if (panelId === "search") {
    return `<section class="code-ide-inspector-panel" data-code-ide-search-panel>
      <h4>Local Search</h4>
      <p class="muted">Query runs against browser-local VFS content only.</p>
      <div class="code-ide-result-list">
        ${searchResults.map((result) => `<button type="button" data-action="code-ide-open-file" data-path="${escapeAttr(result.path)}">
          <strong>${escapeHtml(result.title)}</strong>
          <span>${escapeHtml(shortPath(result.path))}</span>
          <small>${escapeHtml(result.excerpt)}</small>
        </button>`).join("") || "<p class=\"muted\">No local matches yet.</p>"}
      </div>
    </section>`;
  }
  if (panelId === "source-control") {
    return `<section class="code-ide-inspector-panel" data-code-ide-source-control>
      <h4>Source Control Safe Mock</h4>
      <p class="muted">Review-only state. No Git command, push, merge, or credential action is executed.</p>
      <table class="data-table compact-table">
        <thead><tr><th>Path</th><th>State</th><th>Review Note</th></tr></thead>
        <tbody>${CODE_IDE_SOURCE_CONTROL_CHANGES.map(([path, status, note]) => `<tr><td>${escapeHtml(path)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(note)}</td></tr>`).join("")}</tbody>
      </table>
    </section>`;
  }
  if (panelId === "preview") {
    return `<section class="code-ide-inspector-panel code-ide-preview-panel" data-code-ide-preview-panel>
      <h4>Preview Panel</h4>
      <p class="muted">${escapeHtml(data.previewMode)} · ${escapeHtml(active?.path || "No file")}</p>
      <div class="code-ide-preview-frame">${renderCodePreview(active)}</div>
    </section>`;
  }
  if (panelId === "assistant") {
    return `<section class="code-ide-inspector-panel code-ide-ai-assistant" data-code-ide-ai-assistant>
      <h4>AI Code Assistant</h4>
      <p class="muted">${escapeHtml(data.assistantMode)} · no provider key · no external request</p>
      <div class="assistant-bubble">${escapeHtml(data.assistantNote)}</div>
      <button type="button" class="secondary-action" data-action="code-ide-command" data-value="assistant-review">Refresh Local Review</button>
    </section>`;
  }
  if (panelId === "extensions") {
    return `<section class="code-ide-inspector-panel" data-code-ide-extensions-panel>
      <h4>Extensions Panel</h4>
      <div class="code-ide-extension-list">
        ${state.installedExtensions.slice(0, 10).map((extension) => `<article>
          <strong>${escapeHtml(extension.name)}</strong>
          <span>${extension.enabled ? "Enabled" : "Disabled"}${extension.lane ? ` · ${escapeHtml(extension.lane)}` : ""}</span>
        </article>`).join("")}
      </div>
    </section>`;
  }
  return `<section class="code-ide-inspector-panel">
    <h4>Explorer Context</h4>
    <p class="muted">Workspace files: ${files.length}. Active file: ${escapeHtml(active?.path || "none")}.</p>
    <table class="data-table compact-table">
      <tbody>
        <tr><td>Language</td><td>${escapeHtml(codeIdeLanguage(active?.path || ""))}</td></tr>
        <tr><td>Lines</td><td>${active?.content ? active.content.split("\n").length : 0}</td></tr>
        <tr><td>Mode</td><td>Browser-local editable VFS</td></tr>
      </tbody>
    </table>
  </section>`;
}

function renderCodeIdeApp() {
  const data = getCodeIdeData();
  const files = getCodeIdeFiles();
  const active = getNode(state.codePath) || files[0];
  if (active && state.codePath !== active.path) state.codePath = active.path;
  const panel = CODE_IDE_PANELS.find((item) => item.id === data.activePanel) || CODE_IDE_PANELS[0];
  const searchResults = getCodeIdeSearchResults(data, files);
  const commandHistory = data.commandHistory.slice(0, 5);
  return `<section class="app-main code-ide-app" data-code-ide-app>
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="code-ide">Save IDE Session</button>
      <button type="button" data-action="code-ide-command" data-value="palette">Command Palette</button>
      <button type="button" data-action="code-ide-command" data-value="search">Run Search</button>
      <button type="button" data-action="code-ide-command" data-value="source-review">Source Review</button>
      <button type="button" data-action="code-ide-command" data-value="assistant-review">AI Assistant</button>
      <button type="button" data-action="open-demo-route" data-value="seis-code-web">Full-Page IDE</button>
    </div>
    <p class="status-note">Code IDE is the dedicated VS Code-like cockpit for SEIS Code. Search, source-control, preview, extensions, and AI assistant panels are browser-local; source control is safe/mock and AI assistant is Local Demo.</p>
    <div class="metric-grid">
      <article class="metric-card"><strong>Workspace Files</strong><p>${files.length}</p></article>
      <article class="metric-card"><strong>Active Panel</strong><p>${escapeHtml(panel.label)}</p></article>
      <article class="metric-card"><strong>Search Results</strong><p>${searchResults.length}</p></article>
      <article class="metric-card"><strong>Source Control</strong><p>${escapeHtml(data.sourceControlMode)}</p></article>
      <article class="metric-card"><strong>AI Mode</strong><p>${escapeHtml(data.assistantMode)}</p></article>
      <article class="metric-card"><strong>Last Snapshot</strong><p>${data.lastSnapshot || "Not saved yet"}</p></article>
    </div>
    <div class="code-ide-shell">
      <aside class="code-ide-activity" aria-label="IDE activity bar">
        ${CODE_IDE_PANELS.map((item) => `<button type="button" class="${item.id === panel.id ? "is-active" : ""}" data-action="code-ide-panel" data-value="${escapeAttr(item.id)}" aria-pressed="${item.id === panel.id}" title="${escapeAttr(item.detail)}">${escapeHtml(item.glyph)}</button>`).join("")}
      </aside>
      <aside class="code-ide-sidebar">
        <strong>${escapeHtml(panel.label)}</strong>
        <label class="code-ide-search-row">
          <span>Search</span>
          <input data-code-ide-search-query value="${escapeAttr(data.searchQuery)}" aria-label="Search Code IDE files">
        </label>
        <button type="button" data-action="code-ide-command" data-value="search">Search Local Files</button>
        <div class="code-ide-file-tree" data-code-ide-file-tree>
          ${files.slice(0, 14).map((fileNode) => `<button type="button" class="${fileNode.path === active?.path ? "is-active" : ""}" data-action="code-ide-open-file" data-path="${escapeAttr(fileNode.path)}">
            <span>${escapeHtml(baseName(fileNode.path))}</span>
            <small>${escapeHtml(shortPath(fileNode.path))}</small>
          </button>`).join("") || "<p class=\"muted\">No project files yet.</p>"}
        </div>
      </aside>
      <section class="code-ide-editor">
        <div class="code-ide-command-bar">
          ${CODE_IDE_COMMANDS.map((command) => `<button type="button" class="code-ide-command-chip" data-action="code-ide-command" data-value="${escapeAttr(command.id)}" title="${escapeAttr(command.detail)}">${escapeHtml(command.label)}</button>`).join("")}
          <span>Actual provider: Local Demo</span>
        </div>
        <div class="code-ide-tabs">
          ${files.slice(0, 4).map((fileNode) => `<button type="button" class="${fileNode.path === active?.path ? "is-active" : ""}" data-action="code-ide-open-file" data-path="${escapeAttr(fileNode.path)}">${escapeHtml(baseName(fileNode.path))}</button>`).join("")}
          <button type="button" data-action="code-ide-panel" data-value="preview">Preview</button>
          <button type="button" data-action="code-ide-panel" data-value="extensions">Extensions</button>
        </div>
        <div class="code-ide-editor-grid">
          <pre class="code-ide-code-pane" data-code-ide-code-display>${renderCodeIdeCode(active)}</pre>
          <aside class="code-ide-inspector" data-code-ide-inspector>
            ${renderCodeIdeInspector(panel.id, data, active, files, searchResults)}
          </aside>
        </div>
        <div class="code-ide-terminal">
          <span>seis:~/Projects$ code ${escapeHtml(active ? baseName(active.path) : "welcome.md")} --panel ${escapeHtml(panel.id)}</span>
          <span>seis:~/Projects$ git status --safe-mock</span>
          <span>No Git write, SSH, provider call, push, or merge executed.</span>
          ${commandHistory.map((item) => `<span>${escapeHtml(item.time)} ${escapeHtml(item.command)}</span>`).join("")}
        </div>
        <div class="code-ide-statusbar" data-code-ide-statusbar>
          <span>${escapeHtml(active?.path || "No file")}</span>
          <span>${escapeHtml(codeIdeLanguage(active?.path || ""))}</span>
          <span>${active?.content ? active.content.split("\n").length : 0} lines</span>
          <span>Source Control: ${escapeHtml(data.sourceControlMode)}</span>
          <span>AI: ${escapeHtml(data.assistantMode)}</span>
        </div>
      </section>
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

function renderSubAgentControl() {
  const data = getAppData("sub-agent-control");
  const lastDryRun = data.lastDryRun;
  const simulation = getSubAgentSimulationState();
  const quarters = getSubAgentQuarters();
  const completedQuarters = clamp(Number(simulation.completedQuarters || 0), 0, quarters.length);
  const activeQuarter = quarters[Math.min(completedQuarters, quarters.length - 1)];
  const progress = Math.round(completedQuarters / quarters.length * 100);
  const activeProfile = ["linux", "macos", "windows"].includes(state.osProfile) ? state.osProfile : "linux";
  const processes = getSubAgentProcesses();
  const activeProcesses = processes.filter((process) => process.status !== "Suspended").length;
  const lastCycle = data.lastCycle;
  const aiCoreOrbit = getAiCoreOrbitState(completedQuarters);
  const activeVersion = getAiCoreVersionTarget(aiCoreOrbit.activeVersionId) || getAiCoreVersionForQuarters(completedQuarters);
  return `<section class="app-main subagent-os" data-subagent-os-demo>
    <div class="toolbar">
      <span class="subagent-profile-controls" aria-label="Desktop style profile">
        <button type="button" class="os-profile-button" data-action="set-os-profile" data-value="linux">Linux</button>
        <button type="button" class="os-profile-button" data-action="set-os-profile" data-value="macos">macOS</button>
        <button type="button" class="os-profile-button" data-action="set-os-profile" data-value="windows">Windows</button>
      </span>
      <button type="button" data-action="app-primary" data-app-id="sub-agent-control">Run Dry-Run Check</button>
      <button type="button" data-action="rotate-ai-core-orbit">Rotate AI Core Orbit</button>
      <button type="button" data-action="promote-ai-core-version">Promote AI Core Preview</button>
      <button type="button" data-action="pulse-subagent-processes">Pulse Agent Processes</button>
      <button type="button" data-action="run-next-subagent-cycle">Run Next Agent Cycle</button>
      <button type="button" data-action="advance-subagent-quarter">Advance Quarter</button>
      <button type="button" data-action="run-subagent-simulation">Run 5-Year Simulation</button>
      <button type="button" data-action="reset-subagent-simulation">Reset Simulation</button>
      <button type="button" data-action="generic-export" data-app-id="sub-agent-control">Export Handoff</button>
      <button type="button" data-action="open-app" data-app-id="ai-assistant">Open AI Assistant</button>
      <button type="button" data-action="open-app" data-app-id="terminal">Open Terminal</button>
    </div>
    <p class="status-note">Five-year sub-agent development is surfaced as a local OS demo with switchable Linux, macOS, and Windows-style profiles. It is status/plan-only: no background automation, no provider key, no SSH, no GitHub mutation, and no cloud execution.</p>
    <div class="metric-grid">
      <article class="metric-card"><strong>Status</strong><p>${escapeHtml(SUB_AGENT_DEMO.status)}</p></article>
      <article class="metric-card"><strong>Runtime</strong><p>${escapeHtml(SUB_AGENT_DEMO.runtime)}</p></article>
      <article class="metric-card"><strong>Surface</strong><p>${escapeHtml(SUB_AGENT_DEMO.osSurface)}</p></article>
      <article class="metric-card"><strong>OS Profile</strong><p>${escapeHtml(activeProfile)}</p></article>
      <article class="metric-card"><strong>Agent Processes</strong><p>${activeProcesses}/${processes.length} managed</p></article>
      <article class="metric-card"><strong>Last Dry-Run</strong><p>${lastDryRun ? escapeHtml(lastDryRun.time) : "Not run in this session"}</p></article>
      <article class="metric-card"><strong>Last Cycle</strong><p>${lastCycle ? `${escapeHtml(lastCycle.quarterId)} · ${escapeHtml(lastCycle.focus)}` : "Not run in this session"}</p></article>
      <article class="metric-card"><strong>Simulation</strong><p>${completedQuarters}/${quarters.length} quarters</p><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div></article>
      <article class="metric-card"><strong>Active Phase</strong><p>${escapeHtml(activeQuarter.label)} · ${escapeHtml(activeQuarter.focus)}</p></article>
      <article class="metric-card"><strong>AI Core Target</strong><p>${escapeHtml(activeVersion.label)} · ${escapeHtml(activeVersion.title)}</p></article>
    </div>
    ${renderAiCoreOrbitPanel(completedQuarters, processes)}
    <div class="subagent-year-strip" aria-label="Five-year development phases">
      ${SUB_AGENT_DEMO.years.map(([year, title, scope]) => `<article>
        <span>${escapeHtml(year)}</span>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(scope)}</p>
      </article>`).join("")}
    </div>
    <div class="subagent-os-grid">
      <section class="subagent-panel">
        <h3>Sub-Agent Lanes</h3>
        <div class="list compact-list">
          ${SUB_AGENT_DEMO.lanes.map(([name, lane, planId, scope]) => `<article class="mini-card">
            <strong>${escapeHtml(name)}</strong>
            <p class="muted">${escapeHtml(lane)} · ${escapeHtml(planId)}</p>
            <p>${escapeHtml(scope)}</p>
          </article>`).join("")}
        </div>
      </section>
      <section class="subagent-panel">
        <h3>Safety Gates</h3>
        <ul class="subagent-gate-list">
          ${SUB_AGENT_DEMO.gates.map((gate) => `<li>${escapeHtml(gate)}</li>`).join("")}
        </ul>
      </section>
    </div>
    <section class="subagent-panel">
      <h3>Five-Year Simulation Timeline</h3>
      <p class="status-note">This timeline compresses five years into a local demo. Advancing it updates browser state and writes audit-style artifacts only.</p>
      <div class="subagent-quarter-grid" data-subagent-quarter-grid>
        ${quarters.map((quarter, index) => {
          const stateClass = index < completedQuarters ? "is-complete" : index === completedQuarters ? "is-current" : "is-planned";
          return `<article class="${stateClass}">
            <span>${escapeHtml(quarter.label)}</span>
            <strong>${escapeHtml(quarter.laneName)}</strong>
            <p>${escapeHtml(quarter.focus)}</p>
          </article>`;
        }).join("")}
      </div>
    </section>
    ${renderSubAgentProcessPanel("sub-agent-control")}
  </section>`;
}

function renderAiCoreOrbitPanel(completedQuarters, processes) {
  const orbit = getAiCoreOrbitState(completedQuarters);
  const activeVersion = getAiCoreVersionTarget(orbit.activeVersionId) || getAiCoreVersionForQuarters(completedQuarters);
  const activeIndex = AI_CORE_VERSION_TARGETS.findIndex((target) => target.id === activeVersion.id);
  const progress = Math.round(clamp(completedQuarters, 0, getSubAgentQuarters().length) / getSubAgentQuarters().length * 100);
  return `<section class="ai-core-orbit-panel" data-ai-core-orbit data-seis-ai-core-version="${escapeAttr(activeVersion.id)}">
    <div class="ai-core-orbit-copy">
      <span class="eyebrow">SEIS AI Core spatial command surface</span>
      <h3>${escapeHtml(activeVersion.label)} ${escapeHtml(activeVersion.title)}</h3>
      <p>${escapeHtml(activeVersion.capability)}</p>
      <div class="ai-core-status-row">
        <span>Local Demo</span>
        <span>No provider key</span>
        <span>${completedQuarters}/20 quarters</span>
        <span>Snapshot ${orbit.lastSnapshotPath ? "saved" : "not saved"}</span>
      </div>
      <div class="ai-core-gate">
        <strong>Promotion gate</strong>
        <p>${escapeHtml(activeVersion.gate)}</p>
      </div>
    </div>
    <div class="ai-core-stage" style="--orbit-turn:${Number(orbit.rotationDeg || 0)}deg" aria-label="AI Core version and sub-agent orbit">
      <div class="ai-core-grid-plane"></div>
      <div class="ai-core-ring ai-core-ring-outer"></div>
      <div class="ai-core-ring ai-core-ring-inner"></div>
      <div class="ai-core-nucleus">
        <strong>SEIS AI Core</strong>
        <span>${escapeHtml(activeVersion.label)}</span>
      </div>
      ${AI_CORE_VERSION_TARGETS.map((target, index) => {
        const angle = -90 + index * (360 / AI_CORE_VERSION_TARGETS.length);
        const className = index < activeIndex ? "is-passed" : index === activeIndex ? "is-active" : "is-planned";
        return `<button type="button" class="ai-core-orbit-node version-node ${className}" data-action="select-ai-core-version" data-value="${escapeAttr(target.id)}" data-ai-core-version-node="${escapeAttr(target.id)}" style="--node-angle:${angle}deg">
          <span>${escapeHtml(target.label)}</span>
        </button>`;
      }).join("")}
      ${processes.map((process, index) => {
        const angle = -90 + index * (360 / processes.length);
        return `<span class="ai-core-orbit-node lane-node ${process.status === "Suspended" ? "is-paused" : ""}" data-ai-core-lane-node="${escapeAttr(process.laneId)}" style="--node-angle:${angle}deg">
          ${escapeHtml(process.name.replace(/^SEIS-?/i, ""))}
        </span>`;
      }).join("")}
    </div>
    <div class="ai-core-version-strip" aria-label="AI Core version targets">
      ${AI_CORE_VERSION_TARGETS.map((target, index) => {
        const className = index < activeIndex ? "is-passed" : index === activeIndex ? "is-active" : "is-planned";
        return `<button type="button" class="ai-core-version-card ${className}" data-action="select-ai-core-version" data-value="${escapeAttr(target.id)}" data-ai-core-version-target="${escapeAttr(target.id)}">
          <span>${escapeHtml(target.year)}</span>
          <strong>${escapeHtml(target.label)} ${escapeHtml(target.title)}</strong>
          <p>${escapeHtml(target.gate)}</p>
        </button>`;
      }).join("")}
    </div>
    <p class="status-note">This spatial surface is a browser-local AI Core planning and evidence view. It is not WebGL, not a live provider call, and not autonomous background execution.</p>
  </section>`;
}

function renderAssistant() {
  const data = getAppData("ai-assistant");
  const activeTab = AI_PLUGIN_TABS.includes(data.activeTab) ? data.activeTab : "Plugin Center";
  return `<section class="app-main ai-app" data-ai-app>
    <div class="toolbar">
      <button type="button" data-action="assistant-send">Send Local Demo</button>
      <button type="button" data-action="open-app" data-app-id="terminal">Terminal Claude REPL</button>
      <button type="button" data-action="open-app" data-app-id="seis-code">Open SEIS Code</button>
      <button type="button" data-action="generic-export" data-app-id="ai-assistant">Export Chat</button>
    </div>
    <p class="status-note">Provider status: Local Demo. No cloud API key is required or stored in the browser. Plugins are local capability lanes inside SEIS AI.</p>
    <div class="tab-strip" role="tablist" aria-label="SEIS AI sections">
      ${AI_PLUGIN_TABS.map((tab) => `<button type="button" role="tab" aria-selected="${tab === activeTab}" class="${tab === activeTab ? "is-active" : ""}" data-action="set-ai-tab" data-value="${escapeAttr(tab)}" data-ai-plugin-tab="${escapeAttr(tab)}">${escapeHtml(tab)}</button>`).join("")}
    </div>
    ${renderAiAssistantTab(activeTab, data)}
  </section>`;
}

function renderSeisSystemOSApp() {
  const data = getAppData("seis-system-os");
  const activeProfile = ["linux", "macos", "windows"].includes(state.osProfile) ? state.osProfile : "linux";
  const installedApps = APPS.length;
  const osPages = SEIS_WOW_IMPORTS.reduce((sum, item) => sum + item.pages, 0);
  const openWindows = state.windows.length;
  const liveActivities = [
    ["Profile", activeProfile, "Linux, macOS, and Windows-like modes switch the shell style without copying protected branding."],
    ["Workspace", state.activeWorkspace || "1", "Three browser-safe workspaces preserve window placement and app state."],
    ["Apps", `${installedApps}`, "System apps, SEIS Code, Design, Cloud, Store, Music, Gacha, and WOW references are all searchable."],
    ["Evidence", SEIS_SYSTEM_OS_EVIDENCE.mcpStatus, "Sub-agent evidence remains local-demo-only, dry-run, and release-gated."]
  ];
  const nextApps = [
    ["seis-code", "SEIS Code", "VS Code-like editor"],
    ["seis-design", "SEIS Design", "Creative studio"],
    ["seis-website", "SEIS Website", "Product pages"],
    ["seis-cloud", "SEIS Cloud", "SSH/cloud boundary"],
    ["seis-store", "SEIS Store", "App catalog"],
    ["music", "Music", "System soundtrack"],
    ["wow-gallery", "WOW Gallery", "190 reference screens"],
    ["sub-agent-control", "Agents", "5-year dry-run evidence"],
    ["settings", "Settings", "Appearance and safety"]
  ];
  return `<section class="app-main system-os-app" data-system-os-app>
    <div class="toolbar">
      <span class="subagent-profile-controls" aria-label="SEIS System OS profile">
        <button type="button" class="os-profile-button" data-action="set-os-profile" data-value="linux">Linux</button>
        <button type="button" class="os-profile-button" data-action="set-os-profile" data-value="macos">macOS</button>
        <button type="button" class="os-profile-button" data-action="set-os-profile" data-value="windows">Windows</button>
      </span>
      <button type="button" data-action="app-primary" data-app-id="seis-system-os">Save OS Blueprint</button>
      <button type="button" data-action="open-search">Search Everything</button>
      <button type="button" data-action="open-demo-route" data-value="wow-gallery-web">Open 190-Screen Reference</button>
      <button type="button" data-action="toggle-status">Quick Status</button>
    </div>
    <section class="system-os-hero">
      <div>
        <p class="status-note">SEIS System OS is the connected browser operating layer. It borrows the idea of Linux, macOS, and Windows-style workflows without copying their product identities.</p>
        <h2>SEIS OS first. Apps after.</h2>
        <p>The shell now treats widgets, live activities, app switching, workspaces, recents, Files, Terminal, Code, Design, Cloud, Store, AI, and WOW references as one system instead of separate pages.</p>
      </div>
      <aside class="system-os-evidence-card">
        <strong>${SEIS_SYSTEM_OS_EVIDENCE.completionPercent}%</strong>
        <span>local demo evidence</span>
        <small>${SEIS_SYSTEM_OS_EVIDENCE.quarters} quarters · ${SEIS_SYSTEM_OS_EVIDENCE.lanes} lanes · ${SEIS_SYSTEM_OS_EVIDENCE.mcpTools} MCP tools · dry-run only</small>
      </aside>
    </section>
    <div class="metric-grid">
      <article class="metric-card"><strong>OS Profile</strong><p>${escapeHtml(activeProfile)}</p></article>
      <article class="metric-card"><strong>Installed Apps</strong><p>${installedApps}</p></article>
      <article class="metric-card"><strong>Reference Screens</strong><p>${osPages}</p></article>
      <article class="metric-card"><strong>Open Windows</strong><p>${openWindows}</p></article>
    </div>
    <section class="subagent-panel">
      <h3>Live Activity Strip</h3>
      <div class="system-live-grid">
        ${liveActivities.map(([label, value, note]) => `<button type="button" class="system-live-card" data-action="${label === "Workspace" ? "toggle-shortcuts" : label === "Apps" ? "toggle-launcher" : label === "Evidence" ? "open-app" : "toggle-status"}"${label === "Evidence" ? " data-app-id=\"sub-agent-control\"" : ""}>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
          <em>${escapeHtml(note)}</em>
        </button>`).join("")}
      </div>
    </section>
    <section class="subagent-panel">
      <h3>System OS Modules from Part5-Part7</h3>
      <div class="system-module-grid">
        ${SEIS_SYSTEM_OS_MODULES.map((module) => `<button type="button" class="system-module-card" data-action="open-demo-route" data-value="wow-gallery-web">
          <strong aria-hidden="true">${escapeHtml(module.id.split("-").map((word) => word[0] || "").join("").slice(0, 3).toUpperCase())}</strong>
          <span>${escapeHtml(module.title)}</span>
          <small>${escapeHtml(module.source)} · ${escapeHtml(module.status)}</small>
          <em>${escapeHtml(module.action)}</em>
        </button>`).join("")}
      </div>
    </section>
    <section class="subagent-panel">
      <h3>Then the rest of SEIS appears here</h3>
      <div class="system-app-strip">
        ${nextApps.map(([appId, title, note]) => `<button type="button" class="search-gateway-card" data-action="open-app" data-app-id="${escapeAttr(appId)}">
          <span>${escapeHtml(title)}</span>
          <small>${escapeHtml(note)}</small>
          <em>Connected to the same shell, VFS, Search, Store, recents, and status system.</em>
        </button>`).join("")}
      </div>
    </section>
  </section>`;
}

function renderSeisSearchGateway() {
  const data = getAppData("search");
  const query = data.query || "SEIS";
  const activeTab = SEIS_SEARCH_TABS.includes(data.activeTab) ? data.activeTab : "AI";
  const websiteRoutes = DEMO_ROUTES.filter((route) => (
    route.kind === "Website" ||
    route.kind === "External reference" ||
    ["seis-code-web", "mythic-gacha-web", "video-hero-gallery", "video-hero-nature", "video-hero-still-life", "video-hero-materials", "video-hero-metal-parts"].includes(route.id)
  ));
  const gatewayApps = [
    ["seis-system-os", "SEIS System OS", "Operating shell", "Linux, macOS, and Windows-inspired widgets, app switcher, workspaces, recents, and evidence"],
    ["seis-code", "SEIS Code", "VS Code-like app", "Monaco workspace, VFS bridge, terminal, extensions"],
    ["code-ide", "Code IDE", "Dedicated IDE cockpit", "Standalone cockpit for SEIS Code, terminal, extensions, and project files"],
    ["seis-design", "SEIS Design", "Creative OS", "Adobe/Figma-style workflow map, websites, motion, handoff"],
    ["seis-website", "SEIS Website", "Product pages", "Premium pages for SEIS AI, OS, Code, Design, Search, Cloud, Store, and Agents"],
    ["seis-cloud", "SEIS Cloud", "Runtime boundary", "Ollama/Qwen/local runtime references, SSH/cloud safety gates"],
    ["seis-store", "SEIS Store", "App catalog", "App Store/Microsoft Store-style local catalog for apps and demo websites"],
    ["launchpad", "Launchpad", "Application grid", "Full-window launcher for all installed SEIS demo apps"],
    ["music", "Music", "Local soundtrack", "Demo playlist and local music surface with persistent state"],
    ["wow-gallery", "SEIS WOW Gallery", "Imported references", "190 SEIS_WOW page previews, HTML references, and Kimi external links"],
    ["ai-assistant", "SEIS AI", "AI Core", "Provider-neutral Local Demo, installed AI profiles, plugin lanes"],
    ["seis-evolution", "SEIS Evolution", "Screenshot context", "Github 2 scope, local inventory, five-year map"]
  ];
  const localInventoryPreview = LOCAL_ECOSYSTEM_INVENTORY.apps.slice(0, 8);
  const fileHits = state.fs
    .filter((item) => item.path.toLowerCase().includes("seis") || item.path.toLowerCase().includes("demo"))
    .slice(0, 8);
  const searchTabResults = getSeisSearchTabResults(activeTab, { gatewayApps, websiteRoutes, fileHits, localInventoryPreview });

  return `<section class="app-main seis-search-gateway" data-seis-search-gateway>
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="search">Save Search Snapshot</button>
      <button type="button" data-action="open-app" data-app-id="seis-system-os">Open SEIS System OS</button>
      <button type="button" data-action="open-app" data-app-id="seis-code">Open SEIS Code</button>
      <button type="button" data-action="open-app" data-app-id="code-ide">Open Code IDE</button>
      <button type="button" data-action="open-app" data-app-id="seis-design">Open SEIS Design</button>
      <button type="button" data-action="open-app" data-app-id="seis-website">Open SEIS Website</button>
      <button type="button" data-action="open-app" data-app-id="seis-cloud">Open SEIS Cloud</button>
      <button type="button" data-action="open-app" data-app-id="seis-store">Open Store</button>
      <button type="button" data-action="open-demo-route" data-value="wow-gallery-web">Open WOW Gallery</button>
      <button type="button" data-action="open-demo-route" data-value="seis-ai-core-3d-demo">Open AI Core 3D</button>
      <button type="button" data-action="generic-export" data-app-id="search">Export Search Map</button>
    </div>
    <p class="status-note">SEIS Search is the local demo gateway. It opens the VS Code-like SEIS Code app, SEIS Design, SEIS Cloud, AI Core 3D, local tool inventory, and all written website routes without cloud keys.</p>
    <label class="search-field search-gateway-input">
      <span aria-hidden="true">⌕</span>
      <input class="input" data-workflow-input value="${escapeAttr(query)}" aria-label="SEIS search query">
    </label>
    <div class="tab-strip search-tab-strip" role="tablist" aria-label="SEIS Search result tabs">
      ${SEIS_SEARCH_TABS.map((tab) => `<button type="button" class="${tab === activeTab ? "is-active" : ""}" data-action="set-search-tab" data-value="${escapeAttr(tab)}" role="tab" aria-selected="${tab === activeTab}">
        ${escapeHtml(tab)}
      </button>`).join("")}
    </div>
    <section class="search-gateway-section search-tab-panel" data-search-tab-panel="${escapeAttr(activeTab)}">
      <h3>${escapeHtml(activeTab)} Results</h3>
      <div class="search-gateway-grid">
        ${searchTabResults.map((result) => renderSearchGatewayResult(result)).join("")}
      </div>
    </section>
    <div class="metric-grid">
      <article class="metric-card"><strong>Desktop Apps</strong><p>${gatewayApps.length}</p></article>
      <article class="metric-card"><strong>Website Routes</strong><p>${websiteRoutes.length}</p></article>
      <article class="metric-card"><strong>WOW Pages</strong><p>${SEIS_WOW_IMPORTS.reduce((sum, item) => sum + item.pages, 0)}</p></article>
      <article class="metric-card"><strong>Local Tools</strong><p>${LOCAL_ECOSYSTEM_INVENTORY.apps.length}</p></article>
      <article class="metric-card"><strong>Mode</strong><p>Local Demo</p></article>
    </div>
    <section class="search-gateway-section">
      <h3>Core SEIS Surfaces</h3>
      <div class="search-gateway-grid">
        ${gatewayApps.map(([appId, title, meta, description]) => `<button type="button" class="search-gateway-card" data-action="open-app" data-app-id="${escapeAttr(appId)}">
          <span>${escapeHtml(title)}</span>
          <small>${escapeHtml(meta)}</small>
          <em>${escapeHtml(description)}</em>
        </button>`).join("")}
      </div>
    </section>
    <section class="search-gateway-section">
      <h3>Written Website Routes</h3>
      <div class="demo-route-board compact-routes">
        ${websiteRoutes.map((route) => `<article class="demo-route-card">
          <strong>${escapeHtml(route.label)}</strong>
          <p class="muted">${escapeHtml(route.kind)} · ${escapeHtml(route.path)}</p>
          <button type="button" class="secondary-action" data-action="open-demo-route" data-value="${escapeAttr(route.id)}">Open</button>
        </article>`).join("")}
      </div>
    </section>
    <section class="search-gateway-section">
      <h3>Local Tool Inventory Preview</h3>
      <div class="search-gateway-grid small">
        ${localInventoryPreview.map(([tool, role, use, status]) => `<button type="button" class="search-gateway-card" data-action="open-app" data-app-id="seis-evolution">
          <span>${escapeHtml(tool)}</span>
          <small>${escapeHtml(role)} · ${escapeHtml(status)}</small>
          <em>${escapeHtml(use)}</em>
        </button>`).join("")}
      </div>
    </section>
    <section class="search-gateway-section">
      <h3>Demo Files in VFS</h3>
      <div class="list">
        ${fileHits.map((item) => `<button type="button" class="list-button" data-action="open-file" data-path="${escapeAttr(item.path)}">
          <strong>${escapeHtml(baseName(item.path))}</strong>
          <span>${escapeHtml(item.path)}</span>
        </button>`).join("") || "<p class=\"muted\">No local demo files indexed yet.</p>"}
      </div>
    </section>
  </section>`;
}

function getSeisSearchTabResults(tab, context) {
  const { gatewayApps, websiteRoutes, fileHits, localInventoryPreview } = context;
  const routeResult = (route) => route ? ({
    title: route.label,
    meta: route.kind,
    detail: route.path,
    action: "open-demo-route",
    value: route.id
  }) : null;
  const appResult = ([appId, title, meta, detail]) => ({ title, meta, detail, action: "open-app", appId });
  const pluginResult = (plugin) => ({
    title: plugin.name,
    meta: `${plugin.lane} · ${plugin.status}`,
    detail: plugin.capability,
    action: "open-app",
    appId: "ai-assistant"
  });
  const fileResult = (item) => ({
    title: baseName(item.path),
    meta: item.type.toUpperCase(),
    detail: item.path,
    action: "open-file",
    path: item.path
  });
  const inventoryResult = ([tool, role, use, status]) => ({
    title: tool,
    meta: `${role} · ${status}`,
    detail: use,
    action: "open-app",
    appId: "seis-evolution"
  });

  const byTab = {
    AI: [
      appResult(["ai-assistant", "SEIS AI", "AI Core", "Local Demo assistant, installed AI profiles, tool calls, and plugin awareness"]),
      routeResult(DEMO_ROUTES.find((route) => route.id === "seis-ai-core-3d-demo")),
      ...SEIS_INSTALLED_AI_SYSTEMS.slice(0, 3).map((system) => ({
        title: system.name,
        meta: `${system.status} · ${system.classification}`,
        detail: system.boundary,
        action: "open-app",
        appId: "ai-assistant"
      }))
    ],
    Web: websiteRoutes.map(routeResult),
    Code: [
      appResult(["seis-code", "SEIS Code", "VS Code-like desktop app", "Shared workspace, terminal, preview, and VFS bridge"]),
      appResult(["code-ide", "Code IDE", "IDE cockpit", "Explorer, search, extensions, source-control safe mode, preview, and assistant"]),
      routeResult(DEMO_ROUTES.find((route) => route.id === "seis-code-web"))
    ],
    Design: [
      appResult(["seis-design", "SEIS Design", "Design Studio", "Tokens, components, prototype handoff, motion, and website proof"]),
      routeResult(DEMO_ROUTES.find((route) => route.id === "video-hero-gallery")),
      routeResult(DEMO_ROUTES.find((route) => route.id === "mythic-gacha-web"))
    ],
    Cloud: [
      appResult(["seis-cloud", "SEIS Cloud", "Mock Safe", "SSH/cloud readiness, deployment gates, health, logs, backups, and no-secret boundaries"]),
      appResult(["seis-evolution", "SEIS Evolution", "SSH boundary", "Pinned scope, local inventory, and approval-gated cloud/SSH references"]),
      ...localInventoryPreview.filter(([, role]) => /Cloud|Local AI|Browser/i.test(role)).map(inventoryResult)
    ],
    Apps: gatewayApps.map(appResult),
    Plugins: [
      ...SEIS_AI_PLUGIN_LANES.map(pluginResult),
      ...SEIS_PERSONAL_PLUGIN_AI_CORE_LANE_MATRIX.slice(0, 4).map((plugin) => ({
        title: plugin.displayName,
        meta: `${plugin.permissionLevel} · ${plugin.versionTargetId}`,
        detail: plugin.boundary,
        action: "open-app",
        appId: "ai-assistant"
      }))
    ],
    Files: fileHits.map(fileResult)
  };

  return (byTab[tab] || byTab.AI).filter(Boolean).slice(0, 12);
}

function renderSearchGatewayResult(result) {
  const attrs = [
    `type="button"`,
    `class="search-gateway-card"`,
    `data-action="${escapeAttr(result.action)}"`
  ];
  if (result.appId) attrs.push(`data-app-id="${escapeAttr(result.appId)}"`);
  if (result.value) attrs.push(`data-value="${escapeAttr(result.value)}"`);
  if (result.path) attrs.push(`data-path="${escapeAttr(result.path)}"`);
  return `<button ${attrs.join(" ")}>
    <span>${escapeHtml(result.title)}</span>
    <small>${escapeHtml(result.meta || "Local Demo")}</small>
    <em>${escapeHtml(result.detail || "Connected SEIS result")}</em>
  </button>`;
}

function getV17CommandCenterCoverage() {
  const modules = SEIS_V17_COMMAND_CENTER_MODULES.map((module) => ({ ...module }));
  const stateCounts = modules.reduce((counts, module) => {
    counts[module.state] = (counts[module.state] || 0) + 1;
    return counts;
  }, {});
  const masterObjectiveCoverageItems = SEIS_MASTER_OBJECTIVE_COVERAGE_UI.items.map((item) => ({ ...item }));
  const masterObjectiveCoverageStatusCounts = masterObjectiveCoverageItems.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
  const appLinks = modules.filter((module) => module.appId && getApp(module.appId)).length;
  const routeLinks = modules.filter((module) => module.routeId && DEMO_ROUTES.some((route) => route.id === module.routeId)).length;
  const executableActions = modules.reduce((total, module) => total + (module.appId ? 1 : 0) + (module.routeId ? 1 : 0), 0);
  return {
    moduleCount: modules.length,
    workingCount: stateCounts.working || 0,
    localDemoCount: stateCounts["local-demo"] || 0,
    mockSafeCount: stateCounts["mock-safe"] || 0,
    plannedGatedCount: stateCounts["planned-gated"] || 0,
    appLinks,
    routeLinks,
    executableActions,
    interactionTarget: "95%+",
    providerKeysRequiredForCoreDemo: 0,
    liveSshExecution: false,
    liveDeployment: false,
    modelScalingFloor: "20B local-planned profile for 16GB+ RAM",
    modelScalingFuture: "70B research and 150B frontier tiers require future hardware, safety, cost, privacy, and validation evidence",
    modelScalingProfile: SEIS_MODEL_SCALING_UI_PROFILE,
    masterObjectiveCoverage: {
      ...SEIS_MASTER_OBJECTIVE_COVERAGE_UI,
      itemCount: masterObjectiveCoverageItems.length,
      itemIds: masterObjectiveCoverageItems.map((item) => item.id),
      statusCounts: masterObjectiveCoverageStatusCounts,
      items: masterObjectiveCoverageItems
    },
    modules
  };
}

function renderSeisCommandCenter() {
  const data = getAppData("seis-command-center");
  const coverage = getV17CommandCenterCoverage();
  const validationRows = SEIS_V17_COMMAND_CENTER_VALIDATION_QUEUE;
  const stateLegend = [
    ["Working", "Runs in the browser demo and has validator evidence."],
    ["Local Demo", "Interactive and file-backed, with live provider or external mutation disabled."],
    ["Mock Safe", "Concept is represented with explicit mock/disabled state labels."],
    ["Planned/Gated", "Roadmapped until hardware, API keys, approvals, or validation evidence exists."]
  ];
  return `<section class="app-main seis-command-center-app" data-seis-command-center>
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="seis-command-center">Save V17 Snapshot</button>
      <button type="button" data-action="open-app" data-app-id="launchpad">Open Launchpad</button>
      <button type="button" data-action="open-app" data-app-id="ai-assistant">Open SEIS AI</button>
      <button type="button" data-action="open-app" data-app-id="code-ide">Open Code IDE</button>
      <button type="button" data-action="open-app" data-app-id="seis-design">Open Design</button>
      <button type="button" data-action="open-app" data-app-id="seis-cloud">Open Cloud</button>
      <button type="button" data-action="open-demo-route" data-value="seis-website-hub">Open Website</button>
      <button type="button" data-action="generic-export" data-app-id="seis-command-center">Export State</button>
    </div>
    <p class="status-note">SEIS Command Center is the V17 operating center. It unifies the runnable creative OS demo, AI Core, plugin bridge, website pages, model-scaling plan, and review gates without claiming live SSH, deployment, provider keys, or trained SEIS model ownership.</p>
    <div class="metric-grid">
      <article class="metric-card"><strong>V17 Modules</strong><p>${coverage.moduleCount}</p></article>
      <article class="metric-card"><strong>Working</strong><p>${coverage.workingCount}</p></article>
      <article class="metric-card"><strong>Local Demo</strong><p>${coverage.localDemoCount}</p></article>
      <article class="metric-card"><strong>Mock/Planned</strong><p>${coverage.mockSafeCount + coverage.plannedGatedCount}</p></article>
      <article class="metric-card"><strong>Core Keys</strong><p>${coverage.providerKeysRequiredForCoreDemo}</p></article>
      <article class="metric-card"><strong>Target Interactivity</strong><p>${coverage.interactionTarget}</p></article>
      <article class="metric-card"><strong>Model Floor</strong><p>20B / 16GB+</p></article>
      <article class="metric-card"><strong>Frontier Tier</strong><p>150B gated</p></article>
      <article class="metric-card"><strong>Last Snapshot</strong><p>${data.lastSnapshot?.time || "Not saved yet"}</p></article>
    </div>
    <section class="subagent-panel">
      <h3>Unified V17 Module Map</h3>
      <table class="data-table">
        <thead><tr><th>Module</th><th>Status</th><th>Evidence</th><th>Action</th></tr></thead>
        <tbody>${coverage.modules.map((module) => `<tr data-v17-module="${escapeAttr(module.id)}">
          <td><strong>${escapeHtml(module.label)}</strong><br><span class="muted">${escapeHtml(module.detail)}</span></td>
          <td>${escapeHtml(module.status)}</td>
          <td>${escapeHtml(module.evidence)}</td>
          <td>
            ${module.appId ? `<button type="button" class="secondary-action" data-v17-open-app="${escapeAttr(module.appId)}" data-action="open-app" data-app-id="${escapeAttr(module.appId)}">Open App</button>` : ""}
            ${module.routeId ? `<button type="button" class="secondary-action" data-v17-open-route="${escapeAttr(module.routeId)}" data-action="open-demo-route" data-value="${escapeAttr(module.routeId)}">Open Route</button>` : ""}
          </td>
        </tr>`).join("")}</tbody>
      </table>
    </section>
    <section class="subagent-panel">
      <h3>Mock vs Real Status</h3>
      <table class="data-table">
        <thead><tr><th>Label</th><th>Meaning</th></tr></thead>
        <tbody>${stateLegend.map(([label, meaning]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(meaning)}</td></tr>`).join("")}</tbody>
      </table>
    </section>
    <section class="subagent-panel">
      <h3>Validation Queue</h3>
      <table class="data-table">
        <thead><tr><th>Gate</th><th>Command</th><th>Scope</th></tr></thead>
        <tbody>${validationRows.map(([gate, command, scope]) => `<tr><td>${escapeHtml(gate)}</td><td><code>${escapeHtml(command)}</code></td><td>${escapeHtml(scope)}</td></tr>`).join("")}</tbody>
      </table>
    </section>
    <section class="subagent-panel" data-master-objective-coverage>
      <h3>Master Objective Coverage</h3>
      <div class="evolution-safety-grid">
        <article><strong>Coverage Source</strong><p>${escapeHtml(coverage.masterObjectiveCoverage.source)}</p></article>
        <article><strong>Coverage Report</strong><p>${escapeHtml(coverage.masterObjectiveCoverage.report)}</p></article>
        <article><strong>Coverage Items</strong><p>${coverage.masterObjectiveCoverage.itemCount}</p></article>
        <article><strong>Active AI Boundary</strong><p>${escapeHtml(coverage.masterObjectiveCoverage.activeCoverage)} · ${escapeHtml(coverage.masterObjectiveCoverage.activeCoverageStatus)}</p></article>
      </div>
      <p class="status-note">${escapeHtml(coverage.masterObjectiveCoverage.activeRequirement)}</p>
      <table class="data-table">
        <thead><tr><th>Evidence</th><th>Required Check</th></tr></thead>
        <tbody>${coverage.masterObjectiveCoverage.evidence.map((item, index) => `<tr><td>${escapeHtml(item)}</td><td><code>${escapeHtml(coverage.masterObjectiveCoverage.checks[index] || coverage.masterObjectiveCoverage.checks[0])}</code></td></tr>`).join("")}</tbody>
      </table>
      <table class="data-table" data-master-objective-coverage-matrix>
        <thead><tr><th>Coverage ID</th><th>Status</th><th>Requirement</th><th>Evidence / Check</th><th>Remaining Gap</th></tr></thead>
        <tbody>${coverage.masterObjectiveCoverage.items.map((item) => `<tr data-master-objective-coverage-item="${escapeAttr(item.id)}">
          <td><strong>${escapeHtml(item.id)}</strong></td>
          <td>${escapeHtml(item.status)}</td>
          <td>${escapeHtml(item.requirement)}</td>
          <td><span class="muted">${escapeHtml(item.evidence)}</span><br><code>${escapeHtml(item.check)}</code></td>
          <td>${escapeHtml(item.gap)}</td>
        </tr>`).join("")}</tbody>
      </table>
      <p class="status-note">150B remains blocked until: ${coverage.masterObjectiveCoverage.blockedUntil.map((item) => escapeHtml(item)).join(", ")}.</p>
    </section>
    <section class="subagent-panel">
      <h3>20B to 150B Model Scaling Profile</h3>
      <div class="evolution-safety-grid">
        <article><strong>Target</strong><p>${escapeHtml(coverage.modelScalingProfile.currentTarget)} · ${escapeHtml(coverage.modelScalingProfile.ramClass)}</p></article>
        <article><strong>Frontier</strong><p>${escapeHtml(coverage.modelScalingProfile.frontierTarget)} · ${escapeHtml(coverage.modelScalingProfile.frontierStatus)}</p></article>
        <article><strong>Compatibility</strong><p>${escapeHtml(coverage.modelScalingProfile.compatibilityClaim)} · ${escapeHtml(coverage.modelScalingProfile.memoryBudgetStatus)}</p></article>
        <article><strong>Runtime</strong><p>Candidate-only local runtimes. No model download, benchmark, provider call, SSH, or deployment without approval.</p></article>
        <article><strong>Route Gate</strong><p>Blocked until quantized runtime, memory benchmark, model card, dataset card, redacted logs, and human approval exist.</p></article>
      </div>
      <table class="data-table">
        <thead><tr><th>Quantization Lane</th><th>Status</th><th>Route State</th></tr></thead>
        <tbody>${coverage.modelScalingProfile.quantizationProfiles.map(([lane, status, route]) => `<tr><td>${escapeHtml(lane)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(route)}</td></tr>`).join("")}</tbody>
      </table>
      <table class="data-table">
        <thead><tr><th>RAM Profile</th><th>Target</th><th>Allowed Today</th><th>Claim State</th></tr></thead>
        <tbody>${coverage.modelScalingProfile.compatibilityProfiles.map(([profile, target, allowed, state]) => `<tr><td>${escapeHtml(profile)}</td><td>${escapeHtml(target)}</td><td>${escapeHtml(allowed)}</td><td>${escapeHtml(state)}</td></tr>`).join("")}</tbody>
      </table>
      <table class="data-table">
        <thead><tr><th>Local Runtime Candidate</th><th>Status</th><th>Boundary</th></tr></thead>
        <tbody>${coverage.modelScalingProfile.localRuntimeCandidates.map(([runtime, status, boundary]) => `<tr><td>${escapeHtml(runtime)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(boundary)}</td></tr>`).join("")}</tbody>
      </table>
      <table class="data-table">
        <thead><tr><th>Creation Stage</th><th>Scope</th><th>Status</th></tr></thead>
        <tbody>${coverage.modelScalingProfile.creationStages.map(([stage, scope, status]) => `<tr><td>${escapeHtml(stage)}</td><td>${escapeHtml(scope)}</td><td>${escapeHtml(status)}</td></tr>`).join("")}</tbody>
      </table>
      <p class="status-note">Required 16GB+ measurements before any compatibility claim: ${coverage.modelScalingProfile.requiredMeasurements.map((item) => escapeHtml(item)).join(", ")}.</p>
      <p class="status-note">Benchmark manifest required before route eligibility: <code>${escapeHtml(coverage.modelScalingProfile.benchmarkManifest)}</code> · ${escapeHtml(coverage.modelScalingProfile.benchmarkStatus)}. Gates: ${coverage.modelScalingProfile.benchmarkGates.map((item) => escapeHtml(item)).join(", ")}.</p>
      <p class="status-note">Required 150B evidence before scope: ${coverage.modelScalingProfile.frontierRequiredEvidence.map((item) => escapeHtml(item)).join(", ")}.</p>
    </section>
    <section class="subagent-panel">
      <h3>Safety Boundary</h3>
      <div class="evolution-safety-grid">
        <article><strong>AI</strong><p>Provider-neutral Local Demo by default. No browser secrets and no trained SEIS model claim.</p></article>
        <article><strong>Model Scaling</strong><p>20B is a planned 16GB+ profile. 70B and 150B tiers need future hardware, inference, training, safety, cost, privacy, and benchmark evidence.</p></article>
        <article><strong>SSH/Cloud</strong><p>Real SSH, deployment, firewall, VPN, and cloud mutations remain disabled until explicitly approved.</p></article>
        <article><strong>Review</strong><p>Use validators and snapshots as review evidence; dirty worktree state is reported separately from validator results.</p></article>
      </div>
    </section>
  </section>`;
}

function renderSeisWebsiteApp() {
  const data = getAppData("seis-website");
  const proof = [
    ["OS", "Browser-smoked", "desktop.html + check:desktop-os-browser-smoke"],
    ["AI", "Local Demo", "provider status visible; no browser keys"],
    ["Code", "Validated", "seis-code.html + check:seis-code"],
    ["Design", "Validated surfaces", "Video Hero, Mythic Gacha, WOW references"],
    ["Cloud", "Disabled/planned where needed", "No SSH or deploy from browser"],
    ["Agents", "Dry-run only", "Sub-Agent Control + evidence summary"]
  ];
  return `<section class="app-main seis-website-app" data-seis-website-app>
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="seis-website">Save Website Map</button>
      <button type="button" data-action="open-demo-route" data-value="seis-website-hub">Open Website Hub</button>
      <button type="button" data-action="open-demo-route" data-value="seis-website-ai">Open AI Page</button>
      <button type="button" data-action="open-demo-route" data-value="seis-website-os">Open OS Page</button>
      <button type="button" data-action="generic-export" data-app-id="seis-website">Export Website State</button>
    </div>
    <p class="status-note">SEIS Website is the public-facing product story for the same local demo. It contains dedicated pages for SEIS AI, OS, Code, Design, Search, Cloud, Store, and Agents, all routed back into this operating shell.</p>
    <div class="metric-grid">
      <article class="metric-card"><strong>Website Pages</strong><p>${SEIS_WEBSITE_PAGE_ROUTES.length}</p></article>
      <article class="metric-card"><strong>Mode</strong><p>Local Demo</p></article>
      <article class="metric-card"><strong>Core Keys</strong><p>0 required</p></article>
      <article class="metric-card"><strong>Last Map</strong><p>${data.lastSaved || "Not saved yet"}</p></article>
    </div>
    <div class="demo-route-board compact-routes" aria-label="SEIS website product pages">
      ${SEIS_WEBSITE_PAGE_ROUTES.map((route) => `<article class="demo-route-card">
        <strong>${escapeHtml(route.label)}</strong>
        <p class="muted">${escapeHtml(route.path)}</p>
        <p>${escapeHtml(route.keywords)}</p>
        <button type="button" class="secondary-action" data-action="open-demo-route" data-value="${escapeAttr(route.id)}">Open Page</button>
      </article>`).join("")}
    </div>
    <section class="subagent-panel">
      <h3>Website Proof Matrix</h3>
      <table class="data-table">
        <thead><tr><th>Lane</th><th>Status</th><th>Evidence</th></tr></thead>
        <tbody>${proof.map(([lane, status, evidence]) => `<tr><td>${escapeHtml(lane)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(evidence)}</td></tr>`).join("")}</tbody>
      </table>
    </section>
    <section class="subagent-panel">
      <h3>Five-Year Product Story</h3>
      <div class="evolution-safety-grid">
        <article><strong>Year 1</strong><p>Working demo: OS, Local AI, Search, Code, Design, Cloud mock, Store, Music, Website, docs.</p></article>
        <article><strong>Year 2</strong><p>Alpha: plugin system, provider router, local model support, repository intelligence, auth, safe sync.</p></article>
        <article><strong>Year 3</strong><p>Beta: team collaboration, advanced IDE, design studio, marketplace, deployment system.</p></article>
        <article><strong>Year 4-5</strong><p>Platform and full ecosystem: enterprise controls, remote workspaces, local/cloud AI, public readiness.</p></article>
      </div>
    </section>
  </section>`;
}

function renderWowGalleryApp() {
  const data = getAppData("wow-gallery");
  const totalPages = SEIS_WOW_IMPORTS.reduce((sum, item) => sum + item.pages, 0);
  const totalHtml = SEIS_WOW_IMPORTS.reduce((sum, item) => sum + item.html, 0);
  const highlights = [
    ["SEIS Code Workspace", "./wow-pages/imported/SEIS_WOW_EXTENDED_PAGES/png/08_seis_code_workspace.png", "code"],
    ["SEIS Search", "./wow-pages/imported/SEIS_WOW_EXTENDED_PAGES/png/10_seis_search.png", "search"],
    ["SEIS Design Studio", "./wow-pages/imported/SEIS_WOW_EXTENDED_PAGES/png/11_seis_design_studio.png", "design"],
    ["SEIS Cloud", "./wow-pages/imported/SEIS_WOW_EXTENDED_PAGES/png/12_seis_cloud.png", "cloud"],
    ["AI Control Center", "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART2/png/19_ai_control_center.png", "ai"],
    ["Final Codex Pack", "./wow-pages/imported/SEIS_WOW_MORE_PAGES_PART4/png/100_final_codex_pack.png", "handoff"]
  ];
  return `<section class="app-main wow-gallery-app" data-wow-gallery-app>
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="wow-gallery">Save WOW Index</button>
      <button type="button" data-action="open-demo-route" data-value="wow-gallery-web">Open Full Gallery</button>
      <button type="button" data-action="open-demo-route" data-value="kimi-linuxos-reference">Open Kimi LinuxOS</button>
      <button type="button" data-action="open-demo-route" data-value="kimi-vscode-web-reference">Open Kimi VS Code Web</button>
      <button type="button" data-action="open-app" data-app-id="seis-design">Open SEIS Design</button>
    </div>
    <p class="status-note">SEIS WOW Gallery uses user-provided imported assets as design/reference material. It does not make external provider calls, execute SSH, or treat external Kimi pages as local implementation proof.</p>
    <div class="metric-grid">
      <article class="metric-card"><strong>PNG Pages</strong><p>${totalPages}</p></article>
      <article class="metric-card"><strong>HTML References</strong><p>${totalHtml}</p></article>
      <article class="metric-card"><strong>Kimi Links</strong><p>${SEIS_WOW_REFERENCES.length}</p></article>
      <article class="metric-card"><strong>Last Saved</strong><p>${data.lastSaved ? escapeHtml(data.lastSaved) : "Not saved yet"}</p></article>
    </div>
    <section class="subagent-panel">
      <h3>Imported SEIS_WOW Collections</h3>
      <div class="search-gateway-grid">
        ${SEIS_WOW_IMPORTS.map((item) => `<button type="button" class="search-gateway-card" data-action="open-demo-route" data-value="wow-gallery-web">
          <span>${escapeHtml(item.label)}</span>
          <small>${item.pages} PNG · ${item.html} HTML</small>
          <em>${escapeHtml(item.root)}</em>
        </button>`).join("")}
      </div>
    </section>
    <section class="subagent-panel">
      <h3>Kimi Reference Inputs</h3>
      <div class="search-gateway-grid small">
        ${SEIS_WOW_REFERENCES.map((ref) => `<button type="button" class="search-gateway-card" data-action="open-demo-route" data-value="${escapeAttr(ref.id)}">
          <span>${escapeHtml(ref.title)}</span>
          <small>${escapeHtml(ref.role)}</small>
          <em>External reference. Opens in a separate browser context.</em>
        </button>`).join("")}
      </div>
    </section>
    <section class="subagent-panel">
      <h3>Highlighted Imported Screens</h3>
      <div class="wow-highlight-grid">
        ${highlights.map(([title, src, tag]) => `<button type="button" class="wow-highlight-card" data-action="open-demo-route" data-value="wow-gallery-web">
          <img src="${escapeAttr(src)}" alt="${escapeAttr(title)} preview" loading="lazy">
          <span>${escapeHtml(title)}</span>
          <small>${escapeHtml(tag)}</small>
        </button>`).join("")}
      </div>
    </section>
  </section>`;
}

function renderSeisDesign() {
  const websiteRouteIds = SEIS_WEBSITE_PAGE_ROUTES.map((route) => route.id);
  const routes = DEMO_ROUTES.filter((route) => [
    "seis-code-web",
    "wow-gallery-web",
    "mythic-gacha-web",
    "video-hero-nature",
    "video-hero-still-life",
    "video-hero-materials",
    "video-hero-metal-parts"
  ].includes(route.id) || websiteRouteIds.includes(route.id));
  const data = getAppData("seis-design");
  const creativeTools = LOCAL_ECOSYSTEM_INVENTORY.apps.filter(([, lane]) => ["Document Ops", "Creative Ops", "SEIS Design", "SEIS UX", "SEIS Docs", "SEIS Media"].includes(lane));
  const creativeWorkspaces = LOCAL_ECOSYSTEM_INVENTORY.workspaces.filter(([, type]) => ["Design staging", "Website archive", "UI/archive area"].includes(type));
  return `<section class="app-main seis-design-app" data-seis-design-app>
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="seis-design">Save Design Handoff</button>
      <button type="button" data-action="open-app" data-app-id="seis-code">Open SEIS Code</button>
      <button type="button" data-action="open-app" data-app-id="seis-website">Open SEIS Website</button>
      <button type="button" data-action="open-app" data-app-id="mythic-gacha">Open Mythic Gacha</button>
      <button type="button" data-action="generic-export" data-app-id="seis-design">Export Design State</button>
    </div>
    <p class="status-note">SEIS Design collects the built website demos, motion surfaces, and product-polish handoff in one local workspace. It uses local routes only and does not request image-generation or provider keys at runtime.</p>
    <div class="metric-grid">
      <article class="metric-card"><strong>Websites</strong><p>${routes.length}</p></article>
      <article class="metric-card"><strong>Mode</strong><p>Local Demo</p></article>
      <article class="metric-card"><strong>Last Handoff</strong><p>${data.lastHandoff ? escapeHtml(data.lastHandoff.time) : "Not saved yet"}</p></article>
      <article class="metric-card"><strong>Runtime Assets</strong><p>No live generation key required</p></article>
    </div>
    <div class="demo-route-board" aria-label="SEIS website demo routes">
      ${routes.map((route) => `<article class="demo-route-card">
        <strong>${escapeHtml(route.label)}</strong>
        <p class="muted">${escapeHtml(route.kind)} · ${escapeHtml(route.path)}</p>
        <p>${escapeHtml(route.keywords)}</p>
        <button type="button" class="secondary-action" data-action="open-route" data-value="${escapeAttr(route.path)}">Open Website</button>
      </article>`).join("")}
    </div>
    <section class="subagent-panel local-inventory-panel">
      <h3>Local Creative Tools Mapped to SEIS</h3>
      <p class="muted">${escapeHtml(LOCAL_ECOSYSTEM_INVENTORY.note)}</p>
      <table class="data-table">
        <thead><tr><th>Tool</th><th>SEIS Role</th><th>Use</th><th>Status</th></tr></thead>
        <tbody>${creativeTools.map(([tool, role, use, status]) => `<tr><td>${escapeHtml(tool)}</td><td>${escapeHtml(role)}</td><td>${escapeHtml(use)}</td><td>${escapeHtml(status)}</td></tr>`).join("")}</tbody>
      </table>
    </section>
    <section class="subagent-panel local-inventory-panel">
      <h3>Design Folder Inputs</h3>
      <table class="data-table">
        <thead><tr><th>Folder</th><th>Classification</th><th>SEIS Use</th><th>Status</th></tr></thead>
        <tbody>${creativeWorkspaces.map(([folder, type, use, status]) => `<tr><td>${escapeHtml(folder)}</td><td>${escapeHtml(type)}</td><td>${escapeHtml(use)}</td><td>${escapeHtml(status)}</td></tr>`).join("")}</tbody>
      </table>
    </section>
  </section>`;
}

function renderSeisCloud() {
  const data = getAppData("seis-cloud");
  const runtimeTools = LOCAL_ECOSYSTEM_INVENTORY.apps.filter(([, lane]) => ["Runtime", "Local AI", "Local/Secondary AI", "Agent IDE", "Implementation", "Apple Native", "Development"].includes(lane));
  const checks = [
    ["Core demo", "Available", "Static web app runs without cloud credentials."],
    ["SSH execution", "Disabled", "Requires explicit approval and audited target host."],
    ["Provider keys", "Missing Key", "Core demo remains functional without model-provider keys."],
    ["Deployment", "Planned", "Use a reviewed PR and release gate before publishing."]
  ];
  return `<section class="app-main seis-cloud-app" data-seis-cloud-app>
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="seis-cloud">Run Local Preflight</button>
      <button type="button" data-action="open-app" data-app-id="terminal">Open Terminal</button>
      <button type="button" data-action="open-app" data-app-id="settings">Open Settings</button>
      <button type="button" data-action="generic-export" data-app-id="seis-cloud">Export Cloud Handoff</button>
    </div>
    <p class="status-note">SEIS Cloud is shown as a safe local readiness center in this demo. It does not execute SSH, mutate GitHub, deploy, expose private keys, or connect to external cloud services.</p>
    <div class="metric-grid">
      <article class="metric-card"><strong>Runtime</strong><p>Browser local</p></article>
      <article class="metric-card"><strong>Last Preflight</strong><p>${data.lastPreflight ? escapeHtml(data.lastPreflight.time) : "Not run in this session"}</p></article>
      <article class="metric-card"><strong>SSH Boundary</strong><p>Approval required</p></article>
      <article class="metric-card"><strong>Demo Copy</strong><p>Static folder portable</p></article>
    </div>
    <table class="data-table">
      <thead><tr><th>Surface</th><th>Status</th><th>Evidence</th></tr></thead>
      <tbody>${checks.map(([surface, status, evidence]) => `<tr><td>${escapeHtml(surface)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(evidence)}</td></tr>`).join("")}</tbody>
    </table>
    <section class="subagent-panel local-inventory-panel">
      <h3>Local Runtime and Cloud-Adjacent Tools</h3>
      <p class="muted">These tools are mapped as SEIS runtime references. The browser demo does not launch local apps, run SSH, load provider keys, or mutate cloud services.</p>
      <table class="data-table">
        <thead><tr><th>Tool</th><th>SEIS Role</th><th>Use</th><th>Status</th></tr></thead>
        <tbody>${runtimeTools.map(([tool, role, use, status]) => `<tr><td>${escapeHtml(tool)}</td><td>${escapeHtml(role)}</td><td>${escapeHtml(use)}</td><td>${escapeHtml(status)}</td></tr>`).join("")}</tbody>
      </table>
    </section>
  </section>`;
}

function renderSeisEvolution() {
  const data = getAppData("seis-evolution");
  const activeProfile = ["linux", "macos", "windows"].includes(state.osProfile) ? state.osProfile : "linux";
  const routeIds = [
    "seis-ai-app",
    "seis-code-app",
    "seis-design-app",
    "seis-cloud-app",
    "seis-ai-core-3d-demo",
    "seis-code-web",
    "mythic-gacha-web",
    "video-hero-web"
  ];
  const routes = DEMO_ROUTES.filter((route) => routeIds.includes(route.id));
  return `<section class="app-main seis-evolution-app" data-seis-evolution-app>
    <div class="toolbar">
      <button type="button" data-action="app-primary" data-app-id="seis-evolution">Save Evolution Snapshot</button>
      <button type="button" data-action="open-app" data-app-id="ai-assistant">Open SEIS AI</button>
      <button type="button" data-action="open-app" data-app-id="search">Open Search Engine</button>
      <button type="button" data-action="open-app" data-app-id="seis-code">Open SEIS Code</button>
      <button type="button" data-action="open-app" data-app-id="seis-design">Open SEIS Design</button>
      <button type="button" data-action="open-app" data-app-id="seis-cloud">Open SEIS Cloud</button>
      <button type="button" data-action="generic-export" data-app-id="seis-evolution">Export State</button>
    </div>
    <p class="status-note">This screen converts the pinned SEIS AI, Linux/macOS/Windows desktop, SEIS Code, websites, and SEIS-SSH work into one runnable local demo map. SSH is represented as a controlled execution-plane status only; no command is run from the browser.</p>
    <div class="evolution-layout">
      <aside class="reference-console" aria-label="Pinned reference from latest task screenshot">
        <h3>Sabitlenenler</h3>
        <div class="reference-list">
          ${SEIS_EVOLUTION_REFERENCE.pinned.map(([title, time, note], index) => `<article class="reference-row">
            <span class="${time === "queued" ? "reference-spinner" : "reference-info"}">${time === "queued" ? "" : "i"}</span>
            <div>
              <strong>${escapeHtml(title)}</strong>
              <p>${escapeHtml(note)}</p>
            </div>
            <em>${escapeHtml(time)}</em>
          </article>`).join("")}
        </div>
        <h3>Projeler</h3>
        <div class="project-row"><span class="project-folder"></span><strong>${escapeHtml(SEIS_EVOLUTION_REFERENCE.projectRootLabel)}</strong></div>
        <div class="project-row is-active"><span></span><strong>${escapeHtml(SEIS_EVOLUTION_REFERENCE.activeProject)}</strong><em>${data.lastSnapshot ? "now" : "14 dk."}</em></div>
        <div class="project-row"><span class="project-folder network"></span><strong>${escapeHtml(SEIS_EVOLUTION_REFERENCE.sshProject)}</strong><em>${escapeHtml(SEIS_EVOLUTION_REFERENCE.sshStatus)} <span class="online-dot"></span></em></div>
        <p class="muted">Sohbet yok · local demo state only</p>
      </aside>
      <div class="evolution-main">
        <div class="metric-grid">
          <article class="metric-card"><strong>OS Profile</strong><p>${escapeHtml(activeProfile)}</p></article>
          <article class="metric-card"><strong>SSH</strong><p>${escapeHtml(SEIS_EVOLUTION_REFERENCE.sshHealth)}</p></article>
          <article class="metric-card"><strong>Last Snapshot</strong><p>${data.lastSnapshot ? escapeHtml(data.lastSnapshot.time) : "Not saved yet"}</p></article>
          <article class="metric-card"><strong>Web Routes</strong><p>${routes.length}</p></article>
          <article class="metric-card"><strong>Local Tools</strong><p>${LOCAL_ECOSYSTEM_INVENTORY.apps.length}</p></article>
          <article class="metric-card"><strong>Folder Inputs</strong><p>${LOCAL_ECOSYSTEM_INVENTORY.workspaces.length}</p></article>
        </div>
        <section class="subagent-panel">
          <h3>Integrated Demo Surfaces</h3>
          <table class="data-table">
            <thead><tr><th>Workstream</th><th>Demo Surface</th><th>Status</th></tr></thead>
            <tbody>${SEIS_EVOLUTION_REFERENCE.integrationRows.map(([stream, surface, status]) => `<tr><td>${escapeHtml(stream)}</td><td>${escapeHtml(surface)}</td><td>${escapeHtml(status)}</td></tr>`).join("")}</tbody>
          </table>
        </section>
        <section class="subagent-panel local-inventory-panel">
          <h3>Local Tool Inventory</h3>
          <p class="muted">${escapeHtml(LOCAL_ECOSYSTEM_INVENTORY.note)}</p>
          <table class="data-table">
            <thead><tr><th>Tool</th><th>SEIS Role</th><th>Use</th><th>Status</th></tr></thead>
            <tbody>${LOCAL_ECOSYSTEM_INVENTORY.apps.map(([tool, role, use, status]) => `<tr><td>${escapeHtml(tool)}</td><td>${escapeHtml(role)}</td><td>${escapeHtml(use)}</td><td>${escapeHtml(status)}</td></tr>`).join("")}</tbody>
          </table>
        </section>
        <section class="subagent-panel local-inventory-panel">
          <h3>Local Folder Inputs</h3>
          <table class="data-table">
            <thead><tr><th>Folder</th><th>Classification</th><th>SEIS Use</th><th>Status</th></tr></thead>
            <tbody>${LOCAL_ECOSYSTEM_INVENTORY.workspaces.map(([folder, type, use, status]) => `<tr><td>${escapeHtml(folder)}</td><td>${escapeHtml(type)}</td><td>${escapeHtml(use)}</td><td>${escapeHtml(status)}</td></tr>`).join("")}</tbody>
          </table>
        </section>
        <section class="subagent-panel">
          <h3>Search Gateway Targets</h3>
          <div class="demo-route-board compact-routes">
            ${routes.map((route) => `<article class="demo-route-card">
              <strong>${escapeHtml(route.label)}</strong>
              <p class="muted">${escapeHtml(route.kind)} · ${escapeHtml(route.path)}</p>
              <button type="button" class="secondary-action" data-action="open-route" data-value="${escapeAttr(route.path)}">Open</button>
            </article>`).join("")}
          </div>
        </section>
        <section class="subagent-panel">
          <h3>Five-Year + SSH Boundary</h3>
          <div class="evolution-safety-grid">
            <article><strong>Year 1-2</strong><p>Foundation, local demo, VFS, search, SEIS Code, and evidence docs.</p></article>
            <article><strong>Year 3</strong><p>Write-gated agent lanes with explicit human approval and rollback records.</p></article>
            <article><strong>Year 4</strong><p>SSH/cloud preflight remains approval-gated; no private key enters browser state.</p></article>
            <article><strong>Year 5</strong><p>Public/release readiness after validation, provenance, and model-claims review.</p></article>
          </div>
        </section>
      </div>
    </div>
  </section>`;
}

function renderAiAssistantTab(activeTab, data) {
  if (activeTab === "Installed AI") {
    const systems = getInstalledAiSystems();
    const available = systems.filter((system) => system.status === "Available").length;
    const cloudBlocked = systems.filter((system) => ["Missing Key", "Disabled"].includes(system.status) && system.classification.includes("External")).length;
    return `<div class="installed-ai-panel" data-installed-ai-systems>
      <div class="toolbar">
        <button type="button" data-action="audit-installed-ai-systems">Run Installed AI Audit</button>
        <button type="button" data-action="open-app" data-app-id="terminal">Open Claude REPL</button>
        <button type="button" data-action="open-app" data-app-id="sub-agent-control">Open Sub-Agent Control</button>
      </div>
      <p class="status-note">Installed AI Systems is a truthful bridge between the current supervised AI/operator profiles and the browser-local SEIS AI surface. It does not store credentials, call cloud providers, or claim unavailable models are live.</p>
      <div class="metric-grid">
        <article class="metric-card"><strong>Profiles</strong><p>${systems.length}</p></article>
        <article class="metric-card"><strong>Available Now</strong><p>${available}</p></article>
        <article class="metric-card"><strong>Cloud Blocked</strong><p>${cloudBlocked}</p></article>
        <article class="metric-card"><strong>Last Audit</strong><p>${data.lastInstalledAiAudit ? escapeHtml(data.lastInstalledAiAudit.time) : "Not run yet"}</p></article>
      </div>
      <section class="subagent-panel" data-ai-core-resource-bridge>
        <h3>AI Core Resource Bridge</h3>
        <p class="status-note">Generated sub-agent plan evidence is now exposed to SEIS AI as a read-only local demo resource. It is display and audit evidence, not live autonomous execution.</p>
        <div class="metric-grid">
          <article class="metric-card"><strong>Plan View Resource</strong><p>${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.planViewResource)}</p></article>
          <article class="metric-card"><strong>MCP Contract</strong><p>${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.mcpRuntimeContractResource)}</p></article>
          <article class="metric-card"><strong>Provider Registry</strong><p>${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.providerRegistryResource)}</p></article>
          <article class="metric-card"><strong>Plan View File</strong><p>${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.planView)}</p></article>
          <article class="metric-card"><strong>Quarters</strong><p>${SEIS_AI_CORE_RESOURCE_BRIDGE.quarters}</p></article>
          <article class="metric-card"><strong>Last Export</strong><p>${data.lastResourceBridgeExport ? escapeHtml(data.lastResourceBridgeExport.time) : "Not exported yet"}</p></article>
        </div>
        <div class="toolbar compact-toolbar">
          <button type="button" data-action="export-ai-core-resource-bridge">Export Resource Bridge</button>
          <button type="button" class="secondary-action" data-action="open-app" data-app-id="files">Open Files</button>
        </div>
      </section>
      <section class="subagent-panel" data-installed-ai-core-route-matrix>
        <h3>Installed AI Core Route Matrix</h3>
        <p class="status-note">Each installed AI profile is bound to a SEIS AI Core version target, route mode, credential boundary, and sub-agent duty. This matrix is evidence-only and keeps unavailable providers clearly marked as Missing Key or Disabled.</p>
        <div class="metric-grid">
          <article class="metric-card"><strong>Routed Profiles</strong><p>${SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.length}</p></article>
          <article class="metric-card"><strong>Available Routes</strong><p>${SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.filter((route) => route.providerState === "Available").length}</p></article>
          <article class="metric-card"><strong>No-Key Core</strong><p>Active</p></article>
          <article class="metric-card"><strong>Last Export</strong><p>${data.lastAiCoreRouteMatrixExport ? escapeHtml(data.lastAiCoreRouteMatrixExport.time) : "Not exported yet"}</p></article>
        </div>
        <table class="data-table">
          <thead><tr><th>Installed AI</th><th>AI Core target</th><th>Route state</th><th>Sub-agent duty</th></tr></thead>
          <tbody>${SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.map((route) => `<tr data-installed-ai-core-route="${escapeAttr(route.systemId)}">
            <td><strong>${escapeHtml(route.systemName)}</strong><br><span class="muted">${escapeHtml(route.credentialBoundary)}</span></td>
            <td>${escapeHtml(route.versionLabel)}<br><span class="muted">${escapeHtml(route.versionTargetId)}</span></td>
            <td>${escapeHtml(route.providerState)}<br><span class="muted">${escapeHtml(route.routeMode)}</span></td>
            <td>${escapeHtml(route.subAgentDuty)}</td>
          </tr>`).join("")}</tbody>
        </table>
        <div class="toolbar compact-toolbar">
          <button type="button" data-action="export-installed-ai-core-route-matrix">Export Route Matrix</button>
          <button type="button" class="secondary-action" data-action="export-ai-core-resource-bridge">Export Resource Bridge</button>
        </div>
      </section>
      <section class="subagent-panel" data-personal-plugin-ai-core-lane-matrix>
        <h3>Personal Plugin AI Core Lane Matrix</h3>
        <p class="status-note">The installed personal SEIS plugin family is bound to explicit AI Core version gates, direct plan/status tool pairs, and plan-only permission boundaries. This is evidence-only and does not authenticate connectors or run external tools.</p>
        <div class="metric-grid">
          <article class="metric-card"><strong>Plugin Lanes</strong><p>${SEIS_PERSONAL_PLUGIN_AI_CORE_LANE_MATRIX.length}</p></article>
          <article class="metric-card"><strong>Permission</strong><p>plan-only</p></article>
          <article class="metric-card"><strong>MCP Resource</strong><p>seis://agent/plugin-integration.json</p></article>
          <article class="metric-card"><strong>Last Export</strong><p>${data.lastPersonalPluginLaneMatrixExport ? escapeHtml(data.lastPersonalPluginLaneMatrixExport.time) : "Not exported yet"}</p></article>
        </div>
        <table class="data-table">
          <thead><tr><th>Plugin lane</th><th>AI Core target</th><th>Tool pair</th><th>Version duty</th></tr></thead>
          <tbody>${SEIS_PERSONAL_PLUGIN_AI_CORE_LANE_MATRIX.map((lane) => `<tr data-personal-plugin-ai-core-lane="${escapeAttr(lane.laneId)}">
            <td><strong>${escapeHtml(lane.pluginId)}</strong><br><span class="muted">${escapeHtml(lane.displayName)} · ${escapeHtml(lane.permissionLevel)}</span></td>
            <td>${escapeHtml(lane.versionLabel)}<br><span class="muted">${escapeHtml(lane.versionTargetId)}</span></td>
            <td>${escapeHtml(lane.toolPair)}<br><span class="muted">${escapeHtml(lane.gate)}</span></td>
            <td>${escapeHtml(lane.versionDuty)}</td>
          </tr>`).join("")}</tbody>
        </table>
        <div class="toolbar compact-toolbar">
          <button type="button" data-action="export-personal-plugin-ai-core-lane-matrix">Export Plugin Lane Matrix</button>
          <button type="button" class="secondary-action" data-action="export-personal-plugin-bridge">Export Plugin Bridge</button>
        </div>
      </section>
      <section class="subagent-panel" data-mcp-runtime-contract>
        <h3>MCP Runtime Contract</h3>
        <p class="status-note">The SEIS AI MCP bridge is locally smoke-verified over stdio JSON-RPC. It exposes repo-backed tools, prompts, and resources without dependency installation, remote MCP servers, credentials, SSH, deployment, or GitHub mutation.</p>
        <div class="metric-grid">
          <article class="metric-card"><strong>Tools</strong><p>${SEIS_MCP_RUNTIME_CONTRACT.toolCount}</p></article>
          <article class="metric-card"><strong>Resources</strong><p>${SEIS_MCP_RUNTIME_CONTRACT.resourceCount}</p></article>
          <article class="metric-card"><strong>Prompts</strong><p>${SEIS_MCP_RUNTIME_CONTRACT.promptCount}</p></article>
          <article class="metric-card"><strong>Status</strong><p>${escapeHtml(SEIS_MCP_RUNTIME_CONTRACT.status)}</p></article>
          <article class="metric-card"><strong>Transport</strong><p>${escapeHtml(SEIS_MCP_RUNTIME_CONTRACT.transport)}</p></article>
        </div>
        <table class="data-table">
          <thead><tr><th>Surface</th><th>Count</th><th>Method</th><th>SEIS AI Core duty</th></tr></thead>
          <tbody>${SEIS_MCP_RUNTIME_CONTRACT.surfaces.map((surface) => `<tr data-mcp-runtime-surface="${escapeAttr(surface.id)}">
            <td><strong>${escapeHtml(surface.label)}</strong><br><span class="muted">${escapeHtml(surface.evidence)}</span></td>
            <td>${surface.count}</td>
            <td>${escapeHtml(surface.method)}</td>
            <td>${escapeHtml(surface.duty)}</td>
          </tr>`).join("")}</tbody>
        </table>
        <div class="toolbar compact-toolbar">
          <button type="button" data-action="export-mcp-runtime-contract">Export MCP Contract</button>
          <button type="button" class="secondary-action" data-action="export-ai-core-resource-bridge">Export Resource Bridge</button>
        </div>
      </section>
      <table class="data-table" data-installed-ai-system-table>
        <thead><tr><th>System</th><th>Status</th><th>Role</th><th>Credential Boundary</th></tr></thead>
        <tbody>${systems.map((system) => `<tr data-installed-ai-system="${escapeAttr(system.id)}">
          <td><strong>${escapeHtml(system.name)}</strong><br><span class="muted">${escapeHtml(system.classification)}</span></td>
          <td>${escapeHtml(system.status)}</td>
          <td>${escapeHtml(system.role)}</td>
          <td>${escapeHtml(system.keyPolicy)}</td>
        </tr>`).join("")}</tbody>
      </table>
      <div class="app-card-grid">
        ${systems.map((system) => `<article class="mini-card installed-ai-card">
          <strong>${escapeHtml(system.name)}</strong>
          <p class="muted">${escapeHtml(system.status)} · ${escapeHtml(system.role)}</p>
          <p>${escapeHtml(system.capability)}</p>
          <p class="status-note">${escapeHtml(system.boundary)}</p>
        </article>`).join("")}
      </div>
    </div>`;
  }
  if (activeTab === "Plugin Center") {
    return `<div class="plugin-center" data-ai-plugin-center>
      <section class="subagent-panel" data-personal-plugin-bridge>
        <h3>Personal SEIS Plugin Bridge</h3>
        <p class="status-note">These installed personal plugin identities are embedded under <code>seis-ai-agent@seis-repo</code> and exposed to SEIS AI through the local manifest, MCP resource, and direct plan/status tools. No standalone lane plugin is published from this browser surface.</p>
        <div class="metric-grid">
          <article class="metric-card"><strong>Personal Plugins</strong><p>${SEIS_PERSONAL_PLUGIN_BRIDGE.length}</p></article>
          <article class="metric-card"><strong>MCP Resource</strong><p>seis://agent/plugin-integration.json</p></article>
          <article class="metric-card"><strong>Runtime</strong><p>Local Demo</p></article>
          <article class="metric-card"><strong>Last Export</strong><p>${data.lastPersonalPluginBridgeExport ? escapeHtml(data.lastPersonalPluginBridgeExport.time) : "Not exported yet"}</p></article>
        </div>
        <table class="data-table">
          <thead><tr><th>Installed plugin</th><th>Embedded lane</th><th>Tools</th><th>Gate</th></tr></thead>
          <tbody>${SEIS_PERSONAL_PLUGIN_BRIDGE.map((plugin) => `<tr data-personal-plugin="${escapeAttr(plugin.id)}">
            <td><strong>${escapeHtml(plugin.id)}</strong><br><span class="muted">${escapeHtml(plugin.sourceMirror)}</span></td>
            <td>${escapeHtml(plugin.embeddedAs)}<br><span class="muted">${escapeHtml(plugin.embeddedSkill)}</span></td>
            <td>${escapeHtml(plugin.statusTool)}<br>${escapeHtml(plugin.planTool)}</td>
            <td>${escapeHtml(plugin.defaultGate)}</td>
          </tr>`).join("")}</tbody>
        </table>
        <div class="toolbar compact-toolbar">
          <button type="button" data-action="export-personal-plugin-bridge">Export Plugin Bridge</button>
          <button type="button" class="secondary-action" data-action="export-ai-core-resource-bridge">Export AI Core Bridge</button>
        </div>
      </section>
      ${getAiPlugins().map((plugin) => `<article class="mini-card plugin-card">
        <strong>${escapeHtml(plugin.name)}</strong>
        <p class="muted">${escapeHtml(plugin.lane || "Local")} · ${plugin.enabled ? "Enabled" : "Disabled"}</p>
        <p>${escapeHtml(plugin.capability || "Local SEIS AI capability lane.")}</p>
        <button type="button" class="secondary-action" data-action="toggle-ai-plugin" data-value="${escapeAttr(plugin.id)}">${plugin.enabled ? "Disable" : "Enable"}</button>
      </article>`).join("")}
    </div>`;
  }
  if (activeTab === "Sub-Agent Plan") {
    return `<div class="subagent-ai-plan" data-subagent-ai-plan>
      <div class="toolbar">
        <button type="button" data-action="open-app" data-app-id="sub-agent-control">Open Sub-Agent Control</button>
        <button type="button" data-action="app-primary" data-app-id="sub-agent-control">Run Dry-Run Check</button>
      </div>
      <p class="status-note">This tab exposes the five-year lane plan inside SEIS AI without claiming live autonomous execution. Provider identity remains Local Demo unless a backend provider is configured.</p>
      <div class="metric-grid">
        <article class="metric-card"><strong>Mode</strong><p>${escapeHtml(SUB_AGENT_DEMO.runtime)}</p></article>
        <article class="metric-card"><strong>Lanes</strong><p>${SUB_AGENT_DEMO.lanes.length}</p></article>
        <article class="metric-card"><strong>Years</strong><p>${SUB_AGENT_DEMO.years.length}</p></article>
        <article class="metric-card"><strong>Gates</strong><p>${SUB_AGENT_DEMO.gates.length}</p></article>
      </div>
      <section class="subagent-panel" data-subagent-plan-view-resource>
        <h3>Generated Plan View</h3>
        <p class="status-note">${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.planViewResource)}</p>
        <table class="data-table">
          <tbody>
            <tr><th>Source plan</th><td>${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.sourcePlan)}</td></tr>
            <tr><th>Generated file</th><td>${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.planView)}</td></tr>
            <tr><th>MCP runtime contract</th><td>${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.mcpRuntimeContractResource)}</td></tr>
            <tr><th>Provider registry</th><td>${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.providerRegistryResource)}</td></tr>
            <tr><th>MCP manifest</th><td>${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.pluginManifestResource)}</td></tr>
            <tr><th>Validator</th><td>${escapeHtml(SEIS_AI_CORE_RESOURCE_BRIDGE.validator)}</td></tr>
          </tbody>
        </table>
      </section>
      <div class="app-card-grid">
        ${SUB_AGENT_DEMO.lanes.map(([name, lane, planId, scope]) => `<article class="mini-card">
          <strong>${escapeHtml(name)}</strong>
          <p class="muted">${escapeHtml(lane)} · ${escapeHtml(planId)}</p>
          <p>${escapeHtml(scope)}</p>
        </article>`).join("")}
      </div>
    </div>`;
  }
  if (activeTab === "Tool Calls") {
    const calls = data.toolCalls || [];
    return `<div class="list" data-ai-tool-calls>
      ${calls.map((call) => `<article class="mini-card"><strong>${escapeHtml(call.name)}</strong><p class="muted">${escapeHtml(call.status)} · ${escapeHtml(call.scope)}</p></article>`).join("")}
    </div>`;
  }
  if (activeTab === "History") {
    return `<div class="list">${(data.messages || []).map((message) => `<article class="mini-card"><strong>${escapeHtml(message.role)}</strong><p>${escapeHtml(message.text)}</p></article>`).join("")}</div>`;
  }
  return `<div class="split-pane">
    <div>
      <textarea class="textarea" data-assistant-input>Summarize this desktop.</textarea>
      <p class="status-note">The SEIS AI App can open SEIS Code, inspect local route records, and route plugin-lane controls without provider keys.</p>
    </div>
    <div class="metric-grid">
      <article class="metric-card"><strong>Demo Entry</strong><p>SEIS Desktop</p></article>
      <article class="metric-card"><strong>Search Routes</strong><p>${DEMO_ROUTES.length}</p></article>
      <article class="metric-card"><strong>Plugin Lanes</strong><p>${getAiPlugins().length}</p></article>
      <article class="metric-card"><strong>VFS Mode</strong><p>Desktop + SEIS Code IndexedDB bridge</p></article>
    </div>
  </div>`;
}

function getAiPlugins() {
  ensureAiPluginInventory();
  return state.installedExtensions
    .filter((extension) => extension.id.startsWith("seis-") || extension.id.startsWith("ai."))
    .map((extension) => ({
      ...extension,
      capability: SEIS_AI_PLUGIN_LANES.find((plugin) => plugin.id === extension.id)?.capability || extension.capability
    }));
}

function getInstalledAiSystems() {
  return SEIS_INSTALLED_AI_SYSTEMS.map((system) => ({ ...system }));
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
    osProfile: () => state.osProfile || "linux",
    wallpaperState: () => ({
      active: state.wallpaper || "summit",
      shell: shell?.dataset.wallpaper || "",
      available: WALLPAPERS.map((item) => ({ ...item }))
    }),
    bootState: () => ({
      exists: Boolean(bootScreen),
      complete: Boolean(bootScreen?.classList.contains("is-complete") || bootScreen?.hidden),
      hidden: Boolean(bootScreen?.hidden),
      text: bootScreen?.textContent?.replace(/\s+/g, " ").trim() || ""
    }),
    launcherState: () => ({
      frequentApps: Array.from(document.querySelectorAll("[data-launcher-frequent] [data-action='open-app']")).map((button) => button.dataset.appId || ""),
      categories: Array.from(document.querySelectorAll("[data-launcher-categories] button")).map((button) => button.textContent.trim()),
      visibleApps: Array.from(document.querySelectorAll("[data-launcher-grid] .launcher-app")).map((button) => button.dataset.appId || "")
    }),
    contextMenuState: () => ({
      open: Boolean(contextMenu && !contextMenu.hidden),
      kind: contextMenu?.querySelector("[data-context-kind]")?.dataset.contextKind || "",
      actions: Array.from(contextMenu?.querySelectorAll("button") || []).map((button) => button.dataset.action || button.textContent.trim())
    }),
    systemState: () => {
      const system = getSystemState();
      return {
        networkOnline: system.networkOnline,
        audioMuted: system.audioMuted,
        volume: system.volume,
        notifications: system.notifications.map((item) => ({
          title: item.title,
          scope: item.scope,
          time: item.time
        })),
        recent: system.recent.map((item) => ({
          type: item.type,
          title: item.title,
          appId: item.appId,
          path: item.path
        }))
      };
    },
    shortcutState: () => {
      const system = getSystemState();
      return {
        groups: KEYBOARD_SHORTCUT_GROUPS.length,
        shortcuts: KEYBOARD_SHORTCUT_GROUPS.reduce((total, group) => total + group.shortcuts.length, 0),
        opens: Number(system.shortcutOverlay.opens || 0),
        lastOpened: system.shortcutOverlay.lastOpened || "",
        lastShortcut: system.shortcutOverlay.lastShortcut || "",
        visible: !shortcutOverlay.hidden
      };
    },
    aiCoreMiniMap: () => ({
      ready: desktopAiCoreCanvas?.dataset.aiCoreMiniMapReady === "true",
      mode: desktopAiCoreCanvas?.dataset.aiCoreMiniMapMode || "unknown"
    }),
    activeWorkspace: () => currentWorkspace(),
    workspaceWindows: () => state.windows.map((win) => ({
      id: win.id,
      appId: win.appId,
      name: getApp(win.appId).name,
      workspace: ensureWindowWorkspace(win),
      visible: isWindowInActiveWorkspace(win)
    })),
    sessionWindows: () => serializeSessionWindows().map((win) => ({
      appId: win.appId,
      workspace: win.workspace,
      x: win.x,
      y: win.y,
      w: win.w,
      h: win.h,
      z: win.z,
      minimized: win.minimized,
      maximized: win.maximized,
      fullscreen: win.fullscreen,
      snap: win.snap
    })),
    visibleWindowTitles: () => visibleWindows().map((win) => getApp(win.appId).name),
    installedAiSystems: () => getInstalledAiSystems(),
    installedAiCoreRouteMatrix: () => SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX.map((route) => ({ ...route })),
    personalPluginAiCoreLaneMatrix: () => SEIS_PERSONAL_PLUGIN_AI_CORE_LANE_MATRIX.map((lane) => ({ ...lane })),
    mcpRuntimeContract: () => ({
      ...SEIS_MCP_RUNTIME_CONTRACT,
      surfaces: SEIS_MCP_RUNTIME_CONTRACT.surfaces.map((surface) => ({ ...surface }))
    }),
    personalPluginBridge: () => SEIS_PERSONAL_PLUGIN_BRIDGE.map((plugin) => ({ ...plugin })),
    aiCoreResourceBridge: () => ({ ...SEIS_AI_CORE_RESOURCE_BRIDGE }),
    v17CommandCenter: () => getV17CommandCenterCoverage(),
    codeIdeState: () => {
      const data = getCodeIdeData();
      const files = getCodeIdeFiles();
      const active = getNode(state.codePath) || files[0];
      return {
        activePanel: data.activePanel,
        panelCount: CODE_IDE_PANELS.length,
        searchQuery: data.searchQuery,
        searchResultCount: getCodeIdeSearchResults(data, files).length,
        sourceControlMode: data.sourceControlMode,
        assistantMode: data.assistantMode,
        commandHistoryCount: data.commandHistory.length,
        selectedFile: active?.path || "",
        hasPreviewPanel: true,
        hasSafeMockSourceControl: data.sourceControlMode === "Safe Mock",
        hasLocalDemoAssistant: data.assistantMode === "Local Demo"
      };
    },
    subAgentProcesses: () => getSubAgentProcesses(),
    aiCoreOrbit: () => {
      const simulation = getSubAgentSimulationState();
      const orbit = getAiCoreOrbitState(simulation.completedQuarters || 0);
      return {
        ...orbit,
        versionTargets: AI_CORE_VERSION_TARGETS.map((target) => ({ id: target.id, label: target.label, title: target.title }))
      };
    },
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
    openWindows: () => visibleWindows().map((win) => getApp(win.appId).name),
    allWindows: () => state.windows.map((win) => getApp(win.appId).name),
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
    try {
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
    } catch (error) {
      terminalAppend(output, String(error.message || error), "error");
    }
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
    if (!args[0]) throw new Error("mkdir: missing operand");
    const target = resolvePath(args[0]);
    ensureDirectory(target);
    return [`created directory ${target}`];
  },
  touch: (args) => {
    if (!args[0]) throw new Error("touch: missing operand");
    const target = resolvePath(args[0]);
    upsertFile(target, getNode(target)?.content || "");
    return [`touched ${target}`];
  },
  cat: (args) => [readFile(resolvePath(args[0]))],
  echo: (args) => [args.join(" ")],
  printf: (args) => [args.join(" ").replaceAll("\\n", "\n")],
  head: (args) => readFile(resolvePath(args.at(-1))).split("\n").slice(0, Number(args[0]) || 10),
  tail: (args) => readFile(resolvePath(args.at(-1))).split("\n").slice(-(Number(args[0]) || 10)),
  cp: (args) => {
    if (!args[0] || !args[1]) throw new Error("cp: missing operand");
    const source = getNode(resolvePath(args[0]));
    let target = resolvePath(args[1]);
    if (!source || source.type !== "file") throw new Error("cp: source file not found");
    if (getNode(target)?.type === "dir") target = normalizePath(`${target}/${baseName(source.path)}`);
    upsertFile(target, source.content);
    return [`copied ${source.path} to ${target}`];
  },
  mv: (args) => {
    if (!args[0] || !args[1]) throw new Error("mv: missing operand");
    const sourcePath = resolvePath(args[0]);
    const targetPath = resolvePath(args[1]);
    const destination = moveNodePath(sourcePath, targetPath);
    return [`moved ${sourcePath} to ${destination}`];
  },
  rm: (args) => {
    if (!args[0]) throw new Error("rm: missing operand");
    const target = resolvePath(args[0]);
    const node = getNode(target);
    if (!node) throw new Error("rm: not found");
    if (node.type === "dir") throw new Error("rm: use rmdir for directories");
    removeNodePath(target);
    return [`removed ${target}`];
  },
  rmdir: (args) => {
    if (!args[0]) throw new Error("rmdir: missing operand");
    const target = resolvePath(args[0]);
    removeNodePath(target, { requireEmptyDir: true });
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
  const routeResults = DEMO_ROUTES.filter((route) => routeMatches(route, query)).slice(0, 10);
  const fileResults = state.fs.filter((item) => item.path.toLowerCase().includes(query)).slice(0, 6);
  const spotlightResults = SEARCH_SPOTLIGHT_ITEMS.filter((item) => (
    !query || `${item.title} ${item.meta} ${item.description} ${item.keywords}`.toLowerCase().includes(query)
  )).slice(0, query ? 6 : SEARCH_SPOTLIGHT_ITEMS.length);
  const spotlightHtml = spotlightResults.length ? `<section class="command-spotlight" aria-label="SEIS demo spotlight">
    <div class="command-spotlight-title">
      <span>SEIS demo spotlight</span>
      <small>${query ? "Matched demo surfaces" : "Open Code, Design, Cloud, AI Core, and websites"}</small>
    </div>
    <div class="command-spotlight-grid">
      ${spotlightResults.map((item) => `<button type="button" class="command-spotlight-card" data-action="${escapeAttr(item.action)}"${item.appId ? ` data-app-id="${escapeAttr(item.appId)}"` : ""}${item.routeId ? ` data-value="${escapeAttr(item.routeId)}"` : ""}>
        <span>${escapeHtml(item.title)}</span>
        <small>${escapeHtml(item.meta)}</small>
        <em>${escapeHtml(item.description)}</em>
      </button>`).join("")}
    </div>
  </section>` : "";
  const resultHtml = [
    spotlightHtml,
    ...routeResults.map((route) => `<button type="button" class="command-result" data-action="open-demo-route" data-value="${escapeAttr(route.id)}"><span>${escapeHtml(route.label)}</span><span>${escapeHtml(route.kind)}</span></button>`),
    ...appResults.map((app) => `<button type="button" class="command-result" data-action="open-app" data-app-id="${app.id}"><span>${escapeHtml(app.icon)} ${escapeHtml(app.name)}</span><span>${escapeHtml(app.category)}</span></button>`),
    ...fileResults.map((fileItem) => `<button type="button" class="command-result" data-action="open-file" data-path="${escapeAttr(fileItem.path)}"><span>${escapeHtml(baseName(fileItem.path))}</span><span>${escapeHtml(fileItem.path)}</span></button>`)
  ].filter(Boolean).join("");
  commandResults.innerHTML = resultHtml || "<p class=\"muted\">No results.</p>";
}

function openDemoRoute(routeId) {
  const route = DEMO_ROUTES.find((item) => item.id === routeId);
  if (!route) return;
  setLauncher(false);
  setCommandPalette(false);
  if (route.appId) {
    openApp(route.appId);
    log("route", `Opened ${route.label} from SEIS Search.`);
    return;
  }
  if (route.external) {
    window.open(route.path, "_blank", "noopener");
    log("route", `Opened external reference ${route.label}.`);
    return;
  }
  window.location.href = route.path;
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

function dismissDemoGuide() {
  const guide = document.querySelector(".desktop-demo-guide");
  if (!guide) return;
  guide.hidden = true;
  log("desktop", "First-run demo guide hidden by local user action.");
  saveState();
  toast("Demo Guide", "Guide hidden for this session.");
}

function updateWorkspaceControls() {
  const workspace = currentWorkspace();
  document.querySelectorAll("[data-workspace]").forEach((button) => {
    const active = button.dataset.workspace === workspace;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setWorkspace(workspace) {
  state.workspace = normalizeWorkspaceId(workspace);
  updateWorkspaceControls();
  activeWindowId = visibleWindows().at(-1)?.id || null;
  renderOpenWindows();
  log("workspace", `Workspace switched to ${state.workspace}.`);
  saveState();
}

function applyTheme() {
  document.body.classList.toggle("light", state.theme === "light");
  updateWorkspaceControls();
  const profile = ["linux", "macos", "windows"].includes(state.osProfile) ? state.osProfile : "linux";
  const wallpaper = WALLPAPERS.some((item) => item.id === state.wallpaper) ? state.wallpaper : "summit";
  shell.dataset.osProfile = profile;
  shell.dataset.wallpaper = wallpaper;
  document.querySelectorAll("[data-action=\"set-os-profile\"]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === profile);
    button.setAttribute("aria-pressed", String(button.dataset.value === profile));
  });
}

function setOsProfile(profile) {
  if (!["linux", "macos", "windows"].includes(profile)) return;
  state.osProfile = profile;
  applyTheme();
  log("settings", `Desktop profile changed to ${profile}.`);
  toast("Desktop Profile", `${profile} profile active.`);
  saveState();
  renderOpenWindows("sub-agent-control");
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

function ensureDirectory(path) {
  const normalized = normalizePath(path);
  if (normalized === "/") return null;
  const existing = getNode(normalized);
  if (existing) {
    if (existing.type !== "dir") throw new Error(`not a directory: ${normalized}`);
    return existing;
  }
  const parent = dirName(normalized);
  if (parent !== normalized) ensureDirectory(parent);
  const folder = dir(normalized);
  state.fs.push(folder);
  mirrorNodeToCodeWorkspace(folder, "seis-desktop-folder");
  return folder;
}

function setPathIfWithin(value, sourcePath, targetPath) {
  if (!value) return value;
  const normalized = normalizePath(value);
  if (normalized === sourcePath) return targetPath;
  if (normalized.startsWith(`${sourcePath}/`)) return normalizePath(`${targetPath}${normalized.slice(sourcePath.length)}`);
  return value;
}

function moveNodePath(sourcePath, targetPath) {
  const normalizedSource = normalizePath(sourcePath);
  const normalizedTarget = normalizePath(targetPath);
  if (["/", "/home", DESKTOP_HOME].includes(normalizedSource)) throw new Error("mv: protected path");
  const source = getNode(normalizedSource);
  if (!source) throw new Error("mv: source not found");
  const destination = getNode(normalizedTarget)?.type === "dir"
    ? normalizePath(`${normalizedTarget}/${baseName(normalizedSource)}`)
    : normalizedTarget;
  if (destination === normalizedSource) throw new Error("mv: source and destination are the same");
  if (source.type === "dir" && destination.startsWith(`${normalizedSource}/`)) {
    throw new Error("mv: cannot move a directory into itself");
  }
  if (getNode(destination) && destination !== normalizedSource) throw new Error("mv: destination already exists");
  const parent = dirName(destination);
  ensureDirectory(parent);
  const affected = state.fs.filter((item) => item.path === normalizedSource || item.path.startsWith(`${normalizedSource}/`));
  for (const item of affected) {
    const previousPath = item.path;
    item.path = normalizePath(`${destination}${previousPath.slice(normalizedSource.length)}`);
    item.updatedAt = new Date().toISOString();
    removePathFromCodeWorkspace(previousPath, "seis-desktop-move");
    mirrorNodeToCodeWorkspace(item, "seis-desktop-move");
  }
  state.currentDir = setPathIfWithin(state.currentDir, normalizedSource, destination);
  state.selectedPath = setPathIfWithin(state.selectedPath, normalizedSource, destination);
  state.codePath = setPathIfWithin(state.codePath, normalizedSource, destination);
  log("fs", `Moved ${normalizedSource} to ${destination}.`);
  saveState();
  return destination;
}

function removeNodePath(path, { requireEmptyDir = false, trash = false } = {}) {
  const normalized = normalizePath(path);
  if (["/", "/home", DESKTOP_HOME].includes(normalized)) throw new Error("protected path");
  const target = getNode(normalized);
  if (!target) throw new Error(`not found: ${normalized}`);
  const descendants = state.fs.filter((item) => item.path.startsWith(`${normalized}/`));
  if (target.type === "dir" && requireEmptyDir && descendants.length) throw new Error("rmdir: directory not empty");
  const affected = [target, ...descendants];
  for (const item of affected) {
    if (trash) {
      item.trashed = true;
      item.updatedAt = new Date().toISOString();
    } else {
      state.fs = state.fs.filter((candidate) => candidate !== item);
    }
    removePathFromCodeWorkspace(item.path, trash ? "seis-desktop-trash" : "seis-desktop-remove");
  }
  state.currentDir = setPathIfWithin(state.currentDir, normalized, dirName(normalized));
  state.selectedPath = dirName(normalized);
  if (state.codePath && (state.codePath === normalized || state.codePath.startsWith(`${normalized}/`))) {
    state.codePath = "/home/seis/Documents/welcome.md";
  }
  log("fs", `${trash ? "Moved to trash" : "Removed"} ${normalized}.`);
  saveState();
  return normalized;
}

function upsertFile(path, content) {
  const normalized = normalizePath(path);
  const parent = dirName(normalized);
  ensureDirectory(parent);
  let target = getNode(normalized);
  if (!target) {
    target = file(normalized, content);
    state.fs.push(target);
  } else if (target.type !== "file") {
    throw new Error(`cannot write to directory: ${normalized}`);
  } else {
    target.content = content;
    target.updatedAt = new Date().toISOString();
  }
  log("fs", `Saved ${normalized}.`);
  recordRecent({ type: "file", path: normalized, title: baseName(normalized) });
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
    recordRecent({ type: "file", path: target.path, title: baseName(target.path) });
    renderOpenWindows("seis-code");
    saveState();
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
  ensureDirectory(path);
  state.selectedPath = path;
  log("fs", `Created folder ${path}.`);
  saveState();
  renderOpenWindows("files");
}

function deleteSelectedFile() {
  if (!state.selectedPath || state.selectedPath === "/home/seis") return;
  removeNodePath(state.selectedPath, { trash: true });
  renderOpenWindows("files");
}

function renameSelectedFile(path = state.selectedPath) {
  const target = getNode(path);
  if (!target || ["/", "/home", DESKTOP_HOME].includes(target.path)) {
    toast("Rename Blocked", "Select a renameable file or folder first.", { scope: "fs" });
    return;
  }
  const nextName = prompt("Rename", baseName(target.path));
  if (!nextName) return;
  const previousName = baseName(target.path);
  const destination = normalizePath(`${dirName(target.path)}/${nextName}`);
  try {
    moveNodePath(target.path, destination);
    state.selectedPath = destination;
    toast("Renamed", `${previousName} renamed to ${baseName(destination)}.`);
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
    upsertFile(path, `# SEIS Search Gateway Map\n\nGenerated: ${new Date().toISOString()}\nQuery: ${data.query}\n\n## Core Apps\n- SEIS System OS: Linux, macOS, and Windows-inspired shell where the rest of SEIS appears.\n- SEIS Code: VS Code-like desktop app.\n- Code IDE: dedicated IDE cockpit.\n- SEIS Design: design, website, and handoff surface.\n- SEIS Cloud: SSH/cloud safety and local runtime boundary.\n- SEIS Store: local app and route catalog.\n- Music: local demo soundtrack.\n- SEIS WOW Gallery: imported visual reference board for Kimi and SEIS_WOW packages.\n- SEIS AI: Local Demo AI Control Center.\n\n## Website Routes\n${websiteRoutes.map((route) => `- ${route.label}: ${route.path}`).join("\n")}\n\n## Local Tool Inventory\n${LOCAL_ECOSYSTEM_INVENTORY.apps.map(([tool, role, use, status]) => `- ${tool}: ${role} / ${use} / ${status}`).join("\n")}\n\n## Safety\nNo application bundles, private keys, provider secrets, SSH commands, or licensed app contents are copied into this browser demo. External Kimi links are labeled as references.\n`);
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

## Model Scaling Boundary
- 16GB+ RAM floor: ${coverage.modelScalingFloor}
- Future scale: ${coverage.modelScalingFuture}
- 150B frontier target: ${coverage.modelScalingProfile.frontierTarget} / ${coverage.modelScalingProfile.frontierStatus}
- Memory budget status: ${coverage.modelScalingProfile.memoryBudgetStatus}
- Compatibility claim: ${coverage.modelScalingProfile.compatibilityClaim}
- Quantization lanes: ${coverage.modelScalingProfile.quantizationProfiles.map(([lane, status, route]) => `${lane} / ${status} / ${route}`).join("; ")}
- Local runtime candidates: ${coverage.modelScalingProfile.localRuntimeCandidates.map(([runtime, status, boundary]) => `${runtime} / ${status} / ${boundary}`).join("; ")}
- Required measurements: ${coverage.modelScalingProfile.requiredMeasurements.join(", ")}
- Required 150B evidence: ${coverage.modelScalingProfile.frontierRequiredEvidence.join(", ")}
- Training/inference ownership claim: none
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

function defaultGenericText(app) {
  if (app.type === "markdown") return "# Draft\n\n- Write\n- Preview\n- Export\n";
  if (app.type === "mail") return "To: draft@example.local\nSubject: Local draft\n\nThis app saves drafts locally and does not send mail.";
  if (app.type === "weather") return `Local weather: ${getAppData("weather").temperature} C, ${getAppData("weather").condition}`;
  if (app.type === "launchpad") return `SEIS Launchpad\n\nApps: ${APPS.length}\nFeatured: SEIS Code, Code IDE, SEIS Design, SEIS Cloud, Music, Store.\n`;
  if (app.type === "seis-command-center") return buildV17CommandCenterSnapshotMarkdown(new Date().toISOString());
  if (app.type === "store") return `SEIS Store\n\nLocal catalog only. No dependency installation, payment flow, external store access, or provider key is required.\n`;
  if (app.type === "music") return `SEIS Music\n\n${SEIS_MUSIC_TRACKS.map((track) => `- ${track.title} / ${track.artist} / ${track.mood}`).join("\n")}\n`;
  if (app.type === "code-ide") return `SEIS Code IDE\n\nDedicated cockpit for SEIS Code, terminal commands, extensions, VFS files, and the standalone SEIS Code Web route.\n`;
  if (app.type === "seis-website") return `SEIS Website\n\n${SEIS_WEBSITE_PAGE_ROUTES.map((route) => `- ${route.label}: ${route.path}`).join("\n")}\n`;
  if (app.type === "subagent-control") return buildSubAgentDryRunMarkdown(new Date().toISOString());
  if (app.type === "seis-design") return buildSeisDesignHandoffMarkdown(new Date().toISOString());
  if (app.type === "seis-cloud") return buildSeisCloudPreflightMarkdown(new Date().toISOString());
  if (app.type === "seis-evolution") return buildSeisEvolutionSnapshotMarkdown(new Date().toISOString());
  return `${app.name}\n\n${app.description}\n\nUse New, Save, and Export to update persistent local state.`;
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

## Boundary
- This demo can be copied as static files and run from a local server.
- SSH, deployment, cloud credentials, GitHub mutation, and server changes require explicit approval.
- Missing provider keys do not block the core desktop, code, design, cloud, video, or gacha surfaces.

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
