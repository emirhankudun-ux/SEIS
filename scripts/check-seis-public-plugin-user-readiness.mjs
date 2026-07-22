#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_READ_BYTES = 4 * 1024 * 1024;
const MAX_PLAN_OUTPUT_BYTES = 64 * 1024;
const CANONICAL_INSTALL = "seis-ai-agent@seis-repo";
const paths = {
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  selectionGuide: "content/development/seis-public-plugin-selection-guide.json",
  switch: "scripts/manage-seis-public-marketplace-switch.mjs",
  generalAutopilot: "content/development/seis-general-plugin-autopilot.json",
  supervisedAutopilot: "content/development/seis-public-plugin-supervised-autopilot.json",
  unifiedSuite: "plugins/seis-ai-agent/assets/unified-suite.json",
};

const args = parseArguments(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

const failures = [];
const bundleCatalog = readJson(paths.bundleCatalog, failures);
const selectionGuide = readJson(paths.selectionGuide, failures);
const generalAutopilot = readJson(paths.generalAutopilot, failures);
const supervisedAutopilot = readJson(paths.supervisedAutopilot, failures);
const unifiedSuite = readJson(paths.unifiedSuite, failures);
const staticReadiness = inspectStaticReadiness({ bundleCatalog, selectionGuide, generalAutopilot, supervisedAutopilot, unifiedSuite, failures });
const localConfig = args.localConfig
  ? inspectLocalConfig({ configPath: args.configPath, failures })
  : { status: "not-checked" };

const status = failures.length > 0
  ? "invalid-repository-contract"
  : args.localConfig
    ? localConfig.status
    : "repo-ready-local-config-unverified";

printJson({
  schemaVersion: 1,
  id: "seis-public-plugin-user-readiness",
  mode: args.localConfig ? "repo-and-local-config-read-only" : "repo-only-read-only",
  status,
  staticReadiness,
  localConfig,
  manualUiGate: {
    required: true,
    status: "not-automatically-provable",
    nextAction: "Refresh or restart Codex and verify the compact SEIS Repo surface directly in the Plugins view.",
  },
  boundaries: {
    configWrites: false,
    pluginInstallation: false,
    networkAccess: false,
    providerAccess: false,
    secretAccess: false,
    githubWrites: false,
    backgroundExecution: false,
    configPathDisclosed: false,
  },
  failures,
});

process.exit(failures.length > 0 ? 1 : 0);

function parseArguments(argv) {
  const result = {
    configPath: null,
    help: false,
    localConfig: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case "--check":
        break;
      case "--local-config":
        result.localConfig = true;
        break;
      case "--config":
        result.configPath = requireValue(argv, index, argument);
        index += 1;
        break;
      case "--help":
      case "-h":
        result.help = true;
        break;
      default:
        fail(`unsupported argument: ${argument}`);
    }
  }

  if (result.configPath && !result.localConfig) fail("--config requires --local-config");
  return result;
}

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) fail(`${flag} requires a value`);
  return value;
}

