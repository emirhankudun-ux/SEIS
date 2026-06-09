import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

import { resolveRepoRoot, resolveWebRoot } from "../lib/repo.mjs";
import {
  contractCheck,
  drawingsCatalog,
  i18nGet,
  i18nSearch,
  i18nStatus,
  runAllChecks,
  seoAudit,
  siteConfig,
} from "../lib/checks.mjs";
import { i18nAddKey } from "../lib/i18n-write.mjs";

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
    "run_all_checks",
    "Run the full audit suite (i18n parity, SEO, HTML/JS contract, drawings) and return one aggregate report with a top-level ok flag.",
    {},
    async () => {
      try {
        return jsonResult(runAllChecks(webRoot));
      } catch (error) {
        return errorResult(error);
      }
    }
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
