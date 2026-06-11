import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { toolDefinitions, executeTool } from "../src/agent/tools.mjs";
import { runAgent, resolveModel, MODEL_ALIASES, DEFAULT_MODEL } from "../src/agent/loop.mjs";

/* ------------------------------------------------------------------ */
/* Fixture                                                            */
/* ------------------------------------------------------------------ */

let repoRoot;

function makeRepo(files = {}) {
  repoRoot = path.join(tmpdir(), `seis-agent-test-${process.pid}-${Date.now()}`);
  mkdirSync(repoRoot, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    const abs = path.join(repoRoot, name);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
  }
  return repoRoot;
}

afterEach(() => {
  if (repoRoot) rmSync(repoRoot, { recursive: true, force: true });
  repoRoot = undefined;
});

/* ------------------------------------------------------------------ */
/* Model aliases                                                      */
/* ------------------------------------------------------------------ */

describe("resolveModel", () => {
  it("maps aliases case-insensitively", () => {
    assert.equal(resolveModel("opus"), MODEL_ALIASES.opus);
    assert.equal(resolveModel("SONNET"), MODEL_ALIASES.sonnet);
  });

  it("passes through full model ids", () => {
    assert.equal(resolveModel("claude-opus-4-8"), "claude-opus-4-8");
  });

  it("defaults when empty", () => {
    assert.equal(resolveModel(undefined), DEFAULT_MODEL);
  });
});

/* ------------------------------------------------------------------ */
/* toolDefinitions                                                    */
/* ------------------------------------------------------------------ */

describe("toolDefinitions", () => {
  it("excludes write tools by default", () => {
    const names = toolDefinitions().map((t) => t.name);
    assert.ok(names.includes("read_file"));
    assert.ok(names.includes("git_diff"));
    assert.ok(names.includes("git_log"));
    assert.ok(!names.includes("write_file"));
    assert.ok(!names.includes("edit_file"));
  });

  it("includes edit_file and write_file with allowWrite", () => {
    const names = toolDefinitions({ allowWrite: true }).map((t) => t.name);
    assert.ok(names.includes("write_file"));
    assert.ok(names.includes("edit_file"));
    assert.ok(names.includes("git_diff"));
    assert.ok(names.includes("git_log"));
  });
});

/* ------------------------------------------------------------------ */
/* executeTool                                                        */
/* ------------------------------------------------------------------ */

