#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);

const registryPath = "content/development/seis-language-model-intake-registry.json";
const hardwareProfilePath = "content/development/seis-model-scaling-hardware-profile.json";

const localRuntimeProfiles = {
  llama: {
    localFallback: "Ollama/GGUF quantized 4-bit target first",
    suggestedCommands: [
      "ollama pull llama3.1:3b-instruct-q4_0",
      "ollama pull llama3.1:8b-instruct-q4_0"
    ]
  },
  qwen: {
    localFallback: "Ollama quantized 4-bit local route",
    suggestedCommands: [
      "ollama pull qwen2.5:7b-instruct-q4_0",
      "ollama pull qwen2.5:14b-instruct-q4_0"
    ]
  },
  gemma: {
    localFallback: "Ollama/Transformers quantized local fallback",
    suggestedCommands: [
      "ollama pull gemma3:4b-instruct-q4_0",
      "ollama pull gemma2:2b-instruct-q4_0"
    ]
  },
  mistral: {
    localFallback: "Ollama quantized local fallback",
    suggestedCommands: [
      "ollama pull mistral:7b-instruct-v0.2-q4_0",
      "ollama pull mistral-small:24b-q4_0"
    ]
  },
  deepseek: {
    localFallback: "Research lane only; local fallback requires explicit frontier review",
    suggestedCommands: [
      "ollama pull deepseek-coder:6.7b-instruct-q4_0"
    ]
  },
  "openai-open-weight": {
    localFallback: "Provider-neutral open-weight evaluation only",
    suggestedCommands: [
      "# Check model card and license before adding local checkpoint source"
    ]
  },
  "embedding-and-reranker": {
    localFallback: "Retriever-first local models only",
    suggestedCommands: [
      "# Example: all-MiniLM-L6-v2 / bge-small via transformers for RAG index",
      "# Example: bge-reranker-v2-m3 (local runtime to be reviewed before use)"
    ]
  },
  "code-specialist": {
    localFallback: "Code lane only after clean-room review",
    suggestedCommands: [
      "# Example: qwen2.5-coder / codellama local quantized candidates",
      "# Candidate command requires explicit local hardware and license review"
    ]
  }
};

if (args.includes("--apply") || args.includes("--install") || args.includes("--download")) {
  console.error("Model install plan execution is intentionally blocked.");
  console.error("This command creates a dry-run plan only. Set explicit approvals + a signed deployment ticket before any live install.");
  console.error("Use: npm run plan:seis-language-model-install -- --family <id> for a metadata-only plan.");
  process.exit(2);
}

const registry = readJson(registryPath, "language model intake registry");
const scalingProfile = readJson(hardwareProfilePath, "model scaling hardware profile");
if (!registry || !scalingProfile) process.exit(1);

const requestedFamilies = parseFamilyFilter(args);
if (!requestedFamilies) {
  process.exit(1);
}

const families = (registry.candidateModelFamilies || [])
  .filter((family) => requestedFamilies.length === 0 || requestedFamilies.includes(family.id))
  .sort((a, b) => a.id.localeCompare(b.id));

if (!families.length) {
  console.error("No matching language model families found for --family filter.");
  process.exit(1);
}

const plan = buildPlan(registry, scalingProfile, families);

if (args.includes("--json")) {
  console.log(JSON.stringify(plan, null, 2));
} else {
  console.log(renderPlanMarkdown(plan));
}

