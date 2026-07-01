#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];

const files = {
  contract: "deploy/seis-ssh-public-access-contract.json",
  accessModel: "deploy/seis-ssh-access-model.json",
  roadmap: "deploy/seis-ssh-cloud-roadmap.json",
  packageJson: "package.json",
  runbook: "docs/deployment/seis-ssh-public-github-access.md",
  accessDoc: "docs/deployment/seis-ssh-access-model.md",
  roadmapDoc: "docs/deployment/seis-ssh-cloud-roadmap.md",
  readme: "README.md",
  index: "docs/INDEX.md",
  status: "docs/STATUS.md",
  backlog: "docs/roadmap/MASTER_BACKLOG.md",
  queue: "docs/roadmap/NEXT_PR_QUEUE.md",
  issueTemplate: ".github/ISSUE_TEMPLATE/seis_ssh_access.yml",
  prTemplate: ".github/PULL_REQUEST_TEMPLATE.md",
  ciWorkflow: ".github/workflows/seis-ssh-public-access.yml",
  desktop: "apps/web/desktop.js",
  reportScript: "scripts/create-seis-ssh-public-access-report.mjs",
  firstRunScript: "scripts/create-seis-ssh-public-first-run.mjs",
  troubleshootingScript: "scripts/create-seis-ssh-public-troubleshooting-guide.mjs",
  supportPacketScript: "scripts/create-seis-ssh-public-support-packet.mjs",
  quickstartScript: "scripts/create-seis-ssh-public-github-quickstart.mjs",
  prTemplateScript: "scripts/check-seis-ssh-public-pr-template.mjs",
  ciWorkflowScript: "scripts/check-seis-ssh-public-ci-workflow.mjs",
  readinessMatrixScript: "scripts/check-seis-ssh-public-readiness-matrix.mjs",
  artifactHygieneScript: "scripts/check-seis-ssh-public-artifact-hygiene.mjs",
  onboardingScript: "scripts/create-seis-ssh-public-onboarding-pack.mjs",
  contributorDoctorScript: "scripts/check-seis-ssh-public-contributor-doctor.mjs",
  liveEvidence: "content/development/seis-ssh-live-readiness-evidence.json",
  liveEvidenceDoc: "docs/deployment/seis-ssh-live-readiness-evidence.md",
  liveEvidenceScript: "scripts/check-seis-ssh-live-readiness-evidence.mjs"
};

for (const file of Object.values(files)) read(file);

const contract = readJson(files.contract);
const accessModel = readJson(files.accessModel);
const roadmap = readJson(files.roadmap);
const packageJson = readJson(files.packageJson);
const scripts = packageJson?.scripts || {};

ensure(contract?.id === "seis-ssh-public-access-contract", "public access contract id must be stable");
ensure(contract?.status === "active", "public access contract must be active");
ensure(contract?.targetAlias === "SEIS-SSH", "public access contract must target SEIS-SSH");
ensure(contract?.sourceModel === files.accessModel, "public access contract must link access model");
ensure(contract?.sourceRoadmap === files.roadmap, "public access contract must link roadmap");
ensure(contract?.qualityGate === "npm run check:seis-ssh-public-access", "public access contract must expose quality gate");

