#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requireGenerated = process.argv.includes("--require-generated");

const files = {
  runScript: "script/build_and_run.sh",
  packageJson: "package.json",
  packageReadme: "packages/seis_platform_swift/README.md",
  environment: ".codex/environments/environment.toml",
  swiftContract: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleRunHandoffContract.swift",
  publicDemoLaneRoute: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisPublicDemoLaneRoute.swift",
  publicDemoLaneRouteTests: "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPublicDemoLaneRouteTests.swift",
  nativeApp: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/App/SeisAppleNativeShellApp.swift",
  nativeRootView: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAppleNativeShellRootView.swift",
  nativeHomeView: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAppleNativeShellFreshDemoHomeView.swift",
  appLibraryPanel: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAppLibraryPanelView.swift",
  generatedSnapshot: "dist/SeisAppleNativeShell.app/Contents/Resources/seis-repository-surface-snapshot.json",
  websiteReferences: "apps/web/reference-banks/stitch_yapay_zeka_web_platformu",
  ubuntuReferences: "apps/web/reference-banks/stitch_web_based_linux_desktop"
};

const failures = [];

function readText(file) {
  const path = join(root, file);
  if (!existsSync(path)) {
    failures.push(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function countReferenceModules(relativeDirectory) {
  const directory = join(root, relativeDirectory);
  if (!existsSync(directory)) return 0;

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(join(directory, entry.name, "code.html")))
    .length;
}

function ensureIncludes(label, text, snippets) {
  for (const snippet of snippets) {
    ensure(text.includes(snippet), `${label} missing required snippet: ${snippet}`);
  }
}

function forbiddenPatternMatches(text) {
  const patterns = [
    ["openai_key", /\bsk-[A-Za-z0-9_-]{12,}/],
    ["github_token", /\b(?:ghp_|github_pat_)[A-Za-z0-9_]+/],
    ["ssh_private_key", /BEGIN (?:OPENSSH|RSA|EC) PRIVATE KEY/],
    ["env_secret", /\b(?:OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|AWS_SECRET_ACCESS_KEY|PRIVATE_KEY)=/]
  ];

  return patterns.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

const runScript = readText(files.runScript);
const packageJson = readText(files.packageJson);
const packageReadme = readText(files.packageReadme);
const environment = readText(files.environment);
const swiftContract = readText(files.swiftContract);
const publicDemoLaneRoute = readText(files.publicDemoLaneRoute);
const publicDemoLaneRouteTests = readText(files.publicDemoLaneRouteTests);
const nativeApp = readText(files.nativeApp);
const nativeRootView = readText(files.nativeRootView);
const nativeHomeView = readText(files.nativeHomeView);
const appLibraryPanel = readText(files.appLibraryPanel);

const websiteCount = countReferenceModules(files.websiteReferences);
const ubuntuCount = countReferenceModules(files.ubuntuReferences);
const totalReferenceCount = websiteCount + ubuntuCount;

ensure(websiteCount === 71, `expected 71 Website / AI Platform reference modules, found ${websiteCount}`);
ensure(ubuntuCount === 148, `expected 148 Ubuntu Web Desktop reference modules, found ${ubuntuCount}`);
ensure(totalReferenceCount === 219, `expected 219 total supplied reference modules, found ${totalReferenceCount}`);

ensureIncludes("run script", runScript, [
  "REPOSITORY_SNAPSHOT=\"$APP_RESOURCES/seis-repository-surface-snapshot.json\"",
  "REPOSITORY_ROOT_ARGS=(--repository-root \"$ROOT_DIR\" --repository-snapshot \"$REPOSITORY_SNAPSHOT\")",
  "generate_repository_snapshot",
  "\"sourceMode\": \"launcher-generated-public-safe\"",
  "Website / AI Platform",
  "Ubuntu Web Desktop",
  "apps/web/seis-linux-replica.html?demo=live&source=website",
  "apps/web/seis-linux-replica.html?demo=live&source=ubuntu",
  "--website-demo-lane|website-demo-lane",
  "--ubuntu-demo-lane|ubuntu-demo-lane",
  "--verify-website-demo-lane|verify-website-demo-lane",
  "--verify-ubuntu-demo-lane|verify-ubuntu-demo-lane",
  "--app-library|app-library",
  "--verify-app-library|verify-app-library",
  "APP_ARGS=(--open-panel app-library)",
  "APP_ARGS=(--open-public-demo-lane website)",
  "APP_ARGS=(--open-public-demo-lane ubuntu)",
  "No SSH, provider calls, deployment actions, or credentials are activated by this snapshot."
]);

ensureIncludes("Swift run handoff contract", swiftContract, [
  "seis-repository-surface-snapshot.json",
  "--repository-snapshot",
  "Website / AI Platform",
  "Ubuntu Web Desktop",
  "apps/web/seis-linux-replica.html?demo=live&source=website",
  "apps/web/seis-linux-replica.html?demo=live&source=ubuntu",
  "generate_repository_snapshot"
]);

ensureIncludes("Swift native home view", nativeHomeView, [
  "deepLink: lane.deepLink",
  "fullStackPublicDemoHandoffBar",
  "fullStackWebLanes",
  "fullStackWebLaneRoute",
  "fullStackLaneDetail",
  "Web lane:",
  "openFullStackWebLane",
  "fullStackWebLaneURL",
  "SeisPublicDemoLaneRoute(deepLink: deepLink)",
  "route.isAllowedPublicDemoLane",
  "route.fileURL(repositoryRoot: repositoryRootURL)",
  "Web Lane Aç",
  "Public Demo",
  "No-key"
]);

ensureIncludes("Swift native app menu", nativeApp, [
  "Open Website Demo Lane",
  "Open Ubuntu Demo Lane",
  "openPublicDemoLane(source: \"website\")",
  "openPublicDemoLane(source: \"ubuntu\")",
  "--open-public-demo-lane",
  "SeisPublicDemoLaneRoute.fileURL",
  "apps/web/seis-linux-replica.html?demo=live&source=\\(source)"
]);

ensureIncludes("Swift public demo lane route", publicDemoLaneRoute, [
  "SeisPublicDemoLaneRoute",
  "expectedRelativePath = \"apps/web/seis-linux-replica.html\"",
  "allowedSources: Set<String> = [\"website\", \"ubuntu\"]",
  "allowedQueryNames: Set<String> = [\"demo\", \"source\"]",
  "isAllowedPublicDemoLane",
  "fileURL(repositoryRoot: URL, deepLink: String)"
]);

ensureIncludes("Swift public demo lane route tests", publicDemoLaneRouteTests, [
  "publicDemoLaneRouteBuildsWebsiteFileURL",
  "publicDemoLaneRouteBuildsUbuntuFileURLWithQueryOrderFlexibility",
  "publicDemoLaneRouteRejectsNonPublicDemoDestinations",
  "demo=live&source=website",
  "source=ubuntu&demo=live",
  "source=prod",
  "token=secret"
]);

ensureIncludes("Swift package README", packageReadme, [
  "seis-repository-surface-snapshot.json",
  "--repository-snapshot",
  "Website / AI Platform",
  "Ubuntu Web Desktop",
  "?demo=live&source=website",
  "?demo=live&source=ubuntu",
  "Public Demo handoff bar",
  "Website or Ubuntu public demo lane",
  "SeisPublicDemoLaneRoute",
  "only no-key",
  "Open Website Demo Lane",
  "Open Ubuntu Demo Lane",
  "./script/build_and_run.sh --website-demo-lane",
  "./script/build_and_run.sh --ubuntu-demo-lane",
  "./script/build_and_run.sh --verify-website-demo-lane",
  "./script/build_and_run.sh --verify-ubuntu-demo-lane",
  "validated route helper",
  "not as a live provider, SSH, or deployment bridge",
  "no-key/no-SSH",
  "npm run check:seis-apple-native-snapshot"
]);

ensureIncludes("package.json", packageJson, [
  "\"check:seis-apple-native-snapshot\": \"node scripts/check-seis-apple-native-snapshot.mjs\""
]);

const runScriptSecretMatches = forbiddenPatternMatches(runScript);
ensure(runScriptSecretMatches.length === 0, `run script contains forbidden secret-like pattern(s): ${runScriptSecretMatches.join(", ")}`);

let generatedSnapshot = null;
const generatedSnapshotPath = join(root, files.generatedSnapshot);
const generatedSnapshotExists = existsSync(generatedSnapshotPath);

if (generatedSnapshotExists) {
  const generatedText = readFileSync(generatedSnapshotPath, "utf8");
  const generatedSecretMatches = forbiddenPatternMatches(generatedText);
  ensure(
    generatedSecretMatches.length === 0,
    `generated snapshot contains forbidden secret-like pattern(s): ${generatedSecretMatches.join(", ")}`
  );

  try {
    generatedSnapshot = JSON.parse(generatedText);
    const websiteLane = generatedSnapshot.fullStackDesignLanes?.find((lane) => lane.id === "website-ai-platform");
    const ubuntuLane = generatedSnapshot.fullStackDesignLanes?.find((lane) => lane.id === "ubuntu-web-desktop");
    const vaultSignal = generatedSnapshot.repositorySignals?.find((signal) => signal.title === "Web Reference Vault");

    ensure(generatedSnapshot.sourceMode === "launcher-generated-public-safe", "generated snapshot sourceMode must stay launcher-generated-public-safe");
    ensure(websiteLane?.badge === "71 modules", `generated snapshot Website / AI Platform badge mismatch: ${websiteLane?.badge || "missing"}`);
    ensure(ubuntuLane?.badge === "148 modules", `generated snapshot Ubuntu Web Desktop badge mismatch: ${ubuntuLane?.badge || "missing"}`);
    ensure(websiteLane?.deepLink === "apps/web/seis-linux-replica.html?demo=live&source=website", `generated snapshot Website / AI Platform deepLink mismatch: ${websiteLane?.deepLink || "missing"}`);
    ensure(ubuntuLane?.deepLink === "apps/web/seis-linux-replica.html?demo=live&source=ubuntu", `generated snapshot Ubuntu Web Desktop deepLink mismatch: ${ubuntuLane?.deepLink || "missing"}`);
    ensure(vaultSignal?.value === "219", `generated snapshot Web Reference Vault value mismatch: ${vaultSignal?.value || "missing"}`);
  } catch (error) {
    failures.push(`generated snapshot is not valid JSON: ${error.message}`);
  }
} else if (requireGenerated) {
  failures.push(`missing generated snapshot: ${files.generatedSnapshot}`);
}

const result = {
  ok: failures.length === 0,
  checkedAt: new Date().toISOString(),
  mode: requireGenerated ? "static+generated" : "static",
  files,
  referenceCounts: {
    websiteAIPlatform: websiteCount,
    ubuntuWebDesktop: ubuntuCount,
    total: totalReferenceCount
  },
  generatedSnapshot: {
    exists: generatedSnapshotExists,
    sourceMode: generatedSnapshot?.sourceMode || null
  },
  checks: failures.length === 0 ? ["apple-native-snapshot-contract"] : []
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
