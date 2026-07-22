#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
  PREVIOUS_SEIS_PUBLIC_RELEASE_VERSION,
  SEIS_PUBLIC_RELEASE_CHANGE_KIND,
  assertStructuralReleaseVersion,
} from "./lib/seis-public-release-version.mjs";

const root = process.cwd();
const failures = [];
const policy = readJson("content/development/seis-public-plugin-release-policy.json");
const family = readJson("content/development/seis-public-plugin-family.json");
const manifest = readJson("plugins/seis-ai-agent/.codex-plugin/plugin.json");

try {
  assertStructuralReleaseVersion({
    previous: PREVIOUS_SEIS_PUBLIC_RELEASE_VERSION,
    current: CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
    changeKind: SEIS_PUBLIC_RELEASE_CHANGE_KIND,
  });
} catch (error) {
  failures.push(error.message);
}
ensure(policy?.predecessor?.version === PREVIOUS_SEIS_PUBLIC_RELEASE_VERSION, "release policy predecessor version is invalid");
ensure(policy?.currentRelease?.version === CURRENT_SEIS_PUBLIC_RELEASE_VERSION, "release policy current version is invalid");
ensure(policy?.currentRelease?.changeKind === SEIS_PUBLIC_RELEASE_CHANGE_KIND, "release policy change kind is invalid");
ensure(policy?.policy?.structuralDistributionChangeRequiresVersionIncrease === true, "structural version-bump policy is missing");
ensure(policy?.policy?.directMarketplaceCardCountChangeRequiresVersionIncrease === true, "marketplace card version-bump policy is missing");
ensure(policy?.policy?.internalPackageTopologyChangeRequiresVersionIncrease === true, "internal topology version-bump policy is missing");
ensure(policy?.policy?.majorAutopilotEvidenceContractChangeRequiresVersionIncrease === true, "major Auto Mode evidence version-bump policy is missing");
ensure(policy?.policy?.publicReleaseRequiresHumanApproval === true, "public release approval gate is missing");
ensure(policy?.validation?.semverIncreased === true, "release policy must record a semver increase");
ensure(manifest?.version === CURRENT_SEIS_PUBLIC_RELEASE_VERSION, "SEIS-Agent manifest version does not match release policy");
ensure(family?.marketplace?.publicPluginCount === 10 && family?.marketplace?.internalPackageCount === 30, "release policy must apply to the ten/30 distribution");

if (failures.length) {
  console.error("SEIS public plugin release policy check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("SEIS public plugin release policy check passed.");

function ensure(condition, message) { if (!condition) failures.push(message); }
function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch {
    failures.push(`invalid or missing JSON: ${relativePath}`);
    return null;
  }
}
