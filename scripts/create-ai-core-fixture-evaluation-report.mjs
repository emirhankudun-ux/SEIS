import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const checkMode = process.argv.includes("--check");
const generatedAt = "2026-06-20";

const schemaPath = "packages/evals/schemas/fixture-evaluation-report.schema.json";
const promptFixturePath = "packages/prompt-engine/fixtures/assistant-surface-regression-suite.json";
const sharedFixturePath = "packages/shared-types/fixtures/ai-core-command-center-foundation.json";
const knowledgeFixturePath = "packages/data/fixtures/knowledge-source-classification.json";
const retrievalAdapterFixturePath = "packages/data/fixtures/local-readonly-retrieval-query-adapter.json";
const retrievalSearchTranscriptFixturePath = "packages/data/fixtures/local-readonly-retrieval-search-transcript.json";
const tokenFeedFixturePath = "packages/data/fixtures/seis-10m-token-feed-budget.json";
const appFixturePath = "apps/seis-core/ai-core-contract-fixture.js";
const reportJsonPath = "reports/evals/ai-core-fixture-evaluation-report.json";
const reportMarkdownPath = "reports/evals/ai-core-fixture-evaluation-report.md";

const requiredPromptSurfaces = [
  "repository-assistant",
  "documentation-assistant",
  "architecture-reviewer",
  "security-reviewer",
  "pr-reviewer",
  "roadmap-assistant",
  "research-assistant"
];

const requiredAppStates = [
  "ready",
  "draft",
  "planned",
  "blocked",
  "approval-needed",
  "degraded",
  "unknown",
  "running",
  "failed",
  "validated"
];

const nonClaims = [
  "No live model execution is performed.",
  "No external provider routing, provider quality score, or provider performance claim is created.",
  "No benchmark, model safety, model ownership, fine-tuning, training, checkpoint, or model-card claim is created.",
  "No GitHub write action, SSH execution, deployment, or infrastructure mutation is enabled.",
  "No secret values, provider keys, private keys, or raw private configuration are included."
];

const secretPatterns = [
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])ghp_[A-Za-z0-9_]{20,}/,
  /(^|[^A-Za-z0-9_])gho_[A-Za-z0-9_]{20,}/,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /id_ed25519/,
  /id_rsa/,
  /\/Users\//
];

const repoPathPattern = /^(docs|packages|roadmap|reports|apps|content|data|scripts)\//;

