#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];

const files = {
  matrix: "deploy/seis-ssh-direct-cloud-provider-matrix.json",
  doc: "docs/deployment/seis-ssh-direct-cloud-provider-matrix.md",
  roadmap: "deploy/seis-ssh-cloud-roadmap.json",
  accessModel: "deploy/seis-ssh-access-model.json",
  publicContract: "deploy/seis-ssh-public-access-contract.json",
  oraclePlan: "deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json",
  reportBoundaryGuard: "scripts/check-seis-ssh-report-boundary.mjs",
  activationPlanner: "scripts/create-seis-ssh-direct-cloud-activation-plan.mjs",
  activationPlanDoc: "docs/deployment/seis-ssh-direct-cloud-activation-plan.md",
  oraclePlanner: "scripts/create-seis-ssh-oracle-free-tier-plan.mjs",
  oracleCloudInitHandoff: "scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs",
  oracleInstanceLaunchPlan: "scripts/create-seis-ssh-oracle-instance-launch-plan.mjs",
  oracleOwnerInputTemplate: "scripts/create-seis-ssh-oracle-owner-input-template.mjs",
  oracleOwnerPreflight: "scripts/create-seis-ssh-oracle-owner-preflight.mjs",
  oracleOwnerLaunchCommand: "scripts/create-seis-ssh-oracle-owner-launch-command.mjs",
  oracleOwnerHandoffBundle: "scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs",
  oracleOwnerActionPacket: "scripts/create-seis-ssh-oracle-owner-action-packet.mjs",
  oraclePostBootHandoff: "scripts/create-seis-ssh-oracle-postboot-handoff.mjs",
  oracleDirectCloudPipeline: "scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs",
  cloudflareAccessPlan: "scripts/create-seis-ssh-cloudflare-access-plan.mjs",
  githubCodespacesFallbackPlan: "scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs",
  providerStatusBoard: "scripts/create-seis-ssh-provider-status-board.mjs",
  readinessClaimGate: "scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs",
  oracleRunbook: "docs/deployment/seis-ssh-oracle-free-tier-direct-cloud.md",
  directCloudSwitch: "scripts/switch-seis-ssh-direct-cloud.mjs",
  directCloudActivate: "scripts/activate-seis-ssh-direct-cloud.mjs",
  packageJson: "package.json",
  gitignore: ".gitignore"
};

for (const file of Object.values(files)) read(file);

const matrix = readJson(files.matrix);
const roadmap = readJson(files.roadmap);
const accessModel = readJson(files.accessModel);
const publicContract = readJson(files.publicContract);
const oraclePlan = readJson(files.oraclePlan);
const packageJson = readJson(files.packageJson);
const scripts = packageJson?.scripts || {};
const providers = new Map((matrix?.providers || []).map((provider) => [provider.id, provider]));

