import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";

import { resolveRepoRoot, resolveWebRoot } from "../lib/repo.mjs";
import {
  a11yAudit,
  contractCheck,
  collectReferencedI18nKeys,
  drawingsCatalog,
  i18nGet,
  i18nSearch,
  i18nStatus,
  loadTranslations,
  perfAudit,
  runAllChecks,
  securityAudit,
  seoAudit,
  siteConfig,
  styleAudit,
} from "../lib/checks.mjs";
import { i18nAddKey, i18nRenameKey } from "../lib/i18n-write.mjs";
import {
  AI_CORE_150B_FRONTIER_MODEL_PROGRAM_PATH,
  AI_CORE_512B_APEX_MODEL_PROGRAM_PATH,
  AI_CORE_720B_AGI_FRONTIER_BOUNDARY_PATH,
  AI_CORE_AGI_EVALUATION_PROTOCOL_PATH,
  AI_CORE_AGI_PUBLIC_READINESS_EVIDENCE_PATH,
  AI_CORE_20B_DATASET_CARD_TEMPLATE_PATH,
  AI_CORE_20B_MODEL_CARD_TEMPLATE_PATH,
  AI_CORE_PROVIDER_REGISTRY_PATH,
  AI_CORE_PROVIDER_STATUS_TOOL,
  AI_CORE_MODEL_FRONTIER_ESCALATION_POLICY_PATH,
  AI_CORE_MODEL_PARAMETER_LADDER_PATH,
  AI_CORE_MODEL_SCALING_PROFILE_PATH,
  AI_CORE_MODEL_SCALING_STATUS_TOOL,
  AI_CORE_VERSION_PROMOTION_GATES_PATH,
  AI_CORE_VERSION_PROMOTION_TOOL,
  AI_CORE_VERSION_REGISTRY_PATH,
  AI_CORE_VERSION_STATUS_TOOL,
  FULL_USAGE_MCP_BINDING_PATH,
  FULL_USAGE_MCP_BINDING_RESOURCE_URI,
  GOD_MODE_STATUS_RESOURCE_URI,
  GOD_MODE_STATUS_TOOL,
  MCP_RUNTIME_CONTRACT_PATH,
  PERSONAL_PLUGIN_LANE_TOOLS,
  PLUGIN_INTEGRATION_PATH,
  SUBAGENT_APPROVAL_FIXTURE_PATH,
  SUBAGENT_CANCELLATION_FIXTURE_PATH,
  SUBAGENT_DRY_RUN_QUEUE_PATH,
  SUBAGENT_DRY_RUN_TASK_TOOL,
  SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH,
  SUBAGENT_LONG_HORIZON_PLAN_PATH,
  SUBAGENT_LONG_HORIZON_PLAN_VIEW_PATH,
  SUBAGENT_ROUND_EXECUTION_EVIDENCE_LEDGER_PATH,
  SUBAGENT_SWARM_ROUND_LEDGER_PATH,
  SUBAGENT_OPERATING_MODEL_PATH,
  SUBAGENT_OPERATING_MODEL_TOOL,
  SUBAGENT_PERMISSION_MATRIX_PATH,
  SUBAGENT_REDACTION_FIXTURE_PATH,
  SUBAGENT_REVIEW_LEDGER_PATH,
  SUBAGENT_REVIEW_LEDGER_TOOL,
  SUBAGENT_ROLE_SCHEMA_PATH,
  SUBAGENT_RUNTIME_FIXTURES_PATH,
  aiCoreProviderStatus,
  aiCoreModelScalingStatus,
  aiCoreVersionPromotionDryRun,
  aiCoreVersionStatus,
  godModeStatus,
  personalPluginLanePlan,
  personalPluginLaneStatus,
  pluginIntegrationStatus,
  subagentDryRunTaskDecision,
  subagentOperatingModelStatus,
  subagentReviewLedgerStatus,
} from "../lib/plugin-integration.mjs";

const repoRoot = resolveRepoRoot();
const webRoot = resolveWebRoot(repoRoot);

const z = createSchemaHelpers();

