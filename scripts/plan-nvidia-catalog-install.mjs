#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const catalogPath = "content/development/seis-nvidia-accelerator-catalog.json";
const catalog = JSON.parse(fs.readFileSync(path.join(root, catalogPath), "utf8"));
const installedIntegrationsPath = catalog.installedIntegrationsRegistry;
const installedIntegrations = installedIntegrationsPath
  ? JSON.parse(fs.readFileSync(path.join(root, installedIntegrationsPath), "utf8"))
  : null;

if (args.has("--apply") || args.has("--clone") || args.has("--download-models")) {
  console.error("NVIDIA catalog apply mode is blocked.");
  console.error("Use the dry-run plan first, then request a specific allowlisted repo/model with license, disk, credential, and rollback approval.");
  process.exit(2);
}

if (args.has("--json")) {
  console.log(JSON.stringify(buildPlan(), null, 2));
} else {
  console.log(renderMarkdown(buildPlan()));
}

function buildPlan() {
  return {
    id: `${catalog.id}-dry-run-plan`,
    generatedAt: new Date().toISOString(),
    mode: catalog.installPolicy.defaultCommandMode,
    sourceCatalog: catalogPath,
    installedIntegrationsRegistry: installedIntegrationsPath,
    githubPublicRepoCount: catalog.verifiedSnapshot.githubPublicRepoCount,
    installedIntegrationCount: installedIntegrations?.installedIntegrations?.length || 0,
    installPolicy: catalog.installPolicy,
    installedIntegrations: (installedIntegrations?.installedIntegrations || []).map((item) => ({
      id: item.id,
      name: item.displayName,
      category: item.category,
      status: item.status,
      safeSeisUse: item.safeSeisUse
    })),
    queue: catalog.installQueue.map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      nextCommand: item.nextCommand,
      approvalNeeded: item.approvalNeeded
    })),
    blockedUntilApproved: catalog.blockedUntilApproved,
    safetyDecision: "dry-run-only-no-clone-no-model-download-no-nim-call"
  };
}

function renderMarkdown(plan) {
  return `# NVIDIA Catalog Dry-Run Install Plan

Generated: ${plan.generatedAt}
Mode: ${plan.mode}
Source: ${plan.sourceCatalog}
Installed integrations registry: ${plan.installedIntegrationsRegistry}
GitHub public repos observed: ${plan.githubPublicRepoCount}
Installed local NVIDIA integrations: ${plan.installedIntegrationCount}

## Queue
${plan.queue.map((item) => `- ${item.title}: ${item.status} / next: ${item.nextCommand} / approval: ${item.approvalNeeded}`).join("\n")}

## Installed SEIS Integrations
${plan.installedIntegrations.map((item) => `- ${item.name}: ${item.category} / ${item.status} / ${item.safeSeisUse}`).join("\n")}

## Blocked Until Approved
${plan.blockedUntilApproved.map((item) => `- ${item}`).join("\n")}

## Decision
${plan.safetyDecision}
`;
}
