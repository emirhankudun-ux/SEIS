#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const shouldWrite = Boolean(args.write);
const shouldCheck = Boolean(args.check);

const paths = {
  routerContract: "content/development/seis-read-only-model-router-contract.json",
  secondBrain: "content/development/seis-second-brain-system.json",
  outputJson: typeof args.output === "string" ? args.output : "reports/seis-public-demo/read-only-model-router-decision-latest.json",
  outputMarkdown: typeof args.markdown === "string" ? args.markdown : "reports/seis-public-demo/read-only-model-router-decision-latest.md"
};

const failures = [];

const routerContract = readJson(paths.routerContract, "read-only model-router contract");
const secondBrain = readJson(paths.secondBrain, "Second Brain contract");
const report = buildDecisionReport(routerContract, secondBrain, new Date().toISOString());

validateDecisionReport(report, routerContract, secondBrain, "generated router decision report");

if (shouldWrite) {
  writeJson(paths.outputJson, report);
  writeText(paths.outputMarkdown, renderMarkdown(report));
}

if (shouldCheck) {
  ensureFile(paths.outputJson, "read-only model-router decision JSON artifact");
  ensureFile(paths.outputMarkdown, "read-only model-router decision Markdown artifact");
  const existingJson = readJson(paths.outputJson, "read-only model-router decision JSON artifact");
  const existingMarkdown = readText(paths.outputMarkdown, "read-only model-router decision Markdown artifact");
  if (existingJson) validateDecisionReport(existingJson, routerContract, secondBrain, "existing router decision artifact");
  for (const phrase of [
    "SEIS Read-Only Model Router Decision",
    "Provider calls performed: false",
    "Credential validation performed: false",
    "executionPerformed: false",
    "Missing Key is not Error",
    "private Obsidian content is not routable"
  ]) {
    ensure(existingMarkdown.includes(phrase), `Markdown artifact missing phrase: ${phrase}.`);
  }
}