const serverPolicy = contract?.serverAndPortPolicy || {};
ensure(serverPolicy.mode === "preserve-existing-server-and-port", "server and port policy must preserve existing target");
ensure(serverPolicy.currentAlias === "SEIS-SSH", "server and port policy must bind to SEIS-SSH");
ensure(serverPolicy.englishInvariant === "Keep the same server and port.", "contract must include English same server and port invariant");
ensure(serverPolicy.turkishInvariant === "Ayni sunucu ve baglanti noktasi korunur.", "contract must include Turkish same server and port invariant");
ensure((serverPolicy.forbiddenActions || []).includes("change-port-without-owner-approval"), "contract must forbid port changes without owner approval");
ensure((serverPolicy.forbiddenActions || []).includes("change-host-to-localhost"), "contract must forbid localhost migration");
ensure((serverPolicy.forbiddenActions || []).includes("create-new-visible-alias-for-same-target"), "contract must forbid duplicate visible aliases");
const githubReader = (contract?.profiles || []).find((profile) => profile.id === "github-reader") || {};
const individualUser = (contract?.profiles || []).find((profile) => profile.id === "individual-user") || {};
ensure(contract?.githubExperience?.supportIssueTemplate === files.issueTemplate, "public access contract must link SEIS-SSH support issue template");
ensure(contract?.githubExperience?.pullRequestTemplate === files.prTemplate, "public access contract must link SEIS-SSH pull request template");
ensure(contract?.githubExperience?.ciWorkflow === files.ciWorkflow, "public access contract must link SEIS-SSH CI workflow");
ensure((contract?.evidenceSurfaces || []).includes(files.issueTemplate), "public access contract must include support issue template evidence surface");
ensure((contract?.evidenceSurfaces || []).includes(files.prTemplate), "public access contract must include pull request template evidence surface");
ensure((contract?.evidenceSurfaces || []).includes(files.prTemplateScript), "public access contract must include pull request template checker evidence surface");
ensure((contract?.evidenceSurfaces || []).includes(files.ciWorkflow), "public access contract must include CI workflow evidence surface");
ensure((contract?.evidenceSurfaces || []).includes(files.ciWorkflowScript), "public access contract must include CI workflow checker evidence surface");
ensure((contract?.evidenceSurfaces || []).includes(files.readinessMatrixScript), "public access contract must include public readiness matrix evidence surface");
ensure((githubReader.allowedActions || []).includes("run the read-only contributor doctor"), "github-reader profile must allow contributor doctor");
ensure((githubReader.allowedActions || []).includes("open the secret-safe GitHub issue form"), "github-reader profile must allow secret-safe issue form");
ensure((githubReader.allowedActions || []).includes("complete the SEIS-SSH pull request checklist"), "github-reader profile must allow SEIS-SSH pull request checklist");
ensure((githubReader.allowedActions || []).includes("run the read-only pull request template check"), "github-reader profile must allow pull request template check");
ensure((githubReader.allowedActions || []).includes("run the read-only public access CI workflow check"), "github-reader profile must allow public access CI workflow check");
ensure((githubReader.allowedActions || []).includes("run the read-only public readiness matrix"), "github-reader profile must allow public readiness matrix");
ensure((individualUser.requiredEvidence || []).includes("npm run check:seis-ssh-public-contributor-doctor"), "individual-user profile must require contributor doctor evidence");

ensure(accessModel?.publicAccessContract === files.contract, "access model must link public access contract");
ensure(roadmap?.publicAccessContract === files.contract, "roadmap must link public access contract");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-access"), "access model quality commands must include public access check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-first-run"), "access model quality commands must include public first-run check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-troubleshooting"), "access model quality commands must include public troubleshooting check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-support-packet"), "access model quality commands must include public support packet check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-github-quickstart"), "access model quality commands must include public GitHub quickstart check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-pr-template"), "access model quality commands must include public PR template check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-ci-workflow"), "access model quality commands must include public CI workflow check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-readiness-matrix"), "access model quality commands must include public readiness matrix check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-artifact-hygiene"), "access model quality commands must include public artifact hygiene check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-access"), "roadmap validation commands must include public access check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-first-run"), "roadmap validation commands must include public first-run check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-troubleshooting"), "roadmap validation commands must include public troubleshooting check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-support-packet"), "roadmap validation commands must include public support packet check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-github-quickstart"), "roadmap validation commands must include public GitHub quickstart check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-pr-template"), "roadmap validation commands must include public PR template check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-ci-workflow"), "roadmap validation commands must include public CI workflow check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-readiness-matrix"), "roadmap validation commands must include public readiness matrix check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-public-artifact-hygiene"), "roadmap validation commands must include public artifact hygiene check");