ensure(matrix?.id === "seis-ssh-direct-cloud-provider-matrix", "matrix id must be stable");
ensure(matrix?.status === "planning-active", "matrix status must be planning-active");
ensure(matrix?.reportBoundaryGuard?.script === files.reportBoundaryGuard, "matrix must link report boundary guard script");
ensure(matrix?.reportBoundaryGuard?.checkCommand === "npm run check:seis-ssh-report-boundary", "matrix must link report boundary guard check command");
ensure(matrix?.reportBoundaryGuard?.generatedReportsIgnored === true, "matrix must require generated reports to stay ignored");
ensure(matrix?.reportBoundaryGuard?.sourceContractsCommittable === true, "matrix must require source contracts to stay committable");
ensure(matrix?.reportBoundaryGuard?.callsProviderApis === false, "report boundary guard must not call provider APIs");
ensure(matrix?.reportBoundaryGuard?.createsVm === false, "report boundary guard must not create VMs");
ensure(matrix?.reportBoundaryGuard?.opensSshSession === false, "report boundary guard must not open SSH");
ensure(matrix?.reportBoundaryGuard?.writesSshConfig === false, "report boundary guard must not write SSH config");
ensure(matrix?.reportBoundaryGuard?.readsPrivateKey === false, "report boundary guard must not read private keys");
ensure(matrix?.reportBoundaryGuard?.printsSecrets === false, "report boundary guard must not print secrets");
ensure(matrix?.targetAlias === "SEIS-SSH", "matrix must target SEIS-SSH");
ensure(matrix?.qualityGate === "npm run check:seis-ssh-direct-cloud-provider-matrix", "matrix must expose quality gate");
ensure((matrix?.sourceContracts || []).includes(files.oraclePlan), "matrix must link Oracle free-tier plan source");
ensure(matrix?.activationPlanner?.script === files.activationPlanner, "matrix must link activation planner script");
ensure(matrix?.activationPlanner?.runbook === files.activationPlanDoc, "matrix must link activation planner runbook");
ensure(matrix?.activationPlanner?.opensSshSession === false, "activation planner must not open SSH");
ensure(matrix?.activationPlanner?.writesSshConfig === false, "activation planner must not write SSH config");
ensure(matrix?.activationPlanner?.callsProviderApis === false, "activation planner must not call provider APIs");
ensure(matrix?.activationPlanner?.printsSecrets === false, "activation planner must not print secrets");
ensure(matrix?.activationPlanner?.mode === "read-only-no-auth-no-cloud-mutation-no-config-write-no-live-ssh", "activation planner mode must be read-only and non-mutating");
ensure(matrix?.oracleFreeTierPlanner?.script === files.oraclePlanner, "matrix must link Oracle planner script");
ensure(matrix?.oracleFreeTierPlanner?.runbook === files.oracleRunbook, "matrix must link Oracle planner runbook");
ensure(matrix?.oracleFreeTierPlanner?.contract === files.oraclePlan, "matrix must link Oracle planner contract");
ensure(matrix?.oracleFreeTierPlanner?.callsProviderApis === false, "Oracle planner must not call provider APIs");
ensure(matrix?.oracleFreeTierPlanner?.createsVm === false, "Oracle planner must not create VMs");
ensure(matrix?.oracleFreeTierPlanner?.opensSshSession === false, "Oracle planner must not open SSH");
ensure(matrix?.oracleFreeTierPlanner?.writesSshConfig === false, "Oracle planner must not write SSH config");
ensure(matrix?.oracleFreeTierPlanner?.printsSecrets === false, "Oracle planner must not print secrets");
ensure(matrix?.oracleCloudInitHandoff?.script === files.oracleCloudInitHandoff, "matrix must link Oracle cloud-init handoff script");
ensure(matrix?.oracleCloudInitHandoff?.contract === files.oraclePlan, "matrix must link Oracle cloud-init handoff contract");
ensure(matrix?.oracleCloudInitHandoff?.callsProviderApis === false, "Oracle cloud-init handoff must not call provider APIs");
ensure(matrix?.oracleCloudInitHandoff?.createsVm === false, "Oracle cloud-init handoff must not create VMs");
ensure(matrix?.oracleCloudInitHandoff?.opensSshSession === false, "Oracle cloud-init handoff must not open SSH");
ensure(matrix?.oracleCloudInitHandoff?.writesSshConfig === false, "Oracle cloud-init handoff must not write SSH config");
ensure(matrix?.oracleCloudInitHandoff?.readsPrivateKey === false, "Oracle cloud-init handoff must not read private keys");
ensure(matrix?.oracleCloudInitHandoff?.printsSecrets === false, "Oracle cloud-init handoff must not print secrets");
ensure(matrix?.oracleInstanceLaunchPlan?.script === files.oracleInstanceLaunchPlan, "matrix must link Oracle instance launch plan script");
ensure(matrix?.oracleInstanceLaunchPlan?.contract === files.oraclePlan, "matrix must link Oracle instance launch plan contract");
ensure(matrix?.oracleInstanceLaunchPlan?.callsProviderApis === false, "Oracle instance launch plan must not call provider APIs");
ensure(matrix?.oracleInstanceLaunchPlan?.createsVm === false, "Oracle instance launch plan must not create VMs");
ensure(matrix?.oracleInstanceLaunchPlan?.opensSshSession === false, "Oracle instance launch plan must not open SSH");
ensure(matrix?.oracleInstanceLaunchPlan?.writesSshConfig === false, "Oracle instance launch plan must not write SSH config");
ensure(matrix?.oracleInstanceLaunchPlan?.readsPrivateKey === false, "Oracle instance launch plan must not read private keys");
ensure(matrix?.oracleInstanceLaunchPlan?.printsSecrets === false, "Oracle instance launch plan must not print secrets");
ensure(matrix?.oracleOwnerInputTemplate?.script === files.oracleOwnerInputTemplate, "matrix must link Oracle owner input template script");
ensure(matrix?.oracleOwnerInputTemplate?.contract === files.oraclePlan, "matrix must link Oracle owner input template contract");
ensure(matrix?.oracleOwnerInputTemplate?.committable === false, "Oracle owner input template must be ignored and non-committable");
ensure(matrix?.oracleOwnerInputTemplate?.preservesExistingFileByDefault === true, "Oracle owner input template must preserve existing local file by default");
ensure(matrix?.oracleOwnerInputTemplate?.forceRequiredToOverwrite === true, "Oracle owner input template must require force before overwriting");
ensure(matrix?.oracleOwnerInputTemplate?.callsProviderApis === false, "Oracle owner input template must not call provider APIs");
ensure(matrix?.oracleOwnerInputTemplate?.createsVm === false, "Oracle owner input template must not create VMs");
ensure(matrix?.oracleOwnerInputTemplate?.opensSshSession === false, "Oracle owner input template must not open SSH");
ensure(matrix?.oracleOwnerInputTemplate?.writesSshConfig === false, "Oracle owner input template must not write SSH config");
ensure(matrix?.oracleOwnerInputTemplate?.readsPrivateKey === false, "Oracle owner input template must not read private keys");
ensure(matrix?.oracleOwnerInputTemplate?.printsSecrets === false, "Oracle owner input template must not print secrets");
ensure(matrix?.oracleOwnerPreflight?.script === files.oracleOwnerPreflight, "matrix must link Oracle owner preflight script");
ensure(matrix?.oracleOwnerPreflight?.contract === files.oraclePlan, "matrix must link Oracle owner preflight contract");
ensure(matrix?.oracleOwnerPreflight?.callsProviderApis === false, "Oracle owner preflight must not call provider APIs");
ensure(matrix?.oracleOwnerPreflight?.createsVm === false, "Oracle owner preflight must not create VMs");
ensure(matrix?.oracleOwnerPreflight?.opensSshSession === false, "Oracle owner preflight must not open SSH");
ensure(matrix?.oracleOwnerPreflight?.writesSshConfig === false, "Oracle owner preflight must not write SSH config");
ensure(matrix?.oracleOwnerPreflight?.readsPrivateKey === false, "Oracle owner preflight must not read private keys");
ensure(matrix?.oracleOwnerPreflight?.readsOciConfigContents === false, "Oracle owner preflight must not read OCI config contents");
ensure(matrix?.oracleOwnerPreflight?.printsSecrets === false, "Oracle owner preflight must not print secrets");
ensure(matrix?.oracleOwnerLaunchCommand?.script === files.oracleOwnerLaunchCommand, "matrix must link Oracle owner launch command script");
ensure(matrix?.oracleOwnerLaunchCommand?.contract === files.oraclePlan, "matrix must link Oracle owner launch command contract");
ensure(matrix?.oracleOwnerLaunchCommand?.shellScriptCommittable === false, "Oracle owner launch command shell script must be non-committable");
ensure(matrix?.oracleOwnerLaunchCommand?.printsRawOwnerValuesInReports === false, "Oracle owner launch command reports must not print raw owner values");
ensure(matrix?.oracleOwnerLaunchCommand?.preservesExistingShellByDefault === true, "Oracle owner launch command must preserve existing shell handoff by default");
ensure(matrix?.oracleOwnerLaunchCommand?.forceRequiredToOverwrite === true, "Oracle owner launch command must require force before overwriting shell handoff");
ensure(matrix?.oracleOwnerLaunchCommand?.callsProviderApis === false, "Oracle owner launch command must not call provider APIs");
ensure(matrix?.oracleOwnerLaunchCommand?.createsVm === false, "Oracle owner launch command must not create VMs");
ensure(matrix?.oracleOwnerLaunchCommand?.opensSshSession === false, "Oracle owner launch command must not open SSH");
ensure(matrix?.oracleOwnerLaunchCommand?.writesSshConfig === false, "Oracle owner launch command must not write SSH config");
ensure(matrix?.oracleOwnerLaunchCommand?.readsPrivateKey === false, "Oracle owner launch command must not read private keys");
ensure(matrix?.oracleOwnerLaunchCommand?.readsOciConfigContents === false, "Oracle owner launch command must not read OCI config contents");
ensure(matrix?.oracleOwnerLaunchCommand?.printsSecrets === false, "Oracle owner launch command must not print secrets");
ensure(matrix?.oracleOwnerHandoffBundle?.script === files.oracleOwnerHandoffBundle, "matrix must link Oracle owner handoff bundle script");
ensure(matrix?.oracleOwnerHandoffBundle?.contract === files.oraclePlan, "matrix must link Oracle owner handoff bundle contract");
ensure(matrix?.oracleOwnerHandoffBundle?.printsRawOwnerValues === false, "Oracle owner handoff bundle must not print raw owner values");
ensure(matrix?.oracleOwnerHandoffBundle?.callsProviderApis === false, "Oracle owner handoff bundle must not call provider APIs");
ensure(matrix?.oracleOwnerHandoffBundle?.createsVm === false, "Oracle owner handoff bundle must not create VMs");
ensure(matrix?.oracleOwnerHandoffBundle?.opensSshSession === false, "Oracle owner handoff bundle must not open SSH");
ensure(matrix?.oracleOwnerHandoffBundle?.writesSshConfig === false, "Oracle owner handoff bundle must not write SSH config");
ensure(matrix?.oracleOwnerHandoffBundle?.readsPrivateKey === false, "Oracle owner handoff bundle must not read private keys");
ensure(matrix?.oracleOwnerHandoffBundle?.readsOciConfigContents === false, "Oracle owner handoff bundle must not read OCI config contents");
ensure(matrix?.oracleOwnerHandoffBundle?.printsSecrets === false, "Oracle owner handoff bundle must not print secrets");
ensure(matrix?.oracleOwnerActionPacket?.script === files.oracleOwnerActionPacket, "matrix must link Oracle owner action packet script");
ensure(matrix?.oracleOwnerActionPacket?.contract === files.oraclePlan, "matrix must link Oracle owner action packet contract");
ensure(matrix?.oracleOwnerActionPacket?.printsRawOwnerValues === false, "Oracle owner action packet must not print raw owner values");
ensure(matrix?.oracleOwnerActionPacket?.callsProviderApis === false, "Oracle owner action packet must not call provider APIs");
ensure(matrix?.oracleOwnerActionPacket?.createsVm === false, "Oracle owner action packet must not create VMs");
ensure(matrix?.oracleOwnerActionPacket?.opensSshSession === false, "Oracle owner action packet must not open SSH");
ensure(matrix?.oracleOwnerActionPacket?.writesSshConfig === false, "Oracle owner action packet must not write SSH config");
ensure(matrix?.oracleOwnerActionPacket?.readsPrivateKey === false, "Oracle owner action packet must not read private keys");
ensure(matrix?.oracleOwnerActionPacket?.readsOciConfigContents === false, "Oracle owner action packet must not read OCI config contents");
ensure(matrix?.oracleOwnerActionPacket?.printsSecrets === false, "Oracle owner action packet must not print secrets");
ensure(matrix?.oraclePostBootHandoff?.script === files.oraclePostBootHandoff, "matrix must link Oracle post-boot handoff script");
ensure(matrix?.oraclePostBootHandoff?.contract === files.oraclePlan, "matrix must link Oracle post-boot handoff contract");
ensure(matrix?.oraclePostBootHandoff?.callsProviderApis === false, "Oracle post-boot handoff must not call provider APIs");
ensure(matrix?.oraclePostBootHandoff?.createsVm === false, "Oracle post-boot handoff must not create VMs");
ensure(matrix?.oraclePostBootHandoff?.opensSshSession === false, "Oracle post-boot handoff must not open SSH");
ensure(matrix?.oraclePostBootHandoff?.writesSshConfig === false, "Oracle post-boot handoff must not write SSH config");
ensure(matrix?.oraclePostBootHandoff?.readsPrivateKey === false, "Oracle post-boot handoff must not read private keys");
ensure(matrix?.oraclePostBootHandoff?.printsSecrets === false, "Oracle post-boot handoff must not print secrets");
ensure(matrix?.oracleDirectCloudPipeline?.script === files.oracleDirectCloudPipeline, "matrix must link Oracle direct-cloud pipeline script");
ensure(matrix?.oracleDirectCloudPipeline?.contract === files.oraclePlan, "matrix must link Oracle direct-cloud pipeline contract");
ensure(matrix?.oracleDirectCloudPipeline?.callsProviderApis === false, "Oracle direct-cloud pipeline must not call provider APIs");
ensure(matrix?.oracleDirectCloudPipeline?.createsVm === false, "Oracle direct-cloud pipeline must not create VMs");
ensure(matrix?.oracleDirectCloudPipeline?.opensSshSession === false, "Oracle direct-cloud pipeline must not open SSH");
ensure(matrix?.oracleDirectCloudPipeline?.writesSshConfig === false, "Oracle direct-cloud pipeline must not write SSH config");
ensure(matrix?.oracleDirectCloudPipeline?.readsPrivateKey === false, "Oracle direct-cloud pipeline must not read private keys");
ensure(matrix?.oracleDirectCloudPipeline?.printsSecrets === false, "Oracle direct-cloud pipeline must not print secrets");
ensure(matrix?.cloudflareAccessPlan?.script === files.cloudflareAccessPlan, "matrix must link Cloudflare Access plan script");
ensure(matrix?.cloudflareAccessPlan?.checkCommand === "npm run check:seis-ssh-cloudflare-access-plan", "matrix must link Cloudflare Access plan check");
ensure(matrix?.cloudflareAccessPlan?.reportCommand === "npm run cloud:ssh:cloudflare-access:plan", "matrix must link Cloudflare Access plan report command");
ensure(matrix?.cloudflareAccessPlan?.requiresApprovedCloudOrigin === true, "Cloudflare Access plan must require approved cloud origin");
ensure(matrix?.cloudflareAccessPlan?.localMacOriginAllowed === false, "Cloudflare Access plan must reject local Mac origin");
ensure(matrix?.cloudflareAccessPlan?.callsProviderApis === false, "Cloudflare Access plan must not call provider APIs");
ensure(matrix?.cloudflareAccessPlan?.createsVm === false, "Cloudflare Access plan must not create VMs");
ensure(matrix?.cloudflareAccessPlan?.opensSshSession === false, "Cloudflare Access plan must not open SSH");
ensure(matrix?.cloudflareAccessPlan?.writesSshConfig === false, "Cloudflare Access plan must not write SSH config");
ensure(matrix?.cloudflareAccessPlan?.readsPrivateKey === false, "Cloudflare Access plan must not read private keys");
ensure(matrix?.cloudflareAccessPlan?.readsTunnelCredentials === false, "Cloudflare Access plan must not read tunnel credentials");
ensure(matrix?.cloudflareAccessPlan?.printsSecrets === false, "Cloudflare Access plan must not print secrets");
ensure(matrix?.githubCodespacesFallbackPlan?.script === files.githubCodespacesFallbackPlan, "matrix must link GitHub Codespaces fallback plan script");
ensure(matrix?.githubCodespacesFallbackPlan?.checkCommand === "npm run check:seis-ssh-github-codespaces-fallback-plan", "matrix must link GitHub Codespaces fallback plan check");
ensure(matrix?.githubCodespacesFallbackPlan?.reportCommand === "npm run cloud:ssh:github-codespaces:fallback-plan", "matrix must link GitHub Codespaces fallback plan report command");
ensure(matrix?.githubCodespacesFallbackPlan?.mode === "local-github-codespaces-fallback-plan-no-auth-status-no-live-ssh-no-config-write", "GitHub Codespaces fallback plan mode must remain local-only");
ensure(matrix?.githubCodespacesFallbackPlan?.fallbackOnly === true, "GitHub Codespaces fallback plan must stay fallback-only");
ensure(matrix?.githubCodespacesFallbackPlan?.supportsMobile24x7WhenVerified === false, "GitHub Codespaces fallback plan must not claim mobile 24x7 readiness");
ensure(matrix?.githubCodespacesFallbackPlan?.callsProviderApis === false, "GitHub Codespaces fallback plan must not call provider APIs");
ensure(matrix?.githubCodespacesFallbackPlan?.createsVm === false, "GitHub Codespaces fallback plan must not create VMs");
ensure(matrix?.githubCodespacesFallbackPlan?.opensSshSession === false, "GitHub Codespaces fallback plan must not open SSH");
ensure(matrix?.githubCodespacesFallbackPlan?.writesSshConfig === false, "GitHub Codespaces fallback plan must not write SSH config");
ensure(matrix?.githubCodespacesFallbackPlan?.readsPrivateKey === false, "GitHub Codespaces fallback plan must not read private keys");
ensure(matrix?.githubCodespacesFallbackPlan?.printsSecrets === false, "GitHub Codespaces fallback plan must not print secrets");
ensure(matrix?.providerStatusBoard?.script === files.providerStatusBoard, "matrix must link provider status board script");
ensure(matrix?.providerStatusBoard?.checkCommand === "npm run check:seis-ssh-provider-status-board", "matrix must link provider status board check");
ensure(matrix?.providerStatusBoard?.reportCommand === "npm run cloud:ssh:provider-status:board", "matrix must link provider status board report command");
ensure(matrix?.providerStatusBoard?.mode === "local-provider-status-board-no-provider-api-no-live-ssh-no-config-write", "provider status board mode must remain local-only");
ensure((matrix?.providerStatusBoard?.summarizesProviders || []).includes("oracle-cloud-free-tier"), "provider status board must summarize Oracle");
ensure((matrix?.providerStatusBoard?.summarizesProviders || []).includes("github-codespaces"), "provider status board must summarize GitHub Codespaces");
ensure((matrix?.providerStatusBoard?.summarizesProviders || []).includes("cloudflare-access-tunnel"), "provider status board must summarize Cloudflare");
ensure((matrix?.providerStatusBoard?.summarizesProviders || []).includes("direct-cloud-readiness-claim"), "provider status board must summarize readiness claim");
ensure(matrix?.providerStatusBoard?.callsProviderApis === false, "provider status board must not call provider APIs");
ensure(matrix?.providerStatusBoard?.createsVm === false, "provider status board must not create VMs");
ensure(matrix?.providerStatusBoard?.opensSshSession === false, "provider status board must not open SSH");
ensure(matrix?.providerStatusBoard?.writesSshConfig === false, "provider status board must not write SSH config");
ensure(matrix?.providerStatusBoard?.readsPrivateKey === false, "provider status board must not read private keys");
ensure(matrix?.providerStatusBoard?.printsSecrets === false, "provider status board must not print secrets");
ensure(matrix?.readinessClaimGate?.script === files.readinessClaimGate, "matrix must link direct-cloud readiness claim gate script");
ensure(matrix?.readinessClaimGate?.callsProviderApis === false, "readiness claim gate must not call provider APIs");
ensure(matrix?.readinessClaimGate?.createsVm === false, "readiness claim gate must not create VMs");
ensure(matrix?.readinessClaimGate?.opensSshSession === false, "readiness claim gate must not open SSH");
ensure(matrix?.readinessClaimGate?.writesSshConfig === false, "readiness claim gate must not write SSH config");
ensure(matrix?.readinessClaimGate?.readsPrivateKey === false, "readiness claim gate must not read private keys");
ensure(matrix?.readinessClaimGate?.printsSecrets === false, "readiness claim gate must not print secrets");
ensure(matrix?.readinessClaimGate?.allowsReadyClaimOnlyAfterStrictDoctor === true, "readiness claim gate must require strict doctor evidence");
ensure(matrix?.decisionPolicy?.singleAliasInvariant === "SEIS-SSH", "matrix must preserve single alias");
ensure((matrix?.decisionPolicy?.serverAndPortInvariant || "").includes("Keep the same server and port"), "matrix must preserve server and port invariant");
ensure(matrix?.decisionPolicy?.activeRecommendation?.path === "oracle-cloud-free-tier -> direct-cloud SSH -> optional Cloudflare Access layer -> SEIS-SSH", "active recommendation must prefer Oracle direct-cloud with optional Cloudflare layer");