function buildPlan(registry, scalingProfile, families) {
  const lane = registry.hardwareInstallLanes?.find((item) => item.id === "developer-16gb") || null;
  const installRows = families.map((family) => {
    const localProfile = localRuntimeProfiles[family.id];
    const readyReason = isInstallReady(registry, family);

    return {
      familyId: family.id,
      displayName: family.displayName,
      source: family.source,
      allowedToday: family.allowedToday,
      trainingUse: family.trainingUse,
      installState: family.installState,
      licenseReviewStatus: family.licenseReviewStatus,
      readiness: readyReason.readiness,
      blockedReasons: readyReason.blockedReasons,
      suggestedCommands: localProfile?.suggestedCommands || [],
      representativeClasses: family.representativeClasses || [],
      trainingLanes: suggestTrainingLanes(registry.trainingLanes || [], family.id),
      localFallback: localProfile?.localFallback || "Not yet assessed",
      evidenceNeeds: buildEvidenceNeeds(family, registry)
    };
  });

  const targetHardware = scalingProfile.currentTarget || {};

  return {
    id: "seis-language-model-install-dry-run-plan",
    generatedAt: new Date().toISOString(),
    mode: registry.installPolicy?.bulkInstallAllowed ? "policy-allows" : "dry-run-blocked",
    sourceRegistry: registryPath,
    families,
    filterApplied: requestedFamilies,
    globalPolicy: {
      bulkInstallAllowed: registry.installPolicy?.bulkInstallAllowed ?? false,
      downloadAuthorized: registry.installPolicy?.downloadAuthorized ?? false,
      runtimeAuthorityGranted: registry.installPolicy?.runtimeAuthorityGranted ?? false,
      trainingAuthorized: registry.installPolicy?.trainingAuthorized ?? false,
      adapterTrainingAuthorized: registry.installPolicy?.adapterTrainingAuthorized ?? false
    },
    globalReadiness: {
      installPolicyGate: registry.installPolicy?.reason,
      requiredBeforeAnyModelInstall: registry.requiredBeforeAnyModelInstall || [],
      requiredBeforeAnyTraining: registry.requiredBeforeAnyTraining || []
    },
    queue: buildQueue(installRows, requestedFamilies, targetHardware, lane),
    targets: {
      currentTarget: {
        compatibilityStatus: targetHardware.compatibilityStatus || "planned-not-validated",
        trainingStatus: targetHardware.trainingStatus || "not-started",
        runtimeAuthority: targetHardware.runtimeAuthority || false,
        allowedRamClass: lane?.ramClass || "16GB+",
        laneBlockedClasses: lane?.blockedClasses || []
      }
    },
    installRows
  };
}

function isInstallReady(registry, family) {
  const blockedReasons = [];

  if (registry.installPolicy?.bulkInstallAllowed !== true) {
    blockedReasons.push("bulk install is disabled");
  }

  if (family.allowedToday !== "metadata-only") {
    blockedReasons.push(`family policy is not metadata-only (${family.allowedToday})`);
  }

  if (family.trainingUse !== "not-authorized") {
    blockedReasons.push(`trainingUse is ${family.trainingUse}`);
  }

  if (family.installState !== "not-installed-by-registry") {
    blockedReasons.push(`installState is ${family.installState}`);
  }

  if (family.licenseReviewStatus?.includes("required") !== true) {
    blockedReasons.push("license review status is not explicitly required");
  }

  return {
    readiness: blockedReasons.length === 0 ? "blocked-by-approved-ops-gate" : "blocked-by-policy",
    blockedReasons
  };
}

function suggestTrainingLanes(trainingLanes, familyId) {
  const lane = trainingLanes.find((entry) => {
    if (entry.id === "lora-or-adapter-experiment" && familyId === "code-specialist") return true;
    if (entry.id === "retrieval-knowledge-layer" && familyId === "embedding-and-reranker") return true;
    if (entry.id === "repo-local-seed-models") return true;
    return false;
  });

  if (!lane) return [];
  return [
    {
      id: lane.id,
      status: lane.status,
      meaning: lane.meaning,
      allowedToday: lane.allowedToday,
      foundationModelTraining: lane.foundationModelTraining
    }
  ];
}

function buildEvidenceNeeds(family, registry) {
  return {
    modelCard: `${family.id}-model-card.json`,
    datasetCard: `${family.id}-dataset-card.json`,
    checkpointSource: "required before download",
    checksum: "required before any local checkpoint pull",
    licenseReview: family.licenseReviewStatus,
    modelInstallRoute: `registry family-id ${family.id}`,
    runtimeAuthority: registry.installPolicy?.runtimeAuthorityGranted ? "true" : "false"
  };
}

