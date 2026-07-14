#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

import { pluginCapabilityCatalog } from "../packages/seis-ai/src/lib/plugin-integration.mjs";

const root = process.cwd();
const snapshotPath = path.join(root, "apps", "seis-core", "data", "seis-ai-core-runtime-snapshot.json");
const catalog = pluginCapabilityCatalog(root);
const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
const failures = [];

if (catalog.status !== "source-backed-read-only") failures.push("catalog must remain source-backed-read-only");
if (catalog.pluginCount !== 6) failures.push("catalog must expose six bundled plugin manifests");
if (catalog.personalPluginCount !== 5) failures.push("catalog must expose five personal plugin manifests");
if (catalog.manifestCapabilityCount !== 67) failures.push("catalog must expose 67 manifest capabilities");
if (catalog.personalManifestCapabilityCount !== 51) failures.push("catalog must expose 51 personal manifest capabilities");
if (catalog.profileQualityCommandCount !== 18) failures.push("catalog must expose 18 specialist profile command declarations");
if (catalog.qualityCommandGaps.length !== 0) failures.push("catalog must connect every specialist profile quality command to Core");
if (JSON.stringify(snapshot.pluginMesh?.capabilityCatalog) !== JSON.stringify(catalog)) {
  failures.push("AI Core runtime snapshot capability catalog is stale");
}
if (catalog.boundary.credentialsRead || catalog.boundary.networkCalled || catalog.boundary.externalMutationPerformed) {
  failures.push("capability catalog must remain local read-only");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `SEIS plugin capability catalog check passed: ${catalog.pluginCount} plugins, ${catalog.manifestCapabilityCount} manifest capabilities, ${catalog.profileQualityCommandCount} specialist profile command declarations, ${catalog.qualityCommandGaps.length} explicit Core gaps.`,
);