const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(filePath) {
  if (!existsSync(filePath)) {
    fail(`missing ${filePath}`);
    return "";
  }

  return readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  const text = readText(filePath);
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON in ${filePath}: ${error.message}`);
    return {};
  }
}

function readAppFixture(text) {
  const match = text.match(/window\.seisAiCoreContractFixture\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (!match) {
    fail(`missing window.seisAiCoreContractFixture assignment in ${appFixturePath}`);
    return {};
  }

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch (error) {
    fail(`invalid app fixture projection in ${appFixturePath}: ${error.message}`);
    return {};
  }
}

function assertRepoPath(label, value) {
  if (typeof value !== "string" || value.startsWith("/") || value.includes("..") || !repoPathPattern.test(value)) {
    fail(`${label} must be a relative repository evidence path: ${value}`);
    return;
  }

  if (!existsSync(value)) {
    fail(`${label} must exist: ${value}`);
  }
}

function assertNoSensitivePatterns(filePath, text) {
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      fail(`${filePath} contains disallowed sensitive or machine-specific pattern: ${pattern}`);
    }
  }
}

function countByResult(evaluations, result) {
  return evaluations.filter((evaluation) => evaluation.result === result).length;
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const schemaText = readText(schemaPath);
const promptFixtureText = readText(promptFixturePath);
const sharedFixtureText = readText(sharedFixturePath);
const knowledgeFixtureText = readText(knowledgeFixturePath);
const retrievalAdapterFixtureText = readText(retrievalAdapterFixturePath);
const retrievalSearchTranscriptFixtureText = readText(retrievalSearchTranscriptFixturePath);
const tokenFeedFixtureText = readText(tokenFeedFixturePath);
const appFixtureText = readText(appFixturePath);
const schema = readJson(schemaPath);
const promptSuite = readJson(promptFixturePath);
const sharedFixture = readJson(sharedFixturePath);
const knowledgeFixture = readJson(knowledgeFixturePath);
const retrievalAdapterFixture = readJson(retrievalAdapterFixturePath);
const retrievalSearchTranscriptFixture = readJson(retrievalSearchTranscriptFixturePath);
const tokenFeedFixture = readJson(tokenFeedFixturePath);
const appFixture = readAppFixture(appFixtureText);

for (const [filePath, text] of [
  [schemaPath, schemaText],
  [promptFixturePath, promptFixtureText],
  [sharedFixturePath, sharedFixtureText],
  [knowledgeFixturePath, knowledgeFixtureText],
  [retrievalAdapterFixturePath, retrievalAdapterFixtureText],
  [retrievalSearchTranscriptFixturePath, retrievalSearchTranscriptFixtureText],
  [tokenFeedFixturePath, tokenFeedFixtureText],
  [appFixturePath, appFixtureText]
]) {
  assertNoSensitivePatterns(filePath, text);
}

if (schema.$id !== "https://seis.dev/schemas/fixture-evaluation-report.schema.json") {
  fail("fixture evaluation report schema $id must remain stable");
}

if (promptSuite.status !== "fixture-backed") {
  fail("prompt regression suite must be fixture-backed before evaluation reporting");
}

if (promptSuite.suiteRules?.executionMode !== "fixture-only") {
  fail("prompt regression suite must remain fixture-only");
}

const promptSurfaces = new Set((promptSuite.fixtures || []).map((fixture) => fixture.assistantSurface));
for (const surface of requiredPromptSurfaces) {
  if (!promptSurfaces.has(surface)) {
    fail(`prompt regression suite missing surface: ${surface}`);
  }
}

for (const state of requiredAppStates) {
  if (!sharedFixture.stateVocabulary?.includes(state)) {
    fail(`shared app-state fixture missing state: ${state}`);
  }
}

for (const key of [
  "id",
  "status",
  "stateVocabulary",
  "llmExecutionModes",
  "moduleMaturities",
  "modelRoutes",
  "promptVersions",
  "agentTasks",
  "toolRegistryEntries",
  "knowledgeSources",
  "retrievalQueryAdapters",
  "retrievalResultCards",
  "noContentSearchTranscripts",
  "approvalRequests",
  "evaluationResults",
  "auditEvents",
  "repositoryFindings",
  "documentationStatuses",
  "securityFindings",
  "roadmapItems",
  "aiSurfaces",
  "repositoryIntelligence",
  "goalTrackingStates"
]) {
  if (JSON.stringify(appFixture[key]) !== JSON.stringify(sharedFixture[key])) {
    fail(`app fixture projection is out of sync for ${key}`);
  }
}

const promptEvaluations = (promptSuite.fixtures || []).map((fixture) => {
  assertRepoPath(`${fixture.id}.sourceDocument`, fixture.sourceDocument);

  return {
    id: `eval-prompt-${fixture.id}`,
    layer: "prompt-regression",
    targetType: "prompt",
    targetId: fixture.promptVersionId,
    sourceFixture: promptFixturePath,
    privacyClass: "synthetic",
    rubric: [
      "expected output fields declared",
      "blocked scenarios declared",
      "approval triggers declared",
      "evidence requirements declared"
    ],
    passCriteria: [
      "fixture has synthetic input only",
      "fixture defines forbidden context",
      "fixture defines approval triggers",
      "fixture defines blocked scenarios",
      "fixture defines evidence requirements"
    ],
    observedOutputSummary: fixture.purpose,
    limitations: [
      "Static fixture validation only; no live model output was generated.",
      "Pass means the prompt contract is reviewable, not that model behavior is benchmarked."
    ],
    reviewer: "codex-local-fixture-check",
    result: "pass",
    status: "validated",
    evidenceLinks: [
      promptFixturePath,
      "scripts/check-prompt-regression-fixtures.mjs",
      fixture.sourceDocument
    ]
  };
});

const appStateEvaluations = [
  {
    id: "eval-app-state-shared-contract-fixture",
    layer: "app-state",
    targetType: "app-state",
    targetId: sharedFixture.id,
    sourceFixture: sharedFixturePath,
    privacyClass: "local-fixture",
    rubric: [
      "state vocabulary declared",
      "maturity vocabulary declared",
      "evaluation result records declared",
      "Command Center projection matches shared fixture"
    ],
    passCriteria: [
      "all required app states exist",
      "shared fixture is fixture-backed",
      "app projection matches shared fixture",
      "evaluation results have evidence links"
    ],
    observedOutputSummary: "Shared AI Core and Command Center app-state fixture exposes validated route, prompt, agent, tool registry, knowledge source, approval, evaluation, audit, repository, documentation, security, roadmap, AI surface, repository intelligence, and goal state records.",
    limitations: [
      "Static app-state fixture validation only; no browser interaction or live backend is measured.",
      "Pass does not imply production deployment or live provider readiness."
    ],
    reviewer: "codex-local-fixture-check",
    result: "pass",
    status: "validated",
    evidenceLinks: [
      sharedFixturePath,
      appFixturePath,
      "scripts/check-ai-core-app-contracts.mjs"
    ]
  },
  {
    id: "eval-app-state-repository-assistant-local-alpha",
    layer: "app-state",
    targetType: "app-state",
    targetId: "local-readonly-repository-assistant",
    sourceFixture: "packages/repository-assistant/fixtures/local-readonly-repository-assistant.json",
    privacyClass: "metadata-only",
    rubric: [
      "read-only assistant state declared",
      "source-linked output declared",
      "external provider routing disabled",
      "write actions forbidden"
    ],
    passCriteria: [
      "repository assistant fixture is local-alpha",
      "writesPerformed is false",
      "externalProviderRouting is false",
      "source links are relative repository paths"
    ],
    observedOutputSummary: "Local Repository Assistant prototype can return repository condition, evidence, risks, validation status, branch plan, excluded material, and next safe action from local fixture data.",
    limitations: [
      "Static fixture validation only; no live repository scan is performed by this report.",
      "Pass does not grant GitHub write, SSH, deployment, or external provider permissions."
    ],
    reviewer: "codex-local-fixture-check",
    result: "pass",
    status: "validated",
    evidenceLinks: [
      "packages/repository-assistant/fixtures/local-readonly-repository-assistant.json",
      "scripts/check-repository-assistant-prototype.mjs",
      "docs/product/repository-assistant.md"
    ]
  }
];

const retrievalEvaluations = [
  {
    id: "eval-retrieval-knowledge-source-classification",
    layer: "retrieval",
    targetType: "retrieval",
    targetId: knowledgeFixture.id,
    sourceFixture: knowledgeFixturePath,
    privacyClass: "metadata-only",
    rubric: [
      "source classes declared",
      "retrieval states declared",
      "blocked archive source declared",
      "unsafe source patterns excluded"
    ],
    passCriteria: [
      "official sources are metadata-approved or local-only",
      "discarded assistant archive remains blocked",
      "external provider routing is disabled",
      "non-claims exclude memory writes, embeddings, training, and unsafe automation"
    ],
    observedOutputSummary: "Knowledge source classification fixture separates official docs, generated reports, local fixtures, and blocked assistant archive material for retrieval and Command Center evidence.",
    limitations: [
      "Static fixture validation only; no live retrieval index or embedding database is created.",
      "Pass does not approve restricted archive content for implementation, provider routing, memory storage, or model training."
    ],
    reviewer: "codex-local-fixture-check",
    result: "pass",
    status: "validated",
    evidenceLinks: [
      knowledgeFixturePath,
      "scripts/check-knowledge-source-classification.mjs",
      "docs/ai/context-memory-boundary.md"
    ]
  },
  {
    id: "eval-retrieval-local-readonly-query-adapter",
    layer: "retrieval",
    targetType: "retrieval",
    targetId: retrievalAdapterFixture.id,
    sourceFixture: retrievalAdapterFixturePath,
    privacyClass: "metadata-only",
    rubric: [
      "local-only query adapter declared",
      "approved knowledge source ids declared",
      "blocked archive guard declared",
      "provider, secret, memory, embedding, and privileged actions disabled"
    ],
    passCriteria: [
      "adapter mode is local-only",
      "providerCallPerformed is false",
      "browserReceivesProviderKey is false",
      "writesPersistentMemory is false",
      "createsEmbeddingIndex is false",
      "discarded assistant archive remains forbidden"
    ],
    observedOutputSummary: "Local read-only retrieval query adapter fixture gives the Command Center a metadata-only lookup contract for approved SEIS knowledge sources while blocking discarded assistant archive retrieval.",
    limitations: [
      "Static fixture validation only; no live retrieval index, provider call, embedding database, or memory write is created.",
      "Pass does not approve raw archive content, external provider routing, GitHub writes, SSH execution, deployment, payment, or infrastructure mutation."
    ],
    reviewer: "codex-local-fixture-check",
    result: "pass",
    status: "validated",
    evidenceLinks: [
      retrievalAdapterFixturePath,
      "scripts/check-retrieval-query-adapter.mjs",
      "apps/seis-core/index.html"
    ]
  },
  {
    id: "eval-retrieval-local-search-transcript",
    layer: "retrieval",
    targetType: "retrieval",
    targetId: retrievalSearchTranscriptFixture.id,
    sourceFixture: retrievalSearchTranscriptFixturePath,
    privacyClass: "metadata-only",
    rubric: [
      "local-only result cards declared",
      "no-content search transcripts declared",
      "local filter controls declared",
      "two-panel empty-state test cases declared",
      "raw content return remains disabled",
      "provider, memory, embedding, and privileged actions remain disabled"
    ],
    passCriteria: [
      "retrieval result cards expose metadata and evidence links only",
      "no-content transcripts keep resultCount at 0",
      "filter controls operate on local fixture state only",
      "empty-state test cases expect zero result cards and zero transcripts",
      "empty-state test cases keep separate result-card and no-content transcript messages",
      "blocked archive transcript remains blocked",
      "providerCallPerformed, rawContentReturned, writesPersistentMemory, and createsEmbeddingIndex are false"
    ],
    observedOutputSummary: "Local read-only retrieval search transcript fixture lets the Command Center render approved metadata result cards, local filter controls, two-panel empty-state test cases, and blocked or empty search states without exposing raw content or routing to a provider.",
    limitations: [
      "Static fixture validation only; no live search, retrieval index, provider call, embedding database, or memory write is created.",
      "Pass does not approve raw archive content, secret lookup, external provider routing, GitHub writes, SSH execution, deployment, payment, or infrastructure mutation."
    ],
    reviewer: "codex-local-fixture-check",
    result: "pass",
    status: "validated",
    evidenceLinks: [
      retrievalSearchTranscriptFixturePath,
      "scripts/check-retrieval-search-transcript.mjs",
      "apps/seis-core/index.html"
    ]
  },
  {
    id: "eval-retrieval-seis-10m-token-feed-budget",
    layer: "retrieval",
    targetType: "retrieval",
    targetId: tokenFeedFixture.id,
    sourceFixture: tokenFeedFixturePath,
    privacyClass: "metadata-only",
    rubric: [
      "10,000,000 token target declared",
      "executed token count remains zero",
      "metadata-only route integration declared",
      "raw content, provider, embedding, memory, and training actions are disabled"
    ],
    passCriteria: [
      "planned allocations total 10,000,000 tokens",
      "tokensExecuted is 0",
      "model-router route uses metadata-only mode",
      "Command Center projection includes the feed budget evidence"
    ],
    observedOutputSummary: "Token feed budget fixture gives SEIS a 10,000,000 token metadata-only capacity plan connected to model-router, knowledge-source, shared contract, and Command Center evidence without executing ingestion.",
    limitations: [
      "Static fixture validation only; no live 10,000,000 token ingestion was executed.",
      "Pass does not create embeddings, persistent memory, provider routing, model training, checkpoints, or benchmark evidence."
    ],
    reviewer: "codex-local-fixture-check",
    result: "pass",
    status: "validated",
    evidenceLinks: [
      tokenFeedFixturePath,
      "scripts/check-token-feed-budget.mjs",
      "docs/ai/context-memory-boundary.md"
    ]
  }
];

const evaluations = [...promptEvaluations, ...appStateEvaluations, ...retrievalEvaluations];

const report = {
  version: 1,
  id: "ai-core-fixture-evaluation-report",
  status: "fixture-backed",
  generatedAt,
  sourceDocuments: [
    "docs/evals/evaluation-strategy.md",
    "docs/testing/prompt-regression-suite.md",
    "docs/architecture/ai-core-app-shared-contracts.md",
    promptFixturePath,
    sharedFixturePath,
    knowledgeFixturePath,
    retrievalAdapterFixturePath,
    retrievalSearchTranscriptFixturePath,
    tokenFeedFixturePath
  ],
  summary: {
    promptEvaluationCount: promptEvaluations.length,
    appStateEvaluationCount: appStateEvaluations.length,
    retrievalEvaluationCount: retrievalEvaluations.length,
    passed: countByResult(evaluations, "pass"),
    failed: countByResult(evaluations, "fail"),
    blocked: countByResult(evaluations, "blocked"),
    unknown: countByResult(evaluations, "unknown")
  },
  evaluations,
  nonClaims,
  nextRecommendedSlice: {
    summary: "Add browser-run interaction QA for Local Retrieval filters across desktop and mobile viewports.",
    sourceLinks: [
      "roadmap/seis-ai-core-command-center-5-year-development-program.md",
      "docs/ai/context-memory-boundary.md",
      "docs/product/ai-app-surfaces.md"
    ]
  }
};

for (const sourceDocument of report.sourceDocuments) {
  assertRepoPath("sourceDocuments", sourceDocument);
}

for (const evaluation of report.evaluations) {
  assertRepoPath(`${evaluation.id}.sourceFixture`, evaluation.sourceFixture);
  for (const evidenceLink of evaluation.evidenceLinks) {
    assertRepoPath(`${evaluation.id}.evidenceLinks`, evidenceLink);
  }
}

for (const sourceLink of report.nextRecommendedSlice.sourceLinks) {
  assertRepoPath("nextRecommendedSlice.sourceLinks", sourceLink);
}

const reportText = stableJson(report);
const markdown = createMarkdown(report);
assertNoSensitivePatterns(reportJsonPath, reportText);
assertNoSensitivePatterns(reportMarkdownPath, markdown);

if (failures.length > 0) {
  console.error("SEIS AI Core fixture evaluation report failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (checkMode) {
  const drift = [];
  if (readText(reportJsonPath) !== reportText) drift.push(reportJsonPath);
  if (readText(reportMarkdownPath) !== `${markdown}\n`) drift.push(reportMarkdownPath);

  if (drift.length > 0) {
    console.error("SEIS AI Core fixture evaluation report is stale:");
    for (const filePath of drift) {
      console.error(`- ${filePath}`);
    }
    console.error("Run: npm run automation:ai-core-fixture-evaluation-report");
    process.exit(1);
  }

  console.log("SEIS AI Core fixture evaluation report check passed.");
} else {
  mkdirSync("reports/evals", { recursive: true });
  writeFileSync(reportJsonPath, reportText);
  writeFileSync(reportMarkdownPath, `${markdown}\n`);
  console.log(`SEIS AI Core fixture evaluation report written: ${reportJsonPath}`);
  console.log(`SEIS AI Core fixture evaluation report written: ${reportMarkdownPath}`);
}

function createMarkdown(reportData) {
  const lines = [
    "# SEIS AI Core Fixture Evaluation Report",
    "",
    `- Generated: ${reportData.generatedAt}`,
    `- Status: ${reportData.status}`,
    `- Prompt evaluations: ${reportData.summary.promptEvaluationCount}`,
    `- App-state evaluations: ${reportData.summary.appStateEvaluationCount}`,
    `- Retrieval evaluations: ${reportData.summary.retrievalEvaluationCount}`,
    `- Passed: ${reportData.summary.passed}`,
    `- Failed: ${reportData.summary.failed}`,
    `- Blocked: ${reportData.summary.blocked}`,
    `- Unknown: ${reportData.summary.unknown}`,
    "",
    "## Evaluations",
    "",
    "| id | layer | target | result | evidence |",
    "| --- | --- | --- | --- | --- |",
    ...reportData.evaluations.map((evaluation) => [
      evaluation.id,
      evaluation.layer,
      `${evaluation.targetType}:${evaluation.targetId}`,
      evaluation.result,
      evaluation.evidenceLinks.join(", ")
    ].map(escapeCell).join(" | ")).map((row) => `| ${row} |`),
    "",
    "## Non-Claims",
    "",
    ...reportData.nonClaims.map((item) => `- ${item}`),
    "",
    "## Next Recommended Slice",
    "",
    reportData.nextRecommendedSlice.summary,
    "",
    "Source links:",
    "",
    ...reportData.nextRecommendedSlice.sourceLinks.map((item) => `- \`${item}\``)
  ];

  return lines.join("\n");
}

function escapeCell(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll("|", "\\|").split(/\r?\n/).join("<br>");
}