ensure(scripts["check:seis-ssh-public-access"] === "node scripts/check-seis-ssh-public-access.mjs", "package script check:seis-ssh-public-access must be declared");
ensure(scripts["check:seis-ssh-public-access-report"] === "node scripts/create-seis-ssh-public-access-report.mjs --check", "package script check:seis-ssh-public-access-report must be declared");
ensure(scripts["report:seis-ssh-public-access"] === "node scripts/create-seis-ssh-public-access-report.mjs --write", "package script report:seis-ssh-public-access must be declared");
ensure(scripts["check:seis-ssh-public-first-run"] === "node scripts/create-seis-ssh-public-first-run.mjs --check", "package script check:seis-ssh-public-first-run must be declared");
ensure(scripts["report:seis-ssh-public-first-run"] === "node scripts/create-seis-ssh-public-first-run.mjs --write", "package script report:seis-ssh-public-first-run must be declared");
ensure(scripts["run:seis-ssh-public-first-run"] === "npm run check:seis-ssh-public-first-run && npm run report:seis-ssh-public-first-run", "package script run:seis-ssh-public-first-run must be declared");
ensure(scripts["check:seis-ssh-public-troubleshooting"] === "node scripts/create-seis-ssh-public-troubleshooting-guide.mjs --check", "package script check:seis-ssh-public-troubleshooting must be declared");
ensure(scripts["report:seis-ssh-public-troubleshooting"] === "node scripts/create-seis-ssh-public-troubleshooting-guide.mjs --write", "package script report:seis-ssh-public-troubleshooting must be declared");
ensure(scripts["run:seis-ssh-public-troubleshooting"] === "npm run check:seis-ssh-public-troubleshooting && npm run report:seis-ssh-public-troubleshooting", "package script run:seis-ssh-public-troubleshooting must be declared");
ensure(scripts["check:seis-ssh-public-support-packet"] === "node scripts/create-seis-ssh-public-support-packet.mjs --check", "package script check:seis-ssh-public-support-packet must be declared");
ensure(scripts["report:seis-ssh-public-support-packet"] === "node scripts/create-seis-ssh-public-support-packet.mjs --write", "package script report:seis-ssh-public-support-packet must be declared");
ensure(scripts["run:seis-ssh-public-support-packet"] === "npm run check:seis-ssh-public-support-packet && npm run report:seis-ssh-public-support-packet", "package script run:seis-ssh-public-support-packet must be declared");
ensure(scripts["check:seis-ssh-public-github-quickstart"] === "node scripts/create-seis-ssh-public-github-quickstart.mjs --check", "package script check:seis-ssh-public-github-quickstart must be declared");
ensure(scripts["report:seis-ssh-public-github-quickstart"] === "node scripts/create-seis-ssh-public-github-quickstart.mjs --write", "package script report:seis-ssh-public-github-quickstart must be declared");
ensure(scripts["run:seis-ssh-public-github-quickstart"] === "npm run check:seis-ssh-public-github-quickstart && npm run report:seis-ssh-public-github-quickstart", "package script run:seis-ssh-public-github-quickstart must be declared");
ensure(scripts["check:seis-ssh-public-pr-template"] === "node scripts/check-seis-ssh-public-pr-template.mjs", "package script check:seis-ssh-public-pr-template must be declared");
ensure(scripts["check:seis-ssh-public-ci-workflow"] === "node scripts/check-seis-ssh-public-ci-workflow.mjs", "package script check:seis-ssh-public-ci-workflow must be declared");
ensure(scripts["check:seis-ssh-public-readiness-matrix"] === "node scripts/check-seis-ssh-public-readiness-matrix.mjs", "package script check:seis-ssh-public-readiness-matrix must be declared");
ensure(scripts["check:seis-ssh-public-artifact-hygiene"] === "node scripts/check-seis-ssh-public-artifact-hygiene.mjs", "package script check:seis-ssh-public-artifact-hygiene must be declared");
ensure(scripts["check:seis-ssh-public-onboarding"] === "node scripts/create-seis-ssh-public-onboarding-pack.mjs --check", "package script check:seis-ssh-public-onboarding must be declared");
ensure(scripts["report:seis-ssh-public-onboarding"] === "node scripts/create-seis-ssh-public-onboarding-pack.mjs --write", "package script report:seis-ssh-public-onboarding must be declared");
ensure(scripts["check:seis-ssh-public-contributor-doctor"] === "node scripts/check-seis-ssh-public-contributor-doctor.mjs --check", "package script check:seis-ssh-public-contributor-doctor must be declared");
ensure(scripts["report:seis-ssh-public-contributor-doctor"] === "node scripts/check-seis-ssh-public-contributor-doctor.mjs --write", "package script report:seis-ssh-public-contributor-doctor must be declared");
ensure(scripts["check:seis-ssh-live-readiness-evidence"] === "node scripts/check-seis-ssh-live-readiness-evidence.mjs", "package script check:seis-ssh-live-readiness-evidence must be declared");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-access"), "quality:governance must include public access check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-first-run"), "quality:governance must include public first-run check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-troubleshooting"), "quality:governance must include public troubleshooting check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-support-packet"), "quality:governance must include public support packet check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-github-quickstart"), "quality:governance must include public GitHub quickstart check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-pr-template"), "quality:governance must include public PR template check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-ci-workflow"), "quality:governance must include public CI workflow check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-readiness-matrix"), "quality:governance must include public readiness matrix check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-artifact-hygiene"), "quality:governance must include public artifact hygiene check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-public-contributor-doctor"), "quality:governance must include public contributor doctor check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-live-readiness-evidence"), "quality:governance must include live readiness evidence check");

