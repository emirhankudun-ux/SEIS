import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

import { resolveInside } from "../lib/repo.mjs";
import { runAllChecks, i18nStatus, seoAudit, contractCheck, drawingsCatalog, styleAudit, perfAudit } from "../lib/checks.mjs";

const MAX_READ_BYTES = 64 * 1024;
const MAX_GREP_HITS = 60;
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage", "releases", "polyglot"]);

/**
 * Tool definitions sent to the Messages API. `write_file` is appended only
 * when the caller opts in (`--write`).
 */
export function toolDefinitions({ allowWrite = false } = {}) {
  const tools = [
    {
      name: "list_files",
      description:
        "List files and directories at a path relative to the repository root. Directories end with '/'. Call this before reading to discover structure.",
      input_schema: {
        type: "object",
        properties: {
          dir: { type: "string", description: "Directory relative to repo root, e.g. apps/web" },
        },
        required: ["dir"],
      },
    },
    {
      name: "read_file",
      description:
        "Read a text file relative to the repository root. Large files are truncated to 64 KB — use offset to page through.",
      input_schema: {
        type: "object",
        properties: {
          file: { type: "string", description: "File path relative to repo root" },
          offset: { type: "integer", description: "Byte offset to start from (default 0)" },
        },
        required: ["file"],
      },
    },
    {
      name: "grep_repo",
      description:
        "Search file contents with a JavaScript regular expression. Returns matching lines with file:line locations. Scope with dir to keep results focused.",
      input_schema: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "JavaScript regex source, e.g. data-i18n=\"hero" },
          dir: { type: "string", description: "Directory to search, relative to repo root (default apps/web)" },
        },
        required: ["pattern"],
      },
    },
    {
      name: "git_diff",
      description:
        "Show uncommitted changes as a unified diff (git diff HEAD). Pass staged: true to see only staged changes. Read-only — always available without --write.",
      input_schema: {
        type: "object",
        properties: {
          staged: { type: "boolean", description: "Show only staged changes (default false = working tree)" },
        },
      },
    },
    {
      name: "run_checks",
      description:
        "Run the SEIS audit suite against apps/web. scope: 'i18n' (translation parity), 'seo', 'contract' (HTML/JS selector contract), 'drawings' (media integrity), 'style' (CSS custom props + dead classes), 'perf' (file size budgets + render-blocking scripts), or 'all'. Always run 'contract' and 'i18n' after editing index.html, script.js or translations.json; run 'style' after editing style.css.",
      input_schema: {
        type: "object",
        properties: {
          scope: { type: "string", enum: ["all", "i18n", "seo", "contract", "drawings", "style", "perf"] },
        },
        required: ["scope"],
      },
    },
  ];

  if (allowWrite) {
    tools.push(
      {
        name: "edit_file",
        description:
          "Replace one exact string in an existing file. old_string must occur exactly once — include surrounding lines to disambiguate. Prefer this over write_file for small changes; re-run run_checks afterwards.",
        input_schema: {
          type: "object",
          properties: {
            file: { type: "string", description: "File path relative to repo root" },
            old_string: { type: "string", description: "Exact text to replace (must be unique in the file)" },
            new_string: { type: "string", description: "Replacement text" },
          },
          required: ["file", "old_string", "new_string"],
        },
      },
      {
        name: "write_file",
        description:
          "Write a text file relative to the repository root (creates parent directories). Use for NEW files or full rewrites; for small changes prefer edit_file. Re-run run_checks afterwards.",
        input_schema: {
          type: "object",
          properties: {
            file: { type: "string", description: "File path relative to repo root" },
            content: { type: "string", description: "Full new file content" },
          },
          required: ["file", "content"],
        },
      }
    );
  }

  return tools;
}

