#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, normalize } from "node:path";

const root = process.cwd();
const webRoot = join(root, "apps/web");

const files = {
  manifest: "apps/web/reference-banks/reference-apps.js",
  replica: "apps/web/seis-linux-replica.html",
  readme: "README.md"
};

const expectedSources = {
  stitch_yapay_zeka_web_platformu: {
    count: 71,
    label: "Website / AI Platform",
    category: "reference-aether",
    icon: "AI"
  },
  stitch_web_based_linux_desktop: {
    count: 148,
    label: "Ubuntu Web Desktop",
    category: "reference-web-desktop",
    icon: "WD"
  }
};

const forbiddenPatterns = [
  ["openai_key", /\bsk-[A-Za-z0-9_-]{12,}/],
  ["github_token", /\b(?:ghp_|github_pat_)[A-Za-z0-9_]+/],
  ["ssh_private_key", /BEGIN (?:OPENSSH|RSA|EC) PRIVATE KEY/],
  ["env_secret", /\b(?:OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|AWS_SECRET_ACCESS_KEY|PRIVATE_KEY)=/],
  ["ssh_host_credential", /\b(?:ssh|scp|sftp):\/\/[^/\s]+@[^/\s]+/i]
];

const failures = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readText(relativePath) {
  const fullPath = join(root, relativePath);
  if (!existsSync(fullPath)) {
    failures.push(`missing required file: ${relativePath}`);
    return "";
  }
  return readFileSync(fullPath, "utf8");
}