for (const command of [
  "npm run check:seis-ssh-public-access",
  "npm run check:seis-ssh-public-access-report",
  "npm run report:seis-ssh-public-access",
  "npm run check:seis-ssh-public-first-run",
  "npm run report:seis-ssh-public-first-run",
  "npm run check:seis-ssh-public-troubleshooting",
  "npm run report:seis-ssh-public-troubleshooting",
  "npm run check:seis-ssh-public-support-packet",
  "npm run report:seis-ssh-public-support-packet",
  "npm run check:seis-ssh-public-github-quickstart",
  "npm run report:seis-ssh-public-github-quickstart",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-readiness-matrix",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "npm run check:seis-ssh-public-onboarding",
  "npm run report:seis-ssh-public-onboarding",
  "npm run check:seis-ssh-public-contributor-doctor",
  "npm run report:seis-ssh-public-contributor-doctor",
  "npm run check:seis-ssh-live-readiness-evidence",
  "npm run check:seis-ssh-access-model",
  "npm run check:seis-ssh-picker-compatibility",
  "npm run check:seis-ssh-cloud-roadmap",
  "npm run check:seis-ssh-closed-runtime",
  "npm run check:seis-ssh-mobile-direct-cloud",
  "npm run check:seis-ssh-enterprise-benchmark"
]) {
  ensure((contract?.requiredCommands || []).includes(command), `public access contract must require ${command}`);
}

const approvalGates = new Set(contract?.approvalGates || []);
for (const gate of [
  "change-server-or-port",
  "install-managed-ssh-config",
  "bootstrap-remote-vm",
  "execute-live-ssh",
  "change-firewall-or-sshd",
  "push-merge-or-release"
]) {
  ensure(approvalGates.has(gate), `public access contract must include approval gate ${gate}`);
}

const docs = [
  files.runbook,
  files.accessDoc,
  files.roadmapDoc,
  files.readme,
  files.index,
  files.status,
  files.backlog,
  files.queue,
  files.issueTemplate,
  files.prTemplate,
  files.ciWorkflow
].map(read).join("\n");

