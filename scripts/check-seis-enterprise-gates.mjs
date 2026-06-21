#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const argsSet = new Set(args);
const gateArg = [...argsSet].find((arg) => arg.startsWith("--gate="));
let requestedGate = gateArg ? gateArg.split("=")[1] : "all";
if (requestedGate === "all" && argsSet.has("--gate")) {
  const gateIndex = args.indexOf("--gate");
  const nextGate = args[gateIndex + 1];
  if (nextGate && !nextGate.startsWith("--")) {
    requestedGate = nextGate;
  }
}

const validGates = new Set(["all", "quality", "security", "ai"]);
if (!validGates.has(requestedGate)) {
  console.error(`Unknown gate: ${requestedGate}`);
  process.exit(1);
}

const failures = [];

const files = {
  manifest: "docs/governance/seis-architecture-manifesto.md",
  manifestRoot: "goals/architecture.md",
  architectureMap: "docs/architecture/seis-5-layer-operating-map.md",
  qualityGates: "docs/governance/quality-gates.md",
  qualityGatesRoot: "governance/quality-gates.md",
  enterpriseGates: "docs/governance/enterprise-change-gates.md",
  enterpriseGatesRoot: "governance/enterprise-change-gates.md",
  longHorizonBlueprint: "roadmap/seis-18-60-month-long-horizon-ops-blueprint.md",
  aiPolicy: "docs/ai/policy.md",
  aiPolicyRoot: "ai/policy.md",
  adr2: "docs/decisions/adr-0002-seis-5-layer-operating-manifesto.md",
  adr3: "docs/decisions/adr-0003-seis-evolutionary-governance-throttle.md",
  adr4: "docs/decisions/adr-0004-seis-next-steps-implementation-pack.md",
  roadmap: "roadmap/seis-90-day-blueprint.md",
  securityWorkflow: ".github/workflows/security-guardian.yml",
  codeqlWorkflow: ".github/workflows/codeql.yml",
  gateWorkflow: ".github/workflows/seis-system-gates.yml",
  prTemplate: ".github/PULL_REQUEST_TEMPLATE.md",
};