if (failures.length > 0) {
  console.error("SEIS read-only model-router decision check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (shouldWrite) {
  console.log(`Wrote ${paths.outputJson}`);
  console.log(`Wrote ${paths.outputMarkdown}`);
} else if (shouldCheck) {
  console.log("SEIS read-only model-router decision check passed.");
} else {
  console.log(JSON.stringify(report, null, 2));
}

function buildDecisionReport(contract, secondBrainContract, generatedAt) {
  const installedAiProfiles = Array.isArray(secondBrainContract?.installedAiProfiles)
    ? secondBrainContract.installedAiProfiles
    : [];
  const managedSubAgentLanes = Array.isArray(secondBrainContract?.managedSubAgentLanes)
    ? secondBrainContract.managedSubAgentLanes
    : [];
  const autonomousAgentRoster = Array.isArray(secondBrainContract?.autonomousAgentRoster)
    ? secondBrainContract.autonomousAgentRoster.map((item) => item.agent)
    : [];

  const providerFixtures = installedAiProfiles.map((profile) => makeProviderFixture(profile));

  const decisions = [
    makeDecision({
      id: "second-brain-local-context-review",
      taskType: "second-brain-context-review",
      capabilityLabel: "local context summary",
      privacyMode: "local-only",
      selectedProvider: "SEIS Local Demo Runtime",
      selectedModel: "local-demo-fixture",
      providerState: "Local Demo",
      fallbackPolicy: "no cloud fallback in local-only mode",
      blockedReasons: [
        "read-only model-router contract only",
        "executionPerformed must remain false",
        "backend-only provider mediation is not implemented"
      ],
      requiredApprovals: ["human approval before live provider routing"]
    }),
    makeDecision({
      id: "private-obsidian-vault-content",
      taskType: "obsidian-private-content-routing",
      capabilityLabel: "private vault review",
      privacyMode: "review-gated",
      selectedProvider: "None",
      selectedModel: "none",
      providerState: "Disabled",
      fallbackPolicy: "blocked; no provider fallback",
      blockedReasons: [
        "private Obsidian content is not routable",
        "explicit user-selected source path is missing",
        "human approval for private vault scan is missing",
        "sending imported note content to AI providers is forbidden"
      ],
      requiredApprovals: [
        "explicit user-selected local vault path",
        "human approval before scanning selected files",
        "separate approval before any provider routing"
      ]
    }),
    makeDecision({
      id: "cloud-review-provider-missing-key",
      taskType: "cloud-review-profile",
      capabilityLabel: "architecture review",
      privacyMode: "standard",
      selectedProvider: "Claude review profile",
      selectedModel: "review-profile-not-configured",
      providerState: "Missing Key",
      fallbackPolicy: "blocked; Missing Key is not Error and no silent fallback is allowed",
      blockedReasons: [
        "Missing Key is not Error",
        "credential validation is not performed",
        "server-only provider mediation is missing",
        "silent fallback is forbidden"
      ],
      requiredApprovals: [
        "backend-only provider mediation",
        "typed environment validation",
        "human approval before live provider routing"
      ]
    }),
    makeDecision({
      id: "frontier-model-class-route",
      taskType: "frontier-model-class-review",
      capabilityLabel: "512B apex planning lane",
      privacyMode: "review-gated",
      selectedProvider: "None",
      selectedModel: "512B apex-program-plan-only",
      providerState: "Disabled",
      fallbackPolicy: "blocked; frontier classes are planning records only",
      blockedReasons: [
        "512B apex-program-plan-only is not a routeable model",
        "weights, runtime adapter, benchmark evidence, safety evals, and approval are missing",
        "live execution stays blocked until backend-only provider mediation exists"
      ],
      requiredApprovals: [
        "model card and dataset card review",
        "safety eval evidence",
        "human approval before live routing"
      ]
    })
  ];

  return {
    id: "seis-read-only-model-router-decision-pr54",
    title: "SEIS Read-Only Model Router Decision",
    generatedAt,
    status: "review-only-no-runtime-authority",
    mode: "provider-neutral-read-only",
    decision: "NO-GO-live-routing-not-approved",
    contractPath: paths.routerContract,
    secondBrainPath: paths.secondBrain,
    sourceSnapshot: {
      installedAiProfileCount: installedAiProfiles.length,
      managedSubAgentLaneCount: managedSubAgentLanes.length,
      autonomousAgentRosterCount: autonomousAgentRoster.length,
      providerFixtureCount: providerFixtures.length,
      providerFixtureForEveryInstalledAiProfile: true
    },
    installedAiProfiles,
    managedSubAgentLanes,
    autonomousAgentRoster,
    providerFixtures,
    decisions,
    decisionIntegrity: {
      readOnlyOnly: true,
      executionPerformedAlwaysFalse: true,
      noPromptBodyInDecision: true,
      noCredentialMaterialInDecision: true,
      decisionLogsRedacted: true,
      providerStateMustBeNamed: true,
      selectedProviderMustBeExplicit: true,
      fallbackMustBeExplicit: true,
      blockedReasonsRequiredWhenIneligible: true,
      privateObsidianContentRoutable: false
    },
    safetyBoundary: {
      runtimeAuthority: false,
      providerCallsPerformed: false,
      credentialValidationPerformed: false,
      browserSecretsExposed: false,
      promptBodiesStored: false,
      privateObsidianContentRouted: false,
      silentFallbackUsed: false,
      localOnlyCloudFallbackUsed: false,
      sshExecuted: false,
      deploymentPerformed: false,
      githubMutationPerformed: false
    },
    requiredEvidenceBeforeLiveRouting: contract?.requiredEvidenceBeforeLiveRouting || []
  };
}

function makeProviderFixture(profile) {
  const providerInfo = {
    "seis-local-demo": {
      provider: "SEIS Local Demo Runtime",
      model: "local-demo-fixture",
      providerState: "Local Demo",
      credentialRequired: false
    },
    "codex-operator": {
      provider: "Codex / ChatGPT operator lane",
      model: "external-human-operated-codex-context",
      providerState: "Local Demo",
      credentialRequired: false
    },
    "seis-agent-policy-profile": {
      provider: "SEIS Agent Policy Runtime",
      model: "policy-fixture-no-provider-call",
      providerState: "Local Demo",
      credentialRequired: false
    },
    "claude-review-profile": {
      provider: "Claude review profile",
      model: "review-profile-not-configured",
      providerState: "Missing Key",
      credentialRequired: true
    },
    "qwen-review-profile": {
      provider: "Qwen review profile",
      model: "review-profile-not-configured",
      providerState: "Missing Key",
      credentialRequired: true
    },
    "gemini-validation-profile": {
      provider: "Gemini validation profile",
      model: "validation-profile-not-configured",
      providerState: "Missing Key",
      credentialRequired: true
    },
    "openai-general-profile": {
      provider: "OpenAI general profile",
      model: "general-profile-not-configured",
      providerState: "Missing Key",
      credentialRequired: true
    },
    "anthropic-claude-profile": {
      provider: "Anthropic Claude profile",
      model: "anthropic-profile-not-configured",
      providerState: "Missing Key",
      credentialRequired: true
    },
    "chatgpt-review-profile": {
      provider: "ChatGPT review profile",
      model: "chatgpt-review-not-configured",
      providerState: "Missing Key",
      credentialRequired: true
    },
    "openrouter-provider-profile": {
      provider: "OpenRouter provider profile",
      model: "openrouter-profile-not-configured",
      providerState: "Missing Key",
      credentialRequired: true
    },
    "ollama-local-profile": {
      provider: "Ollama local candidate",
      model: "local-runtime-not-verified",
      providerState: "Unknown",
      credentialRequired: false
    },
    "lm-studio-local-profile": {
      provider: "LM Studio local candidate",
      model: "local-runtime-not-verified",
      providerState: "Unknown",
      credentialRequired: false
    }
  };

  const disabledToolProfile = {
    provider: readableProfileName(profile),
    model: "tool-profile-not-live-routable",
    providerState: "Disabled",
    credentialRequired: false
  };

  return {
    profile,
    ...(providerInfo[profile] || disabledToolProfile),
    providerCallsPerformed: false
  };
}

function readableProfileName(profile) {
  return profile
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function makeDecision(value) {
  return {
    ...value,
    routeEligible: false,
    executionPerformed: false,
    fallbackUsed: false,
    promptBodyIncluded: false,
    credentialMaterialIncluded: false,
    decisionLogRedacted: true
  };
}

function validateDecisionReport(value, contract, secondBrainContract, label) {
  const sourceInstalledAiProfiles = secondBrainContract?.installedAiProfiles || [];
  ensure(value?.id === "seis-read-only-model-router-decision-pr54", `${label} id mismatch.`);
  ensure(value?.title === "SEIS Read-Only Model Router Decision", `${label} title mismatch.`);
  ensure(value?.status === "review-only-no-runtime-authority", `${label} status mismatch.`);
  ensure(value?.mode === "provider-neutral-read-only", `${label} mode mismatch.`);
  ensure(value?.decision === "NO-GO-live-routing-not-approved", `${label} decision must block live routing.`);
  ensure(value?.contractPath === paths.routerContract, `${label} contract path mismatch.`);
  ensure(value?.secondBrainPath === paths.secondBrain, `${label} Second Brain path mismatch.`);
  ensureExactArray(value?.installedAiProfiles, sourceInstalledAiProfiles, `${label} installedAiProfiles`);
  ensure(value?.sourceSnapshot?.installedAiProfileCount === sourceInstalledAiProfiles.length, `${label} sourceSnapshot installed AI profile count mismatch.`);
  ensure(value?.sourceSnapshot?.providerFixtureForEveryInstalledAiProfile === true, `${label} must require provider fixture coverage for every installed AI profile.`);
  ensure(Array.isArray(value?.managedSubAgentLanes) && value.managedSubAgentLanes.length >= 6, `${label} must include managed sub-agent lanes.`);
  ensure(Array.isArray(value?.autonomousAgentRoster) && value.autonomousAgentRoster.length >= 12, `${label} must include autonomous agent roster.`);
  ensure(Array.isArray(value?.providerFixtures) && value.providerFixtures.length === sourceInstalledAiProfiles.length, `${label} must include one provider fixture per installed AI profile.`);
  ensure(Array.isArray(value?.decisions) && value.decisions.length >= 4, `${label} must include read-only decisions.`);

  const fixtureProfiles = (value?.providerFixtures || []).map((fixture) => fixture.profile);
  ensureExactArray(fixtureProfiles, sourceInstalledAiProfiles, `${label} provider fixture profiles`);

  for (const [key, expected] of Object.entries(contract?.decisionIntegrity || {})) {
    ensure(value?.decisionIntegrity?.[key] === expected, `${label} decisionIntegrity.${key} must be ${expected}.`);
  }

  for (const [key, expected] of [
    ["runtimeAuthority", false],
    ["providerCallsPerformed", false],
    ["credentialValidationPerformed", false],
    ["browserSecretsExposed", false],
    ["promptBodiesStored", false],
    ["privateObsidianContentRouted", false],
    ["silentFallbackUsed", false],
    ["localOnlyCloudFallbackUsed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["githubMutationPerformed", false]
  ]) {
    ensure(value?.safetyBoundary?.[key] === expected, `${label} safetyBoundary.${key} must be ${expected}.`);
  }

  for (const fixture of value?.providerFixtures || []) {
    ensure(contract.providerStates.includes(fixture.providerState), `${label} provider fixture has invalid state: ${fixture.providerState}.`);
    ensure(fixture.providerCallsPerformed === false, `${label} provider fixture must not perform calls.`);
  }

  for (const decision of value?.decisions || []) {
    ensure(typeof decision.taskType === "string" && decision.taskType.length > 0, `${label} decision missing taskType.`);
    ensure(typeof decision.privacyMode === "string" && decision.privacyMode.length > 0, `${label} decision missing privacyMode.`);
    ensure(typeof decision.selectedProvider === "string" && decision.selectedProvider.length > 0, `${label} decision missing selectedProvider.`);
    ensure(typeof decision.selectedModel === "string" && decision.selectedModel.length > 0, `${label} decision missing selectedModel.`);
    ensure(contract.providerStates.includes(decision.providerState), `${label} decision has invalid providerState: ${decision.providerState}.`);
    ensure(decision.routeEligible === false, `${label} decision ${decision.id} routeEligible must stay false.`);
    ensure(decision.executionPerformed === false, `${label} decision ${decision.id} executionPerformed must stay false.`);
    ensure(decision.fallbackUsed === false, `${label} decision ${decision.id} fallbackUsed must stay false.`);
    ensure(decision.promptBodyIncluded === false, `${label} decision ${decision.id} must not include prompt body.`);
    ensure(decision.credentialMaterialIncluded === false, `${label} decision ${decision.id} must not include credential material.`);
    ensure(decision.decisionLogRedacted === true, `${label} decision ${decision.id} must keep redacted logs.`);
    ensure(Array.isArray(decision.blockedReasons) && decision.blockedReasons.length > 0, `${label} decision ${decision.id} needs blocked reasons.`);
    ensure(typeof decision.fallbackPolicy === "string" && decision.fallbackPolicy.length > 0, `${label} decision ${decision.id} needs fallback policy.`);
  }

  const serialized = JSON.stringify(value);
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), `${label} must not contain OpenAI-style API keys.`);
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), `${label} must not contain private keys.`);
  ensure(!/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(serialized), `${label} must not contain inline credential assignments.`);
  ensure(!serialized.includes("file://"), `${label} must not include file:// paths.`);
  ensure(!serialized.includes("/Users/"), `${label} must not include absolute private /Users paths.`);
  ensure(!/promptBodyText|promptText|messages|conversation/i.test(serialized), `${label} must not store prompt bodies.`);
}

