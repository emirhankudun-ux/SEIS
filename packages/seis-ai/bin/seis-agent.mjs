#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

import { resolveRepoRoot, resolveWebRoot } from "../src/lib/repo.mjs";
import { runAgent, resolveModel, DEFAULT_MODEL, MODEL_ALIASES } from "../src/agent/loop.mjs";

function usage() {
  console.log(`seis-agent — Claude-powered agent for the SEIS repository

Usage:
  node packages/seis-ai/bin/seis-agent.mjs [options] "<task>"

Options:
  --model <name>    ${Object.keys(MODEL_ALIASES).join(" | ")} or a full model id (default: ${DEFAULT_MODEL})
  --max-turns <n>   Tool-loop turn cap (default: 16)
  --write           Allow the agent to write files (off by default)
  --session <name>  Persist/resume conversation in .seis/sessions/<name>.json
  --quiet           Suppress live streaming output; print only the final summary
  --help            Show this help

Environment:
  ANTHROPIC_API_KEY   Required. Create one at https://platform.claude.com/

Examples:
  node packages/seis-ai/bin/seis-agent.mjs "Run all checks and explain any failures"
  node packages/seis-ai/bin/seis-agent.mjs --model sonnet "Review the French translations for tone"
  node packages/seis-ai/bin/seis-agent.mjs --write "Add an i18n key fm.phone with proper values in all 5 locales"
  node packages/seis-ai/bin/seis-agent.mjs --session audit "Run all checks"
  node packages/seis-ai/bin/seis-agent.mjs --session audit "Now fix the failures you found"`);
}

const args = process.argv.slice(2);
const options = { model: DEFAULT_MODEL, maxTurns: 16, allowWrite: false, quiet: false, session: null };
const positional = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--help" || arg === "-h") { usage(); process.exit(0); }
  else if (arg === "--model") { options.model = resolveModel(args[++i]); }
  else if (arg === "--max-turns") { options.maxTurns = Number(args[++i]) || 16; }
  else if (arg === "--write") { options.allowWrite = true; }
  else if (arg === "--session") { options.session = args[++i]; }
  else if (arg === "--quiet" || arg === "-q") { options.quiet = true; }
  else { positional.push(arg); }
}

const task = positional.join(" ").trim();
if (!task) {
  usage();
  process.exit(2);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. Export it and retry:");
  console.error('  export ANTHROPIC_API_KEY="sk-ant-..."');
  process.exit(2);
}

const repoRoot = resolveRepoRoot();
const webRoot = resolveWebRoot(repoRoot);
const client = new Anthropic();

let history = null;
let sessionFile = null;
if (options.session) {
  if (!/^[\w-]+$/.test(options.session)) {
    console.error("Session names may only contain letters, digits, _ and -.");
    process.exit(2);
  }
  sessionFile = path.join(repoRoot, ".seis", "sessions", `${options.session}.json`);
  if (existsSync(sessionFile)) {
    try {
      history = JSON.parse(readFileSync(sessionFile, "utf8")).messages;
      console.error(`session: resumed "${options.session}" (${history.length} prior messages)`);
    } catch {
      console.error(`session: ${sessionFile} is corrupt — starting fresh`);
    }
  } else {
    console.error(`session: new "${options.session}"`);
  }
}

console.error(`seis-agent · model=${options.model} · write=${options.allowWrite ? "on" : "off"} · root=${repoRoot}`);

try {
  const result = await runAgent({
    client,
    task,
    repoRoot,
    webRoot,
    model: options.model,
    maxTurns: options.maxTurns,
    allowWrite: options.allowWrite,
    history,
    onText: options.quiet ? () => {} : (delta) => process.stdout.write(delta),
    onToolCall: (name, input) =>
      console.error(`\n[tool] ${name} ${JSON.stringify(input).slice(0, 160)}`),
  });

  if (sessionFile) {
    mkdirSync(path.dirname(sessionFile), { recursive: true });
    writeFileSync(
      sessionFile,
      JSON.stringify(
        { updatedAt: new Date().toISOString(), model: options.model, messages: result.messages },
        null,
        2
      )
    );
    console.error(`session: saved "${options.session}" (${result.messages.length} messages)`);
  }

  if (options.quiet) {
    console.log(result.finalText);
  } else {
    process.stdout.write("\n");
  }
  console.error(`\n— done · turns=${result.turns} · stop=${result.stopReason}`);
  if (result.stopReason === "max_turns") {
    console.error("Turn cap reached — re-run with --max-turns for longer tasks.");
    process.exit(3);
  }
  if (result.stopReason === "refusal") {
    process.exit(4);
  }
} catch (error) {
  if (error instanceof Anthropic.AuthenticationError) {
    console.error("Authentication failed — check ANTHROPIC_API_KEY.");
  } else if (error instanceof Anthropic.RateLimitError) {
    console.error("Rate limited — wait a moment and retry.");
  } else if (error instanceof Anthropic.APIError) {
    console.error(`API error ${error.status}: ${error.message}`);
  } else {
    console.error(`seis-agent error: ${error.message}`);
  }
  process.exit(1);
}