/** Execute one tool call. Always returns a string (JSON or plain text). */
export function executeTool(name, input, { repoRoot, webRoot, allowWrite = false }) {
  switch (name) {
    case "list_files": {
      const abs = resolveInside(repoRoot, input.dir ?? ".");
      const entries = readdirSync(abs)
        .filter((e) => !SKIP_DIRS.has(e))
        .map((e) => (statSync(path.join(abs, e)).isDirectory() ? `${e}/` : e))
        .sort();
      return entries.join("\n") || "(empty)";
    }
    case "read_file": {
      const abs = resolveInside(repoRoot, input.file);
      const offset = Math.max(0, input.offset ?? 0);
      const buf = readFileSync(abs);
      const slice = buf.subarray(offset, offset + MAX_READ_BYTES);
      const truncated = offset + slice.length < buf.length;
      return (
        slice.toString("utf8") +
        (truncated ? `\n[... truncated at byte ${offset + slice.length} of ${buf.length}; call again with offset=${offset + slice.length}]` : "")
      );
    }
    case "grep_repo": {
      const dir = resolveInside(repoRoot, input.dir ?? "apps/web");
      const re = new RegExp(input.pattern);
      const hits = [];
      grepWalk(dir, re, repoRoot, hits);
      if (!hits.length) return "(no matches)";
      const shown = hits.slice(0, MAX_GREP_HITS);
      const suffix = hits.length > shown.length ? `\n[... ${hits.length - shown.length} more matches]` : "";
      return shown.join("\n") + suffix;
    }
    case "git_diff": {
      const args = input.staged === true ? ["diff", "--staged"] : ["diff", "HEAD"];
      let out;
      try {
        out = execFileSync("git", args, { cwd: repoRoot, maxBuffer: 512 * 1024, encoding: "utf8" });
      } catch (err) {
        out = (err.stdout ?? "") || err.message;
      }
      if (!out.trim()) return "(no changes)";
      if (out.length > MAX_READ_BYTES) {
        return out.slice(0, MAX_READ_BYTES) + `\n[... truncated at ${MAX_READ_BYTES} bytes of ${out.length}]`;
      }
      return out;
    }
    case "run_checks": {
      const result =
        input.scope === "i18n" ? i18nStatus(webRoot)
        : input.scope === "seo" ? seoAudit(webRoot)
        : input.scope === "contract" ? contractCheck(webRoot)
        : input.scope === "drawings" ? drawingsCatalog(webRoot)
        : input.scope === "style" ? styleAudit(webRoot)
        : input.scope === "perf" ? perfAudit(webRoot)
        : runAllChecks(webRoot);
      // Drawing file lists are large and rarely needed in-context.
      if (result.files) result.files = `(${result.files.length} files, omitted)`;
      if (result.drawings?.files) result.drawings.files = `(${result.drawings.files.length} files, omitted)`;
      return JSON.stringify(result, null, 2);
    }
    case "edit_file": {
      if (!allowWrite) {
        throw new Error("edit_file is disabled — re-run the agent with --write to allow file writes");
      }
      const abs = resolveInside(repoRoot, input.file);
      const content = readFileSync(abs, "utf8");
      const count = content.split(input.old_string).length - 1;
      if (count === 0) {
        throw new Error(`old_string not found in ${input.file}`);
      }
      if (count > 1) {
        throw new Error(`old_string occurs ${count} times in ${input.file} — include more surrounding context to make it unique`);
      }
      // Function replacement avoids `$&`-style pattern expansion in new_string.
      writeFileSync(abs, content.replace(input.old_string, () => input.new_string));
      return `Edited ${input.file}: replaced ${Buffer.byteLength(input.old_string)} bytes with ${Buffer.byteLength(input.new_string)} bytes`;
    }
    case "write_file": {
      if (!allowWrite) {
        throw new Error("write_file is disabled — re-run the agent with --write to allow file writes");
      }
      const abs = resolveInside(repoRoot, input.file);
      mkdirSync(path.dirname(abs), { recursive: true });
      writeFileSync(abs, input.content);
      return `Wrote ${Buffer.byteLength(input.content)} bytes to ${input.file}`;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function grepWalk(dir, re, repoRoot, hits) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry) || entry.startsWith(".")) continue;
    const abs = path.join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) {
      grepWalk(abs, re, repoRoot, hits);
    } else if (st.size < 1024 * 1024 && /\.(m?js|cjs|ts|json|html?|css|md|txt|xml|ya?ml|svg)$/i.test(entry)) {
      const lines = readFileSync(abs, "utf8").split("\n");
      for (let i = 0; i < lines.length; i += 1) {
        if (re.test(lines[i])) {
          const rel = path.relative(repoRoot, abs).split(path.sep).join("/");
          hits.push(`${rel}:${i + 1}: ${lines[i].trim().slice(0, 200)}`);
          if (hits.length > MAX_GREP_HITS * 3) return;
        }
      }
    }
  }
}