function renderMarkdown(value) {
  const fixtureRows = value.providerFixtures
    .map((fixture) => `| ${fixture.profile} | ${fixture.providerState} | ${fixture.providerCallsPerformed} |`)
    .join("\n");
  const decisionRows = value.decisions
    .map((decision) => `| ${decision.id} | ${decision.providerState} | ${decision.routeEligible} | ${decision.executionPerformed} | ${decision.fallbackUsed} |`)
    .join("\n");

  return `# SEIS Read-Only Model Router Decision

Generated: ${value.generatedAt}
Status: ${value.status}
Mode: ${value.mode}
Decision: ${value.decision}

Provider calls performed: ${value.safetyBoundary.providerCallsPerformed}
Credential validation performed: ${value.safetyBoundary.credentialValidationPerformed}
Browser secrets exposed: ${value.safetyBoundary.browserSecretsExposed}
Private Obsidian content routed: ${value.safetyBoundary.privateObsidianContentRouted}

## Scope

This artifact is a provider-neutral review-only decision record. It does not
call providers, validate credentials, store prompt bodies, expose browser
secrets, route private Obsidian content, execute SSH, deploy, mutate GitHub, or
approve live routing.

Missing Key is not Error. Local-only mode never falls back to cloud providers,
and private Obsidian content is not routable.

## Installed AI Fixtures

| Profile | Provider state | Provider calls performed |
| --- | --- | --- |
${fixtureRows}

## Read-Only Decisions

| Decision | Provider state | routeEligible | executionPerformed | fallbackUsed |
| --- | --- | --- | --- | --- |
${decisionRows}

## Integrity Markers

- executionPerformed: false
- fallbackUsed: false
- promptBodyIncluded: false
- credentialMaterialIncluded: false
- privateObsidianContentRoutable: ${value.decisionIntegrity.privateObsidianContentRoutable}
`;
}