for (const token of [
  "SEIS SSH Public GitHub Access",
  "SEIS-SSH",
  "Keep the same server and port.",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "npm run check:seis-ssh-public-access",
  "npm run report:seis-ssh-public-access",
  "npm run check:seis-ssh-public-first-run",
  "npm run report:seis-ssh-public-first-run",
  "npm run check:seis-ssh-public-troubleshooting",
  "npm run report:seis-ssh-public-troubleshooting",
  "npm run check:seis-ssh-public-support-packet",
  "npm run report:seis-ssh-public-support-packet",
  "npm run run:seis-ssh-public-github-quickstart",
  "npm run check:seis-ssh-public-github-quickstart",
  "npm run report:seis-ssh-public-github-quickstart",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-readiness-matrix",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "npm run report:seis-ssh-public-onboarding",
  "npm run report:seis-ssh-public-contributor-doctor",
  "npm run check:seis-ssh-live-readiness-evidence",
  "deploy/seis-ssh-public-access-contract.json",
  "docs/deployment/seis-ssh-public-github-access.md",
  "content/development/seis-ssh-live-readiness-evidence.json",
  "docs/deployment/seis-ssh-live-readiness-evidence.md",
  ".github/ISSUE_TEMPLATE/seis_ssh_access.yml",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/workflows/seis-ssh-public-access.yml",
  "SEIS SSH access support"
]) {
  ensure(docs.includes(token), `docs must include ${token}`);
}

const issueTemplate = read(files.issueTemplate);
for (const token of [
  "name: SEIS SSH access support",
  "title: \"[SEIS-SSH] \"",
  "Keep the same server and port.",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "Do not paste private keys, tokens, passwords, cookies, `.env` values, full hostnames, full IP addresses, or provider credentials.",
  "npm run run:seis-ssh-public-github-quickstart",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "npm run run:seis-ssh-public-first-run",
  "npm run run:seis-ssh-public-troubleshooting",
  "npm run report:seis-ssh-public-contributor-doctor",
  "No live SSH session was attempted",
  "GitHub Codespaces billing blocker",
  "Codespaces picker warning"
]) {
  ensure(issueTemplate.includes(token), `SEIS-SSH issue template must include ${token}`);
}

const prTemplate = read(files.prTemplate);
for (const token of [
  "## SEIS-SSH Public Access Review",
  "Keep the same server and port.",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "I did not change `HostName` or `Port` for `SEIS-SSH` without linked maintainer approval.",
  "I did not paste private keys, tokens, passwords, cookies, `.env` values, full hostnames, full IP addresses, or provider credentials.",
  "No live SSH session was attempted for this PR unless explicit maintainer approval is linked.",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-access",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-readiness-matrix",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "npm run check:seis-ssh-live-readiness-evidence",
  ".github/ISSUE_TEMPLATE/seis_ssh_access.yml"
]) {
  ensure(prTemplate.includes(token), `SEIS-SSH pull request template must include ${token}`);
}

const ciWorkflow = read(files.ciWorkflow);
for (const token of [
  "name: SEIS SSH Public Access",
  "SEIS SSH public access gates",
  "contents: read",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-access",
  "npm run check:seis-ssh-public-github-quickstart",
  "npm run check:seis-ssh-public-support-packet",
  "npm run check:seis-ssh-public-readiness-matrix",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "npm run check:seis-ssh-live-readiness-evidence",
  "git diff --check"
]) {
  ensure(ciWorkflow.includes(token), `SEIS-SSH CI workflow must include ${token}`);
}
for (const forbidden of [
  "ssh SEIS-SSH",
  "cloud:ssh:online:strict",
  "SEIS_SSH_HOST",
  "SEIS_SSH_PORT",
  "IdentityFile",
  "ProxyCommand"
]) {
  ensure(!ciWorkflow.includes(forbidden), `SEIS-SSH CI workflow must not include ${forbidden}`);
}

const desktop = read(files.desktop);
for (const token of [
  "SEIS_SSH_PUBLIC_ACCESS_CONTRACT",
  "Public GitHub SSH",
  "Keep same server and port",
  "seis-ssh-public-access.md",
  "seis-ssh-public-first-run.md",
  "seis-ssh-public-troubleshooting.md",
  "seis-ssh-public-support-packet.md",
  "seis-ssh-public-github-quickstart.md",
  "GitHub Quickstart",
  "PR Template",
  "CI Workflow",
  "Artifact Hygiene",
  "seis-ssh-public-onboarding.md",
  "seis-ssh-public-contributor-doctor.md",
  "check:seis-ssh-live-readiness-evidence",
  "GitHub Codespaces billing",
  "npm run check:seis-ssh-public-access"
]) {
  ensure(desktop.includes(token), `desktop demo must include ${token}`);
}

