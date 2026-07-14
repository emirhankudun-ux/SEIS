#!/usr/bin/env node

import fs from "node:fs";

const matrixPath = "data/seis-10-year-capability-matrix.json";
const schemaPath = "schemas/seis-10-year-capability-matrix.schema.json";
const documentationPath = "docs/governance/seis-10-year-capability-matrix.md";
const failures = [];

const expectedCategories = [
  {
    id: "github-adoption-signals",
    title: "GitHub adoption and usage signals",
    kind: "adoption",
    labels: ["Stars", "Forks", "Watchers / Subscribers", "Contributors", "Used by", "Dependents", "Downloads", "Release assets", "Clones", "Unique visitors", "Issues", "Pull requests", "Discussions", "Stars/forks ratio"]
  },
  {
    id: "maintenance-and-release",
    title: "Maintenance and release health",
    kind: "maintenance",
    labels: ["Last commit", "Commit frequency", "Latest release", "Release cadence", "Changelog", "Roadmap", "SemVer", "LTS", "Archived", "Maintainer", "Bus factor", "Governance", "CODEOWNERS", "Community health", "Maintenance mode", "Breaking change", "Migration guide"]
  },
  {
    id: "quality-and-engineering",
    title: "Quality and engineering controls",
    kind: "quality",
    labels: ["Unit tests", "Integration tests", "E2E tests", "Test coverage", "CI", "CD", "Lint", "Formatter", "Type checking", "Benchmark", "API contract", "Backward compatibility", "Documentation", "Examples", "Error handling", "Observability", "Performance budget", "Accessibility / A11y", "i18n / l10n"]
  },
  {
    id: "architecture-and-platform",
    title: "Architecture, platform, and AI vocabulary",
    kind: "architecture",
    labels: ["Library", "Framework", "SDK", "CLI", "TUI", "GUI", "API", "REST", "GraphQL", "gRPC", "WebSocket", "Full-stack", "BFF", "Monolith", "Modular monolith", "Microservices", "Serverless", "SaaS", "Self-hosted", "On-premise", "Local-first", "Offline-first", "Sync", "Plugin", "Extension", "MCP", "Provider routing", "Model routing", "RAG", "Vector database", "Agent", "Workflow", "Queue", "Cache", "Rate limit", "RBAC", "Feature flag", "Migration", "Rollback"]
  },
  {
    id: "ecosystem-health-signals",
    title: "Ecosystem health signals",
    kind: "health",
    labels: ["Bakım", "Sürüm", "Lisans", "Güvenlik", "Test", "Katkı", "Dokümantasyon", "Release", "Bağımlılık", "API", "Performans", "Gizlilik", "Kullanım", "Topluluk", "Ürün durumu"]
  }
];

const expectedPhases = new Set(Array.from({ length: 10 }, (_, index) => `SEIS-10Y-Y${String(index + 1).padStart(2, "0")}`));

const matrix = readJson(matrixPath);
const schema = readJson(schemaPath);
const documentation = readText(documentationPath);

requireValue(matrix.schema_version === 1, `${matrixPath} schema_version must be 1`);
requireValue(matrix.id === "seis-10-year-capability-matrix", `${matrixPath} id is invalid`);
requireValue(matrix.status === "active", `${matrixPath} must remain active`);
requireValue(matrix.maturity === "specification", `${matrixPath} must remain specification maturity`);
requireValue(matrix.project === "seis", `${matrixPath} project is invalid`);
requireValue(matrix.anchor_date === "2026-07-14", `${matrixPath} anchor_date is invalid`);
requireValue(matrix.target_date === "2036-07-14", `${matrixPath} target_date is invalid`);
requireValue(matrix.target_horizon_years === 10, `${matrixPath} must target ten years`);
requireValue(matrix.baseline_phase_id === "SEIS-10Y-Y01", `${matrixPath} baseline phase is invalid`);
requireValue(matrix.source_basis?.includes("User-provided goal objective"), `${matrixPath} must identify the user-provided objective source`);
requireValue(JSON.stringify(matrix.lifecycle_states) === JSON.stringify(["specified", "planned", "active", "blocked", "completed", "unavailable", "deprecated"]), `${matrixPath} lifecycle states are invalid`);
requireValue(Array.isArray(matrix.interpretation_rules) && matrix.interpretation_rules.length >= 4, `${matrixPath} interpretation rules are incomplete`);
requireValue(Array.isArray(matrix.non_claims) && matrix.non_claims.length >= 3, `${matrixPath} non-claims are incomplete`);
requireValue(matrix.non_claims.some((claim) => claim.includes("background execution")), `${matrixPath} must preserve the no-background-execution boundary`);