function createSchemaHelpers() {
  function schema(type, extra = {}) {
    const spec = { type, ...extra };
    const api = {
      __schema: spec,
      optional() {
        spec.optional = true;
        return api;
      },
      describe(description) {
        spec.description = description;
        return api;
      },
      int() {
        spec.integer = true;
        return api;
      },
      min(value) {
        spec.minimum = value;
        return api;
      },
      max(value) {
        spec.maximum = value;
        return api;
      },
    };
    return api;
  }

  return {
    string: () => schema("string"),
    boolean: () => schema("boolean"),
    number: () => schema("number"),
    enum: (values) => schema("string", { enum: values }),
    object: (shape) => schema("object", { properties: shape }),
  };
}

function toJsonSchema(shape = {}) {
  const properties = {};
  const required = [];

  for (const [name, descriptor] of Object.entries(shape)) {
    const source = descriptor?.__schema ?? descriptor ?? {};
    const property = {};
    if (source.type === "number" && source.integer) {
      property.type = "integer";
    } else {
      property.type = source.type || "string";
    }
    if (source.description) property.description = source.description;
    if (source.enum) property.enum = source.enum;
    if (source.minimum !== undefined) property.minimum = source.minimum;
    if (source.maximum !== undefined) property.maximum = source.maximum;
    if (source.type === "object") {
      const nested = toJsonSchema(source.properties || {});
      property.type = "object";
      property.properties = nested.properties;
      if (nested.required?.length) property.required = nested.required;
      property.additionalProperties = false;
    }
    properties[name] = property;
    if (source.optional !== true) required.push(name);
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}

function createJsonRpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

class LightweightMcpServer {
  constructor({ name, version }) {
    this.name = name;
    this.version = version;
    this.tools = new Map();
    this.prompts = new Map();
    this.resources = new Map();
  }

  tool(name, description, inputShape, handler) {
    this.tools.set(name, { name, description, inputShape, handler });
  }

  prompt(name, description, inputShape, handler) {
    this.prompts.set(name, { name, description, inputShape, handler });
  }

  resource(name, uri, metadata, handler) {
    this.resources.set(uri, { name, uri, metadata, handler });
  }

  async connect() {
    const rl = readline.createInterface({
      input: process.stdin,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let request;
      try {
        request = JSON.parse(trimmed);
      } catch {
        this.send(createJsonRpcError(null, -32700, "Parse error"));
        continue;
      }

      if (request.id === undefined) continue;

      try {
        const result = await this.handle(request);
        this.send({ jsonrpc: "2.0", id: request.id, result });
      } catch (error) {
        this.send(createJsonRpcError(request.id, -32603, error.message));
      }
    }
  }

  send(message) {
    process.stdout.write(`${JSON.stringify(message)}\n`);
  }

  async handle(request) {
    switch (request.method) {
      case "initialize":
        return {
          protocolVersion: request.params?.protocolVersion || "2024-11-05",
          capabilities: {
            tools: {},
            prompts: {},
            resources: {},
          },
          serverInfo: { name: this.name, version: this.version },
        };
      case "tools/list":
        return {
          tools: [...this.tools.values()].map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: toJsonSchema(tool.inputShape),
          })),
        };
      case "tools/call":
        return this.callTool(request.params);
      case "prompts/list":
        return {
          prompts: [...this.prompts.values()].map((prompt) => ({
            name: prompt.name,
            description: prompt.description,
            arguments: Object.entries(prompt.inputShape || {}).map(([name, descriptor]) => ({
              name,
              description: descriptor?.__schema?.description || "",
              required: descriptor?.__schema?.optional !== true,
            })),
          })),
        };
      case "prompts/get":
        return this.getPrompt(request.params);
      case "resources/list":
        return {
          resources: [...this.resources.values()].map((resource) => ({
            name: resource.name,
            uri: resource.uri,
            description: resource.metadata?.description,
            mimeType: resource.metadata?.mimeType,
          })),
        };
      case "resources/read":
        return this.readResource(request.params);
      default:
        throw new Error(`Unsupported MCP method: ${request.method}`);
    }
  }

  async callTool(params = {}) {
    const tool = this.tools.get(params.name);
    if (!tool) throw new Error(`Unknown tool: ${params.name}`);
    return tool.handler(params.arguments || {});
  }

  async getPrompt(params = {}) {
    const prompt = this.prompts.get(params.name);
    if (!prompt) throw new Error(`Unknown prompt: ${params.name}`);
    return prompt.handler(params.arguments || {});
  }

  async readResource(params = {}) {
    const resource = this.resources.get(params.uri);
    if (!resource) throw new Error(`Unknown resource: ${params.uri}`);
    return resource.handler();
  }
}

