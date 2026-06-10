import { toolDefinitions, executeTool } from "./tools.mjs";

export const MODEL_ALIASES = {
  fable: "claude-fable-5",
  opus: "claude-opus-4-8",
  sonnet: "claude-sonnet-4-6",
  haiku: "claude-haiku-4-5",
};

export const DEFAULT_MODEL = MODEL_ALIASES.opus;

export function resolveModel(name) {
  if (!name) return DEFAULT_MODEL;
  return MODEL_ALIASES[name.toLowerCase()] ?? name;
}

const SYSTEM_PROMPT = `You are the SEIS repository agent for Emirhan Kudun's creative-engineering workspace,
operating under the SEIS Supreme constitution (docs/governance/seis-supreme-v12-constitution.md):
read -> analyze -> plan -> implement -> test -> verify -> document; prefer architecture over
shortcuts, maintainability over speed, clarity over complexity; never claim a tool you did not use.

The repository's deliverable is the portfolio site in apps/web: a static, dependency-free
HTML/CSS/vanilla-JS site with a 5-locale i18n system (tr/en/fr/it/de) driven by
translations.json and data-i18n attributes. script.js queries the DOM by literal
#id/.class selectors, so markup and script form a strict contract.

Working rules:
- Investigate with list_files / read_file / grep_repo before concluding anything.
- Prefer edit_file (exact-string replacement) for small changes; use write_file
  only for new files or full rewrites.
- After editing index.html, script.js or translations.json, ALWAYS validate with
  run_checks (scope "contract" and "i18n" at minimum); after style.css use
  scope "style". Report the result.
- Translation edits must cover all five locales — never add a key to only one.
- Keep edits minimal and consistent with the existing code style; the site must keep
  working without a build step.
- Finish with a short summary: what you inspected, what you changed (if anything),
  and the final check status.`;

/**
 * Run the agentic tool-use loop until the model stops calling tools.
 * `client` is an Anthropic SDK instance (injectable for tests).
 * `history` (optional) is a prior `messages` array from an earlier run —
 * pass it to resume a session; the new task is appended as a user turn.
 * Returns { turns, finalText, stopReason, messages }.
 */
export async function runAgent({
  client,
  task,
  repoRoot,
  webRoot,
  model = DEFAULT_MODEL,
  maxTurns = 16,
  allowWrite = false,
  history = null,
  onText = () => {},
  onToolCall = () => {},
}) {
  const tools = toolDefinitions({ allowWrite });
  const messages = Array.isArray(history) && history.length
    ? [...history, { role: "user", content: task }]
    : [{ role: "user", content: task }];
  let turns = 0;
  let finalText = "";

  for (;;) {
    turns += 1;
    if (turns > maxTurns) {
      return { turns: turns - 1, finalText, stopReason: "max_turns", messages };
    }

    const stream = client.messages.stream({
      model,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });
    stream.on?.("text", onText);
    const message = await stream.finalMessage();

    finalText = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    if (message.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: message.content });
      continue;
    }
    if (message.stop_reason === "refusal") {
      messages.push({ role: "assistant", content: message.content });
      return { turns, finalText, stopReason: "refusal", messages };
    }
    if (message.stop_reason !== "tool_use") {
      messages.push({ role: "assistant", content: message.content });
      return { turns, finalText, stopReason: message.stop_reason, messages };
    }

    const toolUses = message.content.filter((b) => b.type === "tool_use");
    messages.push({ role: "assistant", content: message.content });

    const results = [];
    for (const call of toolUses) {
      onToolCall(call.name, call.input);
      let resultText;
      let isError = false;
      try {
        resultText = executeTool(call.name, call.input, { repoRoot, webRoot, allowWrite });
      } catch (error) {
        resultText = `Error: ${error.message}`;
        isError = true;
      }
      results.push({
        type: "tool_result",
        tool_use_id: call.id,
        content: resultText,
        ...(isError ? { is_error: true } : {}),
      });
    }
    messages.push({ role: "user", content: results });
  }
}
