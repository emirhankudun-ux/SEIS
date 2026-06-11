#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { chooseAutoTool } = require("./ai-routing-policy.cjs");

const tools = [
  { id: "codex", optional: false },
  { id: "openai", optional: true, credential: "OPENAI_API_KEY" },
  { id: "claude", optional: true, credential: "ANTHROPIC_API_KEY" },
  { id: "gemini", optional: true, credential: "GEMINI_API_KEY" },
  { id: "qwen", optional: true },
  { id: "kimi", optional: true },
  { id: "opencode", optional: true },
  { id: "aider", optional: true },
  { id: "interpreter", optional: true },
  { id: "ollama", optional: true, runtimeCheck: checkOllamaHealth }
];

const missingRequired = [];
const warnings = [];

function commandExists(command) {
  const result = spawnSync("bash", ["-lc", `command -v ${command}`], { encoding: "utf8" });
  return result.status === 0 ? (result.stdout || "").trim() : "";
}

function checkOllamaHealth() {
  const result = spawnSync("bash", ["-lc", "ollama list"], { encoding: "utf8" });
  return result.status === 0;
}

function readyReason(tool) {
  if (tool.credential && !process.env[tool.credential]) {
    return `missing ${tool.credential}`;
  }
  if (tool.runtimeCheck && !tool.runtimeCheck()) {
    return "runtime check failed";
  }
  return "ready";
}

console.log("AI stack health check");
console.log("");

for (const tool of tools) {
  const commandPath = commandExists(tool.id);
  if (!commandPath) {
    if (!tool.optional) missingRequired.push(tool.id);
    console.log(`[missing]   ${tool.id}${tool.optional ? " (optional)" : ""}`);
    continue;
  }

  const reason = readyReason(tool);
  if (reason !== "ready") {
    warnings.push(`${tool.id}: ${reason}`);
    console.log(`[not-ready] ${tool.id} -> ${commandPath} (${reason})${tool.optional ? " (optional)" : ""}`);
    continue;
  }

  console.log(`[installed] ${tool.id} -> ${commandPath}`);
}

const routingExpectations = [
  ["quick repo patch", "aider"],
  ["browser research for docs", "gemini"],
  ["local offline llama draft", "ollama"],
  ["csv log analysis", "interpreter"],
  ["openai draft", "openai"],
  ["qwen cross-check", "qwen"],
  ["opencode terminal coding", "opencode"],
  ["ux copy narrative pass", "claude"],
  ["translate this interface to turkish", "kimi"],
  ["release governance checklist", "seis-agent"],
  ["production reasoning and policy check", "seis-agent"]
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

if (warnings.length > 0) {
  console.log("");
  console.log("AI stack warnings:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (missingRequired.length > 0 || routingFailures.length > 0) {
  console.error("");
  if (missingRequired.length > 0) {
    console.error(`Missing required tools: ${missingRequired.join(", ")}`);
  }
  if (routingFailures.length > 0) {
    console.error(`Routing mismatches: ${routingFailures.join("; ")}`);
  }
  process.exit(1);
}

console.log("");
console.log("AI stack check passed.");