const reportScript = read(files.reportScript);
for (const token of [
  "read-only-no-live-ssh",
  "hostnameSha256Prefix",
  "liveConnectionAttempted: false",
  "Keep the same server and port.",
  "reports/seis-ssh-public-access/latest.md"
]) {
  ensure(reportScript.includes(token), `report script must include ${token}`);
}

const onboardingScript = read(files.onboardingScript);
for (const token of [
  "read-only-no-live-ssh-no-config-write",
  "npm run check:seis-ssh-public-first-run",
  "npm run check:seis-ssh-public-troubleshooting",
  "npm run check:seis-ssh-public-support-packet",
  "npm run check:seis-ssh-public-github-quickstart",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-readiness-matrix",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "npm run check:seis-ssh-public-onboarding",
  "reports/seis-ssh-public-access/onboarding-pack-latest.md",
  "This pack does not write ~/.ssh/config."
]) {
  ensure(onboardingScript.includes(token), `onboarding pack script must include ${token}`);
}

const firstRunScript = read(files.firstRunScript);
for (const token of [
  "read-only-no-live-ssh-no-config-write-no-network-auth-check",
  "npm run run:seis-ssh-public-first-run",
  "reports/seis-ssh-public-access/first-run-latest.md",
  "This first-run guide does not write ~/.ssh/config.",
  "Ayni sunucu ve baglanti noktasi korunur."
]) {
  ensure(firstRunScript.includes(token), `first-run script must include ${token}`);
}

const troubleshootingScript = read(files.troubleshootingScript);
for (const token of [
  "read-only-no-live-ssh-no-config-write-no-network-auth-check",
  "npm run run:seis-ssh-public-troubleshooting",
  "reports/seis-ssh-public-access/troubleshooting-latest.md",
  "This troubleshooting guide does not write ~/.ssh/config.",
  "Ayni sunucu ve baglanti noktasi korunur."
]) {
  ensure(troubleshootingScript.includes(token), `troubleshooting script must include ${token}`);
}

const supportPacketScript = read(files.supportPacketScript);
for (const token of [
  "read-only-no-live-ssh-no-config-write-no-network-auth-check",
  "npm run report:seis-ssh-public-support-packet",
  "npm run run:seis-ssh-public-github-quickstart",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-readiness-matrix",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "reports/seis-ssh-public-access/support-packet-latest.md",
  "This support packet does not write ~/.ssh/config.",
  "This support packet does not call gh auth status or contact GitHub.",
  "Ayni sunucu ve baglanti noktasi korunur."
]) {
  ensure(supportPacketScript.includes(token), `support packet script must include ${token}`);
}

const quickstartScript = read(files.quickstartScript);
for (const token of [
  "read-only-no-live-ssh-no-config-write-no-network-auth-check",
  "npm run run:seis-ssh-public-github-quickstart",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "reports/seis-ssh-public-access/github-quickstart-latest.md",
  "This quickstart does not write ~/.ssh/config.",
  "This quickstart does not call gh auth status or contact GitHub.",
  "Ayni sunucu ve baglanti noktasi korunur."
]) {
  ensure(quickstartScript.includes(token), `GitHub quickstart script must include ${token}`);
}

const prTemplateScript = read(files.prTemplateScript);
for (const token of [
  "## SEIS-SSH Public Access Review",
  "npm run check:seis-ssh-public-pr-template",
  "Keep the same server and port.",
  "Ayni sunucu ve baglanti noktasi korunur.",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/ISSUE_TEMPLATE/seis_ssh_access.yml",
  "No live SSH session was attempted for this PR unless explicit maintainer approval is linked."
]) {
  ensure(prTemplateScript.includes(token), `pull request template checker must include ${token}`);
}

