import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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

for (const language of requiredLanguages) {
  ensure(js.includes(`"${language}"`), `SEIS Code runtime missing language mode: ${language}`);
}

for (const required of ["indexedDB.open", "createObjectStore", "terminalHistory", "Local Demo", "not Anthropic", "list_files", "apply_patch"]) {
  ensure(js.includes(required), `SEIS Code runtime missing required capability marker: ${required}`);
}

for (const required of [".monaco-host", ".terminal-output", ".activity-button", "@media", "prefers-reduced-motion"]) {
  ensure(css.includes(required), `SEIS Code CSS missing required selector or media rule: ${required}`);
}

const routePaths = new Set((routes?.routes || []).map((route) => route.path));
ensure(routePaths.has("/seis-code.html"), "routes config must include /seis-code.html.");
ensure(serviceWorker.includes("./seis-code.html"), "service worker must cache SEIS Code HTML.");
ensure(serviceWorker.includes("./seis-code.css"), "service worker must cache SEIS Code CSS.");
ensure(serviceWorker.includes("./seis-code.js"), "service worker must cache SEIS Code JS.");
ensure(sitemap.includes("/seis-code.html"), "sitemap must include SEIS Code route.");

if (failures.length > 0) {
  console.error("SEIS Code check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Code check passed.");