const checks = {
  foundation: [
    { file: files.manifest, token: "# SEIS 5-Layer Architecture Manifesto", label: "manifest header missing" },
    { file: files.manifestRoot, token: "# SEIS Master Operating Architecture", label: "root manifesto header missing" },
    { file: files.architectureMap, token: "# SEIS 5-Layer Operating Map", label: "operating map header missing" },
    { file: files.qualityGates, token: "# Kurumsal Kalite Kapıları (Quality + Security + AI)", label: "quality gates header missing" },
    { file: files.qualityGatesRoot, token: "# SEIS Quality + Security + AI Gates (Operasyonel Görev Seti)", label: "root quality gates header missing" },
    { file: files.aiPolicy, token: "# SEIS AI Policy", label: "AI policy header missing" },
    { file: files.aiPolicyRoot, token: "# SEIS AI Policy", label: "root AI policy header missing" },
    { file: files.adr2, token: "# ADR 0002:", label: "ADR 0002 header missing" },
    { file: files.adr3, token: "# ADR 0003:", label: "ADR 0003 header missing" },
    { file: files.adr4, token: "# ADR 0004: SEIS Next Steps Implementation Pack", label: "ADR 0004 next steps implementation record missing" },
    { file: files.longHorizonBlueprint, token: "# SEIS 18-60 Aylık Uzun Vade Operasyon BluePrinti", label: "long horizon blueprint header missing" },
    { file: files.enterpriseGates, token: "# Kurumsal Değişiklik Kapıları", label: "enterprise gate header missing" },
    { file: files.enterpriseGatesRoot, token: ["# SEIS Kurumsal Değişiklik Kapıları", "# Kurumsal Değişiklik Kapıları", "# SEIS Kurumsal Değişiklik Kapıları (Zorunlu 4 Kapı)"], label: "root enterprise gate header missing" },
    { file: files.roadmap, token: "# SEIS 30/90 Gün Uygulanabilir Blueprint", label: "90 day blueprint missing" },
  ],
  quality: [
    { file: files.qualityGates, token: "## Kalite Kapısı", label: "Quality gate section missing" },
    { file: files.qualityGates, token: "## Kurumsal 4 Kapı (Her Değişiklik)", label: "Institutional gate section missing" },
    { file: files.qualityGates, token: "npm run check:workspace", label: "Quality gate must require workspace check" },
    { file: files.qualityGates, token: "npm run seis:check", label: "Quality gate must require seis:check" },
    { file: files.qualityGates, token: "### Doğrulama Metrikleri Kapısı", label: "Institutional validation gate missing" },
    { file: files.qualityGates, token: "npm run check:seis-enterprise-gates:quality", label: "CI quality gate binding missing" },
    { file: files.qualityGates, token: "Uzun Vadeli Kapı Rejimi", label: "Long-horizon throttle not described in quality gates" },
    { file: files.qualityGates, token: "D1", label: "Long-horizon throttle levels missing (D1/D2/D3)" },
    { file: files.prTemplate, token: "## Seçtiğiniz Kapılar (Zorunlu 4 Kapı)", label: "PR template missing enterprise gate section" },
    { file: files.qualityGatesRoot, token: "## Kapı 1 — Kalite", label: "root quality gates missing Kalite section" },
    { file: files.qualityGatesRoot, token: "## Kapı 2 — Güvenlik", label: "root quality gates missing Güvenlik section" },
    { file: files.qualityGatesRoot, token: ["## Kapı 3 — AI", "## Kapı 3 — AI Kapısı"], label: "root quality gates missing AI section" },
    { file: files.qualityGatesRoot, token: "npm run check:seis-enterprise-gates:quality", label: "CI quality binding missing in root quality gates file" },
  ],
  security: [
    { file: "SECURITY.md", token: "Do not open a public issue for a vulnerability", label: "SECURITY.md has missing vulnerability reporting policy" },
    { file: files.securityWorkflow, token: "gitleaks detect", label: "security workflow missing gitleaks invocation" },
    { file: files.codeqlWorkflow, token: "github/codeql-action/analyze", label: "CodeQL analyze step missing" },
    { file: files.qualityGates, token: "## Güvenlik Kapısı", label: "Security gate section missing" },
    { file: files.qualityGatesRoot, token: ["## Kapı 2 — Güvenlik", "## Kapı 2 — Güvenlik Kapısı"], label: "root quality gates missing security section" },
    { file: files.qualityGates, token: "npm run check:seis-enterprise-gates:security", label: "CI security gate binding missing" },
    { file: files.qualityGates, token: "### Güvenlik Kapısı", label: "Institutional security gate heading missing" },
    { file: files.qualityGatesRoot, token: "npm run check:seis-enterprise-gates:security", label: "CI security binding missing in root quality gates file" },
  ],
  ai: [
    { file: files.aiPolicy, token: "## Scope", label: "AI policy scope missing" },
    { file: files.aiPolicy, token: "## Policy Enforcement", label: "AI policy enforcement section missing" },
    { file: files.aiPolicyRoot, token: "## Policy Kuralları", label: "root AI policy enforcement section missing" },
    { file: files.aiPolicyRoot, token: ["## Teknik Entegrasyon", "## Entegrasyon"], label: "root AI policy integration section missing" },
    { file: files.aiPolicyRoot, token: "policyVersion", label: "root AI policy required field missing" },
    { file: files.qualityGates, token: "## AI Kapısı", label: "AI gate section missing" },
    { file: files.qualityGates, token: "npm run check:seis-enterprise-gates:ai", label: "CI AI gate binding missing" },
    { file: files.qualityGatesRoot, token: ["## Kapı 3 — AI", "## AI Kapısı", "## Kapı 3 — AI Kapısı"], label: "root quality gates missing AI section" },
    { file: files.qualityGatesRoot, token: "npm run check:seis-enterprise-gates:ai", label: "CI AI binding missing in root quality gates file" },
    { file: "package.json", token: "\"check:llm-orchestration-policy\"", label: "package.json must expose llm orchestration check" },
  ],
};

