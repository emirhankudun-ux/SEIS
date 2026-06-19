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
  missing: { selector: string; kind: 'id' | 'class' }[];
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
  | 'all'
  | 'i18n'
  | 'seo'
  | 'contract'
  | 'drawings'
  | 'style'
  | 'perf'
  | 'a11y'
  | 'security';

export type ScopedReport<S extends CheckScope> = S extends 'all'
  ? AllChecksReport
  : S extends 'i18n'
    ? I18nStatusReport
    : S extends 'seo'
      ? SeoAuditReport
      : S extends 'contract'
        ? ContractCheckReport
        : S extends 'drawings'
          ? DrawingsCatalogReport
          : S extends 'style'
            ? StyleAuditReport
            : S extends 'perf'
              ? PerfAuditReport
              : S extends 'a11y'
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

export declare function loadTranslations(webRoot: string): Record<string, Record<string, string>>;
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
  options?: { overwrite?: boolean },
): { key: string; added: boolean };

export declare function i18nRenameKey(
  webRoot: string,
  oldKey: string,
  newKey: string,
  options?: { updateReferences?: boolean },
): { renamed: boolean; htmlReferences: number; jsReferences: number };

/* ------------------------------------------------------------------ */
/* Agent loop (src/agent/loop.mjs)                                     */
/* ------------------------------------------------------------------ */

export type ModelAlias = 'fable' | 'opus' | 'sonnet' | 'haiku';

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

/* ------------------------------------------------------------------ */
/* SEIS Universe seed model surfaces                                   */
/* ------------------------------------------------------------------ */

export type PermissionDecision = 'allow' | 'gate' | 'approval_required' | 'deny';

export interface PermissionAction {
  intent?: string;
  command?: string;
  path?: string;
  summary?: string;
  evidence?: string[];
  capabilities?: string[];
  externalWrite?: boolean;
  workspace?: string;
}

export interface PermissionPolicyResult {
  decision: PermissionDecision;
  reasons: string[];
  capabilities: string[];
  workspace: string;
}

export interface PermissionPolicyEvalCase {
  id: string;
  expected: PermissionDecision;
  action: PermissionAction;
}

export interface PermissionPolicyEvalReport {
  ok: boolean;
  total: number;
  passed: number;
  failed: {
    id: string;
    expected: PermissionDecision;
    actual: PermissionDecision;
    ok: boolean;
    reasons: string[];
  }[];
  results: {
    id: string;
    expected: PermissionDecision;
    actual: PermissionDecision;
    ok: boolean;
    reasons: string[];
  }[];
}

export declare const PERMISSION_DECISIONS: Readonly<{
  allow: 'allow';
  gate: 'gate';
  approvalRequired: 'approval_required';
  deny: 'deny';
}>;

export declare function classifyPermissionAction(action: PermissionAction): PermissionPolicyResult;
export declare function runPermissionPolicyEval(
  cases: PermissionPolicyEvalCase[],
): PermissionPolicyEvalReport;

export type PermissionPolicyDatasetSplit = 'train' | 'eval';

export interface PermissionPolicyDatasetCase {
  id: string;
  split: PermissionPolicyDatasetSplit;
  expected: PermissionDecision;
  action: PermissionAction;
}

export interface PermissionPolicyDataset {
  datasetId: 'seis-permission-policy-seed-eval';
  version: string;
  owner: string;
  sourceClass: string;
  license: string;
  consent: string;
  cases: PermissionPolicyDatasetCase[];
}

export interface PermissionPolicyLearnedModel {
  modelId: string;
  modelFamily: 'seis-permission-policy';
  version: string;
  datasetId: string;
  trainingCaseCount: number;
  labels: PermissionDecision[];
  priors: Record<PermissionDecision, number>;
  features: string[];
  classFeatureWeights: Record<PermissionDecision, Record<string, number>>;
  safetyFloor: string;
}

export interface PermissionPolicyPrediction {
  decision: PermissionDecision;
  learnedDecision: PermissionDecision;
  safetyDecision: PermissionDecision;
  safetyAdjusted: boolean;
  scores: Record<PermissionDecision, number>;
  features: string[];
}

export interface PermissionPolicyModelEvalReport {
  ok: boolean;
  total: number;
  passed: number;
  learnedPassed: number;
  safetyAdjusted: number;
  failed: {
    id: string;
    split: PermissionPolicyDatasetSplit;
    expected: PermissionDecision;
    actual: PermissionDecision;
    learnedDecision: PermissionDecision;
    safetyDecision: PermissionDecision;
    ok: boolean;
    learnedOk: boolean;
    safetyAdjusted: boolean;
  }[];
  results: {
    id: string;
    split: PermissionPolicyDatasetSplit;
    expected: PermissionDecision;
    actual: PermissionDecision;
    learnedDecision: PermissionDecision;
    safetyDecision: PermissionDecision;
    ok: boolean;
    learnedOk: boolean;
    safetyAdjusted: boolean;
  }[];
}

