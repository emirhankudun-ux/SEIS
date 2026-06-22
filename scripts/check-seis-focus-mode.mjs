#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  vision: "docs/governance/seis-supreme-vision.md",
  agents: "AGENTS.md",
  appHtml: "apps/seis-demo-web/index.html",
  appJs: "apps/seis-demo-web/script.js",
  appCss: "apps/seis-demo-web/styles.css",
  webContract: "apps/seis-demo-web/contracts/seis-demo-contract.json",
  nativeContract: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json",
  learningContract: "content/development/seis-focus-mode-learning-contract.json",
  pluginManifest: "plugins/seis/.codex-plugin/plugin.json",
  pluginReadme: "plugins/seis/README.md",
  skill: "plugins/seis/skills/seis-focus-mode/SKILL.md",
  agent: "plugins/seis/skills/seis-focus-mode/agents/openai.yaml",
};

for (const file of Object.values(files)) {
  read(file);
}

for (const [file, token] of [
  [files.vision, "## Focus Mode"],
  [files.vision, "SEIS uses focus mode"],
  [files.vision, "The ecosystem itself is the product, and SEIS uses focus mode"],
  [files.agents, "focus mode"],
  [files.appHtml, "focus-mode-panel"],
  [files.appHtml, "focus-mode-toggle"],
  [files.appHtml, "focus-mode-signals"],
  [files.appJs, "focusStorageKey"],
  [files.appJs, "loadFocusMode"],
  [files.appJs, "setFocusMode"],
  [files.appJs, "seis_demo_focus_mode_changed"],
  [files.appJs, "is-focus-mode"],
  [files.appCss, ".focus-mode-panel"],
  [files.appCss, "body.is-focus-mode"],
  [files.webContract, "seis_demo_focus_mode_changed"],
  [files.nativeContract, "seis_demo_focus_mode_changed"],
  [files.learningContract, "seis-focus-mode-learning-contract"],
  [files.learningContract, "SEIS Focus Mode"],
  [files.learningContract, "agiOperatingBehavior"],
  [files.learningContract, "qualityGate"],
  [files.pluginManifest, "SEIS Focus Mode AGI operating lane"],
  [files.pluginManifest, "Use SEIS Focus Mode"],
  [files.pluginReadme, "skills/seis-focus-mode/SKILL.md"],
  [files.skill, "name: seis-focus-mode"],
  [files.skill, "AI/AGI learning contract"],
  [files.skill, "npm run check:seis-focus-mode"],
  [files.agent, "display_name: \"SEIS Focus Mode\""],
]) {
  requireIncludes(file, token);
}

const webContract = readJson(files.webContract);
const nativeContract = readJson(files.nativeContract);
const learningContract = readJson(files.learningContract);

if (webContract && nativeContract) {
  const webEvents = eventNames(webContract);
  const nativeEvents = eventNames(nativeContract);
  ensure(webEvents.includes("seis_demo_focus_mode_changed"), "web contract must expose focus telemetry event");
  ensure(nativeEvents.includes("seis_demo_focus_mode_changed"), "native contract must expose focus telemetry event");
  ensure(
    JSON.stringify(webEvents) === JSON.stringify(nativeEvents),
    "web and native demo contract event names must stay in parity"
  );
}

if (learningContract) {
  ensure(learningContract.status === "active", "focus learning contract must be active");
  ensure(
    learningContract.feature?.telemetryEvent === "seis_demo_focus_mode_changed",
    "focus learning contract must bind telemetry event"
  );
  ensure(
    Array.isArray(learningContract.agiOperatingBehavior) && learningContract.agiOperatingBehavior.length >= 5,
    "focus learning contract must define AGI operating behavior"
  );
}

if (failures.length > 0) {
  console.error("SEIS Focus Mode check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS Focus Mode check passed.");

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing file: ${relativePath}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const text = read(relativePath);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    failures.push(`invalid JSON: ${relativePath}`);
    return null;
  }
}

function requireIncludes(file, token) {
  const text = read(file);
  if (!text.includes(token)) {
    failures.push(`${file} must include ${token}`);
  }
}

function eventNames(contract) {
  return (contract.analytics_events || []).map((event) => event.name);
}

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}