for (const id of [
  "oracle-cloud-free-tier",
  "github-codespaces",
  "cloudflare-access-tunnel",
  "google-cloud-compute"
]) {
  ensure(providers.has(id), `matrix must include ${id}`);
  ensure((matrix?.decisionPolicy?.recommendedOrder || []).includes(id), `recommended order must include ${id}`);
}

const oracle = providers.get("oracle-cloud-free-tier") || {};
ensure(oraclePlan?.id === "seis-ssh-oracle-free-tier-direct-cloud-plan", "Oracle plan id must be stable");
ensure(oraclePlan?.providerId === "oracle-cloud-free-tier", "Oracle plan must target Oracle provider");
ensure(oraclePlan?.planner?.script === files.oraclePlanner, "Oracle plan must link planner script");
ensure(oraclePlan?.planner?.runbook === files.oracleRunbook, "Oracle plan must link runbook");
ensure(oraclePlan?.planner?.callsProviderApis === false, "Oracle plan must stay non-mutating");
ensure(oraclePlan?.planner?.createsVm === false, "Oracle plan must not create VMs");
ensure(oraclePlan?.cloudInitHandoff?.script === files.oracleCloudInitHandoff, "Oracle plan must link cloud-init handoff script");
ensure(oraclePlan?.cloudInitHandoff?.callsProviderApis === false, "Oracle cloud-init handoff must stay local-only");
ensure(oraclePlan?.cloudInitHandoff?.readsPrivateKey === false, "Oracle cloud-init handoff must not read private keys");
ensure(oraclePlan?.instanceLaunchPlan?.script === files.oracleInstanceLaunchPlan, "Oracle plan must link instance launch plan script");
ensure(oraclePlan?.instanceLaunchPlan?.callsProviderApis === false, "Oracle instance launch plan must stay local-only");
ensure(oraclePlan?.instanceLaunchPlan?.createsVm === false, "Oracle instance launch plan must not create VMs");
ensure(oraclePlan?.ownerInputTemplate?.script === files.oracleOwnerInputTemplate, "Oracle plan must link owner input template script");
ensure(oraclePlan?.ownerInputTemplate?.committable === false, "Oracle owner input template must stay ignored");
ensure(oraclePlan?.ownerInputTemplate?.preservesExistingFileByDefault === true, "Oracle owner input template must preserve local owner values by default");
ensure(oraclePlan?.ownerInputTemplate?.forceRequiredToOverwrite === true, "Oracle owner input template must require force to overwrite local owner values");
ensure(oraclePlan?.ownerInputTemplate?.callsProviderApis === false, "Oracle owner input template must stay local-only");
ensure(oraclePlan?.ownerPreflight?.script === files.oracleOwnerPreflight, "Oracle plan must link owner preflight script");
ensure(oraclePlan?.ownerPreflight?.callsProviderApis === false, "Oracle owner preflight must stay local-only");
ensure(oraclePlan?.ownerPreflight?.createsVm === false, "Oracle owner preflight must not create VMs");
ensure(oraclePlan?.ownerPreflight?.readsOciConfigContents === false, "Oracle owner preflight must not read OCI config contents");
ensure(oraclePlan?.ownerLaunchCommand?.script === files.oracleOwnerLaunchCommand, "Oracle plan must link owner launch command script");
ensure(oraclePlan?.ownerLaunchCommand?.shellScriptCommittable === false, "Oracle owner launch command shell script must stay ignored");
ensure(oraclePlan?.ownerLaunchCommand?.printsRawOwnerValuesInReports === false, "Oracle owner launch command reports must not print raw owner values");
ensure(oraclePlan?.ownerLaunchCommand?.callsProviderApis === false, "Oracle owner launch command must stay local-only");
ensure(oraclePlan?.ownerLaunchCommand?.createsVm === false, "Oracle owner launch command must not create VMs");
ensure(oraclePlan?.ownerHandoffBundle?.script === files.oracleOwnerHandoffBundle, "Oracle plan must link owner handoff bundle script");
ensure(oraclePlan?.ownerHandoffBundle?.printsRawOwnerValues === false, "Oracle owner handoff bundle must not print raw owner values");
ensure(oraclePlan?.ownerHandoffBundle?.callsProviderApis === false, "Oracle owner handoff bundle must stay local-only");
ensure(oraclePlan?.ownerHandoffBundle?.createsVm === false, "Oracle owner handoff bundle must not create VMs");
ensure(oraclePlan?.ownerActionPacket?.script === files.oracleOwnerActionPacket, "Oracle plan must link owner action packet script");
ensure(oraclePlan?.ownerActionPacket?.printsRawOwnerValues === false, "Oracle owner action packet must not print raw owner values");
ensure(oraclePlan?.ownerActionPacket?.callsProviderApis === false, "Oracle owner action packet must stay local-only");
ensure(oraclePlan?.ownerActionPacket?.createsVm === false, "Oracle owner action packet must not create VMs");
ensure(oraclePlan?.ownerActionPacket?.opensSshSession === false, "Oracle owner action packet must not open SSH");
ensure(oraclePlan?.postBootHandoff?.script === files.oraclePostBootHandoff, "Oracle plan must link post-boot handoff script");
ensure(oraclePlan?.postBootHandoff?.callsProviderApis === false, "Oracle post-boot handoff must stay local-only");
ensure(oraclePlan?.postBootHandoff?.opensSshSession === false, "Oracle post-boot handoff must not open SSH");
ensure(oraclePlan?.postBootHandoff?.writesSshConfig === false, "Oracle post-boot handoff must not write SSH config");
ensure(oraclePlan?.directCloudPipeline?.script === files.oracleDirectCloudPipeline, "Oracle plan must link direct-cloud pipeline script");
ensure(oraclePlan?.directCloudPipeline?.callsProviderApis === false, "Oracle direct-cloud pipeline must stay local-only");
ensure(oraclePlan?.directCloudPipeline?.opensSshSession === false, "Oracle direct-cloud pipeline must not open SSH");
ensure(oraclePlan?.directCloudPipeline?.writesSshConfig === false, "Oracle direct-cloud pipeline must not write SSH config");
ensure(oraclePlan?.optionalGithubCodespacesFallbackPlan?.script === files.githubCodespacesFallbackPlan, "Oracle plan must link optional GitHub Codespaces fallback plan script");
ensure(oraclePlan?.optionalGithubCodespacesFallbackPlan?.fallbackOnly === true, "Oracle optional GitHub Codespaces fallback plan must stay fallback-only");
ensure(oraclePlan?.optionalGithubCodespacesFallbackPlan?.supportsMobile24x7WhenVerified === false, "Oracle optional GitHub Codespaces fallback plan must not claim mobile 24x7 readiness");
ensure(oraclePlan?.optionalGithubCodespacesFallbackPlan?.callsProviderApis === false, "Oracle optional GitHub Codespaces fallback plan must stay local-only");
ensure(oraclePlan?.optionalGithubCodespacesFallbackPlan?.opensSshSession === false, "Oracle optional GitHub Codespaces fallback plan must not open SSH");
ensure(oraclePlan?.optionalCloudflareAccessPlan?.script === files.cloudflareAccessPlan, "Oracle plan must link optional Cloudflare Access plan script");
ensure(oraclePlan?.optionalCloudflareAccessPlan?.requiresApprovedCloudOrigin === true, "Oracle optional Cloudflare plan must require approved cloud origin");
ensure(oraclePlan?.optionalCloudflareAccessPlan?.localMacOriginAllowed === false, "Oracle optional Cloudflare plan must reject local Mac origin");
ensure(oraclePlan?.optionalCloudflareAccessPlan?.callsProviderApis === false, "Oracle optional Cloudflare plan must stay local-only");
ensure(oraclePlan?.optionalCloudflareAccessPlan?.opensSshSession === false, "Oracle optional Cloudflare plan must not open SSH");
ensure(oraclePlan?.optionalCloudflareAccessPlan?.readsTunnelCredentials === false, "Oracle optional Cloudflare plan must not read tunnel credentials");
ensure(oracle.role === "primary-direct-cloud-candidate", "Oracle must be primary direct-cloud candidate");
ensure(oracle.providesComputeVm === true, "Oracle must provide compute VM");
ensure(oracle.supportsDirectSsh === true, "Oracle must support direct SSH");
ensure(oracle.supportsGenericPicker === true, "Oracle must support generic picker");
ensure(oracle.supportsMobile24x7WhenVerified === true, "Oracle can support mobile 24x7 when verified");
ensure(oracle.requiresPublicKeyInstall === true, "Oracle must require public key install");
ensure(oracle.requiresLocalPrivateKeySharing === false, "Oracle must not require private key sharing");