export interface PermissionPolicyModelArtifact {
  artifactId: string;
  artifactType: string;
  dataset: {
    datasetId: string;
    version: string;
    sourceClass: string;
    consent: string;
  };
  model: PermissionPolicyLearnedModel;
  eval: {
    train: Omit<PermissionPolicyModelEvalReport, 'results'>;
    eval: Omit<PermissionPolicyModelEvalReport, 'results'>;
  };
}

export declare function loadPermissionPolicyDataset(datasetPath: string): PermissionPolicyDataset;
export declare function trainPermissionPolicyModel(
  dataset: PermissionPolicyDataset,
): PermissionPolicyLearnedModel;
export declare function extractPermissionFeatures(action: PermissionAction): string[];
export declare function predictPermissionPolicyAction(
  model: PermissionPolicyLearnedModel,
  action: PermissionAction,
  options?: { enforceSafetyFloor?: boolean },
): PermissionPolicyPrediction;
export declare function runPermissionPolicyModelEval(
  model: PermissionPolicyLearnedModel,
  cases: PermissionPolicyDatasetCase[],
  options?: { enforceSafetyFloor?: boolean },
): PermissionPolicyModelEvalReport;
export declare function buildPermissionPolicyModelArtifact(
  dataset: PermissionPolicyDataset,
): PermissionPolicyModelArtifact;

/* ------------------------------------------------------------------ */
/* Memory-ranker lab surfaces                                          */
/* ------------------------------------------------------------------ */

export type MemoryRankerSplit = 'train' | 'eval';

export interface MemoryRankerDocument {
  id: string;
  title: string;
  summary: string;
  topics?: string[];
  source?: string;
}

export interface MemoryRankerQuery {
  id: string;
  text: string;
}

export interface MemoryRankerCase {
  id: string;
  split: MemoryRankerSplit;
  query: MemoryRankerQuery;
  candidates: MemoryRankerDocument[];
  expectedOrder: string[];
}

export interface MemoryRankerDataset {
  datasetId: string;
  version: string;
  owner: string;
  sourceClass: string;
  license: string;
  consent: string;
  cases: MemoryRankerCase[];
}

export interface MemoryRankerCandidateProfile {
  title: string;
  source: string;
  terms: string[];
}

export interface MemoryRankerModel {
  modelId: string;
  modelFamily: 'seis-memory-ranker';
  version: string;
  datasetId: string;
  trainingCaseCount: number;
  vocabulary: string[];
  candidateProfiles: Record<string, MemoryRankerCandidateProfile>;
  candidateWeights: Record<string, Record<string, number>>;
  candidatePrior: Record<string, number>;
  queryWeights: Record<string, number>;
}

export interface MemoryRankerMatch {
  candidateId: string;
  title: string;
  score: number;
  matchedTerms: string[];
  matchedTermCount: number;
}

export interface MemoryRankerRankingReport {
  query: MemoryRankerQuery | { id: string; text: string };
  topK: number;
  ranking: MemoryRankerMatch[];
  queryTerms: string[];
  candidateCount: number;
}

export interface MemoryRankerModelEvalReport {
  ok: boolean;
  top1Accuracy: number;
  averageReciprocalRank: number;
  total: number;
  passedTop1: number;
  results: {
    id: string;
    split: MemoryRankerSplit;
    expected: string;
    predicted: string | null;
    topKPredicted: string[];
    passedTop1: boolean;
    precisionAtK: number;
    reciprocalRank: number;
  }[];
  failed: {
    id: string;
    split: MemoryRankerSplit;
    expected: string;
    actual: string | null;
    topKPredicted: string[];
    top1Accuracy: number;
  }[];
}

export interface MemoryRankerArtifact {
  artifactId: string;
  artifactType: string;
  dataset: {
    datasetId: string;
    version: string;
    sourceClass: string;
    consent: string;
  };
  model: MemoryRankerModel;
  eval: {
    train: Omit<MemoryRankerModelEvalReport, 'results' | 'failed'>;
    eval: Omit<MemoryRankerModelEvalReport, 'results' | 'failed'>;
  };
}

