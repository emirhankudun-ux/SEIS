#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { assertNoCredentialLikeManifestContent } from '../packages/seis-ai/src/lib/plugin-integration.mjs';

const root = process.cwd();
const failures = [];

const paths = {
  plan: 'content/development/seis-frontier-training-launch-plan.json',
  profile: 'content/development/seis-model-scaling-hardware-profile.json',
  ladder: 'content/development/seis-model-parameter-ladder.json',
  policy: 'content/development/seis-model-frontier-escalation-policy.json',
  frontier150b: 'content/development/seis-150b-frontier-model-program.json',
  apex512b: 'content/development/seis-512b-apex-model-program.json',
  council: 'content/development/seis-model-scaling-subagent-council.json',
  agiEvaluation: 'content/development/seis-agi-evaluation-protocol.json',
  modelCard: 'content/development/seis-20b-model-card-template.json',
  datasetCard: 'content/development/seis-20b-dataset-card-template.json',
  mcpContract: 'content/development/seis-ai-core-mcp-runtime-contract.json',
  helper: 'packages/seis-ai/src/lib/plugin-integration.mjs',
  agentTools: 'packages/seis-ai/src/agent/tools.mjs',
  mcpServer: 'packages/seis-ai/src/mcp/server.mjs',
  agentTests: 'packages/seis-ai/test/agent.test.mjs',
  mcpTests: 'packages/seis-ai/test/mcp-smoke.test.mjs',
  trainingDoc: 'docs/ai/model-training-execution.md',
  checkpointDoc: 'docs/ai/checkpoint-governance.md',
  localModelDoc: 'docs/ai/local-model-strategy.md',
  providerRoutingDoc: 'docs/ai/provider-routing-policy.md',
  universeResearchDoc: 'docs/ai/seis-universe-research.md',
  modelRoadmapDoc: 'docs/ai/model-development-roadmap.md',
  fineTuningDoc: 'docs/ai/fine-tuning-strategy.md',
  modelCardDoc: 'docs/ai/model-card-template.md',
  evaluationDoc: 'docs/evals/evaluation-strategy.md',
  benchmarkIntegrityDoc: 'docs/evals/benchmark-integrity.md',
  providerDataPolicyDoc: 'docs/security/model-provider-data-policy.md',
  foundationReview: 'docs/reviews/SEIS_AI_MODEL_APPLICATION_REVIEW.md',
  scalingDoc: 'docs/ai/seis-model-scaling.md',
  aiCoreDoc: 'docs/ai/seis-ai-core.md',
  statusDoc: 'docs/STATUS.md',
  docsIndex: 'docs/INDEX.md',
  nextPrQueue: 'docs/roadmap/NEXT_PR_QUEUE.md',
  packageJson: 'package.json',
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const plan = readJson(paths.plan, 'frontier training launch plan');
const profile = readJson(paths.profile, 'model scaling profile');
const ladder = readJson(paths.ladder, 'model parameter ladder');
const frontier150b = readJson(paths.frontier150b, '150B frontier program');
const apex512b = readJson(paths.apex512b, '512B apex program');
const council = readJson(paths.council, 'model scaling council');
const mcpContract = readJson(paths.mcpContract, 'MCP runtime contract');
const packageJson = readJson(paths.packageJson, 'package.json');

const helper = readText(paths.helper);
const agentTools = readText(paths.agentTools);
const mcpServer = readText(paths.mcpServer);
const agentTests = readText(paths.agentTests);
const mcpTests = readText(paths.mcpTests);
const trainingDoc = readText(paths.trainingDoc);
const checkpointDoc = readText(paths.checkpointDoc);
const scalingDoc = readText(paths.scalingDoc);
const aiCoreDoc = readText(paths.aiCoreDoc);
const statusDoc = readText(paths.statusDoc);
const nextPrQueue = readText(paths.nextPrQueue);
const docsIndex = readText(paths.docsIndex);
const foundationDocs = [
  [readText(paths.localModelDoc), 'local model strategy'],
  [readText(paths.providerRoutingDoc), 'provider routing policy'],
  [readText(paths.universeResearchDoc), 'SEIS Universe research'],
  [readText(paths.modelRoadmapDoc), 'model development roadmap'],
  [readText(paths.fineTuningDoc), 'fine-tuning strategy'],
  [readText(paths.modelCardDoc), 'model card template'],
  [readText(paths.evaluationDoc), 'evaluation strategy'],
  [readText(paths.benchmarkIntegrityDoc), 'benchmark integrity'],
  [readText(paths.providerDataPolicyDoc), 'provider data policy'],
  [readText(paths.foundationReview), 'AI model application review'],
];

if (plan) {
  ensure(plan.id === 'seis-frontier-training-launch-plan', 'plan id mismatch');
  ensure(plan.version === '2026.07.11', 'plan version mismatch');
  ensure(
    plan.status === 'preflight-only-not-authorized',
    'plan must remain preflight-only-not-authorized',
  );
  ensure(
    plan.resourceUri === 'seis://ai/frontier-training-launch-plan.json',
    'plan resource URI mismatch',
  );
  ensure(
    plan.qualityGate === 'npm run check:seis-frontier-training-launch-plan',
    'plan quality gate mismatch',
  );
  ensure(plan.coreCredentialRequirement === 'none', 'plan must require no credentials');
  ensure(plan.executionMode === 'dry-run-only', 'plan execution mode must remain dry-run-only');
  ensure(plan.trainingAuthorized === false, 'plan must not authorize training');
  ensure(plan.externalJobAuthorized === false, 'plan must not authorize remote jobs');
  ensure(plan.routeEligibleToday === false, 'plan must not be route eligible');
  ensure(plan.runtimeAuthority === false, 'plan must not grant runtime authority');
  ensure(plan.checkpointExists === false, 'plan must not claim a checkpoint');
  ensure(plan.benchmarkEvidenceAvailable === false, 'plan must not claim benchmark evidence');
  ensure(plan.agiClaimAllowed === false, 'plan must not allow AGI claims');
  ensure(
    String(plan.truthBoundary || '').includes('does not download'),
    'truth boundary must forbid downloads',
  );
  ensure(
    String(plan.truthBoundary || '').includes('submit a remote job'),
    'truth boundary must forbid remote jobs',
  );
  ensure(
    String(plan.truthBoundary || '').includes('demonstrate AGI'),
    'truth boundary must forbid AGI claims',
  );

  ensureArrayIncludesAll(
    Object.values(plan.sourceOfTruth || {}),
    [
      paths.profile,
      paths.ladder,
      paths.policy,
      paths.frontier150b,
      paths.apex512b,
      paths.council,
      paths.agiEvaluation,
      paths.modelCard,
      paths.datasetCard,
      paths.checkpointDoc,
      paths.trainingDoc,
      paths.localModelDoc,
      paths.providerRoutingDoc,
      paths.universeResearchDoc,
      paths.modelRoadmapDoc,
      paths.fineTuningDoc,
      paths.modelCardDoc,
      paths.evaluationDoc,
      paths.benchmarkIntegrityDoc,
      paths.providerDataPolicyDoc,
      paths.foundationReview,
    ],
    'plan.sourceOfTruth',
  );

  const sourceIds = (plan.officialResearchBaseline || []).map(source => source.id);
  ensureArrayIncludesAll(
    sourceIds,
    [
      'hugging-face-trl-sft',
      'hugging-face-trl-dpo',
      'hugging-face-jobs',
      'pytorch-fsdp2',
      'nvidia-megatron-core-parallelism',
      'nist-ai-risk-management-framework',
      'nist-generative-ai-profile-ai-600-1',
    ],
    'plan.officialResearchBaseline',
  );
  const allowedResearchHosts = new Set([
    'huggingface.co',
    'docs.pytorch.org',
    'docs.nvidia.com',
    'www.nist.gov',
    'nvlpubs.nist.gov',
  ]);
  for (const source of plan.officialResearchBaseline || []) {
    ensureNonEmpty(source.seisUse, `${source.id}.seisUse`);
    try {
      const url = new URL(source.url);
      ensure(url.protocol === 'https:', `${source.id}.url must use HTTPS`);
      ensure(
        allowedResearchHosts.has(url.hostname),
        `${source.id}.url must use an approved primary-source host`,
      );
    } catch (error) {
      failures.push(`${source.id}.url is invalid: ${error.message}`);
    }
  }

  const methodIds = (plan.methodBoundaries || []).map(method => method.id);
  ensureArrayIncludesAll(
    methodIds,
    ['pretraining', 'sft', 'dpo', 'lora-adapter', 'retrieval-or-prompting'],
    'plan.methodBoundaries',
  );
  ensure(
    (plan.methodBoundaries || []).every(method => method.ownershipClaimAllowedToday === false),
    'method boundaries must not allow ownership claims',
  );

  ensure(
    (plan.globalLaunchGates || []).length >= 8,
    'plan must define at least eight global launch gates',
  );
  ensure(
    (plan.globalLaunchGates || []).every(gate => gate.requiredBeforeLaunch === true),
    'all global gates must be required',
  );
  ensure(
    (plan.globalLaunchGates || []).every(gate => gate.status === 'missing'),
    'all global gates must remain missing until evidence exists',
  );

  const requiredAgents = [
    'architect-agent',
    'code-agent',
    'design-agent',
    'ui-ux-agent',
    'research-agent',
    'search-agent',
    'security-agent',
    'devops-agent',
    'documentation-agent',
    'qa-agent',
    'cloud-agent',
    'automation-agent',
  ];
  ensureArrayIncludesAll(
    plan.installedAiCouncil?.requiredAgentIds,
    requiredAgents,
    'plan.installedAiCouncil.requiredAgentIds',
  );
  ensure(
    plan.installedAiCouncil?.runtimeAuthority === false,
    'installed AI council must not have runtime authority',
  );
  ensure(
    plan.installedAiCouncil?.selfApprovalAllowed === false,
    'installed AI council must not self-approve',
  );
  ensure(
    plan.installedAiCouncil?.reviewState === 'not-recorded',
    'council review must remain not-recorded',
  );

  const lanes = Array.isArray(plan.lanes) ? plan.lanes : [];
  ensure(lanes.length === 5, 'plan must define exactly five launch lanes');
  ensureArrayEquals(
    lanes.map(lane => lane.parameterClass),
    ['20B', '70B', '150B', '300B+', '512B'],
    'plan.lanes parameter order',
  );
  for (const lane of lanes) {
    ensure(lane.launchDecision === 'deny', `${lane.id}.launchDecision must be deny`);
    ensure(lane.trainingAuthorized === false, `${lane.id}.trainingAuthorized must be false`);
    ensure(lane.routeEligibleToday === false, `${lane.id}.routeEligibleToday must be false`);
    ensure(lane.runtimeAuthority === false, `${lane.id}.runtimeAuthority must be false`);
    ensure(
      Array.isArray(lane.blockedBy) && lane.blockedBy.length >= 5,
      `${lane.id}.blockedBy must explain missing evidence`,
    );
    ensure(lane.evidence?.datasetManifest === null, `${lane.id} must not claim a dataset manifest`);
    ensure(lane.evidence?.runManifest === null, `${lane.id} must not claim a run manifest`);
    ensure(
      Array.isArray(lane.evidence?.trainingLogs) && lane.evidence.trainingLogs.length === 0,
      `${lane.id} must not claim training logs`,
    );
    ensure(
      Array.isArray(lane.evidence?.checkpoints) && lane.evidence.checkpoints.length === 0,
      `${lane.id} must not claim checkpoints`,
    );
    ensure(
      Array.isArray(lane.evidence?.evaluationReports) &&
        lane.evidence.evaluationReports.length === 0,
      `${lane.id} must not claim evaluation reports`,
    );
    ensure(lane.evidence?.approvalRecord === null, `${lane.id} must not claim approval`);
  }
  ensure(
    String(lanes[0]?.localRamBoundary || '').includes('not sufficient'),
    '20B lane must state that 16GB+ is not sufficient for full training',
  );
  ensure(
    lanes[4]?.agiCapabilityStatus === 'not-demonstrated',
    '512B AGI capability must remain not-demonstrated',
  );

  ensure(plan.decisionPolicy?.defaultDecision === 'deny', 'default decision must be deny');
  ensure(plan.decisionPolicy?.failClosed === true, 'decision policy must fail closed');
  ensure(
    plan.decisionPolicy?.manualFinalApprovalRequired === true,
    'manual final approval must be required',
  );
  ensure(
    plan.decisionPolicy?.silentProviderFallbackAllowed === false,
    'silent provider fallback must be forbidden',
  );
  ensure(
    plan.secretBoundary?.secretsAllowedInPlan === false,
    'secrets must be forbidden in the plan',
  );
  ensure(
    plan.secretBoundary?.credentialValuesAllowedInLogs === false,
    'credential values must be forbidden in logs',
  );
  ensure(
    plan.secretBoundary?.browserStorageAllowed === false,
    'browser secret storage must be forbidden',
  );

  const zeroEvidenceFields = [
    'authorizedTrainingRuns',
    'completedTrainingRuns',
    'acceptedCheckpoints',
    'acceptedBenchmarkReports',
    'acceptedAgiEvaluations',
    'recordedCouncilReviews',
    'activeHumanApprovals',
  ];
  ensure(plan.evidenceCounts?.laneCount === 5, 'evidenceCounts.laneCount must be five');
  for (const field of zeroEvidenceFields)
    ensure(plan.evidenceCounts?.[field] === 0, `evidenceCounts.${field} must remain zero`);

  ensureArrayIncludesAll(
    plan.humanApprovalRequiredFor,
    [
      'model download',
      'dataset download',
      'provider authentication',
      'paid GPU or cloud provisioning',
      'training job submission',
      'fine-tuning job submission',
      'benchmark execution',
      'checkpoint publication',
      'route eligibility change',
      'SSH execution',
      'deployment',
      'GitHub push or pull request creation',
      'AGI claim',
    ],
    'plan.humanApprovalRequiredFor',
  );

  const serialized = JSON.stringify(plan);
  try {
    assertNoCredentialLikeManifestContent(serialized, plan);
  } catch (error) {
    failures.push(error.message);
  }
}

if (profile) {
  ensure(
    profile.sourceOfTruth?.frontierTrainingLaunchPlan === paths.plan,
    'model scaling profile must link the launch plan',
  );
}

if (ladder) {
  ensure(ladder.routeEligibleToday === false, 'parameter ladder must remain route-ineligible');
  ensure(
    (ladder.targets || []).every(target => target.trainingStatus === 'not-started'),
    'parameter ladder must not claim training started',
  );
}

if (frontier150b) {
  ensure(frontier150b.trainingStatus === 'not-started', '150B training must remain not-started');
  ensure(frontier150b.routeEligibleToday === false, '150B route must remain blocked');
}

if (apex512b) {
  ensure(
    apex512b.sourceOfTruth?.frontierTrainingLaunchPlan === paths.plan,
    '512B program must link the launch plan',
  );
  ensure(apex512b.trainingStatus === 'not-started', '512B training must remain not-started');
  ensure(apex512b.routeEligibleToday === false, '512B route must remain blocked');
}

if (council) {
  ensureArrayIncludesAll(
    (council.agents || []).map(agent => agent.id),
    plan?.installedAiCouncil?.requiredAgentIds || [],
    'council agent ids',
  );
  ensure(
    (council.agents || []).every(agent => agent.authority === 'plan-only'),
    'all council agents must remain plan-only',
  );
}

if (mcpContract) {
  ensure(mcpContract.toolCount === 36, 'MCP toolCount must be 36');
  ensure(mcpContract.resourceCount === 31, 'MCP resourceCount must be 31');
  ensure(
    (mcpContract.surfaces || []).find(surface => surface.id === 'tools')?.count === 36,
    'MCP tool surface count must be 36',
  );
  ensure(
    (mcpContract.surfaces || []).find(surface => surface.id === 'resources')?.count === 31,
    'MCP resource surface count must be 31',
  );
  ensure(
    String(
      (mcpContract.surfaces || []).find(surface => surface.id === 'resources')?.evidence || '',
    ).includes('frontier training launch plan'),
    'MCP resource evidence must mention the launch plan',
  );
}

ensure(
  helper.includes('seis_ai_core_frontier_training_status'),
  'AI Core helper must define the frontier training status tool',
);
ensure(
  agentTools.includes('AI_CORE_FRONTIER_TRAINING_STATUS_TOOL'),
  'agent tools must reference the frontier training status tool constant',
);
ensure(
  mcpServer.includes('AI_CORE_FRONTIER_TRAINING_STATUS_TOOL'),
  'MCP server must reference the frontier training status tool constant',
);
ensure(
  agentTests.includes('seis_ai_core_frontier_training_status'),
  'agent tests must reference the frontier training status tool',
);
ensure(
  mcpTests.includes('seis_ai_core_frontier_training_status'),
  'MCP smoke tests must reference the frontier training status tool',
);
ensure(
  helper.includes('resolveInside(repoRoot, relativePath)'),
  'AI Core helper must keep manifest-controlled JSON reads inside the repository',
);
ensure(
  helper.includes('status: "invalid-fail-closed"'),
  'AI Core helper must expose an invalid-fail-closed runtime state',
);
for (const marker of ['github_pat_', 'AKIA', 'AIza', 'Bearer']) {
  ensure(helper.includes(marker), `AI Core credential scanner missing ${marker} coverage`);
}
for (const marker of [
  'trainingAuthorized must be false',
  'blocked credential field: token',
  'council source path is not allowlisted',
]) {
  ensure(agentTests.includes(marker), `agent negative tests missing ${marker}`);
}
ensure(
  mcpServer.includes('aiCoreFrontierTrainingStatus(repoRoot, { includeFullPlan: true })') &&
    mcpServer.includes('if (!status.ok) throw new Error'),
  'MCP resource must use the fail-closed runtime-validated launch plan reader',
);

for (const [text, label] of [
  [mcpServer, 'MCP server'],
  [mcpTests, 'MCP smoke tests'],
  [trainingDoc, 'training execution docs'],
  [scalingDoc, 'model scaling docs'],
  [aiCoreDoc, 'AI Core docs'],
]) {
  ensure(
    text.includes('seis://ai/frontier-training-launch-plan.json'),
    `${label} must reference the launch plan resource URI`,
  );
}

for (const [text, label] of foundationDocs) {
  ensure(text.includes(paths.plan), `${label} must reference the launch plan source`);
}

for (const relativePath of [
  paths.localModelDoc,
  paths.providerRoutingDoc,
  paths.universeResearchDoc,
  paths.modelRoadmapDoc,
  paths.fineTuningDoc,
  paths.modelCardDoc,
  paths.trainingDoc,
  paths.checkpointDoc,
  paths.evaluationDoc,
  paths.benchmarkIntegrityDoc,
  paths.providerDataPolicyDoc,
  paths.foundationReview,
]) {
  ensure(
    docsIndex.includes(relativePath.replace('docs/', '')),
    `docs index missing ${relativePath}`,
  );
}

for (const [text, label] of [
  [trainingDoc, 'training execution docs'],
  [checkpointDoc, 'checkpoint governance docs'],
  [scalingDoc, 'model scaling docs'],
  [aiCoreDoc, 'AI Core docs'],
  [statusDoc, 'status docs'],
  [nextPrQueue, 'next PR queue'],
]) {
  ensure(
    text.includes('seis-frontier-training-launch-plan'),
    `${label} must reference the launch plan`,
  );
}

if (packageJson) {
  ensure(
    packageJson.scripts?.['check:seis-frontier-training-launch-plan'] ===
      'node scripts/check-seis-frontier-training-launch-plan.mjs',
    'package check script mismatch',
  );
  ensure(
    String(packageJson.scripts?.['quality:governance'] || '').includes(
      'check:seis-frontier-training-launch-plan',
    ),
    'quality:governance must include the launch plan gate',
  );
}

finish('SEIS frontier training launch plan check passed.');

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!relativePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile())
    failures.push(`${label} missing: ${relativePath}`);
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function ensureArrayEquals(candidate, expected, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  ensure(JSON.stringify(candidate) === JSON.stringify(expected), `${label} mismatch`);
}

function ensureNonEmpty(value, label) {
  ensure(
    typeof value === 'string' && value.trim().length > 0,
    `${label} must be a non-empty string`,
  );
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8');
}

function finish(message) {
  if (failures.length) {
    console.error('SEIS frontier training launch plan check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}