function readJson(relativePath, failures) {
  try {
    const filePath = resolveRepositoryPath(relativePath);
    const status = fs.lstatSync(filePath);
    if (!status.isFile() || status.isSymbolicLink() || status.size > MAX_READ_BYTES) {
      throw new Error("must be a bounded regular repository file");
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`could not read ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function inspectStaticReadiness({ bundleCatalog, selectionGuide, generalAutopilot, supervisedAutopilot, unifiedSuite, failures }) {
  const internalPackages = Array.isArray(bundleCatalog?.internalPackages) ? bundleCatalog.internalPackages : [];
  const memberCounts = internalPackages.map((candidate) => candidate?.memberCount).filter(Number.isInteger);
  const totalPackagedSourceCapabilities = memberCounts.reduce((total, count) => total + count, 0);
  const roles = Array.isArray(supervisedAutopilot?.automationRoles) ? supervisedAutopilot.automationRoles : [];
  const immediateRounds = Array.isArray(supervisedAutopilot?.immediateCycle?.rounds) ? supervisedAutopilot.immediateCycle.rounds : [];
  const roadmapRounds = Array.isArray(generalAutopilot?.immediateCycle?.rounds) ? generalAutopilot.immediateCycle.rounds : [];
  const escalationTiers = Array.isArray(supervisedAutopilot?.escalationSeries?.tiers) ? supervisedAutopilot.escalationSeries.tiers : [];
  const tenYearHorizon = Array.isArray(supervisedAutopilot?.tenYearHorizon) ? supervisedAutopilot.tenYearHorizon : [];

  ensure(selectionGuide?.canonicalInstall === CANONICAL_INSTALL, "selection guide canonical install is invalid", failures);
  ensure(selectionGuide?.marketplace?.publicCardCount === 10, "selection guide must report ten public cards", failures);
  ensure(selectionGuide?.marketplace?.canonicalCardCount === 1, "selection guide must report one canonical card", failures);
  ensure(selectionGuide?.marketplace?.generalPluginCardCount === 10, "selection guide must report ten general plugin cards", failures);
  ensure(selectionGuide?.marketplace?.internalPackageCount === 30 && selectionGuide?.marketplace?.internalPackageCardCount === 0, "selection guide internal package projection is invalid", failures);
  ensure(selectionGuide?.marketplace?.maximumPackageSize === 15, "selection guide maximum package size must be 15", failures);
  ensure(selectionGuide?.selectionBoundary?.defaultInstall === CANONICAL_INSTALL, "selection boundary default must be canonical SEIS-Agent", failures);
  ensure(selectionGuide?.selectionBoundary?.maximumGeneralPluginSelectionsPerTask === 1, "selection boundary must allow one general plugin per task", failures);
  ensure(selectionGuide?.selectionBoundary?.maximumInternalPackageSelectionsPerPlugin === 3, "selection boundary must retain three internal packages per general plugin", failures);
  ensure(selectionGuide?.selectionBoundary?.bulkInstallAllowed === false, "selection boundary must reject bulk install", failures);
  ensure(selectionGuide?.selectionBoundary?.internalPackagesAutoInstalled === false && selectionGuide?.selectionBoundary?.sourceMembersAutoInstalled === false, "selection boundary must not auto-install internal packages or source members", failures);
  ensure(selectionGuide?.finder?.maximumResults === 3 && selectionGuide?.finder?.installation === false && selectionGuide?.finder?.externalAccess === false, "local finder boundary is invalid", failures);
  ensure(Array.isArray(selectionGuide?.starterPaths) && selectionGuide.starterPaths.length === 10, "selection guide must provide ten starter paths", failures);
  ensure(Array.isArray(selectionGuide?.journeys) && selectionGuide.journeys.length === 10, "selection guide must provide ten journeys", failures);

  ensure(bundleCatalog?.canonicalInstall === CANONICAL_INSTALL, "bundle catalog canonical install is invalid", failures);
  ensure(bundleCatalog?.marketplace?.publicCardCount === 10 && bundleCatalog?.marketplace?.generalPluginCardCount === 10, "package catalog marketplace projection is invalid", failures);
  ensure(bundleCatalog?.marketplace?.internalPackageCount === 30 && bundleCatalog?.marketplace?.internalPackageCardCount === 0, "package catalog internal boundary is invalid", failures);
  ensure(bundleCatalog?.sourceCapabilityInventory?.retainedSourcePackageCount === 380, "bundle catalog must retain 380 source capabilities", failures);
  ensure(internalPackages.length === 30, "package catalog must contain 30 internal packages", failures);
  ensure(memberCounts.length === internalPackages.length && memberCounts.every((count) => count >= 1 && count <= 15), "every internal package must have one through 15 members", failures);
  ensure(totalPackagedSourceCapabilities === 375, "internal packages must cover 375 application and topic source capabilities", failures);

  ensure(unifiedSuite?.canonicalInstall?.installId === CANONICAL_INSTALL, "unified suite canonical install is invalid", failures);
  ensure(unifiedSuite?.publicDistribution?.marketplaceCardCount === 10 && unifiedSuite?.publicDistribution?.generalPluginCardCount === 10, "unified suite marketplace distribution is invalid", failures);
  ensure(unifiedSuite?.publicDistribution?.internalPackageCount === 30 && unifiedSuite?.publicDistribution?.internalPackageCardCount === 0, "unified suite internal package boundary is invalid", failures);
  ensure(unifiedSuite?.publicDistribution?.sourceCapabilityCount === 380, "unified suite source capability count is invalid", failures);
  ensure(unifiedSuite?.sourceDiscovery?.migratedRootModuleCount === 5 && unifiedSuite?.sourceDiscovery?.applicationSourcePackageCount === 75 && unifiedSuite?.sourceDiscovery?.topicSourcePackageCount === 300, "unified suite source discovery inventory is invalid", failures);

  ensure(supervisedAutopilot?.currentMarketplace?.canonicalInstall === CANONICAL_INSTALL, "autopilot canonical install is invalid", failures);
  ensure(supervisedAutopilot?.currentMarketplace?.publicCardCount === 10 && supervisedAutopilot?.currentMarketplace?.generalPluginCardCount === 10, "autopilot marketplace projection is invalid", failures);
  ensure(supervisedAutopilot?.currentMarketplace?.internalPackageCount === 30 && supervisedAutopilot?.currentMarketplace?.internalPackageCardCount === 0, "autopilot internal package projection is invalid", failures);
  ensure(supervisedAutopilot?.currentMarketplace?.retainedSourceCapabilityCount === 380 && supervisedAutopilot?.currentMarketplace?.maximumPackageSize === 15, "autopilot retained-source boundary is invalid", failures);
  ensure(supervisedAutopilot?.executionModel?.planAndBuildInOneInvocation === true, "autopilot must plan and build in one foreground invocation", failures);
  ensure(supervisedAutopilot?.executionModel?.persistentProcess === false && supervisedAutopilot?.executionModel?.backgroundExecution === false, "autopilot must remain non-persistent and foreground-only", failures);
  ensure(supervisedAutopilot?.executionModel?.subagentsAreAutomationRoles === true && supervisedAutopilot?.executionModel?.roleExecution === "foreground-sequential-reviewed-allowlist", "autopilot subagent role boundary is invalid", failures);
  ensure(supervisedAutopilot?.immediateCycle?.status === "execution-state-in-external-ledger" && supervisedAutopilot?.immediateCycle?.totalSteps === 150 && supervisedAutopilot?.immediateCycle?.stepsPerRound === 30 && immediateRounds.length === 5 && immediateRounds.every((round) => round?.status === "planned-not-executed" && Array.isArray(round?.steps) && round.steps.length === 30), "hardened runner five-by-30 contract is invalid", failures);
  ensure(supervisedAutopilot?.fiveWaveSeries?.status === "blocked-by-incomplete-five-30-step-rounds" && supervisedAutopilot?.fiveWaveSeries?.activeWave === null && supervisedAutopilot?.fiveWaveSeries?.nextWave === 1 && supervisedAutopilot?.fiveWaveSeries?.waves === 5 && supervisedAutopilot?.fiveWaveSeries?.stepsPerWave === 100 && supervisedAutopilot?.fiveWaveSeries?.nextSeries?.status === "gated-until-five-100-step-waves-complete", "autopilot must retain the gated initial and next series", failures);
  ensure(escalationTiers.length === 5 && escalationTiers.map((tier) => tier?.stepsPerWave).join(",") === "200,300,400,500,600" && escalationTiers[0]?.status === "gated-until-five-100-step-waves-complete" && escalationTiers.every((tier) => tier?.activationAuthority === "not-yet-granted" && tier?.activeCycle === null), "autopilot escalation tiers are invalid", failures);
  ensure(tenYearHorizon.length === 10, "autopilot must retain a ten-year strategic horizon", failures);
  ensure(roles.length === 6 && roles.every((role) => typeof role?.id === "string"), "autopilot must expose six supervised automation roles", failures);
  ensure(generalAutopilot?.id === "seis-ten-general-plugin-autopilot" && generalAutopilot?.goalId === "SEIS-GOAL-0029", "general-plugin roadmap identity is invalid", failures);
  ensure(generalAutopilot?.immediateCycle?.totalSteps === 150 && generalAutopilot?.immediateCycle?.stepsPerRound === 30 && roadmapRounds.length === 5 && roadmapRounds.every((round) => Array.isArray(round?.steps) && round.steps.length === 30), "general-plugin roadmap must define five 30-step rounds", failures);
  ensure(generalAutopilot?.immediateCycle?.status === "execution-state-in-external-ledger" && generalAutopilot?.fiveWaveSeries?.status === "blocked-by-incomplete-five-30-step-rounds" && generalAutopilot?.canonicalAutomation?.goalId === "SEIS-GOAL-0029" && generalAutopilot?.canonicalAutomation?.runner === "scripts/run-seis-general-plugin-autopilot.mjs" && generalAutopilot?.canonicalAutomation?.reviewedPhaseCount === 30 && generalAutopilot?.canonicalAutomation?.evidenceLedger === "content/development/seis-general-plugin-autopilot-execution.json" && generalAutopilot?.canonicalAutomation?.repositoryAnchored === true && generalAutopilot?.commandAllowlist === undefined, "general-plugin roadmap must retain the bounded Goal 0029 runner", failures);

  return {
    canonicalInstall: CANONICAL_INSTALL,
    marketplace: {
      publicCardCount: selectionGuide?.marketplace?.publicCardCount ?? null,
      canonicalCardCount: selectionGuide?.marketplace?.canonicalCardCount ?? null,
      generalPluginCardCount: selectionGuide?.marketplace?.generalPluginCardCount ?? null,
      internalPackageCount: selectionGuide?.marketplace?.internalPackageCount ?? null,
      internalPackageCardCount: selectionGuide?.marketplace?.internalPackageCardCount ?? null,
      retainedSourceCapabilityCount: bundleCatalog?.sourceCapabilityInventory?.retainedSourcePackageCount ?? null,
      packagedSourceCapabilityCount: totalPackagedSourceCapabilities,
      smallestPackageSize: memberCounts.length > 0 ? Math.min(...memberCounts) : null,
      largestPackageSize: memberCounts.length > 0 ? Math.max(...memberCounts) : null,
    },
    userChoice: {
      starterPathCount: Array.isArray(selectionGuide?.starterPaths) ? selectionGuide.starterPaths.length : null,
      journeyCount: Array.isArray(selectionGuide?.journeys) ? selectionGuide.journeys.length : null,
      maximumGeneralPluginSelectionsPerTask: selectionGuide?.selectionBoundary?.maximumGeneralPluginSelectionsPerTask ?? null,
      maximumInternalPackageSelectionsPerPlugin: selectionGuide?.selectionBoundary?.maximumInternalPackageSelectionsPerPlugin ?? null,
      finderMaximumResults: selectionGuide?.finder?.maximumResults ?? null,
      bulkInstallAllowed: selectionGuide?.selectionBoundary?.bulkInstallAllowed ?? null,
    },
    automation: {
      planAndBuildInOneInvocation: supervisedAutopilot?.executionModel?.planAndBuildInOneInvocation ?? null,
      foregroundOnly: supervisedAutopilot?.executionModel?.backgroundExecution === false && supervisedAutopilot?.executionModel?.persistentProcess === false,
      initialRoundCount: roadmapRounds.length,
      stepsPerInitialRound: generalAutopilot?.immediateCycle?.stepsPerRound ?? null,
      totalInitialSteps: generalAutopilot?.immediateCycle?.totalSteps ?? null,
      hardenedRunnerPhaseCount: generalAutopilot?.canonicalAutomation?.reviewedPhaseCount ?? null,
      historicalWaveCount: supervisedAutopilot?.fiveWaveSeries?.waves ?? null,
      historicalStepsPerWave: supervisedAutopilot?.fiveWaveSeries?.stepsPerWave ?? null,
      escalationStepsPerWave: escalationTiers.map((tier) => tier?.stepsPerWave ?? null),
      tenYearHorizonCount: tenYearHorizon.length,
      automationRoleCount: roles.length,
    },
  };
}

function inspectLocalConfig({ configPath, failures }) {
  try {
    const personalPlan = runFixedPlan([], configPath);
    const canonicalPlan = runFixedPlan(["--canonicalize-public"], configPath);
    const personal = personalPlan.before;
    const canonical = canonicalPlan.before;
    const attention = [];
    if (personal.personalSeisPluginRecordCount !== 0) attention.push("remove-personal-seis-records");
    if (canonical.embeddedPublicSourceRecordCount !== 0) attention.push("canonicalize-embedded-direct-public-records");
    if (canonical.canonicalPublicPluginEnabled !== true) attention.push("enable-canonical-public-seis-agent");
    if (canonical.seisRepoPluginRecordCount < 1) attention.push("restore-canonical-public-seis-agent");

    return {
      status: attention.length === 0 ? "ready-for-manual-codex-ui-review" : "local-config-attention",
      canonicalPublicPluginEnabled: canonical.canonicalPublicPluginEnabled === true,
      personalSeisPluginRecordCount: personal.personalSeisPluginRecordCount,
      personalSeisPluginEnabledCount: personal.personalSeisPluginEnabledCount,
      seisRepoPluginRecordCount: canonical.seisRepoPluginRecordCount,
      seisRepoPluginEnabledCount: canonical.seisRepoPluginEnabledCount,
      embeddedDirectPublicRecordCount: canonical.embeddedPublicSourceRecordCount,
      optionalBundleRecordCount: canonicalPlan.canonicalDefaultProfile?.preservedOptionalBundleRecordCount ?? null,
      unmanagedPublicRecordCount: canonicalPlan.canonicalDefaultProfile?.unmanagedPublicRecordCount ?? null,
      recommendedActions: attention,
      configPathDisclosed: false,
      writesPerformed: false,
    };
  } catch (_error) {
    failures.push("fixed plan-only local configuration inspection was unavailable");
    return {
      status: "local-config-attention",
      configPathDisclosed: false,
      writesPerformed: false,
      recommendedActions: ["run-approved-local-readiness-plan"],
    };
  }
}

function runFixedPlan(actionArgs, configPath) {
  const runner = resolveRepositoryPath(paths.switch);
  const commandArgs = [runner, "--plan", ...actionArgs];
  if (configPath) commandArgs.push("--config", configPath);
  const result = spawnSync(process.execPath, commandArgs, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: MAX_PLAN_OUTPUT_BYTES,
    shell: false,
  });
  if (result.status !== 0 || typeof result.stdout !== "string" || result.stdout.length > MAX_PLAN_OUTPUT_BYTES) {
    fail("fixed plan-only local configuration command failed");
  }
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch (_error) {
    fail("fixed plan-only local configuration command returned invalid JSON");
  }
  if (
    report?.schemaVersion !== 1 ||
    report?.id !== "seis-public-marketplace-switch" ||
    report?.mode !== "plan" ||
    report?.writesPerformed !== false ||
    typeof report?.before !== "object"
  ) {
    fail("fixed plan-only local configuration contract is invalid");
  }
  return report;
}

function ensure(condition, message, failures) {
  if (!condition) failures.push(message);
}

function resolveRepositoryPath(relativePath) {
  const filePath = path.resolve(root, relativePath);
  const relative = path.relative(root, filePath);
  if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
    fail("repository path escaped its declared root");
  }
  return filePath;
}

function printHelp() {
  console.log([
    "Usage:",
    "  node scripts/check-seis-public-plugin-user-readiness.mjs --check",
    "  node scripts/check-seis-public-plugin-user-readiness.mjs --check --local-config [--config <temporary-fixture>]",
    "",
    "The default report reads only committed repository artifacts.",
    "--local-config invokes fixed plan-only migration commands and returns aggregate counts only; it never applies a config change.",
  ].join("\n"));
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function fail(message) {
  throw new Error(`SEIS public plugin user readiness: ${message}`);
}