const codespaces = providers.get("github-codespaces") || {};
ensure(codespaces.role === "terminal-compatible-development-fallback", "Codespaces must be fallback");
ensure(codespaces.supportsDirectSsh === false, "Codespaces must not be modeled as direct SSH");
ensure(codespaces.supportsGenericPicker === false, "Codespaces must not be picker-compatible");
ensure(codespaces.supportsMobile24x7WhenVerified === false, "Codespaces must not be mobile 24x7");
ensure((codespaces.blockers || []).some((item) => item.includes("budget")), "Codespaces blockers must include budget risk");

const cloudflare = providers.get("cloudflare-access-tunnel") || {};
ensure(cloudflare.role === "identity-aware-access-layer-not-vm", "Cloudflare must be access layer, not VM");
ensure(cloudflare.providesComputeVm === false, "Cloudflare must not be modeled as VM");
ensure(cloudflare.supportsDirectSsh === false, "Cloudflare tunnel must not be modeled as direct SSH by itself");
ensure((cloudflare.blockers || []).some((item) => item.includes("local Mac")), "Cloudflare blockers must reject local Mac tunneling");

const gcp = providers.get("google-cloud-compute") || {};
ensure(gcp.providesComputeVm === true, "GCP must provide compute VM");
ensure(gcp.supportsDirectSsh === true, "GCP must support direct SSH");
ensure(gcp.supportsMobile24x7WhenVerified === true, "GCP can support mobile 24x7 when verified");
ensure((gcp.blockers || []).some((item) => item.includes("billing")), "GCP blockers must include billing");
ensure((gcp.blockers || []).some((item) => item.includes("IAM")), "GCP blockers must include IAM");

