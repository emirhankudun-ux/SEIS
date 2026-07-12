#!/usr/bin/env node
import Anthropic from "@anthropic-ai/sdk";

import { resolveRepoRoot, resolveWebRoot } from "../src/lib/repo.mjs";
import { runAgent, resolveModel, DEFAULT_MODEL, MODEL_ALIASES } from "../src/agent/loop.mjs";
import {
  conversationNexusStatus,
  readConversationHistory,
  saveConversationSession,
} from "../src/memory/conversation-store.mjs";

function usage() {
  console.log(`seis-agent — Claude-powered agent for the SEIS repository

Usage:
  node packages/seis-ai/bin/seis-agent.mjs [options] "<task>"

Options:
  --model <name>    ${Object.keys(MODEL_ALIASES).join(" | ")} or a full model id (default: ${DEFAULT_MODEL})
  --max-turns <n>   Tool-loop turn cap (default: 16)
  --write           Allow the agent to write files (off by default)
  --session <name>  Persist/resume a redacted local-private Conversation Nexus session
  --approve-session-upload <name>
                    Exact session-name confirmation required before stored history is sent to Anthropic
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
const options = {
  model: DEFAULT_MODEL,
  maxTurns: 16,
  allowWrite: false,
  quiet: false,
  session: null,
  approveSessionUpload: null,
};
const positional = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--help" || arg === "-h") { usage(); process.exit(0); }
  else if (arg === "--model") { options.model = resolveModel(args[++i]); }
  else if (arg === "--max-turns") { options.maxTurns = Number(args[++i]) || 16; }
  else if (arg === "--write") { options.allowWrite = true; }
  else if (arg === "--session") { options.session = args[++i]; }
  else if (arg === "--approve-session-upload") { options.approveSessionUpload = args[++i]; }
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
const conversationStateRoot = process.env.SEIS_CONVERSATION_STATE_DIR || undefined;
const client = new Anthropic();

let history = null;
if (options.session) {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(options.session)) {
    console.error("Session names must start alphanumeric and contain at most 64 letters, digits, _ or -.");
    process.exit(2);
  }
  try {
    const status = conversationNexusStatus(repoRoot, {
      stateRoot: conversationStateRoot,
      includeSessions: true,
    });
    if (!status.ok) {
      console.error("session: local-private store failed validation; refusing access");
      process.exit(2);
    }
    const existing = status.sessions.find(session => session.sessionName === options.session);
    if (existing && options.approveSessionUpload !== options.session) {
      console.error(
        `session: resuming "${options.session}" would send stored history to Anthropic; confirm with --approve-session-upload ${options.session}`
      );
      process.exit(2);
    }
    const stored = readConversationHistory(repoRoot, options.session, {
      stateRoot: conversationStateRoot,
      allowLegacy: true,
    });
    if (stored) {
      if (stored.source === "legacy-session") {
        console.error(
          `session: legacy session "${options.session}" requires explicit migration: npm run seis:conversations -- migrate --session ${options.session}`
        );
        process.exit(2);
      }
      if (stored.record.provider.id !== "anthropic") {
        console.error("session: cross-provider resume is disabled; use an approved local import workflow");
        process.exit(2);
      }
      history = stored.messages;
      console.error(
        `session: resumed "${options.session}" (${history.length} prior messages, source=${stored.source})`
      );
    } else {
      console.error(`session: new "${options.session}"`);
    }
  } catch {
    console.error(`session: "${options.session}" failed privacy or integrity validation; refusing overwrite`);
    process.exit(2);
  }
}

console.error(`seis-agent · model=${options.model} · write=${options.allowWrite ? "on" : "off"}`);

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
    onToolCall: (name) => console.error(`\n[tool] ${name}`),
  });

  if (options.session) {
    const saved = saveConversationSession(repoRoot, {
      stateRoot: conversationStateRoot,
      sessionName: options.session,
      providerId: "anthropic",
      model: options.model,
      liveProviderUsed: true,
      messages: result.messages,
    });
    console.error(
      `session: saved "${options.session}" (${saved.messageCount} messages, redactions=${saved.redactionReplacementCount})`
    );
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
    console.error(`API error ${error.status}: provider request failed`);
  } else {
    console.error(`seis-agent error: execution failed (${error?.name || "Error"})`);
  }
  process.exit(1);
}