const enterpriseGateChecks = [
  { file: files.enterpriseGates, token: "## Kapı 1 — Doğrulama Metrikleri Kapısı", label: "enterprise gate: validation gate missing" },
  { file: files.enterpriseGates, token: "## Kapı 2 — Güvenlik Kapısı", label: "enterprise gate: security gate missing" },
  { file: files.enterpriseGates, token: "## Kapı 3 — Dokümantasyon Kapısı", label: "enterprise gate: docs gate missing" },
  { file: files.enterpriseGates, token: "## Kapı 4 — Rollback Kapısı", label: "enterprise gate: rollback gate missing" },
  { file: files.enterpriseGates, token: "Değişiklik Değerlendirme Formu", label: "enterprise gate: mandatory change form missing" },
  { file: files.enterpriseGates, token: "## Uzun Vade Dönüşüm Kuralı", label: "enterprise gate: long-term evolution throttle missing" },
  { file: files.enterpriseGatesRoot, token: ["## Kapı 1 — Doğrulama Metrikleri", "## Kapı 1 — Doğrulama Metrikleri Kapısı"], label: "root enterprise gate: validation gate missing" },
  { file: files.enterpriseGatesRoot, token: ["## Kapı 2 — Güvenlik", "## Kapı 2 — Güvenlik Kapısı"], label: "root enterprise gate: security gate missing" },
  { file: files.enterpriseGatesRoot, token: ["## Kapı 3 — Dokümantasyon", "## Kapı 3 — Dokümantasyon Kapısı"], label: "root enterprise gate: docs gate missing" },
  { file: files.enterpriseGatesRoot, token: ["## Kapı 4 — Rollback", "## Kapı 4 — Rollback Kapısı"], label: "root enterprise gate: rollback gate missing" },
  { file: files.enterpriseGatesRoot, token: "Değişiklik Değerlendirme Formu", label: "root enterprise gate: mandatory change form missing" },
  { file: files.enterpriseGatesRoot, token: "## Uzun Vade Dönüşüm Kuralı", label: "root enterprise gate: long-term evolution throttle missing" },
];

runChecks("foundation");
if (requestedGate === "all" || requestedGate === "quality") {
  runChecks("quality");
}
if (requestedGate === "all" || requestedGate === "security") {
  runChecks("security");
}
if (requestedGate === "all" || requestedGate === "ai") {
  runChecks("ai");
}
if (requestedGate === "all" || requestedGate === "quality" || requestedGate === "security" || requestedGate === "ai") {
  runListChecks(enterpriseGateChecks);
}

if (requestedGate === "quality" || requestedGate === "security" || requestedGate === "ai" || requestedGate === "all") {
  assertExists(files.gateWorkflow, `Missing workflow ${files.gateWorkflow}`);
  const workflowText = read(files.gateWorkflow);
  const expectedSteps = requestedGate === "all"
    ? [
        "npm run check:seis-enterprise-gates:quality",
        "npm run check:seis-enterprise-gates:security",
        "npm run check:seis-enterprise-gates:ai",
      ]
    : [`npm run check:seis-enterprise-gates:${requestedGate}`];
  for (const step of expectedSteps) {
    if (!workflowText.includes(step)) {
      failures.push(`${files.gateWorkflow} must include "${step}" run`);
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS enterprise gate check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEIS enterprise gate check passed (${requestedGate}).`);

function runChecks(key) {
  const list = checks[key] || [];
  for (const check of list) {
    const content = read(check.file);
    const missing = isMissing(content, check.token);
    if (missing) {
      failures.push(`${check.file}: ${check.label}`);
    }
  }
}

function runListChecks(list) {
  for (const check of list) {
    const content = read(check.file);
    if (isMissing(content, check.token)) {
      failures.push(`${check.file}: ${check.label}`);
    }
  }
}

function isMissing(content, token) {
  if (Array.isArray(token)) {
    return !token.some((value) => content.includes(value));
  }
  return !content.includes(token);
}

function read(filePath) {
  const fullPath = path.join(root, filePath);
  if (!existsSync(fullPath)) {
    failures.push(`Missing file: ${filePath}`);
    return "";
  }
  return readFileSync(fullPath, "utf8");
}

function assertExists(filePath, message) {
  if (!existsSync(path.join(root, filePath))) {
    failures.push(message);
  }
}