for (const forbidden of ["local-mac-cloudflare-tunnel", "shared-private-key", "duplicate-picker-alias"]) {
  ensure((matrix?.forbiddenDefaultPaths || []).some((entry) => entry.id === forbidden), `matrix must forbid ${forbidden}`);
}

ensure(roadmap?.directCloudProviderMatrix === files.matrix, "roadmap must link provider matrix");
ensure(accessModel?.longTermDevelopment?.directCloudProviderMatrix === files.matrix, "access model must link provider matrix");
ensure(publicContract?.directCloudProviderMatrix === files.matrix, "public contract must link provider matrix");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-direct-cloud-provider-matrix"), "roadmap validation must include matrix check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-github-codespaces-fallback-plan"), "roadmap validation must include GitHub Codespaces fallback plan check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-provider-status-board"), "roadmap validation must include provider status board check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-direct-cloud-provider-matrix"), "access model quality commands must include matrix check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-github-codespaces-fallback-plan"), "access model quality commands must include GitHub Codespaces fallback plan check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-provider-status-board"), "access model quality commands must include provider status board check");
ensure(scripts["check:seis-ssh-direct-cloud-provider-matrix"] === "node scripts/check-seis-ssh-direct-cloud-provider-matrix.mjs", "package script must declare provider matrix check");
ensure(scripts["check:seis-ssh-direct-cloud-readiness-claim"] === "node scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs --check", "package script must declare direct-cloud readiness claim check");
ensure(scripts["cloud:ssh:direct-cloud:claim"] === "node scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs --write", "package script must declare direct-cloud readiness claim report");
ensure(scripts["check:seis-ssh-direct-cloud-activation-plan"] === "node scripts/create-seis-ssh-direct-cloud-activation-plan.mjs --check", "package script must declare activation plan check");
ensure(scripts["cloud:ssh:direct-cloud:plan"] === "node scripts/create-seis-ssh-direct-cloud-activation-plan.mjs --write", "package script must declare activation plan report");
ensure(scripts["check:seis-ssh-report-boundary"] === "node scripts/check-seis-ssh-report-boundary.mjs", "package script must declare report boundary check");
ensure(scripts["check:seis-ssh-oracle-free-tier-plan"] === "node scripts/create-seis-ssh-oracle-free-tier-plan.mjs --check", "package script must declare Oracle plan check");
ensure(scripts["cloud:ssh:oracle-free-tier:plan"] === "node scripts/create-seis-ssh-oracle-free-tier-plan.mjs --write", "package script must declare Oracle plan report");
ensure(scripts["check:seis-ssh-oracle-cloud-init-handoff"] === "node scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs --check", "package script must declare Oracle cloud-init handoff check");
ensure(scripts["cloud:ssh:oracle-cloud-init:handoff"] === "node scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs --write", "package script must declare Oracle cloud-init handoff report");
ensure(scripts["check:seis-ssh-oracle-instance-launch-plan"] === "node scripts/create-seis-ssh-oracle-instance-launch-plan.mjs --check", "package script must declare Oracle instance launch plan check");
ensure(scripts["cloud:ssh:oracle-instance:plan"] === "node scripts/create-seis-ssh-oracle-instance-launch-plan.mjs --write", "package script must declare Oracle instance launch plan report");
ensure(scripts["check:seis-ssh-oracle-owner-input-template"] === "node scripts/create-seis-ssh-oracle-owner-input-template.mjs --check", "package script must declare Oracle owner input template check");
ensure(scripts["cloud:ssh:oracle-owner:template"] === "node scripts/create-seis-ssh-oracle-owner-input-template.mjs --write", "package script must declare Oracle owner input template report");
ensure(scripts["check:seis-ssh-oracle-owner-preflight"] === "node scripts/create-seis-ssh-oracle-owner-preflight.mjs --check", "package script must declare Oracle owner preflight check");
ensure(scripts["cloud:ssh:oracle-owner:preflight"] === "node scripts/create-seis-ssh-oracle-owner-preflight.mjs --write", "package script must declare Oracle owner preflight report");
ensure(scripts["check:seis-ssh-oracle-owner-launch-command"] === "node scripts/create-seis-ssh-oracle-owner-launch-command.mjs --check", "package script must declare Oracle owner launch command check");
ensure(scripts["cloud:ssh:oracle-owner:launch-command"] === "node scripts/create-seis-ssh-oracle-owner-launch-command.mjs --write", "package script must declare Oracle owner launch command report");
ensure(scripts["check:seis-ssh-oracle-owner-handoff"] === "node scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs --check", "package script must declare Oracle owner handoff bundle check");
ensure(scripts["cloud:ssh:oracle-owner:handoff"] === "node scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs --write", "package script must declare Oracle owner handoff bundle report");
ensure(scripts["check:seis-ssh-oracle-owner-action-packet"] === "node scripts/create-seis-ssh-oracle-owner-action-packet.mjs --check", "package script must declare Oracle owner action packet check");
ensure(scripts["cloud:ssh:oracle-owner:action-packet"] === "node scripts/create-seis-ssh-oracle-owner-action-packet.mjs --write --refresh", "package script must declare Oracle owner action packet report");
ensure(scripts["check:seis-ssh-oracle-postboot-handoff"] === "node scripts/create-seis-ssh-oracle-postboot-handoff.mjs --check", "package script must declare Oracle post-boot handoff check");
ensure(scripts["cloud:ssh:oracle-postboot:handoff"] === "node scripts/create-seis-ssh-oracle-postboot-handoff.mjs --write", "package script must declare Oracle post-boot handoff report");
ensure(scripts["check:seis-ssh-oracle-direct-cloud-pipeline"] === "node scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs --check", "package script must declare Oracle direct-cloud pipeline check");
ensure(scripts["cloud:ssh:oracle-direct-cloud:pipeline"] === "node scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs --write --refresh", "package script must declare Oracle direct-cloud pipeline report");
ensure(scripts["check:seis-ssh-cloudflare-access-plan"] === "node scripts/create-seis-ssh-cloudflare-access-plan.mjs --check", "package script must declare Cloudflare Access plan check");
ensure(scripts["cloud:ssh:cloudflare-access:plan"] === "node scripts/create-seis-ssh-cloudflare-access-plan.mjs --write", "package script must declare Cloudflare Access plan report");
ensure(scripts["check:seis-ssh-github-codespaces-fallback-plan"] === "node scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs --check", "package script must declare GitHub Codespaces fallback plan check");
ensure(scripts["cloud:ssh:github-codespaces:fallback-plan"] === "node scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs --write", "package script must declare GitHub Codespaces fallback plan report");
ensure(scripts["check:seis-ssh-provider-status-board"] === "node scripts/create-seis-ssh-provider-status-board.mjs --check", "package script must declare provider status board check");
ensure(scripts["cloud:ssh:provider-status:board"] === "node scripts/create-seis-ssh-provider-status-board.mjs --write --refresh", "package script must declare provider status board report");
ensure(scripts["cloud:ssh:direct-cloud:switch"] === "node scripts/switch-seis-ssh-direct-cloud.mjs", "package script must declare direct-cloud switch");
ensure(scripts["cloud:ssh:direct-cloud:activate"] === "node scripts/activate-seis-ssh-direct-cloud.mjs", "package script must declare direct-cloud activation");