const ciWorkflowScript = read(files.ciWorkflowScript);
for (const token of [
  "name: SEIS SSH Public Access",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-access",
  "npm run check:seis-ssh-public-readiness-matrix",
  "npm run check:seis-ssh-public-artifact-hygiene",
  ".github/workflows/seis-ssh-public-access.yml",
  "cloud:ssh:online:strict",
  "ssh SEIS-SSH"
]) {
  ensure(ciWorkflowScript.includes(token), `CI workflow checker must include ${token}`);
}

const readinessMatrixScript = read(files.readinessMatrixScript);
for (const token of [
  "read-only-clean-runner-no-live-ssh-no-config-write-no-network-auth-check",
  "temporary-empty-home",
  "Setup is needed locally before live SSH can be considered.",
  "This matrix does not write ~/.ssh/config.",
  "This matrix does not call gh auth status or contact GitHub.",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "scripts/create-seis-ssh-public-access-report.mjs",
  "scripts/check-seis-ssh-public-contributor-doctor.mjs",
  "scripts/create-seis-ssh-public-support-packet.mjs",
  "scripts/create-seis-ssh-public-github-quickstart.mjs"
]) {
  ensure(readinessMatrixScript.includes(token), `public readiness matrix script must include ${token}`);
}

const artifactHygieneScript = read(files.artifactHygieneScript);
for (const token of [
  "read-only-temp-artifact-scan-no-live-ssh-no-config-write-no-network-auth-check",
  "reports/seis-ssh-public-access/github-quickstart-latest",
  "This hygiene check does not write ~/.ssh/config.",
  "This hygiene check does not call gh auth status or contact GitHub.",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "full IPv4 addresses",
  "raw ProxyCommand details"
]) {
  ensure(artifactHygieneScript.includes(token), `artifact hygiene script must include ${token}`);
}

const contributorDoctorScript = read(files.contributorDoctorScript);
for (const token of [
  "read-only-no-live-ssh-no-config-write",
  "npm run check:seis-ssh-public-first-run",
  "npm run check:seis-ssh-public-troubleshooting",
  "npm run check:seis-ssh-public-support-packet",
  "npm run check:seis-ssh-public-github-quickstart",
  "npm run check:seis-ssh-public-pr-template",
  "npm run check:seis-ssh-public-ci-workflow",
  "npm run check:seis-ssh-public-readiness-matrix",
  "npm run check:seis-ssh-public-artifact-hygiene",
  "This doctor does not write ~/.ssh/config.",
  "npm run check:seis-ssh-public-contributor-doctor",
  "reports/seis-ssh-public-access/contributor-doctor-latest.md",
  "Ayni sunucu ve baglanti noktasi korunur."
]) {
  ensure(contributorDoctorScript.includes(token), `contributor doctor script must include ${token}`);
}

const liveEvidence = readJson(files.liveEvidence);
ensure(liveEvidence?.status === "blocked-provider-billing", "live readiness evidence must record blocked provider billing status");
ensure(liveEvidence?.liveProbe?.strictReady === false, "live readiness evidence must not claim strict readiness");
ensure(liveEvidence?.liveProbe?.port === "22", "live readiness evidence must preserve port 22");
ensure((liveEvidence?.claimsForbidden || []).includes("Do not claim SEIS-SSH is live-ready."), "live readiness evidence must forbid live-ready claim");

for (const file of [
  files.contract,
  files.runbook,
  files.liveEvidence,
  files.liveEvidenceDoc,
  files.liveEvidenceScript,
  files.reportScript,
  files.firstRunScript,
  files.troubleshootingScript,
  files.supportPacketScript,
  files.quickstartScript,
  files.prTemplateScript,
  files.ciWorkflowScript,
  files.readinessMatrixScript,
  files.artifactHygieneScript,
  files.onboardingScript,
  files.contributorDoctorScript,
  files.readme,
  files.index,
  files.status,
  files.backlog,
  files.queue,
  files.issueTemplate,
  files.prTemplate,
  files.ciWorkflow,
  files.desktop
]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /(password|token|secret)\s*[:=]\s*["'][^"']{8,}/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS SSH public access check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH public access check passed.");

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