function parseManifest(text) {
  const match = text.match(/window\.SEIS_REFERENCE_APPS\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  if (!match) {
    failures.push("reference manifest does not expose window.SEIS_REFERENCE_APPS as a JSON array");
    return [];
  }

  try {
    return JSON.parse(match[1]);
  } catch (error) {
    failures.push(`reference manifest JSON parse failed: ${error.message}`);
    return [];
  }
}

function localWebPath(route) {
  const cleanRoute = String(route || "").replace(/^\.\//, "");
  const fullPath = normalize(join(webRoot, cleanRoute));
  ensure(fullPath.startsWith(webRoot), `reference path escapes apps/web: ${route}`);
  return fullPath;
}

function countCodeFiles(source) {
  const sourceRoot = join(root, "apps/web/reference-banks", source);
  if (!existsSync(sourceRoot)) return 0;

  return readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(join(sourceRoot, entry.name, "code.html")))
    .length;
}

function scanSecretLikePatterns(label, text) {
  for (const [name, pattern] of forbiddenPatterns) {
    ensure(!pattern.test(text), `${label} contains forbidden secret-like pattern: ${name}`);
  }
}

const manifestText = readText(files.manifest);
const replicaText = readText(files.replica);
const readmeText = readText(files.readme);
const apps = parseManifest(manifestText);

const seenIds = new Set();
const seenRoutes = new Set();
const sourceCounts = Object.fromEntries(Object.keys(expectedSources).map((source) => [source, 0]));
let routeBytes = 0;
let thumbnailBytes = 0;
let missingThumbnails = 0;
const missingThumbnailIds = [];

ensure(apps.length === 219, `expected 219 manifest entries, found ${apps.length}`);

for (const app of apps) {
  const sourceSpec = expectedSources[app.source];
  ensure(Boolean(sourceSpec), `unexpected reference source: ${app.source || "missing"}`);
  if (sourceSpec) sourceCounts[app.source] += 1;

  ensure(typeof app.id === "string" && app.id.startsWith(`ref-${app.source}-`), `invalid reference id: ${app.id || "missing"}`);
  ensure(!seenIds.has(app.id), `duplicate reference id: ${app.id}`);
  seenIds.add(app.id);

  ensure(app.type === "reference", `reference app ${app.id} must use type=reference`);
  ensure(app.desktop === false, `reference app ${app.id} must not be treated as a desktop app`);
  ensure(app.bridge === null, `reference app ${app.id} must not define a live bridge`);

  if (sourceSpec) {
    ensure(app.category === sourceSpec.category, `reference app ${app.id} category mismatch: ${app.category}`);
    ensure(app.icon === sourceSpec.icon, `reference app ${app.id} icon mismatch: ${app.icon}`);
  }

  ensure(String(app.route || "").startsWith(`./reference-banks/${app.source}/`), `reference app ${app.id} has invalid route: ${app.route || "missing"}`);
  ensure(String(app.route || "").endsWith("/code.html"), `reference app ${app.id} route must end with code.html`);
  if (app.thumbnail) {
    ensure(String(app.thumbnail).startsWith(`./reference-banks/${app.source}/`), `reference app ${app.id} has invalid thumbnail: ${app.thumbnail}`);
    ensure(String(app.thumbnail).endsWith("/screen.png"), `reference app ${app.id} thumbnail must end with screen.png`);
  } else {
    missingThumbnails += 1;
    missingThumbnailIds.push(app.id);
  }
  ensure(!seenRoutes.has(app.route), `duplicate reference route: ${app.route}`);
  seenRoutes.add(app.route);

  const routePath = localWebPath(app.route);
  ensure(existsSync(routePath), `missing reference route file for ${app.id}: ${app.route}`);

  if (existsSync(routePath)) {
    const routeText = readFileSync(routePath, "utf8");
    routeBytes += Buffer.byteLength(routeText);
    scanSecretLikePatterns(`${app.id} route`, routeText);
  }

  if (app.thumbnail) {
    const thumbnailPath = localWebPath(app.thumbnail);
    ensure(existsSync(thumbnailPath), `missing reference thumbnail for ${app.id}: ${app.thumbnail}`);
  }

  if (app.thumbnail && existsSync(localWebPath(app.thumbnail))) {
    const thumbnailPath = localWebPath(app.thumbnail);
    thumbnailBytes += statSync(thumbnailPath).size;
  }
}

for (const [source, spec] of Object.entries(expectedSources)) {
  ensure(sourceCounts[source] === spec.count, `expected ${spec.count} ${spec.label} manifest entries, found ${sourceCounts[source]}`);
  ensure(countCodeFiles(source) === spec.count, `expected ${spec.count} ${spec.label} code.html files, found ${countCodeFiles(source)}`);
  ensure(replicaText.includes(spec.label), `Linux Replica route missing source label: ${spec.label}`);
  ensure(readmeText.includes(spec.label), `README missing source label: ${spec.label}`);
}

ensure(replicaText.includes("SEIS App Library"), "Linux Replica route must expose the SEIS App Library surface");
ensure(replicaText.includes("Website Lane"), "Linux Replica route must expose Website Lane copy");
ensure(replicaText.includes("Ubuntu Desktop"), "Linux Replica route must expose Ubuntu Desktop copy");
ensure(replicaText.includes("No SSH"), "Linux Replica route must preserve no-SSH demo boundary copy");
ensure(replicaText.includes("readReferenceSourceIntent"), "Linux Replica route must support source-focused App Library deep links");
ensure(replicaText.includes("referenceSourceIntent:()=>readReferenceSourceIntent()"), "Linux Replica diagnostics must expose source-focused App Library intent");
ensure(replicaText.includes("referenceSourceFocusCopy"), "Linux Replica route must render source-focused App Library copy");
ensure(replicaText.includes("referenceDesignCards"), "Linux Replica route must render hidden-source design board cards");
ensure(replicaText.includes("referenceCategoryLabel"), "Linux Replica route must map internal reference categories to SEIS lane labels");
ensure(replicaText.includes("App Lane Coverage"), "Linux Replica route must use SEIS App Lane wording in visible coverage UI");
ensure(replicaText.includes('const STARTUP_APP_FLOW=["live-demo","reference-vault","code-ai","ai-chat"]'), "Linux Replica startup must enter Website/Ubuntu context and focus SEIS AI Chat");
ensure(replicaText.includes('const DEMO_TOUR_APP_FLOW=["live-demo","code-ai","agi-control","ssh-control","demo-readiness","reference-vault","apple-native-shell","terminal","search","code","paint","cloud","ai-chat"]'), "Linux Replica demo tour must finish on SEIS AI Chat after Website/Ubuntu and Apple Native surfaces");
ensure(replicaText.includes("(restored.length?restored:startup).forEach(openApp)"), "Linux Replica must use the chat-centered startup flow when no session is restored");
ensure(replicaText.includes("startupAppFlow:()=>STARTUP_APP_FLOW.slice()"), "Linux Replica diagnostics must expose the startup app flow");
ensure(replicaText.includes("demoTourAppFlow:()=>DEMO_TOUR_APP_FLOW.slice()"), "Linux Replica diagnostics must expose the demo tour app flow");
ensure(replicaText.includes("\"apple-native-shell\",\"Apple Native Shell\",\"APL\",\"native\""), "Linux Replica must register Apple Native Shell as a contained native app");
ensure(replicaText.includes("data-seis-apple-native-shell"), "Linux Replica must render the contained Apple Native Shell capsule");
ensure(replicaText.includes("data-native-shell-contained=\\\"linux-replica\\\""), "Apple Native Shell capsule must declare Linux Replica containment");
ensure(replicaText.includes("SeisAppleNativeShell is contained as a controlled native capsule"), "Apple Native Shell capsule must explain the containment boundary");
ensure(replicaText.includes("No app bundle launch, host shell, provider key, SSH, or credential action runs here."), "Apple Native Shell capsule must preserve no-host-launch boundary copy");
ensure(replicaText.includes('scope:"Apple",state:"Contained"'), "SEIS Search must expose Apple Native Shell as a contained Apple scope");
ensure(replicaText.includes("apple:()=>{openApp(\"apple-native-shell\")"), "Linux Replica terminal must open the contained Apple Native Shell capsule with apple");
ensure(replicaText.includes("Try <span class=\\\"info\\\">apple</span>"), "Linux Replica terminal help must surface the Apple Native Shell shortcut");
ensure(
  replicaText.includes('data-app=\\"apple-native-shell\\" title=\\"Apple Native Shell\\" aria-label=\\"Apple Native Shell\\">"+appActionSymbolMarkup("apple-native-shell","APL"'),
  "Linux Replica Launchpad must expose an APL shortcut for Apple Native Shell"
);
ensure(replicaText.includes("function appSystemCode"), "Linux Replica route must define SEIS OS app code labels");
ensure(replicaText.includes("app-code-label"), "Linux Replica route must render compact app code labels in OS chrome");
ensure(replicaText.includes("<strong>SEIS OS</strong>"), "Linux Replica side rail must use SEIS OS chrome wording");
ensure(replicaText.includes('b.setAttribute("aria-label","Open "+app.name)'), "Linux Replica desktop icons must keep accessible app names while showing codes");
ensure(replicaText.includes('b.setAttribute("aria-label","Focus "+app.name)'), "Linux Replica taskbar icons must keep accessible app names while showing codes");
ensure(replicaText.includes('class=\\\"app-tile\\\" data-app=\\\""+escapeHtml(app.id)+"\\\" title=\\\""+escapeHtml(app.name)+"\\\" aria-label=\\\"Open "+escapeHtml(app.name)'), "Linux Replica launcher tiles must keep accessible names while showing codes");
ensure(replicaText.includes('class=\\\"app-code-label\\\">"+escapeHtml(appSystemCode(app))'), "Linux Replica launcher tiles must show SEIS app codes");
ensure(!replicaText.includes('b.innerHTML="<span>"+escapeHtml(app.icon)+"</span><span>"+escapeHtml(app.name)+"</span>"'), "Linux Replica taskbar must not show long app names in the OS chrome");
ensure(!replicaText.includes('b.innerHTML="<strong>"+escapeHtml(app.icon)+"</strong><span>"+escapeHtml(app.name)+"</span>"'), "Linux Replica desktop icons must not show long app names in the OS chrome");
ensure(!replicaText.includes('<strong>"+escapeHtml(app.icon)+"</strong><span>"+escapeHtml(app.name)+"</span></button>'), "Linux Replica launcher tiles must not show long app names in the OS chrome");
ensure(replicaText.includes("lanes:()=>commands.sources()"), "Linux Replica terminal must expose lanes as the user-facing source coverage alias");
ensure(!replicaText.includes("raw source folders"), "Linux Replica route must not expose raw source folder wording in visible App Library copy");
ensure(!replicaText.includes("Source Lane Coverage"), "Linux Replica route must not expose Source Lane Coverage in visible UI");
ensure(!replicaText.includes("design source"), "Linux Replica route must not call app catalog items design sources in visible UI");
ensure(!replicaText.includes("Category:</strong> <span class=\\\"muted\\\">\"+escapeHtml(app.category)"), "Linux Replica detail cards must not render internal reference category values");
ensure(!replicaText.includes("<p class=\\\"muted\\\">\"+escapeHtml(app.category)+\"</p>"), "Linux Replica installed-app cards must not render internal reference category values");
ensure(replicaText.includes("data-reference-active-source"), "Linux Replica route must tag the active App Library source");
ensure(replicaText.includes("data-reference-lane-focus"), "Linux Replica route must expose a visible focused lane strip");
ensure(replicaText.includes("data-reference-design-board"), "Linux Replica route must expose a visible Design Board");
ensure(replicaText.includes("data-seis-system-actions"), "Linux Replica route must expose coded SEIS system actions for App Library tiles");
ensure(
  replicaText.includes('actionSymbolMarkup(appIconKind(app),"APP"') &&
    replicaText.includes('actionSymbolMarkup("globe","TAB"'),
  "Linux Replica App Library tiles must use APP/TAB system action codes"
);
ensure(
  replicaText.includes('actionSymbolMarkup("library","SYS #"+(index+1)'),
  "Linux Replica App Library tiles must expose compact SYS index codes"
);
ensure(!replicaText.includes(">Open</button><button class=\\\"secondary\\\" data-ref-route"), "Linux Replica App Library tiles must not show generic Open/Tab action text");
ensure(replicaText.includes('data-ref-focus=\\"website\\"'), "Linux Replica route must expose Website lane focus");
ensure(replicaText.includes('data-ref-focus=\\"ubuntu\\"'), "Linux Replica route must expose Ubuntu lane focus");
ensure(replicaText.includes("referencePlaceholderMarkup"), "Linux Replica route must define reference thumbnail fallback markup");
ensure(replicaText.includes(".reference-preview.is-placeholder"), "Linux Replica route must style missing thumbnail tile fallbacks");
ensure(replicaText.includes(".reference-cover.is-placeholder"), "Linux Replica route must style missing thumbnail detail fallbacks");
ensure(replicaText.includes("SEIS AI Chat"), "Linux Replica route must expose separate SEIS AI Chat surface");
ensure(replicaText.includes("SEIS Code AI"), "Linux Replica route must expose separate SEIS Code AI surface");
ensure(replicaText.includes("seis-ai-chat-transcript.v1"), "SEIS AI Chat must persist a browser-local transcript key");
ensure(replicaText.includes("data-ai-chat-continuity=\\\"localStorage\\\""), "SEIS AI Chat must label local transcript continuity");
ensure(replicaText.includes("seis-code-ai-plan.v1"), "SEIS Code AI must persist a separate browser-local plan key");
ensure(replicaText.includes("data-code-ai-separate=\\\"chat-isolated\\\""), "SEIS Code AI must stay isolated from the chat transcript");
ensure(replicaText.includes("Keep coding memory separate from SEIS AI Chat"), "SEIS Code AI generated plan must preserve chat/code separation");
ensure(replicaText.includes("SEIS AGI Control"), "Linux Replica route must expose AGI control gates");
ensure(replicaText.includes("SEIS SSH Control"), "Linux Replica route must expose SSH control gates");
ensure(readmeText.includes("219 supplied ZIP modules"), "README must document the 219 supplied ZIP modules");
ensure(readmeText.includes("placeholder previews"), "README must document reference thumbnail fallbacks");
ensure(readmeText.includes("?demo=live&source=website"), "README must document the Website lane deep link");
ensure(readmeText.includes("?demo=live&source=ubuntu"), "README must document the Ubuntu lane deep link");
scanSecretLikePatterns("reference manifest", manifestText);

if (failures.length > 0) {
  console.error("SEIS reference bank check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  checkedAt: new Date().toISOString(),
  files,
  manifestEntries: apps.length,
  sources: Object.fromEntries(
    Object.entries(expectedSources).map(([source, spec]) => [
      source,
      {
        label: spec.label,
        manifestEntries: sourceCounts[source],
        codeFiles: countCodeFiles(source)
      }
    ])
  ),
  payload: {
    routeBytes,
    thumbnailBytes,
    missingThumbnails,
    missingThumbnailIds
  },
  boundaries: {
    noLiveBridge: true,
    noDesktopPromotion: true,
    secretLikePatternScan: "passed"
  }
}, null, 2));