const directCloudSwitch = read(files.directCloudSwitch);
const directCloudActivate = read(files.directCloudActivate);
const oracleCloudInitHandoff = read(files.oracleCloudInitHandoff);
const oracleInstanceLaunchPlan = read(files.oracleInstanceLaunchPlan);
const oracleOwnerInputTemplate = read(files.oracleOwnerInputTemplate);
const oracleOwnerPreflight = read(files.oracleOwnerPreflight);
const oracleOwnerLaunchCommand = read(files.oracleOwnerLaunchCommand);
const oracleOwnerHandoffBundle = read(files.oracleOwnerHandoffBundle);
const oracleOwnerActionPacket = read(files.oracleOwnerActionPacket);
const oraclePostBootHandoff = read(files.oraclePostBootHandoff);
const oracleDirectCloudPipeline = read(files.oracleDirectCloudPipeline);
const cloudflareAccessPlan = read(files.cloudflareAccessPlan);
const githubCodespacesFallbackPlan = read(files.githubCodespacesFallbackPlan);
const providerStatusBoard = read(files.providerStatusBoard);
const readinessClaimGate = read(files.readinessClaimGate);
const gitignore = read(files.gitignore);
for (const [name, source] of [
  ["direct-cloud switch", directCloudSwitch],
  ["direct-cloud activation", directCloudActivate]
]) {
  ensure(source.includes("redactEndpoint"), `${name} must redact direct-cloud endpoint output`);
  ensure(source.includes("directHostSha256Prefix"), `${name} must expose endpoint continuity by hash prefix`);
  ensure(source.includes("redactHome"), `${name} must redact local home paths`);
}
ensure(oracleCloudInitHandoff.includes("readPublicKey"), "Oracle cloud-init handoff must read public key only");
ensure(oracleCloudInitHandoff.includes("containsPrivateKey: false"), "Oracle cloud-init handoff must declare no private key output");
ensure(oracleCloudInitHandoff.includes("cloudInitYaml"), "Oracle cloud-init handoff must generate cloud-init YAML");
ensure(oracleInstanceLaunchPlan.includes("--user-data-file"), "Oracle instance launch plan must use OCI --user-data-file");
ensure(oracleInstanceLaunchPlan.includes("owner-input"), "Oracle instance launch plan must remain owner-input based");
ensure(oracleInstanceLaunchPlan.includes("No provider API is called") || oracleInstanceLaunchPlan.includes("does not run oci compute instance launch"), "Oracle instance launch plan must remain non-mutating");
ensure(oracleOwnerInputTemplate.includes("SEIS_ORACLE_COMPARTMENT_OCID=\"\""), "Oracle owner input template must generate blank compartment field");
ensure(oracleOwnerInputTemplate.includes("committed") && oracleOwnerInputTemplate.includes("ignored"), "Oracle owner input template must warn that output is ignored and not committed");
ensure(oracleOwnerInputTemplate.includes("envWillBePreserved"), "Oracle owner input template must report whether existing owner input env is preserved");
ensure(oracleOwnerInputTemplate.includes("--force"), "Oracle owner input template must require explicit force for overwrite");
ensure(oracleOwnerInputTemplate.includes("does not call Oracle APIs"), "Oracle owner input template must remain provider-local");
ensure(oracleOwnerPreflight.includes("configContentsRead: false"), "Oracle owner preflight must not read OCI config contents");
ensure(oracleOwnerPreflight.includes("providerApiCalled: false"), "Oracle owner preflight must declare no provider API calls");
ensure(oracleOwnerPreflight.includes("--owner-inputs-file"), "Oracle owner preflight must load an ignored owner inputs file");
ensure(oracleOwnerPreflight.includes("input.present && input.shapeLooksValid"), "Oracle owner preflight must require valid owner input shapes before readiness");
ensure(oracleOwnerPreflight.includes("does not run oci compute instance launch"), "Oracle owner preflight must remain non-mutating");
ensure(oracleOwnerPreflight.includes("SHA-256 prefix"), "Oracle owner preflight must report only redacted owner input continuity");
ensure(oracleOwnerLaunchCommand.includes("rawValuesPrinted: false"), "Oracle owner launch command must declare that raw values are not printed");
ensure(oracleOwnerLaunchCommand.includes("reports/seis-ssh-oracle-owner-launch-command.sh"), "Oracle owner launch command must write only ignored shell handoff path");
ensure(oracleOwnerLaunchCommand.includes("This handoff does not call Oracle APIs"), "Oracle owner launch command must remain provider-local");
ensure(oracleOwnerLaunchCommand.includes("willPreserveExisting"), "Oracle owner launch command must preserve existing shell handoff by default");
ensure(oracleOwnerHandoffBundle.includes("ownerRunOrder"), "Oracle owner handoff bundle must expose owner run order");
ensure(oracleOwnerHandoffBundle.includes("prints raw owner values") || oracleOwnerHandoffBundle.includes("does not print raw"), "Oracle owner handoff bundle must document raw value redaction");
ensure(oracleOwnerHandoffBundle.includes("does not call Oracle APIs"), "Oracle owner handoff bundle must remain provider-local");
ensure(oracleOwnerActionPacket.includes("missingRequiredOwnerInputs"), "Oracle owner action packet must list missing input names");
ensure(oracleOwnerActionPacket.includes("ownerConsoleChecklist"), "Oracle owner action packet must include owner console checklist");
ensure(oracleOwnerActionPacket.includes("Oracle Console"), "Oracle owner action packet must name Oracle Console handoff areas");
ensure(oracleOwnerActionPacket.includes("does not call Oracle APIs"), "Oracle owner action packet must remain provider-local");
ensure(oracleOwnerActionPacket.includes("Owner OCIDs") && oracleOwnerActionPacket.includes("never printed"), "Oracle owner action packet must document raw owner value redaction");
ensure(oraclePostBootHandoff.includes("does not call Oracle APIs"), "Oracle post-boot handoff must remain provider-local");
ensure(oraclePostBootHandoff.includes("does not open SSH"), "Oracle post-boot handoff must not open SSH");
ensure(oraclePostBootHandoff.includes("SHA-256 prefix"), "Oracle post-boot handoff must redact endpoint continuity");
ensure(oraclePostBootHandoff.includes("ownerRunOrder"), "Oracle post-boot handoff must expose owner run order");
ensure(oracleDirectCloudPipeline.includes("currentStage"), "Oracle direct-cloud pipeline must expose current stage");
ensure(oracleDirectCloudPipeline.includes("--owner-inputs-file"), "Oracle direct-cloud pipeline must pass owner input file to preflight when present");
ensure(oracleDirectCloudPipeline.includes("cloud:ssh:oracle-owner:launch-command"), "Oracle direct-cloud pipeline must refresh owner launch command handoff");
ensure(oracleDirectCloudPipeline.includes("does not call Oracle APIs"), "Oracle direct-cloud pipeline must remain provider-local");
ensure(oracleDirectCloudPipeline.includes("does not run strict live probes"), "Oracle direct-cloud pipeline must not run strict live probes");
ensure(oracleDirectCloudPipeline.includes("nextOwnerAction"), "Oracle direct-cloud pipeline must expose next owner action");
ensure(cloudflareAccessPlan.includes("does not call Cloudflare APIs"), "Cloudflare Access plan must remain provider-local");
ensure(cloudflareAccessPlan.includes("does not run cloudflared tunnel login"), "Cloudflare Access plan must not run Cloudflare login");
ensure(cloudflareAccessPlan.includes("local Mac must not become the default SEIS-SSH origin") || cloudflareAccessPlan.includes("local Mac origin allowed"), "Cloudflare Access plan must reject local Mac default origin");
ensure(cloudflareAccessPlan.includes("approvedCloudOriginPresent"), "Cloudflare Access plan must expose approved cloud origin gate");
ensure(githubCodespacesFallbackPlan.includes("fallbackOnly"), "GitHub Codespaces fallback plan must declare fallbackOnly");
ensure(githubCodespacesFallbackPlan.includes("does not call GitHub APIs"), "GitHub Codespaces fallback plan must not call GitHub APIs");
ensure(githubCodespacesFallbackPlan.includes("does not open SSH"), "GitHub Codespaces fallback plan must not open SSH");
ensure(githubCodespacesFallbackPlan.includes("ProxyCommand"), "GitHub Codespaces fallback plan must preserve ProxyCommand warning");
ensure(providerStatusBoard.includes("This board does not call provider APIs"), "provider status board must not call provider APIs");
ensure(providerStatusBoard.includes("This board does not open SSH"), "provider status board must not open SSH");
ensure(providerStatusBoard.includes("oracle-cloud-free-tier"), "provider status board must include Oracle lane");
ensure(providerStatusBoard.includes("github-codespaces"), "provider status board must include Codespaces lane");
ensure(providerStatusBoard.includes("cloudflare-access-tunnel"), "provider status board must include Cloudflare lane");
ensure(providerStatusBoard.includes("direct-cloud-readiness-claim"), "provider status board must include readiness claim lane");
ensure(readinessClaimGate.includes("claimAllowed"), "readiness claim gate must expose claimAllowed");
ensure(readinessClaimGate.includes("strict doctor evidence"), "readiness claim gate must require strict doctor evidence");
ensure(readinessClaimGate.includes("does not call provider APIs"), "readiness claim gate must remain non-mutating");
ensure(gitignore.includes("reports/seis-ssh-oracle-owner-input-template.env"), "gitignore must ignore Oracle owner input template env");
ensure(gitignore.includes("reports/seis-ssh-oracle-owner-input-template.json"), "gitignore must ignore Oracle owner input template JSON report");
ensure(gitignore.includes("reports/seis-ssh-oracle-owner-input-template.md"), "gitignore must ignore Oracle owner input template Markdown report");
ensure(gitignore.includes("reports/seis-ssh-oracle-owner-launch-command.sh"), "gitignore must ignore Oracle owner launch command shell handoff");
ensure(gitignore.includes("reports/seis-ssh-oracle-owner-launch-command.json"), "gitignore must ignore Oracle owner launch command JSON report");
ensure(gitignore.includes("reports/seis-ssh-oracle-owner-launch-command.md"), "gitignore must ignore Oracle owner launch command Markdown report");
ensure(gitignore.includes("reports/seis-ssh-oracle-owner-handoff-bundle.json"), "gitignore must ignore Oracle owner handoff bundle JSON report");
ensure(gitignore.includes("reports/seis-ssh-oracle-owner-handoff-bundle.md"), "gitignore must ignore Oracle owner handoff bundle Markdown report");
ensure(gitignore.includes("reports/seis-ssh-oracle-owner-action-packet.json"), "gitignore must ignore Oracle owner action packet JSON report");
ensure(gitignore.includes("reports/seis-ssh-oracle-owner-action-packet.md"), "gitignore must ignore Oracle owner action packet Markdown report");
ensure(gitignore.includes("reports/seis-ssh-cloudflare-access-plan.json"), "gitignore must ignore Cloudflare Access plan JSON report");
ensure(gitignore.includes("reports/seis-ssh-cloudflare-access-plan.md"), "gitignore must ignore Cloudflare Access plan Markdown report");
ensure(gitignore.includes("reports/seis-ssh-github-codespaces-fallback-plan.json"), "gitignore must ignore GitHub Codespaces fallback plan JSON report");
ensure(gitignore.includes("reports/seis-ssh-github-codespaces-fallback-plan.md"), "gitignore must ignore GitHub Codespaces fallback plan Markdown report");
ensure(gitignore.includes("reports/seis-ssh-provider-status-board.json"), "gitignore must ignore provider status board JSON report");
ensure(gitignore.includes("reports/seis-ssh-provider-status-board.md"), "gitignore must ignore provider status board Markdown report");

