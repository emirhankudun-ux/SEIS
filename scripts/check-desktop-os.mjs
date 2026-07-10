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
  const browserSmoke = readFileSync("scripts/check-desktop-os-browser-smoke.mjs", "utf8");

  const appBlock = js.match(/const APPS = \[([\s\S]*?)\]\.map/);
  const commandBlock = js.match(/const REQUIRED_TERMINAL_COMMANDS = \[([\s\S]*?)\];/);
  const appCount = appBlock ? (appBlock[1].match(/^\s+\["/gm) || []).length : 0;
  const commandCount = commandBlock ? (commandBlock[1].match(/"[^"]+"/g) || []).length : 0;

  ensure(appCount >= 50, `expected at least 50 apps, found ${appCount}`);
  ensure(commandCount >= 12, `expected at least 12 terminal commands, found ${commandCount}`);
  ensure(html.includes("data-launcher"), "desktop.html must include launcher surface.");
  ensure(html.includes("data-window-layer"), "desktop.html must include window layer.");
  ensure(html.includes("data-command-palette"), "desktop.html must include command palette.");
  ensure(html.includes("data-action=\"set-workspace\""), "desktop.html must wire workspace buttons to real actions.");
  ensure(html.includes("data-window-resize-handle"), "desktop.html must expose a real window resize handle.");
  ensure(html.includes("data-window-action=\"snap-left\""), "desktop.html must expose a left snap control.");
  ensure(html.includes("data-window-action=\"snap-right\""), "desktop.html must expose a right snap control.");
  ensure(html.includes("data-window-action=\"fullscreen\""), "desktop.html must expose a full-screen window control.");
  ensure(html.includes("data-control-center"), "desktop.html must expose a real Control Center surface.");
  ensure(html.includes("data-boot-screen"), "desktop.html must expose a real boot sequence surface.");
  ensure(html.includes("data-launcher-frequent"), "desktop.html must expose frequently used launcher apps.");
  ensure(html.includes("data-status-network"), "desktop.html must expose a live network status control.");
  ensure(html.includes("data-status-audio"), "desktop.html must expose a live audio status control.");
  ensure(html.includes("data-shortcut-overlay"), "desktop.html must expose a keyboard shortcut overlay.");
  ensure(html.includes("data-action=\"toggle-shortcuts\""), "desktop.html must expose a shortcut overlay trigger.");
  ensure(html.includes("data-context-menu"), "desktop.html must expose a shell context menu surface.");
  ensure(html.includes("data-drop-path=\"/home/seis/Desktop\""), "desktop.html must expose a desktop drag/drop target.");
  ensure(css.includes("@media (max-width: 900px)"), "desktop.css must include tablet/mobile layout.");
  ensure(css.includes("prefers-reduced-motion"), "desktop.css must include reduced-motion handling.");
  ensure(css.includes(".launcher-route"), "desktop.css must style SEIS Search route results.");
  ensure(css.includes(".control-center-panel"), "desktop.css must style the Control Center panel.");
  ensure(css.includes(".notification-list"), "desktop.css must style the Notification Center list.");
  ensure(css.includes(".shortcut-panel"), "desktop.css must style the keyboard shortcut overlay.");
  ensure(css.includes(".shortcut-row"), "desktop.css must style executable shortcut rows.");
  ensure(css.includes(".context-menu-card"), "desktop.css must style the context menu panel.");
  ensure(css.includes(".wallpaper-picker"), "desktop.css must style the wallpaper picker.");
  ensure(css.includes("[data-wallpaper=\"prism\"]"), "desktop.css must style the SEIS Prism Wave wallpaper.");
  ensure(css.includes(".boot-screen"), "desktop.css must style the boot screen.");
  ensure(css.includes(".launcher-frequent"), "desktop.css must style the frequent launcher row.");
  ensure(css.includes("@keyframes boot-load"), "desktop.css must animate the boot progress bar.");
  ensure(css.includes(".app-window.is-fullscreen"), "desktop.css must style full-screen windows.");
  ensure(css.includes(".plugin-center"), "desktop.css must style AI Plugin Center.");
  ensure(css.includes(".tab-strip"), "desktop.css must style AI App tabs.");
  ensure(html.includes("data-action=\"set-os-profile\""), "desktop.html must expose OS profile controls.");
  ensure(css.includes("[data-os-profile=\"linux\"]"), "desktop.css must style Linux profile.");
  ensure(css.includes("[data-os-profile=\"macos\"]"), "desktop.css must style macOS profile.");
  ensure(css.includes("[data-os-profile=\"windows\"]"), "desktop.css must style Windows profile.");
  ensure(js.includes("indexedDB.open"), "desktop.js must use IndexedDB when available.");
  ensure(js.includes("localStorage.setItem"), "desktop.js must include persistence fallback.");
  ensure(js.includes("seis-code-workspace-v1"), "desktop.js must mirror eligible files into the SEIS Code workspace store.");
  ensure(js.includes("workspace-file-created"), "desktop.js must notify SEIS Code when mirrored files change.");
  ensure(js.includes("desktopPathToCodeWorkspacePath"), "desktop.js must map desktop paths into the SEIS Code workspace explicitly.");
  ensure(js.includes("removePathFromCodeWorkspace"), "desktop.js must remove deleted desktop files from the SEIS Code workspace store.");
  ensure(js.includes("codeWorkspacePathToDesktopPath"), "desktop.js must map SEIS Code workspace paths back into Desktop VFS.");
  ensure(js.includes("syncDesktopFromCodeWorkspace"), "desktop.js must import SEIS Code and Mythic exports into Desktop Files/Terminal VFS.");
  ensure(js.includes("DEMO_ROUTES"), "desktop.js must define the SEIS demo route manifest.");
  ensure(js.includes("seis-command-center-app"), "desktop.js must expose the SEIS Command Center route.");
  ensure(js.includes("sub-agent-os-demo"), "desktop.js must expose the Sub-Agent OS demo route.");
  ensure(js.includes("renderLauncherRoutes"), "desktop.js must surface SEIS routes in the launcher/search UI.");
  ensure(js.includes("SEIS_SEARCH_TABS"), "desktop.js must define SEIS Search result tabs.");
  ensure(js.includes('data-action="set-search-tab"'), "desktop.js must render actionable SEIS Search tab buttons.");
  ensure(js.includes("data-search-tab-panel"), "desktop.js must render the active SEIS Search tab panel.");
  ensure(js.includes("getSeisSearchTabResults"), "desktop.js must build connected results for each SEIS Search tab.");
  for (const tab of ["AI", "Web", "Code", "Design", "Cloud", "Apps", "Plugins", "Files"]) {
    ensure(js.includes(`"${tab}"`), `desktop.js must include the ${tab} SEIS Search tab.`);
  }
  ensure(js.includes("AI_PLUGIN_TABS"), "desktop.js must define AI Plugin Center tabs inside SEIS AI.");
  ensure(js.includes("data-ai-plugin-tab"), "desktop.js must render AI Plugin Center tab controls.");
  ensure(js.includes("SEIS_SECOND_BRAIN_SYSTEM"), "desktop.js must define the SEIS Second Brain system contract.");
  ensure(js.includes("seis-second-brain-app"), "desktop.js must expose the SEIS Second Brain route.");
  ensure(js.includes("data-second-brain-app"), "desktop.js must render the SEIS Second Brain app surface.");
  ensure(js.includes("data-ai-second-brain-bridge"), "desktop.js must render the SEIS AI Second Brain bridge tab.");
  ensure(js.includes("data-second-brain-installed-ai"), "desktop.js must render installed AI profiles inside Second Brain.");
  ensure(js.includes("data-second-brain-subagents"), "desktop.js must render managed sub-agent lanes inside Second Brain.");
  ensure(js.includes("data-second-brain-agent-roster"), "desktop.js must render the 12-agent Second Brain roster.");
  ensure(js.includes("seis-second-brain-vault-snapshot.md"), "desktop.js must save a Second Brain vault snapshot artifact.");
  ensure(css.includes(".second-brain-app"), "desktop.css must style SEIS Second Brain.");
  ensure(css.includes(".second-brain-graph"), "desktop.css must style the Second Brain knowledge graph.");
  ensure(js.includes("SEIS_PERSONAL_PLUGIN_BRIDGE"), "desktop.js must define the personal SEIS plugin bridge.");
  ensure(js.includes("SEIS_PERSONAL_PLUGIN_AI_CORE_LANE_MATRIX"), "desktop.js must define the personal plugin AI Core lane matrix.");
  ensure(js.includes("SEIS_MCP_RUNTIME_CONTRACT"), "desktop.js must define the MCP runtime contract.");
  ensure(js.includes("SEIS_V17_COMMAND_CENTER_MODULES"), "desktop.js must define the V17 Command Center module map.");
  ensure(js.includes("data-seis-command-center"), "desktop.js must render the V17 Command Center surface.");
  ensure(js.includes("data-v17-module"), "desktop.js must render V17 module rows.");
  ensure(js.includes("v17CommandCenter"), "desktop diagnostics must expose V17 Command Center coverage.");
  ensure(js.includes("seis-v17-command-center-snapshot.md"), "desktop.js must save a V17 Command Center snapshot artifact.");
  ensure(js.includes("SEIS_DEMO_JOURNEYS"), "desktop.js must define guided SEIS Demo Studio journeys.");
  ensure(js.includes("data-demo-studio-app"), "desktop.js must render the SEIS Demo Studio app surface.");
  ensure(js.includes("data-demo-journey-board"), "desktop.js must render selectable Demo Studio journeys.");
  ensure(js.includes("run-demo-journey"), "desktop.js must expose a Demo Studio full-journey action.");
  ensure(js.includes("run-demo-journey-step"), "desktop.js must expose per-step Demo Studio actions.");
  ensure(js.includes("seis-demo-studio-evidence.md"), "desktop.js must save a Demo Studio evidence artifact.");
  ensure(js.includes("demoStudioState"), "desktop diagnostics must expose Demo Studio state.");
  ensure(js.includes("data-file-search"), "desktop.js must render Files search controls.");
  ensure(js.includes("data-file-view"), "desktop.js must render Files grid/list view state.");
  ensure(js.includes("set-file-view"), "desktop.js must expose Files grid/list view switching.");
  ensure(js.includes("sync-code-workspace"), "desktop.js must expose the manual SEIS Code workspace sync action.");
  ensure(js.includes("fileManagerState"), "desktop diagnostics must expose Files state.");
  ensure(js.includes("CODE_IDE_PANELS"), "desktop.js must define the Code IDE panel manifest.");
  ensure(js.includes("data-action=\"code-ide-panel\""), "desktop.js must render Code IDE panel buttons.");
  ensure(js.includes("data-code-ide-search-query"), "desktop.js must render the Code IDE local search field.");
  ensure(js.includes("data-code-ide-source-control"), "desktop.js must render source-control safe/mock mode.");
  ensure(js.includes("data-code-ide-preview-panel"), "desktop.js must render a Code IDE preview panel.");
  ensure(js.includes("data-code-ide-ai-assistant"), "desktop.js must render the Code IDE Local Demo assistant.");
  ensure(js.includes("data-code-ide-statusbar"), "desktop.js must render the Code IDE status bar.");
  ensure(js.includes("codeIdeState"), "desktop diagnostics must expose Code IDE state.");
  ensure(css.includes(".code-ide-command-bar"), "desktop.css must style the Code IDE command bar.");
  ensure(css.includes(".code-ide-inspector"), "desktop.css must style the Code IDE inspector.");
  ensure(css.includes(".code-ide-statusbar"), "desktop.css must style the Code IDE status bar.");
  ensure(css.includes(".demo-studio-app"), "desktop.css must style SEIS Demo Studio.");
  ensure(css.includes(".demo-journey-board"), "desktop.css must style Demo Studio journey cards.");
  ensure(css.includes(".demo-step-card"), "desktop.css must style Demo Studio executable steps.");
  ensure(css.includes(".file-manager-controls"), "desktop.css must style Files search and view controls.");
  ensure(css.includes(".file-list-view"), "desktop.css must style Files list view.");
  ensure(css.includes(".file-preview-panel"), "desktop.css must style Files preview panels.");
  ensure(js.includes("20B / 16GB+"), "desktop.js must surface the 20B on 16GB+ RAM model-scaling floor.");
  ensure(js.includes("70B"), "desktop.js must surface the future 70B model-scaling boundary.");
  ensure(js.includes("150B gated"), "desktop.js must surface the future 150B model-scaling boundary.");
  ensure(js.includes("content/development/seis-model-frontier-escalation-policy.json"), "desktop.js must surface the frontier escalation policy path.");
  ensure(js.includes("seis://ai/model-frontier-escalation-policy.json"), "desktop.js must surface the frontier escalation policy MCP resource URI.");
  ensure(js.includes("check:seis-model-frontier-escalation-policy"), "desktop.js must surface the frontier escalation policy quality gate.");
  ensure(js.includes("content/development/seis-150b-frontier-model-program.json"), "desktop.js must surface the 150B frontier model program path.");
  ensure(js.includes("seis://ai/150b-frontier-model-program.json"), "desktop.js must surface the 150B frontier model program MCP resource URI.");
  ensure(js.includes("check:seis-150b-frontier-model-program"), "desktop.js must surface the 150B frontier model program quality gate.");
  ensure(js.includes("No-skip-20B"), "desktop.js must surface the no-skip-20B frontier escalation rule.");
  ensure(js.includes("SEIS_MASTER_OBJECTIVE_COVERAGE_UI"), "desktop.js must define the master objective coverage UI manifest.");
  ensure(js.includes("data-master-objective-coverage"), "desktop.js must render the master objective coverage surface.");
  ensure(js.includes("data-master-objective-coverage-matrix"), "desktop.js must render the master objective coverage matrix.");
  ensure(js.includes("data-master-objective-coverage-item"), "desktop.js must render individual master objective coverage rows.");
  ensure(js.includes("seis-ai-150b-frontier-boundary"), "desktop.js must expose the 150B master objective coverage boundary.");
  for (const coverageId of [
    "user-work-protection",
    "security-and-privacy",
    "architecture-and-maintainability",
    "documentation-traceability",
    "apple-first-platform",
    "design-accessibility-experience",
    "ai-data-cloud-automation",
    "seis-ai-150b-frontier-boundary",
    "open-source-github-readiness",
    "god-mode-every-topic-feature-growth",
  ]) {
    ensure(js.includes(coverageId), `desktop.js must expose master objective coverage item ${coverageId}.`);
  }
  ensure(js.includes("SEIS_MODEL_SCALING_UI_PROFILE"), "desktop.js must define the model scaling UI profile.");
  ensure(js.includes("memoryBudgetStatus"), "desktop.js must surface the model scaling memory budget status.");
  ensure(js.includes("benchmarkManifest"), "desktop.js must surface the model scaling benchmark manifest boundary.");
  ensure(js.includes("template-not-measured"), "desktop.js must mark the model scaling benchmark manifest as template-not-measured.");
  ensure(js.includes("export-model-preflight"), "desktop.js must expose the 20B local preflight export action.");
  ensure(js.includes("seis-20b-local-preflight.md"), "desktop.js must generate the 20B local preflight report.");
  ensure(js.includes("build20BLocalPreflightMarkdown"), "desktop.js must build the 20B local preflight report content.");
  ensure(js.includes("This is a browser-local dry-run checklist"), "desktop.js must keep the 20B local preflight as dry-run only.");
  ensure(js.includes("reports/seis-model-scaling/20b-benchmark-dry-run.json"), "desktop.js must surface the 20B benchmark dry-run report path.");
  ensure(js.includes("dry-run-not-measured"), "desktop.js must keep the benchmark dry-run not-measured.");
  ensure(js.includes("content/development/seis-model-parameter-ladder.json"), "desktop.js must surface the model parameter ladder source path.");
  ensure(js.includes("seis://ai/model-parameter-ladder.json"), "desktop.js must surface the model parameter ladder MCP resource URI.");
  ensure(js.includes("Parameter Ladder"), "desktop.js must render the model parameter ladder section.");
  ensure(js.includes("300B+"), "desktop.js must surface the 300B+ exploration boundary.");
  ensure(js.includes("npm run inspect:seis-model-local-hardware"), "desktop.js must surface the host RAM preflight command.");
  ensure(js.includes("dist/qa/model-scaling/local-hardware-preflight.json"), "desktop.js must surface the ignored host RAM preflight output path.");
  ensure(js.includes("content/development/seis-20b-model-card-template.json"), "desktop.js must surface the 20B model card template path.");
  ensure(js.includes("content/development/seis-20b-dataset-card-template.json"), "desktop.js must surface the 20B dataset card template path.");
  ensure(js.includes("template-not-filled / human-review-required"), "desktop.js must keep 20B model and dataset cards human-review-gated.");
  ensure(js.includes("compatibilityProfiles"), "desktop.js must surface RAM-class compatibility profiles.");
  ensure(js.includes("16GB+ developer floor"), "desktop.js must surface the 16GB+ model scaling floor.");
  ensure(js.includes("32GB+ validation lane"), "desktop.js must surface the 32GB+ 20B validation lane.");
  ensure(js.includes("64GB+ research lane"), "desktop.js must surface the 70B research RAM lane.");
  ensure(js.includes("Creation Stage"), "desktop.js must render model scaling creation stages.");
  ensure(js.includes("Q4-class 20B local candidate"), "desktop.js must surface the planned 20B Q4 quantization lane.");
  ensure(js.includes("150B distributed frontier lane"), "desktop.js must surface the planned 150B frontier lane.");
  ensure(js.includes("llama.cpp-compatible local runtime"), "desktop.js must surface the local runtime candidate boundary.");
  ensure(js.includes("data-personal-plugin-bridge"), "desktop.js must render the personal SEIS plugin bridge.");
  ensure(js.includes("seis-personal-plugin-bridge.md"), "desktop.js must save the personal SEIS plugin bridge artifact.");
  ensure(js.includes("data-personal-plugin-ai-core-lane-matrix"), "desktop.js must render the personal plugin AI Core lane matrix.");
  ensure(js.includes("data-mcp-runtime-contract"), "desktop.js must render the MCP runtime contract.");
  ensure(js.includes("seis-mcp-runtime-contract.md"), "desktop.js must save the MCP runtime contract artifact.");
  ensure(js.includes("seis-personal-plugin-ai-core-lane-matrix.md"), "desktop.js must save the personal plugin AI Core lane matrix artifact.");
  ensure(js.includes("SEIS_INSTALLED_AI_SYSTEMS"), "desktop.js must define installed AI system profiles.");
  ensure(js.includes("data-installed-ai-systems"), "desktop.js must render the Installed AI Systems tab.");
  ensure(js.includes("SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX"), "desktop.js must define the installed AI Core route matrix.");
  ensure(js.includes("data-installed-ai-core-route-matrix"), "desktop.js must render the installed AI Core route matrix.");
  ensure(js.includes("seis-installed-ai-core-route-matrix.md"), "desktop.js must save the installed AI Core route matrix artifact.");
  ensure(js.includes("audit-installed-ai-systems"), "desktop.js must expose an installed AI audit action.");
  ensure(js.includes("installed-ai-systems-audit.md"), "desktop.js must save the installed AI systems audit artifact.");
  ensure(js.includes("SUB_AGENT_DEMO"), "desktop.js must define the Sub-Agent OS demo model.");
  ensure(js.includes("data-subagent-os-demo"), "desktop.js must render a Sub-Agent Control app surface.");
  ensure(js.includes("data-subagent-ai-plan"), "desktop.js must render a Sub-Agent Plan inside SEIS AI.");
  ensure(js.includes("sub-agent-control-dry-run.md"), "desktop.js must save a Sub-Agent Control dry-run handoff.");
  ensure(js.includes("run-subagent-simulation"), "desktop.js must expose a five-year sub-agent simulation control.");
  ensure(js.includes("sub-agent-five-year-simulation.md"), "desktop.js must save the five-year simulation artifact.");
  ensure(js.includes("getSubAgentQuarters"), "desktop.js must model the five-year simulation as quarters.");
  ensure(js.includes("OS profile:"), "desktop.js must record the active OS profile in sub-agent artifacts.");
  ensure(js.includes("subAgentProcesses"), "desktop diagnostics must expose sub-agent process state.");
  ensure(js.includes("pulse-subagent-processes"), "desktop.js must expose a local sub-agent process pulse action.");
  ensure(js.includes("run-next-subagent-cycle"), "desktop.js must expose a local sub-agent cycle action.");
  ensure(js.includes("sub-agent-process-ledger.md"), "desktop.js must save the local sub-agent process ledger.");
  ensure(js.includes("sub-agent-cycle-report.md"), "desktop.js must save a local sub-agent cycle report.");
  ensure(js.includes("data-subagent-process-monitor"), "desktop.js must render managed sub-agent processes.");
  ensure(js.includes("AI_CORE_VERSION_TARGETS"), "desktop.js must define SEIS AI Core version targets for the sub-agent demo.");
  ensure(js.includes("SEIS_AI_CORE_RESOURCE_BRIDGE"), "desktop.js must define the generated SEIS AI Core resource bridge.");
  ensure(js.includes("data-ai-core-resource-bridge"), "desktop.js must render the AI Core resource bridge in SEIS AI.");
  ensure(js.includes("data-subagent-plan-view-resource"), "desktop.js must render the generated sub-agent plan-view resource.");
  ensure(js.includes("seis://ai/sub-agent-5-year-plan-view.json"), "desktop.js must expose the generated sub-agent plan-view MCP resource URI.");
  ensure(js.includes("seis-ai-core-resource-bridge.md"), "desktop.js must save the AI Core resource bridge artifact.");
  ensure(js.includes("data-ai-core-orbit"), "desktop.js must render the AI Core spatial command surface.");
  ensure(js.includes("rotate-ai-core-orbit"), "desktop.js must expose an interactive AI Core orbit control.");
  ensure(js.includes("promote-ai-core-version"), "desktop.js must expose an AI Core version promotion preview control.");
  ensure(js.includes("seis-ai-core-orbit-snapshot.md"), "desktop.js must save a local AI Core orbit snapshot artifact.");
  ensure(css.includes(".subagent-quarter-grid"), "desktop.css must style the five-year sub-agent quarter timeline.");
  ensure(css.includes(".subagent-profile-controls"), "desktop.css must style Sub-Agent OS profile controls.");
  ensure(css.includes(".agent-process-panel"), "desktop.css must style managed sub-agent process panels.");
  ensure(css.includes(".ai-core-orbit-panel"), "desktop.css must style the AI Core spatial command surface.");
  ensure(css.includes(".ai-core-stage"), "desktop.css must style the AI Core spatial stage.");
  ensure(css.includes(".installed-ai-panel"), "desktop.css must style the Installed AI Systems surface.");
  ensure(css.includes(".app-window.is-workspace-hidden"), "desktop.css must hide inactive-workspace windows.");
  ensure(js.includes("visibleWindowTitles"), "desktop diagnostics must expose visible workspace windows.");
  ensure(js.includes("workspaceWindows"), "desktop diagnostics must expose per-window workspace assignments.");
  ensure(js.includes("sessionWindows"), "desktop diagnostics must expose restorable session windows.");
  ensure(js.includes("serializeSessionWindows"), "desktop.js must serialize safe window session snapshots.");
  ensure(js.includes("sanitizeSessionWindow"), "desktop.js must sanitize persisted window session snapshots.");
  ensure(js.includes("restoreSessionWindows"), "desktop.js must restore persisted window sessions before fallback startup apps.");
  ensure(js.includes("startResize"), "desktop.js must implement pointer-driven window resizing.");
  ensure(js.includes("snapWindow"), "desktop.js must implement browser-local window snapping.");
  ensure(js.includes("renderQuickStatus"), "desktop.js must render a persistent Control Center.");
  ensure(js.includes("addNotification"), "desktop.js must persist Notification Center events.");
  ensure(js.includes("recordRecent"), "desktop.js must track recent apps and files.");
  ensure(js.includes("KEYBOARD_SHORTCUT_GROUPS"), "desktop.js must define a keyboard shortcut manifest.");
  ensure(js.includes("renderShortcutOverlay"), "desktop.js must render a keyboard shortcut overlay.");
  ensure(js.includes("executeShortcutCommand"), "desktop.js must execute shortcut overlay rows.");
  ensure(js.includes("shortcutState"), "desktop diagnostics must expose shortcut overlay state.");
  ensure(js.includes("WALLPAPERS"), "desktop.js must define a wallpaper manager catalog.");
  ensure(js.includes("SEIS Prism Wave"), "desktop.js must include the user-reference-inspired SEIS Prism Wave wallpaper.");
  ensure(js.includes("completeBootSequence"), "desktop.js must complete the browser-local boot sequence.");
  ensure(js.includes("renderLauncherFrequentApps"), "desktop.js must render frequently used launcher apps.");
  ensure(js.includes("bootState"), "desktop diagnostics must expose boot sequence state.");
  ensure(js.includes("launcherState"), "desktop diagnostics must expose launcher state.");
  ensure(js.includes("setWallpaper"), "desktop.js must implement wallpaper selection.");
  ensure(js.includes("handleContextMenu"), "desktop.js must implement desktop/file/window context menus.");
  ensure(js.includes("renderFileContextMenu"), "desktop.js must render file context menu actions.");
  ensure(js.includes("handleDrop"), "desktop.js must implement file drag/drop handling.");
  ensure(js.includes("renameSelectedFile"), "desktop.js must implement file rename from context menus.");
  ensure(js.includes("copyPathToClipboard"), "desktop.js must implement clipboard integration from file context menus.");
  ensure(js.includes("is-fullscreen"), "desktop.js must toggle full-screen window state.");
  ensure(js.includes("moveNodePath"), "desktop.js must keep renamed or moved desktop paths coherent.");
  ensure(js.includes("claude"), "desktop.js must include Claude-style terminal command.");
  ensure(js.includes("Local Demo"), "desktop.js must truthfully label local demo AI mode.");
  ensure(js.includes("__SEIS_DESKTOP__"), "desktop.js must expose safe smoke diagnostics.");
  ensure(js.includes("data-action=\"generic-new\""), "desktop.js must render functional app actions.");
  ensure(index.includes("desktop.html"), "index.html must link to desktop route.");
  ensure(routes.includes("\"/desktop.html\""), "routes.json must include desktop route.");
  ensure(routes.includes("\"/seis-linux-replica.html\""), "routes.json must include SEIS Linux Replica route.");
  ensure(serviceWorker.includes("./desktop.html"), "service worker must cache desktop route.");
  ensure(serviceWorker.includes("./seis-linux-replica.html"), "service worker must cache SEIS Linux Replica route.");
  ensure(packageJson.includes("check:desktop-os"), "package.json must expose desktop validation script.");
  ensure(packageJson.includes("check:seis-linux-replica-browser-smoke"), "package.json must expose SEIS Linux Replica browser smoke script.");
  ensure(existsSync("scripts/check-seis-linux-replica-browser-smoke.mjs"), "SEIS Linux Replica browser smoke script must exist.");
  ensure(browserSmoke.includes("workflowExecution"), "desktop browser smoke must execute primary app workflows.");
  ensure(browserSmoke.includes("executedApps >= 50"), "desktop browser smoke must verify at least 50 executed primary workflows.");
  ensure(browserSmoke.includes("workflowPersistence"), "desktop browser smoke must verify workflow persistence after reload.");
  ensure(browserSmoke.includes("persistedStatuses >= 50"), "desktop browser smoke must verify at least 50 persisted workflow statuses.");
  ensure(browserSmoke.includes("workspaceSwitch"), "desktop browser smoke must verify virtual workspace switching.");
  ensure(browserSmoke.includes("activeWorkspace === \"2\""), "desktop browser smoke must verify active workspace persistence after reload.");
  ensure(browserSmoke.includes("windowResize"), "desktop browser smoke must verify resizable windows.");
  ensure(browserSmoke.includes("windowSnap"), "desktop browser smoke must verify snapped windows.");
  ensure(browserSmoke.includes("sessionRestore"), "desktop browser smoke must verify window session restoration.");
  ensure(browserSmoke.includes("shellContext"), "desktop browser smoke must verify context menus, wallpaper, drag/drop, and full-screen behavior.");
  ensure(browserSmoke.includes("bootAndLauncher"), "desktop browser smoke must verify boot and launcher reference adaptation.");
  ensure(browserSmoke.includes("SEIS Linux Replica"), "desktop browser smoke must verify SEIS Linux Replica route visibility.");
  ensure(browserSmoke.includes("controlCenter"), "desktop browser smoke must verify Control Center interactivity.");
  ensure(browserSmoke.includes("shortcutOverlay"), "desktop browser smoke must verify keyboard shortcut overlay interactivity.");

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
    await verifyOsProfileSwitch(window, diagnostics);

    const launcherToggle = window.document.querySelector("[data-action=\"toggle-launcher\"]");
    ensure(launcherToggle, "runtime must render launcher toggle button.");
    launcherToggle?.click();
    await delay(20);

    const launcherApps = window.document.querySelectorAll(".launcher-app[data-action=\"open-app\"]");
    ensure(launcherApps.length >= 50, `launcher must render at least 50 app buttons, found ${launcherApps.length}`);
    const launcherState = diagnostics.launcherState();
    ensure(launcherState.frequentApps.length >= 5, `launcher must render frequently used app shortcuts, found ${launcherState.frequentApps.length}`);
    ensure(launcherState.categories.includes("System"), "launcher state must include System category.");
    ensure(diagnostics.wallpaperState().available.some((item) => item.id === "prism"), "wallpaper diagnostics must expose SEIS Prism Wave.");
    ensure(diagnostics.bootState().exists, "boot diagnostics must expose the boot sequence.");
    const launcherRoutes = window.document.querySelectorAll("[data-demo-route-group] [data-action=\"open-demo-route\"]");
    ensure(launcherRoutes.length >= 3, `launcher must expose demo route buttons, found ${launcherRoutes.length}`);

    const commandCenterRoute = window.document.querySelector("[data-demo-route-group] [data-value=\"seis-command-center-app\"]");
    ensure(commandCenterRoute, "launcher route group must expose the SEIS Command Center route.");
    commandCenterRoute?.click();
    await delay(40);
    ensure(diagnostics.openWindows().includes("SEIS Command Center"), "SEIS Command Center route must open the Command Center window.");
    ensure(window.document.querySelector("[data-seis-command-center]"), "SEIS Command Center must render the V17 operating center surface.");
    const commandCenterCoverage = diagnostics.v17CommandCenter();
    ensure(commandCenterCoverage.moduleCount >= 16, `V17 Command Center expected at least 16 modules, got ${commandCenterCoverage.moduleCount}.`);
    ensure(commandCenterCoverage.appLinks >= 15, `V17 Command Center expected at least 15 app links, got ${commandCenterCoverage.appLinks}.`);
    ensure(commandCenterCoverage.routeLinks >= 7, `V17 Command Center expected at least 7 route links, got ${commandCenterCoverage.routeLinks}.`);
    ensure(commandCenterCoverage.providerKeysRequiredForCoreDemo === 0, "V17 Command Center must keep the core demo zero-key.");
    ensure(commandCenterCoverage.liveSshExecution === false, "V17 Command Center must keep live SSH disabled.");
    ensure(commandCenterCoverage.liveDeployment === false, "V17 Command Center must keep live deployment disabled.");
    ensure(commandCenterCoverage.modelScalingFloor.includes("20B"), "V17 Command Center must expose the 20B model-scaling floor.");
    ensure(commandCenterCoverage.modelScalingFuture.includes("150B"), "V17 Command Center must expose the 150B future model-scaling boundary.");
    ensure(commandCenterCoverage.modelScalingProfile.memoryBudgetStatus === "planning-estimate-not-benchmark-evidence", "V17 Command Center must keep model scaling as planning estimate only.");
    ensure(commandCenterCoverage.modelScalingProfile.compatibilityClaim === "not-verified", "V17 Command Center must not verify 16GB+ compatibility without benchmarks.");
    ensure(commandCenterCoverage.modelScalingPreflight.status === "dry-run-only", "V17 Command Center must expose a dry-run-only 20B local preflight.");
    ensure(commandCenterCoverage.modelScalingPreflight.reportPath === "/home/seis/Documents/seis-20b-local-preflight.md", "V17 Command Center must expose the 20B local preflight report path.");
    ensure(commandCenterCoverage.modelScalingPreflight.benchmarkDryRunReport === "reports/seis-model-scaling/20b-benchmark-dry-run.json", "V17 Command Center must expose the 20B benchmark dry-run report path.");
    ensure(commandCenterCoverage.modelScalingPreflight.benchmarkDryRunStatus === "dry-run-not-measured", "V17 Command Center must keep the benchmark dry-run not-measured.");
    ensure(commandCenterCoverage.modelScalingPreflight.measuredBenchmark === false, "V17 Command Center must not treat local preflight as a measured benchmark.");
    ensure(commandCenterCoverage.modelScalingPreflight.routeEligibleToday === false, "V17 Command Center must keep model routing blocked after local preflight.");
    ensure(commandCenterCoverage.modelScalingPreflight.hostPreflightCommand === "npm run inspect:seis-model-local-hardware", "V17 Command Center must expose the host RAM preflight command.");
    ensure(commandCenterCoverage.modelScalingPreflight.hostPreflightOutput === "dist/qa/model-scaling/local-hardware-preflight.json", "V17 Command Center must expose the ignored host RAM preflight output.");
    ensure(commandCenterCoverage.modelScalingPreflight.modelCardTemplate === "content/development/seis-20b-model-card-template.json", "V17 Command Center must expose the 20B model card template path.");
    ensure(commandCenterCoverage.modelScalingPreflight.datasetCardTemplate === "content/development/seis-20b-dataset-card-template.json", "V17 Command Center must expose the 20B dataset card template path.");
    ensure(commandCenterCoverage.modelScalingPreflight.evidenceTemplateStatus === "template-not-filled / human-review-required", "V17 Command Center must keep 20B evidence templates review-gated.");
    ensure(commandCenterCoverage.modelScalingProfile.quantizationProfiles.length >= 3, "V17 Command Center must expose model quantization lanes.");
    ensure(commandCenterCoverage.modelScalingProfile.frontierTarget.includes("150B"), "V17 Command Center must expose the 150B frontier target.");
    ensure(commandCenterCoverage.modelScalingProfile.frontierStatus.includes("not scoped"), "V17 Command Center must keep the 150B frontier target unscoped.");
    ensure(commandCenterCoverage.modelScalingProfile.frontierRequiredEvidence.length >= 5, "V17 Command Center must expose 150B required evidence gates.");
    ensure(commandCenterCoverage.modelFrontierEscalationPolicy.path === "content/development/seis-model-frontier-escalation-policy.json", "V17 Command Center must expose the frontier escalation policy path.");
    ensure(commandCenterCoverage.modelFrontierEscalationPolicy.resource === "seis://ai/model-frontier-escalation-policy.json", "V17 Command Center must expose the frontier escalation policy MCP resource URI.");
    ensure(commandCenterCoverage.modelFrontierEscalationPolicy.status === "policy-active-research-gated", "V17 Command Center must expose the active frontier escalation policy status.");
    ensure(commandCenterCoverage.modelFrontierEscalationPolicy.qualityGate === "npm run check:seis-model-frontier-escalation-policy", "V17 Command Center must expose the frontier escalation policy quality gate.");
    ensure(commandCenterCoverage.modelFrontierEscalationPolicy.routeEligibleToday === false, "V17 Command Center must keep frontier escalation route eligibility blocked.");
    ensure(commandCenterCoverage.modelFrontierEscalationPolicy.rule.includes("No-skip-20B"), "V17 Command Center must expose the no-skip-20B escalation rule.");
    ensure(commandCenterCoverage.frontierModelProgram.path === "content/development/seis-150b-frontier-model-program.json", "V17 Command Center must expose the 150B frontier model program path.");
    ensure(commandCenterCoverage.frontierModelProgram.resource === "seis://ai/150b-frontier-model-program.json", "V17 Command Center must expose the 150B frontier model program MCP resource URI.");
    ensure(commandCenterCoverage.frontierModelProgram.status === "frontier-program-plan-only", "V17 Command Center must keep the 150B frontier model program plan-only.");
    ensure(commandCenterCoverage.frontierModelProgram.qualityGate === "npm run check:seis-150b-frontier-model-program", "V17 Command Center must expose the 150B frontier model program quality gate.");
    ensure(commandCenterCoverage.frontierModelProgram.routeEligibleToday === false, "V17 Command Center must keep the 150B frontier model program route-ineligible.");
    ensure(commandCenterCoverage.frontierModelProgram.stages.length === 6, "V17 Command Center must expose six 150B frontier model program stages.");
    ensure(commandCenterCoverage.masterObjectiveCoverage.itemCount >= 10, "V17 Command Center must expose the expanded master objective coverage item count.");
    ensure(commandCenterCoverage.masterObjectiveCoverage.items.length === commandCenterCoverage.masterObjectiveCoverage.itemCount, "V17 Command Center master objective coverage diagnostics must expose every item.");
    ensure(commandCenterCoverage.masterObjectiveCoverage.itemIds.includes("user-work-protection"), "V17 Command Center diagnostics must expose user-work-protection coverage.");
    ensure(commandCenterCoverage.masterObjectiveCoverage.itemIds.includes("god-mode-every-topic-feature-growth"), "V17 Command Center diagnostics must expose God Mode growth coverage.");
    ensure(commandCenterCoverage.masterObjectiveCoverage.activeCoverage === "seis-ai-150b-frontier-boundary", "V17 Command Center must expose the 150B master objective coverage boundary.");
    ensure(commandCenterCoverage.masterObjectiveCoverage.checks.includes("npm run check:seis-model-scaling-hardware-profile"), "V17 Command Center must expose the model scaling coverage check.");
    ensure(commandCenterCoverage.masterObjectiveCoverage.blockedUntil.includes("explicit human approval"), "V17 Command Center must keep 150B blocked until explicit human approval.");
    ensure(commandCenterCoverage.masterObjectiveCoverage.statusCounts.active >= 7, "V17 Command Center diagnostics must expose active master objective coverage counts.");
    ensure(commandCenterCoverage.githubMergeGates.currentState.includes("protected-branch-blocked"), "V17 Command Center must expose protected-branch blocked merge state.");
    ensure(commandCenterCoverage.githubMergeGates.requiredApprovals >= 10, "V17 Command Center must expose the 10-review merge gate.");
    ensure(commandCenterCoverage.githubMergeGates.autoMergeIsBypass === false, "V17 Command Center must state auto-merge is not a bypass.");
    ensure(commandCenterCoverage.githubMergeGates.adminBypassAllowedForCodex === false, "V17 Command Center must forbid Codex admin merge bypass.");
    ensure(commandCenterCoverage.githubMergeGates.liveGitHubMutationFromBrowser === false, "V17 Command Center must not claim browser GitHub mutation.");
    ensure(commandCenterCoverage.githubMergeGates.requiredRules.includes("code owner review"), "V17 Command Center must expose code owner review gate.");
    ensure(commandCenterCoverage.githubMergeGates.requiredRules.includes("last-push approval"), "V17 Command Center must expose last-push approval gate.");
    ensure(commandCenterCoverage.githubMergeGates.requiredRules.includes("signed commits"), "V17 Command Center must expose signed commit gate.");
    ensure(commandCenterCoverage.githubMergeGates.observedPrs.some(([pr]) => pr === "#58"), "V17 Command Center must expose PR #58 merge gate evidence.");
    ensure(commandCenterCoverage.githubMergeGates.observedPrs.some(([pr]) => pr === "#62"), "V17 Command Center must expose PR #62 merge gate evidence.");
    ensure(commandCenterCoverage.githubMergeGates.observedPrs.some(([pr]) => pr === "#65"), "V17 Command Center must expose PR #65 merge gate evidence.");
    ensure(commandCenterCoverage.modules.some((module) => module.id === "model-scaling" && module.state === "planned-gated"), "V17 Command Center must model scaling as planned/gated.");
    ensure(window.document.querySelector("[data-seis-command-center] [data-github-merge-gates]"), "V17 Command Center must render the GitHub merge gates panel.");
    ensure(window.document.querySelectorAll("[data-seis-command-center] [data-github-merge-gate-rule]").length >= commandCenterCoverage.githubMergeGates.requiredRules.length, "V17 Command Center must render every merge gate rule.");
    ensure(window.document.querySelectorAll("[data-seis-command-center] [data-github-merge-gate-pr]").length === commandCenterCoverage.githubMergeGates.observedPrs.length, "V17 Command Center must render every observed blocked PR row.");
    ensure(window.document.querySelector("[data-seis-command-center] [data-master-objective-coverage]"), "V17 Command Center must render the master objective coverage panel.");
    ensure(window.document.querySelectorAll("[data-seis-command-center] [data-master-objective-coverage-item]").length === commandCenterCoverage.masterObjectiveCoverage.itemCount, "V17 Command Center must render every master objective coverage row.");
    ensure(window.document.querySelector("[data-seis-command-center] [data-master-objective-coverage-item='seis-ai-150b-frontier-boundary']"), "V17 Command Center must render the 150B master objective coverage row.");
    const modelPreflightButton = window.document.querySelector("[data-seis-command-center] [data-action='export-model-preflight']");
    ensure(modelPreflightButton, "SEIS Command Center must expose a 20B local preflight export action.");
    modelPreflightButton?.click();
    await delay(60);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/seis-20b-local-preflight.md"), "SEIS Command Center preflight action must create a virtual filesystem artifact.");
    ensure(window.document.querySelectorAll("[data-seis-command-center] [data-v17-module]").length === commandCenterCoverage.moduleCount, "V17 Command Center must render all module rows.");
    ensure(window.document.querySelectorAll("[data-seis-command-center] [data-v17-open-app]").length >= 15, "V17 Command Center must render executable app actions.");
    ensure(window.document.querySelectorAll("[data-seis-command-center] [data-v17-open-route]").length >= 7, "V17 Command Center must render executable route actions.");
    const commandCenterSnapshot = window.document.querySelector("[data-seis-command-center] [data-action=\"app-primary\"]");
    ensure(commandCenterSnapshot, "SEIS Command Center must expose a snapshot workflow action.");
    commandCenterSnapshot?.click();
    await delay(60);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/seis-v17-command-center-snapshot.md"), "SEIS Command Center snapshot action must create a virtual filesystem artifact.");

    diagnostics.openApp("demo-studio");
    await delay(60);
    ensure(diagnostics.openWindows().includes("SEIS Demo Studio"), "SEIS Demo Studio must open as a dedicated desktop app.");
    ensure(window.document.querySelector("[data-demo-studio-app]"), "SEIS Demo Studio must render its guided demo surface.");
    let demoStudioState = diagnostics.demoStudioState();
    ensure(demoStudioState.journeyCount >= 4, `SEIS Demo Studio expected at least four journeys, got ${demoStudioState.journeyCount}.`);
    ensure(demoStudioState.statusLegendCount >= 4, "SEIS Demo Studio diagnostics must expose truth-status legends.");
    const builderJourney = window.document.querySelector("[data-demo-studio-journey='builder-flow']");
    ensure(builderJourney, "SEIS Demo Studio must expose the Builder Workflow journey.");
    builderJourney?.click();
    await delay(40);
    demoStudioState = diagnostics.demoStudioState();
    ensure(demoStudioState.activeJourneyId === "builder-flow", "SEIS Demo Studio journey selection must update diagnostics.");
    const firstDemoStep = window.document.querySelector("[data-demo-studio-app] [data-action=\"run-demo-journey-step\"][data-value=\"files\"]");
    ensure(firstDemoStep, "SEIS Demo Studio must expose executable journey steps.");
    firstDemoStep?.click();
    await delay(80);
    ensure(diagnostics.openWindows().includes("Files"), "SEIS Demo Studio step execution must open the Files app.");
    ensure(diagnostics.demoStudioState().completedSteps >= 1, "SEIS Demo Studio step execution must update completed-step diagnostics.");
    const runDemoJourneyButton = window.document.querySelector("[data-demo-studio-app] [data-action=\"run-demo-journey\"]");
    ensure(runDemoJourneyButton, "SEIS Demo Studio must expose a full journey run action.");
    runDemoJourneyButton?.click();
    await delay(100);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/seis-demo-studio-evidence.md"), "SEIS Demo Studio journey run must create a local evidence artifact.");
    ensure(diagnostics.demoStudioState().hasEvidence === true, "SEIS Demo Studio diagnostics must confirm evidence creation.");
    const filesState = diagnostics.fileManagerState();
    ensure(filesState.visibleItems >= 1, "Files diagnostics must expose visible VFS item count.");
    ensure(window.document.querySelector("[data-file-search]"), "Files app must render a search input.");
    ensure(window.document.querySelector("[data-file-view]"), "Files app must render an explicit view mode container.");
    window.document.querySelector("[data-action=\"set-file-view\"][data-value=\"list\"]")?.click();
    await delay(40);
    ensure(diagnostics.fileManagerState().viewMode === "list", "Files list-view action must update diagnostics.");
    const fileSearchInput = window.document.querySelector("[data-file-search]");
    fileSearchInput.value = "seis";
    fileSearchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
    window.document.querySelector("[data-action=\"refresh-files-filter\"]")?.click();
    await delay(40);
    ensure(diagnostics.fileManagerState().query === "seis", "Files search input must update diagnostics.");

    const codeIdeLauncherButton = window.document.querySelector("[data-launcher-grid] [data-app-id=\"code-ide\"]") || window.document.querySelector("[data-dock] [data-app-id=\"code-ide\"]");
    ensure(codeIdeLauncherButton, "launcher or dock must expose Code IDE.");
    codeIdeLauncherButton?.click();
    await delay(60);
    ensure(diagnostics.openWindows().includes("Code IDE"), "Code IDE must open as a dedicated desktop app.");
    ensure(window.document.querySelector("[data-code-ide-app]"), "Code IDE must render its app shell.");
    ensure(window.document.querySelectorAll("[data-code-ide-app] [data-action=\"code-ide-panel\"]").length >= 6, "Code IDE must render at least six panel controls.");
    ensure(window.document.querySelector("[data-code-ide-search-query]"), "Code IDE must render a local search input.");
    ensure(window.document.querySelector("[data-code-ide-inspector]"), "Code IDE must render an inspector panel.");
    ensure(window.document.querySelector("[data-code-ide-statusbar]"), "Code IDE must render a status bar.");
    const initialIdeState = diagnostics.codeIdeState();
    ensure(initialIdeState.panelCount >= 6, "Code IDE diagnostics must expose the full panel manifest.");
    ensure(initialIdeState.hasSafeMockSourceControl === true, "Code IDE diagnostics must keep source control in safe/mock mode.");
    ensure(initialIdeState.hasLocalDemoAssistant === true, "Code IDE diagnostics must keep the assistant in Local Demo mode.");

    window.document.querySelector("[data-code-ide-app] [data-action=\"code-ide-panel\"][data-value=\"source-control\"]")?.click();
    await delay(40);
    ensure(window.document.querySelector("[data-code-ide-source-control]"), "Code IDE source-control panel must render.");
    ensure(diagnostics.codeIdeState().activePanel === "source-control", "Code IDE source-control panel click must update diagnostics.");

    const assistantCommand = window.document.querySelector("[data-code-ide-app] [data-action=\"code-ide-command\"][data-value=\"assistant-review\"]");
    ensure(assistantCommand, "Code IDE must expose a Local Demo assistant command.");
    assistantCommand?.click();
    await delay(40);
    ensure(window.document.querySelector("[data-code-ide-ai-assistant]"), "Code IDE AI assistant panel must render.");
    ensure(diagnostics.codeIdeState().activePanel === "assistant", "Code IDE assistant command must update diagnostics.");

    const ideSearchInput = window.document.querySelector("[data-code-ide-search-query]");
    ideSearchInput.value = "SEIS";
    ideSearchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
    window.document.querySelector("[data-code-ide-app] [data-action=\"code-ide-command\"][data-value=\"search\"]")?.click();
    await delay(40);
    ensure(diagnostics.codeIdeState().activePanel === "search", "Code IDE local search command must select the search panel.");
    ensure(diagnostics.codeIdeState().searchResultCount >= 1, "Code IDE local search should find repository demo files.");

    window.document.querySelector("[data-code-ide-app] [data-action=\"code-ide-panel\"][data-value=\"preview\"]")?.click();
    await delay(40);
    ensure(window.document.querySelector("[data-code-ide-preview-panel]"), "Code IDE preview panel must render.");
    ensure(diagnostics.codeIdeState().activePanel === "preview", "Code IDE preview panel click must update diagnostics.");

    const subAgentRoute = window.document.querySelector("[data-demo-route-group] [data-value=\"sub-agent-os-demo\"]");
    ensure(subAgentRoute, "launcher route group must expose Sub-Agent OS Demo route.");
    subAgentRoute?.click();
    await delay(40);
    ensure(diagnostics.openWindows().includes("Sub-Agent Control"), "Sub-Agent OS route must open Sub-Agent Control window.");
    ensure(window.document.querySelector("[data-subagent-os-demo]"), "Sub-Agent Control must render the five-year OS demo surface.");
    ensure(window.document.querySelectorAll("[data-subagent-os-demo] [data-action=\"set-os-profile\"]").length === 3, "Sub-Agent Control must expose Linux, macOS, and Windows profile controls.");
    ensure(window.document.body.textContent.includes("OS Profile"), "Sub-Agent Control must show the active OS profile.");
    ensure(diagnostics.subAgentProcesses().length === 6, `Sub-Agent diagnostics expected 6 managed processes, got ${diagnostics.subAgentProcesses().length}.`);
    ensure(window.document.querySelector("[data-subagent-process-monitor]"), "Sub-Agent Control must render a managed process monitor.");
    ensure(window.document.querySelectorAll("[data-subagent-process]").length === 6, "Sub-Agent Control must render six managed process rows.");
    ensure(window.document.querySelector("[data-ai-core-orbit]"), "Sub-Agent Control must render the AI Core spatial command surface.");
    ensure(window.document.querySelectorAll("[data-ai-core-version-target]").length === 5, "Sub-Agent Control must render five AI Core version target cards.");
    ensure(window.document.querySelectorAll("[data-ai-core-lane-node]").length === 6, "Sub-Agent Control must render six AI Core lane nodes.");
    ensure(diagnostics.aiCoreOrbit().versionTargets.length === 5, "Desktop diagnostics must expose five AI Core version targets.");
    const orbitButton = window.document.querySelector("[data-action=\"rotate-ai-core-orbit\"]");
    ensure(orbitButton, "Sub-Agent Control must expose an AI Core orbit rotation action.");
    orbitButton?.click();
    await delay(80);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/seis-ai-core-orbit-snapshot.md"), "AI Core orbit action must create a local snapshot artifact.");
    const promotionButton = window.document.querySelector("[data-action=\"promote-ai-core-version\"]");
    ensure(promotionButton, "Sub-Agent Control must expose an AI Core promotion preview action.");
    promotionButton?.click();
    await delay(40);
    ensure(window.document.querySelector("[data-ai-core-orbit]")?.dataset.seisAiCoreVersion === "v0.2-read-only-intelligence", "AI Core promotion preview must advance the visible version target.");
    const pulseButton = window.document.querySelector("[data-action=\"pulse-subagent-processes\"]");
    ensure(pulseButton, "Sub-Agent Control must expose a process pulse action.");
    pulseButton?.click();
    await delay(80);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/sub-agent-process-ledger.md"), "Sub-Agent process pulse must create a local process ledger artifact.");
    const cloudToggle = window.document.querySelector("[data-subagent-process=\"cloud\"] [data-action=\"toggle-subagent-process\"]");
    ensure(cloudToggle, "Sub-Agent process table must expose suspend/resume controls.");
    cloudToggle?.click();
    await delay(40);
    ensure(diagnostics.subAgentProcesses().some((process) => process.laneId === "cloud" && process.status === "Suspended"), "Sub-Agent process controls must suspend a local process.");
    window.document.querySelector("[data-subagent-process=\"cloud\"] [data-action=\"toggle-subagent-process\"]")?.click();
    await delay(40);
    ensure(diagnostics.subAgentProcesses().some((process) => process.laneId === "cloud" && process.status !== "Suspended"), "Sub-Agent process controls must resume a local process.");
    const cycleButton = window.document.querySelector("[data-action=\"run-next-subagent-cycle\"]");
    ensure(cycleButton, "Sub-Agent Control must expose a local next-cycle action.");
    cycleButton?.click();
    await delay(80);
    ensure(window.document.body.textContent.includes("1/20 quarters"), "Sub-Agent next-cycle action must advance exactly one quarter from a fresh simulation.");
    ensure(window.document.body.textContent.includes("Last Cycle"), "Sub-Agent Control must show last-cycle status.");
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/sub-agent-cycle-report.md"), "Sub-Agent next-cycle action must create a local cycle report artifact.");
    ensure(window.document.querySelectorAll("[data-subagent-quarter-grid] article").length === 20, "Sub-Agent Control must render 20 simulated quarters.");
    const simulateProgram = window.document.querySelector("[data-action=\"run-subagent-simulation\"]");
    ensure(simulateProgram, "Sub-Agent Control must expose a five-year simulation action.");
    simulateProgram?.click();
    await delay(80);
    ensure(window.document.body.textContent.includes("20/20 quarters"), "Sub-Agent Control simulation must complete all 20 quarters locally.");
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/sub-agent-five-year-simulation.md"), "Sub-Agent Control simulation must create a virtual filesystem artifact.");

    const aiRoute = window.document.querySelector("[data-demo-route-group] [data-value=\"seis-ai-app\"]");
    ensure(aiRoute, "launcher route group must expose SEIS AI App route.");
    aiRoute?.click();
    await delay(40);
    ensure(diagnostics.openWindows().includes("AI Assistant"), "SEIS AI App route must open AI Assistant window.");
    ensure(window.document.querySelector("[data-ai-plugin-tab=\"Plugin Center\"]"), "AI Assistant must expose Plugin Center tab.");
    ensure(window.document.querySelector("[data-ai-plugin-center]"), "AI Assistant must render Plugin Center content.");
    ensure(diagnostics.personalPluginBridge().length === 5, `Personal plugin bridge diagnostics expected five plugins, got ${diagnostics.personalPluginBridge().length}.`);
    ensure(diagnostics.personalPluginAiCoreLaneMatrix().length === 5, `Personal plugin AI Core lane matrix diagnostics expected five lanes, got ${diagnostics.personalPluginAiCoreLaneMatrix().length}.`);
    ensure(window.document.querySelector("[data-personal-plugin-bridge]"), "AI Plugin Center must render the personal SEIS plugin bridge.");
    ensure(window.document.querySelectorAll("[data-personal-plugin]").length === 5, "Personal SEIS Plugin Bridge must render five installed personal plugin identities.");
    ensure(window.document.querySelector("[data-personal-plugin-bridge]")?.textContent.includes("seis@personal"), "Personal SEIS Plugin Bridge must show seis@personal.");
    ensure(window.document.querySelector("[data-personal-plugin-bridge]")?.textContent.includes("seis-cloud@personal"), "Personal SEIS Plugin Bridge must show seis-cloud@personal.");
    const personalPluginExportButton = window.document.querySelector("[data-action=\"export-personal-plugin-bridge\"]");
    ensure(personalPluginExportButton, "Personal SEIS Plugin Bridge must expose a local export action.");
    personalPluginExportButton?.click();
    await delay(60);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/seis-personal-plugin-bridge.md"), "Personal SEIS Plugin Bridge export must create a virtual filesystem artifact.");
    ensure(window.document.querySelector("[data-ai-plugin-tab=\"Installed AI\"]"), "AI Assistant must expose Installed AI tab.");
    window.document.querySelector("[data-ai-plugin-tab=\"Installed AI\"]")?.click();
    await delay(20);
    ensure(window.document.querySelector("[data-installed-ai-systems]"), "AI Assistant must render Installed AI Systems content.");
    ensure(window.document.querySelectorAll("[data-installed-ai-system]").length === 6, "Installed AI Systems must render six supervised AI/operator profiles.");
    ensure(diagnostics.installedAiSystems().length === 6, `Installed AI diagnostics expected six systems, got ${diagnostics.installedAiSystems().length}.`);
    ensure(diagnostics.installedAiCoreRouteMatrix().length === 6, `Installed AI Core route diagnostics expected six routes, got ${diagnostics.installedAiCoreRouteMatrix().length}.`);
    ensure(diagnostics.mcpRuntimeContract().toolCount === 34, `MCP Runtime Contract diagnostics expected 34 tools, got ${diagnostics.mcpRuntimeContract().toolCount}.`);
    ensure(diagnostics.mcpRuntimeContract().resourceCount === 30, `MCP Runtime Contract diagnostics expected 30 resources, got ${diagnostics.mcpRuntimeContract().resourceCount}.`);
    ensure(diagnostics.mcpRuntimeContract().sourcePath === "content/development/seis-ai-core-mcp-runtime-contract.json", "MCP Runtime Contract diagnostics must expose the canonical source path.");
    ensure(diagnostics.mcpRuntimeContract().resourceUri === "seis://ai/mcp-runtime-contract.json", "MCP Runtime Contract diagnostics must expose the canonical MCP resource URI.");
    ensure(diagnostics.mcpRuntimeContract().secondBrainSystemResource === "seis://brain/second-brain-system.json", "MCP Runtime Contract diagnostics must expose the Second Brain MCP resource URI.");
    ensure(window.document.querySelector("[data-installed-ai-core-route-matrix]"), "Installed AI Systems must render the installed AI Core route matrix.");
    ensure(window.document.querySelectorAll("[data-installed-ai-core-route]").length === 6, "Installed AI Core Route Matrix must render six route rows.");
    ensure(window.document.querySelector("[data-installed-ai-core-route-matrix]")?.textContent.includes("v0.2-read-only-intelligence"), "Installed AI Core Route Matrix must show AI Core version targets.");
    ensure(window.document.querySelector("[data-personal-plugin-ai-core-lane-matrix]"), "Installed AI Systems must render the personal plugin AI Core lane matrix.");
    ensure(window.document.querySelectorAll("[data-personal-plugin-ai-core-lane]").length === 5, "Personal Plugin AI Core Lane Matrix must render five lane rows.");
    ensure(window.document.querySelector("[data-personal-plugin-ai-core-lane-matrix]")?.textContent.includes("v0.4-multi-workspace-readiness"), "Personal Plugin AI Core Lane Matrix must show canonical AI Core version targets.");
    const personalPluginLaneMatrixExportButton = window.document.querySelector("[data-action=\"export-personal-plugin-ai-core-lane-matrix\"]");
    ensure(personalPluginLaneMatrixExportButton, "Personal Plugin AI Core Lane Matrix must expose a local export action.");
    personalPluginLaneMatrixExportButton?.click();
    await delay(60);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/seis-personal-plugin-ai-core-lane-matrix.md"), "Personal Plugin AI Core Lane Matrix export must create a virtual filesystem artifact.");
    ensure(window.document.querySelector("[data-mcp-runtime-contract]"), "Installed AI Systems must render the MCP runtime contract.");
    ensure(window.document.querySelectorAll("[data-mcp-runtime-surface]").length === 4, "MCP Runtime Contract must render four runtime surfaces.");
    ensure(window.document.querySelector("[data-mcp-runtime-contract]")?.textContent.includes("stdio JSON-RPC"), "MCP Runtime Contract must show the stdio JSON-RPC transport.");
    ensure(window.document.querySelector("[data-mcp-runtime-contract]")?.textContent.includes("26"), "MCP Runtime Contract must show the 26-resource registry count.");
    const mcpRuntimeContractExportButton = window.document.querySelector("[data-action=\"export-mcp-runtime-contract\"]");
    ensure(mcpRuntimeContractExportButton, "MCP Runtime Contract must expose a local export action.");
    mcpRuntimeContractExportButton?.click();
    await delay(60);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/seis-mcp-runtime-contract.md"), "MCP Runtime Contract export must create a virtual filesystem artifact.");
    const routeMatrixExportButton = window.document.querySelector("[data-action=\"export-installed-ai-core-route-matrix\"]");
    ensure(routeMatrixExportButton, "Installed AI Core Route Matrix must expose a local export action.");
    routeMatrixExportButton?.click();
    await delay(60);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/seis-installed-ai-core-route-matrix.md"), "Installed AI Core Route Matrix export must create a virtual filesystem artifact.");
    ensure(diagnostics.aiCoreResourceBridge().planViewResource === "seis://ai/sub-agent-5-year-plan-view.json", "Desktop diagnostics must expose the generated AI Core plan-view resource.");
    ensure(diagnostics.aiCoreResourceBridge().mcpRuntimeContractResource === "seis://ai/mcp-runtime-contract.json", "Desktop diagnostics must expose the MCP runtime contract resource.");
    ensure(window.document.querySelector("[data-ai-core-resource-bridge]"), "Installed AI Systems must render the AI Core resource bridge.");
    ensure(window.document.querySelector("[data-ai-core-resource-bridge]")?.textContent.includes("seis://ai/sub-agent-5-year-plan-view.json"), "AI Core resource bridge must show the plan-view resource URI.");
    ensure(window.document.querySelector("[data-ai-core-resource-bridge]")?.textContent.includes("seis://ai/mcp-runtime-contract.json"), "AI Core resource bridge must show the MCP runtime contract resource URI.");
    const bridgeExportButton = window.document.querySelector("[data-action=\"export-ai-core-resource-bridge\"]");
    ensure(bridgeExportButton, "AI Core resource bridge must expose a local export action.");
    bridgeExportButton?.click();
    await delay(60);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/seis-ai-core-resource-bridge.md"), "AI Core resource bridge export must create a virtual filesystem artifact.");
    const installedAuditButton = window.document.querySelector("[data-action=\"audit-installed-ai-systems\"]");
    ensure(installedAuditButton, "Installed AI Systems must expose a local audit action.");
    installedAuditButton?.click();
    await delay(40);
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/installed-ai-systems-audit.md"), "Installed AI audit must create a virtual filesystem artifact.");
    window.document.querySelector("[data-ai-plugin-tab=\"Sub-Agent Plan\"]")?.click();
    await delay(20);
    ensure(window.document.querySelector("[data-subagent-ai-plan]"), "AI Assistant must render Sub-Agent Plan content.");
    ensure(window.document.querySelector("[data-subagent-plan-view-resource]"), "Sub-Agent Plan must render the generated plan-view resource details.");
    ensure(window.document.querySelector("[data-subagent-plan-view-resource]")?.textContent.includes("apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json"), "Sub-Agent Plan must show the generated plan-view file path.");
    window.document.querySelector("[data-ai-plugin-tab=\"Plugin Center\"]")?.click();
    await delay(20);

    const pluginToggle = window.document.querySelector("[data-action=\"toggle-ai-plugin\"]");
    ensure(pluginToggle, "AI Plugin Center must expose plugin enable/disable controls.");
    pluginToggle?.click();
    await delay(40);
    window.document.querySelector("[data-ai-plugin-tab=\"Tool Calls\"]")?.click();
    await delay(20);
    ensure(window.document.body.textContent.includes("toggle_ai_plugin"), "AI Plugin Center toggle must record a local tool-call event.");

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
    const commandInput = window.document.querySelector("[data-command-input]");
    commandInput.value = "SEIS Code Web";
    commandInput.dispatchEvent(new window.Event("input", { bubbles: true }));
    await delay(20);
    ensure(window.document.querySelector("[data-command-results] [data-value=\"seis-code-web\"]"), "SEIS Search must expose SEIS Code Web route.");

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
      "demo-studio",
      "paint",
      "git-client",
      "sub-agent-control",
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

async function verifyOsProfileSwitch(window, diagnostics) {
  const shell = window.document.querySelector(".desktop-shell");
  ensure(shell, "desktop runtime must render the desktop shell.");
  for (const profile of ["macos", "windows", "linux"]) {
    const button = window.document.querySelector(`[data-action="set-os-profile"][data-value="${profile}"]`);
    ensure(button, `desktop runtime must render ${profile} profile control.`);
    button?.click();
    await delay(20);
    ensure(diagnostics.osProfile() === profile, `desktop diagnostics must report ${profile} profile after switching.`);
    ensure(shell?.dataset.osProfile === profile, `desktop shell must apply ${profile} data-os-profile after switching.`);
    ensure(
      window.document.querySelector(`[data-action="set-os-profile"][data-value="${profile}"].is-active[aria-pressed="true"]`),
      `desktop ${profile} profile button must show active pressed state.`
    );
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
  if (appId === "demo-studio") {
    ensure(diagnostics.filePaths().includes("/home/seis/Documents/seis-demo-studio-evidence.md"), `${appId} primary workflow must create the Demo Studio evidence artifact.`);
  } else if (["notes", "sheets", "paint", "downloads", "sub-agent-control"].includes(appId)) {
    ensure(diagnostics.filePaths().length > beforeFiles.length, `${appId} primary workflow must create a virtual file artifact.`);
  }
}
