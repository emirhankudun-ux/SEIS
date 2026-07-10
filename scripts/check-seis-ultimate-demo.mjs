import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(path) {
  ensure(existsSync(join(root, path)), `missing required file: ${path}`);
}

function ensureIncludes(text, token, label) {
  ensure(text.includes(token), `${label} missing marker: ${token}`);
}

const requiredFiles = [
  "apps/web/desktop.html",
  "apps/web/desktop.css",
  "apps/web/desktop.js",
  "apps/web/service-worker.js",
  "apps/web/website/product-page.js",
  "apps/web/website/product-page.css",
  "content/development/seis-second-brain-system.json",
  "README.md",
  "docs/STATUS.md",
  "docs/product/seis-desktop-os.md",
  "docs/product/seis-demo-status.md",
  "docs/product/seis-second-brain.md",
  "docs/roadmap/MASTER_BACKLOG.md",
  "docs/roadmap/NEXT_PR_QUEUE.md",
  "docs/reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md"
];

for (const file of requiredFiles) ensureFile(file);

const websitePages = [
  "index",
  "seis-ai",
  "seis-os",
  "seis-code",
  "seis-design",
  "seis-search",
  "seis-cloud",
  "seis-store",
  "seis-agents"
];

for (const page of websitePages) ensureFile(`apps/web/website/${page}.html`);

if (failures.length === 0) {
  const desktop = read("apps/web/desktop.js");
  const desktopHtml = read("apps/web/desktop.html");
  const desktopCss = read("apps/web/desktop.css");
  const serviceWorker = read("apps/web/service-worker.js");
  const productRuntime = read("apps/web/website/product-page.js");
  const readme = read("README.md");
  const desktopDoc = read("docs/product/seis-desktop-os.md");
  const demoStatus = read("docs/product/seis-demo-status.md");
  const backlog = read("docs/roadmap/MASTER_BACKLOG.md");
  const prQueue = read("docs/roadmap/NEXT_PR_QUEUE.md");
  const foundationReview = read("docs/reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md");
  const packageJson = read("package.json");

  const requiredApps = [
    ["SEIS Desktop OS", "seis-system-os"],
    ["SEIS AI Core", "ai-assistant"],
    ["SEIS Second Brain", "second-brain"],
    ["SEIS Search", "search"],
    ["SEIS Code IDE", "code-ide"],
    ["SEIS Design Studio", "seis-design"],
    ["SEIS Cloud", "seis-cloud"],
    ["SEIS Store", "seis-store"],
    ["SEIS Music", "music"],
    ["SEIS Launchpad", "launchpad"],
    ["SEIS Files", "files"],
    ["Terminal / SSH Center", "terminal"],
    ["SEIS Website", "seis-website"],
    ["SEIS Agents", "sub-agent-control"],
    ["SEIS Plugin System", "extensions"],
    ["SEIS Command Center", "seis-command-center"]
  ];

  for (const [label, appId] of requiredApps) {
    ensureIncludes(desktop, label, "desktop V17 module map");
    ensureIncludes(desktop, appId, "desktop app catalog");
  }

  const searchTabs = ["AI", "Web", "Code", "Design", "Cloud", "Apps", "Plugins", "Files"];
  ensureIncludes(desktop, "SEIS_SEARCH_TABS", "SEIS Search");
  ensureIncludes(desktop, 'data-action="set-search-tab"', "SEIS Search");
  ensureIncludes(desktop, "data-search-tab-panel", "SEIS Search");
  ensureIncludes(desktop, "getSeisSearchTabResults", "SEIS Search");
  for (const tab of searchTabs) ensureIncludes(desktop, `"${tab}"`, "SEIS Search tabs");

  const desktopShellMarkers = [
    "data-boot-screen",
    "data-window-layer",
    "data-launcher",
    "data-command-palette",
    "data-control-center",
    "data-shortcut-overlay",
    "data-context-menu",
    "set-workspace",
    "set-os-profile",
    "restoreSessionWindows",
    "applyReferenceStartupLayout"
  ];
  for (const marker of desktopShellMarkers) ensureIncludes(`${desktop}\n${desktopHtml}`, marker, "Desktop OS shell");

  const interactionMarkers = [
    "startResize",
    "snapWindow",
    "toggleMusicPlayback",
    "installStoreItem",
    "assistantSend",
    "runSubAgentSimulation",
    "auditInstalledAiSystems",
    "exportAiCoreResourceBridge",
    "renderSeisCloud",
    "renderSeisDesign",
    "renderSeisStore",
    "renderLaunchpadApp"
  ];
  for (const marker of interactionMarkers) ensureIncludes(desktop, marker, "interactive app implementation");

  const boundaryMarkers = [
    "Local Demo",
    "Mock Safe",
    "Planned/Gated",
    "Missing Key",
    "Disabled",
    "Approval-gated",
    "No cloud API key",
    "Real SSH is disabled"
  ];
  for (const marker of boundaryMarkers) ensureIncludes(`${desktop}\n${demoStatus}\n${desktopDoc}`, marker, "mock/real/planned boundary");

  const websiteMarkers = [
    "SEIS AI",
    "SEIS OS",
    "SEIS Code",
    "SEIS Design",
    "SEIS Search",
    "SEIS Cloud",
    "SEIS Store",
    "SEIS Agents",
    "Year 1",
    "Year 2",
    "Year 3",
    "Year 4",
    "Year 5"
  ];
  for (const marker of websiteMarkers) ensureIncludes(productRuntime, marker, "website product runtime");

  for (const page of websitePages) {
    ensureIncludes(serviceWorker, `./website/${page}.html`, "service worker website precache");
  }

  const commandMarkers = [
    "check:seis-ultimate-demo",
    "check:desktop-os",
    "check:seis-second-brain",
    "check:seis-second-brain-browser-smoke",
    "check:desktop-os-browser-smoke",
    "check:product-experience-browser-smoke",
    "check:seis-website-pages",
    "build:static",
    "check:static-build"
  ];
  for (const marker of commandMarkers) ensureIncludes(packageJson, marker, "package scripts");
  for (const marker of commandMarkers.slice(1)) ensureIncludes(readme, marker, "README validation command list");

  const docBundle = `${readme}\n${desktopDoc}\n${demoStatus}\n${backlog}\n${prQueue}\n${foundationReview}`;
  const documentationTopics = [
    ["working surfaces", "Current Working Surfaces"],
    ["mock boundary", "mock"],
    ["planned boundary", "planned"],
    ["run instructions", "Runnable SEIS Demo"],
    ["validation instructions", "Validation Commands"],
    ["approval boundary", "approval"],
    ["API key boundary", "API key"],
    ["five-year roadmap", "five-year"],
    ["Year 5 roadmap", "Year 5"]
  ];
  for (const [topic, marker] of documentationTopics) {
    ensure(docBundle.toLowerCase().includes(marker.toLowerCase()), `documentation bundle missing required topic: ${topic}`);
  }

  ensure(desktopCss.includes("prefers-reduced-motion"), "desktop CSS must keep reduced-motion support.");
  ensure(desktopCss.includes("@media (max-width: 900px)"), "desktop CSS must keep responsive layout support.");
  ensure(desktop.includes("__SEIS_DESKTOP__"), "desktop runtime must expose safe diagnostics for browser smoke.");
}

if (failures.length > 0) {
  console.error("SEIS ultimate demo coverage check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SEIS ultimate demo coverage check passed: ${websitePages.length} website pages, 16 required modules, and 8 search tabs are covered.`);
