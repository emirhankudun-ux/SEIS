import {
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

import {
  AI_CORE_FRONTIER_TRAINING_STATUS_TOOL,
  AI_CORE_MODEL_SCALING_STATUS_TOOL,
  AI_CORE_PROVIDER_STATUS_TOOL,
  AI_CORE_VERSION_PROMOTION_TOOL,
  AI_CORE_VERSION_STATUS_TOOL,
  PERSONAL_PLUGIN_LANE_TOOLS,
  SUBAGENT_DRY_RUN_TASK_TOOL,
  SUBAGENT_OPERATING_MODEL_TOOL,
  SUBAGENT_REVIEW_LEDGER_TOOL,
  aiCoreFrontierTrainingStatus,
  aiCoreModelScalingStatus,
  aiCoreProviderStatus,
  aiCoreVersionPromotionDryRun,
  aiCoreVersionStatus,
  personalPluginLanePlan,
  personalPluginLaneStatus,
  pluginIntegrationStatus,
  resolvePersonalPluginLaneTool,
  subagentDryRunTaskDecision,
  subagentOperatingModelStatus,
  subagentReviewLedgerStatus,
} from "../lib/plugin-integration.mjs";
import { buildReadOnlyRouteDecision, READ_ONLY_ROUTER_TOOL } from "../model/read-only-router.mjs";
import {
  TRAINING_EVIDENCE_STATUS_TOOL,
  trainingEvidenceStatus,
} from "../model/training-evidence.mjs";
import { resolveInside } from "../lib/repo.mjs";
import { runAllChecks, i18nStatus, seoAudit, contractCheck, drawingsCatalog, styleAudit, perfAudit, a11yAudit, securityAudit } from "../lib/checks.mjs";

const MAX_READ_BYTES = 64 * 1024;
const MAX_GREP_HITS = 60;
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".seis",
  ".secrets",
  "secrets",
  "dist",
  "build",
  "coverage",
  "releases",
  "polyglot",
]);
const PRIVATE_PATH_SEGMENTS = new Set([".git", ".seis", ".secrets", "secrets", ".ssh", ".aws"]);

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
        "Search file contents for bounded literal text. Returns matching lines with file:line locations. Scope with dir to keep results focused.",
      input_schema: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Literal text up to 200 characters, e.g. data-i18n=\"hero" },
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
      name: "git_log",
      description:
        "Show recent git commit history (git log --oneline). Use to understand what changed recently before starting a task.",
      input_schema: {
        type: "object",
        properties: {
          count: { type: "integer", description: "Number of commits to show (default 10, max 40)" },
        },
      },
    },
    {
      name: "seis_plugin_integration",
      description:
        "Read the canonical SEIS-Agent plugin integration manifest. Use for SEIS plugin, MCP, cloud/code/design/data lane, helper plugin, or SEIS-Agent routing work before making integration claims.",
      input_schema: {
        type: "object",
        properties: {
          includeFullManifest: { type: "boolean", description: "Return the full manifest in addition to the compact status summary." },
        },
      },
    },
    {
      name: AI_CORE_PROVIDER_STATUS_TOOL,
      description:
        "Read the SEIS AI Core provider registry for zero-key Local Demo, supervised Codex, optional server-only cloud providers, local-provider candidates, public provider states, and security invariants. Read-only; performs no live provider calls, credential validation, network checks, SSH, deployment, or GitHub mutation.",
      input_schema: {
        type: "object",
        properties: {
          includeFullRegistry: { type: "boolean", description: "Return the full machine-readable provider registry." },
        },
      },
    },
    {
      name: READ_ONLY_ROUTER_TOOL,
      description:
        "Evaluate a provider-neutral SEIS AI Core route from metadata only. Read-only; rejects prompts, credentials, private vault contents, and secret-like material, and never calls providers or executes agents.",
      input_schema: {
        type: "object",
        properties: {
          taskType: { type: "string", description: "Metadata-only task type." },
          capability: { type: "string", description: "Metadata-only capability label." },
          privacyMode: { type: "string", enum: ["local-only", "standard", "review-gated"] },
          localOnly: { type: "boolean", description: "Force the local-only boundary." },
          costPreference: { type: "string" },
          speedPreference: { type: "string" },
          contextSizeRequired: { type: "number" },
          toolSupportRequired: { type: "boolean" },
          fallbackPolicy: { type: "string" },
        },
      },
    },
    {
      name: AI_CORE_MODEL_SCALING_STATUS_TOOL,
      description:
        "Read content/development/seis-model-scaling-hardware-profile.json for the planned 20B target on 16GB+ RAM, memory budget contract, 16GB+/24GB+/32GB+/64GB+ compatibility profiles, benchmark manifest contract, quantization lanes, local runtime candidates, future 70B scale ladder, 150B frontier research lane, compatibility gates, and forbidden model-ownership claims. Read-only; performs no training, inference, download, benchmark, provider call, SSH, deployment, or credential access.",
      input_schema: {
        type: "object",
        properties: {
          includeFullProfile: { type: "boolean", description: "Return the full machine-readable model scaling profile." },
        },
      },
    },
    {
      name: AI_CORE_FRONTIER_TRAINING_STATUS_TOOL,
      description:
        "Read the fail-closed SEIS 20B/70B/150B/300B+/512B frontier training launch plan, official research references, evidence gaps, council coverage, and approval boundaries. Read-only; never downloads models or datasets, submits jobs, trains, benchmarks, calls providers, accesses credentials, provisions compute, executes SSH, deploys, publishes checkpoints, mutates GitHub, or proves AGI.",
      input_schema: {
        type: "object",
        properties: {
          includeFullPlan: { type: "boolean", description: "Return the full machine-readable launch plan." },
        },
      },
    },
    {
      name: TRAINING_EVIDENCE_STATUS_TOOL,
      description:
        "Validate the SEIS model training evidence schemas, immutable synthetic fixture chain, built-in Ed25519 approval verifier, empty external trust-root boundary, and zero-real-evidence release state. Read-only and fail-closed; it cannot sign, configure keys, execute releases, or prove a dataset, training run, checkpoint, benchmark, route, model ownership, or AGI capability.",
      input_schema: {
        type: "object",
        properties: {
          includeContract: { type: "boolean", description: "Return the full machine-readable evidence-chain contract." },
        },
      },
    },
    {
      name: AI_CORE_VERSION_STATUS_TOOL,
      description:
        "Read the SEIS AI Core version registry for SEIS AI Core v0.1, SEIS Language v0.1, model-router, prompt-engine, agent-runtime, sub-agent lane bindings, truth boundaries, and five-year promotion gates. Read-only; never claims trained model ownership or live autonomous execution.",
      input_schema: {
        type: "object",
        properties: {
          includeFullRegistry: { type: "boolean", description: "Return the full machine-readable version registry." },
        },
      },
    },
    {
      name: AI_CORE_VERSION_PROMOTION_TOOL,
      description:
        "Dry-run a SEIS AI Core version promotion gate against repository-local evidence for the embedded SEIS plugin lanes. Read-only; never approves a release, mutates files, calls providers, accesses credentials, deploys, or runs autonomous execution.",
      input_schema: {
        type: "object",
        properties: {
          versionTarget: { type: "string", description: "Optional target such as v0.1-foundation or v0.3-write-gated-runtime." },
          year: { type: "integer", description: "Optional roadmap year from 1 to 5." },
        },
      },
    },
    {
      name: SUBAGENT_OPERATING_MODEL_TOOL,
      description:
        "Read the SEIS AI Core bounded sub-agent operating model, five-year plan linkage, permission levels, lane quality gates, cadence, and current approval boundaries. Read-only; does not execute sub-agents or claim autonomous runtime.",
      input_schema: {
        type: "object",
        properties: {
          includeFullModel: { type: "boolean", description: "Return the full machine-readable operating model." },
          includeLongHorizonPlan: { type: "boolean", description: "Return the full five-year long-horizon plan record." },
        },
      },
    },
    {
      name: SUBAGENT_DRY_RUN_TASK_TOOL,
      description:
        "Evaluate one SEIS AI Core sub-agent dry-run fixture task against role, permission, approval, cancellation, tool, and path-scope rules. Read-only; returns a decision and never mutates files, queues, GitHub, cloud, SSH, providers, or credentials.",
      input_schema: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "Dry-run task id from content/development/seis-ai-core-dry-run-task-queue.json" },
          requestedTool: { type: "string", description: "Optional tool name to evaluate against the assigned role allow/deny list." },
          requestedPath: { type: "string", description: "Optional repo-relative path to evaluate against the task target scope." },
          signal: { type: "string", description: "Optional cancellation signal such as operator-cancel, timeout, policy-deny, or validation-failure." },
        },
        required: ["taskId"],
      },
    },
    {
      name: SUBAGENT_REVIEW_LEDGER_TOOL,
      description:
        "Read the SEIS AI Core five-year sub-agent quarterly review ledger. Read-only; shows current/planned quarters, evidence, approval boundaries, and next safe actions without mutating queues, files, GitHub, cloud, SSH, providers, or credentials.",
      input_schema: {
        type: "object",
        properties: {
          quarterId: { type: "string", description: "Optional quarter id such as Y1-Q2 or Y3-Q4." },
          includeQuarters: { type: "boolean", description: "Return all 20 quarterly ledger records." },
        },
      },
    },
    ...PERSONAL_PLUGIN_LANE_TOOLS.flatMap((lane) => [
      {
        name: lane.statusTool,
        description:
          `Read the ${lane.displayName} embedded lane status from the canonical SEIS-Agent plugin manifest, skill mirror, and lane profile. Read-only; never claims external authentication.`,
        input_schema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: lane.planTool,
        description:
          `Create a scoped ${lane.displayName} execution plan from SEIS repo evidence, guardrails, and quality gates. Plan-only; does not mutate GitHub, cloud, SSH, files, providers, or credentials.`,
        input_schema: {
          type: "object",
          properties: {
            request: { type: "string", description: `Task request to route through ${lane.displayName}.` },
          },
          required: ["request"],
        },
      },
    ]),
    {
      name: "run_checks",
      description:
        "Run the SEIS audit suite against apps/web. scope: 'i18n' (translation parity), 'seo', 'contract' (HTML/JS selector contract), 'drawings' (media integrity), 'style' (CSS custom props + dead classes), 'perf' (file size budgets + render-blocking scripts), 'a11y' (accessibility), 'security' (blank-link safety, CSP, mixed content), or 'all'. Always run 'contract' and 'i18n' after editing index.html, script.js or translations.json; run 'style' after style.css; run 'a11y' after any structural HTML change.",
      input_schema: {
        type: "object",
        properties: {
          scope: { type: "string", enum: ["all", "i18n", "seo", "contract", "drawings", "style", "perf", "a11y", "security"] },
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
  const laneTool = resolvePersonalPluginLaneTool(name);
  if (laneTool) {
    const payload = laneTool.kind === "status"
      ? personalPluginLaneStatus(repoRoot, laneTool.laneId)
      : personalPluginLanePlan(repoRoot, laneTool.laneId, input?.request);
    return JSON.stringify(payload, null, 2);
  }

  switch (name) {
    case "list_files": {
      const abs = resolveSafeExistingRepoPath(repoRoot, input.dir ?? ".", "directory");
      const entries = readdirSync(abs)
        .filter((entry) => !SKIP_DIRS.has(entry) && !isPrivateFileName(entry))
        .filter((entry) => !lstatSync(path.join(abs, entry)).isSymbolicLink())
        .map((entry) => (statSync(path.join(abs, entry)).isDirectory() ? `${entry}/` : entry))
        .sort();
      return entries.join("\n") || "(empty)";
    }
    case "read_file": {
      const abs = resolveSafeExistingRepoPath(repoRoot, input.file, "file");
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
      const dir = resolveSafeExistingRepoPath(repoRoot, input.dir ?? "apps/web", "directory");
      const needle = String(input.pattern ?? "");
      if (needle.length === 0 || needle.length > 200) {
        throw new Error("grep_repo pattern must contain 1-200 literal characters");
      }
      const hits = [];
      grepWalk(dir, needle, repoRoot, hits);
      if (!hits.length) return "(no matches)";
      const shown = hits.slice(0, MAX_GREP_HITS);
      const suffix = hits.length > shown.length ? `\n[... ${hits.length - shown.length} more matches]` : "";
      return shown.join("\n") + suffix;
    }
    case "git_diff": {
      const args = input.staged === true ? ["diff", "--staged"] : ["diff", "HEAD"];
      args.push(
        "--",
        ".",
        ":(exclude).seis/**",
        ":(exclude).env",
        ":(exclude).env.*",
        ":(exclude)**/*.pem",
        ":(exclude)**/*.key",
        ":(exclude)**/*.p12",
        ":(exclude)**/*.pfx",
      );
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
    case "git_log": {
      const count = Math.min(Math.max(1, input.count ?? 10), 40);
      let out;
      try {
        out = execFileSync("git", ["log", "--oneline", `-${count}`], { cwd: repoRoot, encoding: "utf8" });
      } catch (err) {
        out = (err.stdout ?? "") || err.message;
      }
      return out.trim() || "(no commits)";
    }
    case "seis_plugin_integration": {
      return JSON.stringify(
        pluginIntegrationStatus(repoRoot, { includeFullManifest: input.includeFullManifest === true }),
        null,
        2
      );
    }
    case AI_CORE_PROVIDER_STATUS_TOOL: {
      return JSON.stringify(
        aiCoreProviderStatus(repoRoot, { includeFullRegistry: input?.includeFullRegistry === true }),
        null,
        2
      );
    }
    case READ_ONLY_ROUTER_TOOL: {
      return JSON.stringify(buildReadOnlyRouteDecision(input, { root: repoRoot }), null, 2);
    }
    case AI_CORE_MODEL_SCALING_STATUS_TOOL: {
      return JSON.stringify(
        aiCoreModelScalingStatus(repoRoot, { includeFullProfile: input?.includeFullProfile === true }),
        null,
        2
      );
    }
    case AI_CORE_FRONTIER_TRAINING_STATUS_TOOL: {
      return JSON.stringify(
        aiCoreFrontierTrainingStatus(repoRoot, { includeFullPlan: input?.includeFullPlan === true }),
        null,
        2
      );
    }
    case TRAINING_EVIDENCE_STATUS_TOOL: {
      return JSON.stringify(
        trainingEvidenceStatus(repoRoot, {
          includeContract: input?.includeContract === true,
        }),
        null,
        2
      );
    }
    case AI_CORE_VERSION_STATUS_TOOL: {
      return JSON.stringify(
        aiCoreVersionStatus(repoRoot, { includeFullRegistry: input?.includeFullRegistry === true }),
        null,
        2
      );
    }
    case AI_CORE_VERSION_PROMOTION_TOOL: {
      return JSON.stringify(aiCoreVersionPromotionDryRun(repoRoot, input), null, 2);
    }
    case SUBAGENT_OPERATING_MODEL_TOOL: {
      return JSON.stringify(
        subagentOperatingModelStatus(repoRoot, {
          includeFullModel: input.includeFullModel === true,
          includeLongHorizonPlan: input.includeLongHorizonPlan === true,
        }),
        null,
        2
      );
    }
    case SUBAGENT_DRY_RUN_TASK_TOOL: {
      return JSON.stringify(subagentDryRunTaskDecision(repoRoot, input), null, 2);
    }
    case SUBAGENT_REVIEW_LEDGER_TOOL: {
      return JSON.stringify(
        subagentReviewLedgerStatus(repoRoot, {
          quarterId: input?.quarterId,
          includeQuarters: input?.includeQuarters === true,
        }),
        null,
        2
      );
    }
    case "run_checks": {
      const result =
        input.scope === "i18n" ? i18nStatus(webRoot)
        : input.scope === "seo" ? seoAudit(webRoot)
        : input.scope === "contract" ? contractCheck(webRoot)
        : input.scope === "drawings" ? drawingsCatalog(webRoot)
        : input.scope === "style" ? styleAudit(webRoot)
        : input.scope === "perf" ? perfAudit(webRoot)
        : input.scope === "a11y" ? a11yAudit(webRoot)
        : input.scope === "security" ? securityAudit(webRoot)
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
      const abs = resolveSafeExistingRepoPath(repoRoot, input.file, "file");
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
      assertSafeRepoRelativePath(input.file);
      const abs = resolveInside(repoRoot, input.file);
      assertSafeWriteTarget(repoRoot, abs);
      mkdirSync(path.dirname(abs), { recursive: true });
      writeFileSync(abs, input.content);
      return `Wrote ${Buffer.byteLength(input.content)} bytes to ${input.file}`;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function assertSafeRepoRelativePath(userPath) {
  if (typeof userPath !== "string" || userPath.length === 0) {
    throw new Error("Repository path must be a non-empty string");
  }
  const normalized = userPath.replaceAll("\\", "/");
  const segments = normalized.split("/").filter(Boolean).map((segment) => segment.toLowerCase());
  if (segments.some((segment) => PRIVATE_PATH_SEGMENTS.has(segment))) {
    throw new Error("Private repository paths are unavailable to agent filesystem tools");
  }
  if (isPrivateFileName(segments.at(-1) || "")) {
    throw new Error("Credential-like files are unavailable to agent filesystem tools");
  }
}

function isPrivateFileName(fileName) {
  const normalized = String(fileName).toLowerCase();
  if (normalized.startsWith(".env") && normalized.endsWith(".example")) return false;
  return (
    normalized === ".env" ||
    normalized.startsWith(".env.") ||
    normalized === "credentials.local.json" ||
    (normalized.startsWith("service-account") && normalized.endsWith(".json")) ||
    [".pem", ".key", ".p12", ".pfx"].some((extension) => normalized.endsWith(extension))
  );
}

function resolveSafeExistingRepoPath(repoRoot, userPath, expectedType) {
  assertSafeRepoRelativePath(userPath);
  const abs = resolveInside(repoRoot, userPath);
  assertNoSymlinkComponents(repoRoot, abs);
  const fileStat = lstatSync(abs);
  if (fileStat.isSymbolicLink()) {
    throw new Error("Symbolic links are unavailable to agent filesystem tools");
  }
  if (expectedType === "file" && !fileStat.isFile()) throw new Error("Expected a regular file");
  if (expectedType === "directory" && !fileStat.isDirectory()) {
    throw new Error("Expected a directory");
  }
  resolveInside(realpathSync(repoRoot), realpathSync(abs));
  return abs;
}

function assertSafeWriteTarget(repoRoot, target) {
  let cursor = path.dirname(target);
  while (!statExists(cursor)) cursor = path.dirname(cursor);
  const cursorStat = lstatSync(cursor);
  assertNoSymlinkComponents(repoRoot, cursor);
  if (cursorStat.isSymbolicLink() || !cursorStat.isDirectory()) {
    throw new Error("Agent write parent must be a regular non-symlink directory");
  }
  resolveInside(realpathSync(repoRoot), realpathSync(cursor));
  if (statExists(target) && lstatSync(target).isSymbolicLink()) {
    throw new Error("Agent writes through symbolic links are forbidden");
  }
}

function assertNoSymlinkComponents(repoRoot, target) {
  const relative = path.relative(path.resolve(repoRoot), path.resolve(target));
  let cursor = path.resolve(repoRoot);
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, segment);
    if (lstatSync(cursor).isSymbolicLink()) {
      throw new Error("Symbolic links are unavailable to agent filesystem tools");
    }
  }
}

function statExists(candidate) {
  try {
    lstatSync(candidate);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function grepWalk(dir, needle, repoRoot, hits) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry) || entry.startsWith(".") || isPrivateFileName(entry)) continue;
    const abs = path.join(dir, entry);
    const st = lstatSync(abs);
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) {
      grepWalk(abs, needle, repoRoot, hits);
    } else if (st.size < 1024 * 1024 && /\.(m?js|cjs|ts|json|html?|css|md|txt|xml|ya?ml|svg)$/i.test(entry)) {
      const lines = readFileSync(abs, "utf8").split("\n");
      for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].includes(needle)) {
          const rel = path.relative(repoRoot, abs).split(path.sep).join("/");
          hits.push(`${rel}:${i + 1}: ${lines[i].trim().slice(0, 200)}`);
          if (hits.length > MAX_GREP_HITS * 3) return;
        }
      }
    }
  }
}