const docs = read(files.doc)
  + "\n"
  + read(files.activationPlanDoc)
  + "\n"
  + read(files.oracleRunbook)
  + "\n"
  + read("docs/deployment/seis-ssh-cloud-roadmap.md")
  + "\n"
  + read("docs/deployment/seis-ssh-public-github-access.md");

for (const token of [
  "SEIS SSH Direct-Cloud Provider Matrix",
  "oracle-cloud-free-tier",
  "github-codespaces",
  "cloudflare-access-tunnel",
  "google-cloud-compute",
  "Oracle Cloud Free Tier",
  "Cloudflare Access / Tunnel",
  "not a replacement for the cloud VM",
  "Do not expose the local Mac",
  "deploy/seis-ssh-direct-cloud-provider-matrix.json",
  "npm run check:seis-ssh-direct-cloud-provider-matrix",
  "scripts/create-seis-ssh-direct-cloud-activation-plan.mjs",
  "docs/deployment/seis-ssh-direct-cloud-activation-plan.md",
  "npm run check:seis-ssh-direct-cloud-activation-plan",
  "npm run cloud:ssh:direct-cloud:plan",
  "SEIS SSH Report Boundary",
  "scripts/check-seis-ssh-report-boundary.mjs",
  "npm run check:seis-ssh-report-boundary",
  "SEIS SSH Oracle Free Tier Direct-Cloud",
  "deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json",
  "scripts/create-seis-ssh-oracle-free-tier-plan.mjs",
  "scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs",
  "scripts/create-seis-ssh-oracle-instance-launch-plan.mjs",
  "scripts/create-seis-ssh-oracle-owner-input-template.mjs",
  "scripts/create-seis-ssh-oracle-owner-preflight.mjs",
  "scripts/create-seis-ssh-oracle-owner-launch-command.mjs",
  "scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs",
  "scripts/create-seis-ssh-oracle-owner-action-packet.mjs",
  "scripts/create-seis-ssh-oracle-postboot-handoff.mjs",
  "scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs",
  "scripts/create-seis-ssh-cloudflare-access-plan.mjs",
  "scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs",
  "scripts/create-seis-ssh-provider-status-board.mjs",
  "scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs",
  "docs/deployment/seis-ssh-oracle-free-tier-direct-cloud.md",
  "npm run check:seis-ssh-oracle-free-tier-plan",
  "npm run cloud:ssh:oracle-free-tier:plan",
  "npm run check:seis-ssh-oracle-cloud-init-handoff",
  "npm run cloud:ssh:oracle-cloud-init:handoff",
  "npm run check:seis-ssh-oracle-instance-launch-plan",
  "npm run cloud:ssh:oracle-instance:plan",
  "npm run check:seis-ssh-oracle-owner-input-template",
  "npm run cloud:ssh:oracle-owner:template",
  "npm run check:seis-ssh-oracle-owner-preflight",
  "npm run cloud:ssh:oracle-owner:preflight",
  "npm run check:seis-ssh-oracle-owner-launch-command",
  "npm run cloud:ssh:oracle-owner:launch-command",
  "npm run check:seis-ssh-oracle-owner-handoff",
  "npm run cloud:ssh:oracle-owner:handoff",
  "npm run check:seis-ssh-oracle-owner-action-packet",
  "npm run cloud:ssh:oracle-owner:action-packet",
  "npm run check:seis-ssh-oracle-postboot-handoff",
  "npm run cloud:ssh:oracle-postboot:handoff",
  "npm run check:seis-ssh-oracle-direct-cloud-pipeline",
  "npm run cloud:ssh:oracle-direct-cloud:pipeline",
  "npm run check:seis-ssh-cloudflare-access-plan",
  "npm run cloud:ssh:cloudflare-access:plan",
  "npm run check:seis-ssh-github-codespaces-fallback-plan",
  "npm run cloud:ssh:github-codespaces:fallback-plan",
  "npm run check:seis-ssh-provider-status-board",
  "npm run cloud:ssh:provider-status:board",
  "npm run check:seis-ssh-direct-cloud-readiness-claim",
  "npm run cloud:ssh:direct-cloud:claim",
  "cloud-init handoff",
  "instance launch plan",
  "owner input template",
  "preserved by default",
  "owner preflight",
  "owner launch command",
  "owner handoff bundle",
  "owner action packet",
  "post-boot handoff",
  "direct-cloud pipeline",
  "Cloudflare Access plan",
  "GitHub Codespaces fallback plan",
  "SEIS SSH Provider Status Board",
  "readiness claim",
  "direct-cloud activation output is redacted"
]) {
  ensure(docs.includes(token), `docs must include ${token}`);
}

for (const file of Object.values(files)) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /(password|token|secret)\s*[:=]\s*["'][^"']{8,}/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS SSH direct-cloud provider matrix check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH direct-cloud provider matrix check passed.");

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    failures.push(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) failures.push(`${file} must not include ${reason}`);
}