function parseArgs(values) {
  return values.reduce((acc, value, index) => {
    if (!value.startsWith("--")) return acc;
    const key = value.slice(2);
    const next = values[index + 1];
    acc[key] = next && !next.startsWith("--") ? next : true;
    return acc;
  }, {});
}

function safeOutputPath(targetPath) {
  const absolutePath = path.resolve(root, targetPath);
  const relativePath = path.relative(root, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    failures.push(`refusing to write outside repository: ${targetPath}`);
    return path.join(root, "reports", "seis-public-demo", "read-only-model-router-refused-output.txt");
  }
  return absolutePath;
}

function writeJson(filePath, value) {
  const absolutePath = safeOutputPath(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  const absolutePath = safeOutputPath(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureExactArray(value, expected, label) {
  ensure(Array.isArray(value), `${label} must be an array.`);
  ensure(Array.isArray(expected), `${label} expected source must be an array.`);
  if (!Array.isArray(value) || !Array.isArray(expected)) return;
  ensure(value.length === expected.length, `${label} count must match the Second Brain source contract exactly.`);
  for (const expectedValue of expected) {
    ensure(value.includes(expectedValue), `${label} missing source item: ${expectedValue}.`);
  }
  for (const actualValue of value) {
    ensure(expected.includes(actualValue), `${label} includes non-source item: ${actualValue}.`);
  }
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${label}: ${filePath}`);
    return "";
  }
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    failures.push(`unable to read ${label}: ${error.message}`);
    return "";
  }
}

function readJson(filePath, label) {
  const text = readText(filePath, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`invalid JSON in ${label}: ${error.message}`);
    return null;
  }
}
