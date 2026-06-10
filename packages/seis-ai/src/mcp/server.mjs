import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

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

const repoRoot = resolveRepoRoot();
const webRoot = resolveWebRoot(repoRoot);

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
  const server = new McpServer({ name: "seis", version: "0.1.0" });

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

  return server;
}

export async function startServer() {
  const server = buildServer();
  await server.connect(new StdioServerTransport());
}