function buildQueue(installRows, requestedFamilies, targetHardware, lane) {
  const planCommand = requestedFamilies.length > 0
    ? `npm run plan:seis-language-model-install -- --family ${requestedFamilies.join(",")}`
    : "npm run plan:seis-language-model-install";

  return {
    preconditions: [
      "Run check:seis-language-model-intake with latest plan + registry.",
      `Verify RAM/GPU for target class (current lane: ${lane?.id || "unknown"}).`,
      "Create per-family model card + dataset card + checksum artifacts before install.",
      `Ensure target model classes do not violate blocked classes: ${lane?.blockedClasses?.join(", ") || "unknown"}`
    ],
    dryRunActions: {
      commandToGeneratePlan: planCommand,
      commandToGenerateJson: "npm run plan:seis-language-model-install -- --json",
      commandToReconcileDocs: "npm run check:seis-language-model-intake"
    },
    currentCoverage: {
      plannedModelCount: installRows.length,
      lane: "repo-local-seed-models",
      currentTargetCompatibility: targetHardware.compatibilityStatus || "planned-not-validated"
    },
    approvalGate: "human approval required before install of any family"
  };
}

function parseFamilyFilter(argv) {
  const familyArg = getArgValue(argv, "--family");
  if (!familyArg) return [];

  const values = familyArg
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set(values)];
}

function getArgValue(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1) return null;
  return argv[index + 1] || null;
}

function renderPlanMarkdown(plan) {
  const preconditions = plan.queue.preconditions
    .map((value) => `- ${value}`)
    .join("\n");

  const header = `# SEIS Language Model Install Plan (Dry-Run)\n` +
    `Generated: ${plan.generatedAt}\n` +
    `Source: ${plan.sourceRegistry}\n` +
    `Mode: ${plan.mode}\n` +
    `Filter: ${plan.filterApplied.length ? plan.filterApplied.join(",") : "all candidates"}\n\n`;

  const policy = `## Plan Policy\n` +
    `- Bulk install: ${plan.globalPolicy.bulkInstallAllowed}\n` +
    `- Download authorized: ${plan.globalPolicy.downloadAuthorized}\n` +
    `- Runtime authority: ${plan.globalPolicy.runtimeAuthorityGranted}\n` +
    `- Training authorized: ${plan.globalPolicy.trainingAuthorized}\n\n`;

  const families = `## Family Install Readiness\n` +
    "| Family | Readiness | Install State | Training Use | Blocked Reasons |\n" +
    "| --- | --- | --- | --- | --- |\n" +
    plan.installRows
      .map(
        (row) =>
          `| ${row.familyId} (${row.displayName}) | ${row.readiness} | ${row.installState} | ${row.trainingUse} | ${row.blockedReasons.join(", ")} |`
      )
      .join("\n") +
    "\n\n";

  const queue = `## Commands\n` +
    `- ${plan.queue.dryRunActions.commandToGeneratePlan}\n` +
    `- ${plan.queue.dryRunActions.commandToGenerateJson}\n` +
    `- ${plan.queue.dryRunActions.commandToReconcileDocs}\n` +
    `\n## Preconditions\n${preconditions}\n\n`;

  const familyDetails = plan.installRows
    .map((row) => {
      const commandLines = row.suggestedCommands.length
        ? row.suggestedCommands.map((cmd) => `- ${cmd}`).join("\n")
        : "- No suggested command in registry";
      return `### ${row.familyId}\n` +
        `- Source: ${row.source}\n` +
        `- License: ${row.licenseReviewStatus}\n` +
        `- Suggested local commands:\n${commandLines}\n` +
        `- Evidence needs: model card, dataset card, checksum, license review.\n`;
    })
    .join("\n");

  const note = "## Safety\n" +
    "This plan is metadata-only. No live provider calls, no downloads, no checkpoint pulls, no training commands.\n" +
    "Use explicit deployment tickets and human approval before any execution path.\n";

  return `${header}${policy}${families}${queue}## Family Detail\n${familyDetails}\n\n${note}`;
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Cannot read ${label}: ${error.message}`);
    return null;
  }
}
