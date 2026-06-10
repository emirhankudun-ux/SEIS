/**
 * Type declarations for @seis/ai audit reports and agent surfaces.
 *
 * The package itself is plain ESM with no build step; these ambient
 * declarations give editors and TS-aware tooling the exact shapes the
 * audit functions return, so MCP clients and scripts consuming the JSON
 * payloads can be typed without converting the runtime to TypeScript.
 */

export interface I18nStatusReport {
  ok: boolean;
  locales: string[];
  keyCount: number;
  referencedCount: number;
  /** locale → keys that locale is missing */
  missingByLocale: Record<string, string[]>;
  /** keys referenced from HTML/JS but defined in no locale */
  referencedMissing: string[];
  /** keys whose value is empty in every locale */
  emptyEverywhere: string[];
}

export interface SeoAuditReport {
  ok: boolean;
  checks: { id: string; ok: boolean }[];
  failed: string[];
}

export interface ContractCheckReport {
  ok: boolean;
  checkedSelectors: number;
  htmlIds: number;
  htmlClasses: number;
  missing: { selector: string; kind: "id" | "class" }[];
}

export interface DrawingsCatalogReport {
  ok: boolean;
  referencedCount: number;
  fileCount: number;
  totalBytes: number;
  missingOnDisk: string[];
  files: { name: string; bytes: number }[] | string;
}

export interface StyleAuditReport {
  ok: boolean;
  skipped?: boolean;
  cssClassCount: number;
  definedVarCount: number;
  undefinedVars: string[];
  unusedVars: string[];
  unusedCss: string[];
  unstyledHtml: string[];
}

export interface PerfBudgets {
  html: number;
  css: number;
  js: number;
  total: number;
}

export interface PerfAuditReport {
  ok: boolean;
  htmlBytes: number;
  cssBytes: number;
  jsBytes: number;
  totalBytes: number;
  budgets: PerfBudgets;
  budgetViolations: { file: string; bytes: number; budget: number }[];
  renderBlockingScripts: string[];
  imgsWithoutLazy: string[];
  imgsWithoutDimensions: string[];
}

export interface A11yAuditReport {
  ok: boolean;
  imgsWithoutAlt: string[];
  unlabeledInputs: string[];
  inaccessibleButtons: string[];
  positiveTabindex: number[];
}

export interface SecurityAuditReport {
  ok: boolean;
  unsafeBlankLinks: string[];
  jsHrefs: string[];
  insecureResources: string[];
  hasCsp: boolean;
  externalNoIntegrity: string[];
}

/** Aggregate returned by runAllChecks / the run_all_checks MCP tool. */
export interface AllChecksReport {
  ok: boolean;
  i18n: I18nStatusReport;
  seo: SeoAuditReport;
  contract: ContractCheckReport;
  drawings: DrawingsCatalogReport;
  style: StyleAuditReport;
  perf: PerfAuditReport;
  a11y: A11yAuditReport;
  security: SecurityAuditReport;
}

export type CheckScope =
  | "all"
  | "i18n"
  | "seo"
  | "contract"
  | "drawings"
  | "style"
  | "perf"
  | "a11y"
  | "security";

export type ScopedReport<S extends CheckScope> = S extends "all"
  ? AllChecksReport
  : S extends "i18n"
    ? I18nStatusReport
    : S extends "seo"
      ? SeoAuditReport
      : S extends "contract"
        ? ContractCheckReport
        : S extends "drawings"
          ? DrawingsCatalogReport
          : S extends "style"
            ? StyleAuditReport
            : S extends "perf"
              ? PerfAuditReport
              : S extends "a11y"
                ? A11yAuditReport
                : SecurityAuditReport;

/* ------------------------------------------------------------------ */
/* Audit functions (src/lib/checks.mjs)                                */
/* ------------------------------------------------------------------ */

export declare function i18nStatus(webRoot: string): I18nStatusReport;
export declare function seoAudit(webRoot: string): SeoAuditReport;
export declare function contractCheck(webRoot: string): ContractCheckReport;
export declare function drawingsCatalog(webRoot: string): DrawingsCatalogReport;
export declare function styleAudit(webRoot: string): StyleAuditReport;
export declare function perfAudit(webRoot: string): PerfAuditReport;
export declare function a11yAudit(webRoot: string): A11yAuditReport;
export declare function securityAudit(webRoot: string): SecurityAuditReport;
export declare function runAllChecks(webRoot: string): AllChecksReport;

export declare function loadTranslations(
  webRoot: string
): Record<string, Record<string, string>>;
export declare function collectReferencedI18nKeys(webRoot: string): string[];
export declare function siteConfig(webRoot: string): {
  contactEndpoint: string;
  contactEmail: string;
};

/* ------------------------------------------------------------------ */
/* i18n write operations (src/lib/i18n-write.mjs)                      */
/* ------------------------------------------------------------------ */

export interface LocaleValues {
  tr: string;
  en: string;
  fr: string;
  it: string;
  de: string;
}

export declare function i18nAddKey(
  webRoot: string,
  key: string,
  values: LocaleValues,
  options?: { overwrite?: boolean }
): { key: string; added: boolean };

export declare function i18nRenameKey(
  webRoot: string,
  oldKey: string,
  newKey: string,
  options?: { updateReferences?: boolean }
): { renamed: boolean; htmlReferences: number; jsReferences: number };

/* ------------------------------------------------------------------ */
/* Agent loop (src/agent/loop.mjs)                                     */
/* ------------------------------------------------------------------ */

export type ModelAlias = "fable" | "opus" | "sonnet" | "haiku";

export interface RunAgentOptions {
  client: unknown;
  task: string;
  model?: string;
  maxTurns?: number;
  allowWrite?: boolean;
  quiet?: boolean;
  history?: unknown[];
}

export interface RunAgentResult {
  turns: number;
  finalText: string;
  stopReason: string;
  messages: unknown[];
}

export declare function runAgent(options: RunAgentOptions): Promise<RunAgentResult>;
export declare function resolveModel(name?: string): string;
export declare const MODEL_ALIASES: Record<ModelAlias, string>;
export declare const DEFAULT_MODEL: string;