export declare function loadMemoryRankerDataset(datasetPath: string): MemoryRankerDataset;
export declare function trainMemoryRankerModel(dataset: MemoryRankerDataset): MemoryRankerModel;
export declare function rankMemoryCandidates(
  model: MemoryRankerModel,
  query: string | MemoryRankerQuery,
  candidates: MemoryRankerDocument[],
  options?: { topK?: number },
): MemoryRankerRankingReport;
export declare function runMemoryRankerModelEval(
  model: MemoryRankerModel,
  cases: MemoryRankerCase[],
): MemoryRankerModelEvalReport;
export declare function buildMemoryRankerModelArtifact(dataset: MemoryRankerDataset): MemoryRankerArtifact;

/* ------------------------------------------------------------------ */
/* Eval-critic lab surfaces                                            */
/* ------------------------------------------------------------------ */

export type EvalCriticDecision = 'pass' | 'revise' | 'block';
export type EvalCriticSplit = 'train' | 'eval';

export interface EvalCriticValidationItem {
  command: string;
  status: 'passed' | 'failed';
}

export interface EvalCriticReview {
  goal?: string;
  summary?: string;
  changeSummary?: string;
  evidence?: string[];
  sources?: string[];
  validation?: EvalCriticValidationItem[];
  risks?: string[];
  findings?: string[];
  rollback?: string;
  security?: {
    redaction?: 'passed' | 'failed';
  };
  rawOutput?: string;
  releaseClaim?: boolean;
  highRisk?: boolean;
  humanApproval?: boolean;
  touchedProduction?: boolean;
}

export interface EvalCriticCase {
  id: string;
  split: EvalCriticSplit;
  expected: EvalCriticDecision;
  review: EvalCriticReview;
}

export interface EvalCriticDataset {
  datasetId: 'seis-eval-critic-seed-v0';
  version: string;
  owner: string;
  sourceClass: string;
  license: string;
  consent: string;
  cases: EvalCriticCase[];
}

export interface EvalCriticModel {
  modelId: string;
  modelFamily: 'seis-eval-critic';
  version: string;
  datasetId: string;
  trainingCaseCount: number;
  labels: EvalCriticDecision[];
  priors: Record<EvalCriticDecision, number>;
  features: string[];
  classFeatureWeights: Record<EvalCriticDecision, Record<string, number>>;
  safetyFloor: string;
}

export interface EvalCriticPrediction {
  decision: EvalCriticDecision;
  learnedDecision: EvalCriticDecision;
  safetyDecision: EvalCriticDecision;
  safetyAdjusted: boolean;
  scores: Record<EvalCriticDecision, number>;
  features: string[];
  reasons: string[];
}

export interface EvalCriticModelEvalReport {
  ok: boolean;
  total: number;
  passed: number;
  learnedPassed: number;
  safetyAdjusted: number;
  failed: {
    id: string;
    split: EvalCriticSplit;
    expected: EvalCriticDecision;
    actual: EvalCriticDecision;
    learnedDecision: EvalCriticDecision;
    safetyDecision: EvalCriticDecision;
    ok: boolean;
    learnedOk: boolean;
    safetyAdjusted: boolean;
    reasons: string[];
  }[];
  results: {
    id: string;
    split: EvalCriticSplit;
    expected: EvalCriticDecision;
    actual: EvalCriticDecision;
    learnedDecision: EvalCriticDecision;
    safetyDecision: EvalCriticDecision;
    ok: boolean;
    learnedOk: boolean;
    safetyAdjusted: boolean;
    reasons: string[];
  }[];
}

export interface EvalCriticArtifact {
  artifactId: string;
  artifactType: string;
  dataset: {
    datasetId: string;
    version: string;
    sourceClass: string;
    consent: string;
  };
  model: EvalCriticModel;
  eval: {
    train: Omit<EvalCriticModelEvalReport, 'results'>;
    eval: Omit<EvalCriticModelEvalReport, 'results'>;
  };
}

export declare const EVAL_CRITIC_DECISIONS: Readonly<{
  pass: 'pass';
  revise: 'revise';
  block: 'block';
}>;

export declare function loadEvalCriticDataset(datasetPath: string): EvalCriticDataset;
export declare function trainEvalCriticModel(dataset: EvalCriticDataset): EvalCriticModel;
export declare function extractEvalCriticFeatures(review: EvalCriticReview): string[];
export declare function predictEvalCriticReview(
  model: EvalCriticModel,
  review: EvalCriticReview,
  options?: { enforceSafetyFloor?: boolean },
): EvalCriticPrediction;
export declare function runEvalCriticModelEval(
  model: EvalCriticModel,
  cases: EvalCriticCase[],
  options?: { enforceSafetyFloor?: boolean },
): EvalCriticModelEvalReport;
export declare function buildEvalCriticModelArtifact(dataset: EvalCriticDataset): EvalCriticArtifact;
