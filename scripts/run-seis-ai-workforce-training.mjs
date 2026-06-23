#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  buildAgentRouterModelArtifact,
  loadAgentRouterDataset
} from "../packages/seis-ai/src/model/agent-router-lab.mjs";
import {
  buildEvalCriticModelArtifact,
  loadEvalCriticDataset
} from "../packages/seis-ai/src/model/eval-critic-lab.mjs";
import {
  buildMemoryRankerModelArtifact,
  loadMemoryRankerDataset
} from "../packages/seis-ai/src/model/memory-ranker-lab.mjs";
import {
  buildPermissionPolicyModelArtifact,
  loadPermissionPolicyDataset
} from "../packages/seis-ai/src/model/permission-policy-lab.mjs";
import {
  buildSeisModelBenchmarkArtifact,
  validateSeisModelBenchmarkArtifact
} from "../packages/seis-ai/src/model/model-benchmark-suite.mjs";
import {
  buildSeisModelFamilyRegistry,
  validateSeisModelFamilyRegistry
} from "../packages/seis-ai/src/model/model-family-registry.mjs";
import {
  buildSeisModelPromotionPolicy,
  validateSeisModelPromotionPolicy
} from "../packages/seis-ai/src/model/model-promotion-policy.mjs";

const root = process.cwd();
const generatedAt = new Date().toISOString();
const planPath = "content/development/seis-ai-workforce-training-plan.json";
const plan = readJson(planPath);

const modelBuilders = [
  {
    id: "permission-policy",
    datasetPath: "packages/seis-ai/data/permission-policy-seed.json",
    artifactPath: "packages/seis-ai/models/permission-policy-seed-v0.json",
    loadDataset: loadPermissionPolicyDataset,
    buildArtifact: buildPermissionPolicyModelArtifact
  },
  {
    id: "memory-ranker",
    datasetPath: "packages/seis-ai/data/memory-ranker-seed-v0.json",
    artifactPath: "packages/seis-ai/models/memory-ranker-seed-v0.json",
    loadDataset: loadMemoryRankerDataset,
    buildArtifact: buildMemoryRankerModelArtifact
  },
  {
    id: "eval-critic",
    datasetPath: "packages/seis-ai/data/eval-critic-seed-v0.json",
    artifactPath: "packages/seis-ai/models/eval-critic-seed-v0.json",
    loadDataset: loadEvalCriticDataset,
    buildArtifact: buildEvalCriticModelArtifact
  },
  {
    id: "agent-router",
    datasetPath: "packages/seis-ai/data/agent-router-seed-v0.json",
    artifactPath: "packages/seis-ai/models/agent-router-seed-v0.json",
    loadDataset: loadAgentRouterDataset,
    buildArtifact: buildAgentRouterModelArtifact
  }
];

const modelReports = [];
for (const builder of modelBuilders) {
  const dataset = builder.loadDataset(path.join(root, builder.datasetPath));
  const artifact = builder.buildArtifact(dataset);
  writeJson(builder.artifactPath, artifact);
  modelReports.push({
    id: builder.id,
    datasetPath: builder.datasetPath,
    artifactPath: builder.artifactPath,
    datasetId: artifact.dataset?.datasetId,
    trainingCaseCount: artifact.model?.trainingCaseCount,
    evalOk: artifact.eval?.eval?.ok === true,
    evalTotal: artifact.eval?.eval?.total || 0,
    evalPassed: artifact.eval?.eval?.passed ?? artifact.eval?.eval?.passedTop1 ?? 0
  });
}

const registry = buildSeisModelFamilyRegistry(root);
const registryValidation = validateSeisModelFamilyRegistry(registry, root);
if (!registryValidation.ok) {
  fail("SEIS model family registry generation failed", registryValidation.failures);
}
writeJson("packages/seis-ai/models/seis-model-family-registry.json", registry);

const benchmark = buildSeisModelBenchmarkArtifact(root);
const benchmarkValidation = validateSeisModelBenchmarkArtifact(benchmark, root);
if (!benchmarkValidation.ok) {
  fail("SEIS model benchmark suite generation failed", benchmarkValidation.failures);
}
writeJson("packages/seis-ai/models/seis-model-benchmark-suite.json", benchmark);

const promotionPolicy = buildSeisModelPromotionPolicy(root);
const promotionValidation = validateSeisModelPromotionPolicy(promotionPolicy, root);
if (!promotionValidation.ok) {
  fail("SEIS model promotion policy generation failed", promotionValidation.failures);
}
writeJson("packages/seis-ai/models/seis-model-promotion-policy.json", promotionPolicy);