describe("executeTool", () => {
  beforeEach(() =>
    makeRepo({
      "apps/web/index.html": "<html><body id=\"app\">hello world</body></html>",
      "apps/web/script.js": "var app = document.querySelector(\"#app\");",
      "notes.md": "alpha\nbeta needle gamma\ndelta",
    })
  );

  function ctx(extra = {}) {
    return { repoRoot, webRoot: path.join(repoRoot, "apps", "web"), ...extra };
  }

  it("list_files lists entries with directory suffix", () => {
    const out = executeTool("list_files", { dir: "." }, ctx());
    assert.ok(out.includes("apps/"));
    assert.ok(out.includes("notes.md"));
  });

  it("list_files skips node_modules", () => {
    mkdirSync(path.join(repoRoot, "node_modules", "junk"), { recursive: true });
    const out = executeTool("list_files", { dir: "." }, ctx());
    assert.ok(!out.includes("node_modules"));
  });

  it("read_file returns file content", () => {
    const out = executeTool("read_file", { file: "notes.md" }, ctx());
    assert.ok(out.includes("beta needle gamma"));
  });

  it("read_file refuses path traversal", () => {
    assert.throws(
      () => executeTool("read_file", { file: "../../../etc/passwd" }, ctx()),
      /escapes repository root/
    );
  });

  it("grep_repo finds matches with file:line locations", () => {
    const out = executeTool("grep_repo", { pattern: "needle", dir: "." }, ctx());
    assert.ok(out.includes("notes.md:2"));
  });

  it("grep_repo reports no matches", () => {
    const out = executeTool("grep_repo", { pattern: "zzz-nothing", dir: "." }, ctx());
    assert.equal(out, "(no matches)");
  });

  it("write_file is blocked without allowWrite", () => {
    assert.throws(
      () => executeTool("write_file", { file: "new.txt", content: "x" }, ctx()),
      /--write/
    );
  });

  it("write_file writes with allowWrite and creates directories", () => {
    const out = executeTool(
      "write_file",
      { file: "deep/dir/new.txt", content: "hello" },
      ctx({ allowWrite: true })
    );
    assert.ok(out.includes("5 bytes"));
    assert.equal(readFileSync(path.join(repoRoot, "deep/dir/new.txt"), "utf8"), "hello");
  });

  it("write_file refuses path traversal even with allowWrite", () => {
    assert.throws(
      () => executeTool("write_file", { file: "../outside.txt", content: "x" }, ctx({ allowWrite: true })),
      /escapes repository root/
    );
    assert.ok(!existsSync(path.join(path.dirname(repoRoot), "outside.txt")));
  });

  it("edit_file replaces a unique string", () => {
    executeTool(
      "edit_file",
      { file: "notes.md", old_string: "beta needle gamma", new_string: "beta REPLACED gamma" },
      ctx({ allowWrite: true })
    );
    const out = readFileSync(path.join(repoRoot, "notes.md"), "utf8");
    assert.ok(out.includes("beta REPLACED gamma"));
    assert.ok(!out.includes("needle"));
  });

  it("edit_file does not expand $-patterns in new_string", () => {
    executeTool(
      "edit_file",
      { file: "notes.md", old_string: "needle", new_string: "$&$'x$1" },
      ctx({ allowWrite: true })
    );
    const out = readFileSync(path.join(repoRoot, "notes.md"), "utf8");
    assert.ok(out.includes("beta $&$'x$1 gamma"));
  });

  it("edit_file rejects a missing old_string", () => {
    assert.throws(
      () => executeTool("edit_file", { file: "notes.md", old_string: "zzz", new_string: "x" }, ctx({ allowWrite: true })),
      /not found/
    );
  });

  it("edit_file rejects an ambiguous old_string", () => {
    writeFileSync(path.join(repoRoot, "dup.txt"), "same\nsame\n");
    assert.throws(
      () => executeTool("edit_file", { file: "dup.txt", old_string: "same", new_string: "x" }, ctx({ allowWrite: true })),
      /occurs 2 times/
    );
  });

  it("edit_file is blocked without allowWrite", () => {
    assert.throws(
      () => executeTool("edit_file", { file: "notes.md", old_string: "alpha", new_string: "x" }, ctx()),
      /--write/
    );
  });

  it("run_checks accepts the style scope", () => {
    writeFileSync(path.join(repoRoot, "apps/web/style.css"), ":root { --c: red; } .x { color: var(--c); }");
    const out = executeTool("run_checks", { scope: "style" }, ctx());
    const r = JSON.parse(out);
    assert.equal(r.ok, true);
  });

  it("run_checks accepts the perf scope", () => {
    const out = executeTool("run_checks", { scope: "perf" }, ctx());
    const r = JSON.parse(out);
    assert.ok(typeof r.ok === "boolean");
    assert.ok(typeof r.totalBytes === "number");
  });

  it("git_diff returns a string result", () => {
    const out = executeTool("git_diff", {}, { repoRoot: process.cwd(), webRoot: "" });
    assert.ok(typeof out === "string");
  });

  it("git_diff staged flag is accepted", () => {
    const out = executeTool("git_diff", { staged: true }, { repoRoot: process.cwd(), webRoot: "" });
    assert.ok(typeof out === "string");
  });

  it("git_diff returns (no changes) or a diff for a non-git tmpdir", () => {
    const out = executeTool("git_diff", {}, ctx());
    assert.ok(typeof out === "string");
  });

  it("git_log returns a string result from the real repo", () => {
    const out = executeTool("git_log", {}, { repoRoot: process.cwd(), webRoot: "" });
    assert.ok(typeof out === "string");
  });

  it("git_log respects the count parameter", () => {
    const out = executeTool("git_log", { count: 3 }, { repoRoot: process.cwd(), webRoot: "" });
    assert.ok(typeof out === "string");
    const lines = out.trim().split("\n").filter(Boolean);
    assert.ok(lines.length <= 3);
  });

  it("run_checks accepts the a11y scope", () => {
    const out = executeTool("run_checks", { scope: "a11y" }, ctx());
    const r = JSON.parse(out);
    assert.ok(typeof r.ok === "boolean");
    assert.ok(Array.isArray(r.imgsWithoutAlt));
  });

  it("run_checks accepts the security scope", () => {
    const out = executeTool("run_checks", { scope: "security" }, ctx());
    const r = JSON.parse(out);
    assert.ok(typeof r.ok === "boolean");
    assert.ok(Array.isArray(r.unsafeBlankLinks));
    assert.ok(Array.isArray(r.jsHrefs));
    assert.ok(Array.isArray(r.insecureResources));
  });

  it("throws on unknown tool", () => {
    assert.throws(() => executeTool("nope", {}, ctx()), /Unknown tool/);
  });
});