const categories = Array.isArray(matrix.categories) ? matrix.categories : [];
requireValue(JSON.stringify(categories.map((category) => category.id)) === JSON.stringify(expectedCategories.map((category) => category.id)), `${matrixPath} category order is invalid`);
requireValue(matrix.category_count === expectedCategories.length, `${matrixPath} category_count is invalid`);
requireValue(matrix.term_count === expectedCategories.reduce((sum, category) => sum + category.labels.length, 0), `${matrixPath} term_count is invalid`);

const allIds = new Set();
const allLabels = [];
for (const [index, expected] of expectedCategories.entries()) {
  const category = categories[index] || {};
  requireValue(category.title === expected.title, `${category.id || expected.id} title is invalid`);
  requireValue(category.baseline_phase === "SEIS-10Y-Y01", `${expected.id} baseline phase is invalid`);
  requireValue(expectedPhases.has(category.target_phase), `${expected.id} target phase is invalid`);
  requireValue(typeof category.owner_role === "string" && category.owner_role.length > 2, `${expected.id} owner role is missing`);
  requireValue(category.term_count === expected.labels.length, `${expected.id} term_count is invalid`);
  requireValue(Array.isArray(category.evidence_sources) && category.evidence_sources.length > 0, `${expected.id} evidence sources are missing`);
  for (const source of category.evidence_sources || []) {
    requireValue(!source.startsWith("/") && !source.includes(".."), `${expected.id} evidence source must be repo-relative: ${source}`);
    requireValue(fs.existsSync(source), `${expected.id} evidence source is missing: ${source}`);
  }

  const terms = Array.isArray(category.terms) ? category.terms : [];
  const labels = terms.map((term) => term.label);
  requireValue(JSON.stringify(labels) === JSON.stringify(expected.labels), `${expected.id} labels must match the objective term order exactly`);
  for (const term of terms) {
    allLabels.push(term.label);
    requireValue(term.id.startsWith(`${expected.id}-`), `${term.label} must use a category-scoped id`);
    requireValue(!allIds.has(term.id), `duplicate term id: ${term.id}`);
    allIds.add(term.id);
    for (const field of ["label", "status", "maturity", "baseline_phase", "target_phase", "owner_role", "evidence_state", "validation_status", "measurement_scope"]) {
      requireValue(typeof term[field] === "string" && term[field].length > 0, `${term.id} missing required term field: ${field}`);
    }
    requireValue(term.status === "specified", `${term.id} must remain specified`);
    requireValue(term.maturity === "specification", `${term.id} must remain specification maturity`);
    requireValue(term.baseline_phase === "SEIS-10Y-Y01", `${term.id} baseline phase is invalid`);
    requireValue(expectedPhases.has(term.target_phase), `${term.id} target phase is invalid`);
    requireValue(term.evidence_state === "not-collected", `${term.id} evidence state must remain not-collected`);
    requireValue(term.validation_status === "planned", `${term.id} validation status must remain planned`);
    requireValue(JSON.stringify(term.evidence_sources) === JSON.stringify(category.evidence_sources), `${term.id} evidence sources must match its category`);
    requireValue(term.measurement_scope.length >= 30, `${term.id} measurement scope is too short`);
    if (["adoption", "maintenance", "quality"].includes(expected.kind)) {
      for (const field of ["turkish", "meaning", "interpretation"]) requireValue(typeof term[field] === "string" && term[field].length > 1, `${term.id} missing source field: ${field}`);
    } else if (expected.kind === "architecture") {
      for (const field of ["meaning", "when_useful"]) requireValue(typeof term[field] === "string" && term[field].length > 1, `${term.id} missing source field: ${field}`);
    } else {
      for (const field of ["good_signal", "risk_signal"]) requireValue(typeof term[field] === "string" && term[field].length > 1, `${term.id} missing source field: ${field}`);
    }
  }
}

for (const category of expectedCategories) {
  requireValue(documentation.includes(category.title), `${documentationPath} must document ${category.title}`);
  for (const label of category.labels) requireValue(documentation.includes(label), `${documentationPath} must document ${label}`);
}

const inspected = JSON.stringify(matrix) + "\n" + JSON.stringify(schema) + "\n" + documentation;
for (const pattern of [
  /-----BEGIN [A-Z ]+-----/,
  /(?:sk|ghp|github_pat)_[A-Za-z0-9_-]{12,}/,
  /(?:file|vscode|cursor):\/\//,
  /\/Users\//
]) {
  requireValue(!pattern.test(inspected), `${matrixPath} capability artifacts contain a secret-shaped or machine-local value`);
}

if (failures.length > 0) {
  console.error("SEIS 10-year capability matrix check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`SEIS 10-year capability matrix check passed (${categories.length} categories, ${allLabels.length} specified terms, ten-year phase mapping).`);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(`cannot read JSON ${file}: ${error.message}`);
    return {};
  }
}

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    failures.push(`cannot read documentation ${file}: ${error.message}`);
    return "";
  }
}

function requireValue(condition, message) {
  if (!condition) failures.push(message);
}