const report = {
  id: "seis-ai-workforce-training-run",
  generatedAt,
  plan: {
    id: plan.id,
    version: plan.version,
    status: plan.status,
    source: planPath
  },
  boundary: {
    mode: "local-deterministic-seed-training",
    liveProviderCalls: false,
    credentialRead: false,
    cloudFineTuning: false,
    datasetDownload: false,
    runtimeAuthorityGranted: false
  },
  installedAiWorkforce: summarizeTrainerRoles(plan.trainerRoles || []),
  modelReports,
  registry: {
    registryId: registry.registryId,
    modelCount: registry.totals.modelCount,
    datasetCount: registry.totals.datasetCount
  },
  benchmark: {
    artifactId: benchmark.artifactId,
    caseCount: benchmark.totals.caseCount,
    passed: benchmark.totals.passed,
    failed: benchmark.totals.failed,
    ok: benchmark.totals.ok
  },
  promotionPolicy: {
    policyId: promotionPolicy.policyId,
    modelCount: promotionPolicy.totals.modelCount,
    labReadyCount: promotionPolicy.totals.labReadyCount,
    benchmarkReadyCount: promotionPolicy.totals.benchmarkReadyCount,
    runtimeAuthorityCount: promotionPolicy.totals.runtimeAuthorityCount,
    productionBlockedCount: promotionPolicy.totals.productionBlockedCount
  },
  nextHumanApprovalNeeded: [
    "live provider prompt calls",
    "cloud fine-tuning",
    "external dataset download",
    "paid benchmark run",
    "SSH or deployment",
    "model publication or runtime authority"
  ]
};

writeJson("reports/seis-ai-workforce-training/latest.json", report);
writeText("reports/seis-ai-workforce-training/latest.md", renderMarkdown(report));

console.log("SEIS AI workforce training run completed.");
console.log(JSON.stringify({
  report: "reports/seis-ai-workforce-training/latest.json",
  modelCount: report.modelReports.length,
  benchmarkOk: report.benchmark.ok,
  runtimeAuthorityCount: report.promotionPolicy.runtimeAuthorityCount
}, null, 2));

function summarizeTrainerRoles(roles) {
  const installed = roles.filter((role) => role.routeStatus === "installed").map((role) => role.id);
  const disabled = roles.filter((role) => role.routeStatus !== "installed").map((role) => role.id);

  return {
    installed,
    disabled,
    acceptedContributionMode: "candidate-only-until-codex-validation",
    liveProviderCalls: false,
    externalTrainingAllowed: false
  };
}

function renderMarkdown(data) {
  const modelRows = data.modelReports
    .map((model) => `| ${model.id} | ${model.trainingCaseCount} | ${model.evalPassed}/${model.evalTotal} | ${model.artifactPath} |`)
    .join("\n");

  return `# SEIS AI Workforce Training Run

Generated: ${data.generatedAt}

## Boundary

- Mode: ${data.boundary.mode}
- Live provider calls: ${data.boundary.liveProviderCalls}
- Credential read: ${data.boundary.credentialRead}
- Cloud fine-tuning: ${data.boundary.cloudFineTuning}
- Dataset download: ${data.boundary.datasetDownload}
- Runtime authority granted: ${data.boundary.runtimeAuthorityGranted}

## Installed AI Workforce

- Installed routes: ${data.installedAiWorkforce.installed.join(", ")}
- Disabled or missing-key routes: ${data.installedAiWorkforce.disabled.join(", ")}
- Contribution mode: ${data.installedAiWorkforce.acceptedContributionMode}

## Local Seed Models

| Model | Training cases | Eval passed | Artifact |
| --- | ---: | ---: | --- |
${modelRows}

## Benchmark

- Artifact: ${data.benchmark.artifactId}
- Passed: ${data.benchmark.passed}/${data.benchmark.caseCount}
- Failed: ${data.benchmark.failed}

## Promotion Policy

- Policy: ${data.promotionPolicy.policyId}
- Lab-ready models: ${data.promotionPolicy.labReadyCount}/${data.promotionPolicy.modelCount}
- Benchmark-ready models: ${data.promotionPolicy.benchmarkReadyCount}/${data.promotionPolicy.modelCount}
- Runtime authority count: ${data.promotionPolicy.runtimeAuthorityCount}
- Production-blocked models: ${data.promotionPolicy.productionBlockedCount}/${data.promotionPolicy.modelCount}

## Human Approval Needed

${data.nextHumanApprovalNeeded.map((item) => `- ${item}`).join("\n")}
`;
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  const filePath = path.join(root, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const filePath = path.join(root, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, value);
}

function fail(message, details) {
  console.error(message);
  for (const detail of details) {
    console.error(`- ${detail}`);
  }
  process.exit(1);
}
