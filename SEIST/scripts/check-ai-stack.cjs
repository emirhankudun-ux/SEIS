#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { chooseAutoTool } = require("./ai-routing-policy.cjs");

const tools = [
  "codex",
  "claude",
  "gemini",
  "kimi",
  "aider",
  "interpreter",
  "ollama"
];

const missing = [];

function commandExists( command ) {
  const result = spawnSync("bash", [ "-lc", `command -v ${command}` ], { encoding: "utf8" });
  return result.status === 0 ? (result.stdout || "").trim() : "";
}

function checkOllamaHealth() {
  const result = spawnSync("bash", [ "-lc", "ollama list" ], { encoding: "utf8" });
  return result.status === 0;
}

console.log("AI stack health check");
console.log("");

for (const tool of tools) {
  const path = commandExists(tool);
  if (!path) {
    missing.push(tool);
    console.log(`[missing]   ${tool}`);
    continue;
  }
  console.log(`[installed] ${tool} -> ${path}`);
}

if (!missing.includes("ollama")) {
  const healthy = checkOllamaHealth();
  console.log(healthy ? "[running]   ollama server reachable" : "[warning]   ollama installed but server is not reachable");
}

const routingExpectations = [
  [ "quick repo patch", "aider" ],
  [ "browser research for docs", "gemini" ],
  [ "local offline llama draft", "ollama" ],
  [ "csv log analysis", "interpreter" ],
  [ "ux copy narrative pass", "claude" ],
  [ "translate this interface to turkish", "kimi" ],
  [ "release governance checklist", "codex" ]
];

console.log("");
console.log("AI auto-routing check");

const routingFailures = [];
for (const [intent, expected] of routingExpectations) {
  const actual = chooseAutoTool(intent);
  const status = actual === expected ? "ok" : "mismatch";
  console.log(`[${status}] ${intent} -> ${actual}`);
  if (actual !== expected) {
    routingFailures.push(`${intent} expected ${expected} but got ${actual}`);
  }
}

if (missing.length > 0 || routingFailures.length > 0) {
  console.error("");
  if (missing.length > 0) {
    console.error(`Missing tools: ${missing.join(", ")}`);
  }
  if (routingFailures.length > 0) {
    console.error(`Routing mismatches: ${routingFailures.join("; ")}`);
  }
  process.exit(1);
}

console.log("");
console.log("AI stack is ready.");