/* ------------------------------------------------------------------ */
/* runAgent loop (mock client)                                        */
/* ------------------------------------------------------------------ */

/**
 * Mock of the Anthropic SDK surface the loop touches:
 * client.messages.stream(params) -> { on(), finalMessage() }.
 * Returns scripted messages in order and records every request params.
 */
function mockClient(scripted) {
  const requests = [];
  let i = 0;
  return {
    requests,
    messages: {
      stream(params) {
        // Snapshot the messages array: the real SDK serialises at call time,
        // and the loop keeps mutating the same array afterwards.
        requests.push({ ...params, messages: [...params.messages] });
        const message = scripted[Math.min(i, scripted.length - 1)];
        i += 1;
        return {
          on() {},
          async finalMessage() {
            return message;
          },
        };
      },
    },
  };
}

const textMsg = (text, stop = "end_turn") => ({
  stop_reason: stop,
  content: [{ type: "text", text }],
});

describe("runAgent", () => {
  beforeEach(() =>
    makeRepo({
      "apps/web/index.html": "<html></html>",
      "readme.txt": "agent fixture",
    })
  );

  function opts(client, extra = {}) {
    return {
      client,
      task: "test task",
      repoRoot,
      webRoot: path.join(repoRoot, "apps", "web"),
      ...extra,
    };
  }

  it("returns final text on immediate end_turn", async () => {
    const client = mockClient([textMsg("done.")]);
    const result = await runAgent(opts(client));
    assert.equal(result.finalText, "done.");
    assert.equal(result.turns, 1);
    assert.equal(result.stopReason, "end_turn");
  });

  it("executes a tool call and feeds the result back", async () => {
    const client = mockClient([
      {
        stop_reason: "tool_use",
        content: [
          { type: "text", text: "reading..." },
          { type: "tool_use", id: "tu_1", name: "read_file", input: { file: "readme.txt" } },
        ],
      },
      textMsg("file says: agent fixture"),
    ]);
    const calls = [];
    const result = await runAgent(opts(client, { onToolCall: (n, i) => calls.push([n, i]) }));

    assert.equal(result.turns, 2);
    assert.equal(result.stopReason, "end_turn");
    assert.deepEqual(calls, [["read_file", { file: "readme.txt" }]]);

    // Second request must contain the tool_result keyed to the tool_use id.
    const second = client.requests[1];
    const toolResultMsg = second.messages.at(-1);
    assert.equal(toolResultMsg.role, "user");
    assert.equal(toolResultMsg.content[0].type, "tool_result");
    assert.equal(toolResultMsg.content[0].tool_use_id, "tu_1");
    assert.ok(toolResultMsg.content[0].content.includes("agent fixture"));
  });

  it("marks failed tool calls with is_error and keeps looping", async () => {
    const client = mockClient([
      {
        stop_reason: "tool_use",
        content: [{ type: "tool_use", id: "tu_err", name: "read_file", input: { file: "../escape" } }],
      },
      textMsg("recovered"),
    ]);
    const result = await runAgent(opts(client));
    assert.equal(result.stopReason, "end_turn");
    const toolResult = client.requests[1].messages.at(-1).content[0];
    assert.equal(toolResult.is_error, true);
    assert.ok(toolResult.content.includes("escapes repository root"));
  });

  it("stops at maxTurns", async () => {
    // Model never stops calling tools.
    const looping = {
      stop_reason: "tool_use",
      content: [{ type: "tool_use", id: "tu_x", name: "list_files", input: { dir: "." } }],
    };
    const client = mockClient([looping]);
    const result = await runAgent(opts(client, { maxTurns: 3 }));
    assert.equal(result.stopReason, "max_turns");
    assert.equal(result.turns, 3);
  });

  it("returns refusal stop reason without executing tools", async () => {
    const client = mockClient([textMsg("cannot help with that", "refusal")]);
    const result = await runAgent(opts(client));
    assert.equal(result.stopReason, "refusal");
  });

  it("continues after pause_turn without adding a user message", async () => {
    const client = mockClient([
      { stop_reason: "pause_turn", content: [{ type: "text", text: "thinking..." }] },
      textMsg("resumed and done"),
    ]);
    const result = await runAgent(opts(client));
    assert.equal(result.stopReason, "end_turn");
    assert.equal(result.finalText, "resumed and done");
    // Second request ends with the assistant message — no synthetic user turn.
    assert.equal(client.requests[1].messages.at(-1).role, "assistant");
  });

  it("streams text deltas through onText", async () => {
    // The mock's on() is a no-op, so just verify the loop tolerates a handler.
    const client = mockClient([textMsg("ok")]);
    const result = await runAgent(opts(client, { onText: () => {} }));
    assert.equal(result.finalText, "ok");
  });

  it("resumes from history and returns the full message log", async () => {
    const history = [
      { role: "user", content: "earlier task" },
      { role: "assistant", content: [{ type: "text", text: "earlier answer" }] },
    ];
    const client = mockClient([textMsg("follow-up answer")]);
    const result = await runAgent(opts(client, { history }));

    // Request must contain history + the new task appended as a user turn.
    const sent = client.requests[0].messages;
    assert.equal(sent.length, 3);
    assert.equal(sent[0].content, "earlier task");
    assert.equal(sent[2].content, "test task");

    // Returned log ends with the new assistant reply, ready to persist.
    assert.equal(result.messages.length, 4);
    assert.equal(result.messages.at(-1).role, "assistant");
    assert.equal(result.messages.at(-1).content[0].text, "follow-up answer");
    // Original history array must not be mutated.
    assert.equal(history.length, 2);
  });

  it("includes the final assistant message in the log without history too", async () => {
    const client = mockClient([textMsg("done.")]);
    const result = await runAgent(opts(client));
    assert.equal(result.messages.length, 2);
    assert.equal(result.messages[0].role, "user");
    assert.equal(result.messages[1].role, "assistant");
  });

  it("excludes write_file from tools sent to the API unless allowWrite", async () => {
    const client = mockClient([textMsg("ok")]);
    await runAgent(opts(client));
    const names = client.requests[0].tools.map((t) => t.name);
    assert.ok(!names.includes("write_file"));

    const client2 = mockClient([textMsg("ok")]);
    await runAgent(opts(client2, { allowWrite: true }));
    const names2 = client2.requests[0].tools.map((t) => t.name);
    assert.ok(names2.includes("write_file"));
  });
});