function jsonResult(payload) {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

function errorResult(error) {
  return {
    isError: true,
    content: [{ type: "text", text: `Error: ${error.message}` }],
  };
}

export function buildServer() {
  const server = new LightweightMcpServer({ name: "seis", version: "0.1.0" });

  server.tool(
    "i18n_status",
    "Key-parity report for the 5-locale translations.json: per-locale key counts, keys missing from any locale, referenced-but-undefined keys, and empty values. Call this before and after any translation edit.",
    {},
    async () => {
      try {
        return jsonResult(i18nStatus(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "i18n_get",
    "Look up one translation key and return its value in every locale (tr/en/fr/it/de). Null marks a locale where the key is missing.",
    { key: z.string().describe("Translation key, e.g. hero.cta1") },
    async ({ key }) => {
      try {
        return jsonResult(i18nGet(webRoot, key));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "i18n_search",
    "Search translation keys and values (case-insensitive substring) across all locales. Use to find the right key before editing copy.",
    { query: z.string().describe("Substring to search in keys and values") },
    async ({ query }) => {
      try {
        return jsonResult(i18nSearch(webRoot, query));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "i18n_add_key",
    "Add a new translation key with a value for every locale. Writes translations.json. Fails if the key exists unless overwrite is true.",
    {
      key: z.string().describe("New translation key, e.g. fm.newfield"),
      values: z
        .object({
          tr: z.string(),
          en: z.string(),
          fr: z.string(),
          it: z.string(),
          de: z.string(),
        })
        .describe("Value per locale"),
      overwrite: z.boolean().optional().describe("Replace existing values"),
    },
    async ({ key, values, overwrite }) => {
      try {
        return jsonResult(i18nAddKey(webRoot, key, values, { overwrite }));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "i18n_rename_key",
    "Rename a translation key across ALL locales and rewrite every reference: data-i18n* attributes in index.html and getT() calls in script.js. Fails if the old key is missing anywhere or the new key already exists. Run web_contract_check + i18n_status afterwards.",
    {
      oldKey: z.string().describe("Existing key to rename"),
      newKey: z.string().describe("New key name"),
      updateReferences: z.boolean().optional().describe("Also rewrite HTML/JS references (default true)"),
    },
    async ({ oldKey, newKey, updateReferences }) => {
      try {
        return jsonResult(i18nRenameKey(webRoot, oldKey, newKey, { updateReferences }));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "seo_audit",
    "Audit index.html for SEO/PWA requirements: title, meta description, canonical, Open Graph, Twitter card, hreflang alternates, JSON-LD, manifest, robots.txt, sitemap.xml.",
    {},
    async () => {
      try {
        return jsonResult(seoAudit(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "web_contract_check",
    "Verify every #id/.class selector referenced from script.js exists in index.html (or is created by the script). Catches markup rewrites that silently break site behaviour — run after ANY edit to index.html or script.js.",
    {},
    async () => {
      try {
        return jsonResult(contractCheck(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "drawings_catalog",
    "List drawing images under public/media/drawings with sizes, and cross-check that every image referenced from index.html exists on disk.",
    {},
    async () => {
      try {
        return jsonResult(drawingsCatalog(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "style_audit",
    "Static CSS audit of style.css: FAILS when a var(--x) custom property is used but never defined (in CSS, inline HTML style, or JS setProperty). Also reports statically-unused CSS classes and unstyled HTML classes as informational.",
    {},
    async () => {
      try {
        return jsonResult(styleAudit(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "site_config_get",
    "Read site-config.json (contact endpoint + contact email used by the contact form).",
    {},
    async () => {
      try {
        return jsonResult(siteConfig(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "i18n_unreferenced",
    "List translation keys that exist in translations.json but are never referenced by a data-i18n attribute in index.html or a getT() call in script.js. Useful for cleaning up dead translation copy.",
    {},
    async () => {
      try {
        const translations = loadTranslations(webRoot);
        const referenced = new Set(collectReferencedI18nKeys(webRoot));
        const allKeys = [...new Set(Object.values(translations).flatMap(Object.keys))].sort();
        const unreferenced = allKeys.filter((k) => !referenced.has(k));
        return jsonResult({ total: allKeys.length, referencedCount: referenced.size, unreferencedCount: unreferenced.length, unreferenced });
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "workspace_status",
    "Summary of the monorepo workspace: lists all packages under packages/ with their name, version, and whether a package.json exists. Also reports the apps/ directory contents.",
    {},
    async () => {
      try {
        const packagesDir = path.join(repoRoot, "packages");
        const appsDir = path.join(repoRoot, "apps");

        function listPackages(dir) {
          if (!existsSync(dir)) return [];
          return readdirSync(dir).map((entry) => {
            const pkgJson = path.join(dir, entry, "package.json");
            if (!existsSync(pkgJson)) return { name: entry, hasPackageJson: false };
            const { name, version, description } = JSON.parse(readFileSync(pkgJson, "utf8"));
            const size = dirSize(path.join(dir, entry));
            return { name, version, description, dir: entry, hasPackageJson: true, sizeKb: Math.round(size / 1024) };
          });
        }

        function dirSize(dir) {
          if (!existsSync(dir)) return 0;
          return readdirSync(dir).reduce((sum, f) => {
            const abs = path.join(dir, f);
            try {
              const st = statSync(abs);
              return sum + (st.isDirectory() && f !== "node_modules" ? dirSize(abs) : st.isFile() ? st.size : 0);
            } catch { return sum; }
          }, 0);
        }

        const rootPkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
        return jsonResult({
          workspace: rootPkg.name,
          version: rootPkg.version,
          packages: listPackages(packagesDir),
          apps: existsSync(appsDir) ? readdirSync(appsDir) : [],
          repoRoot,
        });
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "seis_plugin_integration",
    "Read the canonical SEIS-Agent plugin integration manifest for personal SEIS plugins, embedded lanes, helper plugin universe, quality gates, and runtime/app integration surfaces.",
    {
      includeFullManifest: z.boolean().optional().describe("Return the full manifest in addition to the compact status summary"),
    },
    async ({ includeFullManifest }) => {
      try {
        return jsonResult(pluginIntegrationStatus(repoRoot, { includeFullManifest: includeFullManifest === true }));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    GOD_MODE_STATUS_TOOL,
    "Read the repo-backed SEIS God Mode Developer operating state: required layer lift, module coverage, run-state, work-package readiness, source health, and next safe actions. Read-only; performs no file mutation, provider call, credential access, SSH, deployment, GitHub mutation, or completion claim.",
    {
      includeFullRecords: z.boolean().optional().describe("Return the full machine-readable God Mode source records"),
    },
    async ({ includeFullRecords }) => {
      try {
        return jsonResult(godModeStatus(repoRoot, { includeFullRecords: includeFullRecords === true }));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    AI_CORE_PROVIDER_STATUS_TOOL,
    "Read the SEIS AI Core provider registry for zero-key Local Demo, supervised Codex, optional server-only cloud providers, local-provider candidates, public provider states, and security invariants. Read-only; performs no live provider calls, credential validation, network checks, SSH, deployment, or GitHub mutation.",
    {
      includeFullRegistry: z.boolean().optional().describe("Return the full machine-readable provider registry"),
    },
    async ({ includeFullRegistry }) => {
      try {
        return jsonResult(aiCoreProviderStatus(repoRoot, { includeFullRegistry: includeFullRegistry === true }));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    AI_CORE_MODEL_SCALING_STATUS_TOOL,
    "Read the SEIS AI Core model scaling hardware profile, parameter ladder, and model-scaling sub-agent council for the planned 20B target on 16GB+ RAM, compatibility profiles, benchmark manifest contract, memory budget contract, quantization lanes, local runtime candidates, future 70B ladder, 150B frontier research lane, 300B+ exploration boundary, and highest-future parameter boundary. Read-only; performs no training, inference, download, benchmark, provider call, SSH, deployment, or credential access.",
    {
      includeFullProfile: z.boolean().optional().describe("Return the full machine-readable model scaling hardware profile"),
    },
    async ({ includeFullProfile }) => {
      try {
        return jsonResult(aiCoreModelScalingStatus(repoRoot, { includeFullProfile: includeFullProfile === true }));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    AI_CORE_VERSION_STATUS_TOOL,
    "Read the SEIS AI Core version registry for SEIS AI Core v0.1, SEIS Language v0.1, model-router, prompt-engine, agent-runtime, sub-agent lane bindings, truth boundaries, and five-year promotion gates. Read-only; never claims trained model ownership or live autonomous execution.",
    {
      includeFullRegistry: z.boolean().optional().describe("Return the full machine-readable version registry"),
    },
    async ({ includeFullRegistry }) => {
      try {
        return jsonResult(aiCoreVersionStatus(repoRoot, { includeFullRegistry: includeFullRegistry === true }));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    AI_CORE_VERSION_PROMOTION_TOOL,
    "Dry-run a SEIS AI Core version promotion gate against repository-local evidence for the embedded SEIS plugin lanes. Read-only; never approves a release, mutates files, calls providers, accesses credentials, deploys, or runs autonomous execution.",
    {
      versionTarget: z.string().optional().describe("Optional target such as v0.1-foundation or v0.3-write-gated-runtime"),
      year: z.number().int().min(1).max(5).optional().describe("Optional roadmap year from 1 to 5"),
    },
    async (input) => {
      try {
        return jsonResult(aiCoreVersionPromotionDryRun(repoRoot, input));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    SUBAGENT_OPERATING_MODEL_TOOL,
    "Read the SEIS AI Core bounded sub-agent operating model, five-year plan linkage, permission levels, lane quality gates, cadence, and current approval boundaries. Read-only; does not execute sub-agents or claim autonomous runtime.",
    {
      includeFullModel: z.boolean().optional().describe("Return the full machine-readable operating model"),
      includeLongHorizonPlan: z.boolean().optional().describe("Return the full five-year long-horizon plan record"),
    },
    async ({ includeFullModel, includeLongHorizonPlan }) => {
      try {
        return jsonResult(
          subagentOperatingModelStatus(repoRoot, {
            includeFullModel: includeFullModel === true,
            includeLongHorizonPlan: includeLongHorizonPlan === true,
          })
        );
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    SUBAGENT_DRY_RUN_TASK_TOOL,
    "Evaluate one SEIS AI Core sub-agent dry-run fixture task against role, permission, approval, cancellation, tool, and path-scope rules. Read-only; returns a decision and never mutates files, queues, GitHub, cloud, SSH, providers, or credentials.",
    {
      taskId: z.string().describe("Dry-run task id from content/development/seis-ai-core-dry-run-task-queue.json"),
      requestedTool: z.string().optional().describe("Optional tool name to evaluate against the assigned role allow/deny list"),
      requestedPath: z.string().optional().describe("Optional repo-relative path to evaluate against the task target scope"),
      signal: z.string().optional().describe("Optional cancellation signal such as operator-cancel, timeout, policy-deny, or validation-failure"),
    },
    async (input) => {
      try {
        return jsonResult(subagentDryRunTaskDecision(repoRoot, input));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    SUBAGENT_REVIEW_LEDGER_TOOL,
    "Read the SEIS AI Core five-year sub-agent quarterly review ledger. Read-only; shows current/planned quarters, evidence, approval boundaries, and next safe actions without mutating queues, files, GitHub, cloud, SSH, providers, or credentials.",
    {
      quarterId: z.string().optional().describe("Optional quarter id such as Y1-Q2 or Y3-Q4"),
      includeQuarters: z.boolean().optional().describe("Return all 20 quarterly ledger records"),
    },
    async ({ quarterId, includeQuarters }) => {
      try {
        return jsonResult(
          subagentReviewLedgerStatus(repoRoot, {
            quarterId,
            includeQuarters: includeQuarters === true,
          })
        );
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  for (const lane of PERSONAL_PLUGIN_LANE_TOOLS) {
    server.tool(
      lane.statusTool,
      `Read the ${lane.displayName} embedded lane status from the canonical SEIS-Agent plugin manifest, skill mirror, and lane profile. Read-only; never claims external authentication.`,
      {},
      async () => {
        try {
          return jsonResult(personalPluginLaneStatus(repoRoot, lane.laneId));
        } catch (error) {
          return errorResult(error);
        }
      }
    );

    server.tool(
      lane.planTool,
      `Create a scoped ${lane.displayName} implementation plan from SEIS repo evidence, guardrails, and quality gates. Plan-only; does not mutate GitHub, cloud, SSH, providers, or credentials.`,
      {
        request: z.string().describe(`Task request to route through ${lane.displayName}.`),
      },
      async ({ request }) => {
        try {
          return jsonResult(personalPluginLanePlan(repoRoot, lane.laneId, request));
        } catch (error) {
          return errorResult(error);
        }
      }
    );
  }

  server.tool(
    "a11y_check",
    "Static accessibility audit of index.html: FAILS when an <img> is missing alt=, an interactive input/select/textarea has no associated label, or a <button> has no accessible name (text, aria-label, data-i18n, etc.). Advisory: positive tabindex values.",
    {},
    async () => {
      try {
        return jsonResult(a11yAudit(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "web_perf_audit",
    "Static performance budget for apps/web: file sizes (HTML ≤ 100 KB, CSS ≤ 100 KB, JS ≤ 150 KB, total ≤ 300 KB), render-blocking <script src> in <head>, and images missing loading=lazy or width/height. Budget violations and blocking scripts FAIL the check; missing lazy/dimensions are advisory.",
    {},
    async () => {
      try {
        return jsonResult(perfAudit(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "security_audit",
    "Static security audit of index.html: FAILS on target=\"_blank\" without rel=\"noopener noreferrer\" (tab-napping), javascript: hrefs (XSS), and http:// src/href attributes (mixed content). Advisory: missing CSP meta tag and external resources without integrity=.",
    {},
    async () => {
      try {
        return jsonResult(securityAudit(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "run_all_checks",
    "Run the full audit suite (i18n, SEO, HTML/JS contract, drawings, CSS style, performance, accessibility, security) and return one aggregate report with a top-level ok flag.",
    {},
    async () => {
      try {
        return jsonResult(runAllChecks(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.prompt(
    "audit_and_fix",
    "Run the full SEIS audit and fix every failure it reports",
    {},
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Run the seis run_all_checks tool. If every section reports ok, summarise the healthy state in two sentences. For each failing section: explain the root cause, make the smallest fix that respects the HTML/JS selector contract and the 5-locale i18n rule, then re-run the matching check tool to confirm it passes. Finish with a list of files changed and the final aggregate status.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "add_i18n_key",
    "Draft and add a new translation key across all 5 locales",
    {
      key: z.string().describe("New translation key, e.g. services.consulting.title"),
      meaning: z.string().describe("What the copy should say, in any language"),
    },
    async ({ key, meaning }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Add the translation key "${key}" to the SEIS portfolio. Intended meaning: ${meaning}

Steps:
1. Call i18n_get to confirm the key does not already exist.
2. Draft natural, on-brand copy for ALL five locales (tr, en, fr, it, de) — match the tone of neighbouring keys (use i18n_search to inspect them).
3. Call i18n_add_key with all five values.
4. Call i18n_status to verify parity still holds, and report the values you wrote.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "review_locale",
    "Review one locale's translations for tone, grammar, and consistency",
    {
      locale: z.enum(["tr", "en", "fr", "it", "de"]).describe("Locale to review"),
    },
    async ({ locale }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Review the "${locale}" locale of the SEIS portfolio translations. Read the seis://web/translations.json resource, then assess the ${locale} values against the Turkish source (tr) for: accuracy of meaning, consistent register (professional portfolio voice), grammar/spelling, and consistent terminology across related keys (nav.*, hero.*, fm.*, wk.*). List concrete issues with key names and proposed replacement strings — do not change anything unless asked.`,
          },
        },
      ],
    })
  );

  server.resource(
    "translations",
    "seis://web/translations.json",
    { description: "Full 5-locale translation table", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://web/translations.json",
          mimeType: "application/json",
          text: readFileSync(path.join(webRoot, "translations.json"), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "site-config",
    "seis://web/site-config.json",
    { description: "Contact form endpoint + email configuration", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://web/site-config.json",
          mimeType: "application/json",
          text: readFileSync(path.join(webRoot, "site-config.json"), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "plugin-integration",
    "seis://agent/plugin-integration.json",
    { description: "SEIS-Agent plugin integration manifest", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://agent/plugin-integration.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...PLUGIN_INTEGRATION_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "god-mode-status",
    GOD_MODE_STATUS_RESOURCE_URI,
    { description: "SEIS God Mode Developer read-only operating-state summary", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: GOD_MODE_STATUS_RESOURCE_URI,
          mimeType: "application/json",
          text: JSON.stringify(godModeStatus(repoRoot, { includeFullRecords: true }), null, 2),
        },
      ],
    })
  );

  server.resource(
    "ai-core-mcp-runtime-contract",
    "seis://ai/mcp-runtime-contract.json",
    { description: "SEIS AI Core local MCP runtime contract", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/mcp-runtime-contract.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...MCP_RUNTIME_CONTRACT_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "full-usage-mcp-binding",
    FULL_USAGE_MCP_BINDING_RESOURCE_URI,
    { description: "SEIS full-usage MCP binding for repo-owned MCP defaults and external MCP approval gates", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: FULL_USAGE_MCP_BINDING_RESOURCE_URI,
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...FULL_USAGE_MCP_BINDING_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-provider-registry",
    "seis://ai/provider-registry.json",
    { description: "SEIS AI Core zero-key provider registry and public provider-state contract", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/provider-registry.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_PROVIDER_REGISTRY_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-model-scaling-hardware-profile",
    "seis://ai/model-scaling-hardware-profile.json",
    { description: "SEIS AI Core planned 20B/70B/150B model scaling hardware profile", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/model-scaling-hardware-profile.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_MODEL_SCALING_PROFILE_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-model-parameter-ladder",
    "seis://ai/model-parameter-ladder.json",
    { description: "SEIS AI Core read-only seis-model-parameter-ladder for 20B, 70B, 150B, 300B+, and highest-future planning boundaries", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/model-parameter-ladder.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_MODEL_PARAMETER_LADDER_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-model-frontier-escalation-policy",
    "seis://ai/model-frontier-escalation-policy.json",
    { description: "SEIS AI Core read-only no-skip-20B frontier escalation policy for 70B, 150B, and higher-parameter planning gates", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/model-frontier-escalation-policy.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_MODEL_FRONTIER_ESCALATION_POLICY_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-150b-frontier-model-program",
    "seis://ai/150b-frontier-model-program.json",
    {
      description:
        "SEIS AI Core read-only seis-150b-frontier-model-program from content/development/seis-150b-frontier-model-program.json; not training, inference, benchmark, or production authority",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "seis://ai/150b-frontier-model-program.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_150B_FRONTIER_MODEL_PROGRAM_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-512b-apex-model-program",
    "seis://ai/512b-apex-model-program.json",
    {
      description:
        "SEIS AI Core read-only seis-512b-apex-model-program from content/development/seis-512b-apex-model-program.json; not AGI, training, inference, benchmark, or production authority",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "seis://ai/512b-apex-model-program.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_512B_APEX_MODEL_PROGRAM_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-720b-agi-frontier-boundary",
    "seis://ai/720b-agi-frontier-boundary.json",
    {
      description:
        "SEIS AI Core read-only seis-720b-agi-frontier-boundary from content/development/seis-720b-agi-frontier-boundary.json; plan-only, not AGI proof, training, inference, benchmark, SSH, cloud, or background-runtime authority",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "seis://ai/720b-agi-frontier-boundary.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_720B_AGI_FRONTIER_BOUNDARY_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-agi-evaluation-protocol",
    "seis://ai/agi-evaluation-protocol.json",
    {
      description:
        "SEIS AI Core read-only seis-agi-evaluation-protocol from content/development/seis-agi-evaluation-protocol.json; not AGI proof, training, inference, benchmark, or route authority",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "seis://ai/agi-evaluation-protocol.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_AGI_EVALUATION_PROTOCOL_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-agi-public-readiness-evidence",
    "seis://ai/agi-public-readiness-evidence.json",
    {
      description:
        "SEIS AI Core read-only seis-agi-public-readiness-evidence from content/development/seis-agi-public-readiness-evidence.json; not AGI proof, training, inference, benchmark, public-release, or route authority",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "seis://ai/agi-public-readiness-evidence.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_AGI_PUBLIC_READINESS_EVIDENCE_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-20b-model-card-template",
    "seis://ai/20b-model-card-template.json",
    { description: "SEIS AI Core 20B clean-room model card template; unfilled and not route eligible", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/20b-model-card-template.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_20B_MODEL_CARD_TEMPLATE_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-20b-dataset-card-template",
    "seis://ai/20b-dataset-card-template.json",
    { description: "SEIS AI Core 20B clean-room dataset card template; unfilled and not authorized for download, training, or benchmarks", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/20b-dataset-card-template.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_20B_DATASET_CARD_TEMPLATE_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-version-registry",
    "seis://ai/version-registry.json",
    { description: "SEIS AI Core v0.1 version registry and truth-boundary contract", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/version-registry.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_VERSION_REGISTRY_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "ai-core-version-promotion-gates",
    "seis://ai/version-promotion-gates.json",
    { description: "SEIS AI Core version promotion dry-run gates", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/version-promotion-gates.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...AI_CORE_VERSION_PROMOTION_GATES_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-operating-model",
    "seis://ai/subagent-operating-model.json",
    { description: "SEIS AI Core bounded sub-agent operating model", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/subagent-operating-model.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_OPERATING_MODEL_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-five-year-plan",
    "seis://ai/sub-agent-5-year-plan.json",
    { description: "SEIS five-year bounded sub-agent plan", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/sub-agent-5-year-plan.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_LONG_HORIZON_PLAN_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-five-year-plan-view",
    "seis://ai/sub-agent-5-year-plan-view.json",
    { description: "Generated SEIS five-year sub-agent plan view for browser/demo evidence", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/sub-agent-5-year-plan-view.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_LONG_HORIZON_PLAN_VIEW_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-swarm-round-ledger",
    "seis://ai/subagent-swarm-round-ledger.json",
    {
      description:
        "SEIS AI Core read-only 15/30-turn supervised sub-agent swarm round ledger; plan-only, not background runtime, AGI proof, SSH, cloud, credential, provider, or deployment authority",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "seis://ai/subagent-swarm-round-ledger.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_SWARM_ROUND_LEDGER_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-round-execution-evidence-ledger",
    "seis://ai/subagent-round-execution-evidence-ledger.json",
    {
      description:
        "SEIS AI Core read-only public-safe supervised round execution evidence ledger; not background runtime, SSH, cloud, credential, provider, deployment, GitHub, model-training, or AGI authority",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "seis://ai/subagent-round-execution-evidence-ledger.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_ROUND_EXECUTION_EVIDENCE_LEDGER_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-runtime-fixtures",
    "seis://ai/subagent-runtime-fixtures.json",
    { description: "SEIS AI Core consolidated sub-agent runtime fixture pack", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/subagent-runtime-fixtures.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_RUNTIME_FIXTURES_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-review-ledger",
    "seis://ai/subagent-review-ledger.json",
    { description: "SEIS AI Core five-year sub-agent quarterly review ledger", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/subagent-review-ledger.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_REVIEW_LEDGER_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-redaction-fixture",
    "seis://ai/redaction-fixture.json",
    { description: "SEIS AI Core sub-agent redaction and safe-output fixture", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/redaction-fixture.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_REDACTION_FIXTURE_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-execution-ledger-fixture",
    "seis://ai/execution-ledger-fixture.json",
    { description: "SEIS AI Core sub-agent append-only execution ledger fixture", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/execution-ledger-fixture.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-agent-role-schema",
    "seis://ai/agent-role-schema.json",
    { description: "SEIS AI Core sub-agent role schema fixture", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/agent-role-schema.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_ROLE_SCHEMA_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-agent-permission-matrix",
    "seis://ai/agent-permission-matrix.json",
    { description: "SEIS AI Core sub-agent permission matrix fixture", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/agent-permission-matrix.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_PERMISSION_MATRIX_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-dry-run-task-queue",
    "seis://ai/dry-run-task-queue.json",
    { description: "SEIS AI Core dry-run-only sub-agent queue fixture", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/dry-run-task-queue.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_DRY_RUN_QUEUE_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-cancellation-fixture",
    "seis://ai/cancellation-fixture.json",
    { description: "SEIS AI Core sub-agent cancellation fixture", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/cancellation-fixture.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_CANCELLATION_FIXTURE_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  server.resource(
    "subagent-approval-fixture",
    "seis://ai/approval-fixture.json",
    { description: "SEIS AI Core sub-agent approval fixture", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "seis://ai/approval-fixture.json",
          mimeType: "application/json",
          text: readFileSync(path.join(repoRoot, ...SUBAGENT_APPROVAL_FIXTURE_PATH.split("/")), "utf8"),
        },
      ],
    })
  );

  return server;
}

export async function startServer() {
  const server = buildServer();
  await server.connect();
}
